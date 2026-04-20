import { useState } from 'react'
import { Search } from 'lucide-react'
import { type Patient, type PatientStatus } from '../../data/patients'

interface Props {
  patients: Patient[]
  selectedId: string
  onSelect: (id: string) => void
}

const STATUS_DOT: Record<PatientStatus, { color: string; halo: string; label: string }> = {
  completed: { color: '#22C55E', halo: 'rgba(34,197,94,0.28)',   label: 'Completada hoy' },
  pending:   { color: '#FFD93D', halo: 'rgba(255,217,61,0.28)',  label: 'Pendiente hoy' },
  overdue:   { color: '#F87171', halo: 'rgba(248,113,113,0.28)', label: 'Sin sesión (+2d)' },
}

// ── Initials avatar ────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#0891A0', '#0B7285', '#1D4ED8', '#7C3AED', '#BE185D', '#B45309', '#15803D', '#9D174D']

function nameColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function PatientList({ patients, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : patients

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Nunito, sans-serif' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff', fontFamily: 'Nunito, sans-serif' }}>
            Pacientes
          </h2>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>
            {patients.length} en total
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.5)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '7px 10px 7px 30px',
              borderRadius: '10px',
              border: '1.5px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              fontSize: '12px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              color: '#ffffff',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
          />
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '4px', paddingBottom: '4px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'Nunito, sans-serif' }}>
            Sin resultados
          </div>
        )}
        {filtered.map(p => {
          const dot = STATUS_DOT[p.status]
          const isSelected = p.id === selectedId

          return (
            <PatientRow
              key={p.id}
              patient={p}
              dot={dot}
              isSelected={isSelected}
              onSelect={() => onSelect(p.id)}
            />
          )
        })}
      </div>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {Object.values(STATUS_DOT).map(v => (
          <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: v.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontFamily: 'Nunito, sans-serif' }}>
              {v.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Individual row ────────────────────────────────────────────────────────

function PatientRow({
  patient: p,
  dot,
  isSelected,
  onSelect,
}: {
  patient: Patient
  dot: { color: string; halo: string; label: string }
  isSelected: boolean
  onSelect: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const bg = nameColor(p.name)
  const inits = initials(p.name)

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
          ? 'rgba(255,255,255,0.18)'
          : hovered
            ? 'rgba(255,255,255,0.08)'
            : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
      }}
    >
      {/* Initials avatar */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'Nunito, sans-serif',
          flexShrink: 0,
          letterSpacing: '0.02em',
        }}
      >
        {inits}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p.name}
        </p>
        <p
          style={{
            margin: '1px 0 0',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Nunito, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p.age} años · {p.condition}
        </p>
      </div>

      {/* Status dot */}
      <div
        title={dot.label}
        style={{
          width: '11px',
          height: '11px',
          borderRadius: '50%',
          backgroundColor: dot.color,
          flexShrink: 0,
          boxShadow: isSelected
            ? `0 0 0 4px ${dot.halo}`
            : `0 0 0 3px ${dot.halo}`,
          animation: isSelected ? 'haloPulse 2s ease-in-out infinite' : 'none',
          ['--halo' as string]: dot.halo,
        }}
      />
    </button>
  )
}
