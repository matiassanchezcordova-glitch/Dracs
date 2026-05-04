export interface Profile {
  id: string
  role: 'patient' | 'family' | 'therapist'
  full_name: string
  email: string | null
  avatar_url: string | null
  created_at: string
}

export interface Patient {
  id: string
  profile_id: string
  child_name: string
  child_age: number
  diagnosis: string
  current_level: number
  streak_days: number
  therapist_id: string | null
  center_name: string | null
  notes: string | null
  created_at: string
}

export interface TherapistRecord {
  id: string
  profile_id: string
  specialty: string
  license_number: string
  center_name: string
  city: string
  max_patients: number
  created_at: string
}

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

export interface TherapistComment {
  id: string
  therapist_id: string
  patient_id: string
  week_code: string
  comment_text: string
  created_at: string
}

export interface LinkRequest {
  id: string
  patient_id: string
  therapist_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface Center {
  id: string
  name: string
  city: string
  type: 'hospital' | 'cdiap' | 'private' | 'public' | 'other'
  address: string | null
  created_at: string
}

// Joined types for queries
export interface TherapistWithProfile extends TherapistRecord {
  profiles: { full_name: string }
}

export interface LinkRequestWithPatient extends LinkRequest {
  patients: {
    child_name: string
    child_age: number
    diagnosis: string
  }
}
