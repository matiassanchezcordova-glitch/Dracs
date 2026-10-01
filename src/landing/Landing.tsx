import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import JoinForm from './JoinForm'
import HeroDemo from './HeroDemo'
import WeekStrip from './WeekStrip'
import MapExplorer from './MapExplorer'
import DeskTabs from './DeskTabs'
import Cinta from './Cinta'
import { useInView } from './useInView'
import './landing.css'

// Landing pública (/). Se entiende mirando y jugando: poco texto, capturas
// reales, ilustraciones propias y demostraciones que se mueven solas.
// Escrita para la logopeda como lectora principal.
//
// Reglas (Constitución §6): sin datos sin fuente, sin claims clínicos, sin
// comparaciones con otras marcas, sin guiones largos.

const DEMO_THERAPIST = '/demo?como=logopeda'

const MENU = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#escritorio', label: 'Para logopedas' },
  { href: '#familia', label: 'Para familias' },
  { href: '#hoy', label: 'Qué funciona hoy' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#preguntas', label: 'Preguntas' },
]

function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <a className="lp-brand" href="#inicio" aria-label="Dracs, inicio">
      <img src="/landing/dragon.webp" alt="" width={26} height={34} />
      <span style={onDark ? { color: '#fff' } : undefined}>Dracs</span>
    </a>
  )
}

