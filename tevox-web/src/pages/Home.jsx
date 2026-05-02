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
    async function load() {
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
    load()
  }, [])
  return stats
}

function WaitlistModal({ onClose }) {
  const [carModels, setCarModels] = useState([])
  const [form, setForm]           = useState({ name: '', line_id: '', car_model: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)

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

  const inputClass = "bg-zinc-50 border border-zinc-300 rounded-none px-3 py-2.5 text-brand-dark font-mono text-caption focus:outline-none focus:border-brand-dark w-full"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white border border-zinc-200 rounded-none w-full max-w-md p-6 flex flex-col gap-5 shadow-xl"
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
              <p className="text-brand-dark font-bold text-h3">ลงทะเบียนแล้ว</p>
              <p className="text-zinc-500 text-caption mt-1 font-mono">เราจะแจ้งเตือนทันทีที่มีสินค้าใหม่</p>
            </div>
            <Button onClick={onClose} variant="secondary" size="sm">ปิด</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase mb-1">WAITLIST</p>
                <h2 className="text-brand-dark font-bold text-h3">แจ้งเตือนสินค้าใหม่</h2>
                <p className="text-zinc-500 text-caption mt-1">เราจะแจ้งทันทีเมื่อมีสินค้าสำหรับรถคุณ</p>
              </div>
              <button onClick={onClose} className="text-zinc-400 hover:text-brand-dark leading-none p-1 text-h3">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">ชื่อ (ไม่บังคับ)</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="คุณต้น" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">Line ID <span className="text-brand-dark">*</span></label>
                <input type="text" value={form.line_id} onChange={e => setForm(f => ({ ...f, line_id: e.target.value }))} placeholder="@yourlineid" required className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">รุ่นรถ <span className="text-brand-dark">*</span></label>
                <select value={form.car_model} onChange={e => setForm(f => ({ ...f, car_model: e.target.value }))} required className={inputClass}>
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

function SectionLabel({ index, label }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-mono text-micro text-zinc-400 tabular-nums">[ {String(index).padStart(2,'0')} ]</span>
      <div className="h-px w-8 bg-zinc-300" />
      <span className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">{label}</span>
    </div>
  )
}

export default function Home({ onChatOpen }) {
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const stats = useStats()
  const { products } = useProducts({ excludeStatus: 'coming_soon' })
  const { installs }  = useInstalls({ limit: 6 })
  const featured      = products.slice(0, 3)

  return (
    <div className="flex flex-col">

      {/* ── Hero (dark) ── */}
      <section className="relative bg-brand-dark bg-dot-pattern overflow-hidden" style={{ minHeight: '92vh' }}>
        <div className="relative z-10 max-w-7xl mx-auto min-h-[92vh] grid grid-cols-1 md:grid-cols-[1fr_440px] lg:grid-cols-[1fr_540px] items-stretch">

          {/* Left: text */}
          <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-28 md:py-20">
            <div className="flex items-center gap-3 mb-10 animate-fade-up">
              <div className="h-px w-6 bg-brand-yellow shrink-0" />
              <span className="font-mono text-micro text-zinc-500 tracking-[0.18em] uppercase">
                MG IM6 · Thailand · EV Aftermarket
              </span>
            </div>
            <h1 className="mb-8">
              <span className="animate-fade-up block font-black text-display text-zinc-100 leading-none">
                ชิ้นส่วนแต่งรถ EV
              </span>
              <div className="animate-fade-up-2 h-px w-12 bg-brand-yellow my-5" />
              <span className="animate-fade-up-2 block font-light text-display text-brand-yellow leading-none">
                ที่สุดท้ายมีแล้ว
              </span>
            </h1>
            <p className="animate-fade-up-3 text-zinc-500 text-body max-w-sm mb-10 leading-relaxed">
              ทดสอบจริงบน MG IM6 ก่อนทุกครั้ง<br />
              ไม่ขายของที่ตัวเองไม่กล้าใส่รถตัวเอง
            </p>
            <div className="animate-fade-up-3 flex flex-wrap gap-3">
              <Link to="/products"><Button variant="primary" size="lg">ดูสินค้า</Button></Link>
              <Button variant="secondary" size="lg" onClick={() => setWaitlistOpen(true)}>แจ้งเตือน</Button>
            </div>
          </div>

          {/* Right: image */}
          <div className="hidden md:block relative overflow-hidden">
            <img
              src="https://placehold.co/600x900/131312/E9FF22?text=MG+IM6"
              alt="MG IM6"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-transparent w-16" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-dark to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="font-mono text-micro text-zinc-600 tracking-[0.2em] uppercase">[ MG IM6 · 2024 ]</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 border-t border-zinc-800 bg-brand-dark/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 divide-x divide-zinc-800">
            {[
              { value: stats.products,  label: 'สินค้า' },
              { value: stats.carModels, label: 'รุ่นรถ' },
              { value: stats.installs,  label: 'ติดตั้งแล้ว' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-4">
                <span className="font-mono font-bold text-h2 text-brand-yellow tabular-nums">{value}</span>
                <span className="font-mono text-micro text-zinc-600 uppercase tracking-[0.1em]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products (light) ── */}
      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <SectionLabel index={1} label="FEATURED" />
              <h2 className="text-h2 font-black text-brand-dark">สินค้าแนะนำ</h2>
            </div>
            <Link to="/products" className="font-mono text-micro text-zinc-400 hover:text-brand-dark transition-colors tracking-wider uppercase border-b border-zinc-300 hover:border-brand-dark pb-0.5">
              ดูทั้งหมด →
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200">
              {featured.map(p => (
                <div key={p.id} className="bg-zinc-50">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-zinc-200 py-16 text-center">
              <p className="font-mono text-micro text-zinc-400 tracking-widest uppercase">กำลังโหลด...</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Community gallery (light, editorial) ── */}
      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <SectionLabel index={2} label="COMMUNITY BUILDS" />
              <h2 className="text-h2 font-black text-brand-dark">รูปจากลูกค้าจริง</h2>
            </div>
            <Link to="/gallery" className="font-mono text-micro text-zinc-400 hover:text-brand-dark transition-colors tracking-wider uppercase border-b border-zinc-300 hover:border-brand-dark pb-0.5">
              ดูแกลเลอรี่ →
            </Link>
          </div>

          {installs.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {installs.map(install => (
                <div key={install.id} className="break-inside-avoid group relative overflow-hidden mb-3 border border-zinc-100 hover:border-zinc-300 transition-colors">
                  <img
                    src={r2Url(install.image_key)}
                    alt={install.caption_th}
                    className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="font-mono text-micro text-zinc-200 tracking-wide">
                      {install.customer_name} · {install.car_model}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-zinc-200 py-16 text-center">
              <p className="font-mono text-micro text-zinc-400 tracking-widest uppercase">กำลังโหลด...</p>
            </div>
          )}
        </div>
      </section>

      {/* ── AI CTA (light) ── */}
      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <SectionLabel index={3} label="AI ASSIST" />
            <h2 className="text-h2 font-black text-brand-dark max-w-lg">
              ไม่รู้ว่าอะไรเหมาะกับรถคุณ?
            </h2>
            <p className="text-zinc-500 text-body">
              คุยกับ AI ของเราได้เลย ช่วยเช็คความเข้ากัน และหาชิ้นส่วนที่ใช่
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={onChatOpen} className="shrink-0">
            คุยกับเรา
          </Button>
        </div>
      </section>

      {waitlistOpen && <WaitlistModal onClose={() => setWaitlistOpen(false)} />}
    </div>
  )
}
