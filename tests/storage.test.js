import { describe, test, expect, beforeEach } from '@jest/globals';
import { initDB, saveProject, getProject, getAllProjects, deleteProject, generateId } from '../js/storage.js';
import storage from '../js/storage.js';

describe('Storage Module', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await initDB();
  });

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    test('should generate IDs with correct format', () => {
      const id = generateId();
      // Accept either UUID format (crypto.randomUUID) or fallback format (timestamp-random)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      const fallbackPattern = /^\d+-[a-z0-9]+$/;
      expect(id).toMatch(new RegExp(`${uuidPattern.source}|${fallbackPattern.source}`));
    });
  });

  describe('saveProject and getProject', () => {
    test('should save and retrieve a project', async () => {
      const project = {
        id: generateId(),
        name: 'Test Project',
        description: 'Test Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project);
      const retrieved = await getProject(project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
      expect(retrieved.name).toBe(project.name);
      expect(retrieved.description).toBe(project.description);
    });

    test('should update modified timestamp on save', async () => {
      const project = {
        id: generateId(),
        name: 'Test Project',
        description: 'Test Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project);
      const originalModified = project.modified;

      // Wait a bit and save again
      await new Promise(resolve => setTimeout(resolve, 10));
      await saveProject(project);
      const updated = await getProject(project.id);

      expect(updated.modified).toBeGreaterThan(originalModified);
    });
  });

  describe('getAllProjects', () => {
    test('should return empty array when no projects exist', async () => {
      const projects = await getAllProjects();
      expect(Array.isArray(projects)).toBe(true);
    });

    test('should return all saved projects', async () => {
      const project1 = {
        id: generateId(),
        name: 'Project 1',
        description: 'Description 1',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      const project2 = {
        id: generateId(),
        name: 'Project 2',
        description: 'Description 2',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project1);
      await saveProject(project2);

      const projects = await getAllProjects();
      expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    test('should sort projects by modified date (newest first)', async () => {
      const now = Date.now();
      const project1 = {
        id: generateId(),
        name: 'Old Project',
        description: 'Description',
        created: now - 2000,
        modified: now - 2000,
        currentPhase: 1,
        phases: []
      };

      await saveProject(project1);

      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      const project2 = {
        id: generateId(),
        name: 'New Project',
        description: 'Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project2);

      const projects = await getAllProjects();
      const project2Index = projects.findIndex(p => p.id === project2.id);
      const project1Index = projects.findIndex(p => p.id === project1.id);

      expect(project2Index).toBeLessThan(project1Index);
    });
  });

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const project = {
        id: generateId(),
        name: 'Test Project',
        description: 'Test Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project);
      await deleteProject(project.id);
      const retrieved = await getProject(project.id);

      expect(retrieved).toBeUndefined();
    });
  });

  describe('Prompts', () => {
    test('should save and retrieve a prompt', async () => {
      await storage.savePrompt(1, 'Test prompt content');
      const prompt = await storage.getPrompt(1);

      expect(prompt).toBe('Test prompt content');
    });

    test('should return null for non-existent prompt', async () => {
      const prompt = await storage.getPrompt(999);

      expect(prompt).toBeNull();
    });

    test('should update existing prompt', async () => {
      await storage.savePrompt(1, 'Original content');
      await storage.savePrompt(1, 'Updated content');
      const prompt = await storage.getPrompt(1);

      expect(prompt).toBe('Updated content');
    });
  });

  describe('Settings', () => {
    test('should save and retrieve a setting', async () => {
      await storage.saveSetting('theme', 'dark');
      const setting = await storage.getSetting('theme');

      expect(setting).toBe('dark');
    });

    test('should return undefined for non-existent setting', async () => {
      const setting = await storage.getSetting('non-existent');

      expect(setting).toBeUndefined();
    });

    test('should update existing setting', async () => {
      await storage.saveSetting('theme', 'light');
      await storage.saveSetting('theme', 'dark');
      const setting = await storage.getSetting('theme');

      expect(setting).toBe('dark');
    });
  });

  describe('Storage Estimate', () => {
    test('should return storage estimate or null', async () => {
      const estimate = await storage.getStorageEstimate();

      // In test environment, navigator.storage may not be available
      expect(estimate === null || typeof estimate === 'object').toBe(true);
    });
  });
});
