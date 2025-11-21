// workflow.js - 3-phase one-pager workflow engine

import { generateId } from './storage.js';

// Define workflow phases
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

