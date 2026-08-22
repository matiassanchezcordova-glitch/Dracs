// Persistencia del enfoque de un niño (Phase 3): áreas, nota y set de énfasis.
// Real → columnas de children (migración 011). Demo → localStorage.
// Degrada con gracia si las columnas aún no existen (load → vacío; save → error).

import { supabase } from '../../../lib/supabase'

export interface ChildFocus {
  areas: string[]      // slugs de áreas de foco
  note: string         // nota libre de contexto (no se parsea en v1)
  emphasis: string[]   // ids de juegos fijados como énfasis
}

export const EMPTY_FOCUS: ChildFocus = { areas: [], note: '', emphasis: [] }

const key = (id: string) => `dracs_focus_${id}`

export async function loadChildFocus(isReal: boolean, id: string): Promise<ChildFocus> {
  if (isReal) {
    const { data, error } = await supabase
      .from('children').select('focus_areas, focus_note, emphasis_game_ids').eq('id', id).maybeSingle()
    if (error || !data) return { ...EMPTY_FOCUS }
    return {
      areas: (data.focus_areas as string[] | null) ?? [],
      note: (data.focus_note as string | null) ?? '',
      emphasis: (data.emphasis_game_ids as string[] | null) ?? [],
    }
  }
  try {
    const raw = localStorage.getItem(key(id))
    return raw ? { ...EMPTY_FOCUS, ...(JSON.parse(raw) as Partial<ChildFocus>) } : { ...EMPTY_FOCUS }
  } catch { return { ...EMPTY_FOCUS } }
}

export async function saveChildFocus(isReal: boolean, id: string, focus: ChildFocus): Promise<{ ok: boolean; error?: string }> {
  if (isReal) {
    const { error } = await supabase.from('children').update({
      focus_areas: focus.areas,
      focus_note: focus.note.trim() || null,
      emphasis_game_ids: focus.emphasis,
    }).eq('id', id)
    return error ? { ok: false, error: error.message } : { ok: true }
  }
  try {
    localStorage.setItem(key(id), JSON.stringify(focus))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
