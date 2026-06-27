import { createPortal } from 'react-dom'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const VARIANT_STYLES = {
  default: 'bg-pine-900 text-parchment-50 dark:bg-parchment-100 dark:text-pine-950',
  success: 'bg-pine-700 text-parchment-50',
  error: 'bg-clay-600 text-parchment-50',
  warning: 'bg-saffron-400 text-pine-950',
}

const VARIANT_ICON = {
  default: Info,
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
}

/**
 * Toaster — the toast notification viewport. Takes no props; mount it once near
 * the root of the app (already done in main.jsx) and it renders whatever is
 * queued in ToastContext.
 *
 * Trigger a toast from any component with the `useToast()` hook:
 *
 *   const { toast } = useToast()
 *   toast({ title, description, variant, duration })
 *
 * toast() options:
 * @param {string} [title] - bold first line of the notification
 * @param {string} [description] - supporting text below the title
 * @param {'default'|'success'|'error'|'warning'} [variant='default'] - visual style + icon
 * @param {number} [duration=4000] - ms before auto-dismiss; pass 0 to require manual dismiss
 */
export default function Toaster() {
  const { toasts, dismiss } = useToast()

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const Icon = VARIANT_ICON[t.variant] || Info
        return (
          <div
            key={t.id}
            role={t.variant === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-soft animate-toast-in ${VARIANT_STYLES[t.variant] || VARIANT_STYLES.default}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold leading-tight">{t.title}</p>}
              {t.description && <p className="text-sm opacity-90 mt-0.5">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-full p-1 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
