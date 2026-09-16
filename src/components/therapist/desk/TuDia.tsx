// "Hoy" — la agenda del terapeuta, semana a semana.
//
// Cómo funciona:
//   - arriba, el rango de la semana con flechas para ir a la anterior o a la
//     siguiente, y un ícono de calendario para saltar a cualquier fecha. Debajo,
//     los 7 días de esa semana como pastillas, con el día activo resaltado y un
//     punto si tiene sesiones;
//   - cada sesión es una fila plegable. Al tocarla se despliega y muestra el
//     detalle del niño y el botón para ir a su carpeta. Tocar el nombre no
//     navega: despliega;
//   - la videollamada funciona: eliges día y hora, ves la franja del día como
//     UI (no como frase suelta), se avisa si el hueco choca, y la convocatoria
//     se guarda en el navegador.
//
// Un dato, un lugar: la fila da hora, nombre y el aro de color con el estado.
// La frase de estado vive en la tarjeta de Pacientes, y el detalle, aquí dentro.
// Ninguna línea sin dato detrás se dibuja.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarBlank, CaretDown, CaretLeft, CaretRight, Clock, Target, MapPin, VideoCamera,
  FolderOpen, PaperPlaneTilt, Check, Warning, CalendarCheck,
} from '@phosphor-icons/react'
import type { Patient } from '../../../data/patients'
import { localAreas, localPlaces } from '../../../data/demoAreas'
import { ACCENT, DT, type Accent } from './deskTokens'
import { Avatar, EmptyState, FieldLabel, IconBadge, SectionTitle } from './deskUI'
import { deskStatus, type StatusTone } from './patientStatus'
import { loadChildFocus, EMPTY_FOCUS, type ChildFocus } from './childFocus'
import { citasDe, loadVideollamadas, saveVideollamada, type Videollamada } from './agenda'

// El tono del estado y el acento visual son la misma cosa: el aro del avatar,
// el punto del día y el filo de la fila salen todos de aquí.
const TONE_ACCENT: Record<StatusTone, Accent> = {
  played: 'azul',
  attention: 'mostaza',
  idle: 'arena',
}

