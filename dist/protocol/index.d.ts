/**
 * MPRC Protocol Module
 *
 * This module exports all protocol types, errors, and utilities.
 *
 * @module protocol
 */
export * from "./message/index.js";
export * from "./storage/index.js";
export * from "./user/index.js";
export * from "./command/index.js";
export type { IMailDatabase, ListMessagesOptions, PaginatedResult, } from "./storage/mail-storage.js";
export { MPRCError, NetworkError, DnsResolutionError, ConnectionError, TimeoutError, InvalidJsonError, InvalidCommandError, UnknownCommandError, ProtocolVerificationError, InvalidEmailError, UserNotFoundError, MessageNotFoundError, SenderVerificationError, AttachmentNotFoundError, MessageDeliveryError, } from "./errors.js";
//# sourceMappingURL=index.d.ts.map