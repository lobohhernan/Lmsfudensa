# ===============================================
# Script: Aplicar migración de certificates
# ===============================================
# Ejecuta la migración 20241118_create_certificates.sql
# ===============================================

$envPath = "c:\Users\Maxi\Desktop\haha funny programing\github cosas\Lmsfudensa\frontend\.env.local"

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^VITE_SUPABASE_URL=(.*)$') {
            $SUPABASE_URL = $matches[1].Trim().TrimEnd('/')
        }
        if ($_ -match '^VITE_SUPABASE_SERVICE_ROLE_KEY=(.*)$') {
            $SERVICE_KEY = $matches[1].Trim()
        }
    }
} else {
    Write-Host "[ERROR] No se encontro .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "APLICANDO MIGRACION: certificates" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Leer el archivo SQL
$sqlPath = Join-Path $PSScriptRoot "..\supabase\migrations\20241118_create_certificates.sql"

if (-not (Test-Path $sqlPath)) {
    Write-Host "[ERROR] No se encontro el archivo de migracion" -ForegroundColor Red
    Write-Host "Ruta: $sqlPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Leyendo migracion..." -ForegroundColor Yellow
$sqlContent = Get-Content $sqlPath -Raw

Write-Host "[INFO] URL: $SUPABASE_URL" -ForegroundColor Gray
Write-Host ""

$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sqlContent
} | ConvertTo-Json

try {
    Write-Host "[EJECUTANDO] Aplicando migracion a Supabase..." -ForegroundColor Yellow
    
    # Nota: Supabase no tiene un endpoint directo para ejecutar SQL via REST
    # La forma correcta es usar Supabase Dashboard -> SQL Editor
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "INSTRUCCIONES MANUALES" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Abre Supabase Dashboard:" -ForegroundColor White
    Write-Host "   https://supabase.com/dashboard/project/_" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Ve a 'SQL Editor' en el menu lateral" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Copia y pega el contenido de:" -ForegroundColor White
    Write-Host "   backend/supabase/migrations/20241118_create_certificates.sql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Click en 'RUN' para ejecutar" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Verifica que se creo la tabla:" -ForegroundColor White
    Write-Host "   SELECT * FROM certificates LIMIT 1;" -ForegroundColor Gray
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Alternativamente, copia el SQL aqui:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $sqlContent -ForegroundColor DarkGray
    Write-Host ""
    
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona Enter para continuar..."
Read-Host
