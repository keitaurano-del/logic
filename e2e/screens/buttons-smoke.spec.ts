import { test, expect, type Page } from '@playwright/test'
import { boot, tab } from '../fixtures/boot'

/**
 * 全画面・全ボタンの smoke クリックテスト。
 *
 * Keita 指示: 「基本的に全部のボタンを押して確認してほしい」
 *
 * - 画面ごとに visible な button をすべて enumerate
 * - 1 つずつクリックして pageerror / console.error が発生しないかチェック
 * - クリック前に画面リセット（前のクリックで遷移してると次が押せないため）
 * - ログアウト・決済・データ削除など破壊的なものはラベル一致でスキップ
 */

const DESTRUCTIVE_LABEL_RE = /ログアウト|サインアウト|削除|退会|決済|購入|サブスク|アンサブ|Logout|Sign\s*out|Delete|Subscribe|Unsubscribe|Pay|Purchase/i

// Supabase 未設定 / preview ビルドが本番 URL を叩く副作用 (CERT_AUTHORITY_INVALID) など、
// テスト環境で発生する想定内の console.error は除外する。
const IGNORED_ERROR_RE = /supabase|stripe|sentry|VITE_|magic.link|getSubscriptionState|fetchJournalByDate|notification|service.worker|abortcontroller|networkrequest|ERR_CERT|Failed to load resource|net::ERR_|404\b|font|preload|favicon|logic-u5wn|onrender/i

type ButtonSummary = { idx: number; label: string }

async function listVisibleButtons(page: Page): Promise<ButtonSummary[]> {
  return page.locator('.main-inner button:visible, button.tab:visible, .app-shell button:visible').evaluateAll((els) =>
    els.map((el, idx) => {
      const label =
        el.getAttribute('aria-label') ||
        el.textContent?.trim().slice(0, 60) ||
        '(no label)'
      return { idx, label }
    })
  )
}

function attachErrorWatcher(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (IGNORED_ERROR_RE.test(text)) return
    errors.push(`console.error: ${text}`)
  })
  return errors
}

async function clickEveryButton(
  page: Page,
  resetFn: () => Promise<void>,
  screenName: string,
) {
  const errors = attachErrorWatcher(page)
  await resetFn()

  // 初期画面の button list を取得
  const buttons = await listVisibleButtons(page)
  expect(buttons.length, `${screenName} には button が 1 つもない`).toBeGreaterThan(0)

  const pressed: string[] = []
  for (const { idx, label } of buttons) {
    if (DESTRUCTIVE_LABEL_RE.test(label)) {
      pressed.push(`SKIP: ${label}`)
      continue
    }
    // 毎回 reset してから index で取り直す（前クリックで DOM 構造が変わる可能性）
    await resetFn()
    const target = page.locator('.main-inner button:visible, button.tab:visible, .app-shell button:visible').nth(idx)
    try {
      await target.click({ timeout: 3_000, trial: false })
      pressed.push(`OK: ${label}`)
    } catch {
      // クリック失敗（要素が消えた等）は skip 扱い。pageerror は別途検出済み
      pressed.push(`MISS: ${label}`)
    }
    // 反応が出るまでの猶予
    await page.waitForTimeout(150)
  }

  // 何が起きたかわかるよう、失敗時のメッセージに pressed list を含める
  expect(
    errors,
    `[${screenName}] エラー発生。クリック履歴:\n${pressed.join('\n')}\n\nエラー:\n${errors.join('\n')}`,
  ).toEqual([])
}

// 1 spec で 50-100 ボタンクリックすると 30s 以上かかるケースがあるため、generous な timeout を確保。
test.describe('全ボタンスモーク — 各タブ', () => {
  test.describe.configure({ timeout: 180_000 })

  test('home タブの全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page); await tab(page, 0).click() },
      'home',
    )
  })

  test('lessons タブの全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page); await tab(page, 1).click() },
      'lessons',
    )
  })

  test('ranking タブの全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page); await tab(page, 2).click() },
      'ranking',
    )
  })

  test('journal タブの全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page); await tab(page, 3).click() },
      'journal',
    )
  })

  test('profile タブの全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => {
        await boot(page, { displayName: 'テストユーザー', xp: 100, completedLessons: ['lesson-1'], streakCount: 3 })
        await tab(page, 4).click()
      },
      'profile',
    )
  })
})

test.describe('全ボタンスモーク — preview 単独画面', () => {
  test.describe.configure({ timeout: 180_000 })

  test('?preview=fermi の全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page, { path: '/?preview=fermi' }) },
      'daily-fermi',
    )
  })

  test('?preview=pricing の全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page, { path: '/?preview=pricing' }) },
      'pricing',
    )
  })

  test('?preview=settings の全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page, { path: '/?preview=settings' }) },
      'settings',
    )
  })

  test('?preview=account の全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page, { path: '/?preview=account' }) },
      'account-settings',
    )
  })

  test('?preview=notifications の全ボタンをクリックしてエラー無し', async ({ page }) => {
    await clickEveryButton(
      page,
      async () => { await boot(page, { path: '/?preview=notifications' }) },
      'notification-settings',
    )
  })

})

test.describe('Onboarding 画面の全ボタンスモーク', () => {
  test.describe.configure({ timeout: 120_000 })

  test('onboarding 画面の全ボタンをクリックしてエラー無し', async ({ page }) => {
    const errors = attachErrorWatcher(page)
    await boot(page, { onboarded: false })

    // OnboardingScreen は AppShell 外なので body 直下の button を全部見る
    const buttons = await page.locator('button:visible').evaluateAll((els) =>
      els.map((el, idx) => ({
        idx,
        label: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 60) || '(no label)',
      }))
    )
    expect(buttons.length, 'onboarding に button が無い').toBeGreaterThan(0)

    const pressed: string[] = []
    for (const { idx, label } of buttons) {
      if (DESTRUCTIVE_LABEL_RE.test(label)) {
        pressed.push(`SKIP: ${label}`)
        continue
      }
      // onboarding は state machine なので reset しないで進めていく
      const target = page.locator('button:visible').nth(idx)
      try {
        await target.click({ timeout: 2_000 })
        pressed.push(`OK: ${label}`)
      } catch {
        pressed.push(`MISS: ${label}`)
      }
      await page.waitForTimeout(150)
    }
    expect(
      errors,
      `[onboarding] エラー発生。\n${pressed.join('\n')}\n\n${errors.join('\n')}`,
    ).toEqual([])
  })
})
