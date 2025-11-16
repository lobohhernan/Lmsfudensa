/**
 * Cache Manager - SIMPLIFICADO
 * 
 * Sistema de caché eliminado para proyectos pequeños.
 * Solo mantiene constantes por compatibilidad con código existente.
 */

// Versión de la app
export const APP_VERSION = '1.0.0'

// Claves de caché (solo por compatibilidad, no se usan)
export const CACHE_KEYS = {
  COURSES: 'lms_courses',
  USERS: 'lms_users',
  LESSONS: 'lms_lessons',
  EVALUATIONS: 'lms_evaluations',
  APP_VERSION: 'lms_app_version',
  LAST_SYNC: 'lms_last_sync',
} as const

// TTL (solo por compatibilidad, no se usan)
export const CACHE_TTL = {
  COURSES: 5 * 60 * 1000,
  USERS: 10 * 60 * 1000,
  LESSONS: 3 * 60 * 1000,
  EVALUATIONS: 5 * 60 * 1000,
} as const

// Funciones dummy para compatibilidad - NO hacen nada
export function getCachedData<T>(_key: string): T | null {
  return null
}

export function setCachedData<T>(_key: string, _data: T): void {
  return
}

export function isCacheExpired(_key: string, _ttl: number): boolean {
  return true
}

export function clearCache(_key: string): void {
  return
}

export function clearAllCache(): void {
  return
}

export function onDataChange(_key: string, _callback: () => void): () => void {
  return () => {}
}

export function notifyDataChange(_key: string): void {
  return
}

export function initCacheManager(): void {
  return
}
