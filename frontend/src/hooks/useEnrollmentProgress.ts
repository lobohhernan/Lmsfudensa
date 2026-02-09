import { useState, useEffect } from 'react'
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

/**
 * Calcula el progreso de un enrollment dado, paralelizando las queries a Supabase.
 * Elimina el patrón N+1 secuencial que existía antes.
 */
async function computeEnrollmentProgress(
  userId: string,
  enrollment: Enrollment
): Promise<EnrollmentWithProgress> {
  const courseId = enrollment.course_id

  // ✅ Ejecutar las 3 queries EN PARALELO en vez de secuencial
  const [totalResult, completedResult, lastLessonResult] = await Promise.all([
    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId),
    Promise.resolve(
      supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true)
    ).catch(() => ({ count: 0 })),
    Promise.resolve(
      supabase
        .from('user_progress')
        .select('lesson_id, lessons(title, order_index)')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('last_accessed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ).catch(() => ({ data: null })),
  ])

  const total = totalResult.count || 0
  const completed = (completedResult as any).count || 0
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  const currentLesson =
    (lastLessonResult as any)?.data?.lessons?.title || 'Lección 1'

  return {
    id: courseId,
    title: enrollment.courses?.title || 'Curso sin título',
    slug: enrollment.courses?.slug || '',
    image:
      enrollment.courses?.image ||
      'https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400',
    progress,
    currentLesson,
    totalLessons: total,
    completedLessons: completed,
  }
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

  useEffect(() => {
    if (!isLoggedIn) {
      setCourses([])
      return
    }

    let cancelled = false

    const load = async () => {
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

        let query = supabase
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
          .eq('user_id', user.id)
          .order('last_accessed_at', { ascending: false })

        if (limit) {
          query = query.limit(limit)
        }

        const { data: enrollments, error: enrollError } = await query

        if (enrollError) {
          throw enrollError
        }

        // ✅ Todas las enrollments se procesan en paralelo
        const mapped = await Promise.all(
          (enrollments || []).map((enrollment: Enrollment) =>
            computeEnrollmentProgress(user.id, enrollment)
          )
        )

        if (!cancelled) {
          setCourses(mapped)
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

    load()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn, limit])

  const refetch = async () => {
    // Forzar recarga (cambiar un dep no es posible, simulamos)
    setLoading(true)
    setCourses([])
    // El useEffect no se re-disparará, así que hacemos la carga manualmente
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('enrollments')
        .select(
          `id, course_id, enrolled_at, last_accessed_at, completed,
          courses (id, title, slug, image, description)`
        )
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data: enrollments } = await query
      const mapped = await Promise.all(
        (enrollments || []).map((enrollment: Enrollment) =>
          computeEnrollmentProgress(user.id, enrollment)
        )
      )
      setCourses(mapped)
    } catch (err) {
      console.error('❌ Error en refetch:', err)
    } finally {
      setLoading(false)
    }
  }

  return { courses, loading, error, refetch }
}
