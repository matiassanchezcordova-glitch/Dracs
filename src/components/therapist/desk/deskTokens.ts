// Escritorio del Terapeuta — tokens y helpers puros (sin componentes, para que
// fast-refresh trate deskUI.tsx como archivo de sólo-componentes).
//
// Paleta oficial, sobria y cálida. El amarillo sigue siendo el único pop (acción
// primaria y foco), pero la vista no es monocroma: el azul, la mostaza y la
// arena entran como acentos suaves y cada sección abre con el suyo.
//
// Tres reglas de profundidad que mandan sobre cualquier estilo suelto:
//   1. El fondo NO es un crema plano: lleva grano casi imperceptible y un
//      resplandor cálido arriba (SURFACE).
//   2. El color de una tarjeta NUNCA es el del fondo. La tarjeta va en blanco
//      cálido, un punto por encima de la crema.
//   3. Las tarjetas flotan: borde 1px cálido y sombra en dos capas (contacto
//      corta y difusa larga).

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
// Grano: ruido gris tejido, al 5% y en mosaico de 170px. A esa opacidad no se
// ve como textura, se nota como papel. Va en el propio background del
// contenedor (no en una capa absoluta) para que cubra todo el alto del scroll.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='170' height='170'%3E" +
  "%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E" +
  "%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E" +
  "%3Crect width='170' height='170' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E\")"

// Resplandor cálido arriba: amarillo al 5,5% y arena al 5%. Da temperatura a la
// cabecera sin que se lea como una franja de color.
const GLOW_YELLOW = 'radial-gradient(780px 320px at 50% -70px, rgba(247,195,28,0.055), rgba(247,195,28,0) 72%)'
const GLOW_SAND = 'radial-gradient(560px 280px at 8% -30px, rgba(199,162,79,0.05), rgba(199,162,79,0) 70%)'

export const SURFACE: CSSProperties = {
  backgroundColor: DT.cream,
  backgroundImage: `${GRAIN}, ${GLOW_YELLOW}, ${GLOW_SAND}`,
  backgroundRepeat: 'repeat, no-repeat, no-repeat',
  backgroundSize: '170px 170px, 100% 390px, 100% 330px',
  backgroundPosition: '0 0, 50% 0, 0 0',
}

// La misma superficie para paneles que no son la página (el copiloto), con el
// resplandor recortado al ancho del panel.
export const SURFACE_PANEL: CSSProperties = {
  backgroundColor: DT.cream,
  backgroundImage: `${GRAIN}, radial-gradient(420px 200px at 50% -40px, rgba(247,195,28,0.07), rgba(247,195,28,0) 72%)`,
  backgroundRepeat: 'repeat, no-repeat',
  backgroundSize: '170px 170px, 100% 240px',
  backgroundPosition: '0 0, 50% 0',
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0] ?? '?').slice(0, 2).toUpperCase()
}

// El dragón de la marca. Aparece como filigrana en cabeceras y como ilustración
// en los estados vacíos; nunca como decoración suelta.
export const DRAGON = '/brand/dracs-dragon.png'
