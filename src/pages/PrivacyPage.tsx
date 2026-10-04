import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../landing/landing.css'

// Privacidad: la misma barra que /demo y el texto en el sistema de la web.
const FORM = [
  'Cuando envías el formulario "Quiero sumarme", recibimos en dracs@dracs.health los datos que escribes: nombre, correo, profesión, dónde trabajas, ciudad, edades con las que trabajas, cómo quieres participar y tu comentario.',
  'El envío pasa por FormSubmit (formsubmit.co), un servicio que entrega el formulario a nuestro correo.',
  'Usamos estos datos solo para responderte y hablar contigo sobre Dracs. No los compartimos con nadie más ni los usamos para publicidad.',
  'Puedes pedir que los corrijamos o los borremos cuando quieras escribiendo a dracs@dracs.health.',
]

const DEMO = [
  'La demo no pide registro. Lo que juegas y lo que escribes en ella se guarda solo en tu navegador y no se envía a ningún servidor.',
  'Para borrarlo, abre el menú de la demo y elige "Empezar de cero".',
]

export default function PrivacyPage() {
  useEffect(() => { document.title = 'Dracs · Privacidad' }, [])
  return (
    <div className="lp" style={{ minHeight: '100vh' }}>
      <header className="lp-nav">
        <div className="lp-wrap" style={{ maxWidth: 1040 }}>
          <div className="lp-nav__row">
            <Link className="lp-brand" to="/" aria-label="Volver a la web de Dracs">
              <img src="/landing/dragon.webp" alt="Dracs" width={40} height={52} />
            </Link>
            <div className="lp-nav__cta">
              <Link className="lp-btn lp-btn--primary lp-btn--small" to="/#sumarme">Quiero sumarme</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="lp-section lp-demo">
        <div className="lp-wrap" style={{ maxWidth: 760 }}>
          <h1 className="lp-title">Privacidad.</h1>

          <h2 className="lp-sub" style={{ marginTop: 40 }}>El formulario de la web</h2>
          {FORM.map(t => <p key={t} className="lp-p" style={{ marginTop: 14, maxWidth: '62ch' }}>{t}</p>)}

          <h2 className="lp-sub" style={{ marginTop: 40 }}>La demo</h2>
          {DEMO.map(t => <p key={t} className="lp-p" style={{ marginTop: 14, maxWidth: '62ch' }}>{t}</p>)}

          <p className="lp-source" style={{ marginTop: 40 }}>
            La política completa de privacidad del producto está en preparación.
          </p>
        </div>
      </main>
    </div>
  )
}
