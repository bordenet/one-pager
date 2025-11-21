// app.js - Main application logic

import { initDB, saveProject, getProject, getAllProjects, deleteProject, exportProject } from './storage.js';
import { createProject, generatePrompt, validatePhase, advancePhase, isProjectComplete, getCurrentPhase, updatePhaseResponse, updateFormData, getProgress, PHASES } from './workflow.js';
import { initMockMode, setMockMode, isMockMode, getMockResponse } from './ai-mock.js';

let currentProject = null;

/**
 * Initialize application
 */
async function initApp() {
  try {
    // Initialize database
    await initDB();

    // Initialize AI mock mode
    initMockMode();

    // Setup event listeners
    setupEventListeners();

    // Render project list
    await renderProjectList();

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showNotification('Failed to initialize app', 'error');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Related projects dropdown
  const relatedBtn = document.getElementById('related-projects-btn');
  const relatedMenu = document.getElementById('related-projects-menu');
  relatedBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    relatedMenu?.classList.toggle('hidden');
  });
  document.addEventListener('click', () => {
    relatedMenu?.classList.add('hidden');
  });

  // New project button
  document.getElementById('newProjectBtn')?.addEventListener('click', showNewProjectDialog);

  // Back to list button
  document.getElementById('backToListBtn')?.addEventListener('click', () => {
    currentProject = null;
    showProjectList();
  });

  // Export button
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    if (currentProject) {
      exportProject(currentProject);
      showNotification('Project exported', 'success');
    }
  });

  // Delete button
  document.getElementById('deleteBtn')?.addEventListener('click', async () => {
    if (currentProject && confirm('Delete this project?')) {
      await deleteProject(currentProject.id);
      showNotification('Project deleted', 'success');
      currentProject = null;
      showProjectList();
    }
  });

  // AI Mock mode toggle
  document.getElementById('mockModeCheckbox')?.addEventListener('change', (e) => {
    setMockMode(e.target.checked);
    showNotification(
      e.target.checked ? 'AI Mock Mode enabled' : 'AI Mock Mode disabled',
      'info'
    );
  });
}

/**
 * Load saved theme
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

/**
 * Toggle dark/light theme
 */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

/**
 * Show project list view
 */
async function showProjectList() {
  document.getElementById('projectListView').classList.remove('hidden');
  document.getElementById('workflowView').classList.add('hidden');
  await renderProjectList();
}

/**
 * Render project list
 */
async function renderProjectList() {
  const projects = await getAllProjects();
  const container = document.getElementById('projectList');

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <p class="text-lg">No projects yet</p>
        <p class="text-sm mt-2">Click "New Project" to get started</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(project => `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
         onclick="window.openProject('${project.id}')">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 dark:text-white">${escapeHtml(project.name)}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${escapeHtml(project.description)}</p>
        </div>
        <div class="ml-4 text-right">
          <div class="text-sm font-medium text-blue-600 dark:text-blue-400">${getProgress(project)}%</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Phase ${project.currentPhase}/${PHASES.length}
          </div>
        </div>
      </div>
      <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Modified: ${new Date(project.modified).toLocaleDateString()}
      </div>
    </div>
  `).join('');
}

/**
 * Show new project dialog
 */
function showNewProjectDialog() {
  const name = prompt('Project name:');
  if (!name) return;

  const description = prompt('Project description:');
  if (!description) return;

  const project = createProject(name, description);
  currentProject = project;

  saveProject(project).then(() => {
    showNotification('Project created', 'success');
    showWorkflow();
  });
}

/**
 * Open existing project
 */
window.openProject = async function(id) {
  currentProject = await getProject(id);
  showWorkflow();
};

/**
 * Show workflow view
 */
function showWorkflow() {
  document.getElementById('projectListView').classList.add('hidden');
  document.getElementById('workflowView').classList.remove('hidden');
  renderWorkflow();
}

/**
 * Render workflow
 */
async function renderWorkflow() {
  const container = document.getElementById('workflowContent');
  const phase = getCurrentPhase(currentProject);

  // Phase 1: Show form for one-pager fields
  if (phase.number === 1) {
    renderPhase1Form(container, phase);
  } else {
    // Phases 2 & 3: Show prompt/response workflow
    await renderPhasePromptResponse(container, phase);
  }
}

