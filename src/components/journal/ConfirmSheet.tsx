import { useEffect } from 'react'
import { t } from '../../i18n'

interface ConfirmSheetProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** モバイル前提のボトムシート式確認ダイアログ。native confirm の代替で凜トーンを保つ。 */
export function ConfirmSheet({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    // body scroll lock 軽量版
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="journal-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div className="journal-confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="journal-modal__bar" aria-hidden="true" />
        <div className="journal-confirm-sheet__title">{title}</div>
        {description && <div className="journal-confirm-sheet__desc">{description}</div>}
        <div className="journal-confirm-sheet__actions">
          <button
            type="button"
            className="journal-summarize-btn journal-summarize-btn--secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            {cancelLabel ?? t('journal.cancelCta')}
          </button>
          <button
            type="button"
            className={`journal-summarize-btn ${destructive ? 'journal-summarize-btn--danger' : ''}`}
            onClick={onConfirm}
            style={{ flex: 1 }}
            autoFocus
          >
            {confirmLabel ?? t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
