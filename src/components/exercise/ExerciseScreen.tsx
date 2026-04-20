import { useState, useEffect } from 'react'
import { type RuntimeExercise, type Level } from '../../data/exercises'
import AnswerCard, { type CardState } from './AnswerCard'
import SequenceQuestion from './SequenceQuestion'
import OddOneOutQuestion from './OddOneOutQuestion'
import FillBlankQuestion from './FillBlankQuestion'

interface Props {
  exercises: RuntimeExercise[]
  childName: string
  level: Level
  sessionNumber: number
  onComplete: (correct: number, total: number) => void
}

type FeedbackMessage = { text: string; isPositive: boolean } | null

// ── Helpers ───────────────────────────────────────────────────────────────

const CATEGORY_BY_LEVEL: Record<Level, string> = {
  1: 'Vocabulario · Cuerpo y hogar',
  2: 'Vocabulario · Animales y alimentos',
  3: 'Vocabulario · Acciones y objetos',
  4: 'Vocabulario · Conceptos avanzados',
}

function nameToEmoji(name: string): string {
  const emojis = ['🧒', '👦', '👧', '🌟', '⭐', '🌈', '🦋', '🐬']
  return emojis[name.charCodeAt(0) % emojis.length]
}

// ── Confetti ──────────────────────────────────────────────────────────────

interface ConfettiDot { id: number; x: number; color: string; delay: number; size: number }

