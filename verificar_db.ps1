# ========================================
# Script de Verificación de Base de Datos
# LMS FUDENSA - Diagnóstico completo
# ========================================

param(
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsWarning = 0

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,  # "OK", "FAIL", "WARNING"
        [string]$Message
    )
    
    $icon = switch ($Status) {
        "OK"      { "✅"; $script:TestsPassed++ }
        "FAIL"    { "❌"; $script:TestsFailed++ }
        "WARNING" { "⚠️"; $script:TestsWarning++ }
    }
    
    $color = switch ($Status) {
        "OK"      { "Green" }
        "FAIL"    { "Red" }
        "WARNING" { "Yellow" }
    }
    
    Write-Host "$icon $TestName" -ForegroundColor $color
    if ($Message) {
        Write-Host "   └─ $Message" -ForegroundColor Gray
    }
}

# ========================================
# TEST 1: Detectar motor de base de datos
# ========================================
Write-TestHeader "TEST 1: Detección de Motor de Base de Datos"

$frontendPackageJson = ".\frontend\package.json"
if (Test-Path $frontendPackageJson) {
    $packageContent = Get-Content $frontendPackageJson -Raw | ConvertFrom-Json
    $hasSupabase = $packageContent.dependencies.PSObject.Properties.Name -contains "@supabase/supabase-js"
    
    if ($hasSupabase) {
        $version = $packageContent.dependencies."@supabase/supabase-js"
        Write-TestResult "Detección de motor" "OK" "Supabase JS Client v$version detectado"
    } else {
        Write-TestResult "Detección de motor" "FAIL" "No se encontró @supabase/supabase-js en package.json"
    }
} else {
    Write-TestResult "Detección de motor" "FAIL" "No se encontró frontend/package.json"
}

# ========================================
# TEST 2: Verificar archivos de entorno
# ========================================
Write-TestHeader "TEST 2: Archivos de Variables de Entorno"

$envFiles = @(
    @{ Path = ".\.env"; Required = $false },
    @{ Path = ".\.env.local"; Required = $false },
    @{ Path = ".\frontend\.env"; Required = $false },
    @{ Path = ".\frontend\.env.local"; Required = $true }
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile.Path) {
        $content = Get-Content $envFile.Path -Raw
        $hasUrl = $content -match "VITE_SUPABASE_URL|SUPABASE_URL"
        $hasKey = $content -match "VITE_SUPABASE_ANON_KEY|SUPABASE_ANON_KEY"
        
        if ($hasUrl -and $hasKey) {
            Write-TestResult "Archivo $($envFile.Path)" "OK" "Contiene URL y ANON_KEY"
        } elseif ($hasUrl -or $hasKey) {
            Write-TestResult "Archivo $($envFile.Path)" "WARNING" "Faltan algunas variables"
        } else {
            Write-TestResult "Archivo $($envFile.Path)" "WARNING" "No contiene variables de Supabase"
        }
    } else {
        if ($envFile.Required) {
            Write-TestResult "Archivo $($envFile.Path)" "FAIL" "No encontrado (REQUERIDO)"
        } else {
            Write-TestResult "Archivo $($envFile.Path)" "WARNING" "No encontrado (opcional)"
        }
    }
}

# ========================================
# TEST 3: Extraer y validar credenciales
# ========================================
Write-TestHeader "TEST 3: Validación de Credenciales"

