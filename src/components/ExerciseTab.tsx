import { useState } from 'react'
import { useChildProfile, loadHistory } from '../hooks/useChildProfile'
import { buildSession, type RuntimeExercise } from '../data/exercises'
import SetupScreen from './exercise/SetupScreen'
import WelcomeScreen from './exercise/WelcomeScreen'
import ExerciseScreen from './exercise/ExerciseScreen'
import SessionEndScreen from './exercise/SessionEndScreen'

type Screen = 'setup' | 'welcome' | 'exercise' | 'end'

interface Props {
  onNavigateToFamilia: () => void
}

interface EndState {
  correct: number
  total: number
  levelChanged: 'up' | 'down' | null
}

export default function ExerciseTab({ onNavigateToFamilia }: Props) {
  const { profile, createProfile, completeSession } = useChildProfile()
  const [screen, setScreen] = useState<Screen>(profile ? 'welcome' : 'setup')
  const [session, setSession] = useState<RuntimeExercise[]>([])
  const [endState, setEndState] = useState<EndState | null>(null)

  function handleProfileCreated(name: string, age: number) {
    createProfile(name, age)
    setScreen('welcome')
  }

  function handleStartSession() {
    if (!profile) return
    setSession(buildSession(profile.level))
    setScreen('exercise')
  }

  function handleSessionComplete(correct: number, total: number) {
    if (!profile) return

    // Compute level change before saving (completeSession mutates the profile)
    const pct = total > 0 ? correct / total : 0
    let levelChanged: 'up' | 'down' | null = null
    if (total >= 7) {
      if (pct >= 0.8 && profile.level < 4) levelChanged = 'up'
      else if (pct < 0.5 && profile.level > 1) levelChanged = 'down'
    }

    completeSession(correct, total)
    setEndState({ correct, total, levelChanged })
    setScreen('end')
  }

  function handleRepeat() {
    setScreen('welcome')
  }

  // Render
  if (!profile || screen === 'setup') {
    return <SetupScreen onComplete={handleProfileCreated} />
  }

  if (screen === 'welcome') {
    return <WelcomeScreen profile={profile} onStart={handleStartSession} />
  }

  if (screen === 'exercise') {
    return (
      <ExerciseScreen
        exercises={session}
        childName={profile.name}
        level={profile.level}
        sessionNumber={loadHistory().length + 1}
        onComplete={handleSessionComplete}
      />
    )
  }

  if (screen === 'end' && endState) {
    return (
      <SessionEndScreen
        correct={endState.correct}
        total={endState.total}
        levelChanged={endState.levelChanged}
        onRepeat={handleRepeat}
        onViewProgress={onNavigateToFamilia}
      />
    )
  }

  return null
}
