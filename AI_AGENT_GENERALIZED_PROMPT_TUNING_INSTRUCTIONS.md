# AI Agent Instructions: Generalized LLM Prompt Tuning System

**Purpose**: Step-by-step instructions for AI agents to autonomously optimize LLM prompts in any supported project.

**Context**: This is the generalized version of the successful one-pager prompt tuning methodology that achieved +12% quality improvements. It can be applied to any project with decoupled prompts.

**Success Criteria**: Achieve ≥12% quality improvement in ≤30 minutes of autonomous execution.

---

## Prerequisites

Before starting, ensure you have:
1. ✅ Read `GENERALIZED_PROMPT_TUNING_PRD.md` (understand the WHY and WHAT)
2. ✅ Read `GENERALIZED_PROMPT_TUNING_DESIGN.md` (understand the HOW)
3. ✅ Access to target project repository on local filesystem
4. ✅ Understanding that you will act as both the optimizer AND the mock LLM

---

## Execution Workflow

```
Phase 1: Project Detection → Phase 2: Context Analysis → Phase 3: Test Generation
    ↓
Phase 4: Baseline Simulation → Phase 5: Quality Evaluation → Phase 6: Optimization
    ↓
Phase 7: Validation → Phase 8: Final Report
```

---

## Phase 1: Project Detection and Analysis

### Objective
Identify project type, locate prompts, and understand current structure.

### Steps

1. **Examine Project Structure**
   ```bash
   # Look for key indicators
   ls -la {project_path}/
   find {project_path} -name "*.md" -path "*/prompts/*"
   find {project_path} -name "package.json" -o -name "go.mod"
   ```

2. **Detect Project Type**
   - **one-pager**: JavaScript project with `prompts/phase1.md`, `prompts/phase2.md`, `prompts/phase3.md`
   - **product-requirements-assistant**: Go project with `prompts/phase1-claude-initial.md`, etc.
   - **Generic**: Other projects with prompt files in `prompts/` or `templates/`

3. **Analyze Prompt Structure**
   - Read all prompt files
   - Identify variable placeholders (`{variable}`, `%s`, etc.)
   - Map workflow dependencies (phase1 → phase2 → phase3)
   - Note expected output format and constraints

4. **Document Current State**
   Create `analysis_report_{project_name}.md`:
   ```markdown
   # Project Analysis: {project_name}

   **Project Type**: {detected_type}
   **Prompt Files**: {list_of_files}
   **Workflow**: {phase_structure}
   **Variables**: {placeholder_list}
   **Current Issues**: {obvious_problems}
   ```

### Success Criteria
- [ ] Project type correctly identified
- [ ] All prompt files located and read
- [ ] Workflow structure mapped
- [ ] Variable placeholders documented

---

## Phase 2: Context Understanding

### Objective
Understand the project's purpose and typical use cases.

### Steps

1. **Read Project Documentation**
   - README.md
   - Any docs/ directory
   - Example outputs (if available)

2. **Understand Use Cases**
   - What does this project generate?
   - Who are the typical users?
   - What are common scenarios?

3. **Identify Quality Expectations**
   - What makes a "good" output for this project?
   - Are there specific constraints (word count, format, etc.)?
   - What are the success criteria?

### Success Criteria
- [ ] Project purpose clearly understood
- [ ] Typical use cases identified
- [ ] Quality expectations documented

---

## Phase 3: Test Case Generation

### Objective
Create 5-8 diverse, realistic test cases that represent real-world usage.

### Steps

1. **Generate Diverse Scenarios**

   **For one-pager projects**:
   - Vary industries: SaaS, E-commerce, Healthcare, Fintech, Manufacturing
   - Vary project types: New Feature, Redesign, Migration, Optimization
   - Vary scopes: Small (2-4 weeks), Medium (2-3 months), Large (6+ months)
   - Vary stakeholder complexity: Single team, Cross-functional, Executive-level

   **For product-requirements-assistant projects**:
   - Vary product types: Mobile App, Web Service, API, Platform, Internal Tool
   - Vary complexity: Simple Feature, Complex System, Integration, Migration
   - Vary audiences: B2B, B2C, Internal, Partner-facing
   - Vary constraints: Legacy system, Greenfield, Compliance-heavy, Performance-critical

2. **Create Realistic Input Data**
   - Use specific, concrete details (not generic placeholders)
   - Include quantifiable metrics and goals
   - Add realistic stakeholder names and roles
   - Provide sufficient context for meaningful outputs

