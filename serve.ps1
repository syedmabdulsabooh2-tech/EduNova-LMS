# EduNova LMS - Local Static Server for Windows
# Run with: powershell -ExecutionPolicy Bypass -File serve.ps1
$port = 3000
$folder = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  EduNova LMS - Local Web Server" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Serving files from: $folder" -ForegroundColor Yellow
Write-Host "Local URL: http://localhost:$port" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server.`n" -ForegroundColor DarkGray

# Check if Python is available
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Launching with Python http.server..." -ForegroundColor Green
    python -m http.server $port --directory $folder
    exit
}

# Check if npx is available
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "Launching with npx serve..." -ForegroundColor Green
    npx serve $folder -p $port
    exit
}

# Fallback: Open index.html directly in the default browser
Write-Host "Opening index.html in your default web browser..." -ForegroundColor Cyan
Start-Process "$folder\index.html"
