/**
 * MPRC Protocol - HTML Renderer
 *
 * This module provides functions to convert structured message body
 * elements into valid HTML strings for rendering.
 *
 * @module protocol/html-renderer
 */
import { sizeToCSS, spacingToCSS, borderRadiusToCSS } from "./styles.js";
// ============================================================================
// Style to CSS String Conversion
// ============================================================================
/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param text - The text to escape
 * @returns Escaped text safe for HTML
 */
function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/**
 * Converts an ElementStyle to an inline CSS string.
 *
 * @param style - The style object to convert
 * @returns CSS string for use in style attribute
 */
function elementStyleToInlineCSS(style) {
    const parts = [];
    if (style.fontSize) {
        parts.push(`font-size: ${sizeToCSS(style.fontSize)}`);
    }
    if (style.color) {
        parts.push(`color: ${style.color}`);
    }
    if (style.backgroundColor) {
        parts.push(`background-color: ${style.backgroundColor}`);
    }
    if (style.margin) {
        parts.push(`margin: ${spacingToCSS(style.margin)}`);
    }
    if (style.padding) {
        parts.push(`padding: ${spacingToCSS(style.padding)}`);
    }
    if (style.borderRadius) {
        parts.push(`border-radius: ${borderRadiusToCSS(style.borderRadius)}`);
    }
    return parts.join("; ");
}
/**
 * Converts a BlockElementStyle to an inline CSS string.
 *
 * @param style - The block style object to convert
 * @returns CSS string for use in style attribute
 */
function blockStyleToInlineCSS(style) {
    const baseParts = elementStyleToInlineCSS(style);
    const parts = baseParts ? [baseParts] : [];
    if (style.width) {
        parts.push(`width: ${sizeToCSS(style.width)}`);
    }
    if (style.height) {
        parts.push(`height: ${sizeToCSS(style.height)}`);
    }
    if (style.maxWidth) {
        parts.push(`max-width: ${sizeToCSS(style.maxWidth)}`);
    }
    if (style.maxHeight) {
        parts.push(`max-height: ${sizeToCSS(style.maxHeight)}`);
    }
    if (style.minWidth) {
        parts.push(`min-width: ${sizeToCSS(style.minWidth)}`);
    }
    if (style.minHeight) {
        parts.push(`min-height: ${sizeToCSS(style.minHeight)}`);
    }
    return parts.join("; ");
}
/**
 * Converts a ListElementStyle to an inline CSS string.
 *
 * @param style - The list style object to convert
 * @returns CSS string for use in style attribute
 */
function listStyleToInlineCSS(style) {
    const baseParts = blockStyleToInlineCSS(style);
    const parts = baseParts ? [baseParts] : [];
    if (style.listStyle) {
        if (style.listStyle.type) {
            parts.push(`list-style-type: ${style.listStyle.type}`);
        }
        if (style.listStyle.position) {
            parts.push(`list-style-position: ${style.listStyle.position}`);
        }
    }
    return parts.join("; ");
}
/**
 * Converts an ImageElementStyle to an inline CSS string.
 *
 * @param style - The image style object to convert
 * @returns CSS string for use in style attribute
 */
function imageStyleToInlineCSS(style) {
    const baseParts = blockStyleToInlineCSS(style);
    const parts = baseParts ? [baseParts] : [];
    if (style.objectFit) {
        parts.push(`object-fit: ${style.objectFit}`);
    }
    if (style.objectPosition) {
        parts.push(`object-position: ${style.objectPosition}`);
    }
    return parts.join("; ");
}
/**
 * Creates a style attribute string if style is present.
 *
 * @param cssString - The CSS string
 * @returns Style attribute or empty string
 */
function styleAttr(cssString) {
    return cssString ? ` style="${escapeHTML(cssString)}"` : "";
}
// ============================================================================
// Element Renderers
// ============================================================================
/**
 * Renders a text element to HTML.
 */
function renderTextElement(element) {
    const style = element.style ? elementStyleToInlineCSS(element.style) : "";
    const content = escapeHTML(element.content);
    return `<${element.tag}${styleAttr(style)}>${content}</${element.tag}>`;
}
/**
 * Renders a break element to HTML.
 */
