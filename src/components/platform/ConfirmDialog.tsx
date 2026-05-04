import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { isIOS } from '../../platform'
import { haptic } from '../../platform/haptics'
import './ConfirmDialog.css'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  okText?: string
  cancelText?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Platform-aware confirm dialog. Replaces window.confirm() with a focus-trapped,
 * accessible modal whose layout matches HIG (iOS: centered, two columns) or
 * M3 (Android: left-aligned, right-bottom buttons).
 */
export function ConfirmDialog(p: ConfirmDialogProps) {
  const ios = isIOS()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!p.open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLButtonElement>('button[data-default]')?.focus()
    return () => prev?.focus?.()
  }, [p.open])

  useEffect(() => {
    if (!p.open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [p])

  if (!p.open) return null

  const cancel = () => { haptic.light(); p.onCancel() }
  const confirm = () => {
    if (p.destructive) haptic.medium()
    else haptic.light()
    p.onConfirm()
  }

  const dialog = (
    <div
      className="m3-dialog__scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby="m3-dialog-title"
      onClick={cancel}
    >
      <div
        className={`m3-dialog ${ios ? 'm3-dialog--ios' : 'm3-dialog--android'}`}
        ref={ref}
        onClick={e => e.stopPropagation()}
      >
        <div className="m3-dialog__title" id="m3-dialog-title">{p.title}</div>
        {p.message && <div className="m3-dialog__body">{p.message}</div>}
        <div className="m3-dialog__actions">
          <button
            type="button"
            className="m3-dialog__btn"
            onClick={cancel}
          >
            {p.cancelText ?? 'キャンセル'}
          </button>
          <button
            type="button"
            data-default
            className={`m3-dialog__btn m3-dialog__btn--default ${p.destructive ? 'm3-dialog__btn--destructive' : ''}`}
            onClick={confirm}
          >
            {p.okText ?? 'OK'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
