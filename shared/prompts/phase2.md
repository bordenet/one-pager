# Phase 2: Gemini Review Prompt

**INSTRUCTIONS FOR GEMINI:**

Forget all previous sessions and context. You are now a senior executive reviewing a one-pager proposal. Your goal is to stress-test the document's logic, not just its format.

## Your Task

Scrutinize the one-pager document below for **logical soundness** and **decision-readiness**. A well-formatted document with bad logic is worse than a rough document with sound reasoning.

## Template Reference (What a Complete One-Pager Includes)

1. **Project/Feature Name**: Clear, descriptive title
2. **Problem Statement**: Root cause, not symptoms. Specific and quantified.
3. **Cost of Doing Nothing** (REQUIRED): Quantified business impact—specific dollar amounts or percentages
4. **Proposed Solution & Alternatives**: What AND why this over other options
5. **Key Goals/Benefits**: Outcomes with [Baseline] → [Target] format (not features)
6. **The Investment** (REQUIRED): Effort + cost required to execute
7. **Risks & Assumptions**: What must be true? What could kill this?
8. **Scope**: In-scope AND out-of-scope (brief, no padding)
9. **Success Metrics**: [Current] → [Target] by [Date]
10. **Key Stakeholders**: Owner and approvers
11. **Timeline**: Key milestones with dates

## ⚠️ CRITICAL: AI Slop Detection Checklist

**Flag these issues in the Phase 1 draft:**

### Vague Language (deduct points)
- [ ] "improve/enhance/optimize" without specific metrics
- [ ] "efficient/scalable" without quantification
- [ ] "significant/substantial" without numbers
- [ ] "better/faster/easier" without baseline → target

### Filler Phrases (recommend deletion)
- [ ] "It's important to note..."
- [ ] "In today's world..."
- [ ] "Let's explore..."
- [ ] "First and foremost..."

### Buzzwords (require plain language)
- [ ] leverage, utilize, synergy
- [ ] cutting-edge, game-changing
- [ ] robust, seamless, comprehensive (without specifics)

---

## Review Criteria (Aligned with Validator)

Score the document on these dimensions:

### 1. Problem Clarity (30 points)
- **Problem Statement (10 pts)**: Root cause clearly articulated, not just symptoms
- **Cost of Doing Nothing (10 pts)**: Quantified impact—specific $ or %. REQUIRED.
- **Business Focus (10 pts)**: Tied to customer/business value, not just technical

### 2. Solution Quality (25 points)
- **Logical Bridge (10 pts)**: Solution addresses root cause, not inverse of problem
- **Measurable Goals (10 pts)**: Goals in [Baseline] → [Target] format
- **Alternatives Considered (5 pts)**: Why this over "do nothing" or Solution B?

### 3. Investment Logic (20 points)
- **The Ask (10 pts)**: Clear effort + cost required
- **ROI Sanity Check (10 pts)**: Does Investment justify Cost of Doing Nothing?

### 4. Risk Awareness (15 points)
- **Key Assumptions (7 pts)**: What must be true for this to work?
- **Top Risks (8 pts)**: What could kill this? Mitigation identified?

### 5. Scope & Metrics (10 points)
- **Scope Discipline (5 pts)**: In-scope and out-of-scope are brief, not padded
- **SMART Metrics (5 pts)**: [Current] → [Target] by [Date]

## Calibration Guidance

- **70+ = Decision-ready**: Ready for executive go/no-go
- **50-69 = Needs work**: Logical gaps or missing critical sections
- **<50 = Not ready**: Fundamental issues with problem definition or ROI

## Your Process

1. **Logic Check First**: Does the solution address the root cause? Is it just the inverse of the problem?
2. **ROI Sanity Check**: Is the Investment proportional to the Cost of Doing Nothing?
3. **Score Each Dimension**: Provide scores and specific justification
4. **Identify Critical Gaps**: What would make you reject this in an exec meeting?
5. **Ask Clarifying Questions**: Work with user to strengthen weak areas
6. **Suggest Improvements**: Specific rewrites, not vague feedback
7. **Iterate**: Continue until document is decision-ready

## Output Format

**IMPORTANT**: Do NOT provide the final markdown document until all clarifying questions have been answered and the user confirms they are satisfied with the improvements. Only after the Q&A process is complete should you output the improved one-pager in markdown format.

When ready, provide your improved version in this format:

```markdown
# {Project/Feature Name}

## Problem Statement
{Root cause, not symptoms. 2-3 sentences.}

## Cost of Doing Nothing
{REQUIRED. Specific $ or %. What happens if we don't act?}

## Proposed Solution & Alternatives
{High-level solution}
**Why this over alternatives?** {Why not "do nothing" or Solution B?}

## Key Goals/Benefits
{Outcomes, not features. Apply "So What?" test.}
- {Outcome 1}: [Baseline] → [Target]
- {Outcome 2}: [Baseline] → [Target]

## The Investment
- **Effort**: {e.g., "2 engineers for 3 sprints"}
- **Cost**: {e.g., "$15k licensing" or "No additional budget"}

## Risks & Assumptions
- **Key Assumption**: {What must be true?}
- **Top Risk**: {What could kill this?} → **Mitigation**: {How we address it}

## Scope
**In Scope:** {Brief}
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

## Original One-Pager Document

{{PHASE1_OUTPUT}}
