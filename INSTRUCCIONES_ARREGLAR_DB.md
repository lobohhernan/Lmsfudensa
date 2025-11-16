# 🚨 ARREGLAR LA BASE DE DATOS - Instrucciones Rápidas

## ¿Cuál es el problema?

En el navegador normal, **RLS (Row Level Security) en Supabase está bloqueando el acceso a los cursos** porque el localStorage corrupto está interfiriendo con las queries.

En incógnito funciona porque:
1. No hay localStorage corrupto
2. Las políticas RLS se aplican correctamente

## ✅ Solución: 3 Pasos

### Paso 1️⃣: Ejecutar SQL en Supabase

1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto **Lmsfudensa**
3. Navega a **SQL Editor** (en el menú lateral izquierdo)
4. Haz clic en **"New Query"**
5. **Copia y pega este SQL completo:**

```sql
-- ✅ FIX RÁPIDO Y PERMANENTE PARA ACCESO ANÓNIMO A CURSOS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_public_select" ON public.courses;
DROP POLICY IF EXISTS "courses_authenticated_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_owner_update" ON public.courses;
DROP POLICY IF EXISTS "courses_owner_delete" ON public.courses;

CREATE POLICY "courses_public_select"
  ON public.courses
  FOR SELECT
  USING (true);

CREATE POLICY "courses_authenticated_insert"
  ON public.courses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "courses_owner_update"
  ON public.courses
  FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "courses_owner_delete"
  ON public.courses
  FOR DELETE
  USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
CREATE POLICY "profiles_public_select"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "lessons_public_select" ON public.lessons;
CREATE POLICY "lessons_public_select"
  ON public.lessons
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "evaluations_public_select" ON public.evaluations;
CREATE POLICY "evaluations_public_select"
  ON public.evaluations
  FOR SELECT
  USING (true);
```

6. Haz clic en **"Run"** (o presiona Ctrl+Enter)
7. Deberías ver ✅ al lado de cada comando

### Paso 2️⃣: Limpiar localStorage en el navegador

1. Abre http://localhost:3000/clear-storage.html
2. Haz clic en **"🧨 Limpiar TODO el Almacenamiento"**
3. Confirma el diálogo
4. Espera a que recargue automáticamente

**O alternativa manual:**
- Presiona **F12** en el navegador
- Pestaña **Application** 
- Lado izquierdo: Click en **"Storage"** → **"Clear site data"**
- Marca todo y confirma

### Paso 3️⃣: Recargar la página

1. Ve a http://localhost:3000
2. Presiona **Ctrl+Shift+R** (hard refresh)
3. **Espera 3 segundos** para que cargue

---

## ✅ Verificación

**Debería ver:**
- ✅ Catálogo de cursos mostrando cursos
- ✅ Página de inicio con contenido
- ✅ Admin panel mostrando lista de cursos y usuarios
- ✅ Ningún error "Cargando..." indefinido

**Si todavía no funciona:**
- Abre **F12** → **Console**
- Busca errores rojo
- Toma una screenshot y envía

---

## 🔄 Cambios que hemos hecho:

1. **Deshabilitado localStorage persistente** - El navegador usa sessionStorage en dev
2. **Creado hook de limpieza automática** - Si el storage es > 100MB, se limpia automáticamente
3. **Agregadas políticas RLS correctas** - Permite lectura pública de cursos

---

Listo. Ahora la app debería funcionar normalmente en el navegador regular. 🎉
