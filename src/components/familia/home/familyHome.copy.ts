// ─────────────────────────────────────────────────────────────────────────────
// Casa de la Familia — copy central (Castellano cálido, nunca clínico).
//
// Toda la copy de la casa vive acá. La familia NUNCA ve métricas, sesiones,
// ejercicios ni niveles: sólo progreso emocional (principio de producto 5).
// Los identificadores están en inglés; los textos, en español.
// ─────────────────────────────────────────────────────────────────────────────

import type { Icon } from '@phosphor-icons/react'
import { Hourglass, Palette, TShirt, Eye, Sparkle } from '@phosphor-icons/react'

// El nombre del asistente vive en UNA sola constante para poder renombrarlo
// trivialmente (placeholder de la fase de mockup).
export const DRAGUI = 'Dragui'

// ── La puerta (hero) ─────────────────────────────────────────────────────────

export function doorTitle(childName: string): string {
  return `La casa de ${childName}`
}

// Subtítulo en la voz del mundo, según cómo viene la semana. Sin números.
export interface WeekSignal {
  firstTime: boolean          // la cuenta todavía no jugó nunca
  hasActivityThisWeek: boolean
  band: 'none' | 'light' | 'steady' | 'strong'
  improving: boolean          // mejor que la semana pasada
  streakDays: number          // días seguidos jugando (para la voz, no se muestra)
}

export function doorSubline(childName: string, s: WeekSignal): string {
  if (s.firstTime) {
    return `${childName} está por abrir la puerta de su mundo por primera vez.`
  }
  if (!s.hasActivityThisWeek) {
    return `El mundo de ${childName} lo espera despierto. Cualquier ratito de hoy vale.`
  }
  if (s.streakDays >= 3) {
    return `${childName} viene visitando su mundo día tras día. Se nota el cariño.`
  }
  if (s.improving) {
    return `Esta semana ${childName} volvió con más ganas que nunca.`
  }
  switch (s.band) {
    case 'strong': return `Fue una semana llena para ${childName}. Qué bueno tenerte en casa.`
    case 'steady': return `${childName} anduvo por su mundo esta semana. Pasa, mira cómo le fue.`
    default:       return `${childName} dio sus primeros pasitos esta semana. Vamos de a poco.`
  }
}

// ── Carta de la semana ───────────────────────────────────────────────────────
// 1–2 frases cálidas en la voz del dragón/mundo. Deriva de datos reales
// (actividad, racha, tendencia) pero jamás enuncia un número.

export function cartaTitle(): string {
  return 'La carta de esta semana'
}

export function cartaBody(childName: string, s: WeekSignal): string {
  if (s.firstTime) {
    return `Todavía no nos conocemos del todo, pero el Bosque de las Palabras ya tiene un lugar guardado para ${childName}. Cuando quieras, abrimos la puerta juntos.`
  }
  if (!s.hasActivityThisWeek) {
    return `Esta semana el mundo estuvo tranquilo esperando a ${childName}. No pasa nada: mañana es un gran día para volver a jugar, aunque sea un ratito.`
  }
  if (s.streakDays >= 3) {
    return `Esta semana ${childName} volvió a su mundo casi todos los días, y cada vez se lo vio un poquito más seguro. Esa constancia, en casa, vale muchísimo.`
  }
  if (s.improving) {
    return `Esta semana ${childName} volvió al Bosque de las Palabras y cada vez esperó un poquito mejor su turno. Se lo notó más animado que la semana pasada.`
  }
  switch (s.band) {
    case 'strong':
      return `¡Qué semana la de ${childName}! Recorrió su mundo con energía y ganas de más. Se nota cuando alguien lo acompaña desde casa.`
    case 'steady':
      return `Esta semana ${childName} pasó a saludar a su mundo y se quedó a jugar un rato. Cada vuelta, un pasito más.`
    default:
      return `Esta semana ${childName} asomó la cabeza en su mundo y se animó a empezar. Los comienzos son lo más valiente de todo.`
  }
}

// ── Una cosa para hoy (CTA) ──────────────────────────────────────────────────
// Entrega UN lugar del día (pick diario cálido, no una recomendación clínica).
// El niño conserva su agencia dentro del lugar: sólo evitamos "caer al mundo
// entero". Ver getPlaceOfTheDay() en placeOfTheDay.ts.

// Un solo kicker para toda la tarjeta: el nombre del lugar (o del juego) ya
// dice qué es. Los hints son de UNA línea.
export const TODAY_KICKER = 'Una cosa para hoy'
export const TODAY_CTA = 'Jugar juntos 5 minutos'

export function todayHint(childName: string): string {
  return `Siéntate al lado de ${childName}: con cinco minutos alcanza.`
}

