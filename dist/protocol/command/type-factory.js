import crypto from "node:crypto";
/**
 * Creates a unique request ID for commands.
 *
 * @returns A UUID string suitable for use as a requestId
 */
export function createRequestId() {
    return crypto.randomUUID();
}
/**
 * Creates a VERIFY command with a new request ID.
 *
 * @returns A new VerifyProtocolCommand
 */
export function createVerifyCommand() {
    return {
        command: "VERIFY",
        requestId: createRequestId(),
    };
}
/**
 * Creates a VERIFY_USER_EXISTENCE command.
 * @param email - The email address to verify
 * @returns A new VerifyUserExistanceCommand
 */
export function createVerifyUserExistanceCommand(email) {
    return {
        command: "VERIFY_USER_EXISTENCE",
        requestId: createRequestId(),
        email: email,
    };
}
/**
 * Creates a SEND_MESSAGE command.
 *
 * @param message - The message to send
 * @param adminAuth - Admin authentication object
 * @returns A new SendMessageCommand
 */
export function createSendMessageCommand(message) {
    return {
        command: "SEND_MESSAGE",
        requestId: createRequestId(),
        message,
    };
}
/**
 * Creates a READ_MESSAGE command.
 *
 * @param messageId - The ID of the message to read
 * @param markAsRead - Whether to mark the message as read (default: false)
 * @param adminAuth - Admin authentication object
 * @returns A new ReadMessageCommand
 */
export function createReadMessageCommand(messageId, markAsRead = false) {
    return {
        command: "READ_MESSAGE",
        requestId: createRequestId(),
        messageId,
        markAsRead,
    };
}
/**
 * Creates a LIST_MESSAGES command.
 * Supports optional filtering and pagination parameters.
 * @param email - The email address of the mailbox to list messages from
 * @param options - Optional filtering and pagination options
 * @param adminAuth - Admin authentication object
 * @returns A new ListMessagesCommand
 * @example
 * // List first 20 messages in inbox
 * createListMessagesCommand("user@example.com", { limit: 20 }, adminAuth);
 */
export function createListMessagesCommand(email, options = {}) {
    return {
        command: "LIST_MESSAGES",
        requestId: createRequestId(),
        email,
        ...options,
    };
}
/**
 * Creates a LOAD_ATTACHMENT command.
 *
 * @param attachmentMetadata - The metadata of the attachment to load
 * @param adminAuth - Admin authentication object
 * @returns A new LoadAttachmentCommand
 */
export function createLoadAttachmentCommand(attachmentMetadata) {
    return {
        command: "LOAD_ATTACHMENT",
        requestId: createRequestId(),
        attachmentMetadata,
    };
}
/**
 * Creates a USER_SIGN_IN command.
 *
 * @param email - The user's email address
 * @param passwordHash - The user's password hash
 * @returns A new UserSignInCommand
 */
export function createUserSignInCommand(email, passwordHash) {
    return {
        command: "USER_SIGN_IN",
        requestId: createRequestId(),
        email,
        passwordHash,
    };
}
/**
 * Creates a CREATE_USER command.
 *
 * @param email - The new user's email address
 * @param passwordHash - The new user's password hash
 *
 */
export function createCreateUserCommand(email, passwordHash) {
    return {
        command: "CREATE_USER",
        requestId: createRequestId(),
        email,
        passwordHash,
    };
}
//# sourceMappingURL=type-factory.js.map