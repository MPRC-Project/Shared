/**
 * MPRC Protocol - HTML Renderer
 *
 * This module provides functions to convert structured message body
 * elements into valid HTML strings for rendering.
 *
 * @module protocol/html-renderer
 */
import type { MessageAttachment } from "./message/attachment.ts";
import type { MessageBody } from "./message/message-body.ts";
/**
 * Converts a MessageBody to an HTML string.
 *
 * This function takes the structured message body elements and converts
 * them to valid, safe HTML. All text content is escaped to prevent XSS.
 * Styles are converted to inline CSS.
 *
 * @param body - The message body to convert
 * @param attachments - Optional array of message attachments for resolving image references
 * @returns HTML string representation of the message body
 *
 * @example
 * ```typescript
 * const body: MessageBody = [
 *   { tag: "h1", content: "Welcome!", style: { color: "#333" } },
 *   { tag: "p", content: "This is a paragraph." },
 * ];
 *
 * const html = messageBodyToHTML(body);
 * // '<h1 style="color: #333">Welcome!</h1><p>This is a paragraph.</p>'
 * ```
 */
export declare function messageBodyToHTML(
  body: MessageBody,
  attachments?: MessageAttachment[],
): string;
/**
 * Converts a MessageBody to a complete HTML document.
 *
 * @param body - The message body to convert
 * @param options - Optional configuration for the document
 * @returns Complete HTML document string
 */
export declare function messageBodyToHTMLDocument(
  body: MessageBody,
  options?: {
    title?: string;
    charset?: string;
    additionalStyles?: string;
    attachments?: MessageAttachment[];
  },
): string;
/**
 * Options for the messageToHTML function.
 */
export interface MessageToHTMLOptions {
  /** Whether to include message metadata (from, to, subject, date) */
  includeMetadata?: boolean;
  /** Whether to wrap in a full HTML document */
  fullDocument?: boolean;
  /** Document title (for full document mode) */
  title?: string;
  /** Additional CSS styles to include */
  additionalStyles?: string;
}
/**
 * Converts a complete Message object to HTML.
 *
 * @param message - The message to convert
 * @param options - Rendering options
 * @returns HTML string representation of the message
 */
export declare function messageToHTML(
  message: {
    from: string;
    to: string;
    subject: string;
    body: MessageBody;
    sentAt?: Date;
    attachments?: MessageAttachment[];
  },
  options?: MessageToHTMLOptions,
): string;
//# sourceMappingURL=html-renderer.d.ts.map
