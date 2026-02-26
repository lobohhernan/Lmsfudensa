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

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 2_500

export function useCoursesRealtime() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const retryCount = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    fetchCourses()

    const channel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        (payload) => {
          if (!mounted.current) return
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
      mounted.current = false
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchCourses = async () => {
    try {
      if (mounted.current) setLoading(true)

      // Query directa sin timeout artificial — dejamos que Supabase maneje sus propios tiempos
      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!mounted.current) return

      if (queryError) {
        console.error('❌ Error en query de cursos:', queryError)
        throw new Error(queryError.message || 'Error en query')
      }

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
      if (!mounted.current) return

      const message =
        err instanceof Error ? err.message : 'Error fetching courses'
      console.error('❌ [useCoursesRealtime] Error fetching courses:', err)

      // Reintentar en errores transitorios (AbortError, network, timeout, 406)
      const isTransient =
        message.includes('abort') || message.includes('Abort') ||
        message.includes('Timeout') || message.includes('406') ||
        message.includes('Failed to fetch') || message.includes('NetworkError') ||
        message.includes('signal')

      if (isTransient && retryCount.current < MAX_RETRIES) {
        retryCount.current++
        console.warn(
          `⚠️ [useCoursesRealtime] Reintentando (${retryCount.current}/${MAX_RETRIES}) en ${RETRY_DELAY_MS}ms...`
        )
        setTimeout(() => {
          if (mounted.current) fetchCourses()
        }, RETRY_DELAY_MS)
        return
      }

      setError(message)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
