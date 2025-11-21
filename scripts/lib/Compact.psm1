# Compact Output Module for PowerShell
# Minimal vertical space usage with in-place updates and timer

# Colors and symbols
$script:Colors = @{
    Red = "`e[0;31m"
    Green = "`e[0;32m"
    Yellow = "`e[1;33m"
    Blue = "`e[0;34m"
    Cyan = "`e[0;36m"
    Gray = "`e[0;90m"
    Bold = "`e[1m"
    Reset = "`e[0m"
}

$script:Symbols = @{
    OK = "$($Colors.Green)✓$($Colors.Reset)"
    Fail = "$($Colors.Red)✗$($Colors.Reset)"
    Warn = "$($Colors.Yellow)⚠$($Colors.Reset)"
    Run = "$($Colors.Blue)▸$($Colors.Reset)"
    Cached = "$($Colors.Gray)○$($Colors.Reset)"
}

# Global state
$script:ScriptStartTime = Get-Date
$script:CurrentTask = ""
$script:VerboseMode = $false

function Enable-VerboseMode {
    $script:VerboseMode = $true
}

function Get-ElapsedTime {
    $elapsed = (Get-Date) - $script:ScriptStartTime
    return "{0:D2}:{1:D2}:{2:D2}" -f $elapsed.Hours, $elapsed.Minutes, $elapsed.Seconds
}

function Write-Timer {
    $timer = Get-ElapsedTime
    $timerText = "$($Colors.Gray)[$timer]$($Colors.Reset)"
    $pos = [Console]::WindowWidth - 11
    if ($pos -gt 0) {
        $currentPos = [Console]::CursorLeft
        [Console]::SetCursorPosition($pos, [Console]::CursorTop)
        Write-Host $timerText -NoNewline
        [Console]::SetCursorPosition($currentPos, [Console]::CursorTop)
    }
}

function Update-Status {
    param(
        [string]$Symbol,
        [string]$Message
    )

    Write-Host "`r$(' ' * [Console]::WindowWidth)" -NoNewline
    Write-Host "`r$Symbol $Message" -NoNewline
    Write-Timer
}

function Finalize-Status {
    Write-Host ""
}

function Start-Task {
    param([string]$Message)

    $script:CurrentTask = $Message
    Update-Status $Symbols.Run "$Message..."

    if ($script:VerboseMode) {
        Finalize-Status
    }
}

function Complete-Task {
    param([string]$Message = $script:CurrentTask)

    Update-Status $Symbols.OK $Message
    Finalize-Status
}

function Stop-Task {
    param([string]$Message = $script:CurrentTask)

    Update-Status $Symbols.Fail $Message
    Finalize-Status
}

function Write-TaskWarning {
    param([string]$Message = $script:CurrentTask)

    Update-Status $Symbols.Warn $Message
    Finalize-Status
}

function Skip-Task {
    param([string]$Message = $script:CurrentTask)

    Update-Status $Symbols.Cached "$Message $($Colors.Gray)(cached)$($Colors.Reset)"
    Finalize-Status
}

function Write-Verbose-Line {
    param([string]$Message)

    if ($script:VerboseMode) {
        Write-Host "  $($Colors.Gray)$Message$($Colors.Reset)"
    }
}

function Write-CompactHeader {
    param([string]$Message)

    Write-Host "$($Colors.Cyan)$($Colors.Bold)$Message$($Colors.Reset)"
}

# Export functions
Export-ModuleMember -Function @(
    'Enable-VerboseMode',
    'Get-ElapsedTime',
    'Start-Task',
    'Complete-Task',
    'Stop-Task',
    'Write-TaskWarning',
    'Skip-Task',
    'Write-Verbose-Line',
    'Write-CompactHeader'
)
