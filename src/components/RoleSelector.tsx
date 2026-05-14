import { useEffect, useRef, useState } from 'react'
import {
  Gamepad2, Heart, Stethoscope, Play,
  Brain,
  Smile, Mail, ImagePlus,
  Fish, Cat, Turtle, Star, Check,
  Shirt, BookOpen,
} from 'lucide-react'

export type Role = 'child' | 'family' | 'therapist' | 'demo'

interface Props {
  onSelect: (role: Role) => void
}

// ── Reveal wrapper ────────────────────────────────────────────────────────────

function Reveal({
  children, delay = 0, style: extraStyle,
}: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; obs.disconnect() } },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(32px) scale(0.98)', transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`, ...extraStyle }}>
      {children}
    </div>
  )
}

// ── Scroll helper ─────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── Role row button ───────────────────────────────────────────────────────────

interface RoleRowBtnProps {
  icon: React.ReactNode; iconBg: string; iconBorder: string; iconColor: string
  title: string; subtitle: string; onClick: () => void
}
function RoleRowBtn({ icon, iconBg, iconBorder, iconColor, title, subtitle, onClick }: RoleRowBtnProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="dracs-role-btn"
      style={{ height: '64px', borderRadius: '14px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '14px', border: `1.5px solid ${hovered ? '#0BAFBE' : '#F1F5F9'}`, background: hovered ? '#F0FAFA' : '#ffffff', cursor: 'pointer', width: '100%', transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'all 200ms ease' }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: iconBg, border: `1px solid ${iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div className="dracs-role-btn-title" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif', lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 400, lineHeight: 1.2, marginTop: '2px' }}>{subtitle}</div>
      </div>
    </button>
  )
}

// ── Demo link ─────────────────────────────────────────────────────────────────

function DemoLink({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '13px', fontWeight: 500, color: '#94A3B8', fontFamily: 'Nunito, sans-serif', padding: '2px 0', transition: 'color 0.2s ease' }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#0BAFBE')}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#94A3B8')}
    >
      <Play size={12} />Ver demo
    </button>
  )
}

// ── Know project button ───────────────────────────────────────────────────────

function KnowProjectButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#0BAFBE', border: 'none', cursor: 'pointer', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '14px', borderRadius: '24px', padding: '12px 28px', marginTop: '32px', boxShadow: hovered ? '0 8px 20px rgba(11,175,190,0.45)' : '0 4px 12px rgba(11,175,190,0.30)', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.2s ease' }}
    >
      Conoce el proyecto
    </button>
  )
}

// ── Big number with styled unit suffix ────────────────────────────────────────

function BigNumber({ value }: { value: string }) {
  const m = value.match(/^([\d.,]+)\s*(.*)$/)
  const digits = m?.[1] ?? value
  const unit   = m?.[2] ?? ''
  // Words (e.g. "meses") get a slightly larger relative size than symbols (M, %, €)
  const unitSize = unit.length > 2 ? '0.45em' : '0.55em'
  return (
    <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 500, fontSize: 'clamp(64px, 7vw, 96px)', color: '#0BAFBE', lineHeight: 1, fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'baseline', gap: '0.04em' }}>
      {digits}
      {unit && <span style={{ fontSize: unitSize, fontWeight: 500, letterSpacing: '-0.01em' }}>{unit}</span>}
    </span>
  )
}

// ── El Problema — orbital sticky section ──────────────────────────────────────

const PROBLEM_DATA = [
  {
    value: '1,2M',
    headline: 'Personas esperando',
    desc: 'Es la fila de espera actual en España para una primera sesión de logopedia pública. La mayoría son niños.',
  },
  {
    value: '18 meses',
    headline: 'Antes de la primera sesión',
    desc: 'Es la media para entrar al sistema. Año y medio mirando cómo no avanza tu hijo.',
  },
  {
    value: '70%',
    headline: 'Concentrado en 5 ciudades',
    desc: 'Si vivís fuera de Barcelona, Madrid, Valencia, Sevilla o Bilbao, encontrar logopeda público es casi imposible.',
  },
  {
    value: '3.800€',
    headline: 'Cuesta al mes ir por privado',
    desc: 'Una intervención intensiva privada. Lo pagan las familias que pueden. Las que no, siguen esperando.',
  },
]

