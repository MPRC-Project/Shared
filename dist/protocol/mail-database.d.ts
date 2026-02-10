/**
 * MPRC Server - Database Interface
 *
 * This file defines the abstract interface for database operations.
 * Implementations can use any backend (in-memory, SQLite, PostgreSQL, etc.)
 * while maintaining a consistent API.
 *
 * @module @mprc/server/database
 */
import type { Message, User } from "./types.js";
/**
 * Result of a paginated query.
 */
export interface PaginatedResult<T> {
    /** Array of items for the current page */
    items: T[];
    /** Total count of items matching the query */
    total: number;
    /** Current page number (1-indexed) */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Whether there are more pages available */
    hasMore: boolean;
}
/**
 * Options for listing messages.
 */
export interface ListMessagesOptions {
    /** Filter by recipient email */
    recipientEmail?: string;
    /** Filter by sender email */
    senderEmail?: string;
    /** Filter: only messages after this date */
    since?: Date;
    /** Filter: only messages before this date */
    before?: Date;
    /** Filter: only unread messages */
    unreadOnly?: boolean;
    /** Folder/mailbox to filter by */
    folder?: string;
    /** Page number (1-indexed) */
    page?: number;
    /** Number of items per page */
    pageSize?: number;
}
/**
 * Abstract database interface for MPRC server.
 *
 * Implement this interface to provide database functionality
 * using any backend storage system.
 *
 * @example
 * ```typescript
 * class PostgresDatabase implements IMPRCDatabase {
 *   async getUserByEmail(email: string): Promise<User | null> {
 *     return await db.query('SELECT * FROM users WHERE email = $1', [email]);
 *   }
 *   // ... implement other methods
 * }
 * ```
 */
export interface IMPRCDatabase {
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
     * @returns The created user with any generated fields
     * @throws If user creation fails (e.g., duplicate email)
     */
    createUser(user: Omit<User, "createdAt">): Promise<User>;
    /**
     * Updates an existing user.
     *
     * @param id - The user's unique identifier
     * @param updates - Partial user data to update
     * @returns The updated user
     * @throws If user not found or update fails
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
     * @returns The stored message with any generated fields
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
     * Lists messages for a user's mailbox.
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
     * Marks a message as read or unread.
     *
     * @param id - The message's unique identifier
     * @param read - Whether to mark as read (true) or unread (false)
     * @returns True if the message was updated
     */
    markMessageRead(id: string, read: boolean): Promise<boolean>;
    /**
     * Initializes the database connection and schema.
     * Called once when the server starts.
     */
    initialize?(): Promise<void>;
    /**
     * Closes the database connection.
     * Called when the server shuts down.
     */
    close?(): Promise<void>;
}
//# sourceMappingURL=mail-database.d.ts.map