import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { Role } from './RoleSelector'
import type { Profile } from '../lib/types'

function sectionName(role: Role): string {
  if (role === 'child') return 'Ejercicios'
  if (role === 'family') return 'Progreso'
  return 'Logopedia'
}

interface Props {
  profileRole: Profile['role']
  targetRole: Role
  onLogoutAndContinue: () => Promise<void>
  onClose: () => void
}

export default function RoleConflictModal({
  profileRole, targetRole, onLogoutAndContinue, onClose,
}: Props) {
  const [logging, setLogging] = useState(false)
  const currentRoleName =
    profileRole === 'therapist' ? 'terapeuta' : 'paciente o familia'

  async function handleLogout() {
    setLogging(true)
    await onLogoutAndContinue()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(51,48,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', zIndex: 200, fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '400px', background: '#ffffff',
          borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          padding: '32px', textAlign: 'center',
        }}
      >
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#FEF3C7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <AlertTriangle size={28} color="#D97706" />
        </div>

        <h2 style={{
          margin: '0 0 8px',
          fontFamily: '"Fredoka", system-ui, sans-serif',
          fontSize: '22px', fontWeight: 700, color: '#33302A',
        }}>
          Sesión activa como {currentRoleName}
        </h2>
        <p style={{
          margin: '0 0 28px', fontSize: '14px', color: '#6B7280',
          lineHeight: 1.55,
        }}>
          Para acceder a <strong>{sectionName(targetRole)}</strong> necesitas
          cerrar la sesión actual primero.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleLogout}
            disabled={logging}
            style={{
              width: '100%', height: '52px', borderRadius: '14px', border: 'none',
              background: '#F7C31C', color: '#33302A', fontSize: '16px',
              fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600,
              cursor: logging ? 'default' : 'pointer', opacity: logging ? 0.7 : 1,
            }}
          >
            {logging ? 'Cerrando sesión...' : `Cerrar sesión e ir a ${sectionName(targetRole)}`}
          </button>
          <button
            onClick={onClose}
            disabled={logging}
            style={{
              width: '100%', height: '52px', borderRadius: '14px',
              border: '1.5px solid #E5E7EB', background: '#ffffff',
              color: '#33302A', fontSize: '16px',
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
