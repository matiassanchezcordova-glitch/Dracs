import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLocalRole } from '../lib/role'
import { ensureDemoChild } from '../lib/demo'
import LoadingSpinner from './LoadingSpinner'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />

  const localRole = getLocalRole()

  // Sin sesión y sin puerta elegida: al showroom, no al login. El login sigue
  // ahí (link discreto en /demo) para los pilotos reales.
  if (!user && !localRole) {
    return <Navigate to="/demo" replace state={{ from: location.pathname }} />
  }

  // Showroom: garantiza el niño demo antes de pintar nada, así ninguna vista
  // cae en la pantalla de "¿cómo te llamas?". Idempotente: nunca pisa un perfil.
  if (!user && localRole) ensureDemoChild()

  return <>{children}</>
}
