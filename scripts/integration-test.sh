#!/usr/bin/env bash
# One-Pager - Integration Test Script
# Runs comprehensive integration tests

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Parse command line arguments
HEADLESS=false
VERBOSE_TESTS=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --headless)
            HEADLESS=true
            shift
            ;;
        -v|--verbose)
            VERBOSE_TESTS=true
            export VERBOSE=1
            shift
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Integration test runner for One-Pager

OPTIONS:
  --headless       Run tests in headless mode (no browser UI)
  -v, --verbose    Show detailed test output
  -h, --help       Show this help message

EXAMPLES:
  $(basename "$0")              # Run all integration tests
  $(basename "$0") --headless   # Run tests without browser UI
  $(basename "$0") -v           # Verbose test output

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

print_header "One-Pager - Integration Tests"

# Step 1: Verify dependencies
task_start "Checking dependencies"

if ! command -v node &>/dev/null; then
    task_fail "Node.js not found"
    exit 1
fi

if [[ ! -d "node_modules" ]]; then
    task_fail "Dependencies not installed - run npm install"
    exit 1
fi

task_ok "Dependencies verified"

# Step 2: Unit tests first
task_start "Running unit tests"

if [[ $VERBOSE_TESTS == true ]]; then
    npm test
else
    npm test --silent
fi

if [[ $? -ne 0 ]]; then
    task_fail "Unit tests failed"
    exit 1
fi

task_ok "Unit tests passed"

# Step 3: Linting
task_start "Running linter"

if [[ $VERBOSE_TESTS == true ]]; then
    npm run lint
else
    npm run lint --silent
fi

if [[ $? -ne 0 ]]; then
    task_fail "Linting failed"
    exit 1
fi

task_ok "Linting passed"

# Step 4: E2E tests (if available)
if [[ -f "playwright.config.js" ]] || [[ -f "playwright.config.ts" ]]; then
    task_start "Running E2E tests"

    if [[ $HEADLESS == true ]]; then
        export HEADLESS=true
    fi

    if [[ $VERBOSE_TESTS == true ]]; then
        npm run test:e2e
    else
        npm run test:e2e --silent
    fi

    if [[ $? -ne 0 ]]; then
        task_fail "E2E tests failed"
        exit 1
    fi

    task_ok "E2E tests passed"
else
    task_skip "E2E tests (not configured)"
fi

# Step 5: Application smoke test
task_start "Running application smoke test"

# Check if index.html exists and has required elements
if [[ ! -f "index.html" ]]; then
    task_fail "index.html not found"
    exit 1
fi

# Basic HTML validation
if ! grep -q "<title>" index.html; then
    task_warn "index.html missing title tag"
fi

if ! grep -q "js/" index.html; then
    task_warn "index.html may not be loading JavaScript modules"
fi

task_ok "Application smoke test passed"

# Step 6: Security check
if [[ -f "scripts/check-secrets.sh" ]]; then
    task_start "Running security check"

    if ./scripts/check-secrets.sh; then
        task_ok "Security check passed"
    else
        task_fail "Security check failed"
        exit 1
    fi
else
    task_skip "Security check (script not found)"
fi

# Summary
echo ""
print_header "✓ All integration tests passed! $(get_elapsed_time)"
echo ""
echo "Test Summary:"
echo "  ✓ Unit tests"
echo "  ✓ Linting"
if [[ -f "playwright.config.js" ]] || [[ -f "playwright.config.ts" ]]; then
    echo "  ✓ E2E tests"
fi
echo "  ✓ Application smoke test"
if [[ -f "scripts/check-secrets.sh" ]]; then
    echo "  ✓ Security check"
fi
echo ""
echo "Ready for deployment!"
