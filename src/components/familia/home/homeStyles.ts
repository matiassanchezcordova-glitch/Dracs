// Tokens compartidos de la Casa de la Familia. Reutilizan la paleta de marca
// (§6) y las fuentes ya cargadas (Fredoka / Nunito). Se mantienen como objeto
// para encajar con el idioma de estilos en línea del resto de la app.

export const HT = {
  cream: '#FAF5E8',
  creamCard: '#FFFDF7',
  sand: '#EDE4D1',
  ink: '#33302A',
  taupe: '#9A8F7E',
  muted: '#6B7280',
  line: '#EFE7D6',
  white: '#FFFFFF',

  // Paleta oficial (PHASE 0): el azul-forward turquesa se retira. Estructura y
  // acentos = Azul #5B8896; títulos/cuerpo = Tinta #33302A. El único pop es el
  // amarillo. (El azul brillante #1A8FB5 sigue vivo sólo en la landing.)
  blue: '#5B8896',       // Azul — sólo acentos, íconos y enlaces
  blueDeep: '#33302A',   // Tinta — títulos y encabezados (alto contraste)
  blueTint: '#EDE4D1',   // Arena (token oficial) — fondos de avatar/chip; texto en Tinta
  yellow: '#F7C31C',
  yellowSoft: '#FBE7A6',
  turquoise: '#5B8896',  // ex-turquesa, ahora Azul
  mint: '#10B981',
  orange: '#F59E0B',

  display: 'Fredoka, system-ui, sans-serif',
  body: 'Nunito, sans-serif',

  radius: '22px',
  radiusSm: '16px',
  shadow: '0 6px 24px rgba(51,48,42,0.07)',
  shadowSoft: '0 3px 14px rgba(51,48,42,0.05)',
  shadowLift: '0 14px 36px rgba(51,48,42,0.13)',
} as const

// Ancho de la única columna cálida de la casa.
export const COLUMN_MAX = 720
