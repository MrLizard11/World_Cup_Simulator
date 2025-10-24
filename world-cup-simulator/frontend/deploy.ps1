#!/usr/bin/env pwsh
param(
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "http://localhost:5134",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir
$DistPath = Join-Path $ProjectRoot "dist\world-cup-simulator"
$ConfigPath = Join-Path $DistPath "assets\config.json"

Write-Host "Building frontend..." -ForegroundColor Cyan

if ($ApiUrl -notmatch '^https?://') {
    Write-Host "ERROR: API URL must start with http:// or https://" -ForegroundColor Red
    exit 1
}

if (-not $SkipBuild) {
    Push-Location $ProjectRoot
    try {
        npm run build -- --configuration production
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Host "Build failed: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    finally {
        Pop-Location
    }
}

if (-not (Test-Path $DistPath)) {
    Write-Host "ERROR: Dist folder not found at: $DistPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $ConfigPath)) {
    Write-Host "ERROR: Config file not found at: $ConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "Updating config with API URL: $ApiUrl" -ForegroundColor Yellow
$config = @{ apiUrl = $ApiUrl }
$config | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigPath -Encoding UTF8

Write-Host "Done!" -ForegroundColor Green
