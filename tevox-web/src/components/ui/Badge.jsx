const STATUS_MAP = {
  preorder:    { label: 'พรีออเดอร์', cls: 'bg-brand-yellow text-brand-dark border-brand-yellow' },
  available:   { label: 'มีสินค้า',   cls: 'text-emerald-700 border-emerald-400 bg-emerald-50' },
  sold_out:    { label: 'หมดแล้ว',    cls: 'text-zinc-500 border-zinc-300 bg-zinc-50' },
  coming_soon: { label: 'เร็วๆ นี้',   cls: 'text-brand-blue border-brand-blue/50 bg-brand-blue/5' },
}

export default function Badge({ status, children, className = '' }) {
  const config = STATUS_MAP[status]
  if (!config && !children) return null

  return (
    <span
      className={`
        inline-block rounded-none border px-2 py-0.5 font-mono text-micro tracking-wider
        ${config ? config.cls : 'text-zinc-500 border-zinc-300 bg-zinc-50'}
        ${className}
      `}
    >
      {config ? `[ ${config.label} ]` : children}
    </span>
  )
}
