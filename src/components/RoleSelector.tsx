import { useState } from 'react'
import { Smile, Heart, Stethoscope, ChevronRight, Sparkles } from 'lucide-react'

export type Role = 'child' | 'family' | 'therapist'

interface Props {
  onSelect: (role: Role) => void
  onAbout: () => void
}

// ── Role card ──────────────────────────────────────────────────────────────

function RoleCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 20px',
        borderRadius: '16px',
        background: hovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.14)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1.5px solid ${hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.28)'}`,
        cursor: 'pointer',
        transform: hovered ? 'translateX(5px)' : 'translateX(0)',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      <div style={{ color: '#ffffff', flexShrink: 0, display: 'flex' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'Nunito, sans-serif',
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>
      </div>
      <ChevronRight
        size={18}
        style={{
          color: 'rgba(255,255,255,0.6)',
          flexShrink: 0,
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
        }}
      />
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function RoleSelector({ onSelect, onAbout }: Props) {
  const [aboutHovered, setAboutHovered] = useState(false)

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(135deg, #0BAFBE 0%, #065A6E 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Dragon */}
        <img
          src="/dragon.nb.png"
          alt="DRACS mascot"
          style={{
            height: '140px',
            width: 'auto',
            display: 'block',
            animation: 'floatDragon2 3s ease-in-out infinite',
            marginBottom: '18px',
          }}
        />

        {/* Brand */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '4px',
            lineHeight: 1,
          }}
        >
          DRACS
        </div>
        <div
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 500,
            marginTop: '5px',
            marginBottom: '28px',
          }}
        >
          Terapia del lenguaje adaptativa
        </div>

        {/* Divider */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.18)',
            marginBottom: '22px',
          }}
        />

        {/* Question */}
        <p
          style={{
            margin: '0 0 16px',
            fontSize: '17px',
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          ¿Quién está aquí hoy?
        </p>

        {/* Role cards */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <RoleCard
            icon={<Smile size={22} />}
            title="Hoy toca practicar"
            subtitle="Entra y completa tu sesión de hoy"
            onClick={() => onSelect('child')}
          />
          <RoleCard
            icon={<Heart size={22} />}
            title="Quiero ver el progreso"
            subtitle="Seguimiento semanal de tu hijo"
            onClick={() => onSelect('family')}
          />
          <RoleCard
            icon={<Stethoscope size={22} />}
            title="Soy el profesional"
            subtitle="Panel clínico y seguimiento de pacientes"
            onClick={() => onSelect('therapist')}
          />
        </div>

        {/* About link */}
        <button
          onClick={onAbout}
          onMouseEnter={() => setAboutHovered(true)}
          onMouseLeave={() => setAboutHovered(false)}
          style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: aboutHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'Nunito, sans-serif',
            transition: 'color 0.2s ease',
            padding: '4px 8px',
          }}
        >
          <Sparkles
            size={14}
            style={{
              color: '#FFD93D',
              flexShrink: 0,
              opacity: aboutHovered ? 1 : 0.7,
              transition: 'opacity 0.2s ease',
            }}
          />
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>Descubre Dracs</span>
            <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.7, lineHeight: 1.2 }}>El proyecto detrás de la app</span>
          </span>
        </button>
      </div>
    </div>
  )
}
