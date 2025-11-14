# 🚀 GUÍA COMPLETA: ARREGLAR CRUD DE CURSOS

## 📋 PROBLEMA IDENTIFICADO

**Error 401 Unauthorized** al crear/editar/eliminar cursos desde AdminPanel:

```
POST .../rest/v1/courses → 401 (Unauthorized)
Error: new row violates row-level security policy for table "courses"
```

**Causa raíz:**
- Row-Level Security (RLS) está habilitado en Supabase
- Las policies requieren `auth.uid() = instructor_id`
- AdminPanel usa cliente **anónimo** (no autenticado)
- No hay bypass para operaciones administrativas

---

## ✅ SOLUCIÓN IMPLEMENTADA

Se crearon **3 opciones** para resolver el problema. Elige la que mejor se adapte:

### **OPCIÓN 1: DESHABILITAR RLS (Para testing rápido)**

**Pros:** Solución inmediata, cero configuración
**Contras:** ⚠️ **INSEGURO** - Cualquiera puede modificar cursos

#### Pasos:

1. Ve a Supabase Dashboard → SQL Editor
2. Pega y ejecuta este SQL:

```sql
-- DESHABILITAR RLS EN COURSES (TEMPORAL)
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
```

3. Prueba crear un curso desde AdminPanel
4. Debería funcionar inmediatamente ✅

**⚠️ IMPORTANTE:** Solo usar en desarrollo. **NUNCA en producción.**

---

### **OPCIÓN 2: POLICIES PERMISIVAS (Recomendada para desarrollo)**

**Pros:** Mantiene RLS activo, control granular
**Contras:** Requiere ejecutar SQL

#### Pasos:

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el archivo: `backend/supabase/FIX_RLS_DEFINITIVE_2025.sql` → **OPCIÓN 2**
3. El SQL hace:
   - Elimina policies conflictivas
   - Crea 4 policies permisivas:
     - `courses_public_select` - Cualquiera puede leer
     - `courses_permissive_insert` - Usuarios autenticados + anónimos pueden crear
     - `courses_permissive_update` - Usuarios autenticados + anónimos pueden editar
     - `courses_permissive_delete` - Usuarios autenticados + anónimos pueden eliminar

4. Prueba crear un curso desde AdminPanel ✅

**Nota:** Las policies tienen `OR true` que permite operaciones anónimas. Para producción, cambiar a validación estricta de roles.

---

### **OPCIÓN 3: SERVICE ROLE KEY (Recomendada para producción)**

**Pros:** ✅ Más seguro, bypasea RLS solo para admin, RLS sigue activo para usuarios normales
**Contras:** Requiere configurar variable de entorno

#### Pasos:

**1. Obtener tu SERVICE_ROLE_KEY:**

```
Supabase Dashboard → 
Settings → 
API → 
Project API keys → 
Copiar "service_role" (secret) ⚠️ NO compartir
```

**2. Agregar a `.env.local`:**

```bash
# En frontend/.env.local
VITE_SUPABASE_URL=https://hztkspqunxeauawqcikw.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**3. El código YA está actualizado:**

Ya implementé:
- `frontend/src/lib/supabaseAdmin.ts` - Cliente admin con service role
- `frontend/src/pages/AdminPanel.tsx` - Usa `supabaseAdmin` automáticamente

**4. Reiniciar servidor:**

```bash
cd frontend
npm run dev
```

**5. Probar:**

- Crear curso → ✅ Funcionará
- Console mostrará: `🔐 [ADMIN] INSERT en courses`

---

## 📂 ARCHIVOS CREADOS/MODIFICADOS

### **Nuevos archivos:**

1. **`backend/supabase/FIX_RLS_DEFINITIVE_2025.sql`**
   - SQL con 3 opciones para arreglar RLS
   - Documentación completa
   - Queries de verificación

2. **`frontend/src/lib/supabaseAdmin.ts`**
   - Cliente Supabase con SERVICE_ROLE_KEY
   - Bypasea RLS para operaciones admin
   - Función de logging: `logAdminOperation()`

### **Archivos modificados:**

3. **`frontend/src/pages/AdminPanel.tsx`**
   - Usa `supabaseAdmin` en vez de `supabase`
   - Funciones actualizadas:
     - `loadCourses()` → SELECT con admin client
     - `handleSaveCourse()` → INSERT/UPDATE con admin client
     - `confirmDelete()` → DELETE con admin client
   - Logs mejorados con emojis: ✅ ❌ 🔄

4. **`frontend/.env.local.example`**
   - Agregado: `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - Documentación de dónde obtenerla

