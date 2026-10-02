import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F4F1',
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
    }}>
      <img
        src="/landing/dragon.webp" alt="Dracs"
        style={{ width: '80px', marginBottom: '24px', }}
      />
      <h1 style={{
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: '48px', fontWeight: 600, color: '#15191B',
        margin: '0 0 8px',
      }}>
        404
      </h1>
      <p style={{
        fontSize: '16px', color: '#5E6468', margin: '0 0 24px',
      }}>
        Esta página no existe.
      </p>
      <Link to="/" style={{
        display: 'inline-block',
        background: '#F7C31C', color: '#15191B',
        padding: '14px 28px', borderRadius: '12px',
        fontSize: '16px', fontWeight: 600, textDecoration: 'none',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}
