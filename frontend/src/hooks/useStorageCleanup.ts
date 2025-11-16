import { useEffect } from 'react'
import { debug, warn, error as logError } from '../lib/logger'

/**
 * Hook que detecta y limpia storage corrupto automáticamente
 * Si el localStorage ocupa más de 100MB, lo limpia
 */
export function useStorageCleanup() {
  useEffect(() => {
    const checkStorageSize = () => {
      try {
        if (!window.localStorage) return

        // Calcular el tamaño total de localStorage
        let totalSize = 0
        const problematicKeys: string[] = []

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!key) continue

          const value = localStorage.getItem(key) || ''
          const size = new Blob([value]).size
          totalSize += size

          // Si una key individual es mayor a 10MB, es sospechosa
          if (size > 10 * 1024 * 1024) {
            problematicKeys.push(`${key} (${(size / 1024 / 1024).toFixed(2)} MB)`)
          }
        }

        const sizeMB = totalSize / 1024 / 1024

        if (problematicKeys.length > 0) {
          warn(`⚠️ Storage corrupto detectado:`, problematicKeys)
          debug(`Total localStorage: ${sizeMB.toFixed(2)} MB`)

          // Limpiar solo localStorage, mantener sesión
          try {
            localStorage.clear()
            debug('✅ LocalStorage limpiado')
          } catch (e) {
            logError('Error limpiando localStorage:', e)
          }
        } else if (sizeMB > 100) {
          warn(`⚠️ LocalStorage muy grande: ${sizeMB.toFixed(2)} MB`)
          // Limpiar items de cache viejos (supabase auth puede ser culpable)
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.includes('supabase') || key?.includes('cache') || key?.includes('sb-')) {
              keysToRemove.push(key)
            }
          }

          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key)
              debug(`🗑️ Removed: ${key}`)
            } catch (e) {
              logError(`Error removing ${key}:`, e)
            }
          })
        } else if (sizeMB > 10) {
          debug(`📦 LocalStorage size: ${sizeMB.toFixed(2)} MB (normal)`)
        }
      } catch (error) {
        // QuotaExceededError o acceso negado
        if (error instanceof DOMException) {
          if (error.name === 'QuotaExceededError') {
            warn('⚠️ Storage quota excedida, limpiando...')
            try {
              localStorage.clear()
              debug('✅ LocalStorage limpiado por quota excedida')
            } catch (e) {
              logError('Error limpiando localStorage:', e)
            }
          } else if (error.name === 'SecurityError') {
            warn('⚠️ Storage access denied (private mode?)')
          }
        } else {
          logError('Storage check error:', error)
        }
      }
    }

    // Ejecutar en el siguiente tick para no bloquear la inicialización
    const timeoutId = setTimeout(checkStorageSize, 500)

    return () => clearTimeout(timeoutId)
  }, [])
}
