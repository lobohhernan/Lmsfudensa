# ✅ SOLUCIÓN APLICADA: Errores 406 en user_progress

**Fecha**: 18 Nov 2025  
**Problema**: Errores HTTP 406 al ver certificado después de aprobar evaluación

---

## 🔴 PROBLEMA ORIGINAL

Después de completar una evaluación con buen puntaje y hacer clic en "Ver Certificado", aparecían **2 errores HTTP 406** en la consola del navegador:

```
GET .../user_progress?select=*&user_id=eq...&count=exact  406 (Not Acceptable)
GET .../user_progress?select=lesson_id,lessons(...)  406 (Not Acceptable)
```

---

## 🔍 CAUSA RAÍZ

El error era causado por el uso incorrecto de `.single()` en consultas Supabase:

```typescript
// ❌ ANTES - Causaba error 406
const { data } = await supabase
  .from('user_progress')
  .select('...')
  .eq('user_id', user.id)
  .limit(1)
  .single();  // ⚠️ Falla si no hay exactamente 1 resultado
```

**Por qué fallaba**:
- `.single()` espera **exactamente 1 resultado**
- Si no hay progreso guardado (usuario va directo a evaluación) → 0 resultados → **Error 406**
- Supabase retorna 406 porque no puede garantizar la respuesta esperada

---

## ✅ SOLUCIÓN IMPLEMENTADA

Reemplazar `.single()` por `.maybeSingle()` en todas las consultas a `user_progress`:

```typescript
// ✅ DESPUÉS - Funciona correctamente
const { data } = await supabase
  .from('user_progress')
  .select('...')
  .eq('user_id', user.id)
  .limit(1)
  .maybeSingle();  // ✅ Permite 0 o 1 resultado sin error
```

---

## 📁 ARCHIVOS MODIFICADOS

### 1. `frontend/src/pages/UserProfile.tsx`
**Línea 135**: Cambio `.single()` → `.maybeSingle()`

**Antes**:
```typescript
const { data: lastProgress } = await supabase
  .from('user_progress')
  .select('lesson_id, lessons(title, order_index)')
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .order('last_accessed_at', { ascending: false })
  .limit(1)
  .single();  // ❌
```

**Después**:
```typescript
const { data: lastProgress } = await supabase
  .from('user_progress')
  .select('lesson_id, lessons(title, order_index)')
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .order('last_accessed_at', { ascending: false })
  .limit(1)
  .maybeSingle();  // ✅
```

---

### 2. `frontend/src/pages/Home.tsx`
**Línea 131**: Cambio `.single()` → `.maybeSingle()`

Mismo cambio que en UserProfile.tsx

---

## 🎯 RESULTADO

Ahora cuando un usuario:
1. ✅ Completa una evaluación con buen puntaje
2. ✅ Hace clic en "Ver Certificado"
3. ✅ **NO aparecen errores 406 en consola**
4. ✅ El certificado se muestra correctamente

---

## 🧪 TESTING

### Caso de prueba 1: Usuario sin progreso
- **Escenario**: Usuario va directo a evaluación sin ver lecciones
- **Antes**: Error 406 en consola
- **Después**: ✅ Sin errores, muestra "Lección 1" por defecto

### Caso de prueba 2: Usuario con progreso
- **Escenario**: Usuario completa lecciones y luego evaluación
- **Antes**: Funciona, pero podía fallar si había inconsistencias
- **Después**: ✅ Funciona perfectamente, muestra última lección accedida

---

## 📚 DOCUMENTACIÓN ADICIONAL

Para análisis detallado, ver:
- `ANALISIS_ERROR_406_USER_PROGRESS.md` - Análisis técnico completo
- Script de verificación: `backend/scripts/check_user_progress.ps1`

---

## 🔧 DIFERENCIA ENTRE .single() Y .maybeSingle()

| Método | Resultados esperados | Comportamiento |
|--------|---------------------|----------------|
| `.single()` | Exactamente 1 | Error si hay 0 o más de 1 |
| `.maybeSingle()` | 0 o 1 | ✅ Retorna null si no hay datos |
| Sin modificador | 0 o más | Retorna array (puede estar vacío) |

---

## ✨ VENTAJAS DE LA SOLUCIÓN

1. ✅ **Simple**: Solo 1 palabra cambiada
2. ✅ **Segura**: Método diseñado para este caso
3. ✅ **Sin breaking changes**: No afecta funcionalidad existente
4. ✅ **Limpia logs**: Elimina errores de consola
5. ✅ **Mejor UX**: No confunde a desarrolladores

---

**Status**: ✅ COMPLETADO  
**Requiere deploy**: Sí, para que usuarios vean la mejora
