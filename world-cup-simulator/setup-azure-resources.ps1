#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Creates Azure resources for World Cup Simulator deployment.

.DESCRIPTION
    This script provisions all required Azure resources:
    - Resource Group
    - SQL Server and Database
    - App Service Plan and App Service (Backend)
    - Static Web App (Frontend)
    - Configures firewall rules and connection strings

.PARAMETER ResourcePrefix
    Prefix for all resource names (default: worldcup)

.PARAMETER Location
    Azure region (default: eastus)

.PARAMETER SqlAdminPassword
    SQL Server admin password (must meet complexity requirements)

.PARAMETER Environment
    Environment name: dev or prod (default: dev)

.EXAMPLE
    .\setup-azure-resources.ps1 -SqlAdminPassword "YourStrongPass123!"

.EXAMPLE
    .\setup-azure-resources.ps1 -Environment prod -Location westus
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourcePrefix = "worldcup",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$true)]
    [ValidatePattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$')]
    [string]$SqlAdminPassword,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod')]
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

# Resource names
$envSuffix = if ($Environment -eq "prod") { "" } else { "-$Environment" }
$resourceGroup = "rg-$ResourcePrefix-simulator$envSuffix"
$sqlServer = "sql-$ResourcePrefix-simulator$envSuffix"
$sqlDatabase = "$ResourcePrefix-db$envSuffix"
$appServicePlan = "plan-$ResourcePrefix-simulator$envSuffix"
$backendAppService = "$ResourcePrefix-simulator-backend$envSuffix"
$staticWebApp = "$ResourcePrefix-simulator-frontend$envSuffix"
$sqlAdminUser = "sqladmin"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Resources Setup" -ForegroundColor Cyan
Write-Host "World Cup Simulator - $Environment Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✓ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://docs.microsoft.com/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Login check
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green
    Write-Host "  Subscription: $($account.name)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Not logged in to Azure" -ForegroundColor Red
    Write-Host "Running: az login" -ForegroundColor Yellow
    az login
}

Write-Host ""
Write-Host "Resources to be created:" -ForegroundColor Yellow
Write-Host "  Resource Group: $resourceGroup" -ForegroundColor White
Write-Host "  SQL Server: $sqlServer" -ForegroundColor White
Write-Host "  SQL Database: $sqlDatabase" -ForegroundColor White
Write-Host "  App Service Plan: $appServicePlan" -ForegroundColor White
Write-Host "  Backend App Service: $backendAppService" -ForegroundColor White
Write-Host "  Frontend Static Web App: $staticWebApp" -ForegroundColor White
Write-Host "  Location: $Location" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Proceed with resource creation? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[1/7] Creating Resource Group..." -ForegroundColor Yellow
try {
    az group create --name $resourceGroup --location $Location --output none
    Write-Host "✓ Resource Group created" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create Resource Group: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/7] Creating SQL Server..." -ForegroundColor Yellow
