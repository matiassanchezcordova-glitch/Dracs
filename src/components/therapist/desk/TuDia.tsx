// "Hoy" — la agenda del terapeuta, semana a semana.
//
// Esta sección responde UNA pregunta: qué sesión tiene cada paciente y qué día.
// Nada de resultados: cómo le fue vive en el Resumen de su carpeta, y tocar una
// sesión lleva justo ahí.
//
// Cómo funciona:
//   - arriba, el rango de la semana con flechas para ir a la anterior o a la
//     siguiente, un botón para volver a hoy y un ícono de calendario que abre el
//     selector de fecha;
//   - debajo, los 7 días de esa semana como selector: el activo relleno, hoy con
//     su borde, un punto si tiene sesiones y los días ya pasados atenuados;
//   - cada sesión es una fila que abre la carpeta de ese niño;
//   - la videollamada funciona: eliges día y hora, ves la franja del día como UI
//     (no como frase suelta), se avisa si el hueco choca, y la convocatoria se
//     guarda en el navegador.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarBlank, CaretLeft, CaretRight, CaretRight as RowCaret, VideoCamera,
  PaperPlaneTilt, Check, Warning, CalendarCheck,
} from '@phosphor-icons/react'
import type { Patient } from '../../../data/patients'
import { DT } from './deskTokens'
import { Avatar, EmptyState, FieldLabel, SectionTitle } from './deskUI'
import { citasDe, loadVideollamadas, saveVideollamada, type Videollamada } from './agenda'

