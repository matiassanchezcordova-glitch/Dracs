import { useEffect, useMemo, useRef, useState } from 'react'
import { TrendingUp, Calendar, Star, Flame, FileText } from 'lucide-react'
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

function getTomorrowLabel(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const labels = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${labels[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
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

// ── Achievement badge ─────────────────────────────────────────────────────

function AchievementBadge({
  icon,
  label,
  gradient,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  gradient: string
  delay?: number
}) {
  return (
    <>
      <style>{`
        @keyframes shimmerMove {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '14px',
          background: gradient,
          backgroundSize: '200% auto',
          animation: `shimmerMove 2.8s linear ${delay}ms infinite`,
          flex: 1,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex', color: '#ffffff' }}>{icon}</span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
      </div>
    </>
  )
}

// ── Week day grid ─────────────────────────────────────────────────────────

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const THIS_WEEK_DONE  = [true, true, true, true, true, false, false]
const LAST_WEEK_DONE  = [true, false, false, true, false, false, false]

const todayDowIndex = (() => {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
})()

function WeekGrid({ label, done, color, showToday }: { label: string; done: boolean[]; color: string; showToday?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', fontFamily: 'Nunito, sans-serif' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
        {DAYS_SHORT.map((d, i) => {
          const isToday = showToday && i === todayDowIndex
          return (
            <div
              key={d}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: done[i] ? color : 'transparent',
                border: isToday
                  ? `3px solid ${color}`
                  : done[i]
                    ? 'none'
                    : '2px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: done[i] ? '#ffffff' : isToday ? color : '#CBD5E1',
                flexShrink: 0,
                fontFamily: 'Nunito, sans-serif',
                animation: done[i] ? `circleIn 0.4s ease ${i * 80}ms both` : 'none',
                boxShadow: isToday ? `0 0 0 3px ${color}33` : 'none',
              }}
            >
              {done[i] ? '✓' : d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Glass card ────────────────────────────────────────────────────────────

function Card({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.16)'
          : '0 4px 20px rgba(0,0,0,0.08)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        ...s,
      }}
    >
      {children}
    </div>
  )
}

// ── Primary button ────────────────────────────────────────────────────────

function PrimaryButton({ children, onClick, style: s }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '14px',
        border: 'none',
        background: 'linear-gradient(135deg, #0BAFBE, #0891A0)',
        color: '#ffffff',
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: 'Nunito, sans-serif',
        transition: 'all 0.2s ease',
        filter: hovered ? 'brightness(1.1)' : 'brightness(1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: '0 4px 20px rgba(11,175,190,0.28)',
        ...s,
      }}
    >
      {children}
    </button>
  )
}

// ── Report button ─────────────────────────────────────────────────────────

function ReportButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.3)',
        background: hovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'Nunito, sans-serif',
        alignSelf: 'flex-start',
        transition: 'background 0.18s ease',
      }}
    >
      <FileText size={16} color="#ffffff" />
      Ver informe de esta semana →
    </button>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function FamiliaTab({ onNavigateToEjercicio }: Props) {
  const [showReport, setShowReport] = useState(false)

  // All hooks before any conditional render
  const childName     = useMemo(getChildName, [])
  const stats         = useMemo(getWeekStats, [])
  const tomorrowLabel = useMemo(getTomorrowLabel, [])
  const sessionCount  = useCountUp(stats.sessionsThisWeek)
  const accuracyVal   = useCountUp(stats.accuracyThisWeek)

  const weekGoingWell   = stats.sessionsThisWeek >= 3 && stats.accuracyThisWeek >= 70
  const improvingVsLast = stats.accuracyThisWeek > stats.lastWeekAccuracy
  const sessionDiff     = stats.sessionsThisWeek - stats.lastWeekSessions

  const badges: { icon: React.ReactNode; label: string; gradient: string; delay: number }[] = []
  if (stats.sessionsThisWeek >= 5)
    badges.push({ icon: <Star size={18} />, label: 'Semana perfecta', gradient: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)', delay: 0 })
  if (improvingVsLast)
    badges.push({ icon: <TrendingUp size={18} />, label: 'Mejor que nunca', gradient: 'linear-gradient(90deg, #22C55E, #4ADE80, #22C55E)', delay: 200 })
  if (stats.streak > 3)
    badges.push({ icon: <Flame size={18} />, label: `En racha · ${stats.streak} días`, gradient: 'linear-gradient(90deg, #F97316, #FB923C, #F97316)', delay: 400 })

  return (
    <div
      style={{
        fontFamily: 'Nunito, sans-serif',
        width: '100%',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      {showReport && <WeeklyReport onBack={() => setShowReport(false)} />}

      {!showReport && (
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >

        {/* ── Hero card ──────────────────────────────────────────── */}
        <div
          style={{
            background: 'rgba(0,0,0,0.20)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '22px',
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              Hola, familia de {childName}
            </h1>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.75)',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {weekGoingWell
                ? 'Esta semana va muy bien'
                : 'Esta semana necesita más práctica'}
            </p>
          </div>

          {/* Sessions this week — large number */}
          <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '16px' }}>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 900,
                color: '#FFD93D',
                lineHeight: 1,
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {sessionCount}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Nunito, sans-serif',
                marginTop: '3px',
              }}
            >
              sesiones esta semana
            </div>
          </div>
        </div>

        {/* ── Weekly report button ──────────────────────────────── */}
        <ReportButton onClick={() => setShowReport(true)} />

        {/* ── Achievement badges ─────────────────────────────────── */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {badges.map((b, i) => (
              <AchievementBadge key={i} icon={b.icon} label={b.label} gradient={b.gradient} delay={b.delay} />
            ))}
          </div>
        )}

        {/* ── Weekly comparison ──────────────────────────────────── */}
        <Card>
          <p style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
            Esta semana vs. semana anterior
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <WeekGrid label="Esta semana" done={THIS_WEEK_DONE} color="#0BAFBE" showToday />
            <WeekGrid label="Semana anterior" done={LAST_WEEK_DONE} color="#94A3B8" />
          </div>

          {sessionDiff !== 0 && (
            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                backgroundColor: sessionDiff > 0 ? '#F0FDF4' : '#FFF1F2',
                borderRadius: '10px',
                padding: '9px 13px',
              }}
            >
              <TrendingUp size={15} color={sessionDiff > 0 ? '#16A34A' : '#F87171'} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: sessionDiff > 0 ? '#15803D' : '#DC2626', fontFamily: 'Nunito, sans-serif' }}>
                {sessionDiff > 0
                  ? `${sessionDiff} sesión${sessionDiff > 1 ? 'es' : ''} más que la semana pasada`
                  : `${Math.abs(sessionDiff)} sesión${Math.abs(sessionDiff) > 1 ? 'es' : ''} menos que la semana pasada`}
              </span>
            </div>
          )}
        </Card>

        {/* ── Vocabulary progress ─────────────────────────────────── */}
        <Card>
          <p style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
            Progreso de vocabulario
          </p>

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <div
              style={{
                height: '28px',
                backgroundColor: '#D0F1F4',
                borderRadius: '99px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${accuracyVal}%`,
                  background: 'linear-gradient(90deg, #0BAFBE, #FFD93D)',
                  borderRadius: '99px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '10px',
                  transition: 'width 0.8s ease',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#ffffff', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' }}>
                  {accuracyVal}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', fontFamily: 'Nunito, sans-serif' }}>
              Empezó en {stats.lastWeekAccuracy}% · Ahora en {stats.accuracyThisWeek}%
            </span>
            {improvingVsLast && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#22C55E',
                  backgroundColor: '#F0FDF4',
                  padding: '2px 9px',
                  borderRadius: '20px',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                +{stats.accuracyThisWeek - stats.lastWeekAccuracy}%
              </span>
            )}
          </div>

          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94A3B8', fontWeight: 500, fontFamily: 'Nunito, sans-serif' }}>
            Nivel 3 — vocabulario receptivo
          </p>
        </Card>

        {/* ── Recent sessions ─────────────────────────────────────── */}
        <Card>
          <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
            Últimas sesiones de {childName}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { date: 'Lun 13 abr', duration: 28, exercises: 7, accuracy: 85 },
              { date: 'Vie 11 abr', duration: 31, exercises: 7, accuracy: 78 },
              { date: 'Jue 10 abr', duration: 25, exercises: 7, accuracy: 72 },
            ].map((s, i) => {
              const barColor  = s.accuracy >= 80 ? '#22C55E' : s.accuracy >= 60 ? '#FFD93D' : '#F87171'
              const badgeColor = s.accuracy >= 80 ? '#22C55E' : s.accuracy >= 60 ? '#D97706' : '#F87171'
              const badgeBg   = s.accuracy >= 80 ? '#F0FDF4' : s.accuracy >= 60 ? '#FFFBEB' : '#FFF1F2'
              return (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(248,250,252,0.8)',
                    overflow: 'hidden',
                    animation: `circleIn 0.35s ease ${i * 80}ms both`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0, top: 0, bottom: 0,
                      width: `${s.accuracy}%`,
                      backgroundColor: barColor,
                      opacity: 0.07,
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
                      {s.date}
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
                      {s.duration} min · {s.exercises} ejercicios
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      fontSize: '12px',
                      fontWeight: 800,
                      fontFamily: 'Nunito, sans-serif',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {s.accuracy}%
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ── Next session ─────────────────────────────────────────── */}
        <Card style={{ background: 'rgba(240,250,250,0.92)', border: '1px solid rgba(165,228,236,0.6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ color: '#0BAFBE' }}>
              <Calendar size={36} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A', fontFamily: 'Nunito, sans-serif' }}>
                Próxima sesión recomendada
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 800, color: '#0BAFBE', textTransform: 'capitalize', fontFamily: 'Nunito, sans-serif' }}>
                mañana · {tomorrowLabel}
              </p>
            </div>
            <PrimaryButton
              onClick={onNavigateToEjercicio}
              style={{ width: '100%', padding: '13px', fontSize: '15px' }}
            >
              Ir a los ejercicios
            </PrimaryButton>
          </div>
        </Card>

      </div>
      )}
    </div>
  )
}
