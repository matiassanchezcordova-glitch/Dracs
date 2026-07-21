import { useState } from 'react'
import { Rocket } from 'lucide-react'

interface Props {
  onComplete: (name: string, age: number) => void
}

const AGES = [3, 4, 5, 6, 7, 8, 9, 10]

// Marca nueva: dragón nuevo (logo-dracs.png), Fredoka en títulos, Nunito en
// el resto, fondo crema (#FAF5E8) y botón amarillo (#F7C31C).
const TITLE_FONT = 'Fredoka, system-ui, sans-serif'
const BODY_FONT = 'Nunito, sans-serif'

const CTA_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '16px 36px',
  borderRadius: '28px',
  border: 'none',
  background: '#F7C31C',
  color: '#33302A',
  fontSize: '20px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: TITLE_FONT,
  animation: 'btnFadeIn 0.25s ease',
  boxShadow: '0 8px 22px rgba(247,195,28,0.40)',
}

export default function SetupScreen({ onComplete }: Props) {
  const [step, setStep]   = useState<1 | 2>(1)
  const [name, setName]   = useState('')
  const [age, setAge]     = useState<number | null>(null)

  function goToStep2() {
    if (!name.trim()) return
    setStep(2)
  }

  function handleStart() {
    if (!age) return
    onComplete(name.trim(), age)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#FAF5E8',
      }}
    >
      <style>{`
        @keyframes floatDracs {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes btnFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ageBounce {
          0%  { transform: scale(0.9); }
          60% { transform: scale(1.15); }
          100%{ transform: scale(1.1); }
        }
        #dracs-name-input::placeholder { color: rgba(148,163,184,0.8); }
      `}</style>

      {/* ── Step 1 ─────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            padding: '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            animation: 'stepFadeIn 0.35s ease',
          }}
        >
          <img
            src="/logo-dracs.png"
            alt=""
            style={{ width: '108px', height: 'auto', animation: 'floatDracs 3s ease-in-out infinite', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.10))' }}
          />

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 600,
                color: '#33302A',
                fontFamily: TITLE_FONT,
              }}
            >
              ¡Hola! Soy Dracs
            </h1>
            <p
              style={{
                margin: '10px 0 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#6B7280',
                fontFamily: BODY_FONT,
              }}
            >
              ¿Cómo te llamas?
            </p>
          </div>

          <input
            id="dracs-name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && goToStep2()}
            placeholder="Escribe tu nombre..."
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              height: '64px',
              borderRadius: '16px',
              border: '1.5px solid #E5E7EB',
              background: '#ffffff',
              color: '#33302A',
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: BODY_FONT,
              textAlign: 'center',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#5B8896' }}
            onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#E5E7EB' }}
          />

          {name.trim() && (
            <button onClick={goToStep2} style={CTA_STYLE}>
              ¡Seguir!
            </button>
          )}
        </div>
      )}

      {/* ── Step 2 ─────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            animation: 'stepFadeIn 0.35s ease',
          }}
        >
          <img
            src="/logo-dracs.png"
            alt=""
            style={{ width: '96px', height: 'auto', animation: 'floatDracs 3s ease-in-out infinite', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.10))' }}
          />

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '30px',
                fontWeight: 600,
                color: '#33302A',
                fontFamily: TITLE_FONT,
              }}
            >
              ¡Hola, {name}!
            </h1>
            <p
              style={{
                margin: '10px 0 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#6B7280',
                fontFamily: BODY_FONT,
              }}
            >
              ¿Cuántos años tienes?
            </p>
          </div>

          {/* 4 × 2 age grid — flexible para móvil */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', width: '100%' }}>
            {AGES.map(a => {
              const selected = age === a
              return (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    border: selected ? '2px solid #F7C31C' : '2px solid #E5E7EB',
                    background: selected ? '#F7C31C' : '#ffffff',
                    color: '#33302A',
                    fontSize: '26px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: BODY_FONT,
                    transform: selected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'background 0.18s ease, transform 0.18s ease',
                    boxShadow: selected ? '0 6px 18px rgba(247,195,28,0.45)' : '0 1px 4px rgba(0,0,0,0.06)',
                    animation: selected ? 'ageBounce 0.3s ease forwards' : 'none',
                  }}
                >
                  {a}
                </button>
              )
            })}
          </div>

          {age && (
            <button onClick={handleStart} style={CTA_STYLE}>
              ¡Empezar! <Rocket size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
