/**
 * FB-13: 保存フォルダの端末間同期 (dev-logic / 蓮)
 *
 * migration 035（saved_item_folders テーブル + user_saved_items.folder_id）適用後の
 * フォルダ端末間同期を、本番 Supabase 非接触で実証する。`./db/index` の
 * getSupabaseClient を in-memory フェイククライアントに差し替える。
 *
 * af05 の「user_id 単一行」フェイクは流用せず、user_saved_items /
 * saved_item_folders が 1 ユーザ複数行であることに合わせた自前フェイクを使う:
 *   - 複数行をテーブルごとに保持
 *   - チェーン .eq() フィルタ（複数連結）
 *   - .upsert(rows, { onConflict }) で id キー upsert
 *   - .delete().eq().eq() で条件削除
 *
 * カバレッジ（6 シナリオ）:
 *  1. アイテムのフォルダ割当が同期される
 *  2. 別端末への伝播（folder + item.folderId 復元）
 *  3. フォルダ作成の双方向（remote-only pull / local-only push）
 *  4. 改名 LWW（local 新→local 勝ち / remote 新→remote 勝ち）
 *  5. 削除 tombstone（remote から消え resurrection しない / item.folderId 外れる）
 *  6. FK 安全化（存在しないフォルダ id 参照の item を null 化して同期、全体失敗しない）
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---- in-memory フェイク Supabase クライアント（複数行対応） ----
type Row = Record<string, unknown>
const tables: Record<string, Row[]> = {}
function tbl(name: string): Row[] {
  if (!tables[name]) tables[name] = []
  return tables[name]
}

interface EqFilter {
  col: string
  val: unknown
}

function makeQuery(table: string) {
  const filters: EqFilter[] = []
  let mode: 'select' | 'delete' | null = null

  const matches = (r: Row): boolean => filters.every((f) => r[f.col] === f.val)

  // チェーン可能 (select/delete/eq) かつ thenable (await で解決) な
  // 自己参照 API。型を厳密に書くより any で表現する方が読みやすい。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api: any = {
    select() {
      mode = 'select'
      // select はそのまま filter チェーン後に await される（thenable）
      return api
    },
    delete() {
      mode = 'delete'
      return api
    },
    eq(col: string, val: unknown) {
      filters.push({ col, val })
      // delete の最終 eq で実行を解決できるよう thenable を返し続ける
      return api
    },
    async upsert(payload: Row | Row[], opts?: { onConflict?: string }) {
      const rows = Array.isArray(payload) ? payload : [payload]
      const conflictCols = (opts?.onConflict ?? 'id').split(',').map((c) => c.trim())
      for (const row of rows) {
        const idx = tbl(table).findIndex((r) =>
          conflictCols.every((c) => r[c] === row[c]),
        )
        if (idx >= 0) tbl(table)[idx] = { ...tbl(table)[idx], ...row }
        else tbl(table).push({ ...row })
      }
      return { data: null, error: null }
    },
    // select / delete の解決（await api / await api.eq(...).eq(...)）
    then(resolve: (v: { data: Row[] | null; error: null }) => void) {
      if (mode === 'delete') {
        const remaining = tbl(table).filter((r) => !matches(r))
        tables[table] = remaining
        resolve({ data: null, error: null })
        return
      }
      // select
      const data = tbl(table).filter((r) => matches(r))
      resolve({ data, error: null })
    },
  }
  return api
}

const fakeClient = {
  from(table: string) {
    return makeQuery(table)
  },
}

vi.mock('../db/index', () => ({
  getSupabaseClient: () => fakeClient,
}))

const SAVED_KEY = 'logic-saved-items'
const FOLDERS_KEY = 'logic-saved-folders'
const DELETED_KEY = 'logic-saved-folders-deleted'

const USER = 'fb13-user-uuid'

// UUID 風の安定 id（crypto.randomUUID とは別に、テストで明示制御したい時に使う）
const FID_A = '11111111-1111-4111-8111-111111111111'
const FID_B = '22222222-2222-4222-8222-222222222222'

function folderRows(): Row[] {
  return tbl('saved_item_folders')
}
function itemRows(): Row[] {
  return tbl('user_saved_items')
}

beforeEach(() => {
  localStorage.clear()
  for (const k of Object.keys(tables)) delete tables[k]
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('FB-13: 保存フォルダの端末間同期', () => {
  it('シナリオ1: アイテムのフォルダ割当が remote（folder 行 + item.folder_id）に同期される', async () => {
    const store = await import('../savedItemsStore')

    // ローカルで item 保存 → createFolder → assignItemToFolder
    const item = store.saveItem({ type: 'lesson', refId: '1', title: 'Apple' })
    const folder = store.createFolder('Work')!
    expect(folder).not.toBeNull()
    store.assignItemToFolder(item.id, folder.id)

    await store.syncSavedItems(USER)

    // saved_item_folders にフォルダ行
    const fRow = folderRows().find((r) => r.id === folder.id)
    expect(fRow).toBeTruthy()
    expect(fRow?.name).toBe('Work')
    expect(fRow?.user_id).toBe(USER)
    expect(fRow?.sort_order).toBe(folder.order)

    // user_saved_items に folder_id
    const iRow = itemRows().find((r) => r.ref_id === '1' && r.item_type === 'lesson')
    expect(iRow).toBeTruthy()
    expect(iRow?.folder_id).toBe(folder.id)
  })

  it('シナリオ2: 別端末へ伝播 — localStorage を空にして再同期するとフォルダと item.folderId が復元される', async () => {
    const store = await import('../savedItemsStore')

    const item = store.saveItem({ type: 'lesson', refId: '1', title: 'Apple' })
    const folder = store.createFolder('Work')!
    store.assignItemToFolder(item.id, folder.id)
    await store.syncSavedItems(USER)

    // 別端末を模擬: localStorage を空に（remote テーブルは残す）
    localStorage.clear()
    expect(store.loadFolders()).toHaveLength(0)
    expect(store.loadSavedItems()).toHaveLength(0)

    await store.syncSavedItems(USER)

    const folders = store.loadFolders()
    expect(folders).toHaveLength(1)
    expect(folders[0].name).toBe('Work')

    const items = store.loadSavedItems()
    expect(items).toHaveLength(1)
    expect(items[0].folderId).toBe(folder.id)
  })

  it('シナリオ3: フォルダ作成の双方向 — remote-only が pull され local-only が push される', async () => {
    const store = await import('../savedItemsStore')

    // remote にのみ存在するフォルダ A を仕込む
    folderRows().push({
      id: FID_A,
      user_id: USER,
      name: 'Remote Folder',
      sort_order: 0,
      created_at: '2026-05-01T00:00:00.000Z',
      updated_at: '2026-05-01T00:00:00.000Z',
    })

    // local にのみ存在するフォルダ B を作成
    const localFolder = store.createFolder('Local Folder')!

    const validIds = await store.syncSavedFolders(USER)

    // 両方が有効 id 集合に含まれる
    expect(validIds).not.toBeNull()
    expect(validIds!.has(FID_A)).toBe(true)
    expect(validIds!.has(localFolder.id)).toBe(true)

    // local に remote-only フォルダが pull されている
    const names = store.loadFolders().map((f) => f.name)
    expect(names).toContain('Remote Folder')
    expect(names).toContain('Local Folder')

    // remote に local-only フォルダが push されている
    const remoteNames = folderRows().map((r) => r.name)
    expect(remoteNames).toContain('Local Folder')
    expect(remoteNames).toContain('Remote Folder')
  })

  it('シナリオ4a: 改名 LWW — local の updatedAt が新しいとき local 名が勝ち remote に反映される', async () => {
    const store = await import('../savedItemsStore')

    // remote: 古い名前
    folderRows().push({
      id: FID_A,
      user_id: USER,
      name: 'Old Name',
      sort_order: 0,
      created_at: '2026-05-01T00:00:00.000Z',
      updated_at: '2026-05-01T00:00:00.000Z',
    })
    // local: 同 id・新しい updatedAt で改名済み
    localStorage.setItem(
      FOLDERS_KEY,
      JSON.stringify([
        {
          id: FID_A,
          name: 'New Local Name',
          order: 0,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-20T00:00:00.000Z',
        },
      ]),
    )

    await store.syncSavedFolders(USER)

    expect(store.loadFolders()[0].name).toBe('New Local Name')
    expect(folderRows().find((r) => r.id === FID_A)?.name).toBe('New Local Name')
  })

  it('シナリオ4b: 改名 LWW — remote の updatedAt が新しいとき remote 名が local に反映される', async () => {
    const store = await import('../savedItemsStore')

    // remote: 新しい名前
    folderRows().push({
      id: FID_A,
      user_id: USER,
      name: 'Newer Remote Name',
      sort_order: 0,
      created_at: '2026-05-01T00:00:00.000Z',
      updated_at: '2026-05-25T00:00:00.000Z',
    })
    // local: 同 id・古い updatedAt
    localStorage.setItem(
      FOLDERS_KEY,
      JSON.stringify([
        {
          id: FID_A,
          name: 'Stale Local Name',
          order: 0,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-10T00:00:00.000Z',
        },
      ]),
    )

    await store.syncSavedFolders(USER)

    expect(store.loadFolders()[0].name).toBe('Newer Remote Name')
  })

  it('シナリオ5: 削除 tombstone — deleteFolder→sync で remote から消え、再同期で復活せず item.folderId が外れる', async () => {
    const store = await import('../savedItemsStore')

    // item をフォルダに割り当てて一度同期
    const item = store.saveItem({ type: 'lesson', refId: '1', title: 'Apple' })
    const folder = store.createFolder('Trash Me')!
    store.assignItemToFolder(item.id, folder.id)
    await store.syncSavedItems(USER)
    expect(folderRows().some((r) => r.id === folder.id)).toBe(true)

    // フォルダ削除（tombstone 記録 + ローカル item 未分類化）
    store.deleteFolder(folder.id)
    expect(localStorage.getItem(DELETED_KEY)).toContain(folder.id)
    // ローカル item は未分類化済み
    expect(store.loadSavedItems()[0].folderId).toBeUndefined()

    await store.syncSavedItems(USER)

    // remote からフォルダが消えている
    expect(folderRows().some((r) => r.id === folder.id)).toBe(false)
    // remote item の folder_id も外れている（null 化）
    const iRow = itemRows().find((r) => r.ref_id === '1')
    expect(iRow?.folder_id).toBeNull()

    // 再同期しても resurrection しない
    await store.syncSavedItems(USER)
    expect(folderRows().some((r) => r.id === folder.id)).toBe(false)
    expect(store.loadFolders().some((f) => f.id === folder.id)).toBe(false)
  })

  it('シナリオ6: FK 安全化 — 存在しないフォルダ id を指す item は folder_id が null 化されて同期され、全体失敗しない', async () => {
    const store = await import('../savedItemsStore')

    // item を「存在しないフォルダ id」に割り当てた状態を localStorage 直接で作る
    store.saveItem({ type: 'lesson', refId: '1', title: 'Apple' })
    const items = store.loadSavedItems()
    items[0].folderId = FID_B // saved_item_folders に存在しない id
    localStorage.setItem(SAVED_KEY, JSON.stringify(items))

    // 例外を投げずに完走すること
    await expect(store.syncSavedItems(USER)).resolves.toBeUndefined()

    // item 自体は同期される（folder_id は null 化）
    const iRow = itemRows().find((r) => r.ref_id === '1')
    expect(iRow).toBeTruthy()
    expect(iRow?.folder_id).toBeNull()

    // ローカル item も未分類化されている（ダングリング解消）
    expect(store.loadSavedItems()[0].folderId).toBeUndefined()
  })
})
