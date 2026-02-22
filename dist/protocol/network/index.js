/**
 * MPRC Protocol - Network Utilities
 *
 * Shared networking functionality for DNS resolution and TCP communication.
 * Used by both client and server components to eliminate code duplication.
 *
 * Supports both plain TCP and TLS-encrypted connections for secure communication.
 */
import net from "node:net";
import tls from "node:tls";
import dns from "node:dns";
import { promisify } from "node:util";
import { MPRC_PORT, DEFAULT_TIMEOUT_MS, CONNECTION_TIMEOUT_MS, } from "../../constants.js";
import { NetworkError, DnsResolutionError, ConnectionError, TimeoutError, } from "../errors.js";
const resolve4Async = promisify(dns.resolve4);
/**
 * Extracts the domain part from an email address.
 *
 * @param email - The email address to parse
 * @returns The domain portion of the email address
 * @throws {NetworkError} If the email format is invalid
 *
 * @example
 * ```typescript
 * const domain = extractDomainFromEmail("user@example.com");
 * console.log(domain); // "example.com"
 * ```
 */
export function extractDomainFromEmail(email) {
    const parts = email.split("@");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new NetworkError("INVALID_EMAIL_FORMAT", `Invalid email address format: ${email}`);
    }
    return parts[1];
}
/**
 * Resolves a domain name to its IPv4 addresses using DNS.
 *
 * @param domain - The domain name to resolve
 * @returns Promise resolving to DnsResolutionResult with addresses
 * @throws {DnsResolutionError} If DNS resolution fails
 *
 * @example
 * ```typescript
 * const result = await resolveDomain("example.com");
 * console.log(result.primaryAddress); // "93.184.216.34"
 * ```
 */
export async function resolveDomain(domain) {
    try {
        const addresses = await resolve4Async(domain);
        if (addresses.length === 0) {
            throw new DnsResolutionError(`No IPv4 addresses found for domain: ${domain}`, domain);
        }
        return {
            domain,
            addresses,
            primaryAddress: addresses[0],
        };
    }
    catch (error) {
        if (error instanceof DnsResolutionError) {
            throw error;
        }
        throw new DnsResolutionError(`Failed to resolve domain: ${domain}`, domain, error);
    }
}
/**
 * Resolves an email address to the target server's IP address.
 *
 * Extracts the domain from the email and performs DNS resolution
 * to find the appropriate MPRC server.
 *
 * @param email - The email address to resolve
 * @returns Promise resolving to the target server's IP address
 * @throws {NetworkError} If email format is invalid
 * @throws {DnsResolutionError} If DNS resolution fails
 *
 * @example
 * ```typescript
 * const serverIp = await resolveEmailToServerAddress("user@example.com");
 * console.log(serverIp); // "93.184.216.34"
 * ```
 */
export async function resolveEmailToServerAddress(email) {
    const domain = extractDomainFromEmail(email);
    const resolution = await resolveDomain(domain);
    return resolution.primaryAddress;
}
/**
 * Managed TCP/TLS connection wrapper for MPRC protocol communication.
 *
 * Provides a higher-level API for connecting to MPRC servers,
 * sending commands, and handling responses with proper cleanup.
 *
 * Supports both plain TCP and TLS-encrypted connections.
 *
 * @example
 * ```typescript
 * // Plain TCP connection
 * const conn = new MPRCConnection({ host: "192.168.1.1" });
 *
 * // TLS-encrypted connection
 * const secureCon = new MPRCConnection({
 *   host: "mail.example.com",
 *   tls: { enabled: true, rejectUnauthorized: true }
 * });
 * ```
 */
