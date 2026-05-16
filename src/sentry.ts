import * as Sentry from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined
const ENV = (import.meta.env.MODE as string | undefined) ?? 'development'
const RELEASE = import.meta.env.VITE_APP_VERSION as string | undefined

let initialized = false

export function initSentry() {
  if (initialized) return
  if (!DSN) return // DSN 未設定なら何もしない（開発・ローカル）
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    release: RELEASE,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      // ローカル開発のノイズを除外
      if (ENV === 'development') return null
      return event
    },
  })
  initialized = true
}

export function captureException(err: unknown, ctx?: Record<string, unknown>) {
  if (!initialized) return
  if (ctx) {
    Sentry.withScope((scope) => {
      for (const [k, v] of Object.entries(ctx)) {
        scope.setExtra(k, v)
      }
      Sentry.captureException(err)
    })
  } else {
    Sentry.captureException(err)
  }
}

export function setUser(user: { id: string; email?: string | null } | null) {
  if (!initialized) return
  Sentry.setUser(user ? { id: user.id, email: user.email ?? undefined } : null)
}
