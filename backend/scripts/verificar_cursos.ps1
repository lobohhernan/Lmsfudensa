# =========================================
# Script PowerShell para verificar cursos en Supabase
# =========================================

Write-Host "🔍 Verificando cursos en Supabase..." -ForegroundColor Cyan

# Cargar variables de entorno desde .env.local
$envPath = Join-Path $PSScriptRoot "..\..\frontend\.env.local"

if (-Not (Test-Path $envPath)) {
    Write-Host "❌ Error: No se encontró el archivo .env.local en $envPath" -ForegroundColor Red
    Write-Host "   Asegúrate de tener configurado VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Cargando variables de entorno desde .env.local" -ForegroundColor Green

# Leer y parsear el archivo .env.local
$env_content = Get-Content $envPath
$SUPABASE_URL = ""
$SUPABASE_KEY = ""

foreach ($line in $env_content) {
    if ($line -match "^VITE_SUPABASE_URL=(.+)$") {
        $SUPABASE_URL = $matches[1].Trim()
    }
    if ($line -match "^VITE_SUPABASE_ANON_KEY=(.+)$") {
        $SUPABASE_KEY = $matches[1].Trim()
    }
}

if (-Not $SUPABASE_URL -or -Not $SUPABASE_KEY) {
    Write-Host "❌ Error: No se pudieron cargar las variables de Supabase" -ForegroundColor Red
    exit 1
}

Write-Host "🔗 Conectando a: $SUPABASE_URL" -ForegroundColor Cyan

# Función para hacer queries a Supabase
function Invoke-SupabaseQuery {
    param (
        [string]$Table,
        [string]$Select = "*",
        [string]$Order = "",
        [int]$Limit = 0
    )
    
    $url = "$SUPABASE_URL/rest/v1/$Table"
    $params = @("select=$Select")
    
    if ($Order) { $params += "order=$Order" }
    if ($Limit -gt 0) { $params += "limit=$Limit" }
    
    $fullUrl = "$url`?" + ($params -join "&")
    
    $headers = @{
        "apikey" = $SUPABASE_KEY
        "Authorization" = "Bearer $SUPABASE_KEY"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $fullUrl -Method Get -Headers $headers
        return $response
    }
    catch {
        Write-Host "❌ Error en la consulta: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📊 VERIFICACIÓN DE CURSOS EN BASE DE DATOS" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# 1. Obtener todos los cursos
Write-Host "1️⃣  Obteniendo todos los cursos..." -ForegroundColor Yellow
$courses = Invoke-SupabaseQuery -Table "courses" -Select "id,title,category,price,level,created_at,updated_at" -Order "created_at.desc"

if ($null -eq $courses) {
    Write-Host "   ❌ No se pudieron obtener los cursos" -ForegroundColor Red
    exit 1
}

$totalCourses = $courses.Count
Write-Host "   ✅ Total de cursos: $totalCourses" -ForegroundColor Green
Write-Host ""

if ($totalCourses -eq 0) {
    Write-Host "   ⚠️  No hay cursos en la base de datos" -ForegroundColor Yellow
    Write-Host "   💡 Crea un curso desde el AdminPanel y vuelve a ejecutar este script" -ForegroundColor Cyan
    exit 0
}

# 2. Mostrar todos los cursos
Write-Host "2️⃣  Listado de cursos:" -ForegroundColor Yellow
Write-Host ""

foreach ($course in $courses) {
    $createdAt = [DateTime]::Parse($course.created_at).ToString("dd/MM/yyyy HH:mm:ss")
    Write-Host "   📚 $($course.title)" -ForegroundColor Cyan
    Write-Host "      ID: $($course.id)" -ForegroundColor Gray
    Write-Host "      Categoría: $($course.category)" -ForegroundColor Gray
    Write-Host "      Nivel: $($course.level)" -ForegroundColor Gray
    Write-Host "      Precio: ARS `$$($course.price)" -ForegroundColor Gray
    Write-Host "      Creado: $createdAt" -ForegroundColor Gray
    Write-Host ""
}

# 3. Verificar el último curso creado
Write-Host "3️⃣  Último curso creado:" -ForegroundColor Yellow
$lastCourse = $courses[0]
$createdAt = [DateTime]::Parse($lastCourse.created_at)
$now = [DateTime]::Now
$minutesAgo = [Math]::Round(($now - $createdAt).TotalMinutes, 2)

Write-Host "   📚 $($lastCourse.title)" -ForegroundColor Green
Write-Host "      ID: $($lastCourse.id)" -ForegroundColor Gray
Write-Host "      Creado hace: $minutesAgo minutos" -ForegroundColor Gray
Write-Host ""

# 4. Verificar lecciones del último curso
Write-Host "4️⃣  Verificando lecciones del último curso..." -ForegroundColor Yellow
$lessons = Invoke-SupabaseQuery -Table "lessons" -Select "id,title,duration,type,order_index" -Order "order_index.asc"

if ($null -ne $lessons) {
    $courseLessons = $lessons | Where-Object { $_.course_id -eq $lastCourse.id }
    $lessonCount = $courseLessons.Count
    Write-Host "   ✅ Total de lecciones: $lessonCount" -ForegroundColor Green
    
    if ($lessonCount -gt 0) {
        foreach ($lesson in $courseLessons) {
            Write-Host "      📝 $($lesson.title) ($($lesson.type)) - $($lesson.duration)" -ForegroundColor Gray
        }
    }
}
Write-Host ""

# 5. Verificar evaluaciones del último curso
Write-Host "5️⃣  Verificando evaluaciones del último curso..." -ForegroundColor Yellow
$evaluations = Invoke-SupabaseQuery -Table "evaluations" -Select "id,question,question_order"

if ($null -ne $evaluations) {
    $courseEvaluations = $evaluations | Where-Object { $_.course_id -eq $lastCourse.id }
    $evalCount = $courseEvaluations.Count
    Write-Host "   ✅ Total de preguntas: $evalCount" -ForegroundColor Green
    
    if ($evalCount -gt 0) {
        foreach ($eval in $courseEvaluations) {
            $questionPreview = if ($eval.question.Length -gt 50) { 
                $eval.question.Substring(0, 50) + "..." 
            } else { 
                $eval.question 
            }
            Write-Host "      ❓ $questionPreview" -ForegroundColor Gray
        }
    }
}
Write-Host ""

# 6. Estadísticas generales
Write-Host "6️⃣  Estadísticas generales:" -ForegroundColor Yellow
$certified = ($courses | Where-Object { $_.certified -eq $true }).Count
$avgPrice = [Math]::Round(($courses | Measure-Object -Property price -Average).Average, 2)

Write-Host "   📊 Cursos certificados: $certified/$totalCourses" -ForegroundColor Gray
Write-Host "   💰 Precio promedio: ARS `$$avgPrice" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "✅ Verificación completada exitosamente" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "💡 Instrucciones adicionales:" -ForegroundColor Cyan
Write-Host "   1. Si ves cursos aqui pero no en el frontend, revisa el hook useCoursesRealtime" -ForegroundColor White
Write-Host "   2. Si NO ves cursos aqui, verifica los permisos RLS en Supabase" -ForegroundColor White
Write-Host "   3. Para ver queries SQL mas detalladas, abre backend/scripts/verificar_cursos.sql" -ForegroundColor White
Write-Host ""
