import { Link } from 'react-router-dom'

const siteLinks = [
  { to: '/products', label: 'สินค้า' },
  { to: '/gallery',  label: 'แกลเลอรี่' },
  { to: '/about',    label: 'เกี่ยวกับเรา' },
]

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.928v-8.437H7.078V12.07h3.047V9.428c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.437C19.612 23.093 24 18.098 24 12.073z"/>
    </svg>
  )
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-10 items-start">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <p className="text-caption text-zinc-500 max-w-xs leading-relaxed">
              ชิ้นส่วนแต่งรถ EV คุณภาพสูง ทดสอบจริงบน MG IM6<br />
              Built by owners. For owners.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-micro text-zinc-600 tracking-[0.15em] uppercase mb-1">
              NAVIGATE
            </p>
            {siteLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-caption text-zinc-400 hover:text-brand-yellow transition-colors w-fit"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-micro text-zinc-600 tracking-[0.15em] uppercase mb-1">
              FOLLOW
            </p>
            <div className="flex flex-col gap-3">
              {[
                { href: 'https://tiktok.com/@tevoxauto',  Icon: TikTokIcon,  label: 'TikTok' },
                { href: 'https://facebook.com/tevoxauto', Icon: FacebookIcon, label: 'Facebook' },
                { href: 'https://line.me/ti/p/~tevoxauto', Icon: LineIcon,   label: 'Line OA' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-zinc-400 hover:text-brand-yellow transition-colors text-caption"
                >
                  <Icon />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="border-t border-zinc-800 mt-10 pt-5 flex items-center justify-between gap-4 flex-wrap">
          <p className="font-mono text-micro text-zinc-700">
            © 2026 TEVOX AUTOMOTIVE · BKK, THAILAND
          </p>
          <p className="font-mono text-micro text-zinc-800">
            EV AFTERMARKET · COMMUNITY FIRST
          </p>
        </div>
      </div>
    </footer>
  )
}
