# One-Pager Assistant

[![CI](https://github.com/bordenet/one-pager/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/one-pager/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/one-pager/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/one-pager)
[![Coverage](https://img.shields.io/badge/coverage-28.82%25-orange.svg)](https://github.com/bordenet/one-pager)
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

This tool helps you create high-quality one-pager documents using a 3-phase AI workflow that uses the different perspectives of Claude and Gemini to produce superior results.

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

No download, works on any device, 100% client-side, and privacy-first.

### Run Locally

#### Automated Setup (Recommended)

Choose your platform and run the appropriate setup script:

**macOS:**

```bash
git clone https://github.com/bordenet/one-pager.git
cd one-pager
./scripts/setup-macos.sh
```

**Linux (Ubuntu/Debian):**

```bash
git clone https://github.com/bordenet/one-pager.git
cd one-pager
./scripts/setup-linux.sh
```

**Windows (WSL):**

```bash
git clone https://github.com/bordenet/one-pager.git
cd one-pager
./scripts/setup-windows-wsl.sh
```

**Windows (PowerShell):**

```powershell
git clone https://github.com/bordenet/one-pager.git
cd one-pager
.\scripts\setup-windows.ps1
```

#### Manual Setup

```bash
# Clone repository
git clone https://github.com/bordenet/one-pager.git
cd one-pager

# Install dependencies
npm install

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

### One-Pager Template

A one-pager is a concise 1-page document that captures a project or feature request. Based on [The One-Pager](https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md) methodology:

```markdown
# [Project Name]

## Problem Statement
[What problem are you solving? 2-3 sentences.]

## Cost of Doing Nothing
[What happens if we don't solve this? Business impact, urgency, consequences. 2-3 sentences.]

## Proposed Solution
[High-level approach. 3-4 sentences.]

## Key Goals/Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Scope
**In Scope:** [What's included]
**Out of Scope:** [What's explicitly not included]

## Success Metrics
- [Metric 1]: [Target]
- [Metric 2]: [Target]

## Key Stakeholders
- **Owner**: [Name]
- **Approvers**: [Names]
- **Contributors**: [Names]

## Timeline
- **Phase 1**: [Milestone] - [Date]
- **Launch**: [Date]
```

**Key principles:**
- Be ruthlessly concise (500-700 words max)
- Focus on the "why" before the "what"
- Quantify outcomes whenever possible
- Distinguish benefits from features

---

## Features

- **3-Phase AI Workflow**: Leverage Claude and Gemini's different perspectives
- **Local Storage & Export/Import**: Store projects in browser (IndexedDB) or save/load as JSON files
- **Privacy-First**: No server, no tracking, no data collection
- **Dark Mode**: Automatic dark mode support
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

### Running Tests & Quality Checks

```bash
# Run all tests (or with coverage)
npm test
npm run test:coverage

# Run linting (or auto-fix)
npm run lint
npm run lint:fix

# Run all checks at once
npm run quality
```

### Pre-Commit Hooks

This project uses pre-commit hooks to enforce code quality. All commits must pass:

- **ESLint** - Code linting (auto-fixes where possible)
- **Jest** - All tests must pass with 25%+ coverage (target: 70%)
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

## Code Coverage

One-Pager maintains **28.82% test coverage** with active development to improve coverage. The coverage visualization below shows detailed coverage by module:

[![Coverage Grid](https://codecov.io/gh/bordenet/one-pager/graphs/tree.svg)](https://codecov.io/gh/bordenet/one-pager)

**What this means:**
- **Green**: Well-tested code (>80% coverage)
- **Yellow**: Moderate coverage (60-80%)
- **Red**: Needs more tests (<60%)
- **Size**: Larger boxes = more lines of code

Click the image to explore detailed coverage reports on Codecov, including line-by-line coverage, branch coverage, and historical trends.

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
