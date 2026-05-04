import { useEffect, useRef, useState } from 'react'
import { Search, Eye, EyeOff, ArrowLeft, X, Check } from 'lucide-react'
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

interface SignupData {
  email: string
  password: string
  fullName: string
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
  color: '#1A1A2E',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.18s ease',
}

const BTN_PRIMARY: React.CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: '14px',
  border: 'none',
  background: '#0BAFBE',
  color: '#ffffff',
  fontSize: '16px',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'opacity 0.18s ease, transform 0.18s ease',
}

const BTN_SECONDARY: React.CSSProperties = {
  ...BTN_PRIMARY,
  background: '#ffffff',
  border: '1.5px solid #E5E7EB',
  color: '#1A1A2E',
}

// ── Shared sub-components ──────────────────────────────────────────────────

function FocusInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  autoFocus,
  suffix,
}: {
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
  suffix?: React.ReactNode
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
          borderColor: focused ? '#0BAFBE' : '#E5E7EB',
          paddingRight: suffix ? '48px' : '16px',
        }}
      />
      {suffix && (
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          color: '#94A3B8',
          cursor: 'pointer',
        }}>
          {suffix}
        </div>
      )}
    </div>
  )
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? '20px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: i === current ? '#0BAFBE' : '#E5E7EB',
            transition: 'all 0.25s ease',
          }}
        />
      ))}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: '0 0 8px',
      fontFamily: '"Playfair Display", serif',
      fontSize: '26px',
      fontWeight: 700,
      color: '#1A1A2E',
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
      margin: '0 0 28px',
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

// ── Layout ─────────────────────────────────────────────────────────────────

function AuthLayout({
  children,
  onBack,
  showBack = true,
}: {
  children: React.ReactNode
  onBack: () => void
  showBack?: boolean
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px 48px',
      fontFamily: 'Nunito, sans-serif',
      position: 'relative',
    }}>
      {showBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#6B7280',
            fontSize: '14px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            padding: '8px',
          }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      )}

      <div style={{ marginTop: '16px', marginBottom: '8px', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: '20px',
          color: '#0BAFBE',
          letterSpacing: '3px',
        }}>
          DRACS
        </span>
      </div>

      <img
        src="/dragon.nb.png"
        alt="Dracs"
        style={{
          width: '80px',
          height: 'auto',
          animation: 'floatDragon2 3s ease-in-out infinite',
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))',
          marginBottom: '24px',
        }}
      />

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
    </div>
  )
}

// ── Screen: Login ─────────────────────────────────────────────────────────

function LoginScreen({
  onSuccess,
  onSignup,
  onSkip,
  onBack,
}: {
  onSuccess: () => void
  onSignup: () => void
  onSkip: () => void
  onBack: () => void
}) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) { setError('Rellena todos los campos'); return }
    setLoading(true)
    setError(null)
    const { error: err } = await login(email.trim(), password)
    setLoading(false)
    if (err) {
      if (err.includes('Invalid login')) setError('Email o contraseña incorrectos')
      else setError(err)
      return
    }
    onSuccess()
  }

  return (
    <AuthLayout onBack={onBack}>
      <CardTitle>Iniciar sesión</CardTitle>
      <CardSubtitle>Tu progreso te está esperando.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {error && <ErrorMsg msg={error} />}

        <FocusInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          autoFocus
        />
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...BTN_PRIMARY, opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onSignup}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#0BAFBE', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
        >
          ¿No tienes cuenta? Regístrate
        </button>
        <button
          onClick={onSkip}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
        >
          Continuar sin registrarse
        </button>
      </div>
    </AuthLayout>
  )
}

// ── Screen: Choose ────────────────────────────────────────────────────────

