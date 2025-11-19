# Script para mostrar el user_id actual y los certificados

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
Write-Host "DEBUG: CERTIFICADOS Y USUARIOS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Primero, mostrar TODOS los certificados
$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

Write-Host "[INFO] Todos los certificados en la BD:" -ForegroundColor Yellow

try {
    $certs = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/certificates?select=*" `
        -Method Get `
        -Headers $headers
    
    Write-Host ""
    foreach ($cert in $certs) {
        Write-Host "  Certificado ID: $($cert.id)" -ForegroundColor Cyan
        Write-Host "  Student ID: $($cert.student_id)" -ForegroundColor White
        Write-Host "  Curso: $($cert.course_title)" -ForegroundColor White
        Write-Host "  Estudiante: $($cert.student_name)" -ForegroundColor White
        Write-Host "  Hash: $($cert.hash.Substring(0, 16))..." -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "Total: $($certs.Count) certificado(s)" -ForegroundColor Green
    
} catch {
    Write-Host "[ERROR] No se pudieron cargar certificados" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SIGUIENTE PASO:" -ForegroundColor Yellow
Write-Host "1. Abre la app en http://localhost:3001" -ForegroundColor White
Write-Host "2. Abre la consola (F12)" -ForegroundColor White
Write-Host "3. Ve a Perfil -> Mis Certificados" -ForegroundColor White
Write-Host "4. Busca el log: '[UserProfile] Cargando certificados para userId:'" -ForegroundColor White
Write-Host "5. Copia el userId y comparalo con el student_id de arriba" -ForegroundColor White
Write-Host ""
