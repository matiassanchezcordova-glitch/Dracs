import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bxhptoigtummmckxnkzv.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aHB0b2lndHVtbW1ja3hua3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTYwMTAsImV4cCI6MjA5MzM5MjAxMH0.QdbV8gOoeeLqAgZcqPXfjDe_0m5088XOj8ChmLw6UOQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
