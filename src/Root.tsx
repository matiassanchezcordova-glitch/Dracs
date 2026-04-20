import { useState } from 'react'
import App from './App'
import AboutPage from './pages/AboutPage'
import RoleSelector, { type Role } from './components/RoleSelector'

type View = 'role-select' | 'app' | 'about'

function getSavedRole(): Role | null {
  return localStorage.getItem('dracs_role') as Role | null
}

export default function Root() {
  const [role, setRole] = useState<Role | null>(getSavedRole)
  const [view, setView] = useState<View>(() => (getSavedRole() ? 'app' : 'role-select'))

  function handleRoleSelect(r: Role) {
    localStorage.setItem('dracs_role', r)
    setRole(r)
    setView('app')
  }

  function handleLogout() {
    localStorage.removeItem('dracs_role')
    setRole(null)
    setView('role-select')
  }

  if (view === 'about') {
    return <AboutPage onBack={() => setView('role-select')} />
  }

  if (view === 'role-select' || !role) {
    return (
      <RoleSelector
        onSelect={handleRoleSelect}
        onAbout={() => setView('about')}
      />
    )
  }

  return <App role={role} onLogout={handleLogout} />
}
