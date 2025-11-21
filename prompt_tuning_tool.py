#!/usr/bin/env python3
"""
AI Agent Prompt Tuning Tool - Main Entry Point

This tool implements the evolutionary prompt tuning methodology developed
for the one-pager project. It provides automated LLM prompt optimization
with mutation-based keep/discard logic.

Usage:
    python prompt_tuning_tool.py init <project_name>
    python prompt_tuning_tool.py simulate <project_name>
    python prompt_tuning_tool.py evolve <project_name>
    python prompt_tuning_tool.py status <project_name>

Example:
    # Initialize new project
    python prompt_tuning_tool.py init product-requirements-assistant

    # Run evolutionary tuning
    python prompt_tuning_tool.py evolve product-requirements-assistant
"""

import sys
import os
from pathlib import Path

# Add scripts directory to Python path
scripts_dir = Path(__file__).parent / "scripts"
sys.path.insert(0, str(scripts_dir))

# Import and run CLI
from prompt_tuning_cli import cli

if __name__ == '__main__':
    # Load environment variables from .env file if it exists
    env_file = Path('.env')
    if env_file.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except ImportError:
            # dotenv is optional - continue without it
            pass

    cli()
