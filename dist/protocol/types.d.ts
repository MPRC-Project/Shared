/**
 * MPRC Protocol - Type Definitions
 *
 * This file contains all type definitions for the MPRC (Mail Protocol ReCreated)
 * protocol. Types are organized into:
 *
 * 1. Core Data Types - Basic data structures (Message, User, etc.)
 * 2. Command Types - Request types sent from client to server
 * 3. Response Types - Response types sent from server to client
 * 4. Union Types - Combined types for generic handling
 * 5. Type Guards - Runtime type checking utilities
 *
 * @module protocol/types
 */
import type { AttachmentMetadata } from "./attachment.js";
import type { MessageBody } from "./message-body.js";
export type { MessageBody, MessageBodyElement } from "./message-body.js";
export { isTextElement, isBreakElement, isImageElement, isLinkElement, isListElement, isDivElement, isValidMessageBody, } from "./message-body.js";
/**
 * Represents an email message in the MPRC protocol.
 *
 * @example
 * ```typescript
 * const message: Message = {
 *   id: crypto.randomUUID(),
 *   from: "sender@example.com",
 *   to: "recipient@example.com",
 *   subject: "Hello World",
 *   body: [
 *     { tag: "h1", content: "Welcome!" },
 *     { tag: "p", content: "This is the message body." },
 *   ],
 * };
 * ```
 */
export interface Message {
    /** Unique identifier for the message (UUID recommended) */
    id: string;
    /** Sender's email address */
    from: string;
    /** Recipient's email address */
    to: string;
    /** Message subject line */
    subject: string;
    /** Message body content as structured elements */
    body: MessageBody;
    /** Optional timestamp when the message was sent */
    sentAt?: Date;
    /** Optional timestamp when the message was received */
    receivedAt?: Date;
    /** Optional array of attachment references */
    attachments?: MessageAttachment[];
    /** Optional message headers for extensibility */
    headers?: Record<string, string>;
    /** Optional parameter, references the ID of the message this is a response to */
    responseTo?: string;
    /** Optional array of tags associated with the message */
    tags?: string[];
    /** Optional folder or mailbox where the message is stored */
    folder?: string;
}
/**
 * Represents a message attachment during transmission.
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
    size?: number;
    /**
     * MIME type of the attachment.
     * Reserved for future use - not currently validated.
     */
    mimeType?: string;
}
/**
 * Represents a user in the MPRC system.
 */
export interface User {
    /** Unique identifier for the user */
    id: string;
    /** User's email address */
    email: string;
    /** User's display name */
    displayName?: string;
    /** Account creation timestamp */
    createdAt?: Date;
}
/**
 * Base interface for all MPRC commands.
 * All commands must include a unique request ID for request-response matching.
 */
export interface BaseMPRCCommand {
    /** The command type identifier */
    command: string;
    /** Unique request identifier for matching responses (UUID recommended) */
    requestId: string;
}
/**
 * Base interface for all MPRC responses.
 * All responses include the original request ID for matching.
 */
export interface BaseMPRCResponse {
    /** The request ID this response corresponds to */
    responseId: string;
}
/**
 * Error response returned when a command fails.
 */
export interface MPRCErrorResponse extends BaseMPRCResponse {
    /** Error code for programmatic handling */
    error: string;
    /** Human-readable error message */
    message: string;
    /** Optional additional error details */
    details?: Record<string, unknown>;
}
/**
 * Command to verify that a server supports the MPRC protocol.
 * Should be the first command sent when establishing a connection.
 *
 * @example
 * ```typescript
 * const command: VerifyProtocolCommand = {
 *   command: "VERIFY",
 *   requestId: crypto.randomUUID(),
 * };
 * ```
 */
export interface VerifyProtocolCommand extends BaseMPRCCommand {
    command: "VERIFY";
}
/**
 * Response to the VERIFY command.
 * Contains protocol identification and version information.
 */
export interface VerifyProtocolCommandResponse extends BaseMPRCResponse {
    /** Protocol identifier - always "MPRC" for valid servers */
    status: "MPRC";
    /** Server's protocol version */
    version: string;
    /** Optional server capabilities for future extensibility */
    capabilities?: string[];
}
/**
 * Command to check if a user exists on the server.
 *
 * @example
 * ```typescript
 * const command: FindUserCommand = {
 *   command: "FIND_USER",
 *   requestId: crypto.randomUUID(),
 *   email: "user@example.com",
 * };
 * ```
 */
export interface FindUserCommand extends BaseMPRCCommand {
    command: "FIND_USER";
    /** Email address to look up */
    email: string;
}
/**
 * Response to the FIND_USER command.
 */
export interface FindUserCommandResponse extends BaseMPRCResponse {
    /** Whether the user was found */
    found: boolean;
    /** Optional user display name if found and public */
    displayName?: string | undefined;
}
/**
 * Command to send a message to a recipient.
 *
 * @example
 * ```typescript
 * const command: SendMessageCommand = {
 *   command: "SEND_MESSAGE",
 *   requestId: crypto.randomUUID(),
 *   message: {
 *     id: crypto.randomUUID(),
 *     from: "sender@example.com",
 *     to: "recipient@example.com",
 *     subject: "Hello",
 *     body: "Message content",
 *   },
 * };
 * ```
 */
