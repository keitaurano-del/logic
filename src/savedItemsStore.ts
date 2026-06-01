/**
 * 保存（ブックマーク）レイヤー
 *
 * レッスン・コース・レッスンステップ（画面ごと）・
 * AI 生成問題・フェルミ問題を横断して保存し、後から復習画面で
 * 一覧できるようにする。誤答ストアと同じく localStorage で完結。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseClient } from './db/index'

const STORAGE_KEY = 'logic-saved-items'
const SORT_STORAGE_KEY = 'logic-saved-sort'
const FOLDERS_STORAGE_KEY = 'logic-saved-folders'
/** FB-13: 削除フォルダの tombstone（端末間で削除を伝播するため）。 */
const DELETED_FOLDERS_STORAGE_KEY = 'logic-saved-folders-deleted'
/** tombstone の保持期間（これより古いものは load 時に prune）。 */
const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000

/** 保存一覧の並び替え順 */
export type SavedSort = 'newest' | 'oldest' | 'title'

/** localStorage から並び替え順を読み込む（不正値・未設定は 'newest'） */
export function loadSavedSort(): SavedSort {
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY)
    if (raw === 'newest' || raw === 'oldest' || raw === 'title') return raw
    return 'newest'
  } catch { return 'newest' }
}

/** localStorage に並び替え順を保存する */
export function saveSavedSort(s: SavedSort): void {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, s)
  } catch { /* no-op */ }
}

export type SavedItemType =
  | 'lesson'
  | 'course'
  | 'lesson-step'
  | 'ai-problem'
  | 'fermi'

export type SavedItem = {
  /** type-refId の複合キーをそのまま使ってもいいが、内部 ID も別途持つ */
  id: string
  type: SavedItemType
  /** lessonId は number、course は文字列 ID。lesson-step は `${lessonId}:${stepIndex}` */
  refId: string
  title: string
  subtitle?: string
  /** Hero / サムネ画像（任意）。一覧表示で使用 */
  image?: string
  savedAt: string
  /** lesson-step: 何ステップ目か（0-indexed） */
  stepIndex?: number
  /** lesson-step: 親レッスンID（一覧から開くとき必要） */
  parentLessonId?: number
  /**
   * 所属フォルダ ID（未分類は undefined）。
   * 【FB-13】migration 035 適用済。folder_id を user_saved_items に同期する。
   * savedItemToRow() の remote payload に folder_id を含め、端末間でフォルダ
   * 割り当てが同期される。存在しないフォルダ参照（ダングリング）は同期時に
   * null 化して FK 違反を防ぐ。
   */
  folderId?: string
}

/**
 * 保存アイテムを整理するためのフォルダ（FB-13: 端末間同期対応）。
 * migration 035 で saved_item_folders テーブルが追加され、ログイン時の
 * syncSavedFolders で端末間同期される。フォルダの作成/改名/削除自体は
 * localStorage 完結で、同期はログイン時にまとめて行う（item と同じ設計）。
 */
export type SavedFolder = {
  id: string
  name: string
  /** 表示順（小さいほど先頭）。新規作成時は末尾に積む */
  order: number
  createdAt: string
  /** 最終更新時刻（FB-13: LWW マージ用、後方互換のため optional） */
  updatedAt?: string
}

function makeId(type: SavedItemType, refId: string): string {
  return `${type}:${refId}`
}

/**
 * localStorage に残った旧 roleplay 項目（廃止済み機能）を読み込み時にフィルタする。
 * 2026-05-22 ロールプレイ機能廃止に伴う互換処理。
 */
function isLegacyType(type: string): boolean {
  return type === 'roleplay'
}

export function loadSavedItems(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedItem[]
    // 旧 roleplay 項目を取り除く（廃止済み）
    return parsed.filter((i) => !isLegacyType(i.type))
  } catch { return [] }
}

