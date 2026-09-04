// "Tu día" — banda de briefing pre-sesión, arriba del Escritorio.
//
// Para qué: los 30 segundos antes de que el paciente se siente. Qué cambió en
// casa desde la última vez, en una pantalla, sin abrir nada.
//
// TRES GARANTÍAS DE DISEÑO (los tres riesgos de esta pieza, ya resueltos):
//   1. Que quede en blanco cuando el niño no jugó: nunca. Hay tres estados y
//      los tres son útiles. "No abrió" es información, no un hueco, y viene con
//      una acción (recordar a la familia). "Primera vez" explica qué falta para
//      que se llene.
//   2. Que se lea como si le dijéramos al experto cómo trabajar: primero los
//      hechos, siempre. La sugerencia va aparte, etiquetada como ignorable y en
//      condicional ("podría ser"), nunca en imperativo y nunca con verbo
//      clínico. Dracs no valora ni interpreta.
//   3. Que cueste tiempo: una banda, 20 segundos de lectura, solo lo que
//      cambió. El resto va colapsado en el acordeón.
//
// Nada de esto se inventa: cada línea sale de deskStatus, usePorArea o
// childFocus, y la línea que no tiene dato detrás no se dibuja.
//
// ROADMAP de la agenda (hoy es vista previa, no hay integración):
//   - No reemplazamos su agenda. La agenda clínica está regulada, lleva
//     facturación (VeriFactu) y ya vive en su software de gestión. Dracs se
//     CONECTA: lee las citas para ordenar el día y solo escribe las
//     videollamadas que crea el propio terapeuta.
//   - Por privacidad (GDPR, LOPIVI), cuando exista la integración solo se
//     leerán los eventos que mapeen a pacientes de Dracs, nunca la agenda
//     entera. En modo real no se inventa ningún horario: se dice que llega.

import { useEffect, useState } from 'react'
import {
  CalendarBlank, Clock, CheckCircle, MoonStars, Info, Target, MapPin, Lightbulb,
  Bell, Lock, VideoCamera, UserPlus, CaretDown,
} from '@phosphor-icons/react'
import type { Patient } from '../../../data/patients'
import { DT } from './deskTokens'
import { deskStatus, type StatusTone } from './patientStatus'
import { usePorArea } from './usePorArea'
import { loadChildFocus, EMPTY_FOCUS, type ChildFocus } from './childFocus'

const TONE: Record<StatusTone, { color: string; Icon: typeof CheckCircle }> = {
  played:    { color: DT.azul,    Icon: CheckCircle },
  attention: { color: DT.mostaza, Icon: Clock },
  idle:      { color: DT.topo,    Icon: MoonStars },
}

// Agenda ilustrativa del showroom. Va marcada "ejemplo" en la UI: en modo real
// no se dibuja ningún horario (no hay integración de calendario todavía).
const DEMO_SLOTS: { time: string; patientId: string }[] = [
  { time: '17:30', patientId: 'mateo' },
  { time: '18:15', patientId: 'lucia' },
]

const CSS = `
@keyframes tdOpen { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.td-panel   { animation: tdOpen 0.2s ease-out both; }
.td-chevron { transition: transform 0.2s ease; }
.td-row     { transition: background 0.15s ease; }
.td-btn:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .td-panel { animation: none !important; }
  .td-chevron, .td-row { transition: none !important; }
}
`

// Lista en prosa: "el mar", "el mar y la playa", "el mar, la playa y la casa".
function joinPlaces(places: string[]): string {
  if (places.length <= 1) return places[0] ?? ''
  return `${places.slice(0, -1).join(', ')} y ${places[places.length - 1]}`
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

// Enfoque del niño (áreas, nota, énfasis fijado). En demo lee el localStorage
// que ya escribe Enfocar mundo; en real, las columnas de children. Sin dato,
// devuelve vacío y las líneas que dependen de él no se dibujan.
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

// ── Fila del briefing: columna fija a la izquierda para que todo quede en eje ──
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
      <span style={{
        flex: 1, fontSize: '14px', fontWeight: 600, lineHeight: 1.5,
        color: DT.ink, fontFamily: DT.body,
      }}>
        {children}
      </span>
    </div>
  )
}