// Dot absolute positions — centered on each cardinal point of the circle border
const DOT_POS = [
  { top:    0,    left: '50%', transform: 'translate(-50%, -50%)' }, // top
  { top: '50%',   right: 0,   transform: 'translate(50%, -50%)'  }, // right
  { bottom: 0,    left: '50%', transform: 'translate(-50%, 50%)'  }, // bottom
  { top: '50%',   left:  0,   transform: 'translate(-50%, -50%)' }, // left
] as React.CSSProperties[]

function ProblemaSection() {
  const [activeIndex,    setActiveIndex]    = useState(0)
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const [fading,         setFading]         = useState(false)
  const [isMobile,       setIsMobile]       = useState(false)

  const blockRef0 = useRef<HTMLDivElement>(null)
  const blockRef1 = useRef<HTMLDivElement>(null)
  const blockRef2 = useRef<HTMLDivElement>(null)
  const blockRef3 = useRef<HTMLDivElement>(null)
  const blockRefs = [blockRef0, blockRef1, blockRef2, blockRef3]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Fade animation when displayed index should change
  useEffect(() => {
    if (activeIndex === displayedIndex) return
    setFading(true)
    const t = setTimeout(() => { setDisplayedIndex(activeIndex); setFading(false) }, 300)
    return () => clearTimeout(t)
  }, [activeIndex, displayedIndex])

  // IntersectionObserver fires when block top/bottom crosses viewport midpoint
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    blockRefs.forEach((ref, i) => {
      const el = ref.current
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i) },
        { threshold: 0, rootMargin: '-50% 0px -50% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const circleSize = isMobile ? 260 : 440

  return (
    <section id="problema" style={{ background: '#ffffff', paddingTop: '120px', paddingBottom: '80px' }}>

      {/* Header — outside the sticky grid */}
      <div style={{ textAlign: 'center', padding: '0 clamp(24px, 5vw, 48px)', marginBottom: '80px', maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Reveal>
          <h2 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.1 }}>
            <em style={{ color: '#0BAFBE', fontStyle: 'italic' }}>Una década</em>{' '}
            perdida en listas de espera.
          </h2>
        </Reveal>
      </div>

      {/* Sticky 2-col grid */}
      <div className="problema-grid">

        {/* LEFT: sticky orbital circle */}
        <div className="problema-left">
          <div style={{ position: 'relative', width: circleSize, height: circleSize, flexShrink: 0 }}>

            {/* Dashed border — subtle */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed #0BAFBE', opacity: 0.25 }} />

            {/* 4 cardinal dots */}
            {DOT_POS.map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                ...pos,
                width:  activeIndex === i ? '18px' : '14px',
                height: activeIndex === i ? '18px' : '14px',
                borderRadius: '50%',
                background: activeIndex === i ? '#0BAFBE' : '#ffffff',
                border: activeIndex === i ? 'none' : '2px solid #E5F5F5',
                boxShadow: activeIndex === i ? '0 0 0 6px rgba(11,175,190,0.15)' : 'none',
                transition: 'all 0.4s ease',
                zIndex: 1,
              }} />
            ))}

            {/* Center: animated number */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '90%', opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
              <BigNumber value={PROBLEM_DATA[displayedIndex].value} />
            </div>

          </div>
        </div>

        {/* RIGHT: 4 scrollable data steps */}
        <div className="problema-right">
          {PROBLEM_DATA.map((data, i) => (
            <div key={i} ref={blockRefs[i]} className="problema-step" style={{
              opacity: isMobile ? 1 : (activeIndex === i ? 1 : 0.35),
              transition: 'opacity 0.5s ease',
            }}>
              <div className="step-marker">
                <span className="step-dot" />
                <span className="step-line" />
              </div>
              <h3 style={{ margin: '0 0 18px', fontFamily: '"Playfair Display", serif', fontWeight: 500, fontSize: 'clamp(28px, 3vw, 36px)', color: activeIndex === i ? '#1A1A2E' : '#6B7280', lineHeight: 1.2, transition: 'color 0.4s ease' }}>
                {data.headline}
              </h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.62, fontFamily: 'Nunito, sans-serif', color: '#6B7280', maxWidth: '420px' }}>
                {data.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ── La Solución — fixed sticky scroll ─────────────────────────────────────────

function AnimalCard({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <div style={{ borderRadius: '10px', border: active ? '2px solid #0BAFBE' : '2px solid #F1F5F9', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', background: active ? '#F0FAFA' : '#ffffff', transition: 'all 0.3s ease' }}>
      {active && (
        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#0BAFBE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={10} color="#ffffff" strokeWidth={3} />
        </div>
      )}
      <div style={{ color: active ? '#0BAFBE' : '#94A3B8' }}>{icon}</div>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', fontWeight: 600, color: active ? '#0BAFBE' : '#94A3B8', letterSpacing: '0.02em' }}>{label}</span>
    </div>
  )
}

function SolucionSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isMobile,   setIsMobile]   = useState(false)

  const blockRef0 = useRef<HTMLDivElement>(null)
  const blockRef1 = useRef<HTMLDivElement>(null)
  const blockRef2 = useRef<HTMLDivElement>(null)
  const blockRefs = [blockRef0, blockRef1, blockRef2]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    blockRefs.forEach((ref, i) => {
      const el = ref.current
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i) },
        { threshold: 0, rootMargin: '-50% 0px -50% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getOpacity = (i: number) => {
    if (isMobile) return 1
    if (i === activeStep) return 1
    if (i === activeStep + 1) return 0.25
    return 0
  }

  const steps = [
    { num: '01', title: 'El niño practica en casa', desc: 'Ejercicios adaptativos diarios desde cualquier tablet. Bilingüe catalán-castellano, gamificados, pensados para que el niño quiera abrir la app cada día.',    tag: '10 minutos diarios'  },
    { num: '02', title: 'La IA se adapta',           desc: 'Ajusta dificultad en tiempo real según atención y rendimiento. Un motor basado en reglas clínicas, no en cajas negras, para que el terapeuta entienda y confíe.', tag: 'Adaptación cognitiva' },
    { num: '03', title: 'El terapeuta supervisa',    desc: 'Dashboard completo con informes automáticos. El profesional ve qué practicó el niño, qué le costó, qué progresa. Sin trabajo administrativo extra.',               tag: 'Hasta 80 pacientes'   },
  ]

  return (
    <section id="solucion" style={{ background: 'linear-gradient(180deg, #F0FAFA 0%, #E8F8FF 100%)', paddingTop: '120px', paddingBottom: '80px' }}>

      {/* Header — outside the sticky grid */}
      <div style={{ textAlign: 'center', padding: '0 clamp(24px, 5vw, 48px)', marginBottom: '80px', maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Reveal>
          <h2 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.1 }}>
            Dracs convierte la espera{' '}
            <em style={{ color: '#0BAFBE', fontStyle: 'italic' }}>en práctica diaria.</em>
          </h2>
        </Reveal>
      </div>

      {/* Sticky 2-col grid */}
      <div className="solucion-grid">

        {/* LEFT: sticky frames */}
        <div className="solucion-left">
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', aspectRatio: '1/1.1' }}>

            {/* Frame 1 — clinical exercise mockup */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '32px', background: 'linear-gradient(135deg, #0BAFBE 0%, #088a96 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', opacity: activeStep === 0 ? 1 : 0, transform: activeStep === 0 ? 'scale(1)' : 'scale(0.95)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: '#F0FAFA', border: '1px solid #A5F3FC', borderRadius: '100px', padding: '4px 12px' }}>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '10px', letterSpacing: '0.1em', color: '#0BAFBE', textTransform: 'uppercase' }}>Ejercicio 3 de 8</span>
                </div>
                <p style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: '15px', color: '#1A1A2E', lineHeight: 1.25 }}>
                  Encuentra los animales que viven en el agua
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <AnimalCard icon={<Fish size={22} />}   label="Pez"     active={true}  />
                  <AnimalCard icon={<Cat size={22} />}    label="Gato"    active={false} />
                  <AnimalCard icon={<Turtle size={22} />} label="Tortuga" active={true}  />
                  <AnimalCard icon={<Turtle size={22} />} label="Rana"    active={false} />
                  <AnimalCard icon={<Cat size={22} />}    label="Conejo"  active={false} />
                  <AnimalCard icon={<Fish size={22} />}   label="Pulpo"   active={true}  />
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', paddingTop: '4px' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < 2 ? '#88D4D9' : i === 2 ? '#0BAFBE' : '#F1F5F9' }} />
                  ))}
                </div>
              </div>
              <p style={{ margin: '20px 0 0', fontFamily: 'Nunito, sans-serif', fontStyle: 'italic', fontWeight: 500, fontSize: '14px', color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5 }}>
                Cada ejercicio adapta dificultad, contenido y refuerzo en tiempo real.
              </p>
            </div>

            {/* Frame 2 — IA adaptativa */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '32px', background: 'linear-gradient(135deg, #FFD93D 0%, #e5a82a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeStep === 1 ? 1 : 0, transform: activeStep === 1 ? 'scale(1)' : 'scale(0.95)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.6)', animation: 'rotateDot 20s linear infinite' }}>
                  <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
                </div>
                <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={52} color="#1A1A2E" />
                </div>
              </div>
            </div>

            {/* Frame 3 — calendario semanal */}
            {(() => {
              const calDays = [
                { label: 'L', sessions: [{ n: 'Marc', h: '10h' }, { n: 'Pol', h: '16h' }] },
                { label: 'M', sessions: [{ n: 'Júlia', h: '11h' }] },
                { label: 'X', sessions: [{ n: 'Marc', h: '9h' }, { n: 'Aina', h: '14h' }, { n: 'Pol', h: '17h' }] },
                { label: 'J', sessions: [{ n: 'Júlia', h: '10h' }, { n: 'Marc', h: '15h' }] },
                { label: 'V', sessions: [{ n: 'Aina', h: '11h' }, { n: 'Pol', h: '16h' }] },
                { label: 'S', sessions: [] },
                { label: 'D', sessions: [{ n: 'Júlia', h: '', muted: true }, { n: 'Marc', h: '', muted: true }] },
              ]
              return (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '32px', background: '#ffffff', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', padding: '24px 20px', opacity: activeStep === 2 ? 1 : 0, transform: activeStep === 2 ? 'scale(1)' : 'scale(0.95)', transition: 'opacity 0.6s ease, transform 0.6s ease', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: '18px', color: '#1A1A2E' }}>Esta semana</span>
                    <span style={{ background: '#0BAFBE', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '12px' }}>12 sesiones</span>
                  </div>
                  {/* Day labels */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
                    {calDays.map(d => (
                      <div key={d.label} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '10px', color: '#94A3B8', textAlign: 'center', letterSpacing: '0.05em' }}>{d.label}</div>
                    ))}
                  </div>
                  {/* Calendar columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', flex: 1 }}>
                    {calDays.map(day => (
                      <div key={day.label} style={{ background: '#F8FAFB', borderRadius: '8px', padding: '5px 3px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {day.sessions.map((s, si) => (
                          <div key={si} style={{ background: s.muted ? '#E0F5F4' : '#0BAFBE', color: s.muted ? '#0BAFBE' : '#fff', padding: '4px 3px', borderRadius: '5px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '8px', lineHeight: 1.3, textAlign: 'center', minHeight: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="cal-session-text">{s.n}</span>
                            {s.h && <span className="cal-session-text" style={{ fontWeight: 400, opacity: 0.85 }}>{s.h}</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

          </div>
        </div>

        {/* RIGHT: scrollable steps */}
        <div className="solucion-right">
          {steps.map((step, i) => (
            <div key={step.num} ref={blockRefs[i]} className="solucion-step" style={{
              opacity: getOpacity(i),
              transition: 'opacity 0.5s ease',
            }}>
              <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '72px', fontWeight: 400, color: '#0BAFBE', lineHeight: 1, marginBottom: '16px' }}>
                {step.num}
              </div>
              <h3 style={{ margin: '0 0 16px', fontFamily: '"Playfair Display", serif', fontSize: '44px', fontWeight: 500, color: '#1A1A2E', lineHeight: 1.1 }}>
                {step.title}
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: '18px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65, maxWidth: '480px' }}>
                {step.desc}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '6px 16px', borderRadius: '20px', background: '#F0FAFA', border: '1px solid #A5F3FC', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', color: '#0BAFBE' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0BAFBE', flexShrink: 0 }} />
                {step.tag}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ── Diseñado para todos — cards with subtle SVG connection ───────────────────

function MiniMockupNino() {
  const steps = [
    { num: '1', icon: <Smile size={14} />,    label: 'Lavarme los dientes' },
    { num: '2', icon: <Shirt size={14} />,    label: 'Ponerme el pijama'  },
    { num: '3', icon: <BookOpen size={14} />, label: 'Leer un cuento'     },
  ]
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'inline-flex', background: 'rgba(11,175,190,0.2)', border: '1px solid rgba(11,175,190,0.3)', borderRadius: '100px', padding: '3px 8px', width: 'fit-content' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '10px', letterSpacing: '0.05em', color: '#88D4D9', textTransform: 'uppercase' }}>EJERCICIO 5/8</span>
      </div>
      <p style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: '13px', color: '#ffffff', lineHeight: 1.25 }}>
        Ordená la rutina antes de dormir
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {steps.map(step => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 8px' }}>
            <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: '13px', color: '#0BAFBE', fontStyle: 'italic', minWidth: '14px' }}>{step.num}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>{step.icon}</span>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniMockupTerapeuta() {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '36px', marginBottom: '10px' }}>
        {[50, 70, 45, 85].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: '#0BAFBE', borderRadius: '2px 2px 0 0', opacity: 0.75 + i * 0.07 }} />
        ))}
      </div>
      <div style={{ display: 'inline-flex', background: '#F0FAFA', border: '1px solid #A5F3FC', borderRadius: '100px', padding: '3px 10px' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: '#0BAFBE' }}>42 pacientes activos</span>
      </div>
    </div>
  )
}

