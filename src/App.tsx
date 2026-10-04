import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Gamepad2, Stethoscope, Users, LogOut, RotateCcw, Info, ArrowUpRight } from 'lucide-react'
import { type Role } from './components/RoleSelector'
import { useAuth } from './context/AuthContext'
import { TherapistProvider } from './context/TherapistContext'
import {
  clearAllDracsStorage,
  dbRoleToUiRole,
  getLocalRole,
} from './lib/role'
import { DEMO_CHILD_NAME, enterDemo, resetDemo } from './lib/demo'
import './appShell.css'

type Tab = 'ejercicio' | 'terapeuta' | 'familia'

function pathToTab(pathname: string): Tab | null {
  if (pathname.startsWith('/app/nino')) return 'ejercicio'
  if (pathname.startsWith('/app/terapeuta')) return 'terapeuta'
  if (pathname.startsWith('/app/familia')) return 'familia'
  return null
}

const TAB_ROLE: Record<Tab, Exclude<Role, 'demo'>> = {
  terapeuta: 'therapist',
  familia: 'family',
  ejercicio: 'child',
}

// Las tres vistas de la demo, en el orden en que las lee un profesional: su
// escritorio primero, después lo que recibe la familia y lo que juega el niño.
const VIEWS: { tab: Tab; label: string; path: string; Icon: typeof Users }[] = [
  { tab: 'terapeuta', label: 'Profesional', path: '/app/terapeuta', Icon: Stethoscope },
  { tab: 'familia', label: 'Familia', path: '/app/familia', Icon: Users },
  { tab: 'ejercicio', label: 'Niño', path: '/app/nino', Icon: Gamepad2 },
]

