// La Agenda del terapeuta, semana a semana.
//
// Esta sección responde UNA pregunta: qué sesión tiene cada paciente y qué día.
// Nada de resultados: cómo le fue vive en el Resumen de su carpeta, y tocar una
// sesión lleva justo ahí. El módulo ya se llama Agenda, así que no lleva título.
//
// Cómo funciona:
//   - arriba, el rango de la semana con flechas para ir a la anterior o a la
//     siguiente, un botón que vuelve a hoy (y a su semana) y un ícono de
//     calendario que abre directamente el selector de fecha del sistema;
//   - debajo, los 7 días de esa semana como selector: el activo relleno, hoy con
//     su borde, un punto si tiene algo agendado y los días ya pasados atenuados;
//   - cada sesión es una fila que abre la carpeta de ese niño;
//   - la videollamada funciona: eliges día y hora, ves la franja del día, se
//     avisa si el hueco choca, y al agendarla se guarda en el navegador y
//     aparece en la agenda de ese día. Esa fila es la confirmación.

import { useMemo, useRef, useState } from 'react'
import {
  CalendarBlank, CaretLeft, CaretRight, CaretRight as RowCaret, VideoCamera,
  CalendarPlus, Warning,
} from '@phosphor-icons/react'
import type { Patient } from '../../../data/patients'
import { DT, FIELD_LINE } from './deskTokens'
import { Avatar, Button, EmptyState, FieldLabel, IconButton, SectionTitle } from './deskUI'
import { citasDe, loadVideollamadas, saveVideollamada, type Videollamada } from './agenda'

