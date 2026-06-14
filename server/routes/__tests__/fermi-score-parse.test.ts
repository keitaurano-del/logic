/**
 * LR-25 #46: フェルミ feedback の SCORE_JSON 抽出 / SSE 判定の純粋ロジックテスト。
 * Claude API は叩かず、parseFermiScore / wantsEventStream の境界のみ検証する。
 */
import { describe, it, expect } from 'vitest'
import { parseFermiScore, wantsEventStream, splitFermiSseHead } from '../fermi'

describe('parseFermiScore', () => {
  it('先頭行の SCORE_JSON を抽出し本文と分離する', () => {
    const raw =
      'SCORE_JSON:{"score":72,"breakdown":"論理性 40/50 · 独自性 18/30 · 明確さ 14/20","details":{"logic":"分解の筋は通っている","originality":"切り口は標準的","clarity":"計算が追いやすい"}}\n' +
      '## 良かった視点\n- いいですね\n\n## 答え\n約 500万台'
    const r = parseFermiScore(raw)
    expect(r.score).toBe(72)
    expect(r.scoreBreakdown).toContain('論理性 40/50')
    expect(r.scoreDetails?.logic).toBe('分解の筋は通っている')
    expect(r.scoreDetails?.originality).toBe('切り口は標準的')
    expect(r.scoreDetails?.clarity).toBe('計算が追いやすい')
    // SCORE_JSON 行は除去される（先頭に空行が残るのは既存挙動どおり）。
    expect(r.feedbackText.trimStart().startsWith('## 良かった視点')).toBe(true)
    expect(r.feedbackText).not.toContain('SCORE_JSON')
  })

  it('score は 0〜100 にクランプされ整数化される', () => {
    expect(parseFermiScore('SCORE_JSON:{"score":150}\n本文').score).toBe(100)
    expect(parseFermiScore('SCORE_JSON:{"score":-5}\n本文').score).toBe(0)
    expect(parseFermiScore('SCORE_JSON:{"score":72.6}\n本文').score).toBe(73)
  })

  it('SCORE_JSON が無ければ score は undefined・本文はそのまま', () => {
    const r = parseFermiScore('## 良かった視点\n- 本文だけ')
    expect(r.score).toBeUndefined()
    expect(r.scoreBreakdown).toBeUndefined()
    expect(r.feedbackText).toBe('## 良かった視点\n- 本文だけ')
  })

  it('壊れた SCORE_JSON でも例外を投げず本文を返す（壊さない）', () => {
    // 閉じ括弧はあるが中身が壊れた JSON: 行はマッチして除去されるが parse は失敗する。
    const raw = 'SCORE_JSON:{not valid json}\n## 本文\n- ここは表示される'
    const r = parseFermiScore(raw)
    // パース失敗 → score は undefined だが本文（SCORE_JSON 行を除去）は維持
    expect(r.score).toBeUndefined()
    expect(r.feedbackText).toContain('## 本文')
    expect(r.feedbackText).not.toContain('SCORE_JSON')
  })

  it('閉じ括弧の無い壊れた SCORE_JSON はマッチせず全文をそのまま返す', () => {
    const raw = 'SCORE_JSON:{not closed\n## 本文'
    const r = parseFermiScore(raw)
    expect(r.score).toBeUndefined()
    expect(r.feedbackText).toBe(raw)
  })

  it('details の非文字列値は undefined に落とす', () => {
    const r = parseFermiScore('SCORE_JSON:{"score":50,"details":{"logic":123,"clarity":"ok"}}\n本文')
    expect(r.scoreDetails?.logic).toBeUndefined()
    expect(r.scoreDetails?.clarity).toBe('ok')
  })
})

describe('splitFermiSseHead (LR-50)', () => {
  it('1行目が未確定（改行なし）なら null を返す', () => {
    expect(splitFermiSseHead('SCORE_JSON:{"score":50}')).toBeNull()
    expect(splitFermiSseHead('## 良かった視点 まだ改行なし')).toBeNull()
    expect(splitFermiSseHead('')).toBeNull()
  })

  it('SCORE_JSON が無い応答でも本文1行目が leadingChunk に含まれる（ドロップしない）', () => {
    // LR-25 #46 の後続バグ: SCORE_JSON 行が無いと本文1行目が破棄されていた。
    const head = splitFermiSseHead('## 良かった視点\n- いいですね')
    expect(head).not.toBeNull()
    expect(head!.parsed.score).toBeUndefined()
    // 1行目本文 + それ以降が両方含まれる（= JSON 経路の feedbackText と対称）。
    expect(head!.leadingChunk).toContain('## 良かった視点')
    expect(head!.leadingChunk).toContain('- いいですね')
  })

  it('SCORE_JSON が1行目全体を占めるケースは score を抽出し leadingChunk は2行目以降のみ（空行混入なし）', () => {
    const raw =
      'SCORE_JSON:{"score":72,"breakdown":"論理性 40/50 · 独自性 18/30 · 明確さ 14/20","details":{"logic":"筋が通る","originality":"標準的","clarity":"追いやすい"}}\n' +
      '## 良かった視点\n- いいですね'
    const head = splitFermiSseHead(raw)
    expect(head).not.toBeNull()
    expect(head!.parsed.score).toBe(72)
    expect(head!.parsed.scoreBreakdown).toContain('論理性 40/50')
    // SCORE_JSON 行は除去され、本文先頭から始まる（先頭の空行は既存挙動どおり）。
    // SCORE_JSON 文字列そのものは混入しない。
    expect(head!.leadingChunk.trimStart().startsWith('## 良かった視点')).toBe(true)
    expect(head!.leadingChunk).not.toContain('SCORE_JSON')
  })

  it('SCORE_JSON と本文が同じ1行目に同居するケースでも本文部分が leadingChunk に残る', () => {
    // SCORE_JSON 行のあとに改行を挟まず本文が続いてしまった異常応答。
    const raw = 'SCORE_JSON:{"score":40}\n## 本文の続き\n- 詳細'
    const head = splitFermiSseHead(raw)
    expect(head).not.toBeNull()
    expect(head!.parsed.score).toBe(40)
    expect(head!.leadingChunk).toContain('## 本文の続き')
    expect(head!.leadingChunk).not.toContain('SCORE_JSON')
  })

  it('leadingChunk は parseFermiScore の feedbackText と一致する（JSON 経路と対称）', () => {
    const raw = 'SCORE_JSON:{"score":60}\n## 本文\n- 行2'
    const head = splitFermiSseHead(raw)
    expect(head!.leadingChunk).toBe(parseFermiScore(raw).feedbackText)
  })
})

describe('wantsEventStream', () => {
  it('Accept に text/event-stream を含むとき true', () => {
    expect(wantsEventStream('text/event-stream')).toBe(true)
    expect(wantsEventStream('application/json, text/event-stream')).toBe(true)
    expect(wantsEventStream('TEXT/EVENT-STREAM')).toBe(true)
  })

  it('それ以外（JSON / 未指定）は false（後方互換で JSON 経路）', () => {
    expect(wantsEventStream('application/json')).toBe(false)
    expect(wantsEventStream('*/*')).toBe(false)
    expect(wantsEventStream(undefined)).toBe(false)
    expect(wantsEventStream(null)).toBe(false)
    expect(wantsEventStream('')).toBe(false)
  })
})
