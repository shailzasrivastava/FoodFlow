import { forwardRef, useId } from 'react'

/**
 * Input — labeled text field with error state for the Foodflow UI kit.
 *
 * @param {string} [label] - field label rendered above the input
 * @param {string} [placeholder] - native placeholder text
 * @param {string} [type='text'] - native input type (text, email, password, etc.)
 * @param {string} value - controlled field value
 * @param {(event: React.ChangeEvent) => void} onChange - change handler
 * @param {string} [error] - validation message; when present, the field is styled as invalid
 *   and the message is rendered below it with role="alert"
 * @param {string} [id] - element id; auto-generated via useId() if omitted
 * @param {string} [name] - native name attribute
 * @param {boolean} [disabled=false] - disables the field
 * @param {boolean} [required=false] - marks the field required and shows a "*" next to the label
 * @param {string} [className=''] - additional classes merged onto the wrapper element
 * @param {React.Ref} ref - forwarded to the underlying <input> element
 */
const Input = forwardRef(function Input(
  {
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    error,
    id,
    name,
    disabled = false,
    required = false,
    className = '',
    ...rest
  },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId
  const errorId = `${inputId}-error`

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-pine-900 dark:text-parchment-100">
          {label}
          {required && <span className="text-clay-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={[
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-pine-950 placeholder:text-pine-400',
          'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'dark:bg-pine-900 dark:text-parchment-50 dark:placeholder:text-pine-400 dark:border-pine-700',
          error
            ? 'border-clay-500 focus-visible:ring-clay-400'
            : 'border-pine-200 dark:border-pine-700',
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-clay-600 dark:text-clay-400">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input
