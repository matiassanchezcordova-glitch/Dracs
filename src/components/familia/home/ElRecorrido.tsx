// El recorrido de {Nombre} — por dónde anduvo, en voz de camino.
//
// La familia hoy ve la carta pero no ve el recorrido. Esta sección lo muestra
// SIN un solo número clínico (§principio 5): días que abrió su mundo, lugares
// que conoce, lo que se animó a hacer y su constancia. Nada de aciertos, ni
// niveles, ni "sesiones" — eso es del terapeuta.

import { useMemo, useState } from 'react'
import { Star, Sparkle, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { HT } from './homeStyles'
import { PLACE_META } from './placeOfTheDay'
import { getJourneyWeek, type Journey, type JourneyDay } from './journey'
import {
  recorridoTitle, RECORRIDO_DAYS_LABEL, RECORRIDO_PLACES_LABEL,
  RECORRIDO_HINT, recorridoEmpty, recorridoDayLine,
  recorridoDayEmpty, recorridoStreak,
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
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${hover && !disabled ? HT.ink : '#C9CBC6'}`,
        background: HT.white,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'background 0.16s ease',
      }}
    >
      <Icon size={16} weight="regular" color={disabled ? HT.taupe : HT.ink} />
    </button>
  )
}

// ── Etiqueta de sección ──────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: HT.ink, fontFamily: HT.body,
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
        fontSize: '14px', fontWeight: 400, fontFamily: HT.body,
        color: day.thisWeek ? HT.ink : HT.taupe,
      }}>
        {day.label}
      </span>
      <span
        aria-hidden
        style={{
          width: '38px', height: '38px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: lit ? HT.yellow : HT.sand,
          border: selected
            ? `2px solid ${HT.night}`
            : day.isToday
              ? `2px solid ${HT.blue}`
              : '2px solid transparent',
          boxSizing: 'border-box',
          transform: hover || selected ? 'translateY(-2px) scale(1.06)' : 'none',
          transition: 'transform 0.16s ease, box-shadow 0.16s ease',
        }}
      >
        {lit && <Star size={16} weight="fill" color={HT.ink} />}
      </span>
      {/* Con 7 días entra el número: ancla la tira al "Semana del 17 al 23". */}
      <span style={{
        fontSize: '14px', fontWeight: day.isToday ? 600 : 400, fontFamily: HT.body,
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
          width: '52px', height: '52px', borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: visited ? meta.palette.primary : HT.sand,
          opacity: visited ? 1 : 0.6,
          transition: 'opacity 0.2s ease',
        }}
      >
        <meta.Icon size={26} weight="duotone" color={visited ? '#FFFFFF' : HT.taupe} />
      </span>
      <span style={{
        fontSize: '14px', fontWeight: visited ? 600 : 400, fontFamily: HT.body,
        color: visited ? HT.ink : HT.taupe, textAlign: 'center', lineHeight: 1.25,
      }}>
        {meta.name.charAt(0).toUpperCase() + meta.name.slice(1)}
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

  return (
    <section className="home-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="home-card" style={{
        background: HT.white, border: `1px solid ${HT.line}`, borderRadius: HT.radius,
        boxShadow: HT.shadow,
        display: 'flex', flexDirection: 'column', gap: '26px',
      }}>
        {/* Encabezado: título en serif y, debajo, la constancia dicha en cálido. */}
        <div>
          <h2 style={{
            margin: 0, fontSize: '24px', fontWeight: 500, color: HT.ink, letterSpacing: '-0.01em',
            fontFamily: HT.serif, lineHeight: 1.15,
          }}>
            {recorridoTitle(childName)}
          </h2>
          {!journey.firstTime && (
            <p style={{ margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: HT.muted, fontFamily: HT.body }}>
              <Star size={16} weight="fill" color={HT.yellow} style={{ flexShrink: 0 }} />
              {recorridoStreak(childName, journey.streakDays, journey.daysPlayedThisWeek, playedToday)}
            </p>
          )}
        </div>

        {journey.firstTime ? (
          // Primera vez: invitación cálida, nunca un vacío roto.
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '11px',
            background: HT.creamCard,
            borderRadius: HT.radiusSm, padding: '16px',
          }}>
            <Sparkle size={19} weight="fill" color={HT.yellow} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '16px', color: HT.ink, fontFamily: HT.body, lineHeight: 1.55 }}>
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
                  flex: 1, margin: 0, textAlign: 'center', fontSize: '16px',
                  fontWeight: 400, color: HT.ink, fontFamily: HT.body,
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
                margin: '14px 0 0', fontSize: '16px', fontFamily: HT.body, lineHeight: 1.5,
                color: selected ? HT.ink : HT.muted,
                fontWeight: selected ? 500 : 400,
                minHeight: '21px',
              }}>
                {selected
                  ? (selected.played
                      ? recorridoDayLine(childName, selected.places.map(id => PLACE_META[id].name))
                      : recorridoDayEmpty(childName))
                  : RECORRIDO_HINT}
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

          </>
        )}
      </div>
    </section>
  )
}
