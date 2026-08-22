// recommendGames — ÚNICO punto de decisión de la recomendación (Phase 3).
//
// v1: determinista sobre las etiquetas (primary_skill peso 2, secondary_skill
// peso 1). Rankea por peso de coincidencia y, a igualdad, muestra primero los
// juegos MENOS jugados por el niño (para abrir variedad). Aislada a propósito
// tras esta función: más adelante puede ganar matiz de LLM sin tocar la UI.
//
// Racional honesto, sin claims: "Trabaja {área}, en {lugar}." Nunca "mejora".

import { supabase } from '../../../lib/supabase'
import { skillLabelLower, placeLabel } from './labels'

export interface RecommendedGame {
  id: string
  title: string
  place: string | null
  matchWeight: number
  playCount: number
  matchedArea: string   // slug del área por la que entra (primaria si aplica)
  rationale: string     // "Trabaja {área}, en {lugar}."
}

export interface RecommendResult {
  available: boolean        // hay juegos etiquetados en la DB (migraciones aplicadas)
  items: RecommendedGame[]
  emptyAreas: string[]      // áreas de foco elegidas sin ningún juego que las trabaje
}

interface GameRow {
  id: string
  title: string
  place: string | null
  primary_skill: string | null
  secondary_skill: string | null
}

// `focusAreas`: slugs elegidos por el terapeuta. `childId`: para ponderar por lo
// menos jugado (opcional; en demo o sin datos, se ignora).
export async function recommendGames(focusAreas: string[], childId: string | null): Promise<RecommendResult> {
  const focus = new Set(focusAreas)
  if (focus.size === 0) return { available: true, items: [], emptyAreas: [] }

  // 1) Catálogo etiquetado. Si las columnas de skill no existen aún, la query
  //    falla: la recomendación no está disponible todavía.
  const cat = await supabase.from('exercises').select('id, title, place, primary_skill, secondary_skill')
  if (cat.error) return { available: false, items: [], emptyAreas: [] }
  const games = (cat.data ?? []) as GameRow[]

  // 2) Conteo de jugadas del niño (para "menos jugado primero").
  const playCount: Record<string, number> = {}
  if (childId) {
    const { data: sess } = await supabase.from('sessions').select('id').eq('child_id', childId).limit(500)
    const sessionIds = (sess ?? []).map((s: { id: string }) => s.id)
    if (sessionIds.length > 0) {
      const { data: plays } = await supabase.from('session_exercises').select('exercise_id').in('session_id', sessionIds).limit(5000)
      for (const p of (plays ?? []) as { exercise_id: string }[]) {
        playCount[p.exercise_id] = (playCount[p.exercise_id] ?? 0) + 1
      }
    }
  }

  // 3) Áreas de foco que ningún juego trabaja (para el estado honesto por área).
  const coveredAreas = new Set<string>()
  for (const g of games) {
    if (g.primary_skill) coveredAreas.add(g.primary_skill)
    if (g.secondary_skill) coveredAreas.add(g.secondary_skill)
  }
  const emptyAreas = [...focus].filter(a => !coveredAreas.has(a))

  // 4) Puntuar y rankear.
  const items: RecommendedGame[] = []
  for (const g of games) {
    const primHit = g.primary_skill && focus.has(g.primary_skill)
    const secHit = g.secondary_skill && focus.has(g.secondary_skill)
    const weight = (primHit ? 2 : 0) + (secHit ? 1 : 0)
    if (weight === 0) continue
    const matchedArea = (primHit ? g.primary_skill : g.secondary_skill) as string
    items.push({
      id: g.id,
      title: g.title,
      place: g.place,
      matchWeight: weight,
      playCount: playCount[g.id] ?? 0,
      matchedArea,
      rationale: `Trabaja ${skillLabelLower(matchedArea)}, en ${placeLabel(g.place)}.`,
    })
  }

  items.sort((a, b) =>
    b.matchWeight - a.matchWeight ||
    a.playCount - b.playCount ||
    a.title.localeCompare(b.title, 'es'),
  )

  return { available: true, items, emptyAreas }
}
