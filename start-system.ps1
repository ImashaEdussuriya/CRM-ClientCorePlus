param(
  [string]$ProjectPath
)

$ErrorActionPreference = "Stop"

if (-not $ProjectPath) {
  $ProjectPath = $PSScriptRoot
}

Write-Host "Starting ClientCore system..." -ForegroundColor Cyan

if (-not (Test-Path $ProjectPath)) {
  Write-Host "Project path not found: $ProjectPath" -ForegroundColor Red
  exit 1
}

$backendPath = Join-Path $ProjectPath "backend"
if (-not (Test-Path $backendPath)) {
  Write-Host "Backend path not found: $backendPath" -ForegroundColor Red
  exit 1
}

# Start backend and frontend in separate PowerShell windows.
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectPath'; npm start"

Write-Host "Done." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:5000"
Write-Host "Stop servers with Ctrl + C in each opened terminal window." -ForegroundColor Yellow
