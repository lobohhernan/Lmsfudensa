import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setTeachers(data || [])
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    fetchTeachers()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('teachers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teachers' },
        (payload) => {
          console.log('📡 Teachers realtime event:', payload.eventType)

          if (payload.eventType === 'INSERT') {
            const newTeacher = payload.new as Teacher
            setTeachers((prev) => [newTeacher, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedTeacher = payload.new as Teacher
            setTeachers((prev) =>
              prev.map((teacher) =>
                teacher.id === updatedTeacher.id ? updatedTeacher : teacher
              )
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

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setTeachers(data || [])
      setError(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching teachers'
      setError(message)
      console.error('Error fetching teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  return { teachers, loading, error, refetch: fetchTeachers }
}
