/**
 * MB-2: 日次アクティビティ同期（daily_activity）の冪等バックフィル検証
 * (dev-logic / 蓮)
 *
 * クライアント localStorage `logic-stats.studyDates`（YYYY-MM-DD のアクティブ日配列）を
 * Supabase `daily_activity(user_id, active_date)` へ冪等 upsert する pushDailyActivity を、
 * 本番 Supabase 非接触で実証する。@supabase/supabase-js の createClient を
 * in-memory フェイク（複数行 + 複合キー onConflict + ignoreDuplicates 対応）に差し替える。
 *
 * カバレッジ:
 *  1. studyDates 全件が (user_id, active_date) 行として upsert される
 *  2. 冪等性: 同じ studyDates を 2 回 upsert しても行が重複しない（バックフィル安全）
 *  3. user_id は必ず自分の auth uid（他人の行を書かない）
 *  4. 未ログイン / 空配列 / 不正日付は no-op or スキップ
 *  5. pushProgress 経由でも daily_activity に push される（新アクティブ日の伝播）
 *  6. 増分: 新しい日付を足して再 upsert すると、その日だけ増える
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---- in-memory フェイク Supabase クライアント（daily_activity 複数行対応） ----
type Row = Record<string, unknown>
const tables: Record<string, Row[]> = {}
function tbl(name: string): Row[] {
  if (!tables[name]) tables[name] = []
  return tables[name]
}

function makeQuery(table: string) {
  const api = {
    select() {
      return api
    },
    eq() {
      return api
    },
    async maybeSingle() {
      return { data: null, error: null }
    },
    async upsert(
      payload: Row | Row[],
      opts?: { onConflict?: string; ignoreDuplicates?: boolean },
    ) {
      const rows = Array.isArray(payload) ? payload : [payload]
      const conflictCols = (opts?.onConflict ?? 'id').split(',').map((c) => c.trim())
      for (const row of rows) {
        const idx = tbl(table).findIndex((r) =>
          conflictCols.every((c) => r[c] === row[c]),
        )
        if (idx >= 0) {
          // ignoreDuplicates: true のときは既存行を保持（PG の ON CONFLICT DO NOTHING 相当）
          if (!opts?.ignoreDuplicates) tbl(table)[idx] = { ...tbl(table)[idx], ...row }
        } else {
          tbl(table).push({ ...row })
        }
      }
      return { data: null, error: null }
    },
  }
  return api
}

const fakeClient = {
  from(table: string) {
    return makeQuery(table)
  },
  auth: {
    async getSession() {
      return { data: { session: { access_token: 'fake-token' } } }
    },
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => fakeClient,
}))

vi.stubEnv('VITE_SUPABASE_URL', 'https://fake.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'fake-anon-key')

const fetchMock = vi.fn(async () => ({
  ok: true,
  status: 200,
  json: async () => ({}),
}))
vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch)

const USER = 'mb02-user-uuid'
const OTHER = 'mb02-other-uuid'

function activityRows(): Row[] {
  return tbl('daily_activity')
}

beforeEach(() => {
  localStorage.clear()
  for (const k of Object.keys(tables)) delete tables[k]
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('MB-2: daily_activity 同期（冪等バックフィル）', () => {
  it('シナリオ1: studyDates 全件が (user_id, active_date) として upsert される', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(USER)

    const dates = ['2026-05-01', '2026-05-02', '2026-05-03']
    await sync.pushDailyActivity(dates)

    expect(activityRows()).toHaveLength(3)
    for (const d of dates) {
      const row = activityRows().find((r) => r.active_date === d)
      expect(row).toBeTruthy()
      expect(row?.user_id).toBe(USER)
    }
  })

  it('シナリオ2: 冪等性 — 同じ studyDates を 2 回 upsert しても行が重複しない', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(USER)

    const dates = ['2026-05-01', '2026-05-02', '2026-05-03']
    await sync.pushDailyActivity(dates)
    await sync.pushDailyActivity(dates)
    await sync.pushDailyActivity(dates)

    expect(activityRows()).toHaveLength(3)
  })

  it('シナリオ3: 他人の user_id を書かない（行の user_id は必ず自分）', async () => {
    const sync = await import('../syncService')

    // 別ユーザーで先に 1 件
    sync.setSyncUser(OTHER)
    await sync.pushDailyActivity(['2026-04-01'])

    // 自分でログインして push
    sync.setSyncUser(USER)
    await sync.pushDailyActivity(['2026-05-01', '2026-05-02'])

    // 自分が書いた行はすべて自分の user_id
    const mine = activityRows().filter((r) => r.active_date !== '2026-04-01')
    expect(mine.every((r) => r.user_id === USER)).toBe(true)
    // 他人の行を勝手に書き換えていない
    const others = activityRows().filter((r) => r.user_id === OTHER)
    expect(others).toHaveLength(1)
    expect(others[0].active_date).toBe('2026-04-01')
  })

  it('シナリオ4: 未ログイン / 空配列 / 不正日付は no-op or スキップ', async () => {
    const sync = await import('../syncService')

    // 未ログイン
    sync.setSyncUser(null)
    await sync.pushDailyActivity(['2026-05-01'])
    expect(activityRows()).toHaveLength(0)

    // ログイン後: 空配列
    sync.setSyncUser(USER)
    await sync.pushDailyActivity([])
    expect(activityRows()).toHaveLength(0)

    // 不正フォーマット混在は弾く（正しい 1 件だけ通る）
    await sync.pushDailyActivity(['bad', '2026-13-99x', '2026-05-05'])
    expect(activityRows()).toHaveLength(1)
    expect(activityRows()[0].active_date).toBe('2026-05-05')
  })

  it('シナリオ5: pushProgress 経由でも studyDates が daily_activity に push される', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(USER)

    await sync.pushProgress({
      completedLessons: ['lesson-1'],
      studyDates: ['2026-05-10', '2026-05-11'],
      studyTimeMs: 1000,
    })

    expect(activityRows()).toHaveLength(2)
    expect(activityRows().map((r) => r.active_date).sort()).toEqual([
      '2026-05-10',
      '2026-05-11',
    ])
  })

  it('シナリオ6: 増分 — 新しい日付を足すとその日だけ増える（既存は重複しない）', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(USER)

    await sync.pushDailyActivity(['2026-05-01', '2026-05-02'])
    expect(activityRows()).toHaveLength(2)

    // 翌日アクティブになり studyDates が 1 件増えた状態を再同期
    await sync.pushDailyActivity(['2026-05-01', '2026-05-02', '2026-05-03'])
    expect(activityRows()).toHaveLength(3)
    expect(activityRows().some((r) => r.active_date === '2026-05-03')).toBe(true)
  })
})
