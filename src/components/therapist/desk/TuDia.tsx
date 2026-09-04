// "Hoy" — la agenda del día y el briefing de la próxima sesión.
//
// Para qué: los 30 segundos antes de que el paciente se siente. Qué cambió en
// casa desde la última vez, en una pantalla, sin abrir nada.
//
// REGLA ANTI-REPETICIÓN (la razón de que este módulo se separase de la grilla):
// un dato aparece en UN solo sitio por pantalla.
//   - La fila de la agenda da hora y nombre, y el estado como PUNTO de color.
//     La frase ("Jugó 2 veces esta semana") no se repite aquí: vive en la
//     tarjeta del módulo Pacientes, que es su único sitio.
//   - El briefing no repite la fila: da el detalle que la fila no da (última
//     partida, por dónde se movió, qué tienes fijado).
//
// TRES GARANTÍAS DE DISEÑO:
//   1. Que quede en blanco cuando el niño no jugó: nunca. Los estados sin
//      partidas dicen algo útil. "No abrió" es información, no un hueco.
//   2. Que se lea como si le dijéramos al experto cómo trabajar: solo hechos,
//      en pasado, sin verbo clínico. Dracs no valora ni interpreta.
//   3. Que cueste tiempo: una banda, 20 segundos, y solo la próxima sesión
//      desplegada. La profundidad del paciente vive en su Carpeta.
//
// Cada línea sale de deskStatus, de las sesiones que el escritorio ya tiene en
// memoria, de usePorArea o de childFocus. La línea sin dato detrás no se dibuja.
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
  CalendarBlank, Clock, Info, Target, MapPin, Lock, VideoCamera, FolderOpen,
} from '@phosphor-icons/react'
import type { Patient } from '../../../data/patients'
import { DT } from './deskTokens'
import { deskStatus, type StatusTone } from './patientStatus'
import { usePorArea } from './usePorArea'
import { loadChildFocus, EMPTY_FOCUS, type ChildFocus } from './childFocus'

const TONE_COLOR: Record<StatusTone, string> = {
  played: DT.azul,
  attention: DT.mostaza,
  idle: DT.topo,
}

// Agenda ilustrativa del showroom. Va marcada "ejemplo" en la UI: en modo real
// no se dibuja ningún horario (no hay integración de calendario todavía).
const DEMO_SLOTS: { time: string; patientId: string }[] = [
  { time: '17:30', patientId: 'mateo' },
  { time: '18:15', patientId: 'lucia' },
]

