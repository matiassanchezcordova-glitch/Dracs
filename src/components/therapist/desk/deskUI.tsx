// Escritorio del Terapeuta — primitivos de UI (sólo componentes).
// Tokens y helpers puros viven en deskTokens.ts.

import type { CSSProperties, ReactNode } from 'react'
import { DT, initials } from './deskTokens'

// Tarjeta base — blanca sobre crema, borde cálido, sombra suave.
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: DT.white, border: `1px solid ${DT.line}`, borderRadius: DT.radius,
      padding: '22px', boxShadow: DT.shadow, ...style,
    }}>
      {children}
    </div>
  )
}

// Etiqueta de sección — sobria, en mayúsculas discretas.
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{
      margin: '0 0 16px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: DT.faint, fontFamily: DT.body,
    }}>
      {children}
    </p>
  )
}

// Avatar de iniciales — Arena con Tinta (sobrio, sin emoji).
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: DT.arena, color: DT.ink, fontFamily: DT.body, fontWeight: 800,
      fontSize: `${Math.round(size * 0.36)}px`, letterSpacing: '0.02em',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {initials(name)}
    </span>
  )
}

// Etiqueta "ejemplo" — para datos ilustrativos del modo demo (nunca sobre datos
// reales). El terapeuta debe distinguir de un vistazo qué es real.
export function EjemploTag() {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '6px',
      background: DT.arena, color: DT.muted, fontSize: '10px', fontWeight: 800,
      letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: DT.body,
    }}>
      ejemplo
    </span>
  )
}