function MiniMockupFamilia() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
        {[1,2,3].map(i => <Star key={i} size={14} color="#0BAFBE" fill="#0BAFBE" />)}
      </div>
      <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '12px', color: '#B85A2D' }}>
        Esta semana: +12 palabras nuevas
      </p>
    </div>
  )
}

function ConnectedAudienceGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.dracs-audience-card'))
    const obs = new IntersectionObserver(
      entries => { entries.forEach(entry => { if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('is-visible'); obs.unobserve(entry.target) } }) },
      { threshold: 0.15 },
    )
    cards.forEach(card => obs.observe(card))
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ position: 'relative' }}>

      {/* Subtle SVG connection lines — z-index below cards */}
      <svg
        className="audience-connection-svg"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 0 }}
        viewBox="0 0 900 420"
        preserveAspectRatio="none"
      >
        <path className="connection-path" d="M 150 80 C 260 -20 370 -20 450 80"
          fill="none" stroke="#0BAFBE" strokeWidth="1.5" opacity="0.2" />
        <path className="connection-path" d="M 450 80 C 540 -20 660 -20 750 80"
          fill="none" stroke="#0BAFBE" strokeWidth="1.5" opacity="0.2" />
        <path className="connection-path" d="M 750 340 C 620 445 280 445 150 340"
          fill="none" stroke="#0BAFBE" strokeWidth="1.5" opacity="0.2" />
      </svg>

      {/* Cards */}
      <div ref={containerRef} className="dracs-audience-grid" style={{ display: 'flex', gap: '20px', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>

        {/* Card: Niño */}
        <div className="dracs-audience-card" style={{ '--card-delay': '0ms', backgroundColor: '#1A1A2E', borderRadius: '20px', padding: '28px 24px', display: 'flex', flexDirection: 'column', flex: 1 } as React.CSSProperties}>
          <MiniMockupNino />
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', marginBottom: '16px' }}>
            <Smile size={28} />
          </div>
          <h3 style={{ margin: '0 0 10px', fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 600, color: '#ffffff', lineHeight: 1.2 }}>
            Niños que necesitan apoyo
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, fontFamily: 'Nunito, sans-serif', flex: 1 }}>
            Vocabulario, secuenciación, articulación. 480 ejercicios adaptados a cada perfil, supervisados por su logopeda.
          </p>
          <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            3 a 10 años
          </span>
        </div>

        {/* Card: Terapeuta */}
        <div className="dracs-audience-card" style={{ '--card-delay': '150ms', backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #0BAFBE', padding: '28px 24px', display: 'flex', flexDirection: 'column', flex: 1 } as React.CSSProperties}>
          <MiniMockupTerapeuta />
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#F0FAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0BAFBE', marginBottom: '16px' }}>
            <Stethoscope size={28} />
          </div>
          <h3 style={{ margin: '0 0 10px', fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 600, color: '#1A1A2E', lineHeight: 1.2 }}>
            Terapeutas y logopedas
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 400, color: '#6B7280', lineHeight: 1.55, fontFamily: 'Nunito, sans-serif', flex: 1 }}>
            Un logopeda en la pública atiende 25 niños como máximo. Con Dracs, llega a 80 sin perder calidad clínica.
          </p>
          <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#F0FAFA', border: '1px solid #A5F3FC', color: '#0BAFBE', fontSize: '12px', fontWeight: 600, fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Panel profesional
          </span>
        </div>

        {/* Card: Familia */}
        <div className="dracs-audience-card" style={{ '--card-delay': '300ms', backgroundColor: '#FFF6E5', borderRadius: '20px', border: '1.5px solid #FDE68A', padding: '28px 24px', display: 'flex', flexDirection: 'column', flex: 1 } as React.CSSProperties}>
          <MiniMockupFamilia />
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(217,119,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '16px' }}>
            <Heart size={28} />
          </div>
          <h3 style={{ margin: '0 0 10px', fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 600, color: '#92400E', lineHeight: 1.2 }}>
            Familias
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 400, color: '#B45309', lineHeight: 1.55, fontFamily: 'Nunito, sans-serif', flex: 1 }}>
            Seguimiento claro del progreso semanal sin conocimientos médicos.
          </p>
          <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid #FDE68A', color: '#92400E', fontSize: '12px', fontWeight: 600, fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Vista familiar
          </span>
        </div>

      </div>
    </div>
  )
}

