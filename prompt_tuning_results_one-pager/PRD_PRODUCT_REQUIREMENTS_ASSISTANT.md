# Product Requirements Document (PRD)
## AI Agent Prompt Tuning for product-requirements-assistant

**Date**: 2025-11-21
**Author**: Matt J Bordenet
**Status**: Ready for Execution
**Priority**: HIGH
**Estimated Effort**: 2-3 hours (based on one-pager experience)

---

## Problem Statement

The product-requirements-assistant project relies on tuned LLM prompts to generate high-quality product requirements documents. Currently, these prompts have not been systematically evaluated or optimized using the AI Agent Prompt Tuning Workflow from codebase-reviewer.

**Business Impact**:
- **Quality Risk**: Untuned prompts may produce inconsistent or low-quality PRDs
- **Efficiency Loss**: Manual prompt iteration is time-consuming and subjective
- **Missed Learnings**: Lessons from one-pager tuning (word count enforcement, strategic framing, examples) not yet applied
- **Competitive Disadvantage**: Other AI-assisted PRD tools may have better-tuned prompts

**Cost of Inaction**:
- Continued production of suboptimal PRDs
- Wasted time on manual prompt tweaking
- Inability to measure prompt quality objectively

---

## Proposed Solution

Execute the AI Agent Prompt Tuning Workflow (7 phases) on product-requirements-assistant prompts, incorporating:

1. **Lessons Learned from one-pager**:
   - Word count enforcement (emphasize minimums, not just ranges)
   - Strategic framing (business impact, not just features)
   - Concrete examples (before/after comparisons)
   - Adversarial workflow handling (if applicable)
   - Hybrid rubric approach (project-specific + standard criteria)

2. **NEW: Incremental Scoring System**:
   - Track quality scores across iterations (not just before/after)
   - Visualize improvement trajectory (iteration 1 → 2 → 3 → ... → N)
   - Identify diminishing returns (when to stop iterating)
   - Enable data-driven decisions on which recommendations to implement

3. **Continuous Improvement**:
   - Document lessons learned for future projects
   - Update AI_AGENT_PROMPT_TUNING_INSTRUCTIONS.md with new insights
   - Create reusable templates and rubrics

---

## Key Goals/Benefits

### Primary Goals
1. **Improve Prompt Quality**: Achieve ≥4.0 average score (5-point scale) across all prompts
2. **Systematic Optimization**: Apply proven workflow instead of ad-hoc tweaking
3. **Measurable Improvement**: Track quality gains across iterations (target: +0.5 to +1.0 improvement)
4. **Knowledge Transfer**: Apply one-pager lessons to accelerate tuning

### Secondary Goals
5. **Incremental Scoring**: Implement scoring system to track iteration-by-iteration progress
6. **Diminishing Returns Detection**: Identify optimal stopping point (when improvement <0.1 per iteration)
7. **Reusable Artifacts**: Create templates/rubrics for future projects (e.g., codebase-reviewer)

### Success Metrics
- **Quality Score**: ≥4.0 average (Clarity, Conciseness, Impact, Feasibility, Completeness)
- **Improvement**: ≥0.5 improvement from baseline
- **Efficiency**: Complete in ≤3 hours (vs. 4-6 hours for one-pager first iteration)
- **Iteration Tracking**: Incremental scores recorded for all iterations
- **Reusability**: Lessons documented for AI_AGENT_PROMPT_TUNING_INSTRUCTIONS.md

---

## Scope

### In Scope
- ✅ Execute all 7 phases of AI Agent Prompt Tuning Workflow
- ✅ Apply lessons learned from one-pager tuning
- ✅ Implement incremental scoring system
- ✅ Create 10-15 diverse test cases for product-requirements-assistant
- ✅ Generate improved prompt versions
- ✅ Validate improvements with simulations
- ✅ Document lessons learned for codebase-reviewer
- ✅ Create final report with recommendations

