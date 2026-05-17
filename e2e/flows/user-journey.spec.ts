import { test, expect } from '@playwright/test'
import { boot, tab } from '../fixtures/boot'

/**
 * User journey — 1 ユーザーが Onboarding 後にやる典型的な操作を一気通貫で。
 *
 * Keita 指示「ユーザーストーリーベースの導線」をカバーする。
 */

test('ユーザーが home → fermi → home → lessons → category → 戻る → profile を回る', async ({ page }) => {
  await boot(page, { displayName: 'journey-user', xp: 50, streakCount: 2, completedLessons: ['lesson-1'] })
  // 「今日の1問」mock（boot の catch-all より後勝ち）
  await page.route('**/api/fermi/feedback', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ feedback: 'good answer', score: 60 }),
    })
  })

  // 1. home に着地
  await tab(page, 0).click()
  await expect(page.locator('button[aria-label="今日の1問を解く"]').first()).toBeVisible()

  // 2. 今日の1問 → fermi 画面
  await page.locator('button[aria-label="今日の1問を解く"]').first().click()
  await expect(page.locator('textarea[aria-label="フェルミ推定の解答"]')).toBeVisible({ timeout: 10_000 })

  // 3. 入力して送信 → 採点完了 → 結果を確認 → feedback 表示
  await page.locator('textarea[aria-label="フェルミ推定の解答"]').fill('テスト回答: 約 50 万件')
  const submit = page.locator('#dailyFermi-submit-btn')
  await expect(submit).toBeEnabled()
  await submit.click()
  const resultBtn = page.locator('button', { hasText: '結果を確認' }).first()
  await expect(resultBtn).toBeVisible({ timeout: 10_000 })
  await resultBtn.click()
  await expect(page.locator('text=good answer').first()).toBeVisible({ timeout: 7_000 })

  // 4. lessons タブへ
  await tab(page, 1).click()
  await expect(page.locator('.cat-tile').first()).toBeVisible({ timeout: 5_000 })

  // 5. 最初のカテゴリをクリック
  await page.locator('.cat-tile').first().click()
  await page.waitForLoadState('networkidle')
  // どの画面でも .main-inner は中身を持つ
  await expect(page.locator('.main-inner')).toBeVisible()
  const innerText = await page.locator('.main-inner').textContent()
  expect(innerText?.length ?? 0).toBeGreaterThan(0)

  // 6. profile タブへ
  await tab(page, 4).click()
  await expect(page.locator('.profile-hero-name')).toHaveText('journey-user')
  // 仕込んだ streak が出る
  await expect(page.locator('.stats-grid .stat').nth(0)).toContainText('2')
  // 仕込んだ completed が出る
  await expect(page.locator('.stats-grid .stat').nth(1)).toContainText('1')
})

test('EN ユーザーが home → profile まで通しで英語表記のまま', async ({ page }) => {
  await boot(page, { locale: 'en', displayName: 'EN-User', xp: 0 })

  await tab(page, 0).click()
  await expect(page.locator("button[aria-label=\"Open today's problem\"]").first()).toBeVisible()

  await tab(page, 4).click()
  await expect(page.locator('.profile-hero-name')).toHaveText('EN-User')
  await expect(page.locator('text=LEVEL').first()).toBeVisible()
  await expect(page.locator('text=Day Streak').first()).toBeVisible()
  // JA キーが混じっていない
  await expect(page.locator('text=レベル')).toHaveCount(0)
  await expect(page.locator('text=連続学習日数')).toHaveCount(0)
})
