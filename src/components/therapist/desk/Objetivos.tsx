// Objetivos y línea base — el plan y su seguimiento (Phase 3).
//
// Aquí no vive "cómo le fue" (eso es del Resumen). Aquí vive a dónde quiere
// llegar el logopeda con este niño, de qué dato parte y qué ha pasado desde
// entonces.
//
// El reparto es estricto:
//   Dracs pone el DATO        la línea base (capturada al fijar el objetivo) y
//                             la trayectoria semanal, sin adjetivos.
//   El logopeda pone el JUICIO  escribe el objetivo con sus palabras, decide
//                             cuándo revisar y marca si está cumplido.
// Dracs no dice "mejoró" ni "cumplió", ni aquí ni en ningún sitio.
//
// Guarda de verdad y solo, sin botón: cada cambio se persiste (navegador en la
// demo, columna focus_goals en cuenta real).

import { useEffect, useMemo, useRef, useState } from 'react'
import { Flag, CalendarBlank, ChartLine, Plus, X } from '@phosphor-icons/react'
import { DT, FIELD, FIELD_LINE } from './deskTokens'
import { Button, Card, EmptyState, SectionTitle, ToggleChip } from './deskUI'
import { SKILL_LABELS, skillLabelLower } from './labels'
import { localIso, parseDay } from './informeData'
import {
  EMPTY_PLAYS, fromDemoHistory, latestWeekFor, useAreaPlays, weeklyPctFor,
  type AreaPlay, type WeekPoint,
} from './areaTrajectory'
import { loadChildFocus, saveChildGoals, type FocusGoal } from './childFocus'

// A partir de tres semanas sin revisar se dice, una vez y en voz baja.
const REVIEW_WEEKS = 3

function today(): string {
  return localIso(new Date())
}

function weeksSince(day: string): number {
  if (!day) return 0
  const then = parseDay(day).getTime()
  const now = parseDay(today()).getTime()
  if (Number.isNaN(then) || now <= then) return 0
  return Math.floor((now - then) / (7 * 86_400_000))
}

// La línea base, en texto descriptivo y sin adjetivos. Si esa área todavía no
// se jugó, se dice tal cual: no hay dato del que partir.
function baselineLabelFor(area: string, point: WeekPoint | null): string {
  const label = skillLabelLower(area)
  if (!point) return `Todavía sin partidas en ${label}`
  return `${point.pct}% de aciertos en ${label}, ${point.label.toLowerCase()}`
}

// Una etiqueta de semana al empezar una frase ("Semana del 8 sep, 68% …").
function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ── La mini trayectoria ──────────────────────────────────────────────────────
// Un solo color, el azul de la estructura. La línea base va marcada con un
// punto hueco; las demás semanas, con punto lleno. Sin ejes, sin rejilla y sin
// flechas: es una lectura, no un veredicto.
const CHART_H = 54
const PAD_X = 4   // margen lateral, en unidades de viewBox (= porcentaje)

