/**
 * Tests for prompts.js module
 *
 * Tests workflow configuration and prompt generation.
 */

import {
  WORKFLOW_CONFIG,
  getPhaseMetadata,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  preloadPromptTemplates,
  replaceTemplateVars
} from '../../shared/js/prompts.js';

describe('WORKFLOW_CONFIG', () => {
  test('should have 3 phases', () => {
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
  });

  test('should have correct phase structure', () => {
    expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(phase.name).toBeDefined();
      expect(phase.icon).toBeDefined();
      expect(phase.aiModel).toBeDefined();
      expect(phase.description).toBeDefined();
    });
  });

  test('phase 1 should use Claude', () => {
    expect(WORKFLOW_CONFIG.phases[0].aiModel).toBe('Claude');
  });

  test('phase 2 should use Gemini', () => {
    expect(WORKFLOW_CONFIG.phases[1].aiModel).toBe('Gemini');
  });

  test('phase 3 should use Claude', () => {
    expect(WORKFLOW_CONFIG.phases[2].aiModel).toBe('Claude');
  });
});

describe('getPhaseMetadata', () => {
  test('should return metadata for valid phase', () => {
    const phase1 = getPhaseMetadata(1);
    expect(phase1).toBeDefined();
    expect(phase1.number).toBe(1);
    expect(phase1.name).toBe('Initial Draft');
  });

  test('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(0)).toBeUndefined();
    expect(getPhaseMetadata(4)).toBeUndefined();
    expect(getPhaseMetadata(-1)).toBeUndefined();
  });

  test('should return correct AI model for each phase', () => {
    expect(getPhaseMetadata(1).aiModel).toBe('Claude');
    expect(getPhaseMetadata(2).aiModel).toBe('Gemini');
    expect(getPhaseMetadata(3).aiModel).toBe('Claude');
  });
});

describe('prompt generation', () => {
  // These tests verify the functions handle errors gracefully
  // when prompt templates cannot be loaded (no fetch in jsdom)

  test('generatePhase1Prompt should be a function', () => {
    expect(typeof generatePhase1Prompt).toBe('function');
  });

  test('generatePhase2Prompt should be a function', () => {
    expect(typeof generatePhase2Prompt).toBe('function');
  });

  test('generatePhase3Prompt should be a function', () => {
    expect(typeof generatePhase3Prompt).toBe('function');
  });

  test('preloadPromptTemplates should be a function', () => {
    expect(typeof preloadPromptTemplates).toBe('function');
  });

  describe('when fetch is unavailable', () => {
    let originalFetch;

    beforeEach(() => {
      // Remove global fetch to simulate unavailability
      originalFetch = global.fetch;
      delete global.fetch;
    });

    afterEach(() => {
      // Restore global fetch
      global.fetch = originalFetch;
    });

    test('generatePhase1Prompt should reject when fetch unavailable', async () => {
      const formData = { projectName: 'Test', problemStatement: 'Test problem' };
      await expect(generatePhase1Prompt(formData)).rejects.toThrow();
    });

    test('generatePhase2Prompt should reject when fetch unavailable', async () => {
      await expect(generatePhase2Prompt('phase 1 output')).rejects.toThrow();
    });

    test('generatePhase3Prompt should reject when fetch unavailable', async () => {
      await expect(generatePhase3Prompt('phase 1', 'phase 2')).rejects.toThrow();
    });
  });
});

describe('replaceTemplateVars - Placeholder Safety Check', () => {
  // These tests verify the safety check that removes unsubstituted {{PLACEHOLDER}} patterns
  // This prevents raw placeholders from reaching the LLM

  test('should replace known variables', () => {
    const template = 'Hello {{NAME}}, welcome to {{PROJECT}}';
    const vars = { NAME: 'World', PROJECT: 'One-Pager' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('Hello World, welcome to One-Pager');
  });

  test('should remove unsubstituted UPPER_CASE placeholders', () => {
    const template = 'Hello {{NAME}}, your {{UNKNOWN_FIELD}} is ready';
    const vars = { NAME: 'World' };

    const result = replaceTemplateVars(template, vars);

    // UNKNOWN_FIELD should be removed entirely, not left as {{UNKNOWN_FIELD}}
    expect(result).toBe('Hello World, your  is ready');
    expect(result).not.toContain('{{UNKNOWN_FIELD}}');
  });

  test('should remove multiple unsubstituted placeholders', () => {
    const template = '{{TITLE}} - {{MISSING_A}} and {{MISSING_B}}';
    const vars = { TITLE: 'My Document' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('My Document -  and ');
    expect(result).not.toContain('{{MISSING_A}}');
    expect(result).not.toContain('{{MISSING_B}}');
  });

  test('should handle template with only unsubstituted placeholders', () => {
    const template = '{{COMPLETELY_UNKNOWN}} {{ALSO_UNKNOWN}}';
    const vars = {};

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe(' ');
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
  });

  test('should preserve valid substitutions while removing unsubstituted ones', () => {
    const template = `# {{TITLE}}

## Context
{{CONTEXT}}

## Unknown Section
{{UNKNOWN_SECTION}}`;

    const vars = {
      TITLE: 'My Project',
      CONTEXT: 'This is the context',
    };

    const result = replaceTemplateVars(template, vars);

    expect(result).toContain('# My Project');
    expect(result).toContain('This is the context');
    expect(result).not.toContain('{{UNKNOWN_SECTION}}');
  });

  test('should handle phase output placeholders when not provided', () => {
    const template = `## Review the following:
{{PHASE1_OUTPUT}}

## Previous critique:
{{PHASE2_OUTPUT}}`;

    const vars = {
      PHASE1_OUTPUT: 'Draft content here',
      // PHASE2_OUTPUT intentionally not provided
    };

    const result = replaceTemplateVars(template, vars);

    expect(result).toContain('Draft content here');
    expect(result).not.toContain('{{PHASE2_OUTPUT}}');
  });
});
