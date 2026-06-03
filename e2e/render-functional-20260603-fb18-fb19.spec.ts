/**
 * FB-18 / FB-19 実機検証 (2026-06-03)
 *
 * 対象: https://logic-u5wn.onrender.com (または PW_BASE_URL で上書き)
 * FB-18: フラッシュカード裏面テキストのフォントサイズが読みやすいサイズか
 * FB-19: 「わかった」「簡単」ボタンに次回間隔ラベルが表示されているか
 *
 * 実行:
 *   # ローカルビルド（デフォルト）:
 *   node node_modules/.bin/playwright test -c playwright.functional-fb1819.config.ts
 */

import { test, expect, type Page } from '@playwright/test'

/** テスト用ダミーフラッシュカード */
const DUMMY_CARDS = [
  {
    id: 'test-card-001',
    front: '仮説思考とは何か？',
    back: '答えを出す前に「おそらくこうだ」という仮説を立て、\nその仮説を検証しながら思考を進める手法。',
    category: 'logic',
    source: 'lesson-1',
    createdAt: new Date().toISOString(),
    interval: 0,
    ease: 2.5,
    nextReview: '2026-06-03',
    correctCount: 0,
    wrongCount: 0,
  },
  {
    id: 'test-card-002',
    front: 'MECE とはどういう意味か？',
    back: '「モレなくダブりなく」という意味で、問題を漏れなく、重複なく分解・整理するための概念。',
    category: 'logic',
    source: 'lesson-2',
    createdAt: new Date().toISOString(),
    interval: 0,
    ease: 2.5,
    nextReview: '2026-06-03',
    correctCount: 0,
    wrongCount: 0,
  },
]

/**
 * React の仮想 DOM を介するクリックが Playwright の通常 click() では効かないケースで
 * dispatchEvent を使って確実にクリックイベントを発火させるヘルパー。
 */
async function jsClick(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    else throw new Error(`jsClick: element not found for "${sel}"`)
  }, selector)
}

/**
 * テキストでボタンを探して JS イベントを発火させる。
 */
async function jsClickByText(page: Page, text: string) {
  await page.evaluate((t) => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"]'))
    const target = btns.find(b => (b as HTMLElement).textContent?.includes(t))
    if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    else throw new Error(`jsClickByText: "${t}" not found`)
  }, text)
}

/**
 * guest mode（有料プラン付き）でフラッシュカード画面を開くヘルパー。
 * home → review-hub → review-mode → flashcards の順に遷移する。
 * React の click ハンドラには Playwright の通常 click() ではなく
 * dispatchEvent の MouseEvent を使う。
 */
async function bootFlashcards(page: Page): Promise<void> {
  const cards = DUMMY_CARDS
  await page.addInitScript((dummyCards) => {
    localStorage.clear()
    localStorage.setItem('logic-install-id', `install-${Date.now()}-fb1819test`)
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-locale', 'ja')
    localStorage.setItem('logic-tutorial-home-done', '1')
    localStorage.setItem('logic-tutorial-daily-done', '1')
    localStorage.setItem('logic-tutorial-lesson-done', '1')
    localStorage.setItem('logic-tutorial-placement-dismissed', '1')
    localStorage.setItem('logic-tutorial-fab-dismissed', '1')
    localStorage.setItem('logic-tutorial-done-v2', 'true')
    // isPaid() = true
    localStorage.setItem('logic-subscription', JSON.stringify({
      plan: 'paid_monthly',
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      playStoreToken: null,
    }))
    // ダミーフラッシュカードを仕込む
    localStorage.setItem('logic-flashcards', JSON.stringify(dummyCards))
  }, cards)

  await page.goto('/?preview=home', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
  await page.waitForTimeout(1500)

  // 「有料プランへようこそ」などのトーストを閉じる
  const toast = await page.$('[role="dialog"]')
  if (toast) {
    const btn = await toast.$('button')
    if (btn) { await btn.click(); await page.waitForTimeout(500) }
  }

  // 1. ホームの ReviewCard をクリック（role=button + 復習テキスト）
  await page.evaluate(() => {
    const elems = Array.from(document.querySelectorAll('[role="button"]'))
    const target = elems.find(el => el.textContent?.includes('復習') || el.textContent?.includes('フラッシュ'))
    if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    else throw new Error('ReviewCard not found: ' + elems.map(e => e.textContent?.slice(0,30)).join(' || '))
  })
  await page.waitForTimeout(1500)

  // 2. review-hub の「フラッシュカードを開く」ボタンをクリック
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const target = btns.find(b => b.textContent?.includes('フラッシュカードを開く') || b.textContent?.includes('Open flashcards'))
    if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    else throw new Error('Open flashcards button not found')
  })
  await page.waitForTimeout(1500)

  // 3. review-mode の「全部復習する」をクリック
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const target = btns.find(b => b.textContent?.includes('全部復習') || b.textContent?.includes('Review all'))
    if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    else throw new Error('All review button not found: ' + btns.map(b => b.textContent?.slice(0,30)).join(' || '))
  })
  await page.waitForTimeout(1500)

  // FlashcardsScreen の fc3-card が表示されるのを待つ
  await expect(page.locator('.fc3-card')).toBeVisible({ timeout: 15_000 })
}

// ---------------------- FB-18 ----------------------

