<#
Seed script para Supabase - version limpia UNICA

Soporta:
- -DryRun: imprime payloads sin llamar a la API
- -SupabaseUrl: URL del proyecto (requerido)
- -ServiceRoleKey: clave de admin (opcional si usas env var o -DryRun)

Uso:
  powershell.exe -File backend\scripts\seed_with_admin.ps1 -SupabaseUrl "https://hztkspqunxeauawqcikw.supabase.co" -DryRun
#>

param(
    [string]$SupabaseUrl,
    [string]$ServiceRoleKey,
    [string]$Password,
    [switch]$DryRun
)

if (-not $SupabaseUrl -and $env:SUPABASE_URL) { $SupabaseUrl = $env:SUPABASE_URL }
if (-not $ServiceRoleKey -and $env:SUPABASE_SERVICE_ROLE_KEY) { $ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY }
if (-not $SupabaseUrl) { Write-Error "Debes pasar -SupabaseUrl o exportar SUPABASE_URL."; exit 1 }
if (-not $Password) { $Password = 'UnPasswordSeguro#12345' }

Write-Host "Usando SUPABASE_URL=$SupabaseUrl (DryRun=$DryRun)" -ForegroundColor Cyan

$userId = '550e8400-e29b-41d4-a716-446655440000'
$email = 'instructor@test.com'
$headers = @{}
if (-not $DryRun) {
    $headers = @{
        'apikey' = $ServiceRoleKey
        'Authorization' = 'Bearer ' + $ServiceRoleKey
        'Content-Type' = 'application/json'
        'Prefer' = 'return=representation'
    }
}

function Invoke-PostTable($table, $payload) {
    $uri = "$SupabaseUrl/rest/v1/$table"
    $json = $payload | ConvertTo-Json -Depth 10
    if ($DryRun) {
        Write-Host "[DRYRUN] POST $uri" -ForegroundColor Yellow
        Write-Host "[DRYRUN] Payload: $json" -ForegroundColor DarkYellow
        return @{ id = "dryrun-$(Get-Random)" }
    }
    return Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $json -ErrorAction Stop
}

# Crear user en Auth
try {
    $body = @{
        id = $userId
        email = $email
        password = $Password
        email_confirm = $true
    } | ConvertTo-Json
    if ($DryRun) {
        Write-Host "[DRYRUN] POST $SupabaseUrl/auth/v1/admin/users" -ForegroundColor Yellow
        Write-Host "[DRYRUN] Payload: $body" -ForegroundColor DarkYellow
        $resp = @{ id = "dryrun-user-$(Get-Random)" }
    } else {
        $resp = Invoke-RestMethod -Method Post -Uri "$SupabaseUrl/auth/v1/admin/users" -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "Usuario creado: $($resp.id)" -ForegroundColor Green
    }
}
catch {
    Write-Warning "Fallo al crear usuario: $($_.Exception.Message)"
}

# Profile
try {
    $prof = @{
        id = $userId; email = $email; full_name = 'Dr. Test Instructor'
        role = 'instructor'; bio = 'Instructor certificado en RCP.'
        avatar_url = 'https://randomuser.me/api/portraits/men/75.jpg'
    }
    $p = Invoke-PostTable -table 'profiles' -payload $prof
    Write-Host "Profile insertado: $($p.id)" -ForegroundColor Green
} catch { Write-Warning "No se pudo insertar profile: $($_.Exception.Message)" }

# Course
try {
    $course = @{
        title = 'RCP Adultos AHA 2020'; slug = 'rcp-adultos-aha-2020'
        description = 'Aprende RCP para adultos'; 
        full_description = 'Curso completo de Reanimacion Cardiopulmonar'
        image = 'https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200'
        instructor_id = $userId; price = 29900; duration = '8 horas'
        level = 'Basico'; certified = $true; students = 0; category = 'RCP'; rating = 0; reviews = 0
    }
    $c = Invoke-PostTable -table 'courses' -payload $course
    $courseId = $c.id
    Write-Host "Curso insertado: $courseId" -ForegroundColor Green
} catch { Write-Error "Fallo al insertar curso: $($_.Exception.Message)"; exit 1 }

# Lessons
$lessons = @(
    @{ title = 'Intro a RCP'; description = 'Conceptos basicos'; type = 'video'; youtube_id = 'dQw4w9WgXcQ'; duration = '15 min'; order_index = 1; locked = $false },
    @{ title = 'Anatomia'; description = 'Como funciona'; type = 'video'; youtube_id = 'dQw4w9WgXcQ'; duration = '20 min'; order_index = 2; locked = $false }
)
foreach ($l in $lessons) {
    $l.course_id = $courseId
    try {
        $res = Invoke-PostTable -table 'lessons' -payload $l
        Write-Host "Leccion insertada: $($res.id)" -ForegroundColor Green
    } catch { Write-Warning "Fallo leccion: $($_.Exception.Message)" }
}

# Evaluations
$evals = @(
    @{ question = 'Profundidad de compresiones?'; options = @('3cm','5cm','7cm','10cm'); correct_answer = 1; explanation = 'Al menos 5cm.'; question_order = 1 }
)
foreach ($e in $evals) {
    $e.course_id = $courseId
    try {
        $res = Invoke-PostTable -table 'evaluations' -payload $e
        Write-Host "Evaluacion insertada: $($res.id)" -ForegroundColor Green
    } catch { Write-Warning "Fallo evaluacion: $($_.Exception.Message)" }
}

Write-Host "
OK - Seed completado (DryRun=$DryRun)" -ForegroundColor Cyan
