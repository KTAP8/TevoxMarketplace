import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import { useInstalls } from '../hooks/useInstalls'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function SubmitModal({ onClose }) {
  const [products, setProducts]   = useState([])
  const [carModels, setCarModels] = useState([])
  const [form, setForm] = useState({ customer_name: '', car_model: '', product_id: '', caption_th: '' })
  const [file, setFile]           = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    supabase.from('products').select('id, name_th, car_model').then(({ data }) => {
      setProducts(data ?? [])
      const unique = [...new Set(data?.map(r => r.car_model) ?? [])]
      setCarModels(unique)
      if (unique.length) setForm(f => ({ ...f, car_model: unique[0] }))
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.customer_name || !form.car_model) return
    setLoading(true)
    let image_key = null
    if (file) {
      const ext  = file.name.split('.').pop()
      const path = `installs/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('tevox-media').upload(path, file)
      if (!error) image_key = path
    }
    await supabase.from('installs').insert({
      customer_name: form.customer_name,
      car_model:     form.car_model,
      product_id:    form.product_id || null,
      caption_th:    form.caption_th || null,
      image_key,
      is_approved:   false,
    })
    setLoading(false)
    setSubmitted(true)
  }

  const inputClass = "bg-zinc-50 border border-zinc-300 rounded-none px-3 py-2.5 text-brand-dark font-mono text-caption focus:outline-none focus:border-brand-dark w-full"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white border border-zinc-200 rounded-none w-full max-w-md p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <polyline points="2,10 8,16 18,4" stroke="#E9FF22" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-brand-dark font-bold text-h3">ขอบคุณ!</p>
              <p className="text-zinc-500 text-caption mt-1 font-mono">รูปของคุณจะปรากฏหลังจากได้รับการอนุมัติ</p>
            </div>
            <Button onClick={onClose} variant="secondary" size="sm">ปิด</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase mb-1">SUBMIT BUILD</p>
                <h2 className="text-brand-dark font-bold text-h3">ส่งรูปรถของคุณ</h2>
                <p className="text-zinc-500 text-caption mt-1">รูปจะถูกอนุมัติก่อนแสดงในแกลเลอรี่</p>
              </div>
              <button onClick={onClose} className="text-zinc-400 hover:text-brand-dark leading-none p-1 text-h3">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">ชื่อ <span className="text-brand-dark">*</span></label>
                <input type="text" required placeholder="คุณต้น" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">รุ่นรถ <span className="text-brand-dark">*</span></label>
                <select required value={form.car_model} onChange={e => setForm(f => ({ ...f, car_model: e.target.value }))} className={inputClass}>
                  {carModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">สินค้าที่ใช้ (ไม่บังคับ)</label>
                <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} className={inputClass}>
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name_th}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">คำอธิบาย (ไม่บังคับ)</label>
                <textarea placeholder="เล่าประสบการณ์ของคุณ..." rows={3} value={form.caption_th} onChange={e => setForm(f => ({ ...f, caption_th: e.target.value }))} className={inputClass + ' resize-none'} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">รูปภาพ</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
                  className="font-mono text-micro text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-none file:border file:border-zinc-300 file:bg-white file:text-zinc-600 file:font-mono file:text-micro file:cursor-pointer hover:file:border-zinc-500 hover:file:text-brand-dark file:transition-colors" />
              </div>
              <Button type="submit" variant="primary" className="w-full mt-1" disabled={loading}>
                {loading ? 'กำลังส่ง...' : 'ส่งรูป'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Gallery() {
  const [carModel, setCarModel]     = useState('')
  const [carModels, setCarModels]   = useState([])
  const [submitOpen, setSubmitOpen] = useState(false)
  const [lightbox, setLightbox]     = useState(null)
  const { installs, loading }       = useInstalls({ car_model: carModel || undefined })

  useEffect(() => {
    supabase.from('installs').select('car_model').eq('is_approved', true).then(({ data }) => {
      setCarModels([...new Set(data?.map(r => r.car_model) ?? [])])
    })
  }, [])

  return (
    <div className="bg-zinc-50 min-h-screen">

      {/* Header — dark banner */}
      <div className="bg-brand-dark border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <p className="font-mono text-micro text-zinc-600 tracking-[0.15em] uppercase mb-2">[ COMMUNITY BUILDS ]</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-h2 font-black text-zinc-100">แกลเลอรี่</h1>
            <Button variant="primary" onClick={() => setSubmitOpen(true)}>ส่งรูปรถคุณ</Button>
          </div>
          <p className="text-zinc-500 text-body mt-2">รูปจากลูกค้าที่ติดตั้งจริง</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {[{ value: '', label: 'ทุกรุ่น' }, ...carModels.map(m => ({ value: m, label: m }))].map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setCarModel(value)}
              className={`font-mono text-micro tracking-wider px-3 py-1.5 border transition-colors ${
                carModel === value
                  ? 'bg-brand-dark text-brand-yellow border-brand-dark'
                  : 'text-zinc-500 border-zinc-300 hover:border-zinc-500 hover:text-brand-dark bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="break-inside-avoid bg-zinc-200 animate-pulse aspect-[4/3] mb-3" />
            ))}
          </div>
        ) : installs.length === 0 ? (
          <div className="border border-zinc-200 bg-white py-24 text-center">
            <p className="font-mono text-micro text-zinc-400 tracking-widest uppercase mb-2">NO BUILDS YET</p>
            <p className="text-zinc-400 text-caption">ยังไม่มีรูปในหมวดนี้</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {installs.map(install => (
              <div
                key={install.id}
                className="break-inside-avoid group relative cursor-pointer overflow-hidden mb-3 border border-zinc-200 hover:border-zinc-400 transition-colors"
                onClick={() => setLightbox(install)}
              >
                <img
                  src={r2Url(install.image_key)}
                  alt={install.caption_th}
                  className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="font-mono text-micro text-zinc-200 tracking-wide">{install.customer_name} · {install.car_model}</p>
                  {install.products && (
                    <Link to={`/products/${install.products.id}`} onClick={e => e.stopPropagation()}
                      className="font-mono text-micro text-brand-yellow/80 hover:text-brand-yellow transition-colors block mt-0.5 tracking-wide">
                      {install.products.name_th}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-2xl w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <img src={r2Url(lightbox.image_key)} alt="" className="w-full object-contain max-h-[72vh]" />
            <div className="flex items-start justify-between gap-4 border-t border-zinc-700 pt-4">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-caption text-zinc-200 tracking-wide">{lightbox.customer_name} · {lightbox.car_model}</p>
                {lightbox.caption_th && <p className="text-zinc-500 text-caption">{lightbox.caption_th}</p>}
              </div>
              <button className="font-mono text-micro text-zinc-600 hover:text-zinc-300 tracking-widest uppercase shrink-0" onClick={() => setLightbox(null)}>
                [ ปิด ]
              </button>
            </div>
          </div>
        </div>
      )}

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} />}
    </div>
  )
}
