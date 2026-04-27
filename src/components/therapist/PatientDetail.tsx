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
import { Send } from 'lucide-react'
import { type Patient } from '../../data/patients'

interface Props {
  patient: Patient
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

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

function ChartTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean
    payload?: { value: number }[]
    label?: string
  }
  if (!active || !payload?.length) return null
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #E0F2FE',
      borderRadius: '10px',
      padding: '8px 14px',
      boxShadow: '0 4px 16px rgba(11,175,190,0.12)',
    }}>
      <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: '16px', color: '#0BAFBE', fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>
        {payload[0].value}%
      </p>
    </div>
  )
}

function CustomDot(props: unknown) {
  const p = props as { cx?: number; cy?: number }
  if (p.cx == null || p.cy == null) return null
  return <circle cx={p.cx} cy={p.cy} r={4} fill="#ffffff" stroke="#0BAFBE" strokeWidth={2} />
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

interface WeekData2 { sessions: number; minutes: number; exercises: number; accuracy: number }

function getPatientWeeklyData(p: Patient): WeekData2 {
  if (p.id === 'pablo') {
    try {
      const raw = localStorage.getItem('dracs_session_history')
      if (raw) {
        const history = JSON.parse(raw) as { date: string; total: number; correct: number }[]
        const today = new Date()
        const dow = today.getDay()
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
          const total = week.reduce((a, s) => a + s.total, 0)
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
    msg = `Semana excelente. ${name} está mostrando un progreso muy sólido. Sus ejercicios de vocabulario van muy bien. Se recomienda mantener la misma rutina la próxima semana.`
  } else if (accuracy >= 60) {
    msg = `Buena semana para ${name}. Progresando de forma constante. Algunos ejercicios presentan mayor dificultad, lo cual es completamente normal. La consistencia diaria es lo más importante.`
  } else {
    msg = `Esta semana fue más desafiante para ${name}. Se recomienda practicar en momentos de mayor descanso y con menos distracciones para optimizar la sesión.`
  }
  if (sessions < 3) {
    msg += ` También se observan pocos días de práctica — mantener la práctica diaria, aunque sean 10 minutos, hace una gran diferencia en el progreso.`
  }
  return msg
}

function GreenToast({ message }: { message: string }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#059669',
      color: '#ffffff',
      padding: '14px 24px',
      borderRadius: '999px',
      fontSize: '14px',
      fontWeight: 700,
      fontFamily: 'Nunito, sans-serif',
      zIndex: 100,
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(5,150,105,0.35)',
      animation: 'metricIn 0.25s ease',
    }}>
      {message}
    </div>
  )
}

const CARD: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#94A3B8',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  fontFamily: 'Nunito, sans-serif',
  margin: '0 0 16px',
}