// ── El Futuro reveal grid (unchanged) ─────────────────────────────────────────

function FutureRevealGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.future-card'))
    const obs = new IntersectionObserver(
      entries => { entries.forEach(entry => { if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('is-visible'); obs.unobserve(entry.target) } }) },
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
    <div ref={containerRef} className="dracs-future-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {items.map(({ num, tag, title, desc, delay }) => (
        <div key={num} className="future-card" style={{ '--card-delay': `${delay}ms` } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>{num}</span>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0BAFBE', opacity: 0.5 }} />
            <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 500 }}>{tag}</span>
          </div>
          <h4 style={{ margin: '0 0 8px', fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.25 }}>{title}</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.55 }}>{desc}</p>
        </div>
      ))}
    </div>
  )
}

// ── Sobre nosotros ────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="nosotros" style={{ background: '#ffffff', padding: '120px clamp(24px, 5vw, 80px)' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>

        {/* Header — centered */}
        <Reveal style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 500, color: '#1A1A2E', lineHeight: 1.1 }}>
            Dracs nació porque mi hermano{' '}
            <em style={{ color: '#0BAFBE', fontStyle: 'italic' }}>lo necesitaba.</em>
          </h2>
        </Reveal>

        {/* Body — 2 col */}
        <div className="dracs-about-body">
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="dracs-about-photo" style={{ width: '100%', aspectRatio: '4/5', borderRadius: '24px', background: 'linear-gradient(135deg, #FFF6E5 0%, #FBE5C5 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <ImagePlus size={32} color="#94A3B8" />
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: '#94A3B8' }}>Foto próximamente</span>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <Reveal>
              <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                Me llamo Matías. Mi hermano tiene síndrome de Down. Nació hace 10 años.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                En esos 10 años vi al hombre darle la vuelta a la luna, vi a una IA escribir libros, vi autos que se manejan solos.{' '}
                <span style={{ color: '#1A1A2E', fontWeight: 600 }}>Y vi a mi hermano ir a la misma terapia, en la misma silla, con los mismos ejercicios fotocopiados que usaban hace una década.</span>
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                Mientras tanto, mi mamá llamaba a colegios, centros especiales, logopedas. Siempre la misma respuesta:{' '}
                <span style={{ color: '#1A1A2E', fontWeight: 600 }}>lista de espera</span>. Y cuando no había lista de espera, había que pagar una fortuna.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                Esto lo viví en Barcelona, con un hospital cada cinco calles.{' '}
                <span style={{ color: '#1A1A2E', fontWeight: 600 }}>No puedo imaginarme cómo es en una zona rural, o sin recursos.</span>
              </p>
            </Reveal>
            <Reveal delay={320}>
              <blockquote style={{ margin: 0, background: '#F0FAF8', borderLeft: '3px solid #0BAFBE', borderRadius: '0 16px 16px 0', padding: '24px 28px' }}>
                <p style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '19px', color: '#1A1A2E', lineHeight: 1.6 }}>
                  Los que más lo necesitan son los que más esperan. Los que menos tienen, los que menos reciben. El sistema funciona al revés.
                </p>
              </blockquote>
            </Reveal>
          </div>
        </div>

        {/* Closing quote */}
        <Reveal delay={80}>
          <div style={{ maxWidth: '720px', margin: '100px auto 0', textAlign: 'center', paddingTop: '60px', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ margin: '0 0 16px', fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 'clamp(20px, 2.5vw, 26px)', color: '#0BAFBE', lineHeight: 1.4 }}>
              "Esto lo hago por mi hermano. Y por cada niño al que el sistema todavía no llegó."
            </p>
            <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 500, color: '#6B7280', letterSpacing: '0.02em' }}>
              — Matías, fundador de Dracs
            </p>
          </div>
        </Reveal>

      </div>
    </section>
  )
}

