import { useMemo, useState } from 'react'
import {
  ArrowLeft, Calendar, CheckCircle2, Clock, FileText,
  MessageCircle, Share2, Stethoscope, Target, TrendingDown, TrendingUp,
} from 'lucide-react'

interface Props {
  onBack: () => void
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

interface Session {
  date: string
  total: number
  correct: number
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function getWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function getChildName(): string {
  try {
    const raw = localStorage.getItem('dracs_child_profile')
    if (!raw) return 'el niño'
    const p = JSON.parse(raw) as { name?: string }
    return p.name ?? 'el niño'
  } catch { return 'el niño' }
}

function getHistory(): Session[] {
  try {
    const raw = localStorage.getItem('dracs_session_history')
    return raw ? (JSON.parse(raw) as Session[]) : []
  } catch { return [] }
}

function getMondayOf(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function dateStr(d: Date): string {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function inRange(session: Session, from: Date, to: Date): boolean {
  const d = new Date(session.date + 'T00:00:00')
  return d >= from && d <= to
}

function calcAccuracy(sessions: Session[]): number {
  const total   = sessions.reduce((a, s) => a + s.total, 0)
  const correct = sessions.reduce((a, s) => a + s.correct, 0)
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon,
  value,
  label,
  valueColor = '#0BAFBE',
}: {
  icon: React.ReactNode
  value: string
  label: string
  valueColor?: string
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <span style={{ color: '#0BAFBE' }}>{icon}</span>
      <span style={{ fontSize: '28px', fontWeight: 900, color: valueColor, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', fontFamily: 'Nunito, sans-serif', lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'transparent',
        border: 'none',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'Nunito, sans-serif',
        padding: '4px 0',
        opacity: hovered ? 0.75 : 1,
        transition: 'opacity 0.15s ease',
        alignSelf: 'flex-start',
        marginBottom: '4px',
      }}
    >
      <ArrowLeft size={18} color="#ffffff" />
      Volver
    </button>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#0F172A',
        color: '#ffffff',
        padding: '14px 24px',
        borderRadius: '999px',
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: 'Nunito, sans-serif',
        zIndex: 100,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        maxWidth: '320px',
        textAlign: 'center',
        animation: 'wordSlideDown 0.25s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface TherapistComment { texto: string; fecha: string; terapeuta: string }

function getTherapistComment(childName: string): TherapistComment | null {
  try {
    const slug = slugify(childName)
    const key = `dracs_comment_${slug}_${getWeekKey()}`
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as TherapistComment) : null
  } catch { return null }
}

export default function WeeklyReport({ onBack }: Props) {
  const childName = useMemo(getChildName, [])
  const history   = useMemo(getHistory, [])

  const today      = useMemo(() => new Date(), [])
  const weekStart  = useMemo(() => getMondayOf(today), [today])
  const weekEnd    = useMemo(() => addDays(weekStart, 6), [weekStart])
  const prevStart  = useMemo(() => addDays(weekStart, -7), [weekStart])
  const prevEnd    = useMemo(() => addDays(weekStart, -1), [weekStart])

  const thisWeek = useMemo(
    () => history.filter(s => inRange(s, weekStart, weekEnd)),
    [history, weekStart, weekEnd],
  )
  const lastWeek = useMemo(
    () => history.filter(s => inRange(s, prevStart, prevEnd)),
    [history, prevStart, prevEnd],
  )

  const sessions      = thisWeek.length
  const minutes       = sessions * 15
  const exercises     = thisWeek.reduce((a, s) => a + s.total, 0)
  const accuracy      = calcAccuracy(thisWeek)
  const lastAccuracy  = calcAccuracy(lastWeek)
  const accuracyDiff  = accuracy - lastAccuracy
  const accuracyColor = accuracy >= 75 ? '#22C55E' : accuracy >= 50 ? '#D97706' : '#F87171'

  const dataNote = sessions === 0
    ? 'No hay datos de esta semana aún'
    : sessions < 5
      ? `Basado en ${sessions} día${sessions > 1 ? 's' : ''} de práctica`
      : null

  function buildMessage(): string {
    let msg = ''
    if (sessions === 0) {
      return `Esta semana aún no hemos practicado. ¡No pasa nada! Intenta hacer un ejercicio hoy mismo. Incluso 10 minutos al día marcan una gran diferencia.`
    }
    if (accuracy >= 80) {
      msg = `¡Semana excelente! ${childName} está mostrando un progreso muy sólido. Sus ejercicios de vocabulario van muy bien. Te recomendamos mantener la misma rutina la próxima semana.`
    } else if (accuracy >= 60) {
      msg = `Buena semana para ${childName}. Está progresando de forma constante. Algunos ejercicios le cuestan más que otros, lo cual es completamente normal. La consistencia diaria es lo más importante.`
    } else {
      msg = `Esta semana fue más desafiante para ${childName}. No te preocupes, es parte del proceso de aprendizaje. Te recomendamos practicar en momentos del día donde esté más descansado y con menos distracciones.`
    }
    if (sessions < 3) {
      msg += ` También notamos que hubo pocos días de práctica — intentar practicar todos los días, aunque sean 10 minutos, hace una gran diferencia.`
    }
    return msg
  }

  const message = buildMessage()
  const therapistComment = useMemo(() => getTherapistComment(childName), [childName])

  const [toast, setToast] = useState<string | null>(null)

  function handleShare() {
    const text =
      `Informe DRACS · ${childName}\n` +
      `Semana del ${dateStr(weekStart)} al ${dateStr(weekEnd)}\n` +
      `Sesiones: ${sessions} · Aciertos: ${accuracy}%\n\n` +
      message

    if (navigator.share) {
      navigator.share({ title: `Informe DRACS · ${childName}`, text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(
        () => {
          setToast('Informe copiado al portapapeles')
          setTimeout(() => setToast(null), 2500)
        },
        () => {
          setToast('No se pudo copiar el informe')
          setTimeout(() => setToast(null), 2500)
        },
      )
    }
  }

  return (
    <div style={{ width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      {toast && <Toast message={toast} />}

      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          paddingBottom: '48px',
        }}
      >
        {/* ── Back button ─────────────────────────────────────────────── */}
        <BackButton onClick={onBack} />

        {/* ── Header card ─────────────────────────────────────────────── */}
        <div
          style={{
            background: 'rgba(0,0,0,0.22)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <FileText size={22} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', fontFamily: 'Nunito, sans-serif' }}>
              Informe semanal
            </span>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'Nunito, sans-serif' }}>
            Semana del {dateStr(weekStart)} al {dateStr(weekEnd)}
          </p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#FFD93D', fontFamily: 'Nunito, sans-serif' }}>
            {childName}
          </p>
          {dataNote && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', fontFamily: 'Nunito, sans-serif' }}>
              {dataNote}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── 4 metrics 2×2 ──────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <MetricCard icon={<Calendar size={20} />} value={String(sessions)}  label="Sesiones esta semana" />
            <MetricCard icon={<Clock size={20} />}    value={`~${minutes}`}      label="Minutos practicados" />
            <MetricCard icon={<CheckCircle2 size={20} />} value={String(exercises)} label="Ejercicios completados" />
            <MetricCard icon={<Target size={20} />}   value={`${accuracy}%`}    label="Aciertos medio" valueColor={accuracyColor} />
          </div>

          {/* ── Progress bar ────────────────────────────────────────── */}
          <div
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <p style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
              ¿Cómo fue la semana?
            </p>

            <div
              style={{
                height: '28px',
                backgroundColor: '#D0F1F4',
                borderRadius: '99px',
                overflow: 'hidden',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${accuracy}%`,
                  background: 'linear-gradient(90deg, #0BAFBE, #FFD93D)',
                  borderRadius: '99px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '10px',
                  transition: 'width 0.8s ease',
                }}
              >
                {accuracy > 15 && (
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#ffffff', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' }}>
                    {accuracy}%
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {accuracyDiff > 0 ? (
                <TrendingUp size={16} color="#22C55E" />
              ) : accuracyDiff < 0 ? (
                <TrendingDown size={16} color="#F87171" />
              ) : (
                <span style={{ width: 16 }} />
              )}
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', fontFamily: 'Nunito, sans-serif' }}>
                Esta semana: {accuracy}% · Semana anterior: {lastAccuracy}%
                {accuracyDiff !== 0 && (
                  <span style={{ color: accuracyDiff > 0 ? '#22C55E' : '#F87171', fontWeight: 800, marginLeft: '6px' }}>
                    ({accuracyDiff > 0 ? '+' : ''}{accuracyDiff}%)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* ── Message for family ──────────────────────────────────── */}
          <div
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderLeft: '4px solid #0BAFBE',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <MessageCircle size={20} color="#0BAFBE" />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
                Resumen de la semana
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: '#334155',
                fontFamily: 'Nunito, sans-serif',
                lineHeight: 1.7,
              }}
            >
              {message}
            </p>
          </div>

          {/* ── Therapist comment ───────────────────────────────────── */}
          {therapistComment && (
            <div
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderLeft: '4px solid #FFD93D',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Stethoscope size={20} color="#D97706" />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
                  Nota del terapeuta
                </span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#334155', fontFamily: 'Nunito, sans-serif', lineHeight: 1.7 }}>
                {therapistComment.texto}
              </p>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
                {therapistComment.terapeuta} · {therapistComment.fecha}
              </span>
            </div>
          )}

          {/* ── Share button ────────────────────────────────────────── */}
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '16px',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #0BAFBE, #0891A0)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              boxShadow: '0 4px 20px rgba(11,175,190,0.35)',
            }}
          >
            <Share2 size={20} />
            Compartir con el terapeuta
          </button>

        </div>
      </div>
    </div>
  )
}
