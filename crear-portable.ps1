# Script para crear paquete portable de WhiteStyles
# Ejecutar con: .\crear-portable.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Crear Paquete Portable - WhiteStyles" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$nombreZip = "WhiteStyles-Portable-$(Get-Date -Format 'yyyyMMdd').zip"
$rutaDestino = Join-Path $PSScriptRoot $nombreZip

# Archivos a incluir
$archivos = @(
    "db",
    "public",
    "routes",
    "node_modules",
    "package.json",
    "package-lock.json",
    "server.js",
    "start.ps1",
    "INSTALACION.md",
    "README.md"
)

Write-Host "Creando paquete portable..." -ForegroundColor Yellow
Write-Host "Esto puede tomar algunos minutos...`n" -ForegroundColor Gray

# Verificar que node_modules existe
if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias primero..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error al instalar dependencias" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit
    }
}

# Crear ZIP
try {
    # Crear carpeta temporal
    $tempFolder = "WhiteStyles-Temp"
    if (Test-Path $tempFolder) {
        Remove-Item $tempFolder -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempFolder | Out-Null
    
    # Copiar archivos
    foreach ($archivo in $archivos) {
        if (Test-Path $archivo) {
            Write-Host "Copiando $archivo..." -ForegroundColor Gray
            Copy-Item -Path $archivo -Destination $tempFolder -Recurse -Force
        }
    }
    
    # Crear README en la raíz del ZIP
    $readmeContent = @"
WhiteStyles - Sistema de Gestión
================================

INSTALACIÓN RÁPIDA:
-------------------

1. Instalar Node.js desde https://nodejs.org (versión LTS)
2. Extraer este archivo ZIP
3. Abrir PowerShell en la carpeta extraída
4. Ejecutar: .\start.ps1
5. Abrir navegador en: http://localhost:3000
6. Login: admin / admin123

Para más información, ver INSTALACION.md

Fecha de creación: $(Get-Date -Format 'dd/MM/yyyy HH:mm')
"@
    
    $readmeContent | Out-File -FilePath "$tempFolder\LEEME.txt" -Encoding UTF8
    
    # Comprimir
    Write-Host "`nComprimiendo archivos..." -ForegroundColor Yellow
    Compress-Archive -Path "$tempFolder\*" -DestinationPath $rutaDestino -Force
    
    # Limpiar
    Remove-Item $tempFolder -Recurse -Force
    
    $tamano = [math]::Round((Get-Item $rutaDestino).Length / 1MB, 2)
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "✓ Paquete creado exitosamente" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Archivo: $nombreZip" -ForegroundColor White
    Write-Host "Tamaño: $tamano MB" -ForegroundColor White
    Write-Host "Ubicación: $rutaDestino" -ForegroundColor White
    Write-Host "`nPuedes copiar este archivo a una USB o enviarlo por email." -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Green
    
    # Abrir carpeta
    $respuesta = Read-Host "¿Abrir carpeta donde se guardó? (S/N)"
    if ($respuesta -eq "S" -or $respuesta -eq "s") {
        explorer.exe /select,$rutaDestino
    }
    
} catch {
    Write-Host "`n✗ Error al crear el paquete: $_" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
}
