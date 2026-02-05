/**
 * MPRC Protocol - Message Body Elements
 *
 * This module defines the structured format for email message bodies.
 * Instead of raw HTML, MPRC uses a safe, structured representation
 * that can be rendered to HTML or other formats.
 *
 * @module protocol/message-body
 */
export { sizeToCSS, spacingToCSS, borderRadiusToCSS, elementStyleToCSS, blockStyleToCSS, listStyleToCSS, } from "./styles.js";
// ============================================================================
// Type Guards
// ============================================================================
/**
 * Checks if an element is a text element.
 *
 * @param element - The element to check
 * @returns True if the element is a TextElement
 */
export function isTextElement(element) {
    const textTags = [
        "h1",
        "h2",
        "h3",
        "p",
        "b",
        "i",
        "u",
        "strike",
        "code",
        "pre",
        "blockquote",
    ];
    return textTags.includes(element.tag);
}
/**
 * Checks if an element is a break element.
 *
 * @param element - The element to check
 * @returns True if the element is a BreakElement
 */
export function isBreakElement(element) {
    return element.tag === "br";
}
/**
 * Checks if an element is an image element.
 *
 * @param element - The element to check
 * @returns True if the element is an ImageElement
 */
export function isImageElement(element) {
    return element.tag === "img";
}
/**
 * Checks if an element is a link element.
 *
 * @param element - The element to check
 * @returns True if the element is a LinkElement
 */
export function isLinkElement(element) {
    return element.tag === "a";
}
/**
 * Checks if an element is a list element.
 *
 * @param element - The element to check
 * @returns True if the element is a ListElement
 */
export function isListElement(element) {
    return element.tag === "ul" || element.tag === "ol";
}
/**
 * Checks if an element is a div element.
 *
 * @param element - The element to check
 * @returns True if the element is a DivElement
 */
export function isDivElement(element) {
    return element.tag === "div";
}
/**
 * Validates a message body structure.
 *
 * @param body - The body to validate
 * @returns True if the body is a valid MessageBody
 */
export function isValidMessageBody(body) {
    if (!Array.isArray(body)) {
        return false;
    }
    return body.every((element) => {
        if (typeof element !== "object" || element === null) {
            return false;
        }
        return "tag" in element && typeof element.tag === "string";
    });
}
//# sourceMappingURL=message-body.js.map