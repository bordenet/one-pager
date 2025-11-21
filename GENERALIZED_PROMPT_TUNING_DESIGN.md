# Design Specification: Generalized LLM Prompt Tuning System

**Version**: 1.0
**Date**: 2025-11-21
**Related**: GENERALIZED_PROMPT_TUNING_PRD.md

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Generalized Prompt Tuner                   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Project   │  │    Test     │  │  Quality    │        │
│  │  Detector   │  │ Generator   │  │ Evaluator   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Simulation  │  │ Evolution   │  │   Report    │        │
│  │   Engine    │  │   Engine    │  │ Generator   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent Interface                      │
│  - Single command execution                                │
│  - Progress tracking                                       │
│  - Autonomous decision making                              │
│  - Result reporting                                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Core Components

1. **Project Detector**: Identifies project type and prompt structure
2. **Test Generator**: Creates realistic test cases based on project context
3. **Simulation Engine**: Executes prompts with mock LLM responses
4. **Quality Evaluator**: Scores outputs against standardized rubrics
5. **Evolution Engine**: Applies improvements using keep/discard logic
6. **Report Generator**: Creates comprehensive analysis and comparison reports

### 1.3 Data Flow

```
Project Path → Project Detection → Prompt Analysis → Test Generation
     ↓
Baseline Simulation → Quality Evaluation → Improvement Identification
     ↓
Prompt Optimization → Validation Simulation → Final Report
```

## 2. Project Detection System

### 2.1 Supported Project Types

#### Type 1: one-pager (JavaScript/Markdown)
- **Prompt Location**: `prompts/*.md`
- **Format**: Markdown files with `{variable}` placeholders
- **Workflow**: 3-phase adversarial (phase1.md → phase2.md → phase3.md)
- **Output**: Business one-pager documents

#### Type 2: product-requirements-assistant (Go/Markdown)
- **Prompt Location**: `prompts/*.md`
- **Format**: Markdown files with `{variable}` placeholders
- **Workflow**: 3-phase collaborative (phase1 → phase2 → phase3)
- **Output**: Product Requirements Documents

#### Type 3: Generic Multi-Phase (Future)
- **Prompt Location**: `prompts/` or `templates/`
- **Format**: Markdown, JSON, or YAML
- **Workflow**: Configurable N-phase
- **Output**: Various document types

### 2.2 Detection Algorithm

```python
def detect_project_type(project_path):
    """Detect project type and prompt structure"""

    # Check for package.json (JavaScript)
    if exists(f"{project_path}/package.json"):
        if exists(f"{project_path}/prompts/phase1.md"):
            return ProjectType.ONE_PAGER

    # Check for go.mod (Go)
    if exists(f"{project_path}/go.mod") or exists(f"{project_path}/backend/go.mod"):
        if exists(f"{project_path}/prompts/phase1-claude-initial.md"):
            return ProjectType.PRODUCT_REQUIREMENTS_ASSISTANT

    # Generic detection
    prompt_files = find_files(project_path, ["*.md", "*.json", "*.yaml"], ["prompts", "templates"])
    if prompt_files:
        return ProjectType.GENERIC

    raise UnsupportedProjectError(f"No supported prompt structure found in {project_path}")
```

### 2.3 Prompt Structure Analysis

For each detected project:
1. **Parse prompt files** and identify variable placeholders
2. **Map workflow dependencies** (phase1 → phase2 → phase3)
3. **Extract expected output format** from prompt instructions
4. **Identify quality criteria** mentioned in prompts
5. **Document current structure** for baseline comparison

## 3. Test Generation System

### 3.1 Context-Aware Test Generation

The system generates test cases based on project context:

#### For one-pager Projects:
```python
def generate_onepager_tests(project_context):
    """Generate diverse one-pager test scenarios"""

    industries = ["SaaS", "E-commerce", "Healthcare", "Fintech", "Manufacturing"]
    project_types = ["New Feature", "Redesign", "Migration", "Optimization"]
    scopes = ["Small (2-4 weeks)", "Medium (2-3 months)", "Large (6+ months)"]

    test_cases = []
    for i in range(8):  # Generate 8 diverse cases
        test_case = {
            "id": f"test_{i+1:03d}",
            "industry": random.choice(industries),
            "project_type": random.choice(project_types),
            "scope": random.choice(scopes),
            "inputs": generate_realistic_inputs(industry, project_type, scope)
        }
        test_cases.append(test_case)

    return test_cases
```

