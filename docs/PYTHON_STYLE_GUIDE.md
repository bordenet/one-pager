# Python Style Guide for bordenet/* Projects

This document defines the Python coding standards for tools development projects
in the bordenet organization. Standards are derived from PEP 8, PEP 257, and the
Google Python Style Guide, with automated enforcement via Black, isort, pylint, and mypy.

## References

- [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/) - Primary baseline
- [PEP 257 – Docstring Conventions](https://peps.python.org/pep-0257/) - Documentation standards
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) - Stricter conventions
- [Black Code Formatter](https://black.readthedocs.io/) - Opinionated formatting
- [Ruff](https://docs.astral.sh/ruff/) - Fast Python linter (optional, replacing flake8)

## Automated Tooling

All code must pass these tools before commit:

```bash
# Formatting (automatic)
black --line-length=120 src/
isort --profile black --line-length 120 src/

# Linting (must pass with score >= 9.5)
pylint src/ --max-line-length=120 --min-similarity-lines=10 --fail-under=9.5

# Type checking (must pass)
mypy src/ --ignore-missing-imports

# Docstring checking (must pass)
pydocstyle src/ --convention=pep257

# Tests (must pass with >= 50% coverage)
pytest tests/ --cov=src --cov-fail-under=50
```

### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    hooks:
      - id: black
        args: ['--line-length=120']
  - repo: https://github.com/pycqa/isort
    hooks:
      - id: isort
        args: ['--profile', 'black', '--line-length', '120']
```

## Project Structure

```text
src/
  package_name/
    __init__.py          # Package exports, version
    __main__.py          # CLI entry point
    models.py            # Data classes and types
    cli/                 # CLI commands (click/argparse)
    analyzers/           # Analysis logic
    exporters/           # Output formatters
tests/
  __init__.py
  test_*.py              # Test modules
  conftest.py            # Shared fixtures
docs/
  *.md                   # Documentation
```

## Naming Conventions

### Modules and Packages

- **snake_case**: `code_analyzer.py`, `security_rules.py`
- Avoid: `codeAnalyzer.py`, `CodeAnalyzer.py`

### Classes

- **PascalCase**: `CodeAnalyzer`, `SecurityRule`, `ValidationResult`
- Suffix base classes with `Base`: `AnalyzerBase`
- Suffix abstract classes with `ABC`: `ExporterABC`

### Functions and Methods

- **snake_case**: `analyze_code()`, `get_findings()`, `_private_helper()`
- Use verbs: `calculate_`, `generate_`, `validate_`, `parse_`
- Boolean methods: `is_valid()`, `has_errors()`, `can_process()`

### Variables

- **snake_case**: `file_path`, `error_count`, `is_valid`
- **UPPER_SNAKE_CASE** for constants: `MAX_LINE_LENGTH`, `DEFAULT_TIMEOUT`
- Prefix private with underscore: `_internal_state`

### Type Variables

- **PascalCase** with descriptive suffix: `T`, `ItemT`, `ReturnT`

## Function and Method Guidelines

### Length

- Target: **≤50 lines** per function
- Maximum: **100 lines** (refactor if approaching)
- Single responsibility principle

### Parameters

- **≤5 parameters** - use dataclass/dict if more needed
- Use keyword arguments for optional parameters
- Type all parameters and return values

```python
# Good
def analyze_file(
    file_path: Path,
    *,
    include_metrics: bool = True,
    max_depth: int = 10,
) -> AnalysisResult:
    """Analyze a single file."""
    ...

# Bad - too many positional parameters
def analyze_file(path, metrics, depth, lang, encoding, timeout):
    ...
```

### Return Values

- Always type return values
- Prefer returning objects over tuples for complex returns
- Use `Optional[T]` for nullable returns

## Documentation (PEP 257)

### Module Docstrings

```python
"""Analyze code quality and detect issues.

This module provides functionality for static code analysis including:
- Syntax validation
- Style checking
- Security scanning
"""
```

### Function Docstrings

```python
def analyze_file(file_path: Path, *, include_metrics: bool = True) -> AnalysisResult:
    """Analyze a single file for code quality issues.

    Args:
        file_path: Path to the file to analyze.
        include_metrics: Whether to include code metrics. Defaults to True.

    Returns:
        AnalysisResult containing findings and metrics.

    Raises:
        FileNotFoundError: If file_path does not exist.
        ValueError: If file_path is not a valid Python file.
    """
```

### Class Docstrings

```python
class CodeAnalyzer:
    """Analyze Python source code for quality issues.

    This analyzer supports multiple rule sets and can be configured
    to check specific categories of issues.

    Attributes:
        rules: List of rules to apply during analysis.
        findings: Results from the most recent analysis.
    """
```

## Type Annotations

### Always Type

- All function parameters
- All return values (including `-> None`)
- Class attributes
- Module-level variables

```python
# Good
def calculate_score(findings: list[Finding], weight: float = 1.0) -> float:
    """Calculate weighted score from findings."""
    return sum(f.severity * weight for f in findings)
```

### Common Type Patterns

```python
from typing import Optional, Union, Callable, TypeVar

# Optional for nullable
def find_file(name: str) -> Optional[Path]:
    ...

# Callable for function parameters
def apply(transform: Callable[[str], str], data: str) -> str:
    ...

# TypeVar for generics
T = TypeVar("T")
def first(items: list[T]) -> Optional[T]:
    return items[0] if items else None
```

## Error Handling

### Exception Hierarchy

```python
# Define custom exceptions in a module
class ProjectError(Exception):
    """Base exception for project."""

class ValidationError(ProjectError):
    """Raised when validation fails."""

class ConfigurationError(ProjectError):
    """Raised when configuration is invalid."""
```

### Error Messages

```python
# Good - descriptive with context
raise ValueError(f"Invalid file path: {path!r} (must be absolute)")

# Bad - vague
raise ValueError("invalid path")
```

## Testing

### Coverage

- Target: **≥50%** overall (enforced in CI)
- Critical modules: **≥80%** coverage
- Use `# pragma: no cover` sparingly and with justification

## File Organization

### File Length

- Target: **≤400 lines** per file
- Maximum: **600 lines** (refactor if approaching)

### Import Order (isort)

1. Standard library
2. Third-party packages
3. Local application imports

```python
import os
from pathlib import Path

import click
import yaml

from my_package.models import Finding
```

## Linting Rules Summary

### pylint

- Required score: **≥9.5/10**
- Key rules: `missing-docstring`, `too-many-arguments`, `unused-import`

### mypy

- Strict mode recommended for new projects
- Minimum: `--ignore-missing-imports`

### Black

- Line length: **120** (configured in pre-commit)
- No configuration needed - use defaults

### isort

- Profile: **black** (compatible formatting)
- Line length: **120**
