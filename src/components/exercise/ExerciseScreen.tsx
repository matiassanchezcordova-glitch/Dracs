import { useState, useEffect } from 'react'
import { type RuntimeExercise } from '../../data/exercises'
import AnswerCard, { type CardState } from './AnswerCard'

interface Props {
  exercises: RuntimeExercise[]
  onComplete: (correct: number, total: number) => void
}

type FeedbackMessage = { text: string; isPositive: boolean } | null

export default function ExerciseScreen({ exercises, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardStates, setCardStates] = useState<CardState[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackMessage>(null)
  const [locked, setLocked] = useState(false)

  const current = exercises[currentIndex]
  const total = exercises.length

  // Reset state when the exercise changes
  useEffect(() => {
    if (!current) return
    setCardStates(current.options.map(() => 'idle'))
    setFeedback(null)
    setLocked(false)
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCardTap(optionIndex: number) {
    if (locked || !current) return

    const isCorrect = optionIndex === current.correctIndex
    const state = cardStates[optionIndex]

    if (isCorrect) {
      const newCorrectCount = correctCount + 1
      setCorrectCount(newCorrectCount)
      setLocked(true)
      setCardStates(prev => prev.map((s, i) => (i === optionIndex ? 'correct' : s)))
      setFeedback({ text: '¡Muy bien! 🎉', isPositive: true })

      setTimeout(() => {
        const next = currentIndex + 1
        if (next >= total) {
          onComplete(newCorrectCount, total)
        } else {
          setCurrentIndex(next)
        }
      }, 1200)
    } else {
      // Wrong answer logic
      if (state === 'idle') {
        // First wrong tap → shake, keep unlocked
        setCardStates(prev => prev.map((s, i) => (i === optionIndex ? 'shake' : s)))
        setFeedback({ text: '¡Tú puedes! 💪', isPositive: false })
        // After shake animation (~500ms), move to 'attempted' state (no red yet)
        setTimeout(() => {
          setCardStates(prev =>
            prev.map((s, i) => (i === optionIndex && s === 'shake' ? 'attempted' : s)),
          )
        }, 500)
      } else if (state === 'attempted') {
        // Second wrong tap → show red border
        setCardStates(prev => prev.map((s, i) => (i === optionIndex ? 'wrong' : s)))
        setFeedback({ text: '¡Tú puedes! 💪', isPositive: false })
      }
      // state === 'wrong' → no further change, user must find correct
    }
  }

  if (!current) return null

  const progressPct = (currentIndex / total) * 100
  const cols = current.options.length === 2 ? 2 : current.options.length === 3 ? 3 : 2

  return (
    <div
      className="flex flex-col w-full max-w-md mx-auto px-4 py-6 gap-5"
      style={{ minHeight: '100%' }}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-3 overflow-hidden"
          style={{ backgroundColor: '#E0F2FE', borderRadius: '99px' }}
        >
          <div
            className="h-full"
            style={{
              width: `${progressPct}%`,
              backgroundColor: '#0EA5E9',
              borderRadius: '99px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <span className="font-black text-sm" style={{ color: '#64748B', minWidth: '36px' }}>
          {currentIndex + 1}/{total}
        </span>
      </div>

      {/* Word card */}
      <div
        className="flex flex-col items-center justify-center py-8 px-6 text-center shadow-md"
        style={{ backgroundColor: '#0EA5E9', borderRadius: '24px' }}
      >
        <span
          className="font-black text-white"
          style={{ fontSize: '52px', lineHeight: 1, letterSpacing: '0.02em' }}
        >
          {current.word}
        </span>
        <span
          className="font-semibold mt-2"
          style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}
        >
          Encuentra la imagen correcta
        </span>
      </div>

      {/* Feedback message – fixed height so layout doesn't shift */}
      <div className="flex items-center justify-center" style={{ minHeight: '36px' }}>
        {feedback && (
          <span
            className="font-black text-xl"
            style={{ color: feedback.isPositive ? '#22C55E' : '#FBBF24' }}
          >
            {feedback.text}
          </span>
        )}
      </div>

      {/* Answer grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {current.options.map((option, i) => (
          <AnswerCard
            key={`${current.id}-${i}`}
            option={option}
            state={cardStates[i] ?? 'idle'}
            onTap={() => handleCardTap(i)}
          />
        ))}
      </div>
    </div>
  )
}
