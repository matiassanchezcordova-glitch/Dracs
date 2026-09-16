// Escritorio del Terapeuta — primitivos de UI (sólo componentes).
// Tokens y helpers puros viven en deskTokens.ts.
//
// Una sola línea visual, sobria y consistente. Lo que se toca se ve que se toca,
// y lo que no, no lo parece: ni el ícono ni el título de una sección llevan caja
// ni borde, porque no son botones.
//
//   Card           blanco cálido sobre la crema, borde fino y sombra en capas.
//   SectionTitle   ícono de línea y título en Fredoka. Sin caja, sin bajada.
//   FieldLabel     rótulo interno en tinta, con un filo azul.
//   StatTile       una métrica, un ícono, un número. Sin color decorativo.
//   Chip           dato, no acción: relleno suave y sin borde.
//   EmptyState     ícono de línea y una frase humana cuando no hay dato.

import type { CSSProperties, ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { ACCENT, DRAGON, DT, initials, type Accent } from './deskTokens'

// Animaciones y focos compartidos de la vista del terapeuta. Van en un solo
// sitio para que la entrada de una tarjeta y el hover de otra se sientan del
// mismo sistema. Todo se apaga con prefers-reduced-motion.
export const DESK_CSS = `
@keyframes dkRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes dkFade { from { opacity: 0; } to { opacity: 1; } }
.dk-rise  { animation: dkRise 0.26s cubic-bezier(0.22, 1, 0.36, 1) both; }
.dk-fade  { animation: dkFade 0.22s ease-out both; }
.dk-lift  { transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s ease, border-color 0.18s ease; }
.dk-press { transition: background 0.14s ease, border-color 0.14s ease, color 0.14s ease; }
.dk-focus:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
.dk-scroll { overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
.dk-scroll::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .dk-rise, .dk-fade { animation: none !important; }
  .dk-lift, .dk-press { transition: none !important; }
}
`

// Tarjeta base — blanco cálido sobre la crema, borde cálido y sombra en capas.
// `edge` añade el filo de acento a la izquierda sólo cuando ese color significa
// algo (el estado de un paciente, lo privado de una nota).
export function Card({ children, style, className, edge }: {
  children: ReactNode
  style?: CSSProperties
  className?: string
  edge?: Accent
}) {
  return (
    <div className={className} style={{
      position: 'relative',
      background: DT.white, border: `1px solid ${DT.line}`, borderRadius: DT.radius,
      borderLeft: edge ? `3px solid ${ACCENT[edge].solid}` : undefined,
      padding: '22px', boxShadow: DT.shadow, ...style,
    }}>
      {children}
    </div>
  )
}

// Cabecera de sección: ícono de línea y título en Fredoka, y nada más. Sin caja
// detrás del ícono, que lo hacía parecer un botón, y sin bajada explicando lo
// que el título ya dice.
export function SectionTitle({ Icon: I, children, right, size = 'md' }: {
  Icon: Icon
  children: ReactNode
  right?: ReactNode
  size?: 'md' | 'lg'
}) {
  const big = size === 'lg'
  return (
    // Envuelve: si lo que va a la derecha (una búsqueda, unas flechas) no cabe,
    // baja a su propia línea en vez de estrujar el título en un móvil.
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      flexWrap: 'wrap', rowGap: '12px', marginBottom: '14px',
    }}>
      <I
        size={big ? 21 : 18}
        weight="regular"
        color={DT.azulInk}
        aria-hidden
        style={{ flexShrink: 0 }}
      />
      <h3 style={{
        flex: 1, minWidth: '140px', margin: 0,
        fontSize: big ? '19px' : '16.5px', fontWeight: 700,
        color: DT.ink, fontFamily: DT.display, lineHeight: 1.25,
      }}>
        {children}
      </h3>
      {right && (
        <div style={{ flexShrink: 0, maxWidth: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {right}
        </div>
      )}
    </div>
  )
}

// Rótulo interno de un grupo de controles. En tinta y con un filo azul: se lee
// de verdad, al revés que el gris minúsculo de antes.
export function FieldLabel({ children, style }: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <p style={{
      margin: '0 0 11px', display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '13px', fontWeight: 800, color: DT.ink, fontFamily: DT.body, ...style,
    }}>
      <span aria-hidden style={{
        width: '3px', height: '14px', borderRadius: '999px', flexShrink: 0,
        background: DT.azul,
      }} />
      {children}
    </p>
  )
}

