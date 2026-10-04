import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import JoinForm from './JoinForm'
import HeroDemo from './HeroDemo'
import WeekStrip from './WeekStrip'
import MapExplorer from './MapExplorer'
import DeskTabs from './DeskTabs'
import Cinta from './Cinta'
import Futuro from './Futuro'
import { useInView } from './useInView'
import './landing.css'

// Landing pública (/). Se entiende mirando y jugando: poco texto, capturas
// reales, ilustraciones propias y demostraciones que se mueven solas.
// Escrita para los profesionales que trabajan con niños como lectores principales.
//
// Reglas (Constitución §6): sin datos sin fuente, sin claims clínicos, sin
// comparaciones con otras marcas, sin guiones largos.

const DEMO_THERAPIST = '/demo?como=profesional'

// Una entrada por sección, con el nombre que la sección lleva en la página.
// "Quiero sumarme" y "Probar la demo" van como botones al pie del menú.
const MENU = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#decides', label: 'Lo que hace Dracs' },
  { href: '#hoy', label: 'Ya funciona hoy' },
  { href: '#futuro', label: 'Hacia dónde vamos' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#preguntas', label: 'Preguntas' },
]

function Brand() {
  return (
    <a className="lp-brand" href="#inicio" aria-label="Dracs, inicio">
      <img src="/landing/dragon.webp" alt="Dracs" width={40} height={52} />
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
              <a className="lp-btn lp-btn--primary" href="#sumarme" onClick={() => setOpen(false)}>Quiero sumarme</a>
              <Link className="lp-btn lp-btn--ghost" to={DEMO_THERAPIST}>Probar la demo</Link>
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
        <h1 className="lp-display">El niño juega.<br />Tú decides.</h1>
        <p className="lp-lead">Juegos de lenguaje y cognición para niños de 3 a 10 años. Cada partida llega al profesional que lo acompaña.</p>
        <div className="lp-hero__actions">
          <Link className="lp-btn lp-btn--dark" to={DEMO_THERAPIST}>Probar la demo</Link>
        </div>
        <HeroDemo />
      </section>
    </div>
  )
}

