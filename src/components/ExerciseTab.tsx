import { useState, useEffect, useRef } from 'react'
import { BarChart2, Stethoscope } from 'lucide-react'
import { useChildProfile, loadHistory } from '../hooks/useChildProfile'
import { buildSessionFromDb, type RuntimeExercise, type HotspotFilter } from '../data/exercises'
import { getPaletteForHotspot } from '../lib/worldColors'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'
import SetupScreen from './exercise/SetupScreen'
import WelcomeScreen from './exercise/WelcomeScreen'
import ExerciseScreen from './exercise/ExerciseScreen'
import SessionEndScreen from './exercise/SessionEndScreen'

type Screen = 'setup' | 'welcome' | 'loading' | 'exercise' | 'end'

interface Props {
  onNavigateToFamilia: () => void
  onNavigateToTerapeuta: () => void
  onRequestAuth?: (mode: 'login' | 'signup') => void
  // Mapa-mundo (S5.5): cuando se entra desde un hotspot, filtra el pool de la
  // sesión y permite volver al mapa. Si están ausentes, el comportamiento es el
  // de siempre (sesión sin filtro, salida a la pantalla de bienvenida).
  hotspotFilter?: HotspotFilter
  // Identidad de color del lugar: elige la paleta (mar, casa, playa, sol, faro).
  hotspotId?: string
  onBackToMap?: () => void
}

interface EndState {
  correct: number
  total: number
  levelChanged: 'up' | 'down' | null
}

// ── Auth upgrade prompt overlay ───────────────────────────────────────────

