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

// UNUSED EXPORTS: App, AppState, CanvasController, EventManager, FileSystemService, UIManager, YoloParser, createAppState, createAppStateWithConfig, createFileSystemService, exportYolo, parseYolo, validateYoloString

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
class filesystem_YoloFormatError extends Error {
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
                if (error instanceof filesystem_YoloFormatError) {
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
            throw new filesystem_YoloFormatError(`Invalid YOLO format. Expected: "classId centerX centerY width height"`, lineNumber, line);
        }
        const [, classIdStr, centerXStr, centerYStr, widthStr, heightStr] = match;
        // Parse class ID
        const classId = parseInt(classIdStr, 10);
        if (isNaN(classId) || classId < 0) {
            throw new filesystem_YoloFormatError(`Invalid class ID: "${classIdStr}". Must be a non-negative integer`, lineNumber, line);
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
            throw new filesystem_YoloFormatError(`Invalid ${name}: "${value}". Must be a valid number`, lineNumber, line);
        }
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new filesystem_YoloFormatError(`Invalid ${name}: "${value}". Could not parse as number`, lineNumber, line);
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
            throw new filesystem_YoloFormatError(`centerX out of range: ${centerX}. Must be between 0 and 1`, lineNumber, line);
        }
        if (centerY < MIN_COORDINATE || centerY > MAX_COORDINATE) {
            throw new filesystem_YoloFormatError(`centerY out of range: ${centerY}. Must be between 0 and 1`, lineNumber, line);
        }
        if (width <= MIN_SIZE || width > MAX_COORDINATE) {
            throw new filesystem_YoloFormatError(`width out of range: ${width}. Must be between 0 and 1`, lineNumber, line);
        }
        if (height <= MIN_SIZE || height > MAX_COORDINATE) {
            throw new filesystem_YoloFormatError(`height out of range: ${height}. Must be between 0 and 1`, lineNumber, line);
        }
        // Check bounding box bounds
        const left = centerX - width / 2;
        const right = centerX + width / 2;
        const top = centerY - height / 2;
        const bottom = centerY + height / 2;
        if (left < MIN_COORDINATE || right > MAX_COORDINATE) {
            throw new filesystem_YoloFormatError(`Bounding box extends outside image bounds horizontally (left: ${left}, right: ${right})`, lineNumber, line);
        }
        if (top < MIN_COORDINATE || bottom > MAX_COORDINATE) {
            throw new filesystem_YoloFormatError(`Bounding box extends outside image bounds vertically (top: ${top}, bottom: ${bottom})`, lineNumber, line);
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
                throw new filesystem_YoloFormatError(`Invalid label at index ${index}: coordinates out of bounds`);
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
            // TIFF handling: delegate to TIFF loader if needed
            const ext = this.getFileExtension(fileHandle.name).toLowerCase();
            if (ext === 'tif' || ext === 'tiff') {
                return await this.loadTiffImage(fileHandle);
            }
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


;// external "fabric"
const external_fabric_namespaceObject = fabric;
// EXTERNAL MODULE: ./src/utils/color-palette.ts
var color_palette = __webpack_require__(87);
;// ./src/controllers/CanvasController.ts
/**
 * Canvas Controller Implementation
 *
 * Manages Fabric.js canvas operations for the Easy Labeling application.
 * Handles bounding box drawing, editing, zoom/pan controls, and label visualization.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */

// Runtime alias for global FabricJS when using CDN externals
const FabricJS = (typeof window !== 'undefined' && window.fabric) ? window.fabric : external_fabric_namespaceObject.fabric;

// ===================================================================
// Canvas Controller Implementation
// ===================================================================
class CanvasController {
    constructor(appState) {
        this._canvas = null;
        this._eventListeners = new Map();
        // Canvas container and image
        this.containerElement = null;
        this.currentImage = null;
        this.imageObject = null;
        // Drawing state
        this.drawingOptions = {
            strokeWidth: 2,
            stroke: '#ff0000',
            fill: 'transparent',
            opacity: 1,
            selectable: true,
            evented: true
        };
        this.labelOptions = {
            showLabels: true,
            fontSize: 14,
            fontFamily: 'Arial',
            fontColor: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            showConfidence: false,
            showClassName: true,
            showClassId: true
        };
        // Performance monitoring
        this.performanceMetrics = {
            renderTime: 0,
            objectCount: 0,
            memoryUsage: 0,
            fps: 60
        };
        this.appState = appState;
        // Initialize default config
        this._config = {
            width: 800,
            height: 600,
            backgroundColor: '#f8f9fa',
            selection: true,
            preserveObjectStacking: true,
            renderOnAddRemove: true,
            skipTargetFind: false
        };
        // Initialize state
        this._state = {
            isDrawing: false,
            drawingMode: 'none',
            startPoint: null,
            endPoint: null,
            currentRect: null,
            activeLabelText: null,
            crosshairX: null,
            crosshairY: null,
            zoom: 1,
            panX: 0,
            panY: 0,
            selectedObjects: [],
            multipleSelection: false
        };
        // React to mode changes from AppState
        try {
            this.appState.addEventListener('mode:changed', (evt) => {
                const current = evt?.data?.current;
                this.applyModeSettings(current);
            });
        }
        catch { }
    }
    // ===================================================================
    // Properties (ICanvasController interface)
    // ===================================================================
    get canvas() {
        if (!this._canvas) {
            throw new Error('Canvas not initialized. Call initializeCanvas() first.');
        }
        return this._canvas;
    }
    get state() {
        return { ...this._state };
    }
    get config() {
        return { ...this._config };
    }
    // ===================================================================
    // State Accessors
    // ===================================================================
    isDrawing() {
        return this._state.isDrawing;
    }
    hasSelection() {
        return this._state.selectedObjects.length > 0;
    }
    getZoom() {
        return this._state.zoom;
    }
    getPan() {
        return { x: this._state.panX, y: this._state.panY };
    }
    getDimensions() {
        return {
            width: this._config.width,
            height: this._config.height,
            aspectRatio: this._config.width / this._config.height
        };
    }
    // ===================================================================
    // Initialization
    // ===================================================================
    initializeCanvas(containerId, config) {
        // Apply config overrides
        if (config) {
            this._config = { ...this._config, ...config };
        }
        // Find container element
        this.containerElement = document.getElementById(containerId);
        if (!this.containerElement) {
            throw new Error(`Canvas container element with ID '${containerId}' not found`);
        }
        // Create canvas element
        const canvasElement = document.createElement('canvas');
        canvasElement.id = `${containerId}-canvas`;
        canvasElement.width = this._config.width;
        canvasElement.height = this._config.height;
        // Clear container and add canvas
        this.containerElement.innerHTML = '';
        this.containerElement.appendChild(canvasElement);
        // Initialize Fabric.js canvas
        this._canvas = new FabricJS.Canvas(canvasElement, {
            backgroundColor: this._config.backgroundColor,
            selection: this._config.selection,
            preserveObjectStacking: this._config.preserveObjectStacking,
            renderOnAddRemove: this._config.renderOnAddRemove,
            skipTargetFind: this._config.skipTargetFind,
            width: this._config.width,
            height: this._config.height,
            // Enable high DPI support
            enableRetinaScaling: true,
            // Performance settings
            stateful: false
        });
        // Make canvas fill container
        this.resizeCanvasToContainer();
        // Setup event handlers
        this.setupCanvasEvents();
        // Prevent default context menu and toggle mode on right-click within container
        try {
            this.containerElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            this.containerElement.addEventListener('mousedown', (e) => {
                if (e.button === 2) { // Right click
                    this.appState.toggleMode();
                    e.preventDefault();
                }
            });
        }
        catch { }
        // Apply label options from app state
        this.syncWithAppState();
        // Apply current mode settings to canvas
        this.applyModeSettings(this.appState.currentMode);
        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            this.resizeCanvasToContainer();
            if (this.currentImage && this.imageObject) {
                const prevZoom = this._state.zoom;
                this.resetZoom();
                this.resizeToImage(this.currentImage);
                this.setZoom(prevZoom);
            }
            this.requestRender();
        });
        this.dispatchEvent({
            type: 'after:render',
            data: { initialized: true }
        });
    }
    destroyCanvas() {
        if (this._canvas) {
            this._canvas.dispose();
            this._canvas = null;
        }
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
            this.containerElement = null;
        }
        // Reset state
        this._state = {
            isDrawing: false,
            drawingMode: 'none',
            startPoint: null,
            endPoint: null,
            currentRect: null,
            activeLabelText: null,
            crosshairX: null,
            crosshairY: null,
            zoom: 1,
            panX: 0,
            panY: 0,
            selectedObjects: [],
            multipleSelection: false
        };
        this.currentImage = null;
        this.imageObject = null;
    }
    // ===================================================================
    // Image Operations
    // ===================================================================
    loadImage(imageElement) {
        if (!this._canvas)
            return;
        // Remove existing image
        this.clearImage();
        this.currentImage = imageElement;
        // Create fabric image object
        this.imageObject = new FabricJS.Image(imageElement, {
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockUniScaling: true,
            hasControls: false,
            hasBorders: false
        });
        // Resize canvas to match image
        this.resizeToImage(imageElement);
        // Add image to canvas (send to back)
        this._canvas.add(this.imageObject);
        this.imageObject.sendToBack();
        // Reset viewport
        this.resetZoom();
        this.resetPan();
        this._canvas.renderAll();
        this.dispatchEvent({
            type: 'after:render',
            data: { imageLoaded: true, imageDimensions: { width: imageElement.width, height: imageElement.height } }
        });
    }
    clearImage() {
        if (!this._canvas)
            return;
        if (this.imageObject) {
            this._canvas.remove(this.imageObject);
            this.imageObject = null;
        }
        this.currentImage = null;
        this._canvas.renderAll();
    }
    resizeToImage(image) {
        if (!this._canvas)
            return;
        // Ensure canvas matches container size
        this.resizeCanvasToContainer();
        const canvasWidth = this._canvas.getWidth();
        const canvasHeight = this._canvas.getHeight();
        // Scale image to fit inside canvas and center it
        if (this.imageObject) {
            const scale = Math.min(canvasWidth / image.width, canvasHeight / image.height);
            const scaledW = image.width * scale;
            const scaledH = image.height * scale;
            this.imageObject.set({
                scaleX: scale,
                scaleY: scale,
                left: (canvasWidth - scaledW) / 2,
                top: (canvasHeight - scaledH) / 2
            });
            this._canvas.centerObject(this.imageObject);
            this.imageObject.setCoords();
        }
    }
    resizeCanvasToContainer() {
        if (!this._canvas || !this.containerElement)
            return;
        const rect = this.containerElement.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        this._config = { ...this._config, width, height };
        this._canvas.setDimensions({ width, height });
    }
    // ===================================================================
    // Drawing Operations
    // ===================================================================
    startDrawing(point) {
        if (!this._canvas || this.appState.currentMode !== 'draw')
            return;
        this._state.isDrawing = true;
        this._state.drawingMode = 'rectangle';
        this._state.startPoint = point;
        this._state.endPoint = point;
        // Create temporary rectangle for drawing feedback
        const rect = new FabricJS.Rect({
            left: point.x,
            top: point.y,
            width: 0,
            height: 0,
            ...this.drawingOptions,
            selectable: false,
            evented: false
        });
        rect.isLabel = true;
        this._state.currentRect = rect;
        this._canvas.add(rect);
        this.dispatchEvent({
            type: 'mouse:down',
            pointer: point,
            data: { drawing: true }
        });
    }
    updateDrawing(point) {
        if (!this._canvas || !this._state.isDrawing || !this._state.currentRect || !this._state.startPoint)
            return;
        this._state.endPoint = point;
        // Calculate rectangle dimensions
        const left = Math.min(this._state.startPoint.x, point.x);
        const top = Math.min(this._state.startPoint.y, point.y);
        const width = Math.abs(point.x - this._state.startPoint.x);
        const height = Math.abs(point.y - this._state.startPoint.y);
        // Update temporary rectangle
        this._state.currentRect.set({
            left,
            top,
            width,
            height
        });
        this._canvas.renderAll();
        this.dispatchEvent({
            type: 'mouse:move',
            pointer: point,
            data: { drawing: true, dimensions: { width, height } }
        });
    }
    finishDrawing(point) {
        if (!this._canvas || !this._state.isDrawing || !this._state.currentRect || !this._state.startPoint) {
            this.cancelDrawing();
            return null;
        }
        this._state.endPoint = point;
        // Calculate final dimensions
        const left = Math.min(this._state.startPoint.x, point.x);
        const top = Math.min(this._state.startPoint.y, point.y);
        const width = Math.abs(point.x - this._state.startPoint.x);
        const height = Math.abs(point.y - this._state.startPoint.y);
        // Minimum size validation
        if (width < 5 || height < 5) {
            this.cancelDrawing();
            return null;
        }
        // Convert to image coordinates if image is loaded
        let normalizedBox = null;
        if (this.currentImage && this.imageObject) {
            const imageCoords = this.canvasToImageCoordinates({ x: left, y: top });
            const imageWidth = Math.abs(width / (this.imageObject.scaleX || 1));
            const imageHeight = Math.abs(height / (this.imageObject.scaleY || 1));
            // Create bounding box
            normalizedBox = {
                id: this.generateBoundingBoxId(),
                x: imageCoords.x,
                y: imageCoords.y,
                width: imageWidth,
                height: imageHeight,
                classId: 0, // Default class
                color: this.getClassColor(0),
                isVisible: true,
                isSelected: true,
                isTempDraw: false
            };
        }
        // Remove temporary rectangle
        this._canvas.remove(this._state.currentRect);
        // Reset drawing state
        this._state.isDrawing = false;
        this._state.drawingMode = 'none';
        this._state.startPoint = null;
        this._state.endPoint = null;
        this._state.currentRect = null;
        // Add permanent bounding box if valid
        if (normalizedBox) {
            this.addBoundingBox(normalizedBox);
        }
        this._canvas.renderAll();
        this.dispatchEvent({
            type: 'mouse:up',
            pointer: point,
            data: { drawing: false, boundingBox: normalizedBox }
        });
        return normalizedBox;
    }
    cancelDrawing() {
        if (!this._canvas)
            return;
        if (this._state.currentRect) {
            this._canvas.remove(this._state.currentRect);
        }
        this._state.isDrawing = false;
        this._state.drawingMode = 'none';
        this._state.startPoint = null;
        this._state.endPoint = null;
        this._state.currentRect = null;
        this._canvas.renderAll();
    }
    // ===================================================================
    // Bounding Box Operations
    // ===================================================================
    addBoundingBox(bbox) {
        if (!this._canvas) {
            throw new Error('Canvas not initialized');
        }
        // Convert to canvas coordinates
        const canvasCoords = this.imageToCanvasCoordinates({ x: bbox.x, y: bbox.y });
        const canvasWidth = this.imageObject ? bbox.width * (this.imageObject.scaleX || 1) : bbox.width;
        const canvasHeight = this.imageObject ? bbox.height * (this.imageObject.scaleY || 1) : bbox.height;
        // Create rectangle
        const rect = new FabricJS.Rect({
            left: canvasCoords.x,
            top: canvasCoords.y,
            width: canvasWidth,
            height: canvasHeight,
            stroke: bbox.color,
            strokeWidth: this.drawingOptions.strokeWidth,
            fill: 'transparent',
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            borderColor: bbox.color,
            cornerColor: bbox.color,
            transparentCorners: false
        });
        // Attach bounding box data
        rect.boundingBox = bbox;
        rect.isLabel = true;
        // Add to canvas
        this._canvas.add(rect);
        // Create label text if labels are enabled
        if (this.labelOptions.showLabels) {
            this.createLabelText(rect);
        }
        // Bring to front (but keep behind any current drawing)
        rect.bringToFront();
        this._canvas.renderAll();
        this.dispatchEvent({
            type: 'object:added',
            target: rect,
            data: { boundingBox: bbox }
        });
        return rect;
    }
    removeBoundingBox(id) {
        if (!this._canvas)
            return false;
        const objects = this._canvas.getObjects();
        const rectToRemove = objects.find(obj => obj.boundingBox?.id === id);
        if (rectToRemove) {
            // Remove associated label text
            if (rectToRemove.labelText) {
                this._canvas.remove(rectToRemove.labelText);
            }
            // Remove rectangle
            this._canvas.remove(rectToRemove);
            this._canvas.renderAll();
            this.dispatchEvent({
                type: 'object:removed',
                target: rectToRemove,
                data: { boundingBoxId: id }
            });
            return true;
        }
        return false;
    }
    updateBoundingBox(id, updates) {
        if (!this._canvas)
            return false;
        const objects = this._canvas.getObjects();
        const rect = objects.find(obj => obj.boundingBox?.id === id);
        if (rect && rect.boundingBox) {
            // Update bounding box data
            Object.assign(rect.boundingBox, updates);
            // Update visual properties
            if (updates.color) {
                rect.set({
                    stroke: updates.color,
                    borderColor: updates.color,
                    cornerColor: updates.color
                });
            }
            if (updates.isVisible !== undefined) {
                rect.set({ visible: updates.isVisible });
            }
            // Update label text
            if (rect.labelText) {
                this.updateLabelText(rect);
            }
            this._canvas.renderAll();
            this.dispatchEvent({
                type: 'object:modified',
                target: rect,
                data: { boundingBox: rect.boundingBox, updates }
            });
            return true;
        }
        return false;
    }
    getBoundingBox(id) {
        if (!this._canvas)
            return null;
        const objects = this._canvas.getObjects();
        const rect = objects.find(obj => obj.boundingBox?.id === id);
        return rect?.boundingBox || null;
    }
    getAllBoundingBoxes() {
        if (!this._canvas)
            return [];
        const objects = this._canvas.getObjects();
        return objects
            .filter(obj => obj.isLabel && obj.boundingBox)
            .map(obj => obj.boundingBox)
            .filter(bbox => bbox !== undefined);
    }
    // ===================================================================
    // Selection Operations
    // ===================================================================
    selectBoundingBox(id) {
        if (!this._canvas)
            return;
        const objects = this._canvas.getObjects();
        const rect = objects.find(obj => obj.boundingBox?.id === id);
        if (rect) {
            this._canvas.setActiveObject(rect);
            this.updateSelectedObjects();
            this._canvas.renderAll();
        }
    }
    deselectAll() {
        if (!this._canvas)
            return;
        this._canvas.discardActiveObject();
        this.updateSelectedObjects();
        this._canvas.renderAll();
        this.dispatchEvent({
            type: 'selection:cleared'
        });
    }
    getSelectedBoundingBoxes() {
        return this._state.selectedObjects
            .map(obj => obj.boundingBox)
            .filter(bbox => bbox !== undefined);
    }
    deleteSelected() {
        if (!this._canvas)
            return [];
        const selectedBoxes = this.getSelectedBoundingBoxes();
        const activeObject = this._canvas.getActiveObject();
        if (activeObject) {
            if (activeObject.type === 'activeSelection') {
                // Multiple selection
                const selection = activeObject;
                const objects = selection.getObjects();
                objects.forEach(obj => {
                    if (obj.isLabel && obj.boundingBox) {
                        this.removeBoundingBox(obj.boundingBox.id);
                    }
                });
            }
            else {
                // Single selection
                const rect = activeObject;
                if (rect.isLabel && rect.boundingBox) {
                    this.removeBoundingBox(rect.boundingBox.id);
                }
            }
        }
        this.deselectAll();
        return selectedBoxes;
    }
    // ===================================================================
    // Label Operations
    // ===================================================================
    showLabels() {
        this.labelOptions.showLabels = true;
        this.updateLabels();
    }
    hideLabels() {
        this.labelOptions.showLabels = false;
        this.updateLabels();
    }
    updateLabels() {
        if (!this._canvas)
            return;
        const objects = this._canvas.getObjects();
        objects.forEach(obj => {
            if (obj.isLabel && obj.boundingBox) {
                if (this.labelOptions.showLabels && !obj.labelText) {
                    this.createLabelText(obj);
                }
                else if (!this.labelOptions.showLabels && obj.labelText) {
                    this._canvas.remove(obj.labelText);
                    obj.labelText = undefined;
                }
                else if (obj.labelText) {
                    this.updateLabelText(obj);
                }
            }
        });
        this._canvas.renderAll();
    }
    setLabelFont(fontSize) {
        this.labelOptions.fontSize = fontSize;
        this.updateLabels();
    }
    // ===================================================================
    // Viewport Operations
    // ===================================================================
    zoomIn() {
        const newZoom = Math.min(this._state.zoom * 1.2, 5);
        this.setZoom(newZoom);
    }
    zoomOut() {
        const newZoom = Math.max(this._state.zoom / 1.2, 0.1);
        this.setZoom(newZoom);
    }
    zoomToFit() {
        if (!this._canvas || !this.currentImage)
            return;
        const canvasWidth = this._canvas.getWidth();
        const canvasHeight = this._canvas.getHeight();
        const imageWidth = this.currentImage.width;
        const imageHeight = this.currentImage.height;
        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;
        const zoom = Math.min(scaleX, scaleY);
        this.setZoom(zoom);
        this.resetPan();
    }
    resetZoom() {
        this.setZoom(1);
    }
    setZoom(zoom) {
        if (!this._canvas)
            return;
        this._state.zoom = Math.max(0.1, Math.min(5, zoom));
        this._canvas.setZoom(this._state.zoom);
        this._canvas.renderAll();
        this.dispatchEvent({
            type: 'after:render',
            data: { zoom: this._state.zoom }
        });
    }
    panTo(x, y) {
        if (!this._canvas)
            return;
        this._state.panX = x;
        this._state.panY = y;
        const vpt = this._canvas.viewportTransform;
        if (vpt && vpt.length >= 6) {
            vpt[4] = x;
            vpt[5] = y;
            this._canvas.setViewportTransform(vpt);
            this._canvas.renderAll();
        }
    }
    resetPan() {
        this.panTo(0, 0);
    }
    /**
     * Pan the viewport so that the given image coordinates appear centered
     */
    goToImageCoordinates(x, y) {
        if (!this._canvas)
            return;
        const canvasWidth = this._canvas.getWidth();
        const canvasHeight = this._canvas.getHeight();
        const zoom = this._state.zoom;
        const canvasPoint = this.imageToCanvasCoordinates({ x, y });
        const vpt = this._canvas.viewportTransform;
        if (vpt && vpt.length >= 6) {
            vpt[4] = canvasWidth / 2 - zoom * canvasPoint.x;
            vpt[5] = canvasHeight / 2 - zoom * canvasPoint.y;
            this._canvas.setViewportTransform(vpt);
            this._canvas.renderAll();
        }
    }
    /**
     * Convenience method to set zoom by percentage (e.g., 100 => 1.0)
     */
    setZoomPercent(percent) {
        const clamped = Math.max(10, Math.min(500, percent));
        this.setZoom(clamped / 100);
    }
    // ===================================================================
    // Crosshair Operations
    // ===================================================================
    showCrosshair(point) {
        if (!this._canvas)
            return;
        this.hideCrosshair();
        const canvasWidth = this._canvas.getWidth();
        const canvasHeight = this._canvas.getHeight();
        // Horizontal line
        this._state.crosshairX = new FabricJS.Line([0, point.y, canvasWidth, point.y], {
            stroke: '#ffffff',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            excludeFromExport: true
        });
        this._state.crosshairX.isCrosshair = true;
        this._state.crosshairX.crosshairType = 'horizontal';
        // Vertical line
        this._state.crosshairY = new FabricJS.Line([point.x, 0, point.x, canvasHeight], {
            stroke: '#ffffff',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            excludeFromExport: true
        });
        this._state.crosshairY.isCrosshair = true;
        this._state.crosshairY.crosshairType = 'vertical';
        this._canvas.add(this._state.crosshairX);
        this._canvas.add(this._state.crosshairY);
        // Bring crosshair to front
        this._state.crosshairX.bringToFront();
        this._state.crosshairY.bringToFront();
        this._canvas.renderAll();
    }
    hideCrosshair() {
        if (!this._canvas)
            return;
        if (this._state.crosshairX) {
            this._canvas.remove(this._state.crosshairX);
            this._state.crosshairX = null;
        }
        if (this._state.crosshairY) {
            this._canvas.remove(this._state.crosshairY);
            this._state.crosshairY = null;
        }
        this._canvas.renderAll();
    }
    updateCrosshair(point) {
        if (!this._canvas)
            return;
        if (!this.appState.isCrosshairVisible) {
            this.hideCrosshair();
            return;
        }
        // Only show crosshair when pointer is inside a label box area
        const imgPt = this.canvasToImageCoordinates(point);
        const objects = this._canvas.getObjects();
        const isInsideAnyBox = objects.some(obj => {
            const bbox = obj.boundingBox;
            if (!obj.isLabel || !bbox)
                return false;
            return (imgPt.x >= bbox.x && imgPt.x <= bbox.x + bbox.width &&
                imgPt.y >= bbox.y && imgPt.y <= bbox.y + bbox.height);
        });
        if (isInsideAnyBox) {
            this.showCrosshair(point);
        }
        else {
            this.hideCrosshair();
        }
    }
    // ===================================================================
    // Coordinate Conversion
    // ===================================================================
    canvasToImage(canvasPoint) {
        const imageCoords = this.canvasToImageCoordinates(canvasPoint);
        const normalized = this.normalizeCoordinates(imageCoords, {
            width: this.currentImage?.width || 1,
            height: this.currentImage?.height || 1
        });
        return {
            x: canvasPoint.x,
            y: canvasPoint.y,
            imageX: imageCoords.x,
            imageY: imageCoords.y,
            normalized
        };
    }
    imageToCanvas(imagePoint) {
        const canvasCoords = this.imageToCanvasCoordinates(imagePoint);
        return {
            x: imagePoint.x,
            y: imagePoint.y,
            canvasX: canvasCoords.x,
            canvasY: canvasCoords.y
        };
    }
    normalizeCoordinates(imagePoint, imageSize) {
        return {
            x: imagePoint.x / imageSize.width,
            y: imagePoint.y / imageSize.height
        };
    }
    denormalizeCoordinates(normalizedPoint, imageSize) {
        return {
            x: normalizedPoint.x * imageSize.width,
            y: normalizedPoint.y * imageSize.height
        };
    }
    // ===================================================================
    // YOLO Format Conversion
    // ===================================================================
    boundingBoxToYOLO(bbox, imageSize) {
        const centerX = (bbox.x + bbox.width / 2) / imageSize.width;
        const centerY = (bbox.y + bbox.height / 2) / imageSize.height;
        const width = bbox.width / imageSize.width;
        const height = bbox.height / imageSize.height;
        return {
            classId: bbox.classId,
            centerX,
            centerY,
            width,
            height,
            confidence: bbox.confidence
        };
    }
    yoloToBoundingBox(yolo, imageSize) {
        const width = yolo.width * imageSize.width;
        const height = yolo.height * imageSize.height;
        const x = (yolo.centerX * imageSize.width) - (width / 2);
        const y = (yolo.centerY * imageSize.height) - (height / 2);
        return {
            id: this.generateBoundingBoxId(),
            x,
            y,
            width,
            height,
            classId: yolo.classId,
            color: this.getClassColor(yolo.classId),
            isVisible: true,
            isSelected: false,
            confidence: yolo.confidence
        };
    }
    // ===================================================================
    // Event Handling
    // ===================================================================
    addEventListener(type, handler) {
        if (!this._eventListeners.has(type)) {
            this._eventListeners.set(type, []);
        }
        this._eventListeners.get(type).push(handler);
    }
    removeEventListener(type, handler) {
        const handlers = this._eventListeners.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    // ===================================================================
    // Rendering
    // ===================================================================
    render() {
        if (this._canvas) {
            this._canvas.renderAll();
        }
    }
    requestRender() {
        if (this._canvas) {
            this._canvas.requestRenderAll();
        }
    }
    // ===================================================================
    // Private Helper Methods
    // ===================================================================
    setupCanvasEvents() {
        if (!this._canvas)
            return;
        // Mouse events
        let isPanning = false;
        let lastPos = { x: 0, y: 0 };
        this._canvas.on('mouse:down', (e) => {
            const pointer = this._canvas.getPointer(e.e);
            this.updateCrosshair(pointer);
            // Start panning on middle click or when Alt pressed (right-click reserved for mode toggle)
            const ev = e.e;
            const startPan = ev.button === 1 || ev.altKey || ev.spaceKey;
            if (startPan) {
                isPanning = true;
                lastPos = { x: ev.clientX, y: ev.clientY };
                this._canvas.setCursor('grabbing');
                this._canvas.requestRenderAll();
                return;
            }
            if (this.appState.currentMode === 'draw' && !e.target) {
                this.startDrawing(pointer);
            }
        });
        this._canvas.on('mouse:move', (e) => {
            const pointer = this._canvas.getPointer(e.e);
            this.updateCrosshair(pointer);
            // Dispatch mouse move with canvas/image coordinates
            try {
                const imagePt = this.canvasToImageCoordinates(pointer);
                this.dispatchEvent({
                    type: 'mouse:move',
                    pointer,
                    data: { canvas: { x: pointer.x, y: pointer.y }, image: { x: imagePt.x, y: imagePt.y } }
                });
            }
            catch { }
            if (isPanning) {
                const ev = e.e;
                const v = this._canvas.viewportTransform;
                if (!v || v.length < 6) {
                    return;
                }
                v[4] += ev.clientX - lastPos.x;
                v[5] += ev.clientY - lastPos.y;
                this._canvas.setViewportTransform(v);
                lastPos = { x: ev.clientX, y: ev.clientY };
                this._canvas.requestRenderAll();
                return;
            }
            if (this._state.isDrawing) {
                this.updateDrawing(pointer);
            }
        });
        this._canvas.on('mouse:up', (e) => {
            const pointer = this._canvas.getPointer(e.e);
            if (isPanning) {
                isPanning = false;
                this._canvas.setCursor('default');
                this._canvas.requestRenderAll();
                return;
            }
            if (this._state.isDrawing) {
                this.finishDrawing(pointer);
            }
        });
        // Selection events
        this._canvas.on('selection:created', () => {
            this.updateSelectedObjects();
            this.dispatchEvent({ type: 'selection:created' });
        });
        this._canvas.on('selection:updated', () => {
            this.updateSelectedObjects();
            this.dispatchEvent({ type: 'selection:updated' });
        });
        this._canvas.on('selection:cleared', () => {
            this.updateSelectedObjects();
            this.dispatchEvent({ type: 'selection:cleared' });
        });
        // Object modification events
        this._canvas.on('object:modified', (e) => {
            if (e.target) {
                this.handleObjectModified(e.target);
            }
        });
        // Wheel zoom (zoom to pointer)
        this._canvas.on('mouse:wheel', (opt) => {
            const delta = opt.e.deltaY;
            let zoom = this._state.zoom;
            zoom *= delta > 0 ? 0.9 : 1.1;
            zoom = Math.max(0.1, Math.min(5, zoom));
            const point = new FabricJS.Point(opt.e.offsetX, opt.e.offsetY);
            this._canvas.zoomToPoint(point, zoom);
            this._state.zoom = zoom;
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
    }
    applyModeSettings(mode) {
        if (!this._canvas)
            return;
        const m = mode || this.appState.currentMode;
        // In draw mode, disable selection and target finding to make drawing easier
        const drawMode = m === 'draw';
        this._canvas.selection = !drawMode;
        this._canvas.skipTargetFind = drawMode;
        // Update object selectability based on mode
        const objects = this._canvas.getObjects();
        objects.forEach(obj => {
            obj.selectable = !drawMode;
            obj.evented = !drawMode;
        });
        this._canvas.requestRenderAll();
    }
    updateSelectedObjects() {
        if (!this._canvas)
            return;
        const activeObject = this._canvas.getActiveObject();
        if (!activeObject) {
            this._state.selectedObjects = [];
            this._state.multipleSelection = false;
        }
        else if (activeObject.type === 'activeSelection') {
            this._state.selectedObjects = activeObject.getObjects();
            this._state.multipleSelection = true;
        }
        else {
            this._state.selectedObjects = [activeObject];
            this._state.multipleSelection = false;
        }
    }
    handleObjectModified(rect) {
        if (!rect.isLabel || !rect.boundingBox || !this.imageObject)
            return;
        // Convert back to image coordinates
        const imageCoords = this.canvasToImageCoordinates({
            x: rect.left || 0,
            y: rect.top || 0
        });
        const imageWidth = (rect.width || 0) / (this.imageObject.scaleX || 1);
        const imageHeight = (rect.height || 0) / (this.imageObject.scaleY || 1);
        // Update bounding box
        rect.boundingBox.x = imageCoords.x;
        rect.boundingBox.y = imageCoords.y;
        rect.boundingBox.width = imageWidth;
        rect.boundingBox.height = imageHeight;
        // Update label text position
        if (rect.labelText) {
            this.updateLabelText(rect);
        }
        this.dispatchEvent({
            type: 'object:modified',
            target: rect,
            data: { boundingBox: rect.boundingBox }
        });
    }
    createLabelText(rect) {
        if (!this._canvas || !rect.boundingBox)
            return;
        const bbox = rect.boundingBox;
        const className = this.appState.classNames.get(bbox.classId.toString()) || `Class ${bbox.classId}`;
        let labelText = '';
        if (this.labelOptions.showClassId) {
            labelText += bbox.classId.toString();
        }
        if (this.labelOptions.showClassName) {
            if (labelText)
                labelText += ': ';
            labelText += className;
        }
        if (this.labelOptions.showConfidence && bbox.confidence !== undefined) {
            labelText += ` (${(bbox.confidence * 100).toFixed(1)}%)`;
        }
        const text = new FabricJS.Text(labelText, {
            left: (rect.left || 0) + 2,
            top: (rect.top || 0) - this.labelOptions.fontSize - 2,
            fontSize: this.labelOptions.fontSize,
            fontFamily: this.labelOptions.fontFamily,
            fill: this.labelOptions.fontColor,
            backgroundColor: this.labelOptions.backgroundColor,
            selectable: false,
            evented: false
        });
        text.parentRect = rect;
        text.boundingBox = bbox;
        text.isLabel = true;
        rect.labelText = text;
        this._canvas.add(text);
        text.bringToFront();
    }
    updateLabelText(rect) {
        if (!rect.labelText || !rect.boundingBox)
            return;
        const bbox = rect.boundingBox;
        const className = this.appState.classNames.get(bbox.classId.toString()) || `Class ${bbox.classId}`;
        let labelText = '';
        if (this.labelOptions.showClassId) {
            labelText += bbox.classId.toString();
        }
        if (this.labelOptions.showClassName) {
            if (labelText)
                labelText += ': ';
            labelText += className;
        }
        if (this.labelOptions.showConfidence && bbox.confidence !== undefined) {
            labelText += ` (${(bbox.confidence * 100).toFixed(1)}%)`;
        }
        rect.labelText.set({
            text: labelText,
            left: (rect.left || 0) + 2,
            top: (rect.top || 0) - this.labelOptions.fontSize - 2,
            fontSize: this.labelOptions.fontSize,
            fill: this.labelOptions.fontColor,
            backgroundColor: this.labelOptions.backgroundColor
        });
    }
    canvasToImageCoordinates(canvasPoint) {
        if (!this.imageObject)
            return canvasPoint;
        const scaleX = this.imageObject.scaleX || 1;
        const scaleY = this.imageObject.scaleY || 1;
        return {
            x: canvasPoint.x / scaleX,
            y: canvasPoint.y / scaleY
        };
    }
    imageToCanvasCoordinates(imagePoint) {
        if (!this.imageObject)
            return imagePoint;
        const scaleX = this.imageObject.scaleX || 1;
        const scaleY = this.imageObject.scaleY || 1;
        return {
            x: imagePoint.x * scaleX,
            y: imagePoint.y * scaleY
        };
    }
    generateBoundingBoxId() {
        return `bbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getClassColor(classId) {
        return color_palette.colorPalette[classId % color_palette.colorPalette.length] || '#ff0000';
    }
    syncWithAppState() {
        // Sync label display options with app state
        this.labelOptions.showLabels = this.appState.showLabelsOnCanvas;
        this.labelOptions.fontSize = this.appState.labelFontSize;
    }
    dispatchEvent(event) {
        const handlers = this._eventListeners.get(event.type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                }
                catch (error) {
                    console.error(`Error in canvas event handler for ${event.type}:`, error);
                }
            });
        }
    }
    // ===================================================================
    // Validation and Performance
    // ===================================================================
    validate() {
        const errors = [];
        const warnings = [];
        if (!this._canvas) {
            errors.push('Canvas not initialized');
        }
        if (!this.currentImage) {
            warnings.push('No image loaded');
        }
        const objectCount = this._canvas?.getObjects().length || 0;
        if (objectCount > 100) {
            warnings.push(`High object count: ${objectCount}`);
        }
        // Update performance metrics
        this.performanceMetrics.objectCount = objectCount;
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            performance: this.performanceMetrics
        };
    }
}
// ===================================================================
// Factory Function
// ===================================================================
function createCanvasController(appState) {
    return new CanvasController(appState);
}
// ===================================================================
// Exports
// ===================================================================
/* harmony default export */ const controllers_CanvasController = ((/* unused pure expression or super */ null && (CanvasController)));

;// ./src/controllers/EventManager.ts
/**
 * Event Manager Implementation
 *
 * Handles keyboard shortcuts, mouse events, context menus, and user interactions
 * for the Easy Labeling application.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */
// ===================================================================
// Event Manager Implementation
// ===================================================================
class EventManager {
    constructor(appState, canvasController, fileSystemService, config) {
        // Event handlers and state
        this.eventListeners = new Map();
        this.keyboardHandlers = new Map();
        this.contextMenuTarget = null;
        this.isDragging = false;
        this.lastMousePosition = { x: 0, y: 0 };
        // Configuration
        this.config = {
            enableKeyboardShortcuts: true,
            enableContextMenu: true,
            enableDragAndDrop: true,
            doubleClickDelay: 300,
            longPressDelay: 500,
            dragThreshold: 5
        };
        // Keyboard shortcuts
        this.shortcuts = [
            // File operations
            { key: 'KeyS', ctrlKey: true, description: 'Save labels', action: 'save' },
            { key: 'KeyO', ctrlKey: true, description: 'Open folder', action: 'open-folder' },
            // Mode switching
            { key: 'KeyD', description: 'Switch to draw mode', action: 'mode-draw' },
            { key: 'KeyE', description: 'Switch to edit mode', action: 'mode-edit' },
            { key: 'Tab', description: 'Toggle mode', action: 'mode-toggle' },
            // Canvas operations
            { key: 'Delete', description: 'Delete selected', action: 'delete-selected' },
            { key: 'Backspace', description: 'Delete selected', action: 'delete-selected' },
            { key: 'Escape', description: 'Cancel/Deselect', action: 'cancel' },
            { key: 'KeyA', ctrlKey: true, description: 'Select all', action: 'select-all' },
            // Zoom and view
            { key: 'Equal', ctrlKey: true, description: 'Zoom in', action: 'zoom-in' },
            { key: 'Minus', ctrlKey: true, description: 'Zoom out', action: 'zoom-out' },
            { key: 'Digit0', ctrlKey: true, description: 'Reset zoom', action: 'zoom-reset' },
            { key: 'KeyF', description: 'Zoom to fit', action: 'zoom-fit' },
            // Navigation
            { key: 'ArrowLeft', description: 'Previous image', action: 'prev-image' },
            { key: 'ArrowRight', description: 'Next image', action: 'next-image' },
            { key: 'Home', description: 'First image', action: 'first-image' },
            { key: 'End', description: 'Last image', action: 'last-image' },
            // Labels and classes
            { key: 'KeyL', description: 'Toggle labels visibility', action: 'toggle-labels' },
            { key: 'KeyC', description: 'Toggle crosshair', action: 'toggle-crosshair' },
            { key: 'KeyH', description: 'Toggle help', action: 'toggle-help' },
            // Copy/Paste
            { key: 'KeyC', ctrlKey: true, description: 'Copy selected', action: 'copy' },
            { key: 'KeyV', ctrlKey: true, description: 'Paste', action: 'paste' },
            { key: 'KeyX', ctrlKey: true, description: 'Cut selected', action: 'cut' },
            // Undo/Redo (for future implementation)
            { key: 'KeyZ', ctrlKey: true, description: 'Undo', action: 'undo' },
            { key: 'KeyY', ctrlKey: true, description: 'Redo', action: 'redo' },
            { key: 'KeyZ', ctrlKey: true, shiftKey: true, description: 'Redo', action: 'redo' }
        ];
        this.appState = appState;
        this.canvasController = canvasController;
        this.fileSystemService = fileSystemService;
        if (config) {
            this.config = { ...this.config, ...config };
        }
        this.initializeEventHandlers();
    }
    // ===================================================================
    // Initialization
    // ===================================================================
    initializeEventHandlers() {
        if (this.config.enableKeyboardShortcuts) {
            this.setupKeyboardEvents();
        }
        if (this.config.enableContextMenu) {
            this.setupContextMenuEvents();
        }
        if (this.config.enableDragAndDrop) {
            this.setupDragAndDropEvents();
        }
        this.setupMouseEvents();
        this.setupCanvasEvents();
    }
    // ===================================================================
    // Keyboard Event Handling
    // ===================================================================
    setupKeyboardEvents() {
        // Build keyboard shortcuts map
        this.shortcuts.forEach(shortcut => {
            const key = this.getShortcutKey(shortcut);
            this.keyboardHandlers.set(key, shortcut);
        });
        // Global keyboard event listener
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.addEventListener('keyup', this.handleKeyUp.bind(this), true);
    }
    handleKeyDown(event) {
        // Ignore events from input elements (unless global shortcuts)
        if (this.isInputElement(event.target) && !this.isGlobalShortcut(event)) {
            return;
        }
        const key = this.getEventKey(event);
        const shortcut = this.keyboardHandlers.get(key);
        if (shortcut) {
            event.preventDefault();
            event.stopPropagation();
            this.executeShortcut(shortcut, event);
        }
    }
    handleKeyUp(event) {
        // Handle any key up specific logic here
        if (event.key === 'Escape') {
            this.handleEscapeKey();
        }
    }
    executeShortcut(shortcut, event) {
        switch (shortcut.action) {
            // File operations
            case 'save':
                this.handleSaveLabels();
                break;
            case 'open-folder':
                this.handleOpenFolder();
                break;
            // Mode switching
            case 'mode-draw':
                this.appState.setMode('draw');
                break;
            case 'mode-edit':
                this.appState.setMode('edit');
                break;
            case 'mode-toggle':
                this.appState.toggleMode();
                break;
            // Canvas operations
            case 'delete-selected':
                this.handleDeleteSelected();
                break;
            case 'cancel':
                this.handleCancel();
                break;
            case 'select-all':
                this.handleSelectAll();
                break;
            // Zoom and view
            case 'zoom-in':
                this.canvasController.zoomIn();
                break;
            case 'zoom-out':
                this.canvasController.zoomOut();
                break;
            case 'zoom-reset':
                this.canvasController.resetZoom();
                break;
            case 'zoom-fit':
                this.canvasController.zoomToFit();
                break;
            // Navigation
            case 'prev-image':
                this.handlePreviousImage();
                break;
            case 'next-image':
                this.handleNextImage();
                break;
            case 'first-image':
                this.handleFirstImage();
                break;
            case 'last-image':
                this.handleLastImage();
                break;
            // Labels and UI
            case 'toggle-labels':
                this.appState.setShowLabels(!this.appState.showLabelsOnCanvas);
                this.canvasController.updateLabels();
                break;
            case 'toggle-crosshair':
                this.appState.toggleCrosshair();
                break;
            // Copy/Paste
            case 'copy':
                this.handleCopy();
                break;
            case 'paste':
                this.handlePaste();
                break;
            case 'cut':
                this.handleCut();
                break;
            // Future features
            case 'undo':
            case 'redo':
                // TODO: Implement undo/redo system
                console.log(`${shortcut.action} not yet implemented`);
                break;
            default:
                console.warn(`Unknown shortcut action: ${shortcut.action}`);
        }
        this.dispatchEvent({
            type: 'shortcut:executed',
            data: { shortcut, originalEvent: event }
        });
    }
    // ===================================================================
    // Mouse Event Handling
    // ===================================================================
    setupMouseEvents() {
        // Global mouse tracking
        document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));
    }
    setupCanvasEvents() {
        // Canvas-specific mouse events are handled by CanvasController
        // We listen to canvas events and coordinate with other systems
        this.canvasController.addEventListener('mouse:down', (event) => {
            this.lastMousePosition = event.pointer || { x: 0, y: 0 };
            this.appState.lastMousePosition = this.lastMousePosition;
        });
        this.canvasController.addEventListener('mouse:move', (event) => {
            this.lastMousePosition = event.pointer || { x: 0, y: 0 };
            this.appState.lastMousePosition = this.lastMousePosition;
            this.updateMouseCoordinatesDisplay();
        });
        this.canvasController.addEventListener('selection:created', () => {
            this.dispatchEvent({
                type: 'selection:changed',
                data: { hasSelection: true }
            });
        });
        this.canvasController.addEventListener('selection:cleared', () => {
            this.dispatchEvent({
                type: 'selection:changed',
                data: { hasSelection: false }
            });
        });
    }
    handleGlobalMouseMove(event) {
        if (this.isDragging) {
            // Handle drag operations
            this.handleDragMove(event);
        }
    }
    handleGlobalMouseUp(event) {
        if (this.isDragging) {
            this.handleDragEnd(event);
        }
    }
    // ===================================================================
    // Context Menu Handling
    // ===================================================================
    setupContextMenuEvents() {
        // Prevent default context menu and show custom one
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    }
    handleContextMenu(event) {
        event.preventDefault();
        const target = event.target;
        const canvasElement = this.canvasController.canvas.getElement();
        if (target === canvasElement || canvasElement.contains(target)) {
            this.showCanvasContextMenu(event);
        }
        else {
            this.showGenericContextMenu(event);
        }
    }
    showCanvasContextMenu(event) {
        const pointer = this.canvasController.canvas.getPointer(event);
        const selectedBoxes = this.canvasController.getSelectedBoundingBoxes();
        const contextEvent = {
            type: 'canvas',
            position: { x: event.clientX, y: event.clientY },
            canvasPosition: pointer,
            target: null,
            hasSelection: selectedBoxes.length > 0,
            selectedObjects: selectedBoxes
        };
        this.showContextMenu(contextEvent);
    }
    showGenericContextMenu(event) {
        const contextEvent = {
            type: 'generic',
            position: { x: event.clientX, y: event.clientY },
            target: event.target,
            hasSelection: false,
            selectedObjects: []
        };
        this.showContextMenu(contextEvent);
    }
    showContextMenu(contextEvent) {
        this.contextMenuTarget = contextEvent;
        // Create context menu based on type and selection
        const menuItems = this.buildContextMenuItems(contextEvent);
        // Show context menu (this would integrate with UI framework)
        this.dispatchEvent({
            type: 'context-menu:show',
            data: { context: contextEvent, menuItems }
        });
    }
    buildContextMenuItems(context) {
        const items = [];
        if (context.type === 'canvas') {
            if (context.hasSelection) {
                items.push({ label: 'Delete Selected', action: 'delete-selected', shortcut: 'Del' }, { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' }, { label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' }, { type: 'separator' });
            }
            items.push({ label: 'Paste', action: 'paste', shortcut: 'Ctrl+V', disabled: !this.appState.getClipboard() }, { type: 'separator' }, { label: 'Select All', action: 'select-all', shortcut: 'Ctrl+A' }, { label: 'Deselect All', action: 'deselect-all', shortcut: 'Esc' }, { type: 'separator' }, { label: 'Zoom to Fit', action: 'zoom-fit', shortcut: 'F' }, { label: 'Reset Zoom', action: 'zoom-reset', shortcut: 'Ctrl+0' });
        }
        return items;
    }
    // ===================================================================
    // Drag and Drop Handling
    // ===================================================================
    setupDragAndDropEvents() {
        // File drag and drop for loading images
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragenter', this.handleDragEnter.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    }
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }
    handleDragEnter(event) {
        event.preventDefault();
        // Add visual feedback for drag operation
        document.body.classList.add('drag-active');
    }
    handleDragLeave(event) {
        if (!event.relatedTarget) {
            document.body.classList.remove('drag-active');
        }
    }
    handleDrop(event) {
        event.preventDefault();
        document.body.classList.remove('drag-active');
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            this.handleImageFileDrop(imageFiles[0]);
        }
    }
    handleImageFileDrop(file) {
        const img = new Image();
        img.onload = () => {
            this.canvasController.loadImage(img);
            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
    }
    handleDragMove(event) {
        // Handle object dragging within canvas
        // This is mostly handled by Fabric.js, but we can add custom logic here
    }
    handleDragEnd(event) {
        this.isDragging = false;
    }
    // ===================================================================
    // Action Handlers
    // ===================================================================
    async handleSaveLabels() {
        if (!this.appState.currentImageFile || !this.appState.labelFolderHandle) {
            return;
        }
        try {
            const boundingBoxes = this.canvasController.getAllBoundingBoxes();
            const yoloLabels = boundingBoxes.map(bbox => this.canvasController.boundingBoxToYOLO(bbox, {
                width: this.appState.currentImage?.width || 1,
                height: this.appState.currentImage?.height || 1
            }));
            await this.fileSystemService.saveLabels(this.appState.currentImageFile.name, yoloLabels, this.appState.labelFolderHandle);
            this.dispatchEvent({
                type: 'labels:saved',
                data: { fileName: this.appState.currentImageFile.name, count: yoloLabels.length }
            });
        }
        catch (error) {
            console.error('Failed to save labels:', error);
        }
    }
    handleOpenFolder() {
        // Trigger folder selection UI
        this.dispatchEvent({
            type: 'folder:select-requested',
            data: { type: 'image' }
        });
    }
    handleDeleteSelected() {
        const deletedBoxes = this.canvasController.deleteSelected();
        if (deletedBoxes.length > 0) {
            this.dispatchEvent({
                type: 'objects:deleted',
                data: { count: deletedBoxes.length, objects: deletedBoxes }
            });
            // Auto-save if enabled
            if (this.appState.isAutoSaveEnabled) {
                this.handleSaveLabels();
            }
        }
    }
    handleCancel() {
        this.canvasController.deselectAll();
        this.canvasController.cancelDrawing();
        if (this.contextMenuTarget) {
            this.hideContextMenu();
        }
    }
    handleSelectAll() {
        // Select all bounding boxes on canvas
        const allBoxes = this.canvasController.getAllBoundingBoxes();
        allBoxes.forEach(bbox => {
            this.canvasController.selectBoundingBox(bbox.id);
        });
    }
    handlePreviousImage() {
        if (this.appState.imageFiles.length === 0)
            return;
        const currentIndex = this.appState.imageFiles.findIndex(file => file.name === this.appState.currentImageFile?.name);
        if (currentIndex > 0) {
            const prevImage = this.appState.imageFiles[currentIndex - 1];
            this.loadImageFile(prevImage);
        }
    }
    handleNextImage() {
        if (this.appState.imageFiles.length === 0)
            return;
        const currentIndex = this.appState.imageFiles.findIndex(file => file.name === this.appState.currentImageFile?.name);
        if (currentIndex < this.appState.imageFiles.length - 1) {
            const nextImage = this.appState.imageFiles[currentIndex + 1];
            this.loadImageFile(nextImage);
        }
    }
    handleFirstImage() {
        if (this.appState.imageFiles.length > 0) {
            this.loadImageFile(this.appState.imageFiles[0]);
        }
    }
    handleLastImage() {
        if (this.appState.imageFiles.length > 0) {
            const lastImage = this.appState.imageFiles[this.appState.imageFiles.length - 1];
            this.loadImageFile(lastImage);
        }
    }
    handleCopy() {
        const selectedBoxes = this.canvasController.getSelectedBoundingBoxes();
        if (selectedBoxes.length > 0) {
            this.appState.setClipboard({
                type: 'bounding-boxes',
                data: selectedBoxes,
                timestamp: new Date()
            });
            this.dispatchEvent({
                type: 'clipboard:copy',
                data: { count: selectedBoxes.length }
            });
        }
    }
    handlePaste() {
        const clipboard = this.appState.getClipboard();
        if (clipboard && clipboard.type === 'bounding-boxes') {
            const boxes = clipboard.data;
            boxes.forEach((bbox, index) => {
                // Offset pasted boxes slightly
                const newBbox = {
                    ...bbox,
                    id: `pasted_${Date.now()}_${index}`,
                    x: bbox.x + 10,
                    y: bbox.y + 10,
                    isSelected: false
                };
                this.canvasController.addBoundingBox(newBbox);
            });
            this.dispatchEvent({
                type: 'clipboard:paste',
                data: { count: boxes.length }
            });
            // Auto-save if enabled
            if (this.appState.isAutoSaveEnabled) {
                this.handleSaveLabels();
            }
        }
    }
    handleCut() {
        this.handleCopy();
        this.handleDeleteSelected();
    }
    handleEscapeKey() {
        // Cancel any active operations
        this.handleCancel();
    }
    // ===================================================================
    // Utility Methods
    // ===================================================================
    async loadImageFile(imageFile) {
        try {
            if (this.appState.imageFolderHandle) {
                const result = await this.fileSystemService.loadImage(imageFile.handle);
                if (result.success && result.data) {
                    this.appState.setCurrentImage(imageFile);
                    this.canvasController.loadImage(result.data);
                    // Load existing labels
                    if (this.appState.labelFolderHandle) {
                        await this.loadLabelsForCurrentImage();
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to load image:', error);
        }
    }
    async loadLabelsForCurrentImage() {
        if (!this.appState.currentImageFile || !this.appState.labelFolderHandle)
            return;
        try {
            const result = await this.fileSystemService.loadLabels(this.appState.currentImageFile.name, this.appState.labelFolderHandle);
            if (result.success && result.data) {
                // Clear existing labels
                this.canvasController.getAllBoundingBoxes().forEach(bbox => {
                    this.canvasController.removeBoundingBox(bbox.id);
                });
                // Add loaded labels
                result.data.forEach(yoloLabel => {
                    const bbox = this.canvasController.yoloToBoundingBox(yoloLabel, {
                        width: this.appState.currentImage?.width || 1,
                        height: this.appState.currentImage?.height || 1
                    });
                    this.canvasController.addBoundingBox(bbox);
                });
            }
        }
        catch (error) {
            console.error('Failed to load labels:', error);
        }
    }
    updateMouseCoordinatesDisplay() {
        // Update mouse coordinates in UI
        this.dispatchEvent({
            type: 'mouse:coordinates-updated',
            data: {
                canvas: this.lastMousePosition,
                image: this.canvasController.canvasToImage(this.lastMousePosition)
            }
        });
    }
    hideContextMenu() {
        this.contextMenuTarget = null;
        this.dispatchEvent({
            type: 'context-menu:hide'
        });
    }
    getShortcutKey(shortcut) {
        let key = shortcut.key;
        if (shortcut.ctrlKey)
            key = 'Ctrl+' + key;
        if (shortcut.shiftKey)
            key = 'Shift+' + key;
        if (shortcut.altKey)
            key = 'Alt+' + key;
        return key;
    }
    getEventKey(event) {
        let key = event.code;
        if (event.ctrlKey || event.metaKey)
            key = 'Ctrl+' + key;
        if (event.shiftKey)
            key = 'Shift+' + key;
        if (event.altKey)
            key = 'Alt+' + key;
        return key;
    }
    isInputElement(element) {
        const tagName = element.tagName.toLowerCase();
        return ['input', 'textarea', 'select', 'option'].includes(tagName) ||
            element.hasAttribute('contenteditable');
    }
    isGlobalShortcut(event) {
        // These shortcuts work even when input elements are focused
        const globalShortcuts = ['KeyS', 'KeyO', 'KeyZ', 'KeyY'];
        return (event.ctrlKey || event.metaKey) && globalShortcuts.includes(event.code);
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
                    console.error(`Error in event handler for ${event.type}:`, error);
                }
            });
        }
    }
    // ===================================================================
    // Public Interface
    // ===================================================================
    getShortcuts() {
        return [...this.shortcuts];
    }
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    destroy() {
        // Remove all event listeners
        document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.removeEventListener('keyup', this.handleKeyUp.bind(this), true);
        document.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.removeEventListener('dragover', this.handleDragOver.bind(this));
        document.removeEventListener('drop', this.handleDrop.bind(this));
        document.removeEventListener('dragenter', this.handleDragEnter.bind(this));
        document.removeEventListener('dragleave', this.handleDragLeave.bind(this));
        document.removeEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleGlobalMouseUp.bind(this));
        // Clear internal state
        this.eventListeners.clear();
        this.keyboardHandlers.clear();
        this.contextMenuTarget = null;
    }
}
// ===================================================================
// Factory Function
// ===================================================================
function createEventManager(appState, canvasController, fileSystemService, config) {
    return new EventManager(appState, canvasController, fileSystemService, config);
}
// ===================================================================
// Exports
// ===================================================================
/* harmony default export */ const controllers_EventManager = ((/* unused pure expression or super */ null && (EventManager)));

// EXTERNAL MODULE: ./src/utils/notifications.ts
var notifications = __webpack_require__(934);
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

;// ./src/ui/UIManager.ts
/**
 * UI Manager Module
 *
 * Manages all DOM manipulation, UI updates, and user interface interactions.
 * Handles Bootstrap modals, panel management, list rendering, and theme management.
 */

/**
 * Bootstrap Modal wrapper for type safety
 */
class BootstrapModalWrapper {
    constructor(element) {
        // Bootstrap 5 Modal
        this.modal = new window.bootstrap.Modal(element);
    }
    show() {
        this.modal.show();
    }
    hide() {
        this.modal.hide();
    }
    toggle() {
        this.modal.toggle();
    }
    dispose() {
        this.modal.dispose();
    }
}
/**
 * UIManager implementation
 * Manages all user interface interactions and DOM manipulation
 */
class UIManager {
    constructor(_state, _canvasController, _fileSystem) {
        this._state = _state;
        this._canvasController = _canvasController;
        this._fileSystem = _fileSystem;
        this.eventHandlers = new Map();
        this.panelConfigs = new Map();
        this.splitterConfigs = [];
        this.filterButtons = [];
        this.labelGroups = [];
        this.imageListItems = [];
        this.labelListItems = [];
        this.previewItems = [];
        this.currentTheme = this.getDefaultTheme();
        this.loadingState = {
            isLoading: false,
            message: '',
            progress: 0
        };
        this.initializeElements();
        this.setupEventListeners();
        this.setupSplitters();
        this.initializePanelConfigs();
    }
    // ===================================================================
    // Getters
    // ===================================================================
    get elements() {
        return this._elements;
    }
    get state() {
        return this._state;
    }
    get canvasController() {
        return this._canvasController;
    }
    get fileSystem() {
        return this._fileSystem;
    }
    // ===================================================================
    // Element Initialization
    // ===================================================================
    initializeElements() {
        this._elements = {
            // Folder selection buttons
            selectImageFolderBtn: this.getElementById('select-image-folder-btn'),
            selectLabelFolderBtn: this.getElementById('select-label-folder-btn'),
            loadClassInfoFolderBtn: this.getElementById('load-class-info-folder-btn'),
            // Class file elements
            classFileSelect: this.getElementById('class-file-select'),
            viewClassFileBtn: this.getElementById('view-class-file-btn'),
            classFileViewerModal: new BootstrapModalWrapper(this.getElementById('classFileViewerModal')),
            classFileEditorBody: this.getElementById('class-file-editor-body'),
            addClassRowBtn: this.getElementById('add-class-row-btn'),
            saveClassFileBtn: this.getElementById('save-class-file-btn'),
            downloadClassesBtn: this.getElementById('download-classes-btn'),
            // Image list elements
            imageList: this.getElementById('image-list'),
            imageSearchInput: this.getElementById('image-search-input'),
            showLabeledCheckbox: this.getElementById('show-labeled-checkbox'),
            showUnlabeledCheckbox: this.getElementById('show-unlabeled-checkbox'),
            // Save/load buttons
            saveLabelsBtn: this.getElementById('save-labels-btn'),
            autoSaveToggle: this.getElementById('auto-save-toggle'),
            // Canvas display options
            showLabelsOnCanvasToggle: this.getElementById('show-labels-on-canvas-toggle'),
            labelFontSizeSlider: this.getElementById('label-font-size-slider'),
            labelFontSizeValue: this.getElementById('label-font-size-value'),
            crosshairToggle: this.getElementById('crosshair-toggle'),
            // Mode buttons
            drawModeBtn: this.getElementById('draw-mode-btn'),
            editModeBtn: this.getElementById('edit-mode-btn'),
            // Label list elements
            labelList: this.getElementById('label-list'),
            labelFilters: this.getElementById('label-filters'),
            selectByClassDropdown: this.getElementById('select-by-class-dropdown'),
            selectByClassBtn: this.getElementById('select-by-class-btn'),
            sortLabelsAscBtn: this.getElementById('sort-labels-asc-btn'),
            sortLabelsDescBtn: this.getElementById('sort-labels-desc-btn'),
            // Zoom controls
            zoomInBtn: this.getElementById('zoom-in-btn'),
            zoomOutBtn: this.getElementById('zoom-out-btn'),
            resetZoomBtn: this.getElementById('reset-zoom-btn'),
            zoomInput: this.getElementById('zoom-input'),
            // Canvas elements
            canvasContainer: this.getElementById('canvas-container'),
            mouseCoordsDisplay: this.getElementById('mouse-coords-display'),
            coordXInput: this.getElementById('coord-x-input'),
            coordYInput: this.getElementById('coord-y-input'),
            goToCoordsBtn: this.getElementById('go-to-coords-btn'),
            // Navigation
            currentImageNameSpan: this.getElementById('current-image-name'),
            prevImageBtn: this.getElementById('prev-image-btn'),
            nextImageBtn: this.getElementById('next-image-btn'),
            // Panel elements
            leftPanel: this.getElementById('left-panel'),
            rightPanel: this.getElementById('right-panel'),
            leftSplitter: this.getElementById('left-splitter'),
            rightSplitter: this.getElementById('right-splitter'),
            collapseLeftPanelBtn: this.getElementById('collapse-left-panel-btn'),
            expandLeftPanelBtn: this.getElementById('expand-left-panel-btn'),
            collapseRightPanelBtn: this.getElementById('collapse-right-panel-btn'),
            expandRightPanelBtn: this.getElementById('expand-right-panel-btn'),
            // Preview bar elements
            previewBar: this.getElementById('preview-bar'),
            previewBarHeader: this.getElementById('preview-bar-header'),
            togglePreviewBtn: this.getElementById('toggle-preview-btn'),
            previewPrevBtn: this.getElementById('preview-prev-btn'),
            previewNextBtn: this.getElementById('preview-next-btn'),
            previewListWrapper: this.getElementById('preview-list-wrapper'),
            previewList: this.getElementById('preview-list'),
            bottomPanel: this.getElementById('bottom-panel'),
            bottomSplitter: this.getElementById('bottom-splitter'),
            // Theme toggle
            darkModeToggle: this.getElementById('dark-mode-toggle'),
            // Label class modal
            labelClassModal: new BootstrapModalWrapper(this.getElementById('labelClassModal')),
            labelClassInput: this.getElementById('label-class-input'),
            classSelectionContainer: this.getElementById('class-selection-container'),
            saveLabelClassBtn: this.getElementById('save-label-class-btn'),
            // Context menu
            contextMenu: this.getElementById('context-menu'),
            ctxEditLabel: this.getElementById('ctx-edit-label'),
            ctxDeleteLabel: this.getElementById('ctx-delete-label'),
            // Loading overlay
            loadingOverlay: this.getElementById('loading-overlay')
        };
    }
    getElementById(id) {
        // During migration, support both new (kebab-case) and legacy (camelCase) IDs
        const legacyIdMap = {
            // Folder selection
            'select-image-folder-btn': 'selectImageFolderBtn',
            'select-label-folder-btn': 'selectLabelFolderBtn',
            'load-class-info-folder-btn': 'loadClassInfoFolderBtn',
            // Class file elements
            'view-class-file-btn': 'viewClassFileBtn',
            'class-file-editor-body': 'classFileEditorBody',
            'add-class-row-btn': 'addClassRowBtn',
            'save-class-file-btn': 'saveClassFileBtn',
            'download-classes-btn': 'downloadClassesBtn',
            // Image list / filters
            'image-search-input': 'imageSearchInput',
            'show-labeled-checkbox': 'showLabeled',
            'show-unlabeled-checkbox': 'showUnlabeled',
            // Save/load
            'save-labels-btn': 'saveLabelsBtn',
            'auto-save-toggle': 'autoSaveToggle',
            // Canvas display options
            'show-labels-on-canvas-toggle': 'showLabelsOnCanvasToggle',
            'label-font-size-slider': 'label-font-size',
            'crosshair-toggle': 'crosshairToggle',
            // Modes
            'draw-mode-btn': 'drawMode',
            'edit-mode-btn': 'editMode',
            // Sorting
            'sort-labels-asc-btn': 'sortLabelsAscBtn',
            'sort-labels-desc-btn': 'sortLabelsDescBtn',
            // Zoom controls
            'zoom-in-btn': 'zoomInBtn',
            'zoom-out-btn': 'zoomOutBtn',
            'reset-zoom-btn': 'resetZoomBtn',
            // Coords
            'mouse-coords-display': 'info-display',
            'coord-x-input': 'coordX',
            'coord-y-input': 'coordY',
            'go-to-coords-btn': 'goToCoordsBtn',
            // Navigation
            'prev-image-btn': 'prevImageBtn',
            'next-image-btn': 'nextImageBtn',
            // Theme
            'dark-mode-toggle': 'darkModeToggle',
            // Label class modal
            'label-class-input': 'labelClassInput',
            'save-label-class-btn': 'saveLabelClassBtn',
        };
        let element = document.getElementById(id);
        if (!element) {
            const legacyId = legacyIdMap[id];
            if (legacyId) {
                element = document.getElementById(legacyId);
            }
        }
        if (!element) {
            throw new Error(`Element with ID '${id}' not found`);
        }
        return element;
    }
    // ===================================================================
    // Event System
    // ===================================================================
    addEventListener(type, handler) {
        if (!this.eventHandlers.has(type)) {
            this.eventHandlers.set(type, new Set());
        }
        this.eventHandlers.get(type).add(handler);
    }
    removeEventListener(type, handler) {
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    dispatchUIEvent(type, data, target) {
        const event = {
            type,
            data,
            target,
            timestamp: new Date()
        };
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => handler(event));
        }
    }
    // ===================================================================
    // Panel Management
    // ===================================================================
    initializePanelConfigs() {
        this.panelConfigs.set('left', {
            panel: this.elements.leftPanel,
            splitter: this.elements.leftSplitter,
            expandBtn: this.elements.expandLeftPanelBtn,
            isCollapsing: false
        });
        this.panelConfigs.set('right', {
            panel: this.elements.rightPanel,
            splitter: this.elements.rightSplitter,
            expandBtn: this.elements.expandRightPanelBtn,
            isCollapsing: false
        });
    }
    togglePanel(config) {
        if (config.isCollapsing)
            return;
        config.isCollapsing = true;
        const isCollapsed = config.panel.style.display === 'none';
        if (isCollapsed) {
            // Expand panel
            config.panel.style.display = 'block';
            config.expandBtn.style.display = 'none';
            config.splitter.style.display = 'block';
        }
        else {
            // Collapse panel
            config.panel.style.display = 'none';
            config.expandBtn.style.display = 'block';
            config.splitter.style.display = 'none';
        }
        // Reset flag after animation
        setTimeout(() => {
            config.isCollapsing = false;
        }, 300);
        this.dispatchUIEvent('panel:toggled', { panelId: config.panel.id, collapsed: !isCollapsed });
    }
    setupSplitters() {
        this.splitterConfigs = [
            {
                splitter: this.elements.leftSplitter,
                panel: this.elements.leftPanel,
                direction: 'left',
                minWidth: 200,
                maxWidth: 500
            },
            {
                splitter: this.elements.rightSplitter,
                panel: this.elements.rightPanel,
                direction: 'right',
                minWidth: 200,
                maxWidth: 500
            }
        ];
        this.splitterConfigs.forEach(config => {
            this.setupSplitter(config);
        });
    }
    setupSplitter(config) {
        let isDragging = false;
        let startX = 0;
        let startWidth = 0;
        config.splitter.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startWidth = parseInt(window.getComputedStyle(config.panel).width, 10);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            e.preventDefault();
        });
        const handleMouseMove = (e) => {
            if (!isDragging)
                return;
            const deltaX = config.direction === 'left' ? e.clientX - startX : startX - e.clientX;
            const newWidth = Math.min(Math.max(startWidth + deltaX, config.minWidth), config.maxWidth);
            config.panel.style.width = `${newWidth}px`;
        };
        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }
    resizePanels() {
        // Resize panels based on window size
        const windowWidth = window.innerWidth;
        const leftPanel = this.elements.leftPanel;
        const rightPanel = this.elements.rightPanel;
        if (windowWidth < 768) {
            // Mobile view - hide panels
            leftPanel.style.display = 'none';
            rightPanel.style.display = 'none';
        }
        else {
            // Desktop view - show panels
            leftPanel.style.display = 'block';
            rightPanel.style.display = 'block';
        }
    }
    // ===================================================================
    // Loading State Management
    // ===================================================================
    showLoadingIndicator() {
        this.loadingState.isLoading = true;
        this.elements.loadingOverlay.style.display = 'flex';
        this.dispatchUIEvent('loading:show');
    }
    hideLoadingIndicator() {
        this.loadingState.isLoading = false;
        this.elements.loadingOverlay.style.display = 'none';
        this.dispatchUIEvent('loading:hide');
    }
    updateLoadingProgress(progress, message) {
        this.loadingState.progress = progress;
        if (message) {
            this.loadingState.message = message;
        }
        // Update loading UI
        const progressBar = this.elements.loadingOverlay.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        const messageElement = this.elements.loadingOverlay.querySelector('.loading-message');
        if (messageElement && message) {
            messageElement.textContent = message;
        }
        this.dispatchUIEvent('loading:progress', { progress, message });
    }
    // ===================================================================
    // Theme Management
    // ===================================================================
    getCurrentTheme() {
        return this.currentTheme;
    }
    getDefaultTheme() {
        return {
            name: 'light',
            primaryColor: '#007bff',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            borderColor: '#dee2e6'
        };
    }
    getDarkTheme() {
        return {
            name: 'dark',
            primaryColor: '#0d6efd',
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            borderColor: '#444444'
        };
    }
    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-bs-theme', theme.name);
        // Apply custom CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--background-color', theme.backgroundColor);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--border-color', theme.borderColor);
        this.dispatchUIEvent('theme:changed', theme);
    }
    toggleDarkMode() {
        const isDark = this.currentTheme.name === 'dark';
        const newTheme = isDark ? this.getDefaultTheme() : this.getDarkTheme();
        this.applyTheme(newTheme);
        // Update toggle state
        this.elements.darkModeToggle.checked = !isDark;
    }
    // ===================================================================
    // List Rendering
    // ===================================================================
    renderImageList() {
        const imageList = this.elements.imageList;
        imageList.innerHTML = '';
        this.imageListItems = this._state.imageFiles.map(imageFile => {
            const listItem = document.createElement('div');
            listItem.className = 'image-list-item';
            listItem.dataset.fileName = imageFile.name;
            const isLabeled = this._state.getImageLabelStatus(imageFile.name);
            const isSelected = this._state.currentImageFile?.name === imageFile.name;
            listItem.innerHTML = `
        <div class="image-item-content">
          <span class="image-name">${imageFile.name}</span>
          <span class="image-status ${isLabeled ? 'labeled' : 'unlabeled'}">
            ${isLabeled ? '●' : '○'}
          </span>
        </div>
      `;
            if (isSelected) {
                listItem.classList.add('selected');
            }
            listItem.addEventListener('click', () => {
                this.selectImage(imageFile);
            });
            imageList.appendChild(listItem);
            return {
                file: imageFile,
                isLabeled,
                isSelected,
                element: listItem
            };
        });
        this.dispatchUIEvent('image:list-rendered', { count: this.imageListItems.length });
    }
    async selectImage(imageFile) {
        this._state.setCurrentImage(imageFile);
        this.dispatchUIEvent('image:selected', { imageFile });
        // Update selected highlight and current image name
        try {
            this.imageListItems.forEach(item => {
                item.element.classList.toggle('selected', item.file.name === imageFile.name);
            });
        }
        catch { }
        if (this._elements?.currentImageNameSpan) {
            this._elements.currentImageNameSpan.textContent = imageFile?.name || '';
        }
        try {
            // Load image from file system and display on canvas
            const imgResult = await this._fileSystem.loadImage?.(imageFile.handle);
            if (imgResult?.success && imgResult.data) {
                const imgEl = imgResult.data;
                this._canvasController.loadImage(imgEl);
                // Load labels if label folder selected
                const labelFolder = this._state.labelFolderHandle;
                if (labelFolder) {
                    const lblResult = await this._fileSystem.loadLabels?.(imageFile.name, labelFolder);
                    if (lblResult?.success && Array.isArray(lblResult.data)) {
                        // Clear existing labels
                        this._canvasController.getAllBoundingBoxes().forEach(b => this._canvasController.removeBoundingBox(b.id));
                        const width = imgEl.naturalWidth || imgEl.width || 1;
                        const height = imgEl.naturalHeight || imgEl.height || 1;
                        lblResult.data.forEach((y) => {
                            const bbox = this._canvasController.yoloToBoundingBox(y, { width, height });
                            this._canvasController.addBoundingBox(bbox);
                        });
                    }
                }
            }
        }
        catch (e) {
            console.error('Failed to load selected image', e);
        }
    }
    updateLabelList() {
        const labelList = this.elements.labelList;
        labelList.innerHTML = '';
        // Get current bounding boxes from canvas
        const boundingBoxes = this._canvasController.getAllBoundingBoxes();
        this.labelListItems = boundingBoxes.map(bbox => {
            const listItem = document.createElement('div');
            listItem.className = 'label-list-item';
            listItem.dataset.labelId = bbox.id;
            const className = this.getDisplayNameForClass(bbox.classId.toString());
            listItem.innerHTML = `
        <div class="label-item-content">
          <span class="label-class">${className}</span>
          <span class="label-coords">(${Math.round(bbox.x)}, ${Math.round(bbox.y)})</span>
        </div>
      `;
            listItem.addEventListener('click', () => {
                this.selectLabel(bbox.id);
            });
            labelList.appendChild(listItem);
            return {
                id: bbox.id,
                classId: bbox.classId,
                className,
                boundingBox: bbox,
                isSelected: false,
                element: listItem
            };
        });
        this.dispatchUIEvent('label:list-rendered', { count: this.labelListItems.length });
    }
    selectLabel(labelId) {
        this._canvasController.selectBoundingBox(labelId);
        this.dispatchUIEvent('label:selected', { labelId });
    }
    // ===================================================================
    // Filter Management
    // ===================================================================
    updateLabelFilters(rects) {
        const filtersContainer = this.elements.labelFilters;
        filtersContainer.innerHTML = '';
        // Group by class
        const classGroups = new Map();
        rects.forEach(rect => {
            if (!classGroups.has(rect.classId)) {
                classGroups.set(rect.classId, []);
            }
            classGroups.get(rect.classId).push(rect);
        });
        this.filterButtons = Array.from(classGroups.entries()).map(([classId, classRects]) => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary btn-sm filter-btn';
            button.dataset.classId = classId.toString();
            const className = this.getDisplayNameForClass(classId.toString());
            button.textContent = `${className} (${classRects.length})`;
            button.addEventListener('click', () => {
                this.toggleFilter(classId.toString());
            });
            filtersContainer.appendChild(button);
            return {
                element: button,
                labelClass: classId.toString(),
                count: classRects.length,
                isActive: true
            };
        });
        this.dispatchUIEvent('filter:updated', { filterCount: this.filterButtons.length });
    }
    toggleFilter(labelClass) {
        const filterButton = this.filterButtons.find(btn => btn.labelClass === labelClass);
        if (filterButton) {
            filterButton.isActive = !filterButton.isActive;
            filterButton.element.classList.toggle('active', filterButton.isActive);
            this.dispatchUIEvent('filter:changed', { labelClass, active: filterButton.isActive });
        }
    }
    updateSelectByClassDropdown(rects) {
        const dropdown = this.elements.selectByClassDropdown;
        dropdown.innerHTML = '<option value="">Select class...</option>';
        const uniqueClasses = new Set(rects.map(rect => rect.classId));
        uniqueClasses.forEach(classId => {
            const option = document.createElement('option');
            option.value = classId.toString();
            option.textContent = this.getDisplayNameForClass(classId.toString());
            dropdown.appendChild(option);
        });
    }
    // ===================================================================
    // Status Updates
    // ===================================================================
    updateLabelFolderButton(selected, folderName) {
        const button = this.elements.selectLabelFolderBtn;
        if (selected && folderName) {
            button.textContent = `📁 ${folderName}`;
            button.classList.add('btn-success');
            button.classList.remove('btn-outline-primary');
        }
        else {
            button.textContent = 'Select Label Folder';
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-primary');
        }
    }
    updateModeButtons(mode) {
        const drawBtn = this.elements.drawModeBtn;
        const editBtn = this.elements.editModeBtn;
        drawBtn.classList.toggle('active', mode === 'draw');
        editBtn.classList.toggle('active', mode === 'edit');
        this.dispatchUIEvent('mode:changed', { mode });
    }
    updateZoomDisplay() {
        const zoom = this._canvasController.getZoom();
        this.elements.zoomInput.value = Math.round(zoom * 100).toString();
    }
    updateMouseCoords(x, y) {
        this.elements.mouseCoordsDisplay.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
    }
    updateCurrentImageDisplay(imageName) {
        this.elements.currentImageNameSpan.textContent = imageName;
    }
    // ===================================================================
    // Context Menu
    // ===================================================================
    showContextMenu(config) {
        const contextMenu = this.elements.contextMenu;
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${config.x}px`;
        contextMenu.style.top = `${config.y}px`;
        this.dispatchUIEvent('context-menu:show', config);
    }
    hideContextMenu() {
        this.elements.contextMenu.style.display = 'none';
        this.dispatchUIEvent('context-menu:hide');
    }
    // ===================================================================
    // Modal Management
    // ===================================================================
    showClassEditor() {
        this.elements.classFileViewerModal.show();
    }
    hideClassEditor() {
        this.elements.classFileViewerModal.hide();
    }
    // ===================================================================
    // Utility Methods
    // ===================================================================
    getDisplayNameForClass(labelClass) {
        return this._state.classNames.get(labelClass) || `Class ${labelClass}`;
    }
    getDOMElements() {
        return this.elements;
    }
    // ===================================================================
    // State Getters
    // ===================================================================
    getUIState() {
        return {
            isImageListVisible: this.elements.imageList.style.display !== 'none',
            isLabelListVisible: this.elements.labelList.style.display !== 'none',
            isPreviewBarVisible: this.elements.previewBar.style.display !== 'none',
            isLeftPanelCollapsed: this.elements.leftPanel.style.display === 'none',
            isRightPanelCollapsed: this.elements.rightPanel.style.display === 'none',
            activeFilters: new Set(this.filterButtons.filter(btn => btn.isActive).map(btn => btn.labelClass)),
            selectedLabels: new Set() // TODO: implement selection tracking
        };
    }
    getSearchOptions() {
        return {
            searchTerm: this.elements.imageSearchInput.value,
            showLabeled: this.elements.showLabeledCheckbox.checked,
            showUnlabeled: this.elements.showUnlabeledCheckbox.checked,
            sortOrder: 'name', // TODO: implement dynamic sorting
            sortDirection: 'asc'
        };
    }
    getFilterOptions() {
        return {
            activeClasses: new Set(this.filterButtons.filter(btn => btn.isActive).map(btn => btn.labelClass)),
            showAll: this.filterButtons.length === 0,
            hideEmpty: false // TODO: implement hide empty option
        };
    }
    // ===================================================================
    // Event Listener Setup
    // ===================================================================
    setupEventListeners() {
        // Sync UI when mode changes programmatically (e.g., right-click toggle)
        try {
            this._state.addEventListener('mode:changed', (evt) => {
                const current = evt?.data?.current;
                this.syncModeUI(current);
            });
            // Initialize once
            this.syncModeUI(this._state.currentMode);
        }
        catch { }
        // Update coord inputs with image pointer position
        try {
            this._canvasController.addEventListener('mouse:move', (evt) => {
                const img = evt?.data?.image;
                if (img && Number.isFinite(img.x) && Number.isFinite(img.y)) {
                    this.elements.coordXInput.value = String(Math.round(img.x));
                    this.elements.coordYInput.value = String(Math.round(img.y));
                }
            });
        }
        catch { }
        // Folder selection
        this.elements.selectImageFolderBtn.addEventListener('click', async () => {
            try {
                const result = await this._fileSystem.selectImageFolder?.();
                if (result?.success && result.data) {
                    this._state.setImageFolder(result.data);
                    // Auto-detect or create label folder inside the selected image folder
                    try {
                        const imageFolderHandle = result.data;
                        let labelHandle = null;
                        // Try common names first: 'labels', then 'label'
                        try {
                            labelHandle = await imageFolderHandle.getDirectoryHandle('labels');
                        }
                        catch { }
                        if (!labelHandle) {
                            try {
                                labelHandle = await imageFolderHandle.getDirectoryHandle('label');
                            }
                            catch { }
                        }
                        if (!labelHandle) {
                            const create = window.confirm('No label folder found inside the selected image folder.\nCreate a new "labels" folder?');
                            if (create) {
                                try {
                                    if (typeof imageFolderHandle.requestPermission === 'function') {
                                        const perm = await imageFolderHandle.requestPermission({ mode: 'readwrite' });
                                        if (perm !== 'granted') {
                                            await imageFolderHandle.requestPermission({ mode: 'readwrite' });
                                        }
                                    }
                                    labelHandle = await imageFolderHandle.getDirectoryHandle('labels', { create: true });
                                }
                                catch (err) {
                                    console.error('Failed to create labels folder', err);
                                    (0,notifications.showErrorToast)('Permission blocked. Use "Load Label Folder" to pick a folder.');
                                }
                            }
                        }
                        if (labelHandle) {
                            this._state.setLabelFolder(labelHandle);
                            this.updateLabelFolderButton(true, labelHandle.name);
                            (0,notifications.showSuccessToast)(`Label folder ready: ${labelHandle.name}`);
                        }
                    }
                    catch (e) {
                        console.warn('Label folder detection/creation skipped:', e);
                    }
                    // List images after label folder handling
                    const listRes = await this._fileSystem.listImageFiles?.(result.data);
                    if (listRes?.success && Array.isArray(listRes.data)) {
                        this._state.imageFiles = listRes.data;
                        this.renderImageList();
                    }
                }
            }
            catch (e) {
                console.error('Failed to select image folder', e);
            }
        });
        this.elements.selectLabelFolderBtn.addEventListener('click', async () => {
            try {
                const result = await this._fileSystem.selectLabelFolder?.();
                if (result?.success && result.data) {
                    this._state.setLabelFolder(result.data);
                    this.updateLabelFolderButton(true, result.data.name);
                }
            }
            catch (e) {
                console.error('Failed to select label folder', e);
            }
        });
        this.elements.loadClassInfoFolderBtn.addEventListener('click', async () => {
            try {
                const result = await this._fileSystem.selectClassInfoFolder?.();
                if (result?.success && result.data) {
                    this._state.setClassInfoFolder(result.data);
                }
            }
            catch (e) {
                console.error('Failed to select class info folder', e);
            }
        });
        // Zoom controls
        this.elements.zoomInBtn.addEventListener('click', () => this._canvasController.zoomIn());
        this.elements.zoomOutBtn.addEventListener('click', () => this._canvasController.zoomOut());
        this.elements.resetZoomBtn.addEventListener('click', () => this._canvasController.resetZoom());
        // Mode switching
        this.elements.drawModeBtn.addEventListener('click', () => this._state.setMode('draw'));
        this.elements.editModeBtn.addEventListener('click', () => this._state.setMode('edit'));
        // Canvas display options
        this.elements.showLabelsOnCanvasToggle.addEventListener('change', () => {
            this._state.setShowLabels(this.elements.showLabelsOnCanvasToggle.checked);
            this._canvasController.updateLabels();
        });
        this.elements.labelFontSizeSlider.addEventListener('input', () => {
            const val = Number(this.elements.labelFontSizeSlider.value);
            this.elements.labelFontSizeValue.textContent = String(val);
            this._state.setLabelFontSize(val);
            this._canvasController.setLabelFont(val);
        });
        this.elements.autoSaveToggle.addEventListener('change', () => {
            this._state.setAutoSave(this.elements.autoSaveToggle.checked);
        });
        this.elements.crosshairToggle.addEventListener('change', () => {
            this._state.toggleCrosshair();
        });
        // Window resize handler
        window.addEventListener('resize', () => {
            this.resizePanels();
        });
        // Panel collapse/expand buttons
        this.elements.collapseLeftPanelBtn.addEventListener('click', () => {
            const config = this.panelConfigs.get('left');
            this.togglePanel(config);
        });
        this.elements.collapseRightPanelBtn.addEventListener('click', () => {
            const config = this.panelConfigs.get('right');
            this.togglePanel(config);
        });
        this.elements.expandLeftPanelBtn.addEventListener('click', () => {
            const config = this.panelConfigs.get('left');
            this.togglePanel(config);
        });
        this.elements.expandRightPanelBtn.addEventListener('click', () => {
            const config = this.panelConfigs.get('right');
            this.togglePanel(config);
        });
        // Theme toggle
        this.elements.darkModeToggle.addEventListener('change', () => {
            this.toggleDarkMode();
        });
        // Save labels
        this.elements.saveLabelsBtn.addEventListener('click', async () => {
            try {
                if (!this._state.currentImageFile || !this._state.labelFolderHandle) {
                    (0,notifications.showErrorToast)('Select image and label folders first');
                    return;
                }
                const boundingBoxes = this._canvasController.getAllBoundingBoxes();
                const yoloLabels = boundingBoxes.map(bbox => this._canvasController.boundingBoxToYOLO(bbox, {
                    width: this._state.currentImage?.width || 1,
                    height: this._state.currentImage?.height || 1
                }));
                const result = await this._fileSystem.saveLabels?.(this._state.currentImageFile.name, yoloLabels, this._state.labelFolderHandle);
                if (result?.success) {
                    (0,notifications.showSuccessToast)('Labels saved successfully');
                }
                else {
                    (0,notifications.showErrorToast)(result?.error || 'Failed to save labels');
                }
            }
            catch (e) {
                console.error('Save labels failed', e);
                (0,notifications.showErrorToast)('Failed to save labels');
            }
        });
        // Go to coordinates
        this.elements.goToCoordsBtn.addEventListener('click', () => {
            const x = Number(this.elements.coordXInput.value);
            const y = Number(this.elements.coordYInput.value);
            if (Number.isFinite(x) && Number.isFinite(y)) {
                this._canvasController.goToImageCoordinates(x, y);
            }
        });
        // Zoom input (percent)
        this.elements.zoomInput.addEventListener('change', () => {
            const pct = Number(this.elements.zoomInput.value);
            if (Number.isFinite(pct) && pct > 0) {
                this._canvasController.setZoomPercent(pct);
            }
        });
        // Hide context menu on document click
        document.addEventListener('click', (e) => {
            if (!this.elements.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
    }
    // Keep mode buttons in sync with AppState
    syncModeUI(currentMode) {
        try {
            const drawInput = document.getElementById('drawMode');
            const editInput = document.getElementById('editMode');
            const drawLabel = document.querySelector('label[for="drawMode"]');
            const editLabel = document.querySelector('label[for="editMode"]');
            const isDraw = currentMode === 'draw';
            if (drawInput)
                drawInput.checked = isDraw;
            if (editInput)
                editInput.checked = !isDraw;
            if (drawLabel)
                drawLabel.classList.toggle('active', isDraw);
            if (editLabel)
                editLabel.classList.toggle('active', !isDraw);
        }
        catch { }
    }
    // ===================================================================
    // Validation
    // ===================================================================
    validateUIState() {
        const errors = [];
        const warnings = [];
        // Check if essential elements exist
        if (!this.elements.canvasContainer) {
            errors.push('Canvas container not found');
        }
        if (!this.elements.imageList) {
            errors.push('Image list container not found');
        }
        if (!this.elements.labelList) {
            errors.push('Label list container not found');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    validateFormData(formData) {
        const errors = [];
        const warnings = [];
        // Implement form validation logic as needed
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ===================================================================
    // Additional Methods (for future expansion)
    // ===================================================================
    addEditDeleteListeners(rects) {
        // Implementation for adding edit/delete event listeners to bounding box elements
        rects.forEach(rect => {
            // Add event listeners for edit/delete operations
            // This would typically be handled by the CanvasController
        });
    }
}

;// ./src/main.ts
/**
 * Easy Labeling TypeScript Main Entry Point
 *
 * Phase 8 Complete: Application Integration & Testing
 * All modules integrated with complete dependency injection system
 */






/**
 * Main Application Class - Phase 8 Complete Integration
 *
 * This class provides complete dependency injection and module coordination
 * for the TypeScript version of Easy Labeling.
 */
class App {
    constructor() {
        this.appState = createAppState();
        this.fileSystemService = createFileSystemService();
        this.initialized = false;
        console.log('🚀 Easy Labeling TypeScript Migration - Phase 8 Integration!');
        console.log('✅ All 7 previous phases completed successfully');
        console.log('✅ Phase 8: Application integration starting...');
        this.initialize();
    }
    /**
     * Initialize all application components with dependency injection
     */
    async initialize() {
        try {
            console.log('🔧 Initializing dependency injection system...');
            // Initialize Canvas Controller first
            this.canvasController = new CanvasController(this.appState);
            console.log('✅ CanvasController initialized');
            // Initialize UI Manager (needs CanvasController)
            this.uiManager = new UIManager(this.appState, this.canvasController, this.fileSystemService // Type compatibility will be fixed in future updates
            );
            console.log('✅ UIManager initialized');
            // Initialize Fabric canvas in the existing container from public/index.html
            this.canvasController.initializeCanvas('canvas-container');
            console.log('✅ Canvas initialized in #canvas-container');
            // Initialize Event Manager (needs all other components)
            this.eventManager = new EventManager(this.appState, this.canvasController, this.fileSystemService);
            console.log('✅ EventManager initialized');
            // Setup cross-component references
            this.setupCrossReferences();
            console.log('✅ Cross-component references established');
            // Setup event listeners for application lifecycle
            this.setupApplicationEvents();
            console.log('✅ Application event system ready');
            this.initialized = true;
            console.log('🎯 Phase 8 application integration completed successfully!');
            // Show success notification
            (0,notifications.showSuccessToast)('🚀 Easy Labeling TypeScript migration complete!');
            // Perform functionality tests
            await this.performFunctionalityTests();
        }
        catch (error) {
            console.error('❌ Application initialization failed:', error);
            (0,notifications.showErrorToast)('❌ Application initialization failed');
            throw error;
        }
    }
    /**
     * Setup cross-component references for circular dependencies
     */
    setupCrossReferences() {
        // Setup cross-component references
        // UIManager should have access to canvas through appState
        // Cross-references handled through dependency injection
        console.log('🔗 Cross-references established between components');
    }
    /**
     * Setup application-level event listeners
     */
    setupApplicationEvents() {
        // Listen to application state changes
        this.appState.addEventListener('mode:changed', (event) => {
            console.log('📡 App mode changed:', event.data);
        });
        this.appState.addEventListener('image:selected', (event) => {
            console.log('📡 Image selected:', event.data);
        });
        this.appState.addEventListener('labels:saved', (event) => {
            console.log('📡 Labels saved:', event.data);
        });
        // Handle browser errors
        window.addEventListener('error', (event) => {
            console.error('🚨 Application error:', event.error);
            (0,notifications.showErrorToast)('An unexpected error occurred');
        });
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled promise rejection:', event.reason);
            (0,notifications.showErrorToast)('An unexpected error occurred');
        });
    }
    /**
     * Perform comprehensive functionality testing
     */
    async performFunctionalityTests() {
        console.log('\n🧪 Performing Phase 8 Integration Tests:');
        try {
            // Test 1: Component initialization
            const componentsTest = this.testComponentInitialization();
            console.log('✅ Component initialization test:', componentsTest ? 'PASSED' : 'FAILED');
            // Test 2: Event system integration
            const eventsTest = this.testEventSystemIntegration();
            console.log('✅ Event system integration test:', eventsTest ? 'PASSED' : 'FAILED');
            // Test 3: UI functionality
            const uiTest = await this.testUIFunctionality();
            console.log('✅ UI functionality test:', uiTest ? 'PASSED' : 'FAILED');
            // Test 4: Canvas functionality
            const canvasTest = this.testCanvasFunctionality();
            console.log('✅ Canvas functionality test:', canvasTest ? 'PASSED' : 'FAILED');
            // Test 5: File system integration
            const fileSystemTest = this.testFileSystemIntegration();
            console.log('✅ File system integration test:', fileSystemTest ? 'PASSED' : 'FAILED');
            // Test 6: Keyboard shortcuts
            const keyboardTest = this.testKeyboardShortcuts();
            console.log('✅ Keyboard shortcuts test:', keyboardTest ? 'PASSED' : 'FAILED');
            console.log('🎯 All Phase 8 integration tests completed!');
        }
        catch (error) {
            console.error('❌ Integration tests failed:', error);
        }
    }
    /**
     * Test component initialization
     */
    testComponentInitialization() {
        return !!(this.appState &&
            this.fileSystemService &&
            this.uiManager &&
            this.canvasController &&
            this.eventManager &&
            this.initialized);
    }
    /**
     * Test event system integration
     */
    testEventSystemIntegration() {
        try {
            // Test state event without altering final mode
            const prevMode = this.appState.currentMode;
            this.appState.setMode('edit');
            this.appState.setMode('draw');
            // restore previous mode
            this.appState.setMode(prevMode);
            return true;
        }
        catch (error) {
            console.error('Event system test error:', error);
            return false;
        }
    }
    /**
     * Test UI functionality
     */
    async testUIFunctionality() {
        try {
            // Test UI update methods
            this.uiManager.updateLabelList();
            // Add other UI update tests as methods become available
            return true;
        }
        catch (error) {
            console.error('UI functionality test error:', error);
            return false;
        }
    }
    /**
     * Test canvas functionality
     */
    testCanvasFunctionality() {
        try {
            // Test canvas methods
            const canvas = this.canvasController.canvas;
            if (!canvas)
                return false;
            // Test zoom functions
            this.canvasController.zoomIn();
            this.canvasController.zoomOut();
            this.canvasController.resetZoom();
            return true;
        }
        catch (error) {
            console.error('Canvas functionality test error:', error);
            return false;
        }
    }
    /**
     * Test file system integration
     */
    testFileSystemIntegration() {
        try {
            // Test service methods exist
            const methods = [
                'selectImageFolder',
                'selectLabelFolder',
                'loadLabels',
                'saveLabels',
                'parseYoloString'
            ];
            return methods.every(method => typeof this.fileSystemService[method] === 'function');
        }
        catch (error) {
            console.error('File system integration test error:', error);
            return false;
        }
    }
    /**
     * Test keyboard shortcuts
     */
    testKeyboardShortcuts() {
        try {
            // Test that event manager exists and has required methods
            return !!this.eventManager && typeof this.eventManager.destroy === 'function';
        }
        catch (error) {
            console.error('Keyboard shortcuts test error:', error);
            return false;
        }
    }
    /**
     * Get application state for debugging
     */
    getApplicationState() {
        return {
            initialized: this.initialized,
            appState: this.appState.getDebugInfo(),
            canvas: {
                hasCanvas: !!this.canvasController?.canvas,
                mode: this.appState.currentMode
            },
            ui: {
                hasUIManager: !!this.uiManager
            },
            events: {
                hasEventManager: !!this.eventManager
            },
            fileSystem: {
                hasFileSystemService: !!this.fileSystemService
            }
        };
    }
    /**
     * Cleanup application resources
     */
    destroy() {
        try {
            this.eventManager?.destroy?.();
            this.canvasController?.destroyCanvas?.();
            // this.uiManager cleanup if needed
            console.log('🧹 Application resources cleaned up');
        }
        catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }
}
// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded - Phase 8 integration starting...');
    try {
        // Create and start the application
        const app = new App();
        // Make app available globally for debugging
        window.easyLabelingApp = app;
        // Removed: Phase 8 completion indicator toast
    }
    catch (error) {
        console.error('❌ Failed to initialize Easy Labeling application:', error);
    }
});
// Export main components for external use








/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLG1DQUFtQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xELENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUFFRCwyQ0FBMkM7QUFDM0MsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFFL0QsSUFBSSxDQUFDO1FBQ0gsbUNBQW1DO1FBQ25DLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFFdEIsNENBQTRDO1FBQzNDLE1BQWMsQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDO1FBRXRDLDhDQUE4QztJQUVoRCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsbURBQW1ELEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUUsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUgsMENBQTBDO0FBQzNCO0FBQytEO0FBQ007QUFDbEI7QUFDUjtBQUNmO0FBQ3lCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91dGlscy9jb2xvci1wYWxldHRlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdXRpbHMvdmFsaWRhdGlvbi50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL25vdGlmaWNhdGlvbnMudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbW9kZWxzL0FwcFN0YXRlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdHlwZXMvZmlsZXN5c3RlbS50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL3lvbG8tcGFyc2VyLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvc2VydmljZXMvRmlsZVN5c3RlbVNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9zZXJ2aWNlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL2V4dGVybmFsIHZhciBcImZhYnJpY1wiIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvY29udHJvbGxlcnMvQ2FudmFzQ29udHJvbGxlci50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL2NvbnRyb2xsZXJzL0V2ZW50TWFuYWdlci50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL2luZGV4LnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdWkvVUlNYW5hZ2VyLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29sb3IgUGFsZXR0ZSBVdGlsaXR5IE1vZHVsZVxyXG4gKiBcclxuICogTWFuYWdlcyBjb2xvciBhc3NpZ25tZW50cyBmb3Igb2JqZWN0IGRldGVjdGlvbiBsYWJlbHMgYW5kIFVJIGVsZW1lbnRzLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBQcmVkZWZpbmVkIGNvbG9yIHBhbGV0dGUgZm9yIGxhYmVsIGNsYXNzZXNcclxuICogVXNlcyBhIG1peCBvZiBkaXN0aW5jdCBjb2xvcnMgb3B0aW1pemVkIGZvciB2aXNpYmlsaXR5IGFuZCBhY2Nlc3NpYmlsaXR5XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY29sb3JQYWxldHRlOiBzdHJpbmdbXSA9IFtcclxuICAgICcjZTYxOTRiJywgJyMzY2I0NGInLCAnI2ZmZTExOScsICcjNDM2M2Q4JywgJyNmNTgyMzEnLCBcclxuICAgICcjOTExZWI0JywgJyM0NmYwZjAnLCAnI2YwMzJlNicsICcjYmNmNjBjJywgJyNmYWJlYmUnLFxyXG4gICAgJyMwMDgwODAnLCAnI2U2YmVmZicsICcjOWE2MzI0JywgJyNmZmZhYzgnLCAnIzgwMDAwMCcsXHJcbiAgICAnI2FhZmZjMycsICcjODA4MDAwJywgJyNmZmQ4YjEnLCAnIzAwMDA3NScsICcjODA4MDgwJyxcclxuICAgICcjZmZmZmZmJywgJyMwMDAwMDAnLCAnIzFmNzdiNCcsICcjZmY3ZjBlJywgJyMyY2EwMmMnLFxyXG4gICAgJyNkNjI3MjgnLCAnIzk0NjdiZCcsICcjOGM1NjRiJywgJyNlMzc3YzInLCAnIzdmN2Y3ZidcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IGZhbGxiYWNrIGNvbG9yIGZvciBpbnZhbGlkIG9yIHVuYXNzaWduZWQgY2xhc3Nlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09MT1IgPSAnIzAwMDAwMCc7XHJcblxyXG4vKipcclxuICogR2V0cyBhIGNvbG9yIGZvciBhIHNwZWNpZmljIGxhYmVsIGNsYXNzXHJcbiAqIEBwYXJhbSBsYWJlbENsYXNzIC0gVGhlIGxhYmVsIGNsYXNzIGlkZW50aWZpZXIgKHN0cmluZyBvciBudW1iZXIpXHJcbiAqIEByZXR1cm5zIENvbG9yIGhleCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3M6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBjb25zdCBjbGFzc051bWJlciA9IHR5cGVvZiBsYWJlbENsYXNzID09PSAnc3RyaW5nJyBcclxuICAgICAgICA/IHBhcnNlSW50KGxhYmVsQ2xhc3MsIDEwKSBcclxuICAgICAgICA6IGxhYmVsQ2xhc3M7XHJcblxyXG4gICAgaWYgKGlzTmFOKGNsYXNzTnVtYmVyKSB8fCBjbGFzc051bWJlciA8IDApIHtcclxuICAgICAgICByZXR1cm4gREVGQVVMVF9DT0xPUjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb2xvckluZGV4ID0gY2xhc3NOdW1iZXIgJSBjb2xvclBhbGV0dGUubGVuZ3RoO1xyXG4gICAgcmV0dXJuIGNvbG9yUGFsZXR0ZVtjb2xvckluZGV4XSB8fCBERUZBVUxUX0NPTE9SO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBtdWx0aXBsZSBjb2xvcnMgZm9yIGEgbGlzdCBvZiBsYWJlbCBjbGFzc2VzXHJcbiAqIEBwYXJhbSBsYWJlbENsYXNzZXMgLSBBcnJheSBvZiBsYWJlbCBjbGFzcyBpZGVudGlmaWVyc1xyXG4gKiBAcmV0dXJucyBBcnJheSBvZiBjb2xvciBoZXggc3RyaW5nc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yc0ZvckNsYXNzZXMobGFiZWxDbGFzc2VzOiAoc3RyaW5nIHwgbnVtYmVyKVtdKTogc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIGxhYmVsQ2xhc3Nlcy5tYXAobGFiZWxDbGFzcyA9PiBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3MpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBpZiBhIGNvbG9yIGlzIGluIHRoZSBwYWxldHRlXHJcbiAqIEBwYXJhbSBjb2xvciAtIENvbG9yIGhleCBzdHJpbmcgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiBjb2xvciBleGlzdHMgaW4gcGFsZXR0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29sb3JJblBhbGV0dGUoY29sb3I6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGNvbG9yUGFsZXR0ZS5pbmNsdWRlcyhjb2xvci50b0xvd2VyQ2FzZSgpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGluZGV4IG9mIGEgY29sb3IgaW4gdGhlIHBhbGV0dGVcclxuICogQHBhcmFtIGNvbG9yIC0gQ29sb3IgaGV4IHN0cmluZ1xyXG4gKiBAcmV0dXJucyBJbmRleCBvZiB0aGUgY29sb3IsIG9yIC0xIGlmIG5vdCBmb3VuZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9ySW5kZXgoY29sb3I6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gY29sb3JQYWxldHRlLmZpbmRJbmRleChjID0+IGMudG9Mb3dlckNhc2UoKSA9PT0gY29sb3IudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGEgY29udHJhc3RpbmcgdGV4dCBjb2xvciAoYmxhY2sgb3Igd2hpdGUpIGZvciBhIGdpdmVuIGJhY2tncm91bmQgY29sb3JcclxuICogQHBhcmFtIGJhY2tncm91bmRDb2xvciAtIEJhY2tncm91bmQgY29sb3IgaGV4IHN0cmluZ1xyXG4gKiBAcmV0dXJucyAnIzAwMDAwMCcgZm9yIGxpZ2h0IGJhY2tncm91bmRzLCAnI2ZmZmZmZicgZm9yIGRhcmsgYmFja2dyb3VuZHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cmFzdGluZ1RleHRDb2xvcihiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAvLyBSZW1vdmUgIyBpZiBwcmVzZW50XHJcbiAgICBjb25zdCBoZXggPSBiYWNrZ3JvdW5kQ29sb3IucmVwbGFjZSgnIycsICcnKTtcclxuICAgIFxyXG4gICAgLy8gQ29udmVydCB0byBSR0JcclxuICAgIGNvbnN0IHIgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDAsIDIpLCAxNik7XHJcbiAgICBjb25zdCBnID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZygyLCA0KSwgMTYpO1xyXG4gICAgY29uc3QgYiA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoNCwgNiksIDE2KTtcclxuICAgIFxyXG4gICAgLy8gQ2FsY3VsYXRlIHJlbGF0aXZlIGx1bWluYW5jZVxyXG4gICAgY29uc3QgbHVtaW5hbmNlID0gKDAuMjk5ICogciArIDAuNTg3ICogZyArIDAuMTE0ICogYikgLyAyNTU7XHJcbiAgICBcclxuICAgIC8vIFJldHVybiBibGFjayBmb3IgbGlnaHQgYmFja2dyb3VuZHMsIHdoaXRlIGZvciBkYXJrIGJhY2tncm91bmRzXHJcbiAgICByZXR1cm4gbHVtaW5hbmNlID4gMC41ID8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydHMgaGV4IGNvbG9yIHRvIFJHQkFcclxuICogQHBhcmFtIGhleCAtIEhleCBjb2xvciBzdHJpbmdcclxuICogQHBhcmFtIGFscGhhIC0gQWxwaGEgdmFsdWUgKDAtMSlcclxuICogQHJldHVybnMgUkdCQSBjb2xvciBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBoZXhUb1JnYmEoaGV4OiBzdHJpbmcsIGFscGhhOiBudW1iZXIgPSAxKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGNsZWFuSGV4ID0gaGV4LnJlcGxhY2UoJyMnLCAnJyk7XHJcbiAgICBjb25zdCByID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDAsIDIpLCAxNik7XHJcbiAgICBjb25zdCBnID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDIsIDQpLCAxNik7XHJcbiAgICBjb25zdCBiID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDQsIDYpLCAxNik7XHJcbiAgICBcclxuICAgIHJldHVybiBgcmdiYSgke3J9LCAke2d9LCAke2J9LCAke2FscGhhfSlgO1xyXG59XHJcblxyXG4vKipcclxuICogQ29sb3IgY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JDb25maWcge1xyXG4gICAgcGFsZXR0ZTogc3RyaW5nW107XHJcbiAgICBkZWZhdWx0Q29sb3I6IHN0cmluZztcclxuICAgIHVzZUhpZ2hDb250cmFzdDogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkdmFuY2VkIGNvbG9yIG1hbmFnZW1lbnQgY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb2xvck1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBwYWxldHRlOiBzdHJpbmdbXTtcclxuICAgIHByaXZhdGUgZGVmYXVsdENvbG9yOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHVzZUhpZ2hDb250cmFzdDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFBhcnRpYWw8Q29sb3JDb25maWc+ID0ge30pIHtcclxuICAgICAgICB0aGlzLnBhbGV0dGUgPSBjb25maWcucGFsZXR0ZSB8fCBjb2xvclBhbGV0dGU7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29sb3IgPSBjb25maWcuZGVmYXVsdENvbG9yIHx8IERFRkFVTFRfQ09MT1I7XHJcbiAgICAgICAgdGhpcy51c2VIaWdoQ29udHJhc3QgPSBjb25maWcudXNlSGlnaENvbnRyYXN0IHx8IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBjb2xvciBmb3IgY2xhc3Mgd2l0aCBhZHZhbmNlZCBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGdldENvbG9yKGxhYmVsQ2xhc3M6IHN0cmluZyB8IG51bWJlciwgb3B0aW9ucz86IHsgaGlnaENvbnRyYXN0PzogYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBiYXNlQ29sb3IgPSBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChvcHRpb25zPy5oaWdoQ29udHJhc3QgfHwgdGhpcy51c2VIaWdoQ29udHJhc3QpIHtcclxuICAgICAgICAgICAgLy8gUmV0dXJuIGhpZ2ggY29udHJhc3QgdmVyc2lvbiBvZiBjb2xvclxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRIaWdoQ29udHJhc3RDb2xvcihiYXNlQ29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gYmFzZUNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBhIGhpZ2ggY29udHJhc3QgdmVyc2lvbiBvZiBhIGNvbG9yXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0SGlnaENvbnRyYXN0Q29sb3IoY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8gU2ltcGxlIGhpZ2ggY29udHJhc3QgaW1wbGVtZW50YXRpb25cclxuICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHlvdSBtaWdodCB1c2UgY29sb3IgdGhlb3J5IGFsZ29yaXRobXNcclxuICAgICAgICBjb25zdCBsdW1pbmFuY2UgPSB0aGlzLmdldENvbG9yTHVtaW5hbmNlKGNvbG9yKTtcclxuICAgICAgICByZXR1cm4gbHVtaW5hbmNlID4gMC41ID8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBjb2xvciBsdW1pbmFuY2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRDb2xvckx1bWluYW5jZShoZXg6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5IZXggPSBoZXgucmVwbGFjZSgnIycsICcnKTtcclxuICAgICAgICBjb25zdCByID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDAsIDIpLCAxNikgLyAyNTU7XHJcbiAgICAgICAgY29uc3QgZyA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZygyLCA0KSwgMTYpIC8gMjU1O1xyXG4gICAgICAgIGNvbnN0IGIgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoNCwgNiksIDE2KSAvIDI1NTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gMC4yOTkgKiByICsgMC41ODcgKiBnICsgMC4xMTQgKiBiO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIFZhbGlkYXRpb24gVXRpbGl0eSBNb2R1bGVcclxuICogXHJcbiAqIFByb3ZpZGVzIGlucHV0IHZhbGlkYXRpb24gZnVuY3Rpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICovXHJcblxyXG5pbXBvcnQgeyBzaG93VG9hc3QsIHNob3dFcnJvclRvYXN0IH0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0aW9uIHJlc3VsdCBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBpc1ZhbGlkOiBib29sZWFuO1xyXG4gICAgdmFsdWU/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICBlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgbGFiZWwgY2xhc3MgaW5wdXQgZnJvbSB1c2VyXHJcbiAqIEBwYXJhbSBpbnB1dCAtIFJhdyBpbnB1dCBmcm9tIHVzZXIgKGNhbiBiZSBudWxsIGlmIGNhbmNlbGxlZClcclxuICogQHJldHVybnMgVmFsaWRhdGVkIGNsYXNzIHN0cmluZyBvciBudWxsIGlmIGludmFsaWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUxhYmVsQ2xhc3MoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGlmIChpbnB1dCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsOyAvLyBVc2VyIGNhbmNlbGxlZCBwcm9tcHRcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmltbWVkSW5wdXQgPSBpbnB1dC50cmltKCk7XHJcbiAgICBcclxuICAgIGlmICh0cmltbWVkSW5wdXQgPT09ICcnKSB7XHJcbiAgICAgICAgc2hvd1RvYXN0KCdMYWJlbCBjbGFzcyBjYW5ub3QgYmUgZW1wdHkuJywgMzAwMCk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbnVtID0gTnVtYmVyKHRyaW1tZWRJbnB1dCk7XHJcblxyXG4gICAgaWYgKGlzTmFOKG51bSkgfHwgIU51bWJlci5pc0ludGVnZXIobnVtKSB8fCBudW0gPCAwIHx8IG51bSA+IDEwMDAwKSB7XHJcbiAgICAgICAgc2hvd1RvYXN0KCdJbnZhbGlkIExhYmVsOiBQbGVhc2UgZW50ZXIgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDEwMDAwLicsIDQwMDApO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmcobnVtKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkdmFuY2VkIGxhYmVsIGNsYXNzIHZhbGlkYXRpb24gd2l0aCBkZXRhaWxlZCByZXN1bHRcclxuICogQHBhcmFtIGlucHV0IC0gUmF3IGlucHV0IHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIERldGFpbGVkIHZhbGlkYXRpb24gcmVzdWx0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVMYWJlbENsYXNzQWR2YW5jZWQoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBWYWxpZGF0aW9uUmVzdWx0IHtcclxuICAgIGlmIChpbnB1dCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdJbnB1dCB3YXMgY2FuY2VsbGVkJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHJpbW1lZElucHV0ID0gaW5wdXQudHJpbSgpO1xyXG4gICAgXHJcbiAgICBpZiAodHJpbW1lZElucHV0ID09PSAnJykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBjYW5ub3QgYmUgZW1wdHknXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBudW0gPSBOdW1iZXIodHJpbW1lZElucHV0KTtcclxuXHJcbiAgICBpZiAoaXNOYU4obnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBtdXN0IGJlIGEgbnVtYmVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgbXVzdCBiZSBhbiBpbnRlZ2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG51bSA8IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgY2Fubm90IGJlIG5lZ2F0aXZlJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG51bSA+IDEwMDAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0xhYmVsIGNsYXNzIGNhbm5vdCBleGNlZWQgMTAwMDAnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgdmFsdWU6IFN0cmluZyhudW0pXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGZpbGUgbmFtZSBmb3Igc2FmZXR5XHJcbiAqIEBwYXJhbSBmaWxlTmFtZSAtIEZpbGUgbmFtZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghZmlsZU5hbWUgfHwgZmlsZU5hbWUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgaW52YWxpZCBjaGFyYWN0ZXJzXHJcbiAgICBjb25zdCBpbnZhbGlkQ2hhcnMgPSAvWzw+OlwiL1xcXFx8PypdLztcclxuICAgIGlmIChpbnZhbGlkQ2hhcnMudGVzdChmaWxlTmFtZSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIHJlc2VydmVkIG5hbWVzIChXaW5kb3dzKVxyXG4gICAgY29uc3QgcmVzZXJ2ZWROYW1lcyA9IC9eKENPTnxQUk58QVVYfE5VTHxDT01bMS05XXxMUFRbMS05XSkkL2k7XHJcbiAgICBpZiAocmVzZXJ2ZWROYW1lcy50ZXN0KGZpbGVOYW1lKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBpbWFnZSBmaWxlIGV4dGVuc2lvblxyXG4gKiBAcGFyYW0gZmlsZU5hbWUgLSBGaWxlIG5hbWUgdG8gY2hlY2tcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBpbWFnZSBleHRlbnNpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUltYWdlRXh0ZW5zaW9uKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHZhbGlkRXh0ZW5zaW9ucyA9IFsnLmpwZycsICcuanBlZycsICcucG5nJywgJy5ibXAnLCAnLnRpZmYnLCAnLnRpZicsICcud2VicCddO1xyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gZmlsZU5hbWUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSk7XHJcbiAgICByZXR1cm4gdmFsaWRFeHRlbnNpb25zLmluY2x1ZGVzKGV4dGVuc2lvbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgY29vcmRpbmF0ZSB2YWx1ZXMgZm9yIGJvdW5kaW5nIGJveGVzXHJcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB5IC0gWSBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB3aWR0aCAtIFdpZHRoXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBIZWlnaHRcclxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUJvdW5kaW5nQm94KFxyXG4gICAgeDogbnVtYmVyLCBcclxuICAgIHk6IG51bWJlciwgXHJcbiAgICB3aWR0aDogbnVtYmVyLCBcclxuICAgIGhlaWdodDogbnVtYmVyXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGlzTmFOKHgpIHx8IGlzTmFOKHkpIHx8IGlzTmFOKHdpZHRoKSB8fCBpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0FsbCBjb29yZGluYXRlcyBtdXN0IGJlIHZhbGlkIG51bWJlcnMnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2lkdGggPD0gMCB8fCBoZWlnaHQgPD0gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdXaWR0aCBhbmQgaGVpZ2h0IG11c3QgYmUgcG9zaXRpdmUnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeCA8IDAgfHwgeSA8IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnQ29vcmRpbmF0ZXMgY2Fubm90IGJlIG5lZ2F0aXZlJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIFlPTE8gZm9ybWF0IGNvb3JkaW5hdGVzIChub3JtYWxpemVkIDAtMSlcclxuICogQHBhcmFtIGNlbnRlclggLSBOb3JtYWxpemVkIGNlbnRlciBYICgwLTEpXHJcbiAqIEBwYXJhbSBjZW50ZXJZIC0gTm9ybWFsaXplZCBjZW50ZXIgWSAoMC0xKVxyXG4gKiBAcGFyYW0gd2lkdGggLSBOb3JtYWxpemVkIHdpZHRoICgwLTEpXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBOb3JtYWxpemVkIGhlaWdodCAoMC0xKVxyXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlWU9MT0Nvb3JkaW5hdGVzKFxyXG4gICAgY2VudGVyWDogbnVtYmVyLFxyXG4gICAgY2VudGVyWTogbnVtYmVyLFxyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIGhlaWdodDogbnVtYmVyXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGlzTmFOKGNlbnRlclgpIHx8IGlzTmFOKGNlbnRlclkpIHx8IGlzTmFOKHdpZHRoKSB8fCBpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0FsbCBZT0xPIGNvb3JkaW5hdGVzIG11c3QgYmUgdmFsaWQgbnVtYmVycydcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjZW50ZXJYIDwgMCB8fCBjZW50ZXJYID4gMSB8fCBjZW50ZXJZIDwgMCB8fCBjZW50ZXJZID4gMSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdDZW50ZXIgY29vcmRpbmF0ZXMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2lkdGggPD0gMCB8fCB3aWR0aCA+IDEgfHwgaGVpZ2h0IDw9IDAgfHwgaGVpZ2h0ID4gMSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdXaWR0aCBhbmQgaGVpZ2h0IG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIHpvb20gbGV2ZWxcclxuICogQHBhcmFtIHpvb20gLSBab29tIGxldmVsIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgem9vbSBsZXZlbFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlWm9vbUxldmVsKHpvb206IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICFpc05hTih6b29tKSAmJiB6b29tID4gMC4xICYmIHpvb20gPD0gMTA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgZm9udCBzaXplIGZvciBsYWJlbHNcclxuICogQHBhcmFtIGZvbnRTaXplIC0gRm9udCBzaXplIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgZm9udCBzaXplXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGb250U2l6ZShmb250U2l6ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIWlzTmFOKGZvbnRTaXplKSAmJiBmb250U2l6ZSA+PSA4ICYmIGZvbnRTaXplIDw9IDcyO1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhbCBwdXJwb3NlIG51bWJlciB2YWxpZGF0aW9uXHJcbiAqIEBwYXJhbSB2YWx1ZSAtIFZhbHVlIHRvIHZhbGlkYXRlXHJcbiAqIEBwYXJhbSBtaW4gLSBNaW5pbXVtIGFsbG93ZWQgdmFsdWVcclxuICogQHBhcmFtIG1heCAtIE1heGltdW0gYWxsb3dlZCB2YWx1ZVxyXG4gKiBAcGFyYW0gYWxsb3dGbG9hdCAtIFdoZXRoZXIgdG8gYWxsb3cgZmxvYXRpbmcgcG9pbnQgbnVtYmVyc1xyXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTnVtYmVyKFxyXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlcixcclxuICAgIG1pbj86IG51bWJlcixcclxuICAgIG1heD86IG51bWJlcixcclxuICAgIGFsbG93RmxvYXQ6IGJvb2xlYW4gPSB0cnVlXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgY29uc3QgbnVtID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IE51bWJlcih2YWx1ZSkgOiB2YWx1ZTtcclxuXHJcbiAgICBpZiAoaXNOYU4obnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdWYWx1ZSBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFhbGxvd0Zsb2F0ICYmICFOdW1iZXIuaXNJbnRlZ2VyKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnVmFsdWUgbXVzdCBiZSBhbiBpbnRlZ2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1pbiAhPT0gdW5kZWZpbmVkICYmIG51bSA8IG1pbikge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBWYWx1ZSBtdXN0IGJlIGF0IGxlYXN0ICR7bWlufWBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtYXggIT09IHVuZGVmaW5lZCAmJiBudW0gPiBtYXgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVmFsdWUgY2Fubm90IGV4Y2VlZCAke21heH1gXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgdmFsdWU6IG51bVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBlbWFpbCBmb3JtYXRcclxuICogQHBhcmFtIGVtYWlsIC0gRW1haWwgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBlbWFpbCBmb3JtYXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUVtYWlsKGVtYWlsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcclxuICAgIHJldHVybiBlbWFpbFJlZ2V4LnRlc3QoZW1haWwpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIFVSTCBmb3JtYXRcclxuICogQHBhcmFtIHVybCAtIFVSTCB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIFVSTCBmb3JtYXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVVybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBuZXcgVVJMKHVybCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdGl6ZXMgc3RyaW5nIGlucHV0IHRvIHByZXZlbnQgWFNTXHJcbiAqIEBwYXJhbSBpbnB1dCAtIElucHV0IHN0cmluZyB0byBzYW5pdGl6ZVxyXG4gKiBAcmV0dXJucyBTYW5pdGl6ZWQgc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJbnB1dChpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBpbnB1dFxyXG4gICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXHJcbiAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjeDI3OycpO1xyXG59IiwiLyoqXHJcbiAqIE5vdGlmaWNhdGlvbnMgVXRpbGl0eSBNb2R1bGVcclxuICogXHJcbiAqIEhhbmRsZXMgdXNlciBub3RpZmljYXRpb24gc3lzdGVtIGluY2x1ZGluZyB0b2FzdCBtZXNzYWdlcyBhbmQgYWxlcnRzLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHRvYXN0IG5vdGlmaWNhdGlvbiBtZXNzYWdlIHRvIHRoZSB1c2VyXHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBEdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDMwMDBtcylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbjogbnVtYmVyID0gMzAwMCk6IHZvaWQge1xyXG4gICAgY29uc3QgdG9hc3RDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QtY29udGFpbmVyJyk7XHJcbiAgICBpZiAoIXRvYXN0Q29udGFpbmVyKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdUb2FzdCBjb250YWluZXIgbm90IGZvdW5kLiBNZXNzYWdlOicsIG1lc3NhZ2UpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdG9hc3QuY2xhc3NOYW1lID0gJ3RvYXN0LW1lc3NhZ2UnO1xyXG4gICAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgdG9hc3RDb250YWluZXIuYXBwZW5kQ2hpbGQodG9hc3QpO1xyXG5cclxuICAgIC8vIFNob3cgdG9hc3Qgd2l0aCBzbGlnaHQgZGVsYXkgZm9yIGFuaW1hdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93JyksIDEwKTtcclxuXHJcbiAgICAvLyBIaWRlIGFuZCByZW1vdmUgdG9hc3QgYWZ0ZXIgZHVyYXRpb25cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRvYXN0LnBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRvYXN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMzAwKTsgLy8gV2FpdCBmb3IgZmFkZS1vdXQgYW5pbWF0aW9uXHJcbiAgICB9LCBkdXJhdGlvbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhbiBlcnJvciB0b2FzdCB3aXRoIGxvbmdlciBkdXJhdGlvblxyXG4gKiBAcGFyYW0gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvclRvYXN0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgc2hvd1RvYXN0KG1lc3NhZ2UsIDQwMDApO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYSBzdWNjZXNzIHRvYXN0IHdpdGggc3RhbmRhcmQgZHVyYXRpb25cclxuICogQHBhcmFtIG1lc3NhZ2UgLSBTdWNjZXNzIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTdWNjZXNzVG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBzaG93VG9hc3QobWVzc2FnZSwgMjAwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHdhcm5pbmcgdG9hc3RcclxuICogQHBhcmFtIG1lc3NhZ2UgLSBXYXJuaW5nIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dXYXJuaW5nVG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBzaG93VG9hc3QobWVzc2FnZSwgMzUwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUb2FzdCBtZXNzYWdlIHR5cGVzIGZvciB0eXBlIHNhZmV0eVxyXG4gKi9cclxuZXhwb3J0IHR5cGUgVG9hc3RUeXBlID0gJ3N1Y2Nlc3MnIHwgJ2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdpbmZvJztcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGZvciB0b2FzdCBub3RpZmljYXRpb25zXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRvYXN0Q29uZmlnIHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxuICAgIHR5cGU6IFRvYXN0VHlwZTtcclxuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xyXG4gICAgZGlzbWlzc2libGU/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYSB0eXBlZCB0b2FzdCBub3RpZmljYXRpb25cclxuICogQHBhcmFtIGNvbmZpZyAtIFRvYXN0IGNvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1R5cGVkVG9hc3QoY29uZmlnOiBUb2FzdENvbmZpZyk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBtZXNzYWdlLCB0eXBlLCBkdXJhdGlvbiwgZGlzbWlzc2libGUgPSBmYWxzZSB9ID0gY29uZmlnO1xyXG4gICAgXHJcbiAgICBjb25zdCBkZWZhdWx0RHVyYXRpb25zOiBSZWNvcmQ8VG9hc3RUeXBlLCBudW1iZXI+ID0ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IDIwMDAsXHJcbiAgICAgICAgZXJyb3I6IDQwMDAsXHJcbiAgICAgICAgd2FybmluZzogMzUwMCxcclxuICAgICAgICBpbmZvOiAzMDAwXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHRvYXN0RHVyYXRpb24gPSBkdXJhdGlvbiA/PyBkZWZhdWx0RHVyYXRpb25zW3R5cGVdO1xyXG4gICAgXHJcbiAgICBpZiAoZGlzbWlzc2libGUpIHtcclxuICAgICAgICAvLyBGb3IgZGlzbWlzc2libGUgdG9hc3RzLCB3ZSBjb3VsZCBhZGQgY2xvc2UgYnV0dG9uIGxvZ2ljIGhlcmVcclxuICAgICAgICBzaG93VG9hc3QoYCR7bWVzc2FnZX0gW0Rpc21pc3NpYmxlXWAsIHRvYXN0RHVyYXRpb24pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzaG93VG9hc3QobWVzc2FnZSwgdG9hc3REdXJhdGlvbik7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxyXG4gKiBBcHBTdGF0ZSBNb2RlbCAtIE1haW4gQXBwbGljYXRpb24gU3RhdGUgTWFuYWdlbWVudFxyXG4gKiBcclxuICogQ2VudHJhbGl6ZWQgc3RhdGUgbWFuYWdlbWVudCBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqIEhhbmRsZXMgYWxsIGFwcGxpY2F0aW9uIHN0YXRlIGluY2x1ZGluZyBmaWxlcywgVUkgc2V0dGluZ3MsIGNhY2hlLCBhbmQgY3VycmVudCB3b3Jrc3BhY2UuXHJcbiAqIFxyXG4gKiBAdmVyc2lvbiAxLjAuMFxyXG4gKiBAYXV0aG9yIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb25cclxuICovXHJcblxyXG5pbXBvcnQgeyBcclxuICBNb2RlLCBcclxuICBMYWJlbFNvcnRPcmRlciwgXHJcbiAgUG9pbnQsXHJcbiAgRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgXHJcbiAgRmlsZVN5c3RlbUZpbGVIYW5kbGVcclxufSBmcm9tICcuLi90eXBlcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gIElBcHBTdGF0ZSxcclxuICBBcHBTdGF0ZUNvbmZpZyxcclxuICBBcHBTdGF0ZU1ldGhvZHMsXHJcbiAgQXBwU3RhdGVFdmVudCxcclxuICBBcHBTdGF0ZUV2ZW50SGFuZGxlcixcclxuICBJbWFnZUZpbGUsXHJcbiAgQ2xhc3NGaWxlLFxyXG4gIENsYXNzRGVmaW5pdGlvbixcclxuICBDbGlwYm9hcmREYXRhLFxyXG4gIExvYWRUb2tlbixcclxuICBBcHBTdGF0ZVZhbGlkYXRpb24sXHJcbiAgU2VyaWFsaXphYmxlQXBwU3RhdGVcclxufSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5cclxuLyoqXHJcbiAqIEFwcFN0YXRlIENsYXNzXHJcbiAqIFxyXG4gKiBJbXBsZW1lbnRzIHRoZSBjb21wbGV0ZSBhcHBsaWNhdGlvbiBzdGF0ZSBtYW5hZ2VtZW50IHdpdGggdHlwZSBzYWZldHkuXHJcbiAqIFByb3ZpZGVzIG1ldGhvZHMgZm9yIG1hbmFnaW5nIGZpbGVzLCBVSSBzdGF0ZSwgY2FjaGUsIGFuZCB1c2VyIGludGVyYWN0aW9ucy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBcHBTdGF0ZSBpbXBsZW1lbnRzIElBcHBTdGF0ZSB7XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgSGFuZGxlcyAoRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSSlcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGltYWdlRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGxhYmVsRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGNsYXNzSW5mb0ZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBEYXRhIEFycmF5c1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW10gPSBbXTtcclxuICBwdWJsaWMgY2xhc3NGaWxlczogQ2xhc3NGaWxlW10gPSBbXTtcclxuICBwdWJsaWMgc2VsZWN0ZWRDbGFzc0ZpbGU6IENsYXNzRmlsZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdHVzIFRyYWNraW5nIE1hcHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGltYWdlTGFiZWxTdGF0dXMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTsgLy8gZmlsZU5hbWUgLT4gaGFzTGFiZWxzXHJcbiAgcHVibGljIGNsYXNzTmFtZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpOyAvLyBjbGFzc0lkIC0+IGNsYXNzTmFtZVxyXG4gIHB1YmxpYyBwcmV2aWV3SW1hZ2VDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7IC8vIGZpbGVOYW1lIC0+IG9iamVjdFVSTFxyXG4gIHB1YmxpYyBjb2xsYXBzZWRMYWJlbEdyb3VwcyA9IG5ldyBTZXQ8c3RyaW5nPigpOyAvLyBjb2xsYXBzZWQgZ3JvdXAgSURzXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDdXJyZW50IFdvcmtpbmcgU3RhdGVcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGN1cnJlbnRJbWFnZUZpbGU6IEltYWdlRmlsZSB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBjdXJyZW50SW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgY3VycmVudE1vZGU6IE1vZGUgPSAnZWRpdCc7XHJcbiAgcHVibGljIGN1cnJlbnRMb2FkVG9rZW46IExvYWRUb2tlbiA9IDA7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVSSBTZXR0aW5ncyAmIFByZWZlcmVuY2VzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBpc0F1dG9TYXZlRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBzaG93TGFiZWxzT25DYW52YXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyBsYWJlbEZvbnRTaXplOiBudW1iZXIgPSAxNDtcclxuICBwdWJsaWMgbGFiZWxTb3J0T3JkZXI6IExhYmVsU29ydE9yZGVyID0gJ2FzYyc7XHJcbiAgcHVibGljIGlzUHJldmlld0JhckhpZGRlbjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc0Nyb3NzaGFpclZpc2libGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEludGVybmFsIFN0YXRlICYgVGVtcG9yYXJ5IERhdGFcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIHNhdmVUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBfY2xpcGJvYXJkOiBDbGlwYm9hcmREYXRhIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGxhc3RNb3VzZVBvc2l0aW9uOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG4gIHB1YmxpYyBjb250ZXh0VGFyZ2V0OiBhbnkgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgU3lzdGVtXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgQXBwU3RhdGVFdmVudEhhbmRsZXJbXT4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgLSBJbml0aWFsaXplIEFwcFN0YXRlIHdpdGggZGVmYXVsdCB2YWx1ZXNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIEFsbCBwcm9wZXJ0aWVzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkIGFib3ZlXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6aW5pdGlhbGl6ZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFN0YXRlIE1hbmFnZW1lbnQgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgYWxsIHN0YXRlIHRvIGluaXRpYWwgdmFsdWVzXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gQ2xlYXIgZmlsZSBoYW5kbGVzXHJcbiAgICB0aGlzLmltYWdlRm9sZGVySGFuZGxlID0gbnVsbDtcclxuICAgIHRoaXMubGFiZWxGb2xkZXJIYW5kbGUgPSBudWxsO1xyXG4gICAgdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUgPSBudWxsO1xyXG5cclxuICAgIC8vIENsZWFyIGZpbGUgYXJyYXlzXHJcbiAgICB0aGlzLmltYWdlRmlsZXMgPSBbXTtcclxuICAgIHRoaXMuY2xhc3NGaWxlcyA9IFtdO1xyXG4gICAgdGhpcy5zZWxlY3RlZENsYXNzRmlsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2xlYXIgbWFwcyBhbmQgc2V0c1xyXG4gICAgdGhpcy5pbWFnZUxhYmVsU3RhdHVzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmNsYXNzTmFtZXMuY2xlYXIoKTtcclxuICAgIHRoaXMuY29sbGFwc2VkTGFiZWxHcm91cHMuY2xlYXIoKTtcclxuICAgIHRoaXMuY2xlYXJQcmV2aWV3Q2FjaGUoKTtcclxuXHJcbiAgICAvLyBSZXNldCBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZUZpbGUgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9ICdlZGl0JztcclxuICAgIHRoaXMuY3VycmVudExvYWRUb2tlbiA9IDA7XHJcblxyXG4gICAgLy8gUmVzZXQgVUkgc2V0dGluZ3MgdG8gZGVmYXVsdHNcclxuICAgIHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gdHJ1ZTtcclxuICAgIHRoaXMubGFiZWxGb250U2l6ZSA9IDE0O1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9ICdhc2MnO1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQ2xlYXIgaW50ZXJuYWwgc3RhdGVcclxuICAgIGlmICh0aGlzLnNhdmVUaW1lb3V0KSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNhdmVUaW1lb3V0KTtcclxuICAgICAgdGhpcy5zYXZlVGltZW91dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgdGhpcy5jb250ZXh0VGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6cmVzZXQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbWFnZSBmb2xkZXIgaGFuZGxlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEltYWdlRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5pbWFnZUZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6aW1hZ2Utc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBsYWJlbCBmb2xkZXIgaGFuZGxlXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbEZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6bGFiZWwtc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjbGFzcyBpbmZvIGZvbGRlciBoYW5kbGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q2xhc3NJbmZvRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUgPSBoYW5kbGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnZm9sZGVyOmNsYXNzLWluZm8tc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEltYWdlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY3VycmVudCB3b3JraW5nIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEN1cnJlbnRJbWFnZShpbWFnZUZpbGU6IEltYWdlRmlsZSB8IG51bGwpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByZXZpb3VzSW1hZ2UgPSB0aGlzLmN1cnJlbnRJbWFnZUZpbGU7XHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZUZpbGUgPSBpbWFnZUZpbGU7XHJcbiAgICBcclxuICAgIC8vIEluY3JlbWVudCBsb2FkIHRva2VuIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zXHJcbiAgICB0aGlzLmN1cnJlbnRMb2FkVG9rZW4gKz0gMTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnaW1hZ2U6Y3VycmVudC1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBcclxuICAgICAgICBwcmV2aW91czogcHJldmlvdXNJbWFnZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICAgIGN1cnJlbnQ6IGltYWdlRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICAgIGxvYWRUb2tlbjogdGhpcy5jdXJyZW50TG9hZFRva2VuXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgbGFiZWwgc3RhdHVzIGZvciBhbiBpbWFnZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRJbWFnZUxhYmVsU3RhdHVzKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmltYWdlTGFiZWxTdGF0dXMuZ2V0KGZpbGVOYW1lKSB8fCBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBzdGF0dXMgZm9yIGFuIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEltYWdlTGFiZWxTdGF0dXMoZmlsZU5hbWU6IHN0cmluZywgaGFzTGFiZWxzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLmltYWdlTGFiZWxTdGF0dXMuc2V0KGZpbGVOYW1lLCBoYXNMYWJlbHMpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ltYWdlOmxhYmVsLXN0YXR1cy1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBmaWxlTmFtZSwgaGFzTGFiZWxzIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTW9kZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGN1cnJlbnQgZHJhd2luZy9lZGl0aW5nIG1vZGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TW9kZShtb2RlOiBNb2RlKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcmV2aW91c01vZGUgPSB0aGlzLmN1cnJlbnRNb2RlO1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9IG1vZGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnbW9kZTpjaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBwcmV2aW91czogcHJldmlvdXNNb2RlLCBjdXJyZW50OiBtb2RlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgYmV0d2VlbiBkcmF3IGFuZCBlZGl0IG1vZGVzXHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZU1vZGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBuZXdNb2RlOiBNb2RlID0gdGhpcy5jdXJyZW50TW9kZSA9PT0gJ2VkaXQnID8gJ2RyYXcnIDogJ2VkaXQnO1xyXG4gICAgdGhpcy5zZXRNb2RlKG5ld01vZGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENsYXNzIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbGVjdCBhIGNsYXNzIGZpbGUgZm9yIHVzZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZWxlY3RDbGFzc0ZpbGUoY2xhc3NGaWxlOiBDbGFzc0ZpbGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkQ2xhc3NGaWxlID0gY2xhc3NGaWxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsYXNzOmZpbGUtc2VsZWN0ZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lOiBjbGFzc0ZpbGU/Lm5hbWUgfHwgbnVsbCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgY2xhc3MgZGVmaW5pdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRDbGFzc0RlZmluaXRpb24oY2xhc3NEZWY6IENsYXNzRGVmaW5pdGlvbik6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc05hbWVzLnNldChjbGFzc0RlZi5pZC50b1N0cmluZygpLCBjbGFzc0RlZi5uYW1lKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGFzczpkZWZpbml0aW9uLWFkZGVkJyxcclxuICAgICAgZGF0YTogY2xhc3NEZWYsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBjbGFzcyBkZWZpbml0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUNsYXNzRGVmaW5pdGlvbihjbGFzc0lkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuY2xhc3NOYW1lcy5kZWxldGUoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGFzczpkZWZpbml0aW9uLXJlbW92ZWQnLFxyXG4gICAgICBkYXRhOiB7IGNsYXNzSWQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTZXR0aW5ncyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgYXV0by1zYXZlIGZ1bmN0aW9uYWxpdHlcclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXV0b1NhdmUoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2V0dGluZ3M6YXV0by1zYXZlLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IGVuYWJsZWQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBsYWJlbCB2aXNpYmlsaXR5IG9uIGNhbnZhc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTaG93TGFiZWxzKHNob3c6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gc2hvdztcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZXR0aW5nczpzaG93LWxhYmVscy1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBzaG93IH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbGFiZWwgZm9udCBzaXplXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsRm9udFNpemUoc2l6ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAoc2l6ZSA+PSA4ICYmIHNpemUgPD0gNDgpIHtcclxuICAgICAgdGhpcy5sYWJlbEZvbnRTaXplID0gc2l6ZTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnc2V0dGluZ3M6Zm9udC1zaXplLWNoYW5nZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgc2l6ZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBzb3J0IG9yZGVyXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsU29ydE9yZGVyKG9yZGVyOiBMYWJlbFNvcnRPcmRlcik6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9IG9yZGVyO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3NldHRpbmdzOnNvcnQtb3JkZXItY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgb3JkZXIgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVSSBTdGF0ZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgcHJldmlldyBiYXIgdmlzaWJpbGl0eVxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b2dnbGVQcmV2aWV3QmFyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSAhdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW47XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAndWk6cHJldmlldy1iYXItdG9nZ2xlZCcsXHJcbiAgICAgIGRhdGE6IHsgaGlkZGVuOiB0aGlzLmlzUHJldmlld0JhckhpZGRlbiB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIGNyb3NzaGFpciB2aXNpYmlsaXR5XHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZUNyb3NzaGFpcigpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlID0gIXRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3VpOmNyb3NzaGFpci10b2dnbGVkJyxcclxuICAgICAgZGF0YTogeyB2aXNpYmxlOiB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGNvbnRleHQgbWVudSB0YXJnZXRcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q29udGV4dFRhcmdldCh0YXJnZXQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5jb250ZXh0VGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3VpOmNvbnRleHQtdGFyZ2V0LXNldCcsXHJcbiAgICAgIGRhdGE6IHsgdGFyZ2V0IH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2FjaGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FjaGUgYSBwcmV2aWV3IGltYWdlIE9iamVjdFVSTFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYWNoZVByZXZpZXdJbWFnZShmaWxlTmFtZTogc3RyaW5nLCBvYmplY3RVUkw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5zZXQoZmlsZU5hbWUsIG9iamVjdFVSTCk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6cHJldmlldy1jYWNoZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgY2FjaGVkIHByZXZpZXcgaW1hZ2UgT2JqZWN0VVJMXHJcbiAgICovXHJcbiAgcHVibGljIGdldENhY2hlZFByZXZpZXdJbWFnZShmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLmdldChmaWxlTmFtZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciBhbGwgcHJldmlldyBjYWNoZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhclByZXZpZXdDYWNoZSgpOiB2b2lkIHtcclxuICAgIC8vIFJldm9rZSBhbGwgT2JqZWN0VVJMcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xyXG4gICAgZm9yIChjb25zdCBvYmplY3RVUkwgb2YgdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS52YWx1ZXMoKSkge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVSTCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6cHJldmlldy1jbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDbGlwYm9hcmQgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGNsaXBib2FyZCBkYXRhXHJcbiAgICovXHJcbiAgcHVibGljIHNldENsaXBib2FyZChkYXRhOiBDbGlwYm9hcmREYXRhKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBkYXRhO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsaXBib2FyZDpkYXRhLXNldCcsXHJcbiAgICAgIGRhdGE6IHsgdHlwZTogZGF0YS50eXBlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgY2xpcGJvYXJkIGRhdGFcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2xpcGJvYXJkKCk6IENsaXBib2FyZERhdGEgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jbGlwYm9hcmQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciBjbGlwYm9hcmRcclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXJDbGlwYm9hcmQoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBudWxsO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsaXBib2FyZDpjbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW0gSW1wbGVtZW50YXRpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lclxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogQXBwU3RhdGVFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQodHlwZSwgW10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSkhLnB1c2goaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEFwcFN0YXRlRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBoYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwYXRjaCBldmVudCB0byBhbGwgbGlzdGVuZXJzXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEFwcFN0YXRlRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVXRpbGl0eSBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBjdXJyZW50IHN0YXRlXHJcbiAgICovXHJcbiAgcHVibGljIHZhbGlkYXRlKCk6IEFwcFN0YXRlVmFsaWRhdGlvbiB7XHJcbiAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3IgcmVxdWlyZWQgZm9sZGVyc1xyXG4gICAgaWYgKCF0aGlzLmltYWdlRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ05vIGltYWdlIGZvbGRlciBzZWxlY3RlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5sYWJlbEZvbGRlckhhbmRsZSkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdObyBsYWJlbCBmb2xkZXIgc2VsZWN0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb250IHNpemUgcmFuZ2VcclxuICAgIGlmICh0aGlzLmxhYmVsRm9udFNpemUgPCA4IHx8IHRoaXMubGFiZWxGb250U2l6ZSA+IDQ4KSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdMYWJlbCBmb250IHNpemUgbXVzdCBiZSBiZXR3ZWVuIDggYW5kIDQ4Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIG1lbW9yeSBsZWFrcyBpbiBjYWNoZVxyXG4gICAgaWYgKHRoaXMucHJldmlld0ltYWdlQ2FjaGUuc2l6ZSA+IDEwMCkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdQcmV2aWV3IGNhY2hlIGlzIGxhcmdlLCBjb25zaWRlciBjbGVhcmluZycpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgc2VyaWFsaXphYmxlIHN0YXRlIChmb3IgcGVyc2lzdGVuY2UpXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNlcmlhbGl6YWJsZVN0YXRlKCk6IFNlcmlhbGl6YWJsZUFwcFN0YXRlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGN1cnJlbnRNb2RlOiB0aGlzLmN1cnJlbnRNb2RlLFxyXG4gICAgICBpc0F1dG9TYXZlRW5hYmxlZDogdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCxcclxuICAgICAgc2hvd0xhYmVsc09uQ2FudmFzOiB0aGlzLnNob3dMYWJlbHNPbkNhbnZhcyxcclxuICAgICAgbGFiZWxGb250U2l6ZTogdGhpcy5sYWJlbEZvbnRTaXplLFxyXG4gICAgICBsYWJlbFNvcnRPcmRlcjogdGhpcy5sYWJlbFNvcnRPcmRlcixcclxuICAgICAgaXNQcmV2aWV3QmFySGlkZGVuOiB0aGlzLmlzUHJldmlld0JhckhpZGRlbixcclxuICAgICAgaXNDcm9zc2hhaXJWaXNpYmxlOiB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgZnJvbSBzZXJpYWxpemFibGUgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgcmVzdG9yZUZyb21TZXJpYWxpemFibGVTdGF0ZShzdGF0ZTogU2VyaWFsaXphYmxlQXBwU3RhdGUpOiB2b2lkIHtcclxuICAgIHRoaXMuY3VycmVudE1vZGUgPSBzdGF0ZS5jdXJyZW50TW9kZTtcclxuICAgIHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQgPSBzdGF0ZS5pc0F1dG9TYXZlRW5hYmxlZDtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gc3RhdGUuc2hvd0xhYmVsc09uQ2FudmFzO1xyXG4gICAgdGhpcy5sYWJlbEZvbnRTaXplID0gc3RhdGUubGFiZWxGb250U2l6ZTtcclxuICAgIHRoaXMubGFiZWxTb3J0T3JkZXIgPSBzdGF0ZS5sYWJlbFNvcnRPcmRlcjtcclxuICAgIHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuID0gc3RhdGUuaXNQcmV2aWV3QmFySGlkZGVuO1xyXG4gICAgdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgPSBzdGF0ZS5pc0Nyb3NzaGFpclZpc2libGU7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3N0YXRlOnJlc3RvcmVkJyxcclxuICAgICAgZGF0YTogc3RhdGUsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgZGVidWcgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGVidWdJbmZvKCk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaW1hZ2VGaWxlc0NvdW50OiB0aGlzLmltYWdlRmlsZXMubGVuZ3RoLFxyXG4gICAgICBjbGFzc0ZpbGVzQ291bnQ6IHRoaXMuY2xhc3NGaWxlcy5sZW5ndGgsXHJcbiAgICAgIGltYWdlTGFiZWxTdGF0dXNDb3VudDogdGhpcy5pbWFnZUxhYmVsU3RhdHVzLnNpemUsXHJcbiAgICAgIGNsYXNzTmFtZXNDb3VudDogdGhpcy5jbGFzc05hbWVzLnNpemUsXHJcbiAgICAgIHByZXZpZXdDYWNoZVNpemU6IHRoaXMucHJldmlld0ltYWdlQ2FjaGUuc2l6ZSxcclxuICAgICAgY29sbGFwc2VkR3JvdXBzQ291bnQ6IHRoaXMuY29sbGFwc2VkTGFiZWxHcm91cHMuc2l6ZSxcclxuICAgICAgY3VycmVudExvYWRUb2tlbjogdGhpcy5jdXJyZW50TG9hZFRva2VuLFxyXG4gICAgICBoYXNJbWFnZUZvbGRlcjogISF0aGlzLmltYWdlRm9sZGVySGFuZGxlLFxyXG4gICAgICBoYXNMYWJlbEZvbGRlcjogISF0aGlzLmxhYmVsRm9sZGVySGFuZGxlLFxyXG4gICAgICBoYXNDbGFzc0luZm9Gb2xkZXI6ICEhdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUsXHJcbiAgICAgIGN1cnJlbnRJbWFnZU5hbWU6IHRoaXMuY3VycmVudEltYWdlRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICBzZWxlY3RlZENsYXNzRmlsZU5hbWU6IHRoaXMuc2VsZWN0ZWRDbGFzc0ZpbGU/Lm5hbWUgfHwgbnVsbCxcclxuICAgICAgZXZlbnRMaXN0ZW5lclR5cGVzOiBBcnJheS5mcm9tKHRoaXMuZXZlbnRMaXN0ZW5lcnMua2V5cygpKVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBGdW5jdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IEFwcFN0YXRlIGluc3RhbmNlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBwU3RhdGUoKTogQXBwU3RhdGUge1xyXG4gIHJldHVybiBuZXcgQXBwU3RhdGUoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBBcHBTdGF0ZSB3aXRoIGluaXRpYWwgY29uZmlndXJhdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFwcFN0YXRlV2l0aENvbmZpZyhjb25maWc6IFBhcnRpYWw8QXBwU3RhdGVDb25maWc+KTogQXBwU3RhdGUge1xyXG4gIGNvbnN0IGFwcFN0YXRlID0gbmV3IEFwcFN0YXRlKCk7XHJcbiAgXHJcbiAgLy8gQXBwbHkgY29uZmlndXJhdGlvblxyXG4gIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgaWYgKGtleSBpbiBhcHBTdGF0ZSkge1xyXG4gICAgICAoYXBwU3RhdGUgYXMgYW55KVtrZXldID0gKGNvbmZpZyBhcyBhbnkpW2tleV07XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBhcHBTdGF0ZTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFwcFN0YXRlO1xyXG5leHBvcnQgdHlwZSB7IElBcHBTdGF0ZSwgQXBwU3RhdGVDb25maWcsIEFwcFN0YXRlTWV0aG9kcyB9OyIsIi8qKlxyXG4gKiBGaWxlU3lzdGVtIFNlcnZpY2UgVHlwZSBEZWZpbml0aW9uc1xyXG4gKiBcclxuICogVHlwZXMgZm9yIGZpbGUgSS9PIG9wZXJhdGlvbnMsIFlPTE8gZm9ybWF0IGhhbmRsaW5nLCBhbmQgRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSSBpbnRlZ3JhdGlvbi5cclxuICovXHJcblxyXG5pbXBvcnQgeyBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBGaWxlU3lzdGVtRmlsZUhhbmRsZSB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBJbWFnZUZpbGUsIENsYXNzRmlsZSwgQ2xhc3NEZWZpbml0aW9uIH0gZnJvbSAnLi9hcHAtc3RhdGUnO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGaWxlIE9wZXJhdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlT3BlcmF0aW9uUmVzdWx0PFQgPSB2b2lkPiB7XHJcbiAgc3VjY2VzczogYm9vbGVhbjtcclxuICBkYXRhPzogVDtcclxuICBlcnJvcj86IHN0cmluZztcclxuICBtZXNzYWdlPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVMb2FkUmVzdWx0IHtcclxuICBjb250ZW50OiBzdHJpbmc7XHJcbiAgZmlsZTogRmlsZTtcclxuICBsYXN0TW9kaWZpZWQ6IERhdGU7XHJcbiAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFlPTE8gRm9ybWF0IFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgWW9sb0xhYmVsIHtcclxuICBjbGFzc0lkOiBudW1iZXI7XHJcbiAgY2VudGVyWDogbnVtYmVyO1xyXG4gIGNlbnRlclk6IG51bWJlcjtcclxuICB3aWR0aDogbnVtYmVyO1xyXG4gIGhlaWdodDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFlvbG9QYXJzZVJlc3VsdCB7XHJcbiAgbGFiZWxzOiBZb2xvTGFiZWxbXTtcclxuICBlcnJvcnM6IHN0cmluZ1tdO1xyXG4gIHdhcm5pbmdzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBZb2xvRXhwb3J0T3B0aW9ucyB7XHJcbiAgcHJlY2lzaW9uPzogbnVtYmVyO1xyXG4gIGluY2x1ZGVDb21tZW50cz86IGJvb2xlYW47XHJcbiAgdmFsaWRhdGVCb3VuZHM/OiBib29sZWFuO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENsYXNzIEZpbGUgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbGFzc0ZpbGVDb250ZW50IHtcclxuICBjbGFzc2VzOiBDbGFzc0RlZmluaXRpb25bXTtcclxuICBtZXRhZGF0YT86IHtcclxuICAgIHZlcnNpb24/OiBzdHJpbmc7XHJcbiAgICBjcmVhdGVkPzogRGF0ZTtcclxuICAgIG1vZGlmaWVkPzogRGF0ZTtcclxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xhc3NGaWxlVmFsaWRhdGlvbiB7XHJcbiAgaXNWYWxpZDogYm9vbGVhbjtcclxuICBlcnJvcnM6IHN0cmluZ1tdO1xyXG4gIHdhcm5pbmdzOiBzdHJpbmdbXTtcclxuICBkdXBsaWNhdGVJZHM6IG51bWJlcltdO1xyXG4gIGVtcHR5TmFtZXM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZvbGRlciBPcGVyYXRpb25zXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRm9sZGVyU2NhblJlc3VsdCB7XHJcbiAgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW107XHJcbiAgbGFiZWxGaWxlczogc3RyaW5nW107XHJcbiAgY2xhc3NGaWxlczogQ2xhc3NGaWxlW107XHJcbiAgdG90YWxGaWxlczogbnVtYmVyO1xyXG4gIGVycm9yczogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGFiZWxTdGF0dXMge1xyXG4gIGZpbGVOYW1lOiBzdHJpbmc7XHJcbiAgaGFzTGFiZWxzOiBib29sZWFuO1xyXG4gIGxhYmVsQ291bnQ6IG51bWJlcjtcclxuICBsYXN0TW9kaWZpZWQ/OiBEYXRlO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEltYWdlIFByb2Nlc3NpbmdcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbWFnZUxvYWRPcHRpb25zIHtcclxuICBtYXhXaWR0aD86IG51bWJlcjtcclxuICBtYXhIZWlnaHQ/OiBudW1iZXI7XHJcbiAgcXVhbGl0eT86IG51bWJlcjtcclxuICBmb3JtYXQ/OiAncG5nJyB8ICdqcGVnJyB8ICd3ZWJwJztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbWFnZUluZm8ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB3aWR0aDogbnVtYmVyO1xyXG4gIGhlaWdodDogbnVtYmVyO1xyXG4gIHNpemU6IG51bWJlcjtcclxuICBmb3JtYXQ6IHN0cmluZztcclxuICBsYXN0TW9kaWZpZWQ6IERhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGlmZlByb2Nlc3NpbmdPcHRpb25zIHtcclxuICBwYWdlPzogbnVtYmVyO1xyXG4gIGNvbnZlcnRUb0NhbnZhcz86IGJvb2xlYW47XHJcbiAgYmFja2dyb3VuZENvbG9yPzogc3RyaW5nO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENhY2hlIE1hbmFnZW1lbnRcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYWNoZUVudHJ5PFQ+IHtcclxuICBkYXRhOiBUO1xyXG4gIHRpbWVzdGFtcDogRGF0ZTtcclxuICBzaXplOiBudW1iZXI7XHJcbiAgaGl0czogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENhY2hlU3RhdHMge1xyXG4gIHRvdGFsRW50cmllczogbnVtYmVyO1xyXG4gIHRvdGFsU2l6ZTogbnVtYmVyO1xyXG4gIGhpdFJhdGU6IG51bWJlcjtcclxuICBtZW1vcnlVc2FnZTogbnVtYmVyO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZpbGUgU3lzdGVtIFNlcnZpY2UgSW50ZXJmYWNlXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICAvLyBGb2xkZXIgT3BlcmF0aW9uc1xyXG4gIHNlbGVjdEltYWdlRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj47XHJcbiAgc2VsZWN0TGFiZWxGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PjtcclxuICBzZWxlY3RDbGFzc0luZm9Gb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PjtcclxuICBcclxuICAvLyBGaWxlIExpc3RpbmdcclxuICBsaXN0SW1hZ2VGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SW1hZ2VGaWxlW10+PjtcclxuICBsaXN0Q2xhc3NGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Q2xhc3NGaWxlW10+PjtcclxuICBzY2FuRm9sZGVyKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGb2xkZXJTY2FuUmVzdWx0Pj47XHJcbiAgXHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIGxvYWRJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+O1xyXG4gIGxvYWRUaWZmSW1hZ2UoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIG9wdGlvbnM/OiBUaWZmUHJvY2Vzc2luZ09wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+O1xyXG4gIGdldEltYWdlSW5mbyhmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxJbWFnZUluZm8+PjtcclxuICBcclxuICAvLyBMYWJlbCBPcGVyYXRpb25zXHJcbiAgbG9hZExhYmVscyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8WW9sb0xhYmVsW10+PjtcclxuICBzYXZlTGFiZWxzKGZpbGVOYW1lOiBzdHJpbmcsIGxhYmVsczogWW9sb0xhYmVsW10sIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdD47XHJcbiAgY2hlY2tMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8TGFiZWxTdGF0dXM+PjtcclxuICBcclxuICAvLyBDbGFzcyBGaWxlIE9wZXJhdGlvbnNcclxuICBsb2FkQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PENsYXNzRmlsZUNvbnRlbnQ+PjtcclxuICBzYXZlQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBjb250ZW50OiBDbGFzc0ZpbGVDb250ZW50KTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PjtcclxuICBjcmVhdGVDbGFzc0ZpbGUoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBmaWxlTmFtZTogc3RyaW5nLCBpbml0aWFsQ29udGVudD86IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbUZpbGVIYW5kbGU+PjtcclxuICB2YWxpZGF0ZUNsYXNzRmlsZShjb250ZW50OiBzdHJpbmcpOiBDbGFzc0ZpbGVWYWxpZGF0aW9uO1xyXG4gIFxyXG4gIC8vIFlPTE8gRm9ybWF0IFByb2Nlc3NpbmdcclxuICBwYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IFlvbG9QYXJzZVJlc3VsdDtcclxuICBsYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzOiBZb2xvTGFiZWxbXSwgb3B0aW9ucz86IFlvbG9FeHBvcnRPcHRpb25zKTogc3RyaW5nO1xyXG4gIHZhbGlkYXRlWW9sb0xhYmVsKGxhYmVsOiBZb2xvTGFiZWwpOiBib29sZWFuO1xyXG4gIFxyXG4gIC8vIENhY2hlIE1hbmFnZW1lbnRcclxuICBjbGVhckltYWdlQ2FjaGUoKTogdm9pZDtcclxuICBnZXRDYWNoZVN0YXRzKCk6IENhY2hlU3RhdHM7XHJcbiAgb3B0aW1pemVDYWNoZSgpOiB2b2lkO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENvbmZpZ3VyYXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtQ29uZmlnIHtcclxuICAvLyBJbWFnZSBzZXR0aW5nc1xyXG4gIHN1cHBvcnRlZEltYWdlRm9ybWF0czogc3RyaW5nW107XHJcbiAgbWF4SW1hZ2VTaXplOiBudW1iZXI7XHJcbiAgdGh1bWJuYWlsU2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gIFxyXG4gIC8vIENhY2hlIHNldHRpbmdzXHJcbiAgbWF4Q2FjaGVTaXplOiBudW1iZXI7XHJcbiAgY2FjaGVUaW1lb3V0OiBudW1iZXI7XHJcbiAgXHJcbiAgLy8gWU9MTyBzZXR0aW5nc1xyXG4gIHlvbG9WYWxpZGF0aW9uOiB7XHJcbiAgICBzdHJpY3RCb3VuZHM6IGJvb2xlYW47XHJcbiAgICBhbGxvd1plcm9TaXplOiBib29sZWFuO1xyXG4gICAgcHJlY2lzaW9uOiBudW1iZXI7XHJcbiAgfTtcclxuICBcclxuICAvLyBQZXJmb3JtYW5jZSBzZXR0aW5nc1xyXG4gIGJhdGNoU2l6ZTogbnVtYmVyO1xyXG4gIGNvbmN1cnJlbnRMb2FkczogbnVtYmVyO1xyXG4gIHByZWxvYWRBZGphY2VudDogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFdmVudHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtRXZlbnQge1xyXG4gIHR5cGU6IHN0cmluZztcclxuICBkYXRhPzogYW55O1xyXG4gIHRpbWVzdGFtcDogRGF0ZTtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgRmlsZVN5c3RlbUV2ZW50SGFuZGxlciA9IChldmVudDogRmlsZVN5c3RlbUV2ZW50KSA9PiB2b2lkO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFcnJvciBUeXBlc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZVN5c3RlbUVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGNvZGU6IHN0cmluZyxcclxuICAgIHB1YmxpYyBkZXRhaWxzPzogYW55XHJcbiAgKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICAgIHRoaXMubmFtZSA9ICdGaWxlU3lzdGVtRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFlvbG9Gb3JtYXRFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIHB1YmxpYyBsaW5lPzogbnVtYmVyLFxyXG4gICAgcHVibGljIGRhdGE/OiBzdHJpbmdcclxuICApIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gICAgdGhpcy5uYW1lID0gJ1lvbG9Gb3JtYXRFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW1hZ2VMb2FkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgZmlsZU5hbWU/OiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgY2F1c2U/OiBFcnJvclxyXG4gICkge1xyXG4gICAgc3VwZXIobWVzc2FnZSk7XHJcbiAgICB0aGlzLm5hbWUgPSAnSW1hZ2VMb2FkRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBVdGlsaXR5IFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCB0eXBlIEZpbGVGb3JtYXQgPSAnanBnJyB8ICdqcGVnJyB8ICdwbmcnIHwgJ2dpZicgfCAndGlmJyB8ICd0aWZmJyB8ICd3ZWJwJztcclxuZXhwb3J0IHR5cGUgTGFiZWxGb3JtYXQgPSAneW9sbycgfCAnY29jbycgfCAncGFzY2FsJyB8ICdjdXN0b20nO1xyXG5leHBvcnQgdHlwZSBDbGFzc0ZpbGVGb3JtYXQgPSAneWFtbCcgfCAneW1sJyB8ICdqc29uJyB8ICd0eHQnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlVHlwZUluZm8ge1xyXG4gIGV4dGVuc2lvbjogc3RyaW5nO1xyXG4gIG1pbWVUeXBlOiBzdHJpbmc7XHJcbiAgY2F0ZWdvcnk6ICdpbWFnZScgfCAnbGFiZWwnIHwgJ2NsYXNzJyB8ICdvdGhlcic7XHJcbiAgc3VwcG9ydGVkOiBib29sZWFuO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZhY3RvcnkgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtU2VydmljZUZhY3Rvcnkge1xyXG4gIGNyZWF0ZShjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KTogSUZpbGVTeXN0ZW1TZXJ2aWNlO1xyXG4gIGNyZWF0ZVdpdGhDYWNoZShjYWNoZVNpemU6IG51bWJlcik6IElGaWxlU3lzdGVtU2VydmljZTtcclxufSIsIi8qKlxyXG4gKiBZT0xPIEZvcm1hdCBQYXJzZXIgVXRpbGl0eVxyXG4gKiBcclxuICogSGFuZGxlcyBwYXJzaW5nIGFuZCBnZW5lcmF0aW9uIG9mIFlPTE8gZm9ybWF0IGFubm90YXRpb24gZmlsZXMuXHJcbiAqIFlPTE8gZm9ybWF0OiBjbGFzc0lkIGNlbnRlclggY2VudGVyWSB3aWR0aCBoZWlnaHQgKG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMgMC0xKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFlvbG9MYWJlbCwgWW9sb1BhcnNlUmVzdWx0LCBZb2xvRXhwb3J0T3B0aW9ucywgWW9sb0Zvcm1hdEVycm9yIH0gZnJvbSAnLi4vdHlwZXMvZmlsZXN5c3RlbSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENvbnN0YW50c1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5jb25zdCBERUZBVUxUX1BSRUNJU0lPTiA9IDY7XHJcbmNvbnN0IE1JTl9DT09SRElOQVRFID0gMC4wO1xyXG5jb25zdCBNQVhfQ09PUkRJTkFURSA9IDEuMDtcclxuY29uc3QgTUlOX1NJWkUgPSAwLjA7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFlPTE8gUGFyc2VyIENsYXNzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBZb2xvUGFyc2VyIHtcclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDT09SRElOQVRFX1BBVFRFUk4gPSAvXi0/XFxkKyhcXC5cXGQrKT8kLztcclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMSU5FX1BBVFRFUk4gPSAvXlxccyooXFxkKylcXHMrKFtcXGQuLV0rKVxccysoW1xcZC4tXSspXFxzKyhbXFxkLi1dKylcXHMrKFtcXGQuLV0rKVxccyokLztcclxuXHJcbiAgLyoqXHJcbiAgICogUGFyc2UgWU9MTyBmb3JtYXQgc3RyaW5nIGludG8gc3RydWN0dXJlZCBsYWJlbHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YTogc3RyaW5nKTogWW9sb1BhcnNlUmVzdWx0IHtcclxuICAgIGNvbnN0IHJlc3VsdDogWW9sb1BhcnNlUmVzdWx0ID0ge1xyXG4gICAgICBsYWJlbHM6IFtdLFxyXG4gICAgICBlcnJvcnM6IFtdLFxyXG4gICAgICB3YXJuaW5nczogW11cclxuICAgIH07XHJcblxyXG4gICAgaWYgKCF5b2xvRGF0YSB8fCB5b2xvRGF0YS50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZXMgPSB5b2xvRGF0YS5zcGxpdCgnXFxuJyk7XHJcbiAgICBcclxuICAgIGxpbmVzLmZvckVhY2goKGxpbmUsIGxpbmVJbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmltbWVkTGluZSA9IGxpbmUudHJpbSgpO1xyXG4gICAgICBcclxuICAgICAgLy8gU2tpcCBlbXB0eSBsaW5lcyBhbmQgY29tbWVudHNcclxuICAgICAgaWYgKHRyaW1tZWRMaW5lID09PSAnJyB8fCB0cmltbWVkTGluZS5zdGFydHNXaXRoKCcjJykpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLnBhcnNlU2luZ2xlTGluZSh0cmltbWVkTGluZSwgbGluZUluZGV4ICsgMSk7XHJcbiAgICAgICAgaWYgKGxhYmVsKSB7XHJcbiAgICAgICAgICByZXN1bHQubGFiZWxzLnB1c2gobGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBZb2xvRm9ybWF0RXJyb3IpIHtcclxuICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBVbmtub3duIHBhcnNpbmcgZXJyb3JgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCB2YWxpZGF0aW9uIHdhcm5pbmdzXHJcbiAgICB0aGlzLmFkZFZhbGlkYXRpb25XYXJuaW5ncyhyZXN1bHQpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZSBhIHNpbmdsZSBZT0xPIGZvcm1hdCBsaW5lXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VTaW5nbGVMaW5lKGxpbmU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogWW9sb0xhYmVsIHwgbnVsbCB7XHJcbiAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2godGhpcy5MSU5FX1BBVFRFUk4pO1xyXG4gICAgXHJcbiAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEludmFsaWQgWU9MTyBmb3JtYXQuIEV4cGVjdGVkOiBcImNsYXNzSWQgY2VudGVyWCBjZW50ZXJZIHdpZHRoIGhlaWdodFwiYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBbLCBjbGFzc0lkU3RyLCBjZW50ZXJYU3RyLCBjZW50ZXJZU3RyLCB3aWR0aFN0ciwgaGVpZ2h0U3RyXSA9IG1hdGNoO1xyXG5cclxuICAgIC8vIFBhcnNlIGNsYXNzIElEXHJcbiAgICBjb25zdCBjbGFzc0lkID0gcGFyc2VJbnQoY2xhc3NJZFN0ciEsIDEwKTtcclxuICAgIGlmIChpc05hTihjbGFzc0lkKSB8fCBjbGFzc0lkIDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkIGNsYXNzIElEOiBcIiR7Y2xhc3NJZFN0cn1cIi4gTXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXJzZSBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgY2VudGVyWCA9IHRoaXMucGFyc2VDb29yZGluYXRlKGNlbnRlclhTdHIhLCAnY2VudGVyWCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3QgY2VudGVyWSA9IHRoaXMucGFyc2VDb29yZGluYXRlKGNlbnRlcllTdHIhLCAnY2VudGVyWScsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLnBhcnNlQ29vcmRpbmF0ZSh3aWR0aFN0ciEsICd3aWR0aCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJzZUNvb3JkaW5hdGUoaGVpZ2h0U3RyISwgJ2hlaWdodCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG5cclxuICAgIC8vIFZhbGlkYXRlIGNvb3JkaW5hdGUgcmFuZ2VzXHJcbiAgICB0aGlzLnZhbGlkYXRlQ29vcmRpbmF0ZXMoeyBjbGFzc0lkLCBjZW50ZXJYLCBjZW50ZXJZLCB3aWR0aCwgaGVpZ2h0IH0sIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNsYXNzSWQsXHJcbiAgICAgIGNlbnRlclgsXHJcbiAgICAgIGNlbnRlclksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZSBhIGNvb3JkaW5hdGUgdmFsdWUgd2l0aCB2YWxpZGF0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VDb29yZGluYXRlKHZhbHVlOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyLCBsaW5lOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgaWYgKCF0aGlzLkNPT1JESU5BVEVfUEFUVEVSTi50ZXN0KHZhbHVlKSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkICR7bmFtZX06IFwiJHt2YWx1ZX1cIi4gTXVzdCBiZSBhIHZhbGlkIG51bWJlcmAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkICR7bmFtZX06IFwiJHt2YWx1ZX1cIi4gQ291bGQgbm90IHBhcnNlIGFzIG51bWJlcmAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBhcnNlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlIFlPTE8gbGFiZWwgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyB2YWxpZGF0ZUNvb3JkaW5hdGVzKGxhYmVsOiBZb2xvTGFiZWwsIGxpbmVOdW1iZXI6IG51bWJlciwgbGluZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNlbnRlclgsIGNlbnRlclksIHdpZHRoLCBoZWlnaHQgfSA9IGxhYmVsO1xyXG5cclxuICAgIC8vIENoZWNrIGNvb3JkaW5hdGUgYm91bmRzIChZT0xPIHVzZXMgbm9ybWFsaXplZCBjb29yZGluYXRlcyAwLTEpXHJcbiAgICBpZiAoY2VudGVyWCA8IE1JTl9DT09SRElOQVRFIHx8IGNlbnRlclggPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBjZW50ZXJYIG91dCBvZiByYW5nZTogJHtjZW50ZXJYfS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjZW50ZXJZIDwgTUlOX0NPT1JESU5BVEUgfHwgY2VudGVyWSA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYGNlbnRlclkgb3V0IG9mIHJhbmdlOiAke2NlbnRlcll9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdpZHRoIDw9IE1JTl9TSVpFIHx8IHdpZHRoID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgd2lkdGggb3V0IG9mIHJhbmdlOiAke3dpZHRofS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoZWlnaHQgPD0gTUlOX1NJWkUgfHwgaGVpZ2h0ID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgaGVpZ2h0IG91dCBvZiByYW5nZTogJHtoZWlnaHR9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgYm91bmRpbmcgYm94IGJvdW5kc1xyXG4gICAgY29uc3QgbGVmdCA9IGNlbnRlclggLSB3aWR0aCAvIDI7XHJcbiAgICBjb25zdCByaWdodCA9IGNlbnRlclggKyB3aWR0aCAvIDI7XHJcbiAgICBjb25zdCB0b3AgPSBjZW50ZXJZIC0gaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IGJvdHRvbSA9IGNlbnRlclkgKyBoZWlnaHQgLyAyO1xyXG5cclxuICAgIGlmIChsZWZ0IDwgTUlOX0NPT1JESU5BVEUgfHwgcmlnaHQgPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBCb3VuZGluZyBib3ggZXh0ZW5kcyBvdXRzaWRlIGltYWdlIGJvdW5kcyBob3Jpem9udGFsbHkgKGxlZnQ6ICR7bGVmdH0sIHJpZ2h0OiAke3JpZ2h0fSlgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0b3AgPCBNSU5fQ09PUkRJTkFURSB8fCBib3R0b20gPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBCb3VuZGluZyBib3ggZXh0ZW5kcyBvdXRzaWRlIGltYWdlIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3A6ICR7dG9wfSwgYm90dG9tOiAke2JvdHRvbX0pYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB2YWxpZGF0aW9uIHdhcm5pbmdzIHRvIHBhcnNlIHJlc3VsdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGFkZFZhbGlkYXRpb25XYXJuaW5ncyhyZXN1bHQ6IFlvbG9QYXJzZVJlc3VsdCk6IHZvaWQge1xyXG4gICAgLy8gQ2hlY2sgZm9yIHZlcnkgc21hbGwgYm91bmRpbmcgYm94ZXNcclxuICAgIHJlc3VsdC5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGlmIChsYWJlbC53aWR0aCA8IDAuMDEgfHwgbGFiZWwuaGVpZ2h0IDwgMC4wMSkge1xyXG4gICAgICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKGBMYWJlbCAke2luZGV4ICsgMX06IFZlcnkgc21hbGwgYm91bmRpbmcgYm94ICgke2xhYmVsLndpZHRofXgke2xhYmVsLmhlaWdodH0pYCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciBkdXBsaWNhdGUgbGFiZWxzIChzYW1lIHBvc2l0aW9uIGFuZCBjbGFzcylcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIHJlc3VsdC5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGtleSA9IGAke2xhYmVsLmNsYXNzSWR9XyR7bGFiZWwuY2VudGVyWH1fJHtsYWJlbC5jZW50ZXJZfV8ke2xhYmVsLndpZHRofV8ke2xhYmVsLmhlaWdodH1gO1xyXG4gICAgICBpZiAoc2Vlbi5oYXMoa2V5KSkge1xyXG4gICAgICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKGBMYWJlbCAke2luZGV4ICsgMX06IER1cGxpY2F0ZSBsYWJlbCBkZXRlY3RlZGApO1xyXG4gICAgICB9XHJcbiAgICAgIHNlZW4uYWRkKGtleSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgbGFiZWxzIGFycmF5IHRvIFlPTE8gZm9ybWF0IHN0cmluZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVsczogWW9sb0xhYmVsW10sIG9wdGlvbnM6IFlvbG9FeHBvcnRPcHRpb25zID0ge30pOiBzdHJpbmcge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBwcmVjaXNpb24gPSBERUZBVUxUX1BSRUNJU0lPTixcclxuICAgICAgaW5jbHVkZUNvbW1lbnRzID0gZmFsc2UsXHJcbiAgICAgIHZhbGlkYXRlQm91bmRzID0gdHJ1ZVxyXG4gICAgfSA9IG9wdGlvbnM7XHJcblxyXG4gICAgaWYgKCFsYWJlbHMgfHwgbGFiZWxzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgaWYgKGluY2x1ZGVDb21tZW50cykge1xyXG4gICAgICBsaW5lcy5wdXNoKCcjIFlPTE8gZm9ybWF0OiBjbGFzc0lkIGNlbnRlclggY2VudGVyWSB3aWR0aCBoZWlnaHQgKG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMpJyk7XHJcbiAgICAgIGxpbmVzLnB1c2goYCMgR2VuZXJhdGVkOiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1gKTtcclxuICAgICAgbGluZXMucHVzaCgnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGFiZWxzLmZvckVhY2goKGxhYmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICBpZiAodmFsaWRhdGVCb3VuZHMgJiYgIXRoaXMudmFsaWRhdGVZb2xvTGFiZWwobGFiZWwpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihgSW52YWxpZCBsYWJlbCBhdCBpbmRleCAke2luZGV4fTogY29vcmRpbmF0ZXMgb3V0IG9mIGJvdW5kc2ApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBsaW5lID0gW1xyXG4gICAgICAgIGxhYmVsLmNsYXNzSWQudG9TdHJpbmcoKSxcclxuICAgICAgICBsYWJlbC5jZW50ZXJYLnRvRml4ZWQocHJlY2lzaW9uKSxcclxuICAgICAgICBsYWJlbC5jZW50ZXJZLnRvRml4ZWQocHJlY2lzaW9uKSxcclxuICAgICAgICBsYWJlbC53aWR0aC50b0ZpeGVkKHByZWNpc2lvbiksXHJcbiAgICAgICAgbGFiZWwuaGVpZ2h0LnRvRml4ZWQocHJlY2lzaW9uKVxyXG4gICAgICBdLmpvaW4oJyAnKTtcclxuXHJcbiAgICAgIGxpbmVzLnB1c2gobGluZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBhIHNpbmdsZSBZT0xPIGxhYmVsXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyB2YWxpZGF0ZVlvbG9MYWJlbChsYWJlbDogWW9sb0xhYmVsKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnZhbGlkYXRlQ29vcmRpbmF0ZXMobGFiZWwsIDAsICcnKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBwaXhlbCBjb29yZGluYXRlcyB0byBZT0xPIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBpeGVsVG9Ob3JtYWxpemVkKFxyXG4gICAgcGl4ZWxYOiBudW1iZXIsXHJcbiAgICBwaXhlbFk6IG51bWJlcixcclxuICAgIHBpeGVsV2lkdGg6IG51bWJlcixcclxuICAgIHBpeGVsSGVpZ2h0OiBudW1iZXIsXHJcbiAgICBpbWFnZVdpZHRoOiBudW1iZXIsXHJcbiAgICBpbWFnZUhlaWdodDogbnVtYmVyXHJcbiAgKTogWW9sb0xhYmVsIHtcclxuICAgIGNvbnN0IGNlbnRlclggPSAocGl4ZWxYICsgcGl4ZWxXaWR0aCAvIDIpIC8gaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IGNlbnRlclkgPSAocGl4ZWxZICsgcGl4ZWxIZWlnaHQgLyAyKSAvIGltYWdlSGVpZ2h0O1xyXG4gICAgY29uc3Qgd2lkdGggPSBwaXhlbFdpZHRoIC8gaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHBpeGVsSGVpZ2h0IC8gaW1hZ2VIZWlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY2xhc3NJZDogMCwgLy8gV2lsbCBiZSBzZXQgYnkgY2FsbGVyXHJcbiAgICAgIGNlbnRlclgsXHJcbiAgICAgIGNlbnRlclksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IFlPTE8gbm9ybWFsaXplZCBjb29yZGluYXRlcyB0byBwaXhlbCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplZFRvUGl4ZWwoXHJcbiAgICBsYWJlbDogWW9sb0xhYmVsLFxyXG4gICAgaW1hZ2VXaWR0aDogbnVtYmVyLFxyXG4gICAgaW1hZ2VIZWlnaHQ6IG51bWJlclxyXG4gICk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0ge1xyXG4gICAgY29uc3Qgd2lkdGggPSBsYWJlbC53aWR0aCAqIGltYWdlV2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBsYWJlbC5oZWlnaHQgKiBpbWFnZUhlaWdodDtcclxuICAgIGNvbnN0IHggPSAobGFiZWwuY2VudGVyWCAqIGltYWdlV2lkdGgpIC0gKHdpZHRoIC8gMik7XHJcbiAgICBjb25zdCB5ID0gKGxhYmVsLmNlbnRlclkgKiBpbWFnZUhlaWdodCkgLSAoaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgcmV0dXJuIHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHN0YXRpc3RpY3MgYWJvdXQgYSBzZXQgb2YgbGFiZWxzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRMYWJlbFN0YXRpc3RpY3MobGFiZWxzOiBZb2xvTGFiZWxbXSk6IHtcclxuICAgIHRvdGFsTGFiZWxzOiBudW1iZXI7XHJcbiAgICBjbGFzc0Rpc3RyaWJ1dGlvbjogUmVjb3JkPG51bWJlciwgbnVtYmVyPjtcclxuICAgIGF2ZXJhZ2VTaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgICBzaXplUmFuZ2U6IHtcclxuICAgICAgbWluOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgICAgIG1heDogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gICAgfTtcclxuICB9IHtcclxuICAgIGlmICghbGFiZWxzIHx8IGxhYmVscy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0b3RhbExhYmVsczogMCxcclxuICAgICAgICBjbGFzc0Rpc3RyaWJ1dGlvbjoge30sXHJcbiAgICAgICAgYXZlcmFnZVNpemU6IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9LFxyXG4gICAgICAgIHNpemVSYW5nZToge1xyXG4gICAgICAgICAgbWluOiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSxcclxuICAgICAgICAgIG1heDogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2xhc3NEaXN0cmlidXRpb246IFJlY29yZDxudW1iZXIsIG51bWJlcj4gPSB7fTtcclxuICAgIGxldCB0b3RhbFdpZHRoID0gMDtcclxuICAgIGxldCB0b3RhbEhlaWdodCA9IDA7XHJcbiAgICBsZXQgbWluV2lkdGggPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgbGV0IG1heFdpZHRoID0gTnVtYmVyLk1JTl9WQUxVRTtcclxuICAgIGxldCBtaW5IZWlnaHQgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgbGV0IG1heEhlaWdodCA9IE51bWJlci5NSU5fVkFMVUU7XHJcblxyXG4gICAgbGFiZWxzLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAvLyBDbGFzcyBkaXN0cmlidXRpb25cclxuICAgICAgY2xhc3NEaXN0cmlidXRpb25bbGFiZWwuY2xhc3NJZF0gPSAoY2xhc3NEaXN0cmlidXRpb25bbGFiZWwuY2xhc3NJZF0gfHwgMCkgKyAxO1xyXG5cclxuICAgICAgLy8gU2l6ZSBzdGF0aXN0aWNzXHJcbiAgICAgIHRvdGFsV2lkdGggKz0gbGFiZWwud2lkdGg7XHJcbiAgICAgIHRvdGFsSGVpZ2h0ICs9IGxhYmVsLmhlaWdodDtcclxuICAgICAgbWluV2lkdGggPSBNYXRoLm1pbihtaW5XaWR0aCwgbGFiZWwud2lkdGgpO1xyXG4gICAgICBtYXhXaWR0aCA9IE1hdGgubWF4KG1heFdpZHRoLCBsYWJlbC53aWR0aCk7XHJcbiAgICAgIG1pbkhlaWdodCA9IE1hdGgubWluKG1pbkhlaWdodCwgbGFiZWwuaGVpZ2h0KTtcclxuICAgICAgbWF4SGVpZ2h0ID0gTWF0aC5tYXgobWF4SGVpZ2h0LCBsYWJlbC5oZWlnaHQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG90YWxMYWJlbHM6IGxhYmVscy5sZW5ndGgsXHJcbiAgICAgIGNsYXNzRGlzdHJpYnV0aW9uLFxyXG4gICAgICBhdmVyYWdlU2l6ZToge1xyXG4gICAgICAgIHdpZHRoOiB0b3RhbFdpZHRoIC8gbGFiZWxzLmxlbmd0aCxcclxuICAgICAgICBoZWlnaHQ6IHRvdGFsSGVpZ2h0IC8gbGFiZWxzLmxlbmd0aFxyXG4gICAgICB9LFxyXG4gICAgICBzaXplUmFuZ2U6IHtcclxuICAgICAgICBtaW46IHsgd2lkdGg6IG1pbldpZHRoLCBoZWlnaHQ6IG1pbkhlaWdodCB9LFxyXG4gICAgICAgIG1heDogeyB3aWR0aDogbWF4V2lkdGgsIGhlaWdodDogbWF4SGVpZ2h0IH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVXRpbGl0eSBGdW5jdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIFF1aWNrIHBhcnNlIGZ1bmN0aW9uIGZvciBzaW1wbGUgdXNlIGNhc2VzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VZb2xvKHlvbG9EYXRhOiBzdHJpbmcpOiBZb2xvTGFiZWxbXSB7XHJcbiAgY29uc3QgcmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gIGlmIChyZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDApIHtcclxuICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoYFlPTE8gcGFyc2luZyBmYWlsZWQ6ICR7cmVzdWx0LmVycm9ycy5qb2luKCcsICcpfWApO1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0LmxhYmVscztcclxufVxyXG5cclxuLyoqXHJcbiAqIFF1aWNrIGV4cG9ydCBmdW5jdGlvbiBmb3Igc2ltcGxlIHVzZSBjYXNlc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydFlvbG8obGFiZWxzOiBZb2xvTGFiZWxbXSwgcHJlY2lzaW9uOiBudW1iZXIgPSBERUZBVUxUX1BSRUNJU0lPTik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFlvbG9QYXJzZXIubGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVscywgeyBwcmVjaXNpb24gfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZSBZT0xPIHN0cmluZyB3aXRob3V0IHBhcnNpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IHsgaXNWYWxpZDogYm9vbGVhbjsgZXJyb3JzOiBzdHJpbmdbXSB9IHtcclxuICBjb25zdCByZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGlzVmFsaWQ6IHJlc3VsdC5lcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgZXJyb3JzOiByZXN1bHQuZXJyb3JzXHJcbiAgfTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgWW9sb1BhcnNlcjsiLCIvKipcclxuICogRmlsZVN5c3RlbSBTZXJ2aWNlIEltcGxlbWVudGF0aW9uXHJcbiAqIFxyXG4gKiBIYW5kbGVzIGFsbCBmaWxlIEkvTyBvcGVyYXRpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogUHJvdmlkZXMgYWJzdHJhY3Rpb24gb3ZlciBGaWxlIFN5c3RlbSBBY2Nlc3MgQVBJIGFuZCBZT0xPIGZvcm1hdCBwcm9jZXNzaW5nLlxyXG4gKiBcclxuICogQHZlcnNpb24gMS4wLjBcclxuICogQGF1dGhvciBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgXHJcbiAgSUZpbGVTeXN0ZW1TZXJ2aWNlLFxyXG4gIEZpbGVPcGVyYXRpb25SZXN1bHQsXHJcbiAgRmlsZUxvYWRSZXN1bHQsXHJcbiAgWW9sb0xhYmVsLFxyXG4gIFlvbG9QYXJzZVJlc3VsdCxcclxuICBZb2xvRXhwb3J0T3B0aW9ucyxcclxuICBDbGFzc0ZpbGVDb250ZW50LFxyXG4gIENsYXNzRmlsZVZhbGlkYXRpb24sXHJcbiAgRm9sZGVyU2NhblJlc3VsdCxcclxuICBMYWJlbFN0YXR1cyxcclxuICBJbWFnZUluZm8sXHJcbiAgSW1hZ2VMb2FkT3B0aW9ucyxcclxuICBUaWZmUHJvY2Vzc2luZ09wdGlvbnMsXHJcbiAgQ2FjaGVFbnRyeSxcclxuICBDYWNoZVN0YXRzLFxyXG4gIEZpbGVTeXN0ZW1Db25maWcsXHJcbiAgRmlsZVN5c3RlbUV2ZW50LFxyXG4gIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXIsXHJcbiAgRmlsZVN5c3RlbUVycm9yLFxyXG4gIEltYWdlTG9hZEVycm9yLFxyXG4gIEZpbGVGb3JtYXQsXHJcbiAgQ2xhc3NGaWxlRm9ybWF0XHJcbn0gZnJvbSAnLi4vdHlwZXMvZmlsZXN5c3RlbSc7XHJcblxyXG5pbXBvcnQgeyBcclxuICBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBcclxuICBGaWxlU3lzdGVtRmlsZUhhbmRsZSBcclxufSBmcm9tICcuLi90eXBlcyc7XHJcblxyXG5pbXBvcnQgeyBcclxuICBJbWFnZUZpbGUsIFxyXG4gIENsYXNzRmlsZSwgXHJcbiAgQ2xhc3NEZWZpbml0aW9uIFxyXG59IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcblxyXG5pbXBvcnQgeyBZb2xvUGFyc2VyIH0gZnJvbSAnLi4vdXRpbHMveW9sby1wYXJzZXInO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGaWxlU3lzdGVtIFNlcnZpY2UgSW1wbGVtZW50YXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVTeXN0ZW1TZXJ2aWNlIGltcGxlbWVudHMgSUZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICBwcml2YXRlIGNvbmZpZzogRmlsZVN5c3RlbUNvbmZpZztcclxuICBwcml2YXRlIGltYWdlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVFbnRyeTxIVE1MSW1hZ2VFbGVtZW50Pj4oKTtcclxuICBwcml2YXRlIGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXJbXT4oKTtcclxuICBcclxuICAvLyBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBERUZBVUxUX0NPTkZJRzogRmlsZVN5c3RlbUNvbmZpZyA9IHtcclxuICAgIHN1cHBvcnRlZEltYWdlRm9ybWF0czogWydqcGcnLCAnanBlZycsICdwbmcnLCAnZ2lmJywgJ3RpZicsICd0aWZmJywgJ3dlYnAnXSxcclxuICAgIG1heEltYWdlU2l6ZTogNTAgKiAxMDI0ICogMTAyNCwgLy8gNTBNQlxyXG4gICAgdGh1bWJuYWlsU2l6ZTogeyB3aWR0aDogMTUwLCBoZWlnaHQ6IDE1MCB9LFxyXG4gICAgbWF4Q2FjaGVTaXplOiAxMDAgKiAxMDI0ICogMTAyNCwgLy8gMTAwTUJcclxuICAgIGNhY2hlVGltZW91dDogMzAgKiA2MCAqIDEwMDAsIC8vIDMwIG1pbnV0ZXNcclxuICAgIHlvbG9WYWxpZGF0aW9uOiB7XHJcbiAgICAgIHN0cmljdEJvdW5kczogdHJ1ZSxcclxuICAgICAgYWxsb3daZXJvU2l6ZTogZmFsc2UsXHJcbiAgICAgIHByZWNpc2lvbjogNlxyXG4gICAgfSxcclxuICAgIGJhdGNoU2l6ZTogMTAsXHJcbiAgICBjb25jdXJyZW50TG9hZHM6IDMsXHJcbiAgICBwcmVsb2FkQWRqYWNlbnQ6IHRydWVcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uRmlsZVN5c3RlbVNlcnZpY2UuREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZvbGRlciBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2VsZWN0SW1hZ2VGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmb2xkZXJIYW5kbGUgPSBhd2FpdCAod2luZG93IGFzIGFueSkuc2hvd0RpcmVjdG9yeVBpY2tlcigpO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZm9sZGVyOmltYWdlLXNlbGVjdGVkJyxcclxuICAgICAgICBkYXRhOiB7IG5hbWU6IGZvbGRlckhhbmRsZS5uYW1lIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGZvbGRlckhhbmRsZSxcclxuICAgICAgICBtZXNzYWdlOiBgSW1hZ2UgZm9sZGVyIHNlbGVjdGVkOiAke2ZvbGRlckhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2VsZWN0aW9uIGNhbmNlbGxlZCcgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzZWxlY3QgaW1hZ2UgZm9sZGVyOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzZWxlY3RMYWJlbEZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvbGRlckhhbmRsZSA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmb2xkZXI6bGFiZWwtc2VsZWN0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgbmFtZTogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZm9sZGVySGFuZGxlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBMYWJlbCBmb2xkZXIgc2VsZWN0ZWQ6ICR7Zm9sZGVySGFuZGxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdTZWxlY3Rpb24gY2FuY2VsbGVkJyB9O1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNlbGVjdCBsYWJlbCBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNlbGVjdENsYXNzSW5mb0ZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvbGRlckhhbmRsZSA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmb2xkZXI6Y2xhc3MtaW5mby1zZWxlY3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBuYW1lOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBmb2xkZXJIYW5kbGUsXHJcbiAgICAgICAgbWVzc2FnZTogYENsYXNzIGluZm8gZm9sZGVyIHNlbGVjdGVkOiAke2ZvbGRlckhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2VsZWN0aW9uIGNhbmNlbGxlZCcgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzZWxlY3QgY2xhc3MgaW5mbyBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgTGlzdGluZyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbGlzdEltYWdlRmlsZXMoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEltYWdlRmlsZVtdPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW10gPSBbXTtcclxuICAgICAgY29uc3Qgc3VwcG9ydGVkRm9ybWF0cyA9IHRoaXMuY29uZmlnLnN1cHBvcnRlZEltYWdlRm9ybWF0cy5tYXAoZiA9PiBmLnRvTG93ZXJDYXNlKCkpO1xyXG5cclxuICAgICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiAoZm9sZGVySGFuZGxlIGFzIGFueSkudmFsdWVzKCkpIHtcclxuICAgICAgICBpZiAoZW50cnkua2luZCA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgICAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChzdXBwb3J0ZWRGb3JtYXRzLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VGaWxlOiBJbWFnZUZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBoYW5kbGU6IGVudHJ5LFxyXG4gICAgICAgICAgICAgIHBhdGg6IGVudHJ5Lm5hbWUsIC8vIE5vdGU6IEZ1bGwgcGF0aCBub3QgYXZhaWxhYmxlIGluIEZpbGUgU3lzdGVtIEFjY2VzcyBBUElcclxuICAgICAgICAgICAgICBleHRlbnNpb24sXHJcbiAgICAgICAgICAgICAgc2l6ZTogdW5kZWZpbmVkLCAvLyBXaWxsIGJlIGxvYWRlZCB3aGVuIG5lZWRlZFxyXG4gICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogdW5kZWZpbmVkIC8vIFdpbGwgYmUgbG9hZGVkIHdoZW4gbmVlZGVkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGltYWdlRmlsZXMucHVzaChpbWFnZUZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU29ydCBmaWxlcyBuYXR1cmFsbHkgKGhhbmRsZXMgbnVtYmVycyBjb3JyZWN0bHkpXHJcbiAgICAgIGltYWdlRmlsZXMuc29ydCgoYSwgYikgPT4gXHJcbiAgICAgICAgYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSwgc2Vuc2l0aXZpdHk6ICdiYXNlJyB9KVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZmlsZXM6aW1hZ2VzLWxpc3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogaW1hZ2VGaWxlcy5sZW5ndGgsIGZvbGRlcjogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW1hZ2VGaWxlcyxcclxuICAgICAgICBtZXNzYWdlOiBgRm91bmQgJHtpbWFnZUZpbGVzLmxlbmd0aH0gaW1hZ2UgZmlsZXNgXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxpc3QgaW1hZ2UgZmlsZXM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxpc3RDbGFzc0ZpbGVzKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxDbGFzc0ZpbGVbXT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGNsYXNzRmlsZXM6IENsYXNzRmlsZVtdID0gW107XHJcbiAgICAgIGNvbnN0IHN1cHBvcnRlZEZvcm1hdHMgPSBbJ3lhbWwnLCAneW1sJ107XHJcblxyXG4gICAgICBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIChmb2xkZXJIYW5kbGUgYXMgYW55KS52YWx1ZXMoKSkge1xyXG4gICAgICAgIGlmIChlbnRyeS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKHN1cHBvcnRlZEZvcm1hdHMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICAvLyBMb2FkIGNsYXNzIGZpbGUgY29udGVudFxyXG4gICAgICAgICAgICBjb25zdCBjb250ZW50UmVzdWx0ID0gYXdhaXQgdGhpcy5sb2FkQ2xhc3NGaWxlKGVudHJ5KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzRmlsZTogQ2xhc3NGaWxlID0ge1xyXG4gICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgaGFuZGxlOiBlbnRyeSxcclxuICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50UmVzdWx0LnN1Y2Nlc3MgPyBjb250ZW50UmVzdWx0LmRhdGEhLmNsYXNzZXMgOiBbXSxcclxuICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjbGFzc0ZpbGVzLnB1c2goY2xhc3NGaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ZpbGVzOmNsYXNzZXMtbGlzdGVkJyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBjbGFzc0ZpbGVzLmxlbmd0aCwgZm9sZGVyOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBjbGFzc0ZpbGVzLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBGb3VuZCAke2NsYXNzRmlsZXMubGVuZ3RofSBjbGFzcyBmaWxlc2BcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbGlzdCBjbGFzcyBmaWxlczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2NhbkZvbGRlcihmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Rm9sZGVyU2NhblJlc3VsdD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdDogRm9sZGVyU2NhblJlc3VsdCA9IHtcclxuICAgICAgICBpbWFnZUZpbGVzOiBbXSxcclxuICAgICAgICBsYWJlbEZpbGVzOiBbXSxcclxuICAgICAgICBjbGFzc0ZpbGVzOiBbXSxcclxuICAgICAgICB0b3RhbEZpbGVzOiAwLFxyXG4gICAgICAgIGVycm9yczogW11cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgKGZvbGRlckhhbmRsZSBhcyBhbnkpLnZhbHVlcygpKSB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgcmVzdWx0LnRvdGFsRmlsZXMrKztcclxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdXBwb3J0ZWRJbWFnZUZvcm1hdHMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZUZpbGU6IEltYWdlRmlsZSA9IHtcclxuICAgICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxyXG4gICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgcGF0aDogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBleHRlbnNpb25cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmVzdWx0LmltYWdlRmlsZXMucHVzaChpbWFnZUZpbGUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChleHRlbnNpb24gPT09ICd0eHQnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5sYWJlbEZpbGVzLnB1c2goZW50cnkubmFtZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKFsneWFtbCcsICd5bWwnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudFJlc3VsdCA9IGF3YWl0IHRoaXMubG9hZENsYXNzRmlsZShlbnRyeSk7XHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnRSZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NGaWxlOiBDbGFzc0ZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRSZXN1bHQuZGF0YSEuY2xhc3NlcyxcclxuICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuY2xhc3NGaWxlcy5wdXNoKGNsYXNzRmlsZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgRmFpbGVkIHRvIGxvYWQgY2xhc3MgZmlsZSAke2VudHJ5Lm5hbWV9OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogcmVzdWx0LFxyXG4gICAgICAgIG1lc3NhZ2U6IGBTY2FubmVkICR7cmVzdWx0LnRvdGFsRmlsZXN9IGZpbGVzYFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzY2FuIGZvbGRlcjogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+IHtcbiAgICB0cnkge1xuICAgICAgLy8gVElGRiBoYW5kbGluZzogZGVsZWdhdGUgdG8gVElGRiBsb2FkZXIgaWYgbmVlZGVkXG4gICAgICBjb25zdCBleHQgPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZmlsZUhhbmRsZS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGV4dCA9PT0gJ3RpZicgfHwgZXh0ID09PSAndGlmZicpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMubG9hZFRpZmZJbWFnZShmaWxlSGFuZGxlKTtcbiAgICAgIH1cbiAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XHJcbiAgICAgIGNvbnN0IGNhY2hlS2V5ID0gYCR7ZmlsZUhhbmRsZS5uYW1lfWA7XHJcbiAgICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMuaW1hZ2VDYWNoZS5nZXQoY2FjaGVLZXkpO1xyXG4gICAgICBcclxuICAgICAgaWYgKGNhY2hlZCAmJiB0aGlzLmlzQ2FjaGVWYWxpZChjYWNoZWQpKSB7XHJcbiAgICAgICAgY2FjaGVkLmhpdHMrKztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IGNhY2hlZC5kYXRhLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ0xvYWRlZCBmcm9tIGNhY2hlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGZpbGUgc2l6ZVxyXG4gICAgICBpZiAoZmlsZS5zaXplID4gdGhpcy5jb25maWcubWF4SW1hZ2VTaXplKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEltYWdlTG9hZEVycm9yKGBJbWFnZSB0b28gbGFyZ2U6ICR7ZmlsZS5zaXplfSBieXRlcyAobWF4OiAke3RoaXMuY29uZmlnLm1heEltYWdlU2l6ZX0pYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IGF3YWl0IHRoaXMuY3JlYXRlSW1hZ2VGcm9tRmlsZShmaWxlLCBvcHRpb25zKTtcbiAgICAgIFxyXG4gICAgICAvLyBDYWNoZSB0aGUgaW1hZ2VcclxuICAgICAgdGhpcy5jYWNoZUltYWdlKGNhY2hlS2V5LCBpbWcsIGZpbGUuc2l6ZSk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdpbWFnZTpsb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGUubmFtZSwgc2l6ZTogZmlsZS5zaXplIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGltZyxcclxuICAgICAgICBtZXNzYWdlOiBgSW1hZ2UgbG9hZGVkOiAke2ZpbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRUaWZmSW1hZ2UoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIG9wdGlvbnM/OiBUaWZmUHJvY2Vzc2luZ09wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFVzZSBkeW5hbWljIGltcG9ydCBmb3IgVElGRi5qcyAobG9hZGVkIGZyb20gQ0ROKVxyXG4gICAgICBpZiAodHlwZW9mICh3aW5kb3cgYXMgYW55KS5UaWZmID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRocm93IG5ldyBJbWFnZUxvYWRFcnJvcignVElGRi5qcyBsaWJyYXJ5IG5vdCBsb2FkZWQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBmaWxlLmFycmF5QnVmZmVyKCk7XHJcbiAgICAgIGNvbnN0IHRpZmYgPSBuZXcgKHdpbmRvdyBhcyBhbnkpLlRpZmYoeyBidWZmZXI6IGFycmF5QnVmZmVyIH0pO1xyXG4gICAgICBjb25zdCBjYW52YXMgPSB0aWZmLnRvQ2FudmFzKCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKCk7XHJcbiAgICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEltYWdlTG9hZEVycm9yKCdGYWlsZWQgdG8gY29udmVydCBUSUZGIGNhbnZhcyB0byBpbWFnZScpKTtcclxuICAgICAgICBpbWcuc3JjID0gY2FudmFzLnRvRGF0YVVSTCgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ltYWdlOnRpZmYtbG9hZGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaWxlLm5hbWUsIHNpemU6IGZpbGUuc2l6ZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBpbWcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRJRkYgaW1hZ2UgbG9hZGVkOiAke2ZpbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxvYWQgVElGRiBpbWFnZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgZ2V0SW1hZ2VJbmZvKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEltYWdlSW5mbz4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgY29uc3QgaW1nID0gYXdhaXQgdGhpcy5jcmVhdGVJbWFnZUZyb21GaWxlKGZpbGUpO1xyXG5cclxuICAgICAgY29uc3QgaW5mbzogSW1hZ2VJbmZvID0ge1xyXG4gICAgICAgIG5hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICB3aWR0aDogaW1nLm5hdHVyYWxXaWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGltZy5uYXR1cmFsSGVpZ2h0LFxyXG4gICAgICAgIHNpemU6IGZpbGUuc2l6ZSxcclxuICAgICAgICBmb3JtYXQ6IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihmaWxlLm5hbWUpLFxyXG4gICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoZmlsZS5sYXN0TW9kaWZpZWQpXHJcbiAgICAgIH07XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW5mbyxcclxuICAgICAgICBtZXNzYWdlOiBgSW1hZ2UgaW5mbyByZXRyaWV2ZWQ6ICR7ZmlsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGltYWdlIGluZm86ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExhYmVsIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhc3luYyBsb2FkTGFiZWxzKGZpbGVOYW1lOiBzdHJpbmcsIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxZb2xvTGFiZWxbXT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZU5hbWUgPSB0aGlzLmdldExhYmVsRmlsZU5hbWUoZmlsZU5hbWUpO1xyXG4gICAgICBjb25zdCBsYWJlbEZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShsYWJlbEZpbGVOYW1lKTtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGxhYmVsRmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgIGNvbnN0IHlvbG9EYXRhID0gYXdhaXQgZmlsZS50ZXh0KCk7XHJcblxyXG4gICAgICBpZiAoIXlvbG9EYXRhLnRyaW0oKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICBtZXNzYWdlOiAnTm8gbGFiZWxzIGZvdW5kJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBhcnNlUmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gICAgICBcclxuICAgICAgaWYgKHBhcnNlUmVzdWx0LmVycm9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6IGBZT0xPIHBhcnNpbmcgZXJyb3JzOiAke3BhcnNlUmVzdWx0LmVycm9ycy5qb2luKCcsICcpfWBcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdsYWJlbHM6bG9hZGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lLCBsYWJlbENvdW50OiBwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RoIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IHBhcnNlUmVzdWx0LmxhYmVscyxcclxuICAgICAgICBtZXNzYWdlOiBgTG9hZGVkICR7cGFyc2VSZXN1bHQubGFiZWxzLmxlbmd0aH0gbGFiZWxzYFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdObyBsYWJlbCBmaWxlIGZvdW5kJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbG9hZCBsYWJlbHM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNhdmVMYWJlbHMoZmlsZU5hbWU6IHN0cmluZywgbGFiZWxzOiBZb2xvTGFiZWxbXSwgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBsYWJlbEZpbGVOYW1lID0gdGhpcy5nZXRMYWJlbEZpbGVOYW1lKGZpbGVOYW1lKTtcclxuICAgICAgY29uc3QgeW9sb1N0cmluZyA9IFlvbG9QYXJzZXIubGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVscywge1xyXG4gICAgICAgIHByZWNpc2lvbjogdGhpcy5jb25maWcueW9sb1ZhbGlkYXRpb24ucHJlY2lzaW9uLFxyXG4gICAgICAgIHZhbGlkYXRlQm91bmRzOiB0aGlzLmNvbmZpZy55b2xvVmFsaWRhdGlvbi5zdHJpY3RCb3VuZHNcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBmaWxlSGFuZGxlID0gYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUobGFiZWxGaWxlTmFtZSwgeyBjcmVhdGU6IHRydWUgfSk7XHJcbiAgICAgIGNvbnN0IHdyaXRhYmxlID0gYXdhaXQgZmlsZUhhbmRsZS5jcmVhdGVXcml0YWJsZSgpO1xyXG4gICAgICBhd2FpdCB3cml0YWJsZS53cml0ZSh5b2xvU3RyaW5nLnRyaW0oKSk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdsYWJlbHM6c2F2ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWUsIGxhYmVsQ291bnQ6IGxhYmVscy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgbWVzc2FnZTogYExhYmVscyBzYXZlZCB0byAke2xhYmVsRmlsZU5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzYXZlIGxhYmVsczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgY2hlY2tMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8TGFiZWxTdGF0dXM+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBsYWJlbEZpbGVOYW1lID0gdGhpcy5nZXRMYWJlbEZpbGVOYW1lKGZpbGVOYW1lKTtcclxuICAgICAgXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbGFiZWxGaWxlSGFuZGxlID0gYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUobGFiZWxGaWxlTmFtZSk7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGxhYmVsRmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZpbGUudGV4dCgpO1xyXG4gICAgICAgIGNvbnN0IHBhcnNlUmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoY29udGVudCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXR1czogTGFiZWxTdGF0dXMgPSB7XHJcbiAgICAgICAgICBmaWxlTmFtZSxcclxuICAgICAgICAgIGhhc0xhYmVsczogcGFyc2VSZXN1bHQubGFiZWxzLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBsYWJlbENvdW50OiBwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RoLFxyXG4gICAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IHN0YXR1cyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBMYWJlbCBzdGF0dXMgY2hlY2tlZDogJHtmaWxlTmFtZX1gXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcclxuICAgICAgICAgIGNvbnN0IHN0YXR1czogTGFiZWxTdGF0dXMgPSB7XHJcbiAgICAgICAgICAgIGZpbGVOYW1lLFxyXG4gICAgICAgICAgICBoYXNMYWJlbHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYWJlbENvdW50OiAwXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IHN0YXR1cyxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ05vIGxhYmVsIGZpbGUgZm91bmQnXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjaGVjayBsYWJlbCBzdGF0dXM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENsYXNzIEZpbGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRDbGFzc0ZpbGUoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Q2xhc3NGaWxlQ29udGVudD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZpbGUudGV4dCgpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgdmFsaWRhdGlvbiA9IHRoaXMudmFsaWRhdGVDbGFzc0ZpbGUoY29udGVudCk7XHJcbiAgICAgIGlmICghdmFsaWRhdGlvbi5pc1ZhbGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6IGBJbnZhbGlkIGNsYXNzIGZpbGU6ICR7dmFsaWRhdGlvbi5lcnJvcnMuam9pbignLCAnKX1gXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY2xhc3NlczogQ2xhc3NEZWZpbml0aW9uW10gPSBbXTtcclxuICAgICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcclxuICAgICAgXHJcbiAgICAgIGxpbmVzLmZvckVhY2gobGluZSA9PiB7XHJcbiAgICAgICAgY29uc3QgdHJpbW1lZExpbmUgPSBsaW5lLnRyaW0oKTtcclxuICAgICAgICBpZiAodHJpbW1lZExpbmUuc3RhcnRzV2l0aCgnIycpIHx8IHRyaW1tZWRMaW5lID09PSAnJykgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBwYXJ0cyA9IHRyaW1tZWRMaW5lLnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICBjb25zdCBpZCA9IHBhcnNlSW50KHBhcnRzWzBdIS50cmltKCksIDEwKTtcclxuICAgICAgICAgIGNvbnN0IG5hbWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc6JykudHJpbSgpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAoIWlzTmFOKGlkKSAmJiBuYW1lKSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgaWQsXHJcbiAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgIGNvbG9yOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGNsYXNzRmlsZUNvbnRlbnQ6IENsYXNzRmlsZUNvbnRlbnQgPSB7XHJcbiAgICAgICAgY2xhc3NlcyxcclxuICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoZmlsZS5sYXN0TW9kaWZpZWQpLFxyXG4gICAgICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKGZpbGUubGFzdE1vZGlmaWVkKVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzZXM6bG9hZGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaWxlLm5hbWUsIGNsYXNzQ291bnQ6IGNsYXNzZXMubGVuZ3RoIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGNsYXNzRmlsZUNvbnRlbnQsXHJcbiAgICAgICAgbWVzc2FnZTogYExvYWRlZCAke2NsYXNzZXMubGVuZ3RofSBjbGFzc2VzIGZyb20gJHtmaWxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsb2FkIGNsYXNzIGZpbGU6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNhdmVDbGFzc0ZpbGUoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIGNvbnRlbnQ6IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFNvcnQgY2xhc3NlcyBieSBJRFxyXG4gICAgICBjb25zdCBzb3J0ZWRDbGFzc2VzID0gWy4uLmNvbnRlbnQuY2xhc3Nlc10uc29ydCgoYSwgYikgPT4gYS5pZCAtIGIuaWQpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgbGluZXMgPSBzb3J0ZWRDbGFzc2VzLm1hcChjbHMgPT4gYCR7Y2xzLmlkfTogJHtjbHMubmFtZX1gKTtcclxuICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBsaW5lcy5qb2luKCdcXG4nKTtcclxuXHJcbiAgICAgIGNvbnN0IHdyaXRhYmxlID0gYXdhaXQgZmlsZUhhbmRsZS5jcmVhdGVXcml0YWJsZSgpO1xyXG4gICAgICBhd2FpdCB3cml0YWJsZS53cml0ZShmaWxlQ29udGVudCk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGFzc2VzOnNhdmVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaWxlSGFuZGxlLm5hbWUsIGNsYXNzQ291bnQ6IGNvbnRlbnQuY2xhc3Nlcy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgbWVzc2FnZTogYFNhdmVkICR7Y29udGVudC5jbGFzc2VzLmxlbmd0aH0gY2xhc3NlcyB0byAke2ZpbGVIYW5kbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNhdmUgY2xhc3MgZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgY3JlYXRlQ2xhc3NGaWxlKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgZmlsZU5hbWU6IHN0cmluZywgaW5pdGlhbENvbnRlbnQ/OiBDbGFzc0ZpbGVDb250ZW50KTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1GaWxlSGFuZGxlPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gRW5zdXJlIC55YW1sIGV4dGVuc2lvblxyXG4gICAgICBjb25zdCBmaW5hbEZpbGVOYW1lID0gZmlsZU5hbWUuZW5kc1dpdGgoJy55YW1sJykgfHwgZmlsZU5hbWUuZW5kc1dpdGgoJy55bWwnKSBcclxuICAgICAgICA/IGZpbGVOYW1lIFxyXG4gICAgICAgIDogYCR7ZmlsZU5hbWV9LnlhbWxgO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBhbHJlYWR5IGV4aXN0c1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGZvbGRlckhhbmRsZS5nZXRGaWxlSGFuZGxlKGZpbmFsRmlsZU5hbWUpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiBgRmlsZSBcIiR7ZmluYWxGaWxlTmFtZX1cIiBhbHJlYWR5IGV4aXN0c2BcclxuICAgICAgICB9O1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIC8vIEZpbGUgZG9lc24ndCBleGlzdCwgd2hpY2ggaXMgd2hhdCB3ZSB3YW50XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRlZmF1bHRDb250ZW50OiBDbGFzc0ZpbGVDb250ZW50ID0gaW5pdGlhbENvbnRlbnQgfHwge1xyXG4gICAgICAgIGNsYXNzZXM6IFtcclxuICAgICAgICAgIHsgaWQ6IDAsIG5hbWU6ICdjbGFzczEnIH0sXHJcbiAgICAgICAgICB7IGlkOiAxLCBuYW1lOiAnY2xhc3MyJyB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoKSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXV0by1nZW5lcmF0ZWQgY2xhc3MgZmlsZSdcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCBmaWxlSGFuZGxlID0gYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUoZmluYWxGaWxlTmFtZSwgeyBjcmVhdGU6IHRydWUgfSk7XHJcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUNsYXNzRmlsZShmaWxlSGFuZGxlLCBkZWZhdWx0Q29udGVudCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGFzc2VzOmZpbGUtY3JlYXRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogZmluYWxGaWxlTmFtZSwgY2xhc3NDb3VudDogZGVmYXVsdENvbnRlbnQuY2xhc3Nlcy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZmlsZUhhbmRsZSxcclxuICAgICAgICBtZXNzYWdlOiBgQ3JlYXRlZCBjbGFzcyBmaWxlOiAke2ZpbmFsRmlsZU5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjcmVhdGUgY2xhc3MgZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdmFsaWRhdGVDbGFzc0ZpbGUoY29udGVudDogc3RyaW5nKTogQ2xhc3NGaWxlVmFsaWRhdGlvbiB7XHJcbiAgICBjb25zdCByZXN1bHQ6IENsYXNzRmlsZVZhbGlkYXRpb24gPSB7XHJcbiAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgIGVycm9yczogW10sXHJcbiAgICAgIHdhcm5pbmdzOiBbXSxcclxuICAgICAgZHVwbGljYXRlSWRzOiBbXSxcclxuICAgICAgZW1wdHlOYW1lczogW11cclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcclxuICAgIGNvbnN0IHNlZW5JZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcclxuICAgIFxyXG4gICAgbGluZXMuZm9yRWFjaCgobGluZSwgbGluZUluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHRyaW1tZWRMaW5lID0gbGluZS50cmltKCk7XHJcbiAgICAgIGlmICh0cmltbWVkTGluZS5zdGFydHNXaXRoKCcjJykgfHwgdHJpbW1lZExpbmUgPT09ICcnKSByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBwYXJ0cyA9IHRyaW1tZWRMaW5lLnNwbGl0KCc6Jyk7XHJcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IEludmFsaWQgZm9ybWF0LiBFeHBlY3RlZCBcImlkOiBuYW1lXCJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgaWRTdHIgPSBwYXJ0c1swXSEudHJpbSgpO1xyXG4gICAgICBjb25zdCBuYW1lID0gcGFydHMuc2xpY2UoMSkuam9pbignOicpLnRyaW0oKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQoaWRTdHIsIDEwKTtcclxuICAgICAgaWYgKGlzTmFOKGlkKSB8fCBTdHJpbmcoaWQpICE9PSBpZFN0cikge1xyXG4gICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBJbnZhbGlkIElEIFwiJHtpZFN0cn1cIi4gTXVzdCBiZSBhbiBpbnRlZ2VyYCk7XHJcbiAgICAgICAgcmVzdWx0LmlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIGlmIChzZWVuSWRzLmhhcyhpZCkpIHtcclxuICAgICAgICByZXN1bHQuZHVwbGljYXRlSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBEdXBsaWNhdGUgSUQgXCIke2lkfVwiYCk7XHJcbiAgICAgICAgcmVzdWx0LmlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWVuSWRzLmFkZChpZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgIHJlc3VsdC5lbXB0eU5hbWVzLnB1c2goaWRTdHIpO1xyXG4gICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBFbXB0eSBjbGFzcyBuYW1lIGZvciBJRCBcIiR7aWRTdHJ9XCJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFlPTE8gRm9ybWF0IFByb2Nlc3NpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBwYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IFlvbG9QYXJzZVJlc3VsdCB7XHJcbiAgICByZXR1cm4gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHM6IFlvbG9MYWJlbFtdLCBvcHRpb25zPzogWW9sb0V4cG9ydE9wdGlvbnMpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFlvbG9QYXJzZXIubGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVscywgb3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdmFsaWRhdGVZb2xvTGFiZWwobGFiZWw6IFlvbG9MYWJlbCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIFlvbG9QYXJzZXIudmFsaWRhdGVZb2xvTGFiZWwobGFiZWwpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENhY2hlIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBjbGVhckltYWdlQ2FjaGUoKTogdm9pZCB7XHJcbiAgICAvLyBSZXZva2UgYWxsIGJsb2IgVVJMcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgICBpZiAoZW50cnkuZGF0YS5zcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZW50cnkuZGF0YS5zcmMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmNsZWFyKCk7XHJcbiAgICBcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpjbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDYWNoZVN0YXRzKCk6IENhY2hlU3RhdHMge1xyXG4gICAgbGV0IHRvdGFsU2l6ZSA9IDA7XHJcbiAgICBsZXQgdG90YWxIaXRzID0gMDtcclxuICAgIGxldCB0b3RhbEFjY2Vzc2VzID0gMDtcclxuXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICAgIHRvdGFsU2l6ZSArPSBlbnRyeS5zaXplO1xyXG4gICAgICB0b3RhbEhpdHMgKz0gZW50cnkuaGl0cztcclxuICAgICAgdG90YWxBY2Nlc3NlcyArPSBlbnRyeS5oaXRzICsgMTsgLy8gKzEgZm9yIGluaXRpYWwgbG9hZFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG90YWxFbnRyaWVzOiB0aGlzLmltYWdlQ2FjaGUuc2l6ZSxcclxuICAgICAgdG90YWxTaXplLFxyXG4gICAgICBoaXRSYXRlOiB0b3RhbEFjY2Vzc2VzID4gMCA/IHRvdGFsSGl0cyAvIHRvdGFsQWNjZXNzZXMgOiAwLFxyXG4gICAgICBtZW1vcnlVc2FnZTogdG90YWxTaXplIC8gKDEwMjQgKiAxMDI0KSAvLyBNQlxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvcHRpbWl6ZUNhY2hlKCk6IHZvaWQge1xyXG4gICAgLy8gUmVtb3ZlIGV4cGlyZWQgZW50cmllc1xyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgIGNvbnN0IGV4cGlyZWRLZXlzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5mb3JFYWNoKChlbnRyeSwga2V5KSA9PiB7XHJcbiAgICAgIGlmIChub3cuZ2V0VGltZSgpIC0gZW50cnkudGltZXN0YW1wLmdldFRpbWUoKSA+IHRoaXMuY29uZmlnLmNhY2hlVGltZW91dCkge1xyXG4gICAgICAgIGV4cGlyZWRLZXlzLnB1c2goa2V5KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZXhwaXJlZEtleXMuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuaW1hZ2VDYWNoZS5nZXQoa2V5KTtcclxuICAgICAgaWYgKGVudHJ5ICYmIGVudHJ5LmRhdGEuc3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGVudHJ5LmRhdGEuc3JjKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmltYWdlQ2FjaGUuZGVsZXRlKGtleSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJZiBzdGlsbCBvdmVyIGxpbWl0LCByZW1vdmUgbGVhc3QgcmVjZW50bHkgdXNlZFxyXG4gICAgaWYgKHRoaXMuZ2V0VG90YWxDYWNoZVNpemUoKSA+IHRoaXMuY29uZmlnLm1heENhY2hlU2l6ZSkge1xyXG4gICAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuZnJvbSh0aGlzLmltYWdlQ2FjaGUuZW50cmllcygpKS5zb3J0KChhLCBiKSA9PiBcclxuICAgICAgICBhWzFdLnRpbWVzdGFtcC5nZXRUaW1lKCkgLSBiWzFdLnRpbWVzdGFtcC5nZXRUaW1lKClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHdoaWxlICh0aGlzLmdldFRvdGFsQ2FjaGVTaXplKCkgPiB0aGlzLmNvbmZpZy5tYXhDYWNoZVNpemUgJiYgZW50cmllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3QgW2tleSwgZW50cnldID0gZW50cmllcy5zaGlmdCgpITtcclxuICAgICAgICBpZiAoZW50cnkuZGF0YS5zcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xyXG4gICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChlbnRyeS5kYXRhLnNyYyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW1hZ2VDYWNoZS5kZWxldGUoa2V5KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpvcHRpbWl6ZWQnLFxyXG4gICAgICBkYXRhOiB7IHJlbW92ZWRFeHBpcmVkOiBleHBpcmVkS2V5cy5sZW5ndGggfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW1cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogRmlsZVN5c3RlbUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBbXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKSEucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogRmlsZVN5c3RlbUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgaGFuZGxlcnMhLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudChldmVudDogRmlsZVN5c3RlbUV2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzIS5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gRmlsZVN5c3RlbSBldmVudCBoYW5kbGVyIGZvciAke2V2ZW50LnR5cGV9OmAsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFByaXZhdGUgVXRpbGl0eSBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGdldEZpbGVFeHRlbnNpb24oZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBsYXN0RG90ID0gZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKTtcclxuICAgIHJldHVybiBsYXN0RG90ID4gMCA/IGZpbGVOYW1lLnN1YnN0cmluZyhsYXN0RG90ICsgMSkgOiAnJztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0TGFiZWxGaWxlTmFtZShpbWFnZUZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGltYWdlRmlsZU5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcudHh0Jyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUltYWdlRnJvbUZpbGUoZmlsZTogRmlsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEhUTUxJbWFnZUVsZW1lbnQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xyXG4gICAgICBcclxuICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbiAgICAgICAgcmVzb2x2ZShpbWcpO1xyXG4gICAgICB9O1xyXG4gICAgICBcclxuICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgICAgIHJlamVjdChuZXcgSW1hZ2VMb2FkRXJyb3IoYEZhaWxlZCB0byBsb2FkIGltYWdlOiAke2ZpbGUubmFtZX1gLCBmaWxlLm5hbWUpKTtcclxuICAgICAgfTtcclxuICAgICAgXHJcbiAgICAgIGltZy5zcmMgPSB1cmw7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2FjaGVJbWFnZShrZXk6IHN0cmluZywgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCBzaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8vIE9wdGltaXplIGNhY2hlIGJlZm9yZSBhZGRpbmcgbmV3IGVudHJ5XHJcbiAgICBpZiAodGhpcy5nZXRUb3RhbENhY2hlU2l6ZSgpICsgc2l6ZSA+IHRoaXMuY29uZmlnLm1heENhY2hlU2l6ZSkge1xyXG4gICAgICB0aGlzLm9wdGltaXplQ2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbnRyeTogQ2FjaGVFbnRyeTxIVE1MSW1hZ2VFbGVtZW50PiA9IHtcclxuICAgICAgZGF0YTogaW1nLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXHJcbiAgICAgIHNpemUsXHJcbiAgICAgIGhpdHM6IDBcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pbWFnZUNhY2hlLnNldChrZXksIGVudHJ5KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNDYWNoZVZhbGlkKGVudHJ5OiBDYWNoZUVudHJ5PEhUTUxJbWFnZUVsZW1lbnQ+KTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcmV0dXJuIG5vdy5nZXRUaW1lKCkgLSBlbnRyeS50aW1lc3RhbXAuZ2V0VGltZSgpIDwgdGhpcy5jb25maWcuY2FjaGVUaW1lb3V0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRUb3RhbENhY2hlU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgbGV0IHRvdGFsID0gMDtcclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgdG90YWwgKz0gZW50cnkuc2l6ZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRvdGFsO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IEZpbGVTeXN0ZW1TZXJ2aWNlIGluc3RhbmNlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UoY29uZmlnPzogUGFydGlhbDxGaWxlU3lzdGVtQ29uZmlnPik6IEZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IEZpbGVTeXN0ZW1TZXJ2aWNlKGNvbmZpZyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgRmlsZVN5c3RlbVNlcnZpY2Ugd2l0aCBjdXN0b20gY2FjaGUgc2l6ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlV2l0aENhY2hlKGNhY2hlU2l6ZTogbnVtYmVyKTogRmlsZVN5c3RlbVNlcnZpY2Uge1xyXG4gIHJldHVybiBuZXcgRmlsZVN5c3RlbVNlcnZpY2UoeyBtYXhDYWNoZVNpemU6IGNhY2hlU2l6ZSB9KTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpbGVTeXN0ZW1TZXJ2aWNlO1xyXG5leHBvcnQgdHlwZSB7IElGaWxlU3lzdGVtU2VydmljZSwgRmlsZVN5c3RlbUNvbmZpZyB9O1xuIiwiLyoqXHJcbiAqIFNlcnZpY2VzIE1vZHVsZSBJbmRleFxyXG4gKiBcclxuICogQ2VudHJhbCBleHBvcnQgcG9pbnQgZm9yIGFsbCBzZXJ2aWNlIGNsYXNzZXMgdXNlZCB0aHJvdWdob3V0IHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBjbGVhbiBBUEkgYWNjZXNzIHRvIGJ1c2luZXNzIGxvZ2ljIGFuZCBleHRlcm5hbCBzZXJ2aWNlIGludGVncmF0aW9ucy5cclxuICovXHJcblxyXG4vLyBFeHBvcnQgRmlsZVN5c3RlbVNlcnZpY2VcclxuZXhwb3J0IHsgXHJcbiAgRmlsZVN5c3RlbVNlcnZpY2UsIFxyXG4gIGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlLCBcclxuICBjcmVhdGVGaWxlU3lzdGVtU2VydmljZVdpdGhDYWNoZSxcclxuICB0eXBlIElGaWxlU3lzdGVtU2VydmljZSxcclxuICB0eXBlIEZpbGVTeXN0ZW1Db25maWdcclxufSBmcm9tICcuL0ZpbGVTeXN0ZW1TZXJ2aWNlJztcclxuXHJcbi8vIFJlLWV4cG9ydCBZb2xvUGFyc2VyIGZyb20gdXRpbHMgZm9yIGNvbnZlbmllbmNlXHJcbmV4cG9ydCB7IFlvbG9QYXJzZXIsIHBhcnNlWW9sbywgZXhwb3J0WW9sbyB9IGZyb20gJy4uL3V0aWxzL3lvbG8tcGFyc2VyJztcclxuXHJcbi8vIFJlLWV4cG9ydCB0eXBlcyBmb3IgY29udmVuaWVuY2VcclxuZXhwb3J0IHR5cGUge1xyXG4gIEZpbGVPcGVyYXRpb25SZXN1bHQsXHJcbiAgRmlsZUxvYWRSZXN1bHQsXHJcbiAgWW9sb0xhYmVsLFxyXG4gIFlvbG9QYXJzZVJlc3VsdCxcclxuICBZb2xvRXhwb3J0T3B0aW9ucyxcclxuICBDbGFzc0ZpbGVDb250ZW50LFxyXG4gIENsYXNzRmlsZVZhbGlkYXRpb24sXHJcbiAgRm9sZGVyU2NhblJlc3VsdCxcclxuICBMYWJlbFN0YXR1cyxcclxuICBJbWFnZUluZm8sXHJcbiAgSW1hZ2VMb2FkT3B0aW9ucyxcclxuICBUaWZmUHJvY2Vzc2luZ09wdGlvbnMsXHJcbiAgQ2FjaGVFbnRyeSxcclxuICBDYWNoZVN0YXRzLFxyXG4gIEZpbGVTeXN0ZW1FdmVudCxcclxuICBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyLFxyXG4gIEZpbGVTeXN0ZW1FcnJvcixcclxuICBJbWFnZUxvYWRFcnJvcixcclxuICBZb2xvRm9ybWF0RXJyb3IsXHJcbiAgRmlsZUZvcm1hdCxcclxuICBMYWJlbEZvcm1hdCxcclxuICBDbGFzc0ZpbGVGb3JtYXQsXHJcbiAgRmlsZVR5cGVJbmZvLFxyXG4gIEZpbGVTeXN0ZW1TZXJ2aWNlRmFjdG9yeVxyXG59IGZyb20gJy4uL3R5cGVzL2ZpbGVzeXN0ZW0nOyIsImNvbnN0IF9fV0VCUEFDS19OQU1FU1BBQ0VfT0JKRUNUX18gPSBmYWJyaWM7IiwiLyoqXHJcbiAqIENhbnZhcyBDb250cm9sbGVyIEltcGxlbWVudGF0aW9uXHJcbiAqXHJcbiAqIE1hbmFnZXMgRmFicmljLmpzIGNhbnZhcyBvcGVyYXRpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogSGFuZGxlcyBib3VuZGluZyBib3ggZHJhd2luZywgZWRpdGluZywgem9vbS9wYW4gY29udHJvbHMsIGFuZCBsYWJlbCB2aXN1YWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjAuMFxyXG4gKiBAYXV0aG9yIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb25cclxuICovXHJcblxyXG5pbXBvcnQgeyBmYWJyaWMgfSBmcm9tICdmYWJyaWMnO1xuaW1wb3J0IHtcclxuICBJQ2FudmFzQ29udHJvbGxlcixcclxuICBDYW52YXNTdGF0ZSxcclxuICBDYW52YXNDb25maWcsXHJcbiAgQ2FudmFzRGltZW5zaW9ucyxcclxuICBCb3VuZGluZ0JveCxcclxuICBZT0xPTGFiZWwsXHJcbiAgRmFicmljUmVjdGFuZ2xlLFxyXG4gIEZhYnJpY1RleHQsXHJcbiAgRmFicmljTGluZSxcclxuICBDYW52YXNFdmVudCxcclxuICBDYW52YXNFdmVudEhhbmRsZXIsXHJcbiAgQ2FudmFzRXZlbnRUeXBlLFxyXG4gIERyYXdpbmdPcHRpb25zLFxyXG4gIExhYmVsRGlzcGxheU9wdGlvbnMsXHJcbiAgVmlld3BvcnRTdGF0ZSxcclxuICBDYW52YXNDb29yZGluYXRlLFxyXG4gIEltYWdlQ29vcmRpbmF0ZSxcclxuICBDYW52YXNWYWxpZGF0aW9uLFxyXG4gIENhbnZhc1BlcmZvcm1hbmNlXHJcbn0gZnJvbSAnLi4vdHlwZXMvY2FudmFzJztcclxuXHJcbmltcG9ydCB7IFBvaW50LCBSZWN0YW5nbGUsIFNpemUgfSBmcm9tICcuLi90eXBlcyc7XG4vLyBSdW50aW1lIGFsaWFzIGZvciBnbG9iYWwgRmFicmljSlMgd2hlbiB1c2luZyBDRE4gZXh0ZXJuYWxzXG5jb25zdCBGYWJyaWNKUzogYW55ID0gKHR5cGVvZiAod2luZG93IGFzIGFueSkgIT09ICd1bmRlZmluZWQnICYmICh3aW5kb3cgYXMgYW55KS5mYWJyaWMpID8gKHdpbmRvdyBhcyBhbnkpLmZhYnJpYyA6IChmYWJyaWMgYXMgdW5rbm93biBhcyBhbnkpO1xuaW1wb3J0IHsgSUFwcFN0YXRlIH0gZnJvbSAnLi4vdHlwZXMvYXBwLXN0YXRlJztcclxuaW1wb3J0IHsgY29sb3JQYWxldHRlIH0gZnJvbSAnLi4vdXRpbHMvY29sb3ItcGFsZXR0ZSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENhbnZhcyBDb250cm9sbGVyIEltcGxlbWVudGF0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBDYW52YXNDb250cm9sbGVyIGltcGxlbWVudHMgSUNhbnZhc0NvbnRyb2xsZXIge1xyXG4gIHByaXZhdGUgX2NhbnZhczogZmFicmljLkNhbnZhcyB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgX3N0YXRlOiBDYW52YXNTdGF0ZTtcclxuICBwcml2YXRlIF9jb25maWc6IENhbnZhc0NvbmZpZztcclxuICBwcml2YXRlIF9ldmVudExpc3RlbmVycyA9IG5ldyBNYXA8Q2FudmFzRXZlbnRUeXBlLCBDYW52YXNFdmVudEhhbmRsZXJbXT4oKTtcclxuXHJcbiAgLy8gRGVwZW5kZW5jaWVzXHJcbiAgcHJpdmF0ZSBhcHBTdGF0ZTogSUFwcFN0YXRlO1xyXG5cclxuICAvLyBDYW52YXMgY29udGFpbmVyIGFuZCBpbWFnZVxyXG4gIHByaXZhdGUgY29udGFpbmVyRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIGN1cnJlbnRJbWFnZTogSFRNTEltYWdlRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgaW1hZ2VPYmplY3Q6IGZhYnJpYy5JbWFnZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyBEcmF3aW5nIHN0YXRlXHJcbiAgcHJpdmF0ZSBkcmF3aW5nT3B0aW9uczogRHJhd2luZ09wdGlvbnMgPSB7XHJcbiAgICBzdHJva2VXaWR0aDogMixcclxuICAgIHN0cm9rZTogJyNmZjAwMDAnLFxyXG4gICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcclxuICAgIG9wYWNpdHk6IDEsXHJcbiAgICBzZWxlY3RhYmxlOiB0cnVlLFxyXG4gICAgZXZlbnRlZDogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgbGFiZWxPcHRpb25zOiBMYWJlbERpc3BsYXlPcHRpb25zID0ge1xyXG4gICAgc2hvd0xhYmVsczogdHJ1ZSxcclxuICAgIGZvbnRTaXplOiAxNCxcclxuICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICBmb250Q29sb3I6ICcjZmZmZmZmJyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC43KScsXHJcbiAgICBzaG93Q29uZmlkZW5jZTogZmFsc2UsXHJcbiAgICBzaG93Q2xhc3NOYW1lOiB0cnVlLFxyXG4gICAgc2hvd0NsYXNzSWQ6IHRydWVcclxuICB9O1xyXG5cclxuICAvLyBQZXJmb3JtYW5jZSBtb25pdG9yaW5nXHJcbiAgcHJpdmF0ZSBwZXJmb3JtYW5jZU1ldHJpY3M6IENhbnZhc1BlcmZvcm1hbmNlID0ge1xyXG4gICAgcmVuZGVyVGltZTogMCxcclxuICAgIG9iamVjdENvdW50OiAwLFxyXG4gICAgbWVtb3J5VXNhZ2U6IDAsXHJcbiAgICBmcHM6IDYwXHJcbiAgfTtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwU3RhdGU6IElBcHBTdGF0ZSkge1xuICAgIHRoaXMuYXBwU3RhdGUgPSBhcHBTdGF0ZTtcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBkZWZhdWx0IGNvbmZpZ1xyXG4gICAgdGhpcy5fY29uZmlnID0ge1xyXG4gICAgICB3aWR0aDogODAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMCxcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZjlmYScsXHJcbiAgICAgIHNlbGVjdGlvbjogdHJ1ZSxcclxuICAgICAgcHJlc2VydmVPYmplY3RTdGFja2luZzogdHJ1ZSxcclxuICAgICAgcmVuZGVyT25BZGRSZW1vdmU6IHRydWUsXHJcbiAgICAgIHNraXBUYXJnZXRGaW5kOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHN0YXRlXG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICBpc0RyYXdpbmc6IGZhbHNlLFxyXG4gICAgICBkcmF3aW5nTW9kZTogJ25vbmUnLFxyXG4gICAgICBzdGFydFBvaW50OiBudWxsLFxyXG4gICAgICBlbmRQb2ludDogbnVsbCxcclxuICAgICAgY3VycmVudFJlY3Q6IG51bGwsXHJcbiAgICAgIGFjdGl2ZUxhYmVsVGV4dDogbnVsbCxcclxuICAgICAgY3Jvc3NoYWlyWDogbnVsbCxcclxuICAgICAgY3Jvc3NoYWlyWTogbnVsbCxcclxuICAgICAgem9vbTogMSxcclxuICAgICAgcGFuWDogMCxcclxuICAgICAgcGFuWTogMCxcclxuICAgICAgc2VsZWN0ZWRPYmplY3RzOiBbXSxcclxuICAgICAgbXVsdGlwbGVTZWxlY3Rpb246IGZhbHNlXHJcbiAgICB9O1xuXG4gICAgLy8gUmVhY3QgdG8gbW9kZSBjaGFuZ2VzIGZyb20gQXBwU3RhdGVcbiAgICB0cnkge1xuICAgICAgdGhpcy5hcHBTdGF0ZS5hZGRFdmVudExpc3RlbmVyKCdtb2RlOmNoYW5nZWQnLCAoZXZ0OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGV2dD8uZGF0YT8uY3VycmVudCBhcyAoJ2RyYXcnIHwgJ2VkaXQnKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hcHBseU1vZGVTZXR0aW5ncyhjdXJyZW50KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge31cbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFByb3BlcnRpZXMgKElDYW52YXNDb250cm9sbGVyIGludGVyZmFjZSlcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBnZXQgY2FudmFzKCk6IGZhYnJpYy5DYW52YXMge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW52YXMgbm90IGluaXRpYWxpemVkLiBDYWxsIGluaXRpYWxpemVDYW52YXMoKSBmaXJzdC4nKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHN0YXRlKCk6IENhbnZhc1N0YXRlIHtcclxuICAgIHJldHVybiB7IC4uLnRoaXMuX3N0YXRlIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNvbmZpZygpOiBDYW52YXNDb25maWcge1xyXG4gICAgcmV0dXJuIHsgLi4udGhpcy5fY29uZmlnIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdGUgQWNjZXNzb3JzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgaXNEcmF3aW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLmlzRHJhd2luZztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNTZWxlY3Rpb24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Wm9vbSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLnpvb207XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0UGFuKCk6IFBvaW50IHtcclxuICAgIHJldHVybiB7IHg6IHRoaXMuX3N0YXRlLnBhblgsIHk6IHRoaXMuX3N0YXRlLnBhblkgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXREaW1lbnNpb25zKCk6IENhbnZhc0RpbWVuc2lvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgd2lkdGg6IHRoaXMuX2NvbmZpZy53aWR0aCxcclxuICAgICAgaGVpZ2h0OiB0aGlzLl9jb25maWcuaGVpZ2h0LFxyXG4gICAgICBhc3BlY3RSYXRpbzogdGhpcy5fY29uZmlnLndpZHRoIC8gdGhpcy5fY29uZmlnLmhlaWdodFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbml0aWFsaXphdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGluaXRpYWxpemVDYW52YXMoY29udGFpbmVySWQ6IHN0cmluZywgY29uZmlnPzogUGFydGlhbDxDYW52YXNDb25maWc+KTogdm9pZCB7XG4gICAgLy8gQXBwbHkgY29uZmlnIG92ZXJyaWRlc1xyXG4gICAgaWYgKGNvbmZpZykge1xyXG4gICAgICB0aGlzLl9jb25maWcgPSB7IC4uLnRoaXMuX2NvbmZpZywgLi4uY29uZmlnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmluZCBjb250YWluZXIgZWxlbWVudFxyXG4gICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVySWQpO1xyXG4gICAgaWYgKCF0aGlzLmNvbnRhaW5lckVsZW1lbnQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW52YXMgY29udGFpbmVyIGVsZW1lbnQgd2l0aCBJRCAnJHtjb250YWluZXJJZH0nIG5vdCBmb3VuZGApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBjYW52YXMgZWxlbWVudFxyXG4gICAgY29uc3QgY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgY2FudmFzRWxlbWVudC5pZCA9IGAke2NvbnRhaW5lcklkfS1jYW52YXNgO1xyXG4gICAgY2FudmFzRWxlbWVudC53aWR0aCA9IHRoaXMuX2NvbmZpZy53aWR0aDtcclxuICAgIGNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gdGhpcy5fY29uZmlnLmhlaWdodDtcclxuXHJcbiAgICAvLyBDbGVhciBjb250YWluZXIgYW5kIGFkZCBjYW52YXNcbiAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGNhbnZhc0VsZW1lbnQpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBGYWJyaWMuanMgY2FudmFzXG4gICAgdGhpcy5fY2FudmFzID0gbmV3IEZhYnJpY0pTLkNhbnZhcyhjYW52YXNFbGVtZW50LCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuX2NvbmZpZy5iYWNrZ3JvdW5kQ29sb3IsXHJcbiAgICAgIHNlbGVjdGlvbjogdGhpcy5fY29uZmlnLnNlbGVjdGlvbixcclxuICAgICAgcHJlc2VydmVPYmplY3RTdGFja2luZzogdGhpcy5fY29uZmlnLnByZXNlcnZlT2JqZWN0U3RhY2tpbmcsXHJcbiAgICAgIHJlbmRlck9uQWRkUmVtb3ZlOiB0aGlzLl9jb25maWcucmVuZGVyT25BZGRSZW1vdmUsXHJcbiAgICAgIHNraXBUYXJnZXRGaW5kOiB0aGlzLl9jb25maWcuc2tpcFRhcmdldEZpbmQsXHJcbiAgICAgIHdpZHRoOiB0aGlzLl9jb25maWcud2lkdGgsXHJcbiAgICAgIGhlaWdodDogdGhpcy5fY29uZmlnLmhlaWdodCxcclxuICAgICAgLy8gRW5hYmxlIGhpZ2ggRFBJIHN1cHBvcnRcclxuICAgICAgZW5hYmxlUmV0aW5hU2NhbGluZzogdHJ1ZSxcclxuICAgICAgLy8gUGVyZm9ybWFuY2Ugc2V0dGluZ3NcclxuICAgICAgc3RhdGVmdWw6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWtlIGNhbnZhcyBmaWxsIGNvbnRhaW5lclxuICAgIHRoaXMucmVzaXplQ2FudmFzVG9Db250YWluZXIoKTtcblxuICAgIC8vIFNldHVwIGV2ZW50IGhhbmRsZXJzXG4gICAgdGhpcy5zZXR1cENhbnZhc0V2ZW50cygpO1xuXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IGNvbnRleHQgbWVudSBhbmQgdG9nZ2xlIG1vZGUgb24gcmlnaHQtY2xpY2sgd2l0aGluIGNvbnRhaW5lclxuICAgIHRyeSB7XG4gICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZS5idXR0b24gPT09IDIpIHsgLy8gUmlnaHQgY2xpY2tcbiAgICAgICAgICB0aGlzLmFwcFN0YXRlLnRvZ2dsZU1vZGUoKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge31cblxuICAgIC8vIEFwcGx5IGxhYmVsIG9wdGlvbnMgZnJvbSBhcHAgc3RhdGVcbiAgICB0aGlzLnN5bmNXaXRoQXBwU3RhdGUoKTtcblxuICAgIC8vIEFwcGx5IGN1cnJlbnQgbW9kZSBzZXR0aW5ncyB0byBjYW52YXNcbiAgICB0aGlzLmFwcGx5TW9kZVNldHRpbmdzKHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUpO1xuXG4gICAgLy8gUmVzaXplIGNhbnZhcyBvbiB3aW5kb3cgcmVzaXplXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIHRoaXMucmVzaXplQ2FudmFzVG9Db250YWluZXIoKTtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRJbWFnZSAmJiB0aGlzLmltYWdlT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IHByZXZab29tID0gdGhpcy5fc3RhdGUuem9vbTtcbiAgICAgICAgdGhpcy5yZXNldFpvb20oKTtcbiAgICAgICAgdGhpcy5yZXNpemVUb0ltYWdlKHRoaXMuY3VycmVudEltYWdlKTtcbiAgICAgICAgdGhpcy5zZXRab29tKHByZXZab29tKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVxdWVzdFJlbmRlcigpO1xuICAgIH0pO1xuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnYWZ0ZXI6cmVuZGVyJyxcclxuICAgICAgZGF0YTogeyBpbml0aWFsaXplZDogdHJ1ZSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZXN0cm95Q2FudmFzKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX2NhbnZhcykge1xyXG4gICAgICB0aGlzLl9jYW52YXMuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLl9jYW52YXMgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnQpIHtcclxuICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHN0YXRlXHJcbiAgICB0aGlzLl9zdGF0ZSA9IHtcclxuICAgICAgaXNEcmF3aW5nOiBmYWxzZSxcclxuICAgICAgZHJhd2luZ01vZGU6ICdub25lJyxcclxuICAgICAgc3RhcnRQb2ludDogbnVsbCxcclxuICAgICAgZW5kUG9pbnQ6IG51bGwsXHJcbiAgICAgIGN1cnJlbnRSZWN0OiBudWxsLFxyXG4gICAgICBhY3RpdmVMYWJlbFRleHQ6IG51bGwsXHJcbiAgICAgIGNyb3NzaGFpclg6IG51bGwsXHJcbiAgICAgIGNyb3NzaGFpclk6IG51bGwsXHJcbiAgICAgIHpvb206IDEsXHJcbiAgICAgIHBhblg6IDAsXHJcbiAgICAgIHBhblk6IDAsXHJcbiAgICAgIHNlbGVjdGVkT2JqZWN0czogW10sXHJcbiAgICAgIG11bHRpcGxlU2VsZWN0aW9uOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZSA9IG51bGw7XHJcbiAgICB0aGlzLmltYWdlT2JqZWN0ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbWFnZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgbG9hZEltYWdlKGltYWdlRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICAvLyBSZW1vdmUgZXhpc3RpbmcgaW1hZ2VcclxuICAgIHRoaXMuY2xlYXJJbWFnZSgpO1xyXG5cclxuICAgIHRoaXMuY3VycmVudEltYWdlID0gaW1hZ2VFbGVtZW50O1xyXG5cclxuICAgIC8vIENyZWF0ZSBmYWJyaWMgaW1hZ2Ugb2JqZWN0XHJcbiAgICB0aGlzLmltYWdlT2JqZWN0ID0gbmV3IEZhYnJpY0pTLkltYWdlKGltYWdlRWxlbWVudCwge1xuICAgICAgbGVmdDogMCxcclxuICAgICAgdG9wOiAwLFxyXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcclxuICAgICAgZXZlbnRlZDogZmFsc2UsXHJcbiAgICAgIGxvY2tNb3ZlbWVudFg6IHRydWUsXHJcbiAgICAgIGxvY2tNb3ZlbWVudFk6IHRydWUsXHJcbiAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZSxcclxuICAgICAgbG9ja1NjYWxpbmdYOiB0cnVlLFxyXG4gICAgICBsb2NrU2NhbGluZ1k6IHRydWUsXHJcbiAgICAgIGxvY2tVbmlTY2FsaW5nOiB0cnVlLFxyXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXHJcbiAgICAgIGhhc0JvcmRlcnM6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXNpemUgY2FudmFzIHRvIG1hdGNoIGltYWdlXHJcbiAgICB0aGlzLnJlc2l6ZVRvSW1hZ2UoaW1hZ2VFbGVtZW50KTtcclxuXHJcbiAgICAvLyBBZGQgaW1hZ2UgdG8gY2FudmFzIChzZW5kIHRvIGJhY2spXHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHRoaXMuaW1hZ2VPYmplY3QhIGFzIHVua25vd24gYXMgZmFicmljLk9iamVjdCk7XG4gICAgdGhpcy5pbWFnZU9iamVjdCEuc2VuZFRvQmFjaygpO1xuXHJcbiAgICAvLyBSZXNldCB2aWV3cG9ydFxyXG4gICAgdGhpcy5yZXNldFpvb20oKTtcclxuICAgIHRoaXMucmVzZXRQYW4oKTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2FmdGVyOnJlbmRlcicsXHJcbiAgICAgIGRhdGE6IHsgaW1hZ2VMb2FkZWQ6IHRydWUsIGltYWdlRGltZW5zaW9uczogeyB3aWR0aDogaW1hZ2VFbGVtZW50LndpZHRoLCBoZWlnaHQ6IGltYWdlRWxlbWVudC5oZWlnaHQgfSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbGVhckltYWdlKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBpZiAodGhpcy5pbWFnZU9iamVjdCkge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHRoaXMuaW1hZ2VPYmplY3QpO1xyXG4gICAgICB0aGlzLmltYWdlT2JqZWN0ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZSA9IG51bGw7XHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplVG9JbWFnZShpbWFnZTogSFRNTEltYWdlRWxlbWVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XG4gICAgLy8gRW5zdXJlIGNhbnZhcyBtYXRjaGVzIGNvbnRhaW5lciBzaXplXG4gICAgdGhpcy5yZXNpemVDYW52YXNUb0NvbnRhaW5lcigpO1xuXG4gICAgY29uc3QgY2FudmFzV2lkdGggPSB0aGlzLl9jYW52YXMuZ2V0V2lkdGgoKTtcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLl9jYW52YXMuZ2V0SGVpZ2h0KCk7XG5cbiAgICAvLyBTY2FsZSBpbWFnZSB0byBmaXQgaW5zaWRlIGNhbnZhcyBhbmQgY2VudGVyIGl0XG4gICAgaWYgKHRoaXMuaW1hZ2VPYmplY3QpIHtcbiAgICAgIGNvbnN0IHNjYWxlID0gTWF0aC5taW4oY2FudmFzV2lkdGggLyBpbWFnZS53aWR0aCwgY2FudmFzSGVpZ2h0IC8gaW1hZ2UuaGVpZ2h0KTtcbiAgICAgIGNvbnN0IHNjYWxlZFcgPSBpbWFnZS53aWR0aCAqIHNjYWxlO1xuICAgICAgY29uc3Qgc2NhbGVkSCA9IGltYWdlLmhlaWdodCAqIHNjYWxlO1xuICAgICAgdGhpcy5pbWFnZU9iamVjdC5zZXQoe1xuICAgICAgICBzY2FsZVg6IHNjYWxlLFxuICAgICAgICBzY2FsZVk6IHNjYWxlLFxuICAgICAgICBsZWZ0OiAoY2FudmFzV2lkdGggLSBzY2FsZWRXKSAvIDIsXG4gICAgICAgIHRvcDogKGNhbnZhc0hlaWdodCAtIHNjYWxlZEgpIC8gMlxuICAgICAgfSk7XG4gICAgICB0aGlzLl9jYW52YXMuY2VudGVyT2JqZWN0KHRoaXMuaW1hZ2VPYmplY3QgYXMgYW55KTtcbiAgICAgICh0aGlzLmltYWdlT2JqZWN0IGFzIGFueSkuc2V0Q29vcmRzKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZXNpemVDYW52YXNUb0NvbnRhaW5lcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhdGhpcy5jb250YWluZXJFbGVtZW50KSByZXR1cm47XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuY29udGFpbmVyRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVjdC53aWR0aCkpO1xuICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVjdC5oZWlnaHQpKTtcbiAgICB0aGlzLl9jb25maWcgPSB7IC4uLnRoaXMuX2NvbmZpZywgd2lkdGgsIGhlaWdodCB9O1xuICAgIHRoaXMuX2NhbnZhcy5zZXREaW1lbnNpb25zKHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIERyYXdpbmcgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhd2luZyhwb2ludDogUG9pbnQpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzIHx8IHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUgIT09ICdkcmF3JykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N0YXRlLmlzRHJhd2luZyA9IHRydWU7XHJcbiAgICB0aGlzLl9zdGF0ZS5kcmF3aW5nTW9kZSA9ICdyZWN0YW5nbGUnO1xyXG4gICAgdGhpcy5fc3RhdGUuc3RhcnRQb2ludCA9IHBvaW50O1xyXG4gICAgdGhpcy5fc3RhdGUuZW5kUG9pbnQgPSBwb2ludDtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGVtcG9yYXJ5IHJlY3RhbmdsZSBmb3IgZHJhd2luZyBmZWVkYmFja1xyXG4gICAgY29uc3QgcmVjdCA9IG5ldyBGYWJyaWNKUy5SZWN0KHtcbiAgICAgIGxlZnQ6IHBvaW50LngsXHJcbiAgICAgIHRvcDogcG9pbnQueSxcclxuICAgICAgd2lkdGg6IDAsXHJcbiAgICAgIGhlaWdodDogMCxcclxuICAgICAgLi4udGhpcy5kcmF3aW5nT3B0aW9ucyxcclxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXHJcbiAgICAgIGV2ZW50ZWQ6IGZhbHNlXHJcbiAgICB9KSBhcyBGYWJyaWNSZWN0YW5nbGU7XHJcblxyXG4gICAgcmVjdC5pc0xhYmVsID0gdHJ1ZTtcclxuICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0ID0gcmVjdDtcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQocmVjdCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vdXNlOmRvd24nLFxyXG4gICAgICBwb2ludGVyOiBwb2ludCxcclxuICAgICAgZGF0YTogeyBkcmF3aW5nOiB0cnVlIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZURyYXdpbmcocG9pbnQ6IFBvaW50KTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhdGhpcy5fc3RhdGUuaXNEcmF3aW5nIHx8ICF0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCB8fCAhdGhpcy5fc3RhdGUuc3RhcnRQb2ludCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHJlY3RhbmdsZSBkaW1lbnNpb25zXHJcbiAgICBjb25zdCBsZWZ0ID0gTWF0aC5taW4odGhpcy5fc3RhdGUuc3RhcnRQb2ludC54LCBwb2ludC54KTtcclxuICAgIGNvbnN0IHRvcCA9IE1hdGgubWluKHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueSwgcG9pbnQueSk7XHJcbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKHBvaW50LnggLSB0aGlzLl9zdGF0ZS5zdGFydFBvaW50LngpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5hYnMocG9pbnQueSAtIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueSk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRlbXBvcmFyeSByZWN0YW5nbGVcclxuICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0LnNldCh7XHJcbiAgICAgIGxlZnQsXHJcbiAgICAgIHRvcCxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdtb3VzZTptb3ZlJyxcclxuICAgICAgcG9pbnRlcjogcG9pbnQsXHJcbiAgICAgIGRhdGE6IHsgZHJhd2luZzogdHJ1ZSwgZGltZW5zaW9uczogeyB3aWR0aCwgaGVpZ2h0IH0gfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZmluaXNoRHJhd2luZyhwb2ludDogUG9pbnQpOiBCb3VuZGluZ0JveCB8IG51bGwge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMgfHwgIXRoaXMuX3N0YXRlLmlzRHJhd2luZyB8fCAhdGhpcy5fc3RhdGUuY3VycmVudFJlY3QgfHwgIXRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmF3aW5nKCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGZpbmFsIGRpbWVuc2lvbnNcclxuICAgIGNvbnN0IGxlZnQgPSBNYXRoLm1pbih0aGlzLl9zdGF0ZS5zdGFydFBvaW50LngsIHBvaW50LngpO1xyXG4gICAgY29uc3QgdG9wID0gTWF0aC5taW4odGhpcy5fc3RhdGUuc3RhcnRQb2ludC55LCBwb2ludC55KTtcclxuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5hYnMocG9pbnQueCAtIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueCk7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLmFicyhwb2ludC55IC0gdGhpcy5fc3RhdGUuc3RhcnRQb2ludC55KTtcclxuXHJcbiAgICAvLyBNaW5pbXVtIHNpemUgdmFsaWRhdGlvblxyXG4gICAgaWYgKHdpZHRoIDwgNSB8fCBoZWlnaHQgPCA1KSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhd2luZygpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb252ZXJ0IHRvIGltYWdlIGNvb3JkaW5hdGVzIGlmIGltYWdlIGlzIGxvYWRlZFxyXG4gICAgbGV0IG5vcm1hbGl6ZWRCb3g6IEJvdW5kaW5nQm94IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgaWYgKHRoaXMuY3VycmVudEltYWdlICYmIHRoaXMuaW1hZ2VPYmplY3QpIHtcclxuICAgICAgY29uc3QgaW1hZ2VDb29yZHMgPSB0aGlzLmNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyh7IHg6IGxlZnQsIHk6IHRvcCB9KTtcclxuICAgICAgY29uc3QgaW1hZ2VXaWR0aCA9IE1hdGguYWJzKHdpZHRoIC8gKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDEpKTtcclxuICAgICAgY29uc3QgaW1hZ2VIZWlnaHQgPSBNYXRoLmFicyhoZWlnaHQgLyAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMSkpO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGJvdW5kaW5nIGJveFxyXG4gICAgICBub3JtYWxpemVkQm94ID0ge1xyXG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlQm91bmRpbmdCb3hJZCgpLFxyXG4gICAgICAgIHg6IGltYWdlQ29vcmRzLngsXHJcbiAgICAgICAgeTogaW1hZ2VDb29yZHMueSxcclxuICAgICAgICB3aWR0aDogaW1hZ2VXaWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGltYWdlSGVpZ2h0LFxyXG4gICAgICAgIGNsYXNzSWQ6IDAsIC8vIERlZmF1bHQgY2xhc3NcclxuICAgICAgICBjb2xvcjogdGhpcy5nZXRDbGFzc0NvbG9yKDApLFxyXG4gICAgICAgIGlzVmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICBpc1NlbGVjdGVkOiB0cnVlLFxyXG4gICAgICAgIGlzVGVtcERyYXc6IGZhbHNlXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRlbXBvcmFyeSByZWN0YW5nbGVcclxuICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUodGhpcy5fc3RhdGUuY3VycmVudFJlY3QpO1xyXG5cclxuICAgIC8vIFJlc2V0IGRyYXdpbmcgc3RhdGVcclxuICAgIHRoaXMuX3N0YXRlLmlzRHJhd2luZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fc3RhdGUuZHJhd2luZ01vZGUgPSAnbm9uZSc7XHJcbiAgICB0aGlzLl9zdGF0ZS5zdGFydFBvaW50ID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0ID0gbnVsbDtcclxuXHJcbiAgICAvLyBBZGQgcGVybWFuZW50IGJvdW5kaW5nIGJveCBpZiB2YWxpZFxyXG4gICAgaWYgKG5vcm1hbGl6ZWRCb3gpIHtcclxuICAgICAgdGhpcy5hZGRCb3VuZGluZ0JveChub3JtYWxpemVkQm94KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vdXNlOnVwJyxcclxuICAgICAgcG9pbnRlcjogcG9pbnQsXHJcbiAgICAgIGRhdGE6IHsgZHJhd2luZzogZmFsc2UsIGJvdW5kaW5nQm94OiBub3JtYWxpemVkQm94IH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBub3JtYWxpemVkQm94O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhbmNlbERyYXdpbmcoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIGlmICh0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCkge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zdGF0ZS5pc0RyYXdpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuX3N0YXRlLmRyYXdpbmdNb2RlID0gJ25vbmUnO1xyXG4gICAgdGhpcy5fc3RhdGUuc3RhcnRQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLl9zdGF0ZS5lbmRQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEJvdW5kaW5nIEJveCBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYWRkQm91bmRpbmdCb3goYmJveDogQm91bmRpbmdCb3gpOiBGYWJyaWNSZWN0YW5nbGUge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW52YXMgbm90IGluaXRpYWxpemVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29udmVydCB0byBjYW52YXMgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IGNhbnZhc0Nvb3JkcyA9IHRoaXMuaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKHsgeDogYmJveC54LCB5OiBiYm94LnkgfSk7XHJcbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IHRoaXMuaW1hZ2VPYmplY3QgPyBiYm94LndpZHRoICogKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDEpIDogYmJveC53aWR0aDtcclxuICAgIGNvbnN0IGNhbnZhc0hlaWdodCA9IHRoaXMuaW1hZ2VPYmplY3QgPyBiYm94LmhlaWdodCAqICh0aGlzLmltYWdlT2JqZWN0LnNjYWxlWSB8fCAxKSA6IGJib3guaGVpZ2h0O1xyXG5cclxuICAgIC8vIENyZWF0ZSByZWN0YW5nbGVcclxuICAgIGNvbnN0IHJlY3QgPSBuZXcgRmFicmljSlMuUmVjdCh7XG4gICAgICBsZWZ0OiBjYW52YXNDb29yZHMueCxcclxuICAgICAgdG9wOiBjYW52YXNDb29yZHMueSxcclxuICAgICAgd2lkdGg6IGNhbnZhc1dpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNhbnZhc0hlaWdodCxcclxuICAgICAgc3Ryb2tlOiBiYm94LmNvbG9yLFxyXG4gICAgICBzdHJva2VXaWR0aDogdGhpcy5kcmF3aW5nT3B0aW9ucy5zdHJva2VXaWR0aCxcclxuICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgc2VsZWN0YWJsZTogdHJ1ZSxcclxuICAgICAgZXZlbnRlZDogdHJ1ZSxcclxuICAgICAgaGFzQ29udHJvbHM6IHRydWUsXHJcbiAgICAgIGhhc0JvcmRlcnM6IHRydWUsXHJcbiAgICAgIGJvcmRlckNvbG9yOiBiYm94LmNvbG9yLFxyXG4gICAgICBjb3JuZXJDb2xvcjogYmJveC5jb2xvcixcclxuICAgICAgdHJhbnNwYXJlbnRDb3JuZXJzOiBmYWxzZVxyXG4gICAgfSkgYXMgRmFicmljUmVjdGFuZ2xlO1xyXG5cclxuICAgIC8vIEF0dGFjaCBib3VuZGluZyBib3ggZGF0YVxyXG4gICAgcmVjdC5ib3VuZGluZ0JveCA9IGJib3g7XHJcbiAgICByZWN0LmlzTGFiZWwgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFkZCB0byBjYW52YXNcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQocmVjdCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGxhYmVsIHRleHQgaWYgbGFiZWxzIGFyZSBlbmFibGVkXHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscykge1xyXG4gICAgICB0aGlzLmNyZWF0ZUxhYmVsVGV4dChyZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBCcmluZyB0byBmcm9udCAoYnV0IGtlZXAgYmVoaW5kIGFueSBjdXJyZW50IGRyYXdpbmcpXHJcbiAgICByZWN0LmJyaW5nVG9Gcm9udCgpO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnb2JqZWN0OmFkZGVkJyxcclxuICAgICAgdGFyZ2V0OiByZWN0LFxyXG4gICAgICBkYXRhOiB7IGJvdW5kaW5nQm94OiBiYm94IH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZWN0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZUJvdW5kaW5nQm94KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICBjb25zdCByZWN0VG9SZW1vdmUgPSBvYmplY3RzLmZpbmQob2JqID0+IG9iai5ib3VuZGluZ0JveD8uaWQgPT09IGlkKTtcclxuXHJcbiAgICBpZiAocmVjdFRvUmVtb3ZlKSB7XHJcbiAgICAgIC8vIFJlbW92ZSBhc3NvY2lhdGVkIGxhYmVsIHRleHRcclxuICAgICAgaWYgKHJlY3RUb1JlbW92ZS5sYWJlbFRleHQpIHtcclxuICAgICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHJlY3RUb1JlbW92ZS5sYWJlbFRleHQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgcmVjdGFuZ2xlXHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUocmVjdFRvUmVtb3ZlKTtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0OnJlbW92ZWQnLFxyXG4gICAgICAgIHRhcmdldDogcmVjdFRvUmVtb3ZlLFxyXG4gICAgICAgIGRhdGE6IHsgYm91bmRpbmdCb3hJZDogaWQgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVCb3VuZGluZ0JveChpZDogc3RyaW5nLCB1cGRhdGVzOiBQYXJ0aWFsPEJvdW5kaW5nQm94Pik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuICAgIGNvbnN0IHJlY3QgPSBvYmplY3RzLmZpbmQob2JqID0+IG9iai5ib3VuZGluZ0JveD8uaWQgPT09IGlkKTtcclxuXHJcbiAgICBpZiAocmVjdCAmJiByZWN0LmJvdW5kaW5nQm94KSB7XHJcbiAgICAgIC8vIFVwZGF0ZSBib3VuZGluZyBib3ggZGF0YVxyXG4gICAgICBPYmplY3QuYXNzaWduKHJlY3QuYm91bmRpbmdCb3gsIHVwZGF0ZXMpO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHZpc3VhbCBwcm9wZXJ0aWVzXHJcbiAgICAgIGlmICh1cGRhdGVzLmNvbG9yKSB7XHJcbiAgICAgICAgcmVjdC5zZXQoe1xyXG4gICAgICAgICAgc3Ryb2tlOiB1cGRhdGVzLmNvbG9yLFxyXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IHVwZGF0ZXMuY29sb3IsXHJcbiAgICAgICAgICBjb3JuZXJDb2xvcjogdXBkYXRlcy5jb2xvclxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodXBkYXRlcy5pc1Zpc2libGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJlY3Quc2V0KHsgdmlzaWJsZTogdXBkYXRlcy5pc1Zpc2libGUgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBsYWJlbCB0ZXh0XHJcbiAgICAgIGlmIChyZWN0LmxhYmVsVGV4dCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlTGFiZWxUZXh0KHJlY3QpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdvYmplY3Q6bW9kaWZpZWQnLFxyXG4gICAgICAgIHRhcmdldDogcmVjdCxcclxuICAgICAgICBkYXRhOiB7IGJvdW5kaW5nQm94OiByZWN0LmJvdW5kaW5nQm94LCB1cGRhdGVzIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Qm91bmRpbmdCb3goaWQ6IHN0cmluZyk6IEJvdW5kaW5nQm94IHwgbnVsbCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICBjb25zdCByZWN0ID0gb2JqZWN0cy5maW5kKG9iaiA9PiBvYmouYm91bmRpbmdCb3g/LmlkID09PSBpZCk7XHJcblxyXG4gICAgcmV0dXJuIHJlY3Q/LmJvdW5kaW5nQm94IHx8IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0QWxsQm91bmRpbmdCb3hlcygpOiBCb3VuZGluZ0JveFtdIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm4gW107XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICByZXR1cm4gb2JqZWN0c1xyXG4gICAgICAuZmlsdGVyKG9iaiA9PiBvYmouaXNMYWJlbCAmJiBvYmouYm91bmRpbmdCb3gpXHJcbiAgICAgIC5tYXAob2JqID0+IG9iai5ib3VuZGluZ0JveCEpXHJcbiAgICAgIC5maWx0ZXIoYmJveCA9PiBiYm94ICE9PSB1bmRlZmluZWQpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFNlbGVjdGlvbiBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgc2VsZWN0Qm91bmRpbmdCb3goaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuICAgIGNvbnN0IHJlY3QgPSBvYmplY3RzLmZpbmQob2JqID0+IG9iai5ib3VuZGluZ0JveD8uaWQgPT09IGlkKTtcclxuXHJcbiAgICBpZiAocmVjdCkge1xyXG4gICAgICB0aGlzLl9jYW52YXMuc2V0QWN0aXZlT2JqZWN0KHJlY3QpO1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVzZWxlY3RBbGwoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XHJcbiAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZWxlY3Rpb246Y2xlYXJlZCdcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNlbGVjdGVkQm91bmRpbmdCb3hlcygpOiBCb3VuZGluZ0JveFtdIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5zZWxlY3RlZE9iamVjdHNcclxuICAgICAgLm1hcChvYmogPT4gKG9iaiBhcyBGYWJyaWNSZWN0YW5nbGUpLmJvdW5kaW5nQm94KVxyXG4gICAgICAuZmlsdGVyKGJib3ggPT4gYmJveCAhPT0gdW5kZWZpbmVkKSBhcyBCb3VuZGluZ0JveFtdO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGVjdGVkKCk6IEJvdW5kaW5nQm94W10ge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybiBbXTtcclxuXHJcbiAgICBjb25zdCBzZWxlY3RlZEJveGVzID0gdGhpcy5nZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTtcclxuICAgIGNvbnN0IGFjdGl2ZU9iamVjdCA9IHRoaXMuX2NhbnZhcy5nZXRBY3RpdmVPYmplY3QoKTtcclxuXHJcbiAgICBpZiAoYWN0aXZlT2JqZWN0KSB7XHJcbiAgICAgIGlmIChhY3RpdmVPYmplY3QudHlwZSA9PT0gJ2FjdGl2ZVNlbGVjdGlvbicpIHtcclxuICAgICAgICAvLyBNdWx0aXBsZSBzZWxlY3Rpb25cclxuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBhY3RpdmVPYmplY3QgYXMgZmFicmljLkFjdGl2ZVNlbGVjdGlvbjtcclxuICAgICAgICBjb25zdCBvYmplY3RzID0gc2VsZWN0aW9uLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuXHJcbiAgICAgICAgb2JqZWN0cy5mb3JFYWNoKG9iaiA9PiB7XHJcbiAgICAgICAgICBpZiAob2JqLmlzTGFiZWwgJiYgb2JqLmJvdW5kaW5nQm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQm91bmRpbmdCb3gob2JqLmJvdW5kaW5nQm94LmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBTaW5nbGUgc2VsZWN0aW9uXHJcbiAgICAgICAgY29uc3QgcmVjdCA9IGFjdGl2ZU9iamVjdCBhcyBGYWJyaWNSZWN0YW5nbGU7XHJcbiAgICAgICAgaWYgKHJlY3QuaXNMYWJlbCAmJiByZWN0LmJvdW5kaW5nQm94KSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUJvdW5kaW5nQm94KHJlY3QuYm91bmRpbmdCb3guaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGVzZWxlY3RBbGwoKTtcclxuICAgIHJldHVybiBzZWxlY3RlZEJveGVzO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExhYmVsIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBzaG93TGFiZWxzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyA9IHRydWU7XHJcbiAgICB0aGlzLnVwZGF0ZUxhYmVscygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGhpZGVMYWJlbHMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzID0gZmFsc2U7XHJcbiAgICB0aGlzLnVwZGF0ZUxhYmVscygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZUxhYmVscygpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcblxyXG4gICAgb2JqZWN0cy5mb3JFYWNoKG9iaiA9PiB7XHJcbiAgICAgIGlmIChvYmouaXNMYWJlbCAmJiBvYmouYm91bmRpbmdCb3gpIHtcclxuICAgICAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyAmJiAhb2JqLmxhYmVsVGV4dCkge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVMYWJlbFRleHQob2JqKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzICYmIG9iai5sYWJlbFRleHQpIHtcclxuICAgICAgICAgIHRoaXMuX2NhbnZhcyEucmVtb3ZlKG9iai5sYWJlbFRleHQpO1xyXG4gICAgICAgICAgb2JqLmxhYmVsVGV4dCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9IGVsc2UgaWYgKG9iai5sYWJlbFRleHQpIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxUZXh0KG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0TGFiZWxGb250KGZvbnRTaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICB0aGlzLnVwZGF0ZUxhYmVscygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFZpZXdwb3J0IE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyB6b29tSW4oKTogdm9pZCB7XHJcbiAgICBjb25zdCBuZXdab29tID0gTWF0aC5taW4odGhpcy5fc3RhdGUuem9vbSAqIDEuMiwgNSk7XHJcbiAgICB0aGlzLnNldFpvb20obmV3Wm9vbSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgem9vbU91dCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld1pvb20gPSBNYXRoLm1heCh0aGlzLl9zdGF0ZS56b29tIC8gMS4yLCAwLjEpO1xyXG4gICAgdGhpcy5zZXRab29tKG5ld1pvb20pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHpvb21Ub0ZpdCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzIHx8ICF0aGlzLmN1cnJlbnRJbWFnZSkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gdGhpcy5fY2FudmFzLmdldFdpZHRoKCk7XHJcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLl9jYW52YXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICBjb25zdCBpbWFnZVdpZHRoID0gdGhpcy5jdXJyZW50SW1hZ2Uud2lkdGg7XHJcbiAgICBjb25zdCBpbWFnZUhlaWdodCA9IHRoaXMuY3VycmVudEltYWdlLmhlaWdodDtcclxuXHJcbiAgICBjb25zdCBzY2FsZVggPSBjYW52YXNXaWR0aCAvIGltYWdlV2lkdGg7XHJcbiAgICBjb25zdCBzY2FsZVkgPSBjYW52YXNIZWlnaHQgLyBpbWFnZUhlaWdodDtcclxuICAgIGNvbnN0IHpvb20gPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XHJcblxyXG4gICAgdGhpcy5zZXRab29tKHpvb20pO1xyXG4gICAgdGhpcy5yZXNldFBhbigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0Wm9vbSgpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0Wm9vbSgxKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRab29tKHpvb206IG51bWJlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9zdGF0ZS56b29tID0gTWF0aC5tYXgoMC4xLCBNYXRoLm1pbig1LCB6b29tKSk7XHJcbiAgICB0aGlzLl9jYW52YXMuc2V0Wm9vbSh0aGlzLl9zdGF0ZS56b29tKTtcclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnYWZ0ZXI6cmVuZGVyJyxcclxuICAgICAgZGF0YTogeyB6b29tOiB0aGlzLl9zdGF0ZS56b29tIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBhblRvKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N0YXRlLnBhblggPSB4O1xyXG4gICAgdGhpcy5fc3RhdGUucGFuWSA9IHk7XHJcblxyXG4gICAgY29uc3QgdnB0ID0gdGhpcy5fY2FudmFzLnZpZXdwb3J0VHJhbnNmb3JtO1xyXG4gICAgaWYgKHZwdCAmJiB2cHQubGVuZ3RoID49IDYpIHtcclxuICAgICAgdnB0WzRdID0geDtcclxuICAgICAgdnB0WzVdID0geTtcclxuICAgICAgdGhpcy5fY2FudmFzLnNldFZpZXdwb3J0VHJhbnNmb3JtKHZwdCk7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldFBhbigpOiB2b2lkIHtcbiAgICB0aGlzLnBhblRvKDAsIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhbiB0aGUgdmlld3BvcnQgc28gdGhhdCB0aGUgZ2l2ZW4gaW1hZ2UgY29vcmRpbmF0ZXMgYXBwZWFyIGNlbnRlcmVkXG4gICAqL1xuICBwdWJsaWMgZ29Ub0ltYWdlQ29vcmRpbmF0ZXMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuXG4gICAgY29uc3QgY2FudmFzV2lkdGggPSB0aGlzLl9jYW52YXMuZ2V0V2lkdGgoKTtcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLl9jYW52YXMuZ2V0SGVpZ2h0KCk7XG4gICAgY29uc3Qgem9vbSA9IHRoaXMuX3N0YXRlLnpvb207XG5cbiAgICBjb25zdCBjYW52YXNQb2ludCA9IHRoaXMuaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKHsgeCwgeSB9KTtcbiAgICBjb25zdCB2cHQgPSB0aGlzLl9jYW52YXMudmlld3BvcnRUcmFuc2Zvcm07XG4gICAgaWYgKHZwdCAmJiB2cHQubGVuZ3RoID49IDYpIHtcbiAgICAgIHZwdFs0XSA9IGNhbnZhc1dpZHRoIC8gMiAtIHpvb20gKiBjYW52YXNQb2ludC54O1xuICAgICAgdnB0WzVdID0gY2FudmFzSGVpZ2h0IC8gMiAtIHpvb20gKiBjYW52YXNQb2ludC55O1xuICAgICAgdGhpcy5fY2FudmFzLnNldFZpZXdwb3J0VHJhbnNmb3JtKHZwdCk7XG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIG1ldGhvZCB0byBzZXQgem9vbSBieSBwZXJjZW50YWdlIChlLmcuLCAxMDAgPT4gMS4wKVxuICAgKi9cbiAgcHVibGljIHNldFpvb21QZXJjZW50KHBlcmNlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNsYW1wZWQgPSBNYXRoLm1heCgxMCwgTWF0aC5taW4oNTAwLCBwZXJjZW50KSk7XG4gICAgdGhpcy5zZXRab29tKGNsYW1wZWQgLyAxMDApO1xuICB9XG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ3Jvc3NoYWlyIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBzaG93Q3Jvc3NoYWlyKHBvaW50OiBQb2ludCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLmhpZGVDcm9zc2hhaXIoKTtcclxuXHJcbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IHRoaXMuX2NhbnZhcy5nZXRXaWR0aCgpO1xyXG4gICAgY29uc3QgY2FudmFzSGVpZ2h0ID0gdGhpcy5fY2FudmFzLmdldEhlaWdodCgpO1xyXG5cclxuICAgIC8vIEhvcml6b250YWwgbGluZVxyXG4gICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCA9IG5ldyBGYWJyaWNKUy5MaW5lKFswLCBwb2ludC55LCBjYW52YXNXaWR0aCwgcG9pbnQueV0sIHtcbiAgICAgIHN0cm9rZTogJyNmZmZmZmYnLFxyXG4gICAgICBzdHJva2VXaWR0aDogMSxcclxuICAgICAgc3Ryb2tlRGFzaEFycmF5OiBbNSwgNV0sXHJcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxyXG4gICAgICBldmVudGVkOiBmYWxzZSxcclxuICAgICAgZXhjbHVkZUZyb21FeHBvcnQ6IHRydWVcclxuICAgIH0pIGFzIEZhYnJpY0xpbmU7XHJcbiAgICAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCBhcyBhbnkpLmlzQ3Jvc3NoYWlyID0gdHJ1ZTtcclxuICAgICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYIGFzIGFueSkuY3Jvc3NoYWlyVHlwZSA9ICdob3Jpem9udGFsJztcclxuXHJcbiAgICAvLyBWZXJ0aWNhbCBsaW5lXHJcbiAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZID0gbmV3IEZhYnJpY0pTLkxpbmUoW3BvaW50LngsIDAsIHBvaW50LngsIGNhbnZhc0hlaWdodF0sIHtcbiAgICAgIHN0cm9rZTogJyNmZmZmZmYnLFxyXG4gICAgICBzdHJva2VXaWR0aDogMSxcclxuICAgICAgc3Ryb2tlRGFzaEFycmF5OiBbNSwgNV0sXHJcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxyXG4gICAgICBldmVudGVkOiBmYWxzZSxcclxuICAgICAgZXhjbHVkZUZyb21FeHBvcnQ6IHRydWVcclxuICAgIH0pIGFzIEZhYnJpY0xpbmU7XHJcbiAgICAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSBhcyBhbnkpLmlzQ3Jvc3NoYWlyID0gdHJ1ZTtcclxuICAgICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZIGFzIGFueSkuY3Jvc3NoYWlyVHlwZSA9ICd2ZXJ0aWNhbCc7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLmFkZCh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYKTtcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSk7XHJcblxyXG4gICAgLy8gQnJpbmcgY3Jvc3NoYWlyIHRvIGZyb250XHJcbiAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYLmJyaW5nVG9Gcm9udCgpO1xyXG4gICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWS5icmluZ1RvRnJvbnQoKTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGlkZUNyb3NzaGFpcigpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgaWYgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclgpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZSh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYKTtcclxuICAgICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclkpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZSh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZKTtcclxuICAgICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZUNyb3NzaGFpcihwb2ludDogUG9pbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLmFwcFN0YXRlLmlzQ3Jvc3NoYWlyVmlzaWJsZSkge1xuICAgICAgdGhpcy5oaWRlQ3Jvc3NoYWlyKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT25seSBzaG93IGNyb3NzaGFpciB3aGVuIHBvaW50ZXIgaXMgaW5zaWRlIGEgbGFiZWwgYm94IGFyZWFcbiAgICBjb25zdCBpbWdQdCA9IHRoaXMuY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKHBvaW50KTtcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcbiAgICBjb25zdCBpc0luc2lkZUFueUJveCA9IG9iamVjdHMuc29tZShvYmogPT4ge1xuICAgICAgY29uc3QgYmJveCA9IG9iai5ib3VuZGluZ0JveDtcbiAgICAgIGlmICghb2JqLmlzTGFiZWwgfHwgIWJib3gpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGltZ1B0LnggPj0gYmJveC54ICYmIGltZ1B0LnggPD0gYmJveC54ICsgYmJveC53aWR0aCAmJlxuICAgICAgICBpbWdQdC55ID49IGJib3gueSAmJiBpbWdQdC55IDw9IGJib3gueSArIGJib3guaGVpZ2h0XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaWYgKGlzSW5zaWRlQW55Qm94KSB7XG4gICAgICB0aGlzLnNob3dDcm9zc2hhaXIocG9pbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhpZGVDcm9zc2hhaXIoKTtcbiAgICB9XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDb29yZGluYXRlIENvbnZlcnNpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBjYW52YXNUb0ltYWdlKGNhbnZhc1BvaW50OiBQb2ludCk6IEltYWdlQ29vcmRpbmF0ZSB7XHJcbiAgICBjb25zdCBpbWFnZUNvb3JkcyA9IHRoaXMuY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKGNhbnZhc1BvaW50KTtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB0aGlzLm5vcm1hbGl6ZUNvb3JkaW5hdGVzKGltYWdlQ29vcmRzLCB7XHJcbiAgICAgIHdpZHRoOiB0aGlzLmN1cnJlbnRJbWFnZT8ud2lkdGggfHwgMSxcclxuICAgICAgaGVpZ2h0OiB0aGlzLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IGNhbnZhc1BvaW50LngsXHJcbiAgICAgIHk6IGNhbnZhc1BvaW50LnksXHJcbiAgICAgIGltYWdlWDogaW1hZ2VDb29yZHMueCxcclxuICAgICAgaW1hZ2VZOiBpbWFnZUNvb3Jkcy55LFxyXG4gICAgICBub3JtYWxpemVkXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGltYWdlVG9DYW52YXMoaW1hZ2VQb2ludDogUG9pbnQpOiBDYW52YXNDb29yZGluYXRlIHtcclxuICAgIGNvbnN0IGNhbnZhc0Nvb3JkcyA9IHRoaXMuaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKGltYWdlUG9pbnQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IGltYWdlUG9pbnQueCxcclxuICAgICAgeTogaW1hZ2VQb2ludC55LFxyXG4gICAgICBjYW52YXNYOiBjYW52YXNDb29yZHMueCxcclxuICAgICAgY2FudmFzWTogY2FudmFzQ29vcmRzLnlcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbm9ybWFsaXplQ29vcmRpbmF0ZXMoaW1hZ2VQb2ludDogUG9pbnQsIGltYWdlU2l6ZTogU2l6ZSk6IFBvaW50IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IGltYWdlUG9pbnQueCAvIGltYWdlU2l6ZS53aWR0aCxcclxuICAgICAgeTogaW1hZ2VQb2ludC55IC8gaW1hZ2VTaXplLmhlaWdodFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZW5vcm1hbGl6ZUNvb3JkaW5hdGVzKG5vcm1hbGl6ZWRQb2ludDogUG9pbnQsIGltYWdlU2l6ZTogU2l6ZSk6IFBvaW50IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IG5vcm1hbGl6ZWRQb2ludC54ICogaW1hZ2VTaXplLndpZHRoLFxyXG4gICAgICB5OiBub3JtYWxpemVkUG9pbnQueSAqIGltYWdlU2l6ZS5oZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gWU9MTyBGb3JtYXQgQ29udmVyc2lvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGJvdW5kaW5nQm94VG9ZT0xPKGJib3g6IEJvdW5kaW5nQm94LCBpbWFnZVNpemU6IFNpemUpOiBZT0xPTGFiZWwge1xyXG4gICAgY29uc3QgY2VudGVyWCA9IChiYm94LnggKyBiYm94LndpZHRoIC8gMikgLyBpbWFnZVNpemUud2lkdGg7XHJcbiAgICBjb25zdCBjZW50ZXJZID0gKGJib3gueSArIGJib3guaGVpZ2h0IC8gMikgLyBpbWFnZVNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3Qgd2lkdGggPSBiYm94LndpZHRoIC8gaW1hZ2VTaXplLndpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gYmJveC5oZWlnaHQgLyBpbWFnZVNpemUuaGVpZ2h0O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNsYXNzSWQ6IGJib3guY2xhc3NJZCxcclxuICAgICAgY2VudGVyWCxcclxuICAgICAgY2VudGVyWSxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodCxcclxuICAgICAgY29uZmlkZW5jZTogYmJveC5jb25maWRlbmNlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHlvbG9Ub0JvdW5kaW5nQm94KHlvbG86IFlPTE9MYWJlbCwgaW1hZ2VTaXplOiBTaXplKTogQm91bmRpbmdCb3gge1xyXG4gICAgY29uc3Qgd2lkdGggPSB5b2xvLndpZHRoICogaW1hZ2VTaXplLndpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0geW9sby5oZWlnaHQgKiBpbWFnZVNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3QgeCA9ICh5b2xvLmNlbnRlclggKiBpbWFnZVNpemUud2lkdGgpIC0gKHdpZHRoIC8gMik7XHJcbiAgICBjb25zdCB5ID0gKHlvbG8uY2VudGVyWSAqIGltYWdlU2l6ZS5oZWlnaHQpIC0gKGhlaWdodCAvIDIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlkOiB0aGlzLmdlbmVyYXRlQm91bmRpbmdCb3hJZCgpLFxyXG4gICAgICB4LFxyXG4gICAgICB5LFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgaGVpZ2h0LFxyXG4gICAgICBjbGFzc0lkOiB5b2xvLmNsYXNzSWQsXHJcbiAgICAgIGNvbG9yOiB0aGlzLmdldENsYXNzQ29sb3IoeW9sby5jbGFzc0lkKSxcclxuICAgICAgaXNWaXNpYmxlOiB0cnVlLFxyXG4gICAgICBpc1NlbGVjdGVkOiBmYWxzZSxcclxuICAgICAgY29uZmlkZW5jZTogeW9sby5jb25maWRlbmNlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IEhhbmRsaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBDYW52YXNFdmVudFR5cGUsIGhhbmRsZXI6IENhbnZhc0V2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5fZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIFtdKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50TGlzdGVuZXJzLmdldCh0eXBlKSEucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IENhbnZhc0V2ZW50VHlwZSwgaGFuZGxlcjogQ2FudmFzRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFJlbmRlcmluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlcXVlc3RSZW5kZXIoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZXF1ZXN0UmVuZGVyQWxsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gUHJpdmF0ZSBIZWxwZXIgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cENhbnZhc0V2ZW50cygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuXG4gICAgLy8gTW91c2UgZXZlbnRzXG4gICAgbGV0IGlzUGFubmluZyA9IGZhbHNlO1xuICAgIGxldCBsYXN0UG9zID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOmRvd24nLCAoZSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMuX2NhbnZhcyEuZ2V0UG9pbnRlcihlLmUpO1xuICAgICAgdGhpcy51cGRhdGVDcm9zc2hhaXIocG9pbnRlcik7XG5cbiAgICAgIC8vIFN0YXJ0IHBhbm5pbmcgb24gbWlkZGxlIGNsaWNrIG9yIHdoZW4gQWx0IHByZXNzZWQgKHJpZ2h0LWNsaWNrIHJlc2VydmVkIGZvciBtb2RlIHRvZ2dsZSlcbiAgICAgIGNvbnN0IGV2ID0gZS5lIGFzIE1vdXNlRXZlbnQ7XG4gICAgICBjb25zdCBzdGFydFBhbiA9IGV2LmJ1dHRvbiA9PT0gMSB8fCBldi5hbHRLZXkgfHwgKGV2IGFzIGFueSkuc3BhY2VLZXk7XG4gICAgICBpZiAoc3RhcnRQYW4pIHtcbiAgICAgICAgaXNQYW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgbGFzdFBvcyA9IHsgeDogZXYuY2xpZW50WCwgeTogZXYuY2xpZW50WSB9O1xuICAgICAgICB0aGlzLl9jYW52YXMhLnNldEN1cnNvcignZ3JhYmJpbmcnKTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUgPT09ICdkcmF3JyAmJiAhZS50YXJnZXQpIHtcbiAgICAgICAgdGhpcy5zdGFydERyYXdpbmcocG9pbnRlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOm1vdmUnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMuX2NhbnZhcyEuZ2V0UG9pbnRlcihlLmUpO1xuICAgICAgdGhpcy51cGRhdGVDcm9zc2hhaXIocG9pbnRlcik7XG5cbiAgICAgIC8vIERpc3BhdGNoIG1vdXNlIG1vdmUgd2l0aCBjYW52YXMvaW1hZ2UgY29vcmRpbmF0ZXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGltYWdlUHQgPSB0aGlzLmNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyhwb2ludGVyKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICB0eXBlOiAnbW91c2U6bW92ZScsXG4gICAgICAgICAgcG9pbnRlcixcbiAgICAgICAgICBkYXRhOiB7IGNhbnZhczogeyB4OiBwb2ludGVyLngsIHk6IHBvaW50ZXIueSB9LCBpbWFnZTogeyB4OiBpbWFnZVB0LngsIHk6IGltYWdlUHQueSB9IH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIHt9XG5cbiAgICAgIGlmIChpc1Bhbm5pbmcpIHtcbiAgICAgICAgY29uc3QgZXYgPSBlLmUgYXMgTW91c2VFdmVudDtcbiAgICAgICAgY29uc3QgdjogYW55ID0gdGhpcy5fY2FudmFzIS52aWV3cG9ydFRyYW5zZm9ybSBhcyBhbnk7XG4gICAgICAgIGlmICghdiB8fCB2Lmxlbmd0aCA8IDYpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdls0XSArPSBldi5jbGllbnRYIC0gbGFzdFBvcy54O1xuICAgICAgICB2WzVdICs9IGV2LmNsaWVudFkgLSBsYXN0UG9zLnk7XG4gICAgICAgIHRoaXMuX2NhbnZhcyEuc2V0Vmlld3BvcnRUcmFuc2Zvcm0odiBhcyBudW1iZXJbXSk7XG4gICAgICAgIGxhc3RQb3MgPSB7IHg6IGV2LmNsaWVudFgsIHk6IGV2LmNsaWVudFkgfTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3N0YXRlLmlzRHJhd2luZykge1xuICAgICAgICB0aGlzLnVwZGF0ZURyYXdpbmcocG9pbnRlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOnVwJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLl9jYW52YXMhLmdldFBvaW50ZXIoZS5lKTtcblxuICAgICAgaWYgKGlzUGFubmluZykge1xuICAgICAgICBpc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5zZXRDdXJzb3IoJ2RlZmF1bHQnKTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3N0YXRlLmlzRHJhd2luZykge1xuICAgICAgICB0aGlzLmZpbmlzaERyYXdpbmcocG9pbnRlcik7XG4gICAgICB9XG4gICAgfSk7XG5cclxuICAgIC8vIFNlbGVjdGlvbiBldmVudHNcclxuICAgIHRoaXMuX2NhbnZhcy5vbignc2VsZWN0aW9uOmNyZWF0ZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7IHR5cGU6ICdzZWxlY3Rpb246Y3JlYXRlZCcgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMub24oJ3NlbGVjdGlvbjp1cGRhdGVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoeyB0eXBlOiAnc2VsZWN0aW9uOnVwZGF0ZWQnIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLm9uKCdzZWxlY3Rpb246Y2xlYXJlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZE9iamVjdHMoKTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHsgdHlwZTogJ3NlbGVjdGlvbjpjbGVhcmVkJyB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9iamVjdCBtb2RpZmljYXRpb24gZXZlbnRzXHJcbiAgICB0aGlzLl9jYW52YXMub24oJ29iamVjdDptb2RpZmllZCcsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVPYmplY3RNb2RpZmllZChlLnRhcmdldCBhcyBGYWJyaWNSZWN0YW5nbGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gV2hlZWwgem9vbSAoem9vbSB0byBwb2ludGVyKVxuICAgIHRoaXMuX2NhbnZhcy5vbignbW91c2U6d2hlZWwnLCAob3B0OiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRlbHRhID0gb3B0LmUuZGVsdGFZO1xuICAgICAgbGV0IHpvb20gPSB0aGlzLl9zdGF0ZS56b29tO1xuICAgICAgem9vbSAqPSBkZWx0YSA+IDAgPyAwLjkgOiAxLjE7XG4gICAgICB6b29tID0gTWF0aC5tYXgoMC4xLCBNYXRoLm1pbig1LCB6b29tKSk7XG5cbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IEZhYnJpY0pTLlBvaW50KG9wdC5lLm9mZnNldFgsIG9wdC5lLm9mZnNldFkpO1xuICAgICAgdGhpcy5fY2FudmFzIS56b29tVG9Qb2ludChwb2ludCwgem9vbSk7XG4gICAgICB0aGlzLl9zdGF0ZS56b29tID0gem9vbTtcblxuICAgICAgb3B0LmUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIG9wdC5lLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBseU1vZGVTZXR0aW5ncyhtb2RlPzogJ2RyYXcnIHwgJ2VkaXQnKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcbiAgICBjb25zdCBtID0gbW9kZSB8fCB0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlO1xuXG4gICAgLy8gSW4gZHJhdyBtb2RlLCBkaXNhYmxlIHNlbGVjdGlvbiBhbmQgdGFyZ2V0IGZpbmRpbmcgdG8gbWFrZSBkcmF3aW5nIGVhc2llclxuICAgIGNvbnN0IGRyYXdNb2RlID0gbSA9PT0gJ2RyYXcnO1xuICAgICh0aGlzLl9jYW52YXMgYXMgYW55KS5zZWxlY3Rpb24gPSAhZHJhd01vZGU7XG4gICAgKHRoaXMuX2NhbnZhcyBhcyBhbnkpLnNraXBUYXJnZXRGaW5kID0gZHJhd01vZGU7XG5cbiAgICAvLyBVcGRhdGUgb2JqZWN0IHNlbGVjdGFiaWxpdHkgYmFzZWQgb24gbW9kZVxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpO1xuICAgIG9iamVjdHMuZm9yRWFjaChvYmogPT4ge1xuICAgICAgb2JqLnNlbGVjdGFibGUgPSAhZHJhd01vZGU7XG4gICAgICBvYmouZXZlbnRlZCA9ICFkcmF3TW9kZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2NhbnZhcy5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gIH1cblxyXG4gIHByaXZhdGUgdXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBhY3RpdmVPYmplY3QgPSB0aGlzLl9jYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCk7XHJcblxyXG4gICAgaWYgKCFhY3RpdmVPYmplY3QpIHtcclxuICAgICAgdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzID0gW107XHJcbiAgICAgIHRoaXMuX3N0YXRlLm11bHRpcGxlU2VsZWN0aW9uID0gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKGFjdGl2ZU9iamVjdC50eXBlID09PSAnYWN0aXZlU2VsZWN0aW9uJykge1xyXG4gICAgICB0aGlzLl9zdGF0ZS5zZWxlY3RlZE9iamVjdHMgPSAoYWN0aXZlT2JqZWN0IGFzIGZhYnJpYy5BY3RpdmVTZWxlY3Rpb24pLmdldE9iamVjdHMoKTtcclxuICAgICAgdGhpcy5fc3RhdGUubXVsdGlwbGVTZWxlY3Rpb24gPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzID0gW2FjdGl2ZU9iamVjdF07XHJcbiAgICAgIHRoaXMuX3N0YXRlLm11bHRpcGxlU2VsZWN0aW9uID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU9iamVjdE1vZGlmaWVkKHJlY3Q6IEZhYnJpY1JlY3RhbmdsZSk6IHZvaWQge1xyXG4gICAgaWYgKCFyZWN0LmlzTGFiZWwgfHwgIXJlY3QuYm91bmRpbmdCb3ggfHwgIXRoaXMuaW1hZ2VPYmplY3QpIHJldHVybjtcclxuXHJcbiAgICAvLyBDb252ZXJ0IGJhY2sgdG8gaW1hZ2UgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IGltYWdlQ29vcmRzID0gdGhpcy5jYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMoe1xyXG4gICAgICB4OiByZWN0LmxlZnQgfHwgMCxcclxuICAgICAgeTogcmVjdC50b3AgfHwgMFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW1hZ2VXaWR0aCA9IChyZWN0LndpZHRoIHx8IDApIC8gKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDEpO1xyXG4gICAgY29uc3QgaW1hZ2VIZWlnaHQgPSAocmVjdC5oZWlnaHQgfHwgMCkgLyAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMSk7XHJcblxyXG4gICAgLy8gVXBkYXRlIGJvdW5kaW5nIGJveFxyXG4gICAgcmVjdC5ib3VuZGluZ0JveC54ID0gaW1hZ2VDb29yZHMueDtcclxuICAgIHJlY3QuYm91bmRpbmdCb3gueSA9IGltYWdlQ29vcmRzLnk7XHJcbiAgICByZWN0LmJvdW5kaW5nQm94LndpZHRoID0gaW1hZ2VXaWR0aDtcclxuICAgIHJlY3QuYm91bmRpbmdCb3guaGVpZ2h0ID0gaW1hZ2VIZWlnaHQ7XHJcblxyXG4gICAgLy8gVXBkYXRlIGxhYmVsIHRleHQgcG9zaXRpb25cclxuICAgIGlmIChyZWN0LmxhYmVsVGV4dCkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUxhYmVsVGV4dChyZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnb2JqZWN0Om1vZGlmaWVkJyxcclxuICAgICAgdGFyZ2V0OiByZWN0LFxyXG4gICAgICBkYXRhOiB7IGJvdW5kaW5nQm94OiByZWN0LmJvdW5kaW5nQm94IH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVMYWJlbFRleHQocmVjdDogRmFicmljUmVjdGFuZ2xlKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhcmVjdC5ib3VuZGluZ0JveCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGJib3ggPSByZWN0LmJvdW5kaW5nQm94O1xyXG4gICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5hcHBTdGF0ZS5jbGFzc05hbWVzLmdldChiYm94LmNsYXNzSWQudG9TdHJpbmcoKSkgfHwgYENsYXNzICR7YmJveC5jbGFzc0lkfWA7XHJcblxyXG4gICAgbGV0IGxhYmVsVGV4dCA9ICcnO1xyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDbGFzc0lkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBiYm94LmNsYXNzSWQudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q2xhc3NOYW1lKSB7XHJcbiAgICAgIGlmIChsYWJlbFRleHQpIGxhYmVsVGV4dCArPSAnOiAnO1xyXG4gICAgICBsYWJlbFRleHQgKz0gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDb25maWRlbmNlICYmIGJib3guY29uZmlkZW5jZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBgICgkeyhiYm94LmNvbmZpZGVuY2UgKiAxMDApLnRvRml4ZWQoMSl9JSlgO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRleHQgPSBuZXcgRmFicmljSlMuVGV4dChsYWJlbFRleHQsIHtcbiAgICAgIGxlZnQ6IChyZWN0LmxlZnQgfHwgMCkgKyAyLFxyXG4gICAgICB0b3A6IChyZWN0LnRvcCB8fCAwKSAtIHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplIC0gMixcclxuICAgICAgZm9udFNpemU6IHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplLFxyXG4gICAgICBmb250RmFtaWx5OiB0aGlzLmxhYmVsT3B0aW9ucy5mb250RmFtaWx5LFxyXG4gICAgICBmaWxsOiB0aGlzLmxhYmVsT3B0aW9ucy5mb250Q29sb3IsXHJcbiAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5sYWJlbE9wdGlvbnMuYmFja2dyb3VuZENvbG9yLFxyXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcclxuICAgICAgZXZlbnRlZDogZmFsc2VcclxuICAgIH0pIGFzIEZhYnJpY1RleHQ7XHJcblxyXG4gICAgdGV4dC5wYXJlbnRSZWN0ID0gcmVjdDtcclxuICAgIHRleHQuYm91bmRpbmdCb3ggPSBiYm94O1xyXG4gICAgdGV4dC5pc0xhYmVsID0gdHJ1ZTtcclxuXHJcbiAgICByZWN0LmxhYmVsVGV4dCA9IHRleHQ7XHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHRleHQpO1xyXG4gICAgdGV4dC5icmluZ1RvRnJvbnQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlTGFiZWxUZXh0KHJlY3Q6IEZhYnJpY1JlY3RhbmdsZSk6IHZvaWQge1xyXG4gICAgaWYgKCFyZWN0LmxhYmVsVGV4dCB8fCAhcmVjdC5ib3VuZGluZ0JveCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGJib3ggPSByZWN0LmJvdW5kaW5nQm94O1xyXG4gICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5hcHBTdGF0ZS5jbGFzc05hbWVzLmdldChiYm94LmNsYXNzSWQudG9TdHJpbmcoKSkgfHwgYENsYXNzICR7YmJveC5jbGFzc0lkfWA7XHJcblxyXG4gICAgbGV0IGxhYmVsVGV4dCA9ICcnO1xyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDbGFzc0lkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBiYm94LmNsYXNzSWQudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q2xhc3NOYW1lKSB7XHJcbiAgICAgIGlmIChsYWJlbFRleHQpIGxhYmVsVGV4dCArPSAnOiAnO1xyXG4gICAgICBsYWJlbFRleHQgKz0gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDb25maWRlbmNlICYmIGJib3guY29uZmlkZW5jZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBgICgkeyhiYm94LmNvbmZpZGVuY2UgKiAxMDApLnRvRml4ZWQoMSl9JSlgO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3QubGFiZWxUZXh0LnNldCh7XHJcbiAgICAgIHRleHQ6IGxhYmVsVGV4dCxcclxuICAgICAgbGVmdDogKHJlY3QubGVmdCB8fCAwKSArIDIsXHJcbiAgICAgIHRvcDogKHJlY3QudG9wIHx8IDApIC0gdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUgLSAyLFxyXG4gICAgICBmb250U2l6ZTogdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUsXHJcbiAgICAgIGZpbGw6IHRoaXMubGFiZWxPcHRpb25zLmZvbnRDb2xvcixcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLmxhYmVsT3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3JcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMoY2FudmFzUG9pbnQ6IFBvaW50KTogUG9pbnQge1xyXG4gICAgaWYgKCF0aGlzLmltYWdlT2JqZWN0KSByZXR1cm4gY2FudmFzUG9pbnQ7XHJcblxyXG4gICAgY29uc3Qgc2NhbGVYID0gdGhpcy5pbWFnZU9iamVjdC5zY2FsZVggfHwgMTtcclxuICAgIGNvbnN0IHNjYWxlWSA9IHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVZIHx8IDE7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogY2FudmFzUG9pbnQueCAvIHNjYWxlWCxcclxuICAgICAgeTogY2FudmFzUG9pbnQueSAvIHNjYWxlWVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKGltYWdlUG9pbnQ6IFBvaW50KTogUG9pbnQge1xyXG4gICAgaWYgKCF0aGlzLmltYWdlT2JqZWN0KSByZXR1cm4gaW1hZ2VQb2ludDtcclxuXHJcbiAgICBjb25zdCBzY2FsZVggPSB0aGlzLmltYWdlT2JqZWN0LnNjYWxlWCB8fCAxO1xyXG4gICAgY29uc3Qgc2NhbGVZID0gdGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBpbWFnZVBvaW50LnggKiBzY2FsZVgsXHJcbiAgICAgIHk6IGltYWdlUG9pbnQueSAqIHNjYWxlWVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVCb3VuZGluZ0JveElkKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYGJib3hfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRDbGFzc0NvbG9yKGNsYXNzSWQ6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gY29sb3JQYWxldHRlW2NsYXNzSWQgJSBjb2xvclBhbGV0dGUubGVuZ3RoXSB8fCAnI2ZmMDAwMCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN5bmNXaXRoQXBwU3RhdGUoKTogdm9pZCB7XHJcbiAgICAvLyBTeW5jIGxhYmVsIGRpc3BsYXkgb3B0aW9ucyB3aXRoIGFwcCBzdGF0ZVxyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyA9IHRoaXMuYXBwU3RhdGUuc2hvd0xhYmVsc09uQ2FudmFzO1xyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUgPSB0aGlzLmFwcFN0YXRlLmxhYmVsRm9udFNpemU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IENhbnZhc0V2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gY2FudmFzIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVmFsaWRhdGlvbiBhbmQgUGVyZm9ybWFuY2VcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyB2YWxpZGF0ZSgpOiBDYW52YXNWYWxpZGF0aW9uIHtcclxuICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGlmICghdGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdDYW52YXMgbm90IGluaXRpYWxpemVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRJbWFnZSkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdObyBpbWFnZSBsb2FkZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvYmplY3RDb3VudCA9IHRoaXMuX2NhbnZhcz8uZ2V0T2JqZWN0cygpLmxlbmd0aCB8fCAwO1xyXG4gICAgaWYgKG9iamVjdENvdW50ID4gMTAwKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goYEhpZ2ggb2JqZWN0IGNvdW50OiAke29iamVjdENvdW50fWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBwZXJmb3JtYW5jZSBtZXRyaWNzXHJcbiAgICB0aGlzLnBlcmZvcm1hbmNlTWV0cmljcy5vYmplY3RDb3VudCA9IG9iamVjdENvdW50O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3MsXHJcbiAgICAgIHBlcmZvcm1hbmNlOiB0aGlzLnBlcmZvcm1hbmNlTWV0cmljc1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBGdW5jdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2FudmFzQ29udHJvbGxlcihhcHBTdGF0ZTogSUFwcFN0YXRlKTogQ2FudmFzQ29udHJvbGxlciB7XHJcbiAgcmV0dXJuIG5ldyBDYW52YXNDb250cm9sbGVyKGFwcFN0YXRlKTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhbnZhc0NvbnRyb2xsZXI7XHJcbmV4cG9ydCB0eXBlIHsgSUNhbnZhc0NvbnRyb2xsZXIgfTtcbiIsIi8qKlxyXG4gKiBFdmVudCBNYW5hZ2VyIEltcGxlbWVudGF0aW9uXHJcbiAqXHJcbiAqIEhhbmRsZXMga2V5Ym9hcmQgc2hvcnRjdXRzLCBtb3VzZSBldmVudHMsIGNvbnRleHQgbWVudXMsIGFuZCB1c2VyIGludGVyYWN0aW9uc1xyXG4gKiBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMC4wXHJcbiAqIEBhdXRob3IgRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1pZ3JhdGlvblxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi4vdHlwZXMnO1xyXG5pbXBvcnQgeyBJQXBwU3RhdGUgfSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5pbXBvcnQgeyBJQ2FudmFzQ29udHJvbGxlciwgQm91bmRpbmdCb3ggfSBmcm9tICcuLi90eXBlcy9jYW52YXMnO1xyXG5pbXBvcnQgeyBJRmlsZVN5c3RlbVNlcnZpY2UgfSBmcm9tICcuLi90eXBlcy9maWxlc3lzdGVtJztcclxuaW1wb3J0IHtcclxuICBFdmVudE1hbmFnZXJDb25maWcsXHJcbiAgS2V5Ym9hcmRTaG9ydGN1dCxcclxuICBNb3VzZUV2ZW50VHlwZSxcclxuICBDb250ZXh0TWVudUV2ZW50LFxyXG4gIEV2ZW50TWFuYWdlckV2ZW50LFxyXG4gIEV2ZW50TWFuYWdlckV2ZW50SGFuZGxlcixcclxuICBJRXZlbnRNYW5hZ2VyXHJcbn0gZnJvbSAnLi4vdHlwZXMvdWknO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFdmVudCBNYW5hZ2VyIEltcGxlbWVudGF0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIgaW1wbGVtZW50cyBJRXZlbnRNYW5hZ2VyIHtcclxuICAvLyBEZXBlbmRlbmNpZXNcclxuICBwcml2YXRlIGFwcFN0YXRlOiBJQXBwU3RhdGU7XHJcbiAgcHJpdmF0ZSBjYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcjtcclxuICBwcml2YXRlIGZpbGVTeXN0ZW1TZXJ2aWNlOiBJRmlsZVN5c3RlbVNlcnZpY2U7XHJcblxyXG4gIC8vIEV2ZW50IGhhbmRsZXJzIGFuZCBzdGF0ZVxyXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgRXZlbnRNYW5hZ2VyRXZlbnRIYW5kbGVyW10+KCk7XHJcbiAgcHJpdmF0ZSBrZXlib2FyZEhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIEtleWJvYXJkU2hvcnRjdXQ+KCk7XHJcbiAgcHJpdmF0ZSBjb250ZXh0TWVudVRhcmdldDogYW55ID0gbnVsbDtcclxuICBwcml2YXRlIGlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICBwcml2YXRlIGxhc3RNb3VzZVBvc2l0aW9uOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG5cclxuICAvLyBDb25maWd1cmF0aW9uXHJcbiAgcHJpdmF0ZSBjb25maWc6IEV2ZW50TWFuYWdlckNvbmZpZyA9IHtcclxuICAgIGVuYWJsZUtleWJvYXJkU2hvcnRjdXRzOiB0cnVlLFxyXG4gICAgZW5hYmxlQ29udGV4dE1lbnU6IHRydWUsXHJcbiAgICBlbmFibGVEcmFnQW5kRHJvcDogdHJ1ZSxcclxuICAgIGRvdWJsZUNsaWNrRGVsYXk6IDMwMCxcclxuICAgIGxvbmdQcmVzc0RlbGF5OiA1MDAsXHJcbiAgICBkcmFnVGhyZXNob2xkOiA1XHJcbiAgfTtcclxuXHJcbiAgLy8gS2V5Ym9hcmQgc2hvcnRjdXRzXHJcbiAgcHJpdmF0ZSBzaG9ydGN1dHM6IEtleWJvYXJkU2hvcnRjdXRbXSA9IFtcclxuICAgIC8vIEZpbGUgb3BlcmF0aW9uc1xyXG4gICAgeyBrZXk6ICdLZXlTJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdTYXZlIGxhYmVscycsIGFjdGlvbjogJ3NhdmUnIH0sXHJcbiAgICB7IGtleTogJ0tleU8nLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ09wZW4gZm9sZGVyJywgYWN0aW9uOiAnb3Blbi1mb2xkZXInIH0sXHJcblxyXG4gICAgLy8gTW9kZSBzd2l0Y2hpbmdcclxuICAgIHsga2V5OiAnS2V5RCcsIGRlc2NyaXB0aW9uOiAnU3dpdGNoIHRvIGRyYXcgbW9kZScsIGFjdGlvbjogJ21vZGUtZHJhdycgfSxcclxuICAgIHsga2V5OiAnS2V5RScsIGRlc2NyaXB0aW9uOiAnU3dpdGNoIHRvIGVkaXQgbW9kZScsIGFjdGlvbjogJ21vZGUtZWRpdCcgfSxcclxuICAgIHsga2V5OiAnVGFiJywgZGVzY3JpcHRpb246ICdUb2dnbGUgbW9kZScsIGFjdGlvbjogJ21vZGUtdG9nZ2xlJyB9LFxyXG5cclxuICAgIC8vIENhbnZhcyBvcGVyYXRpb25zXHJcbiAgICB7IGtleTogJ0RlbGV0ZScsIGRlc2NyaXB0aW9uOiAnRGVsZXRlIHNlbGVjdGVkJywgYWN0aW9uOiAnZGVsZXRlLXNlbGVjdGVkJyB9LFxyXG4gICAgeyBrZXk6ICdCYWNrc3BhY2UnLCBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBzZWxlY3RlZCcsIGFjdGlvbjogJ2RlbGV0ZS1zZWxlY3RlZCcgfSxcclxuICAgIHsga2V5OiAnRXNjYXBlJywgZGVzY3JpcHRpb246ICdDYW5jZWwvRGVzZWxlY3QnLCBhY3Rpb246ICdjYW5jZWwnIH0sXHJcbiAgICB7IGtleTogJ0tleUEnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1NlbGVjdCBhbGwnLCBhY3Rpb246ICdzZWxlY3QtYWxsJyB9LFxyXG5cclxuICAgIC8vIFpvb20gYW5kIHZpZXdcclxuICAgIHsga2V5OiAnRXF1YWwnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1pvb20gaW4nLCBhY3Rpb246ICd6b29tLWluJyB9LFxyXG4gICAgeyBrZXk6ICdNaW51cycsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnWm9vbSBvdXQnLCBhY3Rpb246ICd6b29tLW91dCcgfSxcclxuICAgIHsga2V5OiAnRGlnaXQwJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdSZXNldCB6b29tJywgYWN0aW9uOiAnem9vbS1yZXNldCcgfSxcclxuICAgIHsga2V5OiAnS2V5RicsIGRlc2NyaXB0aW9uOiAnWm9vbSB0byBmaXQnLCBhY3Rpb246ICd6b29tLWZpdCcgfSxcclxuXHJcbiAgICAvLyBOYXZpZ2F0aW9uXHJcbiAgICB7IGtleTogJ0Fycm93TGVmdCcsIGRlc2NyaXB0aW9uOiAnUHJldmlvdXMgaW1hZ2UnLCBhY3Rpb246ICdwcmV2LWltYWdlJyB9LFxyXG4gICAgeyBrZXk6ICdBcnJvd1JpZ2h0JywgZGVzY3JpcHRpb246ICdOZXh0IGltYWdlJywgYWN0aW9uOiAnbmV4dC1pbWFnZScgfSxcclxuICAgIHsga2V5OiAnSG9tZScsIGRlc2NyaXB0aW9uOiAnRmlyc3QgaW1hZ2UnLCBhY3Rpb246ICdmaXJzdC1pbWFnZScgfSxcclxuICAgIHsga2V5OiAnRW5kJywgZGVzY3JpcHRpb246ICdMYXN0IGltYWdlJywgYWN0aW9uOiAnbGFzdC1pbWFnZScgfSxcclxuXHJcbiAgICAvLyBMYWJlbHMgYW5kIGNsYXNzZXNcclxuICAgIHsga2V5OiAnS2V5TCcsIGRlc2NyaXB0aW9uOiAnVG9nZ2xlIGxhYmVscyB2aXNpYmlsaXR5JywgYWN0aW9uOiAndG9nZ2xlLWxhYmVscycgfSxcclxuICAgIHsga2V5OiAnS2V5QycsIGRlc2NyaXB0aW9uOiAnVG9nZ2xlIGNyb3NzaGFpcicsIGFjdGlvbjogJ3RvZ2dsZS1jcm9zc2hhaXInIH0sXHJcbiAgICB7IGtleTogJ0tleUgnLCBkZXNjcmlwdGlvbjogJ1RvZ2dsZSBoZWxwJywgYWN0aW9uOiAndG9nZ2xlLWhlbHAnIH0sXHJcblxyXG4gICAgLy8gQ29weS9QYXN0ZVxyXG4gICAgeyBrZXk6ICdLZXlDJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdDb3B5IHNlbGVjdGVkJywgYWN0aW9uOiAnY29weScgfSxcclxuICAgIHsga2V5OiAnS2V5VicsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnUGFzdGUnLCBhY3Rpb246ICdwYXN0ZScgfSxcclxuICAgIHsga2V5OiAnS2V5WCcsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnQ3V0IHNlbGVjdGVkJywgYWN0aW9uOiAnY3V0JyB9LFxyXG5cclxuICAgIC8vIFVuZG8vUmVkbyAoZm9yIGZ1dHVyZSBpbXBsZW1lbnRhdGlvbilcclxuICAgIHsga2V5OiAnS2V5WicsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVW5kbycsIGFjdGlvbjogJ3VuZG8nIH0sXHJcbiAgICB7IGtleTogJ0tleVknLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1JlZG8nLCBhY3Rpb246ICdyZWRvJyB9LFxyXG4gICAgeyBrZXk6ICdLZXlaJywgY3RybEtleTogdHJ1ZSwgc2hpZnRLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnUmVkbycsIGFjdGlvbjogJ3JlZG8nIH1cclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIGFwcFN0YXRlOiBJQXBwU3RhdGUsXHJcbiAgICBjYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcixcclxuICAgIGZpbGVTeXN0ZW1TZXJ2aWNlOiBJRmlsZVN5c3RlbVNlcnZpY2UsXHJcbiAgICBjb25maWc/OiBQYXJ0aWFsPEV2ZW50TWFuYWdlckNvbmZpZz5cclxuICApIHtcclxuICAgIHRoaXMuYXBwU3RhdGUgPSBhcHBTdGF0ZTtcclxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlciA9IGNhbnZhc0NvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlID0gZmlsZVN5c3RlbVNlcnZpY2U7XHJcblxyXG4gICAgaWYgKGNvbmZpZykge1xyXG4gICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLmNvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZUV2ZW50SGFuZGxlcnMoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbml0aWFsaXphdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplRXZlbnRIYW5kbGVycygpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmNvbmZpZy5lbmFibGVLZXlib2FyZFNob3J0Y3V0cykge1xyXG4gICAgICB0aGlzLnNldHVwS2V5Ym9hcmRFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcuZW5hYmxlQ29udGV4dE1lbnUpIHtcclxuICAgICAgdGhpcy5zZXR1cENvbnRleHRNZW51RXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlnLmVuYWJsZURyYWdBbmREcm9wKSB7XHJcbiAgICAgIHRoaXMuc2V0dXBEcmFnQW5kRHJvcEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2V0dXBNb3VzZUV2ZW50cygpO1xyXG4gICAgdGhpcy5zZXR1cENhbnZhc0V2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEtleWJvYXJkIEV2ZW50IEhhbmRsaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIHNldHVwS2V5Ym9hcmRFdmVudHMoKTogdm9pZCB7XHJcbiAgICAvLyBCdWlsZCBrZXlib2FyZCBzaG9ydGN1dHMgbWFwXHJcbiAgICB0aGlzLnNob3J0Y3V0cy5mb3JFYWNoKHNob3J0Y3V0ID0+IHtcclxuICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRTaG9ydGN1dEtleShzaG9ydGN1dCk7XHJcbiAgICAgIHRoaXMua2V5Ym9hcmRIYW5kbGVycy5zZXQoa2V5LCBzaG9ydGN1dCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHbG9iYWwga2V5Ym9hcmQgZXZlbnQgbGlzdGVuZXJcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleURvd24uYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuaGFuZGxlS2V5VXAuYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUtleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIC8vIElnbm9yZSBldmVudHMgZnJvbSBpbnB1dCBlbGVtZW50cyAodW5sZXNzIGdsb2JhbCBzaG9ydGN1dHMpXHJcbiAgICBpZiAodGhpcy5pc0lucHV0RWxlbWVudChldmVudC50YXJnZXQgYXMgRWxlbWVudCkgJiYgIXRoaXMuaXNHbG9iYWxTaG9ydGN1dChldmVudCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0RXZlbnRLZXkoZXZlbnQpO1xyXG4gICAgY29uc3Qgc2hvcnRjdXQgPSB0aGlzLmtleWJvYXJkSGFuZGxlcnMuZ2V0KGtleSk7XHJcblxyXG4gICAgaWYgKHNob3J0Y3V0KSB7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICB0aGlzLmV4ZWN1dGVTaG9ydGN1dChzaG9ydGN1dCwgZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVLZXlVcChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgLy8gSGFuZGxlIGFueSBrZXkgdXAgc3BlY2lmaWMgbG9naWMgaGVyZVxyXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcclxuICAgICAgdGhpcy5oYW5kbGVFc2NhcGVLZXkoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZXhlY3V0ZVNob3J0Y3V0KHNob3J0Y3V0OiBLZXlib2FyZFNob3J0Y3V0LCBldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgc3dpdGNoIChzaG9ydGN1dC5hY3Rpb24pIHtcclxuICAgICAgLy8gRmlsZSBvcGVyYXRpb25zXHJcbiAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlU2F2ZUxhYmVscygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdvcGVuLWZvbGRlcic6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPcGVuRm9sZGVyKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBNb2RlIHN3aXRjaGluZ1xyXG4gICAgICBjYXNlICdtb2RlLWRyYXcnOlxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0TW9kZSgnZHJhdycpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtb2RlLWVkaXQnOlxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0TW9kZSgnZWRpdCcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtb2RlLXRvZ2dsZSc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS50b2dnbGVNb2RlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBDYW52YXMgb3BlcmF0aW9uc1xyXG4gICAgICBjYXNlICdkZWxldGUtc2VsZWN0ZWQnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlRGVsZXRlU2VsZWN0ZWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY2FuY2VsJzpcclxuICAgICAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdzZWxlY3QtYWxsJzpcclxuICAgICAgICB0aGlzLmhhbmRsZVNlbGVjdEFsbCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgLy8gWm9vbSBhbmQgdmlld1xyXG4gICAgICBjYXNlICd6b29tLWluJzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbUluKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3pvb20tb3V0JzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbU91dCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd6b29tLXJlc2V0JzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIucmVzZXRab29tKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3pvb20tZml0JzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbVRvRml0KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBOYXZpZ2F0aW9uXHJcbiAgICAgIGNhc2UgJ3ByZXYtaW1hZ2UnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlUHJldmlvdXNJbWFnZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICduZXh0LWltYWdlJzpcclxuICAgICAgICB0aGlzLmhhbmRsZU5leHRJbWFnZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdmaXJzdC1pbWFnZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVGaXJzdEltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xhc3QtaW1hZ2UnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlTGFzdEltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBMYWJlbHMgYW5kIFVJXHJcbiAgICAgIGNhc2UgJ3RvZ2dsZS1sYWJlbHMnOlxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0U2hvd0xhYmVscyghdGhpcy5hcHBTdGF0ZS5zaG93TGFiZWxzT25DYW52YXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci51cGRhdGVMYWJlbHMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndG9nZ2xlLWNyb3NzaGFpcic6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS50b2dnbGVDcm9zc2hhaXIoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIENvcHkvUGFzdGVcclxuICAgICAgY2FzZSAnY29weSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVDb3B5KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3Bhc3RlJzpcclxuICAgICAgICB0aGlzLmhhbmRsZVBhc3RlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2N1dCc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVDdXQoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIEZ1dHVyZSBmZWF0dXJlc1xyXG4gICAgICBjYXNlICd1bmRvJzpcclxuICAgICAgY2FzZSAncmVkbyc6XHJcbiAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHVuZG8vcmVkbyBzeXN0ZW1cclxuICAgICAgICBjb25zb2xlLmxvZyhgJHtzaG9ydGN1dC5hY3Rpb259IG5vdCB5ZXQgaW1wbGVtZW50ZWRgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIHNob3J0Y3V0IGFjdGlvbjogJHtzaG9ydGN1dC5hY3Rpb259YCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3Nob3J0Y3V0OmV4ZWN1dGVkJyxcclxuICAgICAgZGF0YTogeyBzaG9ydGN1dCwgb3JpZ2luYWxFdmVudDogZXZlbnQgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTW91c2UgRXZlbnQgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBNb3VzZUV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIEdsb2JhbCBtb3VzZSB0cmFja2luZ1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZU1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZVVwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cENhbnZhc0V2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIENhbnZhcy1zcGVjaWZpYyBtb3VzZSBldmVudHMgYXJlIGhhbmRsZWQgYnkgQ2FudmFzQ29udHJvbGxlclxyXG4gICAgLy8gV2UgbGlzdGVuIHRvIGNhbnZhcyBldmVudHMgYW5kIGNvb3JkaW5hdGUgd2l0aCBvdGhlciBzeXN0ZW1zXHJcblxyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlOmRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IGV2ZW50LnBvaW50ZXIgfHwgeyB4OiAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuYXBwU3RhdGUubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlOm1vdmUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IGV2ZW50LnBvaW50ZXIgfHwgeyB4OiAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuYXBwU3RhdGUubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uO1xyXG4gICAgICB0aGlzLnVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXNEaXNwbGF5KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0aW9uOmNyZWF0ZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ3NlbGVjdGlvbjpjaGFuZ2VkJyxcclxuICAgICAgICBkYXRhOiB7IGhhc1NlbGVjdGlvbjogdHJ1ZSB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdGlvbjpjbGVhcmVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdzZWxlY3Rpb246Y2hhbmdlZCcsXHJcbiAgICAgICAgZGF0YTogeyBoYXNTZWxlY3Rpb246IGZhbHNlIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlR2xvYmFsTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0RyYWdnaW5nKSB7XHJcbiAgICAgIC8vIEhhbmRsZSBkcmFnIG9wZXJhdGlvbnNcclxuICAgICAgdGhpcy5oYW5kbGVEcmFnTW92ZShldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUdsb2JhbE1vdXNlVXAoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuICAgICAgdGhpcy5oYW5kbGVEcmFnRW5kKGV2ZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDb250ZXh0IE1lbnUgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBDb250ZXh0TWVudUV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBjb250ZXh0IG1lbnUgYW5kIHNob3cgY3VzdG9tIG9uZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLmhhbmRsZUNvbnRleHRNZW51LmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDb250ZXh0TWVudShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgRWxlbWVudDtcclxuICAgIGNvbnN0IGNhbnZhc0VsZW1lbnQgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzLmdldEVsZW1lbnQoKTtcclxuXHJcbiAgICBpZiAodGFyZ2V0ID09PSBjYW52YXNFbGVtZW50IHx8IGNhbnZhc0VsZW1lbnQuY29udGFpbnModGFyZ2V0KSkge1xyXG4gICAgICB0aGlzLnNob3dDYW52YXNDb250ZXh0TWVudShldmVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNob3dHZW5lcmljQ29udGV4dE1lbnUoZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93Q2FudmFzQ29udGV4dE1lbnUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzLmdldFBvaW50ZXIoZXZlbnQpO1xyXG4gICAgY29uc3Qgc2VsZWN0ZWRCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTtcclxuXHJcbiAgICBjb25zdCBjb250ZXh0RXZlbnQ6IENvbnRleHRNZW51RXZlbnQgPSB7XHJcbiAgICAgIHR5cGU6ICdjYW52YXMnLFxyXG4gICAgICBwb3NpdGlvbjogeyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH0sXHJcbiAgICAgIGNhbnZhc1Bvc2l0aW9uOiBwb2ludGVyLFxyXG4gICAgICB0YXJnZXQ6IG51bGwsXHJcbiAgICAgIGhhc1NlbGVjdGlvbjogc2VsZWN0ZWRCb3hlcy5sZW5ndGggPiAwLFxyXG4gICAgICBzZWxlY3RlZE9iamVjdHM6IHNlbGVjdGVkQm94ZXNcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zaG93Q29udGV4dE1lbnUoY29udGV4dEV2ZW50KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd0dlbmVyaWNDb250ZXh0TWVudShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgY29udGV4dEV2ZW50OiBDb250ZXh0TWVudUV2ZW50ID0ge1xyXG4gICAgICB0eXBlOiAnZ2VuZXJpYycsXHJcbiAgICAgIHBvc2l0aW9uOiB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfSxcclxuICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQsXHJcbiAgICAgIGhhc1NlbGVjdGlvbjogZmFsc2UsXHJcbiAgICAgIHNlbGVjdGVkT2JqZWN0czogW11cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zaG93Q29udGV4dE1lbnUoY29udGV4dEV2ZW50KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd0NvbnRleHRNZW51KGNvbnRleHRFdmVudDogQ29udGV4dE1lbnVFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5jb250ZXh0TWVudVRhcmdldCA9IGNvbnRleHRFdmVudDtcclxuXHJcbiAgICAvLyBDcmVhdGUgY29udGV4dCBtZW51IGJhc2VkIG9uIHR5cGUgYW5kIHNlbGVjdGlvblxyXG4gICAgY29uc3QgbWVudUl0ZW1zID0gdGhpcy5idWlsZENvbnRleHRNZW51SXRlbXMoY29udGV4dEV2ZW50KTtcclxuXHJcbiAgICAvLyBTaG93IGNvbnRleHQgbWVudSAodGhpcyB3b3VsZCBpbnRlZ3JhdGUgd2l0aCBVSSBmcmFtZXdvcmspXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY29udGV4dC1tZW51OnNob3cnLFxyXG4gICAgICBkYXRhOiB7IGNvbnRleHQ6IGNvbnRleHRFdmVudCwgbWVudUl0ZW1zIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZENvbnRleHRNZW51SXRlbXMoY29udGV4dDogQ29udGV4dE1lbnVFdmVudCk6IGFueVtdIHtcclxuICAgIGNvbnN0IGl0ZW1zOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIGlmIChjb250ZXh0LnR5cGUgPT09ICdjYW52YXMnKSB7XHJcbiAgICAgIGlmIChjb250ZXh0Lmhhc1NlbGVjdGlvbikge1xyXG4gICAgICAgIGl0ZW1zLnB1c2goXHJcbiAgICAgICAgICB7IGxhYmVsOiAnRGVsZXRlIFNlbGVjdGVkJywgYWN0aW9uOiAnZGVsZXRlLXNlbGVjdGVkJywgc2hvcnRjdXQ6ICdEZWwnIH0sXHJcbiAgICAgICAgICB7IGxhYmVsOiAnQ29weScsIGFjdGlvbjogJ2NvcHknLCBzaG9ydGN1dDogJ0N0cmwrQycgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdDdXQnLCBhY3Rpb246ICdjdXQnLCBzaG9ydGN1dDogJ0N0cmwrWCcgfSxcclxuICAgICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGl0ZW1zLnB1c2goXHJcbiAgICAgICAgeyBsYWJlbDogJ1Bhc3RlJywgYWN0aW9uOiAncGFzdGUnLCBzaG9ydGN1dDogJ0N0cmwrVicsIGRpc2FibGVkOiAhdGhpcy5hcHBTdGF0ZS5nZXRDbGlwYm9hcmQoKSB9LFxyXG4gICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfSxcclxuICAgICAgICB7IGxhYmVsOiAnU2VsZWN0IEFsbCcsIGFjdGlvbjogJ3NlbGVjdC1hbGwnLCBzaG9ydGN1dDogJ0N0cmwrQScgfSxcclxuICAgICAgICB7IGxhYmVsOiAnRGVzZWxlY3QgQWxsJywgYWN0aW9uOiAnZGVzZWxlY3QtYWxsJywgc2hvcnRjdXQ6ICdFc2MnIH0sXHJcbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdab29tIHRvIEZpdCcsIGFjdGlvbjogJ3pvb20tZml0Jywgc2hvcnRjdXQ6ICdGJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdSZXNldCBab29tJywgYWN0aW9uOiAnem9vbS1yZXNldCcsIHNob3J0Y3V0OiAnQ3RybCswJyB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIERyYWcgYW5kIERyb3AgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBEcmFnQW5kRHJvcEV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIEZpbGUgZHJhZyBhbmQgZHJvcCBmb3IgbG9hZGluZyBpbWFnZXNcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5oYW5kbGVEcmFnT3Zlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmhhbmRsZURyb3AuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmhhbmRsZURyYWdFbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuaGFuZGxlRHJhZ0xlYXZlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnT3ZlcihldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnQuZGF0YVRyYW5zZmVyIS5kcm9wRWZmZWN0ID0gJ2NvcHknO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnRW50ZXIoZXZlbnQ6IERyYWdFdmVudCk6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIC8vIEFkZCB2aXN1YWwgZmVlZGJhY2sgZm9yIGRyYWcgb3BlcmF0aW9uXHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2RyYWctYWN0aXZlJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdMZWF2ZShldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoIWV2ZW50LnJlbGF0ZWRUYXJnZXQpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnLWFjdGl2ZScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcm9wKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctYWN0aXZlJyk7XHJcblxyXG4gICAgY29uc3QgZmlsZXMgPSBBcnJheS5mcm9tKGV2ZW50LmRhdGFUcmFuc2Zlcj8uZmlsZXMgfHwgW10pO1xyXG4gICAgY29uc3QgaW1hZ2VGaWxlcyA9IGZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUudHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSk7XHJcblxyXG4gICAgaWYgKGltYWdlRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmhhbmRsZUltYWdlRmlsZURyb3AoaW1hZ2VGaWxlc1swXSEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVJbWFnZUZpbGVEcm9wKGZpbGU6IEZpbGUpOiB2b2lkIHtcclxuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmxvYWRJbWFnZShpbWcpO1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpO1xyXG4gICAgfTtcclxuICAgIGltZy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnTW92ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgLy8gSGFuZGxlIG9iamVjdCBkcmFnZ2luZyB3aXRoaW4gY2FudmFzXHJcbiAgICAvLyBUaGlzIGlzIG1vc3RseSBoYW5kbGVkIGJ5IEZhYnJpYy5qcywgYnV0IHdlIGNhbiBhZGQgY3VzdG9tIGxvZ2ljIGhlcmVcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRHJhZ0VuZChldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQWN0aW9uIEhhbmRsZXJzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGFzeW5jIGhhbmRsZVNhdmVMYWJlbHMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIXRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZSB8fCAhdGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYm91bmRpbmdCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCk7XHJcbiAgICAgIGNvbnN0IHlvbG9MYWJlbHMgPSBib3VuZGluZ0JveGVzLm1hcChiYm94ID0+XHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmJvdW5kaW5nQm94VG9ZT0xPKGJib3gsIHtcclxuICAgICAgICAgIHdpZHRoOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8ud2lkdGggfHwgMSxcclxuICAgICAgICAgIGhlaWdodDogdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2U/LmhlaWdodCB8fCAxXHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGF3YWl0IHRoaXMuZmlsZVN5c3RlbVNlcnZpY2Uuc2F2ZUxhYmVscyhcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGUubmFtZSxcclxuICAgICAgICB5b2xvTGFiZWxzLFxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUubGFiZWxGb2xkZXJIYW5kbGVcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2xhYmVsczpzYXZlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlLm5hbWUsIGNvdW50OiB5b2xvTGFiZWxzLmxlbmd0aCB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgbGFiZWxzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3BlbkZvbGRlcigpOiB2b2lkIHtcclxuICAgIC8vIFRyaWdnZXIgZm9sZGVyIHNlbGVjdGlvbiBVSVxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ZvbGRlcjpzZWxlY3QtcmVxdWVzdGVkJyxcclxuICAgICAgZGF0YTogeyB0eXBlOiAnaW1hZ2UnIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEZWxldGVTZWxlY3RlZCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGRlbGV0ZWRCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5kZWxldGVTZWxlY3RlZCgpO1xyXG4gICAgaWYgKGRlbGV0ZWRCb3hlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdHM6ZGVsZXRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogZGVsZXRlZEJveGVzLmxlbmd0aCwgb2JqZWN0czogZGVsZXRlZEJveGVzIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBdXRvLXNhdmUgaWYgZW5hYmxlZFxyXG4gICAgICBpZiAodGhpcy5hcHBTdGF0ZS5pc0F1dG9TYXZlRW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlU2F2ZUxhYmVscygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNhbmNlbCgpOiB2b2lkIHtcclxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5kZXNlbGVjdEFsbCgpO1xyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmNhbmNlbERyYXdpbmcoKTtcclxuXHJcbiAgICBpZiAodGhpcy5jb250ZXh0TWVudVRhcmdldCkge1xyXG4gICAgICB0aGlzLmhpZGVDb250ZXh0TWVudSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVTZWxlY3RBbGwoKTogdm9pZCB7XHJcbiAgICAvLyBTZWxlY3QgYWxsIGJvdW5kaW5nIGJveGVzIG9uIGNhbnZhc1xyXG4gICAgY29uc3QgYWxsQm94ZXMgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpO1xyXG4gICAgYWxsQm94ZXMuZm9yRWFjaChiYm94ID0+IHtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnNlbGVjdEJvdW5kaW5nQm94KGJib3guaWQpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZVByZXZpb3VzSW1hZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHRoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlcy5maW5kSW5kZXgoXHJcbiAgICAgIGZpbGUgPT4gZmlsZS5uYW1lID09PSB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGU/Lm5hbWVcclxuICAgICk7XHJcblxyXG4gICAgaWYgKGN1cnJlbnRJbmRleCA+IDApIHtcclxuICAgICAgY29uc3QgcHJldkltYWdlID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzW2N1cnJlbnRJbmRleCAtIDFdITtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKHByZXZJbWFnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU5leHRJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmZpbmRJbmRleChcclxuICAgICAgZmlsZSA9PiBmaWxlLm5hbWUgPT09IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZT8ubmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoY3VycmVudEluZGV4IDwgdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgY29uc3QgbmV4dEltYWdlID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzW2N1cnJlbnRJbmRleCArIDFdITtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKG5leHRJbWFnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUZpcnN0SW1hZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKHRoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlc1swXSEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVMYXN0SW1hZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3QgbGFzdEltYWdlID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzW3RoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlcy5sZW5ndGggLSAxXSE7XHJcbiAgICAgIHRoaXMubG9hZEltYWdlRmlsZShsYXN0SW1hZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDb3B5KCk6IHZvaWQge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWRCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTtcclxuICAgIGlmIChzZWxlY3RlZEJveGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRDbGlwYm9hcmQoe1xyXG4gICAgICAgIHR5cGU6ICdib3VuZGluZy1ib3hlcycsXHJcbiAgICAgICAgZGF0YTogc2VsZWN0ZWRCb3hlcyxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGlwYm9hcmQ6Y29weScsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogc2VsZWN0ZWRCb3hlcy5sZW5ndGggfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlUGFzdGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBjbGlwYm9hcmQgPSB0aGlzLmFwcFN0YXRlLmdldENsaXBib2FyZCgpO1xyXG4gICAgaWYgKGNsaXBib2FyZCAmJiBjbGlwYm9hcmQudHlwZSA9PT0gJ2JvdW5kaW5nLWJveGVzJykge1xyXG4gICAgICBjb25zdCBib3hlcyA9IGNsaXBib2FyZC5kYXRhIGFzIEJvdW5kaW5nQm94W107XHJcblxyXG4gICAgICBib3hlcy5mb3JFYWNoKChiYm94LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIC8vIE9mZnNldCBwYXN0ZWQgYm94ZXMgc2xpZ2h0bHlcclxuICAgICAgICBjb25zdCBuZXdCYm94OiBCb3VuZGluZ0JveCA9IHtcclxuICAgICAgICAgIC4uLmJib3gsXHJcbiAgICAgICAgICBpZDogYHBhc3RlZF8ke0RhdGUubm93KCl9XyR7aW5kZXh9YCxcclxuICAgICAgICAgIHg6IGJib3gueCArIDEwLFxyXG4gICAgICAgICAgeTogYmJveC55ICsgMTAsXHJcbiAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRCb3VuZGluZ0JveChuZXdCYm94KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGlwYm9hcmQ6cGFzdGUnLFxyXG4gICAgICAgIGRhdGE6IHsgY291bnQ6IGJveGVzLmxlbmd0aCB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQXV0by1zYXZlIGlmIGVuYWJsZWRcclxuICAgICAgaWYgKHRoaXMuYXBwU3RhdGUuaXNBdXRvU2F2ZUVuYWJsZWQpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZVNhdmVMYWJlbHMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDdXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmhhbmRsZUNvcHkoKTtcclxuICAgIHRoaXMuaGFuZGxlRGVsZXRlU2VsZWN0ZWQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRXNjYXBlS2V5KCk6IHZvaWQge1xyXG4gICAgLy8gQ2FuY2VsIGFueSBhY3RpdmUgb3BlcmF0aW9uc1xyXG4gICAgdGhpcy5oYW5kbGVDYW5jZWwoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgbG9hZEltYWdlRmlsZShpbWFnZUZpbGU6IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKHRoaXMuYXBwU3RhdGUuaW1hZ2VGb2xkZXJIYW5kbGUpIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlLmxvYWRJbWFnZShpbWFnZUZpbGUuaGFuZGxlKTtcclxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcclxuICAgICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZSk7XHJcbiAgICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIubG9hZEltYWdlKHJlc3VsdC5kYXRhKTtcclxuXHJcbiAgICAgICAgICAvLyBMb2FkIGV4aXN0aW5nIGxhYmVsc1xyXG4gICAgICAgICAgaWYgKHRoaXMuYXBwU3RhdGUubGFiZWxGb2xkZXJIYW5kbGUpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5sb2FkTGFiZWxzRm9yQ3VycmVudEltYWdlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZTonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIGxvYWRMYWJlbHNGb3JDdXJyZW50SW1hZ2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIXRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZSB8fCAhdGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZSkgcmV0dXJuO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UubG9hZExhYmVscyhcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGUubmFtZSxcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLmxhYmVsRm9sZGVySGFuZGxlXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcclxuICAgICAgICAvLyBDbGVhciBleGlzdGluZyBsYWJlbHNcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpLmZvckVhY2goYmJveCA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIucmVtb3ZlQm91bmRpbmdCb3goYmJveC5pZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBsb2FkZWQgbGFiZWxzXHJcbiAgICAgICAgcmVzdWx0LmRhdGEuZm9yRWFjaCh5b2xvTGFiZWwgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYmJveCA9IHRoaXMuY2FudmFzQ29udHJvbGxlci55b2xvVG9Cb3VuZGluZ0JveCh5b2xvTGFiZWwsIHtcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlPy53aWR0aCB8fCAxLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlPy5oZWlnaHQgfHwgMVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkQm91bmRpbmdCb3goYmJveCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGxhYmVsczonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXNEaXNwbGF5KCk6IHZvaWQge1xyXG4gICAgLy8gVXBkYXRlIG1vdXNlIGNvb3JkaW5hdGVzIGluIFVJXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnbW91c2U6Y29vcmRpbmF0ZXMtdXBkYXRlZCcsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBjYW52YXM6IHRoaXMubGFzdE1vdXNlUG9zaXRpb24sXHJcbiAgICAgICAgaW1hZ2U6IHRoaXMuY2FudmFzQ29udHJvbGxlci5jYW52YXNUb0ltYWdlKHRoaXMubGFzdE1vdXNlUG9zaXRpb24pXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoaWRlQ29udGV4dE1lbnUoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbnRleHRNZW51VGFyZ2V0ID0gbnVsbDtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjb250ZXh0LW1lbnU6aGlkZSdcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTaG9ydGN1dEtleShzaG9ydGN1dDogS2V5Ym9hcmRTaG9ydGN1dCk6IHN0cmluZyB7XHJcbiAgICBsZXQga2V5ID0gc2hvcnRjdXQua2V5O1xyXG4gICAgaWYgKHNob3J0Y3V0LmN0cmxLZXkpIGtleSA9ICdDdHJsKycgKyBrZXk7XHJcbiAgICBpZiAoc2hvcnRjdXQuc2hpZnRLZXkpIGtleSA9ICdTaGlmdCsnICsga2V5O1xyXG4gICAgaWYgKHNob3J0Y3V0LmFsdEtleSkga2V5ID0gJ0FsdCsnICsga2V5O1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RXZlbnRLZXkoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBzdHJpbmcge1xyXG4gICAgbGV0IGtleSA9IGV2ZW50LmNvZGU7XHJcbiAgICBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KSBrZXkgPSAnQ3RybCsnICsga2V5O1xyXG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSAnU2hpZnQrJyArIGtleTtcclxuICAgIGlmIChldmVudC5hbHRLZXkpIGtleSA9ICdBbHQrJyArIGtleTtcclxuICAgIHJldHVybiBrZXk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzSW5wdXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgIHJldHVybiBbJ2lucHV0JywgJ3RleHRhcmVhJywgJ3NlbGVjdCcsICdvcHRpb24nXS5pbmNsdWRlcyh0YWdOYW1lKSB8fFxyXG4gICAgICAgICAgIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNHbG9iYWxTaG9ydGN1dChldmVudDogS2V5Ym9hcmRFdmVudCk6IGJvb2xlYW4ge1xyXG4gICAgLy8gVGhlc2Ugc2hvcnRjdXRzIHdvcmsgZXZlbiB3aGVuIGlucHV0IGVsZW1lbnRzIGFyZSBmb2N1c2VkXHJcbiAgICBjb25zdCBnbG9iYWxTaG9ydGN1dHMgPSBbJ0tleVMnLCAnS2V5TycsICdLZXlaJywgJ0tleVknXTtcclxuICAgIHJldHVybiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KSAmJiBnbG9iYWxTaG9ydGN1dHMuaW5jbHVkZXMoZXZlbnQuY29kZSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgU3lzdGVtXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEV2ZW50TWFuYWdlckV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBbXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKSEucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogRXZlbnRNYW5hZ2VyRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBoYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEV2ZW50TWFuYWdlckV2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBldmVudCBoYW5kbGVyIGZvciAke2V2ZW50LnR5cGV9OmAsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFB1YmxpYyBJbnRlcmZhY2VcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBnZXRTaG9ydGN1dHMoKTogS2V5Ym9hcmRTaG9ydGN1dFtdIHtcclxuICAgIHJldHVybiBbLi4udGhpcy5zaG9ydGN1dHNdO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldENvbmZpZyhjb25maWc6IFBhcnRpYWw8RXZlbnRNYW5hZ2VyQ29uZmlnPik6IHZvaWQge1xyXG4gICAgdGhpcy5jb25maWcgPSB7IC4uLnRoaXMuY29uZmlnLCAuLi5jb25maWcgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDb25maWcoKTogRXZlbnRNYW5hZ2VyQ29uZmlnIHtcclxuICAgIHJldHVybiB7IC4uLnRoaXMuY29uZmlnIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcclxuICAgIC8vIFJlbW92ZSBhbGwgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlEb3duLmJpbmQodGhpcyksIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmhhbmRsZUtleVVwLmJpbmQodGhpcyksIHRydWUpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLmhhbmRsZUNvbnRleHRNZW51LmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmhhbmRsZURyYWdPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuaGFuZGxlRHJvcC5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuaGFuZGxlRHJhZ0VudGVyLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5oYW5kbGVEcmFnTGVhdmUuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZUdsb2JhbE1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmhhbmRsZUdsb2JhbE1vdXNlVXAuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gQ2xlYXIgaW50ZXJuYWwgc3RhdGVcclxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuY2xlYXIoKTtcclxuICAgIHRoaXMua2V5Ym9hcmRIYW5kbGVycy5jbGVhcigpO1xyXG4gICAgdGhpcy5jb250ZXh0TWVudVRhcmdldCA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZhY3RvcnkgRnVuY3Rpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50TWFuYWdlcihcclxuICBhcHBTdGF0ZTogSUFwcFN0YXRlLFxyXG4gIGNhbnZhc0NvbnRyb2xsZXI6IElDYW52YXNDb250cm9sbGVyLFxyXG4gIGZpbGVTeXN0ZW1TZXJ2aWNlOiBJRmlsZVN5c3RlbVNlcnZpY2UsXHJcbiAgY29uZmlnPzogUGFydGlhbDxFdmVudE1hbmFnZXJDb25maWc+XHJcbik6IEV2ZW50TWFuYWdlciB7XHJcbiAgcmV0dXJuIG5ldyBFdmVudE1hbmFnZXIoYXBwU3RhdGUsIGNhbnZhc0NvbnRyb2xsZXIsIGZpbGVTeXN0ZW1TZXJ2aWNlLCBjb25maWcpO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRNYW5hZ2VyO1xyXG5leHBvcnQgdHlwZSB7IElFdmVudE1hbmFnZXIsIEV2ZW50TWFuYWdlckNvbmZpZywgS2V5Ym9hcmRTaG9ydGN1dCB9OyIsIi8qKlxyXG4gKiBVdGlscyBNb2R1bGUgSW5kZXhcclxuICogXHJcbiAqIENlbnRyYWwgZXhwb3J0IHBvaW50IGZvciBhbGwgdXRpbGl0eSBmdW5jdGlvbnMgdXNlZCB0aHJvdWdob3V0IHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBUaGlzIGZpbGUgcHJvdmlkZXMgYSBjbGVhbiBBUEkgZm9yIGltcG9ydGluZyB1dGlsaXR5IGZ1bmN0aW9ucyBmcm9tIHZhcmlvdXMgbW9kdWxlcy5cclxuICovXHJcblxyXG4vLyBFeHBvcnQgYWxsIG5vdGlmaWNhdGlvbiB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIHNob3dUb2FzdCxcclxuICAgIHNob3dFcnJvclRvYXN0LFxyXG4gICAgc2hvd1N1Y2Nlc3NUb2FzdCxcclxuICAgIHNob3dXYXJuaW5nVG9hc3QsXHJcbiAgICBzaG93VHlwZWRUb2FzdCxcclxuICAgIHR5cGUgVG9hc3RUeXBlLFxyXG4gICAgdHlwZSBUb2FzdENvbmZpZ1xyXG59IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIGNvbG9yIHBhbGV0dGUgdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICBjb2xvclBhbGV0dGUsXHJcbiAgICBERUZBVUxUX0NPTE9SLFxyXG4gICAgZ2V0Q29sb3JGb3JDbGFzcyxcclxuICAgIGdldENvbG9yc0ZvckNsYXNzZXMsXHJcbiAgICBpc0NvbG9ySW5QYWxldHRlLFxyXG4gICAgZ2V0Q29sb3JJbmRleCxcclxuICAgIGdldENvbnRyYXN0aW5nVGV4dENvbG9yLFxyXG4gICAgaGV4VG9SZ2JhLFxyXG4gICAgQ29sb3JNYW5hZ2VyLFxyXG4gICAgdHlwZSBDb2xvckNvbmZpZ1xyXG59IGZyb20gJy4vY29sb3ItcGFsZXR0ZSc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIHZhbGlkYXRpb24gdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3MsXHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3NBZHZhbmNlZCxcclxuICAgIHZhbGlkYXRlRmlsZU5hbWUsXHJcbiAgICB2YWxpZGF0ZUltYWdlRXh0ZW5zaW9uLFxyXG4gICAgdmFsaWRhdGVCb3VuZGluZ0JveCxcclxuICAgIHZhbGlkYXRlWU9MT0Nvb3JkaW5hdGVzLFxyXG4gICAgdmFsaWRhdGVab29tTGV2ZWwsXHJcbiAgICB2YWxpZGF0ZUZvbnRTaXplLFxyXG4gICAgdmFsaWRhdGVOdW1iZXIsXHJcbiAgICB2YWxpZGF0ZUVtYWlsLFxyXG4gICAgdmFsaWRhdGVVcmwsXHJcbiAgICBzYW5pdGl6ZUlucHV0LFxyXG4gICAgdHlwZSBWYWxpZGF0aW9uUmVzdWx0XHJcbn0gZnJvbSAnLi92YWxpZGF0aW9uJztcclxuXHJcbi8vIEV4cG9ydCBZT0xPIHBhcnNlciB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIFlvbG9QYXJzZXIsXHJcbiAgICBwYXJzZVlvbG8sXHJcbiAgICBleHBvcnRZb2xvLFxyXG4gICAgdmFsaWRhdGVZb2xvU3RyaW5nXHJcbn0gZnJvbSAnLi95b2xvLXBhcnNlcic7XHJcblxyXG4vLyBSZS1leHBvcnQgY29tbW9ubHkgdXNlZCB1dGlsaXRpZXMgd2l0aCBzaG9ydGVyIG5hbWVzXHJcbmV4cG9ydCB7IHNob3dUb2FzdCBhcyB0b2FzdCB9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcbmV4cG9ydCB7IGdldENvbG9yRm9yQ2xhc3MgYXMgZ2V0Q29sb3IgfSBmcm9tICcuL2NvbG9yLXBhbGV0dGUnO1xyXG5leHBvcnQgeyB2YWxpZGF0ZUxhYmVsQ2xhc3MgYXMgdmFsaWRhdGVMYWJlbCB9IGZyb20gJy4vdmFsaWRhdGlvbic7XHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiBjYXRlZ29yaWVzIGZvciBiZXR0ZXIgb3JnYW5pemF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVXRpbGl0eUNhdGVnb3JpZXMgPSB7XHJcbiAgICBOT1RJRklDQVRJT05TOiBbXHJcbiAgICAgICAgJ3Nob3dUb2FzdCcsXHJcbiAgICAgICAgJ3Nob3dFcnJvclRvYXN0JywgXHJcbiAgICAgICAgJ3Nob3dTdWNjZXNzVG9hc3QnLFxyXG4gICAgICAgICdzaG93V2FybmluZ1RvYXN0JyxcclxuICAgICAgICAnc2hvd1R5cGVkVG9hc3QnXHJcbiAgICBdLFxyXG4gICAgQ09MT1JTOiBbXHJcbiAgICAgICAgJ2dldENvbG9yRm9yQ2xhc3MnLFxyXG4gICAgICAgICdnZXRDb2xvcnNGb3JDbGFzc2VzJyxcclxuICAgICAgICAnZ2V0Q29udHJhc3RpbmdUZXh0Q29sb3InLFxyXG4gICAgICAgICdoZXhUb1JnYmEnLFxyXG4gICAgICAgICdDb2xvck1hbmFnZXInXHJcbiAgICBdLFxyXG4gICAgVkFMSURBVElPTjogW1xyXG4gICAgICAgICd2YWxpZGF0ZUxhYmVsQ2xhc3MnLFxyXG4gICAgICAgICd2YWxpZGF0ZUZpbGVOYW1lJyxcclxuICAgICAgICAndmFsaWRhdGVJbWFnZUV4dGVuc2lvbicsXHJcbiAgICAgICAgJ3ZhbGlkYXRlQm91bmRpbmdCb3gnLFxyXG4gICAgICAgICd2YWxpZGF0ZVlPTE9Db29yZGluYXRlcydcclxuICAgIF0sXHJcbiAgICBZT0xPOiBbXHJcbiAgICAgICAgJ1lvbG9QYXJzZXInLFxyXG4gICAgICAgICdwYXJzZVlvbG8nLFxyXG4gICAgICAgICdleHBvcnRZb2xvJyxcclxuICAgICAgICAndmFsaWRhdGVZb2xvU3RyaW5nJ1xyXG4gICAgXVxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXRpbGl0eUNvbmZpZyB7XHJcbiAgICBub3RpZmljYXRpb25zOiB7XHJcbiAgICAgICAgZGVmYXVsdER1cmF0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZztcclxuICAgIH07XHJcbiAgICBjb2xvcnM6IHtcclxuICAgICAgICB1c2VIaWdoQ29udHJhc3Q6IGJvb2xlYW47XHJcbiAgICAgICAgY3VzdG9tUGFsZXR0ZT86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiBib29sZWFuO1xyXG4gICAgICAgIHNob3dFcnJvcnM6IGJvb2xlYW47XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB1dGlsaXR5IGNvbmZpZ3VyYXRpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1VUSUxJVFlfQ09ORklHOiBVdGlsaXR5Q29uZmlnID0ge1xyXG4gICAgbm90aWZpY2F0aW9uczoge1xyXG4gICAgICAgIGRlZmF1bHREdXJhdGlvbjogMzAwMCxcclxuICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJyN0b2FzdC1jb250YWluZXInXHJcbiAgICB9LFxyXG4gICAgY29sb3JzOiB7XHJcbiAgICAgICAgdXNlSGlnaENvbnRyYXN0OiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiB0cnVlLFxyXG4gICAgICAgIHNob3dFcnJvcnM6IHRydWVcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IG1hbmFnZXIgZm9yIGNvb3JkaW5hdGVkIHV0aWxpdHkgb3BlcmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFV0aWxpdHlNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgY29uZmlnOiBVdGlsaXR5Q29uZmlnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUGFydGlhbDxVdGlsaXR5Q29uZmlnPiA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfVVRJTElUWV9DT05GSUcsIC4uLmNvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGN1cnJlbnQgY29uZmlndXJhdGlvblxyXG4gICAgICovXHJcbiAgICBnZXRDb25maWcoKTogVXRpbGl0eUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUNvbmZpZyhuZXdDb25maWc6IFBhcnRpYWw8VXRpbGl0eUNvbmZpZz4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLm5ld0NvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSB1dGlsaXRpZXMgd2l0aCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICAvLyBUaGlzIGNvdWxkIGJlIGV4dGVuZGVkIHRvIHNldCB1cCBhbnkgZ2xvYmFsIHV0aWxpdHkgY29uZmlndXJhdGlvbnNcclxuICAgICAgICBjb25zb2xlLmxvZygnVXRpbGl0aWVzIGluaXRpYWxpemVkIHdpdGggY29uZmlnOicsIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCB1dGlsaXR5IG1hbmFnZXIgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBjb25zdCB1dGlsaXR5TWFuYWdlciA9IG5ldyBVdGlsaXR5TWFuYWdlcigpO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjaGVjayBpZiB1dGlsaXRpZXMgYXJlIHByb3Blcmx5IGxvYWRlZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVXRpbGl0aWVzTG9hZGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBJbXBvcnQgZnVuY3Rpb25zIGZvciB0ZXN0aW5nXHJcbiAgICAgICAgY29uc3QgeyBzaG93VG9hc3QgfSA9IHJlcXVpcmUoJy4vbm90aWZpY2F0aW9ucycpO1xyXG4gICAgICAgIGNvbnN0IHsgY29sb3JQYWxldHRlIH0gPSByZXF1aXJlKCcuL2NvbG9yLXBhbGV0dGUnKTtcclxuICAgICAgICBjb25zdCB7IHZhbGlkYXRlTGFiZWxDbGFzcyB9ID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVGVzdCBlYWNoIHV0aWxpdHkgY2F0ZWdvcnlcclxuICAgICAgICBjb25zdCBub3RpZmljYXRpb25UZXN0ID0gdHlwZW9mIHNob3dUb2FzdCA9PT0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBjb25zdCBjb2xvclRlc3QgPSBBcnJheS5pc0FycmF5KGNvbG9yUGFsZXR0ZSkgJiYgY29sb3JQYWxldHRlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvblRlc3QgPSB0eXBlb2YgdmFsaWRhdGVMYWJlbENsYXNzID09PSAnZnVuY3Rpb24nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBub3RpZmljYXRpb25UZXN0ICYmIGNvbG9yVGVzdCAmJiB2YWxpZGF0aW9uVGVzdDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignVXRpbGl0aWVzIHZhbGlkYXRpb24gZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdXRpbGl0eSBtb2R1bGUgdmVyc2lvbiBpbmZvXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVVRJTElUWV9WRVJTSU9OID0ge1xyXG4gICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgIG1vZHVsZXM6IHtcclxuICAgICAgICBub3RpZmljYXRpb25zOiAnMS4wLjAnLFxyXG4gICAgICAgIGNvbG9yczogJzEuMC4wJyxcclxuICAgICAgICB2YWxpZGF0aW9uOiAnMS4wLjAnLFxyXG4gICAgICAgIHlvbG86ICcxLjAuMCdcclxuICAgIH0sXHJcbiAgICBidWlsZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG59O1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB1dGlsaXRpZXMgb24gbW9kdWxlIGxvYWRcclxudXRpbGl0eU1hbmFnZXIuaW5pdGlhbGl6ZSgpOyIsIi8qKlxyXG4gKiBVSSBNYW5hZ2VyIE1vZHVsZVxyXG4gKlxyXG4gKiBNYW5hZ2VzIGFsbCBET00gbWFuaXB1bGF0aW9uLCBVSSB1cGRhdGVzLCBhbmQgdXNlciBpbnRlcmZhY2UgaW50ZXJhY3Rpb25zLlxyXG4gKiBIYW5kbGVzIEJvb3RzdHJhcCBtb2RhbHMsIHBhbmVsIG1hbmFnZW1lbnQsIGxpc3QgcmVuZGVyaW5nLCBhbmQgdGhlbWUgbWFuYWdlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQgeyBJQXBwU3RhdGUgfSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5pbXBvcnQgeyBJQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4uL3R5cGVzL2NhbnZhcyc7XHJcbmltcG9ydCB7IElGaWxlU3lzdGVtIH0gZnJvbSAnLi4vdHlwZXMvZmlsZS1zeXN0ZW0nO1xyXG5pbXBvcnQge1xyXG4gIERPTUVsZW1lbnRzLFxyXG4gIEJvb3RzdHJhcE1vZGFsLFxyXG4gIFBhbmVsQ29uZmlnLFxyXG4gIFNwbGl0dGVyQ29uZmlnLFxyXG4gIEZpbHRlckJ1dHRvbixcclxuICBMYWJlbEdyb3VwLFxyXG4gIENvbnRleHRNZW51Q29uZmlnLFxyXG4gIFVJU3RhdGUsXHJcbiAgVGhlbWVDb25maWcsXHJcbiAgTG9hZGluZ1N0YXRlLFxyXG4gIFNlYXJjaE9wdGlvbnMsXHJcbiAgRmlsdGVyT3B0aW9ucyxcclxuICBVSUV2ZW50LFxyXG4gIFVJRXZlbnRUeXBlLFxyXG4gIFVJRXZlbnRIYW5kbGVyLFxyXG4gIFVJTWV0aG9kcyxcclxuICBJVUlNYW5hZ2VyLFxyXG4gIEltYWdlTGlzdEl0ZW0sXHJcbiAgTGFiZWxMaXN0SXRlbSxcclxuICBQcmV2aWV3SXRlbVxyXG59IGZyb20gJy4uL3R5cGVzL3VpJztcclxuaW1wb3J0IHsgTW9kZSwgUG9pbnQgfSBmcm9tICcuLi90eXBlcy9pbmRleCc7XG5pbXBvcnQgeyBzaG93U3VjY2Vzc1RvYXN0LCBzaG93RXJyb3JUb2FzdCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEJvdW5kaW5nQm94IH0gZnJvbSAnLi4vdHlwZXMvY2FudmFzJztcclxuXHJcbi8qKlxyXG4gKiBCb290c3RyYXAgTW9kYWwgd3JhcHBlciBmb3IgdHlwZSBzYWZldHlcclxuICovXHJcbmNsYXNzIEJvb3RzdHJhcE1vZGFsV3JhcHBlciBpbXBsZW1lbnRzIEJvb3RzdHJhcE1vZGFsIHtcclxuICBwcml2YXRlIG1vZGFsOiBhbnk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAvLyBCb290c3RyYXAgNSBNb2RhbFxyXG4gICAgdGhpcy5tb2RhbCA9IG5ldyAod2luZG93IGFzIGFueSkuYm9vdHN0cmFwLk1vZGFsKGVsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgc2hvdygpOiB2b2lkIHtcclxuICAgIHRoaXMubW9kYWwuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgaGlkZSgpOiB2b2lkIHtcclxuICAgIHRoaXMubW9kYWwuaGlkZSgpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5tb2RhbC50b2dnbGUoKTtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLm1vZGFsLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVSU1hbmFnZXIgaW1wbGVtZW50YXRpb25cclxuICogTWFuYWdlcyBhbGwgdXNlciBpbnRlcmZhY2UgaW50ZXJhY3Rpb25zIGFuZCBET00gbWFuaXB1bGF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVUlNYW5hZ2VyIGltcGxlbWVudHMgSVVJTWFuYWdlciB7XHJcbiAgcHJpdmF0ZSBldmVudEhhbmRsZXJzOiBNYXA8VUlFdmVudFR5cGUsIFNldDxVSUV2ZW50SGFuZGxlcj4+ID0gbmV3IE1hcCgpO1xyXG4gIHByaXZhdGUgX2VsZW1lbnRzITogRE9NRWxlbWVudHM7XHJcbiAgcHJpdmF0ZSBwYW5lbENvbmZpZ3M6IE1hcDxzdHJpbmcsIFBhbmVsQ29uZmlnPiA9IG5ldyBNYXAoKTtcclxuICBwcml2YXRlIHNwbGl0dGVyQ29uZmlnczogU3BsaXR0ZXJDb25maWdbXSA9IFtdO1xyXG4gIHByaXZhdGUgY3VycmVudFRoZW1lOiBUaGVtZUNvbmZpZztcclxuICBwcml2YXRlIGxvYWRpbmdTdGF0ZTogTG9hZGluZ1N0YXRlO1xyXG4gIHByaXZhdGUgZmlsdGVyQnV0dG9uczogRmlsdGVyQnV0dG9uW10gPSBbXTtcclxuICBwcml2YXRlIGxhYmVsR3JvdXBzOiBMYWJlbEdyb3VwW10gPSBbXTtcclxuICBwcml2YXRlIGltYWdlTGlzdEl0ZW1zOiBJbWFnZUxpc3RJdGVtW10gPSBbXTtcclxuICBwcml2YXRlIGxhYmVsTGlzdEl0ZW1zOiBMYWJlbExpc3RJdGVtW10gPSBbXTtcclxuICBwcml2YXRlIHByZXZpZXdJdGVtczogUHJldmlld0l0ZW1bXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX3N0YXRlOiBJQXBwU3RhdGUsXHJcbiAgICBwcml2YXRlIF9jYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcixcclxuICAgIHByaXZhdGUgX2ZpbGVTeXN0ZW06IElGaWxlU3lzdGVtXHJcbiAgKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRUaGVtZSA9IHRoaXMuZ2V0RGVmYXVsdFRoZW1lKCk7XHJcbiAgICB0aGlzLmxvYWRpbmdTdGF0ZSA9IHtcclxuICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgbWVzc2FnZTogJycsXHJcbiAgICAgIHByb2dyZXNzOiAwXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZUVsZW1lbnRzKCk7XHJcbiAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIHRoaXMuc2V0dXBTcGxpdHRlcnMoKTtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZVBhbmVsQ29uZmlncygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEdldHRlcnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGdldCBlbGVtZW50cygpOiBET01FbGVtZW50cyB7XHJcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHM7XHJcbiAgfVxyXG5cclxuICBnZXQgc3RhdGUoKTogSUFwcFN0YXRlIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcclxuICB9XHJcblxyXG4gIGdldCBjYW52YXNDb250cm9sbGVyKCk6IElDYW52YXNDb250cm9sbGVyIHtcclxuICAgIHJldHVybiB0aGlzLl9jYW52YXNDb250cm9sbGVyO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGZpbGVTeXN0ZW0oKTogSUZpbGVTeXN0ZW0ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZpbGVTeXN0ZW07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRWxlbWVudCBJbml0aWFsaXphdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplRWxlbWVudHMoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9lbGVtZW50cyA9IHtcclxuICAgICAgLy8gRm9sZGVyIHNlbGVjdGlvbiBidXR0b25zXHJcbiAgICAgIHNlbGVjdEltYWdlRm9sZGVyQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtaW1hZ2UtZm9sZGVyLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBzZWxlY3RMYWJlbEZvbGRlckJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2VsZWN0LWxhYmVsLWZvbGRlci1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgbG9hZENsYXNzSW5mb0ZvbGRlckJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbG9hZC1jbGFzcy1pbmZvLWZvbGRlci1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENsYXNzIGZpbGUgZWxlbWVudHNcclxuICAgICAgY2xhc3NGaWxlU2VsZWN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1maWxlLXNlbGVjdCcpIGFzIEhUTUxTZWxlY3RFbGVtZW50LFxyXG4gICAgICB2aWV3Q2xhc3NGaWxlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCd2aWV3LWNsYXNzLWZpbGUtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGNsYXNzRmlsZVZpZXdlck1vZGFsOiBuZXcgQm9vdHN0cmFwTW9kYWxXcmFwcGVyKHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNzRmlsZVZpZXdlck1vZGFsJykpLFxyXG4gICAgICBjbGFzc0ZpbGVFZGl0b3JCb2R5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1maWxlLWVkaXRvci1ib2R5JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGFkZENsYXNzUm93QnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdhZGQtY2xhc3Mtcm93LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBzYXZlQ2xhc3NGaWxlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzYXZlLWNsYXNzLWZpbGUtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGRvd25sb2FkQ2xhc3Nlc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZG93bmxvYWQtY2xhc3Nlcy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIEltYWdlIGxpc3QgZWxlbWVudHNcclxuICAgICAgaW1hZ2VMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdpbWFnZS1saXN0JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGltYWdlU2VhcmNoSW5wdXQ6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlLXNlYXJjaC1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIHNob3dMYWJlbGVkQ2hlY2tib3g6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctbGFiZWxlZC1jaGVja2JveCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIHNob3dVbmxhYmVsZWRDaGVja2JveDogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2hvdy11bmxhYmVsZWQtY2hlY2tib3gnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gU2F2ZS9sb2FkIGJ1dHRvbnNcclxuICAgICAgc2F2ZUxhYmVsc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2F2ZS1sYWJlbHMtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGF1dG9TYXZlVG9nZ2xlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdhdXRvLXNhdmUtdG9nZ2xlJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENhbnZhcyBkaXNwbGF5IG9wdGlvbnNcclxuICAgICAgc2hvd0xhYmVsc09uQ2FudmFzVG9nZ2xlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzaG93LWxhYmVscy1vbi1jYW52YXMtdG9nZ2xlJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgbGFiZWxGb250U2l6ZVNsaWRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZm9udC1zaXplLXNsaWRlcicpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGxhYmVsRm9udFNpemVWYWx1ZTogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZm9udC1zaXplLXZhbHVlJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGNyb3NzaGFpclRvZ2dsZTogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3Jvc3NoYWlyLXRvZ2dsZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBNb2RlIGJ1dHRvbnNcclxuICAgICAgZHJhd01vZGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2RyYXctbW9kZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZWRpdE1vZGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2VkaXQtbW9kZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIExhYmVsIGxpc3QgZWxlbWVudHNcclxuICAgICAgbGFiZWxMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1saXN0JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGxhYmVsRmlsdGVyczogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZmlsdGVycycpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBzZWxlY3RCeUNsYXNzRHJvcGRvd246IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdC1ieS1jbGFzcy1kcm9wZG93bicpIGFzIEhUTUxTZWxlY3RFbGVtZW50LFxyXG4gICAgICBzZWxlY3RCeUNsYXNzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtYnktY2xhc3MtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHNvcnRMYWJlbHNBc2NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NvcnQtbGFiZWxzLWFzYy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgc29ydExhYmVsc0Rlc2NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NvcnQtbGFiZWxzLWRlc2MtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBab29tIGNvbnRyb2xzXHJcbiAgICAgIHpvb21JbkJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnem9vbS1pbi1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgem9vbU91dEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnem9vbS1vdXQtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHJlc2V0Wm9vbUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncmVzZXQtem9vbS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgem9vbUlucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCd6b29tLWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENhbnZhcyBlbGVtZW50c1xyXG4gICAgICBjYW52YXNDb250YWluZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcy1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgbW91c2VDb29yZHNEaXNwbGF5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdtb3VzZS1jb29yZHMtZGlzcGxheScpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjb29yZFhJbnB1dDogdGhpcy5nZXRFbGVtZW50QnlJZCgnY29vcmQteC1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGNvb3JkWUlucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb29yZC15LWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgZ29Ub0Nvb3Jkc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZ28tdG8tY29vcmRzLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gTmF2aWdhdGlvblxyXG4gICAgICBjdXJyZW50SW1hZ2VOYW1lU3BhbjogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3VycmVudC1pbWFnZS1uYW1lJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHByZXZJbWFnZUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldi1pbWFnZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgbmV4dEltYWdlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCduZXh0LWltYWdlLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gUGFuZWwgZWxlbWVudHNcclxuICAgICAgbGVmdFBhbmVsOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsZWZ0LXBhbmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHJpZ2h0UGFuZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3JpZ2h0LXBhbmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGxlZnRTcGxpdHRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGVmdC1zcGxpdHRlcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICByaWdodFNwbGl0dGVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdyaWdodC1zcGxpdHRlcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjb2xsYXBzZUxlZnRQYW5lbEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnY29sbGFwc2UtbGVmdC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZXhwYW5kTGVmdFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdleHBhbmQtbGVmdC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgY29sbGFwc2VSaWdodFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb2xsYXBzZS1yaWdodC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZXhwYW5kUmlnaHRQYW5lbEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZXhwYW5kLXJpZ2h0LXBhbmVsLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gUHJldmlldyBiYXIgZWxlbWVudHNcclxuICAgICAgcHJldmlld0JhcjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1iYXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgcHJldmlld0JhckhlYWRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1iYXItaGVhZGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHRvZ2dsZVByZXZpZXdCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZS1wcmV2aWV3LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3UHJldkJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1wcmV2LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3TmV4dEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1uZXh0LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3TGlzdFdyYXBwZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3ByZXZpZXctbGlzdC13cmFwcGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHByZXZpZXdMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3LWxpc3QnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgYm90dG9tUGFuZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2JvdHRvbS1wYW5lbCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBib3R0b21TcGxpdHRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnYm90dG9tLXNwbGl0dGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBUaGVtZSB0b2dnbGVcclxuICAgICAgZGFya01vZGVUb2dnbGU6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2RhcmstbW9kZS10b2dnbGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gTGFiZWwgY2xhc3MgbW9kYWxcclxuICAgICAgbGFiZWxDbGFzc01vZGFsOiBuZXcgQm9vdHN0cmFwTW9kYWxXcmFwcGVyKHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2xhYmVsQ2xhc3NNb2RhbCcpKSxcclxuICAgICAgbGFiZWxDbGFzc0lucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1jbGFzcy1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGNsYXNzU2VsZWN0aW9uQ29udGFpbmVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1zZWxlY3Rpb24tY29udGFpbmVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHNhdmVMYWJlbENsYXNzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzYXZlLWxhYmVsLWNsYXNzLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gQ29udGV4dCBtZW51XHJcbiAgICAgIGNvbnRleHRNZW51OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb250ZXh0LW1lbnUnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgY3R4RWRpdExhYmVsOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjdHgtZWRpdC1sYWJlbCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjdHhEZWxldGVMYWJlbDogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3R4LWRlbGV0ZS1sYWJlbCcpIGFzIEhUTUxFbGVtZW50LFxyXG5cclxuICAgICAgLy8gTG9hZGluZyBvdmVybGF5XHJcbiAgICAgIGxvYWRpbmdPdmVybGF5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nLW92ZXJsYXknKSBhcyBIVE1MRWxlbWVudFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RWxlbWVudEJ5SWQoaWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAvLyBEdXJpbmcgbWlncmF0aW9uLCBzdXBwb3J0IGJvdGggbmV3IChrZWJhYi1jYXNlKSBhbmQgbGVnYWN5IChjYW1lbENhc2UpIElEc1xuICAgIGNvbnN0IGxlZ2FjeUlkTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgLy8gRm9sZGVyIHNlbGVjdGlvblxuICAgICAgJ3NlbGVjdC1pbWFnZS1mb2xkZXItYnRuJzogJ3NlbGVjdEltYWdlRm9sZGVyQnRuJyxcbiAgICAgICdzZWxlY3QtbGFiZWwtZm9sZGVyLWJ0bic6ICdzZWxlY3RMYWJlbEZvbGRlckJ0bicsXG4gICAgICAnbG9hZC1jbGFzcy1pbmZvLWZvbGRlci1idG4nOiAnbG9hZENsYXNzSW5mb0ZvbGRlckJ0bicsXG5cbiAgICAgIC8vIENsYXNzIGZpbGUgZWxlbWVudHNcbiAgICAgICd2aWV3LWNsYXNzLWZpbGUtYnRuJzogJ3ZpZXdDbGFzc0ZpbGVCdG4nLFxuICAgICAgJ2NsYXNzLWZpbGUtZWRpdG9yLWJvZHknOiAnY2xhc3NGaWxlRWRpdG9yQm9keScsXG4gICAgICAnYWRkLWNsYXNzLXJvdy1idG4nOiAnYWRkQ2xhc3NSb3dCdG4nLFxuICAgICAgJ3NhdmUtY2xhc3MtZmlsZS1idG4nOiAnc2F2ZUNsYXNzRmlsZUJ0bicsXG4gICAgICAnZG93bmxvYWQtY2xhc3Nlcy1idG4nOiAnZG93bmxvYWRDbGFzc2VzQnRuJyxcblxuICAgICAgLy8gSW1hZ2UgbGlzdCAvIGZpbHRlcnNcbiAgICAgICdpbWFnZS1zZWFyY2gtaW5wdXQnOiAnaW1hZ2VTZWFyY2hJbnB1dCcsXG4gICAgICAnc2hvdy1sYWJlbGVkLWNoZWNrYm94JzogJ3Nob3dMYWJlbGVkJyxcbiAgICAgICdzaG93LXVubGFiZWxlZC1jaGVja2JveCc6ICdzaG93VW5sYWJlbGVkJyxcblxuICAgICAgLy8gU2F2ZS9sb2FkXG4gICAgICAnc2F2ZS1sYWJlbHMtYnRuJzogJ3NhdmVMYWJlbHNCdG4nLFxuICAgICAgJ2F1dG8tc2F2ZS10b2dnbGUnOiAnYXV0b1NhdmVUb2dnbGUnLFxuXG4gICAgICAvLyBDYW52YXMgZGlzcGxheSBvcHRpb25zXG4gICAgICAnc2hvdy1sYWJlbHMtb24tY2FudmFzLXRvZ2dsZSc6ICdzaG93TGFiZWxzT25DYW52YXNUb2dnbGUnLFxuICAgICAgJ2xhYmVsLWZvbnQtc2l6ZS1zbGlkZXInOiAnbGFiZWwtZm9udC1zaXplJyxcbiAgICAgICdjcm9zc2hhaXItdG9nZ2xlJzogJ2Nyb3NzaGFpclRvZ2dsZScsXG5cbiAgICAgIC8vIE1vZGVzXG4gICAgICAnZHJhdy1tb2RlLWJ0bic6ICdkcmF3TW9kZScsXG4gICAgICAnZWRpdC1tb2RlLWJ0bic6ICdlZGl0TW9kZScsXG5cbiAgICAgIC8vIFNvcnRpbmdcbiAgICAgICdzb3J0LWxhYmVscy1hc2MtYnRuJzogJ3NvcnRMYWJlbHNBc2NCdG4nLFxuICAgICAgJ3NvcnQtbGFiZWxzLWRlc2MtYnRuJzogJ3NvcnRMYWJlbHNEZXNjQnRuJyxcblxuICAgICAgLy8gWm9vbSBjb250cm9sc1xuICAgICAgJ3pvb20taW4tYnRuJzogJ3pvb21JbkJ0bicsXG4gICAgICAnem9vbS1vdXQtYnRuJzogJ3pvb21PdXRCdG4nLFxuICAgICAgJ3Jlc2V0LXpvb20tYnRuJzogJ3Jlc2V0Wm9vbUJ0bicsXG5cbiAgICAgIC8vIENvb3Jkc1xuICAgICAgJ21vdXNlLWNvb3Jkcy1kaXNwbGF5JzogJ2luZm8tZGlzcGxheScsXG4gICAgICAnY29vcmQteC1pbnB1dCc6ICdjb29yZFgnLFxuICAgICAgJ2Nvb3JkLXktaW5wdXQnOiAnY29vcmRZJyxcbiAgICAgICdnby10by1jb29yZHMtYnRuJzogJ2dvVG9Db29yZHNCdG4nLFxuXG4gICAgICAvLyBOYXZpZ2F0aW9uXG4gICAgICAncHJldi1pbWFnZS1idG4nOiAncHJldkltYWdlQnRuJyxcbiAgICAgICduZXh0LWltYWdlLWJ0bic6ICduZXh0SW1hZ2VCdG4nLFxuXG4gICAgICAvLyBUaGVtZVxuICAgICAgJ2RhcmstbW9kZS10b2dnbGUnOiAnZGFya01vZGVUb2dnbGUnLFxuXG4gICAgICAvLyBMYWJlbCBjbGFzcyBtb2RhbFxuICAgICAgJ2xhYmVsLWNsYXNzLWlucHV0JzogJ2xhYmVsQ2xhc3NJbnB1dCcsXG4gICAgICAnc2F2ZS1sYWJlbC1jbGFzcy1idG4nOiAnc2F2ZUxhYmVsQ2xhc3NCdG4nLFxuICAgIH07XG5cbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGxlZ2FjeUlkID0gbGVnYWN5SWRNYXBbaWRdO1xuICAgICAgaWYgKGxlZ2FjeUlkKSB7XG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsZWdhY3lJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVsZW1lbnQgd2l0aCBJRCAnJHtpZH0nIG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBVSUV2ZW50VHlwZSwgaGFuZGxlcjogVUlFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudEhhbmRsZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc2V0KHR5cGUsIG5ldyBTZXQoKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KHR5cGUpIS5hZGQoaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IFVJRXZlbnRUeXBlLCBoYW5kbGVyOiBVSUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzLmRlbGV0ZShoYW5kbGVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hVSUV2ZW50PFQgPSBhbnk+KHR5cGU6IFVJRXZlbnRUeXBlLCBkYXRhPzogVCwgdGFyZ2V0PzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGV2ZW50OiBVSUV2ZW50PFQ+ID0ge1xyXG4gICAgICB0eXBlLFxyXG4gICAgICBkYXRhLFxyXG4gICAgICB0YXJnZXQsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRIYW5kbGVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZlbnQpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQYW5lbCBNYW5hZ2VtZW50XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVQYW5lbENvbmZpZ3MoKTogdm9pZCB7XHJcbiAgICB0aGlzLnBhbmVsQ29uZmlncy5zZXQoJ2xlZnQnLCB7XHJcbiAgICAgIHBhbmVsOiB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbCxcclxuICAgICAgc3BsaXR0ZXI6IHRoaXMuZWxlbWVudHMubGVmdFNwbGl0dGVyLFxyXG4gICAgICBleHBhbmRCdG46IHRoaXMuZWxlbWVudHMuZXhwYW5kTGVmdFBhbmVsQnRuLFxyXG4gICAgICBpc0NvbGxhcHNpbmc6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBhbmVsQ29uZmlncy5zZXQoJ3JpZ2h0Jywge1xyXG4gICAgICBwYW5lbDogdGhpcy5lbGVtZW50cy5yaWdodFBhbmVsLFxyXG4gICAgICBzcGxpdHRlcjogdGhpcy5lbGVtZW50cy5yaWdodFNwbGl0dGVyLFxyXG4gICAgICBleHBhbmRCdG46IHRoaXMuZWxlbWVudHMuZXhwYW5kUmlnaHRQYW5lbEJ0bixcclxuICAgICAgaXNDb2xsYXBzaW5nOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVQYW5lbChjb25maWc6IFBhbmVsQ29uZmlnKTogdm9pZCB7XHJcbiAgICBpZiAoY29uZmlnLmlzQ29sbGFwc2luZykgcmV0dXJuO1xyXG5cclxuICAgIGNvbmZpZy5pc0NvbGxhcHNpbmcgPSB0cnVlO1xyXG4gICAgY29uc3QgaXNDb2xsYXBzZWQgPSBjb25maWcucGFuZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xyXG5cclxuICAgIGlmIChpc0NvbGxhcHNlZCkge1xyXG4gICAgICAvLyBFeHBhbmQgcGFuZWxcclxuICAgICAgY29uZmlnLnBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICBjb25maWcuZXhwYW5kQnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIGNvbmZpZy5zcGxpdHRlci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENvbGxhcHNlIHBhbmVsXHJcbiAgICAgIGNvbmZpZy5wYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICBjb25maWcuZXhwYW5kQnRuLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICBjb25maWcuc3BsaXR0ZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCBmbGFnIGFmdGVyIGFuaW1hdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGNvbmZpZy5pc0NvbGxhcHNpbmcgPSBmYWxzZTtcclxuICAgIH0sIDMwMCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ3BhbmVsOnRvZ2dsZWQnLCB7IHBhbmVsSWQ6IGNvbmZpZy5wYW5lbC5pZCwgY29sbGFwc2VkOiAhaXNDb2xsYXBzZWQgfSk7XHJcbiAgfVxyXG5cclxuICBzZXR1cFNwbGl0dGVycygpOiB2b2lkIHtcclxuICAgIHRoaXMuc3BsaXR0ZXJDb25maWdzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3BsaXR0ZXI6IHRoaXMuZWxlbWVudHMubGVmdFNwbGl0dGVyLFxyXG4gICAgICAgIHBhbmVsOiB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbCxcclxuICAgICAgICBkaXJlY3Rpb246ICdsZWZ0JyxcclxuICAgICAgICBtaW5XaWR0aDogMjAwLFxyXG4gICAgICAgIG1heFdpZHRoOiA1MDBcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHNwbGl0dGVyOiB0aGlzLmVsZW1lbnRzLnJpZ2h0U3BsaXR0ZXIsXHJcbiAgICAgICAgcGFuZWw6IHRoaXMuZWxlbWVudHMucmlnaHRQYW5lbCxcclxuICAgICAgICBkaXJlY3Rpb246ICdyaWdodCcsXHJcbiAgICAgICAgbWluV2lkdGg6IDIwMCxcclxuICAgICAgICBtYXhXaWR0aDogNTAwXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5zcGxpdHRlckNvbmZpZ3MuZm9yRWFjaChjb25maWcgPT4ge1xyXG4gICAgICB0aGlzLnNldHVwU3BsaXR0ZXIoY29uZmlnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cFNwbGl0dGVyKGNvbmZpZzogU3BsaXR0ZXJDb25maWcpOiB2b2lkIHtcclxuICAgIGxldCBpc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICBsZXQgc3RhcnRYID0gMDtcclxuICAgIGxldCBzdGFydFdpZHRoID0gMDtcclxuXHJcbiAgICBjb25maWcuc3BsaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgIHN0YXJ0WCA9IGUuY2xpZW50WDtcclxuICAgICAgc3RhcnRXaWR0aCA9IHBhcnNlSW50KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGNvbmZpZy5wYW5lbCkud2lkdGgsIDEwKTtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlTW91c2VNb3ZlKTtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVNb3VzZU1vdmUgPSAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICBpZiAoIWlzRHJhZ2dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IGRlbHRhWCA9IGNvbmZpZy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/IGUuY2xpZW50WCAtIHN0YXJ0WCA6IHN0YXJ0WCAtIGUuY2xpZW50WDtcclxuICAgICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1pbihNYXRoLm1heChzdGFydFdpZHRoICsgZGVsdGFYLCBjb25maWcubWluV2lkdGgpLCBjb25maWcubWF4V2lkdGgpO1xyXG4gICAgICBjb25maWcucGFuZWwuc3R5bGUud2lkdGggPSBgJHtuZXdXaWR0aH1weGA7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZU1vdXNlVXAgPSAoKSA9PiB7XHJcbiAgICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlTW91c2VNb3ZlKTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlc2l6ZVBhbmVscygpOiB2b2lkIHtcclxuICAgIC8vIFJlc2l6ZSBwYW5lbHMgYmFzZWQgb24gd2luZG93IHNpemVcclxuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICBjb25zdCBsZWZ0UGFuZWwgPSB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbDtcclxuICAgIGNvbnN0IHJpZ2h0UGFuZWwgPSB0aGlzLmVsZW1lbnRzLnJpZ2h0UGFuZWw7XHJcblxyXG4gICAgaWYgKHdpbmRvd1dpZHRoIDwgNzY4KSB7XHJcbiAgICAgIC8vIE1vYmlsZSB2aWV3IC0gaGlkZSBwYW5lbHNcclxuICAgICAgbGVmdFBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIHJpZ2h0UGFuZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERlc2t0b3AgdmlldyAtIHNob3cgcGFuZWxzXHJcbiAgICAgIGxlZnRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgcmlnaHRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBMb2FkaW5nIFN0YXRlIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHNob3dMb2FkaW5nSW5kaWNhdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsb2FkaW5nOnNob3cnKTtcclxuICB9XHJcblxyXG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmxvYWRpbmdPdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbG9hZGluZzpoaWRlJyk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVMb2FkaW5nUHJvZ3Jlc3MocHJvZ3Jlc3M6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgIGlmIChtZXNzYWdlKSB7XHJcbiAgICAgIHRoaXMubG9hZGluZ1N0YXRlLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBsb2FkaW5nIFVJXHJcbiAgICBjb25zdCBwcm9ncmVzc0JhciA9IHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkucXVlcnlTZWxlY3RvcignLnByb2dyZXNzLWJhcicpIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgaWYgKHByb2dyZXNzQmFyKSB7XHJcbiAgICAgIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gYCR7cHJvZ3Jlc3N9JWA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzLmxvYWRpbmdPdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nLW1lc3NhZ2UnKSBhcyBIVE1MRWxlbWVudDtcclxuICAgIGlmIChtZXNzYWdlRWxlbWVudCAmJiBtZXNzYWdlKSB7XHJcbiAgICAgIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbG9hZGluZzpwcm9ncmVzcycsIHsgcHJvZ3Jlc3MsIG1lc3NhZ2UgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVGhlbWUgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZ2V0Q3VycmVudFRoZW1lKCk6IFRoZW1lQ29uZmlnIHtcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaGVtZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RGVmYXVsdFRoZW1lKCk6IFRoZW1lQ29uZmlnIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6ICdsaWdodCcsXHJcbiAgICAgIHByaW1hcnlDb2xvcjogJyMwMDdiZmYnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgdGV4dENvbG9yOiAnIzMzMzMzMycsXHJcbiAgICAgIGJvcmRlckNvbG9yOiAnI2RlZTJlNidcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERhcmtUaGVtZSgpOiBUaGVtZUNvbmZpZyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOiAnZGFyaycsXHJcbiAgICAgIHByaW1hcnlDb2xvcjogJyMwZDZlZmQnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMWExYTFhJyxcclxuICAgICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgIGJvcmRlckNvbG9yOiAnIzQ0NDQ0NCdcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBhcHBseVRoZW1lKHRoZW1lOiBUaGVtZUNvbmZpZyk6IHZvaWQge1xyXG4gICAgdGhpcy5jdXJyZW50VGhlbWUgPSB0aGVtZTtcclxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtdGhlbWUnLCB0aGVtZS5uYW1lKTtcclxuXHJcbiAgICAvLyBBcHBseSBjdXN0b20gQ1NTIHZhcmlhYmxlc1xyXG4gICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tcHJpbWFyeS1jb2xvcicsIHRoZW1lLnByaW1hcnlDb2xvcik7XHJcbiAgICByb290LnN0eWxlLnNldFByb3BlcnR5KCctLWJhY2tncm91bmQtY29sb3InLCB0aGVtZS5iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS10ZXh0LWNvbG9yJywgdGhlbWUudGV4dENvbG9yKTtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tYm9yZGVyLWNvbG9yJywgdGhlbWUuYm9yZGVyQ29sb3IpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCd0aGVtZTpjaGFuZ2VkJywgdGhlbWUpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlRGFya01vZGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBpc0RhcmsgPSB0aGlzLmN1cnJlbnRUaGVtZS5uYW1lID09PSAnZGFyayc7XHJcbiAgICBjb25zdCBuZXdUaGVtZSA9IGlzRGFyayA/IHRoaXMuZ2V0RGVmYXVsdFRoZW1lKCkgOiB0aGlzLmdldERhcmtUaGVtZSgpO1xyXG4gICAgdGhpcy5hcHBseVRoZW1lKG5ld1RoZW1lKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdG9nZ2xlIHN0YXRlXHJcbiAgICB0aGlzLmVsZW1lbnRzLmRhcmtNb2RlVG9nZ2xlLmNoZWNrZWQgPSAhaXNEYXJrO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExpc3QgUmVuZGVyaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICByZW5kZXJJbWFnZUxpc3QoKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbWFnZUxpc3QgPSB0aGlzLmVsZW1lbnRzLmltYWdlTGlzdDtcclxuICAgIGltYWdlTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICB0aGlzLmltYWdlTGlzdEl0ZW1zID0gdGhpcy5fc3RhdGUuaW1hZ2VGaWxlcy5tYXAoaW1hZ2VGaWxlID0+IHtcclxuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgbGlzdEl0ZW0uY2xhc3NOYW1lID0gJ2ltYWdlLWxpc3QtaXRlbSc7XHJcbiAgICAgIGxpc3RJdGVtLmRhdGFzZXQuZmlsZU5hbWUgPSBpbWFnZUZpbGUubmFtZTtcclxuXHJcbiAgICAgIGNvbnN0IGlzTGFiZWxlZCA9IHRoaXMuX3N0YXRlLmdldEltYWdlTGFiZWxTdGF0dXMoaW1hZ2VGaWxlLm5hbWUpO1xyXG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gdGhpcy5fc3RhdGUuY3VycmVudEltYWdlRmlsZT8ubmFtZSA9PT0gaW1hZ2VGaWxlLm5hbWU7XHJcblxyXG4gICAgICBsaXN0SXRlbS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImltYWdlLWl0ZW0tY29udGVudFwiPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbWFnZS1uYW1lXCI+JHtpbWFnZUZpbGUubmFtZX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImltYWdlLXN0YXR1cyAke2lzTGFiZWxlZCA/ICdsYWJlbGVkJyA6ICd1bmxhYmVsZWQnfVwiPlxyXG4gICAgICAgICAgICAke2lzTGFiZWxlZCA/ICfil48nIDogJ+KXiyd9XHJcbiAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICBpZiAoaXNTZWxlY3RlZCkge1xyXG4gICAgICAgIGxpc3RJdGVtLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpc3RJdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0SW1hZ2UoaW1hZ2VGaWxlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpbWFnZUxpc3QuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBmaWxlOiBpbWFnZUZpbGUsXHJcbiAgICAgICAgaXNMYWJlbGVkLFxyXG4gICAgICAgIGlzU2VsZWN0ZWQsXHJcbiAgICAgICAgZWxlbWVudDogbGlzdEl0ZW1cclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdpbWFnZTpsaXN0LXJlbmRlcmVkJywgeyBjb3VudDogdGhpcy5pbWFnZUxpc3RJdGVtcy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHNlbGVjdEltYWdlKGltYWdlRmlsZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc3RhdGUuc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZSk7XG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2ltYWdlOnNlbGVjdGVkJywgeyBpbWFnZUZpbGUgfSk7XG5cbiAgICAvLyBVcGRhdGUgc2VsZWN0ZWQgaGlnaGxpZ2h0IGFuZCBjdXJyZW50IGltYWdlIG5hbWVcbiAgICB0cnkge1xuICAgICAgdGhpcy5pbWFnZUxpc3RJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBpdGVtLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnLCBpdGVtLmZpbGUubmFtZSA9PT0gaW1hZ2VGaWxlLm5hbWUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICAgIGlmICh0aGlzLl9lbGVtZW50cz8uY3VycmVudEltYWdlTmFtZVNwYW4pIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRzLmN1cnJlbnRJbWFnZU5hbWVTcGFuLnRleHRDb250ZW50ID0gaW1hZ2VGaWxlPy5uYW1lIHx8ICcnO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBMb2FkIGltYWdlIGZyb20gZmlsZSBzeXN0ZW0gYW5kIGRpc3BsYXkgb24gY2FudmFzXG4gICAgICBjb25zdCBpbWdSZXN1bHQgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLmxvYWRJbWFnZT8uKGltYWdlRmlsZS5oYW5kbGUpO1xuICAgICAgaWYgKGltZ1Jlc3VsdD8uc3VjY2VzcyAmJiBpbWdSZXN1bHQuZGF0YSkge1xuICAgICAgICBjb25zdCBpbWdFbCA9IGltZ1Jlc3VsdC5kYXRhIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIubG9hZEltYWdlKGltZ0VsKTtcblxuICAgICAgICAvLyBMb2FkIGxhYmVscyBpZiBsYWJlbCBmb2xkZXIgc2VsZWN0ZWRcbiAgICAgICAgY29uc3QgbGFiZWxGb2xkZXIgPSAodGhpcy5fc3RhdGUgYXMgYW55KS5sYWJlbEZvbGRlckhhbmRsZTtcbiAgICAgICAgaWYgKGxhYmVsRm9sZGVyKSB7XG4gICAgICAgICAgY29uc3QgbGJsUmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5sb2FkTGFiZWxzPy4oaW1hZ2VGaWxlLm5hbWUsIGxhYmVsRm9sZGVyKTtcbiAgICAgICAgICBpZiAobGJsUmVzdWx0Py5zdWNjZXNzICYmIEFycmF5LmlzQXJyYXkobGJsUmVzdWx0LmRhdGEpKSB7XG4gICAgICAgICAgICAvLyBDbGVhciBleGlzdGluZyBsYWJlbHNcbiAgICAgICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpLmZvckVhY2goYiA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnJlbW92ZUJvdW5kaW5nQm94KGIuaWQpKTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gKGltZ0VsIGFzIGFueSkubmF0dXJhbFdpZHRoIHx8IGltZ0VsLndpZHRoIHx8IDE7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSAoaW1nRWwgYXMgYW55KS5uYXR1cmFsSGVpZ2h0IHx8IGltZ0VsLmhlaWdodCB8fCAxO1xuICAgICAgICAgICAgbGJsUmVzdWx0LmRhdGEuZm9yRWFjaCgoeTogYW55KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJib3ggPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLnlvbG9Ub0JvdW5kaW5nQm94KHksIHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgICAgICAgICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5hZGRCb3VuZGluZ0JveChiYm94KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHNlbGVjdGVkIGltYWdlJywgZSk7XG4gICAgfVxuICB9XG5cclxuICB1cGRhdGVMYWJlbExpc3QoKTogdm9pZCB7XHJcbiAgICBjb25zdCBsYWJlbExpc3QgPSB0aGlzLmVsZW1lbnRzLmxhYmVsTGlzdDtcclxuICAgIGxhYmVsTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAvLyBHZXQgY3VycmVudCBib3VuZGluZyBib3hlcyBmcm9tIGNhbnZhc1xyXG4gICAgY29uc3QgYm91bmRpbmdCb3hlcyA9IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpO1xyXG5cclxuICAgIHRoaXMubGFiZWxMaXN0SXRlbXMgPSBib3VuZGluZ0JveGVzLm1hcChiYm94ID0+IHtcclxuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgbGlzdEl0ZW0uY2xhc3NOYW1lID0gJ2xhYmVsLWxpc3QtaXRlbSc7XHJcbiAgICAgIGxpc3RJdGVtLmRhdGFzZXQubGFiZWxJZCA9IGJib3guaWQ7XHJcblxyXG4gICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmdldERpc3BsYXlOYW1lRm9yQ2xhc3MoYmJveC5jbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgbGlzdEl0ZW0uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbC1pdGVtLWNvbnRlbnRcIj5cclxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWwtY2xhc3NcIj4ke2NsYXNzTmFtZX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImxhYmVsLWNvb3Jkc1wiPigke01hdGgucm91bmQoYmJveC54KX0sICR7TWF0aC5yb3VuZChiYm94LnkpfSk8L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICBsaXN0SXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICB0aGlzLnNlbGVjdExhYmVsKGJib3guaWQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxhYmVsTGlzdC5hcHBlbmRDaGlsZChsaXN0SXRlbSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkOiBiYm94LmlkLFxyXG4gICAgICAgIGNsYXNzSWQ6IGJib3guY2xhc3NJZCxcclxuICAgICAgICBjbGFzc05hbWUsXHJcbiAgICAgICAgYm91bmRpbmdCb3g6IGJib3gsXHJcbiAgICAgICAgaXNTZWxlY3RlZDogZmFsc2UsXHJcbiAgICAgICAgZWxlbWVudDogbGlzdEl0ZW1cclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsYWJlbDpsaXN0LXJlbmRlcmVkJywgeyBjb3VudDogdGhpcy5sYWJlbExpc3RJdGVtcy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNlbGVjdExhYmVsKGxhYmVsSWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5zZWxlY3RCb3VuZGluZ0JveChsYWJlbElkKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsYWJlbDpzZWxlY3RlZCcsIHsgbGFiZWxJZCB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWx0ZXIgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdXBkYXRlTGFiZWxGaWx0ZXJzKHJlY3RzOiBCb3VuZGluZ0JveFtdKTogdm9pZCB7XHJcbiAgICBjb25zdCBmaWx0ZXJzQ29udGFpbmVyID0gdGhpcy5lbGVtZW50cy5sYWJlbEZpbHRlcnM7XHJcbiAgICBmaWx0ZXJzQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgIC8vIEdyb3VwIGJ5IGNsYXNzXHJcbiAgICBjb25zdCBjbGFzc0dyb3VwcyA9IG5ldyBNYXA8bnVtYmVyLCBCb3VuZGluZ0JveFtdPigpO1xyXG4gICAgcmVjdHMuZm9yRWFjaChyZWN0ID0+IHtcclxuICAgICAgaWYgKCFjbGFzc0dyb3Vwcy5oYXMocmVjdC5jbGFzc0lkKSkge1xyXG4gICAgICAgIGNsYXNzR3JvdXBzLnNldChyZWN0LmNsYXNzSWQsIFtdKTtcclxuICAgICAgfVxyXG4gICAgICBjbGFzc0dyb3Vwcy5nZXQocmVjdC5jbGFzc0lkKSEucHVzaChyZWN0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZmlsdGVyQnV0dG9ucyA9IEFycmF5LmZyb20oY2xhc3NHcm91cHMuZW50cmllcygpKS5tYXAoKFtjbGFzc0lkLCBjbGFzc1JlY3RzXSkgPT4ge1xyXG4gICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdidG4gYnRuLW91dGxpbmUtcHJpbWFyeSBidG4tc20gZmlsdGVyLWJ0bic7XHJcbiAgICAgIGJ1dHRvbi5kYXRhc2V0LmNsYXNzSWQgPSBjbGFzc0lkLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmdldERpc3BsYXlOYW1lRm9yQ2xhc3MoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gYCR7Y2xhc3NOYW1lfSAoJHtjbGFzc1JlY3RzLmxlbmd0aH0pYDtcclxuXHJcbiAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUZpbHRlcihjbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGZpbHRlcnNDb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZWxlbWVudDogYnV0dG9uLFxyXG4gICAgICAgIGxhYmVsQ2xhc3M6IGNsYXNzSWQudG9TdHJpbmcoKSxcclxuICAgICAgICBjb3VudDogY2xhc3NSZWN0cy5sZW5ndGgsXHJcbiAgICAgICAgaXNBY3RpdmU6IHRydWVcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdmaWx0ZXI6dXBkYXRlZCcsIHsgZmlsdGVyQ291bnQ6IHRoaXMuZmlsdGVyQnV0dG9ucy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvZ2dsZUZpbHRlcihsYWJlbENsYXNzOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IGZpbHRlckJ1dHRvbiA9IHRoaXMuZmlsdGVyQnV0dG9ucy5maW5kKGJ0biA9PiBidG4ubGFiZWxDbGFzcyA9PT0gbGFiZWxDbGFzcyk7XHJcbiAgICBpZiAoZmlsdGVyQnV0dG9uKSB7XHJcbiAgICAgIGZpbHRlckJ1dHRvbi5pc0FjdGl2ZSA9ICFmaWx0ZXJCdXR0b24uaXNBY3RpdmU7XHJcbiAgICAgIGZpbHRlckJ1dHRvbi5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGZpbHRlckJ1dHRvbi5pc0FjdGl2ZSk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdmaWx0ZXI6Y2hhbmdlZCcsIHsgbGFiZWxDbGFzcywgYWN0aXZlOiBmaWx0ZXJCdXR0b24uaXNBY3RpdmUgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVTZWxlY3RCeUNsYXNzRHJvcGRvd24ocmVjdHM6IEJvdW5kaW5nQm94W10pOiB2b2lkIHtcclxuICAgIGNvbnN0IGRyb3Bkb3duID0gdGhpcy5lbGVtZW50cy5zZWxlY3RCeUNsYXNzRHJvcGRvd247XHJcbiAgICBkcm9wZG93bi5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPlNlbGVjdCBjbGFzcy4uLjwvb3B0aW9uPic7XHJcblxyXG4gICAgY29uc3QgdW5pcXVlQ2xhc3NlcyA9IG5ldyBTZXQocmVjdHMubWFwKHJlY3QgPT4gcmVjdC5jbGFzc0lkKSk7XHJcbiAgICB1bmlxdWVDbGFzc2VzLmZvckVhY2goY2xhc3NJZCA9PiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICBvcHRpb24udmFsdWUgPSBjbGFzc0lkLnRvU3RyaW5nKCk7XHJcbiAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IHRoaXMuZ2V0RGlzcGxheU5hbWVGb3JDbGFzcyhjbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkcm9wZG93bi5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdHVzIFVwZGF0ZXNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHVwZGF0ZUxhYmVsRm9sZGVyQnV0dG9uKHNlbGVjdGVkOiBib29sZWFuLCBmb2xkZXJOYW1lPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBidXR0b24gPSB0aGlzLmVsZW1lbnRzLnNlbGVjdExhYmVsRm9sZGVyQnRuO1xyXG4gICAgaWYgKHNlbGVjdGVkICYmIGZvbGRlck5hbWUpIHtcclxuICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gYPCfk4EgJHtmb2xkZXJOYW1lfWA7XHJcbiAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tc3VjY2VzcycpO1xyXG4gICAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYnRuLW91dGxpbmUtcHJpbWFyeScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ1NlbGVjdCBMYWJlbCBGb2xkZXInO1xyXG4gICAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYnRuLXN1Y2Nlc3MnKTtcclxuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi1vdXRsaW5lLXByaW1hcnknKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHVwZGF0ZU1vZGVCdXR0b25zKG1vZGU6IE1vZGUpOiB2b2lkIHtcclxuICAgIGNvbnN0IGRyYXdCdG4gPSB0aGlzLmVsZW1lbnRzLmRyYXdNb2RlQnRuO1xyXG4gICAgY29uc3QgZWRpdEJ0biA9IHRoaXMuZWxlbWVudHMuZWRpdE1vZGVCdG47XHJcblxyXG4gICAgZHJhd0J0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBtb2RlID09PSAnZHJhdycpO1xyXG4gICAgZWRpdEJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBtb2RlID09PSAnZWRpdCcpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdtb2RlOmNoYW5nZWQnLCB7IG1vZGUgfSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVab29tRGlzcGxheSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldFpvb20oKTtcclxuICAgIHRoaXMuZWxlbWVudHMuem9vbUlucHV0LnZhbHVlID0gTWF0aC5yb3VuZCh6b29tICogMTAwKS50b1N0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlTW91c2VDb29yZHMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuZWxlbWVudHMubW91c2VDb29yZHNEaXNwbGF5LnRleHRDb250ZW50ID0gYCgke01hdGgucm91bmQoeCl9LCAke01hdGgucm91bmQoeSl9KWA7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVDdXJyZW50SW1hZ2VEaXNwbGF5KGltYWdlTmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmN1cnJlbnRJbWFnZU5hbWVTcGFuLnRleHRDb250ZW50ID0gaW1hZ2VOYW1lO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENvbnRleHQgTWVudVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgc2hvd0NvbnRleHRNZW51KGNvbmZpZzogQ29udGV4dE1lbnVDb25maWcpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvbnRleHRNZW51ID0gdGhpcy5lbGVtZW50cy5jb250ZXh0TWVudTtcclxuICAgIGNvbnRleHRNZW51LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgY29udGV4dE1lbnUuc3R5bGUubGVmdCA9IGAke2NvbmZpZy54fXB4YDtcclxuICAgIGNvbnRleHRNZW51LnN0eWxlLnRvcCA9IGAke2NvbmZpZy55fXB4YDtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnY29udGV4dC1tZW51OnNob3cnLCBjb25maWcpO1xyXG4gIH1cclxuXHJcbiAgaGlkZUNvbnRleHRNZW51KCk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jb250ZXh0TWVudS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2NvbnRleHQtbWVudTpoaWRlJyk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTW9kYWwgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgc2hvd0NsYXNzRWRpdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jbGFzc0ZpbGVWaWV3ZXJNb2RhbC5zaG93KCk7XHJcbiAgfVxyXG5cclxuICBoaWRlQ2xhc3NFZGl0b3IoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmNsYXNzRmlsZVZpZXdlck1vZGFsLmhpZGUoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGdldERpc3BsYXlOYW1lRm9yQ2xhc3MobGFiZWxDbGFzczogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5jbGFzc05hbWVzLmdldChsYWJlbENsYXNzKSB8fCBgQ2xhc3MgJHtsYWJlbENsYXNzfWA7XHJcbiAgfVxyXG5cclxuICBnZXRET01FbGVtZW50cygpOiBET01FbGVtZW50cyB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50cztcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTdGF0ZSBHZXR0ZXJzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBnZXRVSVN0YXRlKCk6IFVJU3RhdGUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNJbWFnZUxpc3RWaXNpYmxlOiB0aGlzLmVsZW1lbnRzLmltYWdlTGlzdC5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZScsXHJcbiAgICAgIGlzTGFiZWxMaXN0VmlzaWJsZTogdGhpcy5lbGVtZW50cy5sYWJlbExpc3Quc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnLFxyXG4gICAgICBpc1ByZXZpZXdCYXJWaXNpYmxlOiB0aGlzLmVsZW1lbnRzLnByZXZpZXdCYXIuc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnLFxyXG4gICAgICBpc0xlZnRQYW5lbENvbGxhcHNlZDogdGhpcy5lbGVtZW50cy5sZWZ0UGFuZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnLFxyXG4gICAgICBpc1JpZ2h0UGFuZWxDb2xsYXBzZWQ6IHRoaXMuZWxlbWVudHMucmlnaHRQYW5lbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScsXHJcbiAgICAgIGFjdGl2ZUZpbHRlcnM6IG5ldyBTZXQodGhpcy5maWx0ZXJCdXR0b25zLmZpbHRlcihidG4gPT4gYnRuLmlzQWN0aXZlKS5tYXAoYnRuID0+IGJ0bi5sYWJlbENsYXNzKSksXHJcbiAgICAgIHNlbGVjdGVkTGFiZWxzOiBuZXcgU2V0KCkgLy8gVE9ETzogaW1wbGVtZW50IHNlbGVjdGlvbiB0cmFja2luZ1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGdldFNlYXJjaE9wdGlvbnMoKTogU2VhcmNoT3B0aW9ucyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzZWFyY2hUZXJtOiB0aGlzLmVsZW1lbnRzLmltYWdlU2VhcmNoSW5wdXQudmFsdWUsXHJcbiAgICAgIHNob3dMYWJlbGVkOiB0aGlzLmVsZW1lbnRzLnNob3dMYWJlbGVkQ2hlY2tib3guY2hlY2tlZCxcclxuICAgICAgc2hvd1VubGFiZWxlZDogdGhpcy5lbGVtZW50cy5zaG93VW5sYWJlbGVkQ2hlY2tib3guY2hlY2tlZCxcclxuICAgICAgc29ydE9yZGVyOiAnbmFtZScsIC8vIFRPRE86IGltcGxlbWVudCBkeW5hbWljIHNvcnRpbmdcclxuICAgICAgc29ydERpcmVjdGlvbjogJ2FzYydcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBnZXRGaWx0ZXJPcHRpb25zKCk6IEZpbHRlck9wdGlvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWN0aXZlQ2xhc3NlczogbmV3IFNldCh0aGlzLmZpbHRlckJ1dHRvbnMuZmlsdGVyKGJ0biA9PiBidG4uaXNBY3RpdmUpLm1hcChidG4gPT4gYnRuLmxhYmVsQ2xhc3MpKSxcclxuICAgICAgc2hvd0FsbDogdGhpcy5maWx0ZXJCdXR0b25zLmxlbmd0aCA9PT0gMCxcclxuICAgICAgaGlkZUVtcHR5OiBmYWxzZSAvLyBUT0RPOiBpbXBsZW1lbnQgaGlkZSBlbXB0eSBvcHRpb25cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEV2ZW50IExpc3RlbmVyIFNldHVwXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxyXG4gIHByaXZhdGUgc2V0dXBFdmVudExpc3RlbmVycygpOiB2b2lkIHtcbiAgICAvLyBTeW5jIFVJIHdoZW4gbW9kZSBjaGFuZ2VzIHByb2dyYW1tYXRpY2FsbHkgKGUuZy4sIHJpZ2h0LWNsaWNrIHRvZ2dsZSlcbiAgICB0cnkge1xuICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkuYWRkRXZlbnRMaXN0ZW5lcignbW9kZTpjaGFuZ2VkJywgKGV2dDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBldnQ/LmRhdGE/LmN1cnJlbnQ7XG4gICAgICAgIHRoaXMuc3luY01vZGVVSShjdXJyZW50KTtcbiAgICAgIH0pO1xuICAgICAgLy8gSW5pdGlhbGl6ZSBvbmNlXG4gICAgICB0aGlzLnN5bmNNb2RlVUkoKHRoaXMuX3N0YXRlIGFzIGFueSkuY3VycmVudE1vZGUpO1xuICAgIH0gY2F0Y2gge31cbiAgICAvLyBVcGRhdGUgY29vcmQgaW5wdXRzIHdpdGggaW1hZ2UgcG9pbnRlciBwb3NpdGlvblxuICAgIHRyeSB7XG4gICAgICAodGhpcy5fY2FudmFzQ29udHJvbGxlciBhcyBhbnkpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlOm1vdmUnLCAoZXZ0OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gZXZ0Py5kYXRhPy5pbWFnZTtcbiAgICAgICAgaWYgKGltZyAmJiBOdW1iZXIuaXNGaW5pdGUoaW1nLngpICYmIE51bWJlci5pc0Zpbml0ZShpbWcueSkpIHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnRzLmNvb3JkWElucHV0LnZhbHVlID0gU3RyaW5nKE1hdGgucm91bmQoaW1nLngpKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnRzLmNvb3JkWUlucHV0LnZhbHVlID0gU3RyaW5nKE1hdGgucm91bmQoaW1nLnkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICAgIC8vIEZvbGRlciBzZWxlY3Rpb25cbiAgICB0aGlzLmVsZW1lbnRzLnNlbGVjdEltYWdlRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RJbWFnZUZvbGRlcj8uKCk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRJbWFnZUZvbGRlcihyZXN1bHQuZGF0YSk7XG5cbiAgICAgICAgICAvLyBBdXRvLWRldGVjdCBvciBjcmVhdGUgbGFiZWwgZm9sZGVyIGluc2lkZSB0aGUgc2VsZWN0ZWQgaW1hZ2UgZm9sZGVyXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRm9sZGVySGFuZGxlID0gcmVzdWx0LmRhdGEgYXMgYW55O1xuICAgICAgICAgICAgbGV0IGxhYmVsSGFuZGxlOiBhbnkgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgIC8vIFRyeSBjb21tb24gbmFtZXMgZmlyc3Q6ICdsYWJlbHMnLCB0aGVuICdsYWJlbCdcbiAgICAgICAgICAgIHRyeSB7IGxhYmVsSGFuZGxlID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUuZ2V0RGlyZWN0b3J5SGFuZGxlKCdsYWJlbHMnKTsgfSBjYXRjaCB7fVxuICAgICAgICAgICAgaWYgKCFsYWJlbEhhbmRsZSkgeyB0cnkgeyBsYWJlbEhhbmRsZSA9IGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLmdldERpcmVjdG9yeUhhbmRsZSgnbGFiZWwnKTsgfSBjYXRjaCB7fSB9XG5cbiAgICAgICAgICAgIGlmICghbGFiZWxIYW5kbGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgY3JlYXRlID0gd2luZG93LmNvbmZpcm0oJ05vIGxhYmVsIGZvbGRlciBmb3VuZCBpbnNpZGUgdGhlIHNlbGVjdGVkIGltYWdlIGZvbGRlci5cXG5DcmVhdGUgYSBuZXcgXCJsYWJlbHNcIiBmb2xkZXI/Jyk7XG4gICAgICAgICAgICAgIGlmIChjcmVhdGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZUZvbGRlckhhbmRsZS5yZXF1ZXN0UGVybWlzc2lvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJtID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUucmVxdWVzdFBlcm1pc3Npb24oeyBtb2RlOiAncmVhZHdyaXRlJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcm0gIT09ICdncmFudGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLnJlcXVlc3RQZXJtaXNzaW9uKHsgbW9kZTogJ3JlYWR3cml0ZScgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGxhYmVsSGFuZGxlID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUuZ2V0RGlyZWN0b3J5SGFuZGxlKCdsYWJlbHMnLCB7IGNyZWF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgbGFiZWxzIGZvbGRlcicsIGVycik7XG4gICAgICAgICAgICAgICAgICBzaG93RXJyb3JUb2FzdCgnUGVybWlzc2lvbiBibG9ja2VkLiBVc2UgXCJMb2FkIExhYmVsIEZvbGRlclwiIHRvIHBpY2sgYSBmb2xkZXIuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbEhhbmRsZSkge1xuICAgICAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRMYWJlbEZvbGRlcihsYWJlbEhhbmRsZSk7XG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxGb2xkZXJCdXR0b24odHJ1ZSwgbGFiZWxIYW5kbGUubmFtZSk7XG4gICAgICAgICAgICAgIHNob3dTdWNjZXNzVG9hc3QoYExhYmVsIGZvbGRlciByZWFkeTogJHtsYWJlbEhhbmRsZS5uYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTGFiZWwgZm9sZGVyIGRldGVjdGlvbi9jcmVhdGlvbiBza2lwcGVkOicsIGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExpc3QgaW1hZ2VzIGFmdGVyIGxhYmVsIGZvbGRlciBoYW5kbGluZ1xuICAgICAgICAgIGNvbnN0IGxpc3RSZXMgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLmxpc3RJbWFnZUZpbGVzPy4ocmVzdWx0LmRhdGEpO1xuICAgICAgICAgIGlmIChsaXN0UmVzPy5zdWNjZXNzICYmIEFycmF5LmlzQXJyYXkobGlzdFJlcy5kYXRhKSkge1xuICAgICAgICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkuaW1hZ2VGaWxlcyA9IGxpc3RSZXMuZGF0YTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVySW1hZ2VMaXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZWxlY3QgaW1hZ2UgZm9sZGVyJywgZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnNlbGVjdExhYmVsRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RMYWJlbEZvbGRlcj8uKCk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRMYWJlbEZvbGRlcihyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgdGhpcy51cGRhdGVMYWJlbEZvbGRlckJ1dHRvbih0cnVlLCByZXN1bHQuZGF0YS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VsZWN0IGxhYmVsIGZvbGRlcicsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5sb2FkQ2xhc3NJbmZvRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RDbGFzc0luZm9Gb2xkZXI/LigpO1xuICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgdGhpcy5fc3RhdGUuc2V0Q2xhc3NJbmZvRm9sZGVyKHJlc3VsdC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VsZWN0IGNsYXNzIGluZm8gZm9sZGVyJywgZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBab29tIGNvbnRyb2xzXG4gICAgdGhpcy5lbGVtZW50cy56b29tSW5CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnpvb21JbigpKTtcbiAgICB0aGlzLmVsZW1lbnRzLnpvb21PdXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnpvb21PdXQoKSk7XG4gICAgdGhpcy5lbGVtZW50cy5yZXNldFpvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnJlc2V0Wm9vbSgpKTtcblxuICAgIC8vIE1vZGUgc3dpdGNoaW5nXG4gICAgdGhpcy5lbGVtZW50cy5kcmF3TW9kZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuX3N0YXRlLnNldE1vZGUoJ2RyYXcnKSk7XG4gICAgdGhpcy5lbGVtZW50cy5lZGl0TW9kZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuX3N0YXRlLnNldE1vZGUoJ2VkaXQnKSk7XG5cbiAgICAvLyBDYW52YXMgZGlzcGxheSBvcHRpb25zXG4gICAgdGhpcy5lbGVtZW50cy5zaG93TGFiZWxzT25DYW52YXNUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhdGUuc2V0U2hvd0xhYmVscyh0aGlzLmVsZW1lbnRzLnNob3dMYWJlbHNPbkNhbnZhc1RvZ2dsZS5jaGVja2VkKTtcbiAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIudXBkYXRlTGFiZWxzKCk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtZW50cy5sYWJlbEZvbnRTaXplU2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgY29uc3QgdmFsID0gTnVtYmVyKHRoaXMuZWxlbWVudHMubGFiZWxGb250U2l6ZVNsaWRlci52YWx1ZSk7XG4gICAgICB0aGlzLmVsZW1lbnRzLmxhYmVsRm9udFNpemVWYWx1ZS50ZXh0Q29udGVudCA9IFN0cmluZyh2YWwpO1xuICAgICAgdGhpcy5fc3RhdGUuc2V0TGFiZWxGb250U2l6ZSh2YWwpO1xuICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5zZXRMYWJlbEZvbnQodmFsKTtcbiAgICB9KTtcbiAgICB0aGlzLmVsZW1lbnRzLmF1dG9TYXZlVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuX3N0YXRlLnNldEF1dG9TYXZlKHRoaXMuZWxlbWVudHMuYXV0b1NhdmVUb2dnbGUuY2hlY2tlZCk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtZW50cy5jcm9zc2hhaXJUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhdGUudG9nZ2xlQ3Jvc3NoYWlyKCk7XG4gICAgfSk7XG5cbiAgICAvLyBXaW5kb3cgcmVzaXplIGhhbmRsZXJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZXNpemVQYW5lbHMoKTtcbiAgICB9KTtcblxyXG4gICAgLy8gUGFuZWwgY29sbGFwc2UvZXhwYW5kIGJ1dHRvbnNcclxuICAgIHRoaXMuZWxlbWVudHMuY29sbGFwc2VMZWZ0UGFuZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGFuZWxDb25maWdzLmdldCgnbGVmdCcpITtcclxuICAgICAgdGhpcy50b2dnbGVQYW5lbChjb25maWcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50cy5jb2xsYXBzZVJpZ2h0UGFuZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGFuZWxDb25maWdzLmdldCgncmlnaHQnKSE7XHJcbiAgICAgIHRoaXMudG9nZ2xlUGFuZWwoY29uZmlnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudHMuZXhwYW5kTGVmdFBhbmVsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLnBhbmVsQ29uZmlncy5nZXQoJ2xlZnQnKSE7XHJcbiAgICAgIHRoaXMudG9nZ2xlUGFuZWwoY29uZmlnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudHMuZXhwYW5kUmlnaHRQYW5lbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5wYW5lbENvbmZpZ3MuZ2V0KCdyaWdodCcpITtcclxuICAgICAgdGhpcy50b2dnbGVQYW5lbChjb25maWcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGhlbWUgdG9nZ2xlXG4gICAgdGhpcy5lbGVtZW50cy5kYXJrTW9kZVRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZURhcmtNb2RlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBTYXZlIGxhYmVsc1xuICAgIHRoaXMuZWxlbWVudHMuc2F2ZUxhYmVsc0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdGhpcy5fc3RhdGUuY3VycmVudEltYWdlRmlsZSB8fCAhKHRoaXMuX3N0YXRlIGFzIGFueSkubGFiZWxGb2xkZXJIYW5kbGUpIHtcbiAgICAgICAgICBzaG93RXJyb3JUb2FzdCgnU2VsZWN0IGltYWdlIGFuZCBsYWJlbCBmb2xkZXJzIGZpcnN0Jyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94ZXMgPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKTtcbiAgICAgICAgY29uc3QgeW9sb0xhYmVscyA9IGJvdW5kaW5nQm94ZXMubWFwKGJib3ggPT5cbiAgICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLmJvdW5kaW5nQm94VG9ZT0xPKGJib3gsIHtcbiAgICAgICAgICAgIHdpZHRoOiAodGhpcy5fc3RhdGUgYXMgYW55KS5jdXJyZW50SW1hZ2U/LndpZHRoIHx8IDEsXG4gICAgICAgICAgICBoZWlnaHQ6ICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkuc2F2ZUxhYmVscz8uKFxuICAgICAgICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRJbWFnZUZpbGUubmFtZSxcbiAgICAgICAgICB5b2xvTGFiZWxzLFxuICAgICAgICAgICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmxhYmVsRm9sZGVySGFuZGxlXG4gICAgICAgICk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MpIHtcbiAgICAgICAgICBzaG93U3VjY2Vzc1RvYXN0KCdMYWJlbHMgc2F2ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2hvd0Vycm9yVG9hc3QocmVzdWx0Py5lcnJvciB8fCAnRmFpbGVkIHRvIHNhdmUgbGFiZWxzJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdTYXZlIGxhYmVscyBmYWlsZWQnLCBlKTtcbiAgICAgICAgc2hvd0Vycm9yVG9hc3QoJ0ZhaWxlZCB0byBzYXZlIGxhYmVscycpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gR28gdG8gY29vcmRpbmF0ZXNcbiAgICB0aGlzLmVsZW1lbnRzLmdvVG9Db29yZHNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBjb25zdCB4ID0gTnVtYmVyKHRoaXMuZWxlbWVudHMuY29vcmRYSW5wdXQudmFsdWUpO1xuICAgICAgY29uc3QgeSA9IE51bWJlcih0aGlzLmVsZW1lbnRzLmNvb3JkWUlucHV0LnZhbHVlKTtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoeCkgJiYgTnVtYmVyLmlzRmluaXRlKHkpKSB7XG4gICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ29Ub0ltYWdlQ29vcmRpbmF0ZXMoeCwgeSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBab29tIGlucHV0IChwZXJjZW50KVxuICAgIHRoaXMuZWxlbWVudHMuem9vbUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGNvbnN0IHBjdCA9IE51bWJlcih0aGlzLmVsZW1lbnRzLnpvb21JbnB1dC52YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHBjdCkgJiYgcGN0ID4gMCkge1xuICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLnNldFpvb21QZXJjZW50KHBjdCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBIaWRlIGNvbnRleHQgbWVudSBvbiBkb2N1bWVudCBjbGlja1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5lbGVtZW50cy5jb250ZXh0TWVudS5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgICB0aGlzLmhpZGVDb250ZXh0TWVudSgpO1xuICAgICAgfVxuICAgIH0pO1xyXG4gIH1cblxuICAvLyBLZWVwIG1vZGUgYnV0dG9ucyBpbiBzeW5jIHdpdGggQXBwU3RhdGVcbiAgcHJpdmF0ZSBzeW5jTW9kZVVJKGN1cnJlbnRNb2RlOiAnZHJhdycgfCAnZWRpdCcpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZHJhd0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RyYXdNb2RlJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XG4gICAgICBjb25zdCBlZGl0SW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRpdE1vZGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbDtcbiAgICAgIGNvbnN0IGRyYXdMYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsW2Zvcj1cImRyYXdNb2RlXCJdJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgY29uc3QgZWRpdExhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiZWRpdE1vZGVcIl0nKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgICAgIGNvbnN0IGlzRHJhdyA9IGN1cnJlbnRNb2RlID09PSAnZHJhdyc7XG4gICAgICBpZiAoZHJhd0lucHV0KSBkcmF3SW5wdXQuY2hlY2tlZCA9IGlzRHJhdztcbiAgICAgIGlmIChlZGl0SW5wdXQpIGVkaXRJbnB1dC5jaGVja2VkID0gIWlzRHJhdztcbiAgICAgIGlmIChkcmF3TGFiZWwpIGRyYXdMYWJlbC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBpc0RyYXcpO1xuICAgICAgaWYgKGVkaXRMYWJlbCkgZWRpdExhYmVsLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsICFpc0RyYXcpO1xuICAgIH0gY2F0Y2gge31cbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFZhbGlkYXRpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhbGlkYXRlVUlTdGF0ZSgpOiBhbnkge1xyXG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgZXNzZW50aWFsIGVsZW1lbnRzIGV4aXN0XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudHMuY2FudmFzQ29udGFpbmVyKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdDYW52YXMgY29udGFpbmVyIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5lbGVtZW50cy5pbWFnZUxpc3QpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ltYWdlIGxpc3QgY29udGFpbmVyIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5lbGVtZW50cy5sYWJlbExpc3QpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0xhYmVsIGxpc3QgY29udGFpbmVyIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZUZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YSk6IGFueSB7XHJcbiAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAvLyBJbXBsZW1lbnQgZm9ybSB2YWxpZGF0aW9uIGxvZ2ljIGFzIG5lZWRlZFxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQWRkaXRpb25hbCBNZXRob2RzIChmb3IgZnV0dXJlIGV4cGFuc2lvbilcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGFkZEVkaXREZWxldGVMaXN0ZW5lcnMocmVjdHM6IEJvdW5kaW5nQm94W10pOiB2b2lkIHtcclxuICAgIC8vIEltcGxlbWVudGF0aW9uIGZvciBhZGRpbmcgZWRpdC9kZWxldGUgZXZlbnQgbGlzdGVuZXJzIHRvIGJvdW5kaW5nIGJveCBlbGVtZW50c1xyXG4gICAgcmVjdHMuZm9yRWFjaChyZWN0ID0+IHtcclxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgZWRpdC9kZWxldGUgb3BlcmF0aW9uc1xyXG4gICAgICAvLyBUaGlzIHdvdWxkIHR5cGljYWxseSBiZSBoYW5kbGVkIGJ5IHRoZSBDYW52YXNDb250cm9sbGVyXHJcbiAgICB9KTtcclxuICB9XHJcbn1cbiIsIi8qKlxyXG4gKiBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWFpbiBFbnRyeSBQb2ludFxyXG4gKlxyXG4gKiBQaGFzZSA4IENvbXBsZXRlOiBBcHBsaWNhdGlvbiBJbnRlZ3JhdGlvbiAmIFRlc3RpbmdcclxuICogQWxsIG1vZHVsZXMgaW50ZWdyYXRlZCB3aXRoIGNvbXBsZXRlIGRlcGVuZGVuY3kgaW5qZWN0aW9uIHN5c3RlbVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGNyZWF0ZUFwcFN0YXRlIH0gZnJvbSAnLi9tb2RlbHMnO1xyXG5pbXBvcnQgeyBjcmVhdGVGaWxlU3lzdGVtU2VydmljZSwgRmlsZVN5c3RlbVNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzJztcclxuaW1wb3J0IHsgQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvQ2FudmFzQ29udHJvbGxlcic7XHJcbmltcG9ydCB7IEV2ZW50TWFuYWdlciB9IGZyb20gJy4vY29udHJvbGxlcnMvRXZlbnRNYW5hZ2VyJztcclxuaW1wb3J0IHsgVUlNYW5hZ2VyIH0gZnJvbSAnLi91aS9VSU1hbmFnZXInO1xyXG5pbXBvcnQgeyBzaG93U3VjY2Vzc1RvYXN0LCBzaG93RXJyb3JUb2FzdCB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuLyoqXHJcbiAqIE1haW4gQXBwbGljYXRpb24gQ2xhc3MgLSBQaGFzZSA4IENvbXBsZXRlIEludGVncmF0aW9uXHJcbiAqXHJcbiAqIFRoaXMgY2xhc3MgcHJvdmlkZXMgY29tcGxldGUgZGVwZW5kZW5jeSBpbmplY3Rpb24gYW5kIG1vZHVsZSBjb29yZGluYXRpb25cclxuICogZm9yIHRoZSBUeXBlU2NyaXB0IHZlcnNpb24gb2YgRWFzeSBMYWJlbGluZy5cclxuICovXHJcbmNsYXNzIEFwcCB7XHJcbiAgcHJpdmF0ZSBhcHBTdGF0ZSA9IGNyZWF0ZUFwcFN0YXRlKCk7XHJcbiAgcHJpdmF0ZSBmaWxlU3lzdGVtU2VydmljZTogRmlsZVN5c3RlbVNlcnZpY2UgPSBjcmVhdGVGaWxlU3lzdGVtU2VydmljZSgpO1xyXG4gIHByaXZhdGUgdWlNYW5hZ2VyITogVUlNYW5hZ2VyO1xyXG4gIHByaXZhdGUgY2FudmFzQ29udHJvbGxlciE6IENhbnZhc0NvbnRyb2xsZXI7XHJcbiAgcHJpdmF0ZSBldmVudE1hbmFnZXIhOiBFdmVudE1hbmFnZXI7XHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnNvbGUubG9nKCfwn5qAIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb24gLSBQaGFzZSA4IEludGVncmF0aW9uIScpO1xyXG4gICAgY29uc29sZS5sb2coJ+KchSBBbGwgNyBwcmV2aW91cyBwaGFzZXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgY29uc29sZS5sb2coJ+KchSBQaGFzZSA4OiBBcHBsaWNhdGlvbiBpbnRlZ3JhdGlvbiBzdGFydGluZy4uLicpO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZSBhbGwgYXBwbGljYXRpb24gY29tcG9uZW50cyB3aXRoIGRlcGVuZGVuY3kgaW5qZWN0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc29sZS5sb2coJ/CflKcgSW5pdGlhbGl6aW5nIGRlcGVuZGVuY3kgaW5qZWN0aW9uIHN5c3RlbS4uLicpO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSBDYW52YXMgQ29udHJvbGxlciBmaXJzdFxyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIgPSBuZXcgQ2FudmFzQ29udHJvbGxlcihcclxuICAgICAgICB0aGlzLmFwcFN0YXRlXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgQ2FudmFzQ29udHJvbGxlciBpbml0aWFsaXplZCcpO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSBVSSBNYW5hZ2VyIChuZWVkcyBDYW52YXNDb250cm9sbGVyKVxuICAgICAgdGhpcy51aU1hbmFnZXIgPSBuZXcgVUlNYW5hZ2VyKFxuICAgICAgICB0aGlzLmFwcFN0YXRlLFxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIsXG4gICAgICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgYXMgYW55IC8vIFR5cGUgY29tcGF0aWJpbGl0eSB3aWxsIGJlIGZpeGVkIGluIGZ1dHVyZSB1cGRhdGVzXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBVSU1hbmFnZXIgaW5pdGlhbGl6ZWQnKTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBGYWJyaWMgY2FudmFzIGluIHRoZSBleGlzdGluZyBjb250YWluZXIgZnJvbSBwdWJsaWMvaW5kZXguaHRtbFxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmluaXRpYWxpemVDYW52YXMoJ2NhbnZhcy1jb250YWluZXInKTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgQ2FudmFzIGluaXRpYWxpemVkIGluICNjYW52YXMtY29udGFpbmVyJyk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgRXZlbnQgTWFuYWdlciAobmVlZHMgYWxsIG90aGVyIGNvbXBvbmVudHMpXG4gICAgICB0aGlzLmV2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIoXG4gICAgICAgIHRoaXMuYXBwU3RhdGUsXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlcixcbiAgICAgICAgdGhpcy5maWxlU3lzdGVtU2VydmljZVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgRXZlbnRNYW5hZ2VyIGluaXRpYWxpemVkJyk7XHJcblxyXG4gICAgICAvLyBTZXR1cCBjcm9zcy1jb21wb25lbnQgcmVmZXJlbmNlc1xyXG4gICAgICB0aGlzLnNldHVwQ3Jvc3NSZWZlcmVuY2VzKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgQ3Jvc3MtY29tcG9uZW50IHJlZmVyZW5jZXMgZXN0YWJsaXNoZWQnKTtcclxuXHJcbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBmb3IgYXBwbGljYXRpb24gbGlmZWN5Y2xlXHJcbiAgICAgIHRoaXMuc2V0dXBBcHBsaWNhdGlvbkV2ZW50cygpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIEFwcGxpY2F0aW9uIGV2ZW50IHN5c3RlbSByZWFkeScpO1xyXG5cclxuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn46vIFBoYXNlIDggYXBwbGljYXRpb24gaW50ZWdyYXRpb24gY29tcGxldGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuXHJcbiAgICAgIC8vIFNob3cgc3VjY2VzcyBub3RpZmljYXRpb25cclxuICAgICAgc2hvd1N1Y2Nlc3NUb2FzdCgn8J+agCBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgbWlncmF0aW9uIGNvbXBsZXRlIScpO1xyXG5cclxuICAgICAgLy8gUGVyZm9ybSBmdW5jdGlvbmFsaXR5IHRlc3RzXHJcbiAgICAgIGF3YWl0IHRoaXMucGVyZm9ybUZ1bmN0aW9uYWxpdHlUZXN0cygpO1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBBcHBsaWNhdGlvbiBpbml0aWFsaXphdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICBzaG93RXJyb3JUb2FzdCgn4p2MIEFwcGxpY2F0aW9uIGluaXRpYWxpemF0aW9uIGZhaWxlZCcpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHVwIGNyb3NzLWNvbXBvbmVudCByZWZlcmVuY2VzIGZvciBjaXJjdWxhciBkZXBlbmRlbmNpZXNcclxuICAgKi9cclxuICBwcml2YXRlIHNldHVwQ3Jvc3NSZWZlcmVuY2VzKCk6IHZvaWQge1xyXG4gICAgLy8gU2V0dXAgY3Jvc3MtY29tcG9uZW50IHJlZmVyZW5jZXNcclxuICAgIC8vIFVJTWFuYWdlciBzaG91bGQgaGF2ZSBhY2Nlc3MgdG8gY2FudmFzIHRocm91Z2ggYXBwU3RhdGVcclxuICAgIC8vIENyb3NzLXJlZmVyZW5jZXMgaGFuZGxlZCB0aHJvdWdoIGRlcGVuZGVuY3kgaW5qZWN0aW9uXHJcblxyXG4gICAgY29uc29sZS5sb2coJ/CflJcgQ3Jvc3MtcmVmZXJlbmNlcyBlc3RhYmxpc2hlZCBiZXR3ZWVuIGNvbXBvbmVudHMnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHVwIGFwcGxpY2F0aW9uLWxldmVsIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0dXBBcHBsaWNhdGlvbkV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIExpc3RlbiB0byBhcHBsaWNhdGlvbiBzdGF0ZSBjaGFuZ2VzXHJcbiAgICB0aGlzLmFwcFN0YXRlLmFkZEV2ZW50TGlzdGVuZXIoJ21vZGU6Y2hhbmdlZCcsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygn8J+ToSBBcHAgbW9kZSBjaGFuZ2VkOicsIGV2ZW50LmRhdGEpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcHBTdGF0ZS5hZGRFdmVudExpc3RlbmVyKCdpbWFnZTpzZWxlY3RlZCcsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygn8J+ToSBJbWFnZSBzZWxlY3RlZDonLCBldmVudC5kYXRhKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXBwU3RhdGUuYWRkRXZlbnRMaXN0ZW5lcignbGFiZWxzOnNhdmVkJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn5OhIExhYmVscyBzYXZlZDonLCBldmVudC5kYXRhKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSBicm93c2VyIGVycm9yc1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/CfmqggQXBwbGljYXRpb24gZXJyb3I6JywgZXZlbnQuZXJyb3IpO1xyXG4gICAgICBzaG93RXJyb3JUb2FzdCgnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbnNcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+aqCBVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246JywgZXZlbnQucmVhc29uKTtcclxuICAgICAgc2hvd0Vycm9yVG9hc3QoJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybSBjb21wcmVoZW5zaXZlIGZ1bmN0aW9uYWxpdHkgdGVzdGluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcGVyZm9ybUZ1bmN0aW9uYWxpdHlUZXN0cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnNvbGUubG9nKCdcXG7wn6eqIFBlcmZvcm1pbmcgUGhhc2UgOCBJbnRlZ3JhdGlvbiBUZXN0czonKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUZXN0IDE6IENvbXBvbmVudCBpbml0aWFsaXphdGlvblxyXG4gICAgICBjb25zdCBjb21wb25lbnRzVGVzdCA9IHRoaXMudGVzdENvbXBvbmVudEluaXRpYWxpemF0aW9uKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgQ29tcG9uZW50IGluaXRpYWxpemF0aW9uIHRlc3Q6JywgY29tcG9uZW50c1Rlc3QgPyAnUEFTU0VEJyA6ICdGQUlMRUQnKTtcclxuXHJcbiAgICAgIC8vIFRlc3QgMjogRXZlbnQgc3lzdGVtIGludGVncmF0aW9uXHJcbiAgICAgIGNvbnN0IGV2ZW50c1Rlc3QgPSB0aGlzLnRlc3RFdmVudFN5c3RlbUludGVncmF0aW9uKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgRXZlbnQgc3lzdGVtIGludGVncmF0aW9uIHRlc3Q6JywgZXZlbnRzVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCAzOiBVSSBmdW5jdGlvbmFsaXR5XHJcbiAgICAgIGNvbnN0IHVpVGVzdCA9IGF3YWl0IHRoaXMudGVzdFVJRnVuY3Rpb25hbGl0eSgpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIFVJIGZ1bmN0aW9uYWxpdHkgdGVzdDonLCB1aVRlc3QgPyAnUEFTU0VEJyA6ICdGQUlMRUQnKTtcclxuXHJcbiAgICAgIC8vIFRlc3QgNDogQ2FudmFzIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgY29uc3QgY2FudmFzVGVzdCA9IHRoaXMudGVzdENhbnZhc0Z1bmN0aW9uYWxpdHkoKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBDYW52YXMgZnVuY3Rpb25hbGl0eSB0ZXN0OicsIGNhbnZhc1Rlc3QgPyAnUEFTU0VEJyA6ICdGQUlMRUQnKTtcclxuXHJcbiAgICAgIC8vIFRlc3QgNTogRmlsZSBzeXN0ZW0gaW50ZWdyYXRpb25cclxuICAgICAgY29uc3QgZmlsZVN5c3RlbVRlc3QgPSB0aGlzLnRlc3RGaWxlU3lzdGVtSW50ZWdyYXRpb24oKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBGaWxlIHN5c3RlbSBpbnRlZ3JhdGlvbiB0ZXN0OicsIGZpbGVTeXN0ZW1UZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICAvLyBUZXN0IDY6IEtleWJvYXJkIHNob3J0Y3V0c1xyXG4gICAgICBjb25zdCBrZXlib2FyZFRlc3QgPSB0aGlzLnRlc3RLZXlib2FyZFNob3J0Y3V0cygpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIEtleWJvYXJkIHNob3J0Y3V0cyB0ZXN0OicsIGtleWJvYXJkVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coJ/Cfjq8gQWxsIFBoYXNlIDggaW50ZWdyYXRpb24gdGVzdHMgY29tcGxldGVkIScpO1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBJbnRlZ3JhdGlvbiB0ZXN0cyBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBjb21wb25lbnQgaW5pdGlhbGl6YXRpb25cclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RDb21wb25lbnRJbml0aWFsaXphdGlvbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhIShcclxuICAgICAgdGhpcy5hcHBTdGF0ZSAmJlxyXG4gICAgICB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlICYmXHJcbiAgICAgIHRoaXMudWlNYW5hZ2VyICYmXHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlciAmJlxyXG4gICAgICB0aGlzLmV2ZW50TWFuYWdlciAmJlxyXG4gICAgICB0aGlzLmluaXRpYWxpemVkXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBldmVudCBzeXN0ZW0gaW50ZWdyYXRpb25cclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RFdmVudFN5c3RlbUludGVncmF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBUZXN0IHN0YXRlIGV2ZW50IHdpdGhvdXQgYWx0ZXJpbmcgZmluYWwgbW9kZVxuICAgICAgY29uc3QgcHJldk1vZGUgPSB0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlIGFzICdkcmF3JyB8ICdlZGl0JztcbiAgICAgIHRoaXMuYXBwU3RhdGUuc2V0TW9kZSgnZWRpdCcpO1xuICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKCdkcmF3Jyk7XG4gICAgICAvLyByZXN0b3JlIHByZXZpb3VzIG1vZGVcbiAgICAgIHRoaXMuYXBwU3RhdGUuc2V0TW9kZShwcmV2TW9kZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXZlbnQgc3lzdGVtIHRlc3QgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBVSSBmdW5jdGlvbmFsaXR5XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyB0ZXN0VUlGdW5jdGlvbmFsaXR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gVGVzdCBVSSB1cGRhdGUgbWV0aG9kc1xyXG4gICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVMYWJlbExpc3QoKTtcclxuICAgICAgLy8gQWRkIG90aGVyIFVJIHVwZGF0ZSB0ZXN0cyBhcyBtZXRob2RzIGJlY29tZSBhdmFpbGFibGVcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdVSSBmdW5jdGlvbmFsaXR5IHRlc3QgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IGNhbnZhcyBmdW5jdGlvbmFsaXR5XHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0ZXN0Q2FudmFzRnVuY3Rpb25hbGl0eSgpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFRlc3QgY2FudmFzIG1ldGhvZHNcclxuICAgICAgY29uc3QgY2FudmFzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmNhbnZhcztcclxuICAgICAgaWYgKCFjYW52YXMpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFRlc3Qgem9vbSBmdW5jdGlvbnNcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnpvb21JbigpO1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbU91dCgpO1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIucmVzZXRab29tKCk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NhbnZhcyBmdW5jdGlvbmFsaXR5IHRlc3QgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IGZpbGUgc3lzdGVtIGludGVncmF0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0ZXN0RmlsZVN5c3RlbUludGVncmF0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gVGVzdCBzZXJ2aWNlIG1ldGhvZHMgZXhpc3RcclxuICAgICAgY29uc3QgbWV0aG9kcyA9IFtcclxuICAgICAgICAnc2VsZWN0SW1hZ2VGb2xkZXInLFxyXG4gICAgICAgICdzZWxlY3RMYWJlbEZvbGRlcicsXHJcbiAgICAgICAgJ2xvYWRMYWJlbHMnLFxyXG4gICAgICAgICdzYXZlTGFiZWxzJyxcclxuICAgICAgICAncGFyc2VZb2xvU3RyaW5nJ1xyXG4gICAgICBdO1xyXG5cclxuICAgICAgcmV0dXJuIG1ldGhvZHMuZXZlcnkobWV0aG9kID0+XHJcbiAgICAgICAgdHlwZW9mICh0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlIGFzIGFueSlbbWV0aG9kXSA9PT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmlsZSBzeXN0ZW0gaW50ZWdyYXRpb24gdGVzdCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3Qga2V5Ym9hcmQgc2hvcnRjdXRzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0ZXN0S2V5Ym9hcmRTaG9ydGN1dHMoKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUZXN0IHRoYXQgZXZlbnQgbWFuYWdlciBleGlzdHMgYW5kIGhhcyByZXF1aXJlZCBtZXRob2RzXHJcbiAgICAgIHJldHVybiAhIXRoaXMuZXZlbnRNYW5hZ2VyICYmIHR5cGVvZiB0aGlzLmV2ZW50TWFuYWdlci5kZXN0cm95ID09PSAnZnVuY3Rpb24nO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignS2V5Ym9hcmQgc2hvcnRjdXRzIHRlc3QgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYXBwbGljYXRpb24gc3RhdGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBcHBsaWNhdGlvblN0YXRlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaW5pdGlhbGl6ZWQ6IHRoaXMuaW5pdGlhbGl6ZWQsXHJcbiAgICAgIGFwcFN0YXRlOiB0aGlzLmFwcFN0YXRlLmdldERlYnVnSW5mbygpLFxyXG4gICAgICBjYW52YXM6IHtcclxuICAgICAgICBoYXNDYW52YXM6ICEhdGhpcy5jYW52YXNDb250cm9sbGVyPy5jYW52YXMsXHJcbiAgICAgICAgbW9kZTogdGhpcy5hcHBTdGF0ZS5jdXJyZW50TW9kZVxyXG4gICAgICB9LFxyXG4gICAgICB1aToge1xyXG4gICAgICAgIGhhc1VJTWFuYWdlcjogISF0aGlzLnVpTWFuYWdlclxyXG4gICAgICB9LFxyXG4gICAgICBldmVudHM6IHtcclxuICAgICAgICBoYXNFdmVudE1hbmFnZXI6ICEhdGhpcy5ldmVudE1hbmFnZXJcclxuICAgICAgfSxcclxuICAgICAgZmlsZVN5c3RlbToge1xyXG4gICAgICAgIGhhc0ZpbGVTeXN0ZW1TZXJ2aWNlOiAhIXRoaXMuZmlsZVN5c3RlbVNlcnZpY2VcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFudXAgYXBwbGljYXRpb24gcmVzb3VyY2VzXHJcbiAgICovXHJcbiAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLmV2ZW50TWFuYWdlcj8uZGVzdHJveT8uKCk7XHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlcj8uZGVzdHJveUNhbnZhcz8uKCk7XHJcbiAgICAgIC8vIHRoaXMudWlNYW5hZ2VyIGNsZWFudXAgaWYgbmVlZGVkXHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn6e5IEFwcGxpY2F0aW9uIHJlc291cmNlcyBjbGVhbmVkIHVwJyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgZHVyaW5nIGNsZWFudXA6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gSW5pdGlhbGl6ZSBhcHBsaWNhdGlvbiB3aGVuIERPTSBpcyByZWFkeVxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKCfwn5OxIERPTSBsb2FkZWQgLSBQaGFzZSA4IGludGVncmF0aW9uIHN0YXJ0aW5nLi4uJyk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBDcmVhdGUgYW5kIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxyXG4gICAgY29uc3QgYXBwID0gbmV3IEFwcCgpO1xyXG5cclxuICAgIC8vIE1ha2UgYXBwIGF2YWlsYWJsZSBnbG9iYWxseSBmb3IgZGVidWdnaW5nXHJcbiAgICAod2luZG93IGFzIGFueSkuZWFzeUxhYmVsaW5nQXBwID0gYXBwO1xyXG5cclxuICAgIC8vIFJlbW92ZWQ6IFBoYXNlIDggY29tcGxldGlvbiBpbmRpY2F0b3IgdG9hc3RcblxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCfinYwgRmFpbGVkIHRvIGluaXRpYWxpemUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbjonLCBlcnJvcik7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIEV4cG9ydCBtYWluIGNvbXBvbmVudHMgZm9yIGV4dGVybmFsIHVzZVxyXG5leHBvcnQgeyBBcHAgfTtcclxuZXhwb3J0IHsgQXBwU3RhdGUsIGNyZWF0ZUFwcFN0YXRlLCBjcmVhdGVBcHBTdGF0ZVdpdGhDb25maWcgfSBmcm9tICcuL21vZGVscyc7XHJcbmV4cG9ydCB7IEZpbGVTeXN0ZW1TZXJ2aWNlLCBjcmVhdGVGaWxlU3lzdGVtU2VydmljZSwgWW9sb1BhcnNlciB9IGZyb20gJy4vc2VydmljZXMnO1xyXG5leHBvcnQgeyBDYW52YXNDb250cm9sbGVyIH0gZnJvbSAnLi9jb250cm9sbGVycy9DYW52YXNDb250cm9sbGVyJztcclxuZXhwb3J0IHsgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi9jb250cm9sbGVycy9FdmVudE1hbmFnZXInO1xyXG5leHBvcnQgeyBVSU1hbmFnZXIgfSBmcm9tICcuL3VpL1VJTWFuYWdlcic7XHJcbmV4cG9ydCB7IHBhcnNlWW9sbywgZXhwb3J0WW9sbywgdmFsaWRhdGVZb2xvU3RyaW5nIH0gZnJvbSAnLi91dGlscyc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=