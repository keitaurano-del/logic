import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { RichLessonText } from '../components/RichLessonText'

describe('RichLessonText', () => {
  it('renders bold text inside a <strong>', () => {
    const { container } = render(<RichLessonText content="これは **重要** な話" />)
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('重要')
  })

  it('renders dash bullets as a <ul> with list items', () => {
    const { container } = render(<RichLessonText content={'- A\n- B\n- C'} />)
    const ul = container.querySelector('ul')
    expect(ul).not.toBeNull()
    expect(ul?.querySelectorAll('li').length).toBe(3)
  })

  it('renders numbered lists as an <ol>', () => {
    const { container } = render(<RichLessonText content={'1. one\n2. two'} />)
    const ol = container.querySelector('ol')
    expect(ol).not.toBeNull()
    expect(ol?.querySelectorAll('li').length).toBe(2)
  })

  it('renders ## headings and attaches an SVG icon for known labels', () => {
    const { container } = render(<RichLessonText content={'## ポイント\n本文'} />)
    // 見出しテキストが描画される
    expect(container.textContent).toContain('ポイント')
    // 「ポイント」見出しには SVG アイコンが添えられる
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders a code fence as <pre>', () => {
    const { container } = render(<RichLessonText content={'説明\n\n```\nline1\nline2\n```'} />)
    const pre = container.querySelector('pre')
    expect(pre).not.toBeNull()
    expect(pre?.textContent).toContain('line1')
  })

  it('does not break on literal symbols (× ÷ → and lone *)', () => {
    const { container } = render(
      <RichLessonText content="縦 × 横 ÷ 2 → 答え。脚注 *1 を参照" />,
    )
    expect(container.textContent).toContain('×')
    expect(container.textContent).toContain('→')
    expect(container.textContent).toContain('*1')
    // 太字化されていない（strong 無し）
    expect(container.querySelector('strong')).toBeNull()
  })

  it('does not turn inline ・ into a bullet list', () => {
    const { container } = render(<RichLessonText content="論理・分析の話です" />)
    expect(container.querySelector('ul')).toBeNull()
    expect(container.textContent).toContain('論理・分析')
  })

  it('renders a registered inline icon as an SVG', () => {
    const { container } = render(<RichLessonText content="正しいのは [icon:good] こちら" />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.textContent).toContain('正しいのは')
    expect(container.textContent).toContain('こちら')
    // 記法そのものは描画テキストに残らない
    expect(container.textContent).not.toContain('[icon')
  })

  it('renders nothing (no crash) for an unregistered icon name', () => {
    const { container } = render(<RichLessonText content="前 [icon:nonexistent-foo] 後" />)
    expect(container.textContent).toContain('前')
    expect(container.textContent).toContain('後')
    // 未登録 name はテキストにもアイコンにもならない
    expect(container.textContent).not.toContain('nonexistent')
    expect(container.textContent).not.toContain('[icon')
  })

  it('does NOT render an icon for ratio/time text like 3:1 or 10:30', () => {
    const { container } = render(<RichLessonText content="比率 3:1、時刻 10:30" />)
    // インラインアイコンの span は出ない（見出しアイコンも無いので svg ゼロ）
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toContain('3:1')
    expect(container.textContent).toContain('10:30')
  })

  it('renders a :::tip callout box with an icon', () => {
    const { container } = render(
      <RichLessonText content={':::tip\nこれはヒントです。\n:::'} />,
    )
    expect(container.textContent).toContain('これはヒントです。')
    expect(container.querySelector('svg')).not.toBeNull()
    // フェンス記法は残らない
    expect(container.textContent).not.toContain(':::')
  })

  // ── icon × callout 混在描画 ──
  it('renders an inline icon inside a callout body', () => {
    const { container } = render(
      <RichLessonText content={':::point\n要点は [icon:point] 外部記憶です。\n:::'} />,
    )
    expect(container.textContent).toContain('要点は')
    expect(container.textContent).toContain('外部記憶です。')
    // 記法は残らない
    expect(container.textContent).not.toContain('[icon')
    expect(container.textContent).not.toContain(':::')
    // callout 自体のアイコン + inline アイコンで svg は 2 つ以上
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2)
  })

  it('keeps a multi-paragraph callout (blank line inside) as a single callout box', () => {
    const { container } = render(
      <RichLessonText content={':::tip\n第1段落。\n\n第2段落。\n:::'} />,
    )
    expect(container.textContent).toContain('第1段落。')
    expect(container.textContent).toContain('第2段落。')
    expect(container.textContent).not.toContain(':::')
    // 段落が 2 つとも callout の中に入っている（p が 2 つ）
    expect(container.querySelectorAll('p').length).toBe(2)
  })

  // ── kind 別アイコン / 色の出し分け ──
  it('uses warning color tokens for a :::warn callout', () => {
    const { container } = render(<RichLessonText content={':::warn\n注意。\n:::'} />)
    const box = container.querySelector('div > div') as HTMLElement | null
    // ルート callout box は最外 div の最初の子（marginBottom ラッパの下）
    const outer = container.firstElementChild?.firstElementChild as HTMLElement | null
    const style = (outer ?? box)?.getAttribute('style') ?? ''
    expect(style).toContain('var(--warning)')
    expect(style).toContain('var(--warning-soft)')
  })

  it('uses brand color tokens for a :::point callout', () => {
    const { container } = render(<RichLessonText content={':::point\n要点。\n:::'} />)
    const outer = container.firstElementChild?.firstElementChild as HTMLElement | null
    const style = outer?.getAttribute('style') ?? ''
    expect(style).toContain('var(--brand)')
    expect(style).toContain('var(--brand-soft)')
  })

  it('uses neutral tokens for a :::note callout (distinct from tip)', () => {
    const { container } = render(<RichLessonText content={':::\nメモ。\n:::'} />)
    const outer = container.firstElementChild?.firstElementChild as HTMLElement | null
    const style = outer?.getAttribute('style') ?? ''
    // note は中立色（warning でも brand-soft でもない）
    expect(style).toContain('var(--text-secondary)')
    expect(style).toContain('var(--bg-secondary)')
    expect(style).not.toContain('var(--warning)')
  })

  it('gives warn / point / note callouts visually distinct styling', () => {
    const styleOf = (content: string) => {
      const { container } = render(<RichLessonText content={content} />)
      const outer = container.firstElementChild?.firstElementChild as HTMLElement | null
      return outer?.getAttribute('style') ?? ''
    }
    const warn = styleOf(':::warn\nx\n:::')
    const point = styleOf(':::point\nx\n:::')
    const note = styleOf(':::\nx\n:::')
    // 3 kind が互いに異なる背景色トークンを使う
    expect(warn).not.toBe(point)
    expect(point).not.toBe(note)
    expect(warn).not.toBe(note)
  })
})
