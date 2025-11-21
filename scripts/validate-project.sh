#!/usr/bin/env bash
# One-Pager - Project Validation Script
# Validates project structure, dependencies, and configuration

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Parse command line arguments
FIX_ISSUES=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_ISSUES=true
            shift
            ;;
        -v|--verbose)
            export VERBOSE=1
            shift
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Validate One-Pager project structure and configuration

OPTIONS:
  --fix            Attempt to fix issues automatically
  -v, --verbose    Show detailed output
  -h, --help       Show this help message

VALIDATIONS:
  - Project structure (required files and directories)
  - Package.json configuration
  - Dependencies and versions
  - Git configuration
  - Security settings

EXAMPLES:
  $(basename "$0")              # Validate project
  $(basename "$0") --fix        # Validate and fix issues
  $(basename "$0") -v           # Verbose validation

EOF
            exit 0
            ;;
        *)
            echo "Error: Unknown option: $1"
            echo "Run '$(basename "$0") --help' for usage information"
            exit 1
            ;;
    esac
done

# Navigate to project root
cd "$SCRIPT_DIR/.."
PROJECT_ROOT=$(pwd)

print_header "One-Pager - Project Validation"

ISSUES_FOUND=0

# Step 1: Validate project structure
task_start "Validating project structure"

REQUIRED_FILES=(
    "package.json"
    "index.html"
    "README.md"
    ".gitignore"
    "jest.config.js"
)

REQUIRED_DIRS=(
    "js"
    "css"
    "tests"
    "prompts"
    "templates"
    "scripts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${C_RED}✗ Missing required file: $file${C_RESET}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))

        if [[ $FIX_ISSUES == true ]]; then
            case $file in
                ".gitignore")
                    echo "node_modules/" > .gitignore
                    echo "coverage/" >> .gitignore
                    echo ".env" >> .gitignore
                    echo ".setup-cache/" >> .gitignore
                    verbose "Created basic .gitignore"
                    ;;
            esac
        fi
    else
        verbose "✓ Found: $file"
    fi
done

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ ! -d "$dir" ]]; then
        echo -e "${C_RED}✗ Missing required directory: $dir${C_RESET}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))

        if [[ $FIX_ISSUES == true ]]; then
            mkdir -p "$dir"
            verbose "Created directory: $dir"
        fi
    else
        verbose "✓ Found: $dir/"
    fi
done

task_ok "Project structure validated"

# Step 2: Validate package.json
task_start "Validating package.json"

if [[ -f "package.json" ]]; then
    # Check required fields
    REQUIRED_FIELDS=("name" "version" "description" "scripts")

    for field in "${REQUIRED_FIELDS[@]}"; do
        if ! grep -q "\"$field\":" package.json; then
            echo -e "${C_RED}✗ Missing package.json field: $field${C_RESET}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        else
            verbose "✓ Found package.json field: $field"
        fi
    done

    # Check required scripts
    REQUIRED_SCRIPTS=("test" "lint")

    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if ! grep -q "\"$script\":" package.json; then
            echo -e "${C_RED}✗ Missing package.json script: $script${C_RESET}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        else
            verbose "✓ Found package.json script: $script"
        fi
    done

    task_ok "Package.json validated"
else
    task_fail "Package.json not found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Step 3: Validate dependencies
task_start "Validating dependencies"

if [[ -f "package.json" ]] && [[ -d "node_modules" ]]; then
    # Check if package-lock.json exists
    if [[ ! -f "package-lock.json" ]]; then
        echo -e "${C_YELLOW}⚠ No package-lock.json found${C_RESET}"
        verbose "Consider running 'npm install' to generate lock file"
    fi

    # Check for security vulnerabilities
    if command -v npm &>/dev/null; then
        if npm audit --audit-level=high &>/dev/null; then
            verbose "✓ No high-severity vulnerabilities found"
        else
            echo -e "${C_YELLOW}⚠ Security vulnerabilities detected${C_RESET}"
            verbose "Run 'npm audit' for details"
        fi
    fi

    task_ok "Dependencies validated"
else
    task_warn "Dependencies not installed - run npm install"
fi

# Step 4: Validate Git configuration
task_start "Validating Git configuration"

if [[ -d ".git" ]]; then
    # Check for .gitignore
    if [[ -f ".gitignore" ]]; then
        GITIGNORE_PATTERNS=("node_modules/" "coverage/" ".env")

        for pattern in "${GITIGNORE_PATTERNS[@]}"; do
            if ! grep -q "^$pattern" .gitignore; then
                echo -e "${C_YELLOW}⚠ Missing .gitignore pattern: $pattern${C_RESET}"

                if [[ $FIX_ISSUES == true ]]; then
                    echo "$pattern" >> .gitignore
                    verbose "Added to .gitignore: $pattern"
                fi
            else
                verbose "✓ Found .gitignore pattern: $pattern"
            fi
        done
    fi

    # Check for git hooks
    if [[ -f ".git/hooks/pre-commit" ]]; then
        verbose "✓ Pre-commit hook installed"
    else
        verbose "○ Pre-commit hook not installed (optional)"
    fi

    task_ok "Git configuration validated"
else
    task_warn "Not a git repository"
fi

# Step 5: Run security check
if [[ -f "scripts/check-secrets.sh" ]]; then
    task_start "Running security validation"

    if ./scripts/check-secrets.sh &>/dev/null; then
        task_ok "Security validation passed"
    else
        task_warn "Security issues detected"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    task_skip "Security validation (script not found)"
fi

# Summary
echo ""
if [[ $ISSUES_FOUND -eq 0 ]]; then
    print_header "✓ Project validation passed!"
    echo ""
    echo "All checks completed successfully."
else
    print_header "⚠ Project validation completed with $ISSUES_FOUND issues"
    echo ""
    if [[ $FIX_ISSUES == false ]]; then
        echo "Run with --fix to attempt automatic fixes."
    fi
    echo ""
    exit 1
fi
