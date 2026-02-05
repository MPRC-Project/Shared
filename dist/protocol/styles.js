/**
 * MPRC Protocol - Element Styles
 *
 * This module defines the styling system for message body elements.
 * Styles are defined in a structured, safe format that can be
 * converted to CSS for rendering.
 *
 * @module protocol/styles
 */
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Converts a SizeValue to a CSS string.
 *
 * @param size - The size value to convert
 * @returns CSS size string
 *
 * @example
 * ```typescript
 * sizeToCSS("16px");                    // "16px"
 * sizeToCSS({ value: 1.5, unit: "rem" }); // "1.5rem"
 * ```
 */
export function sizeToCSS(size) {
    if (typeof size === "string") {
        return size;
    }
    return `${size.value}${size.unit}`;
}
/**
 * Converts a SpacingValue to CSS margin/padding string.
 *
 * @param spacing - The spacing value to convert
 * @returns CSS spacing string
 *
 * @example
 * ```typescript
 * spacingToCSS("10px");                           // "10px"
 * spacingToCSS({ top: "10px", bottom: "20px" });  // "10px 0 20px 0"
 * spacingToCSS({ vertical: "10px", horizontal: "20px" }); // "10px 20px"
 * ```
 */
export function spacingToCSS(spacing) {
    if (typeof spacing === "string" ||
        (typeof spacing === "object" && "value" in spacing)) {
        return sizeToCSS(spacing);
    }
    if ("vertical" in spacing || "horizontal" in spacing) {
        const shorthand = spacing;
        const v = shorthand.vertical ? sizeToCSS(shorthand.vertical) : "0";
        const h = shorthand.horizontal ? sizeToCSS(shorthand.horizontal) : "0";
        return `${v} ${h}`;
    }
    const individual = spacing;
    const top = individual.top ? sizeToCSS(individual.top) : "0";
    const right = individual.right ? sizeToCSS(individual.right) : "0";
    const bottom = individual.bottom ? sizeToCSS(individual.bottom) : "0";
    const left = individual.left ? sizeToCSS(individual.left) : "0";
    return `${top} ${right} ${bottom} ${left}`;
}
/**
 * Converts a BorderRadiusValue to CSS string.
 *
 * @param radius - The border radius value to convert
 * @returns CSS border-radius string
 *
 * @example
 * ```typescript
 * borderRadiusToCSS("8px");                       // "8px"
 * borderRadiusToCSS({ topLeft: "8px", topRight: "8px" }); // "8px 8px 0 0"
 * ```
 */
export function borderRadiusToCSS(radius) {
    if (typeof radius === "string" ||
        (typeof radius === "object" && "value" in radius)) {
        return sizeToCSS(radius);
    }
    const individual = radius;
    const tl = individual.topLeft ? sizeToCSS(individual.topLeft) : "0";
    const tr = individual.topRight ? sizeToCSS(individual.topRight) : "0";
    const br = individual.bottomRight ? sizeToCSS(individual.bottomRight) : "0";
    const bl = individual.bottomLeft ? sizeToCSS(individual.bottomLeft) : "0";
    return `${tl} ${tr} ${br} ${bl}`;
}
/**
 * Converts an ElementStyle to a CSS properties object.
 *
 * @param style - The element style to convert
 * @returns Object with CSS property names and values
 *
 * @example
 * ```typescript
 * const css = elementStyleToCSS({
 *   fontSize: "16px",
 *   color: "#333",
 *   margin: { vertical: "10px" },
 * });
 * // { fontSize: "16px", color: "#333", margin: "10px 0" }
 * ```
 */
export function elementStyleToCSS(style) {
    const css = {};
    if (style.fontSize) {
        css.fontSize = sizeToCSS(style.fontSize);
    }
    if (style.color) {
        css.color = style.color;
    }
    if (style.backgroundColor) {
        css.backgroundColor = style.backgroundColor;
    }
    if (style.margin) {
        css.margin = spacingToCSS(style.margin);
    }
    if (style.padding) {
        css.padding = spacingToCSS(style.padding);
    }
    if (style.borderRadius) {
        css.borderRadius = borderRadiusToCSS(style.borderRadius);
    }
    return css;
}
/**
 * Converts a BlockElementStyle to a CSS properties object.
 *
 * @param style - The block element style to convert
 * @returns Object with CSS property names and values
 */
export function blockStyleToCSS(style) {
    const css = elementStyleToCSS(style);
    if (style.width) {
        css.width = sizeToCSS(style.width);
    }
    if (style.height) {
        css.height = sizeToCSS(style.height);
    }
    if (style.maxWidth) {
        css.maxWidth = sizeToCSS(style.maxWidth);
    }
    if (style.maxHeight) {
        css.maxHeight = sizeToCSS(style.maxHeight);
    }
    if (style.minWidth) {
        css.minWidth = sizeToCSS(style.minWidth);
    }
    if (style.minHeight) {
        css.minHeight = sizeToCSS(style.minHeight);
    }
    return css;
}
/**
 * Converts a ListElementStyle to a CSS properties object.
 *
 * @param style - The list element style to convert
 * @returns Object with CSS property names and values
 */
export function listStyleToCSS(style) {
    const css = blockStyleToCSS(style);
    if (style.listStyle) {
        if (style.listStyle.type) {
            css.listStyleType = style.listStyle.type;
        }
        if (style.listStyle.position) {
            css.listStylePosition = style.listStyle.position;
        }
        // Note: list marker color requires ::marker pseudo-element in actual CSS
    }
    return css;
}
//# sourceMappingURL=styles.js.map