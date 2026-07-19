import { useState } from 'react'
import { type RuntimeOddOneOut } from '../../data/exercises'
import { type WorldPalette } from '../../lib/worldColors'
import { useIsMobile } from '../../hooks/useIsMobile'
import { optionGrid } from './optionGrid'
import ExerciseCard, { type CardState } from './ExerciseCard'

interface Props {
  exercise: RuntimeOddOneOut
  onAttempt: (r: { success: boolean; isFinal: boolean }) => void
  palette?: WorldPalette
}

const SHAKE_RESET_MS = 550

export default function OddOneOutQuestion({ exercise, onAttempt, palette }: Props) {
  const isMobile = useIsMobile()
  const layout = optionGrid(exercise.items.length, isMobile)

  const [states, setStates] = useState<CardState[]>(() => exercise.items.map(() => 'idle'))
  const [wrongCount, setWrongCount] = useState(0)
  const [locked, setLocked] = useState(false)

  const oddIndex = exercise.items.findIndex(it => it.isOdd)

  function handleTap(i: number) {
    if (locked) return
    if (states[i] !== 'idle') return

    if (exercise.items[i].isOdd) {
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

    if (nextWrong >= 2 && oddIndex >= 0) {
      setLocked(true)
      setTimeout(() => {
        setStates(prev => prev.map((s, j) => j === oddIndex ? 'revealed' : s))
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
        {exercise.items.map((item, i) => {
          const isHandled = states[i] === 'correct' || states[i] === 'revealed'
          const dimmed = someoneWon && !isHandled
          return (
            <div key={i} style={layout.itemStyle(i)}>
              <ExerciseCard
                imageUrl={item.imageUrl}
                label={item.label}
                state={states[i]}
                dimmed={dimmed}
                disabled={locked || states[i] !== 'idle'}
                onTap={() => handleTap(i)}
                enterDelay={i * 60}
                maxWidth={layout.cardMaxWidth}
                palette={palette}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
