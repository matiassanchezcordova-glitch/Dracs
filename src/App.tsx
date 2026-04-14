import { type ReactNode, useState } from 'react'
import HomeTab from './components/HomeTab'
import ExerciseTab from './components/ExerciseTab'
import TherapistTab from './components/therapist/TherapistTab'
import FamiliaTab from './components/familia/FamiliaTab'

// ── types ─────────────────────────────────────────────────────────────────

type Tab = 'home' | 'ejercicio' | 'terapeuta' | 'familia'

// ── nav tab definitions (excludes 'home') ─────────────────────────────────

const NAV_TABS: { id: Exclude<Tab, 'home'>; label: string; icon: ReactNode }[] = [
  {
    id: 'ejercicio',
    label: 'Ejercicio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="4" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 10v4M18 10v4M8 12h2M14 12h2" />
      </svg>
    ),
  },
  {
    id: 'terapeuta',
    label: 'Terapeuta',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 'familia',
    label: 'Familia',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

// ── app ───────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', backgroundColor: '#F0F9FF' }}>

      {/* ── Navbar — always max-w-[1200px] centered ─────────────── */}
      <nav
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1.5px solid #E0F2FE',
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
          {/* Logo — always links to Home */}
          <button
            onClick={() => setActiveTab('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                backgroundColor: '#0EA5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '15px',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              D
            </div>
            <span
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 900,
                fontSize: '20px',
                color: '#0EA5E9',
                letterSpacing: '-0.02em',
              }}
            >
              DRACS
            </span>
          </button>

          {/* Tabs — none active when on Home */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {NAV_TABS.map(tab => {
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
                    padding: '6px 14px',
                    borderRadius: '12px',
                    backgroundColor: active ? '#E0F2FE' : 'transparent',
                    color: active ? '#0EA5E9' : '#94A3B8',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '11px',
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                >
                  <span style={{ color: active ? '#0EA5E9' : '#94A3B8', display: 'flex' }}>
                    {tab.icon}
                  </span>
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
        }}
      >
        {activeTab === 'home' && (
          <HomeTab onNavigate={setActiveTab} />
        )}
        {activeTab === 'ejercicio' && (
          <ExerciseTab onNavigateToFamilia={() => setActiveTab('familia')} />
        )}
        {activeTab === 'terapeuta' && <TherapistTab />}
        {activeTab === 'familia' && (
          <FamiliaTab onNavigateToEjercicio={() => setActiveTab('ejercicio')} />
        )}
      </main>
    </div>
  )
}
