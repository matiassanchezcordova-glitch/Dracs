// El último informe de un niño: período, versión y el comentario del logopeda.
//
// Real → tabla child_reports (migración 014). Demo → localStorage. Si la
// migración todavía no está aplicada, la escritura cae al navegador en vez de
// perderse: el borrador del logopeda no se tira nunca, y quien llama se entera
// por `stored` de dónde quedó.

import { supabase } from '../../../lib/supabase'
import type { PeriodId } from './informeData'

export interface InformeSaved {
  periodId: PeriodId
  from: string
  to: string
  version: 'familia' | 'entorno'
  comment: string
  savedAt: string
}

const key = (id: string) => `dracs_informe_${id}`

function readLocal(id: string): InformeSaved | null {
  try {
    const raw = localStorage.getItem(key(id))
    return raw ? (JSON.parse(raw) as InformeSaved) : null
  } catch {
    return null
  }
}

function writeLocal(id: string, data: InformeSaved): boolean {
  try {
    localStorage.setItem(key(id), JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export async function loadInforme(isReal: boolean, id: string): Promise<InformeSaved | null> {
  if (isReal) {
    const { data, error } = await supabase
      .from('child_reports')
      .select('period_id, period_from, period_to, version, comment_text, updated_at')
      .eq('child_id', id)
      .maybeSingle()
    if (!error && data) {
      return {
        periodId: (data.period_id as PeriodId) ?? 'mes',
        from: data.period_from as string,
        to: data.period_to as string,
        version: (data.version as 'familia' | 'entorno') ?? 'familia',
        comment: (data.comment_text as string | null) ?? '',
        savedAt: (data.updated_at as string | null) ?? '',
      }
    }
    // Sin tabla todavía: lo que se guardó en el navegador sigue valiendo.
    return readLocal(id)
  }
  return readLocal(id)
}

export async function saveInforme(
  isReal: boolean,
  id: string,
  data: InformeSaved,
  therapistId?: string,
): Promise<{ ok: boolean; stored: 'base' | 'navegador'; error?: string }> {
  if (isReal && therapistId) {
    const { error } = await supabase.from('child_reports').upsert({
      child_id: id,
      therapist_id: therapistId,
      period_id: data.periodId,
      period_from: data.from,
      period_to: data.to,
      version: data.version,
      comment_text: data.comment.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'child_id' })
    if (!error) return { ok: true, stored: 'base' }
    // La tabla puede no estar aplicada aún: no se pierde el borrador.
    return writeLocal(id, data)
      ? { ok: true, stored: 'navegador' }
      : { ok: false, stored: 'navegador', error: error.message }
  }
  return writeLocal(id, data)
    ? { ok: true, stored: 'navegador' }
    : { ok: false, stored: 'navegador', error: 'localStorage no disponible' }
}
