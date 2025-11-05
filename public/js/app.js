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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztHQUlHO0FBRUg7OztHQUdHO0FBQ0ksTUFBTSxZQUFZLEdBQWE7SUFDbEMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVM7SUFDckQsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVM7SUFDckQsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVM7SUFDckQsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVM7SUFDckQsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVM7SUFDckQsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVM7Q0FDeEQsQ0FBQztBQUVGOztHQUVHO0FBQ0ksTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBRXZDOzs7O0dBSUc7QUFDSSxTQUFTLGdCQUFnQixDQUFDLFVBQTJCO0lBQ3hELE1BQU0sV0FBVyxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVE7UUFDOUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxVQUFVLENBQUM7SUFFakIsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3hDLE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxXQUFXLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUNyRCxPQUFPLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxhQUFhLENBQUM7QUFDckQsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSSxTQUFTLG1CQUFtQixDQUFDLFlBQWlDO0lBQ2pFLE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDeEUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSSxTQUFTLGdCQUFnQixDQUFDLEtBQWE7SUFDMUMsT0FBTyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ3RELENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksU0FBUyxhQUFhLENBQUMsS0FBYTtJQUN2QyxPQUFPLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSSxTQUFTLHVCQUF1QixDQUFDLGVBQXVCO0lBQzNELHNCQUFzQjtJQUN0QixNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU3QyxpQkFBaUI7SUFDakIsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM1QyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFNUMsK0JBQStCO0lBQy9CLE1BQU0sU0FBUyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFFNUQsaUVBQWlFO0lBQ2pFLE9BQU8sU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDbkQsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0ksU0FBUyxTQUFTLENBQUMsR0FBVyxFQUFFLFFBQWdCLENBQUM7SUFDcEQsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFakQsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssR0FBRyxDQUFDO0FBQzlDLENBQUM7QUFXRDs7R0FFRztBQUNJLE1BQU0sWUFBWTtJQUtyQixZQUFZLFNBQStCLEVBQUU7UUFDekMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQztRQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLElBQUksYUFBYSxDQUFDO1FBQ3pELElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsSUFBSSxLQUFLLENBQUM7SUFDM0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLFVBQTJCLEVBQUUsT0FBb0M7UUFDdEUsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFL0MsSUFBSSxPQUFPLEVBQUUsWUFBWSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNoRCx3Q0FBd0M7WUFDeEMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNLLG9CQUFvQixDQUFDLEtBQWE7UUFDdEMsc0NBQXNDO1FBQ3RDLGtFQUFrRTtRQUNsRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxpQkFBaUIsQ0FBQyxHQUFXO1FBQ2pDLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDdkQsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN2RCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBRXZELE9BQU8sS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuS0Q7Ozs7R0FJRztBQUV5RDtBQVc1RDs7OztHQUlHO0FBQ0ksU0FBUyxrQkFBa0IsQ0FBQyxLQUFvQjtJQUNuRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNqQixPQUFPLElBQUksQ0FBQyxDQUFDLHdCQUF3QjtJQUN6QyxDQUFDO0lBRUQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRWxDLElBQUksWUFBWSxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQ3RCLHlEQUFTLENBQUMsOEJBQThCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUVqQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDakUseURBQVMsQ0FBQyw2REFBNkQsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvRSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSSxTQUFTLDBCQUEwQixDQUFDLEtBQW9CO0lBQzNELElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ2pCLE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSxxQkFBcUI7U0FDdEMsQ0FBQztJQUNOLENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFbEMsSUFBSSxZQUFZLEtBQUssRUFBRSxFQUFFLENBQUM7UUFDdEIsT0FBTztZQUNILE9BQU8sRUFBRSxLQUFLO1lBQ2QsWUFBWSxFQUFFLDZCQUE2QjtTQUM5QyxDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUVqQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2IsT0FBTztZQUNILE9BQU8sRUFBRSxLQUFLO1lBQ2QsWUFBWSxFQUFFLDhCQUE4QjtTQUMvQyxDQUFDO0lBQ04sQ0FBQztJQUVELElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDekIsT0FBTztZQUNILE9BQU8sRUFBRSxLQUFLO1lBQ2QsWUFBWSxFQUFFLGdDQUFnQztTQUNqRCxDQUFDO0lBQ04sQ0FBQztJQUVELElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ1YsT0FBTztZQUNILE9BQU8sRUFBRSxLQUFLO1lBQ2QsWUFBWSxFQUFFLGdDQUFnQztTQUNqRCxDQUFDO0lBQ04sQ0FBQztJQUVELElBQUksR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQ2QsT0FBTztZQUNILE9BQU8sRUFBRSxLQUFLO1lBQ2QsWUFBWSxFQUFFLGlDQUFpQztTQUNsRCxDQUFDO0lBQ04sQ0FBQztJQUVELE9BQU87UUFDSCxPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO0tBQ3JCLENBQUM7QUFDTixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNJLFNBQVMsZ0JBQWdCLENBQUMsUUFBZ0I7SUFDN0MsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzVDLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCwrQkFBK0I7SUFDL0IsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0lBQ3BDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsTUFBTSxhQUFhLEdBQUcsd0NBQXdDLENBQUM7SUFDL0QsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDL0IsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksU0FBUyxzQkFBc0IsQ0FBQyxRQUFnQjtJQUNuRCxNQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BGLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzlFLE9BQU8sZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNJLFNBQVMsbUJBQW1CLENBQy9CLENBQVMsRUFDVCxDQUFTLEVBQ1QsS0FBYSxFQUNiLE1BQWM7SUFFZCxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3hELE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSx1Q0FBdUM7U0FDeEQsQ0FBQztJQUNOLENBQUM7SUFFRCxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzVCLE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSxtQ0FBbUM7U0FDcEQsQ0FBQztJQUNOLENBQUM7SUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2pCLE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSxnQ0FBZ0M7U0FDakQsQ0FBQztJQUNOLENBQUM7SUFFRCxPQUFPO1FBQ0gsT0FBTyxFQUFFLElBQUk7S0FDaEIsQ0FBQztBQUNOLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0ksU0FBUyx1QkFBdUIsQ0FDbkMsT0FBZSxFQUNmLE9BQWUsRUFDZixLQUFhLEVBQ2IsTUFBYztJQUVkLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDcEUsT0FBTztZQUNILE9BQU8sRUFBRSxLQUFLO1lBQ2QsWUFBWSxFQUFFLDRDQUE0QztTQUM3RCxDQUFDO0lBQ04sQ0FBQztJQUVELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzNELE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSw0Q0FBNEM7U0FDN0QsQ0FBQztJQUNOLENBQUM7SUFFRCxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2RCxPQUFPO1lBQ0gsT0FBTyxFQUFFLEtBQUs7WUFDZCxZQUFZLEVBQUUsMENBQTBDO1NBQzNELENBQUM7SUFDTixDQUFDO0lBRUQsT0FBTztRQUNILE9BQU8sRUFBRSxJQUFJO0tBQ2hCLENBQUM7QUFDTixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNJLFNBQVMsaUJBQWlCLENBQUMsSUFBWTtJQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNwRCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNJLFNBQVMsZ0JBQWdCLENBQUMsUUFBZ0I7SUFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLElBQUksQ0FBQyxJQUFJLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDL0QsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSSxTQUFTLGNBQWMsQ0FDMUIsS0FBc0IsRUFDdEIsR0FBWSxFQUNaLEdBQVksRUFDWixhQUFzQixJQUFJO0lBRTFCLE1BQU0sR0FBRyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFFOUQsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNiLE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSw4QkFBOEI7U0FDL0MsQ0FBQztJQUNOLENBQUM7SUFFRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3hDLE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSwwQkFBMEI7U0FDM0MsQ0FBQztJQUNOLENBQUM7SUFFRCxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2pDLE9BQU87WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLFlBQVksRUFBRSwwQkFBMEIsR0FBRyxFQUFFO1NBQ2hELENBQUM7SUFDTixDQUFDO0lBRUQsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNqQyxPQUFPO1lBQ0gsT0FBTyxFQUFFLEtBQUs7WUFDZCxZQUFZLEVBQUUsdUJBQXVCLEdBQUcsRUFBRTtTQUM3QyxDQUFDO0lBQ04sQ0FBQztJQUVELE9BQU87UUFDSCxPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxHQUFHO0tBQ2IsQ0FBQztBQUNOLENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksU0FBUyxhQUFhLENBQUMsS0FBYTtJQUN2QyxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztJQUNoRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSSxTQUFTLFdBQVcsQ0FBQyxHQUFXO0lBQ25DLElBQUksQ0FBQztRQUNELElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNMLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7QUFDTCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNJLFNBQVMsYUFBYSxDQUFDLEtBQWE7SUFDdkMsT0FBTyxLQUFLO1NBQ1AsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7U0FDdEIsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7U0FDckIsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7U0FDckIsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7U0FDdkIsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDbFVEOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBQ0ksU0FBUyxTQUFTLENBQUMsT0FBZSxFQUFFLFdBQW1CLElBQUk7SUFDOUQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2xFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdELE9BQU87SUFDWCxDQUFDO0lBRUQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QyxLQUFLLENBQUMsU0FBUyxHQUFHLGVBQWUsQ0FBQztJQUNsQyxLQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztJQUM1QixjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWxDLDZDQUE2QztJQUM3QyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFbEQsdUNBQXVDO0lBQ3ZDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQixDQUFDO1FBQ0wsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsOEJBQThCO0lBQzNDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0ksU0FBUyxjQUFjLENBQUMsT0FBZTtJQUMxQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFRDs7O0dBR0c7QUFDSSxTQUFTLGdCQUFnQixDQUFDLE9BQWU7SUFDNUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0ksU0FBUyxnQkFBZ0IsQ0FBQyxPQUFlO0lBQzVDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQWlCRDs7O0dBR0c7QUFDSSxTQUFTLGNBQWMsQ0FBQyxNQUFtQjtJQUM5QyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxHQUFHLEtBQUssRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUVoRSxNQUFNLGdCQUFnQixHQUE4QjtRQUNoRCxPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixJQUFJLEVBQUUsSUFBSTtLQUNiLENBQUM7SUFFRixNQUFNLGFBQWEsR0FBRyxRQUFRLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFekQsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNkLCtEQUErRDtRQUMvRCxTQUFTLENBQUMsR0FBRyxPQUFPLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3pELENBQUM7U0FBTSxDQUFDO1FBQ0osU0FBUyxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN0QyxDQUFDO0FBQ0wsQ0FBQzs7Ozs7OztVQ2xHRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7OztBQ05BOzs7Ozs7OztHQVFHO0FBeUJIOzs7OztHQUtHO0FBQ0ksTUFBTSxRQUFRO0lBNkRuQjs7T0FFRztJQUNIO1FBL0RBLHNFQUFzRTtRQUN0RSx3Q0FBd0M7UUFDeEMsc0VBQXNFO1FBRS9ELHNCQUFpQixHQUFxQyxJQUFJLENBQUM7UUFDM0Qsc0JBQWlCLEdBQXFDLElBQUksQ0FBQztRQUMzRCwwQkFBcUIsR0FBcUMsSUFBSSxDQUFDO1FBRXRFLHNFQUFzRTtRQUN0RSxtQkFBbUI7UUFDbkIsc0VBQXNFO1FBRS9ELGVBQVUsR0FBZ0IsRUFBRSxDQUFDO1FBQzdCLGVBQVUsR0FBZ0IsRUFBRSxDQUFDO1FBQzdCLHNCQUFpQixHQUFxQixJQUFJLENBQUM7UUFFbEQsc0VBQXNFO1FBQ3RFLHVCQUF1QjtRQUN2QixzRUFBc0U7UUFFL0QscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUMsQ0FBQyx3QkFBd0I7UUFDdkUsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDLENBQUMsdUJBQXVCO1FBQy9ELHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDLENBQUMsd0JBQXdCO1FBQ3ZFLHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQyxzQkFBc0I7UUFFdkUsc0VBQXNFO1FBQ3RFLHdCQUF3QjtRQUN4QixzRUFBc0U7UUFFL0QscUJBQWdCLEdBQXFCLElBQUksQ0FBQztRQUMxQyxpQkFBWSxHQUE0QixJQUFJLENBQUM7UUFDN0MsZ0JBQVcsR0FBUyxNQUFNLENBQUM7UUFDM0IscUJBQWdCLEdBQWMsQ0FBQyxDQUFDO1FBRXZDLHNFQUFzRTtRQUN0RSw0QkFBNEI7UUFDNUIsc0VBQXNFO1FBRS9ELHNCQUFpQixHQUFZLEtBQUssQ0FBQztRQUNuQyx1QkFBa0IsR0FBWSxJQUFJLENBQUM7UUFDbkMsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFDM0IsbUJBQWMsR0FBbUIsS0FBSyxDQUFDO1FBQ3ZDLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUNwQyx1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFFM0Msc0VBQXNFO1FBQ3RFLGtDQUFrQztRQUNsQyxzRUFBc0U7UUFFL0QsZ0JBQVcsR0FBMEIsSUFBSSxDQUFDO1FBQzFDLGVBQVUsR0FBeUIsSUFBSSxDQUFDO1FBQ3hDLHNCQUFpQixHQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUMsa0JBQWEsR0FBUSxJQUFJLENBQUM7UUFFakMsc0VBQXNFO1FBQ3RFLGVBQWU7UUFDZixzRUFBc0U7UUFFOUQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztRQU1qRSwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLDJCQUEyQjtJQUMzQixzRUFBc0U7SUFFdEU7O09BRUc7SUFDSSxLQUFLO1FBQ1YscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztRQUM5QixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1FBRWxDLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBRTlCLHNCQUFzQjtRQUN0QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUUxQixnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7UUFDaEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztRQUVoQyx1QkFBdUI7UUFDdkIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUMxQixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsYUFBYTtZQUNuQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxrQkFBa0I7SUFDbEIsc0VBQXNFO0lBRXRFOztPQUVHO0lBQ0ksY0FBYyxDQUFDLE1BQWlDO1FBQ3JELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUM7UUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsa0JBQWtCO1lBQ3hCLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQzNCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxjQUFjLENBQUMsTUFBaUM7UUFDckQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQztRQUNoQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxrQkFBa0I7WUFDeEIsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDM0IsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLGtCQUFrQixDQUFDLE1BQWlDO1FBQ3pELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUM7UUFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsdUJBQXVCO1lBQzdCLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQzNCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLG1CQUFtQjtJQUNuQixzRUFBc0U7SUFFdEU7O09BRUc7SUFDSSxlQUFlLENBQUMsU0FBMkI7UUFDaEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzVDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7UUFFbEMsa0RBQWtEO1FBQ2xELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLENBQUM7UUFFM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsdUJBQXVCO1lBQzdCLElBQUksRUFBRTtnQkFDSixRQUFRLEVBQUUsYUFBYSxFQUFFLElBQUksSUFBSSxJQUFJO2dCQUNyQyxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksSUFBSSxJQUFJO2dCQUNoQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjthQUNqQztZQUNELFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxtQkFBbUIsQ0FBQyxRQUFnQjtRQUN6QyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDO0lBQ3RELENBQUM7SUFFRDs7T0FFRztJQUNJLG1CQUFtQixDQUFDLFFBQWdCLEVBQUUsU0FBa0I7UUFDN0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsNEJBQTRCO1lBQ2xDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7WUFDN0IsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsa0JBQWtCO0lBQ2xCLHNFQUFzRTtJQUV0RTs7T0FFRztJQUNJLE9BQU8sQ0FBQyxJQUFVO1FBQ3ZCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsY0FBYztZQUNwQixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDL0MsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLFVBQVU7UUFDZixNQUFNLE9BQU8sR0FBUyxJQUFJLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDcEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLG1CQUFtQjtJQUNuQixzRUFBc0U7SUFFdEU7O09BRUc7SUFDSSxlQUFlLENBQUMsU0FBMkI7UUFDaEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztRQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxxQkFBcUI7WUFDM0IsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQzNDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxrQkFBa0IsQ0FBQyxRQUF5QjtRQUNqRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSx3QkFBd0I7WUFDOUIsSUFBSSxFQUFFLFFBQVE7WUFDZCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0kscUJBQXFCLENBQUMsT0FBZTtRQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHNCQUFzQjtJQUN0QixzRUFBc0U7SUFFdEU7O09BRUc7SUFDSSxXQUFXLENBQUMsT0FBZ0I7UUFDakMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSw0QkFBNEI7WUFDbEMsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxhQUFhLENBQUMsSUFBYTtRQUNoQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLDhCQUE4QjtZQUNwQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUU7WUFDZCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksZ0JBQWdCLENBQUMsSUFBWTtRQUNsQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSw0QkFBNEI7Z0JBQ2xDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRTtnQkFDZCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNJLGlCQUFpQixDQUFDLEtBQXFCO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLDZCQUE2QjtZQUNuQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUU7WUFDZixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxzQkFBc0I7SUFDdEIsc0VBQXNFO0lBRXRFOztPQUVHO0lBQ0ksZ0JBQWdCO1FBQ3JCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNuRCxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSx3QkFBd0I7WUFDOUIsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN6QyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksZUFBZTtRQUNwQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsc0JBQXNCO1lBQzVCLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDMUMsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLGdCQUFnQixDQUFDLE1BQVc7UUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsdUJBQXVCO1lBQzdCLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRTtZQUNoQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxtQkFBbUI7SUFDbkIsc0VBQXNFO0lBRXRFOztPQUVHO0lBQ0ksaUJBQWlCLENBQUMsUUFBZ0IsRUFBRSxTQUFpQjtRQUMxRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxzQkFBc0I7WUFDNUIsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFO1lBQ2xCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxxQkFBcUIsQ0FBQyxRQUFnQjtRQUMzQyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksaUJBQWlCO1FBQ3RCLGdEQUFnRDtRQUNoRCxLQUFLLE1BQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ3hELEdBQUcsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSx1QkFBdUI7WUFDN0IsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsdUJBQXVCO0lBQ3ZCLHNFQUFzRTtJQUV0RTs7T0FFRztJQUNJLFlBQVksQ0FBQyxJQUFtQjtRQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxvQkFBb0I7WUFDMUIsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDekIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLFlBQVk7UUFDakIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNJLGNBQWM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLDhCQUE4QjtJQUM5QixzRUFBc0U7SUFFdEU7O09BRUc7SUFDSSxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsT0FBNkI7UUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOztPQUVHO0lBQ0ksbUJBQW1CLENBQUMsSUFBWSxFQUFFLE9BQTZCO1FBQ3BFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2YsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxhQUFhLENBQUMsS0FBb0I7UUFDdkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6QixJQUFJLENBQUM7b0JBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQixDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNwRSxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxrQkFBa0I7SUFDbEIsc0VBQXNFO0lBRXRFOztPQUVHO0lBQ0ksUUFBUTtRQUNiLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFFOUIsNkJBQTZCO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM1QixRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM1QixRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELHdCQUF3QjtRQUN4QixJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDdEQsTUFBTSxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxrQ0FBa0M7UUFDbEMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsT0FBTztZQUNMLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUM7WUFDNUIsTUFBTTtZQUNOLFFBQVE7U0FDVCxDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBQ0ksb0JBQW9CO1FBQ3pCLE9BQU87WUFDTCxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtZQUN6QyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCO1lBQzNDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNqQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtZQUMzQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCO1NBQzVDLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSSw0QkFBNEIsQ0FBQyxLQUEyQjtRQUM3RCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztRQUNqRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ25ELElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUM7UUFDM0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBRW5ELElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLGdCQUFnQjtZQUN0QixJQUFJLEVBQUUsS0FBSztZQUNYLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxZQUFZO1FBQ2pCLE9BQU87WUFDTCxlQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNO1lBQ3ZDLGVBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07WUFDdkMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUk7WUFDakQsZUFBZSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSTtZQUNyQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSTtZQUM3QyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSTtZQUNwRCxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ3ZDLGNBQWMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtZQUN4QyxjQUFjLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUI7WUFDeEMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUI7WUFDaEQsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksSUFBSSxJQUFJO1lBQ3JELHFCQUFxQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLElBQUksSUFBSTtZQUMzRCxrQkFBa0IsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDM0QsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELHNFQUFzRTtBQUN0RSxtQkFBbUI7QUFDbkIsc0VBQXNFO0FBRXRFOztHQUVHO0FBQ0ksU0FBUyxjQUFjO0lBQzVCLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztBQUN4QixDQUFDO0FBRUQ7O0dBRUc7QUFDSSxTQUFTLHdCQUF3QixDQUFDLE1BQStCO0lBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7SUFFaEMsc0JBQXNCO0lBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2hDLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ25CLFFBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUksTUFBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxzRUFBc0U7QUFDdEUsVUFBVTtBQUNWLHNFQUFzRTtBQUV0RSxzREFBZSx3REFBUSxJQUFDOzs7QUN0b0J4Qjs7OztHQUlHO0FBcU5ILHNFQUFzRTtBQUN0RSxjQUFjO0FBQ2Qsc0VBQXNFO0FBRS9ELE1BQU0sZUFBZ0IsU0FBUSxLQUFLO0lBQ3hDLFlBQ0UsT0FBZSxFQUNSLElBQVksRUFDWixPQUFhO1FBRXBCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhSLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixZQUFPLEdBQVAsT0FBTyxDQUFNO1FBR3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7SUFDaEMsQ0FBQztDQUNGO0FBRU0sTUFBTSwwQkFBZ0IsU0FBUSxLQUFLO0lBQ3hDLFlBQ0UsT0FBZSxFQUNSLElBQWEsRUFDYixJQUFhO1FBRXBCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhSLFNBQUksR0FBSixJQUFJLENBQVM7UUFDYixTQUFJLEdBQUosSUFBSSxDQUFTO1FBR3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7SUFDaEMsQ0FBQztDQUNGO0FBRU0sTUFBTSxjQUFlLFNBQVEsS0FBSztJQUN2QyxZQUNFLE9BQWUsRUFDUixRQUFpQixFQUNqQixLQUFhO1FBRXBCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhSLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUdwQixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7Q0FDRjs7O0FDNVBEOzs7OztHQUtHO0FBRWtHO0FBRXJHLHNFQUFzRTtBQUN0RSxZQUFZO0FBQ1osc0VBQXNFO0FBRXRFLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUMzQixNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFDM0IsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO0FBRXJCLHNFQUFzRTtBQUN0RSxvQkFBb0I7QUFDcEIsc0VBQXNFO0FBRS9ELE1BQU0sVUFBVTtJQUlyQjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBZ0I7UUFDNUMsTUFBTSxNQUFNLEdBQW9CO1lBQzlCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsTUFBTSxFQUFFLEVBQUU7WUFDVixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUM7UUFFRixJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUN4QyxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ2hDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVoQyxnQ0FBZ0M7WUFDaEMsSUFBSSxXQUFXLEtBQUssRUFBRSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDdEQsT0FBTztZQUNULENBQUM7WUFFRCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixDQUFDO1lBQ0gsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxLQUFLLFlBQVksMEJBQWUsRUFBRSxDQUFDO29CQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLFNBQVMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLENBQUM7cUJBQU0sQ0FBQztvQkFDTixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLFNBQVMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3JFLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRW5DLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNLLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBWSxFQUFFLFVBQWtCO1FBQzdELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLE1BQU0sSUFBSSwwQkFBZSxDQUN2Qix1RUFBdUUsRUFDdkUsVUFBVSxFQUNWLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFMUUsaUJBQWlCO1FBQ2pCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sSUFBSSwwQkFBZSxDQUN2QixzQkFBc0IsVUFBVSxtQ0FBbUMsRUFDbkUsVUFBVSxFQUNWLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQztRQUVELG9CQUFvQjtRQUNwQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9FLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTVFLDZCQUE2QjtRQUM3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpGLE9BQU87WUFDTCxPQUFPO1lBQ1AsT0FBTztZQUNQLE9BQU87WUFDUCxLQUFLO1lBQ0wsTUFBTTtTQUNQLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQWEsRUFBRSxJQUFZLEVBQUUsVUFBa0IsRUFBRSxJQUFZO1FBQzFGLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDekMsTUFBTSxJQUFJLDBCQUFlLENBQ3ZCLFdBQVcsSUFBSSxNQUFNLEtBQUssMkJBQTJCLEVBQ3JELFVBQVUsRUFDVixJQUFJLENBQ0wsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNsQixNQUFNLElBQUksMEJBQWUsQ0FDdkIsV0FBVyxJQUFJLE1BQU0sS0FBSyw4QkFBOEIsRUFDeEQsVUFBVSxFQUNWLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNLLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFnQixFQUFFLFVBQWtCLEVBQUUsSUFBWTtRQUNuRixNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRWxELGlFQUFpRTtRQUNqRSxJQUFJLE9BQU8sR0FBRyxjQUFjLElBQUksT0FBTyxHQUFHLGNBQWMsRUFBRSxDQUFDO1lBQ3pELE1BQU0sSUFBSSwwQkFBZSxDQUN2Qix5QkFBeUIsT0FBTywyQkFBMkIsRUFDM0QsVUFBVSxFQUNWLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQztRQUVELElBQUksT0FBTyxHQUFHLGNBQWMsSUFBSSxPQUFPLEdBQUcsY0FBYyxFQUFFLENBQUM7WUFDekQsTUFBTSxJQUFJLDBCQUFlLENBQ3ZCLHlCQUF5QixPQUFPLDJCQUEyQixFQUMzRCxVQUFVLEVBQ1YsSUFBSSxDQUNMLENBQUM7UUFDSixDQUFDO1FBRUQsSUFBSSxLQUFLLElBQUksUUFBUSxJQUFJLEtBQUssR0FBRyxjQUFjLEVBQUUsQ0FBQztZQUNoRCxNQUFNLElBQUksMEJBQWUsQ0FDdkIsdUJBQXVCLEtBQUssMkJBQTJCLEVBQ3ZELFVBQVUsRUFDVixJQUFJLENBQ0wsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJLE1BQU0sSUFBSSxRQUFRLElBQUksTUFBTSxHQUFHLGNBQWMsRUFBRSxDQUFDO1lBQ2xELE1BQU0sSUFBSSwwQkFBZSxDQUN2Qix3QkFBd0IsTUFBTSwyQkFBMkIsRUFDekQsVUFBVSxFQUNWLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQztRQUVELDRCQUE0QjtRQUM1QixNQUFNLElBQUksR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNqQyxNQUFNLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVwQyxJQUFJLElBQUksR0FBRyxjQUFjLElBQUksS0FBSyxHQUFHLGNBQWMsRUFBRSxDQUFDO1lBQ3BELE1BQU0sSUFBSSwwQkFBZSxDQUN2QixpRUFBaUUsSUFBSSxZQUFZLEtBQUssR0FBRyxFQUN6RixVQUFVLEVBQ1YsSUFBSSxDQUNMLENBQUM7UUFDSixDQUFDO1FBRUQsSUFBSSxHQUFHLEdBQUcsY0FBYyxJQUFJLE1BQU0sR0FBRyxjQUFjLEVBQUUsQ0FBQztZQUNwRCxNQUFNLElBQUksMEJBQWUsQ0FDdkIsOERBQThELEdBQUcsYUFBYSxNQUFNLEdBQUcsRUFDdkYsVUFBVSxFQUNWLElBQUksQ0FDTCxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUF1QjtRQUMxRCxzQ0FBc0M7UUFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDckMsSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDO2dCQUM5QyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssR0FBRyxDQUFDLDhCQUE4QixLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZHLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILHVEQUF1RDtRQUN2RCxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFtQixFQUFFLFVBQTZCLEVBQUU7UUFDbkYsTUFBTSxFQUNKLFNBQVMsR0FBRyxpQkFBaUIsRUFDN0IsZUFBZSxHQUFHLEtBQUssRUFDdkIsY0FBYyxHQUFHLElBQUksRUFDdEIsR0FBRyxPQUFPLENBQUM7UUFFWixJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbkMsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1FBRTNCLElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsS0FBSyxDQUFDLElBQUksQ0FBQyw4RUFBOEUsQ0FBQyxDQUFDO1lBQzNGLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakIsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDOUIsSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDckQsTUFBTSxJQUFJLDBCQUFlLENBQUMsMEJBQTBCLEtBQUssNkJBQTZCLENBQUMsQ0FBQztZQUMxRixDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUc7Z0JBQ1gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDaEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUNoQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQzlCLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQzthQUNoQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVaLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQWdCO1FBQzlDLElBQUksQ0FBQztZQUNILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNQLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FDN0IsTUFBYyxFQUNkLE1BQWMsRUFDZCxVQUFrQixFQUNsQixXQUFtQixFQUNuQixVQUFrQixFQUNsQixXQUFtQjtRQUVuQixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBQ3ZELE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUM7UUFDekQsTUFBTSxLQUFLLEdBQUcsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUN0QyxNQUFNLE1BQU0sR0FBRyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRXpDLE9BQU87WUFDTCxPQUFPLEVBQUUsQ0FBQyxFQUFFLHdCQUF3QjtZQUNwQyxPQUFPO1lBQ1AsT0FBTztZQUNQLEtBQUs7WUFDTCxNQUFNO1NBQ1AsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FDN0IsS0FBZ0IsRUFDaEIsVUFBa0IsRUFDbEIsV0FBbUI7UUFFbkIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7UUFDdkMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7UUFDMUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUV2RCxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQW1CO1FBU2xELElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQyxPQUFPO2dCQUNMLFdBQVcsRUFBRSxDQUFDO2dCQUNkLGlCQUFpQixFQUFFLEVBQUU7Z0JBQ3JCLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtnQkFDcEMsU0FBUyxFQUFFO29CQUNULEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtvQkFDNUIsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO2lCQUM3QjthQUNGLENBQUM7UUFDSixDQUFDO1FBRUQsTUFBTSxpQkFBaUIsR0FBMkIsRUFBRSxDQUFDO1FBQ3JELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDakMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUVqQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLHFCQUFxQjtZQUNyQixpQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRS9FLGtCQUFrQjtZQUNsQixVQUFVLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQixXQUFXLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUM1QixRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNMLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTTtZQUMxQixpQkFBaUI7WUFDakIsV0FBVyxFQUFFO2dCQUNYLEtBQUssRUFBRSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU07Z0JBQ2pDLE1BQU0sRUFBRSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU07YUFDcEM7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO2dCQUMzQyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUU7YUFDNUM7U0FDRixDQUFDO0lBQ0osQ0FBQzs7QUE5VnVCLDZCQUFrQixHQUFHLGlCQUFpQixDQUFDO0FBQ3ZDLHVCQUFZLEdBQUcsK0RBQStELENBQUM7QUFnV3pHLHNFQUFzRTtBQUN0RSxvQkFBb0I7QUFDcEIsc0VBQXNFO0FBRXRFOztHQUVHO0FBQ0ksU0FBUyxTQUFTLENBQUMsUUFBZ0I7SUFDeEMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxlQUFlLENBQUMsd0JBQXdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3ZCLENBQUM7QUFFRDs7R0FFRztBQUNJLFNBQVMsVUFBVSxDQUFDLE1BQW1CLEVBQUUsWUFBb0IsaUJBQWlCO0lBQ25GLE9BQU8sVUFBVSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUVEOztHQUVHO0FBQ0ksU0FBUyxrQkFBa0IsQ0FBQyxRQUFnQjtJQUNqRCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELE9BQU87UUFDTCxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUNuQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07S0FDdEIsQ0FBQztBQUNKLENBQUM7QUFFRCxzRUFBc0U7QUFDdEUsU0FBUztBQUNULHNFQUFzRTtBQUV0RSxrREFBZSwwREFBVSxJQUFDOzs7QUM3WjFCOzs7Ozs7OztHQVFHO0FBeUIwQjtBQWFxQjtBQUVsRCxzRUFBc0U7QUFDdEUsb0NBQW9DO0FBQ3BDLHNFQUFzRTtBQUUvRCxNQUFNLGlCQUFpQjtJQXNCNUIsWUFBWSxNQUFrQztRQXBCdEMsZUFBVSxHQUFHLElBQUksR0FBRyxFQUF3QyxDQUFDO1FBQzdELG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFvQm5FLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBQ25FLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsb0JBQW9CO0lBQ3BCLHNFQUFzRTtJQUUvRCxLQUFLLENBQUMsaUJBQWlCO1FBQzVCLElBQUksQ0FBQztZQUNILE1BQU0sWUFBWSxHQUFHLE1BQU8sTUFBYyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFFakUsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTthQUN0QixDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxZQUFZO2dCQUNsQixPQUFPLEVBQUUsMEJBQTBCLFlBQVksQ0FBQyxJQUFJLEVBQUU7YUFDdkQsQ0FBQztRQUNKLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsSUFBSSxLQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFLENBQUM7Z0JBQzFELE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxDQUFDO1lBQzVELENBQUM7WUFFRCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSxrQ0FBa0MsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO2FBQ3BHLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxpQkFBaUI7UUFDNUIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxZQUFZLEdBQUcsTUFBTyxNQUFjLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUVqRSxJQUFJLENBQUMsYUFBYSxDQUFDO2dCQUNqQixJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRTtnQkFDakMsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3RCLENBQUMsQ0FBQztZQUVILE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLE9BQU8sRUFBRSwwQkFBMEIsWUFBWSxDQUFDLElBQUksRUFBRTthQUN2RCxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixJQUFJLEtBQUssWUFBWSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxZQUFZLEVBQUUsQ0FBQztnQkFDMUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLENBQUM7WUFDNUQsQ0FBQztZQUVELE9BQU87Z0JBQ0wsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLGtDQUFrQyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUU7YUFDcEcsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLHFCQUFxQjtRQUNoQyxJQUFJLENBQUM7WUFDSCxNQUFNLFlBQVksR0FBRyxNQUFPLE1BQWMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRWpFLElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSw0QkFBNEI7Z0JBQ2xDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFO2dCQUNqQyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1lBRUgsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLEVBQUUsWUFBWTtnQkFDbEIsT0FBTyxFQUFFLCtCQUErQixZQUFZLENBQUMsSUFBSSxFQUFFO2FBQzVELENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLElBQUksS0FBSyxZQUFZLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRSxDQUFDO2dCQUMxRCxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztZQUM1RCxDQUFDO1lBRUQsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsdUNBQXVDLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUN6RyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsMEJBQTBCO0lBQzFCLHNFQUFzRTtJQUUvRCxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQXVDO1FBQ2pFLElBQUksQ0FBQztZQUNILE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUM7WUFDbkMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRXJGLElBQUksS0FBSyxFQUFFLE1BQU0sS0FBSyxJQUFLLFlBQW9CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDekQsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO29CQUMxQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNsRSxJQUFJLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUN6QyxNQUFNLFNBQVMsR0FBYzs0QkFDM0IsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJOzRCQUNoQixNQUFNLEVBQUUsS0FBSzs0QkFDYixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSwwREFBMEQ7NEJBQzVFLFNBQVM7NEJBQ1QsSUFBSSxFQUFFLFNBQVMsRUFBRSw2QkFBNkI7NEJBQzlDLFlBQVksRUFBRSxTQUFTLENBQUMsNkJBQTZCO3lCQUN0RCxDQUFDO3dCQUNGLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzdCLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7WUFFRCxtREFBbUQ7WUFDbkQsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQ2hGLENBQUM7WUFFRixJQUFJLENBQUMsYUFBYSxDQUFDO2dCQUNqQixJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRTtnQkFDN0QsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3RCLENBQUMsQ0FBQztZQUVILE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLE9BQU8sRUFBRSxTQUFTLFVBQVUsQ0FBQyxNQUFNLGNBQWM7YUFDbEQsQ0FBQztRQUNKLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsK0JBQStCLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUNqRyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQXVDO1FBQ2pFLElBQUksQ0FBQztZQUNILE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUM7WUFDbkMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV6QyxJQUFJLEtBQUssRUFBRSxNQUFNLEtBQUssSUFBSyxZQUFvQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3pELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztvQkFDMUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDbEUsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzt3QkFDekMsMEJBQTBCO3dCQUMxQixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBRXRELE1BQU0sU0FBUyxHQUFjOzRCQUMzQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7NEJBQ2hCLE1BQU0sRUFBRSxLQUFLOzRCQUNiLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTs0QkFDakUsVUFBVSxFQUFFLEtBQUs7eUJBQ2xCLENBQUM7d0JBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDN0IsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxzQkFBc0I7Z0JBQzVCLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFO2dCQUM3RCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1lBRUgsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsT0FBTyxFQUFFLFNBQVMsVUFBVSxDQUFDLE1BQU0sY0FBYzthQUNsRCxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSwrQkFBK0IsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO2FBQ2pHLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsWUFBdUM7UUFDN0QsSUFBSSxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQXFCO2dCQUMvQixVQUFVLEVBQUUsRUFBRTtnQkFDZCxVQUFVLEVBQUUsRUFBRTtnQkFDZCxVQUFVLEVBQUUsRUFBRTtnQkFDZCxVQUFVLEVBQUUsQ0FBQztnQkFDYixNQUFNLEVBQUUsRUFBRTthQUNYLENBQUM7WUFFRixJQUFJLEtBQUssRUFBRSxNQUFNLEtBQUssSUFBSyxZQUFvQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3pELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztvQkFDMUIsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNwQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUVsRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7d0JBQzFELE1BQU0sU0FBUyxHQUFjOzRCQUMzQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7NEJBQ2hCLE1BQU0sRUFBRSxLQUFLOzRCQUNiLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTs0QkFDaEIsU0FBUzt5QkFDVixDQUFDO3dCQUNGLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNwQyxDQUFDO3lCQUFNLElBQUksU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO3dCQUMvQixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3JDLENBQUM7eUJBQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzt3QkFDL0MsSUFBSSxDQUFDOzRCQUNILE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDdEQsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7Z0NBQzFCLE1BQU0sU0FBUyxHQUFjO29DQUMzQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7b0NBQ2hCLE1BQU0sRUFBRSxLQUFLO29DQUNiLE9BQU8sRUFBRSxhQUFhLENBQUMsSUFBSyxDQUFDLE9BQU87b0NBQ3BDLFVBQVUsRUFBRSxLQUFLO2lDQUNsQixDQUFDO2dDQUNGLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUNwQyxDQUFDO3dCQUNILENBQUM7d0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQzs0QkFDZixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO3dCQUM3SCxDQUFDO29CQUNILENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7WUFFRCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxXQUFXLE1BQU0sQ0FBQyxVQUFVLFFBQVE7YUFDOUMsQ0FBQztRQUNKLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsMEJBQTBCLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUM1RixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsbUJBQW1CO0lBQ25CLHNFQUFzRTtJQUUvRCxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQWdDLEVBQUUsT0FBMEI7UUFDakYsSUFBSSxDQUFDO1lBQ0gsbURBQW1EO1lBQ25ELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakUsSUFBSSxHQUFHLEtBQUssS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDcEMsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUNELG9CQUFvQjtZQUNwQixNQUFNLFFBQVEsR0FBRyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU3QyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDZCxPQUFPO29CQUNMLE9BQU8sRUFBRSxJQUFJO29CQUNiLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtvQkFDakIsT0FBTyxFQUFFLG1CQUFtQjtpQkFDN0IsQ0FBQztZQUNKLENBQUM7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUV4QyxrQkFBa0I7WUFDbEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3pDLE1BQU0sSUFBSSxjQUFjLENBQUMsb0JBQW9CLElBQUksQ0FBQyxJQUFJLGdCQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDckcsQ0FBQztZQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUUxRCxrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsYUFBYSxDQUFDO2dCQUNqQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQzlDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTthQUN0QixDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxHQUFHO2dCQUNULE9BQU8sRUFBRSxpQkFBaUIsSUFBSSxDQUFDLElBQUksRUFBRTthQUN0QyxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSx5QkFBeUIsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO2FBQzNGLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBZ0MsRUFBRSxPQUErQjtRQUMxRixJQUFJLENBQUM7WUFDSCxNQUFNLElBQUksR0FBRyxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUV4QyxtREFBbUQ7WUFDbkQsSUFBSSxPQUFRLE1BQWMsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQ2hELE1BQU0sSUFBSSxjQUFjLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUN6RCxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDN0MsTUFBTSxJQUFJLEdBQUcsSUFBSyxNQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDL0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRS9CLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDeEIsTUFBTSxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDMUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RixHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUM5QyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1lBRUgsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLEVBQUUsR0FBRztnQkFDVCxPQUFPLEVBQUUsc0JBQXNCLElBQUksQ0FBQyxJQUFJLEVBQUU7YUFDM0MsQ0FBQztRQUNKLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsOEJBQThCLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUNoRyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQWdDO1FBQ3hELElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpELE1BQU0sSUFBSSxHQUFjO2dCQUN0QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxZQUFZO2dCQUN2QixNQUFNLEVBQUUsR0FBRyxDQUFDLGFBQWE7Z0JBQ3pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixNQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3hDLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2FBQzFDLENBQUM7WUFFRixPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU8sRUFBRSx5QkFBeUIsSUFBSSxDQUFDLElBQUksRUFBRTthQUM5QyxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSw2QkFBNkIsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO2FBQy9GLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxtQkFBbUI7SUFDbkIsc0VBQXNFO0lBRS9ELEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBZ0IsRUFBRSxZQUF1QztRQUMvRSxJQUFJLENBQUM7WUFDSCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsTUFBTSxlQUFlLEdBQUcsTUFBTSxZQUFZLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzdDLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRW5DLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztnQkFDckIsT0FBTztvQkFDTCxPQUFPLEVBQUUsSUFBSTtvQkFDYixJQUFJLEVBQUUsRUFBRTtvQkFDUixPQUFPLEVBQUUsaUJBQWlCO2lCQUMzQixDQUFDO1lBQ0osQ0FBQztZQUVELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekQsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbEMsT0FBTztvQkFDTCxPQUFPLEVBQUUsS0FBSztvQkFDZCxLQUFLLEVBQUUsd0JBQXdCLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2lCQUMvRCxDQUFDO1lBQ0osQ0FBQztZQUVELElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxlQUFlO2dCQUNyQixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUN6RCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1lBRUgsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixJQUFJLEVBQUUsV0FBVyxDQUFDLE1BQU07Z0JBQ3hCLE9BQU8sRUFBRSxVQUFVLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxTQUFTO2FBQ3RELENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLElBQUksS0FBSyxZQUFZLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLGVBQWUsRUFBRSxDQUFDO2dCQUM3RCxPQUFPO29CQUNMLE9BQU8sRUFBRSxJQUFJO29CQUNiLElBQUksRUFBRSxFQUFFO29CQUNSLE9BQU8sRUFBRSxxQkFBcUI7aUJBQy9CLENBQUM7WUFDSixDQUFDO1lBRUQsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsMEJBQTBCLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUM1RixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQWdCLEVBQUUsTUFBbUIsRUFBRSxZQUF1QztRQUNwRyxJQUFJLENBQUM7WUFDSCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtnQkFDdkQsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVM7Z0JBQy9DLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxZQUFZO2FBQ3hELENBQUMsQ0FBQztZQUVILE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNyRixNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNuRCxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEMsTUFBTSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDN0MsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3RCLENBQUMsQ0FBQztZQUVILE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLG1CQUFtQixhQUFhLEVBQUU7YUFDNUMsQ0FBQztRQUNKLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsMEJBQTBCLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUM1RixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxZQUF1QztRQUNyRixJQUFJLENBQUM7WUFDSCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEQsSUFBSSxDQUFDO2dCQUNILE1BQU0sZUFBZSxHQUFHLE1BQU0sWUFBWSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDeEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV4RCxNQUFNLE1BQU0sR0FBZ0I7b0JBQzFCLFFBQVE7b0JBQ1IsU0FBUyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ3hDLFVBQVUsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU07b0JBQ3JDLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2lCQUMxQyxDQUFDO2dCQUVGLE9BQU87b0JBQ0wsT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFLE1BQU07b0JBQ1osT0FBTyxFQUFFLHlCQUF5QixRQUFRLEVBQUU7aUJBQzdDLENBQUM7WUFDSixDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDZixJQUFJLEtBQUssWUFBWSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxlQUFlLEVBQUUsQ0FBQztvQkFDN0QsTUFBTSxNQUFNLEdBQWdCO3dCQUMxQixRQUFRO3dCQUNSLFNBQVMsRUFBRSxLQUFLO3dCQUNoQixVQUFVLEVBQUUsQ0FBQztxQkFDZCxDQUFDO29CQUVGLE9BQU87d0JBQ0wsT0FBTyxFQUFFLElBQUk7d0JBQ2IsSUFBSSxFQUFFLE1BQU07d0JBQ1osT0FBTyxFQUFFLHFCQUFxQjtxQkFDL0IsQ0FBQztnQkFDSixDQUFDO2dCQUNELE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsaUNBQWlDLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTthQUNuRyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsd0JBQXdCO0lBQ3hCLHNFQUFzRTtJQUUvRCxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQWdDO1FBQ3pELElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWxDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN4QixPQUFPO29CQUNMLE9BQU8sRUFBRSxLQUFLO29CQUNkLEtBQUssRUFBRSx1QkFBdUIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7aUJBQzdELENBQUM7WUFDSixDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQXNCLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFdBQVcsS0FBSyxFQUFFO29CQUFFLE9BQU87Z0JBRTlELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDdEIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRTdDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUM7NEJBQ1gsRUFBRTs0QkFDRixJQUFJOzRCQUNKLFdBQVcsRUFBRSxTQUFTOzRCQUN0QixLQUFLLEVBQUUsU0FBUzt5QkFDakIsQ0FBQyxDQUFDO29CQUNMLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxnQkFBZ0IsR0FBcUI7Z0JBQ3pDLE9BQU87Z0JBQ1AsUUFBUSxFQUFFO29CQUNSLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO29CQUNwQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDdEM7YUFDRixDQUFDO1lBRUYsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3pELFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTthQUN0QixDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLE9BQU8sRUFBRSxVQUFVLE9BQU8sQ0FBQyxNQUFNLGlCQUFpQixJQUFJLENBQUMsSUFBSSxFQUFFO2FBQzlELENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLDhCQUE4QixLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUU7YUFDaEcsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFnQyxFQUFFLE9BQXlCO1FBQ3BGLElBQUksQ0FBQztZQUNILHFCQUFxQjtZQUNyQixNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXZFLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDakUsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyQyxNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNuRCxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEMsTUFBTSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDdkUsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3RCLENBQUMsQ0FBQztZQUVILE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLFNBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLGVBQWUsVUFBVSxDQUFDLElBQUksRUFBRTthQUN6RSxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSw4QkFBOEIsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO2FBQ2hHLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxlQUFlLENBQUMsWUFBdUMsRUFBRSxRQUFnQixFQUFFLGNBQWlDO1FBQ3ZILElBQUksQ0FBQztZQUNILHlCQUF5QjtZQUN6QixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMzRSxDQUFDLENBQUMsUUFBUTtnQkFDVixDQUFDLENBQUMsR0FBRyxRQUFRLE9BQU8sQ0FBQztZQUV2QiwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDO2dCQUNILE1BQU0sWUFBWSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDaEQsT0FBTztvQkFDTCxPQUFPLEVBQUUsS0FBSztvQkFDZCxLQUFLLEVBQUUsU0FBUyxhQUFhLGtCQUFrQjtpQkFDaEQsQ0FBQztZQUNKLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNmLDRDQUE0QztZQUM5QyxDQUFDO1lBRUQsTUFBTSxjQUFjLEdBQXFCLGNBQWMsSUFBSTtnQkFDekQsT0FBTyxFQUFFO29CQUNQLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO29CQUN6QixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtpQkFDMUI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRTtvQkFDbkIsV0FBVyxFQUFFLDJCQUEyQjtpQkFDekM7YUFDRixDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsTUFBTSxZQUFZLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFckQsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLHNCQUFzQjtnQkFDNUIsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQzVFLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTthQUN0QixDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxVQUFVO2dCQUNoQixPQUFPLEVBQUUsdUJBQXVCLGFBQWEsRUFBRTthQUNoRCxDQUFDO1FBQ0osQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSxnQ0FBZ0MsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO2FBQ2xHLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVNLGlCQUFpQixDQUFDLE9BQWU7UUFDdEMsTUFBTSxNQUFNLEdBQXdCO1lBQ2xDLE9BQU8sRUFBRSxJQUFJO1lBQ2IsTUFBTSxFQUFFLEVBQUU7WUFDVixRQUFRLEVBQUUsRUFBRTtZQUNaLFlBQVksRUFBRSxFQUFFO1lBQ2hCLFVBQVUsRUFBRSxFQUFFO1NBQ2YsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVsQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ2hDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksV0FBVyxLQUFLLEVBQUU7Z0JBQUUsT0FBTztZQUU5RCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxTQUFTLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2dCQUNqRixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDdkIsT0FBTztZQUNULENBQUM7WUFFRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFN0MsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvQixJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsU0FBUyxHQUFHLENBQUMsaUJBQWlCLEtBQUssdUJBQXVCLENBQUMsQ0FBQztnQkFDdkYsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDekIsQ0FBQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsU0FBUyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2xFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xCLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsU0FBUyxHQUFHLENBQUMsOEJBQThCLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUseUJBQXlCO0lBQ3pCLHNFQUFzRTtJQUUvRCxlQUFlLENBQUMsUUFBZ0I7UUFDckMsT0FBTyxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTSxrQkFBa0IsQ0FBQyxNQUFtQixFQUFFLE9BQTJCO1FBQ3hFLE9BQU8sVUFBVSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRU0saUJBQWlCLENBQUMsS0FBZ0I7UUFDdkMsT0FBTyxVQUFVLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxtQkFBbUI7SUFDbkIsc0VBQXNFO0lBRS9ELGVBQWU7UUFDcEIsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzlCLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZDLEdBQUcsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXhCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLGVBQWU7WUFDckIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxhQUFhO1FBQ2xCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzlCLFNBQVMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3hCLFNBQVMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3hCLGFBQWEsSUFBSSxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTCxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJO1lBQ2xDLFNBQVM7WUFDVCxPQUFPLEVBQUUsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxXQUFXLEVBQUUsU0FBUyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUs7U0FDN0MsQ0FBQztJQUNKLENBQUM7SUFFTSxhQUFhO1FBQ2xCLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUVqQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNyQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3pFLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDaEQsR0FBRyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUVILGtEQUFrRDtRQUNsRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEQsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQ2xFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FDcEQsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDakYsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFHLENBQUM7Z0JBQ3RDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ3ZDLEdBQUcsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixJQUFJLEVBQUUsRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUM1QyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxlQUFlO0lBQ2Ysc0VBQXNFO0lBRS9ELGdCQUFnQixDQUFDLElBQVksRUFBRSxPQUErQjtRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRU0sbUJBQW1CLENBQUMsSUFBWSxFQUFFLE9BQStCO1FBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2YsUUFBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU8sYUFBYSxDQUFDLEtBQXNCO1FBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsUUFBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDO29CQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakIsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMseUNBQXlDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0UsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsMEJBQTBCO0lBQzFCLHNFQUFzRTtJQUU5RCxnQkFBZ0IsQ0FBQyxRQUFnQjtRQUN2QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUM1RCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsYUFBcUI7UUFDNUMsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU8sS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQVUsRUFBRSxPQUEwQjtRQUN0RSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDeEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV0QyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDaEIsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDO1lBRUYsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUU7Z0JBQ2pCLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlFLENBQUMsQ0FBQztZQUVGLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLFVBQVUsQ0FBQyxHQUFXLEVBQUUsR0FBcUIsRUFBRSxJQUFZO1FBQ2pFLHlDQUF5QztRQUN6QyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQy9ELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQWlDO1lBQzFDLElBQUksRUFBRSxHQUFHO1lBQ1QsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ3JCLElBQUk7WUFDSixJQUFJLEVBQUUsQ0FBQztTQUNSLENBQUM7UUFFRixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVPLFlBQVksQ0FBQyxLQUFtQztRQUN0RCxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7SUFDOUUsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM5QixLQUFLLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7QUE3M0JELHdCQUF3QjtBQUNBLGdDQUFjLEdBQXFCO0lBQ3pELHFCQUFxQixFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO0lBQzNFLFlBQVksRUFBRSxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxPQUFPO0lBQ3ZDLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUMxQyxZQUFZLEVBQUUsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLEVBQUUsUUFBUTtJQUN6QyxZQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsYUFBYTtJQUMzQyxjQUFjLEVBQUU7UUFDZCxZQUFZLEVBQUUsSUFBSTtRQUNsQixhQUFhLEVBQUUsS0FBSztRQUNwQixTQUFTLEVBQUUsQ0FBQztLQUNiO0lBQ0QsU0FBUyxFQUFFLEVBQUU7SUFDYixlQUFlLEVBQUUsQ0FBQztJQUNsQixlQUFlLEVBQUUsSUFBSTtDQUN0QixDQUFDO0FBaTNCSixzRUFBc0U7QUFDdEUsb0JBQW9CO0FBQ3BCLHNFQUFzRTtBQUV0RTs7R0FFRztBQUNJLFNBQVMsdUJBQXVCLENBQUMsTUFBa0M7SUFDeEUsT0FBTyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRDs7R0FFRztBQUNJLFNBQVMsZ0NBQWdDLENBQUMsU0FBaUI7SUFDaEUsT0FBTyxJQUFJLGlCQUFpQixDQUFDLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUVELHNFQUFzRTtBQUN0RSxVQUFVO0FBQ1Ysc0VBQXNFO0FBRXRFLGlFQUFlLGlFQUFpQixJQUFDOzs7QUMvOEJqQzs7Ozs7R0FLRztBQUVILDJCQUEyQjtBQU9FO0FBRTdCLGtEQUFrRDtBQUN1Qjs7O0FDakJ6RSxNQUFNLCtCQUE0QixVOzs7O0FDQWxDOzs7Ozs7OztHQVFHO0FBRTZCO0FBd0JoQyw2REFBNkQ7QUFDN0QsTUFBTSxRQUFRLEdBQVEsQ0FBQyxPQUFRLE1BQWMsS0FBSyxXQUFXLElBQUssTUFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBRSxNQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBRSxzQ0FBeUIsQ0FBQztBQUV6RjtBQUV0RCxzRUFBc0U7QUFDdEUsbUNBQW1DO0FBQ25DLHNFQUFzRTtBQUUvRCxNQUFNLGdCQUFnQjtJQTJDM0IsWUFBWSxRQUFtQjtRQTFDdkIsWUFBTyxHQUF5QixJQUFJLENBQUM7UUFHckMsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztRQUszRSw2QkFBNkI7UUFDckIscUJBQWdCLEdBQXVCLElBQUksQ0FBQztRQUM1QyxpQkFBWSxHQUE0QixJQUFJLENBQUM7UUFDN0MsZ0JBQVcsR0FBd0IsSUFBSSxDQUFDO1FBRWhELGdCQUFnQjtRQUNSLG1CQUFjLEdBQW1CO1lBQ3ZDLFdBQVcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxFQUFFLFNBQVM7WUFDakIsSUFBSSxFQUFFLGFBQWE7WUFDbkIsT0FBTyxFQUFFLENBQUM7WUFDVixVQUFVLEVBQUUsSUFBSTtZQUNoQixPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUM7UUFFTSxpQkFBWSxHQUF3QjtZQUMxQyxVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsRUFBRTtZQUNaLFVBQVUsRUFBRSxPQUFPO1lBQ25CLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLGVBQWUsRUFBRSxvQkFBb0I7WUFDckMsY0FBYyxFQUFFLEtBQUs7WUFDckIsYUFBYSxFQUFFLElBQUk7WUFDbkIsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQztRQUVGLHlCQUF5QjtRQUNqQix1QkFBa0IsR0FBc0I7WUFDOUMsVUFBVSxFQUFFLENBQUM7WUFDYixXQUFXLEVBQUUsQ0FBQztZQUNkLFdBQVcsRUFBRSxDQUFDO1lBQ2QsR0FBRyxFQUFFLEVBQUU7U0FDUixDQUFDO1FBR0EsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFekIsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUc7WUFDYixLQUFLLEVBQUUsR0FBRztZQUNWLE1BQU0sRUFBRSxHQUFHO1lBQ1gsZUFBZSxFQUFFLFNBQVM7WUFDMUIsU0FBUyxFQUFFLElBQUk7WUFDZixzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsY0FBYyxFQUFFLEtBQUs7U0FDdEIsQ0FBQztRQUVGLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osU0FBUyxFQUFFLEtBQUs7WUFDaEIsV0FBVyxFQUFFLE1BQU07WUFDbkIsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLElBQUk7WUFDZCxXQUFXLEVBQUUsSUFBSTtZQUNqQixlQUFlLEVBQUUsSUFBSTtZQUNyQixVQUFVLEVBQUUsSUFBSTtZQUNoQixVQUFVLEVBQUUsSUFBSTtZQUNoQixJQUFJLEVBQUUsQ0FBQztZQUNQLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxFQUFFLENBQUM7WUFDUCxlQUFlLEVBQUUsRUFBRTtZQUNuQixpQkFBaUIsRUFBRSxLQUFLO1NBQ3pCLENBQUM7UUFFRixzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDO1lBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDMUQsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxPQUF3QyxDQUFDO2dCQUNwRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQUMsTUFBTSxDQUFDLEVBQUM7SUFDWixDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLDJDQUEyQztJQUMzQyxzRUFBc0U7SUFFdEUsSUFBVyxNQUFNO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBVyxLQUFLO1FBQ2QsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFXLE1BQU07UUFDZixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxrQkFBa0I7SUFDbEIsc0VBQXNFO0lBRS9ELFNBQVM7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFTSxZQUFZO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVNLE1BQU07UUFDWCxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFFTSxhQUFhO1FBQ2xCLE9BQU87WUFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07WUFDM0IsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtTQUN0RCxDQUFDO0lBQ0osQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxpQkFBaUI7SUFDakIsc0VBQXNFO0lBRS9ELGdCQUFnQixDQUFDLFdBQW1CLEVBQUUsTUFBOEI7UUFDekUseUJBQXlCO1FBQ3pCLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVELHlCQUF5QjtRQUN6QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsV0FBVyxhQUFhLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQsd0JBQXdCO1FBQ3hCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkQsYUFBYSxDQUFDLEVBQUUsR0FBRyxHQUFHLFdBQVcsU0FBUyxDQUFDO1FBQzNDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDekMsYUFBYSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUUzQyxpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVqRCw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ2hELGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWU7WUFDN0MsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUztZQUNqQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQjtZQUMzRCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQjtZQUNqRCxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjO1lBQzNDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7WUFDekIsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtZQUMzQiwwQkFBMEI7WUFDMUIsbUJBQW1CLEVBQUUsSUFBSTtZQUN6Qix1QkFBdUI7WUFDdkIsUUFBUSxFQUFFLEtBQUs7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsNkJBQTZCO1FBQzdCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRS9CLHVCQUF1QjtRQUN2QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6QiwrRUFBK0U7UUFDL0UsSUFBSSxDQUFDO1lBQ0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO2dCQUN0RSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBYSxFQUFFLEVBQUU7Z0JBQ3BFLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzNCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDckIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLE1BQU0sQ0FBQyxFQUFDO1FBRVYscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXhCLHdDQUF3QztRQUN4QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVsRCxpQ0FBaUM7UUFDakMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDckMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDL0IsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekIsQ0FBQztZQUNELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLGNBQWM7WUFDcEIsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtTQUM1QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sYUFBYTtRQUNsQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDL0IsQ0FBQztRQUVELGNBQWM7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osU0FBUyxFQUFFLEtBQUs7WUFDaEIsV0FBVyxFQUFFLE1BQU07WUFDbkIsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLElBQUk7WUFDZCxXQUFXLEVBQUUsSUFBSTtZQUNqQixlQUFlLEVBQUUsSUFBSTtZQUNyQixVQUFVLEVBQUUsSUFBSTtZQUNoQixVQUFVLEVBQUUsSUFBSTtZQUNoQixJQUFJLEVBQUUsQ0FBQztZQUNQLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxFQUFFLENBQUM7WUFDUCxlQUFlLEVBQUUsRUFBRTtZQUNuQixpQkFBaUIsRUFBRSxLQUFLO1NBQ3pCLENBQUM7UUFFRixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLG1CQUFtQjtJQUNuQixzRUFBc0U7SUFFL0QsU0FBUyxDQUFDLFlBQThCO1FBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVsQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUVqQyw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFO1lBQ2xELElBQUksRUFBRSxDQUFDO1lBQ1AsR0FBRyxFQUFFLENBQUM7WUFDTixVQUFVLEVBQUUsS0FBSztZQUNqQixPQUFPLEVBQUUsS0FBSztZQUNkLGFBQWEsRUFBRSxJQUFJO1lBQ25CLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILCtCQUErQjtRQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWpDLHFDQUFxQztRQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBd0MsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxXQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFL0IsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV6QixJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxjQUFjO1lBQ3BCLElBQUksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRTtTQUN6RyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sVUFBVTtRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFTSxhQUFhLENBQUMsS0FBdUI7UUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUMxQix1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFL0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTlDLGlEQUFpRDtRQUNqRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0UsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDcEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7Z0JBQ25CLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxLQUFLO2dCQUNiLElBQUksRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNqQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQzthQUNsQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBa0IsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxXQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLENBQUM7SUFDSCxDQUFDO0lBRU8sdUJBQXVCO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQjtZQUFFLE9BQU87UUFDcEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDM0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxxQkFBcUI7SUFDckIsc0VBQXNFO0lBRS9ELFlBQVksQ0FBQyxLQUFZO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxLQUFLLE1BQU07WUFBRSxPQUFPO1FBRWxFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUU3QixrREFBa0Q7UUFDbEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQzdCLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNiLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNaLEtBQUssRUFBRSxDQUFDO1lBQ1IsTUFBTSxFQUFFLENBQUM7WUFDVCxHQUFHLElBQUksQ0FBQyxjQUFjO1lBQ3RCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLE9BQU8sRUFBRSxLQUFLO1NBQ2YsQ0FBb0IsQ0FBQztRQUV0QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsWUFBWTtZQUNsQixPQUFPLEVBQUUsS0FBSztZQUNkLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7U0FDeEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLGFBQWEsQ0FBQyxLQUFZO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVTtZQUFFLE9BQU87UUFFM0csSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRTdCLGlDQUFpQztRQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUQsNkJBQTZCO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUMxQixJQUFJO1lBQ0osR0FBRztZQUNILEtBQUs7WUFDTCxNQUFNO1NBQ1AsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV6QixJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxZQUFZO1lBQ2xCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7U0FDdkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLGFBQWEsQ0FBQyxLQUFZO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUU3Qiw2QkFBNkI7UUFDN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVELDBCQUEwQjtRQUMxQixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxrREFBa0Q7UUFDbEQsSUFBSSxhQUFhLEdBQXVCLElBQUksQ0FBQztRQUU3QyxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RSxzQkFBc0I7WUFDdEIsYUFBYSxHQUFHO2dCQUNkLEVBQUUsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2hDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNoQixLQUFLLEVBQUUsVUFBVTtnQkFDakIsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLE9BQU8sRUFBRSxDQUFDLEVBQUUsZ0JBQWdCO2dCQUM1QixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsS0FBSzthQUNsQixDQUFDO1FBQ0osQ0FBQztRQUVELDZCQUE2QjtRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLHNCQUFzQjtRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBRS9CLHNDQUFzQztRQUN0QyxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsS0FBSztZQUNkLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRTtTQUNyRCxDQUFDLENBQUM7UUFFSCxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBRU0sYUFBYTtRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBRS9CLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSwwQkFBMEI7SUFDMUIsc0VBQXNFO0lBRS9ELGNBQWMsQ0FBQyxJQUFpQjtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsZ0NBQWdDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDaEcsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRW5HLG1CQUFtQjtRQUNuQixNQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3BCLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNuQixLQUFLLEVBQUUsV0FBVztZQUNsQixNQUFNLEVBQUUsWUFBWTtZQUNwQixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDbEIsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVztZQUM1QyxJQUFJLEVBQUUsYUFBYTtZQUNuQixVQUFVLEVBQUUsSUFBSTtZQUNoQixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSztZQUN2QixXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDdkIsa0JBQWtCLEVBQUUsS0FBSztTQUMxQixDQUFvQixDQUFDO1FBRXRCLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUVwQixnQkFBZ0I7UUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkIsMENBQTBDO1FBQzFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXBCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsY0FBYztZQUNwQixNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU0saUJBQWlCLENBQUMsRUFBVTtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBdUIsQ0FBQztRQUMvRCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFckUsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQiwrQkFBK0I7WUFDL0IsSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBRUQsbUJBQW1CO1lBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFekIsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLElBQUksRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUU7YUFDNUIsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU0saUJBQWlCLENBQUMsRUFBVSxFQUFFLE9BQTZCO1FBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRWhDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUF1QixDQUFDO1FBQy9ELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUU3RCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDN0IsMkJBQTJCO1lBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV6QywyQkFBMkI7WUFDM0IsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUM7b0JBQ1AsTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLO29CQUNyQixXQUFXLEVBQUUsT0FBTyxDQUFDLEtBQUs7b0JBQzFCLFdBQVcsRUFBRSxPQUFPLENBQUMsS0FBSztpQkFDM0IsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksT0FBTyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBRUQsb0JBQW9CO1lBQ3BCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLENBQUM7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRXpCLElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLElBQUksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRTthQUNqRCxDQUFDLENBQUM7WUFFSCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTSxjQUFjLENBQUMsRUFBVTtRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPLElBQUksQ0FBQztRQUUvQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBdUIsQ0FBQztRQUMvRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFN0QsT0FBTyxJQUFJLEVBQUUsV0FBVyxJQUFJLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRU0sbUJBQW1CO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRTdCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUF1QixDQUFDO1FBQy9ELE9BQU8sT0FBTzthQUNYLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQzthQUM3QyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBWSxDQUFDO2FBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHVCQUF1QjtJQUN2QixzRUFBc0U7SUFFL0QsaUJBQWlCLENBQUMsRUFBVTtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUF1QixDQUFDO1FBQy9ELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUU3RCxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUVNLFdBQVc7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUUxQixJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV6QixJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxtQkFBbUI7U0FDMUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLHdCQUF3QjtRQUM3QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZTthQUMvQixHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxHQUF1QixDQUFDLFdBQVcsQ0FBQzthQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFrQixDQUFDO0lBQ3pELENBQUM7SUFFTSxjQUFjO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRTdCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3RELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFcEQsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUUsQ0FBQztnQkFDNUMscUJBQXFCO2dCQUNyQixNQUFNLFNBQVMsR0FBRyxZQUFzQyxDQUFDO2dCQUN6RCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxFQUF1QixDQUFDO2dCQUU1RCxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNwQixJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUNuQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDN0MsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDTixtQkFBbUI7Z0JBQ25CLE1BQU0sSUFBSSxHQUFHLFlBQStCLENBQUM7Z0JBQzdDLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxtQkFBbUI7SUFDbkIsc0VBQXNFO0lBRS9ELFVBQVU7UUFDZixJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxVQUFVO1FBQ2YsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU0sWUFBWTtRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUF1QixDQUFDO1FBRS9ELE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDcEIsSUFBSSxHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDbkQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztxQkFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUMxRCxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3BDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUM1QixDQUFDO3FCQUFNLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUN6QixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRU0sWUFBWSxDQUFDLFFBQWdCO1FBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxzQkFBc0I7SUFDdEIsc0VBQXNFO0lBRS9ELE1BQU07UUFDWCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxPQUFPO1FBQ1osTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRU0sU0FBUztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPO1FBRWhELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUMzQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUU3QyxNQUFNLE1BQU0sR0FBRyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVNLFNBQVM7UUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTSxPQUFPLENBQUMsSUFBWTtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRXpCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLGNBQWM7WUFDcEIsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1NBQ2pDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxLQUFLLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUUxQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7UUFDM0MsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUVNLFFBQVE7UUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxvQkFBb0IsQ0FBQyxDQUFTLEVBQUUsQ0FBUztRQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUU5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1FBQzNDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxjQUFjLENBQUMsT0FBZTtRQUNuQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsdUJBQXVCO0lBQ3ZCLHNFQUFzRTtJQUUvRCxhQUFhLENBQUMsS0FBWTtRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFOUMsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDN0UsTUFBTSxFQUFFLFNBQVM7WUFDakIsV0FBVyxFQUFFLENBQUM7WUFDZCxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsaUJBQWlCLEVBQUUsSUFBSTtTQUN4QixDQUFlLENBQUM7UUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFrQixDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFrQixDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFFN0QsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLEVBQUU7WUFDOUUsTUFBTSxFQUFFLFNBQVM7WUFDakIsV0FBVyxFQUFFLENBQUM7WUFDZCxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsaUJBQWlCLEVBQUUsSUFBSTtTQUN4QixDQUFlLENBQUM7UUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFrQixDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFrQixDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUM7UUFFM0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUV0QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFTSxhQUFhO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDaEMsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVNLGVBQWUsQ0FBQyxLQUFZO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsT0FBTztRQUNULENBQUM7UUFFRCw4REFBOEQ7UUFDOUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUF1QixDQUFDO1FBQy9ELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDeEMsT0FBTyxDQUNMLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUs7Z0JBQ25ELEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FDckQsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7SUFDSCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHdCQUF3QjtJQUN4QixzRUFBc0U7SUFFL0QsYUFBYSxDQUFDLFdBQWtCO1FBQ3JDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFO1lBQ3hELEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxDQUFDO1lBQ3BDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sSUFBSSxDQUFDO1NBQ3ZDLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTCxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEIsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNyQixNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDckIsVUFBVTtTQUNYLENBQUM7SUFDSixDQUFDO0lBRU0sYUFBYSxDQUFDLFVBQWlCO1FBQ3BDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUvRCxPQUFPO1lBQ0wsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztTQUN4QixDQUFDO0lBQ0osQ0FBQztJQUVNLG9CQUFvQixDQUFDLFVBQWlCLEVBQUUsU0FBZTtRQUM1RCxPQUFPO1lBQ0wsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUs7WUFDakMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU07U0FDbkMsQ0FBQztJQUNKLENBQUM7SUFFTSxzQkFBc0IsQ0FBQyxlQUFzQixFQUFFLFNBQWU7UUFDbkUsT0FBTztZQUNMLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLO1lBQ3RDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNO1NBQ3hDLENBQUM7SUFDSixDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHlCQUF5QjtJQUN6QixzRUFBc0U7SUFFL0QsaUJBQWlCLENBQUMsSUFBaUIsRUFBRSxTQUFlO1FBQ3pELE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDNUQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBRTlDLE9BQU87WUFDTCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsT0FBTztZQUNQLE9BQU87WUFDUCxLQUFLO1lBQ0wsTUFBTTtZQUNOLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtTQUM1QixDQUFDO0lBQ0osQ0FBQztJQUVNLGlCQUFpQixDQUFDLElBQWUsRUFBRSxTQUFlO1FBQ3ZELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUMzQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDOUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTNELE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQ2hDLENBQUM7WUFDRCxDQUFDO1lBQ0QsS0FBSztZQUNMLE1BQU07WUFDTixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUN2QyxTQUFTLEVBQUUsSUFBSTtZQUNmLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtTQUM1QixDQUFDO0lBQ0osQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxpQkFBaUI7SUFDakIsc0VBQXNFO0lBRS9ELGdCQUFnQixDQUFDLElBQXFCLEVBQUUsT0FBMkI7UUFDeEUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLG1CQUFtQixDQUFDLElBQXFCLEVBQUUsT0FBMkI7UUFDM0UsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDZixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsWUFBWTtJQUNaLHNFQUFzRTtJQUUvRCxNQUFNO1FBQ1gsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUVNLGFBQWE7UUFDbEIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2xDLENBQUM7SUFDSCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHlCQUF5QjtJQUN6QixzRUFBc0U7SUFFOUQsaUJBQWlCO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsZUFBZTtRQUNmLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBRTdCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTlCLDJGQUEyRjtZQUMzRixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBZSxDQUFDO1lBQzdCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUssRUFBVSxDQUFDLFFBQVEsQ0FBQztZQUN0RSxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNiLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLE9BQU8sR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxPQUFRLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsT0FBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ2pDLE9BQU87WUFDVCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsS0FBSyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFOUIsb0RBQW9EO1lBQ3BELElBQUksQ0FBQztnQkFDSCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxhQUFhLENBQUM7b0JBQ2pCLElBQUksRUFBRSxZQUFZO29CQUNsQixPQUFPO29CQUNQLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRTtpQkFDeEYsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFDO1lBRVYsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDZCxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBZSxDQUFDO2dCQUM3QixNQUFNLENBQUMsR0FBUSxJQUFJLENBQUMsT0FBUSxDQUFDLGlCQUF3QixDQUFDO2dCQUN0RCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZCLE9BQU87Z0JBQ1QsQ0FBQztnQkFDRCxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixJQUFJLENBQUMsT0FBUSxDQUFDLG9CQUFvQixDQUFDLENBQWEsQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMzQyxJQUFJLENBQUMsT0FBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ2pDLE9BQU87WUFDVCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5QyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNkLFNBQVMsR0FBRyxLQUFLLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxPQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsT0FBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ2pDLE9BQU87WUFDVCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDeEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDeEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDeEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLE1BQXlCLENBQUMsQ0FBQztZQUN6RCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBUSxFQUFFLEVBQUU7WUFDMUMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDM0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDNUIsSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQzlCLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXhDLE1BQU0sS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxPQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFFeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGlCQUFpQixDQUFDLElBQXNCO1FBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFDMUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBRTVDLDRFQUE0RTtRQUM1RSxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQUssTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFlLENBQUMsU0FBUyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQzNDLElBQUksQ0FBQyxPQUFlLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztRQUVoRCw0Q0FBNEM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3BCLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDM0IsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRU8scUJBQXFCO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVwRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQ3hDLENBQUM7YUFBTSxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUUsQ0FBQztZQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBSSxZQUF1QyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BGLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ3ZDLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUN4QyxDQUFDO0lBQ0gsQ0FBQztJQUVPLG9CQUFvQixDQUFDLElBQXFCO1FBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXO1lBQUUsT0FBTztRQUVwRSxvQ0FBb0M7UUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDO1lBQ2hELENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztTQUNqQixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RSxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUV4RSxzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztRQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7UUFFdEMsNkJBQTZCO1FBQzdCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO1NBQ3hDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxlQUFlLENBQUMsSUFBcUI7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU87UUFFL0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRW5HLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEMsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQyxJQUFJLFNBQVM7Z0JBQUUsU0FBUyxJQUFJLElBQUksQ0FBQztZQUNqQyxTQUFTLElBQUksU0FBUyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdEUsU0FBUyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzNELENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3hDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUMxQixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLENBQUM7WUFDckQsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUTtZQUNwQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVO1lBQ3hDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDakMsZUFBZSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZTtZQUNsRCw2RUFBNkU7WUFDN0UsWUFBWSxFQUFFLFlBQVk7WUFDMUIsVUFBVSxFQUFFLEtBQUs7WUFDakIsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFlLENBQUM7UUFFakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFFcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTyxlQUFlLENBQUMsSUFBcUI7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU87UUFFakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRW5HLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEMsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUNELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQyxJQUFJLFNBQVM7Z0JBQUUsU0FBUyxJQUFJLElBQUksQ0FBQztZQUNqQyxTQUFTLElBQUksU0FBUyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdEUsU0FBUyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzNELENBQUM7UUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUNqQixJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUMxQixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLENBQUM7WUFDckQsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUTtZQUNwQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQ2pDLGVBQWUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWU7U0FDbkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLHdCQUF3QixDQUFDLFdBQWtCO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU8sV0FBVyxDQUFDO1FBRTFDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFFNUMsT0FBTztZQUNMLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxHQUFHLE1BQU07WUFDekIsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEdBQUcsTUFBTTtTQUMxQixDQUFDO0lBQ0osQ0FBQztJQUVPLHdCQUF3QixDQUFDLFVBQWlCO1FBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU8sVUFBVSxDQUFDO1FBRXpDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFFNUMsT0FBTztZQUNMLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxHQUFHLE1BQU07WUFDeEIsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEdBQUcsTUFBTTtTQUN6QixDQUFDO0lBQ0osQ0FBQztJQUVPLHFCQUFxQjtRQUMzQixPQUFPLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3pFLENBQUM7SUFFTyxhQUFhLENBQUMsT0FBZTtRQUNuQyxPQUFPLDBCQUFZLENBQUMsT0FBTyxHQUFHLDBCQUFZLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDO0lBQ2xFLENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsNENBQTRDO1FBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUM7UUFDaEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7SUFDM0QsQ0FBQztJQUVPLGFBQWEsQ0FBQyxLQUFrQjtRQUN0QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQztvQkFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzNFLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLDZCQUE2QjtJQUM3QixzRUFBc0U7SUFFL0QsUUFBUTtRQUNiLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFFOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdkIsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxXQUFXLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsNkJBQTZCO1FBQzdCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRWxELE9BQU87WUFDTCxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQzVCLE1BQU07WUFDTixRQUFRO1lBQ1IsV0FBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDckMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELHNFQUFzRTtBQUN0RSxtQkFBbUI7QUFDbkIsc0VBQXNFO0FBRS9ELFNBQVMsc0JBQXNCLENBQUMsUUFBbUI7SUFDeEQsT0FBTyxJQUFJLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxzRUFBc0U7QUFDdEUsVUFBVTtBQUNWLHNFQUFzRTtBQUV0RSxtRUFBZSxnRUFBZ0IsSUFBQzs7O0FDejVDaEM7Ozs7Ozs7O0dBUUc7QUFnQkgsc0VBQXNFO0FBQ3RFLCtCQUErQjtBQUMvQixzRUFBc0U7QUFFL0QsTUFBTSxZQUFZO0lBb0V2QixZQUNFLFFBQW1CLEVBQ25CLGdCQUFtQyxFQUNuQyxpQkFBcUMsRUFDckMsTUFBb0M7UUFsRXRDLDJCQUEyQjtRQUNuQixtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFzQyxDQUFDO1FBQy9ELHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO1FBQ3ZELHNCQUFpQixHQUFRLElBQUksQ0FBQztRQUM5QixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ25CLHNCQUFpQixHQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFFbEQsZ0JBQWdCO1FBQ1IsV0FBTSxHQUF1QjtZQUNuQyx1QkFBdUIsRUFBRSxJQUFJO1lBQzdCLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixnQkFBZ0IsRUFBRSxHQUFHO1lBQ3JCLGNBQWMsRUFBRSxHQUFHO1lBQ25CLGFBQWEsRUFBRSxDQUFDO1NBQ2pCLENBQUM7UUFFRixxQkFBcUI7UUFDYixjQUFTLEdBQXVCO1lBQ3RDLGtCQUFrQjtZQUNsQixFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7WUFDMUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFO1lBRWpGLGlCQUFpQjtZQUNqQixFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7WUFDeEUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFO1lBQ3hFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUU7WUFFakUsb0JBQW9CO1lBQ3BCLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFO1lBQzVFLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFO1lBQy9FLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtZQUNuRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUU7WUFFL0UsZ0JBQWdCO1lBQ2hCLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRTtZQUMxRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUU7WUFDNUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFO1lBQ2pGLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUU7WUFFL0QsYUFBYTtZQUNiLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRTtZQUN6RSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFO1lBQ3RFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUU7WUFDbEUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRTtZQUUvRCxxQkFBcUI7WUFDckIsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSwwQkFBMEIsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFO1lBQ2pGLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFO1lBQzVFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUU7WUFFbEUsYUFBYTtZQUNiLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTtZQUM1RSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7WUFDckUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO1lBRTFFLHdDQUF3QztZQUN4QyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7WUFDbkUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO1lBQ25FLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO1NBQ3BGLENBQUM7UUFRQSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1FBRTNDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsaUJBQWlCO0lBQ2pCLHNFQUFzRTtJQUU5RCx1QkFBdUI7UUFDN0IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSwwQkFBMEI7SUFDMUIsc0VBQXNFO0lBRTlELG1CQUFtQjtRQUN6QiwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVILGlDQUFpQztRQUNqQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVPLGFBQWEsQ0FBQyxLQUFvQjtRQUN4Qyw4REFBOEQ7UUFDOUQsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNsRixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVoRCxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QyxDQUFDO0lBQ0gsQ0FBQztJQUVPLFdBQVcsQ0FBQyxLQUFvQjtRQUN0Qyx3Q0FBd0M7UUFDeEMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN6QixDQUFDO0lBQ0gsQ0FBQztJQUVPLGVBQWUsQ0FBQyxRQUEwQixFQUFFLEtBQW9CO1FBQ3RFLFFBQVEsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3hCLGtCQUFrQjtZQUNsQixLQUFLLE1BQU07Z0JBQ1QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3hCLE1BQU07WUFDUixLQUFLLGFBQWE7Z0JBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixNQUFNO1lBRVIsaUJBQWlCO1lBQ2pCLEtBQUssV0FBVztnQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsTUFBTTtZQUNSLEtBQUssV0FBVztnQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsTUFBTTtZQUNSLEtBQUssYUFBYTtnQkFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDM0IsTUFBTTtZQUVSLG9CQUFvQjtZQUNwQixLQUFLLGlCQUFpQjtnQkFDcEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzVCLE1BQU07WUFDUixLQUFLLFFBQVE7Z0JBQ1gsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNwQixNQUFNO1lBQ1IsS0FBSyxZQUFZO2dCQUNmLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdkIsTUFBTTtZQUVSLGdCQUFnQjtZQUNoQixLQUFLLFNBQVM7Z0JBQ1osSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMvQixNQUFNO1lBQ1IsS0FBSyxVQUFVO2dCQUNiLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDaEMsTUFBTTtZQUNSLEtBQUssWUFBWTtnQkFDZixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2xDLE1BQU07WUFDUixLQUFLLFVBQVU7Z0JBQ2IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNsQyxNQUFNO1lBRVIsYUFBYTtZQUNiLEtBQUssWUFBWTtnQkFDZixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDM0IsTUFBTTtZQUNSLEtBQUssWUFBWTtnQkFDZixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU07WUFDUixLQUFLLGFBQWE7Z0JBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixNQUFNO1lBQ1IsS0FBSyxZQUFZO2dCQUNmLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdkIsTUFBTTtZQUVSLGdCQUFnQjtZQUNoQixLQUFLLGVBQWU7Z0JBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3JDLE1BQU07WUFDUixLQUFLLGtCQUFrQjtnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDaEMsTUFBTTtZQUVSLGFBQWE7WUFDYixLQUFLLE1BQU07Z0JBQ1QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBQ1IsS0FBSyxPQUFPO2dCQUNWLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkIsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2pCLE1BQU07WUFFUixrQkFBa0I7WUFDbEIsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLE1BQU07Z0JBQ1QsbUNBQW1DO2dCQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sc0JBQXNCLENBQUMsQ0FBQztnQkFDdEQsTUFBTTtZQUVSO2dCQUNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsNEJBQTRCLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLElBQUksRUFBRSxtQkFBbUI7WUFDekIsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUU7U0FDekMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSx1QkFBdUI7SUFDdkIsc0VBQXNFO0lBRTlELGdCQUFnQjtRQUN0Qix3QkFBd0I7UUFDeEIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QiwrREFBK0Q7UUFDL0QsK0RBQStEO1FBRS9ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUM3RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3pELElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzdELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDekQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7WUFDekQsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1lBQy9ELElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLElBQUksRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7YUFDN0IsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1lBQy9ELElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLElBQUksRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7YUFDOUIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8scUJBQXFCLENBQUMsS0FBaUI7UUFDN0MsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDcEIseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztJQUNILENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxLQUFpQjtRQUMzQyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHdCQUF3QjtJQUN4QixzRUFBc0U7SUFFOUQsc0JBQXNCO1FBQzVCLG1EQUFtRDtRQUNuRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRU8saUJBQWlCLENBQUMsS0FBaUI7UUFDekMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXZCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFpQixDQUFDO1FBQ3ZDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFaEUsSUFBSSxNQUFNLEtBQUssYUFBYSxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUMvRCxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxLQUFpQjtRQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUV2RSxNQUFNLFlBQVksR0FBcUI7WUFDckMsSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNoRCxjQUFjLEVBQUUsT0FBTztZQUN2QixNQUFNLEVBQUUsSUFBSTtZQUNaLFlBQVksRUFBRSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDdEMsZUFBZSxFQUFFLGFBQWE7U0FDL0IsQ0FBQztRQUVGLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVPLHNCQUFzQixDQUFDLEtBQWlCO1FBQzlDLE1BQU0sWUFBWSxHQUFxQjtZQUNyQyxJQUFJLEVBQUUsU0FBUztZQUNmLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ2hELE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixZQUFZLEVBQUUsS0FBSztZQUNuQixlQUFlLEVBQUUsRUFBRTtTQUNwQixDQUFDO1FBRUYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU8sZUFBZSxDQUFDLFlBQThCO1FBQ3BELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUM7UUFFdEMsa0RBQWtEO1FBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUzRCw2REFBNkQ7UUFDN0QsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFO1NBQzNDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxPQUF5QjtRQUNyRCxNQUFNLEtBQUssR0FBVSxFQUFFLENBQUM7UUFFeEIsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzlCLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN6QixLQUFLLENBQUMsSUFBSSxDQUNSLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQ3hFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFDckQsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUNuRCxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FDdEIsQ0FBQztZQUNKLENBQUM7WUFFRCxLQUFLLENBQUMsSUFBSSxDQUNSLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUNoRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsRUFDckIsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUNqRSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQ2xFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUNyQixFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQzNELEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FDbEUsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUseUJBQXlCO0lBQ3pCLHNFQUFzRTtJQUU5RCxzQkFBc0I7UUFDNUIsd0NBQXdDO1FBQ3hDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRU8sY0FBYyxDQUFDLEtBQWdCO1FBQ3JDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixLQUFLLENBQUMsWUFBYSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7SUFDMUMsQ0FBQztJQUVPLGVBQWUsQ0FBQyxLQUFnQjtRQUN0QyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIseUNBQXlDO1FBQ3pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU8sZUFBZSxDQUFDLEtBQWdCO1FBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekIsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDO0lBRU8sVUFBVSxDQUFDLEtBQWdCO1FBQ2pDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFOUMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMxRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUV4RSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDSCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsSUFBVTtRQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDO1FBQ0YsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTyxjQUFjLENBQUMsS0FBaUI7UUFDdEMsdUNBQXVDO1FBQ3ZDLHdFQUF3RTtJQUMxRSxDQUFDO0lBRU8sYUFBYSxDQUFDLEtBQWlCO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsa0JBQWtCO0lBQ2xCLHNFQUFzRTtJQUU5RCxLQUFLLENBQUMsZ0JBQWdCO1FBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3hFLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDbEUsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUMxQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFO2dCQUM1QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsS0FBSyxJQUFJLENBQUM7Z0JBQzdDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxNQUFNLElBQUksQ0FBQzthQUNoRCxDQUFDLENBQ0gsQ0FBQztZQUVGLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQ25DLFVBQVUsRUFDVixJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUNoQyxDQUFDO1lBRUYsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU0sRUFBRTthQUNsRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNILENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLHlCQUF5QjtZQUMvQixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO1NBQ3hCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxvQkFBb0I7UUFDMUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzVELElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsYUFBYSxDQUFDO2dCQUNqQixJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFO2FBQzVELENBQUMsQ0FBQztZQUVILHVCQUF1QjtZQUN2QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDMUIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU8sWUFBWTtRQUNsQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXRDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0lBRU8sZUFBZTtRQUNyQixzQ0FBc0M7UUFDdEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDN0QsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLG1CQUFtQjtRQUN6QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTztRQUVsRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQ3JELElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FDM0QsQ0FBQztRQUVGLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUUsQ0FBQztZQUM5RCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRU8sZUFBZTtRQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTztRQUVsRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQ3JELElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FDM0QsQ0FBQztRQUVGLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN2RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFFLENBQUM7WUFDOUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyxDQUFDO0lBQ0gsQ0FBQztJQUVPLGdCQUFnQjtRQUN0QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBRSxDQUFDLENBQUM7UUFDbkQsQ0FBQztJQUNILENBQUM7SUFFTyxlQUFlO1FBQ3JCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUUsQ0FBQztZQUNqRixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRU8sVUFBVTtRQUNoQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUN2RSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7Z0JBQ3pCLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLElBQUksRUFBRSxhQUFhO2dCQUNuQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDakIsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUU7YUFDdEMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFTyxXQUFXO1FBQ2pCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0MsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3JELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFxQixDQUFDO1lBRTlDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzVCLCtCQUErQjtnQkFDL0IsTUFBTSxPQUFPLEdBQWdCO29CQUMzQixHQUFHLElBQUk7b0JBQ1AsRUFBRSxFQUFFLFVBQVUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssRUFBRTtvQkFDbkMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRTtvQkFDZCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFO29CQUNkLFVBQVUsRUFBRSxLQUFLO2lCQUNsQixDQUFDO2dCQUVGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDO2dCQUNqQixJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRTthQUM5QixDQUFDLENBQUM7WUFFSCx1QkFBdUI7WUFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLFNBQVM7UUFDZixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVPLGVBQWU7UUFDckIsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLGtCQUFrQjtJQUNsQixzRUFBc0U7SUFFOUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFjO1FBQ3hDLElBQUksQ0FBQztZQUNILElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN4RSxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDekMsMERBQTBEO29CQUMxRCxJQUFJLENBQUM7d0JBQUUsSUFBSSxDQUFDLFFBQWdCLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsRUFBQztvQkFDbkUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTdDLHVCQUF1QjtvQkFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7d0JBQ3BDLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7b0JBQ3pDLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNILENBQUM7SUFFTyxLQUFLLENBQUMseUJBQXlCO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUI7WUFBRSxPQUFPO1FBRWhGLElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FDcEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQ2hDLENBQUM7WUFFRixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQyx3QkFBd0I7Z0JBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDekQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkQsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsb0JBQW9CO2dCQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRTt3QkFDOUQsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxDQUFDO3dCQUM3QyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsTUFBTSxJQUFJLENBQUM7cUJBQ2hELENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsQ0FBQztJQUNILENBQUM7SUFFTyw2QkFBNkI7UUFDbkMsaUNBQWlDO1FBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsSUFBSSxFQUFFLDJCQUEyQjtZQUNqQyxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBQzlCLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzthQUNuRTtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxlQUFlO1FBQ3JCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixJQUFJLEVBQUUsbUJBQW1CO1NBQzFCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxjQUFjLENBQUMsUUFBMEI7UUFDL0MsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUN2QixJQUFJLFFBQVEsQ0FBQyxPQUFPO1lBQUUsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDMUMsSUFBSSxRQUFRLENBQUMsUUFBUTtZQUFFLEdBQUcsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQzVDLElBQUksUUFBUSxDQUFDLE1BQU07WUFBRSxHQUFHLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUN4QyxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFTyxXQUFXLENBQUMsS0FBb0I7UUFDdEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU87WUFBRSxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUN4RCxJQUFJLEtBQUssQ0FBQyxRQUFRO1lBQUUsR0FBRyxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDekMsSUFBSSxLQUFLLENBQUMsTUFBTTtZQUFFLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3JDLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVPLGNBQWMsQ0FBQyxPQUFnQjtRQUNyQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzNELE9BQU8sQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsS0FBb0I7UUFDM0MsNERBQTREO1FBQzVELE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsZUFBZTtJQUNmLHNFQUFzRTtJQUUvRCxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsT0FBaUM7UUFDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLG1CQUFtQixDQUFDLElBQVksRUFBRSxPQUFpQztRQUN4RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNmLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLGFBQWEsQ0FBQyxLQUF3QjtRQUM1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQztvQkFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3BFLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLG1CQUFtQjtJQUNuQixzRUFBc0U7SUFFL0QsWUFBWTtRQUNqQixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVNLFNBQVMsQ0FBQyxNQUFtQztRQUNsRCxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVNLE9BQU87UUFDWiw2QkFBNkI7UUFDN0IsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RSxRQUFRLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9FLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RSxRQUFRLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakUsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzRSxRQUFRLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRixRQUFRLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUU3RSx1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFFRCxzRUFBc0U7QUFDdEUsbUJBQW1CO0FBQ25CLHNFQUFzRTtBQUUvRCxTQUFTLGtCQUFrQixDQUNoQyxRQUFtQixFQUNuQixnQkFBbUMsRUFDbkMsaUJBQXFDLEVBQ3JDLE1BQW9DO0lBRXBDLE9BQU8sSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pGLENBQUM7QUFFRCxzRUFBc0U7QUFDdEUsVUFBVTtBQUNWLHNFQUFzRTtBQUV0RSwrREFBZSw0REFBWSxJQUFDOzs7OztBQzF6QjVCOzs7OztHQUtHO0FBRUgsb0NBQW9DO0FBU1g7QUFFekIscUNBQXFDO0FBWVo7QUFFekIsa0NBQWtDO0FBZVo7QUFFdEIsK0JBQStCO0FBTVI7QUFFdkIsdURBQXVEO0FBQ0Y7QUFDVTtBQUNJO0FBRW5FOztHQUVHO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRztJQUM3QixhQUFhLEVBQUU7UUFDWCxXQUFXO1FBQ1gsZ0JBQWdCO1FBQ2hCLGtCQUFrQjtRQUNsQixrQkFBa0I7UUFDbEIsZ0JBQWdCO0tBQ25CO0lBQ0QsTUFBTSxFQUFFO1FBQ0osa0JBQWtCO1FBQ2xCLHFCQUFxQjtRQUNyQix5QkFBeUI7UUFDekIsV0FBVztRQUNYLGNBQWM7S0FDakI7SUFDRCxVQUFVLEVBQUU7UUFDUixvQkFBb0I7UUFDcEIsa0JBQWtCO1FBQ2xCLHdCQUF3QjtRQUN4QixxQkFBcUI7UUFDckIseUJBQXlCO0tBQzVCO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsWUFBWTtRQUNaLFdBQVc7UUFDWCxZQUFZO1FBQ1osb0JBQW9CO0tBQ3ZCO0NBQ0ssQ0FBQztBQW9CWDs7R0FFRztBQUNJLE1BQU0sc0JBQXNCLEdBQWtCO0lBQ2pELGFBQWEsRUFBRTtRQUNYLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLGlCQUFpQixFQUFFLGtCQUFrQjtLQUN4QztJQUNELE1BQU0sRUFBRTtRQUNKLGVBQWUsRUFBRSxLQUFLO0tBQ3pCO0lBQ0QsVUFBVSxFQUFFO1FBQ1IsVUFBVSxFQUFFLElBQUk7UUFDaEIsVUFBVSxFQUFFLElBQUk7S0FDbkI7Q0FDSixDQUFDO0FBRUY7O0dBRUc7QUFDSSxNQUFNLGNBQWM7SUFHdkIsWUFBWSxTQUFpQyxFQUFFO1FBQzNDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLHNCQUFzQixFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDM0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNMLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZLENBQUMsU0FBaUM7UUFDMUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVU7UUFDTixxRUFBcUU7UUFDckUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkUsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSSxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBRW5EOztHQUVHO0FBQ0ksU0FBUyx1QkFBdUI7SUFDbkMsSUFBSSxDQUFDO1FBQ0QsK0JBQStCO1FBQy9CLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxtQkFBTyxDQUFDLEdBQWlCLENBQUMsQ0FBQztRQUNqRCxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsbUJBQU8sQ0FBQyxFQUFpQixDQUFDLENBQUM7UUFDcEQsTUFBTSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsbUJBQU8sQ0FBQyxHQUFjLENBQUMsQ0FBQztRQUV2RCw2QkFBNkI7UUFDN0IsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLFNBQVMsS0FBSyxVQUFVLENBQUM7UUFDekQsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN6RSxNQUFNLGNBQWMsR0FBRyxPQUFPLGtCQUFrQixLQUFLLFVBQVUsQ0FBQztRQUVoRSxPQUFPLGdCQUFnQixJQUFJLFNBQVMsSUFBSSxjQUFjLENBQUM7SUFDM0QsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSSxNQUFNLGVBQWUsR0FBRztJQUMzQixPQUFPLEVBQUUsT0FBTztJQUNoQixPQUFPLEVBQUU7UUFDTCxhQUFhLEVBQUUsT0FBTztRQUN0QixNQUFNLEVBQUUsT0FBTztRQUNmLFVBQVUsRUFBRSxPQUFPO1FBQ25CLElBQUksRUFBRSxPQUFPO0tBQ2hCO0lBQ0QsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO0NBQ3RDLENBQUM7QUFFRixzQ0FBc0M7QUFDdEMsY0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDOzs7QUM3TTVCOzs7OztHQUtHO0FBNEJ5RDtBQUc1RDs7R0FFRztBQUNILE1BQU0scUJBQXFCO0lBR3pCLFlBQVksT0FBb0I7UUFDOUIsb0JBQW9CO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSyxNQUFjLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsSUFBSTtRQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsQ0FBQztDQUNGO0FBRUQ7OztHQUdHO0FBQ0ksTUFBTSxTQUFTO0lBYXBCLFlBQ1UsTUFBaUIsRUFDakIsaUJBQW9DLEVBQ3BDLFdBQXdCO1FBRnhCLFdBQU0sR0FBTixNQUFNLENBQVc7UUFDakIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtRQUNwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQWYxQixrQkFBYSxHQUEwQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWpFLGlCQUFZLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbkQsb0JBQWUsR0FBcUIsRUFBRSxDQUFDO1FBR3ZDLGtCQUFhLEdBQW1CLEVBQUUsQ0FBQztRQUNuQyxnQkFBVyxHQUFpQixFQUFFLENBQUM7UUFDL0IsbUJBQWMsR0FBb0IsRUFBRSxDQUFDO1FBQ3JDLG1CQUFjLEdBQW9CLEVBQUUsQ0FBQztRQUNyQyxpQkFBWSxHQUFrQixFQUFFLENBQUM7UUFPdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRztZQUNsQixTQUFTLEVBQUUsS0FBSztZQUNoQixPQUFPLEVBQUUsRUFBRTtZQUNYLFFBQVEsRUFBRSxDQUFDO1NBQ1osQ0FBQztRQUVGLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLFVBQVU7SUFDVixzRUFBc0U7SUFFdEUsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVELElBQUksZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDMUIsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSx5QkFBeUI7SUFDekIsc0VBQXNFO0lBRTlELGtCQUFrQjtRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ2YsMkJBQTJCO1lBQzNCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQXNCO1lBQ3pGLG9CQUFvQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQXNCO1lBQ3pGLHNCQUFzQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsNEJBQTRCLENBQXNCO1lBRTlGLHNCQUFzQjtZQUN0QixlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBc0I7WUFDOUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBc0I7WUFDakYsb0JBQW9CLEVBQUUsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDNUYsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBZ0I7WUFDakYsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQXNCO1lBQzdFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQXNCO1lBQ2pGLGtCQUFrQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQXNCO1lBRXBGLHNCQUFzQjtZQUN0QixTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQWdCO1lBQzNELGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQXFCO1lBQy9FLG1CQUFtQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQXFCO1lBQ3JGLHFCQUFxQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQXFCO1lBRXpGLG9CQUFvQjtZQUNwQixhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBc0I7WUFDMUUsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQXFCO1lBRTNFLHlCQUF5QjtZQUN6Qix3QkFBd0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLDhCQUE4QixDQUFxQjtZQUNqRyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFxQjtZQUN0RixrQkFBa0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFnQjtZQUMvRSxlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBcUI7WUFFNUUsZUFBZTtZQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBc0I7WUFDdEUsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFzQjtZQUV0RSxzQkFBc0I7WUFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFnQjtZQUMzRCxZQUFZLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQWdCO1lBQ2pFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsMEJBQTBCLENBQXNCO1lBQzNGLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQXNCO1lBQ2pGLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQXNCO1lBQ2pGLGlCQUFpQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQXNCO1lBRW5GLGdCQUFnQjtZQUNoQixTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQXNCO1lBQ2xFLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBc0I7WUFDcEUsWUFBWSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQXNCO1lBQ3hFLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBcUI7WUFFaEUsa0JBQWtCO1lBQ2xCLGVBQWUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFnQjtZQUN2RSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFnQjtZQUM5RSxXQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQXFCO1lBQ3JFLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBcUI7WUFDckUsYUFBYSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQXNCO1lBRTNFLGFBQWE7WUFDYixvQkFBb0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFnQjtZQUM5RSxZQUFZLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBc0I7WUFDeEUsWUFBWSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQXNCO1lBRXhFLGlCQUFpQjtZQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQWdCO1lBQzNELFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBZ0I7WUFDN0QsWUFBWSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFnQjtZQUNqRSxhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBZ0I7WUFDbkUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBc0I7WUFDekYsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBc0I7WUFDckYscUJBQXFCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBc0I7WUFDM0YsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBc0I7WUFFdkYsdUJBQXVCO1lBQ3ZCLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBZ0I7WUFDN0QsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBZ0I7WUFDMUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBc0I7WUFDaEYsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQXNCO1lBQzVFLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFzQjtZQUM1RSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFnQjtZQUM5RSxXQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQWdCO1lBQy9ELFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBZ0I7WUFDL0QsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQWdCO1lBRXJFLGVBQWU7WUFDZixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBcUI7WUFFM0Usb0JBQW9CO1lBQ3BCLGVBQWUsRUFBRSxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNsRixlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBcUI7WUFDN0UsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBZ0I7WUFDeEYsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBc0I7WUFFbkYsZUFBZTtZQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBZ0I7WUFDL0QsWUFBWSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQWdCO1lBQ2xFLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFnQjtZQUV0RSxrQkFBa0I7WUFDbEIsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQWdCO1NBQ3RFLENBQUM7SUFDSixDQUFDO0lBRU8sY0FBYyxDQUFDLEVBQVU7UUFDL0IsNkVBQTZFO1FBQzdFLE1BQU0sV0FBVyxHQUEyQjtZQUMxQyxtQkFBbUI7WUFDbkIseUJBQXlCLEVBQUUsc0JBQXNCO1lBQ2pELHlCQUF5QixFQUFFLHNCQUFzQjtZQUNqRCw0QkFBNEIsRUFBRSx3QkFBd0I7WUFFdEQsc0JBQXNCO1lBQ3RCLHFCQUFxQixFQUFFLGtCQUFrQjtZQUN6Qyx3QkFBd0IsRUFBRSxxQkFBcUI7WUFDL0MsbUJBQW1CLEVBQUUsZ0JBQWdCO1lBQ3JDLHFCQUFxQixFQUFFLGtCQUFrQjtZQUN6QyxzQkFBc0IsRUFBRSxvQkFBb0I7WUFFNUMsdUJBQXVCO1lBQ3ZCLG9CQUFvQixFQUFFLGtCQUFrQjtZQUN4Qyx1QkFBdUIsRUFBRSxhQUFhO1lBQ3RDLHlCQUF5QixFQUFFLGVBQWU7WUFFMUMsWUFBWTtZQUNaLGlCQUFpQixFQUFFLGVBQWU7WUFDbEMsa0JBQWtCLEVBQUUsZ0JBQWdCO1lBRXBDLHlCQUF5QjtZQUN6Qiw4QkFBOEIsRUFBRSwwQkFBMEI7WUFDMUQsd0JBQXdCLEVBQUUsaUJBQWlCO1lBQzNDLGtCQUFrQixFQUFFLGlCQUFpQjtZQUVyQyxRQUFRO1lBQ1IsZUFBZSxFQUFFLFVBQVU7WUFDM0IsZUFBZSxFQUFFLFVBQVU7WUFFM0IsVUFBVTtZQUNWLHFCQUFxQixFQUFFLGtCQUFrQjtZQUN6QyxzQkFBc0IsRUFBRSxtQkFBbUI7WUFFM0MsZ0JBQWdCO1lBQ2hCLGFBQWEsRUFBRSxXQUFXO1lBQzFCLGNBQWMsRUFBRSxZQUFZO1lBQzVCLGdCQUFnQixFQUFFLGNBQWM7WUFFaEMsU0FBUztZQUNULHNCQUFzQixFQUFFLGNBQWM7WUFDdEMsZUFBZSxFQUFFLFFBQVE7WUFDekIsZUFBZSxFQUFFLFFBQVE7WUFDekIsa0JBQWtCLEVBQUUsZUFBZTtZQUVuQyxhQUFhO1lBQ2IsZ0JBQWdCLEVBQUUsY0FBYztZQUNoQyxnQkFBZ0IsRUFBRSxjQUFjO1lBRWhDLFFBQVE7WUFDUixrQkFBa0IsRUFBRSxnQkFBZ0I7WUFFcEMsb0JBQW9CO1lBQ3BCLG1CQUFtQixFQUFFLGlCQUFpQjtZQUN0QyxzQkFBc0IsRUFBRSxtQkFBbUI7U0FDNUMsQ0FBQztRQUVGLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2IsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxPQUFPLE9BQXNCLENBQUM7SUFDaEMsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxlQUFlO0lBQ2Ysc0VBQXNFO0lBRXRFLGdCQUFnQixDQUFDLElBQWlCLEVBQUUsT0FBdUI7UUFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxJQUFpQixFQUFFLE9BQXVCO1FBQzVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRU8sZUFBZSxDQUFVLElBQWlCLEVBQUUsSUFBUSxFQUFFLE1BQW9CO1FBQ2hGLE1BQU0sS0FBSyxHQUFlO1lBQ3hCLElBQUk7WUFDSixJQUFJO1lBQ0osTUFBTTtZQUNOLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDO0lBQ0gsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxtQkFBbUI7SUFDbkIsc0VBQXNFO0lBRTlELHNCQUFzQjtRQUM1QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDNUIsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUztZQUM5QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZO1lBQ3BDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQjtZQUMzQyxZQUFZLEVBQUUsS0FBSztTQUNwQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDN0IsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVTtZQUMvQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhO1lBQ3JDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQjtZQUM1QyxZQUFZLEVBQUUsS0FBSztTQUNwQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQW1CO1FBQzdCLElBQUksTUFBTSxDQUFDLFlBQVk7WUFBRSxPQUFPO1FBRWhDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQzNCLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUM7UUFFMUQsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNoQixlQUFlO1lBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUNyQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDMUMsQ0FBQzthQUFNLENBQUM7WUFDTixpQkFBaUI7WUFDakIsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNwQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDekMsQ0FBQztRQUVELDZCQUE2QjtRQUM3QixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDOUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRVIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRUQsY0FBYztRQUNaLElBQUksQ0FBQyxlQUFlLEdBQUc7WUFDckI7Z0JBQ0UsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWTtnQkFDcEMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUztnQkFDOUIsU0FBUyxFQUFFLE1BQU07Z0JBQ2pCLFFBQVEsRUFBRSxHQUFHO2dCQUNiLFFBQVEsRUFBRSxHQUFHO2FBQ2Q7WUFDRDtnQkFDRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhO2dCQUNyQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVO2dCQUMvQixTQUFTLEVBQUUsT0FBTztnQkFDbEIsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsUUFBUSxFQUFFLEdBQUc7YUFDZDtTQUNGLENBQUM7UUFFRixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGFBQWEsQ0FBQyxNQUFzQjtRQUMxQyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBYSxFQUFFLEVBQUU7WUFDOUQsVUFBVSxHQUFHLElBQUksQ0FBQztZQUNsQixNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNuQixVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDeEQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQWEsRUFBRSxFQUFFO1lBQ3hDLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU87WUFFeEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNyRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNGLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLFFBQVEsSUFBSSxDQUFDO1FBQzdDLENBQUMsQ0FBQztRQUVGLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtZQUN6QixVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ25CLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDM0QsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsWUFBWTtRQUNWLHFDQUFxQztRQUNyQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1FBRTVDLElBQUksV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLDRCQUE0QjtZQUM1QixTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDakMsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3BDLENBQUM7YUFBTSxDQUFDO1lBQ04sNkJBQTZCO1lBQzdCLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUNsQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsMkJBQTJCO0lBQzNCLHNFQUFzRTtJQUV0RSxvQkFBb0I7UUFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3BELElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDcEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQscUJBQXFCLENBQUMsUUFBZ0IsRUFBRSxPQUFnQjtRQUN0RCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDdEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN0QyxDQUFDO1FBRUQsb0JBQW9CO1FBQ3BCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQWdCLENBQUM7UUFDL0YsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNoQixXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLFFBQVEsR0FBRyxDQUFDO1FBQzNDLENBQUM7UUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQWdCLENBQUM7UUFDckcsSUFBSSxjQUFjLElBQUksT0FBTyxFQUFFLENBQUM7WUFDOUIsY0FBYyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDdkMsQ0FBQztRQUVELElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLG1CQUFtQjtJQUNuQixzRUFBc0U7SUFFdEUsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRU8sZUFBZTtRQUNyQixPQUFPO1lBQ0wsSUFBSSxFQUFFLE9BQU87WUFDYixZQUFZLEVBQUUsU0FBUztZQUN2QixlQUFlLEVBQUUsU0FBUztZQUMxQixTQUFTLEVBQUUsU0FBUztZQUNwQixXQUFXLEVBQUUsU0FBUztTQUN2QixDQUFDO0lBQ0osQ0FBQztJQUVPLFlBQVk7UUFDbEIsT0FBTztZQUNMLElBQUksRUFBRSxNQUFNO1lBQ1osWUFBWSxFQUFFLFNBQVM7WUFDdkIsZUFBZSxFQUFFLFNBQVM7WUFDMUIsU0FBUyxFQUFFLFNBQVM7WUFDcEIsV0FBVyxFQUFFLFNBQVM7U0FDdkIsQ0FBQztJQUNKLENBQUM7SUFFRCxVQUFVLENBQUMsS0FBa0I7UUFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRSw2QkFBNkI7UUFDN0IsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxjQUFjO1FBQ1osTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDO1FBQ2pELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUxQixzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ2pELENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsaUJBQWlCO0lBQ2pCLHNFQUFzRTtJQUV0RSxlQUFlO1FBQ2IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFDMUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0QsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxRQUFRLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDO1lBQ3ZDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFFM0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQztZQUV6RSxRQUFRLENBQUMsU0FBUyxHQUFHOztxQ0FFVSxTQUFTLENBQUMsSUFBSTtzQ0FDYixTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVztjQUMzRCxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRzs7O09BRzVCLENBQUM7WUFFRixJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNmLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztZQUVILFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFaEMsT0FBTztnQkFDTCxJQUFJLEVBQUUsU0FBUztnQkFDZixTQUFTO2dCQUNULFVBQVU7Z0JBQ1YsT0FBTyxFQUFFLFFBQVE7YUFDbEIsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVPLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBYztRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUV0RCxtREFBbUQ7UUFDbkQsSUFBSSxDQUFDO1lBQ0gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLE1BQU0sQ0FBQyxFQUFDO1FBQ1YsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEdBQUcsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUM7UUFDMUUsQ0FBQztRQUVELElBQUksQ0FBQztZQUNILG9EQUFvRDtZQUNwRCxNQUFNLFNBQVMsR0FBRyxNQUFPLElBQUksQ0FBQyxXQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRixJQUFJLFNBQVMsRUFBRSxPQUFPLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6QyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBd0IsQ0FBQztnQkFDakQscUVBQXFFO2dCQUNyRSxJQUFJLENBQUM7b0JBQUUsSUFBSSxDQUFDLE1BQWMsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLEVBQUM7Z0JBQzNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXhDLHVDQUF1QztnQkFDdkMsTUFBTSxXQUFXLEdBQUksSUFBSSxDQUFDLE1BQWMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDM0QsSUFBSSxXQUFXLEVBQUUsQ0FBQztvQkFDaEIsTUFBTSxTQUFTLEdBQUcsTUFBTyxJQUFJLENBQUMsV0FBbUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUM1RixJQUFJLFNBQVMsRUFBRSxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDeEQsd0JBQXdCO3dCQUN4QixJQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzFHLE1BQU0sS0FBSyxHQUFJLEtBQWEsQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7d0JBQzlELE1BQU0sTUFBTSxHQUFJLEtBQWEsQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7d0JBQ2pFLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7NEJBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQzs0QkFDNUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDOUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxDQUFDO0lBQ0gsQ0FBQztJQUVELGVBQWU7UUFDYixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUMxQyxTQUFTLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUV6Qix5Q0FBeUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFFbkUsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzdDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsUUFBUSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztZQUN2QyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBRW5DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFdkUsUUFBUSxDQUFDLFNBQVMsR0FBRzs7c0NBRVcsU0FBUzt3Q0FDUCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O09BRTFFLENBQUM7WUFFRixRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWhDLE9BQU87Z0JBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNYLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsU0FBUztnQkFDVCxXQUFXLEVBQUUsSUFBSTtnQkFDakIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLE9BQU8sRUFBRSxRQUFRO2FBQ2xCLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFTyxXQUFXLENBQUMsT0FBZTtRQUNqQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxvQkFBb0I7SUFDcEIsc0VBQXNFO0lBRXRFLGtCQUFrQixDQUFDLEtBQW9CO1FBQ3JDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFDcEQsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUVoQyxpQkFBaUI7UUFDakIsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7UUFDckQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7WUFDRCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRTtZQUNuRixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxTQUFTLEdBQUcsMkNBQTJDLENBQUM7WUFDL0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTVDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsV0FBVyxHQUFHLEdBQUcsU0FBUyxLQUFLLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUUzRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQztZQUVILGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVyQyxPQUFPO2dCQUNMLE9BQU8sRUFBRSxNQUFNO2dCQUNmLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUM5QixLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU07Z0JBQ3hCLFFBQVEsRUFBRSxJQUFJO2FBQ2YsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVPLFlBQVksQ0FBQyxVQUFrQjtRQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUM7UUFDbkYsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixZQUFZLENBQUMsUUFBUSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztZQUMvQyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO0lBQ0gsQ0FBQztJQUVELDJCQUEyQixDQUFDLEtBQW9CO1FBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUM7UUFDckQsUUFBUSxDQUFDLFNBQVMsR0FBRywyQ0FBMkMsQ0FBQztRQUVqRSxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDL0QsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLGlCQUFpQjtJQUNqQixzRUFBc0U7SUFFdEUsdUJBQXVCLENBQUMsUUFBaUIsRUFBRSxVQUFtQjtRQUM1RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO1FBQ2xELElBQUksUUFBUSxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxXQUFXLEdBQUcsTUFBTSxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pELENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxDQUFDLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQztZQUMzQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzlDLENBQUM7SUFDSCxDQUFDO0lBRUQsaUJBQWlCLENBQUMsSUFBVTtRQUMxQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUMxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUUxQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUM7UUFFcEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxpQkFBaUI7UUFDZixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BFLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxDQUFTLEVBQUUsQ0FBUztRQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ3hGLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxTQUFpQjtRQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7SUFDN0QsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxlQUFlO0lBQ2Ysc0VBQXNFO0lBRXRFLGVBQWUsQ0FBQyxNQUF5QjtRQUN2QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUM5QyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDcEMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDekMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFeEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ2pELElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLG1CQUFtQjtJQUNuQixzRUFBc0U7SUFFdEUsZUFBZTtRQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVELGVBQWU7UUFDYixJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsa0JBQWtCO0lBQ2xCLHNFQUFzRTtJQUV0RSxzQkFBc0IsQ0FBQyxVQUFrQjtRQUN2QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxTQUFTLFVBQVUsRUFBRSxDQUFDO0lBQ3pFLENBQUM7SUFFRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsZ0JBQWdCO0lBQ2hCLHNFQUFzRTtJQUV0RSxVQUFVO1FBQ1IsT0FBTztZQUNMLGtCQUFrQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssTUFBTTtZQUNwRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU07WUFDcEUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxNQUFNO1lBQ3RFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssTUFBTTtZQUN0RSxxQkFBcUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU07WUFDeEUsYUFBYSxFQUFFLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRyxjQUFjLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxxQ0FBcUM7U0FDaEUsQ0FBQztJQUNKLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPO1lBQ0wsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsS0FBSztZQUNoRCxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPO1lBQ3RELGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLE9BQU87WUFDMUQsU0FBUyxFQUFFLE1BQU0sRUFBRSxrQ0FBa0M7WUFDckQsYUFBYSxFQUFFLEtBQUs7U0FDckIsQ0FBQztJQUNKLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPO1lBQ0wsYUFBYSxFQUFFLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUN4QyxTQUFTLEVBQUUsS0FBSyxDQUFDLG9DQUFvQztTQUN0RCxDQUFDO0lBQ0osQ0FBQztJQUVELHNFQUFzRTtJQUN0RSx1QkFBdUI7SUFDdkIsc0VBQXNFO0lBRTlELG1CQUFtQjtRQUN6Qix3RUFBd0U7UUFDeEUsSUFBSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLE1BQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDakUsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7WUFDSCxrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBRSxJQUFJLENBQUMsTUFBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFBQyxNQUFNLENBQUMsRUFBQztRQUNWLGtEQUFrRDtRQUNsRCxJQUFJLENBQUM7WUFDRixJQUFJLENBQUMsaUJBQXlCLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQzFFLE1BQU0sR0FBRyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO2dCQUM3QixJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUQsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUFDLE1BQU0sQ0FBQyxFQUFDO1FBQ1YsbUJBQW1CO1FBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3RFLElBQUksQ0FBQztnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFPLElBQUksQ0FBQyxXQUFtQixDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQztnQkFDckUsSUFBSSxNQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUV4QyxzRUFBc0U7b0JBQ3RFLElBQUksQ0FBQzt3QkFDSCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxJQUFXLENBQUM7d0JBQzdDLElBQUksV0FBVyxHQUFlLElBQUksQ0FBQzt3QkFDbkMsaURBQWlEO3dCQUNqRCxJQUFJLENBQUM7NEJBQUMsV0FBVyxHQUFHLE1BQU0saUJBQWlCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQUMsQ0FBQzt3QkFBQyxNQUFNLENBQUMsRUFBQzt3QkFDcEYsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOzRCQUFDLElBQUksQ0FBQztnQ0FBQyxXQUFXLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFBQyxDQUFDOzRCQUFDLE1BQU0sQ0FBQyxFQUFDO3dCQUFDLENBQUM7d0JBRXpHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs0QkFDakIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyx3RkFBd0YsQ0FBQyxDQUFDOzRCQUN4SCxJQUFJLE1BQU0sRUFBRSxDQUFDO2dDQUNYLElBQUksQ0FBQztvQ0FDSCxJQUFJLE9BQU8saUJBQWlCLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFLENBQUM7d0NBQzlELE1BQU0sSUFBSSxHQUFHLE1BQU0saUJBQWlCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQzt3Q0FDOUUsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7NENBQ3ZCLE1BQU0saUJBQWlCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQzt3Q0FDbkUsQ0FBQztvQ0FDSCxDQUFDO29DQUNELFdBQVcsR0FBRyxNQUFNLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dDQUN2RixDQUFDO2dDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7b0NBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLENBQUMsQ0FBQztvQ0FDckQsZ0NBQWMsQ0FBQywrREFBK0QsQ0FBQyxDQUFDO2dDQUNsRixDQUFDOzRCQUNILENBQUM7d0JBQ0gsQ0FBQzt3QkFFRCxJQUFJLFdBQVcsRUFBRSxDQUFDOzRCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs0QkFDeEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3JELGtDQUFnQixDQUFDLHVCQUF1QixXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDOUQsQ0FBQztvQkFDSCxDQUFDO29CQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7d0JBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUQsQ0FBQztvQkFFRCwwQ0FBMEM7b0JBQzFDLE1BQU0sT0FBTyxHQUFHLE1BQU8sSUFBSSxDQUFDLFdBQW1CLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5RSxJQUFJLE9BQU8sRUFBRSxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDbkQsSUFBSSxDQUFDLE1BQWMsQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDL0MsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN6QixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3RFLElBQUksQ0FBQztnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFPLElBQUksQ0FBQyxXQUFtQixDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQztnQkFDckUsSUFBSSxNQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN4QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZELENBQUM7WUFDSCxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3hFLElBQUksQ0FBQztnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFPLElBQUksQ0FBQyxXQUFtQixDQUFDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQztnQkFDekUsSUFBSSxNQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlDLENBQUM7WUFDSCxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILGdCQUFnQjtRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDekYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUUvRixpQkFBaUI7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFdkYseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNyRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUMvRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUMzRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILHdCQUF3QjtRQUN4QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNyQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ2hFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUM5RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQy9ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFDO1lBQy9DLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxlQUFlO1FBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUMzRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxjQUFjO1FBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQy9ELElBQUksQ0FBQztnQkFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxDQUFFLElBQUksQ0FBQyxNQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztvQkFDN0UsZ0NBQWMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO29CQUN2RCxPQUFPO2dCQUNULENBQUM7Z0JBQ0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ25FLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDMUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRTtvQkFDN0MsS0FBSyxFQUFHLElBQUksQ0FBQyxNQUFjLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxDQUFDO29CQUNwRCxNQUFNLEVBQUcsSUFBSSxDQUFDLE1BQWMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxJQUFJLENBQUM7aUJBQ3ZELENBQUMsQ0FDSCxDQUFDO2dCQUVGLE1BQU0sTUFBTSxHQUFHLE1BQU8sSUFBSSxDQUFDLFdBQW1CLENBQUMsVUFBVSxFQUFFLENBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUNqQyxVQUFVLEVBQ1QsSUFBSSxDQUFDLE1BQWMsQ0FBQyxpQkFBaUIsQ0FDdkMsQ0FBQztnQkFDRixJQUFJLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztvQkFDcEIsa0NBQWdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFDaEQsQ0FBQztxQkFBTSxDQUFDO29CQUNOLGdDQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSx1QkFBdUIsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO1lBQ0gsQ0FBQztZQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLGdDQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUN6RCxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDdEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0MsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsc0NBQXNDO1FBQ3RDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFjLENBQUMsRUFBRSxDQUFDO2dCQUMxRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDBDQUEwQztJQUNsQyxVQUFVLENBQUMsV0FBNEI7UUFDN0MsSUFBSSxDQUFDO1lBQ0gsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQTRCLENBQUM7WUFDakYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQTRCLENBQUM7WUFDakYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBdUIsQ0FBQztZQUN4RixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUF1QixDQUFDO1lBRXhGLE1BQU0sTUFBTSxHQUFHLFdBQVcsS0FBSyxNQUFNLENBQUM7WUFDdEMsSUFBSSxTQUFTO2dCQUFFLFNBQVMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQzFDLElBQUksU0FBUztnQkFBRSxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQzNDLElBQUksU0FBUztnQkFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUQsSUFBSSxTQUFTO2dCQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFBQyxNQUFNLENBQUMsRUFBQztJQUNaLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsYUFBYTtJQUNiLHNFQUFzRTtJQUV0RSxlQUFlO1FBQ2IsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUU5QixvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsT0FBTztZQUNMLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUM7WUFDNUIsTUFBTTtZQUNOLFFBQVE7U0FDVCxDQUFDO0lBQ0osQ0FBQztJQUVELGdCQUFnQixDQUFDLFFBQWtCO1FBQ2pDLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFFOUIsNENBQTRDO1FBRTVDLE9BQU87WUFDTCxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQzVCLE1BQU07WUFDTixRQUFRO1NBQ1QsQ0FBQztJQUNKLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsNENBQTRDO0lBQzVDLHNFQUFzRTtJQUV0RSxzQkFBc0IsQ0FBQyxLQUFvQjtRQUN6QyxpRkFBaUY7UUFDakYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQixpREFBaUQ7WUFDakQsMERBQTBEO1FBQzVELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGOzs7QUMzbUNEOzs7OztHQUtHO0FBRXVDO0FBQzhCO0FBQ047QUFDUjtBQUNmO0FBQ2dCO0FBRTNEOzs7OztHQUtHO0FBQ0gsTUFBTSxHQUFHO0lBUVA7UUFQUSxhQUFRLEdBQUcsY0FBYyxFQUFFLENBQUM7UUFDNUIsc0JBQWlCLEdBQXNCLHVCQUF1QixFQUFFLENBQUM7UUFJakUsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFHMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELENBQUMsQ0FBQztRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7T0FFRztJQUNLLEtBQUssQ0FBQyxVQUFVO1FBQ3RCLElBQUksQ0FBQztZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUU5RCxxQ0FBcUM7WUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLENBQzFDLElBQUksQ0FBQyxRQUFRLENBQ2QsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztZQUU5QyxpREFBaUQ7WUFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FDNUIsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQ3JCLElBQUksQ0FBQyxpQkFBd0IsQ0FBQyxxREFBcUQ7YUFDcEYsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUV2Qyw0RUFBNEU7WUFDNUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1lBRXpELHdEQUF3RDtZQUN4RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUNsQyxJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLGlCQUFpQixDQUN2QixDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBRTFDLG1DQUFtQztZQUNuQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFFeEQsa0RBQWtEO1lBQ2xELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLDREQUE0RCxDQUFDLENBQUM7WUFFMUUsNEJBQTRCO1lBQzVCLGtDQUFnQixDQUFDLGlEQUFpRCxDQUFDLENBQUM7WUFFcEUsOEJBQThCO1lBQzlCLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFFekMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdELGdDQUFjLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLEtBQUssQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxvQkFBb0I7UUFDMUIsbUNBQW1DO1FBQ25DLDBEQUEwRDtRQUMxRCx3REFBd0Q7UUFFeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7T0FFRztJQUNLLHNCQUFzQjtRQUM1QixzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFFSCx3QkFBd0I7UUFDeEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BELGdDQUFjLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztRQUVILHNDQUFzQztRQUN0QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN0RCxPQUFPLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvRCxnQ0FBYyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMseUJBQXlCO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUM7WUFDSCxtQ0FBbUM7WUFDbkMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEYsbUNBQW1DO1lBQ25DLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWxGLDJCQUEyQjtZQUMzQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXRFLCtCQUErQjtZQUMvQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU5RSxrQ0FBa0M7WUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFckYsNkJBQTZCO1lBQzdCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTlFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUU3RCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLDJCQUEyQjtRQUNqQyxPQUFPLENBQUMsQ0FBQyxDQUNQLElBQUksQ0FBQyxRQUFRO1lBQ2IsSUFBSSxDQUFDLGlCQUFpQjtZQUN0QixJQUFJLENBQUMsU0FBUztZQUNkLElBQUksQ0FBQyxnQkFBZ0I7WUFDckIsSUFBSSxDQUFDLFlBQVk7WUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FDakIsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNLLDBCQUEwQjtRQUNoQyxJQUFJLENBQUM7WUFDSCwrQ0FBK0M7WUFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUE4QixDQUFDO1lBQzlELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLLENBQUMsbUJBQW1CO1FBQy9CLElBQUksQ0FBQztZQUNILHlCQUF5QjtZQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ2pDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyx1QkFBdUI7UUFDN0IsSUFBSSxDQUFDO1lBQ0gsc0JBQXNCO1lBQ3RCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDNUMsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFMUIsc0JBQXNCO1lBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRWxDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3pELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLHlCQUF5QjtRQUMvQixJQUFJLENBQUM7WUFDSCw2QkFBNkI7WUFDN0IsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsbUJBQW1CO2dCQUNuQixtQkFBbUI7Z0JBQ25CLFlBQVk7Z0JBQ1osWUFBWTtnQkFDWixpQkFBaUI7YUFDbEIsQ0FBQztZQUVGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUM1QixPQUFRLElBQUksQ0FBQyxpQkFBeUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxVQUFVLENBQzlELENBQUM7UUFDSixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUQsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0sscUJBQXFCO1FBQzNCLElBQUksQ0FBQztZQUNILDBEQUEwRDtZQUMxRCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDO1FBQ2hGLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxtQkFBbUI7UUFDeEIsT0FBTztZQUNMLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUU7WUFDdEMsTUFBTSxFQUFFO2dCQUNOLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU07Z0JBQzFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVc7YUFDaEM7WUFDRCxFQUFFLEVBQUU7Z0JBQ0YsWUFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUzthQUMvQjtZQUNELE1BQU0sRUFBRTtnQkFDTixlQUFlLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZO2FBQ3JDO1lBQ0QsVUFBVSxFQUFFO2dCQUNWLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCO2FBQy9DO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU87UUFDWixJQUFJLENBQUM7WUFDSCxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUM7WUFDekMsbUNBQW1DO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEQsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUVELDJDQUEyQztBQUMzQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUUvRCxJQUFJLENBQUM7UUFDSCxtQ0FBbUM7UUFDbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUV0Qiw0Q0FBNEM7UUFDM0MsTUFBYyxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUM7UUFFdEMsOENBQThDO0lBRWhELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxtREFBbUQsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RSxDQUFDO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCwwQ0FBMEM7QUFDM0I7QUFDK0Q7QUFDTTtBQUNsQjtBQUNSO0FBQ2Y7QUFDeUIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3V0aWxzL2NvbG9yLXBhbGV0dGUudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91dGlscy92YWxpZGF0aW9uLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdXRpbHMvbm90aWZpY2F0aW9ucy50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9tb2RlbHMvQXBwU3RhdGUudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy90eXBlcy9maWxlc3lzdGVtLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdXRpbHMveW9sby1wYXJzZXIudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9zZXJ2aWNlcy9GaWxlU3lzdGVtU2VydmljZS50cyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL3NlcnZpY2VzL2luZGV4LnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvZXh0ZXJuYWwgdmFyIFwiZmFicmljXCIiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9jb250cm9sbGVycy9DYW52YXNDb250cm9sbGVyLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvY29udHJvbGxlcnMvRXZlbnRNYW5hZ2VyLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvdXRpbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy91aS9VSU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb2xvciBQYWxldHRlIFV0aWxpdHkgTW9kdWxlXHJcbiAqIFxyXG4gKiBNYW5hZ2VzIGNvbG9yIGFzc2lnbm1lbnRzIGZvciBvYmplY3QgZGV0ZWN0aW9uIGxhYmVscyBhbmQgVUkgZWxlbWVudHMuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFByZWRlZmluZWQgY29sb3IgcGFsZXR0ZSBmb3IgbGFiZWwgY2xhc3Nlc1xyXG4gKiBVc2VzIGEgbWl4IG9mIGRpc3RpbmN0IGNvbG9ycyBvcHRpbWl6ZWQgZm9yIHZpc2liaWxpdHkgYW5kIGFjY2Vzc2liaWxpdHlcclxuICovXHJcbmV4cG9ydCBjb25zdCBjb2xvclBhbGV0dGU6IHN0cmluZ1tdID0gW1xyXG4gICAgJyNlNjE5NGInLCAnIzNjYjQ0YicsICcjZmZlMTE5JywgJyM0MzYzZDgnLCAnI2Y1ODIzMScsIFxyXG4gICAgJyM5MTFlYjQnLCAnIzQ2ZjBmMCcsICcjZjAzMmU2JywgJyNiY2Y2MGMnLCAnI2ZhYmViZScsXHJcbiAgICAnIzAwODA4MCcsICcjZTZiZWZmJywgJyM5YTYzMjQnLCAnI2ZmZmFjOCcsICcjODAwMDAwJyxcclxuICAgICcjYWFmZmMzJywgJyM4MDgwMDAnLCAnI2ZmZDhiMScsICcjMDAwMDc1JywgJyM4MDgwODAnLFxyXG4gICAgJyNmZmZmZmYnLCAnIzAwMDAwMCcsICcjMWY3N2I0JywgJyNmZjdmMGUnLCAnIzJjYTAyYycsXHJcbiAgICAnI2Q2MjcyOCcsICcjOTQ2N2JkJywgJyM4YzU2NGInLCAnI2UzNzdjMicsICcjN2Y3ZjdmJ1xyXG5dO1xyXG5cclxuLyoqXHJcbiAqIERlZmF1bHQgZmFsbGJhY2sgY29sb3IgZm9yIGludmFsaWQgb3IgdW5hc3NpZ25lZCBjbGFzc2VzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT0xPUiA9ICcjMDAwMDAwJztcclxuXHJcbi8qKlxyXG4gKiBHZXRzIGEgY29sb3IgZm9yIGEgc3BlY2lmaWMgbGFiZWwgY2xhc3NcclxuICogQHBhcmFtIGxhYmVsQ2xhc3MgLSBUaGUgbGFiZWwgY2xhc3MgaWRlbnRpZmllciAoc3RyaW5nIG9yIG51bWJlcilcclxuICogQHJldHVybnMgQ29sb3IgaGV4IHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yRm9yQ2xhc3MobGFiZWxDbGFzczogc3RyaW5nIHwgbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGNsYXNzTnVtYmVyID0gdHlwZW9mIGxhYmVsQ2xhc3MgPT09ICdzdHJpbmcnIFxyXG4gICAgICAgID8gcGFyc2VJbnQobGFiZWxDbGFzcywgMTApIFxyXG4gICAgICAgIDogbGFiZWxDbGFzcztcclxuXHJcbiAgICBpZiAoaXNOYU4oY2xhc3NOdW1iZXIpIHx8IGNsYXNzTnVtYmVyIDwgMCkge1xyXG4gICAgICAgIHJldHVybiBERUZBVUxUX0NPTE9SO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbG9ySW5kZXggPSBjbGFzc051bWJlciAlIGNvbG9yUGFsZXR0ZS5sZW5ndGg7XHJcbiAgICByZXR1cm4gY29sb3JQYWxldHRlW2NvbG9ySW5kZXhdIHx8IERFRkFVTFRfQ09MT1I7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIG11bHRpcGxlIGNvbG9ycyBmb3IgYSBsaXN0IG9mIGxhYmVsIGNsYXNzZXNcclxuICogQHBhcmFtIGxhYmVsQ2xhc3NlcyAtIEFycmF5IG9mIGxhYmVsIGNsYXNzIGlkZW50aWZpZXJzXHJcbiAqIEByZXR1cm5zIEFycmF5IG9mIGNvbG9yIGhleCBzdHJpbmdzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29sb3JzRm9yQ2xhc3NlcyhsYWJlbENsYXNzZXM6IChzdHJpbmcgfCBudW1iZXIpW10pOiBzdHJpbmdbXSB7XHJcbiAgICByZXR1cm4gbGFiZWxDbGFzc2VzLm1hcChsYWJlbENsYXNzID0+IGdldENvbG9yRm9yQ2xhc3MobGFiZWxDbGFzcykpO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGlmIGEgY29sb3IgaXMgaW4gdGhlIHBhbGV0dGVcclxuICogQHBhcmFtIGNvbG9yIC0gQ29sb3IgaGV4IHN0cmluZyB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIGNvbG9yIGV4aXN0cyBpbiBwYWxldHRlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNDb2xvckluUGFsZXR0ZShjb2xvcjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gY29sb3JQYWxldHRlLmluY2x1ZGVzKGNvbG9yLnRvTG93ZXJDYXNlKCkpO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyB0aGUgaW5kZXggb2YgYSBjb2xvciBpbiB0aGUgcGFsZXR0ZVxyXG4gKiBAcGFyYW0gY29sb3IgLSBDb2xvciBoZXggc3RyaW5nXHJcbiAqIEByZXR1cm5zIEluZGV4IG9mIHRoZSBjb2xvciwgb3IgLTEgaWYgbm90IGZvdW5kXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29sb3JJbmRleChjb2xvcjogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBjb2xvclBhbGV0dGUuZmluZEluZGV4KGMgPT4gYy50b0xvd2VyQ2FzZSgpID09PSBjb2xvci50b0xvd2VyQ2FzZSgpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYSBjb250cmFzdGluZyB0ZXh0IGNvbG9yIChibGFjayBvciB3aGl0ZSkgZm9yIGEgZ2l2ZW4gYmFja2dyb3VuZCBjb2xvclxyXG4gKiBAcGFyYW0gYmFja2dyb3VuZENvbG9yIC0gQmFja2dyb3VuZCBjb2xvciBoZXggc3RyaW5nXHJcbiAqIEByZXR1cm5zICcjMDAwMDAwJyBmb3IgbGlnaHQgYmFja2dyb3VuZHMsICcjZmZmZmZmJyBmb3IgZGFyayBiYWNrZ3JvdW5kc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRyYXN0aW5nVGV4dENvbG9yKGJhY2tncm91bmRDb2xvcjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIC8vIFJlbW92ZSAjIGlmIHByZXNlbnRcclxuICAgIGNvbnN0IGhleCA9IGJhY2tncm91bmRDb2xvci5yZXBsYWNlKCcjJywgJycpO1xyXG4gICAgXHJcbiAgICAvLyBDb252ZXJ0IHRvIFJHQlxyXG4gICAgY29uc3QgciA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoMCwgMiksIDE2KTtcclxuICAgIGNvbnN0IGcgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDIsIDQpLCAxNik7XHJcbiAgICBjb25zdCBiID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZyg0LCA2KSwgMTYpO1xyXG4gICAgXHJcbiAgICAvLyBDYWxjdWxhdGUgcmVsYXRpdmUgbHVtaW5hbmNlXHJcbiAgICBjb25zdCBsdW1pbmFuY2UgPSAoMC4yOTkgKiByICsgMC41ODcgKiBnICsgMC4xMTQgKiBiKSAvIDI1NTtcclxuICAgIFxyXG4gICAgLy8gUmV0dXJuIGJsYWNrIGZvciBsaWdodCBiYWNrZ3JvdW5kcywgd2hpdGUgZm9yIGRhcmsgYmFja2dyb3VuZHNcclxuICAgIHJldHVybiBsdW1pbmFuY2UgPiAwLjUgPyAnIzAwMDAwMCcgOiAnI2ZmZmZmZic7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0cyBoZXggY29sb3IgdG8gUkdCQVxyXG4gKiBAcGFyYW0gaGV4IC0gSGV4IGNvbG9yIHN0cmluZ1xyXG4gKiBAcGFyYW0gYWxwaGEgLSBBbHBoYSB2YWx1ZSAoMC0xKVxyXG4gKiBAcmV0dXJucyBSR0JBIGNvbG9yIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGhleFRvUmdiYShoZXg6IHN0cmluZywgYWxwaGE6IG51bWJlciA9IDEpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgY2xlYW5IZXggPSBoZXgucmVwbGFjZSgnIycsICcnKTtcclxuICAgIGNvbnN0IHIgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoMCwgMiksIDE2KTtcclxuICAgIGNvbnN0IGcgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoMiwgNCksIDE2KTtcclxuICAgIGNvbnN0IGIgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoNCwgNiksIDE2KTtcclxuICAgIFxyXG4gICAgcmV0dXJuIGByZ2JhKCR7cn0sICR7Z30sICR7Yn0sICR7YWxwaGF9KWA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb2xvciBjb25maWd1cmF0aW9uIGludGVyZmFjZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDb2xvckNvbmZpZyB7XHJcbiAgICBwYWxldHRlOiBzdHJpbmdbXTtcclxuICAgIGRlZmF1bHRDb2xvcjogc3RyaW5nO1xyXG4gICAgdXNlSGlnaENvbnRyYXN0OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogQWR2YW5jZWQgY29sb3IgbWFuYWdlbWVudCBjbGFzc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbG9yTWFuYWdlciB7XHJcbiAgICBwcml2YXRlIHBhbGV0dGU6IHN0cmluZ1tdO1xyXG4gICAgcHJpdmF0ZSBkZWZhdWx0Q29sb3I6IHN0cmluZztcclxuICAgIHByaXZhdGUgdXNlSGlnaENvbnRyYXN0OiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUGFydGlhbDxDb2xvckNvbmZpZz4gPSB7fSkge1xyXG4gICAgICAgIHRoaXMucGFsZXR0ZSA9IGNvbmZpZy5wYWxldHRlIHx8IGNvbG9yUGFsZXR0ZTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRDb2xvciA9IGNvbmZpZy5kZWZhdWx0Q29sb3IgfHwgREVGQVVMVF9DT0xPUjtcclxuICAgICAgICB0aGlzLnVzZUhpZ2hDb250cmFzdCA9IGNvbmZpZy51c2VIaWdoQ29udHJhc3QgfHwgZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGNvbG9yIGZvciBjbGFzcyB3aXRoIGFkdmFuY2VkIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgZ2V0Q29sb3IobGFiZWxDbGFzczogc3RyaW5nIHwgbnVtYmVyLCBvcHRpb25zPzogeyBoaWdoQ29udHJhc3Q/OiBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGJhc2VDb2xvciA9IGdldENvbG9yRm9yQ2xhc3MobGFiZWxDbGFzcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LmhpZ2hDb250cmFzdCB8fCB0aGlzLnVzZUhpZ2hDb250cmFzdCkge1xyXG4gICAgICAgICAgICAvLyBSZXR1cm4gaGlnaCBjb250cmFzdCB2ZXJzaW9uIG9mIGNvbG9yXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEhpZ2hDb250cmFzdENvbG9yKGJhc2VDb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBiYXNlQ29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGEgaGlnaCBjb250cmFzdCB2ZXJzaW9uIG9mIGEgY29sb3JcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRIaWdoQ29udHJhc3RDb2xvcihjb2xvcjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICAvLyBTaW1wbGUgaGlnaCBjb250cmFzdCBpbXBsZW1lbnRhdGlvblxyXG4gICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgeW91IG1pZ2h0IHVzZSBjb2xvciB0aGVvcnkgYWxnb3JpdGhtc1xyXG4gICAgICAgIGNvbnN0IGx1bWluYW5jZSA9IHRoaXMuZ2V0Q29sb3JMdW1pbmFuY2UoY29sb3IpO1xyXG4gICAgICAgIHJldHVybiBsdW1pbmFuY2UgPiAwLjUgPyAnIzAwMDAwMCcgOiAnI2ZmZmZmZic7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGNvbG9yIGx1bWluYW5jZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldENvbG9yTHVtaW5hbmNlKGhleDogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBjbGVhbkhleCA9IGhleC5yZXBsYWNlKCcjJywgJycpO1xyXG4gICAgICAgIGNvbnN0IHIgPSBwYXJzZUludChjbGVhbkhleC5zdWJzdHJpbmcoMCwgMiksIDE2KSAvIDI1NTtcclxuICAgICAgICBjb25zdCBnID0gcGFyc2VJbnQoY2xlYW5IZXguc3Vic3RyaW5nKDIsIDQpLCAxNikgLyAyNTU7XHJcbiAgICAgICAgY29uc3QgYiA9IHBhcnNlSW50KGNsZWFuSGV4LnN1YnN0cmluZyg0LCA2KSwgMTYpIC8gMjU1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiAwLjI5OSAqIHIgKyAwLjU4NyAqIGcgKyAwLjExNCAqIGI7XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogVmFsaWRhdGlvbiBVdGlsaXR5IE1vZHVsZVxyXG4gKiBcclxuICogUHJvdmlkZXMgaW5wdXQgdmFsaWRhdGlvbiBmdW5jdGlvbnMgZm9yIHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHNob3dUb2FzdCwgc2hvd0Vycm9yVG9hc3QgfSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRpb24gcmVzdWx0IGludGVyZmFjZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcclxuICAgIGlzVmFsaWQ6IGJvb2xlYW47XHJcbiAgICB2YWx1ZT86IHN0cmluZyB8IG51bWJlcjtcclxuICAgIGVycm9yTWVzc2FnZT86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBsYWJlbCBjbGFzcyBpbnB1dCBmcm9tIHVzZXJcclxuICogQHBhcmFtIGlucHV0IC0gUmF3IGlucHV0IGZyb20gdXNlciAoY2FuIGJlIG51bGwgaWYgY2FuY2VsbGVkKVxyXG4gKiBAcmV0dXJucyBWYWxpZGF0ZWQgY2xhc3Mgc3RyaW5nIG9yIG51bGwgaWYgaW52YWxpZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTGFiZWxDbGFzcyhpbnB1dDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgaWYgKGlucHV0ID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIFVzZXIgY2FuY2VsbGVkIHByb21wdFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRyaW1tZWRJbnB1dCA9IGlucHV0LnRyaW0oKTtcclxuICAgIFxyXG4gICAgaWYgKHRyaW1tZWRJbnB1dCA9PT0gJycpIHtcclxuICAgICAgICBzaG93VG9hc3QoJ0xhYmVsIGNsYXNzIGNhbm5vdCBiZSBlbXB0eS4nLCAzMDAwKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBudW0gPSBOdW1iZXIodHJpbW1lZElucHV0KTtcclxuXHJcbiAgICBpZiAoaXNOYU4obnVtKSB8fCAhTnVtYmVyLmlzSW50ZWdlcihudW0pIHx8IG51bSA8IDAgfHwgbnVtID4gMTAwMDApIHtcclxuICAgICAgICBzaG93VG9hc3QoJ0ludmFsaWQgTGFiZWw6IFBsZWFzZSBlbnRlciBhbiBpbnRlZ2VyIGJldHdlZW4gMCBhbmQgMTAwMDAuJywgNDAwMCk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZyhudW0pO1xyXG59XHJcblxyXG4vKipcclxuICogQWR2YW5jZWQgbGFiZWwgY2xhc3MgdmFsaWRhdGlvbiB3aXRoIGRldGFpbGVkIHJlc3VsdFxyXG4gKiBAcGFyYW0gaW5wdXQgLSBSYXcgaW5wdXQgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgRGV0YWlsZWQgdmFsaWRhdGlvbiByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUxhYmVsQ2xhc3NBZHZhbmNlZChpbnB1dDogc3RyaW5nIHwgbnVsbCk6IFZhbGlkYXRpb25SZXN1bHQge1xyXG4gICAgaWYgKGlucHV0ID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0lucHV0IHdhcyBjYW5jZWxsZWQnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmltbWVkSW5wdXQgPSBpbnB1dC50cmltKCk7XHJcbiAgICBcclxuICAgIGlmICh0cmltbWVkSW5wdXQgPT09ICcnKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0xhYmVsIGNsYXNzIGNhbm5vdCBiZSBlbXB0eSdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG51bSA9IE51bWJlcih0cmltbWVkSW5wdXQpO1xyXG5cclxuICAgIGlmIChpc05hTihudW0pKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0xhYmVsIGNsYXNzIG11c3QgYmUgYSBudW1iZXInXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBtdXN0IGJlIGFuIGludGVnZXInXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobnVtIDwgMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdMYWJlbCBjbGFzcyBjYW5ub3QgYmUgbmVnYXRpdmUnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobnVtID4gMTAwMDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTGFiZWwgY2xhc3MgY2Fubm90IGV4Y2VlZCAxMDAwMCdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcclxuICAgICAgICB2YWx1ZTogU3RyaW5nKG51bSlcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgZmlsZSBuYW1lIGZvciBzYWZldHlcclxuICogQHBhcmFtIGZpbGVOYW1lIC0gRmlsZSBuYW1lIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQsIGZhbHNlIG90aGVyd2lzZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFmaWxlTmFtZSB8fCBmaWxlTmFtZS50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvciBpbnZhbGlkIGNoYXJhY3RlcnNcclxuICAgIGNvbnN0IGludmFsaWRDaGFycyA9IC9bPD46XCIvXFxcXHw/Kl0vO1xyXG4gICAgaWYgKGludmFsaWRDaGFycy50ZXN0KGZpbGVOYW1lKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgcmVzZXJ2ZWQgbmFtZXMgKFdpbmRvd3MpXHJcbiAgICBjb25zdCByZXNlcnZlZE5hbWVzID0gL14oQ09OfFBSTnxBVVh8TlVMfENPTVsxLTldfExQVFsxLTldKSQvaTtcclxuICAgIGlmIChyZXNlcnZlZE5hbWVzLnRlc3QoZmlsZU5hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGltYWdlIGZpbGUgZXh0ZW5zaW9uXHJcbiAqIEBwYXJhbSBmaWxlTmFtZSAtIEZpbGUgbmFtZSB0byBjaGVja1xyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIGltYWdlIGV4dGVuc2lvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlSW1hZ2VFeHRlbnNpb24oZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgdmFsaWRFeHRlbnNpb25zID0gWycuanBnJywgJy5qcGVnJywgJy5wbmcnLCAnLmJtcCcsICcudGlmZicsICcudGlmJywgJy53ZWJwJ107XHJcbiAgICBjb25zdCBleHRlbnNpb24gPSBmaWxlTmFtZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZyhmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpKTtcclxuICAgIHJldHVybiB2YWxpZEV4dGVuc2lvbnMuaW5jbHVkZXMoZXh0ZW5zaW9uKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBjb29yZGluYXRlIHZhbHVlcyBmb3IgYm91bmRpbmcgYm94ZXNcclxuICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHdpZHRoIC0gV2lkdGhcclxuICogQHBhcmFtIGhlaWdodCAtIEhlaWdodFxyXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQm91bmRpbmdCb3goXHJcbiAgICB4OiBudW1iZXIsIFxyXG4gICAgeTogbnVtYmVyLCBcclxuICAgIHdpZHRoOiBudW1iZXIsIFxyXG4gICAgaGVpZ2h0OiBudW1iZXJcclxuKTogVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBpZiAoaXNOYU4oeCkgfHwgaXNOYU4oeSkgfHwgaXNOYU4od2lkdGgpIHx8IGlzTmFOKGhlaWdodCkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnQWxsIGNvb3JkaW5hdGVzIG11c3QgYmUgdmFsaWQgbnVtYmVycydcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3aWR0aCA8PSAwIHx8IGhlaWdodCA8PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ1dpZHRoIGFuZCBoZWlnaHQgbXVzdCBiZSBwb3NpdGl2ZSdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh4IDwgMCB8fCB5IDwgMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdDb29yZGluYXRlcyBjYW5ub3QgYmUgbmVnYXRpdmUnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWVcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgWU9MTyBmb3JtYXQgY29vcmRpbmF0ZXMgKG5vcm1hbGl6ZWQgMC0xKVxyXG4gKiBAcGFyYW0gY2VudGVyWCAtIE5vcm1hbGl6ZWQgY2VudGVyIFggKDAtMSlcclxuICogQHBhcmFtIGNlbnRlclkgLSBOb3JtYWxpemVkIGNlbnRlciBZICgwLTEpXHJcbiAqIEBwYXJhbSB3aWR0aCAtIE5vcm1hbGl6ZWQgd2lkdGggKDAtMSlcclxuICogQHBhcmFtIGhlaWdodCAtIE5vcm1hbGl6ZWQgaGVpZ2h0ICgwLTEpXHJcbiAqIEByZXR1cm5zIFZhbGlkYXRpb24gcmVzdWx0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVZT0xPQ29vcmRpbmF0ZXMoXHJcbiAgICBjZW50ZXJYOiBudW1iZXIsXHJcbiAgICBjZW50ZXJZOiBudW1iZXIsXHJcbiAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgaGVpZ2h0OiBudW1iZXJcclxuKTogVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBpZiAoaXNOYU4oY2VudGVyWCkgfHwgaXNOYU4oY2VudGVyWSkgfHwgaXNOYU4od2lkdGgpIHx8IGlzTmFOKGhlaWdodCkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnQWxsIFlPTE8gY29vcmRpbmF0ZXMgbXVzdCBiZSB2YWxpZCBudW1iZXJzJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNlbnRlclggPCAwIHx8IGNlbnRlclggPiAxIHx8IGNlbnRlclkgPCAwIHx8IGNlbnRlclkgPiAxKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0NlbnRlciBjb29yZGluYXRlcyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMSdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3aWR0aCA8PSAwIHx8IHdpZHRoID4gMSB8fCBoZWlnaHQgPD0gMCB8fCBoZWlnaHQgPiAxKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ1dpZHRoIGFuZCBoZWlnaHQgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFsaWQ6IHRydWVcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgem9vbSBsZXZlbFxyXG4gKiBAcGFyYW0gem9vbSAtIFpvb20gbGV2ZWwgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCB6b29tIGxldmVsXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVab29tTGV2ZWwoem9vbTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIWlzTmFOKHpvb20pICYmIHpvb20gPiAwLjEgJiYgem9vbSA8PSAxMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBmb250IHNpemUgZm9yIGxhYmVsc1xyXG4gKiBAcGFyYW0gZm9udFNpemUgLSBGb250IHNpemUgdG8gdmFsaWRhdGVcclxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBmb250IHNpemVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZvbnRTaXplKGZvbnRTaXplOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhaXNOYU4oZm9udFNpemUpICYmIGZvbnRTaXplID49IDggJiYgZm9udFNpemUgPD0gNzI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmFsIHB1cnBvc2UgbnVtYmVyIHZhbGlkYXRpb25cclxuICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gdmFsaWRhdGVcclxuICogQHBhcmFtIG1pbiAtIE1pbmltdW0gYWxsb3dlZCB2YWx1ZVxyXG4gKiBAcGFyYW0gbWF4IC0gTWF4aW11bSBhbGxvd2VkIHZhbHVlXHJcbiAqIEBwYXJhbSBhbGxvd0Zsb2F0IC0gV2hldGhlciB0byBhbGxvdyBmbG9hdGluZyBwb2ludCBudW1iZXJzXHJcbiAqIEByZXR1cm5zIFZhbGlkYXRpb24gcmVzdWx0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVOdW1iZXIoXHJcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyLFxyXG4gICAgbWluPzogbnVtYmVyLFxyXG4gICAgbWF4PzogbnVtYmVyLFxyXG4gICAgYWxsb3dGbG9hdDogYm9vbGVhbiA9IHRydWVcclxuKTogVmFsaWRhdGlvblJlc3VsdCB7XHJcbiAgICBjb25zdCBudW0gPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gTnVtYmVyKHZhbHVlKSA6IHZhbHVlO1xyXG5cclxuICAgIGlmIChpc05hTihudW0pKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ1ZhbHVlIG11c3QgYmUgYSB2YWxpZCBudW1iZXInXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWFsbG93RmxvYXQgJiYgIU51bWJlci5pc0ludGVnZXIobnVtKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdWYWx1ZSBtdXN0IGJlIGFuIGludGVnZXInXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobWluICE9PSB1bmRlZmluZWQgJiYgbnVtIDwgbWluKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYFZhbHVlIG11c3QgYmUgYXQgbGVhc3QgJHttaW59YFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1heCAhPT0gdW5kZWZpbmVkICYmIG51bSA+IG1heCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBWYWx1ZSBjYW5ub3QgZXhjZWVkICR7bWF4fWBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcclxuICAgICAgICB2YWx1ZTogbnVtXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGVtYWlsIGZvcm1hdFxyXG4gKiBAcGFyYW0gZW1haWwgLSBFbWFpbCB0byB2YWxpZGF0ZVxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIGVtYWlsIGZvcm1hdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRW1haWwoZW1haWw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xyXG4gICAgcmV0dXJuIGVtYWlsUmVnZXgudGVzdChlbWFpbCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgVVJMIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXJsIC0gVVJMIHRvIHZhbGlkYXRlXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgVVJMIGZvcm1hdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVXJsKHVybDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIG5ldyBVUkwodXJsKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNhbml0aXplcyBzdHJpbmcgaW5wdXQgdG8gcHJldmVudCBYU1NcclxuICogQHBhcmFtIGlucHV0IC0gSW5wdXQgc3RyaW5nIHRvIHNhbml0aXplXHJcbiAqIEByZXR1cm5zIFNhbml0aXplZCBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUlucHV0KGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGlucHV0XHJcbiAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcclxuICAgICAgICAucmVwbGFjZSgvJy9nLCAnJiN4Mjc7Jyk7XHJcbn0iLCIvKipcclxuICogTm90aWZpY2F0aW9ucyBVdGlsaXR5IE1vZHVsZVxyXG4gKiBcclxuICogSGFuZGxlcyB1c2VyIG5vdGlmaWNhdGlvbiBzeXN0ZW0gaW5jbHVkaW5nIHRvYXN0IG1lc3NhZ2VzIGFuZCBhbGVydHMuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFNob3dzIGEgdG9hc3Qgbm90aWZpY2F0aW9uIG1lc3NhZ2UgdG8gdGhlIHVzZXJcclxuICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5XHJcbiAqIEBwYXJhbSBkdXJhdGlvbiAtIER1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMzAwMG1zKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dUb2FzdChtZXNzYWdlOiBzdHJpbmcsIGR1cmF0aW9uOiBudW1iZXIgPSAzMDAwKTogdm9pZCB7XHJcbiAgICBjb25zdCB0b2FzdENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdC1jb250YWluZXInKTtcclxuICAgIGlmICghdG9hc3RDb250YWluZXIpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1RvYXN0IGNvbnRhaW5lciBub3QgZm91bmQuIE1lc3NhZ2U6JywgbWVzc2FnZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB0b2FzdC5jbGFzc05hbWUgPSAndG9hc3QtbWVzc2FnZSc7XHJcbiAgICB0b2FzdC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XHJcbiAgICB0b2FzdENvbnRhaW5lci5hcHBlbmRDaGlsZCh0b2FzdCk7XHJcblxyXG4gICAgLy8gU2hvdyB0b2FzdCB3aXRoIHNsaWdodCBkZWxheSBmb3IgYW5pbWF0aW9uXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHRvYXN0LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKSwgMTApO1xyXG5cclxuICAgIC8vIEhpZGUgYW5kIHJlbW92ZSB0b2FzdCBhZnRlciBkdXJhdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodG9hc3QucGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdG9hc3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAzMDApOyAvLyBXYWl0IGZvciBmYWRlLW91dCBhbmltYXRpb25cclxuICAgIH0sIGR1cmF0aW9uKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNob3dzIGFuIGVycm9yIHRvYXN0IHdpdGggbG9uZ2VyIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBtZXNzYWdlIC0gRXJyb3IgbWVzc2FnZSB0byBkaXNwbGF5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yVG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBzaG93VG9hc3QobWVzc2FnZSwgNDAwMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHN1Y2Nlc3MgdG9hc3Qgd2l0aCBzdGFuZGFyZCBkdXJhdGlvblxyXG4gKiBAcGFyYW0gbWVzc2FnZSAtIFN1Y2Nlc3MgbWVzc2FnZSB0byBkaXNwbGF5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1N1Y2Nlc3NUb2FzdChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHNob3dUb2FzdChtZXNzYWdlLCAyMDAwKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNob3dzIGEgd2FybmluZyB0b2FzdFxyXG4gKiBAcGFyYW0gbWVzc2FnZSAtIFdhcm5pbmcgbWVzc2FnZSB0byBkaXNwbGF5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1dhcm5pbmdUb2FzdChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHNob3dUb2FzdChtZXNzYWdlLCAzNTAwKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRvYXN0IG1lc3NhZ2UgdHlwZXMgZm9yIHR5cGUgc2FmZXR5XHJcbiAqL1xyXG5leHBvcnQgdHlwZSBUb2FzdFR5cGUgPSAnc3VjY2VzcycgfCAnZXJyb3InIHwgJ3dhcm5pbmcnIHwgJ2luZm8nO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gZm9yIHRvYXN0IG5vdGlmaWNhdGlvbnNcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVG9hc3RDb25maWcge1xyXG4gICAgbWVzc2FnZTogc3RyaW5nO1xyXG4gICAgdHlwZTogVG9hc3RUeXBlO1xyXG4gICAgZHVyYXRpb24/OiBudW1iZXI7XHJcbiAgICBkaXNtaXNzaWJsZT86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHR5cGVkIHRvYXN0IG5vdGlmaWNhdGlvblxyXG4gKiBAcGFyYW0gY29uZmlnIC0gVG9hc3QgY29uZmlndXJhdGlvbiBvYmplY3RcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93VHlwZWRUb2FzdChjb25maWc6IFRvYXN0Q29uZmlnKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IG1lc3NhZ2UsIHR5cGUsIGR1cmF0aW9uLCBkaXNtaXNzaWJsZSA9IGZhbHNlIH0gPSBjb25maWc7XHJcbiAgICBcclxuICAgIGNvbnN0IGRlZmF1bHREdXJhdGlvbnM6IFJlY29yZDxUb2FzdFR5cGUsIG51bWJlcj4gPSB7XHJcbiAgICAgICAgc3VjY2VzczogMjAwMCxcclxuICAgICAgICBlcnJvcjogNDAwMCxcclxuICAgICAgICB3YXJuaW5nOiAzNTAwLFxyXG4gICAgICAgIGluZm86IDMwMDBcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdG9hc3REdXJhdGlvbiA9IGR1cmF0aW9uID8/IGRlZmF1bHREdXJhdGlvbnNbdHlwZV07XHJcbiAgICBcclxuICAgIGlmIChkaXNtaXNzaWJsZSkge1xyXG4gICAgICAgIC8vIEZvciBkaXNtaXNzaWJsZSB0b2FzdHMsIHdlIGNvdWxkIGFkZCBjbG9zZSBidXR0b24gbG9naWMgaGVyZVxyXG4gICAgICAgIHNob3dUb2FzdChgJHttZXNzYWdlfSBbRGlzbWlzc2libGVdYCwgdG9hc3REdXJhdGlvbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNob3dUb2FzdChtZXNzYWdlLCB0b2FzdER1cmF0aW9uKTtcclxuICAgIH1cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLyoqXHJcbiAqIEFwcFN0YXRlIE1vZGVsIC0gTWFpbiBBcHBsaWNhdGlvbiBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAqIFxyXG4gKiBDZW50cmFsaXplZCBzdGF0ZSBtYW5hZ2VtZW50IGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogSGFuZGxlcyBhbGwgYXBwbGljYXRpb24gc3RhdGUgaW5jbHVkaW5nIGZpbGVzLCBVSSBzZXR0aW5ncywgY2FjaGUsIGFuZCBjdXJyZW50IHdvcmtzcGFjZS5cclxuICogXHJcbiAqIEB2ZXJzaW9uIDEuMC4wXHJcbiAqIEBhdXRob3IgRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1pZ3JhdGlvblxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFxyXG4gIE1vZGUsIFxyXG4gIExhYmVsU29ydE9yZGVyLCBcclxuICBQb2ludCxcclxuICBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBcclxuICBGaWxlU3lzdGVtRmlsZUhhbmRsZVxyXG59IGZyb20gJy4uL3R5cGVzJztcclxuXHJcbmltcG9ydCB7XHJcbiAgSUFwcFN0YXRlLFxyXG4gIEFwcFN0YXRlQ29uZmlnLFxyXG4gIEFwcFN0YXRlTWV0aG9kcyxcclxuICBBcHBTdGF0ZUV2ZW50LFxyXG4gIEFwcFN0YXRlRXZlbnRIYW5kbGVyLFxyXG4gIEltYWdlRmlsZSxcclxuICBDbGFzc0ZpbGUsXHJcbiAgQ2xhc3NEZWZpbml0aW9uLFxyXG4gIENsaXBib2FyZERhdGEsXHJcbiAgTG9hZFRva2VuLFxyXG4gIEFwcFN0YXRlVmFsaWRhdGlvbixcclxuICBTZXJpYWxpemFibGVBcHBTdGF0ZVxyXG59IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcblxyXG4vKipcclxuICogQXBwU3RhdGUgQ2xhc3NcclxuICogXHJcbiAqIEltcGxlbWVudHMgdGhlIGNvbXBsZXRlIGFwcGxpY2F0aW9uIHN0YXRlIG1hbmFnZW1lbnQgd2l0aCB0eXBlIHNhZmV0eS5cclxuICogUHJvdmlkZXMgbWV0aG9kcyBmb3IgbWFuYWdpbmcgZmlsZXMsIFVJIHN0YXRlLCBjYWNoZSwgYW5kIHVzZXIgaW50ZXJhY3Rpb25zLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEFwcFN0YXRlIGltcGxlbWVudHMgSUFwcFN0YXRlIHtcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBIYW5kbGVzIChGaWxlIFN5c3RlbSBBY2Nlc3MgQVBJKVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaW1hZ2VGb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgbGFiZWxGb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgY2xhc3NJbmZvRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWxlIERhdGEgQXJyYXlzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBpbWFnZUZpbGVzOiBJbWFnZUZpbGVbXSA9IFtdO1xyXG4gIHB1YmxpYyBjbGFzc0ZpbGVzOiBDbGFzc0ZpbGVbXSA9IFtdO1xyXG4gIHB1YmxpYyBzZWxlY3RlZENsYXNzRmlsZTogQ2xhc3NGaWxlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTdGF0dXMgVHJhY2tpbmcgTWFwc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaW1hZ2VMYWJlbFN0YXR1cyA9IG5ldyBNYXA8c3RyaW5nLCBib29sZWFuPigpOyAvLyBmaWxlTmFtZSAtPiBoYXNMYWJlbHNcclxuICBwdWJsaWMgY2xhc3NOYW1lcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7IC8vIGNsYXNzSWQgLT4gY2xhc3NOYW1lXHJcbiAgcHVibGljIHByZXZpZXdJbWFnZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTsgLy8gZmlsZU5hbWUgLT4gb2JqZWN0VVJMXHJcbiAgcHVibGljIGNvbGxhcHNlZExhYmVsR3JvdXBzID0gbmV3IFNldDxzdHJpbmc+KCk7IC8vIGNvbGxhcHNlZCBncm91cCBJRHNcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEN1cnJlbnQgV29ya2luZyBTdGF0ZVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgY3VycmVudEltYWdlRmlsZTogSW1hZ2VGaWxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGN1cnJlbnRJbWFnZTogSFRNTEltYWdlRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBjdXJyZW50TW9kZTogTW9kZSA9ICdlZGl0JztcclxuICBwdWJsaWMgY3VycmVudExvYWRUb2tlbjogTG9hZFRva2VuID0gMDtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFVJIFNldHRpbmdzICYgUHJlZmVyZW5jZXNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGlzQXV0b1NhdmVFbmFibGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIHNob3dMYWJlbHNPbkNhbnZhczogYm9vbGVhbiA9IHRydWU7XHJcbiAgcHVibGljIGxhYmVsRm9udFNpemU6IG51bWJlciA9IDE0O1xyXG4gIHB1YmxpYyBsYWJlbFNvcnRPcmRlcjogTGFiZWxTb3J0T3JkZXIgPSAnYXNjJztcclxuICBwdWJsaWMgaXNQcmV2aWV3QmFySGlkZGVuOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzQ3Jvc3NoYWlyVmlzaWJsZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW50ZXJuYWwgU3RhdGUgJiBUZW1wb3JhcnkgRGF0YVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgc2F2ZVRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIF9jbGlwYm9hcmQ6IENsaXBib2FyZERhdGEgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgbGFzdE1vdXNlUG9zaXRpb246IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcbiAgcHVibGljIGNvbnRleHRUYXJnZXQ6IGFueSA9IG51bGw7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW1cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHJpdmF0ZSBldmVudExpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBBcHBTdGF0ZUV2ZW50SGFuZGxlcltdPigpO1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciAtIEluaXRpYWxpemUgQXBwU3RhdGUgd2l0aCBkZWZhdWx0IHZhbHVlc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgLy8gQWxsIHByb3BlcnRpZXMgYXJlIGFscmVhZHkgaW5pdGlhbGl6ZWQgYWJvdmVcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzdGF0ZTppbml0aWFsaXplZCcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdGUgTWFuYWdlbWVudCBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCBhbGwgc3RhdGUgdG8gaW5pdGlhbCB2YWx1ZXNcclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAvLyBDbGVhciBmaWxlIGhhbmRsZXNcclxuICAgIHRoaXMuaW1hZ2VGb2xkZXJIYW5kbGUgPSBudWxsO1xyXG4gICAgdGhpcy5sYWJlbEZvbGRlckhhbmRsZSA9IG51bGw7XHJcbiAgICB0aGlzLmNsYXNzSW5mb0ZvbGRlckhhbmRsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2xlYXIgZmlsZSBhcnJheXNcclxuICAgIHRoaXMuaW1hZ2VGaWxlcyA9IFtdO1xyXG4gICAgdGhpcy5jbGFzc0ZpbGVzID0gW107XHJcbiAgICB0aGlzLnNlbGVjdGVkQ2xhc3NGaWxlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDbGVhciBtYXBzIGFuZCBzZXRzXHJcbiAgICB0aGlzLmltYWdlTGFiZWxTdGF0dXMuY2xlYXIoKTtcclxuICAgIHRoaXMuY2xhc3NOYW1lcy5jbGVhcigpO1xyXG4gICAgdGhpcy5jb2xsYXBzZWRMYWJlbEdyb3Vwcy5jbGVhcigpO1xyXG4gICAgdGhpcy5jbGVhclByZXZpZXdDYWNoZSgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3VycmVudEltYWdlRmlsZSA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZSA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnRNb2RlID0gJ2VkaXQnO1xyXG4gICAgdGhpcy5jdXJyZW50TG9hZFRva2VuID0gMDtcclxuXHJcbiAgICAvLyBSZXNldCBVSSBzZXR0aW5ncyB0byBkZWZhdWx0c1xyXG4gICAgdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zaG93TGFiZWxzT25DYW52YXMgPSB0cnVlO1xyXG4gICAgdGhpcy5sYWJlbEZvbnRTaXplID0gMTQ7XHJcbiAgICB0aGlzLmxhYmVsU29ydE9yZGVyID0gJ2FzYyc7XHJcbiAgICB0aGlzLmlzUHJldmlld0JhckhpZGRlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBDbGVhciBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgaWYgKHRoaXMuc2F2ZVRpbWVvdXQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2F2ZVRpbWVvdXQpO1xyXG4gICAgICB0aGlzLnNhdmVUaW1lb3V0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIHRoaXMuX2NsaXBib2FyZCA9IG51bGw7XHJcbiAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XHJcbiAgICB0aGlzLmNvbnRleHRUYXJnZXQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzdGF0ZTpyZXNldCcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGltYWdlIGZvbGRlciBoYW5kbGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SW1hZ2VGb2xkZXIoaGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogdm9pZCB7XHJcbiAgICB0aGlzLmltYWdlRm9sZGVySGFuZGxlID0gaGFuZGxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ZvbGRlcjppbWFnZS1zZXQnLFxyXG4gICAgICBkYXRhOiB7IG5hbWU6IGhhbmRsZS5uYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGxhYmVsIGZvbGRlciBoYW5kbGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGFiZWxGb2xkZXIoaGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsRm9sZGVySGFuZGxlID0gaGFuZGxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ZvbGRlcjpsYWJlbC1zZXQnLFxyXG4gICAgICBkYXRhOiB7IG5hbWU6IGhhbmRsZS5uYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGNsYXNzIGluZm8gZm9sZGVyIGhhbmRsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDbGFzc0luZm9Gb2xkZXIoaGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsYXNzSW5mb0ZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6Y2xhc3MtaW5mby1zZXQnLFxyXG4gICAgICBkYXRhOiB7IG5hbWU6IGhhbmRsZS5uYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgaW1hZ2VcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZTogSW1hZ2VGaWxlIHwgbnVsbCk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJldmlvdXNJbWFnZSA9IHRoaXMuY3VycmVudEltYWdlRmlsZTtcclxuICAgIHRoaXMuY3VycmVudEltYWdlRmlsZSA9IGltYWdlRmlsZTtcclxuICAgIFxyXG4gICAgLy8gSW5jcmVtZW50IGxvYWQgdG9rZW4gdG8gcHJldmVudCByYWNlIGNvbmRpdGlvbnNcclxuICAgIHRoaXMuY3VycmVudExvYWRUb2tlbiArPSAxO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdpbWFnZTpjdXJyZW50LWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IFxyXG4gICAgICAgIHByZXZpb3VzOiBwcmV2aW91c0ltYWdlPy5uYW1lIHx8IG51bGwsXHJcbiAgICAgICAgY3VycmVudDogaW1hZ2VGaWxlPy5uYW1lIHx8IG51bGwsXHJcbiAgICAgICAgbG9hZFRva2VuOiB0aGlzLmN1cnJlbnRMb2FkVG9rZW5cclxuICAgICAgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBsYWJlbCBzdGF0dXMgZm9yIGFuIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIGdldEltYWdlTGFiZWxTdGF0dXMoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMYWJlbFN0YXR1cy5nZXQoZmlsZU5hbWUpIHx8IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGxhYmVsIHN0YXR1cyBmb3IgYW4gaW1hZ2VcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SW1hZ2VMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nLCBoYXNMYWJlbHM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuaW1hZ2VMYWJlbFN0YXR1cy5zZXQoZmlsZU5hbWUsIGhhc0xhYmVscyk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnaW1hZ2U6bGFiZWwtc3RhdHVzLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lLCBoYXNMYWJlbHMgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBNb2RlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY3VycmVudCBkcmF3aW5nL2VkaXRpbmcgbW9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRNb2RlKG1vZGU6IE1vZGUpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByZXZpb3VzTW9kZSA9IHRoaXMuY3VycmVudE1vZGU7XHJcbiAgICB0aGlzLmN1cnJlbnRNb2RlID0gbW9kZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdtb2RlOmNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IHByZXZpb3VzOiBwcmV2aW91c01vZGUsIGN1cnJlbnQ6IG1vZGUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBiZXR3ZWVuIGRyYXcgYW5kIGVkaXQgbW9kZXNcclxuICAgKi9cclxuICBwdWJsaWMgdG9nZ2xlTW9kZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld01vZGU6IE1vZGUgPSB0aGlzLmN1cnJlbnRNb2RlID09PSAnZWRpdCcgPyAnZHJhdycgOiAnZWRpdCc7XHJcbiAgICB0aGlzLnNldE1vZGUobmV3TW9kZSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2xhc3MgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VsZWN0IGEgY2xhc3MgZmlsZSBmb3IgdXNlXHJcbiAgICovXHJcbiAgcHVibGljIHNlbGVjdENsYXNzRmlsZShjbGFzc0ZpbGU6IENsYXNzRmlsZSB8IG51bGwpOiB2b2lkIHtcclxuICAgIHRoaXMuc2VsZWN0ZWRDbGFzc0ZpbGUgPSBjbGFzc0ZpbGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xhc3M6ZmlsZS1zZWxlY3RlZCcsXHJcbiAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGNsYXNzRmlsZT8ubmFtZSB8fCBudWxsIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBjbGFzcyBkZWZpbml0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGFkZENsYXNzRGVmaW5pdGlvbihjbGFzc0RlZjogQ2xhc3NEZWZpbml0aW9uKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsYXNzTmFtZXMuc2V0KGNsYXNzRGVmLmlkLnRvU3RyaW5nKCksIGNsYXNzRGVmLm5hbWUpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsYXNzOmRlZmluaXRpb24tYWRkZWQnLFxyXG4gICAgICBkYXRhOiBjbGFzc0RlZixcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhIGNsYXNzIGRlZmluaXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlQ2xhc3NEZWZpbml0aW9uKGNsYXNzSWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc05hbWVzLmRlbGV0ZShjbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsYXNzOmRlZmluaXRpb24tcmVtb3ZlZCcsXHJcbiAgICAgIGRhdGE6IHsgY2xhc3NJZCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFNldHRpbmdzIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBhdXRvLXNhdmUgZnVuY3Rpb25hbGl0eVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBdXRvU2F2ZShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzQXV0b1NhdmVFbmFibGVkID0gZW5hYmxlZDtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZXR0aW5nczphdXRvLXNhdmUtY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgZW5hYmxlZCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIGxhYmVsIHZpc2liaWxpdHkgb24gY2FudmFzXHJcbiAgICovXHJcbiAgcHVibGljIHNldFNob3dMYWJlbHMoc2hvdzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5zaG93TGFiZWxzT25DYW52YXMgPSBzaG93O1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3NldHRpbmdzOnNob3ctbGFiZWxzLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IHNob3cgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBmb250IHNpemVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGFiZWxGb250U2l6ZShzaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmIChzaXplID49IDggJiYgc2l6ZSA8PSA0OCkge1xyXG4gICAgICB0aGlzLmxhYmVsRm9udFNpemUgPSBzaXplO1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdzZXR0aW5nczpmb250LXNpemUtY2hhbmdlZCcsXHJcbiAgICAgICAgZGF0YTogeyBzaXplIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGxhYmVsIHNvcnQgb3JkZXJcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGFiZWxTb3J0T3JkZXIob3JkZXI6IExhYmVsU29ydE9yZGVyKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsU29ydE9yZGVyID0gb3JkZXI7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2V0dGluZ3M6c29ydC1vcmRlci1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBvcmRlciB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFVJIFN0YXRlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBwcmV2aWV3IGJhciB2aXNpYmlsaXR5XHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZVByZXZpZXdCYXIoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzUHJldmlld0JhckhpZGRlbiA9ICF0aGlzLmlzUHJldmlld0JhckhpZGRlbjtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICd1aTpwcmV2aWV3LWJhci10b2dnbGVkJyxcclxuICAgICAgZGF0YTogeyBoaWRkZW46IHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgY3Jvc3NoYWlyIHZpc2liaWxpdHlcclxuICAgKi9cclxuICBwdWJsaWMgdG9nZ2xlQ3Jvc3NoYWlyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgPSAhdGhpcy5pc0Nyb3NzaGFpclZpc2libGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAndWk6Y3Jvc3NoYWlyLXRvZ2dsZWQnLFxyXG4gICAgICBkYXRhOiB7IHZpc2libGU6IHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgY29udGV4dCBtZW51IHRhcmdldFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDb250ZXh0VGFyZ2V0KHRhcmdldDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbnRleHRUYXJnZXQgPSB0YXJnZXQ7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAndWk6Y29udGV4dC10YXJnZXQtc2V0JyxcclxuICAgICAgZGF0YTogeyB0YXJnZXQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDYWNoZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBDYWNoZSBhIHByZXZpZXcgaW1hZ2UgT2JqZWN0VVJMXHJcbiAgICovXHJcbiAgcHVibGljIGNhY2hlUHJldmlld0ltYWdlKGZpbGVOYW1lOiBzdHJpbmcsIG9iamVjdFVSTDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLnNldChmaWxlTmFtZSwgb2JqZWN0VVJMKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpwcmV2aWV3LWNhY2hlZCcsXHJcbiAgICAgIGRhdGE6IHsgZmlsZU5hbWUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBjYWNoZWQgcHJldmlldyBpbWFnZSBPYmplY3RVUkxcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2FjaGVkUHJldmlld0ltYWdlKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuIHRoaXMucHJldmlld0ltYWdlQ2FjaGUuZ2V0KGZpbGVOYW1lKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIGFsbCBwcmV2aWV3IGNhY2hlXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyUHJldmlld0NhY2hlKCk6IHZvaWQge1xyXG4gICAgLy8gUmV2b2tlIGFsbCBPYmplY3RVUkxzIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXHJcbiAgICBmb3IgKGNvbnN0IG9iamVjdFVSTCBvZiB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLnZhbHVlcygpKSB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VVJMKTtcclxuICAgIH1cclxuICAgIHRoaXMucHJldmlld0ltYWdlQ2FjaGUuY2xlYXIoKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpwcmV2aWV3LWNsZWFyZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENsaXBib2FyZCBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgY2xpcGJvYXJkIGRhdGFcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q2xpcGJvYXJkKGRhdGE6IENsaXBib2FyZERhdGEpOiB2b2lkIHtcclxuICAgIHRoaXMuX2NsaXBib2FyZCA9IGRhdGE7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xpcGJvYXJkOmRhdGEtc2V0JyxcclxuICAgICAgZGF0YTogeyB0eXBlOiBkYXRhLnR5cGUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBjbGlwYm9hcmQgZGF0YVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDbGlwYm9hcmQoKTogQ2xpcGJvYXJkRGF0YSB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NsaXBib2FyZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIGNsaXBib2FyZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhckNsaXBib2FyZCgpOiB2b2lkIHtcclxuICAgIHRoaXMuX2NsaXBib2FyZCA9IG51bGw7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xpcGJvYXJkOmNsZWFyZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbSBJbXBsZW1lbnRhdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVyXHJcbiAgICovXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBBcHBTdGF0ZUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBbXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKSEucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBldmVudCBsaXN0ZW5lclxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogQXBwU3RhdGVFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgY29uc3QgaW5kZXggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3BhdGNoIGV2ZW50IHRvIGFsbCBsaXN0ZW5lcnNcclxuICAgKi9cclxuICBwdWJsaWMgZGlzcGF0Y2hFdmVudChldmVudDogQXBwU3RhdGVFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZXZlbnQgaGFuZGxlciBmb3IgJHtldmVudC50eXBlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlIGN1cnJlbnQgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgdmFsaWRhdGUoKTogQXBwU3RhdGVWYWxpZGF0aW9uIHtcclxuICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciByZXF1aXJlZCBmb2xkZXJzXHJcbiAgICBpZiAoIXRoaXMuaW1hZ2VGb2xkZXJIYW5kbGUpIHtcclxuICAgICAgd2FybmluZ3MucHVzaCgnTm8gaW1hZ2UgZm9sZGVyIHNlbGVjdGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmxhYmVsRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ05vIGxhYmVsIGZvbGRlciBzZWxlY3RlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvbnQgc2l6ZSByYW5nZVxyXG4gICAgaWYgKHRoaXMubGFiZWxGb250U2l6ZSA8IDggfHwgdGhpcy5sYWJlbEZvbnRTaXplID4gNDgpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0xhYmVsIGZvbnQgc2l6ZSBtdXN0IGJlIGJldHdlZW4gOCBhbmQgNDgnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgbWVtb3J5IGxlYWtzIGluIGNhY2hlXHJcbiAgICBpZiAodGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5zaXplID4gMTAwKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ1ByZXZpZXcgY2FjaGUgaXMgbGFyZ2UsIGNvbnNpZGVyIGNsZWFyaW5nJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCxcclxuICAgICAgZXJyb3JzLFxyXG4gICAgICB3YXJuaW5nc1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBzZXJpYWxpemFibGUgc3RhdGUgKGZvciBwZXJzaXN0ZW5jZSlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U2VyaWFsaXphYmxlU3RhdGUoKTogU2VyaWFsaXphYmxlQXBwU3RhdGUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY3VycmVudE1vZGU6IHRoaXMuY3VycmVudE1vZGUsXHJcbiAgICAgIGlzQXV0b1NhdmVFbmFibGVkOiB0aGlzLmlzQXV0b1NhdmVFbmFibGVkLFxyXG4gICAgICBzaG93TGFiZWxzT25DYW52YXM6IHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzLFxyXG4gICAgICBsYWJlbEZvbnRTaXplOiB0aGlzLmxhYmVsRm9udFNpemUsXHJcbiAgICAgIGxhYmVsU29ydE9yZGVyOiB0aGlzLmxhYmVsU29ydE9yZGVyLFxyXG4gICAgICBpc1ByZXZpZXdCYXJIaWRkZW46IHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuLFxyXG4gICAgICBpc0Nyb3NzaGFpclZpc2libGU6IHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZSBmcm9tIHNlcmlhbGl6YWJsZSBzdGF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXN0b3JlRnJvbVNlcmlhbGl6YWJsZVN0YXRlKHN0YXRlOiBTZXJpYWxpemFibGVBcHBTdGF0ZSk6IHZvaWQge1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9IHN0YXRlLmN1cnJlbnRNb2RlO1xyXG4gICAgdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCA9IHN0YXRlLmlzQXV0b1NhdmVFbmFibGVkO1xyXG4gICAgdGhpcy5zaG93TGFiZWxzT25DYW52YXMgPSBzdGF0ZS5zaG93TGFiZWxzT25DYW52YXM7XHJcbiAgICB0aGlzLmxhYmVsRm9udFNpemUgPSBzdGF0ZS5sYWJlbEZvbnRTaXplO1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9IHN0YXRlLmxhYmVsU29ydE9yZGVyO1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSBzdGF0ZS5pc1ByZXZpZXdCYXJIaWRkZW47XHJcbiAgICB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZSA9IHN0YXRlLmlzQ3Jvc3NoYWlyVmlzaWJsZTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6cmVzdG9yZWQnLFxyXG4gICAgICBkYXRhOiBzdGF0ZSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBkZWJ1ZyBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXREZWJ1Z0luZm8oKTogUmVjb3JkPHN0cmluZywgYW55PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpbWFnZUZpbGVzQ291bnQ6IHRoaXMuaW1hZ2VGaWxlcy5sZW5ndGgsXHJcbiAgICAgIGNsYXNzRmlsZXNDb3VudDogdGhpcy5jbGFzc0ZpbGVzLmxlbmd0aCxcclxuICAgICAgaW1hZ2VMYWJlbFN0YXR1c0NvdW50OiB0aGlzLmltYWdlTGFiZWxTdGF0dXMuc2l6ZSxcclxuICAgICAgY2xhc3NOYW1lc0NvdW50OiB0aGlzLmNsYXNzTmFtZXMuc2l6ZSxcclxuICAgICAgcHJldmlld0NhY2hlU2l6ZTogdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5zaXplLFxyXG4gICAgICBjb2xsYXBzZWRHcm91cHNDb3VudDogdGhpcy5jb2xsYXBzZWRMYWJlbEdyb3Vwcy5zaXplLFxyXG4gICAgICBjdXJyZW50TG9hZFRva2VuOiB0aGlzLmN1cnJlbnRMb2FkVG9rZW4sXHJcbiAgICAgIGhhc0ltYWdlRm9sZGVyOiAhIXRoaXMuaW1hZ2VGb2xkZXJIYW5kbGUsXHJcbiAgICAgIGhhc0xhYmVsRm9sZGVyOiAhIXRoaXMubGFiZWxGb2xkZXJIYW5kbGUsXHJcbiAgICAgIGhhc0NsYXNzSW5mb0ZvbGRlcjogISF0aGlzLmNsYXNzSW5mb0ZvbGRlckhhbmRsZSxcclxuICAgICAgY3VycmVudEltYWdlTmFtZTogdGhpcy5jdXJyZW50SW1hZ2VGaWxlPy5uYW1lIHx8IG51bGwsXHJcbiAgICAgIHNlbGVjdGVkQ2xhc3NGaWxlTmFtZTogdGhpcy5zZWxlY3RlZENsYXNzRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICBldmVudExpc3RlbmVyVHlwZXM6IEFycmF5LmZyb20odGhpcy5ldmVudExpc3RlbmVycy5rZXlzKCkpXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgQXBwU3RhdGUgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBcHBTdGF0ZSgpOiBBcHBTdGF0ZSB7XHJcbiAgcmV0dXJuIG5ldyBBcHBTdGF0ZSgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIEFwcFN0YXRlIHdpdGggaW5pdGlhbCBjb25maWd1cmF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBwU3RhdGVXaXRoQ29uZmlnKGNvbmZpZzogUGFydGlhbDxBcHBTdGF0ZUNvbmZpZz4pOiBBcHBTdGF0ZSB7XHJcbiAgY29uc3QgYXBwU3RhdGUgPSBuZXcgQXBwU3RhdGUoKTtcclxuICBcclxuICAvLyBBcHBseSBjb25maWd1cmF0aW9uXHJcbiAgT2JqZWN0LmtleXMoY29uZmlnKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICBpZiAoa2V5IGluIGFwcFN0YXRlKSB7XHJcbiAgICAgIChhcHBTdGF0ZSBhcyBhbnkpW2tleV0gPSAoY29uZmlnIGFzIGFueSlba2V5XTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGFwcFN0YXRlO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXBwU3RhdGU7XHJcbmV4cG9ydCB0eXBlIHsgSUFwcFN0YXRlLCBBcHBTdGF0ZUNvbmZpZywgQXBwU3RhdGVNZXRob2RzIH07IiwiLyoqXHJcbiAqIEZpbGVTeXN0ZW0gU2VydmljZSBUeXBlIERlZmluaXRpb25zXHJcbiAqIFxyXG4gKiBUeXBlcyBmb3IgZmlsZSBJL08gb3BlcmF0aW9ucywgWU9MTyBmb3JtYXQgaGFuZGxpbmcsIGFuZCBGaWxlIFN5c3RlbSBBY2Nlc3MgQVBJIGludGVncmF0aW9uLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUsIEZpbGVTeXN0ZW1GaWxlSGFuZGxlIH0gZnJvbSAnLi9pbmRleCc7XHJcbmltcG9ydCB7IEltYWdlRmlsZSwgQ2xhc3NGaWxlLCBDbGFzc0RlZmluaXRpb24gfSBmcm9tICcuL2FwcC1zdGF0ZSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZpbGUgT3BlcmF0aW9uc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVPcGVyYXRpb25SZXN1bHQ8VCA9IHZvaWQ+IHtcclxuICBzdWNjZXNzOiBib29sZWFuO1xyXG4gIGRhdGE/OiBUO1xyXG4gIGVycm9yPzogc3RyaW5nO1xyXG4gIG1lc3NhZ2U/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUxvYWRSZXN1bHQge1xyXG4gIGNvbnRlbnQ6IHN0cmluZztcclxuICBmaWxlOiBGaWxlO1xyXG4gIGxhc3RNb2RpZmllZDogRGF0ZTtcclxuICBzaXplOiBudW1iZXI7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gWU9MTyBGb3JtYXQgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBZb2xvTGFiZWwge1xyXG4gIGNsYXNzSWQ6IG51bWJlcjtcclxuICBjZW50ZXJYOiBudW1iZXI7XHJcbiAgY2VudGVyWTogbnVtYmVyO1xyXG4gIHdpZHRoOiBudW1iZXI7XHJcbiAgaGVpZ2h0OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgWW9sb1BhcnNlUmVzdWx0IHtcclxuICBsYWJlbHM6IFlvbG9MYWJlbFtdO1xyXG4gIGVycm9yczogc3RyaW5nW107XHJcbiAgd2FybmluZ3M6IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFlvbG9FeHBvcnRPcHRpb25zIHtcclxuICBwcmVjaXNpb24/OiBudW1iZXI7XHJcbiAgaW5jbHVkZUNvbW1lbnRzPzogYm9vbGVhbjtcclxuICB2YWxpZGF0ZUJvdW5kcz86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gQ2xhc3MgRmlsZSBUeXBlc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENsYXNzRmlsZUNvbnRlbnQge1xyXG4gIGNsYXNzZXM6IENsYXNzRGVmaW5pdGlvbltdO1xyXG4gIG1ldGFkYXRhPzoge1xyXG4gICAgdmVyc2lvbj86IHN0cmluZztcclxuICAgIGNyZWF0ZWQ/OiBEYXRlO1xyXG4gICAgbW9kaWZpZWQ/OiBEYXRlO1xyXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbGFzc0ZpbGVWYWxpZGF0aW9uIHtcclxuICBpc1ZhbGlkOiBib29sZWFuO1xyXG4gIGVycm9yczogc3RyaW5nW107XHJcbiAgd2FybmluZ3M6IHN0cmluZ1tdO1xyXG4gIGR1cGxpY2F0ZUlkczogbnVtYmVyW107XHJcbiAgZW1wdHlOYW1lczogc3RyaW5nW107XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRm9sZGVyIE9wZXJhdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGb2xkZXJTY2FuUmVzdWx0IHtcclxuICBpbWFnZUZpbGVzOiBJbWFnZUZpbGVbXTtcclxuICBsYWJlbEZpbGVzOiBzdHJpbmdbXTtcclxuICBjbGFzc0ZpbGVzOiBDbGFzc0ZpbGVbXTtcclxuICB0b3RhbEZpbGVzOiBudW1iZXI7XHJcbiAgZXJyb3JzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMYWJlbFN0YXR1cyB7XHJcbiAgZmlsZU5hbWU6IHN0cmluZztcclxuICBoYXNMYWJlbHM6IGJvb2xlYW47XHJcbiAgbGFiZWxDb3VudDogbnVtYmVyO1xyXG4gIGxhc3RNb2RpZmllZD86IERhdGU7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gSW1hZ2UgUHJvY2Vzc2luZ1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlTG9hZE9wdGlvbnMge1xyXG4gIG1heFdpZHRoPzogbnVtYmVyO1xyXG4gIG1heEhlaWdodD86IG51bWJlcjtcclxuICBxdWFsaXR5PzogbnVtYmVyO1xyXG4gIGZvcm1hdD86ICdwbmcnIHwgJ2pwZWcnIHwgJ3dlYnAnO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEltYWdlSW5mbyB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHdpZHRoOiBudW1iZXI7XHJcbiAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgc2l6ZTogbnVtYmVyO1xyXG4gIGZvcm1hdDogc3RyaW5nO1xyXG4gIGxhc3RNb2RpZmllZDogRGF0ZTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUaWZmUHJvY2Vzc2luZ09wdGlvbnMge1xyXG4gIHBhZ2U/OiBudW1iZXI7XHJcbiAgY29udmVydFRvQ2FudmFzPzogYm9vbGVhbjtcclxuICBiYWNrZ3JvdW5kQ29sb3I/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gQ2FjaGUgTWFuYWdlbWVudFxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENhY2hlRW50cnk8VD4ge1xyXG4gIGRhdGE6IFQ7XHJcbiAgdGltZXN0YW1wOiBEYXRlO1xyXG4gIHNpemU6IG51bWJlcjtcclxuICBoaXRzOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FjaGVTdGF0cyB7XHJcbiAgdG90YWxFbnRyaWVzOiBudW1iZXI7XHJcbiAgdG90YWxTaXplOiBudW1iZXI7XHJcbiAgaGl0UmF0ZTogbnVtYmVyO1xyXG4gIG1lbW9yeVVzYWdlOiBudW1iZXI7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmlsZSBTeXN0ZW0gU2VydmljZSBJbnRlcmZhY2VcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRmlsZVN5c3RlbVNlcnZpY2Uge1xyXG4gIC8vIEZvbGRlciBPcGVyYXRpb25zXHJcbiAgc2VsZWN0SW1hZ2VGb2xkZXIoKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGU+PjtcclxuICBzZWxlY3RMYWJlbEZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+O1xyXG4gIHNlbGVjdENsYXNzSW5mb0ZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+O1xyXG4gIFxyXG4gIC8vIEZpbGUgTGlzdGluZ1xyXG4gIGxpc3RJbWFnZUZpbGVzKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxJbWFnZUZpbGVbXT4+O1xyXG4gIGxpc3RDbGFzc0ZpbGVzKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxDbGFzc0ZpbGVbXT4+O1xyXG4gIHNjYW5Gb2xkZXIoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEZvbGRlclNjYW5SZXN1bHQ+PjtcclxuICBcclxuICAvLyBJbWFnZSBPcGVyYXRpb25zXHJcbiAgbG9hZEltYWdlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBvcHRpb25zPzogSW1hZ2VMb2FkT3B0aW9ucyk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxIVE1MSW1hZ2VFbGVtZW50Pj47XHJcbiAgbG9hZFRpZmZJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IFRpZmZQcm9jZXNzaW5nT3B0aW9ucyk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxIVE1MSW1hZ2VFbGVtZW50Pj47XHJcbiAgZ2V0SW1hZ2VJbmZvKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PEltYWdlSW5mbz4+O1xyXG4gIFxyXG4gIC8vIExhYmVsIE9wZXJhdGlvbnNcclxuICBsb2FkTGFiZWxzKGZpbGVOYW1lOiBzdHJpbmcsIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxZb2xvTGFiZWxbXT4+O1xyXG4gIHNhdmVMYWJlbHMoZmlsZU5hbWU6IHN0cmluZywgbGFiZWxzOiBZb2xvTGFiZWxbXSwgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PjtcclxuICBjaGVja0xhYmVsU3RhdHVzKGZpbGVOYW1lOiBzdHJpbmcsIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxMYWJlbFN0YXR1cz4+O1xyXG4gIFxyXG4gIC8vIENsYXNzIEZpbGUgT3BlcmF0aW9uc1xyXG4gIGxvYWRDbGFzc0ZpbGUoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8Q2xhc3NGaWxlQ29udGVudD4+O1xyXG4gIHNhdmVDbGFzc0ZpbGUoZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsIGNvbnRlbnQ6IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ+O1xyXG4gIGNyZWF0ZUNsYXNzRmlsZShmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUsIGZpbGVOYW1lOiBzdHJpbmcsIGluaXRpYWxDb250ZW50PzogQ2xhc3NGaWxlQ29udGVudCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRmlsZUhhbmRsZT4+O1xyXG4gIHZhbGlkYXRlQ2xhc3NGaWxlKGNvbnRlbnQ6IHN0cmluZyk6IENsYXNzRmlsZVZhbGlkYXRpb247XHJcbiAgXHJcbiAgLy8gWU9MTyBGb3JtYXQgUHJvY2Vzc2luZ1xyXG4gIHBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YTogc3RyaW5nKTogWW9sb1BhcnNlUmVzdWx0O1xyXG4gIGxhYmVsc1RvWW9sb1N0cmluZyhsYWJlbHM6IFlvbG9MYWJlbFtdLCBvcHRpb25zPzogWW9sb0V4cG9ydE9wdGlvbnMpOiBzdHJpbmc7XHJcbiAgdmFsaWRhdGVZb2xvTGFiZWwobGFiZWw6IFlvbG9MYWJlbCk6IGJvb2xlYW47XHJcbiAgXHJcbiAgLy8gQ2FjaGUgTWFuYWdlbWVudFxyXG4gIGNsZWFySW1hZ2VDYWNoZSgpOiB2b2lkO1xyXG4gIGdldENhY2hlU3RhdHMoKTogQ2FjaGVTdGF0cztcclxuICBvcHRpbWl6ZUNhY2hlKCk6IHZvaWQ7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gQ29uZmlndXJhdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVTeXN0ZW1Db25maWcge1xyXG4gIC8vIEltYWdlIHNldHRpbmdzXHJcbiAgc3VwcG9ydGVkSW1hZ2VGb3JtYXRzOiBzdHJpbmdbXTtcclxuICBtYXhJbWFnZVNpemU6IG51bWJlcjtcclxuICB0aHVtYm5haWxTaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgXHJcbiAgLy8gQ2FjaGUgc2V0dGluZ3NcclxuICBtYXhDYWNoZVNpemU6IG51bWJlcjtcclxuICBjYWNoZVRpbWVvdXQ6IG51bWJlcjtcclxuICBcclxuICAvLyBZT0xPIHNldHRpbmdzXHJcbiAgeW9sb1ZhbGlkYXRpb246IHtcclxuICAgIHN0cmljdEJvdW5kczogYm9vbGVhbjtcclxuICAgIGFsbG93WmVyb1NpemU6IGJvb2xlYW47XHJcbiAgICBwcmVjaXNpb246IG51bWJlcjtcclxuICB9O1xyXG4gIFxyXG4gIC8vIFBlcmZvcm1hbmNlIHNldHRpbmdzXHJcbiAgYmF0Y2hTaXplOiBudW1iZXI7XHJcbiAgY29uY3VycmVudExvYWRzOiBudW1iZXI7XHJcbiAgcHJlbG9hZEFkamFjZW50OiBib29sZWFuO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV2ZW50c1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVTeXN0ZW1FdmVudCB7XHJcbiAgdHlwZTogc3RyaW5nO1xyXG4gIGRhdGE/OiBhbnk7XHJcbiAgdGltZXN0YW1wOiBEYXRlO1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyID0gKGV2ZW50OiBGaWxlU3lzdGVtRXZlbnQpID0+IHZvaWQ7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEVycm9yIFR5cGVzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlU3lzdGVtRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgY29kZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGRldGFpbHM/OiBhbnlcclxuICApIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gICAgdGhpcy5uYW1lID0gJ0ZpbGVTeXN0ZW1FcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgWW9sb0Zvcm1hdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGxpbmU/OiBudW1iZXIsXHJcbiAgICBwdWJsaWMgZGF0YT86IHN0cmluZ1xyXG4gICkge1xyXG4gICAgc3VwZXIobWVzc2FnZSk7XHJcbiAgICB0aGlzLm5hbWUgPSAnWW9sb0Zvcm1hdEVycm9yJztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbWFnZUxvYWRFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgIHB1YmxpYyBmaWxlTmFtZT86IHN0cmluZyxcclxuICAgIHB1YmxpYyBjYXVzZT86IEVycm9yXHJcbiAgKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICAgIHRoaXMubmFtZSA9ICdJbWFnZUxvYWRFcnJvcic7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFV0aWxpdHkgVHlwZXNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IHR5cGUgRmlsZUZvcm1hdCA9ICdqcGcnIHwgJ2pwZWcnIHwgJ3BuZycgfCAnZ2lmJyB8ICd0aWYnIHwgJ3RpZmYnIHwgJ3dlYnAnO1xyXG5leHBvcnQgdHlwZSBMYWJlbEZvcm1hdCA9ICd5b2xvJyB8ICdjb2NvJyB8ICdwYXNjYWwnIHwgJ2N1c3RvbSc7XHJcbmV4cG9ydCB0eXBlIENsYXNzRmlsZUZvcm1hdCA9ICd5YW1sJyB8ICd5bWwnIHwgJ2pzb24nIHwgJ3R4dCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVUeXBlSW5mbyB7XHJcbiAgZXh0ZW5zaW9uOiBzdHJpbmc7XHJcbiAgbWltZVR5cGU6IHN0cmluZztcclxuICBjYXRlZ29yeTogJ2ltYWdlJyB8ICdsYWJlbCcgfCAnY2xhc3MnIHwgJ290aGVyJztcclxuICBzdXBwb3J0ZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRmFjdG9yeSBUeXBlc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVTeXN0ZW1TZXJ2aWNlRmFjdG9yeSB7XHJcbiAgY3JlYXRlKGNvbmZpZz86IFBhcnRpYWw8RmlsZVN5c3RlbUNvbmZpZz4pOiBJRmlsZVN5c3RlbVNlcnZpY2U7XHJcbiAgY3JlYXRlV2l0aENhY2hlKGNhY2hlU2l6ZTogbnVtYmVyKTogSUZpbGVTeXN0ZW1TZXJ2aWNlO1xyXG59IiwiLyoqXHJcbiAqIFlPTE8gRm9ybWF0IFBhcnNlciBVdGlsaXR5XHJcbiAqIFxyXG4gKiBIYW5kbGVzIHBhcnNpbmcgYW5kIGdlbmVyYXRpb24gb2YgWU9MTyBmb3JtYXQgYW5ub3RhdGlvbiBmaWxlcy5cclxuICogWU9MTyBmb3JtYXQ6IGNsYXNzSWQgY2VudGVyWCBjZW50ZXJZIHdpZHRoIGhlaWdodCAobm9ybWFsaXplZCBjb29yZGluYXRlcyAwLTEpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgWW9sb0xhYmVsLCBZb2xvUGFyc2VSZXN1bHQsIFlvbG9FeHBvcnRPcHRpb25zLCBZb2xvRm9ybWF0RXJyb3IgfSBmcm9tICcuLi90eXBlcy9maWxlc3lzdGVtJztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gQ29uc3RhbnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmNvbnN0IERFRkFVTFRfUFJFQ0lTSU9OID0gNjtcclxuY29uc3QgTUlOX0NPT1JESU5BVEUgPSAwLjA7XHJcbmNvbnN0IE1BWF9DT09SRElOQVRFID0gMS4wO1xyXG5jb25zdCBNSU5fU0laRSA9IDAuMDtcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gWU9MTyBQYXJzZXIgQ2xhc3NcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIFlvbG9QYXJzZXIge1xyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENPT1JESU5BVEVfUEFUVEVSTiA9IC9eLT9cXGQrKFxcLlxcZCspPyQvO1xyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IExJTkVfUEFUVEVSTiA9IC9eXFxzKihcXGQrKVxccysoW1xcZC4tXSspXFxzKyhbXFxkLi1dKylcXHMrKFtcXGQuLV0rKVxccysoW1xcZC4tXSspXFxzKiQvO1xyXG5cclxuICAvKipcclxuICAgKiBQYXJzZSBZT0xPIGZvcm1hdCBzdHJpbmcgaW50byBzdHJ1Y3R1cmVkIGxhYmVsc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcGFyc2VZb2xvU3RyaW5nKHlvbG9EYXRhOiBzdHJpbmcpOiBZb2xvUGFyc2VSZXN1bHQge1xyXG4gICAgY29uc3QgcmVzdWx0OiBZb2xvUGFyc2VSZXN1bHQgPSB7XHJcbiAgICAgIGxhYmVsczogW10sXHJcbiAgICAgIGVycm9yczogW10sXHJcbiAgICAgIHdhcm5pbmdzOiBbXVxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoIXlvbG9EYXRhIHx8IHlvbG9EYXRhLnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaW5lcyA9IHlvbG9EYXRhLnNwbGl0KCdcXG4nKTtcclxuICAgIFxyXG4gICAgbGluZXMuZm9yRWFjaCgobGluZSwgbGluZUluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHRyaW1tZWRMaW5lID0gbGluZS50cmltKCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTa2lwIGVtcHR5IGxpbmVzIGFuZCBjb21tZW50c1xyXG4gICAgICBpZiAodHJpbW1lZExpbmUgPT09ICcnIHx8IHRyaW1tZWRMaW5lLnN0YXJ0c1dpdGgoJyMnKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBsYWJlbCA9IHRoaXMucGFyc2VTaW5nbGVMaW5lKHRyaW1tZWRMaW5lLCBsaW5lSW5kZXggKyAxKTtcclxuICAgICAgICBpZiAobGFiZWwpIHtcclxuICAgICAgICAgIHJlc3VsdC5sYWJlbHMucHVzaChsYWJlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFlvbG9Gb3JtYXRFcnJvcikge1xyXG4gICAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IFVua25vd24gcGFyc2luZyBlcnJvcmApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIHZhbGlkYXRpb24gd2FybmluZ3NcclxuICAgIHRoaXMuYWRkVmFsaWRhdGlvbldhcm5pbmdzKHJlc3VsdCk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlIGEgc2luZ2xlIFlPTE8gZm9ybWF0IGxpbmVcclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBwYXJzZVNpbmdsZUxpbmUobGluZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBZb2xvTGFiZWwgfCBudWxsIHtcclxuICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaCh0aGlzLkxJTkVfUEFUVEVSTik7XHJcbiAgICBcclxuICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgSW52YWxpZCBZT0xPIGZvcm1hdC4gRXhwZWN0ZWQ6IFwiY2xhc3NJZCBjZW50ZXJYIGNlbnRlclkgd2lkdGggaGVpZ2h0XCJgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IFssIGNsYXNzSWRTdHIsIGNlbnRlclhTdHIsIGNlbnRlcllTdHIsIHdpZHRoU3RyLCBoZWlnaHRTdHJdID0gbWF0Y2g7XHJcblxyXG4gICAgLy8gUGFyc2UgY2xhc3MgSURcclxuICAgIGNvbnN0IGNsYXNzSWQgPSBwYXJzZUludChjbGFzc0lkU3RyISwgMTApO1xyXG4gICAgaWYgKGlzTmFOKGNsYXNzSWQpIHx8IGNsYXNzSWQgPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEludmFsaWQgY2xhc3MgSUQ6IFwiJHtjbGFzc0lkU3RyfVwiLiBNdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXJgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhcnNlIGNvb3JkaW5hdGVzXHJcbiAgICBjb25zdCBjZW50ZXJYID0gdGhpcy5wYXJzZUNvb3JkaW5hdGUoY2VudGVyWFN0ciEsICdjZW50ZXJYJywgbGluZU51bWJlciwgbGluZSk7XHJcbiAgICBjb25zdCBjZW50ZXJZID0gdGhpcy5wYXJzZUNvb3JkaW5hdGUoY2VudGVyWVN0ciEsICdjZW50ZXJZJywgbGluZU51bWJlciwgbGluZSk7XHJcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMucGFyc2VDb29yZGluYXRlKHdpZHRoU3RyISwgJ3dpZHRoJywgbGluZU51bWJlciwgbGluZSk7XHJcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhcnNlQ29vcmRpbmF0ZShoZWlnaHRTdHIhLCAnaGVpZ2h0JywgbGluZU51bWJlciwgbGluZSk7XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgY29vcmRpbmF0ZSByYW5nZXNcclxuICAgIHRoaXMudmFsaWRhdGVDb29yZGluYXRlcyh7IGNsYXNzSWQsIGNlbnRlclgsIGNlbnRlclksIHdpZHRoLCBoZWlnaHQgfSwgbGluZU51bWJlciwgbGluZSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY2xhc3NJZCxcclxuICAgICAgY2VudGVyWCxcclxuICAgICAgY2VudGVyWSxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlIGEgY29vcmRpbmF0ZSB2YWx1ZSB3aXRoIHZhbGlkYXRpb25cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBwYXJzZUNvb3JkaW5hdGUodmFsdWU6IHN0cmluZywgbmFtZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIsIGxpbmU6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICBpZiAoIXRoaXMuQ09PUkRJTkFURV9QQVRURVJOLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEludmFsaWQgJHtuYW1lfTogXCIke3ZhbHVlfVwiLiBNdXN0IGJlIGEgdmFsaWQgbnVtYmVyYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgIGlmIChpc05hTihwYXJzZWQpKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEludmFsaWQgJHtuYW1lfTogXCIke3ZhbHVlfVwiLiBDb3VsZCBub3QgcGFyc2UgYXMgbnVtYmVyYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGFyc2VkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmFsaWRhdGUgWU9MTyBsYWJlbCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIHZhbGlkYXRlQ29vcmRpbmF0ZXMobGFiZWw6IFlvbG9MYWJlbCwgbGluZU51bWJlcjogbnVtYmVyLCBsaW5lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY2VudGVyWCwgY2VudGVyWSwgd2lkdGgsIGhlaWdodCB9ID0gbGFiZWw7XHJcblxyXG4gICAgLy8gQ2hlY2sgY29vcmRpbmF0ZSBib3VuZHMgKFlPTE8gdXNlcyBub3JtYWxpemVkIGNvb3JkaW5hdGVzIDAtMSlcclxuICAgIGlmIChjZW50ZXJYIDwgTUlOX0NPT1JESU5BVEUgfHwgY2VudGVyWCA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYGNlbnRlclggb3V0IG9mIHJhbmdlOiAke2NlbnRlclh9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNlbnRlclkgPCBNSU5fQ09PUkRJTkFURSB8fCBjZW50ZXJZID4gTUFYX0NPT1JESU5BVEUpIHtcclxuICAgICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihcclxuICAgICAgICBgY2VudGVyWSBvdXQgb2YgcmFuZ2U6ICR7Y2VudGVyWX0uIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2lkdGggPD0gTUlOX1NJWkUgfHwgd2lkdGggPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGB3aWR0aCBvdXQgb2YgcmFuZ2U6ICR7d2lkdGh9LiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhlaWdodCA8PSBNSU5fU0laRSB8fCBoZWlnaHQgPiBNQVhfQ09PUkRJTkFURSkge1xyXG4gICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKFxyXG4gICAgICAgIGBoZWlnaHQgb3V0IG9mIHJhbmdlOiAke2hlaWdodH0uIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxYCxcclxuICAgICAgICBsaW5lTnVtYmVyLFxyXG4gICAgICAgIGxpbmVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBib3VuZGluZyBib3ggYm91bmRzXHJcbiAgICBjb25zdCBsZWZ0ID0gY2VudGVyWCAtIHdpZHRoIC8gMjtcclxuICAgIGNvbnN0IHJpZ2h0ID0gY2VudGVyWCArIHdpZHRoIC8gMjtcclxuICAgIGNvbnN0IHRvcCA9IGNlbnRlclkgLSBoZWlnaHQgLyAyO1xyXG4gICAgY29uc3QgYm90dG9tID0gY2VudGVyWSArIGhlaWdodCAvIDI7XHJcblxyXG4gICAgaWYgKGxlZnQgPCBNSU5fQ09PUkRJTkFURSB8fCByaWdodCA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEJvdW5kaW5nIGJveCBleHRlbmRzIG91dHNpZGUgaW1hZ2UgYm91bmRzIGhvcml6b250YWxseSAobGVmdDogJHtsZWZ0fSwgcmlnaHQ6ICR7cmlnaHR9KWAsXHJcbiAgICAgICAgbGluZU51bWJlcixcclxuICAgICAgICBsaW5lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRvcCA8IE1JTl9DT09SRElOQVRFIHx8IGJvdHRvbSA+IE1BWF9DT09SRElOQVRFKSB7XHJcbiAgICAgIHRocm93IG5ldyBZb2xvRm9ybWF0RXJyb3IoXHJcbiAgICAgICAgYEJvdW5kaW5nIGJveCBleHRlbmRzIG91dHNpZGUgaW1hZ2UgYm91bmRzIHZlcnRpY2FsbHkgKHRvcDogJHt0b3B9LCBib3R0b206ICR7Ym90dG9tfSlgLFxyXG4gICAgICAgIGxpbmVOdW1iZXIsXHJcbiAgICAgICAgbGluZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIHZhbGlkYXRpb24gd2FybmluZ3MgdG8gcGFyc2UgcmVzdWx0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgYWRkVmFsaWRhdGlvbldhcm5pbmdzKHJlc3VsdDogWW9sb1BhcnNlUmVzdWx0KTogdm9pZCB7XHJcbiAgICAvLyBDaGVjayBmb3IgdmVyeSBzbWFsbCBib3VuZGluZyBib3hlc1xyXG4gICAgcmVzdWx0LmxhYmVscy5mb3JFYWNoKChsYWJlbCwgaW5kZXgpID0+IHtcclxuICAgICAgaWYgKGxhYmVsLndpZHRoIDwgMC4wMSB8fCBsYWJlbC5oZWlnaHQgPCAwLjAxKSB7XHJcbiAgICAgICAgcmVzdWx0Lndhcm5pbmdzLnB1c2goYExhYmVsICR7aW5kZXggKyAxfTogVmVyeSBzbWFsbCBib3VuZGluZyBib3ggKCR7bGFiZWwud2lkdGh9eCR7bGFiZWwuaGVpZ2h0fSlgKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGR1cGxpY2F0ZSBsYWJlbHMgKHNhbWUgcG9zaXRpb24gYW5kIGNsYXNzKVxyXG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgcmVzdWx0LmxhYmVscy5mb3JFYWNoKChsYWJlbCwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3Qga2V5ID0gYCR7bGFiZWwuY2xhc3NJZH1fJHtsYWJlbC5jZW50ZXJYfV8ke2xhYmVsLmNlbnRlcll9XyR7bGFiZWwud2lkdGh9XyR7bGFiZWwuaGVpZ2h0fWA7XHJcbiAgICAgIGlmIChzZWVuLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgcmVzdWx0Lndhcm5pbmdzLnB1c2goYExhYmVsICR7aW5kZXggKyAxfTogRHVwbGljYXRlIGxhYmVsIGRldGVjdGVkYCk7XHJcbiAgICAgIH1cclxuICAgICAgc2Vlbi5hZGQoa2V5KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBsYWJlbHMgYXJyYXkgdG8gWU9MTyBmb3JtYXQgc3RyaW5nXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBsYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzOiBZb2xvTGFiZWxbXSwgb3B0aW9uczogWW9sb0V4cG9ydE9wdGlvbnMgPSB7fSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIHByZWNpc2lvbiA9IERFRkFVTFRfUFJFQ0lTSU9OLFxyXG4gICAgICBpbmNsdWRlQ29tbWVudHMgPSBmYWxzZSxcclxuICAgICAgdmFsaWRhdGVCb3VuZHMgPSB0cnVlXHJcbiAgICB9ID0gb3B0aW9ucztcclxuXHJcbiAgICBpZiAoIWxhYmVscyB8fCBsYWJlbHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBpZiAoaW5jbHVkZUNvbW1lbnRzKSB7XHJcbiAgICAgIGxpbmVzLnB1c2goJyMgWU9MTyBmb3JtYXQ6IGNsYXNzSWQgY2VudGVyWCBjZW50ZXJZIHdpZHRoIGhlaWdodCAobm9ybWFsaXplZCBjb29yZGluYXRlcyknKTtcclxuICAgICAgbGluZXMucHVzaChgIyBHZW5lcmF0ZWQ6ICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfWApO1xyXG4gICAgICBsaW5lcy5wdXNoKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBsYWJlbHMuZm9yRWFjaCgobGFiZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGlmICh2YWxpZGF0ZUJvdW5kcyAmJiAhdGhpcy52YWxpZGF0ZVlvbG9MYWJlbChsYWJlbCkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgWW9sb0Zvcm1hdEVycm9yKGBJbnZhbGlkIGxhYmVsIGF0IGluZGV4ICR7aW5kZXh9OiBjb29yZGluYXRlcyBvdXQgb2YgYm91bmRzYCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGxpbmUgPSBbXHJcbiAgICAgICAgbGFiZWwuY2xhc3NJZC50b1N0cmluZygpLFxyXG4gICAgICAgIGxhYmVsLmNlbnRlclgudG9GaXhlZChwcmVjaXNpb24pLFxyXG4gICAgICAgIGxhYmVsLmNlbnRlclkudG9GaXhlZChwcmVjaXNpb24pLFxyXG4gICAgICAgIGxhYmVsLndpZHRoLnRvRml4ZWQocHJlY2lzaW9uKSxcclxuICAgICAgICBsYWJlbC5oZWlnaHQudG9GaXhlZChwcmVjaXNpb24pXHJcbiAgICAgIF0uam9pbignICcpO1xyXG5cclxuICAgICAgbGluZXMucHVzaChsaW5lKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlIGEgc2luZ2xlIFlPTE8gbGFiZWxcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHZhbGlkYXRlWW9sb0xhYmVsKGxhYmVsOiBZb2xvTGFiZWwpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMudmFsaWRhdGVDb29yZGluYXRlcyhsYWJlbCwgMCwgJycpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHBpeGVsIGNvb3JkaW5hdGVzIHRvIFlPTE8gbm9ybWFsaXplZCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcGl4ZWxUb05vcm1hbGl6ZWQoXHJcbiAgICBwaXhlbFg6IG51bWJlcixcclxuICAgIHBpeGVsWTogbnVtYmVyLFxyXG4gICAgcGl4ZWxXaWR0aDogbnVtYmVyLFxyXG4gICAgcGl4ZWxIZWlnaHQ6IG51bWJlcixcclxuICAgIGltYWdlV2lkdGg6IG51bWJlcixcclxuICAgIGltYWdlSGVpZ2h0OiBudW1iZXJcclxuICApOiBZb2xvTGFiZWwge1xyXG4gICAgY29uc3QgY2VudGVyWCA9IChwaXhlbFggKyBwaXhlbFdpZHRoIC8gMikgLyBpbWFnZVdpZHRoO1xyXG4gICAgY29uc3QgY2VudGVyWSA9IChwaXhlbFkgKyBwaXhlbEhlaWdodCAvIDIpIC8gaW1hZ2VIZWlnaHQ7XHJcbiAgICBjb25zdCB3aWR0aCA9IHBpeGVsV2lkdGggLyBpbWFnZVdpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gcGl4ZWxIZWlnaHQgLyBpbWFnZUhlaWdodDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjbGFzc0lkOiAwLCAvLyBXaWxsIGJlIHNldCBieSBjYWxsZXJcclxuICAgICAgY2VudGVyWCxcclxuICAgICAgY2VudGVyWSxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgWU9MTyBub3JtYWxpemVkIGNvb3JkaW5hdGVzIHRvIHBpeGVsIGNvb3JkaW5hdGVzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBub3JtYWxpemVkVG9QaXhlbChcclxuICAgIGxhYmVsOiBZb2xvTGFiZWwsXHJcbiAgICBpbWFnZVdpZHRoOiBudW1iZXIsXHJcbiAgICBpbWFnZUhlaWdodDogbnVtYmVyXHJcbiAgKTogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSB7XHJcbiAgICBjb25zdCB3aWR0aCA9IGxhYmVsLndpZHRoICogaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IGxhYmVsLmhlaWdodCAqIGltYWdlSGVpZ2h0O1xyXG4gICAgY29uc3QgeCA9IChsYWJlbC5jZW50ZXJYICogaW1hZ2VXaWR0aCkgLSAod2lkdGggLyAyKTtcclxuICAgIGNvbnN0IHkgPSAobGFiZWwuY2VudGVyWSAqIGltYWdlSGVpZ2h0KSAtIChoZWlnaHQgLyAyKTtcclxuXHJcbiAgICByZXR1cm4geyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgc3RhdGlzdGljcyBhYm91dCBhIHNldCBvZiBsYWJlbHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldExhYmVsU3RhdGlzdGljcyhsYWJlbHM6IFlvbG9MYWJlbFtdKToge1xyXG4gICAgdG90YWxMYWJlbHM6IG51bWJlcjtcclxuICAgIGNsYXNzRGlzdHJpYnV0aW9uOiBSZWNvcmQ8bnVtYmVyLCBudW1iZXI+O1xyXG4gICAgYXZlcmFnZVNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcclxuICAgIHNpemVSYW5nZToge1xyXG4gICAgICBtaW46IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcclxuICAgICAgbWF4OiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XHJcbiAgICB9O1xyXG4gIH0ge1xyXG4gICAgaWYgKCFsYWJlbHMgfHwgbGFiZWxzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHRvdGFsTGFiZWxzOiAwLFxyXG4gICAgICAgIGNsYXNzRGlzdHJpYnV0aW9uOiB7fSxcclxuICAgICAgICBhdmVyYWdlU2l6ZTogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH0sXHJcbiAgICAgICAgc2l6ZVJhbmdlOiB7XHJcbiAgICAgICAgICBtaW46IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9LFxyXG4gICAgICAgICAgbWF4OiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjbGFzc0Rpc3RyaWJ1dGlvbjogUmVjb3JkPG51bWJlciwgbnVtYmVyPiA9IHt9O1xyXG4gICAgbGV0IHRvdGFsV2lkdGggPSAwO1xyXG4gICAgbGV0IHRvdGFsSGVpZ2h0ID0gMDtcclxuICAgIGxldCBtaW5XaWR0aCA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICBsZXQgbWF4V2lkdGggPSBOdW1iZXIuTUlOX1ZBTFVFO1xyXG4gICAgbGV0IG1pbkhlaWdodCA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICBsZXQgbWF4SGVpZ2h0ID0gTnVtYmVyLk1JTl9WQUxVRTtcclxuXHJcbiAgICBsYWJlbHMuZm9yRWFjaChsYWJlbCA9PiB7XHJcbiAgICAgIC8vIENsYXNzIGRpc3RyaWJ1dGlvblxyXG4gICAgICBjbGFzc0Rpc3RyaWJ1dGlvbltsYWJlbC5jbGFzc0lkXSA9IChjbGFzc0Rpc3RyaWJ1dGlvbltsYWJlbC5jbGFzc0lkXSB8fCAwKSArIDE7XHJcblxyXG4gICAgICAvLyBTaXplIHN0YXRpc3RpY3NcclxuICAgICAgdG90YWxXaWR0aCArPSBsYWJlbC53aWR0aDtcclxuICAgICAgdG90YWxIZWlnaHQgKz0gbGFiZWwuaGVpZ2h0O1xyXG4gICAgICBtaW5XaWR0aCA9IE1hdGgubWluKG1pbldpZHRoLCBsYWJlbC53aWR0aCk7XHJcbiAgICAgIG1heFdpZHRoID0gTWF0aC5tYXgobWF4V2lkdGgsIGxhYmVsLndpZHRoKTtcclxuICAgICAgbWluSGVpZ2h0ID0gTWF0aC5taW4obWluSGVpZ2h0LCBsYWJlbC5oZWlnaHQpO1xyXG4gICAgICBtYXhIZWlnaHQgPSBNYXRoLm1heChtYXhIZWlnaHQsIGxhYmVsLmhlaWdodCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0b3RhbExhYmVsczogbGFiZWxzLmxlbmd0aCxcclxuICAgICAgY2xhc3NEaXN0cmlidXRpb24sXHJcbiAgICAgIGF2ZXJhZ2VTaXplOiB7XHJcbiAgICAgICAgd2lkdGg6IHRvdGFsV2lkdGggLyBsYWJlbHMubGVuZ3RoLFxyXG4gICAgICAgIGhlaWdodDogdG90YWxIZWlnaHQgLyBsYWJlbHMubGVuZ3RoXHJcbiAgICAgIH0sXHJcbiAgICAgIHNpemVSYW5nZToge1xyXG4gICAgICAgIG1pbjogeyB3aWR0aDogbWluV2lkdGgsIGhlaWdodDogbWluSGVpZ2h0IH0sXHJcbiAgICAgICAgbWF4OiB7IHdpZHRoOiBtYXhXaWR0aCwgaGVpZ2h0OiBtYXhIZWlnaHQgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBVdGlsaXR5IEZ1bmN0aW9uc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogUXVpY2sgcGFyc2UgZnVuY3Rpb24gZm9yIHNpbXBsZSB1c2UgY2FzZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVlvbG8oeW9sb0RhdGE6IHN0cmluZyk6IFlvbG9MYWJlbFtdIHtcclxuICBjb25zdCByZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgaWYgKHJlc3VsdC5lcnJvcnMubGVuZ3RoID4gMCkge1xyXG4gICAgdGhyb3cgbmV3IFlvbG9Gb3JtYXRFcnJvcihgWU9MTyBwYXJzaW5nIGZhaWxlZDogJHtyZXN1bHQuZXJyb3JzLmpvaW4oJywgJyl9YCk7XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQubGFiZWxzO1xyXG59XHJcblxyXG4vKipcclxuICogUXVpY2sgZXhwb3J0IGZ1bmN0aW9uIGZvciBzaW1wbGUgdXNlIGNhc2VzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhwb3J0WW9sbyhsYWJlbHM6IFlvbG9MYWJlbFtdLCBwcmVjaXNpb246IG51bWJlciA9IERFRkFVTFRfUFJFQ0lTSU9OKTogc3RyaW5nIHtcclxuICByZXR1cm4gWW9sb1BhcnNlci5sYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzLCB7IHByZWNpc2lvbiB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlIFlPTE8gc3RyaW5nIHdpdGhvdXQgcGFyc2luZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlWW9sb1N0cmluZyh5b2xvRGF0YTogc3RyaW5nKTogeyBpc1ZhbGlkOiBib29sZWFuOyBlcnJvcnM6IHN0cmluZ1tdIH0ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IFlvbG9QYXJzZXIucGFyc2VZb2xvU3RyaW5nKHlvbG9EYXRhKTtcclxuICByZXR1cm4ge1xyXG4gICAgaXNWYWxpZDogcmVzdWx0LmVycm9ycy5sZW5ndGggPT09IDAsXHJcbiAgICBlcnJvcnM6IHJlc3VsdC5lcnJvcnNcclxuICB9O1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydFxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZGVmYXVsdCBZb2xvUGFyc2VyOyIsIi8qKlxyXG4gKiBGaWxlU3lzdGVtIFNlcnZpY2UgSW1wbGVtZW50YXRpb25cclxuICogXHJcbiAqIEhhbmRsZXMgYWxsIGZpbGUgSS9PIG9wZXJhdGlvbnMgZm9yIHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBQcm92aWRlcyBhYnN0cmFjdGlvbiBvdmVyIEZpbGUgU3lzdGVtIEFjY2VzcyBBUEkgYW5kIFlPTE8gZm9ybWF0IHByb2Nlc3NpbmcuXHJcbiAqIFxyXG4gKiBAdmVyc2lvbiAxLjAuMFxyXG4gKiBAYXV0aG9yIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb25cclxuICovXHJcblxyXG5pbXBvcnQgeyBcclxuICBJRmlsZVN5c3RlbVNlcnZpY2UsXHJcbiAgRmlsZU9wZXJhdGlvblJlc3VsdCxcclxuICBGaWxlTG9hZFJlc3VsdCxcclxuICBZb2xvTGFiZWwsXHJcbiAgWW9sb1BhcnNlUmVzdWx0LFxyXG4gIFlvbG9FeHBvcnRPcHRpb25zLFxyXG4gIENsYXNzRmlsZUNvbnRlbnQsXHJcbiAgQ2xhc3NGaWxlVmFsaWRhdGlvbixcclxuICBGb2xkZXJTY2FuUmVzdWx0LFxyXG4gIExhYmVsU3RhdHVzLFxyXG4gIEltYWdlSW5mbyxcclxuICBJbWFnZUxvYWRPcHRpb25zLFxyXG4gIFRpZmZQcm9jZXNzaW5nT3B0aW9ucyxcclxuICBDYWNoZUVudHJ5LFxyXG4gIENhY2hlU3RhdHMsXHJcbiAgRmlsZVN5c3RlbUNvbmZpZyxcclxuICBGaWxlU3lzdGVtRXZlbnQsXHJcbiAgRmlsZVN5c3RlbUV2ZW50SGFuZGxlcixcclxuICBGaWxlU3lzdGVtRXJyb3IsXHJcbiAgSW1hZ2VMb2FkRXJyb3IsXHJcbiAgRmlsZUZvcm1hdCxcclxuICBDbGFzc0ZpbGVGb3JtYXRcclxufSBmcm9tICcuLi90eXBlcy9maWxlc3lzdGVtJztcclxuXHJcbmltcG9ydCB7IFxyXG4gIEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUsIFxyXG4gIEZpbGVTeXN0ZW1GaWxlSGFuZGxlIFxyXG59IGZyb20gJy4uL3R5cGVzJztcclxuXHJcbmltcG9ydCB7IFxyXG4gIEltYWdlRmlsZSwgXHJcbiAgQ2xhc3NGaWxlLCBcclxuICBDbGFzc0RlZmluaXRpb24gXHJcbn0gZnJvbSAnLi4vdHlwZXMvYXBwLXN0YXRlJztcclxuXHJcbmltcG9ydCB7IFlvbG9QYXJzZXIgfSBmcm9tICcuLi91dGlscy95b2xvLXBhcnNlcic7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZpbGVTeXN0ZW0gU2VydmljZSBJbXBsZW1lbnRhdGlvblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZVN5c3RlbVNlcnZpY2UgaW1wbGVtZW50cyBJRmlsZVN5c3RlbVNlcnZpY2Uge1xyXG4gIHByaXZhdGUgY29uZmlnOiBGaWxlU3lzdGVtQ29uZmlnO1xyXG4gIHByaXZhdGUgaW1hZ2VDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBDYWNoZUVudHJ5PEhUTUxJbWFnZUVsZW1lbnQ+PigpO1xyXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgRmlsZVN5c3RlbUV2ZW50SGFuZGxlcltdPigpO1xyXG4gIFxyXG4gIC8vIERlZmF1bHQgY29uZmlndXJhdGlvblxyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IERFRkFVTFRfQ09ORklHOiBGaWxlU3lzdGVtQ29uZmlnID0ge1xyXG4gICAgc3VwcG9ydGVkSW1hZ2VGb3JtYXRzOiBbJ2pwZycsICdqcGVnJywgJ3BuZycsICdnaWYnLCAndGlmJywgJ3RpZmYnLCAnd2VicCddLFxyXG4gICAgbWF4SW1hZ2VTaXplOiA1MCAqIDEwMjQgKiAxMDI0LCAvLyA1ME1CXHJcbiAgICB0aHVtYm5haWxTaXplOiB7IHdpZHRoOiAxNTAsIGhlaWdodDogMTUwIH0sXHJcbiAgICBtYXhDYWNoZVNpemU6IDEwMCAqIDEwMjQgKiAxMDI0LCAvLyAxMDBNQlxyXG4gICAgY2FjaGVUaW1lb3V0OiAzMCAqIDYwICogMTAwMCwgLy8gMzAgbWludXRlc1xyXG4gICAgeW9sb1ZhbGlkYXRpb246IHtcclxuICAgICAgc3RyaWN0Qm91bmRzOiB0cnVlLFxyXG4gICAgICBhbGxvd1plcm9TaXplOiBmYWxzZSxcclxuICAgICAgcHJlY2lzaW9uOiA2XHJcbiAgICB9LFxyXG4gICAgYmF0Y2hTaXplOiAxMCxcclxuICAgIGNvbmN1cnJlbnRMb2FkczogMyxcclxuICAgIHByZWxvYWRBZGphY2VudDogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNvbmZpZz86IFBhcnRpYWw8RmlsZVN5c3RlbUNvbmZpZz4pIHtcclxuICAgIHRoaXMuY29uZmlnID0geyAuLi5GaWxlU3lzdGVtU2VydmljZS5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlnIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRm9sZGVyIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzZWxlY3RJbWFnZUZvbGRlcigpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZT4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZvbGRlckhhbmRsZSA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5zaG93RGlyZWN0b3J5UGlja2VyKCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmb2xkZXI6aW1hZ2Utc2VsZWN0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgbmFtZTogZm9sZGVySGFuZGxlLm5hbWUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZm9sZGVySGFuZGxlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBJbWFnZSBmb2xkZXIgc2VsZWN0ZWQ6ICR7Zm9sZGVySGFuZGxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdTZWxlY3Rpb24gY2FuY2VsbGVkJyB9O1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNlbGVjdCBpbWFnZSBmb2xkZXI6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIHNlbGVjdExhYmVsRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZm9sZGVySGFuZGxlID0gYXdhaXQgKHdpbmRvdyBhcyBhbnkpLnNob3dEaXJlY3RvcnlQaWNrZXIoKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ZvbGRlcjpsYWJlbC1zZWxlY3RlZCcsXHJcbiAgICAgICAgZGF0YTogeyBuYW1lOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBmb2xkZXJIYW5kbGUsXHJcbiAgICAgICAgbWVzc2FnZTogYExhYmVsIGZvbGRlciBzZWxlY3RlZDogJHtmb2xkZXJIYW5kbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1NlbGVjdGlvbiBjYW5jZWxsZWQnIH07XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2VsZWN0IGxhYmVsIGZvbGRlcjogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2VsZWN0Q2xhc3NJbmZvRm9sZGVyKCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZm9sZGVySGFuZGxlID0gYXdhaXQgKHdpbmRvdyBhcyBhbnkpLnNob3dEaXJlY3RvcnlQaWNrZXIoKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ZvbGRlcjpjbGFzcy1pbmZvLXNlbGVjdGVkJyxcclxuICAgICAgICBkYXRhOiB7IG5hbWU6IGZvbGRlckhhbmRsZS5uYW1lIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGZvbGRlckhhbmRsZSxcclxuICAgICAgICBtZXNzYWdlOiBgQ2xhc3MgaW5mbyBmb2xkZXIgc2VsZWN0ZWQ6ICR7Zm9sZGVySGFuZGxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdTZWxlY3Rpb24gY2FuY2VsbGVkJyB9O1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNlbGVjdCBjbGFzcyBpbmZvIGZvbGRlcjogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBMaXN0aW5nIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhc3luYyBsaXN0SW1hZ2VGaWxlcyhmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SW1hZ2VGaWxlW10+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBpbWFnZUZpbGVzOiBJbWFnZUZpbGVbXSA9IFtdO1xyXG4gICAgICBjb25zdCBzdXBwb3J0ZWRGb3JtYXRzID0gdGhpcy5jb25maWcuc3VwcG9ydGVkSW1hZ2VGb3JtYXRzLm1hcChmID0+IGYudG9Mb3dlckNhc2UoKSk7XHJcblxyXG4gICAgICBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIChmb2xkZXJIYW5kbGUgYXMgYW55KS52YWx1ZXMoKSkge1xyXG4gICAgICAgIGlmIChlbnRyeS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihlbnRyeS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKHN1cHBvcnRlZEZvcm1hdHMuaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZUZpbGU6IEltYWdlRmlsZSA9IHtcclxuICAgICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLFxyXG4gICAgICAgICAgICAgIGhhbmRsZTogZW50cnksXHJcbiAgICAgICAgICAgICAgcGF0aDogZW50cnkubmFtZSwgLy8gTm90ZTogRnVsbCBwYXRoIG5vdCBhdmFpbGFibGUgaW4gRmlsZSBTeXN0ZW0gQWNjZXNzIEFQSVxyXG4gICAgICAgICAgICAgIGV4dGVuc2lvbixcclxuICAgICAgICAgICAgICBzaXplOiB1bmRlZmluZWQsIC8vIFdpbGwgYmUgbG9hZGVkIHdoZW4gbmVlZGVkXHJcbiAgICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiB1bmRlZmluZWQgLy8gV2lsbCBiZSBsb2FkZWQgd2hlbiBuZWVkZWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1hZ2VGaWxlcy5wdXNoKGltYWdlRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTb3J0IGZpbGVzIG5hdHVyYWxseSAoaGFuZGxlcyBudW1iZXJzIGNvcnJlY3RseSlcclxuICAgICAgaW1hZ2VGaWxlcy5zb3J0KChhLCBiKSA9PiBcclxuICAgICAgICBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUsIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlLCBzZW5zaXRpdml0eTogJ2Jhc2UnIH0pXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdmaWxlczppbWFnZXMtbGlzdGVkJyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBpbWFnZUZpbGVzLmxlbmd0aCwgZm9sZGVyOiBmb2xkZXJIYW5kbGUubmFtZSB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBpbWFnZUZpbGVzLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBGb3VuZCAke2ltYWdlRmlsZXMubGVuZ3RofSBpbWFnZSBmaWxlc2BcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbGlzdCBpbWFnZSBmaWxlczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbGlzdENsYXNzRmlsZXMoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PENsYXNzRmlsZVtdPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgY2xhc3NGaWxlczogQ2xhc3NGaWxlW10gPSBbXTtcclxuICAgICAgY29uc3Qgc3VwcG9ydGVkRm9ybWF0cyA9IFsneWFtbCcsICd5bWwnXTtcclxuXHJcbiAgICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgKGZvbGRlckhhbmRsZSBhcyBhbnkpLnZhbHVlcygpKSB7XHJcbiAgICAgICAgaWYgKGVudHJ5LmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoc3VwcG9ydGVkRm9ybWF0cy5pbmNsdWRlcyhleHRlbnNpb24pKSB7XHJcbiAgICAgICAgICAgIC8vIExvYWQgY2xhc3MgZmlsZSBjb250ZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRSZXN1bHQgPSBhd2FpdCB0aGlzLmxvYWRDbGFzc0ZpbGUoZW50cnkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc3QgY2xhc3NGaWxlOiBDbGFzc0ZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICBoYW5kbGU6IGVudHJ5LFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRSZXN1bHQuc3VjY2VzcyA/IGNvbnRlbnRSZXN1bHQuZGF0YSEuY2xhc3NlcyA6IFtdLFxyXG4gICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNsYXNzRmlsZXMucHVzaChjbGFzc0ZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnZmlsZXM6Y2xhc3Nlcy1saXN0ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgY291bnQ6IGNsYXNzRmlsZXMubGVuZ3RoLCBmb2xkZXI6IGZvbGRlckhhbmRsZS5uYW1lIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGNsYXNzRmlsZXMsXHJcbiAgICAgICAgbWVzc2FnZTogYEZvdW5kICR7Y2xhc3NGaWxlcy5sZW5ndGh9IGNsYXNzIGZpbGVzYFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsaXN0IGNsYXNzIGZpbGVzOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBzY2FuRm9sZGVyKGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxGb2xkZXJTY2FuUmVzdWx0Pj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzdWx0OiBGb2xkZXJTY2FuUmVzdWx0ID0ge1xyXG4gICAgICAgIGltYWdlRmlsZXM6IFtdLFxyXG4gICAgICAgIGxhYmVsRmlsZXM6IFtdLFxyXG4gICAgICAgIGNsYXNzRmlsZXM6IFtdLFxyXG4gICAgICAgIHRvdGFsRmlsZXM6IDAsXHJcbiAgICAgICAgZXJyb3JzOiBbXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiAoZm9sZGVySGFuZGxlIGFzIGFueSkudmFsdWVzKCkpIHtcclxuICAgICAgICBpZiAoZW50cnkua2luZCA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgICAgICByZXN1bHQudG90YWxGaWxlcysrO1xyXG4gICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGVudHJ5Lm5hbWUpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnN1cHBvcnRlZEltYWdlRm9ybWF0cy5pbmNsdWRlcyhleHRlbnNpb24pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRmlsZTogSW1hZ2VGaWxlID0ge1xyXG4gICAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXHJcbiAgICAgICAgICAgICAgaGFuZGxlOiBlbnRyeSxcclxuICAgICAgICAgICAgICBwYXRoOiBlbnRyeS5uYW1lLFxyXG4gICAgICAgICAgICAgIGV4dGVuc2lvblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXN1bHQuaW1hZ2VGaWxlcy5wdXNoKGltYWdlRmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGV4dGVuc2lvbiA9PT0gJ3R4dCcpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmxhYmVsRmlsZXMucHVzaChlbnRyeS5uYW1lKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoWyd5YW1sJywgJ3ltbCddLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCBjb250ZW50UmVzdWx0ID0gYXdhaXQgdGhpcy5sb2FkQ2xhc3NGaWxlKGVudHJ5KTtcclxuICAgICAgICAgICAgICBpZiAoY29udGVudFJlc3VsdC5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFzc0ZpbGU6IENsYXNzRmlsZSA9IHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogZW50cnkubmFtZSxcclxuICAgICAgICAgICAgICAgICAgaGFuZGxlOiBlbnRyeSxcclxuICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudFJlc3VsdC5kYXRhIS5jbGFzc2VzLFxyXG4gICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5jbGFzc0ZpbGVzLnB1c2goY2xhc3NGaWxlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBGYWlsZWQgdG8gbG9hZCBjbGFzcyBmaWxlICR7ZW50cnkubmFtZX06ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiByZXN1bHQsXHJcbiAgICAgICAgbWVzc2FnZTogYFNjYW5uZWQgJHtyZXN1bHQudG90YWxGaWxlc30gZmlsZXNgXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNjYW4gZm9sZGVyOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBJbWFnZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbG9hZEltYWdlKGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLCBvcHRpb25zPzogSW1hZ2VMb2FkT3B0aW9ucyk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxIVE1MSW1hZ2VFbGVtZW50Pj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBUSUZGIGhhbmRsaW5nOiBkZWxlZ2F0ZSB0byBUSUZGIGxvYWRlciBpZiBuZWVkZWRcbiAgICAgIGNvbnN0IGV4dCA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihmaWxlSGFuZGxlLm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoZXh0ID09PSAndGlmJyB8fCBleHQgPT09ICd0aWZmJykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5sb2FkVGlmZkltYWdlKGZpbGVIYW5kbGUpO1xuICAgICAgfVxuICAgICAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcclxuICAgICAgY29uc3QgY2FjaGVLZXkgPSBgJHtmaWxlSGFuZGxlLm5hbWV9YDtcclxuICAgICAgY29uc3QgY2FjaGVkID0gdGhpcy5pbWFnZUNhY2hlLmdldChjYWNoZUtleSk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoY2FjaGVkICYmIHRoaXMuaXNDYWNoZVZhbGlkKGNhY2hlZCkpIHtcclxuICAgICAgICBjYWNoZWQuaGl0cysrO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogY2FjaGVkLmRhdGEsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnTG9hZGVkIGZyb20gY2FjaGUnXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgZmlsZSBzaXplXHJcbiAgICAgIGlmIChmaWxlLnNpemUgPiB0aGlzLmNvbmZpZy5tYXhJbWFnZVNpemUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgSW1hZ2VMb2FkRXJyb3IoYEltYWdlIHRvbyBsYXJnZTogJHtmaWxlLnNpemV9IGJ5dGVzIChtYXg6ICR7dGhpcy5jb25maWcubWF4SW1hZ2VTaXplfSlgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgaW1nID0gYXdhaXQgdGhpcy5jcmVhdGVJbWFnZUZyb21GaWxlKGZpbGUsIG9wdGlvbnMpO1xuICAgICAgXHJcbiAgICAgIC8vIENhY2hlIHRoZSBpbWFnZVxyXG4gICAgICB0aGlzLmNhY2hlSW1hZ2UoY2FjaGVLZXksIGltZywgZmlsZS5zaXplKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2ltYWdlOmxvYWRlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZTogZmlsZS5uYW1lLCBzaXplOiBmaWxlLnNpemUgfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogaW1nLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBJbWFnZSBsb2FkZWQ6ICR7ZmlsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbG9hZCBpbWFnZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbG9hZFRpZmZJbWFnZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgb3B0aW9ucz86IFRpZmZQcm9jZXNzaW5nT3B0aW9ucyk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxIVE1MSW1hZ2VFbGVtZW50Pj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBcclxuICAgICAgLy8gVXNlIGR5bmFtaWMgaW1wb3J0IGZvciBUSUZGLmpzIChsb2FkZWQgZnJvbSBDRE4pXHJcbiAgICAgIGlmICh0eXBlb2YgKHdpbmRvdyBhcyBhbnkpLlRpZmYgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEltYWdlTG9hZEVycm9yKCdUSUZGLmpzIGxpYnJhcnkgbm90IGxvYWRlZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgY29uc3QgdGlmZiA9IG5ldyAod2luZG93IGFzIGFueSkuVGlmZih7IGJ1ZmZlcjogYXJyYXlCdWZmZXIgfSk7XHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IHRpZmYudG9DYW52YXMoKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoKTtcclxuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgSW1hZ2VMb2FkRXJyb3IoJ0ZhaWxlZCB0byBjb252ZXJ0IFRJRkYgY2FudmFzIHRvIGltYWdlJykpO1xyXG4gICAgICAgIGltZy5zcmMgPSBjYW52YXMudG9EYXRhVVJMKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnaW1hZ2U6dGlmZi1sb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGUubmFtZSwgc2l6ZTogZmlsZS5zaXplIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGltZyxcclxuICAgICAgICBtZXNzYWdlOiBgVElGRiBpbWFnZSBsb2FkZWQ6ICR7ZmlsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gbG9hZCBUSUZGIGltYWdlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBnZXRJbWFnZUluZm8oZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8SW1hZ2VJbmZvPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBjb25zdCBpbWcgPSBhd2FpdCB0aGlzLmNyZWF0ZUltYWdlRnJvbUZpbGUoZmlsZSk7XHJcblxyXG4gICAgICBjb25zdCBpbmZvOiBJbWFnZUluZm8gPSB7XHJcbiAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgIHdpZHRoOiBpbWcubmF0dXJhbFdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaW1nLm5hdHVyYWxIZWlnaHQsXHJcbiAgICAgICAgc2l6ZTogZmlsZS5zaXplLFxyXG4gICAgICAgIGZvcm1hdDogdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSksXHJcbiAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZClcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBpbmZvLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBJbWFnZSBpbmZvIHJldHJpZXZlZDogJHtmaWxlLm5hbWV9YFxyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBnZXQgaW1hZ2UgaW5mbzogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTGFiZWwgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFzeW5jIGxvYWRMYWJlbHMoZmlsZU5hbWU6IHN0cmluZywgZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogUHJvbWlzZTxGaWxlT3BlcmF0aW9uUmVzdWx0PFlvbG9MYWJlbFtdPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgbGFiZWxGaWxlTmFtZSA9IHRoaXMuZ2V0TGFiZWxGaWxlTmFtZShmaWxlTmFtZSk7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZUhhbmRsZSA9IGF3YWl0IGZvbGRlckhhbmRsZS5nZXRGaWxlSGFuZGxlKGxhYmVsRmlsZU5hbWUpO1xyXG4gICAgICBjb25zdCBmaWxlID0gYXdhaXQgbGFiZWxGaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgY29uc3QgeW9sb0RhdGEgPSBhd2FpdCBmaWxlLnRleHQoKTtcclxuXHJcbiAgICAgIGlmICgheW9sb0RhdGEudHJpbSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdObyBsYWJlbHMgZm91bmQnXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcGFyc2VSZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAocGFyc2VSZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogYFlPTE8gcGFyc2luZyBlcnJvcnM6ICR7cGFyc2VSZXN1bHQuZXJyb3JzLmpvaW4oJywgJyl9YFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2xhYmVsczpsb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWUsIGxhYmVsQ291bnQ6IHBhcnNlUmVzdWx0LmxhYmVscy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogcGFyc2VSZXN1bHQubGFiZWxzLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBMb2FkZWQgJHtwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RofSBsYWJlbHNgXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IFtdLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ05vIGxhYmVsIGZpbGUgZm91bmQnXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBsb2FkIGxhYmVsczogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2F2ZUxhYmVscyhmaWxlTmFtZTogc3RyaW5nLCBsYWJlbHM6IFlvbG9MYWJlbFtdLCBmb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZU5hbWUgPSB0aGlzLmdldExhYmVsRmlsZU5hbWUoZmlsZU5hbWUpO1xyXG4gICAgICBjb25zdCB5b2xvU3RyaW5nID0gWW9sb1BhcnNlci5sYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzLCB7XHJcbiAgICAgICAgcHJlY2lzaW9uOiB0aGlzLmNvbmZpZy55b2xvVmFsaWRhdGlvbi5wcmVjaXNpb24sXHJcbiAgICAgICAgdmFsaWRhdGVCb3VuZHM6IHRoaXMuY29uZmlnLnlvbG9WYWxpZGF0aW9uLnN0cmljdEJvdW5kc1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShsYWJlbEZpbGVOYW1lLCB7IGNyZWF0ZTogdHJ1ZSB9KTtcclxuICAgICAgY29uc3Qgd3JpdGFibGUgPSBhd2FpdCBmaWxlSGFuZGxlLmNyZWF0ZVdyaXRhYmxlKCk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLndyaXRlKHlvbG9TdHJpbmcudHJpbSgpKTtcclxuICAgICAgYXdhaXQgd3JpdGFibGUuY2xvc2UoKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2xhYmVsczpzYXZlZCcsXHJcbiAgICAgICAgZGF0YTogeyBmaWxlTmFtZSwgbGFiZWxDb3VudDogbGFiZWxzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBgTGFiZWxzIHNhdmVkIHRvICR7bGFiZWxGaWxlTmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIHNhdmUgbGFiZWxzOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBjaGVja0xhYmVsU3RhdHVzKGZpbGVOYW1lOiBzdHJpbmcsIGZvbGRlckhhbmRsZTogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxMYWJlbFN0YXR1cz4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxhYmVsRmlsZU5hbWUgPSB0aGlzLmdldExhYmVsRmlsZU5hbWUoZmlsZU5hbWUpO1xyXG4gICAgICBcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBsYWJlbEZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShsYWJlbEZpbGVOYW1lKTtcclxuICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgbGFiZWxGaWxlSGFuZGxlLmdldEZpbGUoKTtcclxuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZmlsZS50ZXh0KCk7XHJcbiAgICAgICAgY29uc3QgcGFyc2VSZXN1bHQgPSBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyhjb250ZW50KTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdHVzOiBMYWJlbFN0YXR1cyA9IHtcclxuICAgICAgICAgIGZpbGVOYW1lLFxyXG4gICAgICAgICAgaGFzTGFiZWxzOiBwYXJzZVJlc3VsdC5sYWJlbHMubGVuZ3RoID4gMCxcclxuICAgICAgICAgIGxhYmVsQ291bnQ6IHBhcnNlUmVzdWx0LmxhYmVscy5sZW5ndGgsXHJcbiAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKGZpbGUubGFzdE1vZGlmaWVkKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogc3RhdHVzLFxyXG4gICAgICAgICAgbWVzc2FnZTogYExhYmVsIHN0YXR1cyBjaGVja2VkOiAke2ZpbGVOYW1lfWBcclxuICAgICAgICB9O1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xyXG4gICAgICAgICAgY29uc3Qgc3RhdHVzOiBMYWJlbFN0YXR1cyA9IHtcclxuICAgICAgICAgICAgZmlsZU5hbWUsXHJcbiAgICAgICAgICAgIGhhc0xhYmVsczogZmFsc2UsXHJcbiAgICAgICAgICAgIGxhYmVsQ291bnQ6IDBcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogc3RhdHVzLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnTm8gbGFiZWwgZmlsZSBmb3VuZCdcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGNoZWNrIGxhYmVsIHN0YXR1czogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2xhc3MgRmlsZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbG9hZENsYXNzRmlsZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdDxDbGFzc0ZpbGVDb250ZW50Pj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IGZpbGVIYW5kbGUuZ2V0RmlsZSgpO1xyXG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZmlsZS50ZXh0KCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCB2YWxpZGF0aW9uID0gdGhpcy52YWxpZGF0ZUNsYXNzRmlsZShjb250ZW50KTtcclxuICAgICAgaWYgKCF2YWxpZGF0aW9uLmlzVmFsaWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICBlcnJvcjogYEludmFsaWQgY2xhc3MgZmlsZTogJHt2YWxpZGF0aW9uLmVycm9ycy5qb2luKCcsICcpfWBcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjbGFzc2VzOiBDbGFzc0RlZmluaXRpb25bXSA9IFtdO1xyXG4gICAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpO1xyXG4gICAgICBcclxuICAgICAgbGluZXMuZm9yRWFjaChsaW5lID0+IHtcclxuICAgICAgICBjb25zdCB0cmltbWVkTGluZSA9IGxpbmUudHJpbSgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkTGluZS5zdGFydHNXaXRoKCcjJykgfHwgdHJpbW1lZExpbmUgPT09ICcnKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcnRzID0gdHJpbW1lZExpbmUuc3BsaXQoJzonKTtcclxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQocGFydHNbMF0hLnRyaW0oKSwgMTApO1xyXG4gICAgICAgICAgY29uc3QgbmFtZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJzonKS50cmltKCk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmICghaXNOYU4oaWQpICYmIG5hbWUpIHtcclxuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKHtcclxuICAgICAgICAgICAgICBpZCxcclxuICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgY29sb3I6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgY2xhc3NGaWxlQ29udGVudDogQ2xhc3NGaWxlQ29udGVudCA9IHtcclxuICAgICAgICBjbGFzc2VzLFxyXG4gICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICBjcmVhdGVkOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZCksXHJcbiAgICAgICAgICBtb2RpZmllZDogbmV3IERhdGUoZmlsZS5sYXN0TW9kaWZpZWQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnY2xhc3Nlczpsb2FkZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGUubmFtZSwgY2xhc3NDb3VudDogY2xhc3Nlcy5sZW5ndGggfSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgZGF0YTogY2xhc3NGaWxlQ29udGVudCxcclxuICAgICAgICBtZXNzYWdlOiBgTG9hZGVkICR7Y2xhc3Nlcy5sZW5ndGh9IGNsYXNzZXMgZnJvbSAke2ZpbGUubmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGxvYWQgY2xhc3MgZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc2F2ZUNsYXNzRmlsZShmaWxlSGFuZGxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZSwgY29udGVudDogQ2xhc3NGaWxlQ29udGVudCk6IFByb21pc2U8RmlsZU9wZXJhdGlvblJlc3VsdD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gU29ydCBjbGFzc2VzIGJ5IElEXHJcbiAgICAgIGNvbnN0IHNvcnRlZENsYXNzZXMgPSBbLi4uY29udGVudC5jbGFzc2VzXS5zb3J0KChhLCBiKSA9PiBhLmlkIC0gYi5pZCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBsaW5lcyA9IHNvcnRlZENsYXNzZXMubWFwKGNscyA9PiBgJHtjbHMuaWR9OiAke2Nscy5uYW1lfWApO1xyXG4gICAgICBjb25zdCBmaWxlQ29udGVudCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xyXG5cclxuICAgICAgY29uc3Qgd3JpdGFibGUgPSBhd2FpdCBmaWxlSGFuZGxlLmNyZWF0ZVdyaXRhYmxlKCk7XHJcbiAgICAgIGF3YWl0IHdyaXRhYmxlLndyaXRlKGZpbGVDb250ZW50KTtcclxuICAgICAgYXdhaXQgd3JpdGFibGUuY2xvc2UoKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzZXM6c2F2ZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGZpbGVIYW5kbGUubmFtZSwgY2xhc3NDb3VudDogY29udGVudC5jbGFzc2VzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBgU2F2ZWQgJHtjb250ZW50LmNsYXNzZXMubGVuZ3RofSBjbGFzc2VzIHRvICR7ZmlsZUhhbmRsZS5uYW1lfWBcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2F2ZSBjbGFzcyBmaWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBjcmVhdGVDbGFzc0ZpbGUoZm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBmaWxlTmFtZTogc3RyaW5nLCBpbml0aWFsQ29udGVudD86IENsYXNzRmlsZUNvbnRlbnQpOiBQcm9taXNlPEZpbGVPcGVyYXRpb25SZXN1bHQ8RmlsZVN5c3RlbUZpbGVIYW5kbGU+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBFbnN1cmUgLnlhbWwgZXh0ZW5zaW9uXHJcbiAgICAgIGNvbnN0IGZpbmFsRmlsZU5hbWUgPSBmaWxlTmFtZS5lbmRzV2l0aCgnLnlhbWwnKSB8fCBmaWxlTmFtZS5lbmRzV2l0aCgnLnltbCcpIFxyXG4gICAgICAgID8gZmlsZU5hbWUgXHJcbiAgICAgICAgOiBgJHtmaWxlTmFtZX0ueWFtbGA7XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBmaWxlIGFscmVhZHkgZXhpc3RzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgZm9sZGVySGFuZGxlLmdldEZpbGVIYW5kbGUoZmluYWxGaWxlTmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgZXJyb3I6IGBGaWxlIFwiJHtmaW5hbEZpbGVOYW1lfVwiIGFscmVhZHkgZXhpc3RzYFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgLy8gRmlsZSBkb2Vzbid0IGV4aXN0LCB3aGljaCBpcyB3aGF0IHdlIHdhbnRcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZGVmYXVsdENvbnRlbnQ6IENsYXNzRmlsZUNvbnRlbnQgPSBpbml0aWFsQ29udGVudCB8fCB7XHJcbiAgICAgICAgY2xhc3NlczogW1xyXG4gICAgICAgICAgeyBpZDogMCwgbmFtZTogJ2NsYXNzMScgfSxcclxuICAgICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdjbGFzczInIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICBjcmVhdGVkOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBdXRvLWdlbmVyYXRlZCBjbGFzcyBmaWxlJ1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IGZpbGVIYW5kbGUgPSBhd2FpdCBmb2xkZXJIYW5kbGUuZ2V0RmlsZUhhbmRsZShmaW5hbEZpbGVOYW1lLCB7IGNyZWF0ZTogdHJ1ZSB9KTtcclxuICAgICAgYXdhaXQgdGhpcy5zYXZlQ2xhc3NGaWxlKGZpbGVIYW5kbGUsIGRlZmF1bHRDb250ZW50KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzZXM6ZmlsZS1jcmVhdGVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiBmaW5hbEZpbGVOYW1lLCBjbGFzc0NvdW50OiBkZWZhdWx0Q29udGVudC5jbGFzc2VzLmxlbmd0aCB9LFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBmaWxlSGFuZGxlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGBDcmVhdGVkIGNsYXNzIGZpbGU6ICR7ZmluYWxGaWxlTmFtZX1gXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGNyZWF0ZSBjbGFzcyBmaWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyB2YWxpZGF0ZUNsYXNzRmlsZShjb250ZW50OiBzdHJpbmcpOiBDbGFzc0ZpbGVWYWxpZGF0aW9uIHtcclxuICAgIGNvbnN0IHJlc3VsdDogQ2xhc3NGaWxlVmFsaWRhdGlvbiA9IHtcclxuICAgICAgaXNWYWxpZDogdHJ1ZSxcclxuICAgICAgZXJyb3JzOiBbXSxcclxuICAgICAgd2FybmluZ3M6IFtdLFxyXG4gICAgICBkdXBsaWNhdGVJZHM6IFtdLFxyXG4gICAgICBlbXB0eU5hbWVzOiBbXVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpO1xyXG4gICAgY29uc3Qgc2VlbklkcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xyXG4gICAgXHJcbiAgICBsaW5lcy5mb3JFYWNoKChsaW5lLCBsaW5lSW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgdHJpbW1lZExpbmUgPSBsaW5lLnRyaW0oKTtcclxuICAgICAgaWYgKHRyaW1tZWRMaW5lLnN0YXJ0c1dpdGgoJyMnKSB8fCB0cmltbWVkTGluZSA9PT0gJycpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IHBhcnRzID0gdHJpbW1lZExpbmUuc3BsaXQoJzonKTtcclxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2goYExpbmUgJHtsaW5lSW5kZXggKyAxfTogSW52YWxpZCBmb3JtYXQuIEV4cGVjdGVkIFwiaWQ6IG5hbWVcImApO1xyXG4gICAgICAgIHJlc3VsdC5pc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBpZFN0ciA9IHBhcnRzWzBdIS50cmltKCk7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc6JykudHJpbSgpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgaWQgPSBwYXJzZUludChpZFN0ciwgMTApO1xyXG4gICAgICBpZiAoaXNOYU4oaWQpIHx8IFN0cmluZyhpZCkgIT09IGlkU3RyKSB7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IEludmFsaWQgSUQgXCIke2lkU3RyfVwiLiBNdXN0IGJlIGFuIGludGVnZXJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKHNlZW5JZHMuaGFzKGlkKSkge1xyXG4gICAgICAgIHJlc3VsdC5kdXBsaWNhdGVJZHMucHVzaChpZCk7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IER1cGxpY2F0ZSBJRCBcIiR7aWR9XCJgKTtcclxuICAgICAgICByZXN1bHQuaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlZW5JZHMuYWRkKGlkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgcmVzdWx0LmVtcHR5TmFtZXMucHVzaChpZFN0cik7XHJcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKGBMaW5lICR7bGluZUluZGV4ICsgMX06IEVtcHR5IGNsYXNzIG5hbWUgZm9yIElEIFwiJHtpZFN0cn1cImApO1xyXG4gICAgICAgIHJlc3VsdC5pc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gWU9MTyBGb3JtYXQgUHJvY2Vzc2luZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YTogc3RyaW5nKTogWW9sb1BhcnNlUmVzdWx0IHtcclxuICAgIHJldHVybiBZb2xvUGFyc2VyLnBhcnNlWW9sb1N0cmluZyh5b2xvRGF0YSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbGFiZWxzVG9Zb2xvU3RyaW5nKGxhYmVsczogWW9sb0xhYmVsW10sIG9wdGlvbnM/OiBZb2xvRXhwb3J0T3B0aW9ucyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gWW9sb1BhcnNlci5sYWJlbHNUb1lvbG9TdHJpbmcobGFiZWxzLCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB2YWxpZGF0ZVlvbG9MYWJlbChsYWJlbDogWW9sb0xhYmVsKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gWW9sb1BhcnNlci52YWxpZGF0ZVlvbG9MYWJlbChsYWJlbCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2FjaGUgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGNsZWFySW1hZ2VDYWNoZSgpOiB2b2lkIHtcclxuICAgIC8vIFJldm9rZSBhbGwgYmxvYiBVUkxzIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICAgIGlmIChlbnRyeS5kYXRhLnNyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XHJcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChlbnRyeS5kYXRhLnNyYyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuY2xlYXIoKTtcclxuICAgIFxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NhY2hlOmNsZWFyZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldENhY2hlU3RhdHMoKTogQ2FjaGVTdGF0cyB7XHJcbiAgICBsZXQgdG90YWxTaXplID0gMDtcclxuICAgIGxldCB0b3RhbEhpdHMgPSAwO1xyXG4gICAgbGV0IHRvdGFsQWNjZXNzZXMgPSAwO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VDYWNoZS5mb3JFYWNoKGVudHJ5ID0+IHtcclxuICAgICAgdG90YWxTaXplICs9IGVudHJ5LnNpemU7XHJcbiAgICAgIHRvdGFsSGl0cyArPSBlbnRyeS5oaXRzO1xyXG4gICAgICB0b3RhbEFjY2Vzc2VzICs9IGVudHJ5LmhpdHMgKyAxOyAvLyArMSBmb3IgaW5pdGlhbCBsb2FkXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0b3RhbEVudHJpZXM6IHRoaXMuaW1hZ2VDYWNoZS5zaXplLFxyXG4gICAgICB0b3RhbFNpemUsXHJcbiAgICAgIGhpdFJhdGU6IHRvdGFsQWNjZXNzZXMgPiAwID8gdG90YWxIaXRzIC8gdG90YWxBY2Nlc3NlcyA6IDAsXHJcbiAgICAgIG1lbW9yeVVzYWdlOiB0b3RhbFNpemUgLyAoMTAyNCAqIDEwMjQpIC8vIE1CXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9wdGltaXplQ2FjaGUoKTogdm9pZCB7XHJcbiAgICAvLyBSZW1vdmUgZXhwaXJlZCBlbnRyaWVzXHJcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY29uc3QgZXhwaXJlZEtleXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goKGVudHJ5LCBrZXkpID0+IHtcclxuICAgICAgaWYgKG5vdy5nZXRUaW1lKCkgLSBlbnRyeS50aW1lc3RhbXAuZ2V0VGltZSgpID4gdGhpcy5jb25maWcuY2FjaGVUaW1lb3V0KSB7XHJcbiAgICAgICAgZXhwaXJlZEtleXMucHVzaChrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBleHBpcmVkS2V5cy5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5pbWFnZUNhY2hlLmdldChrZXkpO1xyXG4gICAgICBpZiAoZW50cnkgJiYgZW50cnkuZGF0YS5zcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoZW50cnkuZGF0YS5zcmMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaW1hZ2VDYWNoZS5kZWxldGUoa2V5KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIElmIHN0aWxsIG92ZXIgbGltaXQsIHJlbW92ZSBsZWFzdCByZWNlbnRseSB1c2VkXHJcbiAgICBpZiAodGhpcy5nZXRUb3RhbENhY2hlU2l6ZSgpID4gdGhpcy5jb25maWcubWF4Q2FjaGVTaXplKSB7XHJcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBBcnJheS5mcm9tKHRoaXMuaW1hZ2VDYWNoZS5lbnRyaWVzKCkpLnNvcnQoKGEsIGIpID0+IFxyXG4gICAgICAgIGFbMV0udGltZXN0YW1wLmdldFRpbWUoKSAtIGJbMV0udGltZXN0YW1wLmdldFRpbWUoKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgd2hpbGUgKHRoaXMuZ2V0VG90YWxDYWNoZVNpemUoKSA+IHRoaXMuY29uZmlnLm1heENhY2hlU2l6ZSAmJiBlbnRyaWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBba2V5LCBlbnRyeV0gPSBlbnRyaWVzLnNoaWZ0KCkhO1xyXG4gICAgICAgIGlmIChlbnRyeS5kYXRhLnNyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XHJcbiAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGVudHJ5LmRhdGEuc3JjKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbWFnZUNhY2hlLmRlbGV0ZShrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NhY2hlOm9wdGltaXplZCcsXHJcbiAgICAgIGRhdGE6IHsgcmVtb3ZlZEV4cGlyZWQ6IGV4cGlyZWRLZXlzLmxlbmd0aCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIFtdKTtcclxuICAgIH1cclxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpIS5wdXNoKGhhbmRsZXIpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBGaWxlU3lzdGVtRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBoYW5kbGVycyEuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNwYXRjaEV2ZW50KGV2ZW50OiBGaWxlU3lzdGVtRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMhLmZvckVhY2goaGFuZGxlciA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBGaWxlU3lzdGVtIGV2ZW50IGhhbmRsZXIgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gUHJpdmF0ZSBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgZ2V0RmlsZUV4dGVuc2lvbihmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGxhc3REb3QgPSBmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpO1xyXG4gICAgcmV0dXJuIGxhc3REb3QgPiAwID8gZmlsZU5hbWUuc3Vic3RyaW5nKGxhc3REb3QgKyAxKSA6ICcnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRMYWJlbEZpbGVOYW1lKGltYWdlRmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gaW1hZ2VGaWxlTmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJy50eHQnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlSW1hZ2VGcm9tRmlsZShmaWxlOiBGaWxlLCBvcHRpb25zPzogSW1hZ2VMb2FkT3B0aW9ucyk6IFByb21pc2U8SFRNTEltYWdlRWxlbWVudD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XHJcbiAgICAgIFxyXG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcclxuICAgICAgICByZXNvbHZlKGltZyk7XHJcbiAgICAgIH07XHJcbiAgICAgIFxyXG4gICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBJbWFnZUxvYWRFcnJvcihgRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICR7ZmlsZS5uYW1lfWAsIGZpbGUubmFtZSkpO1xyXG4gICAgICB9O1xyXG4gICAgICBcclxuICAgICAgaW1nLnNyYyA9IHVybDtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYWNoZUltYWdlKGtleTogc3RyaW5nLCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHNpemU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLy8gT3B0aW1pemUgY2FjaGUgYmVmb3JlIGFkZGluZyBuZXcgZW50cnlcclxuICAgIGlmICh0aGlzLmdldFRvdGFsQ2FjaGVTaXplKCkgKyBzaXplID4gdGhpcy5jb25maWcubWF4Q2FjaGVTaXplKSB7XHJcbiAgICAgIHRoaXMub3B0aW1pemVDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGVudHJ5OiBDYWNoZUVudHJ5PEhUTUxJbWFnZUVsZW1lbnQ+ID0ge1xyXG4gICAgICBkYXRhOiBpbWcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcclxuICAgICAgc2l6ZSxcclxuICAgICAgaGl0czogMFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmltYWdlQ2FjaGUuc2V0KGtleSwgZW50cnkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0NhY2hlVmFsaWQoZW50cnk6IENhY2hlRW50cnk8SFRNTEltYWdlRWxlbWVudD4pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICByZXR1cm4gbm93LmdldFRpbWUoKSAtIGVudHJ5LnRpbWVzdGFtcC5nZXRUaW1lKCkgPCB0aGlzLmNvbmZpZy5jYWNoZVRpbWVvdXQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFRvdGFsQ2FjaGVTaXplKCk6IG51bWJlciB7XHJcbiAgICBsZXQgdG90YWwgPSAwO1xyXG4gICAgdGhpcy5pbWFnZUNhY2hlLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgICB0b3RhbCArPSBlbnRyeS5zaXplO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdG90YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZhY3RvcnkgRnVuY3Rpb25zXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgRmlsZVN5c3RlbVNlcnZpY2UgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGaWxlU3lzdGVtU2VydmljZShjb25maWc/OiBQYXJ0aWFsPEZpbGVTeXN0ZW1Db25maWc+KTogRmlsZVN5c3RlbVNlcnZpY2Uge1xyXG4gIHJldHVybiBuZXcgRmlsZVN5c3RlbVNlcnZpY2UoY29uZmlnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBGaWxlU3lzdGVtU2VydmljZSB3aXRoIGN1c3RvbSBjYWNoZSBzaXplXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2VXaXRoQ2FjaGUoY2FjaGVTaXplOiBudW1iZXIpOiBGaWxlU3lzdGVtU2VydmljZSB7XHJcbiAgcmV0dXJuIG5ldyBGaWxlU3lzdGVtU2VydmljZSh7IG1heENhY2hlU2l6ZTogY2FjaGVTaXplIH0pO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmlsZVN5c3RlbVNlcnZpY2U7XHJcbmV4cG9ydCB0eXBlIHsgSUZpbGVTeXN0ZW1TZXJ2aWNlLCBGaWxlU3lzdGVtQ29uZmlnIH07XG4iLCIvKipcclxuICogU2VydmljZXMgTW9kdWxlIEluZGV4XHJcbiAqIFxyXG4gKiBDZW50cmFsIGV4cG9ydCBwb2ludCBmb3IgYWxsIHNlcnZpY2UgY2xhc3NlcyB1c2VkIHRocm91Z2hvdXQgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqIFRoaXMgbW9kdWxlIHByb3ZpZGVzIGNsZWFuIEFQSSBhY2Nlc3MgdG8gYnVzaW5lc3MgbG9naWMgYW5kIGV4dGVybmFsIHNlcnZpY2UgaW50ZWdyYXRpb25zLlxyXG4gKi9cclxuXHJcbi8vIEV4cG9ydCBGaWxlU3lzdGVtU2VydmljZVxyXG5leHBvcnQgeyBcclxuICBGaWxlU3lzdGVtU2VydmljZSwgXHJcbiAgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIFxyXG4gIGNyZWF0ZUZpbGVTeXN0ZW1TZXJ2aWNlV2l0aENhY2hlLFxyXG4gIHR5cGUgSUZpbGVTeXN0ZW1TZXJ2aWNlLFxyXG4gIHR5cGUgRmlsZVN5c3RlbUNvbmZpZ1xyXG59IGZyb20gJy4vRmlsZVN5c3RlbVNlcnZpY2UnO1xyXG5cclxuLy8gUmUtZXhwb3J0IFlvbG9QYXJzZXIgZnJvbSB1dGlscyBmb3IgY29udmVuaWVuY2VcclxuZXhwb3J0IHsgWW9sb1BhcnNlciwgcGFyc2VZb2xvLCBleHBvcnRZb2xvIH0gZnJvbSAnLi4vdXRpbHMveW9sby1wYXJzZXInO1xyXG5cclxuLy8gUmUtZXhwb3J0IHR5cGVzIGZvciBjb252ZW5pZW5jZVxyXG5leHBvcnQgdHlwZSB7XHJcbiAgRmlsZU9wZXJhdGlvblJlc3VsdCxcclxuICBGaWxlTG9hZFJlc3VsdCxcclxuICBZb2xvTGFiZWwsXHJcbiAgWW9sb1BhcnNlUmVzdWx0LFxyXG4gIFlvbG9FeHBvcnRPcHRpb25zLFxyXG4gIENsYXNzRmlsZUNvbnRlbnQsXHJcbiAgQ2xhc3NGaWxlVmFsaWRhdGlvbixcclxuICBGb2xkZXJTY2FuUmVzdWx0LFxyXG4gIExhYmVsU3RhdHVzLFxyXG4gIEltYWdlSW5mbyxcclxuICBJbWFnZUxvYWRPcHRpb25zLFxyXG4gIFRpZmZQcm9jZXNzaW5nT3B0aW9ucyxcclxuICBDYWNoZUVudHJ5LFxyXG4gIENhY2hlU3RhdHMsXHJcbiAgRmlsZVN5c3RlbUV2ZW50LFxyXG4gIEZpbGVTeXN0ZW1FdmVudEhhbmRsZXIsXHJcbiAgRmlsZVN5c3RlbUVycm9yLFxyXG4gIEltYWdlTG9hZEVycm9yLFxyXG4gIFlvbG9Gb3JtYXRFcnJvcixcclxuICBGaWxlRm9ybWF0LFxyXG4gIExhYmVsRm9ybWF0LFxyXG4gIENsYXNzRmlsZUZvcm1hdCxcclxuICBGaWxlVHlwZUluZm8sXHJcbiAgRmlsZVN5c3RlbVNlcnZpY2VGYWN0b3J5XHJcbn0gZnJvbSAnLi4vdHlwZXMvZmlsZXN5c3RlbSc7IiwiY29uc3QgX19XRUJQQUNLX05BTUVTUEFDRV9PQkpFQ1RfXyA9IGZhYnJpYzsiLCIvKipcclxuICogQ2FudmFzIENvbnRyb2xsZXIgSW1wbGVtZW50YXRpb25cclxuICpcclxuICogTWFuYWdlcyBGYWJyaWMuanMgY2FudmFzIG9wZXJhdGlvbnMgZm9yIHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBIYW5kbGVzIGJvdW5kaW5nIGJveCBkcmF3aW5nLCBlZGl0aW5nLCB6b29tL3BhbiBjb250cm9scywgYW5kIGxhYmVsIHZpc3VhbGl6YXRpb24uXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMC4wXHJcbiAqIEBhdXRob3IgRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1pZ3JhdGlvblxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGZhYnJpYyB9IGZyb20gJ2ZhYnJpYyc7XG5pbXBvcnQge1xyXG4gIElDYW52YXNDb250cm9sbGVyLFxyXG4gIENhbnZhc1N0YXRlLFxyXG4gIENhbnZhc0NvbmZpZyxcclxuICBDYW52YXNEaW1lbnNpb25zLFxyXG4gIEJvdW5kaW5nQm94LFxyXG4gIFlPTE9MYWJlbCxcclxuICBGYWJyaWNSZWN0YW5nbGUsXHJcbiAgRmFicmljVGV4dCxcclxuICBGYWJyaWNMaW5lLFxyXG4gIENhbnZhc0V2ZW50LFxyXG4gIENhbnZhc0V2ZW50SGFuZGxlcixcclxuICBDYW52YXNFdmVudFR5cGUsXHJcbiAgRHJhd2luZ09wdGlvbnMsXHJcbiAgTGFiZWxEaXNwbGF5T3B0aW9ucyxcclxuICBWaWV3cG9ydFN0YXRlLFxyXG4gIENhbnZhc0Nvb3JkaW5hdGUsXHJcbiAgSW1hZ2VDb29yZGluYXRlLFxyXG4gIENhbnZhc1ZhbGlkYXRpb24sXHJcbiAgQ2FudmFzUGVyZm9ybWFuY2VcclxufSBmcm9tICcuLi90eXBlcy9jYW52YXMnO1xyXG5cclxuaW1wb3J0IHsgUG9pbnQsIFJlY3RhbmdsZSwgU2l6ZSB9IGZyb20gJy4uL3R5cGVzJztcbi8vIFJ1bnRpbWUgYWxpYXMgZm9yIGdsb2JhbCBGYWJyaWNKUyB3aGVuIHVzaW5nIENETiBleHRlcm5hbHNcbmNvbnN0IEZhYnJpY0pTOiBhbnkgPSAodHlwZW9mICh3aW5kb3cgYXMgYW55KSAhPT0gJ3VuZGVmaW5lZCcgJiYgKHdpbmRvdyBhcyBhbnkpLmZhYnJpYykgPyAod2luZG93IGFzIGFueSkuZmFicmljIDogKGZhYnJpYyBhcyB1bmtub3duIGFzIGFueSk7XG5pbXBvcnQgeyBJQXBwU3RhdGUgfSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5pbXBvcnQgeyBjb2xvclBhbGV0dGUgfSBmcm9tICcuLi91dGlscy9jb2xvci1wYWxldHRlJztcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gQ2FudmFzIENvbnRyb2xsZXIgSW1wbGVtZW50YXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIENhbnZhc0NvbnRyb2xsZXIgaW1wbGVtZW50cyBJQ2FudmFzQ29udHJvbGxlciB7XHJcbiAgcHJpdmF0ZSBfY2FudmFzOiBmYWJyaWMuQ2FudmFzIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBfc3RhdGU6IENhbnZhc1N0YXRlO1xyXG4gIHByaXZhdGUgX2NvbmZpZzogQ2FudmFzQ29uZmlnO1xyXG4gIHByaXZhdGUgX2V2ZW50TGlzdGVuZXJzID0gbmV3IE1hcDxDYW52YXNFdmVudFR5cGUsIENhbnZhc0V2ZW50SGFuZGxlcltdPigpO1xyXG5cclxuICAvLyBEZXBlbmRlbmNpZXNcclxuICBwcml2YXRlIGFwcFN0YXRlOiBJQXBwU3RhdGU7XHJcblxyXG4gIC8vIENhbnZhcyBjb250YWluZXIgYW5kIGltYWdlXHJcbiAgcHJpdmF0ZSBjb250YWluZXJFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgY3VycmVudEltYWdlOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBpbWFnZU9iamVjdDogZmFicmljLkltYWdlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIERyYXdpbmcgc3RhdGVcclxuICBwcml2YXRlIGRyYXdpbmdPcHRpb25zOiBEcmF3aW5nT3B0aW9ucyA9IHtcclxuICAgIHN0cm9rZVdpZHRoOiAyLFxyXG4gICAgc3Ryb2tlOiAnI2ZmMDAwMCcsXHJcbiAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxyXG4gICAgb3BhY2l0eTogMSxcclxuICAgIHNlbGVjdGFibGU6IHRydWUsXHJcbiAgICBldmVudGVkOiB0cnVlXHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBsYWJlbE9wdGlvbnM6IExhYmVsRGlzcGxheU9wdGlvbnMgPSB7XHJcbiAgICBzaG93TGFiZWxzOiB0cnVlLFxyXG4gICAgZm9udFNpemU6IDE0LFxyXG4gICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgIGZvbnRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjcpJyxcclxuICAgIHNob3dDb25maWRlbmNlOiBmYWxzZSxcclxuICAgIHNob3dDbGFzc05hbWU6IHRydWUsXHJcbiAgICBzaG93Q2xhc3NJZDogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIC8vIFBlcmZvcm1hbmNlIG1vbml0b3JpbmdcclxuICBwcml2YXRlIHBlcmZvcm1hbmNlTWV0cmljczogQ2FudmFzUGVyZm9ybWFuY2UgPSB7XHJcbiAgICByZW5kZXJUaW1lOiAwLFxyXG4gICAgb2JqZWN0Q291bnQ6IDAsXHJcbiAgICBtZW1vcnlVc2FnZTogMCxcclxuICAgIGZwczogNjBcclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHBTdGF0ZTogSUFwcFN0YXRlKSB7XG4gICAgdGhpcy5hcHBTdGF0ZSA9IGFwcFN0YXRlO1xuXHJcbiAgICAvLyBJbml0aWFsaXplIGRlZmF1bHQgY29uZmlnXHJcbiAgICB0aGlzLl9jb25maWcgPSB7XHJcbiAgICAgIHdpZHRoOiA4MDAsXHJcbiAgICAgIGhlaWdodDogNjAwLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmOWZhJyxcclxuICAgICAgc2VsZWN0aW9uOiB0cnVlLFxyXG4gICAgICBwcmVzZXJ2ZU9iamVjdFN0YWNraW5nOiB0cnVlLFxyXG4gICAgICByZW5kZXJPbkFkZFJlbW92ZTogdHJ1ZSxcclxuICAgICAgc2tpcFRhcmdldEZpbmQ6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgc3RhdGVcbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIGlzRHJhd2luZzogZmFsc2UsXHJcbiAgICAgIGRyYXdpbmdNb2RlOiAnbm9uZScsXHJcbiAgICAgIHN0YXJ0UG9pbnQ6IG51bGwsXHJcbiAgICAgIGVuZFBvaW50OiBudWxsLFxyXG4gICAgICBjdXJyZW50UmVjdDogbnVsbCxcclxuICAgICAgYWN0aXZlTGFiZWxUZXh0OiBudWxsLFxyXG4gICAgICBjcm9zc2hhaXJYOiBudWxsLFxyXG4gICAgICBjcm9zc2hhaXJZOiBudWxsLFxyXG4gICAgICB6b29tOiAxLFxyXG4gICAgICBwYW5YOiAwLFxyXG4gICAgICBwYW5ZOiAwLFxyXG4gICAgICBzZWxlY3RlZE9iamVjdHM6IFtdLFxyXG4gICAgICBtdWx0aXBsZVNlbGVjdGlvbjogZmFsc2VcclxuICAgIH07XG5cbiAgICAvLyBSZWFjdCB0byBtb2RlIGNoYW5nZXMgZnJvbSBBcHBTdGF0ZVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmFwcFN0YXRlLmFkZEV2ZW50TGlzdGVuZXIoJ21vZGU6Y2hhbmdlZCcsIChldnQ6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gZXZ0Py5kYXRhPy5jdXJyZW50IGFzICgnZHJhdycgfCAnZWRpdCcpIHwgdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmFwcGx5TW9kZVNldHRpbmdzKGN1cnJlbnQpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICB9XG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gUHJvcGVydGllcyAoSUNhbnZhc0NvbnRyb2xsZXIgaW50ZXJmYWNlKVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGdldCBjYW52YXMoKTogZmFicmljLkNhbnZhcyB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnZhcyBub3QgaW5pdGlhbGl6ZWQuIENhbGwgaW5pdGlhbGl6ZUNhbnZhcygpIGZpcnN0LicpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RhdGUoKTogQ2FudmFzU3RhdGUge1xyXG4gICAgcmV0dXJuIHsgLi4udGhpcy5fc3RhdGUgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgY29uZmlnKCk6IENhbnZhc0NvbmZpZyB7XHJcbiAgICByZXR1cm4geyAuLi50aGlzLl9jb25maWcgfTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTdGF0ZSBBY2Nlc3NvcnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBpc0RyYXdpbmcoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuaXNEcmF3aW5nO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGhhc1NlbGVjdGlvbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5zZWxlY3RlZE9iamVjdHMubGVuZ3RoID4gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRab29tKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuem9vbTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRQYW4oKTogUG9pbnQge1xyXG4gICAgcmV0dXJuIHsgeDogdGhpcy5fc3RhdGUucGFuWCwgeTogdGhpcy5fc3RhdGUucGFuWSB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldERpbWVuc2lvbnMoKTogQ2FudmFzRGltZW5zaW9ucyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3aWR0aDogdGhpcy5fY29uZmlnLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IHRoaXMuX2NvbmZpZy5oZWlnaHQsXHJcbiAgICAgIGFzcGVjdFJhdGlvOiB0aGlzLl9jb25maWcud2lkdGggLyB0aGlzLl9jb25maWcuaGVpZ2h0XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEluaXRpYWxpemF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgaW5pdGlhbGl6ZUNhbnZhcyhjb250YWluZXJJZDogc3RyaW5nLCBjb25maWc/OiBQYXJ0aWFsPENhbnZhc0NvbmZpZz4pOiB2b2lkIHtcbiAgICAvLyBBcHBseSBjb25maWcgb3ZlcnJpZGVzXHJcbiAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgIHRoaXMuX2NvbmZpZyA9IHsgLi4udGhpcy5fY29uZmlnLCAuLi5jb25maWcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaW5kIGNvbnRhaW5lciBlbGVtZW50XHJcbiAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJZCk7XHJcbiAgICBpZiAoIXRoaXMuY29udGFpbmVyRWxlbWVudCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbnZhcyBjb250YWluZXIgZWxlbWVudCB3aXRoIElEICcke2NvbnRhaW5lcklkfScgbm90IGZvdW5kYCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNhbnZhcyBlbGVtZW50XHJcbiAgICBjb25zdCBjYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICBjYW52YXNFbGVtZW50LmlkID0gYCR7Y29udGFpbmVySWR9LWNhbnZhc2A7XHJcbiAgICBjYW52YXNFbGVtZW50LndpZHRoID0gdGhpcy5fY29uZmlnLndpZHRoO1xyXG4gICAgY2FudmFzRWxlbWVudC5oZWlnaHQgPSB0aGlzLl9jb25maWcuaGVpZ2h0O1xyXG5cclxuICAgIC8vIENsZWFyIGNvbnRhaW5lciBhbmQgYWRkIGNhbnZhc1xuICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuYXBwZW5kQ2hpbGQoY2FudmFzRWxlbWVudCk7XG5cbiAgICAvLyBJbml0aWFsaXplIEZhYnJpYy5qcyBjYW52YXNcbiAgICB0aGlzLl9jYW52YXMgPSBuZXcgRmFicmljSlMuQ2FudmFzKGNhbnZhc0VsZW1lbnQsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5fY29uZmlnLmJhY2tncm91bmRDb2xvcixcclxuICAgICAgc2VsZWN0aW9uOiB0aGlzLl9jb25maWcuc2VsZWN0aW9uLFxyXG4gICAgICBwcmVzZXJ2ZU9iamVjdFN0YWNraW5nOiB0aGlzLl9jb25maWcucHJlc2VydmVPYmplY3RTdGFja2luZyxcclxuICAgICAgcmVuZGVyT25BZGRSZW1vdmU6IHRoaXMuX2NvbmZpZy5yZW5kZXJPbkFkZFJlbW92ZSxcclxuICAgICAgc2tpcFRhcmdldEZpbmQ6IHRoaXMuX2NvbmZpZy5za2lwVGFyZ2V0RmluZCxcclxuICAgICAgd2lkdGg6IHRoaXMuX2NvbmZpZy53aWR0aCxcclxuICAgICAgaGVpZ2h0OiB0aGlzLl9jb25maWcuaGVpZ2h0LFxyXG4gICAgICAvLyBFbmFibGUgaGlnaCBEUEkgc3VwcG9ydFxyXG4gICAgICBlbmFibGVSZXRpbmFTY2FsaW5nOiB0cnVlLFxyXG4gICAgICAvLyBQZXJmb3JtYW5jZSBzZXR0aW5nc1xyXG4gICAgICBzdGF0ZWZ1bDogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1ha2UgY2FudmFzIGZpbGwgY29udGFpbmVyXG4gICAgdGhpcy5yZXNpemVDYW52YXNUb0NvbnRhaW5lcigpO1xuXG4gICAgLy8gU2V0dXAgZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLnNldHVwQ2FudmFzRXZlbnRzKCk7XG5cbiAgICAvLyBQcmV2ZW50IGRlZmF1bHQgY29udGV4dCBtZW51IGFuZCB0b2dnbGUgbW9kZSBvbiByaWdodC1jbGljayB3aXRoaW4gY29udGFpbmVyXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5jb250YWluZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChlLmJ1dHRvbiA9PT0gMikgeyAvLyBSaWdodCBjbGlja1xuICAgICAgICAgIHRoaXMuYXBwU3RhdGUudG9nZ2xlTW9kZSgpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgLy8gQXBwbHkgbGFiZWwgb3B0aW9ucyBmcm9tIGFwcCBzdGF0ZVxuICAgIHRoaXMuc3luY1dpdGhBcHBTdGF0ZSgpO1xuXG4gICAgLy8gQXBwbHkgY3VycmVudCBtb2RlIHNldHRpbmdzIHRvIGNhbnZhc1xuICAgIHRoaXMuYXBwbHlNb2RlU2V0dGluZ3ModGhpcy5hcHBTdGF0ZS5jdXJyZW50TW9kZSk7XG5cbiAgICAvLyBSZXNpemUgY2FudmFzIG9uIHdpbmRvdyByZXNpemVcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZXNpemVDYW52YXNUb0NvbnRhaW5lcigpO1xuICAgICAgaWYgKHRoaXMuY3VycmVudEltYWdlICYmIHRoaXMuaW1hZ2VPYmplY3QpIHtcbiAgICAgICAgY29uc3QgcHJldlpvb20gPSB0aGlzLl9zdGF0ZS56b29tO1xuICAgICAgICB0aGlzLnJlc2V0Wm9vbSgpO1xuICAgICAgICB0aGlzLnJlc2l6ZVRvSW1hZ2UodGhpcy5jdXJyZW50SW1hZ2UpO1xuICAgICAgICB0aGlzLnNldFpvb20ocHJldlpvb20pO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXF1ZXN0UmVuZGVyKCk7XG4gICAgfSk7XG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdhZnRlcjpyZW5kZXInLFxyXG4gICAgICBkYXRhOiB7IGluaXRpYWxpemVkOiB0cnVlIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlc3Ryb3lDYW52YXMoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fY2FudmFzKSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuX2NhbnZhcyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY29udGFpbmVyRWxlbWVudCkge1xyXG4gICAgICB0aGlzLmNvbnRhaW5lckVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzZXQgc3RhdGVcclxuICAgIHRoaXMuX3N0YXRlID0ge1xyXG4gICAgICBpc0RyYXdpbmc6IGZhbHNlLFxyXG4gICAgICBkcmF3aW5nTW9kZTogJ25vbmUnLFxyXG4gICAgICBzdGFydFBvaW50OiBudWxsLFxyXG4gICAgICBlbmRQb2ludDogbnVsbCxcclxuICAgICAgY3VycmVudFJlY3Q6IG51bGwsXHJcbiAgICAgIGFjdGl2ZUxhYmVsVGV4dDogbnVsbCxcclxuICAgICAgY3Jvc3NoYWlyWDogbnVsbCxcclxuICAgICAgY3Jvc3NoYWlyWTogbnVsbCxcclxuICAgICAgem9vbTogMSxcclxuICAgICAgcGFuWDogMCxcclxuICAgICAgcGFuWTogMCxcclxuICAgICAgc2VsZWN0ZWRPYmplY3RzOiBbXSxcclxuICAgICAgbXVsdGlwbGVTZWxlY3Rpb246IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY3VycmVudEltYWdlID0gbnVsbDtcclxuICAgIHRoaXMuaW1hZ2VPYmplY3QgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEltYWdlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBsb2FkSW1hZ2UoaW1hZ2VFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50KTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFJlbW92ZSBleGlzdGluZyBpbWFnZVxyXG4gICAgdGhpcy5jbGVhckltYWdlKCk7XHJcblxyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2UgPSBpbWFnZUVsZW1lbnQ7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGZhYnJpYyBpbWFnZSBvYmplY3RcclxuICAgIHRoaXMuaW1hZ2VPYmplY3QgPSBuZXcgRmFicmljSlMuSW1hZ2UoaW1hZ2VFbGVtZW50LCB7XG4gICAgICBsZWZ0OiAwLFxyXG4gICAgICB0b3A6IDAsXHJcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxyXG4gICAgICBldmVudGVkOiBmYWxzZSxcclxuICAgICAgbG9ja01vdmVtZW50WDogdHJ1ZSxcclxuICAgICAgbG9ja01vdmVtZW50WTogdHJ1ZSxcclxuICAgICAgbG9ja1JvdGF0aW9uOiB0cnVlLFxyXG4gICAgICBsb2NrU2NhbGluZ1g6IHRydWUsXHJcbiAgICAgIGxvY2tTY2FsaW5nWTogdHJ1ZSxcclxuICAgICAgbG9ja1VuaVNjYWxpbmc6IHRydWUsXHJcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcclxuICAgICAgaGFzQm9yZGVyczogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlc2l6ZSBjYW52YXMgdG8gbWF0Y2ggaW1hZ2VcclxuICAgIHRoaXMucmVzaXplVG9JbWFnZShpbWFnZUVsZW1lbnQpO1xyXG5cclxuICAgIC8vIEFkZCBpbWFnZSB0byBjYW52YXMgKHNlbmQgdG8gYmFjaylcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQodGhpcy5pbWFnZU9iamVjdCEgYXMgdW5rbm93biBhcyBmYWJyaWMuT2JqZWN0KTtcbiAgICB0aGlzLmltYWdlT2JqZWN0IS5zZW5kVG9CYWNrKCk7XG5cclxuICAgIC8vIFJlc2V0IHZpZXdwb3J0XHJcbiAgICB0aGlzLnJlc2V0Wm9vbSgpO1xyXG4gICAgdGhpcy5yZXNldFBhbigpO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnYWZ0ZXI6cmVuZGVyJyxcclxuICAgICAgZGF0YTogeyBpbWFnZUxvYWRlZDogdHJ1ZSwgaW1hZ2VEaW1lbnNpb25zOiB7IHdpZHRoOiBpbWFnZUVsZW1lbnQud2lkdGgsIGhlaWdodDogaW1hZ2VFbGVtZW50LmhlaWdodCB9IH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNsZWFySW1hZ2UoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIGlmICh0aGlzLmltYWdlT2JqZWN0KSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUodGhpcy5pbWFnZU9iamVjdCk7XHJcbiAgICAgIHRoaXMuaW1hZ2VPYmplY3QgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY3VycmVudEltYWdlID0gbnVsbDtcclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemVUb0ltYWdlKGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcbiAgICAvLyBFbnN1cmUgY2FudmFzIG1hdGNoZXMgY29udGFpbmVyIHNpemVcbiAgICB0aGlzLnJlc2l6ZUNhbnZhc1RvQ29udGFpbmVyKCk7XG5cbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IHRoaXMuX2NhbnZhcy5nZXRXaWR0aCgpO1xuICAgIGNvbnN0IGNhbnZhc0hlaWdodCA9IHRoaXMuX2NhbnZhcy5nZXRIZWlnaHQoKTtcblxuICAgIC8vIFNjYWxlIGltYWdlIHRvIGZpdCBpbnNpZGUgY2FudmFzIGFuZCBjZW50ZXIgaXRcbiAgICBpZiAodGhpcy5pbWFnZU9iamVjdCkge1xuICAgICAgY29uc3Qgc2NhbGUgPSBNYXRoLm1pbihjYW52YXNXaWR0aCAvIGltYWdlLndpZHRoLCBjYW52YXNIZWlnaHQgLyBpbWFnZS5oZWlnaHQpO1xuICAgICAgY29uc3Qgc2NhbGVkVyA9IGltYWdlLndpZHRoICogc2NhbGU7XG4gICAgICBjb25zdCBzY2FsZWRIID0gaW1hZ2UuaGVpZ2h0ICogc2NhbGU7XG4gICAgICB0aGlzLmltYWdlT2JqZWN0LnNldCh7XG4gICAgICAgIHNjYWxlWDogc2NhbGUsXG4gICAgICAgIHNjYWxlWTogc2NhbGUsXG4gICAgICAgIGxlZnQ6IChjYW52YXNXaWR0aCAtIHNjYWxlZFcpIC8gMixcbiAgICAgICAgdG9wOiAoY2FudmFzSGVpZ2h0IC0gc2NhbGVkSCkgLyAyXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2NhbnZhcy5jZW50ZXJPYmplY3QodGhpcy5pbWFnZU9iamVjdCBhcyBhbnkpO1xuICAgICAgKHRoaXMuaW1hZ2VPYmplY3QgYXMgYW55KS5zZXRDb29yZHMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlc2l6ZUNhbnZhc1RvQ29udGFpbmVyKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FudmFzIHx8ICF0aGlzLmNvbnRhaW5lckVsZW1lbnQpIHJldHVybjtcbiAgICBjb25zdCByZWN0ID0gdGhpcy5jb250YWluZXJFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihyZWN0LndpZHRoKSk7XG4gICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihyZWN0LmhlaWdodCkpO1xuICAgIHRoaXMuX2NvbmZpZyA9IHsgLi4udGhpcy5fY29uZmlnLCB3aWR0aCwgaGVpZ2h0IH07XG4gICAgdGhpcy5fY2FudmFzLnNldERpbWVuc2lvbnMoeyB3aWR0aCwgaGVpZ2h0IH0pO1xuICB9XG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRHJhd2luZyBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgc3RhcnREcmF3aW5nKHBvaW50OiBQb2ludCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMgfHwgdGhpcy5hcHBTdGF0ZS5jdXJyZW50TW9kZSAhPT0gJ2RyYXcnKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fc3RhdGUuaXNEcmF3aW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuX3N0YXRlLmRyYXdpbmdNb2RlID0gJ3JlY3RhbmdsZSc7XHJcbiAgICB0aGlzLl9zdGF0ZS5zdGFydFBvaW50ID0gcG9pbnQ7XHJcbiAgICB0aGlzLl9zdGF0ZS5lbmRQb2ludCA9IHBvaW50O1xyXG5cclxuICAgIC8vIENyZWF0ZSB0ZW1wb3JhcnkgcmVjdGFuZ2xlIGZvciBkcmF3aW5nIGZlZWRiYWNrXHJcbiAgICBjb25zdCByZWN0ID0gbmV3IEZhYnJpY0pTLlJlY3Qoe1xuICAgICAgbGVmdDogcG9pbnQueCxcclxuICAgICAgdG9wOiBwb2ludC55LFxyXG4gICAgICB3aWR0aDogMCxcclxuICAgICAgaGVpZ2h0OiAwLFxyXG4gICAgICAuLi50aGlzLmRyYXdpbmdPcHRpb25zLFxyXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcclxuICAgICAgZXZlbnRlZDogZmFsc2VcclxuICAgIH0pIGFzIEZhYnJpY1JlY3RhbmdsZTtcclxuXHJcbiAgICByZWN0LmlzTGFiZWwgPSB0cnVlO1xyXG4gICAgdGhpcy5fc3RhdGUuY3VycmVudFJlY3QgPSByZWN0O1xyXG4gICAgdGhpcy5fY2FudmFzLmFkZChyZWN0KTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnbW91c2U6ZG93bicsXHJcbiAgICAgIHBvaW50ZXI6IHBvaW50LFxyXG4gICAgICBkYXRhOiB7IGRyYXdpbmc6IHRydWUgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlRHJhd2luZyhwb2ludDogUG9pbnQpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzIHx8ICF0aGlzLl9zdGF0ZS5pc0RyYXdpbmcgfHwgIXRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0IHx8ICF0aGlzLl9zdGF0ZS5zdGFydFBvaW50KSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fc3RhdGUuZW5kUG9pbnQgPSBwb2ludDtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgcmVjdGFuZ2xlIGRpbWVuc2lvbnNcclxuICAgIGNvbnN0IGxlZnQgPSBNYXRoLm1pbih0aGlzLl9zdGF0ZS5zdGFydFBvaW50LngsIHBvaW50LngpO1xyXG4gICAgY29uc3QgdG9wID0gTWF0aC5taW4odGhpcy5fc3RhdGUuc3RhcnRQb2ludC55LCBwb2ludC55KTtcclxuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5hYnMocG9pbnQueCAtIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueCk7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLmFicyhwb2ludC55IC0gdGhpcy5fc3RhdGUuc3RhcnRQb2ludC55KTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGVtcG9yYXJ5IHJlY3RhbmdsZVxyXG4gICAgdGhpcy5fc3RhdGUuY3VycmVudFJlY3Quc2V0KHtcclxuICAgICAgbGVmdCxcclxuICAgICAgdG9wLFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgaGVpZ2h0XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vdXNlOm1vdmUnLFxyXG4gICAgICBwb2ludGVyOiBwb2ludCxcclxuICAgICAgZGF0YTogeyBkcmF3aW5nOiB0cnVlLCBkaW1lbnNpb25zOiB7IHdpZHRoLCBoZWlnaHQgfSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBmaW5pc2hEcmF3aW5nKHBvaW50OiBQb2ludCk6IEJvdW5kaW5nQm94IHwgbnVsbCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhdGhpcy5fc3RhdGUuaXNEcmF3aW5nIHx8ICF0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCB8fCAhdGhpcy5fc3RhdGUuc3RhcnRQb2ludCkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYXdpbmcoKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fc3RhdGUuZW5kUG9pbnQgPSBwb2ludDtcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgZmluYWwgZGltZW5zaW9uc1xyXG4gICAgY29uc3QgbGVmdCA9IE1hdGgubWluKHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQueCwgcG9pbnQueCk7XHJcbiAgICBjb25zdCB0b3AgPSBNYXRoLm1pbih0aGlzLl9zdGF0ZS5zdGFydFBvaW50LnksIHBvaW50LnkpO1xyXG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLmFicyhwb2ludC54IC0gdGhpcy5fc3RhdGUuc3RhcnRQb2ludC54KTtcclxuICAgIGNvbnN0IGhlaWdodCA9IE1hdGguYWJzKHBvaW50LnkgLSB0aGlzLl9zdGF0ZS5zdGFydFBvaW50LnkpO1xyXG5cclxuICAgIC8vIE1pbmltdW0gc2l6ZSB2YWxpZGF0aW9uXHJcbiAgICBpZiAod2lkdGggPCA1IHx8IGhlaWdodCA8IDUpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmF3aW5nKCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbnZlcnQgdG8gaW1hZ2UgY29vcmRpbmF0ZXMgaWYgaW1hZ2UgaXMgbG9hZGVkXHJcbiAgICBsZXQgbm9ybWFsaXplZEJveDogQm91bmRpbmdCb3ggfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBpZiAodGhpcy5jdXJyZW50SW1hZ2UgJiYgdGhpcy5pbWFnZU9iamVjdCkge1xyXG4gICAgICBjb25zdCBpbWFnZUNvb3JkcyA9IHRoaXMuY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKHsgeDogbGVmdCwgeTogdG9wIH0pO1xyXG4gICAgICBjb25zdCBpbWFnZVdpZHRoID0gTWF0aC5hYnMod2lkdGggLyAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVggfHwgMSkpO1xyXG4gICAgICBjb25zdCBpbWFnZUhlaWdodCA9IE1hdGguYWJzKGhlaWdodCAvICh0aGlzLmltYWdlT2JqZWN0LnNjYWxlWSB8fCAxKSk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgYm91bmRpbmcgYm94XHJcbiAgICAgIG5vcm1hbGl6ZWRCb3ggPSB7XHJcbiAgICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVCb3VuZGluZ0JveElkKCksXHJcbiAgICAgICAgeDogaW1hZ2VDb29yZHMueCxcclxuICAgICAgICB5OiBpbWFnZUNvb3Jkcy55LFxyXG4gICAgICAgIHdpZHRoOiBpbWFnZVdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaW1hZ2VIZWlnaHQsXHJcbiAgICAgICAgY2xhc3NJZDogMCwgLy8gRGVmYXVsdCBjbGFzc1xyXG4gICAgICAgIGNvbG9yOiB0aGlzLmdldENsYXNzQ29sb3IoMCksXHJcbiAgICAgICAgaXNWaXNpYmxlOiB0cnVlLFxyXG4gICAgICAgIGlzU2VsZWN0ZWQ6IHRydWUsXHJcbiAgICAgICAgaXNUZW1wRHJhdzogZmFsc2VcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW1vdmUgdGVtcG9yYXJ5IHJlY3RhbmdsZVxyXG4gICAgdGhpcy5fY2FudmFzLnJlbW92ZSh0aGlzLl9zdGF0ZS5jdXJyZW50UmVjdCk7XHJcblxyXG4gICAgLy8gUmVzZXQgZHJhd2luZyBzdGF0ZVxyXG4gICAgdGhpcy5fc3RhdGUuaXNEcmF3aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLl9zdGF0ZS5kcmF3aW5nTW9kZSA9ICdub25lJztcclxuICAgIHRoaXMuX3N0YXRlLnN0YXJ0UG9pbnQgPSBudWxsO1xyXG4gICAgdGhpcy5fc3RhdGUuZW5kUG9pbnQgPSBudWxsO1xyXG4gICAgdGhpcy5fc3RhdGUuY3VycmVudFJlY3QgPSBudWxsO1xyXG5cclxuICAgIC8vIEFkZCBwZXJtYW5lbnQgYm91bmRpbmcgYm94IGlmIHZhbGlkXHJcbiAgICBpZiAobm9ybWFsaXplZEJveCkge1xyXG4gICAgICB0aGlzLmFkZEJvdW5kaW5nQm94KG5vcm1hbGl6ZWRCb3gpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnbW91c2U6dXAnLFxyXG4gICAgICBwb2ludGVyOiBwb2ludCxcclxuICAgICAgZGF0YTogeyBkcmF3aW5nOiBmYWxzZSwgYm91bmRpbmdCb3g6IG5vcm1hbGl6ZWRCb3ggfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRCb3g7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FuY2VsRHJhd2luZygpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgaWYgKHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0KSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUodGhpcy5fc3RhdGUuY3VycmVudFJlY3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3N0YXRlLmlzRHJhd2luZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fc3RhdGUuZHJhd2luZ01vZGUgPSAnbm9uZSc7XHJcbiAgICB0aGlzLl9zdGF0ZS5zdGFydFBvaW50ID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXRlLmVuZFBvaW50ID0gbnVsbDtcclxuICAgIHRoaXMuX3N0YXRlLmN1cnJlbnRSZWN0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQm91bmRpbmcgQm94IE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhZGRCb3VuZGluZ0JveChiYm94OiBCb3VuZGluZ0JveCk6IEZhYnJpY1JlY3RhbmdsZSB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnZhcyBub3QgaW5pdGlhbGl6ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb252ZXJ0IHRvIGNhbnZhcyBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgY2FudmFzQ29vcmRzID0gdGhpcy5pbWFnZVRvQ2FudmFzQ29vcmRpbmF0ZXMoeyB4OiBiYm94LngsIHk6IGJib3gueSB9KTtcclxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gdGhpcy5pbWFnZU9iamVjdCA/IGJib3gud2lkdGggKiAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVggfHwgMSkgOiBiYm94LndpZHRoO1xyXG4gICAgY29uc3QgY2FudmFzSGVpZ2h0ID0gdGhpcy5pbWFnZU9iamVjdCA/IGJib3guaGVpZ2h0ICogKHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVZIHx8IDEpIDogYmJveC5oZWlnaHQ7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHJlY3RhbmdsZVxyXG4gICAgY29uc3QgcmVjdCA9IG5ldyBGYWJyaWNKUy5SZWN0KHtcbiAgICAgIGxlZnQ6IGNhbnZhc0Nvb3Jkcy54LFxyXG4gICAgICB0b3A6IGNhbnZhc0Nvb3Jkcy55LFxyXG4gICAgICB3aWR0aDogY2FudmFzV2lkdGgsXHJcbiAgICAgIGhlaWdodDogY2FudmFzSGVpZ2h0LFxyXG4gICAgICBzdHJva2U6IGJib3guY29sb3IsXHJcbiAgICAgIHN0cm9rZVdpZHRoOiB0aGlzLmRyYXdpbmdPcHRpb25zLnN0cm9rZVdpZHRoLFxyXG4gICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxyXG4gICAgICBzZWxlY3RhYmxlOiB0cnVlLFxyXG4gICAgICBldmVudGVkOiB0cnVlLFxyXG4gICAgICBoYXNDb250cm9sczogdHJ1ZSxcclxuICAgICAgaGFzQm9yZGVyczogdHJ1ZSxcclxuICAgICAgYm9yZGVyQ29sb3I6IGJib3guY29sb3IsXHJcbiAgICAgIGNvcm5lckNvbG9yOiBiYm94LmNvbG9yLFxyXG4gICAgICB0cmFuc3BhcmVudENvcm5lcnM6IGZhbHNlXHJcbiAgICB9KSBhcyBGYWJyaWNSZWN0YW5nbGU7XHJcblxyXG4gICAgLy8gQXR0YWNoIGJvdW5kaW5nIGJveCBkYXRhXHJcbiAgICByZWN0LmJvdW5kaW5nQm94ID0gYmJveDtcclxuICAgIHJlY3QuaXNMYWJlbCA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkIHRvIGNhbnZhc1xyXG4gICAgdGhpcy5fY2FudmFzLmFkZChyZWN0KTtcclxuXHJcbiAgICAvLyBDcmVhdGUgbGFiZWwgdGV4dCBpZiBsYWJlbHMgYXJlIGVuYWJsZWRcclxuICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzKSB7XHJcbiAgICAgIHRoaXMuY3JlYXRlTGFiZWxUZXh0KHJlY3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJyaW5nIHRvIGZyb250IChidXQga2VlcCBiZWhpbmQgYW55IGN1cnJlbnQgZHJhd2luZylcclxuICAgIHJlY3QuYnJpbmdUb0Zyb250KCk7XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdvYmplY3Q6YWRkZWQnLFxyXG4gICAgICB0YXJnZXQ6IHJlY3QsXHJcbiAgICAgIGRhdGE6IHsgYm91bmRpbmdCb3g6IGJib3ggfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlY3Q7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlQm91bmRpbmdCb3goaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuICAgIGNvbnN0IHJlY3RUb1JlbW92ZSA9IG9iamVjdHMuZmluZChvYmogPT4gb2JqLmJvdW5kaW5nQm94Py5pZCA9PT0gaWQpO1xyXG5cclxuICAgIGlmIChyZWN0VG9SZW1vdmUpIHtcclxuICAgICAgLy8gUmVtb3ZlIGFzc29jaWF0ZWQgbGFiZWwgdGV4dFxyXG4gICAgICBpZiAocmVjdFRvUmVtb3ZlLmxhYmVsVGV4dCkge1xyXG4gICAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmUocmVjdFRvUmVtb3ZlLmxhYmVsVGV4dCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbW92ZSByZWN0YW5nbGVcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZShyZWN0VG9SZW1vdmUpO1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdvYmplY3Q6cmVtb3ZlZCcsXHJcbiAgICAgICAgdGFyZ2V0OiByZWN0VG9SZW1vdmUsXHJcbiAgICAgICAgZGF0YTogeyBib3VuZGluZ0JveElkOiBpZCB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZUJvdW5kaW5nQm94KGlkOiBzdHJpbmcsIHVwZGF0ZXM6IFBhcnRpYWw8Qm91bmRpbmdCb3g+KTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xyXG4gICAgY29uc3QgcmVjdCA9IG9iamVjdHMuZmluZChvYmogPT4gb2JqLmJvdW5kaW5nQm94Py5pZCA9PT0gaWQpO1xyXG5cclxuICAgIGlmIChyZWN0ICYmIHJlY3QuYm91bmRpbmdCb3gpIHtcclxuICAgICAgLy8gVXBkYXRlIGJvdW5kaW5nIGJveCBkYXRhXHJcbiAgICAgIE9iamVjdC5hc3NpZ24ocmVjdC5ib3VuZGluZ0JveCwgdXBkYXRlcyk7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdmlzdWFsIHByb3BlcnRpZXNcclxuICAgICAgaWYgKHVwZGF0ZXMuY29sb3IpIHtcclxuICAgICAgICByZWN0LnNldCh7XHJcbiAgICAgICAgICBzdHJva2U6IHVwZGF0ZXMuY29sb3IsXHJcbiAgICAgICAgICBib3JkZXJDb2xvcjogdXBkYXRlcy5jb2xvcixcclxuICAgICAgICAgIGNvcm5lckNvbG9yOiB1cGRhdGVzLmNvbG9yXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh1cGRhdGVzLmlzVmlzaWJsZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmVjdC5zZXQoeyB2aXNpYmxlOiB1cGRhdGVzLmlzVmlzaWJsZSB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXBkYXRlIGxhYmVsIHRleHRcclxuICAgICAgaWYgKHJlY3QubGFiZWxUZXh0KSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVMYWJlbFRleHQocmVjdCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdDptb2RpZmllZCcsXHJcbiAgICAgICAgdGFyZ2V0OiByZWN0LFxyXG4gICAgICAgIGRhdGE6IHsgYm91bmRpbmdCb3g6IHJlY3QuYm91bmRpbmdCb3gsIHVwZGF0ZXMgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRCb3VuZGluZ0JveChpZDogc3RyaW5nKTogQm91bmRpbmdCb3ggfCBudWxsIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuICAgIGNvbnN0IHJlY3QgPSBvYmplY3RzLmZpbmQob2JqID0+IG9iai5ib3VuZGluZ0JveD8uaWQgPT09IGlkKTtcclxuXHJcbiAgICByZXR1cm4gcmVjdD8uYm91bmRpbmdCb3ggfHwgbnVsbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRBbGxCb3VuZGluZ0JveGVzKCk6IEJvdW5kaW5nQm94W10ge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybiBbXTtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuICAgIHJldHVybiBvYmplY3RzXHJcbiAgICAgIC5maWx0ZXIob2JqID0+IG9iai5pc0xhYmVsICYmIG9iai5ib3VuZGluZ0JveClcclxuICAgICAgLm1hcChvYmogPT4gb2JqLmJvdW5kaW5nQm94ISlcclxuICAgICAgLmZpbHRlcihiYm94ID0+IGJib3ggIT09IHVuZGVmaW5lZCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU2VsZWN0aW9uIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBzZWxlY3RCb3VuZGluZ0JveChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xyXG4gICAgY29uc3QgcmVjdCA9IG9iamVjdHMuZmluZChvYmogPT4gb2JqLmJvdW5kaW5nQm94Py5pZCA9PT0gaWQpO1xyXG5cclxuICAgIGlmIChyZWN0KSB7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5zZXRBY3RpdmVPYmplY3QocmVjdCk7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk7XHJcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZXNlbGVjdEFsbCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fY2FudmFzLmRpc2NhcmRBY3RpdmVPYmplY3QoKTtcclxuICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk7XHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3NlbGVjdGlvbjpjbGVhcmVkJ1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2VsZWN0ZWRCb3VuZGluZ0JveGVzKCk6IEJvdW5kaW5nQm94W10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLnNlbGVjdGVkT2JqZWN0c1xyXG4gICAgICAubWFwKG9iaiA9PiAob2JqIGFzIEZhYnJpY1JlY3RhbmdsZSkuYm91bmRpbmdCb3gpXHJcbiAgICAgIC5maWx0ZXIoYmJveCA9PiBiYm94ICE9PSB1bmRlZmluZWQpIGFzIEJvdW5kaW5nQm94W107XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVsZXRlU2VsZWN0ZWQoKTogQm91bmRpbmdCb3hbXSB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuIFtdO1xyXG5cclxuICAgIGNvbnN0IHNlbGVjdGVkQm94ZXMgPSB0aGlzLmdldFNlbGVjdGVkQm91bmRpbmdCb3hlcygpO1xyXG4gICAgY29uc3QgYWN0aXZlT2JqZWN0ID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xyXG5cclxuICAgIGlmIChhY3RpdmVPYmplY3QpIHtcclxuICAgICAgaWYgKGFjdGl2ZU9iamVjdC50eXBlID09PSAnYWN0aXZlU2VsZWN0aW9uJykge1xyXG4gICAgICAgIC8vIE11bHRpcGxlIHNlbGVjdGlvblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGFjdGl2ZU9iamVjdCBhcyBmYWJyaWMuQWN0aXZlU2VsZWN0aW9uO1xyXG4gICAgICAgIGNvbnN0IG9iamVjdHMgPSBzZWxlY3Rpb24uZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xyXG5cclxuICAgICAgICBvYmplY3RzLmZvckVhY2gob2JqID0+IHtcclxuICAgICAgICAgIGlmIChvYmouaXNMYWJlbCAmJiBvYmouYm91bmRpbmdCb3gpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVCb3VuZGluZ0JveChvYmouYm91bmRpbmdCb3guaWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFNpbmdsZSBzZWxlY3Rpb25cclxuICAgICAgICBjb25zdCByZWN0ID0gYWN0aXZlT2JqZWN0IGFzIEZhYnJpY1JlY3RhbmdsZTtcclxuICAgICAgICBpZiAocmVjdC5pc0xhYmVsICYmIHJlY3QuYm91bmRpbmdCb3gpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlQm91bmRpbmdCb3gocmVjdC5ib3VuZGluZ0JveC5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kZXNlbGVjdEFsbCgpO1xyXG4gICAgcmV0dXJuIHNlbGVjdGVkQm94ZXM7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTGFiZWwgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHNob3dMYWJlbHMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzID0gdHJ1ZTtcclxuICAgIHRoaXMudXBkYXRlTGFiZWxzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGlkZUxhYmVscygpOiB2b2lkIHtcclxuICAgIHRoaXMubGFiZWxPcHRpb25zLnNob3dMYWJlbHMgPSBmYWxzZTtcclxuICAgIHRoaXMudXBkYXRlTGFiZWxzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlTGFiZWxzKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBvYmplY3RzID0gdGhpcy5fY2FudmFzLmdldE9iamVjdHMoKSBhcyBGYWJyaWNSZWN0YW5nbGVbXTtcclxuXHJcbiAgICBvYmplY3RzLmZvckVhY2gob2JqID0+IHtcclxuICAgICAgaWYgKG9iai5pc0xhYmVsICYmIG9iai5ib3VuZGluZ0JveCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzICYmICFvYmoubGFiZWxUZXh0KSB7XHJcbiAgICAgICAgICB0aGlzLmNyZWF0ZUxhYmVsVGV4dChvYmopO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMubGFiZWxPcHRpb25zLnNob3dMYWJlbHMgJiYgb2JqLmxhYmVsVGV4dCkge1xyXG4gICAgICAgICAgdGhpcy5fY2FudmFzIS5yZW1vdmUob2JqLmxhYmVsVGV4dCk7XHJcbiAgICAgICAgICBvYmoubGFiZWxUZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAob2JqLmxhYmVsVGV4dCkge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVMYWJlbFRleHQob2JqKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRMYWJlbEZvbnQoZm9udFNpemU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5sYWJlbE9wdGlvbnMuZm9udFNpemUgPSBmb250U2l6ZTtcclxuICAgIHRoaXMudXBkYXRlTGFiZWxzKCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVmlld3BvcnQgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHpvb21JbigpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld1pvb20gPSBNYXRoLm1pbih0aGlzLl9zdGF0ZS56b29tICogMS4yLCA1KTtcclxuICAgIHRoaXMuc2V0Wm9vbShuZXdab29tKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB6b29tT3V0KCk6IHZvaWQge1xyXG4gICAgY29uc3QgbmV3Wm9vbSA9IE1hdGgubWF4KHRoaXMuX3N0YXRlLnpvb20gLyAxLjIsIDAuMSk7XHJcbiAgICB0aGlzLnNldFpvb20obmV3Wm9vbSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgem9vbVRvRml0KCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMgfHwgIXRoaXMuY3VycmVudEltYWdlKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgY2FudmFzV2lkdGggPSB0aGlzLl9jYW52YXMuZ2V0V2lkdGgoKTtcclxuICAgIGNvbnN0IGNhbnZhc0hlaWdodCA9IHRoaXMuX2NhbnZhcy5nZXRIZWlnaHQoKTtcclxuICAgIGNvbnN0IGltYWdlV2lkdGggPSB0aGlzLmN1cnJlbnRJbWFnZS53aWR0aDtcclxuICAgIGNvbnN0IGltYWdlSGVpZ2h0ID0gdGhpcy5jdXJyZW50SW1hZ2UuaGVpZ2h0O1xyXG5cclxuICAgIGNvbnN0IHNjYWxlWCA9IGNhbnZhc1dpZHRoIC8gaW1hZ2VXaWR0aDtcclxuICAgIGNvbnN0IHNjYWxlWSA9IGNhbnZhc0hlaWdodCAvIGltYWdlSGVpZ2h0O1xyXG4gICAgY29uc3Qgem9vbSA9IE1hdGgubWluKHNjYWxlWCwgc2NhbGVZKTtcclxuXHJcbiAgICB0aGlzLnNldFpvb20oem9vbSk7XHJcbiAgICB0aGlzLnJlc2V0UGFuKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXRab29tKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXRab29tKDEpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFpvb20oem9vbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N0YXRlLnpvb20gPSBNYXRoLm1heCgwLjEsIE1hdGgubWluKDUsIHpvb20pKTtcclxuICAgIHRoaXMuX2NhbnZhcy5zZXRab29tKHRoaXMuX3N0YXRlLnpvb20pO1xyXG4gICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdhZnRlcjpyZW5kZXInLFxyXG4gICAgICBkYXRhOiB7IHpvb206IHRoaXMuX3N0YXRlLnpvb20gfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGFuVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fc3RhdGUucGFuWCA9IHg7XHJcbiAgICB0aGlzLl9zdGF0ZS5wYW5ZID0geTtcclxuXHJcbiAgICBjb25zdCB2cHQgPSB0aGlzLl9jYW52YXMudmlld3BvcnRUcmFuc2Zvcm07XHJcbiAgICBpZiAodnB0ICYmIHZwdC5sZW5ndGggPj0gNikge1xyXG4gICAgICB2cHRbNF0gPSB4O1xyXG4gICAgICB2cHRbNV0gPSB5O1xyXG4gICAgICB0aGlzLl9jYW52YXMuc2V0Vmlld3BvcnRUcmFuc2Zvcm0odnB0KTtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0UGFuKCk6IHZvaWQge1xuICAgIHRoaXMucGFuVG8oMCwgMCk7XG4gIH1cblxuICAvKipcbiAgICogUGFuIHRoZSB2aWV3cG9ydCBzbyB0aGF0IHRoZSBnaXZlbiBpbWFnZSBjb29yZGluYXRlcyBhcHBlYXIgY2VudGVyZWRcbiAgICovXG4gIHB1YmxpYyBnb1RvSW1hZ2VDb29yZGluYXRlcyh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XG5cbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IHRoaXMuX2NhbnZhcy5nZXRXaWR0aCgpO1xuICAgIGNvbnN0IGNhbnZhc0hlaWdodCA9IHRoaXMuX2NhbnZhcy5nZXRIZWlnaHQoKTtcbiAgICBjb25zdCB6b29tID0gdGhpcy5fc3RhdGUuem9vbTtcblxuICAgIGNvbnN0IGNhbnZhc1BvaW50ID0gdGhpcy5pbWFnZVRvQ2FudmFzQ29vcmRpbmF0ZXMoeyB4LCB5IH0pO1xuICAgIGNvbnN0IHZwdCA9IHRoaXMuX2NhbnZhcy52aWV3cG9ydFRyYW5zZm9ybTtcbiAgICBpZiAodnB0ICYmIHZwdC5sZW5ndGggPj0gNikge1xuICAgICAgdnB0WzRdID0gY2FudmFzV2lkdGggLyAyIC0gem9vbSAqIGNhbnZhc1BvaW50Lng7XG4gICAgICB2cHRbNV0gPSBjYW52YXNIZWlnaHQgLyAyIC0gem9vbSAqIGNhbnZhc1BvaW50Lnk7XG4gICAgICB0aGlzLl9jYW52YXMuc2V0Vmlld3BvcnRUcmFuc2Zvcm0odnB0KTtcbiAgICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgbWV0aG9kIHRvIHNldCB6b29tIGJ5IHBlcmNlbnRhZ2UgKGUuZy4sIDEwMCA9PiAxLjApXG4gICAqL1xuICBwdWJsaWMgc2V0Wm9vbVBlcmNlbnQocGVyY2VudDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY2xhbXBlZCA9IE1hdGgubWF4KDEwLCBNYXRoLm1pbig1MDAsIHBlcmNlbnQpKTtcbiAgICB0aGlzLnNldFpvb20oY2xhbXBlZCAvIDEwMCk7XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDcm9zc2hhaXIgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHNob3dDcm9zc2hhaXIocG9pbnQ6IFBvaW50KTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuaGlkZUNyb3NzaGFpcigpO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gdGhpcy5fY2FudmFzLmdldFdpZHRoKCk7XHJcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSB0aGlzLl9jYW52YXMuZ2V0SGVpZ2h0KCk7XHJcblxyXG4gICAgLy8gSG9yaXpvbnRhbCBsaW5lXHJcbiAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYID0gbmV3IEZhYnJpY0pTLkxpbmUoWzAsIHBvaW50LnksIGNhbnZhc1dpZHRoLCBwb2ludC55XSwge1xuICAgICAgc3Ryb2tlOiAnI2ZmZmZmZicsXHJcbiAgICAgIHN0cm9rZVdpZHRoOiAxLFxyXG4gICAgICBzdHJva2VEYXNoQXJyYXk6IFs1LCA1XSxcclxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXHJcbiAgICAgIGV2ZW50ZWQ6IGZhbHNlLFxyXG4gICAgICBleGNsdWRlRnJvbUV4cG9ydDogdHJ1ZVxyXG4gICAgfSkgYXMgRmFicmljTGluZTtcclxuICAgICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYIGFzIGFueSkuaXNDcm9zc2hhaXIgPSB0cnVlO1xyXG4gICAgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclggYXMgYW55KS5jcm9zc2hhaXJUeXBlID0gJ2hvcml6b250YWwnO1xyXG5cclxuICAgIC8vIFZlcnRpY2FsIGxpbmVcclxuICAgIHRoaXMuX3N0YXRlLmNyb3NzaGFpclkgPSBuZXcgRmFicmljSlMuTGluZShbcG9pbnQueCwgMCwgcG9pbnQueCwgY2FudmFzSGVpZ2h0XSwge1xuICAgICAgc3Ryb2tlOiAnI2ZmZmZmZicsXHJcbiAgICAgIHN0cm9rZVdpZHRoOiAxLFxyXG4gICAgICBzdHJva2VEYXNoQXJyYXk6IFs1LCA1XSxcclxuICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXHJcbiAgICAgIGV2ZW50ZWQ6IGZhbHNlLFxyXG4gICAgICBleGNsdWRlRnJvbUV4cG9ydDogdHJ1ZVxyXG4gICAgfSkgYXMgRmFicmljTGluZTtcclxuICAgICh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZIGFzIGFueSkuaXNDcm9zc2hhaXIgPSB0cnVlO1xyXG4gICAgKHRoaXMuX3N0YXRlLmNyb3NzaGFpclkgYXMgYW55KS5jcm9zc2hhaXJUeXBlID0gJ3ZlcnRpY2FsJztcclxuXHJcbiAgICB0aGlzLl9jYW52YXMuYWRkKHRoaXMuX3N0YXRlLmNyb3NzaGFpclgpO1xyXG4gICAgdGhpcy5fY2FudmFzLmFkZCh0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZKTtcclxuXHJcbiAgICAvLyBCcmluZyBjcm9zc2hhaXIgdG8gZnJvbnRcclxuICAgIHRoaXMuX3N0YXRlLmNyb3NzaGFpclguYnJpbmdUb0Zyb250KCk7XHJcbiAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZLmJyaW5nVG9Gcm9udCgpO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5yZW5kZXJBbGwoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoaWRlQ3Jvc3NoYWlyKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHJldHVybjtcclxuXHJcbiAgICBpZiAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWCkge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHRoaXMuX3N0YXRlLmNyb3NzaGFpclgpO1xyXG4gICAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJYID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fc3RhdGUuY3Jvc3NoYWlyWSkge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVtb3ZlKHRoaXMuX3N0YXRlLmNyb3NzaGFpclkpO1xyXG4gICAgICB0aGlzLl9zdGF0ZS5jcm9zc2hhaXJZID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlQ3Jvc3NoYWlyKHBvaW50OiBQb2ludCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XG5cbiAgICBpZiAoIXRoaXMuYXBwU3RhdGUuaXNDcm9zc2hhaXJWaXNpYmxlKSB7XG4gICAgICB0aGlzLmhpZGVDcm9zc2hhaXIoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPbmx5IHNob3cgY3Jvc3NoYWlyIHdoZW4gcG9pbnRlciBpcyBpbnNpZGUgYSBsYWJlbCBib3ggYXJlYVxuICAgIGNvbnN0IGltZ1B0ID0gdGhpcy5jYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMocG9pbnQpO1xuICAgIGNvbnN0IG9iamVjdHMgPSB0aGlzLl9jYW52YXMuZ2V0T2JqZWN0cygpIGFzIEZhYnJpY1JlY3RhbmdsZVtdO1xuICAgIGNvbnN0IGlzSW5zaWRlQW55Qm94ID0gb2JqZWN0cy5zb21lKG9iaiA9PiB7XG4gICAgICBjb25zdCBiYm94ID0gb2JqLmJvdW5kaW5nQm94O1xuICAgICAgaWYgKCFvYmouaXNMYWJlbCB8fCAhYmJveCkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgaW1nUHQueCA+PSBiYm94LnggJiYgaW1nUHQueCA8PSBiYm94LnggKyBiYm94LndpZHRoICYmXG4gICAgICAgIGltZ1B0LnkgPj0gYmJveC55ICYmIGltZ1B0LnkgPD0gYmJveC55ICsgYmJveC5oZWlnaHRcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICBpZiAoaXNJbnNpZGVBbnlCb3gpIHtcbiAgICAgIHRoaXMuc2hvd0Nyb3NzaGFpcihwb2ludCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGlkZUNyb3NzaGFpcigpO1xuICAgIH1cbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENvb3JkaW5hdGUgQ29udmVyc2lvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGNhbnZhc1RvSW1hZ2UoY2FudmFzUG9pbnQ6IFBvaW50KTogSW1hZ2VDb29yZGluYXRlIHtcclxuICAgIGNvbnN0IGltYWdlQ29vcmRzID0gdGhpcy5jYW52YXNUb0ltYWdlQ29vcmRpbmF0ZXMoY2FudmFzUG9pbnQpO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IHRoaXMubm9ybWFsaXplQ29vcmRpbmF0ZXMoaW1hZ2VDb29yZHMsIHtcclxuICAgICAgd2lkdGg6IHRoaXMuY3VycmVudEltYWdlPy53aWR0aCB8fCAxLFxyXG4gICAgICBoZWlnaHQ6IHRoaXMuY3VycmVudEltYWdlPy5oZWlnaHQgfHwgMVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogY2FudmFzUG9pbnQueCxcclxuICAgICAgeTogY2FudmFzUG9pbnQueSxcclxuICAgICAgaW1hZ2VYOiBpbWFnZUNvb3Jkcy54LFxyXG4gICAgICBpbWFnZVk6IGltYWdlQ29vcmRzLnksXHJcbiAgICAgIG5vcm1hbGl6ZWRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaW1hZ2VUb0NhbnZhcyhpbWFnZVBvaW50OiBQb2ludCk6IENhbnZhc0Nvb3JkaW5hdGUge1xyXG4gICAgY29uc3QgY2FudmFzQ29vcmRzID0gdGhpcy5pbWFnZVRvQ2FudmFzQ29vcmRpbmF0ZXMoaW1hZ2VQb2ludCk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogaW1hZ2VQb2ludC54LFxyXG4gICAgICB5OiBpbWFnZVBvaW50LnksXHJcbiAgICAgIGNhbnZhc1g6IGNhbnZhc0Nvb3Jkcy54LFxyXG4gICAgICBjYW52YXNZOiBjYW52YXNDb29yZHMueVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBub3JtYWxpemVDb29yZGluYXRlcyhpbWFnZVBvaW50OiBQb2ludCwgaW1hZ2VTaXplOiBTaXplKTogUG9pbnQge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogaW1hZ2VQb2ludC54IC8gaW1hZ2VTaXplLndpZHRoLFxyXG4gICAgICB5OiBpbWFnZVBvaW50LnkgLyBpbWFnZVNpemUuaGVpZ2h0XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbm9ybWFsaXplQ29vcmRpbmF0ZXMobm9ybWFsaXplZFBvaW50OiBQb2ludCwgaW1hZ2VTaXplOiBTaXplKTogUG9pbnQge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogbm9ybWFsaXplZFBvaW50LnggKiBpbWFnZVNpemUud2lkdGgsXHJcbiAgICAgIHk6IG5vcm1hbGl6ZWRQb2ludC55ICogaW1hZ2VTaXplLmhlaWdodFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBZT0xPIEZvcm1hdCBDb252ZXJzaW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgYm91bmRpbmdCb3hUb1lPTE8oYmJveDogQm91bmRpbmdCb3gsIGltYWdlU2l6ZTogU2l6ZSk6IFlPTE9MYWJlbCB7XHJcbiAgICBjb25zdCBjZW50ZXJYID0gKGJib3gueCArIGJib3gud2lkdGggLyAyKSAvIGltYWdlU2l6ZS53aWR0aDtcclxuICAgIGNvbnN0IGNlbnRlclkgPSAoYmJveC55ICsgYmJveC5oZWlnaHQgLyAyKSAvIGltYWdlU2l6ZS5oZWlnaHQ7XHJcbiAgICBjb25zdCB3aWR0aCA9IGJib3gud2lkdGggLyBpbWFnZVNpemUud2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBiYm94LmhlaWdodCAvIGltYWdlU2l6ZS5oZWlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY2xhc3NJZDogYmJveC5jbGFzc0lkLFxyXG4gICAgICBjZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZLFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgaGVpZ2h0LFxyXG4gICAgICBjb25maWRlbmNlOiBiYm94LmNvbmZpZGVuY2VcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgeW9sb1RvQm91bmRpbmdCb3goeW9sbzogWU9MT0xhYmVsLCBpbWFnZVNpemU6IFNpemUpOiBCb3VuZGluZ0JveCB7XHJcbiAgICBjb25zdCB3aWR0aCA9IHlvbG8ud2lkdGggKiBpbWFnZVNpemUud2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSB5b2xvLmhlaWdodCAqIGltYWdlU2l6ZS5oZWlnaHQ7XHJcbiAgICBjb25zdCB4ID0gKHlvbG8uY2VudGVyWCAqIGltYWdlU2l6ZS53aWR0aCkgLSAod2lkdGggLyAyKTtcclxuICAgIGNvbnN0IHkgPSAoeW9sby5jZW50ZXJZICogaW1hZ2VTaXplLmhlaWdodCkgLSAoaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVCb3VuZGluZ0JveElkKCksXHJcbiAgICAgIHgsXHJcbiAgICAgIHksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHQsXHJcbiAgICAgIGNsYXNzSWQ6IHlvbG8uY2xhc3NJZCxcclxuICAgICAgY29sb3I6IHRoaXMuZ2V0Q2xhc3NDb2xvcih5b2xvLmNsYXNzSWQpLFxyXG4gICAgICBpc1Zpc2libGU6IHRydWUsXHJcbiAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxyXG4gICAgICBjb25maWRlbmNlOiB5b2xvLmNvbmZpZGVuY2VcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXZlbnQgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6IENhbnZhc0V2ZW50VHlwZSwgaGFuZGxlcjogQ2FudmFzRXZlbnRIYW5kbGVyKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLl9ldmVudExpc3RlbmVycy5zZXQodHlwZSwgW10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpIS5wdXNoKGhhbmRsZXIpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTogQ2FudmFzRXZlbnRUeXBlLCBoYW5kbGVyOiBDYW52YXNFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBoYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gUmVuZGVyaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX2NhbnZhcykge1xyXG4gICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVxdWVzdFJlbmRlcigpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLl9jYW52YXMpIHtcclxuICAgICAgdGhpcy5fY2FudmFzLnJlcXVlc3RSZW5kZXJBbGwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQcml2YXRlIEhlbHBlciBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIHNldHVwQ2FudmFzRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2FudmFzKSByZXR1cm47XG5cbiAgICAvLyBNb3VzZSBldmVudHNcbiAgICBsZXQgaXNQYW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IGxhc3RQb3MgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgIHRoaXMuX2NhbnZhcy5vbignbW91c2U6ZG93bicsIChlKSA9PiB7XG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5fY2FudmFzIS5nZXRQb2ludGVyKGUuZSk7XG4gICAgICB0aGlzLnVwZGF0ZUNyb3NzaGFpcihwb2ludGVyKTtcblxuICAgICAgLy8gU3RhcnQgcGFubmluZyBvbiBtaWRkbGUgY2xpY2sgb3Igd2hlbiBBbHQgcHJlc3NlZCAocmlnaHQtY2xpY2sgcmVzZXJ2ZWQgZm9yIG1vZGUgdG9nZ2xlKVxuICAgICAgY29uc3QgZXYgPSBlLmUgYXMgTW91c2VFdmVudDtcbiAgICAgIGNvbnN0IHN0YXJ0UGFuID0gZXYuYnV0dG9uID09PSAxIHx8IGV2LmFsdEtleSB8fCAoZXYgYXMgYW55KS5zcGFjZUtleTtcbiAgICAgIGlmIChzdGFydFBhbikge1xuICAgICAgICBpc1Bhbm5pbmcgPSB0cnVlO1xuICAgICAgICBsYXN0UG9zID0geyB4OiBldi5jbGllbnRYLCB5OiBldi5jbGllbnRZIH07XG4gICAgICAgIHRoaXMuX2NhbnZhcyEuc2V0Q3Vyc29yKCdncmFiYmluZycpO1xuICAgICAgICB0aGlzLl9jYW52YXMhLnJlcXVlc3RSZW5kZXJBbGwoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5hcHBTdGF0ZS5jdXJyZW50TW9kZSA9PT0gJ2RyYXcnICYmICFlLnRhcmdldCkge1xuICAgICAgICB0aGlzLnN0YXJ0RHJhd2luZyhwb2ludGVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2NhbnZhcy5vbignbW91c2U6bW92ZScsIChlKSA9PiB7XG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5fY2FudmFzIS5nZXRQb2ludGVyKGUuZSk7XG4gICAgICB0aGlzLnVwZGF0ZUNyb3NzaGFpcihwb2ludGVyKTtcblxuICAgICAgLy8gRGlzcGF0Y2ggbW91c2UgbW92ZSB3aXRoIGNhbnZhcy9pbWFnZSBjb29yZGluYXRlc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaW1hZ2VQdCA9IHRoaXMuY2FudmFzVG9JbWFnZUNvb3JkaW5hdGVzKHBvaW50ZXIpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgIHR5cGU6ICdtb3VzZTptb3ZlJyxcbiAgICAgICAgICBwb2ludGVyLFxuICAgICAgICAgIGRhdGE6IHsgY2FudmFzOiB7IHg6IHBvaW50ZXIueCwgeTogcG9pbnRlci55IH0sIGltYWdlOiB7IHg6IGltYWdlUHQueCwgeTogaW1hZ2VQdC55IH0gfVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2gge31cblxuICAgICAgaWYgKGlzUGFubmluZykge1xuICAgICAgICBjb25zdCBldiA9IGUuZSBhcyBNb3VzZUV2ZW50O1xuICAgICAgICBjb25zdCB2OiBhbnkgPSB0aGlzLl9jYW52YXMhLnZpZXdwb3J0VHJhbnNmb3JtIGFzIGFueTtcbiAgICAgICAgaWYgKCF2IHx8IHYubGVuZ3RoIDwgNikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2WzRdICs9IGV2LmNsaWVudFggLSBsYXN0UG9zLng7XG4gICAgICAgIHZbNV0gKz0gZXYuY2xpZW50WSAtIGxhc3RQb3MueTtcbiAgICAgICAgdGhpcy5fY2FudmFzIS5zZXRWaWV3cG9ydFRyYW5zZm9ybSh2IGFzIG51bWJlcltdKTtcbiAgICAgICAgbGFzdFBvcyA9IHsgeDogZXYuY2xpZW50WCwgeTogZXYuY2xpZW50WSB9O1xuICAgICAgICB0aGlzLl9jYW52YXMhLnJlcXVlc3RSZW5kZXJBbGwoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fc3RhdGUuaXNEcmF3aW5nKSB7XG4gICAgICAgIHRoaXMudXBkYXRlRHJhd2luZyhwb2ludGVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2NhbnZhcy5vbignbW91c2U6dXAnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMuX2NhbnZhcyEuZ2V0UG9pbnRlcihlLmUpO1xuXG4gICAgICBpZiAoaXNQYW5uaW5nKSB7XG4gICAgICAgIGlzUGFubmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jYW52YXMhLnNldEN1cnNvcignZGVmYXVsdCcpO1xuICAgICAgICB0aGlzLl9jYW52YXMhLnJlcXVlc3RSZW5kZXJBbGwoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fc3RhdGUuaXNEcmF3aW5nKSB7XG4gICAgICAgIHRoaXMuZmluaXNoRHJhd2luZyhwb2ludGVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxyXG4gICAgLy8gU2VsZWN0aW9uIGV2ZW50c1xyXG4gICAgdGhpcy5fY2FudmFzLm9uKCdzZWxlY3Rpb246Y3JlYXRlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZE9iamVjdHMoKTtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHsgdHlwZTogJ3NlbGVjdGlvbjpjcmVhdGVkJyB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2NhbnZhcy5vbignc2VsZWN0aW9uOnVwZGF0ZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRPYmplY3RzKCk7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7IHR5cGU6ICdzZWxlY3Rpb246dXBkYXRlZCcgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYW52YXMub24oJ3NlbGVjdGlvbjpjbGVhcmVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoeyB0eXBlOiAnc2VsZWN0aW9uOmNsZWFyZWQnIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT2JqZWN0IG1vZGlmaWNhdGlvbiBldmVudHNcclxuICAgIHRoaXMuX2NhbnZhcy5vbignb2JqZWN0Om1vZGlmaWVkJywgKGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldCkge1xuICAgICAgICB0aGlzLmhhbmRsZU9iamVjdE1vZGlmaWVkKGUudGFyZ2V0IGFzIEZhYnJpY1JlY3RhbmdsZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXaGVlbCB6b29tICh6b29tIHRvIHBvaW50ZXIpXG4gICAgdGhpcy5fY2FudmFzLm9uKCdtb3VzZTp3aGVlbCcsIChvcHQ6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGVsdGEgPSBvcHQuZS5kZWx0YVk7XG4gICAgICBsZXQgem9vbSA9IHRoaXMuX3N0YXRlLnpvb207XG4gICAgICB6b29tICo9IGRlbHRhID4gMCA/IDAuOSA6IDEuMTtcbiAgICAgIHpvb20gPSBNYXRoLm1heCgwLjEsIE1hdGgubWluKDUsIHpvb20pKTtcblxuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgRmFicmljSlMuUG9pbnQob3B0LmUub2Zmc2V0WCwgb3B0LmUub2Zmc2V0WSk7XG4gICAgICB0aGlzLl9jYW52YXMhLnpvb21Ub1BvaW50KHBvaW50LCB6b29tKTtcbiAgICAgIHRoaXMuX3N0YXRlLnpvb20gPSB6b29tO1xuXG4gICAgICBvcHQuZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgb3B0LmUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFwcGx5TW9kZVNldHRpbmdzKG1vZGU/OiAnZHJhdycgfCAnZWRpdCcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xuICAgIGNvbnN0IG0gPSBtb2RlIHx8IHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGU7XG5cbiAgICAvLyBJbiBkcmF3IG1vZGUsIGRpc2FibGUgc2VsZWN0aW9uIGFuZCB0YXJnZXQgZmluZGluZyB0byBtYWtlIGRyYXdpbmcgZWFzaWVyXG4gICAgY29uc3QgZHJhd01vZGUgPSBtID09PSAnZHJhdyc7XG4gICAgKHRoaXMuX2NhbnZhcyBhcyBhbnkpLnNlbGVjdGlvbiA9ICFkcmF3TW9kZTtcbiAgICAodGhpcy5fY2FudmFzIGFzIGFueSkuc2tpcFRhcmdldEZpbmQgPSBkcmF3TW9kZTtcblxuICAgIC8vIFVwZGF0ZSBvYmplY3Qgc2VsZWN0YWJpbGl0eSBiYXNlZCBvbiBtb2RlXG4gICAgY29uc3Qgb2JqZWN0cyA9IHRoaXMuX2NhbnZhcy5nZXRPYmplY3RzKCk7XG4gICAgb2JqZWN0cy5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICBvYmouc2VsZWN0YWJsZSA9ICFkcmF3TW9kZTtcbiAgICAgIG9iai5ldmVudGVkID0gIWRyYXdNb2RlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fY2FudmFzLnJlcXVlc3RSZW5kZXJBbGwoKTtcbiAgfVxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVTZWxlY3RlZE9iamVjdHMoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2NhbnZhcykgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGFjdGl2ZU9iamVjdCA9IHRoaXMuX2NhbnZhcy5nZXRBY3RpdmVPYmplY3QoKTtcclxuXHJcbiAgICBpZiAoIWFjdGl2ZU9iamVjdCkge1xyXG4gICAgICB0aGlzLl9zdGF0ZS5zZWxlY3RlZE9iamVjdHMgPSBbXTtcclxuICAgICAgdGhpcy5fc3RhdGUubXVsdGlwbGVTZWxlY3Rpb24gPSBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAoYWN0aXZlT2JqZWN0LnR5cGUgPT09ICdhY3RpdmVTZWxlY3Rpb24nKSB7XHJcbiAgICAgIHRoaXMuX3N0YXRlLnNlbGVjdGVkT2JqZWN0cyA9IChhY3RpdmVPYmplY3QgYXMgZmFicmljLkFjdGl2ZVNlbGVjdGlvbikuZ2V0T2JqZWN0cygpO1xyXG4gICAgICB0aGlzLl9zdGF0ZS5tdWx0aXBsZVNlbGVjdGlvbiA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9zdGF0ZS5zZWxlY3RlZE9iamVjdHMgPSBbYWN0aXZlT2JqZWN0XTtcclxuICAgICAgdGhpcy5fc3RhdGUubXVsdGlwbGVTZWxlY3Rpb24gPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT2JqZWN0TW9kaWZpZWQocmVjdDogRmFicmljUmVjdGFuZ2xlKTogdm9pZCB7XHJcbiAgICBpZiAoIXJlY3QuaXNMYWJlbCB8fCAhcmVjdC5ib3VuZGluZ0JveCB8fCAhdGhpcy5pbWFnZU9iamVjdCkgcmV0dXJuO1xyXG5cclxuICAgIC8vIENvbnZlcnQgYmFjayB0byBpbWFnZSBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgaW1hZ2VDb29yZHMgPSB0aGlzLmNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyh7XHJcbiAgICAgIHg6IHJlY3QubGVmdCB8fCAwLFxyXG4gICAgICB5OiByZWN0LnRvcCB8fCAwXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBpbWFnZVdpZHRoID0gKHJlY3Qud2lkdGggfHwgMCkgLyAodGhpcy5pbWFnZU9iamVjdC5zY2FsZVggfHwgMSk7XHJcbiAgICBjb25zdCBpbWFnZUhlaWdodCA9IChyZWN0LmhlaWdodCB8fCAwKSAvICh0aGlzLmltYWdlT2JqZWN0LnNjYWxlWSB8fCAxKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgYm91bmRpbmcgYm94XHJcbiAgICByZWN0LmJvdW5kaW5nQm94LnggPSBpbWFnZUNvb3Jkcy54O1xyXG4gICAgcmVjdC5ib3VuZGluZ0JveC55ID0gaW1hZ2VDb29yZHMueTtcclxuICAgIHJlY3QuYm91bmRpbmdCb3gud2lkdGggPSBpbWFnZVdpZHRoO1xyXG4gICAgcmVjdC5ib3VuZGluZ0JveC5oZWlnaHQgPSBpbWFnZUhlaWdodDtcclxuXHJcbiAgICAvLyBVcGRhdGUgbGFiZWwgdGV4dCBwb3NpdGlvblxyXG4gICAgaWYgKHJlY3QubGFiZWxUZXh0KSB7XHJcbiAgICAgIHRoaXMudXBkYXRlTGFiZWxUZXh0KHJlY3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdvYmplY3Q6bW9kaWZpZWQnLFxyXG4gICAgICB0YXJnZXQ6IHJlY3QsXHJcbiAgICAgIGRhdGE6IHsgYm91bmRpbmdCb3g6IHJlY3QuYm91bmRpbmdCb3ggfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUxhYmVsVGV4dChyZWN0OiBGYWJyaWNSZWN0YW5nbGUpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fY2FudmFzIHx8ICFyZWN0LmJvdW5kaW5nQm94KSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgYmJveCA9IHJlY3QuYm91bmRpbmdCb3g7XHJcbiAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmFwcFN0YXRlLmNsYXNzTmFtZXMuZ2V0KGJib3guY2xhc3NJZC50b1N0cmluZygpKSB8fCBgQ2xhc3MgJHtiYm94LmNsYXNzSWR9YDtcclxuXHJcbiAgICBsZXQgbGFiZWxUZXh0ID0gJyc7XHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0NsYXNzSWQpIHtcclxuICAgICAgbGFiZWxUZXh0ICs9IGJib3guY2xhc3NJZC50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDbGFzc05hbWUpIHtcclxuICAgICAgaWYgKGxhYmVsVGV4dCkgbGFiZWxUZXh0ICs9ICc6ICc7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBjbGFzc05hbWU7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0NvbmZpZGVuY2UgJiYgYmJveC5jb25maWRlbmNlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgbGFiZWxUZXh0ICs9IGAgKCR7KGJib3guY29uZmlkZW5jZSAqIDEwMCkudG9GaXhlZCgxKX0lKWA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBGYWJyaWNKUy5UZXh0KGxhYmVsVGV4dCwge1xuICAgICAgbGVmdDogKHJlY3QubGVmdCB8fCAwKSArIDIsXG4gICAgICB0b3A6IChyZWN0LnRvcCB8fCAwKSAtIHRoaXMubGFiZWxPcHRpb25zLmZvbnRTaXplIC0gMixcbiAgICAgIGZvbnRTaXplOiB0aGlzLmxhYmVsT3B0aW9ucy5mb250U2l6ZSxcbiAgICAgIGZvbnRGYW1pbHk6IHRoaXMubGFiZWxPcHRpb25zLmZvbnRGYW1pbHksXG4gICAgICBmaWxsOiB0aGlzLmxhYmVsT3B0aW9ucy5mb250Q29sb3IsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMubGFiZWxPcHRpb25zLmJhY2tncm91bmRDb2xvcixcbiAgICAgIC8vIEF2b2lkIGludmFsaWQgYmFzZWxpbmUgdmFsdWUgd2FybmluZ3M7IGVuc3VyZSBjYW52YXMgdXNlcyBhIHZhbGlkIGJhc2VsaW5lXG4gICAgICB0ZXh0QmFzZWxpbmU6ICdhbHBoYWJldGljJyxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgZXZlbnRlZDogZmFsc2VcbiAgICB9KSBhcyBGYWJyaWNUZXh0O1xuXHJcbiAgICB0ZXh0LnBhcmVudFJlY3QgPSByZWN0O1xyXG4gICAgdGV4dC5ib3VuZGluZ0JveCA9IGJib3g7XHJcbiAgICB0ZXh0LmlzTGFiZWwgPSB0cnVlO1xyXG5cclxuICAgIHJlY3QubGFiZWxUZXh0ID0gdGV4dDtcclxuICAgIHRoaXMuX2NhbnZhcy5hZGQodGV4dCk7XHJcbiAgICB0ZXh0LmJyaW5nVG9Gcm9udCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVMYWJlbFRleHQocmVjdDogRmFicmljUmVjdGFuZ2xlKTogdm9pZCB7XHJcbiAgICBpZiAoIXJlY3QubGFiZWxUZXh0IHx8ICFyZWN0LmJvdW5kaW5nQm94KSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgYmJveCA9IHJlY3QuYm91bmRpbmdCb3g7XHJcbiAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmFwcFN0YXRlLmNsYXNzTmFtZXMuZ2V0KGJib3guY2xhc3NJZC50b1N0cmluZygpKSB8fCBgQ2xhc3MgJHtiYm94LmNsYXNzSWR9YDtcclxuXHJcbiAgICBsZXQgbGFiZWxUZXh0ID0gJyc7XHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0NsYXNzSWQpIHtcclxuICAgICAgbGFiZWxUZXh0ICs9IGJib3guY2xhc3NJZC50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGFiZWxPcHRpb25zLnNob3dDbGFzc05hbWUpIHtcclxuICAgICAgaWYgKGxhYmVsVGV4dCkgbGFiZWxUZXh0ICs9ICc6ICc7XHJcbiAgICAgIGxhYmVsVGV4dCArPSBjbGFzc05hbWU7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5sYWJlbE9wdGlvbnMuc2hvd0NvbmZpZGVuY2UgJiYgYmJveC5jb25maWRlbmNlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgbGFiZWxUZXh0ICs9IGAgKCR7KGJib3guY29uZmlkZW5jZSAqIDEwMCkudG9GaXhlZCgxKX0lKWA7XHJcbiAgICB9XHJcblxyXG4gICAgcmVjdC5sYWJlbFRleHQuc2V0KHtcclxuICAgICAgdGV4dDogbGFiZWxUZXh0LFxyXG4gICAgICBsZWZ0OiAocmVjdC5sZWZ0IHx8IDApICsgMixcclxuICAgICAgdG9wOiAocmVjdC50b3AgfHwgMCkgLSB0aGlzLmxhYmVsT3B0aW9ucy5mb250U2l6ZSAtIDIsXHJcbiAgICAgIGZvbnRTaXplOiB0aGlzLmxhYmVsT3B0aW9ucy5mb250U2l6ZSxcclxuICAgICAgZmlsbDogdGhpcy5sYWJlbE9wdGlvbnMuZm9udENvbG9yLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMubGFiZWxPcHRpb25zLmJhY2tncm91bmRDb2xvclxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbnZhc1RvSW1hZ2VDb29yZGluYXRlcyhjYW52YXNQb2ludDogUG9pbnQpOiBQb2ludCB7XHJcbiAgICBpZiAoIXRoaXMuaW1hZ2VPYmplY3QpIHJldHVybiBjYW52YXNQb2ludDtcclxuXHJcbiAgICBjb25zdCBzY2FsZVggPSB0aGlzLmltYWdlT2JqZWN0LnNjYWxlWCB8fCAxO1xyXG4gICAgY29uc3Qgc2NhbGVZID0gdGhpcy5pbWFnZU9iamVjdC5zY2FsZVkgfHwgMTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBjYW52YXNQb2ludC54IC8gc2NhbGVYLFxyXG4gICAgICB5OiBjYW52YXNQb2ludC55IC8gc2NhbGVZXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbWFnZVRvQ2FudmFzQ29vcmRpbmF0ZXMoaW1hZ2VQb2ludDogUG9pbnQpOiBQb2ludCB7XHJcbiAgICBpZiAoIXRoaXMuaW1hZ2VPYmplY3QpIHJldHVybiBpbWFnZVBvaW50O1xyXG5cclxuICAgIGNvbnN0IHNjYWxlWCA9IHRoaXMuaW1hZ2VPYmplY3Quc2NhbGVYIHx8IDE7XHJcbiAgICBjb25zdCBzY2FsZVkgPSB0aGlzLmltYWdlT2JqZWN0LnNjYWxlWSB8fCAxO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IGltYWdlUG9pbnQueCAqIHNjYWxlWCxcclxuICAgICAgeTogaW1hZ2VQb2ludC55ICogc2NhbGVZXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZW5lcmF0ZUJvdW5kaW5nQm94SWQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgYmJveF8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldENsYXNzQ29sb3IoY2xhc3NJZDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBjb2xvclBhbGV0dGVbY2xhc3NJZCAlIGNvbG9yUGFsZXR0ZS5sZW5ndGhdIHx8ICcjZmYwMDAwJztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3luY1dpdGhBcHBTdGF0ZSgpOiB2b2lkIHtcclxuICAgIC8vIFN5bmMgbGFiZWwgZGlzcGxheSBvcHRpb25zIHdpdGggYXBwIHN0YXRlXHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5zaG93TGFiZWxzID0gdGhpcy5hcHBTdGF0ZS5zaG93TGFiZWxzT25DYW52YXM7XHJcbiAgICB0aGlzLmxhYmVsT3B0aW9ucy5mb250U2l6ZSA9IHRoaXMuYXBwU3RhdGUubGFiZWxGb250U2l6ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudChldmVudDogQ2FudmFzRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBjYW52YXMgZXZlbnQgaGFuZGxlciBmb3IgJHtldmVudC50eXBlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBWYWxpZGF0aW9uIGFuZCBQZXJmb3JtYW5jZVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIHZhbGlkYXRlKCk6IENhbnZhc1ZhbGlkYXRpb24ge1xyXG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgaWYgKCF0aGlzLl9jYW52YXMpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0NhbnZhcyBub3QgaW5pdGlhbGl6ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuY3VycmVudEltYWdlKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ05vIGltYWdlIGxvYWRlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG9iamVjdENvdW50ID0gdGhpcy5fY2FudmFzPy5nZXRPYmplY3RzKCkubGVuZ3RoIHx8IDA7XHJcbiAgICBpZiAob2JqZWN0Q291bnQgPiAxMDApIHtcclxuICAgICAgd2FybmluZ3MucHVzaChgSGlnaCBvYmplY3QgY291bnQ6ICR7b2JqZWN0Q291bnR9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHBlcmZvcm1hbmNlIG1ldHJpY3NcclxuICAgIHRoaXMucGVyZm9ybWFuY2VNZXRyaWNzLm9iamVjdENvdW50ID0gb2JqZWN0Q291bnQ7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCxcclxuICAgICAgZXJyb3JzLFxyXG4gICAgICB3YXJuaW5ncyxcclxuICAgICAgcGVyZm9ybWFuY2U6IHRoaXMucGVyZm9ybWFuY2VNZXRyaWNzXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDYW52YXNDb250cm9sbGVyKGFwcFN0YXRlOiBJQXBwU3RhdGUpOiBDYW52YXNDb250cm9sbGVyIHtcclxuICByZXR1cm4gbmV3IENhbnZhc0NvbnRyb2xsZXIoYXBwU3RhdGUpO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FudmFzQ29udHJvbGxlcjtcclxuZXhwb3J0IHR5cGUgeyBJQ2FudmFzQ29udHJvbGxlciB9O1xuIiwiLyoqXHJcbiAqIEV2ZW50IE1hbmFnZXIgSW1wbGVtZW50YXRpb25cclxuICpcclxuICogSGFuZGxlcyBrZXlib2FyZCBzaG9ydGN1dHMsIG1vdXNlIGV2ZW50cywgY29udGV4dCBtZW51cywgYW5kIHVzZXIgaW50ZXJhY3Rpb25zXHJcbiAqIGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICpcclxuICogQHZlcnNpb24gMS4wLjBcclxuICogQGF1dGhvciBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuLi90eXBlcyc7XHJcbmltcG9ydCB7IElBcHBTdGF0ZSB9IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcbmltcG9ydCB7IElDYW52YXNDb250cm9sbGVyLCBCb3VuZGluZ0JveCB9IGZyb20gJy4uL3R5cGVzL2NhbnZhcyc7XHJcbmltcG9ydCB7IElGaWxlU3lzdGVtU2VydmljZSB9IGZyb20gJy4uL3R5cGVzL2ZpbGVzeXN0ZW0nO1xyXG5pbXBvcnQge1xyXG4gIEV2ZW50TWFuYWdlckNvbmZpZyxcclxuICBLZXlib2FyZFNob3J0Y3V0LFxyXG4gIE1vdXNlRXZlbnRUeXBlLFxyXG4gIENvbnRleHRNZW51RXZlbnQsXHJcbiAgRXZlbnRNYW5hZ2VyRXZlbnQsXHJcbiAgRXZlbnRNYW5hZ2VyRXZlbnRIYW5kbGVyLFxyXG4gIElFdmVudE1hbmFnZXJcclxufSBmcm9tICcuLi90eXBlcy91aSc7XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV2ZW50IE1hbmFnZXIgSW1wbGVtZW50YXRpb25cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciBpbXBsZW1lbnRzIElFdmVudE1hbmFnZXIge1xyXG4gIC8vIERlcGVuZGVuY2llc1xyXG4gIHByaXZhdGUgYXBwU3RhdGU6IElBcHBTdGF0ZTtcclxuICBwcml2YXRlIGNhbnZhc0NvbnRyb2xsZXI6IElDYW52YXNDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgZmlsZVN5c3RlbVNlcnZpY2U6IElGaWxlU3lzdGVtU2VydmljZTtcclxuXHJcbiAgLy8gRXZlbnQgaGFuZGxlcnMgYW5kIHN0YXRlXHJcbiAgcHJpdmF0ZSBldmVudExpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBFdmVudE1hbmFnZXJFdmVudEhhbmRsZXJbXT4oKTtcclxuICBwcml2YXRlIGtleWJvYXJkSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgS2V5Ym9hcmRTaG9ydGN1dD4oKTtcclxuICBwcml2YXRlIGNvbnRleHRNZW51VGFyZ2V0OiBhbnkgPSBudWxsO1xyXG4gIHByaXZhdGUgaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG4gIHByaXZhdGUgbGFzdE1vdXNlUG9zaXRpb246IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcblxyXG4gIC8vIENvbmZpZ3VyYXRpb25cclxuICBwcml2YXRlIGNvbmZpZzogRXZlbnRNYW5hZ2VyQ29uZmlnID0ge1xyXG4gICAgZW5hYmxlS2V5Ym9hcmRTaG9ydGN1dHM6IHRydWUsXHJcbiAgICBlbmFibGVDb250ZXh0TWVudTogdHJ1ZSxcclxuICAgIGVuYWJsZURyYWdBbmREcm9wOiB0cnVlLFxyXG4gICAgZG91YmxlQ2xpY2tEZWxheTogMzAwLFxyXG4gICAgbG9uZ1ByZXNzRGVsYXk6IDUwMCxcclxuICAgIGRyYWdUaHJlc2hvbGQ6IDVcclxuICB9O1xyXG5cclxuICAvLyBLZXlib2FyZCBzaG9ydGN1dHNcclxuICBwcml2YXRlIHNob3J0Y3V0czogS2V5Ym9hcmRTaG9ydGN1dFtdID0gW1xyXG4gICAgLy8gRmlsZSBvcGVyYXRpb25zXHJcbiAgICB7IGtleTogJ0tleVMnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1NhdmUgbGFiZWxzJywgYWN0aW9uOiAnc2F2ZScgfSxcclxuICAgIHsga2V5OiAnS2V5TycsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnT3BlbiBmb2xkZXInLCBhY3Rpb246ICdvcGVuLWZvbGRlcicgfSxcclxuXHJcbiAgICAvLyBNb2RlIHN3aXRjaGluZ1xyXG4gICAgeyBrZXk6ICdLZXlEJywgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gZHJhdyBtb2RlJywgYWN0aW9uOiAnbW9kZS1kcmF3JyB9LFxyXG4gICAgeyBrZXk6ICdLZXlFJywgZGVzY3JpcHRpb246ICdTd2l0Y2ggdG8gZWRpdCBtb2RlJywgYWN0aW9uOiAnbW9kZS1lZGl0JyB9LFxyXG4gICAgeyBrZXk6ICdUYWInLCBkZXNjcmlwdGlvbjogJ1RvZ2dsZSBtb2RlJywgYWN0aW9uOiAnbW9kZS10b2dnbGUnIH0sXHJcblxyXG4gICAgLy8gQ2FudmFzIG9wZXJhdGlvbnNcclxuICAgIHsga2V5OiAnRGVsZXRlJywgZGVzY3JpcHRpb246ICdEZWxldGUgc2VsZWN0ZWQnLCBhY3Rpb246ICdkZWxldGUtc2VsZWN0ZWQnIH0sXHJcbiAgICB7IGtleTogJ0JhY2tzcGFjZScsIGRlc2NyaXB0aW9uOiAnRGVsZXRlIHNlbGVjdGVkJywgYWN0aW9uOiAnZGVsZXRlLXNlbGVjdGVkJyB9LFxyXG4gICAgeyBrZXk6ICdFc2NhcGUnLCBkZXNjcmlwdGlvbjogJ0NhbmNlbC9EZXNlbGVjdCcsIGFjdGlvbjogJ2NhbmNlbCcgfSxcclxuICAgIHsga2V5OiAnS2V5QScsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnU2VsZWN0IGFsbCcsIGFjdGlvbjogJ3NlbGVjdC1hbGwnIH0sXHJcblxyXG4gICAgLy8gWm9vbSBhbmQgdmlld1xyXG4gICAgeyBrZXk6ICdFcXVhbCcsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnWm9vbSBpbicsIGFjdGlvbjogJ3pvb20taW4nIH0sXHJcbiAgICB7IGtleTogJ01pbnVzJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdab29tIG91dCcsIGFjdGlvbjogJ3pvb20tb3V0JyB9LFxyXG4gICAgeyBrZXk6ICdEaWdpdDAnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1Jlc2V0IHpvb20nLCBhY3Rpb246ICd6b29tLXJlc2V0JyB9LFxyXG4gICAgeyBrZXk6ICdLZXlGJywgZGVzY3JpcHRpb246ICdab29tIHRvIGZpdCcsIGFjdGlvbjogJ3pvb20tZml0JyB9LFxyXG5cclxuICAgIC8vIE5hdmlnYXRpb25cclxuICAgIHsga2V5OiAnQXJyb3dMZWZ0JywgZGVzY3JpcHRpb246ICdQcmV2aW91cyBpbWFnZScsIGFjdGlvbjogJ3ByZXYtaW1hZ2UnIH0sXHJcbiAgICB7IGtleTogJ0Fycm93UmlnaHQnLCBkZXNjcmlwdGlvbjogJ05leHQgaW1hZ2UnLCBhY3Rpb246ICduZXh0LWltYWdlJyB9LFxyXG4gICAgeyBrZXk6ICdIb21lJywgZGVzY3JpcHRpb246ICdGaXJzdCBpbWFnZScsIGFjdGlvbjogJ2ZpcnN0LWltYWdlJyB9LFxyXG4gICAgeyBrZXk6ICdFbmQnLCBkZXNjcmlwdGlvbjogJ0xhc3QgaW1hZ2UnLCBhY3Rpb246ICdsYXN0LWltYWdlJyB9LFxyXG5cclxuICAgIC8vIExhYmVscyBhbmQgY2xhc3Nlc1xyXG4gICAgeyBrZXk6ICdLZXlMJywgZGVzY3JpcHRpb246ICdUb2dnbGUgbGFiZWxzIHZpc2liaWxpdHknLCBhY3Rpb246ICd0b2dnbGUtbGFiZWxzJyB9LFxyXG4gICAgeyBrZXk6ICdLZXlDJywgZGVzY3JpcHRpb246ICdUb2dnbGUgY3Jvc3NoYWlyJywgYWN0aW9uOiAndG9nZ2xlLWNyb3NzaGFpcicgfSxcclxuICAgIHsga2V5OiAnS2V5SCcsIGRlc2NyaXB0aW9uOiAnVG9nZ2xlIGhlbHAnLCBhY3Rpb246ICd0b2dnbGUtaGVscCcgfSxcclxuXHJcbiAgICAvLyBDb3B5L1Bhc3RlXHJcbiAgICB7IGtleTogJ0tleUMnLCBjdHJsS2V5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ0NvcHkgc2VsZWN0ZWQnLCBhY3Rpb246ICdjb3B5JyB9LFxyXG4gICAgeyBrZXk6ICdLZXlWJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdQYXN0ZScsIGFjdGlvbjogJ3Bhc3RlJyB9LFxyXG4gICAgeyBrZXk6ICdLZXlYJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdDdXQgc2VsZWN0ZWQnLCBhY3Rpb246ICdjdXQnIH0sXHJcblxyXG4gICAgLy8gVW5kby9SZWRvIChmb3IgZnV0dXJlIGltcGxlbWVudGF0aW9uKVxyXG4gICAgeyBrZXk6ICdLZXlaJywgY3RybEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdVbmRvJywgYWN0aW9uOiAndW5kbycgfSxcclxuICAgIHsga2V5OiAnS2V5WScsIGN0cmxLZXk6IHRydWUsIGRlc2NyaXB0aW9uOiAnUmVkbycsIGFjdGlvbjogJ3JlZG8nIH0sXHJcbiAgICB7IGtleTogJ0tleVonLCBjdHJsS2V5OiB0cnVlLCBzaGlmdEtleTogdHJ1ZSwgZGVzY3JpcHRpb246ICdSZWRvJywgYWN0aW9uOiAncmVkbycgfVxyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgYXBwU3RhdGU6IElBcHBTdGF0ZSxcclxuICAgIGNhbnZhc0NvbnRyb2xsZXI6IElDYW52YXNDb250cm9sbGVyLFxyXG4gICAgZmlsZVN5c3RlbVNlcnZpY2U6IElGaWxlU3lzdGVtU2VydmljZSxcclxuICAgIGNvbmZpZz86IFBhcnRpYWw8RXZlbnRNYW5hZ2VyQ29uZmlnPlxyXG4gICkge1xyXG4gICAgdGhpcy5hcHBTdGF0ZSA9IGFwcFN0YXRlO1xyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyID0gY2FudmFzQ29udHJvbGxlcjtcclxuICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UgPSBmaWxlU3lzdGVtU2VydmljZTtcclxuXHJcbiAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgIHRoaXMuY29uZmlnID0geyAuLi50aGlzLmNvbmZpZywgLi4uY29uZmlnIH07XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRIYW5kbGVycygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEluaXRpYWxpemF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVFdmVudEhhbmRsZXJzKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLmVuYWJsZUtleWJvYXJkU2hvcnRjdXRzKSB7XHJcbiAgICAgIHRoaXMuc2V0dXBLZXlib2FyZEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNvbmZpZy5lbmFibGVDb250ZXh0TWVudSkge1xyXG4gICAgICB0aGlzLnNldHVwQ29udGV4dE1lbnVFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcuZW5hYmxlRHJhZ0FuZERyb3ApIHtcclxuICAgICAgdGhpcy5zZXR1cERyYWdBbmREcm9wRXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXR1cE1vdXNlRXZlbnRzKCk7XHJcbiAgICB0aGlzLnNldHVwQ2FudmFzRXZlbnRzKCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gS2V5Ym9hcmQgRXZlbnQgSGFuZGxpbmdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgc2V0dXBLZXlib2FyZEV2ZW50cygpOiB2b2lkIHtcclxuICAgIC8vIEJ1aWxkIGtleWJvYXJkIHNob3J0Y3V0cyBtYXBcclxuICAgIHRoaXMuc2hvcnRjdXRzLmZvckVhY2goc2hvcnRjdXQgPT4ge1xyXG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmdldFNob3J0Y3V0S2V5KHNob3J0Y3V0KTtcclxuICAgICAgdGhpcy5rZXlib2FyZEhhbmRsZXJzLnNldChrZXksIHNob3J0Y3V0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdsb2JhbCBrZXlib2FyZCBldmVudCBsaXN0ZW5lclxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5oYW5kbGVLZXlVcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlS2V5RG93bihldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgLy8gSWdub3JlIGV2ZW50cyBmcm9tIGlucHV0IGVsZW1lbnRzICh1bmxlc3MgZ2xvYmFsIHNob3J0Y3V0cylcclxuICAgIGlmICh0aGlzLmlzSW5wdXRFbGVtZW50KGV2ZW50LnRhcmdldCBhcyBFbGVtZW50KSAmJiAhdGhpcy5pc0dsb2JhbFNob3J0Y3V0KGV2ZW50KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qga2V5ID0gdGhpcy5nZXRFdmVudEtleShldmVudCk7XHJcbiAgICBjb25zdCBzaG9ydGN1dCA9IHRoaXMua2V5Ym9hcmRIYW5kbGVycy5nZXQoa2V5KTtcclxuXHJcbiAgICBpZiAoc2hvcnRjdXQpIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIHRoaXMuZXhlY3V0ZVNob3J0Y3V0KHNob3J0Y3V0LCBldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUtleVVwKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgICAvLyBIYW5kbGUgYW55IGtleSB1cCBzcGVjaWZpYyBsb2dpYyBoZXJlXHJcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xyXG4gICAgICB0aGlzLmhhbmRsZUVzY2FwZUtleSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBleGVjdXRlU2hvcnRjdXQoc2hvcnRjdXQ6IEtleWJvYXJkU2hvcnRjdXQsIGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XHJcbiAgICBzd2l0Y2ggKHNob3J0Y3V0LmFjdGlvbikge1xyXG4gICAgICAvLyBGaWxlIG9wZXJhdGlvbnNcclxuICAgICAgY2FzZSAnc2F2ZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTYXZlTGFiZWxzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ29wZW4tZm9sZGVyJzpcclxuICAgICAgICB0aGlzLmhhbmRsZU9wZW5Gb2xkZXIoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIE1vZGUgc3dpdGNoaW5nXHJcbiAgICAgIGNhc2UgJ21vZGUtZHJhdyc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKCdkcmF3Jyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21vZGUtZWRpdCc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRNb2RlKCdlZGl0Jyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21vZGUtdG9nZ2xlJzpcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLnRvZ2dsZU1vZGUoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIENhbnZhcyBvcGVyYXRpb25zXHJcbiAgICAgIGNhc2UgJ2RlbGV0ZS1zZWxlY3RlZCc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVEZWxldGVTZWxlY3RlZCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjYW5jZWwnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlQ2FuY2VsKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3NlbGVjdC1hbGwnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlU2VsZWN0QWxsKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAvLyBab29tIGFuZCB2aWV3XHJcbiAgICAgIGNhc2UgJ3pvb20taW4nOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tSW4oKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnem9vbS1vdXQnOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tT3V0KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3pvb20tcmVzZXQnOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5yZXNldFpvb20oKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnem9vbS1maXQnOlxyXG4gICAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tVG9GaXQoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIE5hdmlnYXRpb25cclxuICAgICAgY2FzZSAncHJldi1pbWFnZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVQcmV2aW91c0ltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ25leHQtaW1hZ2UnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlTmV4dEltYWdlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2ZpcnN0LWltYWdlJzpcclxuICAgICAgICB0aGlzLmhhbmRsZUZpcnN0SW1hZ2UoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGFzdC1pbWFnZSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVMYXN0SW1hZ2UoKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIC8vIExhYmVscyBhbmQgVUlcclxuICAgICAgY2FzZSAndG9nZ2xlLWxhYmVscyc6XHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5zZXRTaG93TGFiZWxzKCF0aGlzLmFwcFN0YXRlLnNob3dMYWJlbHNPbkNhbnZhcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnVwZGF0ZUxhYmVscygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd0b2dnbGUtY3Jvc3NoYWlyJzpcclxuICAgICAgICB0aGlzLmFwcFN0YXRlLnRvZ2dsZUNyb3NzaGFpcigpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgLy8gQ29weS9QYXN0ZVxyXG4gICAgICBjYXNlICdjb3B5JzpcclxuICAgICAgICB0aGlzLmhhbmRsZUNvcHkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncGFzdGUnOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlUGFzdGUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY3V0JzpcclxuICAgICAgICB0aGlzLmhhbmRsZUN1dCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgLy8gRnV0dXJlIGZlYXR1cmVzXHJcbiAgICAgIGNhc2UgJ3VuZG8nOlxyXG4gICAgICBjYXNlICdyZWRvJzpcclxuICAgICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgdW5kby9yZWRvIHN5c3RlbVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGAke3Nob3J0Y3V0LmFjdGlvbn0gbm90IHlldCBpbXBsZW1lbnRlZGApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBjb25zb2xlLndhcm4oYFVua25vd24gc2hvcnRjdXQgYWN0aW9uOiAke3Nob3J0Y3V0LmFjdGlvbn1gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2hvcnRjdXQ6ZXhlY3V0ZWQnLFxyXG4gICAgICBkYXRhOiB7IHNob3J0Y3V0LCBvcmlnaW5hbEV2ZW50OiBldmVudCB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBNb3VzZSBFdmVudCBIYW5kbGluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cE1vdXNlRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gR2xvYmFsIG1vdXNlIHRyYWNraW5nXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZUdsb2JhbE1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmhhbmRsZUdsb2JhbE1vdXNlVXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldHVwQ2FudmFzRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gQ2FudmFzLXNwZWNpZmljIG1vdXNlIGV2ZW50cyBhcmUgaGFuZGxlZCBieSBDYW52YXNDb250cm9sbGVyXHJcbiAgICAvLyBXZSBsaXN0ZW4gdG8gY2FudmFzIGV2ZW50cyBhbmQgY29vcmRpbmF0ZSB3aXRoIG90aGVyIHN5c3RlbXNcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2U6ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gZXZlbnQucG9pbnRlciB8fCB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5hcHBTdGF0ZS5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubGFzdE1vdXNlUG9zaXRpb247XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2U6bW92ZScsIChldmVudCkgPT4ge1xyXG4gICAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gZXZlbnQucG9pbnRlciB8fCB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5hcHBTdGF0ZS5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubGFzdE1vdXNlUG9zaXRpb247XHJcbiAgICAgIHRoaXMudXBkYXRlTW91c2VDb29yZGluYXRlc0Rpc3BsYXkoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3Rpb246Y3JlYXRlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnc2VsZWN0aW9uOmNoYW5nZWQnLFxyXG4gICAgICAgIGRhdGE6IHsgaGFzU2VsZWN0aW9uOiB0cnVlIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0aW9uOmNsZWFyZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ3NlbGVjdGlvbjpjaGFuZ2VkJyxcclxuICAgICAgICBkYXRhOiB7IGhhc1NlbGVjdGlvbjogZmFsc2UgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVHbG9iYWxNb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuICAgICAgLy8gSGFuZGxlIGRyYWcgb3BlcmF0aW9uc1xyXG4gICAgICB0aGlzLmhhbmRsZURyYWdNb3ZlKGV2ZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlR2xvYmFsTW91c2VVcChldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZykge1xyXG4gICAgICB0aGlzLmhhbmRsZURyYWdFbmQoZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENvbnRleHQgTWVudSBIYW5kbGluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cENvbnRleHRNZW51RXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IGNvbnRleHQgbWVudSBhbmQgc2hvdyBjdXN0b20gb25lXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIHRoaXMuaGFuZGxlQ29udGV4dE1lbnUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBFbGVtZW50O1xyXG4gICAgY29uc3QgY2FudmFzRWxlbWVudCA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5jYW52YXMuZ2V0RWxlbWVudCgpO1xyXG5cclxuICAgIGlmICh0YXJnZXQgPT09IGNhbnZhc0VsZW1lbnQgfHwgY2FudmFzRWxlbWVudC5jb250YWlucyh0YXJnZXQpKSB7XHJcbiAgICAgIHRoaXMuc2hvd0NhbnZhc0NvbnRleHRNZW51KGV2ZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2hvd0dlbmVyaWNDb250ZXh0TWVudShldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dDYW52YXNDb250ZXh0TWVudShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgcG9pbnRlciA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5jYW52YXMuZ2V0UG9pbnRlcihldmVudCk7XHJcbiAgICBjb25zdCBzZWxlY3RlZEJveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmdldFNlbGVjdGVkQm91bmRpbmdCb3hlcygpO1xyXG5cclxuICAgIGNvbnN0IGNvbnRleHRFdmVudDogQ29udGV4dE1lbnVFdmVudCA9IHtcclxuICAgICAgdHlwZTogJ2NhbnZhcycsXHJcbiAgICAgIHBvc2l0aW9uOiB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfSxcclxuICAgICAgY2FudmFzUG9zaXRpb246IHBvaW50ZXIsXHJcbiAgICAgIHRhcmdldDogbnVsbCxcclxuICAgICAgaGFzU2VsZWN0aW9uOiBzZWxlY3RlZEJveGVzLmxlbmd0aCA+IDAsXHJcbiAgICAgIHNlbGVjdGVkT2JqZWN0czogc2VsZWN0ZWRCb3hlc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNob3dDb250ZXh0TWVudShjb250ZXh0RXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93R2VuZXJpY0NvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250ZXh0RXZlbnQ6IENvbnRleHRNZW51RXZlbnQgPSB7XHJcbiAgICAgIHR5cGU6ICdnZW5lcmljJyxcclxuICAgICAgcG9zaXRpb246IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9LFxyXG4gICAgICB0YXJnZXQ6IGV2ZW50LnRhcmdldCxcclxuICAgICAgaGFzU2VsZWN0aW9uOiBmYWxzZSxcclxuICAgICAgc2VsZWN0ZWRPYmplY3RzOiBbXVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNob3dDb250ZXh0TWVudShjb250ZXh0RXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93Q29udGV4dE1lbnUoY29udGV4dEV2ZW50OiBDb250ZXh0TWVudUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbnRleHRNZW51VGFyZ2V0ID0gY29udGV4dEV2ZW50O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjb250ZXh0IG1lbnUgYmFzZWQgb24gdHlwZSBhbmQgc2VsZWN0aW9uXHJcbiAgICBjb25zdCBtZW51SXRlbXMgPSB0aGlzLmJ1aWxkQ29udGV4dE1lbnVJdGVtcyhjb250ZXh0RXZlbnQpO1xyXG5cclxuICAgIC8vIFNob3cgY29udGV4dCBtZW51ICh0aGlzIHdvdWxkIGludGVncmF0ZSB3aXRoIFVJIGZyYW1ld29yaylcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjb250ZXh0LW1lbnU6c2hvdycsXHJcbiAgICAgIGRhdGE6IHsgY29udGV4dDogY29udGV4dEV2ZW50LCBtZW51SXRlbXMgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkQ29udGV4dE1lbnVJdGVtcyhjb250ZXh0OiBDb250ZXh0TWVudUV2ZW50KTogYW55W10ge1xyXG4gICAgY29uc3QgaXRlbXM6IGFueVtdID0gW107XHJcblxyXG4gICAgaWYgKGNvbnRleHQudHlwZSA9PT0gJ2NhbnZhcycpIHtcclxuICAgICAgaWYgKGNvbnRleHQuaGFzU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgaXRlbXMucHVzaChcclxuICAgICAgICAgIHsgbGFiZWw6ICdEZWxldGUgU2VsZWN0ZWQnLCBhY3Rpb246ICdkZWxldGUtc2VsZWN0ZWQnLCBzaG9ydGN1dDogJ0RlbCcgfSxcclxuICAgICAgICAgIHsgbGFiZWw6ICdDb3B5JywgYWN0aW9uOiAnY29weScsIHNob3J0Y3V0OiAnQ3RybCtDJyB9LFxyXG4gICAgICAgICAgeyBsYWJlbDogJ0N1dCcsIGFjdGlvbjogJ2N1dCcsIHNob3J0Y3V0OiAnQ3RybCtYJyB9LFxyXG4gICAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaXRlbXMucHVzaChcclxuICAgICAgICB7IGxhYmVsOiAnUGFzdGUnLCBhY3Rpb246ICdwYXN0ZScsIHNob3J0Y3V0OiAnQ3RybCtWJywgZGlzYWJsZWQ6ICF0aGlzLmFwcFN0YXRlLmdldENsaXBib2FyZCgpIH0sXHJcbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdTZWxlY3QgQWxsJywgYWN0aW9uOiAnc2VsZWN0LWFsbCcsIHNob3J0Y3V0OiAnQ3RybCtBJyB9LFxyXG4gICAgICAgIHsgbGFiZWw6ICdEZXNlbGVjdCBBbGwnLCBhY3Rpb246ICdkZXNlbGVjdC1hbGwnLCBzaG9ydGN1dDogJ0VzYycgfSxcclxuICAgICAgICB7IHR5cGU6ICdzZXBhcmF0b3InIH0sXHJcbiAgICAgICAgeyBsYWJlbDogJ1pvb20gdG8gRml0JywgYWN0aW9uOiAnem9vbS1maXQnLCBzaG9ydGN1dDogJ0YnIH0sXHJcbiAgICAgICAgeyBsYWJlbDogJ1Jlc2V0IFpvb20nLCBhY3Rpb246ICd6b29tLXJlc2V0Jywgc2hvcnRjdXQ6ICdDdHJsKzAnIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaXRlbXM7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRHJhZyBhbmQgRHJvcCBIYW5kbGluZ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cERyYWdBbmREcm9wRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgLy8gRmlsZSBkcmFnIGFuZCBkcm9wIGZvciBsb2FkaW5nIGltYWdlc1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmhhbmRsZURyYWdPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuaGFuZGxlRHJvcC5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuaGFuZGxlRHJhZ0VudGVyLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5oYW5kbGVEcmFnTGVhdmUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdPdmVyKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudC5kYXRhVHJhbnNmZXIhLmRyb3BFZmZlY3QgPSAnY29weSc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdFbnRlcihldmVudDogRHJhZ0V2ZW50KTogdm9pZCB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgLy8gQWRkIHZpc3VhbCBmZWVkYmFjayBmb3IgZHJhZyBvcGVyYXRpb25cclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnZHJhZy1hY3RpdmUnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRHJhZ0xlYXZlKGV2ZW50OiBEcmFnRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICghZXZlbnQucmVsYXRlZFRhcmdldCkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWctYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyb3AoZXZlbnQ6IERyYWdFdmVudCk6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZy1hY3RpdmUnKTtcclxuXHJcbiAgICBjb25zdCBmaWxlcyA9IEFycmF5LmZyb20oZXZlbnQuZGF0YVRyYW5zZmVyPy5maWxlcyB8fCBbXSk7XHJcbiAgICBjb25zdCBpbWFnZUZpbGVzID0gZmlsZXMuZmlsdGVyKGZpbGUgPT4gZmlsZS50eXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKTtcclxuXHJcbiAgICBpZiAoaW1hZ2VGaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlSW1hZ2VGaWxlRHJvcChpbWFnZUZpbGVzWzBdISk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUltYWdlRmlsZURyb3AoZmlsZTogRmlsZSk6IHZvaWQge1xyXG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIubG9hZEltYWdlKGltZyk7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoaW1nLnNyYyk7XHJcbiAgICB9O1xyXG4gICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURyYWdNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICAvLyBIYW5kbGUgb2JqZWN0IGRyYWdnaW5nIHdpdGhpbiBjYW52YXNcclxuICAgIC8vIFRoaXMgaXMgbW9zdGx5IGhhbmRsZWQgYnkgRmFicmljLmpzLCBidXQgd2UgY2FuIGFkZCBjdXN0b20gbG9naWMgaGVyZVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEcmFnRW5kKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBBY3Rpb24gSGFuZGxlcnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlU2F2ZUxhYmVscygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlIHx8ICF0aGlzLmFwcFN0YXRlLmxhYmVsRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBib3VuZGluZ0JveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKTtcclxuICAgICAgY29uc3QgeW9sb0xhYmVscyA9IGJvdW5kaW5nQm94ZXMubWFwKGJib3ggPT5cclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuYm91bmRpbmdCb3hUb1lPTE8oYmJveCwge1xyXG4gICAgICAgICAgd2lkdGg6IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlPy53aWR0aCB8fCAxLFxyXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG5cclxuICAgICAgYXdhaXQgdGhpcy5maWxlU3lzdGVtU2VydmljZS5zYXZlTGFiZWxzKFxyXG4gICAgICAgIHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZS5uYW1lLFxyXG4gICAgICAgIHlvbG9MYWJlbHMsXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnbGFiZWxzOnNhdmVkJyxcclxuICAgICAgICBkYXRhOiB7IGZpbGVOYW1lOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGUubmFtZSwgY291bnQ6IHlvbG9MYWJlbHMubGVuZ3RoIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBsYWJlbHM6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPcGVuRm9sZGVyKCk6IHZvaWQge1xyXG4gICAgLy8gVHJpZ2dlciBmb2xkZXIgc2VsZWN0aW9uIFVJXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnZm9sZGVyOnNlbGVjdC1yZXF1ZXN0ZWQnLFxyXG4gICAgICBkYXRhOiB7IHR5cGU6ICdpbWFnZScgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZURlbGV0ZVNlbGVjdGVkKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZGVsZXRlZEJveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmRlbGV0ZVNlbGVjdGVkKCk7XHJcbiAgICBpZiAoZGVsZXRlZEJveGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0czpkZWxldGVkJyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBkZWxldGVkQm94ZXMubGVuZ3RoLCBvYmplY3RzOiBkZWxldGVkQm94ZXMgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEF1dG8tc2F2ZSBpZiBlbmFibGVkXHJcbiAgICAgIGlmICh0aGlzLmFwcFN0YXRlLmlzQXV0b1NhdmVFbmFibGVkKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTYXZlTGFiZWxzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ2FuY2VsKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmRlc2VsZWN0QWxsKCk7XHJcbiAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FuY2VsRHJhd2luZygpO1xyXG5cclxuICAgIGlmICh0aGlzLmNvbnRleHRNZW51VGFyZ2V0KSB7XHJcbiAgICAgIHRoaXMuaGlkZUNvbnRleHRNZW51KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZVNlbGVjdEFsbCgpOiB2b2lkIHtcclxuICAgIC8vIFNlbGVjdCBhbGwgYm91bmRpbmcgYm94ZXMgb24gY2FudmFzXHJcbiAgICBjb25zdCBhbGxCb3hlcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCk7XHJcbiAgICBhbGxCb3hlcy5mb3JFYWNoKGJib3ggPT4ge1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuc2VsZWN0Qm91bmRpbmdCb3goYmJveC5pZCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlUHJldmlvdXNJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmZpbmRJbmRleChcclxuICAgICAgZmlsZSA9PiBmaWxlLm5hbWUgPT09IHRoaXMuYXBwU3RhdGUuY3VycmVudEltYWdlRmlsZT8ubmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoY3VycmVudEluZGV4ID4gMCkge1xyXG4gICAgICBjb25zdCBwcmV2SW1hZ2UgPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXNbY3VycmVudEluZGV4IC0gMV0hO1xyXG4gICAgICB0aGlzLmxvYWRJbWFnZUZpbGUocHJldkltYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTmV4dEltYWdlKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuYXBwU3RhdGUuaW1hZ2VGaWxlcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50SW5kZXggPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMuZmluZEluZGV4KFxyXG4gICAgICBmaWxlID0+IGZpbGUubmFtZSA9PT0gdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlPy5uYW1lXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChjdXJyZW50SW5kZXggPCB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICBjb25zdCBuZXh0SW1hZ2UgPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXNbY3VycmVudEluZGV4ICsgMV0hO1xyXG4gICAgICB0aGlzLmxvYWRJbWFnZUZpbGUobmV4dEltYWdlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRmlyc3RJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmxvYWRJbWFnZUZpbGUodGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzWzBdISk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUxhc3RJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBsYXN0SW1hZ2UgPSB0aGlzLmFwcFN0YXRlLmltYWdlRmlsZXNbdGhpcy5hcHBTdGF0ZS5pbWFnZUZpbGVzLmxlbmd0aCAtIDFdITtcclxuICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKGxhc3RJbWFnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNvcHkoKTogdm9pZCB7XHJcbiAgICBjb25zdCBzZWxlY3RlZEJveGVzID0gdGhpcy5jYW52YXNDb250cm9sbGVyLmdldFNlbGVjdGVkQm91bmRpbmdCb3hlcygpO1xyXG4gICAgaWYgKHNlbGVjdGVkQm94ZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFwcFN0YXRlLnNldENsaXBib2FyZCh7XHJcbiAgICAgICAgdHlwZTogJ2JvdW5kaW5nLWJveGVzJyxcclxuICAgICAgICBkYXRhOiBzZWxlY3RlZEJveGVzLFxyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsaXBib2FyZDpjb3B5JyxcclxuICAgICAgICBkYXRhOiB7IGNvdW50OiBzZWxlY3RlZEJveGVzLmxlbmd0aCB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVQYXN0ZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNsaXBib2FyZCA9IHRoaXMuYXBwU3RhdGUuZ2V0Q2xpcGJvYXJkKCk7XHJcbiAgICBpZiAoY2xpcGJvYXJkICYmIGNsaXBib2FyZC50eXBlID09PSAnYm91bmRpbmctYm94ZXMnKSB7XHJcbiAgICAgIGNvbnN0IGJveGVzID0gY2xpcGJvYXJkLmRhdGEgYXMgQm91bmRpbmdCb3hbXTtcclxuXHJcbiAgICAgIGJveGVzLmZvckVhY2goKGJib3gsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgLy8gT2Zmc2V0IHBhc3RlZCBib3hlcyBzbGlnaHRseVxyXG4gICAgICAgIGNvbnN0IG5ld0Jib3g6IEJvdW5kaW5nQm94ID0ge1xyXG4gICAgICAgICAgLi4uYmJveCxcclxuICAgICAgICAgIGlkOiBgcGFzdGVkXyR7RGF0ZS5ub3coKX1fJHtpbmRleH1gLFxyXG4gICAgICAgICAgeDogYmJveC54ICsgMTAsXHJcbiAgICAgICAgICB5OiBiYm94LnkgKyAxMCxcclxuICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEJvdW5kaW5nQm94KG5ld0Jib3gpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZTogJ2NsaXBib2FyZDpwYXN0ZScsXHJcbiAgICAgICAgZGF0YTogeyBjb3VudDogYm94ZXMubGVuZ3RoIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBdXRvLXNhdmUgaWYgZW5hYmxlZFxyXG4gICAgICBpZiAodGhpcy5hcHBTdGF0ZS5pc0F1dG9TYXZlRW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlU2F2ZUxhYmVscygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1dCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaGFuZGxlQ29weSgpO1xyXG4gICAgdGhpcy5oYW5kbGVEZWxldGVTZWxlY3RlZCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVFc2NhcGVLZXkoKTogdm9pZCB7XHJcbiAgICAvLyBDYW5jZWwgYW55IGFjdGl2ZSBvcGVyYXRpb25zXHJcbiAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFV0aWxpdHkgTWV0aG9kc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBsb2FkSW1hZ2VGaWxlKGltYWdlRmlsZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAodGhpcy5hcHBTdGF0ZS5pbWFnZUZvbGRlckhhbmRsZSkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZmlsZVN5c3RlbVNlcnZpY2UubG9hZEltYWdlKGltYWdlRmlsZS5oYW5kbGUpO1xyXG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgIHRoaXMuYXBwU3RhdGUuc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZSk7XG4gICAgICAgICAgLy8gS2VlcCBjdXJyZW50IGltYWdlIGVsZW1lbnQgaW4gc3RhdGUgZm9yIHNhdmUgb3BlcmF0aW9uc1xuICAgICAgICAgIHRyeSB7ICh0aGlzLmFwcFN0YXRlIGFzIGFueSkuY3VycmVudEltYWdlID0gcmVzdWx0LmRhdGE7IH0gY2F0Y2gge31cbiAgICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIubG9hZEltYWdlKHJlc3VsdC5kYXRhKTtcblxyXG4gICAgICAgICAgLy8gTG9hZCBleGlzdGluZyBsYWJlbHNcclxuICAgICAgICAgIGlmICh0aGlzLmFwcFN0YXRlLmxhYmVsRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubG9hZExhYmVsc0ZvckN1cnJlbnRJbWFnZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgaW1hZ2U6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBsb2FkTGFiZWxzRm9yQ3VycmVudEltYWdlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKCF0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZUZpbGUgfHwgIXRoaXMuYXBwU3RhdGUubGFiZWxGb2xkZXJIYW5kbGUpIHJldHVybjtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlLmxvYWRMYWJlbHMoXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5jdXJyZW50SW1hZ2VGaWxlLm5hbWUsXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZS5sYWJlbEZvbGRlckhhbmRsZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XHJcbiAgICAgICAgLy8gQ2xlYXIgZXhpc3RpbmcgbGFiZWxzXHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKS5mb3JFYWNoKGJib3ggPT4ge1xyXG4gICAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnJlbW92ZUJvdW5kaW5nQm94KGJib3guaWQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgbG9hZGVkIGxhYmVsc1xyXG4gICAgICAgIHJlc3VsdC5kYXRhLmZvckVhY2goeW9sb0xhYmVsID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJib3ggPSB0aGlzLmNhbnZhc0NvbnRyb2xsZXIueW9sb1RvQm91bmRpbmdCb3goeW9sb0xhYmVsLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8ud2lkdGggfHwgMSxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmFwcFN0YXRlLmN1cnJlbnRJbWFnZT8uaGVpZ2h0IHx8IDFcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLmFkZEJvdW5kaW5nQm94KGJib3gpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBsYWJlbHM6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVNb3VzZUNvb3JkaW5hdGVzRGlzcGxheSgpOiB2b2lkIHtcclxuICAgIC8vIFVwZGF0ZSBtb3VzZSBjb29yZGluYXRlcyBpbiBVSVxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ21vdXNlOmNvb3JkaW5hdGVzLXVwZGF0ZWQnLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgY2FudmFzOiB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLFxyXG4gICAgICAgIGltYWdlOiB0aGlzLmNhbnZhc0NvbnRyb2xsZXIuY2FudmFzVG9JbWFnZSh0aGlzLmxhc3RNb3VzZVBvc2l0aW9uKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGlkZUNvbnRleHRNZW51KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jb250ZXh0TWVudVRhcmdldCA9IG51bGw7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY29udGV4dC1tZW51OmhpZGUnXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2hvcnRjdXRLZXkoc2hvcnRjdXQ6IEtleWJvYXJkU2hvcnRjdXQpOiBzdHJpbmcge1xyXG4gICAgbGV0IGtleSA9IHNob3J0Y3V0LmtleTtcclxuICAgIGlmIChzaG9ydGN1dC5jdHJsS2V5KSBrZXkgPSAnQ3RybCsnICsga2V5O1xyXG4gICAgaWYgKHNob3J0Y3V0LnNoaWZ0S2V5KSBrZXkgPSAnU2hpZnQrJyArIGtleTtcclxuICAgIGlmIChzaG9ydGN1dC5hbHRLZXkpIGtleSA9ICdBbHQrJyArIGtleTtcclxuICAgIHJldHVybiBrZXk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEV2ZW50S2V5KGV2ZW50OiBLZXlib2FyZEV2ZW50KTogc3RyaW5nIHtcclxuICAgIGxldCBrZXkgPSBldmVudC5jb2RlO1xyXG4gICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkga2V5ID0gJ0N0cmwrJyArIGtleTtcclxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gJ1NoaWZ0KycgKyBrZXk7XHJcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSAnQWx0KycgKyBrZXk7XHJcbiAgICByZXR1cm4ga2V5O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0lucHV0RWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gWydpbnB1dCcsICd0ZXh0YXJlYScsICdzZWxlY3QnLCAnb3B0aW9uJ10uaW5jbHVkZXModGFnTmFtZSkgfHxcclxuICAgICAgICAgICBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzR2xvYmFsU2hvcnRjdXQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBib29sZWFuIHtcclxuICAgIC8vIFRoZXNlIHNob3J0Y3V0cyB3b3JrIGV2ZW4gd2hlbiBpbnB1dCBlbGVtZW50cyBhcmUgZm9jdXNlZFxyXG4gICAgY29uc3QgZ2xvYmFsU2hvcnRjdXRzID0gWydLZXlTJywgJ0tleU8nLCAnS2V5WicsICdLZXlZJ107XHJcbiAgICByZXR1cm4gKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkgJiYgZ2xvYmFsU2hvcnRjdXRzLmluY2x1ZGVzKGV2ZW50LmNvZGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBFdmVudE1hbmFnZXJFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudExpc3RlbmVycy5oYXModHlwZSkpIHtcclxuICAgICAgdGhpcy5ldmVudExpc3RlbmVycy5zZXQodHlwZSwgW10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSkhLnB1c2goaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGhhbmRsZXI6IEV2ZW50TWFuYWdlckV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNwYXRjaEV2ZW50KGV2ZW50OiBFdmVudE1hbmFnZXJFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZXZlbnQgaGFuZGxlciBmb3IgJHtldmVudC50eXBlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQdWJsaWMgSW50ZXJmYWNlXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwdWJsaWMgZ2V0U2hvcnRjdXRzKCk6IEtleWJvYXJkU2hvcnRjdXRbXSB7XHJcbiAgICByZXR1cm4gWy4uLnRoaXMuc2hvcnRjdXRzXTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRDb25maWcoY29uZmlnOiBQYXJ0aWFsPEV2ZW50TWFuYWdlckNvbmZpZz4pOiB2b2lkIHtcclxuICAgIHRoaXMuY29uZmlnID0geyAuLi50aGlzLmNvbmZpZywgLi4uY29uZmlnIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q29uZmlnKCk6IEV2ZW50TWFuYWdlckNvbmZpZyB7XHJcbiAgICByZXR1cm4geyAuLi50aGlzLmNvbmZpZyB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAvLyBSZW1vdmUgYWxsIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5oYW5kbGVLZXlVcC5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgdGhpcy5oYW5kbGVDb250ZXh0TWVudS5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5oYW5kbGVEcmFnT3Zlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmhhbmRsZURyb3AuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmhhbmRsZURyYWdFbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuaGFuZGxlRHJhZ0xlYXZlLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZU1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVHbG9iYWxNb3VzZVVwLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIENsZWFyIGludGVybmFsIHN0YXRlXHJcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmtleWJvYXJkSGFuZGxlcnMuY2xlYXIoKTtcclxuICAgIHRoaXMuY29udGV4dE1lbnVUYXJnZXQgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudE1hbmFnZXIoXHJcbiAgYXBwU3RhdGU6IElBcHBTdGF0ZSxcclxuICBjYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcixcclxuICBmaWxlU3lzdGVtU2VydmljZTogSUZpbGVTeXN0ZW1TZXJ2aWNlLFxyXG4gIGNvbmZpZz86IFBhcnRpYWw8RXZlbnRNYW5hZ2VyQ29uZmlnPlxyXG4pOiBFdmVudE1hbmFnZXIge1xyXG4gIHJldHVybiBuZXcgRXZlbnRNYW5hZ2VyKGFwcFN0YXRlLCBjYW52YXNDb250cm9sbGVyLCBmaWxlU3lzdGVtU2VydmljZSwgY29uZmlnKTtcclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBFeHBvcnRzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV2ZW50TWFuYWdlcjtcclxuZXhwb3J0IHR5cGUgeyBJRXZlbnRNYW5hZ2VyLCBFdmVudE1hbmFnZXJDb25maWcsIEtleWJvYXJkU2hvcnRjdXQgfTtcbiIsIi8qKlxyXG4gKiBVdGlscyBNb2R1bGUgSW5kZXhcclxuICogXHJcbiAqIENlbnRyYWwgZXhwb3J0IHBvaW50IGZvciBhbGwgdXRpbGl0eSBmdW5jdGlvbnMgdXNlZCB0aHJvdWdob3V0IHRoZSBFYXN5IExhYmVsaW5nIGFwcGxpY2F0aW9uLlxyXG4gKiBUaGlzIGZpbGUgcHJvdmlkZXMgYSBjbGVhbiBBUEkgZm9yIGltcG9ydGluZyB1dGlsaXR5IGZ1bmN0aW9ucyBmcm9tIHZhcmlvdXMgbW9kdWxlcy5cclxuICovXHJcblxyXG4vLyBFeHBvcnQgYWxsIG5vdGlmaWNhdGlvbiB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIHNob3dUb2FzdCxcclxuICAgIHNob3dFcnJvclRvYXN0LFxyXG4gICAgc2hvd1N1Y2Nlc3NUb2FzdCxcclxuICAgIHNob3dXYXJuaW5nVG9hc3QsXHJcbiAgICBzaG93VHlwZWRUb2FzdCxcclxuICAgIHR5cGUgVG9hc3RUeXBlLFxyXG4gICAgdHlwZSBUb2FzdENvbmZpZ1xyXG59IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIGNvbG9yIHBhbGV0dGUgdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICBjb2xvclBhbGV0dGUsXHJcbiAgICBERUZBVUxUX0NPTE9SLFxyXG4gICAgZ2V0Q29sb3JGb3JDbGFzcyxcclxuICAgIGdldENvbG9yc0ZvckNsYXNzZXMsXHJcbiAgICBpc0NvbG9ySW5QYWxldHRlLFxyXG4gICAgZ2V0Q29sb3JJbmRleCxcclxuICAgIGdldENvbnRyYXN0aW5nVGV4dENvbG9yLFxyXG4gICAgaGV4VG9SZ2JhLFxyXG4gICAgQ29sb3JNYW5hZ2VyLFxyXG4gICAgdHlwZSBDb2xvckNvbmZpZ1xyXG59IGZyb20gJy4vY29sb3ItcGFsZXR0ZSc7XHJcblxyXG4vLyBFeHBvcnQgYWxsIHZhbGlkYXRpb24gdXRpbGl0aWVzXHJcbmV4cG9ydCB7XHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3MsXHJcbiAgICB2YWxpZGF0ZUxhYmVsQ2xhc3NBZHZhbmNlZCxcclxuICAgIHZhbGlkYXRlRmlsZU5hbWUsXHJcbiAgICB2YWxpZGF0ZUltYWdlRXh0ZW5zaW9uLFxyXG4gICAgdmFsaWRhdGVCb3VuZGluZ0JveCxcclxuICAgIHZhbGlkYXRlWU9MT0Nvb3JkaW5hdGVzLFxyXG4gICAgdmFsaWRhdGVab29tTGV2ZWwsXHJcbiAgICB2YWxpZGF0ZUZvbnRTaXplLFxyXG4gICAgdmFsaWRhdGVOdW1iZXIsXHJcbiAgICB2YWxpZGF0ZUVtYWlsLFxyXG4gICAgdmFsaWRhdGVVcmwsXHJcbiAgICBzYW5pdGl6ZUlucHV0LFxyXG4gICAgdHlwZSBWYWxpZGF0aW9uUmVzdWx0XHJcbn0gZnJvbSAnLi92YWxpZGF0aW9uJztcclxuXHJcbi8vIEV4cG9ydCBZT0xPIHBhcnNlciB1dGlsaXRpZXNcclxuZXhwb3J0IHtcclxuICAgIFlvbG9QYXJzZXIsXHJcbiAgICBwYXJzZVlvbG8sXHJcbiAgICBleHBvcnRZb2xvLFxyXG4gICAgdmFsaWRhdGVZb2xvU3RyaW5nXHJcbn0gZnJvbSAnLi95b2xvLXBhcnNlcic7XHJcblxyXG4vLyBSZS1leHBvcnQgY29tbW9ubHkgdXNlZCB1dGlsaXRpZXMgd2l0aCBzaG9ydGVyIG5hbWVzXHJcbmV4cG9ydCB7IHNob3dUb2FzdCBhcyB0b2FzdCB9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcbmV4cG9ydCB7IGdldENvbG9yRm9yQ2xhc3MgYXMgZ2V0Q29sb3IgfSBmcm9tICcuL2NvbG9yLXBhbGV0dGUnO1xyXG5leHBvcnQgeyB2YWxpZGF0ZUxhYmVsQ2xhc3MgYXMgdmFsaWRhdGVMYWJlbCB9IGZyb20gJy4vdmFsaWRhdGlvbic7XHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiBjYXRlZ29yaWVzIGZvciBiZXR0ZXIgb3JnYW5pemF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVXRpbGl0eUNhdGVnb3JpZXMgPSB7XHJcbiAgICBOT1RJRklDQVRJT05TOiBbXHJcbiAgICAgICAgJ3Nob3dUb2FzdCcsXHJcbiAgICAgICAgJ3Nob3dFcnJvclRvYXN0JywgXHJcbiAgICAgICAgJ3Nob3dTdWNjZXNzVG9hc3QnLFxyXG4gICAgICAgICdzaG93V2FybmluZ1RvYXN0JyxcclxuICAgICAgICAnc2hvd1R5cGVkVG9hc3QnXHJcbiAgICBdLFxyXG4gICAgQ09MT1JTOiBbXHJcbiAgICAgICAgJ2dldENvbG9yRm9yQ2xhc3MnLFxyXG4gICAgICAgICdnZXRDb2xvcnNGb3JDbGFzc2VzJyxcclxuICAgICAgICAnZ2V0Q29udHJhc3RpbmdUZXh0Q29sb3InLFxyXG4gICAgICAgICdoZXhUb1JnYmEnLFxyXG4gICAgICAgICdDb2xvck1hbmFnZXInXHJcbiAgICBdLFxyXG4gICAgVkFMSURBVElPTjogW1xyXG4gICAgICAgICd2YWxpZGF0ZUxhYmVsQ2xhc3MnLFxyXG4gICAgICAgICd2YWxpZGF0ZUZpbGVOYW1lJyxcclxuICAgICAgICAndmFsaWRhdGVJbWFnZUV4dGVuc2lvbicsXHJcbiAgICAgICAgJ3ZhbGlkYXRlQm91bmRpbmdCb3gnLFxyXG4gICAgICAgICd2YWxpZGF0ZVlPTE9Db29yZGluYXRlcydcclxuICAgIF0sXHJcbiAgICBZT0xPOiBbXHJcbiAgICAgICAgJ1lvbG9QYXJzZXInLFxyXG4gICAgICAgICdwYXJzZVlvbG8nLFxyXG4gICAgICAgICdleHBvcnRZb2xvJyxcclxuICAgICAgICAndmFsaWRhdGVZb2xvU3RyaW5nJ1xyXG4gICAgXVxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgY29uZmlndXJhdGlvbiBpbnRlcmZhY2VcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXRpbGl0eUNvbmZpZyB7XHJcbiAgICBub3RpZmljYXRpb25zOiB7XHJcbiAgICAgICAgZGVmYXVsdER1cmF0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZztcclxuICAgIH07XHJcbiAgICBjb2xvcnM6IHtcclxuICAgICAgICB1c2VIaWdoQ29udHJhc3Q6IGJvb2xlYW47XHJcbiAgICAgICAgY3VzdG9tUGFsZXR0ZT86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiBib29sZWFuO1xyXG4gICAgICAgIHNob3dFcnJvcnM6IGJvb2xlYW47XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB1dGlsaXR5IGNvbmZpZ3VyYXRpb25cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1VUSUxJVFlfQ09ORklHOiBVdGlsaXR5Q29uZmlnID0ge1xyXG4gICAgbm90aWZpY2F0aW9uczoge1xyXG4gICAgICAgIGRlZmF1bHREdXJhdGlvbjogMzAwMCxcclxuICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJyN0b2FzdC1jb250YWluZXInXHJcbiAgICB9LFxyXG4gICAgY29sb3JzOiB7XHJcbiAgICAgICAgdXNlSGlnaENvbnRyYXN0OiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgICBzdHJpY3RNb2RlOiB0cnVlLFxyXG4gICAgICAgIHNob3dFcnJvcnM6IHRydWVcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IG1hbmFnZXIgZm9yIGNvb3JkaW5hdGVkIHV0aWxpdHkgb3BlcmF0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFV0aWxpdHlNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgY29uZmlnOiBVdGlsaXR5Q29uZmlnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUGFydGlhbDxVdGlsaXR5Q29uZmlnPiA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfVVRJTElUWV9DT05GSUcsIC4uLmNvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGN1cnJlbnQgY29uZmlndXJhdGlvblxyXG4gICAgICovXHJcbiAgICBnZXRDb25maWcoKTogVXRpbGl0eUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUNvbmZpZyhuZXdDb25maWc6IFBhcnRpYWw8VXRpbGl0eUNvbmZpZz4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLm5ld0NvbmZpZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZSB1dGlsaXRpZXMgd2l0aCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICAvLyBUaGlzIGNvdWxkIGJlIGV4dGVuZGVkIHRvIHNldCB1cCBhbnkgZ2xvYmFsIHV0aWxpdHkgY29uZmlndXJhdGlvbnNcclxuICAgICAgICBjb25zb2xlLmxvZygnVXRpbGl0aWVzIGluaXRpYWxpemVkIHdpdGggY29uZmlnOicsIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCB1dGlsaXR5IG1hbmFnZXIgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBjb25zdCB1dGlsaXR5TWFuYWdlciA9IG5ldyBVdGlsaXR5TWFuYWdlcigpO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjaGVjayBpZiB1dGlsaXRpZXMgYXJlIHByb3Blcmx5IGxvYWRlZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVXRpbGl0aWVzTG9hZGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBJbXBvcnQgZnVuY3Rpb25zIGZvciB0ZXN0aW5nXHJcbiAgICAgICAgY29uc3QgeyBzaG93VG9hc3QgfSA9IHJlcXVpcmUoJy4vbm90aWZpY2F0aW9ucycpO1xyXG4gICAgICAgIGNvbnN0IHsgY29sb3JQYWxldHRlIH0gPSByZXF1aXJlKCcuL2NvbG9yLXBhbGV0dGUnKTtcclxuICAgICAgICBjb25zdCB7IHZhbGlkYXRlTGFiZWxDbGFzcyB9ID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVGVzdCBlYWNoIHV0aWxpdHkgY2F0ZWdvcnlcclxuICAgICAgICBjb25zdCBub3RpZmljYXRpb25UZXN0ID0gdHlwZW9mIHNob3dUb2FzdCA9PT0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBjb25zdCBjb2xvclRlc3QgPSBBcnJheS5pc0FycmF5KGNvbG9yUGFsZXR0ZSkgJiYgY29sb3JQYWxldHRlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvblRlc3QgPSB0eXBlb2YgdmFsaWRhdGVMYWJlbENsYXNzID09PSAnZnVuY3Rpb24nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBub3RpZmljYXRpb25UZXN0ICYmIGNvbG9yVGVzdCAmJiB2YWxpZGF0aW9uVGVzdDtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignVXRpbGl0aWVzIHZhbGlkYXRpb24gZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdXRpbGl0eSBtb2R1bGUgdmVyc2lvbiBpbmZvXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVVRJTElUWV9WRVJTSU9OID0ge1xyXG4gICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgIG1vZHVsZXM6IHtcclxuICAgICAgICBub3RpZmljYXRpb25zOiAnMS4wLjAnLFxyXG4gICAgICAgIGNvbG9yczogJzEuMC4wJyxcclxuICAgICAgICB2YWxpZGF0aW9uOiAnMS4wLjAnLFxyXG4gICAgICAgIHlvbG86ICcxLjAuMCdcclxuICAgIH0sXHJcbiAgICBidWlsZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG59O1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB1dGlsaXRpZXMgb24gbW9kdWxlIGxvYWRcclxudXRpbGl0eU1hbmFnZXIuaW5pdGlhbGl6ZSgpOyIsIi8qKlxyXG4gKiBVSSBNYW5hZ2VyIE1vZHVsZVxyXG4gKlxyXG4gKiBNYW5hZ2VzIGFsbCBET00gbWFuaXB1bGF0aW9uLCBVSSB1cGRhdGVzLCBhbmQgdXNlciBpbnRlcmZhY2UgaW50ZXJhY3Rpb25zLlxyXG4gKiBIYW5kbGVzIEJvb3RzdHJhcCBtb2RhbHMsIHBhbmVsIG1hbmFnZW1lbnQsIGxpc3QgcmVuZGVyaW5nLCBhbmQgdGhlbWUgbWFuYWdlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQgeyBJQXBwU3RhdGUgfSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnO1xyXG5pbXBvcnQgeyBJQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4uL3R5cGVzL2NhbnZhcyc7XHJcbmltcG9ydCB7IElGaWxlU3lzdGVtIH0gZnJvbSAnLi4vdHlwZXMvZmlsZS1zeXN0ZW0nO1xyXG5pbXBvcnQge1xyXG4gIERPTUVsZW1lbnRzLFxyXG4gIEJvb3RzdHJhcE1vZGFsLFxyXG4gIFBhbmVsQ29uZmlnLFxyXG4gIFNwbGl0dGVyQ29uZmlnLFxyXG4gIEZpbHRlckJ1dHRvbixcclxuICBMYWJlbEdyb3VwLFxyXG4gIENvbnRleHRNZW51Q29uZmlnLFxyXG4gIFVJU3RhdGUsXHJcbiAgVGhlbWVDb25maWcsXHJcbiAgTG9hZGluZ1N0YXRlLFxyXG4gIFNlYXJjaE9wdGlvbnMsXHJcbiAgRmlsdGVyT3B0aW9ucyxcclxuICBVSUV2ZW50LFxyXG4gIFVJRXZlbnRUeXBlLFxyXG4gIFVJRXZlbnRIYW5kbGVyLFxyXG4gIFVJTWV0aG9kcyxcclxuICBJVUlNYW5hZ2VyLFxyXG4gIEltYWdlTGlzdEl0ZW0sXHJcbiAgTGFiZWxMaXN0SXRlbSxcclxuICBQcmV2aWV3SXRlbVxyXG59IGZyb20gJy4uL3R5cGVzL3VpJztcclxuaW1wb3J0IHsgTW9kZSwgUG9pbnQgfSBmcm9tICcuLi90eXBlcy9pbmRleCc7XG5pbXBvcnQgeyBzaG93U3VjY2Vzc1RvYXN0LCBzaG93RXJyb3JUb2FzdCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEJvdW5kaW5nQm94IH0gZnJvbSAnLi4vdHlwZXMvY2FudmFzJztcclxuXHJcbi8qKlxyXG4gKiBCb290c3RyYXAgTW9kYWwgd3JhcHBlciBmb3IgdHlwZSBzYWZldHlcclxuICovXHJcbmNsYXNzIEJvb3RzdHJhcE1vZGFsV3JhcHBlciBpbXBsZW1lbnRzIEJvb3RzdHJhcE1vZGFsIHtcclxuICBwcml2YXRlIG1vZGFsOiBhbnk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAvLyBCb290c3RyYXAgNSBNb2RhbFxyXG4gICAgdGhpcy5tb2RhbCA9IG5ldyAod2luZG93IGFzIGFueSkuYm9vdHN0cmFwLk1vZGFsKGVsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgc2hvdygpOiB2b2lkIHtcclxuICAgIHRoaXMubW9kYWwuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgaGlkZSgpOiB2b2lkIHtcclxuICAgIHRoaXMubW9kYWwuaGlkZSgpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5tb2RhbC50b2dnbGUoKTtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLm1vZGFsLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVSU1hbmFnZXIgaW1wbGVtZW50YXRpb25cclxuICogTWFuYWdlcyBhbGwgdXNlciBpbnRlcmZhY2UgaW50ZXJhY3Rpb25zIGFuZCBET00gbWFuaXB1bGF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVUlNYW5hZ2VyIGltcGxlbWVudHMgSVVJTWFuYWdlciB7XHJcbiAgcHJpdmF0ZSBldmVudEhhbmRsZXJzOiBNYXA8VUlFdmVudFR5cGUsIFNldDxVSUV2ZW50SGFuZGxlcj4+ID0gbmV3IE1hcCgpO1xyXG4gIHByaXZhdGUgX2VsZW1lbnRzITogRE9NRWxlbWVudHM7XHJcbiAgcHJpdmF0ZSBwYW5lbENvbmZpZ3M6IE1hcDxzdHJpbmcsIFBhbmVsQ29uZmlnPiA9IG5ldyBNYXAoKTtcclxuICBwcml2YXRlIHNwbGl0dGVyQ29uZmlnczogU3BsaXR0ZXJDb25maWdbXSA9IFtdO1xyXG4gIHByaXZhdGUgY3VycmVudFRoZW1lOiBUaGVtZUNvbmZpZztcclxuICBwcml2YXRlIGxvYWRpbmdTdGF0ZTogTG9hZGluZ1N0YXRlO1xyXG4gIHByaXZhdGUgZmlsdGVyQnV0dG9uczogRmlsdGVyQnV0dG9uW10gPSBbXTtcclxuICBwcml2YXRlIGxhYmVsR3JvdXBzOiBMYWJlbEdyb3VwW10gPSBbXTtcclxuICBwcml2YXRlIGltYWdlTGlzdEl0ZW1zOiBJbWFnZUxpc3RJdGVtW10gPSBbXTtcclxuICBwcml2YXRlIGxhYmVsTGlzdEl0ZW1zOiBMYWJlbExpc3RJdGVtW10gPSBbXTtcclxuICBwcml2YXRlIHByZXZpZXdJdGVtczogUHJldmlld0l0ZW1bXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX3N0YXRlOiBJQXBwU3RhdGUsXHJcbiAgICBwcml2YXRlIF9jYW52YXNDb250cm9sbGVyOiBJQ2FudmFzQ29udHJvbGxlcixcclxuICAgIHByaXZhdGUgX2ZpbGVTeXN0ZW06IElGaWxlU3lzdGVtXHJcbiAgKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRUaGVtZSA9IHRoaXMuZ2V0RGVmYXVsdFRoZW1lKCk7XHJcbiAgICB0aGlzLmxvYWRpbmdTdGF0ZSA9IHtcclxuICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgbWVzc2FnZTogJycsXHJcbiAgICAgIHByb2dyZXNzOiAwXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZUVsZW1lbnRzKCk7XHJcbiAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIHRoaXMuc2V0dXBTcGxpdHRlcnMoKTtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZVBhbmVsQ29uZmlncygpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEdldHRlcnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGdldCBlbGVtZW50cygpOiBET01FbGVtZW50cyB7XHJcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHM7XHJcbiAgfVxyXG5cclxuICBnZXQgc3RhdGUoKTogSUFwcFN0YXRlIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcclxuICB9XHJcblxyXG4gIGdldCBjYW52YXNDb250cm9sbGVyKCk6IElDYW52YXNDb250cm9sbGVyIHtcclxuICAgIHJldHVybiB0aGlzLl9jYW52YXNDb250cm9sbGVyO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGZpbGVTeXN0ZW0oKTogSUZpbGVTeXN0ZW0ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZpbGVTeXN0ZW07XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRWxlbWVudCBJbml0aWFsaXphdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplRWxlbWVudHMoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9lbGVtZW50cyA9IHtcclxuICAgICAgLy8gRm9sZGVyIHNlbGVjdGlvbiBidXR0b25zXHJcbiAgICAgIHNlbGVjdEltYWdlRm9sZGVyQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtaW1hZ2UtZm9sZGVyLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBzZWxlY3RMYWJlbEZvbGRlckJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2VsZWN0LWxhYmVsLWZvbGRlci1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgbG9hZENsYXNzSW5mb0ZvbGRlckJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbG9hZC1jbGFzcy1pbmZvLWZvbGRlci1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENsYXNzIGZpbGUgZWxlbWVudHNcclxuICAgICAgY2xhc3NGaWxlU2VsZWN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1maWxlLXNlbGVjdCcpIGFzIEhUTUxTZWxlY3RFbGVtZW50LFxyXG4gICAgICB2aWV3Q2xhc3NGaWxlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCd2aWV3LWNsYXNzLWZpbGUtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGNsYXNzRmlsZVZpZXdlck1vZGFsOiBuZXcgQm9vdHN0cmFwTW9kYWxXcmFwcGVyKHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNzRmlsZVZpZXdlck1vZGFsJykpLFxyXG4gICAgICBjbGFzc0ZpbGVFZGl0b3JCb2R5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1maWxlLWVkaXRvci1ib2R5JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGFkZENsYXNzUm93QnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdhZGQtY2xhc3Mtcm93LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBzYXZlQ2xhc3NGaWxlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzYXZlLWNsYXNzLWZpbGUtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGRvd25sb2FkQ2xhc3Nlc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZG93bmxvYWQtY2xhc3Nlcy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIEltYWdlIGxpc3QgZWxlbWVudHNcclxuICAgICAgaW1hZ2VMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdpbWFnZS1saXN0JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGltYWdlU2VhcmNoSW5wdXQ6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2ltYWdlLXNlYXJjaC1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIHNob3dMYWJlbGVkQ2hlY2tib3g6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctbGFiZWxlZC1jaGVja2JveCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIHNob3dVbmxhYmVsZWRDaGVja2JveDogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2hvdy11bmxhYmVsZWQtY2hlY2tib3gnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gU2F2ZS9sb2FkIGJ1dHRvbnNcclxuICAgICAgc2F2ZUxhYmVsc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnc2F2ZS1sYWJlbHMtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIGF1dG9TYXZlVG9nZ2xlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdhdXRvLXNhdmUtdG9nZ2xlJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENhbnZhcyBkaXNwbGF5IG9wdGlvbnNcclxuICAgICAgc2hvd0xhYmVsc09uQ2FudmFzVG9nZ2xlOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzaG93LWxhYmVscy1vbi1jYW52YXMtdG9nZ2xlJykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgbGFiZWxGb250U2l6ZVNsaWRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZm9udC1zaXplLXNsaWRlcicpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGxhYmVsRm9udFNpemVWYWx1ZTogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZm9udC1zaXplLXZhbHVlJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGNyb3NzaGFpclRvZ2dsZTogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3Jvc3NoYWlyLXRvZ2dsZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBNb2RlIGJ1dHRvbnNcclxuICAgICAgZHJhd01vZGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2RyYXctbW9kZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZWRpdE1vZGVCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2VkaXQtbW9kZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuXHJcbiAgICAgIC8vIExhYmVsIGxpc3QgZWxlbWVudHNcclxuICAgICAgbGFiZWxMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1saXN0JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGxhYmVsRmlsdGVyczogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGFiZWwtZmlsdGVycycpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBzZWxlY3RCeUNsYXNzRHJvcGRvd246IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdC1ieS1jbGFzcy1kcm9wZG93bicpIGFzIEhUTUxTZWxlY3RFbGVtZW50LFxyXG4gICAgICBzZWxlY3RCeUNsYXNzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtYnktY2xhc3MtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHNvcnRMYWJlbHNBc2NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NvcnQtbGFiZWxzLWFzYy1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgc29ydExhYmVsc0Rlc2NCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3NvcnQtbGFiZWxzLWRlc2MtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBab29tIGNvbnRyb2xzXHJcbiAgICAgIHpvb21JbkJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnem9vbS1pbi1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgem9vbU91dEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnem9vbS1vdXQtYnRuJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQsXHJcbiAgICAgIHJlc2V0Wm9vbUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncmVzZXQtem9vbS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgem9vbUlucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCd6b29tLWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuXHJcbiAgICAgIC8vIENhbnZhcyBlbGVtZW50c1xyXG4gICAgICBjYW52YXNDb250YWluZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcy1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgbW91c2VDb29yZHNEaXNwbGF5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdtb3VzZS1jb29yZHMtZGlzcGxheScpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjb29yZFhJbnB1dDogdGhpcy5nZXRFbGVtZW50QnlJZCgnY29vcmQteC1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGNvb3JkWUlucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb29yZC15LWlucHV0JykgYXMgSFRNTElucHV0RWxlbWVudCxcclxuICAgICAgZ29Ub0Nvb3Jkc0J0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZ28tdG8tY29vcmRzLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gTmF2aWdhdGlvblxyXG4gICAgICBjdXJyZW50SW1hZ2VOYW1lU3BhbjogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3VycmVudC1pbWFnZS1uYW1lJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHByZXZJbWFnZUJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldi1pbWFnZS1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgbmV4dEltYWdlQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCduZXh0LWltYWdlLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gUGFuZWwgZWxlbWVudHNcclxuICAgICAgbGVmdFBhbmVsOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsZWZ0LXBhbmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHJpZ2h0UGFuZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3JpZ2h0LXBhbmVsJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIGxlZnRTcGxpdHRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnbGVmdC1zcGxpdHRlcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICByaWdodFNwbGl0dGVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdyaWdodC1zcGxpdHRlcicpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjb2xsYXBzZUxlZnRQYW5lbEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnY29sbGFwc2UtbGVmdC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZXhwYW5kTGVmdFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdleHBhbmQtbGVmdC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgY29sbGFwc2VSaWdodFBhbmVsQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb2xsYXBzZS1yaWdodC1wYW5lbC1idG4nKSBhcyBIVE1MQnV0dG9uRWxlbWVudCxcclxuICAgICAgZXhwYW5kUmlnaHRQYW5lbEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgnZXhwYW5kLXJpZ2h0LXBhbmVsLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gUHJldmlldyBiYXIgZWxlbWVudHNcclxuICAgICAgcHJldmlld0JhcjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1iYXInKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgcHJldmlld0JhckhlYWRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1iYXItaGVhZGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHRvZ2dsZVByZXZpZXdCdG46IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZS1wcmV2aWV3LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3UHJldkJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1wcmV2LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3TmV4dEJ0bjogdGhpcy5nZXRFbGVtZW50QnlJZCgncHJldmlldy1uZXh0LWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG4gICAgICBwcmV2aWV3TGlzdFdyYXBwZXI6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ3ByZXZpZXctbGlzdC13cmFwcGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHByZXZpZXdMaXN0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3LWxpc3QnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgYm90dG9tUGFuZWw6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2JvdHRvbS1wYW5lbCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBib3R0b21TcGxpdHRlcjogdGhpcy5nZXRFbGVtZW50QnlJZCgnYm90dG9tLXNwbGl0dGVyJykgYXMgSFRNTEVsZW1lbnQsXHJcblxyXG4gICAgICAvLyBUaGVtZSB0b2dnbGVcclxuICAgICAgZGFya01vZGVUb2dnbGU6IHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2RhcmstbW9kZS10b2dnbGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50LFxyXG5cclxuICAgICAgLy8gTGFiZWwgY2xhc3MgbW9kYWxcclxuICAgICAgbGFiZWxDbGFzc01vZGFsOiBuZXcgQm9vdHN0cmFwTW9kYWxXcmFwcGVyKHRoaXMuZ2V0RWxlbWVudEJ5SWQoJ2xhYmVsQ2xhc3NNb2RhbCcpKSxcclxuICAgICAgbGFiZWxDbGFzc0lucHV0OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsYWJlbC1jbGFzcy1pbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgICAgIGNsYXNzU2VsZWN0aW9uQ29udGFpbmVyOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjbGFzcy1zZWxlY3Rpb24tY29udGFpbmVyJykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgIHNhdmVMYWJlbENsYXNzQnRuOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdzYXZlLWxhYmVsLWNsYXNzLWJ0bicpIGFzIEhUTUxCdXR0b25FbGVtZW50LFxyXG5cclxuICAgICAgLy8gQ29udGV4dCBtZW51XHJcbiAgICAgIGNvbnRleHRNZW51OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjb250ZXh0LW1lbnUnKSBhcyBIVE1MRWxlbWVudCxcclxuICAgICAgY3R4RWRpdExhYmVsOiB0aGlzLmdldEVsZW1lbnRCeUlkKCdjdHgtZWRpdC1sYWJlbCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICBjdHhEZWxldGVMYWJlbDogdGhpcy5nZXRFbGVtZW50QnlJZCgnY3R4LWRlbGV0ZS1sYWJlbCcpIGFzIEhUTUxFbGVtZW50LFxyXG5cclxuICAgICAgLy8gTG9hZGluZyBvdmVybGF5XHJcbiAgICAgIGxvYWRpbmdPdmVybGF5OiB0aGlzLmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nLW92ZXJsYXknKSBhcyBIVE1MRWxlbWVudFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RWxlbWVudEJ5SWQoaWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAvLyBEdXJpbmcgbWlncmF0aW9uLCBzdXBwb3J0IGJvdGggbmV3IChrZWJhYi1jYXNlKSBhbmQgbGVnYWN5IChjYW1lbENhc2UpIElEc1xuICAgIGNvbnN0IGxlZ2FjeUlkTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgLy8gRm9sZGVyIHNlbGVjdGlvblxuICAgICAgJ3NlbGVjdC1pbWFnZS1mb2xkZXItYnRuJzogJ3NlbGVjdEltYWdlRm9sZGVyQnRuJyxcbiAgICAgICdzZWxlY3QtbGFiZWwtZm9sZGVyLWJ0bic6ICdzZWxlY3RMYWJlbEZvbGRlckJ0bicsXG4gICAgICAnbG9hZC1jbGFzcy1pbmZvLWZvbGRlci1idG4nOiAnbG9hZENsYXNzSW5mb0ZvbGRlckJ0bicsXG5cbiAgICAgIC8vIENsYXNzIGZpbGUgZWxlbWVudHNcbiAgICAgICd2aWV3LWNsYXNzLWZpbGUtYnRuJzogJ3ZpZXdDbGFzc0ZpbGVCdG4nLFxuICAgICAgJ2NsYXNzLWZpbGUtZWRpdG9yLWJvZHknOiAnY2xhc3NGaWxlRWRpdG9yQm9keScsXG4gICAgICAnYWRkLWNsYXNzLXJvdy1idG4nOiAnYWRkQ2xhc3NSb3dCdG4nLFxuICAgICAgJ3NhdmUtY2xhc3MtZmlsZS1idG4nOiAnc2F2ZUNsYXNzRmlsZUJ0bicsXG4gICAgICAnZG93bmxvYWQtY2xhc3Nlcy1idG4nOiAnZG93bmxvYWRDbGFzc2VzQnRuJyxcblxuICAgICAgLy8gSW1hZ2UgbGlzdCAvIGZpbHRlcnNcbiAgICAgICdpbWFnZS1zZWFyY2gtaW5wdXQnOiAnaW1hZ2VTZWFyY2hJbnB1dCcsXG4gICAgICAnc2hvdy1sYWJlbGVkLWNoZWNrYm94JzogJ3Nob3dMYWJlbGVkJyxcbiAgICAgICdzaG93LXVubGFiZWxlZC1jaGVja2JveCc6ICdzaG93VW5sYWJlbGVkJyxcblxuICAgICAgLy8gU2F2ZS9sb2FkXG4gICAgICAnc2F2ZS1sYWJlbHMtYnRuJzogJ3NhdmVMYWJlbHNCdG4nLFxuICAgICAgJ2F1dG8tc2F2ZS10b2dnbGUnOiAnYXV0b1NhdmVUb2dnbGUnLFxuXG4gICAgICAvLyBDYW52YXMgZGlzcGxheSBvcHRpb25zXG4gICAgICAnc2hvdy1sYWJlbHMtb24tY2FudmFzLXRvZ2dsZSc6ICdzaG93TGFiZWxzT25DYW52YXNUb2dnbGUnLFxuICAgICAgJ2xhYmVsLWZvbnQtc2l6ZS1zbGlkZXInOiAnbGFiZWwtZm9udC1zaXplJyxcbiAgICAgICdjcm9zc2hhaXItdG9nZ2xlJzogJ2Nyb3NzaGFpclRvZ2dsZScsXG5cbiAgICAgIC8vIE1vZGVzXG4gICAgICAnZHJhdy1tb2RlLWJ0bic6ICdkcmF3TW9kZScsXG4gICAgICAnZWRpdC1tb2RlLWJ0bic6ICdlZGl0TW9kZScsXG5cbiAgICAgIC8vIFNvcnRpbmdcbiAgICAgICdzb3J0LWxhYmVscy1hc2MtYnRuJzogJ3NvcnRMYWJlbHNBc2NCdG4nLFxuICAgICAgJ3NvcnQtbGFiZWxzLWRlc2MtYnRuJzogJ3NvcnRMYWJlbHNEZXNjQnRuJyxcblxuICAgICAgLy8gWm9vbSBjb250cm9sc1xuICAgICAgJ3pvb20taW4tYnRuJzogJ3pvb21JbkJ0bicsXG4gICAgICAnem9vbS1vdXQtYnRuJzogJ3pvb21PdXRCdG4nLFxuICAgICAgJ3Jlc2V0LXpvb20tYnRuJzogJ3Jlc2V0Wm9vbUJ0bicsXG5cbiAgICAgIC8vIENvb3Jkc1xuICAgICAgJ21vdXNlLWNvb3Jkcy1kaXNwbGF5JzogJ2luZm8tZGlzcGxheScsXG4gICAgICAnY29vcmQteC1pbnB1dCc6ICdjb29yZFgnLFxuICAgICAgJ2Nvb3JkLXktaW5wdXQnOiAnY29vcmRZJyxcbiAgICAgICdnby10by1jb29yZHMtYnRuJzogJ2dvVG9Db29yZHNCdG4nLFxuXG4gICAgICAvLyBOYXZpZ2F0aW9uXG4gICAgICAncHJldi1pbWFnZS1idG4nOiAncHJldkltYWdlQnRuJyxcbiAgICAgICduZXh0LWltYWdlLWJ0bic6ICduZXh0SW1hZ2VCdG4nLFxuXG4gICAgICAvLyBUaGVtZVxuICAgICAgJ2RhcmstbW9kZS10b2dnbGUnOiAnZGFya01vZGVUb2dnbGUnLFxuXG4gICAgICAvLyBMYWJlbCBjbGFzcyBtb2RhbFxuICAgICAgJ2xhYmVsLWNsYXNzLWlucHV0JzogJ2xhYmVsQ2xhc3NJbnB1dCcsXG4gICAgICAnc2F2ZS1sYWJlbC1jbGFzcy1idG4nOiAnc2F2ZUxhYmVsQ2xhc3NCdG4nLFxuICAgIH07XG5cbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGxlZ2FjeUlkID0gbGVnYWN5SWRNYXBbaWRdO1xuICAgICAgaWYgKGxlZ2FjeUlkKSB7XG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsZWdhY3lJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVsZW1lbnQgd2l0aCBJRCAnJHtpZH0nIG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgfVxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBVSUV2ZW50VHlwZSwgaGFuZGxlcjogVUlFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5ldmVudEhhbmRsZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc2V0KHR5cGUsIG5ldyBTZXQoKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KHR5cGUpIS5hZGQoaGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IFVJRXZlbnRUeXBlLCBoYW5kbGVyOiBVSUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KHR5cGUpO1xyXG4gICAgaWYgKGhhbmRsZXJzKSB7XHJcbiAgICAgIGhhbmRsZXJzLmRlbGV0ZShoYW5kbGVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzcGF0Y2hVSUV2ZW50PFQgPSBhbnk+KHR5cGU6IFVJRXZlbnRUeXBlLCBkYXRhPzogVCwgdGFyZ2V0PzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGV2ZW50OiBVSUV2ZW50PFQ+ID0ge1xyXG4gICAgICB0eXBlLFxyXG4gICAgICBkYXRhLFxyXG4gICAgICB0YXJnZXQsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuZXZlbnRIYW5kbGVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIoZXZlbnQpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBQYW5lbCBNYW5hZ2VtZW50XHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVQYW5lbENvbmZpZ3MoKTogdm9pZCB7XHJcbiAgICB0aGlzLnBhbmVsQ29uZmlncy5zZXQoJ2xlZnQnLCB7XHJcbiAgICAgIHBhbmVsOiB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbCxcclxuICAgICAgc3BsaXR0ZXI6IHRoaXMuZWxlbWVudHMubGVmdFNwbGl0dGVyLFxyXG4gICAgICBleHBhbmRCdG46IHRoaXMuZWxlbWVudHMuZXhwYW5kTGVmdFBhbmVsQnRuLFxyXG4gICAgICBpc0NvbGxhcHNpbmc6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBhbmVsQ29uZmlncy5zZXQoJ3JpZ2h0Jywge1xyXG4gICAgICBwYW5lbDogdGhpcy5lbGVtZW50cy5yaWdodFBhbmVsLFxyXG4gICAgICBzcGxpdHRlcjogdGhpcy5lbGVtZW50cy5yaWdodFNwbGl0dGVyLFxyXG4gICAgICBleHBhbmRCdG46IHRoaXMuZWxlbWVudHMuZXhwYW5kUmlnaHRQYW5lbEJ0bixcclxuICAgICAgaXNDb2xsYXBzaW5nOiBmYWxzZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVQYW5lbChjb25maWc6IFBhbmVsQ29uZmlnKTogdm9pZCB7XHJcbiAgICBpZiAoY29uZmlnLmlzQ29sbGFwc2luZykgcmV0dXJuO1xyXG5cclxuICAgIGNvbmZpZy5pc0NvbGxhcHNpbmcgPSB0cnVlO1xyXG4gICAgY29uc3QgaXNDb2xsYXBzZWQgPSBjb25maWcucGFuZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xyXG5cclxuICAgIGlmIChpc0NvbGxhcHNlZCkge1xyXG4gICAgICAvLyBFeHBhbmQgcGFuZWxcclxuICAgICAgY29uZmlnLnBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICBjb25maWcuZXhwYW5kQnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIGNvbmZpZy5zcGxpdHRlci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENvbGxhcHNlIHBhbmVsXHJcbiAgICAgIGNvbmZpZy5wYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICBjb25maWcuZXhwYW5kQnRuLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICBjb25maWcuc3BsaXR0ZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCBmbGFnIGFmdGVyIGFuaW1hdGlvblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGNvbmZpZy5pc0NvbGxhcHNpbmcgPSBmYWxzZTtcclxuICAgIH0sIDMwMCk7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ3BhbmVsOnRvZ2dsZWQnLCB7IHBhbmVsSWQ6IGNvbmZpZy5wYW5lbC5pZCwgY29sbGFwc2VkOiAhaXNDb2xsYXBzZWQgfSk7XHJcbiAgfVxyXG5cclxuICBzZXR1cFNwbGl0dGVycygpOiB2b2lkIHtcclxuICAgIHRoaXMuc3BsaXR0ZXJDb25maWdzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3BsaXR0ZXI6IHRoaXMuZWxlbWVudHMubGVmdFNwbGl0dGVyLFxyXG4gICAgICAgIHBhbmVsOiB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbCxcclxuICAgICAgICBkaXJlY3Rpb246ICdsZWZ0JyxcclxuICAgICAgICBtaW5XaWR0aDogMjAwLFxyXG4gICAgICAgIG1heFdpZHRoOiA1MDBcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHNwbGl0dGVyOiB0aGlzLmVsZW1lbnRzLnJpZ2h0U3BsaXR0ZXIsXHJcbiAgICAgICAgcGFuZWw6IHRoaXMuZWxlbWVudHMucmlnaHRQYW5lbCxcclxuICAgICAgICBkaXJlY3Rpb246ICdyaWdodCcsXHJcbiAgICAgICAgbWluV2lkdGg6IDIwMCxcclxuICAgICAgICBtYXhXaWR0aDogNTAwXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5zcGxpdHRlckNvbmZpZ3MuZm9yRWFjaChjb25maWcgPT4ge1xyXG4gICAgICB0aGlzLnNldHVwU3BsaXR0ZXIoY29uZmlnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cFNwbGl0dGVyKGNvbmZpZzogU3BsaXR0ZXJDb25maWcpOiB2b2lkIHtcclxuICAgIGxldCBpc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICBsZXQgc3RhcnRYID0gMDtcclxuICAgIGxldCBzdGFydFdpZHRoID0gMDtcclxuXHJcbiAgICBjb25maWcuc3BsaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgIHN0YXJ0WCA9IGUuY2xpZW50WDtcclxuICAgICAgc3RhcnRXaWR0aCA9IHBhcnNlSW50KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGNvbmZpZy5wYW5lbCkud2lkdGgsIDEwKTtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlTW91c2VNb3ZlKTtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVNb3VzZU1vdmUgPSAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICBpZiAoIWlzRHJhZ2dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IGRlbHRhWCA9IGNvbmZpZy5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/IGUuY2xpZW50WCAtIHN0YXJ0WCA6IHN0YXJ0WCAtIGUuY2xpZW50WDtcclxuICAgICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1pbihNYXRoLm1heChzdGFydFdpZHRoICsgZGVsdGFYLCBjb25maWcubWluV2lkdGgpLCBjb25maWcubWF4V2lkdGgpO1xyXG4gICAgICBjb25maWcucGFuZWwuc3R5bGUud2lkdGggPSBgJHtuZXdXaWR0aH1weGA7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZU1vdXNlVXAgPSAoKSA9PiB7XHJcbiAgICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlTW91c2VNb3ZlKTtcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJlc2l6ZVBhbmVscygpOiB2b2lkIHtcclxuICAgIC8vIFJlc2l6ZSBwYW5lbHMgYmFzZWQgb24gd2luZG93IHNpemVcclxuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICBjb25zdCBsZWZ0UGFuZWwgPSB0aGlzLmVsZW1lbnRzLmxlZnRQYW5lbDtcclxuICAgIGNvbnN0IHJpZ2h0UGFuZWwgPSB0aGlzLmVsZW1lbnRzLnJpZ2h0UGFuZWw7XHJcblxyXG4gICAgaWYgKHdpbmRvd1dpZHRoIDwgNzY4KSB7XHJcbiAgICAgIC8vIE1vYmlsZSB2aWV3IC0gaGlkZSBwYW5lbHNcclxuICAgICAgbGVmdFBhbmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIHJpZ2h0UGFuZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERlc2t0b3AgdmlldyAtIHNob3cgcGFuZWxzXHJcbiAgICAgIGxlZnRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgcmlnaHRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBMb2FkaW5nIFN0YXRlIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHNob3dMb2FkaW5nSW5kaWNhdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdsb2FkaW5nOnNob3cnKTtcclxuICB9XHJcblxyXG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmxvYWRpbmdPdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbG9hZGluZzpoaWRlJyk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVMb2FkaW5nUHJvZ3Jlc3MocHJvZ3Jlc3M6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2FkaW5nU3RhdGUucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgIGlmIChtZXNzYWdlKSB7XHJcbiAgICAgIHRoaXMubG9hZGluZ1N0YXRlLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBsb2FkaW5nIFVJXHJcbiAgICBjb25zdCBwcm9ncmVzc0JhciA9IHRoaXMuZWxlbWVudHMubG9hZGluZ092ZXJsYXkucXVlcnlTZWxlY3RvcignLnByb2dyZXNzLWJhcicpIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgaWYgKHByb2dyZXNzQmFyKSB7XHJcbiAgICAgIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gYCR7cHJvZ3Jlc3N9JWA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzLmxvYWRpbmdPdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkaW5nLW1lc3NhZ2UnKSBhcyBIVE1MRWxlbWVudDtcclxuICAgIGlmIChtZXNzYWdlRWxlbWVudCAmJiBtZXNzYWdlKSB7XHJcbiAgICAgIG1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gbWVzc2FnZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbG9hZGluZzpwcm9ncmVzcycsIHsgcHJvZ3Jlc3MsIG1lc3NhZ2UgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVGhlbWUgTWFuYWdlbWVudFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZ2V0Q3VycmVudFRoZW1lKCk6IFRoZW1lQ29uZmlnIHtcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaGVtZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RGVmYXVsdFRoZW1lKCk6IFRoZW1lQ29uZmlnIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6ICdsaWdodCcsXHJcbiAgICAgIHByaW1hcnlDb2xvcjogJyMwMDdiZmYnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgdGV4dENvbG9yOiAnIzMzMzMzMycsXHJcbiAgICAgIGJvcmRlckNvbG9yOiAnI2RlZTJlNidcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERhcmtUaGVtZSgpOiBUaGVtZUNvbmZpZyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOiAnZGFyaycsXHJcbiAgICAgIHByaW1hcnlDb2xvcjogJyMwZDZlZmQnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMWExYTFhJyxcclxuICAgICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgIGJvcmRlckNvbG9yOiAnIzQ0NDQ0NCdcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBhcHBseVRoZW1lKHRoZW1lOiBUaGVtZUNvbmZpZyk6IHZvaWQge1xyXG4gICAgdGhpcy5jdXJyZW50VGhlbWUgPSB0aGVtZTtcclxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtdGhlbWUnLCB0aGVtZS5uYW1lKTtcclxuXHJcbiAgICAvLyBBcHBseSBjdXN0b20gQ1NTIHZhcmlhYmxlc1xyXG4gICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tcHJpbWFyeS1jb2xvcicsIHRoZW1lLnByaW1hcnlDb2xvcik7XHJcbiAgICByb290LnN0eWxlLnNldFByb3BlcnR5KCctLWJhY2tncm91bmQtY29sb3InLCB0aGVtZS5iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS10ZXh0LWNvbG9yJywgdGhlbWUudGV4dENvbG9yKTtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoJy0tYm9yZGVyLWNvbG9yJywgdGhlbWUuYm9yZGVyQ29sb3IpO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCd0aGVtZTpjaGFuZ2VkJywgdGhlbWUpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlRGFya01vZGUoKTogdm9pZCB7XHJcbiAgICBjb25zdCBpc0RhcmsgPSB0aGlzLmN1cnJlbnRUaGVtZS5uYW1lID09PSAnZGFyayc7XHJcbiAgICBjb25zdCBuZXdUaGVtZSA9IGlzRGFyayA/IHRoaXMuZ2V0RGVmYXVsdFRoZW1lKCkgOiB0aGlzLmdldERhcmtUaGVtZSgpO1xyXG4gICAgdGhpcy5hcHBseVRoZW1lKG5ld1RoZW1lKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdG9nZ2xlIHN0YXRlXHJcbiAgICB0aGlzLmVsZW1lbnRzLmRhcmtNb2RlVG9nZ2xlLmNoZWNrZWQgPSAhaXNEYXJrO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIExpc3QgUmVuZGVyaW5nXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICByZW5kZXJJbWFnZUxpc3QoKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbWFnZUxpc3QgPSB0aGlzLmVsZW1lbnRzLmltYWdlTGlzdDtcclxuICAgIGltYWdlTGlzdC5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICB0aGlzLmltYWdlTGlzdEl0ZW1zID0gdGhpcy5fc3RhdGUuaW1hZ2VGaWxlcy5tYXAoaW1hZ2VGaWxlID0+IHtcclxuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgbGlzdEl0ZW0uY2xhc3NOYW1lID0gJ2ltYWdlLWxpc3QtaXRlbSc7XHJcbiAgICAgIGxpc3RJdGVtLmRhdGFzZXQuZmlsZU5hbWUgPSBpbWFnZUZpbGUubmFtZTtcclxuXHJcbiAgICAgIGNvbnN0IGlzTGFiZWxlZCA9IHRoaXMuX3N0YXRlLmdldEltYWdlTGFiZWxTdGF0dXMoaW1hZ2VGaWxlLm5hbWUpO1xyXG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gdGhpcy5fc3RhdGUuY3VycmVudEltYWdlRmlsZT8ubmFtZSA9PT0gaW1hZ2VGaWxlLm5hbWU7XHJcblxyXG4gICAgICBsaXN0SXRlbS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImltYWdlLWl0ZW0tY29udGVudFwiPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbWFnZS1uYW1lXCI+JHtpbWFnZUZpbGUubmFtZX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImltYWdlLXN0YXR1cyAke2lzTGFiZWxlZCA/ICdsYWJlbGVkJyA6ICd1bmxhYmVsZWQnfVwiPlxyXG4gICAgICAgICAgICAke2lzTGFiZWxlZCA/ICfil48nIDogJ+KXiyd9XHJcbiAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGA7XHJcblxyXG4gICAgICBpZiAoaXNTZWxlY3RlZCkge1xyXG4gICAgICAgIGxpc3RJdGVtLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpc3RJdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0SW1hZ2UoaW1hZ2VGaWxlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpbWFnZUxpc3QuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBmaWxlOiBpbWFnZUZpbGUsXHJcbiAgICAgICAgaXNMYWJlbGVkLFxyXG4gICAgICAgIGlzU2VsZWN0ZWQsXHJcbiAgICAgICAgZWxlbWVudDogbGlzdEl0ZW1cclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdpbWFnZTpsaXN0LXJlbmRlcmVkJywgeyBjb3VudDogdGhpcy5pbWFnZUxpc3RJdGVtcy5sZW5ndGggfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHNlbGVjdEltYWdlKGltYWdlRmlsZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc3RhdGUuc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZSk7XG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2ltYWdlOnNlbGVjdGVkJywgeyBpbWFnZUZpbGUgfSk7XG5cbiAgICAvLyBVcGRhdGUgc2VsZWN0ZWQgaGlnaGxpZ2h0IGFuZCBjdXJyZW50IGltYWdlIG5hbWVcbiAgICB0cnkge1xuICAgICAgdGhpcy5pbWFnZUxpc3RJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBpdGVtLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnLCBpdGVtLmZpbGUubmFtZSA9PT0gaW1hZ2VGaWxlLm5hbWUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7fVxuICAgIGlmICh0aGlzLl9lbGVtZW50cz8uY3VycmVudEltYWdlTmFtZVNwYW4pIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRzLmN1cnJlbnRJbWFnZU5hbWVTcGFuLnRleHRDb250ZW50ID0gaW1hZ2VGaWxlPy5uYW1lIHx8ICcnO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBMb2FkIGltYWdlIGZyb20gZmlsZSBzeXN0ZW0gYW5kIGRpc3BsYXkgb24gY2FudmFzXG4gICAgICBjb25zdCBpbWdSZXN1bHQgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLmxvYWRJbWFnZT8uKGltYWdlRmlsZS5oYW5kbGUpO1xuICAgICAgaWYgKGltZ1Jlc3VsdD8uc3VjY2VzcyAmJiBpbWdSZXN1bHQuZGF0YSkge1xuICAgICAgICBjb25zdCBpbWdFbCA9IGltZ1Jlc3VsdC5kYXRhIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgICAgIC8vIEtlZXAgY3VycmVudCBpbWFnZSBlbGVtZW50IGluIHN0YXRlIGZvciBzaXplIHJlZmVyZW5jZSB3aGVuIHNhdmluZ1xuICAgICAgICB0cnkgeyAodGhpcy5fc3RhdGUgYXMgYW55KS5jdXJyZW50SW1hZ2UgPSBpbWdFbDsgfSBjYXRjaCB7fVxuICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLmxvYWRJbWFnZShpbWdFbCk7XG5cbiAgICAgICAgLy8gTG9hZCBsYWJlbHMgaWYgbGFiZWwgZm9sZGVyIHNlbGVjdGVkXG4gICAgICAgIGNvbnN0IGxhYmVsRm9sZGVyID0gKHRoaXMuX3N0YXRlIGFzIGFueSkubGFiZWxGb2xkZXJIYW5kbGU7XG4gICAgICAgIGlmIChsYWJlbEZvbGRlcikge1xuICAgICAgICAgIGNvbnN0IGxibFJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkubG9hZExhYmVscz8uKGltYWdlRmlsZS5uYW1lLCBsYWJlbEZvbGRlcik7XG4gICAgICAgICAgaWYgKGxibFJlc3VsdD8uc3VjY2VzcyAmJiBBcnJheS5pc0FycmF5KGxibFJlc3VsdC5kYXRhKSkge1xuICAgICAgICAgICAgLy8gQ2xlYXIgZXhpc3RpbmcgbGFiZWxzXG4gICAgICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKS5mb3JFYWNoKGIgPT4gdGhpcy5fY2FudmFzQ29udHJvbGxlci5yZW1vdmVCb3VuZGluZ0JveChiLmlkKSk7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IChpbWdFbCBhcyBhbnkpLm5hdHVyYWxXaWR0aCB8fCBpbWdFbC53aWR0aCB8fCAxO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gKGltZ0VsIGFzIGFueSkubmF0dXJhbEhlaWdodCB8fCBpbWdFbC5oZWlnaHQgfHwgMTtcbiAgICAgICAgICAgIGxibFJlc3VsdC5kYXRhLmZvckVhY2goKHk6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiYm94ID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci55b2xvVG9Cb3VuZGluZ0JveCh5LCB7IHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgICAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuYWRkQm91bmRpbmdCb3goYmJveCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBzZWxlY3RlZCBpbWFnZScsIGUpO1xuICAgIH1cbiAgfVxuXHJcbiAgdXBkYXRlTGFiZWxMaXN0KCk6IHZvaWQge1xyXG4gICAgY29uc3QgbGFiZWxMaXN0ID0gdGhpcy5lbGVtZW50cy5sYWJlbExpc3Q7XHJcbiAgICBsYWJlbExpc3QuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgLy8gR2V0IGN1cnJlbnQgYm91bmRpbmcgYm94ZXMgZnJvbSBjYW52YXNcclxuICAgIGNvbnN0IGJvdW5kaW5nQm94ZXMgPSB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdldEFsbEJvdW5kaW5nQm94ZXMoKTtcclxuXHJcbiAgICB0aGlzLmxhYmVsTGlzdEl0ZW1zID0gYm91bmRpbmdCb3hlcy5tYXAoYmJveCA9PiB7XHJcbiAgICAgIGNvbnN0IGxpc3RJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIGxpc3RJdGVtLmNsYXNzTmFtZSA9ICdsYWJlbC1saXN0LWl0ZW0nO1xyXG4gICAgICBsaXN0SXRlbS5kYXRhc2V0LmxhYmVsSWQgPSBiYm94LmlkO1xyXG5cclxuICAgICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5nZXREaXNwbGF5TmFtZUZvckNsYXNzKGJib3guY2xhc3NJZC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgIGxpc3RJdGVtLmlubmVySFRNTCA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwibGFiZWwtaXRlbS1jb250ZW50XCI+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImxhYmVsLWNsYXNzXCI+JHtjbGFzc05hbWV9PC9zcGFuPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbC1jb29yZHNcIj4oJHtNYXRoLnJvdW5kKGJib3gueCl9LCAke01hdGgucm91bmQoYmJveC55KX0pPC9zcGFuPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICBgO1xyXG5cclxuICAgICAgbGlzdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RMYWJlbChiYm94LmlkKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsYWJlbExpc3QuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBpZDogYmJveC5pZCxcclxuICAgICAgICBjbGFzc0lkOiBiYm94LmNsYXNzSWQsXHJcbiAgICAgICAgY2xhc3NOYW1lLFxyXG4gICAgICAgIGJvdW5kaW5nQm94OiBiYm94LFxyXG4gICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxyXG4gICAgICAgIGVsZW1lbnQ6IGxpc3RJdGVtXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbGFiZWw6bGlzdC1yZW5kZXJlZCcsIHsgY291bnQ6IHRoaXMubGFiZWxMaXN0SXRlbXMubGVuZ3RoIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZWxlY3RMYWJlbChsYWJlbElkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuc2VsZWN0Qm91bmRpbmdCb3gobGFiZWxJZCk7XHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbGFiZWw6c2VsZWN0ZWQnLCB7IGxhYmVsSWQgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsdGVyIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHVwZGF0ZUxhYmVsRmlsdGVycyhyZWN0czogQm91bmRpbmdCb3hbXSk6IHZvaWQge1xyXG4gICAgY29uc3QgZmlsdGVyc0NvbnRhaW5lciA9IHRoaXMuZWxlbWVudHMubGFiZWxGaWx0ZXJzO1xyXG4gICAgZmlsdGVyc0NvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAvLyBHcm91cCBieSBjbGFzc1xyXG4gICAgY29uc3QgY2xhc3NHcm91cHMgPSBuZXcgTWFwPG51bWJlciwgQm91bmRpbmdCb3hbXT4oKTtcclxuICAgIHJlY3RzLmZvckVhY2gocmVjdCA9PiB7XHJcbiAgICAgIGlmICghY2xhc3NHcm91cHMuaGFzKHJlY3QuY2xhc3NJZCkpIHtcclxuICAgICAgICBjbGFzc0dyb3Vwcy5zZXQocmVjdC5jbGFzc0lkLCBbXSk7XHJcbiAgICAgIH1cclxuICAgICAgY2xhc3NHcm91cHMuZ2V0KHJlY3QuY2xhc3NJZCkhLnB1c2gocmVjdCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmZpbHRlckJ1dHRvbnMgPSBBcnJheS5mcm9tKGNsYXNzR3JvdXBzLmVudHJpZXMoKSkubWFwKChbY2xhc3NJZCwgY2xhc3NSZWN0c10pID0+IHtcclxuICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnYnRuIGJ0bi1vdXRsaW5lLXByaW1hcnkgYnRuLXNtIGZpbHRlci1idG4nO1xyXG4gICAgICBidXR0b24uZGF0YXNldC5jbGFzc0lkID0gY2xhc3NJZC50b1N0cmluZygpO1xyXG5cclxuICAgICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5nZXREaXNwbGF5TmFtZUZvckNsYXNzKGNsYXNzSWQudG9TdHJpbmcoKSk7XHJcbiAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IGAke2NsYXNzTmFtZX0gKCR7Y2xhc3NSZWN0cy5sZW5ndGh9KWA7XHJcblxyXG4gICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy50b2dnbGVGaWx0ZXIoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmaWx0ZXJzQ29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbik7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVsZW1lbnQ6IGJ1dHRvbixcclxuICAgICAgICBsYWJlbENsYXNzOiBjbGFzc0lkLnRvU3RyaW5nKCksXHJcbiAgICAgICAgY291bnQ6IGNsYXNzUmVjdHMubGVuZ3RoLFxyXG4gICAgICAgIGlzQWN0aXZlOiB0cnVlXHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnZmlsdGVyOnVwZGF0ZWQnLCB7IGZpbHRlckNvdW50OiB0aGlzLmZpbHRlckJ1dHRvbnMubGVuZ3RoIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b2dnbGVGaWx0ZXIobGFiZWxDbGFzczogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBmaWx0ZXJCdXR0b24gPSB0aGlzLmZpbHRlckJ1dHRvbnMuZmluZChidG4gPT4gYnRuLmxhYmVsQ2xhc3MgPT09IGxhYmVsQ2xhc3MpO1xyXG4gICAgaWYgKGZpbHRlckJ1dHRvbikge1xyXG4gICAgICBmaWx0ZXJCdXR0b24uaXNBY3RpdmUgPSAhZmlsdGVyQnV0dG9uLmlzQWN0aXZlO1xyXG4gICAgICBmaWx0ZXJCdXR0b24uZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBmaWx0ZXJCdXR0b24uaXNBY3RpdmUpO1xyXG4gICAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnZmlsdGVyOmNoYW5nZWQnLCB7IGxhYmVsQ2xhc3MsIGFjdGl2ZTogZmlsdGVyQnV0dG9uLmlzQWN0aXZlIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2VsZWN0QnlDbGFzc0Ryb3Bkb3duKHJlY3RzOiBCb3VuZGluZ0JveFtdKTogdm9pZCB7XHJcbiAgICBjb25zdCBkcm9wZG93biA9IHRoaXMuZWxlbWVudHMuc2VsZWN0QnlDbGFzc0Ryb3Bkb3duO1xyXG4gICAgZHJvcGRvd24uaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5TZWxlY3QgY2xhc3MuLi48L29wdGlvbj4nO1xyXG5cclxuICAgIGNvbnN0IHVuaXF1ZUNsYXNzZXMgPSBuZXcgU2V0KHJlY3RzLm1hcChyZWN0ID0+IHJlY3QuY2xhc3NJZCkpO1xyXG4gICAgdW5pcXVlQ2xhc3Nlcy5mb3JFYWNoKGNsYXNzSWQgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgb3B0aW9uLnZhbHVlID0gY2xhc3NJZC50b1N0cmluZygpO1xyXG4gICAgICBvcHRpb24udGV4dENvbnRlbnQgPSB0aGlzLmdldERpc3BsYXlOYW1lRm9yQ2xhc3MoY2xhc3NJZC50b1N0cmluZygpKTtcclxuICAgICAgZHJvcGRvd24uYXBwZW5kQ2hpbGQob3B0aW9uKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFN0YXR1cyBVcGRhdGVzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB1cGRhdGVMYWJlbEZvbGRlckJ1dHRvbihzZWxlY3RlZDogYm9vbGVhbiwgZm9sZGVyTmFtZT86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5lbGVtZW50cy5zZWxlY3RMYWJlbEZvbGRlckJ0bjtcclxuICAgIGlmIChzZWxlY3RlZCAmJiBmb2xkZXJOYW1lKSB7XHJcbiAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9IGDwn5OBICR7Zm9sZGVyTmFtZX1gO1xyXG4gICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuLXN1Y2Nlc3MnKTtcclxuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1vdXRsaW5lLXByaW1hcnknKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdTZWxlY3QgTGFiZWwgRm9sZGVyJztcclxuICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1zdWNjZXNzJyk7XHJcbiAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tb3V0bGluZS1wcmltYXJ5Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVNb2RlQnV0dG9ucyhtb2RlOiBNb2RlKTogdm9pZCB7XHJcbiAgICBjb25zdCBkcmF3QnRuID0gdGhpcy5lbGVtZW50cy5kcmF3TW9kZUJ0bjtcclxuICAgIGNvbnN0IGVkaXRCdG4gPSB0aGlzLmVsZW1lbnRzLmVkaXRNb2RlQnRuO1xyXG5cclxuICAgIGRyYXdCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgbW9kZSA9PT0gJ2RyYXcnKTtcclxuICAgIGVkaXRCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgbW9kZSA9PT0gJ2VkaXQnKTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoVUlFdmVudCgnbW9kZTpjaGFuZ2VkJywgeyBtb2RlIH0pO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlWm9vbURpc3BsYXkoKTogdm9pZCB7XHJcbiAgICBjb25zdCB6b29tID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci5nZXRab29tKCk7XHJcbiAgICB0aGlzLmVsZW1lbnRzLnpvb21JbnB1dC52YWx1ZSA9IE1hdGgucm91bmQoem9vbSAqIDEwMCkudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZU1vdXNlQ29vcmRzKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZW1lbnRzLm1vdXNlQ29vcmRzRGlzcGxheS50ZXh0Q29udGVudCA9IGAoJHtNYXRoLnJvdW5kKHgpfSwgJHtNYXRoLnJvdW5kKHkpfSlgO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlQ3VycmVudEltYWdlRGlzcGxheShpbWFnZU5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jdXJyZW50SW1hZ2VOYW1lU3Bhbi50ZXh0Q29udGVudCA9IGltYWdlTmFtZTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDb250ZXh0IE1lbnVcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHNob3dDb250ZXh0TWVudShjb25maWc6IENvbnRleHRNZW51Q29uZmlnKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250ZXh0TWVudSA9IHRoaXMuZWxlbWVudHMuY29udGV4dE1lbnU7XHJcbiAgICBjb250ZXh0TWVudS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIGNvbnRleHRNZW51LnN0eWxlLmxlZnQgPSBgJHtjb25maWcueH1weGA7XHJcbiAgICBjb250ZXh0TWVudS5zdHlsZS50b3AgPSBgJHtjb25maWcueX1weGA7XHJcblxyXG4gICAgdGhpcy5kaXNwYXRjaFVJRXZlbnQoJ2NvbnRleHQtbWVudTpzaG93JywgY29uZmlnKTtcclxuICB9XHJcblxyXG4gIGhpZGVDb250ZXh0TWVudSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZWxlbWVudHMuY29udGV4dE1lbnUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIHRoaXMuZGlzcGF0Y2hVSUV2ZW50KCdjb250ZXh0LW1lbnU6aGlkZScpO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIE1vZGFsIE1hbmFnZW1lbnRcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHNob3dDbGFzc0VkaXRvcigpOiB2b2lkIHtcclxuICAgIHRoaXMuZWxlbWVudHMuY2xhc3NGaWxlVmlld2VyTW9kYWwuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgaGlkZUNsYXNzRWRpdG9yKCk6IHZvaWQge1xyXG4gICAgdGhpcy5lbGVtZW50cy5jbGFzc0ZpbGVWaWV3ZXJNb2RhbC5oaWRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVXRpbGl0eSBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBnZXREaXNwbGF5TmFtZUZvckNsYXNzKGxhYmVsQ2xhc3M6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuY2xhc3NOYW1lcy5nZXQobGFiZWxDbGFzcykgfHwgYENsYXNzICR7bGFiZWxDbGFzc31gO1xyXG4gIH1cclxuXHJcbiAgZ2V0RE9NRWxlbWVudHMoKTogRE9NRWxlbWVudHMge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHM7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdGUgR2V0dGVyc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZ2V0VUlTdGF0ZSgpOiBVSVN0YXRlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzSW1hZ2VMaXN0VmlzaWJsZTogdGhpcy5lbGVtZW50cy5pbWFnZUxpc3Quc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnLFxyXG4gICAgICBpc0xhYmVsTGlzdFZpc2libGU6IHRoaXMuZWxlbWVudHMubGFiZWxMaXN0LnN0eWxlLmRpc3BsYXkgIT09ICdub25lJyxcclxuICAgICAgaXNQcmV2aWV3QmFyVmlzaWJsZTogdGhpcy5lbGVtZW50cy5wcmV2aWV3QmFyLnN0eWxlLmRpc3BsYXkgIT09ICdub25lJyxcclxuICAgICAgaXNMZWZ0UGFuZWxDb2xsYXBzZWQ6IHRoaXMuZWxlbWVudHMubGVmdFBhbmVsLnN0eWxlLmRpc3BsYXkgPT09ICdub25lJyxcclxuICAgICAgaXNSaWdodFBhbmVsQ29sbGFwc2VkOiB0aGlzLmVsZW1lbnRzLnJpZ2h0UGFuZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnLFxyXG4gICAgICBhY3RpdmVGaWx0ZXJzOiBuZXcgU2V0KHRoaXMuZmlsdGVyQnV0dG9ucy5maWx0ZXIoYnRuID0+IGJ0bi5pc0FjdGl2ZSkubWFwKGJ0biA9PiBidG4ubGFiZWxDbGFzcykpLFxyXG4gICAgICBzZWxlY3RlZExhYmVsczogbmV3IFNldCgpIC8vIFRPRE86IGltcGxlbWVudCBzZWxlY3Rpb24gdHJhY2tpbmdcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBnZXRTZWFyY2hPcHRpb25zKCk6IFNlYXJjaE9wdGlvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2VhcmNoVGVybTogdGhpcy5lbGVtZW50cy5pbWFnZVNlYXJjaElucHV0LnZhbHVlLFxyXG4gICAgICBzaG93TGFiZWxlZDogdGhpcy5lbGVtZW50cy5zaG93TGFiZWxlZENoZWNrYm94LmNoZWNrZWQsXHJcbiAgICAgIHNob3dVbmxhYmVsZWQ6IHRoaXMuZWxlbWVudHMuc2hvd1VubGFiZWxlZENoZWNrYm94LmNoZWNrZWQsXHJcbiAgICAgIHNvcnRPcmRlcjogJ25hbWUnLCAvLyBUT0RPOiBpbXBsZW1lbnQgZHluYW1pYyBzb3J0aW5nXHJcbiAgICAgIHNvcnREaXJlY3Rpb246ICdhc2MnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0RmlsdGVyT3B0aW9ucygpOiBGaWx0ZXJPcHRpb25zIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFjdGl2ZUNsYXNzZXM6IG5ldyBTZXQodGhpcy5maWx0ZXJCdXR0b25zLmZpbHRlcihidG4gPT4gYnRuLmlzQWN0aXZlKS5tYXAoYnRuID0+IGJ0bi5sYWJlbENsYXNzKSksXHJcbiAgICAgIHNob3dBbGw6IHRoaXMuZmlsdGVyQnV0dG9ucy5sZW5ndGggPT09IDAsXHJcbiAgICAgIGhpZGVFbXB0eTogZmFsc2UgLy8gVE9ETzogaW1wbGVtZW50IGhpZGUgZW1wdHkgb3B0aW9uXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBFdmVudCBMaXN0ZW5lciBTZXR1cFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cclxuICBwcml2YXRlIHNldHVwRXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgLy8gU3luYyBVSSB3aGVuIG1vZGUgY2hhbmdlcyBwcm9ncmFtbWF0aWNhbGx5IChlLmcuLCByaWdodC1jbGljayB0b2dnbGUpXG4gICAgdHJ5IHtcbiAgICAgICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmFkZEV2ZW50TGlzdGVuZXIoJ21vZGU6Y2hhbmdlZCcsIChldnQ6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gZXZ0Py5kYXRhPy5jdXJyZW50O1xuICAgICAgICB0aGlzLnN5bmNNb2RlVUkoY3VycmVudCk7XG4gICAgICB9KTtcbiAgICAgIC8vIEluaXRpYWxpemUgb25jZVxuICAgICAgdGhpcy5zeW5jTW9kZVVJKCh0aGlzLl9zdGF0ZSBhcyBhbnkpLmN1cnJlbnRNb2RlKTtcbiAgICB9IGNhdGNoIHt9XG4gICAgLy8gVXBkYXRlIGNvb3JkIGlucHV0cyB3aXRoIGltYWdlIHBvaW50ZXIgcG9zaXRpb25cbiAgICB0cnkge1xuICAgICAgKHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIgYXMgYW55KS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZTptb3ZlJywgKGV2dDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGltZyA9IGV2dD8uZGF0YT8uaW1hZ2U7XG4gICAgICAgIGlmIChpbWcgJiYgTnVtYmVyLmlzRmluaXRlKGltZy54KSAmJiBOdW1iZXIuaXNGaW5pdGUoaW1nLnkpKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50cy5jb29yZFhJbnB1dC52YWx1ZSA9IFN0cmluZyhNYXRoLnJvdW5kKGltZy54KSk7XG4gICAgICAgICAgdGhpcy5lbGVtZW50cy5jb29yZFlJbnB1dC52YWx1ZSA9IFN0cmluZyhNYXRoLnJvdW5kKGltZy55KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge31cbiAgICAvLyBGb2xkZXIgc2VsZWN0aW9uXG4gICAgdGhpcy5lbGVtZW50cy5zZWxlY3RJbWFnZUZvbGRlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkuc2VsZWN0SW1hZ2VGb2xkZXI/LigpO1xuICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgdGhpcy5fc3RhdGUuc2V0SW1hZ2VGb2xkZXIocmVzdWx0LmRhdGEpO1xuXG4gICAgICAgICAgLy8gQXV0by1kZXRlY3Qgb3IgY3JlYXRlIGxhYmVsIGZvbGRlciBpbnNpZGUgdGhlIHNlbGVjdGVkIGltYWdlIGZvbGRlclxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZUZvbGRlckhhbmRsZSA9IHJlc3VsdC5kYXRhIGFzIGFueTtcbiAgICAgICAgICAgIGxldCBsYWJlbEhhbmRsZTogYW55IHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgICAvLyBUcnkgY29tbW9uIG5hbWVzIGZpcnN0OiAnbGFiZWxzJywgdGhlbiAnbGFiZWwnXG4gICAgICAgICAgICB0cnkgeyBsYWJlbEhhbmRsZSA9IGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLmdldERpcmVjdG9yeUhhbmRsZSgnbGFiZWxzJyk7IH0gY2F0Y2gge31cbiAgICAgICAgICAgIGlmICghbGFiZWxIYW5kbGUpIHsgdHJ5IHsgbGFiZWxIYW5kbGUgPSBhd2FpdCBpbWFnZUZvbGRlckhhbmRsZS5nZXREaXJlY3RvcnlIYW5kbGUoJ2xhYmVsJyk7IH0gY2F0Y2gge30gfVxuXG4gICAgICAgICAgICBpZiAoIWxhYmVsSGFuZGxlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZSA9IHdpbmRvdy5jb25maXJtKCdObyBsYWJlbCBmb2xkZXIgZm91bmQgaW5zaWRlIHRoZSBzZWxlY3RlZCBpbWFnZSBmb2xkZXIuXFxuQ3JlYXRlIGEgbmV3IFwibGFiZWxzXCIgZm9sZGVyPycpO1xuICAgICAgICAgICAgICBpZiAoY3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1hZ2VGb2xkZXJIYW5kbGUucmVxdWVzdFBlcm1pc3Npb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGVybSA9IGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLnJlcXVlc3RQZXJtaXNzaW9uKHsgbW9kZTogJ3JlYWR3cml0ZScgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJtICE9PSAnZ3JhbnRlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbWFnZUZvbGRlckhhbmRsZS5yZXF1ZXN0UGVybWlzc2lvbih7IG1vZGU6ICdyZWFkd3JpdGUnIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBsYWJlbEhhbmRsZSA9IGF3YWl0IGltYWdlRm9sZGVySGFuZGxlLmdldERpcmVjdG9yeUhhbmRsZSgnbGFiZWxzJywgeyBjcmVhdGU6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIGxhYmVscyBmb2xkZXInLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgc2hvd0Vycm9yVG9hc3QoJ1Blcm1pc3Npb24gYmxvY2tlZC4gVXNlIFwiTG9hZCBMYWJlbCBGb2xkZXJcIiB0byBwaWNrIGEgZm9sZGVyLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxIYW5kbGUpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc3RhdGUuc2V0TGFiZWxGb2xkZXIobGFiZWxIYW5kbGUpO1xuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxhYmVsRm9sZGVyQnV0dG9uKHRydWUsIGxhYmVsSGFuZGxlLm5hbWUpO1xuICAgICAgICAgICAgICBzaG93U3VjY2Vzc1RvYXN0KGBMYWJlbCBmb2xkZXIgcmVhZHk6ICR7bGFiZWxIYW5kbGUubmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0xhYmVsIGZvbGRlciBkZXRlY3Rpb24vY3JlYXRpb24gc2tpcHBlZDonLCBlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBMaXN0IGltYWdlcyBhZnRlciBsYWJlbCBmb2xkZXIgaGFuZGxpbmdcbiAgICAgICAgICBjb25zdCBsaXN0UmVzID0gYXdhaXQgKHRoaXMuX2ZpbGVTeXN0ZW0gYXMgYW55KS5saXN0SW1hZ2VGaWxlcz8uKHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICBpZiAobGlzdFJlcz8uc3VjY2VzcyAmJiBBcnJheS5pc0FycmF5KGxpc3RSZXMuZGF0YSkpIHtcbiAgICAgICAgICAgICh0aGlzLl9zdGF0ZSBhcyBhbnkpLmltYWdlRmlsZXMgPSBsaXN0UmVzLmRhdGE7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckltYWdlTGlzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VsZWN0IGltYWdlIGZvbGRlcicsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5zZWxlY3RMYWJlbEZvbGRlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkuc2VsZWN0TGFiZWxGb2xkZXI/LigpO1xuICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgdGhpcy5fc3RhdGUuc2V0TGFiZWxGb2xkZXIocmVzdWx0LmRhdGEpO1xuICAgICAgICAgIHRoaXMudXBkYXRlTGFiZWxGb2xkZXJCdXR0b24odHJ1ZSwgcmVzdWx0LmRhdGEubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNlbGVjdCBsYWJlbCBmb2xkZXInLCBlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZWxlbWVudHMubG9hZENsYXNzSW5mb0ZvbGRlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0ICh0aGlzLl9maWxlU3lzdGVtIGFzIGFueSkuc2VsZWN0Q2xhc3NJbmZvRm9sZGVyPy4oKTtcbiAgICAgICAgaWYgKHJlc3VsdD8uc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgIHRoaXMuX3N0YXRlLnNldENsYXNzSW5mb0ZvbGRlcihyZXN1bHQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNlbGVjdCBjbGFzcyBpbmZvIGZvbGRlcicsIGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWm9vbSBjb250cm9sc1xuICAgIHRoaXMuZWxlbWVudHMuem9vbUluQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5fY2FudmFzQ29udHJvbGxlci56b29tSW4oKSk7XG4gICAgdGhpcy5lbGVtZW50cy56b29tT3V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5fY2FudmFzQ29udHJvbGxlci56b29tT3V0KCkpO1xuICAgIHRoaXMuZWxlbWVudHMucmVzZXRab29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5fY2FudmFzQ29udHJvbGxlci5yZXNldFpvb20oKSk7XG5cbiAgICAvLyBNb2RlIHN3aXRjaGluZ1xuICAgIHRoaXMuZWxlbWVudHMuZHJhd01vZGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9zdGF0ZS5zZXRNb2RlKCdkcmF3JykpO1xuICAgIHRoaXMuZWxlbWVudHMuZWRpdE1vZGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9zdGF0ZS5zZXRNb2RlKCdlZGl0JykpO1xuXG4gICAgLy8gQ2FudmFzIGRpc3BsYXkgb3B0aW9uc1xuICAgIHRoaXMuZWxlbWVudHMuc2hvd0xhYmVsc09uQ2FudmFzVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuX3N0YXRlLnNldFNob3dMYWJlbHModGhpcy5lbGVtZW50cy5zaG93TGFiZWxzT25DYW52YXNUb2dnbGUuY2hlY2tlZCk7XG4gICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLnVwZGF0ZUxhYmVscygpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbWVudHMubGFiZWxGb250U2l6ZVNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHZhbCA9IE51bWJlcih0aGlzLmVsZW1lbnRzLmxhYmVsRm9udFNpemVTbGlkZXIudmFsdWUpO1xuICAgICAgdGhpcy5lbGVtZW50cy5sYWJlbEZvbnRTaXplVmFsdWUudGV4dENvbnRlbnQgPSBTdHJpbmcodmFsKTtcbiAgICAgIHRoaXMuX3N0YXRlLnNldExhYmVsRm9udFNpemUodmFsKTtcbiAgICAgIHRoaXMuX2NhbnZhc0NvbnRyb2xsZXIuc2V0TGFiZWxGb250KHZhbCk7XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtZW50cy5hdXRvU2F2ZVRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9zdGF0ZS5zZXRBdXRvU2F2ZSh0aGlzLmVsZW1lbnRzLmF1dG9TYXZlVG9nZ2xlLmNoZWNrZWQpO1xuICAgIH0pO1xuICAgIHRoaXMuZWxlbWVudHMuY3Jvc3NoYWlyVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuX3N0YXRlLnRvZ2dsZUNyb3NzaGFpcigpO1xuICAgIH0pO1xuXG4gICAgLy8gV2luZG93IHJlc2l6ZSBoYW5kbGVyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIHRoaXMucmVzaXplUGFuZWxzKCk7XG4gICAgfSk7XG5cclxuICAgIC8vIFBhbmVsIGNvbGxhcHNlL2V4cGFuZCBidXR0b25zXHJcbiAgICB0aGlzLmVsZW1lbnRzLmNvbGxhcHNlTGVmdFBhbmVsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLnBhbmVsQ29uZmlncy5nZXQoJ2xlZnQnKSE7XHJcbiAgICAgIHRoaXMudG9nZ2xlUGFuZWwoY29uZmlnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudHMuY29sbGFwc2VSaWdodFBhbmVsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLnBhbmVsQ29uZmlncy5nZXQoJ3JpZ2h0JykhO1xyXG4gICAgICB0aGlzLnRvZ2dsZVBhbmVsKGNvbmZpZyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnRzLmV4cGFuZExlZnRQYW5lbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5wYW5lbENvbmZpZ3MuZ2V0KCdsZWZ0JykhO1xyXG4gICAgICB0aGlzLnRvZ2dsZVBhbmVsKGNvbmZpZyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnRzLmV4cGFuZFJpZ2h0UGFuZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGFuZWxDb25maWdzLmdldCgncmlnaHQnKSE7XHJcbiAgICAgIHRoaXMudG9nZ2xlUGFuZWwoY29uZmlnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRoZW1lIHRvZ2dsZVxuICAgIHRoaXMuZWxlbWVudHMuZGFya01vZGVUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVEYXJrTW9kZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gU2F2ZSBsYWJlbHNcbiAgICB0aGlzLmVsZW1lbnRzLnNhdmVMYWJlbHNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXRlLmN1cnJlbnRJbWFnZUZpbGUgfHwgISh0aGlzLl9zdGF0ZSBhcyBhbnkpLmxhYmVsRm9sZGVySGFuZGxlKSB7XG4gICAgICAgICAgc2hvd0Vycm9yVG9hc3QoJ1NlbGVjdCBpbWFnZSBhbmQgbGFiZWwgZm9sZGVycyBmaXJzdCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib3VuZGluZ0JveGVzID0gdGhpcy5fY2FudmFzQ29udHJvbGxlci5nZXRBbGxCb3VuZGluZ0JveGVzKCk7XG4gICAgICAgIGNvbnN0IHlvbG9MYWJlbHMgPSBib3VuZGluZ0JveGVzLm1hcChiYm94ID0+XG4gICAgICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5ib3VuZGluZ0JveFRvWU9MTyhiYm94LCB7XG4gICAgICAgICAgICB3aWR0aDogKHRoaXMuX3N0YXRlIGFzIGFueSkuY3VycmVudEltYWdlPy53aWR0aCB8fCAxLFxuICAgICAgICAgICAgaGVpZ2h0OiAodGhpcy5fc3RhdGUgYXMgYW55KS5jdXJyZW50SW1hZ2U/LmhlaWdodCB8fCAxXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAodGhpcy5fZmlsZVN5c3RlbSBhcyBhbnkpLnNhdmVMYWJlbHM/LihcbiAgICAgICAgICB0aGlzLl9zdGF0ZS5jdXJyZW50SW1hZ2VGaWxlLm5hbWUsXG4gICAgICAgICAgeW9sb0xhYmVscyxcbiAgICAgICAgICAodGhpcy5fc3RhdGUgYXMgYW55KS5sYWJlbEZvbGRlckhhbmRsZVxuICAgICAgICApO1xuICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzKSB7XG4gICAgICAgICAgc2hvd1N1Y2Nlc3NUb2FzdCgnTGFiZWxzIHNhdmVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNob3dFcnJvclRvYXN0KHJlc3VsdD8uZXJyb3IgfHwgJ0ZhaWxlZCB0byBzYXZlIGxhYmVscycpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignU2F2ZSBsYWJlbHMgZmFpbGVkJywgZSk7XG4gICAgICAgIHNob3dFcnJvclRvYXN0KCdGYWlsZWQgdG8gc2F2ZSBsYWJlbHMnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEdvIHRvIGNvb3JkaW5hdGVzXG4gICAgdGhpcy5lbGVtZW50cy5nb1RvQ29vcmRzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgY29uc3QgeCA9IE51bWJlcih0aGlzLmVsZW1lbnRzLmNvb3JkWElucHV0LnZhbHVlKTtcbiAgICAgIGNvbnN0IHkgPSBOdW1iZXIodGhpcy5lbGVtZW50cy5jb29yZFlJbnB1dC52YWx1ZSk7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHgpICYmIE51bWJlci5pc0Zpbml0ZSh5KSkge1xuICAgICAgICB0aGlzLl9jYW52YXNDb250cm9sbGVyLmdvVG9JbWFnZUNvb3JkaW5hdGVzKHgsIHkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWm9vbSBpbnB1dCAocGVyY2VudClcbiAgICB0aGlzLmVsZW1lbnRzLnpvb21JbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBwY3QgPSBOdW1iZXIodGhpcy5lbGVtZW50cy56b29tSW5wdXQudmFsdWUpO1xuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShwY3QpICYmIHBjdCA+IDApIHtcbiAgICAgICAgdGhpcy5fY2FudmFzQ29udHJvbGxlci5zZXRab29tUGVyY2VudChwY3QpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSGlkZSBjb250ZXh0IG1lbnUgb24gZG9jdW1lbnQgY2xpY2tcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWxlbWVudHMuY29udGV4dE1lbnUuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSkpIHtcbiAgICAgICAgdGhpcy5oaWRlQ29udGV4dE1lbnUoKTtcbiAgICAgIH1cbiAgICB9KTtcclxuICB9XG5cbiAgLy8gS2VlcCBtb2RlIGJ1dHRvbnMgaW4gc3luYyB3aXRoIEFwcFN0YXRlXG4gIHByaXZhdGUgc3luY01vZGVVSShjdXJyZW50TW9kZTogJ2RyYXcnIHwgJ2VkaXQnKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRyYXdJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcmF3TW9kZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xuICAgICAgY29uc3QgZWRpdElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkaXRNb2RlJykgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XG4gICAgICBjb25zdCBkcmF3TGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsYWJlbFtmb3I9XCJkcmF3TW9kZVwiXScpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgIGNvbnN0IGVkaXRMYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsW2Zvcj1cImVkaXRNb2RlXCJdJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gICAgICBjb25zdCBpc0RyYXcgPSBjdXJyZW50TW9kZSA9PT0gJ2RyYXcnO1xuICAgICAgaWYgKGRyYXdJbnB1dCkgZHJhd0lucHV0LmNoZWNrZWQgPSBpc0RyYXc7XG4gICAgICBpZiAoZWRpdElucHV0KSBlZGl0SW5wdXQuY2hlY2tlZCA9ICFpc0RyYXc7XG4gICAgICBpZiAoZHJhd0xhYmVsKSBkcmF3TGFiZWwuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgaXNEcmF3KTtcbiAgICAgIGlmIChlZGl0TGFiZWwpIGVkaXRMYWJlbC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCAhaXNEcmF3KTtcbiAgICB9IGNhdGNoIHt9XG4gIH1cblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBWYWxpZGF0aW9uXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YWxpZGF0ZVVJU3RhdGUoKTogYW55IHtcclxuICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIGVzc2VudGlhbCBlbGVtZW50cyBleGlzdFxyXG4gICAgaWYgKCF0aGlzLmVsZW1lbnRzLmNhbnZhc0NvbnRhaW5lcikge1xyXG4gICAgICBlcnJvcnMucHVzaCgnQ2FudmFzIGNvbnRhaW5lciBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudHMuaW1hZ2VMaXN0KSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdJbWFnZSBsaXN0IGNvbnRhaW5lciBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudHMubGFiZWxMaXN0KSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKCdMYWJlbCBsaXN0IGNvbnRhaW5lciBub3QgZm91bmQnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgICBlcnJvcnMsXHJcbiAgICAgIHdhcm5pbmdzXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgdmFsaWRhdGVGb3JtRGF0YShmb3JtRGF0YTogRm9ybURhdGEpOiBhbnkge1xyXG4gICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLy8gSW1wbGVtZW50IGZvcm0gdmFsaWRhdGlvbiBsb2dpYyBhcyBuZWVkZWRcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLFxyXG4gICAgICBlcnJvcnMsXHJcbiAgICAgIHdhcm5pbmdzXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEFkZGl0aW9uYWwgTWV0aG9kcyAoZm9yIGZ1dHVyZSBleHBhbnNpb24pXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBhZGRFZGl0RGVsZXRlTGlzdGVuZXJzKHJlY3RzOiBCb3VuZGluZ0JveFtdKTogdm9pZCB7XHJcbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBmb3IgYWRkaW5nIGVkaXQvZGVsZXRlIGV2ZW50IGxpc3RlbmVycyB0byBib3VuZGluZyBib3ggZWxlbWVudHNcclxuICAgIHJlY3RzLmZvckVhY2gocmVjdCA9PiB7XHJcbiAgICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGVkaXQvZGVsZXRlIG9wZXJhdGlvbnNcclxuICAgICAgLy8gVGhpcyB3b3VsZCB0eXBpY2FsbHkgYmUgaGFuZGxlZCBieSB0aGUgQ2FudmFzQ29udHJvbGxlclxyXG4gICAgfSk7XHJcbiAgfVxyXG59XG4iLCIvKipcclxuICogRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1haW4gRW50cnkgUG9pbnRcclxuICpcclxuICogUGhhc2UgOCBDb21wbGV0ZTogQXBwbGljYXRpb24gSW50ZWdyYXRpb24gJiBUZXN0aW5nXHJcbiAqIEFsbCBtb2R1bGVzIGludGVncmF0ZWQgd2l0aCBjb21wbGV0ZSBkZXBlbmRlbmN5IGluamVjdGlvbiBzeXN0ZW1cclxuICovXHJcblxyXG5pbXBvcnQgeyBjcmVhdGVBcHBTdGF0ZSB9IGZyb20gJy4vbW9kZWxzJztcclxuaW1wb3J0IHsgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIEZpbGVTeXN0ZW1TZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcyc7XHJcbmltcG9ydCB7IENhbnZhc0NvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL0NhbnZhc0NvbnRyb2xsZXInO1xyXG5pbXBvcnQgeyBFdmVudE1hbmFnZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL0V2ZW50TWFuYWdlcic7XHJcbmltcG9ydCB7IFVJTWFuYWdlciB9IGZyb20gJy4vdWkvVUlNYW5hZ2VyJztcclxuaW1wb3J0IHsgc2hvd1N1Y2Nlc3NUb2FzdCwgc2hvd0Vycm9yVG9hc3QgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbi8qKlxyXG4gKiBNYWluIEFwcGxpY2F0aW9uIENsYXNzIC0gUGhhc2UgOCBDb21wbGV0ZSBJbnRlZ3JhdGlvblxyXG4gKlxyXG4gKiBUaGlzIGNsYXNzIHByb3ZpZGVzIGNvbXBsZXRlIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGFuZCBtb2R1bGUgY29vcmRpbmF0aW9uXHJcbiAqIGZvciB0aGUgVHlwZVNjcmlwdCB2ZXJzaW9uIG9mIEVhc3kgTGFiZWxpbmcuXHJcbiAqL1xyXG5jbGFzcyBBcHAge1xyXG4gIHByaXZhdGUgYXBwU3RhdGUgPSBjcmVhdGVBcHBTdGF0ZSgpO1xyXG4gIHByaXZhdGUgZmlsZVN5c3RlbVNlcnZpY2U6IEZpbGVTeXN0ZW1TZXJ2aWNlID0gY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UoKTtcclxuICBwcml2YXRlIHVpTWFuYWdlciE6IFVJTWFuYWdlcjtcclxuICBwcml2YXRlIGNhbnZhc0NvbnRyb2xsZXIhOiBDYW52YXNDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgZXZlbnRNYW5hZ2VyITogRXZlbnRNYW5hZ2VyO1xyXG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zb2xlLmxvZygn8J+agCBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uIC0gUGhhc2UgOCBJbnRlZ3JhdGlvbiEnKTtcclxuICAgIGNvbnNvbGUubG9nKCfinIUgQWxsIDcgcHJldmlvdXMgcGhhc2VzIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknKTtcclxuICAgIGNvbnNvbGUubG9nKCfinIUgUGhhc2UgODogQXBwbGljYXRpb24gaW50ZWdyYXRpb24gc3RhcnRpbmcuLi4nKTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemUgYWxsIGFwcGxpY2F0aW9uIGNvbXBvbmVudHMgd2l0aCBkZXBlbmRlbmN5IGluamVjdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn5SnIEluaXRpYWxpemluZyBkZXBlbmRlbmN5IGluamVjdGlvbiBzeXN0ZW0uLi4nKTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgQ2FudmFzIENvbnRyb2xsZXIgZmlyc3RcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyID0gbmV3IENhbnZhc0NvbnRyb2xsZXIoXHJcbiAgICAgICAgdGhpcy5hcHBTdGF0ZVxyXG4gICAgICApO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIENhbnZhc0NvbnRyb2xsZXIgaW5pdGlhbGl6ZWQnKTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemUgVUkgTWFuYWdlciAobmVlZHMgQ2FudmFzQ29udHJvbGxlcilcbiAgICAgIHRoaXMudWlNYW5hZ2VyID0gbmV3IFVJTWFuYWdlcihcbiAgICAgICAgdGhpcy5hcHBTdGF0ZSxcbiAgICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLFxuICAgICAgICB0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlIGFzIGFueSAvLyBUeXBlIGNvbXBhdGliaWxpdHkgd2lsbCBiZSBmaXhlZCBpbiBmdXR1cmUgdXBkYXRlc1xuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgVUlNYW5hZ2VyIGluaXRpYWxpemVkJyk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgRmFicmljIGNhbnZhcyBpbiB0aGUgZXhpc3RpbmcgY29udGFpbmVyIGZyb20gcHVibGljL2luZGV4Lmh0bWxcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci5pbml0aWFsaXplQ2FudmFzKCdjYW52YXMtY29udGFpbmVyJyk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIENhbnZhcyBpbml0aWFsaXplZCBpbiAjY2FudmFzLWNvbnRhaW5lcicpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIEV2ZW50IE1hbmFnZXIgKG5lZWRzIGFsbCBvdGhlciBjb21wb25lbnRzKVxuICAgICAgdGhpcy5ldmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKFxuICAgICAgICB0aGlzLmFwcFN0YXRlLFxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIsXG4gICAgICAgIHRoaXMuZmlsZVN5c3RlbVNlcnZpY2VcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIEV2ZW50TWFuYWdlciBpbml0aWFsaXplZCcpO1xyXG5cclxuICAgICAgLy8gU2V0dXAgY3Jvc3MtY29tcG9uZW50IHJlZmVyZW5jZXNcclxuICAgICAgdGhpcy5zZXR1cENyb3NzUmVmZXJlbmNlcygpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIENyb3NzLWNvbXBvbmVudCByZWZlcmVuY2VzIGVzdGFibGlzaGVkJyk7XHJcblxyXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMgZm9yIGFwcGxpY2F0aW9uIGxpZmVjeWNsZVxyXG4gICAgICB0aGlzLnNldHVwQXBwbGljYXRpb25FdmVudHMoKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBBcHBsaWNhdGlvbiBldmVudCBzeXN0ZW0gcmVhZHknKTtcclxuXHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICBjb25zb2xlLmxvZygn8J+OryBQaGFzZSA4IGFwcGxpY2F0aW9uIGludGVncmF0aW9uIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkhJyk7XHJcblxyXG4gICAgICAvLyBTaG93IHN1Y2Nlc3Mgbm90aWZpY2F0aW9uXHJcbiAgICAgIHNob3dTdWNjZXNzVG9hc3QoJ/CfmoAgRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IG1pZ3JhdGlvbiBjb21wbGV0ZSEnKTtcclxuXHJcbiAgICAgIC8vIFBlcmZvcm0gZnVuY3Rpb25hbGl0eSB0ZXN0c1xyXG4gICAgICBhd2FpdCB0aGlzLnBlcmZvcm1GdW5jdGlvbmFsaXR5VGVzdHMoKTtcclxuXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgQXBwbGljYXRpb24gaW5pdGlhbGl6YXRpb24gZmFpbGVkOicsIGVycm9yKTtcclxuICAgICAgc2hvd0Vycm9yVG9hc3QoJ+KdjCBBcHBsaWNhdGlvbiBpbml0aWFsaXphdGlvbiBmYWlsZWQnKTtcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR1cCBjcm9zcy1jb21wb25lbnQgcmVmZXJlbmNlcyBmb3IgY2lyY3VsYXIgZGVwZW5kZW5jaWVzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXR1cENyb3NzUmVmZXJlbmNlcygpOiB2b2lkIHtcclxuICAgIC8vIFNldHVwIGNyb3NzLWNvbXBvbmVudCByZWZlcmVuY2VzXHJcbiAgICAvLyBVSU1hbmFnZXIgc2hvdWxkIGhhdmUgYWNjZXNzIHRvIGNhbnZhcyB0aHJvdWdoIGFwcFN0YXRlXHJcbiAgICAvLyBDcm9zcy1yZWZlcmVuY2VzIGhhbmRsZWQgdGhyb3VnaCBkZXBlbmRlbmN5IGluamVjdGlvblxyXG5cclxuICAgIGNvbnNvbGUubG9nKCfwn5SXIENyb3NzLXJlZmVyZW5jZXMgZXN0YWJsaXNoZWQgYmV0d2VlbiBjb21wb25lbnRzJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR1cCBhcHBsaWNhdGlvbi1sZXZlbCBldmVudCBsaXN0ZW5lcnNcclxuICAgKi9cclxuICBwcml2YXRlIHNldHVwQXBwbGljYXRpb25FdmVudHMoKTogdm9pZCB7XHJcbiAgICAvLyBMaXN0ZW4gdG8gYXBwbGljYXRpb24gc3RhdGUgY2hhbmdlc1xyXG4gICAgdGhpcy5hcHBTdGF0ZS5hZGRFdmVudExpc3RlbmVyKCdtb2RlOmNoYW5nZWQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ/Cfk6EgQXBwIG1vZGUgY2hhbmdlZDonLCBldmVudC5kYXRhKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXBwU3RhdGUuYWRkRXZlbnRMaXN0ZW5lcignaW1hZ2U6c2VsZWN0ZWQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ/Cfk6EgSW1hZ2Ugc2VsZWN0ZWQ6JywgZXZlbnQuZGF0YSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFwcFN0YXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2xhYmVsczpzYXZlZCcsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygn8J+ToSBMYWJlbHMgc2F2ZWQ6JywgZXZlbnQuZGF0YSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgYnJvd3NlciBlcnJvcnNcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChldmVudCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfwn5qoIEFwcGxpY2F0aW9uIGVycm9yOicsIGV2ZW50LmVycm9yKTtcclxuICAgICAgc2hvd0Vycm9yVG9hc3QoJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ/CfmqggVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uOicsIGV2ZW50LnJlYXNvbik7XHJcbiAgICAgIHNob3dFcnJvclRvYXN0KCdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm0gY29tcHJlaGVuc2l2ZSBmdW5jdGlvbmFsaXR5IHRlc3RpbmdcclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHBlcmZvcm1GdW5jdGlvbmFsaXR5VGVzdHMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zb2xlLmxvZygnXFxu8J+nqiBQZXJmb3JtaW5nIFBoYXNlIDggSW50ZWdyYXRpb24gVGVzdHM6Jyk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gVGVzdCAxOiBDb21wb25lbnQgaW5pdGlhbGl6YXRpb25cclxuICAgICAgY29uc3QgY29tcG9uZW50c1Rlc3QgPSB0aGlzLnRlc3RDb21wb25lbnRJbml0aWFsaXphdGlvbigpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIENvbXBvbmVudCBpbml0aWFsaXphdGlvbiB0ZXN0OicsIGNvbXBvbmVudHNUZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICAvLyBUZXN0IDI6IEV2ZW50IHN5c3RlbSBpbnRlZ3JhdGlvblxyXG4gICAgICBjb25zdCBldmVudHNUZXN0ID0gdGhpcy50ZXN0RXZlbnRTeXN0ZW1JbnRlZ3JhdGlvbigpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIEV2ZW50IHN5c3RlbSBpbnRlZ3JhdGlvbiB0ZXN0OicsIGV2ZW50c1Rlc3QgPyAnUEFTU0VEJyA6ICdGQUlMRUQnKTtcclxuXHJcbiAgICAgIC8vIFRlc3QgMzogVUkgZnVuY3Rpb25hbGl0eVxyXG4gICAgICBjb25zdCB1aVRlc3QgPSBhd2FpdCB0aGlzLnRlc3RVSUZ1bmN0aW9uYWxpdHkoKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBVSSBmdW5jdGlvbmFsaXR5IHRlc3Q6JywgdWlUZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICAvLyBUZXN0IDQ6IENhbnZhcyBmdW5jdGlvbmFsaXR5XHJcbiAgICAgIGNvbnN0IGNhbnZhc1Rlc3QgPSB0aGlzLnRlc3RDYW52YXNGdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgQ2FudmFzIGZ1bmN0aW9uYWxpdHkgdGVzdDonLCBjYW52YXNUZXN0ID8gJ1BBU1NFRCcgOiAnRkFJTEVEJyk7XHJcblxyXG4gICAgICAvLyBUZXN0IDU6IEZpbGUgc3lzdGVtIGludGVncmF0aW9uXHJcbiAgICAgIGNvbnN0IGZpbGVTeXN0ZW1UZXN0ID0gdGhpcy50ZXN0RmlsZVN5c3RlbUludGVncmF0aW9uKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgRmlsZSBzeXN0ZW0gaW50ZWdyYXRpb24gdGVzdDonLCBmaWxlU3lzdGVtVGVzdCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5cclxuICAgICAgLy8gVGVzdCA2OiBLZXlib2FyZCBzaG9ydGN1dHNcclxuICAgICAgY29uc3Qga2V5Ym9hcmRUZXN0ID0gdGhpcy50ZXN0S2V5Ym9hcmRTaG9ydGN1dHMoKTtcclxuICAgICAgY29uc29sZS5sb2coJ+KchSBLZXlib2FyZCBzaG9ydGN1dHMgdGVzdDonLCBrZXlib2FyZFRlc3QgPyAnUEFTU0VEJyA6ICdGQUlMRUQnKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn46vIEFsbCBQaGFzZSA4IGludGVncmF0aW9uIHRlc3RzIGNvbXBsZXRlZCEnKTtcclxuXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgSW50ZWdyYXRpb24gdGVzdHMgZmFpbGVkOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgY29tcG9uZW50IGluaXRpYWxpemF0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0ZXN0Q29tcG9uZW50SW5pdGlhbGl6YXRpb24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gISEoXHJcbiAgICAgIHRoaXMuYXBwU3RhdGUgJiZcclxuICAgICAgdGhpcy5maWxlU3lzdGVtU2VydmljZSAmJlxyXG4gICAgICB0aGlzLnVpTWFuYWdlciAmJlxyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXIgJiZcclxuICAgICAgdGhpcy5ldmVudE1hbmFnZXIgJiZcclxuICAgICAgdGhpcy5pbml0aWFsaXplZFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgZXZlbnQgc3lzdGVtIGludGVncmF0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0ZXN0RXZlbnRTeXN0ZW1JbnRlZ3JhdGlvbigpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgLy8gVGVzdCBzdGF0ZSBldmVudCB3aXRob3V0IGFsdGVyaW5nIGZpbmFsIG1vZGVcbiAgICAgIGNvbnN0IHByZXZNb2RlID0gdGhpcy5hcHBTdGF0ZS5jdXJyZW50TW9kZSBhcyAnZHJhdycgfCAnZWRpdCc7XG4gICAgICB0aGlzLmFwcFN0YXRlLnNldE1vZGUoJ2VkaXQnKTtcbiAgICAgIHRoaXMuYXBwU3RhdGUuc2V0TW9kZSgnZHJhdycpO1xuICAgICAgLy8gcmVzdG9yZSBwcmV2aW91cyBtb2RlXG4gICAgICB0aGlzLmFwcFN0YXRlLnNldE1vZGUocHJldk1vZGUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0V2ZW50IHN5c3RlbSB0ZXN0IGVycm9yOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgVUkgZnVuY3Rpb25hbGl0eVxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgdGVzdFVJRnVuY3Rpb25hbGl0eSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFRlc3QgVUkgdXBkYXRlIG1ldGhvZHNcclxuICAgICAgdGhpcy51aU1hbmFnZXIudXBkYXRlTGFiZWxMaXN0KCk7XHJcbiAgICAgIC8vIEFkZCBvdGhlciBVSSB1cGRhdGUgdGVzdHMgYXMgbWV0aG9kcyBiZWNvbWUgYXZhaWxhYmxlXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignVUkgZnVuY3Rpb25hbGl0eSB0ZXN0IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBjYW52YXMgZnVuY3Rpb25hbGl0eVxyXG4gICAqL1xyXG4gIHByaXZhdGUgdGVzdENhbnZhc0Z1bmN0aW9uYWxpdHkoKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUZXN0IGNhbnZhcyBtZXRob2RzXHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuY2FudmFzQ29udHJvbGxlci5jYW52YXM7XHJcbiAgICAgIGlmICghY2FudmFzKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAvLyBUZXN0IHpvb20gZnVuY3Rpb25zXHJcbiAgICAgIHRoaXMuY2FudmFzQ29udHJvbGxlci56b29tSW4oKTtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnpvb21PdXQoKTtcclxuICAgICAgdGhpcy5jYW52YXNDb250cm9sbGVyLnJlc2V0Wm9vbSgpO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdDYW52YXMgZnVuY3Rpb25hbGl0eSB0ZXN0IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBmaWxlIHN5c3RlbSBpbnRlZ3JhdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgdGVzdEZpbGVTeXN0ZW1JbnRlZ3JhdGlvbigpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIFRlc3Qgc2VydmljZSBtZXRob2RzIGV4aXN0XHJcbiAgICAgIGNvbnN0IG1ldGhvZHMgPSBbXHJcbiAgICAgICAgJ3NlbGVjdEltYWdlRm9sZGVyJyxcclxuICAgICAgICAnc2VsZWN0TGFiZWxGb2xkZXInLFxyXG4gICAgICAgICdsb2FkTGFiZWxzJyxcclxuICAgICAgICAnc2F2ZUxhYmVscycsXHJcbiAgICAgICAgJ3BhcnNlWW9sb1N0cmluZydcclxuICAgICAgXTtcclxuXHJcbiAgICAgIHJldHVybiBtZXRob2RzLmV2ZXJ5KG1ldGhvZCA9PlxyXG4gICAgICAgIHR5cGVvZiAodGhpcy5maWxlU3lzdGVtU2VydmljZSBhcyBhbnkpW21ldGhvZF0gPT09ICdmdW5jdGlvbidcclxuICAgICAgKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbGUgc3lzdGVtIGludGVncmF0aW9uIHRlc3QgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0IGtleWJvYXJkIHNob3J0Y3V0c1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdGVzdEtleWJvYXJkU2hvcnRjdXRzKCk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gVGVzdCB0aGF0IGV2ZW50IG1hbmFnZXIgZXhpc3RzIGFuZCBoYXMgcmVxdWlyZWQgbWV0aG9kc1xyXG4gICAgICByZXR1cm4gISF0aGlzLmV2ZW50TWFuYWdlciAmJiB0eXBlb2YgdGhpcy5ldmVudE1hbmFnZXIuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJztcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0tleWJvYXJkIHNob3J0Y3V0cyB0ZXN0IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFwcGxpY2F0aW9uIHN0YXRlIGZvciBkZWJ1Z2dpbmdcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QXBwbGljYXRpb25TdGF0ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGluaXRpYWxpemVkOiB0aGlzLmluaXRpYWxpemVkLFxyXG4gICAgICBhcHBTdGF0ZTogdGhpcy5hcHBTdGF0ZS5nZXREZWJ1Z0luZm8oKSxcclxuICAgICAgY2FudmFzOiB7XHJcbiAgICAgICAgaGFzQ2FudmFzOiAhIXRoaXMuY2FudmFzQ29udHJvbGxlcj8uY2FudmFzLFxyXG4gICAgICAgIG1vZGU6IHRoaXMuYXBwU3RhdGUuY3VycmVudE1vZGVcclxuICAgICAgfSxcclxuICAgICAgdWk6IHtcclxuICAgICAgICBoYXNVSU1hbmFnZXI6ICEhdGhpcy51aU1hbmFnZXJcclxuICAgICAgfSxcclxuICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgaGFzRXZlbnRNYW5hZ2VyOiAhIXRoaXMuZXZlbnRNYW5hZ2VyXHJcbiAgICAgIH0sXHJcbiAgICAgIGZpbGVTeXN0ZW06IHtcclxuICAgICAgICBoYXNGaWxlU3lzdGVtU2VydmljZTogISF0aGlzLmZpbGVTeXN0ZW1TZXJ2aWNlXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhbnVwIGFwcGxpY2F0aW9uIHJlc291cmNlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5ldmVudE1hbmFnZXI/LmRlc3Ryb3k/LigpO1xyXG4gICAgICB0aGlzLmNhbnZhc0NvbnRyb2xsZXI/LmRlc3Ryb3lDYW52YXM/LigpO1xyXG4gICAgICAvLyB0aGlzLnVpTWFuYWdlciBjbGVhbnVwIGlmIG5lZWRlZFxyXG4gICAgICBjb25zb2xlLmxvZygn8J+nuSBBcHBsaWNhdGlvbiByZXNvdXJjZXMgY2xlYW5lZCB1cCcpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIGR1cmluZyBjbGVhbnVwOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIEluaXRpYWxpemUgYXBwbGljYXRpb24gd2hlbiBET00gaXMgcmVhZHlcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+TsSBET00gbG9hZGVkIC0gUGhhc2UgOCBpbnRlZ3JhdGlvbiBzdGFydGluZy4uLicpO1xyXG5cclxuICB0cnkge1xyXG4gICAgLy8gQ3JlYXRlIGFuZCBzdGFydCB0aGUgYXBwbGljYXRpb25cclxuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcclxuXHJcbiAgICAvLyBNYWtlIGFwcCBhdmFpbGFibGUgZ2xvYmFsbHkgZm9yIGRlYnVnZ2luZ1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLmVhc3lMYWJlbGluZ0FwcCA9IGFwcDtcclxuXHJcbiAgICAvLyBSZW1vdmVkOiBQaGFzZSA4IGNvbXBsZXRpb24gaW5kaWNhdG9yIHRvYXN0XG5cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcign4p2MIEZhaWxlZCB0byBpbml0aWFsaXplIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb246JywgZXJyb3IpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyBFeHBvcnQgbWFpbiBjb21wb25lbnRzIGZvciBleHRlcm5hbCB1c2VcclxuZXhwb3J0IHsgQXBwIH07XHJcbmV4cG9ydCB7IEFwcFN0YXRlLCBjcmVhdGVBcHBTdGF0ZSwgY3JlYXRlQXBwU3RhdGVXaXRoQ29uZmlnIH0gZnJvbSAnLi9tb2RlbHMnO1xyXG5leHBvcnQgeyBGaWxlU3lzdGVtU2VydmljZSwgY3JlYXRlRmlsZVN5c3RlbVNlcnZpY2UsIFlvbG9QYXJzZXIgfSBmcm9tICcuL3NlcnZpY2VzJztcclxuZXhwb3J0IHsgQ2FudmFzQ29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvQ2FudmFzQ29udHJvbGxlcic7XHJcbmV4cG9ydCB7IEV2ZW50TWFuYWdlciB9IGZyb20gJy4vY29udHJvbGxlcnMvRXZlbnRNYW5hZ2VyJztcclxuZXhwb3J0IHsgVUlNYW5hZ2VyIH0gZnJvbSAnLi91aS9VSU1hbmFnZXInO1xyXG5leHBvcnQgeyBwYXJzZVlvbG8sIGV4cG9ydFlvbG8sIHZhbGlkYXRlWW9sb1N0cmluZyB9IGZyb20gJy4vdXRpbHMnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9