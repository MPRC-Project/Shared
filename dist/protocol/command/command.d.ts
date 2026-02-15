import type { AttachmentMetadata, Message, MessageAttachment, StoredMessage } from "../message/index.js";
import type { JWTToken } from "../user/user.js";
/**
 * Admin authentication using public/private key cryptography.
 * Similar to SSH key authentication - the server stores admin public keys,
 * and clients must sign requests with their private keys.
 *
 * This is distinct from future user authentication (which will use JWT tokens).
 * Admin authentication is for server-to-server communication and administrative
 * operations, while user authentication will be for end-user actions.
 *
 * @example
 * ```typescript
 * const adminAuth: AdminAuthentication = {
 *   publicKey: "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
 *   signature: "base64-encoded-signature",
 *   timestamp: Date.now(),
 * };
 * ```
 */
export interface AdminAuthentication {
    /**
     * The admin public key in PEM format.
     * Must match one of the keys configured in the server's adminKeys.
     */
    publicKey: string;
    /**
     * Base64-encoded signature of the command payload.
     * Created by signing the stringified command (excluding adminAuth) with the private key.
     */
    signature: string;
    /**
     * Unix timestamp in milliseconds when the signature was created.
     * Used to prevent replay attacks (server rejects signatures older than a threshold).
     */
    timestamp: number;
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
 * This command does NOT require admin authentication.
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
 * This command does NOT require admin authentication as it's used
 * for sender verification during message delivery.
 *
 * @example
 * ```typescript
 * const command: VerifyUserExistance = {
 *   command: "VERIFY_USER_EXISTENCE",
 *   requestId: crypto.randomUUID(),
 *   email: "user@example.com",
 * };
 * ```
 */
export interface VerifyUserExistanceCommand extends BaseMPRCCommand {
    command: "VERIFY_USER_EXISTENCE";
    /** Email address to look up */
    email: string;
}
/**
 * Response to the VERIFY_USER_EXISTENCE command.
 */
export interface VerifyUserExistanceCommandResponse extends BaseMPRCResponse {
    /** Whether the user was found */
    found: boolean;
}
/**
 * Command to send a message to a recipient.
 *
 * REQUIRES ADMIN AUTHENTICATION: This command must include valid adminAuth.
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
 *     body: [{ tag: "p", content: "Message content" }],
 *   },
 *   adminAuth: {
 *     publicKey: "-----BEGIN PUBLIC KEY-----\n...",
 *     signature: "base64-signature",
 *     timestamp: Date.now(),
 *   },
 * };
 * ```
 */
export interface SendMessageCommand extends BaseMPRCCommand {
    command: "SEND_MESSAGE";
    /** The message to send */
    message: Message;
    /** Admin authentication (required) */
    adminAuth: AdminAuthentication;
    /** User's JWT token */
    jwtToken: JWTToken;
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
 * REQUIRES ADMIN AUTHENTICATION: This command must include valid adminAuth.
 *
 * This command retrieves a paginated list of message summaries from the user's
 * mailbox. Supports filtering by folder, tags, date range, and read status.
 *
 * @example
 * ```typescript
 * const command: ListMessagesCommand = {
 *   command: "LIST_MESSAGES",
 *   requestId: crypto.randomUUID(),
 *   email: "user@example.com",
 *   folder: "inbox",
 *   limit: 20,
 *   offset: 0,
 *   adminAuth: {
 *     publicKey: "-----BEGIN PUBLIC KEY-----\n...",
 *     signature: "base64-signature",
 *     timestamp: Date.now(),
 *   },
 * };
 * ```
 */
export interface ListMessagesCommand extends BaseMPRCCommand {
    command: "LIST_MESSAGES";
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
    /** Admin authentication (required) */
    adminAuth: AdminAuthentication;
    /** User's JWT token */
    jwtToken: JWTToken;
}
/**
 * Response to the LIST_MESSAGES command.
 */
export interface ListMessagesCommandResponse extends BaseMPRCResponse {
    /**
     * Array of message summaries.
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
     */
    total: number;
    /**
     * Whether there are more messages available.
     */
    hasMore: boolean;
}
/**
 * Command to read specific message from a mailbox.
 *
 * REQUIRES ADMIN AUTHENTICATION: This command must include valid adminAuth.
 *
 * @example
 * ```typescript
 * const command: ReadMessageCommand = {
 *   command: "READ_MESSAGE",
 *   requestId: crypto.randomUUID(),
 *   messageId: "12345",
 *   markAsRead: true,
 *   adminAuth: {
 *     publicKey: "-----BEGIN PUBLIC KEY-----\n...",
 *     signature: "base64-signature",
 *     timestamp: Date.now(),
 *   },
 *  jwtToken: {
 *    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *    expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
 *  },
 * };
 * ```
 */
export interface ReadMessageCommand extends BaseMPRCCommand {
    command: "READ_MESSAGE";
    /** ID of the message to read */
    messageId: string;
    /** Whether to mark the message as read */
    markAsRead?: boolean;
    /** Admin authentication (required) */
    adminAuth: AdminAuthentication;
    /** User's JWT token */
    jwtToken: JWTToken;
}
/**
 * Response to the READ_MESSAGE command.
 */
export interface ReadMessageCommandResponse extends BaseMPRCResponse {
    /** The full message content */
    message: StoredMessage;
    /** Whether the message was found */
    found: boolean;
}
/**
 * Command to load attachment for message.
 *
 * REQUIRES ADMIN AUTHENTICATION: This command must include valid adminAuth.
 *
 * @example
 * ```typescript
 * const command: LoadAttachmentCommand = {
 *   command: "LOAD_ATTACHMENT",
 *   requestId: crypto.randomUUID(),
 *   attachmentMetadata: {
 *     id: "attachment-id",
 *     filename: "document.pdf",
 *     contentHash: "sha256-hash",
 *     size: 1024,
 *   },
 *   adminAuth: {
 *     publicKey: "-----BEGIN PUBLIC KEY-----\n...",
 *     signature: "base64-signature",
 *     timestamp: Date.now(),
 *   },
 * };
 * ```
 */
export interface LoadAttachmentCommand extends BaseMPRCCommand {
    command: "LOAD_ATTACHMENT";
    /** Metadata of the attachment to load */
    attachmentMetadata: AttachmentMetadata;
    /** Admin authentication (required) */
    adminAuth: AdminAuthentication;
}
/**
 * Response to the LOAD_ATTACHMENT command.
 */
export interface LoadAttachmentCommandResponse extends BaseMPRCResponse {
    /** The loaded attachment with content */
    attachment: MessageAttachment;
}
/**
 * Command to create a new user account.
 *
 */
export interface CreateUserCommand extends BaseMPRCCommand {
    command: "CREATE_USER";
    /** User's email address */
    email: string;
    /** User's password hash (server will not store plaintext passwords) */
    passwordHash: string;
    /** Admin authentication (required) */
    adminAuth: AdminAuthentication;
}
/**
 * Response to the CREATE_USER command.
 **/
export interface CreateUserCommandResponse extends BaseMPRCResponse {
    /** Whether the user creation was successful */
    success: boolean;
    /** Optional user ID of the newly created user */
    userId?: string;
}
/**
 * Command for user sign-in
 */
export interface UserSignInCommand extends BaseMPRCCommand {
    command: "USER_SIGN_IN";
    /** User's email address */
    email: string;
    /** User's password hash */
    passwordHash?: string;
    /** Admin authentication (required) */
    adminAuth?: AdminAuthentication;
}
export interface UserSignInCommandResponse extends BaseMPRCResponse {
    /** Whether the sign-in was successful */
    success: boolean;
    /** Optional JWT token for authenticated sessions */
    token?: JWTToken;
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
    /** Admin authentication (required) */
    adminAuth: AdminAuthentication;
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
export declare const MPRC_COMMAND_NAMES: readonly ["VERIFY", "VERIFY_USER_EXISTENCE", "SEND_MESSAGE", "LIST_MESSAGES", "READ_MESSAGE", "LOAD_ATTACHMENT", "CREATE_USER", "USER_SIGN_IN"];
/**
 * Type representing any valid MPRC command name.
 */
export type MPRCCommandName = (typeof MPRC_COMMAND_NAMES)[number];
/**
 * Union type of all possible MPRC commands.
 */
export type MPRCCommand = VerifyProtocolCommand | VerifyUserExistanceCommand | SendMessageCommand | ListMessagesCommand | ReadMessageCommand | LoadAttachmentCommand | CreateUserCommand | UserSignInCommand;
/**
 * Union type of all possible MPRC command responses.
 */
export type MPRCCommandResponse = VerifyProtocolCommandResponse | VerifyUserExistanceCommandResponse | SendMessageCommandResponse | MPRCErrorResponse | ListMessagesCommandResponse | ReadMessageCommandResponse | LoadAttachmentCommandResponse | CreateUserCommandResponse | UserSignInCommandResponse;
//# sourceMappingURL=command.d.ts.map