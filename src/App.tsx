import { type ReactNode, useState } from 'react'
import { Gamepad2, BarChart2, Users } from 'lucide-react'
import ExerciseTab from './components/ExerciseTab'
import TherapistTab from './components/therapist/TherapistTab'
import FamiliaTab from './components/familia/FamiliaTab'
import { type Role } from './components/RoleSelector'

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
}

export default function App({ role, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(() => defaultTabForRole(role))

  const visibleTabs = ALL_NAV_TABS.filter(t => t.roles.includes(role))

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100svh',
        background: 'linear-gradient(145deg, #0BAFBE 0%, #0891A0 40%, #076E7A 100%)',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav
        style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
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
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.75')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          >
            <span
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 800,
                fontSize: '24px',
                color: '#ffffff',
                lineHeight: 1,
                letterSpacing: '2px',
              }}
            >
              DRACS
            </span>
          </button>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {visibleTabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '6px 16px',
                    backgroundColor: 'transparent',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    border: 'none',
                    borderBottom: active ? '2px solid #ffffff' : '2px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '11px',
                    transition: 'all 0.2s ease',
                    marginBottom: '-2px',
                  }}
                >
                  <span style={{ display: 'flex' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          key={activeTab}
          className="tab-enter"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {activeTab === 'ejercicio' && (
            <ExerciseTab onNavigateToFamilia={() => setActiveTab('familia')} />
          )}
          {activeTab === 'terapeuta' && <TherapistTab />}
          {activeTab === 'familia' && (
            <FamiliaTab onNavigateToEjercicio={() => setActiveTab('ejercicio')} />
          )}
        </div>
      </main>
    </div>
  )
}
