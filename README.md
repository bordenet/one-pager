# One-Pager Assistant

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

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Linting
npm run lint
```

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
