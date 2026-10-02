import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import '../landing/landing.css'

// Entrada al showroom (/demo). Mismo sistema visual que la landing.
//
// Las tres puertas entran DIRECTO en modo demo, sin login. Quien ya tiene
// cuenta entra por el enlace de abajo y recorre el camino real de siempre
// (Supabase, roles, conflictos); ese camino queda intacto.
//
// Atajo para compartir: /demo?como=profesional (o familia, nino) entra directo por
// esa puerta. Es el enlace que usan los botones "Probar la demo" de la landing.

// Mismo orden que el selector de vistas de la app: Profesional, Familia, Niño.
const DOORS: { role: Exclude<Role, 'demo'>; title: string; text: string; img: string; recommended?: boolean }[] = [
  { role: 'therapist', title: 'Profesional', text: 'Su agenda, su carpeta y el informe.', img: '/landing/demo-profesional.webp', recommended: true },
  { role: 'family', title: 'Familia', text: 'La carta de la semana y una cosa para hoy.', img: '/landing/demo-familia.webp' },
  { role: 'child', title: 'Niño', text: 'El mapa y los juegos, como en casa.', img: '/landing/demo-nino.webp' },
]

const QUERY_TO_ROLE: Record<string, Exclude<Role, 'demo'>> = {
  profesional: 'therapist',
  logopeda: 'therapist',
  terapeuta: 'therapist',
  familia: 'family',
  nino: 'child',
  'niño': 'child',
}

export default function DemoPage() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
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

  // Enlace directo (?como=profesional): sin sesión, entra sin pasar por las puertas.
  const como = params.get('como')?.toLowerCase() ?? null
  const directRole = como ? QUERY_TO_ROLE[como] : undefined
  useEffect(() => {
    if (!directRole || user) return
    enterDemo(directRole)
    navigate(`/app/${roleToPath(directRole)}`, { replace: true })
  }, [directRole, user, navigate])

  async function handleConflictLogout() {
    if (!conflict) return
    const targetRole = conflict.targetRole
    if (user) await logout()
    clearAllDracsStorage()
    setConflict(null)
    navigate(`/login?role=${targetRole}`)
  }

  return (
    <div className="lp" style={{ minHeight: '100vh' }}>
      <header className="lp-nav">
        {/* Mismo ancho que la barra de la app: el dragón no salta al entrar. */}
        <div className="lp-wrap" style={{ maxWidth: 1040 }}>
          <div className="lp-nav__row">
            <Link className="lp-brand" to="/" aria-label="Volver a la web de Dracs">
              <img src="/landing/dragon.webp" alt="Dracs" width={40} height={52} />
            </Link>
            <div className="lp-nav__cta">
              <Link className="lp-btn lp-btn--primary lp-btn--small" to="/#sumarme">Quiero sumarme</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="lp-section lp-demo">
        <div className="lp-wrap" style={{ maxWidth: 1040 }}>
          <div className="lp-head">
            <h1 className="lp-title">Elige una vista.</h1>
            <p className="lp-body">
              Pol, 6 años, es el niño de ejemplo. Lo que juegue aparece al momento en las otras dos.
            </p>
          </div>

          <ul className="lp-doors">
            {DOORS.map(d => (
              <li key={d.role}>
                <button type="button" className="lp-door" onClick={() => handleRoleSelect(d.role)}>
                  <span className="lp-door__shot">
                    <img src={d.img} alt="" width={800} height={600} />
                    {d.recommended && <span className="lp-door__tag">Empieza aquí</span>}
                  </span>
                  <span className="lp-door__text">
                    <span className="lp-door__row">
                      <span className="lp-sub">{d.title}</span>
                      <svg className="lp-door__arrow" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="lp-door__desc">{d.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="lp-source" style={{ marginTop: 32 }}>
            Todo se guarda solo en este navegador. ¿Tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </main>

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
