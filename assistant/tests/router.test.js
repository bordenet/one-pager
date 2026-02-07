import { initRouter, navigateTo, getCurrentRoute, updateStorageInfo } from '../../shared/js/router.js';
import { initDB } from '../../shared/js/storage.js';
import { createProject, deleteProject, getAllProjects } from '../../shared/js/projects.js';

describe('Router Module', () => {
  beforeEach(async () => {
    // Initialize database
    await initDB();

    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }

    // Set up DOM
    document.body.innerHTML = '<div id="app-container"></div><span id="storage-info"></span>';

    // Reset hash
    window.location.hash = '';
  });

  describe('navigateTo', () => {
    test('should navigate to home route', () => {
      navigateTo('home');
      expect(getCurrentRoute()).toBe('home');
    });

    test('should navigate to new-project route', () => {
      navigateTo('new-project');
      expect(getCurrentRoute()).toBe('new-project');
    });

    test('should navigate to project route with ID', () => {
      navigateTo('project/test-id');
      expect(getCurrentRoute()).toBe('project/test-id');
    });

    test('should update browser history when pushState is true', () => {
      navigateTo('new-project', true);
      expect(window.location.hash).toBe('#new-project');
    });
  });

  describe('getCurrentRoute', () => {
    test('should return current route after navigation', () => {
      navigateTo('home');
      expect(getCurrentRoute()).toBe('home');

      navigateTo('new-project');
      expect(getCurrentRoute()).toBe('new-project');
    });
  });

  describe('initRouter', () => {
    test('should handle initial route on init', () => {
      window.location.hash = '';
      initRouter();
      // Should navigate to home by default
      expect(getCurrentRoute()).toBe('home');
    });

    test('should handle hash route on init', () => {
      window.location.hash = '#new-project';
      initRouter();
      expect(getCurrentRoute()).toBe('new-project');
    });
  });

  describe('updateStorageInfo', () => {
    test('should update storage info element', async () => {
      await updateStorageInfo();

      const storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toBeTruthy();
    });

    test('should show project count', async () => {
      await createProject('Test Project', 'Problems', 'Context');
      await createProject('Test Project 2', 'Problems', 'Context');

      await updateStorageInfo();

      const storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toContain('2 projects');
    });

    test('should show 0 projects when empty', async () => {
      await updateStorageInfo();

      const storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toContain('0 projects');
    });
  });
});
