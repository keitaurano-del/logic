import type { Page, Route } from '@playwright/test'

/**
 * 共通 boot helpers。
 *
 * Logic アプリは新規インストール検知で localStorage を全クリアするので
 * `logic-install-id` を必ず仕込む。`logic-onboarded` を仕込まない場合は
 * onboarding 画面、仕込むと home or login 画面に着地する。
 */

export type BootOptions = {
  /** ja / en を強制セット。未指定は ja デフォルト */
  locale?: 'ja' | 'en'
  /** false にすると onboarding skip しない（未onboarded状態で起動） */
  onboarded?: boolean
  /** ?admin=1 と同じ */
  admin?: boolean
  /** profile / level / streak テスト用の値を仕込む */
  displayName?: string
  xp?: number
  completedLessons?: string[]
  streakCount?: number
  /** 起動時 path（default '/') */
  path?: string
}

/** すべての /api/** を mock 化（AI 呼び出しが本番に飛ぶのを防ぐ） */
export async function blockExternalApi(page: Page) {
  await page.route(/\/api\/.+/, async (route: Route) => {
    const url = route.request().url()
    const method = route.request().method()
    // 安全なデフォルト: 200 + 空 JSON。個別 spec で上書きする想定。
    if (url.includes('/api/fermi/daily') || url.includes('/api/fermi/next')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'stub-q', question: 'スタブ問題', accuracy: 50 }) })
    }
    if (url.includes('/api/fermi/feedback')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ feedback: 'スタブ feedback', score: 80 }) })
    }
    if (url.includes('/api/fermi/ranking')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rankings: [] }) })
    }
    if (url.includes('/api/journal/generate')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: 'スタブ summary', tags: [] }) })
    }
    if (url.includes('/api/health')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) })
    }
    if (method === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })
}

export async function boot(page: Page, opts: BootOptions = {}) {
  const {
    locale = 'ja',
    onboarded = true,
    admin = false,
    displayName,
    xp,
    completedLessons,
    streakCount,
    // 未ログイン状態だと getInitialScreen が login 画面に流すため、
    // テストでは ?preview=home を default に AppShell 起動させる。
    // onboarded:false のときは onboarding 画面に行きたいので別 default。
    path = opts.onboarded === false ? '/?preview=onboarding' : '/?preview=home',
  } = opts

  await blockExternalApi(page)

  await page.addInitScript(({ locale, onboarded, admin, displayName, xp, completedLessons, streakCount }) => {
    // 新規インストール検知の短絡
    localStorage.setItem('logic-install-id', 'e2e-fixed-id')
    if (onboarded) localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-locale', locale)
    // チュートリアル系オーバーレイを全部 dismissed 扱いにする。
    // 残しておくと HomeCoachmark の透明ボタンがタブクリックを intercept して
    // tab(page, n).click() が timeout する。
    localStorage.setItem('logic-tutorial-home-done', '1')
    localStorage.setItem('logic-tutorial-daily-done', '1')
    localStorage.setItem('logic-tutorial-lesson-done', '1')
    localStorage.setItem('logic-tutorial-placement-dismissed', '1')
    localStorage.setItem('logic-tutorial-fab-dismissed', '1')
    localStorage.setItem('logic-tutorial-done-v2', 'true')
    if (admin) localStorage.setItem('logic-admin', '1')
    if (displayName !== undefined) localStorage.setItem('logic-display-name', displayName)
    if (xp !== undefined) localStorage.setItem('logic-xp', String(xp))
    if (completedLessons !== undefined) {
      localStorage.setItem('logic-stats', JSON.stringify({
        completedLessons,
        studyDates: [new Date().toISOString().slice(0, 10)],
        studyTimeMs: 0,
      }))
    }
    if (streakCount !== undefined) {
      localStorage.setItem('logic-lesson-streak', JSON.stringify({
        count: streakCount,
        lastDate: new Date().toISOString().slice(0, 10),
      }))
    }
  }, { locale, onboarded, admin, displayName, xp, completedLessons, streakCount })

  await page.goto(path)

  // app-shell or onboarding のどちらかが出るまで待つ
  if (onboarded) {
    await page.waitForSelector('.app-shell', { timeout: 10_000 })
  } else {
    // OnboardingScreen は AppShell 外なので、最初の interactive 要素が出るまで待つ
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('button, input', { timeout: 10_000 })
  }
}

/** タブバー上のタブを取得。home=0, lessons=1, ranking=2, journal=3, profile=4 */
export function tab(page: Page, n: number) {
  return page.locator('.tabbar .tab').nth(n)
}