export interface SendMessageCommand extends BaseMPRCCommand {
    command: "SEND_MESSAGE";
    /** The message to send */
    message: Message;
}
/**
 * Response to the SEND_MESSAGE command.
 */
export interface SendMessageCommandResponse extends BaseMPRCResponse {
    /** Whether the message was accepted for delivery */
    success: boolean;
    /** Optional message ID assigned by the receiving server */
    assignedId?: string | undefined;
    /** Optional delivery timestamp */
    deliveredAt?: Date | undefined;
}
/**
 * Command to list messages in a mailbox.
 *
 * This command retrieves a paginated list of message summaries from the user's
 * mailbox. Supports filtering by folder, tags, date range, and read status.
 *
 * @example
 * ```typescript
 * // List all messages in inbox (first page)
 * const command: ListMessagesCommand = {
 *   command: "LIST_MESSAGES",
 *   requestId: crypto.randomUUID(),
 *   email: "user@example.com",
 *   folder: "inbox",
 *   limit: 20,
 *   offset: 0,
 * };
 * ```
 */
export interface ListMessagesCommand extends BaseMPRCCommand {
    command: "LIST_MESSAGES";
    /**
     * Email address of the user whose messages to list.
     * This identifies the mailbox to query.
     */
    email: string;
    /**
     * Filter by folder/mailbox name.
     * Common values: "inbox", "sent", "drafts", "trash", "spam".
     * If omitted, returns messages from all folders.
     */
    folder?: string;
    /**
     * Filter by message tags.
     * Returns only messages that have ALL specified tags.
     * If omitted, no tag filtering is applied.
     */
    tags?: string[];
    /**
     * Maximum number of messages to return.
     * Used for pagination. Server may impose a maximum limit.
     * @default 50
     */
    limit?: number;
    /**
     * Offset for pagination.
     * Number of messages to skip before returning results.
     * Use with `limit` for paginated access.
     * @default 0
     */
    offset?: number;
    /**
     * Filter: only messages received after this date.
     * Useful for syncing or fetching recent messages.
     */
    since?: Date;
    /**
     * Filter: only unread messages.
     * When true, returns only messages that have not been marked as read.
     * @default false
     */
    unreadOnly?: boolean;
}
/**
 * Response to the LIST_MESSAGES command.
 *
 * Contains a paginated array of message summaries along with
 * pagination metadata.
 */
export interface ListMessagesCommandResponse extends BaseMPRCResponse {
    /**
     * Array of message summaries.
     * Contains lightweight message data suitable for listing.
     * Use READ_MESSAGE command to fetch full message content.
     */
    messages: Array<{
        /** Unique message identifier */
        id: string;
        /** Sender's email address */
        from: string;
        /** Message subject line */
        subject: string;
        /** Timestamp when the message was received */
        receivedAt: Date;
        /** Whether the message has been read */
        read: boolean;
    }>;
    /**
     * Total number of messages matching the query.
     * This is the total count before pagination is applied.
     */
    total: number;
    /**
     * Whether there are more messages available.
     * When true, increment `offset` by `limit` to fetch the next page.
     */
    hasMore: boolean;
}
/**
 * Command to read specific message from a mailbox.
 *
 * This command retrieves a full message by its ID, optionally marking it as read.
 *
 * @example
 * ```typescript
 * // Read a specific message by ID
 * const command: ReadMessageCommand = {
 *   command: "READ_MESSAGE",
 *   requestId: crypto.randomUUID(),
 *   messageId: "12345",
 *   markAsRead: true,
 * ```
 */
export interface ReadMessageCommand extends BaseMPRCCommand {
    command: "READ_MESSAGE";
    /** ID of the message to read */
    messageId: string;
    /** Whether to mark the message as read */
    markAsRead?: boolean;
}
/**
 * Response to the READ_MESSAGE command.
 * Contains the full message content.
 */
export interface ReadMessageCommandResponse extends BaseMPRCResponse {
    /** The full message content */
    message: Message;
    /** Whether the message was found */
    found: boolean;
}
/**
 * Command to load attachment for message
 *
 */
export interface LoadAttachmentCommand extends BaseMPRCCommand {
    command: "LOAD_ATTACHMENT";
    /** Metadata of the attachment to load */
    attachmentMetadata: AttachmentMetadata;
}
export interface LoadAttachmentCommandResponse extends BaseMPRCResponse, MessageAttachment {
}
/**
 * Command to delete a message.
 * @future This command is planned for future implementation.
 */
export interface DeleteMessageCommand extends BaseMPRCCommand {
    command: "DELETE_MESSAGE";
    /** ID of the message to delete */
    messageId: string;
    /** Whether to permanently delete or move to trash */
    permanent?: boolean;
}
/**
 * Response to the DELETE_MESSAGE command.
 * @future This response type is planned for future implementation.
 */
