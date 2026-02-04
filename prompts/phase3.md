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
- **Maintain Conciseness**: Keep it to one page (500-700 words)
- **Ensure Consistency**: Make sure all sections align and support each other
- **Ask When Uncertain**: If both versions have merit but conflict, ask the user to choose
- **Zero AI Slop**: Final document must have no vague terms, filler, or buzzwords

## Output Format

**IMPORTANT**: Do NOT provide the final markdown document until all clarifying questions have been answered and the user confirms they are satisfied with the synthesis. Only after the Q&A process is complete should you output the final synthesized one-pager in markdown format.

Provide the final synthesized one-pager in this format:

```markdown
# {Project/Feature Name}

## Problem Statement
{Synthesized version combining best of both}

## Cost of Doing Nothing
[OPTIONAL - Only include this section if present in both versions. Omit entirely if not needed. Do not write "N/A"]
{Synthesized version combining best of both}

## Proposed Solution
{Synthesized version combining best of both}

## Key Goals/Benefits
{Synthesized version combining best of both}

## Scope
**In Scope:** {Synthesized version combining best of both}
**Out of Scope:** {Synthesized version combining best of both}

## Success Metrics
{Synthesized version combining best of both}

## Key Stakeholders
{Synthesized version combining best of both}

## Timeline
{Synthesized version combining best of both}
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
