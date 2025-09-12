/**
 * Color Palette Utility Module
 *
 * Manages color assignments for object detection labels and UI elements.
 */
/**
 * Predefined color palette for label classes
 * Uses a mix of distinct colors optimized for visibility and accessibility
 */
export declare const colorPalette: string[];
/**
 * Default fallback color for invalid or unassigned classes
 */
export declare const DEFAULT_COLOR = "#000000";
/**
 * Gets a color for a specific label class
 * @param labelClass - The label class identifier (string or number)
 * @returns Color hex string
 */
export declare function getColorForClass(labelClass: string | number): string;
/**
 * Gets multiple colors for a list of label classes
 * @param labelClasses - Array of label class identifiers
 * @returns Array of color hex strings
 */
export declare function getColorsForClasses(labelClasses: (string | number)[]): string[];
/**
 * Validates if a color is in the palette
 * @param color - Color hex string to validate
 * @returns True if color exists in palette
 */
export declare function isColorInPalette(color: string): boolean;
/**
 * Gets the index of a color in the palette
 * @param color - Color hex string
 * @returns Index of the color, or -1 if not found
 */
export declare function getColorIndex(color: string): number;
/**
 * Gets a contrasting text color (black or white) for a given background color
 * @param backgroundColor - Background color hex string
 * @returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 */
export declare function getContrastingTextColor(backgroundColor: string): string;
/**
 * Converts hex color to RGBA
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export declare function hexToRgba(hex: string, alpha?: number): string;
/**
 * Color configuration interface
 */
export interface ColorConfig {
    palette: string[];
    defaultColor: string;
    useHighContrast: boolean;
}
/**
 * Advanced color management class
 */
export declare class ColorManager {
    private palette;
    private defaultColor;
    private useHighContrast;
    constructor(config?: Partial<ColorConfig>);
    /**
     * Gets color for class with advanced options
     */
    getColor(labelClass: string | number, options?: {
        highContrast?: boolean;
    }): string;
    /**
     * Gets a high contrast version of a color
     */
    private getHighContrastColor;
    /**
     * Calculates color luminance
     */
    private getColorLuminance;
}
//# sourceMappingURL=color-palette.d.ts.map