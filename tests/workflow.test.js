import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Mock fetch for loading prompt templates (uses {{VAR}} double-brace syntax)
global.fetch = async (url) => {
  const templates = {
    'prompts/phase1.md': 'Phase 1 prompt template with {{PROJECT_NAME}} and {{PROBLEM_STATEMENT}} and {{PROPOSED_SOLUTION}} and {{CONTEXT}} and {{KEY_GOALS}} and {{SCOPE_IN_SCOPE}} and {{SCOPE_OUT_OF_SCOPE}} and {{SUCCESS_METRICS}} and {{KEY_STAKEHOLDERS}} and {{TIMELINE_ESTIMATE}} and {{COST_OF_DOING_NOTHING}}',
    'prompts/phase2.md': 'Phase 2 prompt template with {{PHASE1_OUTPUT}}',
    'prompts/phase3.md': 'Phase 3 prompt template with {{PHASE1_OUTPUT}} and {{PHASE2_OUTPUT}}'
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

    test('should advance from last phase to complete state', () => {
      const project = createProject('Test', 'Description');
      project.currentPhase = PHASES.length;
      project.phases[PHASES.length - 1].response = 'Response';

      advancePhase(project);

      expect(project.currentPhase).toBe(PHASES.length + 1);
    });

    test('should not advance beyond complete state', () => {
      const project = createProject('Test', 'Description');
      project.currentPhase = PHASES.length + 1;
      project.phases[PHASES.length - 1].response = 'Response';

      advancePhase(project);

      expect(project.currentPhase).toBe(PHASES.length + 1);
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
    // Note: prompts.js caches templates, so we test behavior not fetch calls

    test('should generate phase 1 prompt with object-style phases', async () => {
      const project = {
        title: 'Test Project',
        problems: 'Test Problems',
        context: 'Test Context',
        phase: 1,
        phases: {
          1: { prompt: '', response: '' },
          2: { prompt: '', response: '' },
          3: { prompt: '', response: '' }
        },
        formData: {
          projectName: 'Test Project',
          problemStatement: 'Test Problems',
          context: 'Test Context'
        }
      };

      const prompt = await generatePromptForPhase(project, 1);

      expect(prompt).toBeTruthy();
      expect(prompt).toContain('Phase 1');
    });

    test('should generate phase 2 prompt using phase 1 response from object-style phases', async () => {
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
      expect(prompt).toContain('Phase 1 content here');
    });

    test('should generate phase 3 prompt using phase 1 and 2 responses from object-style phases', async () => {
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
      expect(prompt).toContain('Phase 1 content');
      expect(prompt).toContain('Phase 2 content');
    });

    test('should generate phase 2 prompt using phase 1 response from array-style phases', async () => {
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
      expect(prompt).toContain('Phase 1 content from array');
    });

    test('should fallback to project.currentPhase when phase not provided', async () => {
      const project = {
        title: 'Test Project',
        currentPhase: 1,
        phases: {
          1: { prompt: '', response: '' }
        },
        formData: { projectName: 'Fallback Test' }
      };

      const prompt = await generatePromptForPhase(project);

      expect(prompt).toBeTruthy();
      // Should generate phase 1 prompt (includes project name)
      expect(prompt).toContain('Fallback Test');
    });

    test('should fallback to project.phase when currentPhase not provided', async () => {
      const project = {
        title: 'Test Project',
        phase: 2,
        phases: {
          1: { response: 'Phase 1 output for fallback' },
          2: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project);

      expect(prompt).toBeTruthy();
      // Should generate phase 2 prompt (includes phase 1 output)
      expect(prompt).toContain('Phase 1 output for fallback');
    });
  });

  describe('Phase 2 and 3 prompt generation with prior phase content', () => {
    let originalFetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      global.fetch = jest.fn((url) => {
        const templates = {
          'prompts/phase1.md': 'Phase 1: {{PROJECT_NAME}} - {{PROBLEM_STATEMENT}}',
          'prompts/phase2.md': 'Phase 2 Review: Previous output was: {{PHASE1_OUTPUT}}',
          'prompts/phase3.md': 'Phase 3 Synthesis: Phase 1: {{PHASE1_OUTPUT}}, Phase 2: {{PHASE2_OUTPUT}}'
        };
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(templates[url] || 'Unknown template')
        });
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('should include phase 1 response in phase 2 prompt', async () => {
      const project = {
        title: 'Test Project',
        phase: 2,
        phases: {
          1: { prompt: 'Phase 1 prompt', response: 'This is the phase 1 output content' },
          2: { prompt: '', response: '' },
          3: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 2);

      // Phase 1 output should be included in phase 2 prompt
      expect(prompt).toContain('This is the phase 1 output content');
      // Template should be loaded (contains "Phase 2" identifier)
      expect(prompt).toContain('Phase 2');
    });

    test('should include both phase 1 and 2 responses in phase 3 prompt', async () => {
      const project = {
        title: 'Test Project',
        phase: 3,
        phases: {
          1: { prompt: 'Phase 1 prompt', response: 'Phase 1 final output' },
          2: { prompt: 'Phase 2 prompt', response: 'Phase 2 review feedback' },
          3: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 3);

      // Both phase outputs should be included
      expect(prompt).toContain('Phase 1 final output');
      expect(prompt).toContain('Phase 2 review feedback');
      // Template should be loaded (contains "Phase 3" identifier)
      expect(prompt).toContain('Phase 3');
    });

    test('should handle missing phase 1 response gracefully in phase 2', async () => {
      const project = {
        title: 'Test Project',
        phase: 2,
        phases: {
          1: { prompt: '', response: '' },
          2: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 2);

      expect(prompt).toContain('[No Phase 1 output yet]');
    });

    test('should handle missing phase responses gracefully in phase 3', async () => {
      const project = {
        title: 'Test Project',
        phase: 3,
        phases: {
          1: { prompt: '', response: '' },
          2: { prompt: '', response: '' },
          3: { prompt: '', response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 3);

      expect(prompt).toContain('[No Phase 1 output yet]');
      expect(prompt).toContain('[No Phase 2 output yet]');
    });
  });

  describe('getPhaseMetadata for all phases', () => {
    test('should return correct metadata for phase 1', () => {
      const meta = getPhaseMetadata(1);

      expect(meta.title).toBe('Initial Draft');
      expect(meta.ai).toBe('Claude');
      expect(meta.icon).toBeTruthy();
      expect(meta.color).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });

    test('should return correct metadata for phase 2', () => {
      const meta = getPhaseMetadata(2);

      expect(meta.title).toBe('Alternative Perspective');
      expect(meta.ai).toBe('Gemini');
      expect(meta.icon).toBeTruthy();
      expect(meta.color).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });

    test('should return correct metadata for phase 3', () => {
      const meta = getPhaseMetadata(3);

      expect(meta.title).toBe('Final Synthesis');
      expect(meta.ai).toBe('Claude');
      expect(meta.icon).toBeTruthy();
      expect(meta.color).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });

    test('should return default metadata for invalid phase (falls back to phase 1)', () => {
      const meta = getPhaseMetadata(99);

      // Falls back to phase 1 metadata
      expect(meta.title).toBe('Initial Draft');
      expect(meta.ai).toBe('Claude');
    });
  });

  describe('exportFinalOnePager', () => {
    let createObjectURLMock;
    let revokeObjectURLMock;
    let clickedAnchor;

    beforeEach(() => {
      createObjectURLMock = jest.fn(() => 'blob:mock-url');
      revokeObjectURLMock = jest.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      clickedAnchor = null;
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const anchor = {
            href: '',
            download: '',
            click: jest.fn(() => { clickedAnchor = anchor; })
          };
          return anchor;
        }
        return document.createElement(tag);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should export phase 3 response when available', () => {
      const project = {
        title: 'My Project',
        phases: {
          1: { response: 'Phase 1 content' },
          2: { response: 'Phase 2 content' },
          3: { response: 'Final synthesized one-pager content' }
        }
      };

      exportFinalOnePager(project);

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickedAnchor).toBeTruthy();
      expect(clickedAnchor.download).toContain('my-project');
      expect(clickedAnchor.download).toContain('one-pager.md');
    });

    test('should fallback to phase 1 response when phase 3 is empty', () => {
      const project = {
        title: 'My Project',
        phases: {
          1: { response: 'Phase 1 content only' },
          2: { response: '' },
          3: { response: '' }
        }
      };

      exportFinalOnePager(project);

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickedAnchor).toBeTruthy();
    });

    test('should use project title/description as fallback when no phases completed', () => {
      const project = {
        title: 'My Fallback Project',
        problems: 'Project problems description',
        phases: {
          1: { response: '' },
          2: { response: '' },
          3: { response: '' }
        }
      };

      exportFinalOnePager(project);

      expect(createObjectURLMock).toHaveBeenCalled();
      // The blob should contain the title as markdown
      const blobCall = createObjectURLMock.mock.calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
    });
  });

  describe('End-to-End Data Flow: Form Input to Prompt Generation', () => {
    let originalFetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      global.fetch = jest.fn((url) => {
        const templates = {
          'prompts/phase1.md': `
# Phase 1: Initial Draft

**Project:** {{PROJECT_NAME}}
**Problem:** {{PROBLEM_STATEMENT}}
**Context:** {{CONTEXT}}
**Solution:** {{PROPOSED_SOLUTION}}
          `,
          'prompts/phase2.md': 'Phase 2: Review of {{PHASE1_OUTPUT}}',
          'prompts/phase3.md': 'Phase 3: {{PHASE1_OUTPUT}} and {{PHASE2_OUTPUT}}'
        };
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(templates[url] || 'Unknown')
        });
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('CRITICAL: User input must appear in Phase 1 prompt (data loss regression test)', async () => {
      // This test prevents the data loss bug from recurring
      // When a user fills out the form and clicks submit, their data MUST appear in the prompt

      const project = {
        title: 'Mobile App Performance Optimization',
        problems: 'App is slow on older devices',
        context: 'Focus on Android, Q1 priority',
        phase: 1,
        phases: { 1: {}, 2: {}, 3: {} },
        // Simulate formData populated correctly by createProject
        formData: {
          projectName: 'Mobile App Performance Optimization',
          problemStatement: 'App is slow on older devices',
          proposedSolution: '',
          context: 'Focus on Android, Q1 priority'
        }
      };

      const prompt = await generatePromptForPhase(project, 1);

      // User's input MUST be in the prompt - this was the bug
      expect(prompt).toContain('Mobile App Performance Optimization');
      expect(prompt).toContain('App is slow on older devices');
      expect(prompt).toContain('Focus on Android, Q1 priority');
    });

    test('should fallback to project fields when formData is empty (legacy project support)', async () => {
      // Simulate a legacy project created with the buggy code that had empty formData
      const legacyProject = {
        title: 'Legacy Project Title',
        name: 'Legacy Project Title',
        problems: 'Legacy problem statement',
        description: 'Legacy problem statement',
        context: 'Legacy context',
        phase: 1,
        phases: { 1: {}, 2: {}, 3: {} },
        // Empty formData like the bug created
        formData: {
          projectName: '',
          problemStatement: '',
          proposedSolution: '',
          context: ''
        }
      };

      const prompt = await generatePromptForPhase(legacyProject, 1);

      // Even with empty formData, should fallback to project.title and project.problems
      expect(prompt).toContain('Legacy Project Title');
      expect(prompt).toContain('Legacy problem statement');
      expect(prompt).toContain('Legacy context');
    });

    test('should handle project with no formData at all', async () => {
      // Edge case: very old project without formData property
      const veryOldProject = {
        title: 'Very Old Project',
        problems: 'Old problem',
        context: 'Old context',
        phase: 1,
        phases: { 1: {}, 2: {}, 3: {} }
        // No formData property at all
      };

      const prompt = await generatePromptForPhase(veryOldProject, 1);

      // Should use title/problems as fallback
      expect(prompt).toContain('Very Old Project');
      expect(prompt).toContain('Old problem');
      expect(prompt).toContain('Old context');
    });
  });

  describe('E2E: Template-Code Sync Validation', () => {
    // These tests read REAL template files to ensure templates contain required placeholders
    // This prevents the bug where code populates a variable but template doesn't use it

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    function readRealTemplate(templateName) {
      const templatePath = path.join(__dirname, '..', 'prompts', templateName);
      return fs.readFileSync(templatePath, 'utf8');
    }

    test('CRITICAL: phase1.md template MUST contain {{CONTEXT}} placeholder', () => {
      // This test would have caught the missing context placeholder bug
      const template = readRealTemplate('phase1.md');
      expect(template).toContain('{{CONTEXT}}');
    });

    test('CRITICAL: phase1.md template MUST contain all required user input placeholders', () => {
      const template = readRealTemplate('phase1.md');

      // These are the fields the user fills out in the form (using {{VAR}} syntax)
      const requiredPlaceholders = [
        '{{PROJECT_NAME}}',
        '{{PROBLEM_STATEMENT}}',
        '{{CONTEXT}}'
      ];

      for (const placeholder of requiredPlaceholders) {
        expect(template).toContain(placeholder);
      }
    });

    test('CRITICAL: phase1.md template MUST contain all formData placeholders', () => {
      const template = readRealTemplate('phase1.md');

      // All placeholders that generatePromptForPhase populates (using {{VAR}} syntax)
      const allPlaceholders = [
        '{{PROJECT_NAME}}',
        '{{PROBLEM_STATEMENT}}',
        '{{PROPOSED_SOLUTION}}',
        '{{KEY_GOALS}}',
        '{{SCOPE_IN_SCOPE}}',
        '{{SCOPE_OUT_OF_SCOPE}}',
        '{{SUCCESS_METRICS}}',
        '{{KEY_STAKEHOLDERS}}',
        '{{TIMELINE_ESTIMATE}}',
        '{{CONTEXT}}'
      ];

      for (const placeholder of allPlaceholders) {
        expect(template).toContain(placeholder);
      }
    });

    test('CRITICAL: phase2.md template MUST contain {{PHASE1_OUTPUT}} placeholder', () => {
      const template = readRealTemplate('phase2.md');
      expect(template).toContain('{{PHASE1_OUTPUT}}');
    });

    test('CRITICAL: phase3.md template MUST contain phase output placeholders', () => {
      const template = readRealTemplate('phase3.md');
      expect(template).toContain('{{PHASE1_OUTPUT}}');
      expect(template).toContain('{{PHASE2_OUTPUT}}');
    });

    test('E2E: User input flows through REAL template to generated prompt', async () => {
      // This test uses the REAL template file, not a mock
      // It verifies the complete data flow from user input to final prompt

      const originalFetch = global.fetch;

      // Use real template
      const realTemplate = readRealTemplate('phase1.md');
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        text: () => Promise.resolve(realTemplate)
      }));

      const project = {
        title: 'E2E Test Project',
        problems: 'E2E Test Problem',
        context: 'E2E Test Context',
        phase: 1,
        phases: { 1: {}, 2: {}, 3: {} },
        formData: {
          projectName: 'E2E Test Project',
          problemStatement: 'E2E Test Problem',
          proposedSolution: '',
          keyGoals: '',
          scopeInScope: '',
          scopeOutOfScope: '',
          successMetrics: '',
          keyStakeholders: '',
          timelineEstimate: '',
          context: 'E2E Test Context'
        }
      };

      const prompt = await generatePromptForPhase(project, 1);

      // ALL user inputs must appear in the generated prompt
      expect(prompt).toContain('E2E Test Project');
      expect(prompt).toContain('E2E Test Problem');
      expect(prompt).toContain('E2E Test Context');

      // Empty fields should be replaced with empty string (not [Not provided])
      // The {{VAR}} syntax just removes the placeholder when value is empty
      expect(prompt).not.toContain('{{');

      global.fetch = originalFetch;
    });
  });
});
