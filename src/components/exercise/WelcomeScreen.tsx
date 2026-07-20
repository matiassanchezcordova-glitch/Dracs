import { useState } from 'react'
import { Flame, Star, Play } from 'lucide-react'
import { type ChildProfile } from '../../hooks/useChildProfile'
import { type WorldPalette, getPaletteForHotspot } from '../../lib/worldColors'

interface Props {
  profile: ChildProfile
  onStart: () => void
  errorMessage?: string | null
  palette?: WorldPalette
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Nivel 1 · Principiante',
  2: 'Nivel 2 · Básico',
  3: 'Nivel 3 · Intermedio',
  4: 'Nivel 4 · Avanzado',
}

export default function WelcomeScreen({ profile, onStart, errorMessage, palette }: Props) {
  const pal = palette ?? getPaletteForHotspot(undefined)
  const [btnHovered, setBtnHovered] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: pal.cream,
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      {/* ── ZONA SUPERIOR: color del lugar, 40% ───────────────────────────── */}
      <div
        style={{
          flex: '0 0 40%',
          background: pal.primary,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 6vw, 48px)',
              fontWeight: 700,
              color: pal.text,
              lineHeight: 1.1,
              margin: 0,
              fontFamily: 'Fredoka, system-ui, sans-serif',
              animation: 'wordSlideDown 0.4s ease',
            }}
          >
            ¡Hola, {profile.name}!
          </h1>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: pal.text,
              opacity: 0.85,
              margin: 0,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {LEVEL_LABELS[profile.level]}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <StatBox icon={<Flame size={24} style={{ color: '#D97706' }} />} value={profile.streak} label="DÍAS SEGUIDOS" valueColor="#D97706" />
          <StatBox icon={<Star size={24} style={{ color: '#0BAFBE' }} />} value={profile.level} label="NIVEL ACTUAL" valueColor="#0BAFBE" />
        </div>
      </div>

      {/* ── ZONA INFERIOR: cream, 60% ─────────────────────────────────────── */}
      <div
        style={{
          flex: '1 1 60%',
          background: pal.cream,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '32px 24px',
        }}
      >
        <img
          src="/logo-dracs.png"
          alt="Dracs"
          style={{
            width: '140px',
            height: 'auto',
            animation: 'floatDragon2 3s ease-in-out infinite',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))',
          }}
        />

        {errorMessage && (
          <div
            role="alert"
            style={{
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              color: '#B91C1C',
              borderRadius: '14px',
              padding: '12px 18px',
              maxWidth: '360px',
              textAlign: 'center',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </div>
        )}

        <button
          onClick={onStart}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            height: '64px',
            padding: '0 52px',
            borderRadius: '18px',
            border: 'none',
            background: pal.accent,
            color: pal.text,
            fontSize: '20px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Fredoka, system-ui, sans-serif',
            boxShadow: btnHovered
              ? '0 12px 30px rgba(0,0,0,0.22)'
              : '0 6px 20px rgba(0,0,0,0.15)',
            transform: btnHovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.2s ease',
          }}
        >
          ¡Empezar partida!
          <Play size={20} fill={pal.text} />
        </button>
      </div>
    </div>
  )
}

function StatBox({ icon, value, label, valueColor }: {
  icon: React.ReactNode
  value: number
  label: string
  valueColor: string
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      padding: '16px 24px',
      minWidth: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    }}>
      {icon}
      <span
        style={{
          fontSize: '40px',
          fontWeight: 800,
          color: valueColor,
          lineHeight: 1,
          fontFamily: 'Nunito, sans-serif',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
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
        {label}
      </span>
    </div>
  )
}
