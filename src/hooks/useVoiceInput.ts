import { useEffect, useRef, useState, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { getLocale } from '../i18n'

// ── Web Speech API 型定義（lib.dom にない環境向け） ─────────────
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
interface SpeechRecognitionErrorEventLike {
  error?: string
  message?: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getWebCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

function isNative(): boolean {
  try { return Capacitor.isNativePlatform() } catch { return false }
}

export type VoiceErrorCode =
  | 'permission-denied'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'not-supported'
  | 'aborted'
  | 'unknown'

function mapWebError(e: SpeechRecognitionErrorEventLike): VoiceErrorCode {
  const k = (e.error || '').toLowerCase()
  if (k === 'not-allowed' || k === 'service-not-allowed') return 'permission-denied'
  if (k === 'no-speech') return 'no-speech'
  if (k === 'audio-capture') return 'audio-capture'
  if (k === 'network') return 'network'
  if (k === 'aborted') return 'aborted'
  return 'unknown'
}

interface UseVoiceInputResult {
  isListening: boolean
  isSupported: boolean
  error: VoiceErrorCode | null
  toggleListening: () => Promise<void>
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
}

/**
 * 音声入力フック。Web Speech API（デスクトップ Chrome / Android Chrome / iOS Safari 14.5+）と
 * Capacitor の @capacitor-community/speech-recognition プラグイン（Android ネイティブ / iOS ネイティブ）の
 * 両方をサポート。
 *
 * - native 環境（Capacitor）では plugin を優先。Web Speech API は WebView では動作しない（既知制限）
 * - web 環境では Web Speech API を使う。HTTPS（localhost 含む）でないと permission 取れない
 * - エラーは error コード（'permission-denied' / 'audio-capture' 等）として返し、UI で文言を出し分けられる
 */
export function useVoiceInput(onTranscript: (text: string) => void): UseVoiceInputResult {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<VoiceErrorCode | null>(null)
  // ネイティブまたは Web Speech API 利用可
  const [isSupported] = useState<boolean>(() => isNative() || !!getWebCtor())

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const nativeListenerRef = useRef<{ remove: () => void } | null>(null)
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])

  // ── stop ─────────────────────────────────────
  const stopListening = useCallback(async () => {
    if (isNative()) {
      try { await SpeechRecognition.stop() } catch { /* ignore */ }
      if (nativeListenerRef.current) { nativeListenerRef.current.remove(); nativeListenerRef.current = null }
    } else {
      try { recognitionRef.current?.stop() } catch { /* ignore */ }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  // ── start ────────────────────────────────────
  const startListening = useCallback(async () => {
    setError(null)
    const lang = getLocale() === 'en' ? 'en-US' : 'ja-JP'

    if (isNative()) {
      // Capacitor ネイティブパス
      try {
        const avail = await SpeechRecognition.available()
        if (!avail.available) { setError('not-supported'); return }

        const perm = await SpeechRecognition.checkPermissions()
        if (perm.speechRecognition !== 'granted') {
          const req = await SpeechRecognition.requestPermissions()
          if (req.speechRecognition !== 'granted') { setError('permission-denied'); return }
        }

        // partialResults を流す
        const handler = (data: { matches?: string[] }) => {
          const text = (data?.matches && data.matches[0]) || ''
          if (text) onTranscriptRef.current(text)
        }
        const listener = await SpeechRecognition.addListener('partialResults', handler)
        nativeListenerRef.current = listener as unknown as { remove: () => void }

        await SpeechRecognition.start({
          language: lang,
          maxResults: 1,
          prompt: undefined,
          partialResults: true,
          popup: false,
        })
        setIsListening(true)
      } catch (e) {
        console.warn('useVoiceInput native start:', e)
        const msg = e instanceof Error ? e.message.toLowerCase() : ''
        if (msg.includes('permission')) setError('permission-denied')
        else setError('unknown')
        setIsListening(false)
      }
      return
    }

    // Web パス
    const Ctor = getWebCtor()
    if (!Ctor) { setError('not-supported'); return }
    try {
      const recognition = new Ctor()
      recognition.lang = lang
      recognition.continuous = true
      recognition.interimResults = true
      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i]
          if (r && r[0]) transcript += r[0].transcript
        }
        onTranscriptRef.current(transcript)
      }
      recognition.onend = () => { setIsListening(false); recognitionRef.current = null }
      recognition.onerror = (e) => {
        // Keita デバッグ用にフル詳細を出力
        console.warn('[useVoiceInput] onerror', { error: e.error, message: e.message, raw: e })
        const code = mapWebError(e)
        // ユーザーが止めた場合（aborted）は無視
        if (code !== 'aborted') setError(code)
        setIsListening(false)
        recognitionRef.current = null
      }
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
    } catch (e) {
      console.warn('[useVoiceInput] web start failed', e)
      // SecurityError: not HTTPS / not allowed by Permissions Policy
      const msg = e instanceof Error ? e.message.toLowerCase() : ''
      if (msg.includes('not allowed') || msg.includes('permission')) setError('permission-denied')
      else if (msg.includes('not supported')) setError('not-supported')
      else setError('unknown')
      setIsListening(false)
    }
  }, [])

  const toggleListening = useCallback(async () => {
    if (isListening) await stopListening()
    else await startListening()
  }, [isListening, startListening, stopListening])

  // クリーンアップ
  useEffect(() => () => {
    if (isNative()) {
      SpeechRecognition.stop().catch(() => { /* ignore */ })
      nativeListenerRef.current?.remove()
    } else {
      try { recognitionRef.current?.stop() } catch { /* ignore */ }
    }
  }, [])

  return { isListening, isSupported, error, toggleListening, startListening, stopListening }
}
