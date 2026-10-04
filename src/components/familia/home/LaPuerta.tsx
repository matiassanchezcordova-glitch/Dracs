// La puerta — el momento "estás en casa". El título va en serif, como las
// secciones de la web, y el dragón compañero acompaña al lado, flotando suave.
// Es un umbral, no una barra superior.

import { HT } from './homeStyles'
import { doorTitle, doorSubline, type WeekSignal } from './familyHome.copy'

export default function LaPuerta({ childName, signal }: { childName: string; signal: WeekSignal }) {
  return (
    <header
      className="home-rise"
      style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '8px 0 4px' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 className="home-h1" style={{
          margin: 0, fontWeight: 500, letterSpacing: '-0.015em',
          color: HT.ink, lineHeight: 1.05, fontFamily: HT.serif,
        }}>
          {doorTitle(childName)}
        </h1>
        <p style={{
          margin: '12px 0 0', fontSize: '18px', fontWeight: 400, color: HT.muted,
          lineHeight: 1.5, fontFamily: HT.body, maxWidth: '40ch',
        }}>
          {doorSubline(childName, signal)}
        </p>
      </div>

      {/* El dragón compañero: flota siempre y saluda una vez al montar. */}
      <img
        src="/landing/dragon.webp"
        alt=""
        aria-hidden
        width={96}
        height={124}
        className="home-greet home-dragon"
        style={{ flexShrink: 0, height: 'auto', transformOrigin: '60% 80%' }}
      />
    </header>
  )
}
