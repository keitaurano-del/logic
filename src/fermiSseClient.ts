// =============================================
// LR-25 #46: フェルミ feedback SSE クライアント（純粋ロジック）
// =============================================
// サーバ /api/fermi/feedback は Accept: text/event-stream のとき以下の SSE を返す:
//   data: {"type":"score","score":..,"breakdown":..,"details":..}
//   data: {"type":"chunk","text":".."}
//   data: {"type":"done"}
//   data: {"type":"error","message":".."}
// ここでは「受信したテキスト断片を行単位でパースして SSE イベントへ変換する」純粋
// ロジックだけを切り出し、ネットワーク I/O から独立させてテスト可能にする。

export type FermiScoreDetails = { logic?: string; originality?: string; clarity?: string }

export type FermiSseEvent =
  | { type: 'score'; score: number | null; breakdown?: string | null; details?: FermiScoreDetails | null }
  | { type: 'chunk'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

/**
 * SSE のテキストストリームを行バッファリングしつつイベントへ変換するパーサ。
 * `push(chunk)` で受信断片を渡すと、その時点で完成した `data: {...}` 行を
 * パースして配列で返す。未完の行は内部バッファに保持し次回に持ち越す。
 *
 * 純粋に近い（内部に行バッファだけ持つ）小さなステートマシンにして、
 * fetch の ReadableStream 読み取りループから独立してユニットテストできる。
 */
export function createFermiSseParser() {
  let buffer = ''

  const parseLine = (line: string): FermiSseEvent | null => {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.startsWith('data:')) return null
    const payload = trimmed.slice('data:'.length).trim()
    if (!payload) return null
    try {
      const obj = JSON.parse(payload) as Partial<FermiSseEvent> & { type?: string }
      switch (obj.type) {
        case 'score':
          return {
            type: 'score',
            score: typeof (obj as { score?: unknown }).score === 'number' ? (obj as { score: number }).score : null,
            breakdown: (obj as { breakdown?: string | null }).breakdown ?? null,
            details: (obj as { details?: FermiScoreDetails | null }).details ?? null,
          }
        case 'chunk': {
          const text = (obj as { text?: unknown }).text
          return { type: 'chunk', text: typeof text === 'string' ? text : '' }
        }
        case 'done':
          return { type: 'done' }
        case 'error':
          return { type: 'error', message: String((obj as { message?: unknown }).message ?? 'stream error') }
        default:
          return null
      }
    } catch {
      // 壊れた JSON 行は無視（部分受信や heartbeat コメント等）。
      return null
    }
  }

  return {
    /** 受信断片を渡し、その時点で完成した SSE イベント列を返す。 */
    push(chunk: string): FermiSseEvent[] {
      buffer += chunk
      const out: FermiSseEvent[] = []
      let nl: number
      // \n 区切りで完成した行のみ処理。最後の未完行は buffer に残す。
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl)
        buffer = buffer.slice(nl + 1)
        const ev = parseLine(line)
        if (ev) out.push(ev)
      }
      return out
    },
    /** ストリーム終了時、バッファに残った最後の行を処理する。 */
    flush(): FermiSseEvent[] {
      const rest = buffer
      buffer = ''
      const ev = parseLine(rest)
      return ev ? [ev] : []
    },
  }
}

export type FermiFeedbackResult = {
  feedback: string
  score: number | null
  scoreBreakdown?: string | null
  scoreDetails?: FermiScoreDetails | null
}

export type FermiSseCallbacks = {
  onScore?: (score: number | null, breakdown?: string | null, details?: FermiScoreDetails | null) => void
  onChunk?: (text: string, fullText: string) => void
}

/**
 * fetch のレスポンス body（SSE）を読み切り、最終結果を組み立てる。
 * 逐次表示のために onChunk / onScore コールバックを呼ぶ。
 * `error` イベントを受けたら例外を投げる（呼び出し側で JSON フォールバックさせる）。
 *
 * body が無い／ReadableStream 非対応の環境では例外を投げ、フォールバックに倒す。
 */
export async function consumeFermiSse(
  body: ReadableStream<Uint8Array> | null,
  callbacks: FermiSseCallbacks = {},
): Promise<FermiFeedbackResult> {
  if (!body || typeof body.getReader !== 'function') {
    throw new Error('SSE body not available')
  }
  const reader = body.getReader()
  const decoder = new TextDecoder()
  const parser = createFermiSseParser()

  let fullText = ''
  let score: number | null = null
  let scoreBreakdown: string | null | undefined
  let scoreDetails: FermiScoreDetails | null | undefined
  let sawDone = false

  const handle = (events: FermiSseEvent[]) => {
    for (const ev of events) {
      if (ev.type === 'score') {
        score = ev.score
        scoreBreakdown = ev.breakdown
        scoreDetails = ev.details
        callbacks.onScore?.(ev.score, ev.breakdown, ev.details)
      } else if (ev.type === 'chunk') {
        fullText += ev.text
        callbacks.onChunk?.(ev.text, fullText)
      } else if (ev.type === 'done') {
        sawDone = true
      } else if (ev.type === 'error') {
        throw new Error(ev.message)
      }
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    handle(parser.push(decoder.decode(value, { stream: true })))
  }
  handle(parser.flush())

  if (!sawDone) {
    // done を受けずに終わった = 途中で切れた。フォールバックさせる。
    throw new Error('SSE stream ended without done')
  }

  return { feedback: fullText, score, scoreBreakdown, scoreDetails }
}
