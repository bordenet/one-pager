/**
 * Views Module
 * Handles rendering different views/screens
 */

import { getAllProjects, createProject, deleteProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast } from './ui.js';
import { navigateTo } from './router.js';

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
                    Create your first <a href="https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md" target="_blank" rel="noopener" class="text-green-600 hover:underline">One-Pager</a> document
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First One-Pager
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map(project => `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.title || project.name)}
                                </h3>
                                <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
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
                `).join('')}
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
      if (!e.target.closest('.delete-project-btn')) {
        navigateTo('project/' + card.dataset.projectId);
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
                            Project Title *
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
                        <label for="problems" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Problems to Solve *
                        </label>
                        <textarea
                            id="problems"
                            name="problems"
                            required
                            rows="4"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Describe the problems this project will address..."
                        >${escapeHtml(existingProject?.problems || existingProject?.description || '')}</textarea>
                    </div>

                    <div>
                        <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Context
                        </label>
                        <textarea
                            id="context"
                            name="context"
                            rows="6"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Any simplifications, considerations, constraints, or other context..."
                        >${escapeHtml(existingProject?.context || '')}</textarea>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            ${isEditing ? 'Save & Continue to Phase 1' : 'Create One-Pager'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => {
    if (isEditing) {
      navigateTo('project/' + existingProject.id);
    } else {
      navigateTo('home');
    }
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    if (isEditing) {
      navigateTo('project/' + existingProject.id);
    } else {
      navigateTo('home');
    }
  });

  document.getElementById('new-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const problems = formData.get('problems');
    const context = formData.get('context') || '';

    if (isEditing) {
      // Update existing project
      const { updateProject } = await import('./projects.js');
      await updateProject(existingProject.id, {
        title,
        name: title, // Legacy compatibility
        problems,
        description: problems, // Legacy compatibility
        context,
        formData: {
          ...existingProject.formData,
          projectName: title,
          problemStatement: problems,
          context
        }
      });
      showToast('Project updated successfully!', 'success');
      navigateTo('project/' + existingProject.id);
    } else {
      // Create new project
      const project = await createProject(title, problems, context);
      showToast('Project created successfully!', 'success');
      navigateTo('project/' + project.id);
    }
  });
}
