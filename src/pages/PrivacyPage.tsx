import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F4F1',
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      padding: '64px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <Link to="/" style={{
          color: '#3F6B78', fontSize: '14px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-block', marginBottom: '24px',
        }}>
          Volver
        </Link>
        <h1 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: '36px', fontWeight: 600, color: '#15191B',
          margin: '0 0 16px',
        }}>
          Política de privacidad
        </h1>
        <h2 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: '22px', fontWeight: 600, color: '#15191B',
          margin: '8px 0 12px',
        }}>
          Formulario de contacto de la web
        </h2>
        {[
          'Cuando envías el formulario "Quiero sumarme", recibimos en dracs@dracs.health los datos que escribes: nombre, correo, profesión, dónde trabajas, ciudad, edades con las que trabajas, cómo quieres participar y tu comentario.',
          'El envío pasa por FormSubmit (formsubmit.co), un servicio que entrega el formulario a nuestro correo.',
          'Usamos estos datos solo para responderte y hablar contigo sobre Dracs. No los compartimos con nadie más ni los usamos para publicidad.',
          'Puedes pedir que los corrijamos o los borremos cuando quieras escribiendo a dracs@dracs.health.',
        ].map(t => (
          <p key={t} style={{ fontSize: '16px', color: '#15191B', lineHeight: 1.6, margin: '0 0 12px' }}>{t}</p>
        ))}
        <p style={{ fontSize: '16px', color: '#15191B', lineHeight: 1.6, margin: '24px 0 0' }}>
          La política completa de privacidad del producto está en preparación.
        </p>
      </div>
    </div>
  )
}
