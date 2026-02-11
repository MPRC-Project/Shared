/**
 * MPRC Server - In-Memory Database Implementation
 *
 * A simple in-memory implementation of the database interface.
 * Suitable for development, testing, and single-instance deployments.
 *
 * NOTE: Data is not persisted and will be lost when the server restarts.
 *
 * @module @mprc/server/database
 */

import type {
  IMailDatabase,
  User,
  Message,
  StoredMessage,
  AttachmentMetadata,
  IAttachmentStorage,
  ListMessagesOptions,
  PaginatedResult,
} from "../../protocol/index.js";
/**
 * In-memory database implementation for the MPRC server.
 *
 * This implementation stores all data in memory using Maps and Arrays.
 * It's ideal for development and testing but should not be used in
 * production environments where data persistence is required.
 *
 * @example
 * ```typescript
 * const db = new InMemoryDatabase();
 * await db.initialize();
 *
 * // Create a user
 * const user = await db.createUser({
 *   id: crypto.randomUUID(),
 *   email: "user@example.com",
 * });
 *
 * // Store a message
 * await db.storeMessage({
 *   id: crypto.randomUUID(),
 *   from: "sender@example.com",
 *   to: "user@example.com",
 *   subject: "Hello",
 *   body: [{ tag: "p", content: "World" }],
 * });
 * ```
 */
export class InMemoryMailDatabase implements IMailDatabase {
  /** Map of user ID to User object */
  private users: Map<string, User> = new Map();
  /** Map of email to user ID for quick lookup */
  private emailIndex: Map<string, string> = new Map();
  /** Map of message ID to Message object */
  private messages: Map<string, StoredMessage> = new Map();
  /** Map of recipient email to set of message IDs */
  private recipientIndex: Map<string, Set<string>> = new Map();
  /** Track read status of messages */
  private readStatus: Map<string, boolean> = new Map();

  /** Reference to the attachment storage system */
  private attachmentStorage?: IAttachmentStorage;

  // =========================================================================
  // Lifecycle Operations
  // =========================================================================

  /**
   * Initializes the in-memory database.
   * For in-memory implementation, this is a no-op but included for interface compatibility.
   */
  async initialize(): Promise<void> {
    console.log("📦 In-memory database initialized");
  }

  /**
   * Sets the attachment storage system to use.
   * Should be called during initialization.
   */
  setAttachmentStorage(storage: IAttachmentStorage): void {
    this.attachmentStorage = storage;
  }

  /**
   * Closes the database (clears all data).
   */
  async close(): Promise<void> {
    this.users.clear();
    this.emailIndex.clear();
    this.messages.clear();
    this.recipientIndex.clear();
    this.readStatus.clear();
    console.log("📦 In-memory database closed");
  }

  // =========================================================================
  // Message Operations
  // =========================================================================

  /**
   * Stores a new message.
   *
   * @param message - The message to store
   * @returns The stored message with receivedAt timestamp
   */
  async storeMessage(message: Message): Promise<StoredMessage> {
    const { attachments, ...messageWithoutAttachments } = message;
    const storedMessage: StoredMessage = {
      ...messageWithoutAttachments,
      receivedAt: new Date(),
    };

    // Process attachments if present
    if (attachments && attachments.length > 0) {
      if (!this.attachmentStorage) {
        throw new Error(
          "Attachment storage not configured but message has attachments",
        );
      }

      const metadataArray: AttachmentMetadata[] = [];

      for (const attachment of attachments) {
        if (!attachment.content) {
          throw new Error(
            `Attachment ${attachment.id} is missing content field`,
          );
        }

        // Ensure mimeType is always a string
        const mimeType = attachment.mimeType ?? "application/octet-stream";

        // Store the attachment and get metadata
        const metadata = await this.attachmentStorage.storeAttachment({
          id: attachment.id,
          filename: attachment.filename,
          content: attachment.content,
          mimeType,
        });

        metadataArray.push(metadata);
      }

      storedMessage.attachments = metadataArray;
    }

    this.messages.set(message.id, storedMessage);
    this.readStatus.set(message.id, false);

    // Index by recipient
    const recipientEmail = message.to.toLowerCase();

    if (!this.recipientIndex.has(recipientEmail)) {
      this.recipientIndex.set(recipientEmail, new Set());
    }
    this.recipientIndex.get(recipientEmail)!.add(message.id);

    return storedMessage;
  }

