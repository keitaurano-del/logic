/**
 * FB-18 / FB-19 検証専用 Playwright 設定（一時使用）
 * 実行: PW_BASE_URL=https://logic-u5wn.onrender.com \
 *       node node_modules/.bin/playwright test -c playwright.functional-fb1819.config.ts
 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: ['render-functional-20260603-fb18-fb19.spec.ts'],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PW_BASE_URL ?? 'https://logic-u5wn.onrender.com',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 20_000,
    navigationTimeout: 40_000,
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
