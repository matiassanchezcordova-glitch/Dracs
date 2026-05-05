import { useEffect, useMemo, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { getPatients, type Patient as MockPatient } from '../../data/patients'
import { useAuth } from '../../context/AuthContext'
import { useTherapist } from '../../context/TherapistContext'
import { supabase } from '../../lib/supabase'
import type { Patient as SupaPatient, DbSession, LinkRequestWithPatient } from '../../lib/types'
import PatientList from './PatientList'
import PatientDetail from './PatientDetail'

// ── Supabase patient → mock Patient adapter ──────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

function adaptPatient(sp: SupaPatient, sessions: DbSession[]): MockPatient {
  const now = new Date()
  const dow = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  weekStart.setHours(0, 0, 0, 0)

  const thisWeek = sessions.filter(s => new Date(s.completed_at) >= weekStart)
  const sortedDesc = [...sessions].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())

  // Weekly progress: group last 4 weeks
  const weeklyProgress = (() => {
    const result: { week: string; score: number }[] = []
    for (let w = 3; w >= 0; w--) {
      const wStart = new Date(weekStart)
      wStart.setDate(weekStart.getDate() - w * 7)
      const wEnd = new Date(wStart)
      wEnd.setDate(wStart.getDate() + 7)
      const wSessions = sessions.filter(s => {
        const d = new Date(s.completed_at)
        return d >= wStart && d < wEnd
      })
      const total = wSessions.reduce((a, s) => a + s.total_exercises, 0)
      const correct = wSessions.reduce((a, s) => a + s.correct_answers, 0)
      const score = total > 0 ? Math.round((correct / total) * 100) : 0
      result.push({ week: `Sem ${4 - w}`, score })
    }
    return result
  })()

  const recentSessions = sortedDesc.slice(0, 5).map(s => ({
    date: formatDate(s.completed_at),
    duration: s.duration_minutes ?? 15,
    exercises: s.total_exercises,
    accuracy: Math.round(s.accuracy_percent ?? 0),
  }))

  const thisWeekAcc = thisWeek.length > 0
    ? Math.round(thisWeek.reduce((a, s) => a + (s.accuracy_percent ?? 0), 0) / thisWeek.length)
    : 0

  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(weekStart.getDate() - 7)
  const prevWeek = sessions.filter(s => {
    const d = new Date(s.completed_at)
    return d >= prevWeekStart && d < weekStart
  })
  const prevAcc = prevWeek.length > 0
    ? Math.round(prevWeek.reduce((a, s) => a + (s.accuracy_percent ?? 0), 0) / prevWeek.length)
    : 0

  return {
    id: sp.id,
    name: sp.child_name,
    age: sp.child_age,
    condition: sp.diagnosis,
    area: 'Logopedia',
    avatar: '🧒',
    status: thisWeek.length >= 5 ? 'completed' : thisWeek.length > 0 ? 'pending' : 'overdue',
    metrics: {
      sessionsThisWeek: thisWeek.length,
      sessionsTarget: 5,
      avgDuration: recentSessions.length > 0
        ? Math.round(recentSessions.reduce((a, s) => a + s.duration, 0) / recentSessions.length)
        : 0,
      progressPct: thisWeekAcc - prevAcc,
    },
    weeklyProgress,
    recentSessions,
    notes: sp.notes ?? undefined,
  }
}

// ── Link request notification banner ─────────────────────────────────────

