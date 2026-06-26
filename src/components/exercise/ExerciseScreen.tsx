import { useState, useEffect, useRef } from 'react'
import { Volume2, X } from 'lucide-react'
import { type RuntimeExercise, type RuntimeFillBlank } from '../../data/exercises'
import { useUiAudios } from '../../hooks/useUiAudios'
import IdentifyImageQuestion from './IdentifyImageQuestion'
import SequenceQuestion from './SequenceQuestion'
import OddOneOutQuestion from './OddOneOutQuestion'
import FillBlankQuestion from './FillBlankQuestion'

interface Props {
  exercises: RuntimeExercise[]
  childName: string
  sessionNumber: number
  onComplete: (correct: number, total: number) => void
  onExit: () => void
}

// ── Feedback pools ──────────────────────────────────────────────────────────

const PRAISE_POOL = ['¡Bien!', '¡Lo lograste!', '¡Genial!', '¡Crack!', '¡Eso es!', '¡Increíble!']
const ENCOURAGE_POOL = ['Mirá bien', 'Casi', 'Probá otra vez', 'Estás cerca']

function pickRandom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Header pieces ───────────────────────────────────────────────────────────

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <span
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 800,
          fontSize: '13px',
          color: '#0BAFBE',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.3px',
        }}
      >
        {value}/{total}
      </span>
      <div
        style={{
          width: '100%',
          height: '6px',
          background: '#E5F4F6',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: '#0BAFBE',
            borderRadius: '999px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  )
}

// Sentence with fillable blank, rendered for fill_blank exercises in the header.
function FillBlankSentence({
  exercise, filledWord,
}: { exercise: RuntimeFillBlank; filledWord: string | null }) {
  const [before, after] = exercise.sentence.split('___')
  return (
    <span style={{ display: 'inline' }}>
      {before}
      {filledWord ? (
        <span
          style={{
            color: '#047857',
            fontWeight: 800,
            margin: '0 6px',
            borderBottom: '2px solid #10B981',
            padding: '0 6px',
            transition: 'all 0.2s ease',
          }}
        >
          {filledWord}
        </span>
      ) : (
        <span
          style={{
            display: 'inline-block',
            minWidth: '90px',
            margin: '0 6px',
            padding: '0 10px',
            borderBottom: '2px solid #F59E0B',
            background: '#FEF3C7',
            borderRadius: '6px',
            color: 'transparent',
            userSelect: 'none',
            verticalAlign: 'middle',
          }}
        >
          ___
        </span>
      )}
      {after}
    </span>
  )
}

// ── Exit confirm dialog (inline) ────────────────────────────────────────────

function ExitConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', zIndex: 200,
      }}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: '20px',
          padding: '28px 24px', maxWidth: '340px', width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          textAlign: 'center', fontFamily: 'Nunito, sans-serif',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#1F2937' }}>
          ¿Querés terminar el juego?
        </h3>
        <p style={{ margin: '0 0 22px', fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
          Perderás el progreso de esta partida.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onConfirm}
            style={{
              height: '46px', borderRadius: '14px', border: 'none',
              background: '#F59E0B', color: '#FFFFFF',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Sí, terminar
          </button>
          <button
            onClick={onCancel}
            style={{
              height: '46px', borderRadius: '14px',
              border: '1.5px solid #E5E7EB', background: '#FFFFFF',
              color: '#1F2937', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Seguir jugando
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function ExerciseScreen({
  exercises, childName, sessionNumber, onComplete, onExit,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedbackText, setFeedbackText] = useState<string | null>(null)
  const [filledWord, setFilledWord] = useState<string | null>(null)
  const [showExit, setShowExit] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { playCorrect, playIncorrect } = useUiAudios()

  const current = exercises[currentIndex]
  const total   = exercises.length

  // Single shared Audio instance for the whole screen (prompt + feedback).
  useEffect(() => {
    audioRef.current = new Audio()
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  function playAudio(url: string | null | undefined) {
    if (!url || !audioRef.current) return
    try {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.src = url
      audioRef.current.play().catch(() => { /* autoplay policy or net error — silent */ })
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    setFeedbackText(null)
    setFilledWord(null)
    // Autoplay the prompt audio when a new game appears.
    playAudio(current?.audioUrl)
  }, [currentIndex])

  function advance(success: boolean) {
    const nextCorrect = correctCount + (success ? 1 : 0)
    if (success) setCorrectCount(nextCorrect)
    const next = currentIndex + 1
    if (next >= total) {
      onComplete(nextCorrect, total)
    } else {
      setCurrentIndex(next)
    }
  }

  function handleAttempt({ success, isFinal }: { success: boolean; isFinal: boolean }) {
    if (success) {
      playAudio(playCorrect())
      setFeedbackText(pickRandom(PRAISE_POOL))
      setTimeout(() => advance(true), 1700)
    } else if (!isFinal) {
      playAudio(playIncorrect())
      const msg = pickRandom(ENCOURAGE_POOL)
      setFeedbackText(msg)
      setTimeout(() => setFeedbackText(curr => curr === msg ? null : curr), 1200)
    } else {
      // Sequence final fail (no reveal). For other types, the sub-component
      // shows its own "Era la {label}" line and we just advance.
      setFeedbackText(null)
      setTimeout(() => advance(false), 1500)
    }
  }

  function handleFillBlankFilled(word: string) {
    setFilledWord(word)
  }

  if (!current) return null

  // Compute the heading text per exercise type.
  let heading: React.ReactNode
  if (current.type === 'fill_blank') {
    heading = <FillBlankSentence exercise={current} filledWord={filledWord} />
  } else if (current.type === 'odd_one_out' || current.type === 'sequence') {
    heading = current.question || current.promptOriginal || current.prompt
  } else {
    heading = current.promptOriginal || current.prompt
  }

  const audioAvailable = !!current.audioUrl

  function handlePlayAudio() {
    playAudio(current.audioUrl)
  }

  return (
    <div
      style={{
        flex: 1,
        background: '#E0F2FE',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: '100%',
        position: 'relative',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      {/* Inline animations + shake keyframes for ExerciseCard */}
      <style>{`
        @keyframes exercise-card-enter {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes exercise-card-pop {
          0%   { transform: scale(1); }
          45%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes exercise-soft-shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-4px); }
          40%       { transform: translateX(4px); }
          60%       { transform: translateX(-3px); }
          80%       { transform: translateX(3px); }
        }
        .exercise-card-shake { animation: exercise-soft-shake 0.4s ease-in-out; }
        @keyframes exercise-feedback-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Close button */}
      <button
        type="button"
        aria-label="Terminar"
        onClick={() => setShowExit(true)}
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid #E5E7EB',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#6B7280',
          zIndex: 10,
        }}
      >
        <X size={18} />
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: '24px 24px 64px',
          gap: '20px',
          flex: 1,
        }}
      >
        {/* Header — progress + heading + audio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' }}>
          <ProgressBar value={currentIndex + 1} total={total} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            <h1
              key={currentIndex}
              style={{
                margin: 0,
                fontFamily: 'Nunito, sans-serif',
                fontSize: 'clamp(22px, 4.4vw, 30px)',
                fontWeight: 800,
                color: '#1F2937',
                textAlign: 'center',
                lineHeight: 1.25,
                animation: 'exercise-feedback-in 0.3s ease',
              }}
            >
              {heading}
            </h1>

            {audioAvailable && (
              <button
                type="button"
                aria-label="Escuchar consigna"
                onClick={handlePlayAudio}
                style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1.5px solid #E5E7EB',
                  cursor: 'pointer',
                  color: '#0BAFBE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Volume2 size={20} />
              </button>
            )}
          </div>

          {/* Feedback toast (random praise/encourage) */}
          <div style={{ minHeight: '24px', display: 'flex', justifyContent: 'center' }}>
            {feedbackText && (
              <span
                key={feedbackText + currentIndex}
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 800,
                  fontSize: '17px',
                  color: PRAISE_POOL.includes(feedbackText) ? '#10B981' : '#F59E0B',
                  animation: 'exercise-feedback-in 0.25s ease',
                }}
              >
                {feedbackText}
              </span>
            )}
          </div>
        </div>

        {/* Body — dispatched by type */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8px' }}>
          {current.type === 'vocabulary' && (
            <IdentifyImageQuestion
              key={current.id + ':' + currentIndex}
              exercise={current}
              onAttempt={handleAttempt}
            />
          )}
          {current.type === 'sequence' && (
            <SequenceQuestion
              key={current.id + ':' + currentIndex}
              exercise={current}
              onAttempt={handleAttempt}
            />
          )}
          {current.type === 'odd_one_out' && (
            <OddOneOutQuestion
              key={current.id + ':' + currentIndex}
              exercise={current}
              onAttempt={handleAttempt}
            />
          )}
          {current.type === 'fill_blank' && (
            <FillBlankQuestion
              key={current.id + ':' + currentIndex}
              exercise={current}
              onAttempt={handleAttempt}
              onFilled={handleFillBlankFilled}
            />
          )}
        </div>
      </div>

      {showExit && (
        <ExitConfirm
          onCancel={() => setShowExit(false)}
          onConfirm={() => { setShowExit(false); onExit() }}
        />
      )}

      {/* childName + sessionNumber currently unused in the new layout, kept in
          props for future surface (header avatar). Reference them so TS does
          not complain about unused props. */}
      <span style={{ display: 'none' }}>{childName} #{sessionNumber}</span>
    </div>
  )
}
