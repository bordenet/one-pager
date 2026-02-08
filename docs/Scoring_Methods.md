# One-Pager Assistant Scoring Methods

This document describes the scoring methodology used by the One-Pager Validator.

## Overview

The validator scores one-pager documents on a **100-point scale** across four dimensions that reflect decision-making clarity. The scoring emphasizes problem quantification, scope discipline, and circular logic detection.

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Problem Clarity** | 30 | Problem statement, cost of inaction, quantification |
| **Solution Quality** | 25 | Solution addresses problem, measurable goals |
| **Scope Discipline** | 25 | In-scope, out-of-scope, baseline→target format |
| **Completeness** | 20 | Required sections, stakeholders, timeline |

## Dimension Details

### 1. Problem Clarity (30 pts)

**Scoring Breakdown:**
- Problem section with quantified metrics: 10 pts
- Problem mentioned without quantification: 5 pts
- Cost of inaction quantified: 10 pts
- Cost of inaction mentioned: 5 pts
- Business/customer focus language: 5 pts
- Circular logic detected: -5 pts penalty

**Detection Patterns:**
```javascript
problemSection: /^#+\s*(problem|challenge|pain.?point|context|why)/im
costOfInaction: /\b(cost\s+of\s+(inaction|doing\s+nothing)|if\s+we\s+do\s+nothing|status\s+quo\s+costs?|without\s+(action|this))\b/gi
quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi
```

**Circular Logic Detection:**
Detects when problem states "don't have X" and solution is "build X":
```javascript
circularPatterns: /\b(don't|lack|missing|no)\s+(\w+).*\b(build|create|add)\s+\2/
```

### 2. Solution Quality (25 pts)

**Scoring Breakdown:**
- Solution section with measurable goals: 10 pts
- Solution section without measurement: 5 pts
- High-level (not implementation details): 5 pts
- Avoids implementation language: 5 pts
- Circular logic overlap with problem: -5 pts

**Detection Patterns:**
```javascript
solutionSection: /^#+\s*(solution|proposal|approach|recommendation|how)/im
measurable: /\b(measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal)\b/gi
avoidImplementation: /\b(code|function|class|method|api|database|sql|algorithm|library|framework)\b/gi
```

### 3. Scope Discipline (25 pts)

**Scoring Breakdown:**
- In-scope clearly defined: 8 pts
- Out-of-scope explicitly stated: 8 pts
- Baseline → target metrics (e.g., [100] → [30]): 9 pts

**Baseline→Target Detection:**
```javascript
arrowPatterns: /\d+[%$]?\s*[→\->]\s*\d+[%$]?/
fromToPatterns: /from\s+\d+[%$]?\s+to\s+\d+[%$]?/gi
bracketPatterns: /\[(?:current|baseline)[^\]]*\]\s*[→\->]\s*\[(?:target|goal)[^\]]*\]/gi
// Adversarial fix: bracket-wrapped numbers per phase1.md format
bracketNumberPatterns: /\[\s*\d+[%$]?[^\]]*\]\s*[→\->]\s*\[\s*\d+[%$]?[^\]]*\]/g
```

**Vague Metric Detection:**
Flags improvement language without numbers:
```javascript
vaguePatterns: /\b(improve|increase|decrease|reduce|enhance)\b(?![^.]*\d)/gi
```

### 4. Completeness (20 pts)

**Required Sections (8 pts, normalized from 16 weighted):**

| Section | Weight | Pattern |
|---------|--------|---------|
| Executive Summary | 2 | `^#+\s*(executive.?summary|tl;?dr|overview)` |
| Problem Statement | 2 | `^#+\s*(problem|challenge|pain.?point)` |
| Goals and Objectives | 2 | `^#+\s*(goal|objective|success.?metric)` |
| Proposed Solution | 2 | `^#+\s*(proposed\s+solution|solution|proposal)` |
| Scope | 2 | `^#+\s*(scope|in.?scope|out.?of.?scope)` |
| Requirements | 1 | `^#+\s*(requirement|functional|non.?functional)` |
| Stakeholders | 1 | `^#+\s*(stakeholder|team|owner|raci)` |
| Timeline | 1 | `^#+\s*(timeline|milestone|phase|schedule)` |
| Risks | 1 | `^#+\s*(risk|mitigation|assumption)` |
| Open Questions | 1 | `^#+\s*(open\s+question|question|tbd)` |

**Other Completeness Factors:**
- Stakeholder section with role definitions: 6 pts
- Timeline with phasing: 6 pts

**Extended Stakeholder Patterns (from adversarial compounding):**
```javascript
stakeholderConcerns: /\b(finance|fp&a|hr|people.?team|legal|compliance|cfo|cto|ceo|vp|director)\b/gi
```

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| "Improve performance" without numbers | Vague pattern detection flags it |
| Circular problem→solution | Circular logic detector applies penalty |
| Missing out-of-scope | Scope discipline requires explicit exclusions |
| "10 → 20" without context | Baseline→target requires meaningful labels |
| Generic stakeholder list | Extended patterns check for real roles |

