// Aviso de bienvenida del showroom — tarjeta chica, descartable, una sola vez.
//
// Explica lo único que un visitante no puede deducir solo: que en el producto
// real cada rol ve SOLO su sección, y que la demo le deja recorrer las tres.
// No es un tutorial: dos líneas y una X. Se recuerda en localStorage por
// sección, así no vuelve a aparecer en cada visita.

import { useState } from 'react'
import { X, Info } from '@phosphor-icons/react'

const KEY_PREFIX = 'dracs_aviso_demo_'

function alreadyDismissed(id: string): boolean {
  try {
    return localStorage.getItem(KEY_PREFIX + id) === '1'
  } catch {
    return false
  }
}

// Paleta oficial (Azul / Crema / Tinta), sin hues nuevos.
const C = {
  ink: '#33302A',
  muted: 'rgba(51,48,42,0.66)',
  azul: '#5B8896',
  tint: '#EAF3F5',
  line: 'rgba(91,136,150,0.28)',
  body: 'Nunito, sans-serif',
  display: 'Fredoka, system-ui, sans-serif',
}

export default function AvisoDemo({ id, children }: { id: string; children: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(() => alreadyDismissed(id))

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(KEY_PREFIX + id, '1')
    } catch { /* localStorage bloqueado: se vuelve a ver, no rompe nada */ }
  }

  return (
    <div
      role="note"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        background: C.tint, border: `1px solid ${C.line}`, borderRadius: '14px',
        padding: '14px 14px 14px 16px', marginBottom: '18px',
        fontFamily: C.body, animation: 'wordSlideDown 0.24s ease',
      }}
    >
      <Info size={19} weight="duotone" color={C.azul} style={{ flexShrink: 0, marginTop: '1px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 3px', fontSize: '14px', fontWeight: 700,
          color: C.ink, fontFamily: C.display,
        }}>
          Estás en la demo de Dracs
        </p>
        <p style={{ margin: 0, fontSize: '13.5px', color: C.muted, lineHeight: 1.55 }}>
          {children}
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Cerrar el aviso"
        style={{
          flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px', borderRadius: '8px', color: C.muted, display: 'flex',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,136,150,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
      >
        <X size={15} weight="bold" />
      </button>
    </div>
  )
}
