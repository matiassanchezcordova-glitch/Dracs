// La agenda de la demo: qué sesiones hay cada día y las videollamadas propuestas.
//
// Las sesiones se derivan del día y de la lista de pacientes, siempre igual para
// la misma fecha (no cambian entre recargas) y solo de lunes a viernes, que es
// cuando se pasa consulta. Es la base de la demo, como el historial de juego.
//
// Las videollamadas sí son del terapeuta: las crea él y se guardan en el
// navegador, así que al volver siguen ahí.

const HORARIOS = ['09:30', '11:00', '12:15', '16:00', '17:30', '18:15']
const CALLS_KEY = 'dracs_videollamadas'

export interface Cita {
  time: string
  patientId: string
}

export interface Videollamada {
  id: string
  day: string       // YYYY-MM-DD
  time: string      // HH:MM
  patientId: string
  patientName: string
}

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Citas de un día. Fin de semana, ninguna.
export function citasDe(day: string, patientIds: string[]): Cita[] {
  if (patientIds.length === 0) return []
  const [y, m, d] = day.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return []

  const seed = hash(day)
  const count = 1 + (seed % 3)               // 1 a 3 sesiones
  const startAt = seed % HORARIOS.length

  const citas: Cita[] = []
  for (let i = 0; i < count; i++) {
    const time = HORARIOS[(startAt + i) % HORARIOS.length]
    const patientId = patientIds[(seed + i * 7) % patientIds.length]
    if (citas.some(c => c.patientId === patientId)) continue
    citas.push({ time, patientId })
  }
  return citas.sort((a, b) => (a.time < b.time ? -1 : 1))
}

export function loadVideollamadas(): Videollamada[] {
  try {
    const raw = localStorage.getItem(CALLS_KEY)
    const parsed = raw ? (JSON.parse(raw) as Videollamada[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveVideollamada(call: Videollamada): Videollamada[] {
  const next = [...loadVideollamadas().filter(c => c.id !== call.id), call]
    .sort((a, b) => (a.day + a.time < b.day + b.time ? -1 : 1))
  try {
    localStorage.setItem(CALLS_KEY, JSON.stringify(next))
  } catch { /* navegador sin almacenamiento: se ve en esta sesión y ya */ }
  return next
}
