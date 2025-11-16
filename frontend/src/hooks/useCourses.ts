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

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      // Convert students: 0 to undefined so CourseCard doesn't render the footer
      const processedData = (data || []).map(course => ({
        ...course,
        students: course.students && course.students > 0 ? course.students : undefined
      }))
      setCourses(processedData)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching courses'
      setError(message)
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}

export function useCourseDetail(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (queryError) throw queryError
      // Convert students: 0 to undefined
      const processedData = data ? {
        ...data,
        students: data.students && data.students > 0 ? data.students : undefined
      } : null
      setCourse(processedData)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching course'
      setError(message)
      console.error('Error fetching course:', err)
    } finally {
      setLoading(false)
    }
  }

  return { course, loading, error, refetch: fetchCourse }
}

export function useCoursesByCategory(category: string) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!category) return
    fetchCourses()
  }, [category])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('courses')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      // Convert students: 0 to undefined
      const processedData = (data || []).map(course => ({
        ...course,
        students: course.students && course.students > 0 ? course.students : undefined
      }))
      setCourses(processedData)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching courses'
      setError(message)
      console.error('Error fetching courses by category:', err)
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch: fetchCourses }
}
