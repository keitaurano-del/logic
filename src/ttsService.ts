// Text-to-speech wrapper (Web SpeechSynthesis + Capacitor native plugin).
//
// Native:  @capacitor-community/text-to-speech を動的 import で読み込み、
//          BCP 47 lang / rate / pitch / voice (index) を渡して読み上げ。
// Web:     window.speechSynthesis (Web Speech API) を fallback として使用。
//          - 開発時の動作確認・QA 用途。本番ターゲットはモバイル native (project_logic_mobile_only)。
// 共通:    speak() は呼ばれるたびに既存再生を stop() してから新規再生。
//          isPlaying() の状態は内部 flag で同期管理（onend/onerror で false に戻す）。
//
// 設定保存:
//   logic-tts-rate    : 1.0 (number, 0.5〜2.0)
//   logic-tts-pitch   : 1.0 (number, 0.5〜2.0) — TtsControlPanel のピッチ調整 (低め/普通/高め)
//   logic-tts-voice   : voice id (string `${lang}|${name}`)
//
// API:
//   speak(text, opts)           読み上げ開始 (onEnd で完了通知)
//   stop()                      停止
//   pause() / resume()          一時停止 / 再開 (Web: native API、Capacitor: stop+restart)
//   isPlaying() / isPaused()    同期 boolean
//   isSupported()               native or Web Speech API が使えるか
//   subscribe(cb)               isPlaying 変化を購読 (unsubscribe 関数を返す)
//   getAvailableVoices()        利用可能ボイス一覧 (TtsVoice[])
//   loadRate() / saveRate(rate) 速度設定の永続化
//   loadVoiceId() / saveVoiceId voice 設定の永続化
//
// バックグラウンド再生 (Tier 1/2 keep-alive、Cloud TTS 非依存):
//   speak() の冒頭で silent audio loop と Wake Lock を開始し、stop() で解放する。
//   - Silent loop: 極小サイズの無音 WAV (data URI) を <audio loop> で再生し、
//     OS のオーディオフォーカス / メディア再生扱いを維持する。
//     iOS では AVAudioSession active が継続し、Web Speech / native TTS が背景でも継続再生する見込み。
//     Android では HTMLAudio が背景で suspend されやすいため、Wake Lock 併用で画面オフ耐性を底上げする。
//   - Wake Lock: navigator.wakeLock.request('screen') で画面オフ自体を抑止する fallback。
//     ユーザーの省電力設定に従うため強制ではない。Android で確実に背景再生したい場合は
//     将来 ForegroundService 化 (docs/TTS_BACKGROUND_DESIGN.md Tier 3) が必要。
//   - 失敗しても speak 本体は続行する (best-effort)。

import { getLocale } from './i18n'

const RATE_KEY = 'logic-tts-rate'
const VOICE_KEY = 'logic-tts-voice'
const PITCH_KEY = 'logic-tts-pitch'
const DEFAULT_RATE = 1.0
const MIN_RATE = 0.5
const MAX_RATE = 2.0
const DEFAULT_PITCH = 1.0
const MIN_PITCH = 0.5
const MAX_PITCH = 2.0

type Listener = (playing: boolean) => void

let playing = false
let paused = false
const listeners = new Set<Listener>()

function setPlaying(v: boolean): void {
  if (playing === v) return
  playing = v
  if (!v) paused = false
  for (const cb of listeners) {
    try { cb(v) } catch (e) { console.warn('[tts] listener error', e) }
  }
}

export function isPlaying(): boolean {
  return playing
}

