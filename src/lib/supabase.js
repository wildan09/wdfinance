import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co'
  && supabaseUrl !== 'https://your-project.supabase.co'
  && supabaseAnonKey !== 'placeholder-key'
  && supabaseAnonKey !== 'your_anon_key_here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