function persist(items: SavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function isSaved(type: SavedItemType, refId: string | number): boolean {
  const id = makeId(type, String(refId))
  return loadSavedItems().some((i) => i.id === id)
}

export type SaveItemInput = {
  type: SavedItemType
  refId: string | number
  title: string
  subtitle?: string
  image?: string
  stepIndex?: number
  parentLessonId?: number
}

/** 既に保存済みなら何もしない（idempotent）。新規ならリスト先頭に追加 */
export function saveItem(input: SaveItemInput): SavedItem {
  const id = makeId(input.type, String(input.refId))
  const items = loadSavedItems()
  const existing = items.find((i) => i.id === id)
  if (existing) return existing
  const fresh: SavedItem = {
    id,
    type: input.type,
    refId: String(input.refId),
    title: input.title,
    subtitle: input.subtitle,
    image: input.image,
    savedAt: new Date().toISOString(),
    stepIndex: input.stepIndex,
    parentLessonId: input.parentLessonId,
  }
  items.unshift(fresh)
  persist(items)
  return fresh
}

export function unsaveItem(type: SavedItemType, refId: string | number): void {
  const id = makeId(type, String(refId))
  const items = loadSavedItems().filter((i) => i.id !== id)
  persist(items)
}

/** トグル: 未保存なら保存、保存済みなら削除。新しい保存状態を返す */
export function toggleSaved(input: SaveItemInput): boolean {
  if (isSaved(input.type, input.refId)) {
    unsaveItem(input.type, input.refId)
    return false
  }
  saveItem(input)
  return true
}

export function getSavedByType(type: SavedItemType): SavedItem[] {
  return loadSavedItems().filter((i) => i.type === type)
}

export type SavedItemStats = {
  total: number
  byType: Record<SavedItemType, number>
}

export function getSavedItemStats(): SavedItemStats {
  const items = loadSavedItems()
  const byType: Record<SavedItemType, number> = {
    lesson: 0,
    course: 0,
    'lesson-step': 0,
    'ai-problem': 0,
    fermi: 0,
  }
  for (const it of items) byType[it.type] += 1
  return { total: items.length, byType }
}

// =============================================
// フォルダ分け (FB-13, 端末間同期対応)
// =============================================
// フォルダの作成/改名/削除は localStorage 完結。端末間同期は migration 035
// 適用済の saved_item_folders テーブルを使い、ログイン時に syncSavedFolders で
// まとめて行う（item と同じ設計。SavedItemsScreen は userId を持たないため）。

/** ユニークな ID を生成（crypto.randomUUID が無い環境にもフォールバック） */
function makeUid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch { /* fallthrough */ }
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** localStorage からフォルダ一覧を読み込む（order 昇順）。不正値は空配列 */
export function loadFolders(): SavedFolder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedFolder[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((f) => f && typeof f.id === 'string' && typeof f.name === 'string')
      .sort((a, b) => a.order - b.order)
  } catch { return [] }
}

function persistFolders(folders: SavedFolder[]) {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders))
  } catch { /* no-op */ }
}

/** FB-13: 削除フォルダの tombstone（端末間削除伝播用）。 */
type FolderTombstone = { id: string; deletedAt: string }

/** tombstone 一覧を読み込む（TTL より古いものは prune して返す）。 */
function loadFolderTombstones(): FolderTombstone[] {
  try {
    const raw = localStorage.getItem(DELETED_FOLDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FolderTombstone[]
    if (!Array.isArray(parsed)) return []
    const now = Date.now()
    const fresh = parsed.filter((t) => {
      if (!t || typeof t.id !== 'string' || typeof t.deletedAt !== 'string') return false
      const ts = Date.parse(t.deletedAt)
      if (Number.isNaN(ts)) return true // パース不能は保持（消し過ぎ防止）
      return now - ts <= TOMBSTONE_TTL_MS
    })
    // prune が発生したら書き戻す
    if (fresh.length !== parsed.length) persistFolderTombstones(fresh)
    return fresh
  } catch { return [] }
}

function persistFolderTombstones(tombstones: FolderTombstone[]) {
  try {
    localStorage.setItem(DELETED_FOLDERS_STORAGE_KEY, JSON.stringify(tombstones))
  } catch { /* no-op */ }
}

/** tombstone を追記（同一 id は最新の deletedAt で上書き）。 */
function addFolderTombstone(id: string) {
  const list = loadFolderTombstones().filter((t) => t.id !== id)
  list.push({ id, deletedAt: new Date().toISOString() })
  persistFolderTombstones(list)
}

/** フォルダを作成（末尾に追加）。空白のみの名前は作成しない（null を返す）。 */
export function createFolder(name: string): SavedFolder | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const folders = loadFolders()
  const maxOrder = folders.reduce((m, f) => Math.max(m, f.order), -1)
  const now = new Date().toISOString()
  const fresh: SavedFolder = {
    id: makeUid(),
    name: trimmed,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  }
  persistFolders([...folders, fresh])
  return fresh
}

/** フォルダ名を変更。空白のみの名前は無視（変更しない）。 */
export function renameFolder(id: string, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  const folders = loadFolders()
  let changed = false
  const next = folders.map((f) => {
    if (f.id === id && f.name !== trimmed) {
      changed = true
      return { ...f, name: trimmed, updatedAt: new Date().toISOString() }
    }
    return f
  })
  if (changed) persistFolders(next)
}

