/**
 * MPRC Protocol Module
 *
 * This module exports all protocol types, errors, and utilities.
 *
 * @module protocol
 */

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
} from "./styles.js";

export {
  sizeToCSS,
  spacingToCSS,
  borderRadiusToCSS,
  elementStyleToCSS,
  blockStyleToCSS,
  listStyleToCSS,
} from "./styles.js";

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
} from "./message-body.js";

export {
  isTextElement,
  isBreakElement,
  isImageElement,
  isLinkElement,
  isListElement,
  isDivElement,
  isValidMessageBody,
} from "./message-body.js";

// Types
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
  DeleteMessageCommand,
  DeleteMessageCommandResponse,
  LoadAttachmentCommand,
  LoadAttachmentCommandResponse,
  MPRCCommand,
  MPRCCommandResponse,
  MPRCCommandName,
} from "./types.js";

// Type guards and utilities
export {
  MPRC_COMMAND_NAMES,
  isMPRCCommand,
  isVerifyCommand,
  isFindUserCommand,
  isSendMessageCommand,
  isValidMessage,
  isErrorResponse,
  isLoadAttachmentCommand,
  createRequestId,
  createVerifyCommand,
  createFindUserCommand,
  createSendMessageCommand,
  createListMessagesCommand,
  createReadMessageCommand,
  createLoadAttachmentCommand,
} from "./types.js";

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
  MessageNotFoundError,
  SenderVerificationError,
  AttachmentNotFoundError,
  MessageDeliveryError,
} from "./errors.js";

// HTML Rendering
export type { MessageToHTMLOptions } from "./html-renderer.js";

export {
  messageBodyToHTML,
  messageBodyToHTMLDocument,
  messageToHTML,
} from "./html-renderer.js";
