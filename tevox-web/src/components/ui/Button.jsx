const variants = {
  primary: 'bg-brand-yellow text-brand-dark hover:brightness-110',
  secondary: 'bg-transparent border border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark',
  ghost: 'bg-transparent text-brand-light hover:text-brand-yellow',
}

const sizes = {
  sm: 'px-3 py-1.5 text-caption',
  md: 'px-5 py-2.5 text-body',
  lg: 'px-7 py-3.5 text-h3',
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
        inline-flex items-center justify-center gap-2 rounded font-semibold
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
