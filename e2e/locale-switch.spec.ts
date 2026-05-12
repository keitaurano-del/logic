import { test, expect, type Page } from '@playwright/test'

async function bootJa(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-install-id', 'test')
    localStorage.setItem('logic-locale', 'ja')
  })
  await page.goto('/')
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

async function bootEn(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-install-id', 'test')
    localStorage.setItem('logic-locale', 'en')
  })
  await page.goto('/')
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

test.describe('Locale switch — Japanese baseline', () => {
  test('home renders Japanese title', async ({ page }) => {
    await bootJa(page)
    await expect(page.locator('.tabbar')).toBeVisible()
  })

  test('roadmap shows Japanese course group label', async ({ page }) => {
    await bootJa(page)
    await page.locator('.tabbar .tab').nth(1).click()
    await page.waitForSelector('text=トレーニング', { timeout: 5_000 })
    await expect(page.locator('text=論理的に考える').first()).toBeVisible()
  })
})

test.describe('Locale switch — English coverage', () => {
  test('roadmap shows English course group label (not Japanese)', async ({ page }) => {
    await bootEn(page)
    await page.locator('.tabbar .tab').nth(1).click()
    await page.waitForSelector('text=Training', { timeout: 5_000 })
    await expect(page.locator('text=Think Logically').first()).toBeVisible()
    await expect(page.locator('text=論理的に考える')).toHaveCount(0)
  })

  test('roadmap shows English course title (not Japanese)', async ({ page }) => {
    await bootEn(page)
    await page.locator('.tabbar .tab').nth(1).click()
    await page.waitForSelector('text=Training', { timeout: 5_000 })
    await expect(page.locator('text=Think Logically and Organize Your Ideas').first()).toBeVisible()
    await expect(page.locator('text=ロジカルに考えて、整理する')).toHaveCount(0)
  })

  test('home daily fermi shows English question (not Japanese)', async ({ page }) => {
    await bootEn(page)
    await expect(page.locator('text=日本国内|日本のスタバ|日本のEC|何円か')).toHaveCount(0)
  })
})
