#!/usr/bin/env bash
# One-Pager - Git Hooks Installation Script
# Installs and configures git hooks for development workflow

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Parse command line arguments
FORCE_INSTALL=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE_INSTALL=true
            shift
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Install git hooks for One-Pager development

OPTIONS:
  -f, --force      Force reinstall hooks (overwrite existing)
  -h, --help       Show this help message

HOOKS INSTALLED:
  pre-commit       Run linting and tests before commit
  pre-push         Run integration tests before push
  commit-msg       Validate commit message format

EXAMPLES:
  $(basename "$0")              # Install hooks
  $(basename "$0") -f           # Force reinstall hooks

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

print_header "One-Pager - Git Hooks Installation"

# Check if we're in a git repository
if [[ ! -d ".git" ]]; then
    task_fail "Not a git repository"
    exit 1
fi

# Step 1: Install pre-commit (Python-based hooks)
task_start "Installing pre-commit hooks"

if command -v pre-commit &>/dev/null; then
    if [[ $FORCE_INSTALL == true ]]; then
        pre-commit uninstall &>/dev/null || true
    fi

    pre-commit install
    task_ok "Pre-commit hooks installed"
else
    # Fallback: create basic pre-commit hook
    HOOK_FILE=".git/hooks/pre-commit"

    if [[ -f "$HOOK_FILE" ]] && [[ $FORCE_INSTALL == false ]]; then
        task_skip "Pre-commit hook (already exists)"
    else
        cat > "$HOOK_FILE" << 'EOF'
#!/usr/bin/env bash
# One-Pager pre-commit hook

set -e

echo "Running pre-commit checks..."

# Run linter
echo "  → Linting..."
npm run lint --silent

# Run tests
echo "  → Testing..."
npm test --silent

echo "✓ Pre-commit checks passed"
EOF
        chmod +x "$HOOK_FILE"
        task_ok "Basic pre-commit hook installed"
    fi
fi

# Step 2: Install pre-push hook
task_start "Installing pre-push hook"

HOOK_FILE=".git/hooks/pre-push"

if [[ -f "$HOOK_FILE" ]] && [[ $FORCE_INSTALL == false ]]; then
    task_skip "Pre-push hook (already exists)"
else
    cat > "$HOOK_FILE" << 'EOF'
#!/usr/bin/env bash
# One-Pager pre-push hook

set -e

echo "Running pre-push checks..."

# Run integration tests if available
if [[ -f "scripts/integration-test.sh" ]]; then
    echo "  → Integration tests..."
    ./scripts/integration-test.sh --headless
else
    echo "  → Unit tests..."
    npm test --silent

    echo "  → Linting..."
    npm run lint --silent
fi

echo "✓ Pre-push checks passed"
EOF
    chmod +x "$HOOK_FILE"
    task_ok "Pre-push hook installed"
fi

# Step 3: Install commit-msg hook
task_start "Installing commit-msg hook"

HOOK_FILE=".git/hooks/commit-msg"

if [[ -f "$HOOK_FILE" ]] && [[ $FORCE_INSTALL == false ]]; then
    task_skip "Commit-msg hook (already exists)"
else
    cat > "$HOOK_FILE" << 'EOF'
#!/usr/bin/env bash
# One-Pager commit-msg hook
# Validates commit message format

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo ""
    echo "Format: type(scope): description"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore"
    echo "Example: feat(ui): add dark mode toggle"
    echo ""
    exit 1
fi
EOF
    chmod +x "$HOOK_FILE"
    task_ok "Commit-msg hook installed"
fi

# Step 4: Test hooks
task_start "Testing hooks"

# Test pre-commit hook
if [[ -x ".git/hooks/pre-commit" ]]; then
    verbose "Testing pre-commit hook..."
    # We can't easily test this without making changes
    verbose "Pre-commit hook is executable"
fi

# Test commit-msg hook
if [[ -x ".git/hooks/commit-msg" ]]; then
    verbose "Testing commit-msg hook..."
    echo "feat: test commit message" > /tmp/test-commit-msg
    if .git/hooks/commit-msg /tmp/test-commit-msg; then
        verbose "Commit-msg hook validation works"
    else
        task_warn "Commit-msg hook test failed"
    fi
    rm -f /tmp/test-commit-msg
fi

task_ok "Hooks tested"

# Summary
echo ""
print_header "✓ Git hooks installed successfully!"
echo ""
echo "Installed hooks:"
echo "  ✓ pre-commit  - Runs linting and tests before commit"
echo "  ✓ pre-push    - Runs integration tests before push"
echo "  ✓ commit-msg  - Validates commit message format"
echo ""
echo "Commit message format: type(scope): description"
echo "Types: feat, fix, docs, style, refactor, test, chore"
