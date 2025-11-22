# Script de Inicio - WhiteStyles
# Ejecutar con: .\start.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  WhiteStyles - Sistema de Gestión" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js NO encontrado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit
}

# Verificar dependencias
if (!(Test-Path "node_modules")) {
    Write-Host "`nInstalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error al instalar dependencias" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit
    }
    Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
}

# Obtener IP local
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*'} | Select-Object -First 1).IPAddress

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Iniciando servidor..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Accede desde:" -ForegroundColor White
Write-Host "  Este equipo:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Green
if ($localIP) {
    Write-Host "  Otros equipos:" -NoNewline -ForegroundColor White
    Write-Host " http://${localIP}:3000" -ForegroundColor Green
}
Write-Host "`nUsuario: admin" -ForegroundColor Yellow
Write-Host "Contraseña: admin123" -ForegroundColor Yellow
Write-Host "`nPresiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

# Iniciar servidor
npm start
