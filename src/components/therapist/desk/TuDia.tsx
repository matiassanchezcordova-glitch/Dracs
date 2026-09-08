// "Hoy" — la agenda del día y el detalle de cada sesión.
//
// Cómo funciona:
//   - arriba, una tira de días para moverte por fechas. Al elegir una, se ven
//     las sesiones de ese día;
//   - cada sesión es una fila plegable. Al tocarla se despliega y muestra el
//     detalle del niño y el botón para ir a su carpeta. Tocar el nombre no
//     navega: despliega;
//   - la videollamada funciona: eliges día y hora, ves lo que ya tienes ese día
//     para no pisarlo, y la convocatoria se guarda en el navegador.
//
// Un dato, un lugar: la fila da hora, nombre y un punto de color con el estado.
// La frase de estado vive en la tarjeta de Pacientes, y el detalle, aquí dentro.
// Ninguna línea sin dato detrás se dibuja.

import { useEffect, useMemo, useState } from 'react'
import {
  CalendarBlank, CaretDown, Clock, Target, MapPin, VideoCamera, FolderOpen,
  PaperPlaneTilt, Check,
} from '@phosphor-icons/react'
import type { Patient } from '../../../data/patients'
import { localAreas, localPlaces } from '../../../data/demoAreas'
import { DT } from './deskTokens'
import { deskStatus, type StatusTone } from './patientStatus'
import { loadChildFocus, EMPTY_FOCUS, type ChildFocus } from './childFocus'
import { citasDe, loadVideollamadas, saveVideollamada, type Videollamada } from './agenda'

const TONE_COLOR: Record<StatusTone, string> = {
  played: DT.azul,
  attention: DT.mostaza,
  idle: DT.topo,
}

const DAY_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const CSS = `
@keyframes tdIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.td-in   { animation: tdIn 0.2s ease-out both; }
.td-row  { transition: background 0.15s ease; }
.td-btn:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
.td-strip { overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
.td-strip::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .td-in { animation: none !important; }
  .td-row { transition: none !important; }
}
`

function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function longDay(day: string): string {
  const d = parseDay(day)
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

// Lista en prosa: "el mar", "el mar y la playa".
function joinPlaces(places: string[]): string {
  if (places.length <= 1) return places[0] ?? ''
  return `${places.slice(0, -1).join(', ')} y ${places[places.length - 1]}`
}

// Enfoque del niño (áreas y énfasis fijado). Sin dato, vacío, y las líneas que
// dependen de él no se dibujan.
function useFocus(isReal: boolean, childId: string | null): ChildFocus {
  const [res, setRes] = useState<{ key: string; data: ChildFocus } | null>(null)

  useEffect(() => {
    if (!childId) return
    let cancelled = false
    loadChildFocus(isReal, childId).then(focus => {
      if (!cancelled) setRes({ key: childId, data: focus })
    })
    return () => { cancelled = true }
  }, [isReal, childId])

  if (!childId) return EMPTY_FOCUS
  return res && res.key === childId ? res.data : EMPTY_FOCUS
}

function BriefRow({ mark, children, first }: {
  mark: React.ReactNode
  children: React.ReactNode
  first?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: first ? '0 0 11px' : '11px 0',
      borderTop: first ? 'none' : `1px solid ${DT.line}`,
    }}>
      <span style={{
        width: '20px', flexShrink: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: DT.topo,
      }}>
        {mark}
      </span>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, lineHeight: 1.5, color: DT.ink, fontFamily: DT.body }}>
        {children}
      </span>
    </div>
  )
}