  /**
   * Retrieves a message by its unique ID.
   *
   * @param id - The message's unique identifier
   * @returns The message if found, null otherwise
   */
  async getMessageById(id: string): Promise<StoredMessage | null> {
    const message = this.messages.get(id);
    if (!message) {
      return null;
    }

    return message;
  }

  /**
   * Lists messages for a user's mailbox with filtering and pagination.
   *
   * @param email - The user's email address
   * @param options - Filtering and pagination options
   * @returns Paginated list of messages
   */
  async listMessages(
    email: string,
    options: ListMessagesOptions = {},
  ): Promise<PaginatedResult<StoredMessage>> {
    const {
      page = 1,
      pageSize = 20,
      since,
      before,
      unreadOnly,
      senderEmail,
    } = options;

    const recipientEmail = email.toLowerCase();
    const messageIds = this.recipientIndex.get(recipientEmail) ?? new Set();

    let messages: StoredMessage[] = [];

    for (const id of messageIds) {
      const message = this.messages.get(id);
      if (!message) continue;

      // Apply filters
      if (since && message.receivedAt && message.receivedAt < since) continue;
      if (before && message.receivedAt && message.receivedAt > before) continue;
      if (unreadOnly && this.readStatus.get(id) === true) continue;
      if (
        senderEmail &&
        message.from.toLowerCase() !== senderEmail.toLowerCase()
      )
        continue;

      messages.push(message);
    }

    // Sort by receivedAt descending (newest first)
    messages.sort((a, b) => {
      const dateA = a.receivedAt?.getTime() ?? 0;
      const dateB = b.receivedAt?.getTime() ?? 0;
      return dateB - dateA;
    });

    const total = messages.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMessages = messages.slice(startIndex, endIndex);

    return {
      items: paginatedMessages,
      total,
      page,
      pageSize,
      hasMore: endIndex < total,
    };
  }

  /**
   * Retrieves all messages sent to a specific email address.
   *
   * @param email - The recipient's email address
   * @returns Array of messages
   */
  async getMessagesForUser(user: User): Promise<StoredMessage[]> {
    const recipientEmail = user.email.toLowerCase();
    const messageIds = this.recipientIndex.get(recipientEmail) ?? new Set();

    const messages: StoredMessage[] = [];
    for (const id of messageIds) {
      const message = await this.getMessageById(id); // Use updated method
      if (message) {
        messages.push(message);
      }
    }

    return messages.sort((a, b) => {
      const dateA = a.receivedAt?.getTime() ?? 0;
      const dateB = b.receivedAt?.getTime() ?? 0;
      return dateB - dateA;
    });
  }

  /**
   * Deletes a message by its unique ID.
   *
   * @param id - The message's unique identifier
   * @returns True if the message was deleted, false if not found
   */
  async deleteMessage(id: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) {
      return false;
    }

    // Remove from indices
    const recipientEmail = message.to.toLowerCase();
    this.recipientIndex.get(recipientEmail)?.delete(id);

    this.messages.delete(id);
    this.readStatus.delete(id);

    return true;
  }

  /**
   * Marks a message as read or unread.
   *
   * @param id - The message's unique identifier
   * @param read - Whether to mark as read (true) or unread (false)
   * @returns True if the message was updated
   */
  async markMessageRead(id: string, read: boolean): Promise<boolean> {
    if (!this.messages.has(id)) {
      return false;
    }
    this.readStatus.set(id, read);
    return true;
  }

  // =========================================================================
  // Utility Methods (for testing/debugging)
  // =========================================================================

  /**
   * Returns the total number of users.
   */
  getUserCount(): number {
    return this.users.size;
  }

  /**
   * Returns the total number of messages.
   */
  getMessageCount(): number {
    return this.messages.size;
  }

  /**
   * Clears all data (useful for testing).
   */
  async clear(): Promise<void> {
    this.users.clear();
    this.emailIndex.clear();
    this.messages.clear();
    this.recipientIndex.clear();
    this.readStatus.clear();
  }
}

/**
 * Default database instance for the server.
 * Pre-populated with test users for development.
 */
export function createDefaultMailDatabase(): InMemoryMailDatabase {
  const db = new InMemoryMailDatabase();
  return db;
}