$envLocalPath = ".\frontend\.env.local"
if (Test-Path $envLocalPath) {
    $envContent = Get-Content $envLocalPath
    $url = ($envContent | Select-String "VITE_SUPABASE_URL=(.+)").Matches.Groups[1].Value
    $key = ($envContent | Select-String "VITE_SUPABASE_ANON_KEY=(.+)").Matches.Groups[1].Value
    
    if ($url) {
        Write-Host "  URL: $url" -ForegroundColor Gray
        if ($url -match "^https://[a-z0-9]+\.supabase\.co$") {
            Write-TestResult "Formato de URL" "OK" "URL válida de Supabase"
        } else {
            Write-TestResult "Formato de URL" "WARNING" "Formato inusual (verifica que sea correcto)"
        }
    } else {
        Write-TestResult "URL de Supabase" "FAIL" "No se encontró VITE_SUPABASE_URL"
    }
    
    if ($key) {
        $keyLength = $key.Length
        Write-Host "  KEY: $($key.Substring(0, [Math]::Min(50, $keyLength)))..." -ForegroundColor Gray
        if ($key -match "^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$") {
            Write-TestResult "Formato de KEY" "OK" "JWT válido (estructura correcta)"
        } else {
            Write-TestResult "Formato de KEY" "FAIL" "No parece un JWT válido"
        }
    } else {
        Write-TestResult "Anon Key" "FAIL" "No se encontró VITE_SUPABASE_ANON_KEY"
    }
} else {
    Write-TestResult "Lectura de .env.local" "FAIL" "Archivo no encontrado"
    $url = $null
    $key = $null
}

# ========================================
# TEST 4: Conectividad HTTP a Supabase
# ========================================
Write-TestHeader "TEST 4: Conectividad HTTP"

if ($url) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-TestResult "Ping HTTP a Supabase" "OK" "StatusCode: $($response.StatusCode)"
    } catch {
        Write-TestResult "Ping HTTP a Supabase" "FAIL" $_.Exception.Message
    }
} else {
    Write-TestResult "Ping HTTP a Supabase" "FAIL" "URL no disponible (test 3 falló)"
}

# ========================================
# TEST 5: Consulta REST API - Tabla profiles
# ========================================
Write-TestHeader "TEST 5: REST API - Tabla profiles"

