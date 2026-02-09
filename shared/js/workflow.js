/**
 * Workflow Module - 3-phase one-pager workflow engine
 * @module workflow
 */

import { generateId } from './storage.js';
import { WORKFLOW_CONFIG, generatePhase1Prompt, generatePhase2Prompt, generatePhase3Prompt } from './prompts.js';
import { detectPromptPaste } from './core/workflow.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

// Re-export detectPromptPaste from core for backward compatibility
export { detectPromptPaste };

// Legacy alias for PHASES (deprecated, use WORKFLOW_CONFIG.phases)
export const PHASES = WORKFLOW_CONFIG.phases;

/**
 * Helper to get phase output, handling both flat and nested formats
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {string} Phase output content
 */
function getPhaseOutputInternal(project, phaseNum) {
  // Flat format (canonical) - check first
  const flatKey = `phase${phaseNum}_output`;
  if (project[flatKey]) {
    return project[flatKey];
  }
  // Nested format (legacy) - fallback
  if (project.phases) {
    if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
      return project.phases[phaseNum - 1].response || '';
    }
    if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
      return project.phases[phaseNum].response || '';
    }
  }
  return '';
}

/**
 * Helper to get phase data, handling both object and array formats (legacy)
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {Object} Phase data object with prompt, response, completed
 */
function getPhaseData(project, phaseNum) {
  const defaultPhase = { prompt: '', response: '', completed: false };
  if (!project.phases) return defaultPhase;

  // Array format: [{response: ''}, {response: ''}, ...] - check first!
  if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
    return project.phases[phaseNum - 1];
  }
  // Object format: {1: {response: ''}, 2: {response: ''}, ...}
  if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
    return project.phases[phaseNum];
  }
  return defaultPhase;
}

/**
 * Create new project
 */
export function createProject(name, description) {
  return {
    id: generateId(),
    name: name,
    description: description,
    created: Date.now(),
    modified: Date.now(),
    currentPhase: 1,
    // One-pager template fields
    formData: {
      projectName: '',
      problemStatement: '',
      costOfDoingNothing: '',
      proposedSolution: '',
      keyGoals: '',
      scopeInScope: '',
      scopeOutOfScope: '',
      successMetrics: '',
      keyStakeholders: '',
      timelineEstimate: ''
    },
    phases: PHASES.map(phase => ({
      number: phase.number,
      name: phase.name,
      ai: phase.ai,
      type: phase.type,
      prompt: '',
      response: '',
      completed: false
    }))
  };
}

/**
 * Generate prompt for current phase
 * Uses prompts.js module for template loading and variable replacement
 */
export async function generatePrompt(project) {
  const phaseNumber = project.currentPhase || project.phase || 1;
  const formData = project.formData || {};

  // Build formData with fallbacks to legacy fields
  const enrichedFormData = {
    projectName: formData.projectName || project.title || project.name || '',
    problemStatement: formData.problemStatement || project.problems || project.description || '',
    costOfDoingNothing: formData.costOfDoingNothing || '',
    proposedSolution: formData.proposedSolution || '',
    keyGoals: formData.keyGoals || '',
    scopeInScope: formData.scopeInScope || '',
    scopeOutOfScope: formData.scopeOutOfScope || '',
    successMetrics: formData.successMetrics || '',
    keyStakeholders: formData.keyStakeholders || '',
    timelineEstimate: formData.timelineEstimate || '',
    context: formData.context || project.context || ''
  };

  if (phaseNumber === 1) {
    return generatePhase1Prompt(enrichedFormData);
  } else if (phaseNumber === 2) {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output]';
    return generatePhase2Prompt(phase1Output);
  } else if (phaseNumber === 3) {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output]';
    const phase2Output = getPhaseData(project, 2).response || '[No Phase 2 output]';
    return generatePhase3Prompt(phase1Output, phase2Output);
  }

  return '';
}

/**
 * Update project form data
 */
export function updateFormData(project, formData) {
  project.formData = { ...project.formData, ...formData };
  return project;
}

/**
 * Validate phase completion
 */
