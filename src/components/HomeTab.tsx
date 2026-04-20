import { useMemo, useState } from 'react'
import { Gamepad2, BarChart2, Users, Flame, Target, CheckCircle } from 'lucide-react'

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
  icon,
  title,
  description,
  buttonLabel,
  buttonBg,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  buttonLabel: string
  buttonBg: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #E0F2FE',
        borderTop: '4px solid #0BAFBE',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: hovered
          ? '0 8px 32px rgba(11, 175, 190, 0.20)'
          : '0 4px 24px rgba(11, 175, 190, 0.12)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          backgroundColor: '#F0FAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0BAFBE',
        }}
      >
        {icon}
      </div>

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
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          padding: '12px',
          borderRadius: '14px',
          border: 'none',
          background: buttonBg,
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
          transition: 'all 0.2s ease',
          filter: btnHovered ? 'brightness(1.1)' : 'brightness(1)',
          transform: btnHovered ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

function StatBig({
  icon,
  value,
  label,
  valueColor = '#FFD93D',
}: {
  icon: React.ReactNode
  value: string
  label: string
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '24px 16px',
        flex: 1,
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex' }}>{icon}</span>
      <span
        style={{
          fontSize: '36px',
          fontWeight: 900,
          color: valueColor,
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
          color: 'rgba(255,255,255,0.75)',
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
        background: 'linear-gradient(180deg, #F0FAFA 0%, #E0F6F8 100%)',
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
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <img
            src="/dragon.nb.png"
            alt="DRACS mascot"
            style={{
              height: '120px',
              width: 'auto',
              display: 'block',
              animation: 'floatDragon 3s ease-in-out infinite',
            }}
          />

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: '0 auto',
                fontSize: '38px',
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.2,
                maxWidth: '540px',
                textAlign: 'center',
              }}
            >
              Terapia del lenguaje para niños con Síndrome de Down
            </h1>
            <p
              style={{
                margin: '12px auto 0',
                fontSize: '16px',
                fontWeight: 600,
                color: '#64748B',
                maxWidth: '440px',
                lineHeight: 1.5,
                textAlign: 'center',
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
            icon={<Gamepad2 size={24} />}
            title="Ejercicios"
            description="Sesión diaria adaptada al nivel de tu hijo"
            buttonLabel="Empezar sesión"
            buttonBg="linear-gradient(135deg, #0BAFBE, #0891A0)"
            onClick={() => onNavigate('ejercicio')}
          />
          <AccessCard
            icon={<BarChart2 size={24} />}
            title="Terapeuta"
            description="Panel de seguimiento y progreso de pacientes"
            buttonLabel="Ver pacientes"
            buttonBg="linear-gradient(135deg, #0891A0, #076E7A)"
            onClick={() => onNavigate('terapeuta')}
          />
          <AccessCard
            icon={<Users size={24} />}
            title="Familia"
            description={`Seguimiento del progreso semanal de ${stats.childName}`}
            buttonLabel="Ver progreso"
            buttonBg="#22C55E"
            onClick={() => onNavigate('familia')}
          />
        </div>

        {/* ── Stats strip ─────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0BAFBE, #0891A0)',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(11, 175, 190, 0.25)',
          }}
        >
          <StatBig
            icon={<Flame size={22} />}
            value={
              stats.streak === 0
                ? '¡Hoy!'
                : stats.streak === 1
                  ? '1 día'
                  : `${stats.streak}d`
            }
            label="Racha actual"
          />
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '16px 0' }} />
          <StatBig
            icon={<Target size={22} />}
            value={`${stats.accuracyThisWeek}%`}
            label="Aciertos esta semana"
          />
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '16px 0' }} />
          <StatBig
            icon={<CheckCircle size={22} />}
            value={`${stats.sessionsThisWeek}/${stats.sessionsTarget}`}
            label="Sesiones completadas"
          />
        </div>

        {/* ── Motivational banner ─────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#E0F6F8',
            borderRadius: '16px',
            border: '1px solid #A5E4EC',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 24px rgba(11, 175, 190, 0.10)',
          }}
        >
          <img
            src="/dragon.nb.png"
            alt=""
            style={{ height: '40px', width: 'auto', flexShrink: 0 }}
          />
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: '#0891A0',
              lineHeight: 1.4,
            }}
          >
            {stats.streak === 0 ? (
              <>
                ¡Hoy es un buen día para empezar,{' '}
                <span style={{ color: '#0BAFBE', fontWeight: 900 }}>{stats.childName}</span>!
              </>
            ) : (
              <>
                {stats.childName} lleva{' '}
                <span style={{ color: '#0BAFBE', fontWeight: 900 }}>
                  {stats.streak === 1 ? '1 día seguido' : `${stats.streak} días seguidos`}
                </span>{' '}
                trabajando. ¡Sigue así!
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
