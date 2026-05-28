import { defineConfig, devices } from '@playwright/test'

/**
 * Render Production スモーク専用 Playwright 設定（PR #233 デプロイ後）。
 *
 * - webServer を起動しない（本番 URL を直接叩く）
 * - mobile viewport (Pixel 5) 中心、生死確認目的
 * - 1 ワーカーで順次実行（Render に過剰負荷を掛けない）
 * - timeout 短め: 生死確認に徹し、深い検証はしない
 * - mutating API は叩かない（guest user モードで login 不要画面のみ）
 *
 * 実行: node node_modules/.bin/playwright test -c playwright.smoke.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  // 日付固定だと新 spec 追加時に意図せず古い spec を回し続ける / 引数指定との
  // 積集合が空になる罠があるため glob で全 smoke spec を追従させる。
  testMatch: ['render-smoke-*.spec.ts'],
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
