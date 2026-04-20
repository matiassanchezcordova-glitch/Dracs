import { useState } from 'react'
import { Flame, Star, Play } from 'lucide-react'
import { type ChildProfile } from '../../hooks/useChildProfile'

interface Props {
  profile: ChildProfile
  onStart: () => void
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Nivel 1 · Principiante',
  2: 'Nivel 2 · Básico',
  3: 'Nivel 3 · Intermedio',
  4: 'Nivel 4 · Avanzado',
}

// ── Glass card ────────────────────────────────────────────────────────────

function GlassCard({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.14)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '20px',
        ...s,
      }}
    >
      {children}
    </div>
  )
}

export default function WelcomeScreen({ profile, onStart }: Props) {
  const [btnHovered, setBtnHovered] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '40px 24px',
        gap: '28px',
      }}
    >
      {/* Greeting */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: 0,
            fontFamily: 'Nunito, sans-serif',
            animation: 'wordSlideDown 0.4s ease',
          }}
        >
          ¡Hola,{' '}
          <span style={{ color: '#FFD93D' }}>{profile.name}</span>!
        </h1>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.75)',
            margin: 0,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {LEVEL_LABELS[profile.level]}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Streak */}
        <GlassCard style={{ padding: '20px 24px', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Flame size={32} style={{ color: '#F97316' }} />
          <span
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFD93D',
              lineHeight: 1,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {profile.streak}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Nunito, sans-serif',
              textAlign: 'center',
            }}
          >
            {profile.streak === 1 ? 'día seguido' : 'días seguidos'}
          </span>
        </GlassCard>

        {/* Level */}
        <GlassCard style={{ padding: '20px 24px', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Star size={32} style={{ color: '#F59E0B' }} />
          <span
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFD93D',
              lineHeight: 1,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {profile.level}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Nunito, sans-serif',
              textAlign: 'center',
            }}
          >
            nivel actual
          </span>
        </GlassCard>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '18px 48px',
          borderRadius: '20px',
          border: 'none',
          background: '#ffffff',
          color: '#0891A0',
          fontSize: '20px',
          fontWeight: 900,
          cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
          boxShadow: '0 6px 28px rgba(0,0,0,0.18)',
          transform: btnHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.2s ease',
        }}
      >
        ¡Empezar sesión!
        <Play size={18} fill="#0891A0" />
      </button>
    </div>
  )
}
