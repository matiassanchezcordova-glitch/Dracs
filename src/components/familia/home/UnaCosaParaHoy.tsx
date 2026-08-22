// Una cosa para hoy — un único CTA cálido, anti-deberes (§2.3). Entrega una cosa
// concreta: si el terapeuta fijó un énfasis, "el juego de hoy" (guiado, sin
// jerga ni mención al terapeuta); si no, "el lugar de hoy". La decisión vive en
// getTodaySuggestion. El niño conserva su agencia dentro del lugar.

import { useMemo, useState } from 'react'
import { Play, Sparkle, GameController } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import {
  TODAY_KICKER, TODAY_PLACE_KICKER, TODAY_GAME_KICKER, TODAY_CTA,
  todayHint, todayGameName, todayGameHint,
} from './familyHome.copy'
import { getTodaySuggestion, type EmphasisGame } from './todaysGame'

export default function UnaCosaParaHoy({
  childName, emphasisGames, onOpenPlace, delay = 0,
}: {
  childName: string
  emphasisGames: EmphasisGame[]
  onOpenPlace: (hotspotId: string) => void
  delay?: number
}) {
  const [pressed, setPressed] = useState(false)
  const suggestion = useMemo(() => getTodaySuggestion(emphasisGames), [emphasisGames])

  // Vista unificada (juego guiado vs lugar del día).
  const view = suggestion.kind === 'game'
    ? {
        palette: suggestion.palette,
        kicker: TODAY_GAME_KICKER,
        name: todayGameName(childName),
        capitalize: false,
        hint: todayGameHint(childName),
        target: suggestion.hotspotId,
        Icon: GameController,
      }
    : {
        palette: suggestion.place.palette,
        kicker: TODAY_PLACE_KICKER,
        name: suggestion.place.name,
        capitalize: true,
        hint: todayHint(childName, suggestion.place.name),
        target: suggestion.place.id,
        Icon: suggestion.place.Icon,
      }

  return (
    <section className="home-rise" style={{ animationDelay: `${delay}ms` }}>
      <div style={{
        background: HT.white, border: `1px solid ${HT.line}`, borderRadius: HT.radius,
        padding: '24px', boxShadow: HT.shadow,
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <p style={{
          margin: 0, fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: HT.orange, fontFamily: HT.body,
        }}>
          {TODAY_KICKER}
        </p>

        {/* Tile — usa la paleta real del lugar (o del lugar del juego guiado). */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span aria-hidden style={{
            width: '58px', height: '58px', borderRadius: '16px', flexShrink: 0,
            background: `linear-gradient(135deg, ${view.palette.primary}, ${view.palette.primaryDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: HT.shadowSoft,
          }}>
            <view.Icon size={30} weight="duotone" color="#FFFFFF" />
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: '0 0 2px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: HT.taupe, fontFamily: HT.body,
            }}>
              {view.kicker}
            </p>
            <p style={{
              margin: 0, fontSize: '20px', fontWeight: 700, color: HT.ink,
              fontFamily: HT.display, textTransform: view.capitalize ? 'capitalize' : 'none', lineHeight: 1.15,
            }}>
              {view.name}
            </p>
          </div>
        </div>

        <p style={{
          margin: 0, fontSize: '15px', fontWeight: 600, color: HT.muted,
          lineHeight: 1.5, fontFamily: HT.body,
        }}>
          {view.hint}
        </p>

        <button
          onClick={() => onOpenPlace(view.target)}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          className="cta-glow"
          style={{
            position: 'relative', overflow: 'hidden',
            height: '60px', width: '100%', minHeight: '44px',
            border: 'none', borderRadius: HT.radiusSm, cursor: 'pointer',
            background: `linear-gradient(135deg, ${HT.yellow} 0%, #FFB020 100%)`,
            color: HT.ink, fontSize: '19px', fontWeight: 700, fontFamily: HT.display,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transform: pressed ? 'scale(0.98)' : 'scale(1)',
            transition: 'transform 0.12s ease',
          }}
        >
          <Play size={22} weight="fill" color={HT.ink} />
          {TODAY_CTA}
          {/* Chispita que titila sobre el botón (pixie dust). */}
          <Sparkle
            className="home-sparkle" aria-hidden weight="fill" size={14} color="#FFFFFF"
            style={{
              position: 'absolute', top: '10px', right: '18px',
              animation: 'sparkleTwinkle 2.4s ease-in-out 0.4s infinite',
            }}
          />
        </button>
      </div>
    </section>
  )
}
