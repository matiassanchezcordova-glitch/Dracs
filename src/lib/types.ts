import type { Database } from './database.types'

type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Profile = Row<'profiles'>
export type Patient = Row<'patients'>
export type TherapistRecord = Row<'therapists'>
export type TherapistComment = Row<'therapist_comments'>
export type LinkRequest = Row<'link_requests'>
export type Center = Row<'centers'>

// NOTE: DbSession does not match the live `sessions` table schema.
// The app code (FamiliaTab, PatientDetail, TherapistTab, ExerciseTab) was
// written against this shape. Refactor to Row<'sessions'> is scheduled for
// Sesión 3 — until then this type is kept manual to keep the build green.
export interface DbSession {
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
  }
}
