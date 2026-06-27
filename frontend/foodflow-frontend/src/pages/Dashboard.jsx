import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Card from '../components/Card'
import { Button, Loader, Modal } from '../components/ui'
import { useToast } from '../context/ToastContext'
import useApi from '../hooks/useApi'
import api from '../utils/api'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const { toast } = useToast()

  const { data: inventory, loading: invLoading, error: invError, refetch: refetchInv } =
    useApi(() => api.get('/api/inventory'))

  const { data: lowStock } =
    useApi(() => api.get('/api/inventory/low-stock'))

  const { data: production, loading: prodLoading } =
    useApi(() => api.get('/api/production'))

  const totalOnHand = inventory
    ? inventory.filter(i => i.item_type === 'finished_good')
                .reduce((sum, i) => sum + i.current_quantity, 0)
    : null

  const todayOutput = production
    ? production
        .filter(r => {
          const d = new Date(r.start_time)
          const today = new Date()
          return d.toDateString() === today.toDateString()
        })
        .reduce((sum, r) => sum + r.quantity_produced, 0)
    : null

  const lowStockCount = lowStock ? lowStock.length : null

  const STATS = [
    { id: 'inventory',  label: 'Finished goods on hand', value: totalOnHand !== null ? `${totalOnHand.toLocaleString()} units` : null,  meta: 'Inventory' },
    { id: 'production', label: "Today's output",          value: todayOutput !== null ? `${todayOutput} units` : '0 units',              meta: 'Production' },
    { id: 'qc',         label: 'Low-stock alerts',        value: lowStockCount !== null ? String(lowStockCount) : null,                  meta: 'Inventory alerts' },
    { id: 'forecast',   label: 'Active SKUs tracked',     value: inventory ? String(inventory.length) : null,                           meta: 'Inventory' },
  ]

  const loading = invLoading || prodLoading

  function handleRefresh() {
    refetchInv()
    toast({ title: 'Refreshed', description: 'Dashboard data updated.', variant: 'success' })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="container-page py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300 mb-3">
                Operations
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-pine-950 dark:text-parchment-50">
                Production dashboard
              </h1>
              <p className="mt-2 text-sm text-pine-600 dark:text-parchment-300/70 max-w-md">
                Live data from the Foodflow API. Start the backend with{' '}
                <code className="text-saffron-600 dark:text-saffron-300">uvicorn main:app --reload</code>.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw size={14} /> Refresh
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                View latest batch
              </Button>
            </div>
          </div>

          {/* Error state */}
          {invError && !loading && (
            <div className="flex items-center gap-3 rounded-xl border border-clay-500/30 bg-clay-500/5 px-5 py-4 mb-8">
              <AlertCircle size={20} className="text-clay-500 shrink-0" />
              <p className="text-sm text-pine-900 dark:text-parchment-100">
                Could not reach the backend. Start it with{' '}
                <code className="text-saffron-600">uvicorn main:app --reload</code> and refresh.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <Card
                key={s.id}
                meta={s.meta}
                title={s.label}
                description={
                  loading
                    ? <Loader variant="skeleton" lines={2} className="mt-1" />
                    : <span className="font-display text-2xl font-semibold text-pine-950 dark:text-parchment-50">
                        {s.value ?? '—'}
                      </span>
                }
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center gap-2 mt-8 text-sm text-pine-600 dark:text-parchment-300/70">
              <Loader variant="spinner" size="sm" />
              Fetching live data from API…
            </div>
          )}
        </section>
      </main>

      <Footer />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Latest batch — HK-2026-001">
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-pine-500 dark:text-parchment-300/60">Product</dt>
          <dd className="text-right font-medium">Hand-Pounded Turmeric</dd>
          <dt className="text-pine-500 dark:text-parchment-300/60">Quantity</dt>
          <dd className="text-right font-medium">180 units</dd>
          <dt className="text-pine-500 dark:text-parchment-300/60">QC status</dt>
          <dd className="text-right font-medium text-pine-700 dark:text-saffron-300">Passed</dd>
          <dt className="text-pine-500 dark:text-parchment-300/60">Dispatched</dt>
          <dd className="text-right font-medium">Not yet</dd>
        </dl>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}
