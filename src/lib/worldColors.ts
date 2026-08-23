// Identidad de color por lugar del mapa-mundo.
//
// IDs: son los de `map_hotspots.id` en la DB — los mismos que viajan en la ruta
// `/app/nino/jugar/:hotspotId` y en las claves de audio `hotspot_intro_<id>`.
// Verificado contra la DB: sol, faro, casa, pulpo, castillo.
//
// OJO: no confundirlos con `exercises.place` (mar, casa, playa, cielo), que es
// el pool de juegos de cada hotspot. Son dos espacios de nombres distintos y
// solo coinciden en `casa`. La traducción place → hotspot vive en todaysGame.ts.
//   pulpo    → pool "mar"    · castillo → pool "playa"
//   sol      → pool "cielo"  · faro     → random_all

export type HotspotId = 'pulpo' | 'casa' | 'castillo' | 'sol' | 'faro'

export type WorldPalette = {
  primary: string      // color dominante del lugar
  primaryDark: string  // versión ~15% más oscura (track de la progress/divisor)
  accent: string       // acento (botones, bordes activos, progress)
  cream: string        // zona de juego (fija para todos)
  text: string         // texto sobre primary (blanco cálido)
}

export const CREAM = '#FAF5E8'
export const TEXT_ON_PRIMARY = '#FAFAF5'

export const WORLD_PALETTES: Record<HotspotId, WorldPalette> = {
  pulpo:    { primary: '#1E5FAA', primaryDark: '#164A85', accent: '#F5C842', cream: CREAM, text: TEXT_ON_PRIMARY }, // el mar - cobalto + mostaza
  casa:     { primary: '#9B8FD4', primaryDark: '#7A6FBA', accent: '#FF8551', cream: CREAM, text: TEXT_ON_PRIMARY }, // lila + naranja coral
  castillo: { primary: '#E8A93A', primaryDark: '#C68A1E', accent: '#FF7A85', cream: CREAM, text: TEXT_ON_PRIMARY }, // mostaza + rosa coral
  sol:      { primary: '#3FB8C4', primaryDark: '#2E96A0', accent: '#FFE066', cream: CREAM, text: TEXT_ON_PRIMARY }, // turquesa + limón
  faro:     { primary: '#4A3F73', primaryDark: '#352C56', accent: '#FFE93B', cream: CREAM, text: TEXT_ON_PRIMARY }, // violeta noche + amarillo neón
}

export function getPaletteForHotspot(id: string | undefined): WorldPalette {
  if (id && id in WORLD_PALETTES) return WORLD_PALETTES[id as HotspotId]
  // fallback al palette del mar (cobalto) cuando no hay hotspot
  return WORLD_PALETTES.pulpo
}
