import type { ChangeEvent } from 'react'
import { isIOS } from '../platform'
import { haptic } from '../platform/haptics'
import './Switch.css'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  'aria-label'?: string
  disabled?: boolean
}

/**
 * Platform-aware toggle switch. Wraps a native checkbox so the OS handles
 * keyboard interaction and screen-reader announcement.
 */
export function Switch({ checked, onChange, label, 'aria-label': ariaLabel, disabled }: SwitchProps) {
  const ios = isIOS()
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled) haptic.selection()
    onChange(e.target.checked)
  }

  return (
    <label className={`m3-switch ${ios ? 'm3-switch--ios' : 'm3-switch--android'} ${disabled ? 'm3-switch--disabled' : ''}`}>
      <input
        type="checkbox"
        className="m3-switch__input"
        checked={checked}
        onChange={handle}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
      />
      <span className="m3-switch__track" aria-hidden="true">
        <span className="m3-switch__thumb" />
      </span>
      {label && <span className="m3-switch__label">{label}</span>}
    </label>
  )
}
