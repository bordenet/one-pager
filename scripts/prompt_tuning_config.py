"""
Configuration for AI Agent Prompt Tuning Tool
"""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class LLMConfig:
    """Configuration for LLM API clients"""

    provider: str  # "anthropic", "google", "openai"
    model: str
    api_key_env: str
    max_tokens: int = 4000
    temperature: float = 0.7
    timeout: int = 60


@dataclass
class ScoringConfig:
    """Configuration for quality scoring"""

    criteria: List[str]
    scale_min: int = 1
    scale_max: int = 5
    target_score: float = 4.0
    stretch_score: float = 4.5


@dataclass
class EvolutionConfig:
    """Configuration for evolutionary tuning"""

    max_iterations: int = 20
    improvement_threshold: float = 0.0  # Any improvement
    diminishing_returns_threshold: float = 0.05
    diminishing_returns_window: int = 3
    mutation_success_rate_target: float = 0.5


@dataclass
class ProjectConfig:
    """Main project configuration"""

    project_name: str
    prompts_dir: Path
    results_dir: Path
    test_cases_file: Path

    # LLM configurations for each phase
    phase_configs: Dict[str, LLMConfig]

    # Scoring configuration
    scoring: ScoringConfig

    # Evolution configuration
    evolution: EvolutionConfig

    # Output settings
    word_count_target: tuple = (500, 700)
    save_intermediate: bool = True
    verbose: bool = False

    # Attribution settings
    attribution_url: str = "{GENESIS_TOOL_URL}"
    add_attribution: bool = True


# Default configurations
DEFAULT_PHASE_CONFIGS = {
    "phase1": LLMConfig(
        provider="anthropic",
        model="claude-3-5-sonnet-20241022",
        api_key_env="ANTHROPIC_API_KEY",
        max_tokens=4000,
        temperature=0.7,
    ),
    "phase2": LLMConfig(
        provider="google",
        model="gemini-1.5-pro",
        api_key_env="GOOGLE_API_KEY",
        max_tokens=4000,
        temperature=0.8,  # Slightly higher for adversarial creativity
    ),
    "phase3": LLMConfig(
        provider="anthropic",
        model="claude-3-5-sonnet-20241022",
        api_key_env="ANTHROPIC_API_KEY",
        max_tokens=4000,
        temperature=0.6,  # Slightly lower for synthesis consistency
    ),
}

DEFAULT_SCORING = ScoringConfig(
    criteria=["clarity", "conciseness", "impact", "feasibility", "completeness"],
    scale_min=1,
    scale_max=5,
    target_score=4.0,
    stretch_score=4.5,
)

DEFAULT_EVOLUTION = EvolutionConfig(
    max_iterations=20,
    improvement_threshold=0.0,
    diminishing_returns_threshold=0.05,
    diminishing_returns_window=3,
    mutation_success_rate_target=0.5,
)


def load_project_config(project_name: str, base_dir: Optional[Path] = None) -> ProjectConfig:
    """Load configuration for a specific project"""
    if base_dir is None:
        base_dir = Path.cwd()

    prompts_dir = base_dir / "prompts"
    results_dir = base_dir / f"prompt_tuning_results_{project_name}"
    test_cases_file = results_dir / f"test_cases_{project_name}.json"

    # Get attribution URL from environment or use default
    attribution_url = os.getenv("GENESIS_TOOL_URL", "{GENESIS_TOOL_URL}")

    return ProjectConfig(
        project_name=project_name,
        prompts_dir=prompts_dir,
        results_dir=results_dir,
        test_cases_file=test_cases_file,
        phase_configs=DEFAULT_PHASE_CONFIGS,
        scoring=DEFAULT_SCORING,
        evolution=DEFAULT_EVOLUTION,
        attribution_url=attribution_url,
    )


def validate_api_keys(config: ProjectConfig) -> List[str]:
    """Validate that required API keys are available"""
    missing_keys = []

    for phase_name, phase_config in config.phase_configs.items():
        api_key = os.getenv(phase_config.api_key_env)
        if not api_key:
            missing_keys.append(f"{phase_name}: {phase_config.api_key_env}")

    return missing_keys


def get_env_file_template() -> str:
    """Get template for .env file"""
    return """# AI Agent Prompt Tuning Tool - API Keys
# Copy this to .env and fill in your actual API keys

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google (Gemini)
GOOGLE_API_KEY=your_google_api_key_here

# OpenAI (GPT) - Optional
OPENAI_API_KEY=your_openai_api_key_here

# Configuration
PROMPT_TUNING_VERBOSE=false
PROMPT_TUNING_SAVE_INTERMEDIATE=true

# Attribution (will be replaced during Genesis bootstrapping)
GENESIS_TOOL_URL=https://github.com/bordenet/genesis/tree/main/prompt-tuning-tool
"""
