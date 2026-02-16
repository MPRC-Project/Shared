import type { LoadAttachmentCommand, ListMessagesCommand, AttachmentMetadata, MPRCCommand, MPRCErrorResponse, Message, ReadMessageCommand, SendMessageCommand, VerifyProtocolCommand, UserSignInCommand, VerifyUserExistanceCommand, RefreshUserSessionCommand } from "../index.js";
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
export declare function isFindUserCommand(data: unknown): data is VerifyUserExistanceCommand;
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
 * Checks if the given data is AttachmentMetadata object
 *
 * @param data - The data to check
 * @returns True if the data is an AttachmentMetadata object
 */
export declare function isAttachmentMetadata(data: unknown): data is AttachmentMetadata;
/**
 * Checks if the given data is an MPRC error response.
 *
 * @param data - The data to check
 * @returns True if the data is an MPRCErrorResponse
 */
export declare function isErrorResponse(data: unknown): data is MPRCErrorResponse;
/**
 * Checks if the given data is a USER_SIGN_IN command.
 *
 * @param data - The data to check
 * @returns True if the data is a UserSignInCommand
 */
export declare function isUserSignInCommand(data: unknown): data is UserSignInCommand;
/**
 * Checks if the given data is a REFRESH_USER_SESSION command.
 *
 * @param data - The data to check
 * @returns True if the data is a RefreshUserSessionCommand
 */
export declare function isRefreshUserSessionCommand(data: unknown): data is RefreshUserSessionCommand;
//# sourceMappingURL=type-guards.d.ts.map