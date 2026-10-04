import { useInView } from './useInView'

// Hacia dónde vamos. Cuatro cosas que todavía no existen y que queremos
// construir, cada una con una demostración animada. La etiqueta "En desarrollo"
// lo dice. Sin promesas de resultados: se describe qué hará.

function Pedir() {
  return (
    <div className="fu-ui fu-chat" aria-hidden="true">
      <p className="fu-msg fu-msg--me">En la sesión le costó ordenar pasos de tres en tres. Prepárale juegos para esta semana.</p>
      <div className="fu-msg fu-msg--dracs">
        <span className="fu-typing"><i /><i /><i /></span>
        <div className="fu-reply">
          <p>Te propongo 3 juegos de ordenar, de fácil a difícil:</p>
          <div className="fu-games">
            <img src="/landing/ilus/cepillo-1.webp" alt="" width={60} height={60} />
            <img src="/landing/ilus/cubo-vacio.webp" alt="" width={60} height={60} />
            <img src="/landing/ilus/castillo.webp" alt="" width={60} height={60} />
          </div>
          <p className="fu-small">Tú los revisas y decides cuáles se quedan.</p>
        </div>
      </div>
    </div>
  )
}

function Dibujo() {
  return (
    <div className="fu-ui fu-draw" aria-hidden="true">
      <p className="fu-ask">Dibuja un barco</p>
      <svg viewBox="0 0 200 130" className="fu-canvas">
        <path className="fu-stroke fu-s1" d="M30 88 L170 88 L150 112 L52 112 Z" />
        <path className="fu-stroke fu-s2" d="M100 88 L100 20" />
        <path className="fu-stroke fu-s3" d="M100 24 L140 80 L100 80" />
        <path className="fu-stroke fu-s4" d="M96 30 L64 80 L96 80" />
        <path className="fu-stroke fu-s5" d="M14 122 Q40 112 66 122 T118 122 T170 122 T196 122" />
      </svg>
      <p className="fu-verdict">Dracs ve: <strong>un barco con dos velas</strong> · lo revisas tú</p>
    </div>
  )
}

function Voz() {
  return (
    <div className="fu-ui fu-voice" aria-hidden="true">
      <p className="fu-ask">El delfín ___ en el agua</p>
      <div className="fu-wave">{Array.from({ length: 22 }, (_, i) => <span key={i} style={{ animationDelay: `${(i % 7) * 90}ms` }} />)}</div>
      <p className="fu-verdict">Dijo: <strong>«nada»</strong> · grabación guardada para que la escuches</p>
    </div>
  )
}

function Mundo() {
  return (
    <div className="fu-ui fu-world" aria-hidden="true">
      <div className="fu-photos">
        <img src="/landing/cinta/09.webp" alt="" width={200} height={200} />
        <img src="/landing/cinta/21.webp" alt="" width={200} height={200} />
        <img src="/landing/cinta/16.webp" alt="" width={200} height={200} />
      </div>
      <p className="fu-ask">¿Dónde está tu perro?</p>
      <p className="fu-small">Fotos que sube la familia, convertidas en juegos.</p>
    </div>
  )
}

const ITEMS = [
  { title: 'Pídeselo a Dracs', text: 'Cuentas lo que has visto en la sesión y Dracs prepara los juegos de la semana. Tú los apruebas.', ui: <Pedir /> },
  { title: 'Dibujar para jugar', text: 'Dracs pide un dibujo, el niño lo hace con el dedo y Dracs te cuenta qué ha dibujado.', ui: <Dibujo /> },
  { title: 'Responder hablando', text: 'El niño contesta en voz alta. Dracs guarda la grabación y lo que ha entendido, para que lo escuches tú.', ui: <Voz /> },
  { title: 'Su mundo, en el juego', text: 'Su casa, su perro, su colegio. La familia sube fotos y se vuelven partidas.', ui: <Mundo /> },
]

export default function Futuro() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: true, threshold: 0.2 })
  return (
    <section className="lp-future" id="futuro">
      <div className="lp-wrap">
        <p className="lp-future__tag">En desarrollo</p>
        <h2 className="lp-title lp-center">Hacia dónde vamos.</h2>
        <p className="lp-lead">Lo que estamos construyendo ahora.</p>
        <div className={`fu-grid${inView ? ' is-in' : ''}`} ref={ref}>
          {ITEMS.map(it => (
            <article key={it.title} className="fu-card">
              {it.ui}
              <h3 className="fu-title">{it.title}</h3>
              <p className="fu-text">{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
