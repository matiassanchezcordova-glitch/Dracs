import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

// NOTE: createClient<Database> intentionally not used yet. Legacy queries to
// `sessions` and a few inserts still target the old schema; re-enable the
// generic in Sesión 3 once those call sites are refactored. Types from
// database.types remain available via explicit `as` casts.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
