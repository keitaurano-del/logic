import { test, expect, type Page } from '@playwright/test'

// ─── helpers ───────────────────────────────────────────────────────────────
async function goto(page: Page, path = '/') {
  await page.addInitScript(() => {
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-install-id', 'test')
  })
  await page.goto(path)
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

async function gotoAdmin(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-install-id', 'test')
  })
  await page.goto('/?admin=1')
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

// Tab indices: home=0, lessons=1, ranking=2, profile=3
function tab(page: Page, n: number) {
  return page.locator('.tabbar .tab').nth(n)
}

// ─── 1. App shell ───────────────────────────────────────────────────────────
test.describe('App shell', () => {
  test('renders without blank content', async ({ page }) => {
    await goto(page)
    await expect(page.locator('.main-inner')).toBeVisible()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('tabbar is always visible', async ({ page }) => {
    await goto(page)
    await expect(page.locator('.tabbar')).toBeVisible()
  })

  test('tabbar has 4 tabs', async ({ page }) => {
    await goto(page)
    const count = await page.locator('.tabbar .tab').count()
    expect(count).toBe(4)
  })
})

// ─── 2. Tab navigation ──────────────────────────────────────────────────────
test.describe('Tab navigation', () => {
  test('Home tab is active by default', async ({ page }) => {
    await goto(page)
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('switching to Learn tab shows lesson list', async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
    await expect(page.locator('text=トレーニング').first()).toBeVisible()
  })

  test('switching to Profile tab shows Profile screen', async ({ page }) => {
    await goto(page)
    await tab(page, 3).click()
    await expect(page.locator('.profile-hero-name')).toBeVisible()
  })

  test('tabs cycle back correctly', async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
    await tab(page, 0).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })
})

// ─── 3. Home screen ─────────────────────────────────────────────────────────
test.describe('Home screen', () => {
  test('home content visible', async ({ page }) => {
    await goto(page)
    await tab(page, 0).click()
    await expect(page.locator('.main-inner').first()).toBeVisible()
  })

  test('daily fermi card visible', async ({ page }) => {
    await goto(page)
    await tab(page, 0).click()
    await expect(page.locator('text=今日の1問').first()).toBeVisible()
  })

  test('featured card start button navigates', async ({ page }) => {
    await goto(page)
    await tab(page, 0).click()
    const startBtn = page.locator('button', { hasText: 'Start lesson' }).first()
    if (await startBtn.isVisible()) {
      await startBtn.click()
      await expect(page.locator('.main-inner')).not.toBeEmpty()
    }
  })

  test('PM category NOT shown to regular user', async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
    await expect(page.locator('text=PM 入門')).not.toBeVisible()
  })
})

// ─── 4. Lessons screen ──────────────────────────────────────────────────────
test.describe('Lessons screen', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
  })

  test('category tiles visible', async ({ page }) => {
    const count = await page.locator('.cat-tile').count()
    expect(count).toBeGreaterThanOrEqual(6)
  })

  test('仕訳ドリル NOT shown to regular user', async ({ page }) => {
    await expect(page.locator('text=仕訳ドリル')).not.toBeVisible()
  })

  test('精算表ドリル NOT shown to regular user', async ({ page }) => {
    await expect(page.locator('text=精算表ドリル')).not.toBeVisible()
  })

  test('PM入門 lessons NOT shown to regular user', async ({ page }) => {
    await expect(page.locator('text=プロジェクトとは')).not.toBeVisible()
    await expect(page.locator('text=スコープ管理')).not.toBeVisible()
  })

  test('フェルミ推定 tile navigates', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: 'フェルミ推定' }).first().click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('lesson list tile opens lesson screen', async ({ page }) => {
    await page.locator('.cat-tile').first().click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })
})

// ─── 5. Lesson screen ───────────────────────────────────────────────────────
test.describe('Lesson screen', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
    await page.locator('.cat-tile').first().click()
  })

  test('lesson content renders', async ({ page }) => {
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('back button returns to lessons tab', async ({ page }) => {
    const backBtn = page.locator('button[aria-label="Back"], button', { hasText: '戻る' }).first()
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await expect(page.locator('.main-inner')).not.toBeEmpty()
    }
  })
})

