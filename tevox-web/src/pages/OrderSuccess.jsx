import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

export default function OrderSuccess() {
  const [searchParams]      = useSearchParams()
  const sessionId           = searchParams.get('session_id')
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order?session_id=${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey':        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      },
    )
      .then(r => r.json())
      .then(({ order }) => { setOrder(order ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sessionId])

  return (
    <div className="bg-zinc-50 min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full flex flex-col gap-8">

        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-brand-yellow flex items-center justify-center">
            <svg width="28" height="28" fill="none" stroke="#1D1C1D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,14 11,21 24,7" />
            </svg>
          </div>
          <div>
            <h1 className="text-h2 font-black text-brand-dark">ชำระมัดจำสำเร็จ</h1>
            <p className="text-body text-zinc-500 mt-2">
              เราได้รับการชำระเงินของคุณแล้ว อีเมลยืนยันถูกส่งไปยังกล่องจดหมายของคุณแล้ว
            </p>
          </div>
        </div>

        {/* Order details */}
        {!loading && order && (
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
            <div className="px-5 py-3">
              <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">รายละเอียดคำสั่งซื้อ</p>
            </div>
            <Row label="สินค้า"        value={order.product_name_th} bold />
            <Row label="SKU"           value={order.product_sku} mono />
            <Row label="ลูกค้า"        value={order.customer_name} />
            <Row label="อีเมล"         value={order.customer_email} />
            <Row label="มัดจำที่ชำระ"  value={`฿${Number(order.deposit_paid).toLocaleString('th-TH')}`} bold green />
            <Row label="ยอดค้าง (ที่ร้าน)" value={`฿${(Number(order.total_price) - Number(order.deposit_paid)).toLocaleString('th-TH')}`} />
            {order.wants_shipping && order.shipping_address && (
              <div className="px-5 py-3 flex flex-col gap-0.5">
                <p className="text-caption text-zinc-400 font-mono tracking-wider uppercase">ที่อยู่จัดส่ง</p>
                <p className="text-body text-zinc-700">{order.shipping_address.name}</p>
                <p className="text-caption text-zinc-500">{order.shipping_address.address_line1}{order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ''}</p>
                <p className="text-caption text-zinc-500">{order.shipping_address.district}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
              </div>
            )}
            {!order.wants_shipping && (
              <Row label="การรับสินค้า" value="รับที่ร้าน / ติดตั้งบางกระดี่" />
            )}
          </div>
        )}

        {loading && (
          <div className="bg-white border border-zinc-200 p-8 flex justify-center">
            <p className="font-mono text-micro text-zinc-400 tracking-widest animate-pulse">[ กำลังโหลด... ]</p>
          </div>
        )}

        {/* Next steps */}
        <div className="bg-white border border-zinc-200 p-5 flex flex-col gap-2">
          <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">ขั้นตอนต่อไป</p>
          <p className="text-body text-zinc-600 leading-relaxed">
            ทีมงานจะติดต่อกลับภายใน 24 ชม. เพื่อนัดหมายการติดตั้ง หรือยืนยันการจัดส่งครับ
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/products" className="flex-1">
            <button className="w-full py-3 border border-zinc-300 text-body text-zinc-600 hover:border-brand-dark hover:text-brand-dark transition-colors font-medium">
              กลับสู่หน้าสินค้า
            </button>
          </Link>
          <Link to="/" className="flex-1">
            <button className="w-full py-3 bg-brand-yellow text-brand-dark font-bold text-body hover:brightness-105 transition-all">
              หน้าหลัก
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}

function Row({ label, value, bold, mono, green }) {
  return (
    <div className="px-5 py-3 flex justify-between items-center gap-4">
      <span className="text-caption text-zinc-400 shrink-0">{label}</span>
      <span className={`text-right ${bold ? 'font-bold' : ''} ${mono ? 'font-mono' : ''} ${green ? 'text-emerald-600' : 'text-zinc-700'} text-body`}>
        {value}
      </span>
    </div>
  )
}
