// El recorrido de {Nombre} — por dónde anduvo, en voz de camino.
//
// La familia hoy ve la carta pero no ve el recorrido. Esta sección lo muestra
// SIN un solo número clínico (§principio 5): días que abrió su mundo, lugares
// que conoce, lo que se animó a hacer y su constancia. Nada de aciertos, ni
// niveles, ni "sesiones" — eso es del terapeuta.

import { useMemo, useState } from 'react'
import { Path, Star, Sparkle, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import { PLACE_META } from './placeOfTheDay'
import { getJourneyWeek, type Journey, type JourneyDay } from './journey'
import {
  recorridoTitle, RECORRIDO_SUBTITLE, RECORRIDO_DAYS_LABEL, RECORRIDO_PLACES_LABEL,
  RECORRIDO_HINT, RECORRIDO_MILESTONE_KICKER, recorridoEmpty, recorridoDayLine,
  recorridoDayEmpty, recorridoStreak, recorridoMilestone,
} from './familyHome.copy'

// ── Flecha de navegación entre semanas ───────────────────────────────────────
function FlechaSemana({ dir, disabled, onClick }: {
  dir: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  const Icon = dir === 'prev' ? CaretLeft : CaretRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Semana anterior' : 'Semana siguiente'}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${HT.line}`,
        background: hover && !disabled ? HT.blueTint : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'background 0.16s ease',
      }}
    >
      <Icon size={15} weight="bold" color={disabled ? HT.taupe : HT.ink} />
    </button>
  )
}

// ── Etiqueta de sección ──────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 10px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.11em',
      textTransform: 'uppercase', color: HT.taupe, fontFamily: HT.body,
    }}>
      {children}
    </p>
  )
}

// ── Una piedrita del camino ──────────────────────────────────────────────────
// Día con partida = piedra encendida (amarillo). Sin partida = apagada. La
// semana en curso va resaltada con un aro. Cero números: la forma es el dato.
function Piedra({ day, selected, onSelect }: {
  day: JourneyDay
  selected: boolean
  onSelect: () => void
}) {
  const [hover, setHover] = useState(false)
  const lit = day.played

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Día ${day.dayOfMonth}${lit ? ', jugó' : ', no jugó'}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
        background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer',
        flex: '1 1 0', minWidth: '26px',
      }}
    >
      <span style={{
        fontSize: '10px', fontWeight: 800, fontFamily: HT.body,
        color: day.thisWeek ? HT.ink : HT.taupe, letterSpacing: '0.04em',
      }}>
        {day.label}
      </span>
      <span
        aria-hidden
        style={{
          width: '34px', height: '34px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: lit ? HT.yellow : HT.sand,
          border: selected
            ? `2px solid ${HT.blue}`
            : day.isToday
              ? `2px solid ${HT.ink}`
              : day.thisWeek ? `2px solid ${HT.yellowSoft}` : '2px solid transparent',
          boxSizing: 'border-box',
          boxShadow: lit ? '0 2px 8px rgba(247,195,28,0.45)' : 'none',
          transform: hover || selected ? 'translateY(-2px) scale(1.06)' : 'none',
          transition: 'transform 0.16s ease, box-shadow 0.16s ease',
        }}
      >
        {lit && <Star size={16} weight="fill" color={HT.ink} />}
      </span>
      {/* Con 7 días entra el número: ancla la tira al "Semana del 17 al 23". */}
      <span style={{
        fontSize: '10px', fontWeight: 600, fontFamily: HT.body,
        color: day.isToday ? HT.ink : HT.taupe,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {day.dayOfMonth}
      </span>
    </button>
  )
}

// ── Un sello de lugar ────────────────────────────────────────────────────────
// Visitado = en color, con su paleta real. Pendiente = gris, invita a volver.
function Sello({ id, visited }: { id: keyof typeof PLACE_META; visited: boolean }) {
  const meta = PLACE_META[id]
  return (
    <div
      title={meta.name}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        flex: '1 1 0', minWidth: '58px',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '46px', height: '46px', borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: visited
            ? `linear-gradient(135deg, ${meta.palette.primary}, ${meta.palette.primaryDark})`
            : HT.sand,
          boxShadow: visited ? HT.shadowSoft : 'none',
          opacity: visited ? 1 : 0.55,
          transition: 'opacity 0.2s ease',
        }}
      >
        <meta.Icon size={24} weight="duotone" color={visited ? '#FFFFFF' : HT.taupe} />
      </span>
      <span style={{
        fontSize: '11px', fontWeight: visited ? 700 : 600, fontFamily: HT.body,
        color: visited ? HT.ink : HT.taupe, textAlign: 'center', lineHeight: 1.2,
        textTransform: 'capitalize',
      }}>
        {meta.name}
      </span>
    </div>
  )
}

// ── Sección ──────────────────────────────────────────────────────────────────

