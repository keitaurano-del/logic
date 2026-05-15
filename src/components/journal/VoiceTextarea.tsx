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
  const [justCleaned, setJustCleaned] = useState(false)

  const handleCleanup = async () => {
    if (!value.trim() || cleaning) return
    setCleanupError(null)
    setCleaning(true)
    try {
      const { cleaned, error: apiErr } = await cleanupText(value)
      if (apiErr) { setCleanupError(t('journal.cleanupError')); return }
      const final = (cleaned || '').trim()
      if (final) {
        onChange(final)
        setJustCleaned(true)
        setTimeout(() => setJustCleaned(false), 1800)
      }
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
        className={`journal-textarea ${justCleaned ? 'journal-textarea--just-cleaned' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={minHeight ? { minHeight } : undefined}
        aria-label={ariaLabel}
      />
      {enableCleanup && (
        <button
          type="button"
          className={`journal-cleanup-btn journal-cleanup-btn--lg ${cleaning ? 'journal-cleanup-btn--working' : ''} ${justCleaned ? 'journal-cleanup-btn--done' : ''}`}
          onClick={handleCleanup}
          disabled={!value.trim() || cleaning}
          aria-label={t('journal.cleanupAria')}
        >
          {cleaning ? (
            <>
              <span className="journal-spinner journal-spinner--brand" aria-hidden="true" />
              <span>{t('journal.cleanupRunning')}</span>
            </>
          ) : justCleaned ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{t('journal.cleanupDone')}</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
                <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
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
