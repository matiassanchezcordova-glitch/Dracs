// Copiloto clínico: respuestas y enrutado.
//
// No hay modelo ni red. Las respuestas se arman con los MISMOS datos que ve el
// escritorio (las carpetas, su historial, la agenda), así que el copiloto nunca
// cuenta algo distinto de lo que dice la tarjeta de un paciente o su Resumen.
// El componente solo elige cuál encaja con lo que escribe el terapeuta.
//
// Regla de contenido: cada respuesta cuenta lo que pasó (partidas, áreas que se
// jugaron, dónde). Ninguna afirma una mejora clínica ni emite un juicio: eso es
// del terapeuta. Si el dato no está, lo dice.
//
// `src` es opcional a propósito. Solo lo llevan las respuestas donde saber de
// cuántas partidas sale el dato cambia cómo se lee.

import type { Patient } from '../../../data/patients'
import { localAreas } from '../../../data/demoAreas'
import { PLACE_LABELS } from '../desk/labels'
import { deskStatus } from '../desk/patientStatus'
import { citasDe } from '../desk/agenda'
import { fromLocalHistory, localIso, rangeFor, statsFor, type DayRange } from '../desk/informeData'

export const GREETING = 'Hola. Miro lo que cada niño jugó en casa y te preparo borradores. ¿Por dónde empezamos?'

// Grupos de un repaso: una etiqueta y los nombres. Se dibujan como filas, no
// como párrafo, para que se escaneen de un vistazo.
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
  // Acción que esta respuesta deja ofrecida. Si el terapeuta contesta "sí", se
  // ejecuta. Regla: solo se pregunta lo que se puede cumplir.
  offers?: string
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

function veces(n: number): string {
  return `${n} ${n === 1 ? 'vez' : 'veces'}`
}

