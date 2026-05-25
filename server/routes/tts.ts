/**
 * /api/tts — Google Cloud Text-to-Speech proxy
 *
 * クライアントから受け取ったテキストを Google Cloud TTS で合成し、base64 MP3 を返す。
 * API キーをサーバー側に隠蔽し、クライアントは音声を受け取って再生するだけにする。
 *
 * 設計:
 * - POST /api/tts body: { text, lang: 'ja-JP'|'en-US', voiceName?, rate?, pitch? }
 * - GOOGLE_TTS_API_KEY が未設定なら 503 + { error: 'tts_unavailable' } を返し、
 *   クライアントは既存の端末(native)/Web TTS へフォールバックできる（オフライン維持）。
 * - Google API 呼び出しに失敗した場合も 502 を返し、クライアント側でフォールバックさせる。
 * - 認証なしの公開エンドポイント（読み上げは認証不要のレッスン本文）。
 *   グローバル + 専用 rate-limit でスパムを抑える。
 *
 * パラメータ変換:
 * - rate (アプリ 0.5〜2.0) → audioConfig.speakingRate（Google 範囲 0.25〜4.0）。
 *   アプリ範囲はそのまま渡せるが、念のため 0.25〜4.0 にクランプする。
 * - pitch (アプリ 0.5〜2.0, 1.0=標準) → audioConfig.pitch（Google 範囲 -20.0〜20.0 semitone）。
 *   1.0=0 semitone を中心に (p - 1.0) * 8 で控えめにマップ（0.5→-4, 2.0→+8）。
 *   結果は -20.0〜20.0 にクランプする。
 *
 * コスト/セキュリティ対策:
 * - サーキットブレーカー: 当日(UTC)の累計合成文字数が TTS_DAILY_CHAR_LIMIT を超えたら 503
 *   { error: 'tts_daily_limit' } を返し、クライアントは端末 TTS にフォールバック（無音にはならない）。
 * - voiceName allowlist: 想定外の高単価ボイス（Studio 系等）を指定される余地を消す。
 * - API キーは X-Goog-Api-Key ヘッダで渡す（URL クエリに載せない）。
 */
import { Router, type Request, type Response } from 'express'
import type { RequestHandler } from 'express'

const ALLOWED_LANGS = new Set(['ja-JP', 'en-US'])
const MAX_TEXT_LEN = 5000

// lang ごとのデフォルトボイス（voiceName 未指定時に使う）。
// クライアントのキュレートボイスと整合させること。
const DEFAULT_VOICE: Record<string, string> = {
  'ja-JP': 'ja-JP-Neural2-C', // 女性
  'en-US': 'en-US-Neural2-F', // 女性
}

// server 側 voiceName allowlist。
// src/ttsService.ts の CLOUD_VOICE_CATALOG と一致させること（食い違うと正常ボイスが 400 になる）。
// 外部から Studio 系など高単価ボイスを指定される余地を消すための allowlist。
const ALLOWED_VOICES = new Set<string>([
  // ja-JP
  'ja-JP-Neural2-C',
  'ja-JP-Neural2-D',
  'ja-JP-Neural2-B',
  'ja-JP-Wavenet-D',
  // en-US
  'en-US-Neural2-F',
  'en-US-Neural2-D',
])

const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

// ── サーキットブレーカー（プロセス内 1 日あたり合成文字数の上限）──
// 注意: これはプロセス内メモリのカウンタなので、Render の複数インスタンス/再起動では
// 厳密な総量にはならない（インスタンスごと・再起動でリセットされる）。あくまで課金の
// 青天井を防ぐ circuit-breaker として機能すれば十分。厳密な総量制御や予算アラートは
// Google Cloud 側の予算アラートで別途運用する（Keita 管理）。
function dailyCharLimit(): number {
  const raw = Number(process.env.TTS_DAILY_CHAR_LIMIT)
  return Number.isFinite(raw) && raw > 0 ? raw : 500_000
}

/** UTC の YYYY-MM-DD。日付が変わったらカウンタをリセットする基準。 */
function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

const charCounter = {
  date: utcDateKey(),
  chars: 0,
  warned: false,
}

