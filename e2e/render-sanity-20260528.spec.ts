import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Sanity テスト T-A (2026-05-28) — ローカル dev server (http://localhost:5173/)
 *
 * 目的:
 *   - バグ修正 T-A の happy path 確認。
 *   - ホーム画面 (HomeScreenV3) の「今日の1問」フェルミカードに出る問題文と、
 *     タップ遷移先の Daily Fermi 画面 (DailyFermiScreen) の問題文が一致するか。
 *   - 単一の真実源 getHomeFermiIndex() に集約した修正の回帰確認。
 *
 * 方針:
 *   - guest mode（ログイン不要）。onboarding/tutorial は localStorage でスキップ。
 *   - preview=fermi で直接開かず、必ずホームのカードを実タップして遷移する
 *     （= 実ユーザー導線で検証する）。
 *   - リロード／戻る操作後も一致が維持されるか軽く確認する。
 *   - mutating API には触らない（問題文の表示確認のみ。回答送信はしない）。
 *   - スクショは docs/render-screenshots/sanity/ に保存。
 */

const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'render-screenshots', 'sanity')

test.use({
  viewport: { width: 375, height: 812 },
  userAgent:
    'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
})

test.describe.configure({ mode: 'serial' })

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  })
}

/**
 * ホームに guest mode で押し込む。onboarding / tutorial を localStorage でスキップ。
 * addInitScript はページごとに毎回適用される（reload / 再 goto でも有効）。
 */
async function bootHome(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('logic-install-id', 'sanity-ta-20260528')
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-locale', 'ja')
    localStorage.setItem('logic-tutorial-home-done', '1')
    localStorage.setItem('logic-tutorial-daily-done', '1')
    localStorage.setItem('logic-tutorial-lesson-done', '1')
    localStorage.setItem('logic-tutorial-placement-dismissed', '1')
    localStorage.setItem('logic-tutorial-fab-dismissed', '1')
    localStorage.setItem('logic-tutorial-done-v2', 'true')
    localStorage.setItem('logic-display-name', 'サニティ太郎')
  })
}

/** ホームの「今日の1問」フェルミカードの問題文テキストを取得する。 */
async function readHomeFermiQuestion(page: Page): Promise<string> {
  const card = page.locator('#home-fermi-card')
  await expect(card, 'ホームのフェルミカードが見える').toBeVisible({ timeout: 20_000 })
  // カードの本文ボタンの中、「TODAY ラベル」直下の問題文 div。
  // 構造: <span>今日の1問</span> ... <div>{問題文}</div> ... <span>{更新文}</span>
  // accent-fg の太字 div が問題文。fontSize:19 / fontWeight:700。
  // 安定取得のため、カード内テキストから「今日の1問」「今日の問題に挑戦」等の
  // chrome 文言を除いた最長行を問題文とみなす方式に頼らず、DOM 位置で取る。
  const questionEl = card.locator('div').filter({ hasText: /[？?]/ }).last()
  // フォールバック: ?/？を含む最後の div を問題文とみなす。
  const text = (await questionEl.first().innerText()).trim()
  return text
}

/** Daily Fermi 画面の問題文 <p> テキストを取得する。 */
async function readDailyFermiQuestion(page: Page): Promise<string> {
  // DailyFermiScreen は問題文を <p style="fontSize:20; fontWeight:600"> に出す。
  // ？/? を含む p を問題文とみなす。
  const p = page.locator('p').filter({ hasText: /[？?]/ }).first()
  await expect(p, 'Daily Fermi の問題文 p が見える').toBeVisible({ timeout: 20_000 })
  return (await p.innerText()).trim()
}

/** 全角・半角の表記ゆれと空白を吸収して比較しやすく正規化する。 */
function norm(s: string): string {
  return s.replace(/\s+/g, '').trim()
}

