// Objetivos — a dónde quiere llegar el profesional con cada área que eligió.
//
// Dracs pone el dato (cómo va hoy esa área y el gráfico de las semanas que
// vinieron después). El objetivo lo escribe el profesional con sus palabras, y el
// cumplimiento lo marca él. Dracs no dice "mejoró" ni "cumplió".
//
// Guarda solo, sin botón: navegador en la demo, columna focus_goals en cuenta
// real.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Flag, X } from '@phosphor-icons/react'
import { DT, FIELD, FIELD_LINE } from './deskTokens'
import { Button, Card, EmptyState, SectionTitle, ToggleChip } from './deskUI'
import { SKILL_LABELS } from './labels'
import { localIso } from './informeData'
import {
  fromDemoHistory, latestWeekFor, useAreaPlays, weeklyPctFor,
  type AreaPlay, type WeekPoint,
} from './areaTrajectory'
import { loadChildFocus, saveChildGoals, type FocusGoal } from './childFocus'

function today(): string {
  return localIso(new Date())
}

// ── El gráfico ───────────────────────────────────────────────────────────────
// Un solo color, el azul de la estructura. Sin ejes, sin rejilla y sin flechas:
// es una lectura, no un veredicto.
const CHART_H = 46
const PAD_X = 4   // margen lateral, en unidades de viewBox (= porcentaje)

function Sparkline({ points, area }: { points: WeekPoint[]; area: string }) {
  const values = points.map(p => p.pct)
  // Recorrido mínimo de 20 puntos: una diferencia pequeña no se dibuja como un
  // salto enorme. El gráfico no dramatiza.
  const lo0 = Math.min(...values)
  const hi0 = Math.max(...values)
  const span = Math.max(20, hi0 - lo0 + 8)
  const lo = Math.max(0, Math.min((lo0 + hi0) / 2 - span / 2, 100 - span))
  const hi = Math.min(100, lo + span)

  const xOf = (i: number) => PAD_X + (i / (points.length - 1)) * (100 - PAD_X * 2)
  const yOf = (pct: number) => 7 + (1 - (pct - lo) / (hi - lo)) * (CHART_H - 14)

  return (
    <div
      role="img"
      aria-label={`${SKILL_LABELS[area] ?? area}, aciertos por semana. ${points.map(p => `${p.label}, ${p.pct}%`).join('. ')}.`}
      style={{ position: 'relative', height: `${CHART_H}px` }}
    >
      <svg
        width="100%" height={CHART_H} viewBox={`0 0 100 ${CHART_H}`} preserveAspectRatio="none"
        aria-hidden style={{ position: 'absolute', inset: 0, display: 'block' }}
      >
        <polyline
          points={points.map((p, i) => `${xOf(i)},${yOf(p.pct)}`).join(' ')}
          fill="none" stroke={DT.azul} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
        />
      </svg>
      {points.map((p, i) => (
        <span
          key={p.weekStart}
          title={`${p.label}: ${p.pct}% de aciertos`}
          style={{
            position: 'absolute', left: `${xOf(i)}%`, top: `${yOf(p.pct)}px`,
            width: '6px', height: '6px', borderRadius: '50%',
            transform: 'translate(-50%, -50%)', background: DT.azul,
          }}
        />
      ))}
    </div>
  )
}

// ── Un área ──────────────────────────────────────────────────────────────────
function AreaGoal({ area, goal, hoy, points, onChange, onRemove }: {
  area: string
  goal: FocusGoal | null
  hoy: WeekPoint | null
  points: WeekPoint[]
  onChange: (next: FocusGoal) => void
  onRemove: () => void
}) {
  const name = SKILL_LABELS[area] ?? area
  const current: FocusGoal = goal ?? { area, startDate: today(), target: '', reviewDate: '', done: false }

  return (
    <div style={{
      background: DT.cream, border: `1px solid ${DT.lineSoft}`, borderRadius: DT.radiusSm,
      padding: '14px 16px',
    }}>
      <p style={{
        margin: 0, fontSize: '16px', fontWeight: 600, color: DT.ink, fontFamily: DT.display,
      }}>
        {name}
      </p>

      {hoy && (
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>
          Hoy: {hoy.pct}% de aciertos
        </p>
      )}

      <input
        type="text"
        value={current.target}
        onChange={e => onChange({ ...current, target: e.target.value })}
        placeholder="Objetivo: 60% de aciertos"
        aria-label={`Objetivo de ${name}`}
        maxLength={160}
        style={{ ...FIELD, margin: '12px 0 0' }}
      />

      {points.length > 1 && (
        <div style={{ marginTop: '12px' }}>
          <Sparkline points={points} area={area} />
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${DT.lineSoft}`,
      }}>
        <input
          type="date"
          value={current.reviewDate}
          onChange={e => onChange({ ...current, reviewDate: e.target.value })}
          aria-label={`Fecha de revisión de ${name}`}
          style={{ ...FIELD_LINE, width: 'auto' }}
        />
        {/* Lo marca el profesional. Dracs no lo marca nunca solo. */}
        <ToggleChip on={current.done} onClick={() => onChange({ ...current, done: !current.done })}>
          {current.done ? 'Cumplido' : 'Marcar cumplido'}
        </ToggleChip>
        {goal && (
          <Button size="sm" Icon={X} onClick={onRemove} style={{ marginLeft: 'auto' }}>
            Quitar
          </Button>
        )}
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
  // Sólo se guarda lo que ha tocado el profesional: cargar no dispara un guardado.
  const dirty = useRef(false)

  // Las partidas por área: de Supabase en cuenta real, del historial en la demo.
  const realPlays = useAreaPlays(isReal ? storeId : null)
  const demoPlays = useMemo<AreaPlay[]>(() => (isReal ? [] : fromDemoHistory(demoHistory)), [isReal, demoHistory])
  const plays = isReal ? realPlays.plays : demoPlays

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

  // Autoguardado con un respiro, para no escribir en cada tecla.
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

  // El objetivo se crea al escribirlo, sin un paso previo. `startDate` queda
  // fijo ahí: es desde cuándo cuenta el gráfico de esa área.
  function change(area: string, next: FocusGoal) {
    mutate(goals.some(g => g.area === area)
      ? goals.map(g => (g.area === area ? next : g))
      : [...goals, next])
  }

  const byArea = useMemo(() => new Map(goals.map(g => [g.area, g])), [goals])

  if (focusAreas.length === 0) {
    return (
      <Card>
        <SectionTitle Icon={Flag}>Objetivos</SectionTitle>
        <EmptyState Icon={Flag} title="Marca un área arriba" compact />
      </Card>
    )
  }

  return (
    <Card>
      <SectionTitle Icon={Flag}>Objetivos</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Sólo las áreas de foco activas. Quitar un área no borra su objetivo:
            vuelve si el profesional vuelve a marcarla. */}
        {focusAreas.map(area => {
          const goal = byArea.get(area) ?? null
          return (
            <AreaGoal
              key={area}
              area={area}
              goal={goal}
              hoy={latestWeekFor(plays, area)}
              points={weeklyPctFor(plays, area, goal?.startDate)}
              onChange={next => change(area, next)}
              onRemove={() => mutate(goals.filter(g => g.area !== area))}
            />
          )
        })}
      </div>

      {status && (
        <p className="dk-fade" style={{
          margin: '14px 0 0', fontSize: '14px', fontWeight: 600,
          color: DT.azulInk, fontFamily: DT.body,
        }}>
          {status}
        </p>
      )}
    </Card>
  )
}
