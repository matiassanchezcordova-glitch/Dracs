import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Role } from '../components/RoleSelector'
import { enterDemo } from '../lib/demo'
import { roleToPath } from '../lib/role'
import DemoDoors from '../landing/DemoDoors'
import '../landing/landing.css'

// Entrada al showroom (/demo). Mismo sistema visual que la landing.
//
// Las tres puertas entran directo en la demo, sin registro. La web pública no
// tiene acceso con cuenta.
//
// /demo?como=profesional (o familia, nino) entra directo en esa vista. Es el
// enlace de las tarjetas, de este /demo y de la web.

const QUERY_TO_ROLE: Record<string, Exclude<Role, 'demo'>> = {
  profesional: 'therapist',
  logopeda: 'therapist',
  terapeuta: 'therapist',
  familia: 'family',
  nino: 'child',
  'niño': 'child',
}

export default function DemoPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // Enlace directo (?como=profesional): entra sin pasar por las puertas.
  const como = params.get('como')?.toLowerCase() ?? null
  const directRole = como ? QUERY_TO_ROLE[como] : undefined
  useEffect(() => { document.title = 'Dracs' }, [])

  useEffect(() => {
    if (!directRole) return
    enterDemo(directRole)
    navigate(`/app/${roleToPath(directRole)}`, { replace: true })
  }, [directRole, navigate])

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

          {/* Cada puerta es un enlace a /demo?como=…: el efecto de arriba entra
              en esa vista. Las mismas tarjetas que en la web. */}
          <DemoDoors />

          <p className="lp-source" style={{ marginTop: 32 }}>
            Sin registro. Todo se guarda solo en este navegador.
          </p>
        </div>
      </main>

    </div>
  )
}
