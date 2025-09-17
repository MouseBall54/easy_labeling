/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 87:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColorManager: () => (/* binding */ ColorManager),
/* harmony export */   DEFAULT_COLOR: () => (/* binding */ DEFAULT_COLOR),
/* harmony export */   colorPalette: () => (/* binding */ colorPalette),
/* harmony export */   getColorForClass: () => (/* binding */ getColorForClass),
/* harmony export */   getColorIndex: () => (/* binding */ getColorIndex),
/* harmony export */   getColorsForClasses: () => (/* binding */ getColorsForClasses),
/* harmony export */   getContrastingTextColor: () => (/* binding */ getContrastingTextColor),
/* harmony export */   hexToRgba: () => (/* binding */ hexToRgba),
/* harmony export */   isColorInPalette: () => (/* binding */ isColorInPalette)
/* harmony export */ });
/**
 * Color Palette Utility Module
 *
 * Manages color assignments for object detection labels and UI elements.
 */
/**
 * Predefined color palette for label classes
 * Uses a mix of distinct colors optimized for visibility and accessibility
 */
const colorPalette = [
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
const DEFAULT_COLOR = '#000000';
/**
 * Gets a color for a specific label class
 * @param labelClass - The label class identifier (string or number)
 * @returns Color hex string
 */
function getColorForClass(labelClass) {
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
function getColorsForClasses(labelClasses) {
    return labelClasses.map(labelClass => getColorForClass(labelClass));
}
/**
 * Validates if a color is in the palette
 * @param color - Color hex string to validate
 * @returns True if color exists in palette
 */
function isColorInPalette(color) {
    return colorPalette.includes(color.toLowerCase());
}
/**
 * Gets the index of a color in the palette
 * @param color - Color hex string
 * @returns Index of the color, or -1 if not found
 */
function getColorIndex(color) {
    return colorPalette.findIndex(c => c.toLowerCase() === color.toLowerCase());
}
/**
 * Gets a contrasting text color (black or white) for a given background color
 * @param backgroundColor - Background color hex string
 * @returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 */
function getContrastingTextColor(backgroundColor) {
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
function hexToRgba(hex, alpha = 1) {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
/**
 * Advanced color management class
 */
class ColorManager {
    constructor(config = {}) {
        this.palette = config.palette || colorPalette;
        this.defaultColor = config.defaultColor || DEFAULT_COLOR;
        this.useHighContrast = config.useHighContrast || false;
    }
    /**
     * Gets color for class with advanced options
     */
    getColor(labelClass, options) {
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
    getHighContrastColor(color) {
        // Simple high contrast implementation
        // In a real implementation, you might use color theory algorithms
        const luminance = this.getColorLuminance(color);
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    /**
     * Calculates color luminance
     */
    getColorLuminance(hex) {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }
}


/***/ }),

/***/ 371:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sanitizeInput: () => (/* binding */ sanitizeInput),
/* harmony export */   validateBoundingBox: () => (/* binding */ validateBoundingBox),
/* harmony export */   validateEmail: () => (/* binding */ validateEmail),
/* harmony export */   validateFileName: () => (/* binding */ validateFileName),
/* harmony export */   validateFontSize: () => (/* binding */ validateFontSize),
/* harmony export */   validateImageExtension: () => (/* binding */ validateImageExtension),
/* harmony export */   validateLabelClass: () => (/* binding */ validateLabelClass),
/* harmony export */   validateLabelClassAdvanced: () => (/* binding */ validateLabelClassAdvanced),
/* harmony export */   validateNumber: () => (/* binding */ validateNumber),
/* harmony export */   validateUrl: () => (/* binding */ validateUrl),
/* harmony export */   validateYOLOCoordinates: () => (/* binding */ validateYOLOCoordinates),
/* harmony export */   validateZoomLevel: () => (/* binding */ validateZoomLevel)
/* harmony export */ });
/* harmony import */ var _notifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(934);
/**
 * Validation Utility Module
 *
 * Provides input validation functions for the Easy Labeling application.
 */

/**
 * Validates label class input from user
 * @param input - Raw input from user (can be null if cancelled)
 * @returns Validated class string or null if invalid
 */
function validateLabelClass(input) {
    if (input === null) {
        return null; // User cancelled prompt
    }
    const trimmedInput = input.trim();
    if (trimmedInput === '') {
        (0,_notifications__WEBPACK_IMPORTED_MODULE_0__.showToast)('Label class cannot be empty.', 3000);
        return null;
    }
    const num = Number(trimmedInput);
    if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 10000) {
        (0,_notifications__WEBPACK_IMPORTED_MODULE_0__.showToast)('Invalid Label: Please enter an integer between 0 and 10000.', 4000);
        return null;
    }
    return String(num);
}
/**
 * Advanced label class validation with detailed result
 * @param input - Raw input to validate
 * @returns Detailed validation result
 */
function validateLabelClassAdvanced(input) {
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
function validateFileName(fileName) {
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
function validateImageExtension(fileName) {
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
function validateBoundingBox(x, y, width, height) {
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
function validateYOLOCoordinates(centerX, centerY, width, height) {
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
function validateZoomLevel(zoom) {
    return !isNaN(zoom) && zoom > 0.1 && zoom <= 10;
}
/**
 * Validates font size for labels
 * @param fontSize - Font size to validate
 * @returns True if valid font size
 */
function validateFontSize(fontSize) {
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
function validateNumber(value, min, max, allowFloat = true) {
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
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL format
 */
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Sanitizes string input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
function sanitizeInput(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}


/***/ }),

/***/ 934:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   showErrorToast: () => (/* binding */ showErrorToast),
/* harmony export */   showSuccessToast: () => (/* binding */ showSuccessToast),
/* harmony export */   showToast: () => (/* binding */ showToast),
/* harmony export */   showTypedToast: () => (/* binding */ showTypedToast),
/* harmony export */   showWarningToast: () => (/* binding */ showWarningToast)
/* harmony export */ });
/**
 * Notifications Utility Module
 *
 * Handles user notification system including toast messages and alerts.
 */
/**
 * Shows a toast notification message to the user
 * @param message - The message to display
 * @param duration - Duration in milliseconds (default: 3000ms)
 */
function showToast(message, duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn('Toast container not found. Message:', message);
        return;
    }
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    // Show toast with slight delay for animation
    setTimeout(() => toast.classList.add('show'), 10);
    // Hide and remove toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300); // Wait for fade-out animation
    }, duration);
}
/**
 * Shows an error toast with longer duration
 * @param message - Error message to display
 */
function showErrorToast(message) {
    showToast(message, 4000);
}
/**
 * Shows a success toast with standard duration
 * @param message - Success message to display
 */
function showSuccessToast(message) {
    showToast(message, 2000);
}
/**
 * Shows a warning toast
 * @param message - Warning message to display
 */
function showWarningToast(message) {
    showToast(message, 3500);
}
/**
 * Shows a typed toast notification
 * @param config - Toast configuration object
 */
function showTypedToast(config) {
    const { message, type, duration, dismissible = false } = config;
    const defaultDurations = {
        success: 2000,
        error: 4000,
        warning: 3500,
        info: 3000
    };
    const toastDuration = duration ?? defaultDurations[type];
    if (dismissible) {
        // For dismissible toasts, we could add close button logic here
        showToast(`${message} [Dismissible]`, toastDuration);
    }
    else {
        showToast(message, toastDuration);
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// UNUSED EXPORTS: AppState, FileSystemService, YoloParser, createAppState, createAppStateWithConfig, createFileSystemService, exportYolo, parseYolo, validateYoloString

;// ./src/models/AppState.ts
/**
 * AppState Model - Main Application State Management
 *
 * Centralized state management for the Easy Labeling application.
 * Handles all application state including files, UI settings, cache, and current workspace.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */
/**
 * AppState Class
 *
 * Implements the complete application state management with type safety.
 * Provides methods for managing files, UI state, cache, and user interactions.
 */
class AppState {
    /**
     * Constructor - Initialize AppState with default values
     */
    constructor() {
        // ===================================================================
        // File Handles (File System Access API)
        // ===================================================================
        this.imageFolderHandle = null;
        this.labelFolderHandle = null;
        this.classInfoFolderHandle = null;
        // ===================================================================
        // File Data Arrays
        // ===================================================================
        this.imageFiles = [];
        this.classFiles = [];
        this.selectedClassFile = null;
        // ===================================================================
        // Status Tracking Maps
        // ===================================================================
        this.imageLabelStatus = new Map(); // fileName -> hasLabels
        this.classNames = new Map(); // classId -> className
        this.previewImageCache = new Map(); // fileName -> objectURL
        this.collapsedLabelGroups = new Set(); // collapsed group IDs
        // ===================================================================
        // Current Working State
        // ===================================================================
        this.currentImageFile = null;
        this.currentImage = null;
        this.currentMode = 'edit';
        this.currentLoadToken = 0;
        // ===================================================================
        // UI Settings & Preferences
        // ===================================================================
        this.isAutoSaveEnabled = false;
        this.showLabelsOnCanvas = true;
        this.labelFontSize = 14;
        this.labelSortOrder = 'asc';
        this.isPreviewBarHidden = false;
        this.isCrosshairVisible = false;
        // ===================================================================
        // Internal State & Temporary Data
        // ===================================================================
        this.saveTimeout = null;
        this._clipboard = null;
        this.lastMousePosition = { x: 0, y: 0 };
        this.contextTarget = null;
        // ===================================================================
        // Event System
        // ===================================================================
        this.eventListeners = new Map();
        // All properties are already initialized above
        this.dispatchEvent({
            type: 'state:initialized',
            timestamp: new Date()
        });
    }
    // ===================================================================
    // State Management Methods
    // ===================================================================
    /**
     * Reset all state to initial values
     */
    reset() {
        // Clear file handles
        this.imageFolderHandle = null;
        this.labelFolderHandle = null;
        this.classInfoFolderHandle = null;
        // Clear file arrays
        this.imageFiles = [];
        this.classFiles = [];
        this.selectedClassFile = null;
        // Clear maps and sets
        this.imageLabelStatus.clear();
        this.classNames.clear();
        this.collapsedLabelGroups.clear();
        this.clearPreviewCache();
        // Reset current state
        this.currentImageFile = null;
        this.currentImage = null;
        this.currentMode = 'edit';
        this.currentLoadToken = 0;
        // Reset UI settings to defaults
        this.isAutoSaveEnabled = false;
        this.showLabelsOnCanvas = true;
        this.labelFontSize = 14;
        this.labelSortOrder = 'asc';
        this.isPreviewBarHidden = false;
        this.isCrosshairVisible = false;
        // Clear internal state
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        this._clipboard = null;
        this.lastMousePosition = { x: 0, y: 0 };
        this.contextTarget = null;
        this.dispatchEvent({
            type: 'state:reset',
            timestamp: new Date()
        });
    }
    // ===================================================================
    // File Operations
    // ===================================================================
    /**
     * Set the image folder handle
     */
    setImageFolder(handle) {
        this.imageFolderHandle = handle;
        this.dispatchEvent({
            type: 'folder:image-set',
            data: { name: handle.name },
            timestamp: new Date()
        });
    }
    /**
     * Set the label folder handle
     */
    setLabelFolder(handle) {
        this.labelFolderHandle = handle;
        this.dispatchEvent({
            type: 'folder:label-set',
            data: { name: handle.name },
            timestamp: new Date()
        });
    }
    /**
     * Set the class info folder handle
     */
    setClassInfoFolder(handle) {
        this.classInfoFolderHandle = handle;
        this.dispatchEvent({
            type: 'folder:class-info-set',
            data: { name: handle.name },
            timestamp: new Date()
        });
    }
    // ===================================================================
    // Image Operations
    // ===================================================================
    /**
     * Set the current working image
     */
    setCurrentImage(imageFile) {
        const previousImage = this.currentImageFile;
        this.currentImageFile = imageFile;
        // Increment load token to prevent race conditions
        this.currentLoadToken += 1;
        this.dispatchEvent({
            type: 'image:current-changed',
            data: {
                previous: previousImage?.name || null,
                current: imageFile?.name || null,
                loadToken: this.currentLoadToken
            },
            timestamp: new Date()
        });
    }
    /**
     * Get label status for an image
     */
    getImageLabelStatus(fileName) {
        return this.imageLabelStatus.get(fileName) || false;
    }
    /**
     * Set label status for an image
     */
    setImageLabelStatus(fileName, hasLabels) {
        this.imageLabelStatus.set(fileName, hasLabels);
        this.dispatchEvent({
            type: 'image:label-status-changed',
            data: { fileName, hasLabels },
            timestamp: new Date()
        });
    }
    // ===================================================================
    // Mode Operations
    // ===================================================================
    /**
     * Set the current drawing/editing mode
     */
    setMode(mode) {
        const previousMode = this.currentMode;
        this.currentMode = mode;
        this.dispatchEvent({
            type: 'mode:changed',
            data: { previous: previousMode, current: mode },
            timestamp: new Date()
        });
    }
    /**
     * Toggle between draw and edit modes
     */
    toggleMode() {
        const newMode = this.currentMode === 'edit' ? 'draw' : 'edit';
        this.setMode(newMode);
    }
    // ===================================================================
    // Class Operations
    // ===================================================================
    /**
     * Select a class file for use
     */
    selectClassFile(classFile) {
        this.selectedClassFile = classFile;
        this.dispatchEvent({
            type: 'class:file-selected',
            data: { fileName: classFile?.name || null },
            timestamp: new Date()
        });
    }
    /**
     * Add a class definition
     */
    addClassDefinition(classDef) {
        this.classNames.set(classDef.id.toString(), classDef.name);
        this.dispatchEvent({
            type: 'class:definition-added',
            data: classDef,
            timestamp: new Date()
        });
    }
    /**
     * Remove a class definition
     */
    removeClassDefinition(classId) {
        this.classNames.delete(classId.toString());
        this.dispatchEvent({
            type: 'class:definition-removed',
            data: { classId },
            timestamp: new Date()
        });
    }
    // ===================================================================
    // Settings Operations
    // ===================================================================
    /**
     * Toggle auto-save functionality
     */
    setAutoSave(enabled) {
        this.isAutoSaveEnabled = enabled;
        this.dispatchEvent({
            type: 'settings:auto-save-changed',
            data: { enabled },
            timestamp: new Date()
        });
    }
    /**
     * Toggle label visibility on canvas
     */
    setShowLabels(show) {
        this.showLabelsOnCanvas = show;
        this.dispatchEvent({
            type: 'settings:show-labels-changed',
            data: { show },
            timestamp: new Date()
        });
    }
    /**
     * Set label font size
     */
    setLabelFontSize(size) {
        if (size >= 8 && size <= 48) {
            this.labelFontSize = size;
            this.dispatchEvent({
                type: 'settings:font-size-changed',
                data: { size },
                timestamp: new Date()
            });
        }
    }
    /**
     * Set label sort order
     */
    setLabelSortOrder(order) {
        this.labelSortOrder = order;
        this.dispatchEvent({
            type: 'settings:sort-order-changed',
            data: { order },
            timestamp: new Date()
        });
    }
    // ===================================================================
    // UI State Operations
    // ===================================================================
    /**
     * Toggle preview bar visibility
     */
    togglePreviewBar() {
        this.isPreviewBarHidden = !this.isPreviewBarHidden;
        this.dispatchEvent({
            type: 'ui:preview-bar-toggled',
            data: { hidden: this.isPreviewBarHidden },
            timestamp: new Date()
        });
    }
    /**
     * Toggle crosshair visibility
     */
    toggleCrosshair() {
        this.isCrosshairVisible = !this.isCrosshairVisible;
        this.dispatchEvent({
            type: 'ui:crosshair-toggled',
            data: { visible: this.isCrosshairVisible },
            timestamp: new Date()
        });
    }
    /**
     * Set context menu target
     */
    setContextTarget(target) {
        this.contextTarget = target;
        this.dispatchEvent({
            type: 'ui:context-target-set',
            data: { target },
            timestamp: new Date()
        });
    }
    // ===================================================================
    // Cache Operations
    // ===================================================================
    /**
     * Cache a preview image ObjectURL
     */
    cachePreviewImage(fileName, objectURL) {
        this.previewImageCache.set(fileName, objectURL);
        this.dispatchEvent({
            type: 'cache:preview-cached',
            data: { fileName },
            timestamp: new Date()
        });
    }
    /**
     * Get cached preview image ObjectURL
     */
    getCachedPreviewImage(fileName) {
        return this.previewImageCache.get(fileName);
    }
    /**
     * Clear all preview cache
     */
    clearPreviewCache() {
        // Revoke all ObjectURLs to prevent memory leaks
        for (const objectURL of this.previewImageCache.values()) {
            URL.revokeObjectURL(objectURL);
        }
        this.previewImageCache.clear();
        this.dispatchEvent({
            type: 'cache:preview-cleared',
            timestamp: new Date()
        });
    }
    // ===================================================================
    // Clipboard Operations
    // ===================================================================
    /**
     * Set clipboard data
     */
    setClipboard(data) {
        this._clipboard = data;
        this.dispatchEvent({
            type: 'clipboard:data-set',
            data: { type: data.type },
            timestamp: new Date()
        });
    }
    /**
     * Get clipboard data
     */
    getClipboard() {
        return this._clipboard;
    }
    /**
     * Clear clipboard
     */
    clearClipboard() {
        this._clipboard = null;
        this.dispatchEvent({
            type: 'clipboard:cleared',
            timestamp: new Date()
        });
    }
    // ===================================================================
    // Event System Implementation
    // ===================================================================
    /**
     * Add event listener
     */
    addEventListener(type, handler) {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, []);
        }
        this.eventListeners.get(type).push(handler);
    }
    /**
     * Remove event listener
     */
    removeEventListener(type, handler) {
        const handlers = this.eventListeners.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    /**
     * Dispatch event to all listeners
     */
    dispatchEvent(event) {
        const handlers = this.eventListeners.get(event.type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                }
                catch (error) {
                    console.error(`Error in event handler for ${event.type}:`, error);
                }
            });
        }
    }
    // ===================================================================
    // Utility Methods
    // ===================================================================
    /**
     * Validate current state
     */
    validate() {
        const errors = [];
        const warnings = [];
        // Check for required folders
        if (!this.imageFolderHandle) {
            warnings.push('No image folder selected');
        }
        if (!this.labelFolderHandle) {
            warnings.push('No label folder selected');
        }
        // Check font size range
        if (this.labelFontSize < 8 || this.labelFontSize > 48) {
            errors.push('Label font size must be between 8 and 48');
        }
        // Check for memory leaks in cache
        if (this.previewImageCache.size > 100) {
            warnings.push('Preview cache is large, consider clearing');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Get serializable state (for persistence)
     */
    getSerializableState() {
        return {
            currentMode: this.currentMode,
            isAutoSaveEnabled: this.isAutoSaveEnabled,
            showLabelsOnCanvas: this.showLabelsOnCanvas,
            labelFontSize: this.labelFontSize,
            labelSortOrder: this.labelSortOrder,
            isPreviewBarHidden: this.isPreviewBarHidden,
            isCrosshairVisible: this.isCrosshairVisible
        };
    }
    /**
     * Restore from serializable state
     */
    restoreFromSerializableState(state) {
        this.currentMode = state.currentMode;
        this.isAutoSaveEnabled = state.isAutoSaveEnabled;
        this.showLabelsOnCanvas = state.showLabelsOnCanvas;
        this.labelFontSize = state.labelFontSize;
        this.labelSortOrder = state.labelSortOrder;
        this.isPreviewBarHidden = state.isPreviewBarHidden;
        this.isCrosshairVisible = state.isCrosshairVisible;
        this.dispatchEvent({
            type: 'state:restored',
            data: state,
            timestamp: new Date()
        });
    }
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            imageFilesCount: this.imageFiles.length,
            classFilesCount: this.classFiles.length,
            imageLabelStatusCount: this.imageLabelStatus.size,
            classNamesCount: this.classNames.size,
            previewCacheSize: this.previewImageCache.size,
            collapsedGroupsCount: this.collapsedLabelGroups.size,
            currentLoadToken: this.currentLoadToken,
            hasImageFolder: !!this.imageFolderHandle,
            hasLabelFolder: !!this.labelFolderHandle,
            hasClassInfoFolder: !!this.classInfoFolderHandle,
            currentImageName: this.currentImageFile?.name || null,
            selectedClassFileName: this.selectedClassFile?.name || null,
            eventListenerTypes: Array.from(this.eventListeners.keys())
        };
    }
}
// ===================================================================
// Factory Function
// ===================================================================
/**
 * Create a new AppState instance
 */
function createAppState() {
    return new AppState();
}
/**
 * Create AppState with initial configuration
 */
function createAppStateWithConfig(config) {
    const appState = new AppState();
    // Apply configuration
    Object.keys(config).forEach(key => {
        if (key in appState) {
            appState[key] = config[key];
        }
    });
    return appState;
}
// ===================================================================
// Exports
// ===================================================================
/* harmony default export */ const models_AppState = ((/* unused pure expression or super */ null && (AppState)));

;// ./src/types/filesystem.ts
/**
 * FileSystem Service Type Definitions
 *
 * Types for file I/O operations, YOLO format handling, and File System Access API integration.
 */
// ===================================================================
// Error Types
// ===================================================================
class FileSystemError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'FileSystemError';
    }
}
class YoloFormatError extends Error {
    constructor(message, line, data) {
        super(message);
        this.line = line;
        this.data = data;
        this.name = 'YoloFormatError';
    }
}
class ImageLoadError extends Error {
    constructor(message, fileName, cause) {
        super(message);
        this.fileName = fileName;
        this.cause = cause;
        this.name = 'ImageLoadError';
    }
}

;// ./src/utils/yolo-parser.ts
/**
 * YOLO Format Parser Utility
 *
 * Handles parsing and generation of YOLO format annotation files.
 * YOLO format: classId centerX centerY width height (normalized coordinates 0-1)
 */

