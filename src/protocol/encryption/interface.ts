/**
 * MPRC Protocol - Message Encryption Interface
 *
 * Defines the contract that every encryption backend must fulfil.
 * The interface is intentionally kept at the level of MPRC domain objects
 * (messages, attachments) so that callers never have to deal with raw
 * cipher primitives.
 *
 * @module protocol/encryption/interface
 */

import type { MessageAttachment, StoredMessage } from "../index.js";
import type {
  EncryptedData,
  EncryptedStoredMessage,
  EncryptedAttachmentMetadata,
  EncryptionContext,
} from "./types.js";

// ============================================================================
// Encryption Result Types
// ============================================================================

/**
 * Result of encrypting an attachment's content blob.
 * Bundles the encrypted bytes with the updated metadata record.
 */
export interface EncryptedAttachmentContent {
  /**
   * The encrypted attachment content, ready to be handed to the storage backend.
   * The `content` field holds the base64-encoded *ciphertext* instead of the
   * original plaintext blob.
   */
  encryptedAttachment: MessageAttachment;

  /**
   * Updated metadata that references the encrypted content.
   * The `contentEncrypted: true` flag signals to the storage layer that
   * the bytes on disk are ciphertext.
   */
  metadata: EncryptedAttachmentMetadata;
}

// ============================================================================
// Main Interface
// ============================================================================

/**
 * Encryption backend interface for MPRC message encryption.
 *
 * Implementations receive a plaintext MPRC domain object and return an
 * equivalent encrypted object (or vice-versa). The interface does **not**
 * prescribe how keys are managed — that is left to each implementation.
 *
 * ## Design goals
 * - **Swappable**: Drop-in replacement — swap AES-GCM for ChaCha20 without
 *   touching callers.
 * - **Domain-aware**: Works with `StoredMessage` / `MessageAttachment`
 *   rather than raw `Buffer` objects.
 * - **Metadata-safe**: Filenames, MIME types, and message subjects are all
 *   encrypted; only routing fields (IDs, addresses, timestamps) remain plaintext.
 * - **Attachment-aware**: Attachment content blobs and their metadata are
 *   encrypted independently.
 *
 * ## Usage example
 * ```typescript
 * const enc: IMessageEncryption = new SecretKeyEncryption({ secretKey: key });
 *
 * // Encrypt a message before storing it
 * const encrypted = await enc.encryptMessage(storedMessage);
 * await db.storeEncryptedMessage(encrypted);
 *
 * // Decrypt when the user retrieves it
 * const decrypted = await enc.decryptMessage(encrypted);
 * ```
 */
export interface IMessageEncryption {
  // --------------------------------------------------------------------------
  // Low-level primitives
  // (exposed for testing and for building higher-level helpers)
  // --------------------------------------------------------------------------

  /**
   * Encrypts an arbitrary UTF-8 string and returns a self-describing
   * `EncryptedData` envelope.
   *
   * @param plaintext - UTF-8 string to encrypt (may be JSON or raw text)
   * @param context   - Optional binding context incorporated into AAD
   * @returns Self-describing encrypted envelope
   *
   * @example
   * ```typescript
   * const env = await enc.encryptString("hello world", { entityType: "test" });
   * const back = await enc.decryptString(env);
   * console.log(back); // "hello world"
   * ```
   */
  encryptString(plaintext: string, context?: EncryptionContext): Promise<EncryptedData>;

  /**
   * Decrypts an `EncryptedData` envelope produced by `encryptString`.
   *
   * @param encrypted - The envelope to decrypt
   * @param context   - Must match the context supplied during encryption
   * @returns Original UTF-8 plaintext string
   * @throws If the ciphertext has been tampered with or the key is wrong
   */
  decryptString(encrypted: EncryptedData, context?: EncryptionContext): Promise<string>;

  /**
   * Encrypts raw binary data (supplied as a base64 string) and returns
   * a self-describing `EncryptedData` envelope whose `ciphertext` is also
   * base64-encoded.
   *
   * @param base64Data - Base64-encoded binary to encrypt
   * @param context    - Optional binding context
   * @returns Self-describing encrypted envelope
   */
  encryptBinary(base64Data: string, context?: EncryptionContext): Promise<EncryptedData>;

