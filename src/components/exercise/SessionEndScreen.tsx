import { useState } from 'react'
import { Star, BookOpen, CheckCircle2, Target, ArrowUp, BookMarked, RotateCcw, TrendingUp } from 'lucide-react'

interface Props {
  correct: number
  total: number
  levelChanged: 'up' | 'down' | null
  onRepeat: () => void
  onViewProgress: () => void
}

function getMessage(pct: number): string {
  if (pct === 100) return '¡Perfecto!'
  if (pct >= 80)  return '¡Excelente!'
  if (pct >= 60)  return '¡Muy bien!'
  return '¡Sigue practicando!'
}

// ── Glass card ────────────────────────────────────────────────────────────

function GlassCard({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '20px',
        ...s,
      }}
    >
      {children}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color = '#0F172A' }: {
  icon: React.ReactNode
  value: number | string
  label: string
  color?: string
}) {
  return (
    <GlassCard style={{ padding: '16px 20px', minWidth: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: '26px', fontWeight: 900, color, lineHeight: 1, fontFamily: 'Nunito, sans-serif' }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
        {label}
      </span>
    </GlassCard>
  )
}

export default function SessionEndScreen({ correct, total, levelChanged, onRepeat, onViewProgress }: Props) {
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0
  const message = getMessage(pct)
  const [btn1H, setBtn1H] = useState(false)
  const [btn2H, setBtn2H] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '40px 24px',
        gap: '24px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <Star
            size={52}
            fill="#FFD93D"
            style={{
              color: '#FFD93D',
              filter: 'drop-shadow(0 4px 12px rgba(255,217,61,0.4))',
              animation: 'metricIn 0.5s ease',
            }}
          />
        </div>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: 0,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          ¡Sesión completada!
        </h1>
        <p
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#FFD93D',
            margin: 0,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {message}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <StatCard icon={<BookOpen size={22} />}     value={total}   label="ejercicios" color="#0891A0" />
        <StatCard icon={<CheckCircle2 size={22} />} value={correct} label="aciertos"   color="#22C55E" />
        <StatCard icon={<Target size={22} />}       value={`${pct}%`} label="precisión" color="#0BAFBE" />
      </div>

      {/* Level change */}
      {levelChanged && (
        <GlassCard
          style={{
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: `2px solid ${levelChanged === 'up' ? '#22C55E' : '#FBBF24'}`,
          }}
        >
          {levelChanged === 'up'
            ? <ArrowUp size={22} style={{ color: '#22C55E', flexShrink: 0 }} />
            : <BookMarked size={22} style={{ color: '#D97706', flexShrink: 0 }} />
          }
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: levelChanged === 'up' ? '#15803D' : '#92400E',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {levelChanged === 'up'
              ? '¡Subiste de nivel en la próxima sesión!'
              : 'Vamos a practicar un poco más en este nivel'}
          </span>
        </GlassCard>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
        <button
          onClick={onRepeat}
          onMouseEnter={() => setBtn1H(true)}
          onMouseLeave={() => setBtn1H(false)}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '18px',
            border: 'none',
            background: '#ffffff',
            color: '#0891A0',
            fontSize: '18px',
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transform: btn1H ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={20} />
          Otra sesión
        </button>
        <button
          onClick={onViewProgress}
          onMouseEnter={() => setBtn2H(true)}
          onMouseLeave={() => setBtn2H(false)}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '18px',
            border: '2px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transform: btn2H ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.2s ease',
          }}
        >
          <TrendingUp size={20} />
          Ver mi progreso
        </button>
      </div>
    </div>
  )
}