// Métrica: ícono de línea, número en Fredoka y su etiqueta. Todas iguales: el
// color no codifica nada aquí, así que no hay un color por tile.
export function StatTile({ Icon: I, value, label }: {
  Icon: Icon
  value: string
  label: string
}) {
  return (
    <div style={{
      boxSizing: 'border-box',
      background: DT.cream, border: `1px solid ${DT.line}`, borderRadius: DT.radiusSm,
      padding: '14px',
    }}>
      <div style={{
        fontSize: '26px', fontWeight: 600, color: DT.ink, lineHeight: 1,
        fontFamily: DT.display, fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px',
        fontSize: '12px', fontWeight: 700, color: DT.muted, fontFamily: DT.body,
      }}>
        <I size={13} weight="regular" color={DT.azulInk} style={{ flexShrink: 0 }} />
        {label}
      </div>
    </div>
  )
}

// Chip de dato. Sin borde a propósito: los chips con borde de esta vista son
// botones (áreas de foco, período del informe), y un dato no se toca.
export function Chip({ children, Icon: I }: {
  children: ReactNode
  Icon?: Icon
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 11px', borderRadius: '999px',
      background: DT.arena, color: DT.ink,
      fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body, whiteSpace: 'nowrap',
    }}>
      {I && <I size={13} weight="regular" color={DT.topoInk} style={{ flexShrink: 0 }} />}
      {children}
    </span>
  )
}

// Avatar de iniciales. Plano y siempre igual: identifica a la persona, no su
// estado, que ya se dice con palabras.
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span aria-hidden style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
      background: DT.azulTint, color: DT.azulInk, border: `1px solid ${DT.azulTintLine}`,
      fontFamily: DT.body, fontWeight: 800,
      fontSize: `${Math.round(size * 0.36)}px`, letterSpacing: '0.02em',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {initials(name)}
    </span>
  )
}

// Filigrana del dragón. Aparece UNA vez en toda la vista, en la esquina de la
// cabecera del escritorio y muy transparente. El otro sitio del dragón es el
// copiloto, que es suyo.
export function DragonWatermark({
  size = 170, opacity = 0.04, top, right = '-24px', bottom, left, rotate = -8,
}: {
  size?: number
  opacity?: number
  top?: string
  right?: string
  bottom?: string
  left?: string
  rotate?: number
}) {
  return (
    <img
      src={DRAGON}
      alt=""
      aria-hidden
      style={{
        position: 'absolute', top, right, bottom, left,
        width: `${size}px`, height: 'auto', opacity, pointerEvents: 'none',
        transform: `rotate(${rotate}deg)`, userSelect: 'none',
      }}
    />
  )
}

// Estado vacío: un ícono de línea, un título y una frase que dice qué pasa y qué
// esperar. Nunca una línea gris suelta.
export function EmptyState({ Icon: I, title, children, compact }: {
  Icon: Icon
  title: string
  children?: ReactNode
  compact?: boolean
}) {
  const ring = compact ? 48 : 60
  return (
    <div className="dk-fade" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: '5px', padding: compact ? '18px 12px' : '28px 16px', margin: '0 auto', maxWidth: '400px',
    }}>
      <span aria-hidden style={{
        width: ring, height: ring, borderRadius: '50%', marginBottom: '8px',
        background: DT.arena, color: DT.topoInk,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <I size={Math.round(ring * 0.44)} weight="regular" />
      </span>
      <p style={{
        margin: 0, fontSize: compact ? '15px' : '16.5px', fontWeight: 700,
        color: DT.ink, fontFamily: DT.display,
      }}>
        {title}
      </p>
      {children && (
        <p style={{
          margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: DT.muted, fontFamily: DT.body,
        }}>
          {children}
        </p>
      )}
    </div>
  )
}
