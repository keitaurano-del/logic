import { useEffect, useRef } from 'react'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { MicIcon } from './MoodWeatherIcons'
import { t } from '../../i18n'

interface VoiceTextareaProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minHeight?: number
  ariaLabel?: string
}

export function VoiceTextarea({ value, onChange, placeholder, minHeight, ariaLabel }: VoiceTextareaProps) {
  // 録音開始時のテキスト末尾位置を覚えて、認識結果を以降に追記する
  const baseRef = useRef<string>(value)

  const handleTranscript = (transcript: string) => {
    const sep = baseRef.current && !/[\s\n]$/.test(baseRef.current) ? ' ' : ''
    onChange(`${baseRef.current}${sep}${transcript}`)
  }

  const { isListening, isSupported, toggleListening } = useVoiceInput(handleTranscript)

  // 録音停止時は現在値をベースとして更新（次の録音で末尾追記できるよう）
  useEffect(() => {
    if (!isListening) baseRef.current = value
  }, [isListening, value])

  const handleStart = () => {
    if (!isListening) baseRef.current = value
    toggleListening()
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
        <span
          role="status"
          aria-live="polite"
          className="journal-voice-rec"
        >
          {t('journal.voiceRecording')}
        </span>
      )}
    </div>
  )
}
