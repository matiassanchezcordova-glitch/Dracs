// Persistencia del enfoque de un niño (Phase 3): áreas, nota, set de énfasis y
// objetivos por área.
// Real → columnas de children (migración 011, y 015 para los objetivos).
// Demo → localStorage.
// Degrada con gracia si las columnas aún no existen (load → vacío; save → error).
//
// Dos slices, dos guardados. `saveChildFocus` escribe áreas, nota y énfasis;
// `saveChildGoals` escribe sólo los objetivos. Así las dos partes del Plan
// (Enfocar el mundo y Objetivos) guardan cada una lo suyo sin pisarse.

import { supabase } from '../../../lib/supabase'

// Un objetivo por área fijada. La línea base y la trayectoria son DATO; el
// objetivo lo escribe el logopeda con sus palabras y el cumplimiento lo marca
// él. Dracs no juzga ninguno de los dos.
export interface FocusGoal {
  area: string            // slug de área de habilidad
  baselineLabel: string   // el dato del que se partió, en texto descriptivo
  baselineDate: string    // YYYY-MM-DD en que se tomó la línea base
  target: string          // a dónde quiere llegar, con las palabras del logopeda
  setDate: string         // YYYY-MM-DD en que se fijó el objetivo
  lastReviewDate: string  // YYYY-MM-DD de la última revisión
  done: boolean           // lo marca el logopeda, nunca Dracs
}

export interface ChildFocus {
  areas: string[]      // slugs de áreas de foco
  note: string         // nota libre de contexto (no se parsea en v1)
  emphasis: string[]   // ids de juegos fijados como énfasis
  goals: FocusGoal[]   // un objetivo por área, como mucho
}

export const EMPTY_FOCUS: ChildFocus = { areas: [], note: '', emphasis: [], goals: [] }

const key = (id: string) => `dracs_focus_${id}`

// Los objetivos llegan de jsonb (real) o de JSON del navegador (demo): se
// saneen siempre, que un campo raro no reviente el Plan.
function parseGoals(raw: unknown): FocusGoal[] {
  if (!Array.isArray(raw)) return []
  const out: FocusGoal[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const g = item as Partial<FocusGoal>
    if (typeof g.area !== 'string' || !g.area) continue
    out.push({
      area: g.area,
      baselineLabel: typeof g.baselineLabel === 'string' ? g.baselineLabel : '',
      baselineDate: typeof g.baselineDate === 'string' ? g.baselineDate : '',
      target: typeof g.target === 'string' ? g.target : '',
      setDate: typeof g.setDate === 'string' ? g.setDate : '',
      lastReviewDate: typeof g.lastReviewDate === 'string' ? g.lastReviewDate : '',
      done: g.done === true,
    })
  }
  return out
}

function readLocal(id: string): ChildFocus {
  try {
    const raw = localStorage.getItem(key(id))
    if (!raw) return { ...EMPTY_FOCUS }
    const parsed = JSON.parse(raw) as Partial<ChildFocus>
    return { ...EMPTY_FOCUS, ...parsed, goals: parseGoals(parsed.goals) }
  } catch { return { ...EMPTY_FOCUS } }
}

interface FocusRow {
  focus_areas?: string[] | null
  focus_note?: string | null
  emphasis_game_ids?: string[] | null
  focus_goals?: unknown
}

export async function loadChildFocus(isReal: boolean, id: string): Promise<ChildFocus> {
  if (isReal) {
    // Con objetivos primero; si la columna 015 aún no está, se reintenta sin
    // ella para que el resto del enfoque siga cargando.
    let row: FocusRow | null = null
    const withGoals = await supabase
      .from('children').select('focus_areas, focus_note, emphasis_game_ids, focus_goals').eq('id', id).maybeSingle()
    if (withGoals.error) {
      const legacy = await supabase
        .from('children').select('focus_areas, focus_note, emphasis_game_ids').eq('id', id).maybeSingle()
      row = (legacy.data as FocusRow | null) ?? null
    } else {
      row = (withGoals.data as FocusRow | null) ?? null
    }
    if (!row) return { ...EMPTY_FOCUS }
    return {
      areas: row.focus_areas ?? [],
      note: row.focus_note ?? '',
      emphasis: row.emphasis_game_ids ?? [],
      goals: parseGoals(row.focus_goals),
    }
  }
  return readLocal(id)
}

// Guarda áreas, nota y énfasis. NO toca los objetivos: de eso se encarga
// saveChildGoals, y así guardar el enfoque nunca pisa un objetivo recién escrito.
export async function saveChildFocus(isReal: boolean, id: string, focus: Omit<ChildFocus, 'goals'>): Promise<{ ok: boolean; error?: string }> {
  if (isReal) {
    const { error } = await supabase.from('children').update({
      focus_areas: focus.areas,
      focus_note: focus.note.trim() || null,
      emphasis_game_ids: focus.emphasis,
    }).eq('id', id)
    return error ? { ok: false, error: error.message } : { ok: true }
  }
  try {
    const current = readLocal(id)
    localStorage.setItem(key(id), JSON.stringify({ ...current, areas: focus.areas, note: focus.note, emphasis: focus.emphasis }))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// Guarda sólo los objetivos, en la base (columna focus_goals) o en el navegador.
export async function saveChildGoals(isReal: boolean, id: string, goals: FocusGoal[]): Promise<{ ok: boolean; error?: string }> {
  if (isReal) {
    const { error } = await supabase.from('children').update({ focus_goals: goals }).eq('id', id)
    return error ? { ok: false, error: error.message } : { ok: true }
  }
  try {
    const current = readLocal(id)
    localStorage.setItem(key(id), JSON.stringify({ ...current, goals }))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
