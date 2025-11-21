#!/usr/bin/env pwsh
# One-Pager - Build Release Script (PowerShell)
# Creates production-ready build artifacts

[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
    [switch]$Clean,
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
Usage: .\build-release.ps1 [OPTIONS]

Build production-ready release artifacts

OPTIONS:
  -Verbose     Show detailed output
  -Clean       Clean build (remove existing artifacts)
  -Help        Show this help message

EXAMPLES:
  .\build-release.ps1              # Standard build
  .\build-release.ps1 -Clean       # Clean build
  .\build-release.ps1 -Verbose -Clean  # Verbose clean build

"@
    exit 0
}

Write-CompactHeader 'One-Pager - Build Release'

# Step 1: Clean previous build
if ($Clean) {
    Start-Task 'Cleaning previous build'
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist, build, coverage
    Complete-Task 'Build cleaned'
}

# Step 2: Install dependencies
Start-Task 'Installing dependencies'
npm ci --silent 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
Complete-Task 'Dependencies installed'

# Step 3: Run tests
Start-Task 'Running tests'
npm test --silent 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
Complete-Task 'Tests passed'

# Step 4: Run linting
Start-Task 'Running linter'
npm run lint --silent 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
Complete-Task 'Linting passed'

# Step 5: Create build directory
Start-Task 'Creating build artifacts'
New-Item -ItemType Directory -Force -Path dist | Out-Null
Copy-Item index.html dist/
Copy-Item -Recurse css dist/
Copy-Item -Recurse js dist/
Copy-Item -Recurse prompts dist/
Copy-Item -Recurse templates dist/
Copy-Item package.json dist/
Copy-Item README.md dist/
Complete-Task 'Build artifacts created'

# Step 6: Generate version info
Start-Task 'Generating version info'
$packageJson = Get-Content package.json | ConvertFrom-Json
$version = $packageJson.version
$buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$gitCommit = try { git rev-parse --short HEAD } catch { "unknown" }

$versionInfo = @{
    version = $version
    buildDate = $buildDate
    gitCommit = $gitCommit
    buildType = "release"
} | ConvertTo-Json -Depth 2

$versionInfo | Out-File -FilePath dist/version.json -Encoding UTF8
Complete-Task 'Version info generated'

# Done
Write-Host ''
Write-CompactHeader "Build complete! $(Get-ElapsedTime)"
Write-Host ''
Write-Host 'Build artifacts:'
Write-Host '  dist\                # Production build'
Write-Host '  dist\version.json    # Version information'
Write-Host ''
Write-Host 'Next steps:'
Write-Host '  cd dist && python -m http.server 8000  # Test build locally'
Write-Host ''
