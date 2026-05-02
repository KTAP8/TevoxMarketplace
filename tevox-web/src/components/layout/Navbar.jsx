import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import tevoxLogo from '../../assets/Tevox_Horizontal_Logo.png'

const navLinks = [
  { to: '/products', label: 'สินค้า' },
  { to: '/gallery',  label: 'แกลเลอรี่' },
  { to: '/about',    label: 'เกี่ยวกับเรา' },
]

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h11a2 2 0 012 2v7a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" clipRule="evenodd" />
    </svg>
  )
}

export default function Navbar({ onChatOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `font-mono text-micro tracking-[0.12em] uppercase transition-colors ${
      isActive
        ? 'text-brand-yellow border-b border-brand-yellow pb-0.5'
        : 'text-zinc-400 hover:text-zinc-100'
    }`

  return (
    <header className="sticky top-0 z-40 bg-brand-dark border-b border-zinc-800">
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center">
          <img src={tevoxLogo} alt="Tevox Automotive" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button
            onClick={onChatOpen}
            className="flex items-center gap-2 bg-brand-yellow text-brand-dark px-4 py-2 rounded-none font-bold text-caption tracking-wide hover:brightness-105 transition-all"
          >
            <ChatIcon />
            คุยกับเรา
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={onChatOpen}
            className="text-brand-yellow"
            aria-label="เปิดแชท"
          >
            <ChatIcon />
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="text-zinc-400 hover:text-zinc-100 p-1"
            aria-label="เมนู"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                <line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="2" y1="5"  x2="18" y2="5"  stroke="currentColor" strokeWidth="1.5"/>
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-brand-dark">
          <div className="px-6 py-6 flex flex-col gap-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-h3 font-bold transition-colors ${isActive ? 'text-brand-yellow' : 'text-zinc-300 hover:text-zinc-100'}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onChatOpen() }}
              className="flex items-center gap-2 bg-brand-yellow text-brand-dark px-5 py-3 rounded-none font-bold text-body w-fit tracking-wide hover:brightness-105 transition-all"
            >
              <ChatIcon />
              คุยกับเรา
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