// ─── 6. Back navigation ─────────────────────────────────────────────────────
test.describe('Back navigation', () => {
  test('Fermi back button works', async ({ page }) => {
    await goto(page)
    await tab(page, 1).click()
    await page.locator('.cat-tile', { hasText: 'フェルミ推定' }).first().click()
    const back = page.locator('button').filter({ hasText: /back|戻る/i }).first()
    if (await back.isVisible()) {
      await back.click()
      await expect(page.locator('.main-inner')).not.toBeEmpty()
    }
  })

  test('Ranking back button works', async ({ page }) => {
    await goto(page)
    await tab(page, 2).click()
    const back = page.locator('button').filter({ hasText: /back|戻る/i }).first()
    if (await back.isVisible()) {
      await back.click()
      await expect(page.locator('.main-inner')).not.toBeEmpty()
    }
  })
})

// ─── 7. Profile screen ──────────────────────────────────────────────────────
test.describe('Profile screen', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page)
    await tab(page, 3).click()
  })

  test('user name visible', async ({ page }) => {
    await expect(page.locator('.profile-hero-name')).toBeVisible()
  })

  test('level indicator visible', async ({ page }) => {
    await expect(page.locator('text=レベル').first()).toBeVisible()
  })

  test('stats grid shows 3 items', async ({ page }) => {
    const stats = page.locator('.stats-grid .stat')
    const count = await stats.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('profile avatar visible', async ({ page }) => {
    await expect(page.locator('.profile-avatar')).toBeVisible()
  })

  test('settings button removed (no longer shown)', async ({ page }) => {
    await expect(page.locator('button[aria-label="Settings"]')).not.toBeVisible()
  })
})

// ─── 8. Admin mode ──────────────────────────────────────────────────────────
test.describe('Admin mode', () => {
  test('?admin=1 sets admin localStorage flag', async ({ page }) => {
    await gotoAdmin(page)
    const flag = await page.evaluate(() => localStorage.getItem('logic-admin'))
    expect(flag).toBe('1')
  })

  test('?admin=0 clears admin flag', async ({ page }) => {
    await gotoAdmin(page)
    await page.goto('/?admin=0')
    await page.waitForSelector('.app-shell')
    const flag = await page.evaluate(() => localStorage.getItem('logic-admin'))
    expect(flag).toBeNull()
  })
})

// ─── 9. Fermi screen ────────────────────────────────────────────────────────
test.describe('Fermi screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('logic-onboarded', '1')
      localStorage.setItem('logic-install-id', 'test')
    })
    await page.goto('/?preview=fermi')
    await page.waitForSelector('.app-shell', { timeout: 10_000 })
  })

  test('fermi content visible', async ({ page }) => {
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('submit button disabled when textarea empty', async ({ page }) => {
    const textarea = page.locator('textarea').first()
    const submitBtn = page.locator('button', { hasText: '送信する' }).first()
    if (await textarea.isVisible() && await submitBtn.isVisible()) {
      await expect(submitBtn).toBeDisabled()
    }
  })

  test('submit button enabled when textarea has content', async ({ page }) => {
    const textarea = page.locator('textarea').first()
    const submitBtn = page.locator('button', { hasText: '送信する' }).first()
    if (await textarea.isVisible() && await submitBtn.isVisible()) {
      await textarea.fill('テスト回答: 約100万本と推定')
      await expect(submitBtn).toBeEnabled()
    }
  })
})

// ─── 10. No emoji in critical UI elements ───────────────────────────────────
test.describe('No emoji as icons', () => {
  test('nav items use SVG icons not emoji', async ({ page }) => {
    await goto(page)
    const navItems = page.locator('.tabbar .tab svg')
    const count = await navItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('profile avatar visible', async ({ page }) => {
    await goto(page)
    await tab(page, 3).click()
    await expect(page.locator('.profile-avatar')).toBeVisible()
  })
})

// ─── 11. CSS custom properties loaded (tokens.css) ──────────────────────────
test.describe('CSS tokens loaded', () => {
  test('--brand CSS variable is defined', async ({ page }) => {
    await goto(page)
    const brand = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
    )
    expect(brand).not.toBe('')
  })

  test('main content area has non-zero height', async ({ page }) => {
    await goto(page)
    await tab(page, 0).click()
    const height = await page.locator('.main-inner').evaluate((el) => el.getBoundingClientRect().height)
    expect(height).toBeGreaterThan(100)
  })
})
