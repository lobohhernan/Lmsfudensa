# 🔍 REPORTE DETALLADO: Problemas de Caché y Persistencia de Datos

**Fecha:** 16 de Noviembre, 2025  
**Problema reportado:** No se muestran los datos de productos cuando se recarga la página (incluso en modo incógnito)  
**Alcance:** Sesiones de usuario, datos de cursos, persistencia general

---

## 📊 DIAGNÓSTICO COMPLETO

### ✅ **PROBLEMA #1: Sistema de Caché COMPLETAMENTE DESHABILITADO**

**Ubicación:** `frontend/src/lib/cacheManager.ts`

**Estado actual:**
```typescript
export function getCachedData<T>(key: string): T | null {
  // Cache deshabilitado para reducir uso de memoria
  return null  // ❌ SIEMPRE RETORNA NULL
}

export function setCachedData<T>(key: string, data: T): void {
  // Cache deshabilitado - no guardar nada en localStorage
  return  // ❌ NO GUARDA NADA
}
```

**Impacto:**
- ❌ **CRÍTICO**: Ningún dato de cursos se cachea
- ❌ Los productos se cargan desde la base de datos en CADA recarga
- ❌ Experiencia de usuario degradada (lentitud)
- ✅ Sin problemas de corrupción de caché (lado positivo)

**Análisis:**
El sistema fue deliberadamente deshabilitado con el comentario "Cache deshabilitado para reducir uso de memoria". Esto significa que:
1. Los datos NO se guardan en localStorage
2. Cada vez que recargas, se hace fetch a Supabase
3. Si Supabase tiene problemas RLS o conexión, NO hay fallback

---

### ✅ **PROBLEMA #2: Hook `useStorageCleanup` Potencialmente Agresivo**

**Ubicación:** `frontend/src/hooks/useStorageCleanup.ts`

**Código crítico:**
```typescript
// Si una key individual es mayor a 10MB, es sospechosa
if (size > 10 * 1024 * 1024) {
  problematicKeys.push(`${key} (${(size / 1024 / 1024).toFixed(2)} MB)`)
}

// Limpiar solo las keys problemáticas, NO todo el storage
problematicKeys.forEach(keyWithSize => {
  const key = keyWithSize.split(' (')[0]
  // No borrar keys de autenticación
  if (!key.includes('supabase.auth') && !key.includes('sb-')) {
    localStorage.removeItem(key)  // ⚠️ ELIMINA DATOS GRANDES
  }
})
```

**Análisis:**
- ✅ **CORRECTO**: Protege las keys de autenticación
- ⚠️ **PROBLEMA POTENCIAL**: Si un curso tiene mucha data (>10MB), podría eliminarse
- ⚠️ Se ejecuta automáticamente 500ms después de cargar la app
- ✅ No afecta datos de autenticación (sesiones protegidas)

**Comportamiento observado:**
- Si localStorage > 100MB → Limpia items de cache
- Si una key individual > 10MB → La marca como "problemática" y la elimina
- Ejecuta en CADA carga de la aplicación

---

### ✅ **PROBLEMA #3: Configuración de Supabase Storage Key**

**Ubicación:** `frontend/.env.local`

**Estado actual:**
```env
# VITE_SUPABASE_STORAGE_KEY=mi_llave_personalizada.supabase.auth
```

**Análisis:**
- ✅ **CORRECTO**: Variable comentada, usa key por defecto
- ✅ Evita conflictos con keys personalizadas
- ✅ Supabase usará `sb-<project-ref>-auth-token` por defecto

**Impacto:** Ninguno negativo, configuración correcta.

---

### ✅ **PROBLEMA #4: Autenticación y Persistencia de Sesión**

**Ubicación:** `frontend/src/lib/supabase.ts`

