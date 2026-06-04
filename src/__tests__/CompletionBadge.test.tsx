import { describe, expect, it, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompletionBadge } from '../components/CompletionBadge'
import { setLocale } from '../i18n'

// locale 自動判定が en になるテスト環境でも日本語固定で動かす（aria-label が ja 前提のテスト）
beforeAll(() => { setLocale('ja') })

describe('CompletionBadge', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<CompletionBadge count={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for negative count', () => {
    const { container } = render(<CompletionBadge count={-1} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a check-mark badge for count = 1', () => {
    render(<CompletionBadge count={1} />)
    const node = screen.getByLabelText('1 回完了')
    expect(node).toBeInTheDocument()
    // 1 回目はチェックマーク (svg) で描画される
    expect(node.querySelector('svg')).not.toBeNull()
    expect(node.textContent ?? '').not.toMatch(/\d/)
  })

  it('uses the theme accent (not mastery) for count = 1', () => {
    render(<CompletionBadge count={1} />)
    const node = screen.getByLabelText('1 回完了') as HTMLElement
    // count=1 は従来どおり --accent 追従 (mastery には切り替えない)
    expect(node.style.background).toContain('var(--accent)')
    // 二重符号化の金縁リングは付かない
    expect(node.style.boxShadow).toBe('')
  })

  it('renders the digit 2 for count = 2', () => {
    render(<CompletionBadge count={2} />)
    const node = screen.getByLabelText('2 回完了')
    expect(node).toBeInTheDocument()
    expect(node.textContent).toBe('2')
  })

  it('switches to mastery color and adds a ring for count = 2', () => {
    render(<CompletionBadge count={2} />)
    const node = screen.getByLabelText('2 回完了') as HTMLElement
    // T-Y: count>=2 は習熟色 --mastery に切替 + 形状 (金縁リング) で二重符号化
    expect(node.style.boxShadow).toContain('var(--mastery)')
  })

  it('renders the digit 3 for count = 3', () => {
    render(<CompletionBadge count={3} />)
    expect(screen.getByLabelText('3 回完了')).toHaveTextContent('3')
  })

  it('uses mastery fill + foreground for count >= 3', () => {
    render(<CompletionBadge count={3} />)
    const node = screen.getByLabelText('3 回完了') as HTMLElement
    expect(node.style.background).toContain('var(--mastery)')
    expect(node.style.color).toContain('var(--mastery-fg)')
    expect(node.style.boxShadow).toContain('var(--mastery)')
  })

  it('renders the digit 9 for count = 9', () => {
    render(<CompletionBadge count={9} />)
    expect(screen.getByLabelText('9 回完了')).toHaveTextContent('9')
  })

  it('shows 9+ once count reaches 10', () => {
    render(<CompletionBadge count={10} />)
    expect(screen.getByLabelText('10 回完了')).toHaveTextContent('9+')
  })

  it('shows 9+ for any large count', () => {
    render(<CompletionBadge count={42} />)
    expect(screen.getByLabelText('42 回完了')).toHaveTextContent('9+')
  })

  it('respects the size prop on the outer wrapper', () => {
    render(<CompletionBadge count={1} size={64} />)
    const node = screen.getByLabelText('1 回完了') as HTMLElement
    expect(node.style.width).toBe('64px')
    expect(node.style.height).toBe('64px')
  })
})
