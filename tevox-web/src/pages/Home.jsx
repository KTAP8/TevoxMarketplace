import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import { cacheGet, cacheSet } from '../lib/cache'
import { useProducts } from '../hooks/useProducts'
import { useInstalls } from '../hooks/useInstalls'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'
import HeroSearch from '../components/HeroSearch'

const STATS_KEY = 'home:stats'
const STATS_TTL = 5 * 60 * 1000

function useStats() {
  const [stats, setStats] = useState(() => cacheGet(STATS_KEY) ?? { products: 0, carModels: 0, installs: 0 })

  useEffect(() => {
    if (cacheGet(STATS_KEY)) return
    async function load() {
      const [
        { count: productCount },
        { data: carModelRows },
        { count: installCount },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).neq('status', 'coming_soon'),
        supabase.from('products').select('car_model').neq('status', 'coming_soon'),
        supabase.from('installs').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      ])
      const uniqueModels = new Set(carModelRows?.map(r => r.car_model) ?? []).size
      const result = { products: productCount ?? 0, carModels: uniqueModels, installs: installCount ?? 0 }
      cacheSet(STATS_KEY, result, STATS_TTL)
      setStats(result)
    }
    load()
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
                <polyline points="2,10 8,16 18,4" stroke="#E9FF22" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
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
                <p className="text-zinc-500 text-caption mt-1">แจ้งรุ่นรถของคุณ — เราจะพัฒนาสินค้าให้ตรงกับความต้องการ</p>
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
                <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">รุ่นรถของคุณ <span className="text-brand-dark">*</span></label>
                <input
                  type="text"
                  list="wl-car-models"
                  value={form.car_model}
                  onChange={e => setForm(f => ({ ...f, car_model: e.target.value }))}
                  placeholder="เช่น MG IM6, BYD Seal, Tesla Model 3..."
                  required
                  className={inputClass}
                />
                <datalist id="wl-car-models">
                  {carModels.map(m => <option key={m} value={m} />)}
                </datalist>
                <p className="font-mono text-micro text-zinc-400 tracking-wider">พิมพ์รุ่นที่ต้องการ แม้ยังไม่มีในรายการ</p>
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
      <span className="font-mono text-micro text-zinc-400 tabular-nums">[ {String(index).padStart(2, '0')} ]</span>
      <div className="h-px w-8 bg-zinc-300" />
      <span className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">{label}</span>
    </div>
  )
}

// Tech Count Up animation helper
function CountUp({ end, duration = 1200 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!end || end === 0) return
    let startTime = null
    let frameId = null

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const progressRatio = Math.min(progress / duration, 1)
      
      // Easing: easeOutQuad
      const easedRatio = progressRatio * (2 - progressRatio)
      setCount(Math.floor(easedRatio * end))

      if (progress < duration) {
        frameId = requestAnimationFrame(step)
      }
    }

    frameId = requestAnimationFrame(step)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [end, duration])

  return <>{count}</>
}

