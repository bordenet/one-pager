import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  createProject,
  getAllProjects,
  getProject,
  updatePhase,
  updateProject,
  deleteProject,
  exportProject,
  exportAllProjects,
  importProjects
} from '../js/projects.js';
import { initDB } from '../js/storage.js';
import storage from '../js/storage.js';

describe('Projects Module', () => {
  beforeEach(async () => {
    // Reinitialize the database for each test to ensure isolation
    await initDB();

    // Clear all projects from the database
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }
  });

  describe('createProject', () => {
    test('should create a new project with all required fields', async () => {
      const project = await createProject('Test Project', 'Test problems', 'Test context');

      expect(project.id).toBeTruthy();
      expect(project.title).toBe('Test Project');
      expect(project.problems).toBe('Test problems');
      expect(project.context).toBe('Test context');
      expect(project.phase).toBe(1);
      expect(project.createdAt).toBeTruthy();
      expect(project.updatedAt).toBeTruthy();
    });

    test('should initialize phases correctly', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      expect(project.phases).toBeTruthy();
      expect(project.phases[1]).toEqual({ prompt: '', response: '', completed: false });
      expect(project.phases[2]).toEqual({ prompt: '', response: '', completed: false });
      expect(project.phases[3]).toEqual({ prompt: '', response: '', completed: false });
    });

    test('should include legacy fields for backward compatibility', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      expect(project.name).toBe('Test');
      expect(project.description).toBe('Problems');
      expect(project.currentPhase).toBe(1);
      expect(project.created).toBeTruthy();
      expect(project.modified).toBeTruthy();
      expect(project.formData).toBeTruthy();
    });

    test('should populate formData with input values for prompt generation', async () => {
      const project = await createProject('My Project Title', 'The main problem to solve', 'Additional context here');

      // Critical: formData must contain the input values for Phase 1 prompt generation
      expect(project.formData.projectName).toBe('My Project Title');
      expect(project.formData.problemStatement).toBe('The main problem to solve');
      expect(project.formData.context).toBe('Additional context here');
    });

    test('should NOT initialize formData with empty strings (data loss bug)', async () => {
      const project = await createProject('Test Project', 'Test Problem', 'Test Context');

      // Regression test: formData should never be empty when inputs are provided
      expect(project.formData.projectName).not.toBe('');
      expect(project.formData.problemStatement).not.toBe('');
    });

    test('should trim whitespace from inputs', async () => {
      const project = await createProject('  Test  ', '  Problems  ', '  Context  ');

      expect(project.title).toBe('Test');
      expect(project.problems).toBe('Problems');
      expect(project.context).toBe('Context');
    });

    test('should save project to storage', async () => {
      const project = await createProject('Test', 'Problems', 'Context');
      const retrieved = await storage.getProject(project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
    });
  });

  describe('getAllProjects', () => {
    test('should return empty array when no projects exist', async () => {
      const projects = await getAllProjects();
      expect(projects).toEqual([]);
    });

    test('should return all projects', async () => {
      await createProject('Project 1', 'Problems 1', 'Context 1');
      await createProject('Project 2', 'Problems 2', 'Context 2');

      const projects = await getAllProjects();
      expect(projects.length).toBe(2);
    });
  });

  describe('getProject', () => {
    test('should retrieve a project by id', async () => {
      const created = await createProject('Test', 'Problems', 'Context');
      const retrieved = await getProject(created.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe('Test');
    });

    test('should return undefined for non-existent project', async () => {
      const project = await getProject('non-existent-id');
      expect(project).toBeUndefined();
    });
  });

  describe('updatePhase', () => {
    test('should update phase data', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      const updated = await updatePhase(project.id, 1, 'Test prompt', 'Test response');

      expect(updated.phases[1].prompt).toBe('Test prompt');
      expect(updated.phases[1].response).toBe('Test response');
      expect(updated.phases[1].completed).toBe(true);
    });

    test('should auto-advance to next phase when response is provided', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      const updated = await updatePhase(project.id, 1, 'Prompt', 'Response');

      expect(updated.phase).toBe(2);
      expect(updated.currentPhase).toBe(2);
    });

    test('should not advance past phase 3', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      // Advance through phases 1 and 2
      await updatePhase(project.id, 1, 'Prompt 1', 'Response 1');
      await updatePhase(project.id, 2, 'Prompt 2', 'Response 2');

      // Complete phase 3 - should not advance beyond
      const updated = await updatePhase(project.id, 3, 'Prompt 3', 'Response 3');

      expect(updated.phase).toBe(3);
    });

    test('should not advance if no response provided', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      const updated = await updatePhase(project.id, 1, 'Prompt', '');

      expect(updated.phase).toBe(1);
      expect(updated.phases[1].completed).toBe(false);
    });

    test('should throw error for non-existent project', async () => {
      await expect(updatePhase('non-existent', 1, 'Prompt', 'Response'))
        .rejects.toThrow('Project not found');
    });
  });

  describe('updateProject', () => {
    test('should update project metadata', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      const updated = await updateProject(project.id, { title: 'Updated Title' });

      expect(updated.title).toBe('Updated Title');
    });

    test('should throw error for non-existent project', async () => {
      await expect(updateProject('non-existent', { title: 'New' }))
        .rejects.toThrow('Project not found');
    });
  });

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      await deleteProject(project.id);

      const retrieved = await getProject(project.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('exportProject', () => {
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    test('should export project as JSON file', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');

      const clickSpy = jest.fn();
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy
          };
        }
        return document.createElement.wrappedMethod(tag);
      });
      document.createElement.wrappedMethod = Object.getPrototypeOf(document).createElement;

      await exportProject(project.id);

      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('should throw error for non-existent project', async () => {
      await expect(exportProject('non-existent'))
        .rejects.toThrow('Project not found');
    });
  });

  describe('exportAllProjects', () => {
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    test('should export all projects as backup JSON', async () => {
      await createProject('Project 1', 'Problems 1', 'Context 1');
      await createProject('Project 2', 'Problems 2', 'Context 2');

      const clickSpy = jest.fn();
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy
          };
        }
        return document.createElement.wrappedMethod(tag);
      });
      document.createElement.wrappedMethod = Object.getPrototypeOf(document).createElement;

      await exportAllProjects();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('importProjects', () => {
    test('should import backup file format', async () => {
      const backupContent = {
        version: '1.0',
        projects: [
          { id: '1', title: 'Project 1', problems: 'P1', context: 'C1', phase: 1, phases: {} },
          { id: '2', title: 'Project 2', problems: 'P2', context: 'C2', phase: 1, phases: {} }
        ]
      };

      const file = new File([JSON.stringify(backupContent)], 'backup.json', { type: 'application/json' });

      const imported = await importProjects(file);

      expect(imported).toBe(2);
      const projects = await getAllProjects();
      expect(projects.length).toBe(2);
    });

    test('should import single project format', async () => {
      const projectContent = {
        id: '1',
        title: 'Single Project',
        problems: 'Problems',
        context: 'Context',
        phase: 1,
        phases: {}
      };

      const file = new File([JSON.stringify(projectContent)], 'project.json', { type: 'application/json' });

      const imported = await importProjects(file);

      expect(imported).toBe(1);
      const project = await getProject('1');
      expect(project.title).toBe('Single Project');
    });

    test('should reject invalid file format', async () => {
      const invalidContent = { invalid: 'data' };
      const file = new File([JSON.stringify(invalidContent)], 'invalid.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow('Invalid file format');
    });

    test('should reject invalid JSON', async () => {
      const file = new File(['not valid json'], 'invalid.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow();
    });
  });

  describe('End-to-End Data Flow', () => {
    test('should preserve user input from form through to prompt generation', async () => {
      // Simulate user filling out the new project form
      const userTitle = 'Mobile App Performance Optimization';
      const userProblems = 'App is slow on older devices, causing user churn';
      const userContext = 'Focus on Android devices, Q1 priority';

      // Step 1: Create project (simulates form submission)
      const project = await createProject(userTitle, userProblems, userContext);

      // Step 2: Verify data is stored correctly in project
      expect(project.title).toBe(userTitle);
      expect(project.problems).toBe(userProblems);
      expect(project.context).toBe(userContext);

      // Step 3: Verify formData is populated for prompt generation
      expect(project.formData.projectName).toBe(userTitle);
      expect(project.formData.problemStatement).toBe(userProblems);
      expect(project.formData.context).toBe(userContext);

      // Step 4: Retrieve project and verify data persists
      const retrieved = await getProject(project.id);
      expect(retrieved.formData.projectName).toBe(userTitle);
      expect(retrieved.formData.problemStatement).toBe(userProblems);
      expect(retrieved.formData.context).toBe(userContext);
    });

    test('should handle legacy projects with empty formData gracefully', async () => {
      // Simulate a legacy project that was created with the old buggy code
      const legacyProject = {
        id: 'legacy-project-id',
        title: 'Legacy Project',
        problems: 'Legacy problems',
        context: 'Legacy context',
        phase: 1,
        phases: { 1: {}, 2: {}, 3: {} },
        formData: {
          projectName: '',
          problemStatement: '',
          proposedSolution: '',
          keyGoals: '',
          scopeInScope: '',
          scopeOutOfScope: '',
          successMetrics: '',
          keyStakeholders: '',
          timelineEstimate: ''
        }
      };

      // Save the legacy project
      await storage.saveProject(legacyProject);

      // Retrieve and verify it exists
      const retrieved = await getProject(legacyProject.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved.title).toBe('Legacy Project');

      // The workflow module should handle this gracefully (fallback to title/problems)
      // This test ensures we don't break backward compatibility
    });
  });
});
