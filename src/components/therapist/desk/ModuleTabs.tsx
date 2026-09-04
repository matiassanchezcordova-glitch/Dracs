// Barra de módulos del Escritorio: un segmented control con burbuja deslizante.
//
// La burbuja se mide del DOM (offsetLeft y offsetWidth del botón de destino) en
// vez de calcularse con porcentajes, porque cada módulo tiene el ancho de su
// texto. Se recalcula al montar, al cambiar de destino y cuando cambia el
// tamaño del contenedor (ResizeObserver) o de la ventana.
//
// Al pasar el ratón por otro módulo, la burbuja se adelanta como vista previa y
// vuelve al activo al salir. Con prefers-reduced-motion no desliza: salta.

import { useEffect, useRef, useState } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { DT } from './deskTokens'

export interface ModuleDef {
  id: string
  label: string
  Icon: Icon
}

const CSS = `
.mt-bubble { transition: transform 0.28s cubic-bezier(.2,.8,.2,1), width 0.28s cubic-bezier(.2,.8,.2,1); }
.mt-tab    { transition: color 0.18s ease; }
.mt-tab:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 3px; border-radius: 999px; }
@media (prefers-reduced-motion: reduce) {
  .mt-bubble, .mt-tab { transition: none !important; }
}
`

interface Props {
  modules: ModuleDef[]
  active: string
  onChange: (id: string) => void
  panelId: (id: string) => string
}

export default function ModuleTabs({ modules, active, onChange, panelId }: Props) {
  const activeIndex = Math.max(0, modules.findIndex(m => m.id === active))
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [bubble, setBubble] = useState<{ left: number; width: number } | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Destino de la burbuja: el módulo bajo el ratón si lo hay, si no el activo.
  const target = hoverIndex ?? activeIndex

  useEffect(() => {
    const measure = () => {
      const el = btnRefs.current[target]
      if (el) setBubble({ left: el.offsetLeft, width: el.offsetWidth })
    }
    // En rAF: al montar, las fuentes pueden no haber asentado el ancho todavía.
    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    if (listRef.current) ro.observe(listRef.current)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [target, modules.length])

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const last = modules.length - 1
    let next = activeIndex
    if (e.key === 'ArrowRight') next = activeIndex === last ? 0 : activeIndex + 1
    if (e.key === 'ArrowLeft') next = activeIndex === 0 ? last : activeIndex - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = last
    onChange(modules[next].id)
    btnRefs.current[next]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Módulos del escritorio"
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHoverIndex(null)}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '2px',
        padding: '4px', borderRadius: '999px',
        background: DT.arena, border: `1px solid ${DT.line}`,
      }}
    >
      <style>{CSS}</style>

      {/* Burbuja: solo se pinta cuando ya tiene medida real, para que no salte
          desde la posición 0 en el primer frame. */}
      {bubble && (
        <span
          aria-hidden
          className="mt-bubble"
          style={{
            position: 'absolute', top: '4px', bottom: '4px', left: 0,
            width: `${bubble.width}px`, transform: `translateX(${bubble.left}px)`,
            borderRadius: '999px', background: DT.white,
            boxShadow: '0 1px 2px rgba(51,48,42,0.06), 0 4px 12px rgba(51,48,42,0.10)',
          }}
        />
      )}

      {modules.map((m, i) => {
        const isActive = i === activeIndex
        return (
          <button
            key={m.id}
            ref={el => { btnRefs.current[i] = el }}
            type="button"
            role="tab"
            id={`tab-${m.id}`}
            className="mt-tab"
            aria-selected={isActive}
            aria-controls={panelId(m.id)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(m.id)}
            onMouseEnter={() => setHoverIndex(i)}
            style={{
              position: 'relative', zIndex: 1,
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              height: '38px', padding: '0 16px', borderRadius: '999px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: isActive ? DT.ink : DT.muted,
              fontSize: '14px', fontWeight: 700, fontFamily: DT.display,
              whiteSpace: 'nowrap',
            }}
          >
            <m.Icon size={16} weight="regular" /> {m.label}
          </button>
        )
      })}
    </div>
  )
}
