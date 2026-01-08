# Reverse Integration: one-pager → genesis

**Purpose**: Integrate improvements from the one-pager project back into the genesis template system so future projects benefit from these enhancements.

**Context**: The one-pager project was created from genesis templates. During development, we made several critical improvements that should be reverse-integrated into genesis so all future genesis-derived projects inherit these fixes.

---

## 📋 Gap Analysis Summary

### 1. **Dependency Updates** ✅ CRITICAL
- **What Changed**: Updated all npm dependencies to latest stable versions
- **Why It Matters**: Security patches, bug fixes, compatibility improvements
- **Impact**: High - affects all new projects

### 2. **ESLint Migration** ✅ CRITICAL  
- **What Changed**: Migrated from `.eslintrc.json` (deprecated) to `eslint.config.js` (flat config)
- **Why It Matters**: ESLint 9.x deprecates old config format
- **Impact**: High - prevents future breakage

### 3. **Navigation UX Improvements** ✅ CRITICAL
- **What Changed**: Added edit-project route, form pre-fill, auto-redirect for incomplete Phase 1
- **Why It Matters**: Better UX when restarting projects
- **Impact**: Medium - improves user experience

### 4. **CI Dependency Monitoring** ✅ IMPORTANT
- **What Changed**: Added npm audit, npm outdated, Python safety checks to CI
- **Why It Matters**: Proactive security and dependency monitoring
- **Impact**: Medium - improves project maintenance

### 5. **Test Framework** ℹ️ INFORMATIONAL
- **What Changed**: one-pager uses Jest; genesis templates use Vitest
- **Why It Matters**: Different test runners, same principles
- **Impact**: Low - both are valid choices

---

## 🎯 Reverse Integration Tasks

Execute these tasks in order. Each task is independent and can be committed separately.

---

## Task 1: Update npm Dependencies in Templates

**Files to Update**:
- `genesis/templates/testing/package-template.json`
- `genesis/templates/github/workflows/ci-template.yml`

**Changes**:

### 1.1 Update `package-template.json`

**Current dependencies** (in genesis):
```json
"devDependencies": {
  "@playwright/test": "^1.40.0",
  "@vitest/coverage-v8": "^1.0.0",
  "eslint": "^8.50.0",
  "happy-dom": "^12.10.0",
  "vitest": "^1.0.0"
}
```

**Updated dependencies** (from one-pager):
```json
"devDependencies": {
  "@playwright/test": "^1.57.0",
  "eslint": "^9.39.2",
  "@eslint/js": "^9.39.2",
  "globals": "^17.0.0"
}
```

**Action**: Update version numbers to match latest stable versions as of 2026-01-07.

