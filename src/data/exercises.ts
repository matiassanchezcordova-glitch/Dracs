export type Level = 1 | 2 | 3 | 4

export interface Option {
  emoji: string
  name: string
}

export interface ExerciseDef {
  id: string
  word: string
  correct: Option
  distractors: Option[]
  forLevels: Level[]
}

export interface RuntimeExercise {
  id: string
  word: string
  options: Option[]
  correctIndex: number
}

export const EXERCISES: ExerciseDef[] = [
  // ── Nivel 1 · 2 opciones ──────────────────────────────────────────────────
  {
    id: 'mano',
    word: 'MANO',
    correct: { emoji: '🤚', name: 'mano' },
    distractors: [{ emoji: '🦶', name: 'pie' }],
    forLevels: [1],
  },
  {
    id: 'ojo',
    word: 'OJO',
    correct: { emoji: '👁️', name: 'ojo' },
    distractors: [{ emoji: '👄', name: 'boca' }],
    forLevels: [1],
  },
  {
    id: 'nariz',
    word: 'NARIZ',
    correct: { emoji: '👃', name: 'nariz' },
    distractors: [{ emoji: '👂', name: 'oreja' }],
    forLevels: [1],
  },
  {
    id: 'cama',
    word: 'CAMA',
    correct: { emoji: '🛏️', name: 'cama' },
    distractors: [{ emoji: '🪑', name: 'silla' }],
    forLevels: [1],
  },
  {
    id: 'mesa',
    word: 'MESA',
    correct: { emoji: '🪵', name: 'mesa' },
    distractors: [{ emoji: '🪑', name: 'silla' }],
    forLevels: [1],
  },
  {
    id: 'vaso',
    word: 'VASO',
    correct: { emoji: '🥛', name: 'vaso' },
    distractors: [{ emoji: '🍽️', name: 'plato' }],
    forLevels: [1],
  },
  {
    id: 'mama',
    word: 'MAMÁ',
    correct: { emoji: '👩', name: 'mamá' },
    distractors: [{ emoji: '👨', name: 'papá' }],
    forLevels: [1],
  },
  // ── Nivel 2 · 3 opciones ──────────────────────────────────────────────────
  {
    id: 'perro',
    word: 'PERRO',
    correct: { emoji: '🐶', name: 'perro' },
    distractors: [{ emoji: '🐱', name: 'gato' }, { emoji: '🐰', name: 'conejo' }],
    forLevels: [2],
  },
  {
    id: 'pajaro',
    word: 'PÁJARO',
    correct: { emoji: '🐦', name: 'pájaro' },
    distractors: [{ emoji: '🐟', name: 'pez' }, { emoji: '🦋', name: 'mariposa' }],
    forLevels: [2],
  },
  {
    id: 'manzana',
    word: 'MANZANA',
    correct: { emoji: '🍎', name: 'manzana' },
    distractors: [{ emoji: '🍐', name: 'pera' }, { emoji: '🍊', name: 'naranja' }],
    forLevels: [2],
  },
  {
    id: 'pan',
    word: 'PAN',
    correct: { emoji: '🍞', name: 'pan' },
    distractors: [{ emoji: '🍪', name: 'galleta' }, { emoji: '🎂', name: 'tarta' }],
    forLevels: [2],
  },
  {
    id: 'zapato',
    word: 'ZAPATO',
    correct: { emoji: '👟', name: 'zapato' },
    distractors: [{ emoji: '👢', name: 'bota' }, { emoji: '👡', name: 'sandalia' }],
    forLevels: [2],
  },
  // ── Niveles 3 y 4 · 4 opciones ────────────────────────────────────────────
  {
    id: 'correr',
    word: 'CORRER',
    correct: { emoji: '🏃', name: 'correr' },
    distractors: [
      { emoji: '🚶', name: 'caminar' },
      { emoji: '🦘', name: 'saltar' },
      { emoji: '🏊', name: 'nadar' },
    ],
    forLevels: [3, 4],
  },
  {
    id: 'comer',
    word: 'COMER',
    correct: { emoji: '🍽️', name: 'comer' },
    distractors: [
      { emoji: '🥤', name: 'beber' },
      { emoji: '👨‍🍳', name: 'cocinar' },
      { emoji: '🫧', name: 'lavar' },
    ],
    forLevels: [3, 4],
  },
  {
    id: 'contento',
    word: 'CONTENTO',
    correct: { emoji: '😊', name: 'contento' },
    distractors: [
      { emoji: '😢', name: 'triste' },
      { emoji: '😠', name: 'enfadado' },
      { emoji: '😨', name: 'asustado' },
    ],
    forLevels: [3, 4],
  },
]

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

/** Builds a session of `targetLength` exercises (repeats if pool is smaller). */
export function buildSession(level: Level, targetLength = 7): RuntimeExercise[] {
  const pool = EXERCISES.filter(e => e.forLevels.includes(level))
  let queue: ExerciseDef[] = shuffle(pool)

  // Fill to targetLength by repeating shuffled rounds
  while (queue.length < targetLength) {
    queue = [...queue, ...shuffle(pool)]
  }
  queue = queue.slice(0, targetLength)

  return queue.map(ex => {
    const allOptions = [ex.correct, ...ex.distractors]
    const shuffled = shuffle(allOptions)
    return {
      id: ex.id,
      word: ex.word,
      options: shuffled,
      correctIndex: shuffled.indexOf(ex.correct),
    }
  })
}
