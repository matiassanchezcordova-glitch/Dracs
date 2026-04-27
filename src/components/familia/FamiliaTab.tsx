import { useEffect, useMemo, useRef, useState } from 'react'
import { Star, Flame, TrendingUp, ArrowRight, Check } from 'lucide-react'
import WeeklyReport from './WeeklyReport'

interface Props {
  onNavigateToEjercicio: () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────

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
    .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function getWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

interface TherapistComment { texto: string; fecha: string; terapeuta: string }

function getTherapistComment(childName: string): TherapistComment | null {
  try {
    const slug = slugify(childName)
    const key = `dracs_comment_${slug}_${getWeekKey()}`
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as TherapistComment) : null
  } catch { return null }
}

interface WeekStats {
  streak: number
  sessionsThisWeek: number
  lastWeekSessions: number
  accuracyThisWeek: number
  lastWeekAccuracy: number
}

function getWeekStats(): WeekStats {
  const defaults: WeekStats = {
    streak: 5,
    sessionsThisWeek: 5,
    lastWeekSessions: 2,
    accuracyThisWeek: 85,
    lastWeekAccuracy: 67,
  }
  try {
    const rawProfile = localStorage.getItem('dracs_child_profile')
    const rawHistory = localStorage.getItem('dracs_session_history')
    if (!rawProfile) return defaults

    const profile = JSON.parse(rawProfile) as { streak?: number }
    const history = rawHistory
      ? (JSON.parse(rawHistory) as { date: string; total: number; correct: number }[])
      : []

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(weekStart.getDate() - 7)

    const thisWeek = history.filter(s => new Date(s.date + 'T00:00:00') >= weekStart)
    const lastWeek = history.filter(s => {
      const d = new Date(s.date + 'T00:00:00')
      return d >= lastWeekStart && d < weekStart
    })

    const calc = (arr: typeof history) => {
      const correct = arr.reduce((a, s) => a + s.correct, 0)
      const total   = arr.reduce((a, s) => a + s.total, 0)
      return total > 0 ? Math.round((correct / total) * 100) : 0
    }

    return {
      streak: profile.streak ?? defaults.streak,
      sessionsThisWeek: thisWeek.length > 0 ? thisWeek.length : defaults.sessionsThisWeek,
      lastWeekSessions: lastWeek.length > 0 ? lastWeek.length : defaults.lastWeekSessions,
      accuracyThisWeek: thisWeek.length > 0 ? calc(thisWeek) : defaults.accuracyThisWeek,
      lastWeekAccuracy: lastWeek.length > 0 ? calc(lastWeek) : defaults.lastWeekAccuracy,
    }
  } catch { return defaults }
}