function LinkRequestBanner({
  request,
  onAccept,
  onReject,
}: {
  request: LinkRequestWithPatient
  onAccept: (req: LinkRequestWithPatient) => Promise<void>
  onReject: (req: LinkRequestWithPatient) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const p = request.patients

  async function handle(fn: (req: LinkRequestWithPatient) => Promise<void>) {
    setBusy(true)
    await fn(request)
    setBusy(false)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: '#FFF8E8',
      borderLeft: '3px solid #FFD93D',
      borderRadius: '0 10px 10px 0',
      marginBottom: '8px',
    }}>
      <Bell size={16} color="#D97706" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif' }}>
          {p.child_name} ({p.child_age} años)
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280', fontFamily: 'Nunito, sans-serif' }}>
          quiere vincularse contigo · {p.diagnosis}
        </p>
      </div>
      <button
        onClick={() => handle(onAccept)}
        disabled={busy}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
          borderRadius: '8px', border: 'none', background: '#0BAFBE', color: '#ffffff',
          fontSize: '12px', fontWeight: 700, fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        <Check size={12} /> Aceptar
      </button>
      <button
        onClick={() => handle(onReject)}
        disabled={busy}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
          borderRadius: '8px', border: '1px solid #E5E7EB', background: '#ffffff', color: '#6B7280',
          fontSize: '12px', fontWeight: 700, fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        <X size={12} /> Rechazar
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function TherapistTab() {
  const { user, profile } = useAuth()
  const { setSelectedPatientId } = useTherapist()
  const isReal = !!(user && profile?.role === 'therapist')

  // Mock data (localStorage mode)
  const mockPatients = useMemo(() => getPatients(), [])
  const [selectedMockId, setSelectedMockId] = useState(mockPatients[0]?.id ?? '')

  // Supabase data
  const [realPatients, setRealPatients] = useState<MockPatient[]>([])
  const [linkRequests, setLinkRequests] = useState<LinkRequestWithPatient[]>([])
  const [selectedRealId, setSelectedRealId] = useState<string>('')
  const [loadingReal, setLoadingReal] = useState(false)

  // Mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isReal) return
    fetchRealData()
  }, [isReal, user?.id])

  async function fetchRealData() {
    setLoadingReal(true)

    // Fetch patients linked to this therapist
    const { data: pats } = await supabase
      .from('patients')
      .select('*')
      .eq('therapist_id', user!.id)

    // Fetch pending link requests
    const { data: reqs } = await supabase
      .from('link_requests')
      .select('*, patients(child_name, child_age, diagnosis)')
      .eq('therapist_id', user!.id)
      .eq('status', 'pending')

    setLinkRequests((reqs ?? []) as LinkRequestWithPatient[])

    // For each patient, fetch their sessions
    const patList = (pats ?? []) as import('../../lib/types').Patient[]
    const adapted: MockPatient[] = []

    for (const p of patList) {
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', p.id)
        .order('completed_at', { ascending: false })
        .limit(50)
      adapted.push(adaptPatient(p, (sessions ?? []) as DbSession[]))
    }

    setRealPatients(adapted)
    if (adapted.length > 0 && !selectedRealId) {
      setSelectedRealId(adapted[0].id)
      setSelectedPatientId(adapted[0].id)
    }
    setLoadingReal(false)
  }

  async function handleAccept(req: LinkRequestWithPatient) {
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

  // ── Render: mock mode ──────────────────────────────────────────────────
  if (!isReal) {
    const selectedMock = mockPatients.find(p => p.id === selectedMockId) ?? mockPatients[0]
    return (
      <div style={{ fontFamily: 'Nunito, sans-serif', flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile patient selector header */}
        <div
          className="dracs-therapist-mobile-header"
          style={{
            padding: '12px 16px', background: '#ffffff', borderBottom: '1px solid #F1F5F9',
            alignItems: 'center', gap: '8px', flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FAFA',
              border: '1px solid #E0F2FE', borderRadius: '10px', padding: '8px 14px',
              fontSize: '14px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif',
              cursor: 'pointer', width: '100%', justifyContent: 'space-between',
            }}
          >
            <span>Paciente: {selectedMock?.name ?? '—'}</span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{mobileSidebarOpen ? '▲' : '▼'}</span>
          </button>
        </div>
        {/* Row: sidebar + detail */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div className={`dracs-therapist-sidebar${mobileSidebarOpen ? ' open' : ''}`} style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #F1F5F9', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#ffffff', paddingTop: '24px' }}>
            <PatientList patients={mockPatients} selectedId={selectedMockId} onSelect={id => { setSelectedMockId(id); setMobileSidebarOpen(false) }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedMock && <PatientDetail patient={selectedMock} />}
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Supabase mode ──────────────────────────────────────────────
  const selectedReal = realPatients.find(p => p.id === selectedRealId) ?? realPatients[0]

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Link request banners */}
      {linkRequests.length > 0 && (
        <div style={{ padding: '16px 16px 0', background: '#ffffff', borderBottom: '1px solid #F1F5F9' }}>
          {linkRequests.map(req => (
            <LinkRequestBanner key={req.id} request={req} onAccept={handleAccept} onReject={handleReject} />
          ))}
        </div>
      )}

      {/* Mobile patient selector header */}
      <div
        className="dracs-therapist-mobile-header"
        style={{
          padding: '12px 16px', background: '#ffffff', borderBottom: '1px solid #F1F5F9',
          alignItems: 'center', gap: '8px', flexShrink: 0,
        }}
      >
        <button
          onClick={() => setMobileSidebarOpen(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FAFA',
            border: '1px solid #E0F2FE', borderRadius: '10px', padding: '8px 14px',
            fontSize: '14px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif',
            cursor: 'pointer', width: '100%', justifyContent: 'space-between',
          }}
        >
          <span>Paciente: {selectedReal?.name ?? '—'}</span>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>{mobileSidebarOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Patient list */}
          <div className={`dracs-therapist-sidebar${mobileSidebarOpen ? ' open' : ''}`} style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #F1F5F9', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#ffffff', paddingTop: '24px' }}>
            {loadingReal ? (
              <p style={{ padding: '24px 16px', fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
                Cargando pacientes...
              </p>
            ) : realPatients.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif' }}>
                  Sin pacientes aún
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', lineHeight: 1.5 }}>
                  Las familias pueden buscarte por nombre o centro para vincularse.
                </p>
              </div>
            ) : (
              <PatientList patients={realPatients} selectedId={selectedRealId} onSelect={id => { setSelectedRealId(id); setSelectedPatientId(id); setMobileSidebarOpen(false) }} />
            )}
          </div>

          {/* Patient detail */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {selectedReal ? (
              <PatientDetail patient={selectedReal} supabasePatientId={selectedReal.id} />
            ) : !loadingReal && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: '14px', fontFamily: 'Nunito, sans-serif' }}>
                Selecciona un paciente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