// ── El detalle de una sesión desplegada ──────────────────────────────────────
// Lo que la fila no cuenta: cuándo jugó por última vez, por dónde se movió y
// qué tienes fijado. Todo derivado de sus partidas.
function Detalle({ patient, isReal, onOpenCarpeta }: {
  patient: Patient
  isReal: boolean
  onOpenCarpeta: () => void
}) {
  const name = firstName(patient.name)
  const focus = useFocus(isReal, patient.id)

  const areas = localAreas(patient.history ?? [])
  const places = localPlaces(patient.history ?? [])
  const pinned = focus.emphasis.length
  const last = patient.recentSessions[0] ?? null

  const hasAnyPlay = (patient.totalSessions ?? 0) > 0 || !!patient.lastPlayedISO
  const noNews = hasAnyPlay && patient.metrics.sessionsThisWeek === 0

  const rows: { key: string; mark: React.ReactNode; content: React.ReactNode }[] = []

  if (last) {
    rows.push({
      key: 'last',
      mark: <Clock size={15} weight="regular" />,
      content: (
        <>
          Última vez que jugó: {last.date}, {last.exercises} {last.exercises === 1 ? 'juego' : 'juegos'}
          {last.duration > 0 ? ` en ${last.duration} minutos` : ''}.
        </>
      ),
    })
  }
  if (places.length > 0) {
    rows.push({
      key: 'places',
      mark: <MapPin size={15} weight="regular" />,
      content: <>Se movió sobre todo por {joinPlaces(places)}.</>,
    })
  }
  if (areas[0]) {
    rows.push({
      key: 'area',
      mark: <Target size={15} weight="regular" />,
      content: <>Lo que más jugó: {areas[0].label} ({areas[0].pct}%).</>,
    })
  }
  if (pinned > 0) {
    rows.push({
      key: 'pinned',
      mark: <Target size={15} weight="regular" />,
      content: <>Tienes {pinned} {pinned === 1 ? 'juego fijado' : 'juegos fijados'} en su énfasis.</>,
    })
  }

  return (
    <div className="td-in" style={{
      margin: '4px 0 10px', padding: '14px 16px',
      borderRadius: '16px', background: DT.cream, border: `1px solid ${DT.line}`,
    }}>
      {rows.length === 0 ? (
        <p style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, lineHeight: 1.6, color: DT.ink, fontFamily: DT.body }}>
          {hasAnyPlay
            ? 'Sin novedades de casa esta semana.'
            : `Todavía no hay partidas de ${name} en casa.`}
        </p>
      ) : (
        <div style={{ marginBottom: '14px' }}>
          {rows.map((r, i) => (
            <BriefRow key={r.key} first={i === 0} mark={r.mark}>{r.content}</BriefRow>
          ))}
          {noNews && (
            <BriefRow mark={<Clock size={15} weight="regular" />}>
              Sin novedades de casa esta semana.
            </BriefRow>
          )}
        </div>
      )}

      <button
        type="button"
        className="td-btn"
        onClick={onOpenCarpeta}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          height: '38px', padding: '0 15px', borderRadius: '13px',
          border: 'none', background: DT.yellow, color: DT.ink,
          fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display, cursor: 'pointer',
        }}
      >
        <FolderOpen size={15} weight="regular" /> Ir a la carpeta de {name}
      </button>
    </div>
  )
}

