/**
 * LR-37: ErrorBoundary 回帰テスト
 *
 * - 子コンポーネントが throw したとき Sentry へ送信される（captureException 呼び出し）
 * - fallback に「もう一度試す」「ホームへ戻る」導線が出る
 * - ホームへ戻る導線が onGoHome props を呼ぶ（router 非依存の復帰）
 * - 正常時は children をそのまま描画する
 */
import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { setLocale } from '../i18n'

// Sentry 送信をモックして呼び出しを検証する。
const mockCapture = vi.fn()
vi.mock('../sentry', () => ({
  captureException: (...args: unknown[]) => mockCapture(...args),
}))

import { ErrorBoundary } from '../components/ErrorBoundary'

// 描画時に必ず throw する子。
function Boom(): never {
  throw new Error('boom')
}

beforeAll(() => { setLocale('ja') })

describe('ErrorBoundary (LR-37)', () => {
  beforeEach(() => {
    mockCapture.mockClear()
    // React が componentDidCatch 前に投げる console.error を抑制。
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('captures the error to Sentry on componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(mockCapture).toHaveBeenCalledTimes(1)
    const [err, ctx] = mockCapture.mock.calls[0]
    expect(err).toBeInstanceOf(Error)
    expect((err as Error).message).toBe('boom')
    // componentStack を extra として渡している
    expect(ctx).toHaveProperty('componentStack')
  })

  it('shows i18n fallback with retry and home actions', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('問題が発生しました')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もう一度試す' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ホームに戻る' })).toBeInTheDocument()
  })

  it('invokes onGoHome when the home button is clicked', () => {
    const onGoHome = vi.fn()
    render(
      <ErrorBoundary onGoHome={onGoHome}>
        <Boom />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'ホームに戻る' }))
    expect(onGoHome).toHaveBeenCalledTimes(1)
  })

  it('renders a custom fallback node when provided', () => {
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('custom fallback')).toBeInTheDocument()
  })
})