function ActionButton({ label, doneLabel, icon: Icon, primary, onAct }: {
  label: string
  doneLabel?: string
  icon: typeof Bell
  primary?: boolean
  onAct?: () => void
}) {
  const [done, setDone] = useState(false)
  const text = done && doneLabel ? doneLabel : label
  return (
    <button
      type="button"
      className="td-btn"
      onClick={() => { if (doneLabel) setDone(true); onAct?.() }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        height: '38px', padding: '0 15px', borderRadius: '13px',
        border: primary ? 'none' : `1px solid ${DT.line}`,
        background: primary ? DT.yellow : DT.white,
        color: DT.ink, fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display,
        cursor: 'pointer',
      }}
    >
      <Icon size={15} weight="regular" /> {text}
    </button>
  )
}

// ── El briefing de un paciente ───────────────────────────────────────────────
function Briefing({ patient, isDemo, onOpenCarpeta }: {
  patient: Patient
  isDemo: boolean
  onOpenCarpeta: () => void
}) {
  const name = firstName(patient.name)
  const st = deskStatus({
    sessionsThisWeek: patient.metrics.sessionsThisWeek,
    lastPlayedISO: patient.lastPlayedISO,
    totalSessions: patient.totalSessions,
  })
  const tone = TONE[st.tone]

  // En el showroom no se consulta la base: las carpetas de ejemplo no tienen
  // partidas detrás, así que las líneas que dependen de ellas no se dibujan.
  const porArea = usePorArea(isDemo ? null : patient.id)
  const focus = useFocus(!isDemo, patient.id)

  const places = porArea.placesVisited
  const hasPlaces = places.length > 0
  const pinned = focus.emphasis.length

  // Tres estados, ninguno en blanco. "Primera vez" es solo cuando no hay NADA
  // detrás: ni partidas esta semana, ni historial, ni última fecha. Las carpetas
  // de ejemplo no traen totalSessions, así que mirar solo ese campo las mandaba
  // a "primera vez" teniendo partidas.
  const hasAnyPlay = patient.metrics.sessionsThisWeek > 0
    || (patient.totalSessions ?? 0) > 0
    || !!patient.lastPlayedISO
  const isFirstTime = !hasAnyPlay
  const noNews = hasAnyPlay && patient.metrics.sessionsThisWeek === 0

  function askCopilot() {
    window.dispatchEvent(new CustomEvent('dracs-copilot-open', {
      detail: { intent: 'prep', childName: name },
    }))
  }

  return (
    <div>
      <p style={{
        margin: 0, fontSize: '17px', fontWeight: 700, color: DT.ink, fontFamily: DT.display,
      }}>
        Antes de tu próxima sesión con {name}
      </p>
      <p style={{
        margin: '3px 0 14px', fontSize: '13.5px', fontWeight: 600, color: DT.muted, fontFamily: DT.body,
      }}>
        Lo que cambió en casa. Léelo en 20 segundos.
      </p>

      {isFirstTime ? (
        <p style={{
          margin: '0 0 14px', fontSize: '14px', fontWeight: 600, lineHeight: 1.6,
          color: DT.ink, fontFamily: DT.body,
        }}>
          Primera vez con {name}. Todavía no hay nada de casa. En cuanto la familia
          lo vincule y juegue, esto se llena solo.
        </p>
      ) : (
        <div style={{ marginBottom: '14px' }}>
          <BriefRow first mark={
            <span aria-hidden style={{
              width: '9px', height: '9px', borderRadius: '50%', background: tone.color,
            }} />
          }>
            {st.text}
          </BriefRow>

          {hasPlaces && (
            <BriefRow mark={<MapPin size={15} weight="regular" />}>
              Se movió sobre todo por {joinPlaces(places)}.
            </BriefRow>
          )}

          {pinned > 0 && (
            <BriefRow mark={<Target size={15} weight="regular" />}>
              Tienes {pinned} {pinned === 1 ? 'juego fijado' : 'juegos fijados'} en su énfasis.
            </BriefRow>
          )}

          {noNews && (
            <BriefRow mark={<Bell size={15} weight="regular" />}>
              Sin novedades de casa esta semana. Llegas igual, solo que sin nada nuevo que mirar.
            </BriefRow>
          )}
        </div>
      )}

      {/* La sugerencia va aparte y etiquetada: es ignorable por diseño. */}
      {hasPlaces && (
        <div style={{
          marginBottom: '14px', padding: '11px 13px', borderRadius: '13px',
          background: DT.cream, border: `1px solid ${DT.line}`,
        }}>
          <p style={{
            margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: DT.faint, fontFamily: DT.body,
          }}>
            <Lightbulb size={13} weight="regular" /> Sugerencia, la puedes ignorar
          </p>
          <p style={{
            margin: 0, fontSize: '13.5px', fontWeight: 600, lineHeight: 1.5,
            color: DT.ink, fontFamily: DT.body,
          }}>
            Un punto de partida cómodo podría ser {places[0]}.
          </p>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <ActionButton
          label={`Abrir carpeta de ${name}`}
          icon={CalendarBlank}
          primary
          onAct={onOpenCarpeta}
        />
        <ActionButton
          label="Pídele a Dracs que la prepare"
          icon={Lightbulb}
          onAct={askCopilot}
        />
        {isFirstTime && (
          <ActionButton
            label="Enviar acceso a la familia"
            doneLabel="Acceso enviado"
            icon={UserPlus}
          />
        )}
        {!isFirstTime && st.tone !== 'played' && (
          <ActionButton
            label="Recordar a la familia"
            doneLabel="Aviso enviado"
            icon={Bell}
          />
        )}
      </div>

      <p style={{
        margin: '13px 0 0', display: 'flex', alignItems: 'flex-start', gap: '7px',
        fontSize: '11.5px', fontWeight: 600, lineHeight: 1.45, color: DT.faint, fontFamily: DT.body,
      }}>
        <Info size={14} weight="regular" style={{ flexShrink: 0, marginTop: '1px' }} />
        Sale de sus partidas reales. Dracs no interpreta ni valora, te muestra lo que pasó.
      </p>
    </div>
  )
}

// ── Fila de la agenda de ejemplo (acordeón) ──────────────────────────────────
function SlotRow({ time, patient, open, onToggle, isDemo, onOpenCarpeta, last }: {
  time: string
  patient: Patient
  open: boolean
  onToggle: () => void
  isDemo: boolean
  onOpenCarpeta: () => void
  last: boolean
}) {
  const st = deskStatus({
    sessionsThisWeek: patient.metrics.sessionsThisWeek,
    lastPlayedISO: patient.lastPlayedISO,
    totalSessions: patient.totalSessions,
  })
  const tone = TONE[st.tone]
  const panelId = `td-panel-${patient.id}`
  const name = firstName(patient.name)

  return (
    <div style={{ position: 'relative', paddingLeft: '30px', paddingBottom: last ? 0 : '6px' }}>
      {/* Guía vertical de la línea de tiempo */}
      {!last && (
        <span aria-hidden style={{
          position: 'absolute', left: '9px', top: '22px', bottom: 0, width: '1px',
          background: DT.line,
        }} />
      )}
      {/* Nodo de la hora */}
      <span aria-hidden style={{
        position: 'absolute', left: '4px', top: '15px',
        width: '11px', height: '11px', borderRadius: '50%',
        background: DT.white, border: `2px solid ${tone.color}`, boxSizing: 'border-box',
      }} />

      <button
        type="button"
        className="td-btn td-row"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 12px', borderRadius: '13px',
          border: 'none', background: open ? DT.cream : 'transparent',
        }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0,
          fontSize: '14px', fontWeight: 800, color: DT.azulInk, fontFamily: DT.body,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <Clock size={15} weight="regular" /> {time}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontSize: '14.5px', fontWeight: 700, color: DT.ink,
            fontFamily: DT.display, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {patient.name}, {patient.age} años
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px',
            fontSize: '12.5px', fontWeight: 600, color: DT.muted, fontFamily: DT.body,
          }}>
            <span aria-hidden style={{
              width: '7px', height: '7px', borderRadius: '50%', background: tone.color, flexShrink: 0,
            }} />
            {st.text}
          </span>
        </span>
        <CaretDown
          size={16}
          weight="regular"
          color={DT.faint}
          className="td-chevron"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* La región existe siempre para que aria-controls apunte a algo real. */}
      <div id={panelId} role="region" aria-label={`Briefing de ${name}`} hidden={!open}>
        {open && (
          <div className="td-panel" style={{ padding: '14px 12px 6px' }}>
            <Briefing patient={patient} isDemo={isDemo} onOpenCarpeta={onOpenCarpeta} />
          </div>
        )}
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
  // Agenda de ejemplo: solo las citas cuyo paciente existe en el caseload.
  const slots = DEMO_SLOTS
    .map(s => ({ ...s, patient: patients.find(p => p.id === s.patientId) }))
    .filter((s): s is typeof s & { patient: Patient } => !!s.patient)

  const [openSlot, setOpenSlot] = useState(0)

  // Próximo paciente. En demo, el de la primera cita de ejemplo. En real, el de
  // actividad más reciente; si nadie tiene datos, el primero de la lista.
  const nextPatient: Patient | null = (() => {
    if (isDemo && slots.length > 0) return slots[0].patient
    const withPlay = patients.filter(p => p.lastPlayedISO)
    if (withPlay.length > 0) {
      return withPlay.reduce((a, b) =>
        new Date(b.lastPlayedISO!).getTime() > new Date(a.lastPlayedISO!).getTime() ? b : a)
    }
    return patients[0] ?? null
  })()

  if (!nextPatient) return null

  const useTimeline = isDemo && slots.length > 0

  return (
    <section
      aria-label="Tu día, briefing antes de la próxima sesión"
      style={{
        position: 'relative', marginBottom: '20px', padding: '18px 20px 20px',
        background: DT.white, border: `1px solid ${DT.line}`, borderRadius: '20px',
        boxShadow: '0 1px 2px rgba(51,48,42,0.05), 0 8px 24px rgba(51,48,42,0.07)',
        overflow: 'hidden', fontFamily: DT.body,
      }}
    >
      <style>{CSS}</style>
      {/* Filo izquierdo con degradado azul */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: `linear-gradient(180deg, ${DT.azul} 0%, ${DT.azulTint} 100%)`,
      }} />

      {/* Cabecera */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px',
      }}>
        <CalendarBlank size={19} weight="regular" color={DT.azulInk} style={{ flexShrink: 0 }} />
        <h2 style={{
          margin: 0, fontSize: '19px', fontWeight: 700, color: DT.ink, fontFamily: DT.display,
        }}>
          Tu día
        </h2>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px', marginLeft: 'auto',
          padding: '5px 11px', borderRadius: '999px',
          background: DT.azulTint, border: `1px solid ${DT.azulTintLine}`,
          color: DT.azulInk, fontSize: '11px', fontWeight: 800, fontFamily: DT.body,
          letterSpacing: '0.02em',
        }}>
          {useTimeline
            ? <>Agenda · ejemplo</>
            : <><Lock size={12} weight="regular" /> Agenda · muy pronto</>}
        </span>
      </div>

      {/* En real no inventamos horarios: se dice qué va a hacer la integración. */}
      {!useTimeline && (
        <p style={{
          margin: '0 0 16px', padding: '11px 13px', borderRadius: '13px',
          background: DT.cream, border: `1px solid ${DT.line}`,
          fontSize: '13px', fontWeight: 600, lineHeight: 1.55, color: DT.muted, fontFamily: DT.body,
        }}>
          Dracs va a leer tu calendario (Google o Outlook) para ordenarte el día y
          poner cada briefing antes de su cita. No cambia tu agenda: solo añade las
          videollamadas que tú crees.
        </p>
      )}

      {useTimeline ? (
        <div>
          {slots.map((slot, i) => (
            <SlotRow
              key={slot.patient.id}
              time={slot.time}
              patient={slot.patient}
              open={openSlot === i}
              onToggle={() => setOpenSlot(openSlot === i ? -1 : i)}
              isDemo={isDemo}
              onOpenCarpeta={() => onOpen(slot.patient.id)}
              last={i === slots.length - 1}
            />
          ))}
        </div>
      ) : (
        <Briefing
          patient={nextPatient}
          isDemo={isDemo}
          onOpenCarpeta={() => onOpen(nextPatient.id)}
        />
      )}

      {/* Videollamada de seguimiento: vista previa, inerte. */}
      <div style={{
        marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${DT.line}`,
      }}>
        <button
          type="button"
          className="td-btn"
          aria-disabled
          onClick={e => e.preventDefault()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            height: '38px', padding: '0 15px', borderRadius: '13px',
            border: `1px dashed ${DT.line}`, background: DT.white,
            color: DT.muted, fontSize: '13.5px', fontWeight: 700, fontFamily: DT.display,
            cursor: 'default',
          }}
        >
          <VideoCamera size={15} weight="regular" /> Proponer videollamada a la familia (muy pronto)
        </button>
        <p style={{
          margin: '7px 0 0', fontSize: '11.5px', fontWeight: 600, color: DT.faint, fontFamily: DT.body,
        }}>
          Se sincronizará con tu calendario.
        </p>
      </div>
    </section>
  )
}
