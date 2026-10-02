// Tokens de la Casa de la Familia. Salen de src/lib/brand.ts, la misma paleta
// de la web y del escritorio del profesional: títulos en serif, texto en sans,
// tarjetas blancas sobre gris papel. El color de verdad lo ponen los lugares
// del mundo del niño (sus sellos, el lugar de hoy) y el amarillo del botón.
// Se mantienen como objeto para encajar con los estilos en línea de la app.

import { BRAND } from '../../../lib/brand'

export const HT = {
  cream: BRAND.paper2,
  creamCard: BRAND.paper2,   // rellenos dentro de una tarjeta blanca
  sand: BRAND.paper3,
  ink: BRAND.ink,
  taupe: BRAND.faint,
  muted: BRAND.note,
  line: BRAND.line,
  white: '#FFFFFF',

  blue: BRAND.data,          // acentos, íconos y enlaces
  blueDeep: BRAND.ink,       // títulos
  blueTint: BRAND.paper3,    // fondos de avatar/chip
  night: BRAND.night,
  yellow: BRAND.yellow,
  yellowHover: BRAND.yellowHover,
  yellowSoft: '#FBE7A6',
  turquoise: BRAND.data,
  mint: '#10B981',
  orange: BRAND.ochre,

  display: BRAND.sans,       // rótulos de interfaz y botones
  serif: BRAND.serif,        // títulos y la voz de la carta
  body: BRAND.sans,

  radius: BRAND.radius,
  radiusSm: BRAND.radiusSm,
  shadow: BRAND.shadow,
  shadowSoft: BRAND.shadowSoft,
  shadowLift: BRAND.shadowLift,
} as const

// Ancho de la única columna cálida de la casa.
export const COLUMN_MAX = 760
