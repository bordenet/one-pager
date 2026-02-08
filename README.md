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

---

## Scoring Methodology

The validator scores one-pagers on a 100-point scale across four dimensions. This scoring system enforces the core principle of one-pagers: forcing clarity through constraint. A document that fits on one page but lacks substance fails; a document with great content that sprawls fails equally.

### Scoring Taxonomy

| Category | Weight | Rationale |
|----------|--------|-----------|
| **Problem Clarity** | 30 pts | Validates that the problem is root-cause, not symptom, with quantified cost |
| **Solution Quality** | 25 pts | Ensures solution addresses stated problem with measurable goals |
| **Scope Discipline** | 25 pts | Enforces explicit in-scope/out-of-scope boundaries with SMART metrics |
| **Completeness** | 20 pts | Validates required sections, stakeholders, and timeline |

### Why These Weights?

**Problem Clarity (30 pts)** receives the highest weight because one-pagers fail most often at problem definition. Authors jump to solutions without establishing why the problem matters. The validator requires:
- **Problem statement** (10 pts): Dedicated problem section with clear ROOT CAUSE, not symptoms
- **Cost of doing nothing** (10 pts): REQUIRED. Quantified impact with specific $ or % numbers
- **Business focus** (10 pts): Problem tied to customer/business value (keywords: customer, user, revenue, market, strategic)

**Solution Quality (25 pts)** ensures the solution actually addresses the stated problem. The validator checks:
- **Solution addresses problem** (10 pts): Dedicated solution section that bridges to stated problem
- **Measurable goals** (10 pts): Goals with `[Baseline] → [Target]` format, not vague claims
- **High-level approach** (5 pts): Solution stays strategic—penalizes implementation details (code, API, database)

**Scope Discipline (25 pts)** is what distinguishes a one-pager from a rambling proposal. The validator enforces:
- **In-scope defined** (8 pts): Explicit "in-scope" or "we will" statements with dedicated section
- **Out-of-scope defined** (9 pts): Explicit "out-of-scope" or "we will not" statements
- **SMART metrics** (8 pts): Success metrics with `[Current] → [Target] by [Date]` format

**Completeness (20 pts)** validates structural requirements:
- **Required sections** (8 pts): Problem, Solution, Goals, Scope, Metrics, Stakeholders, Timeline sections present
- **Stakeholders identified** (6 pts): Owner, approvers, RACI roles defined
- **Timeline phased** (6 pts): Milestones with dates, phased approach

### Adversarial Robustness

The scoring system addresses common one-pager failures:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Vague problem statement | Cost of doing nothing requires specific $ or % numbers |
| Solution without connection to problem | "Logical bridge check" validates solution-problem alignment |
| Claiming goals without baselines | Measurable goals require `[Baseline] → [Target]` format |
| Omitting out-of-scope | Out-of-scope section is independently scored |
| Adding implementation details | Implementation keywords trigger deductions in Solution Quality |

### Calibration Notes

The **logical bridge check** is the most sophisticated validation. The validator doesn't just check for section presence—it analyzes whether the solution section references concepts from the problem section. A one-pager that defines Problem A but proposes Solution B will fail even if both sections are well-written.

The **implementation detail penalty** reflects the strategic nature of one-pagers. Terms like "API," "database," "microservice," or code snippets signal that the author is prescribing implementation rather than defining outcomes. The solution should answer "what will change" not "how we'll build it."

---

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

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