if ($url -and $key) {
    try {
        $headers = @{
            "apikey" = $key
            "Authorization" = "Bearer $key"
        }
        $uri = "$url/rest/v1/profiles?select=id,email,role&limit=5"
        $result = Invoke-RestMethod -Uri $uri -Headers $headers -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($result -is [array]) {
            $count = $result.Count
        } else {
            $count = 1
        }
        
        Write-TestResult "SELECT profiles" "OK" "$count registros encontrados"
        
        if ($Verbose -and $count -gt 0) {
            Write-Host "  Ejemplo de datos:" -ForegroundColor Gray
            $result | Select-Object -First 2 | Format-Table id, email, role | Out-String | Write-Host -ForegroundColor DarkGray
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-TestResult "SELECT profiles" "FAIL" "HTTP $statusCode - $($_.Exception.Message)"
        Write-Host "  └─ Posible causa: Políticas RLS bloquean acceso anónimo" -ForegroundColor Yellow
    }
} else {
    Write-TestResult "SELECT profiles" "FAIL" "Credenciales no disponibles"
}

# ========================================
# TEST 6: Consulta REST API - Tabla courses
# ========================================
Write-TestHeader "TEST 6: REST API - Tabla courses"

if ($url -and $key) {
    try {
        $headers = @{
            "apikey" = $key
            "Authorization" = "Bearer $key"
        }
        $uri = "$url/rest/v1/courses?select=id,title,price&limit=5"
        $result = Invoke-RestMethod -Uri $uri -Headers $headers -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($result -is [array]) {
            $count = $result.Count
        } else {
            $count = 1
        }
        
        Write-TestResult "SELECT courses" "OK" "$count cursos encontrados"
        
        if ($Verbose -and $count -gt 0) {
            Write-Host "  Ejemplo de datos:" -ForegroundColor Gray
            $result | Select-Object -First 2 | Format-Table id, title, price | Out-String | Write-Host -ForegroundColor DarkGray
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-TestResult "SELECT courses" "FAIL" "HTTP $statusCode - $($_.Exception.Message)"
        Write-Host "  └─ Posible causa: Políticas RLS bloquean acceso anónimo" -ForegroundColor Yellow
    }
} else {
    Write-TestResult "SELECT courses" "FAIL" "Credenciales no disponibles"
}

# ========================================
# TEST 7: Verificar cliente Supabase en código
# ========================================
Write-TestHeader "TEST 7: Configuración del Cliente Supabase"

$supabaseTsPath = ".\frontend\src\lib\supabase.ts"
if (Test-Path $supabaseTsPath) {
    $supabaseContent = Get-Content $supabaseTsPath -Raw
    
    if ($supabaseContent -match "import\.meta\.env\.VITE_SUPABASE_URL") {
        Write-TestResult "Variables de entorno" "OK" "Cliente usa import.meta.env (correcto para Vite)"
    } else {
        Write-TestResult "Variables de entorno" "WARNING" "Cliente podría tener valores hardcoded"
    }
    
    if ($supabaseContent -match "createClient") {
        Write-TestResult "Inicialización del cliente" "OK" "createClient encontrado"
    } else {
        Write-TestResult "Inicialización del cliente" "FAIL" "No se encontró createClient"
    }
    
    # Verificar si hay fallbacks hardcoded
    if ($supabaseContent -match '\|\|\s*[''"]https://') {
        Write-TestResult "Fallback hardcoded" "WARNING" "Hay valores por defecto en el código"
        Write-Host "  └─ Si .env.local está configurado, esto no es problema" -ForegroundColor Gray
    } else {
        Write-TestResult "Fallback hardcoded" "OK" "No hay fallbacks, confía en .env.local"
    }
} else {
    Write-TestResult "Archivo supabase.ts" "FAIL" "No se encontró src/lib/supabase.ts"
}

# ========================================
# TEST 8: Verificar AdminPanel.tsx
# ========================================
Write-TestHeader "TEST 8: AdminPanel - Llamadas a Supabase"

$adminPanelPath = ".\frontend\src\pages\AdminPanel.tsx"
if (Test-Path $adminPanelPath) {
    $adminContent = Get-Content $adminPanelPath -Raw
    
    if ($adminContent -match "from\(`"profiles`"\)\.select") {
        Write-TestResult "Query profiles" "OK" "Llamada a profiles encontrada"
    } else {
        Write-TestResult "Query profiles" "WARNING" "No se encontró query a profiles"
    }
    
    if ($adminContent -match "from\(`"courses`"\)\.select") {
        Write-TestResult "Query courses" "OK" "Llamada a courses encontrada"
    } else {
        Write-TestResult "Query courses" "WARNING" "No se encontró query a courses"
    }
    
    if ($adminContent -match "console\.log.*[Cc]argar|console\.log.*[Ll]oad") {
        Write-TestResult "Logging de debug" "OK" "Hay console.log para debugging"
    } else {
        Write-TestResult "Logging de debug" "WARNING" "No hay logging, dificulta debugging"
    }
    
    if ($adminContent -match "toast\.error") {
        Write-TestResult "Manejo de errores" "OK" "toast.error encontrado"
    } else {
        Write-TestResult "Manejo de errores" "WARNING" "No se manejan errores con toast"
    }
} else {
    Write-TestResult "Archivo AdminPanel.tsx" "FAIL" "No se encontró src/pages/AdminPanel.tsx"
}

# ========================================
# TEST 9: Docker/Supabase Local
# ========================================
Write-TestHeader "TEST 9: Supabase Local (Docker)"

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-TestResult "Docker instalado" "OK" "docker.exe encontrado"
    
    try {
        $containers = docker ps -a --filter "name=supabase" --format "{{.Names}}" 2>$null
        if ($containers) {
            Write-TestResult "Contenedores Supabase" "OK" "Encontrados: $($containers -join ', ')"
        } else {
            Write-TestResult "Contenedores Supabase" "WARNING" "No hay contenedores de supabase"
            Write-Host "  └─ Estás usando Supabase Cloud (remoto), no local" -ForegroundColor Gray
        }
    } catch {
        Write-TestResult "Listar contenedores" "WARNING" "No se pudo ejecutar docker ps"
    }
} else {
    Write-TestResult "Docker instalado" "WARNING" "Docker no encontrado (normal si usas Supabase Cloud)"
}

