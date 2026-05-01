import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (filters.car_model) query = query.eq('car_model', filters.car_model)
      if (filters.category)  query = query.eq('category', filters.category)
      if (filters.excludeStatus) query = query.neq('status', filters.excludeStatus)

      const { data, error: err } = await query

      if (!cancelled) {
        if (err) setError(err.message)
        else setProducts(data ?? [])
        setLoading(false)
      }
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [filters.car_model, filters.category, filters.excludeStatus])

  return { products, loading, error }
}
