// El lugar de hoy — un único punto de decisión, aislado a propósito.
//
// Elige UN lugar del mundo por día, de forma determinista (mismo día → mismo
// lugar). NO es una recomendación clínica ni un motor: es una rotación diaria
// cálida. Pensado para intercambiarse a futuro por la recomendación real del
// motor/terapeuta SIN tocar la UI: basta reimplementar getPlaceOfTheDay().

import type { Icon } from '@phosphor-icons/react'
import { Waves, House, CastleTurret, Sun, Lighthouse } from '@phosphor-icons/react'
import { WORLD_PALETTES, type HotspotId, type WorldPalette } from '../../../lib/worldColors'

export interface PlaceOfDay {
  id: HotspotId
  name: string   // nombre cálido, en minúscula ("el mar")
  Icon: Icon     // ícono Phosphor del lugar (sin emoji nativo)
  palette: WorldPalette
}

// Metadata curada de los 5 lugares reales del mundo (ids tal como están en la DB
// de map_hotspots). Los nombres siguen los intros de audio del juego.
const PLACES: Record<HotspotId, { name: string; Icon: Icon }> = {
  mar:   { name: 'el mar',               Icon: Waves },
  casa:  { name: 'la casa',              Icon: House },
  playa: { name: 'el castillo de arena', Icon: CastleTurret },
  sol:   { name: 'el sol',               Icon: Sun },
  faro:  { name: 'el faro',              Icon: Lighthouse },
}

// Orden "destacado" curado — pura rotación, sin lógica clínica.
export const FEATURED_PLACES: HotspotId[] = ['mar', 'casa', 'playa', 'sol', 'faro']

// Día del año (0–365) en horario local.
function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000)
}

// ── ÚNICO punto de decisión ─────────────────────────────────────────────────
// `available` acepta los ids de hotspots activos de la DB si algún día se
// quieren usar; si se omite, cae en la lista curada. La copy que lo consume lo
// trata siempre como "el lugar de hoy" (pick diario), nunca como personalizado.
export function getPlaceOfTheDay(available?: string[], today: Date = new Date()): PlaceOfDay {
  const filtered = (available ?? []).filter((id): id is HotspotId => id in PLACES)
  const pool = filtered.length ? filtered : FEATURED_PLACES
  const id = pool[dayOfYear(today) % pool.length]
  return { id, name: PLACES[id].name, Icon: PLACES[id].Icon, palette: WORLD_PALETTES[id] }
}
