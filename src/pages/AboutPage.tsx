import { useEffect, useRef, useState } from 'react'
import {
  MapPin, Users,
  Tablet, Brain, BarChart2,
  Smile, Stethoscope, Heart,
  Euro,
} from 'lucide-react'

interface Props {
  onBack: () => void
}

// ── Scroll reveal wrapper ─────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  style: extraStyle,
}: {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          obs.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(20px)',
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  )
}

// ── SVG wave at section bottom ────────────────────────────────────────────

function WaveBottom({ fill }: { fill: string }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 70"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%' }}
        preserveAspectRatio="none"
      >
        <path fill={fill} d="M0 35 C360 70 1080 0 1440 35 L1440 70 L0 70 Z" />
      </svg>
    </div>
  )
}

// ── Problem stat card ─────────────────────────────────────────────────────

function ProblemCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        borderTop: '4px solid #0BAFBE',
        borderRight: '1px solid #E0F2FE',
        borderBottom: '1px solid #E0F2FE',
        borderLeft: '1px solid #E0F2FE',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        boxShadow: hovered
          ? '0 8px 32px rgba(11,175,190,0.20)'
          : '0 4px 24px rgba(11,175,190,0.12)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ color: '#0BAFBE', display: 'flex' }}>{icon}</div>
      <div className="stat-number" style={{ fontSize: '40px', color: '#0BAFBE', lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#64748B',
          lineHeight: 1.5,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ── How-it-works step ─────────────────────────────────────────────────────

function StepCard({
  index,
  icon,
  title,
  description,
  iconBg,
  iconColor = '#ffffff',
}: {
  index: number
  icon: React.ReactNode
  title: string
  description: string
  iconBg: string
  iconColor?: string
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 20px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: iconBg,
          color: iconColor,
          fontSize: '12px',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
          flexShrink: 0,
        }}
      >
        {index}
      </div>

      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          marginBottom: '20px',
          boxShadow: `0 4px 20px ${iconBg}66`,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: '0 0 8px',
          fontSize: '18px',
          fontWeight: 800,
          color: '#0F172A',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 500,
          color: '#64748B',
          lineHeight: 1.5,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {description}
      </p>
    </div>
  )
}

// ── Audience card ─────────────────────────────────────────────────────────

