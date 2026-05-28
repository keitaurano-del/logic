import { defineConfig, devices } from '@playwright/test'

/**
 * Render Production 専用 Playwright 設定。
 *
 * - webServer を起動しない（本番 URL を直接叩く）
 * - mobile viewport (Pixel 5) 中心、スクショ取得目的
 * - 1 ワーカーで順次実行（Render に過剰負荷を掛けない）
 *
 * 実行: node node_modules/.bin/playwright test -c playwright.render.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  // 日付固定にすると新しい render-smoke-<日付>.spec.ts を追加したときに
  // night-patrol.sh が渡す「最新 spec」と testMatch の積集合が空になり
  // "No tests found" で空振りする。glob にして全 smoke spec を追従させる。
  testMatch: ['render-smoke-*.spec.ts'],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PW_BASE_URL ?? 'https://logic-u5wn.onrender.com',
    headless: true,
    screenshot: 'off',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
})