#### For product-requirements-assistant Projects:
```python
def generate_prd_tests(project_context):
    """Generate diverse PRD test scenarios"""

    product_types = ["Mobile App", "Web Service", "API", "Platform", "Internal Tool"]
    complexities = ["Simple Feature", "Complex System", "Integration", "Migration"]
    audiences = ["B2B", "B2C", "Internal", "Partner-facing"]

    # Similar pattern with PRD-specific test generation
```

### 3.2 Test Case Structure

```json
{
  "project_type": "one-pager",
  "test_cases": [
    {
      "id": "test_001",
      "name": "Customer Portal Redesign",
      "context": {
        "industry": "SaaS",
        "project_type": "Redesign",
        "scope": "Medium (2-3 months)"
      },
      "inputs": {
        "projectName": "Customer Portal Redesign",
        "problemStatement": "Current portal has 45% bounce rate...",
        "proposedSolution": "Redesign with user-centered navigation...",
        "keyGoals": "Reduce bounce rate to <20%...",
        "scopeInScope": "Navigation redesign, search...",
        "scopeOutOfScope": "Backend API changes...",
        "successMetrics": "Bounce rate <20%, support tickets -40%...",
        "keyStakeholders": "Product Manager (Sarah Chen)...",
        "timelineEstimate": "12 weeks (2 weeks discovery...)"
      },
      "expected_qualities": {
        "clarity": 4,
        "conciseness": 5,
        "completeness": 4,
        "professionalism": 5,
        "actionability": 4
      }
    }
  ]
}
```

## 4. Simulation Engine

### 4.1 Mock LLM Response System

The simulation engine uses AI agent-generated responses that mimic real LLM behavior:

```python
class MockLLMEngine:
    """Generates realistic LLM responses for testing"""

    def __init__(self, project_type):
        self.project_type = project_type
        self.response_patterns = load_proven_patterns(project_type)

    def generate_response(self, prompt, phase, test_case):
        """Generate mock response based on proven patterns"""

        if self.project_type == "one-pager":
            return self._generate_onepager_response(prompt, phase, test_case)
        elif self.project_type == "product-requirements-assistant":
            return self._generate_prd_response(prompt, phase, test_case)

    def _generate_onepager_response(self, prompt, phase, test_case):
        """Generate one-pager mock response"""

        if phase == "phase1":
            # Business-focused, 550-650 words, strategic framing
            return self._create_phase1_onepager(test_case)
        elif phase == "phase2":
            # Adversarial alternative, different approach
            return self._create_phase2_onepager(test_case)
        elif phase == "phase3":
            # Synthesis of best elements, 600-700 words
            return self._create_phase3_onepager(test_case)
```

### 4.2 Multi-Phase Workflow Execution

```python
def execute_workflow(test_case, prompts):
    """Execute multi-phase workflow with proper dependencies"""

    results = {}

    # Phase 1: Initial generation
    phase1_prompt = substitute_variables(prompts["phase1"], test_case["inputs"])
    results["phase1"] = mock_llm.generate_response(phase1_prompt, "phase1", test_case)

    # Phase 2: Use Phase 1 output as input
    phase2_inputs = {**test_case["inputs"], "phase1_output": results["phase1"]}
    phase2_prompt = substitute_variables(prompts["phase2"], phase2_inputs)
    results["phase2"] = mock_llm.generate_response(phase2_prompt, "phase2", test_case)

    # Phase 3: Synthesis using both previous outputs
    phase3_inputs = {
        **test_case["inputs"],
        "phase1_output": results["phase1"],
        "phase2_output": results["phase2"]
    }
    phase3_prompt = substitute_variables(prompts["phase3"], phase3_inputs)
    results["phase3"] = mock_llm.generate_response(phase3_prompt, "phase3", test_case)

    return results
```

## 5. Quality Evaluation System

### 5.1 Universal Quality Rubric

```python
class QualityRubric:
    """Standardized quality evaluation system"""

    def __init__(self, project_type):
        self.project_type = project_type
        self.criteria = self._load_criteria(project_type)

    def _load_criteria(self, project_type):
        if project_type == "one-pager":
            return {
                "clarity": ClarityEvaluator(),
                "conciseness": ConcisenessEvaluator(),
                "completeness": CompletenessEvaluator(),
                "professionalism": ProfessionalismEvaluator(),
                "actionability": ActionabilityEvaluator()
            }
        elif project_type == "product-requirements-assistant":
            return {
                "comprehensiveness": ComprehensivenessEvaluator(),
                "clarity": ClarityEvaluator(),
                "structure": StructureEvaluator(),
                "consistency": ConsistencyEvaluator(),
                "engineering_ready": EngineeringReadyEvaluator(),
                "no_metadata_table": NoMetadataTableEvaluator(),
                "section_numbering": SectionNumberingEvaluator()
            }
```