function Confetti() {
  const dots: ConfettiDot[] = [
    { id: 0, x: 12,  color: '#FFD93D', delay: 0,   size: 10 },
    { id: 1, x: 25,  color: '#0BAFBE', delay: 60,  size: 14 },
    { id: 2, x: 40,  color: '#22C55E', delay: 30,  size: 8  },
    { id: 3, x: 55,  color: '#F87171', delay: 90,  size: 12 },
    { id: 4, x: 68,  color: '#FFD93D', delay: 20,  size: 10 },
    { id: 5, x: 80,  color: '#0BAFBE', delay: 70,  size: 14 },
    { id: 6, x: 92,  color: '#22C55E', delay: 40,  size: 8  },
  ]
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 20,
      }}
    >
      {dots.map(d => (
        <div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: '-16px',
            width: `${d.size}px`,
            height: `${d.size}px`,
            borderRadius: '50%',
            backgroundColor: d.color,
            animation: `confettiFall 1.1s ease-in ${d.delay}ms forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: 1; }
          100% { transform: translateY(280px) rotate(400deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function ExerciseScreen({ exercises, childName, level, sessionNumber, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardStates, setCardStates]     = useState<CardState[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback]         = useState<FeedbackMessage>(null)
  const [locked, setLocked]             = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [dragonJumping, setDragonJumping] = useState(false)

  const current = exercises[currentIndex]
  const total   = exercises.length

  useEffect(() => {
    if (!current) return
    setCardStates(current.type === 'vocabulary' ? current.options.map(() => 'idle') : [])
    setFeedback(null)
    setLocked(false)
    setShowConfetti(false)
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCorrect() {
    const newCount = correctCount + 1
    setCorrectCount(newCount)
    setLocked(true)
    setFeedback({ text: '¡Muy bien!', isPositive: true })
    setShowConfetti(true)
    setDragonJumping(true)
    setTimeout(() => setDragonJumping(false), 750)
    setTimeout(() => {
      const next = currentIndex + 1
      if (next >= total) onComplete(newCount, total)
      else setCurrentIndex(next)
    }, 1400)
  }

  function handleVocabCardTap(optionIndex: number) {
    if (locked || !current || current.type !== 'vocabulary') return

    const isCorrect = optionIndex === current.correctIndex
    const state = cardStates[optionIndex]

    if (isCorrect) {
      setCardStates(prev => prev.map((s, i) => (i === optionIndex ? 'correct' : s)))
      handleCorrect()
    } else {
      if (state === 'idle') {
        setCardStates(prev => prev.map((s, i) => (i === optionIndex ? 'shake' : s)))
        setFeedback({ text: '¡Tú puedes!', isPositive: false })
        setTimeout(() => {
          setCardStates(prev =>
            prev.map((s, i) => (i === optionIndex && s === 'shake' ? 'attempted' : s)),
          )
        }, 500)
      } else if (state === 'attempted') {
        setCardStates(prev => prev.map((s, i) => (i === optionIndex ? 'wrong' : s)))
        setFeedback({ text: '¡Tú puedes!', isPositive: false })
      }
    }
  }

  if (!current) return null

  const progressPct = (currentIndex / total) * 100
  const childEmoji  = nameToEmoji(childName)
  const category    = CATEGORY_BY_LEVEL[level]
  const cols = current.type === 'vocabulary'
    ? (current.options.length === 2 ? 2 : current.options.length === 3 ? 3 : 2)
    : 2

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '12px 16px 16px',
        gap: '12px',
        position: 'relative',
        minHeight: '100%',
      }}
    >
      {showConfetti && <Confetti />}

      {/* ── Progress header ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '18px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          {childEmoji}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', fontFamily: 'Nunito, sans-serif' }}>
            {childName}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', fontFamily: 'Nunito, sans-serif' }}>
            Sesión {sessionNumber}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            height: '10px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.9), #FFD93D)',
              borderRadius: '99px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        <span style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>
          {currentIndex + 1}/{total}
        </span>
      </div>

      {/* ── Vocabulary word card ─────────────────────────────────────── */}
      {current.type === 'vocabulary' && (
        <div
          style={{
            background: 'rgba(0,0,0,0.28)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px',
            padding: '20px 24px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg
            style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.07, pointerEvents: 'none' }}
            width="120" height="120" viewBox="0 0 120 120"
          >
            <circle cx="60" cy="60" r="55" fill="none" stroke="#ffffff" strokeWidth="20" />
          </svg>

          <div
            key={currentIndex}
            style={{
              fontSize: '44px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.04em',
              lineHeight: 1,
              fontFamily: 'Nunito, sans-serif',
              animation: 'wordSlideDown 0.32s ease',
            }}
          >
            {current.word}
          </div>

          <span
            style={{
              padding: '3px 12px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'Nunito, sans-serif',
              letterSpacing: '0.3px',
            }}
          >
            {category}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  backgroundColor: '#FFD93D',
                  animation: 'aiPulse 1.6s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>
                IA adaptándose...
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontFamily: 'Nunito, sans-serif' }}>
              Encuentra la imagen correcta
            </span>
          </div>
        </div>
      )}

      {/* ── Feedback area (all types) ────────────────────────────────── */}
      <div style={{ minHeight: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {feedback && (
          <span
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: feedback.isPositive ? '#22C55E' : '#FFD93D',
              fontFamily: 'Nunito, sans-serif',
              animation: 'wordSlideDown 0.25s ease',
            }}
          >
            {feedback.text}
          </span>
        )}
      </div>

      {/* ── Exercise content (type-dispatched) ──────────────────────── */}
      {current.type === 'vocabulary' && (
        <div
          key={currentIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '12px',
            flex: 1,
          }}
        >
          {current.options.map((option, i) => (
            <AnswerCard
              key={`${current.id}-${i}`}
              option={option}
              state={cardStates[i] ?? 'idle'}
              onTap={() => handleVocabCardTap(i)}
              enterDelay={i * 60}
            />
          ))}
        </div>
      )}

      {current.type === 'sequence' && (
        <SequenceQuestion
          key={currentIndex}
          exercise={current}
          onCorrect={handleCorrect}
        />
      )}

      {current.type === 'odd_one_out' && (
        <OddOneOutQuestion
          key={currentIndex}
          exercise={current}
          onCorrect={handleCorrect}
        />
      )}

      {current.type === 'fill_blank' && (
        <FillBlankQuestion
          key={currentIndex}
          exercise={current}
          onCorrect={handleCorrect}
        />
      )}

      {/* ── Dragon ───────────────────────────────────────────────────── */}
      <img
        src="/dragon.nb.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '18px',
          right: '18px',
          height: '100px',
          width: 'auto',
          pointerEvents: 'none',
          zIndex: 5,
          animation: dragonJumping
            ? 'dragonJump 0.75s ease'
            : 'dragonBlink 8s ease-in-out infinite',
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  )
}
