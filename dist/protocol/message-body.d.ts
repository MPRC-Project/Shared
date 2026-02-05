/**
 * MPRC Protocol - Message Body Elements
 *
 * This module defines the structured format for email message bodies.
 * Instead of raw HTML, MPRC uses a safe, structured representation
 * that can be rendered to HTML or other formats.
 *
 * @module protocol/message-body
 */
import type { ElementStyle, BlockElementStyle, ListElementStyle, ImageElementStyle } from "./styles.js";
export type { ElementStyle, BlockElementStyle, ListElementStyle, ImageElementStyle, SizeValue, SizeUnit, ColorValue, SpacingValue, BorderRadiusValue, ListStyle, ListStyleType, } from "./styles.js";
export { sizeToCSS, spacingToCSS, borderRadiusToCSS, elementStyleToCSS, blockStyleToCSS, listStyleToCSS, } from "./styles.js";
/**
 * All supported message body element tags.
 */
export type MessageBodyTag = TextTag | "a" | "img" | "br" | "ul" | "ol" | "li" | "div";
/**
 * Tags that contain plain text content.
 */
export type TextTag = "h1" | "h2" | "h3" | "p" | "b" | "i" | "u" | "strike" | "code" | "pre" | "blockquote";
/**
 * Base interface for all message body elements.
 * Every element must have a tag property identifying its type.
 *
 * @template T - The specific tag type for this element
 */
export interface BaseElement<T extends MessageBodyTag> {
    /** The element tag type */
    tag: T;
    /** Optional styling for the element */
    style?: ElementStyle;
}
/**
 * Element containing plain text content.
 * Used for headings, paragraphs, and inline formatting.
 *
 * @template T - The specific text tag type
 *
 * @example
 * ```typescript
 * const heading: TextElement<"h1"> = {
 *   tag: "h1",
 *   content: "Welcome to MPRC",
 *   style: {
 *     fontSize: "2rem",
 *     color: "#333",
 *     margin: { bottom: "1rem" },
 *   },
 * };
 *
 * const paragraph: TextElement<"p"> = {
 *   tag: "p",
 *   content: "This is a paragraph of text.",
 * };
 * ```
 */
export interface TextElement<T extends TextTag> extends BaseElement<T> {
    /** The text content of this element */
    content: string;
    /** Optional styling for the text element */
    style?: ElementStyle;
}
/**
 * Heading level 1 element.
 */
export type H1Element = TextElement<"h1">;
/**
 * Heading level 2 element.
 */
export type H2Element = TextElement<"h2">;
/**
 * Heading level 3 element.
 */
export type H3Element = TextElement<"h3">;
/**
 * Paragraph element.
 */
export type ParagraphElement = TextElement<"p">;
/**
 * Bold text element.
 */
export type BoldElement = TextElement<"b">;
/**
 * Italic text element.
 */
export type ItalicElement = TextElement<"i">;
/**
 * Underlined text element.
 */
export type UnderlineElement = TextElement<"u">;
/**
 * Strikethrough text element.
 */
export type StrikeElement = TextElement<"strike">;
/**
 * Inline code element.
 */
export type CodeElement = TextElement<"code">;
/**
 * Preformatted text block element.
 */
export type PreElement = TextElement<"pre">;
/**
 * Blockquote element for quoted text.
 */
export type BlockquoteElement = TextElement<"blockquote">;
/**
 * Line break element.
 * Creates a line break in the message content.
 *
 * @example
 * ```typescript
 * const lineBreak: BreakElement = { tag: "br" };
 * ```
 */
export interface BreakElement extends BaseElement<"br"> {
}
/**
 * Image element that can reference either a URL or an attachment.
 * Must have either `url` OR `attachmentIndex`, but not both.
 *
 * @example
 * ```typescript
 * // Image from URL
 * const urlImage: ImageElement = {
 *   tag: "img",
 *   url: "https://example.com/image.png",
 *   alt: "Example image",
 * };
 *
 * // Image from attachment
 * const attachmentImage: ImageElement = {
 *   tag: "img",
 *   attachmentIndex: 0,
 *   alt: "Attached image",
 * };
 * ```
 */
