import { useState, useEffect, useRef } from 'react'
import { Smile, Heart, Stethoscope, Sparkles } from 'lucide-react'
import { loadHistory } from '../hooks/useChildProfile'

export type Role = 'child' | 'family' | 'therapist'

interface Props {
  onSelect: (role: Role) => void
  onAbout: () => void
}

// ── Hooks ──────────────────────────────────────────────────────────────

function useCurrentTime() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ── Data helpers ───────────────────────────────────────────────────────

function loadChildProfile(): { name: string; age: number; level: number; streak: number } | null {
  try {
    const raw = localStorage.getItem('dracs_child_profile')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function compute7dAccuracy(): number {
  const history = loadHistory()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const recent = history.filter(s => new Date(s.date) >= cutoff)
  if (!recent.length) return 85
  const total = recent.reduce((a, s) => a + s.total, 0)
  const correct = recent.reduce((a, s) => a + s.correct, 0)
  return total > 0 ? Math.round((correct / total) * 100) : 85
}

function computeSessionsThisWeek(): number {
  const history = loadHistory()
  const monday = new Date()
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const thisWeek = history.filter(s => new Date(s.date) >= monday)
  return new Set(thisWeek.map(s => s.date)).size
}

// ── Role card ──────────────────────────────────────────────────────────

interface RoleCardProps {
  icon: React.ReactNode
  badge: string
  title: string
  description: string
  footerLeft: string
  footerRight: string
  onClick: () => void
  delay?: number
  tealBg?: boolean
  extraContent?: React.ReactNode
}

function RoleCard({
  icon, badge, title, description, footerLeft, footerRight,
  onClick, delay = 0, tealBg = false, extraContent,
}: RoleCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: tealBg ? '#F0FAFA' : '#FFFFFF',
        border: '1px solid #F1F5F9',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        animation: `cardStagger 0.5s ease ${delay}ms both`,
        width: '100%',
      }}
    >
      {/* Badge */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: '#FFF3CD',
        color: '#92400E',
        fontSize: '11px',
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: '20px',
        fontFamily: 'Nunito, sans-serif',
        letterSpacing: '0.02em',
      }}>
        {badge}
      </div>

      {/* Icon */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: '#F0FAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: '#0BAFBE',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 8px',
        fontFamily: '"Playfair Display", serif',
        fontSize: '28px',
        fontWeight: 700,
        color: '#1A1A2E',
        lineHeight: 1.15,
        paddingRight: '60px',
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        margin: '0 0 20px',
        fontFamily: 'Nunito, sans-serif',
        fontSize: '14px',
        color: '#6B7280',
        fontWeight: 400,
        lineHeight: 1.55,
      }}>
        {description}
      </p>

      {extraContent}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #F1F5F9',
        paddingTop: '14px',
      }}>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
          {footerLeft}
        </span>
        <span style={{ fontSize: '12px', color: '#0BAFBE', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          {footerRight}
        </span>
      </div>
    </button>
  )
}

// ── About card ─────────────────────────────────────────────────────────

function AboutCard({ onAbout }: { onAbout: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onAbout}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 'calc((100% - 40px) / 3)',
        background: '#FFFBF0',
        border: '1px solid #F1F5F9',
        borderRadius: '20px',
        padding: '24px 28px',
        boxShadow: hovered ? '0 10px 30px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        textAlign: 'left',
        animation: 'cardStagger 0.5s ease 300ms both',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: '#FFF3CD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFD93D',
        }}>
          <Sparkles size={22} />
        </div>
        <div style={{
          background: '#FFF3CD',
          color: '#92400E',
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '20px',
          fontFamily: 'Nunito, sans-serif',
        }}>
          discover
        </div>
      </div>

      <h3 style={{
        margin: '0 0 6px',
        fontFamily: '"Playfair Display", serif',
        fontSize: '24px',
        fontWeight: 700,
        color: '#1A1A2E',
        lineHeight: 1.2,
      }}>
        El proyecto detrás de Dracs.
      </h3>
      <p style={{
        margin: '0 0 16px',
        fontSize: '14px',
        color: '#6B7280',
        fontFamily: 'Nunito, sans-serif',
        lineHeight: 1.5,
        fontWeight: 400,
      }}>
        1.2M personas en lista de espera en España. Esto es lo que estamos cambiando.
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #F1F5F9',
        paddingTop: '14px',
      }}>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
          EAE · Babson 2026
        </span>
        <span style={{ fontSize: '12px', color: '#0BAFBE', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          + leer manifiesto
        </span>
      </div>
    </button>
  )
}

// ── Main ───────────────────────────────────────────────────────────────

