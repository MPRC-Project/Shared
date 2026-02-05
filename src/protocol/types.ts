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

import type { MessageBody } from "./message-body.js";

// Re-export message body types for convenience
export type { MessageBody, MessageBodyElement } from "./message-body.js";
export {
  isTextElement,
  isBreakElement,
  isImageElement,
  isLinkElement,
  isListElement,
  isDivElement,
  isValidMessageBody,
} from "./message-body.js";

// ============================================================================
// Core Data Types
// ============================================================================

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
 * Represents a message attachment.
 * Prepared for future attachment support.
 */
export interface MessageAttachment {
  /** Unique identifier for the attachment */
  id: string;
  /** Original filename */
  filename: string;
  /** MIME type of the attachment */
  mimeType: string;
  /** Size in bytes */
  size: number;
  /** Base64 encoded content or reference URL */
  content?: string;
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

// ============================================================================
// Base Command/Response Interfaces
// ============================================================================

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

// ============================================================================
// VERIFY Command - Protocol Handshake
// ============================================================================

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

// ============================================================================
// FIND_USER Command - User Lookup
// ============================================================================

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

// ============================================================================
// SEND_MESSAGE Command - Message Delivery
// ============================================================================

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

// ============================================================================
// Future Commands (Prepared Interfaces)
// ============================================================================

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

// ============================================================================
// Union Types
// ============================================================================

/**
 * All valid MPRC command names.
 */
export const MPRC_COMMAND_NAMES = [
  "VERIFY",
  "FIND_USER",
  "SEND_MESSAGE",
  "LIST_MESSAGES",
  "READ_MESSAGE",
  // Future commands (uncomment when implemented):
  // "DELETE_MESSAGE",
] as const;

/**
 * Type representing any valid MPRC command name.
 */
export type MPRCCommandName = (typeof MPRC_COMMAND_NAMES)[number];

/**
 * Union type of all possible MPRC commands.
 * Add new command types here as they are implemented.
 */
export type MPRCCommand =
  | VerifyProtocolCommand
  | FindUserCommand
  | SendMessageCommand
  | ListMessagesCommand
  | ReadMessageCommand;
// Future commands (uncomment when implemented):
// | DeleteMessageCommand;

/**
 * Union type of all possible MPRC command responses.
 * Add new response types here as they are implemented.
 */
export type MPRCCommandResponse =
  | VerifyProtocolCommandResponse
  | FindUserCommandResponse
  | SendMessageCommandResponse
  | MPRCErrorResponse
  | ListMessagesCommandResponse
  | ReadMessageCommandResponse;
// Future responses (uncomment when implemented):
// | DeleteMessageCommandResponse;

// ============================================================================
// Type Guards
// ============================================================================

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
export function isMPRCCommand(data: unknown): data is MPRCCommand {
  return (
    typeof data === "object" &&
    data !== null &&
    "command" in data &&
    typeof (data as BaseMPRCCommand).command === "string" &&
    "requestId" in data &&
    typeof (data as BaseMPRCCommand).requestId === "string" &&
    MPRC_COMMAND_NAMES.includes(
      (data as BaseMPRCCommand).command as MPRCCommandName,
    )
  );
}

/**
 * Checks if the given data is a VERIFY command.
 *
 * @param data - The data to check
 * @returns True if the data is a VerifyProtocolCommand
 */
export function isVerifyCommand(data: unknown): data is VerifyProtocolCommand {
  return isMPRCCommand(data) && data.command === "VERIFY";
}

/**
 * Checks if the given data is a FIND_USER command.
 *
 * @param data - The data to check
 * @returns True if the data is a FindUserCommand
 */
export function isFindUserCommand(data: unknown): data is FindUserCommand {
  return (
    isMPRCCommand(data) &&
    data.command === "FIND_USER" &&
    "email" in data &&
    typeof (data as FindUserCommand).email === "string"
  );
}

/**
 * Checks if the given data is a SEND_MESSAGE command.
 *
 * @param data - The data to check
 * @returns True if the data is a SendMessageCommand
 */
export function isSendMessageCommand(
  data: unknown,
): data is SendMessageCommand {
  return (
    isMPRCCommand(data) &&
    data.command === "SEND_MESSAGE" &&
    "message" in data &&
    isValidMessage((data as SendMessageCommand).message)
  );
}

/**
 * Checks if the given data is a LIST_MESSAGES command.
 *
 * @param data - The data to check
 * @returns True if the data is a ListMessagesCommand
 *
 */

export function isListMessagesCommand(
  data: unknown,
): data is ListMessagesCommand {
  return (
    isMPRCCommand(data) &&
    data.command === "LIST_MESSAGES" &&
    "email" in data &&
    typeof (data as ListMessagesCommand).email === "string"
  );
}

/**
 * Checks if the given data is a READ_MESSAGE command.
 *
 * @param data - The data to check
 * @returns True if the data is a ReadMessageCommand
 */

export function isReadMessageCommand(
  data: unknown,
): data is ReadMessageCommand {
  return (
    isMPRCCommand(data) &&
    data.command === "READ_MESSAGE" &&
    "messageId" in data &&
    typeof (data as ReadMessageCommand).messageId === "string"
  );
}

/**
 * Checks if the given data is a valid Message object.
 *
 * @param data - The data to check
 * @returns True if the data is a valid Message
 */
export function isValidMessage(data: unknown): data is Message {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const msg = data as Message;
  return (
    typeof msg.id === "string" &&
    typeof msg.from === "string" &&
    typeof msg.to === "string" &&
    typeof msg.subject === "string" &&
    Array.isArray(msg.body)
  );
}

/**
 * Checks if the given data is an MPRC error response.
 *
 * @param data - The data to check
 * @returns True if the data is an MPRCErrorResponse
 */
export function isErrorResponse(data: unknown): data is MPRCErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "responseId" in data &&
    "error" in data &&
    typeof (data as MPRCErrorResponse).error === "string"
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a unique request ID for commands.
 *
 * @returns A UUID string suitable for use as a requestId
 */
export function createRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Creates a VERIFY command with a new request ID.
 *
 * @returns A new VerifyProtocolCommand
 */
export function createVerifyCommand(): VerifyProtocolCommand {
  return {
    command: "VERIFY",
    requestId: createRequestId(),
  };
}

/**
 * Creates a FIND_USER command.
 *
 * @param email - The email address to look up
 * @returns A new FindUserCommand
 */
export function createFindUserCommand(email: string): FindUserCommand {
  return {
    command: "FIND_USER",
    requestId: createRequestId(),
    email,
  };
}

/**
 * Creates a SEND_MESSAGE command.
 *
 * @param message - The message to send
 * @returns A new SendMessageCommand
 */
export function createSendMessageCommand(message: Message): SendMessageCommand {
  return {
    command: "SEND_MESSAGE",
    requestId: createRequestId(),
    message,
  };
}
