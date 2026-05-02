import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import { r2Url } from '../../lib/r2'

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

export default function ProductCard({ product }) {
  const { id, sku, name_th, price_thb, status, image_keys, preorder_closes_at } = product
  const imageUrl  = r2Url(image_keys?.[0])
  const countdown = useCountdown(preorder_closes_at)
  const price     = Number(price_thb).toLocaleString('th-TH', { minimumFractionDigits: 0 })

  return (
    <Link to={`/products/${id}`} className="group block">
      <article className="bg-white border border-zinc-200 group-hover:border-zinc-400 transition-colors duration-200 flex flex-col rounded-none overflow-hidden">

        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
          <img
            src={imageUrl}
            alt={name_th}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-micro text-zinc-400 tracking-widest pt-0.5">
              {sku}
            </span>
            <Badge status={status} />
          </div>

          <p className="text-brand-dark font-semibold text-body leading-snug line-clamp-2 group-hover:text-zinc-600 transition-colors duration-150">
            {name_th}
          </p>

          <div className="flex items-baseline justify-between border-t border-zinc-100 pt-3 mt-auto">
            <span className="font-mono font-bold text-h3 text-brand-dark tabular-nums">
              ฿{price}
            </span>
            {countdown && status === 'preorder' && (
              <span className="font-mono text-micro text-zinc-400 tabular-nums">
                ปิดใน {countdown.days}ว {countdown.hours}ชม
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
