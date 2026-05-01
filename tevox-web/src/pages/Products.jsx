import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ui/ProductCard'

const CATEGORY_LABELS = {
  front_lip:    'Front Lip',
  rear_diffuser: 'Rear Diffuser',
  spoiler:      'Spoiler',
  side_skirt:   'Side Skirt',
  grille:       'Grille',
  wheels:       'Wheels',
}

function useFilterOptions() {
  const [carModels, setCarModels]   = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    supabase.from('products').select('car_model, category').then(({ data }) => {
      setCarModels([...new Set(data?.map(r => r.car_model) ?? [])])
      setCategories([...new Set(data?.map(r => r.category) ?? [])])
    })
  }, [])

  return { carModels, categories }
}

export default function Products() {
  const [carModel,  setCarModel]  = useState('')
  const [category,  setCategory]  = useState('')

  const { carModels, categories } = useFilterOptions()
  const { products, loading } = useProducts({
    car_model: carModel  || undefined,
    category:  category  || undefined,
  })

  const selectClass = "bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-brand-light text-body focus:outline-none focus:border-brand-yellow"

  return (
    <div className="bg-brand-light min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-brand-dark">สินค้าทั้งหมด</h1>
          <p className="text-body text-zinc-500 mt-1">อะไหล่แต่ง EV คุณภาพสูง สำหรับรถของคุณ</p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 bg-white border border-zinc-200 rounded-lg p-4">
          <select value={carModel} onChange={e => setCarModel(e.target.value)} className={selectClass}>
            <option value="">รถทุกรุ่น</option>
            {carModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
            <option value="">ทุกหมวดหมู่</option>
            {categories.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
            ))}
          </select>
          {(carModel || category) && (
            <button
              onClick={() => { setCarModel(''); setCategory('') }}
              className="text-caption text-zinc-500 hover:text-brand-blue underline"
            >
              ล้างตัวกรอง
            </button>
          )}
          <span className="ml-auto text-caption text-zinc-400 self-center">
            {loading ? '...' : `${products.length} รายการ`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-200 rounded animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 text-body">
            ไม่พบสินค้าที่ตรงกับเงื่อนไข
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