### 5.2 Scoring Algorithm

Each criterion evaluator implements:
- **Score calculation** (1-5 scale or Pass/Fail)
- **Evidence extraction** (specific examples from output)
- **Improvement suggestions** (what would increase the score)

```python
class ClarityEvaluator:
    """Evaluates output clarity"""

    def evaluate(self, output, test_case):
        score = self._calculate_clarity_score(output)
        evidence = self._extract_clarity_evidence(output)
        suggestions = self._generate_clarity_suggestions(output, score)

        return EvaluationResult(
            criterion="clarity",
            score=score,
            evidence=evidence,
            suggestions=suggestions
        )
```

## 6. Evolution Engine

### 6.1 Improvement Identification

```python
def identify_improvements(evaluation_results):
    """Analyze evaluation results to identify improvement opportunities"""

    improvements = []

    # Pattern 1: Consistent low scores across test cases
    for criterion in ["clarity", "conciseness", "completeness"]:
        avg_score = calculate_average_score(evaluation_results, criterion)
        if avg_score < 3.5:
            improvements.append(create_improvement_recommendation(criterion, avg_score))

    # Pattern 2: Specific failure modes
    common_issues = extract_common_issues(evaluation_results)
    for issue in common_issues:
        improvements.append(create_issue_based_recommendation(issue))

    return prioritize_improvements(improvements)
```

### 6.2 Prompt Mutation System

```python
def apply_improvements(prompts, improvements):
    """Apply specific improvements to prompt files"""

    updated_prompts = copy.deepcopy(prompts)

    for improvement in improvements:
        if improvement.type == "word_count_enforcement":
            updated_prompts = add_word_count_constraints(updated_prompts, improvement)
        elif improvement.type == "business_framing":
            updated_prompts = add_business_framing_guidance(updated_prompts, improvement)
        elif improvement.type == "example_addition":
            updated_prompts = add_concrete_examples(updated_prompts, improvement)

    return updated_prompts
```

### 6.3 Keep/Discard Logic

```python
def validate_improvements(original_results, improved_results):
    """Determine whether to keep or discard improvements"""

    original_avg = calculate_average_score(original_results)
    improved_avg = calculate_average_score(improved_results)

    if improved_avg > original_avg + 0.1:  # Minimum improvement threshold
        # Check for regressions
        regressions = find_regressions(original_results, improved_results, threshold=0.5)
        if len(regressions) == 0:
            return Decision.KEEP

    return Decision.DISCARD

## 7. AI Agent Execution Interface

### 7.1 Command-Line Interface

```python
# generalized_prompt_tuner.py
import click

@click.command()
@click.argument('project_path', type=click.Path(exists=True))
@click.option('--output-dir', default='./prompt_tuning_results', help='Output directory for results')
@click.option('--verbose', is_flag=True, help='Enable verbose logging')
def optimize(project_path, output_dir, verbose):
    """Optimize LLM prompts for any supported project"""

    # Phase 1: Project Detection
    click.echo("🔍 Detecting project type and prompt structure...")
    project_type = detect_project_type(project_path)
    click.echo(f"✅ Detected: {project_type}")

    # Phase 2: Test Generation
    click.echo("📝 Generating test cases...")
    test_cases = generate_test_cases(project_type, project_path)
    click.echo(f"✅ Generated {len(test_cases)} test cases")

    # Phase 3: Baseline Evaluation
    click.echo("⚡ Running baseline simulations...")
    baseline_results = run_simulations(project_path, test_cases)
    baseline_score = evaluate_results(baseline_results, project_type)
    click.echo(f"📊 Baseline score: {baseline_score:.2f}/5.0")

    # Phase 4: Optimization
    click.echo("🧬 Optimizing prompts...")
    optimized_prompts = optimize_prompts(project_path, baseline_results)

    # Phase 5: Validation
    click.echo("✅ Validating improvements...")
    improved_results = run_simulations_with_prompts(optimized_prompts, test_cases)
    improved_score = evaluate_results(improved_results, project_type)

    # Phase 6: Results
    improvement = improved_score - baseline_score
    click.echo(f"🎯 Final score: {improved_score:.2f}/5.0 (+{improvement:.2f})")

    if improvement >= 0.12:  # 12% improvement threshold
        click.echo("🎉 SUCCESS: Significant improvement achieved!")
        save_results(output_dir, baseline_results, improved_results, optimized_prompts)
    else:
        click.echo("⚠️  Minimal improvement. Consider manual review.")

