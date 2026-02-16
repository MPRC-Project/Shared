import type {
  AdminAuthentication,
  AttachmentMetadata,
  CreateUserCommand,
  ListMessagesCommand,
  LoadAttachmentCommand,
  Message,
  ReadMessageCommand,
  RefreshUserSessionCommand,
  SendMessageCommand,
  UserSignInCommand,
  VerifyProtocolCommand,
  VerifyUserExistanceCommand,
} from "../index.js";
import crypto from "node:crypto";
import type { JWTToken } from "../user/user.js";

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
 * Creates a VERIFY_USER_EXISTENCE command.
 * @param email - The email address to verify
 * @returns A new VerifyUserExistanceCommand
 */
export function createVerifyUserExistanceCommand(
  email: string,
): VerifyUserExistanceCommand {
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
 * @param jwtToken - The user's JWT token
 * @returns A new SendMessageCommand
 */
export function createSendMessageCommand(
  message: Message,
  jwtToken: JWTToken,
): Omit<SendMessageCommand, "adminAuth"> {
  return {
    command: "SEND_MESSAGE",
    requestId: createRequestId(),
    message,
    jwtToken,
  };
}

/**
 * Creates a READ_MESSAGE command.
 *
 * @param messageId - The ID of the message to read
 * @param markAsRead - Whether to mark the message as read (default: false)
 * @param jwtToken - The user's JWT token
 * @returns A new ReadMessageCommand
 */
export function createReadMessageCommand(
  messageId: string,
  jwtToken: JWTToken,
  markAsRead: boolean = false,
): Omit<ReadMessageCommand, "adminAuth"> {
  return {
    command: "READ_MESSAGE",
    requestId: createRequestId(),
    messageId,
    markAsRead,
    jwtToken,
  };
}

/**
 * Creates a LIST_MESSAGES command.
 * Supports optional filtering and pagination parameters.
 * @param email - The email address of the mailbox to list messages from
 * @param options - Optional filtering and pagination options
 * @param adminAuth - Admin authentication object
 * @param jwtToken - The user's JWT token
 * @returns A new ListMessagesCommand
 * @example
 * // List first 20 messages in inbox
 * createListMessagesCommand("user@example.com", { limit: 20 }, adminAuth);
 */
export function createListMessagesCommand(
  jwtToken: JWTToken,
  options: {
    folder?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    since?: Date;
    unreadOnly?: boolean;
  } = {},
): Omit<ListMessagesCommand, "adminAuth"> {
  return {
    command: "LIST_MESSAGES",
    requestId: createRequestId(),
    jwtToken: jwtToken,
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
export function createLoadAttachmentCommand(
  attachmentMetadata: AttachmentMetadata,
): Omit<LoadAttachmentCommand, "adminAuth"> {
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
export function createUserSignInCommand(
  email: string,
  password: string,
): Omit<UserSignInCommand, "adminAuth"> {
  return {
    command: "USER_SIGN_IN",
    requestId: createRequestId(),
    email,
    password,
  };
}

/**
 * Creates a CREATE_USER command.
 *
 * @param email - The new user's email address
 * @param passwordHash - The new user's password hash
 *
 * @return A new CreateUserCommand
 *
 */
export function createCreateUserCommand(
  email: string,
  passwordHash: string,
): Omit<CreateUserCommand, "adminAuth"> {
  return {
    command: "CREATE_USER",
    requestId: createRequestId(),
    email,
    passwordHash,
  };
}

/**
 *
 * Creates a REFRESH_USER_SESSION command.
 *
 * @param refreshToken
 * @returns a new RefreshUserSessionCommand
 */
export function createRefreshUserSessionCommand(
  refreshToken: string,
): Omit<RefreshUserSessionCommand, "adminAuth"> {
  return {
    command: "REFRESH_USER_SESSION",
    requestId: createRequestId(),
    refreshToken,
  };
}