# ========================================
# TEST 10: Archivos SQL de migración
# ========================================
Write-TestHeader "TEST 10: Migraciones y Scripts SQL"

$sqlFiles = @(
    ".\backend\supabase\migrations\20241107_initial_schema.sql",
    ".\backend\supabase\migrations\20241108_enhance_schema.sql",
    ".\backend\supabase\fix_rls_policies.sql",
    ".\backend\supabase\fix_rls_infinite_recursion.sql",
    ".\backend\supabase\FIX_RLS_FOR_ADMIN_DASHBOARD.sql"
)

foreach ($sqlFile in $sqlFiles) {
    if (Test-Path $sqlFile) {
        $sqlContent = Get-Content $sqlFile -Raw
        $fileName = Split-Path $sqlFile -Leaf
        
        if ($sqlContent -match "ROW LEVEL SECURITY") {
            Write-TestResult $fileName "OK" "Contiene políticas RLS"
        } else {
            Write-TestResult $fileName "WARNING" "No contiene políticas RLS"
        }
    } else {
        Write-TestResult (Split-Path $sqlFile -Leaf) "WARNING" "Archivo no encontrado"
    }
}

# ========================================
# RESUMEN FINAL
# ========================================
Write-Host "`n==========================================" -ForegroundColor Magenta
Write-Host " RESUMEN DE RESULTADOS" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

Write-Host "✅ Tests pasados:  $script:TestsPassed" -ForegroundColor Green
Write-Host "⚠️  Advertencias:  $script:TestsWarning" -ForegroundColor Yellow
Write-Host "❌ Tests fallidos: $script:TestsFailed" -ForegroundColor Red

$totalTests = $script:TestsPassed + $script:TestsWarning + $script:TestsFailed
$successRate = if ($totalTests -gt 0) { [math]::Round(($script:TestsPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "`nTasa de éxito: $successRate% ($script:TestsPassed/$totalTests)" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

# ========================================
# DIAGNÓSTICO Y RECOMENDACIONES
# ========================================
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " DIAGNÓSTICO Y RECOMENDACIONES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if ($script:TestsFailed -gt 0) {
    Write-Host "`n🔴 PROBLEMAS DETECTADOS:" -ForegroundColor Red
    Write-Host "  1. Si falló el test de profiles/courses:" -ForegroundColor Yellow
    Write-Host "     -> Las políticas RLS están bloqueando acceso anónimo" -ForegroundColor Gray
    Write-Host "     -> Ejecuta: backend\supabase\FIX_RLS_FOR_ADMIN_DASHBOARD.sql en Supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Si no se encuentra .env.local:" -ForegroundColor Yellow
    Write-Host "     -> Copia .env.example a .env.local" -ForegroundColor Gray
    Write-Host "     -> Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Si falló conectividad HTTP:" -ForegroundColor Yellow
    Write-Host "     -> Verifica tu conexión a Internet" -ForegroundColor Gray
    Write-Host "     -> Confirma que la URL de Supabase es correcta" -ForegroundColor Gray
}

if ($script:TestsWarning -gt 0 -and $script:TestsFailed -eq 0) {
    Write-Host "`n🟡 HAY ADVERTENCIAS:" -ForegroundColor Yellow
    Write-Host "  -> Revisa los tests marcados con advertencia" -ForegroundColor Gray
    Write-Host "  -> La mayoría son informativos, no críticos" -ForegroundColor Gray
}

if ($script:TestsFailed -eq 0 -and $script:TestsWarning -eq 0) {
    Write-Host "`n🟢 TODAS LAS PRUEBAS PASARON" -ForegroundColor Green
    Write-Host "  -> La configuración de la base de datos es correcta" -ForegroundColor Gray
    Write-Host "  -> Si AdminPanel no carga datos, verifica la consola del navegador" -ForegroundColor Gray
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Para más información, ejecuta con -Verbose" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
