/**
 * useFetcher - Hook genérico de data fetching
 * 
 * Ejecuta un fetcher asíncrono y gestiona los estados loading/error/data.
 */

import { useEffect, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { CACHE_KEYS } from '../lib/cacheManager'
import { error as logError } from '../lib/logger'

interface UseFetcherOptions<T> {
  /** Clave estable para re-fetch cuando cambia */
  key: string
  fetcher: () => Promise<T>
  onError?: (error: Error) => void
}

interface UseFetcherReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFetcher<T>({
  key,
  fetcher,
  onError,
}: UseFetcherOptions<T>): UseFetcherReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
      logError(`❌ Error fetching data (${key}):`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [key])

  const refetch = async () => {
    await loadData()
  }

  return {
    data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook específico para cursos con refresh automático
 */
export function useCoursesWithCache(supabase: SupabaseClient) {
  return useFetcher({
    key: CACHE_KEYS.COURSES,
    fetcher: async () => {
      const { data, error } = await supabase.from('courses').select('*')
      if (error) throw error
      return data
    },
    onError: (error) => logError('Error cargando cursos:', error),
  })
}

/**
 * Hook específico para usuarios con refresh automático
 */
export function useUsersWithCache(supabase: SupabaseClient) {
  return useFetcher({
    key: CACHE_KEYS.USERS,
    fetcher: async () => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      return data
    },
    onError: (error) => logError('Error cargando usuarios:', error),
  })
}

/**
 * Hook específico para lecciones con refresh automático
 */
export function useLessonsWithCache(supabase: SupabaseClient, courseId: string) {
  return useFetcher({
    key: `${CACHE_KEYS.LESSONS}_${courseId}`,
    fetcher: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data
    },
    onError: (error) => logError(`Error cargando lecciones de ${courseId}:`, error),
  })
}
