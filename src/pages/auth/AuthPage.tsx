import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, EyeOff, ChevronLeft, X, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Center, TherapistWithProfile } from '../../lib/types'
import type { Role } from '../../components/RoleSelector'

// ── Types ─────────────────────────────────────────────────────────────────

type AuthView =
  | 'choose'
  | 'login'
  | 'signup-s1'
  | 'signup-pat-s2'
  | 'signup-pat-s3'
  | 'signup-ther-s2'
  | 'signup-ther-s3'
  | 'confirm-email'

interface SignupState {
  email: string
  password: string
  fullName: string
  userId: string
  childName: string
  childAge: number
  diagnosis: string
  specialty: string
  licenseNumber: string
  city: string
}

interface Props {
  role: Role
  onSuccess: () => void
  onSkip: () => void
  onBack: () => void
  startAtLogin?: boolean
}

// ── Design tokens ─────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: '14px',
  border: '1.5px solid #E5E7EB',
  background: '#ffffff',
  padding: '0 16px',
  fontSize: '16px',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 500,
  color: '#33302A',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.18s ease',
}

const BTN_PRIMARY: React.CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: '14px',
  border: 'none',
  background: '#F7C31C',
  color: '#33302A',
  fontSize: '16px',
  fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'opacity 0.18s ease',
}

const BTN_SECONDARY: React.CSSProperties = {
  ...BTN_PRIMARY,
  background: '#ffffff',
  border: '1.5px solid #E5E7EB',
  color: '#33302A',
}

// ── Shared sub-components ──────────────────────────────────────────────────

function FocusInput({
  type = 'text', placeholder, value, onChange, autoFocus, suffix,
}: {
  type?: string; placeholder: string; value: string
  onChange: (v: string) => void; autoFocus?: boolean; suffix?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...INPUT_STYLE,
          borderColor: focused ? '#5B8896' : '#E5E7EB',
          paddingRight: suffix ? '48px' : '16px',
        }}
      />
      {suffix && (
        <div style={{
          position: 'absolute', right: '16px', top: '50%',
          transform: 'translateY(-50%)', display: 'flex',
          alignItems: 'center', color: '#94A3B8', cursor: 'pointer',
        }}>
          {suffix}
        </div>
      )}
    </div>
  )
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? '20px' : '8px',
          height: '8px',
          borderRadius: '4px',
          background: i === current ? '#5B8896' : '#E5E7EB',
          transition: 'all 0.25s ease',
        }} />
      ))}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: '0 0 8px',
      fontFamily: '"Fredoka", serif',
      fontSize: '26px',
      fontWeight: 700,
      color: '#33302A',
      lineHeight: 1.2,
      textAlign: 'center',
    }}>
      {children}
    </h2>
  )
}

function CardSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 24px',
      fontSize: '14px',
      color: '#6B7280',
      fontFamily: 'Nunito, sans-serif',
      textAlign: 'center',
      lineHeight: 1.5,
    }}>
      {children}
    </p>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '10px',
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      fontSize: '13px',
      color: '#DC2626',
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 600,
      lineHeight: 1.4,
    }}>
      {msg}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 8px',
      fontSize: '13px',
      fontWeight: 700,
      color: '#374151',
      fontFamily: 'Nunito, sans-serif',
    }}>
      {children}
    </p>
  )
}

// ── Spinner button ─────────────────────────────────────────────────────────

function SpinnerBtn({
  loading, label, loadingLabel = 'Guardando...', onClick, disabled = false,
}: {
  loading: boolean; label: string; loadingLabel?: string
  onClick?: () => void; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{ ...BTN_PRIMARY, opacity: loading ? 0.8 : 1, cursor: loading || disabled ? 'default' : 'pointer' }}
    >
      {loading
        ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />{loadingLabel}</>
        : label}
    </button>
  )
}

// ── Layout ─────────────────────────────────────────────────────────────────