test.describe('FB-18: フラッシュカード裏面フォントサイズ', () => {
  test('裏面テキスト .fc3-back-text の computed font-size が 18px 以上', async ({ page }) => {
    await bootFlashcards(page)

    // カードをタップして裏面に flip (dispatchEvent)
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-face-back')).toBeVisible({ timeout: 5000 })

    // fc3-back-text の computed font-size を取得
    const fontSize = await page.locator('.fc3-back-text').evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize)
    })

    console.log(`FB-18: .fc3-back-text computed font-size = ${fontSize}px`)

    // DoD: clamp(1.3333rem, 5.2vw, 1.7333rem) — 16px ベースで最小 21.3px
    // Pixel5 (360px viewport) では 5.2vw = 18.72px < 1.3333rem = 21.3px なので clamp 最小値が適用
    // テスト環境では最低 18px を確認（16px ≒ デフォルト 1rem より大幅に大きいことを保証）
    expect(fontSize).toBeGreaterThanOrEqual(18)
  })

  test('裏面テキスト font-size が表面テキストと同等（clamp で揃えた）', async ({ page }) => {
    await bootFlashcards(page)

    // 表面のフォントサイズを取得（flip 前）
    const frontSize = await page.locator('.fc3-face-text').first().evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize)
    })

    // flip
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-face-back')).toBeVisible({ timeout: 5000 })

    const backSize = await page.locator('.fc3-back-text').evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize)
    })

    console.log(`FB-18: front=${frontSize}px / back=${backSize}px (diff=${Math.abs(frontSize - backSize).toFixed(2)}px)`)

    // FB-18 修正で表裏を同じ clamp に揃えた。差は 2px 以内のはず
    expect(Math.abs(backSize - frontSize)).toBeLessThanOrEqual(2)
  })
})

// ---------------------- FB-19 ----------------------

test.describe('FB-19: わかった/簡単ボタンの次回間隔表示', () => {
  test('カード flip 後、3ボタンに .fc3-rate-next サブラベルが存在し空でない', async ({ page }) => {
    await bootFlashcards(page)

    // flip
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-actions')).toBeVisible({ timeout: 5000 })

    const nextLabels = page.locator('.fc3-rate-next')
    await expect(nextLabels).toHaveCount(3, { timeout: 3000 })

    const texts = await nextLabels.allTextContents()
    console.log(`FB-19: rate-next labels = ${JSON.stringify(texts)}`)

    for (const text of texts) {
      expect(text.trim().length).toBeGreaterThan(0)
    }
  })

  test('「もう一度」ボタンのラベルが「すぐ」(ja) を含む', async ({ page }) => {
    await bootFlashcards(page)
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-actions')).toBeVisible({ timeout: 5000 })

    const againNext = page.locator('.fc3-actions .fc3-rate-next').first()
    const text = await againNext.textContent()
    console.log(`FB-19: again next label = "${text}"`)

    expect(text).toMatch(/すぐ|soon/i)
  })

  test('「わかった」ボタンのラベルが「3」を含む（3日後）', async ({ page }) => {
    await bootFlashcards(page)
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-actions')).toBeVisible({ timeout: 5000 })

    const goodNext = page.locator('.fc3-actions .fc3-rate-next').nth(1)
    const text = await goodNext.textContent()
    console.log(`FB-19: good next label = "${text}"`)

    // REVIEW_INTERVAL_GOOD = 3 → 「3日後」or「in 3d」
    expect(text).toMatch(/3/)
  })

  test('「簡単」ボタンのラベルが「週」または「week」を含む（1週間後）', async ({ page }) => {
    await bootFlashcards(page)
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-actions')).toBeVisible({ timeout: 5000 })

    const easyNext = page.locator('.fc3-actions .fc3-rate-next').nth(2)
    const text = await easyNext.textContent()
    console.log(`FB-19: easy next label = "${text}"`)

    // REVIEW_INTERVAL_EASY = 7 → nextWeek → 「1週間後」or「in 1 week」
    expect(text).toMatch(/週|week/i)
  })

  test('3ボタンのメインラベル（もう一度/わかった/簡単）が表示される', async ({ page }) => {
    await bootFlashcards(page)
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-actions')).toBeVisible({ timeout: 5000 })

    const rateLabels = page.locator('.fc3-rate-label')
    await expect(rateLabels).toHaveCount(3)
    const texts = await rateLabels.allTextContents()
    console.log(`FB-19: rate-label texts = ${JSON.stringify(texts)}`)

    for (const text of texts) {
      expect(text.trim().length).toBeGreaterThan(0)
    }

    // ja locale では「もう一度」「わかった」「簡単」
    expect(texts[0]).toMatch(/もう一度|again/i)
    expect(texts[1]).toMatch(/わかった|got it/i)
    expect(texts[2]).toMatch(/簡単|easy/i)
  })

  test('intervalEase 開発者向け表示（ease:）が本番に出ていないこと', async ({ page }) => {
    await bootFlashcards(page)
    await page.evaluate(() => {
      const card = document.querySelector('.fc3-card')
      if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await page.waitForTimeout(600)
    await expect(page.locator('.fc3-actions')).toBeVisible({ timeout: 5000 })

    const pageText = await page.locator('.fc3-actions').textContent()
    console.log(`FB-19: actions text = "${pageText}"`)

    // 「ease:」開発者向けテキストが出ていないこと
    expect(pageText).not.toMatch(/ease\s*:/i)
    // 「間隔:」も旧形式
    expect(pageText).not.toMatch(/間隔\s*:/i)
  })
})
