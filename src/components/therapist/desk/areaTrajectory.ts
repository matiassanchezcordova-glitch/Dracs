// Trayectoria por área — aciertos de un área, semana a semana, desde el dato real.
//
// Es DATO y nada más: un porcentaje por semana con las partidas de esa área.
// Aquí no se estima, no se rellena una semana sin juego y no se dice si una
// semana fue mejor que otra. Eso lo lee el logopeda.
//
// Dos fuentes, una sola forma (AreaPlay):
//   real  sessions → session_exercises (answered_correctly) → exercises (skills)
//   demo  el detalle por ejercicio del historial del navegador
//
// Un ejercicio cuenta para un área si es su primaria O su secundaria: el peso
// 2/1 de usePorArea mide cuánto se jugó de cada área, no cómo salió, así que
// aquí no aplica.

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { dayLabel, localIso, mondayOf, parseDay } from './informeData'

// Un ejercicio jugado: su día, las áreas que toca y si salió bien.
export interface AreaPlay {
  day: string       // YYYY-MM-DD local
  areas: string[]   // slugs de área (primaria y secundaria)
  ok: boolean
}

export interface WeekPoint {
  weekStart: string   // lunes de esa semana, YYYY-MM-DD
  label: string       // "Semana del 8 sep"
  pct: number         // aciertos de esa área esa semana
  plays: number       // ejercicios contados
}

export interface AreaPlays {
  loading: boolean
  plays: AreaPlay[]
}

// Doce semanas es lo que cabe en una mini trayectoria sin volverse ilegible.
const MAX_WEEKS = 12

export const EMPTY_PLAYS: AreaPlays = { loading: false, plays: [] }

// Semanas con partidas de esa área, en orden. Una semana sin juego no aparece:
// no es un 0, es una semana sin dato.
export function weeklyPctFor(plays: AreaPlay[], area: string, fromDay?: string): WeekPoint[] {
  const buckets = new Map<string, { ok: number; total: number }>()
  for (const p of plays) {
    if (!p.areas.includes(area)) continue
    if (fromDay && p.day < fromDay) continue
    const weekStart = localIso(mondayOf(parseDay(p.day)))
    const b = buckets.get(weekStart) ?? { ok: 0, total: 0 }
    b.total++
    if (p.ok) b.ok++
    buckets.set(weekStart, b)
  }
  return [...buckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([weekStart, b]) => ({
      weekStart,
      label: `Semana del ${dayLabel(weekStart)}`,
      pct: Math.round((b.ok / b.total) * 100),
      plays: b.total,
    }))
    .slice(-MAX_WEEKS)
}

// La última semana con partidas de esa área, o null si nunca jugó en ella.
// Es el "hoy" que se muestra al lado del objetivo.
export function latestWeekFor(plays: AreaPlay[], area: string): WeekPoint | null {
  const points = weeklyPctFor(plays, area)
  return points.length > 0 ? points[points.length - 1] : null
}

// ── Demo: el detalle por ejercicio del historial ────────────────────────────
export function fromDemoHistory(
  history: { date: string; items?: { skill: string; ok: boolean }[] }[],
): AreaPlay[] {
  const out: AreaPlay[] = []
  for (const s of history) {
    if (typeof s.date !== 'string' || s.date.length < 10) continue
    const day = s.date.slice(0, 10)
    for (const item of s.items ?? []) {
      if (!item?.skill) continue
      out.push({ day, areas: [item.skill], ok: item.ok === true })
    }
  }
  return out
}

// ── Real: Supabase ──────────────────────────────────────────────────────────
// Si las columnas de skill (009/010) aún no están, la query de exercises falla
// y nos quedamos sin trayectoria: lista vacía y la UI lo dice. Nunca inventa.
export function useAreaPlays(childId: string | null | undefined): AreaPlays {
  // Resultado etiquetado con su childId, igual que usePorArea: `loading` se
  // deriva comparando la key, así no reseteamos estado dentro del efecto.
  const [res, setRes] = useState<{ key: string; plays: AreaPlay[] } | null>(null)

  useEffect(() => {
    if (!childId) return
    let cancelled = false

    ;(async () => {
      const { data: sess } = await supabase
        .from('sessions').select('id, started_at, ended_at').eq('child_id', childId).limit(500)
      const rows = (sess ?? []) as { id: string; started_at: string | null; ended_at: string | null }[]
      if (cancelled) return
      if (rows.length === 0) { setRes({ key: childId, plays: [] }); return }

      // Día local de cada sesión, para que una partida de noche caiga en su día.
      const dayOf = new Map<string, string>()
      for (const s of rows) {
        const iso = s.ended_at ?? s.started_at
        if (!iso) continue
        const d = new Date(iso)
        if (!Number.isNaN(d.getTime())) dayOf.set(s.id, localIso(d))
      }

      const { data: played } = await supabase
        .from('session_exercises')
        .select('session_id, exercise_id, answered_correctly')
        .in('session_id', [...dayOf.keys()]).limit(5000)
      const items = (played ?? []) as { session_id: string; exercise_id: string; answered_correctly: boolean | null }[]
      if (cancelled) return
      if (items.length === 0) { setRes({ key: childId, plays: [] }); return }

      const exerciseIds = [...new Set(items.map(i => i.exercise_id))]
      const tagged = await supabase
        .from('exercises').select('id, primary_skill, secondary_skill').in('id', exerciseIds)
      if (cancelled) return
      if (tagged.error) { setRes({ key: childId, plays: [] }); return }

      const skillsOf = new Map<string, string[]>()
      for (const e of (tagged.data ?? []) as { id: string; primary_skill: string | null; secondary_skill: string | null }[]) {
        const areas = [e.primary_skill, e.secondary_skill].filter((s): s is string => !!s)
        if (areas.length > 0) skillsOf.set(e.id, areas)
      }

      const plays: AreaPlay[] = []
      for (const i of items) {
        // Un ejercicio sin respuesta registrada no es un fallo: no se cuenta.
        if (i.answered_correctly == null) continue
        const day = dayOf.get(i.session_id)
        const areas = skillsOf.get(i.exercise_id)
        if (!day || !areas) continue
        plays.push({ day, areas, ok: i.answered_correctly })
      }

      setRes({ key: childId, plays })
    })()

    return () => { cancelled = true }
  }, [childId])

  if (!childId) return EMPTY_PLAYS
  if (res && res.key === childId) return { loading: false, plays: res.plays }
  return { loading: true, plays: [] }
}
