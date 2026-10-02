// El Escritorio — la superficie de aterrizaje del terapeuta (§Phase 2).
// Cada paciente es una carpeta a mano: nombre, avatar y una línea de estado
// humana desde datos reales. Se toca y se abre la carpeta.
//
// La tarjeta no repite un dato dos veces: el estado se dice UNA vez, con
// palabras, y el único color que entra es el filo del tono. Sin nada detrás del
// nombre, que ahí sólo estorba.

import { useRef, useState } from 'react'
import {
  MagnifyingGlass, Bell, Check, X, CaretRight, CheckCircle, Clock, MoonStars,
  CalendarBlank, UsersThree, Target,
} from '@phosphor-icons/react'
import { type Patient } from '../../../data/patients'
import type { LinkRequestWithPatient } from '../../../lib/types'
import { ACCENT, DT, type Accent } from './deskTokens'
import { Avatar, Button, EmptyState } from './deskUI'
import { BRAND } from '../../../lib/brand'
import { deskStatus, type StatusTone } from './patientStatus'
import TuDia from './TuDia'
import ModuleTabs, { type ModuleDef } from './ModuleTabs'
import { useScrollTop } from './useScrollTop'

interface Props {
  patients: Patient[]
  module: string
  onModule: (id: string) => void
  onOpen: (id: string) => void
  linkRequests: LinkRequestWithPatient[]
  onAccept: (req: LinkRequestWithPatient) => Promise<void>
  onReject: (req: LinkRequestWithPatient) => Promise<void>
  loading: boolean
  isDemo: boolean
  therapistName: string
}

// El tono del estado entra UNA vez por tarjeta: el filo de la izquierda y el
// ícono de la línea de estado. El avatar no lo repite.
const TONE: Record<StatusTone, { accent: Accent; Icon: typeof CheckCircle }> = {
  played: { accent: 'azul', Icon: CheckCircle },
  attention: { accent: 'mostaza', Icon: Clock },
  idle: { accent: 'arena', Icon: MoonStars },
}

// Los dos módulos del escritorio. Cada dato vive en uno solo: qué sesión hay y
// qué día en la Agenda, la línea de estado en la tarjeta de Pacientes, y cómo
// le fue a cada niño dentro de su Carpeta. El nombre del módulo es el título de
// su panel: no se repite dentro.
const MODULES: ModuleDef[] = [
  { id: 'agenda', label: 'Agenda', Icon: CalendarBlank },
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
      display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px',
      background: DT.white, border: `1px solid ${DT.line}`, borderLeft: `3px solid ${DT.mostaza}`,
      borderRadius: DT.radiusSm, flexWrap: 'wrap', boxShadow: DT.shadowSoft,
    }}>
      <Bell size={20} weight="regular" color={DT.mostazaInk} aria-hidden style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: DT.ink, fontFamily: DT.display }}>
          {p.child_name} ({p.child_age} años)
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '14.5px', color: DT.muted, fontFamily: DT.body }}>
          quiere vincularse contigo{p.diagnosis ? ` · ${p.diagnosis}` : ''}
        </p>
      </div>
      <Button size="sm" variant="primary" Icon={Check} onClick={() => run(onAccept)} disabled={busy}>Aceptar</Button>
      <Button size="sm" Icon={X} onClick={() => run(onReject)} disabled={busy}>Rechazar</Button>
    </div>
  )
}

function CarpetaCard({ p, onOpen }: { p: Patient; onOpen: () => void }) {
  const [hover, setHover] = useState(false)
  const st = deskStatus({ sessionsThisWeek: p.metrics.sessionsThisWeek, lastPlayedISO: p.lastPlayedISO, totalSessions: p.totalSessions })
  const tone = TONE[st.tone]
  const a = ACCENT[tone.accent]

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="dk-lift dk-focus"
      style={{
        position: 'relative', overflow: 'hidden',
        textAlign: 'left', cursor: 'pointer', width: '100%',
        // Altura completa: la grilla estira y todas las filas quedan a la par.
        height: '100%', boxSizing: 'border-box',
        background: DT.white, border: `1px solid ${hover ? a.line : DT.line}`, borderRadius: DT.radius,
        // Acento de estado: un filo fino a la izquierda con el color que ya usa
        // la línea de estado (azul/mostaza/arena). Da vida a la grilla sin
        // romper lo clínico: es un dato más, no decoración.
        borderLeft: `3px solid ${a.solid}`,
        padding: '20px', boxShadow: hover ? DT.shadowLift : DT.shadow,
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar name={p.name} size={44} />
        <span style={{ minWidth: 0, flex: 1, display: 'block' }}>
          <span style={{
            display: 'block', fontSize: '20px', fontWeight: 600, color: DT.ink, fontFamily: DT.serif, lineHeight: 1.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.name}
          </span>
          <span style={{
            display: 'block', marginTop: '3px', fontSize: '14.5px', color: DT.muted, fontFamily: DT.body,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.age} años{p.condition ? ` · ${p.condition}` : ''}
          </span>
        </span>
        <CaretRight size={16} weight="regular" color={hover ? a.ink : DT.faint} style={{ flexShrink: 0 }} />
      </div>

      {/* El estado, una vez y con palabras. El color va en el ícono y en el filo
          de la izquierda, no en un relleno más. */}
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <tone.Icon size={16} weight="regular" color={a.ink} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '14.5px', fontWeight: 500, color: DT.ink, fontFamily: DT.body }}>{st.text}</span>
      </span>

      {/* Objetivo: pegado abajo con margin-top auto, para que quede en la misma
          línea en todas las carpetas de la fila. Sin área no se dibuja. */}
      {p.area && (
        <span style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          marginTop: 'auto', paddingTop: '13px', borderTop: `1px solid ${DT.lineSoft}`,
        }}>
          <Target size={14} weight="regular" color={DT.topo} style={{ flexShrink: 0 }} />
          <span style={{
            minWidth: 0, flex: 1, fontSize: '14.5px', fontWeight: 400, color: DT.muted, fontFamily: DT.body,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.area}
          </span>
        </span>
      )}
    </button>
  )
}

