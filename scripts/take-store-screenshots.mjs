#!/usr/bin/env node
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const ROOT = process.env.LOGIC_URL ?? 'https://logic-u5wn.onrender.com'
const OUT_DIR = 'docs/screenshots'

// Play Console 要件:
//  Phone:     320-3840px, max ratio 1:2.5
//  Tablet 7":  320-3840px, ratio 9:16 or 16:9
//  Tablet 10": 1080-7680px, ratio 9:16 or 16:9
const DEVICES = [
  {
    // 狭い viewport で本来のスマホレイアウト、DSF 3 で 1080x1920 にスケール
    key: 'phone',
    label: 'Phone (mobile layout)',
    viewport: { width: 360, height: 640 },
    dsf: 3, // → 1080x1920 ぴったり 9:16
    isMobile: true,
  },
  {
    // 540 幅でも Logic は max-width 制限でモバイル風レイアウト維持
    key: 'tablet7',
    label: '7-inch Tablet',
    viewport: { width: 540, height: 960 },
    dsf: 2, // → 1080x1920 ぴったり 9:16
    isMobile: true,
  },
  {
    // タブレット用は 720 幅、isMobile false で sidebar 出る可能性
    key: 'tablet10',
    label: '10-inch Tablet',
    viewport: { width: 810, height: 1440 },
    dsf: 2, // → 1620x2880 ぴったり 9:16
    isMobile: false,
  },
]

const SCREENS = [
  { name: '01_home', tab: 0, label: 'ホーム' },
  { name: '02_lessons', tab: 1, label: 'レッスン' },
  { name: '03_ranking', tab: 2, label: 'ランキング' },
  { name: '04_profile', tab: 3, label: 'プロフィール' },
]

await mkdir(OUT_DIR, { recursive: true })

const browser = await chromium.launch()

for (const dev of DEVICES) {
  console.log(`\n━━━ ${dev.label} (${dev.viewport.width * dev.dsf}x${dev.viewport.height * dev.dsf}) ━━━`)

  const ctx = await browser.newContext({
    viewport: dev.viewport,
    deviceScaleFactor: dev.dsf,
    isMobile: dev.isMobile,
    hasTouch: dev.isMobile,
    userAgent: dev.isMobile
      ? 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      : 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await ctx.newPage()

  await page.addInitScript(() => {
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-install-id', 'rin-screenshot')
    localStorage.setItem('logic-tutorial-home-done', '1')
    localStorage.setItem('logic-tutorial-daily-done', '1')
    localStorage.setItem('logic-tutorial-lesson-done', '1')
    localStorage.setItem('logic-tutorial-placement-dismissed', '1')
    localStorage.setItem('logic-tutorial-fab-dismissed', '1')
    localStorage.removeItem('logic-v3-preview')
  })

  await page.goto(ROOT, { waitUntil: 'domcontentloaded', timeout: 60000 })

  try {
    await page.waitForSelector('.app-shell', { timeout: 60000 })
  } catch (e) {
    console.error('app-shell not found')
    await ctx.close()
    continue
  }

  const tutorial = page.locator('button[aria-label="チュートリアルを閉じる"]')
  if (await tutorial.isVisible({ timeout: 1500 }).catch(() => false)) {
    await tutorial.click()
    await page.waitForTimeout(500)
  }

  for (const s of SCREENS) {
    await page.locator('.tabbar .tab').nth(s.tab).click()
    await page.waitForTimeout(2200)
    const path = `${OUT_DIR}/${dev.key}_${s.name}.png`
    await page.screenshot({ path, fullPage: false })
    console.log(`  ✓ ${s.label} → ${path}`)
  }

  await ctx.close()
}

await browser.close()
console.log('\n✅ All screenshots done')
