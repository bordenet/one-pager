/**
 * Workflow Module - 3-phase one-pager workflow engine
 * @module workflow
 */

import { generateId } from './storage.js';

/**
 * @typedef {Object} PhaseConfig
 * @property {number} number - Phase number
 * @property {string} name - Phase name
 * @property {string} ai - AI model name
 * @property {string} type - Phase type ('mock' or 'manual')
 */

/** @type {PhaseConfig[]} */
export const PHASES = [
  { number: 1, name: 'Initial Draft', ai: 'Claude Sonnet 4.5', type: 'mock' },
  { number: 2, name: 'Gemini Review', ai: 'Gemini 2.5 Pro', type: 'manual' },
  { number: 3, name: 'Final Synthesis', ai: 'Claude Sonnet 4.5', type: 'mock' }
];

/**
 * Helper to get phase data, handling both object and array formats
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
 * Load prompt template from markdown file
 */
async function loadPromptTemplate(phaseNumber) {
  try {
    const response = await fetch(`prompts/phase${phaseNumber}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt template for phase ${phaseNumber}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading prompt template:', error);
    return '';
  }
}

/**
 * Replace template variables in prompt
 */
function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value || '[Not provided]');
  }
  return result;
}

/**
 * Generate prompt for current phase
 */
export async function generatePrompt(project) {
  const phaseNumber = project.currentPhase || project.phase || 1;
  const template = await loadPromptTemplate(phaseNumber);

  if (phaseNumber === 1) {
    // Phase 1: Initial Draft - use form data
    return replaceTemplateVars(template, project.formData);
  } else if (phaseNumber === 2) {
    // Phase 2: Gemini Review - include Phase 1 output
    const vars = {
      phase1Output: getPhaseData(project, 1).response || '[No Phase 1 output]'
    };
    return replaceTemplateVars(template, vars);
  } else if (phaseNumber === 3) {
    // Phase 3: Final Synthesis - include both Phase 1 and Phase 2 outputs
    const vars = {
      phase1Output: getPhaseData(project, 1).response || '[No Phase 1 output]',
      phase2Output: getPhaseData(project, 2).response || '[No Phase 2 output]'
    };
    return replaceTemplateVars(template, vars);
  }

  return template;
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

  if (phaseNumber < PHASES.length) {
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
 * Get phase metadata for UI display
 */
export function getPhaseMetadata(phase) {
  const phases = {
    1: {
      title: 'Initial Draft',
      description: 'Generate the first draft of your one-pager using Claude',
      ai: 'Claude',
      icon: '📝',
      color: 'blue'
    },
    2: {
      title: 'Alternative Perspective',
      description: 'Get a different perspective and improvements from Gemini',
      ai: 'Gemini',
      icon: '🔄',
      color: 'green'
    },
    3: {
      title: 'Final Synthesis',
      description: 'Combine the best elements into a polished final version',
      ai: 'Claude',
      icon: '✨',
      color: 'purple'
    }
  };

  return phases[phase] || phases[1];
}

/**
 * Generate prompt for a specific phase
 * @param {object} project - The project object
 * @param {number} phaseNumber - The phase number (1, 2, or 3)
 */
export async function generatePromptForPhase(project, phaseNumber) {
  // Handle when phaseNumber is not provided (use currentPhase or phase)
  const phase = phaseNumber || project.currentPhase || project.phase || 1;
  const template = await loadPromptTemplate(phase);

  // Helper to get phase response, handling both object and array formats
  const getPhaseResponse = (phaseNum) => {
    if (project.phases) {
      // Object format: {1: {response: ''}, 2: {response: ''}, ...}
      if (project.phases[phaseNum] && project.phases[phaseNum].response) {
        return project.phases[phaseNum].response;
      }
      // Array format: [{response: ''}, {response: ''}, ...]
      if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
        return project.phases[phaseNum - 1].response || '';
      }
    }
    return '';
  };

  if (phase === 1) {
    // Phase 1: Initial Draft - use form data with fallback to project fields
    // Handle legacy projects that may have empty formData
    const formData = project.formData || {};
    const vars = {
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
    return replaceTemplateVars(template, vars);
  } else if (phase === 2) {
    // Phase 2: Gemini Review - include Phase 1 output
    const vars = {
      phase1Output: getPhaseResponse(1) || '[No Phase 1 output yet]'
    };
    return replaceTemplateVars(template, vars);
  } else if (phase === 3) {
    // Phase 3: Final Synthesis - include both Phase 1 and Phase 2 outputs
    const vars = {
      phase1Output: getPhaseResponse(1) || '[No Phase 1 output yet]',
      phase2Output: getPhaseResponse(2) || '[No Phase 2 output yet]'
    };
    return replaceTemplateVars(template, vars);
  }

  return template;
}

/**
 * Export final one-pager document
 */
export function exportFinalOnePager(project) {
  let content = '';
  const attribution = '\n\n---\n\n*Generated with [One-Pager Assistant](https://bordenet.github.io/one-pager/)*';

  // Try phases in order of preference: 3, 1, 2
  const phase3 = getPhaseData(project, 3);
  const phase1 = getPhaseData(project, 1);
  const phase2 = getPhaseData(project, 2);

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
  const phase3 = getPhaseData(project, 3);
  const phase1 = getPhaseData(project, 1);
  const phase2 = getPhaseData(project, 2);

  if (phase3.response) {
    return phase3.response;
  } else if (phase1.response) {
    return phase1.response;
  } else if (phase2.response) {
    return phase2.response;
  }
  return null;
}

/**
 * Generate export filename for a project
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  return `${(project.title || project.name).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-one-pager.md`;
}
