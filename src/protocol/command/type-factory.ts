import type {
  AttachmentMetadata,
  FindUserCommand,
  ListMessagesCommand,
  LoadAttachmentCommand,
  Message,
  ReadMessageCommand,
  SendMessageCommand,
  VerifyProtocolCommand,
} from "../index.js";
import crypto from "node:crypto";

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

/**
 * Creates a READ_MESSAGE command.
 *
 * @param messageId - The ID of the message to read
 * @param markAsRead - Whether to mark the message as read (default: false)
 * @returns A new ReadMessageCommand
 */
export function createReadMessageCommand(
  messageId: string,
  markAsRead: boolean = false,
): ReadMessageCommand {
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
 * @returns A new ListMessagesCommand
 * @example
 * // List first 20 messages in inbox
 * createListMessagesCommand("user@example.com", { limit: 20 });
 */

export function createListMessagesCommand(
  email: string,
  options?: {
    folder?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    since?: Date;
    unreadOnly?: boolean;
  },
): ListMessagesCommand {
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
 * @param contentHash - The content hash of the attachment to load
 * @returns A new LoadAttachmentCommand
 */
export function createLoadAttachmentCommand(
  attachmentMetadata: AttachmentMetadata,
): LoadAttachmentCommand {
  return {
    command: "LOAD_ATTACHMENT",
    requestId: createRequestId(),
    attachmentMetadata,
  };
}
