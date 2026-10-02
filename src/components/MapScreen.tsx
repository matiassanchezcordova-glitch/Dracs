import { useNavigate } from 'react-router-dom'
import { useMapHotspots } from '../hooks/useMapHotspots'
import type { MapHotspot } from '../types/mapHotspot'
import LoadingSpinner from './LoadingSpinner'

const MAP_URL =
  'https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/mapa_principal.png'

// Debug temporal (S5.5): VITE_MAP_DEBUG=true pinta los hotspots para validar
// que las coordenadas pegan con el mapa. En producción queda en false/ausente.
const MAP_DEBUG = import.meta.env.VITE_MAP_DEBUG === 'true'

export default function MapScreen() {
  const navigate = useNavigate()
  const { hotspots, loading, error } = useMapHotspots()

  if (loading) return <LoadingSpinner />
  if (error) {
    // El mensaje técnico queda en consola; el niño ve una frase amable.
    console.error('[Dracs] Error al cargar el mapa:', error)
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 p-8 text-center" style={{ flex: 1 }}>
        <p style={{ margin: 0, fontFamily: 'Fredoka, system-ui, sans-serif', fontSize: '24px', fontWeight: 600, color: '#17313A' }}>
          El mapa no cargó.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ height: '48px', padding: '0 24px', borderRadius: '12px', border: 'none', background: '#F7C31C', color: '#15191B', fontFamily: 'Fredoka, system-ui, sans-serif', fontSize: '18px', fontWeight: 600, cursor: 'pointer' }}
        >
          Probar otra vez
        </button>
      </div>
    )
  }

  return (
    // Alto DEFINIDO = viewport menos la barra (--ax-nav-h, que el marco de la
    // app ajusta por tamaño de pantalla). El shell usa `min-height:100svh`, que
    // deja la cadena de alto indefinida: sin un alto definido acá,
    // `max-height`/`cqh` evalúan a 0/none y el mapa se corta o colapsa.
    // Columna: título arriba (shrink-0) + área del mapa abajo.
    <div
      className="min-h-0 flex flex-col p-4"
      style={{ height: 'calc(100svh - var(--ax-nav-h, 65px))', backgroundColor: '#F4F4F1' }}
    >
      {/* El mapa es el mundo del niño: aquí manda su color. Alrededor, el gris
          papel de la app, sin paneles: el título y el mapa, nada más. */}
      <div className="flex-1 min-h-0 flex flex-col gap-4" style={{ padding: 'clamp(4px, 2vw, 16px)' }}>
        <h1
          className="shrink-0 text-center"
          style={{
            margin: 0, color: '#17313A', fontFamily: 'Fredoka, system-ui, sans-serif',
            fontWeight: 600, fontSize: 'clamp(26px, 3.4vw, 40px)', lineHeight: 1.1,
          }}
        >
          ¿A dónde vamos hoy?
        </h1>

        {/* Área del mapa: ocupa el alto sobrante (definido vía la raíz) y pega la
            caja al título (en un móvil en vertical, centrarla dejaba un hueco). `containerType:size` hace que cqw/cqh del hijo midan ESTA área. */}
        <div
          className="flex-1 min-h-0 flex items-start justify-center"
          style={{ containerType: 'size' }}
        >
          {/* La caja se queda con el menor entre "ancho completo" y "alto completo *
              ratio", entrando completa por ambos ejes; `aspectRatio` fija su forma
              y la imagen la llena, así los hotspots (en %) quedan alineados. */}
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: '1446 / 1088',
              width: 'min(100cqw, calc(100cqh * 1446 / 1088))',
              border: '6px solid #FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 2px 4px rgba(21,25,27,0.06), 0 24px 48px -20px rgba(21,25,27,0.35)',
            }}
          >
            <img
              src={MAP_URL}
              alt=""
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
            {hotspots.map((h) => (
              <HotspotButton key={h.id} hotspot={h} onTap={() => navigate(`/app/nino/jugar/${h.id}`)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HotspotButton({ hotspot, onTap }: { hotspot: MapHotspot; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      aria-label={hotspot.label}
      className="absolute rounded-full focus:outline-none focus:ring-4 focus:ring-white/70 active:scale-90 transition-transform duration-150 animate-pulse-slow cursor-pointer"
      style={{
        left: `${hotspot.x_pct}%`,
        top: `${hotspot.y_pct}%`,
        width: `${hotspot.radius_pct * 2}%`,
        aspectRatio: '1 / 1',
        transform: 'translate(-50%, -50%)',
        background: MAP_DEBUG ? 'rgba(255,0,0,0.3)' : 'transparent',
        border: MAP_DEBUG ? '2px solid red' : undefined,
      }}
    />
  )
}
