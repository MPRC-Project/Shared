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
import type { Message, User } from "@mprc/shared";
import type { IMPRCDatabase, ListMessagesOptions, PaginatedResult } from "../../protocol/mail-database.js";
import type { IAttachmentStorage } from "../../protocol/attachment.js";
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
export declare class InMemoryDatabase implements IMPRCDatabase {
    /** Map of user ID to User object */
    private users;
    /** Map of email to user ID for quick lookup */
    private emailIndex;
    /** Map of message ID to Message object */
    private messages;
    /** Map of recipient email to set of message IDs */
    private recipientIndex;
    /** Track read status of messages */
    private readStatus;
    /** Map of message ID to attachment metadata arrays */
    private attachmentMetadata;
    /** Reference to the attachment storage system */
    private attachmentStorage?;
    /**
     * Initializes the in-memory database.
     * For in-memory implementation, this is a no-op but included for interface compatibility.
     */
    initialize(): Promise<void>;
    /**
     * Sets the attachment storage system to use.
     * Should be called during initialization.
     */
    setAttachmentStorage(storage: IAttachmentStorage): void;
    /**
     * Closes the database (clears all data).
     */
    close(): Promise<void>;
    /**
     * Health check - always returns true for in-memory database.
     */
    healthCheck(): Promise<boolean>;
    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address to look up
     * @returns The user if found, null otherwise
     */
    getUserByEmail(email: string): Promise<User | null>;
    /**
     * Retrieves a user by their unique ID.
     *
     * @param id - The user's unique identifier
     * @returns The user if found, null otherwise
     */
    getUserById(id: string): Promise<User | null>;
    /**
     * Creates a new user.
     *
     * @param user - The user data to create
     * @returns The created user with createdAt timestamp
     * @throws Error if email is already registered
     */
    createUser(user: Omit<User, "createdAt">): Promise<User>;
    /**
     * Updates an existing user.
     *
     * @param id - The user's unique identifier
     * @param updates - Partial user data to update
     * @returns The updated user
     * @throws Error if user not found
     */
    updateUser(id: string, updates: Partial<Omit<User, "id">>): Promise<User>;
    /**
     * Checks if a user with the given email exists.
     *
     * @param email - The email address to check
     * @returns True if the user exists
     */
    userExists(email: string): Promise<boolean>;
    /**
     * Stores a new message.
     *
     * @param message - The message to store
     * @returns The stored message with receivedAt timestamp
     */
    storeMessage(message: Message): Promise<Message>;
    /**
     * Retrieves a message by its unique ID.
     *
     * @param id - The message's unique identifier
     * @returns The message if found, null otherwise
     */
    getMessageById(id: string): Promise<Message | null>;
    /**
     * Lists messages for a user's mailbox with filtering and pagination.
     *
     * @param email - The user's email address
     * @param options - Filtering and pagination options
     * @returns Paginated list of messages
     */
    listMessages(email: string, options?: ListMessagesOptions): Promise<PaginatedResult<Message>>;
    /**
     * Retrieves all messages sent to a specific email address.
     *
     * @param email - The recipient's email address
     * @returns Array of messages
     */
    getMessagesForUser(email: string): Promise<Message[]>;
    /**
     * Deletes a message by its unique ID.
     *
     * @param id - The message's unique identifier
     * @returns True if the message was deleted, false if not found
     */
    deleteMessage(id: string): Promise<boolean>;
    /**
     * Gets the reference count for an attachment hash.
     */
    getAttachmentReferenceCount(contentHash: string): Promise<number>;
    /**
     * Marks a message as read or unread.
     *
     * @param id - The message's unique identifier
     * @param read - Whether to mark as read (true) or unread (false)
     * @returns True if the message was updated
     */
    markMessageRead(id: string, read: boolean): Promise<boolean>;
    /**
     * Returns the total number of users.
     */
    getUserCount(): number;
    /**
     * Returns the total number of messages.
     */
    getMessageCount(): number;
    /**
     * Clears all data (useful for testing).
     */
    clear(): Promise<void>;
}
/**
 * Default database instance for the server.
 * Pre-populated with test users for development.
 */
export declare function createDefaultDatabase(): InMemoryDatabase;
//# sourceMappingURL=memory.d.ts.map