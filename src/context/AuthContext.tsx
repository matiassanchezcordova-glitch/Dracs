import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { type User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, Patient, TherapistRecord } from '../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  patient: Patient | null
  therapistData: TherapistRecord | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  signup: (
    email: string,
    password: string,
    role: Profile['role'],
    fullName: string,
  ) => Promise<{ error: string | null; userId?: string; needsConfirmation?: boolean }>
  logout: () => Promise<void>
  refreshPatient: () => Promise<void>
  refreshTherapist: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [therapistData, setTherapistData] = useState<TherapistRecord | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    setLoading(true)

    // 5-second safety timeout — prevents infinite loading if DB is unreachable
    const timeout = setTimeout(() => {
      console.warn('[Dracs] loadProfile timeout after 5 s')
      setLoading(false)
    }, 5000)

    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!prof) return
      setProfile(prof as Profile)

      if (prof.role === 'patient' || prof.role === 'family') {
        const { data: pat } = await supabase
          .from('patients')
          .select('*')
          .eq('profile_id', userId)
          .single()
        setPatient(pat as Patient | null)
      }

      if (prof.role === 'therapist') {
        const { data: ther } = await supabase
          .from('therapists')
          .select('*')
          .eq('profile_id', userId)
          .single()
        setTherapistData(ther as TherapistRecord | null)
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  function clearState() {
    setUser(null)
    setProfile(null)
    setPatient(null)
    setTherapistData(null)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          loadProfile(session.user.id)
        } else {
          clearState()
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Auth methods ─────────────────────────────────────────────────────────

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signup(
    email: string,
    password: string,
    role: Profile['role'],
    fullName: string,
  ) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'No se pudo crear la cuenta' }

    if (!data.session) {
      return { error: null, userId: data.user.id, needsConfirmation: true }
    }

    const { error: profErr } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      full_name: fullName,
      email,
    })
    if (profErr) return { error: profErr.message }

    // onAuthStateChange fires before this insert completes (race condition),
    // so loadProfile found no profile. Set it directly to avoid wrong role in app.
    setProfile({ id: data.user.id, role, full_name: fullName, email, avatar_url: null, created_at: new Date().toISOString() })

    return { error: null, userId: data.user.id }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function refreshPatient() {
    if (!user) return
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('profile_id', user.id)
      .single()
    setPatient(data as Patient | null)
  }

  async function refreshTherapist() {
    if (!user) return
    const { data } = await supabase
      .from('therapists')
      .select('*')
      .eq('profile_id', user.id)
      .single()
    setTherapistData(data as TherapistRecord | null)
  }

  return (
    <AuthContext.Provider
      value={{
        user, profile, patient, therapistData, loading,
        login, signup, logout, refreshPatient, refreshTherapist,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
