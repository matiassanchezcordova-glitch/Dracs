import { useInView } from './useInView'

// Una semana de ejemplo: un día de consulta y, el resto, partidas en casa.
// Al entrar en pantalla, las partidas aparecen una a una.

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const SESSION_DAY = 2
const PLAY_DAYS = [0, 1, 3, 4, 5]

export default function WeekStrip() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: true, threshold: 0.4 })
  let order = 0
  return (
    <div className={`wk${inView ? ' is-in' : ''}`} ref={ref} role="img"
      aria-label="Semana de ejemplo: sesión con el profesional el miércoles y partidas en casa lunes, martes, jueves, viernes y sábado.">
      <div className="wk-grid" aria-hidden="true">
        <span className="wk-rowlabel" />
        {DAYS.map(d => <span key={d} className="wk-day">{d}</span>)}

        <span className="wk-rowlabel">En consulta</span>
        {DAYS.map((d, i) => (
          <span key={d} className="wk-cell">
            {i === SESSION_DAY && <span className="wk-session">Sesión</span>}
          </span>
        ))}

        <span className="wk-rowlabel">En casa, con Dracs</span>
        {DAYS.map((d, i) => {
          const plays = PLAY_DAYS.includes(i)
          const delay = plays ? (order++) * 140 : 0
          return (
            <span key={d} className="wk-cell">
              {plays && (
                <span className="wk-play" style={{ transitionDelay: `${delay}ms` }}>
                  <img src="/landing/dragon.webp" alt="" width={20} height={26} />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <p className="wk-note">Semana de ejemplo</p>
    </div>
  )
}
