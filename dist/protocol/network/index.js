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
 * Known TLS error codes emitted by Node.js's tls/ssl layer.
 * These map to OpenSSL error codes surfaced via `err.code`.
 */
const TLS_ERROR_HINTS = {
    // Certificate trust errors
    DEPTH_ZERO_SELF_SIGNED_CERT: "The server is using a self-signed certificate. " +
        "Either provide the CA cert via `tls.ca`, or set `tls.rejectUnauthorized: false` for development.",
    SELF_SIGNED_CERT_IN_CHAIN: "A self-signed certificate was found in the certificate chain. " +
        "Either provide the CA cert via `tls.ca`, or set `tls.rejectUnauthorized: false` for development.",
    UNABLE_TO_GET_ISSUER_CERT: "The issuer certificate of the server cert could not be found. Provide the full certificate chain via `tls.ca`.",
    UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "The issuer certificate is not trusted by this system. Provide the CA cert via `tls.ca`.",
    UNABLE_TO_VERIFY_LEAF_SIGNATURE: "Could not verify the server certificate signature. Provide the correct CA cert via `tls.ca`.",
    CERT_UNTRUSTED: "The server certificate is not trusted. Provide the CA cert via `tls.ca`.",
    CERT_REJECTED: "The server certificate was explicitly rejected. Check your `tls.ca` configuration.",
    // Certificate validity errors
    CERT_HAS_EXPIRED: "The server's TLS certificate has expired. The server administrator needs to renew it.",
    CERT_NOT_YET_VALID: "The server's TLS certificate is not yet valid (starts in the future). Check system clock or contact server admin.",
    ERR_TLS_CERT_ALTNAME_INVALID: "The server's certificate does not cover this hostname (Subject Alternative Name mismatch). " +
        "Ensure you are connecting to the correct host, or set `tls.servername` explicitly.",
    HOSTNAME_MISMATCH: "The server's certificate hostname does not match the connected host. " +
        "Ensure you are connecting to the correct host, or set `tls.servername` explicitly.",
    // Protocol/version errors
    ERR_SSL_WRONG_VERSION_NUMBER: "TLS version mismatch — the server may not support TLS, or only supports an older version. " +
        "Try adjusting `tls.minVersion` / `tls.maxVersion`.",
    ERR_SSL_NO_PROTOCOLS_AVAILABLE: "No mutually supported TLS protocol versions. Adjust `tls.minVersion` or `tls.maxVersion`.",
    ERR_SSL_TLSV1_ALERT_PROTOCOL_VERSION: "The server rejected the TLS protocol version. Try setting `tls.minVersion: 'TLSv1.2'`.",
    ERR_SSL_SSLV3_ALERT_HANDSHAKE_FAILURE: "TLS handshake failed. This may indicate a cipher suite mismatch or certificate issue.",
    ERR_SSL_DECRYPTION_FAILED_OR_BAD_RECORD_MAC: "TLS decryption failed. The connection may have been tampered with, or there is a version mismatch.",
    // Connection errors
    ECONNREFUSED: "The connection was refused — the server is not listening on this port, or a firewall is blocking it.",
    ECONNRESET: "The connection was reset by the server. The server may have closed the connection during TLS handshake.",
    ETIMEDOUT: "The connection timed out before TLS handshake completed.",
    ENOTFOUND: "The hostname could not be resolved. Check that the host address is correct.",
};
/**
 * Builds a descriptive `ConnectionError` for TLS failures by inspecting the
 * underlying Node.js / OpenSSL error code.
 *
 * @param err - The raw error from the TLS socket
 * @param host - Target host
 * @param port - Target port
 * @param tlsOptions - The TLS options that were in use (used to add context)
 * @returns A `ConnectionError` with an actionable message
 */
function buildTLSConnectionError(err, host, port, tlsOptions) {
    const code = err.code ?? "UNKNOWN";
    const hint = TLS_ERROR_HINTS[code];
    let message;
    if (hint) {
        message = `TLS connection to ${host}:${port} failed [${code}]: ${hint}`;
    }
    else {
        message =
            `TLS connection to ${host}:${port} failed [${code}]: ${err.message}. ` +
                `If using a self-signed certificate, set tls.rejectUnauthorized: false or provide tls.ca.`;
    }
    // Append a reminder when rejectUnauthorized is true and the error looks certificate-related
    const certRelatedCodes = new Set([
        "DEPTH_ZERO_SELF_SIGNED_CERT",
        "SELF_SIGNED_CERT_IN_CHAIN",
        "UNABLE_TO_GET_ISSUER_CERT",
        "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
        "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
        "CERT_UNTRUSTED",
        "CERT_REJECTED",
    ]);
    if (certRelatedCodes.has(code) &&
        (tlsOptions?.rejectUnauthorized ?? true) === true) {
        message +=
            " (Currently `rejectUnauthorized: true` — set to `false` to skip cert validation during development.)";
    }
    return new ConnectionError(message, host, port, err);
}
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
                cleanup(useTLS
                    ? buildTLSConnectionError(err, this.host, this.port, this.tlsOptions)
                    : new ConnectionError(`Failed to connect to ${this.host}:${this.port} (TCP): ${err.message}`, this.host, this.port, err));
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