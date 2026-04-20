import { useState, useMemo } from 'react'
import { Stethoscope } from 'lucide-react'
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
  const patients = useMemo(() => getPatients(), [])
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? '')

  const selected = patients.find(p => p.id === selectedId) ?? patients[0]

  return (
    <div
      style={{
        fontFamily: 'Nunito, sans-serif',
        backgroundColor: 'transparent',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Sub-header ──────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.20)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Therapist identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Stethoscope size={18} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#ffffff', fontFamily: 'Nunito, sans-serif' }}>
              Dra. Martínez
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Nunito, sans-serif' }}>
              Terapeuta del lenguaje
            </p>
          </div>
        </div>

        {/* Date + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              backgroundColor: 'rgba(255,255,255,0.12)',
              padding: '3px 10px',
              borderRadius: '6px',
              textTransform: 'capitalize',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {todayLabel()}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#0BAFBE',
              backgroundColor: '#ffffff',
              padding: '3px 10px',
              borderRadius: '6px',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Panel clínico
          </span>
        </div>
      </header>

      {/* ── Two-column layout ───────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Left: patient list */}
        <div
          style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.15)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <PatientList
            patients={patients}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selected && <PatientDetail patient={selected} />}
        </div>
      </div>
    </div>
  )
}
