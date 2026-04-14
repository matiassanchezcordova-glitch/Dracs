interface Props {
  correct: number
  total: number
  levelChanged: 'up' | 'down' | null
  onRepeat: () => void
  onViewProgress: () => void
}

function getEmoji(pct: number) {
  if (pct === 100) return '🌟'
  if (pct >= 80) return '🎉'
  if (pct >= 60) return '👏'
  return '💪'
}

function getMessage(pct: number) {
  if (pct === 100) return '¡Perfecto!'
  if (pct >= 80) return '¡Excelente!'
  if (pct >= 60) return '¡Muy bien!'
  return '¡Sigue practicando!'
}

export default function SessionEndScreen({
  correct,
  total,
  levelChanged,
  onRepeat,
  onViewProgress,
}: Props) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const emoji = getEmoji(pct)
  const message = getMessage(pct)

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-10 gap-8">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <div style={{ fontSize: '64px', lineHeight: 1 }}>⭐</div>
        <h1
          className="font-black m-0"
          style={{ fontSize: '34px', color: '#0F172A', lineHeight: 1.1 }}
        >
          ¡Sesión completada!
        </h1>
        <p className="font-black text-2xl m-0" style={{ color: '#0EA5E9' }}>
          {message} {emoji}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <StatCard emoji="📚" value={total} label="ejercicios" />
        <StatCard emoji="✅" value={correct} label="aciertos" color="#22C55E" />
        <StatCard emoji="🎯" value={`${pct}%`} label="precisión" color="#0EA5E9" />
      </div>

      {/* Level change notification */}
      {levelChanged && (
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            backgroundColor: levelChanged === 'up' ? '#F0FDF4' : '#FFF7ED',
            borderRadius: '16px',
            border: `2px solid ${levelChanged === 'up' ? '#22C55E' : '#FBBF24'}`,
          }}
        >
          <span style={{ fontSize: '24px' }}>{levelChanged === 'up' ? '🚀' : '📖'}</span>
          <span
            className="font-bold text-sm"
            style={{ color: levelChanged === 'up' ? '#15803D' : '#92400E' }}
          >
            {levelChanged === 'up'
              ? '¡Subiste de nivel en la próxima sesión!'
              : 'Vamos a practicar un poco más en este nivel'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRepeat}
          className="w-full py-4 font-black text-xl text-white transition-all active:scale-95"
          style={{
            backgroundColor: '#0EA5E9',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          ¡Otra sesión! 🔄
        </button>
        <button
          onClick={onViewProgress}
          className="w-full py-4 font-black text-xl transition-all active:scale-95"
          style={{
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          Ver mi progreso 📊
        </button>
      </div>
    </div>
  )
}

function StatCard({
  emoji,
  value,
  label,
  color = '#0F172A',
}: {
  emoji: string
  value: number | string
  label: string
  color?: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-4"
      style={{ backgroundColor: '#F8FAFC', borderRadius: '20px', minWidth: '90px' }}
    >
      <span style={{ fontSize: '28px', lineHeight: 1 }}>{emoji}</span>
      <span className="font-black text-2xl" style={{ color, lineHeight: 1 }}>
        {value}
      </span>
      <span className="font-bold text-xs" style={{ color: '#94A3B8' }}>
        {label}
      </span>
    </div>
  )
}
