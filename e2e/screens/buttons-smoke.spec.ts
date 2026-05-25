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

// 音声プレビュー (RoadmapScreenV3 のコースカード右上) は tts.speak() を呼ぶ。
// ボタン数が増えると buttons-smoke の lessons タブ走査が timeout する原因になるので
// label でスキップさせる。tts 機能自体は別途 vitest (ttsService.test.ts) でカバー。
const DESTRUCTIVE_LABEL_RE = /ログアウト|サインアウト|削除|退会|決済|購入|サブスク|アンサブ|Logout|Sign\s*out|Delete|Subscribe|Unsubscribe|Pay|Purchase|コース紹介を再生|読み上げを停止|Play\s*course\s*intro|Stop\s*reading/i

// Supabase 未設定 / preview ビルドが本番 URL を叩く副作用 (CERT_AUTHORITY_INVALID) など、
// テスト環境で発生する想定内の console.error は除外する。
// localStorage Access denied は history.back / about:blank 一時遷移時に出ることがあるため除外。
const IGNORED_ERROR_RE = /supabase|stripe|sentry|VITE_|magic.link|getSubscriptionState|fetchJournalByDate|notification|service.worker|abortcontroller|networkrequest|ERR_CERT|Failed to load resource|net::ERR_|404\b|font|preload|favicon|logic-u5wn|onrender|Access is denied for this document|localStorage/i

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
  page.on('pageerror', (e) => {
    if (IGNORED_ERROR_RE.test(e.message)) return
    errors.push(`pageerror: ${e.message}`)
  })
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

  // ロードマップ等で 90+ ボタンある画面でも 180s timeout に収めるため、
  // 毎回 fresh boot ではなく click 後に history.back で同じ画面に戻す軽量 reset を使う。
  // back で戻れなかったときだけ hard reset で復元する (HARD_RESET_EVERY ごとにも保険として実行)。
  const HARD_RESET_EVERY = 25
  const initialUrl = page.url()
  const initialButtonCount = buttons.length

  async function softReset() {
    const cur = page.url()
    if (cur !== initialUrl) {
      // history.back で戻れる限り戻す (タブ遷移含めて最大 5 段)
      // ただし about:blank に出てしまうと localStorage アクセスで Access denied が
      // pageerror として上がるため、必ず http(s):// で initialUrl ホストの URL に留める。
      const initialHost = new URL(initialUrl).host
      for (let i = 0; i < 5; i++) {
        await page.goBack({ timeout: 2_000 }).catch(() => {})
        const nowUrl = page.url()
        if (nowUrl === initialUrl) break
        // about:blank / data: / 別 host に出たら hard reset で復元
        if (!nowUrl.startsWith('http://') && !nowUrl.startsWith('https://')) {
          await resetFn()
          return
        }
        if (new URL(nowUrl).host !== initialHost) {
          await resetFn()
          return
        }
      }
    }
    // boot 直後の画面と一致しないなら hard reset
    if (page.url() !== initialUrl) {
      await resetFn()
      return
    }
    // ボタン数が大きく減ってる (モーダル等が居座ってる) なら hard reset
    const cnt = await page.locator('.main-inner button:visible, button.tab:visible, .app-shell button:visible').count().catch(() => 0)
    if (cnt < Math.max(1, Math.floor(initialButtonCount / 2))) {
      await resetFn()
    }
  }

  const pressed: string[] = []
  let pressedCount = 0
  for (const { idx, label } of buttons) {
    if (DESTRUCTIVE_LABEL_RE.test(label)) {
      pressed.push(`SKIP: ${label}`)
      continue
    }
    // 一定間隔で hard reset (state machine が積み上がるのを防ぐ)
    if (pressedCount > 0 && pressedCount % HARD_RESET_EVERY === 0) {
      await resetFn()
    } else {
      await softReset()
    }
    const target = page.locator('.main-inner button:visible, button.tab:visible, .app-shell button:visible').nth(idx)
    try {
      await target.click({ timeout: 3_000, trial: false })
      pressed.push(`OK: ${label}`)
    } catch {
      // クリック失敗（要素が消えた等）は skip 扱い。pageerror は別途検出済み
      pressed.push(`MISS: ${label}`)
    }
    pressedCount++
    // 反応が出るまでの猶予
    await page.waitForTimeout(120)
  }

  // 何が起きたかわかるよう、失敗時のメッセージに pressed list を含める
  expect(
    errors,
    `[${screenName}] エラー発生。クリック履歴:\n${pressed.join('\n')}\n\nエラー:\n${errors.join('\n')}`,
  ).toEqual([])
}

// 1 spec で 50-100 ボタンクリックすると 30s 以上かかるケースがあるため、generous な timeout を確保。
// lessons タブのようにコース数が増えるとボタン総数が 90+ になるため、300s まで許容する。
test.describe('全ボタンスモーク — 各タブ', () => {
  test.describe.configure({ timeout: 300_000 })

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
  test.describe.configure({ timeout: 300_000 })

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
