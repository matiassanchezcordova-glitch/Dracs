import { useMemo, useState } from 'react'
import { getPatients } from '../../data/patients'
import PatientList from './PatientList'
import PatientDetail from './PatientDetail'

export default function TherapistTab() {
  const patients = useMemo(() => getPatients(), [])
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? '')

  const selected = patients.find(p => p.id === selectedId) ?? patients[0]

  return (
    <div style={{
      fontFamily: 'Nunito, sans-serif',
      backgroundColor: 'transparent',
      flex: 1,
      overflow: 'hidden',
      minHeight: 0,
      display: 'flex',
    }}>
      {/* Left: patient list */}
      <div style={{
        width: '260px',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.15)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.08)',
      }}>
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
  )
}
