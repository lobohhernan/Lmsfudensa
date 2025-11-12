#!/usr/bin/env pwsh
# Script para ejecutar el seed via REST API de Supabase

param(
    [Parameter(Mandatory=$true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceRoleKey
)

$ErrorActionPreference = "Continue"

Write-Host "`n🌱 EJECUTANDO SEED DE BASE DE DATOS" -ForegroundColor Green
Write-Host "=" * 50

# Configurar headers
$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

$userId = "550e8400-e29b-41d4-a716-446655440000"

# ====================================
# PASO 1: Crear perfil de instructor
# ====================================
Write-Host "`n📝 Paso 1/4: Insertando perfil de instructor..." -ForegroundColor Cyan

$profileData = @{
    id = $userId
    email = "instructor@test.com"
    full_name = "Dr. Test Instructor"
    role = "instructor"
}

try {
    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/profiles" `
        -Method Post `
        -Headers $headers `
        -Body ($profileData | ConvertTo-Json)
    
    Write-Host "   ✅ Perfil creado exitosamente" -ForegroundColor Green
    Write-Host "   📧 Email: $($response.email)" -ForegroundColor Gray
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Host "   ⚠️  Perfil ya existe (se omite)" -ForegroundColor Yellow
    }
    else {
        Write-Host "   ❌ Error HTTP $statusCode" -ForegroundColor Red
        Write-Host "   Detalles: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ====================================
# PASO 2: Crear curso
# ====================================
Write-Host "`n📚 Paso 2/4: Insertando curso 'RCP Adultos AHA 2020'..." -ForegroundColor Cyan

$courseData = @{
    title = "RCP Adultos AHA 2020 - Reanimación Cardiopulmonar"
    slug = "rcp-adultos-aha-2020"
    description = "Aprende las técnicas de RCP para adultos según las guías AHA 2020"
    full_description = "Curso completo de Reanimación Cardiopulmonar para adultos basado en las últimas guías de la American Heart Association 2020."
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
}

try {
    $courseResponse = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/courses" `
        -Method Post `
        -Headers $headers `
        -Body ($courseData | ConvertTo-Json)
    
    $courseId = $courseResponse.id
    Write-Host "   ✅ Curso creado exitosamente" -ForegroundColor Green
    Write-Host "   🆔 ID: $courseId" -ForegroundColor Gray
    Write-Host "   📖 Título: $($courseResponse.title)" -ForegroundColor Gray
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Host "   ⚠️  Curso ya existe, obteniendo ID..." -ForegroundColor Yellow
        
        # Obtener ID del curso existente
        try {
            $uri = "$SupabaseUrl/rest/v1/courses?slug=eq.rcp-adultos-aha-2020`&select=id"
            $existingCourse = Invoke-RestMethod -Uri $uri `
                -Method Get `
                -Headers $headers
            
            if ($existingCourse -and $existingCourse.Count -gt 0) {
                $courseId = $existingCourse[0].id
                Write-Host "   🆔 ID del curso existente: $courseId" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "   ❌ No se pudo obtener ID del curso existente" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "   ❌ Error HTTP $statusCode" -ForegroundColor Red
        Write-Host "   Detalles: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# ====================================
# PASO 3: Crear lecciones
# ====================================
Write-Host "`n🎥 Paso 3/4: Insertando lecciones..." -ForegroundColor Cyan

$lessons = @(
    @{
        course_id = $courseId
        title = "Introducción a RCP"
        description = "Conceptos básicos de reanimación cardiopulmonar"
        type = "video"
        youtube_id = "dQw4w9WgXcQ"
        duration = "15 min"
        order_index = 1
        completed = $false
        locked = $false
    },
    @{
        course_id = $courseId
        title = "Anatomía del sistema cardiovascular"
        description = "Entender el corazón y cómo funciona"
        type = "video"
        youtube_id = "dQw4w9WgXcQ"
        duration = "20 min"
        order_index = 2
        completed = $false
        locked = $false
    },
    @{
        course_id = $courseId
        title = "Compresiones torácicas efectivas"
        description = "Técnica correcta de compresiones"
        type = "video"
        youtube_id = "dQw4w9WgXcQ"
        duration = "25 min"
        order_index = 3
        completed = $false
        locked = $false
    }
)

$lessonsCreated = 0
foreach ($lesson in $lessons) {
    try {
        $lessonResponse = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/lessons" `
            -Method Post `
            -Headers $headers `
            -Body ($lesson | ConvertTo-Json)
        
        $lessonsCreated++
        Write-Host "   ✅ Lección $lessonsCreated creada: $($lesson.title)" -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 409) {
            Write-Host "   ⚠️  Lección ya existe: $($lesson.title)" -ForegroundColor Yellow
        }
        else {
            Write-Host "   ❌ Error creando lección: $($lesson.title)" -ForegroundColor Red
        }
    }
}

# ====================================
# PASO 4: Crear evaluaciones
# ====================================
Write-Host "`n📝 Paso 4/4: Insertando evaluaciones..." -ForegroundColor Cyan

$evaluations = @(
    @{
        course_id = $courseId
        question = "¿Cuál es la profundidad correcta de las compresiones torácicas en un adulto durante la RCP?"
        options = @("Al menos 3 cm", "Al menos 5 cm", "Al menos 7 cm", "Al menos 10 cm")
        correct_answer = 1
        explanation = "Las compresiones torácicas en adultos deben tener una profundidad de al menos 5 cm según las guías AHA 2020."
        question_order = 1
    },
    @{
        course_id = $courseId
        question = "¿Cuál es la frecuencia recomendada de compresiones torácicas por minuto?"
        options = @("60-80 compresiones", "80-100 compresiones", "100-120 compresiones", "120-140 compresiones")
        correct_answer = 2
        explanation = "La frecuencia óptima es de 100-120 compresiones por minuto."
        question_order = 2
    }
)

$evalsCreated = 0
foreach ($eval in $evaluations) {
    try {
        $evalResponse = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/evaluations" `
            -Method Post `
            -Headers $headers `
            -Body ($eval | ConvertTo-Json)
        
        $evalsCreated++
        Write-Host "   ✅ Evaluación $evalsCreated creada" -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 409) {
            Write-Host "   ⚠️  Evaluación ya existe" -ForegroundColor Yellow
        }
        else {
            Write-Host "   ❌ Error creando evaluación" -ForegroundColor Red
        }
    }
}

# ====================================
# VERIFICACIÓN FINAL
# ====================================
Write-Host "`n🔍 Verificando datos insertados..." -ForegroundColor Cyan

try {
    # Verificar cursos
    $uri1 = "$SupabaseUrl/rest/v1/courses?select=id,title,slug,category"
    $coursesCount = Invoke-RestMethod -Uri $uri1 `
        -Method Get `
        -Headers $headers
    
    Write-Host "`n📊 RESUMEN:" -ForegroundColor Green
    Write-Host "   📚 Cursos: $($coursesCount.Count)" -ForegroundColor White
    
    if ($coursesCount.Count -gt 0) {
        Write-Host "`n   Cursos encontrados:" -ForegroundColor Gray
        foreach ($c in $coursesCount) {
            Write-Host "   - $($c.title) | slug: $($c.slug) | categoría: $($c.category)" -ForegroundColor Gray
        }
    }
    
    # Verificar lecciones del curso
    $uri2 = "$SupabaseUrl/rest/v1/lessons?course_id=eq.$courseId`&select=title"
    $lessonsCount = Invoke-RestMethod -Uri $uri2 `
        -Method Get `
        -Headers $headers
    
    Write-Host "`n   🎥 Lecciones del curso: $($lessonsCount.Count)" -ForegroundColor White
    
    # Verificar evaluaciones
    $uri3 = "$SupabaseUrl/rest/v1/evaluations?course_id=eq.$courseId`&select=question"
    $evalsCount = Invoke-RestMethod -Uri $uri3 `
        -Method Get `
        -Headers $headers
    
    Write-Host "   📝 Evaluaciones del curso: $($evalsCount.Count)" -ForegroundColor White
    
    Write-Host "`n✅ SEED COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "=" * 50
}
catch {
    Write-Host "`n❌ Error en verificación: $($_.Exception.Message)" -ForegroundColor Red
}
