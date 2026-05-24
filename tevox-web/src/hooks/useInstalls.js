import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cacheGet, cacheSet } from '../lib/cache'

const TTL = 5 * 60 * 1000  // 5 min

function cacheKey(filters) {
  return `installs:${filters.car_model ?? ''}:${filters.product_id ?? ''}:${filters.limit ?? ''}`
}

export function useInstalls(filters = {}) {
  const key = cacheKey(filters)

  const [installs, setInstalls] = useState(() => cacheGet(key) ?? [])
  const [loading, setLoading]   = useState(() => cacheGet(key) === null)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const cached = cacheGet(key)
    if (cached) {
      setInstalls(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetch() {
      let query = supabase
        .from('installs')
        .select('*, products(id, name_th, sku)')
        .eq('is_approved', true)
        .order('submitted_at', { ascending: false })

      if (filters.car_model)  query = query.eq('car_model',  filters.car_model)
      if (filters.product_id) query = query.eq('product_id', filters.product_id)
      if (filters.limit)      query = query.limit(filters.limit)

      const { data, error: err } = await query

      if (!cancelled) {
        if (err) {
          setError(err.message)
        } else {
          cacheSet(key, data ?? [], TTL)
          setInstalls(data ?? [])
        }
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [filters.car_model, filters.product_id, filters.limit])

  return { installs, loading, error }
}
