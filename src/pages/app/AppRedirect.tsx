import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { dbRoleToUiRole, getLocalRole, roleToPath } from '../../lib/role'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AppRedirect() {
  const { user, profile, patient, therapistData, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (user && profile) {
    const isPatientRole = profile.role === 'patient' || profile.role === 'family'
    const needsOnboarding =
      (isPatientRole && !patient) ||
      (profile.role === 'therapist' && !therapistData)
    if (needsOnboarding) {
      return <Navigate to={`/login?role=${dbRoleToUiRole(profile.role)}`} replace />
    }
    const uiRole = dbRoleToUiRole(profile.role)
    return <Navigate to={`/app/${roleToPath(uiRole)}`} replace />
  }

  const localRole = getLocalRole()
  if (localRole) {
    return <Navigate to={`/app/${roleToPath(localRole)}`} replace />
  }

  return <Navigate to="/login" replace />
}
