import { useState, useCallback } from 'react'
import { type Level, ageToLevel } from '../data/exercises'
import { buildDemoHistory, type DemoItem } from '../data/demoHistory'

// Clave del niño del showroom para el generador de historial.
const DEMO_SEED_KEY = 'pol'

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
  // Lugar del mundo donde se jugó la partida — `map_hotspots.id`
  // (sol/faro/casa/pulpo/castillo). Opcional a propósito: las partidas
  // guardadas antes de registrarlo no lo tienen, y el recorrido de la familia
  // degrada con gracia cuando falta.
  place?: string
  // Minutos de la partida. Opcional: el juego en vivo todavía no cronometra,
  // así que solo lo traen las partidas de la base demo. Sin este dato, las
  // vistas muestran "—" en vez de estimar.
  minutes?: number
  // Detalle por ejercicio (lugar y área). Lo traen las partidas de la base;
  // las jugadas en vivo todavía no lo registran y degradan con gracia.
  items?: DemoItem[]
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

// Fecha local (no UTC) en formato YYYY-MM-DD.
//
// TODA fecha del historial pasa por acá. `toISOString()` da la fecha en UTC:
// en España (UTC+1/+2) una partida jugada de noche se guardaba con la fecha del
// día ANTERIOR, así que la estrella caía en el día equivocado y la racha se
// rompía. `journey.ts` y `useFamilyWeek` ya calculan en local; esto los alinea.
function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getToday(): string {
  return localIso(new Date())
}

// La base de la demo para el niño del showroom.
//
// Sin esto, quien entra por la puerta del logopeda abre a Pol y ve una carpeta
// vacía. Se siembran 7 semanas con el mismo generador que usan las demás
// carpetas del escritorio, con detalle por ejercicio (lugar y área).
//
// Lo que el visitante juega NUNCA se toca: se apila sobre la base y sobrevive a
// cualquier resiembra. Lo único que se reemplaza es una base anterior que se
// quedó sin ese detalle, para que "por área" no salga vacía en un navegador que
// ya había entrado antes. Las partidas de la base se reconocen porque traen
// minutos; las jugadas en vivo no los traen todavía.
function isSeeded(s: SessionResult): boolean {
  return s.minutes != null
}

export function seedDemoHistory(): void {
  try {
    const stored = loadHistory()
    const played = stored.filter(s => !isSeeded(s))
    const baseIsCurrent = stored.some(s => (s.items?.length ?? 0) > 0)
    if (stored.length > 0 && baseIsCurrent) return

    const base = buildDemoHistory(DEMO_SEED_KEY, 7) as SessionResult[]
    if (base.length === 0) return

    const sessions = [...base, ...played].sort((a, b) => (a.date < b.date ? -1 : 1))
    saveHistory(sessions)

    // La racha del niño sale de su perfil, y la de la familia y el escritorio
    // del historial. Si no se alinean, el niño vería 0 días seguidos mientras
    // las otras dos vistas cuentan varios.
    const profile = loadProfile()
    if (profile) {
      const days = new Set(sessions.map(s => s.date))
      const cursor = new Date()
      if (!days.has(localIso(cursor))) cursor.setDate(cursor.getDate() - 1)
      let streak = 0
      while (days.has(localIso(cursor))) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }
      const last = sessions[sessions.length - 1]?.date ?? null
      saveProfile({ ...profile, streak, lastSessionDate: last })
    }
  } catch { /* ignore */ }
}

function isYesterday(dateStr: string): boolean {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localIso(d) === dateStr
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
    (correct: number, total: number, place?: string) => {
      if (!profile) return

      const today = getToday()

      // Persist session result. `place` es el hotspot donde se jugó; permite que
      // la familia vea el recorrido (qué lugares visitó) sin ningún número.
      const history = loadHistory()
      saveHistory([
        ...history,
        { date: today, total, correct, level: profile.level, ...(place ? { place } : {}) },
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
