# Design Document: Evolutionary Prompt Tuning System
## Incremental Scoring with Mutation Keep/Discard Logic

**Date**: 2025-11-21
**Author**: Matt J Bordenet
**Status**: Ready for Implementation
**Target Projects**: product-requirements-assistant, codebase-reviewer, one-pager (future iterations)

---

## Overview

This design introduces an **evolutionary approach** to prompt tuning where each recommendation is treated as a **mutation** that is either kept (if it improves scores) or discarded (if it doesn't). This ensures:
- **No regressions**: Only improvements are accepted
- **Granular tracking**: See exactly which changes contribute to improvement
- **Data-driven decisions**: Objective scoring, not subjective judgment
- **Optimal path**: Find best combination through trial-and-error

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Evolutionary Tuning Engine                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Baseline   │───▶│   Mutation   │───▶│  Evaluation  │  │
│  │   Prompts    │    │   Generator  │    │   Engine     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         │                    │                    ▼          │
│         │                    │            ┌──────────────┐  │
│         │                    │            │   Scoring    │  │
│         │                    │            │   System     │  │
│         │                    │            └──────────────┘  │
│         │                    │                    │          │
│         │                    ▼                    ▼          │
│         │            ┌──────────────┐    ┌──────────────┐  │
│         └────────────│   Decision   │◀───│  Comparator  │  │
│                      │   Engine     │    │              │  │
│                      └──────────────┘    └──────────────┘  │
│                             │                               │
│                    ┌────────┴────────┐                      │
│                    ▼                 ▼                       │
│            ┌──────────────┐  ┌──────────────┐              │
│            │     KEEP     │  │   DISCARD    │              │
│            │  (Update     │  │  (Revert to  │              │
│            │  Baseline)   │  │  Previous)   │              │
│            └──────────────┘  └──────────────┘              │
│                    │                                         │
│                    ▼                                         │
│            ┌──────────────┐                                 │
│            │  Incremental │                                 │
│            │   Tracker    │                                 │
│            └──────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Baseline Establishment**: Load original prompts, run simulations, establish baseline score
2. **Mutation Generation**: Select next recommendation to test (1-2 at a time)
3. **Mutation Application**: Create modified prompt version(s)
4. **Simulation**: Re-run test cases with mutated prompts
5. **Evaluation**: Score outputs using rubric
6. **Comparison**: Calculate delta from previous iteration
7. **Decision**: KEEP (if score increases) or DISCARD (if score decreases/flat)
8. **Tracking**: Record iteration in `incremental_scores.json`
9. **Iteration**: Repeat until stopping criteria met

---

## Data Structures

### Incremental Scores File (`incremental_scores.json`)

```json
{
  "metadata": {
    "project": "product-requirements-assistant",
    "start_time": "2025-11-21T10:00:00Z",
    "end_time": "2025-11-21T12:30:00Z",
    "total_iterations": 8,
    "mutations_kept": 5,
    "mutations_discarded": 3,
    "final_score": 4.45,
    "total_improvement": 0.89
  },
  "baseline": {
    "iteration": 0,
    "prompts": {
      "phase1": "prompts/phase1.md",
      "phase2": "prompts/phase2.md",
      "phase3": "prompts/phase3.md"
    },
    "scores": {
      "clarity": 3.9,
      "conciseness": 2.6,
      "impact": 3.6,
      "feasibility": 3.1,
      "completeness": 4.6,
      "overall": 3.56
    },
    "timestamp": "2025-11-21T10:00:00Z"
  },
  "iterations": [
    {
      "iteration": 1,
      "mutation": {
        "id": "rec_1",
        "description": "Enforce word count minimum in Phase 1",
        "priority": "HIGH",
        "prompts_changed": ["phase1"]
      },
      "prompts": {
        "phase1": "prompts/phase1_iter1.md",
        "phase2": "prompts/phase2.md",
        "phase3": "prompts/phase3.md"
      },
      "scores": {
        "clarity": 4.2,
        "conciseness": 3.8,
        "impact": 3.6,
        "feasibility": 3.1,
        "completeness": 4.6,
        "overall": 3.86
      },
      "delta": {
        "clarity": 0.3,
        "conciseness": 1.2,
        "impact": 0.0,
        "feasibility": 0.0,
        "completeness": 0.0,
        "overall": 0.30
      },
      "decision": "KEEP",
      "rationale": "Overall +0.30 (8.4% improvement), Conciseness +1.2 (major improvement in word count compliance)",
      "timestamp": "2025-11-21T10:15:00Z"
    },
    {
      "iteration": 2,
      "mutation": {
        "id": "rec_2",
        "description": "Add strategic framing guidelines to Phase 1",
        "priority": "HIGH",
        "prompts_changed": ["phase1"]
      },
      "prompts": {
        "phase1": "prompts/phase1_iter2.md",
        "phase2": "prompts/phase2.md",
        "phase3": "prompts/phase3.md"
      },
      "scores": {
        "clarity": 4.8,
        "conciseness": 3.8,
        "impact": 4.5,
        "feasibility": 3.1,
        "completeness": 4.6,
        "overall": 4.16
      },
      "delta": {
        "clarity": 0.6,
        "conciseness": 0.0,
        "impact": 0.9,
        "feasibility": 0.0,
        "completeness": 0.0,
        "overall": 0.30
      },
      "decision": "KEEP",
      "rationale": "Overall +0.30 (7.8% improvement), Impact +0.9 (strategic framing working), Clarity +0.6",
      "timestamp": "2025-11-21T10:30:00Z"
    },
    {
      "iteration": 3,
      "mutation": {
        "id": "rec_4",
        "description": "Standardize section naming in Phase 2",
        "priority": "LOW",
        "prompts_changed": ["phase2"]
      },
      "prompts": {
        "phase1": "prompts/phase1_iter2.md",
        "phase2": "prompts/phase2_iter3.md",
        "phase3": "prompts/phase3.md"
      },
      "scores": {
        "clarity": 4.7,
        "conciseness": 3.8,
        "impact": 4.5,
        "feasibility": 3.1,
        "completeness": 4.6,
        "overall": 4.14
      },
      "delta": {
        "clarity": -0.1,
        "conciseness": 0.0,
        "impact": 0.0,
        "feasibility": 0.0,
        "completeness": 0.0,
        "overall": -0.02
      },
      "decision": "DISCARD",
      "rationale": "Overall -0.02 (regression), Clarity -0.1 (section naming caused confusion). Revert to iteration 2.",
      "timestamp": "2025-11-21T10:45:00Z",
      "reverted_to": 2
    }
  ],
  "final": {
    "iteration": 8,
    "prompts": {
      "phase1": "prompts/phase1_improved.md",
      "phase2": "prompts/phase2.md",
      "phase3": "prompts/phase3_improved.md"
    },
    "scores": {
      "clarity": 4.8,
      "conciseness": 4.2,
      "impact": 4.5,
      "feasibility": 4.0,
      "completeness": 5.0,
      "overall": 4.45
    },
    "total_improvement": 0.89,
    "mutations_kept": ["rec_1", "rec_2", "rec_3", "rec_5", "rec_7"],
    "mutations_discarded": ["rec_4", "rec_6", "rec_8"]
  }
}
```

## Implementation Details

### Decision Engine Logic

```python
def evaluate_mutation(baseline_score, new_score, threshold=0.0):
    """
    Decide whether to keep or discard a mutation.

    Args:
        baseline_score: Previous iteration's overall score
        new_score: Current mutation's overall score
        threshold: Minimum improvement required (default: 0.0 = any improvement)

    Returns:
        dict: Decision with rationale
    """
    delta = new_score - baseline_score

    if delta > threshold:
        return {
            "decision": "KEEP",
            "delta": delta,
            "rationale": f"Overall +{delta:.2f} ({delta/baseline_score*100:.1f}% improvement)"
        }
    else:
        return {
            "decision": "DISCARD",
            "delta": delta,
            "rationale": f"Overall {delta:+.2f} ({'no improvement' if delta == 0 else 'regression'}), revert to previous"
        }

def select_next_mutation(recommendations, tried_mutations, priority_order=["HIGH", "MEDIUM", "LOW"]):
    """
    Select next recommendation to test based on priority and what hasn't been tried.

    Args:
        recommendations: List of recommendation objects
        tried_mutations: Set of recommendation IDs already tested
        priority_order: Order to try recommendations

    Returns:
        dict: Next recommendation to test, or None if all tested
    """
    for priority in priority_order:
        for rec in recommendations:
            if rec["priority"] == priority and rec["id"] not in tried_mutations:
                return rec
    return None  # All recommendations tested
```

### Stopping Criteria Logic

```python
def should_stop_iterating(iterations, target_score=4.0, stretch_score=4.5, max_iterations=20):
    """
    Determine if iteration should stop based on multiple criteria.

    Returns:
        dict: Stop decision with reason
    """
    if not iterations:
        return {"stop": False, "reason": "No iterations yet"}

    current_score = iterations[-1]["scores"]["overall"]

    # Check target achievement
    if current_score >= stretch_score:
        return {"stop": True, "reason": f"Stretch goal achieved ({current_score:.2f} ≥ {stretch_score})"}

    if current_score >= target_score and len(iterations) >= 5:
        return {"stop": True, "reason": f"Target achieved ({current_score:.2f} ≥ {target_score}) with sufficient iterations"}

    # Check max iterations
    if len(iterations) >= max_iterations:
        return {"stop": True, "reason": f"Max iterations reached ({max_iterations})"}

    # Check diminishing returns (last 3 iterations all <0.05 improvement)
    if len(iterations) >= 3:
        recent_improvements = []
        for i in range(-3, 0):
            if iterations[i]["decision"] == "KEEP":
                recent_improvements.append(iterations[i]["delta"]["overall"])
            else:
                recent_improvements.append(0.0)

        if all(imp < 0.05 for imp in recent_improvements):
            return {"stop": True, "reason": "Diminishing returns (last 3 iterations <0.05 improvement)"}

    return {"stop": False, "reason": "Continue iterating"}
```

---

## Integration with Existing Workflow

### Modified Phase 6: Iterate and Validate

**Before (Batch Approach)**:
1. Implement all HIGH PRIORITY recommendations at once
2. Test combined changes
3. Accept or reject entire batch

**After (Evolutionary Approach)**:
1. **Initialize**: Load baseline prompts and scores
2. **Loop**: For each recommendation:
   a. Apply single mutation
   b. Test mutation
   c. Keep or discard based on score
   d. Update baseline if kept
3. **Track**: Record all iterations in `incremental_scores.json`
4. **Stop**: When criteria met or recommendations exhausted

### File Structure Changes

```
prompt_tuning_results_project/
├── analysis_report_project.md
├── test_cases_project.json
├── recommendations_project.md
├── incremental_scores.json              # NEW: Iteration tracking
├── simulation_results_project_iter0.json    # Baseline
├── simulation_results_project_iter1.json    # After mutation 1
├── simulation_results_project_iter2.json    # After mutation 2
├── evaluation_report_project_iter0.md       # Baseline evaluation
├── evaluation_report_project_iter1.md       # After mutation 1
├── evaluation_report_project_iter2.md       # After mutation 2
├── prompts/
│   ├── phase1_iter0.md                 # Original
│   ├── phase1_iter1.md                 # After mutation 1
│   ├── phase1_iter2.md                 # After mutation 2
│   ├── phase1_final.md                 # Best version
│   └── ...
└── FINAL_REPORT_PROJECT.md
```

---

## Benefits of Evolutionary Approach

### 1. **No Regressions**
- Traditional: Batch changes might improve some scores but hurt others
- Evolutionary: Only accept changes that improve overall score

### 2. **Granular Attribution**
- Traditional: Hard to know which specific change caused improvement
- Evolutionary: Know exactly which recommendation contributed how much

### 3. **Optimal Path Finding**
- Traditional: Might miss better combinations due to batch testing
- Evolutionary: Explores space more thoroughly, finds better local optimum

### 4. **Early Stopping**
- Traditional: Test all recommendations even if target achieved early
- Evolutionary: Stop when target reached or diminishing returns detected

### 5. **Data-Driven Decisions**
- Traditional: Subjective judgment on which changes to keep
- Evolutionary: Objective scoring determines all decisions

---

**End of Design Document**
