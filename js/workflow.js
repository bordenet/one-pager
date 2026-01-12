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
  const phase = project.phases[project.currentPhase - 1];
  const template = await loadPromptTemplate(phase.number);

  if (phase.number === 1) {
    // Phase 1: Initial Draft - use form data
    return replaceTemplateVars(template, project.formData);
  } else if (phase.number === 2) {
    // Phase 2: Gemini Review - include Phase 1 output
    const vars = {
      phase1Output: project.phases[0].response || '[No Phase 1 output]'
    };
    return replaceTemplateVars(template, vars);
  } else if (phase.number === 3) {
    // Phase 3: Final Synthesis - include both Phase 1 and Phase 2 outputs
    const vars = {
      phase1Output: project.phases[0].response || '[No Phase 1 output]',
      phase2Output: project.phases[1].response || '[No Phase 2 output]'
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
  const phase = project.phases[project.currentPhase - 1];

  // Phase 1: Validate form data
  if (phase.number === 1) {
    const required = ['projectName', 'problemStatement', 'proposedSolution'];
    for (const field of required) {
      if (!project.formData[field] || project.formData[field].trim() === '') {
        return { valid: false, error: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}` };
      }
    }
  }

  // All phases: Validate response
  if (!phase.response || phase.response.trim() === '') {
    return { valid: false, error: 'Please paste the AI response' };
  }

  return { valid: true };
}

/**
 * Complete current phase and advance
 */
export function advancePhase(project) {
  const phase = project.phases[project.currentPhase - 1];
  phase.completed = true;

  if (project.currentPhase < PHASES.length) {
    project.currentPhase++;
  }

  return project;
}

/**
 * Check if project is complete
 */
export function isProjectComplete(project) {
  return project.phases.every(phase => phase.completed);
}

/**
 * Get current phase
 */
export function getCurrentPhase(project) {
  return project.phases[project.currentPhase - 1];
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

  if (project.phases && project.phases[3] && project.phases[3].response) {
    // Use Phase 3 response if available
    content = project.phases[3].response;
  } else if (project.phases && project.phases[1] && project.phases[1].response) {
    // Fallback to Phase 1 response
    content = project.phases[1].response;
  } else if (project.phases && project.phases.length > 2 && project.phases[2].response) {
    // Legacy format - use last completed phase
    content = project.phases[2].response;
  } else {
    content = `# ${project.title || project.name}\n\n${project.problems || project.description}`;
  }

  const filename = `${(project.title || project.name).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-one-pager.md`;

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
