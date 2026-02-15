import type {
  BaseMPRCCommand,
  LoadAttachmentCommand,
  ListMessagesCommand,
  AttachmentMetadata,
  MPRCCommand,
  MPRCCommandName,
  MPRCErrorResponse,
  Message,
  ReadMessageCommand,
  SendMessageCommand,
  VerifyProtocolCommand,
  UserSignInCommand,
  VerifyUserExistanceCommand,
} from "../index.js";

import { MPRC_COMMAND_NAMES } from "../index.js";

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
export function isFindUserCommand(
  data: unknown,
): data is VerifyUserExistanceCommand {
  return (
    isMPRCCommand(data) &&
    data.command === "VERIFY_USER_EXISTENCE" &&
    "email" in data &&
    typeof (data as VerifyUserExistanceCommand).email === "string" &&
    (data as VerifyUserExistanceCommand).email !== ""
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
  return isMPRCCommand(data) && data.command === "LIST_MESSAGES";
}

/**
 * Checks if the given data is a LOAD_ATTACHMENT command.
 *
 * @param data - The data to check
 * @returns True if the data is a LoadAttachmentCommand
 */
export function isLoadAttachmentCommand(
  data: unknown,
): data is LoadAttachmentCommand {
  return (
    isMPRCCommand(data) &&
    data.command === "LOAD_ATTACHMENT" &&
    "attachmentMetadata" in data &&
    typeof (data as LoadAttachmentCommand).attachmentMetadata === "object"
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
 * Checks if the given data is AttachmentMetadata object
 *
 * @param data - The data to check
 * @returns True if the data is an AttachmentMetadata object
 */

export function isAttachmentMetadata(
  data: unknown,
): data is AttachmentMetadata {
  return (
    typeof data === "object" &&
    data !== null &&
    "contentHash" in data &&
    "id" in data &&
    "filename" in data &&
    typeof (data as AttachmentMetadata).contentHash === "string"
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

/**
 * Checks if the given data is a USER_SIGN_IN command.
 *
 * @param data - The data to check
 * @returns True if the data is a UserSignInCommand
 */
export function isUserSignInCommand(data: unknown): data is UserSignInCommand {
  return (
    isMPRCCommand(data) &&
    data.command === "USER_SIGN_IN" &&
    "email" in data &&
    typeof (data as any).email === "string" &&
    "passwordHash" in data &&
    typeof (data as any).passwordHash === "string"
  );
}
