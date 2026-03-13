import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { debug, error as logError } from '@/lib/logger'

export interface Teacher {
  id: string
  user_id?: string
  full_name: string
  email: string
  bio?: string
  avatar_url?: string
  specialization?: string
  years_of_experience: number
  rating: number
  total_students: number
  total_courses: number
  hourly_rate?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Sorts teachers: active first (by created_at DESC), inactive last (by created_at DESC)
 */
function sortTeachers(list: Teacher[]): Teacher[] {
  const active = list.filter(t => t.is_active !== false).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const inactive = list.filter(t => t.is_active === false).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return [...active, ...inactive]
}

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('teachers')
        .select('*')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setTeachers(sortTeachers(data || []))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching teachers'
      setError(message)
      console.error('Error fetching teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  return { teachers, loading, error, refetch: fetchTeachers }
}

export function useTeachersRealtime() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [inactiveLoading, setInactiveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Stage 1: load active teachers
    fetchActiveTeachers()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('teachers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teachers' },
        (payload) => {
          debug('📡 Teachers realtime event:', payload.eventType)

          if (payload.eventType === 'INSERT') {
            const newTeacher = payload.new as Teacher
            setTeachers((prev) => sortTeachers([newTeacher, ...prev]))
          } else if (payload.eventType === 'UPDATE') {
            const updatedTeacher = payload.new as Teacher
            setTeachers((prev) =>
              sortTeachers(prev.map((teacher) =>
                teacher.id === updatedTeacher.id ? updatedTeacher : teacher
              ))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedTeacher = payload.old as Teacher
            setTeachers((prev) =>
              prev.filter((teacher) => teacher.id !== deletedTeacher.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /** Stage 1: fetch only active teachers, render immediately */
  const fetchActiveTeachers = async () => {
    try {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setTeachers(data || [])
      setError(null)
      console.log(`✅ [useTeachersRealtime] ${(data || []).length} active teachers loaded`)

      // Stage 2: defer loading inactive teachers
      fetchInactiveTeachers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching teachers'
      setError(message)
      logError('Error fetching active teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  /** Stage 2: fetch inactive teachers and append at end */
  const fetchInactiveTeachers = async () => {
    try {
      setInactiveLoading(true)
      const { data, error: queryError } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false })

      if (queryError) {
        console.warn('⚠️ [useTeachersRealtime] Could not load inactive teachers:', queryError.message)
        return
      }

      const inactive = data || []
      if (inactive.length > 0) {
        setTeachers((prev) => {
          const activeOnly = prev.filter(t => t.is_active !== false)
          return [...activeOnly, ...inactive]
        })
        console.log(`✅ [useTeachersRealtime] ${inactive.length} inactive teachers appended`)
      }
    } catch (err) {
      console.warn('⚠️ [useTeachersRealtime] Error loading inactive teachers:', err)
    } finally {
      setInactiveLoading(false)
    }
  }

  const refetch = () => fetchActiveTeachers()

  return { teachers, loading, inactiveLoading, error, refetch }
}
