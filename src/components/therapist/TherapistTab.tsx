import { useState, useMemo } from 'react'
import { getPatients } from '../../data/patients'
import PatientList from './PatientList'
import PatientDetail from './PatientDetail'

function todayLabel(): string {
  const d = new Date()
  const days = [
    'domingo', 'lunes', 'martes', 'miércoles',
    'jueves', 'viernes', 'sábado',
  ]
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}

export default function TherapistTab() {
  // Build patient list once per mount (reads localStorage at that moment)
  const patients = useMemo(() => getPatients(), [])
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? '')

  const selected = patients.find(p => p.id === selectedId) ?? patients[0]

  return (
    <div
      className="flex flex-col"
      style={{
        fontFamily: 'Poppins, sans-serif',
        backgroundColor: '#ffffff',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* ── Sub-header (below App navbar) ───────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFCFF' }}
      >
        {/* Therapist identity */}
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            👩‍⚕️
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              Dra. Martínez
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>
              Terapeuta del lenguaje
            </p>
          </div>
        </div>

        {/* Date + badge */}
        <div className="flex items-center gap-3">
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#94A3B8',
              backgroundColor: '#F1F5F9',
              padding: '3px 10px',
              borderRadius: '6px',
              textTransform: 'capitalize',
            }}
          >
            {todayLabel()}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#0369A1',
              backgroundColor: '#E0F2FE',
              padding: '3px 10px',
              borderRadius: '6px',
            }}
          >
            Panel clínico
          </span>
        </div>
      </header>

      {/* ── Two-column layout ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left: patient list (~28%) */}
        <div
          style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid #F1F5F9',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PatientList
            patients={patients}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right: detail (~72%) */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selected && <PatientDetail patient={selected} />}
        </div>
      </div>
    </div>
  )
}
