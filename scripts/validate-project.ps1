#!/usr/bin/env pwsh
# One-Pager - Project Structure Validation (PowerShell)
# Validates project structure and configuration

[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
    [switch]$Fix,
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
Usage: .\validate-project.ps1 [OPTIONS]

Validate project structure and configuration

OPTIONS:
  -Verbose     Show detailed output
  -Fix         Automatically fix common issues
  -Help        Show this help message

EXAMPLES:
  .\validate-project.ps1              # Validate project structure
  .\validate-project.ps1 -Fix         # Validate and fix issues
  .\validate-project.ps1 -Verbose -Fix  # Verbose validation with fixes

"@
    exit 0
}

Write-CompactHeader 'One-Pager - Project Validation'

# Track issues
$IssuesFound = 0

# Step 1: Check required files
Start-Task 'Checking required files'
$RequiredFiles = @(
    'package.json',
    'index.html',
    'README.md',
    '.gitignore',
    'jest.config.js',
    '.eslintrc.json'
)

foreach ($file in $RequiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Verbose-Line "✗ Missing: $file"
        $IssuesFound++
    } else {
        Write-Verbose-Line "✓ Found: $file"
    }
}

if ($IssuesFound -eq 0) {
    Complete-Task 'All required files present'
} else {
    Write-TaskWarning "$IssuesFound required files missing"
}

# Step 2: Check required directories
Start-Task 'Checking required directories'
$RequiredDirs = @('css', 'js', 'prompts', 'templates', 'tests', 'scripts')
$DirIssues = 0

foreach ($dir in $RequiredDirs) {
    if (-not (Test-Path $dir -PathType Container)) {
        Write-Verbose-Line "✗ Missing: $dir/"
        $DirIssues++
        $IssuesFound++

        if ($Fix) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
            Write-Verbose-Line "  → Created: $dir/"
        }
    } else {
        Write-Verbose-Line "✓ Found: $dir/"
    }
}

if ($DirIssues -eq 0) {
    Complete-Task 'All required directories present'
} else {
    if ($Fix) {
        Complete-Task "$DirIssues directories created"
    } else {
        Write-TaskWarning "$DirIssues required directories missing"
    }
}

# Step 3: Check package.json configuration
Start-Task 'Validating package.json'
$PkgIssues = 0

if (Test-Path 'package.json') {
    $packageJson = Get-Content 'package.json' | ConvertFrom-Json

    # Check for required scripts
    $RequiredScripts = @('test', 'lint', 'lint:fix')
    foreach ($script in $RequiredScripts) {
        if (-not $packageJson.scripts.$script) {
            Write-Verbose-Line "✗ Missing script: $script"
            $PkgIssues++
            $IssuesFound++
        } else {
            Write-Verbose-Line "✓ Script found: $script"
        }
    }

    # Check for required dependencies
    $RequiredDeps = @('jest')
    foreach ($dep in $RequiredDeps) {
        if (-not $packageJson.devDependencies.$dep) {
            Write-Verbose-Line "✗ Missing dev dependency: $dep"
            $PkgIssues++
            $IssuesFound++
        } else {
            Write-Verbose-Line "✓ Dev dependency found: $dep"
        }
    }
}

if ($PkgIssues -eq 0) {
    Complete-Task 'Package.json configuration valid'
} else {
    Write-TaskWarning "$PkgIssues package.json issues found"
}

# Step 4: Check .gitignore patterns
Start-Task 'Validating .gitignore'
$GitignoreIssues = 0

if (Test-Path '.gitignore') {
    $gitignoreContent = Get-Content '.gitignore' -Raw
    $RequiredPatterns = @('node_modules/', 'coverage/', '.env', '.DS_Store', '*.log')

    foreach ($pattern in $RequiredPatterns) {
        if ($gitignoreContent -notmatch [regex]::Escape($pattern)) {
            Write-Verbose-Line "✗ Missing pattern: $pattern"
            $GitignoreIssues++
            $IssuesFound++

            if ($Fix) {
                Add-Content -Path '.gitignore' -Value $pattern
                Write-Verbose-Line "  → Added pattern: $pattern"
            }
        } else {
            Write-Verbose-Line "✓ Pattern found: $pattern"
        }
    }
}

if ($GitignoreIssues -eq 0) {
    Complete-Task '.gitignore configuration valid'
} else {
    if ($Fix) {
        Complete-Task "$GitignoreIssues .gitignore patterns added"
    } else {
        Write-TaskWarning "$GitignoreIssues .gitignore patterns missing"
    }
}

# Step 5: Run security audit
Start-Task 'Running security audit'
if ((Get-Command npm -ErrorAction SilentlyContinue) -and (Test-Path 'package.json')) {
    try {
        $auditResult = npm audit --audit-level=high 2>&1
        Write-Verbose-Line $auditResult
        Complete-Task 'No high-severity vulnerabilities found'
    } catch {
        Write-TaskWarning 'Security vulnerabilities detected'
        $IssuesFound++
    }
} else {
    Skip-Task 'Security audit (npm not available)'
}

# Summary
Write-Host ''
if ($IssuesFound -eq 0) {
    Write-CompactHeader "Project validation passed! $(Get-ElapsedTime)"
    Write-Host ''
    Write-Host 'All checks passed. Project structure is valid.'
} else {
    Write-CompactHeader "Project validation completed with issues! $(Get-ElapsedTime)"
    Write-Host ''
    Write-Host "Found $IssuesFound issues."
    if (-not $Fix) {
        Write-Host 'Run with -Fix to automatically resolve common issues.'
    }
}
