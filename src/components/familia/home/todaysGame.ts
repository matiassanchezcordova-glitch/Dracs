// "Una cosa para hoy" — decisión única de qué se sugiere hoy (Phase 1).
//
// Si el terapeuta fijó un énfasis para el niño (emphasis_game_ids), "una cosa
// para hoy" abre uno de esos juegos, rotando de forma determinista por día
// (mismo día → mismo juego), igual que getPlaceOfTheDay. Si no hay énfasis, cae
// al lugar del día. El motor queda invisible: la familia ve calidez, el niño
// sólo juega; nunca se expone que lo eligió el terapeuta.
//
// No abre un ejercicio suelto (no existe esa ruta y no tocamos el juego del
// niño): abre la SESIÓN del lugar donde vive ese juego. El énfasis sugiere, no
// encierra: el niño sigue jugando el pool de ese lugar con su agencia intacta.

import type { HotspotId, WorldPalette } from '../../../lib/worldColors'
import { getPaletteForHotspot } from '../../../lib/worldColors'
import { getPlaceOfTheDay, dayOfYear, type PlaceOfDay } from './placeOfTheDay'

// place del ejercicio (exercises.place) → hotspot que abre esa sesión.
const PLACE_TO_HOTSPOT: Record<string, HotspotId> = {
  mar: 'mar', casa: 'casa', playa: 'playa', cielo: 'sol',
}

// Un juego del énfasis que sí es ruteable (su place mapea a un hotspot).
export interface EmphasisGame {
  id: string
  hotspotId: HotspotId
}

// Convierte los juegos del énfasis (id + place, desde exercises) a la lista
// ruteable que consume getTodaySuggestion. Descarta los sin lugar mapeable.
export function toEmphasisGames(rows: { id: string; place: string | null }[]): EmphasisGame[] {
  const out: EmphasisGame[] = []
  for (const r of rows) {
    const h = r.place ? PLACE_TO_HOTSPOT[r.place] : undefined
    if (h) out.push({ id: r.id, hotspotId: h })
  }
  return out
}

export type TodaySuggestion =
  | { kind: 'game'; hotspotId: HotspotId; palette: WorldPalette }
  | { kind: 'place'; place: PlaceOfDay }

// ── ÚNICO punto de decisión ─────────────────────────────────────────────────
export function getTodaySuggestion(emphasisGames: EmphasisGame[], today: Date = new Date()): TodaySuggestion {
  if (emphasisGames.length > 0) {
    const g = emphasisGames[dayOfYear(today) % emphasisGames.length]
    return { kind: 'game', hotspotId: g.hotspotId, palette: getPaletteForHotspot(g.hotspotId) }
  }
  return { kind: 'place', place: getPlaceOfTheDay(undefined, today) }
}
