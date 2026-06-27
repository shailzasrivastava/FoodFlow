import { forwardRef } from 'react'

const VARIANT_STYLES = {
  primary:
    'bg-saffron-400 text-pine-950 hover:bg-saffron-300 active:bg-saffron-500 dark:bg-saffron-400 dark:hover:bg-saffron-300',
  secondary:
    'bg-pine-800 text-parchment-50 hover:bg-pine-700 active:bg-pine-900 dark:bg-parchment-100 dark:text-pine-950 dark:hover:bg-parchment-200',
  outline:
    'bg-transparent border border-pine-700/60 text-pine-800 hover:bg-pine-700/5 active:bg-pine-700/10 dark:border-parchment-200/40 dark:text-parchment-100 dark:hover:bg-parchment-50/5',
}

const SIZE_STYLES = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3.5 gap-2.5',
}

/**
 * Button — primary interactive control for the Foodflow UI kit.
 *
 * @param {React.ReactNode} children - button label/content
 * @param {'primary'|'secondary'|'outline'} [variant='primary'] - visual style
 * @param {'sm'|'md'|'lg'} [size='md'] - controls padding/font-size
 * @param {boolean} [disabled=false] - disables interaction and dims the button
 * @param {'button'|'submit'|'reset'} [type='button'] - native button type attribute
 * @param {string} [className=''] - additional classes merged onto the root element
 * @param {(event: React.MouseEvent) => void} [onClick] - click handler
 * @param {React.Ref} ref - forwarded to the underlying <button> element
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    className = '',
    onClick,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center font-medium rounded-full',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-pine-950',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
})

export default Button
