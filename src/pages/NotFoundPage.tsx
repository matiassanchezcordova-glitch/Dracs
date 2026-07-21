import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF5E8',
      fontFamily: 'Nunito, sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
    }}>
      <img
        src="/logo-dracs.png" alt="Dracs"
        style={{ width: '80px', marginBottom: '24px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))' }}
      />
      <h1 style={{
        fontFamily: '"Fredoka", system-ui, sans-serif',
        fontSize: '48px', fontWeight: 700, color: '#33302A',
        margin: '0 0 8px',
      }}>
        404
      </h1>
      <p style={{
        fontSize: '16px', color: '#6B7280', margin: '0 0 24px',
      }}>
        Esta página no existe.
      </p>
      <Link to="/" style={{
        display: 'inline-block',
        background: '#F7C31C', color: '#33302A',
        padding: '14px 28px', borderRadius: '14px',
        fontSize: '16px', fontWeight: 600, textDecoration: 'none',
        fontFamily: 'Fredoka, system-ui, sans-serif',
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}
