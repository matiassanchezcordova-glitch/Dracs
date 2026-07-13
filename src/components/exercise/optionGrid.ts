import type { CSSProperties } from 'react'

// Adaptive grid for exercise option/item collections.
//
// Desktop:
//   2 → 1×2
//   3 → 1×3
//   4 → 2×2
//   5 → row 1: 3 cols, row 2: 2 cols centered (inverted triangle)
//
// Mobile (≤480px):
//   2 → 1×2
//   3 → 1×3
//   4 → 2×2
//   5 → 2×2 + 1 centered below

export interface OptionGrid {
  container: CSSProperties
  itemStyle: (index: number) => CSSProperties
  cardMaxWidth: number
}

const NOOP: (i: number) => CSSProperties = () => ({})

export function optionGrid(count: number, isMobile: boolean): OptionGrid {
  const gap = isMobile ? '14px' : '20px'

  if (count <= 2) {
    return {
      container: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap },
      itemStyle: NOOP,
      cardMaxWidth: isMobile ? 160 : 300,
    }
  }

  if (count === 3) {
    return {
      container: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap },
      itemStyle: NOOP,
      cardMaxWidth: isMobile ? 110 : 260,
    }
  }

  if (count === 4) {
    // 2×2. Cards más chicas y juntas para que las 4 entren en pantalla sin
    // scroll (dos filas deben caber en la zona inferior, que es ~60% del alto).
    return {
      container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: isMobile ? '10px' : '14px',
      },
      itemStyle: NOOP,
      cardMaxWidth: isMobile ? 120 : 160,
    }
  }

  // count === 5 (or more — capped to same layout family)
  if (isMobile) {
    // 2×2 + 1 centered below
    return {
      container: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap },
      itemStyle: (i: number) =>
        i === 4 ? { gridColumn: '1 / -1', justifySelf: 'center', width: '50%' } : {},
      cardMaxWidth: 150,
    }
  }

  // Desktop: inverted triangle (3 above, 2 centered below) on a 6-col grid.
  return {
    container: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap },
    itemStyle: (i: number) =>
      i === 3 ? { gridColumn: '2 / span 2' } : { gridColumn: 'span 2' },
    cardMaxWidth: 200,
  }
}
