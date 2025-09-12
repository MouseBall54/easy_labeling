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
export function showToast(message: string, duration: number = 3000): void {
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
export function showErrorToast(message: string): void {
    showToast(message, 4000);
}

/**
 * Shows a success toast with standard duration
 * @param message - Success message to display
 */
export function showSuccessToast(message: string): void {
    showToast(message, 2000);
}

/**
 * Shows a warning toast
 * @param message - Warning message to display
 */
export function showWarningToast(message: string): void {
    showToast(message, 3500);
}

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
export function showTypedToast(config: ToastConfig): void {
    const { message, type, duration, dismissible = false } = config;
    
    const defaultDurations: Record<ToastType, number> = {
        success: 2000,
        error: 4000,
        warning: 3500,
        info: 3000
    };

    const toastDuration = duration ?? defaultDurations[type];
    
    if (dismissible) {
        // For dismissible toasts, we could add close button logic here
        showToast(`${message} [Dismissible]`, toastDuration);
    } else {
        showToast(message, toastDuration);
    }
}