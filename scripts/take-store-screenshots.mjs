#!/usr/bin/env node
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const ROOT = process.env.LOGIC_URL ?? 'https://logic-u5wn.onrender.com'
const OUT_DIR = 'docs/screenshots'

// Pixel 7 風: 1080x2400 = 360x800 * dsf 3
const VIEWPORT = { width: 360, height: 800 }
const DSF = 3

const SCREENS = [
  { name: '01_home', tab: 0, label: 'ホーム' },
  { name: '02_lessons', tab: 1, label: 'レッスン' },
  { name: '03_ranking', tab: 2, label: 'ランキング' },
  { name: '04_profile', tab: 3, label: 'プロフィール' },
]

await mkdir(OUT_DIR, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: DSF,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
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

console.log(`▶ Navigating to ${ROOT}`)
await page.goto(ROOT, { waitUntil: 'domcontentloaded', timeout: 60000 })

// Render が cold start なら最大1分待つ
try {
  await page.waitForSelector('.app-shell', { timeout: 60000 })
} catch (e) {
  console.error('app-shell not found, dumping HTML...')
  console.error(await page.content().then(s => s.slice(0, 1000)))
  await browser.close()
  process.exit(1)
}

// Tutorial overlay 残ってたら閉じる（fallback）
const tutorial = page.locator('button[aria-label="チュートリアルを閉じる"]')
if (await tutorial.isVisible({ timeout: 1500 }).catch(() => false)) {
  await tutorial.click()
  await page.waitForTimeout(500)
}

for (const s of SCREENS) {
  await page.locator('.tabbar .tab').nth(s.tab).click()
  await page.waitForTimeout(2200)
  const path = `${OUT_DIR}/${s.name}.png`
  await page.screenshot({ path, fullPage: false })
  console.log(`✓ ${s.label} → ${path}`)
}

// 5枚目: ランキングタブの上の方（スクロール戻して撮影）でも 03 と同じになるので、
// home に戻って "今日のチャレンジ" カード周辺を撮影
await page.locator('.tabbar .tab').nth(0).click()
await page.waitForTimeout(1500)
// 少しスクロールして別の構成を撮る
await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
await page.waitForTimeout(800)
const path5 = `${OUT_DIR}/05_home_features.png`
await page.screenshot({ path: path5, fullPage: false })
console.log(`✓ ホーム (機能アピール) → ${path5}`)

await browser.close()
console.log('\n✅ All screenshots done')
