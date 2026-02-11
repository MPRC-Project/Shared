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
 * A color stop in a gradient.
 *
 * @example
 * ```typescript
 * const stop1: GradientStop = { color: "#ff0000", position: "0%" };
 * const stop2: GradientStop = { color: "blue", position: 0.5 };
 * const stop3: GradientStop = "green"; // position will be auto-calculated
 * ```
 */
export type GradientStop = string | {
    /** The color at this stop */
    color: ColorValue;
    /** Position of the stop (0-1 as number, or percentage as string) */
    position?: number | string;
};
/**
 * Direction for linear gradients.
 */
export type LinearGradientDirection = "to top" | "to bottom" | "to left" | "to right" | "to top left" | "to top right" | "to bottom left" | "to bottom right" | string;
/**
 * Linear gradient definition.
 *
 * @example
 * ```typescript
 * const gradient: LinearGradient = {
 *   type: "linear",
 *   direction: "to right",
 *   stops: ["#ff0000", "#0000ff"]
 * };
 * ```
 */
export interface LinearGradient {
    type: "linear";
    /** Direction of the gradient */
    direction?: LinearGradientDirection;
    /** Color stops in the gradient */
    stops: GradientStop[];
}
/**
 * Radial gradient definition.
 *
 * @example
 * ```typescript
 * const gradient: RadialGradient = {
 *   type: "radial",
 *   shape: "circle",
 *   position: "center",
 *   stops: ["#ff0000", "#0000ff"]
 * };
 * ```
 */
export interface RadialGradient {
    type: "radial";
    /** Shape of the gradient */
    shape?: "circle" | "ellipse";
    /** Size of the gradient */
    size?: "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner" | SizeValue;
    /** Position of the gradient center */
    position?: string;
    /** Color stops in the gradient */
    stops: GradientStop[];
}
/**
 * Conic gradient definition.
 *
 * @example
 * ```typescript
 * const gradient: ConicGradient = {
 *   type: "conic",
 *   angle: "45deg",
 *   position: "center",
 *   stops: ["red", "yellow", "blue"]
 * };
 * ```
 */
export interface ConicGradient {
    type: "conic";
    /** Starting angle of the gradient */
    angle?: string;
    /** Position of the gradient center */
    position?: string;
    /** Color stops in the gradient */
    stops: GradientStop[];
}
/**
 * Any type of gradient.
 */
export type GradientValue = LinearGradient | RadialGradient | ConicGradient;
/**
 * Border style values.
 */
export type BorderStyle = "none" | "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset";
/**
 * Border definition.
 *
 * @example
 * ```typescript
 * const border: BorderValue = {
 *   width: "2px",
 *   style: "solid",
 *   color: "#333"
 * };
 *
 * // Shorthand
 * const border2: BorderValue = "2px solid #333";
 * ```
 */
export type BorderValue = string | {
    /** Width of the border */
    width?: SizeValue;
    /** Style of the border */
    style?: BorderStyle;
    /** Color of the border */
    color?: ColorValue;
};
/**
 * Individual border values for each side.
 */
export interface BorderIndividual {
    /** Top border */
    top?: BorderValue;
    /** Right border */
    right?: BorderValue;
    /** Bottom border */
    bottom?: BorderValue;
    /** Left border */
    left?: BorderValue;
}
/**
 * Border value that can be applied to all sides or individual sides.
 */
export type BordersValue = BorderValue | BorderIndividual;
/**
 * Box shadow definition.
 *
 * @example
 * ```typescript
 * const shadow: BoxShadow = {
 *   offsetX: "2px",
 *   offsetY: "2px",
 *   blurRadius: "4px",
 *   color: "rgba(0, 0, 0, 0.2)"
 * };
 *
 * // Multiple shadows
 * const shadows: BoxShadowValue = [
 *   "2px 2px 4px rgba(0,0,0,0.2)",
 *   { offsetX: "0", offsetY: "0", blurRadius: "10px", color: "blue", inset: true }
 * ];
 * ```
 */
export interface BoxShadow {
    /** Horizontal offset */
    offsetX: SizeValue;
    /** Vertical offset */
    offsetY: SizeValue;
    /** Blur radius */
    blurRadius?: SizeValue;
    /** Spread radius */
    spreadRadius?: SizeValue;
    /** Shadow color */
    color?: ColorValue;
    /** Whether the shadow is inset */
    inset?: boolean;
}
/**
 * Box shadow value - can be string, single shadow, or array of shadows.
 */
export type BoxShadowValue = string | BoxShadow | (string | BoxShadow)[];
/**
 * Text shadow definition.
 */
export interface TextShadow {
    /** Horizontal offset */
    offsetX: SizeValue;
    /** Vertical offset */
    offsetY: SizeValue;
    /** Blur radius */
    blurRadius?: SizeValue;
    /** Shadow color */
    color?: ColorValue;
}
/**
 * Text shadow value - can be string, single shadow, or array of shadows.
 */
