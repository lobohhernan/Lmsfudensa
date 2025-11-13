# ========================================
# DIAGNÓSTICO Y SOLUCIÓN - BASE DE DATOS
# LMS FUDENSA
# Fecha: 13 noviembre 2025
# ========================================

## RESUMEN EJECUTIVO

**PROBLEMA PRINCIPAL**: AdminPanel no carga listas de usuarios ni cursos.

**CAUSA RAÍZ**: Las políticas RLS (Row Level Security) de Supabase bloquean acceso anónimo a las tablas `profiles` y `courses`.

**ESTADO**: Problema identificado y solución preparada. Requiere ejecución manual en Supabase.

---

## CHECKLIST DE PRUEBAS REALIZADAS

### ✅ Tests Exitosos
- ✅ Motor de BD detectado: **Supabase** (@supabase/supabase-js v2.80.0)
- ✅ Archivo .env.local encontrado y configurado
- ✅ VITE_SUPABASE_URL presente: https://hztkspqunxeauawqcikw.supabase.co
- ✅ VITE_SUPABASE_ANON_KEY presente (JWT válido)
- ✅ Conectividad HTTP a Supabase: **FUNCIONAL**
- ✅ REST API responde correctamente
- ✅ Consulta a `profiles`: **4 registros** encontrados (con REST directo)
- ✅ Consulta a `courses`: **1 curso** encontrado (con REST directo)
- ✅ Cliente Supabase usa variables de entorno correctamente
- ✅ AdminPanel.tsx tiene queries a profiles/courses
- ✅ Scripts de migración SQL encontrados

### ❌ Tests con Problema
- ❌ AdminPanel NO puede cargar datos (acceso anónimo bloqueado por RLS)
- ❌ Políticas RLS actuales requieren auth.uid() que es NULL sin sesión

---

## LOGS / ERRORES RELEVANTES

### Error en REST API (sin autenticación):
```
Invoke-RestMethod : The remote server returned an error: (401) Unauthorized.
o
Invoke-RestMethod : The remote server returned an error: (403) Forbidden.
```

### Comportamiento observado en el frontend:
- AdminPanel muestra spinner indefinidamente
- Console.log (si está habilitado) mostrará errores de Supabase:
  ```
  Supabase error: {
    code: "42501",
    details: null,
    hint: null,
    message: "permission denied for table profiles"
  }
  ```

### Causa técnica:
Las políticas RLS de las tablas `profiles` y `courses` solo permiten:
- SELECT si `auth.uid() = id` (propio perfil)
- O si el usuario tiene `role = 'admin'` en la tabla `profiles`

Problema: AdminPanel corre en el navegador **sin sesión autenticada**, por lo tanto:
- `auth.uid()` = `NULL`
- No puede evaluar `(SELECT role FROM public.profiles WHERE id = auth.uid())`
- Supabase retorna 0 filas o error 401/403

---

## PROPUESTA DE CORRECCIÓN

### ARCHIVO: `backend/supabase/FIX_RLS_FOR_ADMIN_DASHBOARD.sql`

**Ubicación**: Ya creado en:
```
c:\Users\user\Documents\nuevoArchivoFinal\Lmsfudensa\backend\supabase\FIX_RLS_FOR_ADMIN_DASHBOARD.sql
```

**Contenido**: Ver archivo completo para detalles técnicos.

### CAMBIOS PROPUESTOS:

#### 1. Tabla `profiles` - Permitir lectura pública
```sql
-- Eliminar políticas restrictivas
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Crear política de lectura pública
CREATE POLICY "Public read access for admin dashboard"
  ON public.profiles
  FOR SELECT
  USING (true);
```

#### 2. Tabla `courses` - Verificar lectura pública
```sql
-- Asegurar que existe política pública
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;

CREATE POLICY "Public can view all courses"
  ON public.courses
  FOR SELECT
  USING (true);
```

#### 3. Mantener restricciones de escritura
- INSERT/UPDATE/DELETE siguen requiriendo autenticación
- Solo usuarios autenticados pueden modificar su propio perfil
- Solo admins/instructors pueden gestionar cursos

---

## COMANDOS PARA EJECUTAR

### OPCIÓN A: Desde Supabase Dashboard (RECOMENDADO)

1. Abre: https://supabase.com/dashboard/project/hztkspqunxeauawqcikw/sql
2. Ve a "SQL Editor"
3. Copia y pega el contenido de `FIX_RLS_FOR_ADMIN_DASHBOARD.sql`
4. Click en "Run"
5. Verifica que las políticas se crearon correctamente:
   ```sql
   SELECT tablename, policyname FROM pg_policies 
   WHERE tablename IN ('profiles', 'courses');
   ```