  /**
   * Decrypts an `EncryptedData` envelope produced by `encryptBinary`.
   *
   * @param encrypted - The envelope to decrypt
   * @param context   - Must match the context supplied during encryption
   * @returns Original base64-encoded binary
   * @throws If the ciphertext has been tampered with or the key is wrong
   */
  decryptBinary(encrypted: EncryptedData, context?: EncryptionContext): Promise<string>;

  // --------------------------------------------------------------------------
  // Message-level operations
  // --------------------------------------------------------------------------

  /**
   * Encrypts a `StoredMessage` into an `EncryptedStoredMessage`.
   *
   * The following fields are encrypted into a single JSON payload:
   * - `subject`
   * - `body`
   * - `sentAt`
   * - `responseTo`
   * - `tags`
   * - `folder`
   *
   * The following fields remain in plaintext for server-side routing:
   * - `id`
   * - `from`
   * - `to`
   * - `receivedAt`
   *
   * Attachments listed in `message.attachments` have their metadata
   * encrypted; their content blobs are **not** encrypted by this method
   * (use `encryptAttachmentContent` for that).
   *
   * @param message - Plaintext stored message to encrypt
   * @returns Encrypted message ready for storage
   */
  encryptMessage(message: StoredMessage): Promise<EncryptedStoredMessage>;

  /**
   * Decrypts an `EncryptedStoredMessage` back into a `StoredMessage`.
   *
   * @param message - Encrypted message from storage
   * @returns Plaintext stored message
   * @throws If the payload has been tampered with or the key is wrong
   */
  decryptMessage(message: EncryptedStoredMessage): Promise<StoredMessage>;

  // --------------------------------------------------------------------------
  // Attachment-level operations
  // --------------------------------------------------------------------------

  /**
   * Encrypts the metadata of an attachment (filename, MIME type) while
   * leaving the content hash in plaintext for deduplication.
   *
   * Does **not** encrypt the actual content blob — call
   * `encryptAttachmentContent` for that.
   *
   * @param attachment - The attachment whose metadata should be encrypted
   * @param contentHash - SHA-256 hash of the attachment content (plaintext)
   * @param size        - Size of the original content in bytes (plaintext)
   * @returns Encrypted attachment metadata record
   */
  encryptAttachmentMetadata(
    attachment: Pick<MessageAttachment, "id" | "filename" | "mimeType">,
    contentHash: string,
    size: number,
  ): Promise<EncryptedAttachmentMetadata>;

  /**
   * Decrypts an `EncryptedAttachmentMetadata` record back into a
   * plain `AttachmentMetadata` object.
   *
   * @param encrypted - Encrypted metadata record from storage
   * @returns Plaintext attachment metadata
   * @throws If the metadata has been tampered with or the key is wrong
   */
  decryptAttachmentMetadata(
    encrypted: EncryptedAttachmentMetadata,
  ): Promise<{ id: string; filename: string; mimeType: string; contentHash: string; size: number }>;

  /**
   * Encrypts an attachment's content blob.
   *
   * The returned `encryptedAttachment.content` contains the base64-encoded
   * *ciphertext* and should be passed directly to the attachment storage
   * backend. The `metadata.contentEncrypted` flag is set to `true`.
   *
   * @param attachment - Full attachment including base64 content
   * @param contentHash - Pre-computed SHA-256 hash of the *plaintext* content
   * @returns Encrypted content blob and updated metadata
   */
  encryptAttachmentContent(
    attachment: MessageAttachment,
    contentHash: string,
  ): Promise<EncryptedAttachmentContent>;

  /**
   * Decrypts an attachment's content blob.
   *
   * @param encryptedContent  - Base64-encoded ciphertext as stored on disk
   * @param metadata          - The encrypted metadata record (provides the IV/authTag etc.)
   * @returns Original base64-encoded plaintext content
   * @throws If the content has been tampered with or the key is wrong
   */
  decryptAttachmentContent(
    encryptedContent: string,
    metadata: EncryptedAttachmentMetadata,
  ): Promise<string>;

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  /**
   * Returns a human-readable identifier for the encryption backend.
   * Useful for logging and diagnostics.
   *
   * @example "SecretKeyEncryption(aes-256-gcm, keyId=primary-2024)"
   */
  describe(): string;
}
