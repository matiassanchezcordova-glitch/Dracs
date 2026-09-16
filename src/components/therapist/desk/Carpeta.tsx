// La Carpeta — detalle de un paciente, ordenado en cuatro secciones.
//
// Fijo arriba: volver al escritorio y la identidad del paciente (avatar, nombre,
// edad, condición, nivel). Debajo, una sub-barra de burbuja igual que la de
// módulos pero en talla chica, para que se lea como subordinada y no compita.
//
//   Resumen  qué jugó esta semana, evolución, últimas partidas y por área.
//   Plan     enfocar el mundo (áreas, nota, juegos, énfasis) y dificultad.
//   Notas    notas clínicas privadas, solo con cuenta real.
//   Familia  el comentario que se publica a la familia.
//
// Un dato, un lugar: lo que jugó vive solo en Resumen. El terapeuta SÍ ve
// números; sobrios, legibles, sin claims clínicos y sin datos inventados.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CaretLeft, CaretRight, PaperPlaneTilt, MapPin, ChartLine, Target, NotePencil,
  House, Plus, FileText, GameController, Timer, Confetti, PuzzlePiece, Flame,
  CalendarBlank, ChartPieSlice,
} from '@phosphor-icons/react'
import { type Patient } from '../../../data/patients'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { getWeekCode } from '../../../lib/utils'
import type { DbSession } from '../../../lib/types'
import { ACCENT, DT, type Accent } from './deskTokens'
import { Card, SectionTitle, FieldLabel, StatTile, Chip, Avatar, DragonWatermark, EmptyState } from './deskUI'
import { deskStatus, type StatusTone } from './patientStatus'
import { proximaCita } from './agenda'
import { usePorArea } from './usePorArea'
import EnfocarMundo from './EnfocarMundo'
import AjusteDificultad from './AjusteDificultad'
import ModuleTabs, { type ModuleDef } from './ModuleTabs'
import type { ChildLevel } from './childLevel'
import {
  loadClinicalNotes, saveClinicalNotes, newNoteId, noteDate, type ClinicalNote,
} from './clinicalNotes'
import Informe from './Informe'
import {
  dayLabel, fromDbSessions, fromLocalHistory, localIso, parseDay, statsFor,
  type DayRange, type InformeSession,
} from './informeData'
import { localAreas, localPlaces } from '../../../data/demoAreas'
import { useScrollTop } from './useScrollTop'

interface Props {
  patient: Patient
  supabasePatientId?: string
  // En la demo, los ids de todas las carpetas: con ellos se sabe cuándo cae la
  // próxima cita de este niño. En cuenta real la agenda todavía no existe, así
  // que llega vacío y esa línea no se dibuja.
  allPatientIds?: string[]
  onBack: () => void
}

// Las cuatro secciones de la Carpeta. La profundidad del paciente vive aquí
// dentro, no en el escritorio.
const SECTIONS: ModuleDef[] = [
  { id: 'resumen', label: 'Resumen', Icon: ChartLine },
  { id: 'plan', label: 'Plan', Icon: Target },
  { id: 'notas', label: 'Notas', Icon: NotePencil },
  { id: 'familia', label: 'Familia', Icon: House },
  { id: 'informe', label: 'Informe', Icon: FileText },
]