### Out of Scope
- ❌ Real LLM API calls (use simulations for iterations 1-N, real calls only for final validation)
- ❌ UI/UX changes to product-requirements-assistant application
- ❌ Integration with external tools (e.g., Jira, Confluence)
- ❌ Prompt tuning for other projects (focus on product-requirements-assistant only)
- ❌ Deployment to production (user decision required)

### Assumptions
- product-requirements-assistant prompts are already decoupled (separate files)
- Simulated outputs are sufficient for early iterations (based on one-pager success)
- Hybrid rubric approach (project-specific + standard criteria) will work well
- 10-15 test cases provide sufficient coverage
- 20 iterations budget is sufficient (may complete in fewer)

---

## Technical Approach

### Phase 0: Analysis and Preparation
**Deliverable**: `analysis_report_product-requirements-assistant.md`

**Tasks**:
1. Examine current prompt structure (how many prompts? sequential or adversarial?)
2. Identify existing quality guidelines (word counts, structure, criteria)
3. Review prompt dependencies (which prompts use outputs from others?)
4. Assess baseline quality (are there existing examples or outputs?)
5. Identify critical issues (similar to one-pager: word count, framing, examples)

**Lessons Applied**:
- Check for adversarial vs. sequential workflow (critical for evaluation)
- Look for word count ranges that might need minimum enforcement
- Identify missing examples or strategic framing

### Phase 1: Decouple Prompts
**Deliverable**: Decoupled prompt files (if needed)

**Tasks**:
1. Check if prompts are already in separate files
2. If not, extract prompts from code into markdown files
3. Verify variable substitution works correctly

**Expected**: SKIP (likely already decoupled, like one-pager)

### Phase 2: Generate Test Data
**Deliverable**: `test_cases_product-requirements-assistant.json`

**Tasks**:
1. Create 10-15 diverse test cases covering:
   - Different product types (SaaS, mobile app, API, hardware, platform)
   - Different project scopes (new product, feature add, redesign, integration)
   - Different stakeholder complexities (single team, cross-functional, executive)
   - Different industries (fintech, healthcare, e-commerce, enterprise, consumer)
2. Ensure test cases are realistic and representative
3. Include edge cases (very small scope, very large scope, ambiguous requirements)

