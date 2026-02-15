import type { AttachmentMetadata, FindUserCommand, ListMessagesCommand, LoadAttachmentCommand, Message, ReadMessageCommand, SendMessageCommand, UserSignInCommand, VerifyProtocolCommand } from "../index.js";
/**
 * Creates a unique request ID for commands.
 *
 * @returns A UUID string suitable for use as a requestId
 */
export declare function createRequestId(): string;
/**
 * Creates a VERIFY command with a new request ID.
 *
 * @returns A new VerifyProtocolCommand
 */
export declare function createVerifyCommand(): VerifyProtocolCommand;
/**
 * Creates a FIND_USER command.
 *
 * @param params - Object with either email or username
 * @returns A new FindUserCommand
 */
export declare function createFindUserCommand(params: {
    email?: string;
    username?: string;
}): FindUserCommand;
/**
 * Creates a SEND_MESSAGE command.
 *
 * @param message - The message to send
 * @param adminAuth - Admin authentication object
 * @returns A new SendMessageCommand
 */
export declare function createSendMessageCommand(message: Message): Omit<SendMessageCommand, "adminAuth">;
/**
 * Creates a READ_MESSAGE command.
 *
 * @param messageId - The ID of the message to read
 * @param markAsRead - Whether to mark the message as read (default: false)
 * @param adminAuth - Admin authentication object
 * @returns A new ReadMessageCommand
 */
export declare function createReadMessageCommand(messageId: string, markAsRead?: boolean): Omit<ReadMessageCommand, "adminAuth">;
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
export declare function createListMessagesCommand(email: string, options?: {
    folder?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    since?: Date;
    unreadOnly?: boolean;
}): Omit<ListMessagesCommand, "adminAuth">;
/**
 * Creates a LOAD_ATTACHMENT command.
 *
 * @param attachmentMetadata - The metadata of the attachment to load
 * @param adminAuth - Admin authentication object
 * @returns A new LoadAttachmentCommand
 */
export declare function createLoadAttachmentCommand(attachmentMetadata: AttachmentMetadata): Omit<LoadAttachmentCommand, "adminAuth">;
/**
 * Creates a USER_SIGN_IN command.
 *
 * @param username - The user's email or username
 * @param passwordHash - The user's password hash
 * @returns A new UserSignInCommand
 */
export declare function createUserSignInCommand(username: string, passwordHash: string): Omit<UserSignInCommand, "adminAuth">;
//# sourceMappingURL=type-factory.d.ts.map