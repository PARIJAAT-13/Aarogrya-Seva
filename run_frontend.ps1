Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting AarogyaSeva React Vite Frontend on port 5173..." -ForegroundColor Green
Write-Host "Application URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"
npm run dev -- --host

