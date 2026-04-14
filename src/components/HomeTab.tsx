import { useMemo } from 'react'

type NavTarget = 'ejercicio' | 'terapeuta' | 'familia'

interface Props {
  onNavigate: (tab: NavTarget) => void
}

// ── localStorage stats ────────────────────────────────────────────────────

interface HomeStats {
  childName: string
  streak: number
  accuracyThisWeek: number
  sessionsThisWeek: number
  sessionsTarget: number
}

function readStats(): HomeStats {
  const defaults: HomeStats = {
    childName: 'Pablo',
    streak: 12,
    accuracyThisWeek: 85,
    sessionsThisWeek: 5,
    sessionsTarget: 5,
  }
  try {
    const rawProfile = localStorage.getItem('dracs_child_profile')
    const rawHistory = localStorage.getItem('dracs_session_history')
    if (!rawProfile) return defaults

    const profile = JSON.parse(rawProfile) as { name?: string; streak?: number }
    const history = rawHistory
      ? (JSON.parse(rawHistory) as { date: string; total: number; correct: number }[])
      : []

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const thisWeek = history.filter(
      s => new Date(s.date + 'T00:00:00') >= weekStart,
    )
    const totalCorrect = thisWeek.reduce((a, s) => a + s.correct, 0)
    const totalExs = thisWeek.reduce((a, s) => a + s.total, 0)

    return {
      childName: profile.name || defaults.childName,
      streak: profile.streak ?? defaults.streak,
      accuracyThisWeek:
        totalExs > 0 ? Math.round((totalCorrect / totalExs) * 100) : defaults.accuracyThisWeek,
      sessionsThisWeek:
        thisWeek.length > 0 ? thisWeek.length : defaults.sessionsThisWeek,
      sessionsTarget: 5,
    }
  } catch {
    return defaults
  }
}

// ── sub-components ────────────────────────────────────────────────────────

function AccessCard({
  emoji,
  title,
  description,
  buttonLabel,
  buttonColor,
  onClick,
}: {
  emoji: string
  title: string
  description: string
  buttonLabel: string
  buttonColor: string
  onClick: () => void
}) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #E0F2FE',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 12px rgba(14, 165, 233, 0.06)',
      }}
    >
      <div style={{ fontSize: '48px', lineHeight: 1 }}>{emoji}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 800,
            color: '#0F172A',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#64748B',
            fontWeight: 500,
            lineHeight: 1.5,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {description}
        </p>
      </div>
      <button
        onClick={onClick}
        style={{
          padding: '12px',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: buttonColor,
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

function StatBig({
  value,
  label,
  icon,
  color = '#0EA5E9',
}: {
  value: string
  label: string
  icon: string
  color?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '24px 16px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #E0F2FE',
        flex: 1,
      }}
    >
      <span style={{ fontSize: '28px', lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontSize: '32px',
          fontWeight: 900,
          color,
          lineHeight: 1,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#94A3B8',
          textAlign: 'center',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────

export default function HomeTab({ onNavigate }: Props) {
  const stats = useMemo(readStats, [])

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)',
        flex: 1,
        overflowY: 'auto',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '52px 24px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* ── Hero ──────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Logo mark */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '22px',
                backgroundColor: '#0EA5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 900,
                  fontSize: '40px',
                  color: '#ffffff',
                  lineHeight: 1,
                }}
              >
                D
              </span>
            </div>
            {/* Decorative dots */}
            <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#FBBF24' }} />
            <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '34px',
                fontWeight: 900,
                color: '#0F172A',
                lineHeight: 1.2,
                maxWidth: '540px',
              }}
            >
              Terapia del lenguaje para niños con Síndrome de Down
            </h1>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: '16px',
                fontWeight: 600,
                color: '#64748B',
                maxWidth: '440px',
                lineHeight: 1.5,
              }}
            >
              Ejercicios adaptativos diarios supervisados por tu terapeuta
            </p>
          </div>
        </div>

        {/* ── Access cards ────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          <AccessCard
            emoji="🎮"
            title="Ejercicios"
            description="Sesión diaria adaptada al nivel de tu hijo"
            buttonLabel="Empezar sesión"
            buttonColor="#0EA5E9"
            onClick={() => onNavigate('ejercicio')}
          />
          <AccessCard
            emoji="📊"
            title="Terapeuta"
            description="Panel de seguimiento y progreso de pacientes"
            buttonLabel="Ver pacientes"
            buttonColor="#0369A1"
            onClick={() => onNavigate('terapeuta')}
          />
          <AccessCard
            emoji="👨‍👩‍👧"
            title="Familia"
            description={`Seguimiento del progreso semanal de ${stats.childName}`}
            buttonLabel="Ver progreso"
            buttonColor="#22C55E"
            onClick={() => onNavigate('familia')}
          />
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <StatBig
            icon="🔥"
            value={`${stats.streak} días`}
            label="Racha actual"
            color="#D97706"
          />
          <StatBig
            icon="🎯"
            value={`${stats.accuracyThisWeek}%`}
            label="Aciertos esta semana"
            color="#0EA5E9"
          />
          <StatBig
            icon="✅"
            value={`${stats.sessionsThisWeek}/${stats.sessionsTarget}`}
            label="Sesiones completadas"
            color="#22C55E"
          />
        </div>

        {/* ── Motivational banner ─────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#E0F2FE',
            borderRadius: '16px',
            border: '1px solid #BAE6FD',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <span style={{ fontSize: '32px', flexShrink: 0 }}>💪</span>
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: '#0369A1',
              lineHeight: 1.4,
            }}
          >
            {stats.childName} lleva{' '}
            <span style={{ color: '#0EA5E9', fontWeight: 900 }}>
              {stats.streak} días seguidos
            </span>{' '}
            trabajando. ¡Sigue así!
          </p>
        </div>
      </div>
    </div>
  )
}
