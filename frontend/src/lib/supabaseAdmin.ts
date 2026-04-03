/**
 * SUPABASE ADMIN CLIENT
 * =====================
 * 
 * Este cliente usa la SERVICE_ROLE_KEY que bypasea RLS (Row Level Security).
 * 
 * ⚠️ SOLO usar este cliente en:
 * - Panel de administración
 * - Server-side operations
 * - Operaciones que requieren privilegios elevados
 * 
 * ⚠️ NUNCA exponer la SERVICE_ROLE_KEY en el cliente
 * 
 * CÓMO OBTENER TU SERVICE_ROLE_KEY:
 * 1. Ve a tu proyecto en Supabase Dashboard
 * 2. Settings > API
 * 3. Copia "service_role" key (secret)
 * 4. Agrégala a frontend/.env.local como VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { debug, warn } from './logger'

// Obtener las credenciales
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Validar que existen las variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL')
}

if (!supabaseServiceRoleKey) {
  warn('⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY no configurada')
  warn('El Admin Panel puede tener problemas con RLS')
  warn('Solución temporal: Desactiva RLS en Supabase ejecutando FIX_RLS_DEFINITIVE_2025.sql OPCIÓN 1')
}

/**
 * Cliente Supabase con privilegios de administrador
 * Bypasea todas las políticas RLS
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || '', // Fallback a string vacío si no está configurado
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  }
)

/**
 * Verifica si el cliente admin está configurado correctamente
 */
export function isAdminClientConfigured(): boolean {
  return Boolean(supabaseServiceRoleKey)
}

/**
 * Hook para logging de operaciones admin
 */
export function logAdminOperation(
  operation: string, 
  table: string, 
  data?: unknown
) {
  if (import.meta.env.DEV) {
    debug(`🔐 [ADMIN] ${operation} en ${table}`, data)
  }
}
