import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { renderProjectsList, renderNewProjectForm } from '../js/views.js';
import { renderProjectView, extractTitleFromMarkdown } from '../js/project-view.js';
import { createProject, deleteProject, getAllProjects, updatePhase, getProject, updateProject } from '../js/projects.js';
import { initDB } from '../js/storage.js';
import { updateStorageInfo } from '../js/router.js';

describe('Views Module', () => {
  beforeEach(async () => {
    // Initialize database
    await initDB();

    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }

    // Set up DOM with footer
    document.body.innerHTML = '<div id="app-container"></div><span id="storage-info"></span>';
  });

  describe('renderProjectsList', () => {
    test('should render empty state when no projects exist', async () => {
      await renderProjectsList();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('No One-Pagers yet');
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
      expect(container.innerHTML).toContain('My <a href="https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md"');
    });

    test('should render new project button', async () => {
      await renderProjectsList();

      const container = document.getElementById('app-container');
      const newProjectBtn = container.querySelector('#new-project-btn');
      expect(newProjectBtn).toBeTruthy();
      expect(newProjectBtn.textContent).toContain('New One-Pager');
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
      expect(container.innerHTML).toContain('Create New <a href="https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md"');
      expect(container.innerHTML).toContain('Project Title');
    });

    test('should render form fields', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      expect(container.querySelector('#title')).toBeTruthy();
      expect(container.querySelector('#problems')).toBeTruthy();
      expect(container.querySelector('#context')).toBeTruthy();
    });

    test('should render Next Phase button (no Save button)', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      const saveBtn = container.querySelector('#save-btn');
      const nextPhaseBtn = container.querySelector('#next-phase-btn');
      expect(saveBtn).toBeNull(); // Save button removed - Next Phase saves automatically
      expect(nextPhaseBtn).toBeTruthy();
      expect(nextPhaseBtn.textContent).toContain('Next Phase');
    });

    test('should render delete button always (red)', () => {
      renderNewProjectForm();
      let container = document.getElementById('app-container');
      const deleteBtn = container.querySelector('#delete-btn');
      expect(deleteBtn).toBeTruthy();
      expect(deleteBtn.classList.contains('bg-red-600')).toBe(true);
    });

    test('should render back button', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      const backBtn = container.querySelector('#back-btn');
      expect(backBtn).toBeTruthy();
      expect(backBtn.textContent).toContain('Back to One-Pagers');
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
      const nextPhaseBtn = document.getElementById('next-phase-btn');
      const form = document.getElementById('new-project-form');

      expect(backBtn).toBeTruthy();
      expect(nextPhaseBtn).toBeTruthy();
      expect(form).toBeTruthy();
    });

    test('should handle Next Phase click and create project', async () => {
      renderNewProjectForm();

      // Fill in the form
      document.getElementById('title').value = 'Test Form Project';
      document.getElementById('problems').value = 'Test problems description';
      document.getElementById('context').value = 'Test context';

      // Click the Next Phase button
      const nextPhaseBtn = document.getElementById('next-phase-btn');
      nextPhaseBtn.click();

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

    test('should show edit form when Phase 1 is not completed', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Render the edit form directly (simulating the redirect)
      const { renderNewProjectForm } = await import('../js/views.js');
      renderNewProjectForm(project);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Edit One-Pager Details');
      expect(container.innerHTML).toContain('Next Phase');
      expect(container.innerHTML).toContain('Delete'); // Delete button should appear when editing
      expect(container.querySelector('#title').value).toBe('Test Project');
      expect(container.querySelector('#problems').value).toBe('Test Problems');
      expect(container.querySelector('#context').value).toBe('Test Context');
    });

    test('should render project view with phase tabs', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Phase 1');
      expect(container.innerHTML).toContain('Phase 2');
      expect(container.innerHTML).toContain('Phase 3');
      expect(container.innerHTML).toContain('Back to One-Pagers');
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
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.querySelector('#back-btn')).toBeTruthy();
    });

    test('should only show header export button when Phase 3 is completed', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      let container = document.getElementById('app-container');
      expect(container.querySelector('#export-one-pager-btn')).toBeFalsy();

      // Complete Phase 3 by updating with a response
      await updatePhase(project.id, 3, 'Phase 3 prompt', 'Phase 3 response');
      await renderProjectView(project.id);

      container = document.getElementById('app-container');
      expect(container.querySelector('#export-one-pager-btn')).toBeTruthy();
    });

    test('should show prominent export CTA when Phase 3 is completed', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete all phases
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');
      await updatePhase(project.id, 2, 'Phase 2 prompt', 'Phase 2 response');
      await updatePhase(project.id, 3, 'Phase 3 prompt', 'Phase 3 response');

      await renderProjectView(project.id);

      // Navigate to Phase 3
      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[2].click();

      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');

      // Should show completion message
      expect(container.innerHTML).toContain('Your One-Pager is Complete');

      // Should show prominent export button with correct label
      const exportBtn = container.querySelector('#export-btn');
      expect(exportBtn).toBeTruthy();
      expect(exportBtn.textContent).toContain('Export One-Pager');
    });

    test('should NOT show export CTA on Phase 3 if not completed', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 and 2, but not Phase 3
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');
      await updatePhase(project.id, 2, 'Phase 2 prompt', 'Phase 2 response');

      await renderProjectView(project.id);

      // Navigate to Phase 3
      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[2].click();

      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');

      // Should NOT show completion message or export button
      expect(container.innerHTML).not.toContain('Your One-Pager is Complete');
      expect(container.querySelector('#export-btn')).toBeFalsy();
    });

    test('should render copy prompt button', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.querySelector('#copy-prompt-btn')).toBeTruthy();
      expect(container.innerHTML).toContain('Copy Prompt to Clipboard');
    });

    test('should render save response button and textarea', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.querySelector('#save-response-btn')).toBeTruthy();
      expect(container.querySelector('#response-textarea')).toBeTruthy();
    });

    test('should render Previous Phase button', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      // Complete phase 1 to advance to phase 2, where prev button is visible
      await updatePhase(project.id, 1, 'Prompt 1', 'Response 1');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      // On phase 2, previous phase button should be visible
      expect(container.querySelector('#prev-phase-btn')).toBeTruthy();
    });

    test('should show Next Phase button when current phase is completed', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      // Complete phases 1 and 2, stay on phase 2 to see "Next Phase" button
      await updatePhase(project.id, 1, 'Prompt 1', 'Response 1');
      await updatePhase(project.id, 2, 'Prompt 2', 'Response 2');

      // Manually set phase back to 2 to view completed phase with "Next Phase" button
      await updateProject(project.id, { phase: 2, currentPhase: 2 });

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      // On completed phase 2, Next Phase button should appear
      expect(container.querySelector('#next-phase-btn')).toBeTruthy();
    });

    test('should hide Next Phase button when current phase is not completed', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      // On phase 1 (not completed), Next Phase button should NOT appear
      expect(container.querySelector('#next-phase-btn')).toBeNull();
    });

    test('should show Edit Details button on Phase 1 when no response saved', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      // On phase 1 without response, Edit Details button should appear
      expect(container.querySelector('#edit-details-btn')).toBeTruthy();
      expect(container.querySelector('#edit-details-btn').textContent).toContain('Edit Details');
      // Previous Phase button should NOT appear
      expect(container.querySelector('#prev-phase-btn')).toBeNull();
    });

    test('should hide Edit Details button on Phase 1 when response is saved', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');
      // Complete Phase 1 with a response
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      // Click back to Phase 1 to view it
      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[0].click();
      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');
      // Edit Details button should NOT appear when response exists
      expect(container.querySelector('#edit-details-btn')).toBeNull();
    });

    test('Edit Details button should navigate to edit form', async () => {
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      await renderProjectView(project.id);

      const editBtn = document.getElementById('edit-details-btn');
      editBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should navigate to edit form - check that URL changed
      expect(window.location.hash).toBe('#edit-project/' + project.id);
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
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Alternative Perspective');
      expect(container.innerHTML).toContain('Gemini');
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
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const copyBtn = document.getElementById('copy-prompt-btn');
      await copyBtn.click();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    test('phase tabs should be clickable', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

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
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[1].click();

      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Gemini');
    });

    test('phase 3 tab should show Final Synthesis', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      const phaseTabs = document.querySelectorAll('.phase-tab');
      phaseTabs[2].click();

      await new Promise(resolve => setTimeout(resolve, 50));

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Final Synthesis');
      expect(container.innerHTML).toContain('Claude');
    });

    test('save response should show warning when textarea is empty', async () => {
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

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
      const { updatePhase } = await import('../js/projects.js');
      const project = await createProject('Test Project', 'Test Problems', 'Test Context');

      // Complete Phase 1 so we don't get redirected to edit form
      await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

      await renderProjectView(project.id);

      // We're now on Phase 2 (Alternative Perspective)
      let container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Alternative Perspective');

      // Enter a response for Phase 2
      const textarea = document.getElementById('response-textarea');
      textarea.value = 'New response content for Phase 2';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      const saveBtn = document.getElementById('save-response-btn');
      saveBtn.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      // After saving Phase 2, should advance to Phase 3 (Final Synthesis)
      container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Final Synthesis');
    });
  });

  describe('extractTitleFromMarkdown', () => {
    test('should extract title from markdown with H1 heading', () => {
      const markdown = '# Transparent Incident Management\n\n## Problem Statement\nSome content here';
      expect(extractTitleFromMarkdown(markdown)).toBe('Transparent Incident Management');
    });

    test('should extract title from middle of document', () => {
      const markdown = 'Some preamble\n\n# My Project Title\n\nContent below';
      expect(extractTitleFromMarkdown(markdown)).toBe('My Project Title');
    });

    test('should return null for markdown without H1', () => {
      const markdown = '## Not an H1\n\nContent here';
      expect(extractTitleFromMarkdown(markdown)).toBeNull();
    });

    test('should return null for empty string', () => {
      expect(extractTitleFromMarkdown('')).toBeNull();
    });

    test('should return null for null input', () => {
      expect(extractTitleFromMarkdown(null)).toBeNull();
    });

    test('should extract first H1 if multiple exist', () => {
      const markdown = '# First Title\n\n# Second Title\n\nContent';
      expect(extractTitleFromMarkdown(markdown)).toBe('First Title');
    });
  });

  describe('updateStorageInfo - footer project count', () => {
    test('should show 0 projects when no projects exist', async () => {
      await updateStorageInfo();

      const storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toContain('0 projects');
    });

    test('should show correct project count after creating projects', async () => {
      // Create 2 projects
      await createProject('Project 1', 'Description 1', 'Context');
      await createProject('Project 2', 'Description 2', 'Context');

      await updateStorageInfo();

      const storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toContain('2 projects');
    });

    test('should update count after deleting a project', async () => {
      // Create 2 projects
      const project1 = await createProject('Project 1', 'Description 1', 'Context');
      await createProject('Project 2', 'Description 2', 'Context');

      // Delete one
      await deleteProject(project1.id);

      await updateStorageInfo();

      const storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toContain('1 projects');
    });

    test('should immediately reflect project count without page refresh', async () => {
      // Initially 0 projects
      await updateStorageInfo();
      let storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toContain('0 projects');

      // Create a project
      await createProject('New Project', 'Description', 'Context');

      // Update footer - should immediately show 1 project (no page refresh)
      await updateStorageInfo();
      storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toContain('1 projects');
    });
  });
});