function ProgressAuthPrompt({
  onSignup, onLogin, onDismiss,
}: {
  onSignup: () => void
  onLogin: () => void
  onDismiss: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,26,46,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', zIndex: 100,
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '24px',
        padding: '32px', maxWidth: '360px', width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        textAlign: 'center',
        animation: 'wordSlideDown 0.25s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <BarChart2 size={44} color="#0BAFBE" />
        </div>
        <h2 style={{
          margin: '0 0 8px',
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: '22px', fontWeight: 700, color: '#33302A',
        }}>
          ¡Guarda tu progreso!
        </h2>
        <p style={{
          margin: '0 0 24px', fontSize: '14px', color: '#6B7280',
          fontFamily: 'Nunito, sans-serif', lineHeight: 1.55,
        }}>
          Para guardar y ver tu progreso necesitas una cuenta.
          Es gratis y toma 30 segundos.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onSignup}
            style={{
              width: '100%', height: '48px', borderRadius: '14px', border: 'none',
              background: '#0BAFBE', color: '#ffffff', fontSize: '15px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Crear cuenta
          </button>
          <button
            onClick={onLogin}
            style={{
              width: '100%', height: '48px', borderRadius: '14px',
              border: '1.5px solid #E5E7EB', background: '#ffffff',
              color: '#1A1A2E', fontSize: '15px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={onDismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: '#94A3B8',
              fontFamily: 'Nunito, sans-serif', fontWeight: 600, padding: '6px 0',
            }}
          >
            Seguir sin cuenta
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function ExerciseTab({ onNavigateToFamilia, onNavigateToTerapeuta, onRequestAuth, hotspotFilter, hotspotId, onBackToMap }: Props) {
  const { profile, createProfile, completeSession } = useChildProfile()
  const { user, child, profile: authProfile } = useAuth()
  const palette = getPaletteForHotspot(hotspotId)

  // En modo hotspot arrancamos en 'loading' para que nunca se vea el welcome.
  const [screen, setScreen] = useState<Screen>(
    profile ? (hotspotFilter ? 'loading' : 'welcome') : 'setup',
  )
  const [session, setSession] = useState<RuntimeExercise[]>([])
  const [endState, setEndState] = useState<EndState | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Auto-arranque del flujo de hotspot: apenas hay perfil, saltamos la
  // bienvenida y vamos directo a loading → exercise. Una sola vez (ref guard).
  const autoStartedRef = useRef(false)
  useEffect(() => {
    if (!hotspotFilter || !profile || autoStartedRef.current) return
    autoStartedRef.current = true
    void handleStartSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspotFilter, profile])

  if (authProfile?.role === 'therapist') {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', fontFamily: 'Nunito, sans-serif',
        textAlign: 'center', gap: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Stethoscope size={48} color="#0BAFBE" />
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1A1A2E' }}>
          Esta sección es para los pacientes
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', maxWidth: '360px', lineHeight: 1.6 }}>
          Como terapeuta, puedes ver el progreso de tus pacientes en el panel clínico.
        </p>
        <button
          onClick={onNavigateToTerapeuta}
          style={{
            marginTop: '8px', padding: '12px 24px', borderRadius: '12px',
            border: 'none', background: '#0BAFBE', color: '#ffffff',
            fontSize: '15px', fontWeight: 700, fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
          }}
        >
          Ir al panel clínico
        </button>
      </div>
    )
  }

  function handleProfileCreated(name: string, age: number) {
    createProfile(name, age)
    // En hotspot vamos a 'loading' (el efecto de auto-arranque dispara la
    // partida al actualizarse el perfil); en legacy, a la bienvenida.
    setScreen(hotspotFilter ? 'loading' : 'welcome')
  }

  async function handleStartSession() {
    if (!profile) return
    setLoadError(null)
    setScreen('loading')
    try {
      const built = await buildSessionFromDb(profile.level, hotspotFilter)
      if (built.length === 0) {
        throw new Error('No hay juegos disponibles para tu nivel.')
      }
      setSession(built)
      setSessionStartTime(new Date())
      setScreen('exercise')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No pudimos cargar los juegos.'
      setLoadError(msg)
      setScreen('welcome')
    }
  }

  async function handleSessionComplete(correct: number, total: number) {
    if (!profile) return

    const pct = total > 0 ? correct / total : 0
    let levelChanged: 'up' | 'down' | null = null
    if (total >= 7) {
      if (pct >= 0.8 && profile.level < 4) levelChanged = 'up'
      else if (pct < 0.5 && profile.level > 1) levelChanged = 'down'
    }

    completeSession(correct, total)
    setEndState({ correct, total, levelChanged })
    setScreen('end')

    if (user && child) {
      const startedAt = sessionStartTime ?? new Date()
      const endedAt = new Date()
      const durationSec = Math.max(
        0,
        Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
      )
      const { error } = await supabase.from('sessions').insert({
        child_id: child.id,
        total_exercises: total,
        correct_count: correct,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSec,
      })
      if (error) console.warn('[Dracs] sessions insert failed:', error.message)
    }
    setSessionStartTime(null)
  }

  function handleRepeat() {
    // "Otra partida": en hotspot rejugamos el mismo pool directo (sin welcome).
    if (hotspotFilter) void handleStartSession()
    else setScreen('welcome')
  }

  function handleViewProgress() {
    if (user) {
      onNavigateToFamilia()
    } else {
      setShowAuthPrompt(true)
    }
  }

  function handleDismissAuthPrompt() {
    setShowAuthPrompt(false)
    setScreen('welcome')
  }

  // Render
  if (!profile || screen === 'setup') {
    return <SetupScreen onComplete={handleProfileCreated} />
  }

  if (screen === 'welcome') {
    return <WelcomeScreen profile={profile} onStart={handleStartSession} errorMessage={loadError} palette={palette} />
  }

  if (screen === 'loading') {
    return <LoadingSpinner />
  }

  if (screen === 'exercise') {
    return (
      <ExerciseScreen
        exercises={session}
        childName={profile.name}
        sessionNumber={loadHistory().length + 1}
        onComplete={handleSessionComplete}
        onExit={() => (onBackToMap ? onBackToMap() : setScreen('welcome'))}
        palette={palette}
      />
    )
  }

  if (screen === 'end' && endState) {
    return (
      <>
        <SessionEndScreen
          correct={endState.correct}
          total={endState.total}
          levelChanged={endState.levelChanged}
          onRepeat={handleRepeat}
          onViewProgress={handleViewProgress}
          hasAccount={!!user}
          onAutoPlayNext={hotspotFilter ? handleRepeat : undefined}
          palette={palette}
        />
        {showAuthPrompt && (
          <ProgressAuthPrompt
            onSignup={() => onRequestAuth?.('signup')}
            onLogin={() => onRequestAuth?.('login')}
            onDismiss={handleDismissAuthPrompt}
          />
        )}
      </>
    )
  }

  return null
}
