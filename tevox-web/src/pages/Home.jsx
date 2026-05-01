import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import { useProducts } from '../hooks/useProducts'
import { useInstalls } from '../hooks/useInstalls'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'

function useStats() {
  const [stats, setStats] = useState({ products: 0, carModels: 0, installs: 0 })

  useEffect(() => {
    async function fetch() {
      const [
        { count: productCount },
        { data: carModelRows },
        { count: installCount },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).neq('status', 'coming_soon'),
        supabase.from('installs').select('car_model').eq('is_approved', true),
        supabase.from('installs').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      ])
      const uniqueModels = new Set(carModelRows?.map(r => r.car_model) ?? []).size
      setStats({ products: productCount ?? 0, carModels: uniqueModels, installs: installCount ?? 0 })
    }
    fetch()
  }, [])

  return stats
}

function WaitlistModal({ onClose }) {
  const [carModels, setCarModels] = useState([])
  const [form, setForm] = useState({ name: '', line_id: '', car_model: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('products').select('car_model').then(({ data }) => {
      const unique = [...new Set(data?.map(r => r.car_model) ?? [])]
      setCarModels(unique)
      if (unique.length) setForm(f => ({ ...f, car_model: unique[0] }))
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.line_id || !form.car_model) return
    setLoading(true)
    await supabase.from('waitlist').insert(form)
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-brand-dark border border-zinc-700 rounded-lg w-full max-w-md p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-6 flex flex-col gap-3">
            <span className="text-4xl">✅</span>
            <p className="text-brand-light text-h3 font-semibold">ลงทะเบียนแล้ว!</p>
            <p className="text-zinc-400 text-body">เราจะแจ้งเตือนคุณทันทีที่มีสินค้าใหม่</p>
            <Button onClick={onClose} variant="secondary" className="mt-2">ปิด</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-brand-light font-bold text-h3">แจ้งเตือนสินค้าใหม่</h2>
                <p className="text-zinc-400 text-caption mt-1">เราจะแจ้งทันทีเมื่อมีสินค้าสำหรับรถคุณ</p>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-brand-light text-h3 leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">ชื่อ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="คุณต้น"
                  className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-brand-light text-body focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">Line ID <span className="text-brand-yellow">*</span></label>
                <input
                  type="text"
                  value={form.line_id}
                  onChange={e => setForm(f => ({ ...f, line_id: e.target.value }))}
                  placeholder="@yourlineid"
                  required
                  className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-brand-light text-body focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-zinc-400">รุ่นรถ <span className="text-brand-yellow">*</span></label>
                <select
                  value={form.car_model}
                  onChange={e => setForm(f => ({ ...f, car_model: e.target.value }))}
                  required
                  className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-brand-light text-body focus:outline-none focus:border-brand-yellow"
                >
                  {carModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <Button type="submit" variant="primary" className="w-full mt-1" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'แจ้งเตือนฉัน'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Home({ onChatOpen }) {
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const stats = useStats()
  const { products } = useProducts({ excludeStatus: 'coming_soon' })
  const { installs } = useInstalls({ limit: 6 })

  const featured = products.slice(0, 3)

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="bg-brand-dark min-h-[90vh] flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div className="flex flex-col gap-6">
            <h1 className="text-display font-black text-brand-light leading-tight">
              ชิ้นส่วนแต่งรถ EV<br />
              <span className="text-brand-yellow">— ที่สุดท้ายมีแล้ว</span>
            </h1>
            <p className="text-h3 text-zinc-400 font-light">
              เริ่มต้นที่ MG IM6 ขยายไปทุกรุ่น
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/products">
                <Button variant="primary" size="lg">ดูสินค้า</Button>
              </Link>
              <Button variant="secondary" size="lg" onClick={() => setWaitlistOpen(true)}>
                แจ้งเตือนรุ่นใหม่
              </Button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden aspect-[4/3]">
            <img
              src="https://placehold.co/1200x800/1D1C1D/E9FF22?text=Tevox+Hero"
              alt="Tevox Hero"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-3 divide-x divide-zinc-800">
          {[
            { value: stats.products, label: 'สินค้าที่มี' },
            { value: stats.carModels, label: 'รถที่รองรับ' },
            { value: stats.installs, label: 'ลูกค้าที่ติดตั้งแล้ว' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4">
              <span className="text-display font-black text-brand-yellow">{value}</span>
              <span className="text-caption text-zinc-400 text-center">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="bg-brand-light">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <h2 className="text-h2 font-bold text-brand-dark">สินค้าแนะนำ</h2>
            <Link to="/products" className="text-body text-brand-blue hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Gallery preview ── */}
      <section className="bg-brand-light border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <h2 className="text-h2 font-bold text-brand-dark">ลูกค้าที่ติดตั้งแล้ว</h2>
            <Link to="/gallery" className="text-body text-brand-blue hover:underline">
              ดูแกลเลอรี่ทั้งหมด →
            </Link>
          </div>
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {installs.map(install => (
              <div key={install.id} className="break-inside-avoid rounded overflow-hidden bg-brand-dark group">
                <img
                  src={r2Url(install.image_key)}
                  alt={install.caption_th}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-3">
                  <p className="text-caption text-zinc-400">{install.customer_name} · {install.car_model}</p>
                  {install.caption_th && (
                    <p className="text-caption text-zinc-300 mt-1 line-clamp-2">{install.caption_th}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chatbot banner ── */}
      <section className="bg-brand-dark border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-h2 font-bold text-brand-light">
              ไม่รู้ว่าอะไรเหมาะกับรถคุณ?
            </h2>
            <p className="text-body text-zinc-400">คุยกับเราได้เลย เราช่วยหาชิ้นส่วนที่ใช่ให้คุณ</p>
          </div>
          <Button variant="primary" size="lg" onClick={onChatOpen} className="shrink-0">
            💬 คุยกับเรา
          </Button>
        </div>
      </section>

      {waitlistOpen && <WaitlistModal onClose={() => setWaitlistOpen(false)} />}
    </div>
  )
}
