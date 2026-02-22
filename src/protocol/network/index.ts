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

import type { MPRCCommand, MPRCCommandResponse } from "../../index.js";
import {
  MPRC_PORT,
  DEFAULT_TIMEOUT_MS,
  CONNECTION_TIMEOUT_MS,
} from "../../constants.js";
import {
  NetworkError,
  DnsResolutionError,
  ConnectionError,
  TimeoutError,
} from "../errors.js";

const resolve4Async = promisify(dns.resolve4);

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
export function extractDomainFromEmail(email: string): string {
  const parts = email.split("@");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new NetworkError(
      "INVALID_EMAIL_FORMAT",
      `Invalid email address format: ${email}`,
    );
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
export async function resolveDomain(
  domain: string,
): Promise<DnsResolutionResult> {
  try {
    const addresses = await resolve4Async(domain);

    if (addresses.length === 0) {
      throw new DnsResolutionError(
        `No IPv4 addresses found for domain: ${domain}`,
        domain,
      );
    }

    return {
      domain,
      addresses,
      primaryAddress: addresses[0]!,
    };
  } catch (error) {
    if (error instanceof DnsResolutionError) {
      throw error;
    }
    throw new DnsResolutionError(
      `Failed to resolve domain: ${domain}`,
      domain,
      error as Error,
    );
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
export async function resolveEmailToServerAddress(
  email: string,
): Promise<string> {
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
  private socket: net.Socket | tls.TLSSocket | null = null;
  private host: string;
  private port: number;
  private tlsOptions?: TLSOptions | undefined;
  private connected: boolean = false;

  /**
   * Creates a new MPRC connection instance.
   *
   * @param options - Connection configuration options
   */
  constructor(options: ConnectionOptions) {
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
  async connect(timeout: number = CONNECTION_TIMEOUT_MS): Promise<void> {
    return new Promise((resolve, reject) => {
      let timeoutHandle: NodeJS.Timeout | null = null;

      const cleanup = (error?: Error) => {
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
        const tlsConnectOptions: tls.ConnectionOptions = {
          host: this.host,
          port: this.port,
          rejectUnauthorized: this.tlsOptions?.rejectUnauthorized ?? true,
          minVersion: this.tlsOptions?.minVersion as any,
          maxVersion: this.tlsOptions?.maxVersion as any,
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
      } else {
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
        cleanup(
          new ConnectionError(
            `Failed to connect to ${this.host}:${this.port} (${protocol})`,
            this.host,
            this.port,
            err,
          ),
        );
      });

      timeoutHandle = setTimeout(() => {
        const protocol = useTLS ? "TLS" : "TCP";
        cleanup(
          new TimeoutError(
            `Connection to ${this.host}:${this.port} timed out (${protocol})`,
            timeout,
          ),
        );
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
  async sendCommand<T extends MPRCCommandResponse>(
    command: MPRCCommand,
    options: SendCommandOptions = {},
  ): Promise<T> {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;

    if (!this.socket || !this.connected) {
      throw new ConnectionError(
        "Cannot send command: not connected",
        this.host,
        this.port,
      );
    }

    return new Promise((resolve, reject) => {
      let timeoutHandle: NodeJS.Timeout | null = null;

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
      const onData = (data: Buffer) => {
        buffer += data.toString();
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          if (line.length === 0) continue;
          cleanup();
          try {
            const response = JSON.parse(line) as T;
            resolve(response);
          } catch (err) {
            reject(
              new NetworkError(
                "INVALID_RESPONSE",
                "Failed to parse server response as JSON",
              ),
            );
          }
          return; // Only expect one response per command
        }
      };

      const onError = (err: Error) => {
        cleanup();
        reject(
          new ConnectionError(
            "Connection error while waiting for response",
            this.host,
            this.port,
            err,
          ),
        );
      };

      this.socket!.on("data", onData);
      this.socket!.on("error", onError);

      // Send JSON with newline delimiter
      this.socket!.write(JSON.stringify(command) + "\n");

      timeoutHandle = setTimeout(() => {
        cleanup();
        reject(
          new TimeoutError(
            `Response from ${this.host}:${this.port} timed out`,
            timeout,
          ),
        );
      }, timeout);
    });
  }

  /**
   * Closes the connection and cleans up resources.
   */
  disconnect(): void {
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
  isConnected(): boolean {
    return this.connected && this.socket !== null;
  }

  /**
   * Returns whether this connection is using TLS encryption.
   */
  isSecure(): boolean {
    return this.tlsOptions?.enabled ?? false;
  }

  /**
   * Returns the target host address.
   */
  getHost(): string {
    return this.host;
  }

  /**
   * Returns the target port number.
   */
  getPort(): number {
    return this.port;
  }

  /**
   * Returns TLS connection information if using TLS.
   * Useful for debugging certificate issues.
   */
  getTLSInfo(): tls.TLSSocket["getPeerCertificate"] | null {
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
export async function sendSingleCommand<T extends MPRCCommandResponse>(
  host: string,
  command: MPRCCommand,
  options: ConnectionOptions & SendCommandOptions = { host },
): Promise<T> {
  const connection = new MPRCConnection({
    host,
    port: options.port ?? MPRC_PORT,
    tls: options.tls || { enabled: false },
  });

  try {
    await connection.connect(options.timeout ?? CONNECTION_TIMEOUT_MS);
    const response = await connection.sendCommand<T>(command, {
      timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
    });
    return response;
  } finally {
    connection.disconnect();
  }
}
