// Distribución por área ILUSTRATIVA para el modo demo.
//
// En demo no hay juegos etiquetados detrás (el historial del navegador guarda
// partidas, no áreas), así que en vez de un párrafo explicando qué se vería, se
// enseña la función con una distribución de ejemplo. La UI la marca "ejemplo",
// como las carpetas ilustrativas: nunca se presenta como dato del niño.

import { SKILL_LABELS } from './labels'

export interface AreaSlice {
  slug: string
  label: string
  pct: number
}

const SHAPE: [string, number][] = [
  ['lenguaje_receptivo', 46],
  ['atencion', 22],
  ['cognicion', 18],
  ['motricidad_fina', 14],
]

export const EXAMPLE_AREAS: AreaSlice[] = SHAPE.map(([slug, pct]) => ({
  slug,
  label: SKILL_LABELS[slug] ?? slug,
  pct,
}))
