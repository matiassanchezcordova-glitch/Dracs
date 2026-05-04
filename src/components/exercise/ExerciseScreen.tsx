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

  const progressPct  = (currentIndex / total) * 100
  const childInitial = childName.charAt(0).toUpperCase()
  const category     = CATEGORY_BY_LEVEL[level]
  const cols = current.type === 'vocabulary'
    ? (current.options.length === 2 ? 2 : current.options.length === 3 ? 3 : 2)
    : 2

  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(145deg, #FFF8E8 0%, #E8F8FF 40%, #E0F9F0 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: '100%',
    }}>
    {showConfetti && <Confetti />}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '12px 16px 100px',
        gap: '12px',
        position: 'relative',
        flex: 1,
      }}
    >

      {/* ── Progress header ─────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #F1F5F9',
          borderRadius: '18px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#FFD93D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '16px', color: '#1A1A2E' }}>
            {childInitial}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif' }}>
            {childName}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
            Sesión {sessionNumber}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            height: '8px',
            backgroundColor: '#F0FAFA',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #0BAFBE, #FFD93D)',
              borderRadius: '99px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        <span style={{ fontSize: '22px', fontWeight: 700, color: '#0BAFBE', fontFamily: 'Playfair Display, serif', flexShrink: 0 }}>
          {currentIndex + 1}/{total}
        </span>
      </div>

      {/* ── Vocabulary word card ─────────────────────────────────────── */}
      {current.type === 'vocabulary' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0BAFBE 0%, #0891A0 100%)',
            borderRadius: '20px',
            padding: '32px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              padding: '4px 14px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.20)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Nunito, sans-serif',
              letterSpacing: '0.3px',
            }}
          >
            {category}
          </span>

          <div
            key={currentIndex}
            style={{
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              fontFamily: 'Playfair Display, serif',
              animation: 'wordSlideDown 0.32s ease',
              textAlign: 'center',
            }}
          >
            {current.word}
          </div>

          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Nunito, sans-serif', fontWeight: 500 }}>
            Encuentra la imagen correcta
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <div
              style={{
                width: '7px', height: '7px', borderRadius: '50%',
                backgroundColor: '#ffffff',
                animation: 'aiPulse 1.6s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>
              IA adaptándose...
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
          height: '110px',
          width: 'auto',
          pointerEvents: 'none',
          zIndex: 5,
          animation: dragonJumping
            ? 'dragonJump 0.75s ease'
            : 'floatDragon 3s ease-in-out infinite',
          transformOrigin: 'bottom center',
        }}
      />
    </div>
    </div>
  )
}