function AuthLayout({
  children, onBack, showBack = true,
}: {
  children: React.ReactNode; onBack: () => void; showBack?: boolean
}) {
  const navigate = useNavigate()
  return (
    <div className="dracs-auth-layout" style={{
      minHeight: '100vh',
      background: '#FAF5E8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 24px 48px',
      fontFamily: 'Nunito, sans-serif',
      position: 'relative',
    }}>
      {/* ── Top bar: brand lockup (→ landing) + contextual back ────── */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        {/* Dragón nuevo arriba a la izquierda = botón que lleva a la landing (/) */}
        <button
          onClick={() => navigate('/')}
          aria-label="Volver a la web de Dracs"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', padding: '4px',
          }}
        >
          <img
            src="/logo-dracs.png"
            alt="Dracs"
            style={{
              width: '38px',
              height: 'auto',
              animation: 'floatDragon2 3s ease-in-out infinite',
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.12))',
            }}
          />
          <span style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '20px',
            color: '#33302A',
            letterSpacing: '2px',
          }}>
            DRACS
          </span>
        </button>

        {showBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#5B8896',
              fontSize: '14px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              padding: '8px',
            }}
          >
            <ChevronLeft size={16} />
            Volver
          </button>
        )}
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        padding: '32px',
      }}>
        {children}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Role helpers ──────────────────────────────────────────────────────────

function roleMismatchMsg(dbRole: string, _wanted: Role): string {
  if (dbRole === 'therapist') {
    return 'Esta cuenta es de terapeuta. Usá Logopedia para entrar.'
  }
  if (dbRole === 'patient') {
    return 'Esta cuenta es de paciente. Usá Ejercicios para entrar.'
  }
  return 'Esta cuenta es de familiar. Usá Progreso para entrar.'
}

// ── Screen: Choose ────────────────────────────────────────────────────────

function ChooseScreen({ role, onLogin, onSignup, onSkip, onBack }: {
  role: Role; onLogin: () => void; onSignup: () => void; onSkip: () => void; onBack: () => void
}) {
  const isTherapist = role === 'therapist'
  return (
    <AuthLayout onBack={onBack}>
      <CardTitle>{isTherapist ? 'Acceso logopeda' : '¿Ya usás Dracs?'}</CardTitle>
      <CardSubtitle>
        {isTherapist
          ? 'Inicia sesión o crea tu cuenta profesional.'
          : 'Inicia sesión para guardar el progreso, o continúa sin cuenta.'}
      </CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={onLogin} style={BTN_PRIMARY}>
          Sí, iniciar sesión
        </button>
        <button onClick={onSignup} style={BTN_SECONDARY}>
          {isTherapist ? 'Registrarme como terapeuta' : 'No, crear cuenta nueva'}
        </button>
        {role === 'child' && (
          <button
            onClick={onSkip}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif',
              fontWeight: 600, padding: '8px 0', textAlign: 'center',
            }}
          >
            Continuar sin cuenta
          </button>
        )}
        {role === 'family' && (
          <p style={{
            margin: '4px 0 0', fontSize: '12px', color: '#94A3B8',
            fontFamily: 'Nunito, sans-serif', textAlign: 'center', lineHeight: 1.4,
          }}>
            Para ver el progreso necesitás una cuenta.
          </p>
        )}
      </div>
    </AuthLayout>
  )
}

// ── Screen: Login ─────────────────────────────────────────────────────────

