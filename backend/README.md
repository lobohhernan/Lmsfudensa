# Backend - LMS Fudensa

Documentación para el equipo de desarrollo. El backend usa **Supabase** (PostgreSQL hostado) como base de datos principal.

---

## ⚡ Quick Start (Para Nuevos Integrantes)

```bash
# 1. Clonar y cambiar a la rama correcta
git clone https://github.com/lobohhernan/Lmsfudensa.git
cd Lmsfudensa
git checkout SantiBranch

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Crear archivo .env.local con las credenciales (ver sección "Paso 3" abajo)
# Copia las credenciales de Supabase en frontend/.env.local

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Verificar que la BD tiene datos (desde raíz del proyecto)
cd ..\backend\scripts
.\query_db.ps1 -ServiceRoleKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTc3OCwiZXhwIjoyMDc4MjcxNzc4fQ.t_buPMiP1pGFh7IfIAGUr0iVPttJRWwhV07UgbqvPPs"
```

**🎯 Resultado esperado:** Ver el curso "RCP Adultos AHA 2020" y perfiles en la consola.

---

## 📋 Tabla de Contenidos

1. [Estructura de Base de Datos](#estructura-de-base-de-datos)
2. [Setup Inicial (Para Nuevos Integrantes)](#setup-inicial-para-nuevos-integrantes)
3. [Ejecutar Migraciones](#ejecutar-migraciones)
4. [Ejecutar Seed (Datos de Prueba)](#ejecutar-seed-datos-de-prueba)
5. [Verificar Conexión y Ver Datos desde VS Code](#verificar-conexión-y-ver-datos-desde-vs-code)
6. [Conectarse a la BD desde Código](#conectarse-a-la-bd-desde-código)
7. [Ejemplos de Queries SQL](#ejemplos-de-queries-sql)
8. [Troubleshooting](#troubleshooting)

---

## 🗄️ Esquema de la Base de Datos (Completo)

### Tabla: `auth.users` (Supabase Auth)

- Gestiona autenticación (email, password, etc.)
- **Controlada por Supabase** — no editar directamente
- FK: referenciada por `public.profiles.id`

### Tabla: `public.profiles`

Información de usuarios del sistema.

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT,              -- 'instructor', 'student', 'admin'
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `public.courses`

Cursos disponibles en la plataforma.

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    full_description TEXT,
    image TEXT,
    instructor_id UUID REFERENCES profiles(id),
    price DECIMAL(10, 2),
    duration TEXT,          -- '8 horas', '12 semanas', etc.
    level TEXT,             -- 'Básico', 'Intermedio', 'Avanzado'
    certified BOOLEAN DEFAULT FALSE,
    students INT DEFAULT 0,
    category TEXT,          -- 'RCP', 'Primeros Auxilios', etc.
    rating DECIMAL(3, 2),
    reviews INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `public.lessons`

Lecciones dentro de un curso.

```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,              -- 'video', 'document', 'quiz'
    youtube_id TEXT,
    duration TEXT,
    order_index INT,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `public.evaluations`

Preguntas de evaluación/cuestionarios.

```sql
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,        -- JSON array: ['Opción 1', 'Opción 2', ...]
    correct_answer INT,             -- Índice (0-based)
    explanation TEXT,
    question_order INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `public.course_requirements`

Requisitos previos de un curso.

```sql
CREATE TABLE course_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    requirement_order INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `public.course_learning_outcomes`

Objetivos de aprendizaje de un curso.

```sql
CREATE TABLE course_learning_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL,
    outcome_order INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Setup Rápido (Nuevo Integrante)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/lobohhernan/Lmsfudensa.git
cd Lmsfudensa
git checkout SantiBranch
```

### Paso 2: Instalar Dependencias del Frontend

```bash
cd frontend
npm install
cd ..
```

### Paso 3: Obtener Credenciales de Supabase

**Proyecto Actual:** LMS Fudensa (hztkspqunxeauawqcikw)

#### Credenciales Públicas (Puedes Compartir)

```env
SUPABASE_URL=https://hztkspqunxeauawqcikw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNjE4NzgsImV4cCI6MjA0NjkzNzg3OH0.sb_publishable_rZtJ7xTLTI8ubfk2jRBYNw_EW2HNI7B
```

#### Credencial Privada (Solo para Seed y Admin - **NO COMMITEAR**)

Solicita al **Project Owner** o **Tech Lead** la clave privada:
- **SUPABASE_SERVICE_ROLE_KEY**: `eyJhbGc...` (clave larga, ~300 caracteres)

> ⚠️ **IMPORTANTE:** Nunca subas la `SERVICE_ROLE_KEY` a GitHub. Úsala solo localmente en `.env.local` o como variable de entorno temporal.

### Paso 4: Crear `.env.local` en Frontend

En `frontend/.env.local` (**no lo commits, ya está en .gitignore**):

```bash
# frontend/.env.local
VITE_SUPABASE_URL=https://hztkspqunxeauawqcikw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNjE4NzgsImV4cCI6MjA0NjkzNzg3OH0.sb_publishable_rZtJ7xTLTI8ubfk2jRBYNw_EW2HNI7B
```

### Paso 5: Verificar Instalación

```bash
cd frontend
npm run dev
```

Abre `http://localhost:3000` en tu navegador. Si ves la página, ¡todo está funcionando! ✅

---

## 🔄 Ejecutar Migraciones

Las migraciones definen la estructura de las tablas. Están en `backend/supabase/migrations/`.

### Opción A: Usar Supabase Dashboard (Recomendado)

1. Abre [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto → **SQL Editor**
3. Abre cada archivo en `backend/supabase/migrations/` (en orden)
4. Copia el contenido y ejecútalo
5. Confirma que no hay errores

**Archivos a ejecutar:**
1. `20241107_initial_schema.sql` — Crea tablas base
2. `20241108_enhance_schema.sql` — Índices, constraints y RLS

### Opción B: CLI (Si Tienes Supabase CLI)

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
```

---

## 🌱 Ejecutar Seed (Datos de Prueba)

El script `backend/scripts/seed_with_admin.ps1` crea un usuario admin, curso de prueba, lecciones y evaluaciones.

### Requisitos

- PowerShell 5.1+ (Windows) o PowerShell Core 7+ (cualquier OS)
- Acceso a la **SUPABASE_SERVICE_ROLE_KEY**

### Opción A: DryRun (Recomendado Primero)

Imprime payloads sin escribir en la BD:

```powershell
pwsh backend\scripts\seed_with_admin.ps1 -SupabaseUrl "https://<PROJECT_REF>.supabase.co" -DryRun
```

### Opción B: Modo Real (Con Env Vars)

```powershell
$env:SUPABASE_URL = "https://<PROJECT_REF>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<YOUR_SECRET_KEY>"
pwsh backend\scripts\seed_with_admin.ps1
```

### Opción C: Modo Real (Con Parámetros)

```powershell
pwsh backend\scripts\seed_with_admin.ps1 `
  -SupabaseUrl "https://<PROJECT_REF>.supabase.co" `
  -ServiceRoleKey "<YOUR_SECRET_KEY>"
```

**⚠️ Nunca** pegues claves en scripts que vayas a commitear.

---

## 🔌 Conectarse a la BD desde Código

### Desde React/Frontend

#### 1. Instalar Cliente

```bash
npm install @supabase/supabase-js
```

#### 2. Crear Cliente en `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://<PROJECT_REF>.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 3. Usar en un Hook

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('certified', true)

      if (error) throw error
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
```

#### 4. Usar en un Componente

```tsx
import { useCourses } from '@/hooks/useCourses'

export function CourseList() {
  const { courses, loading, error } = useCourses()

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 📊 Verificar Conexión y Ver Datos desde VS Code

Después de ejecutar las migraciones y el seed, puedes verificar que la base de datos tiene datos usando el script `query_db.ps1` directamente desde la consola de VS Code.

### Script: `backend/scripts/query_db.ps1`

Este script consulta todas las tablas y muestra los datos en formato tabla en la consola.

**Ubicación:** `backend/scripts/query_db.ps1`

**Uso:**

```powershell
# Desde la raíz del proyecto
cd backend\scripts
.\query_db.ps1 -ServiceRoleKey "TU_SERVICE_ROLE_KEY"
```

**Salida Esperada:**

```
========================================
  TEST DE CONEXION A SUPABASE
========================================

CURSOS (SELECT id, title, slug, category):

id                                   title                                             slug                  category
--                                   -----                                             ----                  --------
2241e2a6-491f-4db1-b63a-4351c917ba5a RCP Adultos AHA 2020 - Reanimación Cardiopulmonar rcp-adultos-aha-2020 RCP

Total: 1 curso(s)

PERFILES (SELECT *):

id                                   email               full_name           role
--                                   -----               ---------           ----
550e8400-e29b-41d4-a716-446655440000 instructor@test.com Dr. Test Instructor instructor

Total: 1 perfil(es)

LECCIONES (SELECT *):

id                                   title                               duration order_index
--                                   -----                               -------- -----------
d887872b-d443-4747-9d48-ba42de68f692 Introducción a RCP                  15 min   1
55349c36-69bb-4e21-ab69-f6da27b40a40 Anatomía del sistema cardiovascular 20 min   2
fe5025ce-91ec-4a5d-934a-2944d40f51a1 Compresiones torácicas efectivas    25 min   3

Total: 3 leccion(es)

EVALUACIONES (SELECT *):

Preguntas encontradas:
  - ¿Cuál es la profundidad correcta de las compresiones torácicas en un adulto durante la RCP?
  - ¿Cuál es la frecuencia recomendada de compresiones torácicas por minuto?

Total: 2 evaluacion(es)

========================================
  TEST COMPLETADO
========================================
```

### ¿Qué Hace el Script?

1. **Conecta a Supabase** usando tu Service Role Key
2. **Consulta todas las tablas principales:**
   - `courses` (cursos)
   - `profiles` (perfiles de usuarios)
   - `lessons` (lecciones)
   - `evaluations` (evaluaciones/preguntas)
3. **Muestra los datos en formato tabla** directamente en la consola de VS Code
4. **Confirma que todo está funcionando** ✅

### Cuándo Usar Este Script

- ✅ Después de ejecutar el seed por primera vez
- ✅ Para verificar que las migraciones se aplicaron correctamente
- ✅ Para debugging: ver qué datos hay en la BD sin abrir el Dashboard
- ✅ Para confirmar que la conexión funciona antes de desarrollar

---

## 📊 Ejemplos de Queries SQL

### Obtener Todos los Cursos

```sql
SELECT * FROM courses;
```

### Obtener Lecciones de un Curso

```sql
SELECT l.* FROM lessons l
WHERE l.course_id = (SELECT id FROM courses WHERE slug = 'rcp-adultos-aha-2020');
```

### Instructor + Cursos

```sql
SELECT p.full_name, c.title, c.price
FROM profiles p
JOIN courses c ON p.id = c.instructor_id
WHERE p.role = 'instructor';
```

### Evaluaciones de un Curso

```sql
SELECT * FROM evaluations
WHERE course_id = (SELECT id FROM courses WHERE slug = 'rcp-adultos-aha-2020');
```

---

## 🛠️ Troubleshooting

**Error: "Debes pasar -SupabaseUrl..."**
- Solución: `pwsh backend\scripts\seed_with_admin.ps1 -SupabaseUrl "https://..."`

**Error: "401 Unauthorized"**
- Causa: Service Role Key inválida
- Solución: Crear nueva Secret Key en Supabase Dashboard → Settings → API

**Error: "FK violation on profiles.id"**
- Causa: Usuario no existe en `auth.users`
- Solución: Verificar que las migraciones se ejecutaron correctamente

**"pwsh no se reconoce"**
- Solución: Usa `powershell` en su lugar:

```powershell
powershell -File backend\scripts\seed_with_admin.ps1 -SupabaseUrl "..."
```

---

## 👥 Flujo de Trabajo Grupal

### Project Owner (Primero)

1. Crea proyecto Supabase
2. Ejecuta migraciones (SQL Editor)
3. Ejecuta seed (`seed_with_admin.ps1`)
4. Comparte: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
5. Comparte en privado: `SUPABASE_SERVICE_ROLE_KEY` (sin exponerla)

### Otros Integrantes

1. Clona repo y checkout `SantiBranch`
2. `npm install` en `frontend/`
3. Solicita credenciales al Project Owner
4. Crea `.env.local` con credenciales
5. `npm run dev` en `frontend/`
6. ¡Empiezan a desarrollar!

---

## 📚 Documentos Relacionados

- **Setup Detallado:** `SETUP_PARA_EQUIPO.md`
- **Seed Script:** `backend/scripts/seed_with_admin.ps1`
- **SQL Migrations:** `backend/supabase/migrations/`

---

**Última actualización:** Noviembre 2025
