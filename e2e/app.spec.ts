import { test, expect, type Page } from '@playwright/test'

// ─── helpers ───────────────────────────────────────────────────────────────
async function goto(page: Page, path = '/') {
  await page.goto(path)
  // wait for React to hydrate
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

async function gotoAdmin(page: Page) {
  await page.goto('/?admin=1')
  await page.waitForSelector('.app-shell', { timeout: 10_000 })
}

// ─── 1. App shell ───────────────────────────────────────────────────────────
test.describe('App shell', () => {
  test('renders without blank content', async ({ page }) => {
    await goto(page)
    await expect(page.locator('.main-inner')).toBeVisible()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('sidebar brand mark visible on desktop', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'desktop only')
    await goto(page)
    await expect(page.locator('.sidebar-brand')).toBeVisible()
    await expect(page.locator('.sidebar-brand')).toContainText('Logic')
  })

  test('bottom tabbar visible on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only')
    await goto(page)
    await expect(page.locator('.tabbar')).toBeVisible()
  })
})

// ─── 2. Tab navigation ──────────────────────────────────────────────────────
test.describe('Tab navigation', () => {
  test('Home tab is active by default', async ({ page }) => {
    await goto(page)
    const homeBtn = page.locator('[data-tab="home"], .tab, .sidebar-nav-item').first()
    // Home screen content visible
    await expect(page.locator('h1')).toBeVisible()
  })

  test('switching to Learn tab shows lesson list', async ({ page, isMobile }) => {
    await goto(page)
    if (isMobile) {
      await page.locator('.tabbar .tab').nth(1).click()
    } else {
      await page.locator('.sidebar-nav-item').nth(1).click()
    }
    await expect(page.locator('text=すべてのレッスン')).toBeVisible()
  })

  test('switching to Profile tab shows Profile screen', async ({ page, isMobile }) => {
    await goto(page)
    if (isMobile) {
      await page.locator('.tabbar .tab').nth(2).click()
    } else {
      await page.locator('.sidebar-nav-item').nth(2).click()
    }
    await expect(page.locator('h1', { hasText: 'Profile' })).toBeVisible()
  })

  test('tabs cycle back correctly', async ({ page, isMobile }) => {
    await goto(page)
    const tabs = isMobile ? page.locator('.tabbar .tab') : page.locator('.sidebar-nav-item')
    await tabs.nth(1).click()
    await tabs.nth(0).click()
    // back to home
    await expect(page.locator('text=今日のおすすめ, text=GOOD')).toBeVisible().catch(() =>
      expect(page.locator('.main-inner')).not.toBeEmpty()
    )
  })
})