function Sparkline({ points, area, baseWeek }: { points: WeekPoint[]; area: string; baseWeek: string }) {
  const values = points.map(p => p.pct)
  const lo0 = Math.min(...values)
  const hi0 = Math.max(...values)
  // Escala con un recorrido mínimo de 20 puntos: así una diferencia pequeña no
  // se dibuja como un salto enorme. El gráfico no dramatiza.
  const mid = (lo0 + hi0) / 2
  const span = Math.max(20, hi0 - lo0 + 8)
  const lo = Math.max(0, Math.min(mid - span / 2, 100 - span))
  const hi = Math.min(100, lo + span)

  const xOf = (i: number) => (points.length === 1 ? 50 : PAD_X + (i / (points.length - 1)) * (100 - PAD_X * 2))
  const yOf = (pct: number) => 8 + (1 - (pct - lo) / (hi - lo)) * (CHART_H - 16)

  const line = points.map((p, i) => `${xOf(i)},${yOf(p.pct)}`).join(' ')
  const spoken = points.map(p => `${p.label}, ${p.pct}%`).join('. ')

  return (
    <div>
      <div
        role="img"
        aria-label={`Aciertos por semana en ${skillLabelLower(area)}. ${spoken}.`}
        style={{ position: 'relative', height: `${CHART_H}px` }}
      >
        <svg
          width="100%" height={CHART_H} viewBox={`0 0 100 ${CHART_H}`} preserveAspectRatio="none"
          aria-hidden style={{ position: 'absolute', inset: 0, display: 'block' }}
        >
          {points.length > 1 && (
            <polyline
              points={line} fill="none" stroke={DT.azul} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {points.map((p, i) => {
          // Hueco sólo la semana de la línea base de verdad. Si se fijó el
          // objetivo sin dato previo, no hay base que marcar.
          const base = p.weekStart === baseWeek
          const size = base ? 9 : 6
          return (
            <span
              key={p.weekStart}
              title={`${p.label}: ${p.pct}% de aciertos, ${p.plays} ${p.plays === 1 ? 'ejercicio' : 'ejercicios'}`}
              style={{
                position: 'absolute', left: `${xOf(i)}%`, top: `${yOf(p.pct)}px`,
                width: `${size}px`, height: `${size}px`, borderRadius: '50%', boxSizing: 'border-box',
                transform: 'translate(-50%, -50%)',
                background: base ? DT.white : DT.azul,
                border: base ? `2px solid ${DT.azul}` : 'none',
              }}
            />
          )
        })}
      </div>
      {/* Las semanas se apoyan en algo, como las barras del Resumen. */}
      <div aria-hidden style={{ height: '1px', background: DT.lineSoft }} />
    </div>
  )
}

// ── Un objetivo ──────────────────────────────────────────────────────────────
function GoalBlock({ goal, points, onChange, onRemove }: {
  goal: FocusGoal
  points: WeekPoint[]
  onChange: (next: FocusGoal) => void
  onRemove: () => void
}) {
  const areaLabel = SKILL_LABELS[goal.area] ?? goal.area
  const last = points.length > 1 ? points[points.length - 1] : null
  const pending = weeksSince(goal.lastReviewDate)

  return (
    <div style={{
      background: DT.cream, border: `1px solid ${DT.lineSoft}`, borderRadius: DT.radiusSm,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <p style={{
          flex: 1, minWidth: '140px', margin: 0, fontSize: '15px', fontWeight: 700,
          color: DT.ink, fontFamily: DT.display,
        }}>
          {areaLabel}
        </p>
        {/* Lo marca el logopeda. Dracs no lo marca nunca solo. */}
        <ToggleChip
          on={goal.done}
          onClick={() => onChange({ ...goal, done: !goal.done, lastReviewDate: today() })}
        >
          {goal.done ? 'Cumplido' : 'Marcar cumplido'}
        </ToggleChip>
      </div>

      {/* La línea base: el dato del que se partió, tal cual estaba ese día. */}
      <p style={{
        margin: '0 0 12px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.5,
      }}>
        Línea base · {goal.baselineLabel}
      </p>

      <input
        type="text"
        value={goal.target}
        onChange={e => onChange({ ...goal, target: e.target.value })}
        placeholder="A dónde quieres llegar."
        aria-label={`Objetivo de ${areaLabel}`}
        maxLength={160}
        style={{ ...FIELD, marginBottom: '14px' }}
      />

      {/* La trayectoria desde la línea base. Dato, sin juicio. */}
      {points.length > 1 ? (
        <>
          <Sparkline points={points} area={goal.area} baseWeek={goal.baselineDate} />
          {last && (
            <p style={{
              margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12.5px', color: DT.muted, fontFamily: DT.body,
            }}>
              <ChartLine size={13} weight="regular" color={DT.azulInk} style={{ flexShrink: 0 }} />
              {sentenceCase(last.label.toLowerCase())}, {last.pct}% de aciertos
            </p>
          )}
        </>
      ) : (
        <p style={{ margin: 0, fontSize: '12.5px', color: DT.faint, fontFamily: DT.body }}>
          Todavía sin semanas nuevas desde la línea base.
        </p>
      )}

      {/* Revisión y retirada. La fecha la pone el logopeda. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${DT.lineSoft}`,
      }}>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontSize: '12.5px', fontWeight: 700, color: DT.ink, fontFamily: DT.body,
        }}>
          <CalendarBlank size={14} weight="regular" color={DT.azulInk} />
          Última revisión
          <input
            type="date"
            value={goal.lastReviewDate}
            max={today()}
            onChange={e => onChange({ ...goal, lastReviewDate: e.target.value })}
            aria-label={`Última revisión de ${areaLabel}`}
            style={{ ...FIELD_LINE, width: 'auto' }}
          />
        </label>
        {!goal.done && pending >= REVIEW_WEEKS && (
          <span style={{ fontSize: '12.5px', color: DT.muted, fontFamily: DT.body }}>
            Hace {pending} semanas sin revisar.
          </span>
        )}
        <Button size="sm" Icon={X} onClick={onRemove} style={{ marginLeft: 'auto' }}>
          Quitar
        </Button>
      </div>
    </div>
  )
}

export default function Objetivos({
  isReal, storeId, focusAreas, demoHistory,
}: {
  isReal: boolean
  storeId: string
  focusAreas: string[]
  demoHistory: { date: string; items?: { skill: string; ok: boolean }[] }[]
}) {
  const [goals, setGoals] = useState<FocusGoal[]>([])
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  // Sólo se guarda lo que ha tocado el logopeda: cargar no dispara un guardado.
  const dirty = useRef(false)

  // Las partidas por área: de Supabase en cuenta real, del historial en la demo.
  const realPlays = useAreaPlays(isReal ? storeId : null)
  const demoPlays = useMemo<AreaPlay[]>(() => (isReal ? [] : fromDemoHistory(demoHistory)), [isReal, demoHistory])
  const { loading, plays } = isReal ? realPlays : { ...EMPTY_PLAYS, plays: demoPlays }

  useEffect(() => {
    let cancelled = false
    dirty.current = false
    loadChildFocus(isReal, storeId).then(f => {
      if (cancelled) return
      setGoals(f.goals)
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [isReal, storeId])

  // Autoguardado con un respiro, para no escribir en cada tecla del objetivo.
  useEffect(() => {
    if (!loaded || !dirty.current) return
    const t = setTimeout(() => {
      saveChildGoals(isReal, storeId, goals).then(res => {
        setStatus(res.ok ? 'Guardado.' : 'No se pudo guardar. Vuelve a intentarlo.')
        if (res.ok) setTimeout(() => setStatus(null), 2400)
      })
    }, 600)
    return () => clearTimeout(t)
  }, [goals, loaded, isReal, storeId])

  function mutate(next: FocusGoal[]) {
    dirty.current = true
    setGoals(next)
  }

  // Fijar: Dracs captura la línea base del dato real de esa área EN ESE MOMENTO
  // y la congela. Lo que venga después es trayectoria, no línea base.
  function fixGoal(area: string) {
    const now = today()
    const base = latestWeekFor(plays, area)
    mutate([...goals, {
      area,
      baselineLabel: baselineLabelFor(area, base),
      baselineDate: base?.weekStart ?? now,
      target: '',
      setDate: now,
      lastReviewDate: now,
      done: false,
    }])
  }

  const byArea = useMemo(() => new Map(goals.map(g => [g.area, g])), [goals])
  // Sólo se muestran los objetivos de las áreas de foco activas. Quitar un área
  // no borra su objetivo: vuelve si el logopeda vuelve a marcarla.
  const rows = focusAreas.map(area => ({ area, goal: byArea.get(area) ?? null }))
  const fixed = rows.filter(r => r.goal !== null).length

  return (
    <Card>
      <SectionTitle Icon={Flag}>Objetivos y línea base</SectionTitle>

      {focusAreas.length === 0 ? (
        <EmptyState Icon={Flag} title="Todavía sin objetivos" compact>
          Marca un área de foco y aquí podrás fijar a dónde quieres llegar.
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fixed === 0 && (
            <p style={{ margin: 0, fontSize: '13.5px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
              Todavía sin objetivos. Fija uno y Dracs guarda de dónde partes.
            </p>
          )}

          {rows.map(({ area, goal }) => goal ? (
            <GoalBlock
              key={area}
              goal={goal}
              points={weeklyPctFor(plays, area, goal.baselineDate)}
              onChange={next => mutate(goals.map(g => (g.area === area ? next : g)))}
              onRemove={() => mutate(goals.filter(g => g.area !== area))}
            />
          ) : (
            <div key={area} style={{
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              padding: '12px 14px', borderRadius: DT.radiusSm,
              background: DT.cream, border: `1px solid ${DT.lineSoft}`,
            }}>
              <p style={{
                flex: 1, minWidth: '140px', margin: 0, fontSize: '14.5px', fontWeight: 700,
                color: DT.ink, fontFamily: DT.display,
              }}>
                {SKILL_LABELS[area] ?? area}
              </p>
              <Button size="sm" Icon={Plus} onClick={() => fixGoal(area)} disabled={!loaded || loading}>
                Fijar objetivo
              </Button>
            </div>
          ))}
        </div>
      )}

      {status && (
        <p className="dk-fade" style={{
          margin: '14px 0 0', fontSize: '13px', fontWeight: 700,
          color: DT.azulInk, fontFamily: DT.body,
        }}>
          {status}
        </p>
      )}
    </Card>
  )
}
