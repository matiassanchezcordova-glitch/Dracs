// Escritorio del Terapeuta — primitivos de UI (sólo componentes).
// Tokens y helpers puros viven en deskTokens.ts.
//
// El lenguaje visual en seis piezas, y todo lo demás se construye con ellas:
//   Card           blanco cálido que flota sobre la crema texturada.
//   SectionTitle   cabecera con ícono de línea dentro de un badge de su acento.
//   FieldLabel     rótulo interno legible, en tinta, con su filo de color.
//   StatTile       métrica con ícono, número en Fredoka y filo de acento.
//   EmptyState     el dragón de Dracs y una frase humana cuando no hay dato.
//   DragonWatermark  la marca como presencia tenue en una cabecera.

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

// Tarjeta base — blanco cálido sobre la crema texturada, borde cálido y sombra
// en capas. `edge` añade el filo de acento a la izquierda cuando la tarjeta
// pertenece a un color (las notas clínicas son mostaza, por ejemplo).
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

// Badge del acento: el ícono de línea vive dentro, nunca suelto sobre la card.
export function IconBadge({ Icon: I, accent = 'azul', size = 36 }: {
  Icon: Icon
  accent?: Accent
  size?: number
}) {
  const a = ACCENT[accent]
  return (
    <span aria-hidden style={{
      width: size, height: size, flexShrink: 0, borderRadius: `${Math.round(size * 0.34)}px`,
      background: a.tint, border: `1px solid ${a.line}`, color: a.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
    }}>
      <I size={Math.round(size * 0.5)} weight="regular" />
    </span>
  )
}

// Cabecera de sección: título en Fredoka más ícono de línea en su badge. Esto
// sustituye a las etiquetas grises en mayúsculas que había sueltas.
export function SectionTitle({ Icon: I, accent = 'azul', children, hint, right, size = 'md' }: {
  Icon: Icon
  accent?: Accent
  children: ReactNode
  hint?: ReactNode
  right?: ReactNode
  size?: 'md' | 'lg'
}) {
  const big = size === 'lg'
  return (
    // Envuelve: si lo que va a la derecha (una búsqueda, unas flechas) no cabe,
    // baja a su propia línea en vez de estrujar el título en un móvil.
    <div style={{
      display: 'flex', alignItems: hint ? 'flex-start' : 'center', gap: '11px',
      flexWrap: 'wrap', rowGap: '12px',
      marginBottom: hint ? '16px' : '14px',
    }}>
      <IconBadge Icon={I} accent={accent} size={big ? 40 : 34} />
      <div style={{ flex: 1, minWidth: '160px' }}>
        <h3 style={{
          margin: 0, fontSize: big ? '19px' : '16.5px', fontWeight: 700,
          color: DT.ink, fontFamily: DT.display, lineHeight: 1.25,
        }}>
          {children}
        </h3>
        {hint && (
          <p style={{
            margin: '3px 0 0', fontSize: '13.5px', lineHeight: 1.5,
            color: DT.muted, fontFamily: DT.body,
          }}>
            {hint}
          </p>
        )}
      </div>
      {right && (
        <div style={{ flexShrink: 0, maxWidth: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {right}
        </div>
      )}
    </div>
  )
}

// Rótulo interno de un grupo de controles. En tinta y con su filo de color: se
// lee de verdad, al revés que el gris minúsculo de antes.
export function FieldLabel({ children, accent = 'azul', style }: {
  children: ReactNode
  accent?: Accent
  style?: CSSProperties
}) {
  return (
    <p style={{
      margin: '0 0 11px', display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '13px', fontWeight: 800, color: DT.ink, fontFamily: DT.body, ...style,
    }}>
      <span aria-hidden style={{
        width: '3px', height: '14px', borderRadius: '999px', flexShrink: 0,
        background: ACCENT[accent].solid,
      }} />
      {children}
    </p>
  )
}

// Métrica: ícono de línea, número en Fredoka y filo de acento arriba. Fondo en
// crema sobre la tarjeta blanca, para que el bloque tenga suelo propio.
export function StatTile({ Icon: I, value, label, accent = 'azul' }: {
  Icon: Icon
  value: string
  label: string
  accent?: Accent
}) {
  const a = ACCENT[accent]
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
      background: DT.cream, border: `1px solid ${DT.line}`, borderRadius: DT.radiusSm,
      padding: '15px 14px 13px',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '3px', background: a.solid,
      }} />
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
        <I size={13} weight="regular" color={a.ink} style={{ flexShrink: 0 }} />
        {label}
      </div>
    </div>
  )
}

// Chip de dato: relleno suave del acento, nunca gris plano.
export function Chip({ children, accent = 'arena', Icon: I }: {
  children: ReactNode
  accent?: Accent
  Icon?: Icon
}) {
  const a = ACCENT[accent]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 11px', borderRadius: '999px',
      background: a.tint, border: `1px solid ${a.line}`, color: DT.ink,
      fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body, whiteSpace: 'nowrap',
    }}>
      {I && <I size={13} weight="regular" color={a.ink} style={{ flexShrink: 0 }} />}
      {children}
    </span>
  )
}

// Avatar de iniciales con aro de color. El aro toma el acento del estado, así
// que una carpeta se identifica por color antes de leerse.
export function Avatar({ name, size = 40, accent = 'azul' }: {
  name: string
  size?: number
  accent?: Accent
}) {
  const a = ACCENT[accent]
  const inner = size - 6
  return (
    <span aria-hidden style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
      background: DT.white, border: `2px solid ${a.solid}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        width: inner, height: inner, borderRadius: '50%',
        background: a.tint, color: a.ink,
        fontFamily: DT.body, fontWeight: 800,
        fontSize: `${Math.round(size * 0.34)}px`, letterSpacing: '0.02em',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {initials(name)}
      </span>
    </span>
  )
}

// Filigrana del dragón: presencia de marca en una esquina, al 5 a 8%. Es fondo,
// así que va fuera del flujo, sin alt y sin capturar el ratón.
export function DragonWatermark({
  size = 170, opacity = 0.06, top, right = '-24px', bottom, left, rotate = -8,
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

// Estado vacío con alma: el dragón pequeño y cálido, un título y una frase que
// dice qué pasa y qué esperar. Nunca una línea gris suelta.
export function EmptyState({ title, children, accent = 'arena', compact }: {
  title: string
  children?: ReactNode
  accent?: Accent
  compact?: boolean
}) {
  const a = ACCENT[accent]
  const ring = compact ? 62 : 84
  return (
    <div className="dk-fade" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: '4px', padding: compact ? '18px 12px' : '28px 16px', margin: '0 auto', maxWidth: '400px',
    }}>
      <span aria-hidden style={{
        width: ring, height: ring, borderRadius: '50%', marginBottom: '10px',
        background: a.tint, border: `1px solid ${a.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={DRAGON} alt="" style={{ width: `${Math.round(ring * 0.58)}px`, height: 'auto', opacity: 0.9 }} />
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
