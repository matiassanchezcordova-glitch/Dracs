import type { Database } from './database.types'

type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Profile = Row<'profiles'>
export type Patient = Row<'patients'>
export type DbChild = Row<'children'>
export type TherapistRecord = Row<'therapists'>
export type TherapistComment = Row<'therapist_comments'>
export type LinkRequest = Row<'link_requests'>
export type Center = Row<'centers'>

export type DbSession = Row<'sessions'>

// Legacy session shape — only used by FamiliaTab (and ExerciseTab inserts)
// during the Sesión 3 transition. Removed once those files are refactored
// in Bloque 3.
export interface LegacyDbSession {
  id: string
  patient_id: string
  session_number: number
  total_exercises: number
  correct_answers: number
  accuracy_percent: number | null
  duration_minutes: number | null
  level_at_session: number | null
  exercises_data: unknown
  completed_at: string
}

// Joined types for queries
export type TherapistWithProfile = TherapistRecord & {
  profiles: { full_name: string }
}

export type LinkRequestWithPatient = LinkRequest & {
  patients: {
    child_name: string
    child_age: number
    diagnosis: string | null
    profile_id: string | null
  }
}
