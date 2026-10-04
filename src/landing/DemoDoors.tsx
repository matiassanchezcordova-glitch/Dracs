import { Link } from 'react-router-dom'

// Las tres vistas de la demo, como tarjetas con su pantalla real (/demo).
//
// Mismo orden y mismos nombres que el selector de vistas de la app:
// Profesional, Familia, Niño.

const DOORS = [
  { id: 'profesional', title: 'Profesional', text: 'Tu agenda, la carpeta de Pol y el informe.', img: '/landing/demo-profesional.webp', start: true },
  { id: 'familia', title: 'Familia', text: 'La carta de la semana y una cosa para hoy.', img: '/landing/demo-familia.webp', start: false },
  { id: 'nino', title: 'Niño', text: 'El mapa y los juegos de Pol.', img: '/landing/demo-nino.webp', start: false },
] as const

export default function DemoDoors() {
  return (
    <ul className="lp-doors">
      {DOORS.map(d => (
        <li key={d.id}>
          <Link className="lp-door" to={`/demo?como=${d.id}`}>
            <span className="lp-door__shot">
              <img src={d.img} alt="" width={800} height={600} loading="lazy" />
              {d.start && <span className="lp-door__tag">Empieza aquí</span>}
            </span>
            <span className="lp-door__text">
              <span className="lp-door__row">
                <span className="lp-sub">{d.title}</span>
                <svg className="lp-door__arrow" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="lp-door__desc">{d.text}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
