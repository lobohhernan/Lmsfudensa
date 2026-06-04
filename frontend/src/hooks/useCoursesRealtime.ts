import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const MAX_RETRIES = 2
const RETRY_DELAY = 2500

interface Course {
  id: string
  title: string
  slug: string
  description: string
  full_description: string
  image: string
  instructor_id: string
  price: number
  duration: string
  level: string
  certified: boolean
  students?: number
  category: string
  rating: number
  reviews: number
  created_at: string
  updated_at: string
  is_active: boolean
}

/**
 * Sorts a course array: active courses first (ordered by created_at DESC),
 * then inactive courses (ordered by created_at DESC) at the end.
 */
function sortCourses(list: Course[]): Course[] {
  const active = list.filter(c => c.is_active !== false).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const inactive = list.filter(c => c.is_active === false).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return [...active, ...inactive]
}

export function useCoursesRealtime() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [inactiveLoading, setInactiveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // Stage 1: load active courses immediately
    fetchActiveCourses()

    // Subscribe to realtime changes for all courses
    const channel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        (payload) => {
          if (!mountedRef.current) return

          if (payload.eventType === 'INSERT') {
            const newCourse = { ...payload.new as Course, is_active: (payload.new as any).is_active !== false }
            setCourses((prev) => sortCourses([newCourse, ...prev]))
          } else if (payload.eventType === 'UPDATE') {
            const updatedCourse = payload.new as Course
            setCourses((prev) =>
              sortCourses(prev.map((course) =>
                course.id === updatedCourse.id ? updatedCourse : course
              ))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedCourse = payload.old as Course
            setCourses((prev) =>
              prev.filter((course) => course.id !== deletedCourse.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      mountedRef.current = false
      supabase.removeChannel(channel)
    }
  }, [])

  /** Stage 1: fetch only active courses, render immediately */
  const fetchActiveCourses = async (retryCount = 0) => {
    try {
      setLoading(true)
      console.log('📡 [useCoursesRealtime] Fetching active courses...')

      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!mountedRef.current) return
      if (queryError) throw queryError

      const processed = (data || []).map((course) => ({
        ...course,
        is_active: true,
        students: course.students && course.students > 0 ? course.students : undefined,
      }))

      setCourses(processed)
      setError(null)


      // Stage 2: defer loading inactive courses after active ones are rendered
      fetchInactiveCourses()
    } catch (err) {
      if (!mountedRef.current) return

      const isAbortError = err instanceof DOMException && err.name === 'AbortError'
      const isTransient = isAbortError || (err instanceof Error && err.message.includes('Failed to fetch'))

      if (isTransient && retryCount < MAX_RETRIES) {

        setTimeout(() => {
          if (mountedRef.current) fetchActiveCourses(retryCount + 1)
        }, RETRY_DELAY)
        return
      }

      const message = err instanceof Error ? err.message : 'Error fetching courses'
      console.error('[useCoursesRealtime] Error fetching active courses:', err)
      setError(message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  /** Stage 2: fetch inactive courses and append to end of list */
  const fetchInactiveCourses = async () => {
    if (!mountedRef.current) return
    try {
      setInactiveLoading(true)

      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false })

      if (!mountedRef.current) return
      if (queryError) {

        return
      }

      const inactive = (data || []).map((course) => ({
        ...course,
        is_active: false,
        students: course.students && course.students > 0 ? course.students : undefined,
      }))

      if (inactive.length > 0) {
        setCourses((prev) => {
          // Remove any inactive courses that might have come via realtime, then append
          const activeOnly = prev.filter(c => c.is_active !== false)
          return [...activeOnly, ...inactive]
        })

      }
    } catch (err) {

    } finally {
      if (mountedRef.current) setInactiveLoading(false)
    }
  }

  const refetch = () => fetchActiveCourses()

  return { courses, loading, inactiveLoading, error, refetch }
}
