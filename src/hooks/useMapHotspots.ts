import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MapHotspot } from '../types/mapHotspot'

export function useMapHotspots() {
  const [hotspots, setHotspots] = useState<MapHotspot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const { data, error } = await supabase
        .from('map_hotspots')
        .select('id, label, pool_type, place, x_pct, y_pct, radius_pct, display_order, is_active')
        .eq('is_active', true)
        .order('display_order')

      if (cancelled) return

      if (error) setError(error.message)
      else setHotspots((data ?? []) as MapHotspot[])
      setLoading(false)
    })()

    return () => { cancelled = true }
  }, [])

  return { hotspots, loading, error }
}
