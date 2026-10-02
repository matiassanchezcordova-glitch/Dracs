// Carga: el dragón de la marca y un anillo fino, sobre el gris papel de la app.
export default function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-label="Cargando"
      style={{
        minHeight: '100vh', flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '20px',
        background: '#F4F4F1',
      }}
    >
      <img
        src="/landing/dragon.webp" alt="" width={64} height={83}
        style={{ width: '64px', height: 'auto', animation: 'floatDragon2 3s ease-in-out infinite' }}
      />
      <div style={{
        width: '28px', height: '28px', border: '3px solid #E3E4E0',
        borderTop: '3px solid #17313A', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { [role=status] img, [role=status] div { animation: none !important; } }`}</style>
    </div>
  )
}
