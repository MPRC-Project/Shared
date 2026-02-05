/**
 * MPRC Protocol - Network Utilities
 *
 * Shared networking functionality for DNS resolution and TCP communication.
 * Used by both client and server components to eliminate code duplication.
 */
import type { MPRCCommand, MPRCCommandResponse } from "../protocol/types.js";
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
 * Options for TCP connection operations.
 */
export interface ConnectionOptions {
    /** Target host address (IP or hostname) */
    host: string;
    /** Target port number */
    port?: number;
    /** Connection timeout in milliseconds */
    timeout?: number;
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
 * Managed TCP connection wrapper for MPRC protocol communication.
 *
 * Provides a higher-level API for connecting to MPRC servers,
 * sending commands, and handling responses with proper cleanup.
 */
export declare class MPRCConnection {
    private socket;
    private host;
    private port;
    private connected;
    /**
     * Creates a new MPRC connection instance.
     *
     * @param options - Connection configuration options
     */
    constructor(options: ConnectionOptions);
    /**
     * Establishes a TCP connection to the target server.
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
     * Returns the target host address.
     */
    getHost(): string;
    /**
     * Returns the target port number.
     */
    getPort(): number;
}
/**
 * Sends a single command to a target server and returns the response.
 *
 * This is a convenience function for one-off requests. It handles
 * connection establishment, command sending, and cleanup automatically.
 *
 * @param host - Target server host address
 * @param command - The MPRC command to send
 * @param options - Optional connection and timeout settings
 * @returns Promise resolving to the command response
 *
 * @example
 * ```typescript
 * const response = await sendSingleCommand<VerifyProtocolCommandResponse>(
 *   "192.168.1.1",
 *   { command: "VERIFY", requestId: crypto.randomUUID() }
 * );
 * ```
 */
export declare function sendSingleCommand<T extends MPRCCommandResponse>(host: string, command: MPRCCommand, options?: ConnectionOptions & SendCommandOptions): Promise<T>;
//# sourceMappingURL=index.d.ts.map