**Lessons Applied**:
- Broad diversity (not just common use cases)
- 10-15 cases (more than one-pager's 10 for better coverage)

### Phase 3: Run Simulations
**Deliverable**: `simulation_results_product-requirements-assistant_iterationN.json` (one per iteration)

**Tasks**:
1. Simulate LLM execution for all test cases × all prompts
2. Generate realistic outputs based on prompt instructions
3. Capture outputs in structured JSON format
4. **NEW**: Create separate simulation file for each iteration (not just original)

**Lessons Applied**:
- Simulations sufficient for early iterations (save time/cost)
- Realistic outputs based on actual LLM behavior patterns

### Phase 4: Evaluate Quality
**Deliverable**: `evaluation_report_product-requirements-assistant_iterationN.md` (one per iteration)

**Tasks**:
1. Define hybrid rubric (standard criteria + project-specific)
2. Score all outputs using 5-point scale (1-5)
3. Calculate averages by prompt, by criterion, overall
4. Identify patterns and critical issues
5. **NEW**: Compare to previous iteration scores (if iteration >1)

**Rubric** (adapt from one-pager):
- **Clarity** (1-5): Is the requirement crystal clear? Can developers implement it?
- **Conciseness** (1-5): Is it appropriately detailed without fluff?
- **Impact** (1-5): Are benefits compelling, measurable, business-focused?
- **Feasibility** (1-5): Are requirements realistic? Dependencies acknowledged?
- **Completeness** (1-5): Does it answer all key questions? All sections present?

**Lessons Applied**:
- 5-point scale (more practical than 10-point)
- Hybrid rubric (project-specific + standard)

### Phase 5: Recommend Improvements
**Deliverable**: `recommendations_product-requirements-assistant_iterationN.md`

**Tasks**:
1. Analyze evaluation results to identify root causes
2. Generate 4-8 specific, actionable recommendations
3. Prioritize recommendations (HIGH, MEDIUM, LOW)
4. Provide before/after examples for each recommendation
5. Estimate expected impact (score improvements)
6. **NEW**: Recommend which improvements to implement in next iteration

**Lessons Applied**:
- Focus on root causes (not symptoms)
- Concrete before/after examples (very effective)
- Prioritization (HIGH = implement now, LOW = optional)

### Phase 6: Iterate and Validate (REVISED - Evolutionary Approach)
**Deliverable**: `improved_promptN.md` files, `validation_report_iterationN.md`, `incremental_scores.json`

**Tasks** (per iteration):
1. **Select Mutation**: Choose 1-2 recommendations to test (start with HIGH PRIORITY)
2. **Apply Mutation**: Create modified prompt version(s)
3. **Re-run Simulations**: Generate outputs with mutated prompts
4. **Evaluate**: Score outputs using same rubric
5. **Compare**: Calculate delta from previous iteration
6. **Decide**:
   - ✅ **KEEP**: If overall score increases (even +0.01), accept mutation
   - ❌ **DISCARD**: If overall score decreases or flat (0.00), reject mutation and revert
7. **Record**: Update `incremental_scores.json` with iteration results
8. **Continue or Stop**: Check stopping criteria

**Decision Logic**:
```
if (new_score > previous_score):
    decision = "KEEP"
    baseline = new_prompts  # Update baseline for next iteration
    mutations_kept += 1
else:
    decision = "DISCARD"
    baseline = previous_prompts  # Revert to previous baseline
    mutations_discarded += 1
```

**Success Criteria** (per iteration):
- **KEEP criterion**: `new_score > previous_score` (any improvement, even 0.01)
- **DISCARD criterion**: `new_score <= previous_score` (no improvement or regression)
- **Final target**: Overall score ≥4.0 (minimum), ≥4.5 (stretch)

**Lessons Applied**:
- Test one mutation at a time (granular tracking)
- Objective decision-making (score-based, not subjective)
- No regressions allowed (only keep improvements)

### Phase 7: Final Report and Handoff
**Deliverable**: `FINAL_REPORT_PRODUCT_REQUIREMENTS_ASSISTANT.md`

**Tasks**:
1. Summarize all iterations and results
2. Document lessons learned for codebase-reviewer
3. Create final improved prompt files
4. Package all artifacts
5. Provide recommendations for production deployment
6. **NEW**: Include incremental scoring visualization/summary
7. **NEW**: Document optimal stopping point and rationale

**Lessons Applied**:
- Comprehensive documentation (for future reference)
- Lessons learned section (for continuous improvement)

## Incremental Scoring System (NEW)

### Evolutionary Prompt Tuning Approach

**Core Principle**: Treat prompt improvements as **mutations** - keep changes that increase scores, discard changes that decrease scores.

**Workflow**:
1. **Baseline**: Establish baseline score with original prompts (Iteration 0)
2. **Mutate**: Apply one recommendation at a time (or small batch)
3. **Score**: Re-run simulations and evaluate
4. **Keep or Discard**:
   - ✅ **Keep**: If score increases (even by 0.01), accept mutation and update baseline
   - ❌ **Discard**: If score decreases or stays flat, reject mutation and revert to previous baseline
5. **Iterate**: Repeat with next recommendation until all tested or diminishing returns

**Benefits**:
- **No Regressions**: Only accept improvements, never accept degradations
- **Granular Tracking**: See exactly which changes contribute to improvement
- **Data-Driven**: Objective decision-making (not subjective judgment)
- **Optimal Path**: Find best combination of improvements through trial-and-error

### Incremental Scoring Tracking

**Data Structure** (`incremental_scores.json`):
```json
{
  "baseline": {
    "iteration": 0,
    "prompts": ["phase1.md", "phase2.md", "phase3.md"],
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
      "mutation": "Rec 1: Enforce word count minimum in Phase 1",
      "prompts_changed": ["phase1.md"],
      "scores": {
        "clarity": 4.2,
        "conciseness": 3.8,
        "impact": 3.6,
        "feasibility": 3.1,
        "completeness": 4.6,
        "overall": 3.86
      },
      "delta": {
        "clarity": +0.3,
        "conciseness": +1.2,
        "overall": +0.30
      },
      "decision": "KEEP",
      "rationale": "Overall +0.30, Conciseness +1.2 (major improvement)",
      "timestamp": "2025-11-21T10:15:00Z"
    },
    {
      "iteration": 2,
      "mutation": "Rec 2: Add strategic framing to Phase 1",
      "prompts_changed": ["phase1.md"],
      "scores": {
        "clarity": 4.8,
        "conciseness": 3.8,
        "impact": 4.5,
        "feasibility": 3.1,
        "completeness": 4.6,
        "overall": 4.16
      },
      "delta": {
        "clarity": +0.6,
        "impact": +0.9,
        "overall": +0.30
      },
      "decision": "KEEP",
      "rationale": "Overall +0.30, Impact +0.9 (major improvement)",
      "timestamp": "2025-11-21T10:30:00Z"
    },
    {
      "iteration": 3,
      "mutation": "Rec 4: Standardize section naming in Phase 2",
      "prompts_changed": ["phase2.md"],
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
        "overall": -0.02
      },
      "decision": "DISCARD",
      "rationale": "Overall -0.02 (regression), revert to iteration 2",
      "timestamp": "2025-11-21T10:45:00Z"
    }
  ],
  "final": {
    "iteration": 5,
    "total_improvement": +0.84,
    "mutations_kept": 4,
    "mutations_discarded": 2,
    "prompts": ["phase1_improved.md", "phase2.md", "phase3_improved.md"]
  }
}
```

### Stopping Criteria

**Stop iterating when**:
1. **All recommendations tested**: No more mutations to try
2. **Diminishing returns**: Last 3 iterations all <0.05 improvement
3. **Target achieved**: Overall score ≥4.5 (stretch goal)
4. **Time budget exhausted**: 20 iterations completed
5. **User decision**: User requests to stop and deploy

### Visualization

**Incremental Score Chart** (text-based for markdown):
```
Overall Score Progress:
Iteration 0 (baseline):     3.56 ████████████████████████████████████
Iteration 1 (+Rec 1):       3.86 ██████████████████████████████████████▌
Iteration 2 (+Rec 2):       4.16 █████████████████████████████████████████▌
Iteration 3 (Rec 4 DISCARD) 4.14 █████████████████████████████████████████▎ [REVERTED]
Iteration 4 (+Rec 3):       4.40 ████████████████████████████████████████████
Iteration 5 (+Rec 5):       4.45 ████████████████████████████████████████████▌
                                 |----|----|----|----|----|----|----|----|
                                 3.0  3.5  4.0  4.5  5.0
Target: ≥4.0 ✅ | Stretch: ≥4.5 ✅
```

---

## Success Metrics (Updated)

### Quality Metrics
- **Baseline Score**: Record initial score (expected: 3.0-4.0)
- **Final Score**: ≥4.0 (minimum), ≥4.5 (stretch goal)
- **Total Improvement**: ≥0.5 (minimum), ≥1.0 (stretch goal)
- **No Regressions**: All kept mutations must improve score (even if +0.01)

### Efficiency Metrics
- **Iterations to Target**: Reach ≥4.0 in ≤10 iterations
- **Mutation Success Rate**: ≥50% of mutations kept (not discarded)
- **Time to Complete**: ≤3 hours total (all iterations)

### Process Metrics
- **Incremental Tracking**: All iterations recorded in `incremental_scores.json`
- **Mutation Granularity**: Test 1-2 recommendations per iteration (not all at once)
- **Reversion Capability**: Can revert to any previous iteration if needed

---