try {
    az sql server create `
        --name $sqlServer `
        --resource-group $resourceGroup `
        --location $Location `
        --admin-user $sqlAdminUser `
        --admin-password $SqlAdminPassword `
        --output none
    Write-Host "✓ SQL Server created: $sqlServer.database.windows.net" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create SQL Server: $_" -ForegroundColor Red
    Write-Host "Note: SQL Server names must be globally unique" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[3/7] Creating SQL Database..." -ForegroundColor Yellow
$dbTier = if ($Environment -eq "prod") { "S0" } else { "Basic" }
try {
    az sql db create `
        --resource-group $resourceGroup `
        --server $sqlServer `
        --name $sqlDatabase `
        --service-objective $dbTier `
        --backup-storage-redundancy Local `
        --output none
    Write-Host "✓ SQL Database created: $sqlDatabase (Tier: $dbTier)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create SQL Database: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/7] Configuring SQL Firewall..." -ForegroundColor Yellow
try {
    # Allow Azure services
    az sql server firewall-rule create `
        --resource-group $resourceGroup `
        --server $sqlServer `
        --name AllowAzureServices `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 0.0.0.0 `
        --output none
    
    Write-Host "✓ Firewall rule created: Allow Azure Services" -ForegroundColor Green
    
    # Optionally allow current IP
    $myIp = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content.Trim()
    az sql server firewall-rule create `
        --resource-group $resourceGroup `
        --server $sqlServer `
        --name AllowMyIP `
        --start-ip-address $myIp `
        --end-ip-address $myIp `
        --output none
    
    Write-Host "✓ Firewall rule created: Allow current IP ($myIp)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Warning: Failed to configure firewall: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/7] Creating App Service Plan..." -ForegroundColor Yellow
$planTier = if ($Environment -eq "prod") { "S1" } else { "B1" }
try {
    az appservice plan create `
        --name $appServicePlan `
        --resource-group $resourceGroup `
        --location $Location `
        --sku $planTier `
        --is-linux `
        --output none
    Write-Host "✓ App Service Plan created (SKU: $planTier)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create App Service Plan: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[6/7] Creating Backend App Service..." -ForegroundColor Yellow
try {
    az webapp create `
        --name $backendAppService `
        --resource-group $resourceGroup `
        --plan $appServicePlan `
        --runtime "DOTNET:9.0" `
        --output none
    Write-Host "✓ Backend App Service created" -ForegroundColor Green
    
    # Configure connection string
    $connectionString = "Server=tcp:$sqlServer.database.windows.net,1433;Initial Catalog=$sqlDatabase;Persist Security Info=False;User ID=$sqlAdminUser;Password=$SqlAdminPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
    
    az webapp config connection-string set `
        --name $backendAppService `
        --resource-group $resourceGroup `
        --connection-string-type SQLAzure `
        --settings DefaultConnection=$connectionString `
        --output none
    
    Write-Host "✓ Connection string configured" -ForegroundColor Green
    
    # Set environment variable
    az webapp config appsettings set `
        --name $backendAppService `
        --resource-group $resourceGroup `
        --settings ASPNETCORE_ENVIRONMENT=$Environment `
        --output none
    
    Write-Host "✓ Environment variable set: ASPNETCORE_ENVIRONMENT=$Environment" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create Backend App Service: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[7/7] Creating Frontend Static Web App..." -ForegroundColor Yellow
try {
    az staticwebapp create `
        --name $staticWebApp `
        --resource-group $resourceGroup `
        --location $Location `
        --output none
    Write-Host "✓ Static Web App created" -ForegroundColor Green
    
    # Get deployment token
    $swaToken = az staticwebapp secrets list `
        --name $staticWebApp `
        --resource-group $resourceGroup `
        --query "properties.apiKey" `
        --output tsv
    
    Write-Host "✓ Deployment token retrieved" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create Static Web App: $_" -ForegroundColor Red
    Write-Host "Note: Static Web App names must be globally unique" -ForegroundColor Yellow
    exit 1
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Resources Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""
Write-Host "Resource Details:" -ForegroundColor White
Write-Host "  Resource Group: $resourceGroup" -ForegroundColor Gray
Write-Host "  Location: $Location" -ForegroundColor Gray
Write-Host ""
Write-Host "Database:" -ForegroundColor White
Write-Host "  SQL Server: $sqlServer.database.windows.net" -ForegroundColor Gray
Write-Host "  Database: $sqlDatabase" -ForegroundColor Gray
Write-Host "  Admin User: $sqlAdminUser" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend:" -ForegroundColor White
Write-Host "  App Service: $backendAppService" -ForegroundColor Gray
Write-Host "  URL: https://$backendAppService.azurewebsites.net" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend:" -ForegroundColor White
Write-Host "  Static Web App: $staticWebApp" -ForegroundColor Gray
$swaUrl = az staticwebapp show --name $staticWebApp --resource-group $resourceGroup --query "defaultHostname" --output tsv
Write-Host "  URL: https://$swaUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Save this information for Azure DevOps pipeline configuration:" -ForegroundColor White
Write-Host ""
Write-Host "   Pipeline Variables:" -ForegroundColor Yellow
Write-Host "   - azureSubscription: [Your Azure service connection name]" -ForegroundColor Gray
Write-Host "   - resourceGroupName: $resourceGroup" -ForegroundColor Gray
Write-Host "   - sqlServerName: $sqlServer" -ForegroundColor Gray
Write-Host "   - sqlDatabaseName: $sqlDatabase" -ForegroundColor Gray
Write-Host "   - backendAppName: $backendAppService" -ForegroundColor Gray
Write-Host "   - frontendAppName: $staticWebApp" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add this secret to Azure DevOps pipeline:" -ForegroundColor White
Write-Host "   AZURE_STATIC_WEB_APPS_API_TOKEN (mark as secret)" -ForegroundColor Yellow
Write-Host "   Value: $swaToken" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update backend CORS in appsettings.Production.json:" -ForegroundColor White
Write-Host "   Add: https://$swaUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Create Azure DevOps service connection:" -ForegroundColor White
Write-Host "   Project Settings → Service connections → New → Azure Resource Manager" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Create and run the pipeline from azure-pipelines.yml" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: AZURE_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
