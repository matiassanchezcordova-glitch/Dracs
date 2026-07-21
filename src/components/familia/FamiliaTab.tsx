import { useEffect, useMemo, useRef, useState } from 'react'
import { Star, Flame, TrendingUp, Check, FileText, ClipboardList, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTherapist } from '../../context/TherapistContext'
import { supabase } from '../../lib/supabase'
import { getWeekCode } from '../../lib/utils'
import type { DbSession, TherapistComment, DbChild } from '../../lib/types'
import { getAccuracyPercent, getDurationMinutes, getStreakDays, getCurrentLevel } from '../../lib/derived'
import { loadHistory, type SessionResult } from '../../hooks/useChildProfile'
import WeeklyReport from './WeeklyReport'

interface Props {
  onNavigateToEjercicio: () => void
  onNavigateToTerapeuta: () => void
}

// ── localStorage helpers (demo mode) ──────────────────────────────────────

function getChildName(): string {
  try {
    const raw = localStorage.getItem('dracs_child_profile')
    if (!raw) return 'Pablo'
    const p = JSON.parse(raw) as { name?: string }
    return p.name ?? 'Pablo'
  } catch { return 'Pablo' }
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

interface LocalComment { texto: string; fecha: string; terapeuta: string }

function getLocalTherapistComment(childName: string): LocalComment | null {
  try {
    const key = `dracs_comment_${slugify(childName)}_${getWeekCode()}`
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as LocalComment) : null
  } catch { return null }
}

interface WeekStats {
  streak: number
  sessionsThisWeek: number
  lastWeekSessions: number
  accuracyThisWeek: number
  lastWeekAccuracy: number
}

const EMPTY_STATS: WeekStats = { streak: 0, sessionsThisWeek: 0, lastWeekSessions: 0, accuracyThisWeek: 0, lastWeekAccuracy: 0 }

function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Lunes de la semana de `d` (semana lunes→domingo, igual que el informe y que
// la vista Supabase).
function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const m = new Date(d)
  m.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  m.setHours(0, 0, 0, 0)
  return m
}

// Racha = días consecutivos con al menos una partida, terminando hoy (o ayer si
// hoy todavía no jugó).
function localStreak(history: SessionResult[]): number {
  if (history.length === 0) return 0
  const days = new Set(history.map(s => s.date))
  const d = new Date()
  if (!days.has(localIso(d))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (days.has(localIso(d))) { streak++; d.setDate(d.getDate() - 1) }
  return streak
}

// Estadísticas de la semana desde el historial local REAL. Sin datos inventados:
// una cuenta sin partidas devuelve ceros (y la UI muestra un empty state).
function getLocalWeekStats(): WeekStats {
  try {
    const history = loadHistory()
    if (history.length === 0) return EMPTY_STATS
    const weekStart = mondayOf(new Date())
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(weekStart.getDate() - 7)
    const at = (s: SessionResult) => new Date(s.date + 'T00:00:00')
    const thisWeek = history.filter(s => at(s) >= weekStart)
    const lastWeek = history.filter(s => { const d = at(s); return d >= lastWeekStart && d < weekStart })
    const acc = (arr: SessionResult[]) => {
      const correct = arr.reduce((a, s) => a + s.correct, 0)
      const total = arr.reduce((a, s) => a + s.total, 0)
      return total > 0 ? Math.round((correct / total) * 100) : 0
    }
    return {
      streak: localStreak(history),
      sessionsThisWeek: thisWeek.length,
      lastWeekSessions: lastWeek.length,
      accuracyThisWeek: acc(thisWeek),
      lastWeekAccuracy: acc(lastWeek),
    }
  } catch { return EMPTY_STATS }
}

// ── Supabase stats from sessions ──────────────────────────────────────────

function computeStatsFromSessions(sessions: DbSession[]): WeekStats {
  const now = new Date()
  const dow = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  weekStart.setHours(0, 0, 0, 0)
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(weekStart.getDate() - 7)

  const sessionTime = (s: DbSession) => new Date(s.ended_at ?? s.started_at).getTime()
  const thisWeek = sessions.filter(s => sessionTime(s) >= weekStart.getTime())
  const lastWeek = sessions.filter(s => {
    const t = sessionTime(s)
    return t >= lastWeekStart.getTime() && t < weekStart.getTime()
  })

  const calcAcc = (arr: DbSession[]) => {
    const total = arr.reduce((a, s) => a + s.total_exercises, 0)
    const correct = arr.reduce((a, s) => a + s.correct_count, 0)
    return total > 0 ? Math.round((correct / total) * 100) : 0
  }

  return {
    streak: getStreakDays(sessions),
    sessionsThisWeek: thisWeek.length,
    lastWeekSessions: lastWeek.length,
    accuracyThisWeek: calcAcc(thisWeek),
    lastWeekAccuracy: calcAcc(lastWeek),
  }
}

function formatSessionDate(iso: string): string {
  const d = new Date(iso)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

// ── Count-up animation ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 700) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    setVal(0)
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

// ── Week grid ─────────────────────────────────────────────────────────────

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const todayDowIndex = (() => {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
})()

// ── White card ────────────────────────────────────────────────────────────

function Card({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      ...s,
    }}>
      {children}
    </div>
  )
}

