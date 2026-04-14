import { useState, useCallback } from 'react'
import { type Level, ageToLevel } from '../data/exercises'

export interface ChildProfile {
  name: string
  age: number
  level: Level
  streak: number
  lastSessionDate: string | null
}

export interface SessionResult {
  date: string
  total: number
  correct: number
  level: Level
}

const PROFILE_KEY = 'dracs_child_profile'
const HISTORY_KEY = 'dracs_session_history'

function loadProfile(): ChildProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as ChildProfile) : null
  } catch {
    return null
  }
}

function saveProfile(p: ChildProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
}

export function loadHistory(): SessionResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as SessionResult[]) : []
  } catch {
    return []
  }
}

function saveHistory(h: SessionResult[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function isYesterday(dateStr: string): boolean {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0] === dateStr
}

export function useChildProfile() {
  const [profile, setProfileState] = useState<ChildProfile | null>(loadProfile)

  const createProfile = useCallback((name: string, age: number) => {
    const p: ChildProfile = {
      name,
      age,
      level: ageToLevel(age),
      streak: 0,
      lastSessionDate: null,
    }
    saveProfile(p)
    setProfileState(p)
  }, [])

  const completeSession = useCallback(
    (correct: number, total: number) => {
      if (!profile) return

      const today = getToday()

      // Persist session result
      const history = loadHistory()
      saveHistory([
        ...history,
        { date: today, total, correct, level: profile.level },
      ])

      // Streak
      let newStreak = profile.streak
      if (profile.lastSessionDate !== today) {
        newStreak =
          profile.lastSessionDate && isYesterday(profile.lastSessionDate)
            ? profile.streak + 1
            : 1
      }

      // Adaptive level (requires ≥ 7 exercises to trigger)
      let newLevel: Level = profile.level
      if (total >= 7) {
        const pct = correct / total
        if (pct >= 0.8 && profile.level < 4) {
          newLevel = (profile.level + 1) as Level
        } else if (pct < 0.5 && profile.level > 1) {
          newLevel = (profile.level - 1) as Level
        }
      }

      const updated: ChildProfile = {
        ...profile,
        level: newLevel,
        streak: newStreak,
        lastSessionDate: today,
      }
      saveProfile(updated)
      setProfileState(updated)
    },
    [profile],
  )

  return { profile, createProfile, completeSession }
}