export default function ElRecorrido({
  childName, journey, delay = 0,
}: { childName: string; journey: Journey; delay?: number }) {
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  // Semana visible: 0 = la actual, -1 = la anterior. Nunca al futuro.
  const [weekOffset, setWeekOffset] = useState(0)

  // UNA sola fuente de verdad para el día y para el texto. La constancia habla
  // del AHORA, no de la semana que se esté mirando, así que sale siempre de la
  // semana actual — la misma computación que pinta la piedra de hoy cuando
  // estás parado en ella. Así el mensaje no puede contradecir a las piedritas.
  const currentWeek = useMemo(() => getJourneyWeek(journey, 0), [journey])
  const week = useMemo(
    () => (weekOffset === 0 ? currentWeek : getJourneyWeek(journey, weekOffset)),
    [journey, weekOffset, currentWeek],
  )
  const playedToday = currentWeek.days.find(d => d.isToday)?.played ?? false

  const selected = week.days.find(d => d.iso === selectedIso) ?? null
  const placeIds = Object.keys(PLACE_META) as (keyof typeof PLACE_META)[]

  // Al cambiar de semana, el día elegido deja de estar a la vista.
  function goWeek(delta: number) {
    setWeekOffset(o => o + delta)
    setSelectedIso(null)
  }

  const milestone = recorridoMilestone(childName, {
    firstTime: journey.firstTime,
    everyPlaceVisited: journey.everyPlaceVisited,
    newPlaceNames: journey.newPlacesThisWeek.map(id => PLACE_META[id].name),
    streakDays: journey.streakDays,
    daysPlayedThisWeek: journey.daysPlayedThisWeek,
    placesKnown: journey.placesVisited.length,
  })

  return (
    <section className="home-rise" style={{ animationDelay: `${delay}ms` }}>
      <div style={{
        background: HT.white, border: `1px solid ${HT.line}`, borderRadius: HT.radius,
        padding: '24px', boxShadow: HT.shadow,
        display: 'flex', flexDirection: 'column', gap: '22px',
      }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <span aria-hidden style={{
            width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
            background: HT.blueTint, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Path size={20} weight="duotone" color={HT.blue} />
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              margin: 0, fontSize: '19px', fontWeight: 700, color: HT.ink,
              fontFamily: HT.display, lineHeight: 1.2,
            }}>
              {recorridoTitle(childName)}
            </h2>
            <p style={{ margin: '1px 0 0', fontSize: '13px', color: HT.muted, fontFamily: HT.body }}>
              {RECORRIDO_SUBTITLE}
            </p>
          </div>
        </div>

        {journey.firstTime ? (
          // Primera vez: invitación cálida, nunca un vacío roto.
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '11px',
            background: HT.creamCard, border: `1px solid ${HT.line}`,
            borderRadius: HT.radiusSm, padding: '16px',
          }}>
            <Sparkle size={19} weight="fill" color={HT.yellow} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '14.5px', color: HT.ink, fontFamily: HT.body, lineHeight: 1.55 }}>
              {recorridoEmpty(childName)}
            </p>
          </div>
        ) : (
          <>
            {/* ── El camino de la semana ────────────────────────────── */}
            <div>
              <Label>{RECORRIDO_DAYS_LABEL}</Label>

              {/* Encabezado navegable: una semana por vista, lunes → domingo. */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
              }}>
                <FlechaSemana dir="prev" disabled={!week.canGoBack} onClick={() => goWeek(-1)} />
                <p style={{
                  flex: 1, margin: 0, textAlign: 'center', fontSize: '13.5px',
                  fontWeight: 700, color: HT.ink, fontFamily: HT.body,
                }}>
                  {week.label}
                </p>
                <FlechaSemana dir="next" disabled={!week.canGoForward} onClick={() => goWeek(1)} />
              </div>

              <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                {week.days.map(d => (
                  <Piedra
                    key={d.iso}
                    day={d}
                    selected={d.iso === selectedIso}
                    onSelect={() => setSelectedIso(prev => (prev === d.iso ? null : d.iso))}
                  />
                ))}
              </div>
              {/* Al tocar un día, una línea cálida. Sin tocar nada, la pista. */}
              <p style={{
                margin: '12px 0 0', fontSize: '14px', fontFamily: HT.body, lineHeight: 1.5,
                color: selected ? HT.ink : HT.taupe,
                fontWeight: selected ? 600 : 500,
                minHeight: '21px',
              }}>
                {selected
                  ? (selected.played
                      ? recorridoDayLine(childName, selected.places.map(id => PLACE_META[id].name))
                      : recorridoDayEmpty(childName))
                  : RECORRIDO_HINT}
              </p>
            </div>

            {/* ── Constancia, como aliento ──────────────────────────── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: HT.creamCard, border: `1px solid ${HT.line}`,
              borderRadius: HT.radiusSm, padding: '13px 15px',
            }}>
              <Star size={17} weight="fill" color={HT.yellow} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '14.5px', fontWeight: 600, color: HT.ink, fontFamily: HT.body }}>
                {recorridoStreak(childName, journey.streakDays, journey.daysPlayedThisWeek, playedToday)}
              </p>
            </div>

            {/* ── Los lugares que conoce ────────────────────────────── */}
            <div>
              <Label>{RECORRIDO_PLACES_LABEL}</Label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {placeIds.map(id => (
                  <Sello key={id} id={id} visited={journey.placesVisited.includes(id)} />
                ))}
              </div>
            </div>

            {/* ── El hito de la semana ──────────────────────────────── */}
            {milestone && (
              <div style={{
                borderLeft: `3px solid ${HT.yellow}`, background: HT.creamCard,
                borderRadius: `0 ${HT.radiusSm} ${HT.radiusSm} 0`, padding: '13px 16px',
              }}>
                <p style={{
                  margin: '0 0 3px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.11em',
                  textTransform: 'uppercase', color: HT.orange, fontFamily: HT.body,
                }}>
                  {RECORRIDO_MILESTONE_KICKER}
                </p>
                <p style={{ margin: 0, fontSize: '14.5px', color: HT.ink, fontFamily: HT.body, lineHeight: 1.55 }}>
                  {milestone}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
