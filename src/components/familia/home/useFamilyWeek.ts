// ─────────────────────────────────────────────────────────────────────────────
// useFamilyWeek — traduce los datos del motor clínico a SEÑALES EMOCIONALES.
//
// La casa de la familia nunca ve números: este hook los consume (sesiones de
// Supabase o historial local del modo demo) y devuelve un `WeekSignal` cálido
// (banda de actividad, racha, tendencia) que la UI convierte en lenguaje.
// Degrada con gracia: sin datos → firstTime; datos finos → banda 'light'.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTherapist } from '../../../context/TherapistContext'
import { supabase } from '../../../lib/supabase'
import type { DbSession } from '../../../lib/types'
import { getStreakDays } from '../../../lib/derived'
import { loadHistory, type SessionResult } from '../../../hooks/useChildProfile'
import type { WeekSignal } from './familyHome.copy'

export interface FamilyWeek {
  loading: boolean
  childName: string
  signal: WeekSignal
  isTherapistPreview: boolean
}

const DEFAULT_NAME = 'Pablo'

const EMPTY_SIGNAL: WeekSignal = {
  firstTime: true, hasActivityThisWeek: false, band: 'none', improving: false, streakDays: 0,
}

function getLocalChildName(): string {
  try {
    const raw = localStorage.getItem('dracs_child_profile')
    if (!raw) return DEFAULT_NAME
    const p = JSON.parse(raw) as { name?: string }
    return p.name ?? DEFAULT_NAME
  } catch { return DEFAULT_NAME }
}

// Lunes 00:00 de la semana de `d` (semana lunes→domingo, igual que el informe).
function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const m = new Date(d)
  m.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  m.setHours(0, 0, 0, 0)
  return m
}

function bandFor(count: number): WeekSignal['band'] {
  if (count <= 0) return 'none'
  if (count <= 2) return 'light'
  if (count <= 4) return 'steady'
  return 'strong'
}

// ── Señal desde el historial local (demo / invitado) ─────────────────────────

function localSignal(history: SessionResult[]): WeekSignal {
  if (history.length === 0) {
    return { firstTime: true, hasActivityThisWeek: false, band: 'none', improving: false, streakDays: 0 }
  }
  const weekStart = mondayOf(new Date())
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(weekStart.getDate() - 7)
  const at = (s: SessionResult) => new Date(s.date + 'T00:00:00')

  const thisWeek = history.filter(s => at(s) >= weekStart)
  const lastWeek = history.filter(s => { const d = at(s); return d >= lastWeekStart && d < weekStart })

  const acc = (arr: SessionResult[]) => {
    const total = arr.reduce((a, s) => a + s.total, 0)
    const correct = arr.reduce((a, s) => a + s.correct, 0)
    return total > 0 ? correct / total : 0
  }

  // Racha local: días consecutivos con partida, terminando hoy (o ayer).
  const days = new Set(history.map(s => s.date))
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const cursor = new Date()
  if (!days.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(iso(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1) }

  return {
    firstTime: false,
    hasActivityThisWeek: thisWeek.length > 0,
    band: bandFor(thisWeek.length),
    improving: acc(thisWeek) > acc(lastWeek) || thisWeek.length > lastWeek.length,
    streakDays: streak,
  }
}

// ── Señal desde sesiones de Supabase ─────────────────────────────────────────

function supabaseSignal(sessions: DbSession[]): WeekSignal {
  if (sessions.length === 0) {
    return { firstTime: true, hasActivityThisWeek: false, band: 'none', improving: false, streakDays: 0 }
  }
  const weekStart = mondayOf(new Date()).getTime()
  const lastWeekStart = weekStart - 7 * 24 * 60 * 60 * 1000
  const t = (s: DbSession) => new Date(s.ended_at ?? s.started_at).getTime()

  const thisWeek = sessions.filter(s => t(s) >= weekStart)
  const lastWeek = sessions.filter(s => { const ts = t(s); return ts >= lastWeekStart && ts < weekStart })

  const acc = (arr: DbSession[]) => {
    const total = arr.reduce((a, s) => a + s.total_exercises, 0)
    const correct = arr.reduce((a, s) => a + s.correct_count, 0)
    return total > 0 ? correct / total : 0
  }

  return {
    firstTime: false,
    hasActivityThisWeek: thisWeek.length > 0,
    band: bandFor(thisWeek.length),
    improving: acc(thisWeek) > acc(lastWeek) || thisWeek.length > lastWeek.length,
    streakDays: getStreakDays(sessions),
  }
}

export function useFamilyWeek(): FamilyWeek {
  const { user, patient, profile } = useAuth()
  const { selectedPatientId } = useTherapist()

  const isTherapist = profile?.role === 'therapist'
  const patientId = isTherapist ? selectedPatientId : patient?.id ?? null
  const isSupabaseMode = !!(user && patientId)

  // Modo demo / invitado: el dato local ya está listo, sin esperar red.
  const local = useMemo(() => {
    if (isSupabaseMode) return null
    const history = loadHistory()
    return { name: getLocalChildName(), signal: localSignal(history) }
  }, [isSupabaseMode])

  // Resultado de Supabase etiquetado con su `key` (el patientId al que
  // corresponde). `loading` se DERIVA de comparar la key con el paciente
  // actual, así no reseteamos estado sincrónicamente dentro del efecto.
  const [sb, setSb] = useState<{ key: string; name: string; signal: WeekSignal } | null>(null)

  useEffect(() => {
    if (!isSupabaseMode || !patientId) return
    let cancelled = false

    ;(async () => {
      // Nombre: `children` para el terapeuta; `children_family_view` para la
      // familia (mantiene clinical_notes fuera del cliente de la familia, PD-4).
      const fetchChild = isTherapist
        ? supabase.from('children').select('full_name').eq('id', patientId).single()
        : supabase.from('children_family_view').select('full_name').eq('family_id', user!.id).maybeSingle()

      const [sessRes, chRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('*')
          .eq('child_id', patientId)
          .order('started_at', { ascending: false })
          .limit(50),
        fetchChild,
      ])
      if (cancelled) return

      const sessions = (sessRes.data ?? []) as DbSession[]
      const name = (chRes.data as { full_name?: string } | null)?.full_name ?? 'Paciente'
      setSb({ key: patientId, name, signal: supabaseSignal(sessions) })
    })()

    return () => { cancelled = true }
  }, [isSupabaseMode, patientId, isTherapist, user])

  if (isSupabaseMode) {
    const ready = sb !== null && sb.key === patientId
    return {
      loading: !ready,
      childName: ready ? sb.name : 'Paciente',
      signal: ready ? sb.signal : EMPTY_SIGNAL,
      isTherapistPreview: !!isTherapist,
    }
  }

  // Defensa: un terapeuta sin paciente elegido nunca debe ver datos demo
  // ("Pablo"). La página ya lo intercepta con "Elegí un paciente", pero el hook
  // no cae al modo local para un terapeuta.
  if (isTherapist) {
    return { loading: false, childName: 'Paciente', signal: EMPTY_SIGNAL, isTherapistPreview: true }
  }

  return {
    loading: false,
    childName: local?.name ?? DEFAULT_NAME,
    signal: local?.signal ?? EMPTY_SIGNAL,
    isTherapistPreview: false,
  }
}
