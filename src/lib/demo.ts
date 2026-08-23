// Showroom — el niño demo del navegador (fuente única).
//
// Cualquiera entra a /demo, elige una de las tres puertas (Juegos, Familia,
// Logopeda) y recorre el triángulo entero sin loguearse. Un solo niño demo por
// navegador ("Pol"), compartido por las tres vistas y guardado en localStorage.
//
// Esto NO reemplaza el camino real: Supabase, cuentas y RLS siguen intactos
// detrás del link de login. El showroom sólo los corre del camino principal.

import type { Role } from '../components/RoleSelector'
import { ageToLevel } from '../data/exercises'
import { clearAllDracsStorage } from './role'

// Identidad fija del niño del showroom. Nunca se le pide el nombre a nadie.
export const DEMO_CHILD_ID = 'pol'
export const DEMO_CHILD_NAME = 'Pol'
export const DEMO_CHILD_AGE = 6

const PROFILE_KEY = 'dracs_child_profile'

// Crea el niño demo una sola vez. Nunca pisa un perfil existente: si el
// visitante ya jugó, su racha y su nivel adaptado se respetan.
export function ensureDemoChild(): void {
  try {
    if (localStorage.getItem(PROFILE_KEY)) return
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      name: DEMO_CHILD_NAME,
      age: DEMO_CHILD_AGE,
      level: ageToLevel(DEMO_CHILD_AGE),
      streak: 0,
      lastSessionDate: null,
    }))
  } catch { /* localStorage bloqueado: la app sigue, sin persistencia */ }
}

export interface DemoChild {
  name: string
  age: number
  level: number
  streak: number
  lastSessionDate: string | null
}

// Lee el niño demo del navegador. Si aún no existe, devuelve a Pol de cero (el
// mismo que crearía `ensureDemoChild`), nunca datos de otro perfil.
export function loadDemoChild(): DemoChild {
  const fallback: DemoChild = {
    name: DEMO_CHILD_NAME,
    age: DEMO_CHILD_AGE,
    level: ageToLevel(DEMO_CHILD_AGE),
    streak: 0,
    lastSessionDate: null,
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as Partial<DemoChild>) }
  } catch {
    return fallback
  }
}

// Entrar por una de las tres puertas del showroom.
export function enterDemo(role: Role): void {
  ensureDemoChild()
  try {
    localStorage.setItem('dracs_role', role)
  } catch { /* ignore */ }
}

// Reiniciar la demo: borra el progreso de este navegador y deja a Pol de cero,
// manteniendo la puerta por la que se está entrando.
export function resetDemo(role: Role): void {
  clearAllDracsStorage()
  enterDemo(role)
}
