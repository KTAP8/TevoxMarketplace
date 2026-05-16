import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.from('settings').select('key, value').then(({ data }) => {
      const map = Object.fromEntries((data ?? []).map(r => {
        const val = r.value
        const isUrl = r.key.endsWith('_url')
        const safe = isUrl && val && !val.startsWith('http') ? `https://${val}` : val
        return [r.key, safe]
      }))
      setSettings(map)
      setLoading(false)
    })
  }, [])

  return { settings, loading }
}
