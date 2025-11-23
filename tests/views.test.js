import { describe, test, expect, beforeEach } from '@jest/globals';
import { renderProjectsList, renderNewProjectForm } from '../js/views.js';
import { createProject, deleteProject, getAllProjects } from '../js/projects.js';
import { initDB } from '../js/storage.js';

describe('Views Module', () => {
  beforeEach(async () => {
    // Initialize database
    await initDB();

    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }

    // Set up DOM
    document.body.innerHTML = '<div id="app-container"></div>';
  });

  describe('renderProjectsList', () => {
    test('should render empty state when no projects exist', async () => {
      await renderProjectsList();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('No projects yet');
      expect(container.innerHTML).toContain('Create your first One-Pager document');
    });

    test('should render projects list when projects exist', async () => {
      // Create test projects
      await createProject('Test Project 1', 'Problems 1', 'Context 1');
      await createProject('Test Project 2', 'Problems 2', 'Context 2');

      await renderProjectsList();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Test Project 1');
      expect(container.innerHTML).toContain('Test Project 2');
      expect(container.innerHTML).toContain('My Projects');
    });

    test('should render new project button', async () => {
      await renderProjectsList();

      const container = document.getElementById('app-container');
      const newProjectBtn = container.querySelector('#new-project-btn');
      expect(newProjectBtn).toBeTruthy();
      expect(newProjectBtn.textContent).toContain('New Project');
    });

    test('should render project cards with phase information', async () => {
      await createProject('Test Project', 'Problems', 'Context');

      await renderProjectsList();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Phase');
      expect(container.innerHTML).toContain('/3');
    });

    test('should render delete buttons for each project', async () => {
      await createProject('Test Project', 'Problems', 'Context');

      await renderProjectsList();

      const container = document.getElementById('app-container');
      const deleteBtn = container.querySelector('.delete-project-btn');
      expect(deleteBtn).toBeTruthy();
    });

    test('should render project cards with data attributes', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');

      await renderProjectsList();

      const container = document.getElementById('app-container');
      const projectCard = container.querySelector(`[data-project-id="${project.id}"]`);
      expect(projectCard).toBeTruthy();
    });

    test('should render updated date for projects', async () => {
      await createProject('Test Project', 'Problems', 'Context');

      await renderProjectsList();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Updated');
    });
  });

  describe('renderNewProjectForm', () => {
    test('should render new project form', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Create New Project');
      expect(container.innerHTML).toContain('Project Title');
    });

    test('should render form fields', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      expect(container.querySelector('#title')).toBeTruthy();
      expect(container.querySelector('#problems')).toBeTruthy();
      expect(container.querySelector('#context')).toBeTruthy();
    });

    test('should render create button', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      const createBtn = container.querySelector('button[type="submit"]');
      expect(createBtn).toBeTruthy();
      expect(createBtn.textContent).toContain('Create Project');
    });

    test('should render cancel button', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      const cancelBtn = container.querySelector('#cancel-btn');
      expect(cancelBtn).toBeTruthy();
      expect(cancelBtn.textContent).toContain('Cancel');
    });

    test('should render back button', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      const backBtn = container.querySelector('#back-btn');
      expect(backBtn).toBeTruthy();
      expect(backBtn.textContent).toContain('Back to Projects');
    });
  });
});
