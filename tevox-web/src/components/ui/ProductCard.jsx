import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import Button from './Button'
import { r2Url } from '../../lib/r2'

function useCountdown(closesAt) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!closesAt) return

    function calc() {
      const diff = new Date(closesAt) - Date.now()
      if (diff <= 0) { setTimeLeft(null); return }
      const days  = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      setTimeLeft({ days, hours })
    }

    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [closesAt])

  return timeLeft
}

export default function ProductCard({ product }) {
  const {
    id, sku, name_th, price_thb, status,
    image_keys, preorder_closes_at,
  } = product

  const imageUrl  = r2Url(image_keys?.[0])
  const countdown = useCountdown(preorder_closes_at)

  const priceFormatted = Number(price_thb).toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <div className="bg-brand-dark rounded overflow-hidden border border-zinc-800 hover:border-brand-yellow/50 transition-colors flex flex-col">
      <div className="aspect-[3/2] overflow-hidden">
        <img
          src={imageUrl}
          alt={name_th}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-caption text-brand-yellow bg-brand-yellow/10 px-1.5 py-0.5 rounded-pill">
            {sku}
          </span>
          <Badge status={status} />
        </div>

        <p className="text-brand-light font-semibold text-body leading-snug flex-1">
          {name_th}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-brand-yellow font-bold text-h3">
            ฿{priceFormatted}
          </span>
          {countdown && status === 'preorder' && (
            <span className="text-caption text-zinc-400">
              ปิดใน {countdown.days}ว {countdown.hours}ชม
            </span>
          )}
        </div>

        <Link to={`/products/${id}`} className="mt-auto">
          <Button variant="secondary" size="sm" className="w-full">
            ดูรายละเอียด
          </Button>
        </Link>
      </div>
    </div>
  )
}
