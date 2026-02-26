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
}

export function useCoursesRealtime() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // Initial fetch
    fetchCourses()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        (payload) => {
          if (!mountedRef.current) return

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
      mountedRef.current = false
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchCourses = async (retryCount = 0) => {
    try {
      setLoading(true)
      console.log('📡 [useCoursesRealtime] fetchCourses CALLED, retry:', retryCount)
      
      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!mountedRef.current) return

      if (queryError) {
        console.error('❌ Error en query de cursos:', queryError);
        throw queryError;
      }

      const processedData = (data || []).map((course) => ({
        ...course,
        students:
          course.students && course.students > 0
            ? course.students
            : undefined,
      }))
      
      setCourses(processedData)
      setError(null)
      console.log(`✅ [useCoursesRealtime] ${processedData.length} cursos cargados`);
    } catch (err) {
      if (!mountedRef.current) return

      // Reintentar AbortError o errores transitorios
      const isAbortError = err instanceof DOMException && err.name === 'AbortError'
      const isTransient = isAbortError || (err instanceof Error && err.message.includes('Failed to fetch'))

      if (isTransient && retryCount < MAX_RETRIES) {
        console.warn(`⚠️ [useCoursesRealtime] Error transitorio (${retryCount + 1}/${MAX_RETRIES}), reintentando en ${RETRY_DELAY}ms...`)
        setTimeout(() => {
          if (mountedRef.current) fetchCourses(retryCount + 1)
        }, RETRY_DELAY)
        return
      }

      const message =
        err instanceof Error ? err.message : 'Error fetching courses'
      console.error('❌ [useCoursesRealtime] Error fetching courses:', err)
      setError(message)
      // ⚠️ NUNCA limpiar localStorage aquí: borraría el token de autenticación
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
