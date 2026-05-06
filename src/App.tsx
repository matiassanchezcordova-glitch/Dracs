import { type ReactNode, useState } from 'react'
import { Gamepad2, BarChart2, Users, LogOut } from 'lucide-react'
import ExerciseTab from './components/ExerciseTab'
import TherapistTab from './components/therapist/TherapistTab'
import FamiliaTab from './components/familia/FamiliaTab'
import { type Role } from './components/RoleSelector'
import { useAuth } from './context/AuthContext'
import { TherapistProvider } from './context/TherapistContext'

type Tab = 'ejercicio' | 'terapeuta' | 'familia'

const ALL_NAV_TABS: { id: Tab; label: string; icon: ReactNode; roles: Role[] }[] = [
  { id: 'ejercicio', label: 'Ejercicio',  icon: <Gamepad2  size={20} />, roles: ['child', 'family', 'therapist'] },
  { id: 'terapeuta', label: 'Terapeuta',  icon: <BarChart2 size={20} />, roles: ['therapist'] },
  { id: 'familia',   label: 'Familia',    icon: <Users     size={20} />, roles: ['family', 'therapist'] },
]

function defaultTabForRole(role: Role): Tab {
  if (role === 'child') return 'ejercicio'
  if (role === 'family') return 'familia'
  return 'terapeuta'
}

interface Props {
  role: Role
  onLogout: () => void
  onRequestAuth?: (mode: 'login' | 'signup') => void
  initialTab?: Tab
}

function AppInner({ role, onLogout, onRequestAuth, initialTab }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(() => initialTab ?? defaultTabForRole(role))
  const { patient, profile } = useAuth()

  const visibleTabs = ALL_NAV_TABS.filter(t => t.roles.includes(role))

  const isChildOrFamily = role === 'child' || role === 'family'
  const childName = patient?.child_name ?? null
  const therapistName = profile?.full_name ?? null

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 800,
                fontSize: '24px',
                color: '#0BAFBE',
                lineHeight: 1,
                letterSpacing: '2px',
              }}
            >
              DRACS
            </span>

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
                <LogoutBtn onLogout={onLogout} />
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
                <LogoutBtn onLogout={onLogout} />
              </div>
            )}

            {!childName && !therapistName && role !== 'therapist' && (
              <LogoutBtn onLogout={onLogout} />
            )}
          </div>

          {/* ── Tabs ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {visibleTabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

      {/* ── Content ─────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', maxWidth: '1200px',
          margin: '0 auto', width: '100%', position: 'relative',
        }}
      >
        <div
          key={activeTab}
          className="tab-enter"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {activeTab === 'ejercicio' && (
            <ExerciseTab
              onNavigateToFamilia={() => setActiveTab('familia')}
              onNavigateToTerapeuta={() => setActiveTab('terapeuta')}
              onRequestAuth={onRequestAuth}
            />
          )}
          {activeTab === 'terapeuta' && <TherapistTab />}
          {activeTab === 'familia' && (
            <FamiliaTab
              onNavigateToEjercicio={() => setActiveTab('ejercicio')}
              onNavigateToTerapeuta={() => setActiveTab('terapeuta')}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function App({ role, onLogout, onRequestAuth, initialTab }: Props) {
  return (
    <TherapistProvider>
      <AppInner role={role} onLogout={onLogout} onRequestAuth={onRequestAuth} initialTab={initialTab} />
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
      <LogOut size={14} />
    </button>
  )
}