// ── Videollamada: día, hora y lo que ya tienes ese día ───────────────────────
function ProponerVideollamada({ patients, citasDeDia, onSaved }: {
  patients: Patient[]
  citasDeDia: (day: string) => { time: string; label: string }[]
  onSaved: (call: Videollamada) => void
}) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(localIso(new Date()))
  const [time, setTime] = useState('17:00')
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '')
  const [sent, setSent] = useState(false)

  const ocupado = citasDeDia(day)
  const patient = patients.find(p => p.id === patientId) ?? patients[0]

  function enviar() {
    if (!patient) return
    const call: Videollamada = {
      id: `${day}-${time}-${patient.id}`,
      day, time, patientId: patient.id, patientName: patient.name,
    }
    onSaved(call)
    setSent(true)
  }

  const field: React.CSSProperties = {
    height: '40px', padding: '0 12px', borderRadius: DT.radiusSm,
    border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
    fontSize: '14px', fontFamily: DT.body, outline: 'none',
  }

  if (!open) {
    return (
      <button
        type="button"
        className="td-btn"
        onClick={() => { setOpen(true); setSent(false) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          height: '38px', padding: '0 15px', borderRadius: '13px',
          border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink,
          fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display, cursor: 'pointer',
        }}
      >
        <VideoCamera size={15} weight="regular" /> Proponer videollamada
      </button>
    )
  }

  return (
    <div className="td-in" style={{
      padding: '16px', borderRadius: '16px', background: DT.cream, border: `1px solid ${DT.line}`,
    }}>
      {sent ? (
        <div>
          <p style={{
            margin: 0, display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '15px', fontWeight: 700, color: DT.ink, fontFamily: DT.display,
          }}>
            <Check size={17} weight="regular" color={DT.azul} /> Convocatoria enviada
          </p>
          <p style={{ margin: '6px 0 12px', fontSize: '13.5px', color: DT.muted, fontFamily: DT.body }}>
            {longDay(day)} a las {time}, con la familia de {firstName(patient?.name ?? '')}.
          </p>
          <button
            type="button"
            className="td-btn"
            onClick={() => { setOpen(false); setSent(false) }}
            style={{
              height: '36px', padding: '0 14px', borderRadius: '13px',
              border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
              fontSize: '13px', fontWeight: 700, fontFamily: DT.body, cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      ) : (
        <>
          <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>
            Proponer videollamada
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: DT.muted, fontFamily: DT.body }}>Día</span>
              <input type="date" value={day} onChange={e => setDay(e.target.value)} style={field} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: DT.muted, fontFamily: DT.body }}>Hora</span>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={field} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px', flex: 1 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: DT.muted, fontFamily: DT.body }}>Familia</span>
              <select value={patientId} onChange={e => setPatientId(e.target.value)} style={field}>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          </div>

          {/* Lo que ya hay ese día, para no pisarlo. */}
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
            {ocupado.length === 0
              ? `El ${longDay(day)} lo tienes libre.`
              : `El ${longDay(day)} ya tienes: ${ocupado.map(c => `${c.time} ${c.label}`).join(', ')}.`}
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="td-btn"
              onClick={enviar}
              disabled={!patient}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                height: '38px', padding: '0 15px', borderRadius: '13px',
                border: 'none', background: DT.yellow, color: DT.ink,
                fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display,
                cursor: patient ? 'pointer' : 'default', opacity: patient ? 1 : 0.5,
              }}
            >
              <PaperPlaneTilt size={15} weight="regular" /> Enviar convocatoria
            </button>
            <button
              type="button"
              className="td-btn"
              onClick={() => setOpen(false)}
              style={{
                height: '38px', padding: '0 14px', borderRadius: '13px',
                border: `1px solid ${DT.line}`, background: DT.white, color: DT.muted,
                fontSize: '13px', fontWeight: 700, fontFamily: DT.body, cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

interface Props {
  patients: Patient[]
  isDemo: boolean
  onOpen: (id: string) => void
}

export default function TuDia({ patients, isDemo, onOpen }: Props) {
  const today = localIso(new Date())
  const [day, setDay] = useState(today)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [calls, setCalls] = useState<Videollamada[]>(() => loadVideollamadas())

  const patientIds = useMemo(() => patients.map(p => p.id), [patients])

  // Tira de días: una semana atrás y dos por delante, con hoy en medio.
  const strip = useMemo(() => {
    const base = new Date()
    return Array.from({ length: 22 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i - 7)
      const iso = localIso(d)
      return {
        iso,
        initial: DAY_NAMES[d.getDay()],
        number: d.getDate(),
        busy: isDemo && citasDe(iso, patientIds).length > 0,
      }
    })
  }, [isDemo, patientIds])

  // Sesiones del día elegido, más las videollamadas ya convocadas.
  const sesiones = useMemo(() => {
    if (!isDemo) return []
    return citasDe(day, patientIds)
      .map(c => ({ ...c, patient: patients.find(p => p.id === c.patientId) }))
      .filter((c): c is typeof c & { patient: Patient } => !!c.patient)
  }, [isDemo, day, patientIds, patients])

  const llamadasDelDia = calls.filter(c => c.day === day)

  // Lo que ocupa un día, para el selector de videollamada.
  const ocupadoDe = (d: string) => [
    ...(isDemo ? citasDe(d, patientIds) : []).map(c => ({
      time: c.time,
      label: firstName(patients.find(p => p.id === c.patientId)?.name ?? ''),
    })),
    ...calls.filter(c => c.day === d).map(c => ({ time: c.time, label: `videollamada con ${firstName(c.patientName)}` })),
  ].sort((a, b) => (a.time < b.time ? -1 : 1))

  return (
    <section
      aria-label="Hoy, la agenda del día"
      style={{
        position: 'relative', padding: '18px 20px 20px',
        background: DT.white, border: `1px solid ${DT.line}`, borderRadius: '20px',
        boxShadow: DT.shadow, overflow: 'hidden', fontFamily: DT.body,
      }}
    >
      <style>{CSS}</style>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: `linear-gradient(180deg, ${DT.azul} 0%, ${DT.azulTint} 100%)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <CalendarBlank size={19} weight="regular" color={DT.azulInk} style={{ flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: DT.ink, fontFamily: DT.display }}>
          Agenda
        </h2>
        <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 700, color: DT.muted, fontFamily: DT.body }}>
          {longDay(day)}
        </span>
      </div>

      {/* Tira de días */}
      <div className="td-strip" style={{ display: 'flex', gap: '6px', paddingBottom: '4px', marginBottom: '14px' }}>
        {strip.map(d => {
          const active = d.iso === day
          return (
            <button
              key={d.iso}
              type="button"
              className="td-btn"
              onClick={() => { setDay(d.iso); setExpanded(null) }}
              aria-pressed={active}
              aria-label={longDay(d.iso)}
              style={{
                flexShrink: 0, width: '46px', padding: '7px 0', borderRadius: '13px',
                border: `1px solid ${active ? DT.azul : DT.line}`,
                background: active ? DT.azul : d.iso === today ? DT.azulTint : DT.cream,
                color: active ? DT.cream : DT.ink,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}
            >
              <span style={{ fontSize: '10.5px', fontWeight: 700, opacity: 0.8, fontFamily: DT.body }}>{d.initial}</span>
              <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums' }}>
                {d.number}
              </span>
              <span aria-hidden style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: d.busy ? (active ? DT.cream : DT.azul) : 'transparent',
              }} />
            </button>
          )
        })}
      </div>

      {/* Sesiones del día, plegables */}
      {!isDemo ? (
        <p style={{
          margin: '0 0 16px', padding: '11px 13px', borderRadius: '13px',
          background: DT.cream, border: `1px solid ${DT.line}`,
          fontSize: '13px', fontWeight: 600, lineHeight: 1.55, color: DT.muted, fontFamily: DT.body,
        }}>
          Dracs leerá tu calendario para poner cada briefing antes de su cita. No
          toca tus citas: solo añade las videollamadas que tú crees.
        </p>
      ) : sesiones.length === 0 && llamadasDelDia.length === 0 ? (
        <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: DT.muted, fontFamily: DT.body }}>
          Ese día no tienes sesiones.
        </p>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {sesiones.map(s => {
            const st = deskStatus({
              sessionsThisWeek: s.patient.metrics.sessionsThisWeek,
              lastPlayedISO: s.patient.lastPlayedISO,
              totalSessions: s.patient.totalSessions,
            })
            const isOpen = expanded === s.patient.id
            return (
              <div key={`${s.time}-${s.patient.id}`}>
                <button
                  type="button"
                  className="td-btn td-row"
                  onClick={() => setExpanded(isOpen ? null : s.patient.id)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '13px',
                    border: 'none', background: isOpen ? DT.cream : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = DT.cream }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{
                    flexShrink: 0, fontSize: '14px', fontWeight: 800, color: DT.azulInk,
                    fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.time}
                  </span>
                  <span aria-hidden style={{
                    width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
                    background: TONE_COLOR[st.tone],
                  }} />
                  <span style={{
                    flex: 1, minWidth: 0, fontSize: '14.5px', fontWeight: 700, color: DT.ink,
                    fontFamily: DT.display, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {s.patient.name}
                  </span>
                  <CaretDown
                    size={16}
                    weight="regular"
                    color={DT.muted}
                    style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }}
                  />
                </button>
                {isOpen && (
                  <Detalle
                    patient={s.patient}
                    isReal={!isDemo}
                    onOpenCarpeta={() => onOpen(s.patient.id)}
                  />
                )}
              </div>
            )
          })}

          {/* Videollamadas convocadas ese día */}
          {llamadasDelDia.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '13px', background: DT.azulTint,
              border: `1px solid ${DT.azulTintLine}`, marginTop: '6px',
            }}>
              <span style={{
                flexShrink: 0, fontSize: '14px', fontWeight: 800, color: DT.azulInk,
                fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
              }}>
                {c.time}
              </span>
              <VideoCamera size={16} weight="regular" color={DT.azulInk} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
                Videollamada con la familia de {firstName(c.patientName)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ paddingTop: '14px', borderTop: `1px solid ${DT.line}` }}>
        <ProponerVideollamada
          patients={patients}
          citasDeDia={ocupadoDe}
          onSaved={call => { setCalls(saveVideollamada(call)); setDay(call.day) }}
        />
      </div>
    </section>
  )
}
