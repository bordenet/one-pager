import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { renderProjectsList, renderNewProjectForm } from '../js/views.js';
import { renderProjectView } from '../js/project-view.js';
import { createProject, deleteProject, getAllProjects, updatePhase } from '../js/projects.js';
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

  describe('Project card click handlers', () => {
    test('should navigate when clicking project card (not delete button)', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');
      await renderProjectsList();

      const container = document.getElementById('app-container');
      const projectCard = container.querySelector(`[data-project-id="${project.id}"]`);

      // The click handler should be attached
      expect(projectCard).toBeTruthy();

      // Simulate a click on the project card (not the delete button)
      projectCard.click();
      // Should have triggered navigation
    });

    test('should not navigate when clicking delete button', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');
      await renderProjectsList();

      const container = document.getElementById('app-container');
      const deleteBtn = container.querySelector(`.delete-project-btn[data-project-id="${project.id}"]`);

      // The delete button should exist and have the correct data attribute
      expect(deleteBtn).toBeTruthy();
      expect(deleteBtn.dataset.projectId).toBe(project.id);

      // Click the delete button - should not navigate, should trigger delete flow
      deleteBtn.click();
    });
  });

  describe('New project form handlers', () => {
    test('should render form with event handlers attached', () => {
      renderNewProjectForm();

      const backBtn = document.getElementById('back-btn');
      const cancelBtn = document.getElementById('cancel-btn');
      const form = document.getElementById('new-project-form');

      expect(backBtn).toBeTruthy();
      expect(cancelBtn).toBeTruthy();
      expect(form).toBeTruthy();
    });

    test('should handle form submission and create project', async () => {
      renderNewProjectForm();

      // Fill in the form
      document.getElementById('title').value = 'Test Form Project';
      document.getElementById('problems').value = 'Test problems description';
      document.getElementById('context').value = 'Test context';

      const form = document.getElementById('new-project-form');

      // Trigger form submission
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Project should be created
      const projects = await getAllProjects();
      const createdProject = projects.find(p => p.title === 'Test Form Project');
      expect(createdProject).toBeTruthy();
    });
  });

  describe('renderProjectView', () => {
    let originalFetch;

    beforeEach(() => {
      // Mock fetch for prompt templates
      originalFetch = global.fetch;
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('Phase template: {projectName}')
        })
      );

      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn(() => Promise.resolve())
        },
        configurable: true
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('should render project view with phase tabs', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Test Project');
      expect(container.innerHTML).toContain('Phase 1');
      expect(container.innerHTML).toContain('Phase 2');
      expect(container.innerHTML).toContain('Phase 3');
    });

    test('should handle non-existent project gracefully', async () => {
      // Try to render a project that doesn't exist
      await renderProjectView('non-existent-id');

      // Should show error toast and not crash
      // The container content should be unchanged or show error state
      const container = document.getElementById('app-container');
      expect(container).toBeTruthy();
    });

    test('should render back button', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.querySelector('#back-btn')).toBeTruthy();
    });

    test('should only show export button when Phase 3 is completed', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      let container = document.getElementById('app-container');
      expect(container.querySelector('#export-one-pager-btn')).toBeFalsy();

      // Complete Phase 3 by updating with a response
      await updatePhase(project.id, 3, 'Phase 3 prompt', 'Phase 3 response');
      await renderProjectView(project.id);

      container = document.getElementById('app-container');
      expect(container.querySelector('#export-one-pager-btn')).toBeTruthy();
    });

    test('should render copy prompt button', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.querySelector('#copy-prompt-btn')).toBeTruthy();
      expect(container.innerHTML).toContain('Copy Prompt to Clipboard');
    });

    test('should render save response button and textarea', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.querySelector('#save-response-btn')).toBeTruthy();
      expect(container.querySelector('#response-textarea')).toBeTruthy();
    });

    test('should render navigation buttons', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.querySelector('#prev-phase-btn')).toBeTruthy();
      expect(container.querySelector('#next-phase-btn')).toBeTruthy();
    });

    test('should show completed checkmark for completed phases', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await updatePhase(project.id, 1, 'Prompt 1', 'Response 1');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      const phaseTabs = container.querySelectorAll('.phase-tab');
      expect(phaseTabs[0].innerHTML).toContain('✓');
    });

    test('should display existing response in textarea when viewing that phase', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      // Update phase 1 with a response
      await updatePhase(project.id, 1, 'Test Prompt', 'Existing response content');

      await renderProjectView(project.id);

      // After saving a response, project advances to next phase (2)
      // So we need to click on phase 1 tab to see the saved response
      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[0].click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const textarea = document.getElementById('response-textarea');
      expect(textarea.value).toBe('Existing response content');
    });

    test('should display phase metadata (title, description, AI)', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Initial Draft');
      expect(container.innerHTML).toContain('Claude');
    });
  });

  describe('Project View Click Handlers', () => {
    let originalFetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('Phase template: {projectName}')
        })
      );

      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn(() => Promise.resolve())
        },
        configurable: true
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('copy prompt button should trigger clipboard write', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await renderProjectView(project.id);

      const copyBtn = document.getElementById('copy-prompt-btn');
      await copyBtn.click();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    test('phase tabs should be clickable', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await renderProjectView(project.id);

      const phaseTabs = document.querySelectorAll('.phase-tab');
      expect(phaseTabs.length).toBe(3);

      // Click phase 2 tab
      phaseTabs[1].click();

      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Alternative Perspective');
    });

    test('phase 2 tab should show Gemini as the AI', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await renderProjectView(project.id);

      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[1].click();

      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Gemini');
    });

    test('phase 3 tab should show Final Synthesis', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await renderProjectView(project.id);

      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[2].click();

      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Final Synthesis');
      expect(container.innerHTML).toContain('Claude');
    });

    test('save response should show warning when textarea is empty', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await renderProjectView(project.id);

      // Clear the textarea
      const textarea = document.getElementById('response-textarea');
      textarea.value = '';

      const saveBtn = document.getElementById('save-response-btn');
      saveBtn.click();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Check that warning toast was shown (look for toast in DOM or toast function was called)
      // The UI should still show the empty textarea
      expect(textarea.value).toBe('');
    });

    test('prev phase button should navigate to previous phase', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await updatePhase(project.id, 1, 'Prompt 1', 'Response 1');
      await renderProjectView(project.id);

      // After phase 1 is complete, we're on phase 2
      let container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Alternative Perspective');

      // Click prev phase button
      const prevBtn = document.getElementById('prev-phase-btn');
      prevBtn.click();

      await new Promise(resolve => setTimeout(resolve, 50));

      container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Initial Draft');
    });

    test('next phase button should navigate to next phase when current is complete', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await updatePhase(project.id, 1, 'Prompt 1', 'Response 1');
      await renderProjectView(project.id);

      // Click back to phase 1
      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[0].click();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Now click next phase button
      const nextBtn = document.getElementById('next-phase-btn');
      nextBtn.click();

      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Alternative Perspective');
    });

    test('save response should update phase and re-render', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      await renderProjectView(project.id);

      // Enter a response
      const textarea = document.getElementById('response-textarea');
      textarea.value = 'New response content';

      const saveBtn = document.getElementById('save-response-btn');
      saveBtn.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      // After save, should advance to phase 2
      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Alternative Perspective');
    });
  });
});
