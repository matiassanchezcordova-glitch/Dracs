// Escritorio del Terapeuta — tokens y helpers puros (sin componentes, para que
// fast-refresh trate deskUI.tsx como archivo de sólo-componentes).
//
// Paleta oficial, sobria, un solo acento amarillo. Sin hues nuevos: sólo las
// oficiales (Tinta, Azul, Arena, Amarillo, Mostaza, Topo, Crema), con opacidad
// sobre Tinta para el texto secundario (contraste accesible).

export const DT = {
  cream: '#FAF5E8',       // fondo de la superficie
  white: '#FFFFFF',       // tarjetas (lectura clínica nítida)
  arena: '#EDE4D1',       // rellenos suaves (chips, avatares, filas)
  line: '#DED2BA',        // borde cálido, un punto más marcado que la hairline
  ink: '#33302A',         // texto principal (Tinta)
  muted: 'rgba(51,48,42,0.60)',   // texto secundario (Tinta 60% ≈ AA)
  faint: 'rgba(51,48,42,0.42)',   // etiquetas/uppercase discretas
  topo: '#9A8F7E',        // neutro para íconos/rellenos
  azul: '#5B8896',        // estructura y acentos
  yellow: '#F7C31C',      // único pop (activo, acción primaria)
  mostaza: '#C7A24F',     // acento de atención (requiere mirada)

  // Tinte del avatar de iniciales. Opaco a propósito: sobre la tarjeta blanca
  // tiene que leerse como CHIP, no como un hueco recortado en la card (que es
  // lo que pasaba usando `arena`, casi idéntico a la crema del fondo).
  azulTint: '#DFEAEE',
  azulTintLine: 'rgba(91,136,150,0.30)',
  azulInk: '#3E6773',     // iniciales sobre el tinte (contraste AA)

  display: 'Fredoka, system-ui, sans-serif',
  body: 'Nunito, sans-serif',

  radius: '18px',
  radiusSm: '12px',

  // Sombras en capas: una de contacto muy corta y una difusa larga. Con una
  // sola capa suave las tarjetas se leían recortadas sobre la crema, como papel
  // pegado; con las dos se levantan sin endurecerse.
  shadow: '0 1px 2px rgba(51,48,42,0.06), 0 10px 26px rgba(51,48,42,0.10)',
  shadowSoft: '0 1px 2px rgba(51,48,42,0.05), 0 5px 16px rgba(51,48,42,0.07)',
} as const

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0] ?? '?').slice(0, 2).toUpperCase()
}
