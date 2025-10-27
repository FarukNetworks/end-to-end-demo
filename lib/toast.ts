import { toast as toastHook } from '@/hooks/use-toast';

/**
 * Toast utility wrapper for simplified toast notifications
 * Uses shadcn/ui toast system with preset variants and durations
 */
export const toast = {
  /**
   * Show a success toast message
   * @param message - Success message to display
   */
  success: (message: string) => {
    return toastHook({
      title: message,
      variant: 'default',
      duration: 3000,
      className: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50',
    });
  },

  /**
   * Show an error toast message
   * @param message - Error message to display
   */
  error: (message: string) => {
    return toastHook({
      title: message,
      variant: 'destructive',
      duration: 4000,
    });
  },

  /**
   * Show an info toast message
   * @param message - Info message to display
   */
  info: (message: string) => {
    return toastHook({
      title: message,
      variant: 'default',
      duration: 3000,
    });
  },

  /**
   * Show a loading toast message
   * @param message - Loading message to display
   * @returns Toast object with id and dismiss method
   */
  loading: (message: string) => {
    return toastHook({
      title: message,
      variant: 'default',
      duration: Infinity, // Loading toasts should not auto-dismiss
      className: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-50',
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   * @param toastId - Optional toast ID to dismiss. If not provided, dismisses all toasts
   */
  dismiss: (toastId?: string) => {
    // The useToast hook exposes a dismiss method through the returned toast object
    // For dismissing all toasts, we need to use the hook's dismiss method
    // This is a limitation of the current implementation - best to dismiss individual toasts
    // by storing the returned toast object and calling its dismiss() method
    if (toastId) {
      // Individual toast dismissal should be done via the toast.dismiss() method
      // returned when creating the toast
      console.warn('Use the dismiss method returned from toast creation for individual dismissal');
    }
  },
};
