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
const isBrowser = typeof window !== 'undefined'

// Usar localStorage para persistir sesión (seguro en SPA)
// Supabase maneja automáticamente el refresh de tokens
const storage = isBrowser ? window.localStorage : undefined

// Debug: verificar que las variables se cargaron correctamente (ocultar parte de la key)
console.log('🔧 [Supabase] Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  storageKey,
  storageEnabled: !!storage,
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
    // Key usada para almacenar la sesión de auth
    storageKey,
    // Usar localStorage para persistir sesión entre recargas
    storage,
    // Persistir sesión entre recargas (NECESARIO para que no se cierre sesión)
    persistSession: true,
    // Detectar sesión en la URL (útil para OAuth redirects y magic links)
    detectSessionInUrl: true,
    // Auto refresh de tokens habilitado (NECESARIO para renovar sesión)
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  }
})

console.log(`✅ [Supabase] Cliente inicializado correctamente (storageKey=${storageKey}, storage=${storage ? 'localStorage' : 'disabled'}, persistSession=true)`)
 
