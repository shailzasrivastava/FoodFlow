import Button from './ui/Button'

/**
 * Hero — top-of-page banner. Reusable across pages with custom copy/actions;
 * Home.jsx supplies the Foodflow-specific content.
 */
export default function Hero({
  eyebrow,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
}) {
  return (
    <section className="relative overflow-hidden bg-pine-950 text-parchment-50">
      <div className="container-page py-20 sm:py-28 relative z-10">
        <div className="max-w-2xl animate-fade-up">
          {eyebrow && (
            <p className="text-sm font-medium tracking-wide uppercase text-saffron-300 mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] text-parchment-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-base sm:text-lg text-parchment-200/90 max-w-xl">
              {subtitle}
            </p>
          )}
          {(primaryAction || secondaryAction) && (
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {primaryAction && (
                <Button variant="primary" size="lg" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={secondaryAction.onClick}
                  className="border-parchment-50/40 text-parchment-50 hover:bg-parchment-50/10"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Signature element: a Himalayan ridge line marking where the brand's name comes from */}
      <svg
        className="absolute bottom-0 left-0 w-full h-16 sm:h-24 text-parchment-50 dark:text-pine-900"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,120 L0,70 L120,20 L230,65 L330,10 L460,72 L560,30 L660,75 L780,15 L900,68 L1020,25 L1110,70 L1200,40 L1200,120 Z"
          fill="currentColor"
        />
      </svg>
    </section>
  )
}
