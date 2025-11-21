"""
Evolutionary Prompt Tuning Engine
Implements mutation-based optimization with keep/discard logic
"""
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict

from prompt_tuning_config import ProjectConfig
from prompt_simulator import PromptSimulator, SimulationResult
from quality_evaluator import QualityEvaluator, EvaluationReport


@dataclass
class Recommendation:
    """A single prompt improvement recommendation"""
    id: str
    priority: str  # "HIGH", "MEDIUM", "LOW"
    phase: str
    title: str
    description: str
    implementation: str
    expected_impact: str


@dataclass
class MutationResult:
    """Result of testing a single mutation"""
    iteration: int
    recommendation_id: str
    recommendation_title: str
    baseline_score: float
    new_score: float
    delta: float
    decision: str  # "KEEP" or "DISCARD"
    rationale: str
    timestamp: str


@dataclass
class EvolutionarySession:
    """Complete evolutionary tuning session"""
    project: str
    start_time: str
    end_time: Optional[str]
    baseline_score: float
    final_score: float
    total_improvement: float
    iterations: List[MutationResult]
    recommendations_tested: List[str]
    success_rate: float
    stopping_reason: str


class EvolutionaryTuner:
    """Main evolutionary tuning engine"""

    def __init__(self, config: ProjectConfig):
        self.config = config
        self.simulator = PromptSimulator(config)
        self.evaluator = QualityEvaluator(config)
        self.session_file = config.results_dir / "evolutionary_session.json"

    def load_recommendations(self) -> List[Recommendation]:
        """Load recommendations from file"""
        rec_file = self.config.results_dir / f"recommendations_{self.config.project_name}.json"

        if not rec_file.exists():
            raise FileNotFoundError(f"Recommendations file not found: {rec_file}")

        with open(rec_file, 'r') as f:
            data = json.load(f)

        recommendations = []
        for rec_data in data.get('recommendations', []):
            recommendations.append(Recommendation(
                id=rec_data['id'],
                priority=rec_data['priority'],
                phase=rec_data['phase'],
                title=rec_data['title'],
                description=rec_data['description'],
                implementation=rec_data['implementation'],
                expected_impact=rec_data['expected_impact']
            ))

        return recommendations

    def select_next_recommendation(self, recommendations: List[Recommendation],
                                 tested_ids: List[str]) -> Optional[Recommendation]:
        """Select next recommendation to test based on priority"""
        priority_order = ["HIGH", "MEDIUM", "LOW"]

        for priority in priority_order:
            for rec in recommendations:
                if rec.priority == priority and rec.id not in tested_ids:
                    return rec

        return None

    def apply_mutation(self, recommendation: Recommendation, iteration: int):
        """Apply a mutation to the prompts"""
        # Load current prompt
        if iteration == 0:
            source_file = self.config.prompts_dir / f"{recommendation.phase}.md"
        else:
            source_file = self.config.results_dir / f"{recommendation.phase}_iter{iteration-1}.md"

        if not source_file.exists():
            raise FileNotFoundError(f"Source prompt not found: {source_file}")

        with open(source_file, 'r') as f:
            current_prompt = f.read()

        # Apply the mutation (this is simplified - in practice, you'd have more sophisticated mutation logic)
        mutated_prompt = self._apply_recommendation_to_prompt(current_prompt, recommendation)

        # Save mutated prompt
        target_file = self.config.results_dir / f"{recommendation.phase}_iter{iteration}.md"
        with open(target_file, 'w') as f:
            f.write(mutated_prompt)

        print(f"Applied mutation {recommendation.id} to {recommendation.phase}")
        return target_file

    def _apply_recommendation_to_prompt(self, prompt: str, recommendation: Recommendation) -> str:
        """Apply a specific recommendation to a prompt"""
        # This is a simplified implementation
        # In practice, you'd have more sophisticated logic based on the recommendation type

        implementation = recommendation.implementation

        # Example mutations based on our successful patterns
        if "word count enforcement" in implementation.lower():
            # Replace word count guidance
            prompt = prompt.replace(
                "Maximum 1 page (500-700 words)",
                "**minimum of 500 words** to ensure sufficient detail. If you're under 500 words, you're likely missing important context"
            )

        elif "strategic framing" in implementation.lower():
            # Add strategic framing guidelines
            if "## Guidelines" in prompt:
                strategic_guidance = """
2. **Lead with Business Impact**: Frame the problem as a business crisis, not just a technical issue. What's the cost of inaction? What revenue/customers/trust are we losing?

3. **Strategic Positioning**: Position the solution as a strategic initiative, not just a feature. How does this create competitive advantage, unlock growth, or mitigate risk?
"""
                prompt = prompt.replace("## Guidelines", f"## Guidelines{strategic_guidance}")

        elif "concrete examples" in implementation.lower():
            # Add examples section
            examples_section = """
## Examples of Strong vs. Weak Framing

### Problem Statement
**Weak** (technical focus, vague impact):
> "Our system has usability issues. Users are having trouble and metrics are declining."

**Strong** (business impact, specific metrics, urgency):
> "Our system is driving a business crisis with declining metrics and increasing support costs. This broken experience is costing us customer satisfaction, operational efficiency, and ultimately revenue."
"""
            # Insert before Interactive Refinement section
            if "## Interactive Refinement" in prompt:
                prompt = prompt.replace("## Interactive Refinement", f"{examples_section}\n## Interactive Refinement")

        elif "combine don't compress" in implementation.lower():
            # Update synthesis guidance
            prompt = prompt.replace(
                "Maintain Conciseness",
                "Combine, Don't Compress: Aim for 550-700 words by including the best details from both versions"
            )

        return prompt

    def evaluate_mutation(self, baseline_score: float, new_score: float,
                         threshold: float = 0.0) -> Dict[str, Any]:
        """Evaluate whether to keep or discard a mutation"""
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

    def should_stop_iteration(self, iterations: List[MutationResult],
                            target_score: float, stretch_score: float) -> Tuple[bool, str]:
        """Determine if iteration should stop"""
        if not iterations:
            return False, "No iterations yet"

        current_score = iterations[-1].new_score

        # Check stretch goal achievement
        if current_score >= stretch_score:
            return True, f"Stretch goal achieved ({current_score:.2f} ≥ {stretch_score})"

        # Check target achievement with sufficient iterations
        if current_score >= target_score and len(iterations) >= 5:
            return True, f"Target achieved ({current_score:.2f} ≥ {target_score}) with sufficient iterations"

        # Check max iterations
        if len(iterations) >= self.config.evolution.max_iterations:
            return True, f"Max iterations reached ({self.config.evolution.max_iterations})"

        # Check diminishing returns
        if len(iterations) >= self.config.evolution.diminishing_returns_window:
            recent_improvements = []
            for i in range(-self.config.evolution.diminishing_returns_window, 0):
                if iterations[i].decision == "KEEP":
                    recent_improvements.append(iterations[i].delta)
                else:
                    recent_improvements.append(0.0)

            if all(imp < self.config.evolution.diminishing_returns_threshold for imp in recent_improvements):
                return True, "Diminishing returns (recent iterations <0.05 improvement)"

        return False, "Continue iterating"

    async def run_evolutionary_tuning(self) -> EvolutionarySession:
        """Run complete evolutionary tuning session"""
        start_time = datetime.now().isoformat()
        print(f"Starting evolutionary tuning for {self.config.project_name}")

        # Load recommendations
        recommendations = self.load_recommendations()
        print(f"Loaded {len(recommendations)} recommendations")

        # Run baseline simulation (iteration 0)
        print("Running baseline simulation...")
        baseline_results = await self.simulator.run_simulation(0)
        baseline_report = self.evaluator.evaluate_simulation_results(baseline_results, 0)
        baseline_score = baseline_report.summary_stats['overall']['average_score']

        print(f"Baseline score: {baseline_score:.2f}")

        # Initialize session tracking
        iterations = []
        tested_ids = []
        current_score = baseline_score

        # Evolutionary loop
        iteration = 1
        while iteration <= self.config.evolution.max_iterations:
            # Select next recommendation
            next_rec = self.select_next_recommendation(recommendations, tested_ids)
            if not next_rec:
                stopping_reason = "All recommendations tested"
                break

            print(f"\nIteration {iteration}: Testing {next_rec.title}")

            # Apply mutation
            self.apply_mutation(next_rec, iteration)

            # Run simulation with mutation
            mutation_results = await self.simulator.run_simulation(iteration)
            mutation_report = self.evaluator.evaluate_simulation_results(mutation_results, iteration)
            new_score = mutation_report.summary_stats['overall']['average_score']

            # Evaluate mutation
            evaluation = self.evaluate_mutation(current_score, new_score)

            # Record iteration
            mutation_result = MutationResult(
                iteration=iteration,
                recommendation_id=next_rec.id,
                recommendation_title=next_rec.title,
                baseline_score=current_score,
                new_score=new_score,
                delta=evaluation["delta"],
                decision=evaluation["decision"],
                rationale=evaluation["rationale"],
                timestamp=datetime.now().isoformat()
            )

            iterations.append(mutation_result)
            tested_ids.append(next_rec.id)

            print(f"  Result: {evaluation['decision']} ({evaluation['rationale']})")

            # Update current score if keeping mutation
            if evaluation["decision"] == "KEEP":
                current_score = new_score

            # Check stopping criteria
            should_stop, stopping_reason = self.should_stop_iteration(
                iterations,
                self.config.scoring.target_score,
                self.config.scoring.stretch_score
            )

            if should_stop:
                print(f"Stopping: {stopping_reason}")
                break

            iteration += 1

        # Calculate final statistics
        successful_mutations = sum(1 for it in iterations if it.decision == "KEEP")
        success_rate = successful_mutations / len(iterations) if iterations else 0.0
        total_improvement = current_score - baseline_score

        # Create session summary
        session = EvolutionarySession(
            project=self.config.project_name,
            start_time=start_time,
            end_time=datetime.now().isoformat(),
            baseline_score=baseline_score,
            final_score=current_score,
            total_improvement=total_improvement,
            iterations=iterations,
            recommendations_tested=tested_ids,
            success_rate=success_rate,
            stopping_reason=stopping_reason
        )

        # Save session
        self.save_session(session)

        print(f"\nEvolutionary tuning complete!")
        print(f"Final score: {current_score:.2f} (improvement: +{total_improvement:.2f})")
        print(f"Success rate: {success_rate:.1%} ({successful_mutations}/{len(iterations)})")

        return session

    def save_session(self, session: EvolutionarySession):
        """Save evolutionary session to file"""
        self.config.results_dir.mkdir(exist_ok=True)

        with open(self.session_file, 'w') as f:
            json.dump(asdict(session), f, indent=2)

        # Also generate markdown report
        markdown_file = self.config.results_dir / "evolutionary_report.md"
        markdown_content = self._generate_session_report(session)

        with open(markdown_file, 'w') as f:
            f.write(markdown_content)

        print(f"Session saved to: {self.session_file}")
        print(f"Report saved to: {markdown_file}")

    def _generate_session_report(self, session: EvolutionarySession) -> str:
        """Generate markdown report for evolutionary session"""
        md = f"""# Evolutionary Tuning Report: {session.project}

**Start Time**: {session.start_time[:19]}
**End Time**: {session.end_time[:19] if session.end_time else 'In Progress'}
**Duration**: {self._calculate_duration(session.start_time, session.end_time)}

## Summary

- **Baseline Score**: {session.baseline_score:.2f}/5.0
- **Final Score**: {session.final_score:.2f}/5.0
- **Total Improvement**: +{session.total_improvement:.2f} ({session.total_improvement/session.baseline_score*100:.1f}%)
- **Iterations**: {len(session.iterations)}
- **Success Rate**: {session.success_rate:.1%}
- **Stopping Reason**: {session.stopping_reason}

## Iteration Details

| Iter | Recommendation | Baseline | New | Delta | Decision | Rationale |
|------|----------------|----------|-----|-------|----------|-----------|
"""

        for iteration in session.iterations:
            md += f"| {iteration.iteration} | {iteration.recommendation_title[:30]}... | "
            md += f"{iteration.baseline_score:.2f} | {iteration.new_score:.2f} | "
            md += f"{iteration.delta:+.2f} | {iteration.decision} | {iteration.rationale[:50]}... |\n"

        md += f"""
## Recommendations Tested

Total: {len(session.recommendations_tested)}

"""

        for i, rec_id in enumerate(session.recommendations_tested, 1):
            iteration = next((it for it in session.iterations if it.recommendation_id == rec_id), None)
            if iteration:
                status = "✅ KEPT" if iteration.decision == "KEEP" else "❌ DISCARDED"
                md += f"{i}. **{iteration.recommendation_title}** - {status} ({iteration.delta:+.2f})\n"

        md += f"""
## Performance Analysis

### Score Progression
"""

        current_score = session.baseline_score
        md += f"- **Baseline**: {current_score:.2f}\n"

        for iteration in session.iterations:
            if iteration.decision == "KEEP":
                current_score = iteration.new_score
                md += f"- **After Iteration {iteration.iteration}**: {current_score:.2f} (+{iteration.delta:.2f})\n"

        return md

    def _calculate_duration(self, start_time: str, end_time: Optional[str]) -> str:
        """Calculate duration between start and end times"""
        if not end_time:
            return "In Progress"

        try:
            from datetime import datetime
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            duration = end - start

            hours = duration.seconds // 3600
            minutes = (duration.seconds % 3600) // 60

            if hours > 0:
                return f"{hours}h {minutes}m"
            else:
                return f"{minutes}m"
        except:
            return "Unknown"


async def main():
    """CLI entry point for evolutionary tuning"""
    import sys
    from prompt_tuning_config import load_project_config

    if len(sys.argv) < 2:
        print("Usage: python evolutionary_tuner.py <project_name>")
        sys.exit(1)

    project_name = sys.argv[1]
    config = load_project_config(project_name)
    tuner = EvolutionaryTuner(config)

    session = await tuner.run_evolutionary_tuning()
    print(f"Evolutionary tuning complete. Final improvement: +{session.total_improvement:.2f}")


if __name__ == "__main__":
    asyncio.run(main())
