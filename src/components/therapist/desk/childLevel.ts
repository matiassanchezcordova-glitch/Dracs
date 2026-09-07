// Nivel de dificultad de un niño: el rango que ya lee el escritorio.
// Real → child_assignments.difficulty_min / difficulty_max (las mismas columnas
// que devuelve getCurrentLevel, y que la familia también ve). Demo →
// localStorage, igual que el enfoque.
//
// No inventa nada: si no hay fila y no hay nada guardado, devuelve null y quien
// llama decide qué mostrar. Degrada con gracia si la tabla no responde.

import { supabase } from '../../../lib/supabase'

export interface ChildLevel {
  min: number
  max: number
}

export const LEVEL_MIN = 1
export const LEVEL_MAX = 5

const key = (id: string) => `dracs_level_${id}`

export function clampLevel(level: ChildLevel): ChildLevel {
  const min = Math.min(Math.max(level.min, LEVEL_MIN), LEVEL_MAX)
  const max = Math.min(Math.max(level.max, LEVEL_MIN), LEVEL_MAX)
  // La base tiene un CHECK (difficulty_min <= difficulty_max): lo respetamos
  // aquí también para no mandar nunca un rango imposible.
  return min <= max ? { min, max } : { min: max, max: min }
}

export async function loadChildLevel(isReal: boolean, id: string): Promise<ChildLevel | null> {
  if (isReal) {
    const { data, error } = await supabase
      .from('child_assignments')
      .select('difficulty_min, difficulty_max')
      .eq('child_id', id)
      .limit(1)
    if (error || !data || data.length === 0) return null
    return clampLevel({ min: data[0].difficulty_min, max: data[0].difficulty_max })
  }
  try {
    const raw = localStorage.getItem(key(id))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ChildLevel>
    if (typeof parsed.min !== 'number' || typeof parsed.max !== 'number') return null
    return clampLevel({ min: parsed.min, max: parsed.max })
  } catch {
    return null
  }
}

// En real: si el niño ya tiene fila de asignación se actualiza, si no se crea.
// La política de inserción exige assigned_by = auth.uid(), así que sin usuario
// no se intenta escribir.
export async function saveChildLevel(
  isReal: boolean,
  id: string,
  level: ChildLevel,
  assignedBy?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { min, max } = clampLevel(level)

  if (isReal) {
    if (!assignedBy) return { ok: false, error: 'sin usuario' }
    const { data, error: readErr } = await supabase
      .from('child_assignments').select('id').eq('child_id', id).limit(1)
    if (readErr) return { ok: false, error: readErr.message }

    if (data && data.length > 0) {
      const { error } = await supabase
        .from('child_assignments')
        .update({ difficulty_min: min, difficulty_max: max })
        .eq('id', data[0].id)
      return error ? { ok: false, error: error.message } : { ok: true }
    }

    const { error } = await supabase.from('child_assignments').insert({
      child_id: id, difficulty_min: min, difficulty_max: max, assigned_by: assignedBy,
    })
    return error ? { ok: false, error: error.message } : { ok: true }
  }

  try {
    localStorage.setItem(key(id), JSON.stringify({ min, max }))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