export type ImageElement = ImageFromUrl | ImageFromAttachment;
/**
 * Image element referencing an external URL.
 */
export interface ImageFromUrl extends BaseElement<"img"> {
    /** URL of the image */
    url: string;
    /** Attachment index is not allowed when using URL */
    attachmentIndex?: never;
    /** Alternative text for the image */
    alt?: string;
    /** Optional width in pixels */
    width?: number;
    /** Optional height in pixels */
    height?: number;
    /** Optional styling for the image (supports width, height, objectFit, etc.) */
    style?: ImageElementStyle;
}
/**
 * Image element referencing a message attachment by index.
 */
export interface ImageFromAttachment extends BaseElement<"img"> {
    /** Index into the message's attachments array */
    attachmentIndex: number;
    /** URL is not allowed when using attachment */
    url?: never;
    /** Alternative text for the image */
    alt?: string;
    /** Optional width in pixels */
    width?: number;
    /** Optional height in pixels */
    height?: number;
    /** Optional styling for the image (supports width, height, objectFit, etc.) */
    style?: ImageElementStyle;
}
/**
 * Hyperlink element.
 * Contains a URL and display text.
 *
 * @example
 * ```typescript
 * const link: LinkElement = {
 *   tag: "a",
 *   href: "https://example.com",
 *   content: "Click here to visit Example",
 *   style: {
 *     color: "#0066cc",
 *     fontSize: "14px",
 *   },
 * };
 * ```
 */
export interface LinkElement extends BaseElement<"a"> {
    /** The URL the link points to */
    href: string;
    /** The display text for the link */
    content: string;
    /** Optional title shown on hover */
    title?: string;
    /** Optional styling for the link */
    style?: ElementStyle;
}
/**
 * Unordered (bulleted) list element.
 *
 * @example
 * ```typescript
 * const list: UnorderedListElement = {
 *   tag: "ul",
 *   items: [
 *     { tag: "li", content: "First item" },
 *     { tag: "li", content: "Second item" },
 *   ],
 *   style: {
 *     listStyle: { type: "square", color: "#666" },
 *     padding: { left: "20px" },
 *   },
 * };
 * ```
 */
export interface UnorderedListElement extends BaseElement<"ul"> {
    /** List items */
    items: ListItemElement[];
    /** Optional styling for the list (supports listStyle for bullet customization) */
    style?: ListElementStyle;
}
/**
 * Ordered (numbered) list element.
 *
 * @example
 * ```typescript
 * const list: OrderedListElement = {
 *   tag: "ol",
 *   items: [
 *     { tag: "li", content: "Step one" },
 *     { tag: "li", content: "Step two" },
 *   ],
 *   start: 1,
 *   style: {
 *     listStyle: { type: "upper-roman" },
 *     margin: { vertical: "10px" },
 *   },
 * };
 * ```
 */
export interface OrderedListElement extends BaseElement<"ol"> {
    /** List items */
    items: ListItemElement[];
    /** Optional starting number for the list */
    start?: number;
    /** Optional styling for the list (supports listStyle for numbering customization) */
    style?: ListElementStyle;
}
/**
 * List item element.
 * Can contain either simple text or nested elements (including divs).
 *
 * @example
 * ```typescript
 * // Simple text item
 * const simpleItem: ListItemElement = {
 *   tag: "li",
 *   content: "Simple list item",
 * };
 *
 * // Complex item with nested elements
 * const complexItem: ListItemElement = {
 *   tag: "li",
 *   children: [
 *     { tag: "b", content: "Bold text" },
 *     { tag: "br" },
 *     { tag: "p", content: "More content" },
 *   ],
 * };
 * ```
 */
export type ListItemElement = ListItemWithText | ListItemWithChildren;
/**
 * List item containing simple text content.
 */
