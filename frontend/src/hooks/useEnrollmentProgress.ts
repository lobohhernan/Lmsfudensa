import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/logger'
import { Enrollment } from '../lib/types'

export interface EnrollmentWithProgress {
  id: string
  title: string
  slug: string
  image: string
  progress: number
  currentLesson: string
  totalLessons: number
  completedLessons: number
}

interface LessonRecord {
  id: string
  course_id: string
  title: string
  order_index: number
}

interface ProgressRecord {
  course_id: string
  lesson_id: string
  completed: boolean
  last_accessed_at: string
  lessons?: {
    title?: string
  } | null
}

const COURSE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400'

async function fetchEnrollmentProgressData(userId: string, limit?: number) {
  let enrollmentsQuery = supabase
    .from('enrollments')
    .select(
      `
      id,
      course_id,
      enrolled_at,
      last_accessed_at,
      completed,
      courses (
        id,
        title,
        slug,
        image,
        description
      )
    `
    )
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false })

  if (limit) {
    enrollmentsQuery = enrollmentsQuery.limit(limit)
  }

  const { data: enrollmentsData, error: enrollError } = await enrollmentsQuery

  if (enrollError) {
    throw enrollError
  }

  const enrollments = (enrollmentsData || []) as Enrollment[]
  const courseIds = enrollments.map((enrollment) => enrollment.course_id)

  if (courseIds.length === 0) {
    return []
  }

  const [{ data: lessonsData, error: lessonsError }, progressResult] =
    await Promise.all([
      supabase
        .from('lessons')
        .select('id, course_id, title, order_index')
        .in('course_id', courseIds)
        .order('order_index', { ascending: true }),
      supabase
        .from('user_progress')
        .select('course_id, lesson_id, completed, last_accessed_at, lessons(title)')
        .eq('user_id', userId)
        .in('course_id', courseIds)
        .order('last_accessed_at', { ascending: false }),
    ])

  if (lessonsError) {
    throw lessonsError
  }

  const lessonRows = (lessonsData || []) as LessonRecord[]

  let progressRows: ProgressRecord[] = []
  if (!progressResult.error && progressResult.data) {
    progressRows = progressResult.data as ProgressRecord[]
  }

  const lessonsByCourse = new Map<string, LessonRecord[]>()
  for (const lesson of lessonRows) {
    const existing = lessonsByCourse.get(lesson.course_id) || []
    existing.push(lesson)
    lessonsByCourse.set(lesson.course_id, existing)
  }

  const progressByCourse = new Map<string, ProgressRecord[]>()
  for (const progress of progressRows) {
    const existing = progressByCourse.get(progress.course_id) || []
    existing.push(progress)
    progressByCourse.set(progress.course_id, existing)
  }

  return enrollments.map((enrollment) => {
    const courseId = enrollment.course_id
    const lessonList = lessonsByCourse.get(courseId) || []
    const progressList = progressByCourse.get(courseId) || []

    const totalLessons = lessonList.length
    const completedLessons = progressList.filter((item) => item.completed).length
    const progress =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    const latestProgress = progressList[0]
    const currentLesson =
      latestProgress?.lessons?.title || lessonList[0]?.title || 'Lección 1'

    return {
      id: courseId,
      title: enrollment.courses?.title || 'Curso sin título',
      slug: enrollment.courses?.slug || '',
      image: enrollment.courses?.image || COURSE_FALLBACK_IMAGE,
      progress,
      currentLesson,
      totalLessons,
      completedLessons,
    }
  })
}

/**
 * Hook que carga los enrollments del usuario autenticado y calcula el progreso
 * de cada curso con queries paralelas.
 *
 * @param isLoggedIn - Si el usuario está autenticado
 * @param limit - Máximo de enrollments a cargar (undefined = todos)
 */
export function useEnrollmentProgress(
  isLoggedIn: boolean,
  limit?: number
) {
  const [courses, setCourses] = useState<EnrollmentWithProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setCourses([])
        return
      }

      const mapped = await fetchEnrollmentProgressData(user.id, limit)
      setCourses(mapped)
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      console.error('❌ Error en useEnrollmentProgress:', message)
      setError(message || 'Error cargando cursos')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (!isLoggedIn) {
      setCourses([])
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) {
            setCourses([])
          }
          return
        }

        const mapped = await fetchEnrollmentProgressData(user.id, limit)

        if (!cancelled) {
          setCourses(mapped)
          setError(null)
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        console.error('❌ Error en useEnrollmentProgress:', message)
        if (!cancelled) {
          setError(message || 'Error cargando cursos')
          setCourses([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    setError(null)
    load()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn, limit])

  const refetch = loadData

  return { courses, loading, error, refetch }
}
