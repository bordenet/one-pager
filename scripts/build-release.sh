#!/usr/bin/env bash
# One-Pager - Build Release Script
# Creates production-ready build artifacts

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Parse command line arguments
CLEAN_BUILD=false
VERBOSE=${VERBOSE:-0}
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            export VERBOSE=1
            shift
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Build production-ready release artifacts

OPTIONS:
  -v, --verbose    Show detailed output
  -c, --clean      Clean build (remove existing artifacts)
  -h, --help       Show this help message

EXAMPLES:
  $(basename "$0")              # Standard build
  $(basename "$0") -c           # Clean build
  $(basename "$0") -v -c        # Verbose clean build

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

print_header "One-Pager - Build Release"

# Step 1: Clean previous build
if [[ $CLEAN_BUILD == true ]]; then
    task_start "Cleaning previous build"
    rm -rf dist/ build/ coverage/ 2>&1 | verbose
    task_ok "Build cleaned"
fi

# Step 2: Install dependencies
task_start "Installing dependencies"
if [[ $VERBOSE -eq 1 ]]; then
    npm ci
else
    npm ci --silent
fi
task_ok "Dependencies installed"

# Step 3: Run tests
task_start "Running tests"
if [[ $VERBOSE -eq 1 ]]; then
    npm test
else
    npm test --silent
fi
task_ok "Tests passed"

# Step 4: Run linting
task_start "Running linter"
if [[ $VERBOSE -eq 1 ]]; then
    npm run lint
else
    npm run lint --silent
fi
task_ok "Linting passed"

# Step 5: Create build directory
task_start "Creating build artifacts"
mkdir -p dist/
cp index.html dist/
cp -r css/ dist/
cp -r js/ dist/
cp -r prompts/ dist/
cp -r templates/ dist/
cp package.json dist/
cp README.md dist/
task_ok "Build artifacts created"

# Step 6: Generate version info
task_start "Generating version info"
VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

cat > dist/version.json << EOF
{
  "version": "$VERSION",
  "buildDate": "$BUILD_DATE",
  "gitCommit": "$GIT_COMMIT",
  "buildType": "release"
}
EOF
task_ok "Version info generated"

# Done
echo ""
print_header "✓ Build complete! $(get_elapsed_time)"
echo ""
echo "Build artifacts:"
echo "  dist/                # Production build"
echo "  dist/version.json    # Version information"
echo ""
echo "Next steps:"
echo "  cd dist && python3 -m http.server 8000  # Test build locally"
echo ""
