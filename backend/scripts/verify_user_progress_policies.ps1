# ===============================================
# Script: Verificar políticas de user_progress
# ===============================================
# Verifica si existen las políticas RLS en la tabla user_progress
# y si están configuradas correctamente
# ===============================================

# Obtener variables desde .env.local en frontend
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
    Write-Host "❌ No se encontró .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN user_progress" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: $SUPABASE_URL" -ForegroundColor Gray
Write-Host ""

$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

# Intentar acceder a la tabla user_progress
Write-Host "🔍 Verificando acceso a user_progress..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/user_progress?limit=1" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ La tabla user_progress es accesible" -ForegroundColor Green
    Write-Host "   Registros de prueba: $($response.Count)" -ForegroundColor Gray
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "❌ Error HTTP $statusCode al acceder a user_progress" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 406) {
        Write-Host "⚠️  ERROR 406 - NOT ACCEPTABLE" -ForegroundColor Yellow
        Write-Host "Este es el MISMO error que aparece en tu navegador." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔍 DIAGNÓSTICO:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "El error 406 en Supabase generalmente significa:" -ForegroundColor White
        Write-Host "1. ❌ Row Level Security (RLS) está habilitado" -ForegroundColor Gray
        Write-Host "2. ❌ Pero NO hay políticas que permitan SELECT" -ForegroundColor Gray
        Write-Host "3. ❌ O las políticas existentes no coinciden con el usuario actual" -ForegroundColor Gray
        Write-Host ""
        Write-Host "💡 SOLUCIÓN:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Opción 1: Crear políticas RLS correctas" -ForegroundColor Green
        Write-Host "  - Ir a Supabase Dashboard → SQL Editor" -ForegroundColor Gray
        Write-Host "  - Ejecutar: backend/supabase/CREATE_USER_PROGRESS_TABLE.sql" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Opción 2: Deshabilitar RLS temporalmente (NO recomendado en producción)" -ForegroundColor Yellow
        Write-Host "  - ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;" -ForegroundColor Gray
        Write-Host ""
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ La tabla user_progress NO existe" -ForegroundColor Red
        Write-Host "Ejecuta CREATE_USER_PROGRESS_TABLE.sql" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
