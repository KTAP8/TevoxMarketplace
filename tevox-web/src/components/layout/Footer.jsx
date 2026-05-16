import { Link } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'

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

function MessengerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
    </svg>
  )
}

export default function Footer() {
  const { settings } = useSettings()

  const socialLinks = [
    settings.tiktok_url    && { href: settings.tiktok_url,    Icon: TikTokIcon,    label: 'TikTok' },
    settings.facebook_url  && { href: settings.facebook_url,  Icon: FacebookIcon,  label: 'Facebook' },
    settings.messenger_url && { href: settings.messenger_url, Icon: MessengerIcon, label: 'Messenger' },
  ].filter(Boolean)

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
              {socialLinks.map(({ href, Icon, label }) => (
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
