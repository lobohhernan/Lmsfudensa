/**
 * Cache Manager - Sistema de invalidación inteligente de caché
 * 
 * Soluciona el problema de caché corrupta en navegadores
 * Asegura que los usuarios siempre vean datos actualizados
 */

// Detectar entorno navegador de forma segura
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
import { debug, info, warn, error as logError } from './logger'

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
 * DESHABILITADO: Siempre retorna null para reducir uso de localStorage
 * Optimización: datos siempre frescos desde la base de datos
 */
export function getCachedData<T>(key: string): T | null {
  // Cache deshabilitado para reducir uso de memoria
  return null
}

/**
 * Guardar datos en el caché con timestamp y versión
 * DESHABILITADO: No guarda nada para reducir uso de localStorage
 */
export function setCachedData<T>(key: string, data: T): void {
  // Cache deshabilitado - no guardar nada en localStorage
  return
}

/**
 * Verificar si el caché ha expirado
 */
export function isCacheExpired(key: string, ttl: number): boolean {
  if (!isBrowser) return true
  
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return true

    const cached: CacheEntry<unknown> = JSON.parse(stored)
    const age = Date.now() - cached.timestamp
    const isExpired = age > ttl

    if (isExpired) {
      debug(`⏰ Caché expirado para: ${key} (edad: ${age}ms, TTL: ${ttl}ms)`)
    }

    return isExpired
  } catch (error) {
    logError(`❌ Error verificando expiración ${key}:`, error)
    return true
  }
}

/**
 * Limpiar un caché específico
 */
export function clearCache(key: string): void {
  if (!isBrowser) return
  
    try {
      localStorage.removeItem(key)
      debug(`🗑️ Caché limpiado: ${key}`)
    } catch (error) {
      logError(`❌ Error limpiando caché ${key}:`, error)
    }
}

/**
 * Limpiar TODO el caché
 */
export function clearAllCache(): void {
  if (!isBrowser) return
  
    try {
      Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
      debug(`🗑️ Todo el caché fue limpiado`)
    } catch (error) {
      logError(`❌ Error limpiando todo el caché:`, error)
    }
}

/**
 * Forzar recarga de la página sin caché
 * Útil cuando detectamos versión nueva
 */
export function forcePageRefresh(): void {
  if (!isBrowser) return
  
  warn(`🔄 Forzando recarga sin caché...`)
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
  if (!isBrowser) return false
  
  try {
    // Aquí puedes hacer un fetch a un endpoint que retorna la versión del servidor
    // Por ahora, solo comparamos con APP_VERSION
    const storedVersion = localStorage.getItem(CACHE_KEYS.APP_VERSION)
    const hasNewVersion = storedVersion !== APP_VERSION

    if (hasNewVersion) {
      warn(`🚀 Nueva versión detectada: ${APP_VERSION}`)
      clearAllCache()
      localStorage.setItem(CACHE_KEYS.APP_VERSION, APP_VERSION)
      return true
    }

    return false
  } catch (error) {
    logError(`❌ Error verificando versión:`, error)
    return false
  }
}

/**
 * Sincronizar datos: siempre obtiene datos frescos desde Supabase
 * OPTIMIZADO: Sin caché para reducir uso de localStorage
 */
export async function syncData<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Siempre fetchar datos frescos - sin caché
  return await fetchFn()
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
  debug(`📢 Notificando cambios para: ${key}`)
  dataChangeListeners.get(key)?.forEach((callback) => callback())
}

/**
 * Inicializar Cache Manager
 * OPTIMIZADO: Limpia todo el caché al inicio y deshabilita checks periódicos
 */
export function initCacheManager(): void {
  if (!isBrowser) return

  debug(`🚀 Cache Manager inicializado (v${APP_VERSION}) - Modo sin caché`)

  try {
    // Limpiar TODO el caché al iniciar para liberar espacio
    clearAllCache()
    // Solo guardar versión para referencia
    localStorage.setItem(CACHE_KEYS.APP_VERSION, APP_VERSION)
  } catch (error) {
    logError(`❌ Error inicializando Cache Manager:`, error)
  }

  // NO hacer checks periódicos para reducir carga
}
