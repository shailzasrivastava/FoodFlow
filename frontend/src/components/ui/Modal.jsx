import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal — dialog overlay with focus trap and Escape-to-close.
 *
 * @param {boolean} isOpen - controls whether the dialog is rendered
 * @param {() => void} onClose - called on Escape, backdrop click, or the close (×) button
 * @param {string} [title] - optional heading rendered in the dialog header
 * @param {React.ReactNode} children - dialog body content
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null)
  const previouslyFocused = useRef(null)
  const titleId = useId()

  // Open/close lifecycle: remember trigger, move focus in, restore focus on close.
  useEffect(() => {
    if (!isOpen) return

    previouslyFocused.current = document.activeElement
    const dialog = dialogRef.current
    const focusable = dialog?.querySelectorAll(FOCUSABLE_SELECTOR)
    ;(focusable?.[0] || dialog)?.focus()

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus()
      }
    }
  }, [isOpen])

  // Escape to close + Tab focus trap, scoped to this dialog only.
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-pine-950/60 backdrop-blur-[2px] animate-fade-up"
        style={{ animationDuration: '0.15s' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-2xl bg-parchment-50 dark:bg-pine-900 shadow-soft p-6 outline-none animate-fade-up"
        style={{ animationDuration: '0.2s' }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          {title && (
            <h2 id={titleId} className="font-display text-xl font-semibold text-pine-950 dark:text-parchment-50">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="ml-auto shrink-0 rounded-full p-1.5 text-pine-700 hover:bg-pine-700/10 dark:text-parchment-200 dark:hover:bg-parchment-50/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-sm text-pine-800 dark:text-parchment-100">{children}</div>
      </div>
    </div>,
    document.body
  )
}
