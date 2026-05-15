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
}

/**
 * テキストエリア + 整理ボタン。
 * 音声入力は OS のキーボード機能（iOS dictation / Android voice typing）に委ねる方針なので、
 * showVoiceHint を渡すとヒント文言が出る。
 */
export function VoiceTextarea({ value, onChange, placeholder, minHeight, ariaLabel, enableCleanup, showVoiceHint }: VoiceTextareaProps) {
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
