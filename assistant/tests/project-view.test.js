/**
 * Tests for project-view.js module
 *
 * Tests the project detail view rendering.
 * Uses jsdom for DOM testing with real implementations.
 */

import { renderProjectView } from '../js/project-view.js';
import { createProject, deleteProject, getAllProjects } from '../js/projects.js';
import storage from '../js/storage.js';

describe('Project View Module', () => {
  beforeEach(async () => {
    // Initialize database
    await storage.init();

    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }

    // Set up DOM with required elements
    document.body.innerHTML = `
      <div id="app-container"></div>
      <span id="storage-info"></span>
      <div id="toast-container"></div>
    `;
  });

  describe('renderProjectView', () => {
    test('should render project view with phase tabs', async () => {
      const project = await createProject({
        title: 'Test One-Pager',
        problemStatement: 'Test problem statement',
        context: 'Test context'
      });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Phase 1');
      expect(container.innerHTML).toContain('Phase 2');
      expect(container.innerHTML).toContain('Phase 3');
    });

    test('should render copy prompt button', async () => {
      const project = await createProject({
        title: 'Test One-Pager',
        problemStatement: 'Test problem statement',
        context: 'Test context'
      });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Copy Prompt');
    });

    test('should render More actions button (overflow menu)', async () => {
      const project = await createProject({
        title: 'Test One-Pager',
        problemStatement: 'Test problem statement',
        context: 'Test context'
      });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      // Delete is now in the overflow "More" menu
      expect(container.querySelector('#more-actions-btn')).toBeTruthy();
      expect(container.innerHTML).toContain('More');
    });

    test('should render phase content area', async () => {
      const project = await createProject({
        title: 'Test One-Pager',
        problemStatement: 'Test problem statement',
        context: 'Test context'
      });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('phase-content');
    });

    test('should render response textarea', async () => {
      const project = await createProject({
        title: 'Test One-Pager',
        problemStatement: 'Test problem statement',
        context: 'Test context'
      });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('response-textarea');
    });

    test('should render Open AI link', async () => {
      const project = await createProject({
        title: 'Test One-Pager',
        problemStatement: 'Test problem statement',
        context: 'Test context'
      });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      // Phase 1 uses Claude
      expect(container.innerHTML).toContain('Open Claude');
      expect(container.innerHTML).toContain('https://claude.ai');
    });

    test('should render phase 1 as active by default', async () => {
      const project = await createProject({
        title: 'Test One-Pager',
        problemStatement: 'Test problem statement',
        context: 'Test context'
      });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      // Phase 1 tab should have active styling
      expect(container.innerHTML).toContain('border-blue-600');
    });
  });
});
