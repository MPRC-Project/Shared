/**
 * MPRC Protocol - Element Styles
 *
 * This module defines the styling system for message body elements.
 * Styles are defined in a structured, safe format that can be
 * converted to CSS for rendering.
 *
 * @module protocol/styles
 */
/**
 * Supported CSS size units.
 */
export type SizeUnit = "px" | "%" | "rem" | "em" | "vw" | "vh";
/**
 * A size value with its unit.
 * Can be specified as a string (e.g., "16px", "100%") or as an object.
 *
 * @example
 * ```typescript
 * // String format
 * const size1: SizeValue = "16px";
 * const size2: SizeValue = "100%";
 *
 * // Object format
 * const size3: SizeValue = { value: 16, unit: "px" };
 * const size4: SizeValue = { value: 1.5, unit: "rem" };
 * ```
 */
export type SizeValue = string | {
    value: number;
    unit: SizeUnit;
};
/**
 * A color value.
 * Supports hex colors, rgb/rgba, hsl/hsla, and named colors.
 *
 * @example
 * ```typescript
 * const color1: ColorValue = "#ff5500";
 * const color2: ColorValue = "rgb(255, 85, 0)";
 * const color3: ColorValue = "rgba(255, 85, 0, 0.5)";
 * const color4: ColorValue = "hsl(20, 100%, 50%)";
 * const color5: ColorValue = "red";
 * ```
 */
export type ColorValue = string;
/**
 * Spacing value for margin and padding.
 * Can be a single value (applied to all sides) or an object for individual sides.
 *
 * @example
 * ```typescript
 * // Single value - applies to all sides
 * const spacing1: SpacingValue = "10px";
 *
 * // Object - individual sides
 * const spacing2: SpacingValue = {
 *   top: "10px",
 *   right: "20px",
 *   bottom: "10px",
 *   left: "20px",
 * };
 *
 * // Shorthand object
 * const spacing3: SpacingValue = {
 *   vertical: "10px",   // top and bottom
 *   horizontal: "20px", // left and right
 * };
 * ```
 */
export type SpacingValue = SizeValue | SpacingIndividual | SpacingShorthand;
/**
 * Individual spacing values for each side.
 */
export interface SpacingIndividual {
    /** Top spacing */
    top?: SizeValue;
    /** Right spacing */
    right?: SizeValue;
    /** Bottom spacing */
    bottom?: SizeValue;
    /** Left spacing */
    left?: SizeValue;
}
/**
 * Shorthand spacing using vertical/horizontal.
 */
export interface SpacingShorthand {
    /** Vertical spacing (top and bottom) */
    vertical?: SizeValue;
    /** Horizontal spacing (left and right) */
    horizontal?: SizeValue;
}
/**
 * Border radius value.
 * Can be a single value (all corners) or individual corner values.
 *
 * @example
 * ```typescript
 * // Single value - all corners
 * const radius1: BorderRadiusValue = "8px";
 *
 * // Individual corners
 * const radius2: BorderRadiusValue = {
 *   topLeft: "8px",
 *   topRight: "8px",
 *   bottomRight: "0",
 *   bottomLeft: "0",
 * };
 * ```
 */
export type BorderRadiusValue = SizeValue | BorderRadiusIndividual;
/**
 * Individual border radius for each corner.
 */
export interface BorderRadiusIndividual {
    /** Top-left corner radius */
    topLeft?: SizeValue;
    /** Top-right corner radius */
    topRight?: SizeValue;
    /** Bottom-right corner radius */
    bottomRight?: SizeValue;
    /** Bottom-left corner radius */
    bottomLeft?: SizeValue;
}
/**
 * List style type for unordered lists.
 */
export type UnorderedListStyleType = "disc" | "circle" | "square" | "none";
/**
 * List style type for ordered lists.
 */
export type OrderedListStyleType = "decimal" | "decimal-leading-zero" | "lower-alpha" | "upper-alpha" | "lower-roman" | "upper-roman" | "none";
/**
 * List style type (combined).
 */
export type ListStyleType = UnorderedListStyleType | OrderedListStyleType;
/**
 * Position of the list marker.
 */
export type ListStylePosition = "inside" | "outside";
/**
 * Complete list style configuration.
 *
 * @example
 * ```typescript
 * const listStyle: ListStyle = {
 *   type: "square",
 *   position: "inside",
 *   color: "#333",
 * };
 * ```
 */
