import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './TextField.css'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helper?: string
  error?: string
  variant?: 'filled' | 'outlined'
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

/**
 * M3 text field. Defaults to `font-size: 16px` on the input to suppress the
 * iOS Safari auto-zoom on focus. Always passes `inputMode` / `autoComplete`
 * through to the native input so the OS keyboard adapts.
 */
export function TextField({
  variant = 'filled',
  label,
  helper,
  error,
  leadingIcon,
  trailingIcon,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const reactId = useId()
  const inputId = id ?? reactId
  const helperId = `${inputId}-helper`
  const wrapperClass = [
    'm3-field',
    `m3-field--${variant}`,
    error && 'm3-field--error',
    rest.disabled && 'm3-field--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={inputId} className="m3-field__label">{label}</label>
      )}
      <div className="m3-field__control">
        {leadingIcon && <span className="m3-field__icon m3-field__icon--leading" aria-hidden="true">{leadingIcon}</span>}
        <input
          id={inputId}
          className="m3-field__input"
          aria-invalid={Boolean(error)}
          aria-describedby={helper || error ? helperId : undefined}
          {...rest}
        />
        {trailingIcon && <span className="m3-field__icon m3-field__icon--trailing" aria-hidden="true">{trailingIcon}</span>}
      </div>
      {(helper || error) && (
        <div id={helperId} className={`m3-field__supporting ${error ? 'is-error' : ''}`}>
          {error ?? helper}
        </div>
      )}
    </div>
  )
}
