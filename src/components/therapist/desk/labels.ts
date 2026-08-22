// Etiquetas compartidas del escritorio: áreas de habilidad y lugares del mundo.
// SKILL_LABELS es espejo del seed de 009_skill_areas.sql (para no depender de la
// tabla si aún no existe). SKILL_ORDER da el orden de presentación (sort_order).

export const SKILL_LABELS: Record<string, string> = {
  lenguaje_receptivo: 'Lenguaje receptivo',
  lenguaje_expresivo: 'Vocabulario y lenguaje expresivo',
  atencion: 'Atención y percepción visual',
  cognicion: 'Cognición y conceptos',
  autorregulacion: 'Autorregulación y espera',
  social: 'Habilidades sociales y comunicación',
  autonomia: 'Autonomía y vida diaria',
  motricidad_fina: 'Motricidad fina y coordinación visomotora',
}

// Orden oficial (sort_order del seed).
export const SKILL_ORDER: string[] = [
  'lenguaje_receptivo', 'lenguaje_expresivo', 'atencion', 'cognicion',
  'autorregulacion', 'social', 'autonomia', 'motricidad_fina',
]

// Nombres cálidos de los lugares reales del mundo (exercises.place).
export const PLACE_LABELS: Record<string, string> = {
  mar: 'el mar', playa: 'la playa', casa: 'la casa', cielo: 'el cielo',
}

export function placeLabel(place: string | null | undefined): string {
  return (place && PLACE_LABELS[place]) || 'su mundo'
}

// Etiqueta de área en minúscula para incrustar en una frase ("Trabaja …").
export function skillLabelLower(slug: string): string {
  const l = SKILL_LABELS[slug] ?? slug
  return l.charAt(0).toLowerCase() + l.slice(1)
}
