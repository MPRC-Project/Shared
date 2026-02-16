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
export function isMPRCCommand(data) {
    return (typeof data === "object" &&
        data !== null &&
        "command" in data &&
        typeof data.command === "string" &&
        "requestId" in data &&
        typeof data.requestId === "string" &&
        MPRC_COMMAND_NAMES.includes(data.command));
}
/**
 * Checks if the given data is a VERIFY command.
 *
 * @param data - The data to check
 * @returns True if the data is a VerifyProtocolCommand
 */
export function isVerifyCommand(data) {
    return isMPRCCommand(data) && data.command === "VERIFY";
}
/**
 * Checks if the given data is a FIND_USER command.
 *
 * @param data - The data to check
 * @returns True if the data is a FindUserCommand
 */
export function isFindUserCommand(data) {
    return (isMPRCCommand(data) &&
        data.command === "VERIFY_USER_EXISTENCE" &&
        "email" in data &&
        typeof data.email === "string" &&
        data.email !== "");
}
/**
 * Checks if the given data is a SEND_MESSAGE command.
 *
 * @param data - The data to check
 * @returns True if the data is a SendMessageCommand
 */
export function isSendMessageCommand(data) {
    return (isMPRCCommand(data) &&
        data.command === "SEND_MESSAGE" &&
        "message" in data &&
        isValidMessage(data.message));
}
/**
 * Checks if the given data is a LIST_MESSAGES command.
 *
 * @param data - The data to check
 * @returns True if the data is a ListMessagesCommand
 *
 */
export function isListMessagesCommand(data) {
    return isMPRCCommand(data) && data.command === "LIST_MESSAGES";
}
/**
 * Checks if the given data is a LOAD_ATTACHMENT command.
 *
 * @param data - The data to check
 * @returns True if the data is a LoadAttachmentCommand
 */
export function isLoadAttachmentCommand(data) {
    return (isMPRCCommand(data) &&
        data.command === "LOAD_ATTACHMENT" &&
        "attachmentMetadata" in data &&
        typeof data.attachmentMetadata === "object");
}
/**
 * Checks if the given data is a READ_MESSAGE command.
 *
 * @param data - The data to check
 * @returns True if the data is a ReadMessageCommand
 */
export function isReadMessageCommand(data) {
    return (isMPRCCommand(data) &&
        data.command === "READ_MESSAGE" &&
        "messageId" in data &&
        typeof data.messageId === "string");
}
/**
 * Checks if the given data is a valid Message object.
 *
 * @param data - The data to check
 * @returns True if the data is a valid Message
 */
export function isValidMessage(data) {
    if (typeof data !== "object" || data === null) {
        return false;
    }
    const msg = data;
    return (typeof msg.id === "string" &&
        typeof msg.from === "string" &&
        typeof msg.to === "string" &&
        typeof msg.subject === "string" &&
        Array.isArray(msg.body));
}
/**
 * Checks if the given data is AttachmentMetadata object
 *
 * @param data - The data to check
 * @returns True if the data is an AttachmentMetadata object
 */
export function isAttachmentMetadata(data) {
    return (typeof data === "object" &&
        data !== null &&
        "contentHash" in data &&
        "id" in data &&
        "filename" in data &&
        typeof data.contentHash === "string");
}
/**
 * Checks if the given data is an MPRC error response.
 *
 * @param data - The data to check
 * @returns True if the data is an MPRCErrorResponse
 */
export function isErrorResponse(data) {
    return (typeof data === "object" &&
        data !== null &&
        "responseId" in data &&
        "error" in data &&
        typeof data.error === "string");
}
/**
 * Checks if the given data is a USER_SIGN_IN command.
 *
 * @param data - The data to check
 * @returns True if the data is a UserSignInCommand
 */
export function isUserSignInCommand(data) {
    return (isMPRCCommand(data) &&
        data.command === "USER_SIGN_IN" &&
        "email" in data &&
        typeof data.email === "string" &&
        "passwordHash" in data &&
        typeof data.passwordHash === "string");
}
/**
 * Checks if the given data is a REFRESH_USER_SESSION command.
 *
 * @param data - The data to check
 * @returns True if the data is a RefreshUserSessionCommand
 */
export function isRefreshUserSessionCommand(data) {
    return (isMPRCCommand(data) &&
        data.command === "REFRESH_USER_SESSION" &&
        "refreshToken" in data &&
        typeof data.refreshToken === "string");
}
//# sourceMappingURL=type-guards.js.map