export function isPaused(): boolean {
  return paused
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

// ── Voice pref ─────────────────────────────────────────────────

export function loadVoiceId(): string | null {
  try {
    const raw = localStorage.getItem(VOICE_KEY)
    return raw && raw.length > 0 ? raw : null
  } catch { return null }
}

export function saveVoiceId(id: string | null): void {
  try {
    if (id) localStorage.setItem(VOICE_KEY, id)
    else localStorage.removeItem(VOICE_KEY)
  } catch { /* */ }
}

// ── Pitch pref ─────────────────────────────────────────────────
// SpeechSynthesisUtterance.pitch / Capacitor TextToSpeech.speak({ pitch }) は
// 共に 0〜2 の範囲を取り、1.0 = 通常。本アプリでは 0.5〜2.0 に丸めて保存する。

export function loadPitch(): number {
  try {
    const raw = localStorage.getItem(PITCH_KEY)
    if (!raw) return DEFAULT_PITCH
    const n = Number(raw)
    if (Number.isFinite(n) && n >= MIN_PITCH && n <= MAX_PITCH) return n
  } catch { /* */ }
  return DEFAULT_PITCH
}

export function savePitch(pitch: number): void {
  const clamped = Math.min(MAX_PITCH, Math.max(MIN_PITCH, pitch))
  try { localStorage.setItem(PITCH_KEY, String(clamped)) } catch { /* */ }
}

// ── Language detection ─────────────────────────────────────────

function defaultLang(): 'ja-JP' | 'en-US' {
  return getLocale() === 'ja' ? 'ja-JP' : 'en-US'
}

// ── Voice listing & gender hints ───────────────────────────────

export type TtsGender = 'male' | 'female' | 'unknown'

export type TtsVoice = {
  id: string           // `${lang}|${name}` — Web/native 共通の安定キー
  name: string         // 表示名 (端末ローカル名)
  lang: string         // BCP47
  gender: TtsGender
  isDefault?: boolean
  // 内部用 (UI には出さない)
  nativeIndex?: number             // Capacitor: getSupportedVoices() の index
  webVoice?: SpeechSynthesisVoice  // Web: そのまま渡す
}

// 端末ボイス名から性別を推測するためのキーワードテーブル。
// iOS / Android / Web 各環境でよく観測される名前を対象に、雑に当てる。
// 該当しない場合は 'unknown' を返し、UI 上は「その他の声」に集約する。
const VOICE_GENDER_HINTS: Record<TtsGender, string[]> = {
  female: [
    'kyoko', 'otoya-female', 'female', 'woman', 'girl',
    // ja: iOS 標準 / Google
    'o-ren', 'siri', 'hattori', // Hattori は Android の女性枠ではないが控えめにロジック側で個別判定
    // en: iOS
    'samantha', 'allison', 'ava', 'susan', 'karen', 'tessa', 'veena', 'fiona', 'moira', 'serena',
    'victoria', 'kate', 'zoe', 'zoë', 'evan-female',
    // Google Wavenet/Neural2 系: 末尾 A/C/E/F は女性が多い
    'wavenet-a', 'wavenet-c', 'wavenet-e', 'wavenet-f',
    'neural2-a', 'neural2-c', 'neural2-e', 'neural2-f',
    'studio-a', 'studio-c', 'studio-e', 'studio-f',
    'standard-a', 'standard-c', 'standard-e', 'standard-f',
  ],
  male: [
    'otoya', 'male', 'man', 'boy',
    'hattori', 'ichiro', 'sora-male',
    'daniel', 'alex', 'fred', 'tom', 'aaron', 'arthur', 'oliver', 'rishi', 'lee', 'gordon',
    // Google Wavenet/Neural2 系: 末尾 B/D が男性が多い
    'wavenet-b', 'wavenet-d',
    'neural2-b', 'neural2-d',
    'studio-b', 'studio-d',
    'standard-b', 'standard-d',
  ],
  unknown: [],
}

function inferGender(name: string): TtsGender {
  const lower = name.toLowerCase()
  // female を先に判定（重複キー "hattori" は女性側に弱く入っているが、`some` の最後勝ちで male が勝つ）
  if (VOICE_GENDER_HINTS.female.some(k => lower.includes(k))) {
    // male 側にも明示的に当たっていれば male 優先
    if (VOICE_GENDER_HINTS.male.some(k => lower.includes(k))) return 'male'
    return 'female'
  }
  if (VOICE_GENDER_HINTS.male.some(k => lower.includes(k))) return 'male'
  return 'unknown'
}

function makeVoiceId(lang: string, name: string): string {
  return `${lang}|${name}`
}

let voiceCache: TtsVoice[] | null = null
let voiceCacheLocale: string | null = null

/**
 * 利用可能な TTS ボイスを返す。
 * Web は `speechSynthesis.getVoices()`、native は `TextToSpeech.getSupportedVoices()`。
 * 一覧は startup 直後に空配列のことが多いので、Web では `voiceschanged` を 1 回だけ待つ。
 */
export async function getAvailableVoices(): Promise<TtsVoice[]> {
  const locale = getLocale()
  if (voiceCache && voiceCacheLocale === locale) return voiceCache

  if (isNative()) {
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
      const { voices } = await TextToSpeech.getSupportedVoices()
      const result: TtsVoice[] = voices.map((v, i) => ({
        id: makeVoiceId(v.lang, v.name),
        name: v.name,
        lang: v.lang,
        gender: inferGender(v.name),
        isDefault: v.default,
        nativeIndex: i,
      }))
      voiceCache = result
      voiceCacheLocale = locale
      return result
    } catch (e) {
      console.warn('[tts] native getSupportedVoices error', e)
      return []
    }
  }

  if (!hasWebSpeech()) return []

  const synth = window.speechSynthesis
  const grab = (): TtsVoice[] => synth.getVoices().map(v => ({
    id: makeVoiceId(v.lang, v.name),
    name: v.name,
    lang: v.lang,
    gender: inferGender(v.name),
    isDefault: v.default,
    webVoice: v,
  }))

  let list = grab()
  if (list.length === 0) {
    // Chrome は voices をレイジーロードする → 'voiceschanged' を 1 回だけ待つ
    list = await new Promise<TtsVoice[]>((resolve) => {
      let resolved = false
      const onChanged = () => {
        if (resolved) return
        resolved = true
        synth.removeEventListener('voiceschanged', onChanged)
        resolve(grab())
      }
      synth.addEventListener('voiceschanged', onChanged, { once: true })
      // 念のため 500ms で諦める
      setTimeout(() => {
        if (resolved) return
        resolved = true
        synth.removeEventListener('voiceschanged', onChanged)
        resolve(grab())
      }, 500)
    })
  }

  voiceCache = list
  voiceCacheLocale = locale
  return list
}