export interface DeleteMessageCommandResponse extends BaseMPRCResponse {
    /** Whether the deletion was successful */
    success: boolean;
}
/**
 * All valid MPRC command names.
 */
export declare const MPRC_COMMAND_NAMES: readonly ["VERIFY", "FIND_USER", "SEND_MESSAGE", "LIST_MESSAGES", "READ_MESSAGE", "LOAD_ATTACHMENT"];
/**
 * Type representing any valid MPRC command name.
 */
export type MPRCCommandName = (typeof MPRC_COMMAND_NAMES)[number];
/**
 * Union type of all possible MPRC commands.
 * Add new command types here as they are implemented.
 */
export type MPRCCommand = VerifyProtocolCommand | FindUserCommand | SendMessageCommand | ListMessagesCommand | ReadMessageCommand | LoadAttachmentCommand;
/**
 * Union type of all possible MPRC command responses.
 * Add new response types here as they are implemented.
 */
export type MPRCCommandResponse = VerifyProtocolCommandResponse | FindUserCommandResponse | SendMessageCommandResponse | MPRCErrorResponse | ListMessagesCommandResponse | ReadMessageCommandResponse | LoadAttachmentCommandResponse;
/**
 * Checks if the given data is a valid MPRC command.
 *
 * @param data - The data to check
 * @returns True if the data is a valid MPRC command
 *
 * @example
 * ```typescript
 * const data = JSON.parse(receivedData);
 * if (isMPRCCommand(data)) {
 *   // data is now typed as MPRCCommand
 *   console.log(data.command);
 * }
 * ```
 */
export declare function isMPRCCommand(data: unknown): data is MPRCCommand;
/**
 * Checks if the given data is a VERIFY command.
 *
 * @param data - The data to check
 * @returns True if the data is a VerifyProtocolCommand
 */
export declare function isVerifyCommand(data: unknown): data is VerifyProtocolCommand;
/**
 * Checks if the given data is a FIND_USER command.
 *
 * @param data - The data to check
 * @returns True if the data is a FindUserCommand
 */
export declare function isFindUserCommand(data: unknown): data is FindUserCommand;
/**
 * Checks if the given data is a SEND_MESSAGE command.
 *
 * @param data - The data to check
 * @returns True if the data is a SendMessageCommand
 */
export declare function isSendMessageCommand(data: unknown): data is SendMessageCommand;
/**
 * Checks if the given data is a LIST_MESSAGES command.
 *
 * @param data - The data to check
 * @returns True if the data is a ListMessagesCommand
 *
 */
export declare function isListMessagesCommand(data: unknown): data is ListMessagesCommand;
/**
 * Checks if the given data is a LOAD_ATTACHMENT command.
 *
 * @param data - The data to check
 * @returns True if the data is a LoadAttachmentCommand
 */
export declare function isLoadAttachmentCommand(data: unknown): data is LoadAttachmentCommand;
/**
 * Checks if the given data is a READ_MESSAGE command.
 *
 * @param data - The data to check
 * @returns True if the data is a ReadMessageCommand
 */
export declare function isReadMessageCommand(data: unknown): data is ReadMessageCommand;
/**
 * Checks if the given data is a valid Message object.
 *
 * @param data - The data to check
 * @returns True if the data is a valid Message
 */
export declare function isValidMessage(data: unknown): data is Message;
/**
 * Checks if the given data is an MPRC error response.
 *
 * @param data - The data to check
 * @returns True if the data is an MPRCErrorResponse
 */
export declare function isErrorResponse(data: unknown): data is MPRCErrorResponse;
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
 * @returns A new SendMessageCommand
 */
export declare function createSendMessageCommand(message: Message): SendMessageCommand;
/**
 * Creates a READ_MESSAGE command.
 *
 * @param messageId - The ID of the message to read
 * @param markAsRead - Whether to mark the message as read (default: false)
 * @returns A new ReadMessageCommand
 */
export declare function createReadMessageCommand(messageId: string, markAsRead?: boolean): ReadMessageCommand;
/**
 * Creates a LIST_MESSAGES command.
 * Supports optional filtering and pagination parameters.
 * @param email - The email address of the mailbox to list messages from
 * @param options - Optional filtering and pagination options
 * @returns A new ListMessagesCommand
 * @example
 * // List first 20 messages in inbox
 * createListMessagesCommand("user@example.com", { limit: 20 });
 */
export declare function createListMessagesCommand(email: string, options?: {
    folder?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    since?: Date;
    unreadOnly?: boolean;
}): ListMessagesCommand;
/**
 * Creates a LOAD_ATTACHMENT command.
 *
 * @param contentHash - The content hash of the attachment to load
 * @returns A new LoadAttachmentCommand
 */
export declare function createLoadAttachmentCommand(attachmentMetadata: AttachmentMetadata): LoadAttachmentCommand;
//# sourceMappingURL=types.d.ts.map