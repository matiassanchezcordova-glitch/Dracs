// La puerta — el momento "estás en casa". El dragón compañero saluda a la
// familia por su nombre y reacciona al cargar (§2.1). Es un umbral, no una
// barra superior.

import { Sparkle } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import { doorTitle, doorSubline, type WeekSignal } from './familyHome.copy'

function HeroSparkle({ top, left, delay, size }: { top: string; left: string; delay: string; size: number }) {
  return (
    <Sparkle
      className="home-sparkle"
      aria-hidden
      weight="fill"
      size={size}
      color={HT.yellow}
      style={{
        position: 'absolute', top, left,
        animation: `sparkleTwinkle 2.6s ease-in-out ${delay} infinite`,
        pointerEvents: 'none',
      }}
    />
  )
}

export default function LaPuerta({ childName, signal }: { childName: string; signal: WeekSignal }) {
  return (
    <header
      className="home-rise"
      style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        padding: '12px 4px 4px', flexWrap: 'wrap',
      }}
    >
      {/* Dragón compañero — flota siempre y saluda una vez al montar. */}
      <div style={{ position: 'relative', flexShrink: 0, width: '128px', height: '128px' }}>
        <HeroSparkle top="6px"  left="4px"   delay="0s"   size={13} />
        <HeroSparkle top="22px" left="104px" delay="0.7s" size={16} />
        <HeroSparkle top="96px" left="0px"   delay="1.3s" size={11} />
        <img
          src="/brand/dracs-dragon.png"
          alt=""
          aria-hidden
          className="home-greet"
          style={{
            width: '128px', height: '128px', objectFit: 'contain',
            transformOrigin: '60% 80%',
            filter: 'drop-shadow(0 10px 18px rgba(51,48,42,0.14))',
          }}
        />
      </div>

      {/* Sin kicker: "La casa de {Nombre}" ya dice dónde estás. Título + una
          sola línea de subtítulo. */}
      <div style={{ flex: 1, minWidth: '220px' }}>
        <h1 style={{
          margin: 0, fontSize: 'clamp(28px, 6vw, 38px)', fontWeight: 700,
          color: HT.blueDeep, lineHeight: 1.1, fontFamily: HT.display,
        }}>
          {doorTitle(childName)}
        </h1>
        <p style={{
          margin: '10px 0 0', fontSize: '16px', fontWeight: 600, color: HT.ink,
          lineHeight: 1.5, fontFamily: HT.body, maxWidth: '46ch',
        }}>
          {doorSubline(childName, signal)}
        </p>
      </div>
    </header>
  )
}
