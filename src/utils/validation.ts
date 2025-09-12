/**
 * Validation Utility Module
 * 
 * Provides input validation functions for the Easy Labeling application.
 */

import { showToast, showErrorToast } from './notifications';

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
export function validateLabelClass(input: string | null): string | null {
    if (input === null) {
        return null; // User cancelled prompt
    }

    const trimmedInput = input.trim();
    
    if (trimmedInput === '') {
        showToast('Label class cannot be empty.', 3000);
        return null;
    }

    const num = Number(trimmedInput);

    if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 10000) {
        showToast('Invalid Label: Please enter an integer between 0 and 10000.', 4000);
        return null;
    }

    return String(num);
}

/**
 * Advanced label class validation with detailed result
 * @param input - Raw input to validate
 * @returns Detailed validation result
 */
export function validateLabelClassAdvanced(input: string | null): ValidationResult {
    if (input === null) {
        return {
            isValid: false,
            errorMessage: 'Input was cancelled'
        };
    }

    const trimmedInput = input.trim();
    
    if (trimmedInput === '') {
        return {
            isValid: false,
            errorMessage: 'Label class cannot be empty'
        };
    }

    const num = Number(trimmedInput);

    if (isNaN(num)) {
        return {
            isValid: false,
            errorMessage: 'Label class must be a number'
        };
    }

    if (!Number.isInteger(num)) {
        return {
            isValid: false,
            errorMessage: 'Label class must be an integer'
        };
    }

    if (num < 0) {
        return {
            isValid: false,
            errorMessage: 'Label class cannot be negative'
        };
    }

    if (num > 10000) {
        return {
            isValid: false,
            errorMessage: 'Label class cannot exceed 10000'
        };
    }

    return {
        isValid: true,
        value: String(num)
    };
}

/**
 * Validates file name for safety
 * @param fileName - File name to validate
 * @returns True if valid, false otherwise
 */
export function validateFileName(fileName: string): boolean {
    if (!fileName || fileName.trim().length === 0) {
        return false;
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(fileName)) {
        return false;
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(fileName)) {
        return false;
    }

    return true;
}

/**
 * Validates image file extension
 * @param fileName - File name to check
 * @returns True if valid image extension
 */
export function validateImageExtension(fileName: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return validExtensions.includes(extension);
}

/**
 * Validates coordinate values for bounding boxes
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Width
 * @param height - Height
 * @returns Validation result
 */
export function validateBoundingBox(
    x: number, 
    y: number, 
    width: number, 
    height: number
): ValidationResult {
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
        return {
            isValid: false,
            errorMessage: 'All coordinates must be valid numbers'
        };
    }

    if (width <= 0 || height <= 0) {
        return {
            isValid: false,
            errorMessage: 'Width and height must be positive'
        };
    }

    if (x < 0 || y < 0) {
        return {
            isValid: false,
            errorMessage: 'Coordinates cannot be negative'
        };
    }

    return {
        isValid: true
    };
}

/**
 * Validates YOLO format coordinates (normalized 0-1)
 * @param centerX - Normalized center X (0-1)
 * @param centerY - Normalized center Y (0-1)
 * @param width - Normalized width (0-1)
 * @param height - Normalized height (0-1)
 * @returns Validation result
 */
export function validateYOLOCoordinates(
    centerX: number,
    centerY: number,
    width: number,
    height: number
): ValidationResult {
    if (isNaN(centerX) || isNaN(centerY) || isNaN(width) || isNaN(height)) {
        return {
            isValid: false,
            errorMessage: 'All YOLO coordinates must be valid numbers'
        };
    }

    if (centerX < 0 || centerX > 1 || centerY < 0 || centerY > 1) {
        return {
            isValid: false,
            errorMessage: 'Center coordinates must be between 0 and 1'
        };
    }

    if (width <= 0 || width > 1 || height <= 0 || height > 1) {
        return {
            isValid: false,
            errorMessage: 'Width and height must be between 0 and 1'
        };
    }

    return {
        isValid: true
    };
}

/**
 * Validates zoom level
 * @param zoom - Zoom level to validate
 * @returns True if valid zoom level
 */
export function validateZoomLevel(zoom: number): boolean {
    return !isNaN(zoom) && zoom > 0.1 && zoom <= 10;
}

/**
 * Validates font size for labels
 * @param fontSize - Font size to validate
 * @returns True if valid font size
 */
export function validateFontSize(fontSize: number): boolean {
    return !isNaN(fontSize) && fontSize >= 8 && fontSize <= 72;
}

/**
 * General purpose number validation
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param allowFloat - Whether to allow floating point numbers
 * @returns Validation result
 */
export function validateNumber(
    value: string | number,
    min?: number,
    max?: number,
    allowFloat: boolean = true
): ValidationResult {
    const num = typeof value === 'string' ? Number(value) : value;

    if (isNaN(num)) {
        return {
            isValid: false,
            errorMessage: 'Value must be a valid number'
        };
    }

    if (!allowFloat && !Number.isInteger(num)) {
        return {
            isValid: false,
            errorMessage: 'Value must be an integer'
        };
    }

    if (min !== undefined && num < min) {
        return {
            isValid: false,
            errorMessage: `Value must be at least ${min}`
        };
    }

    if (max !== undefined && num > max) {
        return {
            isValid: false,
            errorMessage: `Value cannot exceed ${max}`
        };
    }

    return {
        isValid: true,
        value: num
    };
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL format
 */
export function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitizes string input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}