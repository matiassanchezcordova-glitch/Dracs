import { useState } from 'react'
import { Check } from 'lucide-react'
import { type WorldPalette } from '../../lib/worldColors'

export type CardState = 'idle' | 'shake' | 'correct' | 'revealed'

// Color de acento por defecto (mar) cuando no se pasa paleta del lugar.
const DEFAULT_ACCENT = '#1E5FAA'

interface Props {
  imageUrl?: string
  text?: string
  label: string
  state: CardState
  dimmed?: boolean
  badge?: number
  disabled?: boolean
  onTap: () => void
  enterDelay?: number
  maxWidth?: number
  palette?: WorldPalette
}

// Unified card for all 4 exercise types.
//   - imageUrl provided → image fills the square (no padding, no circle).
//   - text provided     → centered text inside the square (for fill_blank).
//   - label             → only revealed below the card on `correct` or `revealed`.
//   - badge             → small numbered chip (used by sequence).
export default function ExerciseCard({
  imageUrl,
  text,
  label,
  state,
  dimmed = false,
  badge,
  disabled = false,
  onTap,
  enterDelay = 0,
  maxWidth,
  palette,
}: Props) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const accent = palette?.accent ?? DEFAULT_ACCENT

  const isCorrect  = state === 'correct'
  const isRevealed = state === 'revealed'
  const isShaking  = state === 'shake'
  const isIdle     = state === 'idle'
  const showLabel  = isCorrect || isRevealed

  let borderColor = '#E5E7EB'
  let borderWidth = '2px'
  let bgColor     = '#FFFFFF'
  let shadow      = '0 2px 6px rgba(15,23,42,0.06)'

  if (!disabled && isIdle && (hovered || pressed)) {
    borderColor = accent
    shadow = '0 12px 24px rgba(0,0,0,0.15)'
  }
  if (isCorrect || isRevealed) {
    borderColor = '#10B981'
    shadow = '0 4px 18px rgba(16,185,129,0.22)'
  }
  if (isShaking) {
    borderColor = '#F59E0B'
    shadow = '0 4px 16px rgba(245,158,11,0.18)'
  }

  let transform = 'scale(1)'
  if (!disabled && isIdle) {
    if (pressed)      transform = 'scale(0.96)'
    else if (hovered) transform = 'translateY(-4px) scale(1.03)'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        margin: '0 auto',
        opacity: dimmed ? 0.3 : 1,
        transition: 'opacity 0.25s ease',
      }}
    >
      <button
        type="button"
        onClick={disabled ? undefined : onTap}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false) }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        disabled={disabled}
        className={isShaking ? 'exercise-card-shake' : ''}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          padding: 0,
          background: bgColor,
          border: `${borderWidth} solid ${borderColor}`,
          borderRadius: '18px',
          boxShadow: shadow,
          cursor: disabled ? 'default' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          transform,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.18s ease',
          animation: isCorrect
            ? 'exercise-card-pop 0.32s ease'
            : `exercise-card-enter 0.35s ease ${enterDelay}ms both`,
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        )}

        {!imageUrl && text && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              boxSizing: 'border-box',
              fontSize: 'clamp(20px, 4.4vw, 28px)',
              fontWeight: 800,
              color: isCorrect || isRevealed ? '#047857' : '#1F2937',
              textAlign: 'center',
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {text}
          </div>
        )}

        {badge !== undefined && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              minWidth: '26px',
              height: '26px',
              padding: '0 8px',
              borderRadius: '999px',
              background: isCorrect || isRevealed ? '#10B981' : '#0BAFBE',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 800,
              fontFamily: 'Nunito, sans-serif',
              boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
            }}
          >
            {badge}
          </div>
        )}

        {(isCorrect || isRevealed) && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
            }}
          >
            <Check size={18} color="#FFFFFF" strokeWidth={3} />
          </div>
        )}
      </button>

      <span
        aria-hidden={!showLabel}
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '15px',
          color: '#047857',
          textAlign: 'center',
          lineHeight: 1.25,
          opacity: showLabel ? 1 : 0,
          transition: 'opacity 0.18s ease',
          minHeight: '20px',
        }}
      >
        {label}
      </span>
    </div>
  )
}
