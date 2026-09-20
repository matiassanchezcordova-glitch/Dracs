// Escritorio del Terapeuta — tokens y helpers puros (sin componentes, para que
// fast-refresh trate deskUI.tsx como archivo de sólo-componentes).
//
// Paleta oficial, sobria y cálida. El amarillo es el único pop y va sólo en la
// acción primaria. El azul es la estructura; la mostaza y la arena entran sólo
// donde codifican algo (el estado de un paciente, lo privado de una nota).
//
// Dos reglas de profundidad que mandan sobre cualquier estilo suelto:
//   1. El color de una tarjeta NUNCA es el del fondo. La tarjeta va en blanco
//      cálido, un punto por encima de la crema.
//   2. Las tarjetas flotan: borde 1px cálido y sombra en capas. El fondo, en
//      cambio, es crema lisa: la profundidad la ponen las tarjetas, no la
//      textura.
//
// El color entra sólo donde codifica algo (el estado de un paciente, lo privado
// de una nota). Donde no codifica nada, todo va en azul y punto.

import type { CSSProperties } from 'react'

export const DT = {
  cream: '#FAF5E8',       // fondo de la superficie
  // Blanco cálido de tarjeta. No es #FFFFFF (frío y de plantilla) ni la crema
  // del fondo (papel recortado): queda justo encima de la crema y por eso la
  // tarjeta se lee como objeto, no como recorte.
  white: '#FFFDF7',
  arena: '#EDE4D1',       // rellenos suaves (chips, rieles, avatares)
  arenaDeep: '#E4D8C0',   // riel de gráfico sobre tarjeta blanca
  line: '#DED2BA',        // borde cálido de tarjeta
  lineSoft: '#EAE0CC',    // separadores internos, más discretos que el borde
  ink: '#33302A',         // texto principal (Tinta)
  muted: 'rgba(51,48,42,0.60)',   // texto secundario (Tinta 60% ≈ AA)
  faint: 'rgba(51,48,42,0.42)',   // notas al pie
  topo: '#9A8F7E',        // neutro para íconos/rellenos
  azul: '#5B8896',        // estructura y acentos
  yellow: '#F7C31C',      // único pop (activo, acción primaria)
  mostaza: '#C7A24F',     // acento de atención (requiere mirada)

  // Familias de acento. Cada una trae su relleno suave, su borde y su tinta
  // legible: con esto un badge, un chip y un filo hablan el mismo idioma sin
  // inventar colores por el camino.
  azulTint: '#DFEAEE',
  azulTintLine: 'rgba(91,136,150,0.30)',
  azulInk: '#3E6773',

  mostazaTint: '#F6EDD8',
  mostazaTintLine: 'rgba(199,162,79,0.34)',
  mostazaInk: '#7C6120',

  yellowTint: '#FDF3D4',
  yellowTintLine: 'rgba(199,162,79,0.40)',

  topoTint: '#EFE9DE',
  topoTintLine: 'rgba(154,143,126,0.32)',
  topoInk: '#6D6355',

  display: 'Fredoka, system-ui, sans-serif',
  body: 'Nunito, sans-serif',

  radius: '20px',
  radiusSm: '13px',

  // Sombras en capas: contacto corta, media y difusa larga. Con una sola capa
  // la tarjeta se leía pegada; con las tres flota sin endurecerse.
  shadow: '0 1px 2px rgba(51,48,42,0.07), 0 4px 10px rgba(51,48,42,0.06), 0 16px 34px rgba(51,48,42,0.10)',
  shadowSoft: '0 1px 2px rgba(51,48,42,0.05), 0 3px 8px rgba(51,48,42,0.05), 0 10px 22px rgba(51,48,42,0.07)',
  shadowLift: '0 2px 4px rgba(51,48,42,0.08), 0 8px 18px rgba(51,48,42,0.09), 0 24px 46px rgba(51,48,42,0.14)',
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
// Crema lisa. Nada de textura ni de resplandores: la profundidad la ponen las
// tarjetas (blanco cálido, borde fino, sombra en capas), no el fondo.
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
  border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink,
  fontSize: '14px', fontFamily: DT.body, lineHeight: 1.6, outline: 'none',
}

// La misma caja en una sola línea (fechas, horas, selects).
export const FIELD_LINE: CSSProperties = {
  ...FIELD, height: '42px', padding: '0 12px', fontWeight: 600, lineHeight: 1,
}
