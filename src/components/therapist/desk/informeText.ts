// El texto del informe: los mismos datos contados para dos audiencias.
//
// Regla que manda sobre todo lo demás: el informe DESCRIBE. Dice qué jugó, en
// qué áreas y cómo se movió el porcentaje de aciertos. No dice que el niño
// mejoró, progresó, avanzó ni ninguna palabra que valore. El juicio es del
// logopeda y va en su comentario, con sus palabras y su firma.
//
//   familia   cálida y en claro, SIN números ni jerga.
//   entorno   sobria, con los números que un centro o un seguro necesita.
//
// Ninguna línea sin dato detrás llega al documento: se omite.

import type { InformeStats } from './informeData'
import { SKILL_LABELS } from './labels'

export type Version = 'familia' | 'entorno'

export interface InformeBlock {
  title: string
  lines: string[]
}

export interface InformeInput {
  childName: string
  stats: InformeStats
  // Distribución por área, solo cuando hay juegos etiquetados de verdad.
  areas: { label: string; pct: number }[]
  // Áreas de foco vigentes del Plan (slugs).
  focusAreas: string[]
}

function joinNames(list: string[]): string {
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]
  return `${list.slice(0, -1).join(', ')} y ${list[list.length - 1]}`
}

// Cuánto se jugó, en palabras, para la versión de la familia. Sale del número
// de días con partida sobre los días del período: es el mismo dato, dicho sin
// cifras, no una valoración.
function activityWords(activeDays: number, spanDays: number): string {
  const ratio = activeDays / Math.max(1, spanDays)
  if (ratio >= 0.5) return 'casi todos los días'
  if (ratio >= 0.25) return 'varios días cada semana'
  if (activeDays > 2) return 'algunos días'
  return activeDays === 1 ? 'un día' : 'días sueltos'
}

function focusNames(slugs: string[]): string[] {
  return slugs.map(s => SKILL_LABELS[s] ?? s)
}

export function buildBlocks(version: Version, input: InformeInput): InformeBlock[] {
  const { childName, stats, areas, focusAreas } = input
  const blocks: InformeBlock[] = []

  if (!stats.hasData) {
    blocks.push({
      title: 'Actividad',
      lines: [`No hay partidas de ${childName} registradas en este período.`],
    })
    if (focusAreas.length > 0) {
      blocks.push({
        title: version === 'familia' ? 'En lo que estamos' : 'Áreas de foco',
        lines: [joinNames(focusNames(focusAreas)) + '.'],
      })
    }
    return blocks
  }

  if (version === 'familia') {
    const actividad: string[] = [
      `${childName} jugó ${activityWords(stats.activeDays, stats.spanDays)} durante este período.`,
    ]
    blocks.push({ title: 'Cómo fue el período', lines: actividad })

    if (areas.length > 0) {
      blocks.push({
        title: 'En qué anduvo',
        lines: [`Lo que más jugó fue ${joinNames(areas.slice(0, 3).map(a => a.label.toLowerCase()))}.`],
      })
    }
    if (focusAreas.length > 0) {
      blocks.push({
        title: 'En lo que estamos',
        lines: [`Ahora mismo el trabajo está puesto en ${joinNames(focusNames(focusAreas).map(n => n.toLowerCase()))}.`],
      })
    }
    return blocks
  }

  // ── Entorno: los números, sin adjetivos ──────────────────────────────────
  const actividad = [
    `${stats.sessions} ${stats.sessions === 1 ? 'partida' : 'partidas'} en ${stats.activeDays} ${stats.activeDays === 1 ? 'día distinto' : 'días distintos'}, sobre ${stats.spanDays} días de período.`,
    `${stats.exercises} ${stats.exercises === 1 ? 'juego completado' : 'juegos completados'}.`,
  ]
  if (stats.minutes != null && stats.minutes > 0) {
    actividad.push(`${stats.minutes} minutos de juego registrados.`)
  }
  blocks.push({ title: 'Actividad', lines: actividad })

  const aciertos: string[] = []
  if (stats.accuracy != null) aciertos.push(`${stats.accuracy}% de aciertos en el período.`)
  if (stats.firstHalf != null && stats.secondHalf != null) {
    aciertos.push(`Primera mitad del período ${stats.firstHalf}%, segunda mitad ${stats.secondHalf}%.`)
  }
  for (const w of stats.weeks) {
    if (w.pct != null) aciertos.push(`${w.label}: ${w.pct}%.`)
  }
  if (aciertos.length > 0) blocks.push({ title: 'Aciertos', lines: aciertos })

  if (areas.length > 0) {
    blocks.push({
      title: 'Distribución por área',
      lines: areas.map(a => `${a.label}: ${a.pct}%.`),
    })
  }
  if (focusAreas.length > 0) {
    blocks.push({
      title: 'Áreas de foco',
      lines: [joinNames(focusNames(focusAreas)) + '.'],
    })
  }
  return blocks
}

