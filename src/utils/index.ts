/**
 * Utils Module Index
 * 
 * Central export point for all utility functions used throughout the Easy Labeling application.
 * This file provides a clean API for importing utility functions from various modules.
 */

// Export all notification utilities
export {
    showToast,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showTypedToast,
    type ToastType,
    type ToastConfig
} from './notifications';

// Export all color palette utilities
export {
    colorPalette,
    DEFAULT_COLOR,
    getColorForClass,
    getColorsForClasses,
    isColorInPalette,
    getColorIndex,
    getContrastingTextColor,
    hexToRgba,
    ColorManager,
    type ColorConfig
} from './color-palette';

// Export all validation utilities
export {
    validateLabelClass,
    validateLabelClassAdvanced,
    validateFileName,
    validateImageExtension,
    validateBoundingBox,
    validateYOLOCoordinates,
    validateZoomLevel,
    validateFontSize,
    validateNumber,
    validateEmail,
    validateUrl,
    sanitizeInput,
    type ValidationResult
} from './validation';

// Export YOLO parser utilities
export {
    YoloParser,
    parseYolo,
    exportYolo,
    validateYoloString
} from './yolo-parser';

// Re-export commonly used utilities with shorter names
export { showToast as toast } from './notifications';
export { getColorForClass as getColor } from './color-palette';
export { validateLabelClass as validateLabel } from './validation';

/**
 * Utility function categories for better organization
 */
export const UtilityCategories = {
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
} as const;

/**
 * Utility configuration interface
 */
export interface UtilityConfig {
    notifications: {
        defaultDuration: number;
        containerSelector: string;
    };
    colors: {
        useHighContrast: boolean;
        customPalette?: string[];
    };
    validation: {
        strictMode: boolean;
        showErrors: boolean;
    };
}

/**
 * Default utility configuration
 */
export const DEFAULT_UTILITY_CONFIG: UtilityConfig = {
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
export class UtilityManager {
    private config: UtilityConfig;

    constructor(config: Partial<UtilityConfig> = {}) {
        this.config = { ...DEFAULT_UTILITY_CONFIG, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): UtilityConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<UtilityConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Initialize utilities with current configuration
     */
    initialize(): void {
        // This could be extended to set up any global utility configurations
        console.log('Utilities initialized with config:', this.config);
    }
}

/**
 * Global utility manager instance
 */
export const utilityManager = new UtilityManager();

/**
 * Helper function to check if utilities are properly loaded
 */
export function validateUtilitiesLoaded(): boolean {
    try {
        // Import functions for testing
        const { showToast } = require('./notifications');
        const { colorPalette } = require('./color-palette');
        const { validateLabelClass } = require('./validation');
        
        // Test each utility category
        const notificationTest = typeof showToast === 'function';
        const colorTest = Array.isArray(colorPalette) && colorPalette.length > 0;
        const validationTest = typeof validateLabelClass === 'function';
        
        return notificationTest && colorTest && validationTest;
    } catch (error) {
        console.error('Utilities validation failed:', error);
        return false;
    }
}

/**
 * Get utility module version info
 */
export const UTILITY_VERSION = {
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