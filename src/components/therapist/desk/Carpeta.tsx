// La Carpeta — detalle de un paciente, ordenado en cuatro secciones.
//
// Fijo arriba: volver al escritorio y la identidad del paciente (avatar, nombre,
// edad, condición). Debajo, una sub-barra de burbuja igual que la de módulos
// pero en talla chica, para que se lea como subordinada y no compita.
//
//   Resumen  cómo le fue: la semana elegida, día a día, y por área.
//   Plan     enfocar el mundo (áreas, nota, juegos, énfasis) y el nivel.
//   Notas    notas clínicas privadas, con fecha.
//   Familia  el comentario que se publica a la familia.
//   Informe  el documento del período, para la familia o para el entorno.
//
// Un dato, un lugar: lo que jugó vive solo en Resumen y el nivel solo en Plan.
// El terapeuta SÍ ve números; sobrios, sin claims y sin datos inventados.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CaretLeft, CaretRight, PaperPlaneTilt, MapPin, ChartLine, Target, NotePencil,
  House, Plus, FileText, GameController, Timer, Confetti, ChartPieSlice,
} from '@phosphor-icons/react'
import { type Patient } from '../../../data/patients'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { getWeekCode } from '../../../lib/utils'
import type { DbSession } from '../../../lib/types'
import { DT, FIELD } from './deskTokens'
import { Card, SectionTitle, FieldLabel, StatTile, Chip, Avatar, EmptyState, Button, IconButton } from './deskUI'
import { usePorArea } from './usePorArea'
import EnfocarMundo from './EnfocarMundo'
import Objetivos from './Objetivos'
import AjusteDificultad from './AjusteDificultad'
import ModuleTabs, { type ModuleDef } from './ModuleTabs'
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

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
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
// Sólo identidad: quién es. Nada de agenda (es de la Agenda), nada de
// resultados (del Resumen) y nada de nivel (del Plan, donde se ajusta).
function IdentidadCard({ patient }: { patient: Patient }) {
  return (
    <div style={{
      boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap',
      background: DT.white, border: `1px solid ${DT.line}`,
      borderRadius: DT.radius, boxShadow: DT.shadow, padding: '18px 20px',
    }}>
      <Avatar name={patient.name} size={54} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <h2 style={{
          margin: '0 0 8px', fontSize: '23px', fontWeight: 600, color: DT.ink,
          fontFamily: DT.display, lineHeight: 1.1,
        }}>
          {patient.name}
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Chip>{patient.age} años</Chip>
          {patient.condition && <Chip>{patient.condition}</Chip>}
        </div>
      </div>
    </div>
  )
}

