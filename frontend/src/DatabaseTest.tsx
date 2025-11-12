import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export function DatabaseTest() {
  const [courses, setCourses] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Iniciando test de conexión...')
      console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
      
      // Test 1: Traer cursos (SELECT id, title, slug, category)
      console.log('📚 Ejecutando: SELECT id, title, slug, category FROM courses...')
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, slug, category')
        .limit(10)

      console.log('Cursos response:', { data: coursesData, error: coursesError })
      
      // 🎯 Mostrar tabla en consola de VS Code
      if (coursesData && coursesData.length > 0) {
        console.log('\n📋 TABLA DE CURSOS:')
        console.table(coursesData)
      } else {
        console.log('⚠️ No se encontraron cursos en la base de datos')
      }
      
      if (coursesError) {
        console.error('❌ Error en cursos:', coursesError)
        throw coursesError
      }
      setCourses(coursesData || [])

      // Test 2: Traer perfiles
      console.log('👤 Intentando traer perfiles...')
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      console.log('Perfiles response:', { data: profilesData, error: profilesError })
      
      // 🎯 Mostrar tabla de profiles en consola
      if (profilesData && profilesData.length > 0) {
        console.log('\n👥 TABLA DE PROFILES:')
        console.table(profilesData)
      } else {
        console.log('⚠️ No se encontraron profiles en la base de datos')
      }
      
      if (profilesError) {
        console.error('❌ Error en perfiles:', profilesError)
        throw profilesError
      }
      setProfiles(profilesData || [])

      console.log('✅ Test completado exitosamente')
      setError(null)
    } catch (err: any) {
      console.error('💥 Error general:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Test de Conexión a Supabase</h1>
      
      {loading && <p>⏳ Conectando a la base de datos...</p>}
      
      {error && (
        <div style={{ background: '#fee', padding: '10px', borderRadius: '5px', color: '#c00' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div style={{ marginTop: '20px' }}>
            <h2>📚 Cursos encontrados: {courses.length}</h2>
            {courses.length === 0 ? (
              <p style={{ color: '#999' }}>No hay cursos en la BD. Ejecuta el seed script.</p>
            ) : (
              <ul>
                {courses.map((course) => (
                  <li key={course.id}>
                    <strong>{course.title}</strong> - {course.slug} - ${course.price}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2>👤 Perfiles encontrados: {profiles.length}</h2>
            {profiles.length === 0 ? (
              <p style={{ color: '#999' }}>No hay perfiles en la BD. Ejecuta el seed script.</p>
            ) : (
              <ul>
                {profiles.map((profile) => (
                  <li key={profile.id}>
                    <strong>{profile.full_name}</strong> - {profile.email} ({profile.role})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '30px', padding: '10px', background: '#efe', borderRadius: '5px' }}>
            <strong>✅ Conexión exitosa a Supabase!</strong>
            <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
          </div>
        </>
      )}

      <button 
        onClick={testConnection}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🔄 Reintentar
      </button>
    </div>
  )
}
