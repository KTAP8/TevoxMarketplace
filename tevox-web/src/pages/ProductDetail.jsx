import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import { useInstalls } from '../hooks/useInstalls'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const LINE_OA_ID = 'tevoxauto'

const SPEC_LABELS = {
  material:      'วัสดุ',
  weight_kg:     'น้ำหนัก (kg)',
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
  const images = imageKeys?.length ? imageKeys.map(r2Url) : [r2Url(null)]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3">
        <div
          className="aspect-[4/3] rounded-lg overflow-hidden cursor-zoom-in bg-zinc-900"
          onClick={() => setLightbox(true)}
        >
          <img src={images[active]} alt="" className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                  i === active ? 'border-brand-yellow' : 'border-transparent'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img src={images[active]} alt="" className="max-w-full max-h-full rounded-lg object-contain" />
          <button className="absolute top-4 right-4 text-white text-h2">×</button>
        </div>
      )}
    </>
  )
}

function SpecsTable({ specs }) {
  if (!specs || !Object.keys(specs).length) return null
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-h3 font-semibold text-brand-dark">สเปคสินค้า</h3>
      <table className="w-full text-body border-collapse">
        <tbody>
          {Object.entries(specs).map(([key, val]) => (
            <tr key={key} className="border-b border-zinc-200">
              <td className="py-2 pr-4 text-zinc-500 w-40">{SPEC_LABELS[key] ?? key}</td>
              <td className="py-2 text-brand-dark font-medium">
                {Array.isArray(val) ? val.join(', ') : String(val)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="bg-brand-light min-h-screen flex items-center justify-center">
      <div className="text-zinc-400 text-body">กำลังโหลด...</div>
    </div>
  )

  if (!product) return (
    <div className="bg-brand-light min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-500 text-body">ไม่พบสินค้านี้</p>
      <Link to="/products"><Button variant="secondary">กลับไปหน้าสินค้า</Button></Link>
    </div>
  )

  const price = Number(product.price_thb).toLocaleString('th-TH', { minimumFractionDigits: 0 })

  return (
    <div className="bg-brand-light min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="text-caption text-zinc-400 mb-8 flex gap-2">
          <Link to="/products" className="hover:text-brand-blue">สินค้า</Link>
          <span>/</span>
          <span className="text-brand-dark">{product.sku}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* Left — images */}
          <ImageGallery imageKeys={product.image_keys} />

          {/* Right — info */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <span className="font-mono text-caption text-brand-yellow bg-brand-dark px-2 py-0.5 rounded-pill">
                {product.sku}
              </span>
              <Badge status={product.status} />
            </div>

            <h1 className="text-h2 font-bold text-brand-dark leading-snug">{product.name_th}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-display font-black text-brand-dark">฿{price}</span>
              {countdown && product.status === 'preorder' && (
                <span className="text-caption text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-pill">
                  ปิดรับใน {countdown.days}ว {countdown.hours}ชม
                </span>
              )}
            </div>

            {product.description_th && (
              <p className="text-body text-zinc-600 leading-relaxed">{product.description_th}</p>
            )}

            <SpecsTable specs={product.specs} />

            {product.fitment_notes_th && (
              <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-4 flex flex-col gap-1">
                <p className="text-caption font-semibold text-brand-dark">ความเข้ากันได้</p>
                <p className="text-body text-zinc-700">{product.fitment_notes_th}</p>
              </div>
            )}

            {product.install_notes_th && (
              <div className="flex flex-col gap-1">
                <p className="text-caption font-semibold text-zinc-500 uppercase tracking-wide">หมายเหตุการติดตั้ง</p>
                <p className="text-body text-zinc-600">{product.install_notes_th}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {product.status !== 'coming_soon' && product.status !== 'sold_out' && (
                <a
                  href={`https://line.me/ti/p/~${LINE_OA_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
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
          <section className="mt-16 flex flex-col gap-6">
            <h2 className="text-h2 font-bold text-brand-dark">รูปจากลูกค้า</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {installs.map(install => (
                <div key={install.id} className="rounded-lg overflow-hidden bg-brand-dark">
                  <img
                    src={r2Url(install.image_key)}
                    alt={install.caption_th}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2">
                    <p className="text-caption text-zinc-400">{install.customer_name}</p>
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
