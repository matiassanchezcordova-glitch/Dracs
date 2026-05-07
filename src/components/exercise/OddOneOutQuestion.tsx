import { useState } from 'react'
import { type RuntimeOddOneOut } from '../../data/exercises'

interface Props {
  exercise: RuntimeOddOneOut
  onCorrect: () => void
}

export default function OddOneOutQuestion({ exercise, onCorrect }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [shakingIndex, setShakingIndex]   = useState<number | null>(null)
  const [done, setDone]                   = useState(false)

  function handleTap(index: number) {
    if (done || shakingIndex !== null) return
    const item = exercise.items[index]

    if (item.isOdd) {
      setSelectedIndex(index)
      setDone(true)
      setTimeout(onCorrect, 1100)
    } else {
      setShakingIndex(index)
      setTimeout(() => setShakingIndex(null), 600)
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
      <p
        style={{
          textAlign: 'center',
          color: '#1A1A2E',
          fontWeight: 700,
          fontSize: '18px',
          fontFamily: 'Nunito, sans-serif',
          margin: 0,
          padding: '0 16px',
        }}
      >
        {exercise.question}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          width: '100%',
          maxWidth: '360px',
          padding: '0 8px',
          boxSizing: 'border-box',
        }}
      >
        {exercise.items.map((item, index) => {
          const isCorrectPicked = done && item.isOdd && index === selectedIndex
          const isGroupMember   = done && !item.isOdd
          const isShaking       = shakingIndex === index

          return (
            <button
              key={index}
              onClick={() => handleTap(index)}
              className={isShaking ? 'animate-shake' : ''}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 8px',
                borderRadius: '20px',
                border: `2.5px solid ${
                  isCorrectPicked ? '#22C55E' : isGroupMember ? 'rgba(11,175,190,0.3)' : '#E5E7EB'
                }`,
                background: isCorrectPicked
                  ? '#F0FDF4'
                  : isGroupMember
                    ? 'rgba(11,175,190,0.08)'
                    : '#ffffff',
                cursor: done ? 'default' : 'pointer',
                minHeight: '118px',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: '40px', lineHeight: 1, userSelect: 'none' }}>
                {item.emoji}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isCorrectPicked ? '#15803D' : '#0F172A',
                  fontFamily: 'Nunito, sans-serif',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </span>
              {isCorrectPicked && (
                <div
                  style={{
                    position: 'absolute', top: '6px', right: '8px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
