// Carta de la semana — el pixie dust: la app narra el crecimiento en la voz
// del mundo, en clave emocional y nunca numérica (§2.2).

import { Envelope } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import { cartaTitle, cartaBody, DRAGUI, type WeekSignal } from './familyHome.copy'

export default function CartaDeLaSemana({
  childName, signal, delay = 0,
}: { childName: string; signal: WeekSignal; delay?: number }) {
  return (
    <section
      className="home-rise"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={cartaTitle()}
    >
      <article
        className="carta-in"
        style={{
          position: 'relative',
          background: `linear-gradient(160deg, ${HT.creamCard} 0%, #FFF7E4 100%)`,
          border: `1px solid ${HT.line}`,
          borderRadius: HT.radius,
          padding: '26px 26px 22px',
          boxShadow: HT.shadow,
          overflow: 'hidden',
        }}
      >
        {/* Sello cálido en la esquina, como el lacre de una carta. */}
        <span aria-hidden style={{
          position: 'absolute', top: '-26px', right: '-26px', width: '110px', height: '110px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,195,28,0.22), transparent 70%)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: HT.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Envelope size={18} weight="duotone" color={HT.blueDeep} />
          </span>
          <h2 style={{
            margin: 0, fontSize: '15px', fontWeight: 700, color: HT.blueDeep,
            fontFamily: HT.display, letterSpacing: '0.01em',
          }}>
            {cartaTitle()}
          </h2>
        </div>

        <p style={{
          margin: 0, fontSize: '18px', fontWeight: 500, color: HT.ink,
          lineHeight: 1.62, fontFamily: HT.body,
        }}>
          {cartaBody(childName, signal)}
        </p>

        <p style={{
          margin: '16px 0 0', fontSize: '14px', fontWeight: 700, color: HT.taupe,
          fontFamily: HT.display, textAlign: 'right',
        }}>
          — con cariño, {DRAGUI}
        </p>
      </article>
    </section>
  )
}
