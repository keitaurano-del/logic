// Sentry integration — initialized lazily so it's a no-op when DSN is unset.
// Set VITE_SENTRY_DSN in .env or in the deployment environment to enable.
//
// Install before first run:
//   npm install @sentry/react
//
// Then set the env var (Render → Environment, or local .env.local):
//   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

import * as Sentry from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

export function initSentry() {
  if (!DSN) {
    if (import.meta.env.DEV) console.info('[sentry] DSN not set, skipping init')
    return
  }
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    // Conservative sample rates for a small app
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Don't send PII
    sendDefaultPii: false,
    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      'Failed to fetch',
    ],
  })
}

export function captureException(err: unknown, ctx?: Record<string, unknown>) {
  if (!DSN) return
  Sentry.captureException(err, ctx ? { extra: ctx } : undefined)
}
