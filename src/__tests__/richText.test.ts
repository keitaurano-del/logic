import { describe, expect, it } from 'vitest'
import { parseRichText, parseInline, stripMarkup } from '../richText'

describe('parseInline (bold)', () => {
  it('parses **bold** into a bold token', () => {
    const tokens = parseInline('これは **重要** です')
    expect(tokens).toEqual([
      { type: 'text', value: 'これは ' },
      { type: 'bold', value: '重要' },
      { type: 'text', value: ' です' },
    ])
  })

  it('leaves an unclosed ** as literal text', () => {
    const tokens = parseInline('掛け算 2 ** 3 はべき乗ではない')
    // 閉じない ** は太字化しない（literal の * として残す）
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
    expect(tokens.map((t) => t.value).join('')).toBe('掛け算 2 ** 3 はべき乗ではない')
  })

  it('does not bold empty ****', () => {
    const tokens = parseInline('a****b')
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
  })

  it('keeps literal single asterisks untouched', () => {
    const tokens = parseInline('脚注 *1 を参照')
    expect(tokens).toEqual([{ type: 'text', value: '脚注 *1 を参照' }])
  })
})

describe('parseRichText (blocks)', () => {
  it('parses a plain paragraph', () => {
    const blocks = parseRichText('これは普通の段落です。')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('paragraph')
  })

  it('splits paragraphs on blank lines', () => {
    const blocks = parseRichText('段落1\n\n段落2')
    expect(blocks.filter((b) => b.type === 'paragraph')).toHaveLength(2)
  })

  it('parses dash bullets into a bullets block', () => {
    const blocks = parseRichText('- りんご\n- みかん\n- ぶどう')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('bullets')
    if (blocks[0].type === 'bullets') {
      expect(blocks[0].items).toHaveLength(3)
      expect(blocks[0].items[0].map((t) => t.value).join('')).toBe('りんご')
    }
  })

  it('parses nakaguro (・) bullets at line start', () => {
    const blocks = parseRichText('・第一\n・第二')
    expect(blocks[0].type).toBe('bullets')
    if (blocks[0].type === 'bullets') {
      expect(blocks[0].items).toHaveLength(2)
    }
  })

  it('does NOT treat inline ・ as a bullet (e.g. 論理・分析)', () => {
    const blocks = parseRichText('これは論理・分析の話です。')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('paragraph')
    if (blocks[0].type === 'paragraph') {
      expect(blocks[0].tokens.map((t) => t.value).join('')).toContain('論理・分析')
    }
  })

  it('parses numbered lists', () => {
    const blocks = parseRichText('1. 最初\n2. 次\n3. 最後')
    expect(blocks[0].type).toBe('numbers')
    if (blocks[0].type === 'numbers') {
      expect(blocks[0].items).toHaveLength(3)
      expect(blocks[0].items[0].marker).toBe('1.')
    }
  })

  it('parses ## and ### headings', () => {
    const blocks = parseRichText('## 見出し2\n本文\n### 見出し3')
    const headings = blocks.filter((b) => b.type === 'heading')
    expect(headings).toHaveLength(2)
    if (headings[0].type === 'heading') expect(headings[0].level).toBe(2)
    if (headings[1].type === 'heading') expect(headings[1].level).toBe(3)
  })

  it('does NOT treat #1 (no space) as a heading', () => {
    const blocks = parseRichText('#1 の選手が強い')
    expect(blocks[0].type).toBe('paragraph')
  })

  it('parses code fences into a code block', () => {
    const blocks = parseRichText('説明\n\n```\n■ 結論\n  S: ...\n```\n続き')
    const code = blocks.find((b) => b.type === 'code')
    expect(code).toBeDefined()
    if (code && code.type === 'code') {
      expect(code.text).toContain('■ 結論')
      expect(code.text).toContain('S: ...')
    }
  })

  it('preserves math symbols (× ÷ →) untouched in text', () => {
    const blocks = parseRichText('面積 = 縦 × 横 ÷ 2 → 答え')
    expect(blocks[0].type).toBe('paragraph')
    if (blocks[0].type === 'paragraph') {
      const text = blocks[0].tokens.map((t) => t.value).join('')
      expect(text).toContain('×')
      expect(text).toContain('÷')
      expect(text).toContain('→')
    }
  })

  it('handles 【...】 bracket labels as plain text (not a heading)', () => {
    const blocks = parseRichText('【ポイント】ここが大事')
    expect(blocks[0].type).toBe('paragraph')
  })
})

describe('stripMarkup (for TTS)', () => {
  it('removes bold markers but keeps the content', () => {
    expect(stripMarkup('これは **重要** です')).toBe('これは 重要 です')
  })

  it('removes leading dash bullet markers', () => {
    expect(stripMarkup('- りんご\n- みかん')).toBe('りんご\nみかん')
  })

  it('removes leading nakaguro bullet markers', () => {
    expect(stripMarkup('・第一\n・第二')).toBe('第一\n第二')
  })

  it('removes number list markers', () => {
    expect(stripMarkup('1. 最初\n2. 次')).toBe('最初\n次')
  })

  it('removes ## heading markers', () => {
    expect(stripMarkup('## 見出し\n本文')).toBe('見出し\n本文')
  })

  it('does not read out asterisks for unclosed **', () => {
    // 閉じない ** は parseInline で literal の * 1 個に縮むので、
    // 読み上げに ** がそのまま残らないことだけ確認する
    const out = stripMarkup('a ** b')
    expect(out).not.toContain('**')
  })

  it('keeps inline ・ inside words (論理・分析)', () => {
    expect(stripMarkup('論理・分析の話')).toBe('論理・分析の話')
  })

  it('preserves math symbols for downstream normalization', () => {
    expect(stripMarkup('縦 × 横 ÷ 2')).toBe('縦 × 横 ÷ 2')
  })

  it('is idempotent on already-stripped plain text', () => {
    const once = stripMarkup('- りんご\n- みかん')
    expect(stripMarkup(once)).toBe(once)
  })

  it('returns empty string for empty input', () => {
    expect(stripMarkup('')).toBe('')
  })
})
