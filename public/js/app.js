/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/models/AppState.ts":
/*!********************************!*\
  !*** ./src/models/AppState.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppState: () => (/* binding */ AppState),
/* harmony export */   createAppState: () => (/* binding */ createAppState),
/* harmony export */   createAppStateWithConfig: () => (/* binding */ createAppStateWithConfig),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AppState);


/***/ }),

/***/ "./src/models/index.ts":
/*!*****************************!*\
  !*** ./src/models/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppState: () => (/* reexport safe */ _AppState__WEBPACK_IMPORTED_MODULE_0__.AppState),
/* harmony export */   createAppState: () => (/* reexport safe */ _AppState__WEBPACK_IMPORTED_MODULE_0__.createAppState),
/* harmony export */   createAppStateWithConfig: () => (/* reexport safe */ _AppState__WEBPACK_IMPORTED_MODULE_0__.createAppStateWithConfig)
/* harmony export */ });
/* harmony import */ var _AppState__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AppState */ "./src/models/AppState.ts");
/**
 * Models Module Index
 *
 * Central export point for all model classes used throughout the Easy Labeling application.
 * This module provides clean API access to data models and state management.
 */
// Export AppState model



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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppState: () => (/* reexport safe */ _models__WEBPACK_IMPORTED_MODULE_0__.AppState),
/* harmony export */   createAppState: () => (/* reexport safe */ _models__WEBPACK_IMPORTED_MODULE_0__.createAppState),
/* harmony export */   createAppStateWithConfig: () => (/* reexport safe */ _models__WEBPACK_IMPORTED_MODULE_0__.createAppStateWithConfig)
/* harmony export */ });
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./models */ "./src/models/index.ts");
/**
 * Easy Labeling TypeScript Main Entry Point
 *
 * This is the main entry point for the TypeScript version of Easy Labeling.
 * Phase 4 Complete: AppState model has been successfully implemented with full type safety.
 */

