import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hztkspqunxeauawqcikw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rZtJ7xTLTI8ubfk2jRBYNw_EW2HNI7B'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
