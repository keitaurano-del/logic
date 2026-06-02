/**
 * FB-17 回帰テスト: 復習の「弱点」カードが、復習して正解すると減ること。
 *
 * 旧実装は弱点判定が `wrongCount > 0` のみで、wrongCount は単調増加だったため
 * 一度間違えると永久に弱点から外れなかった。
 * 修正後は `wrongCount > 0 && interval === 0`（間違えてまだ立て直していないカード）を弱点とし、
 * 'good'/'easy' で正解して interval >= 1 になると弱点から自動で外れる。
 *
 * あわせて previewIntervals が reviewCard と同じ次回間隔を返すことも検証する（FB-19）。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  addCards,
  reviewCard,
  getWeakCards,
  getCardStats,
  previewIntervals,
  loadCards,
} from '../flashcardData'

function seedOneCard() {
  addCards([
    { front: 'Q1', back: 'A1', category: 'cat', source: 'lesson-1' },
  ])
  return loadCards()[0]
}

describe('FB-17 弱点カードは正解で減る', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('新規カードは弱点でない', () => {
    seedOneCard()
    expect(getCardStats().weak).toBe(0)
    expect(getWeakCards()).toHaveLength(0)
  })

  it('again で間違えると弱点に出る', () => {
    const card = seedOneCard()
    reviewCard(card.id, 'again')
    expect(getCardStats().weak).toBe(1)
    expect(getWeakCards()).toHaveLength(1)
    expect(getWeakCards()[0].id).toBe(card.id)
  })

  it('間違えた後 good で正解すると弱点から消える', () => {
    const card = seedOneCard()
    reviewCard(card.id, 'again')
    expect(getCardStats().weak).toBe(1)

    reviewCard(card.id, 'good')
    expect(getCardStats().weak).toBe(0)
    expect(getWeakCards()).toHaveLength(0)

    // wrongCount 自体は残っている（履歴は単調増加）が、interval>=1 で弱点から外れている
    const updated = loadCards()[0]
    expect(updated.wrongCount).toBe(1)
    expect(updated.interval).toBeGreaterThanOrEqual(1)
  })

  it('間違えた後 easy で正解しても弱点から消える', () => {
    const card = seedOneCard()
    reviewCard(card.id, 'again')
    reviewCard(card.id, 'easy')
    expect(getCardStats().weak).toBe(0)
    expect(getWeakCards()).toHaveLength(0)
  })

  it('再び間違える（interval が 0 に戻る）と弱点に戻る', () => {
    const card = seedOneCard()
    reviewCard(card.id, 'again')
    reviewCard(card.id, 'good') // 立て直し → 弱点から外れる
    expect(getCardStats().weak).toBe(0)

    reviewCard(card.id, 'again') // また間違える → interval=0 に戻る
    expect(getCardStats().weak).toBe(1)
  })

  it('弱点リストは間違えた回数が多い順', () => {
    addCards([
      { front: 'Qa', back: 'Aa', category: 'c', source: 'lesson-1' },
      { front: 'Qb', back: 'Ab', category: 'c', source: 'lesson-1' },
    ])
    const [a, b] = loadCards()
    // a を 1 回、b を 2 回間違える（どちらも interval=0 のまま）
    reviewCard(a.id, 'again')
    reviewCard(b.id, 'again')
    reviewCard(b.id, 'again')

    const weak = getWeakCards()
    expect(weak).toHaveLength(2)
    expect(weak[0].id).toBe(b.id) // wrongCount 多い方が先頭
  })
})

describe('FB-19 previewIntervals は reviewCard と一致する', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('again は常に 0（すぐ）', () => {
    expect(previewIntervals({ interval: 0, ease: 2.5 }).again).toBe(0)
    expect(previewIntervals({ interval: 10, ease: 2.5 }).again).toBe(0)
  })

  it('新規カード（interval=0）の good は 1 日後、easy は 3 日後', () => {
    const p = previewIntervals({ interval: 0, ease: 2.5 })
    expect(p.good).toBe(1)
    expect(p.easy).toBe(3)
  })

  it('preview の good が実際の reviewCard 後の interval と一致する', () => {
    const card = seedOneCard()
    const predicted = previewIntervals(card).good
    reviewCard(card.id, 'good')
    expect(loadCards()[0].interval).toBe(predicted)
  })

  it('preview の easy が実際の reviewCard 後の interval と一致する', () => {
    const card = seedOneCard()
    const predicted = previewIntervals(card).easy
    reviewCard(card.id, 'easy')
    expect(loadCards()[0].interval).toBe(predicted)
  })

  it('easy の次回間隔は good より先（差が一目で分かる）', () => {
    // ある程度 interval を進めた状態では easy の方が次回が先になる
    const p = previewIntervals({ interval: 2, ease: 2.5 })
    expect(p.easy).toBeGreaterThan(p.good)
  })
})