// Phase Progress Report
console.log('🚀 Easy Labeling TypeScript Migration - Phase 4 Complete!');
console.log('✅ TypeScript compilation working');
console.log('✅ Webpack bundling working');
console.log('✅ AppState model implemented with type safety');
console.log('✅ Event system and validation added');
console.log('📅 Phase 4 completed:', new Date().toISOString());
// Test Phase 4: AppState Model
console.log('\n🧪 Testing Phase 4 AppState Implementation:');
// Create AppState instance
const appState = (0,_models__WEBPACK_IMPORTED_MODULE_0__.createAppState)();
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
// DOM ready test
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded - ready for Phase 5 implementation');
    // Create Phase 4 completion indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #17a2b8;
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
    <div>🚀 Phase 4 Complete</div>
    <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">AppState Model Ready</div>
  `;
    document.body.appendChild(indicator);
    // Auto-remove after 8 seconds
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s ease';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 500);
    }, 8000);
});
// Export Phase 4 components


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLEdBQUcsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO0FBRWpFLGlCQUFpQjtBQUNqQixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0RBQWtELENBQUMsQ0FBQztJQUVoRSxzQ0FBc0M7SUFDdEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRzs7Ozs7Ozs7Ozs7Ozs7R0FjekIsQ0FBQztJQUNGLFNBQVMsQ0FBQyxTQUFTLEdBQUc7OztHQUdyQixDQUFDO0lBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFckMsOEJBQThCO0lBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQztRQUNqRCxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDOUIsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQztBQUVILDRCQUE0QjtBQUNrRCIsInNvdXJjZXMiOlsid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbW9kZWxzL0FwcFN0YXRlLnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbW9kZWxzL2luZGV4LnRzIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEFwcFN0YXRlIE1vZGVsIC0gTWFpbiBBcHBsaWNhdGlvbiBTdGF0ZSBNYW5hZ2VtZW50XHJcbiAqIFxyXG4gKiBDZW50cmFsaXplZCBzdGF0ZSBtYW5hZ2VtZW50IGZvciB0aGUgRWFzeSBMYWJlbGluZyBhcHBsaWNhdGlvbi5cclxuICogSGFuZGxlcyBhbGwgYXBwbGljYXRpb24gc3RhdGUgaW5jbHVkaW5nIGZpbGVzLCBVSSBzZXR0aW5ncywgY2FjaGUsIGFuZCBjdXJyZW50IHdvcmtzcGFjZS5cclxuICogXHJcbiAqIEB2ZXJzaW9uIDEuMC4wXHJcbiAqIEBhdXRob3IgRWFzeSBMYWJlbGluZyBUeXBlU2NyaXB0IE1pZ3JhdGlvblxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFxyXG4gIE1vZGUsIFxyXG4gIExhYmVsU29ydE9yZGVyLCBcclxuICBQb2ludCxcclxuICBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLCBcclxuICBGaWxlU3lzdGVtRmlsZUhhbmRsZVxyXG59IGZyb20gJy4uL3R5cGVzJztcclxuXHJcbmltcG9ydCB7XHJcbiAgSUFwcFN0YXRlLFxyXG4gIEFwcFN0YXRlQ29uZmlnLFxyXG4gIEFwcFN0YXRlTWV0aG9kcyxcclxuICBBcHBTdGF0ZUV2ZW50LFxyXG4gIEFwcFN0YXRlRXZlbnRIYW5kbGVyLFxyXG4gIEltYWdlRmlsZSxcclxuICBDbGFzc0ZpbGUsXHJcbiAgQ2xhc3NEZWZpbml0aW9uLFxyXG4gIENsaXBib2FyZERhdGEsXHJcbiAgTG9hZFRva2VuLFxyXG4gIEFwcFN0YXRlVmFsaWRhdGlvbixcclxuICBTZXJpYWxpemFibGVBcHBTdGF0ZVxyXG59IGZyb20gJy4uL3R5cGVzL2FwcC1zdGF0ZSc7XHJcblxyXG4vKipcclxuICogQXBwU3RhdGUgQ2xhc3NcclxuICogXHJcbiAqIEltcGxlbWVudHMgdGhlIGNvbXBsZXRlIGFwcGxpY2F0aW9uIHN0YXRlIG1hbmFnZW1lbnQgd2l0aCB0eXBlIHNhZmV0eS5cclxuICogUHJvdmlkZXMgbWV0aG9kcyBmb3IgbWFuYWdpbmcgZmlsZXMsIFVJIHN0YXRlLCBjYWNoZSwgYW5kIHVzZXIgaW50ZXJhY3Rpb25zLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEFwcFN0YXRlIGltcGxlbWVudHMgSUFwcFN0YXRlIHtcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBIYW5kbGVzIChGaWxlIFN5c3RlbSBBY2Nlc3MgQVBJKVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaW1hZ2VGb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgbGFiZWxGb2xkZXJIYW5kbGU6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgY2xhc3NJbmZvRm9sZGVySGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBGaWxlIERhdGEgQXJyYXlzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIFxyXG4gIHB1YmxpYyBpbWFnZUZpbGVzOiBJbWFnZUZpbGVbXSA9IFtdO1xyXG4gIHB1YmxpYyBjbGFzc0ZpbGVzOiBDbGFzc0ZpbGVbXSA9IFtdO1xyXG4gIHB1YmxpYyBzZWxlY3RlZENsYXNzRmlsZTogQ2xhc3NGaWxlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBTdGF0dXMgVHJhY2tpbmcgTWFwc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgaW1hZ2VMYWJlbFN0YXR1cyA9IG5ldyBNYXA8c3RyaW5nLCBib29sZWFuPigpOyAvLyBmaWxlTmFtZSAtPiBoYXNMYWJlbHNcclxuICBwdWJsaWMgY2xhc3NOYW1lcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7IC8vIGNsYXNzSWQgLT4gY2xhc3NOYW1lXHJcbiAgcHVibGljIHByZXZpZXdJbWFnZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTsgLy8gZmlsZU5hbWUgLT4gb2JqZWN0VVJMXHJcbiAgcHVibGljIGNvbGxhcHNlZExhYmVsR3JvdXBzID0gbmV3IFNldDxzdHJpbmc+KCk7IC8vIGNvbGxhcHNlZCBncm91cCBJRHNcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEN1cnJlbnQgV29ya2luZyBTdGF0ZVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgY3VycmVudEltYWdlRmlsZTogSW1hZ2VGaWxlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGN1cnJlbnRJbWFnZTogSFRNTEltYWdlRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBjdXJyZW50TW9kZTogTW9kZSA9ICdlZGl0JztcclxuICBwdWJsaWMgY3VycmVudExvYWRUb2tlbjogTG9hZFRva2VuID0gMDtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFVJIFNldHRpbmdzICYgUHJlZmVyZW5jZXNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHVibGljIGlzQXV0b1NhdmVFbmFibGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIHNob3dMYWJlbHNPbkNhbnZhczogYm9vbGVhbiA9IHRydWU7XHJcbiAgcHVibGljIGxhYmVsRm9udFNpemU6IG51bWJlciA9IDE0O1xyXG4gIHB1YmxpYyBsYWJlbFNvcnRPcmRlcjogTGFiZWxTb3J0T3JkZXIgPSAnYXNjJztcclxuICBwdWJsaWMgaXNQcmV2aWV3QmFySGlkZGVuOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzQ3Jvc3NoYWlyVmlzaWJsZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW50ZXJuYWwgU3RhdGUgJiBUZW1wb3JhcnkgRGF0YVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBcclxuICBwdWJsaWMgc2F2ZVRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIF9jbGlwYm9hcmQ6IENsaXBib2FyZERhdGEgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgbGFzdE1vdXNlUG9zaXRpb246IFBvaW50ID0geyB4OiAwLCB5OiAwIH07XHJcbiAgcHVibGljIGNvbnRleHRUYXJnZXQ6IGFueSA9IG51bGw7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBFdmVudCBTeXN0ZW1cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgXHJcbiAgcHJpdmF0ZSBldmVudExpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBBcHBTdGF0ZUV2ZW50SGFuZGxlcltdPigpO1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciAtIEluaXRpYWxpemUgQXBwU3RhdGUgd2l0aCBkZWZhdWx0IHZhbHVlc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgLy8gQWxsIHByb3BlcnRpZXMgYXJlIGFscmVhZHkgaW5pdGlhbGl6ZWQgYWJvdmVcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzdGF0ZTppbml0aWFsaXplZCcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU3RhdGUgTWFuYWdlbWVudCBNZXRob2RzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCBhbGwgc3RhdGUgdG8gaW5pdGlhbCB2YWx1ZXNcclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAvLyBDbGVhciBmaWxlIGhhbmRsZXNcclxuICAgIHRoaXMuaW1hZ2VGb2xkZXJIYW5kbGUgPSBudWxsO1xyXG4gICAgdGhpcy5sYWJlbEZvbGRlckhhbmRsZSA9IG51bGw7XHJcbiAgICB0aGlzLmNsYXNzSW5mb0ZvbGRlckhhbmRsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2xlYXIgZmlsZSBhcnJheXNcclxuICAgIHRoaXMuaW1hZ2VGaWxlcyA9IFtdO1xyXG4gICAgdGhpcy5jbGFzc0ZpbGVzID0gW107XHJcbiAgICB0aGlzLnNlbGVjdGVkQ2xhc3NGaWxlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDbGVhciBtYXBzIGFuZCBzZXRzXHJcbiAgICB0aGlzLmltYWdlTGFiZWxTdGF0dXMuY2xlYXIoKTtcclxuICAgIHRoaXMuY2xhc3NOYW1lcy5jbGVhcigpO1xyXG4gICAgdGhpcy5jb2xsYXBzZWRMYWJlbEdyb3Vwcy5jbGVhcigpO1xyXG4gICAgdGhpcy5jbGVhclByZXZpZXdDYWNoZSgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3VycmVudEltYWdlRmlsZSA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZSA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnRNb2RlID0gJ2VkaXQnO1xyXG4gICAgdGhpcy5jdXJyZW50TG9hZFRva2VuID0gMDtcclxuXHJcbiAgICAvLyBSZXNldCBVSSBzZXR0aW5ncyB0byBkZWZhdWx0c1xyXG4gICAgdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zaG93TGFiZWxzT25DYW52YXMgPSB0cnVlO1xyXG4gICAgdGhpcy5sYWJlbEZvbnRTaXplID0gMTQ7XHJcbiAgICB0aGlzLmxhYmVsU29ydE9yZGVyID0gJ2FzYyc7XHJcbiAgICB0aGlzLmlzUHJldmlld0JhckhpZGRlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBDbGVhciBpbnRlcm5hbCBzdGF0ZVxyXG4gICAgaWYgKHRoaXMuc2F2ZVRpbWVvdXQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2F2ZVRpbWVvdXQpO1xyXG4gICAgICB0aGlzLnNhdmVUaW1lb3V0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIHRoaXMuX2NsaXBib2FyZCA9IG51bGw7XHJcbiAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XHJcbiAgICB0aGlzLmNvbnRleHRUYXJnZXQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzdGF0ZTpyZXNldCcsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlsZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGltYWdlIGZvbGRlciBoYW5kbGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SW1hZ2VGb2xkZXIoaGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogdm9pZCB7XHJcbiAgICB0aGlzLmltYWdlRm9sZGVySGFuZGxlID0gaGFuZGxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ZvbGRlcjppbWFnZS1zZXQnLFxyXG4gICAgICBkYXRhOiB7IG5hbWU6IGhhbmRsZS5uYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGxhYmVsIGZvbGRlciBoYW5kbGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGFiZWxGb2xkZXIoaGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsRm9sZGVySGFuZGxlID0gaGFuZGxlO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2ZvbGRlcjpsYWJlbC1zZXQnLFxyXG4gICAgICBkYXRhOiB7IG5hbWU6IGhhbmRsZS5uYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGNsYXNzIGluZm8gZm9sZGVyIGhhbmRsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDbGFzc0luZm9Gb2xkZXIoaGFuZGxlOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsYXNzSW5mb0ZvbGRlckhhbmRsZSA9IGhhbmRsZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdmb2xkZXI6Y2xhc3MtaW5mby1zZXQnLFxyXG4gICAgICBkYXRhOiB7IG5hbWU6IGhhbmRsZS5uYW1lIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gSW1hZ2UgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgaW1hZ2VcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q3VycmVudEltYWdlKGltYWdlRmlsZTogSW1hZ2VGaWxlIHwgbnVsbCk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJldmlvdXNJbWFnZSA9IHRoaXMuY3VycmVudEltYWdlRmlsZTtcclxuICAgIHRoaXMuY3VycmVudEltYWdlRmlsZSA9IGltYWdlRmlsZTtcclxuICAgIFxyXG4gICAgLy8gSW5jcmVtZW50IGxvYWQgdG9rZW4gdG8gcHJldmVudCByYWNlIGNvbmRpdGlvbnNcclxuICAgIHRoaXMuY3VycmVudExvYWRUb2tlbiArPSAxO1xyXG5cclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdpbWFnZTpjdXJyZW50LWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IFxyXG4gICAgICAgIHByZXZpb3VzOiBwcmV2aW91c0ltYWdlPy5uYW1lIHx8IG51bGwsXHJcbiAgICAgICAgY3VycmVudDogaW1hZ2VGaWxlPy5uYW1lIHx8IG51bGwsXHJcbiAgICAgICAgbG9hZFRva2VuOiB0aGlzLmN1cnJlbnRMb2FkVG9rZW5cclxuICAgICAgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBsYWJlbCBzdGF0dXMgZm9yIGFuIGltYWdlXHJcbiAgICovXHJcbiAgcHVibGljIGdldEltYWdlTGFiZWxTdGF0dXMoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaW1hZ2VMYWJlbFN0YXR1cy5nZXQoZmlsZU5hbWUpIHx8IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGxhYmVsIHN0YXR1cyBmb3IgYW4gaW1hZ2VcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SW1hZ2VMYWJlbFN0YXR1cyhmaWxlTmFtZTogc3RyaW5nLCBoYXNMYWJlbHM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuaW1hZ2VMYWJlbFN0YXR1cy5zZXQoZmlsZU5hbWUsIGhhc0xhYmVscyk7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnaW1hZ2U6bGFiZWwtc3RhdHVzLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IGZpbGVOYW1lLCBoYXNMYWJlbHMgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBNb2RlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY3VycmVudCBkcmF3aW5nL2VkaXRpbmcgbW9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRNb2RlKG1vZGU6IE1vZGUpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByZXZpb3VzTW9kZSA9IHRoaXMuY3VycmVudE1vZGU7XHJcbiAgICB0aGlzLmN1cnJlbnRNb2RlID0gbW9kZTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdtb2RlOmNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IHByZXZpb3VzOiBwcmV2aW91c01vZGUsIGN1cnJlbnQ6IG1vZGUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBiZXR3ZWVuIGRyYXcgYW5kIGVkaXQgbW9kZXNcclxuICAgKi9cclxuICBwdWJsaWMgdG9nZ2xlTW9kZSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld01vZGU6IE1vZGUgPSB0aGlzLmN1cnJlbnRNb2RlID09PSAnZWRpdCcgPyAnZHJhdycgOiAnZWRpdCc7XHJcbiAgICB0aGlzLnNldE1vZGUobmV3TW9kZSk7XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ2xhc3MgT3BlcmF0aW9uc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VsZWN0IGEgY2xhc3MgZmlsZSBmb3IgdXNlXHJcbiAgICovXHJcbiAgcHVibGljIHNlbGVjdENsYXNzRmlsZShjbGFzc0ZpbGU6IENsYXNzRmlsZSB8IG51bGwpOiB2b2lkIHtcclxuICAgIHRoaXMuc2VsZWN0ZWRDbGFzc0ZpbGUgPSBjbGFzc0ZpbGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xhc3M6ZmlsZS1zZWxlY3RlZCcsXHJcbiAgICAgIGRhdGE6IHsgZmlsZU5hbWU6IGNsYXNzRmlsZT8ubmFtZSB8fCBudWxsIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBjbGFzcyBkZWZpbml0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIGFkZENsYXNzRGVmaW5pdGlvbihjbGFzc0RlZjogQ2xhc3NEZWZpbml0aW9uKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsYXNzTmFtZXMuc2V0KGNsYXNzRGVmLmlkLnRvU3RyaW5nKCksIGNsYXNzRGVmLm5hbWUpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsYXNzOmRlZmluaXRpb24tYWRkZWQnLFxyXG4gICAgICBkYXRhOiBjbGFzc0RlZixcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhIGNsYXNzIGRlZmluaXRpb25cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlQ2xhc3NEZWZpbml0aW9uKGNsYXNzSWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5jbGFzc05hbWVzLmRlbGV0ZShjbGFzc0lkLnRvU3RyaW5nKCkpO1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ2NsYXNzOmRlZmluaXRpb24tcmVtb3ZlZCcsXHJcbiAgICAgIGRhdGE6IHsgY2xhc3NJZCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFNldHRpbmdzIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBhdXRvLXNhdmUgZnVuY3Rpb25hbGl0eVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRBdXRvU2F2ZShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzQXV0b1NhdmVFbmFibGVkID0gZW5hYmxlZDtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdzZXR0aW5nczphdXRvLXNhdmUtY2hhbmdlZCcsXHJcbiAgICAgIGRhdGE6IHsgZW5hYmxlZCB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlIGxhYmVsIHZpc2liaWxpdHkgb24gY2FudmFzXHJcbiAgICovXHJcbiAgcHVibGljIHNldFNob3dMYWJlbHMoc2hvdzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5zaG93TGFiZWxzT25DYW52YXMgPSBzaG93O1xyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KHtcclxuICAgICAgdHlwZTogJ3NldHRpbmdzOnNob3ctbGFiZWxzLWNoYW5nZWQnLFxyXG4gICAgICBkYXRhOiB7IHNob3cgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBsYWJlbCBmb250IHNpemVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGFiZWxGb250U2l6ZShzaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmIChzaXplID49IDggJiYgc2l6ZSA8PSA0OCkge1xyXG4gICAgICB0aGlzLmxhYmVsRm9udFNpemUgPSBzaXplO1xyXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGU6ICdzZXR0aW5nczpmb250LXNpemUtY2hhbmdlZCcsXHJcbiAgICAgICAgZGF0YTogeyBzaXplIH0sXHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGxhYmVsIHNvcnQgb3JkZXJcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGFiZWxTb3J0T3JkZXIob3JkZXI6IExhYmVsU29ydE9yZGVyKTogdm9pZCB7XHJcbiAgICB0aGlzLmxhYmVsU29ydE9yZGVyID0gb3JkZXI7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc2V0dGluZ3M6c29ydC1vcmRlci1jaGFuZ2VkJyxcclxuICAgICAgZGF0YTogeyBvcmRlciB9LFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFVJIFN0YXRlIE9wZXJhdGlvbnNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZSBwcmV2aWV3IGJhciB2aXNpYmlsaXR5XHJcbiAgICovXHJcbiAgcHVibGljIHRvZ2dsZVByZXZpZXdCYXIoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzUHJldmlld0JhckhpZGRlbiA9ICF0aGlzLmlzUHJldmlld0JhckhpZGRlbjtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICd1aTpwcmV2aWV3LWJhci10b2dnbGVkJyxcclxuICAgICAgZGF0YTogeyBoaWRkZW46IHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUb2dnbGUgY3Jvc3NoYWlyIHZpc2liaWxpdHlcclxuICAgKi9cclxuICBwdWJsaWMgdG9nZ2xlQ3Jvc3NoYWlyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0Nyb3NzaGFpclZpc2libGUgPSAhdGhpcy5pc0Nyb3NzaGFpclZpc2libGU7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAndWk6Y3Jvc3NoYWlyLXRvZ2dsZWQnLFxyXG4gICAgICBkYXRhOiB7IHZpc2libGU6IHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlIH0sXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgY29udGV4dCBtZW51IHRhcmdldFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDb250ZXh0VGFyZ2V0KHRhcmdldDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbnRleHRUYXJnZXQgPSB0YXJnZXQ7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAndWk6Y29udGV4dC10YXJnZXQtc2V0JyxcclxuICAgICAgZGF0YTogeyB0YXJnZXQgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBDYWNoZSBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBDYWNoZSBhIHByZXZpZXcgaW1hZ2UgT2JqZWN0VVJMXHJcbiAgICovXHJcbiAgcHVibGljIGNhY2hlUHJldmlld0ltYWdlKGZpbGVOYW1lOiBzdHJpbmcsIG9iamVjdFVSTDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLnNldChmaWxlTmFtZSwgb2JqZWN0VVJMKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpwcmV2aWV3LWNhY2hlZCcsXHJcbiAgICAgIGRhdGE6IHsgZmlsZU5hbWUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBjYWNoZWQgcHJldmlldyBpbWFnZSBPYmplY3RVUkxcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2FjaGVkUHJldmlld0ltYWdlKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuIHRoaXMucHJldmlld0ltYWdlQ2FjaGUuZ2V0KGZpbGVOYW1lKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIGFsbCBwcmV2aWV3IGNhY2hlXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyUHJldmlld0NhY2hlKCk6IHZvaWQge1xyXG4gICAgLy8gUmV2b2tlIGFsbCBPYmplY3RVUkxzIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXHJcbiAgICBmb3IgKGNvbnN0IG9iamVjdFVSTCBvZiB0aGlzLnByZXZpZXdJbWFnZUNhY2hlLnZhbHVlcygpKSB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VVJMKTtcclxuICAgIH1cclxuICAgIHRoaXMucHJldmlld0ltYWdlQ2FjaGUuY2xlYXIoKTtcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgIHR5cGU6ICdjYWNoZTpwcmV2aWV3LWNsZWFyZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENsaXBib2FyZCBPcGVyYXRpb25zXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgY2xpcGJvYXJkIGRhdGFcclxuICAgKi9cclxuICBwdWJsaWMgc2V0Q2xpcGJvYXJkKGRhdGE6IENsaXBib2FyZERhdGEpOiB2b2lkIHtcclxuICAgIHRoaXMuX2NsaXBib2FyZCA9IGRhdGE7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xpcGJvYXJkOmRhdGEtc2V0JyxcclxuICAgICAgZGF0YTogeyB0eXBlOiBkYXRhLnR5cGUgfSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBjbGlwYm9hcmQgZGF0YVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDbGlwYm9hcmQoKTogQ2xpcGJvYXJkRGF0YSB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NsaXBib2FyZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIGNsaXBib2FyZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhckNsaXBib2FyZCgpOiB2b2lkIHtcclxuICAgIHRoaXMuX2NsaXBib2FyZCA9IG51bGw7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnY2xpcGJvYXJkOmNsZWFyZWQnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEV2ZW50IFN5c3RlbSBJbXBsZW1lbnRhdGlvblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVyXHJcbiAgICovXHJcbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBoYW5kbGVyOiBBcHBTdGF0ZUV2ZW50SGFuZGxlcik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSkge1xyXG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBbXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKSEucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBldmVudCBsaXN0ZW5lclxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgaGFuZGxlcjogQXBwU3RhdGVFdmVudEhhbmRsZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQodHlwZSk7XHJcbiAgICBpZiAoaGFuZGxlcnMpIHtcclxuICAgICAgY29uc3QgaW5kZXggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3BhdGNoIGV2ZW50IHRvIGFsbCBsaXN0ZW5lcnNcclxuICAgKi9cclxuICBwdWJsaWMgZGlzcGF0Y2hFdmVudChldmVudDogQXBwU3RhdGVFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcclxuICAgIGlmIChoYW5kbGVycykge1xyXG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gZXZlbnQgaGFuZGxlciBmb3IgJHtldmVudC50eXBlfTpgLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBVdGlsaXR5IE1ldGhvZHNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8qKlxyXG4gICAqIFZhbGlkYXRlIGN1cnJlbnQgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgdmFsaWRhdGUoKTogQXBwU3RhdGVWYWxpZGF0aW9uIHtcclxuICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciByZXF1aXJlZCBmb2xkZXJzXHJcbiAgICBpZiAoIXRoaXMuaW1hZ2VGb2xkZXJIYW5kbGUpIHtcclxuICAgICAgd2FybmluZ3MucHVzaCgnTm8gaW1hZ2UgZm9sZGVyIHNlbGVjdGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmxhYmVsRm9sZGVySGFuZGxlKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ05vIGxhYmVsIGZvbGRlciBzZWxlY3RlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvbnQgc2l6ZSByYW5nZVxyXG4gICAgaWYgKHRoaXMubGFiZWxGb250U2l6ZSA8IDggfHwgdGhpcy5sYWJlbEZvbnRTaXplID4gNDgpIHtcclxuICAgICAgZXJyb3JzLnB1c2goJ0xhYmVsIGZvbnQgc2l6ZSBtdXN0IGJlIGJldHdlZW4gOCBhbmQgNDgnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgbWVtb3J5IGxlYWtzIGluIGNhY2hlXHJcbiAgICBpZiAodGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5zaXplID4gMTAwKSB7XHJcbiAgICAgIHdhcm5pbmdzLnB1c2goJ1ByZXZpZXcgY2FjaGUgaXMgbGFyZ2UsIGNvbnNpZGVyIGNsZWFyaW5nJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCxcclxuICAgICAgZXJyb3JzLFxyXG4gICAgICB3YXJuaW5nc1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBzZXJpYWxpemFibGUgc3RhdGUgKGZvciBwZXJzaXN0ZW5jZSlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U2VyaWFsaXphYmxlU3RhdGUoKTogU2VyaWFsaXphYmxlQXBwU3RhdGUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY3VycmVudE1vZGU6IHRoaXMuY3VycmVudE1vZGUsXHJcbiAgICAgIGlzQXV0b1NhdmVFbmFibGVkOiB0aGlzLmlzQXV0b1NhdmVFbmFibGVkLFxyXG4gICAgICBzaG93TGFiZWxzT25DYW52YXM6IHRoaXMuc2hvd0xhYmVsc09uQ2FudmFzLFxyXG4gICAgICBsYWJlbEZvbnRTaXplOiB0aGlzLmxhYmVsRm9udFNpemUsXHJcbiAgICAgIGxhYmVsU29ydE9yZGVyOiB0aGlzLmxhYmVsU29ydE9yZGVyLFxyXG4gICAgICBpc1ByZXZpZXdCYXJIaWRkZW46IHRoaXMuaXNQcmV2aWV3QmFySGlkZGVuLFxyXG4gICAgICBpc0Nyb3NzaGFpclZpc2libGU6IHRoaXMuaXNDcm9zc2hhaXJWaXNpYmxlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZSBmcm9tIHNlcmlhbGl6YWJsZSBzdGF0ZVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXN0b3JlRnJvbVNlcmlhbGl6YWJsZVN0YXRlKHN0YXRlOiBTZXJpYWxpemFibGVBcHBTdGF0ZSk6IHZvaWQge1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSA9IHN0YXRlLmN1cnJlbnRNb2RlO1xyXG4gICAgdGhpcy5pc0F1dG9TYXZlRW5hYmxlZCA9IHN0YXRlLmlzQXV0b1NhdmVFbmFibGVkO1xyXG4gICAgdGhpcy5zaG93TGFiZWxzT25DYW52YXMgPSBzdGF0ZS5zaG93TGFiZWxzT25DYW52YXM7XHJcbiAgICB0aGlzLmxhYmVsRm9udFNpemUgPSBzdGF0ZS5sYWJlbEZvbnRTaXplO1xyXG4gICAgdGhpcy5sYWJlbFNvcnRPcmRlciA9IHN0YXRlLmxhYmVsU29ydE9yZGVyO1xyXG4gICAgdGhpcy5pc1ByZXZpZXdCYXJIaWRkZW4gPSBzdGF0ZS5pc1ByZXZpZXdCYXJIaWRkZW47XHJcbiAgICB0aGlzLmlzQ3Jvc3NoYWlyVmlzaWJsZSA9IHN0YXRlLmlzQ3Jvc3NoYWlyVmlzaWJsZTtcclxuXHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICB0eXBlOiAnc3RhdGU6cmVzdG9yZWQnLFxyXG4gICAgICBkYXRhOiBzdGF0ZSxcclxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBkZWJ1ZyBpbmZvcm1hdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXREZWJ1Z0luZm8oKTogUmVjb3JkPHN0cmluZywgYW55PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpbWFnZUZpbGVzQ291bnQ6IHRoaXMuaW1hZ2VGaWxlcy5sZW5ndGgsXHJcbiAgICAgIGNsYXNzRmlsZXNDb3VudDogdGhpcy5jbGFzc0ZpbGVzLmxlbmd0aCxcclxuICAgICAgaW1hZ2VMYWJlbFN0YXR1c0NvdW50OiB0aGlzLmltYWdlTGFiZWxTdGF0dXMuc2l6ZSxcclxuICAgICAgY2xhc3NOYW1lc0NvdW50OiB0aGlzLmNsYXNzTmFtZXMuc2l6ZSxcclxuICAgICAgcHJldmlld0NhY2hlU2l6ZTogdGhpcy5wcmV2aWV3SW1hZ2VDYWNoZS5zaXplLFxyXG4gICAgICBjb2xsYXBzZWRHcm91cHNDb3VudDogdGhpcy5jb2xsYXBzZWRMYWJlbEdyb3Vwcy5zaXplLFxyXG4gICAgICBjdXJyZW50TG9hZFRva2VuOiB0aGlzLmN1cnJlbnRMb2FkVG9rZW4sXHJcbiAgICAgIGhhc0ltYWdlRm9sZGVyOiAhIXRoaXMuaW1hZ2VGb2xkZXJIYW5kbGUsXHJcbiAgICAgIGhhc0xhYmVsRm9sZGVyOiAhIXRoaXMubGFiZWxGb2xkZXJIYW5kbGUsXHJcbiAgICAgIGhhc0NsYXNzSW5mb0ZvbGRlcjogISF0aGlzLmNsYXNzSW5mb0ZvbGRlckhhbmRsZSxcclxuICAgICAgY3VycmVudEltYWdlTmFtZTogdGhpcy5jdXJyZW50SW1hZ2VGaWxlPy5uYW1lIHx8IG51bGwsXHJcbiAgICAgIHNlbGVjdGVkQ2xhc3NGaWxlTmFtZTogdGhpcy5zZWxlY3RlZENsYXNzRmlsZT8ubmFtZSB8fCBudWxsLFxyXG4gICAgICBldmVudExpc3RlbmVyVHlwZXM6IEFycmF5LmZyb20odGhpcy5ldmVudExpc3RlbmVycy5rZXlzKCkpXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGYWN0b3J5IEZ1bmN0aW9uXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgQXBwU3RhdGUgaW5zdGFuY2VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBcHBTdGF0ZSgpOiBBcHBTdGF0ZSB7XHJcbiAgcmV0dXJuIG5ldyBBcHBTdGF0ZSgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIEFwcFN0YXRlIHdpdGggaW5pdGlhbCBjb25maWd1cmF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBwU3RhdGVXaXRoQ29uZmlnKGNvbmZpZzogUGFydGlhbDxBcHBTdGF0ZUNvbmZpZz4pOiBBcHBTdGF0ZSB7XHJcbiAgY29uc3QgYXBwU3RhdGUgPSBuZXcgQXBwU3RhdGUoKTtcclxuICBcclxuICAvLyBBcHBseSBjb25maWd1cmF0aW9uXHJcbiAgT2JqZWN0LmtleXMoY29uZmlnKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICBpZiAoa2V5IGluIGFwcFN0YXRlKSB7XHJcbiAgICAgIChhcHBTdGF0ZSBhcyBhbnkpW2tleV0gPSAoY29uZmlnIGFzIGFueSlba2V5XTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGFwcFN0YXRlO1xyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEV4cG9ydHNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXBwU3RhdGU7XHJcbmV4cG9ydCB0eXBlIHsgSUFwcFN0YXRlLCBBcHBTdGF0ZUNvbmZpZywgQXBwU3RhdGVNZXRob2RzIH07IiwiLyoqXHJcbiAqIE1vZGVscyBNb2R1bGUgSW5kZXhcclxuICogXHJcbiAqIENlbnRyYWwgZXhwb3J0IHBvaW50IGZvciBhbGwgbW9kZWwgY2xhc3NlcyB1c2VkIHRocm91Z2hvdXQgdGhlIEVhc3kgTGFiZWxpbmcgYXBwbGljYXRpb24uXHJcbiAqIFRoaXMgbW9kdWxlIHByb3ZpZGVzIGNsZWFuIEFQSSBhY2Nlc3MgdG8gZGF0YSBtb2RlbHMgYW5kIHN0YXRlIG1hbmFnZW1lbnQuXHJcbiAqL1xyXG5cclxuLy8gRXhwb3J0IEFwcFN0YXRlIG1vZGVsXHJcbmV4cG9ydCB7IFxyXG4gIEFwcFN0YXRlLCBcclxuICBjcmVhdGVBcHBTdGF0ZSwgXHJcbiAgY3JlYXRlQXBwU3RhdGVXaXRoQ29uZmlnLFxyXG4gIHR5cGUgSUFwcFN0YXRlLFxyXG4gIHR5cGUgQXBwU3RhdGVDb25maWcsXHJcbiAgdHlwZSBBcHBTdGF0ZU1ldGhvZHNcclxufSBmcm9tICcuL0FwcFN0YXRlJztcclxuXHJcbi8vIFJlLWV4cG9ydCB0eXBlcyBmb3IgY29udmVuaWVuY2VcclxuZXhwb3J0IHR5cGUge1xyXG4gIEltYWdlRmlsZSxcclxuICBDbGFzc0ZpbGUsXHJcbiAgQ2xhc3NEZWZpbml0aW9uLFxyXG4gIENsaXBib2FyZERhdGEsXHJcbiAgTG9hZFRva2VuLFxyXG4gIEFwcFN0YXRlRXZlbnQsXHJcbiAgQXBwU3RhdGVFdmVudEhhbmRsZXIsXHJcbiAgQXBwU3RhdGVWYWxpZGF0aW9uLFxyXG4gIFNlcmlhbGl6YWJsZUFwcFN0YXRlLFxyXG4gIEFwcFN0YXRlTWlncmF0aW9uLFxyXG4gIEFwcFN0YXRlVmVyc2lvbixcclxuICBBcHBTdGF0ZUZhY3RvcnlcclxufSBmcm9tICcuLi90eXBlcy9hcHAtc3RhdGUnOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLyoqXHJcbiAqIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNYWluIEVudHJ5IFBvaW50XHJcbiAqIFxyXG4gKiBUaGlzIGlzIHRoZSBtYWluIGVudHJ5IHBvaW50IGZvciB0aGUgVHlwZVNjcmlwdCB2ZXJzaW9uIG9mIEVhc3kgTGFiZWxpbmcuXHJcbiAqIFBoYXNlIDQgQ29tcGxldGU6IEFwcFN0YXRlIG1vZGVsIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBpbXBsZW1lbnRlZCB3aXRoIGZ1bGwgdHlwZSBzYWZldHkuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgY3JlYXRlQXBwU3RhdGUsIEFwcFN0YXRlIH0gZnJvbSAnLi9tb2RlbHMnO1xyXG5cclxuLy8gUGhhc2UgUHJvZ3Jlc3MgUmVwb3J0XHJcbmNvbnNvbGUubG9nKCfwn5qAIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb24gLSBQaGFzZSA0IENvbXBsZXRlIScpO1xyXG5jb25zb2xlLmxvZygn4pyFIFR5cGVTY3JpcHQgY29tcGlsYXRpb24gd29ya2luZycpO1xyXG5jb25zb2xlLmxvZygn4pyFIFdlYnBhY2sgYnVuZGxpbmcgd29ya2luZycpO1xyXG5jb25zb2xlLmxvZygn4pyFIEFwcFN0YXRlIG1vZGVsIGltcGxlbWVudGVkIHdpdGggdHlwZSBzYWZldHknKTtcclxuY29uc29sZS5sb2coJ+KchSBFdmVudCBzeXN0ZW0gYW5kIHZhbGlkYXRpb24gYWRkZWQnKTtcclxuY29uc29sZS5sb2coJ/Cfk4UgUGhhc2UgNCBjb21wbGV0ZWQ6JywgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuXHJcbi8vIFRlc3QgUGhhc2UgNDogQXBwU3RhdGUgTW9kZWxcclxuY29uc29sZS5sb2coJ1xcbvCfp6ogVGVzdGluZyBQaGFzZSA0IEFwcFN0YXRlIEltcGxlbWVudGF0aW9uOicpO1xyXG5cclxuLy8gQ3JlYXRlIEFwcFN0YXRlIGluc3RhbmNlXHJcbmNvbnN0IGFwcFN0YXRlID0gY3JlYXRlQXBwU3RhdGUoKTtcclxuY29uc29sZS5sb2coJ+KchSBBcHBTdGF0ZSBpbnN0YW5jZSBjcmVhdGVkJyk7XHJcblxyXG4vLyBUZXN0IGV2ZW50IHN5c3RlbVxyXG5hcHBTdGF0ZS5hZGRFdmVudExpc3RlbmVyKCdtb2RlOmNoYW5nZWQnLCAoZXZlbnQpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+ToSBFdmVudCByZWNlaXZlZDonLCBldmVudC50eXBlLCBldmVudC5kYXRhKTtcclxufSk7XHJcblxyXG4vLyBUZXN0IHN0YXRlIG1ldGhvZHNcclxuYXBwU3RhdGUuc2V0TW9kZSgnZHJhdycpO1xyXG5jb25zb2xlLmxvZygn4pyFIE1vZGUgY2hhbmdlZCB0bzonLCBhcHBTdGF0ZS5jdXJyZW50TW9kZSk7XHJcblxyXG5hcHBTdGF0ZS5zZXRMYWJlbEZvbnRTaXplKDE2KTtcclxuY29uc29sZS5sb2coJ+KchSBGb250IHNpemUgc2V0IHRvOicsIGFwcFN0YXRlLmxhYmVsRm9udFNpemUpO1xyXG5cclxuLy8gVGVzdCB2YWxpZGF0aW9uXHJcbmNvbnN0IHZhbGlkYXRpb24gPSBhcHBTdGF0ZS52YWxpZGF0ZSgpO1xyXG5jb25zb2xlLmxvZygn4pyFIFZhbGlkYXRpb24gcmVzdWx0OicsIHZhbGlkYXRpb24uaXNWYWxpZCA/ICdQQVNTRUQnIDogJ0ZBSUxFRCcpO1xyXG5pZiAodmFsaWRhdGlvbi53YXJuaW5ncy5sZW5ndGggPiAwKSB7XHJcbiAgY29uc29sZS5sb2coJ+KaoO+4jyBXYXJuaW5nczonLCB2YWxpZGF0aW9uLndhcm5pbmdzKTtcclxufVxyXG5cclxuLy8gVGVzdCBzZXJpYWxpemF0aW9uXHJcbmNvbnN0IHNlcmlhbGl6ZWQgPSBhcHBTdGF0ZS5nZXRTZXJpYWxpemFibGVTdGF0ZSgpO1xyXG5jb25zb2xlLmxvZygn4pyFIFNlcmlhbGl6YXRpb24gdGVzdDonLCBPYmplY3Qua2V5cyhzZXJpYWxpemVkKS5sZW5ndGgsICdwcm9wZXJ0aWVzIHNlcmlhbGl6ZWQnKTtcclxuXHJcbmNvbnNvbGUubG9nKCfwn46vIFBoYXNlIDQgQXBwU3RhdGUgdGVzdHMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuXHJcbi8vIERPTSByZWFkeSB0ZXN0XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XHJcbiAgY29uc29sZS5sb2coJ/Cfk7EgRE9NIGxvYWRlZCAtIHJlYWR5IGZvciBQaGFzZSA1IGltcGxlbWVudGF0aW9uJyk7XHJcbiAgXHJcbiAgLy8gQ3JlYXRlIFBoYXNlIDQgY29tcGxldGlvbiBpbmRpY2F0b3JcclxuICBjb25zdCBpbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBpbmRpY2F0b3Iuc3R5bGUuY3NzVGV4dCA9IGBcclxuICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgIHRvcDogMTBweDtcclxuICAgIHJpZ2h0OiAxMHB4O1xyXG4gICAgYmFja2dyb3VuZDogIzE3YTJiODtcclxuICAgIGNvbG9yOiB3aGl0ZTtcclxuICAgIHBhZGRpbmc6IDEycHggMThweDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcclxuICAgIGZvbnQtZmFtaWx5OiAnU2Vnb2UgVUknLCBtb25vc3BhY2U7XHJcbiAgICBmb250LXNpemU6IDEzcHg7XHJcbiAgICBmb250LXdlaWdodDogYm9sZDtcclxuICAgIHotaW5kZXg6IDk5OTk7XHJcbiAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMCwwLDAsMC4zKTtcclxuICAgIGJvcmRlcjogMnB4IHNvbGlkICNmZmY7XHJcbiAgYDtcclxuICBpbmRpY2F0b3IuaW5uZXJIVE1MID0gYFxyXG4gICAgPGRpdj7wn5qAIFBoYXNlIDQgQ29tcGxldGU8L2Rpdj5cclxuICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6IDExcHg7IG9wYWNpdHk6IDAuOTsgbWFyZ2luLXRvcDogNHB4O1wiPkFwcFN0YXRlIE1vZGVsIFJlYWR5PC9kaXY+XHJcbiAgYDtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluZGljYXRvcik7XHJcbiAgXHJcbiAgLy8gQXV0by1yZW1vdmUgYWZ0ZXIgOCBzZWNvbmRzXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBpbmRpY2F0b3Iuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuNXMgZWFzZSc7XHJcbiAgICBpbmRpY2F0b3Iuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4gaW5kaWNhdG9yLnJlbW92ZSgpLCA1MDApO1xyXG4gIH0sIDgwMDApO1xyXG59KTtcclxuXHJcbi8vIEV4cG9ydCBQaGFzZSA0IGNvbXBvbmVudHNcclxuZXhwb3J0IHsgQXBwU3RhdGUsIGNyZWF0ZUFwcFN0YXRlLCBjcmVhdGVBcHBTdGF0ZVdpdGhDb25maWcgfSBmcm9tICcuL21vZGVscyc7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9