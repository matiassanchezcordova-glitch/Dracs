// Escritorio del Terapeuta — orquestador (§Phase 2).
// Aterriza en El Escritorio (grilla de carpetas). Al tocar una carpeta se abre
// La Carpeta (detalle).
//
// Dos modos: con cuenta de terapeuta, los pacientes reales de Supabase. En el
// showroom, el niño demo del navegador (Pol) como carpeta principal —construido
// desde el mismo historial que escribe el niño al jugar— más tres carpetas de
// ejemplo debajo, marcadas como tales.

import { useEffect, useMemo, useState } from 'react'
import { type Patient as MockPatient } from '../../data/patients'
import { buildDemoCaseload } from '../../data/demoCaseload'
import { loadHistory } from '../../hooks/useChildProfile'
import { useAuth } from '../../context/AuthContext'
import { useTherapist } from '../../context/TherapistContext'
import { supabase } from '../../lib/supabase'
import type { DbSession, DbChild, LinkRequestWithPatient } from '../../lib/types'
import { getAge, getAccuracyPercent, getDurationMinutes, getCurrentLevel } from '../../lib/derived'
import { DT } from './desk/deskTokens'
import Escritorio from './desk/Escritorio'
import Carpeta from './desk/Carpeta'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

// Supabase child → forma Patient que consume el escritorio.
function adaptPatient(sp: DbChild, sessions: DbSession[], level: { min: number; max: number } | null): MockPatient {
  const now = new Date()
  const dow = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  weekStart.setHours(0, 0, 0, 0)

  const sessionTime = (s: DbSession) => new Date(s.ended_at ?? s.started_at).getTime()
  const thisWeek = sessions.filter(s => sessionTime(s) >= weekStart.getTime())
  const sortedDesc = [...sessions].sort((a, b) => sessionTime(b) - sessionTime(a))

  const weeklyProgress = (() => {
    const result: { week: string; score: number }[] = []
    for (let w = 3; w >= 0; w--) {
      const wStart = new Date(weekStart); wStart.setDate(weekStart.getDate() - w * 7)
      const wEnd = new Date(wStart); wEnd.setDate(wStart.getDate() + 7)
      const wSessions = sessions.filter(s => { const t = sessionTime(s); return t >= wStart.getTime() && t < wEnd.getTime() })
      const total = wSessions.reduce((a, s) => a + s.total_exercises, 0)
      const correct = wSessions.reduce((a, s) => a + s.correct_count, 0)
      result.push({ week: `Sem ${4 - w}`, score: total > 0 ? Math.round((correct / total) * 100) : 0 })
    }
    return result
  })()

  const recentSessions = sortedDesc.slice(0, 5).map(s => ({
    date: formatDate(s.ended_at ?? s.started_at),
    duration: getDurationMinutes(s) ?? 15,
    exercises: s.total_exercises,
    accuracy: getAccuracyPercent(s),
  }))

  return {
    id: sp.id,
    name: sp.full_name,
    age: getAge(sp.birth_date),
    condition: sp.family_notes ?? '',
    area: 'Logopedia',
    avatar: '',
    status: thisWeek.length >= 5 ? 'completed' : thisWeek.length > 0 ? 'pending' : 'overdue',
    metrics: {
      sessionsThisWeek: thisWeek.length,
      sessionsTarget: 5,
      avgDuration: recentSessions.length > 0 ? Math.round(recentSessions.reduce((a, s) => a + s.duration, 0) / recentSessions.length) : 0,
      progressPct: 0,
    },
    weeklyProgress,
    recentSessions,
    notes: sp.clinical_notes ?? undefined,
    level,
    lastPlayedISO: sortedDesc[0] ? (sortedDesc[0].ended_at ?? sortedDesc[0].started_at) : null,
    totalSessions: sessions.length,
  }
}

export default function TherapistTab() {
  const { user, profile } = useAuth()
  const { setSelectedPatientId } = useTherapist()
  const isReal = !!(user && profile?.role === 'therapist')

  // Se recalcula al montar la pestaña: si el visitante acaba de jugar, la
  // carpeta de Pol ya trae esa partida.
  const demoPatients = useMemo(() => buildDemoCaseload(loadHistory()), [])
  const [realPatients, setRealPatients] = useState<MockPatient[]>([])
  const [linkRequests, setLinkRequests] = useState<LinkRequestWithPatient[]>([])
  const [loadingReal, setLoadingReal] = useState(isReal)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!isReal) return
    fetchRealData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReal, user?.id])

  async function fetchRealData() {
    setLoadingReal(true)
    const { data: pats } = await supabase.from('children').select('*').eq('therapist_id', user!.id)
    const { data: reqs } = await supabase
      .from('link_requests')
      .select('*, patients(child_name, child_age, diagnosis, profile_id)')
      .eq('therapist_id', user!.id)
      .eq('status', 'pending')
    setLinkRequests((reqs ?? []) as LinkRequestWithPatient[])

    const patList = (pats ?? []) as DbChild[]
    const adapted: MockPatient[] = []
    for (const p of patList) {
      const [sessionsRes, level] = await Promise.all([
        supabase.from('sessions').select('*').eq('child_id', p.id).order('started_at', { ascending: false }).limit(50),
        getCurrentLevel(p.id),
      ])
      adapted.push(adaptPatient(p, (sessionsRes.data ?? []) as DbSession[], level))
    }
    setRealPatients(adapted)
    setLoadingReal(false)
  }

  async function handleAccept(req: LinkRequestWithPatient) {
    const { data: existingChild } = await supabase.from('children').select('id').eq('id', req.patient_id).maybeSingle()
    if (!existingChild && req.patients.profile_id) {
      const { error: childErr } = await supabase.from('children').insert({
        id: req.patient_id,
        family_id: req.patients.profile_id,
        therapist_id: user!.id,
        full_name: req.patients.child_name,
        birth_date: new Date(new Date().getFullYear() - req.patients.child_age, 0, 1).toISOString().split('T')[0],
        family_notes: req.patients.diagnosis,
      })
      if (childErr) console.warn('[Dracs] children deferred insert failed:', childErr.message)
    }
    await Promise.all([
      supabase.from('link_requests').update({ status: 'accepted' }).eq('id', req.id),
      supabase.from('patients').update({ therapist_id: user!.id }).eq('id', req.patient_id),
    ])
    setLinkRequests(prev => prev.filter(r => r.id !== req.id))
    fetchRealData()
  }

  async function handleReject(req: LinkRequestWithPatient) {
    await supabase.from('link_requests').update({ status: 'rejected' }).eq('id', req.id)
    setLinkRequests(prev => prev.filter(r => r.id !== req.id))
  }

  const patients = isReal ? realPatients : demoPatients
  const openPatient = openId ? patients.find(p => p.id === openId) ?? null : null

  function openCarpeta(id: string) {
    setOpenId(id)
    if (isReal) setSelectedPatientId(id)
  }

  return (
    <div style={{ flex: 1, width: '100%', overflowY: 'auto', background: DT.cream, minHeight: 0 }}>
      {openPatient ? (
        <Carpeta
          patient={openPatient}
          supabasePatientId={isReal ? openPatient.id : undefined}
          onBack={() => setOpenId(null)}
        />
      ) : (
        <Escritorio
          patients={patients}
          onOpen={openCarpeta}
          linkRequests={isReal ? linkRequests : []}
          onAccept={handleAccept}
          onReject={handleReject}
          loading={loadingReal}
          isDemo={!isReal}
          therapistName={(profile?.full_name ?? 'Terapeuta').split(' ')[0]}
        />
      )}
    </div>
  )
}
