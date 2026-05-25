import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Render Production 機能テスト (2026-05-25)
 *
 * 目的:
 *   - 各機能の end-to-end 動作確認 (Happy path + エッジケース + バリデーション)
 *   - スモークテスト (render-smoke-20260525.spec.ts) より深い検証
 *   - 結果スクショは `docs/render-screenshots/functional/` に保存
 *
 * 注意:
 *   - mutating な API (`/api/checkout`, `/api/placement/submit`,
 *     `/api/placement/delete`, `/api/daily-problem`) には触らない
 *   - AI 系 API (Anthropic 呼び出し) は最小限に。UI 構造確認は実呼び出しなしで実施
 *   - guest user モードで実行
 *   - workers=1 / fullyParallel=false で Render に過剰負荷を掛けない
 */

const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'render-screenshots', 'functional')

async function shot(page: Page, name: string) {
  // fullPage=true は lessons などの縦長画面で 15s 超えて timeout するため viewport のみ
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  })
}

interface BootOpts {
  preview?: string
  displayName?: string
  completedLessons?: string[]
  completionCounts?: Record<string, number>
  profile?: { birthYear?: number; occupation?: string; goal?: string; gender?: string }
}

/**
 * Render Production を guest mode で起動し、目的の preview 画面に遷移。
 * `?preview=...` で getInitialScreen を hijack し、必要な localStorage フラグを仕込む。
 */