/** 当日カウンタに text 長を加算し、上限超過なら true を返す（加算前に判定）。 */
function isOverDailyLimit(textLen: number): boolean {
  const today = utcDateKey()
  if (charCounter.date !== today) {
    // 日付が変わった → リセット
    charCounter.date = today
    charCounter.chars = 0
    charCounter.warned = false
  }
  const limit = dailyCharLimit()
  if (charCounter.chars + textLen > limit) {
    if (!charCounter.warned) {
      // 上限到達は 1 回だけ warn（毎リクエスト spam しない）
      console.warn(`[tts] daily char limit reached (${charCounter.chars}/${limit}), serving 503 until UTC ${today} rolls over`)
      charCounter.warned = true
    }
    return true
  }
  charCounter.chars += textLen
  return false
}

/** アプリ rate (0.5〜2.0 想定) → Google speakingRate (0.25〜4.0 にクランプ) */
function mapRate(rate: unknown): number {
  const r = typeof rate === 'number' && Number.isFinite(rate) ? rate : 1.0
  return Math.min(4.0, Math.max(0.25, r))
}

/** アプリ pitch (0.5〜2.0, 1.0=標準) → Google pitch semitone (-20.0〜20.0 にクランプ) */
function mapPitch(pitch: unknown): number {
  const p = typeof pitch === 'number' && Number.isFinite(pitch) ? pitch : 1.0
  const semitone = (p - 1.0) * 8
  return Math.min(20.0, Math.max(-20.0, semitone))
}

type SynthesizeBody = {
  text?: unknown
  lang?: unknown
  voiceName?: unknown
  rate?: unknown
  pitch?: unknown
}

export function createTtsRouter(ttsLimiter: RequestHandler): Router {
  const router = Router()

  router.post('/', ttsLimiter, async (req: Request, res: Response) => {
    const apiKey = process.env.GOOGLE_TTS_API_KEY
    if (!apiKey) {
      // キー未設定 → クライアントは端末 TTS にフォールバック
      return res.status(503).json({ error: 'tts_unavailable' })
    }

    const body = (req.body || {}) as SynthesizeBody

    // ── 入力バリデーション ──
    const text = typeof body.text === 'string' ? body.text : ''
    if (!text.trim()) {
      return res.status(400).json({ error: 'text required' })
    }
    if (text.length > MAX_TEXT_LEN) {
      return res.status(400).json({ error: 'text too long' })
    }
    const lang = typeof body.lang === 'string' ? body.lang : ''
    if (!ALLOWED_LANGS.has(lang)) {
      return res.status(400).json({ error: 'unsupported lang' })
    }

    // voiceName: 明示指定があれば allowlist を必須にする。未指定は lang 既定にフォールバック。
    const requestedVoice = typeof body.voiceName === 'string' ? body.voiceName.trim() : ''
    if (requestedVoice && !ALLOWED_VOICES.has(requestedVoice)) {
      return res.status(400).json({ error: 'invalid_voice' })
    }
    const voiceName = requestedVoice || DEFAULT_VOICE[lang]

    // ── サーキットブレーカー: 当日累計合成文字数の上限チェック ──
    // 上限超過なら 503 を返し、クライアントは既存フォールバックで端末 TTS に落ちる。
    if (isOverDailyLimit(text.length)) {
      return res.status(503).json({ error: 'tts_daily_limit' })
    }

    const speakingRate = mapRate(body.rate)
    const pitch = mapPitch(body.pitch)

    // ── Google Cloud TTS 呼び出し ──
    try {
      const gRes = await fetch(GOOGLE_TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API キーは URL クエリではなくヘッダで渡す（ログ/中間プロキシに載るリスクを下げる）
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: lang, name: voiceName },
          audioConfig: { audioEncoding: 'MP3', speakingRate, pitch },
        }),
      })

      if (!gRes.ok) {
        const detail = await gRes.text().catch(() => '')
        console.warn('[tts] google api error', gRes.status, detail.slice(0, 300))
        // クライアントがフォールバックできるよう 502 を返す
        return res.status(502).json({ error: 'tts_synthesis_failed' })
      }

      const data = (await gRes.json()) as { audioContent?: string }
      if (!data.audioContent) {
        console.warn('[tts] google api returned no audioContent')
        return res.status(502).json({ error: 'tts_synthesis_failed' })
      }

      return res.json({ audioContent: data.audioContent })
    } catch (e) {
      console.warn('[tts] synthesize fetch error', e)
      return res.status(502).json({ error: 'tts_synthesis_failed' })
    }
  })

  return router
}
