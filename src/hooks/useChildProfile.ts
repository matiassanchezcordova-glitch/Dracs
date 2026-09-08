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
  // Lugar del mundo donde se jugó la partida — `map_hotspots.id`
  // (sol/faro/casa/pulpo/castillo). Opcional a propósito: las partidas
  // guardadas antes de registrarlo no lo tienen, y el recorrido de la familia
  // degrada con gracia cuando falta.
  place?: string
  // Minutos de la partida. Opcional: el juego en vivo todavía no cronometra,
  // así que solo lo traen las partidas de la base demo. Sin este dato, las
  // vistas muestran "—" en vez de estimar.
  minutes?: number
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

// Lunes 00:00 de la semana de `d`.
function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const m = new Date(d)
  m.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  m.setHours(0, 0, 0, 0)
  return m
}

// La base de la demo: 4 semanas de partidas para el niño del showroom.
//
// Sin esto, quien entra por la puerta del logopeda abre a Pol y ve una carpeta
// vacía. Estas partidas son el PISO de la demo, igual que las carpetas de
// ejemplo del escritorio: lo que el visitante juegue se apila encima, porque
// `completeSession` añade al historial y aquí no se pisa nada si ya hay algo.
//
// Reparto: 4 días por semana (lunes, miércoles, viernes y domingo) durante 4
// semanas, más hoy y ayer para que la racha esté viva. `place` son ids de
// hotspot (map_hotspots.id), no `exercises.place`: pulpo es el mar, castillo la
// playa, sol el cielo y casa la casa. Los aciertos van entre 60% y 90%, que es
// el rango en el que un juego se siente exigente sin frustrar.
const DEMO_PLAN = [
  { total: 7, correct: 5, minutes: 14, place: 'pulpo' },
  { total: 6, correct: 5, minutes: 11, place: 'casa' },
  { total: 8, correct: 6, minutes: 18, place: 'castillo' },
  { total: 5, correct: 4, minutes: 9, place: 'sol' },
  { total: 7, correct: 6, minutes: 16, place: 'pulpo' },
  { total: 6, correct: 4, minutes: 12, place: 'casa' },
  { total: 9, correct: 7, minutes: 21, place: 'castillo' },
  { total: 5, correct: 3, minutes: 8, place: 'faro' },
  { total: 8, correct: 7, minutes: 19, place: 'pulpo' },
  { total: 7, correct: 5, minutes: 13, place: 'sol' },
  { total: 6, correct: 5, minutes: 15, place: 'casa' },
  { total: 8, correct: 6, minutes: 17, place: 'castillo' },
  { total: 7, correct: 6, minutes: 12, place: 'pulpo' },
  { total: 6, correct: 4, minutes: 10, place: 'casa' },
  { total: 9, correct: 8, minutes: 22, place: 'sol' },
  { total: 7, correct: 5, minutes: 14, place: 'castillo' },
  { total: 6, correct: 5, minutes: 13, place: 'pulpo' },
  { total: 5, correct: 4, minutes: 9, place: 'casa' },
]

export function seedDemoHistory(): void {
  try {
    if (localStorage.getItem(HISTORY_KEY)) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monday = mondayOf(today)

    const days: string[] = []
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(monday)
      weekStart.setDate(monday.getDate() - w * 7)
      for (const offset of [0, 2, 4, 6]) {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + offset)
        if (d > today) continue
        days.push(localIso(d))
      }
    }

    // Hoy y ayer siempre tienen partida: la racha de la familia y el "jugó esta
    // semana" del escritorio se apoyan en eso.
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    for (const d of [yesterday, today]) {
      const iso = localIso(d)
      if (!days.includes(iso)) days.push(iso)
    }
    if (days.length === 0) return

    // Un lunes por la mañana la semana en curso solo tendría una partida y el
    // escritorio se vería vacío justo al entrar. Se completa hasta 3 partidas en
    // la semana, apilando en hoy: dos ratos el mismo día es lo que pasa de
    // verdad con un niño de 6 años.
    const weekKey = localIso(monday)
    const todayKey = localIso(today)
    while (days.filter(d => d >= weekKey).length < 3) days.push(todayKey)

    days.sort()
    const sessions: SessionResult[] = days.map((date, i) => {
      const shape = DEMO_PLAN[i % DEMO_PLAN.length]
      return { date, total: shape.total, correct: shape.correct, level: 2, place: shape.place, minutes: shape.minutes }
    })
    saveHistory(sessions)

    // La racha del niño sale del perfil, y la de la familia y el escritorio del
    // historial. Si no se alinean aquí, el niño vería 0 días seguidos mientras
    // las otras dos vistas cuentan varios. Solo se toca un perfil sin estrenar.
    const profile = loadProfile()
    if (profile && !profile.lastSessionDate) {
      const played = new Set(days)
      const cursor = new Date(today)
      let streak = 0
      while (played.has(localIso(cursor))) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }
      saveProfile({ ...profile, streak, lastSessionDate: todayKey })
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
