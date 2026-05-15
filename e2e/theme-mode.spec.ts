import { test, expect } from '@playwright/test'

// Phase 1 visual check: capture dark (default) and light mode renderings of
// the home screen. Not a regression test — just produces screenshots for review.
test.describe('theme mode visual capture', () => {
  test('dark mode home (default)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const mode = await page.evaluate(() => document.documentElement.className)
    expect(mode).toContain('mode-dark')
    await page.screenshot({ path: 'e2e/screenshots/home-dark.png', fullPage: true })
  })

  test('light mode home (after toggle)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Set theme directly via localStorage + reload to bypass needing UI nav.
    await page.evaluate(() => {
      localStorage.setItem('logic-theme', JSON.stringify({ mode: 'light', accent: 'orange', customHex: '#D4915A' }))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    const mode = await page.evaluate(() => document.documentElement.className)
    expect(mode).toContain('mode-light')
    await page.screenshot({ path: 'e2e/screenshots/home-light.png', fullPage: true })
  })

  test('settings screen — dark', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => {
      localStorage.setItem('logic-theme', JSON.stringify({ mode: 'dark', accent: 'orange', customHex: '#D4915A' }))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    // Try clicking a tab/button labeled like settings or profile if present.
    const settings = page.getByRole('button', { name: /設定|Settings/ }).first()
    if (await settings.count()) {
      await settings.click().catch(() => {})
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: 'e2e/screenshots/settings-dark.png', fullPage: true })
  })

  test('settings screen — light', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => {
      localStorage.setItem('logic-theme', JSON.stringify({ mode: 'light', accent: 'orange', customHex: '#D4915A' }))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    const settings = page.getByRole('button', { name: /設定|Settings/ }).first()
    if (await settings.count()) {
      await settings.click().catch(() => {})
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: 'e2e/screenshots/settings-light.png', fullPage: true })
  })
})