test.describe('T-A: ホーム「今日の1問」と Daily Fermi の問題一致', () => {
  test('A1. ホームのフェルミ問題 = タップ遷移先 Daily Fermi の問題', async ({ page }) => {
    await bootHome(page)
    const res = await page.goto('/?preview=home', { waitUntil: 'domcontentloaded' })
    expect(res?.status() ?? 0, 'HTTP status').toBeGreaterThanOrEqual(200)
    expect(res?.status() ?? 999, 'HTTP status').toBeLessThan(400)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(page.locator('.app-shell'), 'app-shell 表示').toBeVisible({ timeout: 20_000 })

    const homeQ = await readHomeFermiQuestion(page)
    expect(homeQ.length, 'ホームの問題文が空でない').toBeGreaterThan(0)
    await shot(page, 'ta-1-home')

    // フェルミカード本体（問題文を含むボタン）をタップして Daily Fermi へ遷移
    const cardButton = page.locator('#home-fermi-card button[aria-label]').first()
    await cardButton.click()
    await page.waitForTimeout(1500)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const dailyQ = await readDailyFermiQuestion(page)
    expect(dailyQ.length, 'Daily の問題文が空でない').toBeGreaterThan(0)
    await shot(page, 'ta-2-daily')

    // 一致確認（正規化後）
    expect(
      norm(dailyQ),
      `ホーム問題[${homeQ}] と Daily 問題[${dailyQ}] が一致`
    ).toBe(norm(homeQ))
  })

  test('A2. リロード後も両者が一致し続ける', async ({ page }) => {
    await bootHome(page)
    await page.goto('/?preview=home', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    // リロード（sessionStorage は維持、localStorage の done セットも維持）
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    const homeQ = await readHomeFermiQuestion(page)
    await shot(page, 'ta-3-home-after-reload')

    const cardButton = page.locator('#home-fermi-card button[aria-label]').first()
    await cardButton.click()
    await page.waitForTimeout(1500)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const dailyQ = await readDailyFermiQuestion(page)
    await shot(page, 'ta-4-daily-after-reload')

    expect(
      norm(dailyQ),
      `リロード後: ホーム[${homeQ}] と Daily[${dailyQ}] が一致`
    ).toBe(norm(homeQ))
  })

  test('A3. 戻る→再度開く でも一致が維持される', async ({ page }) => {
    await bootHome(page)
    await page.goto('/?preview=home', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    const homeQ1 = await readHomeFermiQuestion(page)

    // 1回目: Daily へ遷移して問題文確認
    await page.locator('#home-fermi-card button[aria-label]').first().click()
    await page.waitForTimeout(1500)
    const dailyQ1 = await readDailyFermiQuestion(page)
    expect(norm(dailyQ1), `1回目 ホーム[${homeQ1}] = Daily[${dailyQ1}]`).toBe(norm(homeQ1))

    // ホームへ戻る（戻るボタン / ブラウザ back を試す）
    const backBtn = page.locator('button[aria-label*="戻る"], button[aria-label*="Back"]').first()
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click()
    } else {
      await page.goBack()
    }
    await page.waitForTimeout(1500)
    await expect(page.locator('#home-fermi-card')).toBeVisible({ timeout: 20_000 })

    const homeQ2 = await readHomeFermiQuestion(page)
    // 戻ってきたホームの問題も 1 回目と同じ（reroll してないので不変のはず）
    expect(norm(homeQ2), `戻った後のホーム[${homeQ2}] が初回[${homeQ1}] と同一`).toBe(norm(homeQ1))
    await shot(page, 'ta-5-home-after-back')

    // 2回目: もう一度 Daily を開いて一致確認
    await page.locator('#home-fermi-card button[aria-label]').first().click()
    await page.waitForTimeout(1500)
    const dailyQ2 = await readDailyFermiQuestion(page)
    await shot(page, 'ta-6-daily-second-open')
    expect(norm(dailyQ2), `2回目 ホーム[${homeQ2}] = Daily[${dailyQ2}]`).toBe(norm(homeQ2))
  })
})
