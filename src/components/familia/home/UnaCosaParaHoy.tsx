// Una cosa para hoy — un único CTA, anti-deberes (§2.3). Entrega una cosa
// concreta: si el profesional fijó un énfasis, "el juego de hoy" (guiado, sin
// jerga ni mención al profesional); si no, "el lugar de hoy". La decisión vive
// en getTodaySuggestion. El niño conserva su agencia dentro del lugar.
//
// Es la única tarjeta oscura de la casa, como las secciones en tinta de la web:
// se ve primero porque es lo único que hay que hacer.

import { useMemo } from 'react'
import { Play, GameController } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import { TODAY_KICKER, TODAY_CTA, todayHint, todayGameName, todayGameHint } from './familyHome.copy'
import { getTodaySuggestion, type EmphasisGame } from './todaysGame'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function UnaCosaParaHoy({
  childName, emphasisGames, onOpenPlace, delay = 0,
}: {
  childName: string
  emphasisGames: EmphasisGame[]
  onOpenPlace: (hotspotId: string) => void
  delay?: number
}) {
  const suggestion = useMemo(() => getTodaySuggestion(emphasisGames), [emphasisGames])

  // Vista unificada (juego guiado vs lugar del día).
  const view = suggestion.kind === 'game'
    ? {
        palette: suggestion.palette,
        name: todayGameName(childName),
        hint: todayGameHint(),
        target: suggestion.hotspotId,
        Icon: GameController,
      }
    : {
        palette: suggestion.place.palette,
        name: capitalize(suggestion.place.name),
        hint: todayHint(childName),
        target: suggestion.place.id,
        Icon: suggestion.place.Icon,
      }

  return (
    <section className="home-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="home-card home-today" style={{
        background: HT.night, borderRadius: HT.radius, color: '#FFFFFF',
        boxShadow: HT.shadow,
      }}>
        <p style={{
          margin: '0 0 18px', fontSize: '16px', fontWeight: 400,
          color: 'rgba(255,255,255,0.75)', fontFamily: HT.body,
        }}>
          {TODAY_KICKER}
        </p>

        {/* El lugar, con su color real del mapa. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span aria-hidden style={{
            width: '64px', height: '64px', borderRadius: '16px', flexShrink: 0,
            background: view.palette.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <view.Icon size={32} weight="duotone" color="#FFFFFF" />
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: '40px', fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.01em',
              fontFamily: HT.serif, lineHeight: 1.1,
            }}>
              {view.name}
            </p>
            <p style={{
              margin: '6px 0 0', fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.5, fontFamily: HT.body,
            }}>
              {view.hint}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenPlace(view.target)}
          className="home-cta"
          style={{
            marginTop: '22px', height: '56px', width: '100%',
            border: 'none', borderRadius: '12px', cursor: 'pointer',
            background: HT.yellow, color: HT.ink, fontSize: '18px', fontWeight: 600, fontFamily: HT.body,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}
        >
          <Play size={20} weight="fill" color={HT.ink} />
          {TODAY_CTA}
        </button>
      </div>
    </section>
  )
}
