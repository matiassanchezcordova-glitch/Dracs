import { useEffect, useState } from 'react'
import { useInView } from './useInView'

// El mapa del niño, explorable. Cada lugar enseña un juego de ejemplo con sus
// ilustraciones reales. Si nadie toca, recorre los lugares solo; el botón de
// pausa lo detiene.

type Place = { id: string; name: string; x: number; y: number; prompt: string; imgs: string[] }

const PLACES: Place[] = [
  { id: 'mar', name: 'El mar', x: 15, y: 83, prompt: '¿Dónde está la caracola?', imgs: ['estrella', 'coral', 'caracola'] },
  { id: 'faro', name: 'El faro', x: 55, y: 20, prompt: 'Sorpresa: un juego de cualquier lugar', imgs: ['pulpo', 'castillo', 'sol'] },
  { id: 'casa', name: 'La casa', x: 72, y: 33, prompt: 'Uno no es como los demás', imgs: ['pez', 'manzana', 'cangrejo'] },
  { id: 'sol', name: 'El sol', x: 88, y: 13, prompt: '¿Dónde está la luna?', imgs: ['sol', 'nube', 'luna'] },
  { id: 'playa', name: 'La playa', x: 89, y: 75, prompt: 'Ordena: primero, después y al final', imgs: ['cubo-vacio', 'cubo-lleno', 'castillo'] },
]

export default function MapExplorer({ photo }: { photo?: string } = {}) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 })
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || !inView) return
    const t = setInterval(() => setActive(a => (a + 1) % PLACES.length), 3200)
    return () => clearInterval(t)
  }, [paused, inView])

  const p = PLACES[active]
  return (
    <div className="mx" ref={ref}>
      {photo ? (
        <img className="mx-img" src={photo} alt="Un niño juega con Dracs en una tablet." width={1192} height={894} loading="lazy" />
      ) : (
      <div className="mx-map">
      <img className="mx-img" src="/landing/mapa.webp" alt="El mapa de Dracs con sus cinco lugares." width={916} height={688} loading="lazy" />
      {PLACES.map((pl, i) => (
        <button
          key={pl.id}
          type="button"
          className={`mx-spot${i === active ? ' is-on' : ''}`}
          style={{ left: `${pl.x}%`, top: `${pl.y}%` }}
          onClick={() => { setPaused(true); setActive(i) }}
          aria-label={pl.name}
          aria-pressed={i === active}
        >
          {i === active && <span className="mx-spot__label" aria-hidden="true">{pl.name}</span>}
        </button>
      ))}
      </div>
      )}
      <div className="mx-card" aria-live="polite">
        {photo && <p className="mx-card__place">{p.name}</p>}
        <p className="mx-card__prompt">{p.prompt}</p>
        <div className="mx-card__imgs" key={p.id}>
          {p.imgs.map(src => <img key={src} src={`/landing/ilus/${src}.webp`} alt="" width={120} height={120} loading="lazy" />)}
        </div>
      </div>
      <PauseButton paused={paused} onToggle={() => setPaused(v => !v)} />
    </div>
  )
}

export function PauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="lp-pause" onClick={onToggle} aria-label={paused ? 'Reanudar la animación' : 'Pausar la animación'}>
      {paused
        ? <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg>
        : <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="11.5" y="4" width="3.5" height="12" rx="1" fill="currentColor" /></svg>}
    </button>
  )
}
