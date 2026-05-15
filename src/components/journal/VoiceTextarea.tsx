import { useEffect, useRef, useState } from 'react'
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
  const baseRef = useRef<string>(value)
  const [overlayText, setOverlayText] = useState('')

  const handleTranscript = (transcript: string) => {
    // 元のテキスト末尾に音声テキストを追記する形にする
    setOverlayText(transcript)
    const sep = baseRef.current && !/[\s\n]$/.test(baseRef.current) ? ' ' : ''
    onChange(`${baseRef.current}${sep}${transcript}`)
  }

  const { isListening, isSupported, toggleListening } = useVoiceInput(handleTranscript)

  useEffect(() => {
    if (!isListening) {
      // 録音停止時：現在の入力をベースとして更新
      baseRef.current = value
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOverlayText('')
    }
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
          <MicIcon size={18} color="currentColor" />
        </button>
      )}
      {isListening && overlayText && (
        <span style={{ display: 'none' }}>{overlayText}</span>
      )}
    </div>
  )
}
