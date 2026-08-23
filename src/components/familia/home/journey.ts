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
  days: JourneyDay[]            // últimos DAYS_SHOWN, del más viejo al más nuevo
  placesVisited: HotspotId[]    // en orden de FEATURED_PLACES
  newPlacesThisWeek: HotspotId[]
  daysPlayedThisWeek: number
  streakDays: number
  everyPlaceVisited: boolean
}

export const DAYS_SHOWN = 14

const DAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

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
  const todayIso = localIso(today)

  // Ventana de los últimos DAYS_SHOWN días, terminando hoy.
  const days: JourneyDay[] = []
  for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const iso = localIso(d)
    const places = byDate.get(iso)
    days.push({
      iso,
      label: DAY_INITIALS[d.getDay()],
      dayOfMonth: d.getDate(),
      played: byDate.has(iso),
      isToday: iso === todayIso,
      thisWeek: d >= weekStart,
      places: places ? [...places] : [],
    })
  }

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
    days,
    placesVisited,
    newPlacesThisWeek,
    daysPlayedThisWeek: days.filter(d => d.thisWeek && d.played).length,
    streakDays,
    everyPlaceVisited: placesVisited.length === order.length,
  }
}
