/**
 * src/db/index.ts
 * Supabase クライアントの再エクスポート
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let _client: ReturnType<typeof createClient> | null = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    _client = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (e) {
  console.warn('Supabase DB client initialization skipped:', e)
}

export function getSupabaseClient(): ReturnType<typeof createClient> | null {
  return _client
}

export { _client as supabase }
