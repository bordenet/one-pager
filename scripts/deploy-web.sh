#!/usr/bin/env bash

################################################################################
# Web Deployment Script for one-pager
################################################################################
# PURPOSE: Deploy one-pager to GitHub Pages (docs/ directory)
# USAGE: ./scripts/deploy-web.sh [--dry-run] [-v|--verbose] [--help]
################################################################################

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Source compact output library
# shellcheck source=scripts/lib/compact.sh
source "${SCRIPT_DIR}/lib/compact.sh"

################################################################################
# Configuration
################################################################################

readonly DEPLOY_DIR="${PROJECT_ROOT}/docs"
readonly GITHUB_PAGES_URL="https://bordenet.github.io/one-pager/"

# Required files for deployment (relative to PROJECT_ROOT)
readonly REQUIRED_FILES=(
    "index.html"
    "css/styles.css"
    "js/app.js"
    "js/workflow.js"
    "js/storage.js"
    "js/ai-mock.js"
    "prompts/phase1.md"
    "prompts/phase2.md"
    "prompts/phase3.md"
    "templates/one-pager-template.md"
)

# Files/directories to exclude from deployment
readonly EXCLUDED_PATTERNS=(
    "node_modules"
    "coverage"
    "tests"
    "package.json"
    "package-lock.json"
    "jest.config.js"
    "jest.setup.js"
    ".eslintrc.json"
    ".gitignore"
    "README.md"
    "CLAUDE.md"
    "GENESIS-PROCESS-IMPROVEMENTS.md"
    "TODO-DEPLOYMENT-SCRIPT.md"
    "scripts"
    ".git"
    "docs"
)

# Flags
DRY_RUN=0
VERBOSE=0

################################################################################
# Functions
################################################################################

show_help() {
    cat << EOF
${C_BOLD}Web Deployment Script for one-pager${C_RESET}

${C_BOLD}USAGE:${C_RESET}
    $0 [OPTIONS]

${C_BOLD}OPTIONS:${C_RESET}
    --dry-run       Show what would be deployed without making changes
    -v, --verbose   Show detailed output
    --help          Show this help message

${C_BOLD}DESCRIPTION:${C_RESET}
    Deploys one-pager to GitHub Pages by copying required files to docs/ directory.
    
    ${C_BOLD}Source:${C_RESET}      Project root (flat structure)
    ${C_BOLD}Destination:${C_RESET} docs/ directory
    ${C_BOLD}GitHub Pages:${C_RESET} ${GITHUB_PAGES_URL}

${C_BOLD}REQUIRED FILES:${C_RESET}
$(printf "    - %s\n" "${REQUIRED_FILES[@]}")

${C_BOLD}EXCLUDED:${C_RESET}
$(printf "    - %s\n" "${EXCLUDED_PATTERNS[@]}")

${C_BOLD}EXAMPLES:${C_RESET}
    # Deploy to docs/
    $0

    # Preview deployment without changes
    $0 --dry-run

    # Verbose output
    $0 -v

EOF
}

# Validate required files exist
validate_required_files() {
    task_start "Validating required files"
    
    local missing_files=()
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "${PROJECT_ROOT}/${file}" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Missing required files"
        echo -e "${C_RED}Missing files:${C_RESET}"
        printf "  - %s\n" "${missing_files[@]}"
        return 1
    fi
    
    task_ok "All required files present (${#REQUIRED_FILES[@]} files)"
    return 0
}

# Clean deployment directory
clean_deploy_dir() {
    task_start "Cleaning deployment directory"
    
    if [[ $DRY_RUN -eq 1 ]]; then
        verbose "Would remove: ${DEPLOY_DIR}"
        task_ok "Clean deployment directory (dry-run)"
        return 0
    fi
    
    if [[ -d "${DEPLOY_DIR}" ]]; then
        rm -rf "${DEPLOY_DIR}"
        verbose "Removed existing: ${DEPLOY_DIR}"
    fi
    
    mkdir -p "${DEPLOY_DIR}"
    verbose "Created: ${DEPLOY_DIR}"
    
    task_ok "Deployment directory ready"
}

