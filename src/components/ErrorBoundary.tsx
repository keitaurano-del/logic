import { Component, type ErrorInfo, type ReactNode } from 'react'
import { captureException } from '../sentry'
import { t } from '../i18n'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  /** ホームへ戻る導線のカスタムハンドラ。未指定ならフルリロードでルートへ復帰する。 */
  onGoHome?: () => void
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
    // Sentry へ送信（DSN 未設定時は sentry.ts 側で no-op なので安全）。
    captureException(error, { componentStack: info.componentStack })
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  private handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome()
      return
    }
    // router 非依存。フルリロードでアプリのルートへ復帰する。
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #888)' }}>
          <p style={{ fontWeight: 700, fontSize: '1.0667rem', marginBottom: '0.5rem', color: 'var(--text, inherit)' }}>
            {t('errorBoundary.title')}
          </p>
          <p style={{ marginTop: 0, marginBottom: '1.25rem' }}>{t('errorBoundary.body')}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 12,
                border: '1px solid var(--accent, #888)',
                background: 'transparent',
                color: 'var(--accent, inherit)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('errorBoundary.retry')}
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 12,
                border: 'none',
                background: 'var(--accent-btn, #4a4a4a)',
                color: 'var(--accent-btn-fg, #fff)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('errorBoundary.home')}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
