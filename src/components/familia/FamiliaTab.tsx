import { useMemo } from 'react'

interface Props {
  onNavigateToEjercicio: () => void
}

// ── helpers ─────────────────────────────────────────────────────────────────

function getChildName(): string {
  try {
    const raw = localStorage.getItem('dracs_child_profile')
    if (!raw) return 'Pablo'
    const parsed = JSON.parse(raw) as { name?: string }
    return parsed.name ?? 'Pablo'
  } catch {
    return 'Pablo'
  }
}

function getTomorrowLabel(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const labels = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${labels[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

// ── sub-components ───────────────────────────────────────────────────────────

function Card({
  children,
  bg = '#ffffff',
  border = '#F1F5F9',
}: {
  children: React.ReactNode
  bg?: string
  border?: string
}) {
  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '20px',
        padding: '20px',
      }}
    >
      {children}
    </div>
  )
}

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
// this week: L M X J V done, S D empty
const THIS_WEEK_DONE = [true, true, true, true, true, false, false]
// last week: L J done, rest empty
const LAST_WEEK_DONE = [true, false, false, true, false, false, false]

function WeekGrid({ label, done, color }: { label: string; done: boolean[]; color: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>{label}</span>
      <div className="flex gap-2">
        {DAYS_SHORT.map((d, i) => (
          <div
            key={d}
            className="flex items-center justify-center"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: done[i] ? color : 'transparent',
              border: `2px solid ${done[i] ? color : '#E2E8F0'}`,
              fontSize: '12px',
              fontWeight: 700,
              color: done[i] ? '#ffffff' : '#CBD5E1',
              flexShrink: 0,
            }}
          >
            {done[i] ? '✓' : d}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── main component ───────────────────────────────────────────────────────────

export default function FamiliaTab({ onNavigateToEjercicio }: Props) {
  const childName = useMemo(getChildName, [])
  const tomorrowLabel = useMemo(getTomorrowLabel, [])

  return (
    <div
      style={{
        fontFamily: 'Nunito, sans-serif',
        backgroundColor: '#F0F9FF',
        flex: 1,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          padding: '28px 16px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ paddingBottom: '4px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.2,
            }}
          >
            Hola, familia de {childName} 👋
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '15px',
              fontWeight: 600,
              color: '#64748B',
            }}
          >
            Así va la semana de {childName}
          </p>
        </div>

        {/* ── Summary card ────────────────────────────────────────── */}
        <Card bg="#F0FDF4" border="#BBF7D0">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                flexShrink: 0,
              }}
            >
              ⭐
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#15803D',
                }}
              >
                {childName} completó su sesión de hoy
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#16A34A',
                }}
              >
                28 minutos · Vocabulario · 7 ejercicios completados
              </p>
            </div>
          </div>
        </Card>

        {/* ── Weekly comparison ───────────────────────────────────── */}
        <Card>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '15px',
              fontWeight: 800,
              color: '#0F172A',
            }}
          >
            Esta semana vs. semana anterior
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <WeekGrid label="Esta semana" done={THIS_WEEK_DONE} color="#0EA5E9" />
            <WeekGrid label="Semana anterior" done={LAST_WEEK_DONE} color="#94A3B8" />
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#F0FDF4',
              borderRadius: '12px',
              padding: '10px 14px',
            }}
          >
            <span style={{ fontSize: '16px' }}>📈</span>
            <span
              style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}
            >
              ↑ 3 sesiones más que la semana pasada
            </span>
          </div>
        </Card>

        {/* ── Vocabulary progress ─────────────────────────────────── */}
        <Card>
          <p
            style={{
              margin: '0 0 14px',
              fontSize: '15px',
              fontWeight: 800,
              color: '#0F172A',
            }}
          >
            Progreso de vocabulario
          </p>

          {/* Progress bar */}
          <div
            style={{
              height: '14px',
              backgroundColor: '#E0F2FE',
              borderRadius: '99px',
              overflow: 'hidden',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '85%',
                backgroundColor: '#0EA5E9',
                borderRadius: '99px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          {/* Labels */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
              Nivel 3 · 85% de aciertos esta semana
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#22C55E',
                backgroundColor: '#F0FDF4',
                padding: '2px 10px',
                borderRadius: '20px',
              }}
            >
              +18%
            </span>
          </div>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#94A3B8',
            }}
          >
            +18% respecto a la semana pasada
          </p>
        </Card>

        {/* ── Recent sessions mini-list ───────────────────────────── */}
        <Card>
          <p
            style={{
              margin: '0 0 14px',
              fontSize: '15px',
              fontWeight: 800,
              color: '#0F172A',
            }}
          >
            Últimas sesiones de {childName}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { date: 'Lun 13 abr', duration: 28, exercises: 7, accuracy: 85 },
              { date: 'Vie 11 abr', duration: 31, exercises: 7, accuracy: 78 },
              { date: 'Jue 10 abr', duration: 25, exercises: 7, accuracy: 72 },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {s.date}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>
                    {s.duration} min · {s.exercises} ejercicios
                  </span>
                </div>
                <AccuracyPill value={s.accuracy} />
              </div>
            ))}
          </div>
        </Card>

        {/* ── Next session ────────────────────────────────────────── */}
        <Card bg="#F0F9FF" border="#BAE6FD">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '36px' }}>📅</span>

            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                Próxima sesión recomendada
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 800, color: '#0EA5E9', textTransform: 'capitalize' }}>
                mañana · {tomorrowLabel}
              </p>
            </div>

            <button
              onClick={onNavigateToEjercicio}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: '#0EA5E9',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Ir a los ejercicios 🎯
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function AccuracyPill({ value }: { value: number }) {
  const color = value >= 80 ? '#22C55E' : value >= 60 ? '#FBBF24' : '#F87171'
  const bg = value >= 80 ? '#F0FDF4' : value >= 60 ? '#FFFBEB' : '#FFF1F2'
  return (
    <span
      style={{
        padding: '3px 12px',
        borderRadius: '20px',
        backgroundColor: bg,
        color,
        fontSize: '13px',
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {value}%
    </span>
  )
}