function LoginScreen({ role, onSuccess, onBack }: {
  role: Role; onSuccess: () => void; onBack: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email.trim() || !password) { setError('Rellena todos los campos'); return }
    setLoading(true)
    setError('')

    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      setLoading(false)
      setError('La conexión tardó demasiado. Verificá tu internet e intentá de nuevo.')
    }, 5000)

    try {
      // Sign in directly to get the user object for role verification
      const { data: { user: authUser }, error: authError } =
        await supabase.auth.signInWithPassword({ email: email.trim(), password })

      if (timedOut) return
      clearTimeout(timeout)

      if (authError) {
        const msg = authError.message.toLowerCase()
        throw new Error(
          msg.includes('invalid') || msg.includes('credentials')
            ? 'Email o contraseña incorrectos'
            : authError.message
        )
      }
      if (!authUser) throw new Error('No se pudo autenticar. Intentá de nuevo.')

      // Verify the role matches the section the user is entering
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (timedOut) return

      if (profError || !prof) {
        await supabase.auth.signOut()
        throw new Error('No encontramos tu perfil. Contactá soporte.')
      }

      const wantTherapist = role === 'therapist'
      const isTherapist = prof.role === 'therapist'

      if (wantTherapist !== isTherapist) {
        await supabase.auth.signOut()
        throw new Error(roleMismatchMsg(prof.role, role))
      }

      onSuccess()
    } catch (err) {
      if (timedOut) return
      clearTimeout(timeout)
      setError(err instanceof Error ? err.message : 'Algo salió mal. Intentá de nuevo.')
    } finally {
      if (!timedOut) setLoading(false)
    }
  }

  return (
    <AuthLayout onBack={onBack}>
      <CardTitle>Iniciar sesión</CardTitle>
      <CardSubtitle>Tu progreso te está esperando.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ErrorMsg msg={error} />
        <FocusInput type="email" placeholder="Email" value={email} onChange={setEmail} autoFocus />
        <FocusInput
          type={showPass ? 'text' : 'password'}
          placeholder="Contraseña"
          value={password}
          onChange={setPassword}
          suffix={
            <span onClick={() => setShowPass(p => !p)}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          }
        />
        <SpinnerBtn
          loading={loading}
          label="Iniciar sesión"
          loadingLabel="Iniciando sesión..."
          onClick={handleSubmit}
        />
      </div>
    </AuthLayout>
  )
}

// ── Screen: Signup step 1 ─────────────────────────────────────────────────

function SignupStep1({ role, onContinue, onBack }: {
  role: Role
  onContinue: (email: string, password: string, fullName: string, userId: string) => void
  onBack: () => void
}) {
  const { signup } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const dbRole: 'patient' | 'family' | 'therapist' =
    role === 'therapist' ? 'therapist' : role === 'family' ? 'family' : 'patient'

  async function handleContinue() {
    if (!fullName.trim() || !email.trim() || !password) { setError('Rellena todos los campos'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    setError('')

    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      setLoading(false)
      setError('La conexión tardó demasiado. Verificá tu internet e intentá de nuevo.')
    }, 5000)

    try {
      const { error: err, userId: uid, needsConfirmation } = await signup(
        email.trim(), password, dbRole, fullName.trim(),
      )
      if (timedOut) return
      clearTimeout(timeout)

      if (err) {
        const lower = err.toLowerCase()
        if (lower.includes('already registered') || lower.includes('already been registered')) {
          throw new Error('Ya existe una cuenta con este email. Iniciá sesión.')
        }
        throw new Error(err)
      }

      if (needsConfirmation) {
        onContinue(email.trim(), password, fullName.trim(), '')
        return
      }

      onContinue(email.trim(), password, fullName.trim(), uid ?? '')
    } catch (err) {
      if (timedOut) return
      clearTimeout(timeout)
      setError(err instanceof Error ? err.message : 'Algo salió mal. Intentá de nuevo.')
    } finally {
      if (!timedOut) setLoading(false)
    }
  }

  return (
    <AuthLayout onBack={onBack}>
      <StepDots total={3} current={0} />
      <CardTitle>Crear cuenta</CardTitle>
      <CardSubtitle>
        {role === 'therapist' ? 'Acceso para logopedas' : 'Acceso para familia y niño'}
      </CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ErrorMsg msg={error} />
        <FocusInput placeholder="Nombre completo" value={fullName} onChange={setFullName} autoFocus />
        <FocusInput type="email" placeholder="Email" value={email} onChange={setEmail} />
        <FocusInput
          type={showPass ? 'text' : 'password'}
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={setPassword}
          suffix={
            <span onClick={() => setShowPass(p => !p)}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          }
        />
        <div style={{ height: '4px' }} />
        <SpinnerBtn loading={loading} label="Continuar →" onClick={handleContinue} />
      </div>
    </AuthLayout>
  )
}