// ── Voice display label helpers ────────────────────────────────
//
// 端末によっては多数の Web Speech voice が同じ lang (ja-JP) で並ぶことがあり、
// 単純に lang を表示するだけでは「日本語-日本」「日本語-日本」…と区別が付かなくなる。
// 性別ラベル + name (端末固有名) + lang を組み合わせて「Kyoko · 女性 · ja-JP」のような
// ユニーク表示にする。性別が unknown のときは「ボイス2」のような連番フォールバックでも
// 良いが、ここでは name が必ず付くので name をそのまま出す。
//
// 引数:
//   voice       : 表示対象の TtsVoice
//   labelFor    : i18n キー → 文字列に解決する関数 (UI 側で渡す)
//                 'female' / 'male' / 'unknown' のいずれかを受ける
export function formatVoiceLabel(
  voice: TtsVoice,
  labelFor: (gender: TtsGender) => string,
): string {
  const parts: string[] = []
  // 端末固有の voice name (Kyoko / Otoya / Google 日本語 など)。空ならフォールバック表記。
  const name = (voice.name ?? '').trim() || voice.lang || 'voice'
  parts.push(name)
  const g = labelFor(voice.gender)
  if (g) parts.push(g)
  if (voice.lang) parts.push(voice.lang)
  return parts.join(' · ')
}

