import type { Role } from '../components/RoleSelector'
import type { Profile } from './types'

export function dbRoleToUiRole(dbRole: Profile['role']): Role {
  if (dbRole === 'patient') return 'child'
  if (dbRole === 'family' || dbRole === 'therapist') return dbRole
  console.warn(`[Dracs] Unexpected profile.role from DB: ${dbRole} — falling back to 'family'`)
  return 'family'
}

export function roleToPath(role: Role): 'nino' | 'terapeuta' | 'familia' {
  if (role === 'therapist') return 'terapeuta'
  if (role === 'family') return 'familia'
  return 'nino'
}

export function getLocalRole(): Role | null {
  const r = localStorage.getItem('dracs_role')
  if (r === 'child' || r === 'family' || r === 'therapist' || r === 'demo') return r
  return null
}

export function clearAllDracsStorage() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('dracs_'))
    .forEach(k => localStorage.removeItem(k))
}

export function isRoleConflict(profileRole: Profile['role'], targetSection: Role): boolean {
  if (targetSection === 'family') return false
  if (targetSection === 'child' && profileRole === 'therapist') return true
  if (targetSection === 'therapist' && (profileRole === 'patient' || profileRole === 'family')) return true
  return false
}
