import { createClient } from '@supabase/supabase-js'
import { debug, info, error as logError } from './logger'

// Obtener valores de .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseStorageKeyEnv = import.meta.env.VITE_SUPABASE_STORAGE_KEY

// Determinar storageKey (fallback si no está en .env)
const storageKey = typeof supabaseStorageKeyEnv === 'string' && supabaseStorageKeyEnv.length > 0
  ? supabaseStorageKeyEnv
  : 'lmsfudensa.supabase.auth'

// Detectar entorno navegador de forma segura (no usar para storage ahora)
// En desarrollo y para funcionalidad pública (lectura de cursos), NO usar storage persistente
// Esto evita problemas con cache corrupto. Cada carga es fresca desde el servidor

// Debug: verificar que las variables se cargaron correctamente (ocultar parte de la key)
debug('🔧 Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  storageKey,
})

// Validar que las variables existan
if (!supabaseUrl || !supabaseAnonKey) {
  logError('❌ ERROR: Variables de entorno de Supabase no encontradas')
  logError('VITE_SUPABASE_URL:', supabaseUrl)
  logError('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'presente' : 'ausente')
  throw new Error('Faltan variables de entorno de Supabase. Verifica que .env.local existe y contiene VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Key usada para almacenar la sesión de auth
    storageKey,
    // NO usar storage persistente - evita problemas con cache corrupto
    storage: undefined,
    // NO persistir sesión entre recargas (cada carga es fresca)
    persistSession: false,
    // Detectar sesión en la URL (útil para OAuth redirects)
    detectSessionInUrl: false,
    // Auto refresh deshabilitado
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  }
})

info(`✅ Cliente Supabase inicializado correctamente (storageKey=${storageKey}, storage=disabled)`)
 