// ── Screen: Patient step 2 ────────────────────────────────────────────────

const DIAGNOSES = ['Síndrome de Down', 'TEA', 'Parálisis cerebral', 'Apraxia', 'Otro']

function PatientStep2({ onContinue, onBack }: {
  onContinue: (childName: string, childAge: number, diagnosis: string) => void
  onBack: () => void
}) {
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState(0)
  const [diagnosis, setDiagnosis] = useState('Síndrome de Down')
  const [error, setError] = useState('')

  function handleContinue() {
    if (!childName.trim()) { setError('Escribe el nombre del niño'); return }
    if (!childAge) { setError('Selecciona la edad'); return }
    onContinue(childName.trim(), childAge, diagnosis)
  }

  return (
    <AuthLayout onBack={onBack}>
      <StepDots total={3} current={1} />
      <CardTitle>Cuéntanos sobre tu hijo</CardTitle>
      <CardSubtitle>Así personalizamos sus ejercicios.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ErrorMsg msg={error} />

        <div>
          <Label>¿Cómo se llama tu hijo?</Label>
          <FocusInput placeholder="Nombre del niño" value={childName} onChange={setChildName} autoFocus />
        </div>

        <div>
          <Label>¿Cuántos años tiene?</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[3, 4, 5, 6, 7, 8, 9, 10].map(age => (
              <button
                key={age}
                onClick={() => setChildAge(age)}
                style={{
                  height: '52px', borderRadius: '14px',
                  border: `1.5px solid ${childAge === age ? '#5B8896' : '#E5E7EB'}`,
                  background: childAge === age ? '#F0FAFA' : '#ffffff',
                  color: childAge === age ? '#5B8896' : '#6B7280',
                  fontSize: '18px', fontWeight: 700, fontFamily: 'Nunito, sans-serif',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Diagnóstico</Label>
          <select
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            style={{
              ...INPUT_STYLE, appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '40px',
            }}
          >
            {DIAGNOSES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <button onClick={handleContinue} style={BTN_PRIMARY}>Continuar →</button>
      </div>
    </AuthLayout>
  )
}

// ── Screen: Patient step 3 (therapist link) ───────────────────────────────

function PatientStep3({
  userId, childName, childAge, diagnosis, onSuccess, onBack,
}: {
  userId: string; childName: string; childAge: number; diagnosis: string
  onSuccess: () => void; onBack: () => void
}) {
  const { refreshPatient } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TherapistWithProfile[]>([])
  const [selected, setSelected] = useState<TherapistWithProfile | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase
        .from('therapists')
        .select('*, profiles(full_name)')
        .eq('verified', true)
        .or(`center_name.ilike.%${query}%,city.ilike.%${query}%`)
        .limit(8)
      setResults((data ?? []) as TherapistWithProfile[])
      setSearching(false)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function handleFinish(therapistToLink: TherapistWithProfile | null) {
    setSaving(true)
    setError('')

    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      setSaving(false)
      setError('La conexión tardó demasiado. Verificá tu internet e intentá de nuevo.')
    }, 5000)

    try {
      const { data: pat, error: patErr } = await supabase
        .from('patients')
        .insert({ profile_id: userId, child_name: childName, child_age: childAge, diagnosis })
        .select()
        .single()

      if (timedOut) return
      if (patErr || !pat) throw new Error('Error al guardar los datos del niño. Inténtalo de nuevo.')

      if (therapistToLink) {
        const { error: linkErr } = await supabase.from('link_requests').insert({
          patient_id: pat.id,
          therapist_id: therapistToLink.profile_id,
        })
        if (timedOut) return
        if (!linkErr) setLinkSent(true)
      }

      await refreshPatient()
      if (timedOut) return

      clearTimeout(timeout)
      onSuccess()
    } catch (err) {
      if (timedOut) return
      clearTimeout(timeout)
      setError(err instanceof Error ? err.message : 'Algo salió mal. Intentá de nuevo.')
    } finally {
      if (!timedOut) setSaving(false)
    }
  }

  if (linkSent) {
    return (
      <AuthLayout onBack={onBack}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={28} color="#059669" />
          </div>
          <CardTitle>¡Solicitud enviada!</CardTitle>
          <CardSubtitle>
            Avisaremos a {selected?.profiles.full_name} cuando acepte la vinculación.
          </CardSubtitle>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout onBack={onBack}>
      <StepDots total={3} current={2} />
      <CardTitle>¿Tiene terapeuta?</CardTitle>
      <CardSubtitle>Búscalo para conectar el progreso. Puedes hacerlo después.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ErrorMsg msg={error} />

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            placeholder="Buscar por nombre, centro o ciudad..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
            style={{ ...INPUT_STYLE, paddingLeft: '44px' }}
            onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#5B8896' }}
            onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#E5E7EB' }}
          />
        </div>

        {selected && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: '#F0FAFA', border: '1.5px solid #5B8896' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#5B8896', fontFamily: 'Nunito, sans-serif' }}>{selected.profiles.full_name}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280', fontFamily: 'Nunito, sans-serif' }}>{selected.specialty} · {selected.center_name}</p>
            </div>
            <button onClick={() => { setSelected(null); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {!selected && results.length > 0 && (
          <div style={{ borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            {results.map((t, i) => (
              <button
                key={t.id}
                onClick={() => { setSelected(t); setQuery(t.profiles.full_name) }}
                style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
              >
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#33302A', fontFamily: 'Nunito, sans-serif' }}>{t.profiles.full_name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280', fontFamily: 'Nunito, sans-serif' }}>{t.specialty} · {t.center_name} · {t.city}</p>
              </button>
            ))}
          </div>
        )}

        {searching && <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>Buscando...</p>}
        {!searching && query.length >= 2 && results.length === 0 && !selected && (
          <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
            No se encontraron terapeutas. Puedes vincularte más tarde.
          </p>
        )}

        <SpinnerBtn
          loading={saving}
          label={selected ? 'Enviar solicitud y empezar' : 'Empezar sin terapeuta'}
          onClick={() => handleFinish(selected)}
        />
        <button
          onClick={() => handleFinish(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'center', padding: '4px' }}
        >
          Saltar por ahora
        </button>
      </div>
    </AuthLayout>
  )
}

// ── Screen: Therapist step 2 ──────────────────────────────────────────────

const SPECIALTIES = ['Logopeda', 'Terapeuta ocupacional', 'Neuropsicólogo/a']

function TherapistStep2({ onContinue, onBack }: {
  onContinue: (specialty: string, licenseNumber: string, city: string) => void
  onBack: () => void
}) {
  const [specialty, setSpecialty] = useState('Logopeda')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')

  function handleContinue() {
    if (!licenseNumber.trim() || !city.trim()) { setError('Rellena todos los campos'); return }
    onContinue(specialty, licenseNumber.trim(), city.trim())
  }

  return (
    <AuthLayout onBack={onBack}>
      <StepDots total={3} current={1} />
      <CardTitle>Datos profesionales</CardTitle>
      <CardSubtitle>Necesitamos verificar tu perfil clínico.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ErrorMsg msg={error} />

        <div>
          <Label>Especialidad</Label>
          <select
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            style={{
              ...INPUT_STYLE, appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '40px',
            }}
          >
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <Label>Número de colegiado</Label>
          <FocusInput placeholder="Ej: 28/12345" value={licenseNumber} onChange={setLicenseNumber} />
        </div>

        <div>
          <Label>Ciudad</Label>
          <FocusInput placeholder="Ej: Barcelona" value={city} onChange={setCity} />
        </div>

        <button onClick={handleContinue} style={BTN_PRIMARY}>Continuar →</button>
      </div>
    </AuthLayout>
  )
}

// ── Screen: Therapist step 3 ──────────────────────────────────────────────

function TherapistStep3({
  userId, specialty, licenseNumber, city, onSuccess, onBack,
}: {
  userId: string; specialty: string; licenseNumber: string; city: string
  onSuccess: () => void; onBack: () => void
}) {
  const { refreshTherapist } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Center[]>([])
  const [selected, setSelected] = useState<Center | null>(null)
  const [searching, setSearching] = useState(false)
  const [newCenterName, setNewCenterName] = useState('')
  const [showNewCenter, setShowNewCenter] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase.from('centers').select('*')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%`).limit(8)
      setResults((data ?? []) as Center[])
      setSearching(false)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function handleFinish() {
    const centerName = showNewCenter ? newCenterName.trim() : selected?.name ?? city
    if (!centerName) { setError('Selecciona o añade tu centro de trabajo'); return }
    setSaving(true)
    setError('')

    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      setSaving(false)
      setError('La conexión tardó demasiado. Verificá tu internet e intentá de nuevo.')
    }, 5000)

    try {
      if (showNewCenter && newCenterName.trim()) {
        await supabase.from('centers').insert({ name: newCenterName.trim(), city, type: 'other' })
        if (timedOut) return
      }

      const { error: therErr } = await supabase.from('therapists').insert({
        profile_id: userId, specialty, license_number: licenseNumber,
        center_name: centerName, city,
      })
      if (timedOut) return
      if (therErr) throw new Error('Error al guardar los datos. Inténtalo de nuevo.')

      await refreshTherapist()
      if (timedOut) return

      clearTimeout(timeout)
      onSuccess()
    } catch (err) {
      if (timedOut) return
      clearTimeout(timeout)
      setError(err instanceof Error ? err.message : 'Algo salió mal. Intentá de nuevo.')
    } finally {
      if (!timedOut) setSaving(false)
    }
  }

  return (
    <AuthLayout onBack={onBack}>
      <StepDots total={3} current={2} />
      <CardTitle>Centro de trabajo</CardTitle>
      <CardSubtitle>¿En qué centro ejerces? Tus pacientes podrán encontrarte.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ErrorMsg msg={error} />

        {!showNewCenter && (
          <>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                placeholder="Buscar tu centro de trabajo..."
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null) }}
                style={{ ...INPUT_STYLE, paddingLeft: '44px' }}
                onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#5B8896' }}
                onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#E5E7EB' }}
              />
            </div>

            {selected && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: '#F0FAFA', border: '1.5px solid #5B8896' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#5B8896', fontFamily: 'Nunito, sans-serif' }}>{selected.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280', fontFamily: 'Nunito, sans-serif' }}>{selected.city}</p>
                </div>
                <button onClick={() => { setSelected(null); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {!selected && results.length > 0 && (
              <div style={{ borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                {results.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelected(c); setQuery(c.name) }}
                    style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
                  >
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#33302A', fontFamily: 'Nunito, sans-serif' }}>{c.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280', fontFamily: 'Nunito, sans-serif' }}>{c.city}</p>
                  </button>
                ))}
              </div>
            )}

            {searching && <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>Buscando...</p>}

            <button onClick={() => setShowNewCenter(true)} style={{ ...BTN_SECONDARY, height: '44px', fontSize: '14px' }}>
              + Añadir centro nuevo
            </button>
          </>
        )}

        {showNewCenter && (
          <div>
            <Label>Nombre del centro</Label>
            <FocusInput placeholder="Nombre del centro" value={newCenterName} onChange={setNewCenterName} autoFocus />
            <button onClick={() => setShowNewCenter(false)} style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
              ← Buscar en la lista
            </button>
          </div>
        )}

        <SpinnerBtn loading={saving} label="Empezar" onClick={handleFinish} />
      </div>
    </AuthLayout>
  )
}

// ── Screen: Confirm email ──────────────────────────────────────────────────

function ConfirmEmailScreen({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <AuthLayout onBack={onBack}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
        <CardTitle>Revisa tu email</CardTitle>
        <CardSubtitle>
          Enviamos un enlace de confirmación a <strong>{email}</strong>.
          Haz clic en el enlace y vuelve aquí para iniciar sesión.
        </CardSubtitle>
        <button onClick={onBack} style={{ ...BTN_SECONDARY, height: '44px', fontSize: '14px', marginTop: '8px' }}>
          Iniciar sesión
        </button>
      </div>
    </AuthLayout>
  )
}

// ── Main AuthPage ─────────────────────────────────────────────────────────

export default function AuthPage({ role, onSuccess, onSkip, onBack, startAtLogin = false }: Props) {
  const { user } = useAuth()

  const initialView: AuthView = user
    ? (role === 'therapist' ? 'signup-ther-s2' : 'signup-pat-s2')
    : startAtLogin ? 'login' : 'choose'

  const [view, setView] = useState<AuthView>(initialView)
  const [signupData, setSignupData] = useState<Partial<SignupState>>({})
  const [userId, setUserId] = useState(user?.id ?? '')

  useEffect(() => {
    if (user && userId !== user.id) setUserId(user.id)
  }, [user])

  function handleStep1Done(email: string, password: string, fullName: string, uid: string) {
    setSignupData(prev => ({ ...prev, email, password, fullName }))
    if (!uid) {
      setView('confirm-email')
      return
    }
    setUserId(uid)
    setView(role === 'therapist' ? 'signup-ther-s2' : 'signup-pat-s2')
  }

  function handlePatStep2Done(childName: string, childAge: number, diagnosis: string) {
    setSignupData(prev => ({ ...prev, childName, childAge, diagnosis }))
    setView('signup-pat-s3')
  }

  function handleTherStep2Done(specialty: string, licenseNumber: string, city: string) {
    setSignupData(prev => ({ ...prev, specialty, licenseNumber, city }))
    setView('signup-ther-s3')
  }

  if (view === 'choose') return (
    <ChooseScreen
      role={role}
      onLogin={() => setView('login')}
      onSignup={() => setView('signup-s1')}
      onSkip={onSkip}
      onBack={onBack}
    />
  )

  if (view === 'login') return (
    <LoginScreen role={role} onSuccess={onSuccess} onBack={() => setView('choose')} />
  )

  if (view === 'confirm-email') return (
    <ConfirmEmailScreen email={signupData.email ?? ''} onBack={() => setView('login')} />
  )

  if (view === 'signup-s1') return (
    <SignupStep1
      role={role}
      onContinue={handleStep1Done}
      onBack={() => setView('choose')}
    />
  )

  if (view === 'signup-pat-s2') return (
    <PatientStep2
      onContinue={handlePatStep2Done}
      onBack={() => user ? onBack() : setView('signup-s1')}
    />
  )

  if (view === 'signup-pat-s3') return (
    <PatientStep3
      userId={userId}
      childName={signupData.childName ?? ''}
      childAge={signupData.childAge ?? 6}
      diagnosis={signupData.diagnosis ?? 'Síndrome de Down'}
      onSuccess={onSuccess}
      onBack={() => setView('signup-pat-s2')}
    />
  )

  if (view === 'signup-ther-s2') return (
    <TherapistStep2
      onContinue={handleTherStep2Done}
      onBack={() => user ? onBack() : setView('signup-s1')}
    />
  )

  if (view === 'signup-ther-s3') return (
    <TherapistStep3
      userId={userId}
      specialty={signupData.specialty ?? 'Logopeda'}
      licenseNumber={signupData.licenseNumber ?? ''}
      city={signupData.city ?? ''}
      onSuccess={onSuccess}
      onBack={() => setView('signup-ther-s2')}
    />
  )

  return null
}
