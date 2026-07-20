/** Types ------------------------------------------------------------------- */

export type PatientStatus = 'completed' | 'pending' | 'overdue'

export interface WeekData {
  week: string
  score: number
}

export interface RecentSession {
  date: string
  duration: number
  exercises: number
  accuracy: number
}

export interface Patient {
  id: string
  name: string
  age: number
  condition: string
  area: string
  avatar: string
  status: PatientStatus
  metrics: {
    sessionsThisWeek: number
    sessionsTarget: number
    avgDuration: number
    progressPct: number
  }
  weeklyProgress: WeekData[]
  recentSessions: RecentSession[]
  notes?: string
  level?: { min: number; max: number } | null
}

/** Static patient records -------------------------------------------------- */

export const PATIENTS: Patient[] = [
  {
    id: 'pablo',
    name: 'Pablo García',
    age: 6,
    condition: 'Síndrome de Down',
    area: 'Vocabulario receptivo',
    avatar: '🧒',
    status: 'completed',
    metrics: {
      sessionsThisWeek: 5,
      sessionsTarget: 5,
      avgDuration: 28,
      progressPct: 18,
    },
    weeklyProgress: [
      { week: 'Sem 1', score: 65 },
      { week: 'Sem 2', score: 72 },
      { week: 'Sem 3', score: 78 },
      { week: 'Sem 4', score: 85 },
    ],
    recentSessions: [
      { date: 'Lun 13 abr', duration: 28, exercises: 7, accuracy: 85 },
      { date: 'Vie 11 abr', duration: 31, exercises: 7, accuracy: 78 },
      { date: 'Jue 10 abr', duration: 25, exercises: 7, accuracy: 72 },
    ],
    notes: 'Avance consistente en vocabulario receptivo. Mantener sesiones diarias de nivel 2.',
  },
  {
    id: 'lucia',
    name: 'Lucía Fernández',
    age: 8,
    condition: 'TEA',
    area: 'Comunicación funcional',
    avatar: '👧',
    status: 'completed',
    metrics: {
      sessionsThisWeek: 4,
      sessionsTarget: 5,
      avgDuration: 22,
      progressPct: 12,
    },
    weeklyProgress: [
      { week: 'Sem 1', score: 55 },
      { week: 'Sem 2', score: 60 },
      { week: 'Sem 3', score: 68 },
      { week: 'Sem 4', score: 74 },
    ],
    recentSessions: [
      { date: 'Lun 13 abr', duration: 22, exercises: 7, accuracy: 74 },
      { date: 'Jue 10 abr', duration: 19, exercises: 7, accuracy: 68 },
      { date: 'Mar 8 abr',  duration: 24, exercises: 7, accuracy: 60 },
    ],
    notes: 'Mejora en denominación de objetos cotidianos. Dificultad persistente con verbos de acción.',
  },
  {
    id: 'mateo',
    name: 'Mateo Ruiz',
    age: 5,
    condition: 'Parálisis cerebral',
    area: 'Lenguaje y fonología',
    avatar: '👦',
    status: 'pending',
    metrics: {
      sessionsThisWeek: 2,
      sessionsTarget: 5,
      avgDuration: 18,
      progressPct: 5,
    },
    weeklyProgress: [
      { week: 'Sem 1', score: 48 },
      { week: 'Sem 2', score: 52 },
      { week: 'Sem 3', score: 55 },
      { week: 'Sem 4', score: 55 },
    ],
    recentSessions: [
      { date: 'Mar 8 abr', duration: 18, exercises: 7, accuracy: 55 },
      { date: 'Lun 7 abr', duration: 20, exercises: 7, accuracy: 52 },
    ],
    notes: 'Sin sesiones esta semana tras las del lunes. Requiere seguimiento. Progreso estable en /p/ y /b/.',
  },
  {
    id: 'valentina',
    name: 'Valentina Ortiz',
    age: 7,
    condition: 'Retraso del lenguaje',
    area: 'Vocabulario expresivo',
    avatar: '👧',
    status: 'overdue',
    metrics: {
      sessionsThisWeek: 1,
      sessionsTarget: 5,
      avgDuration: 20,
      progressPct: -8,
    },
    weeklyProgress: [
      { week: 'Sem 1', score: 40 },
      { week: 'Sem 2', score: 45 },
      { week: 'Sem 3', score: 50 },
      { week: 'Sem 4', score: 42 },
    ],
    recentSessions: [
      { date: 'Vie 11 abr', duration: 20, exercises: 7, accuracy: 42 },
      { date: 'Mar 8 abr',  duration: 22, exercises: 7, accuracy: 50 },
    ],
    notes: 'Lleva 3 días sin sesión. Ligera regresión en la semana 4. Contactar con la familia para retomar la rutina.',
  },
  {
    id: 'hugo',
    name: 'Hugo Navarro',
    age: 9,
    condition: 'Apraxia del habla',
    area: 'Articulación y fluidez',
    avatar: '🧒',
    status: 'completed',
    metrics: {
      sessionsThisWeek: 5,
      sessionsTarget: 5,
      avgDuration: 24,
      progressPct: 16,
    },
    weeklyProgress: [
      { week: 'Sem 1', score: 58 },
      { week: 'Sem 2', score: 63 },
      { week: 'Sem 3', score: 70 },
      { week: 'Sem 4', score: 76 },
    ],
    recentSessions: [
      { date: 'Lun 13 abr', duration: 24, exercises: 7, accuracy: 76 },
      { date: 'Vie 11 abr', duration: 22, exercises: 7, accuracy: 70 },
      { date: 'Jue 10 abr', duration: 26, exercises: 7, accuracy: 63 },
    ],
    notes: 'Buena evolución en la articulación de /r/ y /l/. Considerar subir a nivel 3.',
  },
]

/** Public API -------------------------------------------------------------- */

export function getPatients(): Patient[] {
  return PATIENTS
}
