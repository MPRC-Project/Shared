// attachment.ts

export type { AttachmentMetadata, MessageAttachment } from "./attachment.js";

// message-body.ts

export type {
  Message,
  StoredMessage,
  AnyMessage,
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
} from "./message.js";

export {
  isTextElement,
  isBreakElement,
  isImageElement,
  isLinkElement,
  isListElement,
  isDivElement,
  isValidMessageBody,
} from "./message.js";

// styles.ts

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

// html-renderer.ts
export type { MessageToHTMLOptions } from "./html-renderer.js";
export {
  messageBodyToHTML,
  messageBodyToHTMLDocument,
  messageToHTML,
} from "./html-renderer.js";
