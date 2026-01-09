# AI Assistant Instructions for one-pager

**CRITICAL**: Read this file FIRST before working on this codebase.

---

## 🎯 Core Principles

### 1. **ALWAYS Complete the Full Workflow**

When asked to do a task, you MUST:

1. ✅ Complete the work
2. ✅ Lint the code (`npm run lint` or `npm run lint:fix`)
3. ✅ Run tests (`npm test`)
4. ✅ Verify tests pass
5. ✅ Check coverage if applicable
6. ✅ **PROACTIVELY tell the user what's left** - don't wait to be asked

**BAD**: "I've created the files."
**GOOD**: "I've created the files, linted them (0 errors), ran tests (37/37 passing), and verified coverage (73%). What's left: [specific list]"

### 2. **NEVER Include Build Artifacts**

When creating examples or templates:

- ❌ NEVER commit `node_modules/`
- ❌ NEVER commit `coverage/`
- ❌ NEVER commit `dist/` or `build/`
- ✅ ALWAYS create `.gitignore` files
- ✅ ALWAYS verify directory size before committing

### 3. **Proactive Status Updates**

After EVERY significant change:

```text
✅ What I did: [specific actions]
✅ Quality checks: [linting, tests, coverage]
✅ What's left: [specific remaining tasks]
```

Don't make the user ask "what's left?" multiple times.

### 4. **ALWAYS Fix Lint Warnings Immediately**

When you spot ANY lint warning (new or old):

- ❌ NEVER say "that's an existing warning" and move on
- ❌ NEVER defer fixing to later
- ✅ ALWAYS fix it immediately, in the same commit
- ✅ No excuses, no exceptions

**This applies to ALL files touched or viewed during your work.**

---

## 📋 Standard Workflow Checklist

### When Creating New Code

- [ ] Write the code
- [ ] Create/update tests
- [ ] Run linter: `npm run lint` or `npm run lint:fix`
- [ ] Run tests: `npm test`
- [ ] Check coverage: `npm run test:coverage` (if applicable)
- [ ] Verify all checks pass
- [ ] Create `.gitignore` if needed
- [ ] **Tell user: what's done, what's left**

### When Modifying Existing Code

- [ ] Make changes
- [ ] Update affected tests
- [ ] Run linter
- [ ] Run tests
- [ ] Verify no regressions
- [ ] **Tell user: what's done, what's left**

### When Asked "What's Left?"

This means you failed to proactively communicate. Improve by:

1. Always ending responses with "What's left: [list]"
2. Being specific about remaining tasks
3. Prioritizing tasks (blocking vs. nice-to-have)

---

## 🐍 Python Style Guide (MANDATORY)

All Python code in `scripts/` MUST follow these conventions:

### Formatting & Linting

- **Black**: Line length 120, run `black --line-length=120 scripts/*.py`
- **isort**: Profile black, run `isort --profile black --line-length 120 scripts/*.py`
- **Ruff**: Run `ruff check scripts/*.py` (must pass with 0 errors)
- **mypy**: Run `mypy scripts/*.py --ignore-missing-imports` (must pass)

### Type Annotations (REQUIRED)

- ALL function parameters must have type hints
- ALL return values must have type hints
- ALL class attributes must have type hints
- Use `Optional[T]` for nullable types
- Use `List`, `Dict`, `Tuple` from typing module

### Docstrings (REQUIRED)

- ALL public functions must have docstrings
- ALL classes must have docstrings
- Use Google-style docstrings

### Before Committing Python Code

```bash
# Format code
black --line-length=120 scripts/*.py
isort --profile black --line-length 120 scripts/*.py

# Verify linting passes
ruff check scripts/*.py
mypy scripts/*.py --ignore-missing-imports
```

---

## 🎨 UI Style Guide (MANDATORY)

All UI components in this project MUST follow the conventions in `UI_STYLE_GUIDE.md`. Key requirements:

- **Button colors**: Blue (primary), Green (save/success), Red (delete/danger), Gray (secondary/navigation)
- **Button copy**: Use exact labels specified (e.g., "📋 Copy Prompt to Clipboard", "Next Phase →")
- **Layout**: Delete button always on right, navigation on left
- **Required fields**: Asterisks in red (`<span class="text-red-500">*</span>`)
- **Modals**: Dismiss via ×, Close button, backdrop click, or Escape key
- **Completion states**: ALWAYS show prominent CTA when workflow is complete (users must never wonder "what's next?")

This guide ensures design parity across all tools in this ecosystem.

### For Sibling Projects

The UI Style Guide is also available at:
- **GitHub Instructions**: `.github/instructions/ui-style.instructions.md` (AI-readable format)
- **Remote URL**: https://github.com/bordenet/one-pager/blob/main/UI_STYLE_GUIDE.md

Sibling projects should reference these files to maintain UI consistency across the ecosystem.

---

## 🏗️ Project Structure

### Main Application

- `index.html` - Main application (3-phase workflow)
- `css/` - Styles (Tailwind + custom)
- `js/` - JavaScript modules (ES6)
- `prompts/` - LLM prompt templates (markdown)
- `templates/` - One-pager template structure
- `tests/` - Jest unit tests

### Configuration

- `.env.example` - Environment template (tracked in git)
- `.env` - Actual secrets (gitignored, never commit)
- `package.json` - Dependencies and scripts
- `jest.config.js` - Test configuration
- `.eslintrc.json` - Linting rules

---

## 🧪 Testing Standards

### Coverage Requirements

- **Main application**: 85% minimum (statements, branches, functions, lines)
- **UI code**: Can be excluded if E2E tested

### Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint

# Fix linting errors
npm run lint:fix
```

### ALWAYS Run These After Code Changes

1. `npm run lint` (or `lint:fix`)
2. `npm test`
3. Verify output shows all passing

---

## 🚫 What NOT to Do

### NEVER

- ❌ Create files without linting them
- ❌ Create tests without running them
- ❌ Commit `node_modules/` or build artifacts
- ❌ Make user ask "what's left?" multiple times
- ❌ Use hyperbolic language ("amazing", "revolutionary", "production-grade")
- ❌ Create documentation files unless explicitly requested
- ❌ Do more than the user asked

### ALWAYS

- ✅ Lint after creating/modifying code
- ✅ Run tests after creating/modifying tests
- ✅ Create `.gitignore` for new directories with dependencies
- ✅ Proactively communicate what's left
- ✅ Use factual, professional language
- ✅ Ask before committing, pushing, or deploying

---

## 📝 Communication Style

### User Expectations

- **No flattery**: Don't say "great question", "excellent idea", etc.
- **Be direct**: Skip pleasantries, get to the point
- **Be specific**: "37/37 tests passing" not "tests are working"
- **Be proactive**: Always end with "What's left: [list]"

### Status Update Template

```text
✅ Completed:
- [Specific action 1]
- [Specific action 2]

✅ Quality Checks:
- Linting: PASSED (0 errors)
- Tests: PASSED (37/37)
- Coverage: 73% (exceeds 70% threshold)

✅ What's Left:
- [Specific remaining task 1]
- [Specific remaining task 2]
```

---

**Remember**: Match the user's high standards for professionalism and completeness.
