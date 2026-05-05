/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * src/db/progressDb.ts
 * progressStore の Supabase 版
 * テーブル: progress (user_id, lesson_id, category, score, completed_at)
 *
 * NOTE: (db as any) は Supabase 動的スキーマ未知の typing 回避。
 */
import { getSupabaseClient } from './index'
import type { Category, CategoryProgress } from '../progressStore'

export type ProgressRow = {
  id?: string
  user_id: string
  category: string
  total_cards: number
  completed_cards: number
  updated_at?: string
}

/**
 * progress テーブルから全カテゴリの進捗を取得
 */
export async function getProgress(
  userId: string
): Promise<Record<Category, CategoryProgress> | null> {
  const db = getSupabaseClient()
  if (!db) return null

  try {
    const { data, error } = await (db as any)
      .from('progress')
      .select('category, total_cards, completed_cards')
      .eq('user_id', userId)

    if (error) {
      console.warn('[progressDb] getProgress error:', error.message)
      return null
    }

    if (!data || data.length === 0) return null

    const result: Record<Category, CategoryProgress> = {
      'ロジカルシンキング': { totalCards: 0, completedCards: 0 },
    }

    for (const row of data) {
      const cat = row.category as Category
      if (cat in result) {
        result[cat] = {
          totalCards: row.total_cards ?? 0,
          completedCards: row.completed_cards ?? 0,
        }
      }
    }

    return result
  } catch (e) {
    console.warn('[progressDb] getProgress exception:', e)
    return null
  }
}

/**
 * 特定カテゴリの進捗を upsert
 */
export async function saveProgressCategory(
  userId: string,
  category: Category,
  data: CategoryProgress
): Promise<boolean> {
  const db = getSupabaseClient()
  if (!db) return false

  try {
    const { error } = await (db as any).from('progress').upsert(
      {
        user_id: userId,
        category,
        total_cards: data.totalCards,
        completed_cards: data.completedCards,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,category' }
    )

    if (error) {
      console.warn('[progressDb] saveProgressCategory error:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[progressDb] saveProgressCategory exception:', e)
    return false
  }
}

/**
 * 全カテゴリの進捗を一括 upsert
 */
export async function saveAllProgress(
  userId: string,
  progress: Record<Category, CategoryProgress>
): Promise<boolean> {
  const db = getSupabaseClient()
  if (!db) return false

  try {
    const rows = (Object.keys(progress) as Category[]).map((category) => ({
      user_id: userId,
      category,
      total_cards: progress[category].totalCards,
      completed_cards: progress[category].completedCards,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await (db as any)
      .from('progress')
      .upsert(rows, { onConflict: 'user_id,category' })

    if (error) {
      console.warn('[progressDb] saveAllProgress error:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[progressDb] saveAllProgress exception:', e)
    return false
  }
}