// ── Frase grande con píldoras de imagen ──────────────────────────────────
// Las tres personas de Dracs, las mismas tres vistas de la demo, en el orden
// de las secciones de abajo.
function Statement() {
  return (
    <section className="lp-statement" aria-label="Qué es Dracs">
      <p className="lp-statement__text">
        Dracs{' '}
        <span className="st-pill st-pill--dragon" aria-hidden="true"><img src="/landing/dragon.webp" alt="" width={40} height={52} /></span>{' '}
        une a tres personas: el niño que{' '}
        <span style={{ whiteSpace: 'nowrap' }}>
          juega{' '}
          <span className="st-stack" aria-hidden="true">
            <img src="/landing/ilus/pulpo.webp" alt="" width={80} height={80} />
            <img src="/landing/ilus/caracola.webp" alt="" width={80} height={80} />
            <img src="/landing/ilus/sol.webp" alt="" width={80} height={80} />
          </span>,
        </span>{' '}
        el profesional que decide{' '}
        <span className="st-pill st-pill--night" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="44" height="44"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2l2 2h8.8A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </span>{' '}
        y la familia que acompaña{' '}
        <span className="st-pill st-pill--yellow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40" height="40"><path d="M4 11.5L12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" fill="none" stroke="#15191b" strokeWidth="2" strokeLinejoin="round" /></svg>
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
        <p className="lp-p">Su semana por área, tu plan y el informe con tu firma.</p>
      </Feature>

      <Feature
        id="familia"
        reverse
        mediaClass="lp-feature__media--sun"
        media={(
          <div className="fm">
            <img src="/landing/carta.webp" alt="La carta de la semana que recibe la familia de Pol." width={1520} height={406} loading="lazy" />
            <img src="/landing/hoy.webp" alt="Una cosa para hoy: jugar juntos 5 minutos en el castillo de arena." width={1520} height={480} loading="lazy" />
          </div>
        )}
        title="La familia sabe qué hacer hoy."
        link={{ to: '/demo?como=familia', label: 'Abrir la casa de la familia' }}
      >
        <p className="lp-p">Una cosa para hoy y la carta de la semana. Sin números clínicos.</p>
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
        <h2 className="lp-title lp-center">Lo que hace Dracs.<br />Y lo que no.</h2>
        <div className="lp-decide">
          <div className="lp-decide__col">
            <p className="lp-decide__head"><span className="lp-dot lp-dot--yes" aria-hidden="true" />Hace</p>
            <ul>{does.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
          <div className="lp-decide__col">
            <p className="lp-decide__head"><span className="lp-dot lp-dot--no" aria-hidden="true" />No hace</p>
            <ul>{doesNot.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Ya funciona hoy: capturas reales de la demo, flotando ────────────────
function Showcase() {
  const cards = [
    { title: 'Tus pacientes', img: '/landing/app-pacientes.webp', w: 2240, h: 1400, cls: 'sc--wide sc--low' },
    { title: 'Pautas el foco', img: '/landing/plan.webp', w: 1344, h: 894, cls: 'sc--mid' },
    { title: 'Juega en casa', img: '/landing/partida-caracola.webp', w: 760, h: 740, cls: 'sc--high' },
    { title: 'El informe, con tu firma', img: '/landing/informe.webp', w: 1344, h: 1672, cls: 'sc--mid sc--tall' },
    { title: 'La carta de la semana', img: '/landing/carta.webp', w: 1520, h: 406, cls: 'sc--wide sc--low' },
  ]
  return (
    <section className="lp-show" id="hoy">
      <div className="lp-wrap lp-center">
        <h2 className="lp-title lp-center">Ya funciona hoy.</h2>
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
    </section>
  )
}

function Sumarse() {
  return (
    <section className="lp-section lp-section--alt" id="sumarme">
      <div className="lp-wrap lp-join">
        <div className="lp-join__left">
          <div className="lp-join__photo">
            <img src="/landing/foto-escritorio.webp" alt="Una tablet sobre una mesa de trabajo, junto a un cuaderno." width={1024} height={768} loading="lazy" />
          </div>
          <h2 className="lp-title">Buscamos profesionales para construir Dracs.</h2>
          <p className="lp-p">Logopedas, psicólogos, terapeutas ocupacionales y equipos de atención temprana. Cuéntanos quién eres y cómo quieres participar.</p>
          <p className="lp-source">
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
            <span className="lp-person__mono" aria-hidden="true">MSC</span>
            <h3 className="lp-sub">Matías Sánchez Cordova</h3>
            <p className="lp-label">Fundador</p>
            <p className="lp-p">Lleva la visión y la estrategia de producto de Dracs, desde Barcelona.</p>
          </article>
          <article className="lp-person lp-person--open">
            <span className="lp-person__mono" aria-hidden="true">+</span>
            <h3 className="lp-sub">Perfil clínico</h3>
            <p className="lp-label">Socia o socio</p>
            <p className="lp-p">Buscamos a quien lidere el criterio clínico de Dracs desde el primer día.</p>
            <div><a className="lp-btn lp-btn--ghost lp-btn--small" href="#sumarme">Quiero hablarlo</a></div>
          </article>
        </div>
        <div className="lp-team__notes">
          <div>
            <p className="lp-label">Por qué Dracs</p>
            <p className="lp-p">Benjamín, el hermano de Matías, tiene síndrome de Down. Su última clase en un colegio de Barcelona se llamaba Dracs: dragones, en catalán.</p>
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
    { q: '¿Dracs es un producto sanitario?', a: 'No. Es una herramienta de práctica en casa y de seguimiento, no un dispositivo médico.' },
    { q: '¿Dónde se guardan los datos de los niños?', a: 'En una base de datos con acceso restringido por cuenta: cada profesional ve solo a sus pacientes y cada familia solo a su hijo.' },
    { q: '¿Qué dispositivos hacen falta?', a: 'En tablet, móvil y ordenador, desde el navegador. No hay que instalar nada.' },
    { q: '¿Está en catalán?', a: 'Todavía no. Está en desarrollo.' },
    { q: '¿Para qué niños está pensado?', a: 'Para niños de 3 a 10 años que trabajan lenguaje y cognición con un profesional: logopedia, psicología, terapia ocupacional o atención temprana. Las áreas van del lenguaje receptivo y expresivo a la atención, la autorregulación y la autonomía.' },
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
          <li><a href="mailto:dracs@dracs.health">Escríbenos</a></li>
          <li><Link to="/privacidad">Privacidad</Link></li>
        </ul>
      </nav>
      <p className="lp-bigfoot__mark" aria-hidden="true">Dracs</p>
      <div className="lp-bigfoot__legal lp-wrap">
        <p className="lp-source">© 2026 Dracs · Barcelona</p>
      </div>
    </footer>
  )
}

// ── Barra fija abajo: aparece al pasar el hero ───────────────────────────
function StickyCta({ heroInView, joinInView }: { heroInView: boolean; joinInView: boolean }) {
  const show = !heroInView && !joinInView
  return (
    <div className={`lp-dock${show ? ' is-on' : ''}`} aria-hidden={!show}>
      <p className="lp-dock__text">¿Trabajas con niños?</p>
      <Link className="lp-btn lp-btn--ghost lp-btn--small" to={DEMO_THERAPIST} tabIndex={show ? 0 : -1}>Probar la demo</Link>
      <a className="lp-btn lp-btn--primary lp-btn--small" href="#sumarme" tabIndex={show ? 0 : -1}>Quiero sumarme</a>
    </div>
  )
}

export default function Landing() {
  const [heroRef, heroInView] = useInView<HTMLDivElement>({ threshold: 0.15 })
  const [joinRef, joinInView] = useInView<HTMLDivElement>({ threshold: 0.05 })

  useEffect(() => {
    document.title = 'Dracs · El niño juega. Tú decides.'
    // Primera carga con ancla (un enlace compartido a /#sumarme). Al llegar
    // desde otra ruta de la web, el ancla la resuelve ScrollManager.
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])

  return (
    <div className="lp">
      <main>
        <div ref={heroRef}><Hero /></div>
        <Statement />
        <Features />
        <Cinta />
        <Decide />
        <Showcase />
        <Futuro />
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
