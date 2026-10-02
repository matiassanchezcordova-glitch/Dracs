// Escritorio del profesional: primitivos de UI (sólo componentes).
// Tokens y helpers puros viven en deskTokens.ts.
//
// El mismo lenguaje que la web: tarjetas blancas sobre gris papel, títulos en
// serif, datos en sans. Lo que se toca se ve que se toca, y lo que no, no lo
// parece.
//
//   Card           blanca sobre el gris papel, borde fino y sombra larga.
//   SectionTitle   título de tarjeta en serif, con un ícono discreto.
//   FieldLabel     rótulo interno de un grupo de controles.
//   StatTile       una métrica: número grande en serif y su etiqueta.
//   Chip           dato, no acción: relleno suave y sin borde.
//   ToggleChip     opción que se marca: pastilla con borde, tinta cuando está.
//   Button         acción. Primaria en amarillo (una por tarjeta), el resto en
//                  blanco con borde, como los botones de la web.
//   IconButton     la misma acción, cuadrada y sólo con ícono (flechas, +/-).
//   EmptyState     ícono de línea y una frase humana cuando no hay dato.

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { ACCENT, DRAGON, DT, initials, type Accent } from './deskTokens'
import { BRAND } from '../../../lib/brand'

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
.dk-page { padding: 48px 24px 56px; box-sizing: border-box; }
.dk-foot { padding: 0 24px 104px; }
.dk-h1 { font-size: 48px; }
@media (max-width: 640px) {
  .dk-page { padding: 28px 16px 40px; }
  .dk-foot { padding: 0 16px 104px; }
  .dk-h1 { font-size: 36px; }
}
.dk-split { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 20px; align-items: start; }
.dk-split--even { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.dk-split--doc { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); }
.dk-stack { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.dk-sticky { position: sticky; top: 24px; }
@media (max-width: 900px) {
  .dk-split, .dk-split--even, .dk-split--doc { grid-template-columns: minmax(0, 1fr); }
  .dk-sticky { position: static; }
}
.dk-back {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 6px;
  margin: 0 0 20px -2px; padding: 4px 2px; border: 0; background: none; cursor: pointer;
  color: ${DT.muted}; font-size: 15px; font-weight: 500; font-family: ${BRAND.sans};
  border-radius: 6px;
}
.dk-back:hover { color: ${DT.ink}; }
.dk-scroll { overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
.dk-scroll::-webkit-scrollbar { display: none; }
.dk-btn { transition: background 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, color 0.14s ease; }
.dk-btn:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
.dk-btn-secondary:hover:not(:disabled) { border-color: ${DT.ink}; }
.dk-btn-primary:hover:not(:disabled) { background: ${BRAND.yellowHover} !important; }
.dk-chip:hover:not(:disabled) { border-color: ${DT.ink}; }
@media (prefers-reduced-motion: reduce) {
  .dk-rise, .dk-fade { animation: none !important; }
  .dk-lift, .dk-press, .dk-btn { transition: none !important; }
}
`

// Tarjeta base: blanca sobre el gris papel, borde fino y sombra larga.
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
      padding: '24px', boxShadow: DT.shadow, ...style,
    }}>
      {children}
    </div>
  )
}

// Cabecera de tarjeta: título en serif, como los de la web, con un ícono de
// línea discreto delante. Sin caja detrás del ícono y sin bajada.
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
      flexWrap: 'wrap', rowGap: '12px', marginBottom: '16px',
    }}>
      <I
        size={big ? 20 : 18}
        weight="regular"
        color={DT.azul}
        aria-hidden
        style={{ flexShrink: 0 }}
      />
      <h3 style={{
        flex: 1, minWidth: '140px', margin: 0,
        fontSize: big ? '23px' : '20px', fontWeight: 600, letterSpacing: '-0.01em',
        color: DT.ink, fontFamily: DT.serif, lineHeight: 1.2,
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

// Rótulo interno de un grupo de controles: sans, peso medio, en tinta.
export function FieldLabel({ children, style }: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <p style={{
      margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '14px', fontWeight: 600, color: DT.ink, fontFamily: DT.body, ...style,
    }}>
      {children}
    </p>
  )
}

// Métrica: número grande en serif y su etiqueta, como las cifras de la web.
// Todas iguales: el color no codifica nada aquí.
export function StatTile({ Icon: I, value, label }: {
  Icon: Icon
  value: string
  label: string
}) {
  return (
    <div style={{
      boxSizing: 'border-box',
      background: DT.cream, borderRadius: DT.radiusSm,
      padding: '16px 18px',
    }}>
      <div style={{
        fontSize: '34px', fontWeight: 500, color: DT.ink, lineHeight: 1, letterSpacing: '-0.02em',
        fontFamily: DT.serif, fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px',
        fontSize: '13px', fontWeight: 500, color: DT.muted, fontFamily: DT.body,
      }}>
        <I size={14} weight="regular" color={DT.azul} style={{ flexShrink: 0 }} />
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
      fontSize: '13px', fontWeight: 500, fontFamily: DT.body, whiteSpace: 'nowrap',
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
      fontFamily: DT.body, fontWeight: 600,
      fontSize: `${Math.round(size * 0.34)}px`, letterSpacing: '0.02em',
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

// Estado vacío: un ícono de línea, un título y, si hace falta, una frase. Sin
// círculo detrás del ícono: no es un botón ni un adorno.
export function EmptyState({ Icon: I, title, children, compact }: {
  Icon: Icon
  title: string
  children?: ReactNode
  compact?: boolean
}) {
  return (
    <div className="dk-fade" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: '6px', padding: compact ? '16px 12px' : '26px 16px', margin: '0 auto', maxWidth: '400px',
    }}>
      <I size={compact ? 24 : 28} weight="regular" color={DT.topo} aria-hidden style={{ marginBottom: '4px' }} />
      <p style={{
        margin: 0, fontSize: compact ? '16px' : '18px', fontWeight: 600,
        color: DT.ink, fontFamily: DT.serif,
      }}>
        {title}
      </p>
      {children && (
        <p style={{
          margin: 0, fontSize: '14px', lineHeight: 1.6, color: DT.muted, fontFamily: DT.body,
        }}>
          {children}
        </p>
      )}
    </div>
  )
}

// Opción que se marca y se desmarca (áreas de foco, período, versión). Tiene
// borde porque se toca; marcada va en tinta llena, como la pestaña activa.
export function ToggleChip({ on, onClick, children }: {
  on: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="dk-btn dk-chip"
      style={{
        minHeight: '38px', padding: '7px 15px', borderRadius: '999px', cursor: 'pointer',
        border: `1.5px solid ${on ? DT.night : BRAND.lineStrong}`,
        background: on ? DT.night : DT.white,
        color: on ? '#FFFFFF' : DT.ink,
        fontSize: '14px', fontWeight: 500, fontFamily: DT.body,
      }}
    >
      {children}
    </button>
  )
}

const BUTTON_SIZE = {
  md: { height: 42, padX: 18, font: '14.5px', icon: 16 },
  sm: { height: 36, padX: 14, font: '14px', icon: 15 },
} as const

// Botón de la vista. `primary` es la acción principal de su tarjeta, en
// amarillo; todo lo demás es `secondary`, en blanco con borde.
export function Button({
  variant = 'secondary', size = 'md', Icon: I, children, style, className, ...rest
}: {
  variant?: 'primary' | 'secondary'
  size?: keyof typeof BUTTON_SIZE
  Icon?: Icon
  children?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const S = BUTTON_SIZE[size]
  const primary = variant === 'primary'
  const off = !!rest.disabled
  return (
    <button
      type="button"
      {...rest}
      className={`dk-btn dk-btn-${variant}${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
        height: `${S.height}px`, padding: `0 ${S.padX}px`, borderRadius: '10px', flexShrink: 0,
        border: primary ? '1.5px solid transparent' : `1.5px solid ${BRAND.lineStrong}`,
        background: primary ? DT.yellow : DT.white, color: DT.ink,
        fontSize: S.font, fontWeight: 600, fontFamily: DT.display, whiteSpace: 'nowrap',
        cursor: off ? 'default' : 'pointer', opacity: off ? 0.45 : 1,
        boxShadow: 'none',
        ...style,
      }}
    >
      {I && <I size={S.icon} weight="regular" style={{ flexShrink: 0 }} />}
      {children}
    </button>
  )
}

// Botón cuadrado de sólo ícono: flechas de semana, más y menos. Mismo borde,
// radio y sombra que Button.
export function IconButton({ Icon: I, label, style, active, ...rest }: {
  Icon: Icon
  label: string
  active?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const off = !!rest.disabled
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className="dk-btn dk-btn-secondary"
      style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, padding: 0,
        border: `1.5px solid ${active ? DT.night : BRAND.lineStrong}`,
        background: active ? DT.night : DT.white,
        color: active ? '#FFFFFF' : DT.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: off ? 'default' : 'pointer', opacity: off ? 0.35 : 1,
        ...style,
      }}
    >
      <I size={16} weight="regular" />
    </button>
  )
}