// ── Count-up ──────────────────────────────────────────────────────────────

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
const THIS_WEEK_DONE = [true, true, true, true, true, false, false]

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
  color: '#0F172A',
  fontFamily: 'Nunito, sans-serif',
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function FamiliaTab({ onNavigateToEjercicio: _onNavigateToEjercicio }: Props) {
  const [showReport, setShowReport] = useState(false)

  const childName        = useMemo(getChildName, [])
  const stats            = useMemo(getWeekStats, [])
  const therapistComment = useMemo(() => getTherapistComment(childName), [childName])
  const sessionCount     = useCountUp(stats.sessionsThisWeek)
  const accuracyVal      = useCountUp(stats.accuracyThisWeek)
  const improvingVsLast  = stats.accuracyThisWeek > stats.lastWeekAccuracy

  const heroSubtitle =
    stats.sessionsThisWeek >= 5
      ? 'Esta semana ha sido excelente'
      : stats.sessionsThisWeek >= 3
        ? 'La semana va bien'
        : 'Quedan días para practicar'

  const chips: { icon: React.ReactNode; label: string }[] = []
  if (stats.sessionsThisWeek >= 5)
    chips.push({ icon: <Star size={14} />, label: 'Semana perfecta' })
  if (improvingVsLast)
    chips.push({ icon: <TrendingUp size={14} />, label: 'Mejor que nunca' })
  if (stats.streak > 3 && chips.length < 2)
    chips.push({ icon: <Flame size={14} />, label: `${stats.streak} días en racha` })

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
      {showReport && <WeeklyReport onBack={() => setShowReport(false)} />}

      {!showReport && (
        <div style={{
          width: '100%',
          maxWidth: '760px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>

          {/* ── Hero card ──────────────────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.3,
                fontFamily: 'Nunito, sans-serif',
              }}>
                Hola, familia de {childName}
              </h1>
              <p style={{
                margin: '6px 0 0',
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'Nunito, sans-serif',
              }}>
                {heroSubtitle}
              </p>
            </div>

            <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '24px' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 900,
                color: '#FFD93D',
                lineHeight: 1,
                fontFamily: 'Nunito, sans-serif',
              }}>
                {sessionCount}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Nunito, sans-serif',
                marginTop: '4px',
              }}>
                sesiones esta semana
              </div>
            </div>
          </div>

          {/* ── Achievement chips ─────────────────────────────────── */}
          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {chips.slice(0, 2).map((chip, i) => (
                <div key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'Nunito, sans-serif',
                  flexShrink: 0,
                }}>
                  {chip.icon}
                  {chip.label}
                </div>
              ))}
            </div>
          )}

          {/* ── Ver informe button ────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setShowReport(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#ffffff',
                color: '#0BAFBE',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(11,175,190,0.25)',
              }}
            >
              Ver informe semanal
              <ArrowRight size={16} color="#0BAFBE" />
            </button>
          </div>

          {/* ── Esta semana ──────────────────────────────────────── */}
          <Card>
            <p style={CARD_TITLE}>Esta semana</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {DAYS_SHORT.map((d, i) => {
                const done = THIS_WEEK_DONE[i]
                const isToday = i === todayDowIndex && !done
                return (
                  <div
                    key={d}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: done
                        ? '#0BAFBE'
                        : isToday
                          ? 'transparent'
                          : '#F1F5F9',
                      border: isToday ? '2px solid #0BAFBE' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      animation: done ? `circleIn 0.4s ease ${i * 80}ms both` : 'none',
                    }}
                  >
                    {done
                      ? <Check size={12} color="#ffffff" strokeWidth={3} />
                      : <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isToday ? '#0BAFBE' : '#94A3B8',
                          fontFamily: 'Nunito, sans-serif',
                        }}>{d}</span>
                    }
                  </div>
                )
              })}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
              {stats.sessionsThisWeek} sesiones esta semana
            </p>
          </Card>

          {/* ── Progreso de vocabulario ───────────────────────────── */}
          <Card>
            <p style={CARD_TITLE}>Progreso de vocabulario</p>
            <div style={{
              height: '10px',
              backgroundColor: '#E0F2FE',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '10px',
            }}>
              <div style={{
                height: '100%',
                width: `${accuracyVal}%`,
                background: 'linear-gradient(90deg, #0BAFBE, #059669)',
                borderRadius: '5px',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif' }}>
              {stats.accuracyThisWeek}% de aciertos
              {improvingVsLast && (
                <span style={{ color: '#059669', fontWeight: 700 }}>
                  {' '}· +{stats.accuracyThisWeek - stats.lastWeekAccuracy}% vs semana anterior
                </span>
              )}
            </p>
          </Card>

          {/* ── Últimas sesiones ──────────────────────────────────── */}
          <Card>
            <p style={CARD_TITLE}>Últimas sesiones</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Fecha', 'Duración', 'Ejercicios', 'Aciertos'].map((col, i) => (
                    <th key={col} style={{
                      textAlign: i === 0 ? 'left' : 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: 'Nunito, sans-serif',
                      padding: '0 8px 12px',
                      borderBottom: '1px solid #F1F5F9',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Lun 13 abr', duration: 28, exercises: 7, accuracy: 85 },
                  { date: 'Vie 11 abr', duration: 31, exercises: 7, accuracy: 78 },
                  { date: 'Jue 10 abr', duration: 25, exercises: 7, accuracy: 72 },
                ].map((s, i) => {
                  const acColor = s.accuracy >= 80 ? '#059669' : s.accuracy >= 60 ? '#D97706' : '#DC2626'
                  return (
                    <tr key={i} style={{ backgroundColor: i % 2 === 1 ? '#F8FAFC' : 'transparent' }}>
                      <td style={{ padding: '11px 8px', fontSize: '13px', fontWeight: 600, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
                        {s.date}
                      </td>
                      <td style={{ padding: '11px 8px', fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
                        {s.duration} min
                      </td>
                      <td style={{ padding: '11px 8px', fontSize: '13px', color: '#64748B', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
                        {s.exercises}
                      </td>
                      <td style={{ padding: '11px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: acColor, fontFamily: 'Nunito, sans-serif' }}>
                          {s.accuracy}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>

          {/* ── Nota del terapeuta ────────────────────────────────── */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            borderTop: '3px solid #0BAFBE',
          }}>
            {therapistComment ? (
              <>
                <p style={{
                  margin: '0 0 4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'Nunito, sans-serif',
                }}>
                  Nota de tu terapeuta
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
                  {therapistComment.terapeuta} · {therapistComment.fecha}
                </p>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9', marginBottom: '14px' }} />
                <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
                  {therapistComment.texto}
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

        </div>
      )}
    </div>
  )
}
