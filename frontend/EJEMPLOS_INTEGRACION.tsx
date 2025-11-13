/**
 * EJEMPLOS DE INTEGRACIÓN - Código Listo para Copiar/Pegar
 * 
 * Estos son ejemplos de cómo integrar el sistema de caché
 * en tus componentes existentes
 */

// ============================================
// EJEMPLO 1: AdminPanel.tsx - CON CACHÉ
// ============================================

/*
import { useState } from 'react'
import { useCoursesWithCache, useUsersWithCache } from '@/hooks/useSmartCache'
import { supabase } from '@/lib/supabase'
import { CacheControl } from '@/components/CacheControl'
import { Button } from '@/components/ui/button'

export function AdminPanel() {
  const courses = useCoursesWithCache(supabase)
  const users = useUsersWithCache(supabase)

  return (
    <div className="p-6 space-y-6">
      {/* Mostrar estado del caché */}
      <CacheControl />

      {/* Sección de Cursos */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cursos</h2>
          <Button
            onClick={courses.refetch}
            variant="outline"
            size="sm"
          >
            🔄 Refrescar
          </Button>
        </div>

        {courses.loading && <p>Cargando cursos...</p>}
        {courses.error && <p className="text-red-600">Error: {courses.error.message}</p>}

        {courses.data && (
          <div className="space-y-2">
            {courses.data.map((course) => (
              <div key={course.id} className="p-3 bg-slate-100 rounded">
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de Usuarios */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Usuarios</h2>
          <Button
            onClick={users.refetch}
            variant="outline"
            size="sm"
          >
            🔄 Refrescar
          </Button>
        </div>

        {users.loading && <p>Cargando usuarios...</p>}
        {users.error && <p className="text-red-600">Error: {users.error.message}</p>}

        {users.data && (
          <div className="space-y-2">
            {users.data.map((user) => (
              <div key={user.id} className="p-3 bg-slate-100 rounded">
                <h3 className="font-semibold">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
*/

// ============================================
// EJEMPLO 2: CourseDetail.tsx - CON CACHÉ
// ============================================

/*
import { useLessonsWithCache } from '@/hooks/useSmartCache'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface CourseDetailProps {
  courseId: string
  onNavigate: (page: string, courseId?: string) => void
}

export function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const lessons = useLessonsWithCache(supabase, courseId)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lecciones</h1>
        <Button
          onClick={lessons.refetch}
          variant="outline"
        >
          🔄 Refrescar
        </Button>
      </div>

      {lessons.loading && <p>Cargando lecciones...</p>}
      {lessons.error && <p className="text-red-600">Error: {lessons.error.message}</p>}

      {lessons.data && (
        <div className="grid gap-4">
          {lessons.data.map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-slate-50"
              onClick={() => onNavigate('lesson', courseId, undefined, lesson.id)}
            >
              <h3 className="font-semibold">{lesson.title}</h3>
              <p className="text-sm text-gray-600">{lesson.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
*/

// ============================================
// EJEMPLO 3: Hook Personalizado - TEMPLATE
// ============================================

/*
import { useSmartCache } from '@/hooks/useSmartCache'
import { CACHE_KEYS } from '@/lib/cacheManager'
import { supabase } from '@/lib/supabase'

interface MyData {
  id: string
  name: string
}

export function useMyData() {
  return useSmartCache({
    cacheKey: CACHE_KEYS.COURSES, // Cambiar a la clave que necesites
    fetcher: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
      
      if (error) throw error
      return data as MyData[]
    },
    ttl: 5 * 60 * 1000, // 5 minutos
    onError: (error) => {
      console.error('Error cargando mis datos:', error)
      // Aquí puedes hacer toast, etc
    },
  })
}
*/

// ============================================
// EJEMPLO 4: Invalidar Caché Después de Actualizar
// ============================================

/*
import { notifyDataChange, CACHE_KEYS } from '@/lib/cacheManager'

async function handleUpdateCourse(courseId: string, updates: any) {
  try {
    // Actualizar en BD
    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)

    if (error) throw error

    // Invalidar caché - todos los hooks se actualizarán automáticamente
    notifyDataChange(CACHE_KEYS.COURSES)

    toast.success('Curso actualizado')
  } catch (error) {
    toast.error('Error actualizando curso')
  }
}
*/

// ============================================
// EJEMPLO 5: Monitorear Cambios de Datos
// ============================================

/*
import { useEffect } from 'react'
import { onDataChange, CACHE_KEYS } from '@/lib/cacheManager'

export function MyComponent() {
  useEffect(() => {
    // Cuando los cursos cambien desde otra pestaña o componente
    const unsubscribe = onDataChange(CACHE_KEYS.COURSES, () => {
      console.log('¡Los cursos cambiaron!')
      // Actualizar UI, mostrar notificación, etc
    })

    return unsubscribe
  }, [])

  return <div>Mi Componente</div>
}
*/

// ============================================
// EJEMPLO 6: Debug - Ver Estado del Caché
// ============================================

/*
// En la consola (F12):

// Ver TODO el caché
console.log('Caché completo:')
Object.entries(localStorage).forEach(([key, value]) => {
  try {
    const parsed = JSON.parse(value)
    console.log(key, parsed)
  } catch {
    console.log(key, value)
  }
})

// Ver tamaño total
const totalSize = Object.values(localStorage).reduce((a, b) => a + b.length, 0)
console.log(`Tamaño total: ${(totalSize / 1024).toFixed(2)} KB`)

// Ver versión actual
console.log('Versión:', localStorage.getItem('lms_app_version'))

// Limpiar manualmente
localStorage.clear()
location.reload()
*/

// ============================================
// EJEMPLO 7: Testing - Simular Cambio de Versión
// ============================================

/*
// En la consola (F12) para testear:

// 1. Cambiar versión manualmente
localStorage.setItem('lms_app_version', '999.0.0')

// 2. Esperar a que detecte cambio (cada 30 segundos)
// O forzar verificación
import { checkForNewVersion } from '@/lib/cacheManager'
checkForNewVersion() // Si retorna true, se recargó

// 3. Observar en la consola:
// "🚀 Nueva versión detectada: 999.0.0"
// "🗑️ Caché limpiado: lms_courses"
// etc...

// 4. Página se recarga automáticamente
*/

// ============================================
// EJEMPLO 8: Componente Personalizado con Botón
// ============================================

/*
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSmartCache } from '@/hooks/useSmartCache'
import { supabase } from '@/lib/supabase'
import { CACHE_KEYS } from '@/lib/cacheManager'

export function MyDataViewer() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { data, loading, error, refetch } = useSmartCache({
    cacheKey: CACHE_KEYS.COURSES,
    fetcher: async () => {
      const { data } = await supabase.from('courses').select('*')
      return data || []
    },
    ttl: 5 * 60 * 1000,
  })

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleManualRefresh}
        disabled={isRefreshing || loading}
      >
        {isRefreshing ? '⏳ Refrescando...' : '🔄 Refrescar'}
      </Button>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {data && <p>✅ {data.length} elementos cargados</p>}
    </div>
  )
}
*/

export const EXAMPLES_DOCUMENTATION = true
