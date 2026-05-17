import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthPage from './auth/AuthPage'
import type { Role } from '../components/RoleSelector'
import { useAuth } from '../context/AuthContext'
import {
  clearAllDracsStorage,
  dbRoleToUiRole,
  roleToPath,
} from '../lib/role'

function parseRole(s: string | null): Role {
  if (s === 'child' || s === 'family' || s === 'therapist' || s === 'demo') return s
  return 'child'
}

export default function LoginPage() {
  const { user, profile, patient, therapistData, loading } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const requestedRole = parseRole(params.get('role'))
  // If user is logged in, use their actual role for the AuthPage onboarding flow
  const effectiveRole: Role = profile ? dbRoleToUiRole(profile.role) : requestedRole

  // If user already logged in and onboarding is complete, send them to /app
  useEffect(() => {
    if (loading) return
    if (user && profile) {
      const isPatientRole = profile.role === 'patient' || profile.role === 'family'
      const needsOnboarding =
        (isPatientRole && !patient) ||
        (profile.role === 'therapist' && !therapistData)
      if (!needsOnboarding) {
        navigate('/app', { replace: true })
      }
    }
  }, [loading, user, profile, patient, therapistData, navigate])

  function handleSuccess() {
    navigate('/app', { replace: true })
  }

  function handleSkip() {
    clearAllDracsStorage()
    localStorage.setItem('dracs_role', requestedRole)
    navigate(`/app/${roleToPath(requestedRole)}`, { replace: true })
  }

  function handleBack() {
    navigate('/', { replace: true })
  }

  return (
    <AuthPage
      role={effectiveRole}
      onSuccess={handleSuccess}
      onSkip={handleSkip}
      onBack={handleBack}
    />
  )
}
