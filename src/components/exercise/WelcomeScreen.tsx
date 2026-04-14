import { type ChildProfile } from '../../hooks/useChildProfile'

interface Props {
  profile: ChildProfile
  onStart: () => void
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Nivel 1 · Principiante',
  2: 'Nivel 2 · Básico',
  3: 'Nivel 3 · Intermedio',
  4: 'Nivel 4 · Avanzado',
}

export default function WelcomeScreen({ profile, onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-10 gap-8">
      {/* Greeting */}
      <div className="text-center flex flex-col gap-2">
        <div style={{ fontSize: '64px', lineHeight: 1 }}>👋</div>
        <h1
          className="font-black m-0"
          style={{ fontSize: '44px', color: '#0F172A', lineHeight: 1.1 }}
        >
          ¡Hola,
          <br />
          <span style={{ color: '#0EA5E9' }}>{profile.name}</span>!
        </h1>
      </div>

      {/* Stats cards */}
      <div className="flex gap-4">
        {/* Streak */}
        <div
          className="flex flex-col items-center gap-1 px-6 py-4"
          style={{ backgroundColor: '#FEF3C7', borderRadius: '20px', minWidth: '110px' }}
        >
          <span style={{ fontSize: '32px', lineHeight: 1 }}>🔥</span>
          <span className="font-black text-3xl" style={{ color: '#D97706', lineHeight: 1 }}>
            {profile.streak}
          </span>
          <span className="font-bold text-xs" style={{ color: '#92400E' }}>
            {profile.streak === 1 ? 'día seguido' : 'días seguidos'}
          </span>
        </div>

        {/* Level */}
        <div
          className="flex flex-col items-center gap-1 px-6 py-4"
          style={{ backgroundColor: '#E0F2FE', borderRadius: '20px', minWidth: '110px' }}
        >
          <span style={{ fontSize: '32px', lineHeight: 1 }}>⭐</span>
          <span className="font-black text-3xl" style={{ color: '#0EA5E9', lineHeight: 1 }}>
            {profile.level}
          </span>
          <span className="font-bold text-xs" style={{ color: '#0369A1' }}>
            nivel actual
          </span>
        </div>
      </div>

      <p className="font-bold text-base" style={{ color: '#64748B' }}>
        {LEVEL_LABELS[profile.level]}
      </p>

      {/* CTA */}
      <button
        onClick={onStart}
        className="font-black text-2xl text-white px-12 py-5 shadow-md transition-all active:scale-95"
        style={{
          backgroundColor: '#0EA5E9',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        ¡Empezar sesión! 🎯
      </button>
    </div>
  )
}
