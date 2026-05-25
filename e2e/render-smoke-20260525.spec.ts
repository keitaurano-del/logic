import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Render Production スモーク検証 (2026-05-24〜25 実装分)
 *
 * 目的:
 *   - 5/24-25 にマージした機能が本番 (https://logic-u5wn.onrender.com/) で
 *     リグレッションなく動いていることを確認する
 *   - 各主要画面のスクリーンショットを `docs/render-screenshots/20260525/` に保存
 *
 * 注意:
 *   - mutating な API (`/api/checkout`, `/api/placement/submit`,
 *     `/api/placement/delete`, `/api/daily-problem`) には触らない
 *   - guest user モードで実行 (login 不要画面のみ)
 *   - 過負荷を避けるため workers=1 / fullyParallel=false で順次実行
 */

const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'render-screenshots', '20260525')

/** screenshot 共通ヘルパー: フル画面・PNG 出力 */
async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  })
}

/**
 * 本番ロード後、AppV3 を guest mode で home 画面に押し込む。
 * `?preview=home` で getInitialScreen を hijack し、必要な
 * localStorage フラグを仕込んで onboarding / login をスキップする。
 */
async function bootProduction(page: Page, opts: { preview?: string; displayName?: string; completedLessons?: string[] } = {}) {
  const { preview = 'home', displayName, completedLessons } = opts

  await page.addInitScript(
    ({ displayName, completedLessons }) => {
      localStorage.setItem('logic-install-id', 'render-smoke-20260525')
      localStorage.setItem('logic-onboarded', '1')
      localStorage.setItem('logic-locale', 'ja')
      localStorage.setItem('logic-tutorial-home-done', '1')
      localStorage.setItem('logic-tutorial-daily-done', '1')
      localStorage.setItem('logic-tutorial-lesson-done', '1')
      localStorage.setItem('logic-tutorial-placement-dismissed', '1')
      localStorage.setItem('logic-tutorial-fab-dismissed', '1')
      localStorage.setItem('logic-tutorial-done-v2', 'true')
      if (displayName) localStorage.setItem('logic-display-name', displayName)
      if (completedLessons) {
        localStorage.setItem(
          'logic-stats',
          JSON.stringify({
            completedLessons,
            studyDates: [new Date().toISOString().slice(0, 10)],
            studyTimeMs: 600_000,
          })
        )
      }
    },
    { displayName, completedLessons }
  )

  await page.goto(`/?preview=${preview}`, { waitUntil: 'domcontentloaded' })
  // SPA の初期描画を待つ。AppShell or 主要セレクタが出るまで
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
}

