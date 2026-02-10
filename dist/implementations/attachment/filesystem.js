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
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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
export class FilesystemAttachmentStorage {
    storageDir;
    createDirIfMissing;
    /**
     * Creates a new filesystem attachment storage instance.
     *
     * @param options - Configuration options
     */
    constructor(options = {}) {
        this.storageDir = options.storageDir ?? "./data/attachments";
        this.createDirIfMissing = options.createDirIfMissing ?? true;
    }
    /**
     * Initializes the storage directory.
     * Creates the directory if it doesn't exist and createDirIfMissing is true.
     *
     * @throws {Error} If directory creation fails
     */
    async initialize() {
        if (this.createDirIfMissing) {
            await fs.promises.mkdir(this.storageDir, { recursive: true });
            console.log(`📎 Attachment storage initialized: ${this.storageDir}`);
        }
        else if (!fs.existsSync(this.storageDir)) {
            throw new Error(`Attachment storage directory does not exist: ${this.storageDir}`);
        }
    }
    /**
     * Closes the storage backend.
     * No cleanup needed for filesystem storage.
     */
    async close() {
        console.log("📎 Attachment storage closed");
    }
    /**
     * Performs a health check on the storage.
     * Verifies the directory exists and is writable.
     *
     * @returns True if storage is healthy
     */
    async healthCheck() {
        try {
            // Check directory exists
            const stats = await fs.promises.stat(this.storageDir);
            if (!stats.isDirectory()) {
                return false;
            }
            // Check write permission by creating and deleting a test file
            const testFile = path.join(this.storageDir, ".healthcheck");
            await fs.promises.writeFile(testFile, "test");
            await fs.promises.unlink(testFile);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Calculates SHA-256 hash of base64-encoded content.
     *
     * @param base64Content - Base64-encoded content
     * @returns SHA-256 hash in hexadecimal format
     */
    calculateHash(base64Content) {
        const buffer = Buffer.from(base64Content, "base64");
        return crypto.createHash("sha256").update(buffer).digest("hex");
    }
    /**
     * Gets the full filesystem path for a content hash.
     *
     * @param contentHash - The SHA-256 hash
     * @returns Full path to the attachment file
     */
    getAttachmentPath(contentHash) {
        return path.join(this.storageDir, contentHash);
    }
    /**
     * Checks if an attachment with the given hash exists.
     *
     * @param contentHash - The SHA-256 hash to check
     * @returns True if the file exists
     */
    async attachmentExists(contentHash) {
        const filepath = this.getAttachmentPath(contentHash);
        try {
            await fs.promises.access(filepath, fs.constants.F_OK);
            return true;
        }
        catch {
            return false;
        }
    }
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
    async storeAttachment(attachment) {
        // Calculate content hash
        const contentHash = this.calculateHash(attachment.content);
        const filepath = this.getAttachmentPath(contentHash);
        // Only write if file doesn't already exist (deduplication)
        if (!fs.existsSync(filepath)) {
            const buffer = Buffer.from(attachment.content, "base64");
            await fs.promises.writeFile(filepath, buffer);
            console.log(`📎 Stored new attachment: ${attachment.filename} (hash: ${contentHash.substring(0, 8)}...)`);
        }
        else {
            console.log(`📎 Attachment already exists (deduplicated): ${attachment.filename} (hash: ${contentHash.substring(0, 8)}...)`);
        }
        // Calculate size from base64 content
        const size = Buffer.byteLength(attachment.content, "base64");
        return {
            id: attachment.id,
            filename: attachment.filename,
            contentHash,
            size,
            mimeType: attachment.mimeType ?? "application/octet-stream",
            storedAt: new Date(),
        };
    }
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
    async retrieveAttachment(metadata) {
        const filepath = this.getAttachmentPath(metadata.contentHash);
        try {
            const buffer = await fs.promises.readFile(filepath);
            const base64Content = buffer.toString("base64");
            return {
                id: metadata.id,
                filename: metadata.filename,
                content: base64Content,
                size: metadata.size,
                mimeType: metadata.mimeType ?? "application/octet-stream",
            };
        }
        catch (error) {
            throw new Error(`Failed to retrieve attachment ${metadata.filename} (hash: ${metadata.contentHash}): ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
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
    async deleteAttachment(contentHash) {
        const filepath = this.getAttachmentPath(contentHash);
        try {
            await fs.promises.unlink(filepath);
            console.log(`📎 Deleted attachment: ${contentHash.substring(0, 8)}...`);
            return true;
        }
        catch (error) {
            if (error instanceof Error &&
                "code" in error &&
                error.code === "ENOENT") {
                return false;
            }
            throw error;
        }
    }
    /**
     * Gets statistics about the attachment storage.
     * Useful for monitoring and debugging.
     *
     * @returns Storage statistics
     */
    async getStorageStats() {
        try {
            const files = await fs.promises.readdir(this.storageDir);
            let totalSize = 0;
            for (const file of files) {
                if (file === ".healthcheck")
                    continue;
                const filepath = path.join(this.storageDir, file);
                const stats = await fs.promises.stat(filepath);
                totalSize += stats.size;
            }
            return {
                totalAttachments: files.filter((f) => f !== ".healthcheck").length,
                totalSize,
            };
        }
        catch {
            return {
                totalAttachments: 0,
                totalSize: 0,
            };
        }
    }
}
/**
 * Creates a default filesystem attachment storage instance.
 *
 * Uses the default storage directory: ./data/attachments
 *
 * @returns Configured attachment storage instance
 */
export function createDefaultAttachmentStorage() {
    return new FilesystemAttachmentStorage({
        storageDir: "./data/attachments",
        createDirIfMissing: true,
    });
}
//# sourceMappingURL=filesystem.js.map