// ── Phrases ───────────────────────────────────────────────────────────────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function RoleSelector({ onSelect }: Props) {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)', fontFamily: 'Nunito, sans-serif' }}>

      {/* ── SECCIÓN 1: HERO ─────────────────────────────────────────────── */}
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 24px', position: 'relative' }}>
        <img src="/dragon.nb.png" alt="Dracs" className="dracs-hero-dragon"
          style={{ width: '180px', height: 'auto', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))', marginBottom: '32px' }}
        />
        <p className="dracs-hero-phrase" style={{ margin: '0 0 48px', fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0BAFBE', textAlign: 'center', animation: 'heroFadeIn 0.8s ease both', maxWidth: '600px' }}>
          {phrase}
        </p>
        <div className="dracs-role-card" style={{ maxWidth: '400px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#C8C8C8', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
            ¿Quién está aquí hoy?
          </p>
          <RoleRowBtn icon={<Gamepad2 size={18} />}    iconBg="#FFF8E8" iconBorder="#FDE68A" iconColor="#D97706" title="Ejercicios"  subtitle="Sesión adaptada"   onClick={() => onSelect('child')} />
          <RoleRowBtn icon={<Heart size={18} />}       iconBg="#F0FDF4" iconBorder="#BBF7D0" iconColor="#059669" title="Progreso"    subtitle="Informe semanal"  onClick={() => onSelect('family')} />
          <RoleRowBtn icon={<Stethoscope size={18} />} iconBg="#F0FAFA" iconBorder="#A5F3FC" iconColor="#0BAFBE" title="Logopedia"   subtitle="Panel clínico"    onClick={() => onSelect('therapist')} />
          <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />
          <DemoLink onClick={() => onSelect('demo')} />
        </div>
        <KnowProjectButton onClick={() => scrollTo('problema')} />
      </section>

      {/* ── SECCIÓN 2: EL PROBLEMA ──────────────────────────────────────── */}
      <ProblemaSection />

      {/* ── SECCIÓN 3: LA SOLUCIÓN ──────────────────────────────────────── */}
      <SolucionSection />

      {/* ── SECCIÓN 4: DISEÑADO PARA TODOS ─────────────────────────────── */}
      <section id="para-quien" style={{ background: '#ffffff', padding: '120px clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.1 }}>
              Diseñado para todos.
            </h2>
          </Reveal>
          <ConnectedAudienceGrid />
        </div>
      </section>

      {/* ── SECCIÓN 5: EL FUTURO DE DRACS ──────────────────────────────── */}
      <section id="futuro" style={{ padding: '120px clamp(24px, 5vw, 80px)', background: 'linear-gradient(180deg, #F0FAFA 0%, #EBF7F5 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: '"Playfair Display", serif', fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 700, color: '#1A1A2E' }}>
              El futuro de Dracs.
            </h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
              De app de ejercicios a compañero clínico. Estas son las próximas cuatro funcionalidades.
            </p>
          </Reveal>
          <FutureRevealGrid />
        </div>
      </section>

      {/* ── SECCIÓN 6: SOBRE NOSOTROS ───────────────────────────────────── */}
      <AboutSection />

      {/* ── SECCIÓN 7: FOOTER CTA ───────────────────────────────────────── */}
      <section id="contacto" style={{ background: '#1A1A2E', padding: '80px clamp(24px, 5vw, 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
        <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/dragon.nb.png" alt="" style={{ height: '80px', width: 'auto', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'brightness(1.1) drop-shadow(0 8px 20px rgba(0,0,0,0.20))' }} />
        </Reveal>
        <Reveal delay={100}>
          <h2 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
            Dracs está en desarrollo.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p style={{ margin: 0, fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Nunito, sans-serif', maxWidth: '480px', lineHeight: 1.6 }}>
            Si trabajás con niños con necesidades especiales, nos encantaría conocerte.
          </p>
        </Reveal>
        <Reveal delay={300} style={{ display: 'flex', justifyContent: 'center' }}>
          <a href="mailto:dracs@dracs.health"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', background: '#FFD93D', color: '#1A1A2E', fontSize: '16px', fontWeight: 800, textDecoration: 'none', fontFamily: 'Nunito, sans-serif', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 8px 24px rgba(255,217,61,0.40)' }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = 'none' }}
          >
            <Mail size={16} />Escribinos
          </a>
        </Reveal>
        <div style={{ width: '100%', maxWidth: '400px', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '18px', color: '#ffffff', letterSpacing: '0.04em' }}>DRACS</span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Barcelona · 2026</span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Babson Student Challenge 2026</span>
        </div>
      </section>

      {/* ── Global CSS ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateDot {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes connectionFlow {
          to { stroke-dashoffset: -200; }
        }

        /* ── Step marker (El Problema) ──────────────────────────────── */
        .step-marker { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #0BAFBE; flex-shrink: 0; }
        .step-line { height: 1px; width: 32px; background: #0BAFBE; opacity: 0.4; }

        /* ── Calendar: hide text on very small screens ───────────────── */
        @media (max-width: 420px) {
          .cal-session-text { display: none; }
        }

        /* ── Sticky 2-column grid pattern ───────────────────────────── */
        /* EL PROBLEMA */
        .problema-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(24px, 5vw, 48px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }
        .problema-left {
          position: sticky;
          top: 100px;
          height: calc(100vh - 100px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .problema-right {
          display: flex;
          flex-direction: column;
        }
        .problema-step {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 0;
        }

        /* LA SOLUCIÓN — same pattern */
        .solucion-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(24px, 5vw, 48px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }
        .solucion-left {
          position: sticky;
          top: 100px;
          height: calc(100vh - 100px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .solucion-right {
          display: flex;
          flex-direction: column;
        }
        .solucion-step {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 0;
        }

        /* ── Audience cards ─────────────────────────────────────────── */
        .dracs-audience-card {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.7s ease var(--card-delay, 0ms),
            transform 0.7s ease var(--card-delay, 0ms),
            box-shadow 0.3s ease;
          box-shadow: 0 4px 20px rgba(11,175,190,0.06);
        }
        .dracs-audience-card.is-visible {
          opacity: 1; transform: translateY(0);
        }
        .dracs-audience-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.1) !important;
        }

        /* ── SVG connection paths ────────────────────────────────────── */
        .connection-path {
          stroke-dasharray: 6 8;
          animation: connectionFlow 8s linear infinite;
        }

        /* ── SVG: hide on mobile ────────────────────────────────────── */
        .audience-connection-svg { display: none; }
        @media (min-width: 901px) {
          .audience-connection-svg { display: block; }
        }

        /* ── About body ─────────────────────────────────────────────── */
        .dracs-about-body {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 80px;
          align-items: start;
        }

        /* ── Future cards ───────────────────────────────────────────── */
        .future-card {
          background: #FFFFFF; border: 1px solid #F1F5F9;
          border-radius: 16px; padding: 24px; height: 100%;
          box-sizing: border-box;
          opacity: 0; transform: translateY(40px);
          transition:
            opacity 0.7s ease var(--card-delay, 0ms),
            transform 0.7s ease var(--card-delay, 0ms),
            border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .future-card.is-visible { opacity: 1; transform: translateY(0); }
        .future-card:hover {
          transform: translateY(-6px) !important;
          border-color: #0BAFBE !important;
          box-shadow: 0 20px 40px -20px rgba(11,175,190,0.3) !important;
        }

        /* ── Mobile responsive ──────────────────────────────────────── */
        @media (max-width: 900px) {
          .problema-grid, .solucion-grid {
            grid-template-columns: 1fr;
            padding: 0 24px;
            gap: 40px;
          }
          .problema-left, .solucion-left {
            position: relative;
            top: 0;
            height: auto;
            margin-bottom: 40px;
          }
          .problema-step, .solucion-step {
            min-height: auto;
            padding: 32px 0;
          }
          .dracs-audience-grid {
            flex-direction: column !important;
          }
          .dracs-about-body {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .solucion-left > div {
            width: 100% !important;
            max-width: 100% !important;
            aspect-ratio: unset !important;
            height: 280px !important;
          }
        }

        @media (max-width: 768px) {
          .dracs-future-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .dracs-future-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Reduced motion ─────────────────────────────────────────── */
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
