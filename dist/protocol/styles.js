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
 *   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
 *   transition: { property: "all", duration: "0.3s" }
 * });
 * ```
 */
export function elementStyleToCSS(style) {
    const css = {};
    // Typography & Text
    if (style.fontSize)
        css.fontSize = sizeToCSS(style.fontSize);
    if (style.fontFamily)
        css.fontFamily = style.fontFamily;
    if (style.fontWeight)
        css.fontWeight = style.fontWeight.toString();
    if (style.fontStyle)
        css.fontStyle = style.fontStyle;
    if (style.lineHeight) {
        css.lineHeight =
            typeof style.lineHeight === "number"
                ? style.lineHeight.toString()
                : sizeToCSS(style.lineHeight);
    }
    if (style.letterSpacing)
        css.letterSpacing = sizeToCSS(style.letterSpacing);
    if (style.wordSpacing)
        css.wordSpacing = sizeToCSS(style.wordSpacing);
    if (style.textAlign)
        css.textAlign = style.textAlign;
    if (style.textDecoration)
        css.textDecoration = style.textDecoration;
    if (style.textTransform)
        css.textTransform = style.textTransform;
    if (style.whiteSpace)
        css.whiteSpace = style.whiteSpace;
    if (style.wordBreak)
        css.wordBreak = style.wordBreak;
    if (style.textOverflow)
        css.textOverflow = style.textOverflow;
    if (style.textShadow)
        css.textShadow = textShadowValueToCSS(style.textShadow);
    // Colors & Backgrounds
    if (style.color)
        css.color = style.color;
    if (style.backgroundColor)
        css.backgroundColor = style.backgroundColor;
    if (style.backgroundGradient) {
        css.backgroundImage = gradientToCSS(style.backgroundGradient);
    }
    if (style.backgroundImage)
        css.backgroundImage = style.backgroundImage;
    if (style.backgroundSize)
        css.backgroundSize = style.backgroundSize;
    if (style.backgroundPosition)
        css.backgroundPosition = style.backgroundPosition;
    if (style.backgroundRepeat)
        css.backgroundRepeat = style.backgroundRepeat;
    if (style.backgroundAttachment)
        css.backgroundAttachment = style.backgroundAttachment;
    if (style.opacity !== undefined)
        css.opacity = style.opacity.toString();
    // Spacing
    if (style.margin)
        css.margin = spacingToCSS(style.margin);
    if (style.padding)
        css.padding = spacingToCSS(style.padding);
    // Borders & Radius
    if (style.border) {
        Object.assign(css, bordersToCSS(style.border));
    }
    if (style.borderRadius)
        css.borderRadius = borderRadiusToCSS(style.borderRadius);
    // Effects & Transforms
    if (style.boxShadow)
        css.boxShadow = boxShadowValueToCSS(style.boxShadow);
    if (style.transform)
        css.transform = transformToCSS(style.transform);
    if (style.transformOrigin)
        css.transformOrigin = style.transformOrigin;
    // Transitions & Animations
    if (style.transition)
        css.transition = transitionValueToCSS(style.transition);
    if (style.animation)
        css.animation = animationValueToCSS(style.animation);
    // Interaction
    if (style.cursor)
        css.cursor = style.cursor;
    if (style.userSelect)
        css.userSelect = style.userSelect;
    if (style.pointerEvents)
        css.pointerEvents = style.pointerEvents;
    // Misc
    if (style.zIndex !== undefined)
        css.zIndex = style.zIndex.toString();
    if (style.overflow)
        css.overflow = style.overflow;
    if (style.overflowX)
        css.overflowX = style.overflowX;
    if (style.overflowY)
        css.overflowY = style.overflowY;
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
    // Dimensions
    if (style.width)
        css.width = sizeToCSS(style.width);
    if (style.height)
        css.height = sizeToCSS(style.height);
    if (style.maxWidth)
        css.maxWidth = sizeToCSS(style.maxWidth);
    if (style.maxHeight)
        css.maxHeight = sizeToCSS(style.maxHeight);
    if (style.minWidth)
        css.minWidth = sizeToCSS(style.minWidth);
    if (style.minHeight)
        css.minHeight = sizeToCSS(style.minHeight);
    // Layout & Display
    if (style.display)
        css.display = style.display;
    if (style.position)
        css.position = style.position;
    if (style.top)
        css.top = style.top === "auto" ? "auto" : sizeToCSS(style.top);
    if (style.right)
        css.right = style.right === "auto" ? "auto" : sizeToCSS(style.right);
    if (style.bottom)
        css.bottom = style.bottom === "auto" ? "auto" : sizeToCSS(style.bottom);
    if (style.left)
        css.left = style.left === "auto" ? "auto" : sizeToCSS(style.left);
    // Flexbox Properties
    if (style.flexDirection)
        css.flexDirection = style.flexDirection;
    if (style.flexWrap)
        css.flexWrap = style.flexWrap;
    if (style.justifyContent)
        css.justifyContent = style.justifyContent;
    if (style.alignItems)
        css.alignItems = style.alignItems;
    if (style.alignContent)
        css.alignContent = style.alignContent;
    if (style.gap)
        css.gap = sizeToCSS(style.gap);
    if (style.rowGap)
        css.rowGap = sizeToCSS(style.rowGap);
    if (style.columnGap)
        css.columnGap = sizeToCSS(style.columnGap);
    // Flex Item Properties
    if (style.flexGrow !== undefined)
        css.flexGrow = style.flexGrow.toString();
    if (style.flexShrink !== undefined)
        css.flexShrink = style.flexShrink.toString();
    if (style.flexBasis)
        css.flexBasis =
            style.flexBasis === "auto" ? "auto" : sizeToCSS(style.flexBasis);
    if (style.flex)
        css.flex =
            typeof style.flex === "number" ? style.flex.toString() : style.flex;
    if (style.alignSelf)
        css.alignSelf = style.alignSelf;
    // Grid Properties (Container)
    if (style.gridTemplateColumns)
        css.gridTemplateColumns = style.gridTemplateColumns;
    if (style.gridTemplateRows)
        css.gridTemplateRows = style.gridTemplateRows;
    if (style.gridTemplateAreas)
        css.gridTemplateAreas = style.gridTemplateAreas;
    if (style.gridAutoColumns)
        css.gridAutoColumns = style.gridAutoColumns;
    if (style.gridAutoRows)
        css.gridAutoRows = style.gridAutoRows;
    if (style.gridAutoFlow)
        css.gridAutoFlow = style.gridAutoFlow;
    // Grid Properties (Item)
    if (style.gridColumnStart)
        css.gridColumnStart = style.gridColumnStart.toString();
    if (style.gridColumnEnd)
        css.gridColumnEnd = style.gridColumnEnd.toString();
    if (style.gridRowStart)
        css.gridRowStart = style.gridRowStart.toString();
    if (style.gridRowEnd)
        css.gridRowEnd = style.gridRowEnd.toString();
    if (style.gridColumn)
        css.gridColumn = style.gridColumn;
    if (style.gridRow)
        css.gridRow = style.gridRow;
    if (style.gridArea)
        css.gridArea = style.gridArea;
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
// ============================================================================
// Advanced Utility Functions
// ============================================================================
/**
 * Converts a GradientStop to CSS string.
 */
function gradientStopToCSS(stop) {
    if (typeof stop === "string") {
        return stop;
    }
    const position = stop.position
        ? typeof stop.position === "number"
            ? `${stop.position * 100}%`
            : stop.position
        : "";
    return position ? `${stop.color} ${position}` : stop.color;
}
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
export function gradientToCSS(gradient) {
    const stops = gradient.stops.map(gradientStopToCSS).join(", ");
    switch (gradient.type) {
        case "linear": {
            const direction = gradient.direction ? `${gradient.direction}, ` : "";
            return `linear-gradient(${direction}${stops})`;
        }
        case "radial": {
            const parts = [];
            if (gradient.shape)
                parts.push(gradient.shape);
            if (gradient.size) {
                const size = typeof gradient.size === "string"
                    ? gradient.size
                    : sizeToCSS(gradient.size);
                parts.push(size);
            }
            if (gradient.position)
                parts.push(`at ${gradient.position}`);
            const config = parts.length > 0 ? `${parts.join(" ")}, ` : "";
            return `radial-gradient(${config}${stops})`;
        }
        case "conic": {
            const parts = [];
            if (gradient.angle)
                parts.push(`from ${gradient.angle}`);
            if (gradient.position)
                parts.push(`at ${gradient.position}`);
            const config = parts.length > 0 ? `${parts.join(" ")}, ` : "";
            return `conic-gradient(${config}${stops})`;
        }
        default:
            return "";
    }
}
/**
 * Converts a BorderValue to CSS string.
 */
function borderValueToCSS(border) {
    if (typeof border === "string") {
        return border;
    }
    const parts = [];
    if (border.width)
        parts.push(sizeToCSS(border.width));
    if (border.style)
        parts.push(border.style);
    if (border.color)
        parts.push(border.color);
    return parts.join(" ");
}
/**
 * Converts a BordersValue to CSS properties object.
 */
export function bordersToCSS(borders) {
    if (typeof borders === "string" ||
        (typeof borders === "object" &&
            ("width" in borders || "style" in borders || "color" in borders))) {
        return { border: borderValueToCSS(borders) };
    }
    const individual = borders;
    const css = {};
    if (individual.top)
        css.borderTop = borderValueToCSS(individual.top);
    if (individual.right)
        css.borderRight = borderValueToCSS(individual.right);
    if (individual.bottom)
        css.borderBottom = borderValueToCSS(individual.bottom);
    if (individual.left)
        css.borderLeft = borderValueToCSS(individual.left);
    return css;
}
/**
 * Converts a BoxShadow to CSS string.
 */
function boxShadowToCSS(shadow) {
    const parts = [];
    if (shadow.inset)
        parts.push("inset");
    parts.push(sizeToCSS(shadow.offsetX));
    parts.push(sizeToCSS(shadow.offsetY));
    if (shadow.blurRadius)
        parts.push(sizeToCSS(shadow.blurRadius));
    if (shadow.spreadRadius)
        parts.push(sizeToCSS(shadow.spreadRadius));
    if (shadow.color)
        parts.push(shadow.color);
    return parts.join(" ");
}
/**
 * Converts a BoxShadowValue to CSS string.
 */
export function boxShadowValueToCSS(shadows) {
    if (typeof shadows === "string") {
        return shadows;
    }
    if (Array.isArray(shadows)) {
        return shadows
            .map((shadow) => typeof shadow === "string" ? shadow : boxShadowToCSS(shadow))
            .join(", ");
    }
    return boxShadowToCSS(shadows);
}
/**
 * Converts a TextShadow to CSS string.
 */
function textShadowToCSS(shadow) {
    const parts = [];
    parts.push(sizeToCSS(shadow.offsetX));
    parts.push(sizeToCSS(shadow.offsetY));
    if (shadow.blurRadius)
        parts.push(sizeToCSS(shadow.blurRadius));
    if (shadow.color)
        parts.push(shadow.color);
    return parts.join(" ");
}
/**
 * Converts a TextShadowValue to CSS string.
 */
export function textShadowValueToCSS(shadows) {
    if (typeof shadows === "string") {
        return shadows;
    }
    if (Array.isArray(shadows)) {
        return shadows
            .map((shadow) => typeof shadow === "string" ? shadow : textShadowToCSS(shadow))
            .join(", ");
    }
    return textShadowToCSS(shadows);
}
/**
 * Converts a TransformValue to CSS string.
 */
export function transformToCSS(transform) {
    if (typeof transform === "string") {
        return transform;
    }
    const functions = [];
    if (transform.translateX)
        functions.push(`translateX(${sizeToCSS(transform.translateX)})`);
    if (transform.translateY)
        functions.push(`translateY(${sizeToCSS(transform.translateY)})`);
    if (transform.translateZ)
        functions.push(`translateZ(${sizeToCSS(transform.translateZ)})`);
    if (transform.scaleX)
        functions.push(`scaleX(${transform.scaleX})`);
    if (transform.scaleY)
        functions.push(`scaleY(${transform.scaleY})`);
    if (transform.scaleZ)
        functions.push(`scaleZ(${transform.scaleZ})`);
    if (transform.scale)
        functions.push(`scale(${transform.scale})`);
    if (transform.rotate)
        functions.push(`rotate(${transform.rotate})`);
    if (transform.rotateX)
        functions.push(`rotateX(${transform.rotateX})`);
    if (transform.rotateY)
        functions.push(`rotateY(${transform.rotateY})`);
    if (transform.rotateZ)
        functions.push(`rotateZ(${transform.rotateZ})`);
    if (transform.skewX)
        functions.push(`skewX(${transform.skewX})`);
    if (transform.skewY)
        functions.push(`skewY(${transform.skewY})`);
    return functions.join(" ");
}
/**
 * Converts a Transition to CSS string.
 */
function transitionToCSS(transition) {
    const parts = [];
    if (transition.property)
        parts.push(transition.property);
    if (transition.duration)
        parts.push(transition.duration);
    if (transition.timingFunction)
        parts.push(transition.timingFunction);
    if (transition.delay)
        parts.push(transition.delay);
    return parts.join(" ");
}
/**
 * Converts a TransitionValue to CSS string.
 */
export function transitionValueToCSS(transitions) {
    if (typeof transitions === "string") {
        return transitions;
    }
    if (Array.isArray(transitions)) {
        return transitions
            .map((transition) => typeof transition === "string"
            ? transition
            : transitionToCSS(transition))
            .join(", ");
    }
    return transitionToCSS(transitions);
}
/**
 * Converts an Animation to CSS string.
 */
function animationToCSS(animation) {
    const parts = [];
    parts.push(animation.name);
    if (animation.duration)
        parts.push(animation.duration);
    if (animation.timingFunction)
        parts.push(animation.timingFunction);
    if (animation.delay)
        parts.push(animation.delay);
    if (animation.iterationCount) {
        parts.push(animation.iterationCount.toString());
    }
    if (animation.direction)
        parts.push(animation.direction);
    if (animation.fillMode)
        parts.push(animation.fillMode);
    if (animation.playState)
        parts.push(animation.playState);
    return parts.join(" ");
}
/**
 * Converts an AnimationValue to CSS string.
 */
export function animationValueToCSS(animations) {
    if (typeof animations === "string") {
        return animations;
    }
    if (Array.isArray(animations)) {
        return animations
            .map((animation) => typeof animation === "string" ? animation : animationToCSS(animation))
            .join(", ");
    }
    return animationToCSS(animations);
}
//# sourceMappingURL=styles.js.map