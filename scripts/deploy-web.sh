#!/usr/bin/env bash
################################################################################
# deploy-web.sh - Deploy One-Pager to GitHub Pages
################################################################################
# GitHub Pages serves directly from root (/) on main branch.
# This script runs quality checks and pushes changes to trigger deployment.
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# shellcheck source=scripts/lib/compact.sh
source "${SCRIPT_DIR}/lib/compact.sh"

# shellcheck source=scripts/lib/symlinks.sh
source "${SCRIPT_DIR}/lib/symlinks.sh"

################################################################################
# Configuration
################################################################################

PROJECT_NAME="One-Pager"
GITHUB_PAGES_URL="https://bordenet.github.io/one-pager/"

# Files in assistant/ subdirectory (web files)
readonly ASSISTANT_FILES=(
    "index.html" "css/styles.css" "js/app.js" "js/workflow.js" "js/storage.js"
    "js/ai-mock.js" "js/views.js" "js/projects.js" "js/ui.js" "js/router.js"
    "js/project-view.js" "js/prompts.js"
)

# Files at project root (shared resources)
readonly ROOT_FILES=(
    "prompts/phase1.md" "prompts/phase2.md" "prompts/phase3.md"
    "templates/one-pager-template.md"
)

# Files/folders to copy from assistant/ to root for GitHub Pages
readonly DEPLOY_ITEMS=(
    "index.html"
    "css"
    "js"
)

SKIP_TESTS=false
SKIP_LINT=false
DRY_RUN=false
export VERBOSE=false

################################################################################
# Functions
################################################################################

show_help() {
    cat << EOF
${C_BOLD}one-pager Web Deployment${C_RESET}
Deploys to GitHub Pages (serves from root /)

${C_BOLD}USAGE:${C_RESET} $0 [OPTIONS]

${C_BOLD}OPTIONS:${C_RESET}
  --skip-tests    Skip running tests (NOT RECOMMENDED)
  --skip-lint     Skip linting (NOT RECOMMENDED)
  --dry-run       Preview without pushing changes
  -v, --verbose   Show detailed output
  --help          Show this help

${C_BOLD}URL:${C_RESET} ${GITHUB_PAGES_URL}
EOF
}

validate_required_files() {
    task_start "Validating required files"
    local missing_files=()
    local total_files=0

    # Check assistant/ files
    for file in "${ASSISTANT_FILES[@]}"; do
        ((total_files++))
        [[ ! -f "${PROJECT_ROOT}/assistant/${file}" ]] && missing_files+=("assistant/$file")
    done

    # Check root files
    for file in "${ROOT_FILES[@]}"; do
        ((total_files++))
        [[ ! -f "${PROJECT_ROOT}/${file}" ]] && missing_files+=("$file")
    done

    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Missing required files"
        printf "${C_RED}Missing:${C_RESET} %s\n" "${missing_files[@]}"
        return 1
    fi
    task_ok "All required files present (${total_files} files)"
}

copy_assistant_to_root() {
    task_start "Copying assistant/ to root for deployment"

    if [[ "$DRY_RUN" == "true" ]]; then
        task_ok "Skipped (--dry-run)"
        return 0
    fi

    for item in "${DEPLOY_ITEMS[@]}"; do
        if [[ -e "${PROJECT_ROOT}/assistant/${item}" ]]; then
            cp -r "${PROJECT_ROOT}/assistant/${item}" "${PROJECT_ROOT}/${item}"
            [[ "$VERBOSE" == "true" ]] && echo "  Copied ${item}"
        fi
    done

    task_ok "Files copied to root"
}

remove_root_copies() {
    task_start "Removing root copies (keeping assistant/ only)"

    if [[ "$DRY_RUN" == "true" ]]; then
        task_ok "Skipped (--dry-run)"
        return 0
    fi

    for item in "${DEPLOY_ITEMS[@]}"; do
        if [[ -e "${PROJECT_ROOT}/${item}" ]]; then
            rm -rf "${PROJECT_ROOT}/${item}"
            [[ "$VERBOSE" == "true" ]] && echo "  Removed ${item}"
        fi
    done

    task_ok "Root copies removed"
}

