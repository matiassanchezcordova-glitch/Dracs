import { useState } from 'react'

interface Props {
  onComplete: (name: string, age: number) => void
}

const AGES = [3, 4, 5, 6, 7, 8, 9, 10]

const LEVEL_HINT: Record<number, string> = {
  3: 'Nivel 1 · 2 imágenes',
  4: 'Nivel 1 · 2 imágenes',
  5: 'Nivel 2 · 3 imágenes',
  6: 'Nivel 2 · 3 imágenes',
  7: 'Nivel 3 · 4 imágenes',
  8: 'Nivel 3 · 4 imágenes',
  9: 'Nivel 4 · 4 imágenes',
  10: 'Nivel 4 · 4 imágenes',
}

export default function SetupScreen({ onComplete }: Props) {
  const [name, setName] = useState('')
  const [age, setAge] = useState<number | null>(null)
  const [error, setError] = useState('')

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Por favor escribe el nombre del niño')
      return
    }
    if (!age) {
      setError('Por favor selecciona la edad')
      return
    }
    setError('')
    onComplete(trimmed, age)
  }

  const canSubmit = name.trim().length > 0 && age !== null

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-4 py-10 gap-8">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <div style={{ fontSize: '56px', lineHeight: 1 }}>👶</div>
        <h1
          className="font-black m-0"
          style={{ fontSize: '32px', color: '#0F172A', lineHeight: 1.1 }}
        >
          ¡Hola!
        </h1>
        <p className="font-semibold text-base" style={{ color: '#64748B' }}>
          Cuéntame sobre el niño para personalizar los ejercicios
        </p>
      </div>

      {/* Name input */}
      <div className="w-full flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: '#0F172A' }}>
          NOMBRE DEL NIÑO
        </label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="Ej: Sofía"
          autoFocus
          className="w-full px-4 py-3 text-xl font-bold outline-none transition-all"
          style={{
            borderRadius: '16px',
            border: `2.5px solid ${name.trim() ? '#0EA5E9' : '#E2E8F0'}`,
            backgroundColor: '#ffffff',
            color: '#0F172A',
            fontFamily: 'Nunito, sans-serif',
          }}
        />
      </div>

      {/* Age picker */}
      <div className="w-full flex flex-col gap-3">
        <label className="font-black text-sm" style={{ color: '#0F172A' }}>
          EDAD
        </label>
        <div className="grid grid-cols-4 gap-2">
          {AGES.map(a => {
            const selected = age === a
            return (
              <button
                key={a}
                onClick={() => { setAge(a); setError('') }}
                className="flex flex-col items-center justify-center py-2 font-black transition-all active:scale-95"
                style={{
                  borderRadius: '14px',
                  border: `2.5px solid ${selected ? '#0EA5E9' : '#E2E8F0'}`,
                  backgroundColor: selected ? '#0EA5E9' : '#ffffff',
                  color: selected ? '#ffffff' : '#0F172A',
                  cursor: 'pointer',
                  minHeight: '56px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{a}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: selected ? 'rgba(255,255,255,0.8)' : '#94A3B8',
                    fontWeight: 700,
                  }}
                >
                  años
                </span>
              </button>
            )
          })}
        </div>

        {/* Level hint */}
        {age && (
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{ backgroundColor: '#E0F2FE', borderRadius: '12px' }}
          >
            <span>⭐</span>
            <span className="font-bold text-sm" style={{ color: '#0369A1' }}>
              {LEVEL_HINT[age]}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="font-semibold text-sm text-center" style={{ color: '#F87171' }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 font-black text-xl text-white transition-all active:scale-95"
        style={{
          borderRadius: '20px',
          backgroundColor: canSubmit ? '#0EA5E9' : '#CBD5E1',
          border: 'none',
          cursor: canSubmit ? 'pointer' : 'default',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        ¡Empezar! 🚀
      </button>
    </div>
  )
}
