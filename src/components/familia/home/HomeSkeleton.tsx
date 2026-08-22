// Estado de carga cálido (§5): esqueleto crema, nunca un spinner sobre blanco.

import { HT, COLUMN_MAX } from './homeStyles'
import { LOADING_HINT } from './familyHome.copy'

function Block({ h, w = '100%', r = HT.radiusSm }: { h: number; w?: string; r?: string }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: `linear-gradient(100deg, ${HT.sand} 25%, #F5EEDD 50%, ${HT.sand} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.6s ease-in-out infinite',
    }} />
  )
}

export default function HomeSkeleton() {
  return (
    <div className="casa-home" style={{
      width: '100%', maxWidth: COLUMN_MAX, margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px',
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '12px 4px' }}>
        <Block h={112} w="112px" r="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Block h={14} w="40%" />
          <Block h={30} w="75%" />
          <Block h={16} w="90%" />
        </div>
      </div>
      <Block h={150} />
      <Block h={120} />
      <Block h={300} />
      <p style={{
        textAlign: 'center', margin: 0, fontSize: '13px', fontWeight: 700,
        color: HT.taupe, fontFamily: HT.body,
      }}>
        {LOADING_HINT}
      </p>
    </div>
  )
}
