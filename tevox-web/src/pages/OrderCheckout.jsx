import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import Badge from '../components/ui/Badge'

const inputCls = 'w-full border border-zinc-300 bg-white px-4 py-3 text-body text-zinc-800 focus:outline-none focus:border-brand-dark transition-colors'
const labelCls = 'text-caption text-zinc-500 font-mono tracking-wider uppercase'

export default function OrderCheckout() {
  const { productId } = useParams()
  const navigate      = useNavigate()

  const [product, setProduct]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    wants_shipping: false,
    addr_name: '', addr_line1: '', addr_line2: '',
    addr_district: '', addr_province: '', addr_postal: '',
  })

  useEffect(() => {
    supabase
      .from('products')
      .select('id, sku, name_th, price_thb, deposit_thb, installation_price, status, image_keys')
      .eq('id', productId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { navigate('/products'); return }
        if (data.status === 'sold_out' || data.status === 'coming_soon') {
          navigate(`/products/${productId}`)
          return
        }
        setProduct(data)
        setLoading(false)
      })
  }, [productId])

  const f = (field) => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'apikey':        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            product_id:      product.id,
            customer_name:   form.name.trim(),
            customer_email:  form.email.trim(),
            customer_phone:  form.phone.trim() || null,
            wants_shipping:  form.wants_shipping,
            shipping_address: form.wants_shipping ? {
              name:         form.addr_name.trim(),
              address_line1: form.addr_line1.trim(),
              address_line2: form.addr_line2.trim() || null,
              district:     form.addr_district.trim(),
              province:     form.addr_province.trim(),
              postal_code:  form.addr_postal.trim(),
            } : null,
          }),
        },
      )

      const json = await res.json()
      if (json.error) throw new Error(json.error)
      // Persist email so OrderSuccess can pass it to get-order for ownership check
      sessionStorage.setItem('checkout_email', form.email.trim().toLowerCase())
      window.location.href = json.url
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
        <p className="font-mono text-micro text-zinc-400 tracking-widest uppercase animate-pulse">[ กำลังโหลด... ]</p>
      </div>
    )
  }

  const deposit   = Number(product.deposit_thb ?? product.price_thb)
  const total     = Number(product.price_thb)
  const remaining = total - deposit
  const heroImage = product.image_keys?.[0] ? r2Url(product.image_keys[0]) : r2Url(null)

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-micro text-zinc-400 mb-8 tracking-wider">
          <Link to={`/products/${product.id}`} className="hover:text-brand-dark transition-colors uppercase">
            {product.sku}
          </Link>
          <span>/</span>
          <span className="text-zinc-500 uppercase">สั่งซื้อ</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left — order summary */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Product card */}
            <div className="bg-white border border-zinc-200 overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={heroImage} alt={product.name_th} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-micro text-zinc-400 tracking-widest uppercase">{product.sku}</span>
                  <Badge status={product.status} />
                </div>
                <p className="text-body font-bold text-brand-dark leading-snug">{product.name_th}</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-white border border-zinc-200 p-5 flex flex-col gap-3">
              <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase border-b border-zinc-100 pb-3">
                สรุปยอดชำระ
              </p>
              <div className="flex justify-between items-center text-body">
                <span className="text-zinc-500">ราคาสินค้า</span>
                <span className="font-mono text-zinc-700">฿{total.toLocaleString('th-TH')}</span>
              </div>
              {product.installation_price && (
                <div className="flex justify-between items-center text-caption text-zinc-400">
                  <span>ค่าติดตั้ง (ชำระที่ร้าน)</span>
                  <span className="font-mono">฿{Number(product.installation_price).toLocaleString('th-TH')}</span>
                </div>
              )}
              <div className="border-t border-zinc-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-body font-bold text-brand-dark">มัดจำวันนี้</span>
                  <span className="font-mono font-bold text-h3 text-brand-dark">฿{deposit.toLocaleString('th-TH')}</span>
                </div>
                {remaining > 0 && (
                  <p className="text-caption text-zinc-400 mt-1">
                    ส่วนที่เหลือ ฿{remaining.toLocaleString('th-TH')} ชำระที่ร้าน (บางกระดี่)
                  </p>
                )}
              </div>
            </div>

            {/* Info note */}
            <div className="bg-amber-50 border border-amber-200 p-4">
              <p className="text-caption text-amber-700 leading-relaxed">
                การวางมัดจำนี้ยืนยันการจอง ทีมงานจะติดต่อกลับภายใน 24 ชม. เพื่อนัดหมายการติดตั้ง / จัดส่ง
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Customer info */}
              <div className="bg-white border border-zinc-200 p-6 flex flex-col gap-4">
                <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">ข้อมูลผู้สั่งซื้อ</p>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>ชื่อ-นามสกุล *</label>
                  <input {...f('name')} required placeholder="กรุณากรอกชื่อ-นามสกุล" className={inputCls} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>อีเมล *</label>
                  <input {...f('email')} required type="email" placeholder="example@email.com" className={inputCls} />
                  <p className="text-micro text-zinc-400">ใบเสร็จและการยืนยันคำสั่งซื้อจะส่งไปที่อีเมลนี้</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>เบอร์โทรศัพท์</label>
                  <input {...f('phone')} type="tel" placeholder="08X-XXX-XXXX" className={inputCls} />
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white border border-zinc-200 p-6 flex flex-col gap-4">
                <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">การรับสินค้า</p>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.wants_shipping}
                    onChange={e => setForm(p => ({ ...p, wants_shipping: e.target.checked }))}
                    className="mt-1 w-4 h-4 accent-brand-dark"
                  />
                  <div>
                    <p className="text-body text-zinc-700 font-medium">ต้องการจัดส่งทางไปรษณีย์</p>
                    <p className="text-caption text-zinc-400 mt-0.5">ไม่ติ๊ก = รับสินค้าที่ร้าน / ติดตั้งที่บางกระดี่</p>
                  </div>
                </label>

                {form.wants_shipping && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-zinc-100">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>ชื่อ-นามสกุล ผู้รับ *</label>
                      <input {...f('addr_name')} required={form.wants_shipping} placeholder="ชื่อผู้รับ" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>ที่อยู่ *</label>
                      <input {...f('addr_line1')} required={form.wants_shipping} placeholder="บ้านเลขที่ ถนน" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>ที่อยู่ (บรรทัด 2)</label>
                      <input {...f('addr_line2')} placeholder="หมู่บ้าน อาคาร ชั้น (ถ้ามี)" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>เขต / อำเภอ *</label>
                        <input {...f('addr_district')} required={form.wants_shipping} placeholder="บางกระดี่" className={inputCls} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>จังหวัด *</label>
                        <input {...f('addr_province')} required={form.wants_shipping} placeholder="กรุงเทพมหานคร" className={inputCls} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>รหัสไปรษณีย์ *</label>
                      <input {...f('addr_postal')} required={form.wants_shipping} placeholder="10150" maxLength={5} className={inputCls} />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-caption text-red-500 font-mono">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 font-bold text-body tracking-wide transition-all ${
                  submitting
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-brand-yellow text-brand-dark hover:brightness-105 active:scale-[0.98] cursor-pointer'
                }`}
              >
                {submitting
                  ? 'กำลังเชื่อมต่อ Stripe...'
                  : `ดำเนินการชำระมัดจำ ฿${deposit.toLocaleString('th-TH')}`}
              </button>

              <p className="text-micro text-zinc-400 text-center leading-relaxed">
                ชำระเงินผ่าน Stripe — เข้ารหัส SSL ปลอดภัย ไม่มีการเก็บข้อมูลบัตร
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
