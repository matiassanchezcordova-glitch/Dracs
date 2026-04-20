export type Level = 1 | 2 | 3 | 4

export interface Option {
  emoji: string
  name: string
}

// ─── Exercise Definitions ─────────────────────────────────────────────────────

export interface VocabExerciseDef {
  type: 'vocabulary'
  id: string
  word: string
  correct: Option
  distractors: Option[]
  forLevels: Level[]
}

export interface SequenceExerciseDef {
  type: 'sequence'
  id: string
  question: string
  steps: string[]
  labels: string[]
  correctOrder: number[]
  forLevels: Level[]
}

export interface OddOneOutExerciseDef {
  type: 'odd_one_out'
  id: string
  question: string
  options: string[]
  labels: string[]
  oddIndex: number
  forLevels: Level[]
}

export interface FillBlankExerciseDef {
  type: 'fill_blank'
  id: string
  sentence: string
  options: string[]
  correctIndex: number
  forLevels: Level[]
}

export type ExerciseDef =
  | VocabExerciseDef
  | SequenceExerciseDef
  | OddOneOutExerciseDef
  | FillBlankExerciseDef

// ─── Runtime Exercises ────────────────────────────────────────────────────────

export interface RuntimeVocabulary {
  type: 'vocabulary'
  id: string
  word: string
  options: Option[]
  correctIndex: number
}

export interface RuntimeSequenceItem {
  emoji: string
  label: string
  originalIndex: number
}

export interface RuntimeSequence {
  type: 'sequence'
  id: string
  question: string
  items: RuntimeSequenceItem[]
  correctOrder: number[]
}

export interface RuntimeOddOneOutItem {
  emoji: string
  label: string
  isOdd: boolean
}

export interface RuntimeOddOneOut {
  type: 'odd_one_out'
  id: string
  question: string
  items: RuntimeOddOneOutItem[]
}

export interface RuntimeFillBlank {
  type: 'fill_blank'
  id: string
  sentence: string
  options: string[]
  correctIndex: number
}

export type RuntimeExercise =
  | RuntimeVocabulary
  | RuntimeSequence
  | RuntimeOddOneOut
  | RuntimeFillBlank

// ─── Exercise Catalog ─────────────────────────────────────────────────────────

