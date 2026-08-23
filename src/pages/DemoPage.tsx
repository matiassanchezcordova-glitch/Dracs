import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleCard from '../components/RoleCard'
import type { Role } from '../components/RoleSelector'
import RoleConflictModal from '../components/RoleConflictModal'
import { useAuth } from '../context/AuthContext'
import { enterDemo } from '../lib/demo'
import {
  clearAllDracsStorage,
  dbRoleToUiRole,
  isRoleConflict,
  roleToPath,
} from '../lib/role'
import type { Profile } from '../lib/types'

// Pantalla de entrada al MVP (/demo): dragón, frase y las tres puertas.
// Sin secciones de marketing.
//
// Showroom: las tres puertas entran DIRECTO en modo demo, sin login. Quien ya
// tiene cuenta entra por el link discreto de abajo y recorre el camino real de
// siempre (Supabase, roles, conflictos); ese camino queda intacto.
export default function DemoPage() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [conflict, setConflict] = useState<{
    profileRole: Profile['role']
    targetRole: Role
  } | null>(null)

  function handleRoleSelect(r: Role) {
    // Con sesión real: el camino de siempre (rol del perfil, conflictos, etc.).
    if (user && profile) {
      if (isRoleConflict(profile.role, r)) {
        setConflict({ profileRole: profile.role, targetRole: r })
        return
      }
      // Terapeuta que toca la puerta "Familia" → casa de la familia
      if (r === 'family' && profile.role === 'therapist') {
        navigate('/app/familia')
        return
      }
      const uiRole = dbRoleToUiRole(profile.role)
      navigate(`/app/${roleToPath(uiRole)}`)
      return
    }

    // Sin sesión: showroom directo. Se asegura el niño demo (Pol) una sola vez
    // y se entra por la puerta elegida. Cero fricción, cero login.
    const door: Role = r === 'demo' ? 'child' : r
    enterDemo(door)
    navigate(`/app/${roleToPath(door)}`)
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
            src="/brand/dracs-dragon.png"
            alt="Dracs"
            style={{ width: '34px', height: 'auto', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.18))' }}
          />
          <span style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F1D062', letterSpacing: '2px' }}>
            DRACS
          </span>
        </button>
        <img src="/brand/dracs-dragon.png" alt="Dracs" className="dracs-hero-dragon"
          style={{ width: '180px', height: 'auto', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))', marginBottom: '32px' }}
        />
        <p className="dracs-hero-phrase" style={{ margin: '0 0 48px', fontFamily: '"Fredoka", system-ui, sans-serif', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#FAF5E8', textAlign: 'center', animation: 'heroFadeIn 0.8s ease both', maxWidth: '600px' }}>
          Dracs cree en ti.
        </p>
        <RoleCard onSelect={handleRoleSelect} onLogin={() => navigate('/login')} />
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
