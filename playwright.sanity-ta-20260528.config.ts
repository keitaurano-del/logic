import { defineConfig, devices } from '@playwright/test'

/**
 * T-A sanity 専用 Playwright 設定（ローカル dev server 向け、2026-05-28）。
 *
 * - webServer は起動しない（http://localhost:5173/ が起動済み前提）
 * - mobile viewport 中心（spec 側で 375x812 を test.use 指定）
 * - 1 ワーカーで順次実行
 * - 対象は e2e/render-sanity-20260528.spec.ts のみ
 *
 * 実行: node node_modules/.bin/playwright test -c playwright.sanity-ta-20260528.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['render-sanity-20260528.spec.ts'],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PW_BASE_URL ?? 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
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
