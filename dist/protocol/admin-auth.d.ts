/**
 * MPRC Protocol - Admin Authentication Utilities
 *
 * Provides utilities for creating and verifying admin authentication signatures
 * using public/private key cryptography (RSA or Ed25519).
 *
 * @module protocol/admin-auth
 */
import type { AdminAuthentication, MPRCCommand } from "./command/index.js";
/**
 * Configuration for an admin key pair.
 */
export interface AdminKeyConfig {
    /**
     * Human-readable name for this admin key.
     * Used to identify which key is being used for authentication.
     * This is distinct from user names (future user JWT auth will have usernames).
     *
     * @example "primary-server", "backup-admin", "deployment-bot"
     */
    name: string;
    /**
     * The public key in PEM format.
     * This is stored on the server and used to verify signatures.
     */
    publicKey: string;
}
/**
 * Maximum age of a signature in milliseconds.
 * Signatures older than this are rejected to prevent replay attacks.
 *
 * Default: 5 minutes
 */
export declare const MAX_SIGNATURE_AGE_MS: number;
/**
 * Creates the canonical payload string for signing.
 *
 * This function creates a deterministic string representation of the command
 * that can be signed and verified. The adminAuth field is excluded from
 * the payload to avoid circular dependencies.
 *
 * @param command - The MPRC command to create payload from
 * @returns Canonical JSON string of the command without adminAuth
 */
export declare function createSignaturePayload(command: Omit<MPRCCommand, "adminAuth">): string;
/**
 * Signs a command with a private key.
 *
 * This function creates an AdminAuthentication object that can be attached
 * to a command. The signature is created by signing the canonical command
 * payload with the provided private key.
 *
 * @param command - The command to sign (without adminAuth field)
 * @param privateKey - The private key in PEM format
 * @param publicKey - The corresponding public key in PEM format
 * @returns AdminAuthentication object to attach to the command
 *
 * @example
 * ```typescript
 * const command = {
 *   command: "SEND_MESSAGE",
 *   requestId: crypto.randomUUID(),
 *   message: myMessage,
 * };
 *
 * const adminAuth = signCommand(command, privateKey, publicKey);
 * const authenticatedCommand = { ...command, adminAuth };
 * ```
 */
export declare function signCommand(command: Omit<MPRCCommand, "adminAuth">, privateKey: string, publicKey: string): AdminAuthentication;
/**
 * Verifies an admin authentication signature.
 *
 * This function checks that:
 * 1. The signature timestamp is within the acceptable window
 * 2. The signature was created with the private key corresponding to the public key
 * 3. The signature matches the command payload
 *
 * @param command - The full command including adminAuth
 * @param adminAuth - The admin authentication to verify
 * @returns True if the signature is valid
 *
 * @example
 * ```typescript
 * const command: SendMessageCommand = receivedCommand;
 * const isValid = verifyAdminSignature(command, command.adminAuth);
 *
 * if (!isValid) {
 *   throw new AdminAuthenticationError("Invalid admin signature");
 * }
 * ```
 */
export declare function verifyAdminSignature(command: MPRCCommand, adminAuth: AdminAuthentication): boolean;
/**
 * Finds an admin key configuration by public key.
 *
 * @param publicKey - The public key to search for
 * @param adminKeys - Array of admin key configurations
 * @returns The matching admin key config, or null if not found
 */
export declare function findAdminKey(publicKey: string, adminKeys: AdminKeyConfig[]): AdminKeyConfig | null;
/**
 * Checks if a command requires admin authentication.
 *
 * VERIFY and FIND_USER commands do not require authentication.
 * All other commands require admin authentication.
 *
 * @param command - The command to check
 * @returns True if the command requires admin authentication
 */
export declare function requiresAdminAuth(command: MPRCCommand): boolean;
/**
 * Validates that a command has admin authentication if required.
 *
 * @param command - The command to validate
 * @param adminKeys - Array of admin key configurations
 * @returns True if authentication is valid or not required
 * @throws {AdminAuthenticationError} If auth is required but missing or invalid
 */
export declare function validateAdminAuth(command: MPRCCommand, adminKeys: AdminKeyConfig[]): boolean;
/**
 * Generates a new RSA key pair for admin authentication.
 *
 * This is a utility function for creating new admin keys.
 * The generated keys should be stored securely.
 *
 * @param keySize - RSA key size in bits (default: 2048)
 * @returns Object with privateKey and publicKey in PEM format
 *
 * @example
 * ```typescript
 * const { privateKey, publicKey } = generateAdminKeyPair();
 *
 * // Store privateKey securely on the client
 * // Add publicKey to server's MPRCServerConf.json adminKeys
 * ```
 */
export declare function generateAdminKeyPair(keySize?: number): {
    privateKey: string;
    publicKey: string;
};
/**
 * Generates a new Ed25519 key pair for admin authentication.
 *
 * Ed25519 keys are smaller and faster than RSA keys.
 *
 * @returns Object with privateKey and publicKey in PEM format
 *
 * @example
 * ```typescript
 * const { privateKey, publicKey } = generateEd25519KeyPair();
 * ```
 */
export declare function generateEd25519KeyPair(): {
    privateKey: string;
    publicKey: string;
};
//# sourceMappingURL=admin-auth.d.ts.map