import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain,
  Smile, Mail, ImagePlus,
  Fish, Cat, Turtle, Check,
  Shirt, BookOpen,
} from 'lucide-react'

export type Role = 'child' | 'family' | 'therapist' | 'demo'

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

// ── Discover demo button ──────────────────────────────────────────────────────

function DiscoverDemoButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#F7C31C', border: 'none', cursor: 'pointer', color: '#33302A', fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: '17px', borderRadius: '28px', padding: '16px 40px', boxShadow: hovered ? '0 10px 28px rgba(247,195,28,0.45)' : '0 6px 16px rgba(247,195,28,0.30)', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.2s ease' }}
    >
      Descubre la demo
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
    <span style={{ fontFamily: '"Fredoka", serif', fontWeight: 600, fontSize: 'clamp(64px, 7vw, 96px)', color: '#1A8FB5', lineHeight: 1, fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'baseline', gap: '0.04em' }}>
      {digits}
      {unit && <span style={{ fontSize: unitSize, fontWeight: 600, letterSpacing: '-0.01em' }}>{unit}</span>}
    </span>
  )
}

// ── El Problema — orbital sticky section ──────────────────────────────────────

const DOT_POS = [
  { top:    0,    left: '50%', transform: 'translate(-50%, -50%)' }, // top
  { top: '50%',   right: 0,   transform: 'translate(50%, -50%)'  }, // right
  { bottom: 0,    left: '50%', transform: 'translate(-50%, 50%)'  }, // bottom
  { top: '50%',   left:  0,   transform: 'translate(-50%, -50%)' }, // left
] as React.CSSProperties[]