export default function RoleSelector({ onSelect, onAbout }: Props) {
  const time = useCurrentTime()
  const profile = loadChildProfile()
  const streak = profile?.streak ?? 12
  const accuracy = compute7dAccuracy()
  const sessionsThisWeek = computeSessionsThisWeek() || 5

  const { ref: rolesRef, visible: rolesVisible } = useScrollReveal()
  const { ref: futureRef, visible: futureVisible } = useScrollReveal()

  const formattedTime = time.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      fontFamily: 'Nunito, sans-serif',
    }}>

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/dragon.nb.png"
            alt="DRACS"
            style={{
              height: '28px',
              width: 'auto',
              animation: 'floatDragon2 3s ease-in-out infinite',
            }}
          />
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '20px',
            color: '#0BAFBE',
            letterSpacing: '2px',
          }}>
            DRACS
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '20px',
          padding: '8px 16px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22C55E',
            animation: 'greenPulse 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: '12px',
            color: '#6B7280',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 500,
          }}>
            Terapia adaptativa · v1
          </span>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="dracs-hero-section"
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 48px 80px',
          gap: '48px',
        }}
      >
        {/* Left column (55%) */}
        <div style={{
          flex: '0 0 55%',
          animation: 'heroFadeIn 0.8s ease both',
        }}>
          <div style={{
            display: 'inline-flex',
            background: '#FFF3CD',
            color: '#92400E',
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '20px',
            letterSpacing: '0.04em',
            marginBottom: '28px',
            fontFamily: 'Nunito, sans-serif',
          }}>
            TERAPIA ADAPTATIVA · SÍNDROME DE DOWN
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(48px, 6vw, 80px)',
            fontWeight: 700,
            color: '#1A1A2E',
            lineHeight: 1.1,
          }}>
            Cada palabra<br />
            tiene su <span style={{ color: '#0BAFBE' }}>momento.</span>
          </h1>

          <p style={{
            marginTop: '24px',
            marginBottom: 0,
            fontSize: '18px',
            color: '#6B7280',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 400,
            maxWidth: '480px',
            lineHeight: 1.65,
          }}>
            Dracs convierte la sesión de logopedia en un ritual diario que se adapta al niño, no al revés.{' '}
            <span style={{ fontWeight: 600, color: '#1A1A2E' }}>
              Listas de espera fuera. Datos clínicos dentro.
            </span>
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '32px' }}>
            {['3–10 años', 'Síndrome de Down · TEA · Apraxia', 'Avalado por logopedas'].map(text => (
              <div key={text} style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#6B7280',
                fontSize: '13px',
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: '20px',
                fontFamily: 'Nunito, sans-serif',
              }}>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right column (45%) */}
        <div style={{
          flex: '0 0 45%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'heroFadeIn 0.8s ease 0.4s both',
        }}>
          {/* Dragon — behind the card */}
          <img
            src="/dragon.nb.png"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-30px',
              width: '200px',
              height: 'auto',
              animation: 'floatDragon2 3s ease-in-out infinite',
              zIndex: 0,
            }}
          />

          {/* Stats card */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                color: '#94A3B8',
                letterSpacing: '0.1em',
                fontWeight: 600,
                fontFamily: 'Nunito, sans-serif',
              }}>
                HOY
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
                {formattedTime}
              </span>
            </div>

            {/* Name */}
            <h2 style={{
              margin: '0 0 4px',
              fontFamily: '"Playfair Display", serif',
              fontSize: '32px',
              fontWeight: 700,
              color: '#1A1A2E',
              lineHeight: 1.1,
            }}>
              {profile ? `${profile.name}, ${profile.age}` : 'Pablo, 7'}
            </h2>
            <p style={{
              margin: '0 0 16px',
              fontSize: '12px',
              color: '#94A3B8',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
            }}>
              Sesión preparada · Nivel {profile?.level ?? 3} · Vocabulario funcional
            </p>

            <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '20px' }} />

            {/* Metrics */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[
                { value: String(streak), label: 'RACHA' },
                { value: `${accuracy}%`, label: 'ACIERTOS · 7D' },
                { value: `${sessionsThisWeek}/5`, label: 'SESIONES · SEM.' },
              ].map(({ value, label }) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#0BAFBE',
                    lineHeight: 1,
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    letterSpacing: '0.08em',
                    marginTop: '4px',
                    fontWeight: 600,
                    fontFamily: 'Nunito, sans-serif',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '16px' }} />

            {/* Session pill */}
            <div style={{
              background: '#FFF3CD',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#92400E',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
            }}>
              Empieza con 4 ejercicios suaves · 5 min
            </div>

            {/* CTA button */}
            <HeroCTAButton onClick={() => onSelect('child')} />
          </div>
        </div>
      </section>

      {/* ── ROL SELECTION ────────────────────────────────────────── */}
      <section
        ref={rolesRef as React.RefObject<HTMLElement>}
        style={{
          padding: '80px 48px',
          opacity: rolesVisible ? 1 : 0,
          transform: rolesVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '48px',
        }}>
          <h2 style={{ margin: 0, fontFamily: '"Playfair Display", serif', lineHeight: 1.15 }}>
            <span style={{
              display: 'block',
              fontSize: 'clamp(36px, 4vw, 48px)',
              fontWeight: 700,
              color: '#1A1A2E',
            }}>
              ¿Quién está
            </span>
            <span style={{
              display: 'block',
              fontSize: 'clamp(36px, 4vw, 48px)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#0BAFBE',
            }}>
              aquí hoy?
            </span>
          </h2>
          <p style={{
            maxWidth: '280px',
            fontSize: '14px',
            color: '#6B7280',
            fontFamily: 'Nunito, sans-serif',
            lineHeight: 1.65,
            margin: '8px 0 0',
            fontWeight: 400,
          }}>
            El mismo sistema adapta la interfaz a cada persona: el juego del niño, el panel del clínico, el resumen de la familia.
          </p>
        </div>

        {/* 3 role cards */}
        <div
          className="dracs-role-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <RoleCard
            icon={<Smile size={28} />}
            badge="child · ready"
            title="Hoy toca practicar."
            description={`4 ejercicios · 5 min · adaptados al humor de ${profile?.name ?? 'Pablo'} de hoy.`}
            footerLeft={`nivel ${profile?.level ?? 3} · racha ${streak}`}
            footerRight="+ entrar"
            onClick={() => onSelect('child')}
            delay={0}
          />
          <RoleCard
            icon={<Heart size={28} />}
            badge="family"
            title="Ver el progreso."
            description="Resumen semanal en lenguaje humano, no clínico."
            footerLeft="informe del viernes"
            footerRight="+ ver"
            onClick={() => onSelect('family')}
            delay={100}
          />
          <RoleCard
            icon={<Stethoscope size={28} />}
            badge="clínico"
            title="Soy logopeda."
            description="Panel clínico, hasta 80 pacientes, informes de 1 click."
            footerLeft="SSO · acceso clínico"
            footerRight="+ entrar"
            onClick={() => onSelect('therapist')}
            delay={200}
            tealBg
            extraContent={
              <div style={{ position: 'absolute', bottom: '56px', right: '20px', opacity: 0.4 }}>
                <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                  <polyline
                    points="0,25 15,20 30,14 45,8 60,4"
                    stroke="#0BAFBE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            }
          />
        </div>

        {/* About card — right-aligned, same width as one column */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AboutCard onAbout={onAbout} />
        </div>
      </section>

      {/* ── LO QUE SE VIENE ──────────────────────────────────────── */}
      <section
        ref={futureRef as React.RefObject<HTMLElement>}
        style={{
          padding: '80px 48px',
          opacity: futureVisible ? 1 : 0,
          transform: futureVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '48px',
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(36px, 4vw, 48px)',
            fontWeight: 700,
            color: '#1A1A2E',
          }}>
            Lo que se viene.
          </h2>
          <p style={{
            maxWidth: '280px',
            fontSize: '14px',
            color: '#6B7280',
            fontFamily: 'Nunito, sans-serif',
            lineHeight: 1.65,
            margin: '8px 0 0',
            fontWeight: 400,
          }}>
            Ideas que transforman Dracs de app de ejercicios a compañero clínico del niño.
          </p>
        </div>

        <div
          className="dracs-future-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
        >
          {[
            { num: '01', tag: 'voz',      title: 'Reconocimiento de habla',  desc: 'La app escucha y evalúa la pronunciación en tiempo real.' },
            { num: '02', tag: 'atención', title: 'Lectura de fatiga',         desc: 'Detecta cuando el niño pierde concentración y adapta la sesión.' },
            { num: '03', tag: 'cohorte',  title: 'Comparativa anónima',       desc: 'Benchmarks clínicos contra cohorte de edad y diagnóstico.' },
            { num: '04', tag: 'familia',  title: 'Mensajes de voz',           desc: 'El niño graba mensajes de voz para la familia al acabar.' },
          ].map(({ num, tag, title, desc }) => (
            <div key={num} style={{
              background: '#FFFFFF',
              border: '1px solid #F1F5F9',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
                  {num}
                </span>
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: '#0BAFBE', opacity: 0.5,
                }} />
                <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 500 }}>
                  {tag}
                </span>
              </div>
              <h4 style={{
                margin: '0 0 8px',
                fontFamily: '"Playfair Display", serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#1A1A2E',
                lineHeight: 1.25,
              }}>
                {title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#6B7280',
                fontFamily: 'Nunito, sans-serif',
                lineHeight: 1.55,
                fontWeight: 400,
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{
        padding: '32px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        borderTop: '1px solid #F1F5F9',
      }}>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
          Dracs · Barcelona · 2026
        </span>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#6B7280',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            padding: '4px 8px',
          }}
        >
          ↑ Volver arriba
        </button>
      </footer>
    </div>
  )
}

// ── Hero CTA button (extracted to avoid inline handler complexity) ──────

function HeroCTAButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '52px',
        background: '#FFD93D',
        color: '#1A1A2E',
        border: 'none',
        borderRadius: '14px',
        fontSize: '16px',
        fontWeight: 700,
        fontFamily: 'Nunito, sans-serif',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        filter: hovered ? 'brightness(0.95)' : 'brightness(1)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'filter 0.2s ease, transform 0.2s ease',
      }}
    >
      Empezar →
    </button>
  )
}
