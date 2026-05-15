import { useEffect, useRef, useState, useCallback } from 'react'
import { getLocale } from '../i18n'

// Minimal type surface for the Web Speech API (not in lib.dom by default in all configs).
interface SpeechRecognitionResultLike {
  readonly length: number
  [index: number]: { transcript: string }
}
interface SpeechRecognitionResultListLike {
  readonly length: number
  [index: number]: SpeechRecognitionResultLike
}
interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultListLike
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

interface UseVoiceInputResult {
  isListening: boolean
  isSupported: boolean
  toggleListening: () => void
  startListening: () => void
  stopListening: () => void
}

export function useVoiceInput(onTranscript: (text: string) => void): UseVoiceInputResult {
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState<boolean>(() => !!getCtor())
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const baseTextRef = useRef<string>('')
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return
    try {
      const recognition = new Ctor()
      recognition.lang = getLocale() === 'en' ? 'en-US' : 'ja-JP'
      recognition.continuous = true
      recognition.interimResults = true
      // 既存テキストの末尾に付与する形にしたいので、開始時点のスナップショットを保持
      baseTextRef.current = ''
      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i]
          if (r && r[0]) transcript += r[0].transcript
        }
        onTranscriptRef.current(transcript)
      }
      recognition.onend = () => { setIsListening(false); recognitionRef.current = null }
      recognition.onerror = () => { setIsListening(false); recognitionRef.current = null }
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
    } catch (e) {
      console.warn('useVoiceInput start error:', e)
      setIsListening(false)
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  // クリーンアップ
  useEffect(() => () => {
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
  }, [])

  return { isListening, isSupported, toggleListening, startListening, stopListening }
}
