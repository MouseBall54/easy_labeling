/**
 * Color Palette Utility Module
 * 
 * Manages color assignments for object detection labels and UI elements.
 */

/**
 * Predefined color palette for label classes
 * Uses a mix of distinct colors optimized for visibility and accessibility
 */
export const colorPalette: string[] = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
    '#ffffff', '#000000', '#1f77b4', '#ff7f0e', '#2ca02c',
    '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'
];

/**
 * Default fallback color for invalid or unassigned classes
 */
export const DEFAULT_COLOR = '#000000';

/**
 * Gets a color for a specific label class
 * @param labelClass - The label class identifier (string or number)
 * @returns Color hex string
 */
export function getColorForClass(labelClass: string | number): string {
    const classNumber = typeof labelClass === 'string' 
        ? parseInt(labelClass, 10) 
        : labelClass;

    if (isNaN(classNumber) || classNumber < 0) {
        return DEFAULT_COLOR;
    }

    const colorIndex = classNumber % colorPalette.length;
    return colorPalette[colorIndex] || DEFAULT_COLOR;
}

/**
 * Gets multiple colors for a list of label classes
 * @param labelClasses - Array of label class identifiers
 * @returns Array of color hex strings
 */
export function getColorsForClasses(labelClasses: (string | number)[]): string[] {
    return labelClasses.map(labelClass => getColorForClass(labelClass));
}

/**
 * Validates if a color is in the palette
 * @param color - Color hex string to validate
 * @returns True if color exists in palette
 */
export function isColorInPalette(color: string): boolean {
    return colorPalette.includes(color.toLowerCase());
}

/**
 * Gets the index of a color in the palette
 * @param color - Color hex string
 * @returns Index of the color, or -1 if not found
 */
export function getColorIndex(color: string): number {
    return colorPalette.findIndex(c => c.toLowerCase() === color.toLowerCase());
}

/**
 * Gets a contrasting text color (black or white) for a given background color
 * @param backgroundColor - Background color hex string
 * @returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 */
export function getContrastingTextColor(backgroundColor: string): string {
    // Remove # if present
    const hex = backgroundColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Converts hex color to RGBA
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
export class ColorManager {
    private palette: string[];
    private defaultColor: string;
    private useHighContrast: boolean;

    constructor(config: Partial<ColorConfig> = {}) {
        this.palette = config.palette || colorPalette;
        this.defaultColor = config.defaultColor || DEFAULT_COLOR;
        this.useHighContrast = config.useHighContrast || false;
    }

    /**
     * Gets color for class with advanced options
     */
    getColor(labelClass: string | number, options?: { highContrast?: boolean }): string {
        const baseColor = getColorForClass(labelClass);
        
        if (options?.highContrast || this.useHighContrast) {
            // Return high contrast version of color
            return this.getHighContrastColor(baseColor);
        }
        
        return baseColor;
    }

    /**
     * Gets a high contrast version of a color
     */
    private getHighContrastColor(color: string): string {
        // Simple high contrast implementation
        // In a real implementation, you might use color theory algorithms
        const luminance = this.getColorLuminance(color);
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    /**
     * Calculates color luminance
     */
    private getColorLuminance(hex: string): number {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
        
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }
}