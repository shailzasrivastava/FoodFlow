const SPINNER_SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

/**
 * Loader — shows a spinner or a skeleton placeholder during data fetching.
 *
 * @param {'spinner'|'skeleton'} [variant='spinner'] - which loading style to render
 * @param {'sm'|'md'|'lg'} [size='md'] - spinner diameter (spinner variant only)
 * @param {number} [lines=3] - number of skeleton bars (skeleton variant only)
 * @param {string} [label='Loading'] - accessible label exposed via aria-label and visually-hidden text
 * @param {string} [className=''] - additional classes merged onto the root element
 */
export default function Loader({ variant = 'spinner', size = 'md', lines = 3, label = 'Loading', className = '' }) {
  if (variant === 'skeleton') {
    return (
      <div className={`flex flex-col gap-2 ${className}`} role="status" aria-label={label}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-pine-200/70 dark:bg-pine-800 animate-pulse"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
        <span className="sr-only">{label}…</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label={label}>
      <span
        className={`${SPINNER_SIZES[size]} rounded-full border-pine-200 border-t-saffron-400 dark:border-pine-700 dark:border-t-saffron-400 animate-spin`}
      />
      <span className="sr-only">{label}…</span>
    </div>
  )
}
