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
