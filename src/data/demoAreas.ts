// Distribución por área y lugares visitados, derivadas del historial local.
//
// En cuenta real esto sale de Supabase (usePorArea, con el peso 2/1 de primaria
// y secundaria). En la demo sale del detalle por ejercicio que siembra
// demoHistory: cada ejercicio trae su área y su lugar, así que la distribución
// es un recuento de lo que el niño jugó de verdad, no una ilustración.

import { PLACE_LABELS, SKILL_LABELS } from '../components/therapist/desk/labels'
import type { DemoSession } from './demoHistory'

export interface AreaSlice {
  slug: string
  label: string
  pct: number
}

export function localAreas(history: DemoSession[]): AreaSlice[] {
  const counts = new Map<string, number>()
  let total = 0
  for (const s of history) {
    for (const item of s.items ?? []) {
      counts.set(item.skill, (counts.get(item.skill) ?? 0) + 1)
      total++
    }
  }
  if (total === 0) return []
  return [...counts.entries()]
    .map(([slug, n]) => ({ slug, label: SKILL_LABELS[slug] ?? slug, pct: Math.round((n / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
}

export function localPlaces(history: DemoSession[]): string[] {
  const seen = new Set<string>()
  for (const s of history) {
    for (const item of s.items ?? []) seen.add(item.place)
  }
  return [...seen].map(p => PLACE_LABELS[p] ?? p)
}
