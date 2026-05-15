import { useEffect, useRef, useState } from 'react'
import { useVoiceInput, type VoiceErrorCode } from '../../hooks/useVoiceInput'
import { MicIcon } from './MoodWeatherIcons'
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
}

const ERROR_KEY: Record<VoiceErrorCode, string> = {
  'permission-denied': 'journal.voiceErrPermission',
  'no-speech':         'journal.voiceErrNoSpeech',
  'audio-capture':     'journal.voiceErrAudio',
  'network':           'journal.voiceErrNetwork',
  'not-allowed':       'journal.voiceErrPermission',
  'not-supported':     'journal.voiceErrUnsupported',
  'aborted':           'journal.voiceErrAborted',
  'unknown':           'journal.voiceErrUnknown',
}

export function VoiceTextarea({ value, onChange, placeholder, minHeight, ariaLabel, enableCleanup }: VoiceTextareaProps) {
  // 録音開始時のテキスト末尾位置を覚えて、認識結果を以降に追記する
  const baseRef = useRef<string>(value)
  const [cleaning, setCleaning] = useState(false)
  const [cleanupError, setCleanupError] = useState<string | null>(null)

  const handleTranscript = (transcript: string) => {
    const sep = baseRef.current && !/[\s\n]$/.test(baseRef.current) ? ' ' : ''
    onChange(`${baseRef.current}${sep}${transcript}`)
  }

  const { isListening, isSupported, error, toggleListening } = useVoiceInput(handleTranscript)

  // 録音停止時は現在値をベースとして更新（次の録音で末尾追記できるよう）
  useEffect(() => {
    if (!isListening) baseRef.current = value
  }, [isListening, value])

  const handleStart = () => {
    if (!isListening) baseRef.current = value
    void toggleListening()
  }

  const handleCleanup = async () => {
    if (!value.trim() || cleaning) return
    setCleanupError(null)
    setCleaning(true)
    try {
      const { cleaned, error: apiErr } = await cleanupText(value)
      if (apiErr) { setCleanupError(t('journal.cleanupError')); return }
      const final = (cleaned || '').trim()
      if (final) {
        baseRef.current = final
        onChange(final)
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
        className="journal-textarea"
        value={value}
        onChange={(e) => {
          if (!isListening) baseRef.current = e.target.value
          onChange(e.target.value)
        }}
        placeholder={placeholder}
        style={minHeight ? { minHeight } : undefined}
        aria-label={ariaLabel}
      />
      {isSupported && (
        <button
          type="button"
          className={`journal-voice-btn ${isListening ? 'journal-voice-btn--listening' : ''}`}
          onClick={handleStart}
          aria-label={isListening ? t('journal.voiceStop') : t('journal.voiceStart')}
          aria-pressed={isListening}
        >
          <MicIcon size={18} />
        </button>
      )}
      {isListening && (
        <span role="status" aria-live="polite" className="journal-voice-rec">
          {t('journal.voiceRecording')}
        </span>
      )}
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
      {error && (
        <div className="journal-voice-error" role="alert">
          {t(ERROR_KEY[error])}
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