export default function Home({ onChatOpen }) {
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const stats = useStats()
  const { products } = useProducts({ excludeStatus: 'coming_soon' })
  const { installs } = useInstalls({ limit: 6 })
  const featured = products.slice(0, 3)

  const suggestions = [
    ...[...new Set(products.map(p => p.car_model))].slice(0, 3),
    ...[...new Set(products.map(p => p.category))].slice(0, 2),
  ].slice(0, 5)

  // Trigger intersection observer for scroll reveal animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.05
    }

    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          observer.unobserve(entry.target) // stop observing once visible
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    const targets = document.querySelectorAll('.reveal')
    targets.forEach(t => observer.observe(t))

    return () => {
      observer.disconnect()
    }
  }, [products, installs])

  return (
    <div className="flex flex-col">

      {/* ── Hero (dark, search-centric) ── */}
      <section className="relative bg-brand-dark overflow-hidden flex flex-col" style={{ minHeight: '90vh' }}>

        {/* Background car image & Effects */}
        <img
          src="https://pub-8e41e2b3a9c54834a89b577b2c07cb83.r2.dev/heroCarImg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 pointer-events-none select-none mix-blend-luminosity scale-105 animate-[pulse_10s_ease-in-out_infinite]"
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-dark pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-yellow/15 rounded-full blur-[140px] pointer-events-none opacity-50" />

        {/* Tech Animations overlays */}
        <div className="absolute inset-0 tech-grid-pulse pointer-events-none z-10" />

        {/* Content */}
        <div className="relative z-30 flex flex-col items-center justify-center flex-1 px-6 py-20 mt-12 text-center">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8 animate-fade-up">
            <div className="h-px w-8 bg-brand-yellow/80 shrink-0" />
            <span className="font-mono text-micro text-brand-yellow/80 tracking-[0.2em] uppercase font-bold">
              EV Aftermarket · Bangkok Thailand
            </span>
            <div className="h-px w-8 bg-brand-yellow/80 shrink-0" />
          </div>

          {/* Headline */}
          <h1 className="mb-10 animate-fade-up-2 relative">
            <span className="block font-black text-display text-zinc-100 leading-none drop-shadow-xl">
              หาชิ้นส่วนแต่ง
            </span>
            <span className="block font-light text-display text-brand-yellow leading-none mt-2 drop-shadow-xl">
              รถ EV ของคุณ
            </span>
          </h1>

          {/* Search bar — focal point */}
          <div className="w-full max-w-2xl animate-fade-up-3 relative z-20">
            <HeroSearch products={products} suggestions={suggestions} onChatOpen={onChatOpen} />
          </div>

          {/* Secondary CTAs */}
          <div className="animate-fade-up-4 flex items-center gap-8 mt-10">
            <Link
              to="/products"
              className="group flex items-center gap-2 font-mono text-caption text-zinc-400 hover:text-brand-yellow transition-all tracking-wider"
            >
              <span className="border-b border-zinc-700 group-hover:border-brand-yellow pb-0.5 transition-colors">ดูสินค้าทั้งหมด</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <span className="text-zinc-700 text-micro">/</span>
            <button
              onClick={() => setWaitlistOpen(true)}
              className="group flex items-center gap-2 font-mono text-caption text-zinc-400 hover:text-brand-yellow transition-all tracking-wider"
            >
              <span className="border-b border-zinc-700 group-hover:border-brand-yellow pb-0.5 transition-colors">แจ้งเตือนสินค้าใหม่</span>
              <span className="group-hover:-translate-y-0.5 transition-transform">↗</span>
            </button>
          </div>

        </div>

        {/* Floating Stats strip */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-12 animate-fade-up-4">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-lg p-6 sm:p-8 grid grid-cols-3 divide-x divide-zinc-700/50 shadow-2xl">
            {[
              { value: stats.products, label: 'สินค้า' },
              { value: stats.carModels, label: 'รุ่นรถ' },
              { value: stats.installs, label: 'ติดตั้งแล้ว' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 px-4 group">
                <span className="font-mono font-black text-h2 text-brand-yellow tabular-nums group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                  <CountUp end={value} />
                </span>
                <span className="font-mono text-micro text-zinc-400 uppercase tracking-[0.15em] group-hover:text-zinc-300 transition-colors">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products (light) ── */}
      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8 reveal">
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
              {featured.map((p, idx) => (
                <div key={p.id} className={`bg-zinc-50 reveal reveal-delay-${idx + 1}`}>
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
          <div className="flex items-end justify-between mb-8 reveal">
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
              {installs.map((install, idx) => (
                <div
                  key={install.id}
                  className={`break-inside-avoid group relative overflow-hidden mb-3 border border-zinc-100 hover:border-zinc-300 transition-colors reveal reveal-delay-${(idx % 3) + 1}`}
                >
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
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 reveal">
          <div className="flex flex-col gap-3">
            <SectionLabel index={3} label="AI ASSIST" />
            <h2 className="text-h2 font-black text-brand-dark max-w-lg">
              ไม่รู้ว่าอะไรเหมาะกับรถคุณ?
            </h2>
            <p className="text-zinc-500 text-body">
              คุยกับ AI ของเราได้เลย ช่วยเช็คความเข้ากัน และหาชิ้นส่วนที่ใช่
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={onChatOpen} className="shrink-0 shadow-[0_0_15px_rgba(233,255,34,0.1)] hover:shadow-[0_0_25px_rgba(233,255,34,0.3)] transition-all">
            คุยกับเรา
          </Button>
        </div>
      </section>

      {waitlistOpen && <WaitlistModal onClose={() => setWaitlistOpen(false)} />}
    </div>
  )
}
