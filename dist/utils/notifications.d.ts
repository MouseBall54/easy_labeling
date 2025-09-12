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
export declare function showToast(message: string, duration?: number): void;
/**
 * Shows an error toast with longer duration
 * @param message - Error message to display
 */
export declare function showErrorToast(message: string): void;
/**
 * Shows a success toast with standard duration
 * @param message - Success message to display
 */
export declare function showSuccessToast(message: string): void;
/**
 * Shows a warning toast
 * @param message - Warning message to display
 */
export declare function showWarningToast(message: string): void;
/**
 * Toast message types for type safety
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';
/**
 * Configuration for toast notifications
 */
export interface ToastConfig {
    message: string;
    type: ToastType;
    duration?: number;
    dismissible?: boolean;
}
/**
 * Shows a typed toast notification
 * @param config - Toast configuration object
 */
export declare function showTypedToast(config: ToastConfig): void;
//# sourceMappingURL=notifications.d.ts.map