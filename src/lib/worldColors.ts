// Identidad de color por lugar del mapa-mundo.
//
// NOTA sobre los IDs: el plan de rediseño usaba nombres descriptivos
// (pulpo, castillo) como placeholders, pero los IDs reales de los hotspots en
// la DB son `mar, casa, playa, faro, sol` (se confirman vía las keys de audio
// `hotspot_intro_<id>` en 005_audio_setup.sql). Se mapean acá a los IDs reales
// para que cada uno de los 5 hotspots reciba su paleta distinta:
//   pulpo    → mar    (el mar / pulpo)
//   castillo → playa  (el castillo de arena)

export type HotspotId = 'mar' | 'casa' | 'playa' | 'sol' | 'faro'

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
  mar:   { primary: '#1E5FAA', primaryDark: '#164A85', accent: '#F5C842', cream: CREAM, text: TEXT_ON_PRIMARY }, // mar - cobalto + mostaza
  casa:  { primary: '#9B8FD4', primaryDark: '#7A6FBA', accent: '#FF8551', cream: CREAM, text: TEXT_ON_PRIMARY }, // lila + naranja coral
  playa: { primary: '#E8A93A', primaryDark: '#C68A1E', accent: '#FF7A85', cream: CREAM, text: TEXT_ON_PRIMARY }, // mostaza + rosa coral
  sol:   { primary: '#3FB8C4', primaryDark: '#2E96A0', accent: '#FFE066', cream: CREAM, text: TEXT_ON_PRIMARY }, // turquesa + limón
  faro:  { primary: '#4A3F73', primaryDark: '#352C56', accent: '#FFE93B', cream: CREAM, text: TEXT_ON_PRIMARY }, // violeta noche + amarillo neón
}

export function getPaletteForHotspot(id: string | undefined): WorldPalette {
  if (id && id in WORLD_PALETTES) return WORLD_PALETTES[id as HotspotId]
  // fallback al palette del mar (cobalto) cuando no hay hotspot
  return WORLD_PALETTES.mar
}