const CARD_TITLE: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: '15px',
  fontWeight: 700,
  color: '#33302A',
  fontFamily: 'Nunito, sans-serif',
}

// ── Empty state — cuando no hay actividad esta semana ─────────────────────

function FamiliaEmptyState({ childName, onPlay }: { childName: string; onPlay: () => void }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EAF3F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FileText size={26} color="#1A8FB5" />
      </div>
      <p style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#33302A', fontFamily: 'Fredoka, system-ui, sans-serif' }}>
        Todavía no hay partidas esta semana
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6, maxWidth: '360px' }}>
        Cuando {childName} juegue, verás su progreso aquí.
      </p>
      <button
        onClick={onPlay}
        style={{ marginTop: '4px', height: '44px', padding: '0 22px', borderRadius: '12px', border: 'none', background: '#F7C31C', color: '#33302A', fontSize: '15px', fontWeight: 700, fontFamily: 'Fredoka, system-ui, sans-serif', cursor: 'pointer' }}
      >
        Empezar a jugar
      </button>
    </div>
  )
}

// ── FamiliaContent — shared between family and therapist views ────────────

interface FamiliaContentProps {
  activePatient: DbChild | null
  sbSessions: DbSession[]
  sbComment: TherapistComment | null
  sbLevel: { min: number; max: number } | null
  sbLoaded: boolean
  isSupabaseMode: boolean
  localChildName: string
  localStats: WeekStats
  localComment: LocalComment | null
  onNavigateToEjercicio: () => void
  hasTherapist: boolean
  connectPatientId: string | null
  onTherapistConnected: () => void
}

