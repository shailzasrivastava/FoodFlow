import { NavLink, useLocation } from 'react-router-dom'
import { Mountain } from 'lucide-react'

export default function Footer() {
  const { pathname } = useLocation()
  const onProducts = pathname.startsWith('/products')

  const links = [
    { to: onProducts ? '/products' : '/', label: onProducts ? 'Products' : 'Home' },
    { to: '/about',   label: 'About' },
    { to: '/admin',   label: 'Login' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="bg-pine-950 text-parchment-200 mt-auto">
      <div className="container-page py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-saffron-400 text-pine-950">
            <Mountain size={15} strokeWidth={2.5} />
          </span>
          <span className="font-display font-semibold text-parchment-50">HimShakti</span>
        </div>

        <nav className="flex flex-wrap gap-6 text-sm text-parchment-300/80">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                isActive ? 'text-saffron-300' : 'hover:text-saffron-300 transition-colors'
              }>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <p className="text-xs text-parchment-300/50">
          © {new Date().getFullYear()} HimShakti Food Processing Unit
        </p>
      </div>
    </footer>
  )
}
