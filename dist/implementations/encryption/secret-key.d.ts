/**
 * MPRC - Secret-Key Encryption Implementation
 *
 * Implements `IMessageEncryption` using a caller-supplied symmetric secret key.
 * All encryption is performed with AES-256-GCM (authenticated encryption).
 *
 * ## Key requirements
 * - The secret key must be **exactly 32 bytes** (256 bits).
 * - A new random 12-byte IV is generated for every encryption operation.
 * - The 128-bit GCM authentication tag is verified before any plaintext
 *   is returned from decryption calls.
 *
 * ## Key derivation (optional)
 * If you have a human-readable passphrase rather than a raw key, derive one
 * with PBKDF2 or scrypt before passing it here:
 *
 * ```typescript
 * const key = crypto.scryptSync(passphrase, salt, 32);
 * const enc = new SecretKeyEncryption({ secretKey: key });
 * ```
 *
 * ## Key rotation
 * Supply a `keyId` in the options so that every `EncryptedData` envelope
 * records which key was used. When rotating keys, provide a `decryptionKeys`
 * map so that old ciphertexts can still be decrypted:
 *
 * ```typescript
 * const enc = new SecretKeyEncryption({
 *   secretKey: newKey,
 *   keyId: "v2",
 *   decryptionKeys: { v1: oldKey },
 * });
 * ```
 *
 * @module implementations/encryption/secret-key
 */
import type { MessageAttachment, StoredMessage } from "../../index.js";
import type { IMessageEncryption, EncryptedAttachmentContent } from "../../protocol/encryption/interface.js";
import type { EncryptedData, EncryptedStoredMessage, EncryptedAttachmentMetadata, EncryptionContext } from "../../protocol/encryption/types.js";
/**
 * Configuration for `SecretKeyEncryption`.
 */
export interface SecretKeyEncryptionOptions {
    /**
     * The primary encryption key — must be exactly 32 bytes.
     * Can be a `Buffer`, a hex string (64 hex chars), or a base64 string
     * (44 chars for a 32-byte payload).
     */
    secretKey: Buffer | string;
    /**
     * Optional identifier for the primary key.
     * Written into every `EncryptedData` envelope so that the correct
     * decryption key can be looked up when rotating keys.
     *
     * @default "default"
     */
    keyId?: string;
    /**
     * Optional map of historic key IDs to their key material.
     * Used to decrypt envelopes that were encrypted with a previous key.
     *
     * @example
     * { "v1": Buffer.from("...old 32-byte key...") }
     */
    decryptionKeys?: Record<string, Buffer | string>;
}
/**
 * Symmetric-key encryption backend for MPRC messages and attachments.
 *
 * Uses AES-256-GCM for all encryption/decryption. Supports optional key
 * rotation via `decryptionKeys`.
 *
 * @example
 * ```typescript
 * // Generate a random 32-byte key
 * const secretKey = crypto.randomBytes(32);
 *
 * const encryption = new SecretKeyEncryption({ secretKey, keyId: "v1" });
 *
 * // Encrypt a stored message before persisting
 * const encryptedMsg = await encryption.encryptMessage(storedMessage);
 *
 * // Decrypt when serving to the client
 * const plainMsg = await encryption.decryptMessage(encryptedMsg);
 * ```
 */
export declare class SecretKeyEncryption implements IMessageEncryption {
    private readonly primaryKey;
    private readonly keyId;
    private readonly decryptionKeys;
    constructor(options: SecretKeyEncryptionOptions);
    /**
     * Normalises a key supplied as a `Buffer`, hex string, or base64 string
     * into a `Buffer`.
     */
    private static resolveKey;
    /**
     * Returns the decryption key for the given key ID.
     * Falls back to the primary key if the ID is not found and only one
     * key is registered (backward-compat for envelopes without `keyId`).
     */
    private resolveDecryptionKey;
    /**
     * Builds the Additional Authenticated Data (AAD) bytes from an optional
     * `EncryptionContext`. AAD binds the ciphertext to its context so that it
     * cannot be replayed in a different context.
     */
    private static buildAAD;
    /**
     * Encrypts a `Buffer` with AES-256-GCM and returns the raw components.
     */
    private encryptBuffer;
    /**
     * Decrypts a `Buffer` with AES-256-GCM. Throws if the auth tag is invalid.
     */
    private decryptBuffer;
    /**
     * Builds an `EncryptedData` envelope from raw cipher components.
     */
    private buildEnvelope;
    /**
     * Deconstructs an `EncryptedData` envelope into raw buffers and
     * selects the appropriate decryption key.
     */
    private unpackEnvelope;
    encryptString(plaintext: string, context?: EncryptionContext): Promise<EncryptedData>;
    decryptString(encrypted: EncryptedData, context?: EncryptionContext): Promise<string>;
    encryptBinary(base64Data: string, context?: EncryptionContext): Promise<EncryptedData>;
    decryptBinary(encrypted: EncryptedData, context?: EncryptionContext): Promise<string>;
    encryptMessage(message: StoredMessage): Promise<EncryptedStoredMessage>;
    decryptMessage(message: EncryptedStoredMessage): Promise<StoredMessage>;
    encryptAttachmentMetadata(attachment: Pick<MessageAttachment, "id" | "filename" | "mimeType">, contentHash: string, size: number): Promise<EncryptedAttachmentMetadata>;
    decryptAttachmentMetadata(encrypted: EncryptedAttachmentMetadata): Promise<{
        id: string;
        filename: string;
        mimeType: string;
        contentHash: string;
        size: number;
    }>;
    encryptAttachmentContent(attachment: MessageAttachment, contentHash: string): Promise<EncryptedAttachmentContent>;
    decryptAttachmentContent(encryptedContent: string, _metadata: EncryptedAttachmentMetadata): Promise<string>;
    describe(): string;
}
/**
 * Creates a `SecretKeyEncryption` instance from a raw hex or base64 key string.
 *
 * @example
 * ```typescript
 * const enc = createSecretKeyEncryption(process.env.ENCRYPTION_KEY!);
 * ```
 */
export declare function createSecretKeyEncryption(secretKey: string | Buffer, options?: Omit<SecretKeyEncryptionOptions, "secretKey">): SecretKeyEncryption;
/**
 * Generates a cryptographically random 32-byte key suitable for
 * `SecretKeyEncryption`, returned as a hex string.
 *
 * Store the result securely (e.g., in a secrets manager or environment
 * variable). **Never commit it to source control.**
 *
 * @example
 * ```typescript
 * const key = generateSecretKey();
 * console.log(key); // 64 hex characters
 * // Store in environment: ENCRYPTION_KEY=<hex>
 * ```
 */
export declare function generateSecretKey(): string;
//# sourceMappingURL=secret-key.d.ts.map