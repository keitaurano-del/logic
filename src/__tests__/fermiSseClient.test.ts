/**
 * LR-25 #46: フェルミ feedback SSE クライアントの純粋ロジックテスト。
 * - createFermiSseParser: 行バッファリング / イベント変換 / 部分受信
 * - consumeFermiSse: ReadableStream 読み取り・コールバック・done/error/フォールバック判定
 */
import { describe, it, expect, vi } from 'vitest'
import { createFermiSseParser, consumeFermiSse } from '../fermiSseClient'

describe('createFermiSseParser', () => {
  it('1行ずつ完成した data イベントをパースする', () => {
    const p = createFermiSseParser()
    const evs = p.push('data: {"type":"score","score":80,"breakdown":"b","details":{"logic":"l"}}\n')
    expect(evs).toHaveLength(1)
    expect(evs[0]).toEqual({ type: 'score', score: 80, breakdown: 'b', details: { logic: 'l' } })
  })

  it('未完の行はバッファに残り、続きの push で完成する（部分受信）', () => {
    const p = createFermiSseParser()
    expect(p.push('data: {"type":"chu')).toEqual([])
    const evs = p.push('nk","text":"hello"}\n')
    expect(evs).toEqual([{ type: 'chunk', text: 'hello' }])
  })

  it('複数イベントを1回の push でまとめて処理する', () => {
    const p = createFermiSseParser()
    const evs = p.push(
      'data: {"type":"chunk","text":"a"}\n' +
      'data: {"type":"chunk","text":"b"}\n' +
      'data: {"type":"done"}\n',
    )
    expect(evs).toEqual([
      { type: 'chunk', text: 'a' },
      { type: 'chunk', text: 'b' },
      { type: 'done' },
    ])
  })

  it('空行・非 data 行・壊れた JSON は無視する', () => {
    const p = createFermiSseParser()
    const evs = p.push('\n: heartbeat\ndata: {bad json}\ndata: {"type":"done"}\n')
    expect(evs).toEqual([{ type: 'done' }])
  })

  it('score の score が数値でなければ null に落とす', () => {
    const p = createFermiSseParser()
    const evs = p.push('data: {"type":"score","score":null}\n')
    expect(evs[0]).toEqual({ type: 'score', score: null, breakdown: null, details: null })
  })

  it('flush でバッファ末尾の未改行行を処理する', () => {
    const p = createFermiSseParser()
    expect(p.push('data: {"type":"done"}')).toEqual([])
    expect(p.flush()).toEqual([{ type: 'done' }])
  })
})

// 簡易な ReadableStream を文字列配列から作るヘルパ
function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder()
  let i = 0
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(enc.encode(chunks[i++]))
      } else {
        controller.close()
      }
    },
  })
}

describe('consumeFermiSse', () => {
  it('score / chunk を逐次コールバックし、done で確定結果を返す', async () => {
    const stream = streamFromChunks([
      'data: {"type":"score","score":75,"breakdown":"論理 40/50","details":{"logic":"良い"}}\n',
      'data: {"type":"chunk","text":"## 良かった"}\n',
      'data: {"type":"chunk","text":"視点"}\n',
      'data: {"type":"done"}\n',
    ])
    const onScore = vi.fn()
    const chunks: string[] = []
    const result = await consumeFermiSse(stream, {
      onScore,
      onChunk: (_t, full) => chunks.push(full),
    })
    expect(onScore).toHaveBeenCalledWith(75, '論理 40/50', { logic: '良い' })
    expect(chunks).toEqual(['## 良かった', '## 良かった視点'])
    expect(result.feedback).toBe('## 良かった視点')
    expect(result.score).toBe(75)
  })

  it('error イベントで例外（呼び出し側でフォールバックさせる）', async () => {
    const stream = streamFromChunks([
      'data: {"type":"chunk","text":"途中まで"}\n',
      'data: {"type":"error","message":"boom"}\n',
    ])
    await expect(consumeFermiSse(stream)).rejects.toThrow('boom')
  })

  it('done を受けずに終わったら例外（途中切断 → フォールバック）', async () => {
    const stream = streamFromChunks([
      'data: {"type":"chunk","text":"途中まで"}\n',
    ])
    await expect(consumeFermiSse(stream)).rejects.toThrow(/done/)
  })

  it('body が無い／非対応なら例外（フォールバック）', async () => {
    await expect(consumeFermiSse(null)).rejects.toThrow()
  })
})
