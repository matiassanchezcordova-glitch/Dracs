import { useRef, useState } from 'react'
import { type RuntimeFillBlank } from '../../data/exercises'

interface Props {
  exercise: RuntimeFillBlank
  onCorrect: () => void
}

export default function FillBlankQuestion({ exercise, onCorrect }: Props) {
  const [displayedChars, setDisplayedChars] = useState(0)
  const [correctWord, setCorrectWord]       = useState<string | null>(null)
  const [shakingIndex, setShakingIndex]     = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function handleTap(index: number) {
    if (correctWord || shakingIndex !== null) return

    if (index === exercise.correctIndex) {
      const word = exercise.options[index]
      setCorrectWord(word)

      let chars = 0
      const delay = Math.max(25, Math.round(220 / word.length))
      intervalRef.current = setInterval(() => {
        chars++
        setDisplayedChars(chars)
        if (chars >= word.length) {
          clearInterval(intervalRef.current!)
          setTimeout(onCorrect, 500)
        }
      }, delay)
    } else {
      setShakingIndex(index)
      setTimeout(() => setShakingIndex(null), 600)
    }
  }

  const [before, after] = exercise.sentence.split('___')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        padding: '16px 0 16px',
        flex: 1,
      }}
    >
      {/* Sentence */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'Nunito, sans-serif',
          lineHeight: 1.6,
          padding: '0 24px',
        }}
      >
        {before}
        {correctWord ? (
          <span
            style={{
              color: '#22C55E',
              textDecoration: 'underline',
              textDecorationThickness: '2px',
              margin: '0 4px',
            }}
          >
            {correctWord.slice(0, displayedChars)}
          </span>
        ) : (
          <span
            style={{
              display: 'inline-block',
              minWidth: '80px',
              borderBottom: '3px solid #FFD93D',
              background: 'rgba(255,217,61,0.18)',
              borderRadius: '6px',
              padding: '2px 10px',
              margin: '0 6px',
              color: 'transparent',
              userSelect: 'none',
            }}
          >
            _____
          </span>
        )}
        {after}
      </div>

      {/* Options */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          padding: '0 16px',
        }}
      >
        {exercise.options.map((option, index) => {
          const isCorrectFilled = correctWord !== null && index === exercise.correctIndex
          return (
            <button
              key={index}
              onClick={() => handleTap(index)}
              className={shakingIndex === index ? 'animate-shake' : ''}
              style={{
                padding: '14px 30px',
                borderRadius: '999px',
                border: `2px solid ${isCorrectFilled ? '#22C55E' : 'rgba(255,255,255,0.35)'}`,
                background: isCorrectFilled ? 'rgba(240,253,244,0.95)' : 'rgba(255,255,255,0.92)',
                color: isCorrectFilled ? '#15803D' : '#0F172A',
                fontSize: '20px',
                fontWeight: 800,
                cursor: correctWord ? 'default' : 'pointer',
                fontFamily: 'Nunito, sans-serif',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                boxShadow: isCorrectFilled ? '0 4px 16px rgba(34,197,94,0.2)' : 'none',
              }}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
