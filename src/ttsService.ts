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
//   logic-tts-rate     : 1.0 (number, 0.5〜2.0)
//   logic-tts-pitch    : 1.0 (number, 0.5〜2.0) — TtsControlPanel のピッチ調整 (低め/普通/高め)
//   logic-tts-voice    : voice id (string `${lang}|${name}`)
//   logic-tts-autoplay : '1' | '0' — コース紹介 TTS のオート連続再生（既定: ON）
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
import { normalizeForSpeech } from './ttsReadings'

const RATE_KEY = 'logic-tts-rate'
const VOICE_KEY = 'logic-tts-voice'
const PITCH_KEY = 'logic-tts-pitch'
const AUTOPLAY_KEY = 'logic-tts-autoplay'
const DEFAULT_RATE = 1.0
const MIN_RATE = 0.5
const MAX_RATE = 2.0
const DEFAULT_PITCH = 1.0
const MIN_PITCH = 0.5
const MAX_PITCH = 2.0
const DEFAULT_AUTOPLAY = true

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
  // native / Web Speech に加え、オンラインならクラウド TTS も使える
  return isNative() || hasWebSpeech() || isCloudAvailable()
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

// ── Autoplay pref ──────────────────────────────────────────────
// コース紹介 TTS の「自動連続再生」を ON/OFF する永続フラグ。
// ON: 1 つのコースカードの読み上げが自然終了したら、同じグループ内の次のカードへ自動で進む
// OFF: 自然終了で停止し、ユーザーが次のカードを明示タップするまで再生しない
// 値は '1' / '0' で localStorage に保存。未設定時は ON (DEFAULT_AUTOPLAY) を採用。

type AutoplayListener = (autoplay: boolean) => void
const autoplayListeners = new Set<AutoplayListener>()

export function loadAutoplay(): boolean {
  try {
    const raw = localStorage.getItem(AUTOPLAY_KEY)
    if (raw === '1') return true
    if (raw === '0') return false
  } catch { /* */ }
  return DEFAULT_AUTOPLAY
}

export function saveAutoplay(enabled: boolean): void {
  try { localStorage.setItem(AUTOPLAY_KEY, enabled ? '1' : '0') } catch { /* */ }
  for (const cb of autoplayListeners) {
    try { cb(enabled) } catch (e) { console.warn('[tts] autoplay listener error', e) }
  }
}

export function subscribeAutoplay(cb: AutoplayListener): () => void {
  autoplayListeners.add(cb)
  return () => { autoplayListeners.delete(cb) }
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

// ── Cloud (Google Cloud TTS) voices ────────────────────────────
//
// クラウドが使える状況（オンライン）では、キュレートしたクラウドボイスを
// getAvailableVoices() の先頭に並べる。voice id は `cloud|<lang>|<voiceName>` で
// native/web の `${lang}|${name}` と衝突しない命名にする。
// gender ラベルは inferGender に頼らず明示指定する（Neural2 の末尾規則だけだと曖昧なため）。
//
// クラウドが既定になる時の既定ボイスは ja の女性（Neural2-C、現状の声に近い）。

export const CLOUD_VOICE_PREFIX = 'cloud|'

type CloudVoiceDef = {
  voiceName: string
  lang: 'ja-JP' | 'en-US'
  gender: TtsGender
  isDefault?: boolean
}

// 音声は「女性」「男性」の 2 種のみに絞る（lang ごとに女性 1 / 男性 1）。
// server/routes/tts.ts の ALLOWED_VOICES と一致させること。
const CLOUD_VOICE_CATALOG: CloudVoiceDef[] = [
  // ja-JP
  { voiceName: 'ja-JP-Neural2-C', lang: 'ja-JP', gender: 'female', isDefault: true },
  { voiceName: 'ja-JP-Neural2-D', lang: 'ja-JP', gender: 'male' },
  // en-US
  { voiceName: 'en-US-Neural2-F', lang: 'en-US', gender: 'female', isDefault: true },
  { voiceName: 'en-US-Neural2-D', lang: 'en-US', gender: 'male' },
]

export function makeCloudVoiceId(lang: string, voiceName: string): string {
  return `${CLOUD_VOICE_PREFIX}${lang}|${voiceName}`
}

export function isCloudVoiceId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith(CLOUD_VOICE_PREFIX)
}

