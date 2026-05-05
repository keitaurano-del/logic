/**
 * src/db/notebookDb.ts
 * notebookStore の Supabase 版
 * テーブル: notebooks (user_id, date, ai_summary, user_memo, created_at)
 *
 * NOTE: (db as any) cast は Supabase の動的スキーマ未知の typing を回避するため。
 * Database 型を src/database.types.ts に生成すれば型安全化可能。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseClient } from './index'
import type { NotebookEntry } from '../notebookStore'

type NotebookRow = {
  id?: string
  user_id: string
  date: string
  ai_summary: string
  user_memo: string
  created_at?: string
  updated_at?: string
}

function rowToEntry(row: NotebookRow): NotebookEntry {
  return {
    id: row.id || 'n_' + Date.now(),
    date: row.date,
    aiSummary: row.ai_summary || '',
    userMemo: row.user_memo || '',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

/**
 * notebooks テーブルから全エントリを取得（降順）
 */
export async function getNotebook(userId: string): Promise<NotebookEntry[] | null> {
  const db = getSupabaseClient()
  if (!db) return null

  try {
    const { data, error } = await (db as any)
      .from('notebooks')
      .select('id, date, ai_summary, user_memo, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.warn('[notebookDb] getNotebook error:', error.message)
      return null
    }

    return (data || []).map(rowToEntry)
  } catch (e) {
    console.warn('[notebookDb] getNotebook exception:', e)
    return null
  }
}

/**
 * 特定日付のエントリを取得
 */
export async function getNotebookByDate(
  userId: string,
  date: string
): Promise<NotebookEntry | null> {
  const db = getSupabaseClient()
  if (!db) return null

  try {
    const { data, error } = await (db as any)
      .from('notebooks')
      .select('id, date, ai_summary, user_memo, created_at')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    if (error) {
      console.warn('[notebookDb] getNotebookByDate error:', error.message)
      return null
    }

    return data ? rowToEntry(data as NotebookRow) : null
  } catch (e) {
    console.warn('[notebookDb] getNotebookByDate exception:', e)
    return null
  }
}

/**
 * エントリを upsert (date で一意)
 */
export async function saveNotebook(
  userId: string,
  entry: Partial<NotebookEntry> & { date: string }
): Promise<boolean> {
  const db = getSupabaseClient()
  if (!db) return false

  try {
    const { error } = await (db as any).from('notebooks').upsert(
      {
        user_id: userId,
        date: entry.date,
        ai_summary: entry.aiSummary ?? '',
        user_memo: entry.userMemo ?? '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' }
    )

    if (error) {
      console.warn('[notebookDb] saveNotebook error:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[notebookDb] saveNotebook exception:', e)
    return false
  }
}

/**
 * エントリを削除
 */
export async function deleteNotebookEntry(userId: string, date: string): Promise<boolean> {
  const db = getSupabaseClient()
  if (!db) return false

  try {
    const { error } = await (db as any)
      .from('notebooks')
      .delete()
      .eq('user_id', userId)
      .eq('date', date)

    if (error) {
      console.warn('[notebookDb] deleteNotebookEntry error:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[notebookDb] deleteNotebookEntry exception:', e)
    return false
  }
}
