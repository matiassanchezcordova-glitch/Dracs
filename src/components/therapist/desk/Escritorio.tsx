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
import { Avatar, DragonWatermark, EmptyState, SectionTitle } from './deskUI'
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

// El tono del estado entra UNA vez por tarjeta: el filo de la izquierda y el
// ícono de la línea de estado. El avatar no lo repite.
const TONE: Record<StatusTone, { accent: Accent; Icon: typeof CheckCircle }> = {
  played: { accent: 'azul', Icon: CheckCircle },
  attention: { accent: 'mostaza', Icon: Clock },
  idle: { accent: 'arena', Icon: MoonStars },
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
      display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px',
      background: DT.white, border: `1px solid ${DT.line}`, borderLeft: `3px solid ${DT.mostaza}`,
      borderRadius: DT.radiusSm, flexWrap: 'wrap', boxShadow: DT.shadowSoft,
    }}>
      <Bell size={20} weight="regular" color={DT.mostazaInk} aria-hidden style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>
          {p.child_name} ({p.child_age} años)
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: DT.muted, fontFamily: DT.body }}>
          quiere vincularse contigo{p.diagnosis ? ` · ${p.diagnosis}` : ''}
        </p>
      </div>
      <button onClick={() => run(onAccept)} disabled={busy} className="dk-press dk-focus" style={{
        display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: DT.radiusSm,
        border: 'none', background: DT.yellow, color: DT.ink, fontSize: '13px', fontWeight: 700, fontFamily: DT.display,
        cursor: 'pointer', opacity: busy ? 0.6 : 1,
        boxShadow: '0 1px 2px rgba(51,48,42,0.10), 0 5px 12px rgba(247,195,28,0.26)',
      }}>
        <Check size={13} weight="regular" /> Aceptar
      </button>
      <button onClick={() => run(onReject)} disabled={busy} className="dk-press dk-focus" style={{
        display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: DT.radiusSm,
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
        padding: '18px', boxShadow: hover ? DT.shadowLift : DT.shadow,
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar name={p.name} size={46} />
        <span style={{ minWidth: 0, flex: 1, display: 'block' }}>
          <span style={{
            display: 'block', fontSize: '16.5px', fontWeight: 700, color: DT.ink, fontFamily: DT.display,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.name}
          </span>
          <span style={{
            display: 'block', marginTop: '1px', fontSize: '12.5px', color: DT.muted, fontFamily: DT.body,
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
        <span style={{ fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>{st.text}</span>
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
            minWidth: 0, flex: 1, fontSize: '12.5px', fontWeight: 700, color: DT.muted, fontFamily: DT.body,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.area}
          </span>
        </span>
      )}
    </button>
  )
}

export default function Escritorio({ patients, onOpen, linkRequests, onAccept, onReject, loading, isDemo, therapistName }: Props) {
  const [module, setModule] = useState('hoy')
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const filtered = query.trim() ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : patients
  // El niño de este navegador: el que juega el visitante.
  const liveName = isDemo ? patients[0]?.name ?? null : null

  useScrollTop(module, rootRef)

  return (
    <div ref={rootRef} style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '28px 20px 48px', fontFamily: DT.body }}>
      {/* Encabezado. La ÚNICA filigrana del dragón en toda la vista, y muy
          transparente: la marca está, pero no se le nota el esfuerzo. */}
      <header style={{ position: 'relative', overflow: 'hidden', marginBottom: '22px', paddingRight: '90px' }}>
        <DragonWatermark size={170} opacity={0.035} top="-40px" right="-26px" rotate={10} />
        <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 600, color: DT.ink, fontFamily: DT.display, lineHeight: 1.15 }}>
          Escritorio
        </h1>
        {/* En el showroom no decimos "hola, {nombre}": no hay terapeuta real. */}
        {isDemo ? (
          <p style={{ margin: '7px 0 0', fontSize: '15px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55, maxWidth: '560px' }}>
            {liveName ? <><strong style={{ color: DT.ink }}>{liveName}</strong> es el niño de esta demo: lo que juegue aparece en su carpeta.</> : null}
          </p>
        ) : (
          <p style={{ margin: '7px 0 0', fontSize: '15px', color: DT.muted, fontFamily: DT.body }}>
            Hola, {therapistName}. {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'} a mano.
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
      <div style={{ marginBottom: '20px' }}>
        <ModuleTabs modules={MODULES} active={module} onChange={setModule} panelId={panelId} />
      </div>

      {/* Módulo Hoy: la agenda de la semana. */}
      <div
        id={panelId('hoy')}
        role="tabpanel"
        aria-labelledby="tab-hoy"
        hidden={module !== 'hoy'}
      >
        {module === 'hoy' && (
          <div className="dk-rise">
            {loading ? (
              <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando pacientes…</p>
            ) : patients.length === 0 ? (
              <EmptyState Icon={CalendarBlank} title="Todavía no hay agenda">
                Cuando tengas pacientes vinculados, sus citas aparecerán aquí.
              </EmptyState>
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
            <SectionTitle
              Icon={UsersThree}
              size="lg"
              right={
                <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
                  <MagnifyingGlass size={16} weight="regular" color={searchFocus ? DT.azulInk : DT.faint} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar paciente…"
                    onFocus={() => setSearchFocus(true)}
                    onBlur={() => setSearchFocus(false)}
                    className="dk-press"
                    style={{
                      width: '100%', boxSizing: 'border-box', height: '42px', padding: '0 12px 0 37px', borderRadius: '999px',
                      border: `1px solid ${searchFocus ? DT.azulTintLine : DT.line}`, background: DT.white, color: DT.ink,
                      fontSize: '14px', fontWeight: 600, fontFamily: DT.body, outline: 'none',
                      boxShadow: searchFocus ? '0 0 0 3px rgba(91,136,150,0.14)' : DT.shadowSoft,
                    }}
                  />
                </div>
              }
            >
              Pacientes
            </SectionTitle>

            {/* Grilla de carpetas */}
            {loading ? (
              <p style={{ margin: '32px 0', textAlign: 'center', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando pacientes…</p>
            ) : patients.length === 0 ? (
              <EmptyState Icon={UsersThree} title="Sin pacientes aún">
                Las familias pueden buscarte por nombre o centro para vincularse. Sus
                solicitudes aparecerán aquí arriba.
              </EmptyState>
            ) : filtered.length === 0 ? (
              <EmptyState Icon={MagnifyingGlass} title="Ninguna carpeta encaja" compact>
                Nada que coincida con “{query}”. Prueba con el nombre de pila.
              </EmptyState>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', alignItems: 'stretch', gap: '14px' }}>
                {filtered.map(p => <CarpetaCard key={p.id} p={p} onOpen={() => onOpen(p.id)} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
