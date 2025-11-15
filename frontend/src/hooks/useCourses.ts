import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabaseQuery } from './useSupabaseQuery'

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
  const fetchCourses = useCallback(async () => {
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
    
    return processedData
  }, [])

  const { data: courses, loading, error, refetch } = useSupabaseQuery<Course[]>(
    'courses-all',
    fetchCourses,
    { cacheTime: 5 * 60 * 1000 } // 5 minutos de caché
  )

  return { 
    courses: courses || [], 
    loading, 
    error: error?.message || null, 
    refetch 
  }
}

export function useCourseDetail(courseId: string) {
  const fetchCourse = useCallback(async () => {
    if (!courseId) throw new Error('Course ID is required')
    
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
    
    return processedData
  }, [courseId])

  const { data: course, loading, error, refetch } = useSupabaseQuery<Course | null>(
    `course-${courseId}`,
    fetchCourse,
    { 
      cacheTime: 3 * 60 * 1000, // 3 minutos de caché
      enabled: !!courseId 
    }
  )

  return { 
    course, 
    loading, 
    error: error?.message || null, 
    refetch 
  }
}

export function useCoursesByCategory(category: string) {
  const fetchCourses = useCallback(async () => {
    if (!category) throw new Error('Category is required')
    
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
    
    return processedData
  }, [category])

  const { data: courses, loading, error, refetch } = useSupabaseQuery<Course[]>(
    `courses-category-${category}`,
    fetchCourses,
    { 
      cacheTime: 5 * 60 * 1000, // 5 minutos de caché
      enabled: !!category 
    }
  )

  return { 
    courses: courses || [], 
    loading, 
    error: error?.message || null, 
    refetch 
  }
}
