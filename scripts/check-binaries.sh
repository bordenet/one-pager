#!/usr/bin/env bash
# One-Pager - Binary Dependencies Check
# Verifies all required binaries are available

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Parse command line arguments
VERBOSE=${VERBOSE:-0}
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            export VERBOSE=1
            shift
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Check all required binary dependencies

OPTIONS:
  -v, --verbose    Show detailed output
  -h, --help       Show this help message

EXAMPLES:
  $(basename "$0")              # Check all binaries
  $(basename "$0") -v           # Verbose output

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

print_header "One-Pager - Binary Dependencies Check"

# Required binaries
REQUIRED_BINARIES=(
    "node:Node.js runtime"
    "npm:Node.js package manager"
    "git:Version control system"
)

# Optional binaries
OPTIONAL_BINARIES=(
    "python3:Python runtime (for pre-commit hooks)"
    "curl:HTTP client (for downloads)"
)

# Check required binaries
task_start "Checking required binaries"
MISSING_REQUIRED=()

for binary_info in "${REQUIRED_BINARIES[@]}"; do
    binary="${binary_info%%:*}"
    description="${binary_info##*:}"

    if command -v "$binary" &>/dev/null; then
        version=""
        case "$binary" in
            node) version="$(node --version)" ;;
            npm) version="v$(npm --version)" ;;
            git) version="$(git --version | awk '{print $3}')" ;;
        esac
        verbose "✓ $binary $version - $description"
    else
        verbose "✗ $binary - $description (MISSING)"
        MISSING_REQUIRED+=("$binary")
    fi
done

if [[ ${#MISSING_REQUIRED[@]} -eq 0 ]]; then
    task_ok "All required binaries found"
else
    task_fail "Missing required binaries: ${MISSING_REQUIRED[*]}"
fi

# Check optional binaries
task_start "Checking optional binaries"
MISSING_OPTIONAL=()

for binary_info in "${OPTIONAL_BINARIES[@]}"; do
    binary="${binary_info%%:*}"
    description="${binary_info##*:}"

    if command -v "$binary" &>/dev/null; then
        version=""
        case "$binary" in
            python3) version="$(python3 --version | awk '{print $2}')" ;;
            curl) version="$(curl --version | head -1 | awk '{print $2}')" ;;
        esac
        verbose "✓ $binary $version - $description"
    else
        verbose "○ $binary - $description (optional)"
        MISSING_OPTIONAL+=("$binary")
    fi
done

if [[ ${#MISSING_OPTIONAL[@]} -eq 0 ]]; then
    task_ok "All optional binaries found"
else
    task_warn "Missing optional binaries: ${MISSING_OPTIONAL[*]}"
fi

# Summary
echo ""
if [[ ${#MISSING_REQUIRED[@]} -eq 0 ]]; then
    print_header "✓ Binary check complete! $(get_elapsed_time)"
    echo ""
    echo "All required binaries are available."
    if [[ ${#MISSING_OPTIONAL[@]} -gt 0 ]]; then
        echo "Optional binaries missing: ${MISSING_OPTIONAL[*]}"
        echo "These are not required for basic functionality."
    fi
else
    print_header "✗ Binary check failed! $(get_elapsed_time)"
    echo ""
    echo "Missing required binaries: ${MISSING_REQUIRED[*]}"
    echo ""
    echo "Install missing binaries and run again."
    exit 1
fi
