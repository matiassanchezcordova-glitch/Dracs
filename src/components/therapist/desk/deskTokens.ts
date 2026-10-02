// Escritorio del profesional: tokens y helpers puros (sin componentes, para que
// fast-refresh trate deskUI.tsx como archivo de sólo-componentes).
//
// Los valores salen de src/lib/brand.ts, que es la paleta de la web: blanco y
// gris papel, tinta casi negra, un azul petróleo para los datos y el amarillo
// solo en la acción principal. Así la demo continúa la web sin saltos.
//
// Reglas que mandan sobre cualquier estilo suelto:
//   1. La tarjeta es blanca sobre el gris papel del fondo, con borde fino y una
//      sombra larga y suave. La profundidad la ponen las tarjetas.
//   2. Los títulos van en Source Serif, como en la web. Todo lo demás (datos,
//      botones, pestañas) en IBM Plex Sans.
//   3. El color entra sólo donde codifica algo (el estado de un paciente, lo
//      privado de una nota). Donde no codifica nada, todo va en tinta y azul.

import type { CSSProperties } from 'react'
import { BRAND } from '../../../lib/brand'

export const DT = {
  cream: BRAND.paper2,    // fondo de la superficie y rellenos de dato
  white: BRAND.paper,     // tarjeta
  arena: BRAND.paper3,    // rellenos suaves (chips, rieles, avatares)
  arenaDeep: BRAND.line,  // riel de gráfico sobre tarjeta blanca
  line: BRAND.line,       // borde de tarjeta
  lineSoft: '#EDEEEA',    // separadores internos, más discretos que el borde
  ink: BRAND.ink,
  muted: BRAND.note,
  faint: BRAND.faint,
  topo: '#8E9496',        // neutro para íconos
  azul: BRAND.data,       // estructura y acentos
  night: BRAND.night,
  yellow: BRAND.yellow,   // único pop (acción primaria)
  mostaza: BRAND.ochre,   // acento de atención (requiere mirada)

  // Familias de acento: relleno suave, borde y tinta legible.
  azulTint: BRAND.dataTint,
  azulTintLine: 'rgba(63,107,120,0.28)',
  azulInk: BRAND.dataInk,

  mostazaTint: BRAND.ochreTint,
  mostazaTintLine: 'rgba(185,137,42,0.34)',
  mostazaInk: BRAND.ochreInk,

  yellowTint: BRAND.yellowTint,
  yellowTintLine: 'rgba(185,137,42,0.38)',

  topoTint: '#F0F1EE',
  topoTintLine: 'rgba(142,148,150,0.32)',
  topoInk: BRAND.note,

  display: BRAND.sans,    // rótulos de interfaz: pestañas, botones, nombres
  serif: BRAND.serif,     // títulos de página y de tarjeta
  body: BRAND.sans,

  radius: BRAND.radius,
  radiusSm: BRAND.radiusSm,

  shadow: BRAND.shadow,
  shadowSoft: BRAND.shadowSoft,
  shadowLift: BRAND.shadowLift,
} as const

// ── Acentos con nombre ───────────────────────────────────────────────────────
// Cabeceras, badges, filos y stat tiles leen de aquí. Así la vista tiene color
// sin que nadie escriba un hex nuevo a mano.
export type Accent = 'azul' | 'mostaza' | 'arena' | 'amarillo'

export const ACCENT: Record<Accent, { solid: string; tint: string; line: string; ink: string }> = {
  azul: { solid: DT.azul, tint: DT.azulTint, line: DT.azulTintLine, ink: DT.azulInk },
  mostaza: { solid: DT.mostaza, tint: DT.mostazaTint, line: DT.mostazaTintLine, ink: DT.mostazaInk },
  arena: { solid: DT.topo, tint: DT.topoTint, line: DT.topoTintLine, ink: DT.topoInk },
  amarillo: { solid: DT.yellow, tint: DT.yellowTint, line: DT.yellowTintLine, ink: DT.mostazaInk },
}

// ── La superficie ────────────────────────────────────────────────────────────
// Gris papel liso, el mismo de las secciones alternas de la web.
export const SURFACE: CSSProperties = {
  backgroundColor: DT.cream,
}

// La misma superficie para paneles que no son la página (el copiloto).
export const SURFACE_PANEL: CSSProperties = {
  backgroundColor: DT.cream,
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0] ?? '?').slice(0, 2).toUpperCase()
}

// El dragón de la marca. Una sola filigrana en toda la vista (la cabecera del
// escritorio); su otro sitio es el copiloto.
export const DRAGON = '/brand/dracs-dragon.png'

// Campo de texto de la vista: textarea, input de fecha, select. Uno solo, para
// que escribir se sienta igual en el Plan, las Notas, la Familia y el Informe.
export const FIELD: CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
  border: `1.5px solid ${BRAND.lineStrong}`, background: DT.white, color: DT.ink,
  fontSize: '15px', fontFamily: DT.body, lineHeight: 1.6, outline: 'none',
}

// La misma caja en una sola línea (fechas, horas, selects).
export const FIELD_LINE: CSSProperties = {
  ...FIELD, height: '44px', padding: '0 12px', fontWeight: 500, lineHeight: 1,
}
