# Ver lecciones de un curso específico
param(
    [string]$ServiceRoleKey,
    [string]$CourseSlug = "rcp-adultos-aha-2020"
)

$url = "https://hztkspqunxeauawqcikw.supabase.co"
$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
}

Write-Host ""
Write-Host "========================================"
Write-Host "  LECCIONES DEL CURSO: $CourseSlug"
Write-Host "========================================" 
Write-Host ""

# Primero obtenemos el curso
Write-Host "Buscando curso..." -ForegroundColor Cyan
try {
    $course = Invoke-RestMethod -Uri "$url/rest/v1/courses?slug=eq.$CourseSlug&select=id,title" -Headers $headers
    
    if ($course.Count -eq 0) {
        Write-Host "No se encontro el curso con slug: $CourseSlug" -ForegroundColor Red
        exit
    }
    
    $courseId = $course[0].id
    $courseTitle = $course[0].title
    
    Write-Host "Curso encontrado: $courseTitle" -ForegroundColor Green
    Write-Host "ID: $courseId" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Error al buscar curso: $_" -ForegroundColor Red
    exit
}

# Ahora traemos las lecciones
Write-Host "Obteniendo lecciones..." -ForegroundColor Cyan
Write-Host ""

try {
    $lessons = Invoke-RestMethod -Uri "$url/rest/v1/lessons?course_id=eq.$courseId&select=*&order=order_index.asc" -Headers $headers
    
    if ($lessons.Count -eq 0) {
        Write-Host "No hay lecciones para este curso" -ForegroundColor Yellow
        exit
    }
    
    Write-Host "Total de lecciones: $($lessons.Count)" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar tabla con todas las columnas
    $lessons | Format-Table id, order_index, title, type, youtube_id, duration, locked, completed -AutoSize
    
    Write-Host ""
    Write-Host "Detalles de cada leccion:" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($lesson in $lessons) {
        Write-Host "[$($lesson.order_index)] $($lesson.title)" -ForegroundColor Yellow
        Write-Host "  ID: $($lesson.id)" -ForegroundColor Gray
        Write-Host "  Tipo: $($lesson.type)" -ForegroundColor Gray
        Write-Host "  Duracion: $($lesson.duration)" -ForegroundColor Gray
        Write-Host "  YouTube ID: $($lesson.youtube_id)" -ForegroundColor Gray
        Write-Host "  Bloqueada: $($lesson.locked)" -ForegroundColor Gray
        Write-Host "  Completada: $($lesson.completed)" -ForegroundColor Gray
        if ($lesson.description) {
            Write-Host "  Descripcion: $($lesson.description)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
} catch {
    Write-Host "Error al obtener lecciones: $_" -ForegroundColor Red
}

Write-Host "========================================"
Write-Host "  CONSULTA COMPLETADA"
Write-Host "========================================"
Write-Host ""