**Configuración actual:**
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey,
    storage,                    // ✅ localStorage habilitado
    persistSession: true,       // ✅ Sesiones persisten
    detectSessionInUrl: true,   // ✅ Magic links funcionan
    autoRefreshToken: true,     // ✅ Tokens se renuevan
  }
})
```

**Análisis:**
- ✅ **CORRECTO**: Toda la configuración de auth es correcta
- ✅ Las sesiones SE GUARDAN en localStorage
- ✅ Los tokens se renuevan automáticamente

**¿Por qué no funciona el login entonces?**
- El problema NO está en la configuración de auth
- El problema está en **cómo se cargan los datos después del login**

---

### ⚠️ **PROBLEMA #5: Carga de Cursos Sin Caché**

**Ubicación:** `frontend/src/hooks/useCourses.ts` y `useCoursesRealtime.ts`

**Flujo actual:**
```typescript
const fetchCourses = async () => {
  try {
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (queryError) throw queryError
    setCourses(processedData)  // ✅ Sí actualiza el estado
  } catch (err) {
    setError(message)  // ❌ Si falla, no hay fallback
  }
}
```

**Análisis:**
- ✅ **CORRECTO**: Hook funciona bien
- ❌ **PROBLEMA**: Si falla la query de Supabase, NO hay datos cacheados para mostrar
- ❌ **PROBLEMA**: Depende 100% de que Supabase responda correctamente
- ⚠️ Si las políticas RLS bloquean la query, se muestran 0 cursos

**Escenarios de fallo:**
1. **RLS bloqueando consultas** → `[]` (array vacío)
2. **Token expirado** → Error de autenticación
3. **Red lenta** → Loading infinito
4. **Sin caché** → No hay fallback

---

### 🔥 **PROBLEMA CRÍTICO #6: Políticas RLS Potencialmente Bloqueando Datos**

**Hipótesis:** Las políticas de Row Level Security pueden estar bloqueando el acceso a los cursos.

**Consultas SQL relevantes:**
```sql
-- Política actual (hipotética)
CREATE POLICY "courses_select_policy" ON courses
  FOR SELECT USING (true);  -- ¿Permite lectura pública?

-- Si la política requiere autenticación:
CREATE POLICY "courses_auth_only" ON courses
  FOR SELECT USING (auth.role() = 'authenticated');
```

**Análisis:**
- ⚠️ **POSIBLE CAUSA**: RLS requiere autenticación para ver cursos
- ⚠️ Cuando recargas, si el token está expirado, NO ves cursos
- ⚠️ En modo incógnito, NO hay sesión → NO ves cursos
- ⚠️ La query retorna `[]` (vacío) sin error explícito

**Evidencia:**
- Usuario reporta: "no se muestran los datos de mi producto"
- Sucede también en incógnito (sin sesión)
- Login no funciona correctamente (sesión no persiste)

---

## 🎯 CAUSAS RAÍZ IDENTIFICADAS

### **Causa Principal #1: Sistema de Caché Deshabilitado**
- **Severidad:** 🔴 ALTA
- **Impacto:** Datos no se cachean, dependencia total de Supabase
- **Ubicación:** `cacheManager.ts` líneas 44-54
- **Solución:** Re-habilitar caché con TTL corto (2-5 min)

### **Causa Principal #2: Políticas RLS Bloqueando Acceso Público**
- **Severidad:** 🔴 CRÍTICA
- **Impacto:** Cursos no se muestran si no hay sesión válida
- **Ubicación:** Base de datos Supabase → tabla `courses`
- **Solución:** Verificar y ajustar políticas RLS

### **Causa Principal #3: Sin Fallback Cuando Falla Supabase**
- **Severidad:** 🟡 MEDIA
- **Impacto:** Si RLS bloquea o hay error, UI queda vacía
- **Ubicación:** Hooks `useCourses.ts`, `useCoursesRealtime.ts`
- **Solución:** Implementar caché como fallback

### **Causa Secundaria #4: Storage Cleanup Muy Agresivo**
- **Severidad:** 🟢 BAJA (pero puede causar problemas)
- **Impacto:** Elimina datos grandes (>10MB) automáticamente
- **Ubicación:** `useStorageCleanup.ts` líneas 27-48
- **Solución:** Aumentar threshold o deshabilitar para ciertos tipos

---

## 🛠️ SOLUCIONES PROPUESTAS

### **Solución Inmediata #1: Re-habilitar Caché con TTL Corto**

**Archivo:** `frontend/src/lib/cacheManager.ts`

```typescript
export function getCachedData<T>(key: string): T | null {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const cached: CacheEntry<T> = JSON.parse(stored)
    
    // Verificar versión
    if (cached.version !== APP_VERSION) {
      debug(`🗑️ Versión desactualizada para ${key}`)
      localStorage.removeItem(key)
      return null
    }

    return cached.data
  } catch (error) {
    logError(`❌ Error leyendo caché ${key}:`, error)
    return null
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (!isBrowser) return
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: APP_VERSION,
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    // QuotaExceededError - storage lleno
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      warn('⚠️ Storage lleno, limpiando cache antiguo...')
      clearAllCache()
      // Reintentar
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          version: APP_VERSION,
        }
        localStorage.setItem(key, JSON.stringify(entry))
      } catch (retryError) {
        logError('❌ No se pudo guardar en caché:', retryError)
      }
    } else {
      logError(`❌ Error guardando caché ${key}:`, error)
    }
  }
}
```

**Beneficios:**
- ✅ Datos se cachean con timestamp y versión
- ✅ Fallback disponible si Supabase falla
- ✅ Maneja QuotaExceededError automáticamente
- ✅ Invalida caché si cambia versión de app

---

### **Solución Inmediata #2: Verificar Políticas RLS de Supabase**

**Acción:** Ejecutar en Supabase SQL Editor:

```sql
-- 1. Ver políticas actuales de la tabla courses
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'courses';

