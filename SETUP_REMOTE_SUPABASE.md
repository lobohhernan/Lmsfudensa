# 🌐 USAR SUPABASE REMOTO (SIN INSTALAR CLI)

## ✅ Lo Que Ya Tienes

- ✅ Proyecto Supabase remoto: `wvvqgadnwhzumrvllcnq`
- ✅ URL: `https://wvvqgadnwhzumrvllcnq.supabase.co`
- ✅ Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ Acceso vía Dashboard web

---

## 📋 PASO 1: ACCEDER AL DASHBOARD

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona proyecto: `wvvqgadnwhzumrvllcnq`

**Dashboard abierto ✅**

---

## 🔨 PASO 2: CREAR LAS TABLAS (MIGRACIONES)

### Opción A: Desde SQL Editor (Recomendado)

1. En el dashboard, ve a: **SQL Editor**
2. Haz clic en: **New Query**
3. Copia TODO el contenido de: `backend/supabase/migrations/20241107_initial_schema.sql`
4. Pega en el editor
5. Haz clic en **RUN**
6. Espera a que termine

**Resultado**: Se crearon tablas `profiles`, `courses`, `lessons`

---

## 🔨 PASO 3: EJECUTAR MIGRACIONES MEJORADAS

Repite el proceso con la segunda migración:

1. **SQL Editor → New Query**
2. Copia: `backend/supabase/migrations/20241108_enhance_schema.sql`
3. Pega y **RUN**

**Resultado**: Se agregaron campos a courses, lessons, y nuevas tablas (evaluations, requirements, etc.)

---

## 🌱 PASO 4: INSERTAR DATOS DE PRUEBA

1. **SQL Editor → New Query**
2. Copia: `backend/supabase/seed.sql`
3. Pega y **RUN**

**Resultado**: Tu BD ahora tiene:
- ✅ 1 curso: "RCP Adultos AHA 2020"
- ✅ 3 lecciones
- ✅ 2 evaluaciones
- ✅ Requisitos y objetivos

---

### Alternativa (recomendada para automatizar): usar el script PowerShell

Si prefieres un flujo automático (crea el user en Auth y luego inserta las filas),
usa el script PowerShell incluido `backend/scripts/seed_with_admin.ps1`.

Requisitos:
- Define las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (ver Paso 6)
- Asegúrate de tener PowerShell instalado

Ejecución (desde la raíz del repo):

```powershell
# carga variables si usas un archivo .env (opcional)
# dot-source a un script que exporte las vars o configúralas manualmente:
$env:SUPABASE_URL = "https://wvvqgadnwhzumrvllcnq.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<tu_service_role_key_aqui>"

pwsh backend\scripts\seed_with_admin.ps1
```

El script crea el usuario en Auth (si no existe) y luego inserta `profiles`, `courses`, `lessons`, `evaluations`, `course_requirements` y `course_learning_outcomes` usando la API REST (PostgREST). Es idempotente en la medida de lo posible (usa `return=representation` y no duplicará filas si los slugs/ids existen).


## ✅ PASO 5: VERIFICAR DATOS

Ejecuta estas queries en **SQL Editor** para verificar:

### Query 1: Ver cursos
```sql
SELECT id, title, slug, category, created_at FROM public.courses;
```

### Query 2: Ver lecciones
```sql
SELECT id, title, type, duration FROM public.lessons 
ORDER BY created_at DESC LIMIT 10;
```

### Query 3: Ver evaluaciones
```sql
SELECT id, question, correct_answer FROM public.evaluations 
ORDER BY created_at DESC LIMIT 5;
```

### Query 4: Contar registros
```sql
SELECT 
  (SELECT COUNT(*) FROM public.courses) as total_courses,
  (SELECT COUNT(*) FROM public.lessons) as total_lessons,
  (SELECT COUNT(*) FROM public.evaluations) as total_evaluations;
```

**Esperado**: `total_courses: 1, total_lessons: 3, total_evaluations: 2`

---

## 🧪 PASO 6: CONFIGURAR VARIABLES DE ENTORNO

En tu proyecto, crea/actualiza: `backend/.env`

```env
SUPABASE_URL=https://wvvqgadnwhzumrvllcnq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dnFnYWRud2h6dW1ydmxsY25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODk5MTMsImV4cCI6MjA3Nzg2NTkxM30.v4uQUj8P-ozholx2XaiIV3DYnqSrC57oZ19j6NfQCNs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dnFnYWRud2h6dW1ydmxsY25xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4OTkxMywiZXhwIjoyMDc3ODY1OTEzfQ.zz8wQp1Qo5-KPQOCvD4jO6gF3VxH8zY9a1B2C3D4E5F
```

**Dónde obtener las claves**:
1. En el dashboard, ve a: **Settings → API**
2. Copia **Project URL** → SUPABASE_URL
3. Copia **Anon (public)** → SUPABASE_ANON_KEY
4. Copia **Service Role Secret** → SUPABASE_SERVICE_ROLE_KEY

---

## 🎯 PASO 7: TESTEAR ENDPOINT (SIN CLI)

Como no tienes CLI ni Docker, vamos a testear directamente el endpoint remoto con PowerShell:

### Script Simple de Testing:

```powershell
# Guarda como: test-remote.ps1

$SUPABASE_URL = "https://wvvqgadnwhzumrvllcnq.supabase.co"
$ENDPOINT = "$SUPABASE_URL/functions/v1/courses/create"

$payload = @{
    title = "Curso Test Remoto"
    slug = "curso-test-remoto-$(Get-Random)"
    category = "Test"
    description = "Probando conexión remota"
    instructorId = "550e8400-e29b-41d4-a716-446655440000"
} | ConvertTo-Json

Write-Host "🧪 Enviando request a: $ENDPOINT" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $ENDPOINT `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -ErrorAction Stop
    
    Write-Host "✅ ÉXITO - Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json
}
catch {
    Write-Host "❌ ERROR - Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Detalle: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
```

Ejecuta:
```powershell
.\test-remote.ps1
```

---

## 📊 FLUJO SIMPLIFICADO (SIN CLI)

```
Dashboard Web (supabase.com)
    ↓
SQL Editor → Crear Tablas
    ↓
SQL Editor → Insertar Datos
    ↓
Variables .env
    ↓
PowerShell Script de Testing
    ↓
Implementar Backend Functions
    ↓
Frontend + Hook
```

---

## ✨ VENTAJAS DE ESTE ENFOQUE

- ✅ No requiere instalar nada
- ✅ No requiere Docker
- ✅ No requiere CLI
- ✅ Todo en el navegador
- ✅ Tu BD está en la nube (disponible siempre)
- ✅ Puedes compartir acceso con compañeros fácilmente

---

## 🚀 PRÓXIMOS PASOS

Una vez verificado que la BD tiene datos:

1. Implementar Commit 2: types.ts
2. Implementar Commit 3: useCreateCourse.ts
3. Implementar Commit 4: createCourse backend
4. Implementar Commit 5: CourseForm + docs

---

## 📞 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| `403 Forbidden` | Claves de API incorrectas en .env |
| `No rows returned` | Las migraciones no se ejecutaron correctamente |
| `Connection refused` | Verifica URL de Supabase |
| `Auth error` | Probablemente el endpoint requiere autenticación |

---

**Listo. Solo necesitas ir al dashboard de Supabase y ejecutar 3 queries SQL. ¿Quieres que continúe con los siguientes pasos?**
