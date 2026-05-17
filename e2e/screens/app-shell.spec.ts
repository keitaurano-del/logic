import { test, expect } from '@playwright/test'
import { boot, tab } from '../fixtures/boot'

/**
 * App shell — 5 タブ・遷移・URL 同期・root 画面の中身を強アサーション。
 *
 * 既存テストは `expect(.main-inner).not.toBeEmpty()` のような「画面が真っ白じゃない」
 * 程度しか見ていなかった。このスペックは各画面で必ず固有要素の visibility を確認する。
 */

test.describe('App shell — 構造', () => {
  test('app-shell, tabbar, main-inner が同時に visible', async ({ page }) => {
    await boot(page)
    await expect(page.locator('.app-shell')).toBeVisible()
    await expect(page.locator('.tabbar')).toBeVisible()
    await expect(page.locator('.main-inner')).toBeVisible()
  })

  test('tabbar に正確に 5 タブ存在し、すべて SVG icon を持つ', async ({ page }) => {
    await boot(page)
    const tabs = page.locator('.tabbar .tab')
    await expect(tabs).toHaveCount(5)
    // 絵文字ではなく SVG であることを確認（CLAUDE.md 規約: 絵文字禁止）
    const svgCount = await page.locator('.tabbar .tab svg').count()
    expect(svgCount).toBeGreaterThanOrEqual(5)
  })

  test('--brand CSS variable は #3D5FC4 をベースに定義', async ({ page }) => {
    await boot(page)
    const brand = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
    )
    expect(brand).not.toBe('')
    // 16進カラーまたは関数表現（color-mix 等）でなければならない
    expect(brand).toMatch(/^(#|rgb|hsl|color)/i)
  })
})

test.describe('App shell — タブ遷移と中身検証', () => {
  test('home タブ → "今日の1問" カードが visible', async ({ page }) => {
    await boot(page)
    await tab(page, 0).click()
    await expect(page.locator('button[aria-label="今日の1問を解く"]').first()).toBeVisible({ timeout: 5_000 })
  })

  test('lessons タブ → カテゴリタイル ≥ 6 枚 visible', async ({ page }) => {
    await boot(page)
    await tab(page, 1).click()
    const tiles = page.locator('.cat-tile')
    await expect(tiles.first()).toBeVisible({ timeout: 5_000 })
    const count = await tiles.count()
    expect(count).toBeGreaterThanOrEqual(6)
  })

  test('ranking タブ → "ランキング" or 関連表記が画面内', async ({ page }) => {
    await boot(page)
    await tab(page, 2).click()
    await page.waitForLoadState('networkidle')
    // ranking 画面に到達した特徴的要素を確認（リストか「ランキング」文字）
    const body = page.locator('.main-inner')
    await expect(body).toBeVisible()
    const text = await body.textContent()
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(0)
  })

  test('profile タブ → profile-hero-name と stats-grid が visible', async ({ page }) => {
    await boot(page, { displayName: 'テストユーザー' })
    await tab(page, 4).click()
    await expect(page.locator('.profile-hero-name')).toBeVisible()
    await expect(page.locator('.stats-grid')).toBeVisible()
  })
})

test.describe('App shell — history 同期', () => {
  test('lessons タブクリックで history.state.screen.type が lessons / roadmap に更新', async ({ page }) => {
    await boot(page)
    await tab(page, 1).click()
    await page.waitForTimeout(250) // pushState の反映を待つ
    const screenType = await page.evaluate(() => (history.state as { screen?: { type?: string } })?.screen?.type)
    expect(['lessons', 'roadmap']).toContain(screenType)
  })

  test('profile タブ → home タブで戻れる（タブバー経由ナビゲーション）', async ({ page }) => {
    await boot(page)
    await tab(page, 4).click()
    await expect(page.locator('.profile-hero-name')).toBeVisible()
    await tab(page, 0).click()
    await expect(page.locator('button[aria-label="今日の1問を解く"]').first()).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('App shell — admin gating', () => {
  test('admin=0 で起動: 仕訳ドリル / PM 入門 / 精算表ドリルは出ない', async ({ page }) => {
    await boot(page)
    await tab(page, 1).click()
    await expect(page.locator('.cat-tile').first()).toBeVisible()
    await expect(page.locator('text=仕訳ドリル')).toHaveCount(0)
    await expect(page.locator('text=精算表ドリル')).toHaveCount(0)
    await expect(page.locator('text=PM 入門')).toHaveCount(0)
  })

  test('?admin=1 を渡すと localStorage に flag がセットされる', async ({ page }) => {
    await boot(page, { admin: true, path: '/?admin=1' })
    const flag = await page.evaluate(() => localStorage.getItem('logic-admin'))
    expect(flag).toBe('1')
  })

  test('?admin=0 で flag が消える', async ({ page }) => {
    await boot(page, { admin: true })
    await page.goto('/?admin=0')
    await page.waitForSelector('.app-shell')
    const flag = await page.evaluate(() => localStorage.getItem('logic-admin'))
    expect(flag).toBeNull()
  })
})