-- 2. Permitir lectura pública de cursos (RECOMENDADO)
DROP POLICY IF EXISTS "courses_public_read" ON courses;
CREATE POLICY "courses_public_read" 
ON courses FOR SELECT 
USING (true);  -- Permite a todos leer cursos

-- 3. Verificar que RLS esté habilitado pero permita lectura
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 4. Test: Intentar leer cursos sin autenticación
-- (Ejecutar esto desde un cliente sin sesión)
SELECT id, title FROM courses LIMIT 5;
```

**Verificación:**
1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta las queries arriba
3. Verifica que `courses_public_read` existe
4. Intenta ver cursos en modo incógnito

---

### **Solución Inmediata #3: Agregar Fallback en Hooks**

**Archivo:** `frontend/src/hooks/useCourses.ts`

```typescript
import { getCachedData, setCachedData, CACHE_KEYS, CACHE_TTL } from '@/lib/cacheManager'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      
      // 1. Intentar cargar desde caché primero
      const cached = getCachedData<Course[]>(CACHE_KEYS.COURSES)
      if (cached) {
        setCourses(cached)
        setLoading(false)  // Mostrar cache inmediatamente
      }

      // 2. Fetch desde Supabase
      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      
      // 3. Procesar y guardar en caché
      const processedData = (data || []).map(course => ({
        ...course,
        students: course.students && course.students > 0 ? course.students : undefined
      }))
      
      setCourses(processedData)
      setCachedData(CACHE_KEYS.COURSES, processedData)  // Guardar en caché
      setError(null)
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching courses'
      setError(message)
      console.error('Error fetching courses:', err)
      
      // 4. Si falla, usar caché como fallback
      const cached = getCachedData<Course[]>(CACHE_KEYS.COURSES)
      if (cached && cached.length > 0) {
        console.warn('Usando datos cacheados por error de red')
        setCourses(cached)
      }
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
```

**Beneficios:**
- ✅ Muestra datos cacheados inmediatamente (UX rápida)
- ✅ Actualiza en background desde Supabase
- ✅ Si falla Supabase, usa caché como fallback
- ✅ Usuario siempre ve algo (aunque sea viejo)

---

### **Solución Avanzada #4: Ajustar Storage Cleanup**

**Archivo:** `frontend/src/hooks/useStorageCleanup.ts`

```typescript
// Aumentar threshold de 10MB a 50MB
if (size > 50 * 1024 * 1024) {  // Cambio: 10MB → 50MB
  problematicKeys.push(`${key} (${(size / 1024 / 1024).toFixed(2)} MB)`)
}

