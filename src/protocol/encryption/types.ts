/**
 * MPRC Protocol - Encryption Types
 *
 * Core data structures used across all encryption implementations.
 * These types represent the wire format for encrypted data — they are
 * implementation-agnostic so that different encryption backends can be
 * swapped without changing the storage or transport layer.
 *
 * @module protocol/encryption/types
 */

import type { AttachmentMetadata, StoredMessage } from "../index.js";

// ============================================================================
// Encrypted Data Primitives
// ============================================================================

/**
 * Supported symmetric encryption algorithms.
 * All algorithms must provide authenticated encryption (AEAD) to guarantee
 * both confidentiality and integrity of the ciphertext.
 */
export type EncryptionAlgorithm =
  | "aes-256-gcm" // AES-256 in Galois/Counter Mode (recommended)
  | "chacha20-poly1305"; // ChaCha20 with Poly1305 MAC (alternative)

/**
 * A self-describing encrypted data envelope.
 *
 * Every encrypted payload carries the algorithm and all parameters needed
 * for decryption. This means stored data remains decryptable even if the
 * server defaults change in the future.
 *
 * Fields are base64-encoded binary values so they can be safely serialised
 * to JSON or stored as strings.
 *
 * @example
 * ```typescript
 * const encrypted: EncryptedData = {
 *   algorithm: "aes-256-gcm",
 *   ciphertext: "base64encodedCiphertext...",
 *   iv: "base64encodedIV...",
 *   authTag: "base64encodedAuthTag...",
 *   keyId: "primary-2024",
 * };
 * ```
 */
export interface EncryptedData {
  /** Encryption algorithm used to produce this ciphertext */
  algorithm: EncryptionAlgorithm;

  /**
   * Base64-encoded encrypted bytes.
   * For AES-256-GCM this is the raw ciphertext output (same length as plaintext).
   */
  ciphertext: string;

  /**
   * Base64-encoded Initialisation Vector / nonce.
   * - AES-256-GCM: 12 bytes (96-bit), randomly generated per encryption.
   * - ChaCha20-Poly1305: 12 bytes (96-bit), randomly generated per encryption.
   *
   * NEVER reuse an IV with the same key.
   */
  iv: string;

  /**
   * Base64-encoded authentication tag produced by the AEAD cipher.
   * - AES-256-GCM: 16 bytes (128-bit tag).
   * - ChaCha20-Poly1305: 16 bytes (128-bit tag).
   *
   * Must be verified before the plaintext is used.
   */
  authTag: string;

  /**
   * Optional identifier of the key used for encryption.
   * Useful when rotating keys — the decryptor can look up the correct key
   * by ID rather than trying all known keys.
   *
   * @example "v1", "primary-2024", "user-alice-key-2"
   */
  keyId?: string;

  /**
   * Optional additional authenticated data (AAD) identifier.
   * The actual AAD bytes are not stored here (they would defeat the purpose),
   * but recording which AAD context was used helps with debugging.
   *
   * @example "message-body", "attachment-content"
   */
  aadContext?: string;
}

// ============================================================================
// Encrypted Message Types
// ============================================================================

/**
 * Encrypted attachment metadata.
 *
 * The filename and MIME type are encrypted to prevent metadata leakage.
 * The content hash remains plaintext so the storage layer can still perform
 * deduplication without decrypting each attachment.
 */
export interface EncryptedAttachmentMetadata {
  /** Unique identifier for the attachment (plaintext — used for lookups) */
  id: string;

  /**
   * SHA-256 hash of the *original* (pre-encryption) content.
   * Kept in plaintext to enable content-addressable deduplication.
   * The storage layer stores the *encrypted* bytes under this hash.
   */
  contentHash: string;

  /**
   * Size of the original (plaintext) attachment in bytes.
   * Kept in plaintext so clients can show file sizes before decrypting.
   */
  size: number;

  /** Encrypted filename and MIME type */
  encryptedMetadata: EncryptedData;

  /** Whether this attachment's content blob is also encrypted on disk */
  contentEncrypted: boolean;
}

