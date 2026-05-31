import { describe, expect, it } from 'vitest'
import { normalizeTagDisplay, tagMatchKey, normalizeTags } from '../components/journal/journalDb'

// T3「ジャーナルのハッシュタグ自動集約・正規化」の実効性を恒久ロックする回帰テスト。
// 対象は journalDb.ts の3関数。保守的正規化（明確なゆれだけ統一・曖昧な類似統合はしない）が仕様。
// 実装が正。テストは実装の実挙動に合わせる。誤統合を発見した場合は無理に通さず報告する。

describe('normalizeTagDisplay', () => {
  it('全角英数記号の幅ゆれを NFKC で統一する', () => {
    expect(normalizeTagDisplay('ＭＥＣＥ')).toBe('MECE')
    expect(normalizeTagDisplay('１２３')).toBe('123')
    expect(normalizeTagDisplay('ＡＢＣ１２３')).toBe('ABC123')
  })

  it('全角空白を含む前後・内部の空白を整える', () => {
    expect(normalizeTagDisplay('　ロジック　')).toBe('ロジック')
  })

  it('先頭の半角#を剥がす', () => {
    expect(normalizeTagDisplay('#tag')).toBe('tag')
  })

  it('先頭の全角＃を剥がす', () => {
    expect(normalizeTagDisplay('＃タグ')).toBe('タグ')
  })

  it('先頭の連続ハッシュ（半角/全角混在）も剥がす', () => {
    expect(normalizeTagDisplay('##x')).toBe('x')
    expect(normalizeTagDisplay('＃#＃y')).toBe('y')
  })

  it('改行・タブは空白に変換する', () => {
    expect(normalizeTagDisplay('a\n\tb')).toBe('a b')
  })

  it('連続空白を1つに圧縮する', () => {
    expect(normalizeTagDisplay('a   b')).toBe('a b')
  })

  it('前後の空白を trim する', () => {
    expect(normalizeTagDisplay('  hello  ')).toBe('hello')
  })

  it('24文字に切り詰める（25文字入力→24文字）', () => {
    const raw = 'a'.repeat(25)
    const result = normalizeTagDisplay(raw)
    expect(result).toHaveLength(24)
    expect(result).toBe('a'.repeat(24))
  })

  it('ちょうど24文字はそのまま', () => {
    const raw = 'b'.repeat(24)
    expect(normalizeTagDisplay(raw)).toBe('b'.repeat(24))
  })

  it('大小文字は畳まない（表示形を保持）', () => {
    expect(normalizeTagDisplay('MECE')).toBe('MECE')
    expect(normalizeTagDisplay('Mece')).toBe('Mece')
  })

  it('string 以外は空文字を返す', () => {
    expect(normalizeTagDisplay(null)).toBe('')
    expect(normalizeTagDisplay(undefined)).toBe('')
    expect(normalizeTagDisplay(123)).toBe('')
    expect(normalizeTagDisplay(['tag'])).toBe('')
    expect(normalizeTagDisplay({ tag: 'x' })).toBe('')
  })
})

describe('tagMatchKey', () => {
  it('大小文字ゆれを同一キーに畳む', () => {
    expect(tagMatchKey('MECE')).toBe(tagMatchKey('mece'))
    expect(tagMatchKey('MECE')).toBe('mece')
  })

  it('表示形の正規化（先頭#・空白・幅ゆれ）も効いたうえで小文字化する', () => {
    expect(tagMatchKey('#MECE ')).toBe('mece')
    expect(tagMatchKey('#MECE ')).toBe(tagMatchKey('mece'))
    expect(tagMatchKey('＃ＭＥＣＥ')).toBe('mece')
  })

  it('string 以外は空文字キー', () => {
    expect(tagMatchKey(null)).toBe('')
    expect(tagMatchKey(42)).toBe('')
  })
})

describe('normalizeTags', () => {
  it('大小文字・幅ゆれ重複を排除し、最初の表示形を保持する', () => {
    expect(normalizeTags(['MECE', 'mece', 'ＭＥＣＥ'])).toEqual(['MECE'])
  })

  it('出現順を保持する', () => {
    expect(normalizeTags(['b', 'a', 'B'])).toEqual(['b', 'a'])
  })

  it('空・空白のみ・#のみ等の無効タグを除去する', () => {
    expect(normalizeTags(['', '   ', '#', '＃', '\t\n', '集中'])).toEqual(['集中'])
  })

  it('先頭#付き重複も照合キーで畳む', () => {
    expect(normalizeTags(['#tag', 'tag', 'TAG'])).toEqual(['tag'])
  })

  // ─── 誤統合しないことの保証（最重要・回帰ガード）──────────────────
  // 編集距離・部分一致でのマージをしていないことを固定する。
  it('部分一致では統合しない（mece と mece分析は別タグ）', () => {
    expect(normalizeTags(['mece', 'mece分析'])).toEqual(['mece', 'mece分析'])
  })

  it('類似語では統合しない（ロジックとロジカルは別タグ）', () => {
    expect(normalizeTags(['ロジック', 'ロジカル'])).toEqual(['ロジック', 'ロジカル'])
  })

  it('語幹一致では統合しない（test と testing は別タグ）', () => {
    expect(normalizeTags(['test', 'testing'])).toEqual(['test', 'testing'])
  })

  it('配列以外は空配列を返す', () => {
    expect(normalizeTags(null)).toEqual([])
    expect(normalizeTags(undefined)).toEqual([])
    expect(normalizeTags('tag')).toEqual([])
    expect(normalizeTags(123)).toEqual([])
    expect(normalizeTags({ 0: 'tag' })).toEqual([])
  })

  it('配列内の非string要素はスキップする', () => {
    expect(normalizeTags(['集中', null, 42, '読書'])).toEqual(['集中', '読書'])
  })
})
