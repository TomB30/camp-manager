import { defineStore } from "pinia";
import { ref } from "vue";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  details?: string;
  duration?: number;
}

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  function addToast(toast: Omit<Toast, "id">) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = toast.duration ?? 5000; // Default 5 seconds

    const newToast: Toast = {
      id,
      ...toast,
      duration,
    };

    toasts.value.push(newToast);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index >= 0) {
      toasts.value.splice(index, 1);
    }
  }

  function clearAll() {
    toasts.value = [];
  }

  // Convenience methods
  function success(message: string, details?: string, duration?: number) {
    addToast({ type: "success", message, details, duration });
  }

  function error(message: string, details?: string, duration?: number) {
    addToast({ type: "error", message, details, duration });
  }

  function info(message: string, details?: string, duration?: number) {
    addToast({ type: "info", message, details, duration });
  }

  function warning(message: string, details?: string, duration?: number) {
    addToast({ type: "warning", message, details, duration });
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    info,
    warning,
  };
});
