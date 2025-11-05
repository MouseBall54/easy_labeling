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
            // Avoid invalid baseline value warnings; ensure canvas uses a valid baseline
            textBaseline: 'alphabetic',
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
        const imgLeft = this.imageObject.left || 0;
        const imgTop = this.imageObject.top || 0;
        return {
            x: (canvasPoint.x - imgLeft) / scaleX,
            y: (canvasPoint.y - imgTop) / scaleY
        };
    }
    imageToCanvasCoordinates(imagePoint) {
        if (!this.imageObject)
            return imagePoint;
        const scaleX = this.imageObject.scaleX || 1;
        const scaleY = this.imageObject.scaleY || 1;
        const imgLeft = this.imageObject.left || 0;
        const imgTop = this.imageObject.top || 0;
        return {
            x: imagePoint.x * scaleX + imgLeft,
            y: imagePoint.y * scaleY + imgTop
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
                    // Keep current image element in state for save operations
                    try {
                        this.appState.currentImage = result.data;
                    }
                    catch { }
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
        // Initialize utility configuration (no console noise in production)
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
                // Keep current image element in state for size reference when saving
                try {
                    this._state.currentImage = imgEl;
                }
                catch { }
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
        this.initialize();
    }
    /**
     * Initialize all application components with dependency injection
     */
    async initialize() {
        try {
            // Initializing dependency injection system
            // Initialize Canvas Controller first
            this.canvasController = new CanvasController(this.appState);
            // CanvasController initialized
            // Initialize UI Manager (needs CanvasController)
            this.uiManager = new UIManager(this.appState, this.canvasController, this.fileSystemService // Type compatibility will be fixed in future updates
            );
            // UIManager initialized
            // Initialize Fabric canvas in the existing container from public/index.html
            this.canvasController.initializeCanvas('canvas-container');
            console.log('✅ Canvas initialized in #canvas-container');
            // Initialize Event Manager (needs all other components)
            this.eventManager = new EventManager(this.appState, this.canvasController, this.fileSystemService);
            // EventManager initialized
            // Setup cross-component references
            this.setupCrossReferences();
            // Setup event listeners for application lifecycle
            this.setupApplicationEvents();
            this.initialized = true;
            // Phase 8 application integration completed
            // (suppress success toast and integration tests logs on first load)
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
            // Suppress console noise
        });
        this.appState.addEventListener('image:selected', (event) => {
            // Suppress console noise
        });
        this.appState.addEventListener('labels:saved', (event) => {
            // Suppress console noise
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEQsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUVELDJDQUEyQztBQUMzQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBRWpELElBQUksQ0FBQztRQUNILG1DQUFtQztRQUNuQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXRCLDRDQUE0QztRQUMzQyxNQUFjLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQztRQUV0Qyw4Q0FBOEM7SUFFaEQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVFLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILDBDQUEwQztBQUMzQjtBQUMrRDtBQUNNO0FBQ2xCO0FBQ1I7QUFDZjtBQUN5QiIsInNvdXJjZXMiOlsid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdXRpbHMvY29sb3ItcGFsZXR0ZS50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL3ZhbGlkYXRpb24udHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91dGlscy9ub3RpZmljYXRpb25zLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL21vZGVscy9BcHBTdGF0ZS50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3R5cGVzL2ZpbGVzeXN0ZW0udHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91dGlscy95b2xvLXBhcnNlci50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3NlcnZpY2VzL0ZpbGVTeXN0ZW1TZXJ2aWNlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvc2VydmljZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy9leHRlcm5hbCB2YXIgXCJmYWJyaWNcIiIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL2NvbnRyb2xsZXJzL0NhbnZhc0NvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9jb250cm9sbGVycy9FdmVudE1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91dGlscy9pbmRleC50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3VpL1VJTWFuYWdlci50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvbG9yIFBhbGV0dGUgVXRpbGl0eSBNb2R1bGVcclxuICogXHJcbiAqIE1hbmFnZXMgY29sb3IgYXNzaWdubWVudHMgZm9yIG9iamVjdCBkZXRlY3Rpb24gbGFiZWxzIGFuZCBVSSBlbGVtZW50cy5cclxuICovXHJcblxyXG4vKipcclxuICogUHJlZGVmaW5lZCBjb2xvciBwYWxldHRlIGZvciBsYWJlbCBjbGFzc2VzXHJcbiAqIFVzZXMgYSBtaXggb2YgZGlzdGluY3QgY29sb3JzIG9wdGltaXplZCBmb3IgdmlzaWJpbGl0eSBhbmQgYWNjZXNzaWJpbGl0eVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGNvbG9yUGFsZXR0ZTogc3RyaW5nW10gPSBbXHJcbiAgICAnI2U2MTk0YicsICcjM2NiNDRiJywgJyNmZmUxMTknLCAnIzQzNjNkOCcsICcjZjU4MjMxJywgXHJcbiAgICAnIzkxMWViNCcsICcjNDZmMGYwJywgJyNmMDMyZTYnLCAnI2JjZjYwYycsICcjZmFiZWJlJyxcclxuICAgICcjMDA4MDgwJywgJyNlNmJlZmYnLCAnIzlhNjMyNCcsICcjZmZmYWM4JywgJyM4MDAwMDAnLFxyXG4gICAgJyNhYWZmYzMnLCAnIzgwODAwMCcsICcjZmZkOGIxJywgJyMwMDAwNzUnLCAnIzgwODA4MCcsXHJcbiAgICAnI2ZmZmZmZicsICcjMDAwMDAwJywgJyMxZjc3YjQnLCAnI2ZmN2YwZScsICcjMmNhMDJjJyxcclxuICAgICcjZDYyNzI4JywgJyM5NDY3YmQnLCAnIzhjNTY0YicsICcjZTM3N2MyJywgJyM3ZjdmN2YnXHJcbl07XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBmYWxsYmFjayBjb2xvciBmb3IgaW52YWxpZCBvciB1bmFzc2lnbmVkIGNsYXNzZXNcclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTE9SID0gJyMwMDAwMDAnO1xyXG5cclxuLyoqXHJcbiAqIEdldHMgYSBjb2xvciBmb3IgYSBzcGVjaWZpYyBsYWJlbCBjbGFzc1xyXG4gKiBAcGFyYW0gbGFiZWxDbGFzcyAtIFRoZSBsYWJlbCBjbGFzcyBpZGVudGlmaWVyIChzdHJpbmcgb3IgbnVtYmVyKVxyXG4gKiBAcmV0dXJucyBDb2xvciBoZXggc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29sb3JGb3JDbGFzcyhsYWJlbENsYXNzOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgY2xhc3NOdW1iZXIgPSB0eXBlb2YgbGFiZWxDbGFzcyA9PT0gJ3N0cmluZycgXHJcbiAgICAgICAgPyBwYXJzZUludChsYWJlbENsYXNzLCAxMCkgXHJcbiAgICAgICAgOiBsYWJlbENsYXNzO1xyXG5cclxuICAgIGlmIChpc05hTihjbGFzc051bWJlcikgfHwgY2xhc3NOdW1iZXIgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIERFRkFVTFRfQ09MT1I7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29sb3JJbmRleCA9IGNsYXNzTnVtYmVyICUgY29sb3JQYWxldHRlLmxlbmd0aDtcclxuICAgIHJldHVybiBjb2xvclBhbGV0dGVbY29sb3JJbmRleF0gfHwgREVGQVVMVF9DT0xPUjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgbXVsdGlwbGUgY29sb3JzIGZvciBhIGxpc3Qgb2YgbGFiZWwgY2xhc3Nlc1xyXG4gKiBAcGFyYW0gbGFiZWxDbGFzc2VzIC0gQXJyYXkgb2YgbGFiZWwgY2xhc3MgaWRlbnRpZmllcnNcclxuICogQHJldHVybnMgQXJyYXkgb2YgY29sb3IgaGV4IHN0cmluZ3NcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvcnNGb3JDbGFzc2VzKGxhYmVsQ2xhc3NlczogKHN0cmluZyB8IG51bWJlcilbXSk6IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiBsYWJlbENsYXNzZXMubWFwKGxhYmVsQ2xhc3MgPT4gZ2V0Q29sb3JGb3JDbGFzcyhsYWJlbENsYXNzKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaWYgYSBjb2xvciBpcyBpbiB0aGUgcGFsZXR0ZVxyXG4gKiBAcGFyYW0gY29sb3IgLSBDb2xvciBoZXggc3RyaW5nIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgY29sb3IgZXhpc3RzIGluIHBhbGV0dGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0NvbG9ySW5QYWxldHRlKGNvbG9yOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBjb2xvclBhbGV0dGUuaW5jbHVkZXMoY29sb3IudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSBpbmRleCBvZiBhIGNvbG9yIGluIHRoZSBwYWxldHRlXHJcbiAqIEBwYXJhbSBjb2xvciAtIENvbG9yIGhleCBzdHJpbmdcclxuICogQHJldHVybnMgSW5kZXggb2YgdGhlIGNvbG9yLCBvciAtMSBpZiBub3QgZm91bmRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvckluZGV4KGNvbG9yOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGNvbG9yUGFsZXR0ZS5maW5kSW5kZXgoYyA9PiBjLnRvTG93ZXJDYXNlKCkgPT09IGNvbG9yLnRvTG93ZXJDYXNlKCkpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhIGNvbnRyYXN0aW5nIHRleHQgY29sb3IgKGJsYWNrIG9yIHdoaXRlKSBmb3IgYSBnaXZlbiBiYWNrZ3JvdW5kIGNvbG9yXHJcbiAqIEBwYXJhbSBiYWNrZ3JvdW5kQ29sb3IgLSBCYWNrZ3JvdW5kIGNvbG9yIGhleCBzdHJpbmdcclxuICogQHJldHVybnMgJyMwMDAwMDAnIGZvciBsaWdodCBiYWNrZ3JvdW5kcywgJyNmZmZmZmYnIGZvciBkYXJrIGJhY2tncm91bmRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udHJhc3RpbmdUZXh0Q29sb3IoYmFja2dyb3VuZENvbG9yOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgLy8gUmVtb3ZlICMgaWYgcHJlc2VudFxyXG4gICAgY29uc3QgaGV4ID0gYmFja2dyb3VuZENvbG9yLnJlcGxhY2UoJyMnLCAnJyk7XHJcbiAgICBcclxuICAgIC8vIENvbnZlcnQgdG8gUkdCXHJcbiAgICBjb25zdCByID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZygwLCAyKSwgMTYpO1xyXG4gICAgY29uc3QgZyA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoMiwgNCksIDE2KTtcclxuICAgIGNvbnN0IGIgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDQsIDYpLCAxNik7XHJcbiAgICBcclxuICAgIC8vIENhbGN1bGF0ZSByZWxhdGl2ZSBsdW1pbmFuY2VcclxuICAgIGNvbnN0IGx1bWluYW5jZSA9ICgwLjI5OSAqIHIgKyAwLjU4NyAqIGcgKyAwLjExNCAqIGIpIC8gMjU1O1xyXG4gICAgXHJcbiAgICAvLyBSZXR1cm4gYmxhY2sgZm9yIGxpZ2h0IGJhY2tncm91bmRzLCB3aGl0ZSBmb3IgZGFyayBiYWNrZ3JvdW5kc1xyXG4gICAgcmV0dXJuIGx1bWluYW5jZSA+IDAuNSA/ICcjMDAwMDAwJyA6ICcjZmZmZmZmJztcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIGhleCBjb2xvciB0byBSR0JBXHJcbiAqIEBwYXJhbSBoZXggLSBIZXggY29sb3Igc3RyaW5nXHJcbiAqIEBwYXJhbSBhbHBoYSAtIEFscGhhIHZhbHVlICgwLTEpXHJcbiAqIEByZXR1cm5zIFJHQkEgY29sb3Igc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9SZ2JhKGhleDogc3RyaW5nLCBhbHBoYTogbnVtYmVyID0gMSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBjbGVhbkhleCA9IGhleC5yZXBsYWNlKCcjJywgJycpO1xyXG4gICAgY29uc3QgciA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZygwLCAyKSwgMTYpO1xyXG4gICAgY29uc3QgZyA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZygyLCA0KSwgMTYpO1xyXG4gICAgY29uc3QgYiA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZyg0LCA2KSwgMTYpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gYHJnYmEoJHtyfSwgJHtnfSwgJHtifSwgJHthbHBoYX0pYDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbG9yIGNvbmZpZ3VyYXRpb24gaW50ZXJmYWNlXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENvbG9yQ29uZmlnIHtcclxuICAgIHBhbGV0dGU6IHN0cmluZ1tdO1xyXG4gICAgZGVmYXVsdENvbG9yOiBzdHJpbmc7XHJcbiAgICB1c2VIaWdoQ29udHJhc3Q6IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZHZhbmNlZCBjb2xvciBtYW5hZ2VtZW50IGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29sb3JNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgcGFsZXR0ZTogc3RyaW5nW107XHJcbiAgICBwcml2YXRlIGRlZmF1bHRDb2xvcjogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSB1c2VIaWdoQ29udHJhc3Q6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBQYXJ0aWFsPENvbG9yQ29uZmlnPiA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5wYWxldHRlID0gY29uZmlnLnBhbGV0dGUgfHwgY29sb3JQYWxldHRlO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvbG9yID0gY29uZmlnLmRlZmF1bHRDb2xvciB8fCBERUZBVUxUX0NPTE9SO1xyXG4gICAgICAgIHRoaXMudXNlSGlnaENvbnRyYXN0ID0gY29uZmlnLnVzZUhpZ2hDb250cmFzdCB8fCBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgY29sb3IgZm9yIGNsYXNzIHdpdGggYWR2YW5jZWQgb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBnZXRDb2xvcihsYWJlbENsYXNzOiBzdHJpbmcgfCBudW1iZXIsIG9wdGlvbnM/OiB7IGhpZ2hDb250cmFzdD86IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgYmFzZUNvbG9yID0gZ2V0Q29sb3JGb3JDbGFzcyhsYWJlbENsYXNzKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAob3B0aW9ucz8uaGlnaENvbnRyYXN0IHx8IHRoaXMudXNlSGlnaENvbnRyYXN0KSB7XHJcbiAgICAgICAgICAgIC8vIFJldHVybiBoaWdoIGNvbnRyYXN0IHZlcnNpb24gb2YgY29sb3JcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SGlnaENvbnRyYXN0Q29sb3IoYmFzZUNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGJhc2VDb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYSBoaWdoIGNvbnRyYXN0IHZlcnNpb24gb2YgYSBjb2xvclxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldEhpZ2hDb250cmFzdENvbG9yKGNvbG9yOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIC8vIFNpbXBsZSBoaWdoIGNvbnRyYXN0IGltcGxlbWVudGF0aW9uXHJcbiAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3UgbWlnaHQgdXNlIGNvbG9yIHRoZW9yeSBhbGdvcml0aG1zXHJcbiAgICAgICAgY29uc3QgbHVtaW5hbmNlID0gdGhpcy5nZXRDb2xvckx1bWluYW5jZShjb2xvcik7XHJcbiAgICAgICAgcmV0dXJuIGx1bWluYW5jZSA+IDAuNSA/ICcjMDAwMDAwJyA6ICcjZmZmZmZmJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgY29sb3IgbHVtaW5hbmNlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0Q29sb3JMdW1pbmFuY2UoaGV4OiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSGV4ID0gaGV4LnJlcGxhY2UoJyMnLCAnJyk7XHJcbiAgICAgICAgY29uc3QgciA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZygwLCAyKSwgMTYpIC8gMjU1O1xyXG4gICAgICAgIGNvbnN0IGcgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoMiwgNCksIDE2KSAvIDI1NTtcclxuICAgICAgICBjb25zdCBiID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDQsIDYpLCAxNikgLyAyNTU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIDAuMjk5ICogciArIDAuNTg3ICogZyArIDAuMTE0ICogYjtcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBWYWxpZGF0aW9uIFV0aWxpdHkgTW9kdWxlXHJcbiAqIFxyXG4gKiBQcm92aWRlcyBpbnB1dCB2YWxpZGF0aW9uIGZ1bmN0aW9ucyBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgc2hvd1RvYXN0LCBzaG93RXJyb3JUb2FzdCB9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGlvbiByZXN1bHQgaW50ZXJmYWNlXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaXNWYWxpZDogYm9vbGVhbjtcclxuICAgIHZhbHVlPzogc3RyaW5nIHwgbnVtYmVyO1xyXG4gICAgZXJyb3JNZXNzYWdlPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGxhYmVsIGNsYXNzIGlucHV0IGZyb20gdXNlclxyXG4gKiBAcGFyYW0gaW5wdXQgLSBSYXcgaW5wdXQgZnJvbSB1c2VyIChjYW4gYmUgbnVsbCBpZiBjYW5jZWxsZWQpXHJcbiAqIEByZXR1cm5zIFZhbGlkYXRlZCBjbGFzcyBzdHJpbmcgb3IgbnVsbCBpZiBpbnZhbGlkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVMYWJlbENsYXNzKGlucHV0OiBzdHJpbmcgfCBudWxsKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBpZiAoaW5wdXQgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDsgLy8gVXNlciBjYW5jZWxsZWQgcHJvbXB0XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHJpbW1lZElucHV0ID0gaW5wdXQudHJpbSgpO1xyXG4gICAgXHJcbiAgICBpZiAodHJpbW1lZElucHV0ID09PSAnJykge1xyXG4gICAgICAgIHNob3dUb2FzdCgnTGFiZWwgY2xhc3MgY2Fubm90IGJlIGVtcHR5LicsIDMwMDApO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG51bSA9IE51bWJlcih0cmltbWVkSW5wdXQpO1xyXG5cclxuICAgIGlmIChpc05hTihudW0pIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG51bSkgfHwgbnVtIDwgMCB8fCBudW0gPiAxMDAwMCkge1xyXG4gICAgICAgIHNob3dUb2FzdCgnSW52YWxpZCBMYWJlbDogUGxlYXNlIGVudGVyIGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCAxMDAwMC4nLCA0MDAwKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nKG51bSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZHZhbmNlZCBsYWJlbCBjbGFzcyB2YWxpZGF0aW9uIHdpdGggZGV0YWlsZWQgcmVzdWx0XHJcbiAqIEBwYXJhbSBpbnB1dCAtIFJhdyBpbnB1dCB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBEZXRhaWxlZCB2YWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTGFiZWxDbGFzc0FkdmFuY2VkKGlucHV0OiBzdHJpbmcgfCBudWxsKTogVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBpZiAoaW5wdXQgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnSW5wdXQgd2FzIGNhbmNlbGxlZCdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRyaW1tZWRJbnB1dCA9IGlucHV0LnRyaW0oKTtcclxuICAgIFxyXG4gICAgaWYgKHRyaW1tZWRJbnB1dCA9PT0gJycpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgY2Fubm90IGJlIGVtcHR5J1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbnVtID0gTnVtYmVyKHRyaW1tZWRJbnB1dCk7XHJcblxyXG4gICAgaWYgKGlzTmFOKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgbXVzdCBiZSBhIG51bWJlcidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihudW0pKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0xhYmVsIGNsYXNzIG11c3QgYmUgYW4gaW50ZWdlcidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChudW0gPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0xhYmVsIGNsYXNzIGNhbm5vdCBiZSBuZWdhdGl2ZSdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChudW0gPiAxMDAwMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBjYW5ub3QgZXhjZWVkIDEwMDAwJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHZhbHVlOiBTdHJpbmcobnVtKVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBmaWxlIG5hbWUgZm9yIHNhZmV0eVxyXG4gKiBAcGFyYW0gZmlsZU5hbWUgLSBGaWxlIG5hbWUgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIWZpbGVOYW1lIHx8IGZpbGVOYW1lLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGludmFsaWQgY2hhcmFjdGVyc1xyXG4gICAgY29uc3QgaW52YWxpZENoYXJzID0gL1s8PjpcIi9cXFxcfD8qXS87XHJcbiAgICBpZiAoaW52YWxpZENoYXJzLnRlc3QoZmlsZU5hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvciByZXNlcnZlZCBuYW1lcyAoV2luZG93cylcclxuICAgIGNvbnN0IHJlc2VydmVkTmFtZXMgPSAvXihDT058UFJOfEFVWHxOVUx8Q09NWzEtOV18TFBUWzEtOV0pJC9pO1xyXG4gICAgaWYgKHJlc2VydmVkTmFtZXMudGVzdChmaWxlTmFtZSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgaW1hZ2UgZmlsZSBleHRlbnNpb25cclxuICogQHBhcmFtIGZpbGVOYW1lIC0gRmlsZSBuYW1lIHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgaW1hZ2UgZXh0ZW5zaW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVJbWFnZUV4dGVuc2lvbihmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCB2YWxpZEV4dGVuc2lvbnMgPSBbJy5qcGcnLCAnLmpwZWcnLCAnLnBuZycsICcuYm1wJywgJy50aWZmJywgJy50aWYnLCAnLndlYnAnXTtcclxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGZpbGVOYW1lLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykpO1xyXG4gICAgcmV0dXJuIHZhbGlkRXh0ZW5zaW9ucy5pbmNsdWRlcyhleHRlbnNpb24pO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGNvb3JkaW5hdGUgdmFsdWVzIGZvciBib3VuZGluZyBib3hlc1xyXG4gKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0geSAtIFkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0gd2lkdGggLSBXaWR0aFxyXG4gKiBAcGFyYW0gaGVpZ2h0IC0gSGVpZ2h0XHJcbiAqIEByZXR1cm5zIFZhbGlkYXRpb24gcmVzdWx0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVCb3VuZGluZ0JveChcclxuICAgIHg6IG51bWJlciwgXHJcbiAgICB5OiBudW1iZXIsIFxyXG4gICAgd2lkdGg6IG51bWJlciwgXHJcbiAgICBoZWlnaHQ6IG51bWJlclxyXG4pOiBWYWxpZGF0aW9uUmVzdWx0IHtcclxuICAgIGlmIChpc05hTih4KSB8fCBpc05hTih5KSB8fCBpc05hTih3aWR0aCkgfHwgaXNOYU4oaGVpZ2h0KSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdBbGwgY29vcmRpbmF0ZXMgbXVzdCBiZSB2YWxpZCBudW1iZXJzJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdpZHRoIDw9IDAgfHwgaGVpZ2h0IDw9IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnV2lkdGggYW5kIGhlaWdodCBtdXN0IGJlIHBvc2l0aXZlJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHggPCAwIHx8IHkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0Nvb3JkaW5hdGVzIGNhbm5vdCBiZSBuZWdhdGl2ZSdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNWYWxpZDogdHJ1ZVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBZT0xPIGZvcm1hdCBjb29yZGluYXRlcyAobm9ybWFsaXplZCAwLTEpXHJcbiAqIEBwYXJhbSBjZW50ZXJYIC0gTm9ybWFsaXplZCBjZW50ZXIgWCAoMC0xKVxyXG4gKiBAcGFyYW0gY2VudGVyWSAtIE5vcm1hbGl6ZWQgY2VudGVyIFkgKDAtMSlcclxuICogQHBhcmFtIHdpZHRoIC0gTm9ybWFsaXplZCB3aWR0aCAoMC0xKVxyXG4gKiBAcGFyYW0gaGVpZ2h0IC0gTm9ybWFsaXplZCBoZWlnaHQgKDAtMSlcclxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVlPTE9Db29yZGluYXRlcyhcclxuICAgIGNlbnRlclg6IG51bWJlcixcclxuICAgIGNlbnRlclk6IG51bWJlcixcclxuICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICBoZWlnaHQ6IG51bWJlclxyXG4pOiBWYWxpZGF0aW9uUmVzdWx0IHtcclxuICAgIGlmIChpc05hTihjZW50ZXJYKSB8fCBpc05hTihjZW50ZXJZKSB8fCBpc05hTih3aWR0aCkgfHwgaXNOYU4oaGVpZ2h0KSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdBbGwgWU9MTyBjb29yZGluYXRlcyBtdXN0IGJlIHZhbGlkIG51bWJlcnMnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2VudGVyWCA8IDAgfHwgY2VudGVyWCA+IDEgfHwgY2VudGVyWSA8IDAgfHwgY2VudGVyWSA+IDEpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnQ2VudGVyIGNvb3JkaW5hdGVzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdpZHRoIDw9IDAgfHwgd2lkdGggPiAxIHx8IGhlaWdodCA8PSAwIHx8IGhlaWdodCA+IDEpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnV2lkdGggYW5kIGhlaWdodCBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMSdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNWYWxpZDogdHJ1ZVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyB6b29tIGxldmVsXHJcbiAqIEBwYXJhbSB6b29tIC0gWm9vbSBsZXZlbCB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIHpvb20gbGV2ZWxcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVpvb21MZXZlbCh6b29tOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhaXNOYU4oem9vbSkgJiYgem9vbSA+IDAuMSAmJiB6b29tIDw9IDEwO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGZvbnQgc2l6ZSBmb3IgbGFiZWxzXHJcbiAqIEBwYXJhbSBmb250U2l6ZSAtIEZvbnQgc2l6ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIGZvbnQgc2l6ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRm9udFNpemUoZm9udFNpemU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICFpc05hTihmb250U2l6ZSkgJiYgZm9udFNpemUgPj0gOCAmJiBmb250U2l6ZSA8PSA3MjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYWwgcHVycG9zZSBudW1iZXIgdmFsaWRhdGlvblxyXG4gKiBAcGFyYW0gdmFsdWUgLSBWYWx1ZSB0byB2YWxpZGF0ZVxyXG4gKiBAcGFyYW0gbWluIC0gTWluaW11bSBhbGxvd2VkIHZhbHVlXHJcbiAqIEBwYXJhbSBtYXggLSBNYXhpbXVtIGFsbG93ZWQgdmFsdWVcclxuICogQHBhcmFtIGFsbG93RmxvYXQgLSBXaGV0aGVyIHRvIGFsbG93IGZsb2F0aW5nIHBvaW50IG51bWJlcnNcclxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU51bWJlcihcclxuICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIsXHJcbiAgICBtaW4/OiBudW1iZXIsXHJcbiAgICBtYXg/OiBudW1iZXIsXHJcbiAgICBhbGxvd0Zsb2F0OiBib29sZWFuID0gdHJ1ZVxyXG4pOiBWYWxpZGF0aW9uUmVzdWx0IHtcclxuICAgIGNvbnN0IG51bSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyBOdW1iZXIodmFsdWUpIDogdmFsdWU7XHJcblxyXG4gICAgaWYgKGlzTmFOKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnVmFsdWUgbXVzdCBiZSBhIHZhbGlkIG51bWJlcidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghYWxsb3dGbG9hdCAmJiAhTnVtYmVyLmlzSW50ZWdlcihudW0pKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ1ZhbHVlIG11c3QgYmUgYW4gaW50ZWdlcidcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtaW4gIT09IHVuZGVmaW5lZCAmJiBudW0gPCBtaW4pIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVmFsdWUgbXVzdCBiZSBhdCBsZWFzdCAke21pbn1gXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobWF4ICE9PSB1bmRlZmluZWQgJiYgbnVtID4gbWF4KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFZhbHVlIGNhbm5vdCBleGNlZWQgJHttYXh9YFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxyXG4gICAgICAgIHZhbHVlOiBudW1cclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgZW1haWwgZm9ybWF0XHJcbiAqIEBwYXJhbSBlbWFpbCAtIEVtYWlsIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgZW1haWwgZm9ybWF0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFbWFpbChlbWFpbDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XHJcbiAgICByZXR1cm4gZW1haWxSZWdleC50ZXN0KGVtYWlsKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBVUkwgZm9ybWF0XHJcbiAqIEBwYXJhbSB1cmwgLSBVUkwgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBVUkwgZm9ybWF0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbmV3IFVSTCh1cmwpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2FuaXRpemVzIHN0cmluZyBpbnB1dCB0byBwcmV2ZW50IFhTU1xyXG4gKiBAcGFyYW0gaW5wdXQgLSBJbnB1dCBzdHJpbmcgdG8gc2FuaXRpemVcclxuICogQHJldHVybnMgU2FuaXRpemVkIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplSW5wdXQoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gaW5wdXRcclxuICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG4gICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxyXG4gICAgICAgIC5yZXBsYWNlKC8nL2csICcmI3gyNzsnKTtcclxufSIsIi8qKlxyXG4gKiBOb3RpZmljYXRpb25zIFV0aWxpdHkgTW9kdWxlXHJcbiAqIFxyXG4gKiBIYW5kbGVzIHVzZXIgbm90aWZpY2F0aW9uIHN5c3RlbSBpbmNsdWRpbmcgdG9hc3QgbWVzc2FnZXMgYW5kIGFsZXJ0cy5cclxuICovXHJcblxyXG4vKipcclxuICogU2hvd3MgYSB0b2FzdCBub3RpZmljYXRpb24gbWVzc2FnZSB0byB0aGUgdXNlclxyXG4gKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGRpc3BsYXlcclxuICogQHBhcmFtIGR1cmF0aW9uIC0gRHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIChkZWZhdWx0OiAzMDAwbXMpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1RvYXN0KG1lc3NhZ2U6IHN0cmluZywgZHVyYXRpb246IG51bWJlciA9IDMwMDApOiB2b2lkIHtcclxuICAgIGNvbnN0IHRvYXN0Q29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvYXN0LWNvbnRhaW5lcicpO1xyXG4gICAgaWYgKCF0b2FzdENvbnRhaW5lcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignVG9hc3QgY29udGFpbmVyIG5vdCBmb3VuZC4gTWVzc2FnZTonLCBtZXNzYWdlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHRvYXN0LmNsYXNzTmFtZSA9ICd0b2FzdC1tZXNzYWdlJztcclxuICAgIHRvYXN0LnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgIHRvYXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKHRvYXN0KTtcclxuXHJcbiAgICAvLyBTaG93IHRvYXN0IHdpdGggc2xpZ2h0IGRlbGF5IGZvciBhbmltYXRpb25cclxuICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QuY2xhc3NMaXN0LmFkZCgnc2hvdycpLCAxMCk7XHJcblxyXG4gICAgLy8gSGlkZSBhbmQgcmVtb3ZlIHRvYXN0IGFmdGVyIGR1cmF0aW9uXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0b2FzdC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0b2FzdC5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0b2FzdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDMwMCk7IC8vIFdhaXQgZm9yIGZhZGUtb3V0IGFuaW1hdGlvblxyXG4gICAgfSwgZHVyYXRpb24pO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYW4gZXJyb3IgdG9hc3Qgd2l0aCBsb25nZXIgZHVyYXRpb25cclxuICogQHBhcmFtIG1lc3NhZ2UgLSBFcnJvciBtZXNzYWdlIHRvIGRpc3BsYXlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3JUb2FzdChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHNob3dUb2FzdChtZXNzYWdlLCA0MDAwKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNob3dzIGEgc3VjY2VzcyB0b2FzdCB3aXRoIHN0YW5kYXJkIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gU3VjY2VzcyBtZXNzYWdlIHRvIGRpc3BsYXlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93U3VjY2Vzc1RvYXN0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgc2hvd1RvYXN0KG1lc3NhZ2UsIDIwMDApO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYSB3YXJuaW5nIHRvYXN0XHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gV2FybmluZyBtZXNzYWdlIHRvIGRpc3BsYXlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93V2FybmluZ1RvYXN0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgc2hvd1RvYXN0KG1lc3NhZ2UsIDM1MDApO1xyXG59XHJcblxyXG4vKipcclxuICogVG9hc3QgbWVzc2FnZSB0eXBlcyBmb3IgdHlwZSBzYWZldHlcclxuICovXHJcbmV4cG9ydCB0eXBlIFRvYXN0VHlwZSA9ICdzdWNjZXNzJyB8ICdlcnJvcicgfCAnd2FybmluZycgfCAnaW5mbyc7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBmb3IgdG9hc3Qgbm90aWZpY2F0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUb2FzdENvbmZpZyB7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbiAgICB0eXBlOiBUb2FzdFR5cGU7XHJcbiAgICBkdXJhdGlvbj86IG51bWJlcjtcclxuICAgIGRpc21pc3NpYmxlPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNob3dzIGEgdHlwZWQgdG9hc3Qgbm90aWZpY2F0aW9uXHJcbiAqIEBwYXJhbSBjb25maWcgLSBUb2FzdCBjb25maWd1cmF0aW9uIG9iamVjdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dUeXBlZFRvYXN0KGNvbmZpZzogVG9hc3RDb25maWcpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgbWVzc2FnZSwgdHlwZSwgZHVyYXRpb24sIGRpc21pc3NpYmxlID0gZmFsc2UgfSA9IGNvbmZpZztcclxuICAgIFxyXG4gICAgY29uc3QgZGVmYXVsdER1cmF0aW9uczogUmVjb3JkPFRvYXN0VHlwZSwgbnVtYmVyPiA9IHtcclxuICAgICAgICBzdWNjZXNzOiAyMDAwLFxyXG4gICAgICAgIGVycm9yOiA0MDAwLFxyXG4gICAgICAgIHdhcm5pbmc6IDM1MDAsXHJcbiAgICAgICAgaW5mbzogMzAwMFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB0b2FzdER1cmF0aW9uID0gZHVyYXRpb24gPz8gZGVmYXVsdER1cmF0aW9uc1t0eXBlXTtcclxuICAgIFxyXG4gICAgaWYgKGRpc21pc3NpYmxlKSB7XHJcbiAgICAgICAgLy8gRm9yIGRpc21pc3NpYmxlIHRvYXN0cywgd2UgY291bGQgYWRkIGNsb3NlIGJ1dHRvbiBsb2dpYyBoZXJlXHJcbiAgICAgICAgc2hvd1RvYXN0KGAke21lc3NhZ2V9IFtEaXNtaXNzaWJsZV1gLCB0b2FzdER1cmF0aW9uKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2hvd1RvYXN0KG1lc3NhZ2UsIHRvYXN0RHVyYXRpb24pO1xyXG4gICAgfVxyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvKipcclxuICogQXBwU3RhdGUgTW9kZWwgLSBNYWluIEFwcGxpY2F0aW9uIFN0YXRlIE1hbmFnZW1lbnRcclxuICogXHJcbiAqIENlbnRyYWxpemVkIHN0YXRlIG1hbmFnZW1lbnQgZm9yIHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBIYW5kbGVzIGFsbCBhcHBsaWNhdGlvbiBzdGF0ZSBpbmNsdWRpbmcgZmlsZXMsIFVJIHNldHRpbmdzLCBjYWNoZSwgYW5kIGN1cnJlbnQgd29ya3NwYWNlLlxyXG4gKiBcclxuICogQHZlcnNpb24gMS4wLjBcclxuICogQGF1dGhvciBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgXHJcbiAgTW9kZSwgXHJcbiAgTGFiZWxTb3J0T3JkZXIsIFxyXG4gIFBvaW50LFxyXG4gIEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUsIFxyXG4gIEZpbGVTeXN0ZW1GaWxlSGFuZGxlXHJcbn0gZnJvbSAnLi4vdHlwZXMnO1xyXG5cclxuaW1wb3J0IHtcclxuICBJQXBwU3RhdGUsXHJcbiAgQXBwU3RhdGVDb25maWcsXHJcbiAgQXBwU3RhdGVNZXRob2RzLFxyXG4gIEFwcFN0YXRlRXZlbnQsXHJcbiAgQXBwU3RhdGVFdmVudEhhbmRsZXIsXHJcbiAgSW1hZ2VGaWxlLFxyXG4gIENsYXNzRmlsZSxcclxuICBDbGFzc0RlZmluaXRpb24sXHJcbiAgQ2xpcGJvYXJkRGF0YSxcclxuICBMb2FkVG9rZW4sXHJcbiAgQXBwU3RhdGVWYWxpZGF0aW9uLFxyXG4gIFNlcmlhbGl6YWJsZUFwcFN0YXRlXHJcbn0gZnJvbSAnLi4vdHlwZXMvYXBwLXN0YXRlJztcclxuXHJcbi8qKlxyXG4gKiBBcHBTdGF0ZSBDbGFzc1xyXG4gKiBcclxuICogSW1wbGVtZW50cyB0aGUgY29tcGxldGUgYXBwbGljYXRpb24gc3RhdGUgbWFuYWdlbWVudCB3aXRoIHR5cGUgc2FmZXR5LlxyXG4gKiBQcm92aWRlcyBtZXRob2RzIGZvciBtYW5hZ2luZyBmaWxlcywgVUkgc3RhdGUsIGNhY2hlLCBhbmQgdXNlciBpbnRlcmFjdGlvbnMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQXBwU3RhdGUgaW1wbGVtZW50cyBJQXBwU3RhdGUge1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWxlIEhhbmRsZXMgKEZpbGUgU3lzdGVtIEFjY2VzcyBBUEkpXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBpbWFnZUZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBsYWJlbEZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBjbGFzc0luZm9Gb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgRGF0YSBBcnJheXNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGltYWdlRmlsZXM6IEltYWdlRmlsZVtdID0gW107XHJcbiAgcHVibGljIGNsYXNzRmlsZXM6IENsYXNzRmlsZVtdID0gW107XHJcbiAgcHVibGljIHNlbGVjdGVkQ2xhc3NGaWxlOiBDbGFzc0ZpbGUgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFN0YXR1cyBUcmFja2luZyBNYXBzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBpbWFnZUxhYmVsU3RhdHVzID0gbmV3IE1hcDxzdHJpbmcsIGJvb2xlYW4+KCk7IC8vIGZpbGVOYW1lIC0+IGhhc0xhYmVsc1xyXG4gIHB1YmxpYyBjbGFzc05hbWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTsgLy8gY2xhc3NJZCAtPiBjbGFzc05hbWVcclxuICBwdWJsaWMgcHJldmlld0ltYWdlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpOyAvLyBmaWxlTmFtZSAtPiBvYmplY3RVUkxcclxuICBwdWJsaWMgY29sbGFwc2VkTGFiZWxHcm91cHMgPSBuZXcgU2V0PHN0cmluZz4oKTsgLy8gY29sbGFwc2VkIGdyb3VwIElEc1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ3VycmVudCBXb3JraW5nIFN0YXRlXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBjdXJyZW50SW1hZ2VGaWxlOiBJbWFnZUZpbGUgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgY3VycmVudEltYWdlOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGN1cnJlbnRNb2RlOiBNb2RlID0gJ2VkaXQnO1xyXG4gIHB1YmxpYyBjdXJyZW50TG9hZFRva2VuOiBMb2FkVG9rZW4gPSAwO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVUkgU2V0dGluZ3MgJiBQcmVmZXJlbmNlc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaXNBdXRvU2F2ZUVuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgc2hvd0xhYmVsc09uQ2FudmFzOiBib29sZWFuID0gdHJ1ZTtcclxuICBwdWJsaWMgbGFiZWxGb250U2l6ZTogbnVtYmVyID0gMTQ7XHJcbiAgcHVibGljIGxhYmVsU29ydE9yZGVyOiBMYWJlbFNvcnRPcmRlciA9ICdhc2MnO1xyXG4gIHB1YmxpYyBpc1ByZXZpZXdCYXJIaWRkZW46IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgaXNDcm9zc2hhaXJWaXNpYmxlOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbnRlcm5hbCBTdGF0ZSAmIFRlbXBvcmFyeSBEYXRhXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBzYXZlVGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgX2NsaXBib2FyZDogQ2xpcGJvYXJkRGF0YSB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBsYXN0TW91c2VQb3NpdGlvbjogUG9pbnQgPSB7IHg6IDAsIHk6IDAgfTtcclxuICBwdWJsaWMgY29udGV4dFRhcmdldDogYW55ID0gbnVsbDtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwcml2YXRlIGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIEFwcFN0YXRlRXZlbnRIYW5kbGVyW10+KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIC0gSW5pdGlhbGl6ZSBBcHBTdGF0ZSB3aXRoIGRlZmF1bHQgdmFsdWVzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAvLyBBbGwgcHJvcGVydGllcyBhcmUgYWxyZWFkeSBpbml0aWFsaXplZCBhYm92ZVxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3N0YXRlOmluaXRpYWxpemVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTdGF0ZSBNYW5hZ2VtZW50IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IGFsbCBzdGF0ZSB0byBpbml0aWFsIHZhbHVlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIC8vIENsZWFyIGZpbGUgaGFuZGxlc1xyXG4gICAgdGhpcy5pbWFnZUZvbGRlckhhbmRsZSA9IG51bGw7XHJcbiAgICB0aGlzLmxhYmVsRm9sZGVySGFuZGxlID0gbnVsbDtcclxuICAgIHRoaXMuY2xhc3NJbmZvRm9sZGVySGFuZGxlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDbGVhciBmaWxlIGFycmF5c1xyXG4gICAgdGhpcy5pbWFnZUZpbGVzID0gW107XHJcbiAgICB0aGlzLmNsYXNzRmlsZXMgPSBbXTtcclxuICAgIHRoaXMuc2VsZWN0ZWRDbGFzc0ZpbGUgPSBudWxsO1xyXG5cclxuICAgIC8vIENsZWFyIG1hcHMgYW5kIHNldHNcclxuICAgIHRoaXMuaW1hZ2VMYWJlbFN0YXR1cy5jbGVhcigpO1xyXG4gICAgdGhpcy5jbGFzc05hbWVzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmNvbGxhcHNlZExhYmVsR3JvdXBzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmNsZWFyUHJldmlld0NhY2hlKCk7XHJcblxyXG4gICAgLy8gUmVzZXQgY3VycmVudCBzdGF0ZVxyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2VGaWxlID0gbnVsbDtcclxuICAgIHRoaXMuY3VycmVudEltYWdlID0gbnVsbDtcclxuICAgIHRoaXMuY3VycmVudE1vZGUgPSAnZWRpdCc7XHJcbiAgICB0aGlzLmN1cnJlbnRMb2FkVG9rZW4gPSAwO1xyXG5cclxuICAgIC8vIFJlc2V0IFVJIHNldHRpbmdzIHRvIGRlZmF1bHRzXHJcbiAgICB0aGlzLmlzQXV0b1NhdmVFbmFibGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLnNob3dMYWJlbHNPbkNhbnZhcyA9IHRydWU7XHJcbiAgICB0aGlzLmxhYmVsRm9udFNpemUgPSAxNDtcclxuICAgIHRoaXMubGFiZWxTb3J0T3JkZXIgPSAnYXNjJztcclxuICAgIHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIENsZWFyIGludGVybmFsIHN0YXRlXHJcbiAgICBpZiAodGhpcy5zYXZlVGltZW91dCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5zYXZlVGltZW91dCk7XHJcbiAgICAgIHRoaXMuc2F2ZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fY2xpcGJvYXJkID0gbnVsbDtcclxuICAgIHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcclxuICAgIHRoaXMuY29udGV4dFRhcmdldCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3N0YXRlOnJlc2V0JyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWxlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgaW1hZ2UgZm9sZGVyIGhhbmRsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJbWFnZUZvbGRlcihoYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiB2b2lkIHtcclxuICAgIHRoaXMuaW1hZ2VGb2xkZXJIYW5kbGUgPSBoYW5kbGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnZm9sZGVyOmltYWdlLXNldCcsXHJcbiAgICAgIGRhdGE6IHsgbmFtZTogaGFuZGxlLm5hbWUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgbGFiZWwgZm9sZGVyIGhhbmRsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMYWJlbEZvbGRlcihoYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiB2b2lkIHtcclxuICAgIHRoaXMubGFiZWxGb2xkZXJIYW5kbGUgPSBoYW5kbGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnZm9sZGVyOmxhYmVsLXNldCcsXHJcbiAgICAgIGRhdGE6IHsgbmFtZTogaGFuZGxlLm5hbWUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY2xhc3MgaW5mbyBmb2xkZXIgaGFuZGxlXHJcbiAgICovXHJcbiAgcHVibGljIHNldENsYXNzSW5mb0ZvbGRlcihoYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiB2b2lkIHtcclxuICAgIHRoaXMuY2xhc3NJbmZvRm9sZGVySGFuZGxlID0gaGFuZGxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ZvbGRlcjpjbGFzcy1pbmZvLXNldCcsXHJcbiAgICAgIGRhdGE6IHsgbmFtZTogaGFuZGxlLm5hbWUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbWFnZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGN1cnJlbnQgd29ya2luZyBpbWFnZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDdXJyZW50SW1hZ2UoaW1hZ2VGaWxlOiBJbWFnZUZpbGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcmV2aW91c0ltYWdlID0gdGhpcy5jdXJyZW50SW1hZ2VGaWxlO1xyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2VGaWxlID0gaW1hZ2VGaWxlO1xyXG4gICAgXHJcbiAgICAvLyBJbmNyZW1lbnQgbG9hZCB0b2tlbiB0byBwcmV2ZW50IHJhY2UgY29uZGl0aW9uc1xyXG4gICAgdGhpcy5jdXJyZW50TG9hZFRva2VuICs9IDE7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ltYWdlOmN1cnJlbnQtY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgXHJcbiAgICAgICAgcHJldmlvdXM6IHByZXZpb3VzSW1hZ2U/Lm5hbWUgfHwgbnVsbCxcclxuICAgICAgICBjdXJyZW50OiBpbWFnZUZpbGU/Lm5hbWUgfHwgbnVsbCxcclxuICAgICAgICBsb2FkVG9rZW46IHRoaXMuY3VycmVudExvYWRUb2tlblxyXG4gICAgICB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGxhYmVsIHN0YXR1cyBmb3IgYW4gaW1hZ2VcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SW1hZ2VMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pbWFnZUxhYmVsU3RhdHVzLmdldChmaWxlTmFtZSkgfHwgZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbGFiZWwgc3RhdHVzIGZvciBhbiBpbWFnZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJbWFnZUxhYmVsU3RhdHVzKGZpbGVOYW1lOiBzdHJpbmcsIGhhc0xhYmVsczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5pbWFnZUxhYmVsU3RhdHVzLnNldChmaWxlTmFtZSwgaGFzTGFiZWxzKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdpbWFnZTpsYWJlbC1zdGF0dXMtY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgZmlsZU5hbWUsIGhhc0xhYmVscyB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIE1vZGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjdXJyZW50IGRyYXdpbmcvZWRpdGluZyBtb2RlXHJcbiAgICovXHJcbiAgcHVibGljIHNldE1vZGUobW9kZTogTW9kZSk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJldmlvdXNNb2RlID0gdGhpcy5jdXJyZW50TW9kZTtcclxuICAgIHRoaXMuY3VycmVudE1vZGUgPSBtb2RlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vZGU6Y2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgcHJldmlvdXM6IHByZXZpb3VzTW9kZSwgY3VycmVudDogbW9kZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIGJldHdlZW4gZHJhdyBhbmQgZWRpdCBtb2Rlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyB0b2dnbGVNb2RlKCk6IHZvaWQge1xyXG4gICAgY29uc3QgbmV3TW9kZTogTW9kZSA9IHRoaXMuY3VycmVudE1vZGUgPT09ICdlZGl0JyA/ICdkcmF3JyA6ICdlZGl0JztcclxuICAgIHRoaXMuc2V0TW9kZShuZXdNb2RlKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDbGFzcyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZWxlY3QgYSBjbGFzcyBmaWxlIGZvciB1c2VcclxuICAgKi9cclxuICBwdWJsaWMgc2VsZWN0Q2xhc3NGaWxlKGNsYXNzRmlsZTogQ2xhc3NGaWxlIHwgbnVsbCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZWxlY3RlZENsYXNzRmlsZSA9IGNsYXNzRmlsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGFzczpmaWxlLXNlbGVjdGVkJyxcclxuICAgICAgZGF0YTogeyBmaWxlTmFtZTogY2xhc3NGaWxlPy5uYW1lIHx8IG51bGwgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIGNsYXNzIGRlZmluaXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgYWRkQ2xhc3NEZWZpbml0aW9uKGNsYXNzRGVmOiBDbGFzc0RlZmluaXRpb24pOiB2b2lkIHtcclxuICAgIHRoaXMuY2xhc3NOYW1lcy5zZXQoY2xhc3NEZWYuaWQudG9TdHJpbmcoKSwgY2xhc3NEZWYubmFtZSk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xhc3M6ZGVmaW5pdGlvbi1hZGRlZCcsXHJcbiAgICAgIGRhdGE6IGNsYXNzRGVmLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgY2xhc3MgZGVmaW5pdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVDbGFzc0RlZmluaXRpb24oY2xhc3NJZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsYXNzTmFtZXMuZGVsZXRlKGNsYXNzSWQudG9TdHJpbmcoKSk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xhc3M6ZGVmaW5pdGlvbi1yZW1vdmVkJyxcclxuICAgICAgZGF0YTogeyBjbGFzc0lkIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU2V0dGluZ3MgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIGF1dG8tc2F2ZSBmdW5jdGlvbmFsaXR5XHJcbiAgICovXHJcbiAgcHVibGljIHNldEF1dG9TYXZlKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQgPSBlbmFibGVkO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3NldHRpbmdzOmF1dG8tc2F2ZS1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBlbmFibGVkIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgbGFiZWwgdmlzaWJpbGl0eSBvbiBjYW52YXNcclxuICAgKi9cclxuICBwdWJsaWMgc2V0U2hvd0xhYmVscyhzaG93OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLnNob3dMYWJlbHNPbkNhbnZhcyA9IHNob3c7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2V0dGluZ3M6c2hvdy1sYWJlbHMtY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgc2hvdyB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGxhYmVsIGZvbnQgc2l6ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMYWJlbEZvbnRTaXplKHNpemU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgaWYgKHNpemUgPj0gOCAmJiBzaXplIDw9IDQ4KSB7XHJcbiAgICAgIHRoaXMubGFiZWxGb250U2l6ZSA9IHNpemU7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ3NldHRpbmdzOmZvbnQtc2l6ZS1jaGFuZ2VkJyxcclxuICAgICAgICBkYXRhOiB7IHNpemUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbGFiZWwgc29ydCBvcmRlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMYWJlbFNvcnRPcmRlcihvcmRlcjogTGFiZWxTb3J0T3JkZXIpOiB2b2lkIHtcclxuICAgIHRoaXMubGFiZWxTb3J0T3JkZXIgPSBvcmRlcjtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZXR0aW5nczpzb3J0LW9yZGVyLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IG9yZGVyIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVUkgU3RhdGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIHByZXZpZXcgYmFyIHZpc2liaWxpdHlcclxuICAgKi9cclxuICBwdWJsaWMgdG9nZ2xlUHJldmlld0JhcigpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuID0gIXRoaXMuaXNQcmV2aWV3QmFySGlkZGVuO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3VpOnByZXZpZXctYmFyLXRvZ2dsZWQnLFxyXG4gICAgICBkYXRhOiB7IGhpZGRlbjogdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBjcm9zc2hhaXIgdmlzaWJpbGl0eVxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b2dnbGVDcm9zc2hhaXIoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZSA9ICF0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICd1aTpjcm9zc2hhaXItdG9nZ2xlZCcsXHJcbiAgICAgIGRhdGE6IHsgdmlzaWJsZTogdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBjb250ZXh0IG1lbnUgdGFyZ2V0XHJcbiAgICovXHJcbiAgcHVibGljIHNldENvbnRleHRUYXJnZXQodGFyZ2V0OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuY29udGV4dFRhcmdldCA9IHRhcmdldDtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICd1aTpjb250ZXh0LXRhcmdldC1zZXQnLFxyXG4gICAgICBkYXRhOiB7IHRhcmdldCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENhY2hlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIENhY2hlIGEgcHJldmlldyBpbWFnZSBPYmplY3RVUkxcclxuICAgKi9cclxuICBwdWJsaWMgY2FjaGVQcmV2aWV3SW1hZ2UoZmlsZU5hbWU6IHN0cmluZywgb2JqZWN0VVJMOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMucHJldmlld0ltYWdlQ2FjaGUuc2V0KGZpbGVOYW1lLCBvYmplY3RVUkwpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NhY2hlOnByZXZpZXctY2FjaGVkJyxcclxuICAgICAgZGF0YTogeyBmaWxlTmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGNhY2hlZCBwcmV2aWV3IGltYWdlIE9iamVjdFVSTFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDYWNoZWRQcmV2aWV3SW1hZ2UoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5nZXQoZmlsZU5hbWUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgYWxsIHByZXZpZXcgY2FjaGVcclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXJQcmV2aWV3Q2FjaGUoKTogdm9pZCB7XHJcbiAgICAvLyBSZXZva2UgYWxsIE9iamVjdFVSTHMgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcclxuICAgIGZvciAoY29uc3Qgb2JqZWN0VVJMIG9mIHRoaXMucHJldmlld0ltYWdlQ2FjaGUudmFsdWVzKCkpIHtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChvYmplY3RVUkwpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5jbGVhcigpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NhY2hlOnByZXZpZXctY2xlYXJlZCcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2xpcGJvYXJkIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBjbGlwYm9hcmQgZGF0YVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDbGlwYm9hcmQoZGF0YTogQ2xpcGJvYXJkRGF0YSk6IHZvaWQge1xyXG4gICAgdGhpcy5fY2xpcGJvYXJkID0gZGF0YTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGlwYm9hcmQ6ZGF0YS1zZXQnLFxyXG4gICAgICBkYXRhOiB7IHR5cGU6IGRhdGEudHlwZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGNsaXBib2FyZCBkYXRhXHJcbiAgICovXHJcbiAgcHVibGljIGdldENsaXBib2FyZCgpOiBDbGlwYm9hcmREYXRhIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2xpcGJvYXJkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgY2xpcGJvYXJkXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyQ2xpcGJvYXJkKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fY2xpcGJvYXJkID0gbnVsbDtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGlwYm9hcmQ6Y2xlYXJlZCcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgU3lzdGVtIEltcGxlbWVudGF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cclxuICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEFwcFN0YXRlRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIFtdKTtcclxuICAgIH1cclxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpIS5wdXNoKGhhbmRsZXIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBBcHBTdGF0ZUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcGF0Y2ggZXZlbnQgdG8gYWxsIGxpc3RlbmVyc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNwYXRjaEV2ZW50KGV2ZW50OiBBcHBTdGF0ZUV2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBldmVudCBoYW5kbGVyIGZvciAke2V2ZW50LnR5cGV9OmAsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFV0aWxpdHkgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogVmFsaWRhdGUgY3VycmVudCBzdGF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyB2YWxpZGF0ZSgpOiBBcHBTdGF0ZVZhbGlkYXRpb24ge1xyXG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIHJlcXVpcmVkIGZvbGRlcnNcclxuICAgIGlmICghdGhpcy5pbWFnZUZvbGRlckhhbmRsZSkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdObyBpbWFnZSBmb2xkZXIgc2VsZWN0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMubGFiZWxGb2xkZXJIYW5kbGUpIHtcclxuICAgICAgd2FybmluZ3MucHVzaCgnTm8gbGFiZWwgZm9sZGVyIHNlbGVjdGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9udCBzaXplIHJhbmdlXHJcbiAgICBpZiAodGhpcy5sYWJlbEZvbnRTaXplIDwgOCB8fCB0aGlzLmxhYmVsRm9udFNpemUgPiA0OCkge1xyXG4gICAgICBlcnJvcnMucHVzaCgnTGFiZWwgZm9udCBzaXplIG11c3QgYmUgYmV0d2VlbiA4IGFuZCA0OCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvciBtZW1vcnkgbGVha3MgaW4gY2FjaGVcclxuICAgIGlmICh0aGlzLnByZXZpZXdJbWFnZUNhY2hlLnNpemUgPiAxMDApIHtcclxuICAgICAgd2FybmluZ3MucHVzaCgnUHJldmlldyBjYWNoZSBpcyBsYXJnZSwgY29uc2lkZXIgY2xlYXJpbmcnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgICBlcnJvcnMsXHJcbiAgICAgIHdhcm5pbmdzXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHNlcmlhbGl6YWJsZSBzdGF0ZSAoZm9yIHBlcnNpc3RlbmNlKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTZXJpYWxpemFibGVTdGF0ZSgpOiBTZXJpYWxpemFibGVBcHBTdGF0ZSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjdXJyZW50TW9kZTogdGhpcy5jdXJyZW50TW9kZSxcclxuICAgICAgaXNBdXRvU2F2ZUVuYWJsZWQ6IHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQsXHJcbiAgICAgIHNob3dMYWJlbHNPbkNhbnZhczogdGhpcy5zaG93TGFiZWxzT25DYW52YXMsXHJcbiAgICAgIGxhYmVsRm9udFNpemU6IHRoaXMubGFiZWxGb250U2l6ZSxcclxuICAgICAgbGFiZWxTb3J0T3JkZXI6IHRoaXMubGFiZWxTb3J0T3JkZXIsXHJcbiAgICAgIGlzUHJldmlld0JhckhpZGRlbjogdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4sXHJcbiAgICAgIGlzQ3Jvc3NoYWlyVmlzaWJsZTogdGhpcy5pc0Nyb3NzaGFpclZpc2libGVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0b3JlIGZyb20gc2VyaWFsaXphYmxlIHN0YXRlXHJcbiAgICovXHJcbiAgcHVibGljIHJlc3RvcmVGcm9tU2VyaWFsaXphYmxlU3RhdGUoc3RhdGU6IFNlcmlhbGl6YWJsZUFwcFN0YXRlKTogdm9pZCB7XHJcbiAgICB0aGlzLmN1cnJlbnRNb2RlID0gc3RhdGUuY3VycmVudE1vZGU7XHJcbiAgICB0aGlzLmlzQXV0b1NhdmVFbmFibGVkID0gc3RhdGUuaXNBdXRvU2F2ZUVuYWJsZWQ7XHJcbiAgICB0aGlzLnNob3dMYWJlbHNPbkNhbnZhcyA9IHN0YXRlLnNob3dMYWJlbHNPbkNhbnZhcztcclxuICAgIHRoaXMubGFiZWxGb250U2l6ZSA9IHN0YXRlLmxhYmVsRm9udFNpemU7XHJcbiAgICB0aGlzLmxhYmVsU29ydE9yZGVyID0gc3RhdGUubGFiZWxTb3J0T3JkZXI7XHJcbiAgICB0aGlzLmlzUHJldmlld0JhckhpZGRlbiA9IHN0YXRlLmlzUHJldmlld0JhckhpZGRlbjtcclxuICAgIHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlID0gc3RhdGUuaXNDcm9zc2hhaXJWaXNpYmxlO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzdGF0ZTpyZXN0b3JlZCcsXHJcbiAgICAgIGRhdGE6IHN0YXRlLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGRlYnVnIGluZm9ybWF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGdldERlYnVnSW5mbygpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGltYWdlRmlsZXNDb3VudDogdGhpcy5pbWFnZUZpbGVzLmxlbmd0aCxcclxuICAgICAgY2xhc3NGaWxlc0NvdW50OiB0aGlzLmNsYXNzRmlsZXMubGVuZ3RoLFxyXG4gICAgICBpbWFnZUxhYmVsU3RhdHVzQ291bnQ6IHRoaXMuaW1hZ2VMYWJlbFN0YXR1cy5zaXplLFxyXG4gICAgICBjbGFzc05hbWVzQ291bnQ6IHRoaXMuY2xhc3NOYW1lcy5zaXplLFxyXG4gICAgICBwcmV2aWV3Q2FjaGVTaXplOiB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLnNpemUsXHJcbiAgICAgIGNvbGxhcHNlZEdyb3Vwc0NvdW50OiB0aGlzLmNvbGxhcHNlZExhYmVsR3JvdXBzLnNpemUsXHJcbiAgICAgIGN1cnJlbnRMb2FkVG9rZW46IHRoaXMuY3VycmVudExvYWRUb2tlbixcclxuICAgICAgaGFzSW1hZ2VGb2xkZXI6ICEhdGhpcy5pbWFnZUZvbGRlckhhbmRsZSxcclxuICAgICAgaGFzTGFiZWxGb2xkZXI6ICEhdGhpcy5sYWJlbEZvbGRlckhhbmRsZSxcclxuICAgICAgaGFzQ2xhc3NJbmZvRm9sZGVyOiAhIXRoaXMuY2xhc3NJbmZvRm9sZGVySGFuZGxlLFxyXG4gICAgICBjdXJyZW50SW1hZ2VOYW1lOiB0aGlzLmN1cnJlbnRJbWFnZUZpbGU/Lm5hbWUgfHwgbnVsbCxcclxuICAgICAgc2VsZWN0ZWRDbGFzc0ZpbGVOYW1lOiB0aGlzLnNlbGVjdGVkQ2xhc3NGaWxlPy5uYW1lIHx8IG51bGwsXHJcbiAgICAgIGV2ZW50TGlzdGVuZXJUeXBlczogQXJyYXkuZnJvbSh0aGlzLmV2ZW50TGlzdGVuZXJzLmtleXMoKSlcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZhY3RvcnkgRnVuY3Rpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBBcHBTdGF0ZSBpbnN0YW5jZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFwcFN0YXRlKCk6IEFwcFN0YXRlIHtcclxuICByZXR1cm4gbmV3IEFwcFN0YXRlKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgQXBwU3RhdGUgd2l0aCBpbml0aWFsIGNvbmZpZ3VyYXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBcHBTdGF0ZVdpdGhDb25maWcoY29uZmlnOiBQYXJ0aWFsPEFwcFN0YXRlQ29uZmlnPik6IEFwcFN0YXRlIHtcclxuICBjb25zdCBhcHBTdGF0ZSA9IG5ldyBBcHBTdGF0ZSgpO1xyXG4gIFxyXG4gIC8vIEFwcGx5IGNvbmZpZ3VyYXRpb25cclxuICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goa2V5ID0+IHtcclxuICAgIGlmIChrZXkgaW4gYXBwU3RhdGUpIHtcclxuICAgICAgKGFwcFN0YXRlIGFzIGFueSlba2V5XSA9IChjb25maWcgYXMgYW55KVtrZXldO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gYXBwU3RhdGU7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRXhwb3J0c1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcHBTdGF0ZTtcclxuZXhwb3J0IHR5cGUgeyBJQXBwU3RhdGUsIEFwcFN0YXRlQ29uZmlnLCBBcHBTdGF0ZU1ldGhvZHMgfTsiLCIvKipcclxuICogRmlsZVN5c3RlbSBTZXJ2aWNlIFR5cGUgRGVmaW5pdGlvbnNcclxuICogXHJcbiAqIFR5cGVzIGZvciBmaWxlIEkvTyBvcGVyYXRpb25zLCBZT0xPIGZvcm1hdCBoYW5kbGluZywgYW5kIEZpbGUgU3lzdGVtIEFjY2VzcyBBUEkgaW50ZWdyYXRpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgRmlsZVN5c3RlbUZpbGVIYW5kbGUgfSBmcm9tICcuL2luZGV4JztcclxuaW1wb3J0IHsgSW1hZ2VGaWxlLCBDbGFzc0ZpbGUsIENsYXNzRGVmaW5pdGlvbiB9IGZyb20gJy4vYXBwLXN0YXRlJztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmlsZSBPcGVyYXRpb25zXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRmlsZU9wZXJhdGlvblJlc3VsdDxUID0gdm9pZD4ge1xyXG4gIHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgZGF0YT86IFQ7XHJcbiAgZXJyb3I/OiBzdHJpbmc7XHJcbiAgbWVzc2FnZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlTG9hZFJlc3VsdCB7XHJcbiAgY29udGVudDogc3RyaW5nO1xyXG4gIGZpbGU6IEZpbGU7XHJcbiAgbGFzdE1vZGlmaWVkOiBEYXRlO1xyXG4gIHNpemU6IG51bWJlcjtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBZT0xPIEZvcm1hdCBUeXBlc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFlvbG9MYWJlbCB7XHJcbiAgY2xhc3NJZDogbnVtYmVyO1xyXG4gIGNlbnRlclg6IG51bWJlcjtcclxuICBjZW50ZXJZOiBudW1iZXI7XHJcbiAgd2lkdGg6IG51bWJlcjtcclxuICBoZWlnaHQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBZb2xvUGFyc2VSZXN1bHQge1xyXG4gIGxhYmVsczogWW9sb0xhYmVsW107XHJcbiAgZXJyb3JzOiBzdHJpbmdbXTtcclxuICB3YXJuaW5nczogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgWW9sb0V4cG9ydE9wdGlvbnMge1xyXG4gIHByZWNpc2lvbj86IG51bWJlcjtcclxuICBpbmNsdWRlQ29tbWVudHM/OiBib29sZWFuO1xyXG4gIHZhbGlkYXRlQm91bmRzPzogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBDbGFzcyBGaWxlIFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xhc3NGaWxlQ29udGVudCB7XHJcbiAgY2xhc3NlczogQ2xhc3NEZWZpbml0aW9uW107XHJcbiAgbWV0YWRhdGE/OiB7XHJcbiAgICB2ZXJzaW9uPzogc3RyaW5nO1xyXG4gICAgY3JlYXRlZD86IERhdGU7XHJcbiAgICBtb2RpZmllZD86IERhdGU7XHJcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENsYXNzRmlsZVZhbGlkYXRpb24ge1xyXG4gIGlzVmFsaWQ6IGJvb2xlYW47XHJcbiAgZXJyb3JzOiBzdHJpbmdbXTtcclxuICB3YXJuaW5nczogc3RyaW5nW107XHJcbiAgZHVwbGljYXRlSWRzOiBudW1iZXJbXTtcclxuICBlbXB0eU5hbWVzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGb2xkZXIgT3BlcmF0aW9uc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZvbGRlclNjYW5SZXN1bHQge1xyXG4gIGltYWdlRmlsZXM6IEltYWdlRmlsZVtdO1xyXG4gIGxhYmVsRmlsZXM6IHN0cmluZ1tdO1xyXG4gIGNsYXNzRmlsZXM6IENsYXNzRmlsZVtdO1xyXG4gIHRvdGFsRmlsZXM6IG51bWJlcjtcclxuICBlcnJvcnM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIExhYmVsU3RhdHVzIHtcclxuICBmaWxlTmFtZTogc3RyaW5nO1xyXG4gIGhhc0xhYmVsczogYm9vbGVhbjtcclxuICBsYWJlbENvdW50OiBudW1iZXI7XHJcbiAgbGFzdE1vZGlmaWVkPzogRGF0ZTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBJbWFnZSBQcm9jZXNzaW5nXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VMb2FkT3B0aW9ucyB7XHJcbiAgbWF4V2lkdGg/OiBudW1iZXI7XHJcbiAgbWF4SGVpZ2h0PzogbnVtYmVyO1xyXG4gIHF1YWxpdHk/OiBudW1iZXI7XHJcbiAgZm9ybWF0PzogJ3BuZycgfCAnanBlZycgfCAnd2VicCc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VJbmZvIHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgd2lkdGg6IG51bWJlcjtcclxuICBoZWlnaHQ6IG51bWJlcjtcclxuICBzaXplOiBudW1iZXI7XHJcbiAgZm9ybWF0OiBzdHJpbmc7XHJcbiAgbGFzdE1vZGlmaWVkOiBEYXRlO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRpZmZQcm9jZXNzaW5nT3B0aW9ucyB7XHJcbiAgcGFnZT86IG51bWJlcjtcclxuICBjb252ZXJ0VG9DYW52YXM/OiBib29sZWFuO1xyXG4gIGJhY2tncm91bmRDb2xvcj86IHN0cmluZztcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBDYWNoZSBNYW5hZ2VtZW50XHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FjaGVFbnRyeTxUPiB7XHJcbiAgZGF0YTogVDtcclxuICB0aW1lc3RhbXA6IERhdGU7XHJcbiAgc2l6ZTogbnVtYmVyO1xyXG4gIGhpdHM6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYWNoZVN0YXRzIHtcclxuICB0b3RhbEVudHJpZXM6IG51bWJlcjtcclxuICB0b3RhbFNpemU6IG51bWJlcjtcclxuICBoaXRSYXRlOiBudW1iZXI7XHJcbiAgbWVtb3J5VXNhZ2U6IG51bWJlcjtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGaWxlIFN5c3RlbSBTZXJ2aWNlIEludGVyZmFjZVxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElGaWxlU3lzdGVtU2VydmljZSB7XHJcbiAgLy8gRm9sZGVyIE9wZXJhdGlvbnNcclxuICBzZWxlY3RJbWFnZUZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+O1xyXG4gIHNlbGVjdExhYmVsRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj47XHJcbiAgc2VsZWN0Q2xhc3NJbmZvRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj47XHJcbiAgXHJcbiAgLy8gRmlsZSBMaXN0aW5nXHJcbiAgbGlzdEltYWdlRmlsZXMoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEltYWdlRmlsZVtdPj47XHJcbiAgbGlzdENsYXNzRmlsZXMoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PENsYXNzRmlsZVtdPj47XHJcbiAgc2NhbkZvbGRlcihmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Rm9sZGVyU2NhblJlc3VsdD4+O1xyXG4gIFxyXG4gIC8vIEltYWdlIE9wZXJhdGlvbnNcclxuICBsb2FkSW1hZ2UoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIG9wdGlvbnM/OiBJbWFnZUxvYWRPcHRpb25zKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEhUTUxJbWFnZUVsZW1lbnQ+PjtcclxuICBsb2FkVGlmZkltYWdlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBvcHRpb25zPzogVGlmZlByb2Nlc3NpbmdPcHRpb25zKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEhUTUxJbWFnZUVsZW1lbnQ+PjtcclxuICBnZXRJbWFnZUluZm8oZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SW1hZ2VJbmZvPj47XHJcbiAgXHJcbiAgLy8gTGFiZWwgT3BlcmF0aW9uc1xyXG4gIGxvYWRMYWJlbHMoZmlsZU5hbWU6IHN0cmluZywgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PFlvbG9MYWJlbFtdPj47XHJcbiAgc2F2ZUxhYmVscyhmaWxlTmFtZTogc3RyaW5nLCBsYWJlbHM6IFlvbG9MYWJlbFtdLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ+O1xyXG4gIGNoZWNrTGFiZWxTdGF0dXMoZmlsZU5hbWU6IHN0cmluZywgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PExhYmVsU3RhdHVzPj47XHJcbiAgXHJcbiAgLy8gQ2xhc3MgRmlsZSBPcGVyYXRpb25zXHJcbiAgbG9hZENsYXNzRmlsZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxDbGFzc0ZpbGVDb250ZW50Pj47XHJcbiAgc2F2ZUNsYXNzRmlsZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgY29udGVudDogQ2xhc3NGaWxlQ29udGVudCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdD47XHJcbiAgY3JlYXRlQ2xhc3NGaWxlKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgZmlsZU5hbWU6IHN0cmluZywgaW5pdGlhbENvbnRlbnQ/OiBDbGFzc0ZpbGVDb250ZW50KTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1GaWxlSGFuZGxlPj47XHJcbiAgdmFsaWRhdGVDbGFzc0ZpbGUoY29udGVudDogc3RyaW5nKTogQ2xhc3NGaWxlVmFsaWRhdGlvbjtcclxuICBcclxuICAvLyBZT0xPIEZvcm1hdCBQcm9jZXNzaW5nXHJcbiAgcGFyc2VZb2xvU3RyaW5nKHlvbG9EYXRhOiBzdHJpbmcpOiBZb2xvUGFyc2VSZXN1bHQ7XHJcbiAgbGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVsczogWW9sb0xhYmVsW10sIG9wdGlvbnM/OiBZb2xvRXhwb3J0T3B0aW9ucyk6IHN0cmluZztcclxuICB2YWxpZGF0ZVlvbG9MYWJlbChsYWJlbDogWW9sb0xhYmVsKTogYm9vbGVhbjtcclxuICBcclxuICAvLyBDYWNoZSBNYW5hZ2VtZW50XHJcbiAgY2xlYXJJbWFnZUNhY2hlKCk6IHZvaWQ7XHJcbiAgZ2V0Q2FjaGVTdGF0cygpOiBDYWNoZVN0YXRzO1xyXG4gIG9wdGltaXplQ2FjaGUoKTogdm9pZDtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBDb25maWd1cmF0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVN5c3RlbUNvbmZpZyB7XHJcbiAgLy8gSW1hZ2Ugc2V0dGluZ3NcclxuICBzdXBwb3J0ZWRJbWFnZUZvcm1hdHM6IHN0cmluZ1tdO1xyXG4gIG1heEltYWdlU2l6ZTogbnVtYmVyO1xyXG4gIHRodW1ibmFpbFNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcclxuICBcclxuICAvLyBDYWNoZSBzZXR0aW5nc1xyXG4gIG1heENhY2hlU2l6ZTogbnVtYmVyO1xyXG4gIGNhY2hlVGltZW91dDogbnVtYmVyO1xyXG4gIFxyXG4gIC8vIFlPTE8gc2V0dGluZ3NcclxuICB5b2xvVmFsaWRhdGlvbjoge1xyXG4gICAgc3RyaWN0Qm91bmRzOiBib29sZWFuO1xyXG4gICAgYWxsb3daZXJvU2l6ZTogYm9vbGVhbjtcclxuICAgIHByZWNpc2lvbjogbnVtYmVyO1xyXG4gIH07XHJcbiAgXHJcbiAgLy8gUGVyZm9ybWFuY2Ugc2V0dGluZ3NcclxuICBiYXRjaFNpemU6IG51bWJlcjtcclxuICBjb25jdXJyZW50TG9hZHM6IG51bWJlcjtcclxuICBwcmVsb2FkQWRqYWNlbnQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRXZlbnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVN5c3RlbUV2ZW50IHtcclxuICB0eXBlOiBzdHJpbmc7XHJcbiAgZGF0YT86IGFueTtcclxuICB0aW1lc3RhbXA6IERhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXIgPSAoZXZlbnQ6IEZpbGVTeXN0ZW1FdmVudCkgPT4gdm9pZDtcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRXJyb3IgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVTeXN0ZW1FcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIHB1YmxpYyBjb2RlOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgZGV0YWlscz86IGFueVxyXG4gICkge1xyXG4gICAgc3VwZXIobWVzc2FnZSk7XHJcbiAgICB0aGlzLm5hbWUgPSAnRmlsZVN5c3RlbUVycm9yJztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBZb2xvRm9ybWF0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgbGluZT86IG51bWJlcixcclxuICAgIHB1YmxpYyBkYXRhPzogc3RyaW5nXHJcbiAgKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICAgIHRoaXMubmFtZSA9ICdZb2xvRm9ybWF0RXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEltYWdlTG9hZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGZpbGVOYW1lPzogc3RyaW5nLFxyXG4gICAgcHVibGljIGNhdXNlPzogRXJyb3JcclxuICApIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gICAgdGhpcy5uYW1lID0gJ0ltYWdlTG9hZEVycm9yJztcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVXRpbGl0eSBUeXBlc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgdHlwZSBGaWxlRm9ybWF0ID0gJ2pwZycgfCAnanBlZycgfCAncG5nJyB8ICdnaWYnIHwgJ3RpZicgfCAndGlmZicgfCAnd2VicCc7XHJcbmV4cG9ydCB0eXBlIExhYmVsRm9ybWF0ID0gJ3lvbG8nIHwgJ2NvY28nIHwgJ3Bhc2NhbCcgfCAnY3VzdG9tJztcclxuZXhwb3J0IHR5cGUgQ2xhc3NGaWxlRm9ybWF0ID0gJ3lhbWwnIHwgJ3ltbCcgfCAnanNvbicgfCAndHh0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVR5cGVJbmZvIHtcclxuICBleHRlbnNpb246IHN0cmluZztcclxuICBtaW1lVHlwZTogc3RyaW5nO1xyXG4gIGNhdGVnb3J5OiAnaW1hZ2UnIHwgJ2xhYmVsJyB8ICdjbGFzcycgfCAnb3RoZXInO1xyXG4gIHN1cHBvcnRlZDogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVN5c3RlbVNlcnZpY2VGYWN0b3J5IHtcclxuICBjcmVhdGUoY29uZmlnPzogUGFydGlhbDxGaWxlU3lzdGVtQ29uZmlnPik6IElGaWxlU3lzdGVtU2VydmljZTtcclxuICBjcmVhdGVXaXRoQ2FjaGUoY2FjaGVTaXplOiBudW1iZXIpOiBJRmlsZVN5c3RlbVNlcnZpY2U7XHJcbn0iLCIvKipcclxuICogWU9MTyBGb3JtYXQgUGFyc2VyIFV0aWxpdHlcclxuICogXHJcbiAqIEhhbmRsZXMgcGFyc2luZyBhbmQgZ2VuZXJhdGlvbiBvZiBZT0xPIGZvcm1hdCBhbm5vdGF0aW9uIGZpbGVzLlxyXG4gKiBZT0xPIGZvcm1hdDogY2xhc3NJZCBjZW50ZXJYIGNlbnRlclkgd2lkdGggaGVpZ2h0IChub3JtYWxpemVkIGNvb3JkaW5hdGVzIDAtMSlcclxuICovXHJcblxyXG5pbXBvcnQgeyBZb2xvTGFiZWwsIFlvbG9QYXJzZVJlc3VsdCwgWW9sb0V4cG9ydE9wdGlvbnMsIFlvbG9Gb3JtYXRFcnJvciB9IGZyb20gJy4uL3R5cGVzL2ZpbGVzeXN0ZW0nO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBDb25zdGFudHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuY29uc3QgREVGQVVMVF9QUkVDSVNJT04gPSA2O1xyXG5jb25zdCBNSU5fQ09PUkRJTkFURSA9IDAuMDtcclxuY29uc3QgTUFYX0NPT1JESU5BVEUgPSAxLjA7XHJcbmNvbnN0IE1JTl9TSVpFID0gMC4wO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBZT0xPIFBhcnNlciBDbGFzc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgY2xhc3MgWW9sb1BhcnNlciB7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ09PUkRJTkFURV9QQVRURVJOID0gL14tP1xcZCsoXFwuXFxkKyk/JC87XHJcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgTElORV9QQVRURVJOID0gL15cXHMqKFxcZCspXFxzKyhbXFxkLi1dKylcXHMrKFtcXGQuLV0rKVxccysoW1xcZC4tXSspXFxzKyhbXFxkLi1dKylcXHMqJC87XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlIFlPTE8gZm9ybWF0IHN0cmluZyBpbnRvIHN0cnVjdHVyZWQgbGFiZWxzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IFlvbG9QYXJzZVJlc3VsdCB7XHJcbiAgICBjb25zdCByZXN1bHQ6IFlvbG9QYXJzZVJlc3VsdCA9IHtcclxuICAgICAgbGFiZWxzOiBbXSxcclxuICAgICAgZXJyb3JzOiBbXSxcclxuICAgICAgd2FybmluZ3M6IFtdXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICgheW9sb0RhdGEgfHwgeW9sb0RhdGEudHJpbSgpID09PSAnJykge1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmVzID0geW9sb0RhdGEuc3BsaXQoJ1xcbicpO1xyXG4gICAgXHJcbiAgICBsaW5lcy5mb3JFYWNoKChsaW5lLCBsaW5lSW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgdHJpbW1lZExpbmUgPSBsaW5lLnRyaW0oKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFNraXAgZW1wdHkgbGluZXMgYW5kIGNvbW1lbnRzXHJcbiAgICAgIGlmICh0cmltbWVkTGluZSA9PT0gJycgfHwgdHJpbW1lZExpbmUuc3RhcnRzV2l0aCgnIycpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5wYXJzZVNpbmdsZUxpbmUodHJpbW1lZExpbmUsIGxpbmVJbmRleCArIDEpO1xyXG4gICAgICAgIGlmIChsYWJlbCkge1xyXG4gICAgICAgICAgcmVzdWx0LmxhYmVscy5wdXNoKGxhYmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgWW9sb0Zvcm1hdEVycm9yKSB7XHJcbiAgICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYExpbmUgJHtsaW5lSW5kZXggKyAxfTogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYExpbmUgJHtsaW5lSW5kZXggKyAxfTogVW5rbm93biBwYXJzaW5nIGVycm9yYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdmFsaWRhdGlvbiB3YXJuaW5nc1xyXG4gICAgdGhpcy5hZGRWYWxpZGF0aW9uV2FybmluZ3MocmVzdWx0KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYSBzaW5nbGUgWU9MTyBmb3JtYXQgbGluZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIHBhcnNlU2luZ2xlTGluZShsaW5lOiBzdHJpbmcsIGxpbmVOdW1iZXI6IG51bWJlcik6IFlvbG9MYWJlbCB8IG51bGwge1xyXG4gICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKHRoaXMuTElORV9QQVRURVJOKTtcclxuICAgIFxyXG4gICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkIFlPTE8gZm9ybWF0LiBFeHBlY3RlZDogXCJjbGFzc0lkIGNlbnRlclggY2VudGVyWSB3aWR0aCBoZWlnaHRcImAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgWywgY2xhc3NJZFN0ciwgY2VudGVyWFN0ciwgY2VudGVyWVN0ciwgd2lkdGhTdHIsIGhlaWdodFN0cl0gPSBtYXRjaDtcclxuXHJcbiAgICAvLyBQYXJzZSBjbGFzcyBJRFxyXG4gICAgY29uc3QgY2xhc3NJZCA9IHBhcnNlSW50KGNsYXNzSWRTdHIhLCAxMCk7XHJcbiAgICBpZiAoaXNOYU4oY2xhc3NJZCkgfHwgY2xhc3NJZCA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgSW52YWxpZCBjbGFzcyBJRDogXCIke2NsYXNzSWRTdHJ9XCIuIE11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcmAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFyc2UgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLnBhcnNlQ29vcmRpbmF0ZShjZW50ZXJYU3RyISwgJ2NlbnRlclgnLCBsaW5lTnVtYmVyLCBsaW5lKTtcclxuICAgIGNvbnN0IGNlbnRlclkgPSB0aGlzLnBhcnNlQ29vcmRpbmF0ZShjZW50ZXJZU3RyISwgJ2NlbnRlclknLCBsaW5lTnVtYmVyLCBsaW5lKTtcclxuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5wYXJzZUNvb3JkaW5hdGUod2lkdGhTdHIhLCAnd2lkdGgnLCBsaW5lTnVtYmVyLCBsaW5lKTtcclxuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyc2VDb29yZGluYXRlKGhlaWdodFN0ciEsICdoZWlnaHQnLCBsaW5lTnVtYmVyLCBsaW5lKTtcclxuXHJcbiAgICAvLyBWYWxpZGF0ZSBjb29yZGluYXRlIHJhbmdlc1xyXG4gICAgdGhpcy52YWxpZGF0ZUNvb3JkaW5hdGVzKHsgY2xhc3NJZCwgY2VudGVyWCwgY2VudGVyWSwgd2lkdGgsIGhlaWdodCB9LCBsaW5lTnVtYmVyLCBsaW5lKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjbGFzc0lkLFxyXG4gICAgICBjZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZLFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgaGVpZ2h0XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYSBjb29yZGluYXRlIHZhbHVlIHdpdGggdmFsaWRhdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIHBhcnNlQ29vcmRpbmF0ZSh2YWx1ZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGxpbmVOdW1iZXI6IG51bWJlciwgbGluZTogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgIGlmICghdGhpcy5DT09SRElOQVRFX1BBVFRFUk4udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgSW52YWxpZCAke25hbWV9OiBcIiR7dmFsdWV9XCIuIE11c3QgYmUgYSB2YWxpZCBudW1iZXJgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG4gICAgaWYgKGlzTmFOKHBhcnNlZCkpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgSW52YWxpZCAke25hbWV9OiBcIiR7dmFsdWV9XCIuIENvdWxkIG5vdCBwYXJzZSBhcyBudW1iZXJgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBZT0xPIGxhYmVsIGNvb3JkaW5hdGVzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgdmFsaWRhdGVDb29yZGluYXRlcyhsYWJlbDogWW9sb0xhYmVsLCBsaW5lTnVtYmVyOiBudW1iZXIsIGxpbmU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjZW50ZXJYLCBjZW50ZXJZLCB3aWR0aCwgaGVpZ2h0IH0gPSBsYWJlbDtcclxuXHJcbiAgICAvLyBDaGVjayBjb29yZGluYXRlIGJvdW5kcyAoWU9MTyB1c2VzIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMgMC0xKVxyXG4gICAgaWYgKGNlbnRlclggPCBNSU5fQ09PUkRJTkFURSB8fCBjZW50ZXJYID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgY2VudGVyWCBvdXQgb2YgcmFuZ2U6ICR7Y2VudGVyWH0uIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2VudGVyWSA8IE1JTl9DT09SRElOQVRFIHx8IGNlbnRlclkgPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBjZW50ZXJZIG91dCBvZiByYW5nZTogJHtjZW50ZXJZfS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3aWR0aCA8PSBNSU5fU0laRSB8fCB3aWR0aCA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYHdpZHRoIG91dCBvZiByYW5nZTogJHt3aWR0aH0uIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGVpZ2h0IDw9IE1JTl9TSVpFIHx8IGhlaWdodCA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYGhlaWdodCBvdXQgb2YgcmFuZ2U6ICR7aGVpZ2h0fS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGJvdW5kaW5nIGJveCBib3VuZHNcclxuICAgIGNvbnN0IGxlZnQgPSBjZW50ZXJYIC0gd2lkdGggLyAyO1xyXG4gICAgY29uc3QgcmlnaHQgPSBjZW50ZXJYICsgd2lkdGggLyAyO1xyXG4gICAgY29uc3QgdG9wID0gY2VudGVyWSAtIGhlaWdodCAvIDI7XHJcbiAgICBjb25zdCBib3R0b20gPSBjZW50ZXJZICsgaGVpZ2h0IC8gMjtcclxuXHJcbiAgICBpZiAobGVmdCA8IE1JTl9DT09SRElOQVRFIHx8IHJpZ2h0ID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgQm91bmRpbmcgYm94IGV4dGVuZHMgb3V0c2lkZSBpbWFnZSBib3VuZHMgaG9yaXpvbnRhbGx5IChsZWZ0OiAke2xlZnR9LCByaWdodDogJHtyaWdodH0pYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodG9wIDwgTUlOX0NPT1JESU5BVEUgfHwgYm90dG9tID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgQm91bmRpbmcgYm94IGV4dGVuZHMgb3V0c2lkZSBpbWFnZSBib3VuZHMgdmVydGljYWxseSAodG9wOiAke3RvcH0sIGJvdHRvbTogJHtib3R0b219KWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgdmFsaWRhdGlvbiB3YXJuaW5ncyB0byBwYXJzZSByZXN1bHRcclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBhZGRWYWxpZGF0aW9uV2FybmluZ3MocmVzdWx0OiBZb2xvUGFyc2VSZXN1bHQpOiB2b2lkIHtcclxuICAgIC8vIENoZWNrIGZvciB2ZXJ5IHNtYWxsIGJvdW5kaW5nIGJveGVzXHJcbiAgICByZXN1bHQubGFiZWxzLmZvckVhY2goKGxhYmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICBpZiAobGFiZWwud2lkdGggPCAwLjAxIHx8IGxhYmVsLmhlaWdodCA8IDAuMDEpIHtcclxuICAgICAgICByZXN1bHQud2FybmluZ3MucHVzaChgTGFiZWwgJHtpbmRleCArIDF9OiBWZXJ5IHNtYWxsIGJvdW5kaW5nIGJveCAoJHtsYWJlbC53aWR0aH14JHtsYWJlbC5oZWlnaHR9KWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3IgZHVwbGljYXRlIGxhYmVscyAoc2FtZSBwb3NpdGlvbiBhbmQgY2xhc3MpXHJcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICByZXN1bHQubGFiZWxzLmZvckVhY2goKGxhYmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCBrZXkgPSBgJHtsYWJlbC5jbGFzc0lkfV8ke2xhYmVsLmNlbnRlclh9XyR7bGFiZWwuY2VudGVyWX1fJHtsYWJlbC53aWR0aH1fJHtsYWJlbC5oZWlnaHR9YDtcclxuICAgICAgaWYgKHNlZW4uaGFzKGtleSkpIHtcclxuICAgICAgICByZXN1bHQud2FybmluZ3MucHVzaChgTGFiZWwgJHtpbmRleCArIDF9OiBEdXBsaWNhdGUgbGFiZWwgZGV0ZWN0ZWRgKTtcclxuICAgICAgfVxyXG4gICAgICBzZWVuLmFkZChrZXkpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IGxhYmVscyBhcnJheSB0byBZT0xPIGZvcm1hdCBzdHJpbmdcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHM6IFlvbG9MYWJlbFtdLCBvcHRpb25zOiBZb2xvRXhwb3J0T3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgcHJlY2lzaW9uID0gREVGQVVMVF9QUkVDSVNJT04sXHJcbiAgICAgIGluY2x1ZGVDb21tZW50cyA9IGZhbHNlLFxyXG4gICAgICB2YWxpZGF0ZUJvdW5kcyA9IHRydWVcclxuICAgIH0gPSBvcHRpb25zO1xyXG5cclxuICAgIGlmICghbGFiZWxzIHx8IGxhYmVscy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGlmIChpbmNsdWRlQ29tbWVudHMpIHtcclxuICAgICAgbGluZXMucHVzaCgnIyBZT0xPIGZvcm1hdDogY2xhc3NJZCBjZW50ZXJYIGNlbnRlclkgd2lkdGggaGVpZ2h0IChub3JtYWxpemVkIGNvb3JkaW5hdGVzKScpO1xyXG4gICAgICBsaW5lcy5wdXNoKGAjIEdlbmVyYXRlZDogJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9YCk7XHJcbiAgICAgIGxpbmVzLnB1c2goJycpO1xyXG4gICAgfVxyXG5cclxuICAgIGxhYmVscy5mb3JFYWNoKChsYWJlbCwgaW5kZXgpID0+IHtcclxuICAgICAgaWYgKHZhbGlkYXRlQm91bmRzICYmICF0aGlzLnZhbGlkYXRlWW9sb0xhYmVsKGxhYmVsKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoYEludmFsaWQgbGFiZWwgYXQgaW5kZXggJHtpbmRleH06IGNvb3JkaW5hdGVzIG91dCBvZiBib3VuZHNgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbGluZSA9IFtcclxuICAgICAgICBsYWJlbC5jbGFzc0lkLnRvU3RyaW5nKCksXHJcbiAgICAgICAgbGFiZWwuY2VudGVyWC50b0ZpeGVkKHByZWNpc2lvbiksXHJcbiAgICAgICAgbGFiZWwuY2VudGVyWS50b0ZpeGVkKHByZWNpc2lvbiksXHJcbiAgICAgICAgbGFiZWwud2lkdGgudG9GaXhlZChwcmVjaXNpb24pLFxyXG4gICAgICAgIGxhYmVsLmhlaWdodC50b0ZpeGVkKHByZWNpc2lvbilcclxuICAgICAgXS5qb2luKCcgJyk7XHJcblxyXG4gICAgICBsaW5lcy5wdXNoKGxpbmUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmFsaWRhdGUgYSBzaW5nbGUgWU9MTyBsYWJlbFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdmFsaWRhdGVZb2xvTGFiZWwobGFiZWw6IFlvbG9MYWJlbCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy52YWxpZGF0ZUNvb3JkaW5hdGVzKGxhYmVsLCAwLCAnJyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgcGl4ZWwgY29vcmRpbmF0ZXMgdG8gWU9MTyBub3JtYWxpemVkIGNvb3JkaW5hdGVzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwaXhlbFRvTm9ybWFsaXplZChcclxuICAgIHBpeGVsWDogbnVtYmVyLFxyXG4gICAgcGl4ZWxZOiBudW1iZXIsXHJcbiAgICBwaXhlbFdpZHRoOiBudW1iZXIsXHJcbiAgICBwaXhlbEhlaWdodDogbnVtYmVyLFxyXG4gICAgaW1hZ2VXaWR0aDogbnVtYmVyLFxyXG4gICAgaW1hZ2VIZWlnaHQ6IG51bWJlclxyXG4gICk6IFlvbG9MYWJlbCB7XHJcbiAgICBjb25zdCBjZW50ZXJYID0gKHBpeGVsWCArIHBpeGVsV2lkdGggLyAyKSAvIGltYWdlV2lkdGg7XHJcbiAgICBjb25zdCBjZW50ZXJZID0gKHBpeGVsWSArIHBpeGVsSGVpZ2h0IC8gMikgLyBpbWFnZUhlaWdodDtcclxuICAgIGNvbnN0IHdpZHRoID0gcGl4ZWxXaWR0aCAvIGltYWdlV2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBwaXhlbEhlaWdodCAvIGltYWdlSGVpZ2h0O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNsYXNzSWQ6IDAsIC8vIFdpbGwgYmUgc2V0IGJ5IGNhbGxlclxyXG4gICAgICBjZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZLFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgaGVpZ2h0XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBZT0xPIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMgdG8gcGl4ZWwgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIG5vcm1hbGl6ZWRUb1BpeGVsKFxyXG4gICAgbGFiZWw6IFlvbG9MYWJlbCxcclxuICAgIGltYWdlV2lkdGg6IG51bWJlcixcclxuICAgIGltYWdlSGVpZ2h0OiBudW1iZXJcclxuICApOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyOyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9IHtcclxuICAgIGNvbnN0IHdpZHRoID0gbGFiZWwud2lkdGggKiBpbWFnZVdpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gbGFiZWwuaGVpZ2h0ICogaW1hZ2VIZWlnaHQ7XHJcbiAgICBjb25zdCB4ID0gKGxhYmVsLmNlbnRlclggKiBpbWFnZVdpZHRoKSAtICh3aWR0aCAvIDIpO1xyXG4gICAgY29uc3QgeSA9IChsYWJlbC5jZW50ZXJZICogaW1hZ2VIZWlnaHQpIC0gKGhlaWdodCAvIDIpO1xyXG5cclxuICAgIHJldHVybiB7IHgsIHksIHdpZHRoLCBoZWlnaHQgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBzdGF0aXN0aWNzIGFib3V0IGEgc2V0IG9mIGxhYmVsc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TGFiZWxTdGF0aXN0aWNzKGxhYmVsczogWW9sb0xhYmVsW10pOiB7XHJcbiAgICB0b3RhbExhYmVsczogbnVtYmVyO1xyXG4gICAgY2xhc3NEaXN0cmlidXRpb246IFJlY29yZDxudW1iZXIsIG51bWJlcj47XHJcbiAgICBhdmVyYWdlU2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gICAgc2l6ZVJhbmdlOiB7XHJcbiAgICAgIG1pbjogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gICAgICBtYXg6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcclxuICAgIH07XHJcbiAgfSB7XHJcbiAgICBpZiAoIWxhYmVscyB8fCBsYWJlbHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdG90YWxMYWJlbHM6IDAsXHJcbiAgICAgICAgY2xhc3NEaXN0cmlidXRpb246IHt9LFxyXG4gICAgICAgIGF2ZXJhZ2VTaXplOiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSxcclxuICAgICAgICBzaXplUmFuZ2U6IHtcclxuICAgICAgICAgIG1pbjogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH0sXHJcbiAgICAgICAgICBtYXg6IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNsYXNzRGlzdHJpYnV0aW9uOiBSZWNvcmQ8bnVtYmVyLCBudW1iZXI+ID0ge307XHJcbiAgICBsZXQgdG90YWxXaWR0aCA9IDA7XHJcbiAgICBsZXQgdG90YWxIZWlnaHQgPSAwO1xyXG4gICAgbGV0IG1pbldpZHRoID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgIGxldCBtYXhXaWR0aCA9IE51bWJlci5NSU5fVkFMVUU7XHJcbiAgICBsZXQgbWluSGVpZ2h0ID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgIGxldCBtYXhIZWlnaHQgPSBOdW1iZXIuTUlOX1ZBTFVFO1xyXG5cclxuICAgIGxhYmVscy5mb3JFYWNoKGxhYmVsID0+IHtcclxuICAgICAgLy8gQ2xhc3MgZGlzdHJpYnV0aW9uXHJcbiAgICAgIGNsYXNzRGlzdHJpYnV0aW9uW2xhYmVsLmNsYXNzSWRdID0gKGNsYXNzRGlzdHJpYnV0aW9uW2xhYmVsLmNsYXNzSWRdIHx8IDApICsgMTtcclxuXHJcbiAgICAgIC8vIFNpemUgc3RhdGlzdGljc1xyXG4gICAgICB0b3RhbFdpZHRoICs9IGxhYmVsLndpZHRoO1xyXG4gICAgICB0b3RhbEhlaWdodCArPSBsYWJlbC5oZWlnaHQ7XHJcbiAgICAgIG1pbldpZHRoID0gTWF0aC5taW4obWluV2lkdGgsIGxhYmVsLndpZHRoKTtcclxuICAgICAgbWF4V2lkdGggPSBNYXRoLm1heChtYXhXaWR0aCwgbGFiZWwud2lkdGgpO1xyXG4gICAgICBtaW5IZWlnaHQgPSBNYXRoLm1pbihtaW5IZWlnaHQsIGxhYmVsLmhlaWdodCk7XHJcbiAgICAgIG1heEhlaWdodCA9IE1hdGgubWF4KG1heEhlaWdodCwgbGFiZWwuaGVpZ2h0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRvdGFsTGFiZWxzOiBsYWJlbHMubGVuZ3RoLFxyXG4gICAgICBjbGFzc0Rpc3RyaWJ1dGlvbixcclxuICAgICAgYXZlcmFnZVNpemU6IHtcclxuICAgICAgICB3aWR0aDogdG90YWxXaWR0aCAvIGxhYmVscy5sZW5ndGgsXHJcbiAgICAgICAgaGVpZ2h0OiB0b3RhbEhlaWdodCAvIGxhYmVscy5sZW5ndGhcclxuICAgICAgfSxcclxuICAgICAgc2l6ZVJhbmdlOiB7XHJcbiAgICAgICAgbWluOiB7IHdpZHRoOiBtaW5XaWR0aCwgaGVpZ2h0OiBtaW5IZWlnaHQgfSxcclxuICAgICAgICBtYXg6IHsgd2lkdGg6IG1heFdpZHRoLCBoZWlnaHQ6IG1heEhlaWdodCB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFV0aWxpdHkgRnVuY3Rpb25zXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBRdWljayBwYXJzZSBmdW5jdGlvbiBmb3Igc2ltcGxlIHVzZSBjYXNlc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlWW9sbyh5b2xvRGF0YTogc3RyaW5nKTogWW9sb0xhYmVsW10ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IFlvbG9QYXJzZXIucGFyc2VZb2xvU3RyaW5nKHlvbG9EYXRhKTtcclxuICBpZiAocmVzdWx0LmVycm9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKGBZT0xPIHBhcnNpbmcgZmFpbGVkOiAke3Jlc3VsdC5lcnJvcnMuam9pbignLCAnKX1gKTtcclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdC5sYWJlbHM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBRdWljayBleHBvcnQgZnVuY3Rpb24gZm9yIHNpbXBsZSB1c2UgY2FzZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRZb2xvKGxhYmVsczogWW9sb0xhYmVsW10sIHByZWNpc2lvbjogbnVtYmVyID0gREVGQVVMVF9QUkVDSVNJT04pOiBzdHJpbmcge1xyXG4gIHJldHVybiBZb2xvUGFyc2VyLmxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHMsIHsgcHJlY2lzaW9uIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGUgWU9MTyBzdHJpbmcgd2l0aG91dCBwYXJzaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVZb2xvU3RyaW5nKHlvbG9EYXRhOiBzdHJpbmcpOiB7IGlzVmFsaWQ6IGJvb2xlYW47IGVycm9yczogc3RyaW5nW10gfSB7XHJcbiAgY29uc3QgcmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gIHJldHVybiB7XHJcbiAgICBpc1ZhbGlkOiByZXN1bHQuZXJyb3JzLmxlbmd0aCA9PT0gMCxcclxuICAgIGVycm9yczogcmVzdWx0LmVycm9yc1xyXG4gIH07XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRXhwb3J0XHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFlvbG9QYXJzZXI7IiwiLyoqXHJcbiAqIEZpbGVTeXN0ZW0gU2VydmljZSBJbXBsZW1lbnRhdGlvblxyXG4gKiBcclxuICogSGFuZGxlcyBhbGwgZmlsZSBJL08gb3BlcmF0aW9ucyBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqIFByb3ZpZGVzIGFic3RyYWN0aW9uIG92ZXIgRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSSBhbmQgWU9MTyBmb3JtYXQgcHJvY2Vzc2luZy5cclxuICogXHJcbiAqIEB2ZXJzaW9uIDEuMC4wXHJcbiAqIEBhdXRob3IgRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1pZ3JhdGlvblxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFxyXG4gIElGaWxlU3lzdGVtU2VydmljZSxcclxuICBGaWxlT3BlcmF0aW9uUmVzdWx0LFxyXG4gIEZpbGVMb2FkUmVzdWx0LFxyXG4gIFlvbG9MYWJlbCxcclxuICBZb2xvUGFyc2VSZXN1bHQsXHJcbiAgWW9sb0V4cG9ydE9wdGlvbnMsXHJcbiAgQ2xhc3NGaWxlQ29udGVudCxcclxuICBDbGFzc0ZpbGVWYWxpZGF0aW9uLFxyXG4gIEZvbGRlclNjYW5SZXN1bHQsXHJcbiAgTGFiZWxTdGF0dXMsXHJcbiAgSW1hZ2VJbmZvLFxyXG4gIEltYWdlTG9hZE9wdGlvbnMsXHJcbiAgVGlmZlByb2Nlc3NpbmdPcHRpb25zLFxyXG4gIENhY2hlRW50cnksXHJcbiAgQ2FjaGVTdGF0cyxcclxuICBGaWxlU3lzdGVtQ29uZmlnLFxyXG4gIEZpbGVTeXN0ZW1FdmVudCxcclxuICBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyLFxyXG4gIEZpbGVTeXN0ZW1FcnJvcixcclxuICBJbWFnZUxvYWRFcnJvcixcclxuICBGaWxlRm9ybWF0LFxyXG4gIENsYXNzRmlsZUZvcm1hdFxyXG59IGZyb20gJy4uL3R5cGVzL2ZpbGVzeXN0ZW0nO1xyXG5cclxuaW1wb3J0IHsgXHJcbiAgRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgXHJcbiAgRmlsZVN5c3RlbUZpbGVIYW5kbGUgXHJcbn0gZnJvbSAnLi4vdHlwZXMnO1xyXG5cclxuaW1wb3J0IHsgXHJcbiAgSW1hZ2VGaWxlLCBcclxuICBDbGFzc0ZpbGUsIFxyXG4gIENsYXNzRGVmaW5pdGlvbiBcclxufSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5cclxuaW1wb3J0IHsgWW9sb1BhcnNlciB9IGZyb20gJy4uL3V0aWxzL3lvbG8tcGFyc2VyJztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmlsZVN5c3RlbSBTZXJ2aWNlIEltcGxlbWVudGF0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlU3lzdGVtU2VydmljZSBpbXBsZW1lbnRzIElGaWxlU3lzdGVtU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBjb25maWc6IEZpbGVTeXN0ZW1Db25maWc7XHJcbiAgcHJpdmF0ZSBpbWFnZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIENhY2hlRW50cnk8SFRNTEltYWdlRWxlbWVudD4+KCk7XHJcbiAgcHJpdmF0ZSBldmVudExpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyW10+KCk7XHJcbiAgXHJcbiAgLy8gRGVmYXVsdCBjb25maWd1cmF0aW9uXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9DT05GSUc6IEZpbGVTeXN0ZW1Db25maWcgPSB7XHJcbiAgICBzdXBwb3J0ZWRJbWFnZUZvcm1hdHM6IFsnanBnJywgJ2pwZWcnLCAncG5nJywgJ2dpZicsICd0aWYnLCAndGlmZicsICd3ZWJwJ10sXHJcbiAgICBtYXhJbWFnZVNpemU6IDUwICogMTAyNCAqIDEwMjQsIC8vIDUwTUJcclxuICAgIHRodW1ibmFpbFNpemU6IHsgd2lkdGg6IDE1MCwgaGVpZ2h0OiAxNTAgfSxcclxuICAgIG1heENhY2hlU2l6ZTogMTAwICogMTAyNCAqIDEwMjQsIC8vIDEwME1CXHJcbiAgICBjYWNoZVRpbWVvdXQ6IDMwICogNjAgKiAxMDAwLCAvLyAzMCBtaW51dGVzXHJcbiAgICB5b2xvVmFsaWRhdGlvbjoge1xyXG4gICAgICBzdHJpY3RCb3VuZHM6IHRydWUsXHJcbiAgICAgIGFsbG93WmVyb1NpemU6IGZhbHNlLFxyXG4gICAgICBwcmVjaXNpb246IDZcclxuICAgIH0sXHJcbiAgICBiYXRjaFNpemU6IDEwLFxyXG4gICAgY29uY3VycmVudExvYWRzOiAzLFxyXG4gICAgcHJlbG9hZEFkamFjZW50OiB0cnVlXHJcbiAgfTtcclxuXHJcbiAgY29uc3RydWN0b3IoY29uZmlnPzogUGFydGlhbDxGaWxlU3lzdGVtQ29uZmlnPikge1xyXG4gICAgdGhpcy5jb25maWcgPSB7IC4uLkZpbGVTeXN0ZW1TZXJ2aWNlLkRFRkFVTFRfQ09ORklHLCAuLi5jb25maWcgfTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGb2xkZXIgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNlbGVjdEltYWdlRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZm9sZGVySGFuZGxlID0gYXdhaXQgKHdpbmRvdyBhcyBhbnkpLnNob3dEaXJlY3RvcnlQaWNrZXIoKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ZvbGRlcjppbWFnZS1zZWxlY3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBuYW1lOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBmb2xkZXJIYW5kbGUsXHJcbiAgICAgICAgbWVzc2FnZTogYEltYWdlIGZvbGRlciBzZWxlY3RlZDogJHtmb2xkZXJIYW5kbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NlbGVjdGlvbiBjYW5jZWxsZWQnIH07XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2VsZWN0IGltYWdlIGZvbGRlcjogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2VsZWN0TGFiZWxGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmb2xkZXJIYW5kbGUgPSBhd2FpdCAod2luZG93IGFzIGFueSkuc2hvd0RpcmVjdG9yeVBpY2tlcigpO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZm9sZGVyOmxhYmVsLXNlbGVjdGVkJyxcclxuICAgICAgICBkYXRhOiB7IG5hbWU6IGZvbGRlckhhbmRsZS5uYW1lIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGZvbGRlckhhbmRsZSxcclxuICAgICAgICBtZXNzYWdlOiBgTGFiZWwgZm9sZGVyIHNlbGVjdGVkOiAke2ZvbGRlckhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2VsZWN0aW9uIGNhbmNlbGxlZCcgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzZWxlY3QgbGFiZWwgZm9sZGVyOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzZWxlY3RDbGFzc0luZm9Gb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmb2xkZXJIYW5kbGUgPSBhd2FpdCAod2luZG93IGFzIGFueSkuc2hvd0RpcmVjdG9yeVBpY2tlcigpO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZm9sZGVyOmNsYXNzLWluZm8tc2VsZWN0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgbmFtZTogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZm9sZGVySGFuZGxlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBDbGFzcyBpbmZvIGZvbGRlciBzZWxlY3RlZDogJHtmb2xkZXJIYW5kbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NlbGVjdGlvbiBjYW5jZWxsZWQnIH07XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2VsZWN0IGNsYXNzIGluZm8gZm9sZGVyOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWxlIExpc3RpbmcgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxpc3RJbWFnZUZpbGVzKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxJbWFnZUZpbGVbXT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGltYWdlRmlsZXM6IEltYWdlRmlsZVtdID0gW107XHJcbiAgICAgIGNvbnN0IHN1cHBvcnRlZEZvcm1hdHMgPSB0aGlzLmNvbmZpZy5zdXBwb3J0ZWRJbWFnZUZvcm1hdHMubWFwKGYgPT4gZi50b0xvd2VyQ2FzZSgpKTtcclxuXHJcbiAgICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgKGZvbGRlckhhbmRsZSBhcyBhbnkpLnZhbHVlcygpKSB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoc3VwcG9ydGVkRm9ybWF0cy5pbmNsdWRlcyhleHRlbnNpb24pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRmlsZTogSW1hZ2VGaWxlID0ge1xyXG4gICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgaGFuZGxlOiBlbnRyeSxcclxuICAgICAgICAgICAgICBwYXRoOiBlbnRyeS5uYW1lLCAvLyBOb3RlOiBGdWxsIHBhdGggbm90IGF2YWlsYWJsZSBpbiBGaWxlIFN5c3RlbSBBY2Nlc3MgQVBJXHJcbiAgICAgICAgICAgICAgZXh0ZW5zaW9uLFxyXG4gICAgICAgICAgICAgIHNpemU6IHVuZGVmaW5lZCwgLy8gV2lsbCBiZSBsb2FkZWQgd2hlbiBuZWVkZWRcclxuICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IHVuZGVmaW5lZCAvLyBXaWxsIGJlIGxvYWRlZCB3aGVuIG5lZWRlZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbWFnZUZpbGVzLnB1c2goaW1hZ2VGaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNvcnQgZmlsZXMgbmF0dXJhbGx5IChoYW5kbGVzIG51bWJlcnMgY29ycmVjdGx5KVxyXG4gICAgICBpbWFnZUZpbGVzLnNvcnQoKGEsIGIpID0+IFxyXG4gICAgICAgIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSwgdW5kZWZpbmVkLCB7IG51bWVyaWM6IHRydWUsIHNlbnNpdGl2aXR5OiAnYmFzZScgfSlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ZpbGVzOmltYWdlcy1saXN0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgY291bnQ6IGltYWdlRmlsZXMubGVuZ3RoLCBmb2xkZXI6IGZvbGRlckhhbmRsZS5uYW1lIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGltYWdlRmlsZXMsXHJcbiAgICAgICAgbWVzc2FnZTogYEZvdW5kICR7aW1hZ2VGaWxlcy5sZW5ndGh9IGltYWdlIGZpbGVzYFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsaXN0IGltYWdlIGZpbGVzOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBsaXN0Q2xhc3NGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Q2xhc3NGaWxlW10+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBjbGFzc0ZpbGVzOiBDbGFzc0ZpbGVbXSA9IFtdO1xyXG4gICAgICBjb25zdCBzdXBwb3J0ZWRGb3JtYXRzID0gWyd5YW1sJywgJ3ltbCddO1xyXG5cclxuICAgICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiAoZm9sZGVySGFuZGxlIGFzIGFueSkudmFsdWVzKCkpIHtcclxuICAgICAgICBpZiAoZW50cnkua2luZCA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgICAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChzdXBwb3J0ZWRGb3JtYXRzLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcclxuICAgICAgICAgICAgLy8gTG9hZCBjbGFzcyBmaWxlIGNvbnRlbnRcclxuICAgICAgICAgICAgY29uc3QgY29udGVudFJlc3VsdCA9IGF3YWl0IHRoaXMubG9hZENsYXNzRmlsZShlbnRyeSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBjbGFzc0ZpbGU6IENsYXNzRmlsZSA9IHtcclxuICAgICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxyXG4gICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgY29udGVudDogY29udGVudFJlc3VsdC5zdWNjZXNzID8gY29udGVudFJlc3VsdC5kYXRhIS5jbGFzc2VzIDogW10sXHJcbiAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2xhc3NGaWxlcy5wdXNoKGNsYXNzRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmaWxlczpjbGFzc2VzLWxpc3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogY2xhc3NGaWxlcy5sZW5ndGgsIGZvbGRlcjogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogY2xhc3NGaWxlcyxcclxuICAgICAgICBtZXNzYWdlOiBgRm91bmQgJHtjbGFzc0ZpbGVzLmxlbmd0aH0gY2xhc3MgZmlsZXNgXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxpc3QgY2xhc3MgZmlsZXM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNjYW5Gb2xkZXIoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZvbGRlclNjYW5SZXN1bHQ+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXN1bHQ6IEZvbGRlclNjYW5SZXN1bHQgPSB7XHJcbiAgICAgICAgaW1hZ2VGaWxlczogW10sXHJcbiAgICAgICAgbGFiZWxGaWxlczogW10sXHJcbiAgICAgICAgY2xhc3NGaWxlczogW10sXHJcbiAgICAgICAgdG90YWxGaWxlczogMCxcclxuICAgICAgICBlcnJvcnM6IFtdXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIChmb2xkZXJIYW5kbGUgYXMgYW55KS52YWx1ZXMoKSkge1xyXG4gICAgICAgIGlmIChlbnRyeS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgIHJlc3VsdC50b3RhbEZpbGVzKys7XHJcbiAgICAgICAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICBpZiAodGhpcy5jb25maWcuc3VwcG9ydGVkSW1hZ2VGb3JtYXRzLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VGaWxlOiBJbWFnZUZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBoYW5kbGU6IGVudHJ5LFxyXG4gICAgICAgICAgICAgIHBhdGg6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJlc3VsdC5pbWFnZUZpbGVzLnB1c2goaW1hZ2VGaWxlKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXh0ZW5zaW9uID09PSAndHh0Jykge1xyXG4gICAgICAgICAgICByZXN1bHQubGFiZWxGaWxlcy5wdXNoKGVudHJ5Lm5hbWUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChbJ3lhbWwnLCAneW1sJ10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRSZXN1bHQgPSBhd2FpdCB0aGlzLmxvYWRDbGFzc0ZpbGUoZW50cnkpO1xyXG4gICAgICAgICAgICAgIGlmIChjb250ZW50UmVzdWx0LnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzRmlsZTogQ2xhc3NGaWxlID0ge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICBoYW5kbGU6IGVudHJ5LFxyXG4gICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50UmVzdWx0LmRhdGEhLmNsYXNzZXMsXHJcbiAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmNsYXNzRmlsZXMucHVzaChjbGFzc0ZpbGUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYEZhaWxlZCB0byBsb2FkIGNsYXNzIGZpbGUgJHtlbnRyeS5uYW1lfTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IHJlc3VsdCxcclxuICAgICAgICBtZXNzYWdlOiBgU2Nhbm5lZCAke3Jlc3VsdC50b3RhbEZpbGVzfSBmaWxlc2BcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2NhbiBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEltYWdlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhc3luYyBsb2FkSW1hZ2UoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIG9wdGlvbnM/OiBJbWFnZUxvYWRPcHRpb25zKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEhUTUxJbWFnZUVsZW1lbnQ+PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRJRkYgaGFuZGxpbmc6IGRlbGVnYXRlIHRvIFRJRkYgbG9hZGVyIGlmIG5lZWRlZFxuICAgICAgY29uc3QgZXh0ID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGZpbGVIYW5kbGUubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChleHQgPT09ICd0aWYnIHx8IGV4dCA9PT0gJ3RpZmYnKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmxvYWRUaWZmSW1hZ2UoZmlsZUhhbmRsZSk7XG4gICAgICB9XG4gICAgICAvLyBDaGVjayBjYWNoZSBmaXJzdFxyXG4gICAgICBjb25zdCBjYWNoZUtleSA9IGAke2ZpbGVIYW5kbGUubmFtZX1gO1xyXG4gICAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmltYWdlQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcclxuICAgICAgXHJcbiAgICAgIGlmIChjYWNoZWQgJiYgdGhpcy5pc0NhY2hlVmFsaWQoY2FjaGVkKSkge1xyXG4gICAgICAgIGNhY2hlZC5oaXRzKys7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBjYWNoZWQuZGF0YSxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdMb2FkZWQgZnJvbSBjYWNoZSdcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgZmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBmaWxlIHNpemVcclxuICAgICAgaWYgKGZpbGUuc2l6ZSA+IHRoaXMuY29uZmlnLm1heEltYWdlU2l6ZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBJbWFnZUxvYWRFcnJvcihgSW1hZ2UgdG9vIGxhcmdlOiAke2ZpbGUuc2l6ZX0gYnl0ZXMgKG1heDogJHt0aGlzLmNvbmZpZy5tYXhJbWFnZVNpemV9KWApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBpbWcgPSBhd2FpdCB0aGlzLmNyZWF0ZUltYWdlRnJvbUZpbGUoZmlsZSwgb3B0aW9ucyk7XG4gICAgICBcclxuICAgICAgLy8gQ2FjaGUgdGhlIGltYWdlXHJcbiAgICAgIHRoaXMuY2FjaGVJbWFnZShjYWNoZUtleSwgaW1nLCBmaWxlLnNpemUpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnaW1hZ2U6bG9hZGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaWxlLm5hbWUsIHNpemU6IGZpbGUuc2l6ZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBpbWcsXHJcbiAgICAgICAgbWVzc2FnZTogYEltYWdlIGxvYWRlZDogJHtmaWxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsb2FkIGltYWdlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBsb2FkVGlmZkltYWdlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBvcHRpb25zPzogVGlmZlByb2Nlc3NpbmdPcHRpb25zKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEhUTUxJbWFnZUVsZW1lbnQ+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgZmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBVc2UgZHluYW1pYyBpbXBvcnQgZm9yIFRJRkYuanMgKGxvYWRlZCBmcm9tIENETilcclxuICAgICAgaWYgKHR5cGVvZiAod2luZG93IGFzIGFueSkuVGlmZiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgSW1hZ2VMb2FkRXJyb3IoJ1RJRkYuanMgbGlicmFyeSBub3QgbG9hZGVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpO1xyXG4gICAgICBjb25zdCB0aWZmID0gbmV3ICh3aW5kb3cgYXMgYW55KS5UaWZmKHsgYnVmZmVyOiBhcnJheUJ1ZmZlciB9KTtcclxuICAgICAgY29uc3QgY2FudmFzID0gdGlmZi50b0NhbnZhcygpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4gcmVzb2x2ZSgpO1xyXG4gICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBJbWFnZUxvYWRFcnJvcignRmFpbGVkIHRvIGNvbnZlcnQgVElGRiBjYW52YXMgdG8gaW1hZ2UnKSk7XHJcbiAgICAgICAgaW1nLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdpbWFnZTp0aWZmLWxvYWRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogZmlsZS5uYW1lLCBzaXplOiBmaWxlLnNpemUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW1nLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBUSUZGIGltYWdlIGxvYWRlZDogJHtmaWxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsb2FkIFRJRkYgaW1hZ2U6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGdldEltYWdlSW5mbyhmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxJbWFnZUluZm8+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgZmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgIGNvbnN0IGltZyA9IGF3YWl0IHRoaXMuY3JlYXRlSW1hZ2VGcm9tRmlsZShmaWxlKTtcclxuXHJcbiAgICAgIGNvbnN0IGluZm86IEltYWdlSW5mbyA9IHtcclxuICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXHJcbiAgICAgICAgd2lkdGg6IGltZy5uYXR1cmFsV2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBpbWcubmF0dXJhbEhlaWdodCxcclxuICAgICAgICBzaXplOiBmaWxlLnNpemUsXHJcbiAgICAgICAgZm9ybWF0OiB0aGlzLmdldEZpbGVFeHRlbnNpb24oZmlsZS5uYW1lKSxcclxuICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKGZpbGUubGFzdE1vZGlmaWVkKVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGluZm8sXHJcbiAgICAgICAgbWVzc2FnZTogYEltYWdlIGluZm8gcmV0cmlldmVkOiAke2ZpbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGdldCBpbWFnZSBpbmZvOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBMYWJlbCBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbG9hZExhYmVscyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8WW9sb0xhYmVsW10+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBsYWJlbEZpbGVOYW1lID0gdGhpcy5nZXRMYWJlbEZpbGVOYW1lKGZpbGVOYW1lKTtcclxuICAgICAgY29uc3QgbGFiZWxGaWxlSGFuZGxlID0gYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUobGFiZWxGaWxlTmFtZSk7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBsYWJlbEZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBjb25zdCB5b2xvRGF0YSA9IGF3YWl0IGZpbGUudGV4dCgpO1xyXG5cclxuICAgICAgaWYgKCF5b2xvRGF0YS50cmltKCkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ05vIGxhYmVscyBmb3VuZCdcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBwYXJzZVJlc3VsdCA9IFlvbG9QYXJzZXIucGFyc2VZb2xvU3RyaW5nKHlvbG9EYXRhKTtcclxuICAgICAgXHJcbiAgICAgIGlmIChwYXJzZVJlc3VsdC5lcnJvcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiBgWU9MTyBwYXJzaW5nIGVycm9yczogJHtwYXJzZVJlc3VsdC5lcnJvcnMuam9pbignLCAnKX1gXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnbGFiZWxzOmxvYWRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZSwgbGFiZWxDb3VudDogcGFyc2VSZXN1bHQubGFiZWxzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBwYXJzZVJlc3VsdC5sYWJlbHMsXHJcbiAgICAgICAgbWVzc2FnZTogYExvYWRlZCAke3BhcnNlUmVzdWx0LmxhYmVscy5sZW5ndGh9IGxhYmVsc2BcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICBtZXNzYWdlOiAnTm8gbGFiZWwgZmlsZSBmb3VuZCdcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxvYWQgbGFiZWxzOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzYXZlTGFiZWxzKGZpbGVOYW1lOiBzdHJpbmcsIGxhYmVsczogWW9sb0xhYmVsW10sIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbGFiZWxGaWxlTmFtZSA9IHRoaXMuZ2V0TGFiZWxGaWxlTmFtZShmaWxlTmFtZSk7XHJcbiAgICAgIGNvbnN0IHlvbG9TdHJpbmcgPSBZb2xvUGFyc2VyLmxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHMsIHtcclxuICAgICAgICBwcmVjaXNpb246IHRoaXMuY29uZmlnLnlvbG9WYWxpZGF0aW9uLnByZWNpc2lvbixcclxuICAgICAgICB2YWxpZGF0ZUJvdW5kczogdGhpcy5jb25maWcueW9sb1ZhbGlkYXRpb24uc3RyaWN0Qm91bmRzXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZmlsZUhhbmRsZSA9IGF3YWl0IGZvbGRlckhhbmRsZS5nZXRGaWxlSGFuZGxlKGxhYmVsRmlsZU5hbWUsIHsgY3JlYXRlOiB0cnVlIH0pO1xyXG4gICAgICBjb25zdCB3cml0YWJsZSA9IGF3YWl0IGZpbGVIYW5kbGUuY3JlYXRlV3JpdGFibGUoKTtcclxuICAgICAgYXdhaXQgd3JpdGFibGUud3JpdGUoeW9sb1N0cmluZy50cmltKCkpO1xyXG4gICAgICBhd2FpdCB3cml0YWJsZS5jbG9zZSgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnbGFiZWxzOnNhdmVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lLCBsYWJlbENvdW50OiBsYWJlbHMubGVuZ3RoIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBMYWJlbHMgc2F2ZWQgdG8gJHtsYWJlbEZpbGVOYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2F2ZSBsYWJlbHM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGNoZWNrTGFiZWxTdGF0dXMoZmlsZU5hbWU6IHN0cmluZywgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PExhYmVsU3RhdHVzPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbGFiZWxGaWxlTmFtZSA9IHRoaXMuZ2V0TGFiZWxGaWxlTmFtZShmaWxlTmFtZSk7XHJcbiAgICAgIFxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGxhYmVsRmlsZUhhbmRsZSA9IGF3YWl0IGZvbGRlckhhbmRsZS5nZXRGaWxlSGFuZGxlKGxhYmVsRmlsZU5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBsYWJlbEZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmaWxlLnRleHQoKTtcclxuICAgICAgICBjb25zdCBwYXJzZVJlc3VsdCA9IFlvbG9QYXJzZXIucGFyc2VZb2xvU3RyaW5nKGNvbnRlbnQpO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0dXM6IExhYmVsU3RhdHVzID0ge1xyXG4gICAgICAgICAgZmlsZU5hbWUsXHJcbiAgICAgICAgICBoYXNMYWJlbHM6IHBhcnNlUmVzdWx0LmxhYmVscy5sZW5ndGggPiAwLFxyXG4gICAgICAgICAgbGFiZWxDb3VudDogcGFyc2VSZXN1bHQubGFiZWxzLmxlbmd0aCxcclxuICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoZmlsZS5sYXN0TW9kaWZpZWQpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBzdGF0dXMsXHJcbiAgICAgICAgICBtZXNzYWdlOiBgTGFiZWwgc3RhdHVzIGNoZWNrZWQ6ICR7ZmlsZU5hbWV9YFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XHJcbiAgICAgICAgICBjb25zdCBzdGF0dXM6IExhYmVsU3RhdHVzID0ge1xyXG4gICAgICAgICAgICBmaWxlTmFtZSxcclxuICAgICAgICAgICAgaGFzTGFiZWxzOiBmYWxzZSxcclxuICAgICAgICAgICAgbGFiZWxDb3VudDogMFxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgICBkYXRhOiBzdGF0dXMsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdObyBsYWJlbCBmaWxlIGZvdW5kJ1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gY2hlY2sgbGFiZWwgc3RhdHVzOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDbGFzcyBGaWxlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhc3luYyBsb2FkQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PENsYXNzRmlsZUNvbnRlbnQ+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgZmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmaWxlLnRleHQoKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IHZhbGlkYXRpb24gPSB0aGlzLnZhbGlkYXRlQ2xhc3NGaWxlKGNvbnRlbnQpO1xyXG4gICAgICBpZiAoIXZhbGlkYXRpb24uaXNWYWxpZCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiBgSW52YWxpZCBjbGFzcyBmaWxlOiAke3ZhbGlkYXRpb24uZXJyb3JzLmpvaW4oJywgJyl9YFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGNsYXNzZXM6IENsYXNzRGVmaW5pdGlvbltdID0gW107XHJcbiAgICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdCgnXFxuJyk7XHJcbiAgICAgIFxyXG4gICAgICBsaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRyaW1tZWRMaW5lID0gbGluZS50cmltKCk7XHJcbiAgICAgICAgaWYgKHRyaW1tZWRMaW5lLnN0YXJ0c1dpdGgoJyMnKSB8fCB0cmltbWVkTGluZSA9PT0gJycpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgcGFydHMgPSB0cmltbWVkTGluZS5zcGxpdCgnOicpO1xyXG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPj0gMikge1xyXG4gICAgICAgICAgY29uc3QgaWQgPSBwYXJzZUludChwYXJ0c1swXSEudHJpbSgpLCAxMCk7XHJcbiAgICAgICAgICBjb25zdCBuYW1lID0gcGFydHMuc2xpY2UoMSkuam9pbignOicpLnRyaW0oKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKCFpc05hTihpZCkgJiYgbmFtZSkge1xyXG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgIGlkLFxyXG4gICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICBjb2xvcjogdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBjbGFzc0ZpbGVDb250ZW50OiBDbGFzc0ZpbGVDb250ZW50ID0ge1xyXG4gICAgICAgIGNsYXNzZXMsXHJcbiAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKGZpbGUubGFzdE1vZGlmaWVkKSxcclxuICAgICAgICAgIG1vZGlmaWVkOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZClcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGFzc2VzOmxvYWRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogZmlsZS5uYW1lLCBjbGFzc0NvdW50OiBjbGFzc2VzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBjbGFzc0ZpbGVDb250ZW50LFxyXG4gICAgICAgIG1lc3NhZ2U6IGBMb2FkZWQgJHtjbGFzc2VzLmxlbmd0aH0gY2xhc3NlcyBmcm9tICR7ZmlsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbG9hZCBjbGFzcyBmaWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzYXZlQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBjb250ZW50OiBDbGFzc0ZpbGVDb250ZW50KTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBTb3J0IGNsYXNzZXMgYnkgSURcclxuICAgICAgY29uc3Qgc29ydGVkQ2xhc3NlcyA9IFsuLi5jb250ZW50LmNsYXNzZXNdLnNvcnQoKGEsIGIpID0+IGEuaWQgLSBiLmlkKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGxpbmVzID0gc29ydGVkQ2xhc3Nlcy5tYXAoY2xzID0+IGAke2Nscy5pZH06ICR7Y2xzLm5hbWV9YCk7XHJcbiAgICAgIGNvbnN0IGZpbGVDb250ZW50ID0gbGluZXMuam9pbignXFxuJyk7XHJcblxyXG4gICAgICBjb25zdCB3cml0YWJsZSA9IGF3YWl0IGZpbGVIYW5kbGUuY3JlYXRlV3JpdGFibGUoKTtcclxuICAgICAgYXdhaXQgd3JpdGFibGUud3JpdGUoZmlsZUNvbnRlbnQpO1xyXG4gICAgICBhd2FpdCB3cml0YWJsZS5jbG9zZSgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnY2xhc3NlczpzYXZlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogZmlsZUhhbmRsZS5uYW1lLCBjbGFzc0NvdW50OiBjb250ZW50LmNsYXNzZXMubGVuZ3RoIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBTYXZlZCAke2NvbnRlbnQuY2xhc3Nlcy5sZW5ndGh9IGNsYXNzZXMgdG8gJHtmaWxlSGFuZGxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzYXZlIGNsYXNzIGZpbGU6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGNyZWF0ZUNsYXNzRmlsZShmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUsIGZpbGVOYW1lOiBzdHJpbmcsIGluaXRpYWxDb250ZW50PzogQ2xhc3NGaWxlQ29udGVudCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRmlsZUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIEVuc3VyZSAueWFtbCBleHRlbnNpb25cclxuICAgICAgY29uc3QgZmluYWxGaWxlTmFtZSA9IGZpbGVOYW1lLmVuZHNXaXRoKCcueWFtbCcpIHx8IGZpbGVOYW1lLmVuZHNXaXRoKCcueW1sJykgXHJcbiAgICAgICAgPyBmaWxlTmFtZSBcclxuICAgICAgICA6IGAke2ZpbGVOYW1lfS55YW1sYDtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGZpbGUgYWxyZWFkeSBleGlzdHNcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShmaW5hbEZpbGVOYW1lKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogYEZpbGUgXCIke2ZpbmFsRmlsZU5hbWV9XCIgYWxyZWFkeSBleGlzdHNgXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBGaWxlIGRvZXNuJ3QgZXhpc3QsIHdoaWNoIGlzIHdoYXQgd2Ugd2FudFxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkZWZhdWx0Q29udGVudDogQ2xhc3NGaWxlQ29udGVudCA9IGluaXRpYWxDb250ZW50IHx8IHtcclxuICAgICAgICBjbGFzc2VzOiBbXHJcbiAgICAgICAgICB7IGlkOiAwLCBuYW1lOiAnY2xhc3MxJyB9LFxyXG4gICAgICAgICAgeyBpZDogMSwgbmFtZTogJ2NsYXNzMicgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0F1dG8tZ2VuZXJhdGVkIGNsYXNzIGZpbGUnXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29uc3QgZmlsZUhhbmRsZSA9IGF3YWl0IGZvbGRlckhhbmRsZS5nZXRGaWxlSGFuZGxlKGZpbmFsRmlsZU5hbWUsIHsgY3JlYXRlOiB0cnVlIH0pO1xyXG4gICAgICBhd2FpdCB0aGlzLnNhdmVDbGFzc0ZpbGUoZmlsZUhhbmRsZSwgZGVmYXVsdENvbnRlbnQpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnY2xhc3NlczpmaWxlLWNyZWF0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbmFsRmlsZU5hbWUsIGNsYXNzQ291bnQ6IGRlZmF1bHRDb250ZW50LmNsYXNzZXMubGVuZ3RoIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGZpbGVIYW5kbGUsXHJcbiAgICAgICAgbWVzc2FnZTogYENyZWF0ZWQgY2xhc3MgZmlsZTogJHtmaW5hbEZpbGVOYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gY3JlYXRlIGNsYXNzIGZpbGU6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHZhbGlkYXRlQ2xhc3NGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IENsYXNzRmlsZVZhbGlkYXRpb24ge1xyXG4gICAgY29uc3QgcmVzdWx0OiBDbGFzc0ZpbGVWYWxpZGF0aW9uID0ge1xyXG4gICAgICBpc1ZhbGlkOiB0cnVlLFxyXG4gICAgICBlcnJvcnM6IFtdLFxyXG4gICAgICB3YXJuaW5nczogW10sXHJcbiAgICAgIGR1cGxpY2F0ZUlkczogW10sXHJcbiAgICAgIGVtcHR5TmFtZXM6IFtdXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdCgnXFxuJyk7XHJcbiAgICBjb25zdCBzZWVuSWRzID0gbmV3IFNldDxudW1iZXI+KCk7XHJcbiAgICBcclxuICAgIGxpbmVzLmZvckVhY2goKGxpbmUsIGxpbmVJbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmltbWVkTGluZSA9IGxpbmUudHJpbSgpO1xyXG4gICAgICBpZiAodHJpbW1lZExpbmUuc3RhcnRzV2l0aCgnIycpIHx8IHRyaW1tZWRMaW5lID09PSAnJykgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgcGFydHMgPSB0cmltbWVkTGluZS5zcGxpdCgnOicpO1xyXG4gICAgICBpZiAocGFydHMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBJbnZhbGlkIGZvcm1hdC4gRXhwZWN0ZWQgXCJpZDogbmFtZVwiYCk7XHJcbiAgICAgICAgcmVzdWx0LmlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGlkU3RyID0gcGFydHNbMF0hLnRyaW0oKTtcclxuICAgICAgY29uc3QgbmFtZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJzonKS50cmltKCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBpZCA9IHBhcnNlSW50KGlkU3RyLCAxMCk7XHJcbiAgICAgIGlmIChpc05hTihpZCkgfHwgU3RyaW5nKGlkKSAhPT0gaWRTdHIpIHtcclxuICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYExpbmUgJHtsaW5lSW5kZXggKyAxfTogSW52YWxpZCBJRCBcIiR7aWRTdHJ9XCIuIE11c3QgYmUgYW4gaW50ZWdlcmApO1xyXG4gICAgICAgIHJlc3VsdC5pc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSBpZiAoc2Vlbklkcy5oYXMoaWQpKSB7XHJcbiAgICAgICAgcmVzdWx0LmR1cGxpY2F0ZUlkcy5wdXNoKGlkKTtcclxuICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYExpbmUgJHtsaW5lSW5kZXggKyAxfTogRHVwbGljYXRlIElEIFwiJHtpZH1cImApO1xyXG4gICAgICAgIHJlc3VsdC5pc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2Vlbklkcy5hZGQoaWQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICByZXN1bHQuZW1wdHlOYW1lcy5wdXNoKGlkU3RyKTtcclxuICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYExpbmUgJHtsaW5lSW5kZXggKyAxfTogRW1wdHkgY2xhc3MgbmFtZSBmb3IgSUQgXCIke2lkU3RyfVwiYCk7XHJcbiAgICAgICAgcmVzdWx0LmlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBZT0xPIEZvcm1hdCBQcm9jZXNzaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgcGFyc2VZb2xvU3RyaW5nKHlvbG9EYXRhOiBzdHJpbmcpOiBZb2xvUGFyc2VSZXN1bHQge1xyXG4gICAgcmV0dXJuIFlvbG9QYXJzZXIucGFyc2VZb2xvU3RyaW5nKHlvbG9EYXRhKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBsYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzOiBZb2xvTGFiZWxbXSwgb3B0aW9ucz86IFlvbG9FeHBvcnRPcHRpb25zKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBZb2xvUGFyc2VyLmxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHMsIG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHZhbGlkYXRlWW9sb0xhYmVsKGxhYmVsOiBZb2xvTGFiZWwpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBZb2xvUGFyc2VyLnZhbGlkYXRlWW9sb0xhYmVsKGxhYmVsKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDYWNoZSBNYW5hZ2VtZW50XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgY2xlYXJJbWFnZUNhY2hlKCk6IHZvaWQge1xyXG4gICAgLy8gUmV2b2tlIGFsbCBibG9iIFVSTHMgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgaWYgKGVudHJ5LmRhdGEuc3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGVudHJ5LmRhdGEuc3JjKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5jbGVhcigpO1xyXG4gICAgXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6Y2xlYXJlZCcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q2FjaGVTdGF0cygpOiBDYWNoZVN0YXRzIHtcclxuICAgIGxldCB0b3RhbFNpemUgPSAwO1xyXG4gICAgbGV0IHRvdGFsSGl0cyA9IDA7XHJcbiAgICBsZXQgdG90YWxBY2Nlc3NlcyA9IDA7XHJcblxyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgICB0b3RhbFNpemUgKz0gZW50cnkuc2l6ZTtcclxuICAgICAgdG90YWxIaXRzICs9IGVudHJ5LmhpdHM7XHJcbiAgICAgIHRvdGFsQWNjZXNzZXMgKz0gZW50cnkuaGl0cyArIDE7IC8vICsxIGZvciBpbml0aWFsIGxvYWRcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRvdGFsRW50cmllczogdGhpcy5pbWFnZUNhY2hlLnNpemUsXHJcbiAgICAgIHRvdGFsU2l6ZSxcclxuICAgICAgaGl0UmF0ZTogdG90YWxBY2Nlc3NlcyA+IDAgPyB0b3RhbEhpdHMgLyB0b3RhbEFjY2Vzc2VzIDogMCxcclxuICAgICAgbWVtb3J5VXNhZ2U6IHRvdGFsU2l6ZSAvICgxMDI0ICogMTAyNCkgLy8gTUJcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3B0aW1pemVDYWNoZSgpOiB2b2lkIHtcclxuICAgIC8vIFJlbW92ZSBleHBpcmVkIGVudHJpZXNcclxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICBjb25zdCBleHBpcmVkS2V5czogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuZm9yRWFjaCgoZW50cnksIGtleSkgPT4ge1xyXG4gICAgICBpZiAobm93LmdldFRpbWUoKSAtIGVudHJ5LnRpbWVzdGFtcC5nZXRUaW1lKCkgPiB0aGlzLmNvbmZpZy5jYWNoZVRpbWVvdXQpIHtcclxuICAgICAgICBleHBpcmVkS2V5cy5wdXNoKGtleSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGV4cGlyZWRLZXlzLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmltYWdlQ2FjaGUuZ2V0KGtleSk7XHJcbiAgICAgIGlmIChlbnRyeSAmJiBlbnRyeS5kYXRhLnNyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChlbnRyeS5kYXRhLnNyYyk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5pbWFnZUNhY2hlLmRlbGV0ZShrZXkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSWYgc3RpbGwgb3ZlciBsaW1pdCwgcmVtb3ZlIGxlYXN0IHJlY2VudGx5IHVzZWRcclxuICAgIGlmICh0aGlzLmdldFRvdGFsQ2FjaGVTaXplKCkgPiB0aGlzLmNvbmZpZy5tYXhDYWNoZVNpemUpIHtcclxuICAgICAgY29uc3QgZW50cmllcyA9IEFycmF5LmZyb20odGhpcy5pbWFnZUNhY2hlLmVudHJpZXMoKSkuc29ydCgoYSwgYikgPT4gXHJcbiAgICAgICAgYVsxXS50aW1lc3RhbXAuZ2V0VGltZSgpIC0gYlsxXS50aW1lc3RhbXAuZ2V0VGltZSgpXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB3aGlsZSAodGhpcy5nZXRUb3RhbENhY2hlU2l6ZSgpID4gdGhpcy5jb25maWcubWF4Q2FjaGVTaXplICYmIGVudHJpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IFtrZXksIGVudHJ5XSA9IGVudHJpZXMuc2hpZnQoKSE7XHJcbiAgICAgICAgaWYgKGVudHJ5LmRhdGEuc3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcclxuICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZW50cnkuZGF0YS5zcmMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmltYWdlQ2FjaGUuZGVsZXRlKGtleSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6b3B0aW1pemVkJyxcclxuICAgICAgZGF0YTogeyByZW1vdmVkRXhwaXJlZDogZXhwaXJlZEtleXMubGVuZ3RoIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgU3lzdGVtXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEZpbGVTeXN0ZW1FdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQodHlwZSwgW10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSkhLnB1c2goaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEZpbGVTeXN0ZW1FdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgY29uc3QgaW5kZXggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGhhbmRsZXJzIS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEZpbGVTeXN0ZW1FdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycyEuZm9yRWFjaChoYW5kbGVyID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIEZpbGVTeXN0ZW0gZXZlbnQgaGFuZGxlciBmb3IgJHtldmVudC50eXBlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQcml2YXRlIFV0aWxpdHkgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBnZXRGaWxlRXh0ZW5zaW9uKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgbGFzdERvdCA9IGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJyk7XHJcbiAgICByZXR1cm4gbGFzdERvdCA+IDAgPyBmaWxlTmFtZS5zdWJzdHJpbmcobGFzdERvdCArIDEpIDogJyc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldExhYmVsRmlsZU5hbWUoaW1hZ2VGaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBpbWFnZUZpbGVOYW1lLnJlcGxhY2UoL1xcLlteLy5dKyQvLCAnLnR4dCcpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVJbWFnZUZyb21GaWxlKGZpbGU6IEZpbGUsIG9wdGlvbnM/OiBJbWFnZUxvYWRPcHRpb25zKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcclxuICAgICAgXHJcbiAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgICAgIHJlc29sdmUoaW1nKTtcclxuICAgICAgfTtcclxuICAgICAgXHJcbiAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcclxuICAgICAgICByZWplY3QobmV3IEltYWdlTG9hZEVycm9yKGBGYWlsZWQgdG8gbG9hZCBpbWFnZTogJHtmaWxlLm5hbWV9YCwgZmlsZS5uYW1lKSk7XHJcbiAgICAgIH07XHJcbiAgICAgIFxyXG4gICAgICBpbWcuc3JjID0gdXJsO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhY2hlSW1hZ2Uoa2V5OiBzdHJpbmcsIGltZzogSFRNTEltYWdlRWxlbWVudCwgc2l6ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvLyBPcHRpbWl6ZSBjYWNoZSBiZWZvcmUgYWRkaW5nIG5ldyBlbnRyeVxyXG4gICAgaWYgKHRoaXMuZ2V0VG90YWxDYWNoZVNpemUoKSArIHNpemUgPiB0aGlzLmNvbmZpZy5tYXhDYWNoZVNpemUpIHtcclxuICAgICAgdGhpcy5vcHRpbWl6ZUNhY2hlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZW50cnk6IENhY2hlRW50cnk8SFRNTEltYWdlRWxlbWVudD4gPSB7XHJcbiAgICAgIGRhdGE6IGltZyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxyXG4gICAgICBzaXplLFxyXG4gICAgICBoaXRzOiAwXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5zZXQoa2V5LCBlbnRyeSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzQ2FjaGVWYWxpZChlbnRyeTogQ2FjaGVFbnRyeTxIVE1MSW1hZ2VFbGVtZW50Pik6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgIHJldHVybiBub3cuZ2V0VGltZSgpIC0gZW50cnkudGltZXN0YW1wLmdldFRpbWUoKSA8IHRoaXMuY29uZmlnLmNhY2hlVGltZW91dDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VG90YWxDYWNoZVNpemUoKTogbnVtYmVyIHtcclxuICAgIGxldCB0b3RhbCA9IDA7XHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICAgIHRvdGFsICs9IGVudHJ5LnNpemU7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0b3RhbDtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBGdW5jdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBGaWxlU3lzdGVtU2VydmljZSBpbnN0YW5jZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlKGNvbmZpZz86IFBhcnRpYWw8RmlsZVN5c3RlbUNvbmZpZz4pOiBGaWxlU3lzdGVtU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBGaWxlU3lzdGVtU2VydmljZShjb25maWcpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIEZpbGVTeXN0ZW1TZXJ2aWNlIHdpdGggY3VzdG9tIGNhY2hlIHNpemVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGaWxlU3lzdGVtU2VydmljZVdpdGhDYWNoZShjYWNoZVNpemU6IG51bWJlcik6IEZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IEZpbGVTeXN0ZW1TZXJ2aWNlKHsgbWF4Q2FjaGVTaXplOiBjYWNoZVNpemUgfSk7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRXhwb3J0c1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGaWxlU3lzdGVtU2VydmljZTtcclxuZXhwb3J0IHR5cGUgeyBJRmlsZVN5c3RlbVNlcnZpY2UsIEZpbGVTeXN0ZW1Db25maWcgfTtcbiIsIi8qKlxyXG4gKiBTZXJ2aWNlcyBNb2R1bGUgSW5kZXhcclxuICogXHJcbiAqIENlbnRyYWwgZXhwb3J0IHBvaW50IGZvciBhbGwgc2VydmljZSBjbGFzc2VzIHVzZWQgdGhyb3VnaG91dCB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogVGhpcyBtb2R1bGUgcHJvdmlkZXMgY2xlYW4gQVBJIGFjY2VzcyB0byBidXNpbmVzcyBsb2dpYyBhbmQgZXh0ZXJuYWwgc2VydmljZSBpbnRlZ3JhdGlvbnMuXHJcbiAqL1xyXG5cclxuLy8gRXhwb3J0IEZpbGVTeXN0ZW1TZXJ2aWNlXHJcbmV4cG9ydCB7IFxyXG4gIEZpbGVTeXN0ZW1TZXJ2aWNlLCBcclxuICBjcmVhdGVGaWxlU3lzdGVtU2VydmljZSwgXHJcbiAgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2VXaXRoQ2FjaGUsXHJcbiAgdHlwZSBJRmlsZVN5c3RlbVNlcnZpY2UsXHJcbiAgdHlwZSBGaWxlU3lzdGVtQ29uZmlnXHJcbn0gZnJvbSAnLi9GaWxlU3lzdGVtU2VydmljZSc7XHJcblxyXG4vLyBSZS1leHBvcnQgWW9sb1BhcnNlciBmcm9tIHV0aWxzIGZvciBjb252ZW5pZW5jZVxyXG5leHBvcnQgeyBZb2xvUGFyc2VyLCBwYXJzZVlvbG8sIGV4cG9ydFlvbG8gfSBmcm9tICcuLi91dGlscy95b2xvLXBhcnNlcic7XHJcblxyXG4vLyBSZS1leHBvcnQgdHlwZXMgZm9yIGNvbnZlbmllbmNlXHJcbmV4cG9ydCB0eXBlIHtcclxuICBGaWxlT3BlcmF0aW9uUmVzdWx0LFxyXG4gIEZpbGVMb2FkUmVzdWx0LFxyXG4gIFlvbG9MYWJlbCxcclxuICBZb2xvUGFyc2VSZXN1bHQsXHJcbiAgWW9sb0V4cG9ydE9wdGlvbnMsXHJcbiAgQ2xhc3NGaWxlQ29udGVudCxcclxuICBDbGFzc0ZpbGVWYWxpZGF0aW9uLFxyXG4gIEZvbGRlclNjYW5SZXN1bHQsXHJcbiAgTGFiZWxTdGF0dXMsXHJcbiAgSW1hZ2VJbmZvLFxyXG4gIEltYWdlTG9hZE9wdGlvbnMsXHJcbiAgVGlmZlByb2Nlc3NpbmdPcHRpb25zLFxyXG4gIENhY2hlRW50cnksXHJcbiAgQ2FjaGVTdGF0cyxcclxuICBGaWxlU3lzdGVtRXZlbnQsXHJcbiAgRmlsZVN5c3RlbUV2ZW50SGFuZGxlcixcclxuICBGaWxlU3lzdGVtRXJyb3IsXHJcbiAgSW1hZ2VMb2FkRXJyb3IsXHJcbiAgWW9sb0Zvcm1hdEVycm9yLFxyXG4gIEZpbGVGb3JtYXQsXHJcbiAgTGFiZWxGb3JtYXQsXHJcbiAgQ2xhc3NGaWxlRm9ybWF0LFxyXG4gIEZpbGVUeXBlSW5mbyxcclxuICBGaWxlU3lzdGVtU2VydmljZUZhY3RvcnlcclxufSBmcm9tICcuLi90eXBlcy9maWxlc3lzdGVtJzsiLCJjb25zdCBfX1dFQlBBQ0tfTkFNRVNQQUNFX09CSkVDVF9fID0gZmFicmljOyIsIi8qKlxyXG4gKiBDYW52YXMgQ29udHJvbGxlciBJbXBsZW1lbnRhdGlvblxyXG4gKlxyXG4gKiBNYW5hZ2VzIEZhYnJpYy5qcyBjYW52YXMgb3BlcmF0aW9ucyBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqIEhhbmRsZXMgYm91bmRpbmcgYm94IGRyYXdpbmcsIGVkaXRpbmcsIHpvb20vcGFuIGNvbnRyb2xzLCBhbmQgbGFiZWwgdmlzdWFsaXphdGlvbi5cclxuICpcclxuICogQHZlcnNpb24gMS4wLjBcclxuICogQGF1dGhvciBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZmFicmljIH0gZnJvbSAnZmFicmljJztcbmltcG9ydCB7XHJcbiAgSUNhbnZhc0NvbnRyb2xsZXIsXHJcbiAgQ2FudmFzU3RhdGUsXHJcbiAgQ2FudmFzQ29uZmlnLFxyXG4gIENhbnZhc0RpbWVuc2lvbnMsXHJcbiAgQm91bmRpbmdCb3gsXHJcbiAgWU9MT0xhYmVsLFxyXG4gIEZhYnJpY1JlY3RhbmdsZSxcclxuICBGYWJyaWNUZXh0LFxyXG4gIEZhYnJpY0xpbmUsXHJcbiAgQ2FudmFzRXZlbnQsXHJcbiAgQ2FudmFzRXZlbnRIYW5kbGVyLFxyXG4gIENhbnZhc0V2ZW50VHlwZSxcclxuICBEcmF3aW5nT3B0aW9ucyxcclxuICBMYWJlbERpc3BsYXlPcHRpb25zLFxyXG4gIFZpZXdwb3J0U3RhdGUsXHJcbiAgQ2FudmFzQ29vcmRpbmF0ZSxcclxuICBJbWFnZUNvb3JkaW5hdGUsXHJcbiAgQ2FudmFzVmFsaWRhdGlvbixcclxuICBDYW52YXNQZXJmb3JtYW5jZVxyXG59IGZyb20gJy4uL3R5cGVzL2NhbnZhcyc7XHJcblxyXG5pbXBvcnQgeyBQb2ludCwgUmVjdGFuZ2xlLCBTaXplIH0gZnJvbSAnLi4vdHlwZXMnO1xuLy8gUnVudGltZSBhbGlhcyBmb3IgZ2xvYmFsIEZhYnJpY0pTIHdoZW4gdXNpbmcgQ0ROIGV4dGVybmFsc1xuY29uc3QgRmFicmljSlM6IGFueSA9ICh0eXBlb2YgKHdpbmRvdyBhcyBhbnkpICE9PSAndW5kZWZpbmVkJyAmJiAod2luZG93IGFzIGFueSkuZmFicmljKSA/ICh3aW5kb3cgYXMgYW55KS5mYWJyaWMgOiAoZmFicmljIGFzIHVua25vd24gYXMgYW55KTtcbmltcG9ydCB7IElBcHBTdGF0ZSB9IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcbmltcG9ydCB7IGNvbG9yUGFsZXR0ZSB9IGZyb20gJy4uL3V0aWxzL2NvbG9yLXBhbGV0dGUnO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBDYW52YXMgQ29udHJvbGxlciBJbXBsZW1lbnRhdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgY2xhc3MgQ2FudmFzQ29udHJvbGxlciBpbXBsZW1lbnRzIElDYW52YXNDb250cm9sbGVyIHtcclxuICBwcml2YXRlIF9jYW52YXM6IGZhYnJpYy5DYW52YXMgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIF9zdGF0ZTogQ2FudmFzU3RhdGU7XHJcbiAgcHJpdmF0ZSBfY29uZmlnOiBDYW52YXNDb25maWc7XHJcbiAgcHJpdmF0ZSBfZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPENhbnZhc0V2ZW50VHlwZSwgQ2FudmFzRXZlbnRIYW5kbGVyW10+KCk7XHJcblxyXG4gIC8vIERlcGVuZGVuY2llc1xyXG4gIHByaXZhdGUgYXBwU3RhdGU6IElBcHBTdGF0ZTtcclxuXHJcbiAgLy8gQ2FudmFzIGNvbnRhaW5lciBhbmQgaW1hZ2VcclxuICBwcml2YXRlIGNvbnRhaW5lckVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBjdXJyZW50SW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIGltYWdlT2JqZWN0OiBmYWJyaWMuSW1hZ2UgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLy8gRHJhd2luZyBzdGF0ZVxyXG4gIHByaXZhdGUgZHJhd2luZ09wdGlvbnM6IERyYXdpbmdPcHRpb25zID0ge1xyXG4gICAgc3Ryb2tlV2lkdGg6IDIsXHJcbiAgICBzdHJva2U6ICcjZmYwMDAwJyxcclxuICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXHJcbiAgICBvcGFjaXR5OiAxLFxyXG4gICAgc2VsZWN0YWJsZTogdHJ1ZSxcclxuICAgIGV2ZW50ZWQ6IHRydWVcclxuICB9O1xyXG5cclxuICBwcml2YXRlIGxhYmVsT3B0aW9uczogTGFiZWxEaXNwbGF5T3B0aW9ucyA9IHtcclxuICAgIHNob3dMYWJlbHM6IHRydWUsXHJcbiAgICBmb250U2l6ZTogMTQsXHJcbiAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxyXG4gICAgZm9udENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNyknLFxyXG4gICAgc2hvd0NvbmZpZGVuY2U6IGZhbHNlLFxyXG4gICAgc2hvd0NsYXNzTmFtZTogdHJ1ZSxcclxuICAgIHNob3dDbGFzc0lkOiB0cnVlXHJcbiAgfTtcclxuXHJcbiAgLy8gUGVyZm9ybWFuY2UgbW9uaXRvcmluZ1xyXG4gIHByaXZhdGUgcGVyZm9ybWFuY2VNZXRyaWNzOiBDYW52YXNQZXJmb3JtYW5jZSA9IHtcclxuICAgIHJlbmRlclRpbWU6IDAsXHJcbiAgICBvYmplY3RDb3VudDogMCxcclxuICAgIG1lbW9yeVVzYWdlOiAwLFxyXG4gICAgZnBzOiA2MFxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcFN0YXRlOiBJQXBwU3RhdGUpIHtcbiAgICB0aGlzLmFwcFN0YXRlID0gYXBwU3RhdGU7XG5cclxuICAgIC8vIEluaXRpYWxpemUgZGVmYXVsdCBjb25maWdcclxuICAgIHRoaXMuX2NvbmZpZyA9IHtcclxuICAgICAgd2lkdGg6IDgwMCxcclxuICAgICAgaGVpZ2h0OiA2MDAsXHJcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGY5ZmEnLFxyXG4gICAgICBzZWxlY3Rpb246IHRydWUsXHJcbiAgICAgIHByZXNlcnZlT2JqZWN0U3RhY2tpbmc6IHRydWUsXHJcbiAgICAgIHJlbmRlck9uQWRkUmVtb3ZlOiB0cnVlLFxyXG4gICAgICBza2lwVGFyZ2V0RmluZDogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBzdGF0ZVxuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgaXNEcmF3aW5nOiBmYWxzZSxcclxuICAgICAgZHJhd2luZ01vZGU6ICdub25lJyxcclxuICAgICAgc3RhcnRQb2ludDogbnVsbCxcclxuICAgICAgZW5kUG9pbnQ6IG51bGwsXHJcbiAgICAgIGN1cnJlbnRSZWN0OiBudWxsLFxyXG4gICAgICBhY3RpdmVMYWJlbFRleHQ6IG51bGwsXHJcbiAgICAgIGNyb3NzaGFpclg6IG51bGwsXHJcbiAgICAgIGNyb3NzaGFpclk6IG51bGwsXHJcbiAgICAgIHpvb206IDEsXHJcbiAgICAgIHBhblg6IDAsXHJcbiAgICAgIHBhblk6IDAsXHJcbiAgICAgIHNlbGVjdGVkT2JqZWN0czogW10sXHJcbiAgICAgIG11bHRpcGxlU2VsZWN0aW9uOiBmYWxzZVxyXG4gICAgfTtcblxuICAgIC8vIFJlYWN0IHRvIG1vZGUgY2hhbmdlcyBmcm9tIEFwcFN0YXRlXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuYXBwU3RhdGUuYWRkRXZlbnRMaXN0ZW5lcignbW9kZTpjaGFuZ2VkJywgKGV2dDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBldnQ/LmRhdGE/LmN1cnJlbnQgYXMgKCdkcmF3JyB8ICdlZGl0JykgfCB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYXBwbHlNb2RlU2V0dGluZ3MoY3VycmVudCk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIHt9XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQcm9wZXJ0aWVzIChJQ2FudmFzQ29udHJvbGxlciBpbnRlcmZhY2UpXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgZ2V0IGNhbnZhcygpOiBmYWJyaWMuQ2FudmFzIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudmFzIG5vdCBpbml0aWFsaXplZC4gQ2FsbCBpbml0aWFsaXplQ2FudmFzKCkgZmlyc3QuJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBzdGF0ZSgpOiBDYW52YXNTdGF0ZSB7XHJcbiAgICByZXR1cm4geyAuLi50aGlzLl9zdGF0ZSB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBjb25maWcoKTogQ2FudmFzQ29uZmlnIHtcclxuICAgIHJldHVybiB7IC4uLnRoaXMuX2NvbmZpZyB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFN0YXRlIEFjY2Vzc29yc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGlzRHJhd2luZygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5pc0RyYXdpbmc7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzU2VsZWN0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLnNlbGVjdGVkT2JqZWN0cy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFpvb20oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZS56b29tO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFBhbigpOiBQb2ludCB7XHJcbiAgICByZXR1cm4geyB4OiB0aGlzLl9zdGF0ZS5wYW5YLCB5OiB0aGlzLl9zdGF0ZS5wYW5ZIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0RGltZW5zaW9ucygpOiBDYW52YXNEaW1lbnNpb25zIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHdpZHRoOiB0aGlzLl9jb25maWcud2lkdGgsXHJcbiAgICAgIGhlaWdodDogdGhpcy5fY29uZmlnLmhlaWdodCxcclxuICAgICAgYXNwZWN0UmF0aW86IHRoaXMuX2NvbmZpZy53aWR0aCAvIHRoaXMuX2NvbmZpZy5oZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW5pdGlhbGl6YXRpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBpbml0aWFsaXplQ2FudmFzKGNvbnRhaW5lcklkOiBzdHJpbmcsIGNvbmZpZz86IFBhcnRpYWw8Q2FudmFzQ29uZmlnPik6IHZvaWQge1xuICAgIC8vIEFwcGx5IGNvbmZpZyBvdmVycmlkZXNcclxuICAgIGlmIChjb25maWcpIHtcclxuICAgICAgdGhpcy5fY29uZmlnID0geyAuLi50aGlzLl9jb25maWcsIC4uLmNvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpbmQgY29udGFpbmVyIGVsZW1lbnRcclxuICAgIHRoaXMuY29udGFpbmVyRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklkKTtcclxuICAgIGlmICghdGhpcy5jb250YWluZXJFbGVtZW50KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FudmFzIGNvbnRhaW5lciBlbGVtZW50IHdpdGggSUQgJyR7Y29udGFpbmVySWR9JyBub3QgZm91bmRgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgY2FudmFzIGVsZW1lbnRcclxuICAgIGNvbnN0IGNhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIGNhbnZhc0VsZW1lbnQuaWQgPSBgJHtjb250YWluZXJJZH0tY2FudmFzYDtcclxuICAgIGNhbnZhc0VsZW1lbnQud2lkdGggPSB0aGlzLl9jb25maWcud2lkdGg7XHJcbiAgICBjYW52YXNFbGVtZW50LmhlaWdodCA9IHRoaXMuX2NvbmZpZy5oZWlnaHQ7XHJcblxyXG4gICAgLy8gQ2xlYXIgY29udGFpbmVyIGFuZCBhZGQgY2FudmFzXG4gICAgdGhpcy5jb250YWluZXJFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hcHBlbmRDaGlsZChjYW52YXNFbGVtZW50KTtcblxuICAgIC8vIEluaXRpYWxpemUgRmFicmljLmpzIGNhbnZhc1xuICAgIHRoaXMuX2NhbnZhcyA9IG5ldyBGYWJyaWNKUy5DYW52YXMoY2FudmFzRWxlbWVudCwge1xuICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLl9jb25maWcuYmFja2dyb3VuZENvbG9yLFxyXG4gICAgICBzZWxlY3Rpb246IHRoaXMuX2NvbmZpZy5zZWxlY3Rpb24sXHJcbiAgICAgIHByZXNlcnZlT2JqZWN0U3RhY2tpbmc6IHRoaXMuX2NvbmZpZy5wcmVzZXJ2ZU9iamVjdFN0YWNraW5nLFxyXG4gICAgICByZW5kZXJPbkFkZFJlbW92ZTogdGhpcy5fY29uZmlnLnJlbmRlck9uQWRkUmVtb3ZlLFxyXG4gICAgICBza2lwVGFyZ2V0RmluZDogdGhpcy5fY29uZmlnLnNraXBUYXJnZXRGaW5kLFxyXG4gICAgICB3aWR0aDogdGhpcy5fY29uZmlnLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IHRoaXMuX2NvbmZpZy5oZWlnaHQsXHJcbiAgICAgIC8vIEVuYWJsZSBoaWdoIERQSSBzdXBwb3J0XHJcbiAgICAgIGVuYWJsZVJldGluYVNjYWxpbmc6IHRydWUsXHJcbiAgICAgIC8vIFBlcmZvcm1hbmNlIHNldHRpbmdzXHJcbiAgICAgIHN0YXRlZnVsOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFrZSBjYW52YXMgZmlsbCBjb250YWluZXJcbiAgICB0aGlzLnJlc2l6ZUNhbnZhc1RvQ29udGFpbmVyKCk7XG5cbiAgICAvLyBTZXR1cCBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuc2V0dXBDYW52YXNFdmVudHMoKTtcblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBjb250ZXh0IG1lbnUgYW5kIHRvZ2dsZSBtb2RlIG9uIHJpZ2h0LWNsaWNrIHdpdGhpbiBjb250YWluZXJcbiAgICB0cnkge1xuICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGUuYnV0dG9uID09PSAyKSB7IC8vIFJpZ2h0IGNsaWNrXG4gICAgICAgICAgdGhpcy5hcHBTdGF0ZS50b2dnbGVNb2RlKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIHt9XG5cbiAgICAvLyBBcHBseSBsYWJlbCBvcHRpb25zIGZyb20gYXBwIHN0YXRlXG4gICAgdGhpcy5zeW5jV2l0aEFwcFN0YXRlKCk7XG5cbiAgICAvLyBBcHBseSBjdXJyZW50IG1vZGUgc2V0dGluZ3MgdG8gY2FudmFzXG4gICAgdGhpcy5hcHBseU1vZGVTZXR0aW5ncyh0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlKTtcblxuICAgIC8vIFJlc2l6ZSBjYW52YXMgb24gd2luZG93IHJlc2l6ZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlc2l6ZUNhbnZhc1RvQ29udGFpbmVyKCk7XG4gICAgICBpZiAodGhpcy5jdXJyZW50SW1hZ2UgJiYgdGhpcy5pbWFnZU9iamVjdCkge1xuICAgICAgICBjb25zdCBwcmV2Wm9vbSA9IHRoaXMuX3N0YXRlLnpvb207XG4gICAgICAgIHRoaXMucmVzZXRab29tKCk7XG4gICAgICAgIHRoaXMucmVzaXplVG9JbWFnZSh0aGlzLmN1cnJlbnRJbWFnZSk7XG4gICAgICAgIHRoaXMuc2V0Wm9vbShwcmV2Wm9vbSk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlcXVlc3RSZW5kZXIoKTtcbiAgICB9KTtcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2FmdGVyOnJlbmRlcicsXHJcbiAgICAgIGRhdGE6IHsgaW5pdGlhbGl6ZWQ6IHRydWUgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVzdHJveUNhbnZhcygpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5fY2FudmFzID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb250YWluZXJFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCBzdGF0ZVxyXG4gICAgdGhpcy5fc3RhdGUgPSB7XHJcbiAgICAgIGlzRHJhd2luZzogZmFsc2UsXHJcbiAgICAgIGRyYXdpbmdNb2RlOiAnbm9uZScsXHJcbiAgICAgIHN0YXJ0UG9pbnQ6IG51bGwsXHJcbiAgICAgIGVuZFBvaW50OiBudWxsLFxyXG4gICAgICBjdXJyZW50UmVjdDogbnVsbCxcclxuICAgICAgYWN0aXZlTGFiZWxUZXh0OiBudWxsLFxyXG4gICAgICBjcm9zc2hhaXJYOiBudWxsLFxyXG4gICAgICBjcm9zc2hhaXJZOiBudWxsLFxyXG4gICAgICB6b29tOiAxLFxyXG4gICAgICBwYW5YOiAwLFxyXG4gICAgICBwYW5ZOiAwLFxyXG4gICAgICBzZWxlY3RlZE9iamVjdHM6IFtdLFxyXG4gICAgICBtdWx0aXBsZVNlbGVjdGlvbjogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5pbWFnZU9iamVjdCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGxvYWRJbWFnZShpbWFnZUVsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgLy8gUmVtb3ZlIGV4aXN0aW5nIGltYWdlXHJcbiAgICB0aGlzLmNsZWFySW1hZ2UoKTtcclxuXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZSA9IGltYWdlRWxlbWVudDtcclxuXHJcbiAgICAvLyBDcmVhdGUgZmFicmljIGltYWdlIG9iamVjdFxyXG4gICAgdGhpcy5pbWFnZU9iamVjdCA9IG5ldyBGYWJyaWNKUy5JbWFnZShpbWFnZUVsZW1lbnQsIHtcbiAgICAgIGxlZnQ6IDAsXHJcbiAgICAgIHRvcDogMCxcclxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXHJcbiAgICAgIGV2ZW50ZWQ6IGZhbHNlLFxyXG4gICAgICBsb2NrTW92ZW1lbnRYOiB0cnVlLFxyXG4gICAgICBsb2NrTW92ZW1lbnRZOiB0cnVlLFxyXG4gICAgICBsb2NrUm90YXRpb246IHRydWUsXHJcbiAgICAgIGxvY2tTY2FsaW5nWDogdHJ1ZSxcclxuICAgICAgbG9ja1NjYWxpbmdZOiB0cnVlLFxyXG4gICAgICBsb2NrVW5pU2NhbGluZzogdHJ1ZSxcclxuICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxyXG4gICAgICBoYXNCb3JkZXJzOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUmVzaXplIGNhbnZhcyB0byBtYXRjaCBpbWFnZVxyXG4gICAgdGhpcy5yZXNpemVUb0ltYWdlKGltYWdlRWxlbWVudCk7XHJcblxyXG4gICAgLy8gQWRkIGltYWdlIHRvIGNhbnZhcyAoc2VuZCB0byBiYWNrKVxyXG4gICAgdGhpcy5fY2FudmFzLmFkZCh0aGlzLmltYWdlT2JqZWN0ISBhcyB1bmtub3duIGFzIGZhYnJpYy5PYmplY3QpO1xuICAgIHRoaXMuaW1hZ2VPYmplY3QhLnNlbmRUb0JhY2soKTtcblxyXG4gICAgLy8gUmVzZXQgdmlld3BvcnRcclxuICAgIHRoaXMucmVzZXRab29tKCk7XHJcbiAgICB0aGlzLnJlc2V0UGFuKCk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdhZnRlcjpyZW5kZXInLFxyXG4gICAgICBkYXRhOiB7IGltYWdlTG9hZGVkOiB0cnVlLCBpbWFnZURpbWVuc2lvbnM6IHsgd2lkdGg6IGltYWdlRWxlbWVudC53aWR0aCwgaGVpZ2h0OiBpbWFnZUVsZW1lbnQuaGVpZ2h0IH0gfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2xlYXJJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgaWYgKHRoaXMuaW1hZ2VPYmplY3QpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZSh0aGlzLmltYWdlT2JqZWN0KTtcclxuICAgICAgdGhpcy5pbWFnZU9iamVjdCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZVRvSW1hZ2UoaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuICAgIC8vIEVuc3VyZSBjYW52YXMgbWF0Y2hlcyBjb250YWluZXIgc2l6ZVxuICAgIHRoaXMucmVzaXplQ2FudmFzVG9Db250YWluZXIoKTtcblxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gdGhpcy5fY2FudmFzLmdldFdpZHRoKCk7XG4gICAgY29uc3QgY2FudmFzSGVpZ2h0ID0gdGhpcy5fY2FudmFzLmdldEhlaWdodCgpO1xuXG4gICAgLy8gU2NhbGUgaW1hZ2UgdG8gZml0IGluc2lkZSBjYW52YXMgYW5kIGNlbnRlciBpdFxuICAgIGlmICh0aGlzLmltYWdlT2JqZWN0KSB7XG4gICAgICBjb25zdCBzY2FsZSA9IE1hdGgubWluKGNhbnZhc1dpZHRoIC8gaW1hZ2Uud2lkdGgsIGNhbnZhc0hlaWdodCAvIGltYWdlLmhlaWdodCk7XG4gICAgICBjb25zdCBzY2FsZWRXID0gaW1hZ2Uud2lkdGggKiBzY2FsZTtcbiAgICAgIGNvbnN0IHNjYWxlZEggPSBpbWFnZS5oZWlnaHQgKiBzY2FsZTtcbiAgICAgIHRoaXMuaW1hZ2VPYmplY3Quc2V0KHtcbiAgICAgICAgc2NhbGVYOiBzY2FsZSxcbiAgICAgICAgc2NhbGVZOiBzY2FsZSxcbiAgICAgICAgbGVmdDogKGNhbnZhc1dpZHRoIC0gc2NhbGVkVykgLyAyLFxuICAgICAgICB0b3A6IChjYW52YXNIZWlnaHQgLSBzY2FsZWRIKSAvIDJcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fY2FudmFzLmNlbnRlck9iamVjdCh0aGlzLmltYWdlT2JqZWN0IGFzIGFueSk7XG4gICAgICAodGhpcy5pbWFnZU9iamVjdCBhcyBhbnkpLnNldENvb3JkcygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVzaXplQ2FudmFzVG9Db250YWluZXIoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW52YXMgfHwgIXRoaXMuY29udGFpbmVyRWxlbWVudCkgcmV0dXJuO1xuICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNvbnRhaW5lckVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKHJlY3Qud2lkdGgpKTtcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKHJlY3QuaGVpZ2h0KSk7XG4gICAgdGhpcy5fY29uZmlnID0geyAuLi50aGlzLl9jb25maWcsIHdpZHRoLCBoZWlnaHQgfTtcbiAgICB0aGlzLl9jYW52YXMuc2V0RGltZW5zaW9ucyh7IHdpZHRoLCBoZWlnaHQgfSk7XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBEcmF3aW5nIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYXdpbmcocG9pbnQ6IFBvaW50KTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCB0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlICE9PSAnZHJhdycpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9zdGF0ZS5pc0RyYXdpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5fc3RhdGUuZHJhd2luZ01vZGUgPSAncmVjdGFuZ2xlJztcclxuICAgIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQgPSBwb2ludDtcclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRlbXBvcmFyeSByZWN0YW5nbGUgZm9yIGRyYXdpbmcgZmVlZGJhY2tcclxuICAgIGNvbnN0IHJlY3QgPSBuZXcgRmFicmljSlMuUmVjdCh7XG4gICAgICBsZWZ0OiBwb2ludC54LFxyXG4gICAgICB0b3A6IHBvaW50LnksXHJcbiAgICAgIHdpZHRoOiAwLFxyXG4gICAgICBoZWlnaHQ6IDAsXHJcbiAgICAgIC4uLnRoaXMuZHJhd2luZ09wdGlvbnMsXHJcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxyXG4gICAgICBldmVudGVkOiBmYWxzZVxyXG4gICAgfSkgYXMgRmFicmljUmVjdGFuZ2xlO1xyXG5cclxuICAgIHJlY3QuaXNMYWJlbCA9IHRydWU7XHJcbiAgICB0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCA9IHJlY3Q7XHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHJlY3QpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdtb3VzZTpkb3duJyxcclxuICAgICAgcG9pbnRlcjogcG9pbnQsXHJcbiAgICAgIGRhdGE6IHsgZHJhd2luZzogdHJ1ZSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVEcmF3aW5nKHBvaW50OiBQb2ludCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMgfHwgIXRoaXMuX3N0YXRlLmlzRHJhd2luZyB8fCAhdGhpcy5fc3RhdGUuY3VycmVudFJlY3QgfHwgIXRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9zdGF0ZS5lbmRQb2ludCA9IHBvaW50O1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSByZWN0YW5nbGUgZGltZW5zaW9uc1xyXG4gICAgY29uc3QgbGVmdCA9IE1hdGgubWluKHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueCwgcG9pbnQueCk7XHJcbiAgICBjb25zdCB0b3AgPSBNYXRoLm1pbih0aGlzLl9zdGF0ZS5zdGFydFBvaW50LnksIHBvaW50LnkpO1xyXG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLmFicyhwb2ludC54IC0gdGhpcy5fc3RhdGUuc3RhcnRQb2ludC54KTtcclxuICAgIGNvbnN0IGhlaWdodCA9IE1hdGguYWJzKHBvaW50LnkgLSB0aGlzLl9zdGF0ZS5zdGFydFBvaW50LnkpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0ZW1wb3JhcnkgcmVjdGFuZ2xlXHJcbiAgICB0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdC5zZXQoe1xyXG4gICAgICBsZWZ0LFxyXG4gICAgICB0b3AsXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHRcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnbW91c2U6bW92ZScsXHJcbiAgICAgIHBvaW50ZXI6IHBvaW50LFxyXG4gICAgICBkYXRhOiB7IGRyYXdpbmc6IHRydWUsIGRpbWVuc2lvbnM6IHsgd2lkdGgsIGhlaWdodCB9IH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZpbmlzaERyYXdpbmcocG9pbnQ6IFBvaW50KTogQm91bmRpbmdCb3ggfCBudWxsIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzIHx8ICF0aGlzLl9zdGF0ZS5pc0RyYXdpbmcgfHwgIXRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0IHx8ICF0aGlzLl9zdGF0ZS5zdGFydFBvaW50KSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhd2luZygpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zdGF0ZS5lbmRQb2ludCA9IHBvaW50O1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBmaW5hbCBkaW1lbnNpb25zXHJcbiAgICBjb25zdCBsZWZ0ID0gTWF0aC5taW4odGhpcy5fc3RhdGUuc3RhcnRQb2ludC54LCBwb2ludC54KTtcclxuICAgIGNvbnN0IHRvcCA9IE1hdGgubWluKHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueSwgcG9pbnQueSk7XHJcbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKHBvaW50LnggLSB0aGlzLl9zdGF0ZS5zdGFydFBvaW50LngpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5hYnMocG9pbnQueSAtIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueSk7XHJcblxyXG4gICAgLy8gTWluaW11bSBzaXplIHZhbGlkYXRpb25cclxuICAgIGlmICh3aWR0aCA8IDUgfHwgaGVpZ2h0IDwgNSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYXdpbmcoKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29udmVydCB0byBpbWFnZSBjb29yZGluYXRlcyBpZiBpbWFnZSBpcyBsb2FkZWRcclxuICAgIGxldCBub3JtYWxpemVkQm94OiBCb3VuZGluZ0JveCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIGlmICh0aGlzLmN1cnJlbnRJbWFnZSAmJiB0aGlzLmltYWdlT2JqZWN0KSB7XHJcbiAgICAgIGNvbnN0IGltYWdlQ29vcmRzID0gdGhpcy5jYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMoeyB4OiBsZWZ0LCB5OiB0b3AgfSk7XHJcbiAgICAgIGNvbnN0IGltYWdlV2lkdGggPSBNYXRoLmFicyh3aWR0aCAvICh0aGlzLmltYWdlT2JqZWN0LnNjYWxlWCB8fCAxKSk7XHJcbiAgICAgIGNvbnN0IGltYWdlSGVpZ2h0ID0gTWF0aC5hYnMoaGVpZ2h0IC8gKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVZIHx8IDEpKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBib3VuZGluZyBib3hcclxuICAgICAgbm9ybWFsaXplZEJveCA9IHtcclxuICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZUJvdW5kaW5nQm94SWQoKSxcclxuICAgICAgICB4OiBpbWFnZUNvb3Jkcy54LFxyXG4gICAgICAgIHk6IGltYWdlQ29vcmRzLnksXHJcbiAgICAgICAgd2lkdGg6IGltYWdlV2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBpbWFnZUhlaWdodCxcclxuICAgICAgICBjbGFzc0lkOiAwLCAvLyBEZWZhdWx0IGNsYXNzXHJcbiAgICAgICAgY29sb3I6IHRoaXMuZ2V0Q2xhc3NDb2xvcigwKSxcclxuICAgICAgICBpc1Zpc2libGU6IHRydWUsXHJcbiAgICAgICAgaXNTZWxlY3RlZDogdHJ1ZSxcclxuICAgICAgICBpc1RlbXBEcmF3OiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSB0ZW1wb3JhcnkgcmVjdGFuZ2xlXHJcbiAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0KTtcclxuXHJcbiAgICAvLyBSZXNldCBkcmF3aW5nIHN0YXRlXHJcbiAgICB0aGlzLl9zdGF0ZS5pc0RyYXdpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuX3N0YXRlLmRyYXdpbmdNb2RlID0gJ25vbmUnO1xyXG4gICAgdGhpcy5fc3RhdGUuc3RhcnRQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLl9zdGF0ZS5lbmRQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCA9IG51bGw7XHJcblxyXG4gICAgLy8gQWRkIHBlcm1hbmVudCBib3VuZGluZyBib3ggaWYgdmFsaWRcclxuICAgIGlmIChub3JtYWxpemVkQm94KSB7XHJcbiAgICAgIHRoaXMuYWRkQm91bmRpbmdCb3gobm9ybWFsaXplZEJveCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdtb3VzZTp1cCcsXHJcbiAgICAgIHBvaW50ZXI6IHBvaW50LFxyXG4gICAgICBkYXRhOiB7IGRyYXdpbmc6IGZhbHNlLCBib3VuZGluZ0JveDogbm9ybWFsaXplZEJveCB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gbm9ybWFsaXplZEJveDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjYW5jZWxEcmF3aW5nKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBpZiAodGhpcy5fc3RhdGUuY3VycmVudFJlY3QpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZSh0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fc3RhdGUuaXNEcmF3aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLl9zdGF0ZS5kcmF3aW5nTW9kZSA9ICdub25lJztcclxuICAgIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQgPSBudWxsO1xyXG4gICAgdGhpcy5fc3RhdGUuZW5kUG9pbnQgPSBudWxsO1xyXG4gICAgdGhpcy5fc3RhdGUuY3VycmVudFJlY3QgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBCb3VuZGluZyBCb3ggT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFkZEJvdW5kaW5nQm94KGJib3g6IEJvdW5kaW5nQm94KTogRmFicmljUmVjdGFuZ2xlIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudmFzIG5vdCBpbml0aWFsaXplZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbnZlcnQgdG8gY2FudmFzIGNvb3JkaW5hdGVzXHJcbiAgICBjb25zdCBjYW52YXNDb29yZHMgPSB0aGlzLmltYWdlVG9DYW52YXNDb29yZGluYXRlcyh7IHg6IGJib3gueCwgeTogYmJveC55IH0pO1xyXG4gICAgY29uc3QgY2FudmFzV2lkdGggPSB0aGlzLmltYWdlT2JqZWN0ID8gYmJveC53aWR0aCAqICh0aGlzLmltYWdlT2JqZWN0LnNjYWxlWCB8fCAxKSA6IGJib3gud2lkdGg7XHJcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLmltYWdlT2JqZWN0ID8gYmJveC5oZWlnaHQgKiAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMSkgOiBiYm94LmhlaWdodDtcclxuXHJcbiAgICAvLyBDcmVhdGUgcmVjdGFuZ2xlXHJcbiAgICBjb25zdCByZWN0ID0gbmV3IEZhYnJpY0pTLlJlY3Qoe1xuICAgICAgbGVmdDogY2FudmFzQ29vcmRzLngsXHJcbiAgICAgIHRvcDogY2FudmFzQ29vcmRzLnksXHJcbiAgICAgIHdpZHRoOiBjYW52YXNXaWR0aCxcclxuICAgICAgaGVpZ2h0OiBjYW52YXNIZWlnaHQsXHJcbiAgICAgIHN0cm9rZTogYmJveC5jb2xvcixcclxuICAgICAgc3Ryb2tlV2lkdGg6IHRoaXMuZHJhd2luZ09wdGlvbnMuc3Ryb2tlV2lkdGgsXHJcbiAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgIHNlbGVjdGFibGU6IHRydWUsXHJcbiAgICAgIGV2ZW50ZWQ6IHRydWUsXHJcbiAgICAgIGhhc0NvbnRyb2xzOiB0cnVlLFxyXG4gICAgICBoYXNCb3JkZXJzOiB0cnVlLFxyXG4gICAgICBib3JkZXJDb2xvcjogYmJveC5jb2xvcixcclxuICAgICAgY29ybmVyQ29sb3I6IGJib3guY29sb3IsXHJcbiAgICAgIHRyYW5zcGFyZW50Q29ybmVyczogZmFsc2VcclxuICAgIH0pIGFzIEZhYnJpY1JlY3RhbmdsZTtcclxuXHJcbiAgICAvLyBBdHRhY2ggYm91bmRpbmcgYm94IGRhdGFcclxuICAgIHJlY3QuYm91bmRpbmdCb3ggPSBiYm94O1xyXG4gICAgcmVjdC5pc0xhYmVsID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBZGQgdG8gY2FudmFzXHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHJlY3QpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBsYWJlbCB0ZXh0IGlmIGxhYmVscyBhcmUgZW5hYmxlZFxyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dMYWJlbHMpIHtcclxuICAgICAgdGhpcy5jcmVhdGVMYWJlbFRleHQocmVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQnJpbmcgdG8gZnJvbnQgKGJ1dCBrZWVwIGJlaGluZCBhbnkgY3VycmVudCBkcmF3aW5nKVxyXG4gICAgcmVjdC5icmluZ1RvRnJvbnQoKTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ29iamVjdDphZGRlZCcsXHJcbiAgICAgIHRhcmdldDogcmVjdCxcclxuICAgICAgZGF0YTogeyBib3VuZGluZ0JveDogYmJveCB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVjdDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVCb3VuZGluZ0JveChpZDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xyXG4gICAgY29uc3QgcmVjdFRvUmVtb3ZlID0gb2JqZWN0cy5maW5kKG9iaiA9PiBvYmouYm91bmRpbmdCb3g/LmlkID09PSBpZCk7XHJcblxyXG4gICAgaWYgKHJlY3RUb1JlbW92ZSkge1xyXG4gICAgICAvLyBSZW1vdmUgYXNzb2NpYXRlZCBsYWJlbCB0ZXh0XHJcbiAgICAgIGlmIChyZWN0VG9SZW1vdmUubGFiZWxUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZShyZWN0VG9SZW1vdmUubGFiZWxUZXh0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIHJlY3RhbmdsZVxyXG4gICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHJlY3RUb1JlbW92ZSk7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdDpyZW1vdmVkJyxcclxuICAgICAgICB0YXJnZXQ6IHJlY3RUb1JlbW92ZSxcclxuICAgICAgICBkYXRhOiB7IGJvdW5kaW5nQm94SWQ6IGlkIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlQm91bmRpbmdCb3goaWQ6IHN0cmluZywgdXBkYXRlczogUGFydGlhbDxCb3VuZGluZ0JveD4pOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICBjb25zdCByZWN0ID0gb2JqZWN0cy5maW5kKG9iaiA9PiBvYmouYm91bmRpbmdCb3g/LmlkID09PSBpZCk7XHJcblxyXG4gICAgaWYgKHJlY3QgJiYgcmVjdC5ib3VuZGluZ0JveCkge1xyXG4gICAgICAvLyBVcGRhdGUgYm91bmRpbmcgYm94IGRhdGFcclxuICAgICAgT2JqZWN0LmFzc2lnbihyZWN0LmJvdW5kaW5nQm94LCB1cGRhdGVzKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB2aXN1YWwgcHJvcGVydGllc1xyXG4gICAgICBpZiAodXBkYXRlcy5jb2xvcikge1xyXG4gICAgICAgIHJlY3Quc2V0KHtcclxuICAgICAgICAgIHN0cm9rZTogdXBkYXRlcy5jb2xvcixcclxuICAgICAgICAgIGJvcmRlckNvbG9yOiB1cGRhdGVzLmNvbG9yLFxyXG4gICAgICAgICAgY29ybmVyQ29sb3I6IHVwZGF0ZXMuY29sb3JcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHVwZGF0ZXMuaXNWaXNpYmxlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZWN0LnNldCh7IHZpc2libGU6IHVwZGF0ZXMuaXNWaXNpYmxlIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVcGRhdGUgbGFiZWwgdGV4dFxyXG4gICAgICBpZiAocmVjdC5sYWJlbFRleHQpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxhYmVsVGV4dChyZWN0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0Om1vZGlmaWVkJyxcclxuICAgICAgICB0YXJnZXQ6IHJlY3QsXHJcbiAgICAgICAgZGF0YTogeyBib3VuZGluZ0JveDogcmVjdC5ib3VuZGluZ0JveCwgdXBkYXRlcyB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEJvdW5kaW5nQm94KGlkOiBzdHJpbmcpOiBCb3VuZGluZ0JveCB8IG51bGwge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xyXG4gICAgY29uc3QgcmVjdCA9IG9iamVjdHMuZmluZChvYmogPT4gb2JqLmJvdW5kaW5nQm94Py5pZCA9PT0gaWQpO1xyXG5cclxuICAgIHJldHVybiByZWN0Py5ib3VuZGluZ0JveCB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEFsbEJvdW5kaW5nQm94ZXMoKTogQm91bmRpbmdCb3hbXSB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuIFtdO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xyXG4gICAgcmV0dXJuIG9iamVjdHNcclxuICAgICAgLmZpbHRlcihvYmogPT4gb2JqLmlzTGFiZWwgJiYgb2JqLmJvdW5kaW5nQm94KVxyXG4gICAgICAubWFwKG9iaiA9PiBvYmouYm91bmRpbmdCb3ghKVxyXG4gICAgICAuZmlsdGVyKGJib3ggPT4gYmJveCAhPT0gdW5kZWZpbmVkKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTZWxlY3Rpb24gT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHNlbGVjdEJvdW5kaW5nQm94KGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICBjb25zdCByZWN0ID0gb2JqZWN0cy5maW5kKG9iaiA9PiBvYmouYm91bmRpbmdCb3g/LmlkID09PSBpZCk7XHJcblxyXG4gICAgaWYgKHJlY3QpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnNldEFjdGl2ZU9iamVjdChyZWN0KTtcclxuICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZE9iamVjdHMoKTtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlc2VsZWN0QWxsKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMuZGlzY2FyZEFjdGl2ZU9iamVjdCgpO1xyXG4gICAgdGhpcy51cGRhdGVTZWxlY3RlZE9iamVjdHMoKTtcclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2VsZWN0aW9uOmNsZWFyZWQnXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTogQm91bmRpbmdCb3hbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzXHJcbiAgICAgIC5tYXAob2JqID0+IChvYmogYXMgRmFicmljUmVjdGFuZ2xlKS5ib3VuZGluZ0JveClcclxuICAgICAgLmZpbHRlcihiYm94ID0+IGJib3ggIT09IHVuZGVmaW5lZCkgYXMgQm91bmRpbmdCb3hbXTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxlY3RlZCgpOiBCb3VuZGluZ0JveFtdIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm4gW107XHJcblxyXG4gICAgY29uc3Qgc2VsZWN0ZWRCb3hlcyA9IHRoaXMuZ2V0U2VsZWN0ZWRCb3VuZGluZ0JveGVzKCk7XHJcbiAgICBjb25zdCBhY3RpdmVPYmplY3QgPSB0aGlzLl9jYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCk7XHJcblxyXG4gICAgaWYgKGFjdGl2ZU9iamVjdCkge1xyXG4gICAgICBpZiAoYWN0aXZlT2JqZWN0LnR5cGUgPT09ICdhY3RpdmVTZWxlY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gTXVsdGlwbGUgc2VsZWN0aW9uXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gYWN0aXZlT2JqZWN0IGFzIGZhYnJpYy5BY3RpdmVTZWxlY3Rpb247XHJcbiAgICAgICAgY29uc3Qgb2JqZWN0cyA9IHNlbGVjdGlvbi5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcblxyXG4gICAgICAgIG9iamVjdHMuZm9yRWFjaChvYmogPT4ge1xyXG4gICAgICAgICAgaWYgKG9iai5pc0xhYmVsICYmIG9iai5ib3VuZGluZ0JveCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUJvdW5kaW5nQm94KG9iai5ib3VuZGluZ0JveC5pZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gU2luZ2xlIHNlbGVjdGlvblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSBhY3RpdmVPYmplY3QgYXMgRmFicmljUmVjdGFuZ2xlO1xyXG4gICAgICAgIGlmIChyZWN0LmlzTGFiZWwgJiYgcmVjdC5ib3VuZGluZ0JveCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVCb3VuZGluZ0JveChyZWN0LmJvdW5kaW5nQm94LmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRlc2VsZWN0QWxsKCk7XHJcbiAgICByZXR1cm4gc2VsZWN0ZWRCb3hlcztcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBMYWJlbCBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgc2hvd0xhYmVscygpOiB2b2lkIHtcclxuICAgIHRoaXMubGFiZWxPcHRpb25zLnNob3dMYWJlbHMgPSB0cnVlO1xyXG4gICAgdGhpcy51cGRhdGVMYWJlbHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoaWRlTGFiZWxzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyA9IGZhbHNlO1xyXG4gICAgdGhpcy51cGRhdGVMYWJlbHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVMYWJlbHMoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xyXG5cclxuICAgIG9iamVjdHMuZm9yRWFjaChvYmogPT4ge1xyXG4gICAgICBpZiAob2JqLmlzTGFiZWwgJiYgb2JqLmJvdW5kaW5nQm94KSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dMYWJlbHMgJiYgIW9iai5sYWJlbFRleHQpIHtcclxuICAgICAgICAgIHRoaXMuY3JlYXRlTGFiZWxUZXh0KG9iaik7XHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyAmJiBvYmoubGFiZWxUZXh0KSB7XHJcbiAgICAgICAgICB0aGlzLl9jYW52YXMhLnJlbW92ZShvYmoubGFiZWxUZXh0KTtcclxuICAgICAgICAgIG9iai5sYWJlbFRleHQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChvYmoubGFiZWxUZXh0KSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUxhYmVsVGV4dChvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldExhYmVsRm9udChmb250U2l6ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5mb250U2l6ZSA9IGZvbnRTaXplO1xyXG4gICAgdGhpcy51cGRhdGVMYWJlbHMoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBWaWV3cG9ydCBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgem9vbUluKCk6IHZvaWQge1xyXG4gICAgY29uc3QgbmV3Wm9vbSA9IE1hdGgubWluKHRoaXMuX3N0YXRlLnpvb20gKiAxLjIsIDUpO1xyXG4gICAgdGhpcy5zZXRab29tKG5ld1pvb20pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHpvb21PdXQoKTogdm9pZCB7XHJcbiAgICBjb25zdCBuZXdab29tID0gTWF0aC5tYXgodGhpcy5fc3RhdGUuem9vbSAvIDEuMiwgMC4xKTtcclxuICAgIHRoaXMuc2V0Wm9vbShuZXdab29tKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB6b29tVG9GaXQoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhdGhpcy5jdXJyZW50SW1hZ2UpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IHRoaXMuX2NhbnZhcy5nZXRXaWR0aCgpO1xyXG4gICAgY29uc3QgY2FudmFzSGVpZ2h0ID0gdGhpcy5fY2FudmFzLmdldEhlaWdodCgpO1xyXG4gICAgY29uc3QgaW1hZ2VXaWR0aCA9IHRoaXMuY3VycmVudEltYWdlLndpZHRoO1xyXG4gICAgY29uc3QgaW1hZ2VIZWlnaHQgPSB0aGlzLmN1cnJlbnRJbWFnZS5oZWlnaHQ7XHJcblxyXG4gICAgY29uc3Qgc2NhbGVYID0gY2FudmFzV2lkdGggLyBpbWFnZVdpZHRoO1xyXG4gICAgY29uc3Qgc2NhbGVZID0gY2FudmFzSGVpZ2h0IC8gaW1hZ2VIZWlnaHQ7XHJcbiAgICBjb25zdCB6b29tID0gTWF0aC5taW4oc2NhbGVYLCBzY2FsZVkpO1xyXG5cclxuICAgIHRoaXMuc2V0Wm9vbSh6b29tKTtcclxuICAgIHRoaXMucmVzZXRQYW4oKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldFpvb20oKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldFpvb20oMSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0Wm9vbSh6b29tOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fc3RhdGUuem9vbSA9IE1hdGgubWF4KDAuMSwgTWF0aC5taW4oNSwgem9vbSkpO1xyXG4gICAgdGhpcy5fY2FudmFzLnNldFpvb20odGhpcy5fc3RhdGUuem9vbSk7XHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2FmdGVyOnJlbmRlcicsXHJcbiAgICAgIGRhdGE6IHsgem9vbTogdGhpcy5fc3RhdGUuem9vbSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwYW5Ubyh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9zdGF0ZS5wYW5YID0geDtcclxuICAgIHRoaXMuX3N0YXRlLnBhblkgPSB5O1xyXG5cclxuICAgIGNvbnN0IHZwdCA9IHRoaXMuX2NhbnZhcy52aWV3cG9ydFRyYW5zZm9ybTtcclxuICAgIGlmICh2cHQgJiYgdnB0Lmxlbmd0aCA+PSA2KSB7XHJcbiAgICAgIHZwdFs0XSA9IHg7XHJcbiAgICAgIHZwdFs1XSA9IHk7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5zZXRWaWV3cG9ydFRyYW5zZm9ybSh2cHQpO1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXRQYW4oKTogdm9pZCB7XG4gICAgdGhpcy5wYW5UbygwLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYW4gdGhlIHZpZXdwb3J0IHNvIHRoYXQgdGhlIGdpdmVuIGltYWdlIGNvb3JkaW5hdGVzIGFwcGVhciBjZW50ZXJlZFxuICAgKi9cbiAgcHVibGljIGdvVG9JbWFnZUNvb3JkaW5hdGVzKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcblxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gdGhpcy5fY2FudmFzLmdldFdpZHRoKCk7XG4gICAgY29uc3QgY2FudmFzSGVpZ2h0ID0gdGhpcy5fY2FudmFzLmdldEhlaWdodCgpO1xuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9zdGF0ZS56b29tO1xuXG4gICAgY29uc3QgY2FudmFzUG9pbnQgPSB0aGlzLmltYWdlVG9DYW52YXNDb29yZGluYXRlcyh7IHgsIHkgfSk7XG4gICAgY29uc3QgdnB0ID0gdGhpcy5fY2FudmFzLnZpZXdwb3J0VHJhbnNmb3JtO1xuICAgIGlmICh2cHQgJiYgdnB0Lmxlbmd0aCA+PSA2KSB7XG4gICAgICB2cHRbNF0gPSBjYW52YXNXaWR0aCAvIDIgLSB6b29tICogY2FudmFzUG9pbnQueDtcbiAgICAgIHZwdFs1XSA9IGNhbnZhc0hlaWdodCAvIDIgLSB6b29tICogY2FudmFzUG9pbnQueTtcbiAgICAgIHRoaXMuX2NhbnZhcy5zZXRWaWV3cG9ydFRyYW5zZm9ybSh2cHQpO1xuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBtZXRob2QgdG8gc2V0IHpvb20gYnkgcGVyY2VudGFnZSAoZS5nLiwgMTAwID0+IDEuMClcbiAgICovXG4gIHB1YmxpYyBzZXRab29tUGVyY2VudChwZXJjZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjbGFtcGVkID0gTWF0aC5tYXgoMTAsIE1hdGgubWluKDUwMCwgcGVyY2VudCkpO1xuICAgIHRoaXMuc2V0Wm9vbShjbGFtcGVkIC8gMTAwKTtcbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENyb3NzaGFpciBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgc2hvd0Nyb3NzaGFpcihwb2ludDogUG9pbnQpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5oaWRlQ3Jvc3NoYWlyKCk7XHJcblxyXG4gICAgY29uc3QgY2FudmFzV2lkdGggPSB0aGlzLl9jYW52YXMuZ2V0V2lkdGgoKTtcclxuICAgIGNvbnN0IGNhbnZhc0hlaWdodCA9IHRoaXMuX2NhbnZhcy5nZXRIZWlnaHQoKTtcclxuXHJcbiAgICAvLyBIb3Jpem9udGFsIGxpbmVcclxuICAgIHRoaXMuX3N0YXRlLmNyb3NzaGFpclggPSBuZXcgRmFicmljSlMuTGluZShbMCwgcG9pbnQueSwgY2FudmFzV2lkdGgsIHBvaW50LnldLCB7XG4gICAgICBzdHJva2U6ICcjZmZmZmZmJyxcclxuICAgICAgc3Ryb2tlV2lkdGg6IDEsXHJcbiAgICAgIHN0cm9rZURhc2hBcnJheTogWzUsIDVdLFxyXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcclxuICAgICAgZXZlbnRlZDogZmFsc2UsXHJcbiAgICAgIGV4Y2x1ZGVGcm9tRXhwb3J0OiB0cnVlXHJcbiAgICB9KSBhcyBGYWJyaWNMaW5lO1xyXG4gICAgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclggYXMgYW55KS5pc0Nyb3NzaGFpciA9IHRydWU7XHJcbiAgICAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCBhcyBhbnkpLmNyb3NzaGFpclR5cGUgPSAnaG9yaXpvbnRhbCc7XHJcblxyXG4gICAgLy8gVmVydGljYWwgbGluZVxyXG4gICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSA9IG5ldyBGYWJyaWNKUy5MaW5lKFtwb2ludC54LCAwLCBwb2ludC54LCBjYW52YXNIZWlnaHRdLCB7XG4gICAgICBzdHJva2U6ICcjZmZmZmZmJyxcclxuICAgICAgc3Ryb2tlV2lkdGg6IDEsXHJcbiAgICAgIHN0cm9rZURhc2hBcnJheTogWzUsIDVdLFxyXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcclxuICAgICAgZXZlbnRlZDogZmFsc2UsXHJcbiAgICAgIGV4Y2x1ZGVGcm9tRXhwb3J0OiB0cnVlXHJcbiAgICB9KSBhcyBGYWJyaWNMaW5lO1xyXG4gICAgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclkgYXMgYW55KS5pc0Nyb3NzaGFpciA9IHRydWU7XHJcbiAgICAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSBhcyBhbnkpLmNyb3NzaGFpclR5cGUgPSAndmVydGljYWwnO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5hZGQodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCk7XHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHRoaXMuX3N0YXRlLmNyb3NzaGFpclkpO1xyXG5cclxuICAgIC8vIEJyaW5nIGNyb3NzaGFpciB0byBmcm9udFxyXG4gICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWC5icmluZ1RvRnJvbnQoKTtcclxuICAgIHRoaXMuX3N0YXRlLmNyb3NzaGFpclkuYnJpbmdUb0Zyb250KCk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGhpZGVDcm9zc2hhaXIoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIGlmICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYKSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCk7XHJcbiAgICAgIHRoaXMuX3N0YXRlLmNyb3NzaGFpclggPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZKSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSk7XHJcbiAgICAgIHRoaXMuX3N0YXRlLmNyb3NzaGFpclkgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVDcm9zc2hhaXIocG9pbnQ6IFBvaW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcblxuICAgIGlmICghdGhpcy5hcHBTdGF0ZS5pc0Nyb3NzaGFpclZpc2libGUpIHtcbiAgICAgIHRoaXMuaGlkZUNyb3NzaGFpcigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE9ubHkgc2hvdyBjcm9zc2hhaXIgd2hlbiBwb2ludGVyIGlzIGluc2lkZSBhIGxhYmVsIGJveCBhcmVhXG4gICAgY29uc3QgaW1nUHQgPSB0aGlzLmNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyhwb2ludCk7XG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XG4gICAgY29uc3QgaXNJbnNpZGVBbnlCb3ggPSBvYmplY3RzLnNvbWUob2JqID0+IHtcbiAgICAgIGNvbnN0IGJib3ggPSBvYmouYm91bmRpbmdCb3g7XG4gICAgICBpZiAoIW9iai5pc0xhYmVsIHx8ICFiYm94KSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBpbWdQdC54ID49IGJib3gueCAmJiBpbWdQdC54IDw9IGJib3gueCArIGJib3gud2lkdGggJiZcbiAgICAgICAgaW1nUHQueSA+PSBiYm94LnkgJiYgaW1nUHQueSA8PSBiYm94LnkgKyBiYm94LmhlaWdodFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGlmIChpc0luc2lkZUFueUJveCkge1xuICAgICAgdGhpcy5zaG93Q3Jvc3NoYWlyKHBvaW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWRlQ3Jvc3NoYWlyKCk7XG4gICAgfVxuICB9XG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ29vcmRpbmF0ZSBDb252ZXJzaW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgY2FudmFzVG9JbWFnZShjYW52YXNQb2ludDogUG9pbnQpOiBJbWFnZUNvb3JkaW5hdGUge1xyXG4gICAgY29uc3QgaW1hZ2VDb29yZHMgPSB0aGlzLmNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyhjYW52YXNQb2ludCk7XHJcbiAgICBjb25zdCBub3JtYWxpemVkID0gdGhpcy5ub3JtYWxpemVDb29yZGluYXRlcyhpbWFnZUNvb3Jkcywge1xyXG4gICAgICB3aWR0aDogdGhpcy5jdXJyZW50SW1hZ2U/LndpZHRoIHx8IDEsXHJcbiAgICAgIGhlaWdodDogdGhpcy5jdXJyZW50SW1hZ2U/LmhlaWdodCB8fCAxXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBjYW52YXNQb2ludC54LFxyXG4gICAgICB5OiBjYW52YXNQb2ludC55LFxyXG4gICAgICBpbWFnZVg6IGltYWdlQ29vcmRzLngsXHJcbiAgICAgIGltYWdlWTogaW1hZ2VDb29yZHMueSxcclxuICAgICAgbm9ybWFsaXplZFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpbWFnZVRvQ2FudmFzKGltYWdlUG9pbnQ6IFBvaW50KTogQ2FudmFzQ29vcmRpbmF0ZSB7XHJcbiAgICBjb25zdCBjYW52YXNDb29yZHMgPSB0aGlzLmltYWdlVG9DYW52YXNDb29yZGluYXRlcyhpbWFnZVBvaW50KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBpbWFnZVBvaW50LngsXHJcbiAgICAgIHk6IGltYWdlUG9pbnQueSxcclxuICAgICAgY2FudmFzWDogY2FudmFzQ29vcmRzLngsXHJcbiAgICAgIGNhbnZhc1k6IGNhbnZhc0Nvb3Jkcy55XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5vcm1hbGl6ZUNvb3JkaW5hdGVzKGltYWdlUG9pbnQ6IFBvaW50LCBpbWFnZVNpemU6IFNpemUpOiBQb2ludCB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBpbWFnZVBvaW50LnggLyBpbWFnZVNpemUud2lkdGgsXHJcbiAgICAgIHk6IGltYWdlUG9pbnQueSAvIGltYWdlU2l6ZS5oZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVub3JtYWxpemVDb29yZGluYXRlcyhub3JtYWxpemVkUG9pbnQ6IFBvaW50LCBpbWFnZVNpemU6IFNpemUpOiBQb2ludCB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBub3JtYWxpemVkUG9pbnQueCAqIGltYWdlU2l6ZS53aWR0aCxcclxuICAgICAgeTogbm9ybWFsaXplZFBvaW50LnkgKiBpbWFnZVNpemUuaGVpZ2h0XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFlPTE8gRm9ybWF0IENvbnZlcnNpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBib3VuZGluZ0JveFRvWU9MTyhiYm94OiBCb3VuZGluZ0JveCwgaW1hZ2VTaXplOiBTaXplKTogWU9MT0xhYmVsIHtcclxuICAgIGNvbnN0IGNlbnRlclggPSAoYmJveC54ICsgYmJveC53aWR0aCAvIDIpIC8gaW1hZ2VTaXplLndpZHRoO1xyXG4gICAgY29uc3QgY2VudGVyWSA9IChiYm94LnkgKyBiYm94LmhlaWdodCAvIDIpIC8gaW1hZ2VTaXplLmhlaWdodDtcclxuICAgIGNvbnN0IHdpZHRoID0gYmJveC53aWR0aCAvIGltYWdlU2l6ZS53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IGJib3guaGVpZ2h0IC8gaW1hZ2VTaXplLmhlaWdodDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjbGFzc0lkOiBiYm94LmNsYXNzSWQsXHJcbiAgICAgIGNlbnRlclgsXHJcbiAgICAgIGNlbnRlclksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHQsXHJcbiAgICAgIGNvbmZpZGVuY2U6IGJib3guY29uZmlkZW5jZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB5b2xvVG9Cb3VuZGluZ0JveCh5b2xvOiBZT0xPTGFiZWwsIGltYWdlU2l6ZTogU2l6ZSk6IEJvdW5kaW5nQm94IHtcclxuICAgIGNvbnN0IHdpZHRoID0geW9sby53aWR0aCAqIGltYWdlU2l6ZS53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHlvbG8uaGVpZ2h0ICogaW1hZ2VTaXplLmhlaWdodDtcclxuICAgIGNvbnN0IHggPSAoeW9sby5jZW50ZXJYICogaW1hZ2VTaXplLndpZHRoKSAtICh3aWR0aCAvIDIpO1xyXG4gICAgY29uc3QgeSA9ICh5b2xvLmNlbnRlclkgKiBpbWFnZVNpemUuaGVpZ2h0KSAtIChoZWlnaHQgLyAyKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpZDogdGhpcy5nZW5lcmF0ZUJvdW5kaW5nQm94SWQoKSxcclxuICAgICAgeCxcclxuICAgICAgeSxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodCxcclxuICAgICAgY2xhc3NJZDogeW9sby5jbGFzc0lkLFxyXG4gICAgICBjb2xvcjogdGhpcy5nZXRDbGFzc0NvbG9yKHlvbG8uY2xhc3NJZCksXHJcbiAgICAgIGlzVmlzaWJsZTogdHJ1ZSxcclxuICAgICAgaXNTZWxlY3RlZDogZmFsc2UsXHJcbiAgICAgIGNvbmZpZGVuY2U6IHlvbG8uY29uZmlkZW5jZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBIYW5kbGluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogQ2FudmFzRXZlbnRUeXBlLCBoYW5kbGVyOiBDYW52YXNFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpKSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBbXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9ldmVudExpc3RlbmVycy5nZXQodHlwZSkhLnB1c2goaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBDYW52YXNFdmVudFR5cGUsIGhhbmRsZXI6IENhbnZhc0V2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLl9ldmVudExpc3RlbmVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgY29uc3QgaW5kZXggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBSZW5kZXJpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXF1ZXN0UmVuZGVyKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX2NhbnZhcykge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVxdWVzdFJlbmRlckFsbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFByaXZhdGUgSGVscGVyIE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBDYW52YXNFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcblxuICAgIC8vIE1vdXNlIGV2ZW50c1xuICAgIGxldCBpc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICBsZXQgbGFzdFBvcyA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgdGhpcy5fY2FudmFzLm9uKCdtb3VzZTpkb3duJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLl9jYW52YXMhLmdldFBvaW50ZXIoZS5lKTtcbiAgICAgIHRoaXMudXBkYXRlQ3Jvc3NoYWlyKHBvaW50ZXIpO1xuXG4gICAgICAvLyBTdGFydCBwYW5uaW5nIG9uIG1pZGRsZSBjbGljayBvciB3aGVuIEFsdCBwcmVzc2VkIChyaWdodC1jbGljayByZXNlcnZlZCBmb3IgbW9kZSB0b2dnbGUpXG4gICAgICBjb25zdCBldiA9IGUuZSBhcyBNb3VzZUV2ZW50O1xuICAgICAgY29uc3Qgc3RhcnRQYW4gPSBldi5idXR0b24gPT09IDEgfHwgZXYuYWx0S2V5IHx8IChldiBhcyBhbnkpLnNwYWNlS2V5O1xuICAgICAgaWYgKHN0YXJ0UGFuKSB7XG4gICAgICAgIGlzUGFubmluZyA9IHRydWU7XG4gICAgICAgIGxhc3RQb3MgPSB7IHg6IGV2LmNsaWVudFgsIHk6IGV2LmNsaWVudFkgfTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5zZXRDdXJzb3IoJ2dyYWJiaW5nJyk7XG4gICAgICAgIHRoaXMuX2NhbnZhcyEucmVxdWVzdFJlbmRlckFsbCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlID09PSAnZHJhdycgJiYgIWUudGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuc3RhcnREcmF3aW5nKHBvaW50ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fY2FudmFzLm9uKCdtb3VzZTptb3ZlJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLl9jYW52YXMhLmdldFBvaW50ZXIoZS5lKTtcbiAgICAgIHRoaXMudXBkYXRlQ3Jvc3NoYWlyKHBvaW50ZXIpO1xuXG4gICAgICAvLyBEaXNwYXRjaCBtb3VzZSBtb3ZlIHdpdGggY2FudmFzL2ltYWdlIGNvb3JkaW5hdGVzXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpbWFnZVB0ID0gdGhpcy5jYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMocG9pbnRlcik7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgdHlwZTogJ21vdXNlOm1vdmUnLFxuICAgICAgICAgIHBvaW50ZXIsXG4gICAgICAgICAgZGF0YTogeyBjYW52YXM6IHsgeDogcG9pbnRlci54LCB5OiBwb2ludGVyLnkgfSwgaW1hZ2U6IHsgeDogaW1hZ2VQdC54LCB5OiBpbWFnZVB0LnkgfSB9XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCB7fVxuXG4gICAgICBpZiAoaXNQYW5uaW5nKSB7XG4gICAgICAgIGNvbnN0IGV2ID0gZS5lIGFzIE1vdXNlRXZlbnQ7XG4gICAgICAgIGNvbnN0IHY6IGFueSA9IHRoaXMuX2NhbnZhcyEudmlld3BvcnRUcmFuc2Zvcm0gYXMgYW55O1xuICAgICAgICBpZiAoIXYgfHwgdi5sZW5ndGggPCA2KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZbNF0gKz0gZXYuY2xpZW50WCAtIGxhc3RQb3MueDtcbiAgICAgICAgdls1XSArPSBldi5jbGllbnRZIC0gbGFzdFBvcy55O1xuICAgICAgICB0aGlzLl9jYW52YXMhLnNldFZpZXdwb3J0VHJhbnNmb3JtKHYgYXMgbnVtYmVyW10pO1xuICAgICAgICBsYXN0UG9zID0geyB4OiBldi5jbGllbnRYLCB5OiBldi5jbGllbnRZIH07XG4gICAgICAgIHRoaXMuX2NhbnZhcyEucmVxdWVzdFJlbmRlckFsbCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5pc0RyYXdpbmcpIHtcbiAgICAgICAgdGhpcy51cGRhdGVEcmF3aW5nKHBvaW50ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fY2FudmFzLm9uKCdtb3VzZTp1cCcsIChlKSA9PiB7XG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5fY2FudmFzIS5nZXRQb2ludGVyKGUuZSk7XG5cbiAgICAgIGlmIChpc1Bhbm5pbmcpIHtcbiAgICAgICAgaXNQYW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NhbnZhcyEuc2V0Q3Vyc29yKCdkZWZhdWx0Jyk7XG4gICAgICAgIHRoaXMuX2NhbnZhcyEucmVxdWVzdFJlbmRlckFsbCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5pc0RyYXdpbmcpIHtcbiAgICAgICAgdGhpcy5maW5pc2hEcmF3aW5nKHBvaW50ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXHJcbiAgICAvLyBTZWxlY3Rpb24gZXZlbnRzXHJcbiAgICB0aGlzLl9jYW52YXMub24oJ3NlbGVjdGlvbjpjcmVhdGVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoeyB0eXBlOiAnc2VsZWN0aW9uOmNyZWF0ZWQnIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLm9uKCdzZWxlY3Rpb246dXBkYXRlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZE9iamVjdHMoKTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHsgdHlwZTogJ3NlbGVjdGlvbjp1cGRhdGVkJyB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5vbignc2VsZWN0aW9uOmNsZWFyZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7IHR5cGU6ICdzZWxlY3Rpb246Y2xlYXJlZCcgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPYmplY3QgbW9kaWZpY2F0aW9uIGV2ZW50c1xyXG4gICAgdGhpcy5fY2FudmFzLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCAoZSkgPT4ge1xuICAgICAgaWYgKGUudGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuaGFuZGxlT2JqZWN0TW9kaWZpZWQoZS50YXJnZXQgYXMgRmFicmljUmVjdGFuZ2xlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFdoZWVsIHpvb20gKHpvb20gdG8gcG9pbnRlcilcbiAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOndoZWVsJywgKG9wdDogYW55KSA9PiB7XG4gICAgICBjb25zdCBkZWx0YSA9IG9wdC5lLmRlbHRhWTtcbiAgICAgIGxldCB6b29tID0gdGhpcy5fc3RhdGUuem9vbTtcbiAgICAgIHpvb20gKj0gZGVsdGEgPiAwID8gMC45IDogMS4xO1xuICAgICAgem9vbSA9IE1hdGgubWF4KDAuMSwgTWF0aC5taW4oNSwgem9vbSkpO1xuXG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBGYWJyaWNKUy5Qb2ludChvcHQuZS5vZmZzZXRYLCBvcHQuZS5vZmZzZXRZKTtcbiAgICAgIHRoaXMuX2NhbnZhcyEuem9vbVRvUG9pbnQocG9pbnQsIHpvb20pO1xuICAgICAgdGhpcy5fc3RhdGUuem9vbSA9IHpvb207XG5cbiAgICAgIG9wdC5lLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBvcHQuZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlNb2RlU2V0dGluZ3MobW9kZT86ICdkcmF3JyB8ICdlZGl0Jyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XG4gICAgY29uc3QgbSA9IG1vZGUgfHwgdGhpcy5hcHBTdGF0ZS5jdXJyZW50TW9kZTtcblxuICAgIC8vIEluIGRyYXcgbW9kZSwgZGlzYWJsZSBzZWxlY3Rpb24gYW5kIHRhcmdldCBmaW5kaW5nIHRvIG1ha2UgZHJhd2luZyBlYXNpZXJcbiAgICBjb25zdCBkcmF3TW9kZSA9IG0gPT09ICdkcmF3JztcbiAgICAodGhpcy5fY2FudmFzIGFzIGFueSkuc2VsZWN0aW9uID0gIWRyYXdNb2RlO1xuICAgICh0aGlzLl9jYW52YXMgYXMgYW55KS5za2lwVGFyZ2V0RmluZCA9IGRyYXdNb2RlO1xuXG4gICAgLy8gVXBkYXRlIG9iamVjdCBzZWxlY3RhYmlsaXR5IGJhc2VkIG9uIG1vZGVcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKTtcbiAgICBvYmplY3RzLmZvckVhY2gob2JqID0+IHtcbiAgICAgIG9iai5zZWxlY3RhYmxlID0gIWRyYXdNb2RlO1xuICAgICAgb2JqLmV2ZW50ZWQgPSAhZHJhd01vZGU7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYW52YXMucmVxdWVzdFJlbmRlckFsbCgpO1xuICB9XG5cclxuICBwcml2YXRlIHVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgYWN0aXZlT2JqZWN0ID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xyXG5cclxuICAgIGlmICghYWN0aXZlT2JqZWN0KSB7XHJcbiAgICAgIHRoaXMuX3N0YXRlLnNlbGVjdGVkT2JqZWN0cyA9IFtdO1xyXG4gICAgICB0aGlzLl9zdGF0ZS5tdWx0aXBsZVNlbGVjdGlvbiA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChhY3RpdmVPYmplY3QudHlwZSA9PT0gJ2FjdGl2ZVNlbGVjdGlvbicpIHtcclxuICAgICAgdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzID0gKGFjdGl2ZU9iamVjdCBhcyBmYWJyaWMuQWN0aXZlU2VsZWN0aW9uKS5nZXRPYmplY3RzKCk7XHJcbiAgICAgIHRoaXMuX3N0YXRlLm11bHRpcGxlU2VsZWN0aW9uID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX3N0YXRlLnNlbGVjdGVkT2JqZWN0cyA9IFthY3RpdmVPYmplY3RdO1xyXG4gICAgICB0aGlzLl9zdGF0ZS5tdWx0aXBsZVNlbGVjdGlvbiA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPYmplY3RNb2RpZmllZChyZWN0OiBGYWJyaWNSZWN0YW5nbGUpOiB2b2lkIHtcclxuICAgIGlmICghcmVjdC5pc0xhYmVsIHx8ICFyZWN0LmJvdW5kaW5nQm94IHx8ICF0aGlzLmltYWdlT2JqZWN0KSByZXR1cm47XHJcblxyXG4gICAgLy8gQ29udmVydCBiYWNrIHRvIGltYWdlIGNvb3JkaW5hdGVzXHJcbiAgICBjb25zdCBpbWFnZUNvb3JkcyA9IHRoaXMuY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKHtcclxuICAgICAgeDogcmVjdC5sZWZ0IHx8IDAsXHJcbiAgICAgIHk6IHJlY3QudG9wIHx8IDBcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGltYWdlV2lkdGggPSAocmVjdC53aWR0aCB8fCAwKSAvICh0aGlzLmltYWdlT2JqZWN0LnNjYWxlWCB8fCAxKTtcclxuICAgIGNvbnN0IGltYWdlSGVpZ2h0ID0gKHJlY3QuaGVpZ2h0IHx8IDApIC8gKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVZIHx8IDEpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBib3VuZGluZyBib3hcclxuICAgIHJlY3QuYm91bmRpbmdCb3gueCA9IGltYWdlQ29vcmRzLng7XHJcbiAgICByZWN0LmJvdW5kaW5nQm94LnkgPSBpbWFnZUNvb3Jkcy55O1xyXG4gICAgcmVjdC5ib3VuZGluZ0JveC53aWR0aCA9IGltYWdlV2lkdGg7XHJcbiAgICByZWN0LmJvdW5kaW5nQm94LmhlaWdodCA9IGltYWdlSGVpZ2h0O1xyXG5cclxuICAgIC8vIFVwZGF0ZSBsYWJlbCB0ZXh0IHBvc2l0aW9uXHJcbiAgICBpZiAocmVjdC5sYWJlbFRleHQpIHtcclxuICAgICAgdGhpcy51cGRhdGVMYWJlbFRleHQocmVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ29iamVjdDptb2RpZmllZCcsXHJcbiAgICAgIHRhcmdldDogcmVjdCxcclxuICAgICAgZGF0YTogeyBib3VuZGluZ0JveDogcmVjdC5ib3VuZGluZ0JveCB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlTGFiZWxUZXh0KHJlY3Q6IEZhYnJpY1JlY3RhbmdsZSk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMgfHwgIXJlY3QuYm91bmRpbmdCb3gpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBiYm94ID0gcmVjdC5ib3VuZGluZ0JveDtcclxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IHRoaXMuYXBwU3RhdGUuY2xhc3NOYW1lcy5nZXQoYmJveC5jbGFzc0lkLnRvU3RyaW5nKCkpIHx8IGBDbGFzcyAke2Jib3guY2xhc3NJZH1gO1xyXG5cclxuICAgIGxldCBsYWJlbFRleHQgPSAnJztcclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q2xhc3NJZCkge1xyXG4gICAgICBsYWJlbFRleHQgKz0gYmJveC5jbGFzc0lkLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0NsYXNzTmFtZSkge1xyXG4gICAgICBpZiAobGFiZWxUZXh0KSBsYWJlbFRleHQgKz0gJzogJztcclxuICAgICAgbGFiZWxUZXh0ICs9IGNsYXNzTmFtZTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q29uZmlkZW5jZSAmJiBiYm94LmNvbmZpZGVuY2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBsYWJlbFRleHQgKz0gYCAoJHsoYmJveC5jb25maWRlbmNlICogMTAwKS50b0ZpeGVkKDEpfSUpYDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0ZXh0ID0gbmV3IEZhYnJpY0pTLlRleHQobGFiZWxUZXh0LCB7XG4gICAgICBsZWZ0OiAocmVjdC5sZWZ0IHx8IDApICsgMixcbiAgICAgIHRvcDogKHJlY3QudG9wIHx8IDApIC0gdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUgLSAyLFxuICAgICAgZm9udFNpemU6IHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplLFxuICAgICAgZm9udEZhbWlseTogdGhpcy5sYWJlbE9wdGlvbnMuZm9udEZhbWlseSxcbiAgICAgIGZpbGw6IHRoaXMubGFiZWxPcHRpb25zLmZvbnRDb2xvcixcbiAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5sYWJlbE9wdGlvbnMuYmFja2dyb3VuZENvbG9yLFxuICAgICAgLy8gQXZvaWQgaW52YWxpZCBiYXNlbGluZSB2YWx1ZSB3YXJuaW5nczsgZW5zdXJlIGNhbnZhcyB1c2VzIGEgdmFsaWQgYmFzZWxpbmVcbiAgICAgIHRleHRCYXNlbGluZTogJ2FscGhhYmV0aWMnLFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICBldmVudGVkOiBmYWxzZVxuICAgIH0pIGFzIEZhYnJpY1RleHQ7XG5cclxuICAgIHRleHQucGFyZW50UmVjdCA9IHJlY3Q7XHJcbiAgICB0ZXh0LmJvdW5kaW5nQm94ID0gYmJveDtcclxuICAgIHRleHQuaXNMYWJlbCA9IHRydWU7XHJcblxyXG4gICAgcmVjdC5sYWJlbFRleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5fY2FudmFzLmFkZCh0ZXh0KTtcclxuICAgIHRleHQuYnJpbmdUb0Zyb250KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUxhYmVsVGV4dChyZWN0OiBGYWJyaWNSZWN0YW5nbGUpOiB2b2lkIHtcclxuICAgIGlmICghcmVjdC5sYWJlbFRleHQgfHwgIXJlY3QuYm91bmRpbmdCb3gpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBiYm94ID0gcmVjdC5ib3VuZGluZ0JveDtcclxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IHRoaXMuYXBwU3RhdGUuY2xhc3NOYW1lcy5nZXQoYmJveC5jbGFzc0lkLnRvU3RyaW5nKCkpIHx8IGBDbGFzcyAke2Jib3guY2xhc3NJZH1gO1xyXG5cclxuICAgIGxldCBsYWJlbFRleHQgPSAnJztcclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q2xhc3NJZCkge1xyXG4gICAgICBsYWJlbFRleHQgKz0gYmJveC5jbGFzc0lkLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0NsYXNzTmFtZSkge1xyXG4gICAgICBpZiAobGFiZWxUZXh0KSBsYWJlbFRleHQgKz0gJzogJztcclxuICAgICAgbGFiZWxUZXh0ICs9IGNsYXNzTmFtZTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q29uZmlkZW5jZSAmJiBiYm94LmNvbmZpZGVuY2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBsYWJlbFRleHQgKz0gYCAoJHsoYmJveC5jb25maWRlbmNlICogMTAwKS50b0ZpeGVkKDEpfSUpYDtcclxuICAgIH1cclxuXHJcbiAgICByZWN0LmxhYmVsVGV4dC5zZXQoe1xyXG4gICAgICB0ZXh0OiBsYWJlbFRleHQsXHJcbiAgICAgIGxlZnQ6IChyZWN0LmxlZnQgfHwgMCkgKyAyLFxyXG4gICAgICB0b3A6IChyZWN0LnRvcCB8fCAwKSAtIHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplIC0gMixcclxuICAgICAgZm9udFNpemU6IHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplLFxyXG4gICAgICBmaWxsOiB0aGlzLmxhYmVsT3B0aW9ucy5mb250Q29sb3IsXHJcbiAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5sYWJlbE9wdGlvbnMuYmFja2dyb3VuZENvbG9yXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKGNhbnZhc1BvaW50OiBQb2ludCk6IFBvaW50IHtcbiAgICBpZiAoIXRoaXMuaW1hZ2VPYmplY3QpIHJldHVybiBjYW52YXNQb2ludDtcblxuICAgIGNvbnN0IHNjYWxlWCA9IHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDE7XG4gICAgY29uc3Qgc2NhbGVZID0gdGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMTtcbiAgICBjb25zdCBpbWdMZWZ0ID0gdGhpcy5pbWFnZU9iamVjdC5sZWZ0IHx8IDA7XG4gICAgY29uc3QgaW1nVG9wID0gdGhpcy5pbWFnZU9iamVjdC50b3AgfHwgMDtcblxuICAgIHJldHVybiB7XG4gICAgICB4OiAoY2FudmFzUG9pbnQueCAtIGltZ0xlZnQpIC8gc2NhbGVYLFxuICAgICAgeTogKGNhbnZhc1BvaW50LnkgLSBpbWdUb3ApIC8gc2NhbGVZXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKGltYWdlUG9pbnQ6IFBvaW50KTogUG9pbnQge1xuICAgIGlmICghdGhpcy5pbWFnZU9iamVjdCkgcmV0dXJuIGltYWdlUG9pbnQ7XG5cbiAgICBjb25zdCBzY2FsZVggPSB0aGlzLmltYWdlT2JqZWN0LnNjYWxlWCB8fCAxO1xuICAgIGNvbnN0IHNjYWxlWSA9IHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVZIHx8IDE7XG4gICAgY29uc3QgaW1nTGVmdCA9IHRoaXMuaW1hZ2VPYmplY3QubGVmdCB8fCAwO1xuICAgIGNvbnN0IGltZ1RvcCA9IHRoaXMuaW1hZ2VPYmplY3QudG9wIHx8IDA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogaW1hZ2VQb2ludC54ICogc2NhbGVYICsgaW1nTGVmdCxcbiAgICAgIHk6IGltYWdlUG9pbnQueSAqIHNjYWxlWSArIGltZ1RvcFxuICAgIH07XG4gIH1cblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVCb3VuZGluZ0JveElkKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYGJib3hfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRDbGFzc0NvbG9yKGNsYXNzSWQ6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gY29sb3JQYWxldHRlW2NsYXNzSWQgJSBjb2xvclBhbGV0dGUubGVuZ3RoXSB8fCAnI2ZmMDAwMCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN5bmNXaXRoQXBwU3RhdGUoKTogdm9pZCB7XHJcbiAgICAvLyBTeW5jIGxhYmVsIGRpc3BsYXkgb3B0aW9ucyB3aXRoIGFwcCBzdGF0ZVxyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyA9IHRoaXMuYXBwU3RhdGUuc2hvd0xhYmVsc09uQ2FudmFzO1xyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUgPSB0aGlzLmFwcFN0YXRlLmxhYmVsRm9udFNpemU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IENhbnZhc0V2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gY2FudmFzIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVmFsaWRhdGlvbiBhbmQgUGVyZm9ybWFuY2VcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyB2YWxpZGF0ZSgpOiBDYW52YXNWYWxpZGF0aW9uIHtcclxuICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGlmICghdGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdDYW52YXMgbm90IGluaXRpYWxpemVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1cnJlbnRJbWFnZSkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdObyBpbWFnZSBsb2FkZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvYmplY3RDb3VudCA9IHRoaXMuX2NhbnZhcz8uZ2V0T2JqZWN0cygpLmxlbmd0aCB8fCAwO1xyXG4gICAgaWYgKG9iamVjdENvdW50ID4gMTAwKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goYEhpZ2ggb2JqZWN0IGNvdW50OiAke29iamVjdENvdW50fWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBwZXJmb3JtYW5jZSBtZXRyaWNzXHJcbiAgICB0aGlzLnBlcmZvcm1hbmNlTWV0cmljcy5vYmplY3RDb3VudCA9IG9iamVjdENvdW50O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3MsXHJcbiAgICAgIHBlcmZvcm1hbmNlOiB0aGlzLnBlcmZvcm1hbmNlTWV0cmljc1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBGdW5jdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2FudmFzQ29udHJvbGxlcihhcHBTdGF0ZTogSUFwcFN0YXRlKTogQ2FudmFzQ29udHJvbGxlciB7XHJcbiAgcmV0dXJuIG5ldyBDYW52YXNDb250cm9sbGVyKGFwcFN0YXRlKTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhbnZhc0NvbnRyb2xsZXI7XHJcbmV4cG9ydCB0eXBlIHsgSUNhbnZhc0NvbnRyb2xsZXIgfTtcbiIsIi8qKlxyXG4gKiBFdmVudCBNYW5hZ2VyIEltcGxlbWVudGF0aW9uXHJcbiAqXHJcbiAqIEhhbmRsZXMga2V5Ym9hcmQgc2hvcnRjdXRzLCBtb3VzZSBldmVudHMsIGNvbnRleHQgbWVudXMsIGFuZCB1c2VyIGludGVyYWN0aW9uc1xyXG4gKiBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMC4wXHJcbiAqIEBhdXRob3IgRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1pZ3JhdGlvblxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAnLi4vdHlwZXMnO1xyXG5pbXBvcnQgeyBJQXBwU3RhdGUgfSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5pbXBvcnQgeyBJQ2FudmFzQ29udHJvbGxlciwgQm91bmRpbmdCb3ggfSBmcm9tICcuLi90eXBlcy9jYW52YXMnO1xyXG5pbXBvcnQgeyBJRmlsZVN5c3RlbVNlcnZpY2UgfSBmcm9tICcuLi90eXBlcy9maWxlc3lzdGVtJztcclxuaW1wb3J0IHtcclxuICBFdmVudE1hbmFnZXJDb25maWcsXHJcbiAgS2V5Ym9hcmRTaG9ydGN1dCxcclxuICBNb3VzZUV2ZW50VHlwZSxcclxuICBDb250ZXh0TWVudUV2ZW50LFxyXG4gIEV2ZW50TWFuYWdlckV2ZW50LFxyXG4gIEV2ZW50TWFuYWdlckV2ZW50SGFuZGxlcixcclxuICBJRXZlbnRNYW5hZ2VyXHJcbn0gZnJvbSAnLi4vdHlwZXMvdWknO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFdmVudCBNYW5hZ2VyIEltcGxlbWVudGF0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIgaW1wbGVtZW50cyBJRXZlbnRNYW5hZ2VyIHtcclxuICAvLyBEZXBlbmRlbmNpZXNcclxuICBwcml2YXRlIGFwcFN0YXRlOiBJQXBwU3RhdGU7XHJcbiAgcHJpdmF0ZSBjYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcjtcclxuICBwcml2YXRlIGZpbGVTeXN0ZW1TZXJ2aWNlOiBJRmlsZVN5c3RlbVNlcnZpY2U7XHJcblxyXG4gIC8vIEV2ZW50IGhhbmRsZXJzIGFuZCBzdGF0ZVxyXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgRXZlbnRNYW5hZ2VyRXZlbnRIYW5kbGVyW10+KCk7XHJcbiAgcHJpdmF0ZSBrZXlib2FyZEhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIEtleWJvYXJkU2hvcnRjdXQ+KCk7XHJcbiAgcHJpdmF0ZSBjb250ZXh0TWVudVRhcmdldDogYW55ID0gbnVsbDtcclxuICBwcml2YXRlIGlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICBwcml2YXRlIGxhc3RNb3VzZVBvc2l0aW9uOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG5cclxuICAvLyBDb25maWd1cmF0aW9uXHJcbiAgcHJpdmF0ZSBjb25maWc6IEV2ZW50TWFuYWdlckNvbmZpZyA9IHtcclxuICAgIGVuYWJsZUtleWJvYXJkU2hvcnRjdXRzOiB0cnVlLFxyXG4gICAgZW5hYmxlQ29udGV4dE1lbnU6IHRydWUsXHJcbiAgICBlbmFibGVEcmFnQW5kRHJvcDogdHJ1ZSxcclxuICAgIGRvdWJsZUNsaWNrRGVsYXk6IDMwMCxcclxuICAgIGxvbmdQcmVzc0RlbGF5OiA1MDAsXHJcbiAgICBkcmFnVGhyZXNob2xkOiA1XHJcbiAgfTtcclxuXHJcbiAgLy8gS2V5Ym9hcmQgc2hvcnRjdXRzXHJcbiAgcHJpdmF0ZSBzaG9ydGN1dHM6IEtleWJvYXJkU2hvcnRjdXRbXSA9IFtcclxuICAgIC8vIEZpbGUgb3BlcmF0aW9uc1xyXG4gICAgeyBrZXk6ICdLZXlTJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdTYXZlIGxhYmVscycsIGFjdGlvbjogJ3NhdmUnIH0sXHJcbiAgICB7IGtleTogJ0tleU8nLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ09wZW4gZm9sZGVyJywgYWN0aW9uOiAnb3Blbi1mb2xkZXInIH0sXHJcblxyXG4gICAgLy8gTW9kZSBzd2l0Y2hpbmdcclxuICAgIHsga2V5OiAnS2V5RCcsIGRlc2NyaXB0aW9uOiAnU3dpdGNoIHRvIGRyYXcgbW9kZScsIGFjdGlvbjogJ21vZGUtZHJhdycgfSxcclxuICAgIHsga2V5OiAnS2V5RScsIGRlc2NyaXB0aW9uOiAnU3dpdGNoIHRvIGVkaXQgbW9kZScsIGFjdGlvbjogJ21vZGUtZWRpdCcgfSxcclxuICAgIHsga2V5OiAnVGFiJywgZGVzY3JpcHRpb246ICdUb2dnbGUgbW9kZScsIGFjdGlvbjogJ21vZGUtdG9nZ2xlJyB9LFxyXG5cclxuICAgIC8vIENhbnZhcyBvcGVyYXRpb25zXHJcbiAgICB7IGtleTogJ0RlbGV0ZScsIGRlc2NyaXB0aW9uOiAnRGVsZXRlIHNlbGVjdGVkJywgYWN0aW9uOiAnZGVsZXRlLXNlbGVjdGVkJyB9LFxyXG4gICAgeyBrZXk6ICdCYWNrc3BhY2UnLCBkZXNjcmlwdGlvbjogJ0RlbGV0ZSBzZWxlY3RlZCcsIGFjdGlvbjogJ2RlbGV0ZS1zZWxlY3RlZCcgfSxcclxuICAgIHsga2V5OiAnRXNjYXBlJywgZGVzY3JpcHRpb246ICdDYW5jZWwvRGVzZWxlY3QnLCBhY3Rpb246ICdjYW5jZWwnIH0sXHJcbiAgICB7IGtleTogJ0tleUEnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1NlbGVjdCBhbGwnLCBhY3Rpb246ICdzZWxlY3QtYWxsJyB9LFxyXG5cclxuICAgIC8vIFpvb20gYW5kIHZpZXdcclxuICAgIHsga2V5OiAnRXF1YWwnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1pvb20gaW4nLCBhY3Rpb246ICd6b29tLWluJyB9LFxyXG4gICAgeyBrZXk6ICdNaW51cycsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnWm9vbSBvdXQnLCBhY3Rpb246ICd6b29tLW91dCcgfSxcclxuICAgIHsga2V5OiAnRGlnaXQwJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdSZXNldCB6b29tJywgYWN0aW9uOiAnem9vbS1yZXNldCcgfSxcclxuICAgIHsga2V5OiAnS2V5RicsIGRlc2NyaXB0aW9uOiAnWm9vbSB0byBmaXQnLCBhY3Rpb246ICd6b29tLWZpdCcgfSxcclxuXHJcbiAgICAvLyBOYXZpZ2F0aW9uXHJcbiAgICB7IGtleTogJ0Fycm93TGVmdCcsIGRlc2NyaXB0aW9uOiAnUHJldmlvdXMgaW1hZ2UnLCBhY3Rpb246ICdwcmV2LWltYWdlJyB9LFxyXG4gICAgeyBrZXk6ICdBcnJvd1JpZ2h0JywgZGVzY3JpcHRpb246ICdOZXh0IGltYWdlJywgYWN0aW9uOiAnbmV4dC1pbWFnZScgfSxcclxuICAgIHsga2V5OiAnSG9tZScsIGRlc2NyaXB0aW9uOiAnRmlyc3QgaW1hZ2UnLCBhY3Rpb246ICdmaXJzdC1pbWFnZScgfSxcclxuICAgIHsga2V5OiAnRW5kJywgZGVzY3JpcHRpb246ICdMYXN0IGltYWdlJywgYWN0aW9uOiAnbGFzdC1pbWFnZScgfSxcclxuXHJcbiAgICAvLyBMYWJlbHMgYW5kIGNsYXNzZXNcclxuICAgIHsga2V5OiAnS2V5TCcsIGRlc2NyaXB0aW9uOiAnVG9nZ2xlIGxhYmVscyB2aXNpYmlsaXR5JywgYWN0aW9uOiAndG9nZ2xlLWxhYmVscycgfSxcclxuICAgIHsga2V5OiAnS2V5QycsIGRlc2NyaXB0aW9uOiAnVG9nZ2xlIGNyb3NzaGFpcicsIGFjdGlvbjogJ3RvZ2dsZS1jcm9zc2hhaXInIH0sXHJcbiAgICB7IGtleTogJ0tleUgnLCBkZXNjcmlwdGlvbjogJ1RvZ2dsZSBoZWxwJywgYWN0aW9uOiAndG9nZ2xlLWhlbHAnIH0sXHJcblxyXG4gICAgLy8gQ29weS9QYXN0ZVxyXG4gICAgeyBrZXk6ICdLZXlDJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdDb3B5IHNlbGVjdGVkJywgYWN0aW9uOiAnY29weScgfSxcclxuICAgIHsga2V5OiAnS2V5VicsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnUGFzdGUnLCBhY3Rpb246ICdwYXN0ZScgfSxcclxuICAgIHsga2V5OiAnS2V5WCcsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnQ3V0IHNlbGVjdGVkJywgYWN0aW9uOiAnY3V0JyB9LFxyXG5cclxuICAgIC8vIFVuZG8vUmVkbyAoZm9yIGZ1dHVyZSBpbXBsZW1lbnRhdGlvbilcclxuICAgIHsga2V5OiAnS2V5WicsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVW5kbycsIGFjdGlvbjogJ3VuZG8nIH0sXHJcbiAgICB7IGtleTogJ0tleVknLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1JlZG8nLCBhY3Rpb246ICdyZWRvJyB9LFxyXG4gICAgeyBrZXk6ICdLZXlaJywgY3RybEtleTogdHJ1ZSwgc2hpZnRLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnUmVkbycsIGFjdGlvbjogJ3JlZG8nIH1cclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIGFwcFN0YXRlOiBJQXBwU3RhdGUsXHJcbiAgICBjYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcixcclxuICAgIGZpbGVTeXN0ZW1TZXJ2aWNlOiBJRmlsZVN5c3RlbVNlcnZpY2UsXHJcbiAgICBjb25maWc/OiBQYXJ0aWFsPEV2ZW50TWFuYWdlckNvbmZpZz5cclxuICApIHtcclxuICAgIHRoaXMuYXBwU3RhdGUgPSBhcHBTdGF0ZTtcclxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlciA9IGNhbnZhc0NvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlID0gZmlsZVN5c3RlbVNlcnZpY2U7XHJcblxyXG4gICAgaWYgKGNvbmZpZykge1xyXG4gICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLmNvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZUV2ZW50SGFuZGxlcnMoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbml0aWFsaXphdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplRXZlbnRIYW5kbGVycygpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmNvbmZpZy5lbmFibGVLZXlib2FyZFNob3J0Y3V0cykge1xyXG4gICAgICB0aGlzLnNldHVwS2V5Ym9hcmRFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcuZW5hYmxlQ29udGV4dE1lbnUpIHtcclxuICAgICAgdGhpcy5zZXR1cENvbnRleHRNZW51RXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlnLmVuYWJsZURyYWdBbmREcm9wKSB7XHJcbiAgICAgIHRoaXMuc2V0dXBEcmFnQW5kRHJvcEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2V0dXBNb3VzZUV2ZW50cygpO1xyXG4gICAgdGhpcy5zZXR1cENhbnZhc0V2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEtleWJvYXJkIEV2ZW50IEhhbmRsaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIHNldHVwS2V5Ym9hcmRFdmVudHMoKTogdm9pZCB7XHJcbiAgICAvLyBCdWlsZCBrZXlib2FyZCBzaG9ydGN1dHMgbWFwXHJcbiAgICB0aGlzLnNob3J0Y3V0cy5mb3JFYWNoKHNob3J0Y3V0ID0+IHtcclxuICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRTaG9ydGN1dEtleShzaG9ydGN1dCk7XHJcbiAgICAgIHRoaXMua2V5Ym9hcmRIYW5kbGVycy5zZXQoa2V5LCBzaG9ydGN1dCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHbG9iYWwga2V5Ym9hcmQgZXZlbnQgbGlzdGVuZXJcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleURvd24uYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuaGFuZGxlS2V5VXAuYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUtleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIC8vIElnbm9yZSBldmVudHMgZnJvbSBpbnB1dCBlbGVtZW50cyAodW5sZXNzIGdsb2JhbCBzaG9ydGN1dHMpXHJcbiAgICBpZiAodGhpcy5pc0lucHV0RWxlbWVudChldmVudC50YXJnZXQgYXMgRWxlbWVudCkgJiYgIXRoaXMuaXNHbG9iYWxTaG9ydGN1dChldmVudCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0RXZlbnRLZXkoZXZlbnQpO1xyXG4gICAgY29uc3Qgc2hvcnRjdXQgPSB0aGlzLmtleWJvYXJkSGFuZGxlcnMuZ2V0KGtleSk7XHJcblxyXG4gICAgaWYgKHNob3J0Y3V0KSB7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICB0aGlzLmV4ZWN1dGVTaG9ydGN1dChzaG9ydGN1dCwgZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVLZXlVcChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgLy8gSGFuZGxlIGFueSBrZXkgdXAgc3BlY2lmaWMgbG9naWMgaGVyZVxyXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcclxuICAgICAgdGhpcy5oYW5kbGVFc2NhcGVLZXkoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZXhlY3V0ZVNob3J0Y3V0KHNob3J0Y3V0OiBLZXlib2FyZFNob3J0Y3V0LCBldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgc3dpdGNoIChzaG9ydGN1dC5hY3Rpb24pIHtcclxuICAgICAgLy8gRmlsZSBvcGVyYXRpb25zXHJcbiAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlU2F2ZUxhYmVscygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdvcGVuLWZvbGRlcic6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPcGVuRm9sZGVyKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBNb2RlIHN3aXRjaGluZ1xyXG4gICAgICBjYXNlICdtb2RlLWRyYXcnOlxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0TW9kZSgnZHJhdycpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtb2RlLWVkaXQnOlxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0TW9kZSgnZWRpdCcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtb2RlLXRvZ2dsZSc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS50b2dnbGVNb2RlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBDYW52YXMgb3BlcmF0aW9uc1xyXG4gICAgICBjYXNlICdkZWxldGUtc2VsZWN0ZWQnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlRGVsZXRlU2VsZWN0ZWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY2FuY2VsJzpcclxuICAgICAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdzZWxlY3QtYWxsJzpcclxuICAgICAgICB0aGlzLmhhbmRsZVNlbGVjdEFsbCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgLy8gWm9vbSBhbmQgdmlld1xyXG4gICAgICBjYXNlICd6b29tLWluJzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbUluKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3pvb20tb3V0JzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbU91dCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd6b29tLXJlc2V0JzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIucmVzZXRab29tKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3pvb20tZml0JzpcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbVRvRml0KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBOYXZpZ2F0aW9uXHJcbiAgICAgIGNhc2UgJ3ByZXYtaW1hZ2UnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlUHJldmlvdXNJbWFnZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICduZXh0LWltYWdlJzpcclxuICAgICAgICB0aGlzLmhhbmRsZU5leHRJbWFnZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdmaXJzdC1pbWFnZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVGaXJzdEltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xhc3QtaW1hZ2UnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlTGFzdEltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBMYWJlbHMgYW5kIFVJXHJcbiAgICAgIGNhc2UgJ3RvZ2dsZS1sYWJlbHMnOlxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0U2hvd0xhYmVscyghdGhpcy5hcHBTdGF0ZS5zaG93TGFiZWxzT25DYW52YXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci51cGRhdGVMYWJlbHMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndG9nZ2xlLWNyb3NzaGFpcic6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS50b2dnbGVDcm9zc2hhaXIoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIENvcHkvUGFzdGVcclxuICAgICAgY2FzZSAnY29weSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVDb3B5KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3Bhc3RlJzpcclxuICAgICAgICB0aGlzLmhhbmRsZVBhc3RlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2N1dCc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVDdXQoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIEZ1dHVyZSBmZWF0dXJlc1xyXG4gICAgICBjYXNlICd1bmRvJzpcclxuICAgICAgY2FzZSAncmVkbyc6XHJcbiAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHVuZG8vcmVkbyBzeXN0ZW1cclxuICAgICAgICBjb25zb2xlLmxvZyhgJHtzaG9ydGN1dC5hY3Rpb259IG5vdCB5ZXQgaW1wbGVtZW50ZWRgKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIHNob3J0Y3V0IGFjdGlvbjogJHtzaG9ydGN1dC5hY3Rpb259YCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3Nob3J0Y3V0OmV4ZWN1dGVkJyxcclxuICAgICAgZGF0YTogeyBzaG9ydGN1dCwgb3JpZ2luYWxFdmVudDogZXZlbnQgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTW91c2UgRXZlbnQgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBNb3VzZUV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIEdsb2JhbCBtb3VzZSB0cmFja2luZ1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZU1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZVVwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cENhbnZhc0V2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIENhbnZhcy1zcGVjaWZpYyBtb3VzZSBldmVudHMgYXJlIGhhbmRsZWQgYnkgQ2FudmFzQ29udHJvbGxlclxyXG4gICAgLy8gV2UgbGlzdGVuIHRvIGNhbnZhcyBldmVudHMgYW5kIGNvb3JkaW5hdGUgd2l0aCBvdGhlciBzeXN0ZW1zXHJcblxyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlOmRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IGV2ZW50LnBvaW50ZXIgfHwgeyB4OiAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuYXBwU3RhdGUubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlOm1vdmUnLCAoZXZlbnQpID0+IHtcclxuICAgICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IGV2ZW50LnBvaW50ZXIgfHwgeyB4OiAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuYXBwU3RhdGUubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uO1xyXG4gICAgICB0aGlzLnVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXNEaXNwbGF5KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0aW9uOmNyZWF0ZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ3NlbGVjdGlvbjpjaGFuZ2VkJyxcclxuICAgICAgICBkYXRhOiB7IGhhc1NlbGVjdGlvbjogdHJ1ZSB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdGlvbjpjbGVhcmVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdzZWxlY3Rpb246Y2hhbmdlZCcsXHJcbiAgICAgICAgZGF0YTogeyBoYXNTZWxlY3Rpb246IGZhbHNlIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlR2xvYmFsTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0RyYWdnaW5nKSB7XHJcbiAgICAgIC8vIEhhbmRsZSBkcmFnIG9wZXJhdGlvbnNcclxuICAgICAgdGhpcy5oYW5kbGVEcmFnTW92ZShldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUdsb2JhbE1vdXNlVXAoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuICAgICAgdGhpcy5oYW5kbGVEcmFnRW5kKGV2ZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDb250ZXh0IE1lbnUgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBDb250ZXh0TWVudUV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBjb250ZXh0IG1lbnUgYW5kIHNob3cgY3VzdG9tIG9uZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLmhhbmRsZUNvbnRleHRNZW51LmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDb250ZXh0TWVudShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgRWxlbWVudDtcclxuICAgIGNvbnN0IGNhbnZhc0VsZW1lbnQgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzLmdldEVsZW1lbnQoKTtcclxuXHJcbiAgICBpZiAodGFyZ2V0ID09PSBjYW52YXNFbGVtZW50IHx8IGNhbnZhc0VsZW1lbnQuY29udGFpbnModGFyZ2V0KSkge1xyXG4gICAgICB0aGlzLnNob3dDYW52YXNDb250ZXh0TWVudShldmVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNob3dHZW5lcmljQ29udGV4dE1lbnUoZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93Q2FudmFzQ29udGV4dE1lbnUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzLmdldFBvaW50ZXIoZXZlbnQpO1xyXG4gICAgY29uc3Qgc2VsZWN0ZWRCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTtcclxuXHJcbiAgICBjb25zdCBjb250ZXh0RXZlbnQ6IENvbnRleHRNZW51RXZlbnQgPSB7XHJcbiAgICAgIHR5cGU6ICdjYW52YXMnLFxyXG4gICAgICBwb3NpdGlvbjogeyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH0sXHJcbiAgICAgIGNhbnZhc1Bvc2l0aW9uOiBwb2ludGVyLFxyXG4gICAgICB0YXJnZXQ6IG51bGwsXHJcbiAgICAgIGhhc1NlbGVjdGlvbjogc2VsZWN0ZWRCb3hlcy5sZW5ndGggPiAwLFxyXG4gICAgICBzZWxlY3RlZE9iamVjdHM6IHNlbGVjdGVkQm94ZXNcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zaG93Q29udGV4dE1lbnUoY29udGV4dEV2ZW50KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd0dlbmVyaWNDb250ZXh0TWVudShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgY29udGV4dEV2ZW50OiBDb250ZXh0TWVudUV2ZW50ID0ge1xyXG4gICAgICB0eXBlOiAnZ2VuZXJpYycsXHJcbiAgICAgIHBvc2l0aW9uOiB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfSxcclxuICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQsXHJcbiAgICAgIGhhc1NlbGVjdGlvbjogZmFsc2UsXHJcbiAgICAgIHNlbGVjdGVkT2JqZWN0czogW11cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zaG93Q29udGV4dE1lbnUoY29udGV4dEV2ZW50KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd0NvbnRleHRNZW51KGNvbnRleHRFdmVudDogQ29udGV4dE1lbnVFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5jb250ZXh0TWVudVRhcmdldCA9IGNvbnRleHRFdmVudDtcclxuXHJcbiAgICAvLyBDcmVhdGUgY29udGV4dCBtZW51IGJhc2VkIG9uIHR5cGUgYW5kIHNlbGVjdGlvblxyXG4gICAgY29uc3QgbWVudUl0ZW1zID0gdGhpcy5idWlsZENvbnRleHRNZW51SXRlbXMoY29udGV4dEV2ZW50KTtcclxuXHJcbiAgICAvLyBTaG93IGNvbnRleHQgbWVudSAodGhpcyB3b3VsZCBpbnRlZ3JhdGUgd2l0aCBVSSBmcmFtZXdvcmspXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY29udGV4dC1tZW51OnNob3cnLFxyXG4gICAgICBkYXRhOiB7IGNvbnRleHQ6IGNvbnRleHRFdmVudCwgbWVudUl0ZW1zIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZENvbnRleHRNZW51SXRlbXMoY29udGV4dDogQ29udGV4dE1lbnVFdmVudCk6IGFueVtdIHtcclxuICAgIGNvbnN0IGl0ZW1zOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIGlmIChjb250ZXh0LnR5cGUgPT09ICdjYW52YXMnKSB7XHJcbiAgICAgIGlmIChjb250ZXh0Lmhhc1NlbGVjdGlvbikge1xyXG4gICAgICAgIGl0ZW1zLnB1c2goXHJcbiAgICAgICAgICB7IGxhYmVsOiAnRGVsZXRlIFNlbGVjdGVkJywgYWN0aW9uOiAnZGVsZXRlLXNlbGVjdGVkJywgc2hvcnRjdXQ6ICdEZWwnIH0sXHJcbiAgICAgICAgICB7IGxhYmVsOiAnQ29weScsIGFjdGlvbjogJ2NvcHknLCBzaG9ydGN1dDogJ0N0cmwrQycgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdDdXQnLCBhY3Rpb246ICdjdXQnLCBzaG9ydGN1dDogJ0N0cmwrWCcgfSxcclxuICAgICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGl0ZW1zLnB1c2goXHJcbiAgICAgICAgeyBsYWJlbDogJ1Bhc3RlJywgYWN0aW9uOiAncGFzdGUnLCBzaG9ydGN1dDogJ0N0cmwrVicsIGRpc2FibGVkOiAhdGhpcy5hcHBTdGF0ZS5nZXRDbGlwYm9hcmQoKSB9LFxyXG4gICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfSxcclxuICAgICAgICB7IGxhYmVsOiAnU2VsZWN0IEFsbCcsIGFjdGlvbjogJ3NlbGVjdC1hbGwnLCBzaG9ydGN1dDogJ0N0cmwrQScgfSxcclxuICAgICAgICB7IGxhYmVsOiAnRGVzZWxlY3QgQWxsJywgYWN0aW9uOiAnZGVzZWxlY3QtYWxsJywgc2hvcnRjdXQ6ICdFc2MnIH0sXHJcbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdab29tIHRvIEZpdCcsIGFjdGlvbjogJ3pvb20tZml0Jywgc2hvcnRjdXQ6ICdGJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdSZXNldCBab29tJywgYWN0aW9uOiAnem9vbS1yZXNldCcsIHNob3J0Y3V0OiAnQ3RybCswJyB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIERyYWcgYW5kIERyb3AgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBEcmFnQW5kRHJvcEV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIEZpbGUgZHJhZyBhbmQgZHJvcCBmb3IgbG9hZGluZyBpbWFnZXNcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5oYW5kbGVEcmFnT3Zlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmhhbmRsZURyb3AuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmhhbmRsZURyYWdFbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuaGFuZGxlRHJhZ0xlYXZlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnT3ZlcihldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnQuZGF0YVRyYW5zZmVyIS5kcm9wRWZmZWN0ID0gJ2NvcHknO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnRW50ZXIoZXZlbnQ6IERyYWdFdmVudCk6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIC8vIEFkZCB2aXN1YWwgZmVlZGJhY2sgZm9yIGRyYWcgb3BlcmF0aW9uXHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2RyYWctYWN0aXZlJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdMZWF2ZShldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoIWV2ZW50LnJlbGF0ZWRUYXJnZXQpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnLWFjdGl2ZScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcm9wKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctYWN0aXZlJyk7XHJcblxyXG4gICAgY29uc3QgZmlsZXMgPSBBcnJheS5mcm9tKGV2ZW50LmRhdGFUcmFuc2Zlcj8uZmlsZXMgfHwgW10pO1xyXG4gICAgY29uc3QgaW1hZ2VGaWxlcyA9IGZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUudHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSk7XHJcblxyXG4gICAgaWYgKGltYWdlRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmhhbmRsZUltYWdlRmlsZURyb3AoaW1hZ2VGaWxlc1swXSEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVJbWFnZUZpbGVEcm9wKGZpbGU6IEZpbGUpOiB2b2lkIHtcclxuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmxvYWRJbWFnZShpbWcpO1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpO1xyXG4gICAgfTtcclxuICAgIGltZy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnTW92ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgLy8gSGFuZGxlIG9iamVjdCBkcmFnZ2luZyB3aXRoaW4gY2FudmFzXHJcbiAgICAvLyBUaGlzIGlzIG1vc3RseSBoYW5kbGVkIGJ5IEZhYnJpYy5qcywgYnV0IHdlIGNhbiBhZGQgY3VzdG9tIGxvZ2ljIGhlcmVcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRHJhZ0VuZChldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQWN0aW9uIEhhbmRsZXJzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGFzeW5jIGhhbmRsZVNhdmVMYWJlbHMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIXRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZSB8fCAhdGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYm91bmRpbmdCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCk7XHJcbiAgICAgIGNvbnN0IHlvbG9MYWJlbHMgPSBib3VuZGluZ0JveGVzLm1hcChiYm94ID0+XHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmJvdW5kaW5nQm94VG9ZT0xPKGJib3gsIHtcclxuICAgICAgICAgIHdpZHRoOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8ud2lkdGggfHwgMSxcclxuICAgICAgICAgIGhlaWdodDogdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2U/LmhlaWdodCB8fCAxXHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGF3YWl0IHRoaXMuZmlsZVN5c3RlbVNlcnZpY2Uuc2F2ZUxhYmVscyhcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGUubmFtZSxcclxuICAgICAgICB5b2xvTGFiZWxzLFxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUubGFiZWxGb2xkZXJIYW5kbGVcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2xhYmVsczpzYXZlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlLm5hbWUsIGNvdW50OiB5b2xvTGFiZWxzLmxlbmd0aCB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgbGFiZWxzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3BlbkZvbGRlcigpOiB2b2lkIHtcclxuICAgIC8vIFRyaWdnZXIgZm9sZGVyIHNlbGVjdGlvbiBVSVxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ZvbGRlcjpzZWxlY3QtcmVxdWVzdGVkJyxcclxuICAgICAgZGF0YTogeyB0eXBlOiAnaW1hZ2UnIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEZWxldGVTZWxlY3RlZCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGRlbGV0ZWRCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5kZWxldGVTZWxlY3RlZCgpO1xyXG4gICAgaWYgKGRlbGV0ZWRCb3hlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdHM6ZGVsZXRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogZGVsZXRlZEJveGVzLmxlbmd0aCwgb2JqZWN0czogZGVsZXRlZEJveGVzIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBdXRvLXNhdmUgaWYgZW5hYmxlZFxyXG4gICAgICBpZiAodGhpcy5hcHBTdGF0ZS5pc0F1dG9TYXZlRW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlU2F2ZUxhYmVscygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNhbmNlbCgpOiB2b2lkIHtcclxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5kZXNlbGVjdEFsbCgpO1xyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmNhbmNlbERyYXdpbmcoKTtcclxuXHJcbiAgICBpZiAodGhpcy5jb250ZXh0TWVudVRhcmdldCkge1xyXG4gICAgICB0aGlzLmhpZGVDb250ZXh0TWVudSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVTZWxlY3RBbGwoKTogdm9pZCB7XHJcbiAgICAvLyBTZWxlY3QgYWxsIGJvdW5kaW5nIGJveGVzIG9uIGNhbnZhc1xyXG4gICAgY29uc3QgYWxsQm94ZXMgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpO1xyXG4gICAgYWxsQm94ZXMuZm9yRWFjaChiYm94ID0+IHtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnNlbGVjdEJvdW5kaW5nQm94KGJib3guaWQpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZVByZXZpb3VzSW1hZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHRoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlcy5maW5kSW5kZXgoXHJcbiAgICAgIGZpbGUgPT4gZmlsZS5uYW1lID09PSB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGU/Lm5hbWVcclxuICAgICk7XHJcblxyXG4gICAgaWYgKGN1cnJlbnRJbmRleCA+IDApIHtcclxuICAgICAgY29uc3QgcHJldkltYWdlID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzW2N1cnJlbnRJbmRleCAtIDFdITtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKHByZXZJbWFnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU5leHRJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmZpbmRJbmRleChcclxuICAgICAgZmlsZSA9PiBmaWxlLm5hbWUgPT09IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZT8ubmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoY3VycmVudEluZGV4IDwgdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgY29uc3QgbmV4dEltYWdlID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzW2N1cnJlbnRJbmRleCArIDFdITtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKG5leHRJbWFnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUZpcnN0SW1hZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKHRoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlc1swXSEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVMYXN0SW1hZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3QgbGFzdEltYWdlID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzW3RoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlcy5sZW5ndGggLSAxXSE7XHJcbiAgICAgIHRoaXMubG9hZEltYWdlRmlsZShsYXN0SW1hZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDb3B5KCk6IHZvaWQge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWRCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTtcclxuICAgIGlmIChzZWxlY3RlZEJveGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRDbGlwYm9hcmQoe1xyXG4gICAgICAgIHR5cGU6ICdib3VuZGluZy1ib3hlcycsXHJcbiAgICAgICAgZGF0YTogc2VsZWN0ZWRCb3hlcyxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGlwYm9hcmQ6Y29weScsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogc2VsZWN0ZWRCb3hlcy5sZW5ndGggfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlUGFzdGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBjbGlwYm9hcmQgPSB0aGlzLmFwcFN0YXRlLmdldENsaXBib2FyZCgpO1xyXG4gICAgaWYgKGNsaXBib2FyZCAmJiBjbGlwYm9hcmQudHlwZSA9PT0gJ2JvdW5kaW5nLWJveGVzJykge1xyXG4gICAgICBjb25zdCBib3hlcyA9IGNsaXBib2FyZC5kYXRhIGFzIEJvdW5kaW5nQm94W107XHJcblxyXG4gICAgICBib3hlcy5mb3JFYWNoKChiYm94LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIC8vIE9mZnNldCBwYXN0ZWQgYm94ZXMgc2xpZ2h0bHlcclxuICAgICAgICBjb25zdCBuZXdCYm94OiBCb3VuZGluZ0JveCA9IHtcclxuICAgICAgICAgIC4uLmJib3gsXHJcbiAgICAgICAgICBpZDogYHBhc3RlZF8ke0RhdGUubm93KCl9XyR7aW5kZXh9YCxcclxuICAgICAgICAgIHg6IGJib3gueCArIDEwLFxyXG4gICAgICAgICAgeTogYmJveC55ICsgMTAsXHJcbiAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRCb3VuZGluZ0JveChuZXdCYm94KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGlwYm9hcmQ6cGFzdGUnLFxyXG4gICAgICAgIGRhdGE6IHsgY291bnQ6IGJveGVzLmxlbmd0aCB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQXV0by1zYXZlIGlmIGVuYWJsZWRcclxuICAgICAgaWYgKHRoaXMuYXBwU3RhdGUuaXNBdXRvU2F2ZUVuYWJsZWQpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZVNhdmVMYWJlbHMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDdXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmhhbmRsZUNvcHkoKTtcclxuICAgIHRoaXMuaGFuZGxlRGVsZXRlU2VsZWN0ZWQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRXNjYXBlS2V5KCk6IHZvaWQge1xyXG4gICAgLy8gQ2FuY2VsIGFueSBhY3RpdmUgb3BlcmF0aW9uc1xyXG4gICAgdGhpcy5oYW5kbGVDYW5jZWwoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgbG9hZEltYWdlRmlsZShpbWFnZUZpbGU6IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKHRoaXMuYXBwU3RhdGUuaW1hZ2VGb2xkZXJIYW5kbGUpIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlLmxvYWRJbWFnZShpbWFnZUZpbGUuaGFuZGxlKTtcclxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICB0aGlzLmFwcFN0YXRlLnNldEN1cnJlbnRJbWFnZShpbWFnZUZpbGUpO1xuICAgICAgICAgIC8vIEtlZXAgY3VycmVudCBpbWFnZSBlbGVtZW50IGluIHN0YXRlIGZvciBzYXZlIG9wZXJhdGlvbnNcbiAgICAgICAgICB0cnkgeyAodGhpcy5hcHBTdGF0ZSBhcyBhbnkpLmN1cnJlbnRJbWFnZSA9IHJlc3VsdC5kYXRhOyB9IGNhdGNoIHt9XG4gICAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmxvYWRJbWFnZShyZXN1bHQuZGF0YSk7XG5cclxuICAgICAgICAgIC8vIExvYWQgZXhpc3RpbmcgbGFiZWxzXHJcbiAgICAgICAgICBpZiAodGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZSkge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRMYWJlbHNGb3JDdXJyZW50SW1hZ2UoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgbG9hZExhYmVsc0ZvckN1cnJlbnRJbWFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlIHx8ICF0aGlzLmFwcFN0YXRlLmxhYmVsRm9sZGVySGFuZGxlKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5maWxlU3lzdGVtU2VydmljZS5sb2FkTGFiZWxzKFxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZS5uYW1lLFxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUubGFiZWxGb2xkZXJIYW5kbGVcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xyXG4gICAgICAgIC8vIENsZWFyIGV4aXN0aW5nIGxhYmVsc1xyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCkuZm9yRWFjaChiYm94ID0+IHtcclxuICAgICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5yZW1vdmVCb3VuZGluZ0JveChiYm94LmlkKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGxvYWRlZCBsYWJlbHNcclxuICAgICAgICByZXN1bHQuZGF0YS5mb3JFYWNoKHlvbG9MYWJlbCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBiYm94ID0gdGhpcy5jYW52YXNDb250cm9sbGVyLnlvbG9Ub0JvdW5kaW5nQm94KHlvbG9MYWJlbCwge1xyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2U/LndpZHRoIHx8IDEsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2U/LmhlaWdodCB8fCAxXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRCb3VuZGluZ0JveChiYm94KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgbGFiZWxzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlTW91c2VDb29yZGluYXRlc0Rpc3BsYXkoKTogdm9pZCB7XHJcbiAgICAvLyBVcGRhdGUgbW91c2UgY29vcmRpbmF0ZXMgaW4gVUlcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdtb3VzZTpjb29yZGluYXRlcy11cGRhdGVkJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIGNhbnZhczogdGhpcy5sYXN0TW91c2VQb3NpdGlvbixcclxuICAgICAgICBpbWFnZTogdGhpcy5jYW52YXNDb250cm9sbGVyLmNhbnZhc1RvSW1hZ2UodGhpcy5sYXN0TW91c2VQb3NpdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhpZGVDb250ZXh0TWVudSgpOiB2b2lkIHtcclxuICAgIHRoaXMuY29udGV4dE1lbnVUYXJnZXQgPSBudWxsO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NvbnRleHQtbWVudTpoaWRlJ1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNob3J0Y3V0S2V5KHNob3J0Y3V0OiBLZXlib2FyZFNob3J0Y3V0KTogc3RyaW5nIHtcclxuICAgIGxldCBrZXkgPSBzaG9ydGN1dC5rZXk7XHJcbiAgICBpZiAoc2hvcnRjdXQuY3RybEtleSkga2V5ID0gJ0N0cmwrJyArIGtleTtcclxuICAgIGlmIChzaG9ydGN1dC5zaGlmdEtleSkga2V5ID0gJ1NoaWZ0KycgKyBrZXk7XHJcbiAgICBpZiAoc2hvcnRjdXQuYWx0S2V5KSBrZXkgPSAnQWx0KycgKyBrZXk7XHJcbiAgICByZXR1cm4ga2V5O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFdmVudEtleShldmVudDogS2V5Ym9hcmRFdmVudCk6IHN0cmluZyB7XHJcbiAgICBsZXQga2V5ID0gZXZlbnQuY29kZTtcclxuICAgIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpIGtleSA9ICdDdHJsKycgKyBrZXk7XHJcbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9ICdTaGlmdCsnICsga2V5O1xyXG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gJ0FsdCsnICsga2V5O1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNJbnB1dEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIFsnaW5wdXQnLCAndGV4dGFyZWEnLCAnc2VsZWN0JywgJ29wdGlvbiddLmluY2x1ZGVzKHRhZ05hbWUpIHx8XHJcbiAgICAgICAgICAgZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0dsb2JhbFNob3J0Y3V0KGV2ZW50OiBLZXlib2FyZEV2ZW50KTogYm9vbGVhbiB7XHJcbiAgICAvLyBUaGVzZSBzaG9ydGN1dHMgd29yayBldmVuIHdoZW4gaW5wdXQgZWxlbWVudHMgYXJlIGZvY3VzZWRcclxuICAgIGNvbnN0IGdsb2JhbFNob3J0Y3V0cyA9IFsnS2V5UycsICdLZXlPJywgJ0tleVonLCAnS2V5WSddO1xyXG4gICAgcmV0dXJuIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpICYmIGdsb2JhbFNob3J0Y3V0cy5pbmNsdWRlcyhldmVudC5jb2RlKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW1cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogRXZlbnRNYW5hZ2VyRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIFtdKTtcclxuICAgIH1cclxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpIS5wdXNoKGhhbmRsZXIpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBFdmVudE1hbmFnZXJFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgY29uc3QgaW5kZXggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudChldmVudDogRXZlbnRNYW5hZ2VyRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gUHVibGljIEludGVyZmFjZVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGdldFNob3J0Y3V0cygpOiBLZXlib2FyZFNob3J0Y3V0W10ge1xyXG4gICAgcmV0dXJuIFsuLi50aGlzLnNob3J0Y3V0c107XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0Q29uZmlnKGNvbmZpZzogUGFydGlhbDxFdmVudE1hbmFnZXJDb25maWc+KTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLmNvbmZpZyB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldENvbmZpZygpOiBFdmVudE1hbmFnZXJDb25maWcge1xyXG4gICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xyXG4gICAgLy8gUmVtb3ZlIGFsbCBldmVudCBsaXN0ZW5lcnNcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleURvd24uYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuaGFuZGxlS2V5VXAuYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIHRoaXMuaGFuZGxlQ29udGV4dE1lbnUuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuaGFuZGxlRHJhZ092ZXIuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5oYW5kbGVEcm9wLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5oYW5kbGVEcmFnRW50ZXIuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCB0aGlzLmhhbmRsZURyYWdMZWF2ZS5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuaGFuZGxlR2xvYmFsTW91c2VNb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuaGFuZGxlR2xvYmFsTW91c2VVcC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBDbGVhciBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5jbGVhcigpO1xyXG4gICAgdGhpcy5rZXlib2FyZEhhbmRsZXJzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmNvbnRleHRNZW51VGFyZ2V0ID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBGdW5jdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnRNYW5hZ2VyKFxyXG4gIGFwcFN0YXRlOiBJQXBwU3RhdGUsXHJcbiAgY2FudmFzQ29udHJvbGxlcjogSUNhbnZhc0NvbnRyb2xsZXIsXHJcbiAgZmlsZVN5c3RlbVNlcnZpY2U6IElGaWxlU3lzdGVtU2VydmljZSxcclxuICBjb25maWc/OiBQYXJ0aWFsPEV2ZW50TWFuYWdlckNvbmZpZz5cclxuKTogRXZlbnRNYW5hZ2VyIHtcclxuICByZXR1cm4gbmV3IEV2ZW50TWFuYWdlcihhcHBTdGF0ZSwgY2FudmFzQ29udHJvbGxlciwgZmlsZVN5c3RlbVNlcnZpY2UsIGNvbmZpZyk7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRXhwb3J0c1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFdmVudE1hbmFnZXI7XHJcbmV4cG9ydCB0eXBlIHsgSUV2ZW50TWFuYWdlciwgRXZlbnRNYW5hZ2VyQ29uZmlnLCBLZXlib2FyZFNob3J0Y3V0IH07XG4iLCIvKipcclxuICogVXRpbHMgTW9kdWxlIEluZGV4XHJcbiAqIFxyXG4gKiBDZW50cmFsIGV4cG9ydCBwb2ludCBmb3IgYWxsIHV0aWxpdHkgZnVuY3Rpb25zIHVzZWQgdGhyb3VnaG91dCB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogVGhpcyBmaWxlIHByb3ZpZGVzIGEgY2xlYW4gQVBJIGZvciBpbXBvcnRpbmcgdXRpbGl0eSBmdW5jdGlvbnMgZnJvbSB2YXJpb3VzIG1vZHVsZXMuXHJcbiAqL1xyXG5cclxuLy8gRXhwb3J0IGFsbCBub3RpZmljYXRpb24gdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICBzaG93VG9hc3QsXHJcbiAgICBzaG93RXJyb3JUb2FzdCxcclxuICAgIHNob3dTdWNjZXNzVG9hc3QsXHJcbiAgICBzaG93V2FybmluZ1RvYXN0LFxyXG4gICAgc2hvd1R5cGVkVG9hc3QsXHJcbiAgICB0eXBlIFRvYXN0VHlwZSxcclxuICAgIHR5cGUgVG9hc3RDb25maWdcclxufSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xyXG5cclxuLy8gRXhwb3J0IGFsbCBjb2xvciBwYWxldHRlIHV0aWxpdGllc1xyXG5leHBvcnQge1xyXG4gICAgY29sb3JQYWxldHRlLFxyXG4gICAgREVGQVVMVF9DT0xPUixcclxuICAgIGdldENvbG9yRm9yQ2xhc3MsXHJcbiAgICBnZXRDb2xvcnNGb3JDbGFzc2VzLFxyXG4gICAgaXNDb2xvckluUGFsZXR0ZSxcclxuICAgIGdldENvbG9ySW5kZXgsXHJcbiAgICBnZXRDb250cmFzdGluZ1RleHRDb2xvcixcclxuICAgIGhleFRvUmdiYSxcclxuICAgIENvbG9yTWFuYWdlcixcclxuICAgIHR5cGUgQ29sb3JDb25maWdcclxufSBmcm9tICcuL2NvbG9yLXBhbGV0dGUnO1xyXG5cclxuLy8gRXhwb3J0IGFsbCB2YWxpZGF0aW9uIHV0aWxpdGllc1xyXG5leHBvcnQge1xyXG4gICAgdmFsaWRhdGVMYWJlbENsYXNzLFxyXG4gICAgdmFsaWRhdGVMYWJlbENsYXNzQWR2YW5jZWQsXHJcbiAgICB2YWxpZGF0ZUZpbGVOYW1lLFxyXG4gICAgdmFsaWRhdGVJbWFnZUV4dGVuc2lvbixcclxuICAgIHZhbGlkYXRlQm91bmRpbmdCb3gsXHJcbiAgICB2YWxpZGF0ZVlPTE9Db29yZGluYXRlcyxcclxuICAgIHZhbGlkYXRlWm9vbUxldmVsLFxyXG4gICAgdmFsaWRhdGVGb250U2l6ZSxcclxuICAgIHZhbGlkYXRlTnVtYmVyLFxyXG4gICAgdmFsaWRhdGVFbWFpbCxcclxuICAgIHZhbGlkYXRlVXJsLFxyXG4gICAgc2FuaXRpemVJbnB1dCxcclxuICAgIHR5cGUgVmFsaWRhdGlvblJlc3VsdFxyXG59IGZyb20gJy4vdmFsaWRhdGlvbic7XHJcblxyXG4vLyBFeHBvcnQgWU9MTyBwYXJzZXIgdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICBZb2xvUGFyc2VyLFxyXG4gICAgcGFyc2VZb2xvLFxyXG4gICAgZXhwb3J0WW9sbyxcclxuICAgIHZhbGlkYXRlWW9sb1N0cmluZ1xyXG59IGZyb20gJy4veW9sby1wYXJzZXInO1xyXG5cclxuLy8gUmUtZXhwb3J0IGNvbW1vbmx5IHVzZWQgdXRpbGl0aWVzIHdpdGggc2hvcnRlciBuYW1lc1xyXG5leHBvcnQgeyBzaG93VG9hc3QgYXMgdG9hc3QgfSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xyXG5leHBvcnQgeyBnZXRDb2xvckZvckNsYXNzIGFzIGdldENvbG9yIH0gZnJvbSAnLi9jb2xvci1wYWxldHRlJztcclxuZXhwb3J0IHsgdmFsaWRhdGVMYWJlbENsYXNzIGFzIHZhbGlkYXRlTGFiZWwgfSBmcm9tICcuL3ZhbGlkYXRpb24nO1xyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgZnVuY3Rpb24gY2F0ZWdvcmllcyBmb3IgYmV0dGVyIG9yZ2FuaXphdGlvblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFV0aWxpdHlDYXRlZ29yaWVzID0ge1xyXG4gICAgTk9USUZJQ0FUSU9OUzogW1xyXG4gICAgICAgICdzaG93VG9hc3QnLFxyXG4gICAgICAgICdzaG93RXJyb3JUb2FzdCcsIFxyXG4gICAgICAgICdzaG93U3VjY2Vzc1RvYXN0JyxcclxuICAgICAgICAnc2hvd1dhcm5pbmdUb2FzdCcsXHJcbiAgICAgICAgJ3Nob3dUeXBlZFRvYXN0J1xyXG4gICAgXSxcclxuICAgIENPTE9SUzogW1xyXG4gICAgICAgICdnZXRDb2xvckZvckNsYXNzJyxcclxuICAgICAgICAnZ2V0Q29sb3JzRm9yQ2xhc3NlcycsXHJcbiAgICAgICAgJ2dldENvbnRyYXN0aW5nVGV4dENvbG9yJyxcclxuICAgICAgICAnaGV4VG9SZ2JhJyxcclxuICAgICAgICAnQ29sb3JNYW5hZ2VyJ1xyXG4gICAgXSxcclxuICAgIFZBTElEQVRJT046IFtcclxuICAgICAgICAndmFsaWRhdGVMYWJlbENsYXNzJyxcclxuICAgICAgICAndmFsaWRhdGVGaWxlTmFtZScsXHJcbiAgICAgICAgJ3ZhbGlkYXRlSW1hZ2VFeHRlbnNpb24nLFxyXG4gICAgICAgICd2YWxpZGF0ZUJvdW5kaW5nQm94JyxcclxuICAgICAgICAndmFsaWRhdGVZT0xPQ29vcmRpbmF0ZXMnXHJcbiAgICBdLFxyXG4gICAgWU9MTzogW1xyXG4gICAgICAgICdZb2xvUGFyc2VyJyxcclxuICAgICAgICAncGFyc2VZb2xvJyxcclxuICAgICAgICAnZXhwb3J0WW9sbycsXHJcbiAgICAgICAgJ3ZhbGlkYXRlWW9sb1N0cmluZydcclxuICAgIF1cclxufSBhcyBjb25zdDtcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IGNvbmZpZ3VyYXRpb24gaW50ZXJmYWNlXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFV0aWxpdHlDb25maWcge1xyXG4gICAgbm90aWZpY2F0aW9uczoge1xyXG4gICAgICAgIGRlZmF1bHREdXJhdGlvbjogbnVtYmVyO1xyXG4gICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmc7XHJcbiAgICB9O1xyXG4gICAgY29sb3JzOiB7XHJcbiAgICAgICAgdXNlSGlnaENvbnRyYXN0OiBib29sZWFuO1xyXG4gICAgICAgIGN1c3RvbVBhbGV0dGU/OiBzdHJpbmdbXTtcclxuICAgIH07XHJcbiAgICB2YWxpZGF0aW9uOiB7XHJcbiAgICAgICAgc3RyaWN0TW9kZTogYm9vbGVhbjtcclxuICAgICAgICBzaG93RXJyb3JzOiBib29sZWFuO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmF1bHQgdXRpbGl0eSBjb25maWd1cmF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9VVElMSVRZX0NPTkZJRzogVXRpbGl0eUNvbmZpZyA9IHtcclxuICAgIG5vdGlmaWNhdGlvbnM6IHtcclxuICAgICAgICBkZWZhdWx0RHVyYXRpb246IDMwMDAsXHJcbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6ICcjdG9hc3QtY29udGFpbmVyJ1xyXG4gICAgfSxcclxuICAgIGNvbG9yczoge1xyXG4gICAgICAgIHVzZUhpZ2hDb250cmFzdDogZmFsc2VcclxuICAgIH0sXHJcbiAgICB2YWxpZGF0aW9uOiB7XHJcbiAgICAgICAgc3RyaWN0TW9kZTogdHJ1ZSxcclxuICAgICAgICBzaG93RXJyb3JzOiB0cnVlXHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogVXRpbGl0eSBtYW5hZ2VyIGZvciBjb29yZGluYXRlZCB1dGlsaXR5IG9wZXJhdGlvbnNcclxuICovXHJcbmV4cG9ydCBjbGFzcyBVdGlsaXR5TWFuYWdlciB7XHJcbiAgICBwcml2YXRlIGNvbmZpZzogVXRpbGl0eUNvbmZpZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFBhcnRpYWw8VXRpbGl0eUNvbmZpZz4gPSB7fSkge1xyXG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5ERUZBVUxUX1VUSUxJVFlfQ09ORklHLCAuLi5jb25maWcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cclxuICAgICAqL1xyXG4gICAgZ2V0Q29uZmlnKCk6IFV0aWxpdHlDb25maWcge1xyXG4gICAgICAgIHJldHVybiB7IC4uLnRoaXMuY29uZmlnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgY29uZmlndXJhdGlvblxyXG4gICAgICovXHJcbiAgICB1cGRhdGVDb25maWcobmV3Q29uZmlnOiBQYXJ0aWFsPFV0aWxpdHlDb25maWc+KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLnRoaXMuY29uZmlnLCAuLi5uZXdDb25maWcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemUgdXRpbGl0aWVzIHdpdGggY3VycmVudCBjb25maWd1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIGluaXRpYWxpemUoKTogdm9pZCB7XG4gICAgICAgIC8vIEluaXRpYWxpemUgdXRpbGl0eSBjb25maWd1cmF0aW9uIChubyBjb25zb2xlIG5vaXNlIGluIHByb2R1Y3Rpb24pXG4gICAgfVxufVxyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCB1dGlsaXR5IG1hbmFnZXIgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBjb25zdCB1dGlsaXR5TWFuYWdlciA9IG5ldyBVdGlsaXR5TWFuYWdlcigpO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjaGVjayBpZiB1dGlsaXRpZXMgYXJlIHByb3Blcmx5IGxvYWRlZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVXRpbGl0aWVzTG9hZGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBJbXBvcnQgZnVuY3Rpb25zIGZvciB0ZXN0aW5nXHJcbiAgICAgICAgY29uc3QgeyBzaG93VG9hc3QgfSA9IHJlcXVpcmUoJy4vbm90aWZpY2F0aW9ucycpO1xyXG4gICAgICAgIGNvbnN0IHsgY29sb3JQYWxldHRlIH0gPSByZXF1aXJlKCcuL2NvbG9yLXBhbGV0dGUnKTtcclxuICAgICAgICBjb25zdCB7IHZhbGlkYXRlTGFiZWxDbGFzcyB9ID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVGVzdCBlYWNoIHV0aWxpdHkgY2F0ZWdvcnlcclxuICAgICAgICBjb25zdCBub3RpZmljYXRpb25UZXN0ID0gdHlwZW9mIHNob3dUb2FzdCA9PT0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBjb25zdCBjb2xvclRlc3QgPSBBcnJheS5pc0FycmF5KGNvbG9yUGFsZXR0ZSkgJiYgY29sb3JQYWxldHRlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvblRlc3QgPSB0eXBlb2YgdmFsaWRhdGVMYWJlbENsYXNzID09PSAnZnVuY3Rpb24nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBub3RpZmljYXRpb25UZXN0ICYmIGNvbG9yVGVzdCAmJiB2YWxpZGF0aW9uVGVzdDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignVXRpbGl0aWVzIHZhbGlkYXRpb24gZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdXRpbGl0eSBtb2R1bGUgdmVyc2lvbiBpbmZvXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVVRJTElUWV9WRVJTSU9OID0ge1xyXG4gICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgIG1vZHVsZXM6IHtcclxuICAgICAgICBub3RpZmljYXRpb25zOiAnMS4wLjAnLFxyXG4gICAgICAgIGNvbG9yczogJzEuMC4wJyxcclxuICAgICAgICB2YWxpZGF0aW9uOiAnMS4wLjAnLFxyXG4gICAgICAgIHlvbG86ICcxLjAuMCdcclxuICAgIH0sXHJcbiAgICBidWlsZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG59O1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB1dGlsaXRpZXMgb24gbW9kdWxlIGxvYWRcclxudXRpbGl0eU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuIiwiLyoqXHJcbiAqIFVJIE1hbmFnZXIgTW9kdWxlXHJcbiAqXHJcbiAqIE1hbmFnZXMgYWxsIERPTSBtYW5pcHVsYXRpb24sIFVJIHVwZGF0ZXMsIGFuZCB1c2VyIGludGVyZmFjZSBpbnRlcmFjdGlvbnMuXHJcbiAqIEhhbmRsZXMgQm9vdHN0cmFwIG1vZGFscywgcGFuZWwgbWFuYWdlbWVudCwgbGlzdCByZW5kZXJpbmcsIGFuZCB0aGVtZSBtYW5hZ2VtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IElBcHBTdGF0ZSB9IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcbmltcG9ydCB7IElDYW52YXNDb250cm9sbGVyIH0gZnJvbSAnLi4vdHlwZXMvY2FudmFzJztcclxuaW1wb3J0IHsgSUZpbGVTeXN0ZW0gfSBmcm9tICcuLi90eXBlcy9maWxlLXN5c3RlbSc7XHJcbmltcG9ydCB7XHJcbiAgRE9NRWxlbWVudHMsXHJcbiAgQm9vdHN0cmFwTW9kYWwsXHJcbiAgUGFuZWxDb25maWcsXHJcbiAgU3BsaXR0ZXJDb25maWcsXHJcbiAgRmlsdGVyQnV0dG9uLFxyXG4gIExhYmVsR3JvdXAsXHJcbiAgQ29udGV4dE1lbnVDb25maWcsXHJcbiAgVUlTdGF0ZSxcclxuICBUaGVtZUNvbmZpZyxcclxuICBMb2FkaW5nU3RhdGUsXHJcbiAgU2VhcmNoT3B0aW9ucyxcclxuICBGaWx0ZXJPcHRpb25zLFxyXG4gIFVJRXZlbnQsXHJcbiAgVUlFdmVudFR5cGUsXHJcbiAgVUlFdmVudEhhbmRsZXIsXHJcbiAgVUlNZXRob2RzLFxyXG4gIElVSU1hbmFnZXIsXHJcbiAgSW1hZ2VMaXN0SXRlbSxcclxuICBMYWJlbExpc3RJdGVtLFxyXG4gIFByZXZpZXdJdGVtXHJcbn0gZnJvbSAnLi4vdHlwZXMvdWknO1xyXG5pbXBvcnQgeyBNb2RlLCBQb2ludCB9IGZyb20gJy4uL3R5cGVzL2luZGV4JztcbmltcG9ydCB7IHNob3dTdWNjZXNzVG9hc3QsIHNob3dFcnJvclRvYXN0IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgQm91bmRpbmdCb3ggfSBmcm9tICcuLi90eXBlcy9jYW52YXMnO1xyXG5cclxuLyoqXHJcbiAqIEJvb3RzdHJhcCBNb2RhbCB3cmFwcGVyIGZvciB0eXBlIHNhZmV0eVxyXG4gKi9cclxuY2xhc3MgQm9vdHN0cmFwTW9kYWxXcmFwcGVyIGltcGxlbWVudHMgQm9vdHN0cmFwTW9kYWwge1xyXG4gIHByaXZhdGUgbW9kYWw6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcclxuICAgIC8vIEJvb3RzdHJhcCA1IE1vZGFsXHJcbiAgICB0aGlzLm1vZGFsID0gbmV3ICh3aW5kb3cgYXMgYW55KS5ib290c3RyYXAuTW9kYWwoZWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICBzaG93KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tb2RhbC5zaG93KCk7XHJcbiAgfVxyXG5cclxuICBoaWRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5tb2RhbC5oaWRlKCk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLm1vZGFsLnRvZ2dsZSgpO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMubW9kYWwuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFVJTWFuYWdlciBpbXBsZW1lbnRhdGlvblxyXG4gKiBNYW5hZ2VzIGFsbCB1c2VyIGludGVyZmFjZSBpbnRlcmFjdGlvbnMgYW5kIERPTSBtYW5pcHVsYXRpb25cclxuICovXHJcbmV4cG9ydCBjbGFzcyBVSU1hbmFnZXIgaW1wbGVtZW50cyBJVUlNYW5hZ2VyIHtcclxuICBwcml2YXRlIGV2ZW50SGFuZGxlcnM6IE1hcDxVSUV2ZW50VHlwZSwgU2V0PFVJRXZlbnRIYW5kbGVyPj4gPSBuZXcgTWFwKCk7XHJcbiAgcHJpdmF0ZSBfZWxlbWVudHMhOiBET01FbGVtZW50cztcclxuICBwcml2YXRlIHBhbmVsQ29uZmlnczogTWFwPHN0cmluZywgUGFuZWxDb25maWc+ID0gbmV3IE1hcCgpO1xyXG4gIHByaXZhdGUgc3BsaXR0ZXJDb25maWdzOiBTcGxpdHRlckNvbmZpZ1tdID0gW107XHJcbiAgcHJpdmF0ZSBjdXJyZW50VGhlbWU6IFRoZW1lQ29uZmlnO1xyXG4gIHByaXZhdGUgbG9hZGluZ1N0YXRlOiBMb2FkaW5nU3RhdGU7XHJcbiAgcHJpdmF0ZSBmaWx0ZXJCdXR0b25zOiBGaWx0ZXJCdXR0b25bXSA9IFtdO1xyXG4gIHByaXZhdGUgbGFiZWxHcm91cHM6IExhYmVsR3JvdXBbXSA9IFtdO1xyXG4gIHByaXZhdGUgaW1hZ2VMaXN0SXRlbXM6IEltYWdlTGlzdEl0ZW1bXSA9IFtdO1xyXG4gIHByaXZhdGUgbGFiZWxMaXN0SXRlbXM6IExhYmVsTGlzdEl0ZW1bXSA9IFtdO1xyXG4gIHByaXZhdGUgcHJldmlld0l0ZW1zOiBQcmV2aWV3SXRlbVtdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBfc3RhdGU6IElBcHBTdGF0ZSxcclxuICAgIHByaXZhdGUgX2NhbnZhc0NvbnRyb2xsZXI6IElDYW52YXNDb250cm9sbGVyLFxyXG4gICAgcHJpdmF0ZSBfZmlsZVN5c3RlbTogSUZpbGVTeXN0ZW1cclxuICApIHtcclxuICAgIHRoaXMuY3VycmVudFRoZW1lID0gdGhpcy5nZXREZWZhdWx0VGhlbWUoKTtcclxuICAgIHRoaXMubG9hZGluZ1N0YXRlID0ge1xyXG4gICAgICBpc0xvYWRpbmc6IGZhbHNlLFxyXG4gICAgICBtZXNzYWdlOiAnJyxcclxuICAgICAgcHJvZ3Jlc3M6IDBcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplRWxlbWVudHMoKTtcclxuICAgIHRoaXMuc2V0dXBFdmVudExpc3RlbmVycygpO1xyXG4gICAgdGhpcy5zZXR1cFNwbGl0dGVycygpO1xyXG4gICAgdGhpcy5pbml0aWFsaXplUGFuZWxDb25maWdzKCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gR2V0dGVyc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZ2V0IGVsZW1lbnRzKCk6IERPTUVsZW1lbnRzIHtcclxuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cztcclxuICB9XHJcblxyXG4gIGdldCBzdGF0ZSgpOiBJQXBwU3RhdGUge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGNhbnZhc0NvbnRyb2xsZXIoKTogSUNhbnZhc0NvbnRyb2xsZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXI7XHJcbiAgfVxyXG5cclxuICBnZXQgZmlsZVN5c3RlbSgpOiBJRmlsZVN5c3RlbSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZmlsZVN5c3RlbTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFbGVtZW50IEluaXRpYWxpemF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVFbGVtZW50cygpOiB2b2lkIHtcclxuICAgIHRoaXMuX2VsZW1lbnRzID0ge1xyXG4gICAgICAvLyBGb2xkZXIgc2VsZWN0aW9uIGJ1dHRvbnNcclxuICAgICAgc2VsZWN0SW1hZ2VGb2xkZXJCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdC1pbWFnZS1mb2xkZXItYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHNlbGVjdExhYmVsRm9sZGVyQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtbGFiZWwtZm9sZGVyLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBsb2FkQ2xhc3NJbmZvRm9sZGVyQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsb2FkLWNsYXNzLWluZm8tZm9sZGVyLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gQ2xhc3MgZmlsZSBlbGVtZW50c1xyXG4gICAgICBjbGFzc0ZpbGVTZWxlY3Q6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNzLWZpbGUtc2VsZWN0JykgYXMgSFRNTFNlbGVjdEVsZW1lbnQsXHJcbiAgICAgIHZpZXdDbGFzc0ZpbGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXctY2xhc3MtZmlsZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgY2xhc3NGaWxlVmlld2VyTW9kYWw6IG5ldyBCb290c3RyYXBNb2RhbFdyYXBwZXIodGhpcy5nZXRFbGVtZW50QnlJZCgnY2xhc3NGaWxlVmlld2VyTW9kYWwnKSksXHJcbiAgICAgIGNsYXNzRmlsZUVkaXRvckJvZHk6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNzLWZpbGUtZWRpdG9yLWJvZHknKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgYWRkQ2xhc3NSb3dCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2FkZC1jbGFzcy1yb3ctYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHNhdmVDbGFzc0ZpbGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NhdmUtY2xhc3MtZmlsZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZG93bmxvYWRDbGFzc2VzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdkb3dubG9hZC1jbGFzc2VzLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gSW1hZ2UgbGlzdCBlbGVtZW50c1xyXG4gICAgICBpbWFnZUxpc3Q6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlLWxpc3QnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgaW1hZ2VTZWFyY2hJbnB1dDogdGhpcy5nZXRFbGVtZW50QnlJZCgnaW1hZ2Utc2VhcmNoLWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgc2hvd0xhYmVsZWRDaGVja2JveDogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2hvdy1sYWJlbGVkLWNoZWNrYm94JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgc2hvd1VubGFiZWxlZENoZWNrYm94OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzaG93LXVubGFiZWxlZC1jaGVja2JveCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBTYXZlL2xvYWQgYnV0dG9uc1xyXG4gICAgICBzYXZlTGFiZWxzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzYXZlLWxhYmVscy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgYXV0b1NhdmVUb2dnbGU6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2F1dG8tc2F2ZS10b2dnbGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gQ2FudmFzIGRpc3BsYXkgb3B0aW9uc1xyXG4gICAgICBzaG93TGFiZWxzT25DYW52YXNUb2dnbGU6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctbGFiZWxzLW9uLWNhbnZhcy10b2dnbGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG4gICAgICBsYWJlbEZvbnRTaXplU2xpZGVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1mb250LXNpemUtc2xpZGVyJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgbGFiZWxGb250U2l6ZVZhbHVlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1mb250LXNpemUtdmFsdWUnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgY3Jvc3NoYWlyVG9nZ2xlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjcm9zc2hhaXItdG9nZ2xlJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuXHJcbiAgICAgIC8vIE1vZGUgYnV0dG9uc1xyXG4gICAgICBkcmF3TW9kZUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZHJhdy1tb2RlLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBlZGl0TW9kZUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZWRpdC1tb2RlLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gTGFiZWwgbGlzdCBlbGVtZW50c1xyXG4gICAgICBsYWJlbExpc3Q6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2xhYmVsLWxpc3QnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgbGFiZWxGaWx0ZXJzOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1maWx0ZXJzJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHNlbGVjdEJ5Q2xhc3NEcm9wZG93bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2VsZWN0LWJ5LWNsYXNzLWRyb3Bkb3duJykgYXMgSFRNTFNlbGVjdEVsZW1lbnQsXHJcbiAgICAgIHNlbGVjdEJ5Q2xhc3NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdC1ieS1jbGFzcy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgc29ydExhYmVsc0FzY0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc29ydC1sYWJlbHMtYXNjLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBzb3J0TGFiZWxzRGVzY0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc29ydC1sYWJlbHMtZGVzYy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIFpvb20gY29udHJvbHNcclxuICAgICAgem9vbUluQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCd6b29tLWluLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICB6b29tT3V0QnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCd6b29tLW91dC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgcmVzZXRab29tQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdyZXNldC16b29tLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICB6b29tSW5wdXQ6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3pvb20taW5wdXQnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gQ2FudmFzIGVsZW1lbnRzXHJcbiAgICAgIGNhbnZhc0NvbnRhaW5lcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnY2FudmFzLWNvbnRhaW5lcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBtb3VzZUNvb3Jkc0Rpc3BsYXk6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ21vdXNlLWNvb3Jkcy1kaXNwbGF5JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGNvb3JkWElucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb29yZC14LWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgY29vcmRZSW5wdXQ6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2Nvb3JkLXktaW5wdXQnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG4gICAgICBnb1RvQ29vcmRzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdnby10by1jb29yZHMtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBOYXZpZ2F0aW9uXHJcbiAgICAgIGN1cnJlbnRJbWFnZU5hbWVTcGFuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjdXJyZW50LWltYWdlLW5hbWUnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgcHJldkltYWdlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2LWltYWdlLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBuZXh0SW1hZ2VCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ25leHQtaW1hZ2UtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBQYW5lbCBlbGVtZW50c1xyXG4gICAgICBsZWZ0UGFuZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2xlZnQtcGFuZWwnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgcmlnaHRQYW5lbDogdGhpcy5nZXRFbGVtZW50QnlJZCgncmlnaHQtcGFuZWwnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgbGVmdFNwbGl0dGVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsZWZ0LXNwbGl0dGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHJpZ2h0U3BsaXR0ZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3JpZ2h0LXNwbGl0dGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGNvbGxhcHNlTGVmdFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb2xsYXBzZS1sZWZ0LXBhbmVsLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBleHBhbmRMZWZ0UGFuZWxCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2V4cGFuZC1sZWZ0LXBhbmVsLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBjb2xsYXBzZVJpZ2h0UGFuZWxCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NvbGxhcHNlLXJpZ2h0LXBhbmVsLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBleHBhbmRSaWdodFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdleHBhbmQtcmlnaHQtcGFuZWwtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBQcmV2aWV3IGJhciBlbGVtZW50c1xyXG4gICAgICBwcmV2aWV3QmFyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3LWJhcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBwcmV2aWV3QmFySGVhZGVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3LWJhci1oZWFkZXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgdG9nZ2xlUHJldmlld0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgndG9nZ2xlLXByZXZpZXctYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHByZXZpZXdQcmV2QnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3LXByZXYtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHByZXZpZXdOZXh0QnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3LW5leHQtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHByZXZpZXdMaXN0V3JhcHBlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1saXN0LXdyYXBwZXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgcHJldmlld0xpc3Q6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3ByZXZpZXctbGlzdCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBib3R0b21QYW5lbDogdGhpcy5nZXRFbGVtZW50QnlJZCgnYm90dG9tLXBhbmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGJvdHRvbVNwbGl0dGVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdib3R0b20tc3BsaXR0ZXInKSBhcyBIVE1MRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIFRoZW1lIHRvZ2dsZVxyXG4gICAgICBkYXJrTW9kZVRvZ2dsZTogdGhpcy5nZXRFbGVtZW50QnlJZCgnZGFyay1tb2RlLXRvZ2dsZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBMYWJlbCBjbGFzcyBtb2RhbFxyXG4gICAgICBsYWJlbENsYXNzTW9kYWw6IG5ldyBCb290c3RyYXBNb2RhbFdyYXBwZXIodGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWxDbGFzc01vZGFsJykpLFxyXG4gICAgICBsYWJlbENsYXNzSW5wdXQ6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2xhYmVsLWNsYXNzLWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgY2xhc3NTZWxlY3Rpb25Db250YWluZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNzLXNlbGVjdGlvbi1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgc2F2ZUxhYmVsQ2xhc3NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NhdmUtbGFiZWwtY2xhc3MtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBDb250ZXh0IG1lbnVcclxuICAgICAgY29udGV4dE1lbnU6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRleHQtbWVudScpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjdHhFZGl0TGFiZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2N0eC1lZGl0LWxhYmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGN0eERlbGV0ZUxhYmVsOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjdHgtZGVsZXRlLWxhYmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBMb2FkaW5nIG92ZXJsYXlcclxuICAgICAgbG9hZGluZ092ZXJsYXk6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmctb3ZlcmxheScpIGFzIEhUTUxFbGVtZW50XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbGVtZW50QnlJZChpZDogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgIC8vIER1cmluZyBtaWdyYXRpb24sIHN1cHBvcnQgYm90aCBuZXcgKGtlYmFiLWNhc2UpIGFuZCBsZWdhY3kgKGNhbWVsQ2FzZSkgSURzXG4gICAgY29uc3QgbGVnYWN5SWRNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAvLyBGb2xkZXIgc2VsZWN0aW9uXG4gICAgICAnc2VsZWN0LWltYWdlLWZvbGRlci1idG4nOiAnc2VsZWN0SW1hZ2VGb2xkZXJCdG4nLFxuICAgICAgJ3NlbGVjdC1sYWJlbC1mb2xkZXItYnRuJzogJ3NlbGVjdExhYmVsRm9sZGVyQnRuJyxcbiAgICAgICdsb2FkLWNsYXNzLWluZm8tZm9sZGVyLWJ0bic6ICdsb2FkQ2xhc3NJbmZvRm9sZGVyQnRuJyxcblxuICAgICAgLy8gQ2xhc3MgZmlsZSBlbGVtZW50c1xuICAgICAgJ3ZpZXctY2xhc3MtZmlsZS1idG4nOiAndmlld0NsYXNzRmlsZUJ0bicsXG4gICAgICAnY2xhc3MtZmlsZS1lZGl0b3ItYm9keSc6ICdjbGFzc0ZpbGVFZGl0b3JCb2R5JyxcbiAgICAgICdhZGQtY2xhc3Mtcm93LWJ0bic6ICdhZGRDbGFzc1Jvd0J0bicsXG4gICAgICAnc2F2ZS1jbGFzcy1maWxlLWJ0bic6ICdzYXZlQ2xhc3NGaWxlQnRuJyxcbiAgICAgICdkb3dubG9hZC1jbGFzc2VzLWJ0bic6ICdkb3dubG9hZENsYXNzZXNCdG4nLFxuXG4gICAgICAvLyBJbWFnZSBsaXN0IC8gZmlsdGVyc1xuICAgICAgJ2ltYWdlLXNlYXJjaC1pbnB1dCc6ICdpbWFnZVNlYXJjaElucHV0JyxcbiAgICAgICdzaG93LWxhYmVsZWQtY2hlY2tib3gnOiAnc2hvd0xhYmVsZWQnLFxuICAgICAgJ3Nob3ctdW5sYWJlbGVkLWNoZWNrYm94JzogJ3Nob3dVbmxhYmVsZWQnLFxuXG4gICAgICAvLyBTYXZlL2xvYWRcbiAgICAgICdzYXZlLWxhYmVscy1idG4nOiAnc2F2ZUxhYmVsc0J0bicsXG4gICAgICAnYXV0by1zYXZlLXRvZ2dsZSc6ICdhdXRvU2F2ZVRvZ2dsZScsXG5cbiAgICAgIC8vIENhbnZhcyBkaXNwbGF5IG9wdGlvbnNcbiAgICAgICdzaG93LWxhYmVscy1vbi1jYW52YXMtdG9nZ2xlJzogJ3Nob3dMYWJlbHNPbkNhbnZhc1RvZ2dsZScsXG4gICAgICAnbGFiZWwtZm9udC1zaXplLXNsaWRlcic6ICdsYWJlbC1mb250LXNpemUnLFxuICAgICAgJ2Nyb3NzaGFpci10b2dnbGUnOiAnY3Jvc3NoYWlyVG9nZ2xlJyxcblxuICAgICAgLy8gTW9kZXNcbiAgICAgICdkcmF3LW1vZGUtYnRuJzogJ2RyYXdNb2RlJyxcbiAgICAgICdlZGl0LW1vZGUtYnRuJzogJ2VkaXRNb2RlJyxcblxuICAgICAgLy8gU29ydGluZ1xuICAgICAgJ3NvcnQtbGFiZWxzLWFzYy1idG4nOiAnc29ydExhYmVsc0FzY0J0bicsXG4gICAgICAnc29ydC1sYWJlbHMtZGVzYy1idG4nOiAnc29ydExhYmVsc0Rlc2NCdG4nLFxuXG4gICAgICAvLyBab29tIGNvbnRyb2xzXG4gICAgICAnem9vbS1pbi1idG4nOiAnem9vbUluQnRuJyxcbiAgICAgICd6b29tLW91dC1idG4nOiAnem9vbU91dEJ0bicsXG4gICAgICAncmVzZXQtem9vbS1idG4nOiAncmVzZXRab29tQnRuJyxcblxuICAgICAgLy8gQ29vcmRzXG4gICAgICAnbW91c2UtY29vcmRzLWRpc3BsYXknOiAnaW5mby1kaXNwbGF5JyxcbiAgICAgICdjb29yZC14LWlucHV0JzogJ2Nvb3JkWCcsXG4gICAgICAnY29vcmQteS1pbnB1dCc6ICdjb29yZFknLFxuICAgICAgJ2dvLXRvLWNvb3Jkcy1idG4nOiAnZ29Ub0Nvb3Jkc0J0bicsXG5cbiAgICAgIC8vIE5hdmlnYXRpb25cbiAgICAgICdwcmV2LWltYWdlLWJ0bic6ICdwcmV2SW1hZ2VCdG4nLFxuICAgICAgJ25leHQtaW1hZ2UtYnRuJzogJ25leHRJbWFnZUJ0bicsXG5cbiAgICAgIC8vIFRoZW1lXG4gICAgICAnZGFyay1tb2RlLXRvZ2dsZSc6ICdkYXJrTW9kZVRvZ2dsZScsXG5cbiAgICAgIC8vIExhYmVsIGNsYXNzIG1vZGFsXG4gICAgICAnbGFiZWwtY2xhc3MtaW5wdXQnOiAnbGFiZWxDbGFzc0lucHV0JyxcbiAgICAgICdzYXZlLWxhYmVsLWNsYXNzLWJ0bic6ICdzYXZlTGFiZWxDbGFzc0J0bicsXG4gICAgfTtcblxuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgY29uc3QgbGVnYWN5SWQgPSBsZWdhY3lJZE1hcFtpZF07XG4gICAgICBpZiAobGVnYWN5SWQpIHtcbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGxlZ2FjeUlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCB3aXRoIElEICcke2lkfScgbm90IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICB9XG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgU3lzdGVtXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBhZGRFdmVudExpc3RlbmVyKHR5cGU6IFVJRXZlbnRUeXBlLCBoYW5kbGVyOiBVSUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmV2ZW50SGFuZGxlcnMuaGFzKHR5cGUpKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zZXQodHlwZSwgbmV3IFNldCgpKTtcclxuICAgIH1cclxuICAgIHRoaXMuZXZlbnRIYW5kbGVycy5nZXQodHlwZSkhLmFkZChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTogVUlFdmVudFR5cGUsIGhhbmRsZXI6IFVJRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRIYW5kbGVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZGVsZXRlKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNwYXRjaFVJRXZlbnQ8VCA9IGFueT4odHlwZTogVUlFdmVudFR5cGUsIGRhdGE/OiBULCB0YXJnZXQ/OiBIVE1MRWxlbWVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgZXZlbnQ6IFVJRXZlbnQ8VD4gPSB7XHJcbiAgICAgIHR5cGUsXHJcbiAgICAgIGRhdGEsXHJcbiAgICAgIHRhcmdldCxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudEhhbmRsZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihldmVudCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFBhbmVsIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgaW5pdGlhbGl6ZVBhbmVsQ29uZmlncygpOiB2b2lkIHtcclxuICAgIHRoaXMucGFuZWxDb25maWdzLnNldCgnbGVmdCcsIHtcclxuICAgICAgcGFuZWw6IHRoaXMuZWxlbWVudHMubGVmdFBhbmVsLFxyXG4gICAgICBzcGxpdHRlcjogdGhpcy5lbGVtZW50cy5sZWZ0U3BsaXR0ZXIsXHJcbiAgICAgIGV4cGFuZEJ0bjogdGhpcy5lbGVtZW50cy5leHBhbmRMZWZ0UGFuZWxCdG4sXHJcbiAgICAgIGlzQ29sbGFwc2luZzogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucGFuZWxDb25maWdzLnNldCgncmlnaHQnLCB7XHJcbiAgICAgIHBhbmVsOiB0aGlzLmVsZW1lbnRzLnJpZ2h0UGFuZWwsXHJcbiAgICAgIHNwbGl0dGVyOiB0aGlzLmVsZW1lbnRzLnJpZ2h0U3BsaXR0ZXIsXHJcbiAgICAgIGV4cGFuZEJ0bjogdGhpcy5lbGVtZW50cy5leHBhbmRSaWdodFBhbmVsQnRuLFxyXG4gICAgICBpc0NvbGxhcHNpbmc6IGZhbHNlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZVBhbmVsKGNvbmZpZzogUGFuZWxDb25maWcpOiB2b2lkIHtcclxuICAgIGlmIChjb25maWcuaXNDb2xsYXBzaW5nKSByZXR1cm47XHJcblxyXG4gICAgY29uZmlnLmlzQ29sbGFwc2luZyA9IHRydWU7XHJcbiAgICBjb25zdCBpc0NvbGxhcHNlZCA9IGNvbmZpZy5wYW5lbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZSc7XHJcblxyXG4gICAgaWYgKGlzQ29sbGFwc2VkKSB7XHJcbiAgICAgIC8vIEV4cGFuZCBwYW5lbFxyXG4gICAgICBjb25maWcucGFuZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgIGNvbmZpZy5leHBhbmRCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgY29uZmlnLnNwbGl0dGVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gQ29sbGFwc2UgcGFuZWxcclxuICAgICAgY29uZmlnLnBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIGNvbmZpZy5leHBhbmRCdG4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgIGNvbmZpZy5zcGxpdHRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IGZsYWcgYWZ0ZXIgYW5pbWF0aW9uXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgY29uZmlnLmlzQ29sbGFwc2luZyA9IGZhbHNlO1xyXG4gICAgfSwgMzAwKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgncGFuZWw6dG9nZ2xlZCcsIHsgcGFuZWxJZDogY29uZmlnLnBhbmVsLmlkLCBjb2xsYXBzZWQ6ICFpc0NvbGxhcHNlZCB9KTtcclxuICB9XHJcblxyXG4gIHNldHVwU3BsaXR0ZXJzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zcGxpdHRlckNvbmZpZ3MgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICBzcGxpdHRlcjogdGhpcy5lbGVtZW50cy5sZWZ0U3BsaXR0ZXIsXHJcbiAgICAgICAgcGFuZWw6IHRoaXMuZWxlbWVudHMubGVmdFBhbmVsLFxyXG4gICAgICAgIGRpcmVjdGlvbjogJ2xlZnQnLFxyXG4gICAgICAgIG1pbldpZHRoOiAyMDAsXHJcbiAgICAgICAgbWF4V2lkdGg6IDUwMFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3BsaXR0ZXI6IHRoaXMuZWxlbWVudHMucmlnaHRTcGxpdHRlcixcclxuICAgICAgICBwYW5lbDogdGhpcy5lbGVtZW50cy5yaWdodFBhbmVsLFxyXG4gICAgICAgIGRpcmVjdGlvbjogJ3JpZ2h0JyxcclxuICAgICAgICBtaW5XaWR0aDogMjAwLFxyXG4gICAgICAgIG1heFdpZHRoOiA1MDBcclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnNwbGl0dGVyQ29uZmlncy5mb3JFYWNoKGNvbmZpZyA9PiB7XHJcbiAgICAgIHRoaXMuc2V0dXBTcGxpdHRlcihjb25maWcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldHVwU3BsaXR0ZXIoY29uZmlnOiBTcGxpdHRlckNvbmZpZyk6IHZvaWQge1xyXG4gICAgbGV0IGlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIGxldCBzdGFydFggPSAwO1xyXG4gICAgbGV0IHN0YXJ0V2lkdGggPSAwO1xyXG5cclxuICAgIGNvbmZpZy5zcGxpdHRlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICBpc0RyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgc3RhcnRYID0gZS5jbGllbnRYO1xyXG4gICAgICBzdGFydFdpZHRoID0gcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUoY29uZmlnLnBhbmVsKS53aWR0aCwgMTApO1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBoYW5kbGVNb3VzZU1vdmUpO1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgaGFuZGxlTW91c2VVcCk7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZU1vdXNlTW92ZSA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgIGlmICghaXNEcmFnZ2luZykgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgZGVsdGFYID0gY29uZmlnLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gZS5jbGllbnRYIC0gc3RhcnRYIDogc3RhcnRYIC0gZS5jbGllbnRYO1xyXG4gICAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWluKE1hdGgubWF4KHN0YXJ0V2lkdGggKyBkZWx0YVgsIGNvbmZpZy5taW5XaWR0aCksIGNvbmZpZy5tYXhXaWR0aCk7XHJcbiAgICAgIGNvbmZpZy5wYW5lbC5zdHlsZS53aWR0aCA9IGAke25ld1dpZHRofXB4YDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgaGFuZGxlTW91c2VVcCA9ICgpID0+IHtcclxuICAgICAgaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBoYW5kbGVNb3VzZU1vdmUpO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgaGFuZGxlTW91c2VVcCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmVzaXplUGFuZWxzKCk6IHZvaWQge1xyXG4gICAgLy8gUmVzaXplIHBhbmVscyBiYXNlZCBvbiB3aW5kb3cgc2l6ZVxyXG4gICAgY29uc3Qgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIGNvbnN0IGxlZnRQYW5lbCA9IHRoaXMuZWxlbWVudHMubGVmdFBhbmVsO1xyXG4gICAgY29uc3QgcmlnaHRQYW5lbCA9IHRoaXMuZWxlbWVudHMucmlnaHRQYW5lbDtcclxuXHJcbiAgICBpZiAod2luZG93V2lkdGggPCA3NjgpIHtcclxuICAgICAgLy8gTW9iaWxlIHZpZXcgLSBoaWRlIHBhbmVsc1xyXG4gICAgICBsZWZ0UGFuZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgcmlnaHRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRGVza3RvcCB2aWV3IC0gc2hvdyBwYW5lbHNcclxuICAgICAgbGVmdFBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICByaWdodFBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExvYWRpbmcgU3RhdGUgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgc2hvd0xvYWRpbmdJbmRpY2F0b3IoKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvYWRpbmdTdGF0ZS5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5lbGVtZW50cy5sb2FkaW5nT3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2xvYWRpbmc6c2hvdycpO1xyXG4gIH1cclxuXHJcbiAgaGlkZUxvYWRpbmdJbmRpY2F0b3IoKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvYWRpbmdTdGF0ZS5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsb2FkaW5nOmhpZGUnKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUxvYWRpbmdQcm9ncmVzcyhwcm9ncmVzczogbnVtYmVyLCBtZXNzYWdlPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvYWRpbmdTdGF0ZS5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG4gICAgaWYgKG1lc3NhZ2UpIHtcclxuICAgICAgdGhpcy5sb2FkaW5nU3RhdGUubWVzc2FnZSA9IG1lc3NhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIGxvYWRpbmcgVUlcclxuICAgIGNvbnN0IHByb2dyZXNzQmFyID0gdGhpcy5lbGVtZW50cy5sb2FkaW5nT3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcucHJvZ3Jlc3MtYmFyJykgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICBpZiAocHJvZ3Jlc3NCYXIpIHtcclxuICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc30lYDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkucXVlcnlTZWxlY3RvcignLmxvYWRpbmctbWVzc2FnZScpIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgaWYgKG1lc3NhZ2VFbGVtZW50ICYmIG1lc3NhZ2UpIHtcclxuICAgICAgbWVzc2FnZUVsZW1lbnQudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsb2FkaW5nOnByb2dyZXNzJywgeyBwcm9ncmVzcywgbWVzc2FnZSB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBUaGVtZSBNYW5hZ2VtZW50XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBnZXRDdXJyZW50VGhlbWUoKTogVGhlbWVDb25maWcge1xyXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFRoZW1lO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREZWZhdWx0VGhlbWUoKTogVGhlbWVDb25maWcge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTogJ2xpZ2h0JyxcclxuICAgICAgcHJpbWFyeUNvbG9yOiAnIzAwN2JmZicsXHJcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICB0ZXh0Q29sb3I6ICcjMzMzMzMzJyxcclxuICAgICAgYm9yZGVyQ29sb3I6ICcjZGVlMmU2J1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RGFya1RoZW1lKCk6IFRoZW1lQ29uZmlnIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6ICdkYXJrJyxcclxuICAgICAgcHJpbWFyeUNvbG9yOiAnIzBkNmVmZCcsXHJcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyMxYTFhMWEnLFxyXG4gICAgICB0ZXh0Q29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgYm9yZGVyQ29sb3I6ICcjNDQ0NDQ0J1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFwcGx5VGhlbWUodGhlbWU6IFRoZW1lQ29uZmlnKTogdm9pZCB7XHJcbiAgICB0aGlzLmN1cnJlbnRUaGVtZSA9IHRoZW1lO1xyXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1icy10aGVtZScsIHRoZW1lLm5hbWUpO1xyXG5cclxuICAgIC8vIEFwcGx5IGN1c3RvbSBDU1MgdmFyaWFibGVzXHJcbiAgICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1wcmltYXJ5LWNvbG9yJywgdGhlbWUucHJpbWFyeUNvbG9yKTtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tYmFja2dyb3VuZC1jb2xvcicsIHRoZW1lLmJhY2tncm91bmRDb2xvcik7XHJcbiAgICByb290LnN0eWxlLnNldFByb3BlcnR5KCctLXRleHQtY29sb3InLCB0aGVtZS50ZXh0Q29sb3IpO1xyXG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1ib3JkZXItY29sb3InLCB0aGVtZS5ib3JkZXJDb2xvcik7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ3RoZW1lOmNoYW5nZWQnLCB0aGVtZSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVEYXJrTW9kZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGlzRGFyayA9IHRoaXMuY3VycmVudFRoZW1lLm5hbWUgPT09ICdkYXJrJztcclxuICAgIGNvbnN0IG5ld1RoZW1lID0gaXNEYXJrID8gdGhpcy5nZXREZWZhdWx0VGhlbWUoKSA6IHRoaXMuZ2V0RGFya1RoZW1lKCk7XHJcbiAgICB0aGlzLmFwcGx5VGhlbWUobmV3VGhlbWUpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0b2dnbGUgc3RhdGVcclxuICAgIHRoaXMuZWxlbWVudHMuZGFya01vZGVUb2dnbGUuY2hlY2tlZCA9ICFpc0Rhcms7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTGlzdCBSZW5kZXJpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHJlbmRlckltYWdlTGlzdCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGltYWdlTGlzdCA9IHRoaXMuZWxlbWVudHMuaW1hZ2VMaXN0O1xyXG4gICAgaW1hZ2VMaXN0LmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VMaXN0SXRlbXMgPSB0aGlzLl9zdGF0ZS5pbWFnZUZpbGVzLm1hcChpbWFnZUZpbGUgPT4ge1xyXG4gICAgICBjb25zdCBsaXN0SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBsaXN0SXRlbS5jbGFzc05hbWUgPSAnaW1hZ2UtbGlzdC1pdGVtJztcclxuICAgICAgbGlzdEl0ZW0uZGF0YXNldC5maWxlTmFtZSA9IGltYWdlRmlsZS5uYW1lO1xyXG5cclxuICAgICAgY29uc3QgaXNMYWJlbGVkID0gdGhpcy5fc3RhdGUuZ2V0SW1hZ2VMYWJlbFN0YXR1cyhpbWFnZUZpbGUubmFtZSk7XHJcbiAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSB0aGlzLl9zdGF0ZS5jdXJyZW50SW1hZ2VGaWxlPy5uYW1lID09PSBpbWFnZUZpbGUubmFtZTtcclxuXHJcbiAgICAgIGxpc3RJdGVtLmlubmVySFRNTCA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1hZ2UtaXRlbS1jb250ZW50XCI+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImltYWdlLW5hbWVcIj4ke2ltYWdlRmlsZS5uYW1lfTwvc3Bhbj5cclxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaW1hZ2Utc3RhdHVzICR7aXNMYWJlbGVkID8gJ2xhYmVsZWQnIDogJ3VubGFiZWxlZCd9XCI+XHJcbiAgICAgICAgICAgICR7aXNMYWJlbGVkID8gJ+KXjycgOiAn4peLJ31cclxuICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYDtcclxuXHJcbiAgICAgIGlmIChpc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgbGlzdEl0ZW0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGlzdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RJbWFnZShpbWFnZUZpbGUpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGltYWdlTGlzdC5hcHBlbmRDaGlsZChsaXN0SXRlbSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGZpbGU6IGltYWdlRmlsZSxcclxuICAgICAgICBpc0xhYmVsZWQsXHJcbiAgICAgICAgaXNTZWxlY3RlZCxcclxuICAgICAgICBlbGVtZW50OiBsaXN0SXRlbVxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2ltYWdlOmxpc3QtcmVuZGVyZWQnLCB7IGNvdW50OiB0aGlzLmltYWdlTGlzdEl0ZW1zLmxlbmd0aCB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgc2VsZWN0SW1hZ2UoaW1hZ2VGaWxlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zdGF0ZS5zZXRDdXJyZW50SW1hZ2UoaW1hZ2VGaWxlKTtcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnaW1hZ2U6c2VsZWN0ZWQnLCB7IGltYWdlRmlsZSB9KTtcblxuICAgIC8vIFVwZGF0ZSBzZWxlY3RlZCBoaWdobGlnaHQgYW5kIGN1cnJlbnQgaW1hZ2UgbmFtZVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmltYWdlTGlzdEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGl0ZW0uZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcsIGl0ZW0uZmlsZS5uYW1lID09PSBpbWFnZUZpbGUubmFtZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIHt9XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzPy5jdXJyZW50SW1hZ2VOYW1lU3Bhbikge1xuICAgICAgdGhpcy5fZWxlbWVudHMuY3VycmVudEltYWdlTmFtZVNwYW4udGV4dENvbnRlbnQgPSBpbWFnZUZpbGU/Lm5hbWUgfHwgJyc7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIExvYWQgaW1hZ2UgZnJvbSBmaWxlIHN5c3RlbSBhbmQgZGlzcGxheSBvbiBjYW52YXNcbiAgICAgIGNvbnN0IGltZ1Jlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkubG9hZEltYWdlPy4oaW1hZ2VGaWxlLmhhbmRsZSk7XG4gICAgICBpZiAoaW1nUmVzdWx0Py5zdWNjZXNzICYmIGltZ1Jlc3VsdC5kYXRhKSB7XG4gICAgICAgIGNvbnN0IGltZ0VsID0gaW1nUmVzdWx0LmRhdGEgYXMgSFRNTEltYWdlRWxlbWVudDtcbiAgICAgICAgLy8gS2VlcCBjdXJyZW50IGltYWdlIGVsZW1lbnQgaW4gc3RhdGUgZm9yIHNpemUgcmVmZXJlbmNlIHdoZW4gc2F2aW5nXG4gICAgICAgIHRyeSB7ICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmN1cnJlbnRJbWFnZSA9IGltZ0VsOyB9IGNhdGNoIHt9XG4gICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIubG9hZEltYWdlKGltZ0VsKTtcblxuICAgICAgICAvLyBMb2FkIGxhYmVscyBpZiBsYWJlbCBmb2xkZXIgc2VsZWN0ZWRcbiAgICAgICAgY29uc3QgbGFiZWxGb2xkZXIgPSAodGhpcy5fc3RhdGUgYXMgYW55KS5sYWJlbEZvbGRlckhhbmRsZTtcbiAgICAgICAgaWYgKGxhYmVsRm9sZGVyKSB7XG4gICAgICAgICAgY29uc3QgbGJsUmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5sb2FkTGFiZWxzPy4oaW1hZ2VGaWxlLm5hbWUsIGxhYmVsRm9sZGVyKTtcbiAgICAgICAgICBpZiAobGJsUmVzdWx0Py5zdWNjZXNzICYmIEFycmF5LmlzQXJyYXkobGJsUmVzdWx0LmRhdGEpKSB7XG4gICAgICAgICAgICAvLyBDbGVhciBleGlzdGluZyBsYWJlbHNcbiAgICAgICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpLmZvckVhY2goYiA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnJlbW92ZUJvdW5kaW5nQm94KGIuaWQpKTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gKGltZ0VsIGFzIGFueSkubmF0dXJhbFdpZHRoIHx8IGltZ0VsLndpZHRoIHx8IDE7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSAoaW1nRWwgYXMgYW55KS5uYXR1cmFsSGVpZ2h0IHx8IGltZ0VsLmhlaWdodCB8fCAxO1xuICAgICAgICAgICAgbGJsUmVzdWx0LmRhdGEuZm9yRWFjaCgoeTogYW55KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJib3ggPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLnlvbG9Ub0JvdW5kaW5nQm94KHksIHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgICAgICAgICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5hZGRCb3VuZGluZ0JveChiYm94KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHNlbGVjdGVkIGltYWdlJywgZSk7XG4gICAgfVxuICB9XG5cclxuICB1cGRhdGVMYWJlbExpc3QoKTogdm9pZCB7XHJcbiAgICBjb25zdCBsYWJlbExpc3QgPSB0aGlzLmVsZW1lbnRzLmxhYmVsTGlzdDtcclxuICAgIGxhYmVsTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAvLyBHZXQgY3VycmVudCBib3VuZGluZyBib3hlcyBmcm9tIGNhbnZhc1xyXG4gICAgY29uc3QgYm91bmRpbmdCb3hlcyA9IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpO1xyXG5cclxuICAgIHRoaXMubGFiZWxMaXN0SXRlbXMgPSBib3VuZGluZ0JveGVzLm1hcChiYm94ID0+IHtcclxuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgbGlzdEl0ZW0uY2xhc3NOYW1lID0gJ2xhYmVsLWxpc3QtaXRlbSc7XHJcbiAgICAgIGxpc3RJdGVtLmRhdGFzZXQubGFiZWxJZCA9IGJib3guaWQ7XHJcblxyXG4gICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmdldERpc3BsYXlOYW1lRm9yQ2xhc3MoYmJveC5jbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgbGlzdEl0ZW0uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbC1pdGVtLWNvbnRlbnRcIj5cclxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWwtY2xhc3NcIj4ke2NsYXNzTmFtZX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImxhYmVsLWNvb3Jkc1wiPigke01hdGgucm91bmQoYmJveC54KX0sICR7TWF0aC5yb3VuZChiYm94LnkpfSk8L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICBsaXN0SXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICB0aGlzLnNlbGVjdExhYmVsKGJib3guaWQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxhYmVsTGlzdC5hcHBlbmRDaGlsZChsaXN0SXRlbSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkOiBiYm94LmlkLFxyXG4gICAgICAgIGNsYXNzSWQ6IGJib3guY2xhc3NJZCxcclxuICAgICAgICBjbGFzc05hbWUsXHJcbiAgICAgICAgYm91bmRpbmdCb3g6IGJib3gsXHJcbiAgICAgICAgaXNTZWxlY3RlZDogZmFsc2UsXHJcbiAgICAgICAgZWxlbWVudDogbGlzdEl0ZW1cclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsYWJlbDpsaXN0LXJlbmRlcmVkJywgeyBjb3VudDogdGhpcy5sYWJlbExpc3RJdGVtcy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNlbGVjdExhYmVsKGxhYmVsSWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5zZWxlY3RCb3VuZGluZ0JveChsYWJlbElkKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsYWJlbDpzZWxlY3RlZCcsIHsgbGFiZWxJZCB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWx0ZXIgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdXBkYXRlTGFiZWxGaWx0ZXJzKHJlY3RzOiBCb3VuZGluZ0JveFtdKTogdm9pZCB7XHJcbiAgICBjb25zdCBmaWx0ZXJzQ29udGFpbmVyID0gdGhpcy5lbGVtZW50cy5sYWJlbEZpbHRlcnM7XHJcbiAgICBmaWx0ZXJzQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgIC8vIEdyb3VwIGJ5IGNsYXNzXHJcbiAgICBjb25zdCBjbGFzc0dyb3VwcyA9IG5ldyBNYXA8bnVtYmVyLCBCb3VuZGluZ0JveFtdPigpO1xyXG4gICAgcmVjdHMuZm9yRWFjaChyZWN0ID0+IHtcclxuICAgICAgaWYgKCFjbGFzc0dyb3Vwcy5oYXMocmVjdC5jbGFzc0lkKSkge1xyXG4gICAgICAgIGNsYXNzR3JvdXBzLnNldChyZWN0LmNsYXNzSWQsIFtdKTtcclxuICAgICAgfVxyXG4gICAgICBjbGFzc0dyb3Vwcy5nZXQocmVjdC5jbGFzc0lkKSEucHVzaChyZWN0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZmlsdGVyQnV0dG9ucyA9IEFycmF5LmZyb20oY2xhc3NHcm91cHMuZW50cmllcygpKS5tYXAoKFtjbGFzc0lkLCBjbGFzc1JlY3RzXSkgPT4ge1xyXG4gICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdidG4gYnRuLW91dGxpbmUtcHJpbWFyeSBidG4tc20gZmlsdGVyLWJ0bic7XHJcbiAgICAgIGJ1dHRvbi5kYXRhc2V0LmNsYXNzSWQgPSBjbGFzc0lkLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmdldERpc3BsYXlOYW1lRm9yQ2xhc3MoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gYCR7Y2xhc3NOYW1lfSAoJHtjbGFzc1JlY3RzLmxlbmd0aH0pYDtcclxuXHJcbiAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUZpbHRlcihjbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGZpbHRlcnNDb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZWxlbWVudDogYnV0dG9uLFxyXG4gICAgICAgIGxhYmVsQ2xhc3M6IGNsYXNzSWQudG9TdHJpbmcoKSxcclxuICAgICAgICBjb3VudDogY2xhc3NSZWN0cy5sZW5ndGgsXHJcbiAgICAgICAgaXNBY3RpdmU6IHRydWVcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdmaWx0ZXI6dXBkYXRlZCcsIHsgZmlsdGVyQ291bnQ6IHRoaXMuZmlsdGVyQnV0dG9ucy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvZ2dsZUZpbHRlcihsYWJlbENsYXNzOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IGZpbHRlckJ1dHRvbiA9IHRoaXMuZmlsdGVyQnV0dG9ucy5maW5kKGJ0biA9PiBidG4ubGFiZWxDbGFzcyA9PT0gbGFiZWxDbGFzcyk7XHJcbiAgICBpZiAoZmlsdGVyQnV0dG9uKSB7XHJcbiAgICAgIGZpbHRlckJ1dHRvbi5pc0FjdGl2ZSA9ICFmaWx0ZXJCdXR0b24uaXNBY3RpdmU7XHJcbiAgICAgIGZpbHRlckJ1dHRvbi5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGZpbHRlckJ1dHRvbi5pc0FjdGl2ZSk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdmaWx0ZXI6Y2hhbmdlZCcsIHsgbGFiZWxDbGFzcywgYWN0aXZlOiBmaWx0ZXJCdXR0b24uaXNBY3RpdmUgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVTZWxlY3RCeUNsYXNzRHJvcGRvd24ocmVjdHM6IEJvdW5kaW5nQm94W10pOiB2b2lkIHtcclxuICAgIGNvbnN0IGRyb3Bkb3duID0gdGhpcy5lbGVtZW50cy5zZWxlY3RCeUNsYXNzRHJvcGRvd247XHJcbiAgICBkcm9wZG93bi5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPlNlbGVjdCBjbGFzcy4uLjwvb3B0aW9uPic7XHJcblxyXG4gICAgY29uc3QgdW5pcXVlQ2xhc3NlcyA9IG5ldyBTZXQocmVjdHMubWFwKHJlY3QgPT4gcmVjdC5jbGFzc0lkKSk7XHJcbiAgICB1bmlxdWVDbGFzc2VzLmZvckVhY2goY2xhc3NJZCA9PiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICBvcHRpb24udmFsdWUgPSBjbGFzc0lkLnRvU3RyaW5nKCk7XHJcbiAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IHRoaXMuZ2V0RGlzcGxheU5hbWVGb3JDbGFzcyhjbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkcm9wZG93bi5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdHVzIFVwZGF0ZXNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHVwZGF0ZUxhYmVsRm9sZGVyQnV0dG9uKHNlbGVjdGVkOiBib29sZWFuLCBmb2xkZXJOYW1lPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBidXR0b24gPSB0aGlzLmVsZW1lbnRzLnNlbGVjdExhYmVsRm9sZGVyQnRuO1xyXG4gICAgaWYgKHNlbGVjdGVkICYmIGZvbGRlck5hbWUpIHtcclxuICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gYPCfk4EgJHtmb2xkZXJOYW1lfWA7XHJcbiAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tc3VjY2VzcycpO1xyXG4gICAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYnRuLW91dGxpbmUtcHJpbWFyeScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ1NlbGVjdCBMYWJlbCBGb2xkZXInO1xyXG4gICAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYnRuLXN1Y2Nlc3MnKTtcclxuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi1vdXRsaW5lLXByaW1hcnknKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHVwZGF0ZU1vZGVCdXR0b25zKG1vZGU6IE1vZGUpOiB2b2lkIHtcclxuICAgIGNvbnN0IGRyYXdCdG4gPSB0aGlzLmVsZW1lbnRzLmRyYXdNb2RlQnRuO1xyXG4gICAgY29uc3QgZWRpdEJ0biA9IHRoaXMuZWxlbWVudHMuZWRpdE1vZGVCdG47XHJcblxyXG4gICAgZHJhd0J0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBtb2RlID09PSAnZHJhdycpO1xyXG4gICAgZWRpdEJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBtb2RlID09PSAnZWRpdCcpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdtb2RlOmNoYW5nZWQnLCB7IG1vZGUgfSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVab29tRGlzcGxheSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldFpvb20oKTtcclxuICAgIHRoaXMuZWxlbWVudHMuem9vbUlucHV0LnZhbHVlID0gTWF0aC5yb3VuZCh6b29tICogMTAwKS50b1N0cmluZygpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlTW91c2VDb29yZHMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuZWxlbWVudHMubW91c2VDb29yZHNEaXNwbGF5LnRleHRDb250ZW50ID0gYCgke01hdGgucm91bmQoeCl9LCAke01hdGgucm91bmQoeSl9KWA7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVDdXJyZW50SW1hZ2VEaXNwbGF5KGltYWdlTmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmN1cnJlbnRJbWFnZU5hbWVTcGFuLnRleHRDb250ZW50ID0gaW1hZ2VOYW1lO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENvbnRleHQgTWVudVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgc2hvd0NvbnRleHRNZW51KGNvbmZpZzogQ29udGV4dE1lbnVDb25maWcpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvbnRleHRNZW51ID0gdGhpcy5lbGVtZW50cy5jb250ZXh0TWVudTtcclxuICAgIGNvbnRleHRNZW51LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgY29udGV4dE1lbnUuc3R5bGUubGVmdCA9IGAke2NvbmZpZy54fXB4YDtcclxuICAgIGNvbnRleHRNZW51LnN0eWxlLnRvcCA9IGAke2NvbmZpZy55fXB4YDtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnY29udGV4dC1tZW51OnNob3cnLCBjb25maWcpO1xyXG4gIH1cclxuXHJcbiAgaGlkZUNvbnRleHRNZW51KCk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jb250ZXh0TWVudS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2NvbnRleHQtbWVudTpoaWRlJyk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTW9kYWwgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgc2hvd0NsYXNzRWRpdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jbGFzc0ZpbGVWaWV3ZXJNb2RhbC5zaG93KCk7XHJcbiAgfVxyXG5cclxuICBoaWRlQ2xhc3NFZGl0b3IoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmNsYXNzRmlsZVZpZXdlck1vZGFsLmhpZGUoKTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGdldERpc3BsYXlOYW1lRm9yQ2xhc3MobGFiZWxDbGFzczogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5jbGFzc05hbWVzLmdldChsYWJlbENsYXNzKSB8fCBgQ2xhc3MgJHtsYWJlbENsYXNzfWA7XHJcbiAgfVxyXG5cclxuICBnZXRET01FbGVtZW50cygpOiBET01FbGVtZW50cyB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50cztcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTdGF0ZSBHZXR0ZXJzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBnZXRVSVN0YXRlKCk6IFVJU3RhdGUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNJbWFnZUxpc3RWaXNpYmxlOiB0aGlzLmVsZW1lbnRzLmltYWdlTGlzdC5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZScsXHJcbiAgICAgIGlzTGFiZWxMaXN0VmlzaWJsZTogdGhpcy5lbGVtZW50cy5sYWJlbExpc3Quc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnLFxyXG4gICAgICBpc1ByZXZpZXdCYXJWaXNpYmxlOiB0aGlzLmVsZW1lbnRzLnByZXZpZXdCYXIuc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnLFxyXG4gICAgICBpc0xlZnRQYW5lbENvbGxhcHNlZDogdGhpcy5lbGVtZW50cy5sZWZ0UGFuZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnLFxyXG4gICAgICBpc1JpZ2h0UGFuZWxDb2xsYXBzZWQ6IHRoaXMuZWxlbWVudHMucmlnaHRQYW5lbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScsXHJcbiAgICAgIGFjdGl2ZUZpbHRlcnM6IG5ldyBTZXQodGhpcy5maWx0ZXJCdXR0b25zLmZpbHRlcihidG4gPT4gYnRuLmlzQWN0aXZlKS5tYXAoYnRuID0+IGJ0bi5sYWJlbENsYXNzKSksXHJcbiAgICAgIHNlbGVjdGVkTGFiZWxzOiBuZXcgU2V0KCkgLy8gVE9ETzogaW1wbGVtZW50IHNlbGVjdGlvbiB0cmFja2luZ1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGdldFNlYXJjaE9wdGlvbnMoKTogU2VhcmNoT3B0aW9ucyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzZWFyY2hUZXJtOiB0aGlzLmVsZW1lbnRzLmltYWdlU2VhcmNoSW5wdXQudmFsdWUsXHJcbiAgICAgIHNob3dMYWJlbGVkOiB0aGlzLmVsZW1lbnRzLnNob3dMYWJlbGVkQ2hlY2tib3guY2hlY2tlZCxcclxuICAgICAgc2hvd1VubGFiZWxlZDogdGhpcy5lbGVtZW50cy5zaG93VW5sYWJlbGVkQ2hlY2tib3guY2hlY2tlZCxcclxuICAgICAgc29ydE9yZGVyOiAnbmFtZScsIC8vIFRPRE86IGltcGxlbWVudCBkeW5hbWljIHNvcnRpbmdcclxuICAgICAgc29ydERpcmVjdGlvbjogJ2FzYydcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBnZXRGaWx0ZXJPcHRpb25zKCk6IEZpbHRlck9wdGlvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYWN0aXZlQ2xhc3NlczogbmV3IFNldCh0aGlzLmZpbHRlckJ1dHRvbnMuZmlsdGVyKGJ0biA9PiBidG4uaXNBY3RpdmUpLm1hcChidG4gPT4gYnRuLmxhYmVsQ2xhc3MpKSxcclxuICAgICAgc2hvd0FsbDogdGhpcy5maWx0ZXJCdXR0b25zLmxlbmd0aCA9PT0gMCxcclxuICAgICAgaGlkZUVtcHR5OiBmYWxzZSAvLyBUT0RPOiBpbXBsZW1lbnQgaGlkZSBlbXB0eSBvcHRpb25cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEV2ZW50IExpc3RlbmVyIFNldHVwXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxyXG4gIHByaXZhdGUgc2V0dXBFdmVudExpc3RlbmVycygpOiB2b2lkIHtcbiAgICAvLyBTeW5jIFVJIHdoZW4gbW9kZSBjaGFuZ2VzIHByb2dyYW1tYXRpY2FsbHkgKGUuZy4sIHJpZ2h0LWNsaWNrIHRvZ2dsZSlcbiAgICB0cnkge1xuICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkuYWRkRXZlbnRMaXN0ZW5lcignbW9kZTpjaGFuZ2VkJywgKGV2dDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBldnQ/LmRhdGE/LmN1cnJlbnQ7XG4gICAgICAgIHRoaXMuc3luY01vZGVVSShjdXJyZW50KTtcbiAgICAgIH0pO1xuICAgICAgLy8gSW5pdGlhbGl6ZSBvbmNlXG4gICAgICB0aGlzLnN5bmNNb2RlVUkoKHRoaXMuX3N0YXRlIGFzIGFueSkuY3VycmVudE1vZGUpO1xuICAgIH0gY2F0Y2gge31cbiAgICAvLyBVcGRhdGUgY29vcmQgaW5wdXRzIHdpdGggaW1hZ2UgcG9pbnRlciBwb3NpdGlvblxuICAgIHRyeSB7XG4gICAgICAodGhpcy5fY2FudmFzQ29udHJvbGxlciBhcyBhbnkpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlOm1vdmUnLCAoZXZ0OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gZXZ0Py5kYXRhPy5pbWFnZTtcbiAgICAgICAgaWYgKGltZyAmJiBOdW1iZXIuaXNGaW5pdGUoaW1nLngpICYmIE51bWJlci5pc0Zpbml0ZShpbWcueSkpIHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnRzLmNvb3JkWElucHV0LnZhbHVlID0gU3RyaW5nKE1hdGgucm91bmQoaW1nLngpKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnRzLmNvb3JkWUlucHV0LnZhbHVlID0gU3RyaW5nKE1hdGgucm91bmQoaW1nLnkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICAgIC8vIEZvbGRlciBzZWxlY3Rpb25cbiAgICB0aGlzLmVsZW1lbnRzLnNlbGVjdEltYWdlRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RJbWFnZUZvbGRlcj8uKCk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRJbWFnZUZvbGRlcihyZXN1bHQuZGF0YSk7XG5cbiAgICAgICAgICAvLyBBdXRvLWRldGVjdCBvciBjcmVhdGUgbGFiZWwgZm9sZGVyIGluc2lkZSB0aGUgc2VsZWN0ZWQgaW1hZ2UgZm9sZGVyXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRm9sZGVySGFuZGxlID0gcmVzdWx0LmRhdGEgYXMgYW55O1xuICAgICAgICAgICAgbGV0IGxhYmVsSGFuZGxlOiBhbnkgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgIC8vIFRyeSBjb21tb24gbmFtZXMgZmlyc3Q6ICdsYWJlbHMnLCB0aGVuICdsYWJlbCdcbiAgICAgICAgICAgIHRyeSB7IGxhYmVsSGFuZGxlID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUuZ2V0RGlyZWN0b3J5SGFuZGxlKCdsYWJlbHMnKTsgfSBjYXRjaCB7fVxuICAgICAgICAgICAgaWYgKCFsYWJlbEhhbmRsZSkgeyB0cnkgeyBsYWJlbEhhbmRsZSA9IGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLmdldERpcmVjdG9yeUhhbmRsZSgnbGFiZWwnKTsgfSBjYXRjaCB7fSB9XG5cbiAgICAgICAgICAgIGlmICghbGFiZWxIYW5kbGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgY3JlYXRlID0gd2luZG93LmNvbmZpcm0oJ05vIGxhYmVsIGZvbGRlciBmb3VuZCBpbnNpZGUgdGhlIHNlbGVjdGVkIGltYWdlIGZvbGRlci5cXG5DcmVhdGUgYSBuZXcgXCJsYWJlbHNcIiBmb2xkZXI/Jyk7XG4gICAgICAgICAgICAgIGlmIChjcmVhdGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZUZvbGRlckhhbmRsZS5yZXF1ZXN0UGVybWlzc2lvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJtID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUucmVxdWVzdFBlcm1pc3Npb24oeyBtb2RlOiAncmVhZHdyaXRlJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcm0gIT09ICdncmFudGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLnJlcXVlc3RQZXJtaXNzaW9uKHsgbW9kZTogJ3JlYWR3cml0ZScgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGxhYmVsSGFuZGxlID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUuZ2V0RGlyZWN0b3J5SGFuZGxlKCdsYWJlbHMnLCB7IGNyZWF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgbGFiZWxzIGZvbGRlcicsIGVycik7XG4gICAgICAgICAgICAgICAgICBzaG93RXJyb3JUb2FzdCgnUGVybWlzc2lvbiBibG9ja2VkLiBVc2UgXCJMb2FkIExhYmVsIEZvbGRlclwiIHRvIHBpY2sgYSBmb2xkZXIuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbEhhbmRsZSkge1xuICAgICAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRMYWJlbEZvbGRlcihsYWJlbEhhbmRsZSk7XG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxGb2xkZXJCdXR0b24odHJ1ZSwgbGFiZWxIYW5kbGUubmFtZSk7XG4gICAgICAgICAgICAgIHNob3dTdWNjZXNzVG9hc3QoYExhYmVsIGZvbGRlciByZWFkeTogJHtsYWJlbEhhbmRsZS5uYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTGFiZWwgZm9sZGVyIGRldGVjdGlvbi9jcmVhdGlvbiBza2lwcGVkOicsIGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExpc3QgaW1hZ2VzIGFmdGVyIGxhYmVsIGZvbGRlciBoYW5kbGluZ1xuICAgICAgICAgIGNvbnN0IGxpc3RSZXMgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLmxpc3RJbWFnZUZpbGVzPy4ocmVzdWx0LmRhdGEpO1xuICAgICAgICAgIGlmIChsaXN0UmVzPy5zdWNjZXNzICYmIEFycmF5LmlzQXJyYXkobGlzdFJlcy5kYXRhKSkge1xuICAgICAgICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkuaW1hZ2VGaWxlcyA9IGxpc3RSZXMuZGF0YTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVySW1hZ2VMaXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZWxlY3QgaW1hZ2UgZm9sZGVyJywgZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnNlbGVjdExhYmVsRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RMYWJlbEZvbGRlcj8uKCk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRMYWJlbEZvbGRlcihyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgdGhpcy51cGRhdGVMYWJlbEZvbGRlckJ1dHRvbih0cnVlLCByZXN1bHQuZGF0YS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VsZWN0IGxhYmVsIGZvbGRlcicsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5sb2FkQ2xhc3NJbmZvRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RDbGFzc0luZm9Gb2xkZXI/LigpO1xuICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgdGhpcy5fc3RhdGUuc2V0Q2xhc3NJbmZvRm9sZGVyKHJlc3VsdC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VsZWN0IGNsYXNzIGluZm8gZm9sZGVyJywgZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBab29tIGNvbnRyb2xzXG4gICAgdGhpcy5lbGVtZW50cy56b29tSW5CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnpvb21JbigpKTtcbiAgICB0aGlzLmVsZW1lbnRzLnpvb21PdXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnpvb21PdXQoKSk7XG4gICAgdGhpcy5lbGVtZW50cy5yZXNldFpvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9jYW52YXNDb250cm9sbGVyLnJlc2V0Wm9vbSgpKTtcblxuICAgIC8vIE1vZGUgc3dpdGNoaW5nXG4gICAgdGhpcy5lbGVtZW50cy5kcmF3TW9kZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuX3N0YXRlLnNldE1vZGUoJ2RyYXcnKSk7XG4gICAgdGhpcy5lbGVtZW50cy5lZGl0TW9kZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuX3N0YXRlLnNldE1vZGUoJ2VkaXQnKSk7XG5cbiAgICAvLyBDYW52YXMgZGlzcGxheSBvcHRpb25zXG4gICAgdGhpcy5lbGVtZW50cy5zaG93TGFiZWxzT25DYW52YXNUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhdGUuc2V0U2hvd0xhYmVscyh0aGlzLmVsZW1lbnRzLnNob3dMYWJlbHNPbkNhbnZhc1RvZ2dsZS5jaGVja2VkKTtcbiAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIudXBkYXRlTGFiZWxzKCk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtZW50cy5sYWJlbEZvbnRTaXplU2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgY29uc3QgdmFsID0gTnVtYmVyKHRoaXMuZWxlbWVudHMubGFiZWxGb250U2l6ZVNsaWRlci52YWx1ZSk7XG4gICAgICB0aGlzLmVsZW1lbnRzLmxhYmVsRm9udFNpemVWYWx1ZS50ZXh0Q29udGVudCA9IFN0cmluZyh2YWwpO1xuICAgICAgdGhpcy5fc3RhdGUuc2V0TGFiZWxGb250U2l6ZSh2YWwpO1xuICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5zZXRMYWJlbEZvbnQodmFsKTtcbiAgICB9KTtcbiAgICB0aGlzLmVsZW1lbnRzLmF1dG9TYXZlVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuX3N0YXRlLnNldEF1dG9TYXZlKHRoaXMuZWxlbWVudHMuYXV0b1NhdmVUb2dnbGUuY2hlY2tlZCk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtZW50cy5jcm9zc2hhaXJUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhdGUudG9nZ2xlQ3Jvc3NoYWlyKCk7XG4gICAgfSk7XG5cbiAgICAvLyBXaW5kb3cgcmVzaXplIGhhbmRsZXJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZXNpemVQYW5lbHMoKTtcbiAgICB9KTtcblxyXG4gICAgLy8gUGFuZWwgY29sbGFwc2UvZXhwYW5kIGJ1dHRvbnNcclxuICAgIHRoaXMuZWxlbWVudHMuY29sbGFwc2VMZWZ0UGFuZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGFuZWxDb25maWdzLmdldCgnbGVmdCcpITtcclxuICAgICAgdGhpcy50b2dnbGVQYW5lbChjb25maWcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50cy5jb2xsYXBzZVJpZ2h0UGFuZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGFuZWxDb25maWdzLmdldCgncmlnaHQnKSE7XHJcbiAgICAgIHRoaXMudG9nZ2xlUGFuZWwoY29uZmlnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudHMuZXhwYW5kTGVmdFBhbmVsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLnBhbmVsQ29uZmlncy5nZXQoJ2xlZnQnKSE7XHJcbiAgICAgIHRoaXMudG9nZ2xlUGFuZWwoY29uZmlnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudHMuZXhwYW5kUmlnaHRQYW5lbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5wYW5lbENvbmZpZ3MuZ2V0KCdyaWdodCcpITtcclxuICAgICAgdGhpcy50b2dnbGVQYW5lbChjb25maWcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGhlbWUgdG9nZ2xlXG4gICAgdGhpcy5lbGVtZW50cy5kYXJrTW9kZVRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZURhcmtNb2RlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBTYXZlIGxhYmVsc1xuICAgIHRoaXMuZWxlbWVudHMuc2F2ZUxhYmVsc0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdGhpcy5fc3RhdGUuY3VycmVudEltYWdlRmlsZSB8fCAhKHRoaXMuX3N0YXRlIGFzIGFueSkubGFiZWxGb2xkZXJIYW5kbGUpIHtcbiAgICAgICAgICBzaG93RXJyb3JUb2FzdCgnU2VsZWN0IGltYWdlIGFuZCBsYWJlbCBmb2xkZXJzIGZpcnN0Jyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94ZXMgPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKTtcbiAgICAgICAgY29uc3QgeW9sb0xhYmVscyA9IGJvdW5kaW5nQm94ZXMubWFwKGJib3ggPT5cbiAgICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLmJvdW5kaW5nQm94VG9ZT0xPKGJib3gsIHtcbiAgICAgICAgICAgIHdpZHRoOiAodGhpcy5fc3RhdGUgYXMgYW55KS5jdXJyZW50SW1hZ2U/LndpZHRoIHx8IDEsXG4gICAgICAgICAgICBoZWlnaHQ6ICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkuc2F2ZUxhYmVscz8uKFxuICAgICAgICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRJbWFnZUZpbGUubmFtZSxcbiAgICAgICAgICB5b2xvTGFiZWxzLFxuICAgICAgICAgICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmxhYmVsRm9sZGVySGFuZGxlXG4gICAgICAgICk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MpIHtcbiAgICAgICAgICBzaG93U3VjY2Vzc1RvYXN0KCdMYWJlbHMgc2F2ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2hvd0Vycm9yVG9hc3QocmVzdWx0Py5lcnJvciB8fCAnRmFpbGVkIHRvIHNhdmUgbGFiZWxzJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdTYXZlIGxhYmVscyBmYWlsZWQnLCBlKTtcbiAgICAgICAgc2hvd0Vycm9yVG9hc3QoJ0ZhaWxlZCB0byBzYXZlIGxhYmVscycpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gR28gdG8gY29vcmRpbmF0ZXNcbiAgICB0aGlzLmVsZW1lbnRzLmdvVG9Db29yZHNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBjb25zdCB4ID0gTnVtYmVyKHRoaXMuZWxlbWVudHMuY29vcmRYSW5wdXQudmFsdWUpO1xuICAgICAgY29uc3QgeSA9IE51bWJlcih0aGlzLmVsZW1lbnRzLmNvb3JkWUlucHV0LnZhbHVlKTtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoeCkgJiYgTnVtYmVyLmlzRmluaXRlKHkpKSB7XG4gICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ29Ub0ltYWdlQ29vcmRpbmF0ZXMoeCwgeSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBab29tIGlucHV0IChwZXJjZW50KVxuICAgIHRoaXMuZWxlbWVudHMuem9vbUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGNvbnN0IHBjdCA9IE51bWJlcih0aGlzLmVsZW1lbnRzLnpvb21JbnB1dC52YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHBjdCkgJiYgcGN0ID4gMCkge1xuICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLnNldFpvb21QZXJjZW50KHBjdCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBIaWRlIGNvbnRleHQgbWVudSBvbiBkb2N1bWVudCBjbGlja1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5lbGVtZW50cy5jb250ZXh0TWVudS5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgICB0aGlzLmhpZGVDb250ZXh0TWVudSgpO1xuICAgICAgfVxuICAgIH0pO1xyXG4gIH1cblxuICAvLyBLZWVwIG1vZGUgYnV0dG9ucyBpbiBzeW5jIHdpdGggQXBwU3RhdGVcbiAgcHJpdmF0ZSBzeW5jTW9kZVVJKGN1cnJlbnRNb2RlOiAnZHJhdycgfCAnZWRpdCcpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZHJhd0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RyYXdNb2RlJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XG4gICAgICBjb25zdCBlZGl0SW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRpdE1vZGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbDtcbiAgICAgIGNvbnN0IGRyYXdMYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsW2Zvcj1cImRyYXdNb2RlXCJdJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgY29uc3QgZWRpdExhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiZWRpdE1vZGVcIl0nKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgICAgIGNvbnN0IGlzRHJhdyA9IGN1cnJlbnRNb2RlID09PSAnZHJhdyc7XG4gICAgICBpZiAoZHJhd0lucHV0KSBkcmF3SW5wdXQuY2hlY2tlZCA9IGlzRHJhdztcbiAgICAgIGlmIChlZGl0SW5wdXQpIGVkaXRJbnB1dC5jaGVja2VkID0gIWlzRHJhdztcbiAgICAgIGlmIChkcmF3TGFiZWwpIGRyYXdMYWJlbC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBpc0RyYXcpO1xuICAgICAgaWYgKGVkaXRMYWJlbCkgZWRpdExhYmVsLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsICFpc0RyYXcpO1xuICAgIH0gY2F0Y2gge31cbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFZhbGlkYXRpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhbGlkYXRlVUlTdGF0ZSgpOiBhbnkge1xyXG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgZXNzZW50aWFsIGVsZW1lbnRzIGV4aXN0XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudHMuY2FudmFzQ29udGFpbmVyKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdDYW52YXMgY29udGFpbmVyIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5lbGVtZW50cy5pbWFnZUxpc3QpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0ltYWdlIGxpc3QgY29udGFpbmVyIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5lbGVtZW50cy5sYWJlbExpc3QpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0xhYmVsIGxpc3QgY29udGFpbmVyIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZUZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YSk6IGFueSB7XHJcbiAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAvLyBJbXBsZW1lbnQgZm9ybSB2YWxpZGF0aW9uIGxvZ2ljIGFzIG5lZWRlZFxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQWRkaXRpb25hbCBNZXRob2RzIChmb3IgZnV0dXJlIGV4cGFuc2lvbilcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGFkZEVkaXREZWxldGVMaXN0ZW5lcnMocmVjdHM6IEJvdW5kaW5nQm94W10pOiB2b2lkIHtcclxuICAgIC8vIEltcGxlbWVudGF0aW9uIGZvciBhZGRpbmcgZWRpdC9kZWxldGUgZXZlbnQgbGlzdGVuZXJzIHRvIGJvdW5kaW5nIGJveCBlbGVtZW50c1xyXG4gICAgcmVjdHMuZm9yRWFjaChyZWN0ID0+IHtcclxuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgZWRpdC9kZWxldGUgb3BlcmF0aW9uc1xyXG4gICAgICAvLyBUaGlzIHdvdWxkIHR5cGljYWxseSBiZSBoYW5kbGVkIGJ5IHRoZSBDYW52YXNDb250cm9sbGVyXHJcbiAgICB9KTtcclxuICB9XHJcbn1cbiIsIi8qKlxyXG4gKiBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWFpbiBFbnRyeSBQb2ludFxyXG4gKlxyXG4gKiBQaGFzZSA4IENvbXBsZXRlOiBBcHBsaWNhdGlvbiBJbnRlZ3JhdGlvbiAmIFRlc3RpbmdcclxuICogQWxsIG1vZHVsZXMgaW50ZWdyYXRlZCB3aXRoIGNvbXBsZXRlIGRlcGVuZGVuY3kgaW5qZWN0aW9uIHN5c3RlbVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGNyZWF0ZUFwcFN0YXRlIH0gZnJvbSAnLi9tb2RlbHMnO1xyXG5pbXBvcnQgeyBjcmVhdGVGaWxlU3lzdGVtU2VydmljZSwgRmlsZVN5c3RlbVNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzJztcclxuaW1wb3J0IHsgQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvQ2FudmFzQ29udHJvbGxlcic7XHJcbmltcG9ydCB7IEV2ZW50TWFuYWdlciB9IGZyb20gJy4vY29udHJvbGxlcnMvRXZlbnRNYW5hZ2VyJztcclxuaW1wb3J0IHsgVUlNYW5hZ2VyIH0gZnJvbSAnLi91aS9VSU1hbmFnZXInO1xyXG5pbXBvcnQgeyBzaG93U3VjY2Vzc1RvYXN0LCBzaG93RXJyb3JUb2FzdCB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuLyoqXHJcbiAqIE1haW4gQXBwbGljYXRpb24gQ2xhc3MgLSBQaGFzZSA4IENvbXBsZXRlIEludGVncmF0aW9uXHJcbiAqXHJcbiAqIFRoaXMgY2xhc3MgcHJvdmlkZXMgY29tcGxldGUgZGVwZW5kZW5jeSBpbmplY3Rpb24gYW5kIG1vZHVsZSBjb29yZGluYXRpb25cclxuICogZm9yIHRoZSBUeXBlU2NyaXB0IHZlcnNpb24gb2YgRWFzeSBMYWJlbGluZy5cclxuICovXHJcbmNsYXNzIEFwcCB7XHJcbiAgcHJpdmF0ZSBhcHBTdGF0ZSA9IGNyZWF0ZUFwcFN0YXRlKCk7XHJcbiAgcHJpdmF0ZSBmaWxlU3lzdGVtU2VydmljZTogRmlsZVN5c3RlbVNlcnZpY2UgPSBjcmVhdGVGaWxlU3lzdGVtU2VydmljZSgpO1xyXG4gIHByaXZhdGUgdWlNYW5hZ2VyITogVUlNYW5hZ2VyO1xyXG4gIHByaXZhdGUgY2FudmFzQ29udHJvbGxlciE6IENhbnZhc0NvbnRyb2xsZXI7XHJcbiAgcHJpdmF0ZSBldmVudE1hbmFnZXIhOiBFdmVudE1hbmFnZXI7XHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZSBhbGwgYXBwbGljYXRpb24gY29tcG9uZW50cyB3aXRoIGRlcGVuZGVuY3kgaW5qZWN0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gSW5pdGlhbGl6aW5nIGRlcGVuZGVuY3kgaW5qZWN0aW9uIHN5c3RlbVxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgQ2FudmFzIENvbnRyb2xsZXIgZmlyc3RcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyID0gbmV3IENhbnZhc0NvbnRyb2xsZXIoXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZVxyXG4gICAgICApO1xyXG4gICAgICAvLyBDYW52YXNDb250cm9sbGVyIGluaXRpYWxpemVkXG5cclxuICAgICAgLy8gSW5pdGlhbGl6ZSBVSSBNYW5hZ2VyIChuZWVkcyBDYW52YXNDb250cm9sbGVyKVxuICAgICAgdGhpcy51aU1hbmFnZXIgPSBuZXcgVUlNYW5hZ2VyKFxuICAgICAgICB0aGlzLmFwcFN0YXRlLFxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIsXG4gICAgICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgYXMgYW55IC8vIFR5cGUgY29tcGF0aWJpbGl0eSB3aWxsIGJlIGZpeGVkIGluIGZ1dHVyZSB1cGRhdGVzXG4gICAgICApO1xuICAgICAgLy8gVUlNYW5hZ2VyIGluaXRpYWxpemVkXG5cbiAgICAgIC8vIEluaXRpYWxpemUgRmFicmljIGNhbnZhcyBpbiB0aGUgZXhpc3RpbmcgY29udGFpbmVyIGZyb20gcHVibGljL2luZGV4Lmh0bWxcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5pbml0aWFsaXplQ2FudmFzKCdjYW52YXMtY29udGFpbmVyJyk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIENhbnZhcyBpbml0aWFsaXplZCBpbiAjY2FudmFzLWNvbnRhaW5lcicpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIEV2ZW50IE1hbmFnZXIgKG5lZWRzIGFsbCBvdGhlciBjb21wb25lbnRzKVxuICAgICAgdGhpcy5ldmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKFxuICAgICAgICB0aGlzLmFwcFN0YXRlLFxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIsXG4gICAgICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2VcbiAgICAgICk7XG4gICAgICAvLyBFdmVudE1hbmFnZXIgaW5pdGlhbGl6ZWRcblxyXG4gICAgICAvLyBTZXR1cCBjcm9zcy1jb21wb25lbnQgcmVmZXJlbmNlc1xyXG4gICAgICB0aGlzLnNldHVwQ3Jvc3NSZWZlcmVuY2VzKCk7XG5cclxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGZvciBhcHBsaWNhdGlvbiBsaWZlY3ljbGVcclxuICAgICAgdGhpcy5zZXR1cEFwcGxpY2F0aW9uRXZlbnRzKCk7XG5cclxuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgIC8vIFBoYXNlIDggYXBwbGljYXRpb24gaW50ZWdyYXRpb24gY29tcGxldGVkXG4gICAgICAvLyAoc3VwcHJlc3Mgc3VjY2VzcyB0b2FzdCBhbmQgaW50ZWdyYXRpb24gdGVzdHMgbG9ncyBvbiBmaXJzdCBsb2FkKVxuXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgQXBwbGljYXRpb24gaW5pdGlhbGl6YXRpb24gZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgc2hvd0Vycm9yVG9hc3QoJ+KdjCBBcHBsaWNhdGlvbiBpbml0aWFsaXphdGlvbiBmYWlsZWQnKTtcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR1cCBjcm9zcy1jb21wb25lbnQgcmVmZXJlbmNlcyBmb3IgY2lyY3VsYXIgZGVwZW5kZW5jaWVzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXR1cENyb3NzUmVmZXJlbmNlcygpOiB2b2lkIHtcclxuICAgIC8vIFNldHVwIGNyb3NzLWNvbXBvbmVudCByZWZlcmVuY2VzXHJcbiAgICAvLyBVSU1hbmFnZXIgc2hvdWxkIGhhdmUgYWNjZXNzIHRvIGNhbnZhcyB0aHJvdWdoIGFwcFN0YXRlXHJcbiAgICAvLyBDcm9zcy1yZWZlcmVuY2VzIGhhbmRsZWQgdGhyb3VnaCBkZXBlbmRlbmN5IGluamVjdGlvblxyXG5cclxuICAgIGNvbnNvbGUubG9nKCfwn5SXIENyb3NzLXJlZmVyZW5jZXMgZXN0YWJsaXNoZWQgYmV0d2VlbiBjb21wb25lbnRzJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR1cCBhcHBsaWNhdGlvbi1sZXZlbCBldmVudCBsaXN0ZW5lcnNcclxuICAgKi9cclxuICBwcml2YXRlIHNldHVwQXBwbGljYXRpb25FdmVudHMoKTogdm9pZCB7XG4gICAgLy8gTGlzdGVuIHRvIGFwcGxpY2F0aW9uIHN0YXRlIGNoYW5nZXNcbiAgICB0aGlzLmFwcFN0YXRlLmFkZEV2ZW50TGlzdGVuZXIoJ21vZGU6Y2hhbmdlZCcsIChldmVudCkgPT4ge1xuICAgICAgLy8gU3VwcHJlc3MgY29uc29sZSBub2lzZVxuICAgIH0pO1xuXG4gICAgdGhpcy5hcHBTdGF0ZS5hZGRFdmVudExpc3RlbmVyKCdpbWFnZTpzZWxlY3RlZCcsIChldmVudCkgPT4ge1xuICAgICAgLy8gU3VwcHJlc3MgY29uc29sZSBub2lzZVxuICAgIH0pO1xuXG4gICAgdGhpcy5hcHBTdGF0ZS5hZGRFdmVudExpc3RlbmVyKCdsYWJlbHM6c2F2ZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgIC8vIFN1cHByZXNzIGNvbnNvbGUgbm9pc2VcbiAgICB9KTtcblxyXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgZXJyb3JzXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZXZlbnQpID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcign8J+aqCBBcHBsaWNhdGlvbiBlcnJvcjonLCBldmVudC5lcnJvcik7XHJcbiAgICAgIHNob3dFcnJvclRvYXN0KCdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgdW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uc1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn5qoIFVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbjonLCBldmVudC5yZWFzb24pO1xyXG4gICAgICBzaG93RXJyb3JUb2FzdCgnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtIGNvbXByZWhlbnNpdmUgZnVuY3Rpb25hbGl0eSB0ZXN0aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwZXJmb3JtRnVuY3Rpb25hbGl0eVRlc3RzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc29sZS5sb2coJ1xcbvCfp6ogUGVyZm9ybWluZyBQaGFzZSA4IEludGVncmF0aW9uIFRlc3RzOicpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFRlc3QgMTogQ29tcG9uZW50IGluaXRpYWxpemF0aW9uXHJcbiAgICAgIGNvbnN0IGNvbXBvbmVudHNUZXN0ID0gdGhpcy50ZXN0Q29tcG9uZW50SW5pdGlhbGl6YXRpb24oKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBDb21wb25lbnQgaW5pdGlhbGl6YXRpb24gdGVzdDonLCBjb21wb25lbnRzVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCAyOiBFdmVudCBzeXN0ZW0gaW50ZWdyYXRpb25cclxuICAgICAgY29uc3QgZXZlbnRzVGVzdCA9IHRoaXMudGVzdEV2ZW50U3lzdGVtSW50ZWdyYXRpb24oKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBFdmVudCBzeXN0ZW0gaW50ZWdyYXRpb24gdGVzdDonLCBldmVudHNUZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICAvLyBUZXN0IDM6IFVJIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgY29uc3QgdWlUZXN0ID0gYXdhaXQgdGhpcy50ZXN0VUlGdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgVUkgZnVuY3Rpb25hbGl0eSB0ZXN0OicsIHVpVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCA0OiBDYW52YXMgZnVuY3Rpb25hbGl0eVxyXG4gICAgICBjb25zdCBjYW52YXNUZXN0ID0gdGhpcy50ZXN0Q2FudmFzRnVuY3Rpb25hbGl0eSgpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIENhbnZhcyBmdW5jdGlvbmFsaXR5IHRlc3Q6JywgY2FudmFzVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCA1OiBGaWxlIHN5c3RlbSBpbnRlZ3JhdGlvblxyXG4gICAgICBjb25zdCBmaWxlU3lzdGVtVGVzdCA9IHRoaXMudGVzdEZpbGVTeXN0ZW1JbnRlZ3JhdGlvbigpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIEZpbGUgc3lzdGVtIGludGVncmF0aW9uIHRlc3Q6JywgZmlsZVN5c3RlbVRlc3QgPyAnUEFTU0VEJyA6ICdGQUlMRUQnKTtcclxuXHJcbiAgICAgIC8vIFRlc3QgNjogS2V5Ym9hcmQgc2hvcnRjdXRzXHJcbiAgICAgIGNvbnN0IGtleWJvYXJkVGVzdCA9IHRoaXMudGVzdEtleWJvYXJkU2hvcnRjdXRzKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgS2V5Ym9hcmQgc2hvcnRjdXRzIHRlc3Q6Jywga2V5Ym9hcmRUZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygn8J+OryBBbGwgUGhhc2UgOCBpbnRlZ3JhdGlvbiB0ZXN0cyBjb21wbGV0ZWQhJyk7XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign4p2MIEludGVncmF0aW9uIHRlc3RzIGZhaWxlZDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IGNvbXBvbmVudCBpbml0aWFsaXphdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgdGVzdENvbXBvbmVudEluaXRpYWxpemF0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhKFxyXG4gICAgICB0aGlzLmFwcFN0YXRlICYmXHJcbiAgICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgJiZcclxuICAgICAgdGhpcy51aU1hbmFnZXIgJiZcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyICYmXHJcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyICYmXHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWRcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IGV2ZW50IHN5c3RlbSBpbnRlZ3JhdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgdGVzdEV2ZW50U3lzdGVtSW50ZWdyYXRpb24oKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRlc3Qgc3RhdGUgZXZlbnQgd2l0aG91dCBhbHRlcmluZyBmaW5hbCBtb2RlXG4gICAgICBjb25zdCBwcmV2TW9kZSA9IHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUgYXMgJ2RyYXcnIHwgJ2VkaXQnO1xuICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKCdlZGl0Jyk7XG4gICAgICB0aGlzLmFwcFN0YXRlLnNldE1vZGUoJ2RyYXcnKTtcbiAgICAgIC8vIHJlc3RvcmUgcHJldmlvdXMgbW9kZVxuICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKHByZXZNb2RlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFdmVudCBzeXN0ZW0gdGVzdCBlcnJvcjonLCBlcnJvcik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cclxuICAvKipcclxuICAgKiBUZXN0IFVJIGZ1bmN0aW9uYWxpdHlcclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHRlc3RVSUZ1bmN0aW9uYWxpdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUZXN0IFVJIHVwZGF0ZSBtZXRob2RzXHJcbiAgICAgIHRoaXMudWlNYW5hZ2VyLnVwZGF0ZUxhYmVsTGlzdCgpO1xyXG4gICAgICAvLyBBZGQgb3RoZXIgVUkgdXBkYXRlIHRlc3RzIGFzIG1ldGhvZHMgYmVjb21lIGF2YWlsYWJsZVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1VJIGZ1bmN0aW9uYWxpdHkgdGVzdCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgY2FudmFzIGZ1bmN0aW9uYWxpdHlcclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RDYW52YXNGdW5jdGlvbmFsaXR5KCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gVGVzdCBjYW52YXMgbWV0aG9kc1xyXG4gICAgICBjb25zdCBjYW52YXMgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzO1xyXG4gICAgICBpZiAoIWNhbnZhcykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgLy8gVGVzdCB6b29tIGZ1bmN0aW9uc1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbUluKCk7XHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tT3V0KCk7XHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5yZXNldFpvb20oKTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignQ2FudmFzIGZ1bmN0aW9uYWxpdHkgdGVzdCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgZmlsZSBzeXN0ZW0gaW50ZWdyYXRpb25cclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RGaWxlU3lzdGVtSW50ZWdyYXRpb24oKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUZXN0IHNlcnZpY2UgbWV0aG9kcyBleGlzdFxyXG4gICAgICBjb25zdCBtZXRob2RzID0gW1xyXG4gICAgICAgICdzZWxlY3RJbWFnZUZvbGRlcicsXHJcbiAgICAgICAgJ3NlbGVjdExhYmVsRm9sZGVyJyxcclxuICAgICAgICAnbG9hZExhYmVscycsXHJcbiAgICAgICAgJ3NhdmVMYWJlbHMnLFxyXG4gICAgICAgICdwYXJzZVlvbG9TdHJpbmcnXHJcbiAgICAgIF07XHJcblxyXG4gICAgICByZXR1cm4gbWV0aG9kcy5ldmVyeShtZXRob2QgPT5cclxuICAgICAgICB0eXBlb2YgKHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgYXMgYW55KVttZXRob2RdID09PSAnZnVuY3Rpb24nXHJcbiAgICAgICk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGaWxlIHN5c3RlbSBpbnRlZ3JhdGlvbiB0ZXN0IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBrZXlib2FyZCBzaG9ydGN1dHNcclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RLZXlib2FyZFNob3J0Y3V0cygpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFRlc3QgdGhhdCBldmVudCBtYW5hZ2VyIGV4aXN0cyBhbmQgaGFzIHJlcXVpcmVkIG1ldGhvZHNcclxuICAgICAgcmV0dXJuICEhdGhpcy5ldmVudE1hbmFnZXIgJiYgdHlwZW9mIHRoaXMuZXZlbnRNYW5hZ2VyLmRlc3Ryb3kgPT09ICdmdW5jdGlvbic7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdLZXlib2FyZCBzaG9ydGN1dHMgdGVzdCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhcHBsaWNhdGlvbiBzdGF0ZSBmb3IgZGVidWdnaW5nXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFwcGxpY2F0aW9uU3RhdGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpbml0aWFsaXplZDogdGhpcy5pbml0aWFsaXplZCxcclxuICAgICAgYXBwU3RhdGU6IHRoaXMuYXBwU3RhdGUuZ2V0RGVidWdJbmZvKCksXHJcbiAgICAgIGNhbnZhczoge1xyXG4gICAgICAgIGhhc0NhbnZhczogISF0aGlzLmNhbnZhc0NvbnRyb2xsZXI/LmNhbnZhcyxcclxuICAgICAgICBtb2RlOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlXHJcbiAgICAgIH0sXHJcbiAgICAgIHVpOiB7XHJcbiAgICAgICAgaGFzVUlNYW5hZ2VyOiAhIXRoaXMudWlNYW5hZ2VyXHJcbiAgICAgIH0sXHJcbiAgICAgIGV2ZW50czoge1xyXG4gICAgICAgIGhhc0V2ZW50TWFuYWdlcjogISF0aGlzLmV2ZW50TWFuYWdlclxyXG4gICAgICB9LFxyXG4gICAgICBmaWxlU3lzdGVtOiB7XHJcbiAgICAgICAgaGFzRmlsZVN5c3RlbVNlcnZpY2U6ICEhdGhpcy5maWxlU3lzdGVtU2VydmljZVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYW51cCBhcHBsaWNhdGlvbiByZXNvdXJjZXNcclxuICAgKi9cclxuICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyPy5kZXN0cm95Py4oKTtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyPy5kZXN0cm95Q2FudmFzPy4oKTtcclxuICAgICAgLy8gdGhpcy51aU1hbmFnZXIgY2xlYW51cCBpZiBuZWVkZWRcclxuICAgICAgY29uc29sZS5sb2coJ/Cfp7kgQXBwbGljYXRpb24gcmVzb3VyY2VzIGNsZWFuZWQgdXAnKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvciBkdXJpbmcgY2xlYW51cDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBJbml0aWFsaXplIGFwcGxpY2F0aW9uIHdoZW4gRE9NIGlzIHJlYWR5XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG5cclxuICB0cnkge1xyXG4gICAgLy8gQ3JlYXRlIGFuZCBzdGFydCB0aGUgYXBwbGljYXRpb25cclxuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcclxuXHJcbiAgICAvLyBNYWtlIGFwcCBhdmFpbGFibGUgZ2xvYmFsbHkgZm9yIGRlYnVnZ2luZ1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLmVhc3lMYWJlbGluZ0FwcCA9IGFwcDtcclxuXHJcbiAgICAvLyBSZW1vdmVkOiBQaGFzZSA4IGNvbXBsZXRpb24gaW5kaWNhdG9yIHRvYXN0XG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign4p2MIEZhaWxlZCB0byBpbml0aWFsaXplIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb246JywgZXJyb3IpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyBFeHBvcnQgbWFpbiBjb21wb25lbnRzIGZvciBleHRlcm5hbCB1c2VcclxuZXhwb3J0IHsgQXBwIH07XHJcbmV4cG9ydCB7IEFwcFN0YXRlLCBjcmVhdGVBcHBTdGF0ZSwgY3JlYXRlQXBwU3RhdGVXaXRoQ29uZmlnIH0gZnJvbSAnLi9tb2RlbHMnO1xyXG5leHBvcnQgeyBGaWxlU3lzdGVtU2VydmljZSwgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIFlvbG9QYXJzZXIgfSBmcm9tICcuL3NlcnZpY2VzJztcclxuZXhwb3J0IHsgQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvQ2FudmFzQ29udHJvbGxlcic7XHJcbmV4cG9ydCB7IEV2ZW50TWFuYWdlciB9IGZyb20gJy4vY29udHJvbGxlcnMvRXZlbnRNYW5hZ2VyJztcclxuZXhwb3J0IHsgVUlNYW5hZ2VyIH0gZnJvbSAnLi91aS9VSU1hbmFnZXInO1xyXG5leHBvcnQgeyBwYXJzZVlvbG8sIGV4cG9ydFlvbG8sIHZhbGlkYXRlWW9sb1N0cmluZyB9IGZyb20gJy4vdXRpbHMnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9