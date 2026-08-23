// El caseload del showroom: Pol (vivo) + tres carpetas de ejemplo.
//
// Pol se construye desde el MISMO historial de localStorage que escribe el niño
// al jugar y que lee la casa de la familia. Es el niño del visitante: si jugó
// una partida de 3 con 2 aciertos, acá se ve esa partida al 67%. Si no jugó
// nada, la carpeta lo dice — nunca se rellena con datos inventados.
//
// Las otras carpetas son ilustrativas y van marcadas "ejemplo", para que el
// escritorio se lea como un caseload real sin mentir sobre el dato.

import { PATIENTS, type LocalWeek, type Patient, type RecentSession, type WeekData } from './patients'
import type { SessionResult } from '../hooks/useChildProfile'
import { DEMO_CHILD_ID, loadDemoChild } from '../lib/demo'

// Ids de las carpetas de ejemplo que acompañan a Pol en el escritorio.
const EXAMPLE_IDS = ['lucia', 'mateo', 'valentina']

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// 'YYYY-MM-DD' → Date local a medianoche (no UTC: el historial guarda fecha local).
function parseDay(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Lunes 00:00 de la semana de `d` (semana lunes→domingo, igual que el informe).
function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const m = new Date(d)
  m.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  m.setHours(0, 0, 0, 0)
  return m
}

function formatDay(date: string): string {
  const d = parseDay(date)
  return `${DAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`
}

// Aciertos en un tramo, o null si no hubo juegos (nunca 0% por falta de datos).
function accuracyOf(sessions: SessionResult[]): number | null {
  const total = sessions.reduce((a, s) => a + s.total, 0)
  if (total === 0) return null
  const correct = sessions.reduce((a, s) => a + s.correct, 0)
  return Math.round((correct / total) * 100)
}

// Días consecutivos con partida, terminando hoy (o ayer). Misma regla que la
// casa de la familia, para que las tres vistas cuenten la misma racha.
function streakOf(history: SessionResult[]): number {
  const days = new Set(history.map(s => s.date))
  const cursor = new Date()
  if (!days.has(localIso(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(localIso(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// Pol como carpeta del escritorio, derivado del historial del navegador.
export function buildDemoChildPatient(history: SessionResult[]): Patient {
  const child = loadDemoChild()
  const weekStart = mondayOf(new Date())
  const prevStart = new Date(weekStart)
  prevStart.setDate(weekStart.getDate() - 7)

  const at = (s: SessionResult) => parseDay(s.date)
  const thisWeek = history.filter(s => at(s) >= weekStart)
  const prevWeek = history.filter(s => at(s) >= prevStart && at(s) < weekStart)
  const sortedDesc = [...history].sort((a, b) => (a.date < b.date ? 1 : -1))

  // Evolución de las últimas 4 semanas (0% en una semana sin partidas: es el
  // eje del gráfico, no una afirmación sobre el niño).
  const weeklyProgress: WeekData[] = []
  for (let w = 3; w >= 0; w--) {
    const start = new Date(weekStart)
    start.setDate(weekStart.getDate() - w * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    const inWeek = history.filter(s => at(s) >= start && at(s) < end)
    weeklyProgress.push({ week: `Sem ${4 - w}`, score: accuracyOf(inWeek) ?? 0 })
  }

  // El historial local no registra duración: va en 0 y la carpeta lo pinta "—".
  const recentSessions: RecentSession[] = sortedDesc.slice(0, 5).map(s => ({
    date: formatDay(s.date),
    duration: 0,
    exercises: s.total,
    accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
  }))

  const localWeek: LocalWeek = {
    sessions: thisWeek.length,
    minutes: null,
    exercises: thisWeek.reduce((a, s) => a + s.total, 0),
    accuracy: accuracyOf(thisWeek),
    prevAccuracy: accuracyOf(prevWeek),
    streak: streakOf(history),
  }

  return {
    id: DEMO_CHILD_ID,
    name: child.name,
    age: child.age,
    condition: '',            // no inventamos diagnóstico
    area: 'Logopedia',
    avatar: '',
    status: thisWeek.length >= 5 ? 'completed' : thisWeek.length > 0 ? 'pending' : 'overdue',
    metrics: {
      sessionsThisWeek: thisWeek.length,
      sessionsTarget: 5,
      avgDuration: 0,
      progressPct: 0,
    },
    weeklyProgress,
    recentSessions,
    level: { min: child.level, max: child.level },
    lastPlayedISO: sortedDesc[0] ? parseDay(sortedDesc[0].date).toISOString() : null,
    totalSessions: history.length,
    isExample: false,
    localWeek,
  }
}

// Carpetas ilustrativas que acompañan a Pol. Siempre marcadas "ejemplo".
export function getExamplePatients(): Patient[] {
  return PATIENTS
    .filter(p => EXAMPLE_IDS.includes(p.id))
    .map(p => ({ ...p, isExample: true }))
}

// El escritorio del showroom completo: el niño vivo primero, los ejemplos debajo.
export function buildDemoCaseload(history: SessionResult[]): Patient[] {
  return [buildDemoChildPatient(history), ...getExamplePatients()]
}
