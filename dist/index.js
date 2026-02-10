/**
 * @mprc/shared - Shared Types and Utilities for MPRC Protocol
 *
 * This package provides the common types, constants, errors, and utilities
 * that are shared between @mprc/client and @mprc/server packages.
 *
 * @module @mprc/shared
 *
 * @example
 * ```typescript
 * import {
 *   type Message,
 *   type MPRCCommand,
 *   MPRC_PORT,
 *   MPRCConnection,
 *   createRequestId,
 * } from "@mprc/shared";
 *
 * const message: Message = {
 *   id: createRequestId(),
 *   from: "sender@example.com",
 *   to: "recipient@example.com",
 *   subject: "Hello",
 *   body: [{ tag: "p", content: "Hello World!" }],
 * };
 * ```
 */
// ============================================================================
// Constants
// ============================================================================
export { MPRC_PORT, MPRC_PROTOCOL_VERSION, MPRC_PROTOCOL_IDENTIFIER, DEFAULT_TIMEOUT_MS, CONNECTION_TIMEOUT_MS, } from "./constants.js";
export { sizeToCSS, spacingToCSS, borderRadiusToCSS, elementStyleToCSS, blockStyleToCSS, listStyleToCSS, } from "./protocol/index.js";
export { isTextElement, isBreakElement, isImageElement, isLinkElement, isListElement, isDivElement, isValidMessageBody, } from "./protocol/index.js";
export { MPRC_COMMAND_NAMES, isMPRCCommand, isVerifyCommand, isFindUserCommand, isSendMessageCommand, isValidMessage, isErrorResponse, isLoadAttachmentCommand, createRequestId, createVerifyCommand, createFindUserCommand, createSendMessageCommand, createListMessagesCommand, createReadMessageCommand, createLoadAttachmentCommand, } from "./protocol/index.js";
// Errors
export { MPRCError, NetworkError, DnsResolutionError, ConnectionError, TimeoutError, InvalidJsonError, InvalidCommandError, UnknownCommandError, ProtocolVerificationError, InvalidEmailError, UserNotFoundError, SenderVerificationError, MessageDeliveryError, } from "./protocol/index.js";
export { messageBodyToHTML, messageBodyToHTMLDocument, messageToHTML, } from "./protocol/index.js";
export { MPRCConnection, extractDomainFromEmail, resolveDomain, resolveEmailToServerAddress, sendSingleCommand, } from "./network/index.js";
//# sourceMappingURL=index.js.map