# Verificar si existe la tabla certificates en Supabase

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
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO TABLA CERTIFICATES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

# Test 1: Verificar si la tabla existe
Write-Host "[1] Verificando si la tabla certificates existe..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/certificates?limit=1" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "[OK] La tabla certificates EXISTE" -ForegroundColor Green
    Write-Host "    Registros actuales: $($response.Count)" -ForegroundColor Gray
    
    if ($response.Count -gt 0) {
        Write-Host ""
        Write-Host "Ejemplo de certificado:" -ForegroundColor Cyan
        $response[0] | ConvertTo-Json
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "[ERROR] HTTP $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 404) {
        Write-Host "" -ForegroundColor Red
        Write-Host "LA TABLA CERTIFICATES NO EXISTE" -ForegroundColor Red
        Write-Host "" -ForegroundColor Red
        Write-Host "SOLUCION:" -ForegroundColor Yellow
        Write-Host "1. Abre Supabase Dashboard" -ForegroundColor White
        Write-Host "2. Ve a SQL Editor" -ForegroundColor White
        Write-Host "3. Ejecuta: backend/supabase/migrations/20241118_create_certificates.sql" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

# Test 2: Verificar función generate_certificate_hash
Write-Host ""
Write-Host "[2] Verificando funcion generate_certificate_hash..." -ForegroundColor Yellow

try {
    $hashResponse = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/rpc/generate_certificate_hash" `
        -Method Post `
        -Headers $headers `
        -Body "{}" `
        -ErrorAction Stop
    
    Write-Host "[OK] Funcion generate_certificate_hash funciona" -ForegroundColor Green
    Write-Host "    Hash generado: $hashResponse" -ForegroundColor Gray
    
} catch {
    Write-Host "[ERROR] Funcion generate_certificate_hash NO existe" -ForegroundColor Red
    Write-Host "    Ejecuta la migracion completa" -ForegroundColor Yellow
}

# Test 3: Contar certificados totales
Write-Host ""
Write-Host "[3] Contando certificados en la BD..." -ForegroundColor Yellow

try {
    $countResponse = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/certificates?select=*&count=exact" `
        -Method Head `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "[INFO] Total de certificados en BD: $($countResponse.Count)" -ForegroundColor Cyan
    
} catch {
    Write-Host "[ERROR] No se pudo contar certificados" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si la tabla existe pero no aparecen certificados:" -ForegroundColor Yellow
Write-Host "1. Verifica que hayas completado una evaluacion" -ForegroundColor White
Write-Host "2. Revisa la consola del navegador (F12)" -ForegroundColor White
Write-Host "3. Busca errores en la emision del certificado" -ForegroundColor White
Write-Host ""
