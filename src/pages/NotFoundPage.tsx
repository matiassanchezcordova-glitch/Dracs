import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      fontFamily: 'Nunito, sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
    }}>
      <img
        src="/dragon.nb.png" alt="Dracs"
        style={{ width: '80px', marginBottom: '24px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))' }}
      />
      <h1 style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: '48px', fontWeight: 700, color: '#1A1A2E',
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
        background: '#0BAFBE', color: '#ffffff',
        padding: '14px 28px', borderRadius: '14px',
        fontSize: '16px', fontWeight: 700, textDecoration: 'none',
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}
