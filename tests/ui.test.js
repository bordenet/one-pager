import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { formatDate, escapeHtml, confirm, showToast, copyToClipboard, showLoading, hideLoading, showPromptModal } from '../js/ui.js';

describe('UI Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllTimers();
  });

  describe('formatDate', () => {
    test('should return "Today" for today\'s date', () => {
      const today = new Date().toISOString();
      expect(formatDate(today)).toBe('Today');
    });

    test('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatDate(yesterday)).toBe('Yesterday');
    });

    test('should return "X days ago" for dates within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatDate(threeDaysAgo)).toBe('3 days ago');
    });

    test('should return formatted date for dates older than a week', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatDate(tenDaysAgo);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    test('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('should return empty string for null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml('')).toBe('');
    });

    test('should handle normal text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('confirm', () => {
    test('should resolve true when confirm button is clicked', async () => {
      const confirmPromise = confirm('Are you sure?', 'Delete');

      // Wait for modal to be added
      await new Promise(resolve => setTimeout(resolve, 0));

      const confirmBtn = document.querySelector('#confirm-btn');
      expect(confirmBtn).toBeTruthy();
      confirmBtn.click();

      const result = await confirmPromise;
      expect(result).toBe(true);
    });

    test('should resolve false when cancel button is clicked', async () => {
      const confirmPromise = confirm('Are you sure?');

      await new Promise(resolve => setTimeout(resolve, 0));

      const cancelBtn = document.querySelector('#cancel-btn');
      expect(cancelBtn).toBeTruthy();
      cancelBtn.click();

      const result = await confirmPromise;
      expect(result).toBe(false);
    });

    test('should resolve false when backdrop is clicked', async () => {
      const confirmPromise = confirm('Are you sure?');

      await new Promise(resolve => setTimeout(resolve, 0));

      const modal = document.querySelector('.fixed');
      expect(modal).toBeTruthy();

      // Simulate backdrop click
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: modal, enumerable: true });
      modal.dispatchEvent(event);

      const result = await confirmPromise;
      expect(result).toBe(false);
    });

    test('should display custom title and message', async () => {
      const confirmPromise = confirm('Delete this item?', 'Confirm Delete');

      await new Promise(resolve => setTimeout(resolve, 0));

      const modal = document.querySelector('.fixed');
      expect(modal.innerHTML).toContain('Confirm Delete');
      expect(modal.innerHTML).toContain('Delete this item?');

      // Clean up
      document.querySelector('#cancel-btn').click();
      await confirmPromise;
    });
  });

  describe('showPromptModal', () => {
    test('should display modal with prompt text', () => {
      showPromptModal('Test prompt content', 'Test Title');

      const modal = document.querySelector('.fixed');
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain('Test Title');
      expect(modal.innerHTML).toContain('Test prompt content');

      // Clean up
      document.querySelector('#close-prompt-modal-btn').click();
    });

    test('should close modal when X button is clicked', () => {
      showPromptModal('Test prompt', 'Title');

      const closeBtn = document.querySelector('#close-prompt-modal');
      expect(closeBtn).toBeTruthy();
      closeBtn.click();

      const modal = document.querySelector('.fixed');
      expect(modal).toBeNull();
    });

    test('should close modal when Close button is clicked', () => {
      showPromptModal('Test prompt', 'Title');

      const closeBtn = document.querySelector('#close-prompt-modal-btn');
      expect(closeBtn).toBeTruthy();
      closeBtn.click();

      const modal = document.querySelector('.fixed');
      expect(modal).toBeNull();
    });

    test('should close modal when backdrop is clicked', () => {
      showPromptModal('Test prompt', 'Title');

      const modal = document.querySelector('.fixed');
      expect(modal).toBeTruthy();

      // Simulate backdrop click (click on the modal overlay itself, not content)
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: modal, enumerable: true });
      modal.dispatchEvent(event);

      const modalAfter = document.querySelector('.fixed');
      expect(modalAfter).toBeNull();
    });

    test('should close modal on Escape key', () => {
      showPromptModal('Test prompt', 'Title');

      const modal = document.querySelector('.fixed');
      expect(modal).toBeTruthy();

      // Simulate Escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      const modalAfter = document.querySelector('.fixed');
      expect(modalAfter).toBeNull();
    });

    test('should escape HTML in prompt text', () => {
      showPromptModal('<script>alert("xss")</script>', 'Title');

      const modal = document.querySelector('.fixed');
      expect(modal.innerHTML).not.toContain('<script>');
      expect(modal.innerHTML).toContain('&lt;script&gt;');

      // Clean up
      document.querySelector('#close-prompt-modal-btn').click();
    });
  });

  describe('showToast', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should create toast container if it doesn\'t exist', () => {
      showToast('Test message');
      const container = document.getElementById('toast-container');
      expect(container).toBeTruthy();
      expect(container.className).toContain('fixed');
    });

    test('should display toast with correct message', () => {
      showToast('Success!', 'success');
      const toast = document.querySelector('.toast-notification');
      expect(toast).toBeTruthy();
      expect(toast.textContent).toBe('Success!');
    });

    test('should apply correct color for success type', () => {
      showToast('Success!', 'success');
      const toast = document.querySelector('.toast-notification');
      expect(toast.className).toContain('bg-green-500');
    });

    test('should apply correct color for error type', () => {
      showToast('Error!', 'error');
      const toast = document.querySelector('.toast-notification');
      expect(toast.className).toContain('bg-red-500');
    });

    test('should apply correct color for warning type', () => {
      showToast('Warning!', 'warning');
      const toast = document.querySelector('.toast-notification');
      expect(toast.className).toContain('bg-yellow-500');
    });

    test('should apply correct color for info type', () => {
      showToast('Info!', 'info');
      const toast = document.querySelector('.toast-notification');
      expect(toast.className).toContain('bg-blue-500');
    });

    test('should default to info type', () => {
      showToast('Default message');
      const toast = document.querySelector('.toast-notification');
      expect(toast.className).toContain('bg-blue-500');
    });
  });

  describe('copyToClipboard', () => {
    test('should copy text to clipboard', async () => {
      const writeTextMock = jest.fn().mockResolvedValue();
      navigator.clipboard.writeText = writeTextMock;

      await copyToClipboard('Test text');

      expect(writeTextMock).toHaveBeenCalledWith('Test text');
    });

    test('should return true on successful copy', async () => {
      const writeTextMock = jest.fn().mockResolvedValue();
      navigator.clipboard.writeText = writeTextMock;

      const result = await copyToClipboard('Test text');

      expect(result).toBe(true);
    });

    test('should throw error if both clipboard API and execCommand fail', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock clipboard API to fail
      navigator.clipboard.writeText = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error('Not allowed'));
      });

      // Mock execCommand to also fail
      document.execCommand = jest.fn().mockReturnValue(false);

      await expect(copyToClipboard('Test text')).rejects.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('showLoading and hideLoading', () => {
    beforeEach(() => {
      const overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'hidden';
      const text = document.createElement('div');
      text.id = 'loading-text';
      overlay.appendChild(text);
      document.body.appendChild(overlay);
    });

    test('should show loading overlay with message', () => {
      showLoading('Processing...');

      const overlay = document.getElementById('loading-overlay');
      expect(overlay.classList.contains('hidden')).toBe(false);
      expect(document.getElementById('loading-text').textContent).toBe('Processing...');
    });

    test('should use default message if none provided', () => {
      showLoading();

      expect(document.getElementById('loading-text').textContent).toBe('Loading...');
    });

    test('should hide loading overlay', () => {
      const overlay = document.getElementById('loading-overlay');
      overlay.classList.remove('hidden');

      hideLoading();

      expect(overlay.classList.contains('hidden')).toBe(true);
    });

    test('should handle missing overlay gracefully', () => {
      document.body.innerHTML = '';

      expect(() => showLoading()).not.toThrow();
      expect(() => hideLoading()).not.toThrow();
    });
  });
});