export interface ListItemWithText extends BaseElement<"li"> {
    /** Simple text content */
    content: string;
    /** Children not allowed when using content */
    children?: never;
    /** Optional styling for the list item */
    style?: ElementStyle;
}
/**
 * List item containing nested elements.
 */
export interface ListItemWithChildren extends BaseElement<"li"> {
    /** Nested elements within the list item */
    children: ListItemChildElement[];
    /** Content not allowed when using children */
    content?: never;
    /** Optional styling for the list item */
    style?: ElementStyle;
}
/**
 * Elements that can be nested inside a list item.
 */
export type ListItemChildElement = TextElement<TextTag> | BreakElement | ImageElement | LinkElement | DivElement;
/**
 * Container element that can hold other elements.
 * Useful for grouping and structuring content.
 *
 * @example
 * ```typescript
 * const container: DivElement = {
 *   tag: "div",
 *   children: [
 *     { tag: "h2", content: "Section Title" },
 *     { tag: "p", content: "Section content goes here." },
 *     {
 *       tag: "ul",
 *       items: [
 *         { tag: "li", content: "Item 1" },
 *         { tag: "li", content: "Item 2" },
 *       ],
 *     },
 *   ],
 *   className: "section",
 *   style: {
 *     backgroundColor: "#f5f5f5",
 *     padding: "20px",
 *     borderRadius: "8px",
 *     width: "100%",
 *     maxWidth: "600px",
 *   },
 * };
 * ```
 */
export interface DivElement extends BaseElement<"div"> {
    /** Child elements contained in this div */
    children: DivChildElement[];
    /** Optional CSS class name for styling hints */
    className?: string;
    /** Optional ID for referencing */
    id?: string;
    /** Optional styling for the container (supports width, height, etc.) */
    style?: BlockElementStyle;
}
/**
 * Elements that can be nested inside a div.
 * Divs can contain all element types including other divs.
 */
export type DivChildElement = TextElement<TextTag> | BreakElement | ImageElement | LinkElement | UnorderedListElement | OrderedListElement | DivElement;
/**
 * Any list element (ordered or unordered).
 */
export type ListElement = UnorderedListElement | OrderedListElement;
/**
 * Union type of all possible message body elements.
 * This is the type used in the Message.body array.
 */
export type MessageBodyElement = TextElement<TextTag> | BreakElement | ImageElement | LinkElement | UnorderedListElement | OrderedListElement | ListItemElement | DivElement;
/**
 * The structured body of a message.
 * An array of body elements that represent the message content.
 */
export type MessageBody = MessageBodyElement[];
/**
 * Checks if an element is a text element.
 *
 * @param element - The element to check
 * @returns True if the element is a TextElement
 */
export declare function isTextElement(element: MessageBodyElement): element is TextElement<TextTag>;
/**
 * Checks if an element is a break element.
 *
 * @param element - The element to check
 * @returns True if the element is a BreakElement
 */
export declare function isBreakElement(element: MessageBodyElement): element is BreakElement;
/**
 * Checks if an element is an image element.
 *
 * @param element - The element to check
 * @returns True if the element is an ImageElement
 */
export declare function isImageElement(element: MessageBodyElement): element is ImageElement;
/**
 * Checks if an element is a link element.
 *
 * @param element - The element to check
 * @returns True if the element is a LinkElement
 */
export declare function isLinkElement(element: MessageBodyElement): element is LinkElement;
/**
 * Checks if an element is a list element.
 *
 * @param element - The element to check
 * @returns True if the element is a ListElement
 */
export declare function isListElement(element: MessageBodyElement): element is ListElement;
/**
 * Checks if an element is a div element.
 *
 * @param element - The element to check
 * @returns True if the element is a DivElement
 */
export declare function isDivElement(element: MessageBodyElement): element is DivElement;
/**
 * Validates a message body structure.
 *
 * @param body - The body to validate
 * @returns True if the body is a valid MessageBody
 */
export declare function isValidMessageBody(body: unknown): body is MessageBody;
//# sourceMappingURL=message-body.d.ts.map