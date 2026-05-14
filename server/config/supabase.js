import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'tempvault'

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null

export function assertSupabaseConfigured() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Copy server/.env.example to server/.env and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }
}
