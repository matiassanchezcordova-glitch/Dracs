import { useState } from 'react'
import { type RuntimeSequence } from '../../data/exercises'
import { type WorldPalette } from '../../lib/worldColors'
import { useIsMobile } from '../../hooks/useIsMobile'
import { optionGrid } from './optionGrid'
import ExerciseCard, { type CardState } from './ExerciseCard'

interface Props {
  exercise: RuntimeSequence
  onAttempt: (r: { success: boolean; isFinal: boolean }) => void
  palette?: WorldPalette
}

const SHAKE_RESET_MS = 700

export default function SequenceQuestion({ exercise, onAttempt, palette }: Props) {
  const isMobile = useIsMobile()
  const layout = optionGrid(exercise.items.length, isMobile)

  const [selectedOrder, setSelectedOrder] = useState<number[]>([])
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [locked, setLocked] = useState(false)
  const [cardStates, setCardStates] = useState<CardState[]>(() => exercise.items.map(() => 'idle'))

  function handleTap(displayIndex: number) {
    if (locked || shaking) return

    // Toggle: clic en una imagen ya seleccionada la deselecciona y la saca de
    // la secuencia (así el niño corrige un misclick). Los números de orden de
    // las que siguen se recalculan solos (badge = posición en selectedOrder).
    if (selectedOrder.includes(displayIndex)) {
      setSelectedOrder(prev => prev.filter(di => di !== displayIndex))
      return
    }

    const newOrder = [...selectedOrder, displayIndex]
    setSelectedOrder(newOrder)

    if (newOrder.length < exercise.items.length) return

    // Sequence complete — validate
    const originalIndices = newOrder.map(di => exercise.items[di].originalIndex)
    const isCorrect = exercise.correctOrder.every((oi, pos) => originalIndices[pos] === oi)

    if (isCorrect) {
      setLocked(true)
      setCardStates(exercise.items.map(() => 'correct'))
      onAttempt({ success: true, isFinal: true })
      return
    }

    // Wrong sequence
    const nextWrong = wrongAttempts + 1
    setWrongAttempts(nextWrong)
    setShaking(true)
    setCardStates(exercise.items.map((_, idx) => (newOrder.includes(idx) ? 'shake' : 'idle')))

    if (nextWrong >= 2) {
      // Accept and move on — NO reveal of correct order.
      setLocked(true)
      setTimeout(() => {
        setShaking(false)
        onAttempt({ success: false, isFinal: true })
      }, SHAKE_RESET_MS)
    } else {
      // Reset selection so the child can try again.
      setTimeout(() => {
        setShaking(false)
        setSelectedOrder([])
        setCardStates(exercise.items.map(() => 'idle'))
      }, SHAKE_RESET_MS)
      onAttempt({ success: false, isFinal: false })
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ ...layout.container, width: '100%' }}>
        {exercise.items.map((item, displayIndex) => {
          const tapPosition = selectedOrder.indexOf(displayIndex)
          const isSelected  = tapPosition !== -1
          const allCorrect  = cardStates[displayIndex] === 'correct'
          return (
            <div key={displayIndex} style={layout.itemStyle(displayIndex)}>
              <ExerciseCard
                imageUrl={item.imageUrl}
                label={item.label}
                state={cardStates[displayIndex]}
                dimmed={false}
                badge={isSelected ? tapPosition + 1 : (allCorrect ? displayIndex + 1 : undefined)}
                disabled={locked}
                onTap={() => handleTap(displayIndex)}
                enterDelay={displayIndex * 60}
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
