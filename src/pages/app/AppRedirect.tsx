import { Navigate } from 'react-router-dom'
import { getLocalRole, roleToPath } from '../../lib/role'

// /app sin vista: a la vista elegida en la demo, o a /demo para elegir una.
export default function AppRedirect() {
  const localRole = getLocalRole()
  if (localRole) return <Navigate to={`/app/${roleToPath(localRole)}`} replace />
  return <Navigate to="/demo" replace />
}
