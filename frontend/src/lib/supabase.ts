import { createClient } from '@supabase/supabase-js'

// Obtener valores de .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseStorageKeyEnv = import.meta.env.VITE_SUPABASE_STORAGE_KEY

// Determinar storageKey (fallback si no está en .env)
const storageKey = typeof supabaseStorageKeyEnv === 'string' && supabaseStorageKeyEnv.length > 0
  ? supabaseStorageKeyEnv
  : 'lmsfudensa.supabase.auth'

// Detectar entorno navegador de forma segura
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
const storage = isBrowser ? window.localStorage : undefined

// Debug: verificar que las variables se cargaron correctamente (ocultar parte de la key)
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  storageKey
})

// Validar que las variables existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables de entorno de Supabase no encontradas')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'presente' : 'ausente')
  throw new Error('Faltan variables de entorno de Supabase. Verifica que .env.local existe y contiene VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Key usada para almacenar la sesión de auth en localStorage
    storageKey,
    // Use window.localStorage en el navegador para persistencia de sesión
    // En entornos no-browser no se pasa storage (permanece undefined)
    storage,
    // Persistir sesión entre recargas
    persistSession: true,
    // Detectar sesión en la URL (útil para OAuth redirects)
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  }
})

console.log(`✅ Cliente Supabase inicializado correctamente (storageKey=${storageKey})`)
 
