/**
 * LR-25 #46: フェルミ feedback の SCORE_JSON 抽出 / SSE 判定の純粋ロジックテスト。
 * Claude API は叩かず、parseFermiScore / wantsEventStream の境界のみ検証する。
 */
import { describe, it, expect } from 'vitest'
import { parseFermiScore, wantsEventStream } from '../fermi'

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
