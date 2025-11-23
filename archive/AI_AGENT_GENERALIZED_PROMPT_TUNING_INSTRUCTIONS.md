# AI Agent Instructions: Rigorous Evolutionary LLM Prompt Tuning System

**Purpose**: Multi-round evolutionary optimization methodology for AI agents to systematically improve LLM prompts through scored iterations.

**Context**: This is the generalized version of the successful one-pager methodology that achieved +12% quality improvements through rigorous evolutionary optimization, not simple instruction-following.

**Critical Understanding**: This is NOT a "follow steps" process. This is a **rigorous evolutionary system** where each prompt change is a mutation that must be scored and kept/discarded based on objective improvement.

---

## 🔬 **CRITICAL "AH-HA!" MOMENTS FROM SUCCESSFUL OPTIMIZATION**

### 1. **Adversarial Tension Creates Value**
The 3-phase workflow is NOT "review and improve." Phase 2 must generate a **DELIBERATELY DIFFERENT** but constructive alternative approach. The value comes from tension between different models' approaches, not incremental refinement.

### 2. **Evolutionary Keep/Discard Logic**
Treat each prompt change as a **mutation**. If new_score > previous_score: **KEEP**. If new_score ≤ previous_score: **DISCARD**. No exceptions, no subjective judgment.

### 3. **Incremental Scoring Prevents Regression**
Track quality scores across **ALL iterations**. Visualize improvement trajectory. Identify diminishing returns. Never accept a change that reduces overall quality.

### 4. **Multi-Round Evolution Beats Single-Pass**
20-40 rounds of small mutations with objective scoring outperforms single large changes. But more rounds aren't always better - find the sweet spot.

---

## 🎯 **EVOLUTIONARY OPTIMIZATION METHODOLOGY**

### Two-Phase Approach: 20-Round vs 40-Round Comparison

**Phase A: 20-Round Optimization**
1. Establish rigorous baseline with diverse test cases
2. Execute 20 evolutionary rounds with keep/discard logic
3. Analyze improvement patterns and diminishing returns

**Phase B: 40-Round Extended Optimization**
4. Continue evolution for additional 20 rounds (total 40)
5. Compare results: Is more always better?
6. Determine optimal iteration count for future projects

### Core Execution Loop (Each Round):
```
Mutation → Simulation → Evaluation → Keep/Discard Decision → Documentation
```

---

## 🚀 **RIGOROUS EVOLUTIONARY EXECUTION METHODOLOGY**

### Step 1: Establish Rigorous Baseline

**Objective**: Create unassailable baseline measurements for evolutionary comparison.

**Critical Requirements**:
1. **Generate 8 Diverse Test Cases** - Must cover full spectrum of project use cases
2. **Execute Current Prompts** - YOU act as LLM, follow prompts exactly as written
3. **Score Using Standardized Rubric** - Objective evaluation with specific evidence
4. **Document Everything** - Every score, every rationale, every pattern identified

**Quality Rubrics by Project Type**:

**For one-pager projects**:
- Clarity (1-5): Easy to understand, no ambiguity
- Conciseness (1-5): Fits on one page, no unnecessary content
- Completeness (1-5): All required sections present and meaningful
- Professionalism (1-5): Appropriate tone, formatting, business language
- Actionability (1-5): Clear next steps, specific metrics, implementable

