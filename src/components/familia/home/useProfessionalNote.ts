// El comentario que el profesional publica para la familia esta semana, desde
// la sección Familia de su carpeta. Es el puente entre las dos vistas: lo que
// se publica allí se lee aquí, junto a la carta de la semana.
//
// En la demo vive en el navegador (misma clave que escribe la carpeta). Con
// cuenta real se lee de therapist_comments; si la base no lo deja leer, no se
// muestra nada y la casa sigue igual.

import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTherapist } from '../../../context/TherapistContext'
import { supabase } from '../../../lib/supabase'
import { getWeekCode } from '../../../lib/utils'

export interface ProfessionalNote {
  text: string
  date: string
  author: string
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function readLocal(childName: string): ProfessionalNote | null {
  try {
    const raw = localStorage.getItem(`dracs_comment_${slugify(childName)}_${getWeekCode()}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { texto?: string; fecha?: string; terapeuta?: string }
    if (!parsed.texto?.trim()) return null
    return { text: parsed.texto.trim(), date: parsed.fecha ?? '', author: parsed.terapeuta ?? 'Su profesional' }
  } catch {
    return null
  }
}

export function useProfessionalNote(childName: string): ProfessionalNote | null {
  const { user, patient, profile } = useAuth()
  const { selectedPatientId } = useTherapist()
  const isTherapist = profile?.role === 'therapist'
  const patientId = isTherapist ? selectedPatientId : patient?.id ?? null
  const isReal = !!(user && patientId)

  const [real, setReal] = useState<{ key: string; note: ProfessionalNote | null } | null>(null)

  useEffect(() => {
    if (!isReal || !patientId) return
    let cancelled = false
    supabase.from('therapist_comments')
      .select('comment_text, created_at')
      .eq('patient_id', patientId)
      .eq('week_code', getWeekCode())
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        const text = (data?.comment_text as string | undefined)?.trim()
        const at = data?.created_at ? new Date(data.created_at as string) : null
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
        setReal({
          key: patientId,
          note: !error && text
            ? { text, date: at ? `${at.getDate()} ${months[at.getMonth()]}` : '', author: 'Su profesional' }
            : null,
        })
      })
    return () => { cancelled = true }
  }, [isReal, patientId])

  if (isReal) return real && real.key === patientId ? real.note : null
  return readLocal(childName)
}
