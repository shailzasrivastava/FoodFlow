import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about"    element={<About />} />
        <Route path="/contact"  element={<Contact />} />
        <Route path="/admin"    element={<Admin />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center font-body text-pine-950 dark:text-parchment-50 dark:bg-pine-950">
            <p>Page not found.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
