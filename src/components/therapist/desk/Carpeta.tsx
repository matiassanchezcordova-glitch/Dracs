// La Carpeta — detalle de un paciente en una sola superficie calma (§Phase 2).
// Secciones: identidad · Qué jugó (datos reales) · Por área · Notas clínicas
// (privadas) · Comentario para la familia. El terapeuta SÍ ve números; sobrios,
// legibles, sin claims clínicos y sin datos inventados.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { CaretLeft, Lock, PaperPlaneTilt, MapPin } from '@phosphor-icons/react'
import { type Patient } from '../../../data/patients'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { getWeekCode } from '../../../lib/utils'
import type { DbSession } from '../../../lib/types'
import { getDurationMinutes, getStreakDays, getAccuracyPercent } from '../../../lib/derived'
import { DT } from './deskTokens'
import { Card, SectionLabel, Avatar, EjemploTag } from './deskUI'
import { usePorArea } from './usePorArea'
import EnfocarMundo from './EnfocarMundo'

interface Props {
  patient: Patient
  supabasePatientId?: string
  onBack: () => void
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

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: DT.arena, borderRadius: DT.radiusSm, padding: '14px 16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 800, color: DT.ink, lineHeight: 1, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: DT.muted, marginTop: '6px', fontFamily: DT.body }}>{label}</div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px', background: DT.arena, color: DT.ink,
      fontSize: '12px', fontWeight: 700, fontFamily: DT.body,
    }}>
      {children}
    </span>
  )
}

function ChartTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as { active?: boolean; payload?: { value: number }[]; label?: string }
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: DT.white, border: `1px solid ${DT.line}`, borderRadius: '10px', padding: '8px 14px', boxShadow: DT.shadowSoft }}>
      <p style={{ margin: 0, fontSize: '11px', color: DT.muted, fontWeight: 700 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: '16px', color: DT.azul, fontWeight: 800, fontFamily: DT.body }}>{payload[0].value}%</p>
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
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [savingClinical, setSavingClinical] = useState(false)
  const [comment, setComment] = useState('')
  const [published, setPublished] = useState<{ text: string; date: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const porArea = usePorArea(isReal ? supabasePatientId : null)

  useEffect(() => {
    if (!isReal) return
    let cancelled = false
    Promise.all([
      supabase.from('sessions').select('*').eq('child_id', supabasePatientId!).order('started_at', { ascending: false }).limit(50),
      supabase.from('children').select('clinical_notes').eq('id', supabasePatientId!).maybeSingle(),
    ]).then(([sessRes, childRes]) => {
      if (cancelled) return
      setSbSessions((sessRes.data ?? []) as DbSession[])
      setClinicalNotes((childRes.data?.clinical_notes as string | null) ?? '')
      setSbLoaded(true)
    })
    return () => { cancelled = true }
  }, [isReal, supabasePatientId])

  // ── Datos de la semana (reales en modo Supabase; ejemplo en demo) ──────────
  const week = useMemo(() => {
    if (isReal && sbLoaded) {
      const now = new Date(), dow = now.getDay()
      const wk = new Date(now); wk.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1)); wk.setHours(0, 0, 0, 0)
      const prev = new Date(wk); prev.setDate(wk.getDate() - 7)
      const t = (s: DbSession) => new Date(s.ended_at ?? s.started_at)
      const thisWeek = sbSessions.filter(s => t(s) >= wk)
      const prevWeek = sbSessions.filter(s => t(s) >= prev && t(s) < wk)
      const acc = (arr: DbSession[]) => {
        const tot = arr.reduce((a, s) => a + s.total_exercises, 0)
        const cor = arr.reduce((a, s) => a + s.correct_count, 0)
        return tot > 0 ? Math.round((cor / tot) * 100) : null
      }
      return {
        sessions: thisWeek.length,
        // Nunca inventamos duración: las sesiones sin duration_seconds no suman
        // (se muestran como "—" en la tabla y quedan fuera del total).
        minutes: thisWeek.reduce((a, s) => a + (getDurationMinutes(s) ?? 0), 0),
        exercises: thisWeek.reduce((a, s) => a + s.total_exercises, 0),
        accuracy: acc(thisWeek),
        prevAccuracy: acc(prevWeek),
        streak: getStreakDays(sbSessions),
      }
    }
    // Showroom, niño vivo: las métricas ya vienen derivadas del historial del
    // navegador. Se usan tal cual — nada se estima.
    if (p.localWeek) return { ...p.localWeek }

    // Carpeta de ejemplo: derivar de sus datos ilustrativos. El % de "esta
    // semana" es el ÚLTIMO punto de su propia curva (y el previo, el anterior),
    // para que el tile y el gráfico no se contradigan entre sí.
    const curve = p.weeklyProgress
    return {
      sessions: p.metrics.sessionsThisWeek,
      minutes: (p.metrics.sessionsThisWeek * p.metrics.avgDuration) as number | null,
      exercises: p.metrics.sessionsThisWeek * 7,
      accuracy: curve.at(-1)?.score ?? null,
      prevAccuracy: (curve.length > 1 ? curve.at(-2)?.score : null) ?? null,
      streak: 0,
    }
  }, [isReal, sbLoaded, sbSessions, p])

  // Evolución semanal (reales o ejemplo). Nunca datos por nombre inventados.
  const chartData = useMemo(() => {
    if (isReal && sbLoaded) {
      const now = new Date(), dow = now.getDay()
      const wkStart = new Date(now); wkStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1)); wkStart.setHours(0, 0, 0, 0)
      const out: { name: string; value: number }[] = []
      for (let w = 3; w >= 0; w--) {
        const s = new Date(wkStart); s.setDate(wkStart.getDate() - w * 7)
        const e = new Date(s); e.setDate(s.getDate() + 7)
        const arr = sbSessions.filter(x => { const d = new Date(x.ended_at ?? x.started_at); return d >= s && d < e })
        const tot = arr.reduce((a, x) => a + x.total_exercises, 0)
        const cor = arr.reduce((a, x) => a + x.correct_count, 0)
        out.push({ name: `Sem ${4 - w}`, value: tot > 0 ? Math.round((cor / tot) * 100) : 0 })
      }
      return out
    }
    return p.weeklyProgress.map(d => ({ name: d.week, value: d.score }))
  }, [isReal, sbLoaded, sbSessions, p])

  // La última columna SIEMPRE es la semana en curso. Etiquetarla explícitamente
  // hace obvio que ese punto es el MISMO número que el tile de aciertos de
  // arriba, y que las otras tres son historia.
  const chartRows = chartData.map((d, i) => (
    i === chartData.length - 1 ? { ...d, name: 'Esta sem.' } : d
  ))
  const chartHasData = chartData.some(d => d.value > 0)
  const recentSessions = isReal && sbLoaded
    ? sbSessions.slice(0, 5).map(s => ({
        date: new Date(s.ended_at ?? s.started_at).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
        duration: getDurationMinutes(s), exercises: s.total_exercises, accuracy: getAccuracyPercent(s),
      }))
    : p.recentSessions

  const firstName = p.name.split(' ')[0]
  const therapistDisplayName = profile?.full_name ?? 'Terapeuta'

  const kSessions = useCountUp(week.sessions)

  // Rango de la semana en curso (lunes → domingo), para que "esta semana" sea
  // literal y no una etiqueta vaga.
  const weekRange = useMemo(() => {
    const now = new Date(), dow = now.getDay()
    const start = new Date(now); start.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
    const end = new Date(start); end.setDate(start.getDate() + 6)
    const M = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${start.getDate()} ${M[start.getMonth()]} – ${end.getDate()} ${M[end.getMonth()]}`
  }, [])

  async function handleSaveClinicalNotes() {
    if (!isReal) return
    setSavingClinical(true)
    const { error } = await supabase.from('children').update({ clinical_notes: clinicalNotes.trim() || null }).eq('id', supabasePatientId!)
    setSavingClinical(false)
    setToast(error ? 'No se pudieron guardar las notas. Prueba otra vez.' : 'Notas clínicas guardadas.')
    setTimeout(() => setToast(null), 3000)
  }

  async function handlePublish() {
    if (!comment.trim()) return
    const now = new Date()
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    const date = `${now.getDate()} ${months[now.getMonth()]}`
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
    setToast('Comentario publicado. La familia ya puede verlo.')
    setTimeout(() => setToast(null), 3000)
  }

  const accuracyLine = week.accuracy == null
    ? null
    : week.prevAccuracy == null
      ? `${week.accuracy}% de aciertos`
      : `${week.accuracy}% de aciertos · semana previa ${week.prevAccuracy}%`

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '18px',
      padding: '20px 20px 40px', maxWidth: '760px', margin: '0 auto', width: '100%',
      fontFamily: DT.body, boxSizing: 'border-box',
    }}>
      {toast && <Toast message={toast} />}

      {/* Volver al escritorio */}
      <button
        onClick={onBack}
        style={{
          alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
          color: DT.azul, fontSize: '14px', fontWeight: 700, fontFamily: DT.body,
        }}
      >
        <CaretLeft size={16} weight="bold" /> Escritorio
      </button>

      {/* ── Identidad ─────────────────────────────────────────────── */}
      <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Avatar name={p.name} size={54} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700, color: DT.ink, fontFamily: DT.display, lineHeight: 1.1 }}>
            {p.name}
          </h2>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Chip>{p.age} años</Chip>
            {p.condition && <Chip>{p.condition}</Chip>}
            {p.level && <Chip>Nivel {p.level.min}-{p.level.max}</Chip>}
          </div>
        </div>
        {p.isExample && <EjemploTag />}
      </Card>

      {/* ── Qué jugó ──────────────────────────────────────────────── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
          <div>
            <SectionLabel>Qué jugó · esta semana</SectionLabel>
            {/* El rango explícito evita cualquier duda sobre qué período
                cubren estos cuatro números. */}
            <p style={{ margin: '-10px 0 0', fontSize: '12px', color: DT.faint, fontFamily: DT.body }}>
              {weekRange}
            </p>
          </div>
          {p.isExample && <EjemploTag />}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
          <StatTile value={String(kSessions)} label={week.sessions === 1 ? 'partida' : 'partidas'} />
          <StatTile value={(week.minutes ?? 0) > 0 ? `~${week.minutes}` : '—'} label="minutos" />
          <StatTile value={week.sessions ? String(week.exercises) : '—'} label="juegos completados" />
          <StatTile value={week.accuracy == null ? '—' : `${week.accuracy}%`} label="aciertos" />
        </div>

        {(accuracyLine || week.streak > 0 || porArea.placesVisited.length > 0) && (
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accuracyLine && <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>{accuracyLine}</p>}
            {week.streak > 0 && <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Racha actual: {week.streak} {week.streak === 1 ? 'día' : 'días'} seguidos.</p>}
            {porArea.placesVisited.length > 0 && (
              <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} weight="duotone" color={DT.azul} /> Lugares: {porArea.placesVisited.join(', ')}.
              </p>
            )}
          </div>
        )}

        {/* Evolución semanal */}
        <p style={{ margin: '22px 0 2px', fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>
          Evolución · % de aciertos por semana
        </p>
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: DT.faint, fontFamily: DT.body }}>
          Últimas 4 semanas. La última columna es la semana en curso — el mismo número que “aciertos”, arriba.
        </p>
        {chartHasData ? (
          <ResponsiveContainer width="100%" height={170}>
            {/* `left: 0` + YAxis ancho: con margen negativo los "100%"/"75%"
                quedaban recortados y se leían como ")0%". */}
            <AreaChart data={chartRows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="deskScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DT.azul} stopOpacity={0.16} />
                  <stop offset="95%" stopColor={DT.azul} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke={DT.line} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: DT.muted, fontSize: 12, fontFamily: DT.body }} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => v + '%'} axisLine={false} tickLine={false} tick={{ fill: DT.muted, fontSize: 11, fontFamily: DT.body }} width={52} tickMargin={6} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: DT.arena, strokeWidth: 1 }} />
              <Area type="monotone" dataKey="value" stroke={DT.azul} strokeWidth={2} fill="url(#deskScoreGrad)" activeDot={{ r: 5, fill: DT.azul, stroke: DT.white, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
            Todavía no hay suficientes partidas para trazar la evolución.
          </p>
        )}

        {/* Últimas sesiones */}
        {recentSessions.length > 0 && (
          <>
            <p style={{ margin: '22px 0 8px', fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body }}>Últimas partidas</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Fecha', 'Duración', 'Juegos', 'Aciertos'].map((c, i) => (
                    <th key={c} style={{ textAlign: i === 0 ? 'left' : 'center', fontSize: '11px', fontWeight: 700, color: DT.faint, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: DT.body, padding: '0 8px 10px', borderBottom: `1px solid ${DT.line}` }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 1 ? DT.cream : 'transparent' }}>
                    <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>{s.date}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, textAlign: 'center' }}>{s.duration ? `${s.duration} min` : '—'}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, textAlign: 'center' }}>{s.exercises}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: 700, color: DT.ink, fontFamily: DT.body, textAlign: 'center' }}>{s.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>

      {/* ── Por área ──────────────────────────────────────────────── */}
      <Card>
        <SectionLabel>Por área</SectionLabel>
        {!isReal ? (
          <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
            {p.localWeek
              ? `El historial de este navegador guarda partidas, no áreas. La distribución por área aparece con una cuenta real.`
              : 'La distribución por área aparece con los datos reales de juego del paciente.'}
          </p>
        ) : porArea.loading ? (
          <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body }}>Cargando…</p>
        ) : !porArea.hasTags ? (
          <p style={{ margin: 0, fontSize: '14px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.6 }}>
            Aún estamos recogiendo datos por área. Cuando {firstName} juegue más y los juegos estén clasificados, verás aquí en qué áreas se apoya y cuáles evita.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {porArea.distribution.map(a => (
              <div key={a.slug}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: DT.ink, fontFamily: DT.body }}>{a.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: DT.muted, fontFamily: DT.body, fontVariantNumeric: 'tabular-nums' }}>{a.pct}%</span>
                </div>
                <div style={{ height: '8px', background: DT.arena, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${a.pct}%`, background: DT.azul, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Enfocar el mundo (personalización) ────────────────────── */}
      <EnfocarMundo childName={firstName} isReal={isReal} storeId={(isReal ? supabasePatientId : p.id) as string} />

      {/* ── Notas clínicas (privadas) ─────────────────────────────── */}
      {isReal && (
        <Card style={{ borderLeft: `3px solid ${DT.mostaza}` }}>
          <SectionLabel>Notas clínicas · privadas</SectionLabel>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: DT.muted, fontFamily: DT.body, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Lock size={15} weight="fill" color={DT.topo} /> Solo visible para ti. La familia no ve estas notas.
          </p>
          <textarea
            value={clinicalNotes}
            onChange={e => setClinicalNotes(e.target.value)}
            placeholder="Historial, evolución y observaciones para tu propio registro."
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
              border: `1.5px solid ${DT.line}`, background: DT.white, color: DT.ink, fontSize: '14px',
              fontFamily: DT.body, resize: 'vertical', maxHeight: '220px', outline: 'none', lineHeight: 1.6, marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSaveClinicalNotes}
              disabled={savingClinical}
              style={{
                padding: '10px 20px', borderRadius: DT.radiusSm, border: `1px solid ${DT.mostaza}`,
                background: DT.white, color: DT.ink, fontSize: '14px', fontWeight: 700, fontFamily: DT.body,
                cursor: savingClinical ? 'default' : 'pointer', opacity: savingClinical ? 0.5 : 1,
              }}
            >
              {savingClinical ? 'Guardando…' : 'Guardar notas'}
            </button>
          </div>
        </Card>
      )}

      {/* ── Comentario para la familia ────────────────────────────── */}
      <Card>
        <SectionLabel>Comentario para la familia</SectionLabel>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Escribe aquí tu observación de la semana para la familia."
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: DT.radiusSm,
            border: `1.5px solid ${DT.line}`, background: DT.white, color: DT.ink, fontSize: '14px',
            fontFamily: DT.body, resize: 'vertical', maxHeight: '220px', outline: 'none', lineHeight: 1.6, marginBottom: '12px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handlePublish}
            disabled={!comment.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: DT.radiusSm,
              border: 'none', background: DT.yellow, color: DT.ink, fontSize: '14px', fontWeight: 700, fontFamily: DT.body,
              cursor: comment.trim() ? 'pointer' : 'default', opacity: comment.trim() ? 1 : 0.5,
            }}
          >
            <PaperPlaneTilt size={15} weight="fill" /> Publicar
          </button>
        </div>
        {published && (
          <div style={{ marginTop: '16px', borderLeft: `3px solid ${DT.azul}`, background: DT.cream, borderRadius: `0 ${DT.radiusSm} ${DT.radiusSm} 0`, padding: '12px 16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 800, color: DT.azul, fontFamily: DT.body }}>Publicado · {therapistDisplayName}</p>
            <p style={{ margin: 0, fontSize: '13px', color: DT.ink, fontFamily: DT.body, lineHeight: 1.6 }}>{published.text}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
