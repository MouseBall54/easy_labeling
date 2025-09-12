/**
 * Utils Module Index
 *
 * Central export point for all utility functions used throughout the Easy Labeling application.
 * This file provides a clean API for importing utility functions from various modules.
 */
export { showToast, showErrorToast, showSuccessToast, showWarningToast, showTypedToast, type ToastType, type ToastConfig } from './notifications';
export { colorPalette, DEFAULT_COLOR, getColorForClass, getColorsForClasses, isColorInPalette, getColorIndex, getContrastingTextColor, hexToRgba, ColorManager, type ColorConfig } from './color-palette';
export { validateLabelClass, validateLabelClassAdvanced, validateFileName, validateImageExtension, validateBoundingBox, validateYOLOCoordinates, validateZoomLevel, validateFontSize, validateNumber, validateEmail, validateUrl, sanitizeInput, type ValidationResult } from './validation';
export { showToast as toast } from './notifications';
export { getColorForClass as getColor } from './color-palette';
export { validateLabelClass as validateLabel } from './validation';
/**
 * Utility function categories for better organization
 */
export declare const UtilityCategories: {
    readonly NOTIFICATIONS: readonly ["showToast", "showErrorToast", "showSuccessToast", "showWarningToast", "showTypedToast"];
    readonly COLORS: readonly ["getColorForClass", "getColorsForClasses", "getContrastingTextColor", "hexToRgba", "ColorManager"];
    readonly VALIDATION: readonly ["validateLabelClass", "validateFileName", "validateImageExtension", "validateBoundingBox", "validateYOLOCoordinates"];
};
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
export declare const DEFAULT_UTILITY_CONFIG: UtilityConfig;
/**
 * Utility manager for coordinated utility operations
 */
export declare class UtilityManager {
    private config;
    constructor(config?: Partial<UtilityConfig>);
    /**
     * Get current configuration
     */
    getConfig(): UtilityConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<UtilityConfig>): void;
    /**
     * Initialize utilities with current configuration
     */
    initialize(): void;
}
/**
 * Global utility manager instance
 */
export declare const utilityManager: UtilityManager;
/**
 * Helper function to check if utilities are properly loaded
 */
export declare function validateUtilitiesLoaded(): boolean;
/**
 * Get utility module version info
 */
export declare const UTILITY_VERSION: {
    version: string;
    modules: {
        notifications: string;
        colors: string;
        validation: string;
    };
    buildDate: string;
};
//# sourceMappingURL=index.d.ts.map