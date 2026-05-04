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
  const [hoveredIndex, setHoveredIndex]     = useState<number | null>(null)
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
          fontSize: '20px',
          fontWeight: 700,
          color: '#1A1A2E',
          fontFamily: 'Nunito, sans-serif',
          lineHeight: 1.6,
          padding: '0 24px',
        }}
      >
        {before}
        {correctWord ? (
          <span
            style={{
              color: '#D97706',
              textDecoration: 'underline',
              textDecorationColor: '#D97706',
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
              borderBottom: '2px solid #D97706',
              background: '#FFF3CD',
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
          const isHovered = hoveredIndex === index && !correctWord && shakingIndex === null
          return (
            <button
              key={index}
              onClick={() => handleTap(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={shakingIndex === index ? 'animate-shake' : ''}
              style={{
                padding: '14px 30px',
                borderRadius: '999px',
                border: `2px solid ${isCorrectFilled ? '#22C55E' : isHovered ? '#0BAFBE' : '#E5E7EB'}`,
                background: isCorrectFilled ? '#F0FDF4' : isHovered ? '#F0FAFA' : '#ffffff',
                color: isCorrectFilled ? '#15803D' : '#1A1A2E',
                fontSize: '16px',
                fontWeight: 700,
                cursor: correctWord ? 'default' : 'pointer',
                fontFamily: 'Nunito, sans-serif',
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
