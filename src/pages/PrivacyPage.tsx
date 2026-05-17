import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E8 0%, #F0FAF8 50%, #EBF7F5 100%)',
      fontFamily: 'Nunito, sans-serif',
      padding: '64px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <Link to="/" style={{
          color: '#0BAFBE', fontSize: '14px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-block', marginBottom: '24px',
        }}>
          ← Volver
        </Link>
        <h1 style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '36px', fontWeight: 700, color: '#1A1A2E',
          margin: '0 0 16px',
        }}>
          Política de privacidad
        </h1>
        <p style={{
          fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0,
        }}>
          Próximamente.
        </p>
      </div>
    </div>
  )
}
