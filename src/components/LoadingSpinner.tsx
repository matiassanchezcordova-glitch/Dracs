export default function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '20px',
      background: '#FAF5E8',
    }}>
      <img
        src="/dragon.nb.png" alt="Dracs"
        style={{ width: '80px', animation: 'floatDragon2 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))' }}
      />
      <div style={{
        width: '32px', height: '32px', border: '3px solid #E0F2FE',
        borderTop: '3px solid #5B8896', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