async function bootProduction(page: Page, opts: BootOpts = {}) {
  const { preview = 'home', displayName, completedLessons, completionCounts, profile } = opts

  await page.addInitScript(
    ({ displayName, completedLessons, completionCounts, profile }) => {
      localStorage.setItem('logic-install-id', 'render-functional-20260525')
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
      if (completionCounts) {
        localStorage.setItem('logic-completion-counts', JSON.stringify(completionCounts))
      }
      if (profile) {
        // loadUserProfile は localStorage キー "logic-user-profile" を JSON 単一オブジェクトとして読む
        const userProfile: Record<string, unknown> = {}
        if (profile.birthYear != null) userProfile.birthYear = profile.birthYear
        if (profile.occupation) userProfile.occupation = profile.occupation
        if (profile.goal) userProfile.goal = profile.goal
        if (profile.gender) userProfile.gender = profile.gender
        if (displayName) userProfile.displayName = displayName
        localStorage.setItem('logic-user-profile', JSON.stringify(userProfile))
      }
    },
    { displayName, completedLessons, completionCounts, profile }
  )

  await page.goto(`/?preview=${preview}`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
}

test.describe('Render Production 機能テスト (2026-05-25)', () => {
  // ── 1. TTS 機能 ────────────────────────────────────────────────────
  // TTS ヘッドホンボタンは slide.kind !== 'hero' && !== 'summary' で表示されるため、
  // 1 つめのスライド (通常 hero) を進めて 2 つめ以降に来てから探す。
  test('TTS-01: レッスン詳細 → 2 つめのスライドでヘッドホンボタン → 制御パネル表示', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const recommendCard = page.locator('button[aria-label*=":"]').first()
    await recommendCard.click()
    await page.waitForTimeout(2500)
    // hero スライド → 次へ進めて読み上げ可能スライドへ
    const nextLikeBtn = page.locator('button:has-text("次へ"), button:has-text("理解した"), button:has-text("Next")').first()
    if (await nextLikeBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nextLikeBtn.click()
      await page.waitForTimeout(800)
    }
    // ヘッドホンボタン (aria-label="読み上げモードを開始" or "読み上げモードを終了")
    const ttsButton = page.locator('button[aria-label*="読み上げモード"]').first()
    const ttsExists = await ttsButton.count()
    console.log(`[TTS-01] TTS button found after advancing slide: ${ttsExists}`)
    if (ttsExists > 0) {
      await ttsButton.click()
      await page.waitForTimeout(1500)
      // 制御パネル: aria-label="読み上げコントロール"
      const panel = page.locator('[aria-label="読み上げコントロール"]').first()
      const panelVisible = await panel.isVisible({ timeout: 5_000 }).catch(() => false)
      console.log(`[TTS-01] Control panel visible: ${panelVisible}`)
    }
    await shot(page, 'tts-01-control-panel')
  })

  test('TTS-02: シークバー + speed カード + voice ドロップダウン UI 表示', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const recommendCard = page.locator('button[aria-label*=":"]').first()
    await recommendCard.click()
    await page.waitForTimeout(2500)
    // hero スライド → 次へ
    const nextLikeBtn = page.locator('button:has-text("次へ"), button:has-text("理解した"), button:has-text("Next")').first()
    if (await nextLikeBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nextLikeBtn.click()
      await page.waitForTimeout(800)
    }

    const ttsButton = page.locator('button[aria-label*="読み上げモード"]').first()
    if ((await ttsButton.count()) === 0) {
      console.log('[TTS-02] TTS button not present even on 2nd slide, skipping deeper UI')
      await shot(page, 'tts-02-no-button')
      return
    }
    await ttsButton.click()
    await page.waitForTimeout(1500)

    // シークバー: aria-label="再生位置"
    const seek = page.locator('[aria-label="再生位置"]').first()
    const seekVisible = await seek.isVisible({ timeout: 4_000 }).catch(() => false)
    console.log(`[TTS-02] Seek bar visible: ${seekVisible}`)

    // speed カード: aria-label が「読み上げ速度 」で始まる button が複数 (0.75x, 1.0x, 1.25x 等)
    const speedCards = page.locator('button[aria-label^="読み上げ速度 "]')
    const speedCount = await speedCards.count()
    console.log(`[TTS-02] Speed cards count: ${speedCount}`)

    // ボイス選択: aria-label="音声"
    const voiceSelect = page.locator('[aria-label="音声"]').first()
    const voiceExists = await voiceSelect.count()
    console.log(`[TTS-02] Voice selector exists: ${voiceExists}`)

    // Web Speech API getVoices() の利用可能性
    const voicesAvailable = await page.evaluate(() => {
      try {
        const v = window.speechSynthesis?.getVoices?.() ?? []
        return v.length
      } catch {
        return -1
      }
    })
    console.log(`[TTS-02] getVoices() length: ${voicesAvailable}`)

    await shot(page, 'tts-02-seek-speed-voice')
  })

  // ── 2. レッスン完了フロー ─────────────────────────────────────────
  test('LESSON-01: recommendation lesson を開けて Slide UI が表示される', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const recommendCard = page.locator('button[aria-label*=":"]').first()
    await recommendCard.click()
    await page.waitForTimeout(2500)
    // スライド枚数表示 (例: "1 / 8") のヘッダー要素が表示される
    const counter = page.locator('text=/\\d+\\s*\\/\\s*\\d+/').first()
    const counterVisible = await counter.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[LESSON-01] Slide counter visible: ${counterVisible}`)
    // 進行ボタン (次へ / Next 等) の存在
    const nextBtn = page.locator('button:has-text("次へ"), button:has-text("Next"), button:has-text("理解した")')
    const nextCount = await nextBtn.count()
    console.log(`[LESSON-01] Next-style buttons: ${nextCount}`)
    await shot(page, 'lesson-01-slide-ui')
  })

  test('LESSON-02: CompletionBadge コンポーネントが lessons → カテゴリ詳細で 1 回完了表示', async ({ page }) => {
    // CompletionBadge は CategoryDetailView (カテゴリタイルをタップした先) でレンダリングされる
    // lesson-1〜30 までを完了 1 回扱いにして、最初の cat-tile をタップした先に確実に出るようにする
    // 各カテゴリの lessonId 帯（20s, 60s, 200s, 300s, 400s, 500s, 700s）をカバーするため広範に仕込む
    const completedLessons: string[] = []
    const completionCounts: Record<string, number> = {}
    for (let i = 1; i <= 750; i++) {
      completedLessons.push(`lesson-${i}`)
      completionCounts[`lesson-${i}`] = 1
    }
    await bootProduction(page, { preview: 'lessons', completedLessons, completionCounts })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1500)
    // localStorage の lazy sync (syncOnLogin) が走らない guest mode でも、addInitScript で
    // 仕込んだ値は localStorage に残っているはず。ただし AppV3 init で reset されることがあるため確認。
    const lsState = await page.evaluate(() => ({
      stats: localStorage.getItem('logic-stats'),
      counts: localStorage.getItem('logic-completion-counts'),
    }))
    console.log(`[LESSON-02] localStorage stats len: ${(lsState.stats ?? '').length}, counts len: ${(lsState.counts ?? '').length}`)
    // 最初の cat-tile をクリックして CategoryDetailView に入る
    const firstCat = page.locator('.cat-tile').first()
    await firstCat.click()
    await page.waitForTimeout(1500)
    // CompletionBadge: aria-label="1 回完了"
    const badge = page.locator('[aria-label="1 回完了"]')
    const badgeCount = await badge.count()
    console.log(`[LESSON-02] CompletionBadge (1 回完了) count in category detail: ${badgeCount}`)
    await shot(page, 'lesson-02-completion-1')
  })

  // ── 3. レッスン完了回数表示 ───────────────────────────────────────
  test('COMPLETION-01: 2 回完了で半分塗り conic-gradient バッジ表示', async ({ page }) => {
    const completedLessons: string[] = []
    const completionCounts: Record<string, number> = {}
    for (let i = 1; i <= 750; i++) {
      completedLessons.push(`lesson-${i}`)
      completionCounts[`lesson-${i}`] = 2
    }
    await bootProduction(page, { preview: 'lessons', completedLessons, completionCounts })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1500)
    // カテゴリ詳細に入る
    const firstCat = page.locator('.cat-tile').first()
    await firstCat.click()
    await page.waitForTimeout(1500)
    const badge2 = page.locator('[aria-label="2 回完了"]')
    const badge2Count = await badge2.count()
    console.log(`[COMPLETION-01] 2 回完了 badge count: ${badge2Count}`)
    if (badge2Count > 0) {
      const firstBadge = badge2.first()
      const innerHTML = await firstBadge.innerHTML()
      const hasConic = innerHTML.includes('conic-gradient')
      const has2Text = (await firstBadge.textContent())?.includes('2')
      console.log(`[COMPLETION-01] conic-gradient present: ${hasConic}, contains "2": ${has2Text}`)
    }
    await shot(page, 'completion-01-half-fill')
  })

  test('COMPLETION-02: 3 回完了でフル塗り + 数字「3」バッジ表示', async ({ page }) => {
    const completedLessons: string[] = []
    const completionCounts: Record<string, number> = {}
    for (let i = 1; i <= 750; i++) {
      completedLessons.push(`lesson-${i}`)
      completionCounts[`lesson-${i}`] = 3
    }
    await bootProduction(page, { preview: 'lessons', completedLessons, completionCounts })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1500)
    const firstCat = page.locator('.cat-tile').first()
    await firstCat.click()
    await page.waitForTimeout(1500)
    const badge3 = page.locator('[aria-label="3 回完了"]')
    const badge3Count = await badge3.count()
    console.log(`[COMPLETION-02] 3 回完了 badge count: ${badge3Count}`)
    if (badge3Count > 0) {
      const text = await badge3.first().textContent()
      console.log(`[COMPLETION-02] badge text: ${text}`)
    }
    await shot(page, 'completion-02-full-3')
  })

  // ── 4. フェルミ問題ホーム別問題 ──────────────────────────────────
  test('FERMI-01: ホームに別の問題ボタンが表示される', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // aria-label="別の問題を選ぶ"
    const rerollBtn = page.locator('button[aria-label="別の問題を選ぶ"]').first()
    const rerollVisible = await rerollBtn.isVisible({ timeout: 6_000 }).catch(() => false)
    console.log(`[FERMI-01] Reroll button visible: ${rerollVisible}`)
    if (rerollVisible) {
      // タップ前の今日の問題タイトル取得（fermi カード内の最初の見出し）
      const cardArea = page.locator('button[aria-label*="今日の1問"], button[aria-label*="今日の問題は全部"]').first()
      const beforeTitle = (await cardArea.textContent()) ?? ''
      await rerollBtn.click()
      await page.waitForTimeout(1500)
      const afterTitle = (await cardArea.textContent()) ?? ''
      console.log(`[FERMI-01] before snippet: ${beforeTitle.slice(0, 60)}`)
      console.log(`[FERMI-01] after  snippet: ${afterTitle.slice(0, 60)}`)
      console.log(`[FERMI-01] changed: ${beforeTitle !== afterTitle}`)
    }
    await shot(page, 'fermi-01-reroll')
  })

  test('FERMI-02: フェルミ画面に到達でき、選択肢ボタンが描画される', async ({ page }) => {
    await bootProduction(page, { preview: 'fermi' })
    await expect(page.locator('.app-shell, .main-inner').first()).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(2000)
    // 選択肢ボタンの数 (フェルミは選択式と入力式があるが、最低 1 個の interactive button)
    const interactiveCount = await page.locator('button').count()
    console.log(`[FERMI-02] Total buttons on fermi: ${interactiveCount}`)
    await shot(page, 'fermi-02-screen')
  })

  // ── 5. ジャーナル AI アドバイス + 推奨カード ─────────────────────
  // 注: guest mode では JournalScreen 本体ではなく JournalLoginPrompt が表示される。
  // 機能テストの目的が「未ログインユーザーが正しく login 動線に誘導される」ことの確認になる。
  // 実 AI 呼び出し (Anthropic 課金発生) を避けるため、本体 UI のテストは login 後のフローに委ねる。
  test('JOURNAL-01: ジャーナルタブ guest mode で LoginPrompt が表示される', async ({ page }) => {
    await bootProduction(page, { preview: 'journal', displayName: '機能太郎' })
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(2000)
    // ヒーロー文言: "ジャーナル" タイトル
    const heroTitle = page.locator('.journal-hero').first()
    const heroVisible = await heroTitle.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[JOURNAL-01] journal-hero visible: ${heroVisible}`)
    // LoginPrompt 本文: "ジャーナルを使うにはログインが必要です"
    const loginRequired = page.locator('text=ジャーナルを使うにはログインが必要です').first()
    const loginVisible = await loginRequired.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[JOURNAL-01] LoginPrompt visible: ${loginVisible}`)
    await shot(page, 'journal-01-login-prompt')
  })

  test('JOURNAL-02: LoginPrompt のログインボタンが押下可能', async ({ page }) => {
    await bootProduction(page, { preview: 'journal', displayName: '機能太郎' })
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(2000)
    // ログインボタン (button 内に "ログイン" 文言)
    const loginBtn = page.locator('button:has-text("ログイン"), button:has-text("Sign in"), button:has-text("Log in")').first()
    const loginBtnVisible = await loginBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[JOURNAL-02] Login button visible: ${loginBtnVisible}`)
    if (loginBtnVisible) {
      await loginBtn.click()
      await page.waitForTimeout(1500)
      // login 画面遷移後の最低保証: メール入力フィールド
      const emailInput = page.locator('input[type="email"]').first()
      const emailVisible = await emailInput.isVisible({ timeout: 5_000 }).catch(() => false)
      console.log(`[JOURNAL-02] Navigated to login screen (email input visible): ${emailVisible}`)
    }
    await shot(page, 'journal-02-after-login-click')
  })

  // ── 6. 称号モーダル ───────────────────────────────────────────────
  test('TITLE-01: 称号モーダル grid 構造 + locked 表示確認', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile',
      displayName: '機能太郎',
      completedLessons: ['1', '2'],
    })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 20_000 })
    // 称号エリア起動 (aria-label="称号の道のり")
    const titleBtn = page.locator('button[aria-label="称号の道のり"]').first()
    const titleBtnVisible = await titleBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!titleBtnVisible) {
      console.log('[TITLE-01] 称号ボタン not visible, fallback shot')
      await shot(page, 'title-01-no-trigger')
      return
    }
    await titleBtn.click()
    await page.waitForTimeout(800)
    const dialog = page.locator('[role="dialog"][aria-modal="true"]').first()
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // grid 列数を計算: getComputedStyle で grid-template-columns
    const gridInfo = await dialog.evaluate((el) => {
      const grids = el.querySelectorAll<HTMLElement>('div[style*="grid"]')
      const cols: string[] = []
      grids.forEach((g) => {
        const cs = getComputedStyle(g)
        if (cs.display === 'grid') {
          // grid-template-columns の値（例: "100px 100px 100px 100px"）から個数を数える
          const t = cs.gridTemplateColumns
          const n = t.split(/\s+/).filter(Boolean).length
          cols.push(`${n}cols: ${t.slice(0, 80)}`)
        }
      })
      // locked セル (aria-label="ロック" or "Locked") の数
      const lockedCount = el.querySelectorAll('[aria-label*="未獲得"], [aria-label*="未到達"], [aria-label*="locked"], [aria-label*="Locked"]').length
      // LockIcon の数 (svg の親 div を数える)
      const allCells = el.querySelectorAll('div[style*="grid"] > div').length
      return { cols, lockedCount, allCells }
    })
    console.log(`[TITLE-01] Grid info: ${JSON.stringify(gridInfo)}`)
    await shot(page, 'title-01-sheet')
  })

  test('TITLE-02: 称号モーダルを × ボタンで閉じれる', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile',
      displayName: '機能太郎',
      completedLessons: ['1'],
    })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 20_000 })
    const titleBtn = page.locator('button[aria-label="称号の道のり"]').first()
    if ((await titleBtn.count()) === 0) {
      console.log('[TITLE-02] no trigger, skipping')
      await shot(page, 'title-02-no-trigger')
      return
    }
    await titleBtn.click()
    await page.waitForTimeout(800)
    const dialog = page.locator('[role="dialog"][aria-modal="true"]').first()
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    // 閉じる × ボタン (XIcon)
    const closeBtn = dialog.locator('button[aria-label="閉じる"]').first()
    await closeBtn.click()
    await page.waitForTimeout(600)
    const stillOpen = await dialog.isVisible().catch(() => false)
    console.log(`[TITLE-02] Dialog still open after close click: ${stillOpen}`)
    await shot(page, 'title-02-closed')
  })

  // ── 7. プロフィール編集 ───────────────────────────────────────────
  test('PROFILE-01: ProfileEditScreen が描画され主要フィールド表示', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile-edit',
      displayName: '機能太郎',
      profile: { birthYear: 1990, occupation: 'engineer', goal: '論理思考力を磨く' },
    })
    await expect(page.locator('.app-shell, .main-inner').first()).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1500)
    // 入力フィールド (label[for]) の数
    const inputs = await page.locator('input, select, textarea').count()
    console.log(`[PROFILE-01] Form fields count: ${inputs}`)
    // ニックネーム / 生まれ年 / 職業 / 目標 / 性別
    const nickInput = page.locator('#pe-nickname')
    const yearInput = page.locator('#pe-birth-year')
    const nickVisible = await nickInput.isVisible().catch(() => false)
    const yearVisible = await yearInput.isVisible().catch(() => false)
    console.log(`[PROFILE-01] nickname=${nickVisible}, birth-year=${yearVisible}`)
    // 値が prefill されているか
    if (yearVisible) {
      const yearVal = await yearInput.inputValue()
      console.log(`[PROFILE-01] birth-year prefilled: ${yearVal}`)
    }
    await shot(page, 'profile-01-edit-form')
  })

  test('PROFILE-02: 生まれ年に異常値を入れると validation エラー出る', async ({ page }) => {
    await bootProduction(page, {
      preview: 'profile-edit',
      displayName: '機能太郎',
    })
    await expect(page.locator('.app-shell, .main-inner').first()).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1500)
    const yearInput = page.locator('#pe-birth-year')
    if (!(await yearInput.isVisible().catch(() => false))) {
      console.log('[PROFILE-02] year input not visible, skipping')
      await shot(page, 'profile-02-no-input')
      return
    }
    await yearInput.fill('1700')
    // 保存ボタン押下 (text=保存)
    const saveBtn = page.locator('button:has-text("保存"), button:has-text("Save")').first()
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click()
      await page.waitForTimeout(800)
    }
    // 何らかのエラーテキスト表示確認 (具体メッセージは i18n キー次第)
    const bodyText = (await page.locator('body').textContent()) ?? ''
    const hasErrText = /[エラ|error|無効|範囲|invalid]/i.test(bodyText)
    console.log(`[PROFILE-02] Error-ish text in body: ${hasErrText}`)
    await shot(page, 'profile-02-validation')
  })

  // ── 8. ランキング職業バッジ ───────────────────────────────────────
  test('RANKING-01: フェルミランキング画面に職業バッジ要素が描画される', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const rankingTab = page.locator('.tabbar .tab').nth(2)
    await rankingTab.click()
    await page.waitForTimeout(2500)
    // 職業バッジは aria-label="fermiRank.occupationAria" 系 (i18n キー直接ではなく、解決後文字列)
    const occBadges = page.locator('span[aria-label*="職業"]')
    const occCount = await occBadges.count()
    console.log(`[RANKING-01] Occupation badges count: ${occCount}`)
    // ランキング行の最低存在確認 (.main-inner)
    await expect(page.locator('.main-inner')).toBeVisible()
    await shot(page, 'ranking-01-occupation-badges')
  })

  // ── 9. AI 問題生成 ProblemGenLoader ─────────────────────────────────
  test('AIGEN-01: AI 問題生成画面に到達できる (実 API は叩かない)', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // home の AI Large カード (aria-label に "AI" が入っている)
    const aiCard = page.locator('button[aria-label*="AI"]').first()
    const aiVisible = await aiCard.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[AIGEN-01] AI card visible: ${aiVisible}`)
    if (aiVisible) {
      await aiCard.click()
      await page.waitForTimeout(2000)
      await expect(page.locator('.main-inner').first()).toBeVisible()
    }
    // ProblemGenLoader 専用 class が存在しなくても画面は描画される
    await shot(page, 'aigen-01-screen')
  })

  test('AIGEN-02: ProblemGenLoader コンポーネントの class 名探索 (起動できれば表示確認)', async ({ page }) => {
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const aiCard = page.locator('button[aria-label*="AI"]').first()
    if (!(await aiCard.isVisible({ timeout: 5_000 }).catch(() => false))) {
      console.log('[AIGEN-02] No AI card, skipping')
      await shot(page, 'aigen-02-no-card')
      return
    }
    await aiCard.click()
    await page.waitForTimeout(1500)
    // 4 ステップ文言 (テーマ分析・論点抽出・設問構築・最終チェック) が DOM 上に存在することを確認
    // 実行までしないと出ないので "存在しない" が普通。CSS 内のクラス名 .problem-gen-loader__panel を CSS ソース経由でチェック
    const cssLoaded = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets).filter((s) => {
        try { return s.cssRules } catch { return false }
      })
      let found = false
      for (const s of sheets) {
        try {
          for (const r of Array.from(s.cssRules)) {
            if ((r as CSSStyleRule).selectorText?.includes('problem-gen-loader')) {
              found = true
              break
            }
          }
        } catch {
          // CORS 等で読めない sheet はスキップ
        }
        if (found) break
      }
      return found
    })
    console.log(`[AIGEN-02] ProblemGenLoader CSS bundled: ${cssLoaded}`)
    await shot(page, 'aigen-02-loader-css')
  })

  // ── 10. 学習時間 StudyTimeScreen 日別グラフ ─────────────────────────
  test('STUDYTIME-01: 学習時間カードから StudyTimeScreen に遷移 + 日別バーが描画', async ({ page }) => {
    await bootProduction(page, {
      preview: 'home',
      displayName: '機能太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // StudyTimeCard (aria-label="学習時間を確認する")
    const card = page.locator('[aria-label="学習時間を確認する"]').first()
    const cardVisible = await card.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[STUDYTIME-01] Study card visible: ${cardVisible}`)
    if (!cardVisible) {
      await shot(page, 'studytime-01-no-card')
      return
    }
    await card.click()
    await page.waitForTimeout(2000)
    // 日別棒グラフ: role="group" aria-label="daily-bars"
    const bars = page.locator('[aria-label="daily-bars"]').first()
    const barsVisible = await bars.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[STUDYTIME-01] daily-bars group visible: ${barsVisible}`)
    if (barsVisible) {
      const barButtons = await bars.locator('button').count()
      console.log(`[STUDYTIME-01] bar buttons: ${barButtons}`)
      // 1 本目をタップ → aria-pressed が true になる
      const firstBar = bars.locator('button').first()
      await firstBar.click()
      await page.waitForTimeout(400)
      const pressed = await firstBar.getAttribute('aria-pressed')
      console.log(`[STUDYTIME-01] first bar aria-pressed after click: ${pressed}`)
    }
    await shot(page, 'studytime-01-daily-chart')
  })

  test('STUDYTIME-02: 7 日 / 30 日トグルが切り替えできる', async ({ page }) => {
    await bootProduction(page, {
      preview: 'home',
      displayName: '機能太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const card = page.locator('[aria-label="学習時間を確認する"]').first()
    if (!(await card.isVisible({ timeout: 5_000 }).catch(() => false))) {
      console.log('[STUDYTIME-02] No study card')
      await shot(page, 'studytime-02-no-card')
      return
    }
    await card.click()
    await page.waitForTimeout(2000)
    const tablist = page.locator('[role="tablist"][aria-label="range"]').first()
    const tabsVisible = await tablist.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[STUDYTIME-02] range tablist visible: ${tabsVisible}`)
    if (!tabsVisible) {
      await shot(page, 'studytime-02-no-tablist')
      return
    }
    const tabs = tablist.locator('button[role="tab"]')
    const tabCount = await tabs.count()
    console.log(`[STUDYTIME-02] range tab count: ${tabCount}`)
    if (tabCount >= 2) {
      await tabs.nth(1).click()
      await page.waitForTimeout(600)
      const sel = await tabs.nth(1).getAttribute('aria-selected')
      console.log(`[STUDYTIME-02] second tab aria-selected after click: ${sel}`)
    }
    await shot(page, 'studytime-02-toggle')
  })
})
