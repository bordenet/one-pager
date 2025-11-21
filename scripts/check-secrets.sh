#!/usr/bin/env bash
# One-Pager - Security Check Script
# Scans for potential secrets and sensitive information

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Navigate to project root
cd "$SCRIPT_DIR/.."
PROJECT_ROOT=$(pwd)

print_header "One-Pager - Security Check"

# Patterns to check for potential secrets
PATTERNS=(
    "password\s*[:=]\s*['\"][^'\"]{3,}['\"]"
    "api[_-]?key\s*[:=]\s*['\"][^'\"]{10,}['\"]"
    "secret\s*[:=]\s*['\"][^'\"]{10,}['\"]"
    "token\s*[:=]\s*['\"][^'\"]{10,}['\"]"
    "private[_-]?key\s*[:=]"
    "-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----"
    "sk-[a-zA-Z0-9]{32,}"
    "ghp_[a-zA-Z0-9]{36}"
    "gho_[a-zA-Z0-9]{36}"
    "ghu_[a-zA-Z0-9]{36}"
    "ghs_[a-zA-Z0-9]{36}"
    "ghr_[a-zA-Z0-9]{36}"
)

# Files to exclude from scanning
EXCLUDE_PATTERNS=(
    "node_modules/"
    ".git/"
    "*.log"
    "*.lock"
    "coverage/"
    ".setup-cache/"
    "scripts/check-secrets.sh"
)

# Build exclude arguments for grep
EXCLUDE_ARGS="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=coverage --exclude-dir=.setup-cache"

ISSUES_FOUND=0

task_start "Scanning for potential secrets"

# Check each pattern
for pattern in "${PATTERNS[@]}"; do
    verbose "Checking pattern: $pattern"

    # Use grep to find matches, excluding specified directories
    if matches=$(grep -r -i -E "$pattern" . $EXCLUDE_ARGS 2>/dev/null || true); then
        if [[ -n "$matches" ]]; then
            # Filter out mock/test keys
            filtered_matches=$(echo "$matches" | grep -v -E "(mock|test|example|demo|fake)" || true)
            if [[ -n "$filtered_matches" ]]; then
                echo ""
                echo -e "${C_RED}⚠ Potential secret found:${C_RESET}"
                echo "$filtered_matches"
                echo ""
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            fi
        fi
    fi
done

# Check for common secret files
SECRET_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    "config/secrets.yml"
    "secrets.json"
    "private.key"
    "id_rsa"
    "id_dsa"
    "id_ecdsa"
    "id_ed25519"
)

task_start "Checking for secret files"

for file in "${SECRET_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        if [[ "$file" == ".env" ]]; then
            # .env files are expected, just warn if they contain actual values
            if grep -q "=" "$file" 2>/dev/null; then
                echo -e "${C_YELLOW}⚠ Found .env file with values - ensure it's in .gitignore${C_RESET}"
                verbose "File: $file"
            fi
        else
            echo -e "${C_RED}⚠ Found potential secret file: $file${C_RESET}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    fi
done

# Check .gitignore for common secret patterns
task_start "Validating .gitignore"

if [[ -f ".gitignore" ]]; then
    GITIGNORE_PATTERNS=(
        ".env"
        "*.key"
        "*.pem"
        "secrets.*"
        "config/secrets.*"
    )

    for pattern in "${GITIGNORE_PATTERNS[@]}"; do
        if ! grep -q "^$pattern" .gitignore; then
            verbose "Missing .gitignore pattern: $pattern"
        fi
    done
    task_ok "Gitignore validated"
else
    task_warn "No .gitignore file found"
fi

# Summary
echo ""
if [[ $ISSUES_FOUND -eq 0 ]]; then
    print_header "✓ Security check passed - no secrets detected"
    task_ok "Security check completed"
else
    print_header "✗ Security check failed - $ISSUES_FOUND potential issues found"
    echo ""
    echo "Recommendations:"
    echo "1. Remove any hardcoded secrets from source code"
    echo "2. Use environment variables for sensitive configuration"
    echo "3. Add secret files to .gitignore"
    echo "4. Consider using a secrets management service"
    echo ""
    exit 1
fi
