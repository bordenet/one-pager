#!/usr/bin/env bash
set -euo pipefail

################################################################################
# Web App Deployment Script
################################################################################
# PURPOSE: Deploy web app to GitHub Pages with minimal vertical output
# USAGE: ./scripts/deploy-web.sh [OPTIONS]
# OPTIONS:
#   -v, --verbose    Show detailed output
#   -h, --help       Show this help message
#   -n, --dry-run    Show what would be deployed without deploying
################################################################################

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/compact.sh
source "${SCRIPT_DIR}/lib/compact.sh"

################################################################################
# Configuration
################################################################################

readonly DOCS_DIR="docs"
readonly REQUIRED_FILES=(
    "index.html"
    "css/styles.css"
    "js/app.js"
    "js/documentGenerator.js"
    "js/promptManager.js"
)

################################################################################
# Logging Functions
################################################################################

log_verbose() {
    if [[ ${VERBOSE} -eq 1 ]]; then
        echo -e "${C_GRAY}  $*${C_RESET}"
    fi
}

log_error() {
    echo -e "${C_RED}$*${C_RESET}" >&2
}

################################################################################
# Help Text
################################################################################

show_help() {
    cat << 'HELP_EOF'
NAME
    deploy-web.sh - Deploy one-pager web app to GitHub Pages

SYNOPSIS
    ./scripts/deploy-web.sh [OPTIONS]

DESCRIPTION
    Deploys the one-pager web application to GitHub Pages by copying
    root-level files to the docs/ directory and pushing to origin/main.

OPTIONS
    -v, --verbose
        Show detailed output including all file operations and git commands.
        Default is compact output with minimal vertical space.

    -n, --dry-run
        Validate environment and show what would be deployed without actually
        deploying. Useful for testing before actual deployment.

    -h, --help
        Display this help message and exit.

EXAMPLES
    # Deploy with minimal output
    ./scripts/deploy-web.sh

    # Deploy with verbose output
    ./scripts/deploy-web.sh --verbose

    # Preview deployment without changes
    ./scripts/deploy-web.sh --dry-run

    # Dry-run with verbose output
    ./scripts/deploy-web.sh -n -v

DEPLOYMENT PROCESS
    1. Validates git repository and branch (must be on main)
    2. Checks for uncommitted changes (must be clean)
    3. Validates all required files exist
    4. Copies root files to docs/ directory (excluding dev files)
    5. Commits changes with automated message
    6. Pushes to origin/main
    7. GitHub Pages updates automatically in 1-2 minutes

GITHUB PAGES
    Live app: https://bordenet.github.io/one-pager/

EXIT STATUS
    0   Deployment successful
    1   Deployment failed (validation error or git error)

HELP_EOF
}

################################################################################
# Validation Functions
################################################################################

validate_environment() {
    task_start "Validating environment"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        task_fail "Not in a git repository"
        return 1
    fi
    
    # Check if on main branch
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "${current_branch}" != "main" ]]; then
        task_fail "Must be on main branch (currently on ${current_branch})"
        return 1
    fi
    
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        task_fail "Uncommitted changes detected. Commit or stash first"
        return 1
    fi
    
    task_ok "Environment validated"
}

validate_files() {
    task_start "Validating web app files"
    
    local missing_files=()
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "${file}" ]]; then
            missing_files+=("${file}")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Missing required files:"
        for file in "${missing_files[@]}"; do
            log_error "  - ${file}"
        done
        return 1
    fi
    
    task_ok "All required files present"
}

################################################################################
# Deployment Functions
################################################################################

