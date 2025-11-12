# Test de conexion - Muestra datos en consola de VS Code
param([string]$ServiceRoleKey)

$url = "https://hztkspqunxeauawqcikw.supabase.co"
$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
}

Write-Host ""
Write-Host "========================================"
Write-Host "  TEST DE CONEXION A SUPABASE"
Write-Host "========================================" 
Write-Host ""

Write-Host "CURSOS (SELECT id, title, slug, category):" -ForegroundColor Cyan
Write-Host ""
try {
    $courses = Invoke-RestMethod -Uri "$url/rest/v1/courses?select=id,title,slug,category" -Headers $headers
    if ($courses.Count -gt 0) {
        $courses | Format-Table id, title, slug, category -AutoSize
        Write-Host "Total: $($courses.Count) curso(s)" -ForegroundColor Green
    } else {
        Write-Host "No hay cursos" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "PERFILES (SELECT *):" -ForegroundColor Cyan
Write-Host ""
try {
    $profiles = Invoke-RestMethod -Uri "$url/rest/v1/profiles" -Headers $headers
    if ($profiles.Count -gt 0) {
        $profiles | Format-Table id, email, full_name, role -AutoSize
        Write-Host "Total: $($profiles.Count) perfil(es)" -ForegroundColor Green
    } else {
        Write-Host "No hay perfiles" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "LECCIONES (SELECT *):" -ForegroundColor Cyan
Write-Host ""
try {
    $lessons = Invoke-RestMethod -Uri "$url/rest/v1/lessons?select=id,title,duration,order_index" -Headers $headers
    if ($lessons.Count -gt 0) {
        $lessons | Format-Table id, title, duration, order_index -AutoSize
        Write-Host "Total: $($lessons.Count) leccion(es)" -ForegroundColor Green
    } else {
        Write-Host "No hay lecciones" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "EVALUACIONES (SELECT *):" -ForegroundColor Cyan
Write-Host ""
try {
    $evaluations = Invoke-RestMethod -Uri "$url/rest/v1/evaluations?select=id,question" -Headers $headers
    if ($evaluations.Count -gt 0) {
        Write-Host "Preguntas encontradas:"
        foreach($eval in $evaluations) {
            Write-Host "  - $($eval.question)"
        }
        Write-Host ""
        Write-Host "Total: $($evaluations.Count) evaluacion(es)" -ForegroundColor Green
    } else {
        Write-Host "No hay evaluaciones" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================"
Write-Host "  TEST COMPLETADO"
Write-Host "========================================"
Write-Host ""