## Calibration Notes

### Baseline → Target Is Mandatory
Phase1.md explicitly requires `[current] → [target]` format for metrics. "Improve" without numbers = 0 points.

### Circular Logic Trap
Many one-pagers state "Problem: we don't have X. Solution: build X." This circular logic is detected and penalized.

### Scope Discipline
"In-scope" without "Out-of-scope" signals scope creep risk. Both are required.

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | Decision-ready - clear problem, scoped solution |
| 60-79 | B | Promising - tighten metrics and scope |
| 40-59 | C | Incomplete - circular logic or vague metrics |
| 20-39 | D | Weak - reframe problem with data |
| 0-19 | F | Not a one-pager - restart with structure |

## LLM Scoring

The validator uses a **dual-scoring architecture**: JavaScript pattern matching provides fast, deterministic scoring, while LLM evaluation adds semantic understanding. Both systems use aligned rubrics but may diverge on edge cases.

### Three LLM Prompts

| Prompt | Purpose | When Used |
|--------|---------|-----------|
| **Scoring Prompt** | Evaluate one-pager against rubric, return dimension scores | Initial validation |
| **Critique Prompt** | Generate clarifying questions to improve weak areas | After scoring |
| **Rewrite Prompt** | Produce improved one-pager targeting 85+ score | User-requested rewrite |

### LLM Scoring Rubric

The LLM uses the same 4-dimension rubric as JavaScript, with identical point allocations:

| Dimension | Points | LLM Focus |
|-----------|--------|-----------|
| Problem Clarity | 30 | Root cause problem statement, REQUIRED Cost of Doing Nothing with specific $ or %, business focus |
| Solution Quality | 25 | Solution addresses root cause (not inverse of problem), [Baseline] → [Target] format, high-level approach |
| Scope Discipline | 25 | In-scope AND out-of-scope explicitly defined, SMART metrics with baselines |
| Completeness | 20 | All sections present, stakeholders and timeline defined |

### Logical Bridge Check

**Before scoring, the LLM answers:** Is the solution simply the inverse of the problem?

Example: Problem: "We don't have a dashboard" → Solution: "Build a dashboard"

If YES, this is **CIRCULAR LOGIC**. The LLM caps total score at 50 maximum regardless of other scores.

A valid solution addresses the ROOT CAUSE:
> Problem: "Support tickets increased 40% due to lack of visibility into order status"
> Solution: "Provide real-time order tracking to reduce support burden by 30%"

### LLM Calibration Guidance

The LLM prompt includes explicit calibration signals:

**Reward signals:**
- Explicit scope boundaries (brief, not padded)
- Quantified metrics with baselines AND targets
- Cost of Doing Nothing with specific $ or %

**Penalty signals:**
- Every vague qualifier without [Baseline] → [Target] metrics
- Weasel words: "should be able to", "might", "could potentially"
- Marketing fluff: "best-in-class", "cutting-edge", "world-class"
- Superlative adjectives: "revolutionary", "seamless", "groundbreaking"
- Missing Cost of Doing Nothing (REQUIRED section)
- Verbosity: one-pagers should fit on ONE PAGE (450 words max)

**Calibration baseline:** "Be HARSH. Most one-pagers score 40-60. Only exceptional ones score 80+."

### LLM Critique Prompt

The critique prompt receives the current JS validation scores and generates improvement questions:

```
Score Summary: [totalScore]/100
- Problem Clarity: [X]/30
- Solution Quality: [X]/25
- Scope Discipline: [X]/25
- Completeness: [X]/20
```

Output includes:
- Top 3 issues (specific gaps)
- 3-5 clarifying questions focused on weakest dimensions
- Quick wins (fixes that don't require user input)

### LLM Rewrite Prompt

The rewrite prompt targets an 85+ score with specific requirements:
- Root cause problem statement (not symptoms)
- Cost of Doing Nothing with specific $ or % (REQUIRED)
- Solution addresses root cause (not inverse of problem)
- [Baseline] → [Target] format for measurable goals
- In-scope AND out-of-scope explicitly defined
- All sections present with stakeholders and phased timeline
- Maximum 450 words
- Passes LOGICAL BRIDGE CHECK

### JS vs LLM Score Divergence

| Scenario | JS Score | LLM Score | Explanation |
|----------|----------|-----------|-------------|
| Circular logic present | May score higher | Capped at 50 | LLM catches semantic inversion |
| Vague but syntactically correct | Higher | Lower | LLM penalizes weak phrasing |
| Strong content, poor formatting | Lower | Higher | LLM focuses on meaning |
| Marketing fluff with metrics | May pass patterns | Lower | LLM detects hollow claims |

### LLM-Specific Adversarial Notes

| Gaming Attempt | Why LLM Catches It |
|----------------|-------------------|
| "Problem: No X. Solution: Build X" | Logical Bridge Check fails |
| Generic stakeholder padding | LLM evaluates role specificity |
| Metric anchoring without context | LLM requires meaningful baselines |
| Section headers without substance | LLM evaluates content quality |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)