// ── Borrador del comentario del logopeda ─────────────────────────────────────
// Un punto de partida descriptivo, para que no arranque de una hoja en blanco.
// Cuenta lo que pasó y deja la valoración abierta: la escribe el logopeda.
export function draftComment(version: Version, input: InformeInput): string {
  const { childName, stats, areas, focusAreas } = input

  if (!stats.hasData) {
    return version === 'familia'
      ? `En este período no nos han llegado partidas de ${childName} desde casa. Si os viene bien, lo hablamos en la próxima sesión y buscamos un hueco que os encaje.`
      : `Sin partidas registradas en el período. Queda pendiente revisar con la familia la frecuencia de uso en casa.`
  }

  const parts: string[] = []

  if (version === 'familia') {
    parts.push(`${childName} jugó ${activityWords(stats.activeDays, stats.spanDays)} en este período.`)
    if (areas.length > 0) {
      parts.push(`Se movió sobre todo por ${joinNames(areas.slice(0, 2).map(a => a.label.toLowerCase()))}.`)
    }
    if (focusAreas.length > 0) {
      parts.push(`Seguimos poniendo el foco en ${joinNames(focusNames(focusAreas).map(n => n.toLowerCase()))}.`)
    }
    parts.push('Añade aquí lo que quieras contarle a la familia con tus palabras.')
    return parts.join(' ')
  }

  parts.push(`${childName} registró ${stats.sessions} ${stats.sessions === 1 ? 'partida' : 'partidas'} en ${stats.activeDays} ${stats.activeDays === 1 ? 'día' : 'días'} del período.`)
  if (stats.accuracy != null) parts.push(`El porcentaje de aciertos del período es ${stats.accuracy}%.`)
  if (areas.length > 0) parts.push(`El juego se concentró en ${joinNames(areas.slice(0, 2).map(a => a.label.toLowerCase()))}.`)
  if (focusAreas.length > 0) parts.push(`Las áreas de foco son ${joinNames(focusNames(focusAreas).map(n => n.toLowerCase()))}.`)
  parts.push('Añade aquí tu valoración y las indicaciones que correspondan.')
  return parts.join(' ')
}

// ── Texto plano, para el portapapeles ────────────────────────────────────────
export function toPlainText(input: {
  title: string
  childLine: string
  periodLine: string
  blocks: InformeBlock[]
  comment: string
  signature: string
  legal: string
}): string {
  const out: string[] = [input.title, '', input.childLine, input.periodLine, '']
  for (const b of input.blocks) {
    out.push(b.title.toUpperCase())
    for (const l of b.lines) out.push(`- ${l}`)
    out.push('')
  }
  if (input.comment.trim()) {
    out.push('COMENTARIO DEL LOGOPEDA')
    out.push(input.comment.trim())
    out.push('')
  }
  out.push(input.signature)
  out.push('')
  out.push(input.legal)
  return out.join('\n')
}