const PROBLEM_DATA = [
  {
    value: '1,2M',
    headline: 'Personas esperando',
    desc: 'Es la fila de espera actual en España para una primera sesión de logopedia pública. La mayoría son niños.',
  },
  {
    value: '18 meses',
    headline: 'Antes de la primera sesión',
    desc: 'Es la media de espera en el sistema. Año y medio sin atención profesional.',
  },
  {
    value: '70%',
    headline: 'De los logopedas, en 5 ciudades',
    desc: 'Si vivís fuera de Barcelona, Madrid, Valencia, Sevilla o Bilbao, encontrar logopeda público es casi imposible.',
  },
  {
    value: '600€',
    headline: 'Al mes en logopedia privada',
    desc: 'El coste medio de una intervención semanal privada. Acceso desigual por defecto.',
  },
]

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

  const circleSize = isMobile ? 240 : 440

  return (
    <section id="problema" className="problem dracs-panel" style={{ background: '#FAF5E8' }}>

      <div className="section-header">
        <h2 className="section-title">
          <em>Una década</em>{' '}
          perdida en listas de espera.
        </h2>
      </div>

      <div className="sticky-grid">

        {/* LEFT: sticky orbital circle */}
        <div className="sticky-left">
          <div className="circle-visual" style={{ position: 'relative', width: circleSize, height: circleSize, flexShrink: 0 }}>

            {/* Dashed border — subtle (azul tenue sobre crema) */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed #5B8896', opacity: 0.28 }} />

            {/* 4 cardinal dots — progress indicator (activo azul brillante, resto tenue) */}
            {DOT_POS.map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                ...pos,
                width:  activeIndex === i ? '18px' : '14px',
                height: activeIndex === i ? '18px' : '14px',
                borderRadius: '50%',
                background: activeIndex === i ? '#1A8FB5' : 'rgba(91,136,150,0.4)',
                border: activeIndex === i ? 'none' : '2px solid rgba(91,136,150,0.5)',
                boxShadow: activeIndex === i ? '0 0 0 6px rgba(26,143,181,0.2)' : 'none',
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
        <div className="sticky-right">
          {PROBLEM_DATA.map((data, i) => (
            <div key={i} ref={blockRefs[i]} className="step" style={{
              opacity: activeIndex === i ? 1 : (isMobile ? 0 : 0.35),
              transition: 'opacity 0.5s ease',
            }}>
              <div className="step-marker">
                <span className="step-dot" />
                <span className="step-line" />
              </div>
              <h3 style={{ margin: '0 0 18px', fontFamily: '"Fredoka", serif', fontWeight: 500, fontSize: 'clamp(28px, 3vw, 36px)', color: activeIndex === i ? '#33302A' : 'rgba(51,48,42,0.35)', lineHeight: 1.2, transition: 'color 0.4s ease' }}>
                {data.headline}
              </h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.62, fontFamily: 'Nunito, sans-serif', color: 'rgba(51,48,42,0.72)', maxWidth: '420px' }}>
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

function AnimalCard({ icon, label, active, className = '' }: { icon: React.ReactNode; label: string; active: boolean; className?: string }) {
  return (
    <div className={className} style={{ borderRadius: '10px', border: active ? '2px solid #5B8896' : '2px solid #F1F5F9', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', background: active ? '#F0FAFA' : '#ffffff', transition: 'all 0.3s ease' }}>
      {active && (
        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#5B8896', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={10} color="#ffffff" strokeWidth={3} />
        </div>
      )}
      <div style={{ color: active ? '#5B8896' : '#94A3B8' }} aria-label={label}>{icon}</div>
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
    if (i === activeStep) return 1
    if (isMobile) return 0
    if (i === activeStep + 1) return 0.25
    return 0
  }

  const steps = [
    { num: '01', title: 'El niño practica en casa', desc: 'Ejercicios adaptativos diarios desde cualquier tablet. Bilingüe catalán-castellano, gamificados, pensados para que el niño quiera abrir la app cada día.',    tag: 'Tantas sesiones como el niño necesite'  },
    { num: '02', title: 'La IA se adapta',           desc: 'Ajusta dificultad en tiempo real según atención y rendimiento. Un motor basado en reglas clínicas, no en cajas negras, para que el terapeuta entienda y confíe.', tag: 'Adaptación cognitiva' },
    { num: '03', title: 'El terapeuta supervisa',    desc: 'Dashboard completo con informes automáticos. El profesional ve qué practicó el niño, qué le costó, qué progresa. Sin trabajo administrativo extra.',               tag: 'Hasta 80 pacientes'   },
  ]

  return (
    <section id="solucion" className="solution dracs-panel" style={{ background: '#5B8896' }}>

      <div className="section-header">
        <h2 className="section-title section-title--on-blue">
          Dracs convierte la espera{' '}
          <em>en práctica diaria.</em>
        </h2>
      </div>

      <div className="sticky-grid" style={{ background: '#5B8896' }}>

        {/* LEFT: sticky frames */}
        <div className="sticky-left">
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px', aspectRatio: '1/1.1' }}>

            {/* Frame 1 — clinical exercise mockup */}
            <div className="frame-1-container" style={{ position: 'absolute', inset: 0, borderRadius: '32px', background: 'linear-gradient(135deg, #5B8896 0%, #088a96 100%)', border: '1px solid rgba(250,245,232,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px 14px' : '28px', opacity: activeStep === 0 ? 1 : 0, transform: activeStep === 0 ? 'scale(1)' : 'scale(0.95)', transition: 'opacity 0.6s ease, transform 0.6s ease', overflow: 'hidden' }}>
              <div className="frame-1-tablet" style={{ background: '#ffffff', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: '#F0FAFA', border: '1px solid #A5F3FC', borderRadius: '100px', padding: '4px 12px' }}>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '10px', letterSpacing: '0.1em', color: '#5B8896', textTransform: 'uppercase' }}>Ejercicio 3 de 8</span>
                </div>
                <p style={{ margin: 0, fontFamily: '"Fredoka", serif', fontWeight: 600, fontSize: '15px', color: '#33302A', lineHeight: 1.25, textAlign: 'center' }}>
                  Encuentra los animales que viven en el agua
                </p>
                <div className="frame-1-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <AnimalCard className="frame-1-grid-item" icon={<Fish size={22} />}   label="Pez"     active={true}  />
                  <AnimalCard className="frame-1-grid-item" icon={<Cat size={22} />}    label="Gato"    active={false} />
                  <AnimalCard className="frame-1-grid-item" icon={<Turtle size={22} />} label="Tortuga" active={true}  />
                  <AnimalCard className="frame-1-grid-item" icon={<Turtle size={22} />} label="Rana"    active={false} />
                  <AnimalCard className="frame-1-grid-item" icon={<Cat size={22} />}    label="Conejo"  active={false} />
                  <AnimalCard className="frame-1-grid-item" icon={<Fish size={22} />}   label="Pulpo"   active={true}  />
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', paddingTop: '4px' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < 2 ? '#88D4D9' : i === 2 ? '#5B8896' : '#F1F5F9' }} />
                  ))}
                </div>
              </div>
              <p className="frame-1-label" style={{ margin: '20px 0 0', fontFamily: 'Nunito, sans-serif', fontStyle: 'italic', fontWeight: 500, fontSize: '14px', color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.4 }}>
                Cada ejercicio adapta dificultad, contenido y refuerzo en tiempo real.
              </p>
            </div>

            {/* Frame 2 — IA adaptativa */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '32px', background: 'linear-gradient(135deg, #F7C31C 0%, #e5a82a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeStep === 1 ? 1 : 0, transform: activeStep === 1 ? 'scale(1)' : 'scale(0.95)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.6)', animation: 'rotateDot 20s linear infinite' }}>
                  <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
                </div>
                <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={52} color="#33302A" />
                </div>
              </div>
            </div>

            {/* Frame 3 — calendario semanal */}
            {(() => {
              type CalSession = { n: string; h: string; muted?: boolean }
              const calDays: Array<{ label: string; sessions: CalSession[] }> = [
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
                    <span style={{ fontFamily: '"Fredoka", serif', fontWeight: 600, fontSize: '18px', color: '#33302A' }}>Esta semana</span>
                    <span style={{ background: '#5B8896', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '12px' }}>12 sesiones</span>
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
                          <div key={si} style={{ background: s.muted ? '#E0F5F4' : '#5B8896', color: s.muted ? '#5B8896' : '#fff', padding: '4px 3px', borderRadius: '5px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '8px', lineHeight: 1.3, textAlign: 'center', minHeight: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
        <div className="sticky-right">
          {steps.map((step, i) => (
            <div key={step.num} ref={blockRefs[i]} className="step" style={{
              opacity: getOpacity(i),
              transition: 'opacity 0.5s ease',
            }}>
              <div className="solucion-step-num">
                {step.num}
              </div>
              <h3 style={{ margin: '0 0 16px', fontFamily: '"Fredoka", serif', fontSize: '44px', fontWeight: 500, color: '#33302A', lineHeight: 1.1 }}>
                {step.title}
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: '18px', color: '#FAF5E8', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65, maxWidth: '480px' }}>
                {step.desc}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '6px 16px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #A5F3FC', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1A8FB5' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1A8FB5', flexShrink: 0 }} />
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
      <div style={{ display: 'inline-flex', background: 'rgba(91,136,150,0.2)', border: '1px solid rgba(91,136,150,0.3)', borderRadius: '100px', padding: '3px 8px', width: 'fit-content' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '10px', letterSpacing: '0.05em', color: '#88D4D9', textTransform: 'uppercase' }}>EJERCICIO 5/8</span>
      </div>
      <p style={{ margin: 0, fontFamily: '"Fredoka", serif', fontWeight: 600, fontSize: '13px', color: '#ffffff', lineHeight: 1.25 }}>
        Ordená la rutina antes de dormir
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {steps.map(step => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 8px' }}>
            <span style={{ fontFamily: '"Fredoka", serif', fontWeight: 600, fontSize: '13px', color: '#F1D062', fontStyle: 'italic', minWidth: '14px' }}>{step.num}</span>
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
          <div key={i} style={{ flex: 1, height: `${h}%`, background: '#5B8896', borderRadius: '2px 2px 0 0', opacity: 0.75 + i * 0.07 }} />
        ))}
      </div>
      <div style={{ display: 'inline-flex', background: '#F0FAFA', border: '1px solid #A5F3FC', borderRadius: '100px', padding: '3px 10px' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: '#5B8896' }}>42 pacientes activos</span>
      </div>
    </div>
  )
}

function MiniMockupFamilia() {
  // Mini resumen semanal: 7 días con 5 practicados + barra de progreso corta.
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const done = [true, true, true, false, true, true, false] // 5 de 7
  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
      {/* Fila de 7 días — puntito relleno = practicó */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginBottom: '12px' }}>
        {days.map((d, i) => (
          <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: done[i] ? '#5B8896' : 'rgba(51,48,42,0.15)' }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '9px', color: 'rgba(51,48,42,0.55)' }}>{d}</span>
          </div>
        ))}
      </div>
      {/* Barra de progreso corta (5/7 de la semana) */}
      <div style={{ height: '6px', borderRadius: '100px', background: 'rgba(51,48,42,0.12)', overflow: 'hidden' }}>
        <div style={{ width: '71%', height: '100%', borderRadius: '100px', background: '#5B8896' }} />
      </div>
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
          fill="none" stroke="#5B8896" strokeWidth="1.5" opacity="0.2" />
        <path className="connection-path" d="M 450 80 C 540 -20 660 -20 750 80"
          fill="none" stroke="#5B8896" strokeWidth="1.5" opacity="0.2" />
        <path className="connection-path" d="M 750 340 C 620 445 280 445 150 340"
          fill="none" stroke="#5B8896" strokeWidth="1.5" opacity="0.2" />
      </svg>

      {/* Cards */}
      <div ref={containerRef} className="dracs-audience-grid" style={{ display: 'flex', gap: '20px', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>

        {/* Card: Niño */}
        <div className="dracs-audience-card" style={{ '--card-delay': '0ms', backgroundColor: '#5B8896', borderRadius: '20px', padding: '28px 24px', display: 'flex', flexDirection: 'column', flex: 1 } as React.CSSProperties}>
          <MiniMockupNino />
          <h3 style={{ margin: '0 0 10px', fontFamily: '"Fredoka", serif', fontSize: '22px', fontWeight: 600, color: '#FAF5E8', lineHeight: 1.2 }}>
            Niños que necesitan apoyo
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 400, color: '#FAF5E8', lineHeight: 1.55, fontFamily: 'Nunito, sans-serif', flex: 1 }}>
            Vocabulario, secuenciación, articulación. 480 ejercicios adaptados a cada perfil, supervisados por su logopeda.
          </p>
          <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            3 a 10 años
          </span>
        </div>

        {/* Card: Terapeuta */}
        <div className="dracs-audience-card" style={{ '--card-delay': '150ms', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '2px solid #1A8FB5', padding: '28px 24px', display: 'flex', flexDirection: 'column', flex: 1 } as React.CSSProperties}>
          <MiniMockupTerapeuta />
          <h3 style={{ margin: '0 0 10px', fontFamily: '"Fredoka", serif', fontSize: '22px', fontWeight: 600, color: '#33302A', lineHeight: 1.2 }}>
            Terapeutas y logopedas
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 400, color: '#6B7280', lineHeight: 1.55, fontFamily: 'Nunito, sans-serif', flex: 1 }}>
            Un logopeda en la pública atiende 25 niños como máximo. Con Dracs, llega a 80 sin perder calidad clínica.
          </p>
          <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#F0FAFA', border: '1px solid #A5F3FC', color: '#5B8896', fontSize: '12px', fontWeight: 600, fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Panel profesional
          </span>
        </div>

        {/* Card: Familia */}
        <div className="dracs-audience-card" style={{ '--card-delay': '300ms', backgroundColor: '#F1D062', borderRadius: '20px', border: '1.5px solid #C7A24F', padding: '28px 24px', display: 'flex', flexDirection: 'column', flex: 1 } as React.CSSProperties}>
          <MiniMockupFamilia />
          <h3 style={{ margin: '0 0 10px', fontFamily: '"Fredoka", serif', fontSize: '22px', fontWeight: 600, color: '#33302A', lineHeight: 1.2 }}>
            Familias
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 400, color: '#33302A', lineHeight: 1.55, fontFamily: 'Nunito, sans-serif', flex: 1 }}>
            Seguimiento claro del progreso semanal sin conocimientos médicos.
          </p>
          <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid #C7A24F', color: '#33302A', fontSize: '12px', fontWeight: 600, fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
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
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A8FB5', fontFamily: 'Nunito, sans-serif' }}>{num}</span>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1A8FB5', opacity: 0.5 }} />
            <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 500 }}>{tag}</span>
          </div>
          <h4 style={{ margin: '0 0 8px', fontFamily: '"Fredoka", serif', fontSize: '20px', fontWeight: 700, color: '#33302A', lineHeight: 1.25 }}>{title}</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.55 }}>{desc}</p>
        </div>
      ))}
    </div>
  )
}