3. **Set Quality Expectations**
   For each test case, predict expected quality scores:
   ```json
   "expected_qualities": {
     "clarity": 4,
     "conciseness": 5,
     "completeness": 4,
     "professionalism": 5,
     "actionability": 4
   }
   ```

4. **Save Test Cases**
   Create `test_cases_{project_name}.json` with 5-8 comprehensive test cases.

### Success Criteria
- [ ] 5-8 diverse test cases created
- [ ] All required input fields populated with realistic data
- [ ] Test cases cover different scenarios/industries/complexities
- [ ] Expected quality scores set for each test case

---

## Phase 4: Baseline Simulation

### Objective
Execute current prompts with test data and capture outputs.

### Steps

1. **For Each Test Case**:

   a. **Load Current Prompts**
      - Read prompt files from project
      - Parse structure and placeholders

   b. **Substitute Variables**
      - Replace placeholders with test case data
      - Ensure proper formatting

   c. **Simulate LLM Execution**
      - **YOU act as the LLM** responding to the prompts
      - Follow prompt instructions exactly as written
      - Generate realistic outputs (not perfect, not terrible)
      - Don't add improvements - simulate current prompts as-is

   d. **Handle Multi-Phase Workflows**
      - Phase 1: Generate initial output
      - Phase 2: Use Phase 1 output as input (if applicable)
      - Phase 3: Use previous outputs as inputs (if applicable)

2. **Capture All Outputs**
   Store results in `simulation_results_{project_name}_baseline.json`:
   ```json
   {
     "project": "{project_name}",
     "prompt_version": "baseline",
     "timestamp": "{timestamp}",
     "results": [
       {
         "test_case_id": "test_001",
         "phase_outputs": {
           "phase1": "...",
           "phase2": "...",
           "phase3": "..."
         }
       }
     ]
   }
   ```

### Success Criteria
- [ ] All test cases executed successfully
- [ ] Outputs captured for all phases
- [ ] Outputs are realistic (match typical LLM quality)
- [ ] No improvements added (pure baseline simulation)

---

## Phase 5: Quality Evaluation

### Objective
Score baseline outputs against standardized quality criteria.

### Steps

1. **Load Quality Rubric**

   **For one-pager projects**:
   - Clarity (1-5): Is it easy to understand?
   - Conciseness (1-5): Fits on one page, no fluff?
   - Completeness (1-5): All sections present and meaningful?
   - Professionalism (1-5): Appropriate tone and formatting?
   - Actionability (1-5): Clear next steps and metrics?

   **For product-requirements-assistant projects**:
   - Comprehensiveness (1-5): Covers all necessary aspects?
   - Clarity (1-5): Requirements unambiguous?
   - Structure (1-5): Proper section numbering and organization?
   - Consistency (1-5): Aligned across phases?
   - Engineering-Ready (1-5): Focuses on "why" and "what", not "how"?
   - No Metadata Table (Pass/Fail): Follows user requirement?
   - Section Numbering (Pass/Fail): ## and ### levels numbered?

2. **Evaluate Each Test Case**

   For each simulation result:
   - Read the output carefully
   - Score each criterion objectively
   - Cite specific examples from output
   - Document issues with line/section references
   - Explain why each score was given

3. **Calculate Aggregate Scores**
   - Average score per criterion across all test cases
   - Overall average score
   - Pass rate for binary checks
   - Identify patterns (which criteria consistently score low?)

4. **Create Evaluation Report**
   Save as `evaluation_report_{project_name}_baseline.md` using this template:

   ```markdown
   # Baseline Evaluation Report: {project_name}

   **Date**: {timestamp}
   **Test Cases**: {count}
   **Average Score**: {score}/5.0

   ## Summary

   | Criterion | Average Score | Issues Found |
   |-----------|---------------|--------------|
   | Clarity | {score}/5 | {issue_count} |
   | Conciseness | {score}/5 | {issue_count} |

   ## Test Case Details

   ### Test Case: {id} - {name}

   #### Quality Scores
   - Clarity: {score}/5 - {rationale}
   - Conciseness: {score}/5 - {rationale}

   #### Specific Issues
   1. {Issue with reference to output}
   2. {Issue with reference to output}

   ## Patterns Identified
   - **Common Weakness**: {pattern across multiple test cases}
   - **Common Strength**: {pattern across multiple test cases}
   ```

