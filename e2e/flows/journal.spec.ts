import { test, expect } from '@playwright/test'
import { boot, tab } from '../fixtures/boot'

/**
 * Journal flow — 未ログイン時は「ログインが必要」CTA が出るのが現仕様。
 *
 * Journal の本体機能（検索・記入・カレンダー）はログイン後に解放される。
 * このテストでは未ログイン状態での CTA 表示と、preview URL での到達を確認する。
 */

test.describe('Journal — 未ログイン状態の CTA', () => {
  test('journal タブをクリックすると "ログインが必要" 文言と CTA が出る', async ({ page }) => {
    await boot(page)
    await tab(page, 3).click()
    await expect(page.locator('.main-inner')).toBeVisible()
    // ログインを促す文字列
    const cta = page.locator('text=ログインが必要').or(page.locator('text=ログインまたは新規登録')).first()
    await expect(cta).toBeVisible({ timeout: 5_000 })
  })

  test('EN: 未ログイン時に英語の login prompt が出る', async ({ page }) => {
    await boot(page, { locale: 'en' })
    await tab(page, 3).click()
    const cta = page.locator('text=Sign').or(page.locator('text=Log')).first()
    await expect(cta).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('Journal — preview URL', () => {
  test('?preview=journal で AppShell 内に着地', async ({ page }) => {
    await boot(page, { path: '/?preview=journal' })
    await expect(page.locator('.app-shell')).toBeVisible()
    await expect(page.locator('.main-inner')).toBeVisible()
  })

  test('タイトル "ジャーナル" が表示される (JA)', async ({ page }) => {
    await boot(page, { path: '/?preview=journal' })
    await expect(page.locator('text=ジャーナル').first()).toBeVisible({ timeout: 5_000 })
  })
})
