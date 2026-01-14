/**
 * Views Module
 * Handles rendering different views/screens
 * @module views
 */

import { getAllProjects, createProject, deleteProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { getFinalMarkdown, getExportFilename } from './workflow.js';

/**
 * Render the projects list view
 */
export async function renderProjectsList() {
  const projects = await getAllProjects();

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My <a href="https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md" target="_blank" rel="noopener" class="text-blue-600 hover:underline">One-Pagers</a>
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New One-Pager
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">📋</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No One-Pagers yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first One-Pager document
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First One-Pager
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map(project => {
                    // Check if all phases are complete
                    const isComplete = project.phases &&
                        project.phases[1]?.completed &&
                        project.phases[2]?.completed &&
                        project.phases[3]?.completed;
                    return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.title || project.name)}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${isComplete ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ''}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${project.phase || project.currentPhase || 1}/3</span>
                                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${((project.phase || project.currentPhase || 1) / 3) * 100}%"></div>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    ${[1, 2, 3].map(phase => `
                                        <div class="flex-1 h-1 rounded ${project.phases && project.phases[phase] && project.phases[phase].completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                                    `).join('')}
                                </div>
                            </div>

                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                ${escapeHtml(project.problems || project.description)}
                            </p>

                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Updated ${formatDate(project.updatedAt || new Date(project.modified).toISOString())}</span>
                                <span>${project.phases ? Object.values(project.phases).filter(p => p.completed).length : 0}/3 complete</span>
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
        `}
    `;

  // Event listeners
  const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
  newProjectBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo('new-project'));
  });

  const projectCards = container.querySelectorAll('[data-project-id]');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        navigateTo('project/' + card.dataset.projectId);
      }
    });
  });

  // Preview buttons (for completed projects)
  const previewBtns = container.querySelectorAll('.preview-project-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, 'Your One-Pager is Ready', getExportFilename(project));
        } else {
          showToast('No content to preview', 'warning');
        }
      }
    });
  });

  const deleteBtns = container.querySelectorAll('.delete-project-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);

      if (await confirm(`Are you sure you want to delete "${project.title || project.name}"?`, 'Delete Project')) {
        await deleteProject(projectId);
        showToast('Project deleted', 'success');
        renderProjectsList();
      }
    });
  });
}

/**
 * Render the new project form
 */
