import { useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Loader } from '../components/ui'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import useApi from '../hooks/useApi'
import api from '../utils/api'
import { buildWhatsAppLink, buildMultiWhatsAppLink } from '../utils/whatsapp'
import { ShoppingBag, X, Search, AlertCircle, Package } from 'lucide-react'

function ProductCard({ product, selected, onToggle, onClick }) {
  return (
    <div className={`group relative rounded-2xl border bg-white dark:bg-pine-900 overflow-hidden shadow-soft transition-all duration-200 hover:-translate-y-1 cursor-pointer
      ${selected ? 'border-saffron-400 ring-2 ring-saffron-400/40' : 'border-pine-900/10 dark:border-parchment-50/10'}`}
      onClick={() => onClick(product)}>

      {/* Checkbox */}
      <button type="button"
        onClick={e => { e.stopPropagation(); onToggle(product) }}
        className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full border-2 border-white bg-white/80 dark:bg-pine-800/80 dark:border-pine-600 flex items-center justify-center shadow transition-colors"
        aria-label={selected ? 'Deselect' : 'Select'}>
        {selected && <div className="w-3 h-3 rounded-full bg-saffron-400" />}
      </button>

      {/* Image */}
      <div className="aspect-[4/3] w-full bg-pine-100 dark:bg-pine-800 overflow-hidden">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-pine-300 dark:text-pine-600">
              <Package size={40} />
            </div>
        }
      </div>

      <div className="p-5">
        {product.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300">{product.category}</span>
        )}
        <h3 className="font-display text-base font-semibold text-pine-950 dark:text-parchment-50 mt-1">{product.name}</h3>
        <p className="text-sm text-pine-600 dark:text-parchment-300/70 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-pine-500 dark:text-parchment-300/60">{product.weight}</span>
          <span className="font-display text-lg font-semibold text-pine-950 dark:text-parchment-50">₹{product.price}</span>
        </div>
      </div>
    </div>
  )
}

function ProductDetailModal({ product, onClose }) {
  if (!product) return null
  return (
    <Modal isOpen={!!product} onClose={onClose} title="">
      <div className="-mt-4">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-xl mb-5" />
          : <div className="w-full h-48 rounded-xl bg-pine-100 dark:bg-pine-800 flex items-center justify-center mb-5">
              <Package size={48} className="text-pine-300 dark:text-pine-600" />
            </div>
        }
        {product.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300">{product.category}</span>
        )}
        <h2 className="font-display text-2xl font-semibold text-pine-950 dark:text-parchment-50 mt-1">{product.name}</h2>
        <p className="text-sm text-pine-500 dark:text-parchment-300/60 mt-1">{product.weight}</p>
        <p className="text-pine-700 dark:text-parchment-200/80 text-sm leading-relaxed mt-4">{product.description}</p>

        {product.ingredients?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-pine-500 dark:text-parchment-300/60 mb-2">Ingredients</p>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map(i => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-pine-100 dark:bg-pine-800 text-pine-700 dark:text-parchment-200">{i}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-pine-900/10 dark:border-parchment-50/10">
          <span className="font-display text-2xl font-semibold text-pine-950 dark:text-parchment-50">₹{product.price}</span>
          <Button size="md" variant="primary"
            onClick={() => window.open(buildWhatsAppLink(product), '_blank', 'noopener')}>
            Enquire on WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Products() {
  const { toast } = useToast()
  const [selected, setSelected] = useState([])
  const [activeProduct, setActiveProduct] = useState(null)
  const [search, setSearch] = useState('')

  const { data: products, loading, error } = useApi(() => api.get('/api/products'))

  const filtered = useMemo(() => {
    if (!products) return []
    const q = search.toLowerCase()
    if (!q) return products
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    )
  }, [products, search])

  function toggleSelect(product) {
    setSelected(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    )
  }

  function enquireSelected() {
    if (selected.length === 0) return
    window.open(buildMultiWhatsAppLink(selected), '_blank', 'noopener')
    toast({ title: 'WhatsApp opened', description: `Enquiry for ${selected.length} product${selected.length > 1 ? 's' : ''} pre-filled.`, variant: 'success' })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="container-page pt-12 pb-4">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-pine-950 dark:text-parchment-50">Our products</h1>
          <p className="mt-2 text-pine-600 dark:text-parchment-300/70 text-sm max-w-lg">
            Click any product for details. Tick the circle to select multiple products and enquire about them all at once.
          </p>

          {/* Search */}
          <div className="relative mt-6 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pine-400" />
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-full border border-pine-200 dark:border-pine-700 bg-white dark:bg-pine-900 pl-10 pr-4 py-2.5 text-sm text-pine-950 dark:text-parchment-50 placeholder:text-pine-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="container-page py-6">
            <div className="flex items-center gap-3 rounded-xl border border-clay-500/30 bg-clay-500/5 px-5 py-4">
              <AlertCircle size={20} className="text-clay-500 shrink-0" />
              <p className="text-sm text-pine-900 dark:text-parchment-100">
                Could not load products. Make sure the backend is running on port 8000.
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        <section className="container-page py-8 pb-24">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-pine-900/10 dark:border-parchment-50/10 bg-white dark:bg-pine-900 overflow-hidden">
                  <div className="aspect-[4/3] bg-pine-100 dark:bg-pine-800 animate-pulse" />
                  <div className="p-5"><Loader variant="skeleton" lines={3} /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product}
                  selected={!!selected.find(p => p.id === product.id)}
                  onToggle={toggleSelect}
                  onClick={setActiveProduct} />
              ))}
              {filtered.length === 0 && !loading && (
                <div className="col-span-3 text-center py-20 text-pine-500 dark:text-parchment-300/50">
                  No products match your search.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Multi-select sticky bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-pine-950 text-parchment-50 border-t border-parchment-50/10">
          <div className="container-page py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-saffron-300" />
              <span className="text-sm font-medium">
                {selected.length} product{selected.length > 1 ? 's' : ''} selected
              </span>
              <div className="hidden sm:flex flex-wrap gap-1">
                {selected.map(p => (
                  <span key={p.id} className="text-xs bg-parchment-50/10 rounded-full px-2 py-0.5">{p.name}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setSelected([])}
                className="rounded-full p-1.5 hover:bg-parchment-50/10 transition-colors">
                <X size={16} />
              </button>
              <Button size="sm" variant="primary" onClick={enquireSelected}>
                Enquire on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProductDetailModal product={activeProduct} onClose={() => setActiveProduct(null)} />
    </div>
  )
}
