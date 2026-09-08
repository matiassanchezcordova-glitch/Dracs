// Datos del informe: el período y lo que pasó dentro de él.
//
// Todo sale de partidas con fecha real. En cuenta real, de `sessions`; en demo,
// del historial del navegador que escribe el niño al jugar. Si el período no
// tiene partidas, `hasData` es false y el informe lo dice: aquí no se rellena
// nada, ni se estima, ni se redondea a favor.
//
// Las fechas van en local (YYYY-MM-DD), como el resto del producto: una partida
// jugada de noche en España tiene que caer en su día, no en el anterior.

export type PeriodId = 'mes' | 'cuatro' | 'rango'

export interface DayRange {
  from: string
  to: string
}

export interface InformeSession {
  day: string
  exercises: number
  correct: number
  minutes: number | null
}

export interface InformeStats {
  hasData: boolean
  sessions: number
  activeDays: number
  spanDays: number
  exercises: number
  minutes: number | null          // null si ninguna partida trae duración
  accuracy: number | null         // % del período, null sin juegos
  firstHalf: number | null        // % de la primera mitad del período
  secondHalf: number | null       // % de la segunda mitad
  weeks: { label: string; pct: number | null }[]
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

// Este mes = del día 1 a hoy. Últimas 4 semanas = 27 días atrás más hoy.
export function rangeFor(period: PeriodId, custom?: DayRange): DayRange {
  const today = new Date()
  if (period === 'mes') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: localIso(first), to: localIso(today) }
  }
  if (period === 'cuatro') {
    const start = new Date(today)
    start.setDate(today.getDate() - 27)
    return { from: localIso(start), to: localIso(today) }
  }
  const from = custom?.from || localIso(today)
  const to = custom?.to || localIso(today)
  return from <= to ? { from, to } : { from: to, to: from }
}

export function dayLabel(day: string): string {
  const d = parseDay(day)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function rangeLabel(r: DayRange): string {
  const a = parseDay(r.from)
  const b = parseDay(r.to)
  const year = b.getFullYear()
  const sameYear = a.getFullYear() === year
  return sameYear
    ? `${dayLabel(r.from)} a ${dayLabel(r.to)} de ${year}`
    : `${dayLabel(r.from)} de ${a.getFullYear()} a ${dayLabel(r.to)} de ${year}`
}

function pctOf(list: InformeSession[]): number | null {
  const total = list.reduce((a, s) => a + s.exercises, 0)
  if (total === 0) return null
  const correct = list.reduce((a, s) => a + s.correct, 0)
  return Math.round((correct / total) * 100)
}

function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const m = new Date(d)
  m.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  m.setHours(0, 0, 0, 0)
  return m
}

export function statsFor(all: InformeSession[], r: DayRange): InformeStats {
  const inRange = all.filter(s => s.day >= r.from && s.day <= r.to)
  const spanDays = Math.max(
    1,
    Math.round((parseDay(r.to).getTime() - parseDay(r.from).getTime()) / 86_400_000) + 1,
  )

  if (inRange.length === 0) {
    return {
      hasData: false, sessions: 0, activeDays: 0, spanDays, exercises: 0,
      minutes: null, accuracy: null, firstHalf: null, secondHalf: null, weeks: [],
    }
  }

  const withMinutes = inRange.filter(s => s.minutes != null)
  const mid = new Date(parseDay(r.from).getTime() + (spanDays / 2) * 86_400_000)
  const midDay = localIso(mid)

  // Semanas del período, de lunes a domingo, en orden.
  const byWeek = new Map<string, InformeSession[]>()
  for (const s of inRange) {
    const key = localIso(mondayOf(parseDay(s.day)))
    const bucket = byWeek.get(key)
    if (bucket) bucket.push(s)
    else byWeek.set(key, [s])
  }
  const weeks = [...byWeek.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, list]) => ({ label: `Semana del ${dayLabel(key)}`, pct: pctOf(list) }))

  return {
    hasData: true,
    sessions: inRange.length,
    activeDays: new Set(inRange.map(s => s.day)).size,
    spanDays,
    exercises: inRange.reduce((a, s) => a + s.exercises, 0),
    minutes: withMinutes.length > 0 ? withMinutes.reduce((a, s) => a + (s.minutes ?? 0), 0) : null,
    accuracy: pctOf(inRange),
    firstHalf: pctOf(inRange.filter(s => s.day < midDay)),
    secondHalf: pctOf(inRange.filter(s => s.day >= midDay)),
    weeks,
  }
}

// ── Adaptadores: las dos fuentes de partidas con fecha ───────────────────────

interface DbLike {
  ended_at?: string | null
  started_at?: string | null
  total_exercises: number
  correct_count: number
  duration_seconds?: number | null
}

export function fromDbSessions(rows: DbLike[]): InformeSession[] {
  return rows
    .map(s => {
      const iso = s.ended_at ?? s.started_at
      if (!iso) return null
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return null
      return {
        day: localIso(d),
        exercises: s.total_exercises,
        correct: s.correct_count,
        minutes: s.duration_seconds == null ? null : Math.round(s.duration_seconds / 60),
      }
    })
    .filter((s): s is InformeSession => s !== null)
}

// El historial del navegador guarda fecha, total, aciertos y, en las partidas
// de la base demo, los minutos. Las partidas jugadas en vivo no traen duración
// todavía: van sin minutos y el informe no habla de tiempo por ellas.
export function fromLocalHistory(
  rows: { date: string; total: number; correct: number; minutes?: number }[],
): InformeSession[] {
  return rows
    .filter(s => typeof s.date === 'string' && s.date.length >= 10)
    .map(s => ({
      day: s.date.slice(0, 10),
      exercises: s.total,
      correct: s.correct,
      minutes: s.minutes ?? null,
    }))
}
