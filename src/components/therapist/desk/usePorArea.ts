// usePorArea — distribución de juego por área de habilidad, desde datos reales.
//
// Camino: session_exercises (lo que el niño jugó) → exercises (place + skills).
// Pondera primary_skill = 2 y secondary_skill = 1 (regla estructural de Phase 1),
// para que las áreas fuertes en "secundaria" también afloren.
//
// Degrada con gracia (§Phase 2): si aún no se aplicaron las migraciones 009/010
// (columnas primary_skill/secondary_skill ausentes o sin datos), `hasTags` = false
// y la UI muestra el estado honesto "Aún estamos recogiendo datos por área".
// Nunca inventa datos.

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { SKILL_LABELS, PLACE_LABELS } from './labels'

export interface AreaWeight { slug: string; label: string; weight: number; pct: number }

export interface PorArea {
  loading: boolean
  hasTags: boolean          // hay al menos un juego etiquetado con datos de juego
  totalPlays: number        // ejercicios jugados contabilizados
  distribution: AreaWeight[]
  placesVisited: string[]   // etiquetas de lugares visitados
}

const EMPTY: PorArea = { loading: false, hasTags: false, totalPlays: 0, distribution: [], placesVisited: [] }

export function usePorArea(childId: string | null | undefined): PorArea {
  // Resultado etiquetado con su childId. `loading` se DERIVA comparando la key
  // con el niño actual, así no reseteamos estado síncronamente en el efecto.
  const [res, setRes] = useState<{ key: string; data: PorArea } | null>(null)

  useEffect(() => {
    if (!childId) return
    let cancelled = false

    ;(async () => {
      // 1) Sesiones del niño.
      const { data: sess } = await supabase
        .from('sessions').select('id').eq('child_id', childId).limit(500)
      const sessionIds = (sess ?? []).map((s: { id: string }) => s.id)
      if (cancelled) return
      if (sessionIds.length === 0) { setRes({ key: childId, data: { ...EMPTY } }); return }

      // 2) Ejercicios jugados en esas sesiones.
      const { data: plays } = await supabase
        .from('session_exercises').select('exercise_id').in('session_id', sessionIds).limit(5000)
      const exerciseIds = [...new Set((plays ?? []).map((p: { exercise_id: string }) => p.exercise_id))]
      if (cancelled) return
      if (exerciseIds.length === 0) { setRes({ key: childId, data: { ...EMPTY } }); return }

      // 3) Metadata de esos ejercicios (place + skills). Si las columnas de skill
      //    aún no existen, la query falla: caemos a place-only, hasTags = false.
      let rows: { id: string; place: string | null; primary_skill: string | null; secondary_skill: string | null }[] = []
      let tagsAvailable = true
      const withSkills = await supabase
        .from('exercises').select('id, place, primary_skill, secondary_skill').in('id', exerciseIds)
      if (withSkills.error) {
        tagsAvailable = false
        const placeOnly = await supabase.from('exercises').select('id, place').in('id', exerciseIds)
        rows = (placeOnly.data ?? []).map((r: { id: string; place: string | null }) => ({ ...r, primary_skill: null, secondary_skill: null }))
      } else {
        rows = (withSkills.data ?? []) as typeof rows
      }
      if (cancelled) return

      const byId = new Map(rows.map(r => [r.id, r]))

      // 4) Ponderar por cada ejercicio JUGADO (cuenta repeticiones de juego).
      const weights: Record<string, number> = {}
      const places = new Set<string>()
      let taggedSeen = false
      for (const p of (plays ?? []) as { exercise_id: string }[]) {
        const ex = byId.get(p.exercise_id)
        if (!ex) continue
        if (ex.place && PLACE_LABELS[ex.place]) places.add(PLACE_LABELS[ex.place])
        if (ex.primary_skill) { weights[ex.primary_skill] = (weights[ex.primary_skill] ?? 0) + 2; taggedSeen = true }
        if (ex.secondary_skill) { weights[ex.secondary_skill] = (weights[ex.secondary_skill] ?? 0) + 1; taggedSeen = true }
      }

      const total = Object.values(weights).reduce((a, b) => a + b, 0)
      const distribution: AreaWeight[] = Object.entries(weights)
        .map(([slug, weight]) => ({ slug, label: SKILL_LABELS[slug] ?? slug, weight, pct: total > 0 ? Math.round((weight / total) * 100) : 0 }))
        .sort((a, b) => b.weight - a.weight)

      setRes({
        key: childId,
        data: {
          loading: false,
          hasTags: tagsAvailable && taggedSeen,
          totalPlays: (plays ?? []).length,
          distribution,
          placesVisited: [...places],
        },
      })
    })()

    return () => { cancelled = true }
  }, [childId])

  if (!childId) return EMPTY
  if (res && res.key === childId) return res.data
  return { ...EMPTY, loading: true }
}