---

## 🧪 TESTING

### **Test 1: Verificar RLS**

```sql
-- En Supabase SQL Editor
SELECT 
  c.relname AS table_name,
  CASE 
    WHEN c.relrowsecurity THEN '✅ RLS ENABLED' 
    ELSE '❌ RLS DISABLED' 
  END AS rls_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname = 'courses';
```

**Resultado esperado:**
- OPCIÓN 1: `❌ RLS DISABLED`
- OPCIÓN 2/3: `✅ RLS ENABLED`

### **Test 2: Crear curso desde AdminPanel**

1. Navega a: `http://localhost:3000/admin` (o tu puerto)
2. Click en pestaña "Cursos"
3. Click "Nuevo Curso"
4. Completa:
   - Título: `Test RLS Fix`
   - Slug: `test-rls-fix`
   - Categoría: `Testing`
   - Descripción: `Curso de prueba`
5. Click "Crear Curso"

**Resultado esperado:**
- ✅ Toast: "Curso creado exitosamente"
- ✅ Console: `🔐 [ADMIN] INSERT en courses`
- ✅ Curso aparece en la tabla

### **Test 3: Editar curso**

1. Click en "..." del curso creado
2. Click "Editar"
3. Cambia título a: `Test RLS Fix - Editado`
4. Click "Guardar Cambios"

**Resultado esperado:**
- ✅ Toast: "Curso actualizado exitosamente"
- ✅ Console: `🔐 [ADMIN] UPDATE en courses`

### **Test 4: Eliminar curso**

1. Click en "..." del curso
2. Click "Eliminar"
3. Confirmar en el diálogo

**Resultado esperado:**
- ✅ Toast: "Curso eliminado exitosamente"
- ✅ Console: `🔐 [ADMIN] DELETE en courses`
- ✅ Curso desaparece de la tabla

---

## 🐛 TROUBLESHOOTING

### **Error: "Missing VITE_SUPABASE_SERVICE_ROLE_KEY"**

**Solución:**
1. Verifica que `.env.local` tiene la variable
2. Reinicia el servidor: `Ctrl+C` → `npm run dev`
3. Si persiste, usa OPCIÓN 1 o 2

---

### **Error: "Error INSERT: auth.uid() is null"**

**Causa:** Policies siguen requiriendo autenticación

**Solución:** Ejecuta OPCIÓN 2 del SQL (policies permisivas con `OR true`)

---

### **Consola muestra: "⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY no configurada"**

**Causa:** Falta la variable de entorno

**Solución:**
- **Temporal:** Ejecuta OPCIÓN 1 SQL (DISABLE RLS)
- **Permanente:** Agrega SERVICE_ROLE_KEY a `.env.local`

---

## 🔒 SEGURIDAD

### **Para DESARROLLO:**
✅ Usar OPCIÓN 1 o 2
✅ RLS puede estar deshabilitado o con policies permisivas

### **Para PRODUCCIÓN:**
⚠️ **NUNCA usar OPCIÓN 1**
✅ Usar OPCIÓN 3 (SERVICE_ROLE_KEY)
✅ Cambiar `OR true` a validación estricta de roles en policies:

```sql
-- Cambiar esto:
WITH CHECK (
  (auth.uid() IS NOT NULL)
  OR true  -- ❌ ELIMINAR EN PRODUCCIÓN
);

-- Por esto:
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

---

## 📊 RESUMEN

| Opción | Velocidad | Seguridad | Recomendación |
|--------|-----------|-----------|---------------|
| 1: DISABLE RLS | ⚡ Inmediata | ❌ Baja | Solo testing local |
| 2: Policies Permisivas | 🔄 Media | ⚠️ Media | Desarrollo |
| 3: SERVICE_ROLE_KEY | 🐢 Requiere config | ✅ Alta | **PRODUCCIÓN** |

---

## ✅ PRÓXIMOS PASOS

1. ✅ Elige una opción y aplícala
2. ✅ Prueba CRUD completo de cursos
3. 🔄 Implementar Real-time updates (siguiente tarea)
4. 🔄 Crear tabla `teachers`
5. 🔄 Sistema de roles para usuarios
6. 🔄 Resolver problema de caché

---

## 🆘 NECESITAS AYUDA?

Si algo no funciona, proporciona:
- Opción que elegiste (1, 2 o 3)
- Mensaje de error exacto de la consola
- Screenshot del error en DevTools Network tab
- Contenido de tu archivo `.env.local` (sin las keys completas)

Estoy listo para continuar con el siguiente problema.
