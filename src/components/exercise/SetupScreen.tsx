import { useState } from 'react'
import { ArrowRight, Rocket } from 'lucide-react'

interface Props {
  onComplete: (name: string, age: number) => void
}

const AGES = [3, 4, 5, 6, 7, 8, 9, 10]

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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            animation: 'stepFadeIn 0.35s ease',
          }}
        >
          <img
            src="/dragon.nb.png"
            alt=""
            style={{ width: '100px', height: 'auto', animation: 'floatDracs 3s ease-in-out infinite' }}
          />

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 700,
                color: '#1A1A2E',
                fontFamily: '"Playfair Display", serif',
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
                fontFamily: 'Nunito, sans-serif',
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
              color: '#1A1A2E',
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              textAlign: 'center',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          />

          {name.trim() && (
            <button
              onClick={goToStep2}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 36px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: '#FFD93D',
                color: '#0F172A',
                fontSize: '20px',
                fontWeight: 900,
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                animation: 'btnFadeIn 0.25s ease',
                boxShadow: '0 4px 24px rgba(255,217,61,0.45)',
              }}
            >
              ¡Seguir! <ArrowRight size={22} />
            </button>
          )}
        </div>
      )}

      {/* ── Step 2 ─────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            animation: 'stepFadeIn 0.35s ease',
            position: 'relative',
          }}
        >
          <img
            src="/dragon.nb.png"
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              right: '24px',
              width: '80px',
              height: 'auto',
              animation: 'floatDracs 3s ease-in-out infinite',
            }}
          />

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 800,
                color: '#1A1A2E',
                fontFamily: 'Nunito, sans-serif',
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
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              ¿Cuántos años tienes?
            </p>
          </div>

          {/* 2 × 4 age grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: '12px' }}>
            {AGES.map(a => {
              const selected = age === a
              return (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: selected ? '2px solid #FFD93D' : '2px solid #E5E7EB',
                    background: selected ? '#FFD93D' : '#ffffff',
                    color: selected ? '#0F172A' : '#1A1A2E',
                    fontSize: '28px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    transform: selected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'background 0.18s ease, transform 0.18s ease',
                    boxShadow: selected ? '0 4px 20px rgba(255,217,61,0.5)' : '0 1px 4px rgba(0,0,0,0.06)',
                    animation: selected ? 'ageBounce 0.3s ease forwards' : 'none',
                  }}
                >
                  {a}
                </button>
              )
            })}
          </div>

          {age && (
            <button
              onClick={handleStart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 36px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: '#FFD93D',
                color: '#0F172A',
                fontSize: '20px',
                fontWeight: 900,
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                animation: 'btnFadeIn 0.25s ease',
                boxShadow: '0 4px 24px rgba(255,217,61,0.45)',
              }}
            >
              ¡Empezar! <Rocket size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
