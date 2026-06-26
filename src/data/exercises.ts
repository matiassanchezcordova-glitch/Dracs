import { supabase } from '../lib/supabase'

export type Level = 1 | 2 | 3 | 4

// ─── Runtime types consumed by UI components ──────────────────────────────────

export interface Option {
  imageUrl: string
  label: string
}

export interface RuntimeVocabulary {
  type: 'vocabulary'
  id: string
  word: string
  prompt: string
  promptOriginal: string | null
  audioUrl: string | null
  options: Option[]
  correctIndex: number
}

export interface RuntimeSequenceItem {
  imageUrl: string
  label: string
  originalIndex: number
}

export interface RuntimeSequence {
  type: 'sequence'
  id: string
  question: string
  prompt: string
  promptOriginal: string | null
  audioUrl: string | null
  items: RuntimeSequenceItem[]
  correctOrder: number[]
}

export interface RuntimeOddOneOutItem {
  imageUrl: string
  label: string
  isOdd: boolean
}

export interface RuntimeOddOneOut {
  type: 'odd_one_out'
  id: string
  question: string
  prompt: string
  promptOriginal: string | null
  audioUrl: string | null
  items: RuntimeOddOneOutItem[]
}

export interface RuntimeFillBlank {
  type: 'fill_blank'
  id: string
  sentence: string
  prompt: string
  promptOriginal: string | null
  audioUrl: string | null
  options: string[]
  correctIndex: number
}

export type RuntimeExercise =
  | RuntimeVocabulary
  | RuntimeSequence
  | RuntimeOddOneOut
  | RuntimeFillBlank

// ─── Age → level mapping ──────────────────────────────────────────────────────

