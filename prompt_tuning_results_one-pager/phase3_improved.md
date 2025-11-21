# Phase 3: Final Synthesis Prompt (IMPROVED)

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

## Guidelines

- **Combine, Don't Compress**: Aim for 550-700 words by including the best details from both versions. Don't sacrifice important context for brevity. If both versions have valuable details, include both.

- **Favor Strategic Framing + Technical Detail**:
  - Use Phase 2's business/strategic framing (titles, problem statements, impact)
  - Add Phase 1's technical specifics (implementation details, metrics baselines)
  - Example: "Transform portal from frustration point into retention driver [Phase 2] through user-centered navigation and contextual help [Phase 1]"

- **Conflict Resolution Heuristics**:
  - **Problem Statement**: Prefer Phase 2's strategic framing (business crisis vs. technical issue)
  - **Solution**: Combine Phase 2's outcome focus with Phase 1's technical approach
  - **Metrics**: Include both Phase 1's specific baselines AND Phase 2's business context
  - **Timeline**: Prefer Phase 2's timeline if it includes risk mitigation
  - **Stakeholders**: Use Phase 2's accountability model if more detailed

- **Preserve Key Details**: If Phase 2 adds important context (risk buffers, pilot gates, strategic positioning), keep it. If Phase 1 has specific technical details Phase 2 lacks, add them back.

- **Consistency Check**: Ensure all 8 sections use consistent naming from the template. If Phase 2 renamed sections, revert to template names.

## Output Format

Provide the final synthesized one-pager in this format:

```markdown
# {Project/Feature Name}

## Problem Statement
{Synthesized version combining best of both}

## Proposed Solution
{Synthesized version combining best of both}

## Key Goals/Benefits
{Synthesized version combining best of both}

## Scope
### In Scope
{Synthesized version combining best of both}

### Out of Scope
{Synthesized version combining best of both}

## Success Metrics
{Synthesized version combining best of both}

## Key Stakeholders
{Synthesized version combining best of both}

## Timeline Estimate
{Synthesized version combining best of both}
```

---

## Version 1: Initial Draft (Claude)

{phase1Output}

---

## Version 2: Gemini Review

{phase2Output}

---

## Your Synthesis

{Work with the user to create the final version}