export interface ListStyle {
    /** The type of list marker */
    type?: ListStyleType;
    /** Position of the marker relative to the list item */
    position?: ListStylePosition;
    /** Color of the list marker */
    color?: ColorValue;
}
/**
 * Base style properties available for all elements.
 *
 * @example
 * ```typescript
 * const style: ElementStyle = {
 *   fontSize: "16px",
 *   color: "#333",
 *   backgroundColor: "#f5f5f5",
 *   margin: { vertical: "10px", horizontal: "0" },
 *   padding: "15px",
 *   borderRadius: "8px",
 * };
 * ```
 */
export interface ElementStyle {
    /**
     * Font size of the element.
     * @example "16px", "1.2rem", "100%"
     */
    fontSize?: SizeValue;
    /**
     * Text/foreground color.
     * @example "#333", "rgb(51, 51, 51)", "darkgray"
     */
    color?: ColorValue;
    /**
     * Background color of the element.
     * @example "#f5f5f5", "rgba(0, 0, 0, 0.1)", "transparent"
     */
    backgroundColor?: ColorValue;
    /**
     * Outer spacing around the element.
     * Can be a single value or individual sides.
     */
    margin?: SpacingValue;
    /**
     * Inner spacing within the element.
     * Can be a single value or individual sides.
     */
    padding?: SpacingValue;
    /**
     * Border radius for rounded corners.
     * Can be a single value or individual corners.
     */
    borderRadius?: BorderRadiusValue;
}
/**
 * Style properties for block-level elements that support width/height.
 * Extends base ElementStyle with dimension properties.
 *
 * @example
 * ```typescript
 * const blockStyle: BlockElementStyle = {
 *   width: "100%",
 *   height: "auto",
 *   maxWidth: "600px",
 *   minHeight: "100px",
 *   fontSize: "14px",
 *   padding: "20px",
 * };
 * ```
 */
export interface BlockElementStyle extends ElementStyle {
    /**
     * Width of the element.
     * @example "100%", "300px", "50vw"
     */
    width?: SizeValue;
    /**
     * Height of the element.
     * @example "auto", "200px", "100vh"
     */
    height?: SizeValue;
    /**
     * Maximum width constraint.
     * @example "600px", "100%"
     */
    maxWidth?: SizeValue;
    /**
     * Maximum height constraint.
     * @example "400px", "80vh"
     */
    maxHeight?: SizeValue;
    /**
     * Minimum width constraint.
     * @example "200px", "50%"
     */
    minWidth?: SizeValue;
    /**
     * Minimum height constraint.
     * @example "100px", "10vh"
     */
    minHeight?: SizeValue;
}
/**
 * Style properties specific to list elements.
 * Extends BlockElementStyle with list-specific styling.
 *
 * @example
 * ```typescript
 * const listStyle: ListElementStyle = {
 *   listStyle: {
 *     type: "square",
 *     position: "inside",
 *     color: "#666",
 *   },
 *   padding: { left: "20px" },
 *   margin: { vertical: "10px" },
 * };
 * ```
 */
export interface ListElementStyle extends BlockElementStyle {
    /**
     * List marker/bullet styling.
     */
    listStyle?: ListStyle;
}
/**
 * Style properties specific to image elements.
 * Extends BlockElementStyle with image-specific properties.
 *
 * @example
 * ```typescript
 * const imageStyle: ImageElementStyle = {
 *   width: "100%",
 *   maxWidth: "400px",
 *   height: "auto",
 *   borderRadius: "8px",
 *   objectFit: "cover",
 * };
 * ```
 */
export interface ImageElementStyle extends BlockElementStyle {
    /**
     * How the image should be resized to fit its container.
     */
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    /**
     * Position of the image within its container when using objectFit.
     * @example "center", "top left", "50% 50%"
     */
    objectPosition?: string;
}
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
export declare function sizeToCSS(size: SizeValue): string;
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
export declare function spacingToCSS(spacing: SpacingValue): string;
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
export declare function borderRadiusToCSS(radius: BorderRadiusValue): string;
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
export declare function elementStyleToCSS(style: ElementStyle): Record<string, string>;
/**
 * Converts a BlockElementStyle to a CSS properties object.
 *
 * @param style - The block element style to convert
 * @returns Object with CSS property names and values
 */
export declare function blockStyleToCSS(style: BlockElementStyle): Record<string, string>;
/**
 * Converts a ListElementStyle to a CSS properties object.
 *
 * @param style - The list element style to convert
 * @returns Object with CSS property names and values
 */
export declare function listStyleToCSS(style: ListElementStyle): Record<string, string>;
//# sourceMappingURL=styles.d.ts.map