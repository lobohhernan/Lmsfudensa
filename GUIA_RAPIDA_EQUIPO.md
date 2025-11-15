# 🚀 Guía Rápida para el Equipo

**Proyecto:** LMS Fudensa  
**Rama:** `SantiBranch`  
**Base de Datos:** Supabase (PostgreSQL)

---

## 📦 Setup Inicial (5 minutos)

### 1. Clonar Repositorio

```bash
git clone https://github.com/lobohhernan/Lmsfudensa.git
cd Lmsfudensa
git checkout SantiBranch
```

### 2. Instalar Dependencias

```bash
cd frontend
npm install
```

### 3. Configurar Variables de Entorno

Crea el archivo `frontend/.env.local` con este contenido:

```env
VITE_SUPABASE_URL=https://hztkspqunxeauawqcikw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNjE4NzgsImV4cCI6MjA0NjkzNzg3OH0.sb_publishable_rZtJ7xTLTI8ubfk2jRBYNw_EW2HNI7B
```

> ⚠️ **Este archivo NO se commitea** (ya está en `.gitignore`)

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

---

## ✅ Verificar que la Base de Datos Funciona

Después del setup, verifica que puedes conectarte a la BD y ver datos:

### Opción 1: Desde VS Code (Recomendado)

```powershell
cd backend\scripts
.\query_db.ps1 -ServiceRoleKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTc3OCwiZXhwIjoyMDc4MjcxNzc4fQ.t_buPMiP1pGFh7IfIAGUr0iVPttJRWwhV07UgbqvPPs"
```

**Resultado esperado:**

```
========================================
  TEST DE CONEXION A SUPABASE
========================================

CURSOS (SELECT id, title, slug, category):
...
Total: 1 curso(s)

PERFILES (SELECT *):
...
Total: 1 perfil(es)
```

### Opción 2: Desde Supabase Dashboard

1. Abre [Supabase Dashboard](https://app.supabase.com/project/hztkspqunxeauawqcikw)
2. Ve a **Table Editor**
3. Selecciona tabla `courses`
4. Deberías ver el curso "RCP Adultos AHA 2020"

---

## 🔑 Credenciales del Proyecto

### Credenciales Públicas (Puedes Compartir)

```
URL: https://hztkspqunxeauawqcikw.supabase.co
ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNjE4NzgsImV4cCI6MjA0NjkzNzg3OH0.sb_publishable_rZtJ7xTLTI8ubfk2jRBYNw_EW2HNI7B
```

### Credencial Privada (Solo para Admin/Seed)

**SERVICE_ROLE_KEY:** Pide esta clave al **Tech Lead** o **Project Owner**

> ⚠️ **NUNCA** subas esta clave a GitHub ni la compartas públicamente.

---

## 📚 Estructura del Proyecto

```
Lmsfudensa/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── pages/         # Páginas (Home, Catalog, etc.)
│   │   ├── lib/           # Supabase client
│   │   ├── hooks/         # React hooks (useCourses, etc.)
│   │   └── utils/         # Utilidades
│   ├── .env.local         # Variables de entorno (NO COMMITEAR)
│   └── package.json
│
├── backend/
│   ├── supabase/
│   │   ├── migrations/    # SQL para crear tablas
│   │   └── seed.sql       # Datos de prueba
│   └── scripts/
│       ├── query_db.ps1          # 🆕 Ver datos en consola
│       └── seed_with_admin.ps1   # Insertar datos de prueba
│
├── SETUP_PARA_EQUIPO.md   # Setup detallado
└── backend/README.md      # Documentación técnica completa
```

---

## 🛠️ Comandos Útiles

### Frontend

```bash
# Instalar dependencias
npm install

# Iniciar dev server
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

<!-- Playwright instructions removed per user request; testing will be added later -->
```

### Ver Datos de la BD (PowerShell)

```powershell
# Ver todas las tablas
.\backend\scripts\query_db.ps1 -ServiceRoleKey ".\backend\scripts\seed_with_admin.ps1 -SupabaseUrl "https://hztkspqunxeauawqcikw.supabase.co" -ServiceRoleKey  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTc3OCwiZXhwIjoyMDc4MjcxNzc4fQ.t_buPMiP1pGFh7IfIAGUr0iVPttJRWwhV07UgbqvPPs"


# Insertar datos de prueba (solo si la BD está vacía)
.\backend\scripts\seed_with_admin.ps1 -SupabaseUrl "https://hztkspqunxeauawqcikw.supabase.co" -ServiceRoleKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTc3OCwiZXhwIjoyMDc4MjcxNzc4fQ.t_buPMiP1pGFh7IfIAGUr0iVPttJRWwhV07UgbqvPPs"
```

---

## 📖 Tablas de la Base de Datos

### `profiles`
- Información de usuarios (instructores, estudiantes, admin)
- Relacionado con `auth.users` de Supabase

### `courses`
- Cursos disponibles en la plataforma
- Columnas: title, slug, description, price, instructor_id, category, etc.

### `lessons`
- Lecciones de cada curso
- Incluye: título, descripción, youtube_id, duration, order_index

### `evaluations`
- Preguntas de evaluación para cada curso
- Opciones múltiples con respuesta correcta

### `course_requirements`
- Requisitos previos de cada curso

### `course_learning_outcomes`
- Objetivos de aprendizaje de cada curso

---

## 🔗 Links Importantes

- **Repositorio GitHub:** https://github.com/lobohhernan/Lmsfudensa
- **Supabase Dashboard:** https://app.supabase.com/project/hztkspqunxeauawqcikw
- **Documentación Completa:** `backend/README.md`
- **Setup Detallado:** `SETUP_PARA_EQUIPO.md`

---

## 🆘 Troubleshooting

### "No puedo ver datos en el frontend"

1. Verifica que `.env.local` existe en `frontend/`
2. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`
3. Verifica que hay datos con el script: `.\backend\scripts\query_db.ps1`

### "Error al ejecutar query_db.ps1"

```powershell
# Si te da error de permisos
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Luego vuelve a intentar
.\query_db.ps1 -ServiceRoleKey "TU_CLAVE"
```

### "npm install falla"

1. Asegúrate de estar en `frontend/`: `cd frontend`
2. Borra `node_modules` y `package-lock.json`
3. Vuelve a instalar: `npm install`

### "No me aparece el curso en localhost:3000"

- Causa probable: **RLS (Row Level Security)** está bloqueando acceso anónimo
- Solución temporal: Usa el script `query_db.ps1` que usa Service Role Key
- Solución permanente: Configurar políticas RLS (pide ayuda al Tech Lead)

---

## 👥 Flujo de Trabajo

### Cuando empieces a trabajar:

1. `git pull origin SantiBranch` (actualizar cambios)
2. `cd frontend && npm install` (si hay nuevas dependencias)
3. `npm run dev`

### Antes de hacer commit:

1. Verifica que no estás commiteando `.env.local`
2. `git status` para ver qué archivos cambiarás
3. `git add .` y `git commit -m "mensaje descriptivo"`
4. `git push origin SantiBranch`

---

## 📝 Notas Finales

- **Siempre trabaja en `SantiBranch`**
- **Nunca commitees claves secretas** (SERVICE_ROLE_KEY)
- **Si necesitas la clave privada:** pídela al Tech Lead por chat privado
- **Si la BD está vacía:** ejecuta `seed_with_admin.ps1`
- **Para verificar conexión:** usa `query_db.ps1`

**¡Listo para desarrollar!** 🚀

---

**Última actualización:** Noviembre 2025
