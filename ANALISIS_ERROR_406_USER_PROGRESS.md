# ==========================================
# INFORME: Errores 406 en user_progress
# ==========================================
# Fecha: 18 Nov 2025
# Contexto: Errores al ver certificado después de aprobar evaluación
# ==========================================

## PROBLEMA

Al completar una evaluación con buen puntaje y hacer clic en "Ver Certificado", 
aparecen 2 errores HTTP 406 en consola:

```
GET https://...supabase.co/rest/v1/user_progress?select=...  406 (Not Acceptable)
GET https://...supabase.co/rest/v1/user_progress?select=...  406 (Not Acceptable)
```

## UBICACIÓN DEL ERROR

Archivo: `frontend/src/pages/UserProfile.tsx`
Líneas: 108-135

## CÓDIGO PROBLEMÁTICO

```typescript
// Línea 108-118: Primera consulta problemática
const { count } = await supabase
  .from('user_progress')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .eq('completed', true);

// Línea 128-135: Segunda consulta problemática  
const { data: lastProgress } = await supabase
  .from('user_progress')
  .select('lesson_id, lessons(title, order_index)')
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .order('last_accessed_at', { ascending: false })
  .limit(1)
  .single();  // ⚠️ PROBLEMA PRINCIPAL
```

## CAUSA RAÍZ

1. **Uso incorrecto de `.single()`**:
   - `.single()` espera EXACTAMENTE 1 resultado
   - Si hay 0 resultados → Error 406
   - Si hay múltiples resultados → Error 406

2. **Escenario que causa el error**:
   - Usuario completa evaluación sin haber visto lecciones
   - No existe registro en `user_progress`
   - `.single()` falla porque no hay datos
   - Supabase retorna 406 (Not Acceptable)

3. **Falta de manejo de errores**:
   - Aunque hay `try-catch`, el error ya se logea en consola
   - No se valida si existe progreso antes de hacer `.single()`

## POR QUÉ ERROR 406 Y NO 404

En Supabase, el error 406 ocurre cuando:
- Se espera un tipo de respuesta específico (`.single()`)
- Pero la query no retorna exactamente 1 fila
- Es diferente de 404 (recurso no encontrado)

## SOLUCIÓN

Hay 3 opciones:

### Opción 1: Eliminar `.single()` (RECOMENDADA)

```typescript
// En lugar de .single()
const { data: lastProgressArray } = await supabase
  .from('user_progress')
  .select('lesson_id, lessons(title, order_index)')
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .order('last_accessed_at', { ascending: false })
  .limit(1);

const lastProgress = lastProgressArray?.[0] || null;
```

### Opción 2: Usar `.maybeSingle()`

```typescript
// maybeSingle() permite 0 o 1 resultado
const { data: lastProgress } = await supabase
  .from('user_progress')
  .select('lesson_id, lessons(title, order_index)')
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .order('last_accessed_at', { ascending: false })
  .limit(1)
  .maybeSingle();  // ✅ No falla si no hay resultados
```

### Opción 3: Validar antes de usar `.single()`

```typescript
// Primero contar
const { count } = await supabase
  .from('user_progress')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('course_id', courseId);

if (count > 0) {
  // Solo usar .single() si sabemos que hay datos
  const { data } = await supabase...single();
}
```

## IMPACTO

- ❌ No rompe funcionalidad (hay try-catch)
- ⚠️  Pero genera errores visibles en consola
- ⚠️  Puede confundir a desarrolladores
- ⚠️  En producción, genera logs innecesarios

## RECOMENDACIÓN

Implementar **Opción 2 (.maybeSingle())** porque:
- ✅ Más simple (1 línea de cambio)
- ✅ Diseñado específicamente para este caso
- ✅ No requiere validaciones extra
- ✅ Elimina completamente los errores 406

## ARCHIVOS A MODIFICAR

1. `frontend/src/pages/UserProfile.tsx` - Línea 135
   - Cambiar `.single()` por `.maybeSingle()`

2. Opcionalmente, revisar otros archivos:
   - `frontend/src/pages/Home.tsx` (líneas 106, 125)
   - `frontend/src/pages/LessonPlayer.tsx` (línea 128)
   
   Si usan `.single()` en consultas a `user_progress`, aplicar el mismo fix.

## VERIFICACIÓN POST-FIX

Después de aplicar el fix:
1. Completar una evaluación con buen puntaje
2. Click en "Ver Certificado"
3. Abrir consola del navegador
4. ✅ No debería haber errores 406
5. ✅ El certificado se debe mostrar normalmente

==========================================
