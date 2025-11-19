# Verificar acceso a user_progress

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

Write-Host "Verificando user_progress..." -ForegroundColor Cyan
Write-Host "URL: $SUPABASE_URL" -ForegroundColor Gray
Write-Host ""

$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/user_progress?limit=1" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "[OK] La tabla user_progress es accesible" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "[ERROR] HTTP $statusCode" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 406) {
        Write-Host "ERROR 406 - NOT ACCEPTABLE" -ForegroundColor Yellow
        Write-Host "Este es el mismo error del navegador" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "CAUSA:" -ForegroundColor Cyan
        Write-Host "- RLS habilitado pero sin politicas SELECT validas" -ForegroundColor White
        Write-Host ""
        Write-Host "SOLUCION:" -ForegroundColor Cyan
        Write-Host "Ejecutar CREATE_USER_PROGRESS_TABLE.sql en Supabase Dashboard" -ForegroundColor White
    }
}