# Copy file preserving directory structure
copy_file() {
    local src="$1"
    local dest="$2"

    # Create destination directory if needed
    local dest_dir
    dest_dir="$(dirname "$dest")"

    if [[ $DRY_RUN -eq 1 ]]; then
        verbose "Would copy: ${src} -> ${dest}"
        return 0
    fi

    mkdir -p "$dest_dir"
    cp "$src" "$dest"
    verbose "Copied: ${src} -> ${dest}"
}

# Deploy required files
deploy_files() {
    task_start "Deploying files to docs/"

    local file_count=0

    for file in "${REQUIRED_FILES[@]}"; do
        local src="${PROJECT_ROOT}/${file}"
        local dest="${DEPLOY_DIR}/${file}"

        copy_file "$src" "$dest"
        ((file_count++))
    done

    if [[ $DRY_RUN -eq 1 ]]; then
        task_ok "Would deploy ${file_count} files (dry-run)"
    else
        task_ok "Deployed ${file_count} files"
    fi
}

# Verify deployment
verify_deployment() {
    task_start "Verifying deployment"

    if [[ $DRY_RUN -eq 1 ]]; then
        task_ok "Verification skipped (dry-run)"
        return 0
    fi

    local missing_files=()
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "${DEPLOY_DIR}/${file}" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Deployment verification failed"
        echo -e "${C_RED}Missing files in docs/:${C_RESET}"
        printf "  - %s\n" "${missing_files[@]}"
        return 1
    fi

    task_ok "Deployment verified (${#REQUIRED_FILES[@]} files)"
    return 0
}

# Show deployment summary
show_summary() {
    echo ""
    print_section "Deployment Summary"

    if [[ $DRY_RUN -eq 1 ]]; then
        echo -e "${C_YELLOW}DRY RUN MODE - No changes made${C_RESET}"
        echo ""
    fi

    echo -e "${C_BOLD}Deployment Directory:${C_RESET} ${DEPLOY_DIR}"
    echo -e "${C_BOLD}Files Deployed:${C_RESET}       ${#REQUIRED_FILES[@]}"
    echo -e "${C_BOLD}GitHub Pages URL:${C_RESET}     ${GITHUB_PAGES_URL}"
    echo ""

    if [[ $DRY_RUN -eq 0 ]]; then
        echo -e "${C_GREEN}${C_BOLD}Next Steps:${C_RESET}"
        echo -e "  1. Review changes: ${C_CYAN}git status${C_RESET}"
        echo -e "  2. Commit changes: ${C_CYAN}git add docs/ && git commit -m 'Deploy to GitHub Pages'${C_RESET}"
        echo -e "  3. Push to GitHub: ${C_CYAN}git push origin main${C_RESET}"
        echo -e "  4. Wait 2-5 minutes for GitHub Pages to deploy"
        echo -e "  5. Visit: ${C_CYAN}${GITHUB_PAGES_URL}${C_RESET}"
        echo ""
    fi
}

################################################################################
# Main
################################################################################

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=1
                shift
                ;;
            -v|--verbose)
                VERBOSE=1
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${C_RED}Unknown option: $1${C_RESET}"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Print header
    print_header "one-pager Web Deployment"

    if [[ $DRY_RUN -eq 1 ]]; then
        echo -e "${C_YELLOW}Running in DRY RUN mode${C_RESET}"
    fi

    echo ""

    # Execute deployment steps
    validate_required_files || exit 1
    clean_deploy_dir || exit 1
    deploy_files || exit 1
    verify_deployment || exit 1

    # Show summary
    show_summary

    # Final status
    echo ""
    if [[ $DRY_RUN -eq 1 ]]; then
        echo -e "${C_GREEN}${SYM_OK} Dry run completed successfully${C_RESET}"
    else
        echo -e "${C_GREEN}${SYM_OK} Deployment completed successfully${C_RESET}"
    fi

    echo ""
}

# Run main
main "$@"

