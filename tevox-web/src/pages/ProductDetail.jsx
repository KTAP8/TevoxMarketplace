import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import { useInstalls } from '../hooks/useInstalls'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import FitmentChecker from '../components/FitmentChecker'

const LINE_OA_ID = 'tevoxauto'

const SPEC_LABELS = {
  material:      'วัสดุ',
  weight_kg:     'น้ำหนัก',
  color_options: 'ตัวเลือกสี',
  size:          'ขนาด',
  pcd:           'PCD',
}

function useCountdown(closesAt) {
  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => {
    if (!closesAt) return
    function calc() {
      const diff = new Date(closesAt) - Date.now()
      if (diff <= 0) { setTimeLeft(null); return }
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
      })
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [closesAt])
  return timeLeft
}

function ImageGallery({ imageKeys }) {
  const images    = imageKeys?.length ? imageKeys.map(r2Url) : [r2Url(null)]
  const [active, setActive]     = useState(0)
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-2">
        <div
          className="aspect-[4/3] overflow-hidden cursor-zoom-in bg-zinc-100 border border-zinc-200"
          onClick={() => setLightbox(true)}
        >
          <img src={images[active]} alt="" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-14 h-14 overflow-hidden border-b-2 transition-colors ${
                  i === active ? 'border-brand-dark opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <img src={images[active]} alt="" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-4 right-4 font-mono text-micro text-zinc-500 hover:text-zinc-200 tracking-widest uppercase" onClick={() => setLightbox(false)}>
            [ ปิด ]
          </button>
        </div>
      )}
    </>
  )
}

function SpecsTable({ specs }) {
  if (!specs || !Object.keys(specs).length) return null
  return (
    <div className="flex flex-col gap-3 border border-zinc-200 bg-white p-4">
      <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase pb-3 border-b border-zinc-100">
        [ SPECIFICATIONS ]
      </p>
      <div className="flex flex-col">
        {Object.entries(specs).map(([key, val]) => (
          <div key={key} className="flex items-start gap-4 py-2.5 border-b border-zinc-100 last:border-0">
            <span className="font-mono text-micro text-zinc-400 tracking-wider uppercase w-28 shrink-0 pt-0.5">
              {SPEC_LABELS[key] ?? key}
            </span>
            <span className="font-mono text-caption text-brand-dark tabular-nums">
              {Array.isArray(val) ? val.join(' / ') : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const countdown = useCountdown(product?.preorder_closes_at)
  const { installs } = useInstalls({ product_id: id, limit: 4 })

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => { setProduct(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
      <p className="font-mono text-micro text-zinc-400 tracking-widest uppercase animate-pulse">LOADING...</p>
    </div>
  )

  if (!product) return (
    <div className="bg-zinc-50 min-h-screen flex flex-col items-center justify-center gap-5">
      <p className="font-mono text-micro text-zinc-400 tracking-widest uppercase">[ NOT FOUND ]</p>
      <Link to="/products"><Button variant="primary">กลับไปหน้าสินค้า</Button></Link>
    </div>
  )

  const price = Number(product.price_thb).toLocaleString('th-TH', { minimumFractionDigits: 0 })

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-micro text-zinc-400 mb-10 tracking-wider">
          <Link to="/products" className="hover:text-brand-dark transition-colors uppercase">CATALOG</Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-500 uppercase">{product.sku}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">

          {/* Left — images */}
          <ImageGallery imageKeys={product.image_keys} />

          {/* Right — info */}
          <div className="flex flex-col gap-5">

            {/* SKU + status */}
            <div className="flex items-start gap-3 pb-4 border-b border-zinc-200">
              <span className="font-mono text-micro text-zinc-400 tracking-[0.18em] uppercase pt-1">{product.sku}</span>
              <Badge status={product.status} />
            </div>

            {/* Name */}
            <h1 className="text-h2 font-black text-brand-dark leading-snug">{product.name_th}</h1>

            {/* Price + countdown */}
            <div className="flex items-baseline gap-4">
              <span className="font-mono font-bold text-display text-brand-dark tabular-nums">฿{price}</span>
              {countdown && product.status === 'preorder' && (
                <span className="font-mono text-micro text-zinc-400 tracking-wider">
                  ปิดรับใน {countdown.days}ว {countdown.hours}ชม
                </span>
              )}
            </div>

            {/* Description */}
            {product.description_th && (
              <p className="text-body text-zinc-500 leading-relaxed border-t border-zinc-200 pt-4">
                {product.description_th}
              </p>
            )}

            {/* Specs */}
            <SpecsTable specs={product.specs} />

            {/* Fitment note */}
            {product.fitment_notes_th && (
              <div className="border border-amber-200 bg-amber-50 p-4 flex flex-col gap-2">
                <p className="font-mono text-micro text-amber-600 tracking-[0.15em] uppercase">[ FITMENT NOTE ]</p>
                <p className="text-body text-amber-900 leading-relaxed">{product.fitment_notes_th}</p>
              </div>
            )}

            {/* Install notes */}
            {product.install_notes_th && (
              <div className="flex flex-col gap-1.5 border-t border-zinc-200 pt-4">
                <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">INSTALL NOTES</p>
                <p className="text-body text-zinc-500 leading-relaxed">{product.install_notes_th}</p>
              </div>
            )}

            {/* Fitment checker */}
            <FitmentChecker productId={product.id} />

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              {product.status !== 'coming_soon' && product.status !== 'sold_out' && (
                <a href={`https://line.me/ti/p/~${LINE_OA_ID}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="primary" size="lg" className="w-full">สั่งซื้อผ่าน Line</Button>
                </a>
              )}
              {product.status === 'coming_soon' && (
                <Button variant="secondary" size="lg" className="flex-1" disabled>เร็วๆ นี้</Button>
              )}
            </div>
          </div>
        </div>

        {/* Related installs */}
        {installs.length > 0 && (
          <section className="mt-20 pt-10 border-t border-zinc-200 flex flex-col gap-6">
            <div>
              <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase mb-1">[ COMMUNITY BUILDS ]</p>
              <h2 className="text-h2 font-black text-brand-dark">รูปจากลูกค้า</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200">
              {installs.map(install => (
                <div key={install.id} className="bg-zinc-50 group relative overflow-hidden">
                  <img
                    src={r2Url(install.image_key)}
                    alt={install.caption_th}
                    className="w-full aspect-square object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <p className="font-mono text-micro text-zinc-300 tracking-wide">{install.customer_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