// ── Reconocimientos ───────────────────────────────────────────────────────────

function LaurelWreath({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 110" width="72" aria-hidden="true">
      <g fill={color}>
        {/* Ramas curvas abiertas */}
        <path d="M60 102 C42 97 30 78 27 46" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M60 102 C78 97 90 78 93 46" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        {/* Hojas tipo gota, inclinadas a lo largo de la rama — lado izquierdo */}
        <ellipse cx="46" cy="93" rx="7"   ry="2.8" transform="rotate(-8 46 93)" />
        <ellipse cx="37" cy="84" rx="7.5" ry="2.9" transform="rotate(-16 37 84)" />
        <ellipse cx="31" cy="71" rx="8"   ry="3"   transform="rotate(-30 31 71)" />
        <ellipse cx="30" cy="58" rx="8"   ry="3"   transform="rotate(-48 30 58)" />
        <ellipse cx="26" cy="46" rx="7"   ry="2.7" transform="rotate(-68 26 46)" />
        <ellipse cx="28" cy="37" rx="5.5" ry="2.3" transform="rotate(-84 28 37)" />
        {/* Lado derecho (espejo) */}
        <ellipse cx="74" cy="93" rx="7"   ry="2.8" transform="rotate(8 74 93)" />
        <ellipse cx="83" cy="84" rx="7.5" ry="2.9" transform="rotate(16 83 84)" />
        <ellipse cx="89" cy="71" rx="8"   ry="3"   transform="rotate(30 89 71)" />
        <ellipse cx="90" cy="58" rx="8"   ry="3"   transform="rotate(48 90 58)" />
        <ellipse cx="94" cy="46" rx="7"   ry="2.7" transform="rotate(68 94 46)" />
        <ellipse cx="92" cy="37" rx="5.5" ry="2.3" transform="rotate(84 92 37)" />
      </g>
    </svg>
  )
}

