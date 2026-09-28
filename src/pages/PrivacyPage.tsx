import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF5E8',
      fontFamily: 'Nunito, sans-serif',
      padding: '64px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <Link to="/" style={{
          color: '#5B8896', fontSize: '14px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-block', marginBottom: '24px',
        }}>
          Volver
        </Link>
        <h1 style={{
          fontFamily: '"Fredoka", system-ui, sans-serif',
          fontSize: '36px', fontWeight: 700, color: '#33302A',
          margin: '0 0 16px',
        }}>
          Política de privacidad
        </h1>
        <h2 style={{
          fontFamily: '"Fredoka", system-ui, sans-serif',
          fontSize: '22px', fontWeight: 600, color: '#33302A',
          margin: '8px 0 12px',
        }}>
          Formulario de contacto de la web
        </h2>
        {[
          'Cuando envías el formulario "Quiero sumarme", guardamos los datos que escribes: nombre, correo, dónde trabajas, ciudad, edades con las que trabajas, cómo quieres participar y tu comentario.',
          'Los usamos solo para responderte y hablar contigo sobre Dracs. No los compartimos con nadie ni los usamos para publicidad.',
          'Puedes pedir que los corrijamos o los borremos cuando quieras escribiendo a dracs@dracs.health.',
        ].map(t => (
          <p key={t} style={{ fontSize: '16px', color: '#33302A', lineHeight: 1.6, margin: '0 0 12px' }}>{t}</p>
        ))}
        <p style={{ fontSize: '16px', color: '#33302A', lineHeight: 1.6, margin: '24px 0 0' }}>
          La política completa de privacidad del producto está en preparación.
        </p>
      </div>
    </div>
  )
}