export default function PatientDetail({ patient: p }: Props) {
  const [comment, setComment] = useState('')
  const [published, setPublished] = useState<{ text: string; date: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [focusedTA, setFocusedTA] = useState(false)

  const weekData = getPatientWeeklyData(p)
  const autoMsg = buildAutoMessage(p.name.split(' ')[0], weekData.accuracy, weekData.sessions)
  const accuracyColor = weekData.accuracy >= 75 ? '#059669' : weekData.accuracy >= 50 ? '#D97706' : '#DC2626'

  const kpi1 = useCountUp(p.metrics.sessionsThisWeek)
  const kpi2 = useCountUp(p.metrics.avgDuration)
  const kpi3 = useCountUp(Math.abs(p.metrics.progressPct))

  function handlePublish() {
    if (!comment.trim()) return
    const slug = slugify(p.name)
    const weekKey = getWeekKey()
    const key = `dracs_comment_${slug}_${weekKey}`
    const now = new Date()
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
    const date = `${now.getDate()} ${months[now.getMonth()]}`
    localStorage.setItem(key, JSON.stringify({ texto: comment.trim(), fecha: date, terapeuta: 'Dra. Martínez' }))
    setPublished({ text: comment.trim(), date })
    setComment('')
    setToast('Comentario publicado. La familia ya puede verlo.')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px 24px 32px',
      maxWidth: '760px',
      margin: '0 auto',
      width: '100%',
      fontFamily: 'Nunito, sans-serif',
      boxSizing: 'border-box',
    }}>
      {toast && <GreenToast message={toast} />}

      {/* ── Patient header card ─────────────────────────────────── */}
      <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Left: avatar + name + tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#0BAFBE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}>
            {initials(p.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              margin: '0 0 8px',
              fontSize: '22px',
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: 'Nunito, sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {p.name}
            </h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: '#F0F9FF',
                color: '#0BAFBE',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Nunito, sans-serif',
              }}>{p.condition}</span>
              <span style={{
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: '#F0F9FF',
                color: '#0BAFBE',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Nunito, sans-serif',
              }}>{p.area}</span>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{ width: '1px', height: '48px', backgroundColor: 'rgba(0,0,0,0.08)', flexShrink: 0 }} />

        {/* Right: 3 KPIs in a row */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0BAFBE', lineHeight: 1, fontFamily: 'Nunito, sans-serif' }}>
              {kpi1}<span style={{ fontSize: '16px', fontWeight: 600 }}>/{p.metrics.sessionsTarget}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '5px', fontFamily: 'Nunito, sans-serif' }}>
              sesiones
            </div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(0,0,0,0.08)', alignSelf: 'stretch' }} />
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0BAFBE', lineHeight: 1, fontFamily: 'Nunito, sans-serif' }}>
              {kpi2}<span style={{ fontSize: '14px', fontWeight: 500 }}> min</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '5px', fontFamily: 'Nunito, sans-serif' }}>
              duración media
            </div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(0,0,0,0.08)', alignSelf: 'stretch' }} />
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: p.metrics.progressPct >= 0 ? '#059669' : '#DC2626',
              lineHeight: 1,
              fontFamily: 'Nunito, sans-serif',
            }}>
              {p.metrics.progressPct >= 0 ? '+' : '-'}{kpi3}%
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '5px', fontFamily: 'Nunito, sans-serif' }}>
              progreso mensual
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart card ─────────────────────────────────────────── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Evolución semanal</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={p.weeklyProgress} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0BAFBE" stopOpacity={0.12} />
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
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              allowDataOverflow={true}
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
              strokeWidth={2}
              fill="url(#scoreGradNew)"
              dot={<CustomDot />}
              activeDot={{ r: 5, fill: '#0BAFBE', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent sessions table ───────────────────────────────── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Últimas sesiones</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Fecha', 'Duración', 'Ejercicios', 'Aciertos'].map((col, i) => (
                <th key={col} style={{
                  textAlign: i === 0 ? 'left' : 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'Nunito, sans-serif',
                  padding: '0 8px 12px',
                  borderBottom: '1px solid #F1F5F9',
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.recentSessions.map((s, i) => {
              const acColor = s.accuracy >= 80 ? '#059669' : s.accuracy >= 60 ? '#D97706' : '#DC2626'
              return (
                <tr key={i} style={{ backgroundColor: i % 2 === 1 ? '#F8FAFC' : 'transparent' }}>
                  <td style={{ padding: '11px 8px', fontSize: '13px', fontWeight: 600, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
                    {s.date}
                  </td>
                  <td style={{ padding: '11px 8px', fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
                    {s.duration} min
                  </td>
                  <td style={{ padding: '11px 8px', fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
                    {s.exercises}
                  </td>
                  <td style={{ padding: '11px 8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: acColor, fontFamily: 'Nunito, sans-serif' }}>
                      {s.accuracy}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Informe + comentario ────────────────────────────────── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Informe y comentario</p>

        {/* 4 KPIs 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            { value: String(weekData.sessions), label: 'Sesiones completadas', color: '#0BAFBE' },
            { value: `~${weekData.minutes} min`, label: 'Minutos practicados', color: '#0BAFBE' },
            { value: String(weekData.exercises), label: 'Ejercicios completados', color: '#0BAFBE' },
            { value: `${weekData.accuracy}%`, label: 'Aciertos medio', color: accuracyColor },
          ].map((m, i) => (
            <div key={i} style={{
              background: '#F8FAFC',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: m.color, lineHeight: 1, fontFamily: 'Nunito, sans-serif' }}>
                {m.value}
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Auto summary */}
        <div style={{
          background: '#F0F9FF',
          borderLeft: '3px solid #0BAFBE',
          borderRadius: '0 8px 8px 0',
          padding: '14px 16px',
          marginBottom: '24px',
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#334155', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
            {autoMsg}
          </p>
        </div>

        {/* Textarea label */}
        <p style={{
          margin: '0 0 8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: 'Nunito, sans-serif',
        }}>
          Comentario para la familia
        </p>
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
            padding: '12px 14px',
            borderRadius: '10px',
            border: `1.5px solid ${focusedTA ? '#0BAFBE' : '#E2E8F0'}`,
            background: '#ffffff',
            color: '#0F172A',
            fontSize: '14px',
            fontFamily: 'Nunito, sans-serif',
            resize: 'vertical',
            maxHeight: '200px',
            outline: 'none',
            transition: 'border-color 0.18s ease',
            lineHeight: 1.6,
            marginBottom: '12px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handlePublish}
            disabled={!comment.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#0BAFBE',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Nunito, sans-serif',
              cursor: comment.trim() ? 'pointer' : 'default',
              opacity: comment.trim() ? 1 : 0.5,
              transition: 'opacity 0.18s ease',
            }}
          >
            <Send size={14} />
            Publicar
          </button>
        </div>

        {published && (
          <div style={{
            marginTop: '16px',
            borderLeft: '3px solid #059669',
            background: '#F0FDF4',
            borderRadius: '0 8px 8px 0',
            padding: '12px 16px',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#059669', fontFamily: 'Nunito, sans-serif' }}>
              Publicado · Dra. Martínez
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#0F172A', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
              {published.text}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