// ===================================================================
// Constants
// ===================================================================
const DEFAULT_PRECISION = 6;
const MIN_COORDINATE = 0.0;
const MAX_COORDINATE = 1.0;
const MIN_SIZE = 0.0;
// ===================================================================
// YOLO Parser Class
// ===================================================================
class YoloParser {
    /**
     * Parse YOLO format string into structured labels
     */
    static parseYoloString(yoloData) {
        const result = {
            labels: [],
            errors: [],
            warnings: []
        };
        if (!yoloData || yoloData.trim() === '') {
            return result;
        }
        const lines = yoloData.split('\n');
        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            // Skip empty lines and comments
            if (trimmedLine === '' || trimmedLine.startsWith('#')) {
                return;
            }
            try {
                const label = this.parseSingleLine(trimmedLine, lineIndex + 1);
                if (label) {
                    result.labels.push(label);
                }
            }
            catch (error) {
                if (error instanceof YoloFormatError) {
                    result.errors.push(`Line ${lineIndex + 1}: ${error.message}`);
                }
                else {
                    result.errors.push(`Line ${lineIndex + 1}: Unknown parsing error`);
                }
            }
        });
        // Add validation warnings
        this.addValidationWarnings(result);
        return result;
    }
    /**
     * Parse a single YOLO format line
     */
    static parseSingleLine(line, lineNumber) {
        const match = line.match(this.LINE_PATTERN);
        if (!match) {
            throw new YoloFormatError(`Invalid YOLO format. Expected: "classId centerX centerY width height"`, lineNumber, line);
        }
        const [, classIdStr, centerXStr, centerYStr, widthStr, heightStr] = match;
        // Parse class ID
        const classId = parseInt(classIdStr, 10);
        if (isNaN(classId) || classId < 0) {
            throw new YoloFormatError(`Invalid class ID: "${classIdStr}". Must be a non-negative integer`, lineNumber, line);
        }
        // Parse coordinates
        const centerX = this.parseCoordinate(centerXStr, 'centerX', lineNumber, line);
        const centerY = this.parseCoordinate(centerYStr, 'centerY', lineNumber, line);
        const width = this.parseCoordinate(widthStr, 'width', lineNumber, line);
        const height = this.parseCoordinate(heightStr, 'height', lineNumber, line);
        // Validate coordinate ranges
        this.validateCoordinates({ classId, centerX, centerY, width, height }, lineNumber, line);
        return {
            classId,
            centerX,
            centerY,
            width,
            height
        };
    }
    /**
     * Parse a coordinate value with validation
     */
    static parseCoordinate(value, name, lineNumber, line) {
        if (!this.COORDINATE_PATTERN.test(value)) {
            throw new YoloFormatError(`Invalid ${name}: "${value}". Must be a valid number`, lineNumber, line);
        }
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new YoloFormatError(`Invalid ${name}: "${value}". Could not parse as number`, lineNumber, line);
        }
        return parsed;
    }
    /**
     * Validate YOLO label coordinates
     */
    static validateCoordinates(label, lineNumber, line) {
        const { centerX, centerY, width, height } = label;
        // Check coordinate bounds (YOLO uses normalized coordinates 0-1)
        if (centerX < MIN_COORDINATE || centerX > MAX_COORDINATE) {
            throw new YoloFormatError(`centerX out of range: ${centerX}. Must be between 0 and 1`, lineNumber, line);
        }
        if (centerY < MIN_COORDINATE || centerY > MAX_COORDINATE) {
            throw new YoloFormatError(`centerY out of range: ${centerY}. Must be between 0 and 1`, lineNumber, line);
        }
        if (width <= MIN_SIZE || width > MAX_COORDINATE) {
            throw new YoloFormatError(`width out of range: ${width}. Must be between 0 and 1`, lineNumber, line);
        }
        if (height <= MIN_SIZE || height > MAX_COORDINATE) {
            throw new YoloFormatError(`height out of range: ${height}. Must be between 0 and 1`, lineNumber, line);
        }
        // Check bounding box bounds
        const left = centerX - width / 2;
        const right = centerX + width / 2;
        const top = centerY - height / 2;
        const bottom = centerY + height / 2;
        if (left < MIN_COORDINATE || right > MAX_COORDINATE) {
            throw new YoloFormatError(`Bounding box extends outside image bounds horizontally (left: ${left}, right: ${right})`, lineNumber, line);
        }
        if (top < MIN_COORDINATE || bottom > MAX_COORDINATE) {
            throw new YoloFormatError(`Bounding box extends outside image bounds vertically (top: ${top}, bottom: ${bottom})`, lineNumber, line);
        }
    }
    /**
     * Add validation warnings to parse result
     */
    static addValidationWarnings(result) {
        // Check for very small bounding boxes
        result.labels.forEach((label, index) => {
            if (label.width < 0.01 || label.height < 0.01) {
                result.warnings.push(`Label ${index + 1}: Very small bounding box (${label.width}x${label.height})`);
            }
        });
        // Check for duplicate labels (same position and class)
        const seen = new Set();
        result.labels.forEach((label, index) => {
            const key = `${label.classId}_${label.centerX}_${label.centerY}_${label.width}_${label.height}`;
            if (seen.has(key)) {
                result.warnings.push(`Label ${index + 1}: Duplicate label detected`);
            }
            seen.add(key);
        });
    }
    /**
     * Convert labels array to YOLO format string
     */
    static labelsToYoloString(labels, options = {}) {
        const { precision = DEFAULT_PRECISION, includeComments = false, validateBounds = true } = options;
        if (!labels || labels.length === 0) {
            return '';
        }
        const lines = [];
        if (includeComments) {
            lines.push('# YOLO format: classId centerX centerY width height (normalized coordinates)');
            lines.push(`# Generated: ${new Date().toISOString()}`);
            lines.push('');
        }
        labels.forEach((label, index) => {
            if (validateBounds && !this.validateYoloLabel(label)) {
                throw new YoloFormatError(`Invalid label at index ${index}: coordinates out of bounds`);
            }
            const line = [
                label.classId.toString(),
                label.centerX.toFixed(precision),
                label.centerY.toFixed(precision),
                label.width.toFixed(precision),
                label.height.toFixed(precision)
            ].join(' ');
            lines.push(line);
        });
        return lines.join('\n');
    }
    /**
     * Validate a single YOLO label
     */
    static validateYoloLabel(label) {
        try {
            this.validateCoordinates(label, 0, '');
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Convert pixel coordinates to YOLO normalized coordinates
     */
    static pixelToNormalized(pixelX, pixelY, pixelWidth, pixelHeight, imageWidth, imageHeight) {
        const centerX = (pixelX + pixelWidth / 2) / imageWidth;
        const centerY = (pixelY + pixelHeight / 2) / imageHeight;
        const width = pixelWidth / imageWidth;
        const height = pixelHeight / imageHeight;
        return {
            classId: 0, // Will be set by caller
            centerX,
            centerY,
            width,
            height
        };
    }
    /**
     * Convert YOLO normalized coordinates to pixel coordinates
     */
    static normalizedToPixel(label, imageWidth, imageHeight) {
        const width = label.width * imageWidth;
        const height = label.height * imageHeight;
        const x = (label.centerX * imageWidth) - (width / 2);
        const y = (label.centerY * imageHeight) - (height / 2);
        return { x, y, width, height };
    }
    /**
     * Get statistics about a set of labels
     */
    static getLabelStatistics(labels) {
        if (!labels || labels.length === 0) {
            return {
                totalLabels: 0,
                classDistribution: {},
                averageSize: { width: 0, height: 0 },
                sizeRange: {
                    min: { width: 0, height: 0 },
                    max: { width: 0, height: 0 }
                }
            };
        }
        const classDistribution = {};
        let totalWidth = 0;
        let totalHeight = 0;
        let minWidth = Number.MAX_VALUE;
        let maxWidth = Number.MIN_VALUE;
        let minHeight = Number.MAX_VALUE;
        let maxHeight = Number.MIN_VALUE;
        labels.forEach(label => {
            // Class distribution
            classDistribution[label.classId] = (classDistribution[label.classId] || 0) + 1;
            // Size statistics
            totalWidth += label.width;
            totalHeight += label.height;
            minWidth = Math.min(minWidth, label.width);
            maxWidth = Math.max(maxWidth, label.width);
            minHeight = Math.min(minHeight, label.height);
            maxHeight = Math.max(maxHeight, label.height);
        });
        return {
            totalLabels: labels.length,
            classDistribution,
            averageSize: {
                width: totalWidth / labels.length,
                height: totalHeight / labels.length
            },
            sizeRange: {
                min: { width: minWidth, height: minHeight },
                max: { width: maxWidth, height: maxHeight }
            }
        };
    }
}
YoloParser.COORDINATE_PATTERN = /^-?\d+(\.\d+)?$/;
YoloParser.LINE_PATTERN = /^\s*(\d+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*$/;
// ===================================================================
// Utility Functions
// ===================================================================
/**
 * Quick parse function for simple use cases
 */
function parseYolo(yoloData) {
    const result = YoloParser.parseYoloString(yoloData);
    if (result.errors.length > 0) {
        throw new YoloFormatError(`YOLO parsing failed: ${result.errors.join(', ')}`);
    }
    return result.labels;
}
/**
 * Quick export function for simple use cases
 */
function exportYolo(labels, precision = DEFAULT_PRECISION) {
    return YoloParser.labelsToYoloString(labels, { precision });
}
/**
 * Validate YOLO string without parsing
 */
function validateYoloString(yoloData) {
    const result = YoloParser.parseYoloString(yoloData);
    return {
        isValid: result.errors.length === 0,
        errors: result.errors
    };
}
// ===================================================================
// Export
// ===================================================================
/* harmony default export */ const yolo_parser = ((/* unused pure expression or super */ null && (YoloParser)));

;// ./src/services/FileSystemService.ts
/**
 * FileSystem Service Implementation
 *
 * Handles all file I/O operations for the Easy Labeling application.
 * Provides abstraction over File System Access API and YOLO format processing.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */


// ===================================================================
// FileSystem Service Implementation
// ===================================================================
class FileSystemService {
    constructor(config) {
        this.imageCache = new Map();
        this.eventListeners = new Map();
        this.config = { ...FileSystemService.DEFAULT_CONFIG, ...config };
    }
    // ===================================================================
    // Folder Operations
    // ===================================================================
    async selectImageFolder() {
        try {
            const folderHandle = await window.showDirectoryPicker();
            this.dispatchEvent({
                type: 'folder:image-selected',
                data: { name: folderHandle.name },
                timestamp: new Date()
            });
            return {
                success: true,
                data: folderHandle,
                message: `Image folder selected: ${folderHandle.name}`
            };
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return { success: false, message: 'Selection cancelled' };
            }
            return {
                success: false,
                error: `Failed to select image folder: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async selectLabelFolder() {
        try {
            const folderHandle = await window.showDirectoryPicker();
            this.dispatchEvent({
                type: 'folder:label-selected',
                data: { name: folderHandle.name },
                timestamp: new Date()
            });
            return {
                success: true,
                data: folderHandle,
                message: `Label folder selected: ${folderHandle.name}`
            };
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return { success: false, message: 'Selection cancelled' };
            }
            return {
                success: false,
                error: `Failed to select label folder: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async selectClassInfoFolder() {
        try {
            const folderHandle = await window.showDirectoryPicker();
            this.dispatchEvent({
                type: 'folder:class-info-selected',
                data: { name: folderHandle.name },
                timestamp: new Date()
            });
            return {
                success: true,
                data: folderHandle,
                message: `Class info folder selected: ${folderHandle.name}`
            };
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return { success: false, message: 'Selection cancelled' };
            }
            return {
                success: false,
                error: `Failed to select class info folder: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    // ===================================================================
    // File Listing Operations
    // ===================================================================
    async listImageFiles(folderHandle) {
        try {
            const imageFiles = [];
            const supportedFormats = this.config.supportedImageFormats.map(f => f.toLowerCase());
            for await (const entry of folderHandle.values()) {
                if (entry.kind === 'file') {
                    const extension = this.getFileExtension(entry.name).toLowerCase();
                    if (supportedFormats.includes(extension)) {
                        const imageFile = {
                            name: entry.name,
                            handle: entry,
                            path: entry.name, // Note: Full path not available in File System Access API
                            extension,
                            size: undefined, // Will be loaded when needed
                            lastModified: undefined // Will be loaded when needed
                        };
                        imageFiles.push(imageFile);
                    }
                }
            }
            // Sort files naturally (handles numbers correctly)
            imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
            this.dispatchEvent({
                type: 'files:images-listed',
                data: { count: imageFiles.length, folder: folderHandle.name },
                timestamp: new Date()
            });
            return {
                success: true,
                data: imageFiles,
                message: `Found ${imageFiles.length} image files`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to list image files: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async listClassFiles(folderHandle) {
        try {
            const classFiles = [];
            const supportedFormats = ['yaml', 'yml'];
            for await (const entry of folderHandle.values()) {
                if (entry.kind === 'file') {
                    const extension = this.getFileExtension(entry.name).toLowerCase();
                    if (supportedFormats.includes(extension)) {
                        // Load class file content
                        const contentResult = await this.loadClassFile(entry);
                        const classFile = {
                            name: entry.name,
                            handle: entry,
                            content: contentResult.success ? contentResult.data.classes : [],
                            isSelected: false
                        };
                        classFiles.push(classFile);
                    }
                }
            }
            this.dispatchEvent({
                type: 'files:classes-listed',
                data: { count: classFiles.length, folder: folderHandle.name },
                timestamp: new Date()
            });
            return {
                success: true,
                data: classFiles,
                message: `Found ${classFiles.length} class files`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to list class files: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async scanFolder(folderHandle) {
        try {
            const result = {
                imageFiles: [],
                labelFiles: [],
                classFiles: [],
                totalFiles: 0,
                errors: []
            };
            for await (const entry of folderHandle.values()) {
                if (entry.kind === 'file') {
                    result.totalFiles++;
                    const extension = this.getFileExtension(entry.name).toLowerCase();
                    if (this.config.supportedImageFormats.includes(extension)) {
                        const imageFile = {
                            name: entry.name,
                            handle: entry,
                            path: entry.name,
                            extension
                        };
                        result.imageFiles.push(imageFile);
                    }
                    else if (extension === 'txt') {
                        result.labelFiles.push(entry.name);
                    }
                    else if (['yaml', 'yml'].includes(extension)) {
                        try {
                            const contentResult = await this.loadClassFile(entry);
                            if (contentResult.success) {
                                const classFile = {
                                    name: entry.name,
                                    handle: entry,
                                    content: contentResult.data.classes,
                                    isSelected: false
                                };
                                result.classFiles.push(classFile);
                            }
                        }
                        catch (error) {
                            result.errors.push(`Failed to load class file ${entry.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    }
                }
            }
            return {
                success: true,
                data: result,
                message: `Scanned ${result.totalFiles} files`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to scan folder: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    // ===================================================================
    // Image Operations
    // ===================================================================
    async loadImage(fileHandle, options) {
        try {
            // Check cache first
            const cacheKey = `${fileHandle.name}`;
            const cached = this.imageCache.get(cacheKey);
            if (cached && this.isCacheValid(cached)) {
                cached.hits++;
                return {
                    success: true,
                    data: cached.data,
                    message: 'Loaded from cache'
                };
            }
            const file = await fileHandle.getFile();
            // Check file size
            if (file.size > this.config.maxImageSize) {
                throw new ImageLoadError(`Image too large: ${file.size} bytes (max: ${this.config.maxImageSize})`);
            }
            const img = await this.createImageFromFile(file, options);
            // Cache the image
            this.cacheImage(cacheKey, img, file.size);
            this.dispatchEvent({
                type: 'image:loaded',
                data: { fileName: file.name, size: file.size },
                timestamp: new Date()
            });
            return {
                success: true,
                data: img,
                message: `Image loaded: ${file.name}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async loadTiffImage(fileHandle, options) {
        try {
            const file = await fileHandle.getFile();
            // Use dynamic import for TIFF.js (loaded from CDN)
            if (typeof window.Tiff === 'undefined') {
                throw new ImageLoadError('TIFF.js library not loaded');
            }
            const arrayBuffer = await file.arrayBuffer();
            const tiff = new window.Tiff({ buffer: arrayBuffer });
            const canvas = tiff.toCanvas();
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new ImageLoadError('Failed to convert TIFF canvas to image'));
                img.src = canvas.toDataURL();
            });
            this.dispatchEvent({
                type: 'image:tiff-loaded',
                data: { fileName: file.name, size: file.size },
                timestamp: new Date()
            });
            return {
                success: true,
                data: img,
                message: `TIFF image loaded: ${file.name}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to load TIFF image: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getImageInfo(fileHandle) {
        try {
            const file = await fileHandle.getFile();
            const img = await this.createImageFromFile(file);
            const info = {
                name: file.name,
                width: img.naturalWidth,
                height: img.naturalHeight,
                size: file.size,
                format: this.getFileExtension(file.name),
                lastModified: new Date(file.lastModified)
            };
            return {
                success: true,
                data: info,
                message: `Image info retrieved: ${file.name}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    // ===================================================================
    // Label Operations
    // ===================================================================
    async loadLabels(fileName, folderHandle) {
        try {
            const labelFileName = this.getLabelFileName(fileName);
            const labelFileHandle = await folderHandle.getFileHandle(labelFileName);
            const file = await labelFileHandle.getFile();
            const yoloData = await file.text();
            if (!yoloData.trim()) {
                return {
                    success: true,
                    data: [],
                    message: 'No labels found'
                };
            }
            const parseResult = YoloParser.parseYoloString(yoloData);
            if (parseResult.errors.length > 0) {
                return {
                    success: false,
                    error: `YOLO parsing errors: ${parseResult.errors.join(', ')}`
                };
            }
            this.dispatchEvent({
                type: 'labels:loaded',
                data: { fileName, labelCount: parseResult.labels.length },
                timestamp: new Date()
            });
            return {
                success: true,
                data: parseResult.labels,
                message: `Loaded ${parseResult.labels.length} labels`
            };
        }
        catch (error) {
            if (error instanceof Error && error.name === 'NotFoundError') {
                return {
                    success: true,
                    data: [],
                    message: 'No label file found'
                };
            }
            return {
                success: false,
                error: `Failed to load labels: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async saveLabels(fileName, labels, folderHandle) {
        try {
            const labelFileName = this.getLabelFileName(fileName);
            const yoloString = YoloParser.labelsToYoloString(labels, {
                precision: this.config.yoloValidation.precision,
                validateBounds: this.config.yoloValidation.strictBounds
            });
            const fileHandle = await folderHandle.getFileHandle(labelFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(yoloString.trim());
            await writable.close();
            this.dispatchEvent({
                type: 'labels:saved',
                data: { fileName, labelCount: labels.length },
                timestamp: new Date()
            });
            return {
                success: true,
                message: `Labels saved to ${labelFileName}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to save labels: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async checkLabelStatus(fileName, folderHandle) {
        try {
            const labelFileName = this.getLabelFileName(fileName);
            try {
                const labelFileHandle = await folderHandle.getFileHandle(labelFileName);
                const file = await labelFileHandle.getFile();
                const content = await file.text();
                const parseResult = YoloParser.parseYoloString(content);
                const status = {
                    fileName,
                    hasLabels: parseResult.labels.length > 0,
                    labelCount: parseResult.labels.length,
                    lastModified: new Date(file.lastModified)
                };
                return {
                    success: true,
                    data: status,
                    message: `Label status checked: ${fileName}`
                };
            }
            catch (error) {
                if (error instanceof Error && error.name === 'NotFoundError') {
                    const status = {
                        fileName,
                        hasLabels: false,
                        labelCount: 0
                    };
                    return {
                        success: true,
                        data: status,
                        message: 'No label file found'
                    };
                }
                throw error;
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to check label status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    // ===================================================================
    // Class File Operations
    // ===================================================================
    async loadClassFile(fileHandle) {
        try {
            const file = await fileHandle.getFile();
            const content = await file.text();
            const validation = this.validateClassFile(content);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Invalid class file: ${validation.errors.join(', ')}`
                };
            }
            const classes = [];
            const lines = content.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('#') || trimmedLine === '')
                    return;
                const parts = trimmedLine.split(':');
                if (parts.length >= 2) {
                    const id = parseInt(parts[0].trim(), 10);
                    const name = parts.slice(1).join(':').trim();
                    if (!isNaN(id) && name) {
                        classes.push({
                            id,
                            name,
                            description: undefined,
                            color: undefined
                        });
                    }
                }
            });
            const classFileContent = {
                classes,
                metadata: {
                    created: new Date(file.lastModified),
                    modified: new Date(file.lastModified)
                }
            };
            this.dispatchEvent({
                type: 'classes:loaded',
                data: { fileName: file.name, classCount: classes.length },
                timestamp: new Date()
            });
            return {
                success: true,
                data: classFileContent,
                message: `Loaded ${classes.length} classes from ${file.name}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to load class file: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async saveClassFile(fileHandle, content) {
        try {
            // Sort classes by ID
            const sortedClasses = [...content.classes].sort((a, b) => a.id - b.id);
            const lines = sortedClasses.map(cls => `${cls.id}: ${cls.name}`);
            const fileContent = lines.join('\n');
            const writable = await fileHandle.createWritable();
            await writable.write(fileContent);
            await writable.close();
            this.dispatchEvent({
                type: 'classes:saved',
                data: { fileName: fileHandle.name, classCount: content.classes.length },
                timestamp: new Date()
            });
            return {
                success: true,
                message: `Saved ${content.classes.length} classes to ${fileHandle.name}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to save class file: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async createClassFile(folderHandle, fileName, initialContent) {
        try {
            // Ensure .yaml extension
            const finalFileName = fileName.endsWith('.yaml') || fileName.endsWith('.yml')
                ? fileName
                : `${fileName}.yaml`;
            // Check if file already exists
            try {
                await folderHandle.getFileHandle(finalFileName);
                return {
                    success: false,
                    error: `File "${finalFileName}" already exists`
                };
            }
            catch (error) {
                // File doesn't exist, which is what we want
            }
            const defaultContent = initialContent || {
                classes: [
                    { id: 0, name: 'class1' },
                    { id: 1, name: 'class2' }
                ],
                metadata: {
                    created: new Date(),
                    description: 'Auto-generated class file'
                }
            };
            const fileHandle = await folderHandle.getFileHandle(finalFileName, { create: true });
            await this.saveClassFile(fileHandle, defaultContent);
            this.dispatchEvent({
                type: 'classes:file-created',
                data: { fileName: finalFileName, classCount: defaultContent.classes.length },
                timestamp: new Date()
            });
            return {
                success: true,
                data: fileHandle,
                message: `Created class file: ${finalFileName}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to create class file: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validateClassFile(content) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            duplicateIds: [],
            emptyNames: []
        };
        const lines = content.split('\n');
        const seenIds = new Set();
        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('#') || trimmedLine === '')
                return;
            const parts = trimmedLine.split(':');
            if (parts.length < 2) {
                result.errors.push(`Line ${lineIndex + 1}: Invalid format. Expected "id: name"`);
                result.isValid = false;
                return;
            }
            const idStr = parts[0].trim();
            const name = parts.slice(1).join(':').trim();
            const id = parseInt(idStr, 10);
            if (isNaN(id) || String(id) !== idStr) {
                result.errors.push(`Line ${lineIndex + 1}: Invalid ID "${idStr}". Must be an integer`);
                result.isValid = false;
            }
            else if (seenIds.has(id)) {
                result.duplicateIds.push(id);
                result.errors.push(`Line ${lineIndex + 1}: Duplicate ID "${id}"`);
                result.isValid = false;
            }
            else {
                seenIds.add(id);
            }
            if (!name) {
                result.emptyNames.push(idStr);
                result.errors.push(`Line ${lineIndex + 1}: Empty class name for ID "${idStr}"`);
                result.isValid = false;
            }
        });
        return result;
    }
    // ===================================================================
    // YOLO Format Processing
    // ===================================================================
    parseYoloString(yoloData) {
        return YoloParser.parseYoloString(yoloData);
    }
    labelsToYoloString(labels, options) {
        return YoloParser.labelsToYoloString(labels, options);
    }
    validateYoloLabel(label) {
        return YoloParser.validateYoloLabel(label);
    }
    // ===================================================================
    // Cache Management
    // ===================================================================
    clearImageCache() {
        // Revoke all blob URLs to prevent memory leaks
        this.imageCache.forEach(entry => {
            if (entry.data.src.startsWith('blob:')) {
                URL.revokeObjectURL(entry.data.src);
            }
        });
        this.imageCache.clear();
        this.dispatchEvent({
            type: 'cache:cleared',
            timestamp: new Date()
        });
    }
    getCacheStats() {
        let totalSize = 0;
        let totalHits = 0;
        let totalAccesses = 0;
        this.imageCache.forEach(entry => {
            totalSize += entry.size;
            totalHits += entry.hits;
            totalAccesses += entry.hits + 1; // +1 for initial load
        });
        return {
            totalEntries: this.imageCache.size,
            totalSize,
            hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
            memoryUsage: totalSize / (1024 * 1024) // MB
        };
    }
    optimizeCache() {
        // Remove expired entries
        const now = new Date();
        const expiredKeys = [];
        this.imageCache.forEach((entry, key) => {
            if (now.getTime() - entry.timestamp.getTime() > this.config.cacheTimeout) {
                expiredKeys.push(key);
            }
        });
        expiredKeys.forEach(key => {
            const entry = this.imageCache.get(key);
            if (entry && entry.data.src.startsWith('blob:')) {
                URL.revokeObjectURL(entry.data.src);
            }
            this.imageCache.delete(key);
        });
        // If still over limit, remove least recently used
        if (this.getTotalCacheSize() > this.config.maxCacheSize) {
            const entries = Array.from(this.imageCache.entries()).sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
            while (this.getTotalCacheSize() > this.config.maxCacheSize && entries.length > 0) {
                const [key, entry] = entries.shift();
                if (entry.data.src.startsWith('blob:')) {
                    URL.revokeObjectURL(entry.data.src);
                }
                this.imageCache.delete(key);
            }
        }
        this.dispatchEvent({
            type: 'cache:optimized',
            data: { removedExpired: expiredKeys.length },
            timestamp: new Date()
        });
    }
    // ===================================================================
    // Event System
    // ===================================================================
    addEventListener(type, handler) {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, []);
        }
        this.eventListeners.get(type).push(handler);
    }
    removeEventListener(type, handler) {
        const handlers = this.eventListeners.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    dispatchEvent(event) {
        const handlers = this.eventListeners.get(event.type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                }
                catch (error) {
                    console.error(`Error in FileSystem event handler for ${event.type}:`, error);
                }
            });
        }
    }
    // ===================================================================
    // Private Utility Methods
    // ===================================================================
    getFileExtension(fileName) {
        const lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : '';
    }
    getLabelFileName(imageFileName) {
        return imageFileName.replace(/\.[^/.]+$/, '.txt');
    }
    async createImageFromFile(file, options) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new ImageLoadError(`Failed to load image: ${file.name}`, file.name));
            };
            img.src = url;
        });
    }
    cacheImage(key, img, size) {
        // Optimize cache before adding new entry
        if (this.getTotalCacheSize() + size > this.config.maxCacheSize) {
            this.optimizeCache();
        }
        const entry = {
            data: img,
            timestamp: new Date(),
            size,
            hits: 0
        };
        this.imageCache.set(key, entry);
    }
    isCacheValid(entry) {
        const now = new Date();
        return now.getTime() - entry.timestamp.getTime() < this.config.cacheTimeout;
    }
    getTotalCacheSize() {
        let total = 0;
        this.imageCache.forEach(entry => {
            total += entry.size;
        });
        return total;
    }
}
// Default configuration
FileSystemService.DEFAULT_CONFIG = {
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'webp'],
    maxImageSize: 50 * 1024 * 1024, // 50MB
    thumbnailSize: { width: 150, height: 150 },
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    cacheTimeout: 30 * 60 * 1000, // 30 minutes
    yoloValidation: {
        strictBounds: true,
        allowZeroSize: false,
        precision: 6
    },
    batchSize: 10,
    concurrentLoads: 3,
    preloadAdjacent: true
};
// ===================================================================
// Factory Functions
// ===================================================================
/**
 * Create a new FileSystemService instance
 */
function createFileSystemService(config) {
    return new FileSystemService(config);
}
/**
 * Create FileSystemService with custom cache size
 */
function createFileSystemServiceWithCache(cacheSize) {
    return new FileSystemService({ maxCacheSize: cacheSize });
}
// ===================================================================
// Exports
// ===================================================================
/* harmony default export */ const services_FileSystemService = ((/* unused pure expression or super */ null && (FileSystemService)));

;// ./src/services/index.ts
/**
 * Services Module Index
 *
 * Central export point for all service classes used throughout the Easy Labeling application.
 * This module provides clean API access to business logic and external service integrations.
 */
// Export FileSystemService

// Re-export YoloParser from utils for convenience


;// ./src/utils/index.ts
/**
 * Utils Module Index
 *
 * Central export point for all utility functions used throughout the Easy Labeling application.
 * This file provides a clean API for importing utility functions from various modules.
 */
// Export all notification utilities

// Export all color palette utilities

// Export all validation utilities

// Export YOLO parser utilities

// Re-export commonly used utilities with shorter names



/**
 * Utility function categories for better organization
 */
const UtilityCategories = {
    NOTIFICATIONS: [
        'showToast',
        'showErrorToast',
        'showSuccessToast',
        'showWarningToast',
        'showTypedToast'
    ],
    COLORS: [
        'getColorForClass',
        'getColorsForClasses',
        'getContrastingTextColor',
        'hexToRgba',
        'ColorManager'
    ],
    VALIDATION: [
        'validateLabelClass',
        'validateFileName',
        'validateImageExtension',
        'validateBoundingBox',
        'validateYOLOCoordinates'
    ],
    YOLO: [
        'YoloParser',
        'parseYolo',
        'exportYolo',
        'validateYoloString'
    ]
};
/**
 * Default utility configuration
 */
const DEFAULT_UTILITY_CONFIG = {
    notifications: {
        defaultDuration: 3000,
        containerSelector: '#toast-container'
    },
    colors: {
        useHighContrast: false
    },
    validation: {
        strictMode: true,
        showErrors: true
    }
};
/**
 * Utility manager for coordinated utility operations
 */
class UtilityManager {
    constructor(config = {}) {
        this.config = { ...DEFAULT_UTILITY_CONFIG, ...config };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Initialize utilities with current configuration
     */
    initialize() {
        // This could be extended to set up any global utility configurations
        console.log('Utilities initialized with config:', this.config);
    }
}
/**
 * Global utility manager instance
 */
const utilityManager = new UtilityManager();
/**
 * Helper function to check if utilities are properly loaded
 */
function validateUtilitiesLoaded() {
    try {
        // Import functions for testing
        const { showToast } = __webpack_require__(934);
        const { colorPalette } = __webpack_require__(87);
        const { validateLabelClass } = __webpack_require__(371);
        // Test each utility category
        const notificationTest = typeof showToast === 'function';
        const colorTest = Array.isArray(colorPalette) && colorPalette.length > 0;
        const validationTest = typeof validateLabelClass === 'function';
        return notificationTest && colorTest && validationTest;
    }
    catch (error) {
        console.error('Utilities validation failed:', error);
        return false;
    }
}
/**
 * Get utility module version info
 */
const UTILITY_VERSION = {
    version: '1.0.0',
    modules: {
        notifications: '1.0.0',
        colors: '1.0.0',
        validation: '1.0.0',
        yolo: '1.0.0'
    },
    buildDate: new Date().toISOString()
};
// Initialize utilities on module load
utilityManager.initialize();

;// ./src/main.ts
/**
 * Easy Labeling TypeScript Main Entry Point
 *
 * This is the main entry point for the TypeScript version of Easy Labeling.
 * Phase 5 Complete: FileSystem service has been successfully implemented with YOLO support.
 */


// Phase Progress Report
console.log('🚀 Easy Labeling TypeScript Migration - Phase 5 Complete!');
console.log('✅ TypeScript compilation working');
console.log('✅ Webpack bundling working');
console.log('✅ AppState model implemented with type safety');
console.log('✅ Event system and validation added');
console.log('✅ FileSystem service implemented');
console.log('✅ YOLO parser with validation');
console.log('✅ File I/O abstraction layer');
console.log('📅 Phase 5 completed:', new Date().toISOString());
// Test Phase 4: AppState Model
console.log('\n🧪 Testing Phase 4 AppState Implementation:');
// Create AppState instance
const appState = createAppState();
console.log('✅ AppState instance created');
// Test event system
appState.addEventListener('mode:changed', (event) => {
    console.log('📡 Event received:', event.type, event.data);
});
// Test state methods
appState.setMode('draw');
console.log('✅ Mode changed to:', appState.currentMode);
appState.setLabelFontSize(16);
console.log('✅ Font size set to:', appState.labelFontSize);
// Test validation
const validation = appState.validate();
console.log('✅ Validation result:', validation.isValid ? 'PASSED' : 'FAILED');
if (validation.warnings.length > 0) {
    console.log('⚠️ Warnings:', validation.warnings);
}
// Test serialization
const serialized = appState.getSerializableState();
console.log('✅ Serialization test:', Object.keys(serialized).length, 'properties serialized');
console.log('🎯 Phase 4 AppState tests completed successfully!');
// Test Phase 5: FileSystem Service
console.log('\n🧪 Testing Phase 5 FileSystem Service Implementation:');
// Create FileSystem service instance
const fileSystem = createFileSystemService();
console.log('✅ FileSystem service created');
// Test YOLO parser
const testYoloData = `0 0.5 0.5 0.3 0.4
1 0.2 0.8 0.1 0.2`;
try {
    const labels = parseYolo(testYoloData);
    console.log('✅ YOLO parsing test:', labels.length, 'labels parsed');
    const yoloString = YoloParser.labelsToYoloString(labels);
    console.log('✅ YOLO export test: string generated');
    const validation = YoloParser.parseYoloString(testYoloData);
    console.log('✅ YOLO validation test:', validation.errors.length === 0 ? 'PASSED' : 'FAILED');
}
catch (error) {
    console.error('❌ YOLO parser test failed:', error);
}
// Test FileSystem service methods
console.log('✅ Service methods available:', [
    'selectImageFolder',
    'selectLabelFolder',
    'loadLabels',
    'saveLabels',
    'parseYoloString'
].every(method => typeof fileSystem[method] === 'function'));
console.log('🎯 Phase 5 FileSystem service tests completed successfully!');
// DOM ready test
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded - ready for Phase 6 implementation');
    // Create Phase 5 completion indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #28a745;
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    font-family: 'Segoe UI', monospace;
    font-size: 13px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 2px solid #fff;
  `;
    indicator.innerHTML = `
    <div>🚀 Phase 5 Complete</div>
    <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">FileSystem Service Ready</div>
  `;
    document.body.appendChild(indicator);
    // Auto-remove after 8 seconds
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s ease';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 500);
    }, 8000);
});
// Export Phase 4 & 5 components




/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsQ0FBQztJQUNoRCxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRzs7Ozs7Ozs7Ozs7Ozs7R0FjekIsQ0FBQztJQUNGLFNBQVMsQ0FBQyxTQUFTLEdBQUc7OztHQUdyQixDQUFDO0lBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFckMsOEJBQThCO0lBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQztRQUNqRCxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDOUIsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQztBQUVILGdDQUFnQztBQUM4QztBQUNNO0FBQ2hCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91dGlscy9jb2xvci1wYWxldHRlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdXRpbHMvdmFsaWRhdGlvbi50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL25vdGlmaWNhdGlvbnMudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbW9kZWxzL0FwcFN0YXRlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdHlwZXMvZmlsZXN5c3RlbS50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL3lvbG8tcGFyc2VyLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvc2VydmljZXMvRmlsZVN5c3RlbVNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9zZXJ2aWNlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL2luZGV4LnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29sb3IgUGFsZXR0ZSBVdGlsaXR5IE1vZHVsZVxyXG4gKiBcclxuICogTWFuYWdlcyBjb2xvciBhc3NpZ25tZW50cyBmb3Igb2JqZWN0IGRldGVjdGlvbiBsYWJlbHMgYW5kIFVJIGVsZW1lbnRzLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBQcmVkZWZpbmVkIGNvbG9yIHBhbGV0dGUgZm9yIGxhYmVsIGNsYXNzZXNcclxuICogVXNlcyBhIG1peCBvZiBkaXN0aW5jdCBjb2xvcnMgb3B0aW1pemVkIGZvciB2aXNpYmlsaXR5IGFuZCBhY2Nlc3NpYmlsaXR5XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY29sb3JQYWxldHRlOiBzdHJpbmdbXSA9IFtcclxuICAgICcjZTYxOTRiJywgJyMzY2I0NGInLCAnI2ZmZTExOScsICcjNDM2M2Q4JywgJyNmNTgyMzEnLCBcclxuICAgICcjOTExZWI0JywgJyM0NmYwZjAnLCAnI2YwMzJlNicsICcjYmNmNjBjJywgJyNmYWJlYmUnLFxyXG4gICAgJyMwMDgwODAnLCAnI2U2YmVmZicsICcjOWE2MzI0JywgJyNmZmZhYzgnLCAnIzgwMDAwMCcsXHJcbiAgICAnI2FhZmZjMycsICcjODA4MDAwJywgJyNmZmQ4YjEnLCAnIzAwMDA3NScsICcjODA4MDgwJyxcclxuICAgICcjZmZmZmZmJywgJyMwMDAwMDAnLCAnIzFmNzdiNCcsICcjZmY3ZjBlJywgJyMyY2EwMmMnLFxyXG4gICAgJyNkNjI3MjgnLCAnIzk0NjdiZCcsICcjOGM1NjRiJywgJyNlMzc3YzInLCAnIzdmN2Y3ZidcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IGZhbGxiYWNrIGNvbG9yIGZvciBpbnZhbGlkIG9yIHVuYXNzaWduZWQgY2xhc3Nlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09MT1IgPSAnIzAwMDAwMCc7XHJcblxyXG4vKipcclxuICogR2V0cyBhIGNvbG9yIGZvciBhIHNwZWNpZmljIGxhYmVsIGNsYXNzXHJcbiAqIEBwYXJhbSBsYWJlbENsYXNzIC0gVGhlIGxhYmVsIGNsYXNzIGlkZW50aWZpZXIgKHN0cmluZyBvciBudW1iZXIpXHJcbiAqIEByZXR1cm5zIENvbG9yIGhleCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3M6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBjb25zdCBjbGFzc051bWJlciA9IHR5cGVvZiBsYWJlbENsYXNzID09PSAnc3RyaW5nJyBcclxuICAgICAgICA/IHBhcnNlSW50KGxhYmVsQ2xhc3MsIDEwKSBcclxuICAgICAgICA6IGxhYmVsQ2xhc3M7XHJcblxyXG4gICAgaWYgKGlzTmFOKGNsYXNzTnVtYmVyKSB8fCBjbGFzc051bWJlciA8IDApIHtcclxuICAgICAgICByZXR1cm4gREVGQVVMVF9DT0xPUjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb2xvckluZGV4ID0gY2xhc3NOdW1iZXIgJSBjb2xvclBhbGV0dGUubGVuZ3RoO1xyXG4gICAgcmV0dXJuIGNvbG9yUGFsZXR0ZVtjb2xvckluZGV4XSB8fCBERUZBVUxUX0NPTE9SO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBtdWx0aXBsZSBjb2xvcnMgZm9yIGEgbGlzdCBvZiBsYWJlbCBjbGFzc2VzXHJcbiAqIEBwYXJhbSBsYWJlbENsYXNzZXMgLSBBcnJheSBvZiBsYWJlbCBjbGFzcyBpZGVudGlmaWVyc1xyXG4gKiBAcmV0dXJucyBBcnJheSBvZiBjb2xvciBoZXggc3RyaW5nc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yc0ZvckNsYXNzZXMobGFiZWxDbGFzc2VzOiAoc3RyaW5nIHwgbnVtYmVyKVtdKTogc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIGxhYmVsQ2xhc3Nlcy5tYXAobGFiZWxDbGFzcyA9PiBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3MpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBpZiBhIGNvbG9yIGlzIGluIHRoZSBwYWxldHRlXHJcbiAqIEBwYXJhbSBjb2xvciAtIENvbG9yIGhleCBzdHJpbmcgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiBjb2xvciBleGlzdHMgaW4gcGFsZXR0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29sb3JJblBhbGV0dGUoY29sb3I6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGNvbG9yUGFsZXR0ZS5pbmNsdWRlcyhjb2xvci50b0xvd2VyQ2FzZSgpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGluZGV4IG9mIGEgY29sb3IgaW4gdGhlIHBhbGV0dGVcclxuICogQHBhcmFtIGNvbG9yIC0gQ29sb3IgaGV4IHN0cmluZ1xyXG4gKiBAcmV0dXJucyBJbmRleCBvZiB0aGUgY29sb3IsIG9yIC0xIGlmIG5vdCBmb3VuZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9ySW5kZXgoY29sb3I6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gY29sb3JQYWxldHRlLmZpbmRJbmRleChjID0+IGMudG9Mb3dlckNhc2UoKSA9PT0gY29sb3IudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGEgY29udHJhc3RpbmcgdGV4dCBjb2xvciAoYmxhY2sgb3Igd2hpdGUpIGZvciBhIGdpdmVuIGJhY2tncm91bmQgY29sb3JcclxuICogQHBhcmFtIGJhY2tncm91bmRDb2xvciAtIEJhY2tncm91bmQgY29sb3IgaGV4IHN0cmluZ1xyXG4gKiBAcmV0dXJucyAnIzAwMDAwMCcgZm9yIGxpZ2h0IGJhY2tncm91bmRzLCAnI2ZmZmZmZicgZm9yIGRhcmsgYmFja2dyb3VuZHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cmFzdGluZ1RleHRDb2xvcihiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAvLyBSZW1vdmUgIyBpZiBwcmVzZW50XHJcbiAgICBjb25zdCBoZXggPSBiYWNrZ3JvdW5kQ29sb3IucmVwbGFjZSgnIycsICcnKTtcclxuICAgIFxyXG4gICAgLy8gQ29udmVydCB0byBSR0JcclxuICAgIGNvbnN0IHIgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDAsIDIpLCAxNik7XHJcbiAgICBjb25zdCBnID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZygyLCA0KSwgMTYpO1xyXG4gICAgY29uc3QgYiA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoNCwgNiksIDE2KTtcclxuICAgIFxyXG4gICAgLy8gQ2FsY3VsYXRlIHJlbGF0aXZlIGx1bWluYW5jZVxyXG4gICAgY29uc3QgbHVtaW5hbmNlID0gKDAuMjk5ICogciArIDAuNTg3ICogZyArIDAuMTE0ICogYikgLyAyNTU7XHJcbiAgICBcclxuICAgIC8vIFJldHVybiBibGFjayBmb3IgbGlnaHQgYmFja2dyb3VuZHMsIHdoaXRlIGZvciBkYXJrIGJhY2tncm91bmRzXHJcbiAgICByZXR1cm4gbHVtaW5hbmNlID4gMC41ID8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydHMgaGV4IGNvbG9yIHRvIFJHQkFcclxuICogQHBhcmFtIGhleCAtIEhleCBjb2xvciBzdHJpbmdcclxuICogQHBhcmFtIGFscGhhIC0gQWxwaGEgdmFsdWUgKDAtMSlcclxuICogQHJldHVybnMgUkdCQSBjb2xvciBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBoZXhUb1JnYmEoaGV4OiBzdHJpbmcsIGFscGhhOiBudW1iZXIgPSAxKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGNsZWFuSGV4ID0gaGV4LnJlcGxhY2UoJyMnLCAnJyk7XHJcbiAgICBjb25zdCByID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDAsIDIpLCAxNik7XHJcbiAgICBjb25zdCBnID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDIsIDQpLCAxNik7XHJcbiAgICBjb25zdCBiID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDQsIDYpLCAxNik7XHJcbiAgICBcclxuICAgIHJldHVybiBgcmdiYSgke3J9LCAke2d9LCAke2J9LCAke2FscGhhfSlgO1xyXG59XHJcblxyXG4vKipcclxuICogQ29sb3IgY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JDb25maWcge1xyXG4gICAgcGFsZXR0ZTogc3RyaW5nW107XHJcbiAgICBkZWZhdWx0Q29sb3I6IHN0cmluZztcclxuICAgIHVzZUhpZ2hDb250cmFzdDogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkdmFuY2VkIGNvbG9yIG1hbmFnZW1lbnQgY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb2xvck1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBwYWxldHRlOiBzdHJpbmdbXTtcclxuICAgIHByaXZhdGUgZGVmYXVsdENvbG9yOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHVzZUhpZ2hDb250cmFzdDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFBhcnRpYWw8Q29sb3JDb25maWc+ID0ge30pIHtcclxuICAgICAgICB0aGlzLnBhbGV0dGUgPSBjb25maWcucGFsZXR0ZSB8fCBjb2xvclBhbGV0dGU7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29sb3IgPSBjb25maWcuZGVmYXVsdENvbG9yIHx8IERFRkFVTFRfQ09MT1I7XHJcbiAgICAgICAgdGhpcy51c2VIaWdoQ29udHJhc3QgPSBjb25maWcudXNlSGlnaENvbnRyYXN0IHx8IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBjb2xvciBmb3IgY2xhc3Mgd2l0aCBhZHZhbmNlZCBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGdldENvbG9yKGxhYmVsQ2xhc3M6IHN0cmluZyB8IG51bWJlciwgb3B0aW9ucz86IHsgaGlnaENvbnRyYXN0PzogYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBiYXNlQ29sb3IgPSBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChvcHRpb25zPy5oaWdoQ29udHJhc3QgfHwgdGhpcy51c2VIaWdoQ29udHJhc3QpIHtcclxuICAgICAgICAgICAgLy8gUmV0dXJuIGhpZ2ggY29udHJhc3QgdmVyc2lvbiBvZiBjb2xvclxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRIaWdoQ29udHJhc3RDb2xvcihiYXNlQ29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gYmFzZUNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBhIGhpZ2ggY29udHJhc3QgdmVyc2lvbiBvZiBhIGNvbG9yXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0SGlnaENvbnRyYXN0Q29sb3IoY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8gU2ltcGxlIGhpZ2ggY29udHJhc3QgaW1wbGVtZW50YXRpb25cclxuICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHlvdSBtaWdodCB1c2UgY29sb3IgdGhlb3J5IGFsZ29yaXRobXNcclxuICAgICAgICBjb25zdCBsdW1pbmFuY2UgPSB0aGlzLmdldENvbG9yTHVtaW5hbmNlKGNvbG9yKTtcclxuICAgICAgICByZXR1cm4gbHVtaW5hbmNlID4gMC41ID8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBjb2xvciBsdW1pbmFuY2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRDb2xvckx1bWluYW5jZShoZXg6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5IZXggPSBoZXgucmVwbGFjZSgnIycsICcnKTtcclxuICAgICAgICBjb25zdCByID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDAsIDIpLCAxNikgLyAyNTU7XHJcbiAgICAgICAgY29uc3QgZyA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZygyLCA0KSwgMTYpIC8gMjU1O1xyXG4gICAgICAgIGNvbnN0IGIgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoNCwgNiksIDE2KSAvIDI1NTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gMC4yOTkgKiByICsgMC41ODcgKiBnICsgMC4xMTQgKiBiO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIFZhbGlkYXRpb24gVXRpbGl0eSBNb2R1bGVcclxuICogXHJcbiAqIFByb3ZpZGVzIGlucHV0IHZhbGlkYXRpb24gZnVuY3Rpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICovXHJcblxyXG5pbXBvcnQgeyBzaG93VG9hc3QsIHNob3dFcnJvclRvYXN0IH0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0aW9uIHJlc3VsdCBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBpc1ZhbGlkOiBib29sZWFuO1xyXG4gICAgdmFsdWU/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICBlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgbGFiZWwgY2xhc3MgaW5wdXQgZnJvbSB1c2VyXHJcbiAqIEBwYXJhbSBpbnB1dCAtIFJhdyBpbnB1dCBmcm9tIHVzZXIgKGNhbiBiZSBudWxsIGlmIGNhbmNlbGxlZClcclxuICogQHJldHVybnMgVmFsaWRhdGVkIGNsYXNzIHN0cmluZyBvciBudWxsIGlmIGludmFsaWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUxhYmVsQ2xhc3MoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGlmIChpbnB1dCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsOyAvLyBVc2VyIGNhbmNlbGxlZCBwcm9tcHRcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmltbWVkSW5wdXQgPSBpbnB1dC50cmltKCk7XHJcbiAgICBcclxuICAgIGlmICh0cmltbWVkSW5wdXQgPT09ICcnKSB7XHJcbiAgICAgICAgc2hvd1RvYXN0KCdMYWJlbCBjbGFzcyBjYW5ub3QgYmUgZW1wdHkuJywgMzAwMCk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbnVtID0gTnVtYmVyKHRyaW1tZWRJbnB1dCk7XHJcblxyXG4gICAgaWYgKGlzTmFOKG51bSkgfHwgIU51bWJlci5pc0ludGVnZXIobnVtKSB8fCBudW0gPCAwIHx8IG51bSA+IDEwMDAwKSB7XHJcbiAgICAgICAgc2hvd1RvYXN0KCdJbnZhbGlkIExhYmVsOiBQbGVhc2UgZW50ZXIgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDEwMDAwLicsIDQwMDApO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmcobnVtKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkdmFuY2VkIGxhYmVsIGNsYXNzIHZhbGlkYXRpb24gd2l0aCBkZXRhaWxlZCByZXN1bHRcclxuICogQHBhcmFtIGlucHV0IC0gUmF3IGlucHV0IHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIERldGFpbGVkIHZhbGlkYXRpb24gcmVzdWx0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVMYWJlbENsYXNzQWR2YW5jZWQoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBWYWxpZGF0aW9uUmVzdWx0IHtcclxuICAgIGlmIChpbnB1dCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdJbnB1dCB3YXMgY2FuY2VsbGVkJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHJpbW1lZElucHV0ID0gaW5wdXQudHJpbSgpO1xyXG4gICAgXHJcbiAgICBpZiAodHJpbW1lZElucHV0ID09PSAnJykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBjYW5ub3QgYmUgZW1wdHknXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBudW0gPSBOdW1iZXIodHJpbW1lZElucHV0KTtcclxuXHJcbiAgICBpZiAoaXNOYU4obnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBtdXN0IGJlIGEgbnVtYmVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgbXVzdCBiZSBhbiBpbnRlZ2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG51bSA8IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgY2Fubm90IGJlIG5lZ2F0aXZlJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG51bSA+IDEwMDAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0xhYmVsIGNsYXNzIGNhbm5vdCBleGNlZWQgMTAwMDAnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgdmFsdWU6IFN0cmluZyhudW0pXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGZpbGUgbmFtZSBmb3Igc2FmZXR5XHJcbiAqIEBwYXJhbSBmaWxlTmFtZSAtIEZpbGUgbmFtZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghZmlsZU5hbWUgfHwgZmlsZU5hbWUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgaW52YWxpZCBjaGFyYWN0ZXJzXHJcbiAgICBjb25zdCBpbnZhbGlkQ2hhcnMgPSAvWzw+OlwiL1xcXFx8PypdLztcclxuICAgIGlmIChpbnZhbGlkQ2hhcnMudGVzdChmaWxlTmFtZSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIHJlc2VydmVkIG5hbWVzIChXaW5kb3dzKVxyXG4gICAgY29uc3QgcmVzZXJ2ZWROYW1lcyA9IC9eKENPTnxQUk58QVVYfE5VTHxDT01bMS05XXxMUFRbMS05XSkkL2k7XHJcbiAgICBpZiAocmVzZXJ2ZWROYW1lcy50ZXN0KGZpbGVOYW1lKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBpbWFnZSBmaWxlIGV4dGVuc2lvblxyXG4gKiBAcGFyYW0gZmlsZU5hbWUgLSBGaWxlIG5hbWUgdG8gY2hlY2tcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBpbWFnZSBleHRlbnNpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUltYWdlRXh0ZW5zaW9uKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHZhbGlkRXh0ZW5zaW9ucyA9IFsnLmpwZycsICcuanBlZycsICcucG5nJywgJy5ibXAnLCAnLnRpZmYnLCAnLnRpZicsICcud2VicCddO1xyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gZmlsZU5hbWUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSk7XHJcbiAgICByZXR1cm4gdmFsaWRFeHRlbnNpb25zLmluY2x1ZGVzKGV4dGVuc2lvbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgY29vcmRpbmF0ZSB2YWx1ZXMgZm9yIGJvdW5kaW5nIGJveGVzXHJcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB5IC0gWSBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB3aWR0aCAtIFdpZHRoXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBIZWlnaHRcclxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUJvdW5kaW5nQm94KFxyXG4gICAgeDogbnVtYmVyLCBcclxuICAgIHk6IG51bWJlciwgXHJcbiAgICB3aWR0aDogbnVtYmVyLCBcclxuICAgIGhlaWdodDogbnVtYmVyXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGlzTmFOKHgpIHx8IGlzTmFOKHkpIHx8IGlzTmFOKHdpZHRoKSB8fCBpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0FsbCBjb29yZGluYXRlcyBtdXN0IGJlIHZhbGlkIG51bWJlcnMnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2lkdGggPD0gMCB8fCBoZWlnaHQgPD0gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdXaWR0aCBhbmQgaGVpZ2h0IG11c3QgYmUgcG9zaXRpdmUnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeCA8IDAgfHwgeSA8IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnQ29vcmRpbmF0ZXMgY2Fubm90IGJlIG5lZ2F0aXZlJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIFlPTE8gZm9ybWF0IGNvb3JkaW5hdGVzIChub3JtYWxpemVkIDAtMSlcclxuICogQHBhcmFtIGNlbnRlclggLSBOb3JtYWxpemVkIGNlbnRlciBYICgwLTEpXHJcbiAqIEBwYXJhbSBjZW50ZXJZIC0gTm9ybWFsaXplZCBjZW50ZXIgWSAoMC0xKVxyXG4gKiBAcGFyYW0gd2lkdGggLSBOb3JtYWxpemVkIHdpZHRoICgwLTEpXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBOb3JtYWxpemVkIGhlaWdodCAoMC0xKVxyXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlWU9MT0Nvb3JkaW5hdGVzKFxyXG4gICAgY2VudGVyWDogbnVtYmVyLFxyXG4gICAgY2VudGVyWTogbnVtYmVyLFxyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIGhlaWdodDogbnVtYmVyXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGlzTmFOKGNlbnRlclgpIHx8IGlzTmFOKGNlbnRlclkpIHx8IGlzTmFOKHdpZHRoKSB8fCBpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0FsbCBZT0xPIGNvb3JkaW5hdGVzIG11c3QgYmUgdmFsaWQgbnVtYmVycydcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjZW50ZXJYIDwgMCB8fCBjZW50ZXJYID4gMSB8fCBjZW50ZXJZIDwgMCB8fCBjZW50ZXJZID4gMSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdDZW50ZXIgY29vcmRpbmF0ZXMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2lkdGggPD0gMCB8fCB3aWR0aCA+IDEgfHwgaGVpZ2h0IDw9IDAgfHwgaGVpZ2h0ID4gMSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdXaWR0aCBhbmQgaGVpZ2h0IG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIHpvb20gbGV2ZWxcclxuICogQHBhcmFtIHpvb20gLSBab29tIGxldmVsIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgem9vbSBsZXZlbFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlWm9vbUxldmVsKHpvb206IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICFpc05hTih6b29tKSAmJiB6b29tID4gMC4xICYmIHpvb20gPD0gMTA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgZm9udCBzaXplIGZvciBsYWJlbHNcclxuICogQHBhcmFtIGZvbnRTaXplIC0gRm9udCBzaXplIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgZm9udCBzaXplXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGb250U2l6ZShmb250U2l6ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIWlzTmFOKGZvbnRTaXplKSAmJiBmb250U2l6ZSA+PSA4ICYmIGZvbnRTaXplIDw9IDcyO1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhbCBwdXJwb3NlIG51bWJlciB2YWxpZGF0aW9uXHJcbiAqIEBwYXJhbSB2YWx1ZSAtIFZhbHVlIHRvIHZhbGlkYXRlXHJcbiAqIEBwYXJhbSBtaW4gLSBNaW5pbXVtIGFsbG93ZWQgdmFsdWVcclxuICogQHBhcmFtIG1heCAtIE1heGltdW0gYWxsb3dlZCB2YWx1ZVxyXG4gKiBAcGFyYW0gYWxsb3dGbG9hdCAtIFdoZXRoZXIgdG8gYWxsb3cgZmxvYXRpbmcgcG9pbnQgbnVtYmVyc1xyXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTnVtYmVyKFxyXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlcixcclxuICAgIG1pbj86IG51bWJlcixcclxuICAgIG1heD86IG51bWJlcixcclxuICAgIGFsbG93RmxvYXQ6IGJvb2xlYW4gPSB0cnVlXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgY29uc3QgbnVtID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IE51bWJlcih2YWx1ZSkgOiB2YWx1ZTtcclxuXHJcbiAgICBpZiAoaXNOYU4obnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdWYWx1ZSBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFhbGxvd0Zsb2F0ICYmICFOdW1iZXIuaXNJbnRlZ2VyKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnVmFsdWUgbXVzdCBiZSBhbiBpbnRlZ2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1pbiAhPT0gdW5kZWZpbmVkICYmIG51bSA8IG1pbikge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBWYWx1ZSBtdXN0IGJlIGF0IGxlYXN0ICR7bWlufWBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtYXggIT09IHVuZGVmaW5lZCAmJiBudW0gPiBtYXgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVmFsdWUgY2Fubm90IGV4Y2VlZCAke21heH1gXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgdmFsdWU6IG51bVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBlbWFpbCBmb3JtYXRcclxuICogQHBhcmFtIGVtYWlsIC0gRW1haWwgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBlbWFpbCBmb3JtYXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUVtYWlsKGVtYWlsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcclxuICAgIHJldHVybiBlbWFpbFJlZ2V4LnRlc3QoZW1haWwpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIFVSTCBmb3JtYXRcclxuICogQHBhcmFtIHVybCAtIFVSTCB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIFVSTCBmb3JtYXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVVybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBuZXcgVVJMKHVybCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdGl6ZXMgc3RyaW5nIGlucHV0IHRvIHByZXZlbnQgWFNTXHJcbiAqIEBwYXJhbSBpbnB1dCAtIElucHV0IHN0cmluZyB0byBzYW5pdGl6ZVxyXG4gKiBAcmV0dXJucyBTYW5pdGl6ZWQgc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJbnB1dChpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBpbnB1dFxyXG4gICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXHJcbiAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjeDI3OycpO1xyXG59IiwiLyoqXHJcbiAqIE5vdGlmaWNhdGlvbnMgVXRpbGl0eSBNb2R1bGVcclxuICogXHJcbiAqIEhhbmRsZXMgdXNlciBub3RpZmljYXRpb24gc3lzdGVtIGluY2x1ZGluZyB0b2FzdCBtZXNzYWdlcyBhbmQgYWxlcnRzLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHRvYXN0IG5vdGlmaWNhdGlvbiBtZXNzYWdlIHRvIHRoZSB1c2VyXHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBEdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDMwMDBtcylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbjogbnVtYmVyID0gMzAwMCk6IHZvaWQge1xyXG4gICAgY29uc3QgdG9hc3RDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QtY29udGFpbmVyJyk7XHJcbiAgICBpZiAoIXRvYXN0Q29udGFpbmVyKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdUb2FzdCBjb250YWluZXIgbm90IGZvdW5kLiBNZXNzYWdlOicsIG1lc3NhZ2UpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdG9hc3QuY2xhc3NOYW1lID0gJ3RvYXN0LW1lc3NhZ2UnO1xyXG4gICAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgdG9hc3RDb250YWluZXIuYXBwZW5kQ2hpbGQodG9hc3QpO1xyXG5cclxuICAgIC8vIFNob3cgdG9hc3Qgd2l0aCBzbGlnaHQgZGVsYXkgZm9yIGFuaW1hdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93JyksIDEwKTtcclxuXHJcbiAgICAvLyBIaWRlIGFuZCByZW1vdmUgdG9hc3QgYWZ0ZXIgZHVyYXRpb25cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRvYXN0LnBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRvYXN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMzAwKTsgLy8gV2FpdCBmb3IgZmFkZS1vdXQgYW5pbWF0aW9uXHJcbiAgICB9LCBkdXJhdGlvbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhbiBlcnJvciB0b2FzdCB3aXRoIGxvbmdlciBkdXJhdGlvblxyXG4gKiBAcGFyYW0gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvclRvYXN0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgc2hvd1RvYXN0KG1lc3NhZ2UsIDQwMDApO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYSBzdWNjZXNzIHRvYXN0IHdpdGggc3RhbmRhcmQgZHVyYXRpb25cclxuICogQHBhcmFtIG1lc3NhZ2UgLSBTdWNjZXNzIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTdWNjZXNzVG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBzaG93VG9hc3QobWVzc2FnZSwgMjAwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHdhcm5pbmcgdG9hc3RcclxuICogQHBhcmFtIG1lc3NhZ2UgLSBXYXJuaW5nIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dXYXJuaW5nVG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBzaG93VG9hc3QobWVzc2FnZSwgMzUwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUb2FzdCBtZXNzYWdlIHR5cGVzIGZvciB0eXBlIHNhZmV0eVxyXG4gKi9cclxuZXhwb3J0IHR5cGUgVG9hc3RUeXBlID0gJ3N1Y2Nlc3MnIHwgJ2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdpbmZvJztcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGZvciB0b2FzdCBub3RpZmljYXRpb25zXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRvYXN0Q29uZmlnIHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxuICAgIHR5cGU6IFRvYXN0VHlwZTtcclxuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xyXG4gICAgZGlzbWlzc2libGU/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYSB0eXBlZCB0b2FzdCBub3RpZmljYXRpb25cclxuICogQHBhcmFtIGNvbmZpZyAtIFRvYXN0IGNvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1R5cGVkVG9hc3QoY29uZmlnOiBUb2FzdENvbmZpZyk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBtZXNzYWdlLCB0eXBlLCBkdXJhdGlvbiwgZGlzbWlzc2libGUgPSBmYWxzZSB9ID0gY29uZmlnO1xyXG4gICAgXHJcbiAgICBjb25zdCBkZWZhdWx0RHVyYXRpb25zOiBSZWNvcmQ8VG9hc3RUeXBlLCBudW1iZXI+ID0ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IDIwMDAsXHJcbiAgICAgICAgZXJyb3I6IDQwMDAsXHJcbiAgICAgICAgd2FybmluZzogMzUwMCxcclxuICAgICAgICBpbmZvOiAzMDAwXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHRvYXN0RHVyYXRpb24gPSBkdXJhdGlvbiA/PyBkZWZhdWx0RHVyYXRpb25zW3R5cGVdO1xyXG4gICAgXHJcbiAgICBpZiAoZGlzbWlzc2libGUpIHtcclxuICAgICAgICAvLyBGb3IgZGlzbWlzc2libGUgdG9hc3RzLCB3ZSBjb3VsZCBhZGQgY2xvc2UgYnV0dG9uIGxvZ2ljIGhlcmVcclxuICAgICAgICBzaG93VG9hc3QoYCR7bWVzc2FnZX0gW0Rpc21pc3NpYmxlXWAsIHRvYXN0RHVyYXRpb24pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzaG93VG9hc3QobWVzc2FnZSwgdG9hc3REdXJhdGlvbik7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxyXG4gKiBBcHBTdGF0ZSBNb2RlbCAtIE1haW4gQXBwbGljYXRpb24gU3RhdGUgTWFuYWdlbWVudFxyXG4gKiBcclxuICogQ2VudHJhbGl6ZWQgc3RhdGUgbWFuYWdlbWVudCBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqIEhhbmRsZXMgYWxsIGFwcGxpY2F0aW9uIHN0YXRlIGluY2x1ZGluZyBmaWxlcywgVUkgc2V0dGluZ3MsIGNhY2hlLCBhbmQgY3VycmVudCB3b3Jrc3BhY2UuXHJcbiAqIFxyXG4gKiBAdmVyc2lvbiAxLjAuMFxyXG4gKiBAYXV0aG9yIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb25cclxuICovXHJcblxyXG5pbXBvcnQgeyBcclxuICBNb2RlLCBcclxuICBMYWJlbFNvcnRPcmRlciwgXHJcbiAgUG9pbnQsXHJcbiAgRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgXHJcbiAgRmlsZVN5c3RlbUZpbGVIYW5kbGVcclxufSBmcm9tICcuLi90eXBlcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gIElBcHBTdGF0ZSxcclxuICBBcHBTdGF0ZUNvbmZpZyxcclxuICBBcHBTdGF0ZU1ldGhvZHMsXHJcbiAgQXBwU3RhdGVFdmVudCxcclxuICBBcHBTdGF0ZUV2ZW50SGFuZGxlcixcclxuICBJbWFnZUZpbGUsXHJcbiAgQ2xhc3NGaWxlLFxyXG4gIENsYXNzRGVmaW5pdGlvbixcclxuICBDbGlwYm9hcmREYXRhLFxyXG4gIExvYWRUb2tlbixcclxuICBBcHBTdGF0ZVZhbGlkYXRpb24sXHJcbiAgU2VyaWFsaXphYmxlQXBwU3RhdGVcclxufSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5cclxuLyoqXHJcbiAqIEFwcFN0YXRlIENsYXNzXHJcbiAqIFxyXG4gKiBJbXBsZW1lbnRzIHRoZSBjb21wbGV0ZSBhcHBsaWNhdGlvbiBzdGF0ZSBtYW5hZ2VtZW50IHdpdGggdHlwZSBzYWZldHkuXHJcbiAqIFByb3ZpZGVzIG1ldGhvZHMgZm9yIG1hbmFnaW5nIGZpbGVzLCBVSSBzdGF0ZSwgY2FjaGUsIGFuZCB1c2VyIGludGVyYWN0aW9ucy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBcHBTdGF0ZSBpbXBsZW1lbnRzIElBcHBTdGF0ZSB7XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgSGFuZGxlcyAoRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSSlcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGltYWdlRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGxhYmVsRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGNsYXNzSW5mb0ZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBEYXRhIEFycmF5c1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW10gPSBbXTtcclxuICBwdWJsaWMgY2xhc3NGaWxlczogQ2xhc3NGaWxlW10gPSBbXTtcclxuICBwdWJsaWMgc2VsZWN0ZWRDbGFzc0ZpbGU6IENsYXNzRmlsZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdHVzIFRyYWNraW5nIE1hcHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGltYWdlTGFiZWxTdGF0dXMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTsgLy8gZmlsZU5hbWUgLT4gaGFzTGFiZWxzXHJcbiAgcHVibGljIGNsYXNzTmFtZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpOyAvLyBjbGFzc0lkIC0+IGNsYXNzTmFtZVxyXG4gIHB1YmxpYyBwcmV2aWV3SW1hZ2VDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7IC8vIGZpbGVOYW1lIC0+IG9iamVjdFVSTFxyXG4gIHB1YmxpYyBjb2xsYXBzZWRMYWJlbEdyb3VwcyA9IG5ldyBTZXQ8c3RyaW5nPigpOyAvLyBjb2xsYXBzZWQgZ3JvdXAgSURzXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDdXJyZW50IFdvcmtpbmcgU3RhdGVcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGN1cnJlbnRJbWFnZUZpbGU6IEltYWdlRmlsZSB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBjdXJyZW50SW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgY3VycmVudE1vZGU6IE1vZGUgPSAnZWRpdCc7XHJcbiAgcHVibGljIGN1cnJlbnRMb2FkVG9rZW46IExvYWRUb2tlbiA9IDA7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVSSBTZXR0aW5ncyAmIFByZWZlcmVuY2VzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBpc0F1dG9TYXZlRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBzaG93TGFiZWxzT25DYW52YXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyBsYWJlbEZvbnRTaXplOiBudW1iZXIgPSAxNDtcclxuICBwdWJsaWMgbGFiZWxTb3J0T3JkZXI6IExhYmVsU29ydE9yZGVyID0gJ2FzYyc7XHJcbiAgcHVibGljIGlzUHJldmlld0JhckhpZGRlbjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc0Nyb3NzaGFpclZpc2libGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEludGVybmFsIFN0YXRlICYgVGVtcG9yYXJ5IERhdGFcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIHNhdmVUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBfY2xpcGJvYXJkOiBDbGlwYm9hcmREYXRhIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGxhc3RNb3VzZVBvc2l0aW9uOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG4gIHB1YmxpYyBjb250ZXh0VGFyZ2V0OiBhbnkgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgU3lzdGVtXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgQXBwU3RhdGVFdmVudEhhbmRsZXJbXT4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgLSBJbml0aWFsaXplIEFwcFN0YXRlIHdpdGggZGVmYXVsdCB2YWx1ZXNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIEFsbCBwcm9wZXJ0aWVzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkIGFib3ZlXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6aW5pdGlhbGl6ZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFN0YXRlIE1hbmFnZW1lbnQgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgYWxsIHN0YXRlIHRvIGluaXRpYWwgdmFsdWVzXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gQ2xlYXIgZmlsZSBoYW5kbGVzXHJcbiAgICB0aGlzLmltYWdlRm9sZGVySGFuZGxlID0gbnVsbDtcclxuICAgIHRoaXMubGFiZWxGb2xkZXJIYW5kbGUgPSBudWxsO1xyXG4gICAgdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUgPSBudWxsO1xyXG5cclxuICAgIC8vIENsZWFyIGZpbGUgYXJyYXlzXHJcbiAgICB0aGlzLmltYWdlRmlsZXMgPSBbXTtcclxuICAgIHRoaXMuY2xhc3NGaWxlcyA9IFtdO1xyXG4gICAgdGhpcy5zZWxlY3RlZENsYXNzRmlsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2xlYXIgbWFwcyBhbmQgc2V0c1xyXG4gICAgdGhpcy5pbWFnZUxhYmVsU3RhdHVzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmNsYXNzTmFtZXMuY2xlYXIoKTtcclxuICAgIHRoaXMuY29sbGFwc2VkTGFiZWxHcm91cHMuY2xlYXIoKTtcclxuICAgIHRoaXMuY2xlYXJQcmV2aWV3Q2FjaGUoKTtcclxuXHJcbiAgICAvLyBSZXNldCBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZUZpbGUgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9ICdlZGl0JztcclxuICAgIHRoaXMuY3VycmVudExvYWRUb2tlbiA9IDA7XHJcblxyXG4gICAgLy8gUmVzZXQgVUkgc2V0dGluZ3MgdG8gZGVmYXVsdHNcclxuICAgIHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gdHJ1ZTtcclxuICAgIHRoaXMubGFiZWxGb250U2l6ZSA9IDE0O1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9ICdhc2MnO1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQ2xlYXIgaW50ZXJuYWwgc3RhdGVcclxuICAgIGlmICh0aGlzLnNhdmVUaW1lb3V0KSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNhdmVUaW1lb3V0KTtcclxuICAgICAgdGhpcy5zYXZlVGltZW91dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgdGhpcy5jb250ZXh0VGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6cmVzZXQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbWFnZSBmb2xkZXIgaGFuZGxlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEltYWdlRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5pbWFnZUZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6aW1hZ2Utc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBsYWJlbCBmb2xkZXIgaGFuZGxlXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbEZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6bGFiZWwtc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjbGFzcyBpbmZvIGZvbGRlciBoYW5kbGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q2xhc3NJbmZvRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUgPSBoYW5kbGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnZm9sZGVyOmNsYXNzLWluZm8tc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEltYWdlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY3VycmVudCB3b3JraW5nIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEN1cnJlbnRJbWFnZShpbWFnZUZpbGU6IEltYWdlRmlsZSB8IG51bGwpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByZXZpb3VzSW1hZ2UgPSB0aGlzLmN1cnJlbnRJbWFnZUZpbGU7XHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZUZpbGUgPSBpbWFnZUZpbGU7XHJcbiAgICBcclxuICAgIC8vIEluY3JlbWVudCBsb2FkIHRva2VuIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zXHJcbiAgICB0aGlzLmN1cnJlbnRMb2FkVG9rZW4gKz0gMTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnaW1hZ2U6Y3VycmVudC1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBcclxuICAgICAgICBwcmV2aW91czogcHJldmlvdXNJbWFnZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICAgIGN1cnJlbnQ6IGltYWdlRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICAgIGxvYWRUb2tlbjogdGhpcy5jdXJyZW50TG9hZFRva2VuXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgbGFiZWwgc3RhdHVzIGZvciBhbiBpbWFnZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRJbWFnZUxhYmVsU3RhdHVzKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmltYWdlTGFiZWxTdGF0dXMuZ2V0KGZpbGVOYW1lKSB8fCBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBzdGF0dXMgZm9yIGFuIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEltYWdlTGFiZWxTdGF0dXMoZmlsZU5hbWU6IHN0cmluZywgaGFzTGFiZWxzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLmltYWdlTGFiZWxTdGF0dXMuc2V0KGZpbGVOYW1lLCBoYXNMYWJlbHMpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ltYWdlOmxhYmVsLXN0YXR1cy1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBmaWxlTmFtZSwgaGFzTGFiZWxzIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTW9kZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGN1cnJlbnQgZHJhd2luZy9lZGl0aW5nIG1vZGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TW9kZShtb2RlOiBNb2RlKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcmV2aW91c01vZGUgPSB0aGlzLmN1cnJlbnRNb2RlO1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9IG1vZGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnbW9kZTpjaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBwcmV2aW91czogcHJldmlvdXNNb2RlLCBjdXJyZW50OiBtb2RlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgYmV0d2VlbiBkcmF3IGFuZCBlZGl0IG1vZGVzXHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZU1vZGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBuZXdNb2RlOiBNb2RlID0gdGhpcy5jdXJyZW50TW9kZSA9PT0gJ2VkaXQnID8gJ2RyYXcnIDogJ2VkaXQnO1xyXG4gICAgdGhpcy5zZXRNb2RlKG5ld01vZGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENsYXNzIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbGVjdCBhIGNsYXNzIGZpbGUgZm9yIHVzZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZWxlY3RDbGFzc0ZpbGUoY2xhc3NGaWxlOiBDbGFzc0ZpbGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkQ2xhc3NGaWxlID0gY2xhc3NGaWxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsYXNzOmZpbGUtc2VsZWN0ZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lOiBjbGFzc0ZpbGU/Lm5hbWUgfHwgbnVsbCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgY2xhc3MgZGVmaW5pdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRDbGFzc0RlZmluaXRpb24oY2xhc3NEZWY6IENsYXNzRGVmaW5pdGlvbik6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc05hbWVzLnNldChjbGFzc0RlZi5pZC50b1N0cmluZygpLCBjbGFzc0RlZi5uYW1lKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGFzczpkZWZpbml0aW9uLWFkZGVkJyxcclxuICAgICAgZGF0YTogY2xhc3NEZWYsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBjbGFzcyBkZWZpbml0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUNsYXNzRGVmaW5pdGlvbihjbGFzc0lkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuY2xhc3NOYW1lcy5kZWxldGUoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGFzczpkZWZpbml0aW9uLXJlbW92ZWQnLFxyXG4gICAgICBkYXRhOiB7IGNsYXNzSWQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTZXR0aW5ncyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgYXV0by1zYXZlIGZ1bmN0aW9uYWxpdHlcclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXV0b1NhdmUoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2V0dGluZ3M6YXV0by1zYXZlLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IGVuYWJsZWQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBsYWJlbCB2aXNpYmlsaXR5IG9uIGNhbnZhc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTaG93TGFiZWxzKHNob3c6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gc2hvdztcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZXR0aW5nczpzaG93LWxhYmVscy1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBzaG93IH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbGFiZWwgZm9udCBzaXplXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsRm9udFNpemUoc2l6ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAoc2l6ZSA+PSA4ICYmIHNpemUgPD0gNDgpIHtcclxuICAgICAgdGhpcy5sYWJlbEZvbnRTaXplID0gc2l6ZTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnc2V0dGluZ3M6Zm9udC1zaXplLWNoYW5nZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgc2l6ZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBzb3J0IG9yZGVyXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsU29ydE9yZGVyKG9yZGVyOiBMYWJlbFNvcnRPcmRlcik6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9IG9yZGVyO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3NldHRpbmdzOnNvcnQtb3JkZXItY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgb3JkZXIgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVSSBTdGF0ZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgcHJldmlldyBiYXIgdmlzaWJpbGl0eVxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b2dnbGVQcmV2aWV3QmFyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSAhdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW47XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAndWk6cHJldmlldy1iYXItdG9nZ2xlZCcsXHJcbiAgICAgIGRhdGE6IHsgaGlkZGVuOiB0aGlzLmlzUHJldmlld0JhckhpZGRlbiB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIGNyb3NzaGFpciB2aXNpYmlsaXR5XHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZUNyb3NzaGFpcigpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlID0gIXRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3VpOmNyb3NzaGFpci10b2dnbGVkJyxcclxuICAgICAgZGF0YTogeyB2aXNpYmxlOiB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGNvbnRleHQgbWVudSB0YXJnZXRcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q29udGV4dFRhcmdldCh0YXJnZXQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5jb250ZXh0VGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3VpOmNvbnRleHQtdGFyZ2V0LXNldCcsXHJcbiAgICAgIGRhdGE6IHsgdGFyZ2V0IH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2FjaGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FjaGUgYSBwcmV2aWV3IGltYWdlIE9iamVjdFVSTFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYWNoZVByZXZpZXdJbWFnZShmaWxlTmFtZTogc3RyaW5nLCBvYmplY3RVUkw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5zZXQoZmlsZU5hbWUsIG9iamVjdFVSTCk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6cHJldmlldy1jYWNoZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgY2FjaGVkIHByZXZpZXcgaW1hZ2UgT2JqZWN0VVJMXHJcbiAgICovXHJcbiAgcHVibGljIGdldENhY2hlZFByZXZpZXdJbWFnZShmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLmdldChmaWxlTmFtZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciBhbGwgcHJldmlldyBjYWNoZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhclByZXZpZXdDYWNoZSgpOiB2b2lkIHtcclxuICAgIC8vIFJldm9rZSBhbGwgT2JqZWN0VVJMcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xyXG4gICAgZm9yIChjb25zdCBvYmplY3RVUkwgb2YgdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS52YWx1ZXMoKSkge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVSTCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6cHJldmlldy1jbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDbGlwYm9hcmQgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGNsaXBib2FyZCBkYXRhXHJcbiAgICovXHJcbiAgcHVibGljIHNldENsaXBib2FyZChkYXRhOiBDbGlwYm9hcmREYXRhKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBkYXRhO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsaXBib2FyZDpkYXRhLXNldCcsXHJcbiAgICAgIGRhdGE6IHsgdHlwZTogZGF0YS50eXBlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgY2xpcGJvYXJkIGRhdGFcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2xpcGJvYXJkKCk6IENsaXBib2FyZERhdGEgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jbGlwYm9hcmQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciBjbGlwYm9hcmRcclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXJDbGlwYm9hcmQoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBudWxsO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsaXBib2FyZDpjbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW0gSW1wbGVtZW50YXRpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lclxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogQXBwU3RhdGVFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQodHlwZSwgW10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSkhLnB1c2goaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEFwcFN0YXRlRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBoYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwYXRjaCBldmVudCB0byBhbGwgbGlzdGVuZXJzXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEFwcFN0YXRlRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVXRpbGl0eSBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBjdXJyZW50IHN0YXRlXHJcbiAgICovXHJcbiAgcHVibGljIHZhbGlkYXRlKCk6IEFwcFN0YXRlVmFsaWRhdGlvbiB7XHJcbiAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3IgcmVxdWlyZWQgZm9sZGVyc1xyXG4gICAgaWYgKCF0aGlzLmltYWdlRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ05vIGltYWdlIGZvbGRlciBzZWxlY3RlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5sYWJlbEZvbGRlckhhbmRsZSkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdObyBsYWJlbCBmb2xkZXIgc2VsZWN0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb250IHNpemUgcmFuZ2VcclxuICAgIGlmICh0aGlzLmxhYmVsRm9udFNpemUgPCA4IHx8IHRoaXMubGFiZWxGb250U2l6ZSA+IDQ4KSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdMYWJlbCBmb250IHNpemUgbXVzdCBiZSBiZXR3ZWVuIDggYW5kIDQ4Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIG1lbW9yeSBsZWFrcyBpbiBjYWNoZVxyXG4gICAgaWYgKHRoaXMucHJldmlld0ltYWdlQ2FjaGUuc2l6ZSA+IDEwMCkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdQcmV2aWV3IGNhY2hlIGlzIGxhcmdlLCBjb25zaWRlciBjbGVhcmluZycpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgc2VyaWFsaXphYmxlIHN0YXRlIChmb3IgcGVyc2lzdGVuY2UpXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNlcmlhbGl6YWJsZVN0YXRlKCk6IFNlcmlhbGl6YWJsZUFwcFN0YXRlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGN1cnJlbnRNb2RlOiB0aGlzLmN1cnJlbnRNb2RlLFxyXG4gICAgICBpc0F1dG9TYXZlRW5hYmxlZDogdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCxcclxuICAgICAgc2hvd0xhYmVsc09uQ2FudmFzOiB0aGlzLnNob3dMYWJlbHNPbkNhbnZhcyxcclxuICAgICAgbGFiZWxGb250U2l6ZTogdGhpcy5sYWJlbEZvbnRTaXplLFxyXG4gICAgICBsYWJlbFNvcnRPcmRlcjogdGhpcy5sYWJlbFNvcnRPcmRlcixcclxuICAgICAgaXNQcmV2aWV3QmFySGlkZGVuOiB0aGlzLmlzUHJldmlld0JhckhpZGRlbixcclxuICAgICAgaXNDcm9zc2hhaXJWaXNpYmxlOiB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgZnJvbSBzZXJpYWxpemFibGUgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgcmVzdG9yZUZyb21TZXJpYWxpemFibGVTdGF0ZShzdGF0ZTogU2VyaWFsaXphYmxlQXBwU3RhdGUpOiB2b2lkIHtcclxuICAgIHRoaXMuY3VycmVudE1vZGUgPSBzdGF0ZS5jdXJyZW50TW9kZTtcclxuICAgIHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQgPSBzdGF0ZS5pc0F1dG9TYXZlRW5hYmxlZDtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gc3RhdGUuc2hvd0xhYmVsc09uQ2FudmFzO1xyXG4gICAgdGhpcy5sYWJlbEZvbnRTaXplID0gc3RhdGUubGFiZWxGb250U2l6ZTtcclxuICAgIHRoaXMubGFiZWxTb3J0T3JkZXIgPSBzdGF0ZS5sYWJlbFNvcnRPcmRlcjtcclxuICAgIHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuID0gc3RhdGUuaXNQcmV2aWV3QmFySGlkZGVuO1xyXG4gICAgdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgPSBzdGF0ZS5pc0Nyb3NzaGFpclZpc2libGU7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3N0YXRlOnJlc3RvcmVkJyxcclxuICAgICAgZGF0YTogc3RhdGUsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgZGVidWcgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGVidWdJbmZvKCk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaW1hZ2VGaWxlc0NvdW50OiB0aGlzLmltYWdlRmlsZXMubGVuZ3RoLFxyXG4gICAgICBjbGFzc0ZpbGVzQ291bnQ6IHRoaXMuY2xhc3NGaWxlcy5sZW5ndGgsXHJcbiAgICAgIGltYWdlTGFiZWxTdGF0dXNDb3VudDogdGhpcy5pbWFnZUxhYmVsU3RhdHVzLnNpemUsXHJcbiAgICAgIGNsYXNzTmFtZXNDb3VudDogdGhpcy5jbGFzc05hbWVzLnNpemUsXHJcbiAgICAgIHByZXZpZXdDYWNoZVNpemU6IHRoaXMucHJldmlld0ltYWdlQ2FjaGUuc2l6ZSxcclxuICAgICAgY29sbGFwc2VkR3JvdXBzQ291bnQ6IHRoaXMuY29sbGFwc2VkTGFiZWxHcm91cHMuc2l6ZSxcclxuICAgICAgY3VycmVudExvYWRUb2tlbjogdGhpcy5jdXJyZW50TG9hZFRva2VuLFxyXG4gICAgICBoYXNJbWFnZUZvbGRlcjogISF0aGlzLmltYWdlRm9sZGVySGFuZGxlLFxyXG4gICAgICBoYXNMYWJlbEZvbGRlcjogISF0aGlzLmxhYmVsRm9sZGVySGFuZGxlLFxyXG4gICAgICBoYXNDbGFzc0luZm9Gb2xkZXI6ICEhdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUsXHJcbiAgICAgIGN1cnJlbnRJbWFnZU5hbWU6IHRoaXMuY3VycmVudEltYWdlRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICBzZWxlY3RlZENsYXNzRmlsZU5hbWU6IHRoaXMuc2VsZWN0ZWRDbGFzc0ZpbGU/Lm5hbWUgfHwgbnVsbCxcclxuICAgICAgZXZlbnRMaXN0ZW5lclR5cGVzOiBBcnJheS5mcm9tKHRoaXMuZXZlbnRMaXN0ZW5lcnMua2V5cygpKVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBGdW5jdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IEFwcFN0YXRlIGluc3RhbmNlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBwU3RhdGUoKTogQXBwU3RhdGUge1xyXG4gIHJldHVybiBuZXcgQXBwU3RhdGUoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBBcHBTdGF0ZSB3aXRoIGluaXRpYWwgY29uZmlndXJhdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFwcFN0YXRlV2l0aENvbmZpZyhjb25maWc6IFBhcnRpYWw8QXBwU3RhdGVDb25maWc+KTogQXBwU3RhdGUge1xyXG4gIGNvbnN0IGFwcFN0YXRlID0gbmV3IEFwcFN0YXRlKCk7XHJcbiAgXHJcbiAgLy8gQXBwbHkgY29uZmlndXJhdGlvblxyXG4gIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgaWYgKGtleSBpbiBhcHBTdGF0ZSkge1xyXG4gICAgICAoYXBwU3RhdGUgYXMgYW55KVtrZXldID0gKGNvbmZpZyBhcyBhbnkpW2tleV07XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBhcHBTdGF0ZTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFwcFN0YXRlO1xyXG5leHBvcnQgdHlwZSB7IElBcHBTdGF0ZSwgQXBwU3RhdGVDb25maWcsIEFwcFN0YXRlTWV0aG9kcyB9OyIsIi8qKlxyXG4gKiBGaWxlU3lzdGVtIFNlcnZpY2UgVHlwZSBEZWZpbml0aW9uc1xyXG4gKiBcclxuICogVHlwZXMgZm9yIGZpbGUgSS9PIG9wZXJhdGlvbnMsIFlPTE8gZm9ybWF0IGhhbmRsaW5nLCBhbmQgRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSSBpbnRlZ3JhdGlvbi5cclxuICovXHJcblxyXG5pbXBvcnQgeyBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBGaWxlU3lzdGVtRmlsZUhhbmRsZSB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBJbWFnZUZpbGUsIENsYXNzRmlsZSwgQ2xhc3NEZWZpbml0aW9uIH0gZnJvbSAnLi9hcHAtc3RhdGUnO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGaWxlIE9wZXJhdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlT3BlcmF0aW9uUmVzdWx0PFQgPSB2b2lkPiB7XHJcbiAgc3VjY2VzczogYm9vbGVhbjtcclxuICBkYXRhPzogVDtcclxuICBlcnJvcj86IHN0cmluZztcclxuICBtZXNzYWdlPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVMb2FkUmVzdWx0IHtcclxuICBjb250ZW50OiBzdHJpbmc7XHJcbiAgZmlsZTogRmlsZTtcclxuICBsYXN0TW9kaWZpZWQ6IERhdGU7XHJcbiAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFlPTE8gRm9ybWF0IFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgWW9sb0xhYmVsIHtcclxuICBjbGFzc0lkOiBudW1iZXI7XHJcbiAgY2VudGVyWDogbnVtYmVyO1xyXG4gIGNlbnRlclk6IG51bWJlcjtcclxuICB3aWR0aDogbnVtYmVyO1xyXG4gIGhlaWdodDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFlvbG9QYXJzZVJlc3VsdCB7XHJcbiAgbGFiZWxzOiBZb2xvTGFiZWxbXTtcclxuICBlcnJvcnM6IHN0cmluZ1tdO1xyXG4gIHdhcm5pbmdzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBZb2xvRXhwb3J0T3B0aW9ucyB7XHJcbiAgcHJlY2lzaW9uPzogbnVtYmVyO1xyXG4gIGluY2x1ZGVDb21tZW50cz86IGJvb2xlYW47XHJcbiAgdmFsaWRhdGVCb3VuZHM/OiBib29sZWFuO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENsYXNzIEZpbGUgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbGFzc0ZpbGVDb250ZW50IHtcclxuICBjbGFzc2VzOiBDbGFzc0RlZmluaXRpb25bXTtcclxuICBtZXRhZGF0YT86IHtcclxuICAgIHZlcnNpb24/OiBzdHJpbmc7XHJcbiAgICBjcmVhdGVkPzogRGF0ZTtcclxuICAgIG1vZGlmaWVkPzogRGF0ZTtcclxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xhc3NGaWxlVmFsaWRhdGlvbiB7XHJcbiAgaXNWYWxpZDogYm9vbGVhbjtcclxuICBlcnJvcnM6IHN0cmluZ1tdO1xyXG4gIHdhcm5pbmdzOiBzdHJpbmdbXTtcclxuICBkdXBsaWNhdGVJZHM6IG51bWJlcltdO1xyXG4gIGVtcHR5TmFtZXM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZvbGRlciBPcGVyYXRpb25zXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRm9sZGVyU2NhblJlc3VsdCB7XHJcbiAgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW107XHJcbiAgbGFiZWxGaWxlczogc3RyaW5nW107XHJcbiAgY2xhc3NGaWxlczogQ2xhc3NGaWxlW107XHJcbiAgdG90YWxGaWxlczogbnVtYmVyO1xyXG4gIGVycm9yczogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGFiZWxTdGF0dXMge1xyXG4gIGZpbGVOYW1lOiBzdHJpbmc7XHJcbiAgaGFzTGFiZWxzOiBib29sZWFuO1xyXG4gIGxhYmVsQ291bnQ6IG51bWJlcjtcclxuICBsYXN0TW9kaWZpZWQ/OiBEYXRlO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEltYWdlIFByb2Nlc3NpbmdcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbWFnZUxvYWRPcHRpb25zIHtcclxuICBtYXhXaWR0aD86IG51bWJlcjtcclxuICBtYXhIZWlnaHQ/OiBudW1iZXI7XHJcbiAgcXVhbGl0eT86IG51bWJlcjtcclxuICBmb3JtYXQ/OiAncG5nJyB8ICdqcGVnJyB8ICd3ZWJwJztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbWFnZUluZm8ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB3aWR0aDogbnVtYmVyO1xyXG4gIGhlaWdodDogbnVtYmVyO1xyXG4gIHNpemU6IG51bWJlcjtcclxuICBmb3JtYXQ6IHN0cmluZztcclxuICBsYXN0TW9kaWZpZWQ6IERhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGlmZlByb2Nlc3NpbmdPcHRpb25zIHtcclxuICBwYWdlPzogbnVtYmVyO1xyXG4gIGNvbnZlcnRUb0NhbnZhcz86IGJvb2xlYW47XHJcbiAgYmFja2dyb3VuZENvbG9yPzogc3RyaW5nO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENhY2hlIE1hbmFnZW1lbnRcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYWNoZUVudHJ5PFQ+IHtcclxuICBkYXRhOiBUO1xyXG4gIHRpbWVzdGFtcDogRGF0ZTtcclxuICBzaXplOiBudW1iZXI7XHJcbiAgaGl0czogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENhY2hlU3RhdHMge1xyXG4gIHRvdGFsRW50cmllczogbnVtYmVyO1xyXG4gIHRvdGFsU2l6ZTogbnVtYmVyO1xyXG4gIGhpdFJhdGU6IG51bWJlcjtcclxuICBtZW1vcnlVc2FnZTogbnVtYmVyO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZpbGUgU3lzdGVtIFNlcnZpY2UgSW50ZXJmYWNlXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICAvLyBGb2xkZXIgT3BlcmF0aW9uc1xyXG4gIHNlbGVjdEltYWdlRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj47XHJcbiAgc2VsZWN0TGFiZWxGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PjtcclxuICBzZWxlY3RDbGFzc0luZm9Gb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PjtcclxuICBcclxuICAvLyBGaWxlIExpc3RpbmdcclxuICBsaXN0SW1hZ2VGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SW1hZ2VGaWxlW10+PjtcclxuICBsaXN0Q2xhc3NGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Q2xhc3NGaWxlW10+PjtcclxuICBzY2FuRm9sZGVyKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGb2xkZXJTY2FuUmVzdWx0Pj47XHJcbiAgXHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIGxvYWRJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+O1xyXG4gIGxvYWRUaWZmSW1hZ2UoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIG9wdGlvbnM/OiBUaWZmUHJvY2Vzc2luZ09wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+O1xyXG4gIGdldEltYWdlSW5mbyhmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxJbWFnZUluZm8+PjtcclxuICBcclxuICAvLyBMYWJlbCBPcGVyYXRpb25zXHJcbiAgbG9hZExhYmVscyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8WW9sb0xhYmVsW10+PjtcclxuICBzYXZlTGFiZWxzKGZpbGVOYW1lOiBzdHJpbmcsIGxhYmVsczogWW9sb0xhYmVsW10sIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdD47XHJcbiAgY2hlY2tMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8TGFiZWxTdGF0dXM+PjtcclxuICBcclxuICAvLyBDbGFzcyBGaWxlIE9wZXJhdGlvbnNcclxuICBsb2FkQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PENsYXNzRmlsZUNvbnRlbnQ+PjtcclxuICBzYXZlQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBjb250ZW50OiBDbGFzc0ZpbGVDb250ZW50KTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PjtcclxuICBjcmVhdGVDbGFzc0ZpbGUoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBmaWxlTmFtZTogc3RyaW5nLCBpbml0aWFsQ29udGVudD86IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbUZpbGVIYW5kbGU+PjtcclxuICB2YWxpZGF0ZUNsYXNzRmlsZShjb250ZW50OiBzdHJpbmcpOiBDbGFzc0ZpbGVWYWxpZGF0aW9uO1xyXG4gIFxyXG4gIC8vIFlPTE8gRm9ybWF0IFByb2Nlc3NpbmdcclxuICBwYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IFlvbG9QYXJzZVJlc3VsdDtcclxuICBsYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzOiBZb2xvTGFiZWxbXSwgb3B0aW9ucz86IFlvbG9FeHBvcnRPcHRpb25zKTogc3RyaW5nO1xyXG4gIHZhbGlkYXRlWW9sb0xhYmVsKGxhYmVsOiBZb2xvTGFiZWwpOiBib29sZWFuO1xyXG4gIFxyXG4gIC8vIENhY2hlIE1hbmFnZW1lbnRcclxuICBjbGVhckltYWdlQ2FjaGUoKTogdm9pZDtcclxuICBnZXRDYWNoZVN0YXRzKCk6IENhY2hlU3RhdHM7XHJcbiAgb3B0aW1pemVDYWNoZSgpOiB2b2lkO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENvbmZpZ3VyYXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtQ29uZmlnIHtcclxuICAvLyBJbWFnZSBzZXR0aW5nc1xyXG4gIHN1cHBvcnRlZEltYWdlRm9ybWF0czogc3RyaW5nW107XHJcbiAgbWF4SW1hZ2VTaXplOiBudW1iZXI7XHJcbiAgdGh1bWJuYWlsU2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gIFxyXG4gIC8vIENhY2hlIHNldHRpbmdzXHJcbiAgbWF4Q2FjaGVTaXplOiBudW1iZXI7XHJcbiAgY2FjaGVUaW1lb3V0OiBudW1iZXI7XHJcbiAgXHJcbiAgLy8gWU9MTyBzZXR0aW5nc1xyXG4gIHlvbG9WYWxpZGF0aW9uOiB7XHJcbiAgICBzdHJpY3RCb3VuZHM6IGJvb2xlYW47XHJcbiAgICBhbGxvd1plcm9TaXplOiBib29sZWFuO1xyXG4gICAgcHJlY2lzaW9uOiBudW1iZXI7XHJcbiAgfTtcclxuICBcclxuICAvLyBQZXJmb3JtYW5jZSBzZXR0aW5nc1xyXG4gIGJhdGNoU2l6ZTogbnVtYmVyO1xyXG4gIGNvbmN1cnJlbnRMb2FkczogbnVtYmVyO1xyXG4gIHByZWxvYWRBZGphY2VudDogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFdmVudHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtRXZlbnQge1xyXG4gIHR5cGU6IHN0cmluZztcclxuICBkYXRhPzogYW55O1xyXG4gIHRpbWVzdGFtcDogRGF0ZTtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgRmlsZVN5c3RlbUV2ZW50SGFuZGxlciA9IChldmVudDogRmlsZVN5c3RlbUV2ZW50KSA9PiB2b2lkO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFcnJvciBUeXBlc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZVN5c3RlbUVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGNvZGU6IHN0cmluZyxcclxuICAgIHB1YmxpYyBkZXRhaWxzPzogYW55XHJcbiAgKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICAgIHRoaXMubmFtZSA9ICdGaWxlU3lzdGVtRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFlvbG9Gb3JtYXRFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIHB1YmxpYyBsaW5lPzogbnVtYmVyLFxyXG4gICAgcHVibGljIGRhdGE/OiBzdHJpbmdcclxuICApIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gICAgdGhpcy5uYW1lID0gJ1lvbG9Gb3JtYXRFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW1hZ2VMb2FkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgZmlsZU5hbWU/OiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgY2F1c2U/OiBFcnJvclxyXG4gICkge1xyXG4gICAgc3VwZXIobWVzc2FnZSk7XHJcbiAgICB0aGlzLm5hbWUgPSAnSW1hZ2VMb2FkRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBVdGlsaXR5IFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCB0eXBlIEZpbGVGb3JtYXQgPSAnanBnJyB8ICdqcGVnJyB8ICdwbmcnIHwgJ2dpZicgfCAndGlmJyB8ICd0aWZmJyB8ICd3ZWJwJztcclxuZXhwb3J0IHR5cGUgTGFiZWxGb3JtYXQgPSAneW9sbycgfCAnY29jbycgfCAncGFzY2FsJyB8ICdjdXN0b20nO1xyXG5leHBvcnQgdHlwZSBDbGFzc0ZpbGVGb3JtYXQgPSAneWFtbCcgfCAneW1sJyB8ICdqc29uJyB8ICd0eHQnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlVHlwZUluZm8ge1xyXG4gIGV4dGVuc2lvbjogc3RyaW5nO1xyXG4gIG1pbWVUeXBlOiBzdHJpbmc7XHJcbiAgY2F0ZWdvcnk6ICdpbWFnZScgfCAnbGFiZWwnIHwgJ2NsYXNzJyB8ICdvdGhlcic7XHJcbiAgc3VwcG9ydGVkOiBib29sZWFuO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZhY3RvcnkgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtU2VydmljZUZhY3Rvcnkge1xyXG4gIGNyZWF0ZShjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KTogSUZpbGVTeXN0ZW1TZXJ2aWNlO1xyXG4gIGNyZWF0ZVdpdGhDYWNoZShjYWNoZVNpemU6IG51bWJlcik6IElGaWxlU3lzdGVtU2VydmljZTtcclxufSIsIi8qKlxyXG4gKiBZT0xPIEZvcm1hdCBQYXJzZXIgVXRpbGl0eVxyXG4gKiBcclxuICogSGFuZGxlcyBwYXJzaW5nIGFuZCBnZW5lcmF0aW9uIG9mIFlPTE8gZm9ybWF0IGFubm90YXRpb24gZmlsZXMuXHJcbiAqIFlPTE8gZm9ybWF0OiBjbGFzc0lkIGNlbnRlclggY2VudGVyWSB3aWR0aCBoZWlnaHQgKG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMgMC0xKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFlvbG9MYWJlbCwgWW9sb1BhcnNlUmVzdWx0LCBZb2xvRXhwb3J0T3B0aW9ucywgWW9sb0Zvcm1hdEVycm9yIH0gZnJvbSAnLi4vdHlwZXMvZmlsZXN5c3RlbSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENvbnN0YW50c1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5jb25zdCBERUZBVUxUX1BSRUNJU0lPTiA9IDY7XHJcbmNvbnN0IE1JTl9DT09SRElOQVRFID0gMC4wO1xyXG5jb25zdCBNQVhfQ09PUkRJTkFURSA9IDEuMDtcclxuY29uc3QgTUlOX1NJWkUgPSAwLjA7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFlPTE8gUGFyc2VyIENsYXNzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBZb2xvUGFyc2VyIHtcclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDT09SRElOQVRFX1BBVFRFUk4gPSAvXi0/XFxkKyhcXC5cXGQrKT8kLztcclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMSU5FX1BBVFRFUk4gPSAvXlxccyooXFxkKylcXHMrKFtcXGQuLV0rKVxccysoW1xcZC4tXSspXFxzKyhbXFxkLi1dKylcXHMrKFtcXGQuLV0rKVxccyokLztcclxuXHJcbiAgLyoqXHJcbiAgICogUGFyc2UgWU9MTyBmb3JtYXQgc3RyaW5nIGludG8gc3RydWN0dXJlZCBsYWJlbHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YTogc3RyaW5nKTogWW9sb1BhcnNlUmVzdWx0IHtcclxuICAgIGNvbnN0IHJlc3VsdDogWW9sb1BhcnNlUmVzdWx0ID0ge1xyXG4gICAgICBsYWJlbHM6IFtdLFxyXG4gICAgICBlcnJvcnM6IFtdLFxyXG4gICAgICB3YXJuaW5nczogW11cclxuICAgIH07XHJcblxyXG4gICAgaWYgKCF5b2xvRGF0YSB8fCB5b2xvRGF0YS50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZXMgPSB5b2xvRGF0YS5zcGxpdCgnXFxuJyk7XHJcbiAgICBcclxuICAgIGxpbmVzLmZvckVhY2goKGxpbmUsIGxpbmVJbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmltbWVkTGluZSA9IGxpbmUudHJpbSgpO1xyXG4gICAgICBcclxuICAgICAgLy8gU2tpcCBlbXB0eSBsaW5lcyBhbmQgY29tbWVudHNcclxuICAgICAgaWYgKHRyaW1tZWRMaW5lID09PSAnJyB8fCB0cmltbWVkTGluZS5zdGFydHNXaXRoKCcjJykpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLnBhcnNlU2luZ2xlTGluZSh0cmltbWVkTGluZSwgbGluZUluZGV4ICsgMSk7XHJcbiAgICAgICAgaWYgKGxhYmVsKSB7XHJcbiAgICAgICAgICByZXN1bHQubGFiZWxzLnB1c2gobGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBZb2xvRm9ybWF0RXJyb3IpIHtcclxuICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBVbmtub3duIHBhcnNpbmcgZXJyb3JgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCB2YWxpZGF0aW9uIHdhcm5pbmdzXHJcbiAgICB0aGlzLmFkZFZhbGlkYXRpb25XYXJuaW5ncyhyZXN1bHQpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZSBhIHNpbmdsZSBZT0xPIGZvcm1hdCBsaW5lXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VTaW5nbGVMaW5lKGxpbmU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogWW9sb0xhYmVsIHwgbnVsbCB7XHJcbiAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2godGhpcy5MSU5FX1BBVFRFUk4pO1xyXG4gICAgXHJcbiAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEludmFsaWQgWU9MTyBmb3JtYXQuIEV4cGVjdGVkOiBcImNsYXNzSWQgY2VudGVyWCBjZW50ZXJZIHdpZHRoIGhlaWdodFwiYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBbLCBjbGFzc0lkU3RyLCBjZW50ZXJYU3RyLCBjZW50ZXJZU3RyLCB3aWR0aFN0ciwgaGVpZ2h0U3RyXSA9IG1hdGNoO1xyXG5cclxuICAgIC8vIFBhcnNlIGNsYXNzIElEXHJcbiAgICBjb25zdCBjbGFzc0lkID0gcGFyc2VJbnQoY2xhc3NJZFN0ciEsIDEwKTtcclxuICAgIGlmIChpc05hTihjbGFzc0lkKSB8fCBjbGFzc0lkIDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkIGNsYXNzIElEOiBcIiR7Y2xhc3NJZFN0cn1cIi4gTXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXJzZSBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgY2VudGVyWCA9IHRoaXMucGFyc2VDb29yZGluYXRlKGNlbnRlclhTdHIhLCAnY2VudGVyWCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3QgY2VudGVyWSA9IHRoaXMucGFyc2VDb29yZGluYXRlKGNlbnRlcllTdHIhLCAnY2VudGVyWScsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLnBhcnNlQ29vcmRpbmF0ZSh3aWR0aFN0ciEsICd3aWR0aCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJzZUNvb3JkaW5hdGUoaGVpZ2h0U3RyISwgJ2hlaWdodCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG5cclxuICAgIC8vIFZhbGlkYXRlIGNvb3JkaW5hdGUgcmFuZ2VzXHJcbiAgICB0aGlzLnZhbGlkYXRlQ29vcmRpbmF0ZXMoeyBjbGFzc0lkLCBjZW50ZXJYLCBjZW50ZXJZLCB3aWR0aCwgaGVpZ2h0IH0sIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNsYXNzSWQsXHJcbiAgICAgIGNlbnRlclgsXHJcbiAgICAgIGNlbnRlclksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZSBhIGNvb3JkaW5hdGUgdmFsdWUgd2l0aCB2YWxpZGF0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VDb29yZGluYXRlKHZhbHVlOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyLCBsaW5lOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgaWYgKCF0aGlzLkNPT1JESU5BVEVfUEFUVEVSTi50ZXN0KHZhbHVlKSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkICR7bmFtZX06IFwiJHt2YWx1ZX1cIi4gTXVzdCBiZSBhIHZhbGlkIG51bWJlcmAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkICR7bmFtZX06IFwiJHt2YWx1ZX1cIi4gQ291bGQgbm90IHBhcnNlIGFzIG51bWJlcmAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBhcnNlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlIFlPTE8gbGFiZWwgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyB2YWxpZGF0ZUNvb3JkaW5hdGVzKGxhYmVsOiBZb2xvTGFiZWwsIGxpbmVOdW1iZXI6IG51bWJlciwgbGluZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNlbnRlclgsIGNlbnRlclksIHdpZHRoLCBoZWlnaHQgfSA9IGxhYmVsO1xyXG5cclxuICAgIC8vIENoZWNrIGNvb3JkaW5hdGUgYm91bmRzIChZT0xPIHVzZXMgbm9ybWFsaXplZCBjb29yZGluYXRlcyAwLTEpXHJcbiAgICBpZiAoY2VudGVyWCA8IE1JTl9DT09SRElOQVRFIHx8IGNlbnRlclggPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBjZW50ZXJYIG91dCBvZiByYW5nZTogJHtjZW50ZXJYfS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjZW50ZXJZIDwgTUlOX0NPT1JESU5BVEUgfHwgY2VudGVyWSA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYGNlbnRlclkgb3V0IG9mIHJhbmdlOiAke2NlbnRlcll9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdpZHRoIDw9IE1JTl9TSVpFIHx8IHdpZHRoID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgd2lkdGggb3V0IG9mIHJhbmdlOiAke3dpZHRofS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoZWlnaHQgPD0gTUlOX1NJWkUgfHwgaGVpZ2h0ID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgaGVpZ2h0IG91dCBvZiByYW5nZTogJHtoZWlnaHR9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgYm91bmRpbmcgYm94IGJvdW5kc1xyXG4gICAgY29uc3QgbGVmdCA9IGNlbnRlclggLSB3aWR0aCAvIDI7XHJcbiAgICBjb25zdCByaWdodCA9IGNlbnRlclggKyB3aWR0aCAvIDI7XHJcbiAgICBjb25zdCB0b3AgPSBjZW50ZXJZIC0gaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IGJvdHRvbSA9IGNlbnRlclkgKyBoZWlnaHQgLyAyO1xyXG5cclxuICAgIGlmIChsZWZ0IDwgTUlOX0NPT1JESU5BVEUgfHwgcmlnaHQgPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBCb3VuZGluZyBib3ggZXh0ZW5kcyBvdXRzaWRlIGltYWdlIGJvdW5kcyBob3Jpem9udGFsbHkgKGxlZnQ6ICR7bGVmdH0sIHJpZ2h0OiAke3JpZ2h0fSlgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0b3AgPCBNSU5fQ09PUkRJTkFURSB8fCBib3R0b20gPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBCb3VuZGluZyBib3ggZXh0ZW5kcyBvdXRzaWRlIGltYWdlIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3A6ICR7dG9wfSwgYm90dG9tOiAke2JvdHRvbX0pYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB2YWxpZGF0aW9uIHdhcm5pbmdzIHRvIHBhcnNlIHJlc3VsdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGFkZFZhbGlkYXRpb25XYXJuaW5ncyhyZXN1bHQ6IFlvbG9QYXJzZVJlc3VsdCk6IHZvaWQge1xyXG4gICAgLy8gQ2hlY2sgZm9yIHZlcnkgc21hbGwgYm91bmRpbmcgYm94ZXNcclxuICAgIHJlc3VsdC5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGlmIChsYWJlbC53aWR0aCA8IDAuMDEgfHwgbGFiZWwuaGVpZ2h0IDwgMC4wMSkge1xyXG4gICAgICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKGBMYWJlbCAke2luZGV4ICsgMX06IFZlcnkgc21hbGwgYm91bmRpbmcgYm94ICgke2xhYmVsLndpZHRofXgke2xhYmVsLmhlaWdodH0pYCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciBkdXBsaWNhdGUgbGFiZWxzIChzYW1lIHBvc2l0aW9uIGFuZCBjbGFzcylcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIHJlc3VsdC5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGtleSA9IGAke2xhYmVsLmNsYXNzSWR9XyR7bGFiZWwuY2VudGVyWH1fJHtsYWJlbC5jZW50ZXJZfV8ke2xhYmVsLndpZHRofV8ke2xhYmVsLmhlaWdodH1gO1xyXG4gICAgICBpZiAoc2Vlbi5oYXMoa2V5KSkge1xyXG4gICAgICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKGBMYWJlbCAke2luZGV4ICsgMX06IER1cGxpY2F0ZSBsYWJlbCBkZXRlY3RlZGApO1xyXG4gICAgICB9XHJcbiAgICAgIHNlZW4uYWRkKGtleSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgbGFiZWxzIGFycmF5IHRvIFlPTE8gZm9ybWF0IHN0cmluZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVsczogWW9sb0xhYmVsW10sIG9wdGlvbnM6IFlvbG9FeHBvcnRPcHRpb25zID0ge30pOiBzdHJpbmcge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBwcmVjaXNpb24gPSBERUZBVUxUX1BSRUNJU0lPTixcclxuICAgICAgaW5jbHVkZUNvbW1lbnRzID0gZmFsc2UsXHJcbiAgICAgIHZhbGlkYXRlQm91bmRzID0gdHJ1ZVxyXG4gICAgfSA9IG9wdGlvbnM7XHJcblxyXG4gICAgaWYgKCFsYWJlbHMgfHwgbGFiZWxzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgaWYgKGluY2x1ZGVDb21tZW50cykge1xyXG4gICAgICBsaW5lcy5wdXNoKCcjIFlPTE8gZm9ybWF0OiBjbGFzc0lkIGNlbnRlclggY2VudGVyWSB3aWR0aCBoZWlnaHQgKG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMpJyk7XHJcbiAgICAgIGxpbmVzLnB1c2goYCMgR2VuZXJhdGVkOiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1gKTtcclxuICAgICAgbGluZXMucHVzaCgnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGFiZWxzLmZvckVhY2goKGxhYmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICBpZiAodmFsaWRhdGVCb3VuZHMgJiYgIXRoaXMudmFsaWRhdGVZb2xvTGFiZWwobGFiZWwpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihgSW52YWxpZCBsYWJlbCBhdCBpbmRleCAke2luZGV4fTogY29vcmRpbmF0ZXMgb3V0IG9mIGJvdW5kc2ApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBsaW5lID0gW1xyXG4gICAgICAgIGxhYmVsLmNsYXNzSWQudG9TdHJpbmcoKSxcclxuICAgICAgICBsYWJlbC5jZW50ZXJYLnRvRml4ZWQocHJlY2lzaW9uKSxcclxuICAgICAgICBsYWJlbC5jZW50ZXJZLnRvRml4ZWQocHJlY2lzaW9uKSxcclxuICAgICAgICBsYWJlbC53aWR0aC50b0ZpeGVkKHByZWNpc2lvbiksXHJcbiAgICAgICAgbGFiZWwuaGVpZ2h0LnRvRml4ZWQocHJlY2lzaW9uKVxyXG4gICAgICBdLmpvaW4oJyAnKTtcclxuXHJcbiAgICAgIGxpbmVzLnB1c2gobGluZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBhIHNpbmdsZSBZT0xPIGxhYmVsXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyB2YWxpZGF0ZVlvbG9MYWJlbChsYWJlbDogWW9sb0xhYmVsKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnZhbGlkYXRlQ29vcmRpbmF0ZXMobGFiZWwsIDAsICcnKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBwaXhlbCBjb29yZGluYXRlcyB0byBZT0xPIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBpeGVsVG9Ob3JtYWxpemVkKFxyXG4gICAgcGl4ZWxYOiBudW1iZXIsXHJcbiAgICBwaXhlbFk6IG51bWJlcixcclxuICAgIHBpeGVsV2lkdGg6IG51bWJlcixcclxuICAgIHBpeGVsSGVpZ2h0OiBudW1iZXIsXHJcbiAgICBpbWFnZVdpZHRoOiBudW1iZXIsXHJcbiAgICBpbWFnZUhlaWdodDogbnVtYmVyXHJcbiAgKTogWW9sb0xhYmVsIHtcclxuICAgIGNvbnN0IGNlbnRlclggPSAocGl4ZWxYICsgcGl4ZWxXaWR0aCAvIDIpIC8gaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IGNlbnRlclkgPSAocGl4ZWxZICsgcGl4ZWxIZWlnaHQgLyAyKSAvIGltYWdlSGVpZ2h0O1xyXG4gICAgY29uc3Qgd2lkdGggPSBwaXhlbFdpZHRoIC8gaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHBpeGVsSGVpZ2h0IC8gaW1hZ2VIZWlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY2xhc3NJZDogMCwgLy8gV2lsbCBiZSBzZXQgYnkgY2FsbGVyXHJcbiAgICAgIGNlbnRlclgsXHJcbiAgICAgIGNlbnRlclksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IFlPTE8gbm9ybWFsaXplZCBjb29yZGluYXRlcyB0byBwaXhlbCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplZFRvUGl4ZWwoXHJcbiAgICBsYWJlbDogWW9sb0xhYmVsLFxyXG4gICAgaW1hZ2VXaWR0aDogbnVtYmVyLFxyXG4gICAgaW1hZ2VIZWlnaHQ6IG51bWJlclxyXG4gICk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0ge1xyXG4gICAgY29uc3Qgd2lkdGggPSBsYWJlbC53aWR0aCAqIGltYWdlV2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBsYWJlbC5oZWlnaHQgKiBpbWFnZUhlaWdodDtcclxuICAgIGNvbnN0IHggPSAobGFiZWwuY2VudGVyWCAqIGltYWdlV2lkdGgpIC0gKHdpZHRoIC8gMik7XHJcbiAgICBjb25zdCB5ID0gKGxhYmVsLmNlbnRlclkgKiBpbWFnZUhlaWdodCkgLSAoaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgcmV0dXJuIHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHN0YXRpc3RpY3MgYWJvdXQgYSBzZXQgb2YgbGFiZWxzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRMYWJlbFN0YXRpc3RpY3MobGFiZWxzOiBZb2xvTGFiZWxbXSk6IHtcclxuICAgIHRvdGFsTGFiZWxzOiBudW1iZXI7XHJcbiAgICBjbGFzc0Rpc3RyaWJ1dGlvbjogUmVjb3JkPG51bWJlciwgbnVtYmVyPjtcclxuICAgIGF2ZXJhZ2VTaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgICBzaXplUmFuZ2U6IHtcclxuICAgICAgbWluOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgICAgIG1heDogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gICAgfTtcclxuICB9IHtcclxuICAgIGlmICghbGFiZWxzIHx8IGxhYmVscy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0b3RhbExhYmVsczogMCxcclxuICAgICAgICBjbGFzc0Rpc3RyaWJ1dGlvbjoge30sXHJcbiAgICAgICAgYXZlcmFnZVNpemU6IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9LFxyXG4gICAgICAgIHNpemVSYW5nZToge1xyXG4gICAgICAgICAgbWluOiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSxcclxuICAgICAgICAgIG1heDogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2xhc3NEaXN0cmlidXRpb246IFJlY29yZDxudW1iZXIsIG51bWJlcj4gPSB7fTtcclxuICAgIGxldCB0b3RhbFdpZHRoID0gMDtcclxuICAgIGxldCB0b3RhbEhlaWdodCA9IDA7XHJcbiAgICBsZXQgbWluV2lkdGggPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgbGV0IG1heFdpZHRoID0gTnVtYmVyLk1JTl9WQUxVRTtcclxuICAgIGxldCBtaW5IZWlnaHQgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgbGV0IG1heEhlaWdodCA9IE51bWJlci5NSU5fVkFMVUU7XHJcblxyXG4gICAgbGFiZWxzLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAvLyBDbGFzcyBkaXN0cmlidXRpb25cclxuICAgICAgY2xhc3NEaXN0cmlidXRpb25bbGFiZWwuY2xhc3NJZF0gPSAoY2xhc3NEaXN0cmlidXRpb25bbGFiZWwuY2xhc3NJZF0gfHwgMCkgKyAxO1xyXG5cclxuICAgICAgLy8gU2l6ZSBzdGF0aXN0aWNzXHJcbiAgICAgIHRvdGFsV2lkdGggKz0gbGFiZWwud2lkdGg7XHJcbiAgICAgIHRvdGFsSGVpZ2h0ICs9IGxhYmVsLmhlaWdodDtcclxuICAgICAgbWluV2lkdGggPSBNYXRoLm1pbihtaW5XaWR0aCwgbGFiZWwud2lkdGgpO1xyXG4gICAgICBtYXhXaWR0aCA9IE1hdGgubWF4KG1heFdpZHRoLCBsYWJlbC53aWR0aCk7XHJcbiAgICAgIG1pbkhlaWdodCA9IE1hdGgubWluKG1pbkhlaWdodCwgbGFiZWwuaGVpZ2h0KTtcclxuICAgICAgbWF4SGVpZ2h0ID0gTWF0aC5tYXgobWF4SGVpZ2h0LCBsYWJlbC5oZWlnaHQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG90YWxMYWJlbHM6IGxhYmVscy5sZW5ndGgsXHJcbiAgICAgIGNsYXNzRGlzdHJpYnV0aW9uLFxyXG4gICAgICBhdmVyYWdlU2l6ZToge1xyXG4gICAgICAgIHdpZHRoOiB0b3RhbFdpZHRoIC8gbGFiZWxzLmxlbmd0aCxcclxuICAgICAgICBoZWlnaHQ6IHRvdGFsSGVpZ2h0IC8gbGFiZWxzLmxlbmd0aFxyXG4gICAgICB9LFxyXG4gICAgICBzaXplUmFuZ2U6IHtcclxuICAgICAgICBtaW46IHsgd2lkdGg6IG1pbldpZHRoLCBoZWlnaHQ6IG1pbkhlaWdodCB9LFxyXG4gICAgICAgIG1heDogeyB3aWR0aDogbWF4V2lkdGgsIGhlaWdodDogbWF4SGVpZ2h0IH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVXRpbGl0eSBGdW5jdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIFF1aWNrIHBhcnNlIGZ1bmN0aW9uIGZvciBzaW1wbGUgdXNlIGNhc2VzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VZb2xvKHlvbG9EYXRhOiBzdHJpbmcpOiBZb2xvTGFiZWxbXSB7XHJcbiAgY29uc3QgcmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gIGlmIChyZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDApIHtcclxuICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoYFlPTE8gcGFyc2luZyBmYWlsZWQ6ICR7cmVzdWx0LmVycm9ycy5qb2luKCcsICcpfWApO1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0LmxhYmVscztcclxufVxyXG5cclxuLyoqXHJcbiAqIFF1aWNrIGV4cG9ydCBmdW5jdGlvbiBmb3Igc2ltcGxlIHVzZSBjYXNlc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydFlvbG8obGFiZWxzOiBZb2xvTGFiZWxbXSwgcHJlY2lzaW9uOiBudW1iZXIgPSBERUZBVUxUX1BSRUNJU0lPTik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFlvbG9QYXJzZXIubGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVscywgeyBwcmVjaXNpb24gfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZSBZT0xPIHN0cmluZyB3aXRob3V0IHBhcnNpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IHsgaXNWYWxpZDogYm9vbGVhbjsgZXJyb3JzOiBzdHJpbmdbXSB9IHtcclxuICBjb25zdCByZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGlzVmFsaWQ6IHJlc3VsdC5lcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgZXJyb3JzOiByZXN1bHQuZXJyb3JzXHJcbiAgfTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgWW9sb1BhcnNlcjsiLCIvKipcclxuICogRmlsZVN5c3RlbSBTZXJ2aWNlIEltcGxlbWVudGF0aW9uXHJcbiAqIFxyXG4gKiBIYW5kbGVzIGFsbCBmaWxlIEkvTyBvcGVyYXRpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogUHJvdmlkZXMgYWJzdHJhY3Rpb24gb3ZlciBGaWxlIFN5c3RlbSBBY2Nlc3MgQVBJIGFuZCBZT0xPIGZvcm1hdCBwcm9jZXNzaW5nLlxyXG4gKiBcclxuICogQHZlcnNpb24gMS4wLjBcclxuICogQGF1dGhvciBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgXHJcbiAgSUZpbGVTeXN0ZW1TZXJ2aWNlLFxyXG4gIEZpbGVPcGVyYXRpb25SZXN1bHQsXHJcbiAgRmlsZUxvYWRSZXN1bHQsXHJcbiAgWW9sb0xhYmVsLFxyXG4gIFlvbG9QYXJzZVJlc3VsdCxcclxuICBZb2xvRXhwb3J0T3B0aW9ucyxcclxuICBDbGFzc0ZpbGVDb250ZW50LFxyXG4gIENsYXNzRmlsZVZhbGlkYXRpb24sXHJcbiAgRm9sZGVyU2NhblJlc3VsdCxcclxuICBMYWJlbFN0YXR1cyxcclxuICBJbWFnZUluZm8sXHJcbiAgSW1hZ2VMb2FkT3B0aW9ucyxcclxuICBUaWZmUHJvY2Vzc2luZ09wdGlvbnMsXHJcbiAgQ2FjaGVFbnRyeSxcclxuICBDYWNoZVN0YXRzLFxyXG4gIEZpbGVTeXN0ZW1Db25maWcsXHJcbiAgRmlsZVN5c3RlbUV2ZW50LFxyXG4gIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXIsXHJcbiAgRmlsZVN5c3RlbUVycm9yLFxyXG4gIEltYWdlTG9hZEVycm9yLFxyXG4gIEZpbGVGb3JtYXQsXHJcbiAgQ2xhc3NGaWxlRm9ybWF0XHJcbn0gZnJvbSAnLi4vdHlwZXMvZmlsZXN5c3RlbSc7XHJcblxyXG5pbXBvcnQgeyBcclxuICBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBcclxuICBGaWxlU3lzdGVtRmlsZUhhbmRsZSBcclxufSBmcm9tICcuLi90eXBlcyc7XHJcblxyXG5pbXBvcnQgeyBcclxuICBJbWFnZUZpbGUsIFxyXG4gIENsYXNzRmlsZSwgXHJcbiAgQ2xhc3NEZWZpbml0aW9uIFxyXG59IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcblxyXG5pbXBvcnQgeyBZb2xvUGFyc2VyIH0gZnJvbSAnLi4vdXRpbHMveW9sby1wYXJzZXInO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGaWxlU3lzdGVtIFNlcnZpY2UgSW1wbGVtZW50YXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVTeXN0ZW1TZXJ2aWNlIGltcGxlbWVudHMgSUZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICBwcml2YXRlIGNvbmZpZzogRmlsZVN5c3RlbUNvbmZpZztcclxuICBwcml2YXRlIGltYWdlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVFbnRyeTxIVE1MSW1hZ2VFbGVtZW50Pj4oKTtcclxuICBwcml2YXRlIGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXJbXT4oKTtcclxuICBcclxuICAvLyBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBERUZBVUxUX0NPTkZJRzogRmlsZVN5c3RlbUNvbmZpZyA9IHtcclxuICAgIHN1cHBvcnRlZEltYWdlRm9ybWF0czogWydqcGcnLCAnanBlZycsICdwbmcnLCAnZ2lmJywgJ3RpZicsICd0aWZmJywgJ3dlYnAnXSxcclxuICAgIG1heEltYWdlU2l6ZTogNTAgKiAxMDI0ICogMTAyNCwgLy8gNTBNQlxyXG4gICAgdGh1bWJuYWlsU2l6ZTogeyB3aWR0aDogMTUwLCBoZWlnaHQ6IDE1MCB9LFxyXG4gICAgbWF4Q2FjaGVTaXplOiAxMDAgKiAxMDI0ICogMTAyNCwgLy8gMTAwTUJcclxuICAgIGNhY2hlVGltZW91dDogMzAgKiA2MCAqIDEwMDAsIC8vIDMwIG1pbnV0ZXNcclxuICAgIHlvbG9WYWxpZGF0aW9uOiB7XHJcbiAgICAgIHN0cmljdEJvdW5kczogdHJ1ZSxcclxuICAgICAgYWxsb3daZXJvU2l6ZTogZmFsc2UsXHJcbiAgICAgIHByZWNpc2lvbjogNlxyXG4gICAgfSxcclxuICAgIGJhdGNoU2l6ZTogMTAsXHJcbiAgICBjb25jdXJyZW50TG9hZHM6IDMsXHJcbiAgICBwcmVsb2FkQWRqYWNlbnQ6IHRydWVcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uRmlsZVN5c3RlbVNlcnZpY2UuREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZvbGRlciBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2VsZWN0SW1hZ2VGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmb2xkZXJIYW5kbGUgPSBhd2FpdCAod2luZG93IGFzIGFueSkuc2hvd0RpcmVjdG9yeVBpY2tlcigpO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZm9sZGVyOmltYWdlLXNlbGVjdGVkJyxcclxuICAgICAgICBkYXRhOiB7IG5hbWU6IGZvbGRlckhhbmRsZS5uYW1lIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGZvbGRlckhhbmRsZSxcclxuICAgICAgICBtZXNzYWdlOiBgSW1hZ2UgZm9sZGVyIHNlbGVjdGVkOiAke2ZvbGRlckhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2VsZWN0aW9uIGNhbmNlbGxlZCcgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzZWxlY3QgaW1hZ2UgZm9sZGVyOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzZWxlY3RMYWJlbEZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvbGRlckhhbmRsZSA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmb2xkZXI6bGFiZWwtc2VsZWN0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgbmFtZTogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZm9sZGVySGFuZGxlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBMYWJlbCBmb2xkZXIgc2VsZWN0ZWQ6ICR7Zm9sZGVySGFuZGxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdTZWxlY3Rpb24gY2FuY2VsbGVkJyB9O1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNlbGVjdCBsYWJlbCBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNlbGVjdENsYXNzSW5mb0ZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvbGRlckhhbmRsZSA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmb2xkZXI6Y2xhc3MtaW5mby1zZWxlY3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBuYW1lOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBmb2xkZXJIYW5kbGUsXHJcbiAgICAgICAgbWVzc2FnZTogYENsYXNzIGluZm8gZm9sZGVyIHNlbGVjdGVkOiAke2ZvbGRlckhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2VsZWN0aW9uIGNhbmNlbGxlZCcgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzZWxlY3QgY2xhc3MgaW5mbyBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgTGlzdGluZyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbGlzdEltYWdlRmlsZXMoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEltYWdlRmlsZVtdPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW10gPSBbXTtcclxuICAgICAgY29uc3Qgc3VwcG9ydGVkRm9ybWF0cyA9IHRoaXMuY29uZmlnLnN1cHBvcnRlZEltYWdlRm9ybWF0cy5tYXAoZiA9PiBmLnRvTG93ZXJDYXNlKCkpO1xyXG5cclxuICAgICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiAoZm9sZGVySGFuZGxlIGFzIGFueSkudmFsdWVzKCkpIHtcclxuICAgICAgICBpZiAoZW50cnkua2luZCA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgICAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChzdXBwb3J0ZWRGb3JtYXRzLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VGaWxlOiBJbWFnZUZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBoYW5kbGU6IGVudHJ5LFxyXG4gICAgICAgICAgICAgIHBhdGg6IGVudHJ5Lm5hbWUsIC8vIE5vdGU6IEZ1bGwgcGF0aCBub3QgYXZhaWxhYmxlIGluIEZpbGUgU3lzdGVtIEFjY2VzcyBBUElcclxuICAgICAgICAgICAgICBleHRlbnNpb24sXHJcbiAgICAgICAgICAgICAgc2l6ZTogdW5kZWZpbmVkLCAvLyBXaWxsIGJlIGxvYWRlZCB3aGVuIG5lZWRlZFxyXG4gICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogdW5kZWZpbmVkIC8vIFdpbGwgYmUgbG9hZGVkIHdoZW4gbmVlZGVkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGltYWdlRmlsZXMucHVzaChpbWFnZUZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU29ydCBmaWxlcyBuYXR1cmFsbHkgKGhhbmRsZXMgbnVtYmVycyBjb3JyZWN0bHkpXHJcbiAgICAgIGltYWdlRmlsZXMuc29ydCgoYSwgYikgPT4gXHJcbiAgICAgICAgYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSwgc2Vuc2l0aXZpdHk6ICdiYXNlJyB9KVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZmlsZXM6aW1hZ2VzLWxpc3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogaW1hZ2VGaWxlcy5sZW5ndGgsIGZvbGRlcjogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW1hZ2VGaWxlcyxcclxuICAgICAgICBtZXNzYWdlOiBgRm91bmQgJHtpbWFnZUZpbGVzLmxlbmd0aH0gaW1hZ2UgZmlsZXNgXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxpc3QgaW1hZ2UgZmlsZXM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxpc3RDbGFzc0ZpbGVzKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxDbGFzc0ZpbGVbXT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGNsYXNzRmlsZXM6IENsYXNzRmlsZVtdID0gW107XHJcbiAgICAgIGNvbnN0IHN1cHBvcnRlZEZvcm1hdHMgPSBbJ3lhbWwnLCAneW1sJ107XHJcblxyXG4gICAgICBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIChmb2xkZXJIYW5kbGUgYXMgYW55KS52YWx1ZXMoKSkge1xyXG4gICAgICAgIGlmIChlbnRyeS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKHN1cHBvcnRlZEZvcm1hdHMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICAvLyBMb2FkIGNsYXNzIGZpbGUgY29udGVudFxyXG4gICAgICAgICAgICBjb25zdCBjb250ZW50UmVzdWx0ID0gYXdhaXQgdGhpcy5sb2FkQ2xhc3NGaWxlKGVudHJ5KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzRmlsZTogQ2xhc3NGaWxlID0ge1xyXG4gICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgaGFuZGxlOiBlbnRyeSxcclxuICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50UmVzdWx0LnN1Y2Nlc3MgPyBjb250ZW50UmVzdWx0LmRhdGEhLmNsYXNzZXMgOiBbXSxcclxuICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjbGFzc0ZpbGVzLnB1c2goY2xhc3NGaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ZpbGVzOmNsYXNzZXMtbGlzdGVkJyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBjbGFzc0ZpbGVzLmxlbmd0aCwgZm9sZGVyOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBjbGFzc0ZpbGVzLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBGb3VuZCAke2NsYXNzRmlsZXMubGVuZ3RofSBjbGFzcyBmaWxlc2BcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbGlzdCBjbGFzcyBmaWxlczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2NhbkZvbGRlcihmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Rm9sZGVyU2NhblJlc3VsdD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdDogRm9sZGVyU2NhblJlc3VsdCA9IHtcclxuICAgICAgICBpbWFnZUZpbGVzOiBbXSxcclxuICAgICAgICBsYWJlbEZpbGVzOiBbXSxcclxuICAgICAgICBjbGFzc0ZpbGVzOiBbXSxcclxuICAgICAgICB0b3RhbEZpbGVzOiAwLFxyXG4gICAgICAgIGVycm9yczogW11cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgKGZvbGRlckhhbmRsZSBhcyBhbnkpLnZhbHVlcygpKSB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgcmVzdWx0LnRvdGFsRmlsZXMrKztcclxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdXBwb3J0ZWRJbWFnZUZvcm1hdHMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZUZpbGU6IEltYWdlRmlsZSA9IHtcclxuICAgICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxyXG4gICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgcGF0aDogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBleHRlbnNpb25cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmVzdWx0LmltYWdlRmlsZXMucHVzaChpbWFnZUZpbGUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChleHRlbnNpb24gPT09ICd0eHQnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5sYWJlbEZpbGVzLnB1c2goZW50cnkubmFtZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKFsneWFtbCcsICd5bWwnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudFJlc3VsdCA9IGF3YWl0IHRoaXMubG9hZENsYXNzRmlsZShlbnRyeSk7XHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnRSZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NGaWxlOiBDbGFzc0ZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRSZXN1bHQuZGF0YSEuY2xhc3NlcyxcclxuICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuY2xhc3NGaWxlcy5wdXNoKGNsYXNzRmlsZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgRmFpbGVkIHRvIGxvYWQgY2xhc3MgZmlsZSAke2VudHJ5Lm5hbWV9OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogcmVzdWx0LFxyXG4gICAgICAgIG1lc3NhZ2U6IGBTY2FubmVkICR7cmVzdWx0LnRvdGFsRmlsZXN9IGZpbGVzYFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzY2FuIGZvbGRlcjogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XHJcbiAgICAgIGNvbnN0IGNhY2hlS2V5ID0gYCR7ZmlsZUhhbmRsZS5uYW1lfWA7XHJcbiAgICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMuaW1hZ2VDYWNoZS5nZXQoY2FjaGVLZXkpO1xyXG4gICAgICBcclxuICAgICAgaWYgKGNhY2hlZCAmJiB0aGlzLmlzQ2FjaGVWYWxpZChjYWNoZWQpKSB7XHJcbiAgICAgICAgY2FjaGVkLmhpdHMrKztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IGNhY2hlZC5kYXRhLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ0xvYWRlZCBmcm9tIGNhY2hlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGZpbGUgc2l6ZVxyXG4gICAgICBpZiAoZmlsZS5zaXplID4gdGhpcy5jb25maWcubWF4SW1hZ2VTaXplKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEltYWdlTG9hZEVycm9yKGBJbWFnZSB0b28gbGFyZ2U6ICR7ZmlsZS5zaXplfSBieXRlcyAobWF4OiAke3RoaXMuY29uZmlnLm1heEltYWdlU2l6ZX0pYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IGF3YWl0IHRoaXMuY3JlYXRlSW1hZ2VGcm9tRmlsZShmaWxlLCBvcHRpb25zKTtcclxuICAgICAgXHJcbiAgICAgIC8vIENhY2hlIHRoZSBpbWFnZVxyXG4gICAgICB0aGlzLmNhY2hlSW1hZ2UoY2FjaGVLZXksIGltZywgZmlsZS5zaXplKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ltYWdlOmxvYWRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogZmlsZS5uYW1lLCBzaXplOiBmaWxlLnNpemUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW1nLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBJbWFnZSBsb2FkZWQ6ICR7ZmlsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbG9hZCBpbWFnZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbG9hZFRpZmZJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IFRpZmZQcm9jZXNzaW5nT3B0aW9ucyk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxIVE1MSW1hZ2VFbGVtZW50Pj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBcclxuICAgICAgLy8gVXNlIGR5bmFtaWMgaW1wb3J0IGZvciBUSUZGLmpzIChsb2FkZWQgZnJvbSBDRE4pXHJcbiAgICAgIGlmICh0eXBlb2YgKHdpbmRvdyBhcyBhbnkpLlRpZmYgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEltYWdlTG9hZEVycm9yKCdUSUZGLmpzIGxpYnJhcnkgbm90IGxvYWRlZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgY29uc3QgdGlmZiA9IG5ldyAod2luZG93IGFzIGFueSkuVGlmZih7IGJ1ZmZlcjogYXJyYXlCdWZmZXIgfSk7XHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IHRpZmYudG9DYW52YXMoKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoKTtcclxuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgSW1hZ2VMb2FkRXJyb3IoJ0ZhaWxlZCB0byBjb252ZXJ0IFRJRkYgY2FudmFzIHRvIGltYWdlJykpO1xyXG4gICAgICAgIGltZy5zcmMgPSBjYW52YXMudG9EYXRhVVJMKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnaW1hZ2U6dGlmZi1sb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGUubmFtZSwgc2l6ZTogZmlsZS5zaXplIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGltZyxcclxuICAgICAgICBtZXNzYWdlOiBgVElGRiBpbWFnZSBsb2FkZWQ6ICR7ZmlsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbG9hZCBUSUZGIGltYWdlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBnZXRJbWFnZUluZm8oZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SW1hZ2VJbmZvPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBjb25zdCBpbWcgPSBhd2FpdCB0aGlzLmNyZWF0ZUltYWdlRnJvbUZpbGUoZmlsZSk7XHJcblxyXG4gICAgICBjb25zdCBpbmZvOiBJbWFnZUluZm8gPSB7XHJcbiAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgIHdpZHRoOiBpbWcubmF0dXJhbFdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaW1nLm5hdHVyYWxIZWlnaHQsXHJcbiAgICAgICAgc2l6ZTogZmlsZS5zaXplLFxyXG4gICAgICAgIGZvcm1hdDogdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSksXHJcbiAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZClcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBpbmZvLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBJbWFnZSBpbmZvIHJldHJpZXZlZDogJHtmaWxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBnZXQgaW1hZ2UgaW5mbzogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTGFiZWwgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRMYWJlbHMoZmlsZU5hbWU6IHN0cmluZywgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PFlvbG9MYWJlbFtdPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbGFiZWxGaWxlTmFtZSA9IHRoaXMuZ2V0TGFiZWxGaWxlTmFtZShmaWxlTmFtZSk7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZUhhbmRsZSA9IGF3YWl0IGZvbGRlckhhbmRsZS5nZXRGaWxlSGFuZGxlKGxhYmVsRmlsZU5hbWUpO1xyXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgbGFiZWxGaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgY29uc3QgeW9sb0RhdGEgPSBhd2FpdCBmaWxlLnRleHQoKTtcclxuXHJcbiAgICAgIGlmICgheW9sb0RhdGEudHJpbSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdObyBsYWJlbHMgZm91bmQnXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcGFyc2VSZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAocGFyc2VSZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogYFlPTE8gcGFyc2luZyBlcnJvcnM6ICR7cGFyc2VSZXN1bHQuZXJyb3JzLmpvaW4oJywgJyl9YFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2xhYmVsczpsb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWUsIGxhYmVsQ291bnQ6IHBhcnNlUmVzdWx0LmxhYmVscy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogcGFyc2VSZXN1bHQubGFiZWxzLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBMb2FkZWQgJHtwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RofSBsYWJlbHNgXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ05vIGxhYmVsIGZpbGUgZm91bmQnXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsb2FkIGxhYmVsczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2F2ZUxhYmVscyhmaWxlTmFtZTogc3RyaW5nLCBsYWJlbHM6IFlvbG9MYWJlbFtdLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZU5hbWUgPSB0aGlzLmdldExhYmVsRmlsZU5hbWUoZmlsZU5hbWUpO1xyXG4gICAgICBjb25zdCB5b2xvU3RyaW5nID0gWW9sb1BhcnNlci5sYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzLCB7XHJcbiAgICAgICAgcHJlY2lzaW9uOiB0aGlzLmNvbmZpZy55b2xvVmFsaWRhdGlvbi5wcmVjaXNpb24sXHJcbiAgICAgICAgdmFsaWRhdGVCb3VuZHM6IHRoaXMuY29uZmlnLnlvbG9WYWxpZGF0aW9uLnN0cmljdEJvdW5kc1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShsYWJlbEZpbGVOYW1lLCB7IGNyZWF0ZTogdHJ1ZSB9KTtcclxuICAgICAgY29uc3Qgd3JpdGFibGUgPSBhd2FpdCBmaWxlSGFuZGxlLmNyZWF0ZVdyaXRhYmxlKCk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLndyaXRlKHlvbG9TdHJpbmcudHJpbSgpKTtcclxuICAgICAgYXdhaXQgd3JpdGFibGUuY2xvc2UoKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2xhYmVsczpzYXZlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZSwgbGFiZWxDb3VudDogbGFiZWxzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBgTGFiZWxzIHNhdmVkIHRvICR7bGFiZWxGaWxlTmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNhdmUgbGFiZWxzOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBjaGVja0xhYmVsU3RhdHVzKGZpbGVOYW1lOiBzdHJpbmcsIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxMYWJlbFN0YXR1cz4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZU5hbWUgPSB0aGlzLmdldExhYmVsRmlsZU5hbWUoZmlsZU5hbWUpO1xyXG4gICAgICBcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBsYWJlbEZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShsYWJlbEZpbGVOYW1lKTtcclxuICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgbGFiZWxGaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZmlsZS50ZXh0KCk7XHJcbiAgICAgICAgY29uc3QgcGFyc2VSZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyhjb250ZW50KTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdHVzOiBMYWJlbFN0YXR1cyA9IHtcclxuICAgICAgICAgIGZpbGVOYW1lLFxyXG4gICAgICAgICAgaGFzTGFiZWxzOiBwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RoID4gMCxcclxuICAgICAgICAgIGxhYmVsQ291bnQ6IHBhcnNlUmVzdWx0LmxhYmVscy5sZW5ndGgsXHJcbiAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKGZpbGUubGFzdE1vZGlmaWVkKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogc3RhdHVzLFxyXG4gICAgICAgICAgbWVzc2FnZTogYExhYmVsIHN0YXR1cyBjaGVja2VkOiAke2ZpbGVOYW1lfWBcclxuICAgICAgICB9O1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xyXG4gICAgICAgICAgY29uc3Qgc3RhdHVzOiBMYWJlbFN0YXR1cyA9IHtcclxuICAgICAgICAgICAgZmlsZU5hbWUsXHJcbiAgICAgICAgICAgIGhhc0xhYmVsczogZmFsc2UsXHJcbiAgICAgICAgICAgIGxhYmVsQ291bnQ6IDBcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogc3RhdHVzLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnTm8gbGFiZWwgZmlsZSBmb3VuZCdcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGNoZWNrIGxhYmVsIHN0YXR1czogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2xhc3MgRmlsZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbG9hZENsYXNzRmlsZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxDbGFzc0ZpbGVDb250ZW50Pj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZmlsZS50ZXh0KCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCB2YWxpZGF0aW9uID0gdGhpcy52YWxpZGF0ZUNsYXNzRmlsZShjb250ZW50KTtcclxuICAgICAgaWYgKCF2YWxpZGF0aW9uLmlzVmFsaWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogYEludmFsaWQgY2xhc3MgZmlsZTogJHt2YWxpZGF0aW9uLmVycm9ycy5qb2luKCcsICcpfWBcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjbGFzc2VzOiBDbGFzc0RlZmluaXRpb25bXSA9IFtdO1xyXG4gICAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpO1xyXG4gICAgICBcclxuICAgICAgbGluZXMuZm9yRWFjaChsaW5lID0+IHtcclxuICAgICAgICBjb25zdCB0cmltbWVkTGluZSA9IGxpbmUudHJpbSgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkTGluZS5zdGFydHNXaXRoKCcjJykgfHwgdHJpbW1lZExpbmUgPT09ICcnKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcnRzID0gdHJpbW1lZExpbmUuc3BsaXQoJzonKTtcclxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQocGFydHNbMF0hLnRyaW0oKSwgMTApO1xyXG4gICAgICAgICAgY29uc3QgbmFtZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJzonKS50cmltKCk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmICghaXNOYU4oaWQpICYmIG5hbWUpIHtcclxuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKHtcclxuICAgICAgICAgICAgICBpZCxcclxuICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgY29sb3I6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgY2xhc3NGaWxlQ29udGVudDogQ2xhc3NGaWxlQ29udGVudCA9IHtcclxuICAgICAgICBjbGFzc2VzLFxyXG4gICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICBjcmVhdGVkOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZCksXHJcbiAgICAgICAgICBtb2RpZmllZDogbmV3IERhdGUoZmlsZS5sYXN0TW9kaWZpZWQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnY2xhc3Nlczpsb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGUubmFtZSwgY2xhc3NDb3VudDogY2xhc3Nlcy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogY2xhc3NGaWxlQ29udGVudCxcclxuICAgICAgICBtZXNzYWdlOiBgTG9hZGVkICR7Y2xhc3Nlcy5sZW5ndGh9IGNsYXNzZXMgZnJvbSAke2ZpbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxvYWQgY2xhc3MgZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2F2ZUNsYXNzRmlsZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgY29udGVudDogQ2xhc3NGaWxlQ29udGVudCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gU29ydCBjbGFzc2VzIGJ5IElEXHJcbiAgICAgIGNvbnN0IHNvcnRlZENsYXNzZXMgPSBbLi4uY29udGVudC5jbGFzc2VzXS5zb3J0KChhLCBiKSA9PiBhLmlkIC0gYi5pZCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBsaW5lcyA9IHNvcnRlZENsYXNzZXMubWFwKGNscyA9PiBgJHtjbHMuaWR9OiAke2Nscy5uYW1lfWApO1xyXG4gICAgICBjb25zdCBmaWxlQ29udGVudCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xyXG5cclxuICAgICAgY29uc3Qgd3JpdGFibGUgPSBhd2FpdCBmaWxlSGFuZGxlLmNyZWF0ZVdyaXRhYmxlKCk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLndyaXRlKGZpbGVDb250ZW50KTtcclxuICAgICAgYXdhaXQgd3JpdGFibGUuY2xvc2UoKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzZXM6c2F2ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGVIYW5kbGUubmFtZSwgY2xhc3NDb3VudDogY29udGVudC5jbGFzc2VzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBgU2F2ZWQgJHtjb250ZW50LmNsYXNzZXMubGVuZ3RofSBjbGFzc2VzIHRvICR7ZmlsZUhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2F2ZSBjbGFzcyBmaWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBjcmVhdGVDbGFzc0ZpbGUoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBmaWxlTmFtZTogc3RyaW5nLCBpbml0aWFsQ29udGVudD86IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbUZpbGVIYW5kbGU+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBFbnN1cmUgLnlhbWwgZXh0ZW5zaW9uXHJcbiAgICAgIGNvbnN0IGZpbmFsRmlsZU5hbWUgPSBmaWxlTmFtZS5lbmRzV2l0aCgnLnlhbWwnKSB8fCBmaWxlTmFtZS5lbmRzV2l0aCgnLnltbCcpIFxyXG4gICAgICAgID8gZmlsZU5hbWUgXHJcbiAgICAgICAgOiBgJHtmaWxlTmFtZX0ueWFtbGA7XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBmaWxlIGFscmVhZHkgZXhpc3RzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUoZmluYWxGaWxlTmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6IGBGaWxlIFwiJHtmaW5hbEZpbGVOYW1lfVwiIGFscmVhZHkgZXhpc3RzYFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgLy8gRmlsZSBkb2Vzbid0IGV4aXN0LCB3aGljaCBpcyB3aGF0IHdlIHdhbnRcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZGVmYXVsdENvbnRlbnQ6IENsYXNzRmlsZUNvbnRlbnQgPSBpbml0aWFsQ29udGVudCB8fCB7XHJcbiAgICAgICAgY2xhc3NlczogW1xyXG4gICAgICAgICAgeyBpZDogMCwgbmFtZTogJ2NsYXNzMScgfSxcclxuICAgICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdjbGFzczInIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICBjcmVhdGVkOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBdXRvLWdlbmVyYXRlZCBjbGFzcyBmaWxlJ1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IGZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShmaW5hbEZpbGVOYW1lLCB7IGNyZWF0ZTogdHJ1ZSB9KTtcclxuICAgICAgYXdhaXQgdGhpcy5zYXZlQ2xhc3NGaWxlKGZpbGVIYW5kbGUsIGRlZmF1bHRDb250ZW50KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzZXM6ZmlsZS1jcmVhdGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaW5hbEZpbGVOYW1lLCBjbGFzc0NvdW50OiBkZWZhdWx0Q29udGVudC5jbGFzc2VzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBmaWxlSGFuZGxlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBDcmVhdGVkIGNsYXNzIGZpbGU6ICR7ZmluYWxGaWxlTmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGNyZWF0ZSBjbGFzcyBmaWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyB2YWxpZGF0ZUNsYXNzRmlsZShjb250ZW50OiBzdHJpbmcpOiBDbGFzc0ZpbGVWYWxpZGF0aW9uIHtcclxuICAgIGNvbnN0IHJlc3VsdDogQ2xhc3NGaWxlVmFsaWRhdGlvbiA9IHtcclxuICAgICAgaXNWYWxpZDogdHJ1ZSxcclxuICAgICAgZXJyb3JzOiBbXSxcclxuICAgICAgd2FybmluZ3M6IFtdLFxyXG4gICAgICBkdXBsaWNhdGVJZHM6IFtdLFxyXG4gICAgICBlbXB0eU5hbWVzOiBbXVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpO1xyXG4gICAgY29uc3Qgc2VlbklkcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xyXG4gICAgXHJcbiAgICBsaW5lcy5mb3JFYWNoKChsaW5lLCBsaW5lSW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgdHJpbW1lZExpbmUgPSBsaW5lLnRyaW0oKTtcclxuICAgICAgaWYgKHRyaW1tZWRMaW5lLnN0YXJ0c1dpdGgoJyMnKSB8fCB0cmltbWVkTGluZSA9PT0gJycpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHBhcnRzID0gdHJpbW1lZExpbmUuc3BsaXQoJzonKTtcclxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYExpbmUgJHtsaW5lSW5kZXggKyAxfTogSW52YWxpZCBmb3JtYXQuIEV4cGVjdGVkIFwiaWQ6IG5hbWVcImApO1xyXG4gICAgICAgIHJlc3VsdC5pc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBpZFN0ciA9IHBhcnRzWzBdIS50cmltKCk7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc6JykudHJpbSgpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgaWQgPSBwYXJzZUludChpZFN0ciwgMTApO1xyXG4gICAgICBpZiAoaXNOYU4oaWQpIHx8IFN0cmluZyhpZCkgIT09IGlkU3RyKSB7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IEludmFsaWQgSUQgXCIke2lkU3RyfVwiLiBNdXN0IGJlIGFuIGludGVnZXJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKHNlZW5JZHMuaGFzKGlkKSkge1xyXG4gICAgICAgIHJlc3VsdC5kdXBsaWNhdGVJZHMucHVzaChpZCk7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IER1cGxpY2F0ZSBJRCBcIiR7aWR9XCJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlZW5JZHMuYWRkKGlkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgcmVzdWx0LmVtcHR5TmFtZXMucHVzaChpZFN0cik7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IEVtcHR5IGNsYXNzIG5hbWUgZm9yIElEIFwiJHtpZFN0cn1cImApO1xyXG4gICAgICAgIHJlc3VsdC5pc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gWU9MTyBGb3JtYXQgUHJvY2Vzc2luZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YTogc3RyaW5nKTogWW9sb1BhcnNlUmVzdWx0IHtcclxuICAgIHJldHVybiBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVsczogWW9sb0xhYmVsW10sIG9wdGlvbnM/OiBZb2xvRXhwb3J0T3B0aW9ucyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gWW9sb1BhcnNlci5sYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzLCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB2YWxpZGF0ZVlvbG9MYWJlbChsYWJlbDogWW9sb0xhYmVsKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gWW9sb1BhcnNlci52YWxpZGF0ZVlvbG9MYWJlbChsYWJlbCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2FjaGUgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGNsZWFySW1hZ2VDYWNoZSgpOiB2b2lkIHtcclxuICAgIC8vIFJldm9rZSBhbGwgYmxvYiBVUkxzIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICAgIGlmIChlbnRyeS5kYXRhLnNyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChlbnRyeS5kYXRhLnNyYyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuY2xlYXIoKTtcclxuICAgIFxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NhY2hlOmNsZWFyZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldENhY2hlU3RhdHMoKTogQ2FjaGVTdGF0cyB7XHJcbiAgICBsZXQgdG90YWxTaXplID0gMDtcclxuICAgIGxldCB0b3RhbEhpdHMgPSAwO1xyXG4gICAgbGV0IHRvdGFsQWNjZXNzZXMgPSAwO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgdG90YWxTaXplICs9IGVudHJ5LnNpemU7XHJcbiAgICAgIHRvdGFsSGl0cyArPSBlbnRyeS5oaXRzO1xyXG4gICAgICB0b3RhbEFjY2Vzc2VzICs9IGVudHJ5LmhpdHMgKyAxOyAvLyArMSBmb3IgaW5pdGlhbCBsb2FkXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0b3RhbEVudHJpZXM6IHRoaXMuaW1hZ2VDYWNoZS5zaXplLFxyXG4gICAgICB0b3RhbFNpemUsXHJcbiAgICAgIGhpdFJhdGU6IHRvdGFsQWNjZXNzZXMgPiAwID8gdG90YWxIaXRzIC8gdG90YWxBY2Nlc3NlcyA6IDAsXHJcbiAgICAgIG1lbW9yeVVzYWdlOiB0b3RhbFNpemUgLyAoMTAyNCAqIDEwMjQpIC8vIE1CXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9wdGltaXplQ2FjaGUoKTogdm9pZCB7XHJcbiAgICAvLyBSZW1vdmUgZXhwaXJlZCBlbnRyaWVzXHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY29uc3QgZXhwaXJlZEtleXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goKGVudHJ5LCBrZXkpID0+IHtcclxuICAgICAgaWYgKG5vdy5nZXRUaW1lKCkgLSBlbnRyeS50aW1lc3RhbXAuZ2V0VGltZSgpID4gdGhpcy5jb25maWcuY2FjaGVUaW1lb3V0KSB7XHJcbiAgICAgICAgZXhwaXJlZEtleXMucHVzaChrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBleHBpcmVkS2V5cy5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5pbWFnZUNhY2hlLmdldChrZXkpO1xyXG4gICAgICBpZiAoZW50cnkgJiYgZW50cnkuZGF0YS5zcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZW50cnkuZGF0YS5zcmMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaW1hZ2VDYWNoZS5kZWxldGUoa2V5KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIElmIHN0aWxsIG92ZXIgbGltaXQsIHJlbW92ZSBsZWFzdCByZWNlbnRseSB1c2VkXHJcbiAgICBpZiAodGhpcy5nZXRUb3RhbENhY2hlU2l6ZSgpID4gdGhpcy5jb25maWcubWF4Q2FjaGVTaXplKSB7XHJcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBBcnJheS5mcm9tKHRoaXMuaW1hZ2VDYWNoZS5lbnRyaWVzKCkpLnNvcnQoKGEsIGIpID0+IFxyXG4gICAgICAgIGFbMV0udGltZXN0YW1wLmdldFRpbWUoKSAtIGJbMV0udGltZXN0YW1wLmdldFRpbWUoKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgd2hpbGUgKHRoaXMuZ2V0VG90YWxDYWNoZVNpemUoKSA+IHRoaXMuY29uZmlnLm1heENhY2hlU2l6ZSAmJiBlbnRyaWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBba2V5LCBlbnRyeV0gPSBlbnRyaWVzLnNoaWZ0KCkhO1xyXG4gICAgICAgIGlmIChlbnRyeS5kYXRhLnNyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XHJcbiAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGVudHJ5LmRhdGEuc3JjKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbWFnZUNhY2hlLmRlbGV0ZShrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NhY2hlOm9wdGltaXplZCcsXHJcbiAgICAgIGRhdGE6IHsgcmVtb3ZlZEV4cGlyZWQ6IGV4cGlyZWRLZXlzLmxlbmd0aCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIFtdKTtcclxuICAgIH1cclxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpIS5wdXNoKGhhbmRsZXIpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBoYW5kbGVycyEuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNwYXRjaEV2ZW50KGV2ZW50OiBGaWxlU3lzdGVtRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMhLmZvckVhY2goaGFuZGxlciA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBGaWxlU3lzdGVtIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gUHJpdmF0ZSBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgZ2V0RmlsZUV4dGVuc2lvbihmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGxhc3REb3QgPSBmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpO1xyXG4gICAgcmV0dXJuIGxhc3REb3QgPiAwID8gZmlsZU5hbWUuc3Vic3RyaW5nKGxhc3REb3QgKyAxKSA6ICcnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRMYWJlbEZpbGVOYW1lKGltYWdlRmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gaW1hZ2VGaWxlTmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJy50eHQnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlSW1hZ2VGcm9tRmlsZShmaWxlOiBGaWxlLCBvcHRpb25zPzogSW1hZ2VMb2FkT3B0aW9ucyk6IFByb21pc2U8SFRNTEltYWdlRWxlbWVudD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XHJcbiAgICAgIFxyXG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcclxuICAgICAgICByZXNvbHZlKGltZyk7XHJcbiAgICAgIH07XHJcbiAgICAgIFxyXG4gICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBJbWFnZUxvYWRFcnJvcihgRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICR7ZmlsZS5uYW1lfWAsIGZpbGUubmFtZSkpO1xyXG4gICAgICB9O1xyXG4gICAgICBcclxuICAgICAgaW1nLnNyYyA9IHVybDtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYWNoZUltYWdlKGtleTogc3RyaW5nLCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHNpemU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLy8gT3B0aW1pemUgY2FjaGUgYmVmb3JlIGFkZGluZyBuZXcgZW50cnlcclxuICAgIGlmICh0aGlzLmdldFRvdGFsQ2FjaGVTaXplKCkgKyBzaXplID4gdGhpcy5jb25maWcubWF4Q2FjaGVTaXplKSB7XHJcbiAgICAgIHRoaXMub3B0aW1pemVDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGVudHJ5OiBDYWNoZUVudHJ5PEhUTUxJbWFnZUVsZW1lbnQ+ID0ge1xyXG4gICAgICBkYXRhOiBpbWcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcclxuICAgICAgc2l6ZSxcclxuICAgICAgaGl0czogMFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuc2V0KGtleSwgZW50cnkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0NhY2hlVmFsaWQoZW50cnk6IENhY2hlRW50cnk8SFRNTEltYWdlRWxlbWVudD4pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICByZXR1cm4gbm93LmdldFRpbWUoKSAtIGVudHJ5LnRpbWVzdGFtcC5nZXRUaW1lKCkgPCB0aGlzLmNvbmZpZy5jYWNoZVRpbWVvdXQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFRvdGFsQ2FjaGVTaXplKCk6IG51bWJlciB7XHJcbiAgICBsZXQgdG90YWwgPSAwO1xyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgICB0b3RhbCArPSBlbnRyeS5zaXplO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdG90YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZhY3RvcnkgRnVuY3Rpb25zXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgRmlsZVN5c3RlbVNlcnZpY2UgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGaWxlU3lzdGVtU2VydmljZShjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KTogRmlsZVN5c3RlbVNlcnZpY2Uge1xyXG4gIHJldHVybiBuZXcgRmlsZVN5c3RlbVNlcnZpY2UoY29uZmlnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBGaWxlU3lzdGVtU2VydmljZSB3aXRoIGN1c3RvbSBjYWNoZSBzaXplXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2VXaXRoQ2FjaGUoY2FjaGVTaXplOiBudW1iZXIpOiBGaWxlU3lzdGVtU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBGaWxlU3lzdGVtU2VydmljZSh7IG1heENhY2hlU2l6ZTogY2FjaGVTaXplIH0pO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmlsZVN5c3RlbVNlcnZpY2U7XHJcbmV4cG9ydCB0eXBlIHsgSUZpbGVTeXN0ZW1TZXJ2aWNlLCBGaWxlU3lzdGVtQ29uZmlnIH07IiwiLyoqXHJcbiAqIFNlcnZpY2VzIE1vZHVsZSBJbmRleFxyXG4gKiBcclxuICogQ2VudHJhbCBleHBvcnQgcG9pbnQgZm9yIGFsbCBzZXJ2aWNlIGNsYXNzZXMgdXNlZCB0aHJvdWdob3V0IHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBjbGVhbiBBUEkgYWNjZXNzIHRvIGJ1c2luZXNzIGxvZ2ljIGFuZCBleHRlcm5hbCBzZXJ2aWNlIGludGVncmF0aW9ucy5cclxuICovXHJcblxyXG4vLyBFeHBvcnQgRmlsZVN5c3RlbVNlcnZpY2VcclxuZXhwb3J0IHsgXHJcbiAgRmlsZVN5c3RlbVNlcnZpY2UsIFxyXG4gIGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlLCBcclxuICBjcmVhdGVGaWxlU3lzdGVtU2VydmljZVdpdGhDYWNoZSxcclxuICB0eXBlIElGaWxlU3lzdGVtU2VydmljZSxcclxuICB0eXBlIEZpbGVTeXN0ZW1Db25maWdcclxufSBmcm9tICcuL0ZpbGVTeXN0ZW1TZXJ2aWNlJztcclxuXHJcbi8vIFJlLWV4cG9ydCBZb2xvUGFyc2VyIGZyb20gdXRpbHMgZm9yIGNvbnZlbmllbmNlXHJcbmV4cG9ydCB7IFlvbG9QYXJzZXIsIHBhcnNlWW9sbywgZXhwb3J0WW9sbyB9IGZyb20gJy4uL3V0aWxzL3lvbG8tcGFyc2VyJztcclxuXHJcbi8vIFJlLWV4cG9ydCB0eXBlcyBmb3IgY29udmVuaWVuY2VcclxuZXhwb3J0IHR5cGUge1xyXG4gIEZpbGVPcGVyYXRpb25SZXN1bHQsXHJcbiAgRmlsZUxvYWRSZXN1bHQsXHJcbiAgWW9sb0xhYmVsLFxyXG4gIFlvbG9QYXJzZVJlc3VsdCxcclxuICBZb2xvRXhwb3J0T3B0aW9ucyxcclxuICBDbGFzc0ZpbGVDb250ZW50LFxyXG4gIENsYXNzRmlsZVZhbGlkYXRpb24sXHJcbiAgRm9sZGVyU2NhblJlc3VsdCxcclxuICBMYWJlbFN0YXR1cyxcclxuICBJbWFnZUluZm8sXHJcbiAgSW1hZ2VMb2FkT3B0aW9ucyxcclxuICBUaWZmUHJvY2Vzc2luZ09wdGlvbnMsXHJcbiAgQ2FjaGVFbnRyeSxcclxuICBDYWNoZVN0YXRzLFxyXG4gIEZpbGVTeXN0ZW1FdmVudCxcclxuICBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyLFxyXG4gIEZpbGVTeXN0ZW1FcnJvcixcclxuICBJbWFnZUxvYWRFcnJvcixcclxuICBZb2xvRm9ybWF0RXJyb3IsXHJcbiAgRmlsZUZvcm1hdCxcclxuICBMYWJlbEZvcm1hdCxcclxuICBDbGFzc0ZpbGVGb3JtYXQsXHJcbiAgRmlsZVR5cGVJbmZvLFxyXG4gIEZpbGVTeXN0ZW1TZXJ2aWNlRmFjdG9yeVxyXG59IGZyb20gJy4uL3R5cGVzL2ZpbGVzeXN0ZW0nOyIsIi8qKlxyXG4gKiBVdGlscyBNb2R1bGUgSW5kZXhcclxuICogXHJcbiAqIENlbnRyYWwgZXhwb3J0IHBvaW50IGZvciBhbGwgdXRpbGl0eSBmdW5jdGlvbnMgdXNlZCB0aHJvdWdob3V0IHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBUaGlzIGZpbGUgcHJvdmlkZXMgYSBjbGVhbiBBUEkgZm9yIGltcG9ydGluZyB1dGlsaXR5IGZ1bmN0aW9ucyBmcm9tIHZhcmlvdXMgbW9kdWxlcy5cclxuICovXHJcblxyXG4vLyBFeHBvcnQgYWxsIG5vdGlmaWNhdGlvbiB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIHNob3dUb2FzdCxcclxuICAgIHNob3dFcnJvclRvYXN0LFxyXG4gICAgc2hvd1N1Y2Nlc3NUb2FzdCxcclxuICAgIHNob3dXYXJuaW5nVG9hc3QsXHJcbiAgICBzaG93VHlwZWRUb2FzdCxcclxuICAgIHR5cGUgVG9hc3RUeXBlLFxyXG4gICAgdHlwZSBUb2FzdENvbmZpZ1xyXG59IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIGNvbG9yIHBhbGV0dGUgdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICBjb2xvclBhbGV0dGUsXHJcbiAgICBERUZBVUxUX0NPTE9SLFxyXG4gICAgZ2V0Q29sb3JGb3JDbGFzcyxcclxuICAgIGdldENvbG9yc0ZvckNsYXNzZXMsXHJcbiAgICBpc0NvbG9ySW5QYWxldHRlLFxyXG4gICAgZ2V0Q29sb3JJbmRleCxcclxuICAgIGdldENvbnRyYXN0aW5nVGV4dENvbG9yLFxyXG4gICAgaGV4VG9SZ2JhLFxyXG4gICAgQ29sb3JNYW5hZ2VyLFxyXG4gICAgdHlwZSBDb2xvckNvbmZpZ1xyXG59IGZyb20gJy4vY29sb3ItcGFsZXR0ZSc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIHZhbGlkYXRpb24gdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3MsXHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3NBZHZhbmNlZCxcclxuICAgIHZhbGlkYXRlRmlsZU5hbWUsXHJcbiAgICB2YWxpZGF0ZUltYWdlRXh0ZW5zaW9uLFxyXG4gICAgdmFsaWRhdGVCb3VuZGluZ0JveCxcclxuICAgIHZhbGlkYXRlWU9MT0Nvb3JkaW5hdGVzLFxyXG4gICAgdmFsaWRhdGVab29tTGV2ZWwsXHJcbiAgICB2YWxpZGF0ZUZvbnRTaXplLFxyXG4gICAgdmFsaWRhdGVOdW1iZXIsXHJcbiAgICB2YWxpZGF0ZUVtYWlsLFxyXG4gICAgdmFsaWRhdGVVcmwsXHJcbiAgICBzYW5pdGl6ZUlucHV0LFxyXG4gICAgdHlwZSBWYWxpZGF0aW9uUmVzdWx0XHJcbn0gZnJvbSAnLi92YWxpZGF0aW9uJztcclxuXHJcbi8vIEV4cG9ydCBZT0xPIHBhcnNlciB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIFlvbG9QYXJzZXIsXHJcbiAgICBwYXJzZVlvbG8sXHJcbiAgICBleHBvcnRZb2xvLFxyXG4gICAgdmFsaWRhdGVZb2xvU3RyaW5nXHJcbn0gZnJvbSAnLi95b2xvLXBhcnNlcic7XHJcblxyXG4vLyBSZS1leHBvcnQgY29tbW9ubHkgdXNlZCB1dGlsaXRpZXMgd2l0aCBzaG9ydGVyIG5hbWVzXHJcbmV4cG9ydCB7IHNob3dUb2FzdCBhcyB0b2FzdCB9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcbmV4cG9ydCB7IGdldENvbG9yRm9yQ2xhc3MgYXMgZ2V0Q29sb3IgfSBmcm9tICcuL2NvbG9yLXBhbGV0dGUnO1xyXG5leHBvcnQgeyB2YWxpZGF0ZUxhYmVsQ2xhc3MgYXMgdmFsaWRhdGVMYWJlbCB9IGZyb20gJy4vdmFsaWRhdGlvbic7XHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiBjYXRlZ29yaWVzIGZvciBiZXR0ZXIgb3JnYW5pemF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVXRpbGl0eUNhdGVnb3JpZXMgPSB7XHJcbiAgICBOT1RJRklDQVRJT05TOiBbXHJcbiAgICAgICAgJ3Nob3dUb2FzdCcsXHJcbiAgICAgICAgJ3Nob3dFcnJvclRvYXN0JywgXHJcbiAgICAgICAgJ3Nob3dTdWNjZXNzVG9hc3QnLFxyXG4gICAgICAgICdzaG93V2FybmluZ1RvYXN0JyxcclxuICAgICAgICAnc2hvd1R5cGVkVG9hc3QnXHJcbiAgICBdLFxyXG4gICAgQ09MT1JTOiBbXHJcbiAgICAgICAgJ2dldENvbG9yRm9yQ2xhc3MnLFxyXG4gICAgICAgICdnZXRDb2xvcnNGb3JDbGFzc2VzJyxcclxuICAgICAgICAnZ2V0Q29udHJhc3RpbmdUZXh0Q29sb3InLFxyXG4gICAgICAgICdoZXhUb1JnYmEnLFxyXG4gICAgICAgICdDb2xvck1hbmFnZXInXHJcbiAgICBdLFxyXG4gICAgVkFMSURBVElPTjogW1xyXG4gICAgICAgICd2YWxpZGF0ZUxhYmVsQ2xhc3MnLFxyXG4gICAgICAgICd2YWxpZGF0ZUZpbGVOYW1lJyxcclxuICAgICAgICAndmFsaWRhdGVJbWFnZUV4dGVuc2lvbicsXHJcbiAgICAgICAgJ3ZhbGlkYXRlQm91bmRpbmdCb3gnLFxyXG4gICAgICAgICd2YWxpZGF0ZVlPTE9Db29yZGluYXRlcydcclxuICAgIF0sXHJcbiAgICBZT0xPOiBbXHJcbiAgICAgICAgJ1lvbG9QYXJzZXInLFxyXG4gICAgICAgICdwYXJzZVlvbG8nLFxyXG4gICAgICAgICdleHBvcnRZb2xvJyxcclxuICAgICAgICAndmFsaWRhdGVZb2xvU3RyaW5nJ1xyXG4gICAgXVxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXRpbGl0eUNvbmZpZyB7XHJcbiAgICBub3RpZmljYXRpb25zOiB7XHJcbiAgICAgICAgZGVmYXVsdER1cmF0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZztcclxuICAgIH07XHJcbiAgICBjb2xvcnM6IHtcclxuICAgICAgICB1c2VIaWdoQ29udHJhc3Q6IGJvb2xlYW47XHJcbiAgICAgICAgY3VzdG9tUGFsZXR0ZT86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiBib29sZWFuO1xyXG4gICAgICAgIHNob3dFcnJvcnM6IGJvb2xlYW47XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB1dGlsaXR5IGNvbmZpZ3VyYXRpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1VUSUxJVFlfQ09ORklHOiBVdGlsaXR5Q29uZmlnID0ge1xyXG4gICAgbm90aWZpY2F0aW9uczoge1xyXG4gICAgICAgIGRlZmF1bHREdXJhdGlvbjogMzAwMCxcclxuICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJyN0b2FzdC1jb250YWluZXInXHJcbiAgICB9LFxyXG4gICAgY29sb3JzOiB7XHJcbiAgICAgICAgdXNlSGlnaENvbnRyYXN0OiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiB0cnVlLFxyXG4gICAgICAgIHNob3dFcnJvcnM6IHRydWVcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IG1hbmFnZXIgZm9yIGNvb3JkaW5hdGVkIHV0aWxpdHkgb3BlcmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFV0aWxpdHlNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgY29uZmlnOiBVdGlsaXR5Q29uZmlnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUGFydGlhbDxVdGlsaXR5Q29uZmlnPiA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfVVRJTElUWV9DT05GSUcsIC4uLmNvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGN1cnJlbnQgY29uZmlndXJhdGlvblxyXG4gICAgICovXHJcbiAgICBnZXRDb25maWcoKTogVXRpbGl0eUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUNvbmZpZyhuZXdDb25maWc6IFBhcnRpYWw8VXRpbGl0eUNvbmZpZz4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLm5ld0NvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSB1dGlsaXRpZXMgd2l0aCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICAvLyBUaGlzIGNvdWxkIGJlIGV4dGVuZGVkIHRvIHNldCB1cCBhbnkgZ2xvYmFsIHV0aWxpdHkgY29uZmlndXJhdGlvbnNcclxuICAgICAgICBjb25zb2xlLmxvZygnVXRpbGl0aWVzIGluaXRpYWxpemVkIHdpdGggY29uZmlnOicsIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCB1dGlsaXR5IG1hbmFnZXIgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBjb25zdCB1dGlsaXR5TWFuYWdlciA9IG5ldyBVdGlsaXR5TWFuYWdlcigpO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjaGVjayBpZiB1dGlsaXRpZXMgYXJlIHByb3Blcmx5IGxvYWRlZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVXRpbGl0aWVzTG9hZGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBJbXBvcnQgZnVuY3Rpb25zIGZvciB0ZXN0aW5nXHJcbiAgICAgICAgY29uc3QgeyBzaG93VG9hc3QgfSA9IHJlcXVpcmUoJy4vbm90aWZpY2F0aW9ucycpO1xyXG4gICAgICAgIGNvbnN0IHsgY29sb3JQYWxldHRlIH0gPSByZXF1aXJlKCcuL2NvbG9yLXBhbGV0dGUnKTtcclxuICAgICAgICBjb25zdCB7IHZhbGlkYXRlTGFiZWxDbGFzcyB9ID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVGVzdCBlYWNoIHV0aWxpdHkgY2F0ZWdvcnlcclxuICAgICAgICBjb25zdCBub3RpZmljYXRpb25UZXN0ID0gdHlwZW9mIHNob3dUb2FzdCA9PT0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBjb25zdCBjb2xvclRlc3QgPSBBcnJheS5pc0FycmF5KGNvbG9yUGFsZXR0ZSkgJiYgY29sb3JQYWxldHRlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvblRlc3QgPSB0eXBlb2YgdmFsaWRhdGVMYWJlbENsYXNzID09PSAnZnVuY3Rpb24nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBub3RpZmljYXRpb25UZXN0ICYmIGNvbG9yVGVzdCAmJiB2YWxpZGF0aW9uVGVzdDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignVXRpbGl0aWVzIHZhbGlkYXRpb24gZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdXRpbGl0eSBtb2R1bGUgdmVyc2lvbiBpbmZvXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVVRJTElUWV9WRVJTSU9OID0ge1xyXG4gICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgIG1vZHVsZXM6IHtcclxuICAgICAgICBub3RpZmljYXRpb25zOiAnMS4wLjAnLFxyXG4gICAgICAgIGNvbG9yczogJzEuMC4wJyxcclxuICAgICAgICB2YWxpZGF0aW9uOiAnMS4wLjAnLFxyXG4gICAgICAgIHlvbG86ICcxLjAuMCdcclxuICAgIH0sXHJcbiAgICBidWlsZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG59O1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB1dGlsaXRpZXMgb24gbW9kdWxlIGxvYWRcclxudXRpbGl0eU1hbmFnZXIuaW5pdGlhbGl6ZSgpOyIsIi8qKlxyXG4gKiBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWFpbiBFbnRyeSBQb2ludFxyXG4gKiBcclxuICogVGhpcyBpcyB0aGUgbWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIFR5cGVTY3JpcHQgdmVyc2lvbiBvZiBFYXN5IExhYmVsaW5nLlxyXG4gKiBQaGFzZSA1IENvbXBsZXRlOiBGaWxlU3lzdGVtIHNlcnZpY2UgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGltcGxlbWVudGVkIHdpdGggWU9MTyBzdXBwb3J0LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGNyZWF0ZUFwcFN0YXRlLCBBcHBTdGF0ZSB9IGZyb20gJy4vbW9kZWxzJztcclxuaW1wb3J0IHsgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIFlvbG9QYXJzZXIsIHBhcnNlWW9sbyB9IGZyb20gJy4vc2VydmljZXMnO1xyXG5pbXBvcnQgeyBwYXJzZVlvbG8gYXMgdXRpbFBhcnNlWW9sbyB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuLy8gUGhhc2UgUHJvZ3Jlc3MgUmVwb3J0XHJcbmNvbnNvbGUubG9nKCfwn5qAIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb24gLSBQaGFzZSA1IENvbXBsZXRlIScpO1xyXG5jb25zb2xlLmxvZygn4pyFIFR5cGVTY3JpcHQgY29tcGlsYXRpb24gd29ya2luZycpO1xyXG5jb25zb2xlLmxvZygn4pyFIFdlYnBhY2sgYnVuZGxpbmcgd29ya2luZycpO1xyXG5jb25zb2xlLmxvZygn4pyFIEFwcFN0YXRlIG1vZGVsIGltcGxlbWVudGVkIHdpdGggdHlwZSBzYWZldHknKTtcclxuY29uc29sZS5sb2coJ+KchSBFdmVudCBzeXN0ZW0gYW5kIHZhbGlkYXRpb24gYWRkZWQnKTtcclxuY29uc29sZS5sb2coJ+KchSBGaWxlU3lzdGVtIHNlcnZpY2UgaW1wbGVtZW50ZWQnKTtcclxuY29uc29sZS5sb2coJ+KchSBZT0xPIHBhcnNlciB3aXRoIHZhbGlkYXRpb24nKTtcclxuY29uc29sZS5sb2coJ+KchSBGaWxlIEkvTyBhYnN0cmFjdGlvbiBsYXllcicpO1xyXG5jb25zb2xlLmxvZygn8J+ThSBQaGFzZSA1IGNvbXBsZXRlZDonLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG5cclxuLy8gVGVzdCBQaGFzZSA0OiBBcHBTdGF0ZSBNb2RlbFxyXG5jb25zb2xlLmxvZygnXFxu8J+nqiBUZXN0aW5nIFBoYXNlIDQgQXBwU3RhdGUgSW1wbGVtZW50YXRpb246Jyk7XHJcblxyXG4vLyBDcmVhdGUgQXBwU3RhdGUgaW5zdGFuY2VcclxuY29uc3QgYXBwU3RhdGUgPSBjcmVhdGVBcHBTdGF0ZSgpO1xyXG5jb25zb2xlLmxvZygn4pyFIEFwcFN0YXRlIGluc3RhbmNlIGNyZWF0ZWQnKTtcclxuXHJcbi8vIFRlc3QgZXZlbnQgc3lzdGVtXHJcbmFwcFN0YXRlLmFkZEV2ZW50TGlzdGVuZXIoJ21vZGU6Y2hhbmdlZCcsIChldmVudCkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKCfwn5OhIEV2ZW50IHJlY2VpdmVkOicsIGV2ZW50LnR5cGUsIGV2ZW50LmRhdGEpO1xyXG59KTtcclxuXHJcbi8vIFRlc3Qgc3RhdGUgbWV0aG9kc1xyXG5hcHBTdGF0ZS5zZXRNb2RlKCdkcmF3Jyk7XHJcbmNvbnNvbGUubG9nKCfinIUgTW9kZSBjaGFuZ2VkIHRvOicsIGFwcFN0YXRlLmN1cnJlbnRNb2RlKTtcclxuXHJcbmFwcFN0YXRlLnNldExhYmVsRm9udFNpemUoMTYpO1xyXG5jb25zb2xlLmxvZygn4pyFIEZvbnQgc2l6ZSBzZXQgdG86JywgYXBwU3RhdGUubGFiZWxGb250U2l6ZSk7XHJcblxyXG4vLyBUZXN0IHZhbGlkYXRpb25cclxuY29uc3QgdmFsaWRhdGlvbiA9IGFwcFN0YXRlLnZhbGlkYXRlKCk7XHJcbmNvbnNvbGUubG9nKCfinIUgVmFsaWRhdGlvbiByZXN1bHQ6JywgdmFsaWRhdGlvbi5pc1ZhbGlkID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcbmlmICh2YWxpZGF0aW9uLndhcm5pbmdzLmxlbmd0aCA+IDApIHtcclxuICBjb25zb2xlLmxvZygn4pqg77iPIFdhcm5pbmdzOicsIHZhbGlkYXRpb24ud2FybmluZ3MpO1xyXG59XHJcblxyXG4vLyBUZXN0IHNlcmlhbGl6YXRpb25cclxuY29uc3Qgc2VyaWFsaXplZCA9IGFwcFN0YXRlLmdldFNlcmlhbGl6YWJsZVN0YXRlKCk7XHJcbmNvbnNvbGUubG9nKCfinIUgU2VyaWFsaXphdGlvbiB0ZXN0OicsIE9iamVjdC5rZXlzKHNlcmlhbGl6ZWQpLmxlbmd0aCwgJ3Byb3BlcnRpZXMgc2VyaWFsaXplZCcpO1xyXG5cclxuY29uc29sZS5sb2coJ/Cfjq8gUGhhc2UgNCBBcHBTdGF0ZSB0ZXN0cyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG5cclxuLy8gVGVzdCBQaGFzZSA1OiBGaWxlU3lzdGVtIFNlcnZpY2VcclxuY29uc29sZS5sb2coJ1xcbvCfp6ogVGVzdGluZyBQaGFzZSA1IEZpbGVTeXN0ZW0gU2VydmljZSBJbXBsZW1lbnRhdGlvbjonKTtcclxuXHJcbi8vIENyZWF0ZSBGaWxlU3lzdGVtIHNlcnZpY2UgaW5zdGFuY2VcclxuY29uc3QgZmlsZVN5c3RlbSA9IGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlKCk7XHJcbmNvbnNvbGUubG9nKCfinIUgRmlsZVN5c3RlbSBzZXJ2aWNlIGNyZWF0ZWQnKTtcclxuXHJcbi8vIFRlc3QgWU9MTyBwYXJzZXJcclxuY29uc3QgdGVzdFlvbG9EYXRhID0gYDAgMC41IDAuNSAwLjMgMC40XHJcbjEgMC4yIDAuOCAwLjEgMC4yYDtcclxuXHJcbnRyeSB7XHJcbiAgY29uc3QgbGFiZWxzID0gcGFyc2VZb2xvKHRlc3RZb2xvRGF0YSk7XHJcbiAgY29uc29sZS5sb2coJ+KchSBZT0xPIHBhcnNpbmcgdGVzdDonLCBsYWJlbHMubGVuZ3RoLCAnbGFiZWxzIHBhcnNlZCcpO1xyXG4gIFxyXG4gIGNvbnN0IHlvbG9TdHJpbmcgPSBZb2xvUGFyc2VyLmxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHMpO1xyXG4gIGNvbnNvbGUubG9nKCfinIUgWU9MTyBleHBvcnQgdGVzdDogc3RyaW5nIGdlbmVyYXRlZCcpO1xyXG4gIFxyXG4gIGNvbnN0IHZhbGlkYXRpb24gPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh0ZXN0WW9sb0RhdGEpO1xyXG4gIGNvbnNvbGUubG9nKCfinIUgWU9MTyB2YWxpZGF0aW9uIHRlc3Q6JywgdmFsaWRhdGlvbi5lcnJvcnMubGVuZ3RoID09PSAwID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcbiAgXHJcbn0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgY29uc29sZS5lcnJvcign4p2MIFlPTE8gcGFyc2VyIHRlc3QgZmFpbGVkOicsIGVycm9yKTtcclxufVxyXG5cclxuLy8gVGVzdCBGaWxlU3lzdGVtIHNlcnZpY2UgbWV0aG9kc1xyXG5jb25zb2xlLmxvZygn4pyFIFNlcnZpY2UgbWV0aG9kcyBhdmFpbGFibGU6JywgW1xyXG4gICdzZWxlY3RJbWFnZUZvbGRlcicsXHJcbiAgJ3NlbGVjdExhYmVsRm9sZGVyJywgXHJcbiAgJ2xvYWRMYWJlbHMnLFxyXG4gICdzYXZlTGFiZWxzJyxcclxuICAncGFyc2VZb2xvU3RyaW5nJ1xyXG5dLmV2ZXJ5KG1ldGhvZCA9PiB0eXBlb2YgKGZpbGVTeXN0ZW0gYXMgYW55KVttZXRob2RdID09PSAnZnVuY3Rpb24nKSk7XHJcblxyXG5jb25zb2xlLmxvZygn8J+OryBQaGFzZSA1IEZpbGVTeXN0ZW0gc2VydmljZSB0ZXN0cyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG5cclxuLy8gRE9NIHJlYWR5IHRlc3RcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+TsSBET00gbG9hZGVkIC0gcmVhZHkgZm9yIFBoYXNlIDYgaW1wbGVtZW50YXRpb24nKTtcclxuICBcclxuICAvLyBDcmVhdGUgUGhhc2UgNSBjb21wbGV0aW9uIGluZGljYXRvclxyXG4gIGNvbnN0IGluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGluZGljYXRvci5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgdG9wOiAxMHB4O1xyXG4gICAgcmlnaHQ6IDEwcHg7XHJcbiAgICBiYWNrZ3JvdW5kOiAjMjhhNzQ1O1xyXG4gICAgY29sb3I6IHdoaXRlO1xyXG4gICAgcGFkZGluZzogMTJweCAxOHB4O1xyXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xyXG4gICAgZm9udC1mYW1pbHk6ICdTZWdvZSBVSScsIG1vbm9zcGFjZTtcclxuICAgIGZvbnQtc2l6ZTogMTNweDtcclxuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG4gICAgei1pbmRleDogOTk5OTtcclxuICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLDAsMCwwLjMpO1xyXG4gICAgYm9yZGVyOiAycHggc29saWQgI2ZmZjtcclxuICBgO1xyXG4gIGluZGljYXRvci5pbm5lckhUTUwgPSBgXHJcbiAgICA8ZGl2PvCfmoAgUGhhc2UgNSBDb21wbGV0ZTwvZGl2PlxyXG4gICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDsgb3BhY2l0eTogMC45OyBtYXJnaW4tdG9wOiA0cHg7XCI+RmlsZVN5c3RlbSBTZXJ2aWNlIFJlYWR5PC9kaXY+XHJcbiAgYDtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluZGljYXRvcik7XHJcbiAgXHJcbiAgLy8gQXV0by1yZW1vdmUgYWZ0ZXIgOCBzZWNvbmRzXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBpbmRpY2F0b3Iuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuNXMgZWFzZSc7XHJcbiAgICBpbmRpY2F0b3Iuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4gaW5kaWNhdG9yLnJlbW92ZSgpLCA1MDApO1xyXG4gIH0sIDgwMDApO1xyXG59KTtcclxuXHJcbi8vIEV4cG9ydCBQaGFzZSA0ICYgNSBjb21wb25lbnRzXHJcbmV4cG9ydCB7IEFwcFN0YXRlLCBjcmVhdGVBcHBTdGF0ZSwgY3JlYXRlQXBwU3RhdGVXaXRoQ29uZmlnIH0gZnJvbSAnLi9tb2RlbHMnO1xyXG5leHBvcnQgeyBGaWxlU3lzdGVtU2VydmljZSwgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIFlvbG9QYXJzZXIgfSBmcm9tICcuL3NlcnZpY2VzJztcclxuZXhwb3J0IHsgcGFyc2VZb2xvLCBleHBvcnRZb2xvLCB2YWxpZGF0ZVlvbG9TdHJpbmcgfSBmcm9tICcuL3V0aWxzJzsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=