# One-Pager Assistant

[![CI](https://github.com/bordenet/one-pager/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/one-pager/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/one-pager/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/one-pager)
[![Node.js 18+](https://img.shields.io/badge/node-18+-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://github.com/pre-commit/pre-commit)
[![Linting: ESLint](https://img.shields.io/badge/linting-ESLint-4B32C3)](https://eslint.org/)
[![Testing: Jest](https://img.shields.io/badge/testing-Jest-C21325)](https://jestjs.io/)
[![Code Style: ESLint](https://img.shields.io/badge/code%20style-ESLint-4B32C3)](https://eslint.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/bordenet/one-pager/graphs/commit-activity)
[![GitHub issues](https://img.shields.io/github/issues/bordenet/one-pager.svg)](https://github.com/bordenet/one-pager/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/bordenet/one-pager.svg)](https://github.com/bordenet/one-pager/pulls)

An opinionated, AI-assisted workflow helper for generating crisp and high-quality one-pager documents.

**🌐 Try it now: [https://bordenet.github.io/one-pager/](https://bordenet.github.io/one-pager/)**

---

## What is This?

This tool helps you create high-quality one-pager documents using a 3-phase AI workflow that leverages the different perspectives of Claude and Gemini to produce superior results.

**Why two different AI models?** The differences between Claude and Gemini's viewpoints are what make rapid iteration to value possible. Each model brings unique strengths that, when combined, create better documents than either could produce alone.

---

## 🤖 For AI Assistants

**READ THIS FIRST**: Before working on this codebase, read [`CLAUDE.md`](CLAUDE.md) for mandatory workflow requirements:
- ✅ ALWAYS lint code after creating/modifying it (`npm run lint`)
- ✅ ALWAYS run tests after creating/modifying tests (`npm test`)
- ✅ ALWAYS proactively communicate "what's left" - don't wait to be asked
- ❌ NEVER include `node_modules/`, `coverage/`, or build artifacts
- ❌ NEVER create files without linting and testing them

---

## Quick Start

### Use the Web App (Recommended)

**🌐 [Launch Web App](https://bordenet.github.io/one-pager/)**

- ✅ No download required
- ✅ Works on any device
- ✅ 100% client-side - all data stored in your browser
- ✅ Privacy-first - no server, no tracking
- ✅ Export/import projects as JSON files

### Run Locally

```bash
# Clone repository
git clone https://github.com/bordenet/one-pager.git
cd one-pager

# Open index.html in your browser
open index.html
```

---

## How It Works

### 3-Phase Workflow

**Phase 1: Initial Draft (Claude Mock)**
- Fill in one-pager template fields
- AI (mocked in early builds) generates initial draft through Q&A
- Download markdown document

**Phase 2: Gemini Review Preparation**
- Tool generates a prompt for Gemini
- Prompt includes the template and your Phase 1 document
- Copy the prompt and paste into [Gemini](https://gemini.google.com)
- Work with Gemini to improve the document
- Copy Gemini's improved version back into the tool

**Phase 3: Final Synthesis (Claude Mock)**
- Tool generates a synthesis prompt for Claude
- Prompt includes both Phase 1 (Claude) and Phase 2 (Gemini) versions
- AI (mocked) synthesizes the best of both versions through Q&A
- Download final, polished markdown document

### Template Structure

Based on [The One-Pager](https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md) methodology:

1. **Project/Feature Name**: Clear, descriptive title
2. **Problem Statement**: What specific problem are you solving?
3. **Proposed Solution**: High-level description of the solution
4. **Key Goals/Benefits**: Measurable outcomes
5. **Scope (and Out-of-Scope)**: What's included and what's not
6. **Success Metrics**: 2-3 key performance indicators
7. **Key Stakeholders**: Owners, approvers, contributors
8. **Timeline Estimate**: High-level milestones

---

## Features

- **3-Phase AI Workflow**: Leverage Claude and Gemini's different perspectives
- **Template-Driven**: Based on proven one-pager methodology
- **Local Storage**: All data stored in browser using IndexedDB
- **Export/Import**: Save and load projects as JSON files
- **Dark Mode**: Automatic dark mode support
- **Privacy-First**: No server, no tracking, no data collection
- **AI Mock Mode**: Test the workflow without API costs (development feature)

---

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/bordenet/one-pager.git
cd one-pager

# Install dependencies
npm install

# Set up pre-commit hooks (automatic via npm install)
# Or manually: pre-commit install
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Run all quality checks (lint + coverage)
npm run quality

# Run pre-commit hooks manually
pre-commit run --all-files
```

### Pre-Commit Hooks

This project uses pre-commit hooks to enforce code quality. All commits must pass:

- **ESLint** - Code linting (auto-fixes where possible)
- **Jest** - All tests must pass with 73%+ coverage
- **File checks** - Trailing whitespace, EOF, large files, etc.

The hooks run automatically on `git commit`. If they fail, the commit is blocked.

To bypass hooks (not recommended):
```bash
git commit --no-verify
```

### Deploy to GitHub Pages

The project includes a deployment script that copies required files to the `docs/` directory for GitHub Pages hosting.

```bash
# Preview deployment (dry-run)
./scripts/deploy-web.sh --dry-run

# Deploy to docs/ directory
./scripts/deploy-web.sh

# Deploy with verbose output
./scripts/deploy-web.sh -v

# Show help
./scripts/deploy-web.sh --help
```

**After deployment:**

1. Review changes: `git status`
2. Commit: `git add docs/ && git commit -m 'Deploy to GitHub Pages'`
3. Push: `git push origin main`
4. Wait 2-5 minutes for GitHub Pages to deploy
5. Visit: https://bordenet.github.io/one-pager/

**What gets deployed:**
- `index.html` - Main application
- `css/styles.css` - Styles
- `js/*.js` - All JavaScript modules
- `prompts/*.md` - Prompt templates
- `templates/*.md` - Document templates

**What's excluded:**
- Development files (`node_modules/`, `tests/`, `coverage/`)
- Configuration files (`package.json`, `jest.config.js`, etc.)
- Documentation (`README.md`, `CLAUDE.md`, etc.)

### Project Structure

```
one-pager/
├── index.html              # Main application
├── css/
│   └── styles.css          # Custom styles
├── js/
│   ├── app.js              # Main app logic
│   ├── workflow.js         # 3-phase workflow
│   ├── storage.js          # IndexedDB storage
│   └── ai-mock.js          # Mock AI for testing
├── prompts/
│   ├── phase1.md           # Phase 1 prompt template
│   ├── phase2.md           # Phase 2 prompt template
│   └── phase3.md           # Phase 3 prompt template
├── templates/
│   └── one-pager-template.md  # One-pager structure
└── tests/
    ├── storage.test.js     # Unit tests
    ├── workflow.test.js    # Workflow tests
    └── ai-mock.test.js     # Mock tests
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Related

- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant) - Similar workflow for PRD documents
- [The One-Pager Methodology](https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md) - Template source
- [Engineering Culture](https://github.com/bordenet/Engineering_Culture) - Engineering best practices

---

**Created with [Genesis](https://github.com/bordenet/genesis) project templates**
