/**
 * MPRC Server - Filesystem Attachment Storage
 *
 * Implements attachment storage using the local filesystem with
 * content-addressable storage (files named by their SHA-256 hash).
 *
 * This provides automatic deduplication - identical files are stored
 * only once regardless of how many messages reference them.
 *
 * @module @mprc/server/attachments
 */
import type { IAttachmentStorage, StoredAttachmentMetadata } from "../../protocol/attachment.js";
import type { MessageAttachment } from "../../protocol/types.js";
/**
 * Configuration options for filesystem storage.
 */
export interface FilesystemStorageOptions {
    /**
     * Root directory for attachment storage.
     * Defaults to "./data/attachments"
     */
    storageDir?: string;
    /**
     * Whether to create the storage directory if it doesn't exist.
     * Defaults to true
     */
    createDirIfMissing?: boolean;
}
/**
 * Filesystem-based implementation of attachment storage.
 *
 * This implementation:
 * - Stores attachments in a local directory
 * - Uses SHA-256 hash as filename for content-addressable storage
 * - Automatically deduplicates identical attachments
 * - Handles base64 encoding/decoding
 *
 * @example
 * ```typescript
 * const storage = new FilesystemAttachmentStorage({
 *   storageDir: "./data/attachments",
 * });
 *
 * await storage.initialize();
 *
 * // Store an attachment
 * const metadata = await storage.storeAttachment({
 *   id: crypto.randomUUID(),
 *   filename: "document.pdf",
 *   content: base64EncodedData,
 * });
 *
 * // Retrieve it later
 * const attachment = await storage.retrieveAttachment(metadata);
 * ```
 */
export declare class FilesystemAttachmentStorage implements IAttachmentStorage {
    private storageDir;
    private createDirIfMissing;
    /**
     * Creates a new filesystem attachment storage instance.
     *
     * @param options - Configuration options
     */
    constructor(options?: FilesystemStorageOptions);
    /**
     * Initializes the storage directory.
     * Creates the directory if it doesn't exist and createDirIfMissing is true.
     *
     * @throws {Error} If directory creation fails
     */
    initialize(): Promise<void>;
    /**
     * Closes the storage backend.
     * No cleanup needed for filesystem storage.
     */
    close(): Promise<void>;
    /**
     * Performs a health check on the storage.
     * Verifies the directory exists and is writable.
     *
     * @returns True if storage is healthy
     */
    healthCheck(): Promise<boolean>;
    /**
     * Calculates SHA-256 hash of base64-encoded content.
     *
     * @param base64Content - Base64-encoded content
     * @returns SHA-256 hash in hexadecimal format
     */
    private calculateHash;
    /**
     * Gets the full filesystem path for a content hash.
     *
     * @param contentHash - The SHA-256 hash
     * @returns Full path to the attachment file
     */
    getAttachmentPath(contentHash: string): string;
    /**
     * Checks if an attachment with the given hash exists.
     *
     * @param contentHash - The SHA-256 hash to check
     * @returns True if the file exists
     */
    attachmentExists(contentHash: string): Promise<boolean>;
    /**
     * Stores an attachment using content-addressable storage.
     *
     * Process:
     * 1. Calculate SHA-256 hash of the content
     * 2. Check if file with this hash already exists
     * 3. If not, decode base64 and write to disk
     * 4. Return metadata with hash for database storage
     *
     * @param attachment - The incoming attachment to store
     * @returns Metadata about the stored attachment
     * @throws {Error} If file write fails
     */
    storeAttachment(attachment: MessageAttachment): Promise<StoredAttachmentMetadata>;
    /**
     * Retrieves an attachment by its content hash.
     *
     * Process:
     * 1. Locate file using the content hash
     * 2. Read file contents
     * 3. Encode to base64
     * 4. Return with metadata
     *
     * @param metadata - The stored attachment metadata
     * @returns The attachment with blob content
     * @throws {Error} If file not found or read fails
     */
    retrieveAttachment(metadata: StoredAttachmentMetadata): Promise<MessageAttachment>;
    /**
     * Deletes an attachment from storage.
     *
     * WARNING: This should only be called after verifying that no messages
     * reference this attachment hash. The caller is responsible for
     * reference counting.
     *
     * @param contentHash - The SHA-256 hash of the attachment to delete
     * @returns True if the attachment was deleted, false if not found
     */
    deleteAttachment(contentHash: string): Promise<boolean>;
    /**
     * Gets statistics about the attachment storage.
     * Useful for monitoring and debugging.
     *
     * @returns Storage statistics
     */
    getStorageStats(): Promise<{
        totalAttachments: number;
        totalSize: number;
    }>;
}
/**
 * Creates a default filesystem attachment storage instance.
 *
 * Uses the default storage directory: ./data/attachments
 *
 * @returns Configured attachment storage instance
 */
export declare function createDefaultAttachmentStorage(): FilesystemAttachmentStorage;
//# sourceMappingURL=memory.d.ts.map