function renderBreakElement(_element) {
    return "<br>";
}
/**
 * Renders an image element to HTML.
 *
 * @param element - The image element
 * @param attachments - Optional array of attachments for resolving attachment references
 */
function renderImageElement(element, attachments) {
    let src = "";
    if ("url" in element && element.url) {
        src = element.url;
    }
    else if ("attachmentId" in element &&
        typeof element.attachmentId === "string") {
        const attachment = attachments?.find((a) => a.id === element.attachmentId);
        if (attachment) {
            if (attachment.content) {
                src = `data:${attachment.mimeType};base64,${attachment.content}`;
            }
            else {
                src = `attachment://${attachment.id}`;
            }
        }
        else {
            src = `attachment://${element.attachmentId}`;
        }
    }
    const alt = element.alt ? ` alt="${escapeHTML(element.alt)}"` : "";
    const styleParts = [];
    if (element.width && !element.style?.width) {
        styleParts.push(`width: ${element.width}px`);
    }
    if (element.height && !element.style?.height) {
        styleParts.push(`height: ${element.height}px`);
    }
    if (element.style) {
        const imageStyle = imageStyleToInlineCSS(element.style);
        if (imageStyle) {
            styleParts.push(imageStyle);
        }
    }
    const style = styleParts.length > 0
        ? ` style="${escapeHTML(styleParts.join("; "))}"`
        : "";
    return `<img src="${escapeHTML(src)}"${alt}${style}>`;
}
/**
 * Renders a link element to HTML.
 */
function renderLinkElement(element) {
    const href = ` href="${escapeHTML(element.href)}"`;
    const title = element.title ? ` title="${escapeHTML(element.title)}"` : "";
    const style = element.style ? elementStyleToInlineCSS(element.style) : "";
    const content = escapeHTML(element.content);
    return `<a${href}${title}${styleAttr(style)}>${content}</a>`;
}
/**
 * Renders a list item element to HTML.
 */
function renderListItemElement(element, attachments) {
    const style = element.style ? elementStyleToInlineCSS(element.style) : "";
    if ("content" in element && element.content) {
        return `<li${styleAttr(style)}>${escapeHTML(element.content)}</li>`;
    }
    if ("children" in element && element.children) {
        const childrenHTML = element.children
            .map((child) => renderListItemChild(child, attachments))
            .join("");
        return `<li${styleAttr(style)}>${childrenHTML}</li>`;
    }
    return `<li${styleAttr(style)}></li>`;
}
/**
 * Renders a list item child element to HTML.
 */
function renderListItemChild(element, attachments) {
    switch (element.tag) {
        case "img":
            return renderImageElement(element, attachments);
        case "a":
            return renderLinkElement(element);
        case "br":
            return renderBreakElement(element);
        case "div":
            return renderDivElement(element, attachments);
        default:
            return renderTextElement(element);
    }
}
/**
 * Renders an unordered list element to HTML.
 */
function renderUnorderedListElement(element, attachments) {
    const style = element.style ? listStyleToInlineCSS(element.style) : "";
    const items = element.items
        .map((item) => renderListItemElement(item, attachments))
        .join("");
    return `<ul${styleAttr(style)}>${items}</ul>`;
}
/**
 * Renders an ordered list element to HTML.
 */
function renderOrderedListElement(element, attachments) {
    const style = element.style ? listStyleToInlineCSS(element.style) : "";
    const start = element.start ? ` start="${element.start}"` : "";
    const items = element.items
        .map((item) => renderListItemElement(item, attachments))
        .join("");
    return `<ol${start}${styleAttr(style)}>${items}</ol>`;
}
/**
 * Renders a div child element to HTML.
 */
function renderDivChild(element, attachments) {
    switch (element.tag) {
        case "img":
            return renderImageElement(element, attachments);
        case "a":
            return renderLinkElement(element);
        case "br":
            return renderBreakElement(element);
        case "ul":
            return renderUnorderedListElement(element, attachments);
        case "ol":
            return renderOrderedListElement(element, attachments);
        case "div":
            return renderDivElement(element, attachments);
        default:
            return renderTextElement(element);
    }
}
/**
 * Renders a div element to HTML.
 */
