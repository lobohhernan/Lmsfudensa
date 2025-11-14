# 🏗️ ARQUITECTURA DEL SISTEMA DE CACHÉ

## Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DEL USUARIO                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React App (App.tsx)                       │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  useEffect(() => {                                    │  │
│  │    initCacheManager()  ← SE EJECUTA AL INICIAR       │  │
│  │  }, [])                                               │  │
│  └───────────────────────────────────────────────────────┘  │
│            ↓                                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        cacheManager.ts (Core)                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  • initCacheManager()                                 │  │
│  │    - Verifica versión cada 30 seg                    │  │
│  │    - Escucha visibilitychange                        │  │
│  │    - Escucha storage events (otras pestañas)         │  │
│  │                                                       │  │
│  │  • syncData()                                         │  │
│  │    - Obtiene caché si es válido                      │  │
│  │    - Sino, fetcha desde BD                           │  │
│  │    - Guarda con timestamp y versión                  │  │
│  │                                                       │  │
│  │  • Notificaciones de cambios                         │  │
│  │    - notifyDataChange()                              │  │
│  │    - onDataChange()                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│            ↓                                                   │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │   localStorage      │  │  useSmartCache (Hooks)       │  │
│  ├─────────────────────┤  ├──────────────────────────────┤  │
│  │ {                   │  │  • useSmartCache()           │  │
│  │  lms_courses: {     │  │  • useCoursesWithCache()     │  │
│  │    data: [...],     │  │  • useUsersWithCache()       │  │
│  │    timestamp: 123,  │  │  • useLessonsWithCache()     │  │
│  │    version: "1.0"   │  │                              │  │
│  │  },                 │  │  Retorna:                    │  │
│  │  lms_app_version:   │  │  {                           │  │
│  │    "1.0.0"          │  │    data,                     │  │
│  │ }                   │  │    loading,                  │  │
│  └─────────────────────┘  │    error,                    │  │
│                            │    refetch,                  │  │
│                            │    invalidateCache           │  │
│                            │  }                           │  │
│                            └──────────────────────────────┘  │
│                                      ↓                        │
│                            ┌──────────────────────────────┐  │
│                            │  Componentes React           │  │
│                            ├──────────────────────────────┤  │
│                            │  AdminPanel:                 │  │
│                            │  ├─ CacheControl            │  │
│                            │  ├─ useCoursesWithCache()   │  │
│                            │  └─ useUsersWithCache()     │  │
│                            │                              │  │
│                            │  CourseDetail:              │  │
│                            │  └─ useLessonsWithCache()   │  │
│                            │                              │  │
│                            │  MyComponent:               │  │
│                            │  └─ useSmartCache()         │  │
│                            └──────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                           ↑
    RED (fetch)              RESPONSE (datos)
         ↓                           ↑
   ┌──────────────────────────────────────────────┐
   │         SERVIDOR (Supabase)                   │
   ├──────────────────────────────────────────────┤
   │  Tablas:                                     │
   │  • profiles (4 registros)                    │
   │  • courses (1 registro)                      │
   │  • lessons (5 registros)                     │
   │  • evaluations (0 registros)                 │
   └──────────────────────────────────────────────┘
```

---

## Ciclo de Vida del Caché

### 1️⃣ Inicial (App.tsx monta)
```
App.tsx monta
    ↓
useEffect(() => {
  initCacheManager()  ← Aquí empieza todo
})
    ↓
cacheManager.ts:
  • Guarda APP_VERSION en localStorage
  • Inicia verificación cada 30 segundos
  • Configura event listeners
    ↓
Sistema LISTO ✅
```

### 2️⃣ Usuario Accede a Datos
```
<AdminPanel /> monta
    ↓
useCoursesWithCache(supabase) ← Hook se ejecuta
    ↓
useSmartCache({
  cacheKey: 'lms_courses',
  fetcher: () => supabase.from('courses').select('*'),
  ttl: 5 * 60 * 1000  // 5 minutos
})
    ↓
¿Existe 'lms_courses' en localStorage?
    │
    ├─ NO → Fetchar desde Supabase
    │         ↓
    │       Guardar en localStorage (con timestamp)
    │         ↓
    │       Retornar datos
    │
    └─ SÍ → ¿Está expirado? (timestamp + ttl > ahora)
             │
             ├─ SÍ → Fetchar datos nuevos
             │       ↓
             │       Actualizar localStorage
             │       ↓
             │       Retornar datos nuevos
             │
             └─ NO → Retornar del caché ✅
```

### 3️⃣ Deploy (Versión Cambia)
```
Tu equipo deploya cambios
    ↓
APP_VERSION cambia de '1.0.0' a '1.0.1' en cacheManager.ts
    ↓
Archivo se publica en servidor
    ↓
En ~30 segundos:
  Sistema verifica versión
    ↓
  localStorage.getItem('lms_app_version') === '1.0.0'
  APP_VERSION === '1.0.1'
    ↓
  ¡SON DIFERENTES! 🔄
    ↓
  clearAllCache()  ← Limpia TODO
    ↓
  localStorage.clear()
    ↓
  forcePageRefresh() ← Recarga
    ↓
  Usuario ve cambios ✅ (probablemente sin enterarse)
```

### 4️⃣ Usuario Regresa a Ventana
```
Usuario en otra pestaña
    ↓