/** `cloud|ja-JP|ja-JP-Neural2-C` → { lang, voiceName }。形式不正なら null。 */
export function parseCloudVoiceId(id: string): { lang: 'ja-JP' | 'en-US'; voiceName: string } | null {
  if (!isCloudVoiceId(id)) return null
  const rest = id.slice(CLOUD_VOICE_PREFIX.length)
  const sep = rest.indexOf('|')
  if (sep <= 0) return null
  const lang = rest.slice(0, sep)
  const voiceName = rest.slice(sep + 1)
  if ((lang !== 'ja-JP' && lang !== 'en-US') || !voiceName) return null
  return { lang, voiceName }
}

function cloudVoicesForCatalog(): TtsVoice[] {
  return CLOUD_VOICE_CATALOG.map(def => ({
    id: makeCloudVoiceId(def.lang, def.voiceName),
    name: def.voiceName,
    lang: def.lang,
    gender: def.gender,
    isDefault: def.isDefault,
  }))
}

// クラウドが使えるか（= オンラインかどうか）。navigator.onLine を主判定に使う。
// onLine が false 確定のときだけ無効化し、true / 不明のときは試す（試して失敗したら
// speakCloud 側で端末 TTS にフォールバックするため、楽観的に倒してよい）。
export function isCloudAvailable(): boolean {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return false
  } catch { /* */ }
  return true
}

let voiceCache: TtsVoice[] | null = null
let voiceCacheLocale: string | null = null

/**
 * 利用可能な TTS ボイスを返す。
 * クラウドが使える（オンライン）ときはキュレートしたクラウドボイスを先頭に並べ、
 * 続けて Web は `speechSynthesis.getVoices()`、native は `TextToSpeech.getSupportedVoices()`。
 * 一覧は startup 直後に空配列のことが多いので、Web では `voiceschanged` を 1 回だけ待つ。
 */
