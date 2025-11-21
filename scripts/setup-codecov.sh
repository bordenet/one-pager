#!/usr/bin/env bash
# One-Pager - Codecov Setup Script
# Configures code coverage reporting

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

Setup Codecov integration for code coverage reporting

OPTIONS:
  -v, --verbose    Show detailed output
  -h, --help       Show this help message

EXAMPLES:
  $(basename "$0")              # Setup Codecov integration
  $(basename "$0") -v           # Verbose output

REQUIREMENTS:
  - GitHub repository with Actions enabled
  - Codecov account linked to GitHub

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

print_header "One-Pager - Codecov Setup"

# Step 1: Check if already configured
task_start "Checking existing configuration"
if [[ -f "codecov.yml" ]]; then
    task_skip "Codecov already configured"
    echo ""
    echo "Codecov configuration already exists."
    echo "Delete codecov.yml to reconfigure."
    exit 0
fi
task_ok "No existing configuration found"

# Step 2: Create codecov.yml
task_start "Creating codecov.yml"
cat > codecov.yml << 'EOF'
# Codecov configuration for One-Pager
# https://docs.codecov.com/docs/codecov-yaml

coverage:
  precision: 2
  round: down
  range: "70...100"

  status:
    project:
      default:
        target: 70%
        threshold: 1%
        if_not_found: success
    patch:
      default:
        target: 70%
        threshold: 1%
        if_not_found: success

comment:
  layout: "reach,diff,flags,tree,reach"
  behavior: default
  require_changes: false
  require_base: no
  require_head: yes

ignore:
  - "tests/**/*"
  - "scripts/**/*"
  - "coverage/**/*"
  - "node_modules/**/*"
  - "*.config.js"
  - "*.md"

flags:
  unit:
    paths:
      - js/
    carryforward: true
  integration:
    paths:
      - tests/
    carryforward: true
EOF
task_ok "codecov.yml created"

# Step 3: Update package.json scripts
task_start "Updating package.json scripts"
if [[ -f "package.json" ]]; then
    # Check if test:coverage script exists
    if ! jq -e '.scripts."test:coverage"' package.json >/dev/null 2>&1; then
        # Add test:coverage script
        jq '.scripts."test:coverage" = "jest --coverage"' package.json > package.json.tmp
        mv package.json.tmp package.json
        verbose "Added test:coverage script"
    else
        verbose "test:coverage script already exists"
    fi

    # Check if codecov script exists
    if ! jq -e '.scripts.codecov' package.json >/dev/null 2>&1; then
        # Add codecov script
        jq '.scripts.codecov = "npm run test:coverage && codecov"' package.json > package.json.tmp
        mv package.json.tmp package.json
        verbose "Added codecov script"
    else
        verbose "codecov script already exists"
    fi

    task_ok "Package.json scripts updated"
else
    task_warn "package.json not found"
fi

# Step 4: Update GitHub Actions workflow
task_start "Updating GitHub Actions workflow"
WORKFLOW_FILE=".github/workflows/ci.yml"

if [[ -f "$WORKFLOW_FILE" ]]; then
    # Check if codecov step already exists
    if grep -q "codecov" "$WORKFLOW_FILE"; then
        task_skip "Codecov already in CI workflow"
    else
        # Add codecov step after tests
        sed -i.bak '/npm test/a\
\
      - name: Upload coverage to Codecov\
        uses: codecov/codecov-action@v3\
        with:\
          file: ./coverage/lcov.info\
          flags: unit\
          name: codecov-umbrella\
          fail_ci_if_error: false
' "$WORKFLOW_FILE"
        rm -f "$WORKFLOW_FILE.bak"
        task_ok "Added Codecov to CI workflow"
    fi
else
    task_warn "GitHub Actions workflow not found"
    verbose "Create .github/workflows/ci.yml to enable CI integration"
fi

# Step 5: Update .gitignore
task_start "Updating .gitignore"
if [[ -f ".gitignore" ]]; then
    if ! grep -q "coverage/" .gitignore; then
        echo "coverage/" >> .gitignore
        verbose "Added coverage/ to .gitignore"
    else
        verbose "coverage/ already in .gitignore"
    fi
    task_ok ".gitignore updated"
else
    task_warn ".gitignore not found"
fi

# Done
echo ""
print_header "✓ Codecov setup complete! $(get_elapsed_time)"
echo ""
echo "Next steps:"
echo "  1. Push changes to GitHub:"
echo "     git add . && git commit -m 'feat: add codecov integration'"
echo "     git push origin main"
echo ""
echo "  2. Visit https://codecov.io and link your repository"
echo ""
echo "  3. Run coverage locally:"
echo "     npm run test:coverage"
echo ""
echo "  4. View coverage report:"
echo "     open coverage/lcov-report/index.html"
echo ""