export default function Escritorio({ patients, module, onModule, onOpen, linkRequests, onAccept, onReject, loading, isDemo, therapistName }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const filtered = query.trim() ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : patients
  // El niño de este navegador: el que juega el visitante.
  const liveName = isDemo ? patients[0]?.name ?? null : null

  useScrollTop(module, rootRef)

  return (
    <div ref={rootRef} className="dk-page" style={{ width: '100%', maxWidth: '1040px', margin: '0 auto', fontFamily: DT.body }}>
      {/* Encabezado: título en serif, como las secciones de la web. La marca ya
          está en la barra de arriba; aquí no hace falta otro dragón. */}
      <header style={{ marginBottom: '28px' }}>
        <h1 className="dk-h1" style={{ margin: 0, fontWeight: 600, color: DT.ink, fontFamily: DT.serif, lineHeight: 1.08, letterSpacing: '-0.015em' }}>
          Escritorio
        </h1>
        {/* En la demo no decimos "hola, {nombre}": no hay profesional real. */}
        {isDemo ? (
          <p style={{ margin: '10px 0 0', fontSize: '17px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55, maxWidth: '560px' }}>
            {liveName ? <>Tu agenda y tus pacientes. <span style={{ color: DT.ink, fontWeight: 600 }}>{liveName}</span> es el niño de esta demo.</> : null}
          </p>
        ) : (
          <p style={{ margin: '10px 0 0', fontSize: '17px', color: DT.muted, fontFamily: DT.body }}>
            Hola, {therapistName}.
          </p>
        )}
      </header>

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
      <div style={{ marginBottom: '24px' }}>
        <ModuleTabs modules={MODULES} active={module} onChange={onModule} panelId={panelId} />
      </div>

      {/* Módulo Agenda: qué sesión hay y qué día. */}
      <div
        id={panelId('agenda')}
        role="tabpanel"
        aria-labelledby="tab-agenda"
        hidden={module !== 'agenda'}
      >
        {module === 'agenda' && (
          <div className="dk-rise">
            {loading ? (
              <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando pacientes…</p>
            ) : patients.length === 0 ? (
              <EmptyState Icon={CalendarBlank} title="Todavía no hay agenda" />
            ) : (
              <TuDia patients={patients} isDemo={isDemo} onOpen={onOpen} />
            )}
          </div>
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
          <div className="dk-rise">
            {/* El módulo ya se llama Pacientes: aquí sólo va la búsqueda. */}
            {patients.length > 0 && (
              <div style={{ position: 'relative', width: '300px', maxWidth: '100%', marginBottom: '16px' }}>
                <MagnifyingGlass size={16} weight="regular" color={searchFocus ? DT.azulInk : DT.faint} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar paciente"
                  aria-label="Buscar paciente"
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  className="dk-press"
                  style={{
                    width: '100%', boxSizing: 'border-box', height: '44px', padding: '0 12px 0 38px', borderRadius: '10px',
                    border: `1.5px solid ${searchFocus ? DT.azul : BRAND.lineStrong}`, background: DT.white, color: DT.ink,
                    fontSize: '15px', fontWeight: 400, fontFamily: DT.body, outline: 'none',
                    boxShadow: searchFocus ? '0 0 0 3px rgba(63,107,120,0.2)' : 'none',
                  }}
                />
              </div>
            )}

            {/* Grilla de carpetas */}
            {loading ? (
              <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando pacientes…</p>
            ) : patients.length === 0 ? (
              <EmptyState Icon={UsersThree} title="Sin pacientes aún">
                Las familias te encuentran por tu nombre o tu centro.
              </EmptyState>
            ) : filtered.length === 0 ? (
              <EmptyState Icon={MagnifyingGlass} title={`Nada coincide con “${query}”`} compact />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', alignItems: 'stretch', gap: '16px' }}>
                {filtered.map(p => <CarpetaCard key={p.id} p={p} onOpen={() => onOpen(p.id)} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
