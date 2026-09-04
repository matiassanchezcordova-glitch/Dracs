// Copiloto clínico — guion y enrutado del mockup.
//
// Todo lo que hay aquí es contenido de ejemplo, escrito a mano. No hay modelo,
// no hay red, no hay recuperación de datos: el componente solo elige cuál de
// estas respuestas encaja mejor con lo que escribe el terapeuta.
//
// Regla de contenido: cada respuesta cuenta lo que pasó (partidas, áreas que
// se jugaron, lo que se atascó) y declara su fuente en `src`. Ninguna afirma
// una mejora clínica ni emite un juicio: eso es del terapeuta.

export const GREETING = "Hola, Marina. Te leo el caseload y te preparo borradores, pero no valoro ni diagnostico: eso lo decides tú. ¿Por dónde arrancamos?"

export interface CopilotAnswer {
  id: string
  chip: string
  keys: string[]
  text: string
  src: string
  dist?: [string, number][]
  draft?: string
}

export const ANSWERS: CopilotAnswer[] = [
  { id: 'quien', chip: '¿Quién no abrió esta semana?',
    keys: ['no abr','quien','esta semana','abrio','jugo'],
    text: "Lucía no abrió desde el lunes. Valentina todavía no ha empezado. Pol y Mateo sí: Pol 4 veces, Mateo 3.",
    src: "de las partidas reales de tus 4 carpetas" },
  { id: 'area', chip: '¿En qué se apoya Pol?',
    keys: ['apoya','area','pol','en que','fuerte','distribu'],
    text: "Esto es lo que más jugó Pol, no una valoración:",
    dist: [['Lenguaje receptivo',46],['Atención',22],['Cognición',18],['Motricidad fina',14]],
    src: "de 12 partidas de Pol" },
  { id: 'redacta', chip: 'Redacta el comentario para la familia de Mateo',
    keys: ['redacta','comentario','familia','informe','escrib','mensaje','carta'],
    text: "Te dejo un borrador con lo que pasó esta semana, sin afirmar mejoras. Tú lo revisas y lo firmas:",
    draft: "Esta semana Mateo jugó tres veces por su cuenta, siempre en el mar. Le costó uno de los juegos de ordenar y lo repitió varias veces, que es justo lo que queremos: que insista. La semana que viene le propongo empezar por ahí. Gracias por acompañarlo en casa.",
    src: "de 3 partidas de Mateo" },
  { id: 'prep', chip: 'Prepárame la sesión de las 17:30',
    keys: ['prepar','sesion','17:30','briefing','proxima','mateo hoy'],
    text: "Mateo, hoy 17:30. Tres cosas cambiaron desde que lo viste:\n\n1.  Jugó 3 veces solo, siempre en el mar.\n2.  Se atascó en \"ordena la escena\" (2 de 5, lo repitió 3 veces).\n3.  No tocó los juegos de casa que fijaste.\n\nPunto de partida cómodo: el mar. Punto a mirar con la familia: por qué lo de casa no arrancó.",
    src: "de la carpeta de Mateo" },
]

export const FALLBACK: CopilotAnswer = {
  id: 'fallback', chip: '', keys: [],
  text: "Por ahora trabajo solo con lo que los niños jugaron en Dracs, así que puedo contarte quién jugó, en qué áreas se apoyó cada uno, prepararte una sesión o redactar un borrador para la familia. Lo que no voy a hacer es valorar ni diagnosticar: eso es tuyo. ¿Empezamos por la sesión de Mateo?",
  src: "límite honesto de la vista previa",
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
