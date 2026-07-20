import { useState, useEffect, useRef } from 'react'
import { Volume2, X } from 'lucide-react'
import { type RuntimeExercise, type RuntimeFillBlank } from '../../data/exercises'
import { type WorldPalette, getPaletteForHotspot } from '../../lib/worldColors'
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
  palette?: WorldPalette
}

// ── Feedback pools ──────────────────────────────────────────────────────────

const PRAISE_POOL = ['¡Bien!', '¡Lo lograste!', '¡Genial!', '¡Crack!', '¡Eso es!', '¡Increíble!']
const ENCOURAGE_POOL = ['Mira bien', 'Casi', 'Prueba otra vez', 'Estás cerca']
// Fallo definitivo: mensaje de ánimo para pasar de partida (sin describir la
// imagen ni revelar la respuesta con texto).
const MOVE_ON_POOL = ['¡Seguimos!', '¡La próxima!', '¡Vamos que se puede!']

function pickRandom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Header pieces ───────────────────────────────────────────────────────────

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
          ¿Quieres terminar el juego?
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
  exercises, childName, sessionNumber, onComplete, onExit, palette,
}: Props) {
  const pal = palette ?? getPaletteForHotspot(undefined)
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
    // Autoplay the prompt audio when a new game appears. En el primer juego
    // demoramos ~1.8s para no pisar el intro del hotspot (que suena al montar).
    const delay = currentIndex === 0 ? 1400 : 0
    const timer = setTimeout(() => {
      playAudio(current?.audioUrl)
    }, delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Fallo definitivo (para todos los tipos): ya no se muestran descripciones
      // de la imagen ni "Era la ...". Sólo un mensaje de ánimo, que se alcanza a
      // leer antes de avanzar a la próxima partida.
      setFeedbackText(pickRandom(MOVE_ON_POOL))
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
        // position:fixed + zIndex alto → tapa el shell (navbar + tabs) durante
        // la partida. El header limpio sólo reaparece al volver al mapa (X).
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: pal.cream,
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

      {/* ── ZONA SUPERIOR: color del lugar, 40% ───────────────────────────── */}
      <div
        style={{
          flex: '0 0 40%',
          background: pal.primary,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          position: 'relative',
        }}
      >
        {/* X (esquina superior derecha) */}
        <button
          type="button"
          aria-label="Terminar"
          onClick={() => setShowExit(true)}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none', color: pal.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <X size={20} />
        </button>

        {/* Enunciado gigante centrado verticalmente */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <h1
            key={currentIndex}
            style={{
              margin: 0,
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(28px, 5vw, 44px)',
              color: pal.text,
              textAlign: 'center',
              lineHeight: 1.15,
              maxWidth: '900px',
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
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: 'none', color: pal.text, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Volume2 size={22} />
            </button>
          )}
        </div>
      </div>

      {/* ── DIVISOR = PROGRESS BAR: ancho completo, alto fijo ─────────────── */}
      <div
        style={{
          height: '10px',
          background: pal.primaryDark,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${total > 0 ? ((currentIndex + 1) / total) * 100 : 0}%`,
            background: pal.accent,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* ── ZONA INFERIOR: cream, 60%. Cards centradas + franja de ánimo ──── */}
      <div
        style={{
          flex: '1 1 60%',
          background: pal.cream,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 24px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Cards centradas en el espacio disponible */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: '720px' }}>
            {current.type === 'vocabulary' && (
              <IdentifyImageQuestion
                key={current.id + ':' + currentIndex}
                exercise={current}
                onAttempt={handleAttempt}
                palette={pal}
              />
            )}
            {current.type === 'sequence' && (
              <SequenceQuestion
                key={current.id + ':' + currentIndex}
                exercise={current}
                onAttempt={handleAttempt}
                palette={pal}
              />
            )}
            {current.type === 'odd_one_out' && (
              <OddOneOutQuestion
                key={current.id + ':' + currentIndex}
                exercise={current}
                onAttempt={handleAttempt}
                palette={pal}
              />
            )}
            {current.type === 'fill_blank' && (
              <FillBlankQuestion
                key={current.id + ':' + currentIndex}
                exercise={current}
                onAttempt={handleAttempt}
                onFilled={handleFillBlankFilled}
                palette={pal}
              />
            )}
          </div>
        </div>

        {/* Franja inferior despejada, SÓLO para el mensaje de ánimo: debajo de las
            cards, centrado y siempre visible (nunca se solapa con las cards ni el
            enunciado). Reserva su alto aunque no haya mensaje, para que las cards
            no salten al aparecer/desaparecer. */}
        <div
          style={{
            flexShrink: 0,
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '12px',
          }}
        >
          {feedbackText && (
            <div
              key={feedbackText + currentIndex}
              style={{
                fontFamily: 'Fredoka, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(22px, 5vw, 28px)',
                color: pal.primary,
                textAlign: 'center',
                lineHeight: 1.1,
                animation: 'exercise-feedback-in 0.25s ease',
              }}
            >
              {feedbackText}
            </div>
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
