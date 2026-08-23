// El Escritorio — la superficie de aterrizaje del terapeuta (§Phase 2).
// Cada paciente es una carpeta a mano: nombre, avatar y una línea de estado
// humana desde datos reales. Se toca y se abre la carpeta. Sobrio, espacioso,
// sin tabla densa.

import { useState } from 'react'
import { MagnifyingGlass, Bell, Check, X, CaretRight, CheckCircle, Clock, MoonStars } from '@phosphor-icons/react'
import { type Patient } from '../../../data/patients'
import type { LinkRequestWithPatient } from '../../../lib/types'
import AvisoDemo from '../../AvisoDemo'
import { DT } from './deskTokens'
import { Avatar, EjemploTag } from './deskUI'
import { deskStatus, type StatusTone } from './patientStatus'

interface Props {
  patients: Patient[]
  onOpen: (id: string) => void
  linkRequests: LinkRequestWithPatient[]
  onAccept: (req: LinkRequestWithPatient) => Promise<void>
  onReject: (req: LinkRequestWithPatient) => Promise<void>
  loading: boolean
  isDemo: boolean
  therapistName: string
}

const TONE: Record<StatusTone, { color: string; Icon: typeof CheckCircle }> = {
  played:    { color: DT.azul,    Icon: CheckCircle },
  attention: { color: DT.mostaza, Icon: Clock },
  idle:      { color: DT.topo,    Icon: MoonStars },
}

function LinkRequestBanner({ req, onAccept, onReject }: {
  req: LinkRequestWithPatient
  onAccept: (r: LinkRequestWithPatient) => Promise<void>
  onReject: (r: LinkRequestWithPatient) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const p = req.patients
  const run = async (fn: (r: LinkRequestWithPatient) => Promise<void>) => { setBusy(true); await fn(req); setBusy(false) }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
      background: DT.white, border: `1px solid ${DT.line}`, borderLeft: `3px solid ${DT.mostaza}`,
      borderRadius: DT.radiusSm, flexWrap: 'wrap',
    }}>
      <Bell size={18} weight="duotone" color={DT.mostaza} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
          {p.child_name} ({p.child_age} años)
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: DT.muted, fontFamily: DT.body }}>
          quiere vincularse contigo{p.diagnosis ? ` · ${p.diagnosis}` : ''}
        </p>
      </div>
      <button onClick={() => run(onAccept)} disabled={busy} style={{
        display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: DT.radiusSm,
        border: 'none', background: DT.yellow, color: DT.ink, fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
        cursor: 'pointer', opacity: busy ? 0.6 : 1,
      }}>
        <Check size={13} weight="bold" /> Aceptar
      </button>
      <button onClick={() => run(onReject)} disabled={busy} style={{
        display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: DT.radiusSm,
        border: `1px solid ${DT.line}`, background: DT.white, color: DT.muted, fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
        cursor: 'pointer', opacity: busy ? 0.6 : 1,
      }}>
        <X size={13} weight="bold" /> Rechazar
      </button>
    </div>
  )
}

