# MentorAI — getlark.ai Workflow Setup
# Run once to register all workflows. Requires GETLARK_API_KEY in env.
#
# Usage:
#   $env:GETLARK_API_KEY = "your_key_here"
#   .\lark-workflows\setup.ps1

if (-not $env:GETLARK_API_KEY) {
    Write-Error "GETLARK_API_KEY is not set. Get your key from https://dashboard.getlark.ai/settings/api-keys"
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Workflows = @(
    @{ file = "mentorai-api-health.json";       group = "mentorai" },
    @{ file = "mentorai-chaos-resilience.json"; group = "mentorai" },
    @{ file = "mentorai-full-ui-flow.json";     group = "mentorai" },
    @{ file = "mentorai-lark-share.json";       group = "mentorai" }
)

Write-Host "`n[getlark.ai] Authenticating..." -ForegroundColor Cyan
npx -y @getlark/cli login --api-key $env:GETLARK_API_KEY

Write-Host "`n[getlark.ai] Creating workflow group 'mentorai'..." -ForegroundColor Cyan
npx @getlark/cli workflow-groups create --name "mentorai" 2>$null
# Ignore error if group already exists

foreach ($wf in $Workflows) {
    $path = Join-Path $ScriptDir $wf.file
    $data = Get-Content $path | ConvertFrom-Json

    Write-Host "`n[getlark.ai] Creating: $($data.name)" -ForegroundColor Yellow
    npx @getlark/cli workflows create `
        --name $data.name `
        --description $data.description `
        --mode $data.mode

    Write-Host "  Created." -ForegroundColor Green
}

Write-Host "`n[getlark.ai] All MentorAI workflows registered." -ForegroundColor Cyan
Write-Host "Run tests with: npm run test:lark" -ForegroundColor White
