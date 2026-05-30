/**
 * DF-F2 文字サイズ設定 回帰検証 (2026-05-30)
 *
 * 確認すること:
 *  (1) 標準(standard)時に root(html) font-size が 15px = 既存基準と等価（非破壊）
 *  (2) 大(large)=17.25px / 特大(xlarge)=19.5px に root font-size が動く
 *  (3) 本文テキスト要素の computed font-size が 標準比で 大=1.15倍 / 特大=1.3倍 に
 *      一律スケールする（= inline の rem 化 + tokens の rem 化が効いている証拠）
 *  (4) 全テーマ × 全サイズ × 主要画面で横方向のはみ出し（scrollWidth > clientWidth）が出ない
 *
 * 実行: node node_modules/.bin/playwright test dff2-font-scale --project=chromium
 */
import { test, expect, Page } from '@playwright/test'

const BASE = process.env.PW_BASE_URL ?? 'http://localhost:4173'

type Size = 'standard' | 'large' | 'xlarge'
const EXPECTED_ROOT_PX: Record<Size, number> = {
  standard: 15,
  large: 15 * 1.15, // 17.25
  xlarge: 15 * 1.3, // 19.5
}
const THEMES = ['light', 'dark', 'green', 'purple'] as const
const SCREENS = ['home', 'lessons', 'fermi', 'pricing', 'appearance', 'journal', 'profile'] as const

async function seed(page: Page, theme: string, size: Size) {
  await page.addInitScript(
    (o) => {
      localStorage.clear()
      localStorage.setItem('logic-v3-preview', '1')
      localStorage.setItem('logic-onboarded', '1')
      localStorage.setItem('logic-install-id', `install-${Date.now()}-dff2`)
      localStorage.setItem('logic-theme', o.theme)
      localStorage.setItem('logic-font-scale', o.size)
      localStorage.setItem('logic-placement', JSON.stringify({ totalCount: 0 }))
    },
    { theme, size },
  )
}

async function rootFontPx(page: Page): Promise<number> {
  return page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
}

// 画面内の可視テキスト要素群の平均 computed font-size（px）を採る。
async function avgTextPx(page: Page): Promise<number> {
  return page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('h1,h2,h3,p,span,button,a,li,div'))
      .filter((el) => {
        const e = el as HTMLElement
        const txt = (e.textContent ?? '').trim()
        if (!txt || txt.length > 200) return false
        // 直接の text node を持つ要素のみ（入れ子の合計を二重計上しない）
        const hasOwnText = Array.from(e.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0,
        )
        if (!hasOwnText) return false
        const r = e.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })
      .slice(0, 80) as HTMLElement[]
    if (els.length === 0) return 0
    const sum = els.reduce((a, e) => a + parseFloat(getComputedStyle(e).fontSize), 0)
    return sum / els.length
  })
}

async function overflowPx(page: Page): Promise<number> {
  return page.evaluate(() => {
    const d = document.documentElement
    return d.scrollWidth - d.clientWidth
  })
}

async function open(page: Page, screen: string) {
  await page.goto(`${BASE}/?preview=${screen}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(150)
}

test.describe('DF-F2 root font-size scaling', () => {
  for (const size of ['standard', 'large', 'xlarge'] as Size[]) {
    test(`root font-size = ${EXPECTED_ROOT_PX[size]}px for ${size}`, async ({ page }) => {
      await seed(page, 'light', size)
      await open(page, 'home')
      const px = await rootFontPx(page)
      expect(px).toBeCloseTo(EXPECTED_ROOT_PX[size], 1)
    })
  }
})

test.describe('DF-F2 body text scales proportionally', () => {
  for (const screen of SCREENS) {
    test(`text scales standard->large->xlarge on ${screen}`, async ({ page }) => {
      // standard 基準
      await seed(page, 'light', 'standard')
      await open(page, screen)
      const base = await avgTextPx(page)
      expect(base).toBeGreaterThan(0)

      await seed(page, 'light', 'large')
      await open(page, screen)
      const large = await avgTextPx(page)

      await seed(page, 'light', 'xlarge')
      await open(page, screen)
      const xlarge = await avgTextPx(page)

      // 平均文字サイズが root スケール比どおりに拡大していること（誤差5%以内）
      expect(large / base).toBeGreaterThan(1.15 * 0.95)
      expect(large / base).toBeLessThan(1.15 * 1.05)
      expect(xlarge / base).toBeGreaterThan(1.3 * 0.95)
      expect(xlarge / base).toBeLessThan(1.3 * 1.05)
    })
  }
})

test.describe('DF-F2 no horizontal overflow across themes x sizes', () => {
  for (const theme of THEMES) {
    for (const size of ['standard', 'large', 'xlarge'] as Size[]) {
      for (const screen of SCREENS) {
        test(`${theme} / ${size} / ${screen} has no x-overflow`, async ({ page }) => {
          await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12/13/14 相当
          await seed(page, theme, size)
          await open(page, screen)
          const overflow = await overflowPx(page)
          // 1px のサブピクセル丸めは許容
          expect(overflow, `${theme}/${size}/${screen} x-overflow ${overflow}px`).toBeLessThanOrEqual(1)
        })
      }
    }
  }
})
