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
          console.log('📡 Realtime event:', payload.eventType, payload.new || payload.old)

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
      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching courses'
      setError(message)
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
