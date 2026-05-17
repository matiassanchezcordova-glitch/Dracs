import { type ReactNode, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Gamepad2, BarChart2, Users, LogOut, X } from 'lucide-react'
import { type Role } from './components/RoleSelector'
import { useAuth } from './context/AuthContext'
import { TherapistProvider } from './context/TherapistContext'
import {
  clearAllDracsStorage,
  dbRoleToUiRole,
  getLocalRole,
} from './lib/role'

type Tab = 'ejercicio' | 'terapeuta' | 'familia'

const ALL_NAV_TABS: { id: Tab; label: string; icon: ReactNode; roles: Role[]; path: string }[] = [
  { id: 'ejercicio', label: 'Ejercicio',  icon: <Gamepad2  size={20} />, roles: ['child', 'family', 'therapist', 'demo'], path: '/app/nino' },
  { id: 'terapeuta', label: 'Terapeuta',  icon: <BarChart2 size={20} />, roles: ['therapist', 'demo'],                    path: '/app/terapeuta' },
  { id: 'familia',   label: 'Familia',    icon: <Users     size={20} />, roles: ['family', 'therapist', 'demo'],          path: '/app/familia' },
]

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

  const localRole = getLocalRole()
  const role: Role = profile ? dbRoleToUiRole(profile.role) : (localRole ?? 'child')
  const isDemo = role === 'demo'
  const visibleTabs = ALL_NAV_TABS.filter(t => t.roles.includes(role))
  const activeTab = pathToTab(location.pathname)

  const isChildOrFamily = role === 'child' || role === 'family'
  const childName = isDemo ? null : (patient?.child_name ?? null)
  const therapistName = isDemo ? null : (profile?.full_name ?? null)

  async function handleLogout() {
    if (user) await logout()
    clearAllDracsStorage()
    navigate('/', { replace: true })
  }

  function handleDemoCreateAccount() {
    setShowDemoModal(false)
    navigate('/login?role=child')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100svh',
        background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav
        style={{
          backgroundColor: 'rgba(255,248,232,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(11,175,190,0.12)',
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
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* ── Left: logo + user info ─────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 800,
                fontSize: '24px',
                color: '#0BAFBE',
                lineHeight: 1,
                letterSpacing: '2px',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              DRACS
            </span>

            {isDemo && (
              <button
                onClick={() => setShowDemoModal(true)}
                style={{
                  background: '#FFD93D', border: 'none', borderRadius: '6px',
                  padding: '3px 10px', fontSize: '11px', fontWeight: 800,
                  color: '#1A1A2E', cursor: 'pointer', letterSpacing: '0.06em',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                DEMO
              </button>
            )}

            {isChildOrFamily && childName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#FFD93D', color: '#1A1A2E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 800, fontFamily: 'Nunito, sans-serif', flexShrink: 0,
                }}>
                  {childName[0].toUpperCase()}
                </div>
                <span className="dracs-user-name" style={{
                  fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                  fontSize: '14px', color: '#1A1A2E',
                }}>
                  {childName}
                </span>
                <LogoutBtn onLogout={handleLogout} />
              </div>
            )}

            {role === 'therapist' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="dracs-user-name" style={{
                  fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                  fontSize: '11px', color: '#6B7280', letterSpacing: '0.02em',
                }}>
                  {therapistName ?? 'Terapeuta'} · Terapeuta
                </span>
                <LogoutBtn onLogout={handleLogout} />
              </div>
            )}

            {!childName && !therapistName && role !== 'therapist' && (
              <LogoutBtn onLogout={handleLogout} />
            )}
          </div>

          {/* ── Tabs ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {visibleTabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '2px', padding: '6px 16px',
                    backgroundColor: 'transparent',
                    color: active ? '#0BAFBE' : '#6B7280', border: 'none',
                    borderBottom: active ? '2px solid #0BAFBE' : '2px solid transparent',
                    cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700, fontSize: '11px',
                    transition: 'all 0.2s ease', marginBottom: '-2px',
                  }}
                >
                  <span style={{ display: 'flex' }}>{tab.icon}</span>
                  <span className="dracs-nav-tab-label">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* ── Demo modal ──────────────────────────────────────────── */}
      {showDemoModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.55)',
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
            <div style={{ background: '#FFD93D', borderRadius: '8px', padding: '4px 12px', fontSize: '11px', fontWeight: 800, color: '#1A1A2E', display: 'inline-block', letterSpacing: '0.06em', marginBottom: '12px' }}>
              DEMO
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#1A1A2E', fontFamily: 'Nunito, sans-serif', fontWeight: 600, lineHeight: 1.5 }}>
              Estás en modo demo. Los datos son de ejemplo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleDemoCreateAccount}
                style={{ width: '100%', height: '44px', borderRadius: '12px', border: 'none', background: '#0BAFBE', color: '#ffffff', fontSize: '15px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer' }}
              >
                Crear cuenta real
              </button>
              <button
                onClick={() => setShowDemoModal(false)}
                style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#ffffff', color: '#1A1A2E', fontSize: '15px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer' }}
              >
                Seguir en demo
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

function LogoutBtn({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      onClick={onLogout}
      title="Cerrar sesión"
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        borderRadius: '6px', display: 'flex', alignItems: 'center',
        color: '#94A3B8', transition: 'color 0.2s ease', flexShrink: 0,
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#DC2626')}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#94A3B8')}
    >
      <LogOut size={16} />
    </button>
  )
}
