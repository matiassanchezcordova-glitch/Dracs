import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleCard from '../components/RoleCard'
import type { Role } from '../components/RoleSelector'
import RoleConflictModal from '../components/RoleConflictModal'
import { useAuth } from '../context/AuthContext'
import {
  clearAllDracsStorage,
  dbRoleToUiRole,
  isRoleConflict,
  roleToPath,
} from '../lib/role'
import type { Profile } from '../lib/types'

// Pantalla de entrada al MVP (/demo): dragón, frase y selector de rol.
// Sin secciones de marketing.
export default function DemoPage() {
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
    <div style={{ minHeight: '100vh', background: '#5B8896', fontFamily: 'Nunito, sans-serif' }}>
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 24px', position: 'relative', background: '#5B8896' }}>
        {/* Dragón nuevo arriba a la izquierda = botón que lleva a la landing (/) */}
        <button
          onClick={() => navigate('/')}
          aria-label="Volver a la web de Dracs"
          style={{
            position: 'absolute', top: '24px', left: '24px',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', padding: '4px',
          }}
        >
          <img
            src="/logo-dracs.png"
            alt="Dracs"
            style={{ width: '34px', height: 'auto', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.18))' }}
          />
          <span style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F1D062', letterSpacing: '2px' }}>
            DRACS
          </span>
        </button>
        <img src="/logo-dracs.png" alt="Dracs" className="dracs-hero-dragon"
          style={{ width: '180px', height: 'auto', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))', marginBottom: '32px' }}
        />
        <p className="dracs-hero-phrase" style={{ margin: '0 0 48px', fontFamily: '"Fredoka", serif', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#FAF5E8', textAlign: 'center', animation: 'heroFadeIn 0.8s ease both', maxWidth: '600px' }}>
          Dracs cree en ti.
        </p>
        <RoleCard onSelect={handleRoleSelect} />
      </section>

      {conflict && (
        <RoleConflictModal
          profileRole={conflict.profileRole}
          targetRole={conflict.targetRole}
          onLogoutAndContinue={handleConflictLogout}
          onClose={() => setConflict(null)}
        />
      )}
    </div>
  )
}
