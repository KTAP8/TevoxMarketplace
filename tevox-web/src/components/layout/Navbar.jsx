import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/products', label: 'สินค้า' },
  { to: '/gallery',  label: 'แกลเลอรี่' },
  { to: '/about',    label: 'เกี่ยวกับเรา' },
]

export default function Navbar({ onChatOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-body font-medium transition-colors ${
      isActive ? 'text-brand-yellow' : 'text-brand-light hover:text-brand-yellow'
    }`

  return (
    <header className="sticky top-0 z-40 bg-brand-dark border-b border-zinc-800">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <svg width="120" height="28" viewBox="0 0 120 28" fill="none" aria-label="Tevox">
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
          <span className="text-caption text-zinc-500 hidden sm:block tracking-widest uppercase">
            Automotive
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
          <button
            onClick={onChatOpen}
            className="flex items-center gap-1.5 bg-brand-yellow text-brand-dark px-3 py-1.5 rounded text-caption font-bold hover:brightness-110 transition-all"
          >
            💬 คุยกับเรา
          </button>
        </div>

        {/* Mobile: chat + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onChatOpen}
            className="text-brand-yellow text-h3"
            aria-label="เปิดแชท"
          >
            💬
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="text-brand-light p-1"
            aria-label="เมนู"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen ? (
                <>
                  <line x1="3" y1="3" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="19" y1="3" x2="3" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="6"  x2="19" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-brand-dark px-4 py-4 flex flex-col gap-4">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
