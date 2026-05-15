import { useState } from 'react'
import { cleanupText } from './journalApi'
import { t } from '../../i18n'

interface VoiceTextareaProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minHeight?: number
  ariaLabel?: string
  /** 「整理する」ボタンを表示。入力テキストを整形 API でクリーンアップする */
  enableCleanup?: boolean
  /** 音声入力ヒントを表示（OS のキーボード音声入力を案内） */
  showVoiceHint?: boolean
  /**
   * 読み取り専用ロック状態。true の時は大きいフォントで本文を表示し、
   * 編集はできない。onUnlock が渡されていればロック解除ボタンを表示する。
   */
  locked?: boolean
  /** ロック解除リクエスト（編集ボタン押下時） */
  onUnlock?: () => void
}

/**
 * テキストエリア + 整理ボタン + ロック表示モード。
 * 音声入力は OS のキーボード機能（iOS dictation / Android voice typing）に委ねる方針なので、
 * showVoiceHint を渡すとヒント文言が出る。
 *
 * locked=true の時は <div> による大きい読み取りカード表示に切り替わる。
 */
export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  minHeight,
  ariaLabel,
  enableCleanup,
  showVoiceHint,
  locked,
  onUnlock,
}: VoiceTextareaProps) {
  const [cleaning, setCleaning] = useState(false)
  const [cleanupError, setCleanupError] = useState<string | null>(null)

  const handleCleanup = async () => {
    if (!value.trim() || cleaning) return
    setCleanupError(null)
    setCleaning(true)
    try {
      const { cleaned, error: apiErr } = await cleanupText(value)
      if (apiErr) { setCleanupError(t('journal.cleanupError')); return }
      const final = (cleaned || '').trim()
      if (final) onChange(final)
    } catch (e) {
      console.warn('cleanup error:', e)
      setCleanupError(t('journal.cleanupError'))
    } finally {
      setCleaning(false)
    }
  }

  if (locked && value.trim()) {
    return (
      <div className="journal-voice-wrap journal-voice-wrap--locked">
        <div
          className="journal-locked-card"
          role="region"
          aria-label={ariaLabel}
        >
          <div className="journal-locked-card__title">{t('journal.intentReadingTitle')}</div>
          <div className="journal-locked-card__body">{value}</div>
          {onUnlock && (
            <button
              type="button"
              className="journal-locked-card__edit"
              onClick={onUnlock}
              aria-label={t('journal.editAria')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>{t('journal.editCta')}</span>
            </button>
          )}
        </div>
        <div className="journal-locked-hint">{t('journal.lockedHint')}</div>
      </div>
    )
  }

  return (
    <div className="journal-voice-wrap">
      <textarea
        className="journal-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={minHeight ? { minHeight } : undefined}
        aria-label={ariaLabel}
      />
      {enableCleanup && (
        <button
          type="button"
          className="journal-cleanup-btn"
          onClick={handleCleanup}
          disabled={!value.trim() || cleaning}
          aria-label={t('journal.cleanupAria')}
        >
          {cleaning ? (
            <>
              <span className="journal-spinner journal-spinner--brand" aria-hidden="true" />
              <span>{t('journal.cleanupRunning')}</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h12" />
              </svg>
              <span>{t('journal.cleanupCta')}</span>
            </>
          )}
        </button>
      )}
      {showVoiceHint && (
        <div className="journal-voice-hint">
          {t('journal.voiceInputHint')}
        </div>
      )}
      {cleanupError && (
        <div className="journal-voice-error" role="alert">
          {cleanupError}
        </div>
      )}
    </div>
  )
}