const DAY_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
// De lunes a domingo, como se dibuja la semana.
const WEEK_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const CSS = `
@keyframes tdIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.td-in   { animation: tdIn 0.2s ease-out both; }
.td-row  { transition: background 0.15s ease, border-color 0.15s ease; }
.td-day  { transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), background 0.16s ease, border-color 0.16s ease, color 0.16s ease; }
.td-day:hover:not([aria-pressed="true"]) { transform: translateY(-2px); }
.td-btn:focus-visible, .td-day:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .td-in { animation: none !important; }
  .td-row, .td-day { transition: none !important; }
  .td-day:hover:not([aria-pressed="true"]) { transform: none; }
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

// El lunes de la semana a la que pertenece un día.
function mondayOf(day: string): Date {
  const d = parseDay(day)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return d
}

function shiftDays(day: string, delta: number): string {
  const d = parseDay(day)
  d.setDate(d.getDate() + delta)
  return localIso(d)
}

// "15 a 21 sep", y con el mes cambiado "29 sep a 5 oct".
function weekLabel(from: string, to: string): string {
  const a = parseDay(from)
  const b = parseDay(to)
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} a ${b.getDate()} ${MONTHS[b.getMonth()]}`
    : `${a.getDate()} ${MONTHS[a.getMonth()]} a ${b.getDate()} ${MONTHS[b.getMonth()]}`
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
      display: 'flex', alignItems: 'center', gap: '11px',
      padding: first ? '0 0 11px' : '11px 0',
      borderTop: first ? 'none' : `1px solid ${DT.lineSoft}`,
    }}>
      <span aria-hidden style={{
        width: '26px', height: '26px', borderRadius: '9px', flexShrink: 0,
        background: DT.azulTint, border: `1px solid ${DT.azulTintLine}`, color: DT.azulInk,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      mark: <Clock size={14} weight="regular" />,
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
      mark: <MapPin size={14} weight="regular" />,
      content: <>Se movió sobre todo por {joinPlaces(places)}.</>,
    })
  }
  if (areas[0]) {
    rows.push({
      key: 'area',
      mark: <Target size={14} weight="regular" />,
      content: <>Lo que más jugó: {areas[0].label} ({areas[0].pct}%).</>,
    })
  }
  if (pinned > 0) {
    rows.push({
      key: 'pinned',
      mark: <Target size={14} weight="regular" />,
      content: <>Tienes {pinned} {pinned === 1 ? 'juego fijado' : 'juegos fijados'} en su énfasis.</>,
    })
  }

  return (
    <div className="td-in" style={{
      position: 'relative', margin: '4px 0 10px', padding: '15px 17px',
      borderRadius: '16px', background: DT.cream, border: `1px solid ${DT.line}`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
    }}>
      {rows.length === 0 ? (
        <div style={{ marginBottom: '12px' }}>
          <EmptyState
            compact
            title={hasAnyPlay ? 'Sin novedades de casa' : `${name} aún no ha jugado en casa`}
          >
            {hasAnyPlay
              ? 'Esta semana no llegó ninguna partida suya. Aparecerá aquí en cuanto juegue.'
              : 'En cuanto abra el mundo y juegue una partida, la verás aquí.'}
          </EmptyState>
        </div>
      ) : (
        <div style={{ marginBottom: '14px' }}>
          {rows.map((r, i) => (
            <BriefRow key={r.key} first={i === 0} mark={r.mark}>{r.content}</BriefRow>
          ))}
          {noNews && (
            <BriefRow mark={<Clock size={14} weight="regular" />}>
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
          boxShadow: '0 1px 2px rgba(51,48,42,0.10), 0 6px 14px rgba(247,195,28,0.28)',
        }}
      >
        <FolderOpen size={15} weight="regular" /> Ir a la carpeta de {name}
      </button>
    </div>
  )
}

// ── La franja de horas de un día ─────────────────────────────────────────────
// Lo que ya hay ese día, dibujado. Un aviso y una franja de agenda tienen fines
// distintos, así que no pueden ir con el mismo formato de texto plano.
interface Ocupado {
  time: string
  label: string
  kind: 'sesion' | 'llamada' | 'nueva'
}

const SLOT_STYLE: Record<Ocupado['kind'], { accent: Accent; dashed: boolean }> = {
  sesion: { accent: 'azul', dashed: false },
  llamada: { accent: 'mostaza', dashed: false },
  nueva: { accent: 'amarillo', dashed: true },
}

function FranjaDelDia({ day, slots, choca }: { day: string; slots: Ocupado[]; choca: boolean }) {
  return (
    <div style={{
      padding: '13px 14px', borderRadius: '15px',
      background: DT.white, border: `1px solid ${DT.line}`, boxShadow: DT.shadowSoft,
    }}>
      <FieldLabel accent="azul" style={{ marginBottom: '9px' }}>
        {longDay(day)}
      </FieldLabel>

      {slots.length === 0 ? (
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: DT.muted, fontFamily: DT.body }}>
          Ese día lo tienes libre.
        </p>
      ) : (
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {slots.map(s => {
            const st = SLOT_STYLE[s.kind]
            const a = ACCENT[st.accent]
            return (
              <span
                key={`${s.time}-${s.kind}-${s.label}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '6px 11px', borderRadius: '11px',
                  background: a.tint,
                  border: `${st.dashed ? '1px dashed' : '1px solid'} ${a.line}`,
                  color: DT.ink, fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body,
                }}
              >
                <span style={{
                  color: a.ink, fontVariantNumeric: 'tabular-nums', fontWeight: 800,
                }}>
                  {s.time}
                </span>
                {s.label}
              </span>
            )
          })}
        </div>
      )}

      {choca && (
        <p style={{
          margin: '11px 0 0', display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 11px', borderRadius: '11px',
          background: DT.mostazaTint, border: `1px solid ${DT.mostazaTintLine}`,
          fontSize: '12.5px', fontWeight: 700, lineHeight: 1.45, color: DT.ink, fontFamily: DT.body,
        }}>
          <Warning size={16} weight="regular" color={DT.mostazaInk} style={{ flexShrink: 0 }} />
          Esa hora ya está ocupada. Puedes enviarla igual o mover el hueco.
        </p>
      )}
    </div>
  )
}

// ── Videollamada: día, hora y la franja de ese día ───────────────────────────
function ProponerVideollamada({ patients, slotsDe, onSaved }: {
  patients: Patient[]
  slotsDe: (day: string) => Ocupado[]
  onSaved: (call: Videollamada) => void
}) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(localIso(new Date()))
  const [time, setTime] = useState('17:00')
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '')
  const [sent, setSent] = useState(false)

  const patient = patients.find(p => p.id === patientId) ?? patients[0]
  const ocupado = slotsDe(day)
  const choca = ocupado.some(o => o.time === time)

  // La franja incluye el hueco elegido, marcado con borde punteado: se ve dónde
  // cae la videollamada entre lo que ya hay.
  const slots: Ocupado[] = [...ocupado, {
    time, kind: 'nueva' as const,
    label: patient ? `videollamada con ${firstName(patient.name)}` : 'videollamada',
  }].sort((a, b) => (a.time < b.time ? -1 : 1))

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
    height: '42px', padding: '0 12px', borderRadius: DT.radiusSm,
    border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
    fontSize: '14px', fontWeight: 600, fontFamily: DT.body, outline: 'none',
  }

  if (!open) {
    return (
      <button
        type="button"
        className="td-btn"
        onClick={() => { setOpen(true); setSent(false) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          height: '40px', padding: '0 16px', borderRadius: '13px',
          border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
          fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display, cursor: 'pointer',
          boxShadow: DT.shadowSoft,
        }}
      >
        <VideoCamera size={16} weight="regular" color={DT.azulInk} /> Proponer videollamada
      </button>
    )
  }

  return (
    <div className="td-in" style={{
      padding: '17px', borderRadius: '18px', background: DT.cream,
      border: `1px solid ${DT.line}`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
    }}>
      {sent ? (
        <div>
          <SectionTitle Icon={CalendarCheck} accent="azul">Convocatoria enviada</SectionTitle>
          <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
            {longDay(day)} a las {time}, con la familia de {firstName(patient?.name ?? '')}. Ya está en la
            agenda de ese día.
          </p>
          <button
            type="button"
            className="td-btn"
            onClick={() => { setOpen(false); setSent(false) }}
            style={{
              height: '38px', padding: '0 15px', borderRadius: '13px',
              border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
              fontSize: '13px', fontWeight: 700, fontFamily: DT.body, cursor: 'pointer',
            }}
          >
            <Check size={14} weight="regular" style={{ marginRight: '6px', verticalAlign: '-2px' }} />
            Listo
          </button>
        </div>
      ) : (
        <>
          <SectionTitle
            Icon={VideoCamera}
            accent="azul"
            hint="Eliges el hueco y la familia lo recibe con el día y la hora."
          >
            Proponer videollamada
          </SectionTitle>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: DT.ink, fontFamily: DT.body }}>Día</span>
              <input type="date" value={day} onChange={e => setDay(e.target.value)} style={field} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: DT.ink, fontFamily: DT.body }}>Hora</span>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={field} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '160px', flex: 1 }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: DT.ink, fontFamily: DT.body }}>Familia</span>
              <select value={patientId} onChange={e => setPatientId(e.target.value)} style={field}>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          </div>

          {/* La franja del día: un elemento del panel, no una frase al pie. */}
          <div style={{ marginBottom: '14px' }}>
            <FranjaDelDia day={day} slots={slots} choca={choca} />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="td-btn"
              onClick={enviar}
              disabled={!patient}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                height: '40px', padding: '0 16px', borderRadius: '13px',
                border: 'none', background: DT.yellow, color: DT.ink,
                fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display,
                cursor: patient ? 'pointer' : 'default', opacity: patient ? 1 : 0.5,
                boxShadow: patient ? '0 1px 2px rgba(51,48,42,0.10), 0 6px 14px rgba(247,195,28,0.28)' : 'none',
              }}
            >
              <PaperPlaneTilt size={15} weight="regular" /> Enviar convocatoria
            </button>
            <button
              type="button"
              className="td-btn"
              onClick={() => setOpen(false)}
              style={{
                height: '40px', padding: '0 15px', borderRadius: '13px',
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

// ── El calendario: rango de la semana, flechas y los 7 días ──────────────────
function SemanaNav({ day, onDay, busyOf, today }: {
  day: string
  onDay: (iso: string) => void
  busyOf: (iso: string) => boolean
  today: string
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const days = useMemo(() => {
    const monday = mondayOf(day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return localIso(d)
    })
  }, [day])

  // El popover se cierra al tocar fuera o con Escape, como cualquier menú.
  useEffect(() => {
    if (!pickerOpen) return
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [pickerOpen])

  const navBtn: React.CSSProperties = {
    width: '34px', height: '34px', borderRadius: '11px', flexShrink: 0,
    border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    boxShadow: DT.shadowSoft,
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Rango de la semana con sus flechas. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '11px' }}>
        <button
          type="button" className="td-btn" style={navBtn}
          onClick={() => onDay(shiftDays(day, -7))}
          aria-label="Semana anterior"
        >
          <CaretLeft size={16} weight="regular" />
        </button>
        <span style={{
          flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 600,
          color: DT.ink, fontFamily: DT.display, fontVariantNumeric: 'tabular-nums',
        }}>
          {weekLabel(days[0], days[6])}
        </span>
        <button
          type="button" className="td-btn" style={navBtn}
          onClick={() => onDay(shiftDays(day, 7))}
          aria-label="Semana siguiente"
        >
          <CaretRight size={16} weight="regular" />
        </button>

        {/* Salto a cualquier fecha, para no ir semana a semana hasta noviembre. */}
        <div ref={pickerRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            type="button"
            className="td-btn"
            onClick={() => setPickerOpen(o => !o)}
            aria-expanded={pickerOpen}
            aria-label="Ir a una fecha"
            style={{
              ...navBtn,
              background: pickerOpen ? DT.azulTint : DT.white,
              borderColor: pickerOpen ? DT.azulTintLine : DT.line,
              color: pickerOpen ? DT.azulInk : DT.ink,
            }}
          >
            <CalendarBlank size={16} weight="regular" />
          </button>
          {pickerOpen && (
            <div className="td-in" style={{
              position: 'absolute', right: 0, top: '42px', zIndex: 20, width: '210px',
              padding: '13px', borderRadius: '16px', background: DT.white,
              border: `1px solid ${DT.line}`, boxShadow: DT.shadowLift,
            }}>
              <FieldLabel accent="azul" style={{ marginBottom: '9px' }}>Ir a una fecha</FieldLabel>
              <input
                type="date"
                value={day}
                autoFocus
                onChange={e => { if (e.target.value) { onDay(e.target.value); setPickerOpen(false) } }}
                style={{
                  width: '100%', boxSizing: 'border-box', height: '40px', padding: '0 11px',
                  borderRadius: DT.radiusSm, border: `1px solid ${DT.line}`, background: DT.cream,
                  color: DT.ink, fontSize: '14px', fontWeight: 600, fontFamily: DT.body, outline: 'none',
                }}
              />
              <button
                type="button"
                className="td-btn"
                onClick={() => { onDay(today); setPickerOpen(false) }}
                style={{
                  width: '100%', marginTop: '9px', height: '36px', borderRadius: DT.radiusSm,
                  border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink,
                  fontSize: '13px', fontWeight: 700, fontFamily: DT.body, cursor: 'pointer',
                }}
              >
                Volver a hoy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Los 7 días de la semana. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '5px' }}>
        {days.map((iso, i) => {
          const active = iso === day
          const isToday = iso === today
          const busy = busyOf(iso)
          const weekend = i >= 5
          return (
            <button
              key={iso}
              type="button"
              className="td-day"
              onClick={() => onDay(iso)}
              aria-pressed={active}
              aria-label={longDay(iso)}
              style={{
                padding: '8px 0 7px', borderRadius: '14px', cursor: 'pointer', boxSizing: 'border-box',
                border: `1px solid ${active ? DT.azul : isToday ? DT.azulTintLine : DT.line}`,
                background: active ? DT.azul : isToday ? DT.azulTint : weekend ? DT.cream : DT.white,
                color: active ? DT.cream : weekend ? DT.muted : DT.ink,
                boxShadow: active ? '0 2px 6px rgba(91,136,150,0.30)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              }}
            >
              <span style={{ fontSize: '10.5px', fontWeight: 800, opacity: 0.75, fontFamily: DT.body }}>
                {WEEK_INITIALS[i]}
              </span>
              <span style={{
                fontSize: '16px', fontWeight: 600, fontFamily: DT.display,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
              }}>
                {parseDay(iso).getDate()}
              </span>
              <span aria-hidden style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: busy ? (active ? DT.cream : DT.azul) : 'transparent',
              }} />
            </button>
          )
        })}
      </div>
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

  // Sesiones del día elegido, más las videollamadas ya convocadas.
  const sesiones = useMemo(() => {
    if (!isDemo) return []
    return citasDe(day, patientIds)
      .map(c => ({ ...c, patient: patients.find(p => p.id === c.patientId) }))
      .filter((c): c is typeof c & { patient: Patient } => !!c.patient)
  }, [isDemo, day, patientIds, patients])

  const llamadasDelDia = calls.filter(c => c.day === day)

  // Lo que ocupa un día, para la franja del selector de videollamada.
  const slotsDe = (d: string): Ocupado[] => [
    ...(isDemo ? citasDe(d, patientIds) : []).map(c => ({
      time: c.time,
      label: firstName(patients.find(p => p.id === c.patientId)?.name ?? ''),
      kind: 'sesion' as const,
    })),
    ...calls.filter(c => c.day === d).map(c => ({
      time: c.time,
      label: `videollamada con ${firstName(c.patientName)}`,
      kind: 'llamada' as const,
    })),
  ].sort((a, b) => (a.time < b.time ? -1 : 1))

  const busyOf = (iso: string) =>
    (isDemo && citasDe(iso, patientIds).length > 0) || calls.some(c => c.day === iso)

  const vacio = sesiones.length === 0 && llamadasDelDia.length === 0

  return (
    <section
      aria-label="Hoy, la agenda de la semana"
      style={{
        position: 'relative', padding: '20px 20px 20px',
        background: DT.white, border: `1px solid ${DT.line}`, borderRadius: DT.radius,
        boxShadow: DT.shadow, overflow: 'hidden', fontFamily: DT.body,
      }}
    >
      <style>{CSS}</style>
      {/* Filo azul: la agenda es estructura, y el azul es el color de la
          estructura en toda la vista. */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: `linear-gradient(180deg, ${DT.azul} 0%, ${DT.azulTint} 100%)`,
      }} />

      <SectionTitle
        Icon={CalendarBlank}
        accent="azul"
        size="lg"
        right={
          <span style={{
            padding: '5px 12px', borderRadius: '999px',
            background: DT.azulTint, border: `1px solid ${DT.azulTintLine}`,
            fontSize: '12.5px', fontWeight: 800, color: DT.azulInk, fontFamily: DT.body,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {day === today ? 'hoy' : longDay(day)}
          </span>
        }
      >
        Agenda
      </SectionTitle>

      <SemanaNav day={day} onDay={iso => { setDay(iso); setExpanded(null) }} busyOf={busyOf} today={today} />

      {/* Sesiones del día, plegables */}
      {!isDemo ? (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '11px', margin: '0 0 16px',
          padding: '13px 14px', borderRadius: '15px',
          background: DT.cream, border: `1px solid ${DT.line}`,
        }}>
          <IconBadge Icon={CalendarCheck} accent="mostaza" size={32} />
          <p style={{
            margin: 0, flex: 1, fontSize: '13px', fontWeight: 600, lineHeight: 1.55,
            color: DT.ink, fontFamily: DT.body,
          }}>
            Dracs leerá tu calendario para poner cada briefing antes de su cita. No
            toca tus citas: solo añade las videollamadas que tú crees.
          </p>
        </div>
      ) : vacio ? (
        <div style={{ marginBottom: '8px' }}>
          <EmptyState title="Día libre" accent="arena">
            No tienes sesiones el {longDay(day)}. Si quieres, propón una videollamada
            aquí abajo.
          </EmptyState>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {sesiones.map(s => {
            const st = deskStatus({
              sessionsThisWeek: s.patient.metrics.sessionsThisWeek,
              lastPlayedISO: s.patient.lastPlayedISO,
              totalSessions: s.patient.totalSessions,
            })
            const accent = TONE_ACCENT[st.tone]
            const isOpen = expanded === s.patient.id
            return (
              <div key={`${s.time}-${s.patient.id}`}>
                <button
                  type="button"
                  className="td-btn td-row"
                  onClick={() => setExpanded(isOpen ? null : s.patient.id)}
                  aria-expanded={isOpen}
                  aria-label={`${s.time}, ${s.patient.name}. ${st.text}`}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '15px',
                    border: `1px solid ${isOpen ? DT.line : 'transparent'}`,
                    background: isOpen ? DT.cream : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = DT.cream }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* La hora en su pastilla: es el dato por el que se busca. */}
                  <span style={{
                    flexShrink: 0, padding: '5px 9px', borderRadius: '10px',
                    background: DT.azulTint, border: `1px solid ${DT.azulTintLine}`,
                    fontSize: '13px', fontWeight: 800, color: DT.azulInk,
                    fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.time}
                  </span>
                  <Avatar name={s.patient.name} size={34} accent={accent} />
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
              padding: '10px 12px', borderRadius: '15px', background: DT.mostazaTint,
              border: `1px solid ${DT.mostazaTintLine}`, marginTop: '6px',
            }}>
              <span style={{
                flexShrink: 0, padding: '5px 9px', borderRadius: '10px',
                background: DT.white, border: `1px solid ${DT.mostazaTintLine}`,
                fontSize: '13px', fontWeight: 800, color: DT.mostazaInk,
                fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
              }}>
                {c.time}
              </span>
              <VideoCamera size={17} weight="regular" color={DT.mostazaInk} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
                Videollamada con la familia de {firstName(c.patientName)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ paddingTop: '16px', borderTop: `1px solid ${DT.lineSoft}` }}>
        <ProponerVideollamada
          patients={patients}
          slotsDe={slotsDe}
          onSaved={call => { setCalls(saveVideollamada(call)); setDay(call.day) }}
        />
      </div>
    </section>
  )
}
