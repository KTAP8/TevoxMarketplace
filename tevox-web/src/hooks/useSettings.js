import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cacheGet, cacheSet } from '../lib/cache'

const KEY = 'settings'
const TTL = 30 * 60 * 1000  // 30 min — settings almost never change

export function useSettings() {
  const [settings, setSettings] = useState(() => cacheGet(KEY) ?? {})
  const [loading, setLoading]   = useState(() => cacheGet(KEY) === null)

  useEffect(() => {
    const cached = cacheGet(KEY)
    if (cached) {
      setSettings(cached)
      setLoading(false)
      return
    }

    supabase.from('settings').select('key, value').then(({ data }) => {
      const map = Object.fromEntries((data ?? []).map(r => {
        const val  = r.value
        const safe = r.key.endsWith('_url') && val && !val.startsWith('http')
          ? `https://${val}`
          : val
        return [r.key, safe]
      }))
      cacheSet(KEY, map, TTL)
      setSettings(map)
      setLoading(false)
    })
  }, [])

  return { settings, loading }
}
