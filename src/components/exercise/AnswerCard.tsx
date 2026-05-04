import { useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
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

  // Border per state
  let borderColor = '#E5E7EB'
  let borderWidth = '1.5px'
  let bgColor     = '#ffffff'
  let textColor   = '#1A1A2E'
  let emojiRingBg = '#F0FAFA'

  if (isGlowing) {
    borderColor = '#0BAFBE'
    borderWidth = '2px'
    bgColor = '#F0FAFA'
  }
  if (state === 'attempted') {
    borderColor = 'rgba(220,38,38,0.35)'
    borderWidth = '2px'
    bgColor = '#FFF8F8'
  }
  if (isCorrect) {
    borderColor = '#059669'
    borderWidth = '2px'
    bgColor = '#F0FDF4'
    textColor = '#059669'
    emojiRingBg = '#DCFCE7'
  }
  if (isWrong) {
    borderColor = 'rgba(220,38,38,0.5)'
    borderWidth = '2px'
    bgColor = '#FFF5F5'
    textColor = '#DC2626'
    emojiRingBg = '#FFE4E6'
  }

  const scale = pressed && isIdle ? 'scale(0.97)' : isGlowing ? 'translateY(-3px)' : 'scale(1)'
  const shadow = isGlowing
    ? '0 8px 24px rgba(11,175,190,0.15)'
    : isCorrect
      ? '0 4px 16px rgba(34,197,94,0.18)'
      : isWrong
        ? '0 4px 16px rgba(220,38,38,0.12)'
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
        border: `${borderWidth} solid ${borderColor}`,
        backgroundColor: bgColor,
        cursor: 'pointer',
        padding: '16px 8px',
        minHeight: '118px',
        position: 'relative',
        overflow: 'hidden',
        transform: scale,
        boxShadow: shadow,
        transition: 'all 0.18s ease',
        animation: `cardEnter 0.35s ease ${enterDelay}ms both`,
      }}
    >
      {/* Ripples */}
      {rippleElements}

      {/* Emoji circle */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: emojiRingBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '38px',
          lineHeight: 1,
          userSelect: 'none',
          flexShrink: 0,
          boxShadow: isCorrect
            ? '0 2px 10px rgba(34,197,94,0.2)'
            : isWrong
              ? '0 2px 10px rgba(220,38,38,0.15)'
              : 'none',
        }}
      >
        {option.emoji}
      </div>

      <span
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
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
            lineHeight: 1,
            display: 'flex',
          }}
        >
          {isCorrect
            ? <Check size={16} color="#059669" strokeWidth={2.5} />
            : <X size={16} color="#DC2626" strokeWidth={2.5} />
          }
        </span>
      )}
    </button>
  )
}
