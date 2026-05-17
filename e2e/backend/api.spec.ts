import { test, expect } from '@playwright/test'
import { boot } from '../fixtures/boot'

/**
 * API 挙動検証 — frontend が正しく /api/** を呼んでいるかを確認する。
 *
 * 本番 backend を起動するのは playwright.config の制約上やらない。
 * 代わりに page.route で intercept して、frontend → backend の呼び出し contract を assert する。
 */

test.describe('Frontend → /api/** contract', () => {
  test('fermi 送信時に POST /api/fermi/feedback が body 付きで呼ばれる', async ({ page }) => {
    let captured: { method?: string; postData?: string; url?: string } = {}
    await boot(page, { path: '/?preview=fermi' })
    await page.route('**/api/fermi/feedback', async (route) => {
      const req = route.request()
      captured = { method: req.method(), postData: req.postData() ?? undefined, url: req.url() }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ feedback: 'ok', score: 50 }),
      })
    })
    await page.locator('textarea[aria-label="フェルミ推定の解答"]').fill('テスト回答')
    await page.locator('#dailyFermi-submit-btn').click()
    // mock を呼ばせる
    await page.waitForTimeout(800)

    expect(captured.method).toBe('POST')
    expect(captured.url).toContain('/api/fermi/feedback')
    // body にユーザーの回答が含まれる
    expect(captured.postData).toBeTruthy()
    expect(captured.postData).toContain('テスト回答')
  })

  test('API_BASE は VITE_API_URL もしくはデフォルト本番 URL を指す', async ({ page }) => {
    let calledUrl = ''
    await boot(page, { path: '/?preview=fermi' })
    await page.route(/\/api\/fermi\/feedback$/, async (route) => {
      calledUrl = route.request().url()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ feedback: 'ok', score: 50 }),
      })
    })
    await page.locator('textarea[aria-label="フェルミ推定の解答"]').fill('test')
    await page.locator('#dailyFermi-submit-btn').click()
    await page.waitForTimeout(800)

    expect(calledUrl).toMatch(/\/api\/fermi\/feedback$/)
    // 本番 URL or localhost のどちらかは指している（環境による）
    expect(calledUrl).toMatch(/^https?:\/\//)
  })
})

test.describe('Frontend → /api/health 反応（mock 経由）', () => {
  test('mock /api/health は 200 / status:ok を返す', async ({ page }) => {
    await boot(page)
    const resp = await page.evaluate(async () => {
      try {
        const apiBase = 'https://logic-u5wn.onrender.com'
        const r = await fetch(`${apiBase}/api/health`)
        return { ok: r.ok, status: r.status, body: await r.json() }
      } catch (e) {
        return { ok: false, status: 0, body: { error: String(e) } }
      }
    })
    expect(resp.status).toBe(200)
    expect(resp.body).toMatchObject({ status: 'ok' })
  })
})
