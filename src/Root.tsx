import { useEffect, useState } from 'react'
import App from './App'
import AboutPage from './pages/AboutPage'
import AuthPage from './pages/auth/AuthPage'
import RoleSelector, { type Role } from './components/RoleSelector'
import { AuthProvider, useAuth } from './context/AuthContext'

type View = 'role-select' | 'auth' | 'app' | 'about'

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      flexDirection: 'column',
      gap: '20px',
    }}>
      <img
        src="/dragon.nb.png"
        alt="Dracs"
        style={{
          width: '80px',
          animation: 'floatDragon2 3s ease-in-out infinite',
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))',
        }}
      />
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #E0F2FE',
        borderTop: '3px solid #0BAFBE',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function dbRoleToUiRole(dbRole: 'patient' | 'family' | 'therapist'): Role {
  if (dbRole === 'patient') return 'child'
  return dbRole
}

function RootInner() {
  const { user, profile, patient, therapistData, loading, logout } = useAuth()

  const savedRole = localStorage.getItem('dracs_role') as Role | null
  const [view, setView] = useState<View>(savedRole ? 'app' : 'role-select')
  const [pendingRole, setPendingRole] = useState<Role>('child')
  const [localRole, setLocalRole] = useState<Role | null>(savedRole)
  const [loginDirect, setLoginDirect] = useState(false)

  useEffect(() => {
    if (loading) return

    if (user && profile) {
      const isPatientRole = profile.role === 'patient' || profile.role === 'family'
      const needsOnboarding = (isPatientRole && !patient) ||
        (profile.role === 'therapist' && !therapistData)

      if (needsOnboarding) {
        setPendingRole(dbRoleToUiRole(profile.role))
        setLoginDirect(false)
        setView('auth')
      } else {
        setView('app')
      }
    }
  }, [loading, user, profile, patient, therapistData])

  // Safety timeout: if auth loading hangs beyond 10 s, reset to landing
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => {
      console.warn('[Dracs] Auth loading timeout — resetting to landing')
      setView('role-select')
    }, 10000)
    return () => clearTimeout(t)
  }, [loading])

  function handleRoleSelect(r: Role) {
    setLoginDirect(false)
    if (user && profile) {
      setView('app')
    } else {
      setPendingRole(r)
      setView('auth')
    }
  }

  function handleLoginDirect() {
    setLoginDirect(true)
    setPendingRole('child')
    setView('auth')
  }

  function handleAuthSuccess() {
    setView('app')
  }

  function handleAuthSkip() {
    localStorage.setItem('dracs_role', pendingRole)
    setLocalRole(pendingRole)
    setView('app')
  }

  async function handleLogout() {
    if (user) await logout()
    localStorage.removeItem('dracs_role')
    setLocalRole(null)
    setView('role-select')
  }

  function getAppRole(): Role {
    if (profile) return dbRoleToUiRole(profile.role)
    return localRole ?? 'child'
  }

  if (loading) return <LoadingSpinner />

  if (view === 'about') {
    return <AboutPage onBack={() => setView('role-select')} />
  }

  if (view === 'auth') {
    return (
      <AuthPage
        role={pendingRole}
        startAtLogin={loginDirect}
        onSuccess={handleAuthSuccess}
        onSkip={handleAuthSkip}
        onBack={() => setView('role-select')}
      />
    )
  }

  if (view === 'app' && (user || localRole)) {
    return <App role={getAppRole()} onLogout={handleLogout} />
  }

  return (
    <RoleSelector
      onSelect={handleRoleSelect}
      onAbout={() => setView('about')}
      onLogin={handleLoginDirect}
    />
  )
}

export default function Root() {
  return (
    <AuthProvider>
      <RootInner />
    </AuthProvider>
  )
}