function resolveVoiceForLang(voices: TtsVoice[], lang: 'ja-JP' | 'en-US', voiceId: string | null | undefined): TtsVoice | undefined {
  if (!voiceId) {
    // デフォルト: 指定 lang のうち default フラグがあるもの → なければ最初の lang 一致
    const matched = voices.filter(v => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
    if (matched.length === 0) return undefined
    return matched.find(v => v.isDefault) ?? matched[0]
  }
  return voices.find(v => v.id === voiceId)
}

// ── Background keep-alive (silent audio loop + screen wake lock) ─

// 0.5 秒の無音 WAV を loop 再生して OS のオーディオフォーカスを掴み続ける。
// public/silent.wav (44 KB, 16bit/44.1kHz mono) は Capacitor WebView の root に配置され、
// `/silent.wav` で参照可能。loop=true で間隔を空けずに繰り返す。
//
// なぜ無音オーディオが必要か:
//   iOS の AVAudioSession は HTMLAudio が再生中の間だけ playback カテゴリで active になる。
//   無音でもオーディオが流れていれば「メディア再生中」と判定され、AVSpeechSynthesizer による
//   TTS も背景で発話継続しやすくなる。
//   Android では JS / HTMLAudio が背景で suspend されやすいため Wake Lock と併用する。
const SILENT_AUDIO_URL = '/silent.wav'

let silentAudio: HTMLAudioElement | null = null
let wakeLockSentinel: { release: () => Promise<void> } | null = null

function startKeepAlive(): void {
  // Silent audio loop
  try {
    if (!silentAudio && typeof Audio !== 'undefined') {
      const a = new Audio(SILENT_AUDIO_URL)
      a.loop = true
      a.volume = 0
      a.preload = 'auto'
      // iOS / Safari は autoplay restrictions があるが、speak() はユーザー操作起点で
      // 呼ばれる前提なので play() は概ね許可される。失敗しても無視。
      const p = a.play()
      if (p && typeof (p as Promise<void>).then === 'function') {
        ;(p as Promise<void>).catch(() => { /* ignore autoplay reject */ })
      }
      silentAudio = a
    }
  } catch (e) {
    console.warn('[tts] keepalive silent audio start error', e)
  }

  // Screen Wake Lock (画面オフ抑止 — 省電力設定に従う best-effort)
  try {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> }
    }
    if (!wakeLockSentinel && nav.wakeLock?.request) {
      nav.wakeLock.request('screen')
        .then((sentinel) => { wakeLockSentinel = sentinel })
        .catch(() => { /* permission denied or unsupported */ })
    }
  } catch (e) {
    console.warn('[tts] wake lock request error', e)
  }
}

function stopKeepAlive(): void {
  // Silent audio loop 停止
  try {
    if (silentAudio) {
      silentAudio.pause()
      silentAudio.src = ''
      silentAudio = null
    }
  } catch (e) {
    console.warn('[tts] keepalive silent audio stop error', e)
  }

  // Wake Lock 解放
  try {
    if (wakeLockSentinel) {
      void wakeLockSentinel.release().catch(() => { /* */ })
      wakeLockSentinel = null
    }
  } catch (e) {
    console.warn('[tts] wake lock release error', e)
  }
}

// ── Speak / Stop / Pause / Resume ──────────────────────────────

export type SpeakOptions = {
  lang?: 'ja-JP' | 'en-US'
  rate?: number
  pitch?: number
  voiceId?: string | null
  onEnd?: () => void  // 自然終了時のみ呼ばれる (stop / interrupt では呼ばれない)
}

let currentUtterance: SpeechSynthesisUtterance | null = null
let currentOnEnd: (() => void) | null = null

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
  // stop は onEnd を呼ばない (自然終了との区別が必要)
  currentOnEnd = null
  setPlaying(false)
  if (isNative()) {
    await stopNative()
  } else {
    stopWeb()
  }
  // 明示 stop 時は keep-alive も解放してバッテリー消費を抑える
  stopKeepAlive()
}

/**
 * 一時停止。Web は speechSynthesis.pause() を使う。
 * Native (Capacitor) は pause API がないため stop() に fall back する。
 * → native 環境では resume() は再 speak が必要 (LessonStoriesScreen 側で扱う)。
 */
export async function pause(): Promise<void> {
  if (!playing) return
  if (isNative()) {
    // 擬似 pause: 完全停止する。再開は呼び出し側で speak し直す。
    paused = true
    await stopNative()
    return
  }
  if (hasWebSpeech()) {
    try {
      window.speechSynthesis.pause()
      paused = true
    } catch (e) {
      console.warn('[tts] web pause error', e)
    }
  }
}

/**
 * 再開。Web は speechSynthesis.resume() で動く。
 * Native は pause() が stop と同義なので、resume は呼び出し側で speak を再発行する。
 */
