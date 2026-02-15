/**
 * MPRC Protocol - Admin Authentication Utilities
 *
 * Provides utilities for creating and verifying admin authentication signatures
 * using public/private key cryptography (RSA or Ed25519).
 *
 * @module protocol/admin-auth
 */

import crypto from "node:crypto";
import type { AdminAuthentication, MPRCCommand } from "./command/index.js";

/**
 * Configuration for an admin key pair.
 */
export interface AdminKeyConfig {
  /**
   * Human-readable name for this admin key.
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
export const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

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
export function createSignaturePayload(
  command: Omit<MPRCCommand, "adminAuth">,
): string {
  // Sort keys for deterministic output
  const sorted = JSON.stringify(command, Object.keys(command).sort());
  return sorted;
}

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
export function signCommand(
  command: Omit<MPRCCommand, "adminAuth">,
  privateKey: string,
  publicKey: string,
): AdminAuthentication {
  const timestamp = Date.now();
  const payload = createSignaturePayload(command);

  // Add timestamp to payload to prevent replay attacks
  const payloadWithTimestamp = `${payload}:${timestamp}`;

  // Create signature
  const sign = crypto.createSign("SHA256");
  sign.update(payloadWithTimestamp);
  sign.end();

  const signature = sign.sign(privateKey, "base64");

  return {
    publicKey,
    signature,
    timestamp,
  };
}

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
export function verifyAdminSignature(
  command: MPRCCommand,
  adminAuth: AdminAuthentication,
): boolean {
  try {
    // Check timestamp is not too old (prevent replay attacks)
    const now = Date.now();
    const age = now - adminAuth.timestamp;

    if (age > MAX_SIGNATURE_AGE_MS) {
      console.warn(
        `Admin signature too old: ${age}ms (max: ${MAX_SIGNATURE_AGE_MS}ms)`,
      );
      return false;
    }

    // Check timestamp is not in the future (clock skew protection)
    if (adminAuth.timestamp > now + 60000) {
      // Allow 1 minute clock skew
      console.warn("Admin signature timestamp is in the future");
      return false;
    }

    // Create payload from command (excluding adminAuth)
    const { adminAuth: _, ...commandWithoutAuth } = command as any;
    const payload = createSignaturePayload(commandWithoutAuth);
    const payloadWithTimestamp = `${payload}:${adminAuth.timestamp}`;

    // Verify signature
    const verify = crypto.createVerify("SHA256");
    verify.update(payloadWithTimestamp);
    verify.end();

    const isValid = verify.verify(
      adminAuth.publicKey,
      adminAuth.signature,
      "base64",
    );

    return isValid;
  } catch (error) {
    console.error("Error verifying admin signature:", error);
    return false;
  }
}

/**
 * Finds an admin key configuration by public key.
 *
 * @param publicKey - The public key to search for
 * @param adminKeys - Array of admin key configurations
 * @returns The matching admin key config, or null if not found
 */
export function findAdminKey(
  publicKey: string,
  adminKeys: AdminKeyConfig[],
): AdminKeyConfig | null {
  // Normalize the public key for comparison (remove whitespace differences)
  const normalizedSearchKey = publicKey.replace(/\s+/g, "");

  for (const key of adminKeys) {
    const normalizedConfigKey = key.publicKey.replace(/\s+/g, "");
    if (normalizedConfigKey === normalizedSearchKey) {
      return key;
    }
  }

  return null;
}

/**
 * Checks if a command requires admin authentication.
 *
 * VERIFY and VERIFY_USER_EXISTENCE commands do not require authentication.
 * All other commands require admin authentication.
 *
 * @param command - The command to check
 * @returns True if the command requires admin authentication
 */
export function requiresAdminAuth(command: MPRCCommand): boolean {
  return (
    command.command !== "VERIFY" && command.command !== "VERIFY_USER_EXISTENCE"
  );
}

/**
 * Validates that a command has admin authentication if required.
 *
 * @param command - The command to validate
 * @param adminKeys - Array of admin key configurations
 * @returns True if authentication is valid or not required
 * @throws {AdminAuthenticationError} If auth is required but missing or invalid
 */
export function validateAdminAuth(
  command: MPRCCommand,
  adminKeys: AdminKeyConfig[],
): boolean {
  // Check if this command requires auth
  if (!requiresAdminAuth(command)) {
    return true;
  }

  // Check if adminAuth is present
  const adminAuth = (command as any).adminAuth as
    | AdminAuthentication
    | undefined;

  if (!adminAuth) {
    throw new Error(
      `Command ${command.command} requires admin authentication but none provided`,
    );
  }

  // Find the admin key
  const adminKey = findAdminKey(adminAuth.publicKey, adminKeys);

  if (!adminKey) {
    throw new Error(
      `Admin public key not found in server configuration. Ensure the public key is registered in adminKeys.`,
    );
  }

  // Verify the signature
  const isValid = verifyAdminSignature(command, adminAuth);

  if (!isValid) {
    throw new Error(
      `Invalid admin signature for key "${adminKey.name}". Signature verification failed.`,
    );
  }

  console.log(`✓ Admin authenticated as "${adminKey.name}"`);
  return true;
}

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
export function generateAdminKeyPair(keySize: number = 2048): {
  privateKey: string;
  publicKey: string;
} {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: keySize,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { privateKey, publicKey };
}

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
export function generateEd25519KeyPair(): {
  privateKey: string;
  publicKey: string;
} {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { privateKey, publicKey };
}
