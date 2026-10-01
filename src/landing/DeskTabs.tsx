import { useEffect, useState } from 'react'
import { PauseButton } from './MapExplorer'
import { useInView } from './useInView'

// El escritorio del profesional con capturas reales de la demo. Pasa de una
// pantalla a otra sola; las pestañas de abajo permiten elegir y el botón de
// pausa la detiene.

const TABS = [
  { id: 'pacientes', name: 'Pacientes', img: '/landing/app-pacientes.webp', w: 2240, h: 1400, contain: true },
  { id: 'resumen', name: 'Resumen', img: '/landing/resumen-areas.webp', w: 1440, h: 1806, contain: false },
  { id: 'plan', name: 'Plan', img: '/landing/plan.webp', w: 1000, h: 944, contain: false },
  { id: 'informe', name: 'Informe', img: '/landing/informe.webp', w: 1000, h: 1582, contain: false },
]
const STEP_MS = 4000

export default function DeskTabs() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || !inView) return
    const t = setTimeout(() => setActive(a => (a + 1) % TABS.length), STEP_MS)
    return () => clearTimeout(t)
  }, [active, paused, inView])

  return (
    <div className="dt" ref={ref}>
      {TABS.map((t, i) => (
        <img
          key={t.id}
          src={t.img}
          alt={`Escritorio del profesional: ${t.name}.`}
          width={t.w}
          height={t.h}
          loading="lazy"
          className={`${i === active ? 'is-on' : ''}${t.contain ? ' is-contain' : ''}`}
          aria-hidden={i !== active}
        />
      ))}
      <div className="dt-tabs" role="tablist" aria-label="Partes del escritorio">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === active}
            className={`dt-tab${i === active ? ' is-on' : ''}`}
            onClick={() => { setPaused(true); setActive(i) }}
          >
            {t.name}
          </button>
        ))}
      </div>
      <PauseButton paused={paused} onToggle={() => setPaused(v => !v)} />
    </div>
  )
}
