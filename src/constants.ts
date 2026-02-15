/**
 * MPRC Protocol - Shared Constants
 *
 * This file contains all shared constants used across the MPRC protocol
 * implementation, including network configuration and protocol metadata.
 */

/**
 * Default port for MPRC protocol communication.
 * This port is used for both server listening and client connections.
 */
export const MPRC_PORT = 14720;

/**
 * Current version of the MPRC protocol.
 * Used during protocol verification handshake.
 */
export const MPRC_PROTOCOL_VERSION = "1.0.0";

/**
 * Default timeout for network operations in milliseconds.
 */
export const DEFAULT_TIMEOUT_MS = 60000;

/**
 * Connection timeout for establishing new connections in milliseconds.
 */
export const CONNECTION_TIMEOUT_MS = 15000;

/**
 * Protocol identifier string returned during VERIFY handshake.
 */
export const MPRC_PROTOCOL_IDENTIFIER = "MPRC" as const;
