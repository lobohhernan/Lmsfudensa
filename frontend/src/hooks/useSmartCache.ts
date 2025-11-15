/**
 * useSmartCache - Hook de React para manejo inteligente de caché
 * 
 * Uso:
 * const { data, loading, error, refetch } = useSmartCache(
 *   'courses',
 *   () => supabase.from('courses').select('*'),
 *   CACHE_TTL.COURSES
 * )
 */

import { useEffect, useState } from 'react'
import {
  CACHE_KEYS,
  onDataChange,
  syncData,
} from '../lib/cacheManager'

interface UseSmartCacheOptions<T> {
  cacheKey: string
  fetcher: () => Promise<T>
  ttl: number
  onError?: (error: Error) => void
}

interface UseSmartCacheReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  invalidateCache: () => void
}

export function useSmartCache<T>({
  cacheKey,
  fetcher,
  ttl,
  onError,
}: UseSmartCacheOptions<T>): UseSmartCacheReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar syncData que maneja caché automáticamente
      const result = await syncData(cacheKey, ttl, fetcher)
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
      console.error(`❌ Error en useSmartCache (${cacheKey}):`, error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [cacheKey])

  // Escuchar cambios de data desde otros componentes/pestañas
  useEffect(() => {
    const unsubscribe = onDataChange(cacheKey, () => {
      console.log(`🔄 Datos cambiaron externamente, recargar: ${cacheKey}`)
      loadData()
    })

    return unsubscribe
  }, [cacheKey])

  // Refetch manual
  const refetch = async () => {
    console.log(`🔃 Refetch manual para: ${cacheKey}`)
    await loadData()
  }

  // Invalidar caché
  const invalidateCache = () => {
    console.log(`🗑️ Invalidando caché: ${cacheKey}`)
    localStorage.removeItem(cacheKey)
    loadData()
  }

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache,
  }
}

/**
 * Hook específico para cursos con refresh automático
 */
export function useCoursesWithCache(supabase: any) {
  return useSmartCache({
    cacheKey: CACHE_KEYS.COURSES,
    fetcher: async () => {
      const { data, error } = await supabase.from('courses').select('*')
      if (error) throw error
      return data
    },
    ttl: 5 * 60 * 1000, // 5 minutos
    onError: (error) => console.error('Error cargando cursos:', error),
  })
}

/**
 * Hook específico para usuarios con refresh automático
 */
export function useUsersWithCache(supabase: any) {
  return useSmartCache({
    cacheKey: CACHE_KEYS.USERS,
    fetcher: async () => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      return data
    },
    ttl: 10 * 60 * 1000, // 10 minutos
    onError: (error) => console.error('Error cargando usuarios:', error),
  })
}

/**
 * Hook específico para lecciones con refresh automático
 */
export function useLessonsWithCache(supabase: any, courseId: string) {
  return useSmartCache({
    cacheKey: `${CACHE_KEYS.LESSONS}_${courseId}`,
    fetcher: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data
    },
    ttl: 3 * 60 * 1000, // 3 minutos
    onError: (error) => console.error(`Error cargando lecciones de ${courseId}:`, error),
  })
}