function FamiliaContent({
  activePatient, sbSessions, sbComment, sbLevel, sbLoaded, isSupabaseMode,
  localChildName, localStats, localComment, onNavigateToEjercicio,
  hasTherapist, connectPatientId, onTherapistConnected,
}: FamiliaContentProps) {
  const [showReport, setShowReport] = useState(false)

  // Historial local REAL (modo demo/invitado, sin cuenta). Es el MISMO dato que
  // lee el informe semanal, así el dashboard y el informe coinciden.
  const localHistory = useMemo<SessionResult[]>(() => (isSupabaseMode ? [] : loadHistory()), [isSupabaseMode])

  const childName = isSupabaseMode ? (activePatient?.full_name ?? 'Paciente') : localChildName
  const stats = isSupabaseMode && sbLoaded
    ? computeStatsFromSessions(sbSessions)
    : localStats

  // En Supabase esperamos a sbLoaded; en local el dato ya está listo.
  const dataReady = isSupabaseMode ? sbLoaded : true
  const noSessionsYet = dataReady && stats.sessionsThisWeek === 0

  const sessionCount = useCountUp(stats.sessionsThisWeek)
  const accuracyVal = useCountUp(noSessionsYet ? 0 : stats.accuracyThisWeek)
  const improvingVsLast = stats.accuracyThisWeek > stats.lastWeekAccuracy

  const thisWeekDone = (() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1))
    weekStart.setHours(0, 0, 0, 0)
    return DAYS_SHORT.map((_, i) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      if (isSupabaseMode) {
        if (!sbLoaded) return false
        const dayEnd = new Date(day)
        dayEnd.setHours(23, 59, 59, 999)
        return sbSessions.some(s => {
          const d = new Date(s.ended_at ?? s.started_at)
          return d >= day && d <= dayEnd
        })
      }
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
      return localHistory.some(s => s.date === iso)
    })
  })()

  const recentSessions = isSupabaseMode && sbLoaded
    ? sbSessions.slice(0, 3).map(s => ({
        date: formatSessionDate(s.ended_at ?? s.started_at),
        duration: getDurationMinutes(s) ?? 15,
        exercises: s.total_exercises,
        accuracy: getAccuracyPercent(s),
      }))
    : localHistory.slice().reverse().slice(0, 3).map(s => ({
        date: formatSessionDate(s.date + 'T12:00:00'),
        duration: Math.max(10, s.total * 3),
        exercises: s.total,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      }))

  const displayedComment = isSupabaseMode && sbLoaded
    ? sbComment
      ? { texto: sbComment.comment_text, fecha: new Date(sbComment.created_at ?? Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), terapeuta: 'Tu terapeuta' }
      : null
    : localComment

  const heroSubtitle = noSessionsYet
    ? 'Esta semana todavía no hay partidas. ¡Empieza hoy!'
    : stats.sessionsThisWeek >= 5
      ? 'Esta semana ha sido excelente'
      : stats.sessionsThisWeek >= 3
        ? 'La semana va bien'
        : 'Quedan días para practicar'

  interface ChipDef { icon: React.ReactNode; label: string; bg: string; color: string }
  const chips: ChipDef[] = []
  if (sbLevel) {
    chips.push({
      icon: <BookOpen size={14} />,
      label: `Nivel ${sbLevel.min}-${sbLevel.max}`,
      bg: '#E0F2FE', color: '#1A8FB5',
    })
  }
  if (!noSessionsYet) {
    if (stats.sessionsThisWeek >= 5)
      chips.push({ icon: <Star size={14} />, label: 'Semana perfecta', bg: '#F7C31C', color: '#33302A' })
    if (improvingVsLast)
      chips.push({ icon: <TrendingUp size={14} />, label: 'Mejor que nunca', bg: '#D1FAE5', color: '#059669' })
    if (stats.streak > 3 && chips.length < 2)
      chips.push({ icon: <Flame size={14} />, label: `${stats.streak} días en racha`, bg: '#FFF3CD', color: '#D97706' })
  }

  const progressPct = noSessionsYet ? 0 : accuracyVal
  const progressLabel = noSessionsYet
    ? 'Esperando primera sesión'
    : `${stats.accuracyThisWeek}% de aciertos${improvingVsLast ? ` · +${stats.accuracyThisWeek - stats.lastWeekAccuracy}% vs semana anterior` : ''}`

  return (
    <>
      {showReport && (
        <WeeklyReport
          onBack={() => setShowReport(false)}
          childName={childName}
          sbSessions={isSupabaseMode && sbLoaded ? sbSessions : undefined}
          hasTherapist={hasTherapist}
          connectPatientId={connectPatientId}
          onTherapistConnected={onTherapistConnected}
        />
      )}

      {!showReport && (
        <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Hero — texto sobre crema, sin caja ni banda de color */}
          <div style={{
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#0A6E78', lineHeight: 1.15, fontFamily: 'Fredoka, system-ui, sans-serif' }}>
                Hola, familia de {childName}.
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '15px', fontWeight: 600, color: '#6B7280', fontFamily: 'Nunito, sans-serif' }}>
                {heroSubtitle}
              </p>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '64px', fontWeight: 800, color: '#1A8FB5', lineHeight: 1, fontFamily: 'Nunito, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
                {sessionCount}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', fontFamily: 'Nunito, sans-serif', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SESIONES ESTA SEMANA
              </div>
            </div>
          </div>

          {/* Chips */}
          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {chips.slice(0, 2).map((chip, i) => (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  height: '32px', padding: '0 14px', borderRadius: '20px',
                  background: chip.bg, color: chip.color, fontSize: '13px',
                  fontWeight: 700, fontFamily: 'Nunito, sans-serif', flexShrink: 0,
                }}>
                  {chip.icon}{chip.label}
                </div>
              ))}
            </div>
          )}

          {/* Ver informe */}
          <button
            onClick={() => setShowReport(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
              padding: '18px 20px', borderRadius: '16px', border: '1px solid #E5E7EB',
              borderLeft: '4px solid #F7C31C', background: '#ffffff', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.18s ease, transform 0.18s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
          >
            <FileText size={20} color="#1A8FB5" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '20px', fontWeight: 700, color: '#33302A', textAlign: 'left', fontFamily: 'Nunito, sans-serif' }}>
              Ver informe semanal
            </span>
          </button>

          {noSessionsYet ? (
            <FamiliaEmptyState childName={childName} onPlay={onNavigateToEjercicio} />
          ) : (
          <>
          {/* Esta semana */}
          <Card>
            <p style={CARD_TITLE}>Esta semana</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {DAYS_SHORT.map((d, i) => {
                const done = thisWeekDone[i]
                const isToday = i === todayDowIndex && !done
                return (
                  <div key={d} className="dracs-week-circle" style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: done ? '#1A8FB5' : '#F8FAFC',
                    border: isToday ? '2px solid #F7C31C' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    animation: done ? `circleIn 0.4s ease ${i * 80}ms both` : 'none',
                  }}>
                    {done
                      ? <Check size={12} color="#ffffff" strokeWidth={3} />
                      : <span style={{ fontSize: '12px', fontWeight: 700, color: isToday ? '#D97706' : '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>{d}</span>
                    }
                  </div>
                )
              })}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
              {stats.sessionsThisWeek} sesiones esta semana
            </p>
          </Card>

          {/* Progreso de vocabulario */}
          <Card>
            <p style={CARD_TITLE}>Progreso de vocabulario</p>
            <div style={{ height: '10px', backgroundColor: '#E0F2FE', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #1A8FB5, #059669)', borderRadius: '5px', transition: 'width 0.8s ease' }} />
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif' }}>
              {progressLabel}
            </p>
          </Card>

          {/* Últimas sesiones */}
          {recentSessions.length > 0 ? (
            <Card>
              <p style={CARD_TITLE}>Últimas sesiones</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Fecha', 'Duración', 'Ejercicios', 'Aciertos'].map((col, i) => (
                      <th key={col} style={{ textAlign: i === 0 ? 'left' : 'center', fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Nunito, sans-serif', padding: '0 8px 12px', borderBottom: '1px solid #F1F5F9' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s, i) => {
                    const acColor = s.accuracy >= 80 ? '#059669' : s.accuracy >= 60 ? '#D97706' : '#DC2626'
                    return (
                      <tr key={i} style={{ backgroundColor: i % 2 === 1 ? '#F8FAFC' : 'transparent' }}>
                        <td style={{ padding: '11px 8px', fontSize: '13px', fontWeight: 600, color: '#33302A', fontFamily: 'Nunito, sans-serif' }}>{s.date}</td>
                        <td style={{ padding: '11px 8px', fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>{s.duration} min</td>
                        <td style={{ padding: '11px 8px', fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>{s.exercises}</td>
                        <td style={{ padding: '11px 8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: acColor, fontFamily: 'Nunito, sans-serif' }}>{s.accuracy}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          ) : isSupabaseMode && sbLoaded && (
            <Card>
              <p style={CARD_TITLE}>Últimas sesiones</p>
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
                  Todavía no hay sesiones registradas.{' '}
                  <button
                    onClick={onNavigateToEjercicio}
                    style={{ background: 'none', border: 'none', color: '#1A8FB5', cursor: 'pointer', fontSize: '14px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, padding: 0 }}
                  >
                    Completa tu primera sesión en Ejercicios.
                  </button>
                </p>
              </div>
            </Card>
          )}
          </>
          )}

          {/* Nota del terapeuta — solo si la cuenta tiene terapeuta conectado */}
          {hasTherapist && (
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '3px solid #1A8FB5' }}>
            {displayedComment ? (
              <>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Nunito, sans-serif' }}>
                  Nota de tu terapeuta
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
                  {displayedComment.terapeuta} · {displayedComment.fecha}
                </p>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9', marginBottom: '14px' }} />
                <p style={{ margin: 0, fontSize: '15px', color: '#33302A', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
                  {displayedComment.texto}
                </p>
              </>
            ) : (
              <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
                  Tu terapeuta aún no ha dejado comentarios esta semana
                </p>
              </div>
            )}
          </div>
          )}

        </div>
      )}
    </>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function FamiliaTab({ onNavigateToEjercicio, onNavigateToTerapeuta }: Props) {
  const { user, patient, profile } = useAuth()
  const { selectedPatientId } = useTherapist()

  const isTherapist = profile?.role === 'therapist'
  const patientId = isTherapist ? selectedPatientId : patient?.id ?? null
  const isSupabaseMode = !!(user && patientId)

  // ── Estado único: la cuenta TIENE terapeuta conectado o NO ────────────────
  // Family: linked once a therapist accepts (patients.therapist_id set), or
  // optimistically right after connecting from the dashboard modal.
  // Therapist view and demo/showcase always render the connected variant.
  const [connectedOverride, setConnectedOverride] = useState(false)
  const hasTherapist = isTherapist
    ? true
    : isSupabaseMode
      ? (!!patient?.therapist_id || connectedOverride)
      : true

  // Supabase state
  const [sbSessions, setSbSessions] = useState<DbSession[]>([])
  const [sbComment, setSbComment] = useState<TherapistComment | null>(null)
  const [sbLoaded, setSbLoaded] = useState(false)
  const [sbChild, setSbChild] = useState<DbChild | null>(null)
  const [sbLevel, setSbLevel] = useState<{ min: number; max: number } | null>(null)

  // localStorage fallback (demo mode only)
  const localChildName = useMemo(getChildName, [])
  const localStats = useMemo(getLocalWeekStats, [])
  const localComment = useMemo(() => getLocalTherapistComment(localChildName), [localChildName])

  useEffect(() => {
    if (!isSupabaseMode) { setSbLoaded(false); return }
    setSbLoaded(false)
    setSbSessions([])
    setSbComment(null)
    setSbChild(null)
    setSbLevel(null)

    async function fetchData() {
      // Child data: from `children` for therapist, `children_family_view` for
      // family (PD-4 — keeps clinical_notes off the family client).
      const fetchChild = isTherapist
        ? supabase.from('children').select('*').eq('id', patientId!).single()
        : supabase.from('children_family_view').select('*').eq('family_id', user!.id).maybeSingle()

      const [sessRes, commentRes, chRes, level] = await Promise.all([
        supabase
          .from('sessions')
          .select('*')
          .eq('child_id', patientId!)
          .order('started_at', { ascending: false })
          .limit(50),
        supabase
          .from('therapist_comments')
          .select('*')
          .eq('patient_id', patientId!)
          .eq('week_code', getWeekCode())
          .single(),
        fetchChild,
        getCurrentLevel(patientId!),
      ])

      setSbSessions((sessRes.data ?? []) as DbSession[])
      setSbComment(commentRes.data as TherapistComment | null)
      setSbChild(chRes.data as DbChild | null)
      setSbLevel(level)
      setSbLoaded(true)
    }

    fetchData()
  }, [isSupabaseMode, patientId, isTherapist, user])

  const activePatient = sbChild

  // ── Therapist: no patient selected ──────────────────────────────────────
  if (isTherapist && !selectedPatientId) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'Nunito, sans-serif',
        textAlign: 'center',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ClipboardList size={48} color="#1A8FB5" />
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#33302A' }}>
          Selecciona un paciente
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', maxWidth: '360px', lineHeight: 1.6 }}>
          Ve al dashboard clínico y selecciona un paciente para ver su informe semanal.
        </p>
        <button
          onClick={onNavigateToTerapeuta}
          style={{
            marginTop: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: '#1A8FB5',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'Nunito, sans-serif',
            cursor: 'pointer',
          }}
        >
          Ir al dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: 'Nunito, sans-serif',
      width: '100%',
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
    }}>
      {/* Therapist view banner */}
      {isTherapist && selectedPatientId && (
        <div style={{
          width: '100%',
          maxWidth: '960px',
          marginBottom: '16px',
          background: '#EAF3F5',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid rgba(11,175,190,0.2)',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={onNavigateToTerapeuta}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '13px', fontWeight: 700, color: '#6B7280',
              fontFamily: 'Nunito, sans-serif', padding: 0, flexShrink: 0,
            }}
          >
            Volver al dashboard
          </button>
          <div style={{ width: '1px', height: '14px', background: '#E2E8F0', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#33302A', fontFamily: 'Nunito, sans-serif' }}>
            Viendo como: <strong>{activePatient?.full_name ?? 'Paciente'}</strong>
          </span>
          <span style={{
            marginLeft: 'auto',
            background: '#1A8FB5', color: '#ffffff',
            fontSize: '11px', fontWeight: 700, fontFamily: 'Nunito, sans-serif',
            padding: '3px 10px', borderRadius: '20px', flexShrink: 0,
          }}>
            Vista terapeuta
          </span>
        </div>
      )}

      <FamiliaContent
        activePatient={activePatient}
        sbSessions={sbSessions}
        sbComment={sbComment}
        sbLevel={sbLevel}
        sbLoaded={sbLoaded}
        isSupabaseMode={isSupabaseMode}
        localChildName={localChildName}
        localStats={localStats}
        localComment={localComment}
        onNavigateToEjercicio={onNavigateToEjercicio}
        hasTherapist={hasTherapist}
        connectPatientId={isTherapist ? null : patientId}
        onTherapistConnected={() => setConnectedOverride(true)}
      />
    </div>
  )
}
