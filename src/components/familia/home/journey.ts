// El recorrido — traduce el historial de partidas a un CAMINO, no a un informe.
//
// Principio 5, duro: acá no entra ni un número clínico. Nada de aciertos, ni
// niveles, ni "sesiones". Sólo por dónde anduvo el niño: qué días abrió su
// mundo, qué lugares conoció, y qué se animó a hacer esta semana. El dato
// clínico es del terapeuta; si se filtra acá, la casa se vuelve un boletín.
//
// Es pura: recibe partidas ya normalizadas y devuelve el recorrido. Sirve igual
// para el historial local del showroom y para las sesiones de Supabase.

import type { HotspotId } from '../../../lib/worldColors'
import { WORLD_PALETTES } from '../../../lib/worldColors'

// Una partida, reducida a lo único que la familia puede ver.
export interface JourneyPlay {
  date: string          // YYYY-MM-DD (fecha local)
  place?: string        // map_hotspots.id, si quedó registrado
}

export interface JourneyDay {
  iso: string
  label: string         // inicial del día ("L", "M", "X"…)
  dayOfMonth: number
  played: boolean
  isToday: boolean
  thisWeek: boolean
  places: HotspotId[]   // lugares de ese día (vacío si no se registraron)
}

export interface Journey {
  firstTime: boolean
  // Índice completo fecha → lugares. La semana visible se recorta de acá, así
  // los agregados de abajo no dependen de por dónde esté navegando la familia.
  playedDates: Record<string, HotspotId[]>
  placesVisited: HotspotId[]    // en orden del mundo
  newPlacesThisWeek: HotspotId[]
  daysPlayedThisWeek: number
  streakDays: number
  everyPlaceVisited: boolean
}

// Una semana concreta del recorrido (lunes → domingo).
export interface JourneyWeek {
  days: JourneyDay[]
  label: string          // "Semana del 17 al 23 de agosto"
  isCurrent: boolean
  canGoBack: boolean     // hay historial antes de esta semana
  canGoForward: boolean  // nunca se navega al futuro
}

// Cuántas semanas hacia atrás deja navegar el recorrido.
export const WEEKS_BACK = 8

const DAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Lunes 00:00 de la semana de `d` — misma regla que el resto de la casa.
function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const m = new Date(d)
  m.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  m.setHours(0, 0, 0, 0)
  return m
}

function isHotspotId(v: string | undefined): v is HotspotId {
  return !!v && v in WORLD_PALETTES
}

export function buildJourney(plays: JourneyPlay[], today: Date = new Date()): Journey {
  // Índice fecha → lugares de ese día (sin repetir).
  const byDate = new Map<string, Set<HotspotId>>()
  for (const p of plays) {
    if (!byDate.has(p.date)) byDate.set(p.date, new Set())
    if (isHotspotId(p.place)) byDate.get(p.date)!.add(p.place)
  }

  const weekStart = mondayOf(today)

  // Índice serializable de fecha → lugares, para recortar cualquier semana.
  const playedDates: Record<string, HotspotId[]> = {}
  for (const [iso, places] of byDate) playedDates[iso] = [...places]

  const allDates = [...byDate.keys()].sort()

  // Lugares: todos los conocidos, y los estrenados esta semana.
  const allPlaces = new Set<HotspotId>()
  const placesThisWeek = new Set<HotspotId>()
  const placesBeforeThisWeek = new Set<HotspotId>()
  for (const p of plays) {
    if (!isHotspotId(p.place)) continue
    allPlaces.add(p.place)
    const d = new Date(p.date + 'T00:00:00')
    if (d >= weekStart) placesThisWeek.add(p.place)
    else placesBeforeThisWeek.add(p.place)
  }
  const order = Object.keys(WORLD_PALETTES) as HotspotId[]
  const placesVisited = order.filter(id => allPlaces.has(id))
  const newPlacesThisWeek = order.filter(id => placesThisWeek.has(id) && !placesBeforeThisWeek.has(id))

  // Racha: días consecutivos con partida, terminando hoy (o ayer). Misma regla
  // que la señal de la semana, para que la casa no se contradiga a sí misma.
  const cursor = new Date(today)
  if (!byDate.has(localIso(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streakDays = 0
  while (byDate.has(localIso(cursor))) {
    streakDays++
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    firstTime: plays.length === 0,
    playedDates,
    placesVisited,
    newPlacesThisWeek,
    daysPlayedThisWeek: allDates.filter(iso => iso >= localIso(weekStart)).length,
    streakDays,
    everyPlaceVisited: placesVisited.length === order.length,
  }
}

// ── La semana visible ────────────────────────────────────────────────────────
// `offset` en semanas respecto de la actual: 0 = esta semana, -1 = la anterior.
// Nunca se navega al futuro: la semana en curso es el tope.
export function getJourneyWeek(journey: Journey, offset: number, today: Date = new Date()): JourneyWeek {
  const currentMonday = mondayOf(today)
  const monday = new Date(currentMonday)
  monday.setDate(currentMonday.getDate() + offset * 7)
  const todayIso = localIso(today)
  const currentMondayIso = localIso(currentMonday)

  const days: JourneyDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = localIso(d)
    const places = journey.playedDates[iso]
    days.push({
      iso,
      label: DAY_INITIALS[d.getDay()],
      dayOfMonth: d.getDate(),
      played: !!places,
      isToday: iso === todayIso,
      thisWeek: localIso(monday) === currentMondayIso,
      places: places ?? [],
    })
  }

  const start = monday
  const end = new Date(monday)
  end.setDate(monday.getDate() + 6)
  const label = start.getMonth() === end.getMonth()
    ? `Semana del ${start.getDate()} al ${end.getDate()} de ${MONTHS[end.getMonth()]}`
    : `Semana del ${start.getDate()} de ${MONTHS[start.getMonth()]} al ${end.getDate()} de ${MONTHS[end.getMonth()]}`

  // Regla simple y predecible: hacia atrás hasta WEEKS_BACK semanas (aunque
  // estén vacías — ver una semana sin piedritas es información, no un error);
  // hacia adelante, nunca más allá de la semana en curso. Acotar el pasado a
  // "sólo donde hay historial" dejaba las DOS flechas muertas en el caso más
  // común del showroom (todo el historial dentro de esta semana).
  return {
    days,
    label,
    isCurrent: offset === 0,
    canGoBack: offset > -WEEKS_BACK,
    canGoForward: offset < 0,
  }
}