copy_web_files() {
    task_start "Copying web app to docs/"

    # Create docs directory if it doesn't exist
    mkdir -p "${DOCS_DIR}"

    # Copy files from root to docs/, excluding dev files
    log_verbose "Copying root files to ${DOCS_DIR}/"
    
    if [[ ${VERBOSE} -eq 1 ]]; then
        rsync -a --delete \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='coverage' \
            --exclude='.DS_Store' \
            --exclude='*.swp' \
            --exclude='README.md' \
            --exclude='CLAUDE.md' \
            --exclude='GENESIS-PROCESS-IMPROVEMENTS.md' \
            --exclude='TODO-DEPLOYMENT-SCRIPT.md' \
            --exclude='package.json' \
            --exclude='package-lock.json' \
            --exclude='jest.config.js' \
            --exclude='jest.setup.js' \
            --exclude='.eslintrc.json' \
            --exclude='.gitignore' \
            --exclude='tests' \
            --exclude='scripts' \
            ./ "${DOCS_DIR}/"
    else
        rsync -a --delete \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='coverage' \
            --exclude='.DS_Store' \
            --exclude='*.swp' \
            --exclude='README.md' \
            --exclude='CLAUDE.md' \
            --exclude='GENESIS-PROCESS-IMPROVEMENTS.md' \
            --exclude='TODO-DEPLOYMENT-SCRIPT.md' \
            --exclude='package.json' \
            --exclude='package-lock.json' \
            --exclude='jest.config.js' \
            --exclude='jest.setup.js' \
            --exclude='.eslintrc.json' \
            --exclude='.gitignore' \
            --exclude='tests' \
            --exclude='scripts' \
            ./ "${DOCS_DIR}/" 2>&1 | grep -v "^rsync" || true
    fi

    task_ok "Files copied"
}

commit_and_push() {
    task_start "Committing changes"

    # Stage changes
    if [[ ${VERBOSE} -eq 1 ]]; then
        git add "${DOCS_DIR}"
    else
        git add "${DOCS_DIR}" >/dev/null 2>&1
    fi

    # Check if there are changes to commit
    if git diff --cached --quiet; then
        task_ok "No changes to deploy"
        return 0
    fi

    # Commit
    local commit_msg="Deploy web app to GitHub Pages

Automated deployment from root to docs/
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

    log_verbose "Committing with message:"
    log_verbose "${commit_msg}"

    if [[ ${VERBOSE} -eq 1 ]]; then
        git commit -m "${commit_msg}"
    else
        git commit -m "${commit_msg}" >/dev/null 2>&1
    fi

    task_ok "Changes committed"
}

push_to_remote() {
    task_start "Pushing to origin/main"

    log_verbose "Running: git push origin main"
    
    if [[ ${VERBOSE} -eq 1 ]]; then
        git push origin main
    else
        git push origin main >/dev/null 2>&1
    fi

    task_ok "Pushed to origin/main"
}

################################################################################
# Main Execution
################################################################################

main() {
    local dry_run=0

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -v|--verbose)
                VERBOSE=1
                shift
                ;;
            -n|--dry-run)
                dry_run=1
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Error: Unknown option: $1" >&2
                echo "Run with --help for usage information" >&2
                exit 1
                ;;
        esac
    done

    # Show header
    if [[ ${VERBOSE} -eq 0 ]]; then
        echo -e "${C_BOLD}Web App Deployment${C_RESET}"
    else
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Web App Deployment - One-Pager"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    # Validation
    validate_environment || exit 1
    validate_files || exit 1

    # Dry-run mode
    if [[ ${dry_run} -eq 1 ]]; then
        echo ""
        echo -e "${C_GREEN}✓ Dry-run successful${C_RESET}"
        echo ""
        echo "All validations passed. Run without --dry-run to deploy."
        exit 0
    fi

    # Deployment
    copy_web_files || exit 1
    commit_and_push || exit 1
    push_to_remote || exit 1

    # Success message
    echo ""
    echo -e "${C_GREEN}✓ Deployment successful${C_RESET}"
    echo ""
    echo "GitHub Pages will update in 1-2 minutes:"
    echo "  https://bordenet.github.io/one-pager/"
}

main "$@"
