import { useSearchParams, Link } from 'react-router-dom'

export default function OrderCancel() {
  const [searchParams] = useSearchParams()
  const productId      = searchParams.get('product_id')

  return (
    <div className="bg-zinc-50 min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full flex flex-col items-center gap-6 text-center">

        <div className="w-16 h-16 border-2 border-zinc-300 flex items-center justify-center">
          <svg width="28" height="28" fill="none" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round">
            <line x1="7" y1="7" x2="21" y2="21" />
            <line x1="21" y1="7" x2="7" y2="21" />
          </svg>
        </div>

        <div>
          <h1 className="text-h2 font-black text-brand-dark">ยกเลิกการชำระเงิน</h1>
          <p className="text-body text-zinc-500 mt-2 leading-relaxed">
            ยังไม่มีการตัดเงิน คุณสามารถกลับไปสั่งซื้อใหม่ได้เลยครับ
          </p>
        </div>

        <div className="flex gap-3 w-full">
          {productId && (
            <Link to={`/order/${productId}`} className="flex-1">
              <button className="w-full py-3 bg-brand-yellow text-brand-dark font-bold text-body hover:brightness-105 transition-all">
                ลองอีกครั้ง
              </button>
            </Link>
          )}
          <Link to="/products" className="flex-1">
            <button className="w-full py-3 border border-zinc-300 text-body text-zinc-600 hover:border-brand-dark hover:text-brand-dark transition-colors font-medium">
              กลับสู่หน้าสินค้า
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
