import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useInstalls(filters = {}) {
  const [installs, setInstalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchInstalls() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('installs')
        .select('*, products(id, name_th, sku)')
        .eq('is_approved', true)
        .order('submitted_at', { ascending: false })

      if (filters.car_model)  query = query.eq('car_model', filters.car_model)
      if (filters.product_id) query = query.eq('product_id', filters.product_id)
      if (filters.limit)      query = query.limit(filters.limit)

      const { data, error: err } = await query

      if (!cancelled) {
        if (err) setError(err.message)
        else setInstalls(data ?? [])
        setLoading(false)
      }
    }

    fetchInstalls()
    return () => { cancelled = true }
  }, [filters.car_model, filters.product_id, filters.limit])

  return { installs, loading, error }
}
