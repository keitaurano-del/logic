import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { boot, tab } from '../fixtures/boot'

/**
 * a11y 自動チェック (axe-core / WCAG 2.1 A・AA)。
 *
 * 主要画面に対して critical violation がゼロであることを assert。
 * color-contrast はデザイン判断で許容する箇所があるので除外。
 */

function buildScanner(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast'])
}

const ROOT_TABS: { tabIdx: number; name: string }[] = [
  { tabIdx: 0, name: 'home' },
  { tabIdx: 1, name: 'lessons' },
  { tabIdx: 2, name: 'ranking' },
  { tabIdx: 3, name: 'journal' },
  { tabIdx: 4, name: 'profile' },
]

for (const { tabIdx, name } of ROOT_TABS) {
  test(`a11y: ${name} タブで critical violations が無い`, async ({ page }) => {
    await boot(page, { displayName: 'a11y-user', xp: 100 })
    await tab(page, tabIdx).click()
    await page.waitForLoadState('networkidle')
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
}

const PREVIEW_SCREENS = [
  { path: '/?preview=fermi', name: 'fermi' },
  { path: '/?preview=pricing', name: 'pricing' },
  { path: '/?preview=settings', name: 'settings' },
  { path: '/?preview=account', name: 'account-settings' },
  { path: '/?preview=notifications', name: 'notification-settings' },
]

for (const { path, name } of PREVIEW_SCREENS) {
  test(`a11y: ${name} 画面で critical violations が無い`, async ({ page }) => {
    await boot(page, { path })
    await page.waitForLoadState('networkidle')
    const results = await buildScanner(page).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
}

test('a11y: onboarding 画面で critical violations が無い', async ({ page }) => {
  await boot(page, { onboarded: false, path: '/?preview=onboarding' })
  await page.waitForLoadState('networkidle')
  const results = await buildScanner(page).analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})
