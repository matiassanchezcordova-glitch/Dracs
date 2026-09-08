// El Escritorio — la superficie de aterrizaje del terapeuta (§Phase 2).
// Cada paciente es una carpeta a mano: nombre, avatar y una línea de estado
// humana desde datos reales. Se toca y se abre la carpeta. Sobrio, espacioso,
// sin tabla densa.

import { useRef, useState } from 'react'
import { MagnifyingGlass, Bell, Check, X, CaretRight, CheckCircle, Clock, MoonStars, CalendarBlank, UsersThree } from '@phosphor-icons/react'
import { type Patient } from '../../../data/patients'
import type { LinkRequestWithPatient } from '../../../lib/types'
import { DT } from './deskTokens'
import { Avatar } from './deskUI'
import { deskStatus, type StatusTone } from './patientStatus'
import TuDia from './TuDia'
import ModuleTabs, { type ModuleDef } from './ModuleTabs'
import { useScrollTop } from './useScrollTop'

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

// Los dos módulos del escritorio. Cada dato vive en uno solo: la agenda en
// "Hoy", la línea de estado en la tarjeta de "Pacientes", y toda la profundidad
// del paciente (objetivos, notas, familia) dentro de su Carpeta.
const MODULES: ModuleDef[] = [
  { id: 'hoy', label: 'Hoy', Icon: CalendarBlank },
  { id: 'pacientes', label: 'Pacientes', Icon: UsersThree },
]

const panelId = (id: string) => `desk-panel-${id}`

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
      <Bell size={18} weight="regular" color={DT.mostaza} style={{ flexShrink: 0 }} />
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
        <Check size={13} weight="regular" /> Aceptar
      </button>
      <button onClick={() => run(onReject)} disabled={busy} style={{
        display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: DT.radiusSm,
        border: `1px solid ${DT.line}`, background: DT.cream, color: DT.muted, fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
        cursor: 'pointer', opacity: busy ? 0.6 : 1,
      }}>
        <X size={13} weight="regular" /> Rechazar
      </button>
    </div>
  )
}