const DAY_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
// De lunes a domingo, como se dibuja la semana.
const WEEK_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const CSS = `
@keyframes tdIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.td-in   { animation: tdIn 0.2s ease-out both; }
.td-row  { transition: background 0.15s ease; }
.td-row:hover { background: ${DT.cream} !important; }
.td-day  { transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease; }
.td-btn:focus-visible, .td-day:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
/* El input de fecha existe sólo para abrir el selector del sistema desde el
   ícono: invisible y debajo del botón, para que el selector salga ahí. */
.td-picker { position: absolute; left: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; pointer-events: none; border: 0; padding: 0; }
@media (max-width: 480px) { .td-hide-m { display: none; } .td-week { font-size: 16px !important; } }
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
// Lo que ya hay ese día, dibujado, con el hueco nuevo en su sitio.
interface Ocupado {
  time: string
  label: string
  kind: 'sesion' | 'llamada' | 'nueva'
}

function FranjaDelDia({ day, slots, choca }: { day: string; slots: Ocupado[]; choca: boolean }) {
  return (
    <div style={{
      padding: '13px 14px', borderRadius: DT.radiusSm,
      background: DT.white, border: `1px solid ${DT.line}`,
    }}>
      <FieldLabel style={{ marginBottom: '9px' }}>{longDay(day)}</FieldLabel>

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
                padding: '6px 11px', borderRadius: '9px',
                background: nueva ? DT.white : DT.arena,
                border: `1px ${nueva ? 'dashed' : 'solid'} ${nueva ? DT.azul : 'transparent'}`,
                color: DT.ink, fontSize: '14.5px', fontWeight: 500, fontFamily: DT.body,
              }}
            >
              <span style={{ color: DT.azulInk, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                {s.time}
              </span>
              {s.label}
            </span>
          )
        })}
      </div>

      {choca && (
        <p style={{
          margin: '11px 0 0', display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 11px', borderRadius: DT.radiusSm,
          background: DT.mostazaTint, border: `1px solid ${DT.mostazaTintLine}`,
          fontSize: '14px', fontWeight: 500, lineHeight: 1.45, color: DT.ink, fontFamily: DT.body,
        }}>
          <Warning size={16} weight="regular" color={DT.mostazaInk} style={{ flexShrink: 0 }} />
          Esa hora ya está ocupada.
        </p>
      )}
    </div>
  )
}

// ── Videollamada: día, hora y la franja de ese día ───────────────────────────
function AgendarVideollamada({ patients, slotsDe, onSaved }: {
  patients: Patient[]
  slotsDe: (day: string) => Ocupado[]
  onSaved: (call: Videollamada) => void
}) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(localIso(new Date()))
  const [time, setTime] = useState('17:00')
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '')

  const patient = patients.find(p => p.id === patientId) ?? patients[0]
  const ocupado = day ? slotsDe(day) : []
  const choca = ocupado.some(o => o.time === time)

  const slots: Ocupado[] = [...ocupado, {
    time, kind: 'nueva' as const,
    label: patient ? `videollamada con ${firstName(patient.name)}` : 'videollamada',
  }].sort((a, b) => (a.time < b.time ? -1 : 1))

  // Al agendar, el formulario se cierra y la agenda salta a ese día: la fila
  // nueva es la confirmación, sin un aviso que repita lo mismo.
  function agendar() {
    if (!patient || !day || !time) return
    onSaved({
      id: `${day}-${time}-${patient.id}`,
      day, time, patientId: patient.id, patientName: patient.name,
    })
    setOpen(false)
  }

  const label: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }
  const line: React.CSSProperties = { ...FIELD_LINE, background: DT.white }

  if (!open) {
    return <Button Icon={VideoCamera} onClick={() => setOpen(true)} disabled={patients.length === 0}>Agendar videollamada</Button>
  }

  return (
    <div className="td-in" style={{
      padding: '20px', borderRadius: DT.radiusSm, background: DT.cream,
    }}>
      <SectionTitle Icon={VideoCamera}>Agendar videollamada</SectionTitle>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={label}>Día</span>
          <input type="date" value={day} onChange={e => setDay(e.target.value)} style={{ ...line, width: 'auto' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={label}>Hora</span>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...line, width: 'auto' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '160px', flex: 1 }}>
          <span style={label}>Familia</span>
          <select value={patientId} onChange={e => setPatientId(e.target.value)} style={line}>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>

      {day && (
        <div style={{ marginBottom: '14px' }}>
          <FranjaDelDia day={day} slots={slots} choca={choca} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button variant="primary" Icon={CalendarPlus} onClick={agendar} disabled={!patient || !day || !time}>
          Agendar
        </Button>
        <Button onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
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
  const pickerRef = useRef<HTMLInputElement>(null)

  const days = useMemo(() => {
    const monday = mondayOf(day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return localIso(d)
    })
  }, [day])

  // El ícono abre el selector de fecha del sistema, sin paso intermedio. Si el
  // navegador no tiene showPicker, se enfoca el input y se abre con un clic.
  function abrirSelector() {
    const el = pickerRef.current
    if (!el) return
    try {
      el.showPicker()
    } catch {
      el.focus()
      el.click()
    }
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Rango de la semana, flechas, vuelta a hoy y salto a una fecha. Todo lo
          que parece botón en esta fila lo es. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '11px' }}>
        <IconButton Icon={CaretLeft} label="Semana anterior" onClick={() => onDay(shiftDays(day, -7))} />
        <span className="td-week" style={{
          flex: 1, minWidth: 0, textAlign: 'center', fontSize: '19px', fontWeight: 600,
          color: DT.ink, fontFamily: DT.serif, fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {weekLabel(days[0], days[6])}
        </span>
        <IconButton Icon={CaretRight} label="Semana siguiente" onClick={() => onDay(shiftDays(day, 7))} />

        {/* Hoy: vuelve al día de hoy y a su semana, estés donde estés. Se
            apaga sólo cuando ya estás en hoy. */}
        <Button size="sm" onClick={() => onDay(today)} disabled={day === today}>Hoy</Button>

        <span style={{ position: 'relative', flexShrink: 0, display: 'inline-flex' }}>
          <IconButton Icon={CalendarBlank} label="Ir a una fecha" onClick={abrirSelector} />
          <input
            ref={pickerRef}
            type="date"
            className="td-picker"
            tabIndex={-1}
            aria-hidden
            value={day}
            onChange={e => { if (e.target.value) onDay(e.target.value) }}
          />
        </span>
      </div>

      {/* Los 7 días son el selector de la semana. Cuatro estados y nada más:
          activo (relleno en tinta), hoy (borde azul), con algo agendado (punto)
          y ya pasado (atenuado). */}
      <div
        role="group"
        aria-label="Elige el día de la semana"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}
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
              aria-label={`${longDay(iso)}${isToday ? ', hoy' : ''}${busy ? ', con algo agendado' : ''}`}
              style={{
                padding: '9px 0 8px', borderRadius: DT.radiusSm, cursor: 'pointer', boxSizing: 'border-box',
                border: `1.5px solid ${active ? DT.night : isToday ? DT.azul : DT.line}`,
                background: active ? DT.night : DT.white,
                color: active ? '#FFFFFF' : past ? DT.faint : DT.ink,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.8, fontFamily: DT.body }}>
                {WEEK_INITIALS[i]}
              </span>
              <span style={{
                fontSize: '18px', fontWeight: 600, fontFamily: DT.display,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
              }}>
                {parseDay(iso).getDate()}
              </span>
              <span aria-hidden style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: busy ? (active ? DT.yellow : DT.azul) : 'transparent',
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
  const patientIds = useMemo(() => patients.map(p => p.id), [patients])
  const [calls, setCalls] = useState<Videollamada[]>(() => loadVideollamadas())
  // Se abre en hoy. Si hoy no hay nada (un domingo, por ejemplo), en el
  // próximo día con algo agendado: la agenda nunca abre vacía si hay sesiones.
  const [day, setDay] = useState(() => {
    for (let i = 0; i < 14; i++) {
      const d = shiftDays(today, i)
      if ((isDemo && citasDe(d, patientIds).length > 0) || calls.some(c => c.day === d)) return d
    }
    return today
  })

  // Sesiones del día elegido. En la demo salen de la agenda de la base; con
  // cuenta real, la agenda es lo que el terapeuta agenda aquí.
  const sesiones = useMemo(() => {
    if (!isDemo) return []
    return citasDe(day, patientIds)
      .map(c => ({ ...c, patient: patients.find(p => p.id === c.patientId) }))
      .filter((c): c is typeof c & { patient: Patient } => !!c.patient)
  }, [isDemo, day, patientIds, patients])

  const llamadasDelDia = calls.filter(c => c.day === day)

  // Lo que ocupa un día, para la franja del formulario de videollamada.
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

  // Sesiones y videollamadas del día, en una sola lista por hora.
  const filas = [
    ...sesiones.map(s => ({ kind: 'sesion' as const, time: s.time, key: `s-${s.time}-${s.patient.id}`, sesion: s })),
    ...llamadasDelDia.map(c => ({ kind: 'llamada' as const, time: c.time, key: `c-${c.id}`, call: c })),
  ].sort((a, b) => (a.time < b.time ? -1 : 1))

  // Fila de la agenda: hora, quién y a su carpeta. Nada de resultados aquí.
  const filaBase: React.CSSProperties = {
    width: '100%', textAlign: 'left', boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px 14px', borderRadius: DT.radiusSm,
  }

  const horaChip: React.CSSProperties = {
    flexShrink: 0, minWidth: '52px', textAlign: 'center', padding: '6px 0', borderRadius: '8px',
    background: DT.arena, fontSize: '14px', fontWeight: 600, color: DT.ink,
    fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
  }

  return (
    <section
      aria-label="Agenda de la semana"
      style={{
        padding: '24px', background: DT.white, border: `1px solid ${DT.line}`,
        borderRadius: DT.radius, boxShadow: DT.shadow, fontFamily: DT.body,
      }}
    >
      <style>{CSS}</style>

      <SemanaNav day={day} onDay={setDay} busyOf={busyOf} today={today} />

      {/* Lo agendado el día elegido. El día ya se ve marcado arriba. */}
      <p style={{ margin: '4px 0 10px', fontSize: '14px', fontWeight: 500, color: DT.muted, fontFamily: DT.body }}>
        {day === today ? 'Hoy' : longDay(day).replace(/^./, c => c.toUpperCase())} · {filas.length === 0 ? 'sin sesiones' : filas.length === 1 ? '1 cita' : `${filas.length} citas`}
      </p>
      {filas.length === 0 ? (
        <div style={{ marginBottom: '8px' }}>
          <EmptyState Icon={CalendarBlank} title="Nada agendado este día" compact />
        </div>
      ) : (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filas.map(f => f.kind === 'sesion' ? (
            <button
              key={f.key}
              type="button"
              className="td-btn td-row"
              onClick={() => onOpen(f.sesion.patient.id)}
              style={{ ...filaBase, cursor: 'pointer', border: '1px solid transparent', background: 'transparent' }}
            >
              <span style={horaChip}>{f.time}</span>
              <Avatar name={f.sesion.patient.name} size={34} />
              <span style={{
                flex: 1, minWidth: 0, fontSize: '16px', fontWeight: 600, color: DT.ink,
                fontFamily: DT.display, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {f.sesion.patient.name}
              </span>
              <span style={{
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '14px', fontWeight: 500, color: DT.azulInk, fontFamily: DT.body,
              }}>
                <span className="td-hide-m">Su carpeta</span> <RowCaret size={14} weight="regular" />
              </span>
            </button>
          ) : (
            // La videollamada es un dato, no un botón: va en gris papel y sin flecha.
            <div key={f.key} style={{ ...filaBase, background: DT.cream }}>
              <span style={{ ...horaChip, background: DT.white }}>{f.time}</span>
              <VideoCamera size={17} weight="regular" color={DT.azulInk} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: '15px', fontWeight: 500, color: DT.ink, fontFamily: DT.body }}>
                Videollamada con la familia de {firstName(f.call.patientName)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ paddingTop: '18px', borderTop: `1px solid ${DT.lineSoft}` }}>
        <AgendarVideollamada
          patients={patients}
          slotsDe={slotsDe}
          onSaved={call => { setCalls(saveVideollamada(call)); setDay(call.day) }}
        />
      </div>
    </section>
  )
}