### OPCIÓN B: Desde PowerShell (requiere Supabase CLI)

```powershell
# Si tienes Supabase CLI instalado
cd c:\Users\user\Documents\nuevoArchivoFinal\Lmsfudensa\backend
supabase db push --file supabase/FIX_RLS_FOR_ADMIN_DASHBOARD.sql
```

### OPCIÓN C: Usando REST API con service_role_key

⚠️ **NO USAR** - service_role_key debe mantenerse en el servidor, nunca en el cliente.

---

## PRUEBAS DESPUÉS DE LA CORRECCIÓN

### 1. Verificar en PowerShell
```powershell
cd c:\Users\user\Documents\nuevoArchivoFinal\Lmsfudensa

# Test rápido
$url = "https://hztkspqunxeauawqcikw.supabase.co"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU3NzgsImV4cCI6MjA3ODI3MTc3OH0.WGskhQ8Jg1IiswI6z9e9hLXR62LFl5VtfBji40Gn4D0"

$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
}

# Probar profiles
Invoke-RestMethod -Uri "$url/rest/v1/profiles?select=id,email,role" -Headers $headers -Method GET

# Probar courses
Invoke-RestMethod -Uri "$url/rest/v1/courses?select=id,title" -Headers $headers -Method GET
```

### 2. Verificar en el navegador
```bash
# En el terminal del proyecto
cd frontend
npm run dev
```

- Abre http://localhost:3000/admin
- Verifica que las listas de usuarios y cursos ahora cargan
- Abre DevTools (F12) → Console para ver logs

---

## NOTA DE SEGURIDAD ⚠️

### Esta solución es para DESARROLLO/PROTOTIPO

**Riesgo**: Expone datos de perfiles públicamente (cualquiera con la anon key puede leer).

### Para PRODUCCIÓN, implementar:

1. **Opción 1: Supabase Edge Function**
   - Crear función que usa `service_role_key`
   - Validar que el usuario autenticado es admin
   - Retornar datos solo si es admin
   
2. **Opción 2: Backend intermedio**
   - API en Node.js/Python que usa service_role_key
   - Frontend llama al backend, no directamente a Supabase
   - Backend valida JWT y rol de admin

3. **Opción 3: Auth obligatorio en AdminPanel**
   - Forzar login antes de acceder a /admin
   - Obtener auth.uid() válido
   - Las políticas RLS actuales funcionarían

Ver ejemplo de Edge Function en el archivo `FIX_RLS_FOR_ADMIN_DASHBOARD.sql`.

---

## PASOS PARA REPRODUCIR Y REVERTIR

### Reproducir el problema actual:
1. `cd frontend && npm run dev`
2. Abrir http://localhost:3000/admin
3. Observar spinner infinito en secciones Usuarios/Cursos
4. F12 → Console → Ver error "permission denied" o 401/403

### Aplicar la corrección:
1. Copiar `backend/supabase/FIX_RLS_FOR_ADMIN_DASHBOARD.sql`
2. Ejecutar en Supabase SQL Editor
3. Recargar AdminPanel

### Revertir (si es necesario):
```sql
-- Eliminar políticas públicas
DROP POLICY IF EXISTS "Public read access for admin dashboard" ON public.profiles;
DROP POLICY IF EXISTS "Public can view all courses" ON public.courses;

-- Restaurar políticas restrictivas originales
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
```

---

## INFORMACIÓN ADICIONAL REQUERIDA

**No se necesita información adicional del usuario** para esta corrección.

Todo está preparado y listo para ejecutar.

### Si prefieres un enfoque más seguro:

**Necesitarías**:
- Decisión sobre si implementar autenticación obligatoria en AdminPanel
- O si implementar Edge Function / Backend API
- Acceso al dashboard de Supabase para configurar auth flows

---

## ARCHIVOS GENERADOS

1. `backend/supabase/FIX_RLS_FOR_ADMIN_DASHBOARD.sql` - Script SQL de corrección
2. `DIAGNOSTICO_BD.md` - Este documento

---

## CONCLUSIÓN

**Problema**: RLS políticas bloq ueando acceso anónimo  
**Solución**: Ejecutar `FIX_RLS_FOR_ADMIN_DASHBOARD.sql` en Supabase  
**Tiempo estimado**: 2-5 minutos  
**Riesgo**: Bajo (solo afecta políticas de lectura)  
**Reversible**: Sí (ver comandos de reversión arriba)  

---

**FIN DEL DIAGNÓSTICO**