function AudienceCard({
  icon,
  title,
  description,
  tag,
  bg,
  textColor,
  iconColor,
  iconBg,
  border,
}: {
  icon: React.ReactNode
  title: string
  description: string
  tag: string
  bg: string
  textColor: string
  iconColor: string
  iconBg: string
  border?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: bg,
        borderRadius: '20px',
        border: border ? `1.5px solid ${border}` : 'none',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flex: 1,
        boxShadow: hovered
          ? '0 12px 40px rgba(11,175,190,0.18)'
          : '0 4px 20px rgba(11,175,190,0.10)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: '0 0 8px',
            fontSize: '20px',
            fontWeight: 800,
            color: textColor,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 500,
            color: textColor,
            opacity: 0.75,
            lineHeight: 1.5,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {description}
        </p>
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          padding: '4px 14px',
          borderRadius: '20px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: textColor,
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {tag}
      </span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

const HERO_BG = 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)'
const LIGHT_BG = '#EBF7F5'

export default function AboutPage({ onBack }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100, height: '56px',
          display: 'flex', alignItems: 'center',
          padding: '0 32px',
          background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 2px 12px rgba(11,175,190,0.10)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800,
            fontSize: '22px', color: '#0BAFBE', letterSpacing: '2px',
            padding: 0, transition: 'color 0.3s ease',
          }}
        >
          DRACS
        </button>
      </nav>

      {/* ── SECCIÓN 1: HERO ───────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100svh',
          background: HERO_BG,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '56px',
        }}
      >
        <div
          className="dracs-about-hero-inner"
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '60px 32px 130px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '60px',
          }}
        >
          {/* Left: content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <Reveal>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  background: '#FFF3CD',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  width: 'fit-content',
                }}
              >
                Tecnología · Terapia · Impacto
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '56px',
                  fontWeight: 700,
                  color: '#1A1A2E',
                  lineHeight: 1.1,
                  fontFamily: 'Playfair Display, serif',
                }}
              >
                Terapia que<br />no espera.
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 500,
                  color: '#6B7280',
                  lineHeight: 1.6,
                  maxWidth: '480px',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                Dracs nació para que ningún niño pierda su ventana de aprendizaje
                por culpa de una lista de espera.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  background: 'rgba(11,175,190,0.10)',
                  border: '1px solid rgba(11,175,190,0.25)',
                  color: '#0BAFBE',
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'Nunito, sans-serif',
                  letterSpacing: '0.2px',
                  width: 'fit-content',
                }}
              >
                Babson Student Challenge 2026
              </div>
            </Reveal>
          </div>

          {/* Right: dragon */}
          <div className="dracs-about-hero-dragon" style={{ flexShrink: 0 }}>
            <img
              src="/dragon.nb.png"
              alt="DRACS dragón"
              style={{
                height: '220px',
                width: 'auto',
                animation: 'floatDragon2 3s ease-in-out infinite',
                filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.10))',
              }}
            />
          </div>
        </div>

        <WaveBottom fill="#ffffff" />
      </section>

      {/* ── SECCIÓN 2: EL PROBLEMA ────────────────────────────────── */}
      <section
        id="section-problema"
        className="dracs-about-section"
        style={{
          background: '#ffffff',
          padding: '80px 32px 110px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                textAlign: 'center',
                fontSize: '40px',
                fontWeight: 800,
                color: '#0BAFBE',
                margin: '0 0 12px',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              Un problema que no puede esperar.
            </h2>
            <p style={{
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 500,
              color: '#94A3B8',
              margin: '0 0 48px',
              fontFamily: 'Nunito, sans-serif',
            }}>
              Los datos hablan solos.
            </p>
          </Reveal>

          <div className="dracs-about-problem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <Reveal delay={0}>
              <ProblemCard
                icon={<MapPin size={28} />}
                value="70%"
                label="de las plazas de terapia están en grandes ciudades"
              />
            </Reveal>
            <Reveal delay={120}>
              <ProblemCard
                icon={<Users size={28} />}
                value="1:1.200"
                label="ratio terapeuta por paciente en zonas rurales"
              />
            </Reveal>
            <Reveal delay={240}>
              <ProblemCard
                icon={<Euro size={28} />}
                value="3.800€/mes"
                label="coste de terapia intensiva privada para autismo"
              />
            </Reveal>
          </div>
        </div>

        <WaveBottom fill={LIGHT_BG} />
      </section>

      {/* ── SECCIÓN 3: CÓMO FUNCIONA ──────────────────────────────── */}
      <section
        className="dracs-about-section"
        style={{
          background: LIGHT_BG,
          padding: '80px 32px 110px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                textAlign: 'center',
                fontSize: '40px',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 64px',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              ¿Cómo funciona Dracs?
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ position: 'relative' }}>
              <div
                className="dracs-about-steps-connector"
                style={{
                  position: 'absolute',
                  top: '68px',
                  left: '16.67%',
                  right: '16.67%',
                  borderTop: '2.5px dashed rgba(11,175,190,0.35)',
                  zIndex: 0,
                }}
              />
              <div className="dracs-about-steps-row" style={{ display: 'flex' }}>
                <StepCard
                  index={1}
                  icon={<Tablet size={28} />}
                  title="El niño practica en casa"
                  description="Ejercicios adaptativos diarios desde cualquier tablet"
                  iconBg="#0BAFBE"
                />
                <StepCard
                  index={2}
                  icon={<Brain size={28} />}
                  title="La IA se adapta"
                  description="Ajusta dificultad en tiempo real según atención y rendimiento"
                  iconBg="#FFD93D"
                  iconColor="#1E3A3E"
                />
                <StepCard
                  index={3}
                  icon={<BarChart2 size={28} />}
                  title="El terapeuta supervisa"
                  description="Dashboard completo sin trabajo administrativo extra"
                  iconBg="#0BAFBE"
                />
              </div>
            </div>
          </Reveal>
        </div>

        <WaveBottom fill="#ffffff" />
      </section>

      {/* ── SECCIÓN 4: PARA QUIÉN ─────────────────────────────────── */}
      <section
        className="dracs-about-section"
        style={{
          background: '#ffffff',
          padding: '80px 32px 110px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                textAlign: 'center',
                fontSize: '40px',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 48px',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              Diseñado para todos
            </h2>
          </Reveal>

          <div className="dracs-about-audience-row" style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
            <Reveal delay={0} style={{ flex: 1, display: 'flex' }}>
              <AudienceCard
                icon={<Smile size={28} />}
                title="Niños con Síndrome de Down"
                description="Ejercicios de vocabulario adaptados, gamificados y supervisados"
                tag="3 a 10 años"
                bg="#0891A0"
                textColor="#ffffff"
                iconColor="#ffffff"
                iconBg="rgba(255,255,255,0.2)"
              />
            </Reveal>
            <Reveal delay={120} style={{ flex: 1, display: 'flex' }}>
              <AudienceCard
                icon={<Stethoscope size={28} />}
                title="Terapeutas y logopedas"
                description="Dashboard clínico, informes automáticos, hasta 80 pacientes"
                tag="Panel profesional"
                bg="#ffffff"
                textColor="#0F172A"
                iconColor="#0BAFBE"
                iconBg="#F0FAFA"
                border="#B2E4EC"
              />
            </Reveal>
            <Reveal delay={240} style={{ flex: 1, display: 'flex' }}>
              <AudienceCard
                icon={<Heart size={28} />}
                title="Familias"
                description="Seguimiento claro del progreso semanal sin conocimientos médicos"
                tag="Vista familiar"
                bg="#FFFBEB"
                textColor="#92400E"
                iconColor="#FBBF24"
                iconBg="rgba(251,191,36,0.15)"
                border="#FDE68A"
              />
            </Reveal>
          </div>
        </div>

        <WaveBottom fill={LIGHT_BG} />
      </section>

      {/* ── SECCIÓN 5: FOOTER CTA ─────────────────────────────────── */}
      <section
        style={{
          background: LIGHT_BG,
          padding: '80px 32px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
        }}
      >
        <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src="/dragon.nb.png"
            alt=""
            style={{
              height: '80px',
              width: 'auto',
              animation: 'floatDragon 3s ease-in-out infinite',
              filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.10))',
            }}
          />
        </Reveal>

        <Reveal delay={100}>
          <h2
            style={{
              margin: 0,
              fontSize: '40px',
              fontWeight: 700,
              color: '#1A1A2E',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Dracs está en desarrollo.
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 500,
              color: '#6B7280',
              maxWidth: '480px',
              lineHeight: 1.6,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Si trabajás con niños con necesidades especiales,
            queremos conocerte.
          </p>
        </Reveal>

        <Reveal delay={300} style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="mailto:dracs.app@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '16px 40px',
              borderRadius: '16px',
              background: '#0BAFBE',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 800,
              textDecoration: 'none',
              fontFamily: 'Nunito, sans-serif',
              boxShadow: '0 4px 24px rgba(11,175,190,0.30)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 8px 32px rgba(11,175,190,0.40)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 4px 24px rgba(11,175,190,0.30)'
            }}
          >
            Escribinos
          </a>
        </Reveal>

        <Reveal delay={400}>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 500,
              color: '#94A3B8',
              lineHeight: 1.6,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Babson Student Challenge 2026 · Barcelona
          </p>
        </Reveal>
      </section>

      <style>{`
        @keyframes heroBtnFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
