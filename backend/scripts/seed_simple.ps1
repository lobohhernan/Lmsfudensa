# Script simple para seed de la base de datos
param(
    [string]$SupabaseUrl = "https://hztkspqunxeauawqcikw.supabase.co",
    [string]$ServiceRoleKey
)

Write-Host "`n🌱 SEED DE BASE DE DATOS" -ForegroundColor Green
Write-Host "=" * 50

$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
}

$userId = "550e8400-e29b-41d4-a716-446655440000"

# 1. Crear perfil
Write-Host "`n📝 Insertando perfil..." -ForegroundColor Cyan
$profileJson = @{
    id = $userId
    email = "instructor@test.com"
    full_name = "Dr. Test Instructor"
    role = "instructor"
} | ConvertTo-Json

try {
    $null = Invoke-WebRequest -Uri "$SupabaseUrl/rest/v1/profiles" -Method Post -Headers $headers -Body $profileJson -UseBasicParsing
    Write-Host "   ✅ Perfil creado" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   ⚠️ Perfil ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. Crear curso
Write-Host "`n📚 Insertando curso..." -ForegroundColor Cyan
$courseJson = @{
    title = "RCP Adultos AHA 2020 - Reanimación Cardiopulmonar"
    slug = "rcp-adultos-aha-2020"
    description = "Aprende las técnicas de RCP para adultos según las guías AHA 2020"
    full_description = "Curso completo de Reanimación Cardiopulmonar para adultos"
    image = "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200"
    instructor_id = $userId
    price = 29900
    duration = "8 horas"
    level = "Básico"
    certified = $true
    students = 0
    category = "RCP"
    rating = 0
    reviews = 0
} | ConvertTo-Json

try {
    $courseResult = Invoke-WebRequest -Uri "$SupabaseUrl/rest/v1/profiles" -Method Post -Headers $headers -Body $courseJson -UseBasicParsing
    Write-Host "   ✅ Curso creado" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   ⚠️ Curso ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✅ SEED COMPLETADO" -ForegroundColor Green
Write-Host "=" * 50
