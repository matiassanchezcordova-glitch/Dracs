import { useEffect, useRef, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, CheckCircle2, Clock, Download, FileText, MessageSquare, Send, Target, TrendingUp } from 'lucide-react'
import { type Patient } from '../../data/patients'

interface Props {
  patient: Patient
}

// ── Initials avatar ────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#0891A0', '#0B7285', '#1D4ED8', '#7C3AED', '#BE185D', '#B45309', '#15803D', '#9D174D']

function nameColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

// ── Count-up animation ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    setVal(0)
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return val
}

// ── Chart tooltip ─────────────────────────────────────────────────────────

function ChartTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean
    payload?: { value: number }[]
    label?: string
  }
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E0F2FE',
        borderRadius: '12px',
        padding: '8px 14px',
        boxShadow: '0 4px 16px rgba(11,175,190,0.12)',
      }}
    >
      <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: '16px', color: '#0BAFBE', fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>
        {payload[0].value}%
      </p>
    </div>
  )
}

// ── Custom chart dot ──────────────────────────────────────────────────────

function CustomDot(props: unknown) {
  const p = props as { cx?: number; cy?: number }
  if (p.cx == null || p.cy == null) return null
  return <circle cx={p.cx} cy={p.cy} r={5} fill="#ffffff" stroke="#0BAFBE" strokeWidth={2.5} />
}

// ── Metric card ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  countTo,
  suffix,
  prefix,
  sub,
  highlight,
  icon,
  bgIcon,
}: {
  label: string
  countTo: number
  suffix?: string
  prefix?: string
  sub?: string
  highlight?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  bgIcon: React.ReactNode
}) {
  const animated = useCountUp(countTo)
  const valueColor =
    highlight === 'positive' ? '#22C55E' : highlight === 'negative' ? '#F87171' : '#0BAFBE'

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '16px',
        padding: '18px 20px',
        flex: 1,
        minWidth: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.5)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'metricIn 0.4s ease',
      }}
    >
      {/* Large background icon */}
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          right: '8px',
          color: '#0BAFBE',
          opacity: 0.055,
          fontSize: '60px',
          display: 'flex',
          pointerEvents: 'none',
        }}
      >
        {bgIcon}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
        <span style={{ color: '#0BAFBE', display: 'flex' }}>{icon}</span>
        <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Nunito, sans-serif' }}>
          {label}
        </p>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '32px',
          color: valueColor,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {prefix}{animated}{suffix}
      </p>

      {sub && (
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8', fontWeight: 500, fontFamily: 'Nunito, sans-serif' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ── Download button ───────────────────────────────────────────────────────

function DownloadButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={() => alert('Informe generado correctamente')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        padding: '11px 20px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #0BAFBE, #0891A0)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'Nunito, sans-serif',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 20px rgba(11,175,190,0.25)',
        filter: hovered ? 'brightness(1.1)' : 'brightness(1)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <Download size={15} color="#ffffff" />
      <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>
        Descargar informe
      </span>
    </button>
  )
}

// ── Accuracy badge ────────────────────────────────────────────────────────

function AccuracyBadge({ value }: { value: number }) {
  const color = value >= 80 ? '#22C55E' : value >= 60 ? '#D97706' : '#F87171'
  const bg    = value >= 80 ? '#F0FDF4' : value >= 60 ? '#FFFBEB' : '#FFF1F2'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '20px',
        backgroundColor: bg,
        color,
        fontSize: '12px',
        fontWeight: 800,
        fontFamily: 'Nunito, sans-serif',
        flexShrink: 0,
      }}
    >
      {value}%
    </span>
  )
}

// ── Session row ───────────────────────────────────────────────────────────

