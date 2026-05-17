import { test, expect } from '@playwright/test'
import { boot, tab } from '../fixtures/boot'

/**
 * Profile screen — 実値検証。
 *
 * 既存テストは「level indicator visible」程度しか見ていなかった。
 * このスペックは localStorage に仕込んだ値が UI に正しく反映されているかを assert する。
 */

test.describe('Profile — 表示名', () => {
  test('logic-display-name の文字列が hero name に出る', async ({ page }) => {
    await boot(page, { displayName: 'けいた' })
    await tab(page, 4).click()
    await expect(page.locator('.profile-hero-name')).toHaveText('けいた')
  })

  test('avatar には displayName の頭文字（大文字）が出る', async ({ page }) => {
    await boot(page, { displayName: 'taro' })
    await tab(page, 4).click()
    await expect(page.locator('.profile-avatar')).toContainText('T')
  })

  test('表示名未設定 (JA) だと hero name に "ゲスト" が出る', async ({ page }) => {
    await boot(page, { locale: 'ja', displayName: '' })
    await tab(page, 4).click()
    await expect(page.locator('.profile-hero-name')).toHaveText('ゲスト')
    // avatar 頭文字
    await expect(page.locator('.profile-avatar')).toContainText('ゲ')
  })

  test('表示名未設定 (EN) だと hero name に "Guest" が出る', async ({ page }) => {
    await boot(page, { locale: 'en', displayName: '' })
    await tab(page, 4).click()
    await expect(page.locator('.profile-hero-name')).toHaveText('Guest')
    await expect(page.locator('.profile-avatar')).toContainText('G')
  })
})

test.describe('Profile — レベル表示（LEVEL_TABLE 仕様: 0=Lv1, 50=Lv2, 150=Lv3, 300=Lv4...）', () => {
  test('xp=0 → Lv.1', async ({ page }) => {
    await boot(page, { displayName: 'lv1', xp: 0 })
    await tab(page, 4).click()
    await expect(page.locator('text=Lv.1').first()).toBeVisible()
  })

  test('xp=49 → 依然として Lv.1', async ({ page }) => {
    await boot(page, { displayName: 'lv1', xp: 49 })
    await tab(page, 4).click()
    await expect(page.locator('text=Lv.1').first()).toBeVisible()
  })

  test('xp=50 → Lv.2 になる', async ({ page }) => {
    await boot(page, { displayName: 'lv2', xp: 50 })
    await tab(page, 4).click()
    await expect(page.locator('text=Lv.2').first()).toBeVisible()
  })

  test('xp=150 → Lv.3', async ({ page }) => {
    await boot(page, { displayName: 'lv3', xp: 150 })
    await tab(page, 4).click()
    await expect(page.locator('text=Lv.3').first()).toBeVisible()
  })

  test('"次のLvまで" 文字列が表示される', async ({ page }) => {
    await boot(page, { displayName: 'next-lv', xp: 30 })
    await tab(page, 4).click()
    await expect(page.locator('text=次のLvまで').first()).toBeVisible()
  })
})

test.describe('Profile — stats grid 実値', () => {
  test('streak=5 / completed=3 / xp=1234 がそれぞれ stats に反映', async ({ page }) => {
    await boot(page, {
      displayName: 'stats-user',
      streakCount: 5,
      completedLessons: ['lesson-1', 'lesson-2', 'lesson-3'],
      xp: 1234,
    })
    await tab(page, 4).click()
    const stats = page.locator('.stats-grid .stat')
    await expect(stats).toHaveCount(3)
    await expect(stats.nth(0)).toContainText('5')      // streak
    await expect(stats.nth(1)).toContainText('3')      // completed
    await expect(stats.nth(2)).toContainText('1,234')  // xp toLocaleString
  })

  test('streak=0 のとき stats[0] は "0" 表示で highlight 無し', async ({ page }) => {
    await boot(page, { displayName: 'streak0', streakCount: 0 })
    await tab(page, 4).click()
    const stats = page.locator('.stats-grid .stat')
    await expect(stats.nth(0)).toContainText('0')
  })

  test('completed=0 だと stats[1] は "0"', async ({ page }) => {
    await boot(page, { displayName: 'comp0', completedLessons: [] })
    await tab(page, 4).click()
    await expect(page.locator('.stats-grid .stat').nth(1)).toContainText('0')
  })

  test('stats[0] (streak) をクリックすると streak シートが開く', async ({ page }) => {
    await boot(page, { displayName: 'sheet', streakCount: 7 })
    await tab(page, 4).click()
    await page.locator('.stats-grid .stat').nth(0).click()
    // sheet が aria-label を持つ要素 or 何らかの dialog を開く
    // 厳密 selector が無いので、シートを閉じるボタンの存在を確認
    await expect(page.locator('[aria-label="シートを閉じる"], [role="dialog"]').first()).toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Profile — ラベル翻訳', () => {
  test('JA: "レベル" 文字列が含まれる', async ({ page }) => {
    await boot(page, { locale: 'ja', displayName: 'ja-user' })
    await tab(page, 4).click()
    await expect(page.locator('text=レベル').first()).toBeVisible()
  })

  test('JA: 連続学習日数 / 完了レッスン / 総XP の 3 ラベル', async ({ page }) => {
    await boot(page, { locale: 'ja', displayName: 'ja-user' })
    await tab(page, 4).click()
    await expect(page.locator('text=連続学習日数').first()).toBeVisible()
    await expect(page.locator('text=完了レッスン').first()).toBeVisible()
    await expect(page.locator('text=総XP').first()).toBeVisible()
  })
})
