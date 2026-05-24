// Text-to-speech wrapper (Web SpeechSynthesis + Capacitor native plugin).
//
// Native:  @capacitor-community/text-to-speech を動的 import で読み込み、
//          BCP 47 lang / rate / pitch を渡して読み上げ。
// Web:     window.speechSynthesis (Web Speech API) を fallback として使用。
//          - 開発時の動作確認・QA 用途。本番ターゲットはモバイル native (project_logic_mobile_only)。
// 共通:    speak() は呼ばれるたびに既存再生を stop() してから新規再生。
//          isPlaying() の状態は内部 flag で同期管理（onend/onerror で false に戻す）。
//
// 設定保存:
//   logic-tts-rate   : 1.0 (number, 0.5〜2.0)
//   logic-tts-pitch  : 1.0 (number, 0.5〜2.0) — 未使用予約
//
// API:
//   speak(text, { lang?, rate?, pitch? })  読み上げ開始
//   stop()                                  停止
//   isPlaying()                             同期 boolean
//   isSupported()                           native or Web Speech API が使えるか
//   subscribe(cb)                           isPlaying 変化を購読 (unsubscribe 関数を返す)
//   loadRate() / saveRate(rate)             速度設定の永続化

import { getLocale } from './i18n'

const RATE_KEY = 'logic-tts-rate'
const DEFAULT_RATE = 1.0
const MIN_RATE = 0.5
const MAX_RATE = 2.0

type Listener = (playing: boolean) => void

let playing = false
const listeners = new Set<Listener>()

function setPlaying(v: boolean): void {
  if (playing === v) return
  playing = v
  for (const cb of listeners) {
    try { cb(v) } catch (e) { console.warn('[tts] listener error', e) }
  }
}

export function isPlaying(): boolean {
  return playing
}

export function subscribe(cb: Listener): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function isNative(): boolean {
  try {
    return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
  } catch { return false }
}

function hasWebSpeech(): boolean {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  } catch { return false }
}

export function isSupported(): boolean {
  return isNative() || hasWebSpeech()
}

// ── Rate pref ──────────────────────────────────────────────────

export function loadRate(): number {
  try {
    const raw = localStorage.getItem(RATE_KEY)
    if (!raw) return DEFAULT_RATE
    const n = Number(raw)
    if (Number.isFinite(n) && n >= MIN_RATE && n <= MAX_RATE) return n
  } catch { /* */ }
  return DEFAULT_RATE
}

export function saveRate(rate: number): void {
  const clamped = Math.min(MAX_RATE, Math.max(MIN_RATE, rate))
  try { localStorage.setItem(RATE_KEY, String(clamped)) } catch { /* */ }
}

// ── Language detection ─────────────────────────────────────────

function defaultLang(): 'ja-JP' | 'en-US' {
  return getLocale() === 'ja' ? 'ja-JP' : 'en-US'
}

// ── Speak / Stop ───────────────────────────────────────────────

export type SpeakOptions = {
  lang?: 'ja-JP' | 'en-US'
  rate?: number
  pitch?: number
}

let currentUtterance: SpeechSynthesisUtterance | null = null

async function stopNative(): Promise<void> {
  if (!isNative()) return
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
    await TextToSpeech.stop()
  } catch (e) {
    console.warn('[tts] native stop error', e)
  }
}

function stopWeb(): void {
  if (!hasWebSpeech()) return
  try {
    window.speechSynthesis.cancel()
  } catch (e) {
    console.warn('[tts] web stop error', e)
  }
  currentUtterance = null
}

export async function stop(): Promise<void> {
  setPlaying(false)
  if (isNative()) {
    await stopNative()
  } else {
    stopWeb()
  }
}

async function speakNative(text: string, opts: SpeakOptions): Promise<void> {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
    // Flush previous request to avoid queuing
    try { await TextToSpeech.stop() } catch { /* ignore */ }
    setPlaying(true)
    // speak() resolves when the utterance finishes (or errors).
    await TextToSpeech.speak({
      text,
      lang: opts.lang ?? defaultLang(),
      rate: opts.rate ?? loadRate(),
      pitch: opts.pitch ?? 1.0,
      volume: 1.0,
      category: 'playback',
    })
  } catch (e) {
    console.warn('[tts] native speak error', e)
  } finally {
    setPlaying(false)
  }
}

function speakWeb(text: string, opts: SpeakOptions): void {
  if (!hasWebSpeech()) return
  try {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = opts.lang ?? defaultLang()
    utter.rate = opts.rate ?? loadRate()
    utter.pitch = opts.pitch ?? 1.0
    utter.volume = 1.0
    utter.onend = () => {
      if (currentUtterance === utter) currentUtterance = null
      setPlaying(false)
    }
    utter.onerror = (ev) => {
      // 'interrupted' / 'canceled' は意図的な stop の結果なので warn しない
      const errType = (ev as SpeechSynthesisErrorEvent).error
      if (errType && errType !== 'interrupted' && errType !== 'canceled') {
        console.warn('[tts] web utterance error', errType)
      }
      if (currentUtterance === utter) currentUtterance = null
      setPlaying(false)
    }
    currentUtterance = utter
    setPlaying(true)
    window.speechSynthesis.speak(utter)
  } catch (e) {
    console.warn('[tts] web speak error', e)
    setPlaying(false)
  }
}

/**
 * Start speaking the given text. Cancels any in-progress utterance first.
 * Returns immediately on Web; awaits completion on native (but you can call stop()).
 */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!text || !text.trim()) return
  if (!isSupported()) {
    console.warn('[tts] not supported in this environment')
    return
  }
  if (isNative()) {
    await speakNative(text, opts)
  } else {
    speakWeb(text, opts)
  }
}
