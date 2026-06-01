/**
 * AF-05 統合検証 (test-functional / 試野 緑)
 *
 * 再ログインで XP / レベル / プロフィール属性が消失するデータ消失バグの修正を、
 * 本番 Supabase 非接触で実証する。@supabase/supabase-js の createClient を
 * in-memory フェイククライアントに差し替え、localStorage を跨いだ
 * logout(syncOnLogout) → login(syncOnLogin) の永続化挙動をガードする。
 *
 * 検証シナリオ (dev-logic 提供 1-6):
 *  1. ログイン状態で XP 加算 + saveUserProfile が profiles にリモート反映される
 *  2. syncOnLogout で logic-xp / logic-user-profile が消えない (KEEP_KEYS)
 *  3. 再ログイン (syncOnLogin) で復元される
 *  4. XP=80, occupation/birthYear/goal が復元される
 *  5. オフライン加算ガード: Math.max(local, remote) で大きい方が残る
 *  6. 回帰: ゲスト系 (guestId/user_stats) と profiles.xp が独立で壊れていない
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---- in-memory フェイク Supabase クライアント ----
// profiles は id キー、その他は user_id キーで行を保持する。
type Row = Record<string, unknown>
const tables: Record<string, Map<string, Row>> = {}
function tbl(name: string): Map<string, Row> {
  if (!tables[name]) tables[name] = new Map()
  return tables[name]
}
function keyColFor(table: string): string {
  return table === 'profiles' ? 'id' : 'user_id'
}

interface SelectState {
  table: string
  eqCol?: string
  eqVal?: unknown
}

function makeQuery(table: string) {
  const state: SelectState = { table }
  const api = {
    select() {
      return api
    },
    eq(col: string, val: unknown) {
      state.eqCol = col
      state.eqVal = val
      return api
    },
    async maybeSingle() {
      const rows = [...tbl(state.table).values()]
      const found =
        state.eqCol != null
          ? rows.find((r) => r[state.eqCol!] === state.eqVal)
          : rows[0]
      return { data: found ?? null, error: null }
    },
    async upsert(payload: Row, _opts?: unknown) {
      const keyCol = keyColFor(state.table)
      const id = String(payload[keyCol])
      const existing = tbl(state.table).get(id) ?? {}
      tbl(state.table).set(id, { ...existing, ...payload })
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

// VITE_SUPABASE_URL/ANON_KEY を設定して syncService 内の supabase を非null化する
vi.stubEnv('VITE_SUPABASE_URL', 'https://fake.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'fake-anon-key')

// fetch (claimGuestFermiScores 用) は常に ok。
const fetchMock = vi.fn(async () => ({
  ok: true,
  status: 200,
  json: async () => ({ claimed: 0 }),
}))
vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch)

const TEST_USER_ID = 'test-user-uuid-af05'

beforeEach(() => {
  localStorage.clear()
  for (const k of Object.keys(tables)) delete tables[k]
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('AF-05: XP / プロフィール再ログイン永続化', () => {
  it('シナリオ1+4: ログイン中の XP 加算 + saveUserProfile が profiles に push され、再ログインで復元される', async () => {
    const stats = await import('../stats')
    const sync = await import('../syncService')
    const { saveUserProfile } = await import('../userProfile')

    // --- ログイン状態を確立 ---
    sync.setSyncUser(TEST_USER_ID)

    // --- XP 加算 80 (lesson 50 + fermi 30) ---
    stats.addXp('lesson')
    stats.addXp('fermi')
    expect(stats.getXp()).toBe(80)

    // --- プロフィール保存 ---
    saveUserProfile({ occupation: 'engineering', birthYear: 1990, goal: 'ロジカルになる' })

    // fire-and-forget の microtask を flush
    await new Promise((r) => setTimeout(r, 0))

    // --- リモート反映を確認 (シナリオ1) ---
    const remoteProfile = tbl('profiles').get(TEST_USER_ID)
    expect(remoteProfile?.xp).toBe(80)
    expect(remoteProfile?.occupation).toBe('engineering')
    expect(remoteProfile?.birth_year).toBe(1990)
    expect(remoteProfile?.goal).toBe('ロジカルになる')

    // --- ログアウト (シナリオ2) ---
    await sync.syncOnLogout()
    expect(localStorage.getItem('logic-xp')).toBe('80')
    expect(localStorage.getItem('logic-user-profile')).not.toBeNull()

    // --- ローカルを完全に消去して「別端末 / 再インストール」を模擬 ---
    localStorage.clear()
    expect(localStorage.getItem('logic-xp')).toBeNull()

    // --- 再ログイン (シナリオ3+4) ---
    await sync.syncOnLogin(TEST_USER_ID)

    expect(stats.getXp()).toBe(80)
    const restored = JSON.parse(localStorage.getItem('logic-user-profile') || '{}')
    expect(restored.occupation).toBe('engineering')
    expect(restored.birthYear).toBe(1990)
    expect(restored.goal).toBe('ロジカルになる')
  })

  it('シナリオ2: syncOnLogout で KEEP_KEYS のローカル XP / プロフィール / xp-log / journal-xp が消えない', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(TEST_USER_ID)

    localStorage.setItem('logic-xp', '120')
    localStorage.setItem('logic-xp-log', '[{"ts":1,"event":"lesson","xp":50}]')
    localStorage.setItem('logic-journal-xp', '{"2026-06-01":["morning"]}')
    localStorage.setItem('logic-user-profile', JSON.stringify({ occupation: 'sales', birthYear: 1985 }))
    // KEEP 対象外のキーは消えるはず
    localStorage.setItem('logic-notebook', '{"a":1}')

    await sync.syncOnLogout()

    expect(localStorage.getItem('logic-xp')).toBe('120')
    expect(localStorage.getItem('logic-xp-log')).not.toBeNull()
    expect(localStorage.getItem('logic-journal-xp')).not.toBeNull()
    expect(localStorage.getItem('logic-user-profile')).not.toBeNull()
    // KEEP 外は除去される (回帰: KEEP リストの肥大化で全部残ってしまっていないか)
    expect(localStorage.getItem('logic-notebook')).toBeNull()
  })

  it('AF-07: syncOnLogout でストリークフリーズ在庫 (logic-streak-freeze) が消えない', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(TEST_USER_ID)

    // フリーズ在庫 + 穴埋め日付 (consumedDates はストリーク計算に必要)
    const freeze = JSON.stringify({
      count: 2,
      consumedDates: ['2026-05-30'],
      lastGrantStreak: 7,
    })
    localStorage.setItem('logic-streak-freeze', freeze)

    await sync.syncOnLogout()

    // KEEP_KEYS に含まれるので消えない。再ログインでストリークが退行しない。
    expect(localStorage.getItem('logic-streak-freeze')).toBe(freeze)
  })

  it('シナリオ5a: オフライン加算ガード — local > remote のとき local が残り remote に反映される', async () => {
    const sync = await import('../syncService')

    // remote に XP=80 を仕込む (前回ログイン時の状態)
    tbl('profiles').set(TEST_USER_ID, { id: TEST_USER_ID, xp: 80 })

    // ログアウト中にローカルだけ XP が増えた状況 (オフライン加算 = 150)
    localStorage.setItem('logic-xp', '150')

    await sync.syncOnLogin(TEST_USER_ID)

    // Math.max(150, 80) = 150 が残る。ローカル加算が消えない。
    expect(localStorage.getItem('logic-xp')).toBe('150')
    // マージ結果がリモートにも反映される
    expect(tbl('profiles').get(TEST_USER_ID)?.xp).toBe(150)
  })

  it('シナリオ5b: remote > local のとき remote が勝ち、別端末の進捗が復元される', async () => {
    const sync = await import('../syncService')

    // remote に XP=500 (別端末で稼いだ)
    tbl('profiles').set(TEST_USER_ID, { id: TEST_USER_ID, xp: 500 })
    // この端末はローカル 0 (新規 / クリーン)
    localStorage.setItem('logic-xp', '0')

    await sync.syncOnLogin(TEST_USER_ID)

    expect(localStorage.getItem('logic-xp')).toBe('500')
  })

  it('シナリオ5c: remote が null (migration 036 未適用 / 列なし相当) のとき local を保持しクラッシュしない', async () => {
    const sync = await import('../syncService')

    // profiles 行はあるが xp 列が無い (= pullXp が null を返す状況)
    tbl('profiles').set(TEST_USER_ID, { id: TEST_USER_ID, nickname: 'tester' })
    localStorage.setItem('logic-xp', '42')

    await sync.syncOnLogin(TEST_USER_ID)

    // remote null → local をそのまま採用 (消えない)
    expect(localStorage.getItem('logic-xp')).toBe('42')
  })

  it('シナリオ6: ゲスト系 (guestId) と profiles.xp は独立 — claim 導線が壊れていない', async () => {
    const sync = await import('../syncService')

    // ゲスト時代の guestId が残った状態でログイン
    localStorage.setItem('logic-guest-id', 'g_guest12345')
    tbl('profiles').set(TEST_USER_ID, { id: TEST_USER_ID, xp: 200 })

    // setup.ts の beforeEach が毎テスト globalThis.fetch を stub し直すため、
    // module-level fetchMock ではなく現時点の fetch を spy して claim 呼び出しを捕捉する。
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await sync.syncOnLogin(TEST_USER_ID)
    // claimGuestFermiScores は syncOnLogin 内で void (fire-and-forget) なので
    // fetch 発火を待つために microtask / timer を flush する。
    await new Promise((r) => setTimeout(r, 0))

    // guestId は profiles.xp とは別軸で保持される (KEEP_KEYS に logic-guest-id あり)
    expect(localStorage.getItem('logic-guest-id')).toBe('g_guest12345')
    // profiles.xp は auth user に紐づき、guestId 由来の集計と混ざらない
    expect(localStorage.getItem('logic-xp')).toBe('200')
    // fermi claim 導線が呼ばれている (guestId != userId なので claim 対象)
    const claimCalled = fetchSpy.mock.calls.some((c) =>
      String(c[0]).includes('/api/fermi/claim-guest-scores'),
    )
    expect(claimCalled).toBe(true)
  })

  it('回帰: pushXp は負値・非有限を 0 にクランプして profiles へ送る', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(TEST_USER_ID)

    await sync.pushXp(-50)
    expect(tbl('profiles').get(TEST_USER_ID)?.xp).toBe(0)

    await sync.pushXp(NaN)
    expect(tbl('profiles').get(TEST_USER_ID)?.xp).toBe(0)

    await sync.pushXp(123.9)
    expect(tbl('profiles').get(TEST_USER_ID)?.xp).toBe(123)
  })

  it('回帰: pullXp は負値・非有限を弾き、null を返す', async () => {
    const sync = await import('../syncService')
    sync.setSyncUser(TEST_USER_ID)

    tbl('profiles').set(TEST_USER_ID, { id: TEST_USER_ID, xp: -5 })
    expect(await sync.pullXp()).toBe(0) // Math.max(0, floor(-5)) = 0

    tbl('profiles').set(TEST_USER_ID, { id: TEST_USER_ID, xp: 7777 })
    expect(await sync.pullXp()).toBe(7777)
  })
})
