import { type Patient, type PatientStatus } from '../../data/patients'

interface Props {
  patients: Patient[]
  selectedId: string
  onSelect: (id: string) => void
}

const STATUS_DOT: Record<PatientStatus, { color: string; label: string }> = {
  completed: { color: '#22C55E', label: 'Completada hoy' },
  pending:   { color: '#FBBF24', label: 'Pendiente hoy' },
  overdue:   { color: '#F87171', label: 'Sin sesión (+2d)' },
}

export default function PatientList({ patients, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: '1px solid #F1F5F9' }}
      >
        <h2 className="font-semibold text-base m-0" style={{ color: '#0F172A' }}>
          Pacientes
        </h2>
        <p className="text-xs mt-0.5 m-0" style={{ color: '#94A3B8' }}>
          {patients.length} en total
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {patients.map(p => {
          const dot = STATUS_DOT[p.status]
          const isSelected = p.id === selectedId

          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{
                backgroundColor: isSelected ? '#F0F9FF' : 'transparent',
                borderLeft: `3px solid ${isSelected ? '#0EA5E9' : 'transparent'}`,
                border: 'none',
                cursor: 'pointer',
                borderLeftStyle: 'solid',
                borderLeftWidth: '3px',
                borderLeftColor: isSelected ? '#0EA5E9' : 'transparent',
              }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? '#E0F2FE' : '#F8FAFC',
                  fontSize: '20px',
                }}
              >
                {p.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm m-0 truncate"
                  style={{ color: isSelected ? '#0EA5E9' : '#0F172A' }}
                >
                  {p.name}
                </p>
                <p className="text-xs m-0 truncate" style={{ color: '#94A3B8' }}>
                  {p.age} años · {p.condition}
                </p>
              </div>

              {/* Status dot */}
              <div
                className="flex-shrink-0"
                title={dot.label}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: dot.color,
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div
        className="px-4 py-3 flex flex-col gap-1"
        style={{ borderTop: '1px solid #F1F5F9' }}
      >
        {Object.entries(STATUS_DOT).map(([, v]) => (
          <div key={v.label} className="flex items-center gap-2">
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: v.color, flexShrink: 0 }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
