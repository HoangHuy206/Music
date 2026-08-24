import { reactive } from 'vue';

export const toastState = reactive({
  toasts: [],
});

let toastCounter = 0;

/**
 * Trigger a global animated glass toast notification
 * @param {string} message - Message text to display
 * @param {'success' | 'error' | 'info' | 'warning'} type - Toast aesthetic theme
 * @param {number} duration - Auto dismiss time in ms (default 3800)
 */
export function showToast(message, type = 'success', duration = 3800) {
  if (!message) return;

  const id = ++toastCounter;
  const newToast = {
    id,
    message,
    type,
    duration,
    createdAt: Date.now(),
  };

  // Keep maximum 4 toasts on screen
  if (toastState.toasts.length >= 4) {
    toastState.toasts.shift();
  }

  toastState.toasts.push(newToast);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

export function removeToast(id) {
  const index = toastState.toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    toastState.toasts.splice(index, 1);
  }
}

// Convenience helper methods
export const toast = {
  success: (msg, dur) => showToast(msg, 'success', dur),
  error: (msg, dur) => showToast(msg, 'error', dur),
  info: (msg, dur) => showToast(msg, 'info', dur),
  warning: (msg, dur) => showToast(msg, 'warning', dur),
};
