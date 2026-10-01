import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, useInView } from './useInView'

// La demostración del hero: a la izquierda, una partida tal como la ve el niño;
// a la derecha, lo que le llega a su logopeda. Quien visita puede jugar. Si no
// toca nada, la demo se juega sola para que se entienda sin leer.
//
// Todo es un ejemplo con ilustraciones reales del juego. No hay datos
// inventados: la carpeta muestra solo lo que se acaba de jugar en esta demo.

type Option = { label: string; img?: string }
type Round = {
  juego: string
  lugar: string
  area: string
  band: string
  prompt: string
  image?: string
  options: Option[]
  correct: number
}

const ROUNDS: Round[] = [
  {
    juego: 'Encontrar la imagen', lugar: 'El mar', area: 'Lenguaje receptivo', band: '#1e5fa8',
    prompt: '¿Dónde está la caracola?',
    options: [
      { label: 'estrella de mar', img: 'estrella' },
      { label: 'coral', img: 'coral' },
      { label: 'caracola', img: 'caracola' },
    ],
    correct: 2,
  },
  {
    juego: 'Encontrar el distinto', lugar: 'La casa', area: 'Cognición y conceptos', band: '#5f52a8',
    prompt: 'Uno no es como los demás',
    options: [
      { label: 'pez', img: 'pez' },
      { label: 'manzana', img: 'manzana' },
      { label: 'cangrejo', img: 'cangrejo' },
    ],
    correct: 1,
  },
  {
    juego: 'Completar la frase', lugar: 'El mar', area: 'Vocabulario y lenguaje expresivo', band: '#1e5fa8',
    prompt: 'El delfín ___ en el agua',
    image: 'delfin',
    options: [{ label: 'corre' }, { label: 'nada' }],
    correct: 1,
  },
]

type Record = { id: number; juego: string; lugar: string; area: string; intentos: number }
type CardState = 'idle' | 'wrong' | 'right'

const IDLE_MS = 2600
const NEXT_MS = 1500
const LOOP_MS = 4200