export type TextShadowValue = string | TextShadow | (string | TextShadow)[];
/**
 * Transform function values.
 */
export interface TransformFunctions {
    /** Translate along X axis */
    translateX?: SizeValue;
    /** Translate along Y axis */
    translateY?: SizeValue;
    /** Translate along Z axis */
    translateZ?: SizeValue;
    /** Scale along X axis */
    scaleX?: number;
    /** Scale along Y axis */
    scaleY?: number;
    /** Scale along Z axis */
    scaleZ?: number;
    /** Uniform scale */
    scale?: number;
    /** Rotate around Z axis */
    rotate?: string;
    /** Rotate around X axis */
    rotateX?: string;
    /** Rotate around Y axis */
    rotateY?: string;
    /** Rotate around Z axis */
    rotateZ?: string;
    /** Skew along X axis */
    skewX?: string;
    /** Skew along Y axis */
    skewY?: string;
}
/**
 * Transform value - can be a string or transform functions object.
 */
export type TransformValue = string | TransformFunctions;
/**
 * Timing function for transitions and animations.
 */
export type TimingFunction = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "step-start" | "step-end" | string;
/**
 * Single transition definition.
 */
export interface Transition {
    /** CSS property to transition */
    property?: string;
    /** Duration of the transition */
    duration?: string;
    /** Timing function */
    timingFunction?: TimingFunction;
    /** Delay before transition starts */
    delay?: string;
}
/**
 * Transition value - can be string, single transition, or array of transitions.
 */
export type TransitionValue = string | Transition | (string | Transition)[];
/**
 * Animation definition.
 */
export interface Animation {
    /** Name of the animation */
    name: string;
    /** Duration of the animation */
    duration?: string;
    /** Timing function */
    timingFunction?: TimingFunction;
    /** Delay before animation starts */
    delay?: string;
    /** Number of iterations */
    iterationCount?: number | "infinite";
    /** Direction of the animation */
    direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
    /** Fill mode */
    fillMode?: "none" | "forwards" | "backwards" | "both";
    /** Play state */
    playState?: "running" | "paused";
}
/**
 * Animation value - can be string, single animation, or array of animations.
 */
export type AnimationValue = string | Animation | (string | Animation)[];
/**
 * Font weight values.
 */
export type FontWeight = "normal" | "bold" | "lighter" | "bolder" | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
/**
 * Font style values.
 */
export type FontStyle = "normal" | "italic" | "oblique";
/**
 * Text alignment values.
 */
export type TextAlign = "left" | "right" | "center" | "justify" | "start" | "end";
/**
 * Text decoration values.
 */
export type TextDecoration = "none" | "underline" | "overline" | "line-through";
/**
 * Text transform values.
 */
export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";
/**
 * White space handling values.
 */
export type WhiteSpace = "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line";
/**
 * Word break values.
 */
export type WordBreak = "normal" | "break-all" | "keep-all" | "break-word";
/**
 * Text overflow values.
 */
export type TextOverflow = "clip" | "ellipsis";
/**
 * Display values.
 */
export type Display = "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "inline-grid" | "table" | "table-cell" | "table-row" | "none";
/**
 * Position values.
 */
export type Position = "static" | "relative" | "absolute" | "fixed" | "sticky";
/**
 * Overflow values.
 */
export type Overflow = "visible" | "hidden" | "scroll" | "auto";
/**
 * Flex direction values.
 */
export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
/**
 * Flex wrap values.
 */
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
/**
 * Justify content values.
 */
export type JustifyContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
/**
 * Align items values.
 */
export type AlignItems = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
/**
 * Align content values.
 */
export type AlignContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | "stretch";
/**
 * Cursor values.
 */
