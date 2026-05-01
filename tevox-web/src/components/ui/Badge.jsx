const STATUS_MAP = {
  preorder:     { label: 'พรีออเดอร์', classes: 'bg-brand-yellow text-brand-dark' },
  available:    { label: 'มีสินค้า',   classes: 'bg-green-500 text-white' },
  sold_out:     { label: 'หมดแล้ว',    classes: 'bg-zinc-500 text-white' },
  coming_soon:  { label: 'เร็วๆ นี้',   classes: 'bg-brand-blue text-white' },
}

export default function Badge({ status, children, className = '' }) {
  const config = STATUS_MAP[status]

  if (!config && !children) return null

  return (
    <span
      className={`
        inline-block rounded-pill px-2 py-0.5 text-caption font-semibold tracking-wide
        ${config ? config.classes : 'bg-zinc-700 text-brand-light'}
        ${className}
      `}
    >
      {config ? config.label : children}
    </span>
  )
}