if __name__ == '__main__':
    optimize()
```

### 7.2 Progress Tracking

```python
class ProgressTracker:
    """Track and display optimization progress"""

    def __init__(self):
        self.current_phase = None
        self.total_phases = 6
        self.current_step = 0
        self.total_steps = 0

    def start_phase(self, phase_name, total_steps):
        self.current_phase = phase_name
        self.total_steps = total_steps
        self.current_step = 0
        click.echo(f"🔄 {phase_name}...")

    def update_step(self, step_description):
        self.current_step += 1
        progress = (self.current_step / self.total_steps) * 100
        click.echo(f"   [{progress:5.1f}%] {step_description}")

    def complete_phase(self, result_summary):
        click.echo(f"✅ {self.current_phase} complete: {result_summary}")
```

## 8. Report Generation System

### 8.1 Comprehensive Analysis Report

```python
def generate_analysis_report(project_path, baseline_results, improved_results, optimizations):
    """Generate comprehensive analysis report"""

    report = AnalysisReport()

    # Executive Summary
    report.add_section("Executive Summary", {
        "project_path": project_path,
        "baseline_score": calculate_average_score(baseline_results),
        "improved_score": calculate_average_score(improved_results),
        "improvement_delta": calculate_improvement_delta(baseline_results, improved_results),
        "optimizations_applied": len(optimizations),
        "success_threshold_met": improvement_delta >= 0.12
    })

    # Detailed Results
    report.add_section("Test Case Analysis",
        generate_test_case_analysis(baseline_results, improved_results))

    # Applied Optimizations
    report.add_section("Optimizations Applied",
        generate_optimization_summary(optimizations))

    # Before/After Comparisons
    report.add_section("Before/After Examples",
        generate_comparison_examples(baseline_results, improved_results))

    return report
```

### 8.2 Report Templates

```markdown
# Prompt Optimization Report: {project_name}

**Date**: {timestamp}
**Project Path**: {project_path}
**Project Type**: {project_type}

## Executive Summary

- **Baseline Score**: {baseline_score}/5.0
- **Improved Score**: {improved_score}/5.0
- **Improvement**: +{delta} ({percentage}%)
- **Success Threshold**: {threshold_met} (≥12% required)

## Key Achievements

✅ **Quality Improvements**:
- Clarity: {clarity_before} → {clarity_after} (+{clarity_delta})
- Conciseness: {conciseness_before} → {conciseness_after} (+{conciseness_delta})
- Completeness: {completeness_before} → {completeness_after} (+{completeness_delta})

✅ **Optimizations Applied**:
1. {optimization_1}: {description_1}
2. {optimization_2}: {description_2}
3. {optimization_3}: {description_3}

## Test Case Results

### Test Case: {test_case_name}
- **Before**: {before_score}/5.0
- **After**: {after_score}/5.0
- **Delta**: +{delta}

**Key Improvements**:
- {improvement_1}
- {improvement_2}

**Example Output Comparison**:

**Before**:
```
{before_excerpt}
```

**After**:
```
{after_excerpt}
```

## Recommendations for Future

- {recommendation_1}
- {recommendation_2}
- {recommendation_3}
```

## 9. Integration with Existing Tools

### 9.1 Comparison with codebase-reviewer Solution

**Similarities**:
- ✅ 7-phase workflow structure (Analysis → Testing → Optimization → Validation)
- ✅ Quality rubric-based evaluation system
- ✅ Before/after comparison reporting
- ✅ AI agent autonomous execution capability

**Key Differences**:

| Aspect | codebase-reviewer | one-pager (This Solution) |
|--------|------------------|---------------------------|
| **Scope** | Single project focus | Generalized for any project |
| **Architecture** | Manual workflow steps | Automated Python tool |
| **Mock Responses** | Manual JSON creation | AI agent-generated responses |
| **Evolution** | Manual recommendations | Automated keep/discard logic |
| **Integration** | Standalone process | Genesis-ready deployment |
| **Execution** | Human-guided | Fully autonomous |

**Lessons Learned from codebase-reviewer**:
1. **Detailed rubrics are essential** - Specific 1-5 scoring with clear criteria
2. **Test case diversity matters** - Need variety in industries, scopes, complexities
3. **Before/after examples are powerful** - Concrete evidence of improvements
4. **Prioritization is critical** - Focus on high-impact changes first
5. **Validation prevents regressions** - Always check that improvements don't break other areas

**Improvements in This Solution**:
1. **Full automation** - No manual steps required
2. **Proven patterns** - Mock responses based on successful +12% improvements
3. **Universal applicability** - Works across different project types
4. **Genesis integration** - Ready for automatic deployment
5. **Evolutionary optimization** - Systematic keep/discard based on objective scoring

### 9.2 Genesis Integration Strategy

```python
# genesis/tools/prompt_tuning/
├── generalized_prompt_tuner.py     # Main CLI tool
├── project_detectors/              # Project type detection
│   ├── onepager_detector.py
│   ├── prd_assistant_detector.py
│   └── generic_detector.py
├── test_generators/                # Context-aware test generation
│   ├── onepager_tests.py
│   ├── prd_tests.py
│   └── generic_tests.py
├── mock_engines/                   # AI agent response simulation
│   ├── onepager_mock.py
│   ├── prd_mock.py
│   └── base_mock.py
├── evaluators/                     # Quality assessment
│   ├── universal_rubric.py
│   ├── onepager_rubric.py
│   └── prd_rubric.py
└── reports/                        # Analysis and comparison
    ├── report_generator.py
    └── templates/
