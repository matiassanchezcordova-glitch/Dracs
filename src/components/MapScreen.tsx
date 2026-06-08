import { useNavigate } from 'react-router-dom'
import { useMapHotspots } from '../hooks/useMapHotspots'
import type { MapHotspot } from '../types/mapHotspot'

const MAP_URL =
  'https://bxhptoigtummmckxnkzv.supabase.co/storage/v1/object/public/exercise-images/mapa_principal.png'

// Debug temporal (S5.5): VITE_MAP_DEBUG=true pinta los hotspots para validar
// que las coordenadas pegan con el mapa. En producción queda en false/ausente.
const MAP_DEBUG = import.meta.env.VITE_MAP_DEBUG === 'true'

export default function MapScreen() {
  const navigate = useNavigate()
  const { hotspots, loading, error } = useMapHotspots()

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center text-2xl" style={{ flex: 1 }}>
        Cargando…
      </div>
    )
  }
  if (error) {
    return (
      <div className="w-full flex items-center justify-center text-red-700 p-8" style={{ flex: 1 }}>
        Error: {error}
      </div>
    )
  }

  return (
    // Alto DEFINIDO = viewport menos el navbar (56px). El shell usa
    // `min-height:100svh`, que deja la cadena de alto indefinida: sin un alto
    // definido acá, `max-height`/`cqh` evalúan a 0/none y el mapa se corta o
    // colapsa. Columna: título arriba (shrink-0) + área del mapa abajo.
    // TODO (S5.x): mover el 56px del navbar a una CSS var global `--navbar-height`
    // en :root y usar calc(100svh - var(--navbar-height)) — hoy está hardcodeado.
    <div
      className="min-h-0 flex flex-col bg-sky-100 p-4 gap-3"
      style={{ height: 'calc(100svh - 56px)' }}
    >
      <h1 className="shrink-0 text-center text-2xl md:text-4xl font-display font-bold text-orange-500">
        ¿A dónde vamos hoy?
      </h1>

      {/* Área del mapa: ocupa el alto sobrante (definido vía la raíz) y centra la
          caja. `containerType:size` hace que cqw/cqh del hijo midan ESTA área. */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center"
        style={{ containerType: 'size' }}
      >
        {/* La caja se queda con el menor entre "ancho completo" y "alto completo *
            ratio", entrando completa por ambos ejes; `aspectRatio` fija su forma
            y la imagen la llena, así los hotspots (en %) quedan alineados. */}
        <div
          className="relative"
          style={{
            aspectRatio: '1446 / 1088',
            width: 'min(100cqw, calc(100cqh * 1446 / 1088))',
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
