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
    expect(tokens.map((t) => (t.type === 'icon' ? '' : t.value)).join('')).toBe(
      '掛け算 2 ** 3 はべき乗ではない',
    )
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

describe('parseInline (inline icons)', () => {
  it('parses [icon:good] into an icon token', () => {
    const tokens = parseInline('[icon:good] 正しいやり方')
    expect(tokens[0]).toEqual({ type: 'icon', name: 'good' })
    expect(tokens[1]).toEqual({ type: 'text', value: ' 正しいやり方' })
  })

  it('parses an icon token in the middle of text', () => {
    const tokens = parseInline('前 [icon:bad] 後')
    expect(tokens).toEqual([
      { type: 'text', value: '前 ' },
      { type: 'icon', name: 'bad' },
      { type: 'text', value: ' 後' },
    ])
  })

  it('allows hyphenated icon names', () => {
    const tokens = parseInline('[icon:thumbs-up] ok')
    expect(tokens[0]).toEqual({ type: 'icon', name: 'thumbs-up' })
  })

  // ── 衝突安全性: 比率・時刻・通常の角括弧をアイコン化しない ──
  it('does NOT treat ratio "3:1" as an icon', () => {
    const tokens = parseInline('黄金比は 3:1 です')
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
    expect(tokens.map((t) => (t.type === 'text' ? t.value : '')).join('')).toBe('黄金比は 3:1 です')
  })

  it('does NOT treat time "10:30" as an icon', () => {
    const tokens = parseInline('集合は 10:30 に')
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
    expect(tokens.map((t) => (t.type === 'text' ? t.value : '')).join('')).toBe('集合は 10:30 に')
  })

  it('does NOT treat "費用 2:1" as an icon', () => {
    const tokens = parseInline('費用 2:1 のバランス')
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
  })

  it('leaves a plain bracket like [補足] as literal text', () => {
    const tokens = parseInline('これは [補足] です')
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
    expect(tokens.map((t) => (t.type === 'text' ? t.value : '')).join('')).toBe('これは [補足] です')
  })

  it('leaves a non-icon bracket prefix like [note:x] as literal text', () => {
    const tokens = parseInline('[note:x] something')
    // `icon:` で始まらないので literal
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
  })

  it('does not match [icon:] with empty name (left literal)', () => {
    const tokens = parseInline('[icon:] empty')
    expect(tokens.every((t) => t.type === 'text')).toBe(true)
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
      expect(blocks[0].items[0].map((t) => (t.type === 'icon' ? '' : t.value)).join('')).toBe(
        'りんご',
      )
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
      expect(blocks[0].tokens.map((t) => (t.type === 'icon' ? '' : t.value)).join('')).toContain(
        '論理・分析',
      )
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
      const text = blocks[0].tokens.map((t) => (t.type === 'icon' ? '' : t.value)).join('')
      expect(text).toContain('×')
      expect(text).toContain('÷')
      expect(text).toContain('→')
    }
  })

  it('handles 【...】 bracket labels as plain text (not a heading)', () => {
    const blocks = parseRichText('【ポイント】ここが大事')
    expect(blocks[0].type).toBe('paragraph')
  })

  it('keeps a paragraph that contains an inline icon token', () => {
    const blocks = parseRichText('結論として [icon:point] 大事なのは粒度です。')
    expect(blocks[0].type).toBe('paragraph')
    if (blocks[0].type === 'paragraph') {
      const kinds = blocks[0].tokens.map((t) => t.type)
      expect(kinds).toContain('icon')
    }
  })

  it('parses a :::tip callout block with inner blocks', () => {
    const blocks = parseRichText(':::tip\nこれはヒントです。\n:::')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('callout')
    if (blocks[0].type === 'callout') {
      expect(blocks[0].kind).toBe('tip')
      expect(blocks[0].blocks[0].type).toBe('paragraph')
    }
  })

  it('parses :::warn and :::point callout kinds', () => {
    const warn = parseRichText(':::warn\n注意。\n:::')[0]
    const point = parseRichText(':::point\n要点。\n:::')[0]
    expect(warn.type === 'callout' && warn.kind).toBe('warn')
    expect(point.type === 'callout' && point.kind).toBe('point')
  })

  it('defaults a bare ::: callout to note kind', () => {
    const blocks = parseRichText(':::\nメモ。\n:::')
    expect(blocks[0].type === 'callout' && blocks[0].kind).toBe('note')
  })

  it('allows lists and bold inside a callout', () => {
    const blocks = parseRichText(':::tip\n- **A** が大事\n- B も\n:::')
    expect(blocks[0].type).toBe('callout')
    if (blocks[0].type === 'callout') {
      expect(blocks[0].blocks[0].type).toBe('bullets')
    }
  })

  it('does not crash on an unclosed callout fence', () => {
    const blocks = parseRichText(':::tip\n閉じ忘れた本文')
    expect(blocks[0].type).toBe('callout')
    if (blocks[0].type === 'callout') {
      expect(blocks[0].blocks[0].type).toBe('paragraph')
    }
  })

  // ── 孤立 close `:::` ガード（splitBody 分断事故の無害化） ──
  it('does NOT create a spurious callout from a lone closing ::: at the start', () => {
    // callout が途中分断され、閉じ `:::` だけが残ったチャンクを想定。
    // 裸 `:::` は対応 close が無ければ無視され、後続テキストを囲む callout を作らない。
    const blocks = parseRichText(':::\n後続のテキストが丸ごと囲まれてはいけない。')
    expect(blocks.every((b) => b.type !== 'callout')).toBe(true)
    const para = blocks.find((b) => b.type === 'paragraph')
    expect(para).toBeDefined()
    if (para && para.type === 'paragraph') {
      expect(para.tokens.map((t) => (t.type === 'icon' ? '' : t.value)).join('')).toContain(
        '後続のテキストが丸ごと囲まれてはいけない。',
      )
    }
  })

  it('ignores a lone bare ::: line in the middle of text (no spurious callout)', () => {
    const blocks = parseRichText('前の段落。\n\n:::\n\n後の段落。')
    expect(blocks.every((b) => b.type !== 'callout')).toBe(true)
    const text = blocks
      .filter((b) => b.type === 'paragraph')
      .flatMap((b) => (b.type === 'paragraph' ? b.tokens : []))
      .map((t) => (t.type === 'icon' ? '' : t.value))
      .join('')
    expect(text).toContain('前の段落。')
    expect(text).toContain('後の段落。')
  })

  it('still parses a properly paired bare ::: ... ::: as a note callout', () => {
    // 対応 close がある裸 `:::` は従来どおり note callout（ガードで誤って潰さない）
    const blocks = parseRichText(':::\nメモ本文。\n:::\n\n後続。')
    expect(blocks[0].type === 'callout' && blocks[0].kind).toBe('note')
    // 後続段落は callout の外に出る
    const lastPara = blocks.filter((b) => b.type === 'paragraph').pop()
    expect(lastPara).toBeDefined()
  })

  it('keeps blank lines inside a callout without breaking it (multi-paragraph callout)', () => {
    const blocks = parseRichText(':::point\n第1段落。\n\n第2段落。\n:::')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('callout')
    if (blocks[0].type === 'callout') {
      const paras = blocks[0].blocks.filter((b) => b.type === 'paragraph')
      expect(paras.length).toBe(2)
    }
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

  it('removes inline icon tokens (not read out as text)', () => {
    const out = stripMarkup('[icon:good] 正しいやり方')
    expect(out).not.toContain('icon')
    expect(out).not.toContain('[')
    expect(out).toContain('正しいやり方')
  })

  it('removes an icon token in the middle and keeps surrounding text', () => {
    const out = stripMarkup('前 [icon:bad] 後')
    expect(out).not.toContain('[icon')
    expect(out).toContain('前')
    expect(out).toContain('後')
  })

  it('keeps ratio/time strings intact (not stripped as icons)', () => {
    expect(stripMarkup('黄金比は 3:1、集合は 10:30')).toBe('黄金比は 3:1、集合は 10:30')
  })

  it('removes emoji so TTS does not read emoji names', () => {
    const out = stripMarkup('大事なポイント💡 です✅')
    expect(out).toBe('大事なポイント です')
  })

  it('removes emoji with variation selector and ZWJ sequences', () => {
    const out = stripMarkup('注意⚠️ 危険')
    expect(out).not.toContain('⚠')
    expect(out).toContain('注意')
    expect(out).toContain('危険')
  })

  it('keeps math symbols (× ÷ → ≠) while removing emoji', () => {
    const out = stripMarkup('縦 × 横 ÷ 2 → 答え 🎯')
    expect(out).toContain('×')
    expect(out).toContain('÷')
    expect(out).toContain('→')
    expect(out).not.toContain('🎯')
  })

  it('strips callout fences but keeps inner content', () => {
    const out = stripMarkup(':::tip\nこれはヒントです。\n:::')
    expect(out).not.toContain(':::')
    expect(out).toContain('これはヒントです。')
  })
})
