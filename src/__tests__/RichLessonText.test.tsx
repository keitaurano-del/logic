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
})