/**
 * Render Phase 1 form
 */
function renderPhase1Form(container, phase) {
  const fd = currentProject.formData;

  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        ${escapeHtml(currentProject.name)}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">${escapeHtml(currentProject.description)}</p>

      <!-- Phase Progress -->
      ${renderPhaseProgress()}

      <!-- Phase 1 Form -->
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Phase 1: ${phase.name}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Fill in the one-pager template fields below. Required fields are marked with *
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project/Feature Name *
          </label>
          <input type="text" id="projectName" value="${escapeHtml(fd.projectName)}"
                 class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                 placeholder="e.g., Mobile App Performance Optimization">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Problem Statement *
          </label>
          <textarea id="problemStatement" rows="3"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="What specific customer or business problem are you solving? Quantify if possible.">${escapeHtml(fd.problemStatement)}</textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proposed Solution *
          </label>
          <textarea id="proposedSolution" rows="3"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="High-level description of how you will solve the problem. Avoid technical jargon.">${escapeHtml(fd.proposedSolution)}</textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Key Goals/Benefits
          </label>
          <textarea id="keyGoals" rows="3"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Measurable outcomes (e.g., 'Reduce user onboarding time by 50%')">${escapeHtml(fd.keyGoals)}</textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scope (In-Scope)
            </label>
            <textarea id="scopeInScope" rows="3"
                      class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="What is explicitly included?">${escapeHtml(fd.scopeInScope)}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scope (Out-of-Scope)
            </label>
            <textarea id="scopeOutOfScope" rows="3"
                      class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="What is NOT included to prevent scope creep?">${escapeHtml(fd.scopeOutOfScope)}</textarea>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Success Metrics
          </label>
          <textarea id="successMetrics" rows="3"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="2-3 key performance indicators (KPIs)">${escapeHtml(fd.successMetrics)}</textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Key Stakeholders
          </label>
          <textarea id="keyStakeholders" rows="2"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Owners, approvers, key contributors">${escapeHtml(fd.keyStakeholders)}</textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeline Estimate
          </label>
          <textarea id="timelineEstimate" rows="2"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="High-level milestones">${escapeHtml(fd.timelineEstimate)}</textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button onclick="window.generatePhase1Prompt()"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Generate Prompt
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render phase progress indicator
 */
function renderPhaseProgress() {
  return `
    <div class="flex gap-4 mb-6">
      ${PHASES.map(p => `
        <div class="flex-1 text-center">
          <div class="text-sm font-medium ${p.number === currentProject.currentPhase ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}">
            ${p.number === currentProject.currentPhase ? '→' : currentProject.phases[p.number - 1].completed ? '✓' : '○'}
            Phase ${p.number}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${p.name}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render Phase 2/3 prompt/response workflow
 */
async function renderPhasePromptResponse(container, phase) {
  const prompt = await generatePrompt(currentProject);

  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        ${escapeHtml(currentProject.name)}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">${escapeHtml(currentProject.description)}</p>

      <!-- Phase Progress -->
      ${renderPhaseProgress()}

      <!-- Current Phase -->
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Phase ${phase.number}: ${phase.name}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">AI Model: ${phase.ai}</p>
          ${phase.number === 2 ? `
            <p class="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              ⚠️ Copy the prompt below and paste it into <a href="https://gemini.google.com" target="_blank" class="underline">Gemini</a>.
              Then paste Gemini's response back here.
            </p>
          ` : ''}
        </div>

        <!-- Prompt -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generated Prompt
          </label>
          <textarea readonly
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                    rows="10">${escapeHtml(prompt)}</textarea>
          <button onclick="window.copyPrompt()"
                  class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Copy Prompt
          </button>
          ${isMockMode() && phase.type === 'mock' ? `
            <button onclick="window.useMockResponse()"
                    class="mt-2 ml-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
              [MOCK MODE] Use Mock Response
            </button>
          ` : ''}
        </div>

        <!-- Response -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Response
          </label>
          <textarea id="responseInput"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows="10"
                    placeholder="Paste the AI response here...">${escapeHtml(phase.response)}</textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button onclick="window.saveResponse()"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save & Continue
          </button>
          ${isProjectComplete(currentProject) ? `
            <button onclick="window.downloadFinal()"
                    class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Download Final One-Pager
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Global functions for onclick handlers

/**
 * Phase 1: Generate prompt from form data
 */
window.generatePhase1Prompt = async function() {
  // Collect form data
  const formData = {
    projectName: document.getElementById('projectName').value,
    problemStatement: document.getElementById('problemStatement').value,
    proposedSolution: document.getElementById('proposedSolution').value,
    keyGoals: document.getElementById('keyGoals').value,
    scopeInScope: document.getElementById('scopeInScope').value,
    scopeOutOfScope: document.getElementById('scopeOutOfScope').value,
    successMetrics: document.getElementById('successMetrics').value,
    keyStakeholders: document.getElementById('keyStakeholders').value,
    timelineEstimate: document.getElementById('timelineEstimate').value
  };

  // Update project
  updateFormData(currentProject, formData);
  await saveProject(currentProject);

  // Validate required fields
  const required = ['projectName', 'problemStatement', 'proposedSolution'];
  for (const field of required) {
    if (!formData[field] || formData[field].trim() === '') {
      showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
      return;
    }
  }

  // Generate and show prompt
  const prompt = await generatePrompt(currentProject);

  // Show prompt in a modal or new section
  const container = document.getElementById('workflowContent');
  container.innerHTML += `
    <div class="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Generated Prompt for Claude
      </h4>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        ${isMockMode() ? '[MOCK MODE] This prompt would be sent to Claude. In mock mode, we\'ll simulate the response.' : 'Copy this prompt and paste it into Claude.ai, then paste the response below.'}
      </p>
      <textarea readonly
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                rows="10">${escapeHtml(prompt)}</textarea>
      <div class="flex gap-2 mt-4">
        <button onclick="window.copyPrompt()"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Copy Prompt
        </button>
        ${isMockMode() ? `
          <button onclick="window.useMockResponse()"
                  class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
            [MOCK MODE] Use Mock Response
          </button>
        ` : ''}
      </div>

      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Claude's Response
        </label>
        <textarea id="responseInput"
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="10"
                  placeholder="Paste Claude's response here..."></textarea>
        <button onclick="window.saveResponse()"
                class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Save & Continue to Phase 2
        </button>
      </div>
    </div>
  `;

  showNotification('Prompt generated! Copy it to Claude.ai', 'success');
};

window.copyPrompt = async function() {
  const prompt = await generatePrompt(currentProject);
  navigator.clipboard.writeText(prompt);
  showNotification('Prompt copied to clipboard', 'success');
};

window.useMockResponse = async function() {
  const phase = getCurrentPhase(currentProject);
  const mockResponse = await getMockResponse(phase.number);
  document.getElementById('responseInput').value = mockResponse;
  showNotification('[MOCK MODE] Mock response loaded', 'info');
};

window.saveResponse = async function() {
  const response = document.getElementById('responseInput').value;
  updatePhaseResponse(currentProject, response);

  const validation = validatePhase(currentProject);
  if (!validation.valid) {
    showNotification(validation.error, 'error');
    return;
  }

  advancePhase(currentProject);
  await saveProject(currentProject);

  if (isProjectComplete(currentProject)) {
    showNotification('Project complete! Download your final one-pager.', 'success');
  } else {
    showNotification('Phase completed', 'success');
  }

  renderWorkflow();
};

window.downloadFinal = function() {
  const finalResponse = currentProject.phases[2].response; // Phase 3 response
  const filename = `${currentProject.formData.projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-one-pager.md`;

  const blob = new Blob([finalResponse], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  showNotification('One-pager downloaded!', 'success');
};

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const container = document.getElementById('notifications');
  const id = Date.now();

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const notification = document.createElement('div');
  notification.id = `notification-${id}`;
  notification.className = `notification ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('removing');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load theme before init
loadTheme();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
