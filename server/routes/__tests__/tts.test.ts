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

describe('/api/tts route', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.GOOGLE_TTS_API_KEY
    else process.env.GOOGLE_TTS_API_KEY = ORIGINAL_KEY
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
      { body: { text: 'テスト', lang: 'ja-JP', voiceName: 'ja-JP-Neural2-C', rate: 1.5, pitch: 1.5 } } as unknown as Request,
      res,
    )

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('texttospeech.googleapis.com')
    expect(url).toContain('key=test-key')
    const sent = JSON.parse(String(init.body)) as {
      input: { text: string }
      voice: { languageCode: string; name: string }
      audioConfig: { audioEncoding: string; speakingRate: number; pitch: number }
    }
    expect(sent.input.text).toBe('テスト')
    expect(sent.voice.name).toBe('ja-JP-Neural2-C')
    expect(sent.audioConfig.audioEncoding).toBe('MP3')
    expect(sent.audioConfig.speakingRate).toBe(1.5)
    // pitch: (1.5 - 1.0) * 8 = 4
    expect(sent.audioConfig.pitch).toBeCloseTo(4, 5)

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

  it('rate/pitch のクランプ: 範囲外でも Google 範囲に収める', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key'
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ audioContent: 'QUJD' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchSpy)
    const handler = getHandler()
    const res = mockRes()
    // rate=0.5 → 0.5 (>=0.25), pitch=0.5 → (0.5-1)*8 = -4
    await handler({ body: { text: 'あ', lang: 'ja-JP', rate: 0.5, pitch: 0.5 } } as unknown as Request, res)
    const sent = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body)) as {
      audioConfig: { speakingRate: number; pitch: number }
    }
    expect(sent.audioConfig.speakingRate).toBe(0.5)
    expect(sent.audioConfig.pitch).toBeCloseTo(-4, 5)
    vi.unstubAllGlobals()
  })
})