function ChooseScreen({
  role,
  onLogin,
  onSignup,
  onSkip,
  onBack,
}: {
  role: Role
  onLogin: () => void
  onSignup: () => void
  onSkip: () => void
  onBack: () => void
}) {
  const roleLabel = role === 'therapist'
    ? 'como logopeda'
    : role === 'family'
      ? 'para la familia'
      : 'para empezar los ejercicios'

  return (
    <AuthLayout onBack={onBack}>
      <CardTitle>Bienvenido a Dracs</CardTitle>
      <CardSubtitle>Crea tu cuenta {roleLabel} o inicia sesión si ya tienes una.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onSignup}
          style={BTN_PRIMARY}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.9')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          Crear cuenta
        </button>
        <button
          onClick={onLogin}
          style={BTN_SECONDARY}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#ffffff')}
        >
          Ya tengo cuenta
        </button>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onSkip}
          style={{ display: 'block', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'center', padding: '4px' }}
        >
          Continuar sin registrarse
        </button>
      </div>
    </AuthLayout>
  )
}

// ── Screen: Signup Step 1 ─────────────────────────────────────────────────

function SignupStep1({
  role,
  onContinue,
  onLogin,
  onBack,
}: {
  role: Role
  onContinue: (email: string, password: string, fullName: string, userId: string) => void
  onLogin: () => void
  onBack: () => void
}) {
  const { signup } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const dbRole = role === 'therapist' ? 'therapist' : role === 'family' ? 'family' : 'patient'

  async function handleContinue() {
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Rellena todos los campos')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError(null)
    const { error: err, userId, needsConfirmation } = await signup(
      email.trim(),
      password,
      dbRole as 'patient' | 'family' | 'therapist',
      fullName.trim(),
    )
    setLoading(false)
    if (err) {
      if (err.includes('already registered') || err.includes('already been registered')) {
        setError('Este email ya tiene una cuenta. Inicia sesión.')
      } else {
        setError(err)
      }
      return
    }
    if (needsConfirmation) {
      onContinue(email, password, fullName, userId ?? '')
      return
    }
    onContinue(email, password, fullName, userId ?? '')
  }

  return (
    <AuthLayout onBack={onBack}>
      <StepDots total={3} current={0} />
      <CardTitle>Crear cuenta</CardTitle>
      <CardSubtitle>
        {role === 'therapist' ? 'Acceso para logopedas' : 'Acceso para familia y niño'}
      </CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {error && <ErrorMsg msg={error} />}

        <FocusInput
          placeholder="Nombre completo"
          value={fullName}
          onChange={setFullName}
          autoFocus
        />
        <FocusInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
        />
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

        <button
          onClick={handleContinue}
          disabled={loading}
          style={{ ...BTN_PRIMARY, opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? 'Creando cuenta...' : 'Continuar →'}
        </button>
      </div>

      <button
        onClick={onLogin}
        style={{ display: 'block', width: '100%', marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'center' }}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </AuthLayout>
  )
}

// ── Screen: Patient Step 2 ────────────────────────────────────────────────

const DIAGNOSES = ['Síndrome de Down', 'TEA', 'Parálisis cerebral', 'Apraxia', 'Otro']

function PatientStep2({
  onContinue,
  onBack,
}: {
  onContinue: (childName: string, childAge: number, diagnosis: string) => void
  onBack: () => void
}) {
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState(0)
  const [diagnosis, setDiagnosis] = useState('Síndrome de Down')
  const [error, setError] = useState<string | null>(null)

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
        {error && <ErrorMsg msg={error} />}

        <div>
          <Label>¿Cómo se llama tu hijo?</Label>
          <FocusInput
            placeholder="Nombre del niño"
            value={childName}
            onChange={setChildName}
            autoFocus
          />
        </div>

        <div>
          <Label>¿Cuántos años tiene?</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[3, 4, 5, 6, 7, 8, 9, 10].map(age => (
              <button
                key={age}
                onClick={() => setChildAge(age)}
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  border: `1.5px solid ${childAge === age ? '#0BAFBE' : '#E5E7EB'}`,
                  background: childAge === age ? '#F0FAFA' : '#ffffff',
                  color: childAge === age ? '#0BAFBE' : '#6B7280',
                  fontSize: '18px',
                  fontWeight: 700,
                  fontFamily: 'Nunito, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
              ...INPUT_STYLE,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              paddingRight: '40px',
            }}
          >
            {DIAGNOSES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <button onClick={handleContinue} style={BTN_PRIMARY}>
          Continuar →
        </button>
      </div>
    </AuthLayout>
  )
}

// ── Screen: Patient Step 3 (therapist search) ─────────────────────────────

function PatientStep3({
  userId, childName, childAge, diagnosis, onSuccess, onBack,
}: {
  userId: string; childName: string; childAge: number; diagnosis: string
  onSuccess: () => void; onBack: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TherapistWithProfile[]>([])
  const [selected, setSelected] = useState<TherapistWithProfile | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        .or(`center_name.ilike.%${query}%,city.ilike.%${query}%`)
        .limit(8)
      setResults((data ?? []) as TherapistWithProfile[])
      setSearching(false)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function handleFinish(therapistToLink: TherapistWithProfile | null) {
    setSaving(true)
    setError(null)

    const { data: pat, error: patErr } = await supabase
      .from('patients')
      .insert({ profile_id: userId, child_name: childName, child_age: childAge, diagnosis })
      .select()
      .single()

    if (patErr || !pat) {
      setSaving(false)
      setError('Error al guardar los datos del niño. Inténtalo de nuevo.')
      return
    }

    if (therapistToLink) {
      await supabase.from('link_requests').insert({
        patient_id: pat.id,
        therapist_id: therapistToLink.profile_id,
      })
      setLinkSent(true)
    }

    setSaving(false)
    onSuccess()
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
        {error && <ErrorMsg msg={error} />}

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            placeholder="Buscar por nombre, centro o ciudad..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
            style={{ ...INPUT_STYLE, paddingLeft: '44px' }}
            onFocus={e => ((e.currentTarget as HTMLInputElement).style.borderColor = '#0BAFBE')}
            onBlur={e => ((e.currentTarget as HTMLInputElement).style.borderColor = '#E5E7EB')}
          />
        </div>

        {selected && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: '#F0FAFA', border: '1.5px solid #0BAFBE' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0BAFBE', fontFamily: 'Nunito, sans-serif' }}>{selected.profiles.full_name}</p>
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
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
              >
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif' }}>{t.profiles.full_name}</p>
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

        <button
          onClick={() => handleFinish(selected)}
          disabled={saving}
          style={{ ...BTN_PRIMARY, opacity: saving ? 0.7 : 1, cursor: saving ? 'default' : 'pointer' }}
        >
          {saving ? 'Guardando...' : selected ? 'Enviar solicitud y empezar' : 'Empezar sin terapeuta'}
        </button>
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

// ── Screen: Therapist Step 2 ──────────────────────────────────────────────

const SPECIALTIES = ['Logopeda', 'Terapeuta ocupacional', 'Neuropsicólogo/a']

function TherapistStep2({
  onContinue, onBack,
}: {
  onContinue: (specialty: string, licenseNumber: string, city: string) => void
  onBack: () => void
}) {
  const [specialty, setSpecialty] = useState('Logopeda')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState<string | null>(null)

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
        {error && <ErrorMsg msg={error} />}

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

// ── Screen: Therapist Step 3 ──────────────────────────────────────────────

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
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase.from('centers').select('*').or(`name.ilike.%${query}%,city.ilike.%${query}%`).limit(8)
      setResults((data ?? []) as Center[])
      setSearching(false)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function handleFinish() {
    const centerName = showNewCenter ? newCenterName.trim() : selected?.name ?? city
    if (!centerName) { setError('Selecciona o añade tu centro de trabajo'); return }
    setSaving(true)
    setError(null)

    if (showNewCenter && newCenterName.trim()) {
      await supabase.from('centers').insert({ name: newCenterName.trim(), city, type: 'other' })
    }

    const { error: therErr } = await supabase.from('therapists').insert({
      profile_id: userId, specialty, license_number: licenseNumber, center_name: centerName, city,
    })

    setSaving(false)
    if (therErr) { setError('Error al guardar los datos. Inténtalo de nuevo.'); return }

    await refreshTherapist()
    onSuccess()
  }

  return (
    <AuthLayout onBack={onBack}>
      <StepDots total={3} current={2} />
      <CardTitle>Centro de trabajo</CardTitle>
      <CardSubtitle>¿En qué centro ejerces? Tus pacientes podrán encontrarte.</CardSubtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <ErrorMsg msg={error} />}

        {!showNewCenter && (
          <>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                placeholder="Buscar tu centro de trabajo..."
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null) }}
                style={{ ...INPUT_STYLE, paddingLeft: '44px' }}
                onFocus={e => ((e.currentTarget as HTMLInputElement).style.borderColor = '#0BAFBE')}
                onBlur={e => ((e.currentTarget as HTMLInputElement).style.borderColor = '#E5E7EB')}
              />
            </div>

            {selected && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: '#F0FAFA', border: '1.5px solid #0BAFBE' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0BAFBE', fontFamily: 'Nunito, sans-serif' }}>{selected.name}</p>
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
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                  >
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif' }}>{c.name}</p>
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

        <button onClick={handleFinish} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.7 : 1, cursor: saving ? 'default' : 'pointer' }}>
          {saving ? 'Guardando...' : 'Empezar'}
        </button>
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
  const [signupData, setSignupData] = useState<Partial<SignupData>>({})
  const [userId, setUserId] = useState<string>(user?.id ?? '')

  useEffect(() => {
    if (user && userId !== user.id) setUserId(user.id)
  }, [user])

  function handleStep1Done(email: string, password: string, fullName: string, uid: string) {
    if (!uid) { setView('confirm-email'); return }
    setUserId(uid)
    setSignupData(prev => ({ ...prev, email, password, fullName }))
    setView(role === 'therapist' ? 'signup-ther-s2' : 'signup-pat-s2')
  }

  function handlePatientStep2Done(childName: string, childAge: number, diagnosis: string) {
    setSignupData(prev => ({ ...prev, childName, childAge, diagnosis }))
    setView('signup-pat-s3')
  }

  function handleTherapistStep2Done(specialty: string, licenseNumber: string, city: string) {
    setSignupData(prev => ({ ...prev, specialty, licenseNumber, city }))
    setView('signup-ther-s3')
  }

  if (view === 'login') {
    return (
      <LoginScreen
        onSuccess={onSuccess}
        onSignup={() => setView('signup-s1')}
        onSkip={onSkip}
        onBack={() => setView('choose')}
      />
    )
  }

  if (view === 'choose') {
    return (
      <ChooseScreen
        role={role}
        onLogin={() => setView('login')}
        onSignup={() => setView('signup-s1')}
        onSkip={onSkip}
        onBack={onBack}
      />
    )
  }

  if (view === 'confirm-email') {
    return <ConfirmEmailScreen email={signupData.email ?? ''} onBack={() => setView('login')} />
  }

  if (view === 'signup-s1') {
    return (
      <SignupStep1
        role={role}
        onContinue={handleStep1Done}
        onLogin={() => setView('login')}
        onBack={() => setView('choose')}
      />
    )
  }

  if (view === 'signup-pat-s2') {
    return (
      <PatientStep2
        onContinue={handlePatientStep2Done}
        onBack={() => user ? onBack() : setView('signup-s1')}
      />
    )
  }

  if (view === 'signup-pat-s3') {
    return (
      <PatientStep3
        userId={userId}
        childName={signupData.childName ?? ''}
        childAge={signupData.childAge ?? 6}
        diagnosis={signupData.diagnosis ?? 'Síndrome de Down'}
        onSuccess={onSuccess}
        onBack={() => setView('signup-pat-s2')}
      />
    )
  }

  if (view === 'signup-ther-s2') {
    return (
      <TherapistStep2
        onContinue={handleTherapistStep2Done}
        onBack={() => user ? onBack() : setView('signup-s1')}
      />
    )
  }

  if (view === 'signup-ther-s3') {
    return (
      <TherapistStep3
        userId={userId}
        specialty={signupData.specialty ?? 'Logopeda'}
        licenseNumber={signupData.licenseNumber ?? ''}
        city={signupData.city ?? ''}
        onSuccess={onSuccess}
        onBack={() => setView('signup-ther-s2')}
      />
    )
  }

  return null
}
