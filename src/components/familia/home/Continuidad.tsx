// Continuidad — "el mundo lo espera" (§2.5). Refuerza "todo está donde lo
// dejaste". Minimal y honesto: no inventamos un lugar concreto porque el dato
// de "última parada" no está disponible en el cliente de la familia; mostramos
// una invitación cálida y siempre verdadera al mundo del niño.

import { MapTrifold, ArrowRight } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import { CONTINUITY_KICKER, continuityLine, CONTINUITY_CTA } from './familyHome.copy'

export default function Continuidad({
  childName, onOpenWorld, delay = 0,
}: { childName: string; onOpenWorld: () => void; delay?: number }) {
  return (
    <section
      className="home-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        type="button"
        onClick={onOpenWorld}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 18px', borderRadius: HT.radiusSm,
          background: 'transparent', border: `1px solid ${HT.line}`,
          transition: 'background 0.16s ease, transform 0.16s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = HT.creamCard; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <span aria-hidden style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: HT.blueTint, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MapTrifold size={22} weight="duotone" color={HT.blue} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: HT.taupe, fontFamily: HT.body, marginBottom: '3px',
          }}>
            {CONTINUITY_KICKER}
          </span>
          <span style={{
            display: 'block', fontSize: '14.5px', fontWeight: 600, color: HT.ink,
            fontFamily: HT.body, lineHeight: 1.45,
          }}>
            {continuityLine(childName)}
          </span>
        </span>
        {/* Flecha del set Phosphor (nunca el carácter "→", que rompe la
            tipografía y lee como emoji viejo). */}
        <span style={{
          flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: 700, color: HT.blue, fontFamily: HT.display,
        }}>
          {CONTINUITY_CTA}
          <ArrowRight size={15} weight="bold" color={HT.blue} />
        </span>
      </button>
    </section>
  )
}
