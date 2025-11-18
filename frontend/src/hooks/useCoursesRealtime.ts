import { useEffect, useState } from 'react'
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

export function useCoursesRealtime() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          // Realtime event handling (logs removidos para performance)

          if (payload.eventType === 'INSERT') {
            // Add new course
            const newCourse = payload.new as Course
            setCourses((prev) => [newCourse, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            // Update existing course
            const updatedCourse = payload.new as Course
            setCourses((prev) =>
              prev.map((course) =>
                course.id === updatedCourse.id ? updatedCourse : course
              )
            )
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted course
            const deletedCourse = payload.old as Course
            setCourses((prev) =>
              prev.filter((course) => course.id !== deletedCourse.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      // Cleanup subscription
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      
      // ✅ Intentar con timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout al cargar cursos')), 10000)
      );
      
      const fetchPromise = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error: queryError } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (queryError) {
        console.error('❌ Error en query de cursos:', queryError);
        throw queryError;
      }

      // Convert students: 0 to undefined
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
      const message =
        err instanceof Error ? err.message : 'Error fetching courses'
      console.error('❌ [useCoursesRealtime] Error fetching courses:', err)
      setError(message)
      
      // ✅ Si hay error, intentar limpiar cache corrupto
      if (message.includes('Timeout') || message.includes('406')) {
        console.warn('⚠️ Posible cache corrupto, limpiando...');
        try {
          // Limpiar localStorage relacionado con supabase
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('supabase')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          console.log(`🗑️ Cache limpiado: ${keysToRemove.length} elementos`);
        } catch (cleanErr) {
          console.error('Error limpiando cache:', cleanErr);
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