export function renderNewProjectForm(existingProject = null) {
  const isEditing = !!existingProject;
  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    ${isEditing ? 'Back to One-Pager' : 'Back to One-Pagers'}
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    ${isEditing ? 'Edit One-Pager Details' : 'Create New <a href="https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md" target="_blank" rel="noopener" class="text-blue-600 hover:underline">One-Pager</a>'}
                </h2>
                ${isEditing ? `
                    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p class="text-sm text-blue-800 dark:text-blue-300">
                            💡 Update your project details below. Changes will be saved when you continue to Phase 1.
                        </p>
                    </div>
                ` : ''}

                <form id="new-project-form" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value="${escapeHtml(existingProject?.title || existingProject?.name || '')}"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Mobile App Performance Optimization"
                        >
                    </div>

                    <div>
                        <label for="problemStatement" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Problem Statement <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="problemStatement"
                            name="problemStatement"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="What problem are you solving? Be specific..."
                        >${escapeHtml(existingProject?.formData?.problemStatement || existingProject?.problems || existingProject?.description || '')}</textarea>
                    </div>

                    <div>
                        <label for="costOfDoingNothing" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cost of Doing Nothing
                        </label>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">What happens if this isn't solved? Include business impact, revenue loss, etc.</p>
                        <textarea
                            id="costOfDoingNothing"
                            name="costOfDoingNothing"
                            rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., $50K/month lost revenue, 10% customer churn..."
                        >${escapeHtml(existingProject?.formData?.costOfDoingNothing || '')}</textarea>
                    </div>

                    <div>
                        <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Context
                        </label>
                        <textarea
                            id="context"
                            name="context"
                            rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Any background, constraints, or considerations..."
                        >${escapeHtml(existingProject?.formData?.context || existingProject?.context || '')}</textarea>
                    </div>

                    <div>
                        <label for="proposedSolution" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Proposed Solution
                        </label>
                        <textarea
                            id="proposedSolution"
                            name="proposedSolution"
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="High-level description of the proposed solution..."
                        >${escapeHtml(existingProject?.formData?.proposedSolution || '')}</textarea>
                    </div>

                    <div>
                        <label for="keyGoals" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Key Goals/Benefits
                        </label>
                        <textarea
                            id="keyGoals"
                            name="keyGoals"
                            rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="List the main goals and expected benefits..."
                        >${escapeHtml(existingProject?.formData?.keyGoals || '')}</textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="scopeInScope" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                In Scope
                            </label>
                            <textarea
                                id="scopeInScope"
                                name="scopeInScope"
                                rows="2"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="What's included..."
                            >${escapeHtml(existingProject?.formData?.scopeInScope || '')}</textarea>
                        </div>
                        <div>
                            <label for="scopeOutOfScope" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Out of Scope
                            </label>
                            <textarea
                                id="scopeOutOfScope"
                                name="scopeOutOfScope"
                                rows="2"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="What's explicitly excluded..."
                            >${escapeHtml(existingProject?.formData?.scopeOutOfScope || '')}</textarea>
                        </div>
                    </div>

                    <div>
                        <label for="successMetrics" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Success Metrics
                        </label>
                        <textarea
                            id="successMetrics"
                            name="successMetrics"
                            rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="How will you measure success? e.g., Reduce latency by 50%..."
                        >${escapeHtml(existingProject?.formData?.successMetrics || '')}</textarea>
                    </div>

                    <div>
                        <label for="keyStakeholders" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Key Stakeholders
                        </label>
                        <textarea
                            id="keyStakeholders"
                            name="keyStakeholders"
                            rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Owner, approvers, contributors..."
                        >${escapeHtml(existingProject?.formData?.keyStakeholders || '')}</textarea>
                    </div>

                    <div>
                        <label for="timelineEstimate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timeline Estimate
                        </label>
                        <textarea
                            id="timelineEstimate"
                            name="timelineEstimate"
                            rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Phase 1: 2 weeks, Launch: Q2 2025..."
                        >${escapeHtml(existingProject?.formData?.timelineEstimate || '')}</textarea>
                    </div>

                </form>
            </div>

            <!-- Footer buttons (outside the card, like ADR tool) -->
            <div class="mt-6 flex justify-between items-center">
                <button type="button" id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Next Phase →
                </button>
                <button type="button" id="delete-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Delete
                </button>
            </div>
        </div>
    `;

  // Helper function to get form data
  const getFormData = () => {
    const form = document.getElementById('new-project-form');
    const formDataObj = new FormData(form);
    return {
      title: formDataObj.get('title'),
      problemStatement: formDataObj.get('problemStatement'),
      costOfDoingNothing: formDataObj.get('costOfDoingNothing') || '',
      context: formDataObj.get('context') || '',
      proposedSolution: formDataObj.get('proposedSolution') || '',
      keyGoals: formDataObj.get('keyGoals') || '',
      scopeInScope: formDataObj.get('scopeInScope') || '',
      scopeOutOfScope: formDataObj.get('scopeOutOfScope') || '',
      successMetrics: formDataObj.get('successMetrics') || '',
      keyStakeholders: formDataObj.get('keyStakeholders') || '',
      timelineEstimate: formDataObj.get('timelineEstimate') || ''
    };
  };

  // Helper function to save project
  const saveProject = async (navigateAfter = false) => {
    const formData = getFormData();

    if (!formData.title || !formData.problemStatement) {
      showToast('Please fill in required fields', 'error');
      return null;
    }

    if (isEditing) {
      const { updateProject } = await import('./projects.js');
      await updateProject(existingProject.id, {
        title: formData.title,
        name: formData.title,
        problems: formData.problemStatement,
        description: formData.problemStatement,
        context: formData.context,
        formData: {
          projectName: formData.title,
          problemStatement: formData.problemStatement,
          costOfDoingNothing: formData.costOfDoingNothing,
          context: formData.context,
          proposedSolution: formData.proposedSolution,
          keyGoals: formData.keyGoals,
          scopeInScope: formData.scopeInScope,
          scopeOutOfScope: formData.scopeOutOfScope,
          successMetrics: formData.successMetrics,
          keyStakeholders: formData.keyStakeholders,
          timelineEstimate: formData.timelineEstimate
        }
      });
      showToast('One-Pager saved!', 'success');
      if (navigateAfter) {
        navigateTo('project/' + existingProject.id);
      }
      return existingProject;
    } else {
      const project = await createProject(formData.title, formData.problemStatement, formData.context, formData);
      showToast('One-Pager created!', 'success');
      if (navigateAfter) {
        navigateTo('project/' + project.id);
      }
      return project;
    }
  };

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));

  // Next Phase button - saves and navigates to Phase 1
  document.getElementById('next-phase-btn').addEventListener('click', async () => {
    await saveProject(true);
  });

  // Delete button
  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (isEditing) {
      if (await confirm(`Are you sure you want to delete "${existingProject.title || existingProject.name}"?`, 'Delete One-Pager')) {
        await deleteProject(existingProject.id);
        showToast('One-Pager deleted', 'success');
        navigateTo('home');
      }
    } else {
      // For new projects, just go back home
      navigateTo('home');
    }
  });
}
