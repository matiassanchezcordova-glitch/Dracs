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

// Fecha local (no UTC) en formato YYYY-MM-DD.
function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Siembra la cuenta demo/invitado con partidas de ejemplo de ESTA semana, para
// que el dashboard y el informe muestren datos reales y coincidan entre sí.
// No pisa un historial ya existente (si el niño demo ya jugó, se respeta).
export function seedDemoHistory(): void {
  try {
    if (localStorage.getItem(HISTORY_KEY)) return
    const today = new Date()
    const dow = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
    // Días transcurridos de ESTA semana (lunes → hoy).
    const dates: string[] = []
    for (let i = 0; ; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      if (d > today) break
      dates.push(localIso(d))
    }
    if (dates.length === 0) return
    // 5 partidas realistas repartidas hacia atrás desde HOY (round-robin sobre
    // los días disponibles, del más reciente al más antiguo). Repartir desde hoy
    // —y no desde el lunes— garantiza que la racha que deriva el dashboard sea
    // coherente con las sesiones de la semana: si sembráramos lunes→viernes, un
    // domingo el dashboard mostraría "5 sesiones" junto a "racha 0".
    const plan = [
      { total: 7, correct: 6 },
      { total: 6, correct: 4 },
      { total: 7, correct: 6 },
      { total: 5, correct: 5 },
      { total: 7, correct: 5 },
    ]
    const sessions: SessionResult[] = plan.map((p, i) => ({
      date: dates[dates.length - 1 - (i % dates.length)],
      total: p.total,
      correct: p.correct,
      level: 2,
    }))
    sessions.sort((a, b) => (a.date < b.date ? -1 : 1))
    saveHistory(sessions)
  } catch { /* ignore */ }
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
