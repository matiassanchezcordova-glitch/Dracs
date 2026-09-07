// Notas clínicas de un niño: varias, cada una con su fecha.
//
// Real → children.clinical_notes, la columna de texto que ya existe, guardando
// un JSON con la lista. Si esa columna trae texto suelto de antes (una sola
// nota escrita con la versión anterior), se lee como una nota y no se pierde.
// Demo → localStorage. Las dos rutas guardan de verdad: no hay muro de cuenta.

import { supabase } from '../../../lib/supabase'

export interface ClinicalNote {
  id: string
  text: string
  createdAt: string   // ISO, o cadena vacía si viene de la versión anterior
}

const key = (id: string) => `dracs_notas_${id}`

export function newNoteId(): string {
  return `n${Date.now()}${Math.floor(Math.random() * 1000)}`
}

// Acepta las dos formas: la lista nueva y el texto suelto anterior.
function parseNotes(raw: string | null | undefined): ClinicalNote[] {
  const text = (raw ?? '').trim()
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((n): n is ClinicalNote => !!n && typeof n.text === 'string')
        .map(n => ({ id: n.id || newNoteId(), text: n.text, createdAt: n.createdAt ?? '' }))
    }
  } catch { /* no era JSON: es la nota suelta de antes */ }
  return [{ id: 'anterior', text, createdAt: '' }]
}

export async function loadClinicalNotes(isReal: boolean, id: string): Promise<ClinicalNote[]> {
  if (isReal) {
    const { data, error } = await supabase
      .from('children').select('clinical_notes').eq('id', id).maybeSingle()
    if (error || !data) return []
    return parseNotes(data.clinical_notes as string | null)
  }
  try {
    return parseNotes(localStorage.getItem(key(id)))
  } catch {
    return []
  }
}

export async function saveClinicalNotes(
  isReal: boolean,
  id: string,
  notes: ClinicalNote[],
): Promise<{ ok: boolean; error?: string }> {
  const payload = notes.length > 0 ? JSON.stringify(notes) : null

  if (isReal) {
    const { error } = await supabase.from('children').update({ clinical_notes: payload }).eq('id', id)
    return error ? { ok: false, error: error.message } : { ok: true }
  }
  try {
    if (payload) localStorage.setItem(key(id), payload)
    else localStorage.removeItem(key(id))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// "12 sep 2026" — corta y sin hora, que es lo que se mira en una lista.
export function noteDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const M = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`
}