**For product-requirements-assistant projects**:
- Comprehensiveness (1-5): Covers all necessary PRD aspects
- Clarity (1-5): Requirements unambiguous and specific
- Structure (1-5): Proper section numbering (## 1. Executive Summary, ### 1.1 etc.)
- Consistency (1-5): Aligned across all three phases
- Engineering-Ready (1-5): Focuses on "why" and "what", avoids "how"
- No Metadata Table (Pass/Fail): Follows user requirement to avoid metadata tables
- Section Numbering (Pass/Fail): Uses numbered sections as specified

**Baseline Success Criteria**:
- [ ] 8 diverse, realistic test cases created
- [ ] All test cases executed through full workflow
- [ ] Every output scored with specific evidence cited
- [ ] Baseline average score calculated and documented
- [ ] Common weakness patterns identified for targeting

---

### Step 2: Execute 20-Round Evolutionary Optimization

**Objective**: Systematic improvement through scored mutations with keep/discard logic.

**Critical Methodology**:

**For Each Round (1-20)**:
1. **Identify Target**: Focus on lowest-scoring criterion or most common issue
2. **Design Mutation**: Create ONE specific, testable change to prompts
3. **Apply Mutation**: Modify prompt files with the specific change
4. **Re-Execute ALL Test Cases**: Run complete workflow with mutated prompts
5. **Score Results**: Use SAME rubric, calculate new average score
6. **Make Decision**:
   - If new_average > previous_average: **KEEP** mutation
   - If new_average ≤ previous_average: **DISCARD** mutation, revert prompts
7. **Document Round**: Record mutation, scores, decision, rationale

**Example Mutation Types**:
- **Word Count Enforcement**: Add explicit length constraints
- **Business Framing**: Strengthen strategic language and business focus
- **Adversarial Tension**: Enhance Phase 2 to be more deliberately different
- **Structural Improvements**: Add section requirements, formatting constraints
- **Evidence Requirements**: Demand specific examples and quantifiable metrics
- **Stakeholder Focus**: Improve stakeholder identification and communication

**Round Documentation Template**:
```markdown
## Round {N}: {Mutation_Name}

### Mutation Applied
**Target Issue**: {lowest_scoring_criterion or common_pattern}
**Specific Change**: {exact_prompt_modification}
**Rationale**: {why_this_should_improve_scores}

### Results
**Previous Average**: {score}/5.0
**New Average**: {score}/5.0
**Delta**: {+/-change}

### Decision: {KEEP/DISCARD}
**Rationale**: {objective_reasoning_based_on_scores}

### Test Case Impact
- test_001: {old_score} → {new_score} ({delta})
- test_002: {old_score} → {new_score} ({delta})
[etc.]
```

**20-Round Success Criteria**:
- [ ] All 20 rounds executed with documented mutations
- [ ] Every keep/discard decision based on objective scoring
- [ ] Improvement trajectory tracked and visualized
- [ ] Final 20-round score ≥12% above baseline
- [ ] Diminishing returns pattern identified

---

### Step 3: Execute 40-Round Extended Optimization

**Objective**: Determine if additional iterations yield better results than 20-round approach.

**Extended Methodology**:
- **Continue from Round 20**: Use best prompts from 20-round optimization
- **Execute Rounds 21-40**: Same rigorous mutation/scoring/decision process
- **Advanced Mutations**: Try combination improvements, cross-phase optimizations
- **Track Diminishing Returns**: Identify when improvements plateau

**Advanced Mutation Types (Rounds 21-40)**:
- **Cross-Phase Consistency**: Ensure Phase 2 references Phase 1 appropriately
- **Combination Improvements**: Apply multiple successful mutations together
- **Edge Case Handling**: Address specific test case weaknesses
- **Refinement Mutations**: Polish successful changes for maximum impact

**40-Round Success Criteria**:
- [ ] Additional 20 rounds executed with same rigor
- [ ] Comparison analysis: 20-round vs 40-round results
- [ ] Definitive answer: Is more always better?
- [ ] Optimal iteration count identified for future projects

---

### Step 4: Comparative Analysis and Final Report

**Objective**: Determine which approach (20-round vs 40-round) produces superior results.

**Analysis Requirements**:

1. **Quantitative Comparison**:
   ```
   Baseline Score: {score}/5.0
   20-Round Score: {score}/5.0 (+{improvement}%)
   40-Round Score: {score}/5.0 (+{improvement}%)

   Winner: {20-round/40-round/tie}
   Rationale: {objective_analysis}
   ```

2. **Qualitative Assessment**:
   - Which approach produced more consistent improvements?
   - Where did diminishing returns begin?
   - What types of mutations were most effective?
   - Which test cases showed greatest improvement?

3. **Efficiency Analysis**:
   - Time investment: 20-round vs 40-round
   - Quality improvement per round
   - Optimal stopping point identification

**Final Deliverables**:
- [ ] **Optimized Prompts**: Best-performing versions ready for deployment
- [ ] **Complete Mutation Log**: Every round documented with scores and decisions
- [ ] **Comparative Analysis**: Definitive answer on optimal iteration count
- [ ] **Transferable Insights**: Patterns applicable to other Genesis projects
- [ ] **Quality Improvement**: ≥12% improvement over baseline achieved

---

## 🎯 **EXECUTION TRIGGER COMMANDS**

### For 20-Round Optimization:
```
I'm ready to execute rigorous evolutionary prompt optimization for [project_name]. I will establish a baseline with 8 diverse test cases, then execute 20 rounds of scored mutations with keep/discard logic. Beginning with baseline establishment.
```

### For 20-Round vs 40-Round Comparison:
```
I'm ready to execute comparative evolutionary optimization for [project_name]. I will run both 20-round and 40-round optimizations to determine the optimal iteration count. This will answer definitively whether "more rounds = better results." Beginning with baseline establishment for 20-round optimization.
```

---

## 🔬 **CRITICAL SUCCESS FACTORS**

### 1. **Rigorous Objectivity**
- **DO**: Score based on rubric with specific evidence citations
- **DON'T**: Allow subjective preferences to influence scores
- **REQUIREMENT**: Every score must have concrete examples from output

### 2. **Evolutionary Discipline**
- **DO**: Apply keep/discard logic ruthlessly based on scores
- **DON'T**: Keep changes because they "seem better" without score improvement
- **REQUIREMENT**: If new_score ≤ previous_score, DISCARD immediately

### 3. **Realistic LLM Simulation**
- **DO**: Generate outputs matching real-world LLM quality and limitations
- **DON'T**: Create perfect outputs no actual LLM could produce
- **REQUIREMENT**: Outputs should have realistic flaws that prompts can address

### 4. **Adversarial Understanding**
- **DO**: Make Phase 2 deliberately different from Phase 1 approach
- **DON'T**: Make Phase 2 just "review and improve" Phase 1
- **REQUIREMENT**: Phase 2 must offer genuinely alternative perspective

### 5. **Mutation Specificity**
- **DO**: Apply ONE specific, testable change per round
- **DON'T**: Make multiple changes simultaneously
- **REQUIREMENT**: Each mutation must be clearly defined and reversible

---

## 📊 **QUALITY GATES AND VALIDATION**

### Baseline Quality Gate:
- [ ] 8 diverse test cases covering full project spectrum
- [ ] All test cases executed through complete workflow
- [ ] Every output scored with specific evidence
- [ ] Baseline average calculated and documented
- [ ] Common weakness patterns identified

### Per-Round Quality Gate:
- [ ] Single, specific mutation applied
- [ ] All 8 test cases re-executed with mutation
- [ ] All outputs re-scored using same rubric
- [ ] Keep/discard decision made based on average score
- [ ] Round documented with scores and rationale

### Final Success Gate:
- [ ] ≥12% improvement over baseline achieved
- [ ] No test case regressed by >0.5 points
- [ ] Optimal iteration count determined (20 vs 40 rounds)
- [ ] Production-ready prompts delivered
- [ ] Complete mutation log with all decisions documented

---

## 🚀 **EXPECTED OUTCOMES**

### Quantitative Results:
- **Quality Improvement**: ≥12% average score increase
- **Consistency**: All test cases show improvement or maintain quality
- **Efficiency**: Optimal iteration count identified for future projects
- **Reproducibility**: Complete methodology documented for replication

### Qualitative Insights:
- **Mutation Effectiveness**: Which types of changes drive biggest improvements
- **Diminishing Returns**: When additional rounds stop adding value
- **Project Patterns**: Insights applicable to similar Genesis projects
- **Adversarial Optimization**: How tension between phases improves final output

---

**This evolutionary methodology transforms prompt optimization from subjective art into objective science, delivering consistent +12% improvements through rigorous iteration and scoring.**