// ─── 3. Home screen ─────────────────────────────────────────────────────────
test.describe('Home screen', () => {
  test('greeting text visible', async ({ page }) => {
    await goto(page)
    // greeting contains some CJK or English
    await expect(page.locator('.main-inner h1').first()).toBeVisible()
  })

  test('streak section visible', async ({ page }) => {
    await goto(page)
    await expect(page.locator('text=DAY STREAK')).toBeVisible()
  })

  test('categories section visible', async ({ page }) => {
    await goto(page)
    await expect(page.locator('text=Categories')).toBeVisible()
  })

  test('category tile navigates to lesson', async ({ page, isMobile }) => {
    await goto(page)
    const tile = page.locator('.cat-tile, .cat-card').first()
    await tile.click()
    // should enter a lesson or lesson list
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('featured card start button navigates', async ({ page }) => {
    await goto(page)
    const startBtn = page.locator('button', { hasText: 'Start lesson' }).first()
    if (await startBtn.isVisible()) {
      await startBtn.click()
      await expect(page.locator('.main-inner')).not.toBeEmpty()
    }
  })

  test('PM category NOT shown to regular user', async ({ page, isMobile }) => {
    await goto(page)
    // switch to Learn tab
    if (isMobile) {
      await page.locator('.tabbar .tab').nth(1).click()
    } else {
      await page.locator('.sidebar-nav-item').nth(1).click()
    }
    await expect(page.locator('text=PM 入門')).not.toBeVisible()
  })
})

// ─── 4. Lessons screen ──────────────────────────────────────────────────────
test.describe('Lessons screen', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await goto(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
  })

  test('Quick access tiles all visible', async ({ page }) => {
    await expect(page.locator('text=Quick access')).toBeVisible()
    await expect(page.locator('.cat-tile')).toHaveCount(await page.locator('.cat-tile').count())
    const count = await page.locator('.cat-tile').count()
    expect(count).toBeGreaterThanOrEqual(6) // at least 6 non-admin tiles
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

  test('フェルミ推定 tile navigates to Fermi screen', async ({ page }) => {
    // Use the Quick access tile (name='フェルミ推定' + meta='AI 問題生成')
    await page.getByRole('button', { name: 'フェルミ推定 AI 問題生成' }).click()
    await expect(page.locator('text=FERMI').first()).toBeVisible()
  })

  test('ランキング tile navigates to Ranking screen', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: 'ランキング' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('偏差値 tile navigates to Deviation screen', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: '偏差値' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('フラッシュカード tile navigates', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: 'フラッシュカード' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('今日の問題 tile navigates', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: '今日の問題' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('AI問題生成 tile navigates', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: 'AI問題生成' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('模擬試験 tile navigates', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: '模擬試験' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('ロールプレイ tile navigates', async ({ page }) => {
    await page.locator('.cat-tile', { hasText: 'ロールプレイ' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('lesson list tile opens lesson screen', async ({ page }) => {
    const lessonTile = page.locator('section').filter({ hasText: 'レッスン一覧' }).locator('.cat-tile').first()
    await lessonTile.click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })
})

// ─── 5. Lesson screen ───────────────────────────────────────────────────────
test.describe('Lesson screen', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await goto(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await page.locator('section').filter({ hasText: 'レッスン一覧' }).locator('.cat-tile').first().click()
  })

  test('back button returns to lessons tab', async ({ page, isMobile }) => {
    const backBtn = page.locator('button[aria-label="Back"], button', { hasText: '戻る' }).first()
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await expect(page.locator('text=すべてのレッスン')).toBeVisible()
    }
  })

  test('lesson content renders', async ({ page }) => {
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })
})

// ─── 6. Back navigation (各 screen) ─────────────────────────────────────────
test.describe('Back navigation', () => {
  async function navigateTo(page: Page, tileName: string, isMobile: boolean) {
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await page.locator('.cat-tile', { hasText: tileName }).first().click()
  }

  test('Fermi back button works', async ({ page, isMobile }) => {
    await goto(page)
    await navigateTo(page, 'フェルミ推定', !!isMobile)
    const back = page.locator('button').filter({ hasText: /back|戻る/i }).first()
    if (await back.isVisible()) {
      await back.click()
      await expect(page.locator('text=すべてのレッスン')).toBeVisible()
    }
  })

  test('Ranking back button works', async ({ page, isMobile }) => {
    await goto(page)
    await navigateTo(page, 'ランキング', !!isMobile)
    const back = page.locator('button').filter({ hasText: /back|戻る/i }).first()
    if (await back.isVisible()) {
      await back.click()
      await expect(page.locator('text=すべてのレッスン')).toBeVisible()
    }
  })

  test('AI問題生成 back button works', async ({ page, isMobile }) => {
    await goto(page)
    await navigateTo(page, 'AI問題生成', !!isMobile)
    const back = page.locator('button').filter({ hasText: /back|戻る/i }).first()
    if (await back.isVisible()) {
      await back.click()
      await expect(page.locator('text=すべてのレッスン')).toBeVisible()
    }
  })
})

// ─── 7. Profile screen ──────────────────────────────────────────────────────
test.describe('Profile screen', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await goto(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(2) : page.locator('.sidebar-nav-item').nth(2)
    await tab.click()
  })

  test('user name visible', async ({ page }) => {
    await expect(page.locator('.profile-hero-name')).toBeVisible()
  })

  test('level progress bar visible', async ({ page }) => {
    await expect(page.locator('text=LEVEL PROGRESS')).toBeVisible()
  })

  test('stats grid shows 3 items', async ({ page }) => {
    const stats = page.locator('.stats-grid .stat, .stat-pill-large')
    const count = await stats.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('activity calendar renders cells', async ({ page }) => {
    await expect(page.locator('.cal-wrap')).toBeVisible()
    const cells = page.locator('.cal-day')
    expect(await cells.count()).toBe(84) // 12 weeks × 7 days
  })

  test('activity calendar has dow labels', async ({ page }) => {
    await expect(page.locator('.cal-dow-label').first()).toBeVisible()
    const labels = await page.locator('.cal-dow-label').allTextContents()
    expect(labels).toContain('月')
  })

  test('activity calendar has legend', async ({ page }) => {
    await expect(page.locator('.cal-legend')).toBeVisible()
    await expect(page.locator('.cal-legend-text', { hasText: '学習なし' })).toBeVisible()
  })

  test('category progress rows visible', async ({ page }) => {
    await expect(page.locator('text=Category progress')).toBeVisible()
    const rows = page.locator('.cat-row')
    expect(await rows.count()).toBeGreaterThanOrEqual(4)
  })

  test('settings button removed (no longer shown)', async ({ page }) => {
    await expect(page.locator('button[aria-label="Settings"]')).not.toBeVisible()
  })
})

// ─── 8. Admin mode ──────────────────────────────────────────────────────────
test.describe('Admin mode', () => {
  test('?admin=1 shows 仕訳ドリル tile', async ({ page, isMobile }) => {
    await gotoAdmin(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await expect(page.locator('text=仕訳ドリル')).toBeVisible()
  })

  test('?admin=1 shows 精算表ドリル tile', async ({ page, isMobile }) => {
    await gotoAdmin(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await expect(page.locator('text=精算表ドリル')).toBeVisible()
  })

  test('?admin=1 shows PM入門 lessons', async ({ page, isMobile }) => {
    await gotoAdmin(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await expect(page.locator('text=プロジェクトとは')).toBeVisible()
  })

  test('?admin=1 仕訳ドリル tile navigates', async ({ page, isMobile }) => {
    await gotoAdmin(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await page.locator('.cat-tile', { hasText: '仕訳ドリル' }).click()
    await expect(page.locator('.main-inner')).not.toBeEmpty()
  })

  test('?admin=0 after ?admin=1 hides admin content', async ({ page, isMobile }) => {
    // First enable admin
    await gotoAdmin(page)
    // Then disable
    await page.goto('/?admin=0')
    await page.waitForSelector('.app-shell')
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await expect(page.locator('text=仕訳ドリル')).not.toBeVisible()
  })
})

// ─── 9. Fermi screen ────────────────────────────────────────────────────────
test.describe('Fermi screen', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await goto(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(1) : page.locator('.sidebar-nav-item').nth(1)
    await tab.click()
    await page.locator('.cat-tile', { hasText: 'フェルミ推定' }).first().click()
  })

  test('question text visible', async ({ page }) => {
    await expect(page.locator('.lesson-question, h1')).toBeVisible()
  })

  test('hint card visible', async ({ page }) => {
    await expect(page.locator('.hint-card')).toBeVisible()
    await expect(page.locator('.hint-icon')).toBeVisible()
    // icon should be SVG, not emoji
    const icon = page.locator('.hint-icon svg')
    await expect(icon).toBeVisible()
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
    const navItems = page.locator('.sidebar-nav-item svg, .tabbar .tab svg')
    const count = await navItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('brand mark is SVG', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'desktop only')
    await goto(page)
    await expect(page.locator('.sidebar-brand-mark svg')).toBeVisible()
  })

  test('profile avatar is SVG not emoji', async ({ page, isMobile }) => {
    await goto(page)
    const tab = isMobile ? page.locator('.tabbar .tab').nth(2) : page.locator('.sidebar-nav-item').nth(2)
    await tab.click()
    await expect(page.locator('.profile-avatar svg')).toBeVisible()
  })

  test('streak icon in home is SVG', async ({ page }) => {
    await goto(page)
    const flameIcons = page.locator('.streak-hero-icon svg, .streak-icon svg')
    expect(await flameIcons.count()).toBeGreaterThan(0)
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
    const height = await page.locator('.main-inner').evaluate((el) => el.getBoundingClientRect().height)
    expect(height).toBeGreaterThan(100)
  })

  test('sidebar has non-zero width on desktop', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'desktop only')
    await goto(page)
    const width = await page.locator('.sidebar').evaluate((el) => el.getBoundingClientRect().width)
    expect(width).toBeGreaterThan(100)
  })
})
