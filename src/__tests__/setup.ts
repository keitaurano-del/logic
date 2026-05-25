import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'

/**
 * Vitest 共通セットアップ。
 *
 * - localStorage / sessionStorage は jsdom が標準で持っているので個別モック不要だが、
 *   テストごとに状態を確実にリセットしておく。
 * - fetch はテスト側で必要なものだけ vi.spyOn で差し替える運用なので、
 *   ここではデフォルトの空応答を返す共通スタブを用意する。
 * - import.meta.env.DEV は本番ビルド扱いにしておく (console.warn を抑えるため)。
 */

beforeEach(() => {
  try {
    localStorage.clear()
  } catch { /* */ }
  try {
    sessionStorage.clear()
  } catch { /* */ }
  // デフォルトの fetch スタブ。各テストで必要に応じて上書きする。
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify({ enabled: false, rolloutPct: 0, hashBucket: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
