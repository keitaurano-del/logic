import { test, expect } from '@playwright/test'
import { boot, tab } from '../fixtures/boot'

/**
 * Locale 切替 — JA/EN 両方を網羅して、各画面で
 *   1. その言語の代表的な文字列が出る
 *   2. もう一方の言語のキーが混じっていない
 * を確認する。
 *
 * 既存テストは roadmap 1 箇所だけしかチェックしていなかった。
 */

test.describe('JA ロケール — 全 root 画面で日本語', () => {
  test('home: "今日の1問" が出て、英語タイトルは出ない', async ({ page }) => {
    await boot(page, { locale: 'ja' })
    await tab(page, 0).click()
    await expect(page.locator('button[aria-label="今日の1問を解く"]').first()).toBeVisible()
    await expect(page.locator("button[aria-label=\"Open today's problem\"]")).toHaveCount(0)
  })

  test('lessons: "論理的に考える" が出て英語は出ない', async ({ page }) => {
    await boot(page, { locale: 'ja' })
    await tab(page, 1).click()
    await expect(page.locator('text=論理的に考える').first()).toBeVisible()
    await expect(page.locator('text=Think Logically')).toHaveCount(0)
  })

  test('profile: "レベル"/"連続学習日数" の日本語が出る', async ({ page }) => {
    await boot(page, { locale: 'ja', displayName: 'ja' })
    await tab(page, 4).click()
    await expect(page.locator('text=レベル').first()).toBeVisible()
    await expect(page.locator('text=連続学習日数').first()).toBeVisible()
    await expect(page.locator('text=LEVEL')).toHaveCount(0)
    await expect(page.locator('text=Day Streak')).toHaveCount(0)
  })
})

test.describe('EN ロケール — 全 root 画面で英語のみ', () => {
  test('home: "Open today\'s problem" が出て、日本語タイトルは出ない', async ({ page }) => {
    await boot(page, { locale: 'en' })
    await tab(page, 0).click()
    await expect(page.locator("button[aria-label=\"Open today's problem\"]").first()).toBeVisible()
    await expect(page.locator('button[aria-label="今日の1問を解く"]')).toHaveCount(0)
  })

  test('lessons: "Think Logically" コース見出しが出て日本語は混在しない', async ({ page }) => {
    await boot(page, { locale: 'en' })
    await tab(page, 1).click()
    await page.waitForSelector('text=Training', { timeout: 5_000 })
    await expect(page.locator('text=Think Logically').first()).toBeVisible()
    // 日本語タイトルが混ざっていない
    await expect(page.locator('text=論理的に考える')).toHaveCount(0)
    await expect(page.locator('text=ロジカルに考えて、整理する')).toHaveCount(0)
  })

  test('profile: "LEVEL"/"Day Streak" が出る、日本語は混ざらない', async ({ page }) => {
    await boot(page, { locale: 'en', displayName: 'en' })
    await tab(page, 4).click()
    await expect(page.locator('text=LEVEL').first()).toBeVisible()
    await expect(page.locator('text=Day Streak').first()).toBeVisible()
    await expect(page.locator('text=Lessons').first()).toBeVisible()
    await expect(page.locator('text=Total XP').first()).toBeVisible()
    // JA キーが漏れていない
    await expect(page.locator('text=レベル')).toHaveCount(0)
    await expect(page.locator('text=連続学習日数')).toHaveCount(0)
  })

  test('fermi screen: 解答 textarea が英語の placeholder / "Submit" ボタン', async ({ page }) => {
    await boot(page, { locale: 'en', path: '/?preview=fermi' })
    // 提出ボタン
    await expect(page.locator('#dailyFermi-submit-btn')).toContainText(/Submit/i, { timeout: 7_000 })
    // 解答 textarea の aria-label が英語
    await expect(page.locator('textarea[aria-label="Fermi estimation answer"]')).toHaveCount(1)
    await expect(page.locator('textarea[aria-label="フェルミ推定の解答"]')).toHaveCount(0)
  })

  test('journal タブで未ログイン CTA が英語表記', async ({ page }) => {
    await boot(page, { locale: 'en' })
    await tab(page, 3).click()
    // ログインしてないので CTA が出る。"Sign in" or "Log in" を含む英文が見える
    const cta = page.locator('text=Sign').or(page.locator('text=Log')).first()
    await expect(cta).toBeVisible({ timeout: 7_000 })
    // 日本語が混ざってない
    await expect(page.locator('text=ログインまたは新規登録')).toHaveCount(0)
  })
})

test.describe('Locale 永続化', () => {
  test('EN 設定後にリロードしても EN のまま', async ({ page }) => {
    await boot(page, { locale: 'en' })
    await tab(page, 0).click()
    await expect(page.locator("button[aria-label=\"Open today's problem\"]").first()).toBeVisible()
    await page.reload()
    await page.waitForSelector('.app-shell')
    await expect(page.locator("button[aria-label=\"Open today's problem\"]").first()).toBeVisible()
    // localStorage に保持されているか
    const stored = await page.evaluate(() => localStorage.getItem('logic-locale'))
    expect(stored).toBe('en')
  })
})
