# 🔍 Diagnóstico: Cursos que Desaparecen

## 📋 Resumen del Problema

Has reportado que los cursos creados desde el AdminPanel desaparecen cada vez que cierras el servidor (Ctrl+C).

## 🔬 Análisis Realizado

He revisado el código completo del AdminPanel y la lógica de persistencia. Aquí están mis hallazgos:

### ✅ Lo que está BIEN:

1. **Persistencia en Supabase**: El código SÍ guarda los cursos en Supabase correctamente
   - Ubicación: `AdminPanel.tsx` línea 205-280 (`handleSaveCourse`)
   - Se usa `supabase.from("courses").insert()` para nuevos cursos
   - Se usa `supabase.from("courses").update()` para actualizar cursos

2. **Suscripción en tiempo real**: Se usa `useCoursesRealtime` hook
   - Ubicación: `hooks/useCoursesRealtime.ts`
   - Está suscrito a cambios INSERT, UPDATE, DELETE en la tabla `courses`
   - Los cursos se cargan desde la base de datos al iniciar

3. **No hay localStorage temporal**: Los cursos NO se guardan en localStorage ni en memoria del navegador

### ⚠️ Posibles Causas del Problema:

#### 1. **Problema de Permisos RLS (Row Level Security)**
Si las políticas RLS de Supabase están mal configuradas, los cursos pueden:
- Guardarse correctamente
- Pero no mostrarse al cargar porque el usuario no tiene permisos de lectura

**Solución**: Verificar las políticas RLS en Supabase

#### 2. **Cache del Navegador**
El hook `useCoursesRealtime` podría estar mostrando datos cacheados antiguos

**Solución**: Limpiar cache del navegador o hacer hard refresh (Ctrl+Shift+R)

#### 3. **Conexión a Supabase Incorrecta**
Si hay un problema con las variables de entorno `.env.local`, podrías estar conectado a una instancia diferente

**Solución**: Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` sean correctos

#### 4. **Error Silencioso en el Insert**
Si hay un error al guardar, podría mostrarse un toast de éxito pero fallar silenciosamente

**Solución**: Revisar la consola del navegador por errores

## 🛠️ Scripts de Verificación Creados

### 1. Script SQL (para Supabase SQL Editor)
**Ubicación**: `backend/scripts/verificar_cursos.sql`

Este script contiene 10 queries para verificar:
- ✅ Todos los cursos en la base de datos
- ✅ Total de cursos
- ✅ Cursos con sus lecciones
- ✅ Cursos con sus evaluaciones
- ✅ Último curso creado
- ✅ Cursos creados en los últimos 10 minutos
- ✅ Cursos creados hoy
- ✅ Estadísticas generales
- ✅ Verificación de permisos RLS

### 2. Script PowerShell (automatizado)
**Ubicación**: `backend/scripts/verificar_cursos.ps1`

Este script se conecta a tu Supabase y verifica:
- ✅ Todos los cursos guardados
- ✅ Detalles del último curso
- ✅ Lecciones asociadas
- ✅ Evaluaciones asociadas
- ✅ Estadísticas generales

## 📝 Instrucciones para Diagnosticar

### Opción 1: Usando PowerShell (Recomendado)

```powershell
# Navegar a la carpeta de scripts
cd backend/scripts

# Ejecutar el script de verificación
./verificar_cursos.ps1
```

Este script mostrará:
- Cuántos cursos hay en la base de datos
- Detalles de cada curso
- Si el último curso creado está en la DB
- Cuánto tiempo hace que se creó

### Opción 2: Usando Supabase SQL Editor

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Ve a SQL Editor
3. Copia y pega las queries desde `backend/scripts/verificar_cursos.sql`
4. Ejecuta las queries una por una

### Opción 3: Prueba Manual

1. **Abre el AdminPanel**
2. **Crea un curso de prueba**:
   - Título: "Curso de Prueba - [Fecha actual]"
   - Completa todos los campos requeridos
   - Guarda el curso
3. **Verifica en la consola del navegador** (F12):
   - ¿Hay algún error rojo?
   - ¿Se muestra el mensaje "✅ Curso creado exitosamente"?
4. **Ejecuta el script PowerShell** inmediatamente después
5. **Recarga la página** (F5)
6. **Verifica si el curso sigue ahí**

## 🔍 Qué Buscar en los Resultados

### Si el script muestra 0 cursos:
❌ **Los cursos NO se están guardando en Supabase**
- Problema probable: Error en el INSERT o permisos RLS
- Solución: Revisar logs de Supabase y políticas RLS

### Si el script muestra los cursos:
✅ **Los cursos SÍ se están guardando**
- Problema probable: Cache del navegador o problema en el hook useCoursesRealtime
- Solución: Limpiar cache y verificar suscripción realtime

## 🚨 Errores Comunes y Soluciones

### Error: "Error INSERT: new row violates row-level security policy"
**Causa**: Las políticas RLS no permiten insertar cursos
**Solución**: 
```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Permitir a usuarios autenticados crear cursos
CREATE POLICY "Usuarios autenticados pueden crear cursos" 
ON courses FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

### Error: "Error al cargar cursos: Failed to fetch"
**Causa**: Problema de conexión a Supabase
**Solución**: Verificar `.env.local` y conexión a internet

### Error: Cursos no aparecen después de F5
**Causa**: Cache del navegador o problema de suscripción realtime
**Solución**: 
- Hacer Ctrl+Shift+R (hard refresh)
- Revisar si `useCoursesRealtime` se está ejecutando correctamente

## 📊 Código Relevante Analizado

### handleSaveCourse (AdminPanel.tsx)
```typescript
// Crear nuevo curso en Supabase
const { error } = await client.from("courses").insert([{
  title: course.title,
  slug: course.slug,
  description: course.description,
  // ... otros campos
}]);

if (error) {
  console.error("❌ Error INSERT:", error);
  toast.error("Error al crear el curso: " + error.message);
  return;
}
toast.success("✅ Curso creado exitosamente");
```

### useCoursesRealtime Hook
```typescript
// Initial fetch desde Supabase
const { data, error: queryError } = await supabase
  .from('courses')
  .select('*')
  .order('created_at', { ascending: false })

// Suscripción a cambios en tiempo real
const channel = supabase
  .channel('courses-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'courses' },
    (payload) => {
      // Actualizar estado con cambios
    }
  )
  .subscribe()
```

## ✅ Próximos Pasos

1. **Ejecuta el script de verificación**: `./verificar_cursos.ps1`
2. **Crea un curso de prueba** desde el AdminPanel
3. **Ejecuta el script nuevamente** para ver si apareció
4. **Comparte los resultados** para un diagnóstico más preciso

## 🤔 Pregunta Clave

**¿Los cursos desaparecen INMEDIATAMENTE al hacer Ctrl+C, o solo cuando vuelves a abrir el navegador más tarde?**

- Si es inmediato → Problema de conexión a Supabase o RLS
- Si es después → Posible problema de cache o sesión

---

**Fecha de análisis**: 17 de noviembre de 2025
**Estado**: Scripts de verificación creados ✅
