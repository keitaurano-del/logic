import { test, expect } from '@playwright/test'
import { boot } from '../fixtures/boot'

/**
 * Onboarding flow — 初回起動からホーム着地まで。
 *
 * Onboarding は birthYear → gender → occupation の 3 属性ステップを通り、
 * 最後にメール登録（Magic Link）に至る state machine。
 * ウェルカムスライドは 2026-05-16 に廃止され、起動直後に属性質問（birthYear）が出る。
 * 最初の birthYear ステップは「5 択ボタン」ではなく「西暦4桁の数値入力」方式（DF-F6）。
 * テストでは入力バリデーション（空/桁不足は無効、4桁有効値で「次へ」有効）と
 * 次ステップ（gender）への前進を確認する。
 */

test.describe('Onboarding — 初回起動状態', () => {
  test('未 onboarded 状態で AppShell ではなく onboarding 画面に着地', async ({ page }) => {
    await boot(page, { onboarded: false })
    // AppShell が出ていないこと
    await expect(page.locator('.app-shell')).toHaveCount(0)
    // 何らかの button が出ている（welcome or step）
    const buttonCount = await page.locator('button:visible').count()
    expect(buttonCount).toBeGreaterThan(0)
  })

  test('?preview=onboarding でも同じ画面に到達', async ({ page }) => {
    await boot(page, { onboarded: false, path: '/?preview=onboarding' })
    await expect(page.locator('.app-shell')).toHaveCount(0)
    const buttonCount = await page.locator('button:visible').count()
    expect(buttonCount).toBeGreaterThan(0)
  })
})

test.describe('Onboarding — birthYear step（西暦4桁入力）', () => {
  test('起動直後に birthYear の数値入力とヒント文言が表示される', async ({ page }) => {
    await boot(page, { onboarded: false, path: '/?preview=onboarding' })

    // 5 択ボタンではなく、西暦4桁を受ける数値入力が出ること
    const yearInput = page.locator('input[type="number"]')
    await expect(yearInput).toBeVisible()

    // 「西暦4桁で入力してください（1900〜…）」のヒント文言が出ること。
    // sub 文言（…世代別の分析に使用します）と区別するため範囲表記の全角括弧でマッチさせる。
    await expect(page.getByText(/西暦4桁で入力してください（\d{4}〜\d{4}）/)).toBeVisible()
  })

  test('空・桁不足では「次へ」が無効、4桁の有効値で有効になる', async ({ page }) => {
    await boot(page, { onboarded: false, path: '/?preview=onboarding' })

    const yearInput = page.locator('input[type="number"]')
    const nextBtn = page.getByRole('button', { name: '次へ', exact: true })

    // 初期（空）は無効
    await expect(nextBtn).toBeDisabled()

    // 2 桁では無効（西暦4桁の要件を満たさない）
    await yearInput.fill('19')
    await expect(nextBtn).toBeDisabled()

    // 範囲外（未来の年など）は無効。max は currentYear なので明らかに超過する値を使う
    await yearInput.fill('3000')
    await expect(nextBtn).toBeDisabled()

    // 4 桁の有効値で有効化
    await yearInput.fill('1990')
    await expect(nextBtn).toBeEnabled()
  })

  test('有効な birthYear を入力して「次へ」を押すと gender step へ進む', async ({ page }) => {
    await boot(page, { onboarded: false, path: '/?preview=onboarding' })

    const yearInput = page.locator('input[type="number"]')
    await yearInput.fill('1990')

    const nextBtn = page.getByRole('button', { name: '次へ', exact: true })
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()

    // 次ステップ（性別）の見出しが出ること
    await expect(page.getByText('性別を教えてください')).toBeVisible()
  })

  test('onboarding 完了相当の状態だと AppShell に直接着地', async ({ page }) => {
    await boot(page, { onboarded: true })
    await expect(page.locator('.app-shell')).toBeVisible()
  })
})

test.describe('Onboarding 完了 marker', () => {
  test('logic-onboarded=1 を仕込むと onboarding をスキップ', async ({ page }) => {
    await boot(page, { onboarded: true })
    // AppShell が出てくる
    await expect(page.locator('.app-shell')).toBeVisible()
    await expect(page.locator('.tabbar')).toBeVisible()
  })

  test('未 onboarded から localStorage 経由でも復帰可能', async ({ page }) => {
    await boot(page, { onboarded: false })
    await page.evaluate(() => localStorage.setItem('logic-onboarded', '1'))
    await page.goto('/')
    await page.waitForSelector('.app-shell', { timeout: 10_000 })
    await expect(page.locator('.app-shell')).toBeVisible()
  })
})
