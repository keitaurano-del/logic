// Sentry stub — @sentry/react not installed. No-op until package is added.
// To enable: npm install @sentry/react, then set VITE_SENTRY_DSN in Render env.

export function initSentry() {
  // no-op
}

export function captureException(_err: unknown, _ctx?: Record<string, unknown>) {
  // no-op stub — @sentry/react not installed
}
