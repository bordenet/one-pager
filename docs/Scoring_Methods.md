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

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)