// Selector de las tres vistas con burbuja deslizante. La burbuja se mide del
// DOM porque cada etiqueta tiene su ancho.
function ViewSwitch({ active, onPick }: { active: Tab | null; onPick: (v: (typeof VIEWS)[number]) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [bubble, setBubble] = useState<{ left: number; width: number } | null>(null)
  const index = VIEWS.findIndex(v => v.tab === active)

  useLayoutEffect(() => {
    const measure = () => {
      const el = index >= 0 ? refs.current[index] : null
      setBubble(el ? { left: el.offsetLeft, width: el.offsetWidth } : null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    refs.current.forEach(el => el && ro.observe(el))
    return () => ro.disconnect()
  }, [index])

  return (
    <nav className="ax-views" aria-label="Vistas de la demo">
      {bubble && (
        <span
          className="ax-views__bubble"
          aria-hidden
          style={{ width: bubble.width, transform: `translateX(${bubble.left - 4}px)`, left: 4 }}
        />
      )}
      {VIEWS.map((v, i) => (
        <button
          key={v.tab}
          ref={el => { refs.current[i] = el }}
          type="button"
          className="ax-view"
          aria-current={v.tab === active ? 'page' : undefined}
          onClick={() => onPick(v)}
        >
          <v.Icon size={16} strokeWidth={1.8} aria-hidden />
          {v.label}
        </button>
      ))}
    </nav>
  )
}

function AppInner() {
  const { user, profile, patient, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const localRole = getLocalRole()
  const role: Role = profile ? dbRoleToUiRole(profile.role) : (localRole ?? 'child')
  // Showroom: sin sesión de Supabase estamos en la demo, sea cual sea la puerta
  // por la que se entró. Con sesión, el camino real de siempre.
  const isDemo = !user
  const activeTab = pathToTab(location.pathname)

  // Título de la pestaña del navegador: la vista en la que estás.
  useEffect(() => {
    const view = VIEWS.find(v => v.tab === activeTab)
    document.title = view ? `Dracs · Demo · ${view.label}` : 'Dracs · Demo'
  }, [activeTab])

  const childName = isDemo ? null : (patient?.child_name ?? null)
  const therapistName = isDemo ? null : (profile?.full_name ?? null)
  const displayName = childName ?? therapistName ?? 'Invitado'

  // Con cuenta real, las vistas que corresponden a su rol.
  const accountViews = VIEWS.filter(v =>
    v.tab === 'ejercicio' || (role === 'therapist' ? v.tab === 'terapeuta' : v.tab === 'familia'),
  )

  function closeMenu() {
    setMenuOpen(false)
  }

  function goToView(v: (typeof VIEWS)[number]) {
    closeMenu()
    if (isDemo) enterDemo(TAB_ROLE[v.tab])
    navigate(v.path)
  }

  async function handleLogout() {
    closeMenu()
    if (user) await logout()
    clearAllDracsStorage()
    navigate('/', { replace: true })
  }

  // Reiniciar la demo: el visitante (o el profesional en una llamada) empieza
  // de cero sin salir de la vista en la que está. Sólo borra el localStorage de
  // este navegador.
  function handleResetDemo() {
    closeMenu()
    setShowDemoModal(false)
    const tab = activeTab ?? 'terapeuta'
    resetDemo(TAB_ROLE[tab])
    // Recarga completa a propósito: el perfil y el historial viven en el estado
    // de varios componentes, y así la demo arranca realmente de cero.
    window.location.assign(VIEWS.find(v => v.tab === tab)?.path ?? '/app/terapeuta')
  }

  const menuItems: ReactNode = isDemo ? (
    <>
      <button role="menuitem" onClick={() => { closeMenu(); setShowDemoModal(true) }}>
        <Info size={18} strokeWidth={1.8} /> Sobre esta demo
      </button>
      <button role="menuitem" onClick={handleResetDemo}>
        <RotateCcw size={18} strokeWidth={1.8} /> Empezar de cero
      </button>
      <hr />
      <button role="menuitem" className="ax-menu__only-m" onClick={() => { closeMenu(); navigate('/#sumarme') }}>
        <ArrowUpRight size={18} strokeWidth={1.8} /> Quiero sumarme
      </button>
      <button role="menuitem" onClick={handleLogout}>
        <LogOut size={18} strokeWidth={1.8} /> Volver a la web
      </button>
    </>
  ) : (
    <>
      {accountViews.map(v => (
        <button
          key={v.tab}
          role="menuitem"
          aria-current={v.tab === activeTab ? 'page' : undefined}
          onClick={() => goToView(v)}
        >
          <v.Icon size={18} strokeWidth={1.8} /> {v.label}
        </button>
      ))}
      <hr />
      <button role="menuitem" className="ax-menu__danger" onClick={handleLogout}>
        <LogOut size={18} strokeWidth={1.8} />
        {/* El niño nunca lee "sesión": para él, sólo "Salir". */}
        {role === 'child' ? 'Salir' : 'Cerrar sesión'}
      </button>
    </>
  )

  return (
    <div className={`ax${isDemo ? ' ax--views' : ''}`}>
      <header className="ax-nav">
        <div className="ax-nav__row">
          <div className="ax-nav__left">
            <Link className="ax-brand" to="/" aria-label="Dracs, volver a la web">
              <img src="/landing/dragon.webp" alt="Dracs" width={40} height={52} />
            </Link>
            {isDemo && (
              <button type="button" className="ax-demo-tag" onClick={() => setShowDemoModal(true)}>
                <i aria-hidden /> Demo con datos de ejemplo
              </button>
            )}
          </div>

          {isDemo && (
            <div className="ax-nav__center">
              <ViewSwitch active={activeTab} onPick={goToView} />
            </div>
          )}

          <div className="ax-nav__right">
            {isDemo && (
              <Link className="ax-btn ax-btn--primary ax-nav__cta" to="/#sumarme">Quiero sumarme</Link>
            )}
            <div className="ax-menu-wrap">
              <button
                type="button"
                className="ax-btn ax-btn--night"
                onClick={() => setMenuOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {isDemo ? 'Menú' : displayName}
              </button>
              {menuOpen && (
                <>
                  <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
                  <div role="menu" className="ax-menu">{menuItems}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {showDemoModal && (
        <div className="ax-modal-back" onClick={() => setShowDemoModal(false)}>
          <div
            className="ax-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ax-modal-title"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="ax-modal-title">Una demo, un solo niño.</h2>
            <p>
              Recorres Dracs sin cuenta. {DEMO_CHILD_NAME} es el niño de ejemplo: lo que juegue en la
              vista Niño aparece al momento en la de su profesional y en la de su familia. Todo se
              guarda solo en este navegador.
            </p>
            <div className="ax-modal__actions">
              <button type="button" className="ax-btn ax-btn--primary" onClick={() => setShowDemoModal(false)}>
                Seguir explorando
              </button>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={handleResetDemo}>
                Empezar de cero
              </button>
            </div>
          </div>
        </div>
      )}

      <main key={activeTab ?? location.pathname} className={activeTab === 'ejercicio' ? 'ax-main tab-enter kid-world' : 'ax-main tab-enter'}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <TherapistProvider>
      <AppInner />
    </TherapistProvider>
  )
}
