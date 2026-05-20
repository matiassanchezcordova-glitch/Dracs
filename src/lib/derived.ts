import type { DbSession } from './types'
import { supabase } from './supabase'

// Years completed today, based on a YYYY-MM-DD birth date (interpreted as
// local midnight).
export function getAge(birthDate: string): number {
  const birth = new Date(birthDate + 'T00:00:00')
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// Whole-number accuracy percentage (0-100). Returns 0 if total is 0.
export function getAccuracyPercent(s: DbSession): number {
  if (s.total_exercises <= 0) return 0
  return Math.round((s.correct_count * 100) / s.total_exercises)
}

// Session duration in whole minutes, or null when unknown.
export function getDurationMinutes(s: DbSession): number | null {
  if (s.duration_seconds == null) return null
  return Math.round(s.duration_seconds / 60)
}

// "Live streak": consecutive UTC days with at least one session, anchored to
// today if a session exists today, else yesterday if a session exists
// yesterday, else 0. UTC keys are used so they match Supabase timestamps;
// for users in CET/CEST this is correct in the vast majority of cases and
// only drifts by hours around local midnight.
export function getStreakDays(sessions: DbSession[]): number {
  if (sessions.length === 0) return 0

  const days = new Set(
    sessions
      .map(s => s.ended_at ?? s.started_at)
      .filter((d): d is string => !!d)
      .map(d => d.slice(0, 10)),
  )

  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  let cursor: Date
  if (days.has(todayKey)) cursor = new Date(today)
  else if (days.has(yesterdayKey)) cursor = new Date(yesterday)
  else return 0

  let streak = 0
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

// The ONLY async helper in this module. Reads the therapist-assigned
// difficulty range for a child from `child_assignments`, or returns null
// when no assignment exists yet.
export async function getCurrentLevel(
  childId: string,
): Promise<{ min: number; max: number } | null> {
  const { data } = await supabase
    .from('child_assignments')
    .select('difficulty_min, difficulty_max')
    .eq('child_id', childId)
    .maybeSingle()
  if (!data) return null
  return { min: data.difficulty_min, max: data.difficulty_max }
}