// ── Menú: botón en píldora que abre una tarjeta con los enlaces ──────────
function Menu() {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button className="lp-menu-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        Menú
      </button>
      {open && (
        <div className="lp-menu" role="dialog" aria-modal="true" aria-label="Menú" onClick={() => setOpen(false)}>
          <div className="lp-menu__card" onClick={e => e.stopPropagation()}>
            <button ref={closeRef} className="lp-menu__close" onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <ul>
              {MENU.map(m => (
                <li key={m.href}><a href={m.href} onClick={() => setOpen(false)}>{m.label}</a></li>
              ))}
            </ul>
            <div className="lp-menu__foot">
              <Link className="lp-btn lp-btn--primary" to={DEMO_THERAPIST}>Probar la demo</Link>
              <p className="lp-source">dracs@dracs.health</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Hero: saludo, una línea y la demo jugable ────────────────────────────
function Hero() {
  return (
    <div className="lp-sheet" id="inicio">
      <header className="lp-top">
        <Brand />
        <div className="lp-top__actions">
          <a className="lp-btn lp-btn--primary lp-btn--small lp-hide-sm" href="#sumarme">Quiero sumarme</a>
          <Menu />
        </div>
      </header>
      <section className="lp-hero">
        <h1 className="lp-display">El niño juega.<br />Tú ves cómo le fue.</h1>
        <p className="lp-lead">Juegos de lenguaje y cognición para niños de 3 a 10 años. Cada partida llega a su logopeda.</p>
        <HeroDemo />
      </section>
    </div>
  )
}

// ── Frase grande con píldoras de imagen ──────────────────────────────────
function Statement() {
  return (
    <section className="lp-statement" aria-label="Qué es Dracs">
      <p className="lp-statement__text">
        Dracs{' '}
        <span className="st-pill st-pill--dragon" aria-hidden="true"><img src="/landing/dragon.webp" alt="" width={40} height={52} /></span>{' '}
        convierte lo que el niño juega en casa{' '}
        <span className="st-stack" aria-hidden="true">
          <img src="/landing/ilus/pulpo.webp" alt="" width={80} height={80} />
          <img src="/landing/ilus/caracola.webp" alt="" width={80} height={80} />
          <img src="/landing/ilus/sol.webp" alt="" width={80} height={80} />
        </span>{' '}
        en una carpeta{' '}
        <span className="st-pill st-pill--night" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="44" height="44"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2l2 2h8.8A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </span>{' '}
        que su logopeda lee antes de cada sesión. El criterio sigue siendo tuyo{' '}
        <span className="st-pill st-pill--yellow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40" height="40"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#15191b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </p>
    </section>
  )
}

// ── Filas: medio animado + texto corto ───────────────────────────────────
function Feature({ id, media, mediaClass = '', title, children, link, reverse = false }: {
  id?: string
  media: ReactNode
  mediaClass?: string
  title: ReactNode
  children?: ReactNode
  link?: { to: string; label: string }
  reverse?: boolean
}) {
  return (
    <section className={`lp-feature${reverse ? ' lp-feature--reverse' : ''}`} id={id}>
      <div className={`lp-feature__media ${mediaClass}`}>{media}</div>
      <div className="lp-feature__text">
        <h2 className="lp-h">{title}</h2>
        {children}
        {link && (
          <Link className="lp-link" to={link.to}>
            {link.label}
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5.5L15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        )}
      </div>
    </section>
  )
}

function Features() {
  const figures = [
    { n: '56.724', t: 'niños en los CDIAP de Cataluña en 2025' },
    { n: '31 h', t: 'de atención por niño al año, de media' },
  ]
  return (
    <div className="lp-features lp-wrap" id="como-funciona">
      <Feature
        mediaClass="lp-feature__media--night"
        media={<WeekStrip />}
        title={<>La sesión es un día.<br />La semana tiene siete.</>}
      >
        <p className="lp-p">Dracs llena los otros días con juego, y tú llegas a la sesión sabiendo qué hizo.</p>
        <div className="lp-minifig">
          {figures.map(f => (
            <div key={f.n}>
              <p className="lp-minifig__n">{f.n}</p>
              <p className="lp-minifig__t">{f.t}</p>
            </div>
          ))}
        </div>
        <p className="lp-source">
          Fuente:{' '}
          <a href="https://govern.cat/gov/notes-premsa/870916/drets-socials-i-inclusio-incrementara-un-17-percent-les-hores-d-atencio-precoc-a-infants" target="_blank" rel="noreferrer">
            Drets Socials, 24/09/2026
          </a>
          . Las 31 horas salen de dividir 1.747.364 horas entre 56.724 niños.
        </p>
      </Feature>

      <Feature
        id="nino"
        reverse
        media={<MapExplorer photo="/landing/foto-nino.webp" />}
        title="Para el niño, es un juego."
        link={{ to: '/demo?como=nino', label: 'Jugar como niño' }}
      >
        <p className="lp-p">Cinco lugares en un mapa. Elige uno, una voz le lee cada consigna y las partidas se encadenan solas.</p>
      </Feature>

      <Feature
        id="escritorio"
        mediaClass="lp-feature__media--cream"
        media={<DeskTabs />}
        title="Cada niño, una carpeta."
        link={{ to: DEMO_THERAPIST, label: 'Abrir el escritorio' }}
      >
        <p className="lp-p">Su semana por área, tu plan, tus objetivos y el informe con tu firma. Se lee en dos minutos.</p>
      </Feature>

      <Feature
        id="familia"
        reverse
        mediaClass="lp-feature__media--sun"
        media={(
          <div className="fm">
            <img src="/landing/carta.webp" alt="La carta de la semana que recibe la familia de Pol." width={1440} height={386} loading="lazy" />
            <img src="/landing/hoy.webp" alt="Una cosa para hoy: jugar juntos 5 minutos en el faro." width={1440} height={512} loading="lazy" />
          </div>
        )}
        title="La familia sabe qué hacer hoy."
        link={{ to: '/demo?como=familia', label: 'Ver lo que ve la familia' }}
      >
        <p className="lp-p">Una propuesta al día y una carta a la semana. Sin números clínicos.</p>
      </Feature>
    </div>
  )
}

// ── Tú decides ───────────────────────────────────────────────────────────
function Decide() {
  const does = ['Registra cada partida', 'Ordena lo jugado por día y por área', 'Sugiere juegos según las áreas que elegiste', 'Prepara un borrador de informe que tú reescribes']
  const doesNot = ['Diagnosticar', 'Fijar objetivos', 'Decir si un niño mejoró', 'Enseñar a la familia aciertos o niveles']
  return (
    <section className="lp-section" id="decides">
      <div className="lp-wrap">
        <h2 className="lp-title lp-center">Tú decides.<br />Dracs ordena el dato.</h2>
        <div className="lp-decide">
          <div className="lp-decide__col">
            <p className="lp-decide__head"><span className="lp-dot lp-dot--yes" aria-hidden="true" />Lo que hace Dracs</p>
            <ul>{does.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
          <div className="lp-decide__col">
            <p className="lp-decide__head"><span className="lp-dot lp-dot--no" aria-hidden="true" />Lo que no hace</p>
            <ul>{doesNot.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Funciona hoy: tarjetas reales flotando ───────────────────────────────
function Showcase() {
  const cards = [
    { title: 'Tus pacientes', img: '/landing/app-pacientes.webp', w: 2240, h: 1400, cls: 'sc--wide sc--low' },
    { title: 'Pautas el foco', img: '/landing/plan.webp', w: 1000, h: 944, cls: 'sc--mid' },
    { title: 'Juega en casa', img: '/landing/partida-caracola.webp', w: 760, h: 740, cls: 'sc--high' },
    { title: 'El informe, con tu firma', img: '/landing/informe.webp', w: 1000, h: 1582, cls: 'sc--mid sc--tall' },
    { title: 'La carta de la semana', img: '/landing/carta.webp', w: 1440, h: 386, cls: 'sc--wide sc--low' },
  ]
  return (
    <section className="lp-show" id="hoy">
      <div className="lp-wrap lp-center">
        <h2 className="lp-title lp-center">Funciona hoy.</h2>
        <p className="lp-lead">Todo lo que ves en esta página se puede probar ahora en la demo.</p>
        <Link className="lp-btn lp-btn--dark" to={DEMO_THERAPIST}>Probar la demo</Link>
      </div>
      <div className="sc-row">
        {cards.map(c => (
          <figure key={c.title} className={`sc ${c.cls}`}>
            <figcaption>{c.title}</figcaption>
            <div className="sc__img"><img src={c.img} alt={c.title} width={c.w} height={c.h} loading="lazy" /></div>
          </figure>
        ))}
      </div>
      <p className="lp-wrap lp-center lp-next">
        <strong>En desarrollo:</strong> juegos de escenas, contenido en catalán, reconocimiento de habla y el primer piloto con logopedas.
      </p>
    </section>
  )
}

function Sumarse() {
  const ways = [
    { name: 'Probar y opinar', what: 'Recorres la demo y hablamos.', time: '30 minutos' },
    { name: 'Primer piloto', what: 'Usas Dracs con algunos pacientes y nos cuentas qué falta.', time: 'Unas semanas' },
    { name: 'Equipo', what: 'Lideras el criterio clínico de Dracs como socia o socio fundador.', time: 'Lo hablamos' },
  ]
  return (
    <section className="lp-section lp-section--alt" id="sumarme">
      <div className="lp-wrap lp-join">
        <div>
          <img className="lp-join__photo" src="/landing/foto-escritorio.webp" alt="Una tablet con el escritorio de Dracs sobre una mesa, junto a un cuaderno." width={1024} height={768} loading="lazy" />
          <h2 className="lp-title">Buscamos logopedas para construir Dracs.</h2>
          <p className="lp-p" style={{ marginTop: 16 }}>Tres maneras de sumarte. Puedes elegir más de una.</p>
          <ul className="lp-ways">
            {ways.map(w => (
              <li className="lp-way" key={w.name}>
                <p className="lp-label">{w.name}</p>
                <p className="lp-way__time">{w.time}</p>
                <p className="lp-way__what">{w.what}</p>
              </li>
            ))}
          </ul>
          <p className="lp-source" style={{ marginTop: 20 }}>
            Te respondemos en menos de 48 horas. También puedes escribir a{' '}
            <a href="mailto:dracs@dracs.health">dracs@dracs.health</a>.
          </p>
        </div>
        <JoinForm />
      </div>
    </section>
  )
}

function Equipo() {
  return (
    <section className="lp-section" id="equipo">
      <div className="lp-wrap">
        <h2 className="lp-title lp-center">Quién está detrás.</h2>
        <div className="lp-team">
          <article className="lp-person">
            <span className="lp-person__mono" aria-hidden="true">MS</span>
            <h3 className="lp-sub">Matías Sánchez Cordova</h3>
            <p className="lp-label">Fundador</p>
            <p className="lp-p">Diseña el producto y lo construye con herramientas de IA, desde Barcelona.</p>
          </article>
          <article className="lp-person lp-person--open">
            <span className="lp-person__mono" aria-hidden="true">+</span>
            <h3 className="lp-sub">Perfil clínico</h3>
            <p className="lp-label">Este lugar es para una logopeda</p>
            <p className="lp-p">Buscamos a quien lidere el criterio clínico de Dracs desde el primer día.</p>
            <div><a className="lp-btn lp-btn--ghost lp-btn--small" href="#sumarme">Quiero hablarlo</a></div>
          </article>
        </div>
        <div className="lp-team__notes">
          <div>
            <p className="lp-label">El nombre</p>
            <p className="lp-p">Dracs significa dragones en catalán. Es el nombre que tenía la clase de Benjamín, el hermano de Matías, en su colegio de Barcelona.</p>
          </div>
          <div>
            <p className="lp-label">Reconocimiento</p>
            <p className="lp-p">Primer puesto en la clasificatoria local (EAE Business School) y semifinalista global del Babson Student Challenge 2026.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Preguntas() {
  const faq = [
    { q: '¿Dracs es un producto sanitario?', a: 'No. Es una herramienta de práctica en casa y de seguimiento. No diagnostica ni trata, y no dice si un niño mejoró: eso lo valora el logopeda.' },
    { q: '¿Dónde se guardan los datos de los niños?', a: 'En una base de datos con acceso restringido por cuenta: cada logopeda ve solo a sus pacientes y cada familia solo a su hijo. La familia no ve aciertos ni niveles.' },
    { q: '¿Cuánto cuesta?', a: 'Todavía no tiene precio. Lo estamos definiendo con los primeros logopedas y centros.' },
    { q: '¿En qué dispositivos funciona?', a: 'En tablet, móvil y ordenador, desde el navegador. No hay que instalar nada.' },
    { q: '¿Está en catalán?', a: 'Todavía no. Está en desarrollo.' },
    { q: '¿Para qué niños está pensado?', a: 'Para niños de 3 a 10 años que trabajan lenguaje y cognición con su logopeda. Las áreas van del lenguaje receptivo y expresivo a la atención, la autorregulación y la autonomía.' },
  ]
  return (
    <section className="lp-section lp-section--alt" id="preguntas">
      <div className="lp-wrap">
        <h2 className="lp-title lp-center">Preguntas frecuentes.</h2>
        <div className="lp-faq">
          {faq.map(f => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="lp-p">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="lp-bigfoot">
      <nav aria-label="Pie de página">
        <ul className="lp-bigfoot__links">
          <li><a href="#como-funciona">Cómo funciona</a></li>
          <li><Link to={DEMO_THERAPIST}>Probar la demo</Link></li>
          <li><a href="#sumarme">Quiero sumarme</a></li>
          <li><Link to="/privacidad">Privacidad</Link></li>
          <li><a href="mailto:dracs@dracs.health">Escríbenos</a></li>
        </ul>
      </nav>
      <p className="lp-bigfoot__mark" aria-hidden="true">Dracs</p>
      <div className="lp-bigfoot__legal lp-wrap">
        <p className="lp-source">Hecho en Barcelona · © 2026 Dracs</p>
        <p className="lp-source"><Link to="/login">Iniciar sesión</Link></p>
      </div>
    </footer>
  )
}

// ── Barra fija abajo: aparece al pasar el hero ───────────────────────────
function StickyCta({ heroInView, joinInView }: { heroInView: boolean; joinInView: boolean }) {
  const show = !heroInView && !joinInView
  return (
    <div className={`lp-dock${show ? ' is-on' : ''}`} aria-hidden={!show}>
      <p className="lp-dock__text">¿Eres logopeda?</p>
      <Link className="lp-btn lp-btn--ghost lp-btn--small" to={DEMO_THERAPIST} tabIndex={show ? 0 : -1}>Probar la demo</Link>
      <a className="lp-btn lp-btn--primary lp-btn--small" href="#sumarme" tabIndex={show ? 0 : -1}>Quiero sumarme</a>
    </div>
  )
}

export default function Landing() {
  const [heroRef, heroInView] = useInView<HTMLDivElement>({ threshold: 0.15 })
  const [joinRef, joinInView] = useInView<HTMLDivElement>({ threshold: 0.05 })

  useEffect(() => {
    document.title = 'Dracs · Juegos en casa, seguimiento para el logopeda'
    // Llegada con ancla desde otra ruta (por ejemplo /#sumarme desde /demo).
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <div className="lp">
      <p className="lp-banner">Proyecto en desarrollo en Barcelona · Buscamos logopedas para el primer piloto</p>
      <main>
        <div ref={heroRef}><Hero /></div>
        <Statement />
        <Features />
        <Cinta />
        <Decide />
        <Showcase />
        <div ref={joinRef}>
          <Sumarse />
        </div>
        <Equipo />
        <Preguntas />
      </main>
      <Footer />
      <StickyCta heroInView={heroInView} joinInView={joinInView} />
    </div>
  )
}
