import { useEffect, useRef, useState } from 'react'
import {
  Gamepad2, Heart, Stethoscope, Play,
  Brain,
  Smile, Mail, ImagePlus,
} from 'lucide-react'

export type Role = 'child' | 'family' | 'therapist' | 'demo'

interface Props {
  onSelect: (role: Role) => void
}

// ── Reveal wrapper (IntersectionObserver) ─────────────────────────────────

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
          el.style.transform = 'translateY(0) scale(1)'
          obs.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(32px) scale(0.98)',
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  )
}

// ── Section kicker ────────────────────────────────────────────────────────

function SectionKicker({ text }: { text: string }) {
  return (
    <span className="section-kicker">
      <span className="dot" />
      {text}
      <span className="dot" />
    </span>
  )
}

// ── Scroll helper ─────────────────────────────────────────────────────────

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── Role row button ───────────────────────────────────────────────────────

interface RoleRowBtnProps {
  icon: React.ReactNode
  iconBg: string
  iconBorder: string
  iconColor: string
  title: string
  subtitle: string
  onClick: () => void
}

function RoleRowBtn({ icon, iconBg, iconBorder, iconColor, title, subtitle, onClick }: RoleRowBtnProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="dracs-role-btn"
      style={{
        height: '64px',
        borderRadius: '14px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        border: `1.5px solid ${hovered ? '#0BAFBE' : '#F1F5F9'}`,
        background: hovered ? '#F0FAFA' : '#ffffff',
        cursor: 'pointer',
        width: '100%',
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        transition: 'all 200ms ease',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: iconBg, border: `1px solid ${iconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div className="dracs-role-btn-title" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 400, lineHeight: 1.2, marginTop: '2px' }}>
          {subtitle}
        </div>
      </div>
    </button>
  )
}

// ── Demo link ─────────────────────────────────────────────────────────────

function DemoLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '5px', fontSize: '13px', fontWeight: 500, color: '#94A3B8',
        fontFamily: 'Nunito, sans-serif', padding: '2px 0',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#0BAFBE')}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#94A3B8')}
    >
      <Play size={12} />
      Ver demo
    </button>
  )
}

// ── "Conoce el proyecto" button ───────────────────────────────────────────

function KnowProjectButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0BAFBE', border: 'none', cursor: 'pointer',
        color: '#ffffff', fontFamily: 'Nunito, sans-serif',
        fontWeight: 700, fontSize: '14px',
        borderRadius: '24px', padding: '12px 28px', marginTop: '32px',
        boxShadow: hovered ? '0 8px 20px rgba(11,175,190,0.45)' : '0 4px 12px rgba(11,175,190,0.30)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
    >
      Conoce el proyecto
    </button>
  )
}

// ── Stat card (El Problema) ───────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#F8FAFC',
        border: '1px solid #F1F5F9',
        borderRadius: '20px',
        padding: '28px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        boxShadow: hovered ? '0 8px 32px rgba(11,175,190,0.15)' : 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{
        fontSize: '48px', fontWeight: 800, color: '#0BAFBE',
        fontFamily: 'Nunito, sans-serif', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '14px', fontWeight: 600, color: '#64748B',
        fontFamily: 'Nunito, sans-serif', lineHeight: 1.5,
      }}>
        {label}
      </div>
    </div>
  )
}

// ── Audience card (Para Quién) ────────────────────────────────────────────

function AudienceCard({ icon, title, description, tag, bg, textColor, iconColor, iconBg, border, delay = 0 }: {
  icon: React.ReactNode; title: string; description: string; tag: string
  bg: string; textColor: string; iconColor: string; iconBg: string; border?: string; delay?: number
}) {
  return (
    <div
      className="dracs-audience-card"
      style={{
        '--card-delay': `${delay}ms`,
        backgroundColor: bg,
        borderRadius: '20px',
        border: border ? `1.5px solid ${border}` : 'none',
        padding: '32px 28px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        flex: 1,
      } as React.CSSProperties}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        backgroundColor: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{
          margin: '0 0 8px',
          fontFamily: 'Playfair Display, serif',
          fontSize: '24px', fontWeight: 700, color: textColor, lineHeight: 1.2,
        }}>
          {title}
        </h3>
        <p style={{
          margin: 0, fontSize: '14px', fontWeight: 500,
          color: textColor, opacity: 0.75, lineHeight: 1.5,
          fontFamily: 'Nunito, sans-serif',
        }}>
          {description}
        </p>
      </div>
      <span style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        padding: '4px 14px', borderRadius: '20px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.3)',
        color: textColor, fontSize: '13px', fontWeight: 700,
        fontFamily: 'Nunito, sans-serif',
      }}>
        {tag}
      </span>
    </div>
  )
}

// ── El Futuro reveal grid ─────────────────────────────────────────────────

function FutureRevealGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.future-card'))
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    cards.forEach(card => obs.observe(card))
    return () => obs.disconnect()
  }, [])

  const items = [
    { num: '01', tag: 'voz',      title: 'Reconocimiento de habla',  desc: 'La app escucha y evalúa la pronunciación en tiempo real.',            delay: 0   },
    { num: '02', tag: 'atención', title: 'Lectura de fatiga',         desc: 'Detecta cuando el niño pierde concentración y adapta la sesión.',      delay: 100 },
    { num: '03', tag: 'cohorte',  title: 'Comparativa anónima',       desc: 'Benchmarks clínicos contra cohorte de edad y diagnóstico.',            delay: 200 },
    { num: '04', tag: 'familia',  title: 'Mensajes de voz',           desc: 'El niño graba mensajes de voz para la familia al acabar.',             delay: 300 },
  ]

  return (
    <div ref={containerRef} className="dracs-future-grid" style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
    }}>
      {items.map(({ num, tag, title, desc, delay }) => (
        <div
          key={num}
          className="future-card"
          style={{ '--card-delay': `${delay}ms` } as React.CSSProperties}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>{num}</span>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0BAFBE', opacity: 0.5 }} />
            <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 500 }}>{tag}</span>
          </div>
          <h4 style={{ margin: '0 0 8px', fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.25 }}>
            {title}
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.55 }}>
            {desc}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Para Quién reveal grid ────────────────────────────────────────────────

function AudienceRevealGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.dracs-audience-card'))
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    cards.forEach(card => obs.observe(card))
    return () => obs.disconnect()
  }, [])

  const cards = [
    {
      icon: <Smile size={32} />,
      title: 'Niños que necesitan apoyo',
      description: 'Ejercicios de vocabulario adaptados y gamificados, supervisados por un profesional. Para niños de 3 a 10 años.',
      tag: '3 a 10 años',
      bg: '#1A1A2E', textColor: '#ffffff',
      iconColor: '#ffffff', iconBg: 'rgba(255,255,255,0.1)',
      delay: 0,
    },
    {
      icon: <Stethoscope size={32} />,
      title: 'Terapeutas y logopedas',
      description: 'Dashboard clínico, informes automáticos, hasta 80 pacientes.',
      tag: 'Panel profesional',
      bg: '#ffffff', textColor: '#1A1A2E',
      iconColor: '#0BAFBE', iconBg: '#F0FAFA',
      border: '#0BAFBE',
      delay: 150,
    },
    {
      icon: <Heart size={32} />,
      title: 'Familias',
      description: 'Seguimiento claro del progreso semanal sin conocimientos médicos.',
      tag: 'Vista familiar',
      bg: '#FFFBF0', textColor: '#92400E',
      iconColor: '#D97706', iconBg: 'rgba(217,119,6,0.1)',
      border: '#FDE68A',
      delay: 300,
    },
  ]

  return (
    <div ref={containerRef} className="dracs-audience-grid" style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
      {cards.map((c, i) => (
        <AudienceCard
          key={i}
          {...c}
          delay={c.delay}
        />
      ))}
    </div>
  )
}

// ── La Solución sticky scroll ─────────────────────────────────────────────

function SolucionSection() {
  const [activeStep, setActiveStep] = useState(0)
  const blockRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const frameRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    blockRefs.forEach((ref, i) => {
      const el = ref.current
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i) },
        { threshold: 0.6, rootMargin: '-20% 0px -20% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = [
    {
      num: '01', title: 'El niño practica en casa',
      desc: 'Ejercicios adaptativos diarios desde cualquier tablet. Bilingüe catalán-castellano, gamificados, pensados para que el niño quiera abrir la app cada día.',
      tag: '10 minutos diarios',
    },
    {
      num: '02', title: 'La IA se adapta',
      desc: 'Ajusta dificultad en tiempo real según atención y rendimiento. Un motor basado en reglas clínicas, no en cajas negras, para que el terapeuta entienda y confíe.',
      tag: 'Adaptación cognitiva',
    },
    {
      num: '03', title: 'El terapeuta supervisa',
      desc: 'Dashboard completo con informes automáticos. El profesional ve qué practicó el niño, qué le costó, qué progresa. Sin trabajo administrativo extra.',
      tag: 'Hasta 80 pacientes',
    },
  ]

  return (
    <section id="solucion" style={{
      background: 'linear-gradient(180deg, #F0FAFA 0%, #E8F8FF 100%)',
      padding: '120px clamp(24px, 5vw, 80px)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: '80px' }}>
          <SectionKicker text="LA SOLUCIÓN" />
          <h2 style={{
            margin: '20px 0 16px',
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(40px, 5vw, 64px)',
            fontWeight: 700, color: '#1A1A2E', lineHeight: 1.1,
          }}>
            Dracs convierte la espera{' '}
            <em style={{ color: '#0BAFBE', fontStyle: 'italic' }}>en práctica diaria.</em>
          </h2>
          <p style={{
            margin: '0 auto', fontSize: '16px', color: '#6B7280',
            fontFamily: 'Nunito, sans-serif', maxWidth: '520px', lineHeight: 1.6,
          }}>
            Una plataforma adaptativa que acompaña al niño en casa, supervisada siempre por su terapeuta.
          </p>
        </Reveal>

        <div className="dracs-solucion-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px',
        }}>
          {/* LEFT: sticky frames */}
          <div className="dracs-solucion-sticky" style={{
            position: 'sticky', top: '100px',
            height: 'calc(100vh - 100px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', aspectRatio: '1/1.1' }}>

              {/* Frame 1 — app mockup */}
              <div
                ref={frameRefs[0]}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '32px',
                  background: 'linear-gradient(135deg, #0BAFBE 0%, #088a96 100%)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '32px',
                  opacity: activeStep === 0 ? 1 : 0,
                  transform: activeStep === 0 ? 'scale(1)' : 'scale(0.95)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}
              >
                <div style={{
                  background: '#fff', borderRadius: '16px', padding: '20px 24px',
                  width: '100%', display: 'flex', flexDirection: 'column', gap: '12px',
                }}>
                  <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '15px', color: '#1A1A2E' }}>
                    Sesión de hoy
                  </p>
                  {[
                    { text: '¿Qué animal es este? 🐘', align: 'flex-start', bg: '#F0FAFA', color: '#1A1A2E' },
                    { text: '¡Elefante!', align: 'flex-end', bg: '#0BAFBE', color: '#fff' },
                    { text: '¡Excelente! Siguiente palabra', align: 'flex-start', bg: '#F0FDF4', color: '#059669' },
                  ].map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: b.align as 'flex-start' | 'flex-end' }}>
                      <span style={{
                        background: b.bg, color: b.color,
                        borderRadius: '12px', padding: '8px 14px',
                        fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontWeight: 600,
                        maxWidth: '80%',
                      }}>{b.text}</span>
                    </div>
                  ))}
                </div>
                <p style={{
                  margin: '20px 0 0',
                  fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
                  fontSize: '16px', color: 'rgba(255,255,255,0.9)',
                }}>
                  Práctica diaria
                </p>
              </div>

              {/* Frame 2 — IA adaptativa */}
              <div
                ref={frameRefs[1]}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '32px',
                  background: 'linear-gradient(135deg, #FFD93D 0%, #e5a82a 100%)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '24px',
                  opacity: activeStep === 1 ? 1 : 0,
                  transform: activeStep === 1 ? 'scale(1)' : 'scale(0.95)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="dracs-ai-ring" style={{
                    position: 'absolute',
                    width: '140px', height: '140px', borderRadius: '50%',
                    border: '2px dashed rgba(255,255,255,0.6)',
                    animation: 'rotateDot 20s linear infinite',
                  }}>
                    <div style={{
                      position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)',
                      width: '10px', height: '10px', borderRadius: '50%', background: '#fff',
                    }} />
                  </div>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Brain size={36} color="#1A1A2E" />
                  </div>
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
                  fontSize: '16px', color: 'rgba(255,255,255,0.95)',
                }}>
                  Inteligencia adaptativa
                </p>
              </div>

              {/* Frame 3 — dashboard terapeuta */}
              <div
                ref={frameRefs[2]}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '32px',
                  background: '#ffffff',
                  border: '1px solid #F1F5F9',
                  display: 'flex', flexDirection: 'column',
                  padding: '28px',
                  opacity: activeStep === 2 ? 1 : 0,
                  transform: activeStep === 2 ? 'scale(1)' : 'scale(0.95)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '16px', color: '#1A1A2E', flex: 1 }}>
                    Mis pacientes
                  </span>
                  <span style={{
                    background: '#0BAFBE', color: '#fff', borderRadius: '20px',
                    padding: '2px 12px', fontSize: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  }}>42 activos</span>
                </div>
                {[
                  { name: 'Marc', age: '7 años', pct: 82 },
                  { name: 'Júlia', age: '5 años', pct: 67 },
                  { name: 'Pol', age: '9 años', pct: 91 },
                ].map(p => (
                  <div key={p.name} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1A1A2E' }}>{p.name}</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: '#94A3B8' }}>{p.age}</span>
                    </div>
                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: '#0BAFBE', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: 'auto' }}>
                  {[40, 65, 55, 80, 70, 95, 75].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, height: `${h}%`, background: 'rgba(11,175,190,0.25)',
                      borderRadius: '4px 4px 0 0', minHeight: '20px',
                    }} />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: scroll blocks */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                ref={blockRefs[i]}
                style={{
                  minHeight: '80vh',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  opacity: activeStep === i ? 1 : 0.4,
                  transition: 'opacity 0.5s ease',
                }}
              >
                <div style={{
                  fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
                  fontSize: '72px', fontWeight: 400, color: '#0BAFBE',
                  lineHeight: 1, marginBottom: '16px',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  margin: '0 0 16px',
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '44px', fontWeight: 500, color: '#1A1A2E', lineHeight: 1.1,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  margin: '0 0 24px', fontSize: '18px', color: '#6B7280',
                  fontFamily: 'Nunito, sans-serif', lineHeight: 1.65, maxWidth: '480px',
                }}>
                  {step.desc}
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  alignSelf: 'flex-start',
                  padding: '6px 16px', borderRadius: '20px',
                  background: '#F0FAFA', border: '1px solid #A5F3FC',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', color: '#0BAFBE',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0BAFBE', flexShrink: 0 }} />
                  {step.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Phrases ───────────────────────────────────────────────────────────────

const PHRASES = [
  'Cada palabra tiene su momento.',
  'Hoy es un buen día para empezar.',
  'Tu progreso nos hace sonreír.',
  'Pequeños pasos, grandes avances.',
  'La práctica hace al campeón.',
  'Hoy vamos a pasarlo bien.',
  'Cada ejercicio suma.',
  'Un día más, un logro más.',
  'El esfuerzo siempre vale la pena.',
  'Dracs cree en ti.',
  'Vamos a por ello.',
  'La constancia es tu superpoder.',
]

// ── Main ──────────────────────────────────────────────────────────────────

export default function RoleSelector({ onSelect }: Props) {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      fontFamily: 'Nunito, sans-serif',
      overflowX: 'hidden',
    }}>

      {/* ── SECCIÓN 1: HERO ─────────────────────────────────────────── */}
      <section id="hero" style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '80px 24px', position: 'relative',
      }}>
        <img
          src="/dragon.nb.png"
          alt="Dracs"
          className="dracs-hero-dragon"
          style={{
            width: '180px', height: 'auto',
            animation: 'floatDragon2 3s ease-in-out infinite',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))',
            marginBottom: '32px',
          }}
        />

        <p className="dracs-hero-phrase" style={{
          margin: '0 0 48px',
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 700, color: '#0BAFBE',
          textAlign: 'center',
          animation: 'heroFadeIn 0.8s ease both',
          maxWidth: '600px',
        }}>
          {phrase}
        </p>

        <div className="dracs-role-card" style={{
          maxWidth: '400px', width: '100%',
          background: '#ffffff', borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          padding: '28px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <p style={{
            margin: '0 0 4px', fontSize: '11px', fontWeight: 700,
            color: '#C8C8C8', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontFamily: 'Nunito, sans-serif',
            textAlign: 'center',
          }}>
            ¿Quién está aquí hoy?
          </p>

          <RoleRowBtn
            icon={<Gamepad2 size={18} />}
            iconBg="#FFF8E8" iconBorder="#FDE68A" iconColor="#D97706"
            title="Ejercicios" subtitle="Sesión adaptada"
            onClick={() => onSelect('child')}
          />
          <RoleRowBtn
            icon={<Heart size={18} />}
            iconBg="#F0FDF4" iconBorder="#BBF7D0" iconColor="#059669"
            title="Progreso" subtitle="Informe semanal"
            onClick={() => onSelect('family')}
          />
          <RoleRowBtn
            icon={<Stethoscope size={18} />}
            iconBg="#F0FAFA" iconBorder="#A5F3FC" iconColor="#0BAFBE"
            title="Logopedia" subtitle="Panel clínico"
            onClick={() => onSelect('therapist')}
          />

          <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />
          <DemoLink onClick={() => onSelect('demo')} />
        </div>

        <KnowProjectButton onClick={() => scrollTo('problema')} />
      </section>

      {/* ── SECCIÓN 2: EL PROBLEMA ──────────────────────────────────── */}
      <section id="problema" style={{
        background: '#ffffff',
        padding: '120px clamp(24px, 5vw, 80px)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <SectionKicker text="EL PROBLEMA" />
            <h2 style={{
              margin: '0 0 16px',
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 700, color: '#1A1A2E', lineHeight: 1.1,
            }}>
              El sistema no da abasto.
            </h2>
            <p style={{
              margin: 0, fontSize: '16px', color: '#6B7280',
              fontFamily: 'Nunito, sans-serif',
            }}>
              Y las familias asumen el coste.
            </p>
          </Reveal>

          <div className="dracs-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
          }}>
            {([
              { value: '1.2M',     label: 'personas esperan terapia en España',                       delay: 0   },
              { value: '18 meses', label: 'de espera media para recibir atención',                    delay: 100 },
              { value: '70%',      label: 'de las plazas se concentran en grandes ciudades',          delay: 200 },
              { value: '3.800€',   label: 'coste mensual medio de intervención intensiva privada',    delay: 300 },
            ] as const).map(({ value, label, delay }) => (
              <Reveal key={value} delay={delay}>
                <StatCard value={value} label={label} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: LA SOLUCIÓN (sticky scroll) ──────────────────── */}
      <SolucionSection />

      {/* ── SECCIÓN 4: PARA QUIÉN ───────────────────────────────────── */}
      <section id="para-quien" style={{
        background: '#ffffff',
        padding: '120px clamp(24px, 5vw, 80px)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <SectionKicker text="PARA QUIÉN" />
            <h2 style={{
              margin: 0,
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 700, color: '#1A1A2E', lineHeight: 1.1,
            }}>
              Diseñado para todos.
            </h2>
          </Reveal>

          <AudienceRevealGrid />
        </div>
      </section>

      {/* ── SECCIÓN 5: EL FUTURO DE DRACS ──────────────────────────── */}
      <section id="futuro" style={{
        padding: '120px clamp(24px, 5vw, 80px)',
        background: 'linear-gradient(180deg, #F0FAFA 0%, #EBF7F5 100%)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <SectionKicker text="EL FUTURO" />
            <h2 style={{
              margin: '0 0 16px',
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(36px, 4vw, 48px)',
              fontWeight: 700, color: '#1A1A2E',
            }}>
              El futuro de Dracs.
            </h2>
            <p style={{
              margin: 0, fontSize: '16px', color: '#6B7280',
              fontFamily: 'Nunito, sans-serif', lineHeight: 1.65,
            }}>
              De app de ejercicios a compañero clínico. Estas son las próximas cuatro funcionalidades.
            </p>
          </Reveal>

          <FutureRevealGrid />
        </div>
      </section>

      {/* ── SECCIÓN 6: SOBRE NOSOTROS ───────────────────────────────── */}
      <section id="nosotros" style={{
        background: '#ffffff',
        padding: '120px clamp(24px, 5vw, 80px)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="dracs-about-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1.3fr',
            gap: '80px', alignItems: 'start',
          }}>

            {/* Columna izquierda: foto sticky */}
            <div className="dracs-about-sticky-col">
              <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="dracs-about-image" style={{
                  width: '100%', maxWidth: '320px', height: '400px',
                  background: 'linear-gradient(135deg, #FFF8E8, #F0FAF8)',
                  borderRadius: '20px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '12px',
                }}>
                  <ImagePlus size={32} color="#94A3B8" />
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: '#94A3B8' }}>
                    Foto próximamente
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Columna derecha: contenido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Reveal>
                <SectionKicker text="SOBRE NOSOTROS" />
                <h2 style={{
                  margin: '20px 0 0',
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(36px, 4.5vw, 56px)',
                  fontWeight: 500, color: '#1A1A2E', lineHeight: 1.1,
                }}>
                  Dracs nació porque mi hermano{' '}
                  <em style={{ color: '#0BAFBE', fontStyle: 'italic' }}>lo necesitaba.</em>
                </h2>
              </Reveal>

              <Reveal delay={80}>
                <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                  Me llamo Matías. Mi hermano tiene síndrome de Down. Nació hace{' '}
                  <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#0BAFBE' }}>10 años</span>.
                </p>
              </Reveal>

              <Reveal delay={160}>
                <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                  En esos 10 años vi al hombre darle la vuelta a la luna, vi a una IA escribir libros, vi autos que se manejan solos.{' '}
                  <span style={{ color: '#1A1A2E', fontWeight: 600 }}>Y vi a mi hermano ir a la misma terapia, en la misma silla, con los mismos ejercicios fotocopiados que usaban hace una década.</span>
                </p>
              </Reveal>

              <Reveal delay={240}>
                <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                  Mientras tanto, mi mamá llamaba a colegios, centros especiales, logopedas. Siempre la misma respuesta:{' '}
                  <span style={{ color: '#1A1A2E', fontWeight: 600 }}>lista de espera</span>. Y cuando no había lista de espera, había que pagar una fortuna.
                </p>
              </Reveal>

              <Reveal delay={320}>
                <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                  Esto lo viví en Barcelona, con un hospital cada cinco calles.{' '}
                  <span style={{ color: '#1A1A2E', fontWeight: 600 }}>No puedo imaginarme cómo es en una zona rural, o sin recursos.</span>
                </p>
              </Reveal>

              <Reveal delay={400}>
                <blockquote style={{
                  margin: 0,
                  background: '#F0FAF8',
                  borderLeft: '3px solid #0BAFBE',
                  borderRadius: '0 16px 16px 0',
                  padding: '28px 32px',
                }}>
                  <p style={{
                    margin: 0,
                    fontFamily: 'Playfair Display, serif',
                    fontStyle: 'italic', fontWeight: 500,
                    fontSize: '20px', color: '#1A1A2E', lineHeight: 1.6,
                  }}>
                    Los que más lo necesitan son los que más esperan. Los que menos tienen, los que menos reciben. El sistema funciona al revés.
                  </p>
                </blockquote>
              </Reveal>

              <Reveal delay={480}>
                <div style={{ paddingTop: '32px', borderTop: '1px solid #F1F5F9' }}>
                  <p style={{
                    margin: '0 0 8px',
                    fontFamily: 'Playfair Display, serif',
                    fontStyle: 'italic', fontSize: '24px', color: '#0BAFBE', lineHeight: 1.4,
                  }}>
                    "Dracs es lo que me hubiera gustado tener entonces. Para que ninguna otra familia tenga que esperar."
                  </p>
                  <p style={{
                    margin: 0, fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px', fontWeight: 500, color: '#6B7280',
                  }}>
                    — Matías, fundador de Dracs
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 7: FOOTER CTA ───────────────────────────────────── */}
      <section id="contacto" style={{
        background: '#1A1A2E',
        padding: '80px clamp(24px, 5vw, 80px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', gap: '24px',
      }}>
        <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src="/dragon.nb.png" alt=""
            style={{
              height: '80px', width: 'auto',
              animation: 'floatDragon2 3s ease-in-out infinite',
              filter: 'brightness(1.1) drop-shadow(0 8px 20px rgba(0,0,0,0.20))',
            }}
          />
        </Reveal>

        <Reveal delay={100}>
          <h2 style={{
            margin: 0,
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 700, color: '#ffffff', lineHeight: 1.1,
          }}>
            Dracs está en desarrollo.
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p style={{
            margin: 0, fontSize: '16px', color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Nunito, sans-serif', maxWidth: '480px', lineHeight: 1.6,
          }}>
            Si trabajás con niños con necesidades especiales, nos encantaría conocerte.
          </p>
        </Reveal>

        <Reveal delay={300} style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="mailto:dracs@dracs.health"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '14px',
              background: '#FFD93D', color: '#1A1A2E',
              fontSize: '16px', fontWeight: 800,
              textDecoration: 'none', fontFamily: 'Nunito, sans-serif',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              const a = e.currentTarget as HTMLAnchorElement
              a.style.transform = 'translateY(-2px)'
              a.style.boxShadow = '0 8px 24px rgba(255,217,61,0.40)'
            }}
            onMouseLeave={e => {
              const a = e.currentTarget as HTMLAnchorElement
              a.style.transform = 'translateY(0)'
              a.style.boxShadow = 'none'
            }}
          >
            <Mail size={16} />
            Escribinos
          </a>
        </Reveal>

        <div style={{
          width: '100%', maxWidth: '400px',
          height: '1px', background: 'rgba(255,255,255,0.08)',
          margin: '4px 0',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 900,
            fontSize: '18px', color: '#ffffff', letterSpacing: '0.04em',
          }}>
            DRACS
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Barcelona · 2026
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
            Babson Student Challenge 2026
          </span>
        </div>
      </section>

      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes rotateDot {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Section kicker ─────────────────────────────────────── */
        .section-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #0BAFBE;
          margin-bottom: 20px;
        }
        .section-kicker .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0BAFBE;
          flex-shrink: 0;
        }

        /* ── Audience card reveal ───────────────────────────────── */
        .dracs-audience-card {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.7s ease var(--card-delay, 0ms),
            transform 0.7s ease var(--card-delay, 0ms),
            box-shadow 0.3s ease,
            border-color 0.3s ease;
          box-shadow: 0 4px 20px rgba(11,175,190,0.08);
        }
        .dracs-audience-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .dracs-audience-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 12px 40px rgba(11,175,190,0.18) !important;
        }

        /* ── Future card reveal + hover ─────────────────────────── */
        .future-card {
          background: #FFFFFF;
          border: 1px solid #F1F5F9;
          border-radius: 16px;
          padding: 24px;
          height: 100%;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.7s ease var(--card-delay, 0ms),
            transform 0.7s ease var(--card-delay, 0ms),
            border-color 0.4s ease,
            box-shadow 0.4s ease;
        }
        .future-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .future-card:hover {
          transform: translateY(-6px) !important;
          border-color: #0BAFBE !important;
          box-shadow: 0 20px 40px -20px rgba(11,175,190,0.3) !important;
        }

        /* ── About: sticky left col ─────────────────────────────── */
        .dracs-about-sticky-col {
          position: sticky;
          top: 100px;
          align-self: start;
        }

        /* ── Sticky scroll: mobile collapse ─────────────────────── */
        @media (max-width: 900px) {
          .dracs-solucion-grid {
            grid-template-columns: 1fr !important;
          }
          .dracs-solucion-sticky {
            position: relative !important;
            top: 0 !important;
            height: auto !important;
            margin-bottom: 48px;
          }
          .dracs-solucion-sticky > div {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            aspect-ratio: unset !important;
            height: 280px !important;
          }
        }

        /* ── General responsive ─────────────────────────────────── */
        @media (max-width: 768px) {
          .dracs-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .dracs-audience-grid {
            flex-direction: column !important;
          }
          .dracs-about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .dracs-about-sticky-col {
            position: relative !important;
            top: 0 !important;
          }
          .dracs-about-image {
            max-width: 240px !important;
            height: 280px !important;
            margin: 0 auto !important;
          }
          .dracs-future-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .dracs-future-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* ── Reduced motion ─────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
