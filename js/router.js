/**
 * Simple Router Module
 * Handles client-side routing and navigation
 */

import { renderProjectsList, renderNewProjectForm } from './views.js';
import { renderProjectView } from './project-view.js';

let currentRoute = null;

/**
 * Initialize the router
 */
export function initRouter() {
  // Handle browser back/forward buttons
  window.addEventListener('popstate', handlePopState);

  // Handle initial route
  const path = window.location.hash.slice(1) || 'home';
  navigateTo(path, false);
}

/**
 * Navigate to a route
 */
export function navigateTo(route, pushState = true) {
  const [path, param] = route.split('/');

  if (pushState) {
    window.history.pushState({ route }, '', `#${route}`);
  }

  currentRoute = route;
  renderRoute(path, param);
}

/**
 * Handle browser back/forward
 */
function handlePopState(event) {
  const route = event.state?.route || 'home';
  navigateTo(route, false);
}

/**
 * Render the current route
 */
async function renderRoute(path, param) {
  try {
    switch (path) {
    case 'home':
    case '':
      await renderProjectsList();
      break;

    case 'new-project':
      renderNewProjectForm();
      break;

    case 'project':
      if (param) {
        await renderProjectView(param);
      } else {
        navigateTo('home');
      }
      break;

    default:
      navigateTo('home');
      break;
    }
  } catch (error) {
    console.error('Route rendering error:', error);
    navigateTo('home');
  }
}

/**
 * Get current route
 */
export function getCurrentRoute() {
  return currentRoute;
}
