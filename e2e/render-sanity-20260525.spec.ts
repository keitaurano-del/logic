import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Render Production サニティテスト (2026-05-25)
 *
 * 目的:
 *   - リリース可否判断用の軽量チェック
 *   - 主要 8 ユースケースの happy path を浅く広く確認
 *   - 1 ケース 30 秒以内、全体 5 分以内
 *
 * 注意:
 *   - mutating な API には触らない
 *   - guest user モードで実行 (login 不要画面のみ)
 *   - Render production への過剰負荷を避けるため workers=1 / 順次実行
 *   - ステータスコードと主要要素の存在のみを assertion
 *   - スクショは docs/render-screenshots/sanity/ に保存
 */

const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'render-screenshots', 'sanity')

test.use({
  viewport: { width: 360, height: 800 },
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
 * 本番ロード後、AppV3 を guest mode で指定画面に押し込む。
 * `?preview=` パラメータで getInitialScreen を hijack し、
 * localStorage で onboarding / login をスキップする。
 *
 * preview に対応していない画面 (ai-problem-gen / fermi-ranking / settings) は
 * 一度 home/profile に入ってからカード or タブで遷移する。
 */
async function bootProduction(
  page: Page,
  opts: { preview?: string; displayName?: string; completedLessons?: string[] } = {}
) {
  const { preview = 'home', displayName, completedLessons } = opts

  await page.addInitScript(
    ({ displayName, completedLessons }) => {
      localStorage.setItem('logic-install-id', 'render-sanity-20260525')
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

  const response = await page.goto(`/?preview=${preview}`, { waitUntil: 'domcontentloaded' })
  // ステータスコードチェック: 2xx 系を許容
  expect(response?.status() ?? 0, 'HTTP status').toBeGreaterThanOrEqual(200)
  expect(response?.status() ?? 999, 'HTTP status').toBeLessThan(400)
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
}

test.describe('Render Production サニティ (2026-05-25)', () => {
  // ── 1. ホーム表示 ──
  test('1. home: Hero recommend / StudyTimeCard / AI gen / Daily Fermi', async ({ page }) => {
    await bootProduction(page, { displayName: 'サニティ太郎' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.tabbar')).toBeVisible()

    // Hero recommend card (aria-label="カテゴリ レベル: タイトル")
    const recommendCard = page
      .locator('button[aria-label*=":"]')
      .filter({ hasNot: page.locator('text=閉じる') })
      .first()
    await expect(recommendCard).toBeVisible({ timeout: 15_000 })

    // StudyTimeCard
    const studyCard = page.locator('[aria-label*="学習時間"], [aria-label*="Study"]').first()
    await expect(studyCard).toBeVisible({ timeout: 10_000 })

    // AI 問題生成カード (home.aiGenLargeName = "AIで自分だけの問題を作る")
    const aiCard = page.locator('button[aria-label*="AIで自分だけの問題を作る"]').first()
    await expect(aiCard).toBeVisible({ timeout: 10_000 })

    // Daily Fermi カード
    const dailyCard = page
      .locator('[aria-label*="今日の1問"], [aria-label*="今日の問題"]')
      .first()
    await expect(dailyCard).toBeVisible({ timeout: 10_000 })

    await shot(page, '1-home')
  })

  // ── 2. レッスン詳細 ──
  test('2. lesson detail: Hero + explain + visual + 次へ/クイズボタン', async ({ page }) => {
    await bootProduction(page, { preview: 'lessons' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    // 1 レッスンをタップ (カテゴリタイルから 1 つ目)
    const tile = page.locator('.cat-tile').first()
    await expect(tile).toBeVisible({ timeout: 15_000 })
    await tile.click()
    await page.waitForTimeout(1500)

    // レッスン一覧 (roadmap) でレッスンカードをタップ
    // RoadmapScreen 内の最初のレッスン button (aria-label に Lv やステップ情報)
    const lessonButton = page
      .locator('button')
      .filter({ hasText: /レッスン|lesson|始める|スタート|読む/ })
      .first()
    const hasLessonButton = await lessonButton.isVisible().catch(() => false)
    if (hasLessonButton) {
      await lessonButton.click()
      await page.waitForTimeout(2000)
    }

    // レッスン画面 (.app-shell の tabbar は hideTabBar されるので main 領域だけ確認)
    await expect(page.locator('button, section, article').first()).toBeVisible()

    // 「次へ」「クイズを解く」「始める」「OK」系のボタンが何かしら存在
    const nextOrQuiz = page
      .locator('button')
      .filter({ hasText: /次へ|クイズ|始める|OK|わかった|理解した|スタート/ })
    const count = await nextOrQuiz.count()
    expect(count, '進行ボタンが少なくとも 1 つ存在').toBeGreaterThanOrEqual(1)

    await shot(page, '2-lesson-detail')
  })

  // ── 3. プロフィール ──
  test('3. profile: レベル / 称号バッジ / 学習サマリー / 称号モーダル入口', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile',
      displayName: 'サニティ太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    // 名前 + レベル + 称号
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=/Lv\\./').first()).toBeVisible()

    // stats-grid (3 カード: streak / completed / xp)
    await expect(page.locator('.stats-grid')).toBeVisible()

    // 学習サマリー (週カレンダー)
    await expect(page.locator('text=/月|火|水|木|金|土|日/').first()).toBeVisible()

    // 称号を見るボタン (= titleBadge を開く button, aria-label="称号の道のり")
    const titleButton = page.locator('button[aria-label*="称号"]').first()
    await expect(titleButton).toBeVisible({ timeout: 10_000 })

    await shot(page, '3-profile')
  })

  // ── 4. 称号モーダル ──
  test('4. title badge sheet: 称号モーダル開く + 50 段 grid', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile',
      displayName: 'サニティ太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 15_000 })

    // 称号ボタン (aria-label に "称号" を含む) を開く
    const titleButton = page.locator('button[aria-label*="称号"]').first()
    await titleButton.click()
    await page.waitForTimeout(1000)

    // モーダル (dialog) が開く
    const dialog = page.locator('[role="dialog"]').first()
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    await shot(page, '4-title-badge-sheet')
  })

  // ── 5. AI 問題生成 (UI のみ、実 API 叩かない) ──
  test('5. AI gen: 入口カードクリック → ProblemGenLoader UI / テーマプリセット表示', async ({
    page,
  }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    // home の AI 大カード (home.aiGenLargeName = "AIで自分だけの問題を作る")
    const aiCard = page.locator('button[aria-label*="AIで自分だけの問題を作る"]').first()
    await expect(aiCard).toBeVisible({ timeout: 10_000 })
    await aiCard.click()
    await page.waitForTimeout(1500)

    // AIProblemGenScreen に遷移済み: main-inner が見える
    await expect(page.locator('.main-inner').first()).toBeVisible({ timeout: 10_000 })

    // テーマプリセットボタンが描画される (テキストで判定)
    const themeArea = page.locator('text=/テーマ|問題を作る|練習|サンプル|お任せ/').first()
    await expect(themeArea).toBeVisible({ timeout: 5_000 })

    // 注意: ProblemGenLoader は実 API 叩いてからしか出ないので、UI 入口確認だけで停める
    await shot(page, '5-ai-problem-gen')
  })

  // ── 6. ランキング ──
  test('6. ranking: FermiRankingScreen 表示 (リスト or empty state)', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    // ranking タブ (タブバーの 3 番目)
    const rankingTab = page.locator('.tabbar .tab').nth(2)
    await rankingTab.click()
    await page.waitForTimeout(2000)

    // 画面切替後、main 領域があること
    await expect(page.locator('.main-inner').first()).toBeVisible({ timeout: 10_000 })

    // ランキング画面の本体: 「ランキング」「順位」「フェルミ」「合計」など何か表示される
    const rankingContent = page
      .locator('text=/ランキング|順位|フェルミ|合計|あなた|まだ|参加/')
      .first()
    await expect(rankingContent).toBeVisible({ timeout: 10_000 })

    await shot(page, '6-ranking')
  })

  // ── 7. ジャーナル ──
  test('7. journal: JournalScreen 表示 (login prompt or main view)', async ({ page }) => {
    await bootProduction(page, { preview: 'journal', displayName: 'サニティ太郎' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })

    // guest user の場合は JournalLoginPrompt が出る、login 済みなら JournalScreen
    // どちらにせよ main-inner は描画される
    await expect(page.locator('.main-inner').first()).toBeVisible({ timeout: 10_000 })

    // ジャーナル関連の文言 (ログイン prompt or ジャーナル本体)
    const journalText = page
      .locator('text=/ジャーナル|Journal|ログイン|今日の|気分|振り返り/')
      .first()
    await expect(journalText).toBeVisible({ timeout: 10_000 })

    await shot(page, '7-journal')
  })

  // ── 8. 設定 ──
  test('8. settings: プロフィール画面の設定セクション + プロフィール編集ボタン', async ({
    page,
  }) => {
    await bootProduction(page, {
      preview: 'profile',
      displayName: 'サニティ太郎',
    })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 15_000 })

    // プロフィール編集ボタン (i18n: profile.editProfile = "プロフィール編集")
    const editButton = page.locator('button[aria-label*="プロフィール編集"]').first()
    await expect(editButton).toBeVisible({ timeout: 10_000 })

    // 設定セクションに「通知」「言語」「テーマ」「プラン」が並んでいる
    await expect(page.locator('text=/通知/').first()).toBeVisible()
    await expect(page.locator('text=/言語/').first()).toBeVisible()

    await shot(page, '8-settings')
  })
})