export const EXERCISES: ExerciseDef[] = [
  // ══ LEVEL 1 · Vocabulary · 2 options ═════════════════════════════════════
  { type: 'vocabulary', id: 'mano',     word: 'MANO',    correct: { emoji: '🤚', name: 'mano' },   distractors: [{ emoji: '🦶', name: 'pie' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'ojo',      word: 'OJO',     correct: { emoji: '👁️', name: 'ojo' },    distractors: [{ emoji: '👄', name: 'boca' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'nariz',    word: 'NARIZ',   correct: { emoji: '👃', name: 'nariz' },  distractors: [{ emoji: '👂', name: 'oreja' }],         forLevels: [1] },
  { type: 'vocabulary', id: 'cama',     word: 'CAMA',    correct: { emoji: '🛏️', name: 'cama' },  distractors: [{ emoji: '🪑', name: 'silla' }],         forLevels: [1] },
  { type: 'vocabulary', id: 'mesa',     word: 'MESA',    correct: { emoji: '🪵', name: 'mesa' },   distractors: [{ emoji: '🪑', name: 'silla' }],         forLevels: [1] },
  { type: 'vocabulary', id: 'vaso',     word: 'VASO',    correct: { emoji: '🥛', name: 'vaso' },   distractors: [{ emoji: '🍽️', name: 'plato' }],        forLevels: [1] },
  { type: 'vocabulary', id: 'mama',     word: 'MAMÁ',    correct: { emoji: '👩', name: 'mamá' },   distractors: [{ emoji: '👨', name: 'papá' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'perro-l1', word: 'PERRO',   correct: { emoji: '🐶', name: 'perro' },  distractors: [{ emoji: '🐱', name: 'gato' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'gato-l1',  word: 'GATO',   correct: { emoji: '🐱', name: 'gato' },   distractors: [{ emoji: '🐶', name: 'perro' }],         forLevels: [1] },
  { type: 'vocabulary', id: 'arbol',    word: 'ÁRBOL',   correct: { emoji: '🌳', name: 'árbol' },  distractors: [{ emoji: '🌸', name: 'flor' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'sol',      word: 'SOL',     correct: { emoji: '☀️', name: 'sol' },    distractors: [{ emoji: '🌙', name: 'luna' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'luna',     word: 'LUNA',    correct: { emoji: '🌙', name: 'luna' },   distractors: [{ emoji: '☀️', name: 'sol' }],           forLevels: [1] },
  { type: 'vocabulary', id: 'agua',     word: 'AGUA',    correct: { emoji: '💧', name: 'agua' },   distractors: [{ emoji: '🍎', name: 'manzana' }],       forLevels: [1] },
  { type: 'vocabulary', id: 'pelota',   word: 'PELOTA',  correct: { emoji: '⚽', name: 'pelota' }, distractors: [{ emoji: '🎈', name: 'globo' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'libro',    word: 'LIBRO',   correct: { emoji: '📚', name: 'libro' },  distractors: [{ emoji: '✏️', name: 'lápiz' }],         forLevels: [1] },
  { type: 'vocabulary', id: 'pie',      word: 'PIE',     correct: { emoji: '🦶', name: 'pie' },    distractors: [{ emoji: '🤚', name: 'mano' }],          forLevels: [1] },
  { type: 'vocabulary', id: 'boca',     word: 'BOCA',    correct: { emoji: '👄', name: 'boca' },   distractors: [{ emoji: '👃', name: 'nariz' }],         forLevels: [1] },
  { type: 'vocabulary', id: 'oreja',    word: 'OREJA',   correct: { emoji: '👂', name: 'oreja' },  distractors: [{ emoji: '👁️', name: 'ojo' }],           forLevels: [1] },
  { type: 'vocabulary', id: 'silla',    word: 'SILLA',   correct: { emoji: '🪑', name: 'silla' },  distractors: [{ emoji: '🛏️', name: 'cama' }],         forLevels: [1] },
  { type: 'vocabulary', id: 'puerta',   word: 'PUERTA',  correct: { emoji: '🚪', name: 'puerta' }, distractors: [{ emoji: '🪟', name: 'ventana' }],       forLevels: [1] },

  // ══ LEVEL 2 · Vocabulary · 3 options ═════════════════════════════════════
  { type: 'vocabulary', id: 'perro',    word: 'PERRO',   correct: { emoji: '🐶', name: 'perro' },   distractors: [{ emoji: '🐱', name: 'gato' }, { emoji: '🐰', name: 'conejo' }],          forLevels: [2] },
  { type: 'vocabulary', id: 'pajaro',   word: 'PÁJARO',  correct: { emoji: '🐦', name: 'pájaro' },  distractors: [{ emoji: '🐟', name: 'pez' }, { emoji: '🦋', name: 'mariposa' }],         forLevels: [2] },
  { type: 'vocabulary', id: 'manzana',  word: 'MANZANA', correct: { emoji: '🍎', name: 'manzana' }, distractors: [{ emoji: '🍐', name: 'pera' }, { emoji: '🍊', name: 'naranja' }],         forLevels: [2] },
  { type: 'vocabulary', id: 'pan',      word: 'PAN',     correct: { emoji: '🍞', name: 'pan' },     distractors: [{ emoji: '🍪', name: 'galleta' }, { emoji: '🎂', name: 'tarta' }],         forLevels: [2] },
  { type: 'vocabulary', id: 'zapato',   word: 'ZAPATO',  correct: { emoji: '👟', name: 'zapato' },  distractors: [{ emoji: '👢', name: 'bota' }, { emoji: '👡', name: 'sandalia' }],         forLevels: [2] },
  { type: 'vocabulary', id: 'feliz',    word: 'FELIZ',   correct: { emoji: '😊', name: 'feliz' },   distractors: [{ emoji: '😢', name: 'triste' }, { emoji: '😠', name: 'enfadado' }],       forLevels: [2] },
  { type: 'vocabulary', id: 'triste',   word: 'TRISTE',  correct: { emoji: '😢', name: 'triste' },  distractors: [{ emoji: '😊', name: 'feliz' }, { emoji: '😨', name: 'asustado' }],        forLevels: [2] },
  { type: 'vocabulary', id: 'rojo',     word: 'ROJO',    correct: { emoji: '🔴', name: 'rojo' },    distractors: [{ emoji: '🔵', name: 'azul' }, { emoji: '🟡', name: 'amarillo' }],          forLevels: [2] },
  { type: 'vocabulary', id: 'azul',     word: 'AZUL',    correct: { emoji: '🔵', name: 'azul' },    distractors: [{ emoji: '🔴', name: 'rojo' }, { emoji: '🟢', name: 'verde' }],             forLevels: [2] },
  { type: 'vocabulary', id: 'camiseta', word: 'CAMISETA',correct: { emoji: '👕', name: 'camiseta' },distractors: [{ emoji: '👖', name: 'pantalón' }, { emoji: '🧤', name: 'guante' }],       forLevels: [2] },
  { type: 'vocabulary', id: 'pantalon', word: 'PANTALÓN',correct: { emoji: '👖', name: 'pantalón' },distractors: [{ emoji: '👕', name: 'camiseta' }, { emoji: '🧦', name: 'calcetín' }],     forLevels: [2] },
  { type: 'vocabulary', id: 'manzana2', word: 'MANZANA', correct: { emoji: '🍎', name: 'manzana' }, distractors: [{ emoji: '🍌', name: 'plátano' }, { emoji: '🍇', name: 'uvas' }],          forLevels: [2] },
  { type: 'vocabulary', id: 'platano',  word: 'PLÁTANO', correct: { emoji: '🍌', name: 'plátano' }, distractors: [{ emoji: '🍎', name: 'manzana' }, { emoji: '🍊', name: 'naranja' }],       forLevels: [2] },
  { type: 'vocabulary', id: 'vaca',     word: 'VACA',    correct: { emoji: '🐄', name: 'vaca' },    distractors: [{ emoji: '🐷', name: 'cerdo' }, { emoji: '🐑', name: 'oveja' }],            forLevels: [2] },
  { type: 'vocabulary', id: 'caballo',  word: 'CABALLO', correct: { emoji: '🐴', name: 'caballo' }, distractors: [{ emoji: '🐄', name: 'vaca' }, { emoji: '🐑', name: 'oveja' }],            forLevels: [2] },
  { type: 'vocabulary', id: 'naranja',  word: 'NARANJA', correct: { emoji: '🍊', name: 'naranja' }, distractors: [{ emoji: '🍎', name: 'manzana' }, { emoji: '🍋', name: 'limón' }],         forLevels: [2] },
  { type: 'vocabulary', id: 'pez',      word: 'PEZ',     correct: { emoji: '🐟', name: 'pez' },     distractors: [{ emoji: '🐸', name: 'rana' }, { emoji: '🦀', name: 'cangrejo' }],          forLevels: [2] },
  { type: 'vocabulary', id: 'leche',    word: 'LECHE',   correct: { emoji: '🥛', name: 'leche' },   distractors: [{ emoji: '🧃', name: 'zumo' }, { emoji: '🍵', name: 'té' }],                forLevels: [2] },
  { type: 'vocabulary', id: 'conejo',   word: 'CONEJO',  correct: { emoji: '🐰', name: 'conejo' },  distractors: [{ emoji: '🐶', name: 'perro' }, { emoji: '🐱', name: 'gato' }],             forLevels: [2] },

  // ══ LEVELS 3–4 · Vocabulary · 4 options ══════════════════════════════════
  { type: 'vocabulary', id: 'correr',   word: 'CORRER',   correct: { emoji: '🏃', name: 'correr' },   distractors: [{ emoji: '🚶', name: 'caminar' }, { emoji: '🦘', name: 'saltar' }, { emoji: '🏊', name: 'nadar' }],        forLevels: [3, 4] },
  { type: 'vocabulary', id: 'comer',    word: 'COMER',    correct: { emoji: '🍽️', name: 'comer' },   distractors: [{ emoji: '🥤', name: 'beber' }, { emoji: '👨‍🍳', name: 'cocinar' }, { emoji: '🫧', name: 'lavar' }],     forLevels: [3, 4] },
  { type: 'vocabulary', id: 'contento', word: 'CONTENTO', correct: { emoji: '😊', name: 'contento' }, distractors: [{ emoji: '😢', name: 'triste' }, { emoji: '😠', name: 'enfadado' }, { emoji: '😨', name: 'asustado' }],   forLevels: [3, 4] },
  { type: 'vocabulary', id: 'enfadado', word: 'ENFADADO', correct: { emoji: '😠', name: 'enfadado' }, distractors: [{ emoji: '😊', name: 'contento' }, { emoji: '😢', name: 'triste' }, { emoji: '😨', name: 'asustado' }],   forLevels: [3] },
  { type: 'vocabulary', id: 'asustado', word: 'ASUSTADO', correct: { emoji: '😨', name: 'asustado' }, distractors: [{ emoji: '😠', name: 'enfadado' }, { emoji: '😊', name: 'contento' }, { emoji: '😴', name: 'dormido' }],   forLevels: [3] },
  { type: 'vocabulary', id: 'grande',   word: 'GRANDE',   correct: { emoji: '🐘', name: 'grande' },   distractors: [{ emoji: '🐭', name: 'pequeño' }, { emoji: '🐱', name: 'mediano' }, { emoji: '🐝', name: 'diminuto' }],    forLevels: [3] },
  { type: 'vocabulary', id: 'pequeno',  word: 'PEQUEÑO',  correct: { emoji: '🐭', name: 'pequeño' },  distractors: [{ emoji: '🐘', name: 'grande' }, { emoji: '🦁', name: 'mediano' }, { emoji: '🐊', name: 'normal' }],       forLevels: [3] },
  { type: 'vocabulary', id: 'caliente', word: 'CALIENTE', correct: { emoji: '☀️', name: 'caliente' }, distractors: [{ emoji: '❄️', name: 'frío' }, { emoji: '🌧️', name: 'lluvia' }, { emoji: '🍃', name: 'viento' }],         forLevels: [3] },
  { type: 'vocabulary', id: 'frio',     word: 'FRÍO',     correct: { emoji: '❄️', name: 'frío' },     distractors: [{ emoji: '☀️', name: 'caliente' }, { emoji: '🌊', name: 'ola' }, { emoji: '🔥', name: 'fuego' }],          forLevels: [3] },
  { type: 'vocabulary', id: 'dormir',   word: 'DORMIR',   correct: { emoji: '😴', name: 'dormir' },   distractors: [{ emoji: '🏃', name: 'correr' }, { emoji: '🍽️', name: 'comer' }, { emoji: '📚', name: 'leer' }],          forLevels: [3] },
  { type: 'vocabulary', id: 'jugar',    word: 'JUGAR',    correct: { emoji: '🎮', name: 'jugar' },    distractors: [{ emoji: '📚', name: 'estudiar' }, { emoji: '🏊', name: 'nadar' }, { emoji: '🍽️', name: 'comer' }],       forLevels: [3] },
  { type: 'vocabulary', id: 'leer',     word: 'LEER',     correct: { emoji: '📖', name: 'leer' },     distractors: [{ emoji: '🎮', name: 'jugar' }, { emoji: '😴', name: 'dormir' }, { emoji: '🎵', name: 'cantar' }],         forLevels: [3] },
  { type: 'vocabulary', id: 'escribir', word: 'ESCRIBIR', correct: { emoji: '✏️', name: 'escribir' }, distractors: [{ emoji: '📚', name: 'leer' }, { emoji: '🎨', name: 'pintar' }, { emoji: '🎵', name: 'cantar' }],          forLevels: [3] },
  { type: 'vocabulary', id: 'pintar',   word: 'PINTAR',   correct: { emoji: '🎨', name: 'pintar' },   distractors: [{ emoji: '✏️', name: 'escribir' }, { emoji: '📚', name: 'leer' }, { emoji: '🎵', name: 'cantar' }],         forLevels: [3] },
  { type: 'vocabulary', id: 'limpio',   word: 'LIMPIO',   correct: { emoji: '🧼', name: 'limpio' },   distractors: [{ emoji: '🦠', name: 'sucio' }, { emoji: '🗑️', name: 'basura' }, { emoji: '💧', name: 'húmedo' }],         forLevels: [4] },
  { type: 'vocabulary', id: 'ordenado', word: 'ORDENADO', correct: { emoji: '📚', name: 'ordenado' }, distractors: [{ emoji: '🗃️', name: 'archivado' }, { emoji: '📦', name: 'guardado' }, { emoji: '🗄️', name: 'fichero' }],   forLevels: [4] },
  { type: 'vocabulary', id: 'compartir',word: 'COMPARTIR',correct: { emoji: '🤝', name: 'compartir' },distractors: [{ emoji: '😠', name: 'pelear' }, { emoji: '😢', name: 'llorar' }, { emoji: '😊', name: 'sonreír' }],       forLevels: [4] },
  { type: 'vocabulary', id: 'ayudar',   word: 'AYUDAR',   correct: { emoji: '🙌', name: 'ayudar' },   distractors: [{ emoji: '😴', name: 'ignorar' }, { emoji: '🎮', name: 'jugar' }, { emoji: '😊', name: 'reír' }],           forLevels: [4] },
  { type: 'vocabulary', id: 'esperar',  word: 'ESPERAR',  correct: { emoji: '⏳', name: 'esperar' },  distractors: [{ emoji: '🏃', name: 'correr' }, { emoji: '😠', name: 'impacientar' }, { emoji: '🎵', name: 'cantar' }],     forLevels: [4] },
  { type: 'vocabulary', id: 'hablar',   word: 'HABLAR',   correct: { emoji: '💬', name: 'hablar' },   distractors: [{ emoji: '😴', name: 'dormir' }, { emoji: '🏊', name: 'nadar' }, { emoji: '📚', name: 'leer' }],            forLevels: [4] },
  { type: 'vocabulary', id: 'pedir',    word: 'PEDIR',    correct: { emoji: '🙏', name: 'pedir' },    distractors: [{ emoji: '🤝', name: 'dar' }, { emoji: '😠', name: 'exigir' }, { emoji: '😊', name: 'agradecer' }],        forLevels: [4] },

  // ══ SEQUENCE exercises ════════════════════════════════════════════════════
  { type: 'sequence', id: 'seq-01', question: 'Ordena: lavarse las manos',     steps: ['🚿', '🧼', '🤲'], labels: ['abrir grifo', 'jabón', 'secar'],     correctOrder: [0, 1, 2], forLevels: [3] },
  { type: 'sequence', id: 'seq-02', question: 'Ordena: preparar el desayuno', steps: ['🥛', '🥣', '🥄'], labels: ['leche', 'cereales', 'comer'],         correctOrder: [0, 1, 2], forLevels: [3] },
  { type: 'sequence', id: 'seq-03', question: 'Ordena: ir al colegio',         steps: ['⏰', '🎒', '🚶'], labels: ['despertar', 'mochila', 'salir'],       correctOrder: [0, 1, 2], forLevels: [4] },
  { type: 'sequence', id: 'seq-04', question: 'Ordena: antes de dormir',       steps: ['🦷', '👕', '📖'], labels: ['cepillar', 'pijama', 'leer'],         correctOrder: [0, 1, 2], forLevels: [4] },

  // ══ ODD ONE OUT exercises ═════════════════════════════════════════════════
  { type: 'odd_one_out', id: 'odd-01', question: '¿Cuál no es un animal?',         options: ['🐶', '🐱', '🍎', '🐰'], labels: ['perro', 'gato', 'manzana', 'conejo'],    oddIndex: 2, forLevels: [2] },
  { type: 'odd_one_out', id: 'odd-02', question: '¿Cuál no es comida?',             options: ['🍎', '🚗', '🍌', '🥕'], labels: ['manzana', 'coche', 'plátano', 'zanahoria'], oddIndex: 1, forLevels: [2] },
  { type: 'odd_one_out', id: 'odd-03', question: '¿Cuál no es ropa?',               options: ['👕', '👖', '🧤', '🍕'], labels: ['camiseta', 'pantalón', 'guante', 'pizza'],  oddIndex: 3, forLevels: [3] },
  { type: 'odd_one_out', id: 'odd-04', question: '¿Cuál no se usa para comer?',    options: ['🍴', '🥄', '✏️', '🍽️'], labels: ['tenedor', 'cuchara', 'lápiz', 'plato'],    oddIndex: 2, forLevels: [3] },
  { type: 'odd_one_out', id: 'odd-05', question: '¿Cuál no es un sentimiento?',    options: ['😊', '😢', '😠', '🌳'], labels: ['contento', 'triste', 'enfadado', 'árbol'],  oddIndex: 3, forLevels: [4] },

  // ══ FILL BLANK exercises ══════════════════════════════════════════════════
  { type: 'fill_blank', id: 'fill-01', sentence: 'Me lavo las ___',                         options: ['manos', 'zapatos'],                    correctIndex: 0, forLevels: [2] },
  { type: 'fill_blank', id: 'fill-02', sentence: 'El perro dice ___',                       options: ['guau', 'miau'],                        correctIndex: 0, forLevels: [2] },
  { type: 'fill_blank', id: 'fill-03', sentence: 'Por la mañana me cepillo los ___',        options: ['dientes', 'zapatos', 'libros'],         correctIndex: 0, forLevels: [3] },
  { type: 'fill_blank', id: 'fill-04', sentence: 'Cuando tengo sed bebo ___',               options: ['agua', 'tierra', 'papel'],             correctIndex: 0, forLevels: [3] },
  { type: 'fill_blank', id: 'fill-05', sentence: 'Antes de comer me lavo las ___',          options: ['manos', 'orejas', 'rodillas', 'cejas'], correctIndex: 0, forLevels: [4] },
  { type: 'fill_blank', id: 'fill-06', sentence: 'El semáforo rojo significa ___',          options: ['parar', 'correr', 'saltar', 'dormir'],  correctIndex: 0, forLevels: [4] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Runtime converters ───────────────────────────────────────────────────────

function toRuntimeVocab(ex: VocabExerciseDef): RuntimeVocabulary {
  const allOptions = [ex.correct, ...ex.distractors]
  const shuffled = shuffle(allOptions)
  return {
    type: 'vocabulary',
    id: ex.id,
    word: ex.word,
    options: shuffled,
    correctIndex: shuffled.indexOf(ex.correct),
  }
}

function toRuntimeSequence(ex: SequenceExerciseDef): RuntimeSequence {
  const items: RuntimeSequenceItem[] = ex.steps.map((emoji, i) => ({
    emoji,
    label: ex.labels[i],
    originalIndex: i,
  }))
  return {
    type: 'sequence',
    id: ex.id,
    question: ex.question,
    items: shuffle(items),
    correctOrder: ex.correctOrder,
  }
}

function toRuntimeOddOneOut(ex: OddOneOutExerciseDef): RuntimeOddOneOut {
  const items: RuntimeOddOneOutItem[] = ex.options.map((emoji, i) => ({
    emoji,
    label: ex.labels[i],
    isOdd: i === ex.oddIndex,
  }))
  return {
    type: 'odd_one_out',
    id: ex.id,
    question: ex.question,
    items: shuffle(items),
  }
}

function toRuntimeFillBlank(ex: FillBlankExerciseDef): RuntimeFillBlank {
  const correct = ex.options[ex.correctIndex]
  const shuffled = shuffle([...ex.options])
  return {
    type: 'fill_blank',
    id: ex.id,
    sentence: ex.sentence,
    options: shuffled,
    correctIndex: shuffled.indexOf(correct),
  }
}

// ─── Session builder ──────────────────────────────────────────────────────────

export function buildSession(level: Level, targetLength = 7): RuntimeExercise[] {
  const vocabPool = EXERCISES.filter(
    (e): e is VocabExerciseDef => e.type === 'vocabulary' && e.forLevels.includes(level),
  )
  const seqPool = EXERCISES.filter(
    (e): e is SequenceExerciseDef => e.type === 'sequence' && e.forLevels.includes(level),
  )
  const oddPool = EXERCISES.filter(
    (e): e is OddOneOutExerciseDef => e.type === 'odd_one_out' && e.forLevels.includes(level),
  )
  const fillPool = EXERCISES.filter(
    (e): e is FillBlankExerciseDef => e.type === 'fill_blank' && e.forLevels.includes(level),
  )

  const seqQuota  = level >= 4 ? 2 : level >= 3 ? 1 : 0
  const oddQuota  = level >= 2 ? 1 : 0
  const fillQuota = level >= 2 ? 1 : 0
  let   vocabQuota = targetLength - seqQuota - oddQuota - fillQuota

  const session: RuntimeExercise[] = []

  const seqPick = shuffle([...seqPool]).slice(0, seqQuota)
  seqPick.forEach(ex => session.push(toRuntimeSequence(ex)))
  vocabQuota += seqQuota - seqPick.length

  const oddPick = shuffle([...oddPool]).slice(0, oddQuota)
  oddPick.forEach(ex => session.push(toRuntimeOddOneOut(ex)))
  vocabQuota += oddQuota - oddPick.length

  const fillPick = shuffle([...fillPool]).slice(0, fillQuota)
  fillPick.forEach(ex => session.push(toRuntimeFillBlank(ex)))
  vocabQuota += fillQuota - fillPick.length

  let vocabQueue = shuffle([...vocabPool])
  while (vocabQueue.length < vocabQuota) {
    vocabQueue = [...vocabQueue, ...shuffle([...vocabPool])]
  }
  vocabQueue.slice(0, vocabQuota).forEach(ex => session.push(toRuntimeVocab(ex)))

  return shuffle(session)
}