function SessionRow({ date, duration, exercises, accuracy, index }: {
  date: string
  duration: number
  exercises: number
  accuracy: number
  index: number
}) {
  const barColor = accuracy >= 80 ? '#22C55E' : accuracy >= 60 ? '#FFD93D' : '#F87171'
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '11px 16px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.6)',
        overflow: 'hidden',
        animation: `metricIn 0.35s ease ${index * 60}ms both`,
      }}
    >
      {/* mini progress bar background */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${accuracy}%`,
          backgroundColor: barColor,
          opacity: 0.07,
          borderRadius: '12px',
          transition: 'width 0.6s ease',
        }}
      />

      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
          {date}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
          {duration} min · {exercises} ejercicios
        </p>
      </div>

      <AccuracyBadge value={accuracy} />
    </div>
  )
}

// ── Weekly report helpers ─────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function getWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

interface WeekData2 { sessions: number; minutes: number; exercises: number; accuracy: number }

function getPatientWeeklyData(p: Patient): WeekData2 {
  if (p.id === 'pablo') {
    try {
      const raw = localStorage.getItem('dracs_session_history')
      if (raw) {
        const history = JSON.parse(raw) as { date: string; total: number; correct: number }[]
        const today  = new Date()
        const dow    = today.getDay()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
        monday.setHours(0, 0, 0, 0)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)
        const week = history.filter(s => {
          const d = new Date(s.date + 'T00:00:00')
          return d >= monday && d <= sunday
        })
        if (week.length > 0) {
          const total   = week.reduce((a, s) => a + s.total, 0)
          const correct = week.reduce((a, s) => a + s.correct, 0)
          return {
            sessions: week.length,
            minutes: week.length * 15,
            exercises: total,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
          }
        }
      }
    } catch { /* fall through */ }
  }
  const accuracy = p.recentSessions.length > 0
    ? Math.round(p.recentSessions.reduce((a, s) => a + s.accuracy, 0) / p.recentSessions.length)
    : 0
  return {
    sessions: p.metrics.sessionsThisWeek,
    minutes: p.metrics.sessionsThisWeek * p.metrics.avgDuration,
    exercises: p.metrics.sessionsThisWeek * 7,
    accuracy,
  }
}

function buildAutoMessage(name: string, accuracy: number, sessions: number): string {
  let msg = ''
  if (accuracy >= 80) {
    msg = `¡Semana excelente! ${name} está mostrando un progreso muy sólido. Sus ejercicios de vocabulario van muy bien. Se recomienda mantener la misma rutina la próxima semana.`
  } else if (accuracy >= 60) {
    msg = `Buena semana para ${name}. Progresando de forma constante. Algunos ejercicios presentan mayor dificultad, lo cual es completamente normal. La consistencia diaria es lo más importante.`
  } else {
    msg = `Esta semana fue más desafiante para ${name}. Se recomienda practicar en momentos de mayor descanso y con menos distracciones para optimizar la sesión.`
  }
  if (sessions < 3) {
    msg += ` También se observan pocos días de práctica — intentar mantener la práctica diaria, aunque sean 10 minutos, hace una gran diferencia en el progreso.`
  }
  return msg
}

// ── Inline metric mini-card ───────────────────────────────────────────────

function MiniMetric({ icon, value, label, color = '#0BAFBE' }: {
  icon: React.ReactNode; value: string; label: string; color?: string
}) {
  return (
    <div
      style={{
        background: '#F8FAFC',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <span style={{ color: '#0BAFBE' }}>{icon}</span>
      <span style={{ fontSize: '24px', fontWeight: 900, color, fontFamily: 'Nunito, sans-serif', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
        {label}
      </span>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────

function GreenToast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#22C55E',
        color: '#ffffff',
        padding: '14px 24px',
        borderRadius: '999px',
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: 'Nunito, sans-serif',
        zIndex: 100,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 24px rgba(34,197,94,0.35)',
        animation: 'metricIn 0.25s ease',
      }}
    >
      {message}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function PatientDetail({ patient: p }: Props) {
  const [comment, setComment]   = useState('')
  const [published, setPublished] = useState<{ text: string; date: string } | null>(null)
  const [toast, setToast]       = useState<string | null>(null)
  const [focusedTA, setFocusedTA] = useState(false)

  const weekData   = getPatientWeeklyData(p)
  const autoMsg    = buildAutoMessage(p.name.split(' ')[0], weekData.accuracy, weekData.sessions)
  const accuracyColor = weekData.accuracy >= 75 ? '#22C55E' : weekData.accuracy >= 50 ? '#D97706' : '#F87171'

  function handlePublish() {
    if (!comment.trim()) return
    const slug    = slugify(p.name)
    const weekKey = getWeekKey()
    const key     = `dracs_comment_${slug}_${weekKey}`
    const now     = new Date()
    const months  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
    const date    = `${now.getDate()} ${months[now.getMonth()]}`
    localStorage.setItem(key, JSON.stringify({ texto: comment.trim(), fecha: date, terapeuta: 'Dra. Martínez' }))
    setPublished({ text: comment.trim(), date })
    setComment('')
    setToast('✓ Comentario publicado. La familia ya puede verlo.')
    setTimeout(() => setToast(null), 3000)
  }

  const pct = p.metrics.progressPct
  const progressHighlight: 'positive' | 'negative' | 'neutral' =
    pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral'

  const avatarBg   = nameColor(p.name)
  const avatarText = initials(p.name)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px 24px 24px',
        minHeight: '100%',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      {toast && <GreenToast message={toast} />}
      {/* ── Patient header card ─────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Initials avatar */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            letterSpacing: '0.02em',
          }}
        >
          {avatarText}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              margin: '0 0 6px',
              fontSize: '24px',
              color: '#0F172A',
              fontWeight: 800,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {p.name}
          </h2>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '12px',
              color: '#64748B',
              fontWeight: 500,
            }}
          >
            {p.age} años
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: '#0BAFBE',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {p.condition}
            </span>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: '#E0F2FE',
                color: '#0369A1',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {p.area}
            </span>
          </div>
        </div>
      </div>

      {/* ── Metrics row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <MetricCard
          label="Sesiones esta semana"
          countTo={p.metrics.sessionsThisWeek}
          suffix={`/${p.metrics.sessionsTarget}`}
          sub={p.metrics.sessionsThisWeek >= p.metrics.sessionsTarget ? 'Objetivo cumplido' : 'En progreso'}
          highlight={p.metrics.sessionsThisWeek >= p.metrics.sessionsTarget ? 'positive' : 'neutral'}
          icon={<Calendar size={13} />}
          bgIcon={<Calendar size={60} />}
        />
        <MetricCard
          label="Duración media"
          countTo={p.metrics.avgDuration}
          suffix=" min"
          sub="por sesión"
          highlight="neutral"
          icon={<Clock size={13} />}
          bgIcon={<Clock size={60} />}
        />
        <MetricCard
          label="Progreso mensual"
          countTo={Math.abs(p.metrics.progressPct)}
          prefix={p.metrics.progressPct >= 0 ? '+' : '-'}
          suffix="%"
          sub="vs. 4 semanas atrás"
          highlight={progressHighlight}
          icon={<TrendingUp size={13} />}
          bgIcon={<TrendingUp size={60} />}
        />
      </div>

      {/* ── Area chart ──────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '20px 20px 10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#0F172A', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
          Progreso semanal — % aciertos
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={p.weeklyProgress} margin={{ top: 6, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0BAFBE" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0BAFBE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Nunito, sans-serif' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Nunito, sans-serif' }}
              tickFormatter={(v: number) => `${v}%`}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#D0F1F4', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#0BAFBE"
              strokeWidth={2.5}
              fill="url(#scoreGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#0BAFBE', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent sessions ─────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '18px 18px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#0F172A', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
          Últimas sesiones
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {p.recentSessions.map((s, i) => (
            <SessionRow
              key={i}
              index={i}
              date={s.date}
              duration={s.duration}
              exercises={s.exercises}
              accuracy={s.accuracy}
            />
          ))}
        </div>
      </div>

      {/* ── Weekly report ───────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={17} color="#0BAFBE" />
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
            Informe semanal
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <MiniMetric icon={<Calendar size={16} />} value={String(weekData.sessions)}   label="Sesiones completadas" />
          <MiniMetric icon={<Clock size={16} />}    value={`~${weekData.minutes} min`}  label="Minutos practicados" />
          <MiniMetric icon={<Target size={16} />}   value={String(weekData.exercises)}  label="Ejercicios completados" />
          <MiniMetric icon={<TrendingUp size={16} />} value={`${weekData.accuracy}%`}   label="Aciertos medio" color={accuracyColor} />
        </div>

        <div
          style={{
            background: '#F8FAFC',
            borderRadius: '10px',
            padding: '14px 16px',
            borderLeft: '3px solid #0BAFBE',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
            <MessageSquare size={14} color="#0BAFBE" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
              Resumen automático
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#334155', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
            {autoMsg}
          </p>
        </div>
      </div>

      {/* ── Therapist comment box ────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <MessageSquare size={17} color="#0BAFBE" />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
              Comentario para la familia
            </p>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', fontWeight: 500, fontFamily: 'Nunito, sans-serif' }}>
            Este mensaje será visible para la familia en su informe semanal
          </p>
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          onFocus={() => setFocusedTA(true)}
          onBlur={() => setFocusedTA(false)}
          placeholder="Escribe aquí tu observación clínica de la semana..."
          rows={4}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px 16px',
            borderRadius: '12px',
            border: `1.5px solid ${focusedTA ? '#0BAFBE' : 'rgba(11,175,190,0.3)'}`,
            background: 'rgba(255,255,255,0.92)',
            color: '#0F172A',
            fontSize: '15px',
            fontFamily: 'Nunito, sans-serif',
            resize: 'vertical',
            maxHeight: '200px',
            outline: 'none',
            transition: 'border-color 0.18s ease',
            lineHeight: 1.6,
          }}
        />

        <button
          onClick={handlePublish}
          disabled={!comment.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #0BAFBE, #0891A0)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Nunito, sans-serif',
            cursor: comment.trim() ? 'pointer' : 'default',
            opacity: comment.trim() ? 1 : 0.5,
            transition: 'opacity 0.18s ease',
            alignSelf: 'flex-start',
          }}
        >
          <Send size={15} />
          Publicar comentario
        </button>

        {published && (
          <div
            style={{
              borderLeft: '3px solid #0BAFBE',
              background: '#E0F7FA',
              borderRadius: '10px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
              <CheckCircle2 size={15} color="#22C55E" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0BAFBE', fontFamily: 'Nunito, sans-serif' }}>
                Publicado hoy · Dra. Martínez
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#0F172A', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
              {published.text}
            </p>
          </div>
        )}
      </div>

      {/* ── Notes ───────────────────────────────────────────────── */}
      {p.notes && (
        <div
          style={{
            background: 'rgba(255,251,235,0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid #FEF3C7',
            padding: '12px 16px',
          }}
        >
          <p style={{ margin: 0, fontSize: '12px', color: '#92400E', fontWeight: 500, fontFamily: 'Nunito, sans-serif' }}>
            {p.notes}
          </p>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', paddingBottom: '4px' }}>
        <button
          style={{
            flex: 1,
            padding: '11px 20px',
            borderRadius: '12px',
            border: '1.5px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.85)',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>Ajustar objetivos</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#94A3B8',
              backgroundColor: '#F1F5F9',
              borderRadius: '6px',
              padding: '2px 7px',
              letterSpacing: '0.04em',
            }}
          >
            PRÓXIMAMENTE
          </span>
        </button>
        <DownloadButton />
      </div>
    </div>
  )
}
