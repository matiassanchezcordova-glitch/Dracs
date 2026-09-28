import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import JoinForm from './JoinForm'
import './landing.css'

// Landing pública (/). Escrita para la logopeda como lectora principal: cada
// sección responde una pregunta suya, en el orden en que se la hace.
//
// Reglas que se respetan acá (Constitución §6): sin datos sin fuente, sin
// claims clínicos, sin comparaciones con otras marcas, sin guiones largos.
// Todas las imágenes son capturas reales del producto o ilustraciones propias.

const DEMO_THERAPIST = '/demo?como=logopeda'

const NAV = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#escritorio', label: 'Para logopedas' },
  { href: '#familia', label: 'Para familias' },
  { href: '#equipo', label: 'Equipo' },
]

function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <a className="lp-brand" href="#inicio" aria-label="Dracs, inicio">
      <img src="/landing/dragon.webp" alt="" width={26} height={34} />
      <span style={onDark ? { color: '#fff' } : undefined}>Dracs</span>
    </a>
  )
}

function Nav() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [open])

  return (
    <header className="lp-nav">
      <div className="lp-wrap">
        <div className="lp-nav__row">
          <Brand />
          <nav aria-label="Secciones">
            <ul className="lp-nav__links">
              {NAV.map(n => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}
            </ul>
          </nav>
          <div className="lp-nav__cta">
            <Link className="lp-btn lp-btn--ghost lp-btn--small" to={DEMO_THERAPIST}>Probar la demo</Link>
            <a className="lp-btn lp-btn--primary lp-btn--small" href="#sumarme">Quiero sumarme</a>
          </div>
          <button
            className="lp-nav__toggle"
            aria-expanded={open}
            aria-controls="lp-nav-panel"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen(o => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {open
                ? <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                : <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
        <div className="lp-nav__panel" id="lp-nav-panel" data-open={open}>
          <ul>
            {NAV.map(n => <li key={n.href}><a href={n.href} onClick={() => setOpen(false)}>{n.label}</a></li>)}
            <li><Link to={DEMO_THERAPIST}>Probar la demo</Link></li>
          </ul>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="lp-hero" id="inicio">
      <div className="lp-wrap lp-hero__grid">
        <div className="lp-hero__text">
          <h1 className="lp-title lp-title--hero">El niño juega en casa. Tú ves cómo le fue.</h1>
          <p className="lp-body">
            Dracs es un mundo de juegos de lenguaje y cognición para niños de 3 a 10 años.
            Cada partida llega a su logopeda ordenada por día y por área, lista para preparar la sesión siguiente.
          </p>
          <div className="lp-actions">
            <a className="lp-btn lp-btn--primary" href="#sumarme">Quiero sumarme</a>
            <Link className="lp-btn lp-btn--ghost" to={DEMO_THERAPIST}>Probar la demo</Link>
          </div>
          <p className="lp-hero__note">
            <strong>En desarrollo en Barcelona.</strong> Buscamos logopedas para el primer piloto.
          </p>
        </div>
        <div className="lp-devices" aria-label="Capturas reales de Dracs">
          <div className="lp-laptop">
            <div className="lp-laptop__screen">
              <img
                src="/landing/app-pacientes.webp"
                alt="Escritorio del logopeda en Dracs: una tarjeta por paciente con cuántas veces jugó esta semana."
                width={2240} height={1400} fetchPriority="high"
              />
            </div>
          </div>
          <div className="lp-tablet">
            <div className="lp-tablet__screen">
              <img
                src="/landing/mapa.webp"
                alt="El mapa del niño: el mar, la casa, la playa, el sol y el faro."
                width={916} height={688}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EntreSesiones() {
  const figures = [
    { n: '56.724', t: 'niños atendidos en los CDIAP de Cataluña en 2025' },
    { n: '105', t: 'CDIAP en la red pública catalana' },
    { n: '31 h', t: 'de atención por niño en todo el año, de media' },
  ]
  return (
    <section className="lp-section lp-section--alt" id="entre-sesiones">
      <div className="lp-wrap">
        <div className="lp-split">
          <h2 className="lp-title">Casi toda la semana pasa fuera de la consulta.</h2>
          <div>
            <p className="lp-body">
              Lo que se trabaja en sesión necesita práctica en casa. La familia quiere ayudar y no siempre sabe cómo.
              Y el logopeda no sabe qué pasó hasta que vuelve a ver al niño.
            </p>
            <p className="lp-body">
              Dracs cubre ese tiempo: el niño juega unos minutos al día y tú llegas a la sesión sabiendo qué hizo.
            </p>
          </div>
        </div>
        <div className="lp-figures">
          {figures.map(f => (
            <div className="lp-figure" key={f.n}>
              <p className="lp-figure__n">{f.n}</p>
              <p className="lp-figure__t">{f.t}</p>
            </div>
          ))}
        </div>
        <p className="lp-source">
          Fuente:{' '}
          <a href="https://govern.cat/gov/notes-premsa/870916/drets-socials-i-inclusio-incrementara-un-17-percent-les-hores-d-atencio-precoc-a-infants" target="_blank" rel="noreferrer">
            Departament de Drets Socials i Inclusió, 24 de septiembre de 2026
          </a>
          . Las 31 horas salen de dividir las 1.747.364 horas de atención de 2025 entre los 56.724 niños.
        </p>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const steps = [
    {
      who: 'Tú',
      title: 'Pautas el foco.',
      text: 'En la carpeta de cada niño eliges las áreas a trabajar y fijas los juegos de la semana.',
      img: '/landing/plan.webp', w: 1000, h: 944,
      alt: 'Plan de Pol: áreas de foco marcadas y una nota del logopeda.',
    },
    {
      who: 'El niño',
      title: 'Juega en casa.',
      text: 'Desde tablet, móvil u ordenador. Elige un lugar del mapa y las partidas se encadenan con voz.',
      img: '/landing/partida-caracola.webp', w: 760, h: 740,
      alt: 'Una partida: ¿Dónde está la caracola?, con tres ilustraciones para elegir.',
    },
    {
      who: 'Tú',
      title: 'Lees y decides.',
      text: 'Ves qué jugó cada día y cómo le fue por área. Escribes tu nota para la familia y exportas el informe con tu firma.',
      img: '/landing/informe.webp', w: 1000, h: 1582,
      alt: 'Informe de seguimiento de Pol, con el comentario del logopeda.',
    },
  ]
  return (
    <section className="lp-section" id="como-funciona">
      <div className="lp-wrap">
        <div className="lp-head">
          <h2 className="lp-title">Tres pasos. El primero y el último son tuyos.</h2>
        </div>
        <ol className="lp-steps">
          {steps.map((s, i) => (
            <li className="lp-step" key={s.title}>
              <p className="lp-step__n" aria-hidden="true">{i + 1}</p>
              <p className="lp-step__who">{s.who}</p>
              <h3 className="lp-sub">{s.title}</h3>
              <p className="lp-body">{s.text}</p>
              <figure className="lp-shot">
                <img src={s.img} alt={s.alt} width={s.w} height={s.h} loading="lazy" />
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function MundoNino() {
  const mechanics: { name: string; imgs?: string[]; phrase?: string }[] = [
    { name: 'Encontrar la imagen', imgs: ['caracola', 'coral', 'pulpo'] },
    { name: 'Ordenar los pasos', imgs: ['cepillo-1', 'cepillo-2', 'cepillo-3'] },
    { name: 'Completar la frase', phrase: 'El delfín ___ en el agua' },
    { name: 'Encontrar el distinto', imgs: ['pez', 'manzana', 'cangrejo'] },
  ]
  const strip = ['pulpo', 'castillo', 'delfin', 'sol', 'cangrejo', 'tortuga', 'gallina', 'pato']
  return (
    <section className="lp-section lp-section--alt" id="nino">
      <div className="lp-wrap">
        <div className="lp-world">
          <figure className="lp-world__map" style={{ margin: 0 }}>
            <img
              src="/landing/mapa.webp"
              alt="El mapa de Dracs, con el mar, la casa, la playa, el sol y el faro iluminados."
              width={916} height={688} loading="lazy"
            />
          </figure>
          <div>
            <div className="lp-head" style={{ marginBottom: 0 }}>
              <h2 className="lp-title">Para el niño, es un juego.</h2>
              <p className="lp-body">
                Un mapa con cinco lugares: el mar, la casa, la playa, el sol y el faro. Toca uno y empieza a jugar.
                Una voz le lee cada consigna, las partidas se encadenan solas y en ningún momento ve la palabra ejercicio.
              </p>
            </div>
            <ul className="lp-mechanics" aria-label="Mecánicas de juego">
              {mechanics.map(m => (
                <li className="lp-mechanic" key={m.name}>
                  <p className="lp-label">{m.name}</p>
                  {m.imgs ? (
                    <div className="lp-mechanic__imgs" aria-hidden="true">
                      {m.imgs.map(src => <img key={src} src={`/landing/ilus/${src}.webp`} alt="" width={44} height={44} loading="lazy" />)}
                    </div>
                  ) : (
                    <p className="lp-mechanic__phrase" aria-hidden="true">{m.phrase}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lp-strip" aria-label="Algunas de las 99 ilustraciones propias de Dracs">
          {strip.map(s => <img key={s} src={`/landing/ilus/${s}.webp`} alt="" width={320} height={320} loading="lazy" />)}
        </div>
      </div>
    </section>
  )
}

function Escritorio() {
  const modules = [
    { name: 'Agenda', text: 'Qué paciente tienes cada día de la semana.' },
    { name: 'Resumen', text: 'La semana del niño, día a día y por área.' },
    { name: 'Plan', text: 'Las áreas de foco, tu nota de contexto, los juegos fijados y el rango de nivel.' },
    { name: 'Objetivos', text: 'Escribes el objetivo con tus palabras. Dracs pone el dato y tú marcas si se cumplió.' },
    { name: 'Notas', text: 'Tus notas privadas, con fecha.' },
    { name: 'Informe', text: 'El período contado para la familia o para el colegio, revisado y firmado por ti.' },
  ]
  return (
    <section className="lp-section lp-section--night" id="escritorio">
      <div className="lp-wrap">
        <div className="lp-head">
          <h2 className="lp-title">Cada niño, una carpeta.</h2>
          <p className="lp-body">Todo lo que jugó, ordenado para que lo leas en dos minutos antes de la sesión.</p>
        </div>
        <div className="lp-desk">
          <ul className="lp-modules">
            {modules.map(m => (
              <li className="lp-module" key={m.name}>
                <p className="lp-label">{m.name}</p>
                <p>{m.text}</p>
              </li>
            ))}
          </ul>
          <div>
            <figure className="lp-desk__shot" style={{ margin: 0 }}>
              <img
                src="/landing/resumen-areas.webp"
                alt="Resumen de la semana de Pol: minutos jugados, aciertos, partidas por día y reparto por área."
                width={1440} height={1806} loading="lazy"
              />
            </figure>
          </div>
        </div>
        <div className="lp-actions" style={{ marginTop: 48 }}>
          <Link className="lp-btn lp-btn--primary" to={DEMO_THERAPIST}>Abrir el escritorio de la demo</Link>
        </div>
      </div>
    </section>
  )
}

function Decide() {
  const does = [
    'Registra cada partida',
    'Ordena lo jugado por día y por área',
    'Sugiere juegos según las áreas que elegiste',
    'Prepara un borrador de informe que tú reescribes',
  ]
  const doesNot = [
    'Diagnosticar',
    'Fijar objetivos',
    'Decir si un niño mejoró',
    'Enseñar a la familia aciertos o niveles',
  ]
  return (
    <section className="lp-section" id="decides">
      <div className="lp-wrap">
        <div className="lp-head">
          <h2 className="lp-title">Tú decides. Dracs ordena el dato.</h2>
          <p className="lp-body">Dracs no es un producto sanitario. Es una herramienta de práctica en casa y de seguimiento, y el criterio clínico es siempre tuyo.</p>
        </div>
        <div className="lp-two">
          <div className="lp-col">
            <h3 className="lp-sub">Lo que hace Dracs</h3>
            <ul className="lp-list">{does.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
          <div className="lp-col lp-col--muted">
            <h3 className="lp-sub">Lo que Dracs no hace</h3>
            <ul className="lp-list">{doesNot.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Familia() {
  return (
    <section className="lp-section lp-section--alt" id="familia">
      <div className="lp-wrap lp-family">
        <div className="lp-head" style={{ marginBottom: 0 }}>
          <h2 className="lp-title">La familia sabe qué hacer hoy.</h2>
          <p className="lp-body">
            Cada día recibe una sola propuesta: el juego que fijaste o el lugar del día.
            Cada semana, una carta que cuenta el recorrido del niño sin números clínicos, y tu comentario cuando lo publicas.
          </p>
        </div>
        <div className="lp-family__shots">
          <img src="/landing/carta.webp" alt="La carta de la semana que recibe la familia de Pol." width={1440} height={386} loading="lazy" />
          <img src="/landing/hoy.webp" alt="Una cosa para hoy: jugar juntos 5 minutos en el faro." width={1440} height={512} loading="lazy" />
        </div>
      </div>
    </section>
  )
}

function Estado() {
  // [confirmar] Cifras de la Constitución a julio de 2026: 55 juegos, 36 activos.
  const today = [
    'Demo pública, sin registro',
    'Mapa con 5 lugares y 36 juegos con voz',
    'Escritorio del logopeda con carpeta, plan, objetivos e informe',
    'Casa de la familia con carta semanal',
  ]
  const next = [
    'Juegos de escenas, una segunda mecánica',
    'Contenido en catalán',
    'Reconocimiento de habla',
    'Primer piloto con logopedas',
  ]
  return (
    <section className="lp-section" id="estado">
      <div className="lp-wrap">
        <div className="lp-head">
          <h2 className="lp-title">En qué punto estamos.</h2>
          <p className="lp-body">Lo que se muestra en esta página existe y se puede probar hoy en la demo.</p>
        </div>
        <div className="lp-two">
          <div className="lp-col">
            <h3 className="lp-sub">Funciona hoy</h3>
            <ul className="lp-list">{today.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
          <div className="lp-col lp-col--muted">
            <h3 className="lp-sub">En desarrollo</h3>
            <ul className="lp-list">{next.map(d => <li key={d}>{d}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Sumarse() {
  const ways = [
    { name: 'Probar y opinar', what: 'Recorres la demo y hablamos.', time: '30 minutos' },
    { name: 'Primer piloto', what: 'Usas Dracs con algunos de tus pacientes y nos cuentas qué falta.', time: 'Unas semanas' },
    { name: 'Equipo', what: 'Lideras el criterio clínico de Dracs como socia o socio fundador.', time: 'Lo hablamos' },
  ]
  return (
    <section className="lp-section lp-section--alt" id="sumarme">
      <div className="lp-wrap lp-join">
        <div>
          <div className="lp-head" style={{ marginBottom: 0 }}>
            <h2 className="lp-title">Buscamos logopedas para construir Dracs.</h2>
            <p className="lp-body">
              Dracs lo van a usar logopedas y tiene que estar hecho con ellos.
              Hay tres maneras de sumarte, y puedes elegir más de una.
            </p>
          </div>
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
        <div className="lp-head">
          <h2 className="lp-title">Quién está detrás.</h2>
        </div>
        <div className="lp-team">
          <article className="lp-person">
            <span className="lp-person__mono" aria-hidden="true">MS</span>
            <h3 className="lp-sub">Matías Sánchez Cordova</h3>
            <p className="lp-label">Fundador</p>
            <p className="lp-body">Diseña el producto y lo construye con herramientas de IA, desde Barcelona.</p>
          </article>
          <article className="lp-person lp-person--open">
            <span className="lp-person__mono" aria-hidden="true">+</span>
            <h3 className="lp-sub">Perfil clínico</h3>
            <p className="lp-label">Este lugar es para una logopeda</p>
            <p className="lp-body">Buscamos a quien lidere el criterio clínico de Dracs desde el primer día.</p>
            <div><a className="lp-btn lp-btn--ghost lp-btn--small" href="#sumarme">Quiero hablarlo</a></div>
          </article>
        </div>
        <div className="lp-team__notes">
          <div>
            <p className="lp-label">El nombre</p>
            <p className="lp-body">Dracs significa dragones en catalán. Es el nombre que tenía la clase de Benjamín, el hermano de Matías, en su colegio de Barcelona.</p>
          </div>
          <div>
            <p className="lp-label">Reconocimiento</p>
            <p className="lp-body">Primer puesto en la clasificatoria local (EAE Business School) y semifinalista global del Babson Student Challenge 2026.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Preguntas() {
  const faq = [
    {
      q: '¿Dracs es un producto sanitario?',
      a: 'No. Es una herramienta de práctica en casa y de seguimiento. No diagnostica ni trata, y no dice si un niño mejoró: eso lo valora el logopeda.',
    },
    {
      q: '¿Dónde se guardan los datos de los niños?',
      a: 'En una base de datos con acceso restringido por cuenta: cada logopeda ve solo a sus pacientes y cada familia solo a su hijo. La familia no ve aciertos ni niveles.',
    },
    {
      q: '¿Cuánto cuesta?',
      a: 'Todavía no tiene precio. Lo estamos definiendo con los primeros logopedas y centros.',
    },
    {
      q: '¿En qué dispositivos funciona?',
      a: 'En tablet, móvil y ordenador, desde el navegador. No hay que instalar nada.',
    },
    {
      q: '¿Está en catalán?',
      a: 'Todavía no. Está en desarrollo.',
    },
    {
      q: '¿Para qué niños está pensado?',
      a: 'Para niños de 3 a 10 años que trabajan lenguaje y cognición con su logopeda. Las áreas van del lenguaje receptivo y expresivo a la atención, la autorregulación y la autonomía.',
    },
  ]
  return (
    <section className="lp-section lp-section--alt" id="preguntas">
      <div className="lp-wrap">
        <div className="lp-head">
          <h2 className="lp-title">Preguntas frecuentes.</h2>
        </div>
        <div className="lp-faq">
          {faq.map(f => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="lp-body">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer__row">
          <Brand onDark />
          <ul className="lp-footer__links">
            <li><a href="mailto:dracs@dracs.health">dracs@dracs.health</a></li>
            <li><Link to={DEMO_THERAPIST}>Demo</Link></li>
            <li><Link to="/privacidad">Privacidad</Link></li>
            <li><Link to="/login">Iniciar sesión</Link></li>
          </ul>
        </div>
        <div className="lp-footer__legal">
          <p className="lp-source">Hecho en Barcelona.</p>
          <p className="lp-source">© 2026 Dracs</p>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  useEffect(() => {
    document.title = 'Dracs · Juegos en casa, seguimiento para el logopeda'
    // Llegada con ancla desde otra ruta (por ejemplo /#sumarme desde /demo).
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])
  return (
    <div className="lp">
      <Nav />
      <main>
        <Hero />
        <EntreSesiones />
        <ComoFunciona />
        <MundoNino />
        <Escritorio />
        <Decide />
        <Familia />
        <Estado />
        <Sumarse />
        <Equipo />
        <Preguntas />
      </main>
      <Footer />
    </div>
  )
}
