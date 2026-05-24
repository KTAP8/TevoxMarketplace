import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cacheGet, cacheSet } from '../lib/cache'

const TTL = 5 * 60 * 1000  // 5 min

function cacheKey(filters) {
  return `products:${filters.car_model ?? ''}:${filters.category ?? ''}:${filters.excludeStatus ?? ''}`
}

export function useProducts(filters = {}) {
  const key = cacheKey(filters)

  const [products, setProducts] = useState(() => cacheGet(key) ?? [])
  const [loading, setLoading]   = useState(() => cacheGet(key) === null)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const cached = cacheGet(key)
    if (cached) {
      setProducts(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetch() {
      let query = supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (filters.car_model)    query = query.eq('car_model', filters.car_model)
      if (filters.category)     query = query.eq('category',  filters.category)
      if (filters.excludeStatus) query = query.neq('status', filters.excludeStatus)

      const { data, error: err } = await query

      if (!cancelled) {
        if (err) {
          setError(err.message)
        } else {
          cacheSet(key, data ?? [], TTL)
          setProducts(data ?? [])
        }
        setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [filters.car_model, filters.category, filters.excludeStatus])

  return { products, loading, error }
}
