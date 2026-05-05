import {
  getNotebook,
  getNotebookByDate,
  saveNotebook,
  deleteNotebookEntry,
} from './db/notebookDb'

const STORAGE_KEY = 'logic-notebook'
import { API_BASE } from './apiBase'

export type NotebookEntry = {
  id: string
  date: string
  aiSummary: string
  userMemo: string
  createdAt: string
}

// =============================================
// localStorage ロジック（未ログイン・フォールバック用）
// =============================================

function load(): NotebookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return []
}

function save(entries: NotebookEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function loadEntries(): NotebookEntry[] {
  return load().sort((a, b) => b.date.localeCompare(a.date))
}

export function getEntryByDate(date: string): NotebookEntry | undefined {
  return load().find(e => e.date === date)
}

export function upsertEntry(entry: Partial<NotebookEntry> & { date: string }): NotebookEntry {
  const entries = load()
  const idx = entries.findIndex(e => e.date === entry.date)
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...entry }
    save(entries)
    return entries[idx]
  }
  const newEntry: NotebookEntry = {
    id: 'n_' + Date.now(),
    date: entry.date,
    aiSummary: entry.aiSummary || '',
    userMemo: entry.userMemo || '',
    createdAt: new Date().toISOString(),
  }
  entries.push(newEntry)
  save(entries)
  return newEntry
}

export function updateUserMemo(date: string, memo: string): void {
  upsertEntry({ date, userMemo: memo })
}

export function deleteEntry(id: string): void {
  save(load().filter(e => e.id !== id))
}

export async function generateAISummary(date: string, context: {
  completedLessons: string[]
  flashcardStats: { correct: number; total: number }
  studyMinutes: number
}): Promise<string> {
  const today = getEntryByDate(date)
  if (today && today.aiSummary) return today.aiSummary  // cached

  try {
    const res = await fetch(`${API_BASE}/api/journal/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, ...context }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const summary = data.summary || ''
    upsertEntry({ date, aiSummary: summary })
    return summary
  } catch {
    return ''
  }
}

// =============================================
// Supabase ハイブリッド関数
// =============================================

/**
 * 認証済みユーザーのノートブックを DB から読み込み、localStorage に同期する
 */
export async function loadEntriesFromDB(userId: string): Promise<NotebookEntry[]> {
  try {
    const dbEntries = await getNotebook(userId)
    if (dbEntries) {
      // DB データを localStorage にキャッシュ
      save(dbEntries)
      return dbEntries.sort((a, b) => b.date.localeCompare(a.date))
    }
  } catch (e) {
    console.warn('[notebookStore] loadEntriesFromDB failed, using localStorage:', e)
  }
  return loadEntries()
}

/**
 * 認証済みユーザーのエントリを DB と localStorage の両方に保存
 */
export async function upsertEntryForUser(
  userId: string,
  entry: Partial<NotebookEntry> & { date: string }
): Promise<NotebookEntry> {
  // localStorage 更新
  const result = upsertEntry(entry)

  // DB 更新（失敗しても localStorage は更新済み）
  try {
    await saveNotebook(userId, entry)
  } catch (e) {
    console.warn('[notebookStore] DB sync failed:', e)
  }

  return result
}

/**
 * 認証済みユーザーのエントリを DB と localStorage の両方から削除
 */
export async function deleteEntryForUser(
  userId: string,
  id: string,
  date: string
): Promise<void> {
  // localStorage 削除
  deleteEntry(id)

  // DB 削除
  try {
    await deleteNotebookEntry(userId, date)
  } catch (e) {
    console.warn('[notebookStore] DB delete failed:', e)
  }
}

/**
 * 特定日付のエントリを DB から取得（キャッシュあり）
 */
export async function getEntryByDateFromDB(
  userId: string,
  date: string
): Promise<NotebookEntry | null> {
  // まず localStorage を確認
  const cached = getEntryByDate(date)
  if (cached) return cached

  try {
    return await getNotebookByDate(userId, date)
  } catch (e) {
    console.warn('[notebookStore] getEntryByDateFromDB failed:', e)
    return null
  }
}

/**
 * localStorage のデータを Supabase DB に移行する
 * ログイン時に一度だけ呼び出す
 */
export async function migrateLocalStorageToSupabase(userId: string): Promise<void> {
  try {
    const local = load()
    if (local.length === 0) return

    // DB に既存データがあるか確認
    const dbEntries = await getNotebook(userId)
    const dbDates = new Set((dbEntries || []).map(e => e.date))

    // DB にないエントリだけを移行
    const toMigrate = local.filter(e => !dbDates.has(e.date))
    for (const entry of toMigrate) {
      await saveNotebook(userId, entry)
    }

    if (import.meta.env.DEV) {
      console.log(`[notebookStore] migrated ${toMigrate.length} entries to Supabase`)
    }
  } catch (e) {
    console.warn('[notebookStore] migration failed:', e)
  }
}
