/**
 * MPRC - Attachment Storage Interface
 *
 * Defines the interface for storing and retrieving message attachments.
 * Implementations can use different storage backends (filesystem, S3, etc.)
 * while maintaining a consistent API.
 *
 */

import type { MessageAttachment } from "./types.js";

/**
 * Metadata about a stored attachment.
 * This information is stored in the database alongside the message.
 */
export interface StoredAttachmentMetadata {
  /** Unique identifier for this attachment */
  id: string;
  /** Original filename provided by the sender */
  filename: string;
  /** SHA-256 hash of the attachment content (used as storage filename) */
  contentHash: string;
  /** Size of the attachment in bytes */
  size: number;
  /** MIME type of the attachment (reserved for future use) */
  mimeType?: string;
  /** Timestamp when the attachment was stored */
  storedAt: Date;
}

/**
 * Abstract interface for attachment storage operations.
 *
 * Implementations must handle:
 * - Content-addressable storage using SHA-256 hashes
 * - Deduplication of identical content
 * - Retrieval of attachments by hash
 * - Reference counting for garbage collection
 *
 * @example
 * ```typescript
 * class FilesystemAttachmentStorage implements IAttachmentStorage {
 *   async storeAttachment(attachment: IncomingAttachment): Promise<StoredAttachmentMetadata> {
 *     const hash = await this.calculateHash(attachment.content);
 *     const filepath = path.join(this.storageDir, hash);
 *
 *     if (!fs.existsSync(filepath)) {
 *       const buffer = Buffer.from(attachment.content, 'base64');
 *       await fs.promises.writeFile(filepath, buffer);
 *     }
 *
 *     return {
 *       id: attachment.id,
 *       filename: attachment.filename,
 *       contentHash: hash,
 *       size: Buffer.byteLength(attachment.content, 'base64'),
 *       storedAt: new Date(),
 *     };
 *   }
 *   // ... implement other methods
 * }
 * ```
 */
export interface IAttachmentStorage {
  /**
   * Stores an attachment and returns its metadata.
   *
   * The implementation should:
   * 1. Calculate SHA-256 hash of the content
   * 2. Check if a file with this hash already exists
   * 3. If not, decode base64 and save the file using hash as filename
   * 4. Return metadata with the hash for database storage
   *
   * @param attachment - The incoming attachment to store
   * @returns Metadata about the stored attachment
   * @throws {Error} If storage operation fails
   */
  storeAttachment(
    attachment: MessageAttachment,
  ): Promise<StoredAttachmentMetadata>;

  /**
   * Retrieves an attachment by its content hash.
   *
   * The implementation should:
   * 1. Locate the file using the content hash
   * 2. Read the file contents
   * 3. Encode to base64
   * 4. Return with the original metadata
   *
   * @param metadata - The stored attachment metadata
   * @returns The attachment with its blob content
   * @throws {Error} If attachment not found or read fails
   */
  retrieveAttachment(
    metadata: StoredAttachmentMetadata,
  ): Promise<MessageAttachment>;

  /**
   * Checks if an attachment with the given hash exists in storage.
   *
   * @param contentHash - The SHA-256 hash to check
   * @returns True if the attachment exists
   */
  attachmentExists(contentHash: string): Promise<boolean>;

  /**
   * Deletes an attachment from storage if it's no longer referenced.
   *
   * Note: This should only be called after verifying no messages
   * reference this attachment hash.
   *
   * @param contentHash - The SHA-256 hash of the attachment to delete
   * @returns True if the attachment was deleted
   */
  deleteAttachment(contentHash: string): Promise<boolean>;

  /**
   * Gets the storage path for an attachment hash.
   * Useful for debugging and testing.
   *
   * @param contentHash - The SHA-256 hash
   * @returns The full path where the attachment is/would be stored
   */
  getAttachmentPath(contentHash: string): string;

  /**
   * Initializes the storage backend.
   * Called once when the server starts.
   */
  initialize?(): Promise<void>;

  /**
   * Closes the storage backend and cleans up resources.
   * Called when the server shuts down.
   */
  close?(): Promise<void>;
}
