// ─────────────────────────────────────────────────────────────────────────────
// Casa de la Familia — copy central (Castellano cálido, nunca clínico).
//
// Toda la copy de la casa vive aquí. La familia NUNCA ve métricas, sesiones,
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

// Subtítulo de la casa: dice qué hay aquí y nada más. Cómo fue la semana lo
// cuenta la carta, justo debajo; repetirlo aquí era decir lo mismo dos veces.
export function doorSubline(childName: string, s: WeekSignal): string {
  if (s.firstTime) return `${childName} está a punto de abrir la puerta de su mundo por primera vez.`
  return `Cómo le ha ido a ${childName} esta semana y una cosa para hacer hoy.`
}

// ── Carta de la semana ───────────────────────────────────────────────────────
// 1–2 frases cálidas en la voz del dragón/mundo. Deriva de datos reales
// (actividad, racha, tendencia) pero jamás enuncia un número.

export function cartaTitle(): string {
  return 'La carta de la semana'
}

export function cartaBody(childName: string, s: WeekSignal): string {
  if (s.firstTime) {
    return `Todavía no nos conocemos del todo, pero el mar, la casa y el faro ya tienen un lugar guardado para ${childName}. Cuando quieras, abrimos la puerta juntos.`
  }
  if (!s.hasActivityThisWeek) {
    return `Esta semana el mundo ha estado tranquilo esperando a ${childName}. No pasa nada: mañana es un buen día para volver a jugar, aunque sea un rato.`
  }
  if (s.streakDays >= 3) {
    return `Esta semana ${childName} ha vuelto a su mundo casi todos los días, y cada vez se le ha visto un poco más seguro. Esa constancia, en casa, vale muchísimo.`
  }
  if (s.improving) {
    return `Esta semana ${childName} ha vuelto a su mundo con más ganas que la semana pasada. Cada vuelta, un paso más.`
  }
  switch (s.band) {
    case 'strong':
      return `¡Qué semana la de ${childName}! Ha recorrido su mundo con energía y con ganas de más. Se nota cuando alguien lo acompaña desde casa.`
    case 'steady':
      return `Esta semana ${childName} ha pasado a saludar a su mundo y se ha quedado a jugar un rato. Cada vuelta, un paso más.`
    default:
      return `Esta semana ${childName} se ha asomado a su mundo y se ha animado a empezar. Los comienzos son lo más valiente de todo.`
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
  return `Siéntate al lado de ${childName}: con cinco minutos basta.`
}

// Sugerencia guiada por el énfasis del terapeuta. Nunca menciona al terapeuta ni
// jerga clínica: sólo calidez. El niño sólo juega.
export function todayGameName(childName: string): string {
  return `Un juego pensado para ${childName}`
}

export function todayGameHint(): string {
  return 'Siéntate a su lado: con cinco minutos basta.'
}

// ── El recorrido ─────────────────────────────────────────────────────────────
// Por dónde ha ido el niño, en voz de camino. NUNCA un número clínico: ni
// aciertos, ni niveles, ni "sesiones". Sólo días, lugares y esfuerzo.

export function recorridoTitle(childName: string): string {
  return `El recorrido de ${childName}`
}

export const RECORRIDO_SUBTITLE = 'Su camino, semana a semana'
export const RECORRIDO_DAYS_LABEL = 'Los días que ha abierto su mundo'
export const RECORRIDO_PLACES_LABEL = 'Los lugares que conoce'
export const RECORRIDO_HINT = 'Toca un día para ver dónde estuvo.'

export function recorridoEmpty(childName: string): string {
  return `Cuando ${childName} empiece a jugar, aquí verás su camino: los días que abre su mundo y los lugares que va conociendo.`
}

// Línea del día tocado. `placeNames` ya viene en nombres cálidos ("el mar").
export function recorridoDayLine(childName: string, placeNames: string[]): string {
  if (placeNames.length === 0) return `Ese día ${childName} pasó por su mundo.`
  if (placeNames.length === 1) return `Ese día ${childName} visitó ${placeNames[0]}.`
  const last = placeNames[placeNames.length - 1]
  return `Ese día ${childName} visitó ${placeNames.slice(0, -1).join(', ')} y ${last}.`
}

export function recorridoDayEmpty(childName: string): string {
  return `Ese día ${childName} no abrió su mundo. No pasa nada: el camino sigue.`
}

// Constancia, como aliento y nunca como métrica.
//
// REGLA DURA: el texto no puede contradecir a las piedritas. Si la piedra de
// hoy está apagada, NINGUNA rama puede afirmar que jugó hoy. Por eso `playedToday`
// no se deduce de la racha: una racha de 1 puede ser "jugó ayer y hoy todavía
// no", que era justo el caso que decía "pasó por su mundo hoy" con la piedra de
// hoy apagada. Viene del mismo `journey.days` que pinta la piedra.
export function recorridoStreak(
  childName: string,
  streakDays: number,
  playedThisWeek: number,
  playedToday: boolean,
): string {
  // Sólo estas dos ramas pueden decir "hoy", y ambas exigen playedToday.
  if (playedToday && streakDays >= 2) return `${childName} ha vuelto ${streakDays} días seguidos, hoy incluido.`
  if (playedToday) return `${childName} ha pasado hoy por su mundo.`

  // De aquí para abajo, hoy está apagado: se habla de la racha o de la semana.
  if (streakDays >= 2) return `${childName} ha vuelto ${streakDays} días seguidos.`
  if (streakDays === 1) return `${childName} pasó por aquí ayer.`
  if (playedThisWeek > 0) return `${childName} ha pasado por aquí esta semana.`
  return `El mundo de ${childName} lo espera despierto.`
}

// Un hito de la semana, derivado de datos reales y dicho en cálido. Devuelve
// null si esta semana todavía no hay nada honesto que celebrar.
export function recorridoMilestone(
  childName: string,
  o: {
    firstTime: boolean
    everyPlaceVisited: boolean
    newPlaceNames: string[]
    streakDays: number
    daysPlayedThisWeek: number
    placesKnown: number
  },
): string | null {
  if (o.firstTime) return null
  if (o.everyPlaceVisited) return `${childName} ya conoce todos los rincones de su mundo. Recorrerlo entero no es poca cosa.`
  if (o.newPlaceNames.length === 1) return `Esta semana ${childName} se ha atrevido por primera vez con ${o.newPlaceNames[0]}.`
  if (o.newPlaceNames.length > 1) return `Esta semana ${childName} ha descubierto ${o.newPlaceNames.length} lugares nuevos de su mundo.`
  if (o.streakDays >= 3) return `${childName} ha vuelto a su mundo ${o.streakDays} días seguidos. Esa constancia se construye en casa.`
  if (o.daysPlayedThisWeek >= 3) return `Esta semana ${childName} ha abierto su mundo varias veces. Se nota que le gusta volver.`
  if (o.daysPlayedThisWeek > 0) return `Esta semana ${childName} ha vuelto a su mundo. Cada vuelta cuenta.`
  if (o.placesKnown > 0) return `${childName} ya conoce ${o.placesKnown === 1 ? 'un lugar' : `${o.placesKnown} lugares`} de su mundo, esperándolo para la próxima.`
  return null
}

export const RECORRIDO_MILESTONE_KICKER = 'Lo que se ha atrevido a hacer'

// ── El asistente (mockup bloqueado) ──────────────────────────────────────────

export const ASSISTANT_SUBTITLE = 'Tu ayudante para practicar en casa'
export const ASSISTANT_PREVIEW_BADGE = 'Vista previa'
export const ASSISTANT_LOCKED_PLACEHOLDER = 'Muy pronto…'

export function assistantGreeting(childName: string): string {
  return `Hola, soy ${DRAGUI}. Cuéntame qué le cuesta a ${childName} en el día a día y te preparo un juego para practicar.`
}

export function assistantPreviewNote(childName: string): string {
  return `Esto es una vista previa. Muy pronto podrás crear juegos de verdad para ${childName}.`
}

export const WAITLIST_CTA = 'Avísame cuando esté'
export const WAITLIST_THANKS = '¡Hecho! Te avisamos en cuanto esté disponible.'

// Una tarjeta-juego de ejemplo que el asistente "crea" al responder.
export interface MiniExercise {
  title: string
  skillTag: string
  Icon: Icon         // ícono Phosphor (sin emoji nativo)
  gradient: string   // color de fondo de la tarjeta (el de un lugar del mundo)
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
    reply: 'Te he preparado un juego de turnos: {name} y su dragón se van pasando la pelota, y el dragón espera para enseñarle que a veces toca esperar. Con calma, sin prisas.',
    exercise: { title: 'La pelota que va y viene', skillTag: 'Esperar el turno', Icon: Hourglass, gradient: '#3FB8C4' },
  },
  {
    id: 'colores',
    chip: 'Quiero trabajar los colores',
    reply: 'He preparado un juego de colores para {name}: aparecen objetos de su mundo y hay que atrapar los del color que pide el dragón. Empezamos por tres colores y vamos sumando.',
    exercise: { title: 'Atrapa el color', skillTag: 'Colores', Icon: Palette, gradient: '#E8A93A' },
  },
  {
    id: 'vestirse',
    chip: 'Le cuesta vestirse solo por la mañana',
    reply: 'He preparado una rutina de la mañana en dibujos: {name} ordena los pasos para vestirse, de los calcetines al abrigo. Así la mañana se vuelve un juego conocido.',
    exercise: { title: 'La mañana de {name}', skillTag: 'Rutina de vestirse', Icon: TShirt, gradient: '#9B8FD4' },
  },
  {
    id: 'mirada',
    chip: 'Trabajar el contacto visual',
    reply: 'Te he dejado un juego de miradas: el dragón aparece en distintos rincones y {name} lo encuentra con la mirada antes de tocarlo. Corto y con muchas celebraciones.',
    exercise: { title: 'Encuentra al dragón', skillTag: 'Contacto visual', Icon: Eye, gradient: '#4A3F73' },
  },
]

// Respuesta genérica para CUALQUIER entrada fuera de los chips, de modo que
// nunca se rompa la ilusión del mockup.
export function fallbackReply(childName: string): ScriptedReply {
  return {
    id: 'generico',
    chip: '',
    reply: `¡Genial! Con eso puedo prepararle a ${childName} un juego a medida para practicarlo en casa, paso a paso y con muchas celebraciones.`,
    exercise: { title: `Un juego para ${childName}`, skillTag: 'A medida', Icon: Sparkle, gradient: '#1E5FAA' },
  }
}

// ── Continuidad ("el mundo lo espera") ───────────────────────────────────────

export const CONTINUITY_KICKER = 'El mundo lo espera'

export function continuityLine(childName: string): string {
  return `Todo está como lo dejó: el mundo de ${childName} sigue ahí, esperando la próxima visita.`
}

export const CONTINUITY_CTA = 'Abrir su mundo'

// ── Estados ──────────────────────────────────────────────────────────────────

export const LOADING_HINT = 'Abriendo la puerta…'
