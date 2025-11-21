#!/usr/bin/env bash
# One-Pager - Windows WSL Setup Script
# Optimized for minimal vertical space with running timer

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Parse command line arguments
# shellcheck disable=SC2034
AUTO_YES=false
FORCE_INSTALL=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            export VERBOSE=1
            shift
            ;;
        -y|--yes)
            AUTO_YES=true
            shift
            ;;
        -f|--force)
            FORCE_INSTALL=true
            shift
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Setup script for Windows WSL (Ubuntu/Debian)
Fast, resumable setup - only installs what's missing.

OPTIONS:
  -v, --verbose    Show detailed output (default: compact)
  -y, --yes        Automatically answer yes to prompts
  -f, --force      Force reinstall all dependencies
  -h, --help       Show this help message

EXAMPLES:
  $(basename "$0")              # Fast setup, only install missing items
  $(basename "$0") -v           # Verbose output
  $(basename "$0") -f           # Force reinstall everything
  $(basename "$0") -v -f        # Verbose + force reinstall

PERFORMANCE:
  First run:  ~2-3 minutes (installs everything)
  Subsequent: ~5-10 seconds (checks only, skips installed)

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

# Detect WSL
if ! grep -qi microsoft /proc/version 2>/dev/null; then
    task_warn "Not running on Windows WSL"
    verbose "Detected: $(uname -a)"
    if [ "$AUTO_YES" = false ]; then
        read -r -p "Continue anyway? [y/N]: " response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Setup cancelled"
            exit 0
        fi
    fi
fi

# Navigate to project root
cd "$SCRIPT_DIR/.."
PROJECT_ROOT=$(pwd)

print_header "One-Pager - WSL Setup"

# Cache file for tracking installed packages
CACHE_DIR="$PROJECT_ROOT/.setup-cache"
mkdir -p "$CACHE_DIR"

# Helper: Check if package is cached
is_cached() {
    local pkg="$1"
    [[ -f "$CACHE_DIR/$pkg" ]] && [[ $FORCE_INSTALL == false ]]
}

# Helper: Mark package as cached
mark_cached() {
    local pkg="$1"
    touch "$CACHE_DIR/$pkg"
}

# Step 1: System dependencies
task_start "Checking system dependencies"

# Update apt cache only if needed (once per day)
if [[ $FORCE_INSTALL == true ]] || ! is_cached "apt-updated-$(date +%Y%m%d)"; then
    verbose "Updating package list..."
    sudo apt-get update -qq 2>&1 | verbose
    mark_cached "apt-updated-$(date +%Y%m%d)"
fi

# Check Node.js
if ! command -v node &>/dev/null; then
    task_start "Installing Node.js"
    curl -fsSL https://deb.nodesource.com/setup_20.x 2>&1 | verbose | sudo -E bash - 2>&1 | verbose
    sudo apt-get install -y -qq nodejs 2>&1 | verbose
    mark_cached "nodejs"
    task_ok "Node.js installed"
fi
verbose "Node.js $(node --version)"

# Check Python (for pre-commit hooks)
if ! command -v python3 &>/dev/null; then
    task_start "Installing Python"
    sudo apt-get install -y -qq python3 python3-pip 2>&1 | verbose
    mark_cached "python3"
    task_ok "Python installed"
fi
verbose "Python $(python3 --version | awk '{print $2}')"

task_ok "System dependencies ready"

# Step 2: Node.js dependencies
PACKAGE_HASH=$(sha256sum package.json | awk '{print $1}' | cut -c1-8)
if [[ $FORCE_INSTALL == true ]] || ! is_cached "npm-deps-$PACKAGE_HASH"; then
    task_start "Installing Node.js dependencies"
    if [[ $VERBOSE -eq 1 ]]; then
        npm install
    else
        npm install --silent
    fi
    mark_cached "npm-deps-$PACKAGE_HASH"
    task_ok "Node.js dependencies installed"
else
    task_skip "Node.js dependencies"
fi

# Step 3: Pre-commit hooks (handled by npm prepare script)
task_skip "Pre-commit hooks (installed via npm)"

# Step 4: Quick validation
task_start "Validating setup"
if [[ $VERBOSE -eq 1 ]]; then
    npm run lint && npm test
else
    npm run lint --silent && npm test --silent
fi
if [[ $? -eq 0 ]]; then
    task_ok "Setup validated"
else
    task_fail "Validation failed"
    exit 1
fi

# Done
echo ""
print_header "✓ Setup complete! $(get_elapsed_time)"
echo ""
echo "Next steps:"
echo "  explorer.exe index.html  # Open in Windows browser"
echo "  npm test                 # Run tests"
echo "  npm run lint             # Check code quality"
echo ""
echo "Run with -v for verbose output, -f to force reinstall"
