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
        this.pendingLabelIds = [];
        this.classSelectionButtons = [];
        this.currentContext = null;
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
        this.populateClassFileDropdown(this._state.classFiles);
        this.renderClassSelectionButtons(this._state.selectedClassFile?.content || []);
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
        // Assign IDs at runtime for elements without IDs in static HTML
        this.ensureDomIds();
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
        // Centralized ID aliases to map semantic kebab-case IDs to legacy DOM IDs
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
            'class-file-select': 'class-file-select',
            // Image list / filters
            'image-search-input': 'imageSearchInput',
            'show-labeled-checkbox': 'showLabeled',
            'show-unlabeled-checkbox': 'showUnlabeled',
            'image-list': 'image-list',
            'label-list': 'label-list',
            // Save/load
            'save-labels-btn': 'saveLabelsBtn',
            'auto-save-toggle': 'autoSaveToggle',
            // Canvas display options
            'show-labels-on-canvas-toggle': 'showLabelsOnCanvasToggle',
            'label-font-size-slider': 'label-font-size',
            'label-font-size-value': 'label-font-size-value',
            'crosshair-toggle': 'crosshairToggle',
            // Modes
            'draw-mode-btn': 'drawMode',
            'edit-mode-btn': 'editMode',
            // Label filters & selects
            'label-filters': 'label-filters',
            'select-by-class-dropdown': 'select-by-class-dropdown',
            'select-by-class-btn': 'select-by-class-btn',
            'sort-labels-asc-btn': 'sortLabelsAscBtn',
            'sort-labels-desc-btn': 'sortLabelsDescBtn',
            // Zoom controls
            'zoom-in-btn': 'zoomInBtn',
            'zoom-out-btn': 'zoomOutBtn',
            'reset-zoom-btn': 'resetZoomBtn',
            'zoom-input': 'zoom-input',
            // Coords
            'mouse-coords-display': 'info-display',
            'coord-x-input': 'coordX',
            'coord-y-input': 'coordY',
            'go-to-coords-btn': 'goToCoordsBtn',
            // Navigation
            'current-image-name': 'current-image-name',
            'prev-image-btn': 'prevImageBtn',
            'next-image-btn': 'nextImageBtn',
            // Panels & splitters
            'left-panel': 'left-panel',
            'right-panel': 'right-panel',
            'left-splitter': 'left-splitter',
            'right-splitter': 'right-splitter',
            'collapse-left-panel-btn': 'collapse-left-panel-btn',
            'expand-left-panel-btn': 'expand-left-panel-btn',
            'collapse-right-panel-btn': 'collapse-right-panel-btn',
            'expand-right-panel-btn': 'expand-right-panel-btn',
            // Preview bar
            'preview-bar': 'preview-bar',
            'preview-bar-header': 'preview-bar-header',
            'toggle-preview-btn': 'toggle-preview-btn',
            'preview-prev-btn': 'preview-prev-btn',
            'preview-next-btn': 'preview-next-btn',
            'preview-list-wrapper': 'preview-list-wrapper',
            'preview-list': 'preview-list',
            'bottom-panel': 'bottom-panel',
            'bottom-splitter': 'bottom-splitter',
            // Theme
            'dark-mode-toggle': 'darkModeToggle',
            // Label class modal
            'label-class-input': 'labelClassInput',
            'save-label-class-btn': 'saveLabelClassBtn',
            'class-selection-container': 'class-selection-container',
            // Context menu
            'context-menu': 'context-menu',
            'ctx-edit-label': 'ctx-edit-label',
            'ctx-delete-label': 'ctx-delete-label',
            // Canvas & overlays
            'canvas-container': 'canvas-container',
            'loading-overlay': 'loading-overlay',
            'toast-container': 'toast-container'
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
    // Assign semantic IDs at runtime for elements missing IDs in public HTML
    ensureDomIds() {
        const q = (sel, root = document) => root.querySelector(sel);
        const setId = (el, id) => { if (el && !el.id)
            el.id = id; };
        // Navbar prev/next around current image name
        const nav = q('.navbar .container-fluid');
        if (nav) {
            const centerGroup = nav.querySelector('.mx-auto');
            if (centerGroup) {
                const buttons = Array.from(centerGroup.querySelectorAll('button'));
                if (buttons.length >= 2) {
                    setId(buttons[0] ?? null, 'prevImageBtn');
                    setId(buttons[buttons.length - 1] ?? null, 'nextImageBtn');
                }
                const nameSpan = centerGroup.querySelector('span.navbar-text');
                setId(nameSpan, 'current-image-name');
            }
        }
        // Zoom buttons by icon
        const info = q('#info-display');
        if (info) {
            const zoomIn = q('button i.bi-zoom-in', info)?.closest('button');
            const zoomOut = q('button i.bi-zoom-out', info)?.closest('button');
            const resetZoom = q('button i.bi-aspect-ratio', info)?.closest('button');
            setId(zoomIn, 'zoomInBtn');
            setId(zoomOut, 'zoomOutBtn');
            setId(resetZoom, 'resetZoomBtn');
            // Coords container inputs/button
            const coords = q('#coords-input-container');
            if (coords) {
                const inputs = Array.from(coords.querySelectorAll('input'));
                setId(inputs[0] ?? null, 'coordX');
                setId(inputs[1] ?? null, 'coordY');
                const goBtn = coords.querySelector('button');
                setId(goBtn, 'goToCoordsBtn');
            }
            // Zoom percent input
            const zoomGroup = Array.from(info.querySelectorAll('.input-group input[type=\"number\"]'))[0];
            setId(zoomGroup ?? null, 'zoom-input');
        }
        // Left panel buttons by text
        const leftPanel = q('#left-panel');
        if (leftPanel) {
            const loadImg = Array.from(leftPanel.querySelectorAll('button')).find(b => b.textContent?.toLowerCase().includes('load image folder'));
            const loadLbl = Array.from(leftPanel.querySelectorAll('button')).find(b => b.textContent?.toLowerCase().includes('load label folder'));
            setId(loadImg || null, 'selectImageFolderBtn');
            setId(loadLbl || null, 'selectLabelFolderBtn');
            const saveBtn = Array.from(leftPanel.querySelectorAll('button')).find(b => b.textContent?.toLowerCase().includes('save labels'));
            const dlBtn = Array.from(leftPanel.querySelectorAll('button')).find(b => b.textContent?.toLowerCase().includes('download class'));
            setId(saveBtn || null, 'saveLabelsBtn');
            setId(dlBtn || null, 'downloadClassesBtn');
        }
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
        const selectedIds = new Set(this._canvasController.getSelectedBoundingBoxes().map(box => box.id));
        // Get current bounding boxes from canvas
        const boundingBoxes = this._canvasController.getAllBoundingBoxes();
        this.labelListItems = boundingBoxes.map(bbox => {
            const listItem = document.createElement('div');
            listItem.className = 'label-list-item';
            listItem.dataset.labelId = bbox.id;
            const className = this.getDisplayNameForClass(bbox.classId.toString());
            const isSelected = selectedIds.has(bbox.id);
            listItem.innerHTML = `
        <div class="label-item-content">
          <span class="label-class">${className}</span>
          <span class="label-coords">(${Math.round(bbox.x)}, ${Math.round(bbox.y)})</span>
        </div>
      `;
            listItem.addEventListener('click', () => {
                this.selectLabel(bbox.id);
            });
            if (isSelected) {
                listItem.classList.add('selected');
            }
            labelList.appendChild(listItem);
            return {
                id: bbox.id,
                classId: bbox.classId,
                className,
                boundingBox: bbox,
                isSelected,
                element: listItem
            };
        });
        this.dispatchUIEvent('label:list-rendered', { count: this.labelListItems.length });
    }
    selectLabel(labelId) {
        this._canvasController.selectBoundingBox(labelId);
        this.labelListItems.forEach(item => {
            const selected = item.id === labelId;
            item.isSelected = selected;
            item.element.classList.toggle('selected', selected);
        });
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
    // Class & Label Management
    // ===================================================================
    populateClassFileDropdown(classFiles) {
        const dropdown = this.elements.classFileSelect;
        dropdown.innerHTML = '<option value="">Choose...</option>';
        classFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file.name;
            option.textContent = file.name;
            if (file.isSelected) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    }
    renderClassSelectionButtons(classDefs) {
        const container = this.elements.classSelectionContainer;
        container.innerHTML = '';
        this.classSelectionButtons = [];
        if (!classDefs.length) {
            const helper = document.createElement('p');
            helper.className = 'text-muted small mb-0';
            helper.textContent = '클래스 파일을 불러오면 빠르게 선택할 수 있습니다.';
            container.appendChild(helper);
            return;
        }
        classDefs.forEach((def) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-outline-secondary btn-sm me-2 mb-2 class-select-btn';
            btn.textContent = `${def.id}: ${def.name}`;
            btn.addEventListener('click', () => this.applyClassToPendingLabels(def.id));
            container.appendChild(btn);
            this.classSelectionButtons.push(btn);
        });
    }
    async loadClassFileByName(fileName) {
        const classFile = this._state.classFiles.find(file => file.name === fileName);
        if (!classFile) {
            (0,notifications.showErrorToast)('선택한 클래스 파일을 찾을 수 없습니다.');
            return;
        }
        await this.loadClassFileContent(classFile);
    }
    async loadClassFileContent(classFile) {
        try {
            const result = await this._fileSystem.loadClassFile?.(classFile.handle);
            if (!result?.success || !result.data) {
                (0,notifications.showErrorToast)(result?.error || '클래스 파일을 불러오지 못했습니다.');
                return;
            }
            this._state.classNames.clear();
            result.data.classes.forEach((def) => this._state.addClassDefinition(def));
            this._state.selectClassFile(classFile);
            this._state.classFiles.forEach(file => {
                file.isSelected = file.name === classFile.name;
                if (file.name === classFile.name) {
                    file.content = result.data.classes;
                }
            });
            this.populateClassFileDropdown(this._state.classFiles);
            this.renderClassSelectionButtons(result.data.classes);
            this._canvasController.updateLabels();
            const boxes = this._canvasController.getAllBoundingBoxes();
            this.updateLabelFilters(boxes);
            this.updateSelectByClassDropdown(boxes);
            this.updateLabelList();
            (0,notifications.showSuccessToast)(`클래스 파일 로드 완료 (${result.data.classes.length}개)`);
        }
        catch (error) {
            console.error('Failed to load class file', error);
            (0,notifications.showErrorToast)('클래스 파일 로드에 실패했습니다.');
        }
    }
    resetClassDefinitions() {
        this._state.classNames.clear();
        this._state.selectClassFile(null);
        this.renderClassSelectionButtons([]);
        this._canvasController.updateLabels();
        const boxes = this._canvasController.getAllBoundingBoxes();
        this.updateLabelFilters(boxes);
        this.updateSelectByClassDropdown(boxes);
        this.updateLabelList();
        this.elements.classFileSelect.value = '';
    }
    promptForLabelClass(labelIds, defaultClassId) {
        if (!labelIds || labelIds.length === 0)
            return;
        this.pendingLabelIds = [...labelIds];
        let initialClass = defaultClassId;
        if (initialClass === undefined) {
            const firstId = labelIds[0];
            const bbox = this._canvasController.getAllBoundingBoxes().find(b => b.id === firstId);
            if (bbox) {
                initialClass = bbox.classId;
            }
        }
        if (initialClass !== undefined) {
            this.elements.labelClassInput.value = String(initialClass);
        }
        else {
            this.elements.labelClassInput.value = '';
        }
        this.elements.labelClassModal.show();
        try {
            this.elements.labelClassInput.focus();
        }
        catch { }
    }
    applyClassToPendingLabels(classId) {
        if (Number.isNaN(classId) || classId < 0) {
            (0,notifications.showErrorToast)('유효한 클래스 ID를 입력하세요.');
            return;
        }
        if (this.pendingLabelIds.length === 0) {
            return;
        }
        const color = (0,color_palette.getColorForClass)(classId);
        this.pendingLabelIds.forEach(id => {
            this._canvasController.updateBoundingBox(id, {
                classId,
                color
            });
        });
        this._canvasController.updateLabels();
        const boxes = this._canvasController.getAllBoundingBoxes();
        this.updateLabelFilters(boxes);
        this.updateSelectByClassDropdown(boxes);
        this.updateLabelList();
        this.pendingLabelIds = [];
        this.elements.labelClassInput.value = '';
        this.elements.labelClassModal.hide();
    }
    handleContextMenuEdit() {
        this.hideContextMenu();
        const selected = this._canvasController.getSelectedBoundingBoxes();
        const targetBoxes = selected.length > 0
            ? selected
            : (this.currentContext?.selectedObjects || [])
                .map((obj) => obj.boundingBox)
                .filter((bbox) => !!bbox);
        if (!targetBoxes.length) {
            (0,notifications.showErrorToast)('먼저 라벨을 선택하세요.');
            return;
        }
        const ids = targetBoxes.map(b => b.id);
        this.promptForLabelClass(ids, targetBoxes[0]?.classId);
    }
    handleContextMenuDelete() {
        this.hideContextMenu();
        const deleted = this._canvasController.deleteSelected();
        if (deleted.length === 0 && this.currentContext?.selectedObjects?.length) {
            this.currentContext.selectedObjects.forEach((obj) => {
                const bboxId = obj?.boundingBox?.id;
                if (bboxId) {
                    this._canvasController.removeBoundingBox(bboxId);
                }
            });
        }
    }
    clearPendingLabelAssignment() {
        this.pendingLabelIds = [];
        this.elements.labelClassInput.value = '';
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
    showContextMenuAt(position, context) {
        const contextMenu = this.elements.contextMenu;
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${position.x}px`;
        contextMenu.style.top = `${position.y}px`;
        this.currentContext = context;
        this.dispatchUIEvent('context-menu:show', { position, context });
    }
    hideContextMenu() {
        this.elements.contextMenu.style.display = 'none';
        this.currentContext = null;
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
        const labelClassModalEl = document.getElementById('labelClassModal');
        if (labelClassModalEl) {
            labelClassModalEl.addEventListener('hidden.bs.modal', () => {
                this.clearPendingLabelAssignment();
            });
        }
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
                    const listRes = await this._fileSystem.listClassFiles?.(result.data);
                    if (listRes?.success && Array.isArray(listRes.data)) {
                        this._state.classFiles = listRes.data;
                        this.populateClassFileDropdown(listRes.data);
                        if (listRes.data.length > 0) {
                            await this.loadClassFileByName(listRes.data[0].name);
                        }
                        else {
                            this.resetClassDefinitions();
                        }
                    }
                }
            }
            catch (e) {
                console.error('Failed to select class info folder', e);
            }
        });
        this.elements.classFileSelect.addEventListener('change', async () => {
            const value = this.elements.classFileSelect.value;
            if (!value) {
                this.resetClassDefinitions();
                return;
            }
            await this.loadClassFileByName(value);
        });
        this.elements.saveLabelClassBtn.addEventListener('click', () => {
            const classId = Number(this.elements.labelClassInput.value);
            if (!Number.isFinite(classId)) {
                (0,notifications.showErrorToast)('유효한 클래스 ID를 입력하세요.');
                return;
            }
            this.applyClassToPendingLabels(classId);
        });
        this.elements.labelClassInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.elements.saveLabelClassBtn.click();
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
        this.elements.ctxEditLabel.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleContextMenuEdit();
        });
        this.elements.ctxDeleteLabel.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleContextMenuDelete();
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
        const refreshLabelPanels = () => {
            try {
                this.uiManager.updateLabelList();
                const boxes = this.canvasController.getAllBoundingBoxes();
                this.uiManager.updateLabelFilters(boxes);
                this.uiManager.updateSelectByClassDropdown(boxes);
                if (this.appState.currentImageFile) {
                    this.appState.setImageLabelStatus(this.appState.currentImageFile.name, boxes.length > 0);
                }
            }
            catch (error) {
                console.error('Failed to refresh label panels', error);
            }
        };
        const refreshLabelSelection = () => {
            try {
                this.uiManager.updateLabelList();
            }
            catch (error) {
                console.error('Failed to sync label selection', error);
            }
        };
        this.canvasController.addEventListener('object:added', (event) => {
            refreshLabelPanels();
            const bbox = event.data?.boundingBox;
            if (bbox && this.appState.currentMode === 'draw') {
                this.uiManager.promptForLabelClass([bbox.id], bbox.classId);
            }
        });
        this.canvasController.addEventListener('object:removed', refreshLabelPanels);
        this.canvasController.addEventListener('object:modified', refreshLabelPanels);
        this.canvasController.addEventListener('selection:created', refreshLabelSelection);
        this.canvasController.addEventListener('selection:updated', refreshLabelSelection);
        this.canvasController.addEventListener('selection:cleared', refreshLabelSelection);
        this.canvasController.addEventListener('after:render', () => {
            try {
                this.uiManager.updateZoomDisplay();
            }
            catch (error) {
                console.error('Failed to update zoom display', error);
            }
        });
        this.eventManager.addEventListener('mouse:coordinates-updated', (evt) => {
            const coords = evt.data?.canvas;
            if (coords) {
                try {
                    this.uiManager.updateMouseCoords(coords.x, coords.y);
                }
                catch (error) {
                    console.error('Failed to update mouse coordinates display', error);
                }
            }
        });
        this.eventManager.addEventListener('labels:saved', () => {
            try {
                (0,notifications.showSuccessToast)('Labels saved');
            }
            catch (error) {
                console.error('Failed to show save toast', error);
            }
        });
        this.eventManager.addEventListener('context-menu:show', (event) => {
            const context = event.data?.context;
            const position = context?.position || event.data?.position;
            if (context && position) {
                try {
                    this.appState.setContextTarget(context);
                }
                catch (error) {
                    console.error('Failed to update context target', error);
                }
                try {
                    this.uiManager.showContextMenuAt(position, context);
                }
                catch (error) {
                    console.error('Failed to show context menu', error);
                }
            }
        });
        this.eventManager.addEventListener('context-menu:hide', () => {
            try {
                this.uiManager.hideContextMenu();
                this.appState.setContextTarget(null);
            }
            catch (error) {
                console.error('Failed to hide context menu', error);
            }
        });
        console.log('🔗 Cross-references established between components');
    }
    /**
     * Setup application-level event listeners
     */
    setupApplicationEvents() {
        this.appState.addEventListener('mode:changed', (event) => {
            const currentMode = event.data?.current;
            if (currentMode) {
                try {
                    this.uiManager.updateModeButtons(currentMode);
                }
                catch (error) {
                    console.error('Failed to update mode buttons', error);
                }
            }
        });
        this.appState.addEventListener('image:current-changed', (event) => {
            const currentImageName = event.data?.current || '';
            try {
                this.uiManager.renderImageList();
                this.uiManager.updateCurrentImageDisplay(currentImageName);
                this.uiManager.updateLabelList();
                const boxes = this.canvasController.getAllBoundingBoxes();
                this.uiManager.updateLabelFilters(boxes);
                this.uiManager.updateSelectByClassDropdown(boxes);
            }
            catch (error) {
                console.error('Failed to handle image change event', error);
            }
        });
        this.appState.addEventListener('image:label-status-changed', () => {
            try {
                this.uiManager.renderImageList();
            }
            catch (error) {
                console.error('Failed to refresh image list after label status change', error);
            }
        });
        // Listen to application state changes
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RXRDLDhDQUE4QztJQUVoRCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsbURBQW1ELEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUUsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUgsMENBQTBDO0FBQzNCO0FBQytEO0FBQ007QUFDbEI7QUFDUjtBQUNmO0FBQ3lCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91dGlscy9jb2xvci1wYWxldHRlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdXRpbHMvdmFsaWRhdGlvbi50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL25vdGlmaWNhdGlvbnMudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbW9kZWxzL0FwcFN0YXRlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdHlwZXMvZmlsZXN5c3RlbS50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL3lvbG8tcGFyc2VyLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvc2VydmljZXMvRmlsZVN5c3RlbVNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9zZXJ2aWNlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL2V4dGVybmFsIHZhciBcImZhYnJpY1wiIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvY29udHJvbGxlcnMvQ2FudmFzQ29udHJvbGxlci50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL2NvbnRyb2xsZXJzL0V2ZW50TWFuYWdlci50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL2luZGV4LnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdWkvVUlNYW5hZ2VyLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29sb3IgUGFsZXR0ZSBVdGlsaXR5IE1vZHVsZVxyXG4gKiBcclxuICogTWFuYWdlcyBjb2xvciBhc3NpZ25tZW50cyBmb3Igb2JqZWN0IGRldGVjdGlvbiBsYWJlbHMgYW5kIFVJIGVsZW1lbnRzLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBQcmVkZWZpbmVkIGNvbG9yIHBhbGV0dGUgZm9yIGxhYmVsIGNsYXNzZXNcclxuICogVXNlcyBhIG1peCBvZiBkaXN0aW5jdCBjb2xvcnMgb3B0aW1pemVkIGZvciB2aXNpYmlsaXR5IGFuZCBhY2Nlc3NpYmlsaXR5XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY29sb3JQYWxldHRlOiBzdHJpbmdbXSA9IFtcclxuICAgICcjZTYxOTRiJywgJyMzY2I0NGInLCAnI2ZmZTExOScsICcjNDM2M2Q4JywgJyNmNTgyMzEnLCBcclxuICAgICcjOTExZWI0JywgJyM0NmYwZjAnLCAnI2YwMzJlNicsICcjYmNmNjBjJywgJyNmYWJlYmUnLFxyXG4gICAgJyMwMDgwODAnLCAnI2U2YmVmZicsICcjOWE2MzI0JywgJyNmZmZhYzgnLCAnIzgwMDAwMCcsXHJcbiAgICAnI2FhZmZjMycsICcjODA4MDAwJywgJyNmZmQ4YjEnLCAnIzAwMDA3NScsICcjODA4MDgwJyxcclxuICAgICcjZmZmZmZmJywgJyMwMDAwMDAnLCAnIzFmNzdiNCcsICcjZmY3ZjBlJywgJyMyY2EwMmMnLFxyXG4gICAgJyNkNjI3MjgnLCAnIzk0NjdiZCcsICcjOGM1NjRiJywgJyNlMzc3YzInLCAnIzdmN2Y3ZidcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IGZhbGxiYWNrIGNvbG9yIGZvciBpbnZhbGlkIG9yIHVuYXNzaWduZWQgY2xhc3Nlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09MT1IgPSAnIzAwMDAwMCc7XHJcblxyXG4vKipcclxuICogR2V0cyBhIGNvbG9yIGZvciBhIHNwZWNpZmljIGxhYmVsIGNsYXNzXHJcbiAqIEBwYXJhbSBsYWJlbENsYXNzIC0gVGhlIGxhYmVsIGNsYXNzIGlkZW50aWZpZXIgKHN0cmluZyBvciBudW1iZXIpXHJcbiAqIEByZXR1cm5zIENvbG9yIGhleCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3M6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBjb25zdCBjbGFzc051bWJlciA9IHR5cGVvZiBsYWJlbENsYXNzID09PSAnc3RyaW5nJyBcclxuICAgICAgICA/IHBhcnNlSW50KGxhYmVsQ2xhc3MsIDEwKSBcclxuICAgICAgICA6IGxhYmVsQ2xhc3M7XHJcblxyXG4gICAgaWYgKGlzTmFOKGNsYXNzTnVtYmVyKSB8fCBjbGFzc051bWJlciA8IDApIHtcclxuICAgICAgICByZXR1cm4gREVGQVVMVF9DT0xPUjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb2xvckluZGV4ID0gY2xhc3NOdW1iZXIgJSBjb2xvclBhbGV0dGUubGVuZ3RoO1xyXG4gICAgcmV0dXJuIGNvbG9yUGFsZXR0ZVtjb2xvckluZGV4XSB8fCBERUZBVUxUX0NPTE9SO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBtdWx0aXBsZSBjb2xvcnMgZm9yIGEgbGlzdCBvZiBsYWJlbCBjbGFzc2VzXHJcbiAqIEBwYXJhbSBsYWJlbENsYXNzZXMgLSBBcnJheSBvZiBsYWJlbCBjbGFzcyBpZGVudGlmaWVyc1xyXG4gKiBAcmV0dXJucyBBcnJheSBvZiBjb2xvciBoZXggc3RyaW5nc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yc0ZvckNsYXNzZXMobGFiZWxDbGFzc2VzOiAoc3RyaW5nIHwgbnVtYmVyKVtdKTogc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIGxhYmVsQ2xhc3Nlcy5tYXAobGFiZWxDbGFzcyA9PiBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3MpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBpZiBhIGNvbG9yIGlzIGluIHRoZSBwYWxldHRlXHJcbiAqIEBwYXJhbSBjb2xvciAtIENvbG9yIGhleCBzdHJpbmcgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiBjb2xvciBleGlzdHMgaW4gcGFsZXR0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29sb3JJblBhbGV0dGUoY29sb3I6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGNvbG9yUGFsZXR0ZS5pbmNsdWRlcyhjb2xvci50b0xvd2VyQ2FzZSgpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGluZGV4IG9mIGEgY29sb3IgaW4gdGhlIHBhbGV0dGVcclxuICogQHBhcmFtIGNvbG9yIC0gQ29sb3IgaGV4IHN0cmluZ1xyXG4gKiBAcmV0dXJucyBJbmRleCBvZiB0aGUgY29sb3IsIG9yIC0xIGlmIG5vdCBmb3VuZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9ySW5kZXgoY29sb3I6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gY29sb3JQYWxldHRlLmZpbmRJbmRleChjID0+IGMudG9Mb3dlckNhc2UoKSA9PT0gY29sb3IudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIGEgY29udHJhc3RpbmcgdGV4dCBjb2xvciAoYmxhY2sgb3Igd2hpdGUpIGZvciBhIGdpdmVuIGJhY2tncm91bmQgY29sb3JcclxuICogQHBhcmFtIGJhY2tncm91bmRDb2xvciAtIEJhY2tncm91bmQgY29sb3IgaGV4IHN0cmluZ1xyXG4gKiBAcmV0dXJucyAnIzAwMDAwMCcgZm9yIGxpZ2h0IGJhY2tncm91bmRzLCAnI2ZmZmZmZicgZm9yIGRhcmsgYmFja2dyb3VuZHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cmFzdGluZ1RleHRDb2xvcihiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAvLyBSZW1vdmUgIyBpZiBwcmVzZW50XHJcbiAgICBjb25zdCBoZXggPSBiYWNrZ3JvdW5kQ29sb3IucmVwbGFjZSgnIycsICcnKTtcclxuICAgIFxyXG4gICAgLy8gQ29udmVydCB0byBSR0JcclxuICAgIGNvbnN0IHIgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDAsIDIpLCAxNik7XHJcbiAgICBjb25zdCBnID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZygyLCA0KSwgMTYpO1xyXG4gICAgY29uc3QgYiA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoNCwgNiksIDE2KTtcclxuICAgIFxyXG4gICAgLy8gQ2FsY3VsYXRlIHJlbGF0aXZlIGx1bWluYW5jZVxyXG4gICAgY29uc3QgbHVtaW5hbmNlID0gKDAuMjk5ICogciArIDAuNTg3ICogZyArIDAuMTE0ICogYikgLyAyNTU7XHJcbiAgICBcclxuICAgIC8vIFJldHVybiBibGFjayBmb3IgbGlnaHQgYmFja2dyb3VuZHMsIHdoaXRlIGZvciBkYXJrIGJhY2tncm91bmRzXHJcbiAgICByZXR1cm4gbHVtaW5hbmNlID4gMC41ID8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydHMgaGV4IGNvbG9yIHRvIFJHQkFcclxuICogQHBhcmFtIGhleCAtIEhleCBjb2xvciBzdHJpbmdcclxuICogQHBhcmFtIGFscGhhIC0gQWxwaGEgdmFsdWUgKDAtMSlcclxuICogQHJldHVybnMgUkdCQSBjb2xvciBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBoZXhUb1JnYmEoaGV4OiBzdHJpbmcsIGFscGhhOiBudW1iZXIgPSAxKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGNsZWFuSGV4ID0gaGV4LnJlcGxhY2UoJyMnLCAnJyk7XHJcbiAgICBjb25zdCByID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDAsIDIpLCAxNik7XHJcbiAgICBjb25zdCBnID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDIsIDQpLCAxNik7XHJcbiAgICBjb25zdCBiID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDQsIDYpLCAxNik7XHJcbiAgICBcclxuICAgIHJldHVybiBgcmdiYSgke3J9LCAke2d9LCAke2J9LCAke2FscGhhfSlgO1xyXG59XHJcblxyXG4vKipcclxuICogQ29sb3IgY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JDb25maWcge1xyXG4gICAgcGFsZXR0ZTogc3RyaW5nW107XHJcbiAgICBkZWZhdWx0Q29sb3I6IHN0cmluZztcclxuICAgIHVzZUhpZ2hDb250cmFzdDogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkdmFuY2VkIGNvbG9yIG1hbmFnZW1lbnQgY2xhc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb2xvck1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBwYWxldHRlOiBzdHJpbmdbXTtcclxuICAgIHByaXZhdGUgZGVmYXVsdENvbG9yOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHVzZUhpZ2hDb250cmFzdDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFBhcnRpYWw8Q29sb3JDb25maWc+ID0ge30pIHtcclxuICAgICAgICB0aGlzLnBhbGV0dGUgPSBjb25maWcucGFsZXR0ZSB8fCBjb2xvclBhbGV0dGU7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29sb3IgPSBjb25maWcuZGVmYXVsdENvbG9yIHx8IERFRkFVTFRfQ09MT1I7XHJcbiAgICAgICAgdGhpcy51c2VIaWdoQ29udHJhc3QgPSBjb25maWcudXNlSGlnaENvbnRyYXN0IHx8IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBjb2xvciBmb3IgY2xhc3Mgd2l0aCBhZHZhbmNlZCBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGdldENvbG9yKGxhYmVsQ2xhc3M6IHN0cmluZyB8IG51bWJlciwgb3B0aW9ucz86IHsgaGlnaENvbnRyYXN0PzogYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBiYXNlQ29sb3IgPSBnZXRDb2xvckZvckNsYXNzKGxhYmVsQ2xhc3MpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChvcHRpb25zPy5oaWdoQ29udHJhc3QgfHwgdGhpcy51c2VIaWdoQ29udHJhc3QpIHtcclxuICAgICAgICAgICAgLy8gUmV0dXJuIGhpZ2ggY29udHJhc3QgdmVyc2lvbiBvZiBjb2xvclxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRIaWdoQ29udHJhc3RDb2xvcihiYXNlQ29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gYmFzZUNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBhIGhpZ2ggY29udHJhc3QgdmVyc2lvbiBvZiBhIGNvbG9yXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0SGlnaENvbnRyYXN0Q29sb3IoY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8gU2ltcGxlIGhpZ2ggY29udHJhc3QgaW1wbGVtZW50YXRpb25cclxuICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHlvdSBtaWdodCB1c2UgY29sb3IgdGhlb3J5IGFsZ29yaXRobXNcclxuICAgICAgICBjb25zdCBsdW1pbmFuY2UgPSB0aGlzLmdldENvbG9yTHVtaW5hbmNlKGNvbG9yKTtcclxuICAgICAgICByZXR1cm4gbHVtaW5hbmNlID4gMC41ID8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBjb2xvciBsdW1pbmFuY2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRDb2xvckx1bWluYW5jZShoZXg6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5IZXggPSBoZXgucmVwbGFjZSgnIycsICcnKTtcclxuICAgICAgICBjb25zdCByID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDAsIDIpLCAxNikgLyAyNTU7XHJcbiAgICAgICAgY29uc3QgZyA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZygyLCA0KSwgMTYpIC8gMjU1O1xyXG4gICAgICAgIGNvbnN0IGIgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoNCwgNiksIDE2KSAvIDI1NTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gMC4yOTkgKiByICsgMC41ODcgKiBnICsgMC4xMTQgKiBiO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIFZhbGlkYXRpb24gVXRpbGl0eSBNb2R1bGVcclxuICogXHJcbiAqIFByb3ZpZGVzIGlucHV0IHZhbGlkYXRpb24gZnVuY3Rpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICovXHJcblxyXG5pbXBvcnQgeyBzaG93VG9hc3QsIHNob3dFcnJvclRvYXN0IH0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0aW9uIHJlc3VsdCBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBpc1ZhbGlkOiBib29sZWFuO1xyXG4gICAgdmFsdWU/OiBzdHJpbmcgfCBudW1iZXI7XHJcbiAgICBlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgbGFiZWwgY2xhc3MgaW5wdXQgZnJvbSB1c2VyXHJcbiAqIEBwYXJhbSBpbnB1dCAtIFJhdyBpbnB1dCBmcm9tIHVzZXIgKGNhbiBiZSBudWxsIGlmIGNhbmNlbGxlZClcclxuICogQHJldHVybnMgVmFsaWRhdGVkIGNsYXNzIHN0cmluZyBvciBudWxsIGlmIGludmFsaWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUxhYmVsQ2xhc3MoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGlmIChpbnB1dCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsOyAvLyBVc2VyIGNhbmNlbGxlZCBwcm9tcHRcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmltbWVkSW5wdXQgPSBpbnB1dC50cmltKCk7XHJcbiAgICBcclxuICAgIGlmICh0cmltbWVkSW5wdXQgPT09ICcnKSB7XHJcbiAgICAgICAgc2hvd1RvYXN0KCdMYWJlbCBjbGFzcyBjYW5ub3QgYmUgZW1wdHkuJywgMzAwMCk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbnVtID0gTnVtYmVyKHRyaW1tZWRJbnB1dCk7XHJcblxyXG4gICAgaWYgKGlzTmFOKG51bSkgfHwgIU51bWJlci5pc0ludGVnZXIobnVtKSB8fCBudW0gPCAwIHx8IG51bSA+IDEwMDAwKSB7XHJcbiAgICAgICAgc2hvd1RvYXN0KCdJbnZhbGlkIExhYmVsOiBQbGVhc2UgZW50ZXIgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDEwMDAwLicsIDQwMDApO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmcobnVtKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkdmFuY2VkIGxhYmVsIGNsYXNzIHZhbGlkYXRpb24gd2l0aCBkZXRhaWxlZCByZXN1bHRcclxuICogQHBhcmFtIGlucHV0IC0gUmF3IGlucHV0IHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIERldGFpbGVkIHZhbGlkYXRpb24gcmVzdWx0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVMYWJlbENsYXNzQWR2YW5jZWQoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBWYWxpZGF0aW9uUmVzdWx0IHtcclxuICAgIGlmIChpbnB1dCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdJbnB1dCB3YXMgY2FuY2VsbGVkJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHJpbW1lZElucHV0ID0gaW5wdXQudHJpbSgpO1xyXG4gICAgXHJcbiAgICBpZiAodHJpbW1lZElucHV0ID09PSAnJykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBjYW5ub3QgYmUgZW1wdHknXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBudW0gPSBOdW1iZXIodHJpbW1lZElucHV0KTtcclxuXHJcbiAgICBpZiAoaXNOYU4obnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBtdXN0IGJlIGEgbnVtYmVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgbXVzdCBiZSBhbiBpbnRlZ2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG51bSA8IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgY2Fubm90IGJlIG5lZ2F0aXZlJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG51bSA+IDEwMDAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0xhYmVsIGNsYXNzIGNhbm5vdCBleGNlZWQgMTAwMDAnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgdmFsdWU6IFN0cmluZyhudW0pXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGZpbGUgbmFtZSBmb3Igc2FmZXR5XHJcbiAqIEBwYXJhbSBmaWxlTmFtZSAtIEZpbGUgbmFtZSB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghZmlsZU5hbWUgfHwgZmlsZU5hbWUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgaW52YWxpZCBjaGFyYWN0ZXJzXHJcbiAgICBjb25zdCBpbnZhbGlkQ2hhcnMgPSAvWzw+OlwiL1xcXFx8PypdLztcclxuICAgIGlmIChpbnZhbGlkQ2hhcnMudGVzdChmaWxlTmFtZSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIHJlc2VydmVkIG5hbWVzIChXaW5kb3dzKVxyXG4gICAgY29uc3QgcmVzZXJ2ZWROYW1lcyA9IC9eKENPTnxQUk58QVVYfE5VTHxDT01bMS05XXxMUFRbMS05XSkkL2k7XHJcbiAgICBpZiAocmVzZXJ2ZWROYW1lcy50ZXN0KGZpbGVOYW1lKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBpbWFnZSBmaWxlIGV4dGVuc2lvblxyXG4gKiBAcGFyYW0gZmlsZU5hbWUgLSBGaWxlIG5hbWUgdG8gY2hlY2tcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBpbWFnZSBleHRlbnNpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUltYWdlRXh0ZW5zaW9uKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHZhbGlkRXh0ZW5zaW9ucyA9IFsnLmpwZycsICcuanBlZycsICcucG5nJywgJy5ibXAnLCAnLnRpZmYnLCAnLnRpZicsICcud2VicCddO1xyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gZmlsZU5hbWUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSk7XHJcbiAgICByZXR1cm4gdmFsaWRFeHRlbnNpb25zLmluY2x1ZGVzKGV4dGVuc2lvbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgY29vcmRpbmF0ZSB2YWx1ZXMgZm9yIGJvdW5kaW5nIGJveGVzXHJcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB5IC0gWSBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB3aWR0aCAtIFdpZHRoXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBIZWlnaHRcclxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUJvdW5kaW5nQm94KFxyXG4gICAgeDogbnVtYmVyLCBcclxuICAgIHk6IG51bWJlciwgXHJcbiAgICB3aWR0aDogbnVtYmVyLCBcclxuICAgIGhlaWdodDogbnVtYmVyXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGlzTmFOKHgpIHx8IGlzTmFOKHkpIHx8IGlzTmFOKHdpZHRoKSB8fCBpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0FsbCBjb29yZGluYXRlcyBtdXN0IGJlIHZhbGlkIG51bWJlcnMnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2lkdGggPD0gMCB8fCBoZWlnaHQgPD0gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdXaWR0aCBhbmQgaGVpZ2h0IG11c3QgYmUgcG9zaXRpdmUnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeCA8IDAgfHwgeSA8IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnQ29vcmRpbmF0ZXMgY2Fubm90IGJlIG5lZ2F0aXZlJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIFlPTE8gZm9ybWF0IGNvb3JkaW5hdGVzIChub3JtYWxpemVkIDAtMSlcclxuICogQHBhcmFtIGNlbnRlclggLSBOb3JtYWxpemVkIGNlbnRlciBYICgwLTEpXHJcbiAqIEBwYXJhbSBjZW50ZXJZIC0gTm9ybWFsaXplZCBjZW50ZXIgWSAoMC0xKVxyXG4gKiBAcGFyYW0gd2lkdGggLSBOb3JtYWxpemVkIHdpZHRoICgwLTEpXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBOb3JtYWxpemVkIGhlaWdodCAoMC0xKVxyXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlWU9MT0Nvb3JkaW5hdGVzKFxyXG4gICAgY2VudGVyWDogbnVtYmVyLFxyXG4gICAgY2VudGVyWTogbnVtYmVyLFxyXG4gICAgd2lkdGg6IG51bWJlcixcclxuICAgIGhlaWdodDogbnVtYmVyXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGlzTmFOKGNlbnRlclgpIHx8IGlzTmFOKGNlbnRlclkpIHx8IGlzTmFOKHdpZHRoKSB8fCBpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0FsbCBZT0xPIGNvb3JkaW5hdGVzIG11c3QgYmUgdmFsaWQgbnVtYmVycydcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjZW50ZXJYIDwgMCB8fCBjZW50ZXJYID4gMSB8fCBjZW50ZXJZIDwgMCB8fCBjZW50ZXJZID4gMSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdDZW50ZXIgY29vcmRpbmF0ZXMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2lkdGggPD0gMCB8fCB3aWR0aCA+IDEgfHwgaGVpZ2h0IDw9IDAgfHwgaGVpZ2h0ID4gMSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdXaWR0aCBhbmQgaGVpZ2h0IG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIHpvb20gbGV2ZWxcclxuICogQHBhcmFtIHpvb20gLSBab29tIGxldmVsIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgem9vbSBsZXZlbFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlWm9vbUxldmVsKHpvb206IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICFpc05hTih6b29tKSAmJiB6b29tID4gMC4xICYmIHpvb20gPD0gMTA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgZm9udCBzaXplIGZvciBsYWJlbHNcclxuICogQHBhcmFtIGZvbnRTaXplIC0gRm9udCBzaXplIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgZm9udCBzaXplXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGb250U2l6ZShmb250U2l6ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIWlzTmFOKGZvbnRTaXplKSAmJiBmb250U2l6ZSA+PSA4ICYmIGZvbnRTaXplIDw9IDcyO1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhbCBwdXJwb3NlIG51bWJlciB2YWxpZGF0aW9uXHJcbiAqIEBwYXJhbSB2YWx1ZSAtIFZhbHVlIHRvIHZhbGlkYXRlXHJcbiAqIEBwYXJhbSBtaW4gLSBNaW5pbXVtIGFsbG93ZWQgdmFsdWVcclxuICogQHBhcmFtIG1heCAtIE1heGltdW0gYWxsb3dlZCB2YWx1ZVxyXG4gKiBAcGFyYW0gYWxsb3dGbG9hdCAtIFdoZXRoZXIgdG8gYWxsb3cgZmxvYXRpbmcgcG9pbnQgbnVtYmVyc1xyXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTnVtYmVyKFxyXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlcixcclxuICAgIG1pbj86IG51bWJlcixcclxuICAgIG1heD86IG51bWJlcixcclxuICAgIGFsbG93RmxvYXQ6IGJvb2xlYW4gPSB0cnVlXHJcbik6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgY29uc3QgbnVtID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IE51bWJlcih2YWx1ZSkgOiB2YWx1ZTtcclxuXHJcbiAgICBpZiAoaXNOYU4obnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdWYWx1ZSBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFhbGxvd0Zsb2F0ICYmICFOdW1iZXIuaXNJbnRlZ2VyKG51bSkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnVmFsdWUgbXVzdCBiZSBhbiBpbnRlZ2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1pbiAhPT0gdW5kZWZpbmVkICYmIG51bSA8IG1pbikge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBWYWx1ZSBtdXN0IGJlIGF0IGxlYXN0ICR7bWlufWBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtYXggIT09IHVuZGVmaW5lZCAmJiBudW0gPiBtYXgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVmFsdWUgY2Fubm90IGV4Y2VlZCAke21heH1gXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgICAgdmFsdWU6IG51bVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBlbWFpbCBmb3JtYXRcclxuICogQHBhcmFtIGVtYWlsIC0gRW1haWwgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBlbWFpbCBmb3JtYXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUVtYWlsKGVtYWlsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcclxuICAgIHJldHVybiBlbWFpbFJlZ2V4LnRlc3QoZW1haWwpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIFVSTCBmb3JtYXRcclxuICogQHBhcmFtIHVybCAtIFVSTCB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIFVSTCBmb3JtYXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVVybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBuZXcgVVJMKHVybCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdGl6ZXMgc3RyaW5nIGlucHV0IHRvIHByZXZlbnQgWFNTXHJcbiAqIEBwYXJhbSBpbnB1dCAtIElucHV0IHN0cmluZyB0byBzYW5pdGl6ZVxyXG4gKiBAcmV0dXJucyBTYW5pdGl6ZWQgc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJbnB1dChpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBpbnB1dFxyXG4gICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXHJcbiAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjeDI3OycpO1xyXG59IiwiLyoqXHJcbiAqIE5vdGlmaWNhdGlvbnMgVXRpbGl0eSBNb2R1bGVcclxuICogXHJcbiAqIEhhbmRsZXMgdXNlciBub3RpZmljYXRpb24gc3lzdGVtIGluY2x1ZGluZyB0b2FzdCBtZXNzYWdlcyBhbmQgYWxlcnRzLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHRvYXN0IG5vdGlmaWNhdGlvbiBtZXNzYWdlIHRvIHRoZSB1c2VyXHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBEdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDMwMDBtcylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbjogbnVtYmVyID0gMzAwMCk6IHZvaWQge1xyXG4gICAgY29uc3QgdG9hc3RDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QtY29udGFpbmVyJyk7XHJcbiAgICBpZiAoIXRvYXN0Q29udGFpbmVyKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdUb2FzdCBjb250YWluZXIgbm90IGZvdW5kLiBNZXNzYWdlOicsIG1lc3NhZ2UpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdG9hc3QuY2xhc3NOYW1lID0gJ3RvYXN0LW1lc3NhZ2UnO1xyXG4gICAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgdG9hc3RDb250YWluZXIuYXBwZW5kQ2hpbGQodG9hc3QpO1xyXG5cclxuICAgIC8vIFNob3cgdG9hc3Qgd2l0aCBzbGlnaHQgZGVsYXkgZm9yIGFuaW1hdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93JyksIDEwKTtcclxuXHJcbiAgICAvLyBIaWRlIGFuZCByZW1vdmUgdG9hc3QgYWZ0ZXIgZHVyYXRpb25cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRvYXN0LnBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRvYXN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMzAwKTsgLy8gV2FpdCBmb3IgZmFkZS1vdXQgYW5pbWF0aW9uXHJcbiAgICB9LCBkdXJhdGlvbik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhbiBlcnJvciB0b2FzdCB3aXRoIGxvbmdlciBkdXJhdGlvblxyXG4gKiBAcGFyYW0gbWVzc2FnZSAtIEVycm9yIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvclRvYXN0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgc2hvd1RvYXN0KG1lc3NhZ2UsIDQwMDApO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYSBzdWNjZXNzIHRvYXN0IHdpdGggc3RhbmRhcmQgZHVyYXRpb25cclxuICogQHBhcmFtIG1lc3NhZ2UgLSBTdWNjZXNzIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTdWNjZXNzVG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBzaG93VG9hc3QobWVzc2FnZSwgMjAwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHdhcm5pbmcgdG9hc3RcclxuICogQHBhcmFtIG1lc3NhZ2UgLSBXYXJuaW5nIG1lc3NhZ2UgdG8gZGlzcGxheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dXYXJuaW5nVG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBzaG93VG9hc3QobWVzc2FnZSwgMzUwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUb2FzdCBtZXNzYWdlIHR5cGVzIGZvciB0eXBlIHNhZmV0eVxyXG4gKi9cclxuZXhwb3J0IHR5cGUgVG9hc3RUeXBlID0gJ3N1Y2Nlc3MnIHwgJ2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdpbmZvJztcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGZvciB0b2FzdCBub3RpZmljYXRpb25zXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRvYXN0Q29uZmlnIHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxuICAgIHR5cGU6IFRvYXN0VHlwZTtcclxuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xyXG4gICAgZGlzbWlzc2libGU/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogU2hvd3MgYSB0eXBlZCB0b2FzdCBub3RpZmljYXRpb25cclxuICogQHBhcmFtIGNvbmZpZyAtIFRvYXN0IGNvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1R5cGVkVG9hc3QoY29uZmlnOiBUb2FzdENvbmZpZyk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBtZXNzYWdlLCB0eXBlLCBkdXJhdGlvbiwgZGlzbWlzc2libGUgPSBmYWxzZSB9ID0gY29uZmlnO1xyXG4gICAgXHJcbiAgICBjb25zdCBkZWZhdWx0RHVyYXRpb25zOiBSZWNvcmQ8VG9hc3RUeXBlLCBudW1iZXI+ID0ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IDIwMDAsXHJcbiAgICAgICAgZXJyb3I6IDQwMDAsXHJcbiAgICAgICAgd2FybmluZzogMzUwMCxcclxuICAgICAgICBpbmZvOiAzMDAwXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHRvYXN0RHVyYXRpb24gPSBkdXJhdGlvbiA/PyBkZWZhdWx0RHVyYXRpb25zW3R5cGVdO1xyXG4gICAgXHJcbiAgICBpZiAoZGlzbWlzc2libGUpIHtcclxuICAgICAgICAvLyBGb3IgZGlzbWlzc2libGUgdG9hc3RzLCB3ZSBjb3VsZCBhZGQgY2xvc2UgYnV0dG9uIGxvZ2ljIGhlcmVcclxuICAgICAgICBzaG93VG9hc3QoYCR7bWVzc2FnZX0gW0Rpc21pc3NpYmxlXWAsIHRvYXN0RHVyYXRpb24pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzaG93VG9hc3QobWVzc2FnZSwgdG9hc3REdXJhdGlvbik7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxyXG4gKiBBcHBTdGF0ZSBNb2RlbCAtIE1haW4gQXBwbGljYXRpb24gU3RhdGUgTWFuYWdlbWVudFxyXG4gKiBcclxuICogQ2VudHJhbGl6ZWQgc3RhdGUgbWFuYWdlbWVudCBmb3IgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqIEhhbmRsZXMgYWxsIGFwcGxpY2F0aW9uIHN0YXRlIGluY2x1ZGluZyBmaWxlcywgVUkgc2V0dGluZ3MsIGNhY2hlLCBhbmQgY3VycmVudCB3b3Jrc3BhY2UuXHJcbiAqIFxyXG4gKiBAdmVyc2lvbiAxLjAuMFxyXG4gKiBAYXV0aG9yIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb25cclxuICovXHJcblxyXG5pbXBvcnQgeyBcclxuICBNb2RlLCBcclxuICBMYWJlbFNvcnRPcmRlciwgXHJcbiAgUG9pbnQsXHJcbiAgRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgXHJcbiAgRmlsZVN5c3RlbUZpbGVIYW5kbGVcclxufSBmcm9tICcuLi90eXBlcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gIElBcHBTdGF0ZSxcclxuICBBcHBTdGF0ZUNvbmZpZyxcclxuICBBcHBTdGF0ZU1ldGhvZHMsXHJcbiAgQXBwU3RhdGVFdmVudCxcclxuICBBcHBTdGF0ZUV2ZW50SGFuZGxlcixcclxuICBJbWFnZUZpbGUsXHJcbiAgQ2xhc3NGaWxlLFxyXG4gIENsYXNzRGVmaW5pdGlvbixcclxuICBDbGlwYm9hcmREYXRhLFxyXG4gIExvYWRUb2tlbixcclxuICBBcHBTdGF0ZVZhbGlkYXRpb24sXHJcbiAgU2VyaWFsaXphYmxlQXBwU3RhdGVcclxufSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5cclxuLyoqXHJcbiAqIEFwcFN0YXRlIENsYXNzXHJcbiAqIFxyXG4gKiBJbXBsZW1lbnRzIHRoZSBjb21wbGV0ZSBhcHBsaWNhdGlvbiBzdGF0ZSBtYW5hZ2VtZW50IHdpdGggdHlwZSBzYWZldHkuXHJcbiAqIFByb3ZpZGVzIG1ldGhvZHMgZm9yIG1hbmFnaW5nIGZpbGVzLCBVSSBzdGF0ZSwgY2FjaGUsIGFuZCB1c2VyIGludGVyYWN0aW9ucy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBcHBTdGF0ZSBpbXBsZW1lbnRzIElBcHBTdGF0ZSB7XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgSGFuZGxlcyAoRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSSlcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGltYWdlRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGxhYmVsRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGNsYXNzSW5mb0ZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBEYXRhIEFycmF5c1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW10gPSBbXTtcclxuICBwdWJsaWMgY2xhc3NGaWxlczogQ2xhc3NGaWxlW10gPSBbXTtcclxuICBwdWJsaWMgc2VsZWN0ZWRDbGFzc0ZpbGU6IENsYXNzRmlsZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdHVzIFRyYWNraW5nIE1hcHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGltYWdlTGFiZWxTdGF0dXMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTsgLy8gZmlsZU5hbWUgLT4gaGFzTGFiZWxzXHJcbiAgcHVibGljIGNsYXNzTmFtZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpOyAvLyBjbGFzc0lkIC0+IGNsYXNzTmFtZVxyXG4gIHB1YmxpYyBwcmV2aWV3SW1hZ2VDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7IC8vIGZpbGVOYW1lIC0+IG9iamVjdFVSTFxyXG4gIHB1YmxpYyBjb2xsYXBzZWRMYWJlbEdyb3VwcyA9IG5ldyBTZXQ8c3RyaW5nPigpOyAvLyBjb2xsYXBzZWQgZ3JvdXAgSURzXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDdXJyZW50IFdvcmtpbmcgU3RhdGVcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGN1cnJlbnRJbWFnZUZpbGU6IEltYWdlRmlsZSB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBjdXJyZW50SW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgY3VycmVudE1vZGU6IE1vZGUgPSAnZWRpdCc7XHJcbiAgcHVibGljIGN1cnJlbnRMb2FkVG9rZW46IExvYWRUb2tlbiA9IDA7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVSSBTZXR0aW5ncyAmIFByZWZlcmVuY2VzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBpc0F1dG9TYXZlRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBzaG93TGFiZWxzT25DYW52YXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyBsYWJlbEZvbnRTaXplOiBudW1iZXIgPSAxNDtcclxuICBwdWJsaWMgbGFiZWxTb3J0T3JkZXI6IExhYmVsU29ydE9yZGVyID0gJ2FzYyc7XHJcbiAgcHVibGljIGlzUHJldmlld0JhckhpZGRlbjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc0Nyb3NzaGFpclZpc2libGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEludGVybmFsIFN0YXRlICYgVGVtcG9yYXJ5IERhdGFcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIHNhdmVUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBfY2xpcGJvYXJkOiBDbGlwYm9hcmREYXRhIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGxhc3RNb3VzZVBvc2l0aW9uOiBQb2ludCA9IHsgeDogMCwgeTogMCB9O1xyXG4gIHB1YmxpYyBjb250ZXh0VGFyZ2V0OiBhbnkgPSBudWxsO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgU3lzdGVtXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgQXBwU3RhdGVFdmVudEhhbmRsZXJbXT4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgLSBJbml0aWFsaXplIEFwcFN0YXRlIHdpdGggZGVmYXVsdCB2YWx1ZXNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIEFsbCBwcm9wZXJ0aWVzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkIGFib3ZlXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6aW5pdGlhbGl6ZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFN0YXRlIE1hbmFnZW1lbnQgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgYWxsIHN0YXRlIHRvIGluaXRpYWwgdmFsdWVzXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gQ2xlYXIgZmlsZSBoYW5kbGVzXHJcbiAgICB0aGlzLmltYWdlRm9sZGVySGFuZGxlID0gbnVsbDtcclxuICAgIHRoaXMubGFiZWxGb2xkZXJIYW5kbGUgPSBudWxsO1xyXG4gICAgdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUgPSBudWxsO1xyXG5cclxuICAgIC8vIENsZWFyIGZpbGUgYXJyYXlzXHJcbiAgICB0aGlzLmltYWdlRmlsZXMgPSBbXTtcclxuICAgIHRoaXMuY2xhc3NGaWxlcyA9IFtdO1xyXG4gICAgdGhpcy5zZWxlY3RlZENsYXNzRmlsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2xlYXIgbWFwcyBhbmQgc2V0c1xyXG4gICAgdGhpcy5pbWFnZUxhYmVsU3RhdHVzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmNsYXNzTmFtZXMuY2xlYXIoKTtcclxuICAgIHRoaXMuY29sbGFwc2VkTGFiZWxHcm91cHMuY2xlYXIoKTtcclxuICAgIHRoaXMuY2xlYXJQcmV2aWV3Q2FjaGUoKTtcclxuXHJcbiAgICAvLyBSZXNldCBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZUZpbGUgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9ICdlZGl0JztcclxuICAgIHRoaXMuY3VycmVudExvYWRUb2tlbiA9IDA7XHJcblxyXG4gICAgLy8gUmVzZXQgVUkgc2V0dGluZ3MgdG8gZGVmYXVsdHNcclxuICAgIHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gdHJ1ZTtcclxuICAgIHRoaXMubGFiZWxGb250U2l6ZSA9IDE0O1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9ICdhc2MnO1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQ2xlYXIgaW50ZXJuYWwgc3RhdGVcclxuICAgIGlmICh0aGlzLnNhdmVUaW1lb3V0KSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNhdmVUaW1lb3V0KTtcclxuICAgICAgdGhpcy5zYXZlVGltZW91dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBudWxsO1xyXG4gICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgdGhpcy5jb250ZXh0VGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6cmVzZXQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbWFnZSBmb2xkZXIgaGFuZGxlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEltYWdlRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5pbWFnZUZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6aW1hZ2Utc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBsYWJlbCBmb2xkZXIgaGFuZGxlXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbEZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6bGFiZWwtc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjbGFzcyBpbmZvIGZvbGRlciBoYW5kbGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q2xhc3NJbmZvRm9sZGVyKGhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUgPSBoYW5kbGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnZm9sZGVyOmNsYXNzLWluZm8tc2V0JyxcclxuICAgICAgZGF0YTogeyBuYW1lOiBoYW5kbGUubmFtZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEltYWdlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY3VycmVudCB3b3JraW5nIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEN1cnJlbnRJbWFnZShpbWFnZUZpbGU6IEltYWdlRmlsZSB8IG51bGwpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByZXZpb3VzSW1hZ2UgPSB0aGlzLmN1cnJlbnRJbWFnZUZpbGU7XHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZUZpbGUgPSBpbWFnZUZpbGU7XHJcbiAgICBcclxuICAgIC8vIEluY3JlbWVudCBsb2FkIHRva2VuIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zXHJcbiAgICB0aGlzLmN1cnJlbnRMb2FkVG9rZW4gKz0gMTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnaW1hZ2U6Y3VycmVudC1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBcclxuICAgICAgICBwcmV2aW91czogcHJldmlvdXNJbWFnZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICAgIGN1cnJlbnQ6IGltYWdlRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICAgIGxvYWRUb2tlbjogdGhpcy5jdXJyZW50TG9hZFRva2VuXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgbGFiZWwgc3RhdHVzIGZvciBhbiBpbWFnZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRJbWFnZUxhYmVsU3RhdHVzKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmltYWdlTGFiZWxTdGF0dXMuZ2V0KGZpbGVOYW1lKSB8fCBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBzdGF0dXMgZm9yIGFuIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIHNldEltYWdlTGFiZWxTdGF0dXMoZmlsZU5hbWU6IHN0cmluZywgaGFzTGFiZWxzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLmltYWdlTGFiZWxTdGF0dXMuc2V0KGZpbGVOYW1lLCBoYXNMYWJlbHMpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ltYWdlOmxhYmVsLXN0YXR1cy1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBmaWxlTmFtZSwgaGFzTGFiZWxzIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTW9kZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGN1cnJlbnQgZHJhd2luZy9lZGl0aW5nIG1vZGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TW9kZShtb2RlOiBNb2RlKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcmV2aW91c01vZGUgPSB0aGlzLmN1cnJlbnRNb2RlO1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9IG1vZGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnbW9kZTpjaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBwcmV2aW91czogcHJldmlvdXNNb2RlLCBjdXJyZW50OiBtb2RlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgYmV0d2VlbiBkcmF3IGFuZCBlZGl0IG1vZGVzXHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZU1vZGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBuZXdNb2RlOiBNb2RlID0gdGhpcy5jdXJyZW50TW9kZSA9PT0gJ2VkaXQnID8gJ2RyYXcnIDogJ2VkaXQnO1xyXG4gICAgdGhpcy5zZXRNb2RlKG5ld01vZGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENsYXNzIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbGVjdCBhIGNsYXNzIGZpbGUgZm9yIHVzZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZWxlY3RDbGFzc0ZpbGUoY2xhc3NGaWxlOiBDbGFzc0ZpbGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkQ2xhc3NGaWxlID0gY2xhc3NGaWxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsYXNzOmZpbGUtc2VsZWN0ZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lOiBjbGFzc0ZpbGU/Lm5hbWUgfHwgbnVsbCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgY2xhc3MgZGVmaW5pdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRDbGFzc0RlZmluaXRpb24oY2xhc3NEZWY6IENsYXNzRGVmaW5pdGlvbik6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc05hbWVzLnNldChjbGFzc0RlZi5pZC50b1N0cmluZygpLCBjbGFzc0RlZi5uYW1lKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGFzczpkZWZpbml0aW9uLWFkZGVkJyxcclxuICAgICAgZGF0YTogY2xhc3NEZWYsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBjbGFzcyBkZWZpbml0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZUNsYXNzRGVmaW5pdGlvbihjbGFzc0lkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuY2xhc3NOYW1lcy5kZWxldGUoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjbGFzczpkZWZpbml0aW9uLXJlbW92ZWQnLFxyXG4gICAgICBkYXRhOiB7IGNsYXNzSWQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTZXR0aW5ncyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgYXV0by1zYXZlIGZ1bmN0aW9uYWxpdHlcclxuICAgKi9cclxuICBwdWJsaWMgc2V0QXV0b1NhdmUoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2V0dGluZ3M6YXV0by1zYXZlLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IGVuYWJsZWQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBsYWJlbCB2aXNpYmlsaXR5IG9uIGNhbnZhc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTaG93TGFiZWxzKHNob3c6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gc2hvdztcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZXR0aW5nczpzaG93LWxhYmVscy1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBzaG93IH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbGFiZWwgZm9udCBzaXplXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsRm9udFNpemUoc2l6ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAoc2l6ZSA+PSA4ICYmIHNpemUgPD0gNDgpIHtcclxuICAgICAgdGhpcy5sYWJlbEZvbnRTaXplID0gc2l6ZTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnc2V0dGluZ3M6Zm9udC1zaXplLWNoYW5nZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgc2l6ZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBzb3J0IG9yZGVyXHJcbiAgICovXHJcbiAgcHVibGljIHNldExhYmVsU29ydE9yZGVyKG9yZGVyOiBMYWJlbFNvcnRPcmRlcik6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9IG9yZGVyO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3NldHRpbmdzOnNvcnQtb3JkZXItY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgb3JkZXIgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVSSBTdGF0ZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgcHJldmlldyBiYXIgdmlzaWJpbGl0eVxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b2dnbGVQcmV2aWV3QmFyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSAhdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW47XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAndWk6cHJldmlldy1iYXItdG9nZ2xlZCcsXHJcbiAgICAgIGRhdGE6IHsgaGlkZGVuOiB0aGlzLmlzUHJldmlld0JhckhpZGRlbiB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIGNyb3NzaGFpciB2aXNpYmlsaXR5XHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZUNyb3NzaGFpcigpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlID0gIXRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3VpOmNyb3NzaGFpci10b2dnbGVkJyxcclxuICAgICAgZGF0YTogeyB2aXNpYmxlOiB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZSB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGNvbnRleHQgbWVudSB0YXJnZXRcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q29udGV4dFRhcmdldCh0YXJnZXQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5jb250ZXh0VGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3VpOmNvbnRleHQtdGFyZ2V0LXNldCcsXHJcbiAgICAgIGRhdGE6IHsgdGFyZ2V0IH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2FjaGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FjaGUgYSBwcmV2aWV3IGltYWdlIE9iamVjdFVSTFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYWNoZVByZXZpZXdJbWFnZShmaWxlTmFtZTogc3RyaW5nLCBvYmplY3RVUkw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5zZXQoZmlsZU5hbWUsIG9iamVjdFVSTCk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6cHJldmlldy1jYWNoZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgY2FjaGVkIHByZXZpZXcgaW1hZ2UgT2JqZWN0VVJMXHJcbiAgICovXHJcbiAgcHVibGljIGdldENhY2hlZFByZXZpZXdJbWFnZShmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLmdldChmaWxlTmFtZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciBhbGwgcHJldmlldyBjYWNoZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhclByZXZpZXdDYWNoZSgpOiB2b2lkIHtcclxuICAgIC8vIFJldm9rZSBhbGwgT2JqZWN0VVJMcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xyXG4gICAgZm9yIChjb25zdCBvYmplY3RVUkwgb2YgdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS52YWx1ZXMoKSkge1xyXG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVSTCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2FjaGU6cHJldmlldy1jbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDbGlwYm9hcmQgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGNsaXBib2FyZCBkYXRhXHJcbiAgICovXHJcbiAgcHVibGljIHNldENsaXBib2FyZChkYXRhOiBDbGlwYm9hcmREYXRhKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBkYXRhO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsaXBib2FyZDpkYXRhLXNldCcsXHJcbiAgICAgIGRhdGE6IHsgdHlwZTogZGF0YS50eXBlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgY2xpcGJvYXJkIGRhdGFcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2xpcGJvYXJkKCk6IENsaXBib2FyZERhdGEgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9jbGlwYm9hcmQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciBjbGlwYm9hcmRcclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXJDbGlwYm9hcmQoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jbGlwYm9hcmQgPSBudWxsO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsaXBib2FyZDpjbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW0gSW1wbGVtZW50YXRpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lclxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogQXBwU3RhdGVFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQodHlwZSwgW10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSkhLnB1c2goaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEFwcFN0YXRlRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBoYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwYXRjaCBldmVudCB0byBhbGwgbGlzdGVuZXJzXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IEFwcFN0YXRlRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaGFuZGxlcihldmVudCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVXRpbGl0eSBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBjdXJyZW50IHN0YXRlXHJcbiAgICovXHJcbiAgcHVibGljIHZhbGlkYXRlKCk6IEFwcFN0YXRlVmFsaWRhdGlvbiB7XHJcbiAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3IgcmVxdWlyZWQgZm9sZGVyc1xyXG4gICAgaWYgKCF0aGlzLmltYWdlRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ05vIGltYWdlIGZvbGRlciBzZWxlY3RlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5sYWJlbEZvbGRlckhhbmRsZSkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdObyBsYWJlbCBmb2xkZXIgc2VsZWN0ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb250IHNpemUgcmFuZ2VcclxuICAgIGlmICh0aGlzLmxhYmVsRm9udFNpemUgPCA4IHx8IHRoaXMubGFiZWxGb250U2l6ZSA+IDQ4KSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdMYWJlbCBmb250IHNpemUgbXVzdCBiZSBiZXR3ZWVuIDggYW5kIDQ4Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIG1lbW9yeSBsZWFrcyBpbiBjYWNoZVxyXG4gICAgaWYgKHRoaXMucHJldmlld0ltYWdlQ2FjaGUuc2l6ZSA+IDEwMCkge1xyXG4gICAgICB3YXJuaW5ncy5wdXNoKCdQcmV2aWV3IGNhY2hlIGlzIGxhcmdlLCBjb25zaWRlciBjbGVhcmluZycpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGVycm9ycyxcclxuICAgICAgd2FybmluZ3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgc2VyaWFsaXphYmxlIHN0YXRlIChmb3IgcGVyc2lzdGVuY2UpXHJcbiAgICovXHJcbiAgcHVibGljIGdldFNlcmlhbGl6YWJsZVN0YXRlKCk6IFNlcmlhbGl6YWJsZUFwcFN0YXRlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGN1cnJlbnRNb2RlOiB0aGlzLmN1cnJlbnRNb2RlLFxyXG4gICAgICBpc0F1dG9TYXZlRW5hYmxlZDogdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCxcclxuICAgICAgc2hvd0xhYmVsc09uQ2FudmFzOiB0aGlzLnNob3dMYWJlbHNPbkNhbnZhcyxcclxuICAgICAgbGFiZWxGb250U2l6ZTogdGhpcy5sYWJlbEZvbnRTaXplLFxyXG4gICAgICBsYWJlbFNvcnRPcmRlcjogdGhpcy5sYWJlbFNvcnRPcmRlcixcclxuICAgICAgaXNQcmV2aWV3QmFySGlkZGVuOiB0aGlzLmlzUHJldmlld0JhckhpZGRlbixcclxuICAgICAgaXNDcm9zc2hhaXJWaXNpYmxlOiB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgZnJvbSBzZXJpYWxpemFibGUgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgcmVzdG9yZUZyb21TZXJpYWxpemFibGVTdGF0ZShzdGF0ZTogU2VyaWFsaXphYmxlQXBwU3RhdGUpOiB2b2lkIHtcclxuICAgIHRoaXMuY3VycmVudE1vZGUgPSBzdGF0ZS5jdXJyZW50TW9kZTtcclxuICAgIHRoaXMuaXNBdXRvU2F2ZUVuYWJsZWQgPSBzdGF0ZS5pc0F1dG9TYXZlRW5hYmxlZDtcclxuICAgIHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzID0gc3RhdGUuc2hvd0xhYmVsc09uQ2FudmFzO1xyXG4gICAgdGhpcy5sYWJlbEZvbnRTaXplID0gc3RhdGUubGFiZWxGb250U2l6ZTtcclxuICAgIHRoaXMubGFiZWxTb3J0T3JkZXIgPSBzdGF0ZS5sYWJlbFNvcnRPcmRlcjtcclxuICAgIHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuID0gc3RhdGUuaXNQcmV2aWV3QmFySGlkZGVuO1xyXG4gICAgdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgPSBzdGF0ZS5pc0Nyb3NzaGFpclZpc2libGU7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3N0YXRlOnJlc3RvcmVkJyxcclxuICAgICAgZGF0YTogc3RhdGUsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgZGVidWcgaW5mb3JtYXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGVidWdJbmZvKCk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaW1hZ2VGaWxlc0NvdW50OiB0aGlzLmltYWdlRmlsZXMubGVuZ3RoLFxyXG4gICAgICBjbGFzc0ZpbGVzQ291bnQ6IHRoaXMuY2xhc3NGaWxlcy5sZW5ndGgsXHJcbiAgICAgIGltYWdlTGFiZWxTdGF0dXNDb3VudDogdGhpcy5pbWFnZUxhYmVsU3RhdHVzLnNpemUsXHJcbiAgICAgIGNsYXNzTmFtZXNDb3VudDogdGhpcy5jbGFzc05hbWVzLnNpemUsXHJcbiAgICAgIHByZXZpZXdDYWNoZVNpemU6IHRoaXMucHJldmlld0ltYWdlQ2FjaGUuc2l6ZSxcclxuICAgICAgY29sbGFwc2VkR3JvdXBzQ291bnQ6IHRoaXMuY29sbGFwc2VkTGFiZWxHcm91cHMuc2l6ZSxcclxuICAgICAgY3VycmVudExvYWRUb2tlbjogdGhpcy5jdXJyZW50TG9hZFRva2VuLFxyXG4gICAgICBoYXNJbWFnZUZvbGRlcjogISF0aGlzLmltYWdlRm9sZGVySGFuZGxlLFxyXG4gICAgICBoYXNMYWJlbEZvbGRlcjogISF0aGlzLmxhYmVsRm9sZGVySGFuZGxlLFxyXG4gICAgICBoYXNDbGFzc0luZm9Gb2xkZXI6ICEhdGhpcy5jbGFzc0luZm9Gb2xkZXJIYW5kbGUsXHJcbiAgICAgIGN1cnJlbnRJbWFnZU5hbWU6IHRoaXMuY3VycmVudEltYWdlRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICBzZWxlY3RlZENsYXNzRmlsZU5hbWU6IHRoaXMuc2VsZWN0ZWRDbGFzc0ZpbGU/Lm5hbWUgfHwgbnVsbCxcclxuICAgICAgZXZlbnRMaXN0ZW5lclR5cGVzOiBBcnJheS5mcm9tKHRoaXMuZXZlbnRMaXN0ZW5lcnMua2V5cygpKVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBGdW5jdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IEFwcFN0YXRlIGluc3RhbmNlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBwU3RhdGUoKTogQXBwU3RhdGUge1xyXG4gIHJldHVybiBuZXcgQXBwU3RhdGUoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBBcHBTdGF0ZSB3aXRoIGluaXRpYWwgY29uZmlndXJhdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFwcFN0YXRlV2l0aENvbmZpZyhjb25maWc6IFBhcnRpYWw8QXBwU3RhdGVDb25maWc+KTogQXBwU3RhdGUge1xyXG4gIGNvbnN0IGFwcFN0YXRlID0gbmV3IEFwcFN0YXRlKCk7XHJcbiAgXHJcbiAgLy8gQXBwbHkgY29uZmlndXJhdGlvblxyXG4gIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgaWYgKGtleSBpbiBhcHBTdGF0ZSkge1xyXG4gICAgICAoYXBwU3RhdGUgYXMgYW55KVtrZXldID0gKGNvbmZpZyBhcyBhbnkpW2tleV07XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBhcHBTdGF0ZTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFwcFN0YXRlO1xyXG5leHBvcnQgdHlwZSB7IElBcHBTdGF0ZSwgQXBwU3RhdGVDb25maWcsIEFwcFN0YXRlTWV0aG9kcyB9OyIsIi8qKlxyXG4gKiBGaWxlU3lzdGVtIFNlcnZpY2UgVHlwZSBEZWZpbml0aW9uc1xyXG4gKiBcclxuICogVHlwZXMgZm9yIGZpbGUgSS9PIG9wZXJhdGlvbnMsIFlPTE8gZm9ybWF0IGhhbmRsaW5nLCBhbmQgRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSSBpbnRlZ3JhdGlvbi5cclxuICovXHJcblxyXG5pbXBvcnQgeyBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBGaWxlU3lzdGVtRmlsZUhhbmRsZSB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyBJbWFnZUZpbGUsIENsYXNzRmlsZSwgQ2xhc3NEZWZpbml0aW9uIH0gZnJvbSAnLi9hcHAtc3RhdGUnO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGaWxlIE9wZXJhdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlT3BlcmF0aW9uUmVzdWx0PFQgPSB2b2lkPiB7XHJcbiAgc3VjY2VzczogYm9vbGVhbjtcclxuICBkYXRhPzogVDtcclxuICBlcnJvcj86IHN0cmluZztcclxuICBtZXNzYWdlPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVMb2FkUmVzdWx0IHtcclxuICBjb250ZW50OiBzdHJpbmc7XHJcbiAgZmlsZTogRmlsZTtcclxuICBsYXN0TW9kaWZpZWQ6IERhdGU7XHJcbiAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFlPTE8gRm9ybWF0IFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgWW9sb0xhYmVsIHtcclxuICBjbGFzc0lkOiBudW1iZXI7XHJcbiAgY2VudGVyWDogbnVtYmVyO1xyXG4gIGNlbnRlclk6IG51bWJlcjtcclxuICB3aWR0aDogbnVtYmVyO1xyXG4gIGhlaWdodDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFlvbG9QYXJzZVJlc3VsdCB7XHJcbiAgbGFiZWxzOiBZb2xvTGFiZWxbXTtcclxuICBlcnJvcnM6IHN0cmluZ1tdO1xyXG4gIHdhcm5pbmdzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBZb2xvRXhwb3J0T3B0aW9ucyB7XHJcbiAgcHJlY2lzaW9uPzogbnVtYmVyO1xyXG4gIGluY2x1ZGVDb21tZW50cz86IGJvb2xlYW47XHJcbiAgdmFsaWRhdGVCb3VuZHM/OiBib29sZWFuO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENsYXNzIEZpbGUgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbGFzc0ZpbGVDb250ZW50IHtcclxuICBjbGFzc2VzOiBDbGFzc0RlZmluaXRpb25bXTtcclxuICBtZXRhZGF0YT86IHtcclxuICAgIHZlcnNpb24/OiBzdHJpbmc7XHJcbiAgICBjcmVhdGVkPzogRGF0ZTtcclxuICAgIG1vZGlmaWVkPzogRGF0ZTtcclxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xhc3NGaWxlVmFsaWRhdGlvbiB7XHJcbiAgaXNWYWxpZDogYm9vbGVhbjtcclxuICBlcnJvcnM6IHN0cmluZ1tdO1xyXG4gIHdhcm5pbmdzOiBzdHJpbmdbXTtcclxuICBkdXBsaWNhdGVJZHM6IG51bWJlcltdO1xyXG4gIGVtcHR5TmFtZXM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZvbGRlciBPcGVyYXRpb25zXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRm9sZGVyU2NhblJlc3VsdCB7XHJcbiAgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW107XHJcbiAgbGFiZWxGaWxlczogc3RyaW5nW107XHJcbiAgY2xhc3NGaWxlczogQ2xhc3NGaWxlW107XHJcbiAgdG90YWxGaWxlczogbnVtYmVyO1xyXG4gIGVycm9yczogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGFiZWxTdGF0dXMge1xyXG4gIGZpbGVOYW1lOiBzdHJpbmc7XHJcbiAgaGFzTGFiZWxzOiBib29sZWFuO1xyXG4gIGxhYmVsQ291bnQ6IG51bWJlcjtcclxuICBsYXN0TW9kaWZpZWQ/OiBEYXRlO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEltYWdlIFByb2Nlc3NpbmdcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbWFnZUxvYWRPcHRpb25zIHtcclxuICBtYXhXaWR0aD86IG51bWJlcjtcclxuICBtYXhIZWlnaHQ/OiBudW1iZXI7XHJcbiAgcXVhbGl0eT86IG51bWJlcjtcclxuICBmb3JtYXQ/OiAncG5nJyB8ICdqcGVnJyB8ICd3ZWJwJztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbWFnZUluZm8ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB3aWR0aDogbnVtYmVyO1xyXG4gIGhlaWdodDogbnVtYmVyO1xyXG4gIHNpemU6IG51bWJlcjtcclxuICBmb3JtYXQ6IHN0cmluZztcclxuICBsYXN0TW9kaWZpZWQ6IERhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGlmZlByb2Nlc3NpbmdPcHRpb25zIHtcclxuICBwYWdlPzogbnVtYmVyO1xyXG4gIGNvbnZlcnRUb0NhbnZhcz86IGJvb2xlYW47XHJcbiAgYmFja2dyb3VuZENvbG9yPzogc3RyaW5nO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENhY2hlIE1hbmFnZW1lbnRcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYWNoZUVudHJ5PFQ+IHtcclxuICBkYXRhOiBUO1xyXG4gIHRpbWVzdGFtcDogRGF0ZTtcclxuICBzaXplOiBudW1iZXI7XHJcbiAgaGl0czogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENhY2hlU3RhdHMge1xyXG4gIHRvdGFsRW50cmllczogbnVtYmVyO1xyXG4gIHRvdGFsU2l6ZTogbnVtYmVyO1xyXG4gIGhpdFJhdGU6IG51bWJlcjtcclxuICBtZW1vcnlVc2FnZTogbnVtYmVyO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZpbGUgU3lzdGVtIFNlcnZpY2UgSW50ZXJmYWNlXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICAvLyBGb2xkZXIgT3BlcmF0aW9uc1xyXG4gIHNlbGVjdEltYWdlRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj47XHJcbiAgc2VsZWN0TGFiZWxGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PjtcclxuICBzZWxlY3RDbGFzc0luZm9Gb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PjtcclxuICBcclxuICAvLyBGaWxlIExpc3RpbmdcclxuICBsaXN0SW1hZ2VGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SW1hZ2VGaWxlW10+PjtcclxuICBsaXN0Q2xhc3NGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Q2xhc3NGaWxlW10+PjtcclxuICBzY2FuRm9sZGVyKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGb2xkZXJTY2FuUmVzdWx0Pj47XHJcbiAgXHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIGxvYWRJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+O1xyXG4gIGxvYWRUaWZmSW1hZ2UoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIG9wdGlvbnM/OiBUaWZmUHJvY2Vzc2luZ09wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+O1xyXG4gIGdldEltYWdlSW5mbyhmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxJbWFnZUluZm8+PjtcclxuICBcclxuICAvLyBMYWJlbCBPcGVyYXRpb25zXHJcbiAgbG9hZExhYmVscyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8WW9sb0xhYmVsW10+PjtcclxuICBzYXZlTGFiZWxzKGZpbGVOYW1lOiBzdHJpbmcsIGxhYmVsczogWW9sb0xhYmVsW10sIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdD47XHJcbiAgY2hlY2tMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8TGFiZWxTdGF0dXM+PjtcclxuICBcclxuICAvLyBDbGFzcyBGaWxlIE9wZXJhdGlvbnNcclxuICBsb2FkQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PENsYXNzRmlsZUNvbnRlbnQ+PjtcclxuICBzYXZlQ2xhc3NGaWxlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBjb250ZW50OiBDbGFzc0ZpbGVDb250ZW50KTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PjtcclxuICBjcmVhdGVDbGFzc0ZpbGUoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBmaWxlTmFtZTogc3RyaW5nLCBpbml0aWFsQ29udGVudD86IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbUZpbGVIYW5kbGU+PjtcclxuICB2YWxpZGF0ZUNsYXNzRmlsZShjb250ZW50OiBzdHJpbmcpOiBDbGFzc0ZpbGVWYWxpZGF0aW9uO1xyXG4gIFxyXG4gIC8vIFlPTE8gRm9ybWF0IFByb2Nlc3NpbmdcclxuICBwYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IFlvbG9QYXJzZVJlc3VsdDtcclxuICBsYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzOiBZb2xvTGFiZWxbXSwgb3B0aW9ucz86IFlvbG9FeHBvcnRPcHRpb25zKTogc3RyaW5nO1xyXG4gIHZhbGlkYXRlWW9sb0xhYmVsKGxhYmVsOiBZb2xvTGFiZWwpOiBib29sZWFuO1xyXG4gIFxyXG4gIC8vIENhY2hlIE1hbmFnZW1lbnRcclxuICBjbGVhckltYWdlQ2FjaGUoKTogdm9pZDtcclxuICBnZXRDYWNoZVN0YXRzKCk6IENhY2hlU3RhdHM7XHJcbiAgb3B0aW1pemVDYWNoZSgpOiB2b2lkO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENvbmZpZ3VyYXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtQ29uZmlnIHtcclxuICAvLyBJbWFnZSBzZXR0aW5nc1xyXG4gIHN1cHBvcnRlZEltYWdlRm9ybWF0czogc3RyaW5nW107XHJcbiAgbWF4SW1hZ2VTaXplOiBudW1iZXI7XHJcbiAgdGh1bWJuYWlsU2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gIFxyXG4gIC8vIENhY2hlIHNldHRpbmdzXHJcbiAgbWF4Q2FjaGVTaXplOiBudW1iZXI7XHJcbiAgY2FjaGVUaW1lb3V0OiBudW1iZXI7XHJcbiAgXHJcbiAgLy8gWU9MTyBzZXR0aW5nc1xyXG4gIHlvbG9WYWxpZGF0aW9uOiB7XHJcbiAgICBzdHJpY3RCb3VuZHM6IGJvb2xlYW47XHJcbiAgICBhbGxvd1plcm9TaXplOiBib29sZWFuO1xyXG4gICAgcHJlY2lzaW9uOiBudW1iZXI7XHJcbiAgfTtcclxuICBcclxuICAvLyBQZXJmb3JtYW5jZSBzZXR0aW5nc1xyXG4gIGJhdGNoU2l6ZTogbnVtYmVyO1xyXG4gIGNvbmN1cnJlbnRMb2FkczogbnVtYmVyO1xyXG4gIHByZWxvYWRBZGphY2VudDogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFdmVudHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtRXZlbnQge1xyXG4gIHR5cGU6IHN0cmluZztcclxuICBkYXRhPzogYW55O1xyXG4gIHRpbWVzdGFtcDogRGF0ZTtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgRmlsZVN5c3RlbUV2ZW50SGFuZGxlciA9IChldmVudDogRmlsZVN5c3RlbUV2ZW50KSA9PiB2b2lkO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFcnJvciBUeXBlc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZVN5c3RlbUVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGNvZGU6IHN0cmluZyxcclxuICAgIHB1YmxpYyBkZXRhaWxzPzogYW55XHJcbiAgKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICAgIHRoaXMubmFtZSA9ICdGaWxlU3lzdGVtRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFlvbG9Gb3JtYXRFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIHB1YmxpYyBsaW5lPzogbnVtYmVyLFxyXG4gICAgcHVibGljIGRhdGE/OiBzdHJpbmdcclxuICApIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gICAgdGhpcy5uYW1lID0gJ1lvbG9Gb3JtYXRFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW1hZ2VMb2FkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgZmlsZU5hbWU/OiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgY2F1c2U/OiBFcnJvclxyXG4gICkge1xyXG4gICAgc3VwZXIobWVzc2FnZSk7XHJcbiAgICB0aGlzLm5hbWUgPSAnSW1hZ2VMb2FkRXJyb3InO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBVdGlsaXR5IFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCB0eXBlIEZpbGVGb3JtYXQgPSAnanBnJyB8ICdqcGVnJyB8ICdwbmcnIHwgJ2dpZicgfCAndGlmJyB8ICd0aWZmJyB8ICd3ZWJwJztcclxuZXhwb3J0IHR5cGUgTGFiZWxGb3JtYXQgPSAneW9sbycgfCAnY29jbycgfCAncGFzY2FsJyB8ICdjdXN0b20nO1xyXG5leHBvcnQgdHlwZSBDbGFzc0ZpbGVGb3JtYXQgPSAneWFtbCcgfCAneW1sJyB8ICdqc29uJyB8ICd0eHQnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlVHlwZUluZm8ge1xyXG4gIGV4dGVuc2lvbjogc3RyaW5nO1xyXG4gIG1pbWVUeXBlOiBzdHJpbmc7XHJcbiAgY2F0ZWdvcnk6ICdpbWFnZScgfCAnbGFiZWwnIHwgJ2NsYXNzJyB8ICdvdGhlcic7XHJcbiAgc3VwcG9ydGVkOiBib29sZWFuO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZhY3RvcnkgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGaWxlU3lzdGVtU2VydmljZUZhY3Rvcnkge1xyXG4gIGNyZWF0ZShjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KTogSUZpbGVTeXN0ZW1TZXJ2aWNlO1xyXG4gIGNyZWF0ZVdpdGhDYWNoZShjYWNoZVNpemU6IG51bWJlcik6IElGaWxlU3lzdGVtU2VydmljZTtcclxufSIsIi8qKlxyXG4gKiBZT0xPIEZvcm1hdCBQYXJzZXIgVXRpbGl0eVxyXG4gKiBcclxuICogSGFuZGxlcyBwYXJzaW5nIGFuZCBnZW5lcmF0aW9uIG9mIFlPTE8gZm9ybWF0IGFubm90YXRpb24gZmlsZXMuXHJcbiAqIFlPTE8gZm9ybWF0OiBjbGFzc0lkIGNlbnRlclggY2VudGVyWSB3aWR0aCBoZWlnaHQgKG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMgMC0xKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFlvbG9MYWJlbCwgWW9sb1BhcnNlUmVzdWx0LCBZb2xvRXhwb3J0T3B0aW9ucywgWW9sb0Zvcm1hdEVycm9yIH0gZnJvbSAnLi4vdHlwZXMvZmlsZXN5c3RlbSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENvbnN0YW50c1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5jb25zdCBERUZBVUxUX1BSRUNJU0lPTiA9IDY7XHJcbmNvbnN0IE1JTl9DT09SRElOQVRFID0gMC4wO1xyXG5jb25zdCBNQVhfQ09PUkRJTkFURSA9IDEuMDtcclxuY29uc3QgTUlOX1NJWkUgPSAwLjA7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFlPTE8gUGFyc2VyIENsYXNzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBZb2xvUGFyc2VyIHtcclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDT09SRElOQVRFX1BBVFRFUk4gPSAvXi0/XFxkKyhcXC5cXGQrKT8kLztcclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMSU5FX1BBVFRFUk4gPSAvXlxccyooXFxkKylcXHMrKFtcXGQuLV0rKVxccysoW1xcZC4tXSspXFxzKyhbXFxkLi1dKylcXHMrKFtcXGQuLV0rKVxccyokLztcclxuXHJcbiAgLyoqXHJcbiAgICogUGFyc2UgWU9MTyBmb3JtYXQgc3RyaW5nIGludG8gc3RydWN0dXJlZCBsYWJlbHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YTogc3RyaW5nKTogWW9sb1BhcnNlUmVzdWx0IHtcclxuICAgIGNvbnN0IHJlc3VsdDogWW9sb1BhcnNlUmVzdWx0ID0ge1xyXG4gICAgICBsYWJlbHM6IFtdLFxyXG4gICAgICBlcnJvcnM6IFtdLFxyXG4gICAgICB3YXJuaW5nczogW11cclxuICAgIH07XHJcblxyXG4gICAgaWYgKCF5b2xvRGF0YSB8fCB5b2xvRGF0YS50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZXMgPSB5b2xvRGF0YS5zcGxpdCgnXFxuJyk7XHJcbiAgICBcclxuICAgIGxpbmVzLmZvckVhY2goKGxpbmUsIGxpbmVJbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmltbWVkTGluZSA9IGxpbmUudHJpbSgpO1xyXG4gICAgICBcclxuICAgICAgLy8gU2tpcCBlbXB0eSBsaW5lcyBhbmQgY29tbWVudHNcclxuICAgICAgaWYgKHRyaW1tZWRMaW5lID09PSAnJyB8fCB0cmltbWVkTGluZS5zdGFydHNXaXRoKCcjJykpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLnBhcnNlU2luZ2xlTGluZSh0cmltbWVkTGluZSwgbGluZUluZGV4ICsgMSk7XHJcbiAgICAgICAgaWYgKGxhYmVsKSB7XHJcbiAgICAgICAgICByZXN1bHQubGFiZWxzLnB1c2gobGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBZb2xvRm9ybWF0RXJyb3IpIHtcclxuICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBVbmtub3duIHBhcnNpbmcgZXJyb3JgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCB2YWxpZGF0aW9uIHdhcm5pbmdzXHJcbiAgICB0aGlzLmFkZFZhbGlkYXRpb25XYXJuaW5ncyhyZXN1bHQpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZSBhIHNpbmdsZSBZT0xPIGZvcm1hdCBsaW5lXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VTaW5nbGVMaW5lKGxpbmU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogWW9sb0xhYmVsIHwgbnVsbCB7XHJcbiAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2godGhpcy5MSU5FX1BBVFRFUk4pO1xyXG4gICAgXHJcbiAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEludmFsaWQgWU9MTyBmb3JtYXQuIEV4cGVjdGVkOiBcImNsYXNzSWQgY2VudGVyWCBjZW50ZXJZIHdpZHRoIGhlaWdodFwiYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBbLCBjbGFzc0lkU3RyLCBjZW50ZXJYU3RyLCBjZW50ZXJZU3RyLCB3aWR0aFN0ciwgaGVpZ2h0U3RyXSA9IG1hdGNoO1xyXG5cclxuICAgIC8vIFBhcnNlIGNsYXNzIElEXHJcbiAgICBjb25zdCBjbGFzc0lkID0gcGFyc2VJbnQoY2xhc3NJZFN0ciEsIDEwKTtcclxuICAgIGlmIChpc05hTihjbGFzc0lkKSB8fCBjbGFzc0lkIDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkIGNsYXNzIElEOiBcIiR7Y2xhc3NJZFN0cn1cIi4gTXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXJzZSBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgY2VudGVyWCA9IHRoaXMucGFyc2VDb29yZGluYXRlKGNlbnRlclhTdHIhLCAnY2VudGVyWCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3QgY2VudGVyWSA9IHRoaXMucGFyc2VDb29yZGluYXRlKGNlbnRlcllTdHIhLCAnY2VudGVyWScsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLnBhcnNlQ29vcmRpbmF0ZSh3aWR0aFN0ciEsICd3aWR0aCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJzZUNvb3JkaW5hdGUoaGVpZ2h0U3RyISwgJ2hlaWdodCcsIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG5cclxuICAgIC8vIFZhbGlkYXRlIGNvb3JkaW5hdGUgcmFuZ2VzXHJcbiAgICB0aGlzLnZhbGlkYXRlQ29vcmRpbmF0ZXMoeyBjbGFzc0lkLCBjZW50ZXJYLCBjZW50ZXJZLCB3aWR0aCwgaGVpZ2h0IH0sIGxpbmVOdW1iZXIsIGxpbmUpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNsYXNzSWQsXHJcbiAgICAgIGNlbnRlclgsXHJcbiAgICAgIGNlbnRlclksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZSBhIGNvb3JkaW5hdGUgdmFsdWUgd2l0aCB2YWxpZGF0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcGFyc2VDb29yZGluYXRlKHZhbHVlOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyLCBsaW5lOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgaWYgKCF0aGlzLkNPT1JESU5BVEVfUEFUVEVSTi50ZXN0KHZhbHVlKSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkICR7bmFtZX06IFwiJHt2YWx1ZX1cIi4gTXVzdCBiZSBhIHZhbGlkIG51bWJlcmAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBJbnZhbGlkICR7bmFtZX06IFwiJHt2YWx1ZX1cIi4gQ291bGQgbm90IHBhcnNlIGFzIG51bWJlcmAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBhcnNlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlIFlPTE8gbGFiZWwgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyB2YWxpZGF0ZUNvb3JkaW5hdGVzKGxhYmVsOiBZb2xvTGFiZWwsIGxpbmVOdW1iZXI6IG51bWJlciwgbGluZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNlbnRlclgsIGNlbnRlclksIHdpZHRoLCBoZWlnaHQgfSA9IGxhYmVsO1xyXG5cclxuICAgIC8vIENoZWNrIGNvb3JkaW5hdGUgYm91bmRzIChZT0xPIHVzZXMgbm9ybWFsaXplZCBjb29yZGluYXRlcyAwLTEpXHJcbiAgICBpZiAoY2VudGVyWCA8IE1JTl9DT09SRElOQVRFIHx8IGNlbnRlclggPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBjZW50ZXJYIG91dCBvZiByYW5nZTogJHtjZW50ZXJYfS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjZW50ZXJZIDwgTUlOX0NPT1JESU5BVEUgfHwgY2VudGVyWSA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYGNlbnRlclkgb3V0IG9mIHJhbmdlOiAke2NlbnRlcll9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdpZHRoIDw9IE1JTl9TSVpFIHx8IHdpZHRoID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgd2lkdGggb3V0IG9mIHJhbmdlOiAke3dpZHRofS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoZWlnaHQgPD0gTUlOX1NJWkUgfHwgaGVpZ2h0ID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgaGVpZ2h0IG91dCBvZiByYW5nZTogJHtoZWlnaHR9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgYm91bmRpbmcgYm94IGJvdW5kc1xyXG4gICAgY29uc3QgbGVmdCA9IGNlbnRlclggLSB3aWR0aCAvIDI7XHJcbiAgICBjb25zdCByaWdodCA9IGNlbnRlclggKyB3aWR0aCAvIDI7XHJcbiAgICBjb25zdCB0b3AgPSBjZW50ZXJZIC0gaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IGJvdHRvbSA9IGNlbnRlclkgKyBoZWlnaHQgLyAyO1xyXG5cclxuICAgIGlmIChsZWZ0IDwgTUlOX0NPT1JESU5BVEUgfHwgcmlnaHQgPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBCb3VuZGluZyBib3ggZXh0ZW5kcyBvdXRzaWRlIGltYWdlIGJvdW5kcyBob3Jpem9udGFsbHkgKGxlZnQ6ICR7bGVmdH0sIHJpZ2h0OiAke3JpZ2h0fSlgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0b3AgPCBNSU5fQ09PUkRJTkFURSB8fCBib3R0b20gPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBCb3VuZGluZyBib3ggZXh0ZW5kcyBvdXRzaWRlIGltYWdlIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3A6ICR7dG9wfSwgYm90dG9tOiAke2JvdHRvbX0pYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB2YWxpZGF0aW9uIHdhcm5pbmdzIHRvIHBhcnNlIHJlc3VsdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGFkZFZhbGlkYXRpb25XYXJuaW5ncyhyZXN1bHQ6IFlvbG9QYXJzZVJlc3VsdCk6IHZvaWQge1xyXG4gICAgLy8gQ2hlY2sgZm9yIHZlcnkgc21hbGwgYm91bmRpbmcgYm94ZXNcclxuICAgIHJlc3VsdC5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGlmIChsYWJlbC53aWR0aCA8IDAuMDEgfHwgbGFiZWwuaGVpZ2h0IDwgMC4wMSkge1xyXG4gICAgICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKGBMYWJlbCAke2luZGV4ICsgMX06IFZlcnkgc21hbGwgYm91bmRpbmcgYm94ICgke2xhYmVsLndpZHRofXgke2xhYmVsLmhlaWdodH0pYCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciBkdXBsaWNhdGUgbGFiZWxzIChzYW1lIHBvc2l0aW9uIGFuZCBjbGFzcylcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIHJlc3VsdC5sYWJlbHMuZm9yRWFjaCgobGFiZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGtleSA9IGAke2xhYmVsLmNsYXNzSWR9XyR7bGFiZWwuY2VudGVyWH1fJHtsYWJlbC5jZW50ZXJZfV8ke2xhYmVsLndpZHRofV8ke2xhYmVsLmhlaWdodH1gO1xyXG4gICAgICBpZiAoc2Vlbi5oYXMoa2V5KSkge1xyXG4gICAgICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKGBMYWJlbCAke2luZGV4ICsgMX06IER1cGxpY2F0ZSBsYWJlbCBkZXRlY3RlZGApO1xyXG4gICAgICB9XHJcbiAgICAgIHNlZW4uYWRkKGtleSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgbGFiZWxzIGFycmF5IHRvIFlPTE8gZm9ybWF0IHN0cmluZ1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVsczogWW9sb0xhYmVsW10sIG9wdGlvbnM6IFlvbG9FeHBvcnRPcHRpb25zID0ge30pOiBzdHJpbmcge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBwcmVjaXNpb24gPSBERUZBVUxUX1BSRUNJU0lPTixcclxuICAgICAgaW5jbHVkZUNvbW1lbnRzID0gZmFsc2UsXHJcbiAgICAgIHZhbGlkYXRlQm91bmRzID0gdHJ1ZVxyXG4gICAgfSA9IG9wdGlvbnM7XHJcblxyXG4gICAgaWYgKCFsYWJlbHMgfHwgbGFiZWxzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgaWYgKGluY2x1ZGVDb21tZW50cykge1xyXG4gICAgICBsaW5lcy5wdXNoKCcjIFlPTE8gZm9ybWF0OiBjbGFzc0lkIGNlbnRlclggY2VudGVyWSB3aWR0aCBoZWlnaHQgKG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXMpJyk7XHJcbiAgICAgIGxpbmVzLnB1c2goYCMgR2VuZXJhdGVkOiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1gKTtcclxuICAgICAgbGluZXMucHVzaCgnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGFiZWxzLmZvckVhY2goKGxhYmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICBpZiAodmFsaWRhdGVCb3VuZHMgJiYgIXRoaXMudmFsaWRhdGVZb2xvTGFiZWwobGFiZWwpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihgSW52YWxpZCBsYWJlbCBhdCBpbmRleCAke2luZGV4fTogY29vcmRpbmF0ZXMgb3V0IG9mIGJvdW5kc2ApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBsaW5lID0gW1xyXG4gICAgICAgIGxhYmVsLmNsYXNzSWQudG9TdHJpbmcoKSxcclxuICAgICAgICBsYWJlbC5jZW50ZXJYLnRvRml4ZWQocHJlY2lzaW9uKSxcclxuICAgICAgICBsYWJlbC5jZW50ZXJZLnRvRml4ZWQocHJlY2lzaW9uKSxcclxuICAgICAgICBsYWJlbC53aWR0aC50b0ZpeGVkKHByZWNpc2lvbiksXHJcbiAgICAgICAgbGFiZWwuaGVpZ2h0LnRvRml4ZWQocHJlY2lzaW9uKVxyXG4gICAgICBdLmpvaW4oJyAnKTtcclxuXHJcbiAgICAgIGxpbmVzLnB1c2gobGluZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWYWxpZGF0ZSBhIHNpbmdsZSBZT0xPIGxhYmVsXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyB2YWxpZGF0ZVlvbG9MYWJlbChsYWJlbDogWW9sb0xhYmVsKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnZhbGlkYXRlQ29vcmRpbmF0ZXMobGFiZWwsIDAsICcnKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBwaXhlbCBjb29yZGluYXRlcyB0byBZT0xPIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHBpeGVsVG9Ob3JtYWxpemVkKFxyXG4gICAgcGl4ZWxYOiBudW1iZXIsXHJcbiAgICBwaXhlbFk6IG51bWJlcixcclxuICAgIHBpeGVsV2lkdGg6IG51bWJlcixcclxuICAgIHBpeGVsSGVpZ2h0OiBudW1iZXIsXHJcbiAgICBpbWFnZVdpZHRoOiBudW1iZXIsXHJcbiAgICBpbWFnZUhlaWdodDogbnVtYmVyXHJcbiAgKTogWW9sb0xhYmVsIHtcclxuICAgIGNvbnN0IGNlbnRlclggPSAocGl4ZWxYICsgcGl4ZWxXaWR0aCAvIDIpIC8gaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IGNlbnRlclkgPSAocGl4ZWxZICsgcGl4ZWxIZWlnaHQgLyAyKSAvIGltYWdlSGVpZ2h0O1xyXG4gICAgY29uc3Qgd2lkdGggPSBwaXhlbFdpZHRoIC8gaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHBpeGVsSGVpZ2h0IC8gaW1hZ2VIZWlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY2xhc3NJZDogMCwgLy8gV2lsbCBiZSBzZXQgYnkgY2FsbGVyXHJcbiAgICAgIGNlbnRlclgsXHJcbiAgICAgIGNlbnRlclksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IFlPTE8gbm9ybWFsaXplZCBjb29yZGluYXRlcyB0byBwaXhlbCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbm9ybWFsaXplZFRvUGl4ZWwoXHJcbiAgICBsYWJlbDogWW9sb0xhYmVsLFxyXG4gICAgaW1hZ2VXaWR0aDogbnVtYmVyLFxyXG4gICAgaW1hZ2VIZWlnaHQ6IG51bWJlclxyXG4gICk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0ge1xyXG4gICAgY29uc3Qgd2lkdGggPSBsYWJlbC53aWR0aCAqIGltYWdlV2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBsYWJlbC5oZWlnaHQgKiBpbWFnZUhlaWdodDtcclxuICAgIGNvbnN0IHggPSAobGFiZWwuY2VudGVyWCAqIGltYWdlV2lkdGgpIC0gKHdpZHRoIC8gMik7XHJcbiAgICBjb25zdCB5ID0gKGxhYmVsLmNlbnRlclkgKiBpbWFnZUhlaWdodCkgLSAoaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgcmV0dXJuIHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHN0YXRpc3RpY3MgYWJvdXQgYSBzZXQgb2YgbGFiZWxzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRMYWJlbFN0YXRpc3RpY3MobGFiZWxzOiBZb2xvTGFiZWxbXSk6IHtcclxuICAgIHRvdGFsTGFiZWxzOiBudW1iZXI7XHJcbiAgICBjbGFzc0Rpc3RyaWJ1dGlvbjogUmVjb3JkPG51bWJlciwgbnVtYmVyPjtcclxuICAgIGF2ZXJhZ2VTaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgICBzaXplUmFuZ2U6IHtcclxuICAgICAgbWluOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgICAgIG1heDogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xyXG4gICAgfTtcclxuICB9IHtcclxuICAgIGlmICghbGFiZWxzIHx8IGxhYmVscy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0b3RhbExhYmVsczogMCxcclxuICAgICAgICBjbGFzc0Rpc3RyaWJ1dGlvbjoge30sXHJcbiAgICAgICAgYXZlcmFnZVNpemU6IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9LFxyXG4gICAgICAgIHNpemVSYW5nZToge1xyXG4gICAgICAgICAgbWluOiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSxcclxuICAgICAgICAgIG1heDogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2xhc3NEaXN0cmlidXRpb246IFJlY29yZDxudW1iZXIsIG51bWJlcj4gPSB7fTtcclxuICAgIGxldCB0b3RhbFdpZHRoID0gMDtcclxuICAgIGxldCB0b3RhbEhlaWdodCA9IDA7XHJcbiAgICBsZXQgbWluV2lkdGggPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgbGV0IG1heFdpZHRoID0gTnVtYmVyLk1JTl9WQUxVRTtcclxuICAgIGxldCBtaW5IZWlnaHQgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgbGV0IG1heEhlaWdodCA9IE51bWJlci5NSU5fVkFMVUU7XHJcblxyXG4gICAgbGFiZWxzLmZvckVhY2gobGFiZWwgPT4ge1xyXG4gICAgICAvLyBDbGFzcyBkaXN0cmlidXRpb25cclxuICAgICAgY2xhc3NEaXN0cmlidXRpb25bbGFiZWwuY2xhc3NJZF0gPSAoY2xhc3NEaXN0cmlidXRpb25bbGFiZWwuY2xhc3NJZF0gfHwgMCkgKyAxO1xyXG5cclxuICAgICAgLy8gU2l6ZSBzdGF0aXN0aWNzXHJcbiAgICAgIHRvdGFsV2lkdGggKz0gbGFiZWwud2lkdGg7XHJcbiAgICAgIHRvdGFsSGVpZ2h0ICs9IGxhYmVsLmhlaWdodDtcclxuICAgICAgbWluV2lkdGggPSBNYXRoLm1pbihtaW5XaWR0aCwgbGFiZWwud2lkdGgpO1xyXG4gICAgICBtYXhXaWR0aCA9IE1hdGgubWF4KG1heFdpZHRoLCBsYWJlbC53aWR0aCk7XHJcbiAgICAgIG1pbkhlaWdodCA9IE1hdGgubWluKG1pbkhlaWdodCwgbGFiZWwuaGVpZ2h0KTtcclxuICAgICAgbWF4SGVpZ2h0ID0gTWF0aC5tYXgobWF4SGVpZ2h0LCBsYWJlbC5oZWlnaHQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG90YWxMYWJlbHM6IGxhYmVscy5sZW5ndGgsXHJcbiAgICAgIGNsYXNzRGlzdHJpYnV0aW9uLFxyXG4gICAgICBhdmVyYWdlU2l6ZToge1xyXG4gICAgICAgIHdpZHRoOiB0b3RhbFdpZHRoIC8gbGFiZWxzLmxlbmd0aCxcclxuICAgICAgICBoZWlnaHQ6IHRvdGFsSGVpZ2h0IC8gbGFiZWxzLmxlbmd0aFxyXG4gICAgICB9LFxyXG4gICAgICBzaXplUmFuZ2U6IHtcclxuICAgICAgICBtaW46IHsgd2lkdGg6IG1pbldpZHRoLCBoZWlnaHQ6IG1pbkhlaWdodCB9LFxyXG4gICAgICAgIG1heDogeyB3aWR0aDogbWF4V2lkdGgsIGhlaWdodDogbWF4SGVpZ2h0IH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVXRpbGl0eSBGdW5jdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuLyoqXHJcbiAqIFF1aWNrIHBhcnNlIGZ1bmN0aW9uIGZvciBzaW1wbGUgdXNlIGNhc2VzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VZb2xvKHlvbG9EYXRhOiBzdHJpbmcpOiBZb2xvTGFiZWxbXSB7XHJcbiAgY29uc3QgcmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gIGlmIChyZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDApIHtcclxuICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoYFlPTE8gcGFyc2luZyBmYWlsZWQ6ICR7cmVzdWx0LmVycm9ycy5qb2luKCcsICcpfWApO1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0LmxhYmVscztcclxufVxyXG5cclxuLyoqXHJcbiAqIFF1aWNrIGV4cG9ydCBmdW5jdGlvbiBmb3Igc2ltcGxlIHVzZSBjYXNlc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydFlvbG8obGFiZWxzOiBZb2xvTGFiZWxbXSwgcHJlY2lzaW9uOiBudW1iZXIgPSBERUZBVUxUX1BSRUNJU0lPTik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIFlvbG9QYXJzZXIubGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVscywgeyBwcmVjaXNpb24gfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZSBZT0xPIHN0cmluZyB3aXRob3V0IHBhcnNpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IHsgaXNWYWxpZDogYm9vbGVhbjsgZXJyb3JzOiBzdHJpbmdbXSB9IHtcclxuICBjb25zdCByZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGlzVmFsaWQ6IHJlc3VsdC5lcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgZXJyb3JzOiByZXN1bHQuZXJyb3JzXHJcbiAgfTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgWW9sb1BhcnNlcjsiLCIvKipcclxuICogRmlsZVN5c3RlbSBTZXJ2aWNlIEltcGxlbWVudGF0aW9uXHJcbiAqIFxyXG4gKiBIYW5kbGVzIGFsbCBmaWxlIEkvTyBvcGVyYXRpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogUHJvdmlkZXMgYWJzdHJhY3Rpb24gb3ZlciBGaWxlIFN5c3RlbSBBY2Nlc3MgQVBJIGFuZCBZT0xPIGZvcm1hdCBwcm9jZXNzaW5nLlxyXG4gKiBcclxuICogQHZlcnNpb24gMS4wLjBcclxuICogQGF1dGhvciBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgXHJcbiAgSUZpbGVTeXN0ZW1TZXJ2aWNlLFxyXG4gIEZpbGVPcGVyYXRpb25SZXN1bHQsXHJcbiAgRmlsZUxvYWRSZXN1bHQsXHJcbiAgWW9sb0xhYmVsLFxyXG4gIFlvbG9QYXJzZVJlc3VsdCxcclxuICBZb2xvRXhwb3J0T3B0aW9ucyxcclxuICBDbGFzc0ZpbGVDb250ZW50LFxyXG4gIENsYXNzRmlsZVZhbGlkYXRpb24sXHJcbiAgRm9sZGVyU2NhblJlc3VsdCxcclxuICBMYWJlbFN0YXR1cyxcclxuICBJbWFnZUluZm8sXHJcbiAgSW1hZ2VMb2FkT3B0aW9ucyxcclxuICBUaWZmUHJvY2Vzc2luZ09wdGlvbnMsXHJcbiAgQ2FjaGVFbnRyeSxcclxuICBDYWNoZVN0YXRzLFxyXG4gIEZpbGVTeXN0ZW1Db25maWcsXHJcbiAgRmlsZVN5c3RlbUV2ZW50LFxyXG4gIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXIsXHJcbiAgRmlsZVN5c3RlbUVycm9yLFxyXG4gIEltYWdlTG9hZEVycm9yLFxyXG4gIEZpbGVGb3JtYXQsXHJcbiAgQ2xhc3NGaWxlRm9ybWF0XHJcbn0gZnJvbSAnLi4vdHlwZXMvZmlsZXN5c3RlbSc7XHJcblxyXG5pbXBvcnQgeyBcclxuICBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBcclxuICBGaWxlU3lzdGVtRmlsZUhhbmRsZSBcclxufSBmcm9tICcuLi90eXBlcyc7XHJcblxyXG5pbXBvcnQgeyBcclxuICBJbWFnZUZpbGUsIFxyXG4gIENsYXNzRmlsZSwgXHJcbiAgQ2xhc3NEZWZpbml0aW9uIFxyXG59IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcblxyXG5pbXBvcnQgeyBZb2xvUGFyc2VyIH0gZnJvbSAnLi4vdXRpbHMveW9sby1wYXJzZXInO1xyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGaWxlU3lzdGVtIFNlcnZpY2UgSW1wbGVtZW50YXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVTeXN0ZW1TZXJ2aWNlIGltcGxlbWVudHMgSUZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICBwcml2YXRlIGNvbmZpZzogRmlsZVN5c3RlbUNvbmZpZztcclxuICBwcml2YXRlIGltYWdlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ2FjaGVFbnRyeTxIVE1MSW1hZ2VFbGVtZW50Pj4oKTtcclxuICBwcml2YXRlIGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXJbXT4oKTtcclxuICBcclxuICAvLyBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBERUZBVUxUX0NPTkZJRzogRmlsZVN5c3RlbUNvbmZpZyA9IHtcclxuICAgIHN1cHBvcnRlZEltYWdlRm9ybWF0czogWydqcGcnLCAnanBlZycsICdwbmcnLCAnZ2lmJywgJ3RpZicsICd0aWZmJywgJ3dlYnAnXSxcclxuICAgIG1heEltYWdlU2l6ZTogNTAgKiAxMDI0ICogMTAyNCwgLy8gNTBNQlxyXG4gICAgdGh1bWJuYWlsU2l6ZTogeyB3aWR0aDogMTUwLCBoZWlnaHQ6IDE1MCB9LFxyXG4gICAgbWF4Q2FjaGVTaXplOiAxMDAgKiAxMDI0ICogMTAyNCwgLy8gMTAwTUJcclxuICAgIGNhY2hlVGltZW91dDogMzAgKiA2MCAqIDEwMDAsIC8vIDMwIG1pbnV0ZXNcclxuICAgIHlvbG9WYWxpZGF0aW9uOiB7XHJcbiAgICAgIHN0cmljdEJvdW5kczogdHJ1ZSxcclxuICAgICAgYWxsb3daZXJvU2l6ZTogZmFsc2UsXHJcbiAgICAgIHByZWNpc2lvbjogNlxyXG4gICAgfSxcclxuICAgIGJhdGNoU2l6ZTogMTAsXHJcbiAgICBjb25jdXJyZW50TG9hZHM6IDMsXHJcbiAgICBwcmVsb2FkQWRqYWNlbnQ6IHRydWVcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uRmlsZVN5c3RlbVNlcnZpY2UuREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZvbGRlciBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2VsZWN0SW1hZ2VGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmb2xkZXJIYW5kbGUgPSBhd2FpdCAod2luZG93IGFzIGFueSkuc2hvd0RpcmVjdG9yeVBpY2tlcigpO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZm9sZGVyOmltYWdlLXNlbGVjdGVkJyxcclxuICAgICAgICBkYXRhOiB7IG5hbWU6IGZvbGRlckhhbmRsZS5uYW1lIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGZvbGRlckhhbmRsZSxcclxuICAgICAgICBtZXNzYWdlOiBgSW1hZ2UgZm9sZGVyIHNlbGVjdGVkOiAke2ZvbGRlckhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2VsZWN0aW9uIGNhbmNlbGxlZCcgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzZWxlY3QgaW1hZ2UgZm9sZGVyOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzZWxlY3RMYWJlbEZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvbGRlckhhbmRsZSA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmb2xkZXI6bGFiZWwtc2VsZWN0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgbmFtZTogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZm9sZGVySGFuZGxlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBMYWJlbCBmb2xkZXIgc2VsZWN0ZWQ6ICR7Zm9sZGVySGFuZGxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdTZWxlY3Rpb24gY2FuY2VsbGVkJyB9O1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNlbGVjdCBsYWJlbCBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNlbGVjdENsYXNzSW5mb0ZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvbGRlckhhbmRsZSA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmb2xkZXI6Y2xhc3MtaW5mby1zZWxlY3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBuYW1lOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBmb2xkZXJIYW5kbGUsXHJcbiAgICAgICAgbWVzc2FnZTogYENsYXNzIGluZm8gZm9sZGVyIHNlbGVjdGVkOiAke2ZvbGRlckhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnU2VsZWN0aW9uIGNhbmNlbGxlZCcgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzZWxlY3QgY2xhc3MgaW5mbyBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZpbGUgTGlzdGluZyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbGlzdEltYWdlRmlsZXMoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEltYWdlRmlsZVtdPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgaW1hZ2VGaWxlczogSW1hZ2VGaWxlW10gPSBbXTtcclxuICAgICAgY29uc3Qgc3VwcG9ydGVkRm9ybWF0cyA9IHRoaXMuY29uZmlnLnN1cHBvcnRlZEltYWdlRm9ybWF0cy5tYXAoZiA9PiBmLnRvTG93ZXJDYXNlKCkpO1xyXG5cclxuICAgICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiAoZm9sZGVySGFuZGxlIGFzIGFueSkudmFsdWVzKCkpIHtcclxuICAgICAgICBpZiAoZW50cnkua2luZCA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgICAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZW50cnkubmFtZSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChzdXBwb3J0ZWRGb3JtYXRzLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VGaWxlOiBJbWFnZUZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBoYW5kbGU6IGVudHJ5LFxyXG4gICAgICAgICAgICAgIHBhdGg6IGVudHJ5Lm5hbWUsIC8vIE5vdGU6IEZ1bGwgcGF0aCBub3QgYXZhaWxhYmxlIGluIEZpbGUgU3lzdGVtIEFjY2VzcyBBUElcclxuICAgICAgICAgICAgICBleHRlbnNpb24sXHJcbiAgICAgICAgICAgICAgc2l6ZTogdW5kZWZpbmVkLCAvLyBXaWxsIGJlIGxvYWRlZCB3aGVuIG5lZWRlZFxyXG4gICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogdW5kZWZpbmVkIC8vIFdpbGwgYmUgbG9hZGVkIHdoZW4gbmVlZGVkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGltYWdlRmlsZXMucHVzaChpbWFnZUZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU29ydCBmaWxlcyBuYXR1cmFsbHkgKGhhbmRsZXMgbnVtYmVycyBjb3JyZWN0bHkpXHJcbiAgICAgIGltYWdlRmlsZXMuc29ydCgoYSwgYikgPT4gXHJcbiAgICAgICAgYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSwgc2Vuc2l0aXZpdHk6ICdiYXNlJyB9KVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZmlsZXM6aW1hZ2VzLWxpc3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogaW1hZ2VGaWxlcy5sZW5ndGgsIGZvbGRlcjogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW1hZ2VGaWxlcyxcclxuICAgICAgICBtZXNzYWdlOiBgRm91bmQgJHtpbWFnZUZpbGVzLmxlbmd0aH0gaW1hZ2UgZmlsZXNgXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxpc3QgaW1hZ2UgZmlsZXM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxpc3RDbGFzc0ZpbGVzKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxDbGFzc0ZpbGVbXT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGNsYXNzRmlsZXM6IENsYXNzRmlsZVtdID0gW107XHJcbiAgICAgIGNvbnN0IHN1cHBvcnRlZEZvcm1hdHMgPSBbJ3lhbWwnLCAneW1sJ107XHJcblxyXG4gICAgICBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIChmb2xkZXJIYW5kbGUgYXMgYW55KS52YWx1ZXMoKSkge1xyXG4gICAgICAgIGlmIChlbnRyeS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKHN1cHBvcnRlZEZvcm1hdHMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICAvLyBMb2FkIGNsYXNzIGZpbGUgY29udGVudFxyXG4gICAgICAgICAgICBjb25zdCBjb250ZW50UmVzdWx0ID0gYXdhaXQgdGhpcy5sb2FkQ2xhc3NGaWxlKGVudHJ5KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzRmlsZTogQ2xhc3NGaWxlID0ge1xyXG4gICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgaGFuZGxlOiBlbnRyeSxcclxuICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50UmVzdWx0LnN1Y2Nlc3MgPyBjb250ZW50UmVzdWx0LmRhdGEhLmNsYXNzZXMgOiBbXSxcclxuICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjbGFzc0ZpbGVzLnB1c2goY2xhc3NGaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ZpbGVzOmNsYXNzZXMtbGlzdGVkJyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBjbGFzc0ZpbGVzLmxlbmd0aCwgZm9sZGVyOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBjbGFzc0ZpbGVzLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBGb3VuZCAke2NsYXNzRmlsZXMubGVuZ3RofSBjbGFzcyBmaWxlc2BcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbGlzdCBjbGFzcyBmaWxlczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2NhbkZvbGRlcihmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Rm9sZGVyU2NhblJlc3VsdD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdDogRm9sZGVyU2NhblJlc3VsdCA9IHtcclxuICAgICAgICBpbWFnZUZpbGVzOiBbXSxcclxuICAgICAgICBsYWJlbEZpbGVzOiBbXSxcclxuICAgICAgICBjbGFzc0ZpbGVzOiBbXSxcclxuICAgICAgICB0b3RhbEZpbGVzOiAwLFxyXG4gICAgICAgIGVycm9yczogW11cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgKGZvbGRlckhhbmRsZSBhcyBhbnkpLnZhbHVlcygpKSB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgcmVzdWx0LnRvdGFsRmlsZXMrKztcclxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5zdXBwb3J0ZWRJbWFnZUZvcm1hdHMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZUZpbGU6IEltYWdlRmlsZSA9IHtcclxuICAgICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxyXG4gICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgcGF0aDogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBleHRlbnNpb25cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmVzdWx0LmltYWdlRmlsZXMucHVzaChpbWFnZUZpbGUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChleHRlbnNpb24gPT09ICd0eHQnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5sYWJlbEZpbGVzLnB1c2goZW50cnkubmFtZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKFsneWFtbCcsICd5bWwnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudFJlc3VsdCA9IGF3YWl0IHRoaXMubG9hZENsYXNzRmlsZShlbnRyeSk7XHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnRSZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NGaWxlOiBDbGFzc0ZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRSZXN1bHQuZGF0YSEuY2xhc3NlcyxcclxuICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuY2xhc3NGaWxlcy5wdXNoKGNsYXNzRmlsZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgRmFpbGVkIHRvIGxvYWQgY2xhc3MgZmlsZSAke2VudHJ5Lm5hbWV9OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogcmVzdWx0LFxyXG4gICAgICAgIG1lc3NhZ2U6IGBTY2FubmVkICR7cmVzdWx0LnRvdGFsRmlsZXN9IGZpbGVzYFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzY2FuIGZvbGRlcjogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+IHtcbiAgICB0cnkge1xuICAgICAgLy8gVElGRiBoYW5kbGluZzogZGVsZWdhdGUgdG8gVElGRiBsb2FkZXIgaWYgbmVlZGVkXG4gICAgICBjb25zdCBleHQgPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZmlsZUhhbmRsZS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGV4dCA9PT0gJ3RpZicgfHwgZXh0ID09PSAndGlmZicpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMubG9hZFRpZmZJbWFnZShmaWxlSGFuZGxlKTtcbiAgICAgIH1cbiAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XHJcbiAgICAgIGNvbnN0IGNhY2hlS2V5ID0gYCR7ZmlsZUhhbmRsZS5uYW1lfWA7XHJcbiAgICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMuaW1hZ2VDYWNoZS5nZXQoY2FjaGVLZXkpO1xyXG4gICAgICBcclxuICAgICAgaWYgKGNhY2hlZCAmJiB0aGlzLmlzQ2FjaGVWYWxpZChjYWNoZWQpKSB7XHJcbiAgICAgICAgY2FjaGVkLmhpdHMrKztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IGNhY2hlZC5kYXRhLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ0xvYWRlZCBmcm9tIGNhY2hlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGZpbGUgc2l6ZVxyXG4gICAgICBpZiAoZmlsZS5zaXplID4gdGhpcy5jb25maWcubWF4SW1hZ2VTaXplKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEltYWdlTG9hZEVycm9yKGBJbWFnZSB0b28gbGFyZ2U6ICR7ZmlsZS5zaXplfSBieXRlcyAobWF4OiAke3RoaXMuY29uZmlnLm1heEltYWdlU2l6ZX0pYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGltZyA9IGF3YWl0IHRoaXMuY3JlYXRlSW1hZ2VGcm9tRmlsZShmaWxlLCBvcHRpb25zKTtcbiAgICAgIFxyXG4gICAgICAvLyBDYWNoZSB0aGUgaW1hZ2VcclxuICAgICAgdGhpcy5jYWNoZUltYWdlKGNhY2hlS2V5LCBpbWcsIGZpbGUuc2l6ZSk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdpbWFnZTpsb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGUubmFtZSwgc2l6ZTogZmlsZS5zaXplIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGltZyxcclxuICAgICAgICBtZXNzYWdlOiBgSW1hZ2UgbG9hZGVkOiAke2ZpbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRUaWZmSW1hZ2UoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIG9wdGlvbnM/OiBUaWZmUHJvY2Vzc2luZ09wdGlvbnMpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SFRNTEltYWdlRWxlbWVudD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFVzZSBkeW5hbWljIGltcG9ydCBmb3IgVElGRi5qcyAobG9hZGVkIGZyb20gQ0ROKVxyXG4gICAgICBpZiAodHlwZW9mICh3aW5kb3cgYXMgYW55KS5UaWZmID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRocm93IG5ldyBJbWFnZUxvYWRFcnJvcignVElGRi5qcyBsaWJyYXJ5IG5vdCBsb2FkZWQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBmaWxlLmFycmF5QnVmZmVyKCk7XHJcbiAgICAgIGNvbnN0IHRpZmYgPSBuZXcgKHdpbmRvdyBhcyBhbnkpLlRpZmYoeyBidWZmZXI6IGFycmF5QnVmZmVyIH0pO1xyXG4gICAgICBjb25zdCBjYW52YXMgPSB0aWZmLnRvQ2FudmFzKCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKCk7XHJcbiAgICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEltYWdlTG9hZEVycm9yKCdGYWlsZWQgdG8gY29udmVydCBUSUZGIGNhbnZhcyB0byBpbWFnZScpKTtcclxuICAgICAgICBpbWcuc3JjID0gY2FudmFzLnRvRGF0YVVSTCgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ltYWdlOnRpZmYtbG9hZGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaWxlLm5hbWUsIHNpemU6IGZpbGUuc2l6ZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBpbWcsXHJcbiAgICAgICAgbWVzc2FnZTogYFRJRkYgaW1hZ2UgbG9hZGVkOiAke2ZpbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxvYWQgVElGRiBpbWFnZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgZ2V0SW1hZ2VJbmZvKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEltYWdlSW5mbz4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgY29uc3QgaW1nID0gYXdhaXQgdGhpcy5jcmVhdGVJbWFnZUZyb21GaWxlKGZpbGUpO1xyXG5cclxuICAgICAgY29uc3QgaW5mbzogSW1hZ2VJbmZvID0ge1xyXG4gICAgICAgIG5hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICB3aWR0aDogaW1nLm5hdHVyYWxXaWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGltZy5uYXR1cmFsSGVpZ2h0LFxyXG4gICAgICAgIHNpemU6IGZpbGUuc2l6ZSxcclxuICAgICAgICBmb3JtYXQ6IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihmaWxlLm5hbWUpLFxyXG4gICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoZmlsZS5sYXN0TW9kaWZpZWQpXHJcbiAgICAgIH07XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW5mbyxcclxuICAgICAgICBtZXNzYWdlOiBgSW1hZ2UgaW5mbyByZXRyaWV2ZWQ6ICR7ZmlsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IGltYWdlIGluZm86ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExhYmVsIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhc3luYyBsb2FkTGFiZWxzKGZpbGVOYW1lOiBzdHJpbmcsIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxZb2xvTGFiZWxbXT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZU5hbWUgPSB0aGlzLmdldExhYmVsRmlsZU5hbWUoZmlsZU5hbWUpO1xyXG4gICAgICBjb25zdCBsYWJlbEZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShsYWJlbEZpbGVOYW1lKTtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGxhYmVsRmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgIGNvbnN0IHlvbG9EYXRhID0gYXdhaXQgZmlsZS50ZXh0KCk7XHJcblxyXG4gICAgICBpZiAoIXlvbG9EYXRhLnRyaW0oKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICBtZXNzYWdlOiAnTm8gbGFiZWxzIGZvdW5kJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBhcnNlUmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gICAgICBcclxuICAgICAgaWYgKHBhcnNlUmVzdWx0LmVycm9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6IGBZT0xPIHBhcnNpbmcgZXJyb3JzOiAke3BhcnNlUmVzdWx0LmVycm9ycy5qb2luKCcsICcpfWBcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdsYWJlbHM6bG9hZGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lLCBsYWJlbENvdW50OiBwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RoIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IHBhcnNlUmVzdWx0LmxhYmVscyxcclxuICAgICAgICBtZXNzYWdlOiBgTG9hZGVkICR7cGFyc2VSZXN1bHQubGFiZWxzLmxlbmd0aH0gbGFiZWxzYFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdObyBsYWJlbCBmaWxlIGZvdW5kJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbG9hZCBsYWJlbHM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNhdmVMYWJlbHMoZmlsZU5hbWU6IHN0cmluZywgbGFiZWxzOiBZb2xvTGFiZWxbXSwgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBsYWJlbEZpbGVOYW1lID0gdGhpcy5nZXRMYWJlbEZpbGVOYW1lKGZpbGVOYW1lKTtcclxuICAgICAgY29uc3QgeW9sb1N0cmluZyA9IFlvbG9QYXJzZXIubGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVscywge1xyXG4gICAgICAgIHByZWNpc2lvbjogdGhpcy5jb25maWcueW9sb1ZhbGlkYXRpb24ucHJlY2lzaW9uLFxyXG4gICAgICAgIHZhbGlkYXRlQm91bmRzOiB0aGlzLmNvbmZpZy55b2xvVmFsaWRhdGlvbi5zdHJpY3RCb3VuZHNcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBmaWxlSGFuZGxlID0gYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUobGFiZWxGaWxlTmFtZSwgeyBjcmVhdGU6IHRydWUgfSk7XHJcbiAgICAgIGNvbnN0IHdyaXRhYmxlID0gYXdhaXQgZmlsZUhhbmRsZS5jcmVhdGVXcml0YWJsZSgpO1xyXG4gICAgICBhd2FpdCB3cml0YWJsZS53cml0ZSh5b2xvU3RyaW5nLnRyaW0oKSk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdsYWJlbHM6c2F2ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWUsIGxhYmVsQ291bnQ6IGxhYmVscy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgbWVzc2FnZTogYExhYmVscyBzYXZlZCB0byAke2xhYmVsRmlsZU5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBzYXZlIGxhYmVsczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgY2hlY2tMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8TGFiZWxTdGF0dXM+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBsYWJlbEZpbGVOYW1lID0gdGhpcy5nZXRMYWJlbEZpbGVOYW1lKGZpbGVOYW1lKTtcclxuICAgICAgXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbGFiZWxGaWxlSGFuZGxlID0gYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUobGFiZWxGaWxlTmFtZSk7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGxhYmVsRmlsZUhhbmRsZS5nZXRGaWxlKCk7XHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZpbGUudGV4dCgpO1xyXG4gICAgICAgIGNvbnN0IHBhcnNlUmVzdWx0ID0gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoY29udGVudCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXR1czogTGFiZWxTdGF0dXMgPSB7XHJcbiAgICAgICAgICBmaWxlTmFtZSxcclxuICAgICAgICAgIGhhc0xhYmVsczogcGFyc2VSZXN1bHQubGFiZWxzLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICBsYWJlbENvdW50OiBwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RoLFxyXG4gICAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IHN0YXR1cyxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBMYWJlbCBzdGF0dXMgY2hlY2tlZDogJHtmaWxlTmFtZX1gXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcclxuICAgICAgICAgIGNvbnN0IHN0YXR1czogTGFiZWxTdGF0dXMgPSB7XHJcbiAgICAgICAgICAgIGZpbGVOYW1lLFxyXG4gICAgICAgICAgICBoYXNMYWJlbHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYWJlbENvdW50OiAwXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IHN0YXR1cyxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ05vIGxhYmVsIGZpbGUgZm91bmQnXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjaGVjayBsYWJlbCBzdGF0dXM6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENsYXNzIEZpbGUgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRDbGFzc0ZpbGUoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Q2xhc3NGaWxlQ29udGVudD4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBmaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZpbGUudGV4dCgpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgdmFsaWRhdGlvbiA9IHRoaXMudmFsaWRhdGVDbGFzc0ZpbGUoY29udGVudCk7XHJcbiAgICAgIGlmICghdmFsaWRhdGlvbi5pc1ZhbGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6IGBJbnZhbGlkIGNsYXNzIGZpbGU6ICR7dmFsaWRhdGlvbi5lcnJvcnMuam9pbignLCAnKX1gXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY2xhc3NlczogQ2xhc3NEZWZpbml0aW9uW10gPSBbXTtcclxuICAgICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcclxuICAgICAgXHJcbiAgICAgIGxpbmVzLmZvckVhY2gobGluZSA9PiB7XHJcbiAgICAgICAgY29uc3QgdHJpbW1lZExpbmUgPSBsaW5lLnRyaW0oKTtcclxuICAgICAgICBpZiAodHJpbW1lZExpbmUuc3RhcnRzV2l0aCgnIycpIHx8IHRyaW1tZWRMaW5lID09PSAnJykgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBwYXJ0cyA9IHRyaW1tZWRMaW5lLnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICBjb25zdCBpZCA9IHBhcnNlSW50KHBhcnRzWzBdIS50cmltKCksIDEwKTtcclxuICAgICAgICAgIGNvbnN0IG5hbWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc6JykudHJpbSgpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAoIWlzTmFOKGlkKSAmJiBuYW1lKSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgaWQsXHJcbiAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgIGNvbG9yOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGNsYXNzRmlsZUNvbnRlbnQ6IENsYXNzRmlsZUNvbnRlbnQgPSB7XHJcbiAgICAgICAgY2xhc3NlcyxcclxuICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoZmlsZS5sYXN0TW9kaWZpZWQpLFxyXG4gICAgICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKGZpbGUubGFzdE1vZGlmaWVkKVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzZXM6bG9hZGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaWxlLm5hbWUsIGNsYXNzQ291bnQ6IGNsYXNzZXMubGVuZ3RoIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGNsYXNzRmlsZUNvbnRlbnQsXHJcbiAgICAgICAgbWVzc2FnZTogYExvYWRlZCAke2NsYXNzZXMubGVuZ3RofSBjbGFzc2VzIGZyb20gJHtmaWxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsb2FkIGNsYXNzIGZpbGU6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNhdmVDbGFzc0ZpbGUoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIGNvbnRlbnQ6IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFNvcnQgY2xhc3NlcyBieSBJRFxyXG4gICAgICBjb25zdCBzb3J0ZWRDbGFzc2VzID0gWy4uLmNvbnRlbnQuY2xhc3Nlc10uc29ydCgoYSwgYikgPT4gYS5pZCAtIGIuaWQpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgbGluZXMgPSBzb3J0ZWRDbGFzc2VzLm1hcChjbHMgPT4gYCR7Y2xzLmlkfTogJHtjbHMubmFtZX1gKTtcclxuICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBsaW5lcy5qb2luKCdcXG4nKTtcclxuXHJcbiAgICAgIGNvbnN0IHdyaXRhYmxlID0gYXdhaXQgZmlsZUhhbmRsZS5jcmVhdGVXcml0YWJsZSgpO1xyXG4gICAgICBhd2FpdCB3cml0YWJsZS53cml0ZShmaWxlQ29udGVudCk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLmNsb3NlKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGFzc2VzOnNhdmVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaWxlSGFuZGxlLm5hbWUsIGNsYXNzQ291bnQ6IGNvbnRlbnQuY2xhc3Nlcy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgbWVzc2FnZTogYFNhdmVkICR7Y29udGVudC5jbGFzc2VzLmxlbmd0aH0gY2xhc3NlcyB0byAke2ZpbGVIYW5kbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNhdmUgY2xhc3MgZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgY3JlYXRlQ2xhc3NGaWxlKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSwgZmlsZU5hbWU6IHN0cmluZywgaW5pdGlhbENvbnRlbnQ/OiBDbGFzc0ZpbGVDb250ZW50KTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1GaWxlSGFuZGxlPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gRW5zdXJlIC55YW1sIGV4dGVuc2lvblxyXG4gICAgICBjb25zdCBmaW5hbEZpbGVOYW1lID0gZmlsZU5hbWUuZW5kc1dpdGgoJy55YW1sJykgfHwgZmlsZU5hbWUuZW5kc1dpdGgoJy55bWwnKSBcclxuICAgICAgICA/IGZpbGVOYW1lIFxyXG4gICAgICAgIDogYCR7ZmlsZU5hbWV9LnlhbWxgO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBhbHJlYWR5IGV4aXN0c1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGZvbGRlckhhbmRsZS5nZXRGaWxlSGFuZGxlKGZpbmFsRmlsZU5hbWUpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgIGVycm9yOiBgRmlsZSBcIiR7ZmluYWxGaWxlTmFtZX1cIiBhbHJlYWR5IGV4aXN0c2BcclxuICAgICAgICB9O1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIC8vIEZpbGUgZG9lc24ndCBleGlzdCwgd2hpY2ggaXMgd2hhdCB3ZSB3YW50XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRlZmF1bHRDb250ZW50OiBDbGFzc0ZpbGVDb250ZW50ID0gaW5pdGlhbENvbnRlbnQgfHwge1xyXG4gICAgICAgIGNsYXNzZXM6IFtcclxuICAgICAgICAgIHsgaWQ6IDAsIG5hbWU6ICdjbGFzczEnIH0sXHJcbiAgICAgICAgICB7IGlkOiAxLCBuYW1lOiAnY2xhc3MyJyB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoKSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXV0by1nZW5lcmF0ZWQgY2xhc3MgZmlsZSdcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCBmaWxlSGFuZGxlID0gYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUoZmluYWxGaWxlTmFtZSwgeyBjcmVhdGU6IHRydWUgfSk7XHJcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUNsYXNzRmlsZShmaWxlSGFuZGxlLCBkZWZhdWx0Q29udGVudCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdjbGFzc2VzOmZpbGUtY3JlYXRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogZmluYWxGaWxlTmFtZSwgY2xhc3NDb3VudDogZGVmYXVsdENvbnRlbnQuY2xhc3Nlcy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZmlsZUhhbmRsZSxcclxuICAgICAgICBtZXNzYWdlOiBgQ3JlYXRlZCBjbGFzcyBmaWxlOiAke2ZpbmFsRmlsZU5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjcmVhdGUgY2xhc3MgZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdmFsaWRhdGVDbGFzc0ZpbGUoY29udGVudDogc3RyaW5nKTogQ2xhc3NGaWxlVmFsaWRhdGlvbiB7XHJcbiAgICBjb25zdCByZXN1bHQ6IENsYXNzRmlsZVZhbGlkYXRpb24gPSB7XHJcbiAgICAgIGlzVmFsaWQ6IHRydWUsXHJcbiAgICAgIGVycm9yczogW10sXHJcbiAgICAgIHdhcm5pbmdzOiBbXSxcclxuICAgICAgZHVwbGljYXRlSWRzOiBbXSxcclxuICAgICAgZW1wdHlOYW1lczogW11cclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcclxuICAgIGNvbnN0IHNlZW5JZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcclxuICAgIFxyXG4gICAgbGluZXMuZm9yRWFjaCgobGluZSwgbGluZUluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHRyaW1tZWRMaW5lID0gbGluZS50cmltKCk7XHJcbiAgICAgIGlmICh0cmltbWVkTGluZS5zdGFydHNXaXRoKCcjJykgfHwgdHJpbW1lZExpbmUgPT09ICcnKSByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBwYXJ0cyA9IHRyaW1tZWRMaW5lLnNwbGl0KCc6Jyk7XHJcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IEludmFsaWQgZm9ybWF0LiBFeHBlY3RlZCBcImlkOiBuYW1lXCJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgaWRTdHIgPSBwYXJ0c1swXSEudHJpbSgpO1xyXG4gICAgICBjb25zdCBuYW1lID0gcGFydHMuc2xpY2UoMSkuam9pbignOicpLnRyaW0oKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQoaWRTdHIsIDEwKTtcclxuICAgICAgaWYgKGlzTmFOKGlkKSB8fCBTdHJpbmcoaWQpICE9PSBpZFN0cikge1xyXG4gICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBJbnZhbGlkIElEIFwiJHtpZFN0cn1cIi4gTXVzdCBiZSBhbiBpbnRlZ2VyYCk7XHJcbiAgICAgICAgcmVzdWx0LmlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIGlmIChzZWVuSWRzLmhhcyhpZCkpIHtcclxuICAgICAgICByZXN1bHQuZHVwbGljYXRlSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBEdXBsaWNhdGUgSUQgXCIke2lkfVwiYCk7XHJcbiAgICAgICAgcmVzdWx0LmlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWVuSWRzLmFkZChpZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgIHJlc3VsdC5lbXB0eU5hbWVzLnB1c2goaWRTdHIpO1xyXG4gICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChgTGluZSAke2xpbmVJbmRleCArIDF9OiBFbXB0eSBjbGFzcyBuYW1lIGZvciBJRCBcIiR7aWRTdHJ9XCJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFlPTE8gRm9ybWF0IFByb2Nlc3NpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBwYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGE6IHN0cmluZyk6IFlvbG9QYXJzZVJlc3VsdCB7XHJcbiAgICByZXR1cm4gWW9sb1BhcnNlci5wYXJzZVlvbG9TdHJpbmcoeW9sb0RhdGEpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHM6IFlvbG9MYWJlbFtdLCBvcHRpb25zPzogWW9sb0V4cG9ydE9wdGlvbnMpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFlvbG9QYXJzZXIubGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVscywgb3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdmFsaWRhdGVZb2xvTGFiZWwobGFiZWw6IFlvbG9MYWJlbCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIFlvbG9QYXJzZXIudmFsaWRhdGVZb2xvTGFiZWwobGFiZWwpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENhY2hlIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBjbGVhckltYWdlQ2FjaGUoKTogdm9pZCB7XHJcbiAgICAvLyBSZXZva2UgYWxsIGJsb2IgVVJMcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgICBpZiAoZW50cnkuZGF0YS5zcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZW50cnkuZGF0YS5zcmMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmNsZWFyKCk7XHJcbiAgICBcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpjbGVhcmVkJyxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRDYWNoZVN0YXRzKCk6IENhY2hlU3RhdHMge1xyXG4gICAgbGV0IHRvdGFsU2l6ZSA9IDA7XHJcbiAgICBsZXQgdG90YWxIaXRzID0gMDtcclxuICAgIGxldCB0b3RhbEFjY2Vzc2VzID0gMDtcclxuXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICAgIHRvdGFsU2l6ZSArPSBlbnRyeS5zaXplO1xyXG4gICAgICB0b3RhbEhpdHMgKz0gZW50cnkuaGl0cztcclxuICAgICAgdG90YWxBY2Nlc3NlcyArPSBlbnRyeS5oaXRzICsgMTsgLy8gKzEgZm9yIGluaXRpYWwgbG9hZFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG90YWxFbnRyaWVzOiB0aGlzLmltYWdlQ2FjaGUuc2l6ZSxcclxuICAgICAgdG90YWxTaXplLFxyXG4gICAgICBoaXRSYXRlOiB0b3RhbEFjY2Vzc2VzID4gMCA/IHRvdGFsSGl0cyAvIHRvdGFsQWNjZXNzZXMgOiAwLFxyXG4gICAgICBtZW1vcnlVc2FnZTogdG90YWxTaXplIC8gKDEwMjQgKiAxMDI0KSAvLyBNQlxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvcHRpbWl6ZUNhY2hlKCk6IHZvaWQge1xyXG4gICAgLy8gUmVtb3ZlIGV4cGlyZWQgZW50cmllc1xyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgIGNvbnN0IGV4cGlyZWRLZXlzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5mb3JFYWNoKChlbnRyeSwga2V5KSA9PiB7XHJcbiAgICAgIGlmIChub3cuZ2V0VGltZSgpIC0gZW50cnkudGltZXN0YW1wLmdldFRpbWUoKSA+IHRoaXMuY29uZmlnLmNhY2hlVGltZW91dCkge1xyXG4gICAgICAgIGV4cGlyZWRLZXlzLnB1c2goa2V5KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZXhwaXJlZEtleXMuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuaW1hZ2VDYWNoZS5nZXQoa2V5KTtcclxuICAgICAgaWYgKGVudHJ5ICYmIGVudHJ5LmRhdGEuc3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGVudHJ5LmRhdGEuc3JjKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmltYWdlQ2FjaGUuZGVsZXRlKGtleSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJZiBzdGlsbCBvdmVyIGxpbWl0LCByZW1vdmUgbGVhc3QgcmVjZW50bHkgdXNlZFxyXG4gICAgaWYgKHRoaXMuZ2V0VG90YWxDYWNoZVNpemUoKSA+IHRoaXMuY29uZmlnLm1heENhY2hlU2l6ZSkge1xyXG4gICAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuZnJvbSh0aGlzLmltYWdlQ2FjaGUuZW50cmllcygpKS5zb3J0KChhLCBiKSA9PiBcclxuICAgICAgICBhWzFdLnRpbWVzdGFtcC5nZXRUaW1lKCkgLSBiWzFdLnRpbWVzdGFtcC5nZXRUaW1lKClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHdoaWxlICh0aGlzLmdldFRvdGFsQ2FjaGVTaXplKCkgPiB0aGlzLmNvbmZpZy5tYXhDYWNoZVNpemUgJiYgZW50cmllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3QgW2tleSwgZW50cnldID0gZW50cmllcy5zaGlmdCgpITtcclxuICAgICAgICBpZiAoZW50cnkuZGF0YS5zcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xyXG4gICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChlbnRyeS5kYXRhLnNyYyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW1hZ2VDYWNoZS5kZWxldGUoa2V5KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpvcHRpbWl6ZWQnLFxyXG4gICAgICBkYXRhOiB7IHJlbW92ZWRFeHBpcmVkOiBleHBpcmVkS2V5cy5sZW5ndGggfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW1cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogRmlsZVN5c3RlbUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBbXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKSEucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogRmlsZVN5c3RlbUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgaGFuZGxlcnMhLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudChldmVudDogRmlsZVN5c3RlbUV2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzIS5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gRmlsZVN5c3RlbSBldmVudCBoYW5kbGVyIGZvciAke2V2ZW50LnR5cGV9OmAsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFByaXZhdGUgVXRpbGl0eSBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGdldEZpbGVFeHRlbnNpb24oZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBsYXN0RG90ID0gZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKTtcclxuICAgIHJldHVybiBsYXN0RG90ID4gMCA/IGZpbGVOYW1lLnN1YnN0cmluZyhsYXN0RG90ICsgMSkgOiAnJztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0TGFiZWxGaWxlTmFtZShpbWFnZUZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGltYWdlRmlsZU5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcudHh0Jyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUltYWdlRnJvbUZpbGUoZmlsZTogRmlsZSwgb3B0aW9ucz86IEltYWdlTG9hZE9wdGlvbnMpOiBQcm9taXNlPEhUTUxJbWFnZUVsZW1lbnQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xyXG4gICAgICBcclxuICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbiAgICAgICAgcmVzb2x2ZShpbWcpO1xyXG4gICAgICB9O1xyXG4gICAgICBcclxuICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgICAgIHJlamVjdChuZXcgSW1hZ2VMb2FkRXJyb3IoYEZhaWxlZCB0byBsb2FkIGltYWdlOiAke2ZpbGUubmFtZX1gLCBmaWxlLm5hbWUpKTtcclxuICAgICAgfTtcclxuICAgICAgXHJcbiAgICAgIGltZy5zcmMgPSB1cmw7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2FjaGVJbWFnZShrZXk6IHN0cmluZywgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCBzaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8vIE9wdGltaXplIGNhY2hlIGJlZm9yZSBhZGRpbmcgbmV3IGVudHJ5XHJcbiAgICBpZiAodGhpcy5nZXRUb3RhbENhY2hlU2l6ZSgpICsgc2l6ZSA+IHRoaXMuY29uZmlnLm1heENhY2hlU2l6ZSkge1xyXG4gICAgICB0aGlzLm9wdGltaXplQ2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbnRyeTogQ2FjaGVFbnRyeTxIVE1MSW1hZ2VFbGVtZW50PiA9IHtcclxuICAgICAgZGF0YTogaW1nLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXHJcbiAgICAgIHNpemUsXHJcbiAgICAgIGhpdHM6IDBcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pbWFnZUNhY2hlLnNldChrZXksIGVudHJ5KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNDYWNoZVZhbGlkKGVudHJ5OiBDYWNoZUVudHJ5PEhUTUxJbWFnZUVsZW1lbnQ+KTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgcmV0dXJuIG5vdy5nZXRUaW1lKCkgLSBlbnRyeS50aW1lc3RhbXAuZ2V0VGltZSgpIDwgdGhpcy5jb25maWcuY2FjaGVUaW1lb3V0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRUb3RhbENhY2hlU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgbGV0IHRvdGFsID0gMDtcclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgdG90YWwgKz0gZW50cnkuc2l6ZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRvdGFsO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IEZpbGVTeXN0ZW1TZXJ2aWNlIGluc3RhbmNlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UoY29uZmlnPzogUGFydGlhbDxGaWxlU3lzdGVtQ29uZmlnPik6IEZpbGVTeXN0ZW1TZXJ2aWNlIHtcclxuICByZXR1cm4gbmV3IEZpbGVTeXN0ZW1TZXJ2aWNlKGNvbmZpZyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgRmlsZVN5c3RlbVNlcnZpY2Ugd2l0aCBjdXN0b20gY2FjaGUgc2l6ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlV2l0aENhY2hlKGNhY2hlU2l6ZTogbnVtYmVyKTogRmlsZVN5c3RlbVNlcnZpY2Uge1xyXG4gIHJldHVybiBuZXcgRmlsZVN5c3RlbVNlcnZpY2UoeyBtYXhDYWNoZVNpemU6IGNhY2hlU2l6ZSB9KTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpbGVTeXN0ZW1TZXJ2aWNlO1xyXG5leHBvcnQgdHlwZSB7IElGaWxlU3lzdGVtU2VydmljZSwgRmlsZVN5c3RlbUNvbmZpZyB9O1xuIiwiLyoqXHJcbiAqIFNlcnZpY2VzIE1vZHVsZSBJbmRleFxyXG4gKiBcclxuICogQ2VudHJhbCBleHBvcnQgcG9pbnQgZm9yIGFsbCBzZXJ2aWNlIGNsYXNzZXMgdXNlZCB0aHJvdWdob3V0IHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBjbGVhbiBBUEkgYWNjZXNzIHRvIGJ1c2luZXNzIGxvZ2ljIGFuZCBleHRlcm5hbCBzZXJ2aWNlIGludGVncmF0aW9ucy5cclxuICovXHJcblxyXG4vLyBFeHBvcnQgRmlsZVN5c3RlbVNlcnZpY2VcclxuZXhwb3J0IHsgXHJcbiAgRmlsZVN5c3RlbVNlcnZpY2UsIFxyXG4gIGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlLCBcclxuICBjcmVhdGVGaWxlU3lzdGVtU2VydmljZVdpdGhDYWNoZSxcclxuICB0eXBlIElGaWxlU3lzdGVtU2VydmljZSxcclxuICB0eXBlIEZpbGVTeXN0ZW1Db25maWdcclxufSBmcm9tICcuL0ZpbGVTeXN0ZW1TZXJ2aWNlJztcclxuXHJcbi8vIFJlLWV4cG9ydCBZb2xvUGFyc2VyIGZyb20gdXRpbHMgZm9yIGNvbnZlbmllbmNlXHJcbmV4cG9ydCB7IFlvbG9QYXJzZXIsIHBhcnNlWW9sbywgZXhwb3J0WW9sbyB9IGZyb20gJy4uL3V0aWxzL3lvbG8tcGFyc2VyJztcclxuXHJcbi8vIFJlLWV4cG9ydCB0eXBlcyBmb3IgY29udmVuaWVuY2VcclxuZXhwb3J0IHR5cGUge1xyXG4gIEZpbGVPcGVyYXRpb25SZXN1bHQsXHJcbiAgRmlsZUxvYWRSZXN1bHQsXHJcbiAgWW9sb0xhYmVsLFxyXG4gIFlvbG9QYXJzZVJlc3VsdCxcclxuICBZb2xvRXhwb3J0T3B0aW9ucyxcclxuICBDbGFzc0ZpbGVDb250ZW50LFxyXG4gIENsYXNzRmlsZVZhbGlkYXRpb24sXHJcbiAgRm9sZGVyU2NhblJlc3VsdCxcclxuICBMYWJlbFN0YXR1cyxcclxuICBJbWFnZUluZm8sXHJcbiAgSW1hZ2VMb2FkT3B0aW9ucyxcclxuICBUaWZmUHJvY2Vzc2luZ09wdGlvbnMsXHJcbiAgQ2FjaGVFbnRyeSxcclxuICBDYWNoZVN0YXRzLFxyXG4gIEZpbGVTeXN0ZW1FdmVudCxcclxuICBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyLFxyXG4gIEZpbGVTeXN0ZW1FcnJvcixcclxuICBJbWFnZUxvYWRFcnJvcixcclxuICBZb2xvRm9ybWF0RXJyb3IsXHJcbiAgRmlsZUZvcm1hdCxcclxuICBMYWJlbEZvcm1hdCxcclxuICBDbGFzc0ZpbGVGb3JtYXQsXHJcbiAgRmlsZVR5cGVJbmZvLFxyXG4gIEZpbGVTeXN0ZW1TZXJ2aWNlRmFjdG9yeVxyXG59IGZyb20gJy4uL3R5cGVzL2ZpbGVzeXN0ZW0nOyIsImNvbnN0IF9fV0VCUEFDS19OQU1FU1BBQ0VfT0JKRUNUX18gPSBmYWJyaWM7IiwiLyoqXHJcbiAqIENhbnZhcyBDb250cm9sbGVyIEltcGxlbWVudGF0aW9uXHJcbiAqXHJcbiAqIE1hbmFnZXMgRmFicmljLmpzIGNhbnZhcyBvcGVyYXRpb25zIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogSGFuZGxlcyBib3VuZGluZyBib3ggZHJhd2luZywgZWRpdGluZywgem9vbS9wYW4gY29udHJvbHMsIGFuZCBsYWJlbCB2aXN1YWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjAuMFxyXG4gKiBAYXV0aG9yIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb25cclxuICovXHJcblxyXG5pbXBvcnQgeyBmYWJyaWMgfSBmcm9tICdmYWJyaWMnO1xuaW1wb3J0IHtcclxuICBJQ2FudmFzQ29udHJvbGxlcixcclxuICBDYW52YXNTdGF0ZSxcclxuICBDYW52YXNDb25maWcsXHJcbiAgQ2FudmFzRGltZW5zaW9ucyxcclxuICBCb3VuZGluZ0JveCxcclxuICBZT0xPTGFiZWwsXHJcbiAgRmFicmljUmVjdGFuZ2xlLFxyXG4gIEZhYnJpY1RleHQsXHJcbiAgRmFicmljTGluZSxcclxuICBDYW52YXNFdmVudCxcclxuICBDYW52YXNFdmVudEhhbmRsZXIsXHJcbiAgQ2FudmFzRXZlbnRUeXBlLFxyXG4gIERyYXdpbmdPcHRpb25zLFxyXG4gIExhYmVsRGlzcGxheU9wdGlvbnMsXHJcbiAgVmlld3BvcnRTdGF0ZSxcclxuICBDYW52YXNDb29yZGluYXRlLFxyXG4gIEltYWdlQ29vcmRpbmF0ZSxcclxuICBDYW52YXNWYWxpZGF0aW9uLFxyXG4gIENhbnZhc1BlcmZvcm1hbmNlXHJcbn0gZnJvbSAnLi4vdHlwZXMvY2FudmFzJztcclxuXHJcbmltcG9ydCB7IFBvaW50LCBSZWN0YW5nbGUsIFNpemUgfSBmcm9tICcuLi90eXBlcyc7XG4vLyBSdW50aW1lIGFsaWFzIGZvciBnbG9iYWwgRmFicmljSlMgd2hlbiB1c2luZyBDRE4gZXh0ZXJuYWxzXG5jb25zdCBGYWJyaWNKUzogYW55ID0gKHR5cGVvZiAod2luZG93IGFzIGFueSkgIT09ICd1bmRlZmluZWQnICYmICh3aW5kb3cgYXMgYW55KS5mYWJyaWMpID8gKHdpbmRvdyBhcyBhbnkpLmZhYnJpYyA6IChmYWJyaWMgYXMgdW5rbm93biBhcyBhbnkpO1xuaW1wb3J0IHsgSUFwcFN0YXRlIH0gZnJvbSAnLi4vdHlwZXMvYXBwLXN0YXRlJztcclxuaW1wb3J0IHsgY29sb3JQYWxldHRlIH0gZnJvbSAnLi4vdXRpbHMvY29sb3ItcGFsZXR0ZSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENhbnZhcyBDb250cm9sbGVyIEltcGxlbWVudGF0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBDYW52YXNDb250cm9sbGVyIGltcGxlbWVudHMgSUNhbnZhc0NvbnRyb2xsZXIge1xyXG4gIHByaXZhdGUgX2NhbnZhczogZmFicmljLkNhbnZhcyB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgX3N0YXRlOiBDYW52YXNTdGF0ZTtcclxuICBwcml2YXRlIF9jb25maWc6IENhbnZhc0NvbmZpZztcclxuICBwcml2YXRlIF9ldmVudExpc3RlbmVycyA9IG5ldyBNYXA8Q2FudmFzRXZlbnRUeXBlLCBDYW52YXNFdmVudEhhbmRsZXJbXT4oKTtcclxuXHJcbiAgLy8gRGVwZW5kZW5jaWVzXHJcbiAgcHJpdmF0ZSBhcHBTdGF0ZTogSUFwcFN0YXRlO1xyXG5cclxuICAvLyBDYW52YXMgY29udGFpbmVyIGFuZCBpbWFnZVxyXG4gIHByaXZhdGUgY29udGFpbmVyRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIGN1cnJlbnRJbWFnZTogSFRNTEltYWdlRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgaW1hZ2VPYmplY3Q6IGZhYnJpYy5JbWFnZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvLyBEcmF3aW5nIHN0YXRlXHJcbiAgcHJpdmF0ZSBkcmF3aW5nT3B0aW9uczogRHJhd2luZ09wdGlvbnMgPSB7XHJcbiAgICBzdHJva2VXaWR0aDogMixcclxuICAgIHN0cm9rZTogJyNmZjAwMDAnLFxyXG4gICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcclxuICAgIG9wYWNpdHk6IDEsXHJcbiAgICBzZWxlY3RhYmxlOiB0cnVlLFxyXG4gICAgZXZlbnRlZDogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgbGFiZWxPcHRpb25zOiBMYWJlbERpc3BsYXlPcHRpb25zID0ge1xyXG4gICAgc2hvd0xhYmVsczogdHJ1ZSxcclxuICAgIGZvbnRTaXplOiAxNCxcclxuICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICBmb250Q29sb3I6ICcjZmZmZmZmJyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC43KScsXHJcbiAgICBzaG93Q29uZmlkZW5jZTogZmFsc2UsXHJcbiAgICBzaG93Q2xhc3NOYW1lOiB0cnVlLFxyXG4gICAgc2hvd0NsYXNzSWQ6IHRydWVcclxuICB9O1xyXG5cclxuICAvLyBQZXJmb3JtYW5jZSBtb25pdG9yaW5nXHJcbiAgcHJpdmF0ZSBwZXJmb3JtYW5jZU1ldHJpY3M6IENhbnZhc1BlcmZvcm1hbmNlID0ge1xyXG4gICAgcmVuZGVyVGltZTogMCxcclxuICAgIG9iamVjdENvdW50OiAwLFxyXG4gICAgbWVtb3J5VXNhZ2U6IDAsXHJcbiAgICBmcHM6IDYwXHJcbiAgfTtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwU3RhdGU6IElBcHBTdGF0ZSkge1xuICAgIHRoaXMuYXBwU3RhdGUgPSBhcHBTdGF0ZTtcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBkZWZhdWx0IGNvbmZpZ1xyXG4gICAgdGhpcy5fY29uZmlnID0ge1xyXG4gICAgICB3aWR0aDogODAwLFxyXG4gICAgICBoZWlnaHQ6IDYwMCxcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZjlmYScsXHJcbiAgICAgIHNlbGVjdGlvbjogdHJ1ZSxcclxuICAgICAgcHJlc2VydmVPYmplY3RTdGFja2luZzogdHJ1ZSxcclxuICAgICAgcmVuZGVyT25BZGRSZW1vdmU6IHRydWUsXHJcbiAgICAgIHNraXBUYXJnZXRGaW5kOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHN0YXRlXG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICBpc0RyYXdpbmc6IGZhbHNlLFxyXG4gICAgICBkcmF3aW5nTW9kZTogJ25vbmUnLFxyXG4gICAgICBzdGFydFBvaW50OiBudWxsLFxyXG4gICAgICBlbmRQb2ludDogbnVsbCxcclxuICAgICAgY3VycmVudFJlY3Q6IG51bGwsXHJcbiAgICAgIGFjdGl2ZUxhYmVsVGV4dDogbnVsbCxcclxuICAgICAgY3Jvc3NoYWlyWDogbnVsbCxcclxuICAgICAgY3Jvc3NoYWlyWTogbnVsbCxcclxuICAgICAgem9vbTogMSxcclxuICAgICAgcGFuWDogMCxcclxuICAgICAgcGFuWTogMCxcclxuICAgICAgc2VsZWN0ZWRPYmplY3RzOiBbXSxcclxuICAgICAgbXVsdGlwbGVTZWxlY3Rpb246IGZhbHNlXHJcbiAgICB9O1xuXG4gICAgLy8gUmVhY3QgdG8gbW9kZSBjaGFuZ2VzIGZyb20gQXBwU3RhdGVcbiAgICB0cnkge1xuICAgICAgdGhpcy5hcHBTdGF0ZS5hZGRFdmVudExpc3RlbmVyKCdtb2RlOmNoYW5nZWQnLCAoZXZ0OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGV2dD8uZGF0YT8uY3VycmVudCBhcyAoJ2RyYXcnIHwgJ2VkaXQnKSB8IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hcHBseU1vZGVTZXR0aW5ncyhjdXJyZW50KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge31cbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFByb3BlcnRpZXMgKElDYW52YXNDb250cm9sbGVyIGludGVyZmFjZSlcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBnZXQgY2FudmFzKCk6IGZhYnJpYy5DYW52YXMge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW52YXMgbm90IGluaXRpYWxpemVkLiBDYWxsIGluaXRpYWxpemVDYW52YXMoKSBmaXJzdC4nKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHN0YXRlKCk6IENhbnZhc1N0YXRlIHtcclxuICAgIHJldHVybiB7IC4uLnRoaXMuX3N0YXRlIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNvbmZpZygpOiBDYW52YXNDb25maWcge1xyXG4gICAgcmV0dXJuIHsgLi4udGhpcy5fY29uZmlnIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdGUgQWNjZXNzb3JzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgaXNEcmF3aW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLmlzRHJhd2luZztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNTZWxlY3Rpb24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Wm9vbSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLnpvb207XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0UGFuKCk6IFBvaW50IHtcclxuICAgIHJldHVybiB7IHg6IHRoaXMuX3N0YXRlLnBhblgsIHk6IHRoaXMuX3N0YXRlLnBhblkgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXREaW1lbnNpb25zKCk6IENhbnZhc0RpbWVuc2lvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgd2lkdGg6IHRoaXMuX2NvbmZpZy53aWR0aCxcclxuICAgICAgaGVpZ2h0OiB0aGlzLl9jb25maWcuaGVpZ2h0LFxyXG4gICAgICBhc3BlY3RSYXRpbzogdGhpcy5fY29uZmlnLndpZHRoIC8gdGhpcy5fY29uZmlnLmhlaWdodFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbml0aWFsaXphdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGluaXRpYWxpemVDYW52YXMoY29udGFpbmVySWQ6IHN0cmluZywgY29uZmlnPzogUGFydGlhbDxDYW52YXNDb25maWc+KTogdm9pZCB7XG4gICAgLy8gQXBwbHkgY29uZmlnIG92ZXJyaWRlc1xyXG4gICAgaWYgKGNvbmZpZykge1xyXG4gICAgICB0aGlzLl9jb25maWcgPSB7IC4uLnRoaXMuX2NvbmZpZywgLi4uY29uZmlnIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmluZCBjb250YWluZXIgZWxlbWVudFxyXG4gICAgdGhpcy5jb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVySWQpO1xyXG4gICAgaWYgKCF0aGlzLmNvbnRhaW5lckVsZW1lbnQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW52YXMgY29udGFpbmVyIGVsZW1lbnQgd2l0aCBJRCAnJHtjb250YWluZXJJZH0nIG5vdCBmb3VuZGApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBjYW52YXMgZWxlbWVudFxyXG4gICAgY29uc3QgY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgY2FudmFzRWxlbWVudC5pZCA9IGAke2NvbnRhaW5lcklkfS1jYW52YXNgO1xyXG4gICAgY2FudmFzRWxlbWVudC53aWR0aCA9IHRoaXMuX2NvbmZpZy53aWR0aDtcclxuICAgIGNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gdGhpcy5fY29uZmlnLmhlaWdodDtcclxuXHJcbiAgICAvLyBDbGVhciBjb250YWluZXIgYW5kIGFkZCBjYW52YXNcbiAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKGNhbnZhc0VsZW1lbnQpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBGYWJyaWMuanMgY2FudmFzXG4gICAgdGhpcy5fY2FudmFzID0gbmV3IEZhYnJpY0pTLkNhbnZhcyhjYW52YXNFbGVtZW50LCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuX2NvbmZpZy5iYWNrZ3JvdW5kQ29sb3IsXHJcbiAgICAgIHNlbGVjdGlvbjogdGhpcy5fY29uZmlnLnNlbGVjdGlvbixcclxuICAgICAgcHJlc2VydmVPYmplY3RTdGFja2luZzogdGhpcy5fY29uZmlnLnByZXNlcnZlT2JqZWN0U3RhY2tpbmcsXHJcbiAgICAgIHJlbmRlck9uQWRkUmVtb3ZlOiB0aGlzLl9jb25maWcucmVuZGVyT25BZGRSZW1vdmUsXHJcbiAgICAgIHNraXBUYXJnZXRGaW5kOiB0aGlzLl9jb25maWcuc2tpcFRhcmdldEZpbmQsXHJcbiAgICAgIHdpZHRoOiB0aGlzLl9jb25maWcud2lkdGgsXHJcbiAgICAgIGhlaWdodDogdGhpcy5fY29uZmlnLmhlaWdodCxcclxuICAgICAgLy8gRW5hYmxlIGhpZ2ggRFBJIHN1cHBvcnRcclxuICAgICAgZW5hYmxlUmV0aW5hU2NhbGluZzogdHJ1ZSxcclxuICAgICAgLy8gUGVyZm9ybWFuY2Ugc2V0dGluZ3NcclxuICAgICAgc3RhdGVmdWw6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWtlIGNhbnZhcyBmaWxsIGNvbnRhaW5lclxuICAgIHRoaXMucmVzaXplQ2FudmFzVG9Db250YWluZXIoKTtcblxuICAgIC8vIFNldHVwIGV2ZW50IGhhbmRsZXJzXG4gICAgdGhpcy5zZXR1cENhbnZhc0V2ZW50cygpO1xuXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IGNvbnRleHQgbWVudSBhbmQgdG9nZ2xlIG1vZGUgb24gcmlnaHQtY2xpY2sgd2l0aGluIGNvbnRhaW5lclxuICAgIHRyeSB7XG4gICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZS5idXR0b24gPT09IDIpIHsgLy8gUmlnaHQgY2xpY2tcbiAgICAgICAgICB0aGlzLmFwcFN0YXRlLnRvZ2dsZU1vZGUoKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge31cblxuICAgIC8vIEFwcGx5IGxhYmVsIG9wdGlvbnMgZnJvbSBhcHAgc3RhdGVcbiAgICB0aGlzLnN5bmNXaXRoQXBwU3RhdGUoKTtcblxuICAgIC8vIEFwcGx5IGN1cnJlbnQgbW9kZSBzZXR0aW5ncyB0byBjYW52YXNcbiAgICB0aGlzLmFwcGx5TW9kZVNldHRpbmdzKHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUpO1xuXG4gICAgLy8gUmVzaXplIGNhbnZhcyBvbiB3aW5kb3cgcmVzaXplXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIHRoaXMucmVzaXplQ2FudmFzVG9Db250YWluZXIoKTtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRJbWFnZSAmJiB0aGlzLmltYWdlT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IHByZXZab29tID0gdGhpcy5fc3RhdGUuem9vbTtcbiAgICAgICAgdGhpcy5yZXNldFpvb20oKTtcbiAgICAgICAgdGhpcy5yZXNpemVUb0ltYWdlKHRoaXMuY3VycmVudEltYWdlKTtcbiAgICAgICAgdGhpcy5zZXRab29tKHByZXZab29tKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVxdWVzdFJlbmRlcigpO1xuICAgIH0pO1xuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnYWZ0ZXI6cmVuZGVyJyxcclxuICAgICAgZGF0YTogeyBpbml0aWFsaXplZDogdHJ1ZSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZXN0cm95Q2FudmFzKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX2NhbnZhcykge1xyXG4gICAgICB0aGlzLl9jYW52YXMuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLl9jYW52YXMgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNvbnRhaW5lckVsZW1lbnQpIHtcclxuICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHN0YXRlXHJcbiAgICB0aGlzLl9zdGF0ZSA9IHtcclxuICAgICAgaXNEcmF3aW5nOiBmYWxzZSxcclxuICAgICAgZHJhd2luZ01vZGU6ICdub25lJyxcclxuICAgICAgc3RhcnRQb2ludDogbnVsbCxcclxuICAgICAgZW5kUG9pbnQ6IG51bGwsXHJcbiAgICAgIGN1cnJlbnRSZWN0OiBudWxsLFxyXG4gICAgICBhY3RpdmVMYWJlbFRleHQ6IG51bGwsXHJcbiAgICAgIGNyb3NzaGFpclg6IG51bGwsXHJcbiAgICAgIGNyb3NzaGFpclk6IG51bGwsXHJcbiAgICAgIHpvb206IDEsXHJcbiAgICAgIHBhblg6IDAsXHJcbiAgICAgIHBhblk6IDAsXHJcbiAgICAgIHNlbGVjdGVkT2JqZWN0czogW10sXHJcbiAgICAgIG11bHRpcGxlU2VsZWN0aW9uOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZSA9IG51bGw7XHJcbiAgICB0aGlzLmltYWdlT2JqZWN0ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbWFnZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgbG9hZEltYWdlKGltYWdlRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICAvLyBSZW1vdmUgZXhpc3RpbmcgaW1hZ2VcclxuICAgIHRoaXMuY2xlYXJJbWFnZSgpO1xyXG5cclxuICAgIHRoaXMuY3VycmVudEltYWdlID0gaW1hZ2VFbGVtZW50O1xyXG5cclxuICAgIC8vIENyZWF0ZSBmYWJyaWMgaW1hZ2Ugb2JqZWN0XHJcbiAgICB0aGlzLmltYWdlT2JqZWN0ID0gbmV3IEZhYnJpY0pTLkltYWdlKGltYWdlRWxlbWVudCwge1xuICAgICAgbGVmdDogMCxcclxuICAgICAgdG9wOiAwLFxyXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcclxuICAgICAgZXZlbnRlZDogZmFsc2UsXHJcbiAgICAgIGxvY2tNb3ZlbWVudFg6IHRydWUsXHJcbiAgICAgIGxvY2tNb3ZlbWVudFk6IHRydWUsXHJcbiAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZSxcclxuICAgICAgbG9ja1NjYWxpbmdYOiB0cnVlLFxyXG4gICAgICBsb2NrU2NhbGluZ1k6IHRydWUsXHJcbiAgICAgIGxvY2tVbmlTY2FsaW5nOiB0cnVlLFxyXG4gICAgICBoYXNDb250cm9sczogZmFsc2UsXHJcbiAgICAgIGhhc0JvcmRlcnM6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXNpemUgY2FudmFzIHRvIG1hdGNoIGltYWdlXHJcbiAgICB0aGlzLnJlc2l6ZVRvSW1hZ2UoaW1hZ2VFbGVtZW50KTtcclxuXHJcbiAgICAvLyBBZGQgaW1hZ2UgdG8gY2FudmFzIChzZW5kIHRvIGJhY2spXHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHRoaXMuaW1hZ2VPYmplY3QhIGFzIHVua25vd24gYXMgZmFicmljLk9iamVjdCk7XG4gICAgdGhpcy5pbWFnZU9iamVjdCEuc2VuZFRvQmFjaygpO1xuXHJcbiAgICAvLyBSZXNldCB2aWV3cG9ydFxyXG4gICAgdGhpcy5yZXNldFpvb20oKTtcclxuICAgIHRoaXMucmVzZXRQYW4oKTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2FmdGVyOnJlbmRlcicsXHJcbiAgICAgIGRhdGE6IHsgaW1hZ2VMb2FkZWQ6IHRydWUsIGltYWdlRGltZW5zaW9uczogeyB3aWR0aDogaW1hZ2VFbGVtZW50LndpZHRoLCBoZWlnaHQ6IGltYWdlRWxlbWVudC5oZWlnaHQgfSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbGVhckltYWdlKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBpZiAodGhpcy5pbWFnZU9iamVjdCkge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHRoaXMuaW1hZ2VPYmplY3QpO1xyXG4gICAgICB0aGlzLmltYWdlT2JqZWN0ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZSA9IG51bGw7XHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplVG9JbWFnZShpbWFnZTogSFRNTEltYWdlRWxlbWVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XG4gICAgLy8gRW5zdXJlIGNhbnZhcyBtYXRjaGVzIGNvbnRhaW5lciBzaXplXG4gICAgdGhpcy5yZXNpemVDYW52YXNUb0NvbnRhaW5lcigpO1xuXG4gICAgY29uc3QgY2FudmFzV2lkdGggPSB0aGlzLl9jYW52YXMuZ2V0V2lkdGgoKTtcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLl9jYW52YXMuZ2V0SGVpZ2h0KCk7XG5cbiAgICAvLyBTY2FsZSBpbWFnZSB0byBmaXQgaW5zaWRlIGNhbnZhcyBhbmQgY2VudGVyIGl0XG4gICAgaWYgKHRoaXMuaW1hZ2VPYmplY3QpIHtcbiAgICAgIGNvbnN0IHNjYWxlID0gTWF0aC5taW4oY2FudmFzV2lkdGggLyBpbWFnZS53aWR0aCwgY2FudmFzSGVpZ2h0IC8gaW1hZ2UuaGVpZ2h0KTtcbiAgICAgIGNvbnN0IHNjYWxlZFcgPSBpbWFnZS53aWR0aCAqIHNjYWxlO1xuICAgICAgY29uc3Qgc2NhbGVkSCA9IGltYWdlLmhlaWdodCAqIHNjYWxlO1xuICAgICAgdGhpcy5pbWFnZU9iamVjdC5zZXQoe1xuICAgICAgICBzY2FsZVg6IHNjYWxlLFxuICAgICAgICBzY2FsZVk6IHNjYWxlLFxuICAgICAgICBsZWZ0OiAoY2FudmFzV2lkdGggLSBzY2FsZWRXKSAvIDIsXG4gICAgICAgIHRvcDogKGNhbnZhc0hlaWdodCAtIHNjYWxlZEgpIC8gMlxuICAgICAgfSk7XG4gICAgICB0aGlzLl9jYW52YXMuY2VudGVyT2JqZWN0KHRoaXMuaW1hZ2VPYmplY3QgYXMgYW55KTtcbiAgICAgICh0aGlzLmltYWdlT2JqZWN0IGFzIGFueSkuc2V0Q29vcmRzKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZXNpemVDYW52YXNUb0NvbnRhaW5lcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhdGhpcy5jb250YWluZXJFbGVtZW50KSByZXR1cm47XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuY29udGFpbmVyRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVjdC53aWR0aCkpO1xuICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVjdC5oZWlnaHQpKTtcbiAgICB0aGlzLl9jb25maWcgPSB7IC4uLnRoaXMuX2NvbmZpZywgd2lkdGgsIGhlaWdodCB9O1xuICAgIHRoaXMuX2NhbnZhcy5zZXREaW1lbnNpb25zKHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIERyYXdpbmcgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhd2luZyhwb2ludDogUG9pbnQpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzIHx8IHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUgIT09ICdkcmF3JykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N0YXRlLmlzRHJhd2luZyA9IHRydWU7XHJcbiAgICB0aGlzLl9zdGF0ZS5kcmF3aW5nTW9kZSA9ICdyZWN0YW5nbGUnO1xyXG4gICAgdGhpcy5fc3RhdGUuc3RhcnRQb2ludCA9IHBvaW50O1xyXG4gICAgdGhpcy5fc3RhdGUuZW5kUG9pbnQgPSBwb2ludDtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGVtcG9yYXJ5IHJlY3RhbmdsZSBmb3IgZHJhd2luZyBmZWVkYmFja1xyXG4gICAgY29uc3QgcmVjdCA9IG5ldyBGYWJyaWNKUy5SZWN0KHtcbiAgICAgIGxlZnQ6IHBvaW50LngsXHJcbiAgICAgIHRvcDogcG9pbnQueSxcclxuICAgICAgd2lkdGg6IDAsXHJcbiAgICAgIGhlaWdodDogMCxcclxuICAgICAgLi4udGhpcy5kcmF3aW5nT3B0aW9ucyxcclxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXHJcbiAgICAgIGV2ZW50ZWQ6IGZhbHNlXHJcbiAgICB9KSBhcyBGYWJyaWNSZWN0YW5nbGU7XHJcblxyXG4gICAgcmVjdC5pc0xhYmVsID0gdHJ1ZTtcclxuICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0ID0gcmVjdDtcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQocmVjdCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vdXNlOmRvd24nLFxyXG4gICAgICBwb2ludGVyOiBwb2ludCxcclxuICAgICAgZGF0YTogeyBkcmF3aW5nOiB0cnVlIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZURyYXdpbmcocG9pbnQ6IFBvaW50KTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhdGhpcy5fc3RhdGUuaXNEcmF3aW5nIHx8ICF0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCB8fCAhdGhpcy5fc3RhdGUuc3RhcnRQb2ludCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHJlY3RhbmdsZSBkaW1lbnNpb25zXHJcbiAgICBjb25zdCBsZWZ0ID0gTWF0aC5taW4odGhpcy5fc3RhdGUuc3RhcnRQb2ludC54LCBwb2ludC54KTtcclxuICAgIGNvbnN0IHRvcCA9IE1hdGgubWluKHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueSwgcG9pbnQueSk7XHJcbiAgICBjb25zdCB3aWR0aCA9IE1hdGguYWJzKHBvaW50LnggLSB0aGlzLl9zdGF0ZS5zdGFydFBvaW50LngpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5hYnMocG9pbnQueSAtIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueSk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRlbXBvcmFyeSByZWN0YW5nbGVcclxuICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0LnNldCh7XHJcbiAgICAgIGxlZnQsXHJcbiAgICAgIHRvcCxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdtb3VzZTptb3ZlJyxcclxuICAgICAgcG9pbnRlcjogcG9pbnQsXHJcbiAgICAgIGRhdGE6IHsgZHJhd2luZzogdHJ1ZSwgZGltZW5zaW9uczogeyB3aWR0aCwgaGVpZ2h0IH0gfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZmluaXNoRHJhd2luZyhwb2ludDogUG9pbnQpOiBCb3VuZGluZ0JveCB8IG51bGwge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMgfHwgIXRoaXMuX3N0YXRlLmlzRHJhd2luZyB8fCAhdGhpcy5fc3RhdGUuY3VycmVudFJlY3QgfHwgIXRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmF3aW5nKCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGZpbmFsIGRpbWVuc2lvbnNcclxuICAgIGNvbnN0IGxlZnQgPSBNYXRoLm1pbih0aGlzLl9zdGF0ZS5zdGFydFBvaW50LngsIHBvaW50LngpO1xyXG4gICAgY29uc3QgdG9wID0gTWF0aC5taW4odGhpcy5fc3RhdGUuc3RhcnRQb2ludC55LCBwb2ludC55KTtcclxuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5hYnMocG9pbnQueCAtIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueCk7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLmFicyhwb2ludC55IC0gdGhpcy5fc3RhdGUuc3RhcnRQb2ludC55KTtcclxuXHJcbiAgICAvLyBNaW5pbXVtIHNpemUgdmFsaWRhdGlvblxyXG4gICAgaWYgKHdpZHRoIDwgNSB8fCBoZWlnaHQgPCA1KSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhd2luZygpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb252ZXJ0IHRvIGltYWdlIGNvb3JkaW5hdGVzIGlmIGltYWdlIGlzIGxvYWRlZFxyXG4gICAgbGV0IG5vcm1hbGl6ZWRCb3g6IEJvdW5kaW5nQm94IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgaWYgKHRoaXMuY3VycmVudEltYWdlICYmIHRoaXMuaW1hZ2VPYmplY3QpIHtcclxuICAgICAgY29uc3QgaW1hZ2VDb29yZHMgPSB0aGlzLmNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyh7IHg6IGxlZnQsIHk6IHRvcCB9KTtcclxuICAgICAgY29uc3QgaW1hZ2VXaWR0aCA9IE1hdGguYWJzKHdpZHRoIC8gKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDEpKTtcclxuICAgICAgY29uc3QgaW1hZ2VIZWlnaHQgPSBNYXRoLmFicyhoZWlnaHQgLyAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMSkpO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGJvdW5kaW5nIGJveFxyXG4gICAgICBub3JtYWxpemVkQm94ID0ge1xyXG4gICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlQm91bmRpbmdCb3hJZCgpLFxyXG4gICAgICAgIHg6IGltYWdlQ29vcmRzLngsXHJcbiAgICAgICAgeTogaW1hZ2VDb29yZHMueSxcclxuICAgICAgICB3aWR0aDogaW1hZ2VXaWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGltYWdlSGVpZ2h0LFxyXG4gICAgICAgIGNsYXNzSWQ6IDAsIC8vIERlZmF1bHQgY2xhc3NcclxuICAgICAgICBjb2xvcjogdGhpcy5nZXRDbGFzc0NvbG9yKDApLFxyXG4gICAgICAgIGlzVmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICBpc1NlbGVjdGVkOiB0cnVlLFxyXG4gICAgICAgIGlzVGVtcERyYXc6IGZhbHNlXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRlbXBvcmFyeSByZWN0YW5nbGVcclxuICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUodGhpcy5fc3RhdGUuY3VycmVudFJlY3QpO1xyXG5cclxuICAgIC8vIFJlc2V0IGRyYXdpbmcgc3RhdGVcclxuICAgIHRoaXMuX3N0YXRlLmlzRHJhd2luZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fc3RhdGUuZHJhd2luZ01vZGUgPSAnbm9uZSc7XHJcbiAgICB0aGlzLl9zdGF0ZS5zdGFydFBvaW50ID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0ID0gbnVsbDtcclxuXHJcbiAgICAvLyBBZGQgcGVybWFuZW50IGJvdW5kaW5nIGJveCBpZiB2YWxpZFxyXG4gICAgaWYgKG5vcm1hbGl6ZWRCb3gpIHtcclxuICAgICAgdGhpcy5hZGRCb3VuZGluZ0JveChub3JtYWxpemVkQm94KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vdXNlOnVwJyxcclxuICAgICAgcG9pbnRlcjogcG9pbnQsXHJcbiAgICAgIGRhdGE6IHsgZHJhd2luZzogZmFsc2UsIGJvdW5kaW5nQm94OiBub3JtYWxpemVkQm94IH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBub3JtYWxpemVkQm94O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhbmNlbERyYXdpbmcoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIGlmICh0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCkge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zdGF0ZS5pc0RyYXdpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuX3N0YXRlLmRyYXdpbmdNb2RlID0gJ25vbmUnO1xyXG4gICAgdGhpcy5fc3RhdGUuc3RhcnRQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLl9zdGF0ZS5lbmRQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEJvdW5kaW5nIEJveCBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYWRkQm91bmRpbmdCb3goYmJveDogQm91bmRpbmdCb3gpOiBGYWJyaWNSZWN0YW5nbGUge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW52YXMgbm90IGluaXRpYWxpemVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29udmVydCB0byBjYW52YXMgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IGNhbnZhc0Nvb3JkcyA9IHRoaXMuaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKHsgeDogYmJveC54LCB5OiBiYm94LnkgfSk7XHJcbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IHRoaXMuaW1hZ2VPYmplY3QgPyBiYm94LndpZHRoICogKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDEpIDogYmJveC53aWR0aDtcclxuICAgIGNvbnN0IGNhbnZhc0hlaWdodCA9IHRoaXMuaW1hZ2VPYmplY3QgPyBiYm94LmhlaWdodCAqICh0aGlzLmltYWdlT2JqZWN0LnNjYWxlWSB8fCAxKSA6IGJib3guaGVpZ2h0O1xyXG5cclxuICAgIC8vIENyZWF0ZSByZWN0YW5nbGVcclxuICAgIGNvbnN0IHJlY3QgPSBuZXcgRmFicmljSlMuUmVjdCh7XG4gICAgICBsZWZ0OiBjYW52YXNDb29yZHMueCxcclxuICAgICAgdG9wOiBjYW52YXNDb29yZHMueSxcclxuICAgICAgd2lkdGg6IGNhbnZhc1dpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNhbnZhc0hlaWdodCxcclxuICAgICAgc3Ryb2tlOiBiYm94LmNvbG9yLFxyXG4gICAgICBzdHJva2VXaWR0aDogdGhpcy5kcmF3aW5nT3B0aW9ucy5zdHJva2VXaWR0aCxcclxuICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgc2VsZWN0YWJsZTogdHJ1ZSxcclxuICAgICAgZXZlbnRlZDogdHJ1ZSxcclxuICAgICAgaGFzQ29udHJvbHM6IHRydWUsXHJcbiAgICAgIGhhc0JvcmRlcnM6IHRydWUsXHJcbiAgICAgIGJvcmRlckNvbG9yOiBiYm94LmNvbG9yLFxyXG4gICAgICBjb3JuZXJDb2xvcjogYmJveC5jb2xvcixcclxuICAgICAgdHJhbnNwYXJlbnRDb3JuZXJzOiBmYWxzZVxyXG4gICAgfSkgYXMgRmFicmljUmVjdGFuZ2xlO1xyXG5cclxuICAgIC8vIEF0dGFjaCBib3VuZGluZyBib3ggZGF0YVxyXG4gICAgcmVjdC5ib3VuZGluZ0JveCA9IGJib3g7XHJcbiAgICByZWN0LmlzTGFiZWwgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFkZCB0byBjYW52YXNcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQocmVjdCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGxhYmVsIHRleHQgaWYgbGFiZWxzIGFyZSBlbmFibGVkXHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscykge1xyXG4gICAgICB0aGlzLmNyZWF0ZUxhYmVsVGV4dChyZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBCcmluZyB0byBmcm9udCAoYnV0IGtlZXAgYmVoaW5kIGFueSBjdXJyZW50IGRyYXdpbmcpXHJcbiAgICByZWN0LmJyaW5nVG9Gcm9udCgpO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnb2JqZWN0OmFkZGVkJyxcclxuICAgICAgdGFyZ2V0OiByZWN0LFxyXG4gICAgICBkYXRhOiB7IGJvdW5kaW5nQm94OiBiYm94IH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZWN0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZUJvdW5kaW5nQm94KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICBjb25zdCByZWN0VG9SZW1vdmUgPSBvYmplY3RzLmZpbmQob2JqID0+IG9iai5ib3VuZGluZ0JveD8uaWQgPT09IGlkKTtcclxuXHJcbiAgICBpZiAocmVjdFRvUmVtb3ZlKSB7XHJcbiAgICAgIC8vIFJlbW92ZSBhc3NvY2lhdGVkIGxhYmVsIHRleHRcclxuICAgICAgaWYgKHJlY3RUb1JlbW92ZS5sYWJlbFRleHQpIHtcclxuICAgICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHJlY3RUb1JlbW92ZS5sYWJlbFRleHQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgcmVjdGFuZ2xlXHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUocmVjdFRvUmVtb3ZlKTtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0OnJlbW92ZWQnLFxyXG4gICAgICAgIHRhcmdldDogcmVjdFRvUmVtb3ZlLFxyXG4gICAgICAgIGRhdGE6IHsgYm91bmRpbmdCb3hJZDogaWQgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVCb3VuZGluZ0JveChpZDogc3RyaW5nLCB1cGRhdGVzOiBQYXJ0aWFsPEJvdW5kaW5nQm94Pik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuICAgIGNvbnN0IHJlY3QgPSBvYmplY3RzLmZpbmQob2JqID0+IG9iai5ib3VuZGluZ0JveD8uaWQgPT09IGlkKTtcclxuXHJcbiAgICBpZiAocmVjdCAmJiByZWN0LmJvdW5kaW5nQm94KSB7XHJcbiAgICAgIC8vIFVwZGF0ZSBib3VuZGluZyBib3ggZGF0YVxyXG4gICAgICBPYmplY3QuYXNzaWduKHJlY3QuYm91bmRpbmdCb3gsIHVwZGF0ZXMpO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHZpc3VhbCBwcm9wZXJ0aWVzXHJcbiAgICAgIGlmICh1cGRhdGVzLmNvbG9yKSB7XHJcbiAgICAgICAgcmVjdC5zZXQoe1xyXG4gICAgICAgICAgc3Ryb2tlOiB1cGRhdGVzLmNvbG9yLFxyXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IHVwZGF0ZXMuY29sb3IsXHJcbiAgICAgICAgICBjb3JuZXJDb2xvcjogdXBkYXRlcy5jb2xvclxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodXBkYXRlcy5pc1Zpc2libGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJlY3Quc2V0KHsgdmlzaWJsZTogdXBkYXRlcy5pc1Zpc2libGUgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVwZGF0ZSBsYWJlbCB0ZXh0XHJcbiAgICAgIGlmIChyZWN0LmxhYmVsVGV4dCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlTGFiZWxUZXh0KHJlY3QpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdvYmplY3Q6bW9kaWZpZWQnLFxyXG4gICAgICAgIHRhcmdldDogcmVjdCxcclxuICAgICAgICBkYXRhOiB7IGJvdW5kaW5nQm94OiByZWN0LmJvdW5kaW5nQm94LCB1cGRhdGVzIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Qm91bmRpbmdCb3goaWQ6IHN0cmluZyk6IEJvdW5kaW5nQm94IHwgbnVsbCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICBjb25zdCByZWN0ID0gb2JqZWN0cy5maW5kKG9iaiA9PiBvYmouYm91bmRpbmdCb3g/LmlkID09PSBpZCk7XHJcblxyXG4gICAgcmV0dXJuIHJlY3Q/LmJvdW5kaW5nQm94IHx8IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0QWxsQm91bmRpbmdCb3hlcygpOiBCb3VuZGluZ0JveFtdIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm4gW107XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcbiAgICByZXR1cm4gb2JqZWN0c1xyXG4gICAgICAuZmlsdGVyKG9iaiA9PiBvYmouaXNMYWJlbCAmJiBvYmouYm91bmRpbmdCb3gpXHJcbiAgICAgIC5tYXAob2JqID0+IG9iai5ib3VuZGluZ0JveCEpXHJcbiAgICAgIC5maWx0ZXIoYmJveCA9PiBiYm94ICE9PSB1bmRlZmluZWQpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFNlbGVjdGlvbiBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgc2VsZWN0Qm91bmRpbmdCb3goaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuICAgIGNvbnN0IHJlY3QgPSBvYmplY3RzLmZpbmQob2JqID0+IG9iai5ib3VuZGluZ0JveD8uaWQgPT09IGlkKTtcclxuXHJcbiAgICBpZiAocmVjdCkge1xyXG4gICAgICB0aGlzLl9jYW52YXMuc2V0QWN0aXZlT2JqZWN0KHJlY3QpO1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVzZWxlY3RBbGwoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XHJcbiAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZWxlY3Rpb246Y2xlYXJlZCdcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNlbGVjdGVkQm91bmRpbmdCb3hlcygpOiBCb3VuZGluZ0JveFtdIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5zZWxlY3RlZE9iamVjdHNcclxuICAgICAgLm1hcChvYmogPT4gKG9iaiBhcyBGYWJyaWNSZWN0YW5nbGUpLmJvdW5kaW5nQm94KVxyXG4gICAgICAuZmlsdGVyKGJib3ggPT4gYmJveCAhPT0gdW5kZWZpbmVkKSBhcyBCb3VuZGluZ0JveFtdO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGVjdGVkKCk6IEJvdW5kaW5nQm94W10ge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybiBbXTtcclxuXHJcbiAgICBjb25zdCBzZWxlY3RlZEJveGVzID0gdGhpcy5nZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTtcclxuICAgIGNvbnN0IGFjdGl2ZU9iamVjdCA9IHRoaXMuX2NhbnZhcy5nZXRBY3RpdmVPYmplY3QoKTtcclxuXHJcbiAgICBpZiAoYWN0aXZlT2JqZWN0KSB7XHJcbiAgICAgIGlmIChhY3RpdmVPYmplY3QudHlwZSA9PT0gJ2FjdGl2ZVNlbGVjdGlvbicpIHtcclxuICAgICAgICAvLyBNdWx0aXBsZSBzZWxlY3Rpb25cclxuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBhY3RpdmVPYmplY3QgYXMgZmFicmljLkFjdGl2ZVNlbGVjdGlvbjtcclxuICAgICAgICBjb25zdCBvYmplY3RzID0gc2VsZWN0aW9uLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuXHJcbiAgICAgICAgb2JqZWN0cy5mb3JFYWNoKG9iaiA9PiB7XHJcbiAgICAgICAgICBpZiAob2JqLmlzTGFiZWwgJiYgb2JqLmJvdW5kaW5nQm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQm91bmRpbmdCb3gob2JqLmJvdW5kaW5nQm94LmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBTaW5nbGUgc2VsZWN0aW9uXHJcbiAgICAgICAgY29uc3QgcmVjdCA9IGFjdGl2ZU9iamVjdCBhcyBGYWJyaWNSZWN0YW5nbGU7XHJcbiAgICAgICAgaWYgKHJlY3QuaXNMYWJlbCAmJiByZWN0LmJvdW5kaW5nQm94KSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUJvdW5kaW5nQm94KHJlY3QuYm91bmRpbmdCb3guaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGVzZWxlY3RBbGwoKTtcclxuICAgIHJldHVybiBzZWxlY3RlZEJveGVzO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExhYmVsIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBzaG93TGFiZWxzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyA9IHRydWU7XHJcbiAgICB0aGlzLnVwZGF0ZUxhYmVscygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGhpZGVMYWJlbHMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzID0gZmFsc2U7XHJcbiAgICB0aGlzLnVwZGF0ZUxhYmVscygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZUxhYmVscygpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCkgYXMgRmFicmljUmVjdGFuZ2xlW107XHJcblxyXG4gICAgb2JqZWN0cy5mb3JFYWNoKG9iaiA9PiB7XHJcbiAgICAgIGlmIChvYmouaXNMYWJlbCAmJiBvYmouYm91bmRpbmdCb3gpIHtcclxuICAgICAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0xhYmVscyAmJiAhb2JqLmxhYmVsVGV4dCkge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVMYWJlbFRleHQob2JqKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzICYmIG9iai5sYWJlbFRleHQpIHtcclxuICAgICAgICAgIHRoaXMuX2NhbnZhcyEucmVtb3ZlKG9iai5sYWJlbFRleHQpO1xyXG4gICAgICAgICAgb2JqLmxhYmVsVGV4dCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9IGVsc2UgaWYgKG9iai5sYWJlbFRleHQpIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxUZXh0KG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0TGFiZWxGb250KGZvbnRTaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICB0aGlzLnVwZGF0ZUxhYmVscygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFZpZXdwb3J0IE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyB6b29tSW4oKTogdm9pZCB7XHJcbiAgICBjb25zdCBuZXdab29tID0gTWF0aC5taW4odGhpcy5fc3RhdGUuem9vbSAqIDEuMiwgNSk7XHJcbiAgICB0aGlzLnNldFpvb20obmV3Wm9vbSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgem9vbU91dCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld1pvb20gPSBNYXRoLm1heCh0aGlzLl9zdGF0ZS56b29tIC8gMS4yLCAwLjEpO1xyXG4gICAgdGhpcy5zZXRab29tKG5ld1pvb20pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHpvb21Ub0ZpdCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzIHx8ICF0aGlzLmN1cnJlbnRJbWFnZSkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gdGhpcy5fY2FudmFzLmdldFdpZHRoKCk7XHJcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLl9jYW52YXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICBjb25zdCBpbWFnZVdpZHRoID0gdGhpcy5jdXJyZW50SW1hZ2Uud2lkdGg7XHJcbiAgICBjb25zdCBpbWFnZUhlaWdodCA9IHRoaXMuY3VycmVudEltYWdlLmhlaWdodDtcclxuXHJcbiAgICBjb25zdCBzY2FsZVggPSBjYW52YXNXaWR0aCAvIGltYWdlV2lkdGg7XHJcbiAgICBjb25zdCBzY2FsZVkgPSBjYW52YXNIZWlnaHQgLyBpbWFnZUhlaWdodDtcclxuICAgIGNvbnN0IHpvb20gPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XHJcblxyXG4gICAgdGhpcy5zZXRab29tKHpvb20pO1xyXG4gICAgdGhpcy5yZXNldFBhbigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0Wm9vbSgpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0Wm9vbSgxKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRab29tKHpvb206IG51bWJlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9zdGF0ZS56b29tID0gTWF0aC5tYXgoMC4xLCBNYXRoLm1pbig1LCB6b29tKSk7XHJcbiAgICB0aGlzLl9jYW52YXMuc2V0Wm9vbSh0aGlzLl9zdGF0ZS56b29tKTtcclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnYWZ0ZXI6cmVuZGVyJyxcclxuICAgICAgZGF0YTogeyB6b29tOiB0aGlzLl9zdGF0ZS56b29tIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBhblRvKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N0YXRlLnBhblggPSB4O1xyXG4gICAgdGhpcy5fc3RhdGUucGFuWSA9IHk7XHJcblxyXG4gICAgY29uc3QgdnB0ID0gdGhpcy5fY2FudmFzLnZpZXdwb3J0VHJhbnNmb3JtO1xyXG4gICAgaWYgKHZwdCAmJiB2cHQubGVuZ3RoID49IDYpIHtcclxuICAgICAgdnB0WzRdID0geDtcclxuICAgICAgdnB0WzVdID0geTtcclxuICAgICAgdGhpcy5fY2FudmFzLnNldFZpZXdwb3J0VHJhbnNmb3JtKHZwdCk7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldFBhbigpOiB2b2lkIHtcbiAgICB0aGlzLnBhblRvKDAsIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhbiB0aGUgdmlld3BvcnQgc28gdGhhdCB0aGUgZ2l2ZW4gaW1hZ2UgY29vcmRpbmF0ZXMgYXBwZWFyIGNlbnRlcmVkXG4gICAqL1xuICBwdWJsaWMgZ29Ub0ltYWdlQ29vcmRpbmF0ZXMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuXG4gICAgY29uc3QgY2FudmFzV2lkdGggPSB0aGlzLl9jYW52YXMuZ2V0V2lkdGgoKTtcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLl9jYW52YXMuZ2V0SGVpZ2h0KCk7XG4gICAgY29uc3Qgem9vbSA9IHRoaXMuX3N0YXRlLnpvb207XG5cbiAgICBjb25zdCBjYW52YXNQb2ludCA9IHRoaXMuaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKHsgeCwgeSB9KTtcbiAgICBjb25zdCB2cHQgPSB0aGlzLl9jYW52YXMudmlld3BvcnRUcmFuc2Zvcm07XG4gICAgaWYgKHZwdCAmJiB2cHQubGVuZ3RoID49IDYpIHtcbiAgICAgIHZwdFs0XSA9IGNhbnZhc1dpZHRoIC8gMiAtIHpvb20gKiBjYW52YXNQb2ludC54O1xuICAgICAgdnB0WzVdID0gY2FudmFzSGVpZ2h0IC8gMiAtIHpvb20gKiBjYW52YXNQb2ludC55O1xuICAgICAgdGhpcy5fY2FudmFzLnNldFZpZXdwb3J0VHJhbnNmb3JtKHZwdCk7XG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIG1ldGhvZCB0byBzZXQgem9vbSBieSBwZXJjZW50YWdlIChlLmcuLCAxMDAgPT4gMS4wKVxuICAgKi9cbiAgcHVibGljIHNldFpvb21QZXJjZW50KHBlcmNlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNsYW1wZWQgPSBNYXRoLm1heCgxMCwgTWF0aC5taW4oNTAwLCBwZXJjZW50KSk7XG4gICAgdGhpcy5zZXRab29tKGNsYW1wZWQgLyAxMDApO1xuICB9XG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ3Jvc3NoYWlyIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBzaG93Q3Jvc3NoYWlyKHBvaW50OiBQb2ludCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLmhpZGVDcm9zc2hhaXIoKTtcclxuXHJcbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IHRoaXMuX2NhbnZhcy5nZXRXaWR0aCgpO1xyXG4gICAgY29uc3QgY2FudmFzSGVpZ2h0ID0gdGhpcy5fY2FudmFzLmdldEhlaWdodCgpO1xyXG5cclxuICAgIC8vIEhvcml6b250YWwgbGluZVxyXG4gICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCA9IG5ldyBGYWJyaWNKUy5MaW5lKFswLCBwb2ludC55LCBjYW52YXNXaWR0aCwgcG9pbnQueV0sIHtcbiAgICAgIHN0cm9rZTogJyNmZmZmZmYnLFxyXG4gICAgICBzdHJva2VXaWR0aDogMSxcclxuICAgICAgc3Ryb2tlRGFzaEFycmF5OiBbNSwgNV0sXHJcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxyXG4gICAgICBldmVudGVkOiBmYWxzZSxcclxuICAgICAgZXhjbHVkZUZyb21FeHBvcnQ6IHRydWVcclxuICAgIH0pIGFzIEZhYnJpY0xpbmU7XHJcbiAgICAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCBhcyBhbnkpLmlzQ3Jvc3NoYWlyID0gdHJ1ZTtcclxuICAgICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYIGFzIGFueSkuY3Jvc3NoYWlyVHlwZSA9ICdob3Jpem9udGFsJztcclxuXHJcbiAgICAvLyBWZXJ0aWNhbCBsaW5lXHJcbiAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZID0gbmV3IEZhYnJpY0pTLkxpbmUoW3BvaW50LngsIDAsIHBvaW50LngsIGNhbnZhc0hlaWdodF0sIHtcbiAgICAgIHN0cm9rZTogJyNmZmZmZmYnLFxyXG4gICAgICBzdHJva2VXaWR0aDogMSxcclxuICAgICAgc3Ryb2tlRGFzaEFycmF5OiBbNSwgNV0sXHJcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxyXG4gICAgICBldmVudGVkOiBmYWxzZSxcclxuICAgICAgZXhjbHVkZUZyb21FeHBvcnQ6IHRydWVcclxuICAgIH0pIGFzIEZhYnJpY0xpbmU7XHJcbiAgICAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSBhcyBhbnkpLmlzQ3Jvc3NoYWlyID0gdHJ1ZTtcclxuICAgICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZIGFzIGFueSkuY3Jvc3NoYWlyVHlwZSA9ICd2ZXJ0aWNhbCc7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLmFkZCh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYKTtcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSk7XHJcblxyXG4gICAgLy8gQnJpbmcgY3Jvc3NoYWlyIHRvIGZyb250XHJcbiAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYLmJyaW5nVG9Gcm9udCgpO1xyXG4gICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWS5icmluZ1RvRnJvbnQoKTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGlkZUNyb3NzaGFpcigpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgaWYgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclgpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZSh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYKTtcclxuICAgICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclkpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZSh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZKTtcclxuICAgICAgdGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZUNyb3NzaGFpcihwb2ludDogUG9pbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLmFwcFN0YXRlLmlzQ3Jvc3NoYWlyVmlzaWJsZSkge1xuICAgICAgdGhpcy5oaWRlQ3Jvc3NoYWlyKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT25seSBzaG93IGNyb3NzaGFpciB3aGVuIHBvaW50ZXIgaXMgaW5zaWRlIGEgbGFiZWwgYm94IGFyZWFcbiAgICBjb25zdCBpbWdQdCA9IHRoaXMuY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKHBvaW50KTtcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcbiAgICBjb25zdCBpc0luc2lkZUFueUJveCA9IG9iamVjdHMuc29tZShvYmogPT4ge1xuICAgICAgY29uc3QgYmJveCA9IG9iai5ib3VuZGluZ0JveDtcbiAgICAgIGlmICghb2JqLmlzTGFiZWwgfHwgIWJib3gpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGltZ1B0LnggPj0gYmJveC54ICYmIGltZ1B0LnggPD0gYmJveC54ICsgYmJveC53aWR0aCAmJlxuICAgICAgICBpbWdQdC55ID49IGJib3gueSAmJiBpbWdQdC55IDw9IGJib3gueSArIGJib3guaGVpZ2h0XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaWYgKGlzSW5zaWRlQW55Qm94KSB7XG4gICAgICB0aGlzLnNob3dDcm9zc2hhaXIocG9pbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhpZGVDcm9zc2hhaXIoKTtcbiAgICB9XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDb29yZGluYXRlIENvbnZlcnNpb25cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBjYW52YXNUb0ltYWdlKGNhbnZhc1BvaW50OiBQb2ludCk6IEltYWdlQ29vcmRpbmF0ZSB7XHJcbiAgICBjb25zdCBpbWFnZUNvb3JkcyA9IHRoaXMuY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKGNhbnZhc1BvaW50KTtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB0aGlzLm5vcm1hbGl6ZUNvb3JkaW5hdGVzKGltYWdlQ29vcmRzLCB7XHJcbiAgICAgIHdpZHRoOiB0aGlzLmN1cnJlbnRJbWFnZT8ud2lkdGggfHwgMSxcclxuICAgICAgaGVpZ2h0OiB0aGlzLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IGNhbnZhc1BvaW50LngsXHJcbiAgICAgIHk6IGNhbnZhc1BvaW50LnksXHJcbiAgICAgIGltYWdlWDogaW1hZ2VDb29yZHMueCxcclxuICAgICAgaW1hZ2VZOiBpbWFnZUNvb3Jkcy55LFxyXG4gICAgICBub3JtYWxpemVkXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGltYWdlVG9DYW52YXMoaW1hZ2VQb2ludDogUG9pbnQpOiBDYW52YXNDb29yZGluYXRlIHtcclxuICAgIGNvbnN0IGNhbnZhc0Nvb3JkcyA9IHRoaXMuaW1hZ2VUb0NhbnZhc0Nvb3JkaW5hdGVzKGltYWdlUG9pbnQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IGltYWdlUG9pbnQueCxcclxuICAgICAgeTogaW1hZ2VQb2ludC55LFxyXG4gICAgICBjYW52YXNYOiBjYW52YXNDb29yZHMueCxcclxuICAgICAgY2FudmFzWTogY2FudmFzQ29vcmRzLnlcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbm9ybWFsaXplQ29vcmRpbmF0ZXMoaW1hZ2VQb2ludDogUG9pbnQsIGltYWdlU2l6ZTogU2l6ZSk6IFBvaW50IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IGltYWdlUG9pbnQueCAvIGltYWdlU2l6ZS53aWR0aCxcclxuICAgICAgeTogaW1hZ2VQb2ludC55IC8gaW1hZ2VTaXplLmhlaWdodFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZW5vcm1hbGl6ZUNvb3JkaW5hdGVzKG5vcm1hbGl6ZWRQb2ludDogUG9pbnQsIGltYWdlU2l6ZTogU2l6ZSk6IFBvaW50IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IG5vcm1hbGl6ZWRQb2ludC54ICogaW1hZ2VTaXplLndpZHRoLFxyXG4gICAgICB5OiBub3JtYWxpemVkUG9pbnQueSAqIGltYWdlU2l6ZS5oZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gWU9MTyBGb3JtYXQgQ29udmVyc2lvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGJvdW5kaW5nQm94VG9ZT0xPKGJib3g6IEJvdW5kaW5nQm94LCBpbWFnZVNpemU6IFNpemUpOiBZT0xPTGFiZWwge1xyXG4gICAgY29uc3QgY2VudGVyWCA9IChiYm94LnggKyBiYm94LndpZHRoIC8gMikgLyBpbWFnZVNpemUud2lkdGg7XHJcbiAgICBjb25zdCBjZW50ZXJZID0gKGJib3gueSArIGJib3guaGVpZ2h0IC8gMikgLyBpbWFnZVNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3Qgd2lkdGggPSBiYm94LndpZHRoIC8gaW1hZ2VTaXplLndpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gYmJveC5oZWlnaHQgLyBpbWFnZVNpemUuaGVpZ2h0O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNsYXNzSWQ6IGJib3guY2xhc3NJZCxcclxuICAgICAgY2VudGVyWCxcclxuICAgICAgY2VudGVyWSxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodCxcclxuICAgICAgY29uZmlkZW5jZTogYmJveC5jb25maWRlbmNlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHlvbG9Ub0JvdW5kaW5nQm94KHlvbG86IFlPTE9MYWJlbCwgaW1hZ2VTaXplOiBTaXplKTogQm91bmRpbmdCb3gge1xyXG4gICAgY29uc3Qgd2lkdGggPSB5b2xvLndpZHRoICogaW1hZ2VTaXplLndpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0geW9sby5oZWlnaHQgKiBpbWFnZVNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3QgeCA9ICh5b2xvLmNlbnRlclggKiBpbWFnZVNpemUud2lkdGgpIC0gKHdpZHRoIC8gMik7XHJcbiAgICBjb25zdCB5ID0gKHlvbG8uY2VudGVyWSAqIGltYWdlU2l6ZS5oZWlnaHQpIC0gKGhlaWdodCAvIDIpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlkOiB0aGlzLmdlbmVyYXRlQm91bmRpbmdCb3hJZCgpLFxyXG4gICAgICB4LFxyXG4gICAgICB5LFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgaGVpZ2h0LFxyXG4gICAgICBjbGFzc0lkOiB5b2xvLmNsYXNzSWQsXHJcbiAgICAgIGNvbG9yOiB0aGlzLmdldENsYXNzQ29sb3IoeW9sby5jbGFzc0lkKSxcclxuICAgICAgaXNWaXNpYmxlOiB0cnVlLFxyXG4gICAgICBpc1NlbGVjdGVkOiBmYWxzZSxcclxuICAgICAgY29uZmlkZW5jZTogeW9sby5jb25maWRlbmNlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IEhhbmRsaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBDYW52YXNFdmVudFR5cGUsIGhhbmRsZXI6IENhbnZhc0V2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5fZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIFtdKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50TGlzdGVuZXJzLmdldCh0eXBlKSEucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IENhbnZhc0V2ZW50VHlwZSwgaGFuZGxlcjogQ2FudmFzRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFJlbmRlcmluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlcXVlc3RSZW5kZXIoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZXF1ZXN0UmVuZGVyQWxsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gUHJpdmF0ZSBIZWxwZXIgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cENhbnZhc0V2ZW50cygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuXG4gICAgLy8gTW91c2UgZXZlbnRzXG4gICAgbGV0IGlzUGFubmluZyA9IGZhbHNlO1xuICAgIGxldCBsYXN0UG9zID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOmRvd24nLCAoZSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMuX2NhbnZhcyEuZ2V0UG9pbnRlcihlLmUpO1xuICAgICAgdGhpcy51cGRhdGVDcm9zc2hhaXIocG9pbnRlcik7XG5cbiAgICAgIC8vIFN0YXJ0IHBhbm5pbmcgb24gbWlkZGxlIGNsaWNrIG9yIHdoZW4gQWx0IHByZXNzZWQgKHJpZ2h0LWNsaWNrIHJlc2VydmVkIGZvciBtb2RlIHRvZ2dsZSlcbiAgICAgIGNvbnN0IGV2ID0gZS5lIGFzIE1vdXNlRXZlbnQ7XG4gICAgICBjb25zdCBzdGFydFBhbiA9IGV2LmJ1dHRvbiA9PT0gMSB8fCBldi5hbHRLZXkgfHwgKGV2IGFzIGFueSkuc3BhY2VLZXk7XG4gICAgICBpZiAoc3RhcnRQYW4pIHtcbiAgICAgICAgaXNQYW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgbGFzdFBvcyA9IHsgeDogZXYuY2xpZW50WCwgeTogZXYuY2xpZW50WSB9O1xuICAgICAgICB0aGlzLl9jYW52YXMhLnNldEN1cnNvcignZ3JhYmJpbmcnKTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUgPT09ICdkcmF3JyAmJiAhZS50YXJnZXQpIHtcbiAgICAgICAgdGhpcy5zdGFydERyYXdpbmcocG9pbnRlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOm1vdmUnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMuX2NhbnZhcyEuZ2V0UG9pbnRlcihlLmUpO1xuICAgICAgdGhpcy51cGRhdGVDcm9zc2hhaXIocG9pbnRlcik7XG5cbiAgICAgIC8vIERpc3BhdGNoIG1vdXNlIG1vdmUgd2l0aCBjYW52YXMvaW1hZ2UgY29vcmRpbmF0ZXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGltYWdlUHQgPSB0aGlzLmNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyhwb2ludGVyKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICB0eXBlOiAnbW91c2U6bW92ZScsXG4gICAgICAgICAgcG9pbnRlcixcbiAgICAgICAgICBkYXRhOiB7IGNhbnZhczogeyB4OiBwb2ludGVyLngsIHk6IHBvaW50ZXIueSB9LCBpbWFnZTogeyB4OiBpbWFnZVB0LngsIHk6IGltYWdlUHQueSB9IH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIHt9XG5cbiAgICAgIGlmIChpc1Bhbm5pbmcpIHtcbiAgICAgICAgY29uc3QgZXYgPSBlLmUgYXMgTW91c2VFdmVudDtcbiAgICAgICAgY29uc3QgdjogYW55ID0gdGhpcy5fY2FudmFzIS52aWV3cG9ydFRyYW5zZm9ybSBhcyBhbnk7XG4gICAgICAgIGlmICghdiB8fCB2Lmxlbmd0aCA8IDYpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdls0XSArPSBldi5jbGllbnRYIC0gbGFzdFBvcy54O1xuICAgICAgICB2WzVdICs9IGV2LmNsaWVudFkgLSBsYXN0UG9zLnk7XG4gICAgICAgIHRoaXMuX2NhbnZhcyEuc2V0Vmlld3BvcnRUcmFuc2Zvcm0odiBhcyBudW1iZXJbXSk7XG4gICAgICAgIGxhc3RQb3MgPSB7IHg6IGV2LmNsaWVudFgsIHk6IGV2LmNsaWVudFkgfTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3N0YXRlLmlzRHJhd2luZykge1xuICAgICAgICB0aGlzLnVwZGF0ZURyYXdpbmcocG9pbnRlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOnVwJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLl9jYW52YXMhLmdldFBvaW50ZXIoZS5lKTtcblxuICAgICAgaWYgKGlzUGFubmluZykge1xuICAgICAgICBpc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5zZXRDdXJzb3IoJ2RlZmF1bHQnKTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3N0YXRlLmlzRHJhd2luZykge1xuICAgICAgICB0aGlzLmZpbmlzaERyYXdpbmcocG9pbnRlcik7XG4gICAgICB9XG4gICAgfSk7XG5cclxuICAgIC8vIFNlbGVjdGlvbiBldmVudHNcclxuICAgIHRoaXMuX2NhbnZhcy5vbignc2VsZWN0aW9uOmNyZWF0ZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7IHR5cGU6ICdzZWxlY3Rpb246Y3JlYXRlZCcgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMub24oJ3NlbGVjdGlvbjp1cGRhdGVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoeyB0eXBlOiAnc2VsZWN0aW9uOnVwZGF0ZWQnIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLm9uKCdzZWxlY3Rpb246Y2xlYXJlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZE9iamVjdHMoKTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHsgdHlwZTogJ3NlbGVjdGlvbjpjbGVhcmVkJyB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9iamVjdCBtb2RpZmljYXRpb24gZXZlbnRzXHJcbiAgICB0aGlzLl9jYW52YXMub24oJ29iamVjdDptb2RpZmllZCcsIChlKSA9PiB7XG4gICAgICBpZiAoZS50YXJnZXQpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVPYmplY3RNb2RpZmllZChlLnRhcmdldCBhcyBGYWJyaWNSZWN0YW5nbGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gV2hlZWwgem9vbSAoem9vbSB0byBwb2ludGVyKVxuICAgIHRoaXMuX2NhbnZhcy5vbignbW91c2U6d2hlZWwnLCAob3B0OiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRlbHRhID0gb3B0LmUuZGVsdGFZO1xuICAgICAgbGV0IHpvb20gPSB0aGlzLl9zdGF0ZS56b29tO1xuICAgICAgem9vbSAqPSBkZWx0YSA+IDAgPyAwLjkgOiAxLjE7XG4gICAgICB6b29tID0gTWF0aC5tYXgoMC4xLCBNYXRoLm1pbig1LCB6b29tKSk7XG5cbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IEZhYnJpY0pTLlBvaW50KG9wdC5lLm9mZnNldFgsIG9wdC5lLm9mZnNldFkpO1xuICAgICAgdGhpcy5fY2FudmFzIS56b29tVG9Qb2ludChwb2ludCwgem9vbSk7XG4gICAgICB0aGlzLl9zdGF0ZS56b29tID0gem9vbTtcblxuICAgICAgb3B0LmUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIG9wdC5lLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBseU1vZGVTZXR0aW5ncyhtb2RlPzogJ2RyYXcnIHwgJ2VkaXQnKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcbiAgICBjb25zdCBtID0gbW9kZSB8fCB0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlO1xuXG4gICAgLy8gSW4gZHJhdyBtb2RlLCBkaXNhYmxlIHNlbGVjdGlvbiBhbmQgdGFyZ2V0IGZpbmRpbmcgdG8gbWFrZSBkcmF3aW5nIGVhc2llclxuICAgIGNvbnN0IGRyYXdNb2RlID0gbSA9PT0gJ2RyYXcnO1xuICAgICh0aGlzLl9jYW52YXMgYXMgYW55KS5zZWxlY3Rpb24gPSAhZHJhd01vZGU7XG4gICAgKHRoaXMuX2NhbnZhcyBhcyBhbnkpLnNraXBUYXJnZXRGaW5kID0gZHJhd01vZGU7XG5cbiAgICAvLyBVcGRhdGUgb2JqZWN0IHNlbGVjdGFiaWxpdHkgYmFzZWQgb24gbW9kZVxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpO1xuICAgIG9iamVjdHMuZm9yRWFjaChvYmogPT4ge1xuICAgICAgb2JqLnNlbGVjdGFibGUgPSAhZHJhd01vZGU7XG4gICAgICBvYmouZXZlbnRlZCA9ICFkcmF3TW9kZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2NhbnZhcy5yZXF1ZXN0UmVuZGVyQWxsKCk7XG4gIH1cblxyXG4gIHByaXZhdGUgdXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBhY3RpdmVPYmplY3QgPSB0aGlzLl9jYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCk7XHJcblxyXG4gICAgaWYgKCFhY3RpdmVPYmplY3QpIHtcclxuICAgICAgdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzID0gW107XHJcbiAgICAgIHRoaXMuX3N0YXRlLm11bHRpcGxlU2VsZWN0aW9uID0gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKGFjdGl2ZU9iamVjdC50eXBlID09PSAnYWN0aXZlU2VsZWN0aW9uJykge1xyXG4gICAgICB0aGlzLl9zdGF0ZS5zZWxlY3RlZE9iamVjdHMgPSAoYWN0aXZlT2JqZWN0IGFzIGZhYnJpYy5BY3RpdmVTZWxlY3Rpb24pLmdldE9iamVjdHMoKTtcclxuICAgICAgdGhpcy5fc3RhdGUubXVsdGlwbGVTZWxlY3Rpb24gPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fc3RhdGUuc2VsZWN0ZWRPYmplY3RzID0gW2FjdGl2ZU9iamVjdF07XHJcbiAgICAgIHRoaXMuX3N0YXRlLm11bHRpcGxlU2VsZWN0aW9uID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU9iamVjdE1vZGlmaWVkKHJlY3Q6IEZhYnJpY1JlY3RhbmdsZSk6IHZvaWQge1xyXG4gICAgaWYgKCFyZWN0LmlzTGFiZWwgfHwgIXJlY3QuYm91bmRpbmdCb3ggfHwgIXRoaXMuaW1hZ2VPYmplY3QpIHJldHVybjtcclxuXHJcbiAgICAvLyBDb252ZXJ0IGJhY2sgdG8gaW1hZ2UgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IGltYWdlQ29vcmRzID0gdGhpcy5jYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMoe1xyXG4gICAgICB4OiByZWN0LmxlZnQgfHwgMCxcclxuICAgICAgeTogcmVjdC50b3AgfHwgMFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW1hZ2VXaWR0aCA9IChyZWN0LndpZHRoIHx8IDApIC8gKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDEpO1xyXG4gICAgY29uc3QgaW1hZ2VIZWlnaHQgPSAocmVjdC5oZWlnaHQgfHwgMCkgLyAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMSk7XHJcblxyXG4gICAgLy8gVXBkYXRlIGJvdW5kaW5nIGJveFxyXG4gICAgcmVjdC5ib3VuZGluZ0JveC54ID0gaW1hZ2VDb29yZHMueDtcclxuICAgIHJlY3QuYm91bmRpbmdCb3gueSA9IGltYWdlQ29vcmRzLnk7XHJcbiAgICByZWN0LmJvdW5kaW5nQm94LndpZHRoID0gaW1hZ2VXaWR0aDtcclxuICAgIHJlY3QuYm91bmRpbmdCb3guaGVpZ2h0ID0gaW1hZ2VIZWlnaHQ7XHJcblxyXG4gICAgLy8gVXBkYXRlIGxhYmVsIHRleHQgcG9zaXRpb25cclxuICAgIGlmIChyZWN0LmxhYmVsVGV4dCkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUxhYmVsVGV4dChyZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnb2JqZWN0Om1vZGlmaWVkJyxcclxuICAgICAgdGFyZ2V0OiByZWN0LFxyXG4gICAgICBkYXRhOiB7IGJvdW5kaW5nQm94OiByZWN0LmJvdW5kaW5nQm94IH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVMYWJlbFRleHQocmVjdDogRmFicmljUmVjdGFuZ2xlKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhcmVjdC5ib3VuZGluZ0JveCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGJib3ggPSByZWN0LmJvdW5kaW5nQm94O1xyXG4gICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5hcHBTdGF0ZS5jbGFzc05hbWVzLmdldChiYm94LmNsYXNzSWQudG9TdHJpbmcoKSkgfHwgYENsYXNzICR7YmJveC5jbGFzc0lkfWA7XHJcblxyXG4gICAgbGV0IGxhYmVsVGV4dCA9ICcnO1xyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDbGFzc0lkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBiYm94LmNsYXNzSWQudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q2xhc3NOYW1lKSB7XHJcbiAgICAgIGlmIChsYWJlbFRleHQpIGxhYmVsVGV4dCArPSAnOiAnO1xyXG4gICAgICBsYWJlbFRleHQgKz0gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDb25maWRlbmNlICYmIGJib3guY29uZmlkZW5jZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBgICgkeyhiYm94LmNvbmZpZGVuY2UgKiAxMDApLnRvRml4ZWQoMSl9JSlgO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRleHQgPSBuZXcgRmFicmljSlMuVGV4dChsYWJlbFRleHQsIHtcbiAgICAgIGxlZnQ6IChyZWN0LmxlZnQgfHwgMCkgKyAyLFxuICAgICAgdG9wOiAocmVjdC50b3AgfHwgMCkgLSB0aGlzLmxhYmVsT3B0aW9ucy5mb250U2l6ZSAtIDIsXG4gICAgICBmb250U2l6ZTogdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUsXG4gICAgICBmb250RmFtaWx5OiB0aGlzLmxhYmVsT3B0aW9ucy5mb250RmFtaWx5LFxuICAgICAgZmlsbDogdGhpcy5sYWJlbE9wdGlvbnMuZm9udENvbG9yLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLmxhYmVsT3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IsXG4gICAgICAvLyBBdm9pZCBpbnZhbGlkIGJhc2VsaW5lIHZhbHVlIHdhcm5pbmdzOyBlbnN1cmUgY2FudmFzIHVzZXMgYSB2YWxpZCBiYXNlbGluZVxuICAgICAgdGV4dEJhc2VsaW5lOiAnYWxwaGFiZXRpYycsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGV2ZW50ZWQ6IGZhbHNlXG4gICAgfSkgYXMgRmFicmljVGV4dDtcblxyXG4gICAgdGV4dC5wYXJlbnRSZWN0ID0gcmVjdDtcclxuICAgIHRleHQuYm91bmRpbmdCb3ggPSBiYm94O1xyXG4gICAgdGV4dC5pc0xhYmVsID0gdHJ1ZTtcclxuXHJcbiAgICByZWN0LmxhYmVsVGV4dCA9IHRleHQ7XHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHRleHQpO1xyXG4gICAgdGV4dC5icmluZ1RvRnJvbnQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlTGFiZWxUZXh0KHJlY3Q6IEZhYnJpY1JlY3RhbmdsZSk6IHZvaWQge1xyXG4gICAgaWYgKCFyZWN0LmxhYmVsVGV4dCB8fCAhcmVjdC5ib3VuZGluZ0JveCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGJib3ggPSByZWN0LmJvdW5kaW5nQm94O1xyXG4gICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5hcHBTdGF0ZS5jbGFzc05hbWVzLmdldChiYm94LmNsYXNzSWQudG9TdHJpbmcoKSkgfHwgYENsYXNzICR7YmJveC5jbGFzc0lkfWA7XHJcblxyXG4gICAgbGV0IGxhYmVsVGV4dCA9ICcnO1xyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDbGFzc0lkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBiYm94LmNsYXNzSWQudG9TdHJpbmcoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93Q2xhc3NOYW1lKSB7XHJcbiAgICAgIGlmIChsYWJlbFRleHQpIGxhYmVsVGV4dCArPSAnOiAnO1xyXG4gICAgICBsYWJlbFRleHQgKz0gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDb25maWRlbmNlICYmIGJib3guY29uZmlkZW5jZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBgICgkeyhiYm94LmNvbmZpZGVuY2UgKiAxMDApLnRvRml4ZWQoMSl9JSlgO1xyXG4gICAgfVxyXG5cclxuICAgIHJlY3QubGFiZWxUZXh0LnNldCh7XHJcbiAgICAgIHRleHQ6IGxhYmVsVGV4dCxcclxuICAgICAgbGVmdDogKHJlY3QubGVmdCB8fCAwKSArIDIsXHJcbiAgICAgIHRvcDogKHJlY3QudG9wIHx8IDApIC0gdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUgLSAyLFxyXG4gICAgICBmb250U2l6ZTogdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUsXHJcbiAgICAgIGZpbGw6IHRoaXMubGFiZWxPcHRpb25zLmZvbnRDb2xvcixcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLmxhYmVsT3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3JcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMoY2FudmFzUG9pbnQ6IFBvaW50KTogUG9pbnQge1xuICAgIGlmICghdGhpcy5pbWFnZU9iamVjdCkgcmV0dXJuIGNhbnZhc1BvaW50O1xuXG4gICAgY29uc3Qgc2NhbGVYID0gdGhpcy5pbWFnZU9iamVjdC5zY2FsZVggfHwgMTtcbiAgICBjb25zdCBzY2FsZVkgPSB0aGlzLmltYWdlT2JqZWN0LnNjYWxlWSB8fCAxO1xuICAgIGNvbnN0IGltZ0xlZnQgPSB0aGlzLmltYWdlT2JqZWN0LmxlZnQgfHwgMDtcbiAgICBjb25zdCBpbWdUb3AgPSB0aGlzLmltYWdlT2JqZWN0LnRvcCB8fCAwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IChjYW52YXNQb2ludC54IC0gaW1nTGVmdCkgLyBzY2FsZVgsXG4gICAgICB5OiAoY2FudmFzUG9pbnQueSAtIGltZ1RvcCkgLyBzY2FsZVlcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBpbWFnZVRvQ2FudmFzQ29vcmRpbmF0ZXMoaW1hZ2VQb2ludDogUG9pbnQpOiBQb2ludCB7XG4gICAgaWYgKCF0aGlzLmltYWdlT2JqZWN0KSByZXR1cm4gaW1hZ2VQb2ludDtcblxuICAgIGNvbnN0IHNjYWxlWCA9IHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDE7XG4gICAgY29uc3Qgc2NhbGVZID0gdGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMTtcbiAgICBjb25zdCBpbWdMZWZ0ID0gdGhpcy5pbWFnZU9iamVjdC5sZWZ0IHx8IDA7XG4gICAgY29uc3QgaW1nVG9wID0gdGhpcy5pbWFnZU9iamVjdC50b3AgfHwgMDtcblxuICAgIHJldHVybiB7XG4gICAgICB4OiBpbWFnZVBvaW50LnggKiBzY2FsZVggKyBpbWdMZWZ0LFxuICAgICAgeTogaW1hZ2VQb2ludC55ICogc2NhbGVZICsgaW1nVG9wXG4gICAgfTtcbiAgfVxuXHJcbiAgcHJpdmF0ZSBnZW5lcmF0ZUJvdW5kaW5nQm94SWQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgYmJveF8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldENsYXNzQ29sb3IoY2xhc3NJZDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBjb2xvclBhbGV0dGVbY2xhc3NJZCAlIGNvbG9yUGFsZXR0ZS5sZW5ndGhdIHx8ICcjZmYwMDAwJztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3luY1dpdGhBcHBTdGF0ZSgpOiB2b2lkIHtcclxuICAgIC8vIFN5bmMgbGFiZWwgZGlzcGxheSBvcHRpb25zIHdpdGggYXBwIHN0YXRlXHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzID0gdGhpcy5hcHBTdGF0ZS5zaG93TGFiZWxzT25DYW52YXM7XHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5mb250U2l6ZSA9IHRoaXMuYXBwU3RhdGUubGFiZWxGb250U2l6ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudChldmVudDogQ2FudmFzRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBjYW52YXMgZXZlbnQgaGFuZGxlciBmb3IgJHtldmVudC50eXBlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBWYWxpZGF0aW9uIGFuZCBQZXJmb3JtYW5jZVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHZhbGlkYXRlKCk6IENhbnZhc1ZhbGlkYXRpb24ge1xyXG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0NhbnZhcyBub3QgaW5pdGlhbGl6ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuY3VycmVudEltYWdlKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ05vIGltYWdlIGxvYWRlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG9iamVjdENvdW50ID0gdGhpcy5fY2FudmFzPy5nZXRPYmplY3RzKCkubGVuZ3RoIHx8IDA7XHJcbiAgICBpZiAob2JqZWN0Q291bnQgPiAxMDApIHtcclxuICAgICAgd2FybmluZ3MucHVzaChgSGlnaCBvYmplY3QgY291bnQ6ICR7b2JqZWN0Q291bnR9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHBlcmZvcm1hbmNlIG1ldHJpY3NcclxuICAgIHRoaXMucGVyZm9ybWFuY2VNZXRyaWNzLm9iamVjdENvdW50ID0gb2JqZWN0Q291bnQ7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCxcclxuICAgICAgZXJyb3JzLFxyXG4gICAgICB3YXJuaW5ncyxcclxuICAgICAgcGVyZm9ybWFuY2U6IHRoaXMucGVyZm9ybWFuY2VNZXRyaWNzXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDYW52YXNDb250cm9sbGVyKGFwcFN0YXRlOiBJQXBwU3RhdGUpOiBDYW52YXNDb250cm9sbGVyIHtcclxuICByZXR1cm4gbmV3IENhbnZhc0NvbnRyb2xsZXIoYXBwU3RhdGUpO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FudmFzQ29udHJvbGxlcjtcclxuZXhwb3J0IHR5cGUgeyBJQ2FudmFzQ29udHJvbGxlciB9O1xuIiwiLyoqXHJcbiAqIEV2ZW50IE1hbmFnZXIgSW1wbGVtZW50YXRpb25cclxuICpcclxuICogSGFuZGxlcyBrZXlib2FyZCBzaG9ydGN1dHMsIG1vdXNlIGV2ZW50cywgY29udGV4dCBtZW51cywgYW5kIHVzZXIgaW50ZXJhY3Rpb25zXHJcbiAqIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICpcclxuICogQHZlcnNpb24gMS4wLjBcclxuICogQGF1dGhvciBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuLi90eXBlcyc7XHJcbmltcG9ydCB7IElBcHBTdGF0ZSB9IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcbmltcG9ydCB7IElDYW52YXNDb250cm9sbGVyLCBCb3VuZGluZ0JveCB9IGZyb20gJy4uL3R5cGVzL2NhbnZhcyc7XHJcbmltcG9ydCB7IElGaWxlU3lzdGVtU2VydmljZSB9IGZyb20gJy4uL3R5cGVzL2ZpbGVzeXN0ZW0nO1xyXG5pbXBvcnQge1xyXG4gIEV2ZW50TWFuYWdlckNvbmZpZyxcclxuICBLZXlib2FyZFNob3J0Y3V0LFxyXG4gIE1vdXNlRXZlbnRUeXBlLFxyXG4gIENvbnRleHRNZW51RXZlbnQsXHJcbiAgRXZlbnRNYW5hZ2VyRXZlbnQsXHJcbiAgRXZlbnRNYW5hZ2VyRXZlbnRIYW5kbGVyLFxyXG4gIElFdmVudE1hbmFnZXJcclxufSBmcm9tICcuLi90eXBlcy91aSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV2ZW50IE1hbmFnZXIgSW1wbGVtZW50YXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciBpbXBsZW1lbnRzIElFdmVudE1hbmFnZXIge1xyXG4gIC8vIERlcGVuZGVuY2llc1xyXG4gIHByaXZhdGUgYXBwU3RhdGU6IElBcHBTdGF0ZTtcclxuICBwcml2YXRlIGNhbnZhc0NvbnRyb2xsZXI6IElDYW52YXNDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgZmlsZVN5c3RlbVNlcnZpY2U6IElGaWxlU3lzdGVtU2VydmljZTtcclxuXHJcbiAgLy8gRXZlbnQgaGFuZGxlcnMgYW5kIHN0YXRlXHJcbiAgcHJpdmF0ZSBldmVudExpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBFdmVudE1hbmFnZXJFdmVudEhhbmRsZXJbXT4oKTtcclxuICBwcml2YXRlIGtleWJvYXJkSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgS2V5Ym9hcmRTaG9ydGN1dD4oKTtcclxuICBwcml2YXRlIGNvbnRleHRNZW51VGFyZ2V0OiBhbnkgPSBudWxsO1xyXG4gIHByaXZhdGUgaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG4gIHByaXZhdGUgbGFzdE1vdXNlUG9zaXRpb246IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblxyXG4gIC8vIENvbmZpZ3VyYXRpb25cclxuICBwcml2YXRlIGNvbmZpZzogRXZlbnRNYW5hZ2VyQ29uZmlnID0ge1xyXG4gICAgZW5hYmxlS2V5Ym9hcmRTaG9ydGN1dHM6IHRydWUsXHJcbiAgICBlbmFibGVDb250ZXh0TWVudTogdHJ1ZSxcclxuICAgIGVuYWJsZURyYWdBbmREcm9wOiB0cnVlLFxyXG4gICAgZG91YmxlQ2xpY2tEZWxheTogMzAwLFxyXG4gICAgbG9uZ1ByZXNzRGVsYXk6IDUwMCxcclxuICAgIGRyYWdUaHJlc2hvbGQ6IDVcclxuICB9O1xyXG5cclxuICAvLyBLZXlib2FyZCBzaG9ydGN1dHNcclxuICBwcml2YXRlIHNob3J0Y3V0czogS2V5Ym9hcmRTaG9ydGN1dFtdID0gW1xyXG4gICAgLy8gRmlsZSBvcGVyYXRpb25zXHJcbiAgICB7IGtleTogJ0tleVMnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1NhdmUgbGFiZWxzJywgYWN0aW9uOiAnc2F2ZScgfSxcclxuICAgIHsga2V5OiAnS2V5TycsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnT3BlbiBmb2xkZXInLCBhY3Rpb246ICdvcGVuLWZvbGRlcicgfSxcclxuXHJcbiAgICAvLyBNb2RlIHN3aXRjaGluZ1xyXG4gICAgeyBrZXk6ICdLZXlEJywgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gZHJhdyBtb2RlJywgYWN0aW9uOiAnbW9kZS1kcmF3JyB9LFxyXG4gICAgeyBrZXk6ICdLZXlFJywgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gZWRpdCBtb2RlJywgYWN0aW9uOiAnbW9kZS1lZGl0JyB9LFxyXG4gICAgeyBrZXk6ICdUYWInLCBkZXNjcmlwdGlvbjogJ1RvZ2dsZSBtb2RlJywgYWN0aW9uOiAnbW9kZS10b2dnbGUnIH0sXHJcblxyXG4gICAgLy8gQ2FudmFzIG9wZXJhdGlvbnNcclxuICAgIHsga2V5OiAnRGVsZXRlJywgZGVzY3JpcHRpb246ICdEZWxldGUgc2VsZWN0ZWQnLCBhY3Rpb246ICdkZWxldGUtc2VsZWN0ZWQnIH0sXHJcbiAgICB7IGtleTogJ0JhY2tzcGFjZScsIGRlc2NyaXB0aW9uOiAnRGVsZXRlIHNlbGVjdGVkJywgYWN0aW9uOiAnZGVsZXRlLXNlbGVjdGVkJyB9LFxyXG4gICAgeyBrZXk6ICdFc2NhcGUnLCBkZXNjcmlwdGlvbjogJ0NhbmNlbC9EZXNlbGVjdCcsIGFjdGlvbjogJ2NhbmNlbCcgfSxcclxuICAgIHsga2V5OiAnS2V5QScsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnU2VsZWN0IGFsbCcsIGFjdGlvbjogJ3NlbGVjdC1hbGwnIH0sXHJcblxyXG4gICAgLy8gWm9vbSBhbmQgdmlld1xyXG4gICAgeyBrZXk6ICdFcXVhbCcsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnWm9vbSBpbicsIGFjdGlvbjogJ3pvb20taW4nIH0sXHJcbiAgICB7IGtleTogJ01pbnVzJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdab29tIG91dCcsIGFjdGlvbjogJ3pvb20tb3V0JyB9LFxyXG4gICAgeyBrZXk6ICdEaWdpdDAnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1Jlc2V0IHpvb20nLCBhY3Rpb246ICd6b29tLXJlc2V0JyB9LFxyXG4gICAgeyBrZXk6ICdLZXlGJywgZGVzY3JpcHRpb246ICdab29tIHRvIGZpdCcsIGFjdGlvbjogJ3pvb20tZml0JyB9LFxyXG5cclxuICAgIC8vIE5hdmlnYXRpb25cclxuICAgIHsga2V5OiAnQXJyb3dMZWZ0JywgZGVzY3JpcHRpb246ICdQcmV2aW91cyBpbWFnZScsIGFjdGlvbjogJ3ByZXYtaW1hZ2UnIH0sXHJcbiAgICB7IGtleTogJ0Fycm93UmlnaHQnLCBkZXNjcmlwdGlvbjogJ05leHQgaW1hZ2UnLCBhY3Rpb246ICduZXh0LWltYWdlJyB9LFxyXG4gICAgeyBrZXk6ICdIb21lJywgZGVzY3JpcHRpb246ICdGaXJzdCBpbWFnZScsIGFjdGlvbjogJ2ZpcnN0LWltYWdlJyB9LFxyXG4gICAgeyBrZXk6ICdFbmQnLCBkZXNjcmlwdGlvbjogJ0xhc3QgaW1hZ2UnLCBhY3Rpb246ICdsYXN0LWltYWdlJyB9LFxyXG5cclxuICAgIC8vIExhYmVscyBhbmQgY2xhc3Nlc1xyXG4gICAgeyBrZXk6ICdLZXlMJywgZGVzY3JpcHRpb246ICdUb2dnbGUgbGFiZWxzIHZpc2liaWxpdHknLCBhY3Rpb246ICd0b2dnbGUtbGFiZWxzJyB9LFxyXG4gICAgeyBrZXk6ICdLZXlDJywgZGVzY3JpcHRpb246ICdUb2dnbGUgY3Jvc3NoYWlyJywgYWN0aW9uOiAndG9nZ2xlLWNyb3NzaGFpcicgfSxcclxuICAgIHsga2V5OiAnS2V5SCcsIGRlc2NyaXB0aW9uOiAnVG9nZ2xlIGhlbHAnLCBhY3Rpb246ICd0b2dnbGUtaGVscCcgfSxcclxuXHJcbiAgICAvLyBDb3B5L1Bhc3RlXHJcbiAgICB7IGtleTogJ0tleUMnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ0NvcHkgc2VsZWN0ZWQnLCBhY3Rpb246ICdjb3B5JyB9LFxyXG4gICAgeyBrZXk6ICdLZXlWJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdQYXN0ZScsIGFjdGlvbjogJ3Bhc3RlJyB9LFxyXG4gICAgeyBrZXk6ICdLZXlYJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdDdXQgc2VsZWN0ZWQnLCBhY3Rpb246ICdjdXQnIH0sXHJcblxyXG4gICAgLy8gVW5kby9SZWRvIChmb3IgZnV0dXJlIGltcGxlbWVudGF0aW9uKVxyXG4gICAgeyBrZXk6ICdLZXlaJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdVbmRvJywgYWN0aW9uOiAndW5kbycgfSxcclxuICAgIHsga2V5OiAnS2V5WScsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnUmVkbycsIGFjdGlvbjogJ3JlZG8nIH0sXHJcbiAgICB7IGtleTogJ0tleVonLCBjdHJsS2V5OiB0cnVlLCBzaGlmdEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdSZWRvJywgYWN0aW9uOiAncmVkbycgfVxyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgYXBwU3RhdGU6IElBcHBTdGF0ZSxcclxuICAgIGNhbnZhc0NvbnRyb2xsZXI6IElDYW52YXNDb250cm9sbGVyLFxyXG4gICAgZmlsZVN5c3RlbVNlcnZpY2U6IElGaWxlU3lzdGVtU2VydmljZSxcclxuICAgIGNvbmZpZz86IFBhcnRpYWw8RXZlbnRNYW5hZ2VyQ29uZmlnPlxyXG4gICkge1xyXG4gICAgdGhpcy5hcHBTdGF0ZSA9IGFwcFN0YXRlO1xyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyID0gY2FudmFzQ29udHJvbGxlcjtcclxuICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgPSBmaWxlU3lzdGVtU2VydmljZTtcclxuXHJcbiAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgIHRoaXMuY29uZmlnID0geyAuLi50aGlzLmNvbmZpZywgLi4uY29uZmlnIH07XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRIYW5kbGVycygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEluaXRpYWxpemF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVFdmVudEhhbmRsZXJzKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLmVuYWJsZUtleWJvYXJkU2hvcnRjdXRzKSB7XHJcbiAgICAgIHRoaXMuc2V0dXBLZXlib2FyZEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNvbmZpZy5lbmFibGVDb250ZXh0TWVudSkge1xyXG4gICAgICB0aGlzLnNldHVwQ29udGV4dE1lbnVFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcuZW5hYmxlRHJhZ0FuZERyb3ApIHtcclxuICAgICAgdGhpcy5zZXR1cERyYWdBbmREcm9wRXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXR1cE1vdXNlRXZlbnRzKCk7XHJcbiAgICB0aGlzLnNldHVwQ2FudmFzRXZlbnRzKCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gS2V5Ym9hcmQgRXZlbnQgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBLZXlib2FyZEV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIEJ1aWxkIGtleWJvYXJkIHNob3J0Y3V0cyBtYXBcclxuICAgIHRoaXMuc2hvcnRjdXRzLmZvckVhY2goc2hvcnRjdXQgPT4ge1xyXG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmdldFNob3J0Y3V0S2V5KHNob3J0Y3V0KTtcclxuICAgICAgdGhpcy5rZXlib2FyZEhhbmRsZXJzLnNldChrZXksIHNob3J0Y3V0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdsb2JhbCBrZXlib2FyZCBldmVudCBsaXN0ZW5lclxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5oYW5kbGVLZXlVcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlS2V5RG93bihldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgLy8gSWdub3JlIGV2ZW50cyBmcm9tIGlucHV0IGVsZW1lbnRzICh1bmxlc3MgZ2xvYmFsIHNob3J0Y3V0cylcclxuICAgIGlmICh0aGlzLmlzSW5wdXRFbGVtZW50KGV2ZW50LnRhcmdldCBhcyBFbGVtZW50KSAmJiAhdGhpcy5pc0dsb2JhbFNob3J0Y3V0KGV2ZW50KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qga2V5ID0gdGhpcy5nZXRFdmVudEtleShldmVudCk7XHJcbiAgICBjb25zdCBzaG9ydGN1dCA9IHRoaXMua2V5Ym9hcmRIYW5kbGVycy5nZXQoa2V5KTtcclxuXHJcbiAgICBpZiAoc2hvcnRjdXQpIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIHRoaXMuZXhlY3V0ZVNob3J0Y3V0KHNob3J0Y3V0LCBldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUtleVVwKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgICAvLyBIYW5kbGUgYW55IGtleSB1cCBzcGVjaWZpYyBsb2dpYyBoZXJlXHJcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xyXG4gICAgICB0aGlzLmhhbmRsZUVzY2FwZUtleSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBleGVjdXRlU2hvcnRjdXQoc2hvcnRjdXQ6IEtleWJvYXJkU2hvcnRjdXQsIGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgICBzd2l0Y2ggKHNob3J0Y3V0LmFjdGlvbikge1xyXG4gICAgICAvLyBGaWxlIG9wZXJhdGlvbnNcclxuICAgICAgY2FzZSAnc2F2ZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTYXZlTGFiZWxzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ29wZW4tZm9sZGVyJzpcclxuICAgICAgICB0aGlzLmhhbmRsZU9wZW5Gb2xkZXIoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIE1vZGUgc3dpdGNoaW5nXHJcbiAgICAgIGNhc2UgJ21vZGUtZHJhdyc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKCdkcmF3Jyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21vZGUtZWRpdCc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKCdlZGl0Jyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21vZGUtdG9nZ2xlJzpcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLnRvZ2dsZU1vZGUoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIENhbnZhcyBvcGVyYXRpb25zXHJcbiAgICAgIGNhc2UgJ2RlbGV0ZS1zZWxlY3RlZCc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVEZWxldGVTZWxlY3RlZCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjYW5jZWwnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlQ2FuY2VsKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3NlbGVjdC1hbGwnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlU2VsZWN0QWxsKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBab29tIGFuZCB2aWV3XHJcbiAgICAgIGNhc2UgJ3pvb20taW4nOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tSW4oKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnem9vbS1vdXQnOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tT3V0KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3pvb20tcmVzZXQnOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5yZXNldFpvb20oKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnem9vbS1maXQnOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tVG9GaXQoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIE5hdmlnYXRpb25cclxuICAgICAgY2FzZSAncHJldi1pbWFnZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVQcmV2aW91c0ltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ25leHQtaW1hZ2UnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlTmV4dEltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2ZpcnN0LWltYWdlJzpcclxuICAgICAgICB0aGlzLmhhbmRsZUZpcnN0SW1hZ2UoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGFzdC1pbWFnZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVMYXN0SW1hZ2UoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIExhYmVscyBhbmQgVUlcclxuICAgICAgY2FzZSAndG9nZ2xlLWxhYmVscyc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRTaG93TGFiZWxzKCF0aGlzLmFwcFN0YXRlLnNob3dMYWJlbHNPbkNhbnZhcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnVwZGF0ZUxhYmVscygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd0b2dnbGUtY3Jvc3NoYWlyJzpcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLnRvZ2dsZUNyb3NzaGFpcigpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgLy8gQ29weS9QYXN0ZVxyXG4gICAgICBjYXNlICdjb3B5JzpcclxuICAgICAgICB0aGlzLmhhbmRsZUNvcHkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncGFzdGUnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlUGFzdGUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY3V0JzpcclxuICAgICAgICB0aGlzLmhhbmRsZUN1dCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgLy8gRnV0dXJlIGZlYXR1cmVzXHJcbiAgICAgIGNhc2UgJ3VuZG8nOlxyXG4gICAgICBjYXNlICdyZWRvJzpcclxuICAgICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgdW5kby9yZWRvIHN5c3RlbVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGAke3Nob3J0Y3V0LmFjdGlvbn0gbm90IHlldCBpbXBsZW1lbnRlZGApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBjb25zb2xlLndhcm4oYFVua25vd24gc2hvcnRjdXQgYWN0aW9uOiAke3Nob3J0Y3V0LmFjdGlvbn1gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2hvcnRjdXQ6ZXhlY3V0ZWQnLFxyXG4gICAgICBkYXRhOiB7IHNob3J0Y3V0LCBvcmlnaW5hbEV2ZW50OiBldmVudCB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBNb3VzZSBFdmVudCBIYW5kbGluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cE1vdXNlRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gR2xvYmFsIG1vdXNlIHRyYWNraW5nXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZUdsb2JhbE1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmhhbmRsZUdsb2JhbE1vdXNlVXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldHVwQ2FudmFzRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gQ2FudmFzLXNwZWNpZmljIG1vdXNlIGV2ZW50cyBhcmUgaGFuZGxlZCBieSBDYW52YXNDb250cm9sbGVyXHJcbiAgICAvLyBXZSBsaXN0ZW4gdG8gY2FudmFzIGV2ZW50cyBhbmQgY29vcmRpbmF0ZSB3aXRoIG90aGVyIHN5c3RlbXNcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2U6ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gZXZlbnQucG9pbnRlciB8fCB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5hcHBTdGF0ZS5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubGFzdE1vdXNlUG9zaXRpb247XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2U6bW92ZScsIChldmVudCkgPT4ge1xyXG4gICAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gZXZlbnQucG9pbnRlciB8fCB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5hcHBTdGF0ZS5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubGFzdE1vdXNlUG9zaXRpb247XHJcbiAgICAgIHRoaXMudXBkYXRlTW91c2VDb29yZGluYXRlc0Rpc3BsYXkoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3Rpb246Y3JlYXRlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnc2VsZWN0aW9uOmNoYW5nZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgaGFzU2VsZWN0aW9uOiB0cnVlIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0aW9uOmNsZWFyZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ3NlbGVjdGlvbjpjaGFuZ2VkJyxcclxuICAgICAgICBkYXRhOiB7IGhhc1NlbGVjdGlvbjogZmFsc2UgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVHbG9iYWxNb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuICAgICAgLy8gSGFuZGxlIGRyYWcgb3BlcmF0aW9uc1xyXG4gICAgICB0aGlzLmhhbmRsZURyYWdNb3ZlKGV2ZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlR2xvYmFsTW91c2VVcChldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZykge1xyXG4gICAgICB0aGlzLmhhbmRsZURyYWdFbmQoZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENvbnRleHQgTWVudSBIYW5kbGluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cENvbnRleHRNZW51RXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IGNvbnRleHQgbWVudSBhbmQgc2hvdyBjdXN0b20gb25lXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIHRoaXMuaGFuZGxlQ29udGV4dE1lbnUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBFbGVtZW50O1xyXG4gICAgY29uc3QgY2FudmFzRWxlbWVudCA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5jYW52YXMuZ2V0RWxlbWVudCgpO1xyXG5cclxuICAgIGlmICh0YXJnZXQgPT09IGNhbnZhc0VsZW1lbnQgfHwgY2FudmFzRWxlbWVudC5jb250YWlucyh0YXJnZXQpKSB7XHJcbiAgICAgIHRoaXMuc2hvd0NhbnZhc0NvbnRleHRNZW51KGV2ZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2hvd0dlbmVyaWNDb250ZXh0TWVudShldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dDYW52YXNDb250ZXh0TWVudShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgcG9pbnRlciA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5jYW52YXMuZ2V0UG9pbnRlcihldmVudCk7XHJcbiAgICBjb25zdCBzZWxlY3RlZEJveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmdldFNlbGVjdGVkQm91bmRpbmdCb3hlcygpO1xyXG5cclxuICAgIGNvbnN0IGNvbnRleHRFdmVudDogQ29udGV4dE1lbnVFdmVudCA9IHtcclxuICAgICAgdHlwZTogJ2NhbnZhcycsXHJcbiAgICAgIHBvc2l0aW9uOiB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfSxcclxuICAgICAgY2FudmFzUG9zaXRpb246IHBvaW50ZXIsXHJcbiAgICAgIHRhcmdldDogbnVsbCxcclxuICAgICAgaGFzU2VsZWN0aW9uOiBzZWxlY3RlZEJveGVzLmxlbmd0aCA+IDAsXHJcbiAgICAgIHNlbGVjdGVkT2JqZWN0czogc2VsZWN0ZWRCb3hlc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNob3dDb250ZXh0TWVudShjb250ZXh0RXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93R2VuZXJpY0NvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250ZXh0RXZlbnQ6IENvbnRleHRNZW51RXZlbnQgPSB7XHJcbiAgICAgIHR5cGU6ICdnZW5lcmljJyxcclxuICAgICAgcG9zaXRpb246IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9LFxyXG4gICAgICB0YXJnZXQ6IGV2ZW50LnRhcmdldCxcclxuICAgICAgaGFzU2VsZWN0aW9uOiBmYWxzZSxcclxuICAgICAgc2VsZWN0ZWRPYmplY3RzOiBbXVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNob3dDb250ZXh0TWVudShjb250ZXh0RXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93Q29udGV4dE1lbnUoY29udGV4dEV2ZW50OiBDb250ZXh0TWVudUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbnRleHRNZW51VGFyZ2V0ID0gY29udGV4dEV2ZW50O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjb250ZXh0IG1lbnUgYmFzZWQgb24gdHlwZSBhbmQgc2VsZWN0aW9uXHJcbiAgICBjb25zdCBtZW51SXRlbXMgPSB0aGlzLmJ1aWxkQ29udGV4dE1lbnVJdGVtcyhjb250ZXh0RXZlbnQpO1xyXG5cclxuICAgIC8vIFNob3cgY29udGV4dCBtZW51ICh0aGlzIHdvdWxkIGludGVncmF0ZSB3aXRoIFVJIGZyYW1ld29yaylcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjb250ZXh0LW1lbnU6c2hvdycsXHJcbiAgICAgIGRhdGE6IHsgY29udGV4dDogY29udGV4dEV2ZW50LCBtZW51SXRlbXMgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkQ29udGV4dE1lbnVJdGVtcyhjb250ZXh0OiBDb250ZXh0TWVudUV2ZW50KTogYW55W10ge1xyXG4gICAgY29uc3QgaXRlbXM6IGFueVtdID0gW107XHJcblxyXG4gICAgaWYgKGNvbnRleHQudHlwZSA9PT0gJ2NhbnZhcycpIHtcclxuICAgICAgaWYgKGNvbnRleHQuaGFzU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgaXRlbXMucHVzaChcclxuICAgICAgICAgIHsgbGFiZWw6ICdEZWxldGUgU2VsZWN0ZWQnLCBhY3Rpb246ICdkZWxldGUtc2VsZWN0ZWQnLCBzaG9ydGN1dDogJ0RlbCcgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdDb3B5JywgYWN0aW9uOiAnY29weScsIHNob3J0Y3V0OiAnQ3RybCtDJyB9LFxyXG4gICAgICAgICAgeyBsYWJlbDogJ0N1dCcsIGFjdGlvbjogJ2N1dCcsIHNob3J0Y3V0OiAnQ3RybCtYJyB9LFxyXG4gICAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaXRlbXMucHVzaChcclxuICAgICAgICB7IGxhYmVsOiAnUGFzdGUnLCBhY3Rpb246ICdwYXN0ZScsIHNob3J0Y3V0OiAnQ3RybCtWJywgZGlzYWJsZWQ6ICF0aGlzLmFwcFN0YXRlLmdldENsaXBib2FyZCgpIH0sXHJcbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdTZWxlY3QgQWxsJywgYWN0aW9uOiAnc2VsZWN0LWFsbCcsIHNob3J0Y3V0OiAnQ3RybCtBJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdEZXNlbGVjdCBBbGwnLCBhY3Rpb246ICdkZXNlbGVjdC1hbGwnLCBzaG9ydGN1dDogJ0VzYycgfSxcclxuICAgICAgICB7IHR5cGU6ICdzZXBhcmF0b3InIH0sXHJcbiAgICAgICAgeyBsYWJlbDogJ1pvb20gdG8gRml0JywgYWN0aW9uOiAnem9vbS1maXQnLCBzaG9ydGN1dDogJ0YnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogJ1Jlc2V0IFpvb20nLCBhY3Rpb246ICd6b29tLXJlc2V0Jywgc2hvcnRjdXQ6ICdDdHJsKzAnIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaXRlbXM7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRHJhZyBhbmQgRHJvcCBIYW5kbGluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cERyYWdBbmREcm9wRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gRmlsZSBkcmFnIGFuZCBkcm9wIGZvciBsb2FkaW5nIGltYWdlc1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmhhbmRsZURyYWdPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuaGFuZGxlRHJvcC5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuaGFuZGxlRHJhZ0VudGVyLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5oYW5kbGVEcmFnTGVhdmUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdPdmVyKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudC5kYXRhVHJhbnNmZXIhLmRyb3BFZmZlY3QgPSAnY29weSc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdFbnRlcihldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgLy8gQWRkIHZpc3VhbCBmZWVkYmFjayBmb3IgZHJhZyBvcGVyYXRpb25cclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnZHJhZy1hY3RpdmUnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRHJhZ0xlYXZlKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICghZXZlbnQucmVsYXRlZFRhcmdldCkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyb3AoZXZlbnQ6IERyYWdFdmVudCk6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZy1hY3RpdmUnKTtcclxuXHJcbiAgICBjb25zdCBmaWxlcyA9IEFycmF5LmZyb20oZXZlbnQuZGF0YVRyYW5zZmVyPy5maWxlcyB8fCBbXSk7XHJcbiAgICBjb25zdCBpbWFnZUZpbGVzID0gZmlsZXMuZmlsdGVyKGZpbGUgPT4gZmlsZS50eXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKTtcclxuXHJcbiAgICBpZiAoaW1hZ2VGaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlSW1hZ2VGaWxlRHJvcChpbWFnZUZpbGVzWzBdISk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUltYWdlRmlsZURyb3AoZmlsZTogRmlsZSk6IHZvaWQge1xyXG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIubG9hZEltYWdlKGltZyk7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoaW1nLnNyYyk7XHJcbiAgICB9O1xyXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICAvLyBIYW5kbGUgb2JqZWN0IGRyYWdnaW5nIHdpdGhpbiBjYW52YXNcclxuICAgIC8vIFRoaXMgaXMgbW9zdGx5IGhhbmRsZWQgYnkgRmFicmljLmpzLCBidXQgd2UgY2FuIGFkZCBjdXN0b20gbG9naWMgaGVyZVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnRW5kKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBBY3Rpb24gSGFuZGxlcnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlU2F2ZUxhYmVscygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlIHx8ICF0aGlzLmFwcFN0YXRlLmxhYmVsRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBib3VuZGluZ0JveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKTtcclxuICAgICAgY29uc3QgeW9sb0xhYmVscyA9IGJvdW5kaW5nQm94ZXMubWFwKGJib3ggPT5cclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYm91bmRpbmdCb3hUb1lPTE8oYmJveCwge1xyXG4gICAgICAgICAgd2lkdGg6IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlPy53aWR0aCB8fCAxLFxyXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG5cclxuICAgICAgYXdhaXQgdGhpcy5maWxlU3lzdGVtU2VydmljZS5zYXZlTGFiZWxzKFxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZS5uYW1lLFxyXG4gICAgICAgIHlvbG9MYWJlbHMsXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnbGFiZWxzOnNhdmVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGUubmFtZSwgY291bnQ6IHlvbG9MYWJlbHMubGVuZ3RoIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBsYWJlbHM6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPcGVuRm9sZGVyKCk6IHZvaWQge1xyXG4gICAgLy8gVHJpZ2dlciBmb2xkZXIgc2VsZWN0aW9uIFVJXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnZm9sZGVyOnNlbGVjdC1yZXF1ZXN0ZWQnLFxyXG4gICAgICBkYXRhOiB7IHR5cGU6ICdpbWFnZScgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURlbGV0ZVNlbGVjdGVkKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZGVsZXRlZEJveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmRlbGV0ZVNlbGVjdGVkKCk7XHJcbiAgICBpZiAoZGVsZXRlZEJveGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0czpkZWxldGVkJyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBkZWxldGVkQm94ZXMubGVuZ3RoLCBvYmplY3RzOiBkZWxldGVkQm94ZXMgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEF1dG8tc2F2ZSBpZiBlbmFibGVkXHJcbiAgICAgIGlmICh0aGlzLmFwcFN0YXRlLmlzQXV0b1NhdmVFbmFibGVkKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTYXZlTGFiZWxzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ2FuY2VsKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmRlc2VsZWN0QWxsKCk7XHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FuY2VsRHJhd2luZygpO1xyXG5cclxuICAgIGlmICh0aGlzLmNvbnRleHRNZW51VGFyZ2V0KSB7XHJcbiAgICAgIHRoaXMuaGlkZUNvbnRleHRNZW51KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZVNlbGVjdEFsbCgpOiB2b2lkIHtcclxuICAgIC8vIFNlbGVjdCBhbGwgYm91bmRpbmcgYm94ZXMgb24gY2FudmFzXHJcbiAgICBjb25zdCBhbGxCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCk7XHJcbiAgICBhbGxCb3hlcy5mb3JFYWNoKGJib3ggPT4ge1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuc2VsZWN0Qm91bmRpbmdCb3goYmJveC5pZCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlUHJldmlvdXNJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmZpbmRJbmRleChcclxuICAgICAgZmlsZSA9PiBmaWxlLm5hbWUgPT09IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZT8ubmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoY3VycmVudEluZGV4ID4gMCkge1xyXG4gICAgICBjb25zdCBwcmV2SW1hZ2UgPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXNbY3VycmVudEluZGV4IC0gMV0hO1xyXG4gICAgICB0aGlzLmxvYWRJbWFnZUZpbGUocHJldkltYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTmV4dEltYWdlKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50SW5kZXggPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMuZmluZEluZGV4KFxyXG4gICAgICBmaWxlID0+IGZpbGUubmFtZSA9PT0gdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlPy5uYW1lXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChjdXJyZW50SW5kZXggPCB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICBjb25zdCBuZXh0SW1hZ2UgPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXNbY3VycmVudEluZGV4ICsgMV0hO1xyXG4gICAgICB0aGlzLmxvYWRJbWFnZUZpbGUobmV4dEltYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRmlyc3RJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmxvYWRJbWFnZUZpbGUodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzWzBdISk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUxhc3RJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBsYXN0SW1hZ2UgPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXNbdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCAtIDFdITtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKGxhc3RJbWFnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNvcHkoKTogdm9pZCB7XHJcbiAgICBjb25zdCBzZWxlY3RlZEJveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmdldFNlbGVjdGVkQm91bmRpbmdCb3hlcygpO1xyXG4gICAgaWYgKHNlbGVjdGVkQm94ZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFwcFN0YXRlLnNldENsaXBib2FyZCh7XHJcbiAgICAgICAgdHlwZTogJ2JvdW5kaW5nLWJveGVzJyxcclxuICAgICAgICBkYXRhOiBzZWxlY3RlZEJveGVzLFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsaXBib2FyZDpjb3B5JyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBzZWxlY3RlZEJveGVzLmxlbmd0aCB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVQYXN0ZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNsaXBib2FyZCA9IHRoaXMuYXBwU3RhdGUuZ2V0Q2xpcGJvYXJkKCk7XHJcbiAgICBpZiAoY2xpcGJvYXJkICYmIGNsaXBib2FyZC50eXBlID09PSAnYm91bmRpbmctYm94ZXMnKSB7XHJcbiAgICAgIGNvbnN0IGJveGVzID0gY2xpcGJvYXJkLmRhdGEgYXMgQm91bmRpbmdCb3hbXTtcclxuXHJcbiAgICAgIGJveGVzLmZvckVhY2goKGJib3gsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgLy8gT2Zmc2V0IHBhc3RlZCBib3hlcyBzbGlnaHRseVxyXG4gICAgICAgIGNvbnN0IG5ld0Jib3g6IEJvdW5kaW5nQm94ID0ge1xyXG4gICAgICAgICAgLi4uYmJveCxcclxuICAgICAgICAgIGlkOiBgcGFzdGVkXyR7RGF0ZS5ub3coKX1fJHtpbmRleH1gLFxyXG4gICAgICAgICAgeDogYmJveC54ICsgMTAsXHJcbiAgICAgICAgICB5OiBiYm94LnkgKyAxMCxcclxuICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEJvdW5kaW5nQm94KG5ld0Jib3gpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsaXBib2FyZDpwYXN0ZScsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogYm94ZXMubGVuZ3RoIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBdXRvLXNhdmUgaWYgZW5hYmxlZFxyXG4gICAgICBpZiAodGhpcy5hcHBTdGF0ZS5pc0F1dG9TYXZlRW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlU2F2ZUxhYmVscygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1dCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaGFuZGxlQ29weSgpO1xyXG4gICAgdGhpcy5oYW5kbGVEZWxldGVTZWxlY3RlZCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVFc2NhcGVLZXkoKTogdm9pZCB7XHJcbiAgICAvLyBDYW5jZWwgYW55IGFjdGl2ZSBvcGVyYXRpb25zXHJcbiAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFV0aWxpdHkgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBsb2FkSW1hZ2VGaWxlKGltYWdlRmlsZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZvbGRlckhhbmRsZSkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UubG9hZEltYWdlKGltYWdlRmlsZS5oYW5kbGUpO1xyXG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZSk7XG4gICAgICAgICAgLy8gS2VlcCBjdXJyZW50IGltYWdlIGVsZW1lbnQgaW4gc3RhdGUgZm9yIHNhdmUgb3BlcmF0aW9uc1xuICAgICAgICAgIHRyeSB7ICh0aGlzLmFwcFN0YXRlIGFzIGFueSkuY3VycmVudEltYWdlID0gcmVzdWx0LmRhdGE7IH0gY2F0Y2gge31cbiAgICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIubG9hZEltYWdlKHJlc3VsdC5kYXRhKTtcblxyXG4gICAgICAgICAgLy8gTG9hZCBleGlzdGluZyBsYWJlbHNcclxuICAgICAgICAgIGlmICh0aGlzLmFwcFN0YXRlLmxhYmVsRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubG9hZExhYmVsc0ZvckN1cnJlbnRJbWFnZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgaW1hZ2U6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBsb2FkTGFiZWxzRm9yQ3VycmVudEltYWdlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKCF0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGUgfHwgIXRoaXMuYXBwU3RhdGUubGFiZWxGb2xkZXJIYW5kbGUpIHJldHVybjtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlLmxvYWRMYWJlbHMoXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlLm5hbWUsXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XHJcbiAgICAgICAgLy8gQ2xlYXIgZXhpc3RpbmcgbGFiZWxzXHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKS5mb3JFYWNoKGJib3ggPT4ge1xyXG4gICAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnJlbW92ZUJvdW5kaW5nQm94KGJib3guaWQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgbG9hZGVkIGxhYmVsc1xyXG4gICAgICAgIHJlc3VsdC5kYXRhLmZvckVhY2goeW9sb0xhYmVsID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJib3ggPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIueW9sb1RvQm91bmRpbmdCb3goeW9sb0xhYmVsLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8ud2lkdGggfHwgMSxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEJvdW5kaW5nQm94KGJib3gpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBsYWJlbHM6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVNb3VzZUNvb3JkaW5hdGVzRGlzcGxheSgpOiB2b2lkIHtcclxuICAgIC8vIFVwZGF0ZSBtb3VzZSBjb29yZGluYXRlcyBpbiBVSVxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vdXNlOmNvb3JkaW5hdGVzLXVwZGF0ZWQnLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgY2FudmFzOiB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLFxyXG4gICAgICAgIGltYWdlOiB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzVG9JbWFnZSh0aGlzLmxhc3RNb3VzZVBvc2l0aW9uKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGlkZUNvbnRleHRNZW51KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jb250ZXh0TWVudVRhcmdldCA9IG51bGw7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY29udGV4dC1tZW51OmhpZGUnXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2hvcnRjdXRLZXkoc2hvcnRjdXQ6IEtleWJvYXJkU2hvcnRjdXQpOiBzdHJpbmcge1xyXG4gICAgbGV0IGtleSA9IHNob3J0Y3V0LmtleTtcclxuICAgIGlmIChzaG9ydGN1dC5jdHJsS2V5KSBrZXkgPSAnQ3RybCsnICsga2V5O1xyXG4gICAgaWYgKHNob3J0Y3V0LnNoaWZ0S2V5KSBrZXkgPSAnU2hpZnQrJyArIGtleTtcclxuICAgIGlmIChzaG9ydGN1dC5hbHRLZXkpIGtleSA9ICdBbHQrJyArIGtleTtcclxuICAgIHJldHVybiBrZXk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEV2ZW50S2V5KGV2ZW50OiBLZXlib2FyZEV2ZW50KTogc3RyaW5nIHtcclxuICAgIGxldCBrZXkgPSBldmVudC5jb2RlO1xyXG4gICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkga2V5ID0gJ0N0cmwrJyArIGtleTtcclxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gJ1NoaWZ0KycgKyBrZXk7XHJcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSAnQWx0KycgKyBrZXk7XHJcbiAgICByZXR1cm4ga2V5O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0lucHV0RWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gWydpbnB1dCcsICd0ZXh0YXJlYScsICdzZWxlY3QnLCAnb3B0aW9uJ10uaW5jbHVkZXModGFnTmFtZSkgfHxcclxuICAgICAgICAgICBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzR2xvYmFsU2hvcnRjdXQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBib29sZWFuIHtcclxuICAgIC8vIFRoZXNlIHNob3J0Y3V0cyB3b3JrIGV2ZW4gd2hlbiBpbnB1dCBlbGVtZW50cyBhcmUgZm9jdXNlZFxyXG4gICAgY29uc3QgZ2xvYmFsU2hvcnRjdXRzID0gWydLZXlTJywgJ0tleU8nLCAnS2V5WicsICdLZXlZJ107XHJcbiAgICByZXR1cm4gKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkgJiYgZ2xvYmFsU2hvcnRjdXRzLmluY2x1ZGVzKGV2ZW50LmNvZGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBFdmVudE1hbmFnZXJFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQodHlwZSwgW10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSkhLnB1c2goaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEV2ZW50TWFuYWdlckV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNwYXRjaEV2ZW50KGV2ZW50OiBFdmVudE1hbmFnZXJFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZXZlbnQgaGFuZGxlciBmb3IgJHtldmVudC50eXBlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQdWJsaWMgSW50ZXJmYWNlXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgZ2V0U2hvcnRjdXRzKCk6IEtleWJvYXJkU2hvcnRjdXRbXSB7XHJcbiAgICByZXR1cm4gWy4uLnRoaXMuc2hvcnRjdXRzXTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRDb25maWcoY29uZmlnOiBQYXJ0aWFsPEV2ZW50TWFuYWdlckNvbmZpZz4pOiB2b2lkIHtcclxuICAgIHRoaXMuY29uZmlnID0geyAuLi50aGlzLmNvbmZpZywgLi4uY29uZmlnIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q29uZmlnKCk6IEV2ZW50TWFuYWdlckNvbmZpZyB7XHJcbiAgICByZXR1cm4geyAuLi50aGlzLmNvbmZpZyB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAvLyBSZW1vdmUgYWxsIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5oYW5kbGVLZXlVcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgdGhpcy5oYW5kbGVDb250ZXh0TWVudS5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5oYW5kbGVEcmFnT3Zlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmhhbmRsZURyb3AuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmhhbmRsZURyYWdFbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuaGFuZGxlRHJhZ0xlYXZlLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZU1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZVVwLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIENsZWFyIGludGVybmFsIHN0YXRlXHJcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmtleWJvYXJkSGFuZGxlcnMuY2xlYXIoKTtcclxuICAgIHRoaXMuY29udGV4dE1lbnVUYXJnZXQgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudE1hbmFnZXIoXHJcbiAgYXBwU3RhdGU6IElBcHBTdGF0ZSxcclxuICBjYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcixcclxuICBmaWxlU3lzdGVtU2VydmljZTogSUZpbGVTeXN0ZW1TZXJ2aWNlLFxyXG4gIGNvbmZpZz86IFBhcnRpYWw8RXZlbnRNYW5hZ2VyQ29uZmlnPlxyXG4pOiBFdmVudE1hbmFnZXIge1xyXG4gIHJldHVybiBuZXcgRXZlbnRNYW5hZ2VyKGFwcFN0YXRlLCBjYW52YXNDb250cm9sbGVyLCBmaWxlU3lzdGVtU2VydmljZSwgY29uZmlnKTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV2ZW50TWFuYWdlcjtcclxuZXhwb3J0IHR5cGUgeyBJRXZlbnRNYW5hZ2VyLCBFdmVudE1hbmFnZXJDb25maWcsIEtleWJvYXJkU2hvcnRjdXQgfTtcbiIsIi8qKlxyXG4gKiBVdGlscyBNb2R1bGUgSW5kZXhcclxuICogXHJcbiAqIENlbnRyYWwgZXhwb3J0IHBvaW50IGZvciBhbGwgdXRpbGl0eSBmdW5jdGlvbnMgdXNlZCB0aHJvdWdob3V0IHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBUaGlzIGZpbGUgcHJvdmlkZXMgYSBjbGVhbiBBUEkgZm9yIGltcG9ydGluZyB1dGlsaXR5IGZ1bmN0aW9ucyBmcm9tIHZhcmlvdXMgbW9kdWxlcy5cclxuICovXHJcblxyXG4vLyBFeHBvcnQgYWxsIG5vdGlmaWNhdGlvbiB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIHNob3dUb2FzdCxcclxuICAgIHNob3dFcnJvclRvYXN0LFxyXG4gICAgc2hvd1N1Y2Nlc3NUb2FzdCxcclxuICAgIHNob3dXYXJuaW5nVG9hc3QsXHJcbiAgICBzaG93VHlwZWRUb2FzdCxcclxuICAgIHR5cGUgVG9hc3RUeXBlLFxyXG4gICAgdHlwZSBUb2FzdENvbmZpZ1xyXG59IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIGNvbG9yIHBhbGV0dGUgdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICBjb2xvclBhbGV0dGUsXHJcbiAgICBERUZBVUxUX0NPTE9SLFxyXG4gICAgZ2V0Q29sb3JGb3JDbGFzcyxcclxuICAgIGdldENvbG9yc0ZvckNsYXNzZXMsXHJcbiAgICBpc0NvbG9ySW5QYWxldHRlLFxyXG4gICAgZ2V0Q29sb3JJbmRleCxcclxuICAgIGdldENvbnRyYXN0aW5nVGV4dENvbG9yLFxyXG4gICAgaGV4VG9SZ2JhLFxyXG4gICAgQ29sb3JNYW5hZ2VyLFxyXG4gICAgdHlwZSBDb2xvckNvbmZpZ1xyXG59IGZyb20gJy4vY29sb3ItcGFsZXR0ZSc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIHZhbGlkYXRpb24gdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3MsXHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3NBZHZhbmNlZCxcclxuICAgIHZhbGlkYXRlRmlsZU5hbWUsXHJcbiAgICB2YWxpZGF0ZUltYWdlRXh0ZW5zaW9uLFxyXG4gICAgdmFsaWRhdGVCb3VuZGluZ0JveCxcclxuICAgIHZhbGlkYXRlWU9MT0Nvb3JkaW5hdGVzLFxyXG4gICAgdmFsaWRhdGVab29tTGV2ZWwsXHJcbiAgICB2YWxpZGF0ZUZvbnRTaXplLFxyXG4gICAgdmFsaWRhdGVOdW1iZXIsXHJcbiAgICB2YWxpZGF0ZUVtYWlsLFxyXG4gICAgdmFsaWRhdGVVcmwsXHJcbiAgICBzYW5pdGl6ZUlucHV0LFxyXG4gICAgdHlwZSBWYWxpZGF0aW9uUmVzdWx0XHJcbn0gZnJvbSAnLi92YWxpZGF0aW9uJztcclxuXHJcbi8vIEV4cG9ydCBZT0xPIHBhcnNlciB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIFlvbG9QYXJzZXIsXHJcbiAgICBwYXJzZVlvbG8sXHJcbiAgICBleHBvcnRZb2xvLFxyXG4gICAgdmFsaWRhdGVZb2xvU3RyaW5nXHJcbn0gZnJvbSAnLi95b2xvLXBhcnNlcic7XHJcblxyXG4vLyBSZS1leHBvcnQgY29tbW9ubHkgdXNlZCB1dGlsaXRpZXMgd2l0aCBzaG9ydGVyIG5hbWVzXHJcbmV4cG9ydCB7IHNob3dUb2FzdCBhcyB0b2FzdCB9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcbmV4cG9ydCB7IGdldENvbG9yRm9yQ2xhc3MgYXMgZ2V0Q29sb3IgfSBmcm9tICcuL2NvbG9yLXBhbGV0dGUnO1xyXG5leHBvcnQgeyB2YWxpZGF0ZUxhYmVsQ2xhc3MgYXMgdmFsaWRhdGVMYWJlbCB9IGZyb20gJy4vdmFsaWRhdGlvbic7XHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiBjYXRlZ29yaWVzIGZvciBiZXR0ZXIgb3JnYW5pemF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVXRpbGl0eUNhdGVnb3JpZXMgPSB7XHJcbiAgICBOT1RJRklDQVRJT05TOiBbXHJcbiAgICAgICAgJ3Nob3dUb2FzdCcsXHJcbiAgICAgICAgJ3Nob3dFcnJvclRvYXN0JywgXHJcbiAgICAgICAgJ3Nob3dTdWNjZXNzVG9hc3QnLFxyXG4gICAgICAgICdzaG93V2FybmluZ1RvYXN0JyxcclxuICAgICAgICAnc2hvd1R5cGVkVG9hc3QnXHJcbiAgICBdLFxyXG4gICAgQ09MT1JTOiBbXHJcbiAgICAgICAgJ2dldENvbG9yRm9yQ2xhc3MnLFxyXG4gICAgICAgICdnZXRDb2xvcnNGb3JDbGFzc2VzJyxcclxuICAgICAgICAnZ2V0Q29udHJhc3RpbmdUZXh0Q29sb3InLFxyXG4gICAgICAgICdoZXhUb1JnYmEnLFxyXG4gICAgICAgICdDb2xvck1hbmFnZXInXHJcbiAgICBdLFxyXG4gICAgVkFMSURBVElPTjogW1xyXG4gICAgICAgICd2YWxpZGF0ZUxhYmVsQ2xhc3MnLFxyXG4gICAgICAgICd2YWxpZGF0ZUZpbGVOYW1lJyxcclxuICAgICAgICAndmFsaWRhdGVJbWFnZUV4dGVuc2lvbicsXHJcbiAgICAgICAgJ3ZhbGlkYXRlQm91bmRpbmdCb3gnLFxyXG4gICAgICAgICd2YWxpZGF0ZVlPTE9Db29yZGluYXRlcydcclxuICAgIF0sXHJcbiAgICBZT0xPOiBbXHJcbiAgICAgICAgJ1lvbG9QYXJzZXInLFxyXG4gICAgICAgICdwYXJzZVlvbG8nLFxyXG4gICAgICAgICdleHBvcnRZb2xvJyxcclxuICAgICAgICAndmFsaWRhdGVZb2xvU3RyaW5nJ1xyXG4gICAgXVxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXRpbGl0eUNvbmZpZyB7XHJcbiAgICBub3RpZmljYXRpb25zOiB7XHJcbiAgICAgICAgZGVmYXVsdER1cmF0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZztcclxuICAgIH07XHJcbiAgICBjb2xvcnM6IHtcclxuICAgICAgICB1c2VIaWdoQ29udHJhc3Q6IGJvb2xlYW47XHJcbiAgICAgICAgY3VzdG9tUGFsZXR0ZT86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiBib29sZWFuO1xyXG4gICAgICAgIHNob3dFcnJvcnM6IGJvb2xlYW47XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB1dGlsaXR5IGNvbmZpZ3VyYXRpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1VUSUxJVFlfQ09ORklHOiBVdGlsaXR5Q29uZmlnID0ge1xyXG4gICAgbm90aWZpY2F0aW9uczoge1xyXG4gICAgICAgIGRlZmF1bHREdXJhdGlvbjogMzAwMCxcclxuICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJyN0b2FzdC1jb250YWluZXInXHJcbiAgICB9LFxyXG4gICAgY29sb3JzOiB7XHJcbiAgICAgICAgdXNlSGlnaENvbnRyYXN0OiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiB0cnVlLFxyXG4gICAgICAgIHNob3dFcnJvcnM6IHRydWVcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IG1hbmFnZXIgZm9yIGNvb3JkaW5hdGVkIHV0aWxpdHkgb3BlcmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFV0aWxpdHlNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgY29uZmlnOiBVdGlsaXR5Q29uZmlnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUGFydGlhbDxVdGlsaXR5Q29uZmlnPiA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfVVRJTElUWV9DT05GSUcsIC4uLmNvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGN1cnJlbnQgY29uZmlndXJhdGlvblxyXG4gICAgICovXHJcbiAgICBnZXRDb25maWcoKTogVXRpbGl0eUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUNvbmZpZyhuZXdDb25maWc6IFBhcnRpYWw8VXRpbGl0eUNvbmZpZz4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLm5ld0NvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSB1dGlsaXRpZXMgd2l0aCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB1dGlsaXR5IGNvbmZpZ3VyYXRpb24gKG5vIGNvbnNvbGUgbm9pc2UgaW4gcHJvZHVjdGlvbilcbiAgICB9XG59XHJcblxyXG4vKipcclxuICogR2xvYmFsIHV0aWxpdHkgbWFuYWdlciBpbnN0YW5jZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHV0aWxpdHlNYW5hZ2VyID0gbmV3IFV0aWxpdHlNYW5hZ2VyKCk7XHJcblxyXG4vKipcclxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHV0aWxpdGllcyBhcmUgcHJvcGVybHkgbG9hZGVkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVVdGlsaXRpZXNMb2FkZWQoKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIEltcG9ydCBmdW5jdGlvbnMgZm9yIHRlc3RpbmdcclxuICAgICAgICBjb25zdCB7IHNob3dUb2FzdCB9ID0gcmVxdWlyZSgnLi9ub3RpZmljYXRpb25zJyk7XHJcbiAgICAgICAgY29uc3QgeyBjb2xvclBhbGV0dGUgfSA9IHJlcXVpcmUoJy4vY29sb3ItcGFsZXR0ZScpO1xyXG4gICAgICAgIGNvbnN0IHsgdmFsaWRhdGVMYWJlbENsYXNzIH0gPSByZXF1aXJlKCcuL3ZhbGlkYXRpb24nKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBUZXN0IGVhY2ggdXRpbGl0eSBjYXRlZ29yeVxyXG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvblRlc3QgPSB0eXBlb2Ygc2hvd1RvYXN0ID09PSAnZnVuY3Rpb24nO1xyXG4gICAgICAgIGNvbnN0IGNvbG9yVGVzdCA9IEFycmF5LmlzQXJyYXkoY29sb3JQYWxldHRlKSAmJiBjb2xvclBhbGV0dGUubGVuZ3RoID4gMDtcclxuICAgICAgICBjb25zdCB2YWxpZGF0aW9uVGVzdCA9IHR5cGVvZiB2YWxpZGF0ZUxhYmVsQ2xhc3MgPT09ICdmdW5jdGlvbic7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIG5vdGlmaWNhdGlvblRlc3QgJiYgY29sb3JUZXN0ICYmIHZhbGlkYXRpb25UZXN0O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdVdGlsaXRpZXMgdmFsaWRhdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB1dGlsaXR5IG1vZHVsZSB2ZXJzaW9uIGluZm9cclxuICovXHJcbmV4cG9ydCBjb25zdCBVVElMSVRZX1ZFUlNJT04gPSB7XHJcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxyXG4gICAgbW9kdWxlczoge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbnM6ICcxLjAuMCcsXHJcbiAgICAgICAgY29sb3JzOiAnMS4wLjAnLFxyXG4gICAgICAgIHZhbGlkYXRpb246ICcxLjAuMCcsXHJcbiAgICAgICAgeW9sbzogJzEuMC4wJ1xyXG4gICAgfSxcclxuICAgIGJ1aWxkRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbn07XHJcblxyXG4vLyBJbml0aWFsaXplIHV0aWxpdGllcyBvbiBtb2R1bGUgbG9hZFxyXG51dGlsaXR5TWFuYWdlci5pbml0aWFsaXplKCk7XG4iLCIvKipcclxuICogVUkgTWFuYWdlciBNb2R1bGVcclxuICpcclxuICogTWFuYWdlcyBhbGwgRE9NIG1hbmlwdWxhdGlvbiwgVUkgdXBkYXRlcywgYW5kIHVzZXIgaW50ZXJmYWNlIGludGVyYWN0aW9ucy5cclxuICogSGFuZGxlcyBCb290c3RyYXAgbW9kYWxzLCBwYW5lbCBtYW5hZ2VtZW50LCBsaXN0IHJlbmRlcmluZywgYW5kIHRoZW1lIG1hbmFnZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgSUFwcFN0YXRlLCBDbGFzc0RlZmluaXRpb24sIENsYXNzRmlsZSB9IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XG5pbXBvcnQgeyBJQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4uL3R5cGVzL2NhbnZhcyc7XG5pbXBvcnQgeyBJRmlsZVN5c3RlbSB9IGZyb20gJy4uL3R5cGVzL2ZpbGUtc3lzdGVtJztcbmltcG9ydCB7XHJcbiAgRE9NRWxlbWVudHMsXHJcbiAgQm9vdHN0cmFwTW9kYWwsXHJcbiAgUGFuZWxDb25maWcsXHJcbiAgU3BsaXR0ZXJDb25maWcsXHJcbiAgRmlsdGVyQnV0dG9uLFxyXG4gIExhYmVsR3JvdXAsXHJcbiAgQ29udGV4dE1lbnVDb25maWcsXHJcbiAgVUlTdGF0ZSxcclxuICBUaGVtZUNvbmZpZyxcclxuICBMb2FkaW5nU3RhdGUsXHJcbiAgU2VhcmNoT3B0aW9ucyxcclxuICBGaWx0ZXJPcHRpb25zLFxyXG4gIFVJRXZlbnQsXHJcbiAgVUlFdmVudFR5cGUsXHJcbiAgVUlFdmVudEhhbmRsZXIsXHJcbiAgVUlNZXRob2RzLFxyXG4gIElVSU1hbmFnZXIsXHJcbiAgSW1hZ2VMaXN0SXRlbSxcclxuICBMYWJlbExpc3RJdGVtLFxyXG4gIFByZXZpZXdJdGVtXHJcbn0gZnJvbSAnLi4vdHlwZXMvdWknO1xyXG5pbXBvcnQgeyBNb2RlLCBQb2ludCB9IGZyb20gJy4uL3R5cGVzL2luZGV4JztcbmltcG9ydCB7IHNob3dTdWNjZXNzVG9hc3QsIHNob3dFcnJvclRvYXN0IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgQm91bmRpbmdCb3ggfSBmcm9tICcuLi90eXBlcy9jYW52YXMnO1xuaW1wb3J0IHsgZ2V0Q29sb3JGb3JDbGFzcyB9IGZyb20gJy4uL3V0aWxzL2NvbG9yLXBhbGV0dGUnO1xuXHJcbi8qKlxyXG4gKiBCb290c3RyYXAgTW9kYWwgd3JhcHBlciBmb3IgdHlwZSBzYWZldHlcclxuICovXHJcbmNsYXNzIEJvb3RzdHJhcE1vZGFsV3JhcHBlciBpbXBsZW1lbnRzIEJvb3RzdHJhcE1vZGFsIHtcclxuICBwcml2YXRlIG1vZGFsOiBhbnk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAvLyBCb290c3RyYXAgNSBNb2RhbFxyXG4gICAgdGhpcy5tb2RhbCA9IG5ldyAod2luZG93IGFzIGFueSkuYm9vdHN0cmFwLk1vZGFsKGVsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgc2hvdygpOiB2b2lkIHtcclxuICAgIHRoaXMubW9kYWwuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgaGlkZSgpOiB2b2lkIHtcclxuICAgIHRoaXMubW9kYWwuaGlkZSgpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5tb2RhbC50b2dnbGUoKTtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLm1vZGFsLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVSU1hbmFnZXIgaW1wbGVtZW50YXRpb25cclxuICogTWFuYWdlcyBhbGwgdXNlciBpbnRlcmZhY2UgaW50ZXJhY3Rpb25zIGFuZCBET00gbWFuaXB1bGF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVUlNYW5hZ2VyIGltcGxlbWVudHMgSVVJTWFuYWdlciB7XG4gIHByaXZhdGUgZXZlbnRIYW5kbGVyczogTWFwPFVJRXZlbnRUeXBlLCBTZXQ8VUlFdmVudEhhbmRsZXI+PiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBfZWxlbWVudHMhOiBET01FbGVtZW50cztcbiAgcHJpdmF0ZSBwYW5lbENvbmZpZ3M6IE1hcDxzdHJpbmcsIFBhbmVsQ29uZmlnPiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBzcGxpdHRlckNvbmZpZ3M6IFNwbGl0dGVyQ29uZmlnW10gPSBbXTtcbiAgcHJpdmF0ZSBjdXJyZW50VGhlbWU6IFRoZW1lQ29uZmlnO1xuICBwcml2YXRlIGxvYWRpbmdTdGF0ZTogTG9hZGluZ1N0YXRlO1xuICBwcml2YXRlIGZpbHRlckJ1dHRvbnM6IEZpbHRlckJ1dHRvbltdID0gW107XG4gIHByaXZhdGUgbGFiZWxHcm91cHM6IExhYmVsR3JvdXBbXSA9IFtdO1xuICBwcml2YXRlIGltYWdlTGlzdEl0ZW1zOiBJbWFnZUxpc3RJdGVtW10gPSBbXTtcbiAgcHJpdmF0ZSBsYWJlbExpc3RJdGVtczogTGFiZWxMaXN0SXRlbVtdID0gW107XG4gIHByaXZhdGUgcHJldmlld0l0ZW1zOiBQcmV2aWV3SXRlbVtdID0gW107XG4gIHByaXZhdGUgcGVuZGluZ0xhYmVsSWRzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIGNsYXNzU2VsZWN0aW9uQnV0dG9uczogSFRNTEJ1dHRvbkVsZW1lbnRbXSA9IFtdO1xuICBwcml2YXRlIGN1cnJlbnRDb250ZXh0OiBhbnkgPSBudWxsO1xuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIF9zdGF0ZTogSUFwcFN0YXRlLFxyXG4gICAgcHJpdmF0ZSBfY2FudmFzQ29udHJvbGxlcjogSUNhbnZhc0NvbnRyb2xsZXIsXHJcbiAgICBwcml2YXRlIF9maWxlU3lzdGVtOiBJRmlsZVN5c3RlbVxyXG4gICkge1xyXG4gICAgdGhpcy5jdXJyZW50VGhlbWUgPSB0aGlzLmdldERlZmF1bHRUaGVtZSgpO1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUgPSB7XHJcbiAgICAgIGlzTG9hZGluZzogZmFsc2UsXHJcbiAgICAgIG1lc3NhZ2U6ICcnLFxyXG4gICAgICBwcm9ncmVzczogMFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemVFbGVtZW50cygpO1xuICAgIHRoaXMuc2V0dXBFdmVudExpc3RlbmVycygpO1xuICAgIHRoaXMuc2V0dXBTcGxpdHRlcnMoKTtcbiAgICB0aGlzLmluaXRpYWxpemVQYW5lbENvbmZpZ3MoKTtcbiAgICB0aGlzLnBvcHVsYXRlQ2xhc3NGaWxlRHJvcGRvd24odGhpcy5fc3RhdGUuY2xhc3NGaWxlcyk7XG4gICAgdGhpcy5yZW5kZXJDbGFzc1NlbGVjdGlvbkJ1dHRvbnModGhpcy5fc3RhdGUuc2VsZWN0ZWRDbGFzc0ZpbGU/LmNvbnRlbnQgfHwgW10pO1xuICB9XG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gR2V0dGVyc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZ2V0IGVsZW1lbnRzKCk6IERPTUVsZW1lbnRzIHtcclxuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cztcclxuICB9XHJcblxyXG4gIGdldCBzdGF0ZSgpOiBJQXBwU3RhdGUge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGNhbnZhc0NvbnRyb2xsZXIoKTogSUNhbnZhc0NvbnRyb2xsZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXI7XHJcbiAgfVxyXG5cclxuICBnZXQgZmlsZVN5c3RlbSgpOiBJRmlsZVN5c3RlbSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZmlsZVN5c3RlbTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFbGVtZW50IEluaXRpYWxpemF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVFbGVtZW50cygpOiB2b2lkIHtcbiAgICAvLyBBc3NpZ24gSURzIGF0IHJ1bnRpbWUgZm9yIGVsZW1lbnRzIHdpdGhvdXQgSURzIGluIHN0YXRpYyBIVE1MXG4gICAgdGhpcy5lbnN1cmVEb21JZHMoKTtcbiAgICB0aGlzLl9lbGVtZW50cyA9IHtcclxuICAgICAgLy8gRm9sZGVyIHNlbGVjdGlvbiBidXR0b25zXHJcbiAgICAgIHNlbGVjdEltYWdlRm9sZGVyQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtaW1hZ2UtZm9sZGVyLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBzZWxlY3RMYWJlbEZvbGRlckJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2VsZWN0LWxhYmVsLWZvbGRlci1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgbG9hZENsYXNzSW5mb0ZvbGRlckJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbG9hZC1jbGFzcy1pbmZvLWZvbGRlci1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENsYXNzIGZpbGUgZWxlbWVudHNcclxuICAgICAgY2xhc3NGaWxlU2VsZWN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1maWxlLXNlbGVjdCcpIGFzIEhUTUxTZWxlY3RFbGVtZW50LFxyXG4gICAgICB2aWV3Q2xhc3NGaWxlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCd2aWV3LWNsYXNzLWZpbGUtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGNsYXNzRmlsZVZpZXdlck1vZGFsOiBuZXcgQm9vdHN0cmFwTW9kYWxXcmFwcGVyKHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNzRmlsZVZpZXdlck1vZGFsJykpLFxyXG4gICAgICBjbGFzc0ZpbGVFZGl0b3JCb2R5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1maWxlLWVkaXRvci1ib2R5JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGFkZENsYXNzUm93QnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdhZGQtY2xhc3Mtcm93LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBzYXZlQ2xhc3NGaWxlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzYXZlLWNsYXNzLWZpbGUtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGRvd25sb2FkQ2xhc3Nlc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZG93bmxvYWQtY2xhc3Nlcy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIEltYWdlIGxpc3QgZWxlbWVudHNcclxuICAgICAgaW1hZ2VMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdpbWFnZS1saXN0JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGltYWdlU2VhcmNoSW5wdXQ6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlLXNlYXJjaC1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIHNob3dMYWJlbGVkQ2hlY2tib3g6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctbGFiZWxlZC1jaGVja2JveCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIHNob3dVbmxhYmVsZWRDaGVja2JveDogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2hvdy11bmxhYmVsZWQtY2hlY2tib3gnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gU2F2ZS9sb2FkIGJ1dHRvbnNcclxuICAgICAgc2F2ZUxhYmVsc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2F2ZS1sYWJlbHMtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGF1dG9TYXZlVG9nZ2xlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdhdXRvLXNhdmUtdG9nZ2xlJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENhbnZhcyBkaXNwbGF5IG9wdGlvbnNcclxuICAgICAgc2hvd0xhYmVsc09uQ2FudmFzVG9nZ2xlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzaG93LWxhYmVscy1vbi1jYW52YXMtdG9nZ2xlJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgbGFiZWxGb250U2l6ZVNsaWRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZm9udC1zaXplLXNsaWRlcicpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGxhYmVsRm9udFNpemVWYWx1ZTogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZm9udC1zaXplLXZhbHVlJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGNyb3NzaGFpclRvZ2dsZTogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3Jvc3NoYWlyLXRvZ2dsZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBNb2RlIGJ1dHRvbnNcclxuICAgICAgZHJhd01vZGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2RyYXctbW9kZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZWRpdE1vZGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2VkaXQtbW9kZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIExhYmVsIGxpc3QgZWxlbWVudHNcclxuICAgICAgbGFiZWxMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1saXN0JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGxhYmVsRmlsdGVyczogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZmlsdGVycycpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBzZWxlY3RCeUNsYXNzRHJvcGRvd246IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdC1ieS1jbGFzcy1kcm9wZG93bicpIGFzIEhUTUxTZWxlY3RFbGVtZW50LFxyXG4gICAgICBzZWxlY3RCeUNsYXNzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtYnktY2xhc3MtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHNvcnRMYWJlbHNBc2NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NvcnQtbGFiZWxzLWFzYy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgc29ydExhYmVsc0Rlc2NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NvcnQtbGFiZWxzLWRlc2MtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBab29tIGNvbnRyb2xzXHJcbiAgICAgIHpvb21JbkJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnem9vbS1pbi1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgem9vbU91dEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnem9vbS1vdXQtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHJlc2V0Wm9vbUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncmVzZXQtem9vbS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgem9vbUlucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCd6b29tLWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENhbnZhcyBlbGVtZW50c1xyXG4gICAgICBjYW52YXNDb250YWluZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcy1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgbW91c2VDb29yZHNEaXNwbGF5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdtb3VzZS1jb29yZHMtZGlzcGxheScpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjb29yZFhJbnB1dDogdGhpcy5nZXRFbGVtZW50QnlJZCgnY29vcmQteC1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGNvb3JkWUlucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb29yZC15LWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgZ29Ub0Nvb3Jkc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZ28tdG8tY29vcmRzLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gTmF2aWdhdGlvblxyXG4gICAgICBjdXJyZW50SW1hZ2VOYW1lU3BhbjogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3VycmVudC1pbWFnZS1uYW1lJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHByZXZJbWFnZUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldi1pbWFnZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgbmV4dEltYWdlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCduZXh0LWltYWdlLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gUGFuZWwgZWxlbWVudHNcclxuICAgICAgbGVmdFBhbmVsOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsZWZ0LXBhbmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHJpZ2h0UGFuZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3JpZ2h0LXBhbmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGxlZnRTcGxpdHRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGVmdC1zcGxpdHRlcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICByaWdodFNwbGl0dGVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdyaWdodC1zcGxpdHRlcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjb2xsYXBzZUxlZnRQYW5lbEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnY29sbGFwc2UtbGVmdC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZXhwYW5kTGVmdFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdleHBhbmQtbGVmdC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgY29sbGFwc2VSaWdodFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb2xsYXBzZS1yaWdodC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZXhwYW5kUmlnaHRQYW5lbEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZXhwYW5kLXJpZ2h0LXBhbmVsLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gUHJldmlldyBiYXIgZWxlbWVudHNcclxuICAgICAgcHJldmlld0JhcjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1iYXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgcHJldmlld0JhckhlYWRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1iYXItaGVhZGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHRvZ2dsZVByZXZpZXdCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZS1wcmV2aWV3LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3UHJldkJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1wcmV2LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3TmV4dEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1uZXh0LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3TGlzdFdyYXBwZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3ByZXZpZXctbGlzdC13cmFwcGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHByZXZpZXdMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3LWxpc3QnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgYm90dG9tUGFuZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2JvdHRvbS1wYW5lbCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBib3R0b21TcGxpdHRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnYm90dG9tLXNwbGl0dGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBUaGVtZSB0b2dnbGVcclxuICAgICAgZGFya01vZGVUb2dnbGU6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2RhcmstbW9kZS10b2dnbGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gTGFiZWwgY2xhc3MgbW9kYWxcclxuICAgICAgbGFiZWxDbGFzc01vZGFsOiBuZXcgQm9vdHN0cmFwTW9kYWxXcmFwcGVyKHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2xhYmVsQ2xhc3NNb2RhbCcpKSxcclxuICAgICAgbGFiZWxDbGFzc0lucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1jbGFzcy1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGNsYXNzU2VsZWN0aW9uQ29udGFpbmVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1zZWxlY3Rpb24tY29udGFpbmVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHNhdmVMYWJlbENsYXNzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzYXZlLWxhYmVsLWNsYXNzLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gQ29udGV4dCBtZW51XHJcbiAgICAgIGNvbnRleHRNZW51OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb250ZXh0LW1lbnUnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgY3R4RWRpdExhYmVsOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjdHgtZWRpdC1sYWJlbCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjdHhEZWxldGVMYWJlbDogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3R4LWRlbGV0ZS1sYWJlbCcpIGFzIEhUTUxFbGVtZW50LFxyXG5cclxuICAgICAgLy8gTG9hZGluZyBvdmVybGF5XHJcbiAgICAgIGxvYWRpbmdPdmVybGF5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nLW92ZXJsYXknKSBhcyBIVE1MRWxlbWVudFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RWxlbWVudEJ5SWQoaWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAvLyBDZW50cmFsaXplZCBJRCBhbGlhc2VzIHRvIG1hcCBzZW1hbnRpYyBrZWJhYi1jYXNlIElEcyB0byBsZWdhY3kgRE9NIElEc1xuICAgIGNvbnN0IGxlZ2FjeUlkTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgLy8gRm9sZGVyIHNlbGVjdGlvblxuICAgICAgJ3NlbGVjdC1pbWFnZS1mb2xkZXItYnRuJzogJ3NlbGVjdEltYWdlRm9sZGVyQnRuJyxcbiAgICAgICdzZWxlY3QtbGFiZWwtZm9sZGVyLWJ0bic6ICdzZWxlY3RMYWJlbEZvbGRlckJ0bicsXG4gICAgICAnbG9hZC1jbGFzcy1pbmZvLWZvbGRlci1idG4nOiAnbG9hZENsYXNzSW5mb0ZvbGRlckJ0bicsXG5cbiAgICAgIC8vIENsYXNzIGZpbGUgZWxlbWVudHNcbiAgICAgICd2aWV3LWNsYXNzLWZpbGUtYnRuJzogJ3ZpZXdDbGFzc0ZpbGVCdG4nLFxuICAgICAgJ2NsYXNzLWZpbGUtZWRpdG9yLWJvZHknOiAnY2xhc3NGaWxlRWRpdG9yQm9keScsXG4gICAgICAnYWRkLWNsYXNzLXJvdy1idG4nOiAnYWRkQ2xhc3NSb3dCdG4nLFxuICAgICAgJ3NhdmUtY2xhc3MtZmlsZS1idG4nOiAnc2F2ZUNsYXNzRmlsZUJ0bicsXG4gICAgICAnZG93bmxvYWQtY2xhc3Nlcy1idG4nOiAnZG93bmxvYWRDbGFzc2VzQnRuJyxcbiAgICAgICdjbGFzcy1maWxlLXNlbGVjdCc6ICdjbGFzcy1maWxlLXNlbGVjdCcsXG5cbiAgICAgIC8vIEltYWdlIGxpc3QgLyBmaWx0ZXJzXG4gICAgICAnaW1hZ2Utc2VhcmNoLWlucHV0JzogJ2ltYWdlU2VhcmNoSW5wdXQnLFxuICAgICAgJ3Nob3ctbGFiZWxlZC1jaGVja2JveCc6ICdzaG93TGFiZWxlZCcsXG4gICAgICAnc2hvdy11bmxhYmVsZWQtY2hlY2tib3gnOiAnc2hvd1VubGFiZWxlZCcsXG4gICAgICAnaW1hZ2UtbGlzdCc6ICdpbWFnZS1saXN0JyxcbiAgICAgICdsYWJlbC1saXN0JzogJ2xhYmVsLWxpc3QnLFxuXG4gICAgICAvLyBTYXZlL2xvYWRcbiAgICAgICdzYXZlLWxhYmVscy1idG4nOiAnc2F2ZUxhYmVsc0J0bicsXG4gICAgICAnYXV0by1zYXZlLXRvZ2dsZSc6ICdhdXRvU2F2ZVRvZ2dsZScsXG5cbiAgICAgIC8vIENhbnZhcyBkaXNwbGF5IG9wdGlvbnNcbiAgICAgICdzaG93LWxhYmVscy1vbi1jYW52YXMtdG9nZ2xlJzogJ3Nob3dMYWJlbHNPbkNhbnZhc1RvZ2dsZScsXG4gICAgICAnbGFiZWwtZm9udC1zaXplLXNsaWRlcic6ICdsYWJlbC1mb250LXNpemUnLFxuICAgICAgJ2xhYmVsLWZvbnQtc2l6ZS12YWx1ZSc6ICdsYWJlbC1mb250LXNpemUtdmFsdWUnLFxuICAgICAgJ2Nyb3NzaGFpci10b2dnbGUnOiAnY3Jvc3NoYWlyVG9nZ2xlJyxcblxuICAgICAgLy8gTW9kZXNcbiAgICAgICdkcmF3LW1vZGUtYnRuJzogJ2RyYXdNb2RlJyxcbiAgICAgICdlZGl0LW1vZGUtYnRuJzogJ2VkaXRNb2RlJyxcblxuICAgICAgLy8gTGFiZWwgZmlsdGVycyAmIHNlbGVjdHNcbiAgICAgICdsYWJlbC1maWx0ZXJzJzogJ2xhYmVsLWZpbHRlcnMnLFxuICAgICAgJ3NlbGVjdC1ieS1jbGFzcy1kcm9wZG93bic6ICdzZWxlY3QtYnktY2xhc3MtZHJvcGRvd24nLFxuICAgICAgJ3NlbGVjdC1ieS1jbGFzcy1idG4nOiAnc2VsZWN0LWJ5LWNsYXNzLWJ0bicsXG4gICAgICAnc29ydC1sYWJlbHMtYXNjLWJ0bic6ICdzb3J0TGFiZWxzQXNjQnRuJyxcbiAgICAgICdzb3J0LWxhYmVscy1kZXNjLWJ0bic6ICdzb3J0TGFiZWxzRGVzY0J0bicsXG5cbiAgICAgIC8vIFpvb20gY29udHJvbHNcbiAgICAgICd6b29tLWluLWJ0bic6ICd6b29tSW5CdG4nLFxuICAgICAgJ3pvb20tb3V0LWJ0bic6ICd6b29tT3V0QnRuJyxcbiAgICAgICdyZXNldC16b29tLWJ0bic6ICdyZXNldFpvb21CdG4nLFxuICAgICAgJ3pvb20taW5wdXQnOiAnem9vbS1pbnB1dCcsXG5cbiAgICAgIC8vIENvb3Jkc1xuICAgICAgJ21vdXNlLWNvb3Jkcy1kaXNwbGF5JzogJ2luZm8tZGlzcGxheScsXG4gICAgICAnY29vcmQteC1pbnB1dCc6ICdjb29yZFgnLFxuICAgICAgJ2Nvb3JkLXktaW5wdXQnOiAnY29vcmRZJyxcbiAgICAgICdnby10by1jb29yZHMtYnRuJzogJ2dvVG9Db29yZHNCdG4nLFxuXG4gICAgICAvLyBOYXZpZ2F0aW9uXG4gICAgICAnY3VycmVudC1pbWFnZS1uYW1lJzogJ2N1cnJlbnQtaW1hZ2UtbmFtZScsXG4gICAgICAncHJldi1pbWFnZS1idG4nOiAncHJldkltYWdlQnRuJyxcbiAgICAgICduZXh0LWltYWdlLWJ0bic6ICduZXh0SW1hZ2VCdG4nLFxuXG4gICAgICAvLyBQYW5lbHMgJiBzcGxpdHRlcnNcbiAgICAgICdsZWZ0LXBhbmVsJzogJ2xlZnQtcGFuZWwnLFxuICAgICAgJ3JpZ2h0LXBhbmVsJzogJ3JpZ2h0LXBhbmVsJyxcbiAgICAgICdsZWZ0LXNwbGl0dGVyJzogJ2xlZnQtc3BsaXR0ZXInLFxuICAgICAgJ3JpZ2h0LXNwbGl0dGVyJzogJ3JpZ2h0LXNwbGl0dGVyJyxcbiAgICAgICdjb2xsYXBzZS1sZWZ0LXBhbmVsLWJ0bic6ICdjb2xsYXBzZS1sZWZ0LXBhbmVsLWJ0bicsXG4gICAgICAnZXhwYW5kLWxlZnQtcGFuZWwtYnRuJzogJ2V4cGFuZC1sZWZ0LXBhbmVsLWJ0bicsXG4gICAgICAnY29sbGFwc2UtcmlnaHQtcGFuZWwtYnRuJzogJ2NvbGxhcHNlLXJpZ2h0LXBhbmVsLWJ0bicsXG4gICAgICAnZXhwYW5kLXJpZ2h0LXBhbmVsLWJ0bic6ICdleHBhbmQtcmlnaHQtcGFuZWwtYnRuJyxcblxuICAgICAgLy8gUHJldmlldyBiYXJcbiAgICAgICdwcmV2aWV3LWJhcic6ICdwcmV2aWV3LWJhcicsXG4gICAgICAncHJldmlldy1iYXItaGVhZGVyJzogJ3ByZXZpZXctYmFyLWhlYWRlcicsXG4gICAgICAndG9nZ2xlLXByZXZpZXctYnRuJzogJ3RvZ2dsZS1wcmV2aWV3LWJ0bicsXG4gICAgICAncHJldmlldy1wcmV2LWJ0bic6ICdwcmV2aWV3LXByZXYtYnRuJyxcbiAgICAgICdwcmV2aWV3LW5leHQtYnRuJzogJ3ByZXZpZXctbmV4dC1idG4nLFxuICAgICAgJ3ByZXZpZXctbGlzdC13cmFwcGVyJzogJ3ByZXZpZXctbGlzdC13cmFwcGVyJyxcbiAgICAgICdwcmV2aWV3LWxpc3QnOiAncHJldmlldy1saXN0JyxcbiAgICAgICdib3R0b20tcGFuZWwnOiAnYm90dG9tLXBhbmVsJyxcbiAgICAgICdib3R0b20tc3BsaXR0ZXInOiAnYm90dG9tLXNwbGl0dGVyJyxcblxuICAgICAgLy8gVGhlbWVcbiAgICAgICdkYXJrLW1vZGUtdG9nZ2xlJzogJ2RhcmtNb2RlVG9nZ2xlJyxcblxuICAgICAgLy8gTGFiZWwgY2xhc3MgbW9kYWxcbiAgICAgICdsYWJlbC1jbGFzcy1pbnB1dCc6ICdsYWJlbENsYXNzSW5wdXQnLFxuICAgICAgJ3NhdmUtbGFiZWwtY2xhc3MtYnRuJzogJ3NhdmVMYWJlbENsYXNzQnRuJyxcbiAgICAgICdjbGFzcy1zZWxlY3Rpb24tY29udGFpbmVyJzogJ2NsYXNzLXNlbGVjdGlvbi1jb250YWluZXInLFxuXG4gICAgICAvLyBDb250ZXh0IG1lbnVcbiAgICAgICdjb250ZXh0LW1lbnUnOiAnY29udGV4dC1tZW51JyxcbiAgICAgICdjdHgtZWRpdC1sYWJlbCc6ICdjdHgtZWRpdC1sYWJlbCcsXG4gICAgICAnY3R4LWRlbGV0ZS1sYWJlbCc6ICdjdHgtZGVsZXRlLWxhYmVsJyxcblxuICAgICAgLy8gQ2FudmFzICYgb3ZlcmxheXNcbiAgICAgICdjYW52YXMtY29udGFpbmVyJzogJ2NhbnZhcy1jb250YWluZXInLFxuICAgICAgJ2xvYWRpbmctb3ZlcmxheSc6ICdsb2FkaW5nLW92ZXJsYXknLFxuICAgICAgJ3RvYXN0LWNvbnRhaW5lcic6ICd0b2FzdC1jb250YWluZXInXG4gICAgfTtcblxuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgY29uc3QgbGVnYWN5SWQgPSBsZWdhY3lJZE1hcFtpZF07XG4gICAgICBpZiAobGVnYWN5SWQpIHtcbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGxlZ2FjeUlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCB3aXRoIElEICcke2lkfScgbm90IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICB9XG5cbiAgLy8gQXNzaWduIHNlbWFudGljIElEcyBhdCBydW50aW1lIGZvciBlbGVtZW50cyBtaXNzaW5nIElEcyBpbiBwdWJsaWMgSFRNTFxuICBwcml2YXRlIGVuc3VyZURvbUlkcygpOiB2b2lkIHtcbiAgICBjb25zdCBxID0gKHNlbDogc3RyaW5nLCByb290OiBEb2N1bWVudCB8IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQpID0+IHJvb3QucXVlcnlTZWxlY3RvcihzZWwpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBjb25zdCBzZXRJZCA9IChlbDogSFRNTEVsZW1lbnQgfCBudWxsLCBpZDogc3RyaW5nKSA9PiB7IGlmIChlbCAmJiAhZWwuaWQpIGVsLmlkID0gaWQ7IH07XG5cbiAgICAvLyBOYXZiYXIgcHJldi9uZXh0IGFyb3VuZCBjdXJyZW50IGltYWdlIG5hbWVcbiAgICBjb25zdCBuYXYgPSBxKCcubmF2YmFyIC5jb250YWluZXItZmx1aWQnKTtcbiAgICBpZiAobmF2KSB7XG4gICAgICBjb25zdCBjZW50ZXJHcm91cCA9IG5hdi5xdWVyeVNlbGVjdG9yKCcubXgtYXV0bycpO1xuICAgICAgaWYgKGNlbnRlckdyb3VwKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBBcnJheS5mcm9tKGNlbnRlckdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpKSBhcyBIVE1MRWxlbWVudFtdO1xuICAgICAgICBpZiAoYnV0dG9ucy5sZW5ndGggPj0gMikge1xuICAgICAgICAgIHNldElkKGJ1dHRvbnNbMF0gPz8gbnVsbCwgJ3ByZXZJbWFnZUJ0bicpO1xuICAgICAgICAgIHNldElkKGJ1dHRvbnNbYnV0dG9ucy5sZW5ndGggLSAxXSA/PyBudWxsLCAnbmV4dEltYWdlQnRuJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZVNwYW4gPSBjZW50ZXJHcm91cC5xdWVyeVNlbGVjdG9yKCdzcGFuLm5hdmJhci10ZXh0JykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgICBzZXRJZChuYW1lU3BhbiwgJ2N1cnJlbnQtaW1hZ2UtbmFtZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFpvb20gYnV0dG9ucyBieSBpY29uXG4gICAgY29uc3QgaW5mbyA9IHEoJyNpbmZvLWRpc3BsYXknKTtcbiAgICBpZiAoaW5mbykge1xuICAgICAgY29uc3Qgem9vbUluID0gcSgnYnV0dG9uIGkuYmktem9vbS1pbicsIGluZm8pPy5jbG9zZXN0KCdidXR0b24nKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgICBjb25zdCB6b29tT3V0ID0gcSgnYnV0dG9uIGkuYmktem9vbS1vdXQnLCBpbmZvKT8uY2xvc2VzdCgnYnV0dG9uJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgY29uc3QgcmVzZXRab29tID0gcSgnYnV0dG9uIGkuYmktYXNwZWN0LXJhdGlvJywgaW5mbyk/LmNsb3Nlc3QoJ2J1dHRvbicpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgIHNldElkKHpvb21JbiwgJ3pvb21JbkJ0bicpO1xuICAgICAgc2V0SWQoem9vbU91dCwgJ3pvb21PdXRCdG4nKTtcbiAgICAgIHNldElkKHJlc2V0Wm9vbSwgJ3Jlc2V0Wm9vbUJ0bicpO1xuXG4gICAgICAvLyBDb29yZHMgY29udGFpbmVyIGlucHV0cy9idXR0b25cbiAgICAgIGNvbnN0IGNvb3JkcyA9IHEoJyNjb29yZHMtaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICBpZiAoY29vcmRzKSB7XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IEFycmF5LmZyb20oY29vcmRzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0JykpIGFzIEhUTUxFbGVtZW50W107XG4gICAgICAgIHNldElkKGlucHV0c1swXSA/PyBudWxsLCAnY29vcmRYJyk7XG4gICAgICAgIHNldElkKGlucHV0c1sxXSA/PyBudWxsLCAnY29vcmRZJyk7XG4gICAgICAgIGNvbnN0IGdvQnRuID0gY29vcmRzLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgc2V0SWQoZ29CdG4sICdnb1RvQ29vcmRzQnRuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFpvb20gcGVyY2VudCBpbnB1dFxuICAgICAgY29uc3Qgem9vbUdyb3VwID0gQXJyYXkuZnJvbShpbmZvLnF1ZXJ5U2VsZWN0b3JBbGwoJy5pbnB1dC1ncm91cCBpbnB1dFt0eXBlPVxcXCJudW1iZXJcXFwiXScpKVswXSBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgIHNldElkKHpvb21Hcm91cCA/PyBudWxsLCAnem9vbS1pbnB1dCcpO1xuICAgIH1cblxuICAgIC8vIExlZnQgcGFuZWwgYnV0dG9ucyBieSB0ZXh0XG4gICAgY29uc3QgbGVmdFBhbmVsID0gcSgnI2xlZnQtcGFuZWwnKTtcbiAgICBpZiAobGVmdFBhbmVsKSB7XG4gICAgICBjb25zdCBsb2FkSW1nID0gQXJyYXkuZnJvbShsZWZ0UGFuZWwucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpLmZpbmQoYiA9PiBiLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdsb2FkIGltYWdlIGZvbGRlcicpKSBhcyBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IGxvYWRMYmwgPSBBcnJheS5mcm9tKGxlZnRQYW5lbC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkuZmluZChiID0+IGIudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2xvYWQgbGFiZWwgZm9sZGVyJykpIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgc2V0SWQobG9hZEltZyB8fCBudWxsLCAnc2VsZWN0SW1hZ2VGb2xkZXJCdG4nKTtcbiAgICAgIHNldElkKGxvYWRMYmwgfHwgbnVsbCwgJ3NlbGVjdExhYmVsRm9sZGVyQnRuJyk7XG5cbiAgICAgIGNvbnN0IHNhdmVCdG4gPSBBcnJheS5mcm9tKGxlZnRQYW5lbC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkuZmluZChiID0+IGIudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3NhdmUgbGFiZWxzJykpIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3QgZGxCdG4gPSBBcnJheS5mcm9tKGxlZnRQYW5lbC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKSkuZmluZChiID0+IGIudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2Rvd25sb2FkIGNsYXNzJykpIGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgICAgc2V0SWQoc2F2ZUJ0biB8fCBudWxsLCAnc2F2ZUxhYmVsc0J0bicpO1xuICAgICAgc2V0SWQoZGxCdG4gfHwgbnVsbCwgJ2Rvd25sb2FkQ2xhc3Nlc0J0bicpO1xuICAgIH1cbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBVSUV2ZW50VHlwZSwgaGFuZGxlcjogVUlFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudEhhbmRsZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc2V0KHR5cGUsIG5ldyBTZXQoKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KHR5cGUpIS5hZGQoaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IFVJRXZlbnRUeXBlLCBoYW5kbGVyOiBVSUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzLmRlbGV0ZShoYW5kbGVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hVSUV2ZW50PFQgPSBhbnk+KHR5cGU6IFVJRXZlbnRUeXBlLCBkYXRhPzogVCwgdGFyZ2V0PzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGV2ZW50OiBVSUV2ZW50PFQ+ID0ge1xyXG4gICAgICB0eXBlLFxyXG4gICAgICBkYXRhLFxyXG4gICAgICB0YXJnZXQsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRIYW5kbGVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZlbnQpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQYW5lbCBNYW5hZ2VtZW50XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVQYW5lbENvbmZpZ3MoKTogdm9pZCB7XHJcbiAgICB0aGlzLnBhbmVsQ29uZmlncy5zZXQoJ2xlZnQnLCB7XHJcbiAgICAgIHBhbmVsOiB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbCxcclxuICAgICAgc3BsaXR0ZXI6IHRoaXMuZWxlbWVudHMubGVmdFNwbGl0dGVyLFxyXG4gICAgICBleHBhbmRCdG46IHRoaXMuZWxlbWVudHMuZXhwYW5kTGVmdFBhbmVsQnRuLFxyXG4gICAgICBpc0NvbGxhcHNpbmc6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBhbmVsQ29uZmlncy5zZXQoJ3JpZ2h0Jywge1xyXG4gICAgICBwYW5lbDogdGhpcy5lbGVtZW50cy5yaWdodFBhbmVsLFxyXG4gICAgICBzcGxpdHRlcjogdGhpcy5lbGVtZW50cy5yaWdodFNwbGl0dGVyLFxyXG4gICAgICBleHBhbmRCdG46IHRoaXMuZWxlbWVudHMuZXhwYW5kUmlnaHRQYW5lbEJ0bixcclxuICAgICAgaXNDb2xsYXBzaW5nOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVQYW5lbChjb25maWc6IFBhbmVsQ29uZmlnKTogdm9pZCB7XHJcbiAgICBpZiAoY29uZmlnLmlzQ29sbGFwc2luZykgcmV0dXJuO1xyXG5cclxuICAgIGNvbmZpZy5pc0NvbGxhcHNpbmcgPSB0cnVlO1xyXG4gICAgY29uc3QgaXNDb2xsYXBzZWQgPSBjb25maWcucGFuZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xyXG5cclxuICAgIGlmIChpc0NvbGxhcHNlZCkge1xyXG4gICAgICAvLyBFeHBhbmQgcGFuZWxcclxuICAgICAgY29uZmlnLnBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICBjb25maWcuZXhwYW5kQnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIGNvbmZpZy5zcGxpdHRlci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENvbGxhcHNlIHBhbmVsXHJcbiAgICAgIGNvbmZpZy5wYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICBjb25maWcuZXhwYW5kQnRuLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICBjb25maWcuc3BsaXR0ZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCBmbGFnIGFmdGVyIGFuaW1hdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGNvbmZpZy5pc0NvbGxhcHNpbmcgPSBmYWxzZTtcclxuICAgIH0sIDMwMCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ3BhbmVsOnRvZ2dsZWQnLCB7IHBhbmVsSWQ6IGNvbmZpZy5wYW5lbC5pZCwgY29sbGFwc2VkOiAhaXNDb2xsYXBzZWQgfSk7XHJcbiAgfVxyXG5cclxuICBzZXR1cFNwbGl0dGVycygpOiB2b2lkIHtcclxuICAgIHRoaXMuc3BsaXR0ZXJDb25maWdzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3BsaXR0ZXI6IHRoaXMuZWxlbWVudHMubGVmdFNwbGl0dGVyLFxyXG4gICAgICAgIHBhbmVsOiB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbCxcclxuICAgICAgICBkaXJlY3Rpb246ICdsZWZ0JyxcclxuICAgICAgICBtaW5XaWR0aDogMjAwLFxyXG4gICAgICAgIG1heFdpZHRoOiA1MDBcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHNwbGl0dGVyOiB0aGlzLmVsZW1lbnRzLnJpZ2h0U3BsaXR0ZXIsXHJcbiAgICAgICAgcGFuZWw6IHRoaXMuZWxlbWVudHMucmlnaHRQYW5lbCxcclxuICAgICAgICBkaXJlY3Rpb246ICdyaWdodCcsXHJcbiAgICAgICAgbWluV2lkdGg6IDIwMCxcclxuICAgICAgICBtYXhXaWR0aDogNTAwXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5zcGxpdHRlckNvbmZpZ3MuZm9yRWFjaChjb25maWcgPT4ge1xyXG4gICAgICB0aGlzLnNldHVwU3BsaXR0ZXIoY29uZmlnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cFNwbGl0dGVyKGNvbmZpZzogU3BsaXR0ZXJDb25maWcpOiB2b2lkIHtcclxuICAgIGxldCBpc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICBsZXQgc3RhcnRYID0gMDtcclxuICAgIGxldCBzdGFydFdpZHRoID0gMDtcclxuXHJcbiAgICBjb25maWcuc3BsaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgIHN0YXJ0WCA9IGUuY2xpZW50WDtcclxuICAgICAgc3RhcnRXaWR0aCA9IHBhcnNlSW50KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGNvbmZpZy5wYW5lbCkud2lkdGgsIDEwKTtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlTW91c2VNb3ZlKTtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVNb3VzZU1vdmUgPSAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICBpZiAoIWlzRHJhZ2dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IGRlbHRhWCA9IGNvbmZpZy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/IGUuY2xpZW50WCAtIHN0YXJ0WCA6IHN0YXJ0WCAtIGUuY2xpZW50WDtcclxuICAgICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1pbihNYXRoLm1heChzdGFydFdpZHRoICsgZGVsdGFYLCBjb25maWcubWluV2lkdGgpLCBjb25maWcubWF4V2lkdGgpO1xyXG4gICAgICBjb25maWcucGFuZWwuc3R5bGUud2lkdGggPSBgJHtuZXdXaWR0aH1weGA7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZU1vdXNlVXAgPSAoKSA9PiB7XHJcbiAgICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlTW91c2VNb3ZlKTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlc2l6ZVBhbmVscygpOiB2b2lkIHtcclxuICAgIC8vIFJlc2l6ZSBwYW5lbHMgYmFzZWQgb24gd2luZG93IHNpemVcclxuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICBjb25zdCBsZWZ0UGFuZWwgPSB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbDtcclxuICAgIGNvbnN0IHJpZ2h0UGFuZWwgPSB0aGlzLmVsZW1lbnRzLnJpZ2h0UGFuZWw7XHJcblxyXG4gICAgaWYgKHdpbmRvd1dpZHRoIDwgNzY4KSB7XHJcbiAgICAgIC8vIE1vYmlsZSB2aWV3IC0gaGlkZSBwYW5lbHNcclxuICAgICAgbGVmdFBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIHJpZ2h0UGFuZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERlc2t0b3AgdmlldyAtIHNob3cgcGFuZWxzXHJcbiAgICAgIGxlZnRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgcmlnaHRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBMb2FkaW5nIFN0YXRlIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHNob3dMb2FkaW5nSW5kaWNhdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsb2FkaW5nOnNob3cnKTtcclxuICB9XHJcblxyXG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmxvYWRpbmdPdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbG9hZGluZzpoaWRlJyk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVMb2FkaW5nUHJvZ3Jlc3MocHJvZ3Jlc3M6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgIGlmIChtZXNzYWdlKSB7XHJcbiAgICAgIHRoaXMubG9hZGluZ1N0YXRlLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBsb2FkaW5nIFVJXHJcbiAgICBjb25zdCBwcm9ncmVzc0JhciA9IHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkucXVlcnlTZWxlY3RvcignLnByb2dyZXNzLWJhcicpIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgaWYgKHByb2dyZXNzQmFyKSB7XHJcbiAgICAgIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gYCR7cHJvZ3Jlc3N9JWA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzLmxvYWRpbmdPdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nLW1lc3NhZ2UnKSBhcyBIVE1MRWxlbWVudDtcclxuICAgIGlmIChtZXNzYWdlRWxlbWVudCAmJiBtZXNzYWdlKSB7XHJcbiAgICAgIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbG9hZGluZzpwcm9ncmVzcycsIHsgcHJvZ3Jlc3MsIG1lc3NhZ2UgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVGhlbWUgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZ2V0Q3VycmVudFRoZW1lKCk6IFRoZW1lQ29uZmlnIHtcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaGVtZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RGVmYXVsdFRoZW1lKCk6IFRoZW1lQ29uZmlnIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6ICdsaWdodCcsXHJcbiAgICAgIHByaW1hcnlDb2xvcjogJyMwMDdiZmYnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgdGV4dENvbG9yOiAnIzMzMzMzMycsXHJcbiAgICAgIGJvcmRlckNvbG9yOiAnI2RlZTJlNidcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERhcmtUaGVtZSgpOiBUaGVtZUNvbmZpZyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOiAnZGFyaycsXHJcbiAgICAgIHByaW1hcnlDb2xvcjogJyMwZDZlZmQnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMWExYTFhJyxcclxuICAgICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgIGJvcmRlckNvbG9yOiAnIzQ0NDQ0NCdcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBhcHBseVRoZW1lKHRoZW1lOiBUaGVtZUNvbmZpZyk6IHZvaWQge1xyXG4gICAgdGhpcy5jdXJyZW50VGhlbWUgPSB0aGVtZTtcclxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtdGhlbWUnLCB0aGVtZS5uYW1lKTtcclxuXHJcbiAgICAvLyBBcHBseSBjdXN0b20gQ1NTIHZhcmlhYmxlc1xyXG4gICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tcHJpbWFyeS1jb2xvcicsIHRoZW1lLnByaW1hcnlDb2xvcik7XHJcbiAgICByb290LnN0eWxlLnNldFByb3BlcnR5KCctLWJhY2tncm91bmQtY29sb3InLCB0aGVtZS5iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS10ZXh0LWNvbG9yJywgdGhlbWUudGV4dENvbG9yKTtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tYm9yZGVyLWNvbG9yJywgdGhlbWUuYm9yZGVyQ29sb3IpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCd0aGVtZTpjaGFuZ2VkJywgdGhlbWUpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlRGFya01vZGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBpc0RhcmsgPSB0aGlzLmN1cnJlbnRUaGVtZS5uYW1lID09PSAnZGFyayc7XHJcbiAgICBjb25zdCBuZXdUaGVtZSA9IGlzRGFyayA/IHRoaXMuZ2V0RGVmYXVsdFRoZW1lKCkgOiB0aGlzLmdldERhcmtUaGVtZSgpO1xyXG4gICAgdGhpcy5hcHBseVRoZW1lKG5ld1RoZW1lKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdG9nZ2xlIHN0YXRlXHJcbiAgICB0aGlzLmVsZW1lbnRzLmRhcmtNb2RlVG9nZ2xlLmNoZWNrZWQgPSAhaXNEYXJrO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExpc3QgUmVuZGVyaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICByZW5kZXJJbWFnZUxpc3QoKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbWFnZUxpc3QgPSB0aGlzLmVsZW1lbnRzLmltYWdlTGlzdDtcclxuICAgIGltYWdlTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICB0aGlzLmltYWdlTGlzdEl0ZW1zID0gdGhpcy5fc3RhdGUuaW1hZ2VGaWxlcy5tYXAoaW1hZ2VGaWxlID0+IHtcclxuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgbGlzdEl0ZW0uY2xhc3NOYW1lID0gJ2ltYWdlLWxpc3QtaXRlbSc7XHJcbiAgICAgIGxpc3RJdGVtLmRhdGFzZXQuZmlsZU5hbWUgPSBpbWFnZUZpbGUubmFtZTtcclxuXHJcbiAgICAgIGNvbnN0IGlzTGFiZWxlZCA9IHRoaXMuX3N0YXRlLmdldEltYWdlTGFiZWxTdGF0dXMoaW1hZ2VGaWxlLm5hbWUpO1xyXG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gdGhpcy5fc3RhdGUuY3VycmVudEltYWdlRmlsZT8ubmFtZSA9PT0gaW1hZ2VGaWxlLm5hbWU7XHJcblxyXG4gICAgICBsaXN0SXRlbS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImltYWdlLWl0ZW0tY29udGVudFwiPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbWFnZS1uYW1lXCI+JHtpbWFnZUZpbGUubmFtZX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImltYWdlLXN0YXR1cyAke2lzTGFiZWxlZCA/ICdsYWJlbGVkJyA6ICd1bmxhYmVsZWQnfVwiPlxyXG4gICAgICAgICAgICAke2lzTGFiZWxlZCA/ICfil48nIDogJ+KXiyd9XHJcbiAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICBpZiAoaXNTZWxlY3RlZCkge1xyXG4gICAgICAgIGxpc3RJdGVtLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpc3RJdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0SW1hZ2UoaW1hZ2VGaWxlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpbWFnZUxpc3QuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBmaWxlOiBpbWFnZUZpbGUsXHJcbiAgICAgICAgaXNMYWJlbGVkLFxyXG4gICAgICAgIGlzU2VsZWN0ZWQsXHJcbiAgICAgICAgZWxlbWVudDogbGlzdEl0ZW1cclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdpbWFnZTpsaXN0LXJlbmRlcmVkJywgeyBjb3VudDogdGhpcy5pbWFnZUxpc3RJdGVtcy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHNlbGVjdEltYWdlKGltYWdlRmlsZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc3RhdGUuc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZSk7XG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2ltYWdlOnNlbGVjdGVkJywgeyBpbWFnZUZpbGUgfSk7XG5cbiAgICAvLyBVcGRhdGUgc2VsZWN0ZWQgaGlnaGxpZ2h0IGFuZCBjdXJyZW50IGltYWdlIG5hbWVcbiAgICB0cnkge1xuICAgICAgdGhpcy5pbWFnZUxpc3RJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBpdGVtLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnLCBpdGVtLmZpbGUubmFtZSA9PT0gaW1hZ2VGaWxlLm5hbWUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICAgIGlmICh0aGlzLl9lbGVtZW50cz8uY3VycmVudEltYWdlTmFtZVNwYW4pIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRzLmN1cnJlbnRJbWFnZU5hbWVTcGFuLnRleHRDb250ZW50ID0gaW1hZ2VGaWxlPy5uYW1lIHx8ICcnO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBMb2FkIGltYWdlIGZyb20gZmlsZSBzeXN0ZW0gYW5kIGRpc3BsYXkgb24gY2FudmFzXG4gICAgICBjb25zdCBpbWdSZXN1bHQgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLmxvYWRJbWFnZT8uKGltYWdlRmlsZS5oYW5kbGUpO1xuICAgICAgaWYgKGltZ1Jlc3VsdD8uc3VjY2VzcyAmJiBpbWdSZXN1bHQuZGF0YSkge1xuICAgICAgICBjb25zdCBpbWdFbCA9IGltZ1Jlc3VsdC5kYXRhIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgICAgIC8vIEtlZXAgY3VycmVudCBpbWFnZSBlbGVtZW50IGluIHN0YXRlIGZvciBzaXplIHJlZmVyZW5jZSB3aGVuIHNhdmluZ1xuICAgICAgICB0cnkgeyAodGhpcy5fc3RhdGUgYXMgYW55KS5jdXJyZW50SW1hZ2UgPSBpbWdFbDsgfSBjYXRjaCB7fVxuICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLmxvYWRJbWFnZShpbWdFbCk7XG5cbiAgICAgICAgLy8gTG9hZCBsYWJlbHMgaWYgbGFiZWwgZm9sZGVyIHNlbGVjdGVkXG4gICAgICAgIGNvbnN0IGxhYmVsRm9sZGVyID0gKHRoaXMuX3N0YXRlIGFzIGFueSkubGFiZWxGb2xkZXJIYW5kbGU7XG4gICAgICAgIGlmIChsYWJlbEZvbGRlcikge1xuICAgICAgICAgIGNvbnN0IGxibFJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkubG9hZExhYmVscz8uKGltYWdlRmlsZS5uYW1lLCBsYWJlbEZvbGRlcik7XG4gICAgICAgICAgaWYgKGxibFJlc3VsdD8uc3VjY2VzcyAmJiBBcnJheS5pc0FycmF5KGxibFJlc3VsdC5kYXRhKSkge1xuICAgICAgICAgICAgLy8gQ2xlYXIgZXhpc3RpbmcgbGFiZWxzXG4gICAgICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKS5mb3JFYWNoKGIgPT4gdGhpcy5fY2FudmFzQ29udHJvbGxlci5yZW1vdmVCb3VuZGluZ0JveChiLmlkKSk7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IChpbWdFbCBhcyBhbnkpLm5hdHVyYWxXaWR0aCB8fCBpbWdFbC53aWR0aCB8fCAxO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gKGltZ0VsIGFzIGFueSkubmF0dXJhbEhlaWdodCB8fCBpbWdFbC5oZWlnaHQgfHwgMTtcbiAgICAgICAgICAgIGxibFJlc3VsdC5kYXRhLmZvckVhY2goKHk6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiYm94ID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci55b2xvVG9Cb3VuZGluZ0JveCh5LCB7IHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuYWRkQm91bmRpbmdCb3goYmJveCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBzZWxlY3RlZCBpbWFnZScsIGUpO1xuICAgIH1cbiAgfVxuXHJcbiAgdXBkYXRlTGFiZWxMaXN0KCk6IHZvaWQge1xuICAgIGNvbnN0IGxhYmVsTGlzdCA9IHRoaXMuZWxlbWVudHMubGFiZWxMaXN0O1xuICAgIGxhYmVsTGlzdC5pbm5lckhUTUwgPSAnJztcblxuICAgIGNvbnN0IHNlbGVjdGVkSWRzID0gbmV3IFNldChcbiAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ2V0U2VsZWN0ZWRCb3VuZGluZ0JveGVzKCkubWFwKGJveCA9PiBib3guaWQpXG4gICAgKTtcblxuICAgIC8vIEdldCBjdXJyZW50IGJvdW5kaW5nIGJveGVzIGZyb20gY2FudmFzXG4gICAgY29uc3QgYm91bmRpbmdCb3hlcyA9IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpO1xuXG4gICAgdGhpcy5sYWJlbExpc3RJdGVtcyA9IGJvdW5kaW5nQm94ZXMubWFwKGJib3ggPT4ge1xuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGxpc3RJdGVtLmNsYXNzTmFtZSA9ICdsYWJlbC1saXN0LWl0ZW0nO1xuICAgICAgbGlzdEl0ZW0uZGF0YXNldC5sYWJlbElkID0gYmJveC5pZDtcblxuICAgICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5nZXREaXNwbGF5TmFtZUZvckNsYXNzKGJib3guY2xhc3NJZC50b1N0cmluZygpKTtcbiAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBzZWxlY3RlZElkcy5oYXMoYmJveC5pZCk7XG5cbiAgICAgIGxpc3RJdGVtLmlubmVySFRNTCA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImxhYmVsLWl0ZW0tY29udGVudFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWwtY2xhc3NcIj4ke2NsYXNzTmFtZX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbC1jb29yZHNcIj4oJHtNYXRoLnJvdW5kKGJib3gueCl9LCAke01hdGgucm91bmQoYmJveC55KX0pPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGA7XG5cbiAgICAgIGxpc3RJdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdExhYmVsKGJib3guaWQpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgIGxpc3RJdGVtLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICB9XG5cbiAgICAgIGxhYmVsTGlzdC5hcHBlbmRDaGlsZChsaXN0SXRlbSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBiYm94LmlkLFxuICAgICAgICBjbGFzc0lkOiBiYm94LmNsYXNzSWQsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgYm91bmRpbmdCb3g6IGJib3gsXG4gICAgICAgIGlzU2VsZWN0ZWQsXG4gICAgICAgIGVsZW1lbnQ6IGxpc3RJdGVtXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2xhYmVsOmxpc3QtcmVuZGVyZWQnLCB7IGNvdW50OiB0aGlzLmxhYmVsTGlzdEl0ZW1zLmxlbmd0aCB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2VsZWN0TGFiZWwobGFiZWxJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5zZWxlY3RCb3VuZGluZ0JveChsYWJlbElkKTtcbiAgICB0aGlzLmxhYmVsTGlzdEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RlZCA9IGl0ZW0uaWQgPT09IGxhYmVsSWQ7XG4gICAgICBpdGVtLmlzU2VsZWN0ZWQgPSBzZWxlY3RlZDtcbiAgICAgIGl0ZW0uZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcsIHNlbGVjdGVkKTtcbiAgICB9KTtcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbGFiZWw6c2VsZWN0ZWQnLCB7IGxhYmVsSWQgfSk7XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWx0ZXIgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdXBkYXRlTGFiZWxGaWx0ZXJzKHJlY3RzOiBCb3VuZGluZ0JveFtdKTogdm9pZCB7XHJcbiAgICBjb25zdCBmaWx0ZXJzQ29udGFpbmVyID0gdGhpcy5lbGVtZW50cy5sYWJlbEZpbHRlcnM7XHJcbiAgICBmaWx0ZXJzQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgIC8vIEdyb3VwIGJ5IGNsYXNzXHJcbiAgICBjb25zdCBjbGFzc0dyb3VwcyA9IG5ldyBNYXA8bnVtYmVyLCBCb3VuZGluZ0JveFtdPigpO1xyXG4gICAgcmVjdHMuZm9yRWFjaChyZWN0ID0+IHtcclxuICAgICAgaWYgKCFjbGFzc0dyb3Vwcy5oYXMocmVjdC5jbGFzc0lkKSkge1xyXG4gICAgICAgIGNsYXNzR3JvdXBzLnNldChyZWN0LmNsYXNzSWQsIFtdKTtcclxuICAgICAgfVxyXG4gICAgICBjbGFzc0dyb3Vwcy5nZXQocmVjdC5jbGFzc0lkKSEucHVzaChyZWN0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZmlsdGVyQnV0dG9ucyA9IEFycmF5LmZyb20oY2xhc3NHcm91cHMuZW50cmllcygpKS5tYXAoKFtjbGFzc0lkLCBjbGFzc1JlY3RzXSkgPT4ge1xyXG4gICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdidG4gYnRuLW91dGxpbmUtcHJpbWFyeSBidG4tc20gZmlsdGVyLWJ0bic7XHJcbiAgICAgIGJ1dHRvbi5kYXRhc2V0LmNsYXNzSWQgPSBjbGFzc0lkLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmdldERpc3BsYXlOYW1lRm9yQ2xhc3MoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gYCR7Y2xhc3NOYW1lfSAoJHtjbGFzc1JlY3RzLmxlbmd0aH0pYDtcclxuXHJcbiAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUZpbHRlcihjbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGZpbHRlcnNDb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZWxlbWVudDogYnV0dG9uLFxyXG4gICAgICAgIGxhYmVsQ2xhc3M6IGNsYXNzSWQudG9TdHJpbmcoKSxcclxuICAgICAgICBjb3VudDogY2xhc3NSZWN0cy5sZW5ndGgsXHJcbiAgICAgICAgaXNBY3RpdmU6IHRydWVcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdmaWx0ZXI6dXBkYXRlZCcsIHsgZmlsdGVyQ291bnQ6IHRoaXMuZmlsdGVyQnV0dG9ucy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvZ2dsZUZpbHRlcihsYWJlbENsYXNzOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IGZpbHRlckJ1dHRvbiA9IHRoaXMuZmlsdGVyQnV0dG9ucy5maW5kKGJ0biA9PiBidG4ubGFiZWxDbGFzcyA9PT0gbGFiZWxDbGFzcyk7XHJcbiAgICBpZiAoZmlsdGVyQnV0dG9uKSB7XHJcbiAgICAgIGZpbHRlckJ1dHRvbi5pc0FjdGl2ZSA9ICFmaWx0ZXJCdXR0b24uaXNBY3RpdmU7XHJcbiAgICAgIGZpbHRlckJ1dHRvbi5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGZpbHRlckJ1dHRvbi5pc0FjdGl2ZSk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdmaWx0ZXI6Y2hhbmdlZCcsIHsgbGFiZWxDbGFzcywgYWN0aXZlOiBmaWx0ZXJCdXR0b24uaXNBY3RpdmUgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVTZWxlY3RCeUNsYXNzRHJvcGRvd24ocmVjdHM6IEJvdW5kaW5nQm94W10pOiB2b2lkIHtcbiAgICBjb25zdCBkcm9wZG93biA9IHRoaXMuZWxlbWVudHMuc2VsZWN0QnlDbGFzc0Ryb3Bkb3duO1xuICAgIGRyb3Bkb3duLmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+U2VsZWN0IGNsYXNzLi4uPC9vcHRpb24+JztcblxuICAgIGNvbnN0IHVuaXF1ZUNsYXNzZXMgPSBuZXcgU2V0KHJlY3RzLm1hcChyZWN0ID0+IHJlY3QuY2xhc3NJZCkpO1xuICAgIHVuaXF1ZUNsYXNzZXMuZm9yRWFjaChjbGFzc0lkID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgb3B0aW9uLnZhbHVlID0gY2xhc3NJZC50b1N0cmluZygpO1xuICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gdGhpcy5nZXREaXNwbGF5TmFtZUZvckNsYXNzKGNsYXNzSWQudG9TdHJpbmcoKSk7XG4gICAgICBkcm9wZG93bi5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBDbGFzcyAmIExhYmVsIE1hbmFnZW1lbnRcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHByaXZhdGUgcG9wdWxhdGVDbGFzc0ZpbGVEcm9wZG93bihjbGFzc0ZpbGVzOiBDbGFzc0ZpbGVbXSk6IHZvaWQge1xuICAgIGNvbnN0IGRyb3Bkb3duID0gdGhpcy5lbGVtZW50cy5jbGFzc0ZpbGVTZWxlY3Q7XG4gICAgZHJvcGRvd24uaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5DaG9vc2UuLi48L29wdGlvbj4nO1xuXG4gICAgY2xhc3NGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICBvcHRpb24udmFsdWUgPSBmaWxlLm5hbWU7XG4gICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBmaWxlLm5hbWU7XG4gICAgICBpZiAoZmlsZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICBkcm9wZG93bi5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJDbGFzc1NlbGVjdGlvbkJ1dHRvbnMoY2xhc3NEZWZzOiBDbGFzc0RlZmluaXRpb25bXSk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudHMuY2xhc3NTZWxlY3Rpb25Db250YWluZXI7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuY2xhc3NTZWxlY3Rpb25CdXR0b25zID0gW107XG5cbiAgICBpZiAoIWNsYXNzRGVmcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGhlbHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgIGhlbHBlci5jbGFzc05hbWUgPSAndGV4dC1tdXRlZCBzbWFsbCBtYi0wJztcbiAgICAgIGhlbHBlci50ZXh0Q29udGVudCA9ICftgbTrnpjsiqQg7YyM7J287J2EIOu2iOufrOyYpOuptCDruaDrpbTqsowg7ISg7YOd7ZWgIOyImCDsnojsirXri4jri6QuJztcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWxwZXIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNsYXNzRGVmcy5mb3JFYWNoKChkZWY6IENsYXNzRGVmaW5pdGlvbikgPT4ge1xuICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICBidG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgYnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLW91dGxpbmUtc2Vjb25kYXJ5IGJ0bi1zbSBtZS0yIG1iLTIgY2xhc3Mtc2VsZWN0LWJ0bic7XG4gICAgICBidG4udGV4dENvbnRlbnQgPSBgJHtkZWYuaWR9OiAke2RlZi5uYW1lfWA7XG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmFwcGx5Q2xhc3NUb1BlbmRpbmdMYWJlbHMoZGVmLmlkKSk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnRuKTtcbiAgICAgIHRoaXMuY2xhc3NTZWxlY3Rpb25CdXR0b25zLnB1c2goYnRuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbG9hZENsYXNzRmlsZUJ5TmFtZShmaWxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2xhc3NGaWxlID0gdGhpcy5fc3RhdGUuY2xhc3NGaWxlcy5maW5kKGZpbGUgPT4gZmlsZS5uYW1lID09PSBmaWxlTmFtZSk7XG4gICAgaWYgKCFjbGFzc0ZpbGUpIHtcbiAgICAgIHNob3dFcnJvclRvYXN0KCfshKDtg53tlZwg7YG0656Y7IqkIO2MjOydvOydhCDssL7snYQg7IiYIOyXhuyKteuLiOuLpC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmxvYWRDbGFzc0ZpbGVDb250ZW50KGNsYXNzRmlsZSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGxvYWRDbGFzc0ZpbGVDb250ZW50KGNsYXNzRmlsZTogQ2xhc3NGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkubG9hZENsYXNzRmlsZT8uKGNsYXNzRmlsZS5oYW5kbGUpO1xuICAgICAgaWYgKCFyZXN1bHQ/LnN1Y2Nlc3MgfHwgIXJlc3VsdC5kYXRhKSB7XG4gICAgICAgIHNob3dFcnJvclRvYXN0KHJlc3VsdD8uZXJyb3IgfHwgJ+2BtOuemOyKpCDtjIzsnbzsnYQg67aI65+s7Jik7KeAIOuqu+2WiOyKteuLiOuLpC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zdGF0ZS5jbGFzc05hbWVzLmNsZWFyKCk7XG4gICAgICByZXN1bHQuZGF0YS5jbGFzc2VzLmZvckVhY2goKGRlZjogQ2xhc3NEZWZpbml0aW9uKSA9PiB0aGlzLl9zdGF0ZS5hZGRDbGFzc0RlZmluaXRpb24oZGVmKSk7XG4gICAgICB0aGlzLl9zdGF0ZS5zZWxlY3RDbGFzc0ZpbGUoY2xhc3NGaWxlKTtcblxuICAgICAgdGhpcy5fc3RhdGUuY2xhc3NGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICBmaWxlLmlzU2VsZWN0ZWQgPSBmaWxlLm5hbWUgPT09IGNsYXNzRmlsZS5uYW1lO1xuICAgICAgICBpZiAoZmlsZS5uYW1lID09PSBjbGFzc0ZpbGUubmFtZSkge1xuICAgICAgICAgIGZpbGUuY29udGVudCA9IHJlc3VsdC5kYXRhLmNsYXNzZXM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnBvcHVsYXRlQ2xhc3NGaWxlRHJvcGRvd24odGhpcy5fc3RhdGUuY2xhc3NGaWxlcyk7XG4gICAgICB0aGlzLnJlbmRlckNsYXNzU2VsZWN0aW9uQnV0dG9ucyhyZXN1bHQuZGF0YS5jbGFzc2VzKTtcblxuICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci51cGRhdGVMYWJlbHMoKTtcbiAgICAgIGNvbnN0IGJveGVzID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCk7XG4gICAgICB0aGlzLnVwZGF0ZUxhYmVsRmlsdGVycyhib3hlcyk7XG4gICAgICB0aGlzLnVwZGF0ZVNlbGVjdEJ5Q2xhc3NEcm9wZG93bihib3hlcyk7XG4gICAgICB0aGlzLnVwZGF0ZUxhYmVsTGlzdCgpO1xuXG4gICAgICBzaG93U3VjY2Vzc1RvYXN0KGDtgbTrnpjsiqQg7YyM7J28IOuhnOuTnCDsmYTro4wgKCR7cmVzdWx0LmRhdGEuY2xhc3Nlcy5sZW5ndGh96rCcKWApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBjbGFzcyBmaWxlJywgZXJyb3IpO1xuICAgICAgc2hvd0Vycm9yVG9hc3QoJ+2BtOuemOyKpCDtjIzsnbwg66Gc65Oc7JeQIOyLpO2MqO2WiOyKteuLiOuLpC4nKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlc2V0Q2xhc3NEZWZpbml0aW9ucygpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0ZS5jbGFzc05hbWVzLmNsZWFyKCk7XG4gICAgdGhpcy5fc3RhdGUuc2VsZWN0Q2xhc3NGaWxlKG51bGwpO1xuICAgIHRoaXMucmVuZGVyQ2xhc3NTZWxlY3Rpb25CdXR0b25zKFtdKTtcbiAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLnVwZGF0ZUxhYmVscygpO1xuICAgIGNvbnN0IGJveGVzID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCk7XG4gICAgdGhpcy51cGRhdGVMYWJlbEZpbHRlcnMoYm94ZXMpO1xuICAgIHRoaXMudXBkYXRlU2VsZWN0QnlDbGFzc0Ryb3Bkb3duKGJveGVzKTtcbiAgICB0aGlzLnVwZGF0ZUxhYmVsTGlzdCgpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xhc3NGaWxlU2VsZWN0LnZhbHVlID0gJyc7XG4gIH1cblxuICBwdWJsaWMgcHJvbXB0Rm9yTGFiZWxDbGFzcyhsYWJlbElkczogc3RyaW5nW10sIGRlZmF1bHRDbGFzc0lkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKCFsYWJlbElkcyB8fCBsYWJlbElkcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIHRoaXMucGVuZGluZ0xhYmVsSWRzID0gWy4uLmxhYmVsSWRzXTtcblxuICAgIGxldCBpbml0aWFsQ2xhc3MgPSBkZWZhdWx0Q2xhc3NJZDtcbiAgICBpZiAoaW5pdGlhbENsYXNzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGZpcnN0SWQgPSBsYWJlbElkc1swXTtcbiAgICAgIGNvbnN0IGJib3ggPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKS5maW5kKGIgPT4gYi5pZCA9PT0gZmlyc3RJZCk7XG4gICAgICBpZiAoYmJveCkge1xuICAgICAgICBpbml0aWFsQ2xhc3MgPSBiYm94LmNsYXNzSWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGluaXRpYWxDbGFzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmVsZW1lbnRzLmxhYmVsQ2xhc3NJbnB1dC52YWx1ZSA9IFN0cmluZyhpbml0aWFsQ2xhc3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsZW1lbnRzLmxhYmVsQ2xhc3NJbnB1dC52YWx1ZSA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudHMubGFiZWxDbGFzc01vZGFsLnNob3coKTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5lbGVtZW50cy5sYWJlbENsYXNzSW5wdXQuZm9jdXMoKTtcbiAgICB9IGNhdGNoIHt9XG4gIH1cblxuICBwcml2YXRlIGFwcGx5Q2xhc3NUb1BlbmRpbmdMYWJlbHMoY2xhc3NJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKE51bWJlci5pc05hTihjbGFzc0lkKSB8fCBjbGFzc0lkIDwgMCkge1xuICAgICAgc2hvd0Vycm9yVG9hc3QoJ+ycoO2aqO2VnCDtgbTrnpjsiqQgSUTrpbwg7J6F66Cl7ZWY7IS47JqULicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5wZW5kaW5nTGFiZWxJZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29sb3IgPSBnZXRDb2xvckZvckNsYXNzKGNsYXNzSWQpO1xuXG4gICAgdGhpcy5wZW5kaW5nTGFiZWxJZHMuZm9yRWFjaChpZCA9PiB7XG4gICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLnVwZGF0ZUJvdW5kaW5nQm94KGlkLCB7XG4gICAgICAgIGNsYXNzSWQsXG4gICAgICAgIGNvbG9yXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIudXBkYXRlTGFiZWxzKCk7XG4gICAgY29uc3QgYm94ZXMgPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKTtcbiAgICB0aGlzLnVwZGF0ZUxhYmVsRmlsdGVycyhib3hlcyk7XG4gICAgdGhpcy51cGRhdGVTZWxlY3RCeUNsYXNzRHJvcGRvd24oYm94ZXMpO1xuICAgIHRoaXMudXBkYXRlTGFiZWxMaXN0KCk7XG5cbiAgICB0aGlzLnBlbmRpbmdMYWJlbElkcyA9IFtdO1xuICAgIHRoaXMuZWxlbWVudHMubGFiZWxDbGFzc0lucHV0LnZhbHVlID0gJyc7XG4gICAgdGhpcy5lbGVtZW50cy5sYWJlbENsYXNzTW9kYWwuaGlkZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVDb250ZXh0TWVudUVkaXQoKTogdm9pZCB7XG4gICAgdGhpcy5oaWRlQ29udGV4dE1lbnUoKTtcblxuICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci5nZXRTZWxlY3RlZEJvdW5kaW5nQm94ZXMoKTtcbiAgICBjb25zdCB0YXJnZXRCb3hlczogQm91bmRpbmdCb3hbXSA9IHNlbGVjdGVkLmxlbmd0aCA+IDBcbiAgICAgID8gc2VsZWN0ZWRcbiAgICAgIDogKHRoaXMuY3VycmVudENvbnRleHQ/LnNlbGVjdGVkT2JqZWN0cyB8fCBbXSlcbiAgICAgICAgICAubWFwKChvYmo6IGFueSkgPT4gb2JqLmJvdW5kaW5nQm94KVxuICAgICAgICAgIC5maWx0ZXIoKGJib3g6IEJvdW5kaW5nQm94IHwgdW5kZWZpbmVkKTogYmJveCBpcyBCb3VuZGluZ0JveCA9PiAhIWJib3gpO1xuXG4gICAgaWYgKCF0YXJnZXRCb3hlcy5sZW5ndGgpIHtcbiAgICAgIHNob3dFcnJvclRvYXN0KCfrqLzsoIAg652867Ko7J2EIOyEoO2Dne2VmOyEuOyalC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpZHMgPSB0YXJnZXRCb3hlcy5tYXAoYiA9PiBiLmlkKTtcbiAgICB0aGlzLnByb21wdEZvckxhYmVsQ2xhc3MoaWRzLCB0YXJnZXRCb3hlc1swXT8uY2xhc3NJZCk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUNvbnRleHRNZW51RGVsZXRlKCk6IHZvaWQge1xuICAgIHRoaXMuaGlkZUNvbnRleHRNZW51KCk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZGVsZXRlU2VsZWN0ZWQoKTtcblxuICAgIGlmIChkZWxldGVkLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmN1cnJlbnRDb250ZXh0Py5zZWxlY3RlZE9iamVjdHM/Lmxlbmd0aCkge1xuICAgICAgdGhpcy5jdXJyZW50Q29udGV4dC5zZWxlY3RlZE9iamVjdHMuZm9yRWFjaCgob2JqOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgYmJveElkID0gb2JqPy5ib3VuZGluZ0JveD8uaWQ7XG4gICAgICAgIGlmIChiYm94SWQpIHtcbiAgICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLnJlbW92ZUJvdW5kaW5nQm94KGJib3hJZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJQZW5kaW5nTGFiZWxBc3NpZ25tZW50KCk6IHZvaWQge1xuICAgIHRoaXMucGVuZGluZ0xhYmVsSWRzID0gW107XG4gICAgdGhpcy5lbGVtZW50cy5sYWJlbENsYXNzSW5wdXQudmFsdWUgPSAnJztcbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFN0YXR1cyBVcGRhdGVzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB1cGRhdGVMYWJlbEZvbGRlckJ1dHRvbihzZWxlY3RlZDogYm9vbGVhbiwgZm9sZGVyTmFtZT86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5lbGVtZW50cy5zZWxlY3RMYWJlbEZvbGRlckJ0bjtcclxuICAgIGlmIChzZWxlY3RlZCAmJiBmb2xkZXJOYW1lKSB7XHJcbiAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IGDwn5OBICR7Zm9sZGVyTmFtZX1gO1xyXG4gICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuLXN1Y2Nlc3MnKTtcclxuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1vdXRsaW5lLXByaW1hcnknKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdTZWxlY3QgTGFiZWwgRm9sZGVyJztcclxuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1zdWNjZXNzJyk7XHJcbiAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tb3V0bGluZS1wcmltYXJ5Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVNb2RlQnV0dG9ucyhtb2RlOiBNb2RlKTogdm9pZCB7XHJcbiAgICBjb25zdCBkcmF3QnRuID0gdGhpcy5lbGVtZW50cy5kcmF3TW9kZUJ0bjtcclxuICAgIGNvbnN0IGVkaXRCdG4gPSB0aGlzLmVsZW1lbnRzLmVkaXRNb2RlQnRuO1xyXG5cclxuICAgIGRyYXdCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgbW9kZSA9PT0gJ2RyYXcnKTtcclxuICAgIGVkaXRCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgbW9kZSA9PT0gJ2VkaXQnKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbW9kZTpjaGFuZ2VkJywgeyBtb2RlIH0pO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlWm9vbURpc3BsYXkoKTogdm9pZCB7XHJcbiAgICBjb25zdCB6b29tID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci5nZXRab29tKCk7XHJcbiAgICB0aGlzLmVsZW1lbnRzLnpvb21JbnB1dC52YWx1ZSA9IE1hdGgucm91bmQoem9vbSAqIDEwMCkudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZU1vdXNlQ29vcmRzKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZW1lbnRzLm1vdXNlQ29vcmRzRGlzcGxheS50ZXh0Q29udGVudCA9IGAoJHtNYXRoLnJvdW5kKHgpfSwgJHtNYXRoLnJvdW5kKHkpfSlgO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlQ3VycmVudEltYWdlRGlzcGxheShpbWFnZU5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jdXJyZW50SW1hZ2VOYW1lU3Bhbi50ZXh0Q29udGVudCA9IGltYWdlTmFtZTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDb250ZXh0IE1lbnVcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHNob3dDb250ZXh0TWVudUF0KHBvc2l0aW9uOiBQb2ludCwgY29udGV4dD86IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHRNZW51ID0gdGhpcy5lbGVtZW50cy5jb250ZXh0TWVudTtcbiAgICBjb250ZXh0TWVudS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBjb250ZXh0TWVudS5zdHlsZS5sZWZ0ID0gYCR7cG9zaXRpb24ueH1weGA7XG4gICAgY29udGV4dE1lbnUuc3R5bGUudG9wID0gYCR7cG9zaXRpb24ueX1weGA7XG4gICAgdGhpcy5jdXJyZW50Q29udGV4dCA9IGNvbnRleHQ7XG5cbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnY29udGV4dC1tZW51OnNob3cnLCB7IHBvc2l0aW9uLCBjb250ZXh0IH0pO1xuICB9XG5cbiAgaGlkZUNvbnRleHRNZW51KCk6IHZvaWQge1xuICAgIHRoaXMuZWxlbWVudHMuY29udGV4dE1lbnUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLmN1cnJlbnRDb250ZXh0ID0gbnVsbDtcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnY29udGV4dC1tZW51OmhpZGUnKTtcbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIE1vZGFsIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHNob3dDbGFzc0VkaXRvcigpOiB2b2lkIHtcclxuICAgIHRoaXMuZWxlbWVudHMuY2xhc3NGaWxlVmlld2VyTW9kYWwuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgaGlkZUNsYXNzRWRpdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jbGFzc0ZpbGVWaWV3ZXJNb2RhbC5oaWRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVXRpbGl0eSBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBnZXREaXNwbGF5TmFtZUZvckNsYXNzKGxhYmVsQ2xhc3M6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuY2xhc3NOYW1lcy5nZXQobGFiZWxDbGFzcykgfHwgYENsYXNzICR7bGFiZWxDbGFzc31gO1xyXG4gIH1cclxuXHJcbiAgZ2V0RE9NRWxlbWVudHMoKTogRE9NRWxlbWVudHMge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHM7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdGUgR2V0dGVyc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZ2V0VUlTdGF0ZSgpOiBVSVN0YXRlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzSW1hZ2VMaXN0VmlzaWJsZTogdGhpcy5lbGVtZW50cy5pbWFnZUxpc3Quc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnLFxyXG4gICAgICBpc0xhYmVsTGlzdFZpc2libGU6IHRoaXMuZWxlbWVudHMubGFiZWxMaXN0LnN0eWxlLmRpc3BsYXkgIT09ICdub25lJyxcclxuICAgICAgaXNQcmV2aWV3QmFyVmlzaWJsZTogdGhpcy5lbGVtZW50cy5wcmV2aWV3QmFyLnN0eWxlLmRpc3BsYXkgIT09ICdub25lJyxcclxuICAgICAgaXNMZWZ0UGFuZWxDb2xsYXBzZWQ6IHRoaXMuZWxlbWVudHMubGVmdFBhbmVsLnN0eWxlLmRpc3BsYXkgPT09ICdub25lJyxcclxuICAgICAgaXNSaWdodFBhbmVsQ29sbGFwc2VkOiB0aGlzLmVsZW1lbnRzLnJpZ2h0UGFuZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnLFxyXG4gICAgICBhY3RpdmVGaWx0ZXJzOiBuZXcgU2V0KHRoaXMuZmlsdGVyQnV0dG9ucy5maWx0ZXIoYnRuID0+IGJ0bi5pc0FjdGl2ZSkubWFwKGJ0biA9PiBidG4ubGFiZWxDbGFzcykpLFxyXG4gICAgICBzZWxlY3RlZExhYmVsczogbmV3IFNldCgpIC8vIFRPRE86IGltcGxlbWVudCBzZWxlY3Rpb24gdHJhY2tpbmdcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBnZXRTZWFyY2hPcHRpb25zKCk6IFNlYXJjaE9wdGlvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2VhcmNoVGVybTogdGhpcy5lbGVtZW50cy5pbWFnZVNlYXJjaElucHV0LnZhbHVlLFxyXG4gICAgICBzaG93TGFiZWxlZDogdGhpcy5lbGVtZW50cy5zaG93TGFiZWxlZENoZWNrYm94LmNoZWNrZWQsXHJcbiAgICAgIHNob3dVbmxhYmVsZWQ6IHRoaXMuZWxlbWVudHMuc2hvd1VubGFiZWxlZENoZWNrYm94LmNoZWNrZWQsXHJcbiAgICAgIHNvcnRPcmRlcjogJ25hbWUnLCAvLyBUT0RPOiBpbXBsZW1lbnQgZHluYW1pYyBzb3J0aW5nXHJcbiAgICAgIHNvcnREaXJlY3Rpb246ICdhc2MnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0RmlsdGVyT3B0aW9ucygpOiBGaWx0ZXJPcHRpb25zIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFjdGl2ZUNsYXNzZXM6IG5ldyBTZXQodGhpcy5maWx0ZXJCdXR0b25zLmZpbHRlcihidG4gPT4gYnRuLmlzQWN0aXZlKS5tYXAoYnRuID0+IGJ0bi5sYWJlbENsYXNzKSksXHJcbiAgICAgIHNob3dBbGw6IHRoaXMuZmlsdGVyQnV0dG9ucy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGhpZGVFbXB0eTogZmFsc2UgLy8gVE9ETzogaW1wbGVtZW50IGhpZGUgZW1wdHkgb3B0aW9uXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBFdmVudCBMaXN0ZW5lciBTZXR1cFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cclxuICBwcml2YXRlIHNldHVwRXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgY29uc3QgbGFiZWxDbGFzc01vZGFsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFiZWxDbGFzc01vZGFsJyk7XG4gICAgaWYgKGxhYmVsQ2xhc3NNb2RhbEVsKSB7XG4gICAgICBsYWJlbENsYXNzTW9kYWxFbC5hZGRFdmVudExpc3RlbmVyKCdoaWRkZW4uYnMubW9kYWwnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xlYXJQZW5kaW5nTGFiZWxBc3NpZ25tZW50KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTeW5jIFVJIHdoZW4gbW9kZSBjaGFuZ2VzIHByb2dyYW1tYXRpY2FsbHkgKGUuZy4sIHJpZ2h0LWNsaWNrIHRvZ2dsZSlcbiAgICB0cnkge1xuICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkuYWRkRXZlbnRMaXN0ZW5lcignbW9kZTpjaGFuZ2VkJywgKGV2dDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBldnQ/LmRhdGE/LmN1cnJlbnQ7XG4gICAgICAgIHRoaXMuc3luY01vZGVVSShjdXJyZW50KTtcbiAgICAgIH0pO1xuICAgICAgLy8gSW5pdGlhbGl6ZSBvbmNlXG4gICAgICB0aGlzLnN5bmNNb2RlVUkoKHRoaXMuX3N0YXRlIGFzIGFueSkuY3VycmVudE1vZGUpO1xuICAgIH0gY2F0Y2gge31cbiAgICAvLyBVcGRhdGUgY29vcmQgaW5wdXRzIHdpdGggaW1hZ2UgcG9pbnRlciBwb3NpdGlvblxuICAgIHRyeSB7XG4gICAgICAodGhpcy5fY2FudmFzQ29udHJvbGxlciBhcyBhbnkpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlOm1vdmUnLCAoZXZ0OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gZXZ0Py5kYXRhPy5pbWFnZTtcbiAgICAgICAgaWYgKGltZyAmJiBOdW1iZXIuaXNGaW5pdGUoaW1nLngpICYmIE51bWJlci5pc0Zpbml0ZShpbWcueSkpIHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnRzLmNvb3JkWElucHV0LnZhbHVlID0gU3RyaW5nKE1hdGgucm91bmQoaW1nLngpKTtcbiAgICAgICAgICB0aGlzLmVsZW1lbnRzLmNvb3JkWUlucHV0LnZhbHVlID0gU3RyaW5nKE1hdGgucm91bmQoaW1nLnkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICAgIC8vIEZvbGRlciBzZWxlY3Rpb25cbiAgICB0aGlzLmVsZW1lbnRzLnNlbGVjdEltYWdlRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RJbWFnZUZvbGRlcj8uKCk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRJbWFnZUZvbGRlcihyZXN1bHQuZGF0YSk7XG5cbiAgICAgICAgICAvLyBBdXRvLWRldGVjdCBvciBjcmVhdGUgbGFiZWwgZm9sZGVyIGluc2lkZSB0aGUgc2VsZWN0ZWQgaW1hZ2UgZm9sZGVyXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRm9sZGVySGFuZGxlID0gcmVzdWx0LmRhdGEgYXMgYW55O1xuICAgICAgICAgICAgbGV0IGxhYmVsSGFuZGxlOiBhbnkgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgIC8vIFRyeSBjb21tb24gbmFtZXMgZmlyc3Q6ICdsYWJlbHMnLCB0aGVuICdsYWJlbCdcbiAgICAgICAgICAgIHRyeSB7IGxhYmVsSGFuZGxlID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUuZ2V0RGlyZWN0b3J5SGFuZGxlKCdsYWJlbHMnKTsgfSBjYXRjaCB7fVxuICAgICAgICAgICAgaWYgKCFsYWJlbEhhbmRsZSkgeyB0cnkgeyBsYWJlbEhhbmRsZSA9IGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLmdldERpcmVjdG9yeUhhbmRsZSgnbGFiZWwnKTsgfSBjYXRjaCB7fSB9XG5cbiAgICAgICAgICAgIGlmICghbGFiZWxIYW5kbGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgY3JlYXRlID0gd2luZG93LmNvbmZpcm0oJ05vIGxhYmVsIGZvbGRlciBmb3VuZCBpbnNpZGUgdGhlIHNlbGVjdGVkIGltYWdlIGZvbGRlci5cXG5DcmVhdGUgYSBuZXcgXCJsYWJlbHNcIiBmb2xkZXI/Jyk7XG4gICAgICAgICAgICAgIGlmIChjcmVhdGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWFnZUZvbGRlckhhbmRsZS5yZXF1ZXN0UGVybWlzc2lvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJtID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUucmVxdWVzdFBlcm1pc3Npb24oeyBtb2RlOiAncmVhZHdyaXRlJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcm0gIT09ICdncmFudGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLnJlcXVlc3RQZXJtaXNzaW9uKHsgbW9kZTogJ3JlYWR3cml0ZScgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGxhYmVsSGFuZGxlID0gYXdhaXQgaW1hZ2VGb2xkZXJIYW5kbGUuZ2V0RGlyZWN0b3J5SGFuZGxlKCdsYWJlbHMnLCB7IGNyZWF0ZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgbGFiZWxzIGZvbGRlcicsIGVycik7XG4gICAgICAgICAgICAgICAgICBzaG93RXJyb3JUb2FzdCgnUGVybWlzc2lvbiBibG9ja2VkLiBVc2UgXCJMb2FkIExhYmVsIEZvbGRlclwiIHRvIHBpY2sgYSBmb2xkZXIuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbEhhbmRsZSkge1xuICAgICAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRMYWJlbEZvbGRlcihsYWJlbEhhbmRsZSk7XG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxGb2xkZXJCdXR0b24odHJ1ZSwgbGFiZWxIYW5kbGUubmFtZSk7XG4gICAgICAgICAgICAgIHNob3dTdWNjZXNzVG9hc3QoYExhYmVsIGZvbGRlciByZWFkeTogJHtsYWJlbEhhbmRsZS5uYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTGFiZWwgZm9sZGVyIGRldGVjdGlvbi9jcmVhdGlvbiBza2lwcGVkOicsIGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExpc3QgaW1hZ2VzIGFmdGVyIGxhYmVsIGZvbGRlciBoYW5kbGluZ1xuICAgICAgICAgIGNvbnN0IGxpc3RSZXMgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLmxpc3RJbWFnZUZpbGVzPy4ocmVzdWx0LmRhdGEpO1xuICAgICAgICAgIGlmIChsaXN0UmVzPy5zdWNjZXNzICYmIEFycmF5LmlzQXJyYXkobGlzdFJlcy5kYXRhKSkge1xuICAgICAgICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkuaW1hZ2VGaWxlcyA9IGxpc3RSZXMuZGF0YTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVySW1hZ2VMaXN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZWxlY3QgaW1hZ2UgZm9sZGVyJywgZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnNlbGVjdExhYmVsRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RMYWJlbEZvbGRlcj8uKCk7XG4gICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICB0aGlzLl9zdGF0ZS5zZXRMYWJlbEZvbGRlcihyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgdGhpcy51cGRhdGVMYWJlbEZvbGRlckJ1dHRvbih0cnVlLCByZXN1bHQuZGF0YS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VsZWN0IGxhYmVsIGZvbGRlcicsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5sb2FkQ2xhc3NJbmZvRm9sZGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zZWxlY3RDbGFzc0luZm9Gb2xkZXI/LigpO1xuICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgdGhpcy5fc3RhdGUuc2V0Q2xhc3NJbmZvRm9sZGVyKHJlc3VsdC5kYXRhKTtcblxuICAgICAgICAgIGNvbnN0IGxpc3RSZXMgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLmxpc3RDbGFzc0ZpbGVzPy4ocmVzdWx0LmRhdGEpO1xuICAgICAgICAgIGlmIChsaXN0UmVzPy5zdWNjZXNzICYmIEFycmF5LmlzQXJyYXkobGlzdFJlcy5kYXRhKSkge1xuICAgICAgICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkuY2xhc3NGaWxlcyA9IGxpc3RSZXMuZGF0YTtcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVDbGFzc0ZpbGVEcm9wZG93bihsaXN0UmVzLmRhdGEpO1xuXG4gICAgICAgICAgICBpZiAobGlzdFJlcy5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5sb2FkQ2xhc3NGaWxlQnlOYW1lKGxpc3RSZXMuZGF0YVswXSEubmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnJlc2V0Q2xhc3NEZWZpbml0aW9ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VsZWN0IGNsYXNzIGluZm8gZm9sZGVyJywgZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmNsYXNzRmlsZVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZWxlbWVudHMuY2xhc3NGaWxlU2VsZWN0LnZhbHVlO1xuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICB0aGlzLnJlc2V0Q2xhc3NEZWZpbml0aW9ucygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmxvYWRDbGFzc0ZpbGVCeU5hbWUodmFsdWUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5zYXZlTGFiZWxDbGFzc0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzSWQgPSBOdW1iZXIodGhpcy5lbGVtZW50cy5sYWJlbENsYXNzSW5wdXQudmFsdWUpO1xuICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoY2xhc3NJZCkpIHtcbiAgICAgICAgc2hvd0Vycm9yVG9hc3QoJ+ycoO2aqO2VnCDtgbTrnpjsiqQgSUTrpbwg7J6F66Cl7ZWY7IS47JqULicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmFwcGx5Q2xhc3NUb1BlbmRpbmdMYWJlbHMoY2xhc3NJZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxhYmVsQ2xhc3NJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudHMuc2F2ZUxhYmVsQ2xhc3NCdG4uY2xpY2soKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFpvb20gY29udHJvbHNcbiAgICB0aGlzLmVsZW1lbnRzLnpvb21JbkJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuem9vbUluKCkpO1xuICAgIHRoaXMuZWxlbWVudHMuem9vbU91dEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuem9vbU91dCgpKTtcbiAgICB0aGlzLmVsZW1lbnRzLnJlc2V0Wm9vbUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIucmVzZXRab29tKCkpO1xuXG4gICAgLy8gTW9kZSBzd2l0Y2hpbmdcbiAgICB0aGlzLmVsZW1lbnRzLmRyYXdNb2RlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5fc3RhdGUuc2V0TW9kZSgnZHJhdycpKTtcbiAgICB0aGlzLmVsZW1lbnRzLmVkaXRNb2RlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5fc3RhdGUuc2V0TW9kZSgnZWRpdCcpKTtcblxuICAgIC8vIENhbnZhcyBkaXNwbGF5IG9wdGlvbnNcbiAgICB0aGlzLmVsZW1lbnRzLnNob3dMYWJlbHNPbkNhbnZhc1RvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9zdGF0ZS5zZXRTaG93TGFiZWxzKHRoaXMuZWxlbWVudHMuc2hvd0xhYmVsc09uQ2FudmFzVG9nZ2xlLmNoZWNrZWQpO1xuICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci51cGRhdGVMYWJlbHMoKTtcbiAgICB9KTtcbiAgICB0aGlzLmVsZW1lbnRzLmxhYmVsRm9udFNpemVTbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICBjb25zdCB2YWwgPSBOdW1iZXIodGhpcy5lbGVtZW50cy5sYWJlbEZvbnRTaXplU2xpZGVyLnZhbHVlKTtcbiAgICAgIHRoaXMuZWxlbWVudHMubGFiZWxGb250U2l6ZVZhbHVlLnRleHRDb250ZW50ID0gU3RyaW5nKHZhbCk7XG4gICAgICB0aGlzLl9zdGF0ZS5zZXRMYWJlbEZvbnRTaXplKHZhbCk7XG4gICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLnNldExhYmVsRm9udCh2YWwpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbWVudHMuYXV0b1NhdmVUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhdGUuc2V0QXV0b1NhdmUodGhpcy5lbGVtZW50cy5hdXRvU2F2ZVRvZ2dsZS5jaGVja2VkKTtcbiAgICB9KTtcbiAgICB0aGlzLmVsZW1lbnRzLmNyb3NzaGFpclRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9zdGF0ZS50b2dnbGVDcm9zc2hhaXIoKTtcbiAgICB9KTtcblxuICAgIC8vIFdpbmRvdyByZXNpemUgaGFuZGxlclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlc2l6ZVBhbmVscygpO1xuICAgIH0pO1xuXHJcbiAgICAvLyBQYW5lbCBjb2xsYXBzZS9leHBhbmQgYnV0dG9uc1xyXG4gICAgdGhpcy5lbGVtZW50cy5jb2xsYXBzZUxlZnRQYW5lbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5wYW5lbENvbmZpZ3MuZ2V0KCdsZWZ0JykhO1xyXG4gICAgICB0aGlzLnRvZ2dsZVBhbmVsKGNvbmZpZyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnRzLmNvbGxhcHNlUmlnaHRQYW5lbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5wYW5lbENvbmZpZ3MuZ2V0KCdyaWdodCcpITtcclxuICAgICAgdGhpcy50b2dnbGVQYW5lbChjb25maWcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50cy5leHBhbmRMZWZ0UGFuZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGFuZWxDb25maWdzLmdldCgnbGVmdCcpITtcclxuICAgICAgdGhpcy50b2dnbGVQYW5lbChjb25maWcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50cy5leHBhbmRSaWdodFBhbmVsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLnBhbmVsQ29uZmlncy5nZXQoJ3JpZ2h0JykhO1xyXG4gICAgICB0aGlzLnRvZ2dsZVBhbmVsKGNvbmZpZyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaGVtZSB0b2dnbGVcbiAgICB0aGlzLmVsZW1lbnRzLmRhcmtNb2RlVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMudG9nZ2xlRGFya01vZGUoKTtcbiAgICB9KTtcblxuICAgIC8vIFNhdmUgbGFiZWxzXG4gICAgdGhpcy5lbGVtZW50cy5zYXZlTGFiZWxzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zdGF0ZS5jdXJyZW50SW1hZ2VGaWxlIHx8ICEodGhpcy5fc3RhdGUgYXMgYW55KS5sYWJlbEZvbGRlckhhbmRsZSkge1xuICAgICAgICAgIHNob3dFcnJvclRvYXN0KCdTZWxlY3QgaW1hZ2UgYW5kIGxhYmVsIGZvbGRlcnMgZmlyc3QnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3hlcyA9IHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpO1xuICAgICAgICBjb25zdCB5b2xvTGFiZWxzID0gYm91bmRpbmdCb3hlcy5tYXAoYmJveCA9PlxuICAgICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuYm91bmRpbmdCb3hUb1lPTE8oYmJveCwge1xuICAgICAgICAgICAgd2lkdGg6ICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmN1cnJlbnRJbWFnZT8ud2lkdGggfHwgMSxcbiAgICAgICAgICAgIGhlaWdodDogKHRoaXMuX3N0YXRlIGFzIGFueSkuY3VycmVudEltYWdlPy5oZWlnaHQgfHwgMVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5zYXZlTGFiZWxzPy4oXG4gICAgICAgICAgdGhpcy5fc3RhdGUuY3VycmVudEltYWdlRmlsZS5uYW1lLFxuICAgICAgICAgIHlvbG9MYWJlbHMsXG4gICAgICAgICAgKHRoaXMuX3N0YXRlIGFzIGFueSkubGFiZWxGb2xkZXJIYW5kbGVcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHJlc3VsdD8uc3VjY2Vzcykge1xuICAgICAgICAgIHNob3dTdWNjZXNzVG9hc3QoJ0xhYmVscyBzYXZlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzaG93RXJyb3JUb2FzdChyZXN1bHQ/LmVycm9yIHx8ICdGYWlsZWQgdG8gc2F2ZSBsYWJlbHMnKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1NhdmUgbGFiZWxzIGZhaWxlZCcsIGUpO1xuICAgICAgICBzaG93RXJyb3JUb2FzdCgnRmFpbGVkIHRvIHNhdmUgbGFiZWxzJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBHbyB0byBjb29yZGluYXRlc1xuICAgIHRoaXMuZWxlbWVudHMuZ29Ub0Nvb3Jkc0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IHggPSBOdW1iZXIodGhpcy5lbGVtZW50cy5jb29yZFhJbnB1dC52YWx1ZSk7XG4gICAgICBjb25zdCB5ID0gTnVtYmVyKHRoaXMuZWxlbWVudHMuY29vcmRZSW5wdXQudmFsdWUpO1xuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh4KSAmJiBOdW1iZXIuaXNGaW5pdGUoeSkpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5nb1RvSW1hZ2VDb29yZGluYXRlcyh4LCB5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFpvb20gaW5wdXQgKHBlcmNlbnQpXG4gICAgdGhpcy5lbGVtZW50cy56b29tSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgY29uc3QgcGN0ID0gTnVtYmVyKHRoaXMuZWxlbWVudHMuem9vbUlucHV0LnZhbHVlKTtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUocGN0KSAmJiBwY3QgPiAwKSB7XG4gICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuc2V0Wm9vbVBlcmNlbnQocGN0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhpZGUgY29udGV4dCBtZW51IG9uIGRvY3VtZW50IGNsaWNrXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmVsZW1lbnRzLmNvbnRleHRNZW51LmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICAgIHRoaXMuaGlkZUNvbnRleHRNZW51KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmN0eEVkaXRMYWJlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuaGFuZGxlQ29udGV4dE1lbnVFZGl0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmN0eERlbGV0ZUxhYmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5oYW5kbGVDb250ZXh0TWVudURlbGV0ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gS2VlcCBtb2RlIGJ1dHRvbnMgaW4gc3luYyB3aXRoIEFwcFN0YXRlXG4gIHByaXZhdGUgc3luY01vZGVVSShjdXJyZW50TW9kZTogJ2RyYXcnIHwgJ2VkaXQnKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRyYXdJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcmF3TW9kZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xuICAgICAgY29uc3QgZWRpdElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkaXRNb2RlJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XG4gICAgICBjb25zdCBkcmF3TGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsYWJlbFtmb3I9XCJkcmF3TW9kZVwiXScpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgIGNvbnN0IGVkaXRMYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsW2Zvcj1cImVkaXRNb2RlXCJdJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gICAgICBjb25zdCBpc0RyYXcgPSBjdXJyZW50TW9kZSA9PT0gJ2RyYXcnO1xuICAgICAgaWYgKGRyYXdJbnB1dCkgZHJhd0lucHV0LmNoZWNrZWQgPSBpc0RyYXc7XG4gICAgICBpZiAoZWRpdElucHV0KSBlZGl0SW5wdXQuY2hlY2tlZCA9ICFpc0RyYXc7XG4gICAgICBpZiAoZHJhd0xhYmVsKSBkcmF3TGFiZWwuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgaXNEcmF3KTtcbiAgICAgIGlmIChlZGl0TGFiZWwpIGVkaXRMYWJlbC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCAhaXNEcmF3KTtcbiAgICB9IGNhdGNoIHt9XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBWYWxpZGF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YWxpZGF0ZVVJU3RhdGUoKTogYW55IHtcclxuICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIGVzc2VudGlhbCBlbGVtZW50cyBleGlzdFxyXG4gICAgaWYgKCF0aGlzLmVsZW1lbnRzLmNhbnZhc0NvbnRhaW5lcikge1xyXG4gICAgICBlcnJvcnMucHVzaCgnQ2FudmFzIGNvbnRhaW5lciBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudHMuaW1hZ2VMaXN0KSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbWFnZSBsaXN0IGNvbnRhaW5lciBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudHMubGFiZWxMaXN0KSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdMYWJlbCBsaXN0IGNvbnRhaW5lciBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgICBlcnJvcnMsXHJcbiAgICAgIHdhcm5pbmdzXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgdmFsaWRhdGVGb3JtRGF0YShmb3JtRGF0YTogRm9ybURhdGEpOiBhbnkge1xyXG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLy8gSW1wbGVtZW50IGZvcm0gdmFsaWRhdGlvbiBsb2dpYyBhcyBuZWVkZWRcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgICBlcnJvcnMsXHJcbiAgICAgIHdhcm5pbmdzXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEFkZGl0aW9uYWwgTWV0aG9kcyAoZm9yIGZ1dHVyZSBleHBhbnNpb24pXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBhZGRFZGl0RGVsZXRlTGlzdGVuZXJzKHJlY3RzOiBCb3VuZGluZ0JveFtdKTogdm9pZCB7XHJcbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBmb3IgYWRkaW5nIGVkaXQvZGVsZXRlIGV2ZW50IGxpc3RlbmVycyB0byBib3VuZGluZyBib3ggZWxlbWVudHNcclxuICAgIHJlY3RzLmZvckVhY2gocmVjdCA9PiB7XHJcbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGVkaXQvZGVsZXRlIG9wZXJhdGlvbnNcclxuICAgICAgLy8gVGhpcyB3b3VsZCB0eXBpY2FsbHkgYmUgaGFuZGxlZCBieSB0aGUgQ2FudmFzQ29udHJvbGxlclxyXG4gICAgfSk7XHJcbiAgfVxyXG59XG4iLCIvKipcclxuICogRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1haW4gRW50cnkgUG9pbnRcclxuICpcclxuICogUGhhc2UgOCBDb21wbGV0ZTogQXBwbGljYXRpb24gSW50ZWdyYXRpb24gJiBUZXN0aW5nXHJcbiAqIEFsbCBtb2R1bGVzIGludGVncmF0ZWQgd2l0aCBjb21wbGV0ZSBkZXBlbmRlbmN5IGluamVjdGlvbiBzeXN0ZW1cclxuICovXHJcblxyXG5pbXBvcnQgeyBjcmVhdGVBcHBTdGF0ZSB9IGZyb20gJy4vbW9kZWxzJztcclxuaW1wb3J0IHsgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIEZpbGVTeXN0ZW1TZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcyc7XHJcbmltcG9ydCB7IENhbnZhc0NvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL0NhbnZhc0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgeyBFdmVudE1hbmFnZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL0V2ZW50TWFuYWdlcic7XHJcbmltcG9ydCB7IFVJTWFuYWdlciB9IGZyb20gJy4vdWkvVUlNYW5hZ2VyJztcclxuaW1wb3J0IHsgc2hvd1N1Y2Nlc3NUb2FzdCwgc2hvd0Vycm9yVG9hc3QgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbi8qKlxyXG4gKiBNYWluIEFwcGxpY2F0aW9uIENsYXNzIC0gUGhhc2UgOCBDb21wbGV0ZSBJbnRlZ3JhdGlvblxyXG4gKlxyXG4gKiBUaGlzIGNsYXNzIHByb3ZpZGVzIGNvbXBsZXRlIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGFuZCBtb2R1bGUgY29vcmRpbmF0aW9uXHJcbiAqIGZvciB0aGUgVHlwZVNjcmlwdCB2ZXJzaW9uIG9mIEVhc3kgTGFiZWxpbmcuXHJcbiAqL1xyXG5jbGFzcyBBcHAge1xyXG4gIHByaXZhdGUgYXBwU3RhdGUgPSBjcmVhdGVBcHBTdGF0ZSgpO1xyXG4gIHByaXZhdGUgZmlsZVN5c3RlbVNlcnZpY2U6IEZpbGVTeXN0ZW1TZXJ2aWNlID0gY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UoKTtcclxuICBwcml2YXRlIHVpTWFuYWdlciE6IFVJTWFuYWdlcjtcclxuICBwcml2YXRlIGNhbnZhc0NvbnRyb2xsZXIhOiBDYW52YXNDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgZXZlbnRNYW5hZ2VyITogRXZlbnRNYW5hZ2VyO1xyXG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gIH1cblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemUgYWxsIGFwcGxpY2F0aW9uIGNvbXBvbmVudHMgd2l0aCBkZXBlbmRlbmN5IGluamVjdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIEluaXRpYWxpemluZyBkZXBlbmRlbmN5IGluamVjdGlvbiBzeXN0ZW1cblxyXG4gICAgICAvLyBJbml0aWFsaXplIENhbnZhcyBDb250cm9sbGVyIGZpcnN0XHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlciA9IG5ldyBDYW52YXNDb250cm9sbGVyKFxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGVcclxuICAgICAgKTtcclxuICAgICAgLy8gQ2FudmFzQ29udHJvbGxlciBpbml0aWFsaXplZFxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgVUkgTWFuYWdlciAobmVlZHMgQ2FudmFzQ29udHJvbGxlcilcbiAgICAgIHRoaXMudWlNYW5hZ2VyID0gbmV3IFVJTWFuYWdlcihcbiAgICAgICAgdGhpcy5hcHBTdGF0ZSxcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLFxuICAgICAgICB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlIGFzIGFueSAvLyBUeXBlIGNvbXBhdGliaWxpdHkgd2lsbCBiZSBmaXhlZCBpbiBmdXR1cmUgdXBkYXRlc1xuICAgICAgKTtcbiAgICAgIC8vIFVJTWFuYWdlciBpbml0aWFsaXplZFxuXG4gICAgICAvLyBJbml0aWFsaXplIEZhYnJpYyBjYW52YXMgaW4gdGhlIGV4aXN0aW5nIGNvbnRhaW5lciBmcm9tIHB1YmxpYy9pbmRleC5odG1sXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuaW5pdGlhbGl6ZUNhbnZhcygnY2FudmFzLWNvbnRhaW5lcicpO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBDYW52YXMgaW5pdGlhbGl6ZWQgaW4gI2NhbnZhcy1jb250YWluZXInKTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBFdmVudCBNYW5hZ2VyIChuZWVkcyBhbGwgb3RoZXIgY29tcG9uZW50cylcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcihcbiAgICAgICAgdGhpcy5hcHBTdGF0ZSxcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLFxuICAgICAgICB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlXG4gICAgICApO1xuICAgICAgLy8gRXZlbnRNYW5hZ2VyIGluaXRpYWxpemVkXG5cclxuICAgICAgLy8gU2V0dXAgY3Jvc3MtY29tcG9uZW50IHJlZmVyZW5jZXNcclxuICAgICAgdGhpcy5zZXR1cENyb3NzUmVmZXJlbmNlcygpO1xuXHJcbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycyBmb3IgYXBwbGljYXRpb24gbGlmZWN5Y2xlXHJcbiAgICAgIHRoaXMuc2V0dXBBcHBsaWNhdGlvbkV2ZW50cygpO1xuXHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAvLyBQaGFzZSA4IGFwcGxpY2F0aW9uIGludGVncmF0aW9uIGNvbXBsZXRlZFxuICAgICAgLy8gKHN1cHByZXNzIHN1Y2Nlc3MgdG9hc3QgYW5kIGludGVncmF0aW9uIHRlc3RzIGxvZ3Mgb24gZmlyc3QgbG9hZClcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign4p2MIEFwcGxpY2F0aW9uIGluaXRpYWxpemF0aW9uIGZhaWxlZDonLCBlcnJvcik7XHJcbiAgICAgIHNob3dFcnJvclRvYXN0KCfinYwgQXBwbGljYXRpb24gaW5pdGlhbGl6YXRpb24gZmFpbGVkJyk7XHJcbiAgICAgIHRocm93IGVycm9yO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXG4gICAqIFNldHVwIGNyb3NzLWNvbXBvbmVudCByZWZlcmVuY2VzIGZvciBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbiAgICovXG4gIHByaXZhdGUgc2V0dXBDcm9zc1JlZmVyZW5jZXMoKTogdm9pZCB7XG4gICAgY29uc3QgcmVmcmVzaExhYmVsUGFuZWxzID0gKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy51aU1hbmFnZXIudXBkYXRlTGFiZWxMaXN0KCk7XG4gICAgICAgIGNvbnN0IGJveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKTtcbiAgICAgICAgdGhpcy51aU1hbmFnZXIudXBkYXRlTGFiZWxGaWx0ZXJzKGJveGVzKTtcbiAgICAgICAgdGhpcy51aU1hbmFnZXIudXBkYXRlU2VsZWN0QnlDbGFzc0Ryb3Bkb3duKGJveGVzKTtcbiAgICAgICAgaWYgKHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZSkge1xuICAgICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0SW1hZ2VMYWJlbFN0YXR1cyhcbiAgICAgICAgICAgIHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZS5uYW1lLFxuICAgICAgICAgICAgYm94ZXMubGVuZ3RoID4gMFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZWZyZXNoIGxhYmVsIHBhbmVscycsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgcmVmcmVzaExhYmVsU2VsZWN0aW9uID0gKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy51aU1hbmFnZXIudXBkYXRlTGFiZWxMaXN0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc3luYyBsYWJlbCBzZWxlY3Rpb24nLCBlcnJvcik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdvYmplY3Q6YWRkZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgIHJlZnJlc2hMYWJlbFBhbmVscygpO1xuICAgICAgY29uc3QgYmJveCA9IGV2ZW50LmRhdGE/LmJvdW5kaW5nQm94O1xuICAgICAgaWYgKGJib3ggJiYgdGhpcy5hcHBTdGF0ZS5jdXJyZW50TW9kZSA9PT0gJ2RyYXcnKSB7XG4gICAgICAgIHRoaXMudWlNYW5hZ2VyLnByb21wdEZvckxhYmVsQ2xhc3MoW2Jib3guaWRdLCBiYm94LmNsYXNzSWQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdvYmplY3Q6cmVtb3ZlZCcsIHJlZnJlc2hMYWJlbFBhbmVscyk7XG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ29iamVjdDptb2RpZmllZCcsIHJlZnJlc2hMYWJlbFBhbmVscyk7XG5cbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0aW9uOmNyZWF0ZWQnLCByZWZyZXNoTGFiZWxTZWxlY3Rpb24pO1xuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3Rpb246dXBkYXRlZCcsIHJlZnJlc2hMYWJlbFNlbGVjdGlvbik7XG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdGlvbjpjbGVhcmVkJywgcmVmcmVzaExhYmVsU2VsZWN0aW9uKTtcblxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdhZnRlcjpyZW5kZXInLCAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVab29tRGlzcGxheSgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHVwZGF0ZSB6b29tIGRpc3BsYXknLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmV2ZW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZTpjb29yZGluYXRlcy11cGRhdGVkJywgKGV2dCkgPT4ge1xuICAgICAgY29uc3QgY29vcmRzID0gZXZ0LmRhdGE/LmNhbnZhcztcbiAgICAgIGlmIChjb29yZHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVNb3VzZUNvb3Jkcyhjb29yZHMueCwgY29vcmRzLnkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgbW91c2UgY29vcmRpbmF0ZXMgZGlzcGxheScsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5ldmVudE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcignbGFiZWxzOnNhdmVkJywgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2hvd1N1Y2Nlc3NUb2FzdCgnTGFiZWxzIHNhdmVkJyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2hvdyBzYXZlIHRvYXN0JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5ldmVudE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dC1tZW51OnNob3cnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBldmVudC5kYXRhPy5jb250ZXh0O1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBjb250ZXh0Py5wb3NpdGlvbiB8fCBldmVudC5kYXRhPy5wb3NpdGlvbjtcbiAgICAgIGlmIChjb250ZXh0ICYmIHBvc2l0aW9uKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRDb250ZXh0VGFyZ2V0KGNvbnRleHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgY29udGV4dCB0YXJnZXQnLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnVpTWFuYWdlci5zaG93Q29udGV4dE1lbnVBdChwb3NpdGlvbiwgY29udGV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNob3cgY29udGV4dCBtZW51JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmV2ZW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0LW1lbnU6aGlkZScsICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMudWlNYW5hZ2VyLmhpZGVDb250ZXh0TWVudSgpO1xuICAgICAgICB0aGlzLmFwcFN0YXRlLnNldENvbnRleHRUYXJnZXQobnVsbCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaGlkZSBjb250ZXh0IG1lbnUnLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygn8J+UlyBDcm9zcy1yZWZlcmVuY2VzIGVzdGFibGlzaGVkIGJldHdlZW4gY29tcG9uZW50cycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHVwIGFwcGxpY2F0aW9uLWxldmVsIGV2ZW50IGxpc3RlbmVyc1xuICAgKi9cbiAgcHJpdmF0ZSBzZXR1cEFwcGxpY2F0aW9uRXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuYXBwU3RhdGUuYWRkRXZlbnRMaXN0ZW5lcignbW9kZTpjaGFuZ2VkJywgKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50TW9kZSA9IGV2ZW50LmRhdGE/LmN1cnJlbnQ7XG4gICAgICBpZiAoY3VycmVudE1vZGUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVNb2RlQnV0dG9ucyhjdXJyZW50TW9kZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHVwZGF0ZSBtb2RlIGJ1dHRvbnMnLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYXBwU3RhdGUuYWRkRXZlbnRMaXN0ZW5lcignaW1hZ2U6Y3VycmVudC1jaGFuZ2VkJywgKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50SW1hZ2VOYW1lID0gZXZlbnQuZGF0YT8uY3VycmVudCB8fCAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMudWlNYW5hZ2VyLnJlbmRlckltYWdlTGlzdCgpO1xuICAgICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVDdXJyZW50SW1hZ2VEaXNwbGF5KGN1cnJlbnRJbWFnZU5hbWUpO1xuICAgICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVMYWJlbExpc3QoKTtcbiAgICAgICAgY29uc3QgYm94ZXMgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuZ2V0QWxsQm91bmRpbmdCb3hlcygpO1xuICAgICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVMYWJlbEZpbHRlcnMoYm94ZXMpO1xuICAgICAgICB0aGlzLnVpTWFuYWdlci51cGRhdGVTZWxlY3RCeUNsYXNzRHJvcGRvd24oYm94ZXMpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGhhbmRsZSBpbWFnZSBjaGFuZ2UgZXZlbnQnLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFwcFN0YXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2ltYWdlOmxhYmVsLXN0YXR1cy1jaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy51aU1hbmFnZXIucmVuZGVySW1hZ2VMaXN0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVmcmVzaCBpbWFnZSBsaXN0IGFmdGVyIGxhYmVsIHN0YXR1cyBjaGFuZ2UnLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBMaXN0ZW4gdG8gYXBwbGljYXRpb24gc3RhdGUgY2hhbmdlc1xuICAgIC8vIEhhbmRsZSBicm93c2VyIGVycm9yc1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcign8J+aqCBBcHBsaWNhdGlvbiBlcnJvcjonLCBldmVudC5lcnJvcik7XG4gICAgICBzaG93RXJyb3JUb2FzdCgnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcpO1xuICAgIH0pO1xuXHJcbiAgICAvLyBIYW5kbGUgdW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uc1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn5qoIFVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbjonLCBldmVudC5yZWFzb24pO1xyXG4gICAgICBzaG93RXJyb3JUb2FzdCgnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtIGNvbXByZWhlbnNpdmUgZnVuY3Rpb25hbGl0eSB0ZXN0aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwZXJmb3JtRnVuY3Rpb25hbGl0eVRlc3RzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc29sZS5sb2coJ1xcbvCfp6ogUGVyZm9ybWluZyBQaGFzZSA4IEludGVncmF0aW9uIFRlc3RzOicpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFRlc3QgMTogQ29tcG9uZW50IGluaXRpYWxpemF0aW9uXHJcbiAgICAgIGNvbnN0IGNvbXBvbmVudHNUZXN0ID0gdGhpcy50ZXN0Q29tcG9uZW50SW5pdGlhbGl6YXRpb24oKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBDb21wb25lbnQgaW5pdGlhbGl6YXRpb24gdGVzdDonLCBjb21wb25lbnRzVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCAyOiBFdmVudCBzeXN0ZW0gaW50ZWdyYXRpb25cclxuICAgICAgY29uc3QgZXZlbnRzVGVzdCA9IHRoaXMudGVzdEV2ZW50U3lzdGVtSW50ZWdyYXRpb24oKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBFdmVudCBzeXN0ZW0gaW50ZWdyYXRpb24gdGVzdDonLCBldmVudHNUZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICAvLyBUZXN0IDM6IFVJIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgY29uc3QgdWlUZXN0ID0gYXdhaXQgdGhpcy50ZXN0VUlGdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgVUkgZnVuY3Rpb25hbGl0eSB0ZXN0OicsIHVpVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCA0OiBDYW52YXMgZnVuY3Rpb25hbGl0eVxyXG4gICAgICBjb25zdCBjYW52YXNUZXN0ID0gdGhpcy50ZXN0Q2FudmFzRnVuY3Rpb25hbGl0eSgpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIENhbnZhcyBmdW5jdGlvbmFsaXR5IHRlc3Q6JywgY2FudmFzVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCA1OiBGaWxlIHN5c3RlbSBpbnRlZ3JhdGlvblxyXG4gICAgICBjb25zdCBmaWxlU3lzdGVtVGVzdCA9IHRoaXMudGVzdEZpbGVTeXN0ZW1JbnRlZ3JhdGlvbigpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIEZpbGUgc3lzdGVtIGludGVncmF0aW9uIHRlc3Q6JywgZmlsZVN5c3RlbVRlc3QgPyAnUEFTU0VEJyA6ICdGQUlMRUQnKTtcclxuXHJcbiAgICAgIC8vIFRlc3QgNjogS2V5Ym9hcmQgc2hvcnRjdXRzXHJcbiAgICAgIGNvbnN0IGtleWJvYXJkVGVzdCA9IHRoaXMudGVzdEtleWJvYXJkU2hvcnRjdXRzKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgS2V5Ym9hcmQgc2hvcnRjdXRzIHRlc3Q6Jywga2V5Ym9hcmRUZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZygn8J+OryBBbGwgUGhhc2UgOCBpbnRlZ3JhdGlvbiB0ZXN0cyBjb21wbGV0ZWQhJyk7XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign4p2MIEludGVncmF0aW9uIHRlc3RzIGZhaWxlZDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IGNvbXBvbmVudCBpbml0aWFsaXphdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgdGVzdENvbXBvbmVudEluaXRpYWxpemF0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhKFxyXG4gICAgICB0aGlzLmFwcFN0YXRlICYmXHJcbiAgICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgJiZcclxuICAgICAgdGhpcy51aU1hbmFnZXIgJiZcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyICYmXHJcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyICYmXHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWRcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IGV2ZW50IHN5c3RlbSBpbnRlZ3JhdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgdGVzdEV2ZW50U3lzdGVtSW50ZWdyYXRpb24oKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRlc3Qgc3RhdGUgZXZlbnQgd2l0aG91dCBhbHRlcmluZyBmaW5hbCBtb2RlXG4gICAgICBjb25zdCBwcmV2TW9kZSA9IHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGUgYXMgJ2RyYXcnIHwgJ2VkaXQnO1xuICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKCdlZGl0Jyk7XG4gICAgICB0aGlzLmFwcFN0YXRlLnNldE1vZGUoJ2RyYXcnKTtcbiAgICAgIC8vIHJlc3RvcmUgcHJldmlvdXMgbW9kZVxuICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKHByZXZNb2RlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFdmVudCBzeXN0ZW0gdGVzdCBlcnJvcjonLCBlcnJvcik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cclxuICAvKipcclxuICAgKiBUZXN0IFVJIGZ1bmN0aW9uYWxpdHlcclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHRlc3RVSUZ1bmN0aW9uYWxpdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUZXN0IFVJIHVwZGF0ZSBtZXRob2RzXHJcbiAgICAgIHRoaXMudWlNYW5hZ2VyLnVwZGF0ZUxhYmVsTGlzdCgpO1xyXG4gICAgICAvLyBBZGQgb3RoZXIgVUkgdXBkYXRlIHRlc3RzIGFzIG1ldGhvZHMgYmVjb21lIGF2YWlsYWJsZVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1VJIGZ1bmN0aW9uYWxpdHkgdGVzdCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgY2FudmFzIGZ1bmN0aW9uYWxpdHlcclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RDYW52YXNGdW5jdGlvbmFsaXR5KCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gVGVzdCBjYW52YXMgbWV0aG9kc1xyXG4gICAgICBjb25zdCBjYW52YXMgPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzO1xyXG4gICAgICBpZiAoIWNhbnZhcykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgLy8gVGVzdCB6b29tIGZ1bmN0aW9uc1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuem9vbUluKCk7XHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tT3V0KCk7XHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5yZXNldFpvb20oKTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignQ2FudmFzIGZ1bmN0aW9uYWxpdHkgdGVzdCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgZmlsZSBzeXN0ZW0gaW50ZWdyYXRpb25cclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RGaWxlU3lzdGVtSW50ZWdyYXRpb24oKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUZXN0IHNlcnZpY2UgbWV0aG9kcyBleGlzdFxyXG4gICAgICBjb25zdCBtZXRob2RzID0gW1xyXG4gICAgICAgICdzZWxlY3RJbWFnZUZvbGRlcicsXHJcbiAgICAgICAgJ3NlbGVjdExhYmVsRm9sZGVyJyxcclxuICAgICAgICAnbG9hZExhYmVscycsXHJcbiAgICAgICAgJ3NhdmVMYWJlbHMnLFxyXG4gICAgICAgICdwYXJzZVlvbG9TdHJpbmcnXHJcbiAgICAgIF07XHJcblxyXG4gICAgICByZXR1cm4gbWV0aG9kcy5ldmVyeShtZXRob2QgPT5cclxuICAgICAgICB0eXBlb2YgKHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgYXMgYW55KVttZXRob2RdID09PSAnZnVuY3Rpb24nXHJcbiAgICAgICk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGaWxlIHN5c3RlbSBpbnRlZ3JhdGlvbiB0ZXN0IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBrZXlib2FyZCBzaG9ydGN1dHNcclxuICAgKi9cclxuICBwcml2YXRlIHRlc3RLZXlib2FyZFNob3J0Y3V0cygpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFRlc3QgdGhhdCBldmVudCBtYW5hZ2VyIGV4aXN0cyBhbmQgaGFzIHJlcXVpcmVkIG1ldGhvZHNcclxuICAgICAgcmV0dXJuICEhdGhpcy5ldmVudE1hbmFnZXIgJiYgdHlwZW9mIHRoaXMuZXZlbnRNYW5hZ2VyLmRlc3Ryb3kgPT09ICdmdW5jdGlvbic7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdLZXlib2FyZCBzaG9ydGN1dHMgdGVzdCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhcHBsaWNhdGlvbiBzdGF0ZSBmb3IgZGVidWdnaW5nXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFwcGxpY2F0aW9uU3RhdGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpbml0aWFsaXplZDogdGhpcy5pbml0aWFsaXplZCxcclxuICAgICAgYXBwU3RhdGU6IHRoaXMuYXBwU3RhdGUuZ2V0RGVidWdJbmZvKCksXHJcbiAgICAgIGNhbnZhczoge1xyXG4gICAgICAgIGhhc0NhbnZhczogISF0aGlzLmNhbnZhc0NvbnRyb2xsZXI/LmNhbnZhcyxcclxuICAgICAgICBtb2RlOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRNb2RlXHJcbiAgICAgIH0sXHJcbiAgICAgIHVpOiB7XHJcbiAgICAgICAgaGFzVUlNYW5hZ2VyOiAhIXRoaXMudWlNYW5hZ2VyXHJcbiAgICAgIH0sXHJcbiAgICAgIGV2ZW50czoge1xyXG4gICAgICAgIGhhc0V2ZW50TWFuYWdlcjogISF0aGlzLmV2ZW50TWFuYWdlclxyXG4gICAgICB9LFxyXG4gICAgICBmaWxlU3lzdGVtOiB7XHJcbiAgICAgICAgaGFzRmlsZVN5c3RlbVNlcnZpY2U6ICEhdGhpcy5maWxlU3lzdGVtU2VydmljZVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYW51cCBhcHBsaWNhdGlvbiByZXNvdXJjZXNcclxuICAgKi9cclxuICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyPy5kZXN0cm95Py4oKTtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyPy5kZXN0cm95Q2FudmFzPy4oKTtcclxuICAgICAgLy8gdGhpcy51aU1hbmFnZXIgY2xlYW51cCBpZiBuZWVkZWRcclxuICAgICAgY29uc29sZS5sb2coJ/Cfp7kgQXBwbGljYXRpb24gcmVzb3VyY2VzIGNsZWFuZWQgdXAnKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvciBkdXJpbmcgY2xlYW51cDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBJbml0aWFsaXplIGFwcGxpY2F0aW9uIHdoZW4gRE9NIGlzIHJlYWR5XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG5cclxuICB0cnkge1xyXG4gICAgLy8gQ3JlYXRlIGFuZCBzdGFydCB0aGUgYXBwbGljYXRpb25cclxuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcclxuXHJcbiAgICAvLyBNYWtlIGFwcCBhdmFpbGFibGUgZ2xvYmFsbHkgZm9yIGRlYnVnZ2luZ1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLmVhc3lMYWJlbGluZ0FwcCA9IGFwcDtcclxuXHJcbiAgICAvLyBSZW1vdmVkOiBQaGFzZSA4IGNvbXBsZXRpb24gaW5kaWNhdG9yIHRvYXN0XG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign4p2MIEZhaWxlZCB0byBpbml0aWFsaXplIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb246JywgZXJyb3IpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyBFeHBvcnQgbWFpbiBjb21wb25lbnRzIGZvciBleHRlcm5hbCB1c2VcclxuZXhwb3J0IHsgQXBwIH07XHJcbmV4cG9ydCB7IEFwcFN0YXRlLCBjcmVhdGVBcHBTdGF0ZSwgY3JlYXRlQXBwU3RhdGVXaXRoQ29uZmlnIH0gZnJvbSAnLi9tb2RlbHMnO1xyXG5leHBvcnQgeyBGaWxlU3lzdGVtU2VydmljZSwgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIFlvbG9QYXJzZXIgfSBmcm9tICcuL3NlcnZpY2VzJztcclxuZXhwb3J0IHsgQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvQ2FudmFzQ29udHJvbGxlcic7XHJcbmV4cG9ydCB7IEV2ZW50TWFuYWdlciB9IGZyb20gJy4vY29udHJvbGxlcnMvRXZlbnRNYW5hZ2VyJztcclxuZXhwb3J0IHsgVUlNYW5hZ2VyIH0gZnJvbSAnLi91aS9VSU1hbmFnZXInO1xyXG5leHBvcnQgeyBwYXJzZVlvbG8sIGV4cG9ydFlvbG8sIHZhbGlkYXRlWW9sb1N0cmluZyB9IGZyb20gJy4vdXRpbHMnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9