const DAY_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
// De lunes a domingo, como se dibuja la semana.
const WEEK_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const CSS = `
@keyframes tdIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.td-in   { animation: tdIn 0.2s ease-out both; }
.td-row  { transition: background 0.15s ease, border-color 0.15s ease; }
.td-day  { transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease; }
.td-btn:focus-visible, .td-day:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .td-in { animation: none !important; }
  .td-row, .td-day { transition: none !important; }
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

// ── La franja de horas de un día ─────────────────────────────────────────────
// Lo que ya hay ese día, dibujado. Un aviso y una franja de agenda tienen fines
// distintos, así que no pueden ir con el mismo formato de texto plano.
interface Ocupado {
  time: string
  label: string
  kind: 'sesion' | 'llamada' | 'nueva'
}

function FranjaDelDia({ day, slots, choca }: { day: string; slots: Ocupado[]; choca: boolean }) {
  return (
    <div style={{
      padding: '13px 14px', borderRadius: '15px',
      background: DT.white, border: `1px solid ${DT.line}`,
    }}>
      <FieldLabel style={{ marginBottom: '9px' }}>{longDay(day)}</FieldLabel>

      {slots.length === 0 ? (
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: DT.muted, fontFamily: DT.body }}>
          Ese día lo tienes libre.
        </p>
      ) : (
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {slots.map(s => {
            // El hueco que estás eligiendo va punteado: se ve dónde cae entre lo
            // que ya tienes, sin pintarse de otro color.
            const nueva = s.kind === 'nueva'
            return (
              <span
                key={`${s.time}-${s.kind}-${s.label}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '6px 11px', borderRadius: '11px',
                  background: nueva ? DT.white : DT.arena,
                  border: `1px ${nueva ? 'dashed' : 'solid'} ${nueva ? DT.azul : 'transparent'}`,
                  color: DT.ink, fontSize: '12.5px', fontWeight: 700, fontFamily: DT.body,
                }}
              >
                <span style={{ color: DT.azulInk, fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>
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
      padding: '17px', borderRadius: '18px', background: DT.cream, border: `1px solid ${DT.line}`,
    }}>
      {sent ? (
        <div>
          <SectionTitle Icon={CalendarCheck}>Convocatoria enviada</SectionTitle>
          <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.55 }}>
            {longDay(day)} a las {time}, con la familia de {firstName(patient?.name ?? '')}.
          </p>
          <button
            type="button"
            className="td-btn"
            onClick={() => { setOpen(false); setSent(false) }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              height: '38px', padding: '0 15px', borderRadius: '13px',
              border: `1px solid ${DT.line}`, background: DT.white, color: DT.ink,
              fontSize: '13px', fontWeight: 700, fontFamily: DT.body, cursor: 'pointer',
            }}
          >
            <Check size={14} weight="regular" /> Listo
          </button>
        </div>
      ) : (
        <>
          <SectionTitle Icon={VideoCamera}>Proponer videollamada</SectionTitle>

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

// ── El selector de semana: rango, flechas, hoy, fecha y los 7 días ───────────
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

  const enSemanaDeHoy = days[0] <= today && today <= days[6]

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
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Rango de la semana, flechas, vuelta a hoy y salto a una fecha. Todo lo
          que parece botón en esta fila lo es. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '11px' }}>
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

        {/* Volver a hoy. Se apaga cuando ya estás en esta semana, para que no
            prometa algo que no va a pasar. */}
        <button
          type="button"
          className="td-btn"
          onClick={() => onDay(today)}
          disabled={day === today}
          style={{
            height: '34px', padding: '0 13px', borderRadius: '11px', flexShrink: 0,
            border: `1px solid ${enSemanaDeHoy ? DT.line : DT.azulTintLine}`,
            background: enSemanaDeHoy ? DT.white : DT.azulTint,
            color: day === today ? DT.faint : DT.azulInk,
            fontSize: '13px', fontWeight: 700, fontFamily: DT.body,
            cursor: day === today ? 'default' : 'pointer',
            opacity: day === today ? 0.55 : 1,
          }}
        >
          Hoy
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
              <FieldLabel style={{ marginBottom: '9px' }}>Ir a una fecha</FieldLabel>
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
            </div>
          )}
        </div>
      </div>

      {/* Los 7 días son el selector de la semana. Cuatro estados y nada más:
          activo (relleno), hoy (borde azul), con sesiones (punto) y ya pasado
          (atenuado). */}
      <div
        role="group"
        aria-label="Elige el día de la semana"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '5px' }}
      >
        {days.map((iso, i) => {
          const active = iso === day
          const isToday = iso === today
          const past = iso < today
          const busy = busyOf(iso)
          return (
            <button
              key={iso}
              type="button"
              className="td-day"
              onClick={() => onDay(iso)}
              aria-pressed={active}
              aria-label={`${longDay(iso)}${busy ? ', con sesiones' : ', sin sesiones'}`}
              style={{
                padding: '8px 0 7px', borderRadius: '13px', cursor: 'pointer', boxSizing: 'border-box',
                border: `1px solid ${active ? DT.azul : isToday ? DT.azul : DT.line}`,
                background: active ? DT.azul : DT.white,
                color: active ? DT.cream : past ? DT.faint : DT.ink,
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

  // Fila de la agenda: hora, quién y a su carpeta. Nada de resultados aquí.
  const filaBase: React.CSSProperties = {
    width: '100%', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 12px', borderRadius: '14px',
  }

  const horaChip: React.CSSProperties = {
    flexShrink: 0, padding: '5px 9px', borderRadius: '10px',
    background: DT.arena, fontSize: '13px', fontWeight: 800, color: DT.azulInk,
    fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
  }

  return (
    <section
      aria-label="Agenda de la semana"
      style={{
        padding: '20px', background: DT.white, border: `1px solid ${DT.line}`,
        borderRadius: DT.radius, boxShadow: DT.shadow, fontFamily: DT.body,
      }}
    >
      <style>{CSS}</style>

      <SectionTitle Icon={CalendarBlank} size="lg">Agenda</SectionTitle>

      <SemanaNav day={day} onDay={setDay} busyOf={busyOf} today={today} />

      {/* Las sesiones del día elegido */}
      {!isDemo ? (
        <p style={{
          margin: '0 0 16px', padding: '13px 14px', borderRadius: '15px',
          background: DT.cream, border: `1px solid ${DT.line}`,
          fontSize: '13px', fontWeight: 600, lineHeight: 1.55, color: DT.ink, fontFamily: DT.body,
        }}>
          Dracs leerá tu calendario para poner cada briefing antes de su cita. No
          toca tus citas: solo añade las videollamadas que tú crees.
        </p>
      ) : vacio ? (
        <div style={{ marginBottom: '8px' }}>
          <EmptyState Icon={CalendarBlank} title="Día libre">
            No tienes sesiones el {longDay(day)}. Si quieres, propón una videollamada
            aquí abajo.
          </EmptyState>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {/* El día que se está mirando se dice una vez, aquí. */}
          <FieldLabel>{longDay(day)}</FieldLabel>

          {sesiones.map(s => (
            <button
              key={`${s.time}-${s.patient.id}`}
              type="button"
              className="td-btn td-row"
              onClick={() => onOpen(s.patient.id)}
              style={{
                ...filaBase, cursor: 'pointer',
                border: `1px solid transparent`, background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = DT.cream }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <span style={horaChip}>{s.time}</span>
              <Avatar name={s.patient.name} size={34} />
              <span style={{
                flex: 1, minWidth: 0, fontSize: '14.5px', fontWeight: 700, color: DT.ink,
                fontFamily: DT.display, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {s.patient.name}
              </span>
              <span style={{
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '12.5px', fontWeight: 700, color: DT.azulInk, fontFamily: DT.body,
              }}>
                Su carpeta <RowCaret size={14} weight="regular" />
              </span>
            </button>
          ))}

          {/* Videollamadas convocadas ese día */}
          {llamadasDelDia.map(c => (
            <div key={c.id} style={{
              ...filaBase,
              background: DT.cream, border: `1px solid ${DT.line}`, marginTop: '6px',
              boxSizing: 'border-box',
            }}>
              <span style={{ ...horaChip, background: DT.white }}>{c.time}</span>
              <VideoCamera size={17} weight="regular" color={DT.azulInk} style={{ flexShrink: 0 }} />
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
