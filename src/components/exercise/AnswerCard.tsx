import { useRef, useState } from 'react'
import { type Option } from '../../data/exercises'

export type CardState = 'idle' | 'shake' | 'attempted' | 'wrong' | 'correct'

interface Props {
  option: Option
  state: CardState
  onTap: () => void
  enterDelay?: number
}

// ── Ripple ────────────────────────────────────────────────────────────────

interface Ripple { id: number; x: number; y: number }

function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  function addRipple(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700)
  }

  const elements = ripples.map(r => (
    <span
      key={r.id}
      style={{
        position: 'absolute',
        left: r.x,
        top: r.y,
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'rgba(11,175,190,0.35)',
        pointerEvents: 'none',
        animation: 'rippleOut 700ms ease-out forwards',
        zIndex: 10,
      }}
    />
  ))

  return { addRipple, elements }
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function AnswerCard({ option, state, onTap, enterDelay = 0 }: Props) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const { addRipple, elements: rippleElements } = useRipple()
  const btnRef = useRef<HTMLButtonElement>(null)

  const isCorrect = state === 'correct'
  const isWrong   = state === 'wrong'
  const isShaking = state === 'shake'
  const isIdle    = state === 'idle'
  const isGlowing = hovered && isIdle

  // Color scheme per state
  let borderColor = 'rgba(255,255,255,0.3)'
  let bgColor     = 'rgba(255,255,255,0.92)'
  let textColor   = '#0F172A'
  let emojiRingBg = '#F0FAFA'

  if (isGlowing) {
    borderColor = '#ffffff'
  }
  if (state === 'attempted') {
    borderColor = 'rgba(248,113,113,0.5)'
    bgColor = 'rgba(255,248,248,0.92)'
  }
  if (isCorrect) {
    borderColor = '#22C55E'
    bgColor = 'rgba(240,253,244,0.95)'
    textColor = '#15803D'
    emojiRingBg = '#DCFCE7'
  }
  if (isWrong) {
    borderColor = '#F87171'
    bgColor = 'rgba(255,241,242,0.95)'
    textColor = '#DC2626'
    emojiRingBg = '#FFE4E6'
  }

  const scale = pressed && isIdle ? 'scale(0.97)' : isGlowing ? 'scale(1.02) translateY(-2px)' : 'scale(1)'
  const shadow = isGlowing
    ? '0 0 0 3px rgba(11,175,190,0.18), 0 8px 28px rgba(11,175,190,0.22)'
    : isCorrect
      ? '0 4px 16px rgba(34,197,94,0.18)'
      : isWrong
        ? '0 4px 16px rgba(248,113,113,0.18)'
        : '0 2px 8px rgba(11,175,190,0.06)'

  return (
    <button
      ref={btnRef}
      onClick={e => { addRipple(e); onTap() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={isShaking ? 'animate-shake' : ''}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        borderRadius: '20px',
        border: `2.5px solid ${borderColor}`,
        backgroundColor: bgColor,
        cursor: 'pointer',
        padding: '16px 8px',
        minHeight: '118px',
        position: 'relative',
        overflow: 'hidden',
        transform: scale,
        boxShadow: shadow,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'all 0.18s ease',
        animation: `cardEnter 0.35s ease ${enterDelay}ms both`,
      }}
    >
      {/* Ripples */}
      {rippleElements}

      {/* Emoji circle */}
      <div
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${emojiRingBg}, ${emojiRingBg}cc)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '34px',
          lineHeight: 1,
          userSelect: 'none',
          flexShrink: 0,
          boxShadow: isCorrect
            ? '0 2px 10px rgba(34,197,94,0.2)'
            : isWrong
              ? '0 2px 10px rgba(248,113,113,0.2)'
              : 'none',
        }}
      >
        {option.emoji}
      </div>

      <span
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '13px',
          textAlign: 'center',
          lineHeight: 1.2,
          color: textColor,
        }}
      >
        {option.name}
      </span>

      {/* Correct/wrong overlay icon */}
      {(isCorrect || isWrong) && (
        <span
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          {isCorrect ? '✓' : '✗'}
        </span>
      )}
    </button>
  )
}
