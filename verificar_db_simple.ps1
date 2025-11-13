# ========================================
# Script de Verificación Simple de Base de Datos
# LMS FUDENSA
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DIAGNÓSTICO DE BASE DE DATOS - LMS FUDENSA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$TestsPassed = 0
$TestsFailed = 0

# Test 1: Verificar motor de BD
Write-Host "`n[TEST 1] Motor de Base de Datos" -ForegroundColor Yellow
if (Test-Path ".\frontend\package.json") {
    $pkg = Get-Content ".\frontend\package.json" | ConvertFrom-Json
    if ($pkg.dependencies."@supabase/supabase-js") {
        Write-Host "  OK - Supabase detectado" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  FAIL - No se encontró Supabase" -ForegroundColor Red
        $TestsFailed++
    }
} else {
    Write-Host "  FAIL - package.json no encontrado" -ForegroundColor Red
    $TestsFailed++
}

# Test 2: Verificar .env.local
Write-Host "`n[TEST 2] Archivo de configuración" -ForegroundColor Yellow
if (Test-Path ".\frontend\.env.local") {
    Write-Host "  OK - .env.local encontrado" -ForegroundColor Green
    $TestsPassed++
    
    $envContent = Get-Content ".\frontend\.env.local" -Raw
    $url = ""
    $key = ""
    
    if ($envContent -match "VITE_SUPABASE_URL=(.+)") {
        $url = $matches[1].Trim()
        Write-Host "  OK - URL configurada" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  FAIL - URL no encontrada" -ForegroundColor Red
        $TestsFailed++
    }
    
    if ($envContent -match "VITE_SUPABASE_ANON_KEY=(.+)") {
        $key = $matches[1].Trim()
        Write-Host "  OK - ANON_KEY configurada" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  FAIL - ANON_KEY no encontrada" -ForegroundColor Red
        $TestsFailed++
    }
} else {
    Write-Host "  FAIL - .env.local no encontrado" -ForegroundColor Red
    $TestsFailed++
    $url = ""
    $key = ""
}

# Test 3: Conectividad HTTP
Write-Host "`n[TEST 3] Conectividad a Supabase" -ForegroundColor Yellow
if ($url) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  OK - Servidor responde (HTTP $($response.StatusCode))" -ForegroundColor Green
        $TestsPassed++
    } catch {
        Write-Host "  FAIL - No se puede conectar: $($_.Exception.Message)" -ForegroundColor Red
        $TestsFailed++
    }
} else {
    Write-Host "  SKIP - URL no disponible" -ForegroundColor Gray
}

