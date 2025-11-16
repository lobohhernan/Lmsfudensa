import { useEffect } from 'react'
import { debug } from '../lib/logger'

/**
 * Hook SIMPLIFICADO - Solo limpia storage si excede quota
 * Protege sesiones de Supabase
 */
export function useStorageCleanup() {
  useEffect(() => {
    const checkQuota = () => {
      try {
        if (!window.localStorage) return

        // Solo calcular tamaño total
        let totalSize = 0
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!key) continue
          const value = localStorage.getItem(key) || ''
          totalSize += new Blob([value]).size
        }

        const sizeMB = totalSize / 1024 / 1024
        
        // Solo actuar si es MUY grande (más de 200MB)
        if (sizeMB > 200) {
          debug(`⚠️ LocalStorage muy grande: ${sizeMB.toFixed(2)} MB - limpiando cache...`)
          
          // Remover solo keys de cache, NO auth
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && !key.includes('supabase') && !key.includes('sb-') && key.includes('cache')) {
              keysToRemove.push(key)
            }
          }
          
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key)
            } catch (e) {
              // Ignorar errores
            }
          })
          
          debug(`✅ ${keysToRemove.length} items de cache eliminados`)
        }
      } catch (error) {
        // Solo manejar QuotaExceededError
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          // Limpiar todo excepto auth
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && !key.includes('supabase') && !key.includes('sb-')) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key)
            } catch (e) {
              // Ignorar
            }
          })
        }
      }
    }

    // Ejecutar después de 1 segundo (no urgente)
    const timeoutId = setTimeout(checkQuota, 1000)
    return () => clearTimeout(timeoutId)
  }, [])
}
