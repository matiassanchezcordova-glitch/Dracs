import { useState } from 'react'
import { Search } from 'lucide-react'
import { type Patient, type PatientStatus } from '../../data/patients'

interface Props {
  patients: Patient[]
  selectedId: string
  onSelect: (id: string) => void
}

const STATUS_DOT: Record<PatientStatus, { color: string; label: string }> = {
  completed: { color: '#059669', label: 'Completada hoy' },
  pending:   { color: '#D97706', label: 'Pendiente hoy' },
  overdue:   { color: '#DC2626', label: 'Sin sesión (+2d)' },
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

export default function PatientList({ patients, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : patients

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Nunito, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff', fontFamily: 'Nunito, sans-serif' }}>
            Pacientes
          </h2>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>
            {patients.length} en total
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.5)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '7px 10px 7px 30px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.15)',
              fontSize: '12px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              color: '#ffffff',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '4px', paddingBottom: '4px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'Nunito, sans-serif' }}>
            Sin resultados
          </div>
        )}
        {filtered.map(p => (
          <PatientRow
            key={p.id}
            patient={p}
            dot={STATUS_DOT[p.status]}
            isSelected={p.id === selectedId}
            onSelect={() => onSelect(p.id)}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {Object.values(STATUS_DOT).map(v => (
          <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: v.color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontFamily: 'Nunito, sans-serif' }}>
              {v.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientRow({
  patient: p,
  dot,
  isSelected,
  onSelect,
}: {
  patient: Patient
  dot: { color: string; label: string }
  isSelected: boolean
  onSelect: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        textAlign: 'left',
        border: 'none',
        borderLeft: `3px solid ${isSelected ? '#ffffff' : 'transparent'}`,
        backgroundColor: isSelected
          ? 'rgba(255,255,255,0.20)'
          : hovered
            ? 'rgba(255,255,255,0.08)'
            : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
      }}
    >
      {/* Uniform teal avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#0BAFBE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 700,
        color: '#ffffff',
        fontFamily: 'Nunito, sans-serif',
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}>
        {initials(p.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: 700,
          color: '#ffffff',
          fontFamily: 'Nunito, sans-serif',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {p.name}
        </p>
        <p style={{
          margin: '1px 0 0',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.65)',
          fontFamily: 'Nunito, sans-serif',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {p.age} años · {p.condition}
        </p>
      </div>

      {/* Status dot — 8px, no halo */}
      <div
        title={dot.label}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dot.color,
          flexShrink: 0,
        }}
      />
    </button>
  )
}
