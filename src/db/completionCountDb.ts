/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * src/db/completionCountDb.ts
 * レッスン完了回数の永続化レイヤ。
 *
 * 設計:
 *  - localStorage キー: `logic-completion-counts`
 *    形式: Record<lessonKey, number>
 *      例) { "lesson-20": 3, "lesson-21": 1, "fermi": 7 }
 *  - 既存の `recordCompletion` (stats.ts) で `completedLessons` に push する
 *    ロジックは維持しつつ、こちらで「何回完了したか」を別管理する。
 *  - Supabase 同期: `user_progress.completion_counts` (jsonb) に upsert する。
 *    既存の progress 同期に乗せる (migration 031 で列追加)。
 *  - Web/未ログインでは localStorage のみで動く。
 */
import { getSupabaseClient } from './index'

const STORAGE_KEY = 'logic-completion-counts'

export type CompletionCountMap = Record<string, number>

function loadMap(): CompletionCountMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    // 数値以外を除外して防衛的にロード
    const result: CompletionCountMap = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
        result[k] = Math.floor(v)
      }
    }
    return result
  } catch {
    return {}
  }
}

function saveMap(map: CompletionCountMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* localStorage 不可 (プライベートモード等) は無視 */
  }
}

/**
 * 指定キーの完了回数を取得 (未完了は 0)。
 */
export function getCompletionCount(key: string): number {
  return loadMap()[key] ?? 0
}

/**
 * 全エントリの完了回数マップを返す (read-only コピー)。
 */
export function getAllCompletionCounts(): CompletionCountMap {
  return { ...loadMap() }
}

/**
 * 指定キーの完了回数を +1 する。新しい値を返す。
 *
 * recordCompletion から呼ばれる想定。
 * 既存の `completedLessons` 配列とは独立に保つ
 * (既存ロジックを壊さないため)。
 */
export function incrementCompletionCount(key: string): number {
  const map = loadMap()
  const next = (map[key] ?? 0) + 1
  map[key] = next
  saveMap(map)
  return next
}

/**
 * 指定キーの完了回数を任意の値にセット (主にテスト・マイグレーション用)。
 */
export function setCompletionCount(key: string, count: number): void {
  const map = loadMap()
  if (count <= 0) {
    delete map[key]
  } else {
    map[key] = Math.floor(count)
  }
  saveMap(map)
}

// =============================================
// Supabase 同期
// =============================================

/**
 * Supabase から完了回数マップを pull → ローカルとマージ → push。
 * conflict resolution は Max value (回数は単調増加なので安全)。
 *
 * 列 `completion_counts` (jsonb) は migration 031 で追加。
 * 列が無い環境では select 時に PostgrestError になるので静かに諦める。
 */
export async function syncCompletionCounts(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { data, error } = await (db as any)
      .from('user_progress')
      .select('completion_counts')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      // 列が無い等は警告のみ。リリース直後はクライアントと migration の
      // タイミングがズレうるので silent fallback で粘る。
      console.warn('[completionCountDb] sync select error:', error.message)
      return
    }

    const remoteRaw = (data?.completion_counts ?? {}) as Record<string, unknown>
    const local = loadMap()

    const merged: CompletionCountMap = { ...local }
    for (const [k, v] of Object.entries(remoteRaw)) {
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
        merged[k] = Math.max(merged[k] ?? 0, Math.floor(v))
      }
    }
    saveMap(merged)

    const { error: upErr } = await (db as any).from('user_progress').upsert(
      {
        user_id: userId,
        completion_counts: merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (upErr) {
      console.warn('[completionCountDb] sync upsert error:', upErr.message)
    }

    if (import.meta.env.DEV) {
      console.log('[completionCountDb] sync complete:', merged)
    }
  } catch (e) {
    console.warn('[completionCountDb] sync exception:', e)
  }
}

/**
 * ローカルの完了回数マップを Supabase に push (書き込みフック用)。
 */
export async function pushCompletionCountsToDB(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const current = loadMap()
    const { error } = await (db as any).from('user_progress').upsert(
      {
        user_id: userId,
        completion_counts: current,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) {
      console.warn('[completionCountDb] push error:', error.message)
    }
  } catch (e) {
    console.warn('[completionCountDb] push exception:', e)
  }
}
