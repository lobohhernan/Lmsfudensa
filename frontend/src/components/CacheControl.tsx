/**
 * CacheControl - Componente UI para visualizar y controlar el caché
 * Mostrar al usuario el estado del caché y permitir limpiarlo
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  clearAllCache,
  clearCache,
  checkForNewVersion,
  CACHE_KEYS,
  APP_VERSION,
} from '@/lib/cacheManager'

export function CacheControl() {
  const [cacheSize, setCacheSize] = useState<string>('0 bytes')
  const [itemCount, setItemCount] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [hasNewVersion, setHasNewVersion] = useState(false)

  // Calcular tamaño del caché
  const updateCacheStats = () => {
    let totalSize = 0
    let count = 0

    Object.values(CACHE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += item.length
        count++
      }
    })

    const sizeInKB = (totalSize / 1024).toFixed(2)
    setCacheSize(`${sizeInKB} KB`)
    setItemCount(count)

    const lastSyncTime = localStorage.getItem(CACHE_KEYS.LAST_SYNC)
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime))
    }
  }

  useEffect(() => {
    updateCacheStats()
    const interval = setInterval(updateCacheStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleClearAll = () => {
    if (window.confirm('¿Limpiar TODO el caché? Los datos se recargarán desde la BD.')) {
      clearAllCache()
      updateCacheStats()
      window.location.href = window.location.href
    }
  }

  const handleCheckVersion = async () => {
    const isNew = await checkForNewVersion()
    setHasNewVersion(isNew)
    if (isNew) {
      setTimeout(() => {
        window.location.href = window.location.href
      }, 2000)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">📦 Estado del Caché</h3>
        <Badge variant="outline">v{APP_VERSION}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-600">Tamaño</p>
          <p className="font-mono font-bold">{cacheSize}</p>
        </div>
        <div>
          <p className="text-gray-600">Elementos</p>
          <p className="font-mono font-bold">{itemCount}</p>
        </div>
      </div>

      {lastSync && (
        <div className="text-xs text-gray-600">
          Última sincronización: <span className="font-mono">{lastSync.toLocaleTimeString()}</span>
        </div>
      )}

      {hasNewVersion && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800 text-xs">
            ✅ Nueva versión detectada. Recargando...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={handleCheckVersion}
        >
          🔍 Verificar versión
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="text-xs"
          onClick={handleClearAll}
        >
          🗑️ Limpiar caché
        </Button>
      </div>
    </div>
  )
}
