/**
 * /api/search ルートのユニットテスト。
 *
 * Claude を実際に叩く high-cost 部分は呼ばず、pure helper の境界を検証する:
 * - sanitizeCatalog: 壊れた項目の除去・件数クランプ・重複除去
 * - buildSearchPrompt: クエリ/カタログ/ルールがプロンプトに反映される（ja/en）
 * - parseSearchResults: JSON 抽出・カタログ実在チェック（幻覚 id 除去）・重複除去・順序維持
 */
import { describe, it, expect } from 'vitest'
import {
  sanitizeCatalog,
  buildSearchPrompt,
  parseSearchResults,
  type SearchCatalog,
} from '../search'

const sampleCatalog: SearchCatalog = {
  courses: [
    { id: 'logic-01', title: 'ロジカルに考えて、整理する', category: 'ロジカルシンキング', description: 'MECEとロジックツリー' },
    { id: 'critical-01', title: '思い込みを疑い、正しく判断する', category: 'クリティカルシンキング' },
  ],
  lessons: [
    { id: 20, title: 'MECEで漏れなく分ける', category: 'ロジカルシンキング' },
    { id: 23, title: 'ピラミッド構造で伝える', category: 'ロジカルシンキング' },
  ],
}

describe('sanitizeCatalog', () => {
  it('壊れた項目・id/title 欠落を捨てる', () => {
    const out = sanitizeCatalog({
      courses: [
        { id: 'a', title: 'A', category: 'cat' },
        { id: '', title: 'no id' },           // id 空 → 捨てる
        { id: 'b', title: '' },               // title 空 → 捨てる
        null,
        'garbage',
        { id: 'c', title: 'C', category: 'x', description: 'd'.repeat(300) },
      ],
      lessons: [
        { id: 1, title: 'L1', category: 'c' },
        { id: 'x', title: 'bad id', category: 'c' }, // id 数値でない → 捨てる
        { id: 1, title: 'dup', category: 'c' },       // 重複 id → 捨てる
        { title: 'no id', category: 'c' },
      ],
    })
    expect(out.courses.map(c => c.id)).toEqual(['a', 'c'])
    expect(out.courses[1].description!.length).toBeLessThanOrEqual(120) // description は 120 字でクランプ
    expect(out.lessons.map(l => l.id)).toEqual([1])
  })

  it('非オブジェクト入力では空カタログを返す', () => {
    expect(sanitizeCatalog(null)).toEqual({ courses: [], lessons: [] })
    expect(sanitizeCatalog('nope')).toEqual({ courses: [], lessons: [] })
    expect(sanitizeCatalog({})).toEqual({ courses: [], lessons: [] })
  })

  it('コースは 80 件・レッスンは 400 件でクランプ', () => {
    const courses = Array.from({ length: 100 }, (_, i) => ({ id: `c${i}`, title: `t${i}`, category: 'x' }))
    const lessons = Array.from({ length: 500 }, (_, i) => ({ id: i, title: `l${i}`, category: 'x' }))
    const out = sanitizeCatalog({ courses, lessons })
    expect(out.courses.length).toBe(80)
    expect(out.lessons.length).toBe(400)
  })
})

describe('buildSearchPrompt', () => {
  it('ja プロンプトにクエリとカタログ行が含まれる', () => {
    const prompt = buildSearchPrompt('MECEを学びたい', 'ja', sampleCatalog)
    expect(prompt).toContain('MECEを学びたい')
    expect(prompt).toContain('C:logic-01')
    expect(prompt).toContain('L:20')
    expect(prompt).toContain('JSON')
  })

  it('en プロンプトは英語の指示文になる', () => {
    const prompt = buildSearchPrompt('logical thinking', 'en', sampleCatalog)
    expect(prompt).toContain('logical thinking')
    expect(prompt).toContain('search assistant')
    expect(prompt).toContain('C:logic-01')
  })

  it('空カタログでも (none)/(なし) で安全に組める', () => {
    const empty: SearchCatalog = { courses: [], lessons: [] }
    expect(buildSearchPrompt('x', 'ja', empty)).toContain('(なし)')
    expect(buildSearchPrompt('x', 'en', empty)).toContain('(none)')
  })
})

describe('parseSearchResults', () => {
  it('カタログ実在の course/lesson を順序維持で返す', () => {
    const raw = `[
      {"kind":"course","id":"logic-01","reason":"MECEを扱う"},
      {"kind":"lesson","id":20,"reason":"MECEの基礎"}
    ]`
    const out = parseSearchResults(raw, sampleCatalog)
    expect(out).toEqual([
      { kind: 'course', id: 'logic-01', reason: 'MECEを扱う' },
      { kind: 'lesson', id: 20, reason: 'MECEの基礎' },
    ])
  })

  it('幻覚 id（カタログに無い）は捨てる', () => {
    const raw = `[
      {"kind":"course","id":"ghost-99","reason":"存在しない"},
      {"kind":"lesson","id":9999,"reason":"存在しない"},
      {"kind":"lesson","id":23,"reason":"実在する"}
    ]`
    const out = parseSearchResults(raw, sampleCatalog)
    expect(out).toEqual([{ kind: 'lesson', id: 23, reason: '実在する' }])
  })

  it('lesson id が文字列でも数値化して照合する', () => {
    const raw = `[{"kind":"lesson","id":"20","reason":"文字列id"}]`
    const out = parseSearchResults(raw, sampleCatalog)
    expect(out).toEqual([{ kind: 'lesson', id: 20, reason: '文字列id' }])
  })

  it('重複は除去する', () => {
    const raw = `[
      {"kind":"lesson","id":20,"reason":"1回目"},
      {"kind":"lesson","id":20,"reason":"2回目"}
    ]`
    const out = parseSearchResults(raw, sampleCatalog)
    expect(out).toHaveLength(1)
    expect(out[0].reason).toBe('1回目')
  })

  it('前後にプロローグがあっても JSON 配列だけ抽出する', () => {
    const raw = 'はい、結果です:\n[{"kind":"course","id":"logic-01","reason":"r"}]\nどうぞ'
    const out = parseSearchResults(raw, sampleCatalog)
    expect(out).toEqual([{ kind: 'course', id: 'logic-01', reason: 'r' }])
  })

  it('JSON でない／配列でない／空文字は [] を返す', () => {
    expect(parseSearchResults('', sampleCatalog)).toEqual([])
    expect(parseSearchResults('no json here', sampleCatalog)).toEqual([])
    expect(parseSearchResults('[broken', sampleCatalog)).toEqual([])
    expect(parseSearchResults('[]', sampleCatalog)).toEqual([])
  })

  it('reason 欠落でも空文字で通す（kind/id が妥当なら採用）', () => {
    const raw = `[{"kind":"course","id":"logic-01"}]`
    const out = parseSearchResults(raw, sampleCatalog)
    expect(out).toEqual([{ kind: 'course', id: 'logic-01', reason: '' }])
  })
})
