import { type ReactNode, type CSSProperties, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Gamepad2, BarChart2, Users, LogOut, X, ChevronDown, RotateCcw } from 'lucide-react'
import { type Role } from './components/RoleSelector'
import { useAuth } from './context/AuthContext'
import { TherapistProvider } from './context/TherapistContext'
import {
  clearAllDracsStorage,
  dbRoleToUiRole,
  getLocalRole,
} from './lib/role'
import { DEMO_CHILD_NAME, resetDemo } from './lib/demo'

type Tab = 'ejercicio' | 'terapeuta' | 'familia'

function pathToTab(pathname: string): Tab | null {
  if (pathname.startsWith('/app/nino')) return 'ejercicio'
  if (pathname.startsWith('/app/terapeuta')) return 'terapeuta'
  if (pathname.startsWith('/app/familia')) return 'familia'
  return null
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

  const childName = isDemo ? null : (patient?.child_name ?? null)
  const therapistName = isDemo ? null : (profile?.full_name ?? null)

  // En la demo el header dice quién eres en el triángulo, no un nombre inventado.
  const demoName = role === 'therapist' ? 'Logopeda' : role === 'family' ? 'Familia' : DEMO_CHILD_NAME

  // Nombre + inicial para el avatar del menú del header.
  const displayName = childName ?? therapistName ?? (isDemo ? demoName : 'Invitado')
  const avatarInitial = displayName.charAt(0).toUpperCase()

  // Opciones directas del menú del avatar. En la demo se ven las tres vistas
  // (es el punto del showroom: recorrer el triángulo entero). Con cuenta real,
  // la segunda depende del rol: terapeuta → "Terapeuta"; resto → "Familia".
  const GAMES_OPTION = { label: 'Juegos', icon: <Gamepad2 size={18} />, path: '/app/nino' }
  const FAMILY_OPTION = { label: 'Familia', icon: <Users size={18} />, path: '/app/familia' }
  const THERAPIST_OPTION = { label: 'Logopeda', icon: <BarChart2 size={18} />, path: '/app/terapeuta' }

  const menuOptions: { label: string; icon: ReactNode; path: string }[] = isDemo
    ? [GAMES_OPTION, FAMILY_OPTION, THERAPIST_OPTION]
    : [GAMES_OPTION, role === 'therapist' ? THERAPIST_OPTION : FAMILY_OPTION]

  function closeMenu() {
    setMenuOpen(false)
  }

  async function handleLogout() {
    closeMenu()
    if (user) await logout()
    clearAllDracsStorage()
    navigate('/', { replace: true })
  }

  // Reiniciar la demo: el visitante (o el terapeuta en una call) empieza de
  // cero sin salir del showroom. Sólo borra el localStorage de este navegador.
  function handleResetDemo() {
    closeMenu()
    setShowDemoModal(false)
    resetDemo(role)
    // Recarga completa a propósito: el perfil y el historial viven en el estado
    // de varios componentes, y así el showroom arranca realmente de cero.
    window.location.assign('/app/nino')
  }

  function handleGoToLogin() {
    setShowDemoModal(false)
    navigate('/login')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100svh',
        background: '#FAF5E8',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav
        style={{
          // Navbar fundida con el body: misma crema, sin borde ni shadow.
          backgroundColor: '#FAF5E8',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* ── Left: logo ─────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Marca de la app: SOLO el wordmark. El dragón queda reservado a
                los momentos de personaje (el hero de la casa y Dragui), para
                que no aparezcan dos dragones en la misma pantalla. */}
            <button
              onClick={() => navigate('/')}
              aria-label="Dracs — inicio"
              style={{
                display: 'flex', alignItems: 'center',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              }}
            >
              <img src="/brand/dracs-wordmark.svg" alt="Dracs" style={{ height: '24px', width: 'auto', display: 'block' }} />
            </button>

            {isDemo && (
              <button
                onClick={() => setShowDemoModal(true)}
                style={{
                  background: '#F7C31C', border: 'none', borderRadius: '6px',
                  padding: '3px 10px', fontSize: '11px', fontWeight: 800,
                  color: '#33302A', cursor: 'pointer', letterSpacing: '0.06em',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                DEMO
              </button>
            )}
          </div>

          {/* ── Right: avatar + nombre con menú ───────────────────── */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: menuOpen ? 'rgba(91,136,150,0.08)' : 'transparent',
                border: 'none', borderRadius: '999px', padding: '4px 8px 4px 4px',
                cursor: 'pointer', transition: 'background 0.2s ease',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: '#F7C31C', color: '#33302A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '17px', fontWeight: 800, fontFamily: 'Nunito, sans-serif', flexShrink: 0,
              }}>
                {avatarInitial}
              </div>
              <span className="dracs-user-name" style={{
                fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                fontSize: '15px', color: '#33302A',
              }}>
                {displayName}
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: '#6B7280', flexShrink: 0,
                  transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop para cerrar al tocar afuera */}
                <div
                  onClick={closeMenu}
                  style={{ position: 'fixed', inset: 0, zIndex: 60 }}
                />
                <div
                  role="menu"
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    minWidth: '200px', background: '#FFFFFF',
                    borderRadius: '14px', border: '1px solid #F1F5F9',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
                    padding: '6px', zIndex: 70,
                    fontFamily: 'Nunito, sans-serif',
                    animation: 'wordSlideDown 0.18s ease',
                  }}
                >
                  {/* 3 opciones directas, sin submenús */}
                  {menuOptions.map(opt => {
                    const active = location.pathname.startsWith(opt.path)
                    return (
                      <button
                        key={opt.path}
                        role="menuitem"
                        onClick={() => { closeMenu(); navigate(opt.path) }}
                        style={{
                          ...menuItemStyle,
                          color: active ? '#5B8896' : '#33302A',
                          fontWeight: active ? 800 : 600,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ display: 'flex', color: active ? '#5B8896' : '#94A3B8' }}>{opt.icon}</span>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}

                  <div style={{ height: '1px', background: '#F1F5F9', margin: '6px 4px' }} />

                  {/* Reiniciar demo — discreto, sólo en el showroom */}
                  {isDemo && (
                    <button
                      role="menuitem"
                      onClick={handleResetDemo}
                      style={{ ...menuItemStyle, color: '#6B7280' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <RotateCcw size={16} />
                        Reiniciar demo
                      </span>
                    </button>
                  )}

                  {/* Salir */}
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    style={{ ...menuItemStyle, color: '#DC2626' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <LogOut size={16} />
                      {/* El niño nunca lee "sesión" (§copy). En la demo, salir
                          es salir del showroom; con cuenta, sólo "Salir". */}
                      {isDemo ? 'Salir de la demo' : role === 'child' ? 'Salir' : 'Cerrar sesión'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Demo modal ──────────────────────────────────────────── */}
      {showDemoModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(51,48,42,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', zIndex: 200,
          }}
          onClick={() => setShowDemoModal(false)}
        >
          <div
            style={{
              background: '#ffffff', borderRadius: '20px', padding: '28px 24px',
              maxWidth: '340px', width: '100%', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              animation: 'wordSlideDown 0.22s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <button onClick={() => setShowDemoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ background: '#F7C31C', borderRadius: '8px', padding: '4px 12px', fontSize: '11px', fontWeight: 800, color: '#33302A', display: 'inline-block', letterSpacing: '0.06em', marginBottom: '12px' }}>
              DEMO
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#33302A', fontFamily: 'Nunito, sans-serif', fontWeight: 600, lineHeight: 1.5 }}>
              Estás recorriendo Dracs sin cuenta. Lo que juegue {DEMO_CHILD_NAME} se guarda
              en este navegador y aparece en las tres vistas. Lo marcado
              como <strong>ejemplo</strong> es ilustrativo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setShowDemoModal(false)}
                style={{ width: '100%', height: '44px', borderRadius: '12px', border: 'none', background: '#F7C31C', color: '#33302A', fontSize: '15px', fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, cursor: 'pointer' }}
              >
                Seguir explorando
              </button>
              <button
                onClick={handleResetDemo}
                style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#ffffff', color: '#33302A', fontSize: '15px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer' }}
              >
                Reiniciar demo
              </button>
              <button
                onClick={handleGoToLogin}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 600, padding: '6px 0' }}
              >
                ¿Tienes cuenta? Inicia sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────── */}
      <main
        key={activeTab ?? location.pathname}
        className="tab-enter"
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', maxWidth: '1200px',
          margin: '0 auto', width: '100%', position: 'relative',
        }}
      >
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

// Estilo base de cada item del menú del avatar.
const menuItemStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  width: '100%', gap: '8px', padding: '10px 12px',
  background: 'transparent', border: 'none', borderRadius: '10px',
  cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  fontSize: '14px', fontWeight: 600, color: '#33302A',
  textAlign: 'left', transition: 'background 0.15s ease',
}