export default function Carpeta({ patient: p, supabasePatientId, onBack }: Props) {
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
  // Las áreas de foco marcadas ahora mismo, arriba porque las comparten dos
  // tarjetas del Plan: donde se eligen y donde se les fija un objetivo.
  const [planAreas, setPlanAreas] = useState<string[]>([])
  const [section, setSection] = useState('resumen')
  // Abrir una carpeta o cambiar de sección empieza arriba del todo, no donde
  // se hubiera quedado el scroll de la pantalla anterior.
  const rootRef = useRef<HTMLDivElement>(null)

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

  // Escala fija de al menos 3 partidas: con un máximo de 1, un día con una sola
  // partida llenaba la barra entera y parecía un día lleno.
  const maxSessions = Math.max(3, ...dayBars.map(d => d.sessions))

  // Por área: de Supabase en cuenta real, del detalle por ejercicio en la demo.
  const areas = useMemo(
    () => (isReal ? porArea.distribution.map(a => ({ slug: a.slug, label: a.label, pct: a.pct })) : localAreas(p.history ?? [])),
    [isReal, porArea.distribution, p.history],
  )
  // Dónde jugó la semana que se mira (en la demo, del detalle por partida).
  // En cuenta real el lugar no viene por semana, así que va el total.
  const places = useMemo(() => {
    if (isReal) return porArea.placesVisited
    const inWeek = (p.history ?? []).filter(s => s.date >= weekRange.from && s.date <= weekRange.to)
    return localPlaces(inWeek)
  }, [isReal, porArea.placesVisited, p.history, weekRange])

  const firstName = p.name.split(' ')[0]
  const therapistDisplayName = profile?.full_name ?? 'Terapeuta'

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
      <Button size="sm" Icon={CaretLeft} onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        Escritorio
      </Button>

      {/* ── Identidad: fija, fuera de las secciones ───────────────── */}
      <IdentidadCard patient={p} />

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
                size="lg"
                right={
                  <>
                    <IconButton Icon={CaretLeft} label="Semana anterior" onClick={() => setWeekOffset(o => o - 1)} />
                    <IconButton
                      Icon={CaretRight}
                      label="Semana siguiente"
                      onClick={() => setWeekOffset(o => Math.min(0, o + 1))}
                      disabled={weekOffset >= 0}
                    />
                  </>
                }
              >
                Cómo le fue
              </SectionTitle>

              {/* La semana que se está mirando, dicha una vez. */}
              <FieldLabel>{weekTitle}</FieldLabel>

              {/* Si esa semana no jugó, se dice una vez y ya. Sin tiles en
                  guiones ni un gráfico de rieles vacíos diciendo lo mismo. */}
              {week.sessions === 0 ? (
                <EmptyState Icon={GameController} title="Esa semana no jugó" compact />
              ) : (
                <>

              {/* Lo que el gráfico no dice. Las partidas se cuentan abajo, día a
                  día. Un número que no se midió no se pinta: ni guiones ni ceros. */}
              {((week.minutes ?? 0) > 0 || week.accuracy != null) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(126px, 1fr))', gap: '10px' }}>
                  {(week.minutes ?? 0) > 0 && <StatTile Icon={Timer} value={`${week.minutes}`} label="minutos jugados" />}
                  {week.accuracy != null && <StatTile Icon={Confetti} value={`${week.accuracy}%`} label="aciertos" />}
                </div>
              )}

              {/* Barras por día de la semana elegida: un solo gráfico, el que
                  acompaña al navegador. */}
              <div style={{
                marginTop: '20px', padding: '15px 16px 13px', borderRadius: DT.radiusSm,
                background: DT.cream, border: `1px solid ${DT.line}`,
              }}>
                <FieldLabel>Partidas por día</FieldLabel>
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
                          como un día sin partidas, no como un hueco. */}
                      <div
                        title={`${d.label}: ${d.sessions} ${d.sessions === 1 ? 'partida' : 'partidas'}`}
                        style={{
                          width: '100%', height: '64px', borderRadius: '9px', background: DT.arenaDeep,
                          border: `1px solid ${d.isToday ? DT.azulTintLine : 'transparent'}`,
                          boxSizing: 'border-box',
                          display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
                          opacity: d.isFuture ? 0.45 : 1,
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: `${d.sessions > 0 ? Math.max(14, (d.sessions / maxSessions) * 100) : 0}%`,
                          borderRadius: '8px',
                          background: d.isToday ? DT.azulInk : DT.azul,
                          transition: 'height 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: d.isToday ? 800 : 600,
                        color: d.isToday ? DT.azulInk : DT.muted, fontFamily: DT.body,
                      }}>
                        {d.initial}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Línea base: las barras se apoyan en algo, no flotan sueltas. */}
                <div aria-hidden style={{ height: '1px', marginTop: '7px', background: DT.line }} />
              </div>

              {/* Dónde jugó esa semana. */}
              {places.length > 0 && (
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {places.map(place => (
                    <Chip key={place} Icon={MapPin}>{place}</Chip>
                  ))}
                </div>
              )}

                </>
              )}
            </Card>

            {/* Por área: en cuenta real de Supabase, en la demo del detalle
                por ejercicio del historial. Nunca una ilustración. */}
            <Card>
              <SectionTitle Icon={ChartPieSlice}>Por área</SectionTitle>
              {isReal && porArea.loading ? (
                <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando…</p>
              ) : areas.length === 0 ? (
                <EmptyState Icon={ChartPieSlice} title="Todavía sin partidas por área" compact />
              ) : (
                // Todas las barras en azul: aquí el color no codifica nada, así
                // que ponerle uno distinto a cada área sería ruido.
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {areas.map(a => (
                    <div key={a.slug}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>{a.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: DT.azulInk, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums' }}>{a.pct}%</span>
                      </div>
                      <div style={{ height: '9px', background: DT.arenaDeep, borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${a.pct}%`, background: DT.azul, borderRadius: '999px', transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
                      </div>
                    </div>
                  ))}
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
          <EnfocarMundo
            childName={firstName}
            isReal={isReal}
            storeId={(isReal ? supabasePatientId : p.id) as string}
            onAreasChange={setPlanAreas}
          />
          {/* Debajo de las áreas de foco: a dónde quiere llegar con cada una,
              de qué dato parte y qué ha pasado desde entonces. */}
          <Objetivos
            isReal={isReal}
            storeId={(isReal ? supabasePatientId : p.id) as string}
            focusAreas={planAreas}
            demoHistory={p.history ?? []}
          />
          <AjusteDificultad
            isReal={isReal}
            storeId={(isReal ? supabasePatientId : p.id) as string}
            userId={user?.id}
            initial={p.level ?? null}
          />
        </div>
      </div>

      {/* ── Notas clínicas (privadas) ─────────────────────────────── */}
      {/* Bloc de notas de verdad, con o sin cuenta: escribes, se guarda con su
          fecha y se apila con las anteriores. */}
      <div id={panelId('notas')} role="tabpanel" aria-labelledby="tab-notas" hidden={section !== 'notas'}>
        <Card edge="mostaza">
          <SectionTitle Icon={NotePencil}>Notas clínicas, privadas</SectionTitle>
          <textarea
            value={draftNote}
            onChange={e => setDraftNote(e.target.value)}
            placeholder={`Qué observaste de ${firstName}.`}
            aria-label="Nueva nota clínica"
            rows={4}
            style={{ ...FIELD, resize: 'vertical', maxHeight: '220px', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              Icon={Plus}
              onClick={handleAddNote}
              disabled={!draftNote.trim() || savingClinical || !notesLoaded}
            >
              {savingClinical ? 'Guardando…' : 'Guardar nota'}
            </Button>
          </div>

          {/* Las notas guardadas, en crema sobre la tarjeta blanca: se leen como
              fichas y no como otra tarjeta encima. */}
          {notesLoaded && notes.length === 0 && (
            <div style={{ marginTop: '18px' }}>
              <EmptyState Icon={NotePencil} title="Aún no hay notas" compact>
                Se guardan con su fecha. La familia no las ve.
              </EmptyState>
            </div>
          )}
          {notes.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FieldLabel style={{ marginBottom: 0 }}>Guardadas</FieldLabel>
              {notes.map(n => (
                <div key={n.id} style={{
                  background: DT.cream, border: `1px solid ${DT.lineSoft}`, borderRadius: DT.radiusSm,
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
          <SectionTitle Icon={House}>Comentario para la familia</SectionTitle>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => {
              // Enter publica, como en el composer del copiloto. Mayúsculas y
              // Enter salta de línea.
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePublish() }
            }}
            placeholder="Tu observación de la semana para la familia."
            aria-label="Comentario para la familia"
            rows={4}
            style={{ ...FIELD, resize: 'vertical', maxHeight: '220px', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: DT.muted, fontFamily: DT.body }}>
              Enter publica. Mayúsculas y Enter, salto de línea.
            </span>
            <Button variant="primary" Icon={PaperPlaneTilt} onClick={handlePublish} disabled={!comment.trim()}>
              Publicar
            </Button>
          </div>
          {published && (
            <div style={{
              marginTop: '16px', padding: '13px 16px', background: DT.azulTint,
              border: `1px solid ${DT.azulTintLine}`, borderRadius: DT.radiusSm,
            }}>
              <p style={{
                margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '12px', fontWeight: 800, color: DT.azulInk, fontFamily: DT.body,
              }}>
                <House size={14} weight="regular" /> Lo que ve la familia · {therapistDisplayName}
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