/**
 * A fully encrypted stored message.
 *
 * Non-sensitive routing fields (`id`, `from`, `to`, `receivedAt`) are kept
 * as plaintext so the server can route, filter, and paginate messages without
 * decrypting them. All sensitive content (subject, body, tags, folder) is
 * encrypted into a single `encryptedPayload` blob.
 *
 * @example
 * ```typescript
 * const msg: EncryptedStoredMessage = {
 *   id: "uuid-here",
 *   from: "alice@example.com",
 *   to: "bob@example.com",
 *   receivedAt: new Date(),
 *   isEncrypted: true,
 *   encryptedPayload: { algorithm: "aes-256-gcm", ciphertext: "...", ... },
 *   attachments: [],
 * };
 * ```
 */
export interface EncryptedStoredMessage {
  /** Unique message identifier (plaintext) */
  id: string;

  /** Sender email address (plaintext — needed for routing and filtering) */
  from: string;

  /** Recipient email address (plaintext — needed for routing and filtering) */
  to: string;

  /** Server-assigned receive timestamp (plaintext — needed for sorting) */
  receivedAt?: Date;

  /**
   * Discriminant flag — always `true` on encrypted messages.
   * Allows the storage layer to branch on the message type without
   * attempting to access fields that are encrypted.
   */
  isEncrypted: true;

  /**
   * Encrypted JSON payload containing all sensitive message fields:
   * - `subject`
   * - `body`
   * - `sentAt`
   * - `responseTo`
   * - `tags`
   * - `folder`
   *
   * The plaintext is a JSON-serialised `EncryptedMessagePayload`.
   */
  encryptedPayload: EncryptedData;

  /**
   * Encrypted attachment metadata.
   * Each entry describes one attachment. Content hashes are plaintext
   * for deduplication; filenames and MIME types are encrypted.
   */
  attachments?: EncryptedAttachmentMetadata[];
}

/**
 * The plaintext payload that gets encrypted into `EncryptedStoredMessage.encryptedPayload`.
 * This is an internal serialisation type — it is never stored or transmitted in plaintext.
 */
export interface EncryptedMessagePayload {
  subject: string;
  body: StoredMessage["body"];
  sentAt?: Date | undefined;
  responseTo?: string | undefined;
  tags?: string[] | undefined;
  folder?: string | undefined;
}

/**
 * Encrypted attachment metadata payload — serialised inside `EncryptedAttachmentMetadata.encryptedMetadata`.
 */
export interface EncryptedAttachmentMetadataPayload {
  filename: string;
  mimeType: string;
}

// ============================================================================
// Union / Discriminated Union Helpers
// ============================================================================

/**
 * A message as returned from storage — either a plaintext `StoredMessage`
 * or an `EncryptedStoredMessage`.
 *
 * Consumers that need the plaintext content must decrypt it first using
 * an `IMessageEncryption` implementation.
 */
export type StoredMessageUnion = (StoredMessage & { isEncrypted?: false }) | EncryptedStoredMessage;

/**
 * A stored attachment metadata record — either plaintext `AttachmentMetadata`
 * or an `EncryptedAttachmentMetadata`.
 */
export type AttachmentMetadataUnion = AttachmentMetadata | EncryptedAttachmentMetadata;

// ============================================================================
// Encryption Context
// ============================================================================

/**
 * Optional context provided to encryption / decryption operations.
 * Used to bind encrypted data to a specific context (e.g., a message ID),
 * preventing ciphertexts from being moved between messages.
 */
export interface EncryptionContext {
  /**
   * Identifier of the entity being encrypted (e.g., message ID, attachment ID).
   * Incorporated into the AEAD additional-authenticated data (AAD).
   */
  entityId?: string;

  /**
   * Type of the entity being encrypted.
   * @example "message-payload", "attachment-content", "attachment-metadata"
   */
  entityType?: string;

  /**
   * Recipient user ID — useful for per-user key derivation schemes.
   */
  userId?: string;
}