function RecognitionCard({
  laurelColor, label, title, lead, meta,
}: { laurelColor: string; label: string; title: string; lead: string; meta: string[] }) {
  return (
    <div className="dracs-recognition-card">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
        <LaurelWreath color={laurelColor} />
      </div>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8578' }}>
        {label}
      </span>
      <h3 style={{ margin: '10px 0 14px', fontFamily: '"Fredoka", serif', fontWeight: 700, fontSize: 'clamp(24px, 2.6vw, 30px)', color: '#33302A', lineHeight: 1.15 }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 6px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '15px', color: '#33302A' }}>
        {lead}
      </p>
      {meta.map((line, i) => (
        <p key={i} style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: '14px', color: '#6B7280', lineHeight: 1.55 }}>
          {line}
        </p>
      ))}
    </div>
  )
}

// ── Sobre nosotros ────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="nosotros" className="dracs-panel" style={{ background: '#EAF3F5', padding: '120px clamp(24px, 5vw, 80px)' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>

        {/* Header — centered */}
        <Reveal style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ margin: 0, fontFamily: '"Fredoka", serif', fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 500, color: '#33302A', lineHeight: 1.1 }}>
            Dracs nació porque mi hermano{' '}
            <em style={{ color: '#1A8FB5', fontStyle: 'italic' }}>lo necesitaba.</em>
          </h2>
        </Reveal>

        {/* Body — 2 col */}
        <div className="dracs-about-body">
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="dracs-about-photo" style={{ width: '100%', aspectRatio: '4/5', borderRadius: '24px', background: '#FFFFFF', border: '1px solid #DCE8EB', boxShadow: '0 12px 32px rgba(62,94,107,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
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
                <span style={{ color: '#33302A', fontWeight: 600 }}>Y vi a mi hermano ir a la misma terapia, en la misma silla, con los mismos ejercicios fotocopiados que usaban hace una década.</span>
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                Mientras tanto, mi mamá llamaba a colegios, centros especiales, logopedas. Siempre la misma respuesta:{' '}
                <span style={{ color: '#33302A', fontWeight: 600 }}>lista de espera</span>. Y cuando no había lista de espera, había que pagar una fortuna.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p style={{ margin: 0, fontSize: '17px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
                Esto lo viví en Barcelona, con un hospital cada cinco calles.{' '}
                <span style={{ color: '#33302A', fontWeight: 600 }}>No puedo imaginarme cómo es en una zona rural, o sin recursos.</span>
              </p>
            </Reveal>
            <Reveal delay={320}>
              <blockquote style={{ margin: 0, background: '#FFFFFF', borderLeft: '4px solid #1A8FB5', borderRadius: '0 16px 16px 0', padding: '24px 28px', boxShadow: '0 12px 32px rgba(62,94,107,0.06)' }}>
                <p style={{ margin: 0, fontFamily: '"Fredoka", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '19px', color: '#33302A', lineHeight: 1.6 }}>
                  Los que más lo necesitan son los que más esperan. Los que menos tienen, los que menos reciben. El sistema funciona al revés.
                </p>
              </blockquote>
            </Reveal>
          </div>
        </div>

        {/* Reconocimiento — kicker + cards (movido desde su sección propia) */}
        <Reveal delay={80}>
          <div style={{ margin: '100px auto 0', paddingTop: '60px', borderTop: '1px solid rgba(51,48,42,0.10)' }}>
            <span style={{ display: 'block', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '14px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C7A24F', marginBottom: '40px' }}>
              Reconocimiento
            </span>
            <div className="dracs-recognition-grid">
              <RecognitionCard
                laurelColor="#C9A227"
                label="Primer puesto"
                title="First Place"
                lead="Babson Student Challenge"
                meta={['Clasificatoria local · EAE Business School', 'Barcelona · 2026']}
              />
              <RecognitionCard
                laurelColor="#A6A29B"
                label="Semifinalista global"
                title="Top Global Semifinalist"
                lead="Babson Student Challenge"
                meta={['Babson College · Boston · 2026']}
              />
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function RoleSelector() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#5B8896', fontFamily: 'Nunito, sans-serif' }}>

      {/* ── SECCIÓN 1: HERO ─────────────────────────────────────────────── */}
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 24px', position: 'relative', background: '#5B8896' }}>
        <img src="/logo-dracs.png" alt="Dracs" className="dracs-hero-dragon"
          style={{ width: '180px', height: 'auto', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))', marginBottom: '32px' }}
        />
        <p className="dracs-hero-phrase" style={{ margin: '0 0 48px', fontFamily: '"Fredoka", serif', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#FAF5E8', textAlign: 'center', animation: 'heroFadeIn 0.8s ease both', maxWidth: '600px' }}>
          Practicar en casa, por fin,{' '}<span style={{ color: '#F1D062' }}>se siente como jugar.</span>
        </p>
        <DiscoverDemoButton onClick={() => navigate('/demo')} />
      </section>

      {/* ── SECCIÓN 2: LOS DATOS — una década perdida (AZUL / DEEP) ─────── */}
      <ProblemaSection />

      {/* ── SECCIÓN 3: LA SOLUCIÓN — el niño practica en casa (CLARA) ───── */}
      <SolucionSection />

      {/* ── SECCIÓN 4: DISEÑADO PARA TODOS ─────────────────────────────── */}
      <section id="para-quien" className="dracs-panel" style={{ background: '#FAF5E8', padding: '120px clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ margin: 0, fontFamily: '"Fredoka", serif', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700, color: '#33302A', lineHeight: 1.1 }}>
              Diseñado para todos.
            </h2>
          </Reveal>
          <ConnectedAudienceGrid />
        </div>
      </section>

      {/* ── SECCIÓN 5: EL FUTURO DE DRACS ──────────────────────────────── */}
      <section id="futuro" style={{ padding: '120px clamp(24px, 5vw, 80px)', background: '#5B8896' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: '"Fredoka", serif', fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 700, color: '#FAF5E8' }}>
              El futuro de <em style={{ fontStyle: 'italic', color: '#F1D062' }}>Dracs.</em>
            </h2>
            <p style={{ margin: 0, fontSize: '16px', color: 'rgba(250,245,232,0.88)', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65 }}>
              De app de ejercicios a compañero clínico. Estas son las próximas cuatro funcionalidades.
            </p>
          </Reveal>
          <FutureRevealGrid />
        </div>
      </section>

      {/* ── SECCIÓN 6: SOBRE NOSOTROS (incluye reconocimientos al final) ── */}
      <AboutSection />

      {/* ── SECCIÓN 7: FOOTER CTA ───────────────────────────────────────── */}
      <section id="contacto" style={{ background: '#5B8896', padding: '80px clamp(24px, 5vw, 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
        <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/logo-dracs.png" alt="" style={{ height: '80px', width: 'auto', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.20))' }} />
        </Reveal>
        <Reveal delay={100}>
          <h2 style={{ margin: 0, fontFamily: '"Fredoka", serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
            Dracs está en desarrollo.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p style={{ margin: 0, fontSize: '16px', color: '#FAF5E8', fontFamily: 'Nunito, sans-serif', maxWidth: '480px', lineHeight: 1.6 }}>
            Si trabajás con niños con necesidades especiales, nos encantaría conocerte.
          </p>
        </Reveal>
        <Reveal delay={300} style={{ display: 'flex', justifyContent: 'center' }}>
          <a href="mailto:dracs@dracs.health"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', background: '#F7C31C', color: '#33302A', fontSize: '16px', fontWeight: 600, textDecoration: 'none', fontFamily: 'Fredoka, system-ui, sans-serif', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 8px 24px rgba(247,195,28,0.40)' }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = 'none' }}
          >
            <Mail size={16} />Escribinos
          </a>
        </Reveal>
      </section>

      {/* ── Global CSS ──────────────────────────────────────────────────── */}
      <style>{`
        /* Scroll snap gestionado por JavaScript */

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
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #1A8FB5; flex-shrink: 0; }
        .step-line { height: 1px; width: 32px; background: #1A8FB5; opacity: 0.4; }

        /* ── Calendar: hide text on very small screens ───────────────── */
        @media (max-width: 420px) {
          .cal-session-text { display: none; }
        }

        /* ── Section header — título normal, no sticky ──────────────── */
        .section-header {
          text-align: center;
          padding: 100px 48px 60px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .section-title {
          font-family: 'Fredoka', serif;
          font-weight: 500;
          font-size: clamp(40px, 5.5vw, 72px);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #33302A;
          margin: 0;
        }
        .section-title em {
          font-style: italic;
          color: #1A8FB5;
        }
        /* Sobre secciones azules: título en crema, acento en amarillo mate */
        .section-title--on-blue { color: #FAF5E8; }
        .section-title--on-blue em { color: #F1D062; }

        /* ── Panel inset ────────────────────────────────────────────────
           Secciones de contenido dentro de un panel más chico, con margen
           a los costados y arriba/abajo, para que el azul de la página
           asome alrededor y ninguna sección se funda con la de al lado.
           Sin overflow:hidden para no romper el sticky de las columnas. */
        .dracs-panel {
          position: relative;
          border-radius: clamp(20px, 3vw, 40px);
          margin: clamp(18px, 2.5vw, 30px) clamp(12px, 4vw, 44px);
        }
        @media (max-width: 900px) {
          /* En móvil el panel va a todo el ancho (sólo separación arriba/abajo),
             así el azul sigue asomando entre secciones sin que el fondo opaco
             del sticky se derrame en un margen lateral. */
          .dracs-panel {
            margin: 14px 0;
            border-radius: 18px;
          }
        }

        /* ── Sticky 2-column grid — animación fija, texto scrollea ──── */
        .sticky-grid {
          display: grid;
          grid-template-columns: minmax(0, 460px) 1fr;
          gap: clamp(32px, 4vw, 56px);
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(24px, 5vw, 48px) 100px;
          align-items: start;
        }
        .sticky-left {
          position: sticky;
          top: 100px;
          height: calc(100vh - 100px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sticky-right {
          display: flex;
          flex-direction: column;
        }
        .step {
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
          box-shadow: 0 4px 20px rgba(91,136,150,0.06);
        }
        .dracs-audience-card.is-visible {
          opacity: 1; transform: translateY(0);
        }
        .dracs-audience-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.1) !important;
        }

        /* ── Audience card structure alignment ──────────────────────── */
        /* First child = MiniMockup — reserve equal height across 3 cards */
        .dracs-audience-card > div:first-child {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        /* Title — reserve 2-line height so all 3 titles align */
        .dracs-audience-card h3 {
          min-height: 60px;
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
          border-color: #5B8896 !important;
          box-shadow: 0 20px 40px -20px rgba(91,136,150,0.3) !important;
        }
        /* Título con alto fijo de 2 líneas para que el texto gris arranque a la
           misma altura en las 4 cards (fontSize 20px · lineHeight 1.25). */
        .future-card h4 { min-height: 2.5em; }

        /* ── Reconocimientos ────────────────────────────────────────────── */
        .dracs-recognition-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(20px, 3vw, 32px);
        }
        .dracs-recognition-grid > div { flex: 1 1 300px; max-width: 360px; }
        .dracs-recognition-card {
          flex: 1;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 36px 32px 32px;
          text-align: center;
          box-shadow: 0 8px 28px rgba(91,136,150,0.10);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .dracs-recognition-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.12);
        }
        /* Móvil: cards apiladas en vertical, sin scroll horizontal
           (orden DOM: kicker → First Place → Top Global Semifinalist) */
        @media (max-width: 640px) {
          .dracs-recognition-grid { flex-direction: column; align-items: center; }
          .dracs-recognition-grid > div { flex: 1 1 auto; width: 100%; max-width: 400px; }
        }

        /* ── Step numbers — La Solución ─────────────────────────────────── */
        .solucion-step-num {
          font-family: 'Fredoka', serif;
          font-style: normal;
          font-weight: 500;
          font-size: 72px;
          color: #F1D062;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 16px;
        }


        /* ── Frame 1: tablet containment ───────────────────────────── */
        .frame-1-container { overflow: hidden !important; }
        .frame-1-tablet {
          max-width: 260px;
          width: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        .frame-1-grid { width: 100%; }
        .frame-1-grid-item {
          min-width: 0;
          aspect-ratio: 1;
          padding: 6px !important;
          box-sizing: border-box;
        }
        .frame-1-label { max-width: 260px; }
        @media (max-width: 900px) {
          .frame-1-container { padding: 12px 10px !important; overflow: hidden !important; }
          .frame-1-tablet { max-width: 190px; padding: 10px !important; gap: 8px !important; }
          .frame-1-grid { gap: 4px !important; }
          .frame-1-grid-item { padding: 4px !important; }
          .frame-1-label { font-size: 10px !important; max-width: 180px !important; margin-top: 6px !important; }
        }
        @media (max-width: 600px) {
          .frame-1-label { display: none !important; }
        }

        /* ── Mobile responsive ──────────────────────────────────────── */
        @media (max-width: 900px) {
          .solucion-step-num { font-size: 48px; }
          .section-header {
            padding: 60px 20px 90px;
          }
          .section-title {
            font-size: clamp(28px, 7vw, 40px) !important;
          }
          .sticky-grid {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 0 20px 60px;
          }
          .sticky-left {
            position: sticky;
            top: 90px;
            height: 45vh;
            z-index: 20;
            width: 100%;
          }
          /* LA SOLUCIÓN: frames más compactos para dejar aire al texto debajo */
          .solution .sticky-left { height: 38vh; }
          /* Opaque backgrounds — explicit colors (not inherit) */
          .problem .sticky-left { background: #FAF5E8; }
          .solution .sticky-left { background: #5B8896; }
          /* Extend background into the grid's 20px padding on each side */
          .problem .sticky-left::before {
            content: '';
            position: absolute;
            top: -80px; bottom: 0;
            left: -20px; right: -20px;
            background: #FAF5E8;
            z-index: -1;
          }
          .solution .sticky-left::before {
            content: '';
            position: absolute;
            top: -80px; bottom: 0;
            left: -20px; right: -20px;
            background: #5B8896;
            z-index: -1;
          }
          .step {
            min-height: 55vh;
            padding: 30px 0;
          }
          /* LA SOLUCIÓN: frame wrapper fills sticky-left height */
          .solution .sticky-left > div {
            width: 100% !important;
            max-width: 100% !important;
            aspect-ratio: unset !important;
            height: 100% !important;
          }
          .dracs-audience-grid {
            flex-direction: column !important;
          }
          .dracs-audience-card h3 {
            min-height: auto !important;
          }
          .dracs-about-body {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
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
