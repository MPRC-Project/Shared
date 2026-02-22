/**
 * MPRC Protocol - Network Utilities
 *
 * Shared networking functionality for DNS resolution and TCP communication.
 * Used by both client and server components to eliminate code duplication.
 *
 * Supports both plain TCP and TLS-encrypted connections for secure communication.
 */
import tls from "node:tls";
import type { MPRCCommand, MPRCCommandResponse } from "../../index.js";
/**
 * Result of a DNS resolution operation.
 */
export interface DnsResolutionResult {
    /** The original domain that was resolved */
    domain: string;
    /** List of resolved IPv4 addresses */
    addresses: string[];
    /** The primary (first) address to use */
    primaryAddress: string;
}
/**
 * TLS configuration options for secure connections.
 *
 * @example
 * ```typescript
 * const tlsOptions: TLSOptions = {
 *   enabled: true,
 *   rejectUnauthorized: false, // For self-signed certs
 * };
 * ```
 */
export interface TLSOptions {
    /**
     * Whether to enable TLS encryption.
     * When true, uses tls.connect() instead of net.connect().
     * @default false
     */
    enabled: boolean;
    /**
     * Whether to verify the server certificate.
     * Set to false for self-signed certificates in development.
     * @default true
     */
    rejectUnauthorized?: boolean;
    /**
     * Custom CA certificate(s) to trust.
     * Useful for self-signed or internal CA certificates.
     */
    ca?: string | Buffer | Array<string | Buffer>;
    /**
     * Client certificate for mutual TLS authentication.
     */
    cert?: string | Buffer | Array<string | Buffer>;
    /**
     * Client private key for mutual TLS authentication.
     */
    key?: string | Buffer | Array<Buffer>;
    /**
     * Minimum TLS version to allow.
     * @example "TLSv1.2", "TLSv1.3"
     * @default "TLSv1.2"
     */
    minVersion?: string;
    /**
     * Maximum TLS version to allow.
     * @example "TLSv1.3"
     */
    maxVersion?: string;
    /**
     * Server name indication (SNI) hostname.
     * Usually set automatically from the connection host.
     */
    servername?: string;
}
/**
 * Options for TCP connection operations.
 */
export interface ConnectionOptions {
    /** Target host address (IP or hostname) */
    host: string;
    /** Target port number */
    port?: number;
    /** Connection timeout in milliseconds */
    timeout?: number;
    /** Optional TLS configuration for encrypted connections */
    tls?: TLSOptions;
}
/**
 * Options for sending commands over TCP.
 */
export interface SendCommandOptions {
    /** Response timeout in milliseconds */
    timeout?: number;
    /** Whether to keep the connection alive after sending */
    keepAlive?: boolean;
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
export declare function extractDomainFromEmail(email: string): string;
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
export declare function resolveDomain(domain: string): Promise<DnsResolutionResult>;
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
export declare function resolveEmailToServerAddress(email: string): Promise<string>;
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
export declare class MPRCConnection {
    private socket;
    private host;
    private port;
    private tlsOptions?;
    private connected;
    /**
     * Creates a new MPRC connection instance.
     *
     * @param options - Connection configuration options
     */
    constructor(options: ConnectionOptions);
    /**
     * Establishes a TCP or TLS connection to the target server.
     *
     * @param timeout - Connection timeout in milliseconds
     * @returns Promise that resolves when connected
     * @throws {ConnectionError} If connection fails
     * @throws {TimeoutError} If connection times out
     */
    connect(timeout?: number): Promise<void>;
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
    sendCommand<T extends MPRCCommandResponse>(command: MPRCCommand, options?: SendCommandOptions): Promise<T>;
    /**
     * Closes the connection and cleans up resources.
     */
    disconnect(): void;
    /**
     * Returns whether the connection is currently established.
     */
    isConnected(): boolean;
    /**
     * Returns whether this connection is using TLS encryption.
     */
    isSecure(): boolean;
    /**
     * Returns the target host address.
     */
    getHost(): string;
    /**
     * Returns the target port number.
     */
    getPort(): number;
    /**
     * Returns TLS connection information if using TLS.
     * Useful for debugging certificate issues.
     */
    getTLSInfo(): tls.TLSSocket["getPeerCertificate"] | null;
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
export declare function sendSingleCommand<T extends MPRCCommandResponse>(host: string, command: MPRCCommand, options?: ConnectionOptions & SendCommandOptions): Promise<T>;
//# sourceMappingURL=index.d.ts.map