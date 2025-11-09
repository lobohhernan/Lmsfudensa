# 🚀 Setup para el Equipo (3 Integrantes)

Guía paso a paso para que cada integrante configure el proyecto **Lmsfudensa** localmente.

---

## 📌 Información del Proyecto

| Aspecto | Detalle |
|--------|--------|
| **Nombre** | LMS Fudensa |
| **Tipo** | Plataforma de Cursos (Learning Management System) |
| **BD Compartida** | Supabase PostgreSQL |
| **URL Base** | `https://hztkspqunxeauawqcikw.supabase.co` |
| **Frontend** | React + Vite + TypeScript |
| **Backend** | Supabase (sin servidor) |
| **Repo** | GitHub (SantiBranch) |
| **Integrantes** | 3 personas (tú + 2 compañeros) |

---

## 🔧 Setup Inicial (Para Todos)

### Paso 1: Clonar el Repositorio

```bash
# SSH (recomendado)
git clone git@github.com:lobohhernan/Lmsfudensa.git
cd Lmsfudensa

# O HTTPS
git clone https://github.com/lobohhernan/Lmsfudensa.git
cd Lmsfudensa
```

### Paso 2: Asegurar Rama Correcta

```bash
git checkout SantiBranch
git pull origin SantiBranch
```

### Paso 3: Instalar Dependencias del Frontend

```bash
cd frontend
npm install
cd ..
```

**⚠️ IMPORTANTE:** Cada vez que hagas `git pull` y hay cambios en `package.json` o `package-lock.json`, debes ejecutar `npm install` para traer las nuevas dependencias.

### Paso 4: Crear Archivo `.env.local` en la Raíz

```bash
# Copia el template
cp .env.example .env.local
```

Luego abre `.env.local` y confirma que contiene:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hztkspqunxeauawqcikw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_rZtJ7xTLTI8ubfk2jRBYNw_EW2HNI7B
SUPABASE_SERVICE_ROLE_KEY=<ASK_PROJECT_OWNER>
```

**⚠️ IMPORTANTE:**
- Las 2 primeras líneas son **públicas** (ya están en `.env.example`)
- La tercera `SUPABASE_SERVICE_ROLE_KEY` es **SECRETA** — pídela **solo** al Project Owner por privado
- **NUNCA** la commits ni la compartas en chat grupal
- Agrégala a `.gitignore` (ya debe estar)

---

## 💾 Verificar / Ejecutar Migraciones

### ¿Qué es una Migración?

Son archivos SQL que definen la estructura de tablas, índices y políticas de seguridad de la BD. Se ejecutan **una sola vez** por proyecto.

### ¿Ya se Ejecutaron?

Pregunta al **Project Owner (quien creó el proyecto en Supabase)**. Si dice "sí", salta a [Paso 3.2](#paso-32-verificar-tablas).

### Paso 3.1: Ejecutar Migraciones (Si No Se Hicieron)

#### Opción A: Dashboard (Más Fácil)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Inicia sesión
3. Selecciona proyecto `hztkspqunxeauawqcikw`
4. Navega a **SQL Editor** (barra lateral izquierda)
5. Click en **New Query**
6. Abre el archivo `backend/supabase/migrations/20241107_initial_schema.sql`
7. Copia TODO el contenido
8. Pega en el editor del Dashboard
9. Click botón ▶ (Run) en la esquina superior derecha
10. **Espera a que aparezca "Success"**
11. Repite pasos 5-10 con `20241108_enhance_schema.sql`

#### Opción B: CLI (Si Tienes Supabase CLI Instalado)

```bash
# Vincular proyecto
supabase link --project-ref hztkspqunxeauawqcikw

# Ejecutar migraciones
supabase db push

# Verificar estado
supabase status
```

### Paso 3.2: Verificar Tablas

En Supabase Dashboard → **SQL Editor** → **New Query**:

```sql
-- Listar todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:
```
 courses
 course_learning_outcomes
 course_requirements
 evaluations
 lessons
 profiles
```

Si ves esto, ✅ las migraciones se ejecutaron bien.

---

## 🌱 Poblar Datos de Prueba (Seed)

El seed crea un **usuario admin**, **curso de ejemplo**, **lecciones** y **evaluaciones** para probar.

### Paso 4.1: Ejecutar Script de Seed

#### Opción A: DryRun (Ver qué Se Insertaría — Recomendado Primero)

```powershell
pwsh backend\scripts\seed_with_admin.ps1 `
  -SupabaseUrl "https://hztkspqunxeauawqcikw.supabase.co" `
  -DryRun
```

Deberías ver mucho output colorido con `[DRYRUN]` — significa que el script funciona pero no escribe.

#### Opción B: Modo Real (Escribe en la BD)

**Solo hazlo DESPUÉS de que el DryRun sea exitoso.**

```powershell
# Forma 1: Con env vars (más seguro)
$env:SUPABASE_URL = "https://hztkspqunxeauawqcikw.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<OBTENER_DEL_PROJECT_OWNER>"
pwsh backend\scripts\seed_with_admin.ps1

# Después: limpiar la variable de entorno
Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
```

**Forma 2: Con parámetros (menos seguro)**

```powershell
pwsh backend\scripts\seed_with_admin.ps1 `
  -SupabaseUrl "https://hztkspqunxeauawqcikw.supabase.co" `
  -ServiceRoleKey "<SECRET_KEY>"
```

