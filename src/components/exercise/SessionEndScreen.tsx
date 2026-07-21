import { useEffect, useRef, useState } from 'react'
import { Star, BookOpen, CheckCircle2, Target, ArrowUp, BookMarked, RotateCcw, TrendingUp, Lock } from 'lucide-react'
import { type WorldPalette, getPaletteForHotspot } from '../../lib/worldColors'

// ── Full-screen confetti (perfect session) ────────────────────────────────

const CONFETTI_COLORS = ['#1A8FB5', '#F7C31C', '#059669', '#F97316', '#DC2626']

function PerfectConfetti() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const pieces: HTMLDivElement[] = []
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('div')
      const duration = 2 + Math.random() * 2
      const delay = Math.random()
      el.style.cssText = `
        position:absolute; width:8px; height:8px; border-radius:2px;
        left:${Math.random() * 100}%; top:-10px;
        background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};
        animation:confettiFallFull ${duration}s ease ${delay}s forwards;
      `
      container.appendChild(el)
      pieces.push(el)
    }
    const cleanup = setTimeout(() => {
      pieces.forEach(el => el.remove())
    }, 3000)
    return () => { clearTimeout(cleanup); pieces.forEach(el => el.remove()) }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        overflow: 'hidden', zIndex: 150,
      }}
    />
  )
}

interface Props {
  correct: number
  total: number
  levelChanged: 'up' | 'down' | null
  onRepeat: () => void
  onViewProgress: () => void
  hasAccount?: boolean
  // Autoplay tipo Netflix: si se pasa, tras un countdown arranca otra partida del
  // mismo hotspot automáticamente. Si está ausente, no hay countdown (legacy).
  onAutoPlayNext?: () => void
  palette?: WorldPalette
}

function getMessage(pct: number): string {
  if (pct === 100) return '¡Perfecto!'
  if (pct >= 80)  return '¡Excelente!'
  if (pct >= 60)  return '¡Muy bien!'
  return '¡Sigue practicando!'
}

// ── Stat card ─────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color = '#33302A' }: {
  icon: React.ReactNode
  value: number | string
  label: string
  color?: string
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      padding: '16px 20px',
      minWidth: '90px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1, fontFamily: 'Fredoka, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', fontFamily: 'Nunito, sans-serif' }}>
        {label}
      </span>
    </div>
  )
}

export default function SessionEndScreen({ correct, total, levelChanged, onRepeat, onViewProgress, hasAccount = true, onAutoPlayNext, palette }: Props) {
  const pal     = palette ?? getPaletteForHotspot(undefined)
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0
  const message = getMessage(pct)
  const isPerfect = pct === 100
  const [btn1H, setBtn1H] = useState(false)
  const [btn2H, setBtn2H] = useState(false)
  const [waitH, setWaitH] = useState(false)

  // Countdown Netflix
  const [secondsLeft, setSecondsLeft] = useState(5)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (!onAutoPlayNext || cancelled) return
    if (secondsLeft <= 0) {
      onAutoPlayNext()
      return
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, cancelled, onAutoPlayNext])

  // Cualquier acción manual cancela el countdown antes de su handler propio.
  function handleRepeat() {
    setCancelled(true)
    onRepeat()
  }
  function handleViewProgress() {
    setCancelled(true)
    onViewProgress()
  }

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
      {isPerfect && <PerfectConfetti />}

      {/* ── ZONA SUPERIOR: color del lugar, 40% ───────────────────────────── */}
      <div
        style={{
          flex: '0 0 40%',
          background: pal.primary,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <Star
          size={52}
          fill={pal.accent}
          style={{
            color: pal.accent,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
            animation: 'metricIn 0.5s ease',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 700,
              color: pal.text,
              lineHeight: 1.1,
              margin: 0,
              fontFamily: 'Fredoka, system-ui, sans-serif',
            }}
          >
            ¡Partida completada!
          </h1>
          <p
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: pal.text,
              opacity: 0.92,
              margin: 0,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {message}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <StatCard icon={<BookOpen size={22} />}     value={total}     label="juegos"    color={pal.primary} />
          <StatCard icon={<CheckCircle2 size={22} />} value={correct}   label="aciertos"  color={pal.primary} />
          <StatCard icon={<Target size={22} />}       value={`${pct}%`} label="precisión" color={pal.primary} />
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
          gap: '16px',
          padding: '32px 24px',
          overflow: 'auto',
        }}
      >
        {/* Level change */}
        {levelChanged && (
          <div
            style={{
              background: '#ffffff',
              border: `2px solid ${levelChanged === 'up' ? '#22C55E' : '#FBBF24'}`,
              borderRadius: '20px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxWidth: '360px',
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
                ? '¡Subiste de nivel en la próxima partida!'
                : 'Vamos a practicar un poco más en este nivel'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
          <button
            onClick={handleRepeat}
            onMouseEnter={() => setBtn1H(true)}
            onMouseLeave={() => setBtn1H(false)}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '16px',
              border: 'none',
              background: pal.primary,
              color: pal.text,
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Fredoka, system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transform: btn1H ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.2s ease',
            }}
          >
            <RotateCcw size={20} />
            Otra partida
          </button>
          <button
            onClick={handleViewProgress}
            onMouseEnter={() => setBtn2H(true)}
            onMouseLeave={() => setBtn2H(false)}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '16px',
              border: `2px solid ${pal.primary}`,
              background: 'transparent',
              color: pal.primary,
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Fredoka, system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transform: btn2H ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s ease',
            }}
          >
            {hasAccount ? <TrendingUp size={20} /> : <Lock size={14} />}
            {hasAccount ? 'Ver mi progreso' : 'Guarda tu progreso'}
          </button>
        </div>

        {/* Countdown Netflix — sólo en modo hotspot (onAutoPlayNext presente) */}
        {onAutoPlayNext && !cancelled && (
          <div
            style={{
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Fredoka, system-ui, sans-serif',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: pal.primary,
              }}
            >
              Próxima partida en {secondsLeft}
            </p>
            <button
              onClick={() => setCancelled(true)}
              onMouseEnter={() => setWaitH(true)}
              onMouseLeave={() => setWaitH(false)}
              style={{
                padding: '8px 20px',
                borderRadius: '14px',
                border: '1.5px solid #CBD5E1',
                background: waitH ? '#F1F5F9' : 'transparent',
                color: '#64748B',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Fredoka, system-ui, sans-serif',
                transition: 'all 0.2s ease',
              }}
            >
              Esperar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