function CarpetaCard({ p, onOpen }: { p: Patient; onOpen: () => void }) {
  const [hover, setHover] = useState(false)
  const st = deskStatus({ sessionsThisWeek: p.metrics.sessionsThisWeek, lastPlayedISO: p.lastPlayedISO, totalSessions: p.totalSessions })
  const tone = TONE[st.tone]
  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left', cursor: 'pointer', width: '100%',
        background: DT.white, border: `1px solid ${DT.line}`, borderRadius: DT.radius,
        // Acento de estado: un filo fino a la izquierda con el color que ya usa
        // la línea de estado (azul/mostaza/topo). Da vida a la grilla sin
        // romper lo clínico — un dato más, no decoración.
        borderLeft: `3px solid ${tone.color}`,
        padding: '18px', boxShadow: hover ? DT.shadow : DT.shadowSoft,
        transform: hover ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 0.16s ease, box-shadow 0.16s ease',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar name={p.name} size={44} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: DT.ink, fontFamily: DT.display, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.name}
          </p>
          <p style={{ margin: '1px 0 0', fontSize: '12px', color: DT.muted, fontFamily: DT.body, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.age} años{p.condition ? ` · ${p.condition}` : ''}
          </p>
        </div>
        <CaretRight size={16} weight="bold" color={DT.faint} style={{ flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <tone.Icon size={16} weight="fill" color={tone.color} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>{st.text}</span>
        {/* Sólo las carpetas ilustrativas llevan el tag. El niño vivo del
            visitante (Pol) no: su línea de estado sale de lo que jugó. */}
        {p.isExample && <span style={{ marginLeft: 'auto' }}><EjemploTag /></span>}
      </div>
    </button>
  )
}

export default function Escritorio({ patients, onOpen, linkRequests, onAccept, onReject, loading, isDemo, therapistName }: Props) {
  const [query, setQuery] = useState('')
  const filtered = query.trim() ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : patients
  // La única carpeta viva del showroom: el niño demo de este navegador.
  const liveName = isDemo ? patients.find(p => !p.isExample)?.name ?? null : null

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '28px 20px 48px', fontFamily: DT.body }}>
      {/* Aviso de bienvenida del showroom — se cierra con la X y no vuelve. */}
      {isDemo && (
        <AvisoDemo id="logopeda">
          En Dracs, cada rol ve solo su sección: la familia no entra al panel clínico
          y el niño solo ve sus juegos. Aquí puedes recorrer las tres para entender
          cómo encajan{liveName ? <>, y <strong style={{ color: DT.ink }}>{liveName}</strong> es el paciente de esta demo: lo que juegues en Juegos aparece en su carpeta</> : null}.
        </AvisoDemo>
      )}

      {/* Encabezado */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>Escritorio</h1>
        </div>
        {/* En el showroom no decimos "hola, {nombre}" (no hay terapeuta real) y
            distinguimos de entrada qué carpeta es viva y cuáles ilustrativas. */}
        {isDemo ? (
          // Corto a propósito: el detalle vive en el aviso de arriba. Esta línea
          // sobrevive a que se cierre el aviso, así que dice lo imprescindible.
          <p style={{ margin: '6px 0 0', fontSize: '15px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
            {liveName ? <><strong style={{ color: DT.ink }}>{liveName}</strong> es el niño de esta demo. </> : null}
            Las carpetas marcadas <EjemploTag /> son ilustrativas.
          </p>
        ) : (
          <p style={{ margin: '6px 0 0', fontSize: '15px', color: DT.muted, fontFamily: DT.body }}>
            Hola, {therapistName}. {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'} a mano.
          </p>
        )}
      </div>

      {/* Solicitudes de vínculo */}
      {linkRequests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {linkRequests.map(req => (
            <LinkRequestBanner key={req.id} req={req} onAccept={onAccept} onReject={onReject} />
          ))}
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '340px' }}>
        <MagnifyingGlass size={16} weight="bold" color={DT.faint} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar paciente…"
          style={{
            width: '100%', boxSizing: 'border-box', height: '44px', padding: '0 12px 0 36px', borderRadius: DT.radiusSm,
            border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink, fontSize: '14px', fontFamily: DT.body, outline: 'none',
          }}
        />
      </div>

      {/* Grilla de carpetas */}
      {loading ? (
        <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando pacientes…</p>
      ) : patients.length === 0 ? (
        <div style={{ margin: '32px auto', maxWidth: '420px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>Sin pacientes aún</p>
          <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
            Las familias pueden buscarte por nombre o centro para vincularse. Sus solicitudes aparecerán aquí arriba.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Sin resultados para “{query}”.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {filtered.map(p => <CarpetaCard key={p.id} p={p} onOpen={() => onOpen(p.id)} />)}
        </div>
      )}
    </div>
  )
}
