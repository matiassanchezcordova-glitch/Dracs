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
        flex: 1,
        padding: '40px 24px',
        gap: '20px',
        background: 'linear-gradient(145deg, #FFF8E8 0%, #E8F8FF 40%, #E0F9F0 100%)',
        minHeight: '100%',
      }}
    >
      {/* Dragon mascot */}
      <img
        src="/dragon.nb.png"
        alt="Dracs"
        style={{
          width: '140px',
          height: 'auto',
          animation: 'floatDragon2 3s ease-in-out infinite',
          filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))',
          marginBottom: '4px',
        }}
      />

      {/* Greeting */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#1A1A2E',
            lineHeight: 1.1,
            margin: 0,
            fontFamily: 'Playfair Display, serif',
            animation: 'wordSlideDown 0.4s ease',
          }}
        >
          ¡Hola,{' '}
          <span style={{ color: '#0BAFBE' }}>{profile.name}</span>!
        </h1>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#6B7280',
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
        <div style={{
          background: '#FFF3CD',
          border: '2px solid #FDE68A',
          borderRadius: '20px',
          padding: '20px 24px',
          minWidth: '130px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <Flame size={24} style={{ color: '#D97706' }} />
          <span
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#D97706',
              lineHeight: 1,
              fontFamily: 'Nunito, sans-serif',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {profile.streak}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#9CA3AF',
              fontFamily: 'Nunito, sans-serif',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            DÍAS SEGUIDOS
          </span>
        </div>

        {/* Level */}
        <div style={{
          background: '#E8F8FF',
          border: '2px solid #A5F3FC',
          borderRadius: '20px',
          padding: '20px 24px',
          minWidth: '130px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <Star size={24} style={{ color: '#0BAFBE' }} />
          <span
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#0BAFBE',
              lineHeight: 1,
              fontFamily: 'Nunito, sans-serif',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {profile.level}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#9CA3AF',
              fontFamily: 'Nunito, sans-serif',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            NIVEL ACTUAL
          </span>
        </div>
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
          height: '60px',
          padding: '0 48px',
          borderRadius: '16px',
          border: 'none',
          background: '#FFD93D',
          color: '#1A1A2E',
          fontSize: '18px',
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
          boxShadow: btnHovered
            ? '0 8px 30px rgba(255,217,61,0.55)'
            : '0 4px 20px rgba(255,217,61,0.4)',
          transform: btnHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease',
        }}
      >
        Empezar sesión
        <Play size={18} fill="#1A1A2E" />
      </button>
    </div>
  )
}