export default function HeroDemo() {
  const [wrapRef, inView] = useInView<HTMLDivElement>({ threshold: 0.35 })
  const [round, setRound] = useState(0)
  const [states, setStates] = useState<CardState[]>(() => ROUNDS[0].options.map(() => 'idle'))
  const [attempts, setAttempts] = useState(1)
  const [done, setDone] = useState(false)
  const [records, setRecords] = useState<Record[]>([])
  const [auto, setAuto] = useState(true)
  const [pointer, setPointer] = useState<{ x: number; y: number; tap: boolean } | null>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const stageRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)

  const r = ROUNDS[round]
  const finished = done && round === ROUNDS.length - 1

  const startRound = useCallback((i: number) => {
    setRound(i)
    setStates(ROUNDS[i].options.map(() => 'idle'))
    setAttempts(1)
    setDone(false)
    setPointer(null)
  }, [])

  const answer = useCallback((i: number) => {
    if (done) return
    const cur = ROUNDS[round]
    if (i === cur.correct) {
      setStates(s => s.map((v, k) => (k === i ? 'right' : v)))
      setDone(true)
      idCounter.current += 1
      const rec: Record = { id: idCounter.current, juego: cur.juego, lugar: cur.lugar, area: cur.area, intentos: attempts }
      setRecords(prev => [rec, ...prev].slice(0, 3))
    } else {
      setStates(s => s.map((v, k) => (k === i ? 'wrong' : v)))
      setAttempts(a => a + 1)
    }
  }, [done, round, attempts])

  // El visitante toca: toma el control y la demo deja de jugarse sola.
  function handleTap(i: number) {
    setAuto(false)
    setPointer(null)
    answer(i)
  }

  // Avanza a la ronda siguiente después de un acierto.
  useEffect(() => {
    if (!done) return
    if (round < ROUNDS.length - 1) {
      const t = setTimeout(() => startRound(round + 1), NEXT_MS)
      return () => clearTimeout(t)
    }
    if (auto && inView) {
      const t = setTimeout(() => { setRecords([]); startRound(0) }, LOOP_MS)
      return () => clearTimeout(t)
    }
  }, [done, round, auto, inView, startRound])

  // Juego solo: si nadie toca, un dedo va hasta la respuesta correcta.
  useEffect(() => {
    if (!auto || !inView || done) return
    const reduce = prefersReducedMotion()
    const t1 = setTimeout(() => {
      const target = optionRefs.current[r.correct]
      const stage = stageRef.current
      if (!target || !stage) { answer(r.correct); return }
      const a = target.getBoundingClientRect()
      const s = stage.getBoundingClientRect()
      setPointer({ x: a.left - s.left + a.width / 2, y: a.top - s.top + a.height * 0.62, tap: false })
    }, IDLE_MS)
    const t2 = setTimeout(() => setPointer(p => (p ? { ...p, tap: true } : p)), IDLE_MS + (reduce ? 200 : 750))
    const t3 = setTimeout(() => { answer(r.correct); setPointer(null) }, IDLE_MS + (reduce ? 300 : 950))
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [auto, inView, done, round, r.correct, answer])

  function restart() {
    setRecords([])
    startRound(0)
  }

  function go(delta: number) {
    setAuto(false)
    startRound((round + delta + ROUNDS.length) % ROUNDS.length)
  }

  function togglePlay() {
    if (auto) { setAuto(false); setPointer(null); return }
    if (finished) restart()
    setAuto(true)
  }

  return (
    <div className="hd" ref={wrapRef}>
      <div className="hd-stage">
        <div className="hd-screen" ref={stageRef}>
          <div className="hd-band" style={{ background: r.band }}>
            <span className="hd-place">{r.lugar}</span>
            <p className="hd-prompt" aria-live="polite">{r.prompt}</p>
            <div className="hd-progress" aria-hidden="true">
              {ROUNDS.map((_, k) => (
                <span key={k} className={k < round || (k === round && done) ? 'is-done' : k === round ? 'is-now' : ''} />
              ))}
            </div>
          </div>
          <div className="hd-play">
            {r.image && (
              <img className="hd-phrase-img" src={`/landing/ilus/${r.image}.webp`} alt="" width={120} height={120} />
            )}
            <div className={`hd-options hd-options--${r.options.length}${r.image ? ' hd-options--words' : ''}`}>
              {r.options.map((o, k) => (
                <button
                  key={`${round}-${k}`}
                  ref={el => { optionRefs.current[k] = el }}
                  type="button"
                  className={`hd-card is-${states[k]}`}
                  onClick={() => handleTap(k)}
                  disabled={done || states[k] === 'wrong'}
                  aria-label={o.label}
                >
                  {o.img
                    ? <img src={`/landing/ilus/${o.img}.webp`} alt="" width={160} height={160} />
                    : <span className="hd-word">{o.label}</span>}
                </button>
              ))}
            </div>
          </div>
          {pointer && (
            <span
              className={`hd-pointer${pointer.tap ? ' is-tap' : ''}`}
              style={{ left: pointer.x, top: pointer.y }}
              aria-hidden="true"
            />
          )}
        </div>

        <div className="hd-folder" aria-live="polite">
          <div className="hd-folder__head">
            <span className="hd-avatar" aria-hidden="true">PO</span>
            <div>
              <p className="hd-folder__name">Carpeta de Pol</p>
              <p className="hd-folder__meta">Lo que ve su logopeda · <span className="hd-tag">Ejemplo</span></p>
            </div>
          </div>
          <ul className="hd-rows">
            {records.length === 0 && (
              <li className="hd-empty">Cada partida aparece aquí en cuanto termina.</li>
            )}
            {records.map(rec => (
              <li key={rec.id} className="hd-row">
                <div className="hd-row__top">
                  <span className="hd-row__game">{rec.juego}</span>
                  <span className="hd-row__when">ahora</span>
                </div>
                <span className="hd-chip">{rec.area}</span>
                <span className="hd-row__res">
                  {rec.intentos === 1 ? 'Acierto al primer intento' : `Acierto al ${rec.intentos}.º intento`} · {rec.lugar}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hd-controls">
        <button type="button" className="lp-round-btn" onClick={() => go(-1)} aria-label="Juego anterior">
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" className="lp-round-btn" onClick={togglePlay} aria-label={auto ? 'Pausar la demo' : 'Reproducir la demo'}>
          {auto
            ? <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="11.5" y="4" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
            : <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg>}
        </button>
        <button type="button" className="lp-round-btn" onClick={() => go(1)} aria-label="Juego siguiente">
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5L13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <p className="hd-hint">{auto ? 'Se juega sola. Toca una imagen para jugar tú.' : 'Estás jugando tú.'}</p>
    </div>
  )
}
