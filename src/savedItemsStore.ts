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
   * 【重要・FB-11】folderId はローカル (localStorage) 専用。Supabase の
   * user_saved_items テーブルには folder_id カラムがまだ無いため、
   * savedItemToRow() の remote payload には絶対に載せないこと。
   * cross-device folder sync は migration 035 適用後（＝Keita 承認後）の別タスク。
   */
  folderId?: string
}

/**
 * 保存アイテムを整理するためのフォルダ（ローカル専用・FB-11）。
 * Supabase 同期は未整備。端末間同期は migration 035 適用後の別タスク。
 */
export type SavedFolder = {
  id: string
  name: string
  /** 表示順（小さいほど先頭）。新規作成時は末尾に積む */
  order: number
  createdAt: string
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
// フォルダ分け (FB-11, ローカル専用)
// =============================================
// folderId / SavedFolder は localStorage 完結。Supabase には同期しない
// （user_saved_items に folder_id カラムが無い）。cross-device folder sync は
// migration 035 適用後（＝Keita 承認後）の別タスク。

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

/** フォルダを作成（末尾に追加）。空白のみの名前は作成しない（null を返す）。 */
export function createFolder(name: string): SavedFolder | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const folders = loadFolders()
  const maxOrder = folders.reduce((m, f) => Math.max(m, f.order), -1)
  const fresh: SavedFolder = {
    id: makeUid(),
    name: trimmed,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
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
      return { ...f, name: trimmed }
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
}

function rowToSavedItem(row: SavedItemRow): SavedItem | null {
  const allowed: SavedItemType[] = ['lesson', 'course', 'lesson-step', 'ai-problem', 'fermi']
  if (!allowed.includes(row.item_type as SavedItemType)) return null
  const type = row.item_type as SavedItemType
  return {
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
}

function savedItemToRow(userId: string, item: SavedItem): Record<string, unknown> {
  // 【重要・FB-11】item.folderId は remote payload に絶対に含めない。
  // 本番 user_saved_items テーブルには folder_id カラムがまだ無いため、
  // 追加すると既存の保存アイテム同期が全面的に壊れる（回帰）。
  // cross-device folder sync は migration 035 適用後（＝Keita 承認後）の別タスク。
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
    updated_at: new Date().toISOString(),
  }
}

async function fetchSavedItemsFromDB(userId: string): Promise<SavedItem[] | null> {
  const db = getSupabaseClient()
  if (!db) return null
  try {
    const { data, error } = await (db as any)
      .from('user_saved_items')
      .select('item_type, ref_id, title, subtitle, image, step_index, parent_lesson_id, saved_at')
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

/**
 * ログイン時の同期。
 * 戦略: Union (savedAt が新しい方を採用)。
 */
export async function syncSavedItems(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const remote = await fetchSavedItemsFromDB(userId)
    if (remote == null) return
    const local = loadSavedItems()

    // folderId はローカル専用 (FB-11)。remote 行には乗っていないため、
    // 同期で remote 版を採用しても既存のローカル folderId は引き継ぐ。
    const localFolderById = new Map<string, string | undefined>()
    for (const l of local) localFolderById.set(l.id, l.folderId)

    const byId = new Map<string, SavedItem>()
    for (const r of remote) {
      const localFolder = localFolderById.get(r.id)
      byId.set(r.id, localFolder ? { ...r, folderId: localFolder } : r)
    }
    const toPush: SavedItem[] = []
    for (const l of local) {
      const r = byId.get(l.id)
      if (!r) {
        byId.set(l.id, l)
        toPush.push(l)
      } else {
        if (l.savedAt > r.savedAt) {
          byId.set(l.id, l)
          toPush.push(l)
        }
      }
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
