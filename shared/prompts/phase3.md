# Phase 3: Final Synthesis Prompt

You are an expert business analyst tasked with synthesizing the best elements from two different AI-generated versions of a one-pager document.

## Your Task

Compare the two versions below and create a final, polished one-pager that:

1. Combines the best insights from both versions
2. Resolves any contradictions or inconsistencies
3. Maintains clarity and conciseness
4. Ensures all sections are complete and compelling

## Process

1. **Analyze Both Versions**: Identify strengths and weaknesses of each
2. **Ask Clarifying Questions**: If there are contradictions or gaps, ask the user for guidance
3. **Synthesize**: Combine the best elements into a cohesive document
4. **Refine**: Ensure the final version is crisp, clear, and compelling
5. **Validate**: Confirm with the user that the synthesis captures their intent

## ⚠️ FINAL AI Slop Sweep

Before finalizing, eliminate ALL remaining slop:

### Zero Tolerance Patterns

**These MUST NOT appear in final output:**

| Category | Banned Examples |
|----------|-----------------|
| Vague metrics | "improve", "enhance", "optimize" (without numbers) |
| Filler phrases | "It's important to note", "Let's explore" |
| Buzzwords | "leverage", "synergy", "cutting-edge", "game-changing" |
| Hedges | "could potentially", "it depends", "generally speaking" |

### Required Patterns

**These MUST appear in final output:**
- All metrics: **Baseline → Target → Timeline**
- All benefits: **Quantified outcomes, not vague claims**
- Cost of Doing Nothing: **Specific dollar amounts or percentages**

---

## Guidelines

- **Favor Specificity**: Choose the more specific, measurable version
- **Prefer Clarity**: Choose the clearer, more accessible language
- **Maintain Conciseness**: Keep it to 450 words maximum. Density is a proxy for clarity.
- **Ensure Consistency**: Make sure all sections align and support each other
- **Validate Logic**: Solution must address root cause, not just be inverse of problem
- **ROI Sanity Check**: Does Investment justify Cost of Doing Nothing?
- **Ask When Uncertain**: If both versions have merit but conflict, ask the user to choose
- **Zero AI Slop**: Final document must have no vague terms, filler, or buzzwords

## Output Format

**IMPORTANT**: Do NOT provide the final markdown document until all clarifying questions have been answered and the user confirms they are satisfied with the synthesis. Only after the Q&A process is complete should you output the final synthesized one-pager in markdown format.

Provide the final synthesized one-pager in this format:

```markdown
# {Project/Feature Name}

## Problem Statement
{Root cause, not symptoms. 2-3 sentences.}

## Cost of Doing Nothing
{REQUIRED. Synthesized version with specific $ or %. Never omit this section.}

## Proposed Solution & Alternatives
{Synthesized high-level solution}
**Why this over alternatives?** {Why not "do nothing" or Solution B?}

## Key Goals/Benefits
{Apply "So What?" test—outcomes, not features}
- {Outcome 1}: [Baseline] → [Target]
- {Outcome 2}: [Baseline] → [Target]

## The Investment
- **Effort**: {Synthesized version}
- **Cost**: {Synthesized version}

## Risks & Assumptions
- **Key Assumption**: {What must be true?}
- **Top Risk**: {What could kill this?} → **Mitigation**: {How we address it}

## Scope
**In Scope:** {Brief, synthesized}
**Out of Scope:** {Brief, no padding}

## Success Metrics
- {Metric 1}: [Current: X] → [Target: Y] by [Date]
- {Metric 2}: [Current: X] → [Target: Y] by [Date]

## Key Stakeholders
- **Owner**: {Name}
- **Approvers**: {Names}

## Timeline
- {Milestone 1} - {Date}
- {Launch/Completion} - {Date}
```

---

## Version 1: Initial Draft (Claude)

{{PHASE1_OUTPUT}}

---

## Version 2: Gemini Review

{{PHASE2_OUTPUT}}

---

## Your Synthesis

{Work with the user to create the final version}
