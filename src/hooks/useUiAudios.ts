import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type UiAudioRow = { key: string; category: string; audio_url: string | null }

export function useUiAudios() {
  const [byCategory, setByCategory] = useState<Record<string, string[]>>({})
  const [byKey, setByKey] = useState<Record<string, string>>({})
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
      const keyMap: Record<string, string> = {}
      for (const row of (data ?? []) as UiAudioRow[]) {
        if (!row.audio_url) continue
        if (!grouped[row.category]) grouped[row.category] = []
        grouped[row.category].push(row.audio_url)
        keyMap[row.key] = row.audio_url
      }
      setByCategory(grouped)
      setByKey(keyMap)
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [])

  function pickRandomUrl(category: string): string | null {
    const arr = byCategory[category]
    if (!arr || arr.length === 0) return null
    return arr[Math.floor(Math.random() * arr.length)]
  }

  // Intro de un hotspot puntual, indexado por key exacto (hotspot_intro_<id>).
  function getIntroByHotspotId(hotspotId: string): string | null {
    return byKey[`hotspot_intro_${hotspotId}`] ?? null
  }

  return {
    loaded,
    playCorrect: () => pickRandomUrl('feedback_correct'),
    playIncorrect: () => pickRandomUrl('feedback_incorrect'),
    getIntroByHotspotId,
  }
}
