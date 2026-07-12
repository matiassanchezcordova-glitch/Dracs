import { useState } from 'react'
import { Gamepad2, Heart, Stethoscope, Play } from 'lucide-react'
import type { Role } from './RoleSelector'

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
      style={{ height: '64px', borderRadius: '14px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '14px', border: `1.5px solid ${hovered ? '#5B8896' : '#F1F5F9'}`, background: hovered ? '#F0FAFA' : '#ffffff', cursor: 'pointer', width: '100%', transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'all 200ms ease' }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: iconBg, border: `1px solid ${iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div className="dracs-role-btn-title" style={{ fontSize: '15px', fontWeight: 700, color: '#33302A', fontFamily: 'Nunito, sans-serif', lineHeight: 1.2 }}>{title}</div>
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
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5B8896')}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#94A3B8')}
    >
      <Play size={12} />Ver demo
    </button>
  )
}

// ── Role card ─────────────────────────────────────────────────────────────────
// Selector de entrada al MVP. El niño ve "Juegos" (nunca "Ejercicios").

export default function RoleCard({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="dracs-role-card" style={{ maxWidth: '400px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#C8C8C8', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
        ¿Quién está aquí hoy?
      </p>
      <RoleRowBtn icon={<Gamepad2 size={18} />}    iconBg="#FFF8E8" iconBorder="#FDE68A" iconColor="#D97706" title="Juegos"     subtitle="Sesión adaptada"  onClick={() => onSelect('child')} />
      <RoleRowBtn icon={<Heart size={18} />}       iconBg="#F0FDF4" iconBorder="#BBF7D0" iconColor="#059669" title="Progreso"   subtitle="Informe semanal"  onClick={() => onSelect('family')} />
      <RoleRowBtn icon={<Stethoscope size={18} />} iconBg="#F0FAFA" iconBorder="#A5F3FC" iconColor="#5B8896" title="Logopedia"  subtitle="Panel clínico"    onClick={() => onSelect('therapist')} />
      <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />
      <DemoLink onClick={() => onSelect('demo')} />
    </div>
  )
}
