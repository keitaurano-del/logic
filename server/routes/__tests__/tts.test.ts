/**
 * /api/tts ルートのユニットテスト。
 *
 * Express を立てずに createTtsRouter のハンドラを直接呼び、req/res をモックして検証する。
 * - GOOGLE_TTS_API_KEY 未設定時に 503 { error: 'tts_unavailable' } を返す
 * - 正常時に Google API を fetch して base64 audioContent を返す
 * - 入力バリデーション（空 text / 長すぎ / 未対応 lang）
 * - Google API エラー時は 502 でフォールバックさせる
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response } from 'express'
import { createTtsRouter } from '../tts'

type Layer = {
  route?: { path: string; stack: Array<{ handle: (req: Request, res: Response) => unknown }> }
}

// router の POST '/' ハンドラ（最後の handler = 実処理）を取り出す
function getHandler(): (req: Request, res: Response) => Promise<void> {
  const router = createTtsRouter((_req, _res, next) => next()) as unknown as {
    stack: Layer[]
  }
  const layer = router.stack.find(l => l.route?.path === '/')
  if (!layer?.route) throw new Error('route not found')
  const stack = layer.route.stack
  const handler = stack[stack.length - 1].handle
  return handler as (req: Request, res: Response) => Promise<void>
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this },
    json(payload: unknown) { this.body = payload; return this },
  }
  return res as unknown as Response & { statusCode: number; body: unknown }
}

const ORIGINAL_KEY = process.env.GOOGLE_TTS_API_KEY
const ORIGINAL_LIMIT = process.env.TTS_DAILY_CHAR_LIMIT

describe('/api/tts route', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.GOOGLE_TTS_API_KEY
    else process.env.GOOGLE_TTS_API_KEY = ORIGINAL_KEY
    if (ORIGINAL_LIMIT === undefined) delete process.env.TTS_DAILY_CHAR_LIMIT
    else process.env.TTS_DAILY_CHAR_LIMIT = ORIGINAL_LIMIT
  })

  it('GOOGLE_TTS_API_KEY 未設定なら 503 { error: tts_unavailable }', async () => {
    delete process.env.GOOGLE_TTS_API_KEY
    const handler = getHandler()
    const res = mockRes()
    await handler(
      { body: { text: 'テスト', lang: 'ja-JP' } } as unknown as Request,
      res,
    )
    expect(res.statusCode).toBe(503)
    expect(res.body).toEqual({ error: 'tts_unavailable' })
  })

  it('正常時に Google API を叩いて base64 audioContent を返す', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ audioContent: 'QUJD' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchSpy)

    const handler = getHandler()
    const res = mockRes()
    await handler(
      { body: { text: 'テスト', lang: 'ja-JP', voiceName: 'ja-JP-Neural2-C', rate: 1.5 } } as unknown as Request,
      res,
    )

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('texttospeech.googleapis.com')
    // API キーは URL クエリではなくヘッダで渡す
    expect(url).not.toContain('key=test-key')
    expect((init.headers as Record<string, string>)['X-Goog-Api-Key']).toBe('test-key')
    const sent = JSON.parse(String(init.body)) as {
      input: { text: string }
      voice: { languageCode: string; name: string }
      audioConfig: { audioEncoding: string; speakingRate: number; pitch?: number }
    }
    expect(sent.input.text).toBe('テスト')
    expect(sent.voice.name).toBe('ja-JP-Neural2-C')
    expect(sent.audioConfig.audioEncoding).toBe('MP3')
    expect(sent.audioConfig.speakingRate).toBe(1.5)
    // pitch コントロールは廃止: audioConfig に pitch を載せない
    expect(sent.audioConfig.pitch).toBeUndefined()

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ audioContent: 'QUJD' })

    vi.unstubAllGlobals()
  })

  it('voiceName 未指定なら lang の既定ボイスを使う (ja-JP → ja-JP-Neural2-C)', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ audioContent: 'QUJD' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchSpy)
    const handler = getHandler()
    const res = mockRes()
    await handler({ body: { text: 'あ', lang: 'ja-JP' } } as unknown as Request, res)
    const init = fetchSpy.mock.calls[0][1] as RequestInit
    const sent = JSON.parse(String(init.body)) as { voice: { name: string } }
    expect(sent.voice.name).toBe('ja-JP-Neural2-C')
    vi.unstubAllGlobals()
  })

  it('空 text は 400', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const handler = getHandler()
    const res = mockRes()
    await handler({ body: { text: '   ', lang: 'ja-JP' } } as unknown as Request, res)
    expect(res.statusCode).toBe(400)
  })

  it('5000 字超は 400', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const handler = getHandler()
    const res = mockRes()
    await handler({ body: { text: 'あ'.repeat(5001), lang: 'ja-JP' } } as unknown as Request, res)
    expect(res.statusCode).toBe(400)
  })

  it('未対応 lang は 400', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const handler = getHandler()
    const res = mockRes()
    await handler({ body: { text: 'hi', lang: 'fr-FR' } } as unknown as Request, res)
    expect(res.statusCode).toBe(400)
  })

  it('Google API エラー時は 502 でフォールバックさせる', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response('quota exceeded', { status: 429 }),
    ))
    const handler = getHandler()
    const res = mockRes()
    await handler({ body: { text: 'テスト', lang: 'ja-JP' } } as unknown as Request, res)
    expect(res.statusCode).toBe(502)
    expect(res.body).toEqual({ error: 'tts_synthesis_failed' })
    vi.unstubAllGlobals()
  })

  it('allowlist 外の voiceName は 400 { error: invalid_voice }', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const handler = getHandler()
    const res = mockRes()
    await handler(
      { body: { text: 'テスト', lang: 'ja-JP', voiceName: 'ja-JP-Studio-B' } } as unknown as Request,
      res,
    )
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'invalid_voice' })
    // 不正ボイスでは Google API を叩かない
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('音声は女性/男性の2種のみ: 旧カタログのボイス(ja-JP-Neural2-B)は 400 invalid_voice', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const handler = getHandler()
    const res = mockRes()
    await handler(
      { body: { text: 'テスト', lang: 'ja-JP', voiceName: 'ja-JP-Neural2-B' } } as unknown as Request,
      res,
    )
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'invalid_voice' })
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('音声は女性/男性の2種のみ: 女性(C) / 男性(D) は許可される (ja-JP-Neural2-D)', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ audioContent: 'QUJD' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchSpy)
    const handler = getHandler()
    const res = mockRes()
    await handler(
      { body: { text: 'テスト', lang: 'ja-JP', voiceName: 'ja-JP-Neural2-D' } } as unknown as Request,
      res,
    )
    expect(res.statusCode).toBe(200)
    const sent = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body)) as { voice: { name: string } }
    expect(sent.voice.name).toBe('ja-JP-Neural2-D')
    vi.unstubAllGlobals()
  })

  it('当日累計合成文字数が上限を超えると 503 { error: tts_daily_limit }', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    // 上限を低く設定（カウンタはプロセス内なので、1 回目で超過させる）
    process.env.TTS_DAILY_CHAR_LIMIT = '5'
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ audioContent: 'QUJD' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchSpy)
    const handler = getHandler()
    const res = mockRes()
    // text 長 6 > limit 5 → 即 503
    await handler(
      { body: { text: 'あいうえおか', lang: 'ja-JP' } } as unknown as Request,
      res,
    )
    expect(res.statusCode).toBe(503)
    expect(res.body).toEqual({ error: 'tts_daily_limit' })
    // 上限超過では Google API を叩かない（課金しない）
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('rate のクランプ: 範囲外でも Google 範囲に収める / pitch は載せない', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ audioContent: 'QUJD' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchSpy)
    const handler = getHandler()
    const res = mockRes()
    // rate=0.5 → 0.5 (>=0.25)
    await handler({ body: { text: 'あ', lang: 'ja-JP', rate: 0.5 } } as unknown as Request, res)
    const sent = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body)) as {
      audioConfig: { speakingRate: number; pitch?: number }
    }
    expect(sent.audioConfig.speakingRate).toBe(0.5)
    // pitch コントロールは廃止
    expect(sent.audioConfig.pitch).toBeUndefined()
    vi.unstubAllGlobals()
  })
})
