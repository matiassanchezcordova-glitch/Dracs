import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleSelector, { type Role } from '../components/RoleSelector'
import RoleConflictModal from '../components/RoleConflictModal'
import { useAuth } from '../context/AuthContext'
import {
  clearAllDracsStorage,
  dbRoleToUiRole,
  isRoleConflict,
  roleToPath,
} from '../lib/role'
import type { Profile } from '../lib/types'

export default function HomePage() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [conflict, setConflict] = useState<{
    profileRole: Profile['role']
    targetRole: Role
  } | null>(null)

  function handleRoleSelect(r: Role) {
    if (r === 'demo') {
      localStorage.setItem('dracs_child_profile', JSON.stringify({
        name: 'Pablo', age: 6, level: 2, streak: 5,
        sessionCount: 12, lastSessionDate: '',
      }))
      localStorage.setItem('dracs_role', 'demo')
      navigate('/app/nino')
      return
    }

    if (user && profile) {
      if (isRoleConflict(profile.role, r)) {
        setConflict({ profileRole: profile.role, targetRole: r })
        return
      }
      // Therapist clicking "Progreso" → familia tab
      if (r === 'family' && profile.role === 'therapist') {
        navigate('/app/familia')
        return
      }
      const uiRole = dbRoleToUiRole(profile.role)
      navigate(`/app/${roleToPath(uiRole)}`)
      return
    }

    // No session: go to login with the requested role
    navigate(`/login?role=${r}`)
  }

  async function handleConflictLogout() {
    if (!conflict) return
    const targetRole = conflict.targetRole
    if (user) await logout()
    clearAllDracsStorage()
    setConflict(null)
    navigate(`/login?role=${targetRole}`)
  }

  return (
    <>
      <RoleSelector onSelect={handleRoleSelect} />
      {conflict && (
        <RoleConflictModal
          profileRole={conflict.profileRole}
          targetRole={conflict.targetRole}
          onLogoutAndContinue={handleConflictLogout}
          onClose={() => setConflict(null)}
        />
      )}
    </>
  )
}
