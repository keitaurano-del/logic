/* legacy ConfirmDialog (App.tsx 系で使用)。AppV3 では components/platform/ConfirmDialog.tsx を使用。 */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { useEffect } from 'react'
import './ConfirmDialog.css'

type Props = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({ title, message, confirmLabel = 'OK', cancelLabel = 'キャンセル', onConfirm, onCancel, danger }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div className="cd-overlay" onClick={onCancel}>
      <div className="cd-card" onClick={e => e.stopPropagation()}>
        <h3 className="cd-title">{title}</h3>
        <p className="cd-msg">{message}</p>
        <div className="cd-actions">
          <button className="cd-btn cd-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className={`cd-btn ${danger ? 'cd-danger' : 'cd-confirm'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