### Success Criteria
- [ ] All test cases scored using appropriate rubric
- [ ] Specific issues documented with examples
- [ ] Aggregate scores calculated
- [ ] Common patterns identified
- [ ] Baseline average score documented

---

## Phase 6: Optimization and Improvement

### Objective
Identify specific improvements and apply them to prompts.

### Steps

1. **Analyze Evaluation Results**
   - Review all scores and identified issues
   - Look for patterns across test cases
   - Prioritize by impact (frequency × severity)

2. **Identify Root Causes**
   For each pattern, trace back to prompt structure:
   - Low clarity → Vague instructions, no examples
   - Low conciseness → No word limit specified
   - Missing sections → Prompt doesn't require them
   - Inconsistency → Phases don't reference each other

3. **Create Specific Recommendations**

   **Example Recommendation Format**:
   ```markdown
   ## Recommendation #1: Add Explicit Word Limit

   ### Issue Identified
   Conciseness scores averaged 2.8/5.0. Outputs ranged 800-2000 words, exceeding one page.

   ### Root Cause
   Current prompt says "concise one-pager" but doesn't specify word limit.

   ### Proposed Change

   **Current Prompt (excerpt)**:
   ```
   Generate a crisp, professional one-pager document.
   ```

   **Improved Prompt (excerpt)**:
   ```
   Generate a crisp, professional one-pager document.

   **CRITICAL CONSTRAINT**: Maximum 600 words. Be ruthlessly concise.
   ```

   ### Expected Impact
   - Conciseness: 2.8 → 4.5
   - Affected test cases: All

   ### Priority: HIGH
   ```

4. **Apply Improvements to Prompts**
   - Start with HIGH priority changes
   - Modify prompt files with specific improvements
   - Keep track of all changes made

5. **Save Updated Prompts**
   - Create backup of original prompts
   - Save improved versions
   - Document all changes applied

### Success Criteria
- [ ] At least 3-5 specific recommendations created
- [ ] Each recommendation has before/after examples
- [ ] Recommendations prioritized by impact
- [ ] Updated prompt files created
- [ ] All changes documented

---

## Phase 7: Validation Simulation

### Objective
Test improved prompts and verify results.

### Steps

1. **Re-run Simulations**
   - Use SAME test cases from Phase 3
   - Execute improved prompts
   - YOU act as LLM again (with improved prompts)
   - Capture new outputs

2. **Re-evaluate Outputs**
   - Use SAME rubric from Phase 5
   - Score new outputs objectively
   - Compare with baseline scores

3. **Validate Improvements**
   Check validation criteria:
   - ✅ Average score improved by ≥0.12 points (12% improvement)
   - ✅ No test case regressed by >0.5 points
   - ✅ All binary checks still passing
   - ✅ Specific issues from evaluation are resolved

4. **Create Comparison Report**
   Save as `comparison_report_{project_name}.md`:

   ```markdown
   # Before/After Comparison: {project_name}

   ## Summary

   | Metric | Before | After | Delta |
   |--------|--------|-------|-------|
   | Average Score | {score} | {score} | +{delta} ✅ |
   | Clarity | {score} | {score} | +{delta} |
   | Conciseness | {score} | {score} | +{delta} |

   ## Test Case Results

   ### test_001: {name}
   - Before: {score}/5.0
   - After: {score}/5.0
   - Delta: +{delta} ✅

   **Key Improvements**:
   - {improvement_1}
   - {improvement_2}

   **Example Output Comparison**:

   **Before**:
   ```
   {excerpt_showing_issue}
   ```

   **After**:
   ```
   {excerpt_showing_fix}
   ```
   ```

5. **Decision: Keep or Discard**
   - If validation passes: KEEP improvements
   - If validation fails: DISCARD and try different approach
   - If partial success: Keep some improvements, iterate on others

### Success Criteria
- [ ] All test cases re-executed with improved prompts
- [ ] New outputs evaluated using same rubric
- [ ] Comparison report shows clear improvements
- [ ] Validation criteria met (≥12% improvement, no regressions)

---

## Phase 8: Final Report and Handoff

### Objective
Document complete optimization process and results.

### Steps

