/**
 * FB-17 回帰テスト: 弱点カードを正解すると弱点リストから消えること。
 *
 * 根因: 旧実装の弱点判定は `wrongCount > 0` のみ（単調増加のため永久に弱点残）。
 * 修正: `wrongCount > 0 && interval === 0` に変更。'good'/'easy' で正解すると
 *       interval が 1 以上になり弱点から自動的に外れる。
 *
 * シナリオ: 間違える → 弱点リストに出る → 正解する → 弱点リストから消える
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  addCards,
  reviewCard,
  getWeakCards,
  getCardStats,
  loadCards,
} from '../flashcardData'

function seedCard(front = 'Q', back = 'A') {
  addCards([{ front, back, category: 'cat', source: 'lesson-1' }])
  return loadCards().find((c) => c.front === front)!
}

describe('FB-17: 弱点カードは正解で弱点リストから消える', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('新規カードは弱点リストに出ない', () => {
    seedCard()
    expect(getCardStats().weak).toBe(0)
    expect(getWeakCards()).toHaveLength(0)
  })

  it('again で間違えると弱点リストに出る', () => {
    const card = seedCard()
    reviewCard(card.id, 'again')

    expect(getCardStats().weak).toBe(1)
    expect(getWeakCards()).toHaveLength(1)
    expect(getWeakCards()[0].id).toBe(card.id)
  })

  it('間違えた後 good で正解すると弱点リストから消える', () => {
    const card = seedCard()
    // ステップ1: 間違える → 弱点に出る
    reviewCard(card.id, 'again')
    expect(getCardStats().weak).toBe(1)

    // ステップ2: 正解する → 弱点から消える
    reviewCard(card.id, 'good')
    expect(getCardStats().weak).toBe(0)
    expect(getWeakCards()).toHaveLength(0)

    // wrongCount は履歴として残るが interval >= 1 になっているため弱点外
    const updated = loadCards()[0]
    expect(updated.wrongCount).toBe(1)
    expect(updated.interval).toBeGreaterThanOrEqual(1)
  })

  it('間違えた後 easy で正解しても弱点リストから消える', () => {
    const card = seedCard()
    reviewCard(card.id, 'again')
    expect(getCardStats().weak).toBe(1)

    reviewCard(card.id, 'easy')
    expect(getCardStats().weak).toBe(0)
    expect(getWeakCards()).toHaveLength(0)
  })

  it('正解後に再び again で間違えると弱点リストに戻る', () => {
    const card = seedCard()
    reviewCard(card.id, 'again') // 弱点に入る
    reviewCard(card.id, 'good')  // 弱点から出る
    expect(getCardStats().weak).toBe(0)

    reviewCard(card.id, 'again') // interval=0 に戻る → 再び弱点
    expect(getCardStats().weak).toBe(1)
    expect(getWeakCards()).toHaveLength(1)
  })

  it('複数カードのうち正解したカードだけ弱点リストから消える', () => {
    const c1 = seedCard('Q1', 'A1')
    const c2 = seedCard('Q2', 'A2')

    // 両方を間違える
    reviewCard(c1.id, 'again')
    reviewCard(c2.id, 'again')
    expect(getCardStats().weak).toBe(2)

    // c1 だけ正解する
    reviewCard(c1.id, 'good')
    expect(getCardStats().weak).toBe(1)
    const weak = getWeakCards()
    expect(weak).toHaveLength(1)
    expect(weak[0].id).toBe(c2.id)
  })
})
