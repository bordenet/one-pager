# One-Pager Assistant

Write one-page documents with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/one-pager?style=social)](https://github.com/bordenet/one-pager)

**Try it**: [Assistant](https://bordenet.github.io/one-pager/) · [Validator](https://bordenet.github.io/one-pager/validator/)

> **What is a One-Pager?** A [one-pager](https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md) is a single-page summary that distills a complex topic into its essential points. Used for executive briefings, project proposals, and stakeholder communication, it forces clarity by imposing a strict length constraint.

[![CI](https://github.com/bordenet/one-pager/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/one-pager/actions)
[![codecov](https://codecov.io/gh/bordenet/one-pager/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/one-pager)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/one-pager/)
2. Enter topic, audience, key points
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You provide context. Claude drafts a one-pager.

**Phase 2** — Gemini reviews the draft: What's missing? What's unclear? What's wrong?

**Phase 3** — Claude takes the original draft plus Gemini's critique and produces a final version.

## Usage

1. Open the app
2. Click "New Project", fill in your inputs
3. Copy each phase's prompt to the appropriate AI, paste responses back
4. Export when done

**Mock mode**: On localhost, toggle "AI Mock Mode" (bottom-right) to skip the copy/paste loop. Useful for testing.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/one-pager.git
cd one-pager
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

### Local Development

```bash
npm run serve   # Start local server at http://localhost:8000
```

## Project Structure

```
one-pager/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── index.html            # Main HTML file
```

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
