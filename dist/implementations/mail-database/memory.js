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
export class InMemoryDatabase {
    /** Map of user ID to User object */
    users = new Map();
    /** Map of email to user ID for quick lookup */
    emailIndex = new Map();
    /** Map of message ID to Message object */
    messages = new Map();
    /** Map of recipient email to set of message IDs */
    recipientIndex = new Map();
    /** Track read status of messages */
    readStatus = new Map();
    /** Reference to the attachment storage system */
    attachmentStorage;
    // =========================================================================
    // Lifecycle Operations
    // =========================================================================
    /**
     * Initializes the in-memory database.
     * For in-memory implementation, this is a no-op but included for interface compatibility.
     */
    async initialize() {
        console.log("📦 In-memory database initialized");
    }
    /**
     * Sets the attachment storage system to use.
     * Should be called during initialization.
     */
    setAttachmentStorage(storage) {
        this.attachmentStorage = storage;
    }
    /**
     * Closes the database (clears all data).
     */
    async close() {
        this.users.clear();
        this.emailIndex.clear();
        this.messages.clear();
        this.recipientIndex.clear();
        this.readStatus.clear();
        console.log("📦 In-memory database closed");
    }
    /**
     * Health check - always returns true for in-memory database.
     */
    async healthCheck() {
        return true;
    }
    // =========================================================================
    // User Operations
    // =========================================================================
    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address to look up
     * @returns The user if found, null otherwise
     */
    async getUserByEmail(email) {
        const userId = this.emailIndex.get(email.toLowerCase());
        if (!userId) {
            return null;
        }
        return this.users.get(userId) ?? null;
    }
    /**
     * Retrieves a user by their unique ID.
     *
     * @param id - The user's unique identifier
     * @returns The user if found, null otherwise
     */
    async getUserById(id) {
        return this.users.get(id) ?? null;
    }
    /**
     * Creates a new user.
     *
     * @param user - The user data to create
     * @returns The created user with createdAt timestamp
     * @throws Error if email is already registered
     */
    async createUser(user) {
        const email = user.email.toLowerCase();
        if (this.emailIndex.has(email)) {
            throw new Error(`User with email ${email} already exists`);
        }
        const newUser = {
            ...user,
            email,
            createdAt: new Date(),
        };
        this.users.set(user.id, newUser);
        this.emailIndex.set(email, user.id);
        this.recipientIndex.set(email, new Set());
        return newUser;
    }
    /**
     * Updates an existing user.
     *
     * @param id - The user's unique identifier
     * @param updates - Partial user data to update
     * @returns The updated user
     * @throws Error if user not found
     */
    async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        // If email is being updated, update the index
        if (updates.email && updates.email.toLowerCase() !== user.email) {
            const newEmail = updates.email.toLowerCase();
            if (this.emailIndex.has(newEmail)) {
                throw new Error(`Email ${newEmail} is already in use`);
            }
            this.emailIndex.delete(user.email);
            this.emailIndex.set(newEmail, id);
            // Move messages to new email index
            const messageIds = this.recipientIndex.get(user.email);
            if (messageIds) {
                this.recipientIndex.delete(user.email);
                this.recipientIndex.set(newEmail, messageIds);
            }
        }
        const updatedUser = {
            ...user,
            ...updates,
            email: (updates.email ?? user.email).toLowerCase(),
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    /**
     * Checks if a user with the given email exists.
     *
     * @param email - The email address to check
     * @returns True if the user exists
     */
    async userExists(email) {
        return this.emailIndex.has(email.toLowerCase());
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
    async storeMessage(message) {
        const { attachments, ...messageWithoutAttachments } = message;
        const storedMessage = {
            ...messageWithoutAttachments,
            receivedAt: new Date(),
        };
        // Process attachments if present
        if (attachments && attachments.length > 0) {
            if (!this.attachmentStorage) {
                throw new Error("Attachment storage not configured but message has attachments");
            }
            const metadataArray = [];
            for (const attachment of attachments) {
                if (!attachment.content) {
                    throw new Error(`Attachment ${attachment.id} is missing content field`);
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
        this.recipientIndex.get(recipientEmail).add(message.id);
        return storedMessage;
    }
    /**
     * Retrieves a message by its unique ID.
     *
     * @param id - The message's unique identifier
     * @returns The message if found, null otherwise
     */
    async getMessageById(id) {
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
    async listMessages(email, options = {}) {
        const { page = 1, pageSize = 20, since, before, unreadOnly, senderEmail, } = options;
        const recipientEmail = email.toLowerCase();
        const messageIds = this.recipientIndex.get(recipientEmail) ?? new Set();
        let messages = [];
        for (const id of messageIds) {
            const message = this.messages.get(id);
            if (!message)
                continue;
            // Apply filters
            if (since && message.receivedAt && message.receivedAt < since)
                continue;
            if (before && message.receivedAt && message.receivedAt > before)
                continue;
            if (unreadOnly && this.readStatus.get(id) === true)
                continue;
            if (senderEmail &&
                message.from.toLowerCase() !== senderEmail.toLowerCase())
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
    async getMessagesForUser(email) {
        const recipientEmail = email.toLowerCase();
        const messageIds = this.recipientIndex.get(recipientEmail) ?? new Set();
        const messages = [];
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
    async deleteMessage(id) {
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
    async markMessageRead(id, read) {
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
    getUserCount() {
        return this.users.size;
    }
    /**
     * Returns the total number of messages.
     */
    getMessageCount() {
        return this.messages.size;
    }
    /**
     * Clears all data (useful for testing).
     */
    async clear() {
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
export function createDefaultDatabase() {
    const db = new InMemoryDatabase();
    return db;
}
//# sourceMappingURL=memory.js.map