import { useState, useEffect } from 'react'
import { supabaseAdmin, isAdminClientConfigured } from '../lib/supabaseAdmin'
import { supabase } from '../lib/supabase'

/**
 * Hook que devuelve el conteo real de alumnos inscriptos por curso,
 * con actualizaciones en tiempo real vía Supabase Realtime.
 *
 * Solo usar en el panel admin.
 */
export function useEnrollmentCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Usar supabaseAdmin cuando está disponible (bypasea RLS)
    // En caso contrario, se cae al cliente normal (admins tienen política de lectura)
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase

    const fetchCounts = async () => {
      const { data, error } = await client
        .from('enrollments')
        .select('course_id')

      if (error) {
        console.error('useEnrollmentCounts: error al cargar inscripciones', error)
        setLoading(false)
        return
      }

      const map: Record<string, number> = {}
      for (const row of data ?? []) {
        const id = row.course_id as string
        map[id] = (map[id] || 0) + 1
      }
      setCounts(map)
      setLoading(false)
    }

    fetchCounts()

    // Suscripción en tiempo real a la tabla enrollments
    const channel = supabase
      .channel('enrollment-counts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'enrollments' },
        (payload) => {
          const courseId = (payload.new as { course_id: string }).course_id
          if (!courseId) return
          setCounts((prev) => ({ ...prev, [courseId]: (prev[courseId] || 0) + 1 }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'enrollments' },
        (payload) => {
          const courseId = (payload.old as { course_id: string }).course_id
          if (!courseId) return
          setCounts((prev) => ({
            ...prev,
            [courseId]: Math.max(0, (prev[courseId] || 1) - 1),
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { counts, loading }
}