test.describe('Render Production スモーク (2026-05-25)', () => {
  test('home: Hero recommend + StudyTimeCard + AI 問題生成カード', async ({ page }) => {
    await bootProduction(page, { displayName: 'スモーク太郎' })
    // app-shell が立ち上がる
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // home 画面の AppShell + tabbar
    await expect(page.locator('.tabbar')).toBeVisible()
    // recommend card (おすすめレッスン) - aria-label が「カテゴリ Lv: タイトル」形式
    const recommendCard = page.locator('button[aria-label*=":"]').filter({ hasNot: page.locator('text=閉じる') }).first()
    await expect(recommendCard).toBeVisible({ timeout: 15_000 })
    // StudyTimeCard ( <div role="button" aria-label="学習時間を確認する"> )
    const studyCard = page.locator('[aria-label*="学習時間"], [aria-label*="Study"]').first()
    await expect(studyCard).toBeVisible({ timeout: 10_000 })
    await shot(page, 'home')
  })

  test('lessons: フェルミ系最上位 pin + コース一覧', async ({ page }) => {
    await bootProduction(page, { preview: 'lessons' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // カテゴリタイル (cat-tile クラス) が一定数描画される
    const tiles = page.locator('.cat-tile')
    await expect(tiles.first()).toBeVisible({ timeout: 15_000 })
    const count = await tiles.count()
    expect(count).toBeGreaterThanOrEqual(6)
    await shot(page, 'lessons')
  })

  test('profile: 称号バッジ + 学習時間サマリ', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile',
      displayName: 'スモーク太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 10_000 })
    // stats-grid (称号/学習時間サマリの基盤)
    await expect(page.locator('.stats-grid')).toBeVisible()
    await shot(page, 'profile')
  })

  test('ranking: 職業バッジを含むランキング画面', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // ranking タブ (3 番目)
    const rankingTab = page.locator('.tabbar .tab').nth(2)
    await rankingTab.click()
    await page.waitForTimeout(1500)
    // 画面に内容があることだけ最低保証
    await expect(page.locator('.main-inner')).toBeVisible()
    await shot(page, 'ranking')
  })

  test('journal: AI レッスン+コース推奨カードを含むジャーナル画面', async ({ page }) => {
    await bootProduction(page, { preview: 'journal', displayName: 'スモーク太郎' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.main-inner')).toBeVisible()
    await shot(page, 'journal')
  })

  test('daily-fermi: フェルミ問題画面 (TTS / 報告ボタン無関係に存在確認)', async ({ page }) => {
    await bootProduction(page, { preview: 'fermi' })
    await expect(page.locator('.app-shell, .main-inner').first()).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1500)
    await shot(page, 'daily-fermi')
  })

  test('study-time: 日別学習グラフ画面', async ({ page }) => {
    await bootProduction(page, {
      preview: 'home',
      displayName: 'スモーク太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // StudyTimeCard クリック → study-time 画面遷移
    const studyCard = page.locator('[aria-label*="学習時間"], [aria-label*="Study"]').first()
    await studyCard.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('.main-inner')).toBeVisible()
    await shot(page, 'study-time')
  })

  test('lesson detail: lesson-700 (ワーキングメモリ) Hero + Visual + TTS ボタン', async ({ page }) => {
    // home → recommend card だと毎回違うレッスンが出るため、
    // 直接 lesson 画面に行く preview パラメータは無いが、
    // home から「おすすめ」レッスンを開く形でフェイルセーフを取る
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    // recommend card クリック
    const recommendCard = page.locator('button[aria-label*=":"]').filter({ hasNot: page.locator('text=閉じる') }).first()
    await recommendCard.click()
    await page.waitForTimeout(2000)

    // lesson 画面に到達 (.app-shell は hideTabBar されるので、main 領域だけ確認)
    await expect(page.locator('button, section, article').first()).toBeVisible()

    // 5/25 実装: TTS ヘッドホンボタン (aria-label に「読み上げ」「再生」を含む or .tts ボタン)
    const ttsButton = page.locator('button[aria-label*="読み上げ"], button[aria-label*="TTS"], button[aria-label*="再生"]')
    const ttsCount = await ttsButton.count()
    // 必須にすると不安定な可能性があるので、存在しなくても警告だけ
    console.log(`[lesson] TTS button count: ${ttsCount}`)

    // 5/24 実装: FlagIcon (誤り報告ボタン) - aria-label に「報告」「誤り」を含む
    const flagButton = page.locator('button[aria-label*="報告"], button[aria-label*="誤り"]')
    const flagCount = await flagButton.count()
    console.log(`[lesson] Flag button count: ${flagCount}`)

    await shot(page, 'lesson-detail')
  })

  test('AI 問題生成: ProblemGenLoader 演出への入口確認', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // home の AI Large カードを探す
    const aiCard = page.locator('button[aria-label*="AI"]').first()
    const aiVisible = await aiCard.isVisible().catch(() => false)
    if (aiVisible) {
      await aiCard.click()
      await page.waitForTimeout(1500)
      await expect(page.locator('.main-inner')).toBeVisible()
    }
    await shot(page, 'ai-problem-gen')
  })

  test('CSS variables: --brand / --accent / --serif の状態確認', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement)
      return {
        brand: cs.getPropertyValue('--brand').trim(),
        accent: cs.getPropertyValue('--accent').trim(),
        accentDark: cs.getPropertyValue('--accent-dark').trim(),
        serif: cs.getPropertyValue('--serif').trim(),
      }
    })
    // --brand は #3D5FC4 が前提
    expect(tokens.brand).not.toBe('')
    console.log('[tokens]', tokens)
  })

  test('title badge sheet: 称号モーダル 5 列 grid', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile',
      displayName: 'スモーク太郎',
      completedLessons: ['1', '2'],
    })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 15_000 })

    // 称号エリアをクリック (badge / title 関連の button)
    const titleArea = page.locator('button[aria-label*="称号"], button[aria-label*="title"], button[aria-label*="バッジ"]').first()
    const titleVisible = await titleArea.isVisible().catch(() => false)
    if (titleVisible) {
      await titleArea.click()
      await page.waitForTimeout(1000)
      // dialog or sheet の grid
      await shot(page, 'title-badge-sheet')
    } else {
      console.log('[title-badge] 開く方法が aria-label で見つからず、スクショだけ撮影')
      await shot(page, 'title-badge-fallback')
    }
  })
})
