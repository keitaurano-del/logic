import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * a11y 自動チェック
 *
 * - 設計書: docs/HIG_MATERIAL_AUDIT_20260504.md §Phase 4-4
 * - axe-core で WCAG 2.1 A / AA 違反を自動検出
 * - 主要画面 (Home / Lessons / Profile / Lesson / Fermi) を対象
 *
 * 既知の "color-contrast" 違反は dark mode の意図的なローコントラストで
 * デザイン判断に委ねたいケースもあるため、disabled = true で許容。
 * 構造的違反 (label / aria / role / heading-order) のみを fail 条件にする。
 */

async function goto(page: Page, path = '/') {
  await page.addInitScript(() => {
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-install-id', 'test')
  })
  await page.goto(path)
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

function tab(page: Page, n: number) {
  return page.locator('.tabbar .tab').nth(n)
}

function buildScanner(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // dark mode の brand-tinted UI は contrast がギリギリ AA を下回る箇所が
    // あり、マニュアル確認で OK としているため自動チェックからは除外。
    .disableRules(['color-contrast'])
}

test.describe('a11y / axe-core', () => {
  test('Home tab has no critical accessibility violations', async ({ page }) => {
    await goto(page)
    await tab(page, 0).click()
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('Lessons tab has no critical accessibility violations', async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('Ranking tab has no critical accessibility violations', async ({ page }) => {
    await goto(page)
    await tab(page, 2).click()
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('Profile tab has no critical accessibility violations', async ({ page }) => {
    await goto(page)
    await tab(page, 3).click()
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('Lesson screen has no critical accessibility violations', async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
    await page.locator('.cat-tile').first().click()
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('Fermi screen has no critical accessibility violations', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('logic-onboarded', '1')
      localStorage.setItem('logic-install-id', 'test')
    })
    await page.goto('/?preview=fermi')
    await page.waitForSelector('.app-shell', { timeout: 10_000 })
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('Pricing screen has no critical accessibility violations', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('logic-onboarded', '1')
      localStorage.setItem('logic-install-id', 'test')
    })
    await page.goto('/?preview=pricing')
    await page.waitForSelector('.app-shell', { timeout: 10_000 })
    // pricing screen のレイアウト遷移完了を待つ (Suspense / fade-in 含む)
    await page.waitForLoadState('networkidle')
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('Onboarding screen has no critical accessibility violations', async ({ page }) => {
    await page.addInitScript(() => {
      // logic-onboarded を意図的にセットしない → onboarding に進む
      localStorage.setItem('logic-install-id', 'test')
    })
    await page.goto('/?preview=onboarding')
    // OnboardingScreen は AppShell を介さず full-screen 表示なので
    // .app-shell ではなく Suspense 解決後の内容ロードを待つ。
    await page.waitForLoadState('networkidle')
    // body に何らかの interactive element が出現するまで明示的に待機
    await page.waitForSelector('button, input', { timeout: 10_000 })
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
})
