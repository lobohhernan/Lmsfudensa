import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

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
}

const FETCH_TIMEOUT_MS = 15_000  // 15 seconds (generous for cold starts)
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 2_000     // 2 seconds between retries

export function useCoursesRealtime() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const retryCount = useRef(0)

  useEffect(() => {
    // Initial fetch
    fetchCourses()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCourse = payload.new as Course
            setCourses((prev) => [newCourse, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedCourse = payload.new as Course
            setCourses((prev) =>
              prev.map((course) =>
                course.id === updatedCourse.id ? updatedCourse : course
              )
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
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout al cargar cursos')), FETCH_TIMEOUT_MS)
      )

      const fetchPromise = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error: queryError } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any

      if (queryError) {
        console.error('❌ Error en query de cursos:', queryError)
        throw queryError
      }

      // Convert students: 0 to undefined
      const processedData = (data || []).map((course: Course) => ({
        ...course,
        students:
          course.students && course.students > 0
            ? course.students
            : undefined,
      }))

      setCourses(processedData)
      setError(null)
      retryCount.current = 0
      console.log(`✅ [useCoursesRealtime] ${processedData.length} cursos cargados`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching courses'
      console.error('❌ [useCoursesRealtime] Error fetching courses:', err)

      // Retry automatically on transient errors (timeout, 406)
      if (
        (message.includes('Timeout') || message.includes('406')) &&
        retryCount.current < MAX_RETRIES
      ) {
        retryCount.current++
        console.warn(
          `⚠️ [useCoursesRealtime] Reintentando (${retryCount.current}/${MAX_RETRIES}) en ${RETRY_DELAY_MS}ms...`
        )
        setTimeout(() => fetchCourses(), RETRY_DELAY_MS)
        return // don't set loading=false yet — the retry will handle it
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