function renderDivElement(element, attachments) {
    const style = element.style ? blockStyleToInlineCSS(element.style) : "";
    const className = element.className
        ? ` class="${escapeHTML(element.className)}"`
        : "";
    const id = element.id ? ` id="${escapeHTML(element.id)}"` : "";
    const children = element.children
        .map((child) => renderDivChild(child, attachments))
        .join("");
    return `<div${id}${className}${styleAttr(style)}>${children}</div>`;
}
/**
 * Renders a single message body element to HTML.
 *
 * @param element - The element to render
 * @param attachments - Optional array of message attachments
 * @returns HTML string representation of the element
 */
function renderElement(element, attachments) {
    switch (element.tag) {
        case "br":
            return renderBreakElement(element);
        case "img":
            return renderImageElement(element, attachments);
        case "a":
            return renderLinkElement(element);
        case "ul":
            return renderUnorderedListElement(element, attachments);
        case "ol":
            return renderOrderedListElement(element, attachments);
        case "li":
            return renderListItemElement(element, attachments);
        case "div":
            return renderDivElement(element, attachments);
        default:
            return renderTextElement(element);
    }
}
// ============================================================================
// Main Export Functions
// ============================================================================
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
export function messageBodyToHTML(body, attachments) {
    return body.map((element) => renderElement(element, attachments)).join("");
}
/**
 * Converts a MessageBody to a complete HTML document.
 *
 * @param body - The message body to convert
 * @param options - Optional configuration for the document
 * @returns Complete HTML document string
 */
export function messageBodyToHTMLDocument(body, options = {}) {
    const { title = "Message", charset = "UTF-8", additionalStyles = "", attachments, } = options;
    const bodyContent = messageBodyToHTML(body, attachments);
    const styleBlock = additionalStyles
        ? `<style>${additionalStyles}</style>`
        : "";
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="${escapeHTML(charset)}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  ${styleBlock}
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}
/**
 * Default styles for message metadata header.
 */
const MESSAGE_METADATA_STYLES = `
.message-metadata {
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.message-metadata dt {
  font-weight: bold;
  color: #666;
}
.message-metadata dd {
  margin: 0 0 0.5rem 0;
}
`;
/**
 * Renders message metadata to HTML.
 */
function renderMessageMetadata(message) {
    const date = message.sentAt
        ? `<dt>Date:</dt><dd>${escapeHTML(message.sentAt.toISOString())}</dd>`
        : "";
    return `<dl class="message-metadata">
  <dt>From:</dt><dd>${escapeHTML(message.from)}</dd>
  <dt>To:</dt><dd>${escapeHTML(message.to)}</dd>
  <dt>Subject:</dt><dd>${escapeHTML(message.subject)}</dd>
  ${date}
</dl>`;
}
/**
 * Converts a complete Message object to HTML.
 *
 * @param message - The message to convert
 * @param options - Rendering options
 * @returns HTML string representation of the message
 */
export function messageToHTML(message, options = {}) {
    const { includeMetadata = false, fullDocument = false, title, additionalStyles = "", } = options;
    const metadataHTML = includeMetadata ? renderMessageMetadata(message) : "";
    const bodyHTML = messageBodyToHTML(message.body, message.attachments);
    const content = metadataHTML + bodyHTML;
    if (!fullDocument) {
        return content;
    }
    const styles = includeMetadata
        ? MESSAGE_METADATA_STYLES + additionalStyles
        : additionalStyles;
    const docOptions = {
        title: title || `Email: ${message.subject}`,
        additionalStyles: styles,
    };
    if (message.attachments) {
        docOptions.attachments = message.attachments;
    }
    return messageBodyToHTMLDocument([{ tag: "div", children: [], className: "message-content" }], docOptions).replace('<div class="message-content"></div>', content);
}
//# sourceMappingURL=html-renderer.js.map