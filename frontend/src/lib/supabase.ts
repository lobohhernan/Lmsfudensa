import { createClient } from '@supabase/supabase-js'

// Obtener valores de .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseStorageKeyEnv = import.meta.env.VITE_SUPABASE_STORAGE_KEY

// Determinar storageKey (fallback si no está en .env)
// ⚠️ Exportada para que App.tsx use la misma clave al detectar sesión guardada
const DEFAULT_AUTH_STORAGE_KEY = 'lmsfudensa.supabase.auth'
export const AUTH_STORAGE_KEY = DEFAULT_AUTH_STORAGE_KEY

const storageKey = AUTH_STORAGE_KEY

// Detectar entorno navegador de forma segura
const isBrowser = typeof window !== 'undefined'

// Derivar projectRef para migrar sesiones antiguas del formato por defecto de Supabase
let projectRef = ''
try {
  projectRef = new URL(supabaseUrl).hostname.split('.')[0] || ''
} catch {
  projectRef = ''
}

const legacyAuthKeys = [
  typeof supabaseStorageKeyEnv === 'string' && supabaseStorageKeyEnv.length > 0 ? supabaseStorageKeyEnv : null,
  projectRef ? `sb-${projectRef}-auth-token` : null,
  'supabase.auth.token',
].filter((value): value is string => !!value && value !== storageKey)

const authStorage = isBrowser
  ? {
      getItem: (key: string) => {
        const primary = window.localStorage.getItem(key)
        if (primary) return primary

        for (const legacyKey of legacyAuthKeys) {
          const legacyValue = window.localStorage.getItem(legacyKey)
          if (legacyValue) {
            window.localStorage.setItem(key, legacyValue)
            return legacyValue
          }
        }

        return null
      },
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value)
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key)
      },
    }
  : undefined

// Usar localStorage para persistir sesión (seguro en SPA)
// Supabase maneja automáticamente el refresh de tokens
const storage = authStorage

// Debug: verificar que las variables se cargaron correctamente (ocultar parte de la key)
console.log('🔧 [Supabase] Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  storageKey,
  legacyAuthKeys,
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
  // ⚠️ NO agregar Cache-Control global: interfiere con el refresh de tokens de auth
})

console.log(`✅ [Supabase] Cliente inicializado correctamente (storageKey=${storageKey}, storage=${storage ? 'localStorage' : 'disabled'}, persistSession=true)`)
 