run_lint() {
    task_start "Running linter"
    if [[ "$SKIP_LINT" == "true" ]]; then
        task_ok "Skipped (--skip-lint)"
        return 0
    fi
    if [[ "$VERBOSE" == "true" ]]; then
        npm run lint || { task_fail "Linting failed"; return 1; }
    else
        npm run lint >/dev/null 2>&1 || { task_fail "Linting failed. Run 'npm run lint'"; return 1; }
    fi
    task_ok "Linting passed"
}

run_tests() {
    task_start "Running tests"
    if [[ "$SKIP_TESTS" == "true" ]]; then
        task_ok "Skipped (--skip-tests)"
        return 0
    fi
    if [[ "$VERBOSE" == "true" ]]; then
        npm test || { task_fail "Tests failed"; return 1; }
    else
        npm test >/dev/null 2>&1 || { task_fail "Tests failed. Run 'npm test'"; return 1; }
    fi
    task_ok "Tests passed"
}

deploy_to_github() {
    task_start "Deploying to GitHub"

    if [[ "$DRY_RUN" == "true" ]]; then
        task_ok "Skipped (--dry-run)"
        return 0
    fi

    if git diff --quiet && git diff --cached --quiet; then
        task_ok "No changes to commit"
    else
        # Add all files for deployment
        git add . >/dev/null 2>&1

        # Commit with --no-verify to skip pre-commit hooks
        # (we already ran tests and linting)
        local commit_msg="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        if [[ "$VERBOSE" == "true" ]]; then
            git commit --no-verify -m "$commit_msg" || true
        else
            git commit --no-verify -m "$commit_msg" >/dev/null 2>&1 || true
        fi
    fi

    if [[ "$VERBOSE" == "true" ]]; then
        git push origin main || { task_fail "Failed to push"; return 1; }
    else
        git push origin main >/dev/null 2>&1 || { task_fail "Failed to push"; return 1; }
    fi

    task_ok "Pushed to GitHub"
}

verify_deployment() {
    task_start "Verifying deployment"

    if [[ "$DRY_RUN" == "true" ]]; then
        task_ok "Skipped (--dry-run)"
        return 0
    fi

    echo "  Waiting for GitHub Pages to update..."
    sleep 5

    if curl -s -o /dev/null -w "%{http_code}" "$GITHUB_PAGES_URL" | grep -q "200"; then
        task_ok "Site returning HTTP 200"
    else
        task_ok "Site may still be deploying (check in 1-2 min)"
    fi
}

################################################################################
# Main
################################################################################

main() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests) SKIP_TESTS=true; shift ;;
            --skip-lint) SKIP_LINT=true; shift ;;
            --dry-run) DRY_RUN=true; shift ;;
            -v|--verbose) VERBOSE=true; shift ;;
            --help) show_help; exit 0 ;;
            *) echo -e "${C_RED}Unknown: $1${C_RESET}\nUse --help"; exit 1 ;;
        esac
    done

    print_header "${PROJECT_NAME} Web Deployment"
    [[ "$DRY_RUN" == "true" ]] && echo -e "${C_YELLOW}DRY RUN mode${C_RESET}"
    echo ""

    validate_required_files || exit 1
    run_lint || exit 1
    run_tests || exit 1

    # Replace symlinks with real files for GitHub Pages
    replace_symlinks_with_real_files || exit 1

    # Copy assistant/ files to root for GitHub Pages (serves from /)
    copy_assistant_to_root || exit 1

    # Deploy (with trap to cleanup on failure)
    cleanup_deploy() {
        remove_root_copies 2>/dev/null || true
        restore_symlinks 2>/dev/null || true
    }
    trap 'cleanup_deploy' EXIT

    deploy_to_github || exit 1

    # Cleanup: remove root copies and restore symlinks
    remove_root_copies
    restore_symlinks
    trap - EXIT

    verify_deployment

    echo ""
    echo -e "${C_GREEN}${SYM_OK} Deployment complete${C_RESET}"
    echo ""
    echo "  📦 Project: ${PROJECT_NAME}"
    echo "  🔗 URL: ${GITHUB_PAGES_URL}"
    echo ""
}

main "$@"