// Sugerencia guiada por el énfasis del terapeuta. Nunca menciona al terapeuta ni
// jerga clínica: sólo calidez. El niño sólo juega.
export function todayGameName(childName: string): string {
  return `Un juego pensado para ${childName}`
}

export function todayGameHint(): string {
  return 'Siéntate a su lado: con cinco minutos alcanza.'
}

// ── El asistente (mockup bloqueado) ──────────────────────────────────────────

export const ASSISTANT_SUBTITLE = 'Tu ayudante para practicar en casa'
export const ASSISTANT_PREVIEW_BADGE = 'Vista previa'
export const ASSISTANT_LOCKED_PLACEHOLDER = 'Muy pronto…'

export function assistantGreeting(childName: string): string {
  return `Hola, soy ${DRAGUI}. Cuéntame qué le cuesta a ${childName} en el día a día y te preparo un juego para practicar.`
}

export function assistantPreviewNote(childName: string): string {
  return `Esto es una vista previa. Muy pronto vas a poder crear juegos de verdad para ${childName}.`
}

export const WAITLIST_CTA = 'Avísame cuando esté'
export const WAITLIST_THANKS = '¡Listo! Te avisamos apenas esté disponible.'

// Una tarjeta-juego de ejemplo que el asistente "crea" al responder.
export interface MiniExercise {
  title: string
  skillTag: string
  Icon: Icon         // ícono Phosphor (sin emoji nativo)
  gradient: string   // CSS gradient para el placeholder de imagen
}

// Cada chip → respuesta guionada + tarjeta de ejemplo. `reply` usa {name}.
export interface ScriptedReply {
  id: string
  chip: string
  reply: string
  exercise: MiniExercise
}

export const ASSISTANT_CHIPS: ScriptedReply[] = [
  {
    id: 'turnos',
    chip: 'Le cuesta esperar su turno',
    reply: 'Te preparé un jueguito de turnos: {name} y su dragón se van pasando la pelota, y el dragón espera para enseñarle que a veces toca esperar. Suave, sin apuros.',
    exercise: { title: 'La pelota que va y viene', skillTag: 'Esperar el turno', Icon: Hourglass, gradient: 'linear-gradient(135deg, #3FB8C4, #1A8FB5)' },
  },
  {
    id: 'colores',
    chip: 'Quiero trabajar los colores',
    reply: 'Armé un juego de colores para {name}: aparecen objetos de su mundo y hay que atrapar los del color que pide el dragón. Empezamos por tres colores y vamos sumando.',
    exercise: { title: 'Atrapa el color', skillTag: 'Colores', Icon: Palette, gradient: 'linear-gradient(135deg, #F7C31C, #FF8551)' },
  },
  {
    id: 'vestirse',
    chip: 'Le cuesta vestirse solo a la mañana',
    reply: 'Preparé una rutina de la mañana en dibujos: {name} ordena los pasos para vestirse, de las medias al abrigo. Así la mañana se vuelve un juego conocido.',
    exercise: { title: 'La mañana de {name}', skillTag: 'Rutina de vestirse', Icon: TShirt, gradient: 'linear-gradient(135deg, #9B8FD4, #7A6FBA)' },
  },
  {
    id: 'mirada',
    chip: 'Trabajar el contacto visual',
    reply: 'Te dejé un juego de miraditas: el dragón aparece en distintos rincones y {name} lo encuentra con la mirada antes de tocarlo. Cortito y con mucho festejo.',
    exercise: { title: 'Encuentra al dragón', skillTag: 'Contacto visual', Icon: Eye, gradient: 'linear-gradient(135deg, #4A3F73, #352C56)' },
  },
]

// Respuesta genérica para CUALQUIER entrada fuera de los chips, de modo que
// nunca se rompa la ilusión del mockup.
export function fallbackReply(childName: string): ScriptedReply {
  return {
    id: 'generico',
    chip: '',
    reply: `¡Buenísimo! Con eso puedo armarle a ${childName} un juego a medida para practicarlo en casa, paso a paso y con mucho festejo.`,
    exercise: { title: `Un juego para ${childName}`, skillTag: 'A medida', Icon: Sparkle, gradient: 'linear-gradient(135deg, #1A8FB5, #10B981)' },
  }
}

// ── Continuidad ("el mundo lo espera") ───────────────────────────────────────

export const CONTINUITY_KICKER = 'El mundo lo espera'

export function continuityLine(childName: string): string {
  return `Todo quedó tal cual: el mundo de ${childName} sigue ahí, esperando la próxima visita.`
}

export const CONTINUITY_CTA = 'Abrir su mundo'

// ── Estados ──────────────────────────────────────────────────────────────────

export const LOADING_HINT = 'Abriendo la puerta…'