const CSS = `
@keyframes tdIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.td-in  { animation: tdIn 0.22s ease-out both; }
.td-row { transition: background 0.15s ease; }
.td-btn:focus-visible { outline: 2px solid ${DT.azul}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .td-in { animation: none !important; }
  .td-row { transition: none !important; }
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

// ── Fila del briefing: columna fija a la izquierda para que quede todo en eje ──
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

// ── El briefing de la próxima sesión ─────────────────────────────────────────
// Detalle, no resumen: justo lo que la fila de la agenda no cuenta.
function Briefing({ patient, isDemo, onOpenCarpeta }: {
  patient: Patient
  isDemo: boolean
  onOpenCarpeta: () => void
}) {
  const name = firstName(patient.name)

  // En el showroom no se consulta la base: las carpetas de ejemplo no tienen
  // partidas detrás, así que las líneas que dependen de ellas no se dibujan.
  const porArea = usePorArea(isDemo ? null : patient.id)
  const focus = useFocus(!isDemo, patient.id)

  const places = porArea.placesVisited
  const topArea = porArea.distribution[0] ?? null
  const pinned = focus.emphasis.length
  const last = patient.recentSessions[0] ?? null

  const hasAnyPlay = patient.metrics.sessionsThisWeek > 0
    || (patient.totalSessions ?? 0) > 0
    || !!patient.lastPlayedISO
  const noNews = hasAnyPlay && patient.metrics.sessionsThisWeek === 0

  const rows: { key: string; mark: React.ReactNode; content: React.ReactNode }[] = []

  if (last) {
    rows.push({
      key: 'last',
      mark: <Clock size={15} weight="regular" />,
      content: <>Última partida el {last.date}: {last.exercises} {last.exercises === 1 ? 'juego' : 'juegos'} en {last.duration} minutos.</>,
    })
  }
  if (places.length > 0) {
    rows.push({
      key: 'places',
      mark: <MapPin size={15} weight="regular" />,
      content: <>Se movió sobre todo por {joinPlaces(places)}.</>,
    })
  }
  if (topArea) {
    rows.push({
      key: 'area',
      mark: <Target size={15} weight="regular" />,
      content: <>Lo que más jugó: {topArea.label} ({topArea.pct}%).</>,
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
    <div>
      <p style={{
        margin: 0, fontSize: '16px', fontWeight: 700, color: DT.ink, fontFamily: DT.display,
      }}>
        Antes de tu sesión con {name}
      </p>
      <p style={{
        margin: '3px 0 14px', fontSize: '13px', fontWeight: 600, color: DT.muted, fontFamily: DT.body,
      }}>
        Lo que cambió en casa. Léelo en 20 segundos.
      </p>

      {!hasAnyPlay ? (
        <p style={{
          margin: '0 0 14px', fontSize: '14px', fontWeight: 600, lineHeight: 1.6,
          color: DT.ink, fontFamily: DT.body,
        }}>
          Primera vez con {name}. Todavía no hay nada de casa. En cuanto la familia
          lo vincule y juegue, esto se llena solo.
        </p>
      ) : rows.length === 0 ? (
        <p style={{
          margin: '0 0 14px', fontSize: '14px', fontWeight: 600, lineHeight: 1.6,
          color: DT.ink, fontFamily: DT.body,
        }}>
          {noNews
            ? 'Sin novedades de casa esta semana. Llegas igual, solo que sin nada nuevo que mirar.'
            : 'Todavía no hay detalle de sus partidas para mostrarte aquí.'}
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

      {/* Una sola acción: la profundidad vive dentro de la Carpeta. */}
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
        <FolderOpen size={15} weight="regular" /> Abrir carpeta de {name}
      </button>

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

// ── Fila de la agenda: hora, punto y nombre. Nada más. ───────────────────────
function SlotRow({ time, patient, isNext, onOpenCarpeta }: {
  time: string
  patient: Patient
  isNext: boolean
  onOpenCarpeta: () => void
}) {
  const st = deskStatus({
    sessionsThisWeek: patient.metrics.sessionsThisWeek,
    lastPlayedISO: patient.lastPlayedISO,
    totalSessions: patient.totalSessions,
  })

  return (
    <button
      type="button"
      className="td-btn td-row"
      onClick={onOpenCarpeta}
      aria-label={`Abrir carpeta de ${patient.name}, sesión de las ${time}`}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 12px', borderRadius: '13px',
        border: 'none', background: isNext ? DT.cream : 'transparent',
      }}
      onMouseEnter={e => { if (!isNext) e.currentTarget.style.background = DT.cream }}
      onMouseLeave={e => { if (!isNext) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{
        flexShrink: 0, fontSize: '14px', fontWeight: 800, color: DT.azulInk,
        fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
      }}>
        {time}
      </span>
      {/* El estado va como punto, no como frase: la frase vive en Pacientes. */}
      <span
        aria-hidden
        style={{
          width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
          background: TONE_COLOR[st.tone],
        }}
      />
      <span style={{
        flex: 1, minWidth: 0, fontSize: '14.5px', fontWeight: 700, color: DT.ink,
        fontFamily: DT.display, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {patient.name}
      </span>
      {isNext && (
        <span style={{
          flexShrink: 0, padding: '3px 9px', borderRadius: '999px',
          background: DT.azulTint, border: `1px solid ${DT.azulTintLine}`,
          color: DT.azulInk, fontSize: '10.5px', fontWeight: 800,
          letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: DT.body,
        }}>
          Próxima
        </span>
      )}
    </button>
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

  const useTimeline = isDemo && slots.length > 0

  // Próximo paciente. En demo, el de la primera cita de ejemplo. En real, el de
  // actividad más reciente; si nadie tiene datos, el primero de la lista.
  const nextPatient: Patient | null = (() => {
    if (useTimeline) return slots[0].patient
    const withPlay = patients.filter(p => p.lastPlayedISO)
    if (withPlay.length > 0) {
      return withPlay.reduce((a, b) =>
        new Date(b.lastPlayedISO!).getTime() > new Date(a.lastPlayedISO!).getTime() ? b : a)
    }
    return patients[0] ?? null
  })()

  return (
    <section
      aria-label="Hoy, la agenda y el briefing de la próxima sesión"
      style={{
        position: 'relative', padding: '18px 20px 20px',
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

      {useTimeline && (
        <div style={{ marginBottom: '4px' }}>
          {slots.map((slot, i) => (
            <div key={slot.patient.id}>
              <SlotRow
                time={slot.time}
                patient={slot.patient}
                isNext={i === 0}
                onOpenCarpeta={() => onOpen(slot.patient.id)}
              />
              {/* Solo la próxima sesión se despliega. */}
              {i === 0 && (
                <div className="td-in" style={{
                  margin: '10px 0 14px', padding: '16px',
                  borderRadius: '16px', background: DT.cream, border: `1px solid ${DT.line}`,
                }}>
                  <Briefing
                    patient={slot.patient}
                    isDemo={isDemo}
                    onOpenCarpeta={() => onOpen(slot.patient.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!useTimeline && (
        nextPatient ? (
          <Briefing
            patient={nextPatient}
            isDemo={isDemo}
            onOpenCarpeta={() => onOpen(nextPatient.id)}
          />
        ) : (
          <p style={{
            margin: 0, fontSize: '14px', fontWeight: 600, lineHeight: 1.6,
            color: DT.muted, fontFamily: DT.body,
          }}>
            Hoy no tienes sesiones cargadas.
          </p>
        )
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
