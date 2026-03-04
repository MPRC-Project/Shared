/**
 * MPRC - Attachment Storage Interface
 *
 * Defines the interface for storing and retrieving message attachments.
 * Implementations can use different storage backends (filesystem, S3, etc.)
 * while maintaining a consistent API.
 *
 */

/**
 * Represents a full message attachment with its content.
 */

export interface MessageAttachment {
  /** Unique identifier for this attachment */
  id: string;

  /** Original filename of the attachment */
  filename: string;

  /**
   * Base64-encoded blob data.
   * Required when sendin
   */
  content: string;

  /** Size of the attachment in bytes */
  size?: number | undefined;

  /**
   * MIME type of the attachment.
   * Reserved for future use - not currently validated.
   */
  mimeType?: string | undefined;
}

/**
 * Metadata about a stored attachment.
 * This information is stored in the database alongside the message.
 */
export interface AttachmentMetadata {
  /** Unique identifier for this attachment */
  id: string;
  /** Original filename provided by the sender */
  filename: string;
  /** SHA-256 hash of the attachment content (used as storage filename) */
  contentHash: string;
  /** Size of the attachment in bytes */
  size: number;
  /** MIME type of the attachment (reserved for future use) */
  mimeType?: string | undefined;
}
