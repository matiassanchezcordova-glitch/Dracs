// Copiloto clínico — guion y enrutado del mockup.
//
// Todo lo que hay aquí es contenido de ejemplo, escrito a mano. No hay modelo,
// no hay red, no hay recuperación de datos: el componente solo elige cuál de
// estas respuestas encaja mejor con lo que escribe el terapeuta.
//
// Regla de contenido: cada respuesta cuenta lo que pasó (partidas, áreas que
// se jugaron, lo que se atascó). Ninguna afirma una mejora clínica ni emite un
// juicio: eso es del terapeuta.
//
// `src` es opcional a propósito. Solo lo llevan las respuestas donde saber de
// cuántas partidas sale el dato cambia cómo se lee (la distribución por áreas y
// el repaso de la semana). En las conversacionales no aporta y no se pinta.

export const GREETING = "Hola, Marina. Miro cómo va cada niño en casa y te preparo borradores. ¿Por dónde empezamos?"

// Grupos de un repaso: una etiqueta, un punto de color y los nombres. Se
// dibujan como filas, no como párrafo, para que se escaneen de un vistazo.
export interface AnswerGroup {
  tone: 'played' | 'idle'
  label: string
  names: string[]
}

export interface CopilotAnswer {
  id: string
  chip: string
  keys: string[]
  text: string
  src?: string
  groups?: AnswerGroup[]
  dist?: [string, number][]
  draft?: string
}

export const ANSWERS: CopilotAnswer[] = [
  { id: 'quien', chip: '¿Quién no abrió esta semana?',
    keys: ['no abr','quien','esta semana','abrio','jugo'],
    text: "Esta semana va así:",
    groups: [
      { tone: 'idle', label: 'Sin abrir', names: ['Lucía (desde el lunes)', 'Valentina (aún no ha empezado)'] },
      { tone: 'played', label: 'Jugando', names: ['Pol (4 veces)', 'Mateo (3 veces)'] },
    ],
    src: "Según las partidas de tus 4 carpetas." },
  { id: 'area', chip: '¿En qué se apoya Pol?',
    keys: ['apoya','area','pol','en que','fuerte','distribu'],
    text: "Esto es lo que más jugó Pol, no una valoración:",
    dist: [['Lenguaje receptivo',46],['Atención',22],['Cognición',18],['Motricidad fina',14]],
    src: "Según 12 partidas de Pol." },
  { id: 'redacta', chip: 'Redacta el comentario para la familia de Mateo',
    keys: ['redacta','comentario','familia','informe','escrib','mensaje','carta'],
    text: "Te dejo un borrador con lo que pasó esta semana, sin afirmar mejoras:",
    draft: "Esta semana Mateo jugó tres veces por su cuenta, siempre en el mar. Le costó uno de los juegos de ordenar y lo repitió varias veces, que es justo lo que queremos: que insista. La semana que viene le propongo empezar por ahí. Gracias por acompañarlo en casa." },
  { id: 'prep', chip: 'Prepárame la sesión de las 17:30',
    keys: ['prepar','sesion','17:30','briefing','proxima','mateo hoy'],
    text: "Mateo, hoy 17:30. Tres cosas cambiaron desde que lo viste:\n\n1.  Jugó 3 veces solo, siempre en el mar.\n2.  Se atascó en \"ordena la escena\" (2 de 5, lo repitió 3 veces).\n3.  No tocó los juegos de casa que fijaste.\n\nPunto de partida cómodo: el mar. Punto a mirar con la familia: por qué lo de casa no arrancó." },
]

export const FALLBACK: CopilotAnswer = {
  id: 'fallback', chip: '', keys: [],
  text: "Por ahora trabajo solo con lo que los niños jugaron en Dracs, así que puedo contarte quién jugó, en qué áreas se apoyó cada uno, prepararte una sesión o redactar un borrador para la familia. ¿Empezamos por la sesión de Mateo?",
}

// Minúsculas y sin acentos, para que "sesión" y "sesion" enruten igual.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Enrutado por conteo de coincidencias: gana la respuesta con más keywords
// presentes en la frase. Sin coincidencias, el límite honesto (FALLBACK).
export function route(text: string): CopilotAnswer {
  const q = normalize(text)
  let best: CopilotAnswer = FALLBACK
  let bestScore = 0
  for (const answer of ANSWERS) {
    const score = answer.keys.filter(k => q.includes(normalize(k))).length
    if (score > bestScore) {
      best = answer
      bestScore = score
    }
  }
  return bestScore > 0 ? best : FALLBACK
}
