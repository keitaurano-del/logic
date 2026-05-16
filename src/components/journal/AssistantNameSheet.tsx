import { useEffect, useState } from 'react'
import { t } from '../../i18n'

interface AssistantNameSheetProps {
  open: boolean
  currentName: string
  onSave: (name: string) => Promise<void>
  onClose: () => void
}

export function AssistantNameSheet({ open, currentName, onSave, onClose }: AssistantNameSheetProps) {
  const [input, setInput] = useState(currentName)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setInput(currentName)
  }, [open, currentName])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const trimmed = input.trim()
  const dirty = trimmed !== currentName.trim() && trimmed.length > 0

  const handleSave = async () => {
    if (!dirty) return
    setSaving(true)
    try {
      await onSave(trimmed)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="journal-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.assistantSettings')}
      onClick={onClose}
    >
      <div className="journal-confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="journal-modal__bar" aria-hidden="true" />
        <div className="journal-confirm-sheet__title">{t('profile.assistantSettings')}</div>
        <div className="journal-confirm-sheet__desc">
          {t('profile.assistantNameCurrent', { name: currentName })}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('journal.assistantNameDefault')}
          aria-label={t('profile.assistantSettings')}
          maxLength={30}
          autoFocus
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border, rgba(255,255,255,.08))',
            borderRadius: 10,
            color: 'var(--text-primary)',
            font: 'inherit',
            fontSize: 16,
            boxSizing: 'border-box',
            marginTop: 12,
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleSave() }}
        />
        <div className="journal-confirm-sheet__actions">
          <button
            type="button"
            className="journal-summarize-btn journal-summarize-btn--secondary"
            onClick={onClose}
            style={{ flex: 1 }}
            disabled={saving}
          >
            {t('journal.cancelCta')}
          </button>
          <button
            type="button"
            className="journal-summarize-btn"
            onClick={handleSave}
            style={{ flex: 1 }}
            disabled={!dirty || saving}
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