### Paso 4.2: Verificar Seed

En Supabase Dashboard → **SQL Editor** → **New Query**:

```sql
-- Ver cursos creados
SELECT id, title, slug FROM courses;

-- Ver lecciones
SELECT id, title, course_id FROM lessons LIMIT 5;

-- Ver evaluaciones
SELECT id, question FROM evaluations LIMIT 5;
```

Deberías ver datos. ✅

---

## 🚀 Iniciar el Servidor Frontend

### Paso 5: Correr Vite Dev Server

```bash
cd frontend
npm run dev
```

Verás algo como:

```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Paso 6: Abrir en Navegador

Ve a `http://localhost:5173` y verifica que carga sin errores en la consola del navegador.

---

## 📝 Flujo de Desarrollo (Pasos Diarios)

### Empezar Sesión

```bash
# 1. Actualizar rama
git pull origin SantiBranch

# 2. Instalar nuevas deps (si alguien lo actualizó)
cd frontend && npm install && cd ..

# 3. Correr servidor
cd frontend && npm run dev
```

### Terminar Sesión / Antes de Commitear

```bash
# 1. Ver cambios
git status

# 2. Revisar qué modificaste
git diff

# 3. Agregar cambios
git add .

# 4. Commit con mensaje claro
git commit -m "feat: agregar validación en formulario de cursos"

# 5. Push a rama
git push origin SantiBranch
```

---

## 💻 Estructura de Carpetas (Rápido)

```
Lmsfudensa/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── pages/          # Páginas (Home, CourseDetail, etc.)
│   │   ├── components/     # Componentes reutilizables
│   │   ├── lib/            # Utilidades (supabase client, tipos)
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                # Supabase + SQL
│   ├── README.md           # Documentación de BD
│   ├── supabase/
│   │   ├── migrations/     # SQL para tablas (ya ejecutadas)
│   │   └── seed.sql        # Datos de prueba (opcional)
│   └── scripts/
│       └── seed_with_admin.ps1  # Script para poblar BD
├── SETUP_PARA_EQUIPO.md    # Este archivo
└── .env.example            # Variables de entorno públicas
```

---

## 🆘 Troubleshooting Común

### "npm install" falla

```bash
# Limpiar cache
npm cache clean --force

# Reintentar
npm install
```

### "El servidor de Vite no carga"

```bash
# Cerrar proceso anterior
pkill -f "vite"  # macOS/Linux
# O Ctrl+C varias veces en Windows

# Reiniciar
cd frontend && npm run dev
```

### "Error: 401 Unauthorized" en el script de seed

**Causa:** Service Role Key inválida o faltante.

**Solución:**
1. Pide la clave correcta al Project Owner
2. Verifica que esté en `.env.local` (línea `SUPABASE_SERVICE_ROLE_KEY=...`)
3. Vuelve a ejecutar el script

###"pwsh command not found"

**Opción 1:** Instala PowerShell 7:
- [Descargar PowerShell](https://github.com/PowerShell/PowerShell/releases)

**Opción 2:** Usa Windows PowerShell 5.1 (ya instalado):
```powershell
powershell -File backend\scripts\seed_with_admin.ps1 -SupabaseUrl "https://..."
```

### "Veo "Not Found" en páginas del frontend"

Probablemente ruta no existe o BD no cargó datos. Verifica:
1. Migraciones se ejecutaron ✅
2. Seed se ejecutó ✅
3. Consola del navegador sin errores (F12)

---

## 📞 Contacto & Preguntas

**Dudas Generales:**
- Lee `backend/README.md` (esquema de BD, queries, ejemplos)
- Lee `SETUP_REMOTE_SUPABASE.md` (más detalles de Supabase)

**Dudas Específicas:**
- Pregunta en el grupo de WhatsApp / Discord del proyecto
- O al Project Owner

**Errores No Documentados:**
- Captura pantalla del error
- Pega en el grupo
- Alguien te ayuda

---

## 🔄 Mantener Dependencias Actualizadas

Cuando alguien del equipo agregue nuevas dependencias (librerías), el `package.json` y `package-lock.json` cambian. 

**Para traer las nuevas dependencias:**

```bash
# 1. Trae los cambios del repositorio
git pull origin SantiBranch

# 2. Si hay cambios en frontend/package.json, instala las nuevas deps
cd frontend
npm install
cd ..

# 3. Verifica que no hay errores
npm run dev  # o lo que sea
```

**Regla simple:** Si ves que `package.json` cambió después de `git pull`, ejecuta `npm install` en la carpeta `frontend/`.

---

## ✅ Checklist Final

- [ ] Repositorio clonado
- [ ] Rama `SantiBranch` activa
- [ ] Frontend `npm install` OK
- [ ] `.env.local` creado con variables correctas
- [ ] Migraciones ejecutadas (tablas visibles en Dashboard)
- [ ] Seed ejecutado o verificado (datos en tablas)
- [ ] `npm run dev` corre sin errores
- [ ] Navegador abre `http://localhost:5173` OK

**Si todos tienen ✅, el proyecto está listo para desarrollar juntos. ¡Éxito!**

---

**Documento creado:** Noviembre 2025  
**Para:** Equipo Lmsfudensa (3 integrantes)