export async function getAvailableVoices(): Promise<TtsVoice[]> {
  const locale = getLocale()
  if (voiceCache && voiceCacheLocale === locale) return voiceCache

  // クラウドボイス（オンライン時のみ先頭に差し込む）
  const cloud: TtsVoice[] = isCloudAvailable() ? cloudVoicesForCatalog() : []

  if (isNative()) {
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
      const { voices } = await TextToSpeech.getSupportedVoices()
      const nativeVoices: TtsVoice[] = voices.map((v, i) => ({
        id: makeVoiceId(v.lang, v.name),
        name: v.name,
        lang: v.lang,
        gender: inferGender(v.name),
        // クラウドが既定を持つ場合は native の default を落とす（クラウド優先）
        isDefault: cloud.length > 0 ? false : v.default,
        nativeIndex: i,
      }))
      const result = [...cloud, ...nativeVoices]
      voiceCache = result
      voiceCacheLocale = locale
      return result
    } catch (e) {
      console.warn('[tts] native getSupportedVoices error', e)
      // native 取得に失敗してもクラウドだけは返す（オンラインなら読み上げ可能）
      voiceCache = cloud
      voiceCacheLocale = locale
      return cloud
    }
  }

  if (!hasWebSpeech()) {
    voiceCache = cloud
    voiceCacheLocale = locale
    return cloud
  }

  const synth = window.speechSynthesis
  const grab = (): TtsVoice[] => synth.getVoices().map(v => ({
    id: makeVoiceId(v.lang, v.name),
    name: v.name,
    lang: v.lang,
    gender: inferGender(v.name),
    // クラウドが既定を持つ場合は web の default を落とす（クラウド優先）
    isDefault: cloud.length > 0 ? false : v.default,
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

  const merged = [...cloud, ...list]
  voiceCache = merged
  voiceCacheLocale = locale
  return merged
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

// ── Cloud TTS playback (Google Cloud TTS proxy 経由) ────────────
//
// クラウドボイスが選ばれている / クラウドが既定のときは speakCloud() を使う。
// POST /api/tts → base64 mp3 → HTMLAudio で再生する。
// pause/resume は HTMLAudio なので native のような stop+restart は不要。
//
// キャッシュ: hash(text+voiceName+rate+pitch) をキーに base64 をメモリ Map に保持（LRU 的に上限件数）。
//   さらに Cache Storage API が使える環境では `data:audio/mp3;base64,...` を Response として
//   永続化し、オフライン再生も効かせる（best-effort、失敗してもメモリキャッシュで動く）。

const CLOUD_CACHE_NAME = 'logic-tts-cloud-v1'
const MEM_CACHE_LIMIT = 60

// メモリキャッシュ（挿入順 Map で LRU 的に古いものから捨てる）
const memCloudCache = new Map<string, string>()

function cloudCacheKey(text: string, voiceName: string, rate: number, pitch: number): string {
  // 簡易ハッシュ（FNV-1a 32bit）。text が長いので全文は使わず確定的ハッシュにする。
  const raw = `${voiceName}|${rate}|${pitch}|${text}`
  let h = 0x811c9dc5
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return `tts_${h.toString(16)}_${raw.length}`
}

function memCacheGet(key: string): string | undefined {
  const v = memCloudCache.get(key)
  if (v !== undefined) {
    // touch: 末尾に移動して LRU を維持
    memCloudCache.delete(key)
    memCloudCache.set(key, v)
  }
  return v
}

function memCacheSet(key: string, b64: string): void {
  if (memCloudCache.has(key)) memCloudCache.delete(key)
  memCloudCache.set(key, b64)
  while (memCloudCache.size > MEM_CACHE_LIMIT) {
    const oldest = memCloudCache.keys().next().value
    if (oldest === undefined) break
    memCloudCache.delete(oldest)
  }
}

// Cache Storage（永続）。失敗は握りつぶしてメモリキャッシュにフォールバック。
async function persistentCacheGet(key: string): Promise<string | undefined> {
  try {
    if (typeof caches === 'undefined') return undefined
    const cache = await caches.open(CLOUD_CACHE_NAME)
    const res = await cache.match(`/tts-cache/${key}`)
    if (!res) return undefined
    const b64 = await res.text()
    return b64 || undefined
  } catch { return undefined }
}

async function persistentCacheSet(key: string, b64: string): Promise<void> {
  try {
    if (typeof caches === 'undefined') return
    const cache = await caches.open(CLOUD_CACHE_NAME)
    await cache.put(`/tts-cache/${key}`, new Response(b64, { headers: { 'Content-Type': 'text/plain' } }))
  } catch { /* */ }
}

// API_BASE は @capacitor/core を import している（apiBase.ts）ため動的 import で循環/テスト汚染を避ける。
async function resolveApiBase(): Promise<string> {
  try {
    const mod = await import('./apiBase')
    return mod.API_BASE
  } catch { return '' }
}

/**
 * クラウド TTS で合成した base64 mp3 を取得する。
 * キャッシュヒット時はネットワークを叩かない。503 / 失敗時は null を返す（呼び出し側でフォールバック）。
 */
async function fetchCloudAudio(
  text: string,
  lang: 'ja-JP' | 'en-US',
  voiceName: string,
  rate: number,
  pitch: number,
): Promise<string | null> {
  const key = cloudCacheKey(text, voiceName, rate, pitch)
  const mem = memCacheGet(key)
  if (mem) return mem
  const persisted = await persistentCacheGet(key)
  if (persisted) {
    memCacheSet(key, persisted)
    return persisted
  }

  try {
    const base = await resolveApiBase()
    const res = await fetch(`${base}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang, voiceName, rate, pitch }),
    })
    if (!res.ok) {
      // 503 (キー未設定) / 502 (合成失敗) / 429 など → フォールバックさせる
      return null
    }
    const data = (await res.json()) as { audioContent?: string }
    const b64 = data.audioContent
    if (!b64) return null
    memCacheSet(key, b64)
    void persistentCacheSet(key, b64)
    return b64
  } catch {
    // オフライン / ネットワークエラー → フォールバック
    return null
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
let currentCloudAudio: HTMLAudioElement | null = null

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

function stopCloud(): void {
  if (currentCloudAudio) {
    try {
      currentCloudAudio.onended = null
      currentCloudAudio.onerror = null
      currentCloudAudio.pause()
      currentCloudAudio.src = ''
    } catch (e) {
      console.warn('[tts] cloud stop error', e)
    }
    currentCloudAudio = null
  }
}

export async function stop(): Promise<void> {
  // stop は onEnd を呼ばない (自然終了との区別が必要)
  currentOnEnd = null
  setPlaying(false)
  // クラウド再生中なら HTMLAudio を止める。経路を問わず常に呼んで安全に倒す。
  stopCloud()
  if (isNative()) {
    await stopNative()
  } else {
    stopWeb()
  }
  // 明示 stop 時は keep-alive も解放してバッテリー消費を抑える
  stopKeepAlive()
}

/**
 * 一時停止。
 * クラウド再生中: HTMLAudio.pause()（resume() で続きから再生できる）。
 * Web: speechSynthesis.pause()。
 * Native (Capacitor): pause API がないため stop() に fall back（resume は呼び出し側で再 speak）。
 */
export async function pause(): Promise<void> {
  if (!playing) return
  if (currentCloudAudio) {
    try {
      currentCloudAudio.pause()
      paused = true
    } catch (e) {
      console.warn('[tts] cloud pause error', e)
    }
    return
  }
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
 * 再開。
 * クラウド再生中: HTMLAudio.play() で続きから。
 * Web: speechSynthesis.resume()。
 * Native: pause() が stop と同義なので resume は呼び出し側で speak を再発行する。
 */
export async function resume(): Promise<void> {
  if (currentCloudAudio) {
    try {
      void currentCloudAudio.play().catch(() => { /* */ })
      paused = false
    } catch (e) {
      console.warn('[tts] cloud resume error', e)
    }
    return
  }
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

/**
 * クラウド再生（HTMLAudio, MP3）の時間軸シーク。
 * - クラウド音声が再生中: currentTime を ±seconds する。範囲内に丸める。
 *   その後の挙動（スライド境界をまたぐか）は呼び出し側で currentTime / duration を見て判断する。
 *   このリクエストでシークが行えたら true、行えなかった（native/web で時間軸が無い等）なら false を返す。
 * - native/web TTS: 時間軸を持たないので false を返す。呼び出し側はスライド送りにフォールバックする。
 */
export function skipSeconds(seconds: number): boolean {
  const audio = currentCloudAudio
  if (!audio) return false
  try {
    const dur = Number.isFinite(audio.duration) ? audio.duration : 0
    const next = Math.max(0, audio.currentTime + seconds)
    // duration が判明していれば末尾を超えない範囲にクランプ（超えたら呼び出し側で次スライド送り判断）
    audio.currentTime = dur > 0 ? Math.min(dur, next) : next
    return true
  } catch (e) {
    console.warn('[tts] skipSeconds error', e)
    return false
  }
}

/** クラウド再生中なら現在の再生位置（秒）。それ以外（native/web/停止中）は null。 */
export function getCloudCurrentTime(): number | null {
  const audio = currentCloudAudio
  if (!audio) return null
  return Number.isFinite(audio.currentTime) ? audio.currentTime : null
}

/** クラウド再生中なら音声の総尺（秒）。不明 / それ以外は null。 */
export function getCloudDuration(): number | null {
  const audio = currentCloudAudio
  if (!audio) return null
  return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null
}

/** 現在クラウド（HTMLAudio）経路で再生中か。±10秒の時間シークが使えるかの判定に使う。 */
export function isCloudPlaying(): boolean {
  return currentCloudAudio !== null
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
 * クラウド TTS で読み上げる。base64 mp3 を取得して HTMLAudio で再生する。
 * 成功したら true、フォールバックが必要なら false を返す（503 / オフライン / 取得失敗 / Audio 不可）。
 * 失敗時は state を変更せず呼び出し側で native/web にフォールバックさせる。
 */
async function speakCloud(text: string, lang: 'ja-JP' | 'en-US', voiceName: string, opts: SpeakOptions): Promise<boolean> {
  if (typeof Audio === 'undefined') return false
  const rate = opts.rate ?? loadRate()
  const pitch = opts.pitch ?? loadPitch()

  const b64 = await fetchCloudAudio(text, lang, voiceName, rate, pitch)
  if (!b64) return false

  try {
    // 直前の再生を確実に止める（連続スライド時の二重再生防止）
    stopCloud()
    stopWeb()

    const audio = new Audio(`data:audio/mp3;base64,${b64}`)
    audio.onended = () => {
      if (currentCloudAudio === audio) currentCloudAudio = null
      const cb = currentOnEnd
      currentOnEnd = null
      setPlaying(false)
      if (cb) {
        try { cb() } catch (e) { console.warn('[tts] onEnd cb error', e) }
      }
    }
    audio.onerror = () => {
      if (currentCloudAudio === audio) currentCloudAudio = null
      // エラー時は onEnd を呼ばない (stop と同様の扱い)
      currentOnEnd = null
      setPlaying(false)
    }
    currentCloudAudio = audio
    setPlaying(true)
    paused = false
    await audio.play().catch((e) => {
      // autoplay reject 等。play できなければフォールバックさせるため state を戻す。
      console.warn('[tts] cloud audio play error', e)
      if (currentCloudAudio === audio) currentCloudAudio = null
      throw e
    })
    return true
  } catch {
    // 再生開始に失敗 → フォールバック
    if (currentCloudAudio === null) setPlaying(false)
    return false
  }
}

/**
 * このリクエストでクラウド経路を使うべきか判定し、使うなら voiceName を返す。
 * - 明示的にクラウド voiceId が指定されている → その voiceName
 * - voiceId が未指定 (null/undefined) かつクラウドが既定として使える → 既定ボイス
 * - それ以外（native/web の特定ボイス指定）→ null（クラウドを使わない）
 */
function resolveCloudVoiceName(lang: 'ja-JP' | 'en-US', voiceId: string | null | undefined): string | null {
  if (isCloudVoiceId(voiceId)) {
    const parsed = parseCloudVoiceId(voiceId as string)
    if (parsed) return parsed.voiceName
    return null
  }
  // 明示的に native/web の特定ボイスが選ばれている場合はクラウドを使わない
  if (voiceId) return null
  // voiceId 未指定 & クラウドが使える → クラウドを既定にする（ja は女性 Neural2-C 相当）
  if (isCloudAvailable()) {
    const def = CLOUD_VOICE_CATALOG.find(v => v.lang === lang && v.isDefault)
      ?? CLOUD_VOICE_CATALOG.find(v => v.lang === lang)
    return def ? def.voiceName : null
  }
  return null
}

/**
 * Start speaking the given text. Cancels any in-progress utterance first.
 * Returns immediately on Web; awaits completion on native (but you can call stop()).
 * onEnd は「自然終了」のみで呼ばれる。stop() / pause() / error では呼ばれない。
 *
 * クラウドボイス選択時 / クラウド既定時は speakCloud() を優先し、503・オフライン・
 * 取得失敗のときは既存の native/web TTS に自動フォールバックする（無音にしない）。
 */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!text || !text.trim()) return
  if (!isSupported()) {
    console.warn('[tts] not supported in this environment')
    return
  }
  // 記号誤読対策の読み正規化を speak() 側で 1 回だけ通す（speakCloud / speakNative /
  // speakWebAsync いずれにも効かせるため。二重変換を避けるため下位関数では変換しない）。
  // 表示テキストは変えず、読み上げ用に「×→かける」等を補正する。
  const lang = opts.lang ?? defaultLang()
  text = normalizeForSpeech(text, lang)
  // 既存の onEnd は新しい再生で上書き
  currentOnEnd = opts.onEnd ?? null
  // 背景再生 keep-alive (silent audio loop + wake lock) を起動。
  // 連続スライド再生時は startKeepAlive() が冪等なので毎回呼んでも単一インスタンスのまま。
  // 明示 stop() 時のみ解放される。
  startKeepAlive()

  // ── クラウド経路（優先、失敗時は下の native/web にフォールバック）──
  const cloudVoiceName = resolveCloudVoiceName(lang, opts.voiceId)
  if (cloudVoiceName) {
    const ok = await speakCloud(text, lang, cloudVoiceName, opts)
    if (ok) return
    // フォールバック時は、明示クラウド voiceId を native/web に渡すと解決できないので
    // voiceId を落として既定ボイスで読む。
    opts = { ...opts, voiceId: null }
  }

  if (isNative()) {
    await speakNative(text, opts)
  } else {
    await speakWebAsync(text, opts)
  }
}
