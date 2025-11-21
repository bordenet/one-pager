"""
Quality Evaluation Engine for AI Agent Prompt Tuning
Scores LLM outputs against quality criteria
"""
import json
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path

from prompt_tuning_config import ProjectConfig, ScoringConfig
from prompt_simulator import SimulationResult, PhaseOutput


@dataclass
class QualityScore:
    """Quality score for a single criterion"""
    criterion: str
    score: float
    rationale: str
    max_score: float = 5.0


@dataclass
class PhaseEvaluation:
    """Evaluation of a single phase output"""
    phase: str
    test_case_id: str
    test_case_name: str
    word_count: int
    scores: Dict[str, QualityScore]
    overall_score: float
    meets_target: bool


@dataclass
class EvaluationReport:
    """Complete evaluation report"""
    project: str
    iteration: int
    timestamp: str
    phase_evaluations: List[PhaseEvaluation]
    summary_stats: Dict[str, Any]


class QualityEvaluator:
    """Main evaluation engine"""

    def __init__(self, config: ProjectConfig):
        self.config = config
        self.scoring_config = config.scoring

    def count_words(self, text: str) -> int:
        """Count words in text"""
        return len(text.split())

    def evaluate_clarity(self, output: PhaseOutput, test_case_name: str) -> QualityScore:
        """Evaluate clarity criterion"""
        content = output.content

        # Check for clear structure
        has_headers = bool(re.search(r'^#+\s', content, re.MULTILINE))
        has_bullets = bool(re.search(r'^\s*[-*]\s', content, re.MULTILINE))

        # Check for specific metrics (numbers, percentages)
        has_metrics = bool(re.search(r'\d+%|\$\d+|\d+\.\d+', content))

        # Check for jargon/complexity
        complex_words = len(re.findall(r'\b\w{10,}\b', content))
        total_words = self.count_words(content)
        complexity_ratio = complex_words / max(total_words, 1)

        # Scoring logic
        score = 3.0  # Base score

        if has_headers and has_bullets:
            score += 0.8  # Good structure
        elif has_headers or has_bullets:
            score += 0.4

        if has_metrics:
            score += 0.6  # Specific metrics

        if complexity_ratio < 0.1:
            score += 0.4  # Low complexity
        elif complexity_ratio > 0.2:
            score -= 0.3  # High complexity

        score = max(1.0, min(5.0, score))

        rationale = f"Structure: {'Good' if has_headers else 'Basic'}, "
        rationale += f"Metrics: {'Present' if has_metrics else 'Missing'}, "
        rationale += f"Complexity: {complexity_ratio:.1%}"

        return QualityScore("clarity", score, rationale)

    def evaluate_conciseness(self, output: PhaseOutput, test_case_name: str) -> QualityScore:
        """Evaluate conciseness criterion"""
        word_count = output.word_count
        target_min, target_max = self.config.word_count_target

        # Score based on word count relative to target
        if target_min <= word_count <= target_max:
            score = 5.0  # Perfect range
        elif word_count < target_min:
            # Under-length penalty
            shortage = target_min - word_count
            penalty = min(2.0, shortage / target_min * 3)
            score = 5.0 - penalty
        else:
            # Over-length penalty (less severe)
            excess = word_count - target_max
            penalty = min(1.0, excess / target_max * 2)
            score = 5.0 - penalty

        score = max(1.0, min(5.0, score))

        rationale = f"Word count: {word_count} (target: {target_min}-{target_max})"
        if word_count < target_min:
            rationale += f", {target_min - word_count} words short"
        elif word_count > target_max:
            rationale += f", {word_count - target_max} words over"

        return QualityScore("conciseness", score, rationale)

    def evaluate_impact(self, output: PhaseOutput, test_case_name: str) -> QualityScore:
        """Evaluate business impact criterion"""
        content = output.content.lower()

        # Look for business impact keywords
        business_keywords = [
            'revenue', 'cost', 'profit', 'roi', 'customer', 'churn', 'retention',
            'competitive', 'market', 'growth', 'efficiency', 'risk', 'compliance'
        ]

        strategic_keywords = [
            'strategic', 'initiative', 'advantage', 'opportunity', 'threat',
            'crisis', 'critical', 'urgent', 'priority'
        ]

        quantified_keywords = [
            '%', 'percent', 'million', 'thousand', 'increase', 'decrease',
            'improve', 'reduce', 'save', 'generate'
        ]

        business_score = sum(1 for kw in business_keywords if kw in content)
        strategic_score = sum(1 for kw in strategic_keywords if kw in content)
        quantified_score = sum(1 for kw in quantified_keywords if kw in content)

        # Check for problem framing (crisis vs technical issue)
        has_crisis_framing = any(word in content for word in ['crisis', 'critical', 'urgent', 'bleeding'])
        has_stakes = any(word in content for word in ['cost of inaction', 'if we don\'t', 'risk of'])

        # Scoring
        score = 2.0  # Base score
        score += min(1.0, business_score * 0.2)  # Up to 1.0 for business terms
        score += min(0.8, strategic_score * 0.3)  # Up to 0.8 for strategic terms
        score += min(0.7, quantified_score * 0.1)  # Up to 0.7 for quantification

        if has_crisis_framing:
            score += 0.3
        if has_stakes:
            score += 0.2

        score = max(1.0, min(5.0, score))

        rationale = f"Business terms: {business_score}, Strategic: {strategic_score}, "
        rationale += f"Quantified: {quantified_score}, Crisis framing: {has_crisis_framing}"

        return QualityScore("impact", score, rationale)

    def evaluate_feasibility(self, output: PhaseOutput, test_case_name: str) -> QualityScore:
        """Evaluate feasibility criterion"""
        content = output.content.lower()

        # Look for timeline indicators
        has_timeline = bool(re.search(r'week|month|quarter|phase \d+|milestone', content))
        has_phases = bool(re.search(r'phase \d+|stage \d+|step \d+', content))

        # Look for risk considerations
        risk_keywords = ['risk', 'challenge', 'dependency', 'assumption', 'constraint']
        has_risks = any(kw in content for kw in risk_keywords)

        # Look for resource considerations
        resource_keywords = ['team', 'resource', 'budget', 'stakeholder', 'approval']
        has_resources = any(kw in content for kw in resource_keywords)

        # Scoring
        score = 3.0  # Base score

        if has_timeline:
            score += 0.6
        if has_phases:
            score += 0.4
        if has_risks:
            score += 0.5
        if has_resources:
            score += 0.5

        score = max(1.0, min(5.0, score))

        rationale = f"Timeline: {has_timeline}, Phases: {has_phases}, "
        rationale += f"Risks: {has_risks}, Resources: {has_resources}"

        return QualityScore("feasibility", score, rationale)

    def evaluate_completeness(self, output: PhaseOutput, test_case_name: str) -> QualityScore:
        """Evaluate completeness criterion"""
        content = output.content

        # Check for required sections (based on one-pager template)
        required_sections = [
            'problem', 'solution', 'goal', 'benefit', 'scope', 'metric', 'stakeholder', 'timeline'
        ]

        sections_found = 0
        for section in required_sections:
            if section in content.lower():
                sections_found += 1

        # Check for substantive content in each section
        section_headers = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
        substantive_sections = 0

        for header in section_headers:
            # Find content after this header
            header_pattern = re.escape(header)
            match = re.search(f'{header_pattern}(.+?)(?=^#+|$)', content, re.MULTILINE | re.DOTALL)
            if match and len(match.group(1).strip()) > 50:  # At least 50 chars
                substantive_sections += 1

        # Scoring
        completeness_ratio = sections_found / len(required_sections)
        substantive_ratio = substantive_sections / max(len(section_headers), 1)

        score = 1.0 + (completeness_ratio * 2.5) + (substantive_ratio * 1.5)
        score = max(1.0, min(5.0, score))

        rationale = f"Sections: {sections_found}/{len(required_sections)}, "
        rationale += f"Substantive: {substantive_sections}/{len(section_headers)}"

        return QualityScore("completeness", score, rationale)

    def evaluate_phase_output(self, output: PhaseOutput, test_case_name: str) -> PhaseEvaluation:
        """Evaluate a single phase output against all criteria"""
        scores = {}

        # Evaluate each criterion
        for criterion in self.scoring_config.criteria:
            if criterion == "clarity":
                scores[criterion] = self.evaluate_clarity(output, test_case_name)
            elif criterion == "conciseness":
                scores[criterion] = self.evaluate_conciseness(output, test_case_name)
            elif criterion == "impact":
                scores[criterion] = self.evaluate_impact(output, test_case_name)
            elif criterion == "feasibility":
                scores[criterion] = self.evaluate_feasibility(output, test_case_name)
            elif criterion == "completeness":
                scores[criterion] = self.evaluate_completeness(output, test_case_name)
            else:
                # Default scoring for unknown criteria
                scores[criterion] = QualityScore(criterion, 3.0, "Default scoring")

        # Calculate overall score
        total_score = sum(score.score for score in scores.values())
        overall_score = total_score / len(scores)

        # Check if meets target
        meets_target = overall_score >= self.scoring_config.target_score

        return PhaseEvaluation(
            phase=output.phase,
            test_case_id="",  # Will be filled by caller
            test_case_name=test_case_name,
            word_count=output.word_count,
            scores=scores,
            overall_score=overall_score,
            meets_target=meets_target
        )

    def evaluate_simulation_results(self, results: List[SimulationResult], iteration: int = 0) -> EvaluationReport:
        """Evaluate all simulation results"""
        phase_evaluations = []

        for result in results:
            for phase_name, phase_output in result.phase_outputs.items():
                evaluation = self.evaluate_phase_output(phase_output, result.test_case_name)
                evaluation.test_case_id = result.test_case_id
                phase_evaluations.append(evaluation)

        # Calculate summary statistics
        summary_stats = self._calculate_summary_stats(phase_evaluations)

        return EvaluationReport(
            project=self.config.project_name,
            iteration=iteration,
            timestamp=results[0].timestamp if results else "",
            phase_evaluations=phase_evaluations,
            summary_stats=summary_stats
        )

    def _calculate_summary_stats(self, evaluations: List[PhaseEvaluation]) -> Dict[str, Any]:
        """Calculate summary statistics"""
        if not evaluations:
            return {}

        # Group by phase
        phases = {}
        for eval in evaluations:
            if eval.phase not in phases:
                phases[eval.phase] = []
            phases[eval.phase].append(eval)

        summary = {}

        for phase_name, phase_evals in phases.items():
            phase_summary = {
                "count": len(phase_evals),
                "overall_scores": [e.overall_score for e in phase_evals],
                "average_score": sum(e.overall_score for e in phase_evals) / len(phase_evals),
                "meets_target_count": sum(1 for e in phase_evals if e.meets_target),
                "meets_target_percentage": sum(1 for e in phase_evals if e.meets_target) / len(phase_evals) * 100,
                "average_word_count": sum(e.word_count for e in phase_evals) / len(phase_evals),
                "criteria_averages": {}
            }

            # Calculate averages for each criterion
            for criterion in self.scoring_config.criteria:
                criterion_scores = [e.scores[criterion].score for e in phase_evals if criterion in e.scores]
                if criterion_scores:
                    phase_summary["criteria_averages"][criterion] = sum(criterion_scores) / len(criterion_scores)

            summary[phase_name] = phase_summary

        # Overall summary
        all_scores = [e.overall_score for e in evaluations]
        summary["overall"] = {
            "total_evaluations": len(evaluations),
            "average_score": sum(all_scores) / len(all_scores),
            "meets_target_count": sum(1 for e in evaluations if e.meets_target),
            "meets_target_percentage": sum(1 for e in evaluations if e.meets_target) / len(evaluations) * 100
        }

        return summary

    def save_evaluation_report(self, report: EvaluationReport, iteration: int = 0):
        """Save evaluation report to file"""
        self.config.results_dir.mkdir(exist_ok=True)

        if iteration == 0:
            filename = f"evaluation_report_{self.config.project_name}_original.md"
        else:
            filename = f"evaluation_report_{self.config.project_name}_iter{iteration}.md"

        output_file = self.config.results_dir / filename

        # Generate markdown report
        markdown_content = self._generate_markdown_report(report)

        with open(output_file, 'w') as f:
            f.write(markdown_content)

        # Also save JSON version
        json_file = output_file.with_suffix('.json')
        with open(json_file, 'w') as f:
            json.dump(asdict(report), f, indent=2)

        print(f"Evaluation report saved to: {output_file}")
        return output_file

    def _generate_markdown_report(self, report: EvaluationReport) -> str:
        """Generate markdown evaluation report"""
        md = f"""# Evaluation Report: {report.project}
## Iteration {report.iteration}

**Date**: {report.timestamp[:10]}
**Total Evaluations**: {report.summary_stats.get('overall', {}).get('total_evaluations', 0)}
**Overall Average Score**: {report.summary_stats.get('overall', {}).get('average_score', 0):.2f}/5.0

---

## Summary by Phase

"""

        for phase_name, phase_stats in report.summary_stats.items():
            if phase_name == "overall":
                continue

            md += f"""### {phase_name.title()}

- **Average Score**: {phase_stats['average_score']:.2f}/5.0
- **Meets Target**: {phase_stats['meets_target_count']}/{phase_stats['count']} ({phase_stats['meets_target_percentage']:.1f}%)
- **Average Word Count**: {phase_stats['average_word_count']:.0f}

**Criteria Breakdown**:
"""

            for criterion, avg_score in phase_stats['criteria_averages'].items():
                md += f"- **{criterion.title()}**: {avg_score:.2f}/5.0\n"

            md += "\n"

        md += """---

## Detailed Results

| Test Case | Phase | Overall | Clarity | Conciseness | Impact | Feasibility | Completeness | Words |
|-----------|-------|---------|---------|-------------|--------|-------------|--------------|-------|
"""

        for eval in report.phase_evaluations:
            scores = eval.scores
            md += f"| {eval.test_case_name[:20]}... | {eval.phase} | {eval.overall_score:.1f} |"

            for criterion in ["clarity", "conciseness", "impact", "feasibility", "completeness"]:
                if criterion in scores:
                    md += f" {scores[criterion].score:.1f} |"
                else:
                    md += " - |"

            md += f" {eval.word_count} |\n"

        return md