const panelId = (id: string) => `carpeta-panel-${id}`

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function shortDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date()
  return Number.isNaN(d.getTime()) ? '' : `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

const DAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DAY_NAMES = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

// "mié 10 sep", para la tabla de partidas.
function longDayLabel(day: string): string {
  const d = parseDay(day)
  return `${DAY_NAMES[(d.getDay() + 6) % 7]} ${dayLabel(day)}`
}

function navBtn(enabled: boolean): React.CSSProperties {
  return {
    width: '34px', height: '34px', borderRadius: '11px', flexShrink: 0,
    border: `1px solid ${DT.line}`, background: DT.cream,
    color: enabled ? DT.ink : DT.faint,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.5,
    boxShadow: enabled ? DT.shadowSoft : 'none',
  }
}

// Los tres acentos rotan en la lista de áreas, en este orden.
const AREA_ACCENTS: Accent[] = ['azul', 'mostaza', 'arena']

// El acento visual de la carpeta sale del mismo tono que usa el escritorio.
const TONE_ACCENT: Record<StatusTone, Accent> = {
  played: 'azul',
  attention: 'mostaza',
  idle: 'arena',
}

// "mar 16 sep a las 12:15", para la línea de estado de la identidad.
function citaLabel(cita: { day: string; time: string } | null): string | null {
  if (!cita) return null
  const d = parseDay(cita.day)
  return `${DAY_NAMES[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} a las ${cita.time}`
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function useCountUp(target: number, duration = 700) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    // El primer frame (progreso 0) ya fija el valor a 0; no reseteamos de forma
    // síncrona en el cuerpo del efecto (regla react-hooks/set-state-in-effect).
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return val
}

function Toast({ message }: { message: string }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: DT.ink, color: DT.cream, padding: '12px 22px', borderRadius: '999px',
      fontSize: '14px', fontWeight: 700, fontFamily: DT.body, zIndex: 100, whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(51,48,42,0.25)',
    }}>
      {message}
    </div>
  )
}

// ── La tarjeta de identidad ──────────────────────────────────────────────────
// Alta como lo que tiene que decir y ni un píxel más: avatar con el aro de su
// estado, nombre, chips de dato y una línea compacta con lo que hace falta
// saber antes de abrir nada. La filigrana del dragón pone la marca en la
// esquina, al 7%. Antes era un rectángulo blanco enorme con un nombre arriba a
// la izquierda y un vacío gigante debajo.
function IdentidadCard({ patient, level, accent, estado, proxima }: {
  patient: Patient
  level: ChildLevel | null
  accent: Accent
  estado: string
  proxima: string | null
}) {
  const a = ACCENT[accent]
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
      background: DT.white, border: `1px solid ${DT.line}`, borderLeft: `3px solid ${a.solid}`,
      borderRadius: DT.radius, boxShadow: DT.shadow, padding: '18px 20px',
    }}>
      {/* Tinte de marca muy suave detrás del nombre, para que la tarjeta no sea
          un plano blanco. */}
      <span aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(420px 150px at 0% 0%, ${a.tint}, transparent 72%)`,
        opacity: 0.85,
      }} />
      <DragonWatermark size={140} opacity={0.07} bottom="-34px" right="-22px" rotate={12} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <Avatar name={patient.name} size={58} accent={accent} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{
            margin: '0 0 8px', fontSize: '23px', fontWeight: 600, color: DT.ink,
            fontFamily: DT.display, lineHeight: 1.1,
          }}>
            {patient.name}
          </h2>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Chip accent="arena">{patient.age} años</Chip>
            {patient.condition && <Chip accent="arena">{patient.condition}</Chip>}
            {level && <Chip accent="azul" Icon={Target}>Nivel {level.min} a {level.max}</Chip>}
          </div>
        </div>
      </div>

      {/* Línea de estado: una sola fila, lo justo para saber cómo llega. */}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap',
        marginTop: '14px', paddingTop: '13px', borderTop: `1px solid ${DT.lineSoft}`,
        fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body,
      }}>
        <span aria-hidden style={{
          width: '8px', height: '8px', borderRadius: '50%', background: a.solid, flexShrink: 0,
        }} />
        <span>{estado}</span>
        {proxima && (
          <>
            <span aria-hidden style={{ color: DT.faint }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: DT.muted }}>
              <CalendarBlank size={14} weight="regular" color={DT.azulInk} />
              Próxima sesión: {proxima}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default function Carpeta({ patient: p, supabasePatientId, allPatientIds = [], onBack }: Props) {
  const { user, profile } = useAuth()
  const isReal = !!(user && supabasePatientId)

  const [sbSessions, setSbSessions] = useState<DbSession[]>([])
  // En demo (no real) ya está "cargado"; en real, false hasta traer datos. La
  // Carpeta se monta fresca por paciente, así que no hace falta resetear en el
  // efecto (evita setState síncrono en el cuerpo del efecto).
  const [sbLoaded, setSbLoaded] = useState(!isReal)
  // Notas: varias, cada una con su fecha. Se guardan siempre, con cuenta o sin
  // ella; lo único que cambia es dónde (base o navegador).
  const [notes, setNotes] = useState<ClinicalNote[]>([])
  const [notesLoaded, setNotesLoaded] = useState(false)
  const [draftNote, setDraftNote] = useState('')
  const [savingClinical, setSavingClinical] = useState(false)
  const [comment, setComment] = useState('')
  // Lo ya publicado esta semana. En demo sale del navegador (lectura síncrona,
  // así que va en el estado inicial); en real lo trae el efecto de abajo.
  const [published, setPublished] = useState<{ text: string; date: string } | null>(() => {
    if (isReal) return null
    try {
      const raw = localStorage.getItem(`dracs_comment_${slugify(p.name)}_${getWeekCode()}`)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { texto?: string; fecha?: string }
      return parsed.texto ? { text: parsed.texto, date: parsed.fecha ?? '' } : null
    } catch {
      return null
    }
  })
  const [toast, setToast] = useState<string | null>(null)
  const [section, setSection] = useState('resumen')
  // Abrir una carpeta o cambiar de sección empieza arriba del todo, no donde
  // se hubiera quedado el scroll de la pantalla anterior.
  const rootRef = useRef<HTMLDivElement>(null)
  // El nivel vive aquí y no en la tarjeta de identidad: al guardarlo en Plan, el
  // chip de arriba tiene que decir lo mismo sin recargar la Carpeta.
  const [level, setLevel] = useState<ChildLevel | null>(p.level ?? null)

  const porArea = usePorArea(isReal ? supabasePatientId : null)

  useEffect(() => {
    if (!isReal) return
    let cancelled = false
    supabase.from('sessions').select('*').eq('child_id', supabasePatientId!)
      .order('started_at', { ascending: false }).limit(50)
      .then(sessRes => {
        if (cancelled) return
        setSbSessions((sessRes.data ?? []) as DbSession[])
        setSbLoaded(true)
      })
    return () => { cancelled = true }
  }, [isReal, supabasePatientId])

  const notesStoreId = (isReal ? supabasePatientId : p.id) as string

  // En cuenta real el comentario de la semana llega de la base, en asíncrono.
  useEffect(() => {
    if (!isReal) return
    let cancelled = false
    supabase.from('therapist_comments')
      .select('comment_text, created_at')
      .eq('patient_id', supabasePatientId!)
      .eq('week_code', getWeekCode())
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data?.comment_text) return
        setPublished({ text: data.comment_text as string, date: shortDate(data.created_at as string | null) })
      })
    return () => { cancelled = true }
  }, [isReal, supabasePatientId])

  useEffect(() => {
    let cancelled = false
    loadClinicalNotes(isReal, notesStoreId).then(list => {
      if (cancelled) return
      setNotes(list)
      setNotesLoaded(true)
    })
    return () => { cancelled = true }
  }, [isReal, notesStoreId])

  // ── Las partidas, normalizadas ────────────────────────────────────────────
  // Una sola forma para los dos modos: Supabase en cuenta real, historial de la
  // carpeta en la demo. Todo lo de abajo (semana elegida, barras, tabla) sale
  // de aquí, así que ningún número puede contradecir a otro.
  const allSessions = useMemo<InformeSession[]>(
    () => (isReal ? (sbLoaded ? fromDbSessions(sbSessions) : []) : fromLocalHistory(p.history ?? [])),
    [isReal, sbLoaded, sbSessions, p.history],
  )

  // Semana elegida. 0 es la semana en curso; hacia atrás, negativo.
  const [weekOffset, setWeekOffset] = useState(0)

  const weekRange = useMemo<DayRange>(() => {
    const monday = new Date()
    const dow = monday.getDay()
    monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { from: localIso(monday), to: localIso(sunday) }
  }, [weekOffset])

  const week = useMemo(() => statsFor(allSessions, weekRange), [allSessions, weekRange])

  const weekTitle = weekOffset === 0
    ? `Esta semana · ${dayLabel(weekRange.from)} a ${dayLabel(weekRange.to)}`
    : weekOffset === -1
      ? `Semana pasada · ${dayLabel(weekRange.from)} a ${dayLabel(weekRange.to)}`
      : `${dayLabel(weekRange.from)} a ${dayLabel(weekRange.to)}`

  // Partidas por día de la semana elegida, de lunes a domingo.
  const dayBars = useMemo(() => {
    const monday = parseDay(weekRange.from)
    const todayIso = localIso(new Date())
    return DAY_INITIALS.map((initial, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const iso = localIso(d)
      const list = allSessions.filter(s => s.day === iso)
      return {
        iso,
        initial,
        label: dayLabel(iso),
        sessions: list.length,
        minutes: list.reduce((a, s) => a + (s.minutes ?? 0), 0),
        isToday: iso === todayIso,
        isFuture: iso > todayIso,
      }
    })
  }, [allSessions, weekRange])

  const maxSessions = Math.max(1, ...dayBars.map(d => d.sessions))

  // Las partidas de la semana elegida, de la más reciente a la más antigua.
  const weekSessions = useMemo(
    () => allSessions
      .filter(s => s.day >= weekRange.from && s.day <= weekRange.to)
      .sort((a, b) => (a.day < b.day ? 1 : -1)),
    [allSessions, weekRange],
  )

  // Racha y lugares: datos de ahora, no de la semana que se esté mirando.
  const streak = useMemo(() => {
    const played = new Set(allSessions.map(s => s.day))
    const cursor = new Date()
    if (!played.has(localIso(cursor))) cursor.setDate(cursor.getDate() - 1)
    let n = 0
    while (played.has(localIso(cursor))) { n++; cursor.setDate(cursor.getDate() - 1) }
    return n
  }, [allSessions])

  // Por área: de Supabase en cuenta real, del detalle por ejercicio en la demo.
  const areas = useMemo(
    () => (isReal ? porArea.distribution.map(a => ({ slug: a.slug, label: a.label, pct: a.pct })) : localAreas(p.history ?? [])),
    [isReal, porArea.distribution, p.history],
  )
  const places = isReal ? porArea.placesVisited : localPlaces(p.history ?? [])

  const firstName = p.name.split(' ')[0]
  const therapistDisplayName = profile?.full_name ?? 'Terapeuta'

  // Identidad: el estado humano y el acento salen de los mismos datos que en el
  // escritorio, así que la carpeta no puede decir otra cosa que su tarjeta.
  const estado = deskStatus({
    sessionsThisWeek: p.metrics.sessionsThisWeek,
    lastPlayedISO: p.lastPlayedISO,
    totalSessions: p.totalSessions,
  })
  const toneAccent = TONE_ACCENT[estado.tone]
  const proximaLabel = useMemo(
    () => (allPatientIds.length > 0 ? citaLabel(proximaCita(p.id, allPatientIds)) : null),
    [p.id, allPatientIds],
  )

  const kSessions = useCountUp(week.sessions)

  async function handleAddNote() {
    const text = draftNote.trim()
    if (!text || savingClinical) return
    const next = [{ id: newNoteId(), text, createdAt: new Date().toISOString() }, ...notes]
    setSavingClinical(true)
    const res = await saveClinicalNotes(isReal, notesStoreId, next)
    setSavingClinical(false)
    if (!res.ok) {
      setToast('No se pudo guardar la nota. Prueba otra vez.')
      setTimeout(() => setToast(null), 3000)
      return
    }
    setNotes(next)
    setDraftNote('')
    setToast('Nota guardada.')
    setTimeout(() => setToast(null), 3000)
  }

  async function handlePublish() {
    if (!comment.trim()) return
    const date = shortDate()
    if (isReal) {
      const { error } = await supabase.from('therapist_comments').upsert({
        therapist_id: user!.id, patient_id: supabasePatientId!, week_code: getWeekCode(), comment_text: comment.trim(),
      }, { onConflict: 'therapist_id,patient_id,week_code' })
      if (error) { setToast('No se pudo publicar. Prueba otra vez.'); setTimeout(() => setToast(null), 3000); return }
    } else {
      const key = `dracs_comment_${slugify(p.name)}_${getWeekCode()}`
      localStorage.setItem(key, JSON.stringify({ texto: comment.trim(), fecha: date, terapeuta: therapistDisplayName }))
    }
    setPublished({ text: comment.trim(), date })
    setComment('')
    setToast('Listo, tu comentario ya está disponible para la familia.')
    setTimeout(() => setToast(null), 3000)
  }

  useScrollTop(section, rootRef)

  return (
    <div ref={rootRef} style={{
      display: 'flex', flexDirection: 'column', gap: '18px',
      padding: '20px 20px 40px', maxWidth: '760px', margin: '0 auto', width: '100%',
      fontFamily: DT.body, boxSizing: 'border-box',
    }}>
      {toast && <Toast message={toast} />}

      {/* Volver al escritorio */}
      <button
        onClick={onBack}
        className="dk-press dk-focus"
        style={{
          alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: DT.white, border: `1px solid ${DT.line}`, cursor: 'pointer',
          height: '34px', padding: '0 14px 0 10px', borderRadius: '999px',
          color: DT.azulInk, fontSize: '13.5px', fontWeight: 700, fontFamily: DT.body,
          boxShadow: DT.shadowSoft,
        }}
      >
        <CaretLeft size={15} weight="regular" /> Escritorio
      </button>

      {/* ── Identidad: fija, fuera de las secciones ───────────────── */}
      <IdentidadCard
        patient={p}
        level={level}
        accent={toneAccent}
        estado={estado.text}
        proxima={proximaLabel}
      />

      {/* ── Sub-barra de secciones ────────────────────────────────── */}
      <ModuleTabs
        modules={SECTIONS}
        active={section}
        onChange={setSection}
        panelId={panelId}
        size="sm"
        label="Secciones de la carpeta"
      />

      {/* ── Resumen ───────────────────────────────────────────────── */}
      {/* Se monta solo cuando está activo: el gráfico necesita medir su ancho
          de verdad, y dentro de un panel oculto mediría 0. */}
      <div id={panelId('resumen')} role="tabpanel" aria-labelledby="tab-resumen" hidden={section !== 'resumen'}>
        {section === 'resumen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Card>
              {/* Navegador de semanas: flechas y el rango de la semana que se
                  está mirando. Todo lo de esta tarjeta habla de ESA semana. */}
              <SectionTitle
                Icon={ChartLine}
                accent="azul"
                size="lg"
                hint={weekTitle}
                right={
                  <>
                    <button type="button" className="dk-press dk-focus" onClick={() => setWeekOffset(o => o - 1)} aria-label="Semana anterior" style={navBtn(true)}>
                      <CaretLeft size={16} weight="regular" />
                    </button>
                    <button
                      type="button"
                      className="dk-press dk-focus"
                      onClick={() => setWeekOffset(o => Math.min(0, o + 1))}
                      disabled={weekOffset >= 0}
                      aria-label="Semana siguiente"
                      style={navBtn(weekOffset < 0)}
                    >
                      <CaretRight size={16} weight="regular" />
                    </button>
                  </>
                }
              >
                Qué jugó
              </SectionTitle>

              {/* Cuatro métricas, cada una con su ícono y su filo de color. No es
                  un muro de KPIs: son las cuatro que se miran de verdad. */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(126px, 1fr))', gap: '10px' }}>
                <StatTile Icon={GameController} accent="azul" value={String(kSessions)} label={week.sessions === 1 ? 'partida' : 'partidas'} />
                <StatTile Icon={Timer} accent="mostaza" value={(week.minutes ?? 0) > 0 ? `${week.minutes}` : '—'} label="minutos" />
                <StatTile Icon={PuzzlePiece} accent="arena" value={week.sessions ? String(week.exercises) : '—'} label="juegos completados" />
                <StatTile Icon={Confetti} accent="amarillo" value={week.accuracy == null ? '—' : `${week.accuracy}%`} label="aciertos" />
              </div>

              {/* Barras por día de la semana elegida: un solo gráfico, el que
                  acompaña al navegador. */}
              <div style={{
                marginTop: '20px', padding: '15px 16px 13px', borderRadius: DT.radiusSm,
                background: DT.cream, border: `1px solid ${DT.line}`,
              }}>
                <FieldLabel accent="azul">Partidas por día</FieldLabel>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                  {dayBars.map(d => (
                    <div key={d.iso} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        height: '15px', fontSize: '11px', fontWeight: 800,
                        color: d.sessions > 0 ? (d.isToday ? DT.azulInk : DT.ink) : DT.faint,
                        fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
                      }}>
                        {d.sessions > 0 ? d.sessions : ''}
                      </span>
                      {/* El riel arena se ve siempre: un día sin partidas se lee
                          como un día sin partidas, no como un hueco. El de hoy
                          va en amarillo, que es el pop de la marca. */}
                      <div
                        title={`${d.label}: ${d.sessions} ${d.sessions === 1 ? 'partida' : 'partidas'}`}
                        style={{
                          width: '100%', height: '64px', borderRadius: '9px', background: DT.arenaDeep,
                          border: `1px solid ${d.isToday ? DT.yellowTintLine : 'transparent'}`,
                          boxSizing: 'border-box',
                          display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
                          opacity: d.isFuture ? 0.45 : 1,
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: `${d.sessions > 0 ? Math.max(14, (d.sessions / maxSessions) * 100) : 0}%`,
                          borderRadius: '8px',
                          background: d.isToday
                            ? `linear-gradient(180deg, ${DT.yellow} 0%, ${DT.mostaza} 100%)`
                            : `linear-gradient(180deg, ${DT.azul} 0%, ${DT.azulInk} 100%)`,
                          transition: 'height 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: d.isToday ? 800 : 600,
                        color: d.isToday ? DT.mostazaInk : DT.muted, fontFamily: DT.body,
                      }}>
                        {d.initial}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Línea base: las barras se apoyan en algo, no flotan sueltas. */}
                <div aria-hidden style={{ height: '1px', marginTop: '7px', background: DT.line }} />
              </div>

              {/* Racha y lugares hablan de ahora, no de la semana que se mira. */}
              {weekOffset === 0 && (streak > 0 || places.length > 0) && (
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {streak > 0 && (
                    <Chip accent="amarillo" Icon={Flame}>
                      Racha de {streak} {streak === 1 ? 'día' : 'días'}
                    </Chip>
                  )}
                  {places.map(place => (
                    <Chip key={place} accent="azul" Icon={MapPin}>{place}</Chip>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '22px' }}>
                <FieldLabel accent="mostaza">Sus partidas</FieldLabel>
              </div>
              {weekSessions.length === 0 ? (
                <EmptyState title="Esa semana no jugó" accent="arena" compact>
                  No hay ninguna partida entre {dayLabel(weekRange.from)} y {dayLabel(weekRange.to)}.
                  Prueba con otra semana usando las flechas de arriba.
                </EmptyState>
              ) : (
                <div className="dk-scroll" style={{ borderRadius: DT.radiusSm, border: `1px solid ${DT.line}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', minWidth: '360px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: DT.cream }}>
                        {['Fecha', 'Duración', 'Juegos', 'Aciertos'].map((c, i) => (
                          <th key={c} style={{ textAlign: i === 0 ? 'left' : 'center', fontSize: '11.5px', fontWeight: 800, color: DT.topoInk, fontFamily: DT.body, padding: '9px 10px', borderBottom: `1px solid ${DT.line}` }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weekSessions.map((s, i) => (
                        <tr key={`${s.day}-${i}`} style={{ background: i % 2 === 1 ? DT.cream : DT.white }}>
                          <td style={{ padding: '10px', fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>{longDayLabel(s.day)}</td>
                          <td style={{ padding: '10px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{s.minutes ? `${s.minutes} min` : '—'}</td>
                          <td style={{ padding: '10px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{s.exercises}</td>
                          <td style={{ padding: '10px', fontSize: '13px', fontWeight: 800, color: DT.azulInk, fontFamily: DT.body, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                            {s.exercises > 0 ? `${Math.round((s.correct / s.exercises) * 100)}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Por área: en cuenta real de Supabase, en la demo del detalle
                por ejercicio del historial. Nunca una ilustración. */}
            <Card>
              <SectionTitle Icon={ChartPieSlice} accent="mostaza">Por área</SectionTitle>
              {isReal && porArea.loading ? (
                <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando…</p>
              ) : areas.length === 0 ? (
                <EmptyState title="Todavía sin áreas" accent="mostaza" compact>
                  Aún no hay juegos suyos clasificados por área. Aparece aquí en cuanto los haya.
                </EmptyState>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {areas.map((a, i) => {
                    // El color rota entre los tres acentos: la lista se lee de un
                    // vistazo y no es un muro de barras del mismo azul.
                    const tone = ACCENT[AREA_ACCENTS[i % AREA_ACCENTS.length]]
                    return (
                      <div key={a.slug}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>{a.label}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: tone.ink, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums' }}>{a.pct}%</span>
                        </div>
                        <div style={{ height: '9px', background: DT.arenaDeep, borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${a.pct}%`, background: tone.solid, borderRadius: '999px', transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ── Plan ──────────────────────────────────────────────────── */}
      {/* Plan, Notas y Familia se quedan montados y solo se ocultan: así una
          nota a medio escribir no se pierde al mirar otra sección. */}
      <div id={panelId('plan')} role="tabpanel" aria-labelledby="tab-plan" hidden={section !== 'plan'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <EnfocarMundo childName={firstName} isReal={isReal} storeId={(isReal ? supabasePatientId : p.id) as string} />
          <AjusteDificultad
            isReal={isReal}
            storeId={(isReal ? supabasePatientId : p.id) as string}
            userId={user?.id}
            initial={p.level ?? null}
            onLevel={setLevel}
          />
        </div>
      </div>

      {/* ── Notas clínicas (privadas) ─────────────────────────────── */}
      {/* Bloc de notas de verdad, con o sin cuenta: escribes, se guarda con su
          fecha y se apila con las anteriores. */}
      <div id={panelId('notas')} role="tabpanel" aria-labelledby="tab-notas" hidden={section !== 'notas'}>
        <Card edge="mostaza">
          <SectionTitle Icon={NotePencil} accent="mostaza" hint="Solo para ti, la familia no las ve.">
            Notas clínicas
          </SectionTitle>
          <textarea
            value={draftNote}
            onChange={e => setDraftNote(e.target.value)}
            placeholder={`Qué observaste hoy de ${firstName}, para tu propio registro.`}
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
              border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink, fontSize: '14px',
              fontFamily: DT.body, resize: 'vertical', maxHeight: '220px', outline: 'none', lineHeight: 1.6, marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleAddNote}
              disabled={!draftNote.trim() || savingClinical || !notesLoaded}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '11px 20px', borderRadius: DT.radiusSm, border: `1px solid ${DT.mostazaTintLine}`,
                background: DT.mostazaTint, color: DT.ink, fontSize: '14px', fontWeight: 700, fontFamily: DT.display,
                cursor: !draftNote.trim() || savingClinical ? 'default' : 'pointer',
                opacity: !draftNote.trim() || savingClinical || !notesLoaded ? 0.5 : 1,
              }}
            >
              <Plus size={15} weight="regular" />
              {savingClinical ? 'Guardando…' : 'Guardar nota'}
            </button>
          </div>

          {/* Las notas guardadas. Cada una en crema sobre la tarjeta blanca,
              para que se lean como fichas y no como otra card encima. */}
          {notesLoaded && notes.length === 0 && (
            <div style={{ marginTop: '18px' }}>
              <EmptyState title="Tu bloc está en blanco" accent="mostaza" compact>
                Lo que escribas aquí se guarda con su fecha y se queda contigo.
              </EmptyState>
            </div>
          )}
          {notes.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FieldLabel accent="mostaza" style={{ marginBottom: 0 }}>
                {notes.length} {notes.length === 1 ? 'nota guardada' : 'notas guardadas'}
              </FieldLabel>
              {notes.map(n => (
                <div key={n.id} style={{
                  background: DT.cream, border: `1px solid ${DT.line}`,
                  borderLeft: `3px solid ${DT.mostazaTintLine}`, borderRadius: DT.radiusSm,
                  padding: '12px 14px',
                }}>
                  {noteDate(n.createdAt) && (
                    <p style={{
                      margin: '0 0 5px', fontSize: '11.5px', fontWeight: 800, color: DT.mostazaInk,
                      fontFamily: DT.body, fontVariantNumeric: 'tabular-nums',
                    }}>
                      {noteDate(n.createdAt)}
                    </p>
                  )}
                  <p style={{
                    margin: 0, fontSize: '14px', color: DT.ink, fontFamily: DT.body,
                    lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {n.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Comentario para la familia ────────────────────────────── */}
      <div id={panelId('familia')} role="tabpanel" aria-labelledby="tab-familia" hidden={section !== 'familia'}>
        <Card>
          <SectionTitle Icon={House} accent="azul" hint="Lo verán en su Casa, con tu nombre.">
            Comentario para la familia
          </SectionTitle>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => {
              // Enter publica, como en el composer del copiloto. Mayúsculas y
              // Enter salta de línea.
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePublish() }
            }}
            placeholder="Escribe aquí tu observación de la semana para la familia."
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
              border: `1px solid ${DT.line}`, background: DT.cream, color: DT.ink, fontSize: '14px',
              fontFamily: DT.body, resize: 'vertical', maxHeight: '220px', outline: 'none', lineHeight: 1.6, marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: DT.faint, fontFamily: DT.body }}>
              Enter publica. Mayúsculas y Enter para saltar de línea.
            </span>
            <button
              onClick={handlePublish}
              disabled={!comment.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 20px', borderRadius: DT.radiusSm,
                border: 'none', background: DT.yellow, color: DT.ink, fontSize: '14px', fontWeight: 700, fontFamily: DT.display,
                cursor: comment.trim() ? 'pointer' : 'default', opacity: comment.trim() ? 1 : 0.5,
                boxShadow: comment.trim() ? '0 1px 2px rgba(51,48,42,0.10), 0 6px 14px rgba(247,195,28,0.28)' : 'none',
              }}
            >
              <PaperPlaneTilt size={15} weight="regular" /> Publicar
            </button>
          </div>
          {published && (
            <div style={{
              marginTop: '16px', padding: '13px 16px', background: DT.azulTint,
              border: `1px solid ${DT.azulTintLine}`, borderLeft: `3px solid ${DT.azul}`,
              borderRadius: `0 ${DT.radiusSm} ${DT.radiusSm} 0`,
            }}>
              <p style={{
                margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '12px', fontWeight: 800, color: DT.azulInk, fontFamily: DT.body,
              }}>
                <House size={14} weight="regular" /> Publicado · {therapistDisplayName}
                {published.date ? ` · ${published.date}` : ''}
              </p>
              <p style={{ margin: 0, fontSize: '13.5px', color: DT.ink, fontFamily: DT.body, lineHeight: 1.6 }}>{published.text}</p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Informe del período ───────────────────────────────────── */}
      {/* Montado siempre: el borrador del comentario no se pierde al cambiar de
          sección, igual que en Notas y Familia. */}
      <div id={panelId('informe')} role="tabpanel" aria-labelledby="tab-informe" hidden={section !== 'informe'}>
        <Informe
          childName={firstName}
          fullName={p.name}
          age={p.age}
          isReal={isReal}
          storeId={notesStoreId}
          therapistId={user?.id}
          therapistName={therapistDisplayName}
          realSessions={isReal && sbLoaded ? fromDbSessions(sbSessions) : []}
          demoHistory={p.history ?? []}
          areas={areas.map(a => ({ label: a.label, pct: a.pct }))}
          onToast={msg => { setToast(msg); setTimeout(() => setToast(null), 3000) }}
        />
      </div>
    </div>
  )
}
