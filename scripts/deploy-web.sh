#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=scripts/lib/compact.sh
source "${SCRIPT_DIR}/lib/compact.sh"

readonly DEPLOY_DIR="${PROJECT_ROOT}/docs"
readonly GITHUB_PAGES_URL="https://bordenet.github.io/one-pager/"
readonly REQUIRED_FILES=(
    "index.html" "css/styles.css" "js/app.js" "js/workflow.js" "js/storage.js"
    "js/ai-mock.js" "js/views.js" "js/projects.js" "js/ui.js" "js/router.js"
    "prompts/phase1.md" "prompts/phase2.md" "prompts/phase3.md"
    "templates/one-pager-template.md"
)

DRY_RUN=0
VERBOSE=0

show_help() {
    cat << EOF
${C_BOLD}one-pager Web Deployment${C_RESET}
Deploys to GitHub Pages (docs/ directory)

${C_BOLD}USAGE:${C_RESET} $0 [--dry-run] [-v|--verbose] [--help]

${C_BOLD}OPTIONS:${C_RESET}
  --dry-run    Preview without making changes
  -v           Verbose output
  --help       Show this help

${C_BOLD}DEPLOYS:${C_RESET} ${#REQUIRED_FILES[@]} files (HTML, CSS, JS, prompts, templates)
${C_BOLD}EXCLUDES:${C_RESET} node_modules, tests, coverage, configs, docs
${C_BOLD}URL:${C_RESET} ${GITHUB_PAGES_URL}
EOF
}

validate_required_files() {
    task_start "Validating required files"
    local missing_files=()
    for file in "${REQUIRED_FILES[@]}"; do
        [[ ! -f "${PROJECT_ROOT}/${file}" ]] && missing_files+=("$file")
    done
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Missing required files"
        printf "${C_RED}Missing:${C_RESET} %s\n" "${missing_files[@]}"
        return 1
    fi
    task_ok "All required files present (${#REQUIRED_FILES[@]} files)"
}

clean_deploy_dir() {
    task_start "Cleaning deployment directory"
    if [[ $DRY_RUN -eq 1 ]]; then
        verbose "Would remove: ${DEPLOY_DIR}"
        task_ok "Clean deployment directory (dry-run)"
        return 0
    fi
    [[ -d "${DEPLOY_DIR}" ]] && rm -rf "${DEPLOY_DIR}" && verbose "Removed: ${DEPLOY_DIR}"
    mkdir -p "${DEPLOY_DIR}" && verbose "Created: ${DEPLOY_DIR}"
    task_ok "Deployment directory ready"
}

copy_file() {
    local src="$1" dest="$2"
    if [[ $DRY_RUN -eq 1 ]]; then
        verbose "Would copy: ${src} -> ${dest}"
        return 0
    fi
    mkdir -p "$(dirname "$dest")"
    cp "$src" "$dest"
    verbose "Copied: ${src} -> ${dest}"
}

deploy_files() {
    task_start "Deploying files to docs/"
    local file_count=0
    for file in "${REQUIRED_FILES[@]}"; do
        copy_file "${PROJECT_ROOT}/${file}" "${DEPLOY_DIR}/${file}"
        ((file_count++))
    done
    [[ $DRY_RUN -eq 1 ]] && task_ok "Would deploy ${file_count} files (dry-run)" || task_ok "Deployed ${file_count} files"
}

verify_deployment() {
    task_start "Verifying deployment"
    if [[ $DRY_RUN -eq 1 ]]; then
        task_ok "Verification skipped (dry-run)"
        return 0
    fi
    local missing_files=()
    for file in "${REQUIRED_FILES[@]}"; do
        [[ ! -f "${DEPLOY_DIR}/${file}" ]] && missing_files+=("$file")
    done
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Deployment verification failed"
        printf "${C_RED}Missing in docs/:${C_RESET} %s\n" "${missing_files[@]}"
        return 1
    fi
    task_ok "Deployment verified (${#REQUIRED_FILES[@]} files)"
}

show_summary() {
    echo ""
    print_section "Deployment Summary"
    [[ $DRY_RUN -eq 1 ]] && echo -e "${C_YELLOW}DRY RUN - No changes made${C_RESET}\n"
    echo -e "${C_BOLD}Directory:${C_RESET} ${DEPLOY_DIR}"
    echo -e "${C_BOLD}Files:${C_RESET}     ${#REQUIRED_FILES[@]}"
    echo -e "${C_BOLD}URL:${C_RESET}       ${GITHUB_PAGES_URL}"
    if [[ $DRY_RUN -eq 0 ]]; then
        echo -e "\n${C_BOLD}Next:${C_RESET}"
        echo -e "  git add docs/ && git commit -m 'Deploy to GitHub Pages'"
        echo -e "  git push origin main"
        echo -e "  Wait 2-5 min, then visit: ${C_CYAN}${GITHUB_PAGES_URL}${C_RESET}"
    fi
    echo ""
}

main() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run) DRY_RUN=1; shift ;;
            -v|--verbose) VERBOSE=1; shift ;;
            --help) show_help; exit 0 ;;
            *) echo -e "${C_RED}Unknown: $1${C_RESET}\nUse --help"; exit 1 ;;
        esac
    done

    print_header "one-pager Web Deployment"
    [[ $DRY_RUN -eq 1 ]] && echo -e "${C_YELLOW}DRY RUN mode${C_RESET}"
    echo ""

    validate_required_files || exit 1
    clean_deploy_dir || exit 1
    deploy_files || exit 1
    verify_deployment || exit 1
    show_summary

    echo ""
    [[ $DRY_RUN -eq 1 ]] && echo -e "${C_GREEN}${SYM_OK} Dry run complete${C_RESET}" || echo -e "${C_GREEN}${SYM_OK} Deployment complete${C_RESET}"
    echo ""
}

main "$@"
