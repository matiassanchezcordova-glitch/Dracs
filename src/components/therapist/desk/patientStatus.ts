// Estado humano de una carpeta, derivado de datos REALES (nada inventado).
// Una línea directa que el terapeuta lee de un vistazo: qué pasó, sin claims.

export type StatusTone = 'played' | 'attention' | 'idle'

export interface DeskStatus {
  text: string
  tone: StatusTone
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function startOfDay(d: Date): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000)
}

// `sessionsThisWeek`, `lastPlayedISO` y `totalSessions` vienen de las sesiones
// reales del niño (o de los datos de ejemplo en modo demo).
export function deskStatus(input: {
  sessionsThisWeek: number
  lastPlayedISO?: string | null
  totalSessions?: number
}): DeskStatus {
  const { sessionsThisWeek, lastPlayedISO, totalSessions } = input

  // Jugó esta semana.
  if (sessionsThisWeek >= 1) {
    if (lastPlayedISO && (totalSessions ?? 0) === 1 && daysBetween(new Date(lastPlayedISO), new Date()) === 0) {
      return { text: 'Empezó hoy', tone: 'played' }
    }
    const n = sessionsThisWeek
    return { text: `Jugó ${n} ${n === 1 ? 'vez' : 'veces'} esta semana`, tone: 'played' }
  }

  // Sin partidas esta semana.
  if (!lastPlayedISO || (totalSessions ?? 0) === 0) {
    return { text: 'Aún no ha jugado', tone: 'idle' }
  }

  const last = new Date(lastPlayedISO)
  const diff = daysBetween(last, new Date())

  // Jugó antes, pero no esta semana.
  if (diff <= 1) {
    return { text: diff === 0 ? 'No abrió hoy' : 'No abrió desde ayer', tone: 'attention' }
  }
  if (diff <= 7) {
    return { text: `No abrió desde el ${DAYS[last.getDay()]}`, tone: 'attention' }
  }
  return { text: 'No abrió hace más de una semana', tone: 'attention' }
}
