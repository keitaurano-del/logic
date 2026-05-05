/**
 * Automated accessibility checks via axe-core.
 *
 * 設計書: docs/HIG_MATERIAL_AUDIT_20260504.md §4 / §9.1 / Phase 4-4
 *
 * Scope:
 * - 主要画面のランドマーク / role / aria-* 妥当性を axe-core で機械検証
 * - color-contrast はブラウザでの計算値が dynamic theme と相性悪いため、
 *   一時的に exclude する（手動検証は QA_CHECKLIST_HIG_M3.md §1 でカバー）
 * - WCAG 2.0 / 2.1 AA の violation を 0 件にする（Critical / Serious のみ fail）
 */
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function goto(page: Page, path = '/') {
  await page.goto(path)
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

async function runAxe(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // color-contrast は別途手動 QA で確認（Dynamic Type / theme との相性）
    .disableRules(['color-contrast'])
    .analyze()
}

function critical(violations: { impact?: string | null }[]) {
  return violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
}

test.describe('a11y (axe-core)', () => {
  test('home: no critical / serious violations', async ({ page }) => {
    await goto(page, '/')
    const results = await runAxe(page)
    const blocking = critical(results.violations)
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })

  test('roadmap: no critical / serious violations', async ({ page }) => {
    await goto(page, '/?route=roadmap')
    const results = await runAxe(page)
    const blocking = critical(results.violations)
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })

  test('profile: no critical / serious violations', async ({ page }) => {
    await goto(page, '/?route=profile')
    const results = await runAxe(page)
    const blocking = critical(results.violations)
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
})
