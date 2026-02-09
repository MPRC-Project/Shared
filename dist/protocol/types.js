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
export { isTextElement, isBreakElement, isImageElement, isLinkElement, isListElement, isDivElement, isValidMessageBody, } from "./message-body.js";
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
];
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
        data.command === "FIND_USER" &&
        "email" in data &&
        typeof data.email === "string");
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
    return (isMPRCCommand(data) &&
        data.command === "LIST_MESSAGES" &&
        "email" in data &&
        typeof data.email === "string");
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
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Creates a unique request ID for commands.
 *
 * @returns A UUID string suitable for use as a requestId
 */
export function createRequestId() {
    return crypto.randomUUID();
}
/**
 * Creates a VERIFY command with a new request ID.
 *
 * @returns A new VerifyProtocolCommand
 */
export function createVerifyCommand() {
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
export function createFindUserCommand(email) {
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
export function createSendMessageCommand(message) {
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
export function createReadMessageCommand(messageId, markAsRead = false) {
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
export function createListMessagesCommand(email, options) {
    return {
        command: "LIST_MESSAGES",
        requestId: createRequestId(),
        email,
        ...options,
    };
}
//# sourceMappingURL=types.js.map