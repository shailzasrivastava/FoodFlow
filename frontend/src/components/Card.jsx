
export default function Card({ image, imageAlt = '', meta, title, description, footer, className = '' }) {
  return (
    <div
      className={[
        'group flex flex-col rounded-2xl border border-pine-900/10 dark:border-parchment-50/10',
        'bg-white dark:bg-pine-900 overflow-hidden shadow-soft',
        'transition-transform duration-200 hover:-translate-y-1',
        className,
      ].join(' ')}
    >
      {image && (
        <div className="aspect-[4/3] w-full overflow-hidden bg-pine-100 dark:bg-pine-800">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        {meta && (
          <span className="text-xs font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-300">
            {meta}
          </span>
        )}
        {title && (
          <h3 className="font-display text-lg font-semibold text-pine-950 dark:text-parchment-50">{title}</h3>
        )}
        {description && (
          <div className="text-sm text-pine-700 dark:text-parchment-200/80 leading-relaxed">{description}</div>
        )}
        {footer && (
          <div className="mt-auto pt-3 border-t border-pine-900/10 dark:border-parchment-50/10">{footer}</div>
        )}
      </div>
    </div>
  )
}
