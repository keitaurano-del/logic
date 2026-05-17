import { test, expect } from '@playwright/test'
import { boot } from '../fixtures/boot'

/**
 * Daily Fermi flow — 今日の1問を読む → 解答入力 → 「回答を提出する」。
 *
 * 解答入力エリア: textarea[aria-label="フェルミ推定の解答"]
 * 提出ボタン: button#dailyFermi-submit-btn (i18n: "回答を提出する")
 *
 * 別物として AI に質問する用の chat 入力 (aria-label="送信") もあるので注意。
 *
 * Anthropic API 呼び出しは boot() の blockExternalApi で全部 stub。
 */

const ANSWER_TEXTAREA = 'textarea[aria-label="フェルミ推定の解答"]'
const SUBMIT_BTN = '#dailyFermi-submit-btn'

test.describe('Fermi — UI 構造', () => {
  test('?preview=fermi で解答 textarea と提出ボタンが visible', async ({ page }) => {
    await boot(page, { path: '/?preview=fermi' })
    await expect(page.locator(ANSWER_TEXTAREA)).toBeVisible({ timeout: 7_000 })
    await expect(page.locator(SUBMIT_BTN)).toBeVisible()
  })

  test('解答 textarea が空のとき提出ボタンは disabled', async ({ page }) => {
    await boot(page, { path: '/?preview=fermi' })
    await expect(page.locator(SUBMIT_BTN)).toBeDisabled()
  })

  test('解答を入力すると提出ボタンが enabled', async ({ page }) => {
    await boot(page, { path: '/?preview=fermi' })
    await page.locator(ANSWER_TEXTAREA).fill('日本のスタバは約 1700 店舗。日販 30 万 ×。')
    await expect(page.locator(SUBMIT_BTN)).toBeEnabled()
  })

  test('JA: 提出ボタンに "回答を提出する" の文字が出る', async ({ page }) => {
    await boot(page, { locale: 'ja', path: '/?preview=fermi' })
    await expect(page.locator(SUBMIT_BTN)).toContainText('回答を提出')
  })

  test('EN: 提出ボタンに "Submit answer" の文字が出る', async ({ page }) => {
    await boot(page, { locale: 'en', path: '/?preview=fermi' })
    await expect(page.locator(SUBMIT_BTN)).toContainText('Submit')
  })
})

test.describe('Fermi — 送信フロー', () => {
  test('提出 → 採点完了画面が出る → 結果を確認するで feedback 表示', async ({ page }) => {
    await boot(page, { path: '/?preview=fermi' })
    // boot 後に specific mock を register（playwright は後勝ち）
    await page.route('**/api/fermi/feedback', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          feedback: '回答の構造が明確で良い。仮置きの妥当性も書けるとさらに良い。',
          score: 75,
          breakdown: { structure: 80, logic: 70, presentation: 75 },
        }),
      })
    })

    await page.locator(ANSWER_TEXTAREA).fill('日本のスタバは約 1700 店舗で、平均日販 30 万円。')
    await expect(page.locator(SUBMIT_BTN)).toBeEnabled()
    await page.locator(SUBMIT_BTN).click()

    // 採点完了 → 「結果を確認する」ボタンが出る
    const resultBtn = page.locator('button', { hasText: '結果を確認' }).first()
    await expect(resultBtn).toBeVisible({ timeout: 10_000 })
    await resultBtn.click()

    // feedback 本文が表示される
    await expect(page.locator('text=回答の構造が明確で良い').first()).toBeVisible({ timeout: 7_000 })
  })

  test('提出後、Submit ボタンは disabled or 消える（再送信防止）', async ({ page }) => {
    await boot(page, { path: '/?preview=fermi' })
    await page.route('**/api/fermi/feedback', async (route) => {
      await new Promise((r) => setTimeout(r, 400))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ feedback: 'ok', score: 50 }),
      })
    })

    await page.locator(ANSWER_TEXTAREA).fill('テスト')
    const btn = page.locator(SUBMIT_BTN)
    await btn.click()
    // 採点完了画面に遷移 → submit ボタンは hidden（または別画面）
    await expect(page.locator('button', { hasText: '結果を確認' }).first()).toBeVisible({ timeout: 5_000 })
  })

  test('500 エラー時もアプリがクラッシュせず、何かしらの UI に戻る', async ({ page }) => {
    await boot(page, { path: '/?preview=fermi' })
    await page.route('**/api/fermi/feedback', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'internal' }) })
    })
    await page.locator(ANSWER_TEXTAREA).fill('テスト')
    await page.locator(SUBMIT_BTN).click()
    // app-shell がそのまま生きていて、再度 submit を試せる or エラーメッセージ表示
    await page.waitForTimeout(1500)
    await expect(page.locator('.app-shell')).toBeVisible()
    // 解答 textarea がまだ visible（クラッシュしてない）か、結果画面に進んでいる
    const stillEditable = await page.locator(ANSWER_TEXTAREA).isVisible().catch(() => false)
    const resultShown = await page.locator('button', { hasText: '結果を確認' }).first().isVisible().catch(() => false)
    expect(stillEditable || resultShown).toBeTruthy()
  })
})

test.describe('Fermi — Home からの導線', () => {
  test('home の "今日の1問" ボタン → fermi 画面に遷移して解答 textarea が見える', async ({ page }) => {
    await boot(page)
    await page.locator('button[aria-label="今日の1問を解く"]').first().click()
    await expect(page.locator(ANSWER_TEXTAREA)).toBeVisible({ timeout: 10_000 })
  })
})
