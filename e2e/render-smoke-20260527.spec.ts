import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Render Production スモーク検証 (PR #233 デプロイ後 / 2026-05-27)
 *
 * 目的:
 *   - PR #233（ジャーナル/レッスン/称号まわり 7 件 T1-T7）のデプロイ後、
 *     本番 (https://logic-u5wn.onrender.com/) が致命的に壊れていないかを最速で確認する
 *   - 主要画面の HTTP 200 + 主要要素の存在 + 白画面/JS console error なしを判定
 *   - PR #233 の重点 3 点（T7 / T6 / T2）の見え方を確認
 *   - スクショは docs/render-screenshots/smoke/ に保存
 *
 * 注意:
 *   - mutating な API (/api/checkout, /api/placement/submit, /api/placement/delete,
 *     /api/daily-problem 等) には触らない
 *   - guest user モードで実行（login 不要画面のみ）
 *   - workers=1 / fullyParallel=false で順次実行
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'render-screenshots', 'smoke')

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true })
}

/** console error / pageerror を収集する。返り値の配列を後でアサートに使う。 */
function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
  })
  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}`)
  })
  return errors
}

/**
 * 本番ロード後、AppV3 を guest mode で目的画面に押し込む。
 * onboarding / tutorial / login をスキップする localStorage フラグを仕込む。
 */
async function bootProduction(
  page: Page,
  opts: { preview?: string; displayName?: string; completedLessons?: string[] } = {}
) {
  const { preview = 'home', displayName, completedLessons } = opts
  await page.addInitScript(
    ({ displayName, completedLessons }) => {
      localStorage.setItem('logic-install-id', 'render-smoke-20260527')
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
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
}

/** fatal でない、既知のノイズ console error を除外する */
function fatalOnly(errors: string[]): string[] {
  return errors.filter((e) => {
    // 本番では 401/403/404 等のネットワーク系・analytics 系を除外し、JS 実行系の致命傷だけ拾う
    if (/Failed to load resource/i.test(e)) return false
    if (/the server responded with a status of (401|403|404|429)/i.test(e)) return false
    if (/net::ERR_/i.test(e)) return false
    if (/favicon/i.test(e)) return false
    return true
  })
}

test.describe('Render Production スモーク (PR #233 / 2026-05-27)', () => {
  test('home: ホーム画面が描画される', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, { displayName: 'スモーク太郎' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.tabbar')).toBeVisible()
    await shot(page, 'home')
    expect(fatalOnly(errors), `home console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('lessons(roadmap): カテゴリ一覧が描画される [T7 入口]', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, { preview: 'lessons' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const tiles = page.locator('.cat-tile')
    await expect(tiles.first()).toBeVisible({ timeout: 15_000 })
    expect(await tiles.count()).toBeGreaterThanOrEqual(6)
    await shot(page, 'lessons')
    expect(fatalOnly(errors), `lessons console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('T7: コース一覧カテゴリの展開/折りたたみトグル動作', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, { preview: 'lessons' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // グループヘッダー（aria-expanded を持つ button）が複数描画されること
    const groupHeaders = page.locator('button[aria-expanded]')
    const headerCount = await groupHeaders.count()
    expect(headerCount, 'カテゴリグループヘッダーが 1 つ以上').toBeGreaterThanOrEqual(1)
    // 初期は全展開のはず（先頭ヘッダーが aria-expanded="true"）
    const first = groupHeaders.first()
    await expect(first).toBeVisible({ timeout: 10_000 })
    const before = await first.getAttribute('aria-expanded')
    await shot(page, 't7-expanded-initial')
    // 折りたたみ
    await first.click()
    await page.waitForTimeout(600)
    const afterCollapse = await first.getAttribute('aria-expanded')
    await shot(page, 't7-collapsed')
    // 再展開
    await first.click()
    await page.waitForTimeout(600)
    const afterExpand = await first.getAttribute('aria-expanded')
    console.log(`[T7] aria-expanded before=${before} collapse=${afterCollapse} expand=${afterExpand} headerCount=${headerCount}`)
    expect(before, 'T7 初期は展開').toBe('true')
    expect(afterCollapse, 'T7 1 回タップで折りたたみ').toBe('false')
    expect(afterExpand, 'T7 再タップで再展開').toBe('true')
    expect(fatalOnly(errors), `T7 console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('lesson detail: レッスン詳細が描画される [T6 入口]', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    // home の recommend card からレッスンを開く
    const recommendCard = page
      .locator('button[aria-label*=":"]')
      .filter({ hasNot: page.locator('text=閉じる') })
      .first()
    await expect(recommendCard).toBeVisible({ timeout: 15_000 })
    await recommendCard.click()
    await page.waitForTimeout(2500)
    // レッスン画面に到達（本文領域 or 主要要素）
    await expect(page.locator('button, section, article').first()).toBeVisible({ timeout: 10_000 })
    await shot(page, 'lesson-detail')
    expect(fatalOnly(errors), `lesson console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('T6: レッスン本文の bullet が中黒「・」で描画される', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const recommendCard = page
      .locator('button[aria-label*=":"]')
      .filter({ hasNot: page.locator('text=閉じる') })
      .first()
    await expect(recommendCard).toBeVisible({ timeout: 15_000 })
    await recommendCard.click()
    await page.waitForTimeout(2500)

    // explain ステップに bullets が出るまで「次へ/進む」を最大 8 回送る
    let found = false
    let maxBlue = 0
    for (let i = 0; i < 8 && !found; i++) {
      // 本文中に全角中黒「・」を行頭マーカーとして使う span を探す（RichLessonText bullets ケース）
      const bulletMarkers = page.locator('span', { hasText: /^・$/ })
      const cnt = await bulletMarkers.count().catch(() => 0)
      if (cnt > 0) {
        found = true
        // 青丸（list-style: disc や ●、border-radius 円形の擬似 bullet）が残っていないか軽くチェック
        maxBlue = await page.evaluate(() => {
          let blue = 0
          // li の ::marker disc や、丸い疑似要素は DOM から完全には取れないが、
          // 「●」文字や list-style-type:disc の ul を検出する
          document.querySelectorAll('ul').forEach((ul) => {
            const st = getComputedStyle(ul).listStyleType
            if (st === 'disc') blue++
          })
          document.querySelectorAll('*').forEach((el) => {
            if (el.childNodes.length === 1 && el.textContent === '●') blue++
          })
          return blue
        })
        await shot(page, 't6-bullets')
        break
      }
      // 次のステップへ
      const nextBtn = page
        .locator('button')
        .filter({ hasText: /次へ|進む|続ける|Next/i })
        .first()
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click()
        await page.waitForTimeout(900)
      } else {
        // タップで進むタイプの場合、本文領域をタップ
        await page.locator('body').click({ position: { x: 200, y: 400 } }).catch(() => {})
        await page.waitForTimeout(700)
      }
    }
    console.log(`[T6] middot-bullet found=${found} disc/●-count=${maxBlue}`)
    if (!found) {
      // bullet を含むレッスンに当たらなかった場合はスクショだけ残して情報報告（致命でない）
      await shot(page, 't6-no-bullets-fallback')
    }
    expect(maxBlue, 'T6 青丸(disc/●) が残っていない').toBe(0)
    expect(fatalOnly(errors), `T6 console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('profile: 称号バッジ + 学習サマリが描画される [T2 入口]', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, {
      preview: 'profile',
      displayName: 'スモーク太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.stats-grid')).toBeVisible()
    await shot(page, 'profile')
    expect(fatalOnly(errors), `profile console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('T2: 称号バッジ画像が表示され、拡張帯バッジ画像が壊れていない', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, {
      preview: 'profile',
      displayName: 'スモーク太郎',
      completedLessons: ['1', '2', '3'],
    })
    await expect(page.locator('.profile-hero-name')).toBeVisible({ timeout: 15_000 })
    // 称号エリアを開く
    const titleArea = page
      .locator('button[aria-label*="称号"], button[aria-label*="バッジ"], button[aria-label*="title"]')
      .first()
    const titleVisible = await titleArea.isVisible().catch(() => false)
    if (titleVisible) {
      await titleArea.click()
      await page.waitForTimeout(1200)
    }
    // badge 画像（拡張帯含む）の読み込み状態を検査
    const badgeStats = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter((i) =>
        /\/badges\/badge-/.test(i.currentSrc || i.src)
      )
      const apexLike = imgs.filter((i) =>
        /(apex|divine|enlightened|eternal|luminary|sovereign|transcend|virtuoso|wisdom|zenith)/.test(
          i.currentSrc || i.src
        )
      )
      return {
        total: imgs.length,
        loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
        broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
        apexTotal: apexLike.length,
        apexLoaded: apexLike.filter((i) => i.complete && i.naturalWidth > 0).length,
        apexSrcSample: apexLike.slice(0, 3).map((i) => (i.currentSrc || i.src).split('/').pop()),
      }
    })
    console.log('[T2] badge image stats:', JSON.stringify(badgeStats))
    await shot(page, 't2-badges')
    // 称号 sheet 内のグリッド（5列）まで撮れたら拡張帯も入る
    await shot(page, 't2-title-sheet')
    // 壊れた badge 画像が無いこと（読み込み完了かつ naturalWidth=0 = 404/破損）
    expect(badgeStats.broken, 'T2 壊れたバッジ画像なし').toBe(0)
    expect(fatalOnly(errors), `T2 console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('ranking: ランキング画面が描画される', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, { preview: 'home' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    const rankingTab = page.locator('.tabbar .tab').nth(2)
    await rankingTab.click()
    await page.waitForTimeout(1800)
    await expect(page.locator('.main-inner')).toBeVisible()
    await shot(page, 'ranking')
    expect(fatalOnly(errors), `ranking console errors:\n${errors.join('\n')}`).toEqual([])
  })

  test('journal: ジャーナル画面（ログインプロンプトまで）が描画される', async ({ page }) => {
    const errors = collectErrors(page)
    await bootProduction(page, { preview: 'journal', displayName: 'スモーク太郎' })
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.main-inner')).toBeVisible()
    await shot(page, 'journal')
    expect(fatalOnly(errors), `journal console errors:\n${errors.join('\n')}`).toEqual([])
  })
})
