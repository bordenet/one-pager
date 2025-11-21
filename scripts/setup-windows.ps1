# One-Pager - Windows PowerShell Setup Script
# Optimized for minimal vertical space with running timer

param(
    [switch]$AutoYes,
    [switch]$Verbose,
    [switch]$Force,
    [switch]$Help
)

# Error handling
$ErrorActionPreference = "Stop"

# Show help
if ($Help) {
    Write-Host @"
Usage: .\scripts\setup-windows.ps1 [OPTIONS]

Setup script for Windows (PowerShell)

OPTIONS:
  -Verbose         Show detailed output (default: compact)
  -AutoYes         Automatically answer yes to prompts
  -Force           Force reinstall all dependencies
  -Help            Show this help message

EXAMPLES:
  .\scripts\setup-windows.ps1              # Fast setup, only install missing items
  .\scripts\setup-windows.ps1 -Verbose     # Verbose output
  .\scripts\setup-windows.ps1 -Force       # Force reinstall everything
  .\scripts\setup-windows.ps1 -Verbose -Force  # Verbose + force reinstall

PERFORMANCE:
  First run:  ~2-3 minutes (installs everything)
  Subsequent: ~5-10 seconds (checks only, skips installed)

REQUIREMENTS:
  - PowerShell 5.1+ with Administrator privileges
  - Internet connection

"@
    exit 0
}

# Navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host "One-Pager - Windows Setup" -ForegroundColor Cyan

# Cache directory for tracking installed packages
$CacheDir = Join-Path $ProjectRoot ".setup-cache"
if (!(Test-Path $CacheDir)) {
    New-Item -ItemType Directory -Path $CacheDir -Force | Out-Null
}

# Helper functions
function Test-Cached {
    param($Package)
    $CacheFile = Join-Path $CacheDir $Package
    return (Test-Path $CacheFile) -and !$Force
}

function Set-Cached {
    param($Package)
    $CacheFile = Join-Path $CacheDir $Package
    New-Item -ItemType File -Path $CacheFile -Force | Out-Null
}

function Write-Task {
    param($Message, $Status = "Running")
    $Symbol = switch ($Status) {
        "Running" { "▸" }
        "OK" { "✓" }
        "Fail" { "✗" }
        "Skip" { "○" }
        "Warn" { "⚠" }
    }

    $Color = switch ($Status) {
        "Running" { "Blue" }
        "OK" { "Green" }
        "Fail" { "Red" }
        "Skip" { "Gray" }
        "Warn" { "Yellow" }
    }

    Write-Host "$Symbol $Message" -ForegroundColor $Color
}

# Step 1: Check Chocolatey
Write-Task "Checking Chocolatey"
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Task "Installing Chocolatey"
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Task "Chocolatey installed" "OK"
} else {
    if ($Verbose) { Write-Host "  Chocolatey $(choco --version)" -ForegroundColor Gray }
    Write-Task "Chocolatey ready" "OK"
}

# Step 2: Check Node.js
Write-Task "Checking Node.js"
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Task "Installing Node.js"
    choco install nodejs -y
    refreshenv
    Set-Cached "nodejs"
    Write-Task "Node.js installed" "OK"
} else {
    if ($Verbose) { Write-Host "  Node.js $(node --version)" -ForegroundColor Gray }
    Write-Task "Node.js ready" "OK"
}

# Step 3: Check Python (for pre-commit hooks)
Write-Task "Checking Python"
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Task "Installing Python"
    choco install python -y
    refreshenv
    Set-Cached "python"
    Write-Task "Python installed" "OK"
} else {
    if ($Verbose) { Write-Host "  Python $(python --version)" -ForegroundColor Gray }
    Write-Task "Python ready" "OK"
}

# Step 4: Node.js dependencies
$PackageHash = (Get-FileHash package.json -Algorithm SHA256).Hash.Substring(0,8)
if ($Force -or !(Test-Cached "npm-deps-$PackageHash")) {
    Write-Task "Installing Node.js dependencies"
    if ($Verbose) {
        npm install
    } else {
        npm install --silent
    }
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
    Set-Cached "npm-deps-$PackageHash"
    Write-Task "Node.js dependencies installed" "OK"
} else {
    Write-Task "Node.js dependencies (cached)" "Skip"
}

# Step 5: Pre-commit hooks (handled by npm prepare script)
Write-Task "Pre-commit hooks (installed via npm)" "Skip"

# Step 6: Quick validation
Write-Task "Validating setup"
try {
    if ($Verbose) {
        npm run lint
        npm test
    } else {
        npm run lint --silent
        npm test --silent
    }
    Write-Task "Setup validated" "OK"
} catch {
    Write-Task "Validation failed" "Fail"
    exit 1
}

# Done
Write-Host ""
Write-Host "✓ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  start index.html    # Open the one-pager application"
Write-Host "  npm test            # Run tests"
Write-Host "  npm run lint        # Check code quality"
Write-Host ""
Write-Host "Run with -Verbose for detailed output, -Force to reinstall"
