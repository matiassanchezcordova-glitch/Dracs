import { useEffect, useRef, useState } from 'react'
import { Gamepad2, Heart, Stethoscope, ChevronDown } from 'lucide-react'

export type Role = 'child' | 'family' | 'therapist'

interface Props {
  onSelect: (role: Role) => void
  onAbout: () => void
  onLogin: () => void
}

// ── Scroll reveal ──────────────────────────────────────────────────────────

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

// ── Frases dinámicas ───────────────────────────────────────────────────────

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

// ── Role row button ────────────────────────────────────────────────────────

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
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A2E', fontFamily: 'Nunito, sans-serif', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 400, lineHeight: 1.2, marginTop: '2px' }}>
          {subtitle}
        </div>
      </div>
    </button>
  )
}

// ── Scroll helper ──────────────────────────────────────────────────────────

function scrollToId(id: string, offset = 24) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function RoleSelector({ onSelect, onAbout, onLogin }: Props) {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])
  const { ref: futureRef, visible: futureVisible } = useScrollReveal()
  const { ref: knowRef,   visible: knowVisible   } = useScrollReveal()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      fontFamily: 'Nunito, sans-serif',
    }}>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 50, padding: '16px 32px',
        display: 'flex', alignItems: 'center',
        background: 'transparent',
      }} />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 24px',
        position: 'relative',
      }}>
        {/* Dragón protagonista */}
        <img
          src="/dragon.nb.png"
          alt="Dracs"
          style={{
            width: '180px',
            height: 'auto',
            animation: 'floatDragon2 3s ease-in-out infinite',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.10))',
            marginBottom: '32px',
          }}
        />

        {/* Frase dinámica */}
        <p style={{
          margin: '0 0 48px',
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 700,
          color: '#0BAFBE',
          textAlign: 'center',
          animation: 'heroFadeIn 0.8s ease both',
          maxWidth: '600px',
        }}>
          {phrase}
        </p>

        {/* Card de selección de rol */}
        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <RoleRowBtn
            icon={<Gamepad2 size={18} />}
            iconBg="#FFF8E8" iconBorder="#FDE68A" iconColor="#D97706"
            title="Ejercicios"
            subtitle="Sesión adaptada"
            onClick={() => onSelect('child')}
          />
          <RoleRowBtn
            icon={<Heart size={18} />}
            iconBg="#F0FDF4" iconBorder="#BBF7D0" iconColor="#059669"
            title="Progreso"
            subtitle="Informe semanal"
            onClick={() => onSelect('family')}
          />
          <RoleRowBtn
            icon={<Stethoscope size={18} />}
            iconBg="#F0FAFA" iconBorder="#A5F3FC" iconColor="#0BAFBE"
            title="Logopedia"
            subtitle="Panel clínico"
            onClick={() => onSelect('therapist')}
          />

          {/* Separator */}
          <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

          {/* Login link */}
          <button
            onClick={onLogin}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#6B7280',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              textAlign: 'center',
              padding: '6px 0',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#0BAFBE')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#6B7280')}
          >
            ¿Ya tienes cuenta?{' '}
            <span style={{ color: '#0BAFBE', fontWeight: 700 }}>Inicia sesión</span>
          </button>
        </div>

        {/* "Conoce el proyecto" button */}
        <KnowProjectButton onClick={() => scrollToId('proyecto-section')} />

        {/* Logo DRACS firma */}
        <p style={{
          marginTop: '16px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: '14px',
          color: '#94A3B8',
          letterSpacing: '0.1em',
          textAlign: 'center',
        }}>
          DRACS
        </p>
      </section>

      {/* ── EL PROYECTO DETRÁS DE DRACS ────────────────────────── */}
      <section
        id="proyecto-section"
        ref={knowRef as React.RefObject<HTMLElement>}
        style={{
          padding: '100px 48px',
          background: '#FFFFFF',
          opacity: knowVisible ? 1 : 0,
          transform: knowVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div className="dracs-proyecto-inner" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '80px', alignItems: 'center' }}>
          <div style={{ flex: '0 0 50%' }}>
            <div style={{
              display: 'inline-flex', background: '#FFF3CD', color: '#92400E',
              fontSize: '12px', fontWeight: 600, padding: '6px 14px',
              borderRadius: '20px', letterSpacing: '0.04em',
              marginBottom: '24px', fontFamily: 'Nunito, sans-serif',
            }}>
              EAE · BABSON 2026
            </div>
            <h2 style={{
              margin: '0 0 20px', fontFamily: '"Playfair Display", serif',
              fontSize: '40px', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.15,
            }}>
              El proyecto detrás de Dracs.
            </h2>
            <p style={{
              margin: '0 0 32px', fontSize: '16px', color: '#6B7280',
              fontFamily: 'Nunito, sans-serif', fontWeight: 400,
              maxWidth: '420px', lineHeight: 1.65,
            }}>
              En España, 1.2 millones de personas esperan más de 18 meses para recibir
              terapia. Dracs nació para que ningún niño pierda su ventana de aprendizaje
              por culpa de una lista de espera.
            </p>
            <button
              onClick={onAbout}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px',
                border: '1.5px solid #0BAFBE',
                background: 'transparent', color: '#0BAFBE',
                fontSize: '15px', fontWeight: 700, fontFamily: 'Nunito, sans-serif',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#0BAFBE'; b.style.color = '#ffffff' }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = '#0BAFBE' }}
            >
              Leer el manifiesto
            </button>
          </div>

          <div style={{ flex: '0 0 50%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { value: '1.2M',     label: 'personas en lista de espera' },
              { value: '18 meses', label: 'tiempo medio de espera' },
              { value: '88%',      label: 'recibe terapia insuficiente' },
              { value: '€8.5B',    label: 'coste anual evitable' },
            ].map(({ value, label }) => (
              <div key={label} style={{ background: '#F0FAFA', borderRadius: '16px', padding: '24px' }}>
                <div style={{
                  fontSize: '48px', color: '#0BAFBE',
                  lineHeight: 1, marginBottom: '8px',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {value}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', fontWeight: 500, lineHeight: 1.4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EL FUTURO DE DRACS ─────────────────────────────────── */}
      <section
        id="futuro-section"
        ref={futureRef as React.RefObject<HTMLElement>}
        style={{
          padding: '100px 48px',
          opacity: futureVisible ? 1 : 0,
          transform: futureVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            margin: '0 0 16px', fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 700, color: '#1A1A2E',
          }}>
            El futuro de Dracs.
          </h2>
          <p style={{ margin: 0, fontSize: '16px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.65, fontWeight: 400 }}>
            De app de ejercicios a compañero clínico. Estas son las próximas cuatro funcionalidades.
          </p>
        </div>

        <div className="dracs-future-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { num: '01', tag: 'voz',      title: 'Reconocimiento de habla',  desc: 'La app escucha y evalúa la pronunciación en tiempo real.' },
            { num: '02', tag: 'atención', title: 'Lectura de fatiga',         desc: 'Detecta cuando el niño pierde concentración y adapta la sesión.' },
            { num: '03', tag: 'cohorte',  title: 'Comparativa anónima',       desc: 'Benchmarks clínicos contra cohorte de edad y diagnóstico.' },
            { num: '04', tag: 'familia',  title: 'Mensajes de voz',           desc: 'El niño graba mensajes de voz para la familia al acabar.' },
          ].map(({ num, tag, title, desc }) => (
            <div key={num} style={{ background: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>{num}</span>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0BAFBE', opacity: 0.5 }} />
                <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 500 }}>{tag}</span>
              </div>
              <h4 style={{ margin: '0 0 8px', fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.25 }}>
                {title}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', lineHeight: 1.55, fontWeight: 400 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderTop: '1px solid #F1F5F9' }}>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Nunito, sans-serif' }}>
          Dracs · Barcelona · 2026
        </span>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#6B7280', fontFamily: 'Nunito, sans-serif', fontWeight: 600, padding: '4px 8px' }}
        >
          ↑ Volver arriba
        </button>
      </footer>
    </div>
  )
}

function KnowProjectButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginTop: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 20px',
        borderRadius: '20px',
        border: 'none',
        background: '#0BAFBE',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 700,
        fontFamily: 'Nunito, sans-serif',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: hovered
          ? '0 6px 20px rgba(11,175,190,0.45)'
          : '0 4px 12px rgba(11,175,190,0.3)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      Conoce el proyecto
      <ChevronDown size={14} />
    </button>
  )
}
