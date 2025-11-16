# 🚨 ARREGLAR LA BASE DE DATOS - Instrucciones Rápidas

## ¿Cuál es el problema?

En el navegador normal, **localStorage/sessionStorage corrupto está bloqueando la carga de datos** porque el cliente de Supabase intenta recuperar una sesión guardada que está corrupta.

En incógnito funciona porque:
1. No hay localStorage/sessionStorage persistente
2. Las políticas RLS se aplican correctamente
3. Cada carga comienza "limpia"

## ✅ Solución: 3 Pasos Simples

### Paso 1️⃣: Ejecutar SQL en Supabase (Necesario)

1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto **Lmsfudensa**
3. Navega a **SQL Editor** (en el menú lateral izquierdo)
4. Haz clic en **"New Query"**
5. **Copia y pega este SQL:**

```sql
-- DESHABILITAR Y RECONFIGURAR RLS (Nuclear option)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

-- Esperar un momento y volver a habilitar
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Crear políticas simples y efectivas
CREATE POLICY "courses_select_all" ON public.courses FOR SELECT USING (true);
CREATE POLICY "courses_insert_auth" ON public.courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "courses_update_auth" ON public.courses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "courses_delete_auth" ON public.courses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "evaluations_select_all" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "enrollments_select_all" ON public.enrollments FOR SELECT USING (true);
```

6. Haz clic en **"Run"** (o presiona Ctrl+Enter)

### Paso 2️⃣: Limpiar almacenamiento del navegador

**Opción A: Automática (Recomendada)**
1. Abre http://localhost:3000/clear-storage.html
2. Haz clic en **"🧨 Limpiar TODO el Almacenamiento"**
3. Confirma
4. Espera a que recargue automáticamente

**Opción B: Manual desde DevTools**
1. Presiona **F12** en el navegador
2. Pestaña **Application** 
3. Lado izquierdo: **"Storage"** → **"Clear site data"**
4. Marca todas las opciones
5. Haz clic en **"Clear site data"**

### Paso 3️⃣: Recargar la página

1. Ve a http://localhost:3000
2. Presiona **Ctrl+Shift+R** (hard refresh)
3. **Espera 3 segundos** a que cargue completamente

---

## ✅ Verificación

**Debería ver:**
- ✅ Catálogo de cursos mostrando cursos
- ✅ Página de inicio con contenido
- ✅ Admin panel mostrando lista de cursos y usuarios
- ✅ Ningún error "Cargando..." indefinido

**Si todavía no funciona:**
1. Abre http://localhost:3000/diagnostico.html
2. Haz clic en "▶️ Ejecutar Diagnóstico Completo"
3. Compara los datos en modo normal vs incógnito
4. Toma un screenshot y envía

---

## 🔄 Cambios que se han hecho:

1. **Deshabilitado persistencia de sesión** - El cliente de Supabase NO guarda ni recupera sesiones (cada carga es fresca)
2. **Creado hook de limpieza automática** - Si el storage es > 100MB, se limpia automáticamente
3. **Agregadas políticas RLS correctas** - Permite lectura pública de cursos

---

## 🆘 Troubleshooting

### "El SQL no corre"
- Error: `policy "courses_select_all" for table "courses" already exists`
- **Solución**: Usa el SQL del archivo `FIX_RLS_QUICK_2025.sql` que ya tiene `DROP IF EXISTS`

### "Todavía no carga en modo normal"
1. Abre http://localhost:3000/diagnostico.html
2. Ejecuta diagnóstico
3. Compara localStorage size en modo normal vs incógnito
4. Si son diferentes: limpia storage manualmente

### "Funciona en incógnito pero no en normal"
- Causa: localStorage corrupto
- **Solución**: Limpia storage completamente (Paso 2)

---

**Listo. Después de estos 3 pasos, la app debería funcionar en modo normal. 🎉**