Vuelve a tu app
    ↓
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkForNewVersion()
  }
})
    ↓
¿Versión cambió?
    │
    ├─ SÍ → Limpiar caché y recarga
    │
    └─ NO → Continuar normal ✅
```

### 5️⃣ Data Vieja (TTL Expirado)
```
Usuario accede a lecciones (ttl: 3 minutos)
    ↓
Timestamp: 10:00:00
    ↓
15:03:05 (después de 3 minutos y 5 segundos)
    ↓
¿isCacheExpired('lms_lessons', 3 * 60 * 1000)?
    ↓
    SÍ → edad (185 seg) > TTL (180 seg)
    ↓
Fetchar datos nuevos
    ↓
Actualizar localStorage con timestamp nuevo
    ↓
Retornar datos frescos ✅
```

---

## Estados de Datos

```typescript
interface CacheEntry<T> {
  data: T              // Los datos reales
  timestamp: number    // Cuándo se cargaron (Date.now())
  version: string      // Versión de app cuando se guardó
}

Ejemplo en localStorage:
{
  "lms_courses": {
    "data": [
      {
        "id": "92ff6a2c-...",
        "title": "Curso A",
        ...
      }
    ],
    "timestamp": 1731457200000,  // Nov 12, 2024 10:00:00
    "version": "1.0.0"
  }
}
```

---

## Decisiones de Caché

```
┌─────────────────────────────┐
│  Solicitar datos (Cursos)   │
└──────────────┬──────────────┘
               ↓
         ¿En caché?
            / \
          SÍ/  \NO
          /      \
         ↓        ↓
    ¿Versión    FETCHAR
    correcta?   DESDE BD
      / \            ↓
    SÍ/  \NO    GUARDAR
     /     \    EN CACHÉ
    ↓       ↓       ↓
¿Expiró?  LIMPIAR  RETORNAR
  / \     CACHÉ
SÍ/  \NO
 /     \
FETCH   RETORNAR
 |      DEL CACHÉ
 ├→ GUARDAR EN CACHÉ
 │
 └→ RETORNAR
```

---

## Sincronización Multi-Pestaña

```
PESTAÑA A                    PESTAÑA B
─────────────────────────────────────────
Sistema activo                Sistema activo
localStorage:                 localStorage:
v1.0.0                        v1.0.0
        ↑
        │ (storage event)
        └─────────────────────→ ¡Versión cambió!
                               clearCache()
                               reload()
        ↑←─────────────────────┘
(oye el cambio)
clearCache()
reload()

RESULTADO: Ambas pestañas se actualizan sincronizadamente ✅
```

---

## Sistema de Notificaciones

```
ComponenteA               ComponenteB
─────────────────────────────────────────
useCoursesWithCache()     useCoursesWithCache()
    ↓                          ↓
onDataChange()            onDataChange()
ESPERA cambios            ESPERA cambios
    ↑                          ↑
    └─────────────────────┬────┘
                          │
                    notifyDataChange(
                      CACHE_KEYS.COURSES
                    )
                          │
    ┌─────────────────────┴────┐
    ↓                          ↓
Callback ejecutado      Callback ejecutado
refetch automático      refetch automático
UI se actualiza         UI se actualiza

RESULTADO: Cambios se propagan sin recargar ✅
```

---

## Estados del Hook

```typescript
interface UseSmartCacheReturn<T> {
  data: T | null              // null, o array de datos
  loading: boolean            // true mientras fetcha
  error: Error | null         // null, o error object
  refetch: () => Promise<void>  // Función para refetch manual
  invalidateCache: () => void   // Función para limpiar caché
}

Ejemplo de ciclo:
1. Inicial: { data: null, loading: true, error: null }
2. Cargando del caché: { data: null, loading: true, error: null }
3. Del caché disponible: { data: [...], loading: false, error: null }
4. Si hay error: { data: null, loading: false, error: {...} }
```

---

## Debugging Visual

```
Console Output:
───────────────

🚀 Cache Manager inicializado (v1.0.0)
📦 Caché vacío para: lms_courses
📡 Fetchando datos nuevos para: lms_courses
💾 Caché guardado para: lms_courses
✅ Caché válido para: lms_courses
🔄 Sincronizando: lms_courses
🔍 Verificar versión

[30 segundos después]
🔍 Verificando versión...
✅ Versión actual

[Usuario regresa a ventana]
👁️ Usuario regresó a la ventana, verificando actualizaciones...
✅ Versión actual

[Deploy cambia versión]
🚀 Nueva versión detectada: 1.0.1
🗑️ Caché limpiado: lms_courses
🗑️ Caché limpiado: lms_users
🗑️ Caché limpiado: lms_lessons
🗑️ Todo el caché fue limpiado
🔄 Forzando recarga sin caché...
```

---

## Resumen: De Aquí a Allá

```
PROBLEMA:                    SOLUCIÓN:
─────────                    ─────────
Caché corrupta        →  cacheManager.ts
Deploy sin cambios    →  APP_VERSION tracking
Usuario confundido    →  initCacheManager() auto
Soporte extra         →  Recarga silenciosa
                      →  UI CacheControl
                      →  useSmartCache hooks
```

**TODO JUNTO = Sistema completo, automático, transparente y confiable ✅**
