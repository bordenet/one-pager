/**
 * UI Utilities Module
 * Common UI functions and helpers
 */

/**
 * Format date for display
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show prompt modal - displays full prompt text in a scrollable modal
 */
export function showPromptModal(promptText, title = 'Full Prompt') {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${escapeHtml(title)}</h3>
                <button id="close-prompt-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
            </div>
            <div class="overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre class="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">${escapeHtml(promptText)}</pre>
            </div>
            <div class="mt-4 flex justify-end">
                <button id="close-prompt-modal-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Handle escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  const closeModal = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    document.removeEventListener('keydown', handleEscape);
  };

  modal.querySelector('#close-prompt-modal').addEventListener('click', closeModal);
  modal.querySelector('#close-prompt-modal-btn').addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', handleEscape);
}

/**
 * Show confirmation dialog
 */
export async function confirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${escapeHtml(title)}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">${escapeHtml(message)}</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancel-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(false);
    });

    modal.querySelector('#confirm-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(true);
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        resolve(false);
      }
    });
  });
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast-notification transform transition-all duration-300 translate-x-full opacity-0 mb-2 px-4 py-3 rounded-lg shadow-lg text-white max-w-sm ${getToastColor(type)}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Copied to clipboard', 'success');
  }
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed bottom-4 right-4 z-50 space-y-2';
  document.body.appendChild(container);
  return container;
}

/**
 * Get toast color class based on type
 */
function getToastColor(type) {
  switch (type) {
  case 'success':
    return 'bg-green-500';
  case 'error':
    return 'bg-red-500';
  case 'warning':
    return 'bg-yellow-500';
  case 'info':
  default:
    return 'bg-blue-500';
  }
}

/**
 * Show loading overlay
 */
export function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.querySelector('#loading-text').textContent = message;
    overlay.classList.remove('hidden');
  }
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}
