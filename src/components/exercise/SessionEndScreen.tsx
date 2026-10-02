import { useEffect, useRef, useState } from 'react'
import { Star, ArrowUp, ArrowRight, BookMarked, RotateCcw, TrendingUp, Map as MapIcon } from 'lucide-react'
import { type WorldPalette, getPaletteForHotspot } from '../../lib/worldColors'

// ── Full-screen confetti (perfect session) ────────────────────────────────

const CONFETTI_COLORS = ['#1E5FAA', '#F7C31C', '#3FB8C4', '#FF8551', '#9B8FD4']

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
  // Volver al mapa. Si no llega (modo antiguo sin mapa), va "Ver mi progreso".
  onBackToMap?: () => void
  // "Ver mi progreso" → casa de la familia (modo antiguo sin mapa).
  onViewProgress: () => void
  // Autoplay tipo Netflix: si se pasa, tras un countdown arranca otra partida del
  // mismo lugar automáticamente. Si está ausente, no hay countdown.
  onAutoPlayNext?: () => void
  // Solo en la demo y para el adulto que la recorre: un enlace discreto al pie
  // que abre esta misma partida en la carpeta del profesional. Es el momento
  // en que se entiende Dracs: lo que juega el niño llega a quien lo acompaña.
  demoBridge?: { label: string; onClick: () => void }
  palette?: WorldPalette
}

function getMessage(pct: number): string {
  if (pct === 100) return '¡Perfecto!'
  if (pct >= 80)  return '¡Excelente!'
  if (pct >= 60)  return '¡Muy bien!'
  return '¡Sigue practicando!'
}

// Una estrella por juego: llena si acertó. Es lo que el niño entiende de un
// vistazo, sin porcentajes ni palabras técnicas.
function StarRow({ correct, total, color }: { correct: number; total: number; color: string }) {
  return (
    <div
      role="img"
      aria-label={`${correct} de ${total} juegos acertados`}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '420px' }}
    >
      {Array.from({ length: total }, (_, i) => {
        const lit = i < correct
        return (
          <Star
            key={i}
            size={34}
            strokeWidth={1.8}
            fill={lit ? color : 'transparent'}
            style={{
              color: lit ? color : 'rgba(255,255,255,0.55)',
              animation: `metricIn 0.4s ease ${i * 70}ms both`,
            }}
          />
        )
      })}
    </div>
  )
}

export default function SessionEndScreen({
  correct, total, levelChanged, onRepeat, onBackToMap, onViewProgress, onAutoPlayNext, demoBridge, palette,
}: Props) {
  const pal     = palette ?? getPaletteForHotspot(undefined)
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0
  const message = getMessage(pct)
  const isPerfect = pct === 100

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
  function run(fn: () => void) {
    setCancelled(true)
    fn()
  }

  const kid = 'Fredoka, system-ui, sans-serif'
  const secondary = onBackToMap
    ? { label: 'Volver al mapa', Icon: MapIcon, onClick: onBackToMap }
    : { label: 'Ver mi progreso', Icon: TrendingUp, onClick: onViewProgress }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: pal.cream,
      }}
    >
      <style>{`
        .se-btn { transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease; }
        .se-btn:hover { transform: translateY(-2px); }
        .se-btn:focus-visible { outline: 3px solid #17313A; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .se-btn { transition: none; } .se-btn:hover { transform: none; } }
      `}</style>
      {isPerfect && <PerfectConfetti />}

      {/* ── ZONA SUPERIOR: color del lugar ────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 44%',
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
              fontSize: 'clamp(32px, 5vw, 46px)',
              fontWeight: 600,
              color: pal.text,
              lineHeight: 1.1,
              margin: 0,
              fontFamily: kid,
            }}
          >
            {message}
          </h1>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 500, color: pal.text, opacity: 0.9, fontFamily: kid }}>
            Partida completada
          </p>
        </div>
        <StarRow correct={correct} total={total} color={pal.accent} />
      </div>

      {/* ── ZONA INFERIOR ─────────────────────────────────────────────────── */}
      <div
        style={{
          flex: '1 1 56%',
          background: pal.cream,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: demoBridge ? '28px 24px 88px' : '28px 24px',
          overflow: 'auto',
        }}
      >
        {levelChanged && (
          <p
            style={{
              margin: 0, display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 18px', borderRadius: '16px', background: '#FFFFFF', maxWidth: '340px',
              border: '1.5px solid #E3E4E0', color: '#15191B',
              fontSize: '17px', fontWeight: 500, fontFamily: kid,
            }}
          >
            {levelChanged === 'up'
              ? <ArrowUp size={20} style={{ color: pal.primary, flexShrink: 0 }} />
              : <BookMarked size={20} style={{ color: pal.primary, flexShrink: 0 }} />}
            {levelChanged === 'up'
              ? 'La próxima partida, un poquito más difícil.'
              : 'Vamos a practicar un poco más en este nivel.'}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '340px' }}>
          <button
            type="button"
            className="se-btn"
            onClick={() => run(onRepeat)}
            style={{
              width: '100%', height: '60px', borderRadius: '16px', border: 'none',
              background: '#F7C31C', color: '#15191B',
              fontSize: '20px', fontWeight: 600, cursor: 'pointer', fontFamily: kid,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            <RotateCcw size={22} />
            Otra partida
          </button>
          <button
            type="button"
            className="se-btn"
            onClick={() => run(secondary.onClick)}
            style={{
              width: '100%', height: '60px', borderRadius: '16px',
              border: '1.5px solid #C9CBC6', background: '#FFFFFF', color: '#15191B',
              fontSize: '20px', fontWeight: 600, cursor: 'pointer', fontFamily: kid,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            <secondary.Icon size={22} />
            {secondary.label}
          </button>
        </div>

        {/* Countdown: una línea y un "esperar", sin otro botón grande. */}
        {onAutoPlayNext && !cancelled && (
          <p style={{ margin: 0, fontSize: '17px', color: '#5E6468', fontFamily: kid }}>
            Otra partida en {secondsLeft}
            {' · '}
            <button
              type="button"
              onClick={() => setCancelled(true)}
              style={{
                padding: 0, border: 0, background: 'none', cursor: 'pointer',
                color: '#15191B', fontSize: '17px', fontWeight: 600, fontFamily: kid,
                textDecoration: 'underline', textUnderlineOffset: '3px',
              }}
            >
              Esperar
            </button>
          </p>
        )}
      </div>

      {demoBridge && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center',
          padding: '0 16px 18px', pointerEvents: 'none',
        }}>
          <button
            type="button"
            onClick={() => run(demoBridge.onClick)}
            style={{
              pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: '10px',
              minHeight: '46px', padding: '0 20px', borderRadius: '999px', border: 'none',
              background: '#17313A', color: '#FFFFFF', cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: '15px', fontWeight: 600,
              boxShadow: '0 18px 36px -14px rgba(21,25,27,0.45)',
            }}
          >
            <span style={{
              fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px',
              background: '#F7C31C', color: '#15191B',
            }}>
              Demo
            </span>
            {demoBridge.label}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
