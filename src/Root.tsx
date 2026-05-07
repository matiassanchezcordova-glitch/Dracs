import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import App from './App'
import AboutPage from './pages/AboutPage'
import AuthPage from './pages/auth/AuthPage'
import RoleSelector, { type Role } from './components/RoleSelector'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { Profile } from './lib/types'

// ── Types ─────────────────────────────────────────────────────────────────

type View = 'role-select' | 'auth' | 'app' | 'about' | 'role-conflict'
type Tab  = 'ejercicio' | 'terapeuta' | 'familia'

// ── Helpers ───────────────────────────────────────────────────────────────

function clearAllDracsStorage() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('dracs_'))
    .forEach(k => localStorage.removeItem(k))
}

function dbRoleToUiRole(dbRole: Profile['role']): Role {
  if (dbRole === 'patient') return 'child'
  return dbRole
}

function isRoleConflict(profileRole: Profile['role'], targetSection: Role): boolean {
  if (targetSection === 'family') return false
  if (targetSection === 'child'     && profileRole === 'therapist') return true
  if (targetSection === 'therapist' && (profileRole === 'patient' || profileRole === 'family')) return true
  return false
}

function sectionName(role: Role): string {
  if (role === 'child')     return 'Ejercicios'
  if (role === 'family')    return 'Progreso'
  return 'Logopedia'
}

// ── Loading spinner ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '20px',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
    }}>
      <img
        src="/dragon.nb.png" alt="Dracs"
        style={{ width: '80px', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))' }}
      />
      <div style={{
        width: '32px', height: '32px', border: '3px solid #E0F2FE',
        borderTop: '3px solid #0BAFBE', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Role conflict screen ──────────────────────────────────────────────────

function RoleConflictScreen({
  profileRole, targetRole, onLogout, onBack,
}: {
  profileRole: Profile['role']
  targetRole: Role
  onLogout: () => Promise<void>
  onBack: () => void
}) {
  const [logging, setLogging] = useState(false)

  const currentRoleName =
    profileRole === 'therapist' ? 'terapeuta' : 'paciente o familia'

  async function handleLogout() {
    setLogging(true)
    await onLogout()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', fontFamily: 'Nunito, sans-serif',
    }}>
      <img
        src="/dragon.nb.png" alt="Dracs"
        style={{ width: '80px', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))', marginBottom: '24px' }}
      />

      <div style={{
        width: '100%', maxWidth: '400px', background: '#ffffff',
        borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#FEF3C7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <AlertTriangle size={28} color="#D97706" />
        </div>

        <h2 style={{
          margin: '0 0 8px',
          fontFamily: '"Playfair Display", serif',
          fontSize: '22px', fontWeight: 700, color: '#1A1A2E',
        }}>
          Sesión activa como {currentRoleName}
        </h2>
        <p style={{
          margin: '0 0 28px', fontSize: '14px', color: '#6B7280',
          lineHeight: 1.55,
        }}>
          Para acceder a <strong>{sectionName(targetRole)}</strong> necesitás
          cerrar la sesión actual primero.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleLogout}
            disabled={logging}
            style={{
              width: '100%', height: '52px', borderRadius: '14px', border: 'none',
              background: '#0BAFBE', color: '#ffffff', fontSize: '16px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700,
              cursor: logging ? 'default' : 'pointer', opacity: logging ? 0.7 : 1,
            }}
          >
            {logging ? 'Cerrando sesión...' : `Cerrar sesión e ir a ${sectionName(targetRole)}`}
          </button>
          <button
            onClick={onBack}
            disabled={logging}
            style={{
              width: '100%', height: '52px', borderRadius: '14px',
              border: '1.5px solid #E5E7EB', background: '#ffffff',
              color: '#1A1A2E', fontSize: '16px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700,
              cursor: logging ? 'default' : 'pointer', opacity: logging ? 0.7 : 1,
            }}
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Root inner ────────────────────────────────────────────────────────────

function RootInner() {
  const { user, profile, patient, therapistData, loading, logout } = useAuth()

  const [view, setView]               = useState<View>('role-select')
  const [pendingRole, setPendingRole] = useState<Role>('child')
  const [localRole, setLocalRole]     = useState<Role | null>(null)
  const [initialTab, setInitialTab]   = useState<Tab | undefined>(undefined)

  // When auth resolves with a user, navigate to app or onboarding
  useEffect(() => {
    if (loading) return
    if (user && profile) {
      const isPatientRole = profile.role === 'patient' || profile.role === 'family'
      const needsOnboarding =
        (isPatientRole && !patient) ||
        (profile.role === 'therapist' && !therapistData)

      if (needsOnboarding) {
        setPendingRole(dbRoleToUiRole(profile.role))
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

  // ── Handlers ───────────────────────────────────────────────────────────

  function handleRoleSelect(r: Role) {
    if (r === 'demo') {
      localStorage.setItem('dracs_child_profile', JSON.stringify({
        name: 'Pablo', age: 6, level: 2, streak: 5,
        sessionCount: 12, lastSessionDate: '',
      }))
      localStorage.setItem('dracs_role', 'demo')
      setLocalRole('demo')
      setInitialTab('ejercicio')
      setView('app')
      return
    }
    if (user && profile) {
      if (isRoleConflict(profile.role, r)) {
        setPendingRole(r)
        setView('role-conflict')
      } else {
        // Therapist clicking "Progreso" → land on familia tab
        setInitialTab(r === 'family' && profile.role === 'therapist' ? 'familia' : undefined)
        setView('app')
      }
    } else {
      setPendingRole(r)
      setView('auth')
    }
  }

  function handleAuthSuccess() {
    setInitialTab(undefined)
    setView('app')
  }

  function handleAuthSkip() {
    clearAllDracsStorage()          // wipe any old guest data
    localStorage.setItem('dracs_role', pendingRole)
    setLocalRole(pendingRole)
    setView('app')
  }

  async function handleLogout() {
    if (user) await logout()
    clearAllDracsStorage()
    setLocalRole(null)
    setView('role-select')
  }

  async function handleConflictLogout() {
    if (user) await logout()
    clearAllDracsStorage()
    setLocalRole(null)
    setView('auth')   // pendingRole is already set to the target section
  }

  function handleRequestAuth(_mode: 'login' | 'signup') {
    setPendingRole('child')
    setView('auth')
  }

  function getAppRole(): Role {
    if (profile) return dbRoleToUiRole(profile.role)
    return localRole ?? 'child'
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner />

  if (view === 'about') {
    return <AboutPage onBack={() => setView('role-select')} />
  }

  if (view === 'role-conflict' && profile) {
    return (
      <RoleConflictScreen
        profileRole={profile.role}
        targetRole={pendingRole}
        onLogout={handleConflictLogout}
        onBack={() => setView('role-select')}
      />
    )
  }

  if (view === 'auth') {
    return (
      <AuthPage
        role={pendingRole}
        startAtLogin={false}
        onSuccess={handleAuthSuccess}
        onSkip={handleAuthSkip}
        onBack={() => setView('role-select')}
      />
    )
  }

  if (view === 'app' && (user || localRole)) {
    return (
      <App
        role={getAppRole()}
        onLogout={handleLogout}
        onRequestAuth={handleRequestAuth}
        initialTab={initialTab}
      />
    )
  }

  return (
    <RoleSelector
      onSelect={handleRoleSelect}
      onAbout={() => setView('about')}
    />
  )
}

// ── Root ──────────────────────────────────────────────────────────────────

export default function Root() {
  return (
    <AuthProvider>
      <RootInner />
    </AuthProvider>
  )
}
