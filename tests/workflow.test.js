import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  createProject,
  generatePrompt,
  generatePromptForPhase,
  validatePhase,
  advancePhase,
  isProjectComplete,
  getCurrentPhase,
  updatePhaseResponse,
  updateFormData,
  getProgress,
  getPhaseMetadata,
  exportFinalOnePager,
  PHASES
} from '../js/workflow.js';

// Mock fetch for loading prompt templates
global.fetch = async (url) => {
  const templates = {
    'prompts/phase1.md': 'Phase 1 prompt template with {projectName} and {problemStatement} and {proposedSolution}',
    'prompts/phase2.md': 'Phase 2 prompt template with {phase1Output}',
    'prompts/phase3.md': 'Phase 3 prompt template with {phase1Output} and {phase2Output}'
  };

  return {
    ok: true,
    text: async () => templates[url] || 'Default template'
  };
};

describe('Workflow Module', () => {
  describe('createProject', () => {
    test('should create a new project with correct structure', () => {
      const project = createProject('Test Project', 'Test Description');

      expect(project).toBeTruthy();
      expect(project.id).toBeTruthy();
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('Test Description');
      expect(project.currentPhase).toBe(1);
      expect(project.phases).toHaveLength(3); // 3 phases for one-pager
      expect(project.formData).toBeTruthy();
    });

    test('should initialize all phases as incomplete', () => {
      const project = createProject('Test', 'Description');

      project.phases.forEach(phase => {
        expect(phase.completed).toBe(false);
        expect(phase.prompt).toBe('');
        expect(phase.response).toBe('');
      });
    });

    test('should initialize form data with empty fields', () => {
      const project = createProject('Test', 'Description');

      expect(project.formData.projectName).toBe('');
      expect(project.formData.problemStatement).toBe('');
      expect(project.formData.proposedSolution).toBe('');
    });
  });

  describe('generatePrompt', () => {
    test('should generate prompt for phase 1 with form data', async () => {
      const project = createProject('Test Project', 'Test Description');
      updateFormData(project, {
        projectName: 'My Project',
        problemStatement: 'The problem',
        proposedSolution: 'The solution'
      });

      const prompt = await generatePrompt(project);

      expect(prompt).toContain('My Project');
      expect(prompt).toContain('The problem');
      expect(prompt).toContain('The solution');
    });

    test('should generate prompt for phase 2 with phase 1 response', async () => {
      const project = createProject('Test Project', 'Test Description');
      project.phases[0].response = 'Phase 1 response';
      project.phases[0].completed = true;
      project.currentPhase = 2;

      const prompt = await generatePrompt(project);

      expect(prompt).toContain('Phase 1 response');
    });

    test('should generate prompt for phase 3 with both responses', async () => {
      const project = createProject('Test Project', 'Test Description');
      project.phases[0].response = 'Phase 1 response';
      project.phases[1].response = 'Phase 2 response';
      project.phases[0].completed = true;
      project.phases[1].completed = true;
      project.currentPhase = 3;

      const prompt = await generatePrompt(project);

      expect(prompt).toContain('Phase 1 response');
      expect(prompt).toContain('Phase 2 response');
    });
  });

  describe('validatePhase', () => {
    test('should fail validation for phase 1 when required fields are empty', () => {
      const project = createProject('Test', 'Description');
      const result = validatePhase(project);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should fail validation for phase 1 when response is empty', () => {
      const project = createProject('Test', 'Description');
      updateFormData(project, {
        projectName: 'Test',
        problemStatement: 'Problem',
        proposedSolution: 'Solution'
      });

      const result = validatePhase(project);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('response');
    });

    test('should pass validation when all required data is provided', () => {
      const project = createProject('Test', 'Description');
      updateFormData(project, {
        projectName: 'Test',
        problemStatement: 'Problem',
        proposedSolution: 'Solution'
      });
      project.phases[0].response = 'Some response';

      const result = validatePhase(project);

      expect(result.valid).toBe(true);
    });
  });

  describe('advancePhase', () => {
    test('should mark current phase as completed', () => {
      const project = createProject('Test', 'Description');
      project.phases[0].response = 'Response';

      advancePhase(project);

      expect(project.phases[0].completed).toBe(true);
    });

    test('should advance to next phase', () => {
      const project = createProject('Test', 'Description');
      project.phases[0].response = 'Response';

      advancePhase(project);

      expect(project.currentPhase).toBe(2);
    });

    test('should not advance beyond last phase', () => {
      const project = createProject('Test', 'Description');
      project.currentPhase = PHASES.length;
      project.phases[PHASES.length - 1].response = 'Response';

      advancePhase(project);

      expect(project.currentPhase).toBe(PHASES.length);
    });
  });

  describe('isProjectComplete', () => {
    test('should return false for new project', () => {
      const project = createProject('Test', 'Description');

      expect(isProjectComplete(project)).toBe(false);
    });

    test('should return true when all phases are completed', () => {
      const project = createProject('Test', 'Description');
      project.phases.forEach(phase => {
        phase.completed = true;
      });

      expect(isProjectComplete(project)).toBe(true);
    });
  });

  describe('getCurrentPhase', () => {
    test('should return current phase object', () => {
      const project = createProject('Test', 'Description');
      const currentPhase = getCurrentPhase(project);

      expect(currentPhase).toBeTruthy();
      expect(currentPhase.number).toBe(1);
    });
  });

  describe('updatePhaseResponse', () => {
    test('should update current phase response', () => {
      const project = createProject('Test', 'Description');
      updatePhaseResponse(project, 'New response');

      expect(project.phases[0].response).toBe('New response');
    });
  });

  describe('getProgress', () => {
    test('should return 0% for new project', () => {
      const project = createProject('Test', 'Description');

      expect(getProgress(project)).toBe(0);
    });

    test('should return 33% when one phase is complete', () => {
      const project = createProject('Test', 'Description');
      project.phases[0].completed = true;

      expect(getProgress(project)).toBe(33);
    });

    test('should return 67% when two phases are complete', () => {
      const project = createProject('Test', 'Description');
      project.phases[0].completed = true;
      project.phases[1].completed = true;

      expect(getProgress(project)).toBe(67);
    });

    test('should return 100% when all phases are complete', () => {
      const project = createProject('Test', 'Description');
      project.phases.forEach(phase => {
        phase.completed = true;
      });

      expect(getProgress(project)).toBe(100);
    });
  });

  describe('getPhaseMetadata', () => {
    test('should return metadata for phase 1', () => {
      const metadata = getPhaseMetadata(1);

      expect(metadata.title).toBe('Initial Draft');
      expect(metadata.ai).toBe('Claude');
      expect(metadata.icon).toBe('📝');
      expect(metadata.color).toBe('blue');
    });

    test('should return metadata for phase 2', () => {
      const metadata = getPhaseMetadata(2);

      expect(metadata.title).toBe('Alternative Perspective');
      expect(metadata.ai).toBe('Gemini');
      expect(metadata.icon).toBe('🔄');
      expect(metadata.color).toBe('green');
    });

    test('should return metadata for phase 3', () => {
      const metadata = getPhaseMetadata(3);

      expect(metadata.title).toBe('Final Synthesis');
      expect(metadata.ai).toBe('Claude');
      expect(metadata.icon).toBe('✨');
      expect(metadata.color).toBe('purple');
    });

    test('should return phase 1 metadata for invalid phase number', () => {
      const metadata = getPhaseMetadata(999);

      expect(metadata.title).toBe('Initial Draft');
    });
  });

  describe('exportFinalOnePager', () => {
    let mockCreateElement;
    let createdAnchor;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;

    beforeEach(() => {
      createdAnchor = { click: jest.fn(), href: '', download: '' };
      mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(createdAnchor);
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
      URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      mockCreateElement.mockRestore();
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    test('should export phase 3 response when available', () => {
      const project = {
        title: 'Test Project',
        name: 'Test',
        phases: {
          1: { response: 'Phase 1 content' },
          3: { response: 'Phase 3 final content' }
        }
      };

      exportFinalOnePager(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(createdAnchor.click).toHaveBeenCalled();
    });

    test('should fallback to phase 1 response when phase 3 is not available', () => {
      const project = {
        title: 'Test Project',
        name: 'Test',
        phases: {
          1: { response: 'Phase 1 content' }
        }
      };

      exportFinalOnePager(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(createdAnchor.click).toHaveBeenCalled();
    });

    test('should handle legacy format with array phases', () => {
      const project = {
        title: 'Test Project',
        name: 'Test',
        phases: [
          { response: '' },
          { response: '' },
          { response: 'Legacy phase 3 content' }
        ]
      };

      exportFinalOnePager(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    test('should generate fallback content when no responses exist', () => {
      const project = {
        title: 'Test Project',
        name: 'Test',
        problems: 'Test problems',
        phases: {}
      };

      exportFinalOnePager(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    test('should sanitize filename', () => {
      const project = {
        title: 'Test Project With Special Ch@rs!',
        phases: { 3: { response: 'Content' } }
      };

      exportFinalOnePager(project);

      expect(createdAnchor.download).toContain('test-project-with-special-ch-rs-');
      expect(createdAnchor.download).toContain('-one-pager.md');
    });
  });

  describe('generatePromptForPhase', () => {
    let originalFetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Template for phase {phase1Output} {phase2Output} {projectName} {problemStatement} {context}')
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('should generate phase 1 prompt with object-style phases', async () => {
      const { generatePromptForPhase } = await import('../js/workflow.js');
      const project = {
        title: 'Test Project',
        problems: 'Test Problems',
        context: 'Test Context',
        phase: 1,
        phases: {
          1: { prompt: '', response: '' },
          2: { prompt: '', response: '' },
          3: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 1);

      expect(prompt).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith('prompts/phase1.md');
    });

    test('should generate phase 2 prompt using phase 1 response from object-style phases', async () => {
      const { generatePromptForPhase } = await import('../js/workflow.js');
      const project = {
        title: 'Test Project',
        phase: 2,
        phases: {
          1: { prompt: '', response: 'Phase 1 content here' },
          2: { prompt: '', response: '' },
          3: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 2);

      expect(prompt).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith('prompts/phase2.md');
    });

    test('should generate phase 3 prompt using phase 1 and 2 responses from object-style phases', async () => {
      const { generatePromptForPhase } = await import('../js/workflow.js');
      const project = {
        title: 'Test Project',
        phase: 3,
        phases: {
          1: { prompt: '', response: 'Phase 1 content' },
          2: { prompt: '', response: 'Phase 2 content' },
          3: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 3);

      expect(prompt).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith('prompts/phase3.md');
    });

    test('should generate phase 2 prompt using phase 1 response from array-style phases', async () => {
      const { generatePromptForPhase } = await import('../js/workflow.js');
      const project = {
        name: 'Test Project',
        currentPhase: 2,
        phases: [
          { response: 'Phase 1 content from array' },
          { response: '' },
          { response: '' }
        ]
      };

      const prompt = await generatePromptForPhase(project, 2);

      expect(prompt).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith('prompts/phase2.md');
    });

    test('should fallback to project.currentPhase when phase not provided', async () => {
      const { generatePromptForPhase } = await import('../js/workflow.js');
      const project = {
        title: 'Test Project',
        currentPhase: 1,
        phases: {
          1: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project);

      expect(prompt).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith('prompts/phase1.md');
    });

    test('should fallback to project.phase when currentPhase not provided', async () => {
      const { generatePromptForPhase } = await import('../js/workflow.js');
      const project = {
        title: 'Test Project',
        phase: 2,
        phases: {
          1: { response: 'Phase 1 output' },
          2: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project);

      expect(prompt).toBeTruthy();
      expect(global.fetch).toHaveBeenCalledWith('prompts/phase2.md');
    });
  });
});