# Test 4: Consulta a tabla profiles
Write-Host "`n[TEST 4] REST API - Tabla profiles" -ForegroundColor Yellow
if ($url -and $key) {
    try {
        $headers = @{
            "apikey" = $key
            "Authorization" = "Bearer $key"
        }
        $selectQuery = "select=id,email,role"
        $limitQuery = "limit=5"
        $fullUri = "$url/rest/v1/profiles?" + $selectQuery + "`&" + $limitQuery
        
        $result = Invoke-RestMethod -Uri $fullUri -Headers $headers -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($result) {
            $count = if ($result -is [array]) { $result.Count } else { 1 }
            Write-Host "  OK - $count perfiles encontrados" -ForegroundColor Green
            $TestsPassed++
        } else {
            Write-Host "  WARNING - Consulta exitosa pero sin datos" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  FAIL - Error en consulta" -ForegroundColor Red
        Write-Host "    └─ $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host "    └─ CAUSA PROBABLE: Políticas RLS bloquean acceso anónimo" -ForegroundColor Yellow
        $TestsFailed++
    }
} else {
    Write-Host "  SKIP - Credenciales no disponibles" -ForegroundColor Gray
}

# Test 5: Consulta a tabla courses
Write-Host "`n[TEST 5] REST API - Tabla courses" -ForegroundColor Yellow
if ($url -and $key) {
    try {
        $headers = @{
            "apikey" = $key
            "Authorization" = "Bearer $key"
        }
        $selectQuery = "select=id,title"
        $fullUri = "$url/rest/v1/courses?" + $selectQuery
        
        $result = Invoke-RestMethod -Uri $fullUri -Headers $headers -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($result) {
            $count = if ($result -is [array]) { $result.Count } else { 1 }
            Write-Host "  OK - $count cursos encontrados" -ForegroundColor Green
            $TestsPassed++
        } else {
            Write-Host "  WARNING - Consulta exitosa pero sin datos" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  FAIL - Error en consulta" -ForegroundColor Red
        Write-Host "    └─ $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host "    └─ CAUSA PROBABLE: Políticas RLS bloquean acceso anónimo" -ForegroundColor Yellow
        $TestsFailed++
    }
} else {
    Write-Host "  SKIP - Credenciales no disponibles" -ForegroundColor Gray
}

# Test 6: Verificar cliente Supabase
Write-Host "`n[TEST 6] Código del cliente Supabase" -ForegroundColor Yellow
if (Test-Path ".\frontend\src\lib\supabase.ts") {
    $supabaseCode = Get-Content ".\frontend\src\lib\supabase.ts" -Raw
    if ($supabaseCode -match "import\.meta\.env\.VITE_SUPABASE") {
        Write-Host "  OK - Cliente usa variables de entorno" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  WARNING - Cliente podría tener valores hardcoded" -ForegroundColor Yellow
    }
} else {
    Write-Host "  FAIL - supabase.ts no encontrado" -ForegroundColor Red
    $TestsFailed++
}

# Test 7: Verificar AdminPanel
Write-Host "`n[TEST 7] AdminPanel.tsx" -ForegroundColor Yellow
if (Test-Path ".\frontend\src\pages\AdminPanel.tsx") {
    $adminCode = Get-Content ".\frontend\src\pages\AdminPanel.tsx" -Raw
    if ($adminCode -match 'from\("profiles"\)\.select' -or $adminCode -match "from\(`"profiles`"\)\.select") {
        Write-Host "  OK - AdminPanel consulta profiles" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  WARNING - No se encuentra query a profiles" -ForegroundColor Yellow
    }
    
    if ($adminCode -match "console\.log") {
        Write-Host "  OK - Tiene logging para debug" -ForegroundColor Green
    } else {
        Write-Host "  WARNING - Sin logging de debug" -ForegroundColor Yellow
    }
} else {
    Write-Host "  FAIL - AdminPanel.tsx no encontrado" -ForegroundColor Red
    $TestsFailed++
}

# Test 8: Scripts SQL
Write-Host "`n[TEST 8] Scripts de migración SQL" -ForegroundColor Yellow
$sqlScripts = @(
    ".\backend\supabase\migrations\20241107_initial_schema.sql",
    ".\backend\supabase\migrations\20241108_enhance_schema.sql",
    ".\backend\supabase\fix_rls_policies.sql"
)

$sqlFound = 0
foreach ($script in $sqlScripts) {
    if (Test-Path $script) {
        $sqlFound++
    }
}

if ($sqlFound -eq $sqlScripts.Count) {
    Write-Host "  OK - Todos los scripts SQL encontrados ($sqlFound/$($sqlScripts.Count))" -ForegroundColor Green
    $TestsPassed++
} elseif ($sqlFound -gt 0) {
    Write-Host "  WARNING - Algunos scripts no encontrados ($sqlFound/$($sqlScripts.Count))" -ForegroundColor Yellow
} else {
    Write-Host "  FAIL - No se encontraron scripts SQL" -ForegroundColor Red
    $TestsFailed++
}

# RESUMEN
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host " RESUMEN" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Tests pasados: $TestsPassed" -ForegroundColor Green
Write-Host "Tests fallidos: $TestsFailed" -ForegroundColor Red

# DIAGNÓSTICO
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " DIAGNÓSTICO Y SOLUCIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($TestsFailed -gt 0) {
    Write-Host "`nPROBLEMA PRINCIPAL:" -ForegroundColor Red
    Write-Host "  Las políticas RLS (Row Level Security) de Supabase están bloqueando" -ForegroundColor Yellow
    Write-Host "  el acceso anónimo a las tablas profiles y courses." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUCIÓN:" -ForegroundColor Green
    Write-Host "  1. Abre Supabase Dashboard:" -ForegroundColor White
    Write-Host "     https://supabase.com/dashboard/project/hztkspqunxeauawqcikw" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Ve a SQL Editor" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. Ejecuta el archivo:" -ForegroundColor White
    Write-Host "     backend\supabase\FIX_RLS_FOR_ADMIN_DASHBOARD.sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  4. Esto permitirá lectura pública de profiles/courses" -ForegroundColor White
    Write-Host "     (Solo para desarrollo - Ver notas de seguridad en el archivo)" -ForegroundColor Gray
} else {
    Write-Host "`nTODOS LOS TESTS PASARON" -ForegroundColor Green
    Write-Host "  Si AdminPanel aún no muestra datos:" -ForegroundColor Yellow
    Write-Host "  1. Abre la consola del navegador (F12)" -ForegroundColor White
    Write-Host "  2. Busca errores en la pestaña Console" -ForegroundColor White
    Write-Host "  3. Verifica la pestaña Network para ver las requests a Supabase" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " FIN DEL DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
