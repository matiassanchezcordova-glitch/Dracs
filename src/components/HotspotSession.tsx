import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { MapHotspot } from '../types/mapHotspot'
import type { HotspotFilter } from '../data/exercises'
import ExerciseTab from './ExerciseTab'
import LoadingSpinner from './LoadingSpinner'

export default function HotspotSession() {
  const { hotspotId } = useParams<{ hotspotId: string }>()
  const navigate = useNavigate()
  const [hotspot, setHotspot] = useState<MapHotspot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
