# AI Assistant Instructions for one-pager

**Project Status**: Production-ready. Live at https://bordenet.github.io/one-pager/

**📐 Design Patterns**: See [DESIGN-PATTERNS.md](./DESIGN-PATTERNS.md) for architecture and coding patterns used across all genesis-tools repos.

---

## ⚠️ CRITICAL: Fix ALL Linting Issues Immediately

**MANDATE**: When you detect ANY linting issue in a file you're working with, you MUST fix it immediately - regardless of whether it was pre-existing or newly introduced.

- Do NOT note that issues are "pre-existing" and move on
- Do NOT defer fixing to a later step
- Do NOT push code with known linting issues
- Fix ALL issues in the file before committing

**Rationale**: Linting issues indicate code quality problems. Ignoring them because they existed before your changes still means shipping low-quality code.

---

## 🎯 Core Principles

### 0. **MANDATORY: Reference Known-Good Implementations FIRST**

**⚠️ BEFORE implementing ANY feature, reference these working examples:**

#### Primary References:
1. **[architecture-decision-record](https://github.com/bordenet/architecture-decision-record)** ⭐ **PRIMARY**
   - Canonical implementation for all genesis-tools
   - 3-phase workflow architecture
   - Form-to-prompt pattern
   - Deployment scripts

2. **[product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)** ⭐ **SECONDARY**
   - Dark mode toggle patterns
   - Setup scripts (fast, resumable, smart caching)

### 1. **MANDATORY: Manual Deployment After CI Passes**

**ALL deployments MUST follow this 3-step process:**

```bash
# Step 1: Push changes to GitHub
git add .
git commit -m "feat: description of changes"
git push origin main

# Step 2: WAIT for CI to pass
# Check: https://github.com/bordenet/one-pager/actions
# ⚠️ DO NOT PROCEED until all checks are GREEN

# Step 3: Deploy ONLY after CI passes
./scripts/deploy-web.sh
```

**Why**:
- CI runs comprehensive quality gates (lint, test, coverage)
- Deploying before CI passes can ship broken code
- CI is the single source of truth for code quality

#### If CI Fails:
1. Fix the issues locally
2. Push fixes
3. Wait for CI to pass
4. THEN deploy

### 2. **ALWAYS Complete the Full Workflow**
When asked to do a task, you MUST:
1. ✅ Complete the work
2. ✅ Lint the code (`npm run lint` or `npm run lint:fix`)
3. ✅ Run tests (`npm test`)
4. ✅ Verify tests pass
5. ✅ **PROACTIVELY tell the user what's left**

---

## 🏗️ Project Structure

### Main Application
- `index.html` - Main application (3-phase workflow)
- `css/` - Styles (Tailwind + custom)
- `js/` - JavaScript modules (ES6)
- `tests/` - Jest unit tests

### Scripts
- **`scripts/setup-macos.sh`** - Install ALL dependencies
- **`scripts/deploy-web.sh`** - Deploy to GitHub Pages

### Configuration
- `package.json` - Dependencies and scripts
- `jest.config.js` - Test configuration
- `eslint.config.js` - Linting rules

---

## 🧪 Testing Standards

### Coverage Requirements
- **Main application**: 85% minimum (statements, branches, functions, lines)
- **UI code**: Can be excluded if E2E tested

### Test Commands
```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

---

## 🚫 What NOT to Do

### NEVER
- ❌ Deploy before CI passes
- ❌ Create files without linting them
- ❌ Create tests without running them
- ❌ Commit `node_modules/` or build artifacts
- ❌ Make user ask "what's left?" multiple times

### ALWAYS
- ✅ Wait for CI to pass before deploying
- ✅ Use `./scripts/deploy-web.sh` for deployments
- ✅ Lint after creating/modifying code
- ✅ Run tests after creating/modifying tests
- ✅ Proactively communicate what's left

---

**Remember**: CI is the single source of truth for code quality.