/**
 * フォルダを削除する。
 * 削除されたフォルダに属していた保存アイテムは未分類（folderId=undefined）に
 * 戻す。アイテム自体は消さない。
 */
export function deleteFolder(id: string): void {
  const folders = loadFolders().filter((f) => f.id !== id)
  persistFolders(folders)
  // FB-13: 端末間で削除を伝播するため tombstone を記録する。
  addFolderTombstone(id)
  // 属していたアイテムを未分類化
  const items = loadSavedItems()
  let changed = false
  const next = items.map((it) => {
    if (it.folderId === id) {
      changed = true
      const { folderId: _omit, ...rest } = it
      void _omit
      return rest as SavedItem
    }
    return it
  })
  if (changed) persist(next)
}

/**
 * 保存アイテムをフォルダへ割り当てる。folderId が null / undefined のときは
 * 未分類化する。
 */
export function assignItemToFolder(itemId: string, folderId: string | null): void {
  const items = loadSavedItems()
  let changed = false
  const next = items.map((it) => {
    if (it.id !== itemId) return it
    if (folderId) {
      if (it.folderId === folderId) return it
      changed = true
      return { ...it, folderId }
    }
    // 未分類化
    if (it.folderId === undefined) return it
    changed = true
    const { folderId: _omit, ...rest } = it
    void _omit
    return rest as SavedItem
  })
  if (changed) persist(next)
}

// =============================================
// Supabase 同期 (Phase 1: Device Sync)
// =============================================

type SavedItemRow = {
  item_type: string
  ref_id: string
  title: string
  subtitle: string | null
  image: string | null
  step_index: number | null
  parent_lesson_id: number | null
  saved_at: string
  folder_id: string | null
}

function rowToSavedItem(row: SavedItemRow): SavedItem | null {
  const allowed: SavedItemType[] = ['lesson', 'course', 'lesson-step', 'ai-problem', 'fermi']
  if (!allowed.includes(row.item_type as SavedItemType)) return null
  const type = row.item_type as SavedItemType
  const item: SavedItem = {
    id: makeId(type, row.ref_id),
    type,
    refId: row.ref_id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    image: row.image ?? undefined,
    stepIndex: row.step_index ?? undefined,
    parentLessonId: row.parent_lesson_id ?? undefined,
    savedAt: row.saved_at,
  }
  // FB-13: migration 035 適用済。非 null の folder_id を folderId にマップ。
  if (typeof row.folder_id === 'string' && row.folder_id) item.folderId = row.folder_id
  return item
}

function savedItemToRow(userId: string, item: SavedItem): Record<string, unknown> {
  // FB-13: migration 035 適用済。user_saved_items.folder_id へ同期する。
  // 存在しないフォルダ参照は同期前に null 化済み（FK 違反防止）。
  return {
    user_id: userId,
    item_type: item.type,
    ref_id: item.refId,
    title: item.title,
    subtitle: item.subtitle ?? null,
    image: item.image ?? null,
    step_index: item.stepIndex ?? null,
    parent_lesson_id: item.parentLessonId ?? null,
    saved_at: item.savedAt,
    folder_id: item.folderId ?? null,
    updated_at: new Date().toISOString(),
  }
}

async function fetchSavedItemsFromDB(userId: string): Promise<SavedItem[] | null> {
  const db = getSupabaseClient()
  if (!db) return null
  try {
    const { data, error } = await (db as any)
      .from('user_saved_items')
      .select('item_type, ref_id, title, subtitle, image, step_index, parent_lesson_id, saved_at, folder_id')
      .eq('user_id', userId)
    if (error) {
      console.warn('[savedItemsStore] fetchSavedItemsFromDB error:', error.message)
      return null
    }
    return (data || [])
      .map((r: SavedItemRow) => rowToSavedItem(r))
      .filter((i: SavedItem | null): i is SavedItem => i !== null)
  } catch (e) {
    console.warn('[savedItemsStore] fetchSavedItemsFromDB exception:', e)
    return null
  }
}

/** 1 件 push */
export async function pushSavedItemToDB(userId: string, item: SavedItem): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_saved_items')
      .upsert([savedItemToRow(userId, item)], { onConflict: 'user_id,item_type,ref_id' })
    if (error) console.warn('[savedItemsStore] pushSavedItemToDB error:', error.message)
  } catch (e) {
    console.warn('[savedItemsStore] pushSavedItemToDB exception:', e)
  }
}