function joinY(list: string[]): string {
  if (list.length <= 1) return list[0] ?? ''
  return `${list.slice(0, -1).join(', ')} y ${list[list.length - 1]}`
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

// La semana en curso, de lunes a domingo, igual que el Resumen.
function thisWeek(): DayRange {
  const monday = new Date()
  const dow = monday.getDay()
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { from: localIso(monday), to: localIso(sunday) }
}

function historyIn(p: Patient, r: DayRange) {
  return (p.history ?? []).filter(s => s.date >= r.from && s.date <= r.to)
}

// Los lugares de un tramo, del más jugado al menos.
function placesByUse(p: Patient, r: DayRange): string[] {
  const counts = new Map<string, number>()
  for (const s of historyIn(p, r)) {
    for (const item of s.items ?? []) counts.set(item.place, (counts.get(item.place) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([place]) => PLACE_LABELS[place] ?? place)
}

function statusOf(p: Patient) {
  return deskStatus({
    sessionsThisWeek: p.metrics.sessionsThisWeek,
    lastPlayedISO: p.lastPlayedISO,
    totalSessions: p.totalSessions,
  })
}

// ── Quién jugó y quién no ────────────────────────────────────────────────────
function quienAnswer(patients: Patient[]): CopilotAnswer {
  const base = {
    id: 'quien', chip: '¿Quién no abrió esta semana?',
    keys: ['no abr', 'quien', 'esta semana', 'abrio', 'jugo'],
  }
  if (patients.length === 0) return { ...base, text: 'Todavía no tienes carpetas.' }

  const played = patients.filter(p => p.metrics.sessionsThisWeek > 0)
  const idle = patients.filter(p => p.metrics.sessionsThisWeek === 0)
  const groups: AnswerGroup[] = []
  if (idle.length > 0) {
    groups.push({
      tone: 'idle', label: 'Sin abrir',
      names: idle.map(p => `${firstName(p.name)} (${lowerFirst(statusOf(p).text)})`),
    })
  }
  if (played.length > 0) {
    groups.push({
      tone: 'played', label: 'Jugando',
      names: played.map(p => `${firstName(p.name)} (${veces(p.metrics.sessionsThisWeek)})`),
    })
  }
  return {
    ...base,
    text: idle.length === 0 ? 'Esta semana han jugado todos:' : 'Esta semana va así:',
    groups,
    src: `Según las partidas de tus ${patients.length} carpetas.`,
  }
}

// ── Qué jugó por área ────────────────────────────────────────────────────────
function areaAnswer(p: Patient): CopilotAnswer {
  const name = firstName(p.name)
  const dist = localAreas(p.history ?? []).slice(0, 4).map(a => [a.label, a.pct] as [string, number])
  const base = {
    id: 'area', chip: `¿Qué jugó ${name} por área?`,
    keys: ['area', 'apoya', 'en que', 'distribu', name.toLowerCase()],
  }
  if (dist.length === 0) {
    return { ...base, text: `Aún no tengo partidas de ${name} clasificadas por área.` }
  }
  const n = p.history?.length ?? 0
  return {
    ...base,
    text: `Esto es lo que más jugó ${name}, no una valoración:`,
    dist,
    src: `Según ${n} ${n === 1 ? 'partida' : 'partidas'} de ${name}.`,
  }
}

// ── Borrador de comentario para una familia ──────────────────────────────────
function redactaAnswer(p: Patient): CopilotAnswer {
  const name = firstName(p.name)
  const n = p.metrics.sessionsThisWeek
  const top = placesByUse(p, thisWeek())[0]
  const draft = n > 0
    ? `Esta semana ${name} jugó ${veces(n)} en casa${top ? `, sobre todo en ${top}` : ''}. Seguimos con lo que trabajamos en consulta. Gracias por acompañar desde casa.`
    : `Esta semana ${name} no ha abierto Dracs. Cuando podáis, retomadlo con un juego corto. Lo hablamos en la próxima sesión.`
  return {
    id: 'redacta', chip: `Redacta el comentario para la familia de ${name}`,
    keys: ['redacta', 'comentario', 'familia', 'escrib', 'mensaje', 'carta'],
    text: 'Te dejo un borrador con lo que pasó esta semana, sin afirmar mejoras:',
    draft,
  }
}

// ── Borrador de informe ──────────────────────────────────────────────────────
// Ninguna línea empieza por una cifra: el cuerpo del mensaje lee "12 ..." como
// ítem numerado y la partiría en dos.
function informeLines(p: Patient): string[] {
  const stats = statsFor(fromLocalHistory(p.history ?? []), rangeFor('cuatro'))
  if (!stats.hasData) return []
  const lines = [
    `Jugó ${stats.sessions} ${stats.sessions === 1 ? 'partida' : 'partidas'} en ${stats.activeDays} ${stats.activeDays === 1 ? 'día' : 'días'} de las últimas 4 semanas.`,
  ]
  if (stats.accuracy != null) lines.push(`Sus aciertos del período están en ${stats.accuracy}%.`)
  if (stats.firstHalf != null && stats.secondHalf != null) {
    lines.push(`Primera mitad del período ${stats.firstHalf}%, segunda mitad ${stats.secondHalf}%.`)
  }
  return lines
}

// El Informe de la Carpeta manda sus propias líneas (`given`): son las del
// período abierto. Escrito a mano, se arma con el historial de la carpeta.
export function informeAnswer(name: string, lines: string[]): CopilotAnswer {
  const base = {
    id: 'informe', chip: `Redacta el informe de ${name}`,
    keys: ['informe', 'redacta el informe', 'informe de', 'reporte'],
  }
  if (lines.length === 0) {
    return {
      ...base,
      text: `No tengo partidas de ${name} en Dracs, así que no puedo armarte el borrador.`,
    }
  }
  const numbered = lines.map((l, i) => `${i + 1}.  ${l}`).join('\n')
  return {
    ...base,
    text: `Borrador para ${name}:\n\n${numbered}\n\nLo tienes completo en la sección Informe de su carpeta.`,
  }
}

// El informe de una carpeta concreta: el que se pide escribiendo su nombre.
export function informeFor(p: Patient): CopilotAnswer {
  return informeAnswer(firstName(p.name), informeLines(p))
}

// ── Preparar la próxima sesión de la agenda ──────────────────────────────────
function prepAnswer(patients: Patient[], isDemo: boolean): CopilotAnswer {
  const keys = ['prepar', 'sesion', 'briefing', 'proxima']
  const ids = patients.map(p => p.id)
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // La próxima cita de la agenda, en los próximos 14 días.
  let next: { patient: Patient; time: string; offset: number; day: Date } | null = null
  for (let offset = 0; isDemo && offset < 14 && !next; offset++) {
    const day = new Date(now)
    day.setDate(now.getDate() + offset)
    const cita = citasDe(localIso(day), ids).find(c => offset > 0 || c.time > hhmm)
    const patient = cita && patients.find(p => p.id === cita.patientId)
    if (cita && patient) next = { patient, time: cita.time, offset, day }
  }

  if (!next) {
    return {
      id: 'prep', chip: 'Prepárame la próxima sesión', keys,
      text: 'No tengo ninguna sesión en tu agenda para las próximas dos semanas.',
    }
  }

  const { patient: p, time, offset, day } = next
  const name = firstName(p.name)
  const when = offset === 0 ? 'hoy' : offset === 1 ? 'mañana' : `el ${DAYS[day.getDay()]} ${day.getDate()}`
  const lines = [`${statusOf(p).text}.`]
  const week = p.localWeek
  if (week?.accuracy != null) {
    lines.push(week.prevAccuracy != null
      ? `Aciertos de esta semana: ${week.accuracy}%. La anterior, ${week.prevAccuracy}%.`
      : `Aciertos de esta semana: ${week.accuracy}%.`)
  }
  const places = placesByUse(p, thisWeek())
  if (places.length > 0) lines.push(`Jugó en ${joinY(places)}.`)

  return {
    id: 'prep',
    chip: offset === 0 ? `Prepárame la sesión de las ${time}` : `Prepárame la sesión de ${name}`,
    keys: [...keys, time, name.toLowerCase()],
    text: `${name}, ${when} a las ${time}. Esto es lo que jugó en casa:\n\n${lines.map((l, i) => `${i + 1}.  ${l}`).join('\n')}\n\nEl detalle está en su carpeta.`,
  }
}

// Todas las respuestas, construidas con las carpetas de ahora. La primera
// carpeta es la principal (en la demo, el niño del navegador); el borrador de
// familia va para quien más jugó esta semana entre las demás.
export function buildAnswers(patients: Patient[], isDemo: boolean): CopilotAnswer[] {
  if (patients.length === 0) return [quienAnswer(patients)]
  const main = patients[0]
  const others = patients.slice(1)
  const forFamily = [...others].sort((a, b) => b.metrics.sessionsThisWeek - a.metrics.sessionsThisWeek)[0] ?? main
  return [
    quienAnswer(patients),
    areaAnswer(main),
    redactaAnswer(forFamily),
    informeFor(main),
    prepAnswer(patients, isDemo),
  ]
}

// Límite honesto: dice qué sabe hacer y NO pregunta nada.
export const FALLBACK: CopilotAnswer = {
  id: 'fallback', chip: '', keys: [],
  text: 'Trabajo con lo que los niños jugaron en Dracs: quién jugó y quién no, qué jugó cada uno por área, preparar una sesión o redactar un borrador.',
}

// El terapeuta dice que sí a algo que nadie ofreció.
export const NO_OFFER: CopilotAnswer = {
  id: 'no_offer', chip: '', keys: [],
  text: 'Dime qué hago y voy.',
}

// La misma respuesta dos veces seguidas no se repite palabra por palabra.
export const REPEATED: CopilotAnswer = {
  id: 'repeated', chip: '', keys: [],
  text: 'Eso es justo lo que te acabo de contar, lo tienes aquí arriba.',
}

// "sí", "dale", "ok" y compañía. Corto y sin más texto alrededor: si el
// terapeuta escribe una frase, se enruta por palabras clave como siempre.
const AFFIRMATIVE = new Set([
  'si', 'sip', 'claro', 'ok', 'oka', 'okey', 'vale', 'dale', 'venga', 'genial',
  'perfecto', 'adelante', 'hazlo', 'porfa', 'bien', 'eso', 'exacto', 'correcto',
])

export function isAffirmative(text: string): boolean {
  const words = normalize(text).replace(/[^a-z\s]/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0 || words.length > 3) return false
  return words.every(w => AFFIRMATIVE.has(w) || w === 'por' || w === 'favor' || w === 'gracias')
}

// Minúsculas y sin acentos, para que "sesión" y "sesion" enruten igual.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Enrutado por conteo de coincidencias: gana la respuesta con más keywords
// presentes en la frase. Sin coincidencias, el límite honesto (FALLBACK).
export function route(text: string, answers: CopilotAnswer[]): CopilotAnswer {
  const q = normalize(text)
  let best: CopilotAnswer = FALLBACK
  let bestScore = 0
  for (const answer of answers) {
    const score = answer.keys.filter(k => q.includes(normalize(k))).length
    if (score > bestScore) {
      best = answer
      bestScore = score
    }
  }
  return bestScore > 0 ? best : FALLBACK
}
