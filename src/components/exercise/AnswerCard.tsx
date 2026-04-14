import { type Option } from '../../data/exercises'

export type CardState = 'idle' | 'shake' | 'attempted' | 'wrong' | 'correct'

interface Props {
  option: Option
  state: CardState
  onTap: () => void
}

export default function AnswerCard({ option, state, onTap }: Props) {
  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isShaking = state === 'shake'

  let borderColor = '#E2E8F0'
  let bgColor = '#ffffff'
  let textColor = '#0F172A'

  if (isCorrect) {
    borderColor = '#22C55E'
    bgColor = '#F0FDF4'
    textColor = '#15803D'
  } else if (isWrong) {
    borderColor = '#F87171'
    bgColor = '#FFF1F2'
    textColor = '#DC2626'
  }

  return (
    <button
      onClick={onTap}
      className={`
        flex flex-col items-center justify-center gap-2 py-5 px-2
        transition-colors duration-150 active:scale-95
        ${isShaking ? 'animate-shake' : ''}
      `}
      style={{
        borderRadius: '20px',
        border: `2.5px solid ${borderColor}`,
        backgroundColor: bgColor,
        cursor: 'pointer',
        minHeight: '120px',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <span style={{ fontSize: '52px', lineHeight: 1, userSelect: 'none' }}>
        {option.emoji}
      </span>
      <span
        className="font-bold text-sm text-center leading-tight"
        style={{ color: textColor }}
      >
        {option.name}
      </span>
    </button>
  )
}
