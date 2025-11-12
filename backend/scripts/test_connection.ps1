# Script para probar conexión y mostrar datos desde VS Code
param(
    [string]$SupabaseUrl = "https://hztkspqunxeauawqcikw.supabase.co",
    [string]$ServiceRoleKey
)

Write-Host "`n🔍 PROBANDO CONEXIÓN A SUPABASE" -ForegroundColor Green
Write-Host "=" * 60

$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
}

# Consulta 1: Traer cursos (como en tu SQL)
Write-Host "`n📚 SELECT id, title, slug, category FROM courses:" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/courses?select=id,title,slug,category" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response -and $response.Count -gt 0) {
        Write-Host "`n✅ Cursos encontrados: $($response.Count)" -ForegroundColor Green
        $response | Format-Table -Property id, title, slug, category -AutoSize
        
        Write-Host "`n📋 Detalles completos:" -ForegroundColor Yellow
        $response | Format-List
    } else {
        Write-Host "⚠️  No se encontraron cursos" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Consulta 2: Traer perfiles
Write-Host "`n👤 SELECT * FROM profiles:" -ForegroundColor Cyan
try {
    $profiles = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/profiles?select=*" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($profiles -and $profiles.Count -gt 0) {
        Write-Host "`n✅ Perfiles encontrados: $($profiles.Count)" -ForegroundColor Green
        $profiles | Format-Table -Property id, email, full_name, role -AutoSize
    } else {
        Write-Host "⚠️  No se encontraron perfiles" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Consulta 3: Traer lecciones
Write-Host "`n🎥 SELECT * FROM lessons:" -ForegroundColor Cyan
try {
    $lessons = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/lessons?select=id,title,course_id,order_index" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($lessons -and $lessons.Count -gt 0) {
        Write-Host "`n✅ Lecciones encontradas: $($lessons.Count)" -ForegroundColor Green
        $lessons | Format-Table -Property id, title, order_index -AutoSize
    } else {
        Write-Host "⚠️  No se encontraron lecciones" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Consulta 4: Traer evaluaciones
Write-Host "`n📝 SELECT * FROM evaluations:" -ForegroundColor Cyan
try {
    $evals = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/evaluations?select=id,question,course_id" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($evals -and $evals.Count -gt 0) {
        Write-Host "`n✅ Evaluaciones encontradas: $($evals.Count)" -ForegroundColor Green
        $evals | Format-Table -Property id, question -AutoSize -Wrap
    } else {
        Write-Host "⚠️  No se encontraron evaluaciones" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ TEST COMPLETADO" -ForegroundColor Green
Write-Host "=" * 60
