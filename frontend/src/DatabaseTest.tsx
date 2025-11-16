import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { debug, info, error as logError } from './lib/logger'

export function DatabaseTest() {
  const [courses, setCourses] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    setLoading(true)
    setError(null)
    try {
      debug('🔍 Iniciando test de conexión...')
      debug('URL:', import.meta.env.VITE_SUPABASE_URL)

      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, slug, category')
        .limit(10)

      debug('Cursos response:', { data: coursesData, error: coursesError })
      if (coursesError) {
        logError('❌ Error en cursos:', coursesError)
        throw coursesError
      }
      setCourses(coursesData || [])

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      debug('Perfiles response:', { data: profilesData, error: profilesError })
      if (profilesError) {
        logError('❌ Error en perfiles:', profilesError)
        throw profilesError
      }
      setProfiles(profilesData || [])

      debug('✅ Test completado exitosamente')
    } catch (err: any) {
      logError('💥 Error general:', err)
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🧪 Database Test</h2>
      {loading && <p>⏳ Ejecutando pruebas...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <strong>Cursos:</strong> {courses.length}
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>Perfiles:</strong> {profiles.length}
      </div>

      <button onClick={testConnection} style={{ padding: '8px 12px' }}>
        🔄 Reintentar
      </button>
    </div>
  )
}