1. **Create Executive Summary**
   ```markdown
   # Prompt Optimization Summary: {project_name}

   **Date**: {timestamp}
   **Project Type**: {type}
   **Final Score**: {score}/5.0 (up from {baseline})
   **Improvement**: +{delta} ({percentage}%)

   ## Key Achievements
   - ✅ Improved average score by {delta} points
   - ✅ All test cases now score ≥{min_score}
   - ✅ {count} specific issues resolved

   ## Changes Applied
   1. {change_1}: {description}
   2. {change_2}: {description}
   3. {change_3}: {description}

   ## Success Metrics Met
   - ✅ Quality improvement: +{percentage}% (target: ≥12%)
   - ✅ Execution time: {minutes} minutes (target: ≤30 min)
   - ✅ No regressions identified
   - ✅ All validation criteria passed
   ```

2. **Organize All Artifacts**
   Create directory structure:
   ```
   prompt_tuning_results_{project_name}/
   ├── analysis_report_{project_name}.md
   ├── test_cases_{project_name}.json
   ├── simulation_results_{project_name}_baseline.json
   ├── simulation_results_{project_name}_improved.json
   ├── evaluation_report_{project_name}_baseline.md
   ├── evaluation_report_{project_name}_improved.md
   ├── comparison_report_{project_name}.md
   ├── executive_summary_{project_name}.md
   └── updated_prompts/
       ├── phase1.md (or equivalent)
       ├── phase2.md
       └── phase3.md
   ```

3. **Document Lessons Learned**
   ```markdown
   ## Lessons Learned: {project_name}

   ### What Worked Well
   - {insight_1}
   - {insight_2}

   ### Challenges Encountered
   - {challenge_1}: {how_resolved}
   - {challenge_2}: {how_resolved}

   ### Recommendations for Similar Projects
   - {recommendation_1}
   - {recommendation_2}
   ```

4. **Final Validation Checklist**
   - [ ] Average score ≥4.0 achieved
   - [ ] Improvement ≥12% documented
   - [ ] All test cases passing
   - [ ] No regressions identified
   - [ ] Updated prompt files ready for use
   - [ ] Complete documentation package created

### Success Criteria
- [ ] Executive summary created
- [ ] All artifacts organized and accessible
- [ ] Lessons learned documented
- [ ] Final validation checklist completed
- [ ] Ready for human review and deployment

---

## Critical Success Factors

### 1. Objectivity in Evaluation
- **DO**: Score based on rubric, cite specific examples
- **DON'T**: Inflate scores or be overly lenient

### 2. Realism in Simulation
- **DO**: Generate outputs that match real-world LLM quality
- **DON'T**: Generate perfect outputs that no LLM could produce

### 3. Specificity in Recommendations
- **DO**: Provide exact wording changes with before/after
- **DON'T**: Give vague advice like "make it clearer"

### 4. Consistency Across Test Cases
- **DO**: Apply same standards to all test cases
- **DON'T**: Be stricter on some test cases than others

### 5. Focus on Root Causes
- **DO**: Fix underlying prompt issues
- **DON'T**: Just tweak outputs manually

---

## Quality Gates

**Before proceeding to next phase, verify**:

**After Phase 3 (Test Generation)**:
- [ ] 5-8 diverse, realistic test cases created
- [ ] All required input fields populated
- [ ] Test cases cover different scenarios

**After Phase 4 (Baseline Simulation)**:
- [ ] All test cases executed successfully
- [ ] Outputs captured for all phases
- [ ] Outputs are realistic quality

**After Phase 5 (Evaluation)**:
- [ ] All test cases scored using rubric
- [ ] Specific issues documented
- [ ] Patterns identified

**After Phase 6 (Optimization)**:
- [ ] At least 3-5 recommendations created
- [ ] Recommendations prioritized
- [ ] Updated prompts created

**After Phase 7 (Validation)**:
- [ ] Average score improved by ≥12%
- [ ] No regressions >0.5 points
- [ ] Validation criteria met

**After Phase 8 (Final Report)**:
- [ ] Complete documentation package
- [ ] Ready for deployment
- [ ] Success metrics achieved

---

## Getting Started

To begin generalized prompt tuning, say:

> "I'm ready to optimize LLM prompts for [project_path]. I've read the PRD and design spec. Let's start with Phase 1: Project Detection and Analysis."

Then systematically execute each phase, ensuring all success criteria are met before proceeding to the next phase.

---

**This generalized system enables any AI agent to achieve consistent +12% quality improvements across any supported project type in ≤30 minutes of autonomous execution.**
