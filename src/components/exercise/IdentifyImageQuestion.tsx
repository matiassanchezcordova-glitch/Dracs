import { useState } from 'react'
import { type RuntimeVocabulary } from '../../data/exercises'
import { useIsMobile } from '../../hooks/useIsMobile'
import { optionGrid } from './optionGrid'
import ExerciseCard, { type CardState } from './ExerciseCard'

interface Props {
  exercise: RuntimeVocabulary
  onAttempt: (r: { success: boolean; isFinal: boolean }) => void
}

const SHAKE_RESET_MS = 550

export default function IdentifyImageQuestion({ exercise, onAttempt }: Props) {
  const isMobile = useIsMobile()
  const layout = optionGrid(exercise.options.length, isMobile)

  const [states, setStates] = useState<CardState[]>(() => exercise.options.map(() => 'idle'))
  const [wrongCount, setWrongCount] = useState(0)
  const [locked, setLocked] = useState(false)
  const [revealedLabel, setRevealedLabel] = useState<string | null>(null)

  function handleTap(i: number) {
    if (locked) return
    if (states[i] !== 'idle') return

    if (i === exercise.correctIndex) {
      setLocked(true)
      setStates(prev => prev.map((s, j) => j === i ? 'correct' : s))
      onAttempt({ success: true, isFinal: true })
      return
    }

    const nextWrong = wrongCount + 1
    setWrongCount(nextWrong)
    setStates(prev => prev.map((s, j) => j === i && s === 'idle' ? 'shake' : s))
    setTimeout(() => {
      setStates(prev => prev.map((s, j) => j === i && s === 'shake' ? 'idle' : s))
    }, SHAKE_RESET_MS)

    if (nextWrong >= 2) {
      setLocked(true)
      setTimeout(() => {
        setStates(prev => prev.map((s, j) => j === exercise.correctIndex ? 'revealed' : s))
        setRevealedLabel(exercise.options[exercise.correctIndex].label)
        onAttempt({ success: false, isFinal: true })
      }, SHAKE_RESET_MS)
    } else {
      onAttempt({ success: false, isFinal: false })
    }
  }

  const someoneWon = states.some(s => s === 'correct' || s === 'revealed')

  return (
    <div style={{ width: '100%' }}>
      <div style={{ ...layout.container, width: '100%' }}>
        {exercise.options.map((opt, i) => {
          const isHandled = states[i] === 'correct' || states[i] === 'revealed'
          const dimmed = someoneWon && !isHandled
          return (
            <div key={i} style={layout.itemStyle(i)}>
              <ExerciseCard
                imageUrl={opt.imageUrl}
                label={opt.label}
                state={states[i]}
                dimmed={dimmed}
                disabled={locked || states[i] !== 'idle'}
                onTap={() => handleTap(i)}
                enterDelay={i * 60}
                maxWidth={layout.cardMaxWidth}
              />
            </div>
          )
        })}
      </div>
      {revealedLabel && (
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'Nunito, sans-serif',
            color: '#047857',
            fontWeight: 700,
            fontSize: '15px',
            marginTop: '20px',
          }}
        >
          Era la {revealedLabel}. ¡La próxima la atrapamos!
        </p>
      )}
    </div>
  )
}