**Note**: Keep Vitest for genesis (don't change to Jest). The version numbers are what matter here.

---

## Task 2: Migrate ESLint Configuration to Flat Config

**Files to Create/Update**:
- Create: `genesis/templates/web-app/eslint.config-template.js`
- Deprecate: `genesis/templates/web-app/.eslintrc-template.json` (mark as deprecated, don't delete yet)

**Changes**:

### 2.1 Create `eslint.config-template.js`

Create a new file with this content:

```javascript
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': 'off',
    },
  },
];
```

### 2.2 Add deprecation notice to `.eslintrc-template.json`

Add this comment at the top:
```json
{
  "_comment": "DEPRECATED: This file is deprecated in favor of eslint.config.js (flat config). Will be removed in future version.",
```

### 2.3 Update package-template.json dependencies

Add these to devDependencies:
```json
"@eslint/js": "^9.39.2",
"globals": "^17.0.0"
```

---

## Task 3: Add Navigation Improvements to Templates

**Files to Update**:
- `genesis/templates/web-app/js/router-template.js`
- `genesis/templates/web-app/js/views-template.js`
- `genesis/templates/web-app/js/project-view-template.js`

**Changes**:

### 3.1 Update `router-template.js`

Add support for `edit-project/:id` route.

**Find this section** (around line 15-19):
```javascript
const routes = {
    'home': renderProjectsList,
    'new-project': renderNewProjectForm,
    'project': renderProjectView
};
```

**Add after the routes object** (around line 70-84):

```javascript
// In handleHashChange function, add this case:
} else if (hash.startsWith('edit-project/')) {
    const projectId = hash.split('/')[1];
    navigateTo('edit-project', projectId);
```

**And in the renderRoute function** (create new case):
```javascript
case 'edit-project':
    if (param) {
        const project = await storage.getProject(param);
        if (project) {
            const { renderNewProjectForm } = await import('./views.js');
            renderNewProjectForm(project);
        } else {
            navigateTo('home');
        }
    } else {
        navigateTo('home');
    }
    break;
```

### 3.2 Update `views-template.js`

**Modify `renderNewProjectForm` function signature** (around line 127):

**FROM**:
```javascript
export function renderNewProjectForm() {
```

**TO**:
```javascript
export function renderNewProjectForm(existingProject = null) {
    const isEditing = !!existingProject;
```

**Then update the form HTML** to:
1. Pre-fill values if `existingProject` exists
2. Change button text based on `isEditing`
3. Handle both create and update flows

**Key changes**:
- Title: `${isEditing ? 'Edit Project Details' : 'Create New Project'}`
- Input values: `value="${escapeHtml(existingProject?.title || '')}"`
- Textarea content: `${escapeHtml(existingProject?.problems || '')}`
- Submit button: `${isEditing ? 'Save & Continue to Phase 1' : 'Create Project'}`
- Form submit handler: Check `isEditing` and call `updateProject()` or `createProject()`

**Add info banner for editing mode**:
```html
${isEditing ? `
    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-300">
            💡 Update your project details below. Changes will be saved when you continue to Phase 1.
        </p>
    </div>
` : ''}
```

### 3.3 Update `project-view-template.js`

**Add redirect logic at the start of `renderProjectView`** (after getting project, around line 36-44):

```javascript
// If Phase 1 is not completed, redirect to edit form to fill in details
const phase1Completed = project.phases && project.phases[1] && project.phases[1].completed;
if (!phase1Completed) {
    navigateTo('edit-project/' + projectId);
    return;
}
```

This ensures users can't access the workflow view until they complete Phase 1.

---

## Task 4: Add CI Dependency Monitoring

**Files to Update**:
- `genesis/templates/github/workflows/ci-template.yml`

**Changes**:

### 4.1 Add npm security checks

**In the `test` job**, after "Run tests with coverage" step, add:

```yaml
    - name: Check for npm vulnerabilities
      run: npm audit --audit-level=moderate

    - name: Check for outdated dependencies
      run: |
        echo "Checking for outdated dependencies..."
        npm outdated || true
        echo "Note: Outdated dependencies found above (if any). Consider updating them."
```

### 4.2 Add Python security checks (if Python linting job exists)

**In the Python linting job**, add:

```yaml
    - name: Install Python linting tools
      run: |
        pip install black isort ruff mypy pydocstyle safety

    - name: Check Python dependencies for vulnerabilities
      run: |
        if [ -f requirements.txt ]; then
          safety check --file requirements.txt || true
          echo "Note: Python security check completed."
        fi
```

---

## Task 5: Update CI to Use Latest GitHub Actions

**Files to Update**:
- `genesis/templates/github/workflows/ci-template.yml`
- `genesis/templates/github/workflows/deploy-web-template.yml`

**Changes**:

### 5.1 Update action versions

**FROM**:
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- uses: actions/setup-python@v5
- uses: codecov/codecov-action@v4
```

**TO**:
```yaml
- uses: actions/checkout@v6
- uses: actions/setup-node@v6
- uses: actions/setup-python@v6
- uses: codecov/codecov-action@v5
```

### 5.2 Add Node.js version matrix testing

**Update the test job** to test multiple Node versions:

```yaml
jobs:
  test-js:
    name: JavaScript Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: ['18.x', '20.x', '22.x']

    steps:
    - uses: actions/checkout@v6

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v6
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
```

This ensures compatibility across multiple Node.js versions.

---

## Task 6: Update Documentation Templates

**Files to Update**:
- `genesis/templates/project-structure/CLAUDE-template.md`
- `genesis/genesis/01-AI-INSTRUCTIONS.md`

**Changes**:

### 6.1 Add ESLint migration guidance

Add a new section to AI instructions:

```markdown
## ⚠️ ESLint Configuration

**CRITICAL**: As of ESLint 9.x, the flat config format is required.

- ✅ Use `eslint.config.js` (flat config)
- ❌ Do NOT use `.eslintrc.json` (deprecated)

The genesis templates provide `eslint.config-template.js` which uses the modern flat config format.

**Required dependencies**:
```json
"@eslint/js": "^9.39.2",
"globals": "^17.0.0",
"eslint": "^9.39.2"
```
```

### 6.2 Add navigation pattern documentation

Add to the UX patterns section:

```markdown
## Navigation UX Patterns

**Edit Project Route**: Projects with incomplete Phase 1 should redirect to edit form
- Route: `edit-project/:id`
- Pre-fills form with existing data
- Allows users to update project details before starting workflow
- Prevents access to workflow view until Phase 1 is complete

**Implementation**:
1. Add `edit-project/:id` route to router
2. Modify `renderNewProjectForm()` to accept optional `existingProject` parameter
3. Add redirect logic in `renderProjectView()` to check Phase 1 completion
```

---

## Task 7: Create Reverse Integration Checklist Template

**Files to Create**:
- `genesis/templates/project-structure/REVERSE-INTEGRATION-NOTES-template.md`

**Content**:

```markdown
# Reverse Integration Notes

**Project**: {{PROJECT_NAME}}
**Created From**: Genesis v{{GENESIS_VERSION}}
**Date**: {{DATE}}

---

## Purpose

This document tracks improvements made to this project that should be reverse-integrated back into the genesis template system.

---

## Improvements to Reverse-Integrate

### Template

- [ ] **Improvement Title**
  - **What Changed**: Brief description
  - **Why It Matters**: Impact and rationale
  - **Files Affected**: List of files
  - **Genesis Files to Update**: List of template files
  - **Priority**: High/Medium/Low
  - **Status**: Pending/In Progress/Completed

---

## Completed Reverse Integrations

### Example: Dependency Updates (2026-01-07)
- **What Changed**: Updated npm dependencies to latest stable versions
- **Files Affected**: package.json, package-lock.json
- **Genesis Files Updated**: genesis/templates/testing/package-template.json
- **Status**: ✅ Completed
- **PR**: https://github.com/bordenet/genesis/pull/XXX

---

## Notes

- Keep this document updated as you make improvements
- Review quarterly for reverse-integration opportunities
- Prioritize security fixes and breaking changes
```

---

## 🔍 Verification Steps

After completing all tasks, verify the changes:

### 1. Test Template Generation
```bash
cd genesis
# Generate a new test project
./scripts/create-project.sh test-reverse-integration
cd ../test-reverse-integration
```

### 2. Verify Dependencies
```bash
npm install
npm audit
npm outdated
```

### 3. Verify ESLint
```bash
npm run lint
# Should use eslint.config.js, not .eslintrc.json
```

### 4. Verify Navigation
- Create a new project
- Navigate to project view
- Verify redirect to edit form (Phase 1 incomplete)
- Fill form and submit
- Verify navigation to Phase 1

### 5. Verify CI
```bash
git add .
git commit -m "test: verify reverse integration"
git push
# Check GitHub Actions - all checks should pass
```

---

## 📝 Commit Strategy

Commit each task separately with clear messages:

```bash
# Task 1
git commit -m "chore(deps): update npm dependencies in templates

- Update @playwright/test to ^1.57.0
- Update eslint to ^9.39.2
- Add @eslint/js and globals packages
- Align with latest stable versions as of 2026-01-07"

# Task 2
git commit -m "feat(eslint): migrate to flat config format

- Create eslint.config-template.js
- Deprecate .eslintrc-template.json
- Add required dependencies (@eslint/js, globals)
- Align with ESLint 9.x requirements"

# Task 3
git commit -m "feat(navigation): add edit-project route and form pre-fill

- Add edit-project/:id route to router template
- Update renderNewProjectForm to accept existingProject param
- Add redirect logic for incomplete Phase 1
- Improve UX when restarting projects"

# Task 4
git commit -m "feat(ci): add dependency monitoring to CI templates

- Add npm audit check (moderate level)
- Add npm outdated check
- Add Python safety check
- Proactive security and dependency monitoring"

# Task 5
git commit -m "chore(ci): update GitHub Actions to latest versions

- Update actions/checkout to v6
- Update actions/setup-node to v6
- Update actions/setup-python to v6
- Update codecov/codecov-action to v5
- Add Node.js version matrix (18.x, 20.x, 22.x)"

# Task 6
git commit -m "docs: update templates with ESLint and navigation guidance

- Add ESLint flat config migration guidance
- Document navigation UX patterns
- Update AI instructions with new requirements"

# Task 7
git commit -m "docs: add reverse integration tracking template

- Create REVERSE-INTEGRATION-NOTES-template.md
- Provide structure for tracking improvements
- Encourage systematic reverse integration"
```

---

## 🎯 Success Criteria

- [ ] All template files updated
- [ ] New projects use ESLint flat config
- [ ] Navigation improvements work in new projects
- [ ] CI includes dependency monitoring
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Reverse integration template created
- [ ] Changes committed with clear messages
- [ ] PR created and reviewed

---

## 📚 Reference Files

**one-pager files to reference**:
- `package.json` - Latest dependency versions
- `eslint.config.js` - Flat config example
- `js/router.js` - Edit-project route implementation
- `js/views.js` - Form pre-fill implementation
- `js/project-view.js` - Phase 1 redirect logic
- `.github/workflows/ci.yml` - CI dependency checks

**genesis files to update**:
- `genesis/templates/testing/package-template.json`
- `genesis/templates/web-app/eslint.config-template.js` (create)
- `genesis/templates/web-app/js/router-template.js`
- `genesis/templates/web-app/js/views-template.js`
- `genesis/templates/web-app/js/project-view-template.js`
- `genesis/templates/github/workflows/ci-template.yml`
- `genesis/templates/project-structure/REVERSE-INTEGRATION-NOTES-template.md` (create)

---

## 🚀 Next Steps

1. Review this document thoroughly
2. Execute tasks 1-7 in order
3. Test each change incrementally
4. Commit with clear messages
5. Create PR with summary of all changes
6. Update genesis CHANGELOG.md
7. Tag new genesis version

---

**End of Reverse Integration Prompt**