async function pushSavedItemsToDB(userId: string, items: SavedItem[]): Promise<void> {
  if (items.length === 0) return
  const db = getSupabaseClient()
  if (!db) return
  try {
    const rows = items.map((it) => savedItemToRow(userId, it))
    const CHUNK = 500
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK)
      const { error } = await (db as any)
        .from('user_saved_items')
        .upsert(chunk, { onConflict: 'user_id,item_type,ref_id' })
      if (error) {
        console.warn('[savedItemsStore] pushSavedItemsToDB error:', error.message)
        return
      }
    }
  } catch (e) {
    console.warn('[savedItemsStore] pushSavedItemsToDB exception:', e)
  }
}

/** ローカル + DB から削除 */
export async function unsaveItemForUser(
  userId: string,
  type: SavedItemType,
  refId: string | number,
): Promise<void> {
  unsaveItem(type, refId)
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', type)
      .eq('ref_id', String(refId))
    if (error) console.warn('[savedItemsStore] unsaveItemForUser error:', error.message)
  } catch (e) {
    console.warn('[savedItemsStore] unsaveItemForUser exception:', e)
  }
}

// =============================================
// フォルダの Supabase 同期 (FB-13)
// =============================================

type FolderRow = {
  id: string
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

function folderToRow(userId: string, f: SavedFolder): Record<string, unknown> {
  return {
    id: f.id,
    user_id: userId,
    name: f.name,
    sort_order: f.order,
    created_at: f.createdAt,
    updated_at: f.updatedAt ?? f.createdAt,
  }
}

function rowToFolder(row: FolderRow): SavedFolder {
  return {
    id: row.id,
    name: row.name,
    order: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** LWW 比較用のタイムスタンプ（updatedAt 優先、無ければ createdAt）。 */
function folderStamp(f: SavedFolder): string {
  return f.updatedAt ?? f.createdAt ?? ''
}

async function fetchFoldersFromDB(userId: string): Promise<SavedFolder[] | null> {
  const db = getSupabaseClient()
  if (!db) return null
  try {
    const { data, error } = await (db as any)
      .from('saved_item_folders')
      .select('id, name, sort_order, created_at, updated_at')
      .eq('user_id', userId)
    if (error) {
      console.warn('[savedItemsStore] fetchFoldersFromDB error:', error.message)
      return null
    }
    return (data || []).map((r: FolderRow) => rowToFolder(r))
  } catch (e) {
    console.warn('[savedItemsStore] fetchFoldersFromDB exception:', e)
    return null
  }
}

async function pushFoldersToDB(userId: string, folders: SavedFolder[]): Promise<void> {
  if (folders.length === 0) return
  const db = getSupabaseClient()
  if (!db) return
  try {
    const rows = folders.map((f) => folderToRow(userId, f))
    const CHUNK = 500
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK)
      const { error } = await (db as any)
        .from('saved_item_folders')
        .upsert(chunk, { onConflict: 'id' })
      if (error) {
        console.warn('[savedItemsStore] pushFoldersToDB error:', error.message)
        return
      }
    }
  } catch (e) {
    console.warn('[savedItemsStore] pushFoldersToDB exception:', e)
  }
}

async function deleteFoldersFromDB(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const db = getSupabaseClient()
  if (!db) return
  // best-effort: 各 id を個別削除（エラーは warn のみ、全体は止めない）。
  for (const id of ids) {
    try {
      const { error } = await (db as any)
        .from('saved_item_folders')
        .delete()
        .eq('user_id', userId)
        .eq('id', id)
      if (error) console.warn('[savedItemsStore] deleteFoldersFromDB error:', error.message)
    } catch (e) {
      console.warn('[savedItemsStore] deleteFoldersFromDB exception:', e)
    }
  }
}

/**
 * フォルダの端末間同期（FB-13）。
 * - tombstone 済の id は remote から削除し、マージ対象から除外する。
 * - 残りを id でユニオン＋LWW マージ（updatedAt ?? createdAt が新しい方を採用）。
 * - local のみ / local が新しいものを remote に push。
 * - マージ結果を localStorage に保存。
 * 戻り値: 同期後に有効なフォルダ id の集合（item 同期の FK 安全化に使う）。
 * remote 取得に失敗した場合は null を返す（item 側は安全側で folder_id を載せない）。
 */
export async function syncSavedFolders(userId: string): Promise<Set<string> | null> {
  const db = getSupabaseClient()
  if (!db) return null
  try {
    const remote = await fetchFoldersFromDB(userId)
    if (remote == null) return null

    const local = loadFolders()
    const tombstones = loadFolderTombstones()
    const deletedIds = new Set(tombstones.map((t) => t.id))

    // tombstone 済の id を remote から削除し、マージ対象から除外する。
    if (deletedIds.size > 0) {
      await deleteFoldersFromDB(userId, [...deletedIds])
    }

    const byId = new Map<string, SavedFolder>()
    for (const r of remote) {
      if (deletedIds.has(r.id)) continue
      byId.set(r.id, r)
    }

    const toPush: SavedFolder[] = []
    for (const l of local) {
      if (deletedIds.has(l.id)) continue
      const r = byId.get(l.id)
      if (!r) {
        byId.set(l.id, l)
        toPush.push(l)
      } else if (folderStamp(l) > folderStamp(r)) {
        byId.set(l.id, l)
        toPush.push(l)
      }
    }

    const merged = [...byId.values()].sort((a, b) => a.order - b.order)
    persistFolders(merged)
    await pushFoldersToDB(userId, toPush)

    // 削除に成功した tombstone は除去する（resurrection 防止しつつ肥大化を避ける）。
    persistFolderTombstones([])

    if (import.meta.env.DEV) {
      console.log(
        '[savedItemsStore] syncSavedFolders complete:',
        `remote=${remote.length}`,
        `local=${local.length}`,
        `merged=${merged.length}`,
        `pushed=${toPush.length}`,
        `deleted=${deletedIds.size}`,
      )
    }

    return new Set(merged.map((f) => f.id))
  } catch (e) {
    console.warn('[savedItemsStore] syncSavedFolders failed:', e)
    return null
  }
}

/**
 * ログイン時の同期。
 * 戦略: Union (savedAt が新しい方を採用)。
 * FB-13: 先にフォルダを同期し、有効フォルダ id を使って item の folder_id を
 * FK 安全化する（存在しないフォルダ参照は null 化する）。
 */
export async function syncSavedItems(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    // FK: user_saved_items.folder_id は saved_item_folders を参照するので、
    // item を push する前にフォルダを remote に存在させる。
    const validFolderIds = await syncSavedFolders(userId)

    const remote = await fetchSavedItemsFromDB(userId)
    if (remote == null) return
    const local = loadSavedItems()

    // folderId は端末間同期するが、ローカルに存在しない/tombstone 済の
    // フォルダを指していたら未設定にする（ダングリング防止）。
    // validFolderIds が取れない（folder 同期スキップ）場合は安全側で folderId を外す。
    const sanitizeFolder = (it: SavedItem): SavedItem => {
      if (it.folderId == null) return it
      if (validFolderIds != null && validFolderIds.has(it.folderId)) return it
      const { folderId: _omit, ...rest } = it
      void _omit
      return rest as SavedItem
    }

    const localById = new Map<string, SavedItem>()
    for (const l of local) localById.set(l.id, l)
    const remoteById = new Map<string, SavedItem>()
    for (const r of remote) remoteById.set(r.id, r)

    const allIds = new Set<string>([...localById.keys(), ...remoteById.keys()])
    const byId = new Map<string, SavedItem>()
    const toPush: SavedItem[] = []
    for (const id of allIds) {
      const l = localById.get(id)
      const r = remoteById.get(id)

      // 本体（savedAt が新しい方）を採用。
      let resolved: SavedItem
      if (l && r) resolved = l.savedAt > r.savedAt ? l : r
      else resolved = (l ?? r)!

      // フォルダ割り当ては「この端末にローカル行があればローカル優先」。
      // 無ければ remote の folderId を引き継ぐ。最後に FK 安全化（ダングリング除去）。
      const folderSource = l ? l.folderId : r?.folderId
      resolved =
        resolved.folderId === folderSource ? resolved : { ...resolved, folderId: folderSource }
      resolved = sanitizeFolder(resolved)
      byId.set(id, resolved)

      // remote の現状（本体差 or folder_id 差）と異なるなら push して反映。
      const remoteFolder = r?.folderId
      const bodyChanged = !r || (l != null && l.savedAt > r.savedAt)
      const folderChanged = (resolved.folderId ?? null) !== (remoteFolder ?? null)
      if (bodyChanged || folderChanged) toPush.push(resolved)
    }

    const merged = [...byId.values()].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
    persist(merged)
    await pushSavedItemsToDB(userId, toPush)

    if (import.meta.env.DEV) {
      console.log(
        '[savedItemsStore] syncSavedItems complete:',
        `remote=${remote.length}`,
        `local=${local.length}`,
        `merged=${merged.length}`,
        `pushed=${toPush.length}`,
      )
    }
  } catch (e) {
    console.warn('[savedItemsStore] syncSavedItems failed:', e)
  }
}
