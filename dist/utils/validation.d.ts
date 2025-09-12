/**
 * Validation Utility Module
 *
 * Provides input validation functions for the Easy Labeling application.
 */
/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    value?: string | number;
    errorMessage?: string;
}
/**
 * Validates label class input from user
 * @param input - Raw input from user (can be null if cancelled)
 * @returns Validated class string or null if invalid
 */
export declare function validateLabelClass(input: string | null): string | null;
/**
 * Advanced label class validation with detailed result
 * @param input - Raw input to validate
 * @returns Detailed validation result
 */
export declare function validateLabelClassAdvanced(input: string | null): ValidationResult;
/**
 * Validates file name for safety
 * @param fileName - File name to validate
 * @returns True if valid, false otherwise
 */
export declare function validateFileName(fileName: string): boolean;
/**
 * Validates image file extension
 * @param fileName - File name to check
 * @returns True if valid image extension
 */
export declare function validateImageExtension(fileName: string): boolean;
/**
 * Validates coordinate values for bounding boxes
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Width
 * @param height - Height
 * @returns Validation result
 */
export declare function validateBoundingBox(x: number, y: number, width: number, height: number): ValidationResult;
/**
 * Validates YOLO format coordinates (normalized 0-1)
 * @param centerX - Normalized center X (0-1)
 * @param centerY - Normalized center Y (0-1)
 * @param width - Normalized width (0-1)
 * @param height - Normalized height (0-1)
 * @returns Validation result
 */
export declare function validateYOLOCoordinates(centerX: number, centerY: number, width: number, height: number): ValidationResult;
/**
 * Validates zoom level
 * @param zoom - Zoom level to validate
 * @returns True if valid zoom level
 */
export declare function validateZoomLevel(zoom: number): boolean;
/**
 * Validates font size for labels
 * @param fontSize - Font size to validate
 * @returns True if valid font size
 */
export declare function validateFontSize(fontSize: number): boolean;
/**
 * General purpose number validation
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param allowFloat - Whether to allow floating point numbers
 * @returns Validation result
 */
export declare function validateNumber(value: string | number, min?: number, max?: number, allowFloat?: boolean): ValidationResult;
/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export declare function validateEmail(email: string): boolean;
/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL format
 */
export declare function validateUrl(url: string): boolean;
/**
 * Sanitizes string input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export declare function sanitizeInput(input: string): string;
//# sourceMappingURL=validation.d.ts.map