export function ageToLevel(age: number): Level {
  if (age <= 4) return 1
  if (age <= 6) return 2
  if (age <= 8) return 3
  return 4
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── DB row + adapters ────────────────────────────────────────────────────────

type DbExerciseType = 'identify_image' | 'odd_one_out' | 'sequence' | 'fill_blank'

interface DbExerciseRow {
  id: string
  type: DbExerciseType
  category: string
  difficulty: number
  title: string
  prompt: string
  prompt_original: string | null
  audio_url: string | null
  content: Record<string, unknown>
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null
}

// Use row.prompt if present, otherwise fall back to row.title (some rows
// in DB may have empty prompts — see backlog task "audit prompts").
function promptOrTitle(row: DbExerciseRow): string {
  const p = (row.prompt ?? '').trim()
  return p.length > 0 ? p : row.title
}

// identify_image (Mecánica A) → RuntimeVocabulary
function adaptIdentifyImage(row: DbExerciseRow): RuntimeVocabulary | null {
  const c = row.content
  const rawOpts = asArray(c.options) as Array<Record<string, unknown>>
  if (rawOpts.length < 2) return null

  const opts: Option[] = rawOpts.map(o => ({
    imageUrl: String(o.image_url ?? ''),
    label: String(o.label ?? ''),
  }))
  const correctSrc = rawOpts.find(o => o.is_correct === true)
  if (!correctSrc) return null
  const correctImg = String(correctSrc.image_url ?? '')

  const shuffled = shuffle(opts)
  return {
    type: 'vocabulary',
    id: row.id,
    word: asString(c.word) ?? row.title,
    prompt: promptOrTitle(row),
    promptOriginal: row.prompt_original ?? null,
    audioUrl: row.audio_url,
    options: shuffled,
    correctIndex: shuffled.findIndex(o => o.imageUrl === correctImg),
  }
}

// odd_one_out (Mecánica A) → RuntimeOddOneOut
function adaptOddOneOut(row: DbExerciseRow): RuntimeOddOneOut | null {
  const c = row.content
  const rawOpts = asArray(c.options) as Array<Record<string, unknown>>
  if (rawOpts.length < 2) return null
  if (!rawOpts.some(o => o.is_odd === true)) return null

  const items: RuntimeOddOneOutItem[] = rawOpts.map(o => ({
    imageUrl: String(o.image_url ?? ''),
    label: String(o.label ?? ''),
    isOdd: o.is_odd === true,
  }))
  return {
    type: 'odd_one_out',
    id: row.id,
    question: asString(c.question) ?? row.prompt,
    prompt: promptOrTitle(row),
    promptOriginal: row.prompt_original ?? null,
    audioUrl: row.audio_url,
    items: shuffle(items),
  }
}

// sequence (Mecánica A) → RuntimeSequence
function adaptSequence(row: DbExerciseRow): RuntimeSequence | null {
  const c = row.content
  const rawSteps = asArray(c.steps) as Array<Record<string, unknown>>
  const correctOrder = asArray(c.correct_order)
    .map(n => (typeof n === 'number' ? n : Number(n)))
    .filter(n => Number.isInteger(n))
  if (rawSteps.length < 2 || correctOrder.length !== rawSteps.length) return null

  const items: RuntimeSequenceItem[] = rawSteps.map((s, i) => ({
    imageUrl: String(s.image_url ?? ''),
    label: String(s.label ?? ''),
    originalIndex: i,
  }))
  return {
    type: 'sequence',
    id: row.id,
    question: asString(c.question) ?? row.prompt,
    prompt: promptOrTitle(row),
    promptOriginal: row.prompt_original ?? null,
    audioUrl: row.audio_url,
    items: shuffle(items),
    correctOrder,
  }
}

// fill_blank (Mecánica A) → RuntimeFillBlank
function adaptFillBlank(row: DbExerciseRow): RuntimeFillBlank | null {
  const c = row.content
  const rawOpts = asArray(c.options) as Array<Record<string, unknown>>
  const sentence = asString(c.sentence)
  if (!sentence || rawOpts.length < 2) return null

  const correctSrc = rawOpts.find(o => o.is_correct === true)
  if (!correctSrc) return null
  const correctText = String(correctSrc.text ?? '')

  const texts: string[] = rawOpts.map(o => String(o.text ?? ''))
  const shuffled = shuffle(texts)
  return {
    type: 'fill_blank',
    id: row.id,
    sentence,
    prompt: promptOrTitle(row),
    promptOriginal: row.prompt_original ?? null,
    audioUrl: row.audio_url,
    options: shuffled,
    correctIndex: shuffled.indexOf(correctText),
  }
}

function adaptRow(row: DbExerciseRow): RuntimeExercise | null {
  switch (row.type) {
    case 'identify_image': return adaptIdentifyImage(row)
    case 'odd_one_out':    return adaptOddOneOut(row)
    case 'sequence':       return adaptSequence(row)
    case 'fill_blank':     return adaptFillBlank(row)
    default: return null
  }
}

// ─── Difficulty range per child level (DB 1-5 ↔ frontend Level 1-4) ───────────

const TARGET_DIFFICULTY: Record<Level, { min: number; max: number }> = {
  1: { min: 1, max: 1 },
  2: { min: 1, max: 2 },
  3: { min: 2, max: 3 },
  4: { min: 3, max: 5 },
}

interface PooledExercise {
  difficulty: number
  runtime: RuntimeExercise
}

// Picks `quota` items from `pool`, preferring those whose difficulty falls in
// the level's target range; falls back to items outside the range, ordered by
// distance from the range. Returns up to `quota` items (no repetition).
function pickWithFallback(
  pool: PooledExercise[],
  level: Level,
  quota: number,
): PooledExercise[] {
  if (quota <= 0 || pool.length === 0) return []
  const { min, max } = TARGET_DIFFICULTY[level]
  const inRange  = pool.filter(p => p.difficulty >= min && p.difficulty <= max)
  const outRange = pool.filter(p => p.difficulty <  min || p.difficulty >  max)
  const distance = (d: number) => (d < min ? min - d : d - max)
  outRange.sort((a, b) => distance(a.difficulty) - distance(b.difficulty))
  const ordered = [...shuffle(inRange), ...outRange]
  return ordered.slice(0, quota)
}

// ─── Session builder (reads from Supabase) ────────────────────────────────────

// Filtro opcional de pool, derivado del hotspot del mapa-mundo (S5.5).
export type HotspotFilter =
  | { type: 'place'; place: string }
  | { type: 'random_all' }

export async function buildSessionFromDb(
  level: Level,
  filter?: HotspotFilter,
  targetLength = 7,
): Promise<RuntimeExercise[]> {
  let query = supabase
    .from('exercises')
    .select('id, type, category, difficulty, title, prompt, prompt_original, audio_url, content')
    .eq('content->>mechanic', 'A')

  // pool_type 'place' filtra por la columna exercises.place. 'random_all' no
  // agrega filtro. La columna existe en la DB pero no en database.types.ts; el
  // cliente Supabase no está tipado, así que no requiere cast.
  // TODO: tipar cuando regeneremos database.types.ts
  if (filter?.type === 'place') {
    query = query.eq('place', filter.place)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`No pudimos cargar los juegos: ${error.message}`)
  }

  const rows = (data ?? []) as DbExerciseRow[]
  const pooled: PooledExercise[] = []
  for (const row of rows) {
    const rt = adaptRow(row)
    if (rt) pooled.push({ difficulty: row.difficulty, runtime: rt })
  }

  const vocabPool = pooled.filter(p => p.runtime.type === 'vocabulary')
  const seqPool   = pooled.filter(p => p.runtime.type === 'sequence')
  const oddPool   = pooled.filter(p => p.runtime.type === 'odd_one_out')
  const fillPool  = pooled.filter(p => p.runtime.type === 'fill_blank')

  const seqQuota  = level >= 4 ? 2 : level >= 3 ? 1 : 0
  const oddQuota  = level >= 2 ? 1 : 0
  const fillQuota = level >= 2 ? 1 : 0
  let   vocabQuota = targetLength - seqQuota - oddQuota - fillQuota

  const session: RuntimeExercise[] = []

  const seqPicks = pickWithFallback(seqPool, level, seqQuota)
  seqPicks.forEach(p => session.push(p.runtime))
  vocabQuota += seqQuota - seqPicks.length

  const oddPicks = pickWithFallback(oddPool, level, oddQuota)
  oddPicks.forEach(p => session.push(p.runtime))
  vocabQuota += oddQuota - oddPicks.length

  const fillPicks = pickWithFallback(fillPool, level, fillQuota)
  fillPicks.forEach(p => session.push(p.runtime))
  vocabQuota += fillQuota - fillPicks.length

  const vocabPicks = pickWithFallback(vocabPool, level, vocabQuota)
  vocabPicks.forEach(p => session.push(p.runtime))

  if (session.length === 0) {
    throw new Error('No hay juegos disponibles para tu nivel.')
  }

  return shuffle(session)
}