export function validatePhase(project) {
  const phaseNumber = project.currentPhase || project.phase || 1;
  const phaseData = getPhaseData(project, phaseNumber);

  // Phase 1: Validate form data
  if (phaseNumber === 1) {
    const required = ['projectName', 'problemStatement', 'proposedSolution'];
    for (const field of required) {
      if (!project.formData[field] || project.formData[field].trim() === '') {
        return { valid: false, error: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}` };
      }
    }
  }

  // All phases: Validate response
  if (!phaseData.response || phaseData.response.trim() === '') {
    return { valid: false, error: 'Please paste the AI response' };
  }

  // Check if user accidentally pasted the prompt instead of the response
  const promptCheck = detectPromptPaste(phaseData.response);
  if (promptCheck.isPrompt) {
    return { valid: false, error: promptCheck.reason };
  }

  return { valid: true };
}

/**
 * Complete current phase and advance
 */
export function advancePhase(project) {
  const phaseNumber = project.currentPhase || project.phase || 1;

  // Get the phase data (works with both array and object formats)
  const phaseData = getPhaseData(project, phaseNumber);
  if (phaseData) {
    phaseData.completed = true;
  }

  // Allow advancing up to phase 4 (complete state)
  if (phaseNumber <= PHASES.length) {
    project.currentPhase = phaseNumber + 1;
    project.phase = phaseNumber + 1;
  }

  return project;
}

/**
 * Check if project is complete
 */
export function isProjectComplete(project) {
  if (Array.isArray(project.phases)) {
    return project.phases.every(phase => phase.completed);
  }
  // Object format
  return [1, 2, 3].every(num => getPhaseData(project, num).completed);
}

/**
 * Get current phase
 */
export function getCurrentPhase(project) {
  const phaseNumber = project.currentPhase || project.phase || 1;
  return getPhaseData(project, phaseNumber);
}

/**
 * Update phase response
 */
export function updatePhaseResponse(project, response) {
  const phase = getCurrentPhase(project);
  phase.response = response;
  return project;
}

/**
 * Get project progress percentage
 */
export function getProgress(project) {
  const completedPhases = project.phases.filter(p => p.completed).length;
  return Math.round((completedPhases / PHASES.length) * 100);
}

/**
 * Get phase metadata from WORKFLOW_CONFIG
 * @param {number} phaseNumber - Phase number (1-3)
 * @returns {Object|undefined} Phase metadata with number, name, description, etc.
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Generate prompt for a specific phase
 * Uses prompts.js module for template loading and variable replacement
 * @param {object} project - The project object
 * @param {number} phaseNumber - The phase number (1, 2, or 3)
 */
export async function generatePromptForPhase(project, phaseNumber) {
  // Handle when phaseNumber is not provided (use currentPhase or phase)
  const phase = phaseNumber || project.currentPhase || project.phase || 1;

  // Build formData with fallbacks to legacy fields
  const formData = project.formData || {};
  const enrichedFormData = {
    projectName: formData.projectName || project.title || project.name || '',
    problemStatement: formData.problemStatement || project.problems || project.description || '',
    costOfDoingNothing: formData.costOfDoingNothing || '',
    proposedSolution: formData.proposedSolution || '',
    keyGoals: formData.keyGoals || '',
    scopeInScope: formData.scopeInScope || '',
    scopeOutOfScope: formData.scopeOutOfScope || '',
    successMetrics: formData.successMetrics || '',
    keyStakeholders: formData.keyStakeholders || '',
    timelineEstimate: formData.timelineEstimate || '',
    context: formData.context || project.context || ''
  };

  if (phase === 1) {
    return generatePhase1Prompt(enrichedFormData);
  } else if (phase === 2) {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    return generatePhase2Prompt(phase1Output);
  } else if (phase === 3) {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    const phase2Output = getPhaseData(project, 2).response || '[No Phase 2 output yet]';
    return generatePhase3Prompt(phase1Output, phase2Output);
  }

  return '';
}

/**
 * Export final one-pager document
 */
export function exportFinalOnePager(project) {
  const attribution = '\n\n---\n\n*Generated with [One-Pager Assistant](https://bordenet.github.io/one-pager/)*';

  // Try phases in order of preference: 3, 1, 2
  const phase3 = getPhaseData(project, 3);
  const phase1 = getPhaseData(project, 1);
  const phase2 = getPhaseData(project, 2);

  let content;
  if (phase3.response) {
    content = phase3.response;
  } else if (phase1.response) {
    content = phase1.response;
  } else if (phase2.response) {
    content = phase2.response;
  } else {
    content = `# ${project.title || project.name}\n\n${project.problems || project.description}`;
  }

  content += attribution;

  const filename = `${(project.title || project.name).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-one-pager.md`;

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get the final markdown content from a project
 * @param {Object} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
  const workflow = new Workflow(project);
  const phase3 = workflow.getPhaseOutput(3);
  const phase1 = workflow.getPhaseOutput(1);
  const phase2 = workflow.getPhaseOutput(2);

  if (phase3) {
    return phase3;
  } else if (phase1) {
    return phase1;
  } else if (phase2) {
    return phase2;
  }
  return null;
}

/**
 * Generate export filename for a project
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  const title = project.title || project.name || 'one-pager';
  return `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-one-pager.md`;
}

/**
 * Export final document as markdown (returns the markdown string)
 * @param {Object} project - Project object
 * @returns {string} Markdown content
 */
export function exportFinalDocument(project) {
  const workflow = new Workflow(project);
  return workflow.exportAsMarkdown();
}

// ============================================================================
// WORKFLOW CLASS - Canonical implementation matching genesis template
// ============================================================================

export class Workflow {
  constructor(project) {
    this.project = project;
    // Clamp phase to valid range (1 minimum)
    const rawPhase = project.phase || project.currentPhase || 1;
    this.currentPhase = Math.max(1, rawPhase);
  }

  /**
   * Get current phase configuration
   */
  getCurrentPhase() {
    if (this.currentPhase > WORKFLOW_CONFIG.phaseCount) {
      return WORKFLOW_CONFIG.phases[WORKFLOW_CONFIG.phaseCount - 1];
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
  }

  /**
   * Get next phase configuration
   */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) {
      return null;
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1);
  }

  /**
   * Check if workflow is complete
   */
  isComplete() {
    return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
  }

  /**
   * Advance to next phase
   */
  advancePhase() {
    if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
      this.currentPhase++;
      this.project.phase = this.currentPhase;
      this.project.currentPhase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Go back to previous phase
   */
  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.project.phase = this.currentPhase;
      this.project.currentPhase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Generate prompt for current phase
   */
  async generatePrompt() {
    const formData = this.project.formData || {};
    const enrichedFormData = {
      projectName: formData.projectName || this.project.title || this.project.name || '',
      problemStatement: formData.problemStatement || this.project.problems || this.project.description || '',
      costOfDoingNothing: formData.costOfDoingNothing || '',
      proposedSolution: formData.proposedSolution || '',
      keyGoals: formData.keyGoals || '',
      scopeInScope: formData.scopeInScope || '',
      scopeOutOfScope: formData.scopeOutOfScope || '',
      successMetrics: formData.successMetrics || '',
      keyStakeholders: formData.keyStakeholders || '',
      timelineEstimate: formData.timelineEstimate || '',
      context: formData.context || this.project.context || ''
    };

    switch (this.currentPhase) {
    case 1:
      return await generatePhase1Prompt(enrichedFormData);
    case 2:
      return await generatePhase2Prompt(this.getPhaseOutput(1) || '[No Phase 1 output]');
    case 3:
      return await generatePhase3Prompt(
        this.getPhaseOutput(1) || '[No Phase 1 output]',
        this.getPhaseOutput(2) || '[No Phase 2 output]'
      );
    default:
      throw new Error(`Invalid phase: ${this.currentPhase}`);
    }
  }

  /**
   * Save phase output
   */
  savePhaseOutput(output) {
    const phaseKey = `phase${this.currentPhase}_output`;
    this.project[phaseKey] = output;
    this.project.updatedAt = new Date().toISOString();
    this.project.modified = Date.now();
  }

  /**
   * Get phase output
   */
  getPhaseOutput(phaseNumber) {
    return getPhaseOutputInternal(this.project, phaseNumber);
  }

  /**
   * Export final output as Markdown
   */
  exportAsMarkdown() {
    const attribution = '\n\n---\n\n*Generated with [One-Pager Assistant](https://bordenet.github.io/one-pager/)*';

    // Try phases in order of preference: 3, 1, 2
    const phase3 = this.getPhaseOutput(3);
    const phase1 = this.getPhaseOutput(1);
    const phase2 = this.getPhaseOutput(2);

    let content;
    if (phase3) {
      content = phase3;
    } else if (phase1) {
      content = phase1;
    } else if (phase2) {
      content = phase2;
    } else {
      content = `# ${this.project.title || this.project.name}\n\nNo one-pager content generated yet.`;
    }

    return content + attribution;
  }

  /**
   * Get workflow progress percentage
   */
  getProgress() {
    return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
  }
}
