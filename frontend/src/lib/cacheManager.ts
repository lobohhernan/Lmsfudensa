/**
 * Cache Manager - Sistema de invalidación inteligente de caché
 * 
 * Soluciona el problema de caché corrupta en navegadores
 * Asegura que los usuarios siempre vean datos actualizados
 */

// Versión de la app (cambiar esta para forzar invalidación global)
export const APP_VERSION = '1.0.0'

// Claves de caché
export const CACHE_KEYS = {
  COURSES: 'lms_courses',
  USERS: 'lms_users',
  LESSONS: 'lms_lessons',
  EVALUATIONS: 'lms_evaluations',
  APP_VERSION: 'lms_app_version',
  LAST_SYNC: 'lms_last_sync',
} as const

// TTL (Time To Live) en milisegundos
export const CACHE_TTL = {
  COURSES: 5 * 60 * 1000, // 5 minutos
  USERS: 10 * 60 * 1000, // 10 minutos
  LESSONS: 3 * 60 * 1000, // 3 minutos
  EVALUATIONS: 5 * 60 * 1000, // 5 minutos
} as const

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

/**
 * Obtener datos del caché
 * Verifica si los datos son válidos (no expirados y versión correcta)
 */
export function getCachedData<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) {
      console.log(`📦 Caché vacío para: ${key}`)
      return null
    }

    const cached: CacheEntry<T> = JSON.parse(stored)
    const storedVersion = localStorage.getItem(CACHE_KEYS.APP_VERSION)

    // Verificar si la versión de la app cambió
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.warn(`⚠️ Versión de app cambió. Limpiando caché para: ${key}`)
      clearCache(key)
      return null
    }

    // Verificar si el caché es válido (no está determinado el TTL aquí)
    console.log(`✅ Caché válido para: ${key}`)
    return cached.data
  } catch (error) {
    console.error(`❌ Error leyendo caché ${key}:`, error)
    clearCache(key)
    return null
  }
}

/**
 * Guardar datos en el caché con timestamp
 */
export function setCachedData<T>(key: string, data: T): void {
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: APP_VERSION,
    }
    localStorage.setItem(key, JSON.stringify(cacheEntry))
    localStorage.setItem(CACHE_KEYS.APP_VERSION, APP_VERSION)
    console.log(`💾 Caché guardado para: ${key}`)
  } catch (error) {
    console.error(`❌ Error guardando caché ${key}:`, error)
  }
}

/**
 * Verificar si el caché ha expirado
 */
export function isCacheExpired(key: string, ttl: number): boolean {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return true

    const cached: CacheEntry<unknown> = JSON.parse(stored)
    const age = Date.now() - cached.timestamp
    const isExpired = age > ttl

    if (isExpired) {
      console.log(`⏰ Caché expirado para: ${key} (edad: ${age}ms, TTL: ${ttl}ms)`)
    }

    return isExpired
  } catch (error) {
    console.error(`❌ Error verificando expiración ${key}:`, error)
    return true
  }
}

/**
 * Limpiar un caché específico
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key)
    console.log(`🗑️ Caché limpiado: ${key}`)
  } catch (error) {
    console.error(`❌ Error limpiando caché ${key}:`, error)
  }
}

/**
 * Limpiar TODO el caché
 */
export function clearAllCache(): void {
  try {
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
    console.log(`🗑️ Todo el caché fue limpiado`)
  } catch (error) {
    console.error(`❌ Error limpiando todo el caché:`, error)
  }
}

/**
 * Forzar recarga de la página sin caché
 * Útil cuando detectamos versión nueva
 */
export function forcePageRefresh(): void {
  console.warn(`🔄 Forzando recarga sin caché...`)
  // Limpiar caché del navegador
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name))
    })
  }
  // Recargar
  window.location.href = window.location.href
}

/**
 * Hook para verificar si hay versión nueva disponible
 * (útil si tienes endpoint que retorna versión actual)
 */
export async function checkForNewVersion(): Promise<boolean> {
  try {
    // Aquí puedes hacer un fetch a un endpoint que retorna la versión del servidor
    // Por ahora, solo comparamos con APP_VERSION
    const storedVersion = localStorage.getItem(CACHE_KEYS.APP_VERSION)
    const hasNewVersion = storedVersion !== APP_VERSION

    if (hasNewVersion) {
      console.warn(`🚀 Nueva versión detectada: ${APP_VERSION}`)
      clearAllCache()
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ Error verificando versión:`, error)
    return false
  }
}

/**
 * Sincronizar datos: obtener del caché si es válido, sino desde Supabase
 */
export async function syncData<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  console.log(`🔄 Sincronizando: ${key}`)

  // 1. Verificar si hay caché válido
  if (!isCacheExpired(key, ttl)) {
    const cached = getCachedData<T>(key)
    if (cached) {
      console.log(`✅ Usando caché válido para: ${key}`)
      return cached
    }
  }

  // 2. Si no hay caché válido, fetchar datos nuevos
  console.log(`📡 Fetchando datos nuevos para: ${key}`)
  const data = await fetchFn()
  setCachedData(key, data)
  return data
}

/**
 * Sistema de notificación de cambios
 * Emitir eventos cuando la data cambió
 */
const dataChangeListeners: Map<string, Set<() => void>> = new Map()

export function onDataChange(key: string, callback: () => void): () => void {
  if (!dataChangeListeners.has(key)) {
    dataChangeListeners.set(key, new Set())
  }
  dataChangeListeners.get(key)!.add(callback)

  // Retornar función para desuscribirse
  return () => {
    dataChangeListeners.get(key)?.delete(callback)
  }
}

export function notifyDataChange(key: string): void {
  console.log(`📢 Notificando cambios para: ${key}`)
  dataChangeListeners.get(key)?.forEach((callback) => callback())
}

/**
 * Inicializar verificación de versión en background
 * Ejecutar esto al montar la app
 */
export function initCacheManager(): void {
  console.log(`🚀 Cache Manager inicializado (v${APP_VERSION})`)

  // Guardar versión actual
  localStorage.setItem(CACHE_KEYS.APP_VERSION, APP_VERSION)

  // Verificar versión cada 30 segundos
  setInterval(() => {
    checkForNewVersion()
  }, 30000)

  // Escuchar cuando el usuario regresa a la ventana
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log(`👁️ Usuario regresó a la ventana, verificando actualizaciones...`)
      checkForNewVersion()
    }
  })

  // Escuchar cambios de storage (si otra pestaña actualizó el cache)
  window.addEventListener('storage', (event) => {
    if (event.key === CACHE_KEYS.APP_VERSION && event.newValue !== APP_VERSION) {
      console.warn(`⚠️ Versión cambió en otra pestaña, recargando...`)
      forcePageRefresh()
    }
  })
}
