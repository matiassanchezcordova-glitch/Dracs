import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { MapHotspot } from '../types/mapHotspot'
import type { HotspotFilter } from '../data/exercises'
import { useUiAudios } from '../hooks/useUiAudios'
import ExerciseTab from './ExerciseTab'
import LoadingSpinner from './LoadingSpinner'

export default function HotspotSession() {
  const { hotspotId } = useParams<{ hotspotId: string }>()
  const navigate = useNavigate()
  const [hotspot, setHotspot] = useState<MapHotspot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getIntroByHotspotId, loaded: audiosLoaded } = useUiAudios()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const introdPlayedRef = useRef<string | null>(null)

  // Audio instance compartida para el intro del hotspot (mismo patrón que ExerciseScreen).
  useEffect(() => {
    audioRef.current = new Audio()
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  function playAudio(url: string | null | undefined) {
    if (!url || !audioRef.current) return
    try {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.src = url
      audioRef.current.play().catch(() => { /* autoplay policy o error de red — silencioso */ })
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    if (!hotspotId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('map_hotspots')
        .select('*')
        .eq('id', hotspotId)
        .single()
      if (cancelled) return
      if (error) setError(error.message)
      else setHotspot(data as MapHotspot)
      setLoading(false)
    })()

    return () => { cancelled = true }
  }, [hotspotId])

  // Intro sonoro al entrar: suena una vez cuando el hotspot ya cargó y va a
  // montarse ExerciseTab. El ref evita que se repita en re-renders; al volver al
  // mapa y reentrar, el componente se remonta y el ref vuelve a null → suena de nuevo.
  useEffect(() => {
    if (!hotspot || loading || !audiosLoaded) return
    if (introdPlayedRef.current === hotspot.id) return
    const introUrl = getIntroByHotspotId(hotspot.id)
    if (introUrl) {
      playAudio(introUrl)
      introdPlayedRef.current = hotspot.id
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspot, loading, audiosLoaded])

  if (loading) return <LoadingSpinner />

  if (error || !hotspot) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ flex: 1 }}
      >
        <p className="text-red-700">{error ?? 'No encontramos ese lugar del mapa.'}</p>
        <button onClick={() => navigate('/app/nino')} className="underline">
          ← Volver al mapa
        </button>
      </div>
    )
  }

  const filter: HotspotFilter =
    hotspot.pool_type === 'place' && hotspot.place
      ? { type: 'place', place: hotspot.place }
      : { type: 'random_all' }

  return (
    <ExerciseTab
      hotspotFilter={filter}
      onBackToMap={() => navigate('/app/nino')}
      onNavigateToFamilia={() => navigate('/app/familia')}
      onNavigateToTerapeuta={() => navigate('/app/terapeuta')}
      onRequestAuth={() => navigate('/login?role=child')}
    />
  )
}
