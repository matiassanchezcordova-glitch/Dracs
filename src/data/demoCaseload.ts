// Los pacientes del showroom: el niño del navegador y los tres que lo acompañan.
//
// El niño del navegador se construye desde el MISMO historial de localStorage
// que escribe al jugar y que lee la casa de la familia: si jugó una partida de
// 3 con 2 aciertos, aquí se ve esa partida al 67%.
//
// Los otros tres salen del generador de la demo, anclado a hoy y determinista
// por niño. Todos pasan por el mismo derivador, así que las cuatro carpetas
// cuentan sus números igual y ninguna arrastra fechas viejas.

import { PATIENTS, type LocalWeek, type Patient, type RecentSession, type WeekData } from './patients'
import type { SessionResult } from '../hooks/useChildProfile'
import { buildDemoHistory } from './demoHistory'
import { DEMO_CHILD_ID, loadDemoChild } from '../lib/demo'

// Los pacientes que acompañan al niño del navegador en el escritorio.
const DEMO_IDS = ['lucia', 'mateo', 'valentina']

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

// Deriva una carpeta del escritorio desde un historial con fechas reales.
// Lo usan las cuatro carpetas de la demo: el niño del navegador y los tres
// pacientes que lo acompañan. Misma función, mismos números, cero datos
// escritos a mano con fechas que se quedan viejas.
function buildPatient(
  base: Pick<Patient, 'id' | 'name' | 'age' | 'condition' | 'area' | 'avatar' | 'level'>,
  history: SessionResult[],
): Patient {
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

  const recentSessions: RecentSession[] = sortedDesc.slice(0, 5).map(s => ({
    date: formatDay(s.date),
    // La duración solo la traen las partidas de la base. Sin ella va 0 y la
    // carpeta lo pinta "—": nunca se estima un tiempo que no se midió.
    duration: s.minutes ?? 0,
    exercises: s.total,
    accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
  }))

  const weekMinutes = thisWeek.filter(s => s.minutes != null)
  const avgDuration = history.length > 0
    ? Math.round(history.reduce((a, s) => a + (s.minutes ?? 0), 0) / history.length)
    : 0

  const localWeek: LocalWeek = {
    sessions: thisWeek.length,
    minutes: weekMinutes.length > 0 ? weekMinutes.reduce((a, s) => a + (s.minutes ?? 0), 0) : null,
    exercises: thisWeek.reduce((a, s) => a + s.total, 0),
    accuracy: accuracyOf(thisWeek),
    prevAccuracy: accuracyOf(prevWeek),
    streak: streakOf(history),
  }

  return {
    ...base,
    status: thisWeek.length >= 5 ? 'completed' : thisWeek.length > 0 ? 'pending' : 'overdue',
    metrics: {
      sessionsThisWeek: thisWeek.length,
      sessionsTarget: 5,
      avgDuration,
      progressPct: 0,
    },
    weeklyProgress,
    recentSessions,
    lastPlayedISO: sortedDesc[0] ? parseDay(sortedDesc[0].date).toISOString() : null,
    totalSessions: history.length,
    localWeek,
    history,
  }
}

// Pol como carpeta del escritorio, derivado del historial del navegador.
export function buildDemoChildPatient(history: SessionResult[]): Patient {
  const child = loadDemoChild()
  return buildPatient({
    id: DEMO_CHILD_ID,
    name: child.name,
    age: child.age,
    condition: '',            // no inventamos diagnóstico
    area: '',                 // sin objetivo registrado: la tarjeta no lo dibuja
    avatar: '',
    level: { min: child.level, max: child.level },
  }, history)
}

// Los pacientes que acompañan a Pol en el escritorio. Su historial se genera
// con el mismo motor, anclado a hoy y determinista por niño.
export function getDemoPatients(): Patient[] {
  return PATIENTS
    .filter(p => DEMO_IDS.includes(p.id))
    .map(p => buildPatient({
      id: p.id,
      name: p.name,
      age: p.age,
      condition: p.condition,
      area: p.area,
      avatar: p.avatar,
      level: p.level ?? null,
    }, buildDemoHistory(p.id, 7) as SessionResult[]))
}

// El escritorio del showroom completo: el niño del navegador primero.
export function buildDemoCaseload(history: SessionResult[]): Patient[] {
  return [buildDemoChildPatient(history), ...getDemoPatients()]
}
