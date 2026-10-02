// Sistema visual compartido entre la web y la app (vistas del profesional y de
// la familia). Son los mismos valores que la landing declara en landing.css
// (--lp-*): así entrar a la demo no se siente como cambiar de producto.
//
// El mundo del niño (mapa y juegos) conserva su paleta por lugar y Fredoka:
// es el único sitio donde el color manda, igual que en la web.

export const BRAND = {
  paper: '#FFFFFF',
  paper2: '#F4F4F1',       // fondo de la app: la sección "alt" de la web
  paper3: '#ECEDE9',       // rellenos suaves (rieles, chips de dato)
  ink: '#15191B',
  note: '#5E6468',         // texto secundario (AA sobre blanco y sobre paper2)
  faint: '#80868A',        // pies y metadatos
  line: '#E3E4E0',
  lineStrong: '#C9CBC6',   // borde de campos de texto
  night: '#17313A',        // superficies oscuras y pestaña activa
  night2: '#1F3D47',
  data: '#3F6B78',         // estructura y datos
  dataTint: '#E7EEF0',
  dataInk: '#2E5561',
  yellow: '#F7C31C',       // la acción principal, nada más
  yellowHover: '#E9B50F',
  yellowTint: '#FDF3D4',
  ochre: '#B9892A',        // "requiere mirada"
  ochreTint: '#FAF0DA',
  ochreInk: '#6F5310',

  serif: "'Source Serif 4', Georgia, 'Times New Roman', serif",
  sans: "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  kid: "Fredoka, system-ui, sans-serif",

  radius: '16px',
  radiusSm: '12px',
  shadow: '0 1px 2px rgba(21,25,27,0.04), 0 10px 28px -14px rgba(21,25,27,0.16)',
  shadowSoft: '0 1px 2px rgba(21,25,27,0.05)',
  shadowLift: '0 2px 4px rgba(21,25,27,0.05), 0 20px 40px -16px rgba(21,25,27,0.24)',
} as const
