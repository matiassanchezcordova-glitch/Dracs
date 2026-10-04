import { type ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLocalRole } from '../lib/role'
import { ensureDemoChild } from '../lib/demo'
import LoadingSpinner from './LoadingSpinner'

interface Props {
  children: ReactNode
}

// La app pública es solo la demo. Si el navegador guarda una sesión vieja de
// las cuentas de prueba, se cierra en silencio: así nadie ve una versión
// distinta de la que muestra la web.
export default function ProtectedRoute({ children }: Props) {
  const { user, loading, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && user) void logout()
  }, [loading, user, logout])

  if (loading || user) return <LoadingSpinner />

  // Sin vista elegida: a /demo, a elegir una.
  if (!getLocalRole()) {
    return <Navigate to="/demo" replace state={{ from: location.pathname }} />
  }

  // Garantiza el niño de ejemplo antes de pintar nada, así ninguna vista cae
  // en la pantalla de "¿cómo te llamas?". Idempotente: nunca pisa un perfil.
  ensureDemoChild()

  return <>{children}</>
}
