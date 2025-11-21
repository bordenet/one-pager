#!/usr/bin/env pwsh
# One-Pager - Git Hooks Installation (PowerShell)
# Installs pre-commit, pre-push, and commit-msg hooks

[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
    [switch]$Force,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Get script directory and navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir '..')
$ProjectRoot = Get-Location

# Import compact output module
Import-Module "$ScriptDir\lib\Compact.psm1" -Force

if ($VerbosePreference -eq 'Continue') {
    Enable-VerboseMode
}

# Show help
if ($Help) {
    Write-Host @"
Usage: .\install-hooks.ps1 [OPTIONS]

Install Git hooks for code quality

OPTIONS:
  -Verbose     Show detailed output
  -Force       Force reinstall hooks (overwrite existing)
  -Help        Show this help message

EXAMPLES:
  .\install-hooks.ps1              # Install hooks if not present
  .\install-hooks.ps1 -Force       # Force reinstall hooks
  .\install-hooks.ps1 -Verbose     # Verbose output

"@
    exit 0
}

Write-CompactHeader 'One-Pager - Git Hooks Installation'

# Check if .git directory exists
if (-not (Test-Path '.git')) {
    Stop-Task 'Not a git repository'
    Write-Host ''
    Write-Host 'This script must be run from the root of a git repository.'
    exit 1
}

$HooksDir = '.git\hooks'

# Step 1: Check existing hooks
Start-Task 'Checking existing hooks'
$ExistingHooks = @()
$HookFiles = @('pre-commit', 'pre-push', 'commit-msg')

foreach ($hook in $HookFiles) {
    if (Test-Path (Join-Path $HooksDir $hook)) {
        $ExistingHooks += $hook
    }
}

if ($ExistingHooks.Count -gt 0 -and -not $Force) {
    Write-TaskWarning "Existing hooks found: $($ExistingHooks -join ', ')"
    Write-Host ''
    Write-Host 'Use -Force to overwrite existing hooks.'
    exit 0
} elseif ($ExistingHooks.Count -gt 0) {
    Write-Verbose-Line "Overwriting existing hooks: $($ExistingHooks -join ', ')"
}

Complete-Task 'Hook status checked'

# Step 2: Install pre-commit hook
Start-Task 'Installing pre-commit hook'
$PreCommitContent = @'
#!/bin/sh
# Pre-commit hook: Run linting and tests

echo "Running pre-commit checks..."

# Run linter
echo "  → Running ESLint..."
if ! npm run lint --silent; then
    echo "❌ Linting failed. Fix errors and try again."
    exit 1
fi

# Run tests
echo "  → Running tests..."
if ! npm test --silent; then
    echo "❌ Tests failed. Fix tests and try again."
    exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
'@

$PreCommitContent | Out-File -FilePath (Join-Path $HooksDir 'pre-commit') -Encoding UTF8 -NoNewline
Complete-Task 'Pre-commit hook installed'

# Step 3: Install pre-push hook
Start-Task 'Installing pre-push hook'
$PrePushContent = @'
#!/bin/sh
# Pre-push hook: Run integration tests

echo "Running pre-push checks..."

# Run integration tests if available
if [ -f "scripts/integration-test.sh" ]; then
    echo "  → Running integration tests..."
    if ! ./scripts/integration-test.sh; then
        echo "❌ Integration tests failed. Fix issues and try again."
        exit 1
    fi
else
    # Fallback to regular tests
    echo "  → Running tests..."
    if ! npm test --silent; then
        echo "❌ Tests failed. Fix tests and try again."
        exit 1
    fi
fi

echo "✅ Pre-push checks passed"
exit 0
'@

$PrePushContent | Out-File -FilePath (Join-Path $HooksDir 'pre-push') -Encoding UTF8 -NoNewline
Complete-Task 'Pre-push hook installed'

# Step 4: Install commit-msg hook
Start-Task 'Installing commit-msg hook'
$CommitMsgContent = @'
#!/bin/sh
# Commit-msg hook: Validate commit message format

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Format: type(scope): description"
    echo "Types: feat, fix, docs, style, refactor, test, chore"
    echo "Example: feat(ui): add dark mode toggle"
    echo ""
    echo "Your message:"
    cat "$1"
    exit 1
fi

exit 0
'@

$CommitMsgContent | Out-File -FilePath (Join-Path $HooksDir 'commit-msg') -Encoding UTF8 -NoNewline
Complete-Task 'Commit-msg hook installed'

# Step 5: Make hooks executable (if on WSL/Git Bash)
Start-Task 'Setting hook permissions'
try {
    # Try to make hooks executable (works in WSL/Git Bash)
    & chmod +x (Join-Path $HooksDir 'pre-commit') 2>$null
    & chmod +x (Join-Path $HooksDir 'pre-push') 2>$null
    & chmod +x (Join-Path $HooksDir 'commit-msg') 2>$null
    Write-Verbose-Line 'Hooks made executable'
} catch {
    Write-Verbose-Line 'Could not set executable permissions (normal on Windows)'
}
Complete-Task 'Hook permissions set'

# Done
Write-Host ''
Write-CompactHeader "Git hooks installed! $(Get-ElapsedTime)"
Write-Host ''
Write-Host 'Installed hooks:'
Write-Host '  • pre-commit  - Runs linting and tests before commit'
Write-Host '  • pre-push    - Runs integration tests before push'
Write-Host '  • commit-msg  - Validates commit message format'
Write-Host ''