function CarpetaCard({ p, onOpen }: { p: Patient; onOpen: () => void }) {
  const [hover, setHover] = useState(false)
  const st = deskStatus({ sessionsThisWeek: p.metrics.sessionsThisWeek, lastPlayedISO: p.lastPlayedISO, totalSessions: p.totalSessions })
  const tone = TONE[st.tone]

  // Seguimiento de la semana: lo hecho sobre lo acordado. El NÚMERO de partidas
  // no se repite aquí, ya lo dice la línea de estado de arriba; esto pone el
  // área que se sigue y cuánto lleva, sin decir lo mismo dos veces.
  const target = Math.max(1, p.metrics.sessionsTarget)
  const pct = Math.min(100, Math.round((p.metrics.sessionsThisWeek / target) * 100))

  // El color de estado entra una sola vez, como variable, y desde ahí lo leen
  // el filo y la barra de objetivo.
  const cardStyle = {
    '--tone': tone.color,
    textAlign: 'left', cursor: 'pointer', width: '100%',
    // Altura completa: la grilla estira y todas las filas quedan a la par.
    height: '100%', boxSizing: 'border-box',
    background: DT.white, border: `1px solid ${DT.line}`, borderRadius: '20px',
    // Acento de estado: un filo fino a la izquierda con el color que ya usa
    // la línea de estado (azul/mostaza/topo). Da vida a la grilla sin
    // romper lo clínico — un dato más, no decoración.
    borderLeft: '3px solid var(--tone)',
    padding: '18px', boxShadow: hover ? DT.shadow : DT.shadowSoft,
    transform: hover ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 0.16s ease, box-shadow 0.16s ease',
    display: 'flex', flexDirection: 'column', gap: '14px',
  } as React.CSSProperties

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={cardStyle}
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
        <CaretRight size={16} weight="regular" color={DT.faint} style={{ flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <tone.Icon size={16} weight="regular" color={tone.color} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>{st.text}</span>
      </div>

      {/* Objetivo: pegado abajo con margin-top auto, para que quede en la misma
          línea en todas las carpetas de la fila. Sin área no se dibuja. */}
      {p.area && (
        <div style={{ marginTop: 'auto', paddingTop: '13px', borderTop: `1px solid ${DT.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{
              fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: DT.faint, fontFamily: DT.body,
            }}>
              Objetivo
            </span>
            <span style={{
              minWidth: 0, fontSize: '12.5px', fontWeight: 700, color: DT.ink, fontFamily: DT.body,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {p.area}
            </span>
          </div>
          {/* La barra es el seguimiento de la semana. El número vive arriba, en
              la línea de estado, así que aquí solo va para quien lee con
              lector de pantalla. */}
          <div
            role="progressbar"
            aria-label="Seguimiento de la semana"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ height: '6px', marginTop: '7px', borderRadius: '999px', background: DT.arena, overflow: 'hidden' }}
          >
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: 'var(--tone)' }} />
          </div>
        </div>
      )}
    </button>
  )
}

export default function Escritorio({ patients, onOpen, linkRequests, onAccept, onReject, loading, isDemo, therapistName }: Props) {
  const [module, setModule] = useState('hoy')
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const filtered = query.trim() ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : patients
  // El niño de este navegador: el que juega el visitante.
  const liveName = isDemo ? patients[0]?.name ?? null : null

  useScrollTop(module, rootRef)

  return (
    <div ref={rootRef} style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '28px 20px 48px', fontFamily: DT.body }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>Escritorio</h1>
        </div>
        {/* En el showroom no decimos "hola, {nombre}": no hay terapeuta real. */}
        {isDemo ? (
          <p style={{ margin: '6px 0 0', fontSize: '15px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
            {liveName ? <><strong style={{ color: DT.ink }}>{liveName}</strong> es el niño de esta demo: lo que juegue aparece en su carpeta.</> : null}
          </p>
        ) : (
          <p style={{ margin: '6px 0 0', fontSize: '15px', color: DT.muted, fontFamily: DT.body }}>
            Hola, {therapistName}. {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'} a mano.
          </p>
        )}
      </div>

      {/* Solicitudes de vínculo: son una bandeja de entrada, no contenido de un
          módulo, así que quedan sobre la barra y no se esconden tras una pestaña. */}
      {linkRequests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {linkRequests.map(req => (
            <LinkRequestBanner key={req.id} req={req} onAccept={onAccept} onReject={onReject} />
          ))}
        </div>
      )}

      {/* Barra de módulos: solo se ve uno a la vez. */}
      <div style={{ marginBottom: '20px' }}>
        <ModuleTabs modules={MODULES} active={module} onChange={setModule} panelId={panelId} />
      </div>

      {/* Módulo Hoy: la agenda del día, con su tira de fechas. */}
      <div
        id={panelId('hoy')}
        role="tabpanel"
        aria-labelledby="tab-hoy"
        hidden={module !== 'hoy'}
      >
        {module === 'hoy' && (
          loading ? (
            <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando pacientes…</p>
          ) : patients.length === 0 ? (
            <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>
              Hoy no tienes sesiones cargadas.
            </p>
          ) : (
            <TuDia patients={patients} isDemo={isDemo} onOpen={onOpen} />
          )
        )}
      </div>

      {/* Módulo Pacientes: el directorio de carpetas. */}
      <div
        id={panelId('pacientes')}
        role="tabpanel"
        aria-labelledby="tab-pacientes"
        hidden={module !== 'pacientes'}
      >
        {module === 'pacientes' && (
          <>
            {/* Búsqueda */}
            <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '340px' }}>
              <MagnifyingGlass size={16} weight="regular" color={DT.faint} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', alignItems: 'stretch', gap: '14px' }}>
                {filtered.map(p => <CarpetaCard key={p.id} p={p} onOpen={() => onOpen(p.id)} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
