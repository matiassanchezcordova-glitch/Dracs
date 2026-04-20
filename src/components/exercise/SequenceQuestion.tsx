import { useState } from 'react'
import { type RuntimeSequence } from '../../data/exercises'

interface Props {
  exercise: RuntimeSequence
  onCorrect: () => void
}

export default function SequenceQuestion({ exercise, onCorrect }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<number[]>([])
  const [shaking, setShaking]             = useState(false)
  const [showRetry, setShowRetry]         = useState(false)
  const [done, setDone]                   = useState(false)

  function handleTap(displayIndex: number) {
    if (shaking || done || selectedOrder.includes(displayIndex)) return

    const newOrder = [...selectedOrder, displayIndex]
    setSelectedOrder(newOrder)

    if (newOrder.length < exercise.items.length) return

    const originalIndices = newOrder.map(di => exercise.items[di].originalIndex)
    const isCorrect = exercise.correctOrder.every((oi, pos) => originalIndices[pos] === oi)

    if (isCorrect) {
      setDone(true)
      setTimeout(onCorrect, 700)
    } else {
      setShaking(true)
      setShowRetry(true)
      setTimeout(() => {
        setShaking(false)
        setSelectedOrder([])
        setTimeout(() => setShowRetry(false), 300)
      }, 900)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        padding: '8px 0 16px',
        flex: 1,
      }}
    >
      <style>{`
        @keyframes seqFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes numBounce { 0%{transform:scale(0.5) translateX(-50%);} 70%{transform:scale(1.2) translateX(-50%);} 100%{transform:scale(1) translateX(-50%);} }
      `}</style>

      <p
        style={{
          textAlign: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '20px',
          fontFamily: 'Nunito, sans-serif',
          margin: 0,
          padding: '0 16px',
        }}
      >
        {exercise.question}
      </p>

      <p
        style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.75)',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'Nunito, sans-serif',
          margin: 0,
        }}
      >
        Tócalas en orden
      </p>

      {showRetry && (
        <p
          style={{
            color: '#FFD93D',
            fontSize: '16px',
            fontWeight: 800,
            fontFamily: 'Nunito, sans-serif',
            margin: 0,
            animation: 'seqFadeIn 0.2s ease',
          }}
        >
          ¡Inténtalo de nuevo!
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {exercise.items.map((item, displayIndex) => {
          const tapPosition = selectedOrder.indexOf(displayIndex)
          const isSelected  = tapPosition !== -1

          return (
            <button
              key={displayIndex}
              onClick={() => handleTap(displayIndex)}
              className={shaking && isSelected ? 'animate-shake' : ''}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 14px',
                borderRadius: '20px',
                border: `2.5px solid ${
                  done && isSelected ? '#22C55E' : isSelected ? '#FFD93D' : 'rgba(255,255,255,0.3)'
                }`,
                background: done && isSelected
                  ? 'rgba(240,253,244,0.95)'
                  : isSelected
                    ? 'rgba(255,217,61,0.15)'
                    : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                cursor: isSelected || done ? 'default' : 'pointer',
                minWidth: '90px',
                position: 'relative',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: done ? '#22C55E' : '#0BAFBE',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Nunito, sans-serif',
                    animation: 'numBounce 0.3s ease forwards',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {tapPosition + 1}
                </div>
              )}

              <span style={{ fontSize: '44px', lineHeight: 1, userSelect: 'none' }}>
                {item.emoji}
              </span>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: done && isSelected ? '#15803D' : '#0F172A',
                  fontFamily: 'Nunito, sans-serif',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
