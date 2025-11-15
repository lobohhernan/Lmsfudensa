import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseSupabaseQueryOptions {
  cacheTime?: number; // Tiempo de caché en ms (default: 5 minutos)
  enabled?: boolean; // Si está habilitado para ejecutarse automáticamente
  refetchOnMount?: boolean; // Re-fetch cuando el componente monta
}

// Cache global para compartir datos entre componentes
const queryCache = new Map<string, CacheEntry<any>>();

/**
 * Hook personalizado para queries a Supabase con caché automático
 * Reduce re-fetches innecesarios y mejora el rendimiento
 */
export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: UseSupabaseQueryOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutos por defecto
    enabled = true,
    refetchOnMount = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Verificar si hay datos en caché válidos
    const cached = queryCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await queryFn();
      
      if (isMountedRef.current) {
        setData(result);
        // Guardar en caché
        queryCache.set(queryKey, {
          data: result,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryKey, queryFn, enabled, cacheTime]);

  useEffect(() => {
    isMountedRef.current = true;

    // Solo fetch si está enabled y (no ha hecho fetch o refetchOnMount está activado)
    if (enabled && (!hasFetchedRef.current || refetchOnMount)) {
      fetchData();
      hasFetchedRef.current = true;
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData, enabled, refetchOnMount]);

  // Función para forzar refetch manual
  const refetch = useCallback(() => {
    // Invalida el caché para esta query
    queryCache.delete(queryKey);
    fetchData();
  }, [queryKey, fetchData]);

  // Función para actualizar datos en caché sin refetch
  const mutate = useCallback((newData: T) => {
    setData(newData);
    queryCache.set(queryKey, {
      data: newData,
      timestamp: Date.now(),
    });
  }, [queryKey]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
}

/**
 * Hook para invalidar caché manualmente
 */
export function useInvalidateQuery() {
  return useCallback((queryKey: string | string[]) => {
    if (Array.isArray(queryKey)) {
      queryKey.forEach(key => queryCache.delete(key));
    } else {
      queryCache.delete(queryKey);
    }
  }, []);
}

/**
 * Limpia toda la caché
 */
export function clearQueryCache() {
  queryCache.clear();
}
