import { useToastStore } from "@/stores/toastStore";

/**
 * Composable for showing toast notifications
 *
 * Usage:
 * ```ts
 * const toast = useToast();
 * toast.success('Operation completed!');
 * toast.error('Something went wrong', 'Error details here');
 * toast.warning('Please review', 'Some items need attention');
 * toast.info('New features available');
 * ```
 */
export function useToast() {
  const toastStore = useToastStore();

  return {
    /**
     * Show a success toast
     * @param message - Main message to display
     * @param details - Optional additional details (displayed below message)
     * @param duration - Duration in ms (default: 5000, use 0 for persistent)
     */
    success: (message: string, details?: string, duration?: number) => {
      toastStore.success(message, details, duration);
    },

    /**
     * Show an error toast
     * @param message - Main message to display
     * @param details - Optional additional details (displayed below message)
     * @param duration - Duration in ms (default: 5000, use 0 for persistent)
     */
    error: (message: string, details?: string, duration?: number) => {
      toastStore.error(message, details, duration);
    },

    /**
     * Show a warning toast
     * @param message - Main message to display
     * @param details - Optional additional details (displayed below message)
     * @param duration - Duration in ms (default: 5000, use 0 for persistent)
     */
    warning: (message: string, details?: string, duration?: number) => {
      toastStore.warning(message, details, duration);
    },

    /**
     * Show an info toast
     * @param message - Main message to display
     * @param details - Optional additional details (displayed below message)
     * @param duration - Duration in ms (default: 5000, use 0 for persistent)
     */
    info: (message: string, details?: string, duration?: number) => {
      toastStore.info(message, details, duration);
    },
  };
}
