import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ui/ProductCard'

const CATEGORY_LABELS = {
  front_lip:     'Front Lip',
  rear_diffuser: 'Rear Diffuser',
  spoiler:       'Spoiler',
  side_skirt:    'Side Skirt',
  grille:        'Grille',
  wheels:        'Wheels',
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

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-micro tracking-wider px-3 py-1.5 border transition-colors ${
        active
          ? 'bg-brand-dark text-brand-yellow border-brand-dark'
          : 'text-zinc-500 border-zinc-300 hover:border-zinc-500 hover:text-brand-dark bg-white'
      }`}
    >
      {active ? `[ ${label} ]` : label}
    </button>
  )
}

export default function Products() {
  const [carModel,  setCarModel]  = useState('')
  const [category,  setCategory]  = useState('')
  const { carModels, categories } = useFilterOptions()
  const { products, loading }     = useProducts({
    car_model: carModel  || undefined,
    category:  category  || undefined,
  })

  const hasFilter = carModel || category

  return (
    <div className="bg-zinc-50 min-h-screen">

      {/* Header — dark banner */}
      <div className="bg-brand-dark border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="font-mono text-micro text-zinc-600 tracking-[0.15em] uppercase mb-2">[ CATALOG ]</p>
          <h1 className="text-h2 font-black text-zinc-100">สินค้าทั้งหมด</h1>
          <p className="text-body text-zinc-500 mt-1">อะไหล่แต่ง EV คุณภาพสูง ทดสอบจริงบน MG IM6</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Filter panel */}
        <div className="bg-white border border-zinc-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-micro text-zinc-400 tracking-[0.12em] uppercase">FILTER</p>
            {hasFilter && (
              <button
                onClick={() => { setCarModel(''); setCategory('') }}
                className="font-mono text-micro text-zinc-400 hover:text-brand-dark tracking-wider uppercase transition-colors"
              >
                ล้างทั้งหมด ×
              </button>
            )}
          </div>

          {carModels.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-micro text-zinc-400 tracking-wider uppercase">รุ่นรถ</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="ทุกรุ่น" active={!carModel} onClick={() => setCarModel('')} />
                {carModels.map(m => (
                  <FilterChip key={m} label={m} active={carModel === m} onClick={() => setCarModel(m)} />
                ))}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-micro text-zinc-400 tracking-wider uppercase">หมวดหมู่</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="ทุกหมวด" active={!category} onClick={() => setCategory('')} />
                {categories.map(c => (
                  <FilterChip
                    key={c}
                    label={CATEGORY_LABELS[c] ?? c}
                    active={category === c}
                    onClick={() => setCategory(c)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-zinc-100 pt-3">
            <p className="font-mono text-micro text-zinc-400 tabular-nums">
              {loading ? '...' : `${products.length} รายการ`}
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-50 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-zinc-200 bg-white py-24 text-center">
            <p className="font-mono text-micro text-zinc-400 tracking-widest uppercase mb-2">NO RESULTS</p>
            <p className="text-zinc-400 text-caption">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200">
            {products.map(p => (
              <div key={p.id} className="bg-zinc-50">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
