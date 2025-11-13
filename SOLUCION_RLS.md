# 🔧 SOLUCIÓN RÁPIDA: Habilitar RLS en Supabase

## ❌ PROBLEMA ACTUAL

Supabase reporta **"RLS Disabled in Public"** para las siguientes tablas:
- ❌ public.profiles
- ❌ public.courses  
- ❌ public.lessons
- ❌ public.evaluations
- ❌ public.course_requirements
- ❌ public.course_learning_outcomes

**Impacto**: AdminPanel no puede cargar datos + riesgo de seguridad crítico.

---

## ✅ SOLUCIÓN EN 3 PASOS (5 MINUTOS)

### PASO 1: Abrir Supabase Dashboard

```
https://supabase.com/dashboard/project/hztkspqunxeauawqcikw/sql
```

1. Inicia sesión en Supabase
2. Selecciona el proyecto: **hztkspqunxeauawqcikw**
3. Click en **"SQL Editor"** (menú izquierdo)

---

### PASO 2: Ejecutar el Script SQL

1. Click en **"New Query"** (botón + New query)
2. Abre el archivo en tu VS Code:
   ```
   backend/supabase/ENABLE_RLS_ALL_TABLES.sql
   ```
3. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)
4. **Pega en el editor SQL** de Supabase (Ctrl+V)
5. Click en **"Run"** (botón verde o Ctrl+Enter)

**Tiempo de ejecución**: ~10-15 segundos

---

### PASO 3: Verificar que Funcionó

El mismo script muestra al final una tabla de verificación.

**Deberías ver**:
```
schema | table_name               | rls_status
-------|--------------------------|------------
public | courses                  | ✅ ENABLED
public | course_learning_outcomes | ✅ ENABLED
public | course_requirements      | ✅ ENABLED
public | evaluations              | ✅ ENABLED
public | lessons                  | ✅ ENABLED
public | profiles                 | ✅ ENABLED
```

---

## 🧪 PROBAR QUE ADMINPANEL FUNCIONA

### Opción A: Desde PowerShell (Rápido)

```powershell
cd c:\Users\user\Documents\nuevoArchivoFinal\Lmsfudensa

$url = "https://hztkspqunxeauawqcikw.supabase.co"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dGtzcHF1bnhlYXVhd3FjaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU3NzgsImV4cCI6MjA3ODI3MTc3OH0.WGskhQ8Jg1IiswI6z9e9hLXR62LFl5VtfBji40Gn4D0"

$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
}

# Test 1: Profiles
Write-Host "Test profiles..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$url/rest/v1/profiles?select=id,email,role" -Headers $headers

# Test 2: Courses
Write-Host "`nTest courses..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$url/rest/v1/courses?select=id,title" -Headers $headers
```

**Resultado esperado**: Debe mostrar datos sin errores 401/403

---

### Opción B: Desde el Navegador

```bash
cd frontend
npm run dev
```

1. Abre: http://localhost:3000/admin
2. Verifica que las listas de **Usuarios** y **Cursos** ahora cargan
3. F12 → Console: **NO debe haber errores** de "permission denied"

---

## 📋 QUÉ HACE EL SCRIPT

### ✅ Habilita RLS (Seguridad)
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
-- ... (todas las tablas)
```

### ✅ Crea Políticas de Lectura Pública
- Permite que AdminPanel y el catálogo lean datos
- **IMPORTANTE**: Solo SELECT público, escritura protegida

### ✅ Protege la Escritura
- INSERT/UPDATE/DELETE requieren autenticación
- Solo el propietario o admins pueden modificar

---

## 🔒 SEGURIDAD

### ✅ Lectura Pública (Permitida)
- `profiles`: email, role, nombre (para AdminPanel)
- `courses`: catálogo completo (para todos los usuarios)
- `lessons`: contenido de cursos comprados

### ❌ Escritura Protegida (Autenticación Requerida)
- Solo usuarios autenticados pueden crear/modificar su perfil
- Solo instructores pueden crear cursos
- Solo admins pueden eliminar cursos

---

## 🆘 SI ALGO SALE MAL

### Revertir cambios:
```sql
-- En Supabase SQL Editor:
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_learning_outcomes DISABLE ROW LEVEL SECURITY;
```

⚠️ **NO RECOMENDADO**: Deja la BD sin protección

---

## 📞 SOPORTE

Si después de ejecutar el script:

1. **AdminPanel sigue sin cargar**:
   - Abre F12 → Console
   - Busca errores en Network tab
   - Verifica que las requests van a `/rest/v1/profiles` y `/rest/v1/courses`

2. **Error 401/403 persiste**:
   - Verifica que RLS está habilitado (query de verificación al final del script)
   - Confirma que las políticas `public_*_select` existen

3. **Otros errores**:
   - Comparte el mensaje de error completo
   - Revisa los logs en Supabase Dashboard → Logs

---

## ✅ CHECKLIST FINAL

- [ ] Script ejecutado en Supabase SQL Editor
- [ ] Tabla de verificación muestra todas ✅ ENABLED
- [ ] Test desde PowerShell exitoso (datos retornados)
- [ ] AdminPanel carga usuarios y cursos
- [ ] No hay errores 401/403 en consola del navegador

---

**🎉 Una vez completado, tu AdminPanel funcionará correctamente!**