// También excluir keys de cursos del cleanup agresivo
if (!key.includes('supabase.auth') && 
    !key.includes('sb-') && 
    !key.includes('lms_courses')) {  // Proteger caché de cursos
  localStorage.removeItem(key)
}
```

---

### **Solución Avanzada #5: Logging para Debugging**

**Agregar en `useCourses.ts`:**

```typescript
const fetchCourses = async () => {
  try {
    console.log('🔍 [useCourses] Iniciando fetch...')
    
    const { data, error: queryError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('📦 [useCourses] Respuesta Supabase:', {
      success: !queryError,
      count: data?.length || 0,
      error: queryError?.message,
      data: data?.slice(0, 2)  // Solo primeros 2 para no saturar console
    })

    if (queryError) throw queryError
    // ...resto del código
  }
}
```

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### **Fase 1: Diagnóstico (5-10 min)**
1. ✅ Abrir DevTools → Console
2. ✅ Abrir http://localhost:3001/debug-auth.html
3. ✅ Verificar:
   - ¿Hay tokens de autenticación?
   - ¿localStorage tiene datos?
   - ¿Hay errores en console?

### **Fase 2: Fix Inmediato RLS (10 min)**
1. ✅ Abrir Supabase Dashboard
2. ✅ Ir a SQL Editor
3. ✅ Ejecutar query para crear política pública de lectura
4. ✅ Probar en modo incógnito

### **Fase 3: Re-habilitar Caché (15 min)**
1. ✅ Editar `cacheManager.ts`
2. ✅ Implementar `getCachedData` y `setCachedData`
3. ✅ Actualizar `useCourses.ts` con fallback
4. ✅ Probar en navegador

### **Fase 4: Ajustar Storage Cleanup (5 min)**
1. ✅ Aumentar threshold de 10MB a 50MB
2. ✅ Proteger keys de cursos
3. ✅ Probar que no elimine datos importantes

### **Fase 5: Testing Completo (10 min)**
1. ✅ Modo normal: Login → Ver cursos → Refrescar
2. ✅ Modo incógnito: Ver cursos sin login
3. ✅ Network throttling: Simular red lenta
4. ✅ Verificar caché en DevTools → Application → Local Storage

---

## 🎯 VERIFICACIÓN FINAL

### **Checklist de Testing:**
- [ ] Los cursos se muestran sin login (modo incógnito)
- [ ] Los cursos se muestran después de login
- [ ] Los cursos persisten después de refrescar página
- [ ] El login funciona correctamente
- [ ] La sesión persiste después de refrescar
- [ ] localStorage no crece más de 5MB
- [ ] No hay errores en console sobre RLS
- [ ] La app carga rápido (con caché)

---

## 📊 RESUMEN EJECUTIVO

**Problemas Identificados:**
1. 🔴 Sistema de caché completamente deshabilitado
2. 🔴 Posibles políticas RLS bloqueando acceso público
3. 🟡 Sin fallback cuando Supabase falla
4. 🟢 Storage cleanup potencialmente agresivo

**Causa Principal:**
- Caché deshabilitado + RLS restringiendo acceso = No hay datos disponibles

**Solución Prioritaria:**
1. Verificar y ajustar políticas RLS (CRÍTICO)
2. Re-habilitar sistema de caché (IMPORTANTE)
3. Agregar fallbacks en hooks (RECOMENDADO)

**Tiempo Estimado de Implementación:**
- ⏱️ Fix RLS: 10 minutos
- ⏱️ Re-habilitar caché: 15 minutos
- ⏱️ Agregar fallbacks: 10 minutos
- ⏱️ Testing: 10 minutos
- **TOTAL:** ~45 minutos

**Impacto Esperado:**
- ✅ Cursos visibles en modo incógnito
- ✅ Login funciona correctamente
- ✅ Sesión persiste al refrescar
- ✅ Datos cacheados para UX rápida
- ✅ Fallback si Supabase falla

---

**Generado por:** GitHub Copilot  
**Última actualización:** 16 Nov 2025
