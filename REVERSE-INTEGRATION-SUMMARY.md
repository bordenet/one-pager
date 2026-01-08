# Reverse Integration Summary

**Date**: 2026-01-07  
**From**: one-pager project  
**To**: genesis template system  
**Full Prompt**: See `REVERSE-INTEGRATION-PROMPT.md`

---

## Quick Overview

This document provides a high-level summary of improvements to reverse-integrate from one-pager back into genesis.

---

## 7 Tasks to Complete

### ✅ Task 1: Update npm Dependencies
- Update package-template.json with latest versions
- @playwright/test: ^1.57.0
- eslint: ^9.39.2
- Add @eslint/js and globals

### ✅ Task 2: Migrate ESLint to Flat Config
- Create eslint.config-template.js
- Deprecate .eslintrc-template.json
- Required for ESLint 9.x compatibility

### ✅ Task 3: Add Navigation Improvements
- Add edit-project/:id route
- Form pre-fill for existing projects
- Redirect to edit form if Phase 1 incomplete

### ✅ Task 4: Add CI Dependency Monitoring
- npm audit --audit-level=moderate
- npm outdated check
- Python safety check

### ✅ Task 5: Update GitHub Actions
- actions/checkout@v6
- actions/setup-node@v6
- actions/setup-python@v6
- codecov/codecov-action@v5
- Add Node.js version matrix (18.x, 20.x, 22.x)

### ✅ Task 6: Update Documentation
- ESLint migration guidance
- Navigation UX patterns
- Update AI instructions

### ✅ Task 7: Create Reverse Integration Template
- Add REVERSE-INTEGRATION-NOTES-template.md
- Systematic tracking of improvements

---

## Files to Update in Genesis

### Templates to Modify:
1. `genesis/templates/testing/package-template.json`
2. `genesis/templates/web-app/js/router-template.js`
3. `genesis/templates/web-app/js/views-template.js`
4. `genesis/templates/web-app/js/project-view-template.js`
5. `genesis/templates/github/workflows/ci-template.yml`
6. `genesis/templates/github/workflows/deploy-web-template.yml`
7. `genesis/templates/project-structure/CLAUDE-template.md`
8. `genesis/genesis/01-AI-INSTRUCTIONS.md`

### Templates to Create:
1. `genesis/templates/web-app/eslint.config-template.js`
2. `genesis/templates/project-structure/REVERSE-INTEGRATION-NOTES-template.md`

### Templates to Deprecate:
1. `genesis/templates/web-app/.eslintrc-template.json` (mark as deprecated)

---

## Reference Files in one-pager

Use these as examples:
- `package.json` - Latest dependencies
- `eslint.config.js` - Flat config format
- `js/router.js` - Edit-project route
- `js/views.js` - Form pre-fill logic
- `js/project-view.js` - Phase 1 redirect
- `.github/workflows/ci.yml` - Dependency checks

---

## Estimated Time

- **Task 1**: 15 minutes
- **Task 2**: 20 minutes
- **Task 3**: 45 minutes
- **Task 4**: 15 minutes
- **Task 5**: 10 minutes
- **Task 6**: 20 minutes
- **Task 7**: 10 minutes

**Total**: ~2.5 hours

---

## Testing Checklist

After completing all tasks:

- [ ] Generate new test project from genesis
- [ ] Verify npm install works
- [ ] Verify npm audit passes
- [ ] Verify eslint.config.js is used (not .eslintrc.json)
- [ ] Verify edit-project route works
- [ ] Verify form pre-fill works
- [ ] Verify Phase 1 redirect works
- [ ] Verify CI passes with all new checks
- [ ] Verify Node.js matrix testing works

---

## Commit Messages

Use these commit message templates:

```bash
chore(deps): update npm dependencies in templates
feat(eslint): migrate to flat config format
feat(navigation): add edit-project route and form pre-fill
feat(ci): add dependency monitoring to CI templates
chore(ci): update GitHub Actions to latest versions
docs: update templates with ESLint and navigation guidance
docs: add reverse integration tracking template
```

---

## Success Criteria

✅ All template files updated  
✅ New projects use ESLint flat config  
✅ Navigation improvements work  
✅ CI includes dependency monitoring  
✅ All tests pass  
✅ Documentation updated  
✅ Reverse integration template created  

---

**For detailed step-by-step instructions, see `REVERSE-INTEGRATION-PROMPT.md`**

