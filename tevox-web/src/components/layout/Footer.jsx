import { Link } from 'react-router-dom'

const siteLinks = [
  { to: '/products', label: 'สินค้า' },
  { to: '/gallery',  label: 'แกลเลอรี่' },
  { to: '/about',    label: 'เกี่ยวกับเรา' },
]

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.928v-8.437H7.078V12.07h3.047V9.428c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.437C19.612 23.093 24 18.098 24 12.073z"/>
    </svg>
  )
}

function LineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Logo + tagline */}
        <div className="flex flex-col gap-3">
          <svg width="100" height="24" viewBox="0 0 120 28" fill="none" aria-label="Tevox">
            <text
              x="0" y="22"
              fontFamily="FC Vision, Arial, sans-serif"
              fontSize="22"
              fontWeight="800"
              fill="#E9FF22"
              letterSpacing="-0.5"
            >
              TEVOX
            </text>
          </svg>
          <p className="text-caption text-zinc-500 leading-relaxed">
            Built by Engineers.<br />Driven by Passion.
          </p>
        </div>

        {/* Site links */}
        <div className="flex flex-col gap-3">
          <p className="text-caption font-semibold text-zinc-400 uppercase tracking-widest">
            เมนู
          </p>
          {siteLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-body text-zinc-400 hover:text-brand-yellow transition-colors w-fit"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Social */}
        <div className="flex flex-col gap-3">
          <p className="text-caption font-semibold text-zinc-400 uppercase tracking-widest">
            ติดตามเรา
          </p>
          <div className="flex gap-4">
            <a
              href="https://tiktok.com/@tevoxauto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-brand-yellow transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon />
            </a>
            <a
              href="https://facebook.com/tevoxauto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-brand-yellow transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://line.me/ti/p/~tevoxauto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-brand-yellow transition-colors"
              aria-label="Line OA"
            >
              <LineIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-4 text-center text-caption text-zinc-600">
        © 2026 Tevox Automotive · BKK, Thailand
      </div>
    </footer>
  )
}
