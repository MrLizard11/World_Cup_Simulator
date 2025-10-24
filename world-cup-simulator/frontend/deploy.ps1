#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build and deploy the World Cup Simulator frontend with configurable API URL.

.DESCRIPTION
    This script builds the Angular frontend for production and injects the
    production API URL into the runtime config file (assets/config.json).
    This allows changing the backend host without rebuilding the application.

.PARAMETER ApiUrl
    The production API URL (e.g., https://api.yourdomain.com or http://localhost:5134).
    Default: http://localhost:5134

.PARAMETER SkipBuild
    Skip the build step and only update the config.json in an existing dist folder.
    Useful for quick config updates without a full rebuild.

.EXAMPLE
    .\deploy.ps1
    Builds with default localhost API URL.

.EXAMPLE
    .\deploy.ps1 -ApiUrl "https://api.production.com"
    Builds and sets production API URL.

.EXAMPLE
    .\deploy.ps1 -ApiUrl "https://api.staging.com" -SkipBuild
    Updates config without rebuilding (useful for testing different URLs).
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "http://localhost:5134",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir
$DistPath = Join-Path $ProjectRoot "dist\world-cup-simulator"
$ConfigPath = Join-Path $DistPath "assets\config.json"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "World Cup Simulator - Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validate API URL format
if ($ApiUrl -notmatch '^https?://') {
    Write-Host "ERROR: API URL must start with http:// or https://" -ForegroundColor Red
    Write-Host "Provided: $ApiUrl" -ForegroundColor Yellow
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  API URL: $ApiUrl" -ForegroundColor White
Write-Host "  Skip Build: $SkipBuild" -ForegroundColor White
Write-Host ""

# Step 1: Build the application (unless skipped)
if (-not $SkipBuild) {
    Write-Host "[1/3] Building Angular application for production..." -ForegroundColor Yellow
    
    Push-Location $ProjectRoot
    try {
        npm run build -- --configuration production
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
        
        Write-Host "✓ Build completed successfully" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "✗ Build failed: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[1/3] Skipping build (using existing dist folder)..." -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Verify dist folder exists
Write-Host "[2/3] Verifying build output..." -ForegroundColor Yellow

if (-not (Test-Path $DistPath)) {
    Write-Host "✗ ERROR: Dist folder not found at: $DistPath" -ForegroundColor Red
    Write-Host "  Run without -SkipBuild to create a fresh build." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Build output found at: $DistPath" -ForegroundColor Green
Write-Host ""

# Step 3: Update config.json with production API URL
Write-Host "[3/3] Injecting production API URL into config.json..." -ForegroundColor Yellow

if (-not (Test-Path $ConfigPath)) {
    Write-Host "✗ ERROR: Config file not found at: $ConfigPath" -ForegroundColor Red
    exit 1
}

$config = @{
    apiUrl = $ApiUrl
}

try {
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigPath -Encoding UTF8
    Write-Host "✓ Config updated successfully" -ForegroundColor Green
    Write-Host "  File: $ConfigPath" -ForegroundColor Gray
    Write-Host "  API URL: $ApiUrl" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "✗ Failed to update config: $_" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Preparation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review the build output in: $DistPath" -ForegroundColor White
Write-Host "  2. Deploy the contents of the dist folder to your web server" -ForegroundColor White
Write-Host "  3. Ensure your backend is running at: $ApiUrl" -ForegroundColor White
Write-Host "  4. Configure CORS on backend to allow your frontend domain" -ForegroundColor White
Write-Host ""
Write-Host "To change API URL without rebuilding:" -ForegroundColor Cyan
Write-Host '  .\deploy.ps1 -ApiUrl "https://new-url.com" -SkipBuild' -ForegroundColor Gray
Write-Host ""
