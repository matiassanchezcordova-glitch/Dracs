import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type UiAudioRow = { key: string; category: string; audio_url: string | null }

export function useUiAudios() {
  const [byCategory, setByCategory] = useState<Record<string, string[]>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('ui_audios')
        .select('key, category, audio_url')
        .not('audio_url', 'is', null)
      if (cancelled) return
      if (error) {
        console.warn('[useUiAudios] load error:', error.message)
        setLoaded(true)
        return
      }
      const grouped: Record<string, string[]> = {}
      for (const row of (data ?? []) as UiAudioRow[]) {
        if (!row.audio_url) continue
        if (!grouped[row.category]) grouped[row.category] = []
        grouped[row.category].push(row.audio_url)
      }
      setByCategory(grouped)
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [])

  function pickRandomUrl(category: string): string | null {
    const arr = byCategory[category]
    if (!arr || arr.length === 0) return null
    return arr[Math.floor(Math.random() * arr.length)]
  }

  return {
    loaded,
    playCorrect: () => pickRandomUrl('feedback_correct'),
    playIncorrect: () => pickRandomUrl('feedback_incorrect'),
    getHotspotIntro: (place: string) => pickRandomUrl('hotspot_intro_' + place), // por si después se usa
  }
}
