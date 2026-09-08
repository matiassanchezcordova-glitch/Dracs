// La base de datos de la demo: historial de juego con detalle por ejercicio.
//
// Por qué existe: sin esto, las carpetas del escritorio se apoyaban en datos
// estáticos escritos a mano (fechas de abril, evolución plana) que no cuadraban
// con la semana en curso. Aquí se genera el historial anclado a HOY, con la
// misma forma que escribe el niño al jugar, para que las tres vistas cuenten lo
// mismo y todo lo derivado (semana, evolución, por área, informe) cuadre.
//
// Es la base de la demo, como los pacientes que la acompañan. No se inventa
// nada en caliente: se genera una vez, es determinista por niño (el mismo niño
// da siempre el mismo historial) y lo que el visitante juega se apila encima.
//
// Dos espacios de nombres distintos, ojo:
//   item.place     pool de juegos (mar, casa, playa, cielo), como exercises.place
//   session.place  hotspot del mapa (pulpo, casa, castillo, sol), para el recorrido

export interface DemoItem {
  place: string     // mar | casa | playa | cielo
  skill: string     // slug de área de habilidad
  ok: boolean
}

export interface DemoSession {
  date: string      // YYYY-MM-DD local
  total: number
  correct: number
  level: number
  place?: string    // hotspot dominante de la partida
  minutes?: number
  items?: DemoItem[]
}

// place (pool) → hotspot del mundo. `faro` es random_all y no se siembra.
const PLACE_TO_HOTSPOT: Record<string, string> = {
  mar: 'pulpo',
  casa: 'casa',
  playa: 'castillo',
  cielo: 'sol',
}

const PLACES = ['mar', 'casa', 'playa', 'cielo']

// Áreas reales del catálogo (espejo de SKILL_LABELS).
const SKILLS = [
  'lenguaje_receptivo', 'lenguaje_expresivo', 'atencion', 'cognicion',
  'autorregulacion', 'social', 'autonomia', 'motricidad_fina',
]

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// PRNG determinista: el mismo niño da siempre el mismo historial, así que la
// demo no cambia de números entre recargas.
function rng(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const m = new Date(d)
  m.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  m.setHours(0, 0, 0, 0)
  return m
}

function pick<T>(list: T[], r: () => number): T {
  return list[Math.floor(r() * list.length)]
}

// Cuántos aciertos tiene una partida de `total` juegos con ese objetivo.
// Se decide el número y luego se reparte, en vez de tirar el dado por juego:
// con 6 juegos, tirar el dado deja partidas al 33% o al 100%, fuera de la
// franja en la que un juego se siente exigente sin frustrar.
function correctCountFor(total: number, target: number): number {
  const floor = Math.ceil(total * 0.55)
  const ceiling = Math.floor(total * 0.9)
  const wanted = Math.round(total * target)
  return Math.min(Math.max(wanted, floor), Math.max(floor, ceiling))
}

// Genera el historial de un niño: `weeks` semanas hasta hoy, varias partidas por
// semana, días variados, lugares rotando y aciertos con variación real.
export function buildDemoHistory(seedKey: string, weeks = 7): DemoSession[] {
  const r = rng(hash(seedKey))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = mondayOf(today)

  // Cada niño tiene 3 áreas que juega más y un lugar preferido: así "por área"
  // tiene forma en vez de salir plano.
  const focus = [...SKILLS].sort(() => r() - 0.5).slice(0, 3)
  const favourite = pick(PLACES, r)

  const sessions: DemoSession[] = []

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(monday)
    weekStart.setDate(monday.getDate() - w * 7)

    // 2 a 4 partidas por semana, en días distintos.
    const count = 2 + Math.floor(r() * 3)
    const offsets = [0, 1, 2, 3, 4, 5, 6].sort(() => r() - 0.5).slice(0, count).sort((a, b) => a - b)

    for (const offset of offsets) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + offset)
      if (day > today) continue

      // Objetivo de aciertos de la partida, entre 55% y 90%.
      const target = 0.55 + r() * 0.35
      const total = 5 + Math.floor(r() * 5)
      const place = r() < 0.45 ? favourite : pick(PLACES, r)

      const correct = correctCountFor(total, target)
      const items: DemoItem[] = []
      for (let i = 0; i < total; i++) {
        items.push({
          place: r() < 0.75 ? place : pick(PLACES, r),
          skill: r() < 0.7 ? pick(focus, r) : pick(SKILLS, r),
          ok: i < correct,
        })
      }
      // Los fallos no se amontonan al final: se barajan dentro de la partida.
      items.sort(() => r() - 0.5)

      sessions.push({
        date: localIso(day),
        total,
        correct,
        level: 2,
        place: PLACE_TO_HOTSPOT[place],
        minutes: 10 + Math.floor(r() * 11),
        items,
      })
    }
  }

  // Hoy siempre tiene partida: la racha se ve viva en las tres vistas.
  const todayIso = localIso(today)
  if (!sessions.some(s => s.date === todayIso)) {
    const total = 6 + Math.floor(r() * 3)
    const place = favourite
    const correct = correctCountFor(total, 0.78)
    const items: DemoItem[] = Array.from({ length: total }, (_, i) => ({
      place,
      skill: pick(focus, r),
      ok: i < correct,
    }))
    items.sort(() => r() - 0.5)
    sessions.push({
      date: todayIso,
      total,
      correct,
      level: 2,
      place: PLACE_TO_HOTSPOT[place],
      minutes: 12 + Math.floor(r() * 8),
      items,
    })
  }

  sessions.sort((a, b) => (a.date < b.date ? -1 : 1))
  return sessions
}
