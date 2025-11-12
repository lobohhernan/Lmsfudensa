# Test de conexión - Muestra datos en consola de VS Code
param([string]$ServiceRoleKey)

$url = "https://hztkspqunxeauawqcikw.supabase.co"
$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  TEST DE CONEXION A SUPABASE" -ForegroundColor Green  
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📚 CURSOS (SELECT id, title, slug, category):`n" -ForegroundColor Cyan
try {
    $courses = Invoke-RestMethod -Uri "$url/rest/v1/courses?select=id,title,slug,category" -Headers $headers
    if ($courses.Count -gt 0) {
        $courses | Format-Table id, title, slug, category -AutoSize
        Write-Host "Total: $($courses.Count) curso(s)`n" -ForegroundColor Green
    } else {
        Write-Host "No hay cursos`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_`n" -ForegroundColor Red
}

Write-Host "👤 PERFILES (SELECT *):`n" -ForegroundColor Cyan
try {
    $profiles = Invoke-RestMethod -Uri "$url/rest/v1/profiles" -Headers $headers
    if ($profiles.Count -gt 0) {
        $profiles | Format-Table id, email, full_name, role -AutoSize
        Write-Host "Total: $($profiles.Count) perfil(es)`n" -ForegroundColor Green
    } else {
        Write-Host "No hay perfiles`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_`n" -ForegroundColor Red
}

Write-Host "🎥 LECCIONES (SELECT *):`n" -ForegroundColor Cyan
try {
    $lessons = Invoke-RestMethod -Uri "$url/rest/v1/lessons?select=id,title,duration,order_index" -Headers $headers
    if ($lessons.Count -gt 0) {
        $lessons | Format-Table id, title, duration, order_index -AutoSize
        Write-Host "Total: $($lessons.Count) lección(es)`n" -ForegroundColor Green
    } else {
        Write-Host "No hay lecciones`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_`n" -ForegroundColor Red
}

Write-Host "📝 EVALUACIONES (SELECT *):`n" -ForegroundColor Cyan
try {
    $evaluations = Invoke-RestMethod -Uri "$url/rest/v1/evaluations?select=id,question" -Headers $headers
    if ($evaluations.Count -gt 0) {
        Write-Host "Preguntas encontradas:" -ForegroundColor Gray
        foreach($eval in $evaluations) {
            Write-Host "  - $($eval.question)" -ForegroundColor Gray
        }
        Write-Host "`nTotal: $($evaluations.Count) evaluación(es)`n" -ForegroundColor Green
    } else {
        Write-Host "No hay evaluaciones`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_`n" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ TEST COMPLETADO" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
