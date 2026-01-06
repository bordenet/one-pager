/**
 * Main Application Module
 * Handles app initialization and global event listeners
 */

import storage from './storage.js';
import { initRouter, updateStorageInfo } from './router.js';
import { exportAllProjects, importProjects } from './projects.js';
import { showToast, hideLoading } from './ui.js';
import { initMockMode, setMockMode } from './ai-mock.js';

/**
 * Initialize application
 */
async function initApp() {
  try {
    // Show loading
    document.getElementById('loading-overlay')?.classList.remove('hidden');

    // Initialize database
    await storage.init();

    // Initialize AI mock mode
    initMockMode();

    // Setup global event listeners
    setupGlobalEventListeners();

    // Initialize router
    initRouter();

    // Update storage info
    updateStorageInfo();

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showToast('Failed to initialize app', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Related projects dropdown
  const relatedBtn = document.getElementById('related-projects-btn');
  const relatedMenu = document.getElementById('related-projects-menu');
  relatedBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    relatedMenu?.classList.toggle('hidden');
  });
  document.addEventListener('click', () => {
    relatedMenu?.classList.add('hidden');
  });

  // Export all button
  document.getElementById('export-all-btn')?.addEventListener('click', async () => {
    try {
      await exportAllProjects();
      showToast('All projects exported', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  });

  // Import button
  document.getElementById('import-btn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const imported = await importProjects(file);
          showToast(`Imported ${imported} project(s)`, 'success');
          // Refresh current view if on home page
          if (window.location.hash === '#home' || !window.location.hash) {
            window.location.reload();
          }
        } catch (error) {
          showToast('Import failed: ' + error.message, 'error');
        }
      }
    };
    input.click();
  });

  // Privacy notice close
  document.getElementById('close-privacy-notice')?.addEventListener('click', () => {
    document.getElementById('privacy-notice')?.remove();
    localStorage.setItem('privacy-notice-dismissed', 'true');
  });

  // AI Mock mode toggle
  document.getElementById('mockModeCheckbox')?.addEventListener('change', (e) => {
    setMockMode(e.target.checked);
    showToast(
      e.target.checked ? 'AI Mock Mode enabled' : 'AI Mock Mode disabled',
      'info'
    );
  });

  // About link
  document.getElementById('about-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAboutModal();
  });
}

/**
 * Load saved theme
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

/**
 * Toggle dark/light theme
 */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

/**
 * Show about modal
 */
function showAboutModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">About One-Pager Assistant</h3>
            <div class="text-gray-600 dark:text-gray-400 space-y-3">
                <p>A privacy-first tool for creating high-quality one-pager documents using AI assistance.</p>
                <p><strong>Features:</strong></p>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>100% client-side processing</li>
                    <li>No data sent to servers</li>
                    <li>3-phase AI workflow</li>
                    <li>Multiple project management</li>
                    <li>Import/export capabilities</li>
                </ul>
                <p class="text-sm">All your data stays in your browser's local storage.</p>
            </div>
            <div class="flex justify-end mt-6">
                <button id="close-about" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector('#close-about').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Check if privacy notice should be shown
if (!localStorage.getItem('privacy-notice-dismissed')) {
  document.getElementById('privacy-notice')?.classList.remove('hidden');
}

// Load theme before init
loadTheme();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