export class MPRCConnection {
    socket = null;
    host;
    port;
    tlsOptions;
    connected = false;
    /**
     * Creates a new MPRC connection instance.
     *
     * @param options - Connection configuration options
     */
    constructor(options) {
        this.host = options.host;
        this.port = options.port ?? MPRC_PORT;
        this.tlsOptions = options.tls;
    }
    /**
     * Establishes a TCP or TLS connection to the target server.
     *
     * @param timeout - Connection timeout in milliseconds
     * @returns Promise that resolves when connected
     * @throws {ConnectionError} If connection fails
     * @throws {TimeoutError} If connection times out
     */
    async connect(timeout = CONNECTION_TIMEOUT_MS) {
        return new Promise((resolve, reject) => {
            let timeoutHandle = null;
            const cleanup = (error) => {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }
                if (error) {
                    this.socket?.removeAllListeners();
                    this.socket?.destroy();
                    this.socket = null;
                    reject(error);
                }
            };
            // Determine if we should use TLS
            const useTLS = this.tlsOptions?.enabled ?? false;
            if (useTLS) {
                // Create TLS connection
                const tlsConnectOptions = {
                    host: this.host,
                    port: this.port,
                    rejectUnauthorized: this.tlsOptions?.rejectUnauthorized ?? true,
                    minVersion: this.tlsOptions?.minVersion,
                    maxVersion: this.tlsOptions?.maxVersion,
                    servername: this.tlsOptions?.servername ?? this.host,
                };
                // Add optional TLS parameters
                if (this.tlsOptions?.ca) {
                    tlsConnectOptions.ca = this.tlsOptions.ca;
                }
                if (this.tlsOptions?.cert) {
                    tlsConnectOptions.cert = this.tlsOptions.cert;
                }
                if (this.tlsOptions?.key) {
                    tlsConnectOptions.key = this.tlsOptions.key;
                }
                this.socket = tls.connect(tlsConnectOptions, () => {
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                        timeoutHandle = null;
                    }
                    this.connected = true;
                    resolve();
                });
            }
            else {
                // Create plain TCP connection
                this.socket = new net.Socket();
                this.socket.connect(this.port, this.host, () => {
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                        timeoutHandle = null;
                    }
                    this.connected = true;
                    resolve();
                });
            }
            this.socket.on("error", (err) => {
                const protocol = useTLS ? "TLS" : "TCP";
                cleanup(new ConnectionError(`Failed to connect to ${this.host}:${this.port} (${protocol})`, this.host, this.port, err));
            });
            timeoutHandle = setTimeout(() => {
                const protocol = useTLS ? "TLS" : "TCP";
                cleanup(new TimeoutError(`Connection to ${this.host}:${this.port} timed out (${protocol})`, timeout));
            }, timeout);
        });
    }
    /**
     * Sends an MPRC command and waits for the response.
     *
     * @param command - The MPRC command to send
     * @param options - Send options including timeout
     * @returns Promise resolving to the command response
     * @throws {ConnectionError} If not connected
     * @throws {TimeoutError} If response times out
     * @throws {NetworkError} If response parsing fails
     */
    async sendCommand(command, options = {}) {
        const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
        if (!this.socket || !this.connected) {
            throw new ConnectionError("Cannot send command: not connected", this.host, this.port);
        }
        return new Promise((resolve, reject) => {
            let timeoutHandle = null;
            const cleanup = () => {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }
                this.socket?.removeListener("data", onData);
                this.socket?.removeListener("error", onError);
            };
            // Buffer for incoming data
            let buffer = "";
            const onData = (data) => {
                buffer += data.toString();
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);
                    if (line.length === 0)
                        continue;
                    cleanup();
                    try {
                        const response = JSON.parse(line);
                        resolve(response);
                    }
                    catch (err) {
                        reject(new NetworkError("INVALID_RESPONSE", "Failed to parse server response as JSON"));
                    }
                    return; // Only expect one response per command
                }
            };
            const onError = (err) => {
                cleanup();
                reject(new ConnectionError("Connection error while waiting for response", this.host, this.port, err));
            };
            this.socket.on("data", onData);
            this.socket.on("error", onError);
            // Send JSON with newline delimiter
            this.socket.write(JSON.stringify(command) + "\n");
            timeoutHandle = setTimeout(() => {
                cleanup();
                reject(new TimeoutError(`Response from ${this.host}:${this.port} timed out`, timeout));
            }, timeout);
        });
    }
    /**
     * Closes the connection and cleans up resources.
     */
    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.destroy();
            this.socket = null;
        }
        this.connected = false;
    }
    /**
     * Returns whether the connection is currently established.
     */
    isConnected() {
        return this.connected && this.socket !== null;
    }
    /**
     * Returns whether this connection is using TLS encryption.
     */
    isSecure() {
        return this.tlsOptions?.enabled ?? false;
    }
    /**
     * Returns the target host address.
     */
    getHost() {
        return this.host;
    }
    /**
     * Returns the target port number.
     */
    getPort() {
        return this.port;
    }
    /**
     * Returns TLS connection information if using TLS.
     * Useful for debugging certificate issues.
     */
    getTLSInfo() {
        if (this.socket && this.socket instanceof tls.TLSSocket) {
            if ("getPeerCertificate" in this.socket) {
                return this.socket.getPeerCertificate.bind(this.socket);
            }
        }
        return null;
    }
}
/**
 * Sends a single command to a target server and returns the response.
 *
 * This is a convenience function for one-off requests. It handles
 * connection establishment, command sending, and cleanup automatically.
 *
 * Supports both plain TCP and TLS-encrypted connections.
 *
 * @param host - Target server host address
 * @param command - The MPRC command to send
 * @param options - Optional connection and timeout settings
 * @returns Promise resolving to the command response
 *
 * @example
 * ```typescript
 * // Plain TCP
 * const response = await sendSingleCommand<VerifyProtocolCommandResponse>(
 *   "192.168.1.1",
 *   { command: "VERIFY", requestId: crypto.randomUUID() }
 * );
 *
 * // TLS-encrypted
 * const secureResponse = await sendSingleCommand<VerifyProtocolCommandResponse>(
 *   "mail.example.com",
 *   { command: "VERIFY", requestId: crypto.randomUUID() },
 *   { tls: { enabled: true } }
 * );
 * ```
 */
export async function sendSingleCommand(host, command, options = { host }) {
    const connection = new MPRCConnection({
        host,
        port: options.port ?? MPRC_PORT,
        tls: options.tls || { enabled: false },
    });
    try {
        await connection.connect(options.timeout ?? CONNECTION_TIMEOUT_MS);
        const response = await connection.sendCommand(command, {
            timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
        });
        return response;
    }
    finally {
        connection.disconnect();
    }
}
//# sourceMappingURL=index.js.map