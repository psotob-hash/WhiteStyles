# Script para iniciar con ngrok - WhiteStyles
# Ejecutar con: .\start-ngrok.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  WhiteStyles - Acceso Remoto (ngrok)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar si ngrok está instalado
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokPath) {
    Write-Host "ngrok no está instalado." -ForegroundColor Yellow
    Write-Host "`nOpciones de instalación:`n" -ForegroundColor White
    
    Write-Host "OPCIÓN 1 - Descargar manualmente:" -ForegroundColor Cyan
    Write-Host "  1. Ve a: https://ngrok.com/download" -ForegroundColor White
    Write-Host "  2. Descarga ngrok para Windows" -ForegroundColor White
    Write-Host "  3. Extrae ngrok.exe a esta carpeta" -ForegroundColor White
    Write-Host "  4. Vuelve a ejecutar este script`n" -ForegroundColor White
    
    Write-Host "OPCIÓN 2 - Instalar con Chocolatey:" -ForegroundColor Cyan
    Write-Host "  choco install ngrok`n" -ForegroundColor White
    
    Write-Host "OPCIÓN 3 - Instalar con winget:" -ForegroundColor Cyan
    Write-Host "  winget install ngrok`n" -ForegroundColor White
    
    Read-Host "Presiona Enter para salir"
    exit
}

Write-Host "✓ ngrok encontrado`n" -ForegroundColor Green

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion`n" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js NO encontrado" -ForegroundColor Red
    Write-Host "Instala Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit
}

# Iniciar servidor en segundo plano
Write-Host "Iniciando servidor local..." -ForegroundColor Yellow

$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    npm start
}

Start-Sleep -Seconds 5

# Iniciar ngrok
Write-Host "✓ Servidor iniciado`n" -ForegroundColor Green
Write-Host "Iniciando túnel ngrok..." -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "Tu aplicación estará accesible desde Internet" -ForegroundColor White
Write-Host "La URL será válida mientras este script esté ejecutándose`n" -ForegroundColor White

Write-Host "Credenciales de acceso:" -ForegroundColor Cyan
Write-Host "  Usuario: admin" -ForegroundColor White
Write-Host "  Contraseña: admin123`n" -ForegroundColor White

Write-Host "Presiona Ctrl+C para detener el túnel y el servidor" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

# Ejecutar ngrok
try {
    ngrok http 3000
} finally {
    Write-Host "`nDeteniendo servidor..." -ForegroundColor Yellow
    Stop-Job -Job $serverJob
    Remove-Job -Job $serverJob
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ Servidor detenido" -ForegroundColor Green
}
