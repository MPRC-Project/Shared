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

export {
  MPRC_PORT,
  MPRC_PROTOCOL_VERSION,
  MPRC_PROTOCOL_IDENTIFIER,
  DEFAULT_TIMEOUT_MS,
  CONNECTION_TIMEOUT_MS,
} from "./constants.js";

// ============================================================================
// Protocol Types
// ============================================================================

// Style Types
export type {
  SizeUnit,
  SizeValue,
  ColorValue,
  SpacingValue,
  SpacingIndividual,
  SpacingShorthand,
  BorderRadiusValue,
  BorderRadiusIndividual,
  UnorderedListStyleType,
  OrderedListStyleType,
  ListStyleType,
  ListStylePosition,
  ListStyle,
  ElementStyle,
  BlockElementStyle,
  ListElementStyle,
  ImageElementStyle,
} from "./protocol/index.js";

export {
  sizeToCSS,
  spacingToCSS,
  borderRadiusToCSS,
  elementStyleToCSS,
  blockStyleToCSS,
  listStyleToCSS,
} from "./protocol/index.js";

// Message Body Types
export type {
  MessageBodyTag,
  TextTag,
  BaseElement,
  TextElement,
  H1Element,
  H2Element,
  H3Element,
  ParagraphElement,
  BoldElement,
  ItalicElement,
  UnderlineElement,
  StrikeElement,
  CodeElement,
  PreElement,
  BlockquoteElement,
  BreakElement,
  ImageElement,
  ImageFromUrl,
  ImageFromAttachment,
  LinkElement,
  UnorderedListElement,
  OrderedListElement,
  ListItemElement,
  ListItemWithText,
  ListItemWithChildren,
  ListItemChildElement,
  DivElement,
  DivChildElement,
  ListElement,
  MessageBodyElement,
  MessageBody,
} from "./protocol/index.js";

export {
  isTextElement,
  isBreakElement,
  isImageElement,
  isLinkElement,
  isListElement,
  isDivElement,
  isValidMessageBody,
} from "./protocol/index.js";

// Core Types
export type {
  Message,
  MessageAttachment,
  User,
  BaseMPRCCommand,
  BaseMPRCResponse,
  MPRCErrorResponse,
  VerifyProtocolCommand,
  VerifyProtocolCommandResponse,
  FindUserCommand,
  FindUserCommandResponse,
  SendMessageCommand,
  SendMessageCommandResponse,
  ListMessagesCommand,
  ListMessagesCommandResponse,
  ReadMessageCommand,
  ReadMessageCommandResponse,
  LoadAttachmentCommand,
  LoadAttachmentCommandResponse,
  DeleteMessageCommand,
  DeleteMessageCommandResponse,
  MPRCCommand,
  MPRCCommandResponse,
  MPRCCommandName,
} from "./protocol/index.js";

export {
  MPRC_COMMAND_NAMES,
  isMPRCCommand,
  isVerifyCommand,
  isFindUserCommand,
  isSendMessageCommand,
  isValidMessage,
  isErrorResponse,
  isLoadAttachmentCommand,
  isAttachmentMetadata,
  createRequestId,
  createVerifyCommand,
  createFindUserCommand,
  createSendMessageCommand,
  createListMessagesCommand,
  createReadMessageCommand,
  createLoadAttachmentCommand,
} from "./protocol/index.js";

// Errors
export {
  MPRCError,
  NetworkError,
  DnsResolutionError,
  ConnectionError,
  TimeoutError,
  InvalidJsonError,
  InvalidCommandError,
  UnknownCommandError,
  ProtocolVerificationError,
  InvalidEmailError,
  UserNotFoundError,
  SenderVerificationError,
  MessageDeliveryError,
  AttachmentNotFoundError,
} from "./protocol/index.js";

// HTML Rendering
export type { MessageToHTMLOptions } from "./protocol/index.js";

export {
  messageBodyToHTML,
  messageBodyToHTMLDocument,
  messageToHTML,
} from "./protocol/index.js";

// Mail database types
export type {
  IMPRCDatabase,
  ListMessagesOptions,
  PaginatedResult,
} from "./protocol/mail-database.js";

// Attachment types
export type {
  AttachmentMetadata,
  IAttachmentStorage,
} from "./protocol/attachment.js";

// ============================================================================
// Network Utilities
// ============================================================================

export type {
  DnsResolutionResult,
  ConnectionOptions,
  SendCommandOptions,
} from "./network/index.js";

export {
  MPRCConnection,
  extractDomainFromEmail,
  resolveDomain,
  resolveEmailToServerAddress,
  sendSingleCommand,
} from "./network/index.js";

// ============================================================================
// Implementations
// ============================================================================

export {
  FilesystemAttachmentStorage,
  createDefaultAttachmentStorage,
} from "./implementations/attachment/filesystem.js";
export type { FilesystemStorageOptions } from "./implementations/attachment/filesystem.js";

export {
  InMemoryDatabase,
  createDefaultDatabase,
} from "./implementations/mail-database/memory.js";
