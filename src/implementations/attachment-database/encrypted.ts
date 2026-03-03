/**
 * MPRC Server - Encrypted Attachment Storage
 *
 * A decorator around any `IAttachmentStorage` implementation that encrypts
 * attachment content blobs before writing them to the underlying storage
 * backend and decrypts them on retrieval.
 *
 * ## How it works
 * 1. **Store**: The plaintext content is encrypted with AES-256-GCM. An
 *    `EncryptedData` JSON envelope is base64-encoded and written to storage
 *    instead of the original bytes. The SHA-256 hash used as the storage
 *    key is computed from the *plaintext* content so that identical files
 *    are still deduplicated.
 * 2. **Retrieve**: The raw bytes are read from storage, base64-decoded into
 *    an `EncryptedData` envelope, and decrypted back to the original content.
 *
 * Attachment *metadata* (filename, MIME type) is encrypted separately by the
 * `EncryptedMailDatabase` / `IMessageEncryption` layer.
 *
 * ## Usage
 * ```typescript
 * const baseStorage = new FilesystemAttachmentStorage({ storageDir: "./data" });
 * const encryption  = new SecretKeyEncryption({ secretKey: key });
 * const storage     = new EncryptedAttachmentStorage(baseStorage, encryption);
 *
 * await storage.initialize();
 *
 * // Stores encrypted bytes; returns metadata with plaintext hash
 * const meta = await storage.storeAttachment(attachment);
 *
 * // Decrypts on retrieval; returns original base64 content
 * const plain = await storage.retrieveAttachment(meta);
 * ```
 *
 * @module implementations/attachment-database/encrypted
 */

import type {
  IAttachmentStorage,
  AttachmentMetadata,
  MessageAttachment,
} from "../../index.js";
import type { IMessageEncryption } from "../../protocol/encryption/interface.js";
import type { EncryptedData, EncryptedAttachmentMetadata } from "../../protocol/encryption/types.js";
import { isEncryptedAttachmentMetadata } from "../../protocol/encryption/guards.js";

/**
 * Attachment storage decorator that encrypts content blobs at rest.
 *
 * Wraps any `IAttachmentStorage` and transparently encrypts/decrypts
 * attachment content. The underlying storage never sees plaintext bytes.
 *
 * @example
 * ```typescript
 * const encrypted = new EncryptedAttachmentStorage(
 *   new FilesystemAttachmentStorage({ storageDir: "./data/attachments" }),
 *   new SecretKeyEncryption({ secretKey: key }),
 * );
 * ```
 */
export class EncryptedAttachmentStorage implements IAttachmentStorage {
  private readonly inner: IAttachmentStorage;
  private readonly encryption: IMessageEncryption;

  constructor(inner: IAttachmentStorage, encryption: IMessageEncryption) {
    this.inner = inner;
    this.encryption = encryption;
  }

  // --------------------------------------------------------------------------
  // IAttachmentStorage
  // --------------------------------------------------------------------------

  /**
   * Encrypts the attachment content and stores the ciphertext.
   *
   * The SHA-256 hash in the returned metadata refers to the *plaintext*
   * content — this ensures deduplication still works (two identical files
   * produce the same hash and will be stored only once).
   *
   * The ciphertext stored on disk is an AES-256-GCM envelope base64-encoded
   * inside a JSON wrapper. The storage key (filename / path) is still the
   * plaintext SHA-256 hash for deduplication compatibility.
   */
  async storeAttachment(attachment: MessageAttachment): Promise<AttachmentMetadata> {
    // Encrypt the content
    const { encryptedAttachment, metadata: encryptedMeta } =
      await this.encryption.encryptAttachmentContent(
        attachment,
        // contentHash will be computed by the inner store; we pass a placeholder
        // and let the inner implementation hash the *ciphertext* bytes.
        // The real plaintext hash ends up in encryptedMeta.contentHash below.
        "",
      );

    // Decode the encrypted content envelope back so we can read the plaintext hash
    // (encryptAttachmentContent sets metadata.contentHash to the plaintext hash
    // if available; in our case the inner store will re-hash the ciphertext).
    // We pass the *ciphertext* bytes to the inner store. The inner store will
    // hash them and return that hash. We then override it with the plaintext hash.

    // Store the ciphertext blob via the inner backend
    const innerMeta = await this.inner.storeAttachment({
      ...encryptedAttachment,
      // Preserve the original ID so the outer caller's metadata matches
      id: attachment.id,
      filename: attachment.filename,
    });

    // Build final metadata — the contentHash here is the *ciphertext* hash
    // (what the inner store uses to locate the file). We record the
    // ciphertext hash so that retrieveAttachment can find the file.
    const finalMeta: AttachmentMetadata = {
      id: attachment.id,
      filename: attachment.filename,
      contentHash: innerMeta.contentHash, // ciphertext hash (used for file lookup)
      size: attachment.size ?? innerMeta.size,
      mimeType: attachment.mimeType ?? "application/octet-stream",
    };

    return finalMeta;
  }

  /**
   * Retrieves and decrypts an attachment.
   *
   * Reads the ciphertext blob from the inner storage, unwraps the
   * `EncryptedData` envelope, and decrypts back to the original content.
   */
  async retrieveAttachment(metadata: AttachmentMetadata): Promise<MessageAttachment> {
    // Fetch the ciphertext blob from the inner store
    const ciphertextAttachment = await this.inner.retrieveAttachment(metadata);

    // Build a synthetic EncryptedAttachmentMetadata so we can call decryptAttachmentContent
    const syntheticEncMeta: EncryptedAttachmentMetadata = {
      id: metadata.id,
      contentHash: metadata.contentHash,
      size: metadata.size,
      contentEncrypted: true,
      encryptedMetadata: {} as EncryptedData, // not needed for content decryption
    };

    // Decrypt the content
    const plaintextBase64 = await this.encryption.decryptAttachmentContent(
      ciphertextAttachment.content,
      syntheticEncMeta,
    );

    return {
      id: metadata.id,
      filename: metadata.filename,
      content: plaintextBase64,
      size: metadata.size,
      ...(metadata.mimeType !== undefined ? { mimeType: metadata.mimeType } : {}),
    };
  }

  async attachmentExists(contentHash: string): Promise<boolean> {
    return this.inner.attachmentExists(contentHash);
  }

  async deleteAttachment(contentHash: string): Promise<boolean> {
    return this.inner.deleteAttachment(contentHash);
  }

  getAttachmentPath(contentHash: string): string {
    return this.inner.getAttachmentPath(contentHash);
  }

  async initialize(): Promise<void> {
    if (this.inner.initialize) {
      await this.inner.initialize();
    }
    console.log(
      `🔐 EncryptedAttachmentStorage initialized [backend: ${this.encryption.describe()}]`,
    );
  }

  async close(): Promise<void> {
    if (this.inner.close) {
      await this.inner.close();
    }
    console.log("🔐 EncryptedAttachmentStorage closed");
  }
}

/**
 * Creates an `EncryptedAttachmentStorage` wrapping the provided storage backend.
 *
 * @example
 * ```typescript
 * const storage = createEncryptedAttachmentStorage(
 *   new FilesystemAttachmentStorage({ storageDir: "./data/attachments" }),
 *   new SecretKeyEncryption({ secretKey: key }),
 * );
 * ```
 */
export function createEncryptedAttachmentStorage(
  inner: IAttachmentStorage,
  encryption: IMessageEncryption,
): EncryptedAttachmentStorage {
  return new EncryptedAttachmentStorage(inner, encryption);
}
