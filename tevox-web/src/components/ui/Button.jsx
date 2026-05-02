const variants = {
  primary:   'bg-brand-yellow text-brand-dark hover:brightness-105 active:scale-[0.97]',
  secondary: 'border border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark active:scale-[0.97]',
  ghost:     'text-zinc-400 hover:text-brand-yellow',
}

const sizes = {
  sm: 'px-4 py-2 text-caption tracking-wide',
  md: 'px-6 py-3 text-body tracking-wide',
  lg: 'px-8 py-4 text-h3 tracking-wide',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-none font-bold
        transition-all duration-100 cursor-pointer
        disabled:opacity-30 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
