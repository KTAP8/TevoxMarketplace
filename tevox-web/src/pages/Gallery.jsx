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

  const inputClass = "bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-brand-light text-body focus:outline-none focus:border-brand-yellow w-full"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-brand-dark border border-zinc-700 rounded-lg w-full max-w-md p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-6 flex flex-col gap-3">
            <span className="text-4xl">🙏</span>
            <p className="text-brand-light text-h3 font-semibold">ขอบคุณ!</p>
            <p className="text-zinc-400 text-body">รูปของคุณจะปรากฏหลังจากได้รับการอนุมัติ</p>
            <Button onClick={onClose} variant="secondary" className="mt-2">ปิด</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-brand-light font-bold text-h3">ส่งรูปรถของคุณ</h2>
                <p className="text-zinc-400 text-caption mt-1">รูปจะถูกอนุมัติก่อนแสดงในแกลเลอรี่</p>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-brand-light text-h3 leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">ชื่อ <span className="text-brand-yellow">*</span></label>
                <input type="text" required placeholder="คุณต้น"
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  className={inputClass} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">รุ่นรถ <span className="text-brand-yellow">*</span></label>
                <select required value={form.car_model}
                  onChange={e => setForm(f => ({ ...f, car_model: e.target.value }))}
                  className={inputClass}>
                  {carModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">สินค้าที่ใช้ (ไม่บังคับ)</label>
                <select value={form.product_id}
                  onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                  className={inputClass}>
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name_th}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">คำอธิบาย (ไม่บังคับ)</label>
                <textarea placeholder="เล่าประสบการณ์ของคุณ..." rows={3}
                  value={form.caption_th}
                  onChange={e => setForm(f => ({ ...f, caption_th: e.target.value }))}
                  className={inputClass + ' resize-none'} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">รูปภาพ</label>
                <input type="file" accept="image/*"
                  onChange={e => setFile(e.target.files[0])}
                  className="text-caption text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-zinc-800 file:text-brand-light file:cursor-pointer hover:file:bg-zinc-700" />
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
  const [carModel, setCarModel]       = useState('')
  const [carModels, setCarModels]     = useState([])
  const [submitOpen, setSubmitOpen]   = useState(false)
  const [lightbox, setLightbox]       = useState(null)

  const { installs, loading } = useInstalls({ car_model: carModel || undefined })

  useEffect(() => {
    supabase.from('installs').select('car_model').eq('is_approved', true).then(({ data }) => {
      setCarModels([...new Set(data?.map(r => r.car_model) ?? [])])
    })
  }, [])

  return (
    <div className="bg-brand-light min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-h2 font-bold text-brand-dark">แกลเลอรี่</h1>
            <p className="text-body text-zinc-500 mt-1">รูปจากลูกค้าที่ติดตั้งจริง</p>
          </div>
          <Button variant="primary" onClick={() => setSubmitOpen(true)}>
            ส่งรูปรถคุณ
          </Button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCarModel('')}
            className={`px-3 py-1.5 rounded-pill text-caption font-semibold border transition-colors ${
              !carModel ? 'bg-brand-dark text-brand-yellow border-brand-dark' : 'bg-white text-zinc-500 border-zinc-300 hover:border-brand-dark'
            }`}
          >
            ทุกรุ่น
          </button>
          {carModels.map(m => (
            <button key={m}
              onClick={() => setCarModel(m)}
              className={`px-3 py-1.5 rounded-pill text-caption font-semibold border transition-colors ${
                carModel === m ? 'bg-brand-dark text-brand-yellow border-brand-dark' : 'bg-white text-zinc-500 border-zinc-300 hover:border-brand-dark'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        {loading ? (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="break-inside-avoid bg-zinc-200 rounded animate-pulse aspect-[4/3] mb-4" />
            ))}
          </div>
        ) : installs.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 text-body">ยังไม่มีรูปในหมวดนี้</div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {installs.map(install => (
              <div
                key={install.id}
                className="break-inside-avoid rounded-lg overflow-hidden bg-brand-dark cursor-pointer group mb-4"
                onClick={() => setLightbox(install)}
              >
                <div className="overflow-hidden">
                  <img
                    src={r2Url(install.image_key)}
                    alt={install.caption_th}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <p className="text-caption font-semibold text-brand-light">{install.customer_name} · {install.car_model}</p>
                  {install.caption_th && (
                    <p className="text-caption text-zinc-400 line-clamp-2">{install.caption_th}</p>
                  )}
                  {install.products && (
                    <Link
                      to={`/products/${install.products.id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-caption text-brand-blue hover:underline mt-0.5"
                    >
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
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-2xl w-full flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <img src={r2Url(lightbox.image_key)} alt="" className="w-full rounded-lg object-contain max-h-[70vh]" />
            <div className="flex flex-col gap-1">
              <p className="text-brand-light font-semibold">{lightbox.customer_name} · {lightbox.car_model}</p>
              {lightbox.caption_th && <p className="text-zinc-400 text-body">{lightbox.caption_th}</p>}
            </div>
          </div>
          <button className="absolute top-4 right-4 text-white text-h2 leading-none">×</button>
        </div>
      )}

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} />}
    </div>
  )
}
