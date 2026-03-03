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
import type { IAttachmentStorage, AttachmentMetadata, MessageAttachment } from "../../index.js";
import type { IMessageEncryption } from "../../protocol/encryption/interface.js";
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
export declare class EncryptedAttachmentStorage implements IAttachmentStorage {
    private readonly inner;
    private readonly encryption;
    constructor(inner: IAttachmentStorage, encryption: IMessageEncryption);
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
    storeAttachment(attachment: MessageAttachment): Promise<AttachmentMetadata>;
    /**
     * Retrieves and decrypts an attachment.
     *
     * Reads the ciphertext blob from the inner storage, unwraps the
     * `EncryptedData` envelope, and decrypts back to the original content.
     */
    retrieveAttachment(metadata: AttachmentMetadata): Promise<MessageAttachment>;
    attachmentExists(contentHash: string): Promise<boolean>;
    deleteAttachment(contentHash: string): Promise<boolean>;
    getAttachmentPath(contentHash: string): string;
    initialize(): Promise<void>;
    close(): Promise<void>;
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
export declare function createEncryptedAttachmentStorage(inner: IAttachmentStorage, encryption: IMessageEncryption): EncryptedAttachmentStorage;
//# sourceMappingURL=encrypted.d.ts.map