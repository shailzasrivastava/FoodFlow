import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Sun, Moon, Mountain } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const LINKS = [
  { to: '/',         label: 'Home',     end: true },
  { to: '/products', label: 'Products', end: false },
]

function navLinkClass({ isActive }) {
  return [
    'text-sm font-medium transition-colors duration-150 px-1 py-0.5',
    isActive
      ? 'text-saffron-500 dark:text-saffron-300'
      : 'text-pine-700 hover:text-pine-950 dark:text-parchment-200 dark:hover:text-white',
  ].join(' ')
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b border-pine-900/10 dark:border-parchment-50/10 bg-parchment-50/90 dark:bg-pine-950/90 backdrop-blur">
      <nav className="container-page flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-pine-950 dark:bg-saffron-400 text-saffron-400 dark:text-pine-950">
            <Mountain size={18} strokeWidth={2.25} />
          </span>
          <span className="font-display font-semibold text-lg tracking-tight text-pine-950 dark:text-parchment-50">
            HimShakti
          </span>
        </NavLink>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full p-2 text-pine-700 hover:bg-pine-900/5 dark:text-parchment-200 dark:hover:bg-parchment-50/10 transition-colors">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" onClick={() => setOpen(v => !v)} aria-label="Toggle menu"
            className="md:hidden rounded-full p-2 text-pine-700 hover:bg-pine-900/5 dark:text-parchment-200">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-pine-900/10 dark:border-parchment-50/10 bg-parchment-50 dark:bg-pine-950">
          <div className="container-page flex flex-col py-3 gap-1">
            {LINKS.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)}
                className={({ isActive }) => [
                  'rounded-lg px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-saffron-400/15 text-saffron-600 dark:text-saffron-300'
                           : 'text-pine-800 dark:text-parchment-100',
                ].join(' ')}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