export type Cursor = "auto" | "default" | "pointer" | "text" | "move" | "not-allowed" | "help" | "wait" | "crosshair" | "grab" | "grabbing";
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
 *   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
 *   transition: { property: "all", duration: "0.3s" }
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
     * Font family.
     * @example "Arial, sans-serif", "Georgia, serif"
     */
    fontFamily?: string;
    /**
     * Font weight.
     * @example "bold", 600, "normal"
     */
    fontWeight?: FontWeight;
    /**
     * Font style.
     * @example "italic", "normal"
     */
    fontStyle?: FontStyle;
    /**
     * Line height.
     * @example "1.5", "24px", "150%"
     */
    lineHeight?: SizeValue | number;
    /**
     * Letter spacing.
     * @example "0.1em", "2px"
     */
    letterSpacing?: SizeValue;
    /**
     * Word spacing.
     * @example "0.2em", "4px"
     */
    wordSpacing?: SizeValue;
    /**
     * Text alignment.
     * @example "center", "left", "justify"
     */
    textAlign?: TextAlign;
    /**
     * Text decoration.
     * @example "underline", "line-through", "none"
     */
    textDecoration?: TextDecoration;
    /**
     * Text transform.
     * @example "uppercase", "capitalize", "none"
     */
    textTransform?: TextTransform;
    /**
     * White space handling.
     * @example "nowrap", "pre-wrap", "normal"
     */
    whiteSpace?: WhiteSpace;
    /**
     * Word break behavior.
     * @example "break-all", "keep-all", "normal"
     */
    wordBreak?: WordBreak;
    /**
     * Text overflow behavior.
     * @example "ellipsis", "clip"
     */
    textOverflow?: TextOverflow;
    /**
     * Text shadow effect.
     * @example "2px 2px 4px rgba(0,0,0,0.3)"
     */
    textShadow?: TextShadowValue;
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
     * Background gradient.
     * @example { type: "linear", direction: "to right", stops: ["#ff0000", "#0000ff"] }
     */
    backgroundGradient?: GradientValue;
    /**
     * Background image URL.
     * @example "url('image.jpg')", "url(data:image/...)"
     */
    backgroundImage?: string;
    /**
     * Background size.
     * @example "cover", "contain", "100% 100%"
     */
    backgroundSize?: string;
    /**
     * Background position.
     * @example "center", "top left", "50% 25%"
     */
    backgroundPosition?: string;
    /**
     * Background repeat.
     * @example "no-repeat", "repeat-x", "repeat"
     */
    backgroundRepeat?: string;
    /**
     * Background attachment.
     * @example "fixed", "scroll", "local"
     */
    backgroundAttachment?: string;
    /**
     * Element opacity.
     * @example 0.5, 0.8, 1
     */
    opacity?: number;
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
     * Element borders.
     * Can be applied to all sides or individual sides.
     */
    border?: BordersValue;
    /**
     * Border radius for rounded corners.
     * Can be a single value or individual corners.
     */
    borderRadius?: BorderRadiusValue;
    /**
     * Box shadow effect.
     * @example "0 2px 4px rgba(0,0,0,0.1)", ["0 2px 4px black", "inset 0 0 10px blue"]
     */
    boxShadow?: BoxShadowValue;
    /**
     * CSS transforms.
     * @example "rotate(45deg) scale(1.1)", { rotate: "45deg", scale: 1.1 }
     */
    transform?: TransformValue;
    /**
     * Transform origin.
     * @example "center", "top left", "50% 50%"
     */
    transformOrigin?: string;
    /**
     * CSS transitions.
     * @example "all 0.3s ease", { property: "opacity", duration: "0.5s" }
     */
    transition?: TransitionValue;
    /**
     * CSS animations.
     * @example "fadeIn 1s ease-in-out", { name: "bounce", duration: "2s" }
     */
    animation?: AnimationValue;
    /**
     * Cursor style when hovering.
     * @example "pointer", "text", "not-allowed"
     */
    cursor?: Cursor;
    /**
     * User select behavior.
     * @example "none", "text", "all"
     */
    userSelect?: "none" | "auto" | "text" | "contain" | "all";
    /**
     * Pointer events behavior.
     * @example "none", "auto"
     */
    pointerEvents?: "none" | "auto" | "visiblePainted" | "visibleFill" | "visibleStroke" | "visible" | "painted" | "fill" | "stroke" | "all";
    /**
     * Z-index stacking order.
     * @example 10, -1, 999
     */
    zIndex?: number;
    /**
     * Overflow behavior.
     * @example "hidden", "scroll", "auto"
     */
    overflow?: Overflow;
    /**
     * Horizontal overflow behavior.
     */
    overflowX?: Overflow;
    /**
     * Vertical overflow behavior.
     */
    overflowY?: Overflow;
}
/**
 * Style properties for block-level elements that support width/height.
 * Extends base ElementStyle with dimension and layout properties.
 *
 * @example
 * ```typescript
 * const blockStyle: BlockElementStyle = {
 *   width: "100%",
 *   height: "auto",
 *   maxWidth: "600px",
 *   minHeight: "100px",
 *   display: "flex",
 *   flexDirection: "column",
 *   justifyContent: "center",
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
    /**
     * Display type.
     * @example "block", "flex", "grid", "inline-block"
     */
    display?: Display;
    /**
     * Position type.
     * @example "relative", "absolute", "fixed"
     */
    position?: Position;
    /**
     * Top position offset.
     * @example "10px", "50%", "auto"
     */
    top?: SizeValue | "auto";
    /**
     * Right position offset.
     */
    right?: SizeValue | "auto";
    /**
     * Bottom position offset.
     */
    bottom?: SizeValue | "auto";
    /**
     * Left position offset.
     */
    left?: SizeValue | "auto";
    /**
     * Flex direction.
     * @example "row", "column", "row-reverse"
     */
    flexDirection?: FlexDirection;
    /**
     * Flex wrap behavior.
     * @example "wrap", "nowrap", "wrap-reverse"
     */
    flexWrap?: FlexWrap;
    /**
     * Justify content alignment.
     * @example "center", "space-between", "flex-start"
     */
    justifyContent?: JustifyContent;
    /**
     * Align items alignment.
     * @example "center", "flex-start", "stretch"
     */
    alignItems?: AlignItems;
    /**
     * Align content alignment.
     * @example "center", "space-around", "stretch"
     */
    alignContent?: AlignContent;
    /**
     * Gap between flex/grid items.
     * @example "10px", "1rem"
     */
    gap?: SizeValue;
    /**
     * Row gap in flex/grid layouts.
     */
    rowGap?: SizeValue;
    /**
     * Column gap in flex/grid layouts.
     */
    columnGap?: SizeValue;
    /**
     * Flex grow factor.
     * @example 1, 0, 2
     */
    flexGrow?: number;
    /**
     * Flex shrink factor.
     * @example 1, 0, 0.5
     */
    flexShrink?: number;
    /**
     * Flex basis.
     * @example "auto", "200px", "50%"
     */
    flexBasis?: SizeValue | "auto";
    /**
     * Flex shorthand.
     * @example "1 0 auto", "none"
     */
    flex?: string | number;
    /**
     * Align self alignment.
     * @example "center", "flex-start", "stretch"
     */
    alignSelf?: AlignItems | "auto";
    /**
     * Grid template columns.
     * @example "1fr 1fr 1fr", "repeat(3, 1fr)", "100px auto 200px"
     */
    gridTemplateColumns?: string;
    /**
     * Grid template rows.
     * @example "auto 1fr auto", "repeat(3, 100px)"
     */
    gridTemplateRows?: string;
    /**
     * Grid template areas.
     * @example "'header header' 'sidebar main' 'footer footer'"
     */
    gridTemplateAreas?: string;
    /**
     * Grid auto columns.
     * @example "1fr", "minmax(100px, 1fr)"
     */
    gridAutoColumns?: string;
    /**
     * Grid auto rows.
     * @example "100px", "minmax(50px, auto)"
     */
    gridAutoRows?: string;
    /**
     * Grid auto flow.
     * @example "row", "column", "row dense"
     */
    gridAutoFlow?: "row" | "column" | "row dense" | "column dense";
    /**
     * Grid column start.
     * @example 1, "span 2", "auto"
     */
    gridColumnStart?: number | string;
    /**
     * Grid column end.
     * @example 3, "span 2", "auto"
     */
    gridColumnEnd?: number | string;
    /**
     * Grid row start.
     * @example 1, "span 2", "auto"
     */
    gridRowStart?: number | string;
    /**
     * Grid row end.
     * @example 3, "span 2", "auto"
     */
    gridRowEnd?: number | string;
    /**
     * Grid column shorthand.
     * @example "1 / 3", "span 2"
     */
    gridColumn?: string;
    /**
     * Grid row shorthand.
     * @example "1 / 3", "span 2"
     */
    gridRow?: string;
    /**
     * Grid area.
     * @example "header", "1 / 1 / 3 / 3"
     */
    gridArea?: string;
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
 *   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
 *   transition: { property: "all", duration: "0.3s" }
 * });
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
/**
 * Converts a GradientValue to CSS string.
 *
 * @param gradient - The gradient to convert
 * @returns CSS gradient string
 *
 * @example
 * ```typescript
 * gradientToCSS({
 *   type: "linear",
 *   direction: "to right",
 *   stops: ["red", "blue"]
 * }); // "linear-gradient(to right, red, blue)"
 * ```
 */
export declare function gradientToCSS(gradient: GradientValue): string;
/**
 * Converts a BordersValue to CSS properties object.
 */
export declare function bordersToCSS(borders: BordersValue): Record<string, string>;
/**
 * Converts a BoxShadowValue to CSS string.
 */
export declare function boxShadowValueToCSS(shadows: BoxShadowValue): string;
/**
 * Converts a TextShadowValue to CSS string.
 */
export declare function textShadowValueToCSS(shadows: TextShadowValue): string;
/**
 * Converts a TransformValue to CSS string.
 */
export declare function transformToCSS(transform: TransformValue): string;
/**
 * Converts a TransitionValue to CSS string.
 */
export declare function transitionValueToCSS(transitions: TransitionValue): string;
/**
 * Converts an AnimationValue to CSS string.
 */
export declare function animationValueToCSS(animations: AnimationValue): string;
//# sourceMappingURL=styles.d.ts.map