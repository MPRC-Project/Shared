import type { AdminAuthentication, AttachmentMetadata, FindUserCommand, ListMessagesCommand, LoadAttachmentCommand, Message, ReadMessageCommand, SendMessageCommand, VerifyProtocolCommand } from "../index.js";
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
 * @param email - The email address to look up
 * @returns A new FindUserCommand
 */
export declare function createFindUserCommand(email: string): FindUserCommand;
/**
 * Creates a SEND_MESSAGE command.
 *
 * @param message - The message to send
 * @param adminAuth - Admin authentication object
 * @returns A new SendMessageCommand
 */
export declare function createSendMessageCommand(message: Message, adminAuth: AdminAuthentication): SendMessageCommand;
/**
 * Creates a READ_MESSAGE command.
 *
 * @param messageId - The ID of the message to read
 * @param markAsRead - Whether to mark the message as read (default: false)
 * @param adminAuth - Admin authentication object
 * @returns A new ReadMessageCommand
 */
export declare function createReadMessageCommand(messageId: string, markAsRead: boolean | undefined, adminAuth: AdminAuthentication): ReadMessageCommand;
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
export declare function createListMessagesCommand(email: string, options: {
    folder?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    since?: Date;
    unreadOnly?: boolean;
} | undefined, adminAuth: AdminAuthentication): ListMessagesCommand;
/**
 * Creates a LOAD_ATTACHMENT command.
 *
 * @param attachmentMetadata - The metadata of the attachment to load
 * @param adminAuth - Admin authentication object
 * @returns A new LoadAttachmentCommand
 */
export declare function createLoadAttachmentCommand(attachmentMetadata: AttachmentMetadata, adminAuth: AdminAuthentication): LoadAttachmentCommand;
//# sourceMappingURL=type-factory.d.ts.map