export async function resume(): Promise<void> {
  if (isNative()) {
    paused = false
    return
  }
  if (hasWebSpeech()) {
    try {
      window.speechSynthesis.resume()
      paused = false
    } catch (e) {
      console.warn('[tts] web resume error', e)
    }
  }
}

async function speakNative(text: string, opts: SpeakOptions): Promise<void> {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
    // Flush previous request to avoid queuing
    try { await TextToSpeech.stop() } catch { /* ignore */ }
    setPlaying(true)
    paused = false

    // voice index 解決
    let voiceIndex: number | undefined
    if (opts.voiceId !== undefined && opts.voiceId !== null) {
      const voices = await getAvailableVoices()
      const matched = voices.find(v => v.id === opts.voiceId)
      voiceIndex = matched?.nativeIndex
    }

    // speak() resolves when the utterance finishes (or errors).
    await TextToSpeech.speak({
      text,
      lang: opts.lang ?? defaultLang(),
      rate: opts.rate ?? loadRate(),
      pitch: opts.pitch ?? loadPitch(),
      volume: 1.0,
      category: 'playback',
      voice: voiceIndex,
    })
    // 自然終了。stop で呼ばれた場合は currentOnEnd が null にされている。
    const cb = currentOnEnd
    currentOnEnd = null
    setPlaying(false)
    if (cb) {
      try { cb() } catch (e) { console.warn('[tts] onEnd cb error', e) }
    }
  } catch (e) {
    console.warn('[tts] native speak error', e)
    currentOnEnd = null
    setPlaying(false)
  }
}

async function speakWebAsync(text: string, opts: SpeakOptions): Promise<void> {
  if (!hasWebSpeech()) return
  try {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = opts.lang ?? defaultLang()
    utter.rate = opts.rate ?? loadRate()
    utter.pitch = opts.pitch ?? loadPitch()
    utter.volume = 1.0

    // voice 解決
    if (opts.voiceId !== undefined) {
      const voices = await getAvailableVoices()
      const matched = resolveVoiceForLang(voices, utter.lang as 'ja-JP' | 'en-US', opts.voiceId)
      if (matched?.webVoice) utter.voice = matched.webVoice
    }

    utter.onend = () => {
      if (currentUtterance === utter) currentUtterance = null
      const cb = currentOnEnd
      currentOnEnd = null
      setPlaying(false)
      if (cb) {
        try { cb() } catch (e) { console.warn('[tts] onEnd cb error', e) }
      }
    }
    utter.onerror = (ev) => {
      // 'interrupted' / 'canceled' は意図的な stop の結果なので warn しない
      const errType = (ev as SpeechSynthesisErrorEvent).error
      if (errType && errType !== 'interrupted' && errType !== 'canceled') {
        console.warn('[tts] web utterance error', errType)
      }
      if (currentUtterance === utter) currentUtterance = null
      // エラー時は onEnd を呼ばない (stop と同様の扱い)
      currentOnEnd = null
      setPlaying(false)
    }
    currentUtterance = utter
    setPlaying(true)
    paused = false
    window.speechSynthesis.speak(utter)
  } catch (e) {
    console.warn('[tts] web speak error', e)
    currentOnEnd = null
    setPlaying(false)
  }
}

/**
 * Start speaking the given text. Cancels any in-progress utterance first.
 * Returns immediately on Web; awaits completion on native (but you can call stop()).
 * onEnd は「自然終了」のみで呼ばれる。stop() / pause() / error では呼ばれない。
 */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!text || !text.trim()) return
  if (!isSupported()) {
    console.warn('[tts] not supported in this environment')
    return
  }
  // 既存の onEnd は新しい再生で上書き
  currentOnEnd = opts.onEnd ?? null
  // 背景再生 keep-alive (silent audio loop + wake lock) を起動。
  // 連続スライド再生時は startKeepAlive() が冪等なので毎回呼んでも単一インスタンスのまま。
  // 明示 stop() 時のみ解放される。
  startKeepAlive()
  if (isNative()) {
    await speakNative(text, opts)
  } else {
    await speakWebAsync(text, opts)
  }
}
