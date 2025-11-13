# ========================================
# SCRIPT DE VERIFICACIÓN POST-FIX RLS
# ========================================
# Ejecutar DESPUÉS de aplicar FIX_ALL_RLS_CLEAN.sql
# ========================================

$url = "https://hztkspqunxeauawqcikw.supabase.co"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MjY4NzAsImV4cCI6MjA0NjUwMjg3MH0.m2E40wpGFoM1W-TpkMX_3izYd_5RjXd-ddfG8cQSrZc"
$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
}

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     VERIFICACIÓN POST-FIX RLS" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$allPassed = $true

# Test 1: Profiles
Write-Host "📋 Test 1: Tabla PROFILES..." -ForegroundColor Yellow
try {
    $profiles = Invoke-RestMethod -Uri "$url/rest/v1/profiles?select=id,name,role&limit=5" -Headers $headers -Method Get
    Write-Host "   ✅ ÉXITO: $($profiles.Count) registros leídos" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FALLO: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 2: Courses
Write-Host "📚 Test 2: Tabla COURSES..." -ForegroundColor Yellow
try {
    $courses = Invoke-RestMethod -Uri "$url/rest/v1/courses?select=id,title,price&limit=5" -Headers $headers -Method Get
    Write-Host "   ✅ ÉXITO: $($courses.Count) registros leídos" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FALLO: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 3: Lessons (EL MÁS IMPORTANTE)
Write-Host "📖 Test 3: Tabla LESSONS..." -ForegroundColor Yellow
try {
    $lessons = Invoke-RestMethod -Uri "$url/rest/v1/lessons?select=*" -Headers $headers -Method Get
    Write-Host "   ✅ ÉXITO: $($lessons.Count) registros leídos" -ForegroundColor Green
    if ($lessons.Count -eq 0) {
        Write-Host "   ℹ️  Tabla vacía (normal si no has insertado lecciones)" -ForegroundColor Cyan
    } else {
        Write-Host "   📊 Lecciones encontradas:" -ForegroundColor Cyan
        $lessons | Select-Object id, title, order_index, duration | Format-Table
    }
} catch {
    Write-Host "   ❌ FALLO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   ⚠️  Si ves ERROR 401, el fix NO se aplicó correctamente" -ForegroundColor Red
    $allPassed = $false
}

# Test 4: Evaluations
Write-Host "📝 Test 4: Tabla EVALUATIONS..." -ForegroundColor Yellow
try {
    $evals = Invoke-RestMethod -Uri "$url/rest/v1/evaluations?select=*&limit=5" -Headers $headers -Method Get
    Write-Host "   ✅ ÉXITO: $($evals.Count) registros leídos" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FALLO: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 5: Course Requirements
Write-Host "📌 Test 5: Tabla COURSE_REQUIREMENTS..." -ForegroundColor Yellow
try {
    $reqs = Invoke-RestMethod -Uri "$url/rest/v1/course_requirements?select=*&limit=5" -Headers $headers -Method Get
    Write-Host "   ✅ ÉXITO: $($reqs.Count) registros leídos" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FALLO: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 6: Course Learning Outcomes
Write-Host "🎯 Test 6: Tabla COURSE_LEARNING_OUTCOMES..." -ForegroundColor Yellow
try {
    $outcomes = Invoke-RestMethod -Uri "$url/rest/v1/course_learning_outcomes?select=*&limit=5" -Headers $headers -Method Get
    Write-Host "   ✅ ÉXITO: $($outcomes.Count) registros leídos" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FALLO: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Resumen final
Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "     ✅ TODAS LAS PRUEBAS PASARON" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "`n🎉 El fix RLS se aplicó correctamente!" -ForegroundColor Green
    Write-Host "📝 Ahora puedes insertar lecciones sin errores" -ForegroundColor Green
    Write-Host "`nComando para insertar lecciones:" -ForegroundColor Yellow
    Write-Host @"
INSERT INTO public.lessons (course_id, title, description, order_index, duration, type)
VALUES 
  ('92ff6a2c-5441-469b-b5e6-46565ea0b651', 'Introducción al curso', 'Bienvenida y presentación', 1, '10 min', 'video'),
  ('92ff6a2c-5441-469b-b5e6-46565ea0b651', 'Conceptos básicos', 'Fundamentos necesarios', 2, '25 min', 'video'),
  ('92ff6a2c-5441-469b-b5e6-46565ea0b651', 'Práctica guiada', 'Ejercicios paso a paso', 3, '30 min', 'video');
"@ -ForegroundColor White
} else {
    Write-Host "     ❌ ALGUNAS PRUEBAS FALLARON" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "`n⚠️  El fix RLS NO se aplicó correctamente" -ForegroundColor Red
    Write-Host "📋 Verifica que ejecutaste TODO el script FIX_ALL_RLS_CLEAN.sql" -ForegroundColor Yellow
    Write-Host "🔗 URL: https://supabase.com/dashboard/project/hztkspqunxeauawqcikw/sql" -ForegroundColor Cyan
}
Write-Host "`n"
