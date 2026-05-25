import { defineConfig, devices } from '@playwright/test'

/**
 * Render Production サニティ専用 Playwright 設定。
 *
 * - webServer を起動しない（本番 URL を直接叩く）
 * - mobile viewport (360x800) 中心、スクショ取得目的
 * - 1 ワーカーで順次実行（Render に過剰負荷を掛けない）
 * - サニティテスト本体は e2e/render-sanity-20260525.spec.ts のみ
 *
 * 実行: node node_modules/.bin/playwright test -c playwright.sanity.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['render-sanity-20260525.spec.ts'],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PW_BASE_URL ?? 'https://logic-u5wn.onrender.com',
    headless: true,
    screenshot: 'off',
    video: 'off',
    actionTimeout: 12_000,
    navigationTimeout: 25_000,
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
