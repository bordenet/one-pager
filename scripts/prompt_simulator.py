"""
Prompt Simulation Engine for AI Agent Prompt Tuning
Executes LLM prompts with test cases and captures outputs
"""

import asyncio
import json
import time
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

from llm_client import LLMResponse, create_llm_client
from prompt_tuning_config import ProjectConfig


@dataclass
class TestCase:
    """Test case for prompt simulation"""

    id: str
    name: str
    description: str
    industry: str
    project_type: str
    scope: str
    stakeholder_complexity: str
    inputs: Dict[str, str]


@dataclass
class PhaseOutput:
    """Output from a single phase"""

    phase: str
    content: str
    word_count: int
    execution_time_ms: int
    tokens_used: Optional[int] = None
    model: Optional[str] = None
    provider: Optional[str] = None


@dataclass
class SimulationResult:
    """Result from simulating one test case"""

    test_case_id: str
    test_case_name: str
    phase_outputs: Dict[str, PhaseOutput]
    total_execution_time_ms: int
    timestamp: str


class PromptSimulator:
    """Main simulation engine"""

    def __init__(self, config: ProjectConfig):
        self.config = config
        self.clients: Dict[str, Any] = {}
        self._load_clients()

    def _load_clients(self):
        """Initialize LLM clients for each phase"""
        for phase_name, phase_config in self.config.phase_configs.items():
            self.clients[phase_name] = create_llm_client(phase_config)

    def load_test_cases(self) -> List[TestCase]:
        """Load test cases from JSON file"""
        if not self.config.test_cases_file.exists():
            raise FileNotFoundError(f"Test cases file not found: {self.config.test_cases_file}")

        with open(self.config.test_cases_file, "r") as f:
            data = json.load(f)

        test_cases = []
        for case_data in data.get("test_cases", []):
            test_cases.append(
                TestCase(
                    id=case_data["id"],
                    name=case_data["name"],
                    description=case_data["description"],
                    industry=case_data["industry"],
                    project_type=case_data["project_type"],
                    scope=case_data["scope"],
                    stakeholder_complexity=case_data["stakeholder_complexity"],
                    inputs=case_data["inputs"],
                )
            )

        return test_cases

    def load_prompt(self, phase: str, iteration: int = 0) -> str:
        """Load prompt for specific phase and iteration"""
        if iteration == 0:
            prompt_file = self.config.prompts_dir / f"{phase}.md"
        else:
            prompt_file = self.config.results_dir / f"{phase}_iter{iteration}.md"

        if not prompt_file.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_file}")

        with open(prompt_file, "r") as f:
            return f.read()

    def substitute_variables(self, prompt: str, inputs: Dict[str, str]) -> str:
        """Substitute variables in prompt template"""
        result = prompt
        for key, value in inputs.items():
            placeholder = "{" + key + "}"
            result = result.replace(placeholder, value)
        return result

    async def simulate_phase(
        self, phase: str, prompt: str, test_case: TestCase, previous_outputs: Optional[Dict[str, PhaseOutput]] = None
    ) -> PhaseOutput:
        """Simulate a single phase for one test case"""

        # Substitute variables in prompt
        final_prompt = self.substitute_variables(prompt, test_case.inputs)

        # For phase 3, include previous outputs
        if phase == "phase3" and previous_outputs:
            phase1_result = previous_outputs.get("phase1")
            phase2_result = previous_outputs.get("phase2")
            phase1_output = phase1_result.content if phase1_result else ""
            phase2_output = phase2_result.content if phase2_result else ""

            final_prompt = final_prompt.replace("{phase1Output}", phase1_output)
            final_prompt = final_prompt.replace("{phase2Output}", phase2_output)

        # Execute LLM call
        client = self.clients[phase]
        response: LLMResponse = await client.generate(final_prompt)

        # Count words (simple whitespace split)
        word_count = len(response.content.split())

        return PhaseOutput(
            phase=phase,
            content=response.content,
            word_count=word_count,
            execution_time_ms=response.execution_time_ms or 0,
            tokens_used=response.tokens_used,
            model=response.model,
            provider=response.provider,
        )

    async def simulate_test_case(self, test_case: TestCase, iteration: int = 0) -> SimulationResult:
        """Simulate all phases for one test case"""
        start_time = time.time()
        phase_outputs = {}

        # Phase 1: Initial draft
        if "phase1" in self.config.phase_configs:
            prompt1 = self.load_prompt("phase1", iteration)
            phase_outputs["phase1"] = await self.simulate_phase("phase1", prompt1, test_case)

        # Phase 2: Adversarial review
        if "phase2" in self.config.phase_configs:
            prompt2 = self.load_prompt("phase2", iteration)
            # Phase 2 gets Phase 1 output as context
            if "phase1" in phase_outputs:
                phase1_content = phase_outputs["phase1"].content
                prompt2 = prompt2.replace("{phase1Output}", phase1_content)
            phase_outputs["phase2"] = await self.simulate_phase("phase2", prompt2, test_case)

        # Phase 3: Synthesis
        if "phase3" in self.config.phase_configs:
            prompt3 = self.load_prompt("phase3", iteration)
            phase_outputs["phase3"] = await self.simulate_phase("phase3", prompt3, test_case, phase_outputs)

        total_time = int((time.time() - start_time) * 1000)

        return SimulationResult(
            test_case_id=test_case.id,
            test_case_name=test_case.name,
            phase_outputs=phase_outputs,
            total_execution_time_ms=total_time,
            timestamp=datetime.now().isoformat(),
        )

    async def run_simulation(self, iteration: int = 0) -> List[SimulationResult]:
        """Run simulation for all test cases"""
        test_cases = self.load_test_cases()
        results = []

        print(f"Running simulation for {len(test_cases)} test cases...")

        for i, test_case in enumerate(test_cases, 1):
            print(f"  [{i}/{len(test_cases)}] {test_case.name}")
            result = await self.simulate_test_case(test_case, iteration)
            results.append(result)

        return results

    def save_results(self, results: List[SimulationResult], iteration: int = 0):
        """Save simulation results to JSON file"""
        self.config.results_dir.mkdir(exist_ok=True)

        if iteration == 0:
            filename = f"simulation_results_{self.config.project_name}_original.json"
        else:
            filename = f"simulation_results_{self.config.project_name}_iter{iteration}.json"

        output_file = self.config.results_dir / filename

        # Convert to serializable format
        output_data = {
            "project": self.config.project_name,
            "iteration": iteration,
            "timestamp": datetime.now().isoformat(),
            "description": f"Simulation results for iteration {iteration}",
            "results": [asdict(result) for result in results],
        }

        with open(output_file, "w") as f:
            json.dump(output_data, f, indent=2)

        print(f"Results saved to: {output_file}")
        return output_file


async def main():
    """CLI entry point for testing"""
    import sys

    from prompt_tuning_config import load_project_config

    if len(sys.argv) < 2:
        print("Usage: python prompt_simulator.py <project_name> [iteration]")
        sys.exit(1)

    project_name = sys.argv[1]
    iteration = int(sys.argv[2]) if len(sys.argv) > 2 else 0

    config = load_project_config(project_name)
    simulator = PromptSimulator(config)

    results = await simulator.run_simulation(iteration)
    simulator.save_results(results, iteration)


if __name__ == "__main__":
    asyncio.run(main())
