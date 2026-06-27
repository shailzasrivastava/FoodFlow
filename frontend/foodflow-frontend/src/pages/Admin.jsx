import { useState, useRef } from 'react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Button, Input, Loader } from '../components/ui'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import useApi from '../hooks/useApi'
import api from '../utils/api'
import { Plus, Pencil, Trash2, Package, LogOut, AlertCircle } from 'lucide-react'

// ─── Login form ──────────────────────────────────────────────────────────────

function LoginForm() {
  const { login } = useAuth()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!username) errs.username = 'Username is required.'
    if (!password) errs.password = 'Password is required.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await login(username, password)
      toast({ title: 'Signed in', description: 'Welcome to the admin dashboard.', variant: 'success' })
    } catch (err) {
      toast({ title: 'Login failed', description: err.detail || 'Invalid credentials.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-pine-950 dark:text-parchment-50">Admin login</h1>
          <p className="mt-1 text-sm text-pine-500 dark:text-parchment-300/60">For HimShakti staff only.</p>
          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} error={errors.username} autoComplete="username" required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} autoComplete="current-password" required />
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// ─── Product form modal ───────────────────────────────────────────────────────

const EMPTY = { name: '', weight: '', price: '', description: '', ingredients: '', sku: '', category: '', image_url: '' }

function ProductFormModal({ isOpen, onClose, initial, token, onSaved }) {
  const { toast } = useToast()
  const [form, setForm] = useState(initial || EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()
  const isEdit = !!initial?.id

  function field(key) {
    return {
      value: form[key] || '',
      onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
      error: errors[key],
    }
  }

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please use an image under 2 MB.', variant: 'warning' })
      return
    }
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, image_url: ev.target.result }))
    reader.readAsDataURL(file)
  }

  function validate() {
    const e = {}
    if (!form.name?.trim()) e.name = 'Required.'
    if (!form.weight?.trim()) e.weight = 'Required.'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Must be a positive number.'
    if (!form.description?.trim()) e.description = 'Required.'
    if (!form.sku?.trim()) e.sku = 'Required.'
    return e
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        ingredients: form.ingredients ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
      }
      if (isEdit) {
        await api.put(`/api/products/${initial.id}`, payload, token)
      } else {
        await api.post('/api/products', payload, token)
      }
      toast({ title: isEdit ? 'Product updated' : 'Product created', variant: 'success' })
      onSaved()
      onClose()
    } catch (err) {
      toast({ title: 'Save failed', description: err.detail, variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit product' : 'Add product'}>
      <form onSubmit={handleSave} noValidate className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Product name" {...field('name')} required className="col-span-2" />
          <Input label="SKU" {...field('sku')} required placeholder="HIM-HON-500" />
          <Input label="Category" {...field('category')} placeholder="Honey" />
          <Input label="Weight / volume" {...field('weight')} required placeholder="500g" />
          <Input label="Price (₹)" type="number" {...field('price')} required placeholder="450" />
        </div>
        <Input label="Ingredients (comma-separated)" {...field('ingredients')} placeholder="honey, beeswax" />
        <div>
          <label className="text-sm font-medium text-pine-900 dark:text-parchment-100 block mb-1.5">Description</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Describe the product…"
            className="w-full rounded-lg border border-pine-200 dark:border-pine-700 bg-white dark:bg-pine-900 px-3.5 py-2.5 text-sm text-pine-950 dark:text-parchment-50 placeholder:text-pine-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 resize-none"
          />
          {errors.description && <p className="text-sm text-clay-600 mt-1">{errors.description}</p>}
        </div>

        {/* Image upload */}
        <div>
          <label className="text-sm font-medium text-pine-900 dark:text-parchment-100 block mb-1.5">Product image</label>
          {form.image_url && (
            <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {form.image_url ? 'Change image' : 'Upload image'}
          </Button>
          {form.image_url && (
            <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
              className="ml-2 text-xs text-clay-500 hover:underline">Remove</button>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const { token, admin, logout } = useAuth()
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data: products, loading, error, refetch } = useApi(() => api.get('/api/products'))

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/products/${deleteTarget.id}`, token)
      toast({ title: 'Product deleted', variant: 'success' })
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast({ title: 'Delete failed', description: err.detail, variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  function openEdit(product) {
    setEditProduct({
      ...product,
      price: String(product.price),
      ingredients: product.ingredients?.join(', ') || '',
    })
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container-page py-10">

        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-pine-500 dark:text-parchment-300/60">Signed in as <strong>{admin}</strong></p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-pine-950 dark:text-parchment-50 mt-0.5">Product catalog</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut size={14} /> Sign out
            </Button>
            <Button size="sm" onClick={() => { setEditProduct(null); setFormOpen(true) }}>
              <Plus size={14} /> Add product
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-clay-500/30 bg-clay-500/5 px-5 py-4 mb-6">
            <AlertCircle size={18} className="text-clay-500" />
            <p className="text-sm">Could not load products. Is the backend running?</p>
          </div>
        )}

        {loading && <div className="flex items-center gap-3 py-16 justify-center"><Loader variant="spinner" size="lg" /></div>}

        {/* Product table */}
        {!loading && products && (
          <div className="rounded-2xl border border-pine-900/10 dark:border-parchment-50/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pine-50 dark:bg-pine-900/60 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold text-pine-600 dark:text-parchment-300/70 w-12"></th>
                  <th className="px-4 py-3 font-semibold text-pine-600 dark:text-parchment-300/70">Product</th>
                  <th className="px-4 py-3 font-semibold text-pine-600 dark:text-parchment-300/70 hidden sm:table-cell">SKU</th>
                  <th className="px-4 py-3 font-semibold text-pine-600 dark:text-parchment-300/70 hidden md:table-cell">Weight</th>
                  <th className="px-4 py-3 font-semibold text-pine-600 dark:text-parchment-300/70">Price</th>
                  <th className="px-4 py-3 font-semibold text-pine-600 dark:text-parchment-300/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-900/5 dark:divide-parchment-50/5">
                {products.map(p => (
                  <tr key={p.id} className="bg-white dark:bg-pine-900 hover:bg-parchment-50 dark:hover:bg-pine-800/50 transition-colors">
                    <td className="px-5 py-3">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        : <div className="w-10 h-10 rounded-lg bg-pine-100 dark:bg-pine-800 flex items-center justify-center text-pine-300"><Package size={18} /></div>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-pine-950 dark:text-parchment-50">{p.name}</p>
                      {p.category && <p className="text-xs text-pine-400 dark:text-parchment-300/50 mt-0.5">{p.category}</p>}
                    </td>
                    <td className="px-4 py-3 text-pine-500 dark:text-parchment-300/60 hidden sm:table-cell font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 text-pine-500 dark:text-parchment-300/60 hidden md:table-cell">{p.weight}</td>
                    <td className="px-4 py-3 font-semibold text-pine-950 dark:text-parchment-50">₹{p.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-pine-500 hover:text-pine-900 hover:bg-pine-100 dark:hover:bg-pine-700 dark:text-parchment-300/60 dark:hover:text-parchment-50 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-pine-500 hover:text-clay-600 hover:bg-clay-50 dark:hover:bg-clay-900/20 dark:text-parchment-300/60 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-16 text-pine-400">No products yet. Add your first one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />

      {/* Add / Edit modal */}
      <ProductFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null) }}
        initial={editProduct}
        token={token}
        onSaved={refetch}
      />

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete product?">
        <p className="text-sm text-pine-700 dark:text-parchment-200/80">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This can't be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button size="sm"
            className="bg-clay-500 hover:bg-clay-600 text-white"
            disabled={deleting}
            onClick={handleDelete}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── Route guard ──────────────────────────────────────────────────────────────

export default function Admin() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <Dashboard /> : <LoginForm />
}