```

**Genesis Bootstrapping Integration**:
```bash
# During genesis project creation
genesis create my-new-project --template=onepager
cd my-new-project
python ../genesis/tools/prompt_tuning/generalized_prompt_tuner.py optimize .
# Automatically optimized prompts ready for use
```

## 10. Success Metrics and Validation

### 10.1 Quantitative Success Criteria

- **Quality Improvement**: ≥12% average score increase (proven benchmark)
- **Execution Time**: ≤30 minutes total runtime
- **Automation Rate**: 100% autonomous execution (no human intervention)
- **Consistency**: ≥90% of projects achieve target improvement
- **Reliability**: 100% success rate on supported project types

### 10.2 Validation Approach

1. **Baseline Validation**: Test on one-pager and product-requirements-assistant
2. **Cross-Project Validation**: Apply to 3-5 additional Genesis projects
3. **Regression Testing**: Ensure no degradation in quality over time
4. **Performance Benchmarking**: Measure execution time across project sizes
5. **User Acceptance**: AI agents can execute without guidance

## 11. Implementation Roadmap

### Phase 1: Core System (Week 1)
- [ ] Project detection for one-pager and product-requirements-assistant
- [ ] Test case generation with proven patterns
- [ ] Mock LLM response system with +12% improvement patterns
- [ ] Basic quality evaluation rubric

### Phase 2: Optimization Engine (Week 2)
- [ ] Improvement identification algorithms
- [ ] Prompt mutation system
- [ ] Keep/discard validation logic
- [ ] Before/after comparison reporting

### Phase 3: AI Agent Interface (Week 3)
- [ ] Command-line interface with progress tracking
- [ ] Autonomous execution mode
- [ ] Comprehensive report generation
- [ ] Error handling and edge cases

### Phase 4: Genesis Integration (Week 4)
- [ ] Genesis project structure integration
- [ ] Bootstrapping process automation
- [ ] Documentation and usage guides
- [ ] Production deployment and validation

## 12. Risk Mitigation

### 12.1 Technical Risks

**Risk**: Mock responses don't accurately represent real LLM behavior
- **Mitigation**: Base mocks on proven patterns from successful manual tuning
- **Validation**: Compare mock results with actual LLM outputs on sample cases

**Risk**: Project-specific edge cases cause failures
- **Mitigation**: Start with known project types, expand gradually
- **Validation**: Comprehensive testing on diverse project structures

**Risk**: Quality improvements not consistent across different project types
- **Mitigation**: Standardized rubric with project-specific adaptations
- **Validation**: Cross-project validation with consistent success metrics

### 12.2 Operational Risks

**Risk**: AI agents cannot execute autonomously without human guidance
- **Mitigation**: Comprehensive documentation and clear success criteria
- **Validation**: Test autonomous execution in isolated environment

**Risk**: Integration with Genesis breaks existing workflows
- **Mitigation**: Optional integration, backward compatibility maintained
- **Validation**: Parallel testing with existing Genesis projects

## 13. Next Steps

1. ✅ **PRD and Design Approval**: Review and approve this specification
2. ⏳ **Core Implementation**: Build project detection and test generation
3. ⏳ **Mock Engine Development**: Create AI agent response simulation
4. ⏳ **Validation Testing**: Test on one-pager and product-requirements-assistant
5. ⏳ **Genesis Integration**: Embed into Genesis project structure
6. ⏳ **Production Deployment**: Make available for all Genesis projects

---

**This design specification provides the foundation for a generalized, AI-agent-executable prompt tuning system that can achieve consistent +12% quality improvements across any supported project type in ≤30 minutes of autonomous